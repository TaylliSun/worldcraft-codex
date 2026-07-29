const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

const { createProjectPackage } = require("../electron/project-package.cjs");
const { WorkspaceStore, WORKSPACE_COLLECTIONS } = require("../electron/workspace-store.cjs");
const {
  buildChapterContent,
  buildIndexArticle,
  buildPassageContent,
  chapterGroup,
  chapterIntroductions,
  classifyIndexKind,
  editorialTranslation,
  escapeHtml,
  naturalizeIndexTitle,
  passageDisplayTitle,
  polishTranslation,
  readerKind,
  truncate
} = require("./shanhai-reader-text.cjs");

const root = path.resolve(__dirname, "..");
const packageVersion = require("../package.json").version;
const targetWorldName = "山海经 · 原典内容全集重制版";
const sourceWorldName = "山海经 · 原典内容全集";
const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");
const assetDir = path.join(userDataDir, "assets");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "shanhai-remastered-knowledge-base-audit.json");
const screenshots = {
  home: path.join(validationDir, "shanhai-remastered-knowledge-home.png"),
  reader: path.join(validationDir, "shanhai-remastered-reader.png"),
  entry: path.join(validationDir, "shanhai-remastered-encyclopedia-entry.png")
};
const mapChildCollections = new Set(["mapLayers", "mapMarkerGroups", "mapMarkers"]);
const boilerplatePattern = /规则复核|索引说明|同名说明|项目白话释读|项目初校|Worldcraft Codex 自制规则释读|稳定段落编号|复核证据/g;
const externalPattern = /(?:https?|ftp):\/\/|(?:mailto|tel):|\bwww\.|(?:zh\.)?wikisource\.org|ctext\.org|api\.openai\.com/i;

function timestampForFile(value) {
  return value.replace(/[:.]/g, "-");
}

function hash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}

function worldSnapshot(data, worldId) {
  const mapIds = new Set(data.maps.filter((item) => item.worldId === worldId).map((item) => item.id));
  return Object.fromEntries(WORKSPACE_COLLECTIONS.map((collection) => {
    const items = Array.isArray(data[collection]) ? data[collection] : [];
    if (collection === "worlds") return [collection, items.filter((item) => item.id === worldId)];
    if (mapChildCollections.has(collection)) {
      return [collection, items.filter((item) => mapIds.has(item.mapId))];
    }
    return [collection, items.filter((item) => item.worldId === worldId)];
  }));
}

async function createCompleteBackup(data, now) {
  fs.mkdirSync(backupDir, { recursive: true });
  const targetPath = path.join(
    backupDir,
    `worldcraft-codex-complete-before-shanhai-reader-${timestampForFile(now)}.wcodex`
  );
  const result = await createProjectPackage({
    targetPath,
    data,
    assetsDir: assetDir,
    schemaVersion: 17,
    appVersion: packageVersion,
    now: () => now
  });
  return { targetPath, result };
}

function updateTemplate(template, name, description, specs) {
  const existing = new Map(template.fields.map((field) => [field.key, field]));
  template.name = name;
  template.description = description;
  template.fields = specs.map((spec, order) => ({
    ...(existing.get(spec.key) || {
      id: `template-field-${crypto.randomUUID()}`,
      key: spec.key,
      type: spec.type || "text",
      required: false,
      secret: false,
      defaultValue: "",
      options: [],
      targetEntityTypes: []
    }),
    label: spec.label,
    type: spec.type || existing.get(spec.key)?.type || "text",
    required: false,
    secret: false,
    options: spec.options || existing.get(spec.key)?.options || [],
    order
  }));
}

function cleanBoilerplate(value) {
  return String(value ?? "")
    .replace(/Worldcraft Codex 自制规则释读 v\d+(?:\.\d+){2}/g, "")
    .replace(/项目白话释读/g, "今译")
    .replace(/项目初校/g, "")
    .replace(/规则复核/g, "")
    .replace(/索引说明/g, "概览")
    .replace(/同名说明/g, "")
    .replace(/稳定段落编号/g, "")
    .replace(/复核证据/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanObjectStrings(value) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === "string") value[index] = cleanBoilerplate(item);
      else cleanObjectStrings(item);
    });
    return;
  }
  if (!value || typeof value !== "object") return;
  Object.keys(value).forEach((key) => {
    if (typeof value[key] === "string") value[key] = cleanBoilerplate(value[key]);
    else cleanObjectStrings(value[key]);
  });
}

function passageIds(value) {
  return String(value || "").split(/\s*,\s*/).filter(Boolean);
}

function sourceIndexKind(entity) {
  const stored = entity.templateData?._indexKind || entity.templateData?.indexKind || "";
  if (["异兽生灵", "山岳", "水系", "邦国族群", "草木药物", "神祇人物", "其他名物"].includes(stored)) {
    return stored;
  }
  const slugKind = String(entity.slug || "").match(/^corpus-index-([a-z]+)-/)?.[1];
  return {
    creature: "异兽生灵",
    mountain: "山岳",
    water: "水系",
    nation: "邦国族群",
    plant: "草木药物",
    deity: "神祇人物",
    other: "其他名物"
  }[slugKind] || stored || "其他名物";
}

function normalizedBaseTitle(title) {
  return String(title || "").replace(/（[^）]+）$/u, "").trim();
}

function appendNaturalOccurrences(entity, allPassages, passageTitles) {
  if (!entity.content.includes("<h2>全集出现位置</h2>")) return;
  entity.content = entity.content.replace(/<h2>全集出现位置<\/h2>[\s\S]*$/i, "").trim();
  const term = normalizedBaseTitle(entity.title).replace(/(?:山|国|水)$/u, "");
  if (!term) return;
  const matches = allPassages.filter((passage) => passage.originalText.includes(term)).slice(0, 12);
  if (!matches.length) return;
  const rows = matches.map((passage) => {
    const title = passageTitles.get(passage.id) || `${passage.chapterTitle} · 第${passage.order}段`;
    return `<li>《${escapeHtml(passage.chapterTitle)}》：${escapeHtml(truncate(passage.originalText, 150))}　[[${escapeHtml(title)}]]</li>`;
  });
  entity.content += `<h2>原文记载</h2><ul>${rows.join("")}</ul>`;
}

function targetObjects(data, worldId) {
  const maps = data.maps.filter((item) => item.worldId === worldId);
  const mapIds = new Set(maps.map((item) => item.id));
  const result = [data.worlds.find((item) => item.id === worldId), ...maps].filter(Boolean);
  for (const collection of WORKSPACE_COLLECTIONS) {
    if (collection === "worlds" || collection === "maps") continue;
    const items = Array.isArray(data[collection]) ? data[collection] : [];
    result.push(...(mapChildCollections.has(collection)
      ? items.filter((item) => mapIds.has(item.mapId))
      : items.filter((item) => item.worldId === worldId)));
  }
  return result;
}

function remapEntityReferences(value, remap, key = "") {
  if (Array.isArray(value)) {
    const mapped = value.map((item) => remapEntityReferences(item, remap));
    if (mapped.every((item) => typeof item === "string")) return [...new Set(mapped)];
    return mapped;
  }
  if (value && typeof value === "object") {
    for (const [childKey, child] of Object.entries(value)) {
      if (childKey === "id") continue;
      value[childKey] = remapEntityReferences(child, remap, childKey);
    }
    return value;
  }
  if (typeof value === "string" && key !== "id" && remap.has(value)) return remap.get(value);
  return value;
}

function rebuildSemanticRelations(data, targetWorld, indexInfos, passageById, now) {
  const generatedPrefix = "relation-shanhai-source-";
  data.relations = data.relations.filter(
    (relation) => relation.worldId !== targetWorld.id || !String(relation.id).startsWith(generatedPrefix)
  );
  data.relations.filter((relation) => relation.worldId === targetWorld.id).forEach((relation) => {
    if (/案例关系|现代改编联系/u.test(relation.notes || "")) {
      relation.notes = "原文明确记载二者存在联系。";
      relation.updatedAt = now;
    }
  });

  const infosByPassage = new Map();
  for (const info of indexInfos) {
    for (const passageId of info.occurrenceIds) {
      if (!infosByPassage.has(passageId)) infosByPassage.set(passageId, []);
      infosByPassage.get(passageId).push(info);
    }
  }
  const existing = new Set(data.relations
    .filter((relation) => relation.worldId === targetWorld.id)
    .map((relation) => `${relation.sourceEntityId}\0${relation.targetEntityId}\0${relation.label}`));
  const labelByKind = {
    异兽生灵: "栖息于",
    草木药物: "生长于",
    邦国族群: "位于",
    神祇人物: "活动于",
    其他名物: "见于",
    水系: "发源于"
  };
  const generated = [];
  for (const [passageId, infos] of infosByPassage) {
    const passage = passageById.get(passageId);
    if (!passage) continue;
    const sourceText = passage.originalText || "";
    const places = infos.filter((info) => ["山岳", "水系"].includes(info.kindLabel));
    for (const info of infos) {
      if (info.kindLabel === "山岳") continue;
      const candidates = places.filter((candidate) => (
        candidate.entity.id !== info.entity.id
        && (info.kindLabel !== "水系" || candidate.kindLabel === "山岳")
      ));
      if (!candidates.length) continue;
      const sourcePosition = sourceText.indexOf(info.normalizedName);
      const target = candidates
        .map((candidate) => ({ candidate, position: sourceText.indexOf(candidate.normalizedName) }))
        .filter((item) => item.position >= 0)
        .sort((left, right) => (
          Math.abs(left.position - sourcePosition) - Math.abs(right.position - sourcePosition)
        ))[0]?.candidate;
      if (!target || sourcePosition < 0) continue;
      const label = labelByKind[info.kindLabel] || "见于";
      const key = `${info.entity.id}\0${target.entity.id}\0${label}`;
      if (existing.has(key)) continue;
      existing.add(key);
      generated.push({
        id: `${generatedPrefix}${hash(key).slice(0, 18)}`,
        worldId: targetWorld.id,
        sourceEntityId: info.entity.id,
        targetEntityId: target.entity.id,
        kind: "located",
        label,
        direction: "directed",
        strength: 4,
        notes: `见《${passage.chapterTitle}》“${passage.sectionTitle}”的同段记载。`,
        updatedAt: now
      });
    }
  }
  data.relations.push(...generated);
  return generated.length;
}

function scanStrings(value, callback, path = "") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanStrings(item, callback, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => scanStrings(child, callback, path ? `${path}.${key}` : key));
    return;
  }
  if (typeof value === "string") callback(value, path);
}

function auditData(data, targetWorld, sourceHash, corpus = null) {
  const entities = data.entities.filter((item) => item.worldId === targetWorld.id);
  const passageEntries = entities.filter((item) => /^corpus-(?!index-)/.test(item.slug || ""));
  const indexEntries = entities.filter((item) => String(item.slug || "").startsWith("corpus-index-"));
  const volumeEntries = entities.filter((item) => Object.hasOwn(chapterIntroductions, item.title));
  const titleCounts = entities.reduce((map, entity) => map.set(entity.title, (map.get(entity.title) || 0) + 1), new Map());
  const duplicateTitles = [...titleCounts.entries()].filter(([, count]) => count > 1);
  const boilerplateHits = [];
  const externalHits = [];
  targetObjects(data, targetWorld.id).forEach((item, index) => {
    scanStrings(item, (text, path) => {
      if (boilerplatePattern.test(text)) boilerplateHits.push(`target[${index}].${path}`);
      boilerplatePattern.lastIndex = 0;
      if (externalPattern.test(text)) externalHits.push(`target[${index}].${path}`);
    });
  });
  const translationTexts = passageEntries.map((item) => (
    item.content.match(/<h2>今译<\/h2><p>([\s\S]*?)<\/p>/u)?.[1] || ""
  ));
  const storySeeds = [...passageEntries, ...indexEntries]
    .map((item) => item.content.match(/<h2>原创改编<\/h2><p><strong>原创声明：<\/strong>[\s\S]*?<\/p><p>([\s\S]*?)<\/p>/u)?.[1] || "")
    .filter(Boolean);
  const storySeedCounts = storySeeds.reduce((map, text) => map.set(text, (map.get(text) || 0) + 1), new Map());
  const inheritedAnnotations = [...new Set((corpus?.chapters || []).flatMap((chapter) => (
    chapter.passages.flatMap((passage) => passage.annotations || [])
  )).filter((text) => [...text].length >= 6))];
  const inheritedAnnotationTextHits = [];
  if (inheritedAnnotations.length) {
    for (const entity of entities) {
      for (const annotation of inheritedAnnotations) {
        if (String(entity.content || "").includes(annotation)) {
          inheritedAnnotationTextHits.push({ entity: entity.title, annotation: truncate(annotation, 80) });
        }
      }
    }
  }
  const syntheticClichePattern = /真正的威胁|唯一的线索|逐渐发现|最终意识到|必须在[^。]{0,24}之间|命运的齿轮|揭开[^。]{0,18}真相|前所未有的|古老而神秘|不为人知的秘密/u;
  const syntheticClicheHits = storySeeds
    .filter((text) => syntheticClichePattern.test(text))
    .map((text) => truncate(text, 100));
  const awkwardTranslationPattern = /并且|名叫叫|有一处名为一座|位于位于|本段记述的是|这里有|名叫|外形像|是山也|实惟|其上|其下|其阴|其阳|状如|音如|其鸣自呼/u;
  const classificationCounts = indexEntries.reduce((counts, entity) => {
    const kind = entity.templateData?._indexKind || "未分类";
    counts[kind] = (counts[kind] || 0) + 1;
    return counts;
  }, {});
  return {
    sourceUnchanged: hash(worldSnapshot(data, data.worlds.find((item) => item.name === sourceWorldName).id)) === sourceHash,
    counts: {
      entities: entities.length,
      volumes: volumeEntries.length,
      passages: passageEntries.length,
      encyclopediaEntries: indexEntries.length,
      publicEntities: entities.filter((item) => item.visibility === "public").length
    },
    translationCoverage: passageEntries.filter((item) => item.content.includes("<h2>今译</h2>")).length,
    awkwardTranslations: translationTexts.filter((text) => awkwardTranslationPattern.test(text)).length,
    annotatedPassages: passageEntries.filter((item) => item.content.includes("<h2>读法</h2>")).length,
    inheritedAnnotationSections: passageEntries.filter((item) => item.content.includes("<h2>原文注释</h2>")).length,
    storyCoverage: {
      passages: passageEntries.filter((item) => item.content.includes("<h2>原创改编</h2>")).length,
      encyclopedia: indexEntries.filter((item) => item.content.includes("<h2>原创改编</h2>")).length,
      volumes: volumeEntries.filter((item) => item.content.includes("<h2>原创改编</h2>")).length
    },
    originalityDisclosureCoverage: [...passageEntries, ...indexEntries, ...volumeEntries]
      .filter((item) => item.content.includes("<strong>原创声明：</strong>本节由 Worldcraft Codex 编写，仅供故事创作，不属于《山海经》原文或传统传说。")).length,
    repeatedStorySeeds: [...storySeedCounts.entries()].filter(([, count]) => count > 1),
    syntheticClicheHits,
    sourceBoundary: {
      sourceTextEntries: passageEntries.filter((item) => item.content.includes("<h2>原文</h2>")).length,
      projectTranslationEntries: passageEntries.filter((item) => item.content.includes("<h2>今译</h2>")).length,
      projectReadingNoteEntries: passageEntries.filter((item) => item.content.includes("<h2>读法</h2>")).length,
      projectCreativeNoteEntries: [...passageEntries, ...indexEntries, ...volumeEntries]
        .filter((item) => item.content.includes("<h2>原创改编</h2>")).length,
      sourceAnnotationCorpusCount: inheritedAnnotations.length,
      inheritedAnnotationTextHits
    },
    classificationCounts,
    semanticRelations: data.relations.filter((relation) => relation.worldId === targetWorld.id).length,
    volumeReaderCoverage: volumeEntries.filter((item) => item.content.includes("<h2>篇章导读</h2>") && item.content.includes("<strong>今译</strong>")).length,
    duplicateTitles,
    boilerplateHits,
    externalHits,
    wiki: {
      navigationCategories: targetWorld.wiki?.navigationCategoryIds?.length || 0,
      featuredEntries: targetWorld.wiki?.featuredEntityIds?.length || 0,
      publishedMaps: targetWorld.wiki?.publishedMapIds?.length || 0,
      publishedTimelines: targetWorld.wiki?.publishedTimelineTrackIds?.length || 0,
      publishedQuests: targetWorld.wiki?.publishedQuestIds?.length || 0
    }
  };
}

function refineWorkspace(data, corpus, now) {
  const targetWorld = data.worlds.find((item) => item.name === targetWorldName);
  const sourceWorld = data.worlds.find((item) => item.name === sourceWorldName);
  assert.ok(targetWorld, `未找到 ${targetWorldName}`);
  assert.ok(sourceWorld, `未找到 ${sourceWorldName}`);
  const sourceHash = hash(worldSnapshot(data, sourceWorld.id));
  let entities = data.entities.filter((item) => item.worldId === targetWorld.id);
  const entityBySlug = new Map(entities.map((entity) => [entity.slug, entity]));
  const allPassages = corpus.chapters.flatMap((chapter) => chapter.passages.map((passage) => ({
    ...passage,
    chapterTitle: chapter.title,
    chapterKey: chapter.key
  })));
  const passageById = new Map(allPassages.map((passage) => [passage.id, passage]));
  const existingPassageTitleToId = new Map(allPassages.map((passage) => [
    entityBySlug.get(passage.id)?.title,
    passage.id
  ]).filter(([title]) => Boolean(title)));
  assert.equal(allPassages.length, 869, "本地语料应包含 869 个原文段落");

  const passageTitles = new Map();
  for (const passage of allPassages) {
    const entity = entityBySlug.get(passage.id);
    assert.ok(entity, `${passage.id} 缺少分段条目`);
    passageTitles.set(passage.id, passageDisplayTitle(passage.chapterTitle, passage, entity.title));
  }

  let indexEntities = entities.filter((entity) => String(entity.slug || "").startsWith("corpus-index-"));
  const occurrenceIdsFor = (entity) => {
    const stored = passageIds(entity.templateData?.occurrencePassageIds);
    if (stored.length) return stored;
    const linked = [...String(entity.content || "").matchAll(/\[\[([^\]]+)\]\]/g)]
      .map((match) => existingPassageTitleToId.get(match[1].trim()))
      .filter(Boolean);
    if (linked.length) return [...new Set(linked)];
    const kindLabel = sourceIndexKind(entity);
    let term = entity.templateData?.normalizedName || normalizedBaseTitle(entity.title);
    if (kindLabel === "山岳") term = term.replace(/山$/u, "");
    if (kindLabel === "水系") term = term.replace(/(?:水|河|江|泽|海|溪|渊|湖|池|川)$/u, "");
    if (kindLabel === "邦国族群") term = term.replace(/国$/u, "");
    return term ? allPassages.filter((passage) => passage.originalText.includes(term)).map((passage) => passage.id) : [];
  };
  let indexInfos = indexEntities.map((entity) => {
    const normalizedName = entity.templateData?.normalizedName || normalizedBaseTitle(entity.title);
    const sourceKind = sourceIndexKind(entity);
    const occurrenceIds = [...new Set(occurrenceIdsFor(entity))];
    const occurrences = occurrenceIds
      .map((id) => passageById.get(id))
      .filter(Boolean)
      .map((passage) => ({
        chapterTitle: passage.chapterTitle,
        passage,
        displayTitle: passageTitles.get(passage.id)
      }));
    const kindLabel = classifyIndexKind({
      name: normalizedName,
      currentKind: sourceKind,
      occurrences
    });
    return { entity, normalizedName, sourceKind, kindLabel, occurrenceIds, occurrences };
  });

  const mergeGroups = new Map();
  for (const info of indexInfos) {
    const key = `${info.kindLabel}\0${naturalizeIndexTitle(info.normalizedName, info.kindLabel)}`;
    if (!mergeGroups.has(key)) mergeGroups.set(key, []);
    mergeGroups.get(key).push(info);
  }
  const entityRemap = new Map();
  const removedEntityIds = new Set();
  for (const group of mergeGroups.values()) {
    if (group.length < 2) continue;
    const ranked = [...group].sort((left, right) => {
      const leftAssets = data.assets.filter((asset) => asset.worldId === targetWorld.id && asset.linkedEntityIds?.includes(left.entity.id)).length;
      const rightAssets = data.assets.filter((asset) => asset.worldId === targetWorld.id && asset.linkedEntityIds?.includes(right.entity.id)).length;
      return rightAssets - leftAssets || right.occurrenceIds.length - left.occurrenceIds.length;
    });
    const winner = ranked[0];
    winner.occurrenceIds = [...new Set(ranked.flatMap((info) => info.occurrenceIds))];
    winner.occurrences = winner.occurrenceIds
      .map((id) => passageById.get(id))
      .filter(Boolean)
      .map((passage) => ({
        chapterTitle: passage.chapterTitle,
        passage,
        displayTitle: passageTitles.get(passage.id)
      }));
    for (const duplicate of ranked.slice(1)) {
      entityRemap.set(duplicate.entity.id, winner.entity.id);
      removedEntityIds.add(duplicate.entity.id);
    }
  }
  if (entityRemap.size) {
    targetObjects(data, targetWorld.id).forEach((item) => remapEntityReferences(item, entityRemap));
    data.entities = data.entities.filter((entity) => !removedEntityIds.has(entity.id));
    entities = entities.filter((entity) => !removedEntityIds.has(entity.id));
    indexEntities = indexEntities.filter((entity) => !removedEntityIds.has(entity.id));
    indexInfos = indexInfos.filter((info) => !removedEntityIds.has(info.entity.id));
  }
  const indexInfoById = new Map(indexInfos.map((info) => [info.entity.id, info]));

  const nonIndexTitles = new Set(entities
    .filter((entity) => !String(entity.slug || "").startsWith("corpus-index-"))
    .map((entity) => passageById.has(entity.slug) ? passageTitles.get(entity.slug) : entity.title));
  const proposals = new Map(indexInfos.map((info) => [
    info.entity.id,
    naturalizeIndexTitle(info.normalizedName, info.kindLabel)
  ]));
  const proposalCounts = [...proposals.values()].reduce(
    (counts, title) => counts.set(title, (counts.get(title) || 0) + 1),
    new Map()
  );
  const usedTitles = new Set(nonIndexTitles);
  const indexTitles = new Map();
  for (const entity of indexEntities) {
    const kindLabel = indexInfoById.get(entity.id).kindLabel;
    const meta = readerKind(kindLabel);
    const proposed = proposals.get(entity.id);
    let title = proposed;
    if ((proposalCounts.get(proposed) || 0) > 1 || usedTitles.has(title)) title = `${proposed}（${meta.label}）`;
    let suffix = 2;
    while (usedTitles.has(title)) title = `${proposed}（${meta.label}${suffix++}）`;
    usedTitles.add(title);
    indexTitles.set(entity.id, title);
  }

  const relatedTitlesByPassage = new Map();
  for (const info of indexInfos) {
    for (const id of info.occurrenceIds) {
      if (!relatedTitlesByPassage.has(id)) relatedTitlesByPassage.set(id, []);
      relatedTitlesByPassage.get(id).push(indexTitles.get(info.entity.id));
    }
  }

  const corpusTemplate = data.entityTemplates.find(
    (template) => template.worldId === targetWorld.id && ["山海经原典全集模板", "山海经知识条目"].includes(template.name)
  );
  assert.ok(corpusTemplate, "未找到山海经语料模板");
  updateTemplate(corpusTemplate, "山海经知识条目", "显示篇目、章节、知识类型与原文位置；今译与读法由本项目整理，故事构想均明确标作原创改编。", [
    { key: "corpusChapter", label: "所属篇目", type: "select", options: corpus.chapters.map((chapter) => chapter.title) },
    { key: "corpusSection", label: "篇内章节", type: "text" },
    { key: "indexKind", label: "条目类型", type: "text" },
    { key: "occurrenceCount", label: "原文记载", type: "text" }
  ]);
  const baseTemplate = data.entityTemplates.find(
    (template) => template.worldId === targetWorld.id && ["山海原典条目模板", "山海经百科条目"].includes(template.name)
  );
  assert.ok(baseTemplate, "未找到山海经百科模板");
  updateTemplate(baseTemplate, "山海经百科条目", "用于卷目、人物、异兽、山川、国族和神物条目。", [
    { key: "canonicalSection", label: "所属篇目", type: "select", options: corpus.chapters.map((chapter) => chapter.title) },
    { key: "recordKind", label: "条目类型", type: "select" },
    { key: "canonicalPlace", label: "所属部分", type: "text" }
  ]);

  for (const passage of allPassages) {
    const entity = entityBySlug.get(passage.id);
    entity.title = passageTitles.get(passage.id);
    entity.summary = truncate(editorialTranslation(passage.plainLanguageText, passage), 150);
    entity.content = buildPassageContent(passage, relatedTitlesByPassage.get(passage.id) || []);
    entity.tags = ["山海经", passage.chapterTitle, passage.sectionTitle, "原文", "今译"];
    entity.visibility = "public";
    entity.templateId = corpusTemplate.id;
    entity.templateData = {
      corpusChapter: passage.chapterTitle,
      corpusSection: passage.sectionTitle,
      indexKind: "原文分段",
      occurrenceCount: "本段"
    };
    entity.updatedAt = now;
  }

  for (const chapter of corpus.chapters) {
    const entity = entities.find((item) => item.title === chapter.title && !String(item.slug || "").startsWith("corpus-"));
    assert.ok(entity, `缺少卷目条目：${chapter.title}`);
    entity.summary = `${chapterIntroductions[chapter.title]}全篇共 ${chapter.passages.length} 段，并附逐段今译。`;
    entity.content = buildChapterContent(chapter, passageTitles);
    entity.tags = ["山海经", "十八篇", chapterGroup(chapter.title), "原文与今译"];
    entity.visibility = "public";
    entity.templateId = baseTemplate.id;
    entity.templateData = {
      canonicalSection: chapter.title,
      recordKind: "经典卷目",
      canonicalPlace: chapterGroup(chapter.title)
    };
    entity.updatedAt = now;
  }

  for (const info of indexInfos) {
    const { entity, kindLabel, normalizedName, occurrenceIds, occurrences } = info;
    const title = indexTitles.get(entity.id);
    const article = buildIndexArticle({ title, normalizedName, kindLabel, occurrences });
    entity.title = title;
    entity.summary = article.summary;
    entity.content = article.content;
    entity.tags = ["山海经", "百科", article.meta.label, ...new Set(occurrences.map((item) => item.chapterTitle))];
    entity.visibility = "public";
    entity.templateId = corpusTemplate.id;
    entity.templateData = {
      corpusChapter: occurrences[0]?.chapterTitle || "山海经",
      corpusSection: occurrences[0]?.passage.sectionTitle || "",
      indexKind: article.meta.label,
      occurrenceCount: `${occurrences.length} 处`,
      occurrencePassageIds: occurrenceIds.join(", "),
      normalizedName,
      _indexKind: kindLabel
    };
    entity.updatedAt = now;
  }

  const categories = data.codexCategories.filter((item) => item.worldId === targetWorld.id);
  const categoryByTitle = new Map(categories.map((category) => [category.title, category]));
  const navigationCategories = new Map(
    (targetWorld.wiki?.navigationCategoryIds || [])
      .map((id) => categories.find((category) => category.id === id))
      .filter(Boolean)
      .map((category) => [category.title, category])
  );
  const adaptationCategory = navigationCategories.get("原创改编角色");
  const indexRoot = categoryByTitle.get("名物出现索引");
  const indexCategoryPlans = {
    异兽生灵: ["异兽图鉴", "山海异兽", "《山海经》中异兽、神鸟、水怪与奇异生灵的百科条目。"],
    山岳: ["山岳与地貌", "山川神域", "全书山岳、丘谷、林野及相关地理记载。"],
    水系: ["河流与水域", "山川神域", "全书河流、水泽、海域及其流向记载。"],
    邦国族群: ["国族与部落", "邦国与族群", "全书国族、部落与异域居民条目。"],
    草木药物: ["草木与药物", "草木与神物", "全书草木、药物及其效用记载。"],
    神祇人物: ["全书人物", "神祇与人物", "全书神祇、帝王、英雄与巫者条目。"],
    其他名物: ["神物与其他", "草木与神物", "全书神物、器物与其他奇异名物。"]
  };
  if (indexRoot) {
    for (const category of categories.filter((item) => item.parentId === indexRoot.id)) {
      const plan = indexCategoryPlans[category.title];
      if (!plan) continue;
      const parent = navigationCategories.get(plan[1]) || categoryByTitle.get(plan[1]);
      category.title = plan[0];
      category.description = plan[2];
      if (parent) category.parentId = parent.id;
      category.updatedAt = now;
    }
    data.codexCategories = data.codexCategories.filter((category) => category.id !== indexRoot.id);
  }
  const categoryUpdates = {
    经典卷目: ["十八篇总览", "按《山海经》十八篇阅读全书原文与本项目今译。"],
    原典内容全集: ["山海经全书", "完整收录十八篇原文，并配有本项目今译、读法与百科关联。"],
    原典逐段: ["原文与今译", "按篇章顺序阅读 869 个原文段落及本项目今译。"],
    山海异兽: ["山海异兽", "异兽、神鸟、水怪及其他奇异生灵。"],
    神祇与人物: ["神祇与人物", "神祇、帝王、英雄、巫者及神话人物。"],
    山川神域: ["山川与水系", "山岳、河流、水泽、海域及神圣地理。"],
    邦国与族群: ["邦国与族群", "异域邦国、部落、氏族及其居民。"],
    草木与神物: ["草木与神物", "奇异草木、药物、玉石与神物。"],
    原创改编角色: ["创作改编", "与原书知识内容分开的创作资料。"]
  };
  for (const category of categories) {
    const update = categoryUpdates[category.title];
    if (update) {
      category.title = update[0];
      category.description = update[1];
      category.updatedAt = now;
    } else if (corpus.chapters.some((chapter) => chapter.title === category.title)) {
      const chapter = corpus.chapters.find((item) => item.title === category.title);
      category.description = `《${category.title}》的 ${chapter.passages.length} 个原文段落、今译、读法与原创改编。`;
      category.updatedAt = now;
    }
  }

  const knowledgeCategoryIds = new Set(categories
    .filter((category) => category.title !== "创作改编")
    .map((category) => category.id));
  for (const entity of entities.filter((item) => !passageById.has(item.slug) && !indexTitles.has(item.id) && !Object.hasOwn(chapterIntroductions, item.title))) {
    const isAdaptation = adaptationCategory && entity.categoryId === adaptationCategory.id;
    if (isAdaptation) {
      entity.visibility = "private";
      continue;
    }
    if (knowledgeCategoryIds.has(entity.categoryId)) entity.visibility = "public";
    appendNaturalOccurrences(entity, allPassages, passageTitles);
    entity.content = cleanBoilerplate(entity.content);
    entity.summary = cleanBoilerplate(entity.summary)
      .replace(/原典/g, "原文")
      .replace(/全集索引/g, "百科");
    entity.tags = [...new Set((entity.tags || [])
      .map((tag) => cleanBoilerplate(tag).replace(/全集索引/g, "百科"))
      .filter((tag) => tag && !/^\d+处原文$/u.test(tag) && !["固定修订", "整理版本", "原典全文", "篇章索引"].includes(tag)))];
    if (entity.templateId === baseTemplate.id) {
      entity.templateData = {
        canonicalSection: entity.templateData?.canonicalSection || "山海经",
        recordKind: entity.templateData?.recordKind || "百科条目",
        canonicalPlace: entity.templateData?.canonicalPlace || ""
      };
    }
    entity.updatedAt = now;
  }

  const finalCategories = data.codexCategories.filter((item) => item.worldId === targetWorld.id);
  const finalByTitle = new Map(finalCategories.map((category) => [category.title, category]));
  const normalizedLeafPlans = [
    { aliases: ["异兽生灵", "异兽图鉴"], title: "异兽图鉴", parent: "山海异兽", description: "《山海经》中异兽、神鸟、水怪与奇异生灵的百科条目。" },
    { aliases: ["山岳", "山岳与地貌"], title: "山岳与地貌", parent: "山川与水系", description: "全书山岳、丘谷、林野及相关地理记载。" },
    { aliases: ["水系", "河流与水域"], title: "河流与水域", parent: "山川与水系", description: "全书河流、水泽、海域及其流向记载。" },
    { aliases: ["邦国族群", "国族与部落"], title: "国族与部落", parent: "邦国与族群", description: "全书国族、部落与异域居民条目。" },
    { aliases: ["草木药物", "草木", "草木与药物"], title: "草木与药物", parent: "草木与神物", description: "全书草木、药物及其效用记载。" },
    { aliases: ["神祇人物", "全书人物"], title: "全书人物", parent: "神祇与人物", description: "全书神祇、帝王、英雄与巫者条目。" },
    { aliases: ["其他名物", "神物与其他"], title: "神物与其他", parent: "草木与神物", description: "全书神物、器物与其他奇异名物。" }
  ];
  for (const plan of normalizedLeafPlans) {
    const candidates = finalCategories
      .filter((category) => plan.aliases.includes(category.title))
      .sort((left, right) => (
        entities.filter((entity) => entity.categoryId === right.id).length
        - entities.filter((entity) => entity.categoryId === left.id).length
      ));
    const category = candidates[0];
    const parent = finalByTitle.get(plan.parent);
    if (!category || !parent) continue;
    for (const duplicate of candidates.slice(1)) {
      entities.filter((entity) => entity.categoryId === duplicate.id).forEach((entity) => {
        entity.categoryId = category.id;
      });
      data.codexCategories = data.codexCategories.filter((item) => item.id !== duplicate.id);
    }
    category.title = plan.title;
    category.description = plan.description;
    category.parentId = parent.id;
    category.updatedAt = now;
  }
  const leafCategoryByTitle = new Map(
    data.codexCategories
      .filter((category) => category.worldId === targetWorld.id)
      .map((category) => [category.title, category])
  );
  for (const info of indexInfos) {
    const category = leafCategoryByTitle.get(readerKind(info.kindLabel).category);
    assert.ok(category, `缺少百科目录：${readerKind(info.kindLabel).category}`);
    info.entity.categoryId = category.id;
    info.entity.updatedAt = now;
  }
  const volumeRoot = finalByTitle.get("十八篇总览");
  if (volumeRoot) {
    for (const chapter of corpus.chapters) {
      const chapterCategory = finalByTitle.get(chapter.title);
      const chapterEntity = entities.find(
        (entity) => entity.title === chapter.title && !String(entity.slug || "").startsWith("corpus-")
      );
      assert.ok(chapterCategory, `缺少卷目目录：${chapter.title}`);
      assert.ok(chapterEntity, `缺少卷目文章：${chapter.title}`);
      chapterCategory.parentId = volumeRoot.id;
      chapterCategory.updatedAt = now;
      chapterEntity.categoryId = chapterCategory.id;
      chapterEntity.updatedAt = now;
    }
  }
  const obsoleteCategoryTitles = new Set([
    "山海经全书",
    "原文与译文",
    "五藏山经",
    "海外四经",
    "海内诸经",
    "大荒四经"
  ]);
  const obsoleteCategoryIds = new Set(
    finalCategories.filter((category) => obsoleteCategoryTitles.has(category.title)).map((category) => category.id)
  );
  assert.equal(
    entities.some((entity) => obsoleteCategoryIds.has(entity.categoryId)),
    false,
    "删除旧目录前必须迁移其中的全部文章"
  );
  data.codexCategories = data.codexCategories.filter((category) => !obsoleteCategoryIds.has(category.id));
  const knowledgeRoot = finalCategories.find((category) => ["创作笔记", "山海知识库"].includes(category.title));
  if (knowledgeRoot) {
    knowledgeRoot.title = "山海知识库";
    knowledgeRoot.description = "《山海经》十八篇、百科图鉴与原文译读的统一目录。";
    ["十八篇总览", "山海异兽", "神祇与人物", "山川与水系", "邦国与族群", "草木与神物"]
      .map((title) => finalByTitle.get(title))
      .filter(Boolean)
      .forEach((category) => {
        category.parentId = knowledgeRoot.id;
      });
    const categoryById = new Map(
      data.codexCategories.filter((category) => category.worldId === targetWorld.id).map((category) => [category.id, category])
    );
    const belongsToKnowledgeBase = (categoryId) => {
      const visited = new Set();
      let current = categoryById.get(categoryId);
      while (current && !visited.has(current.id)) {
        if (current.id === knowledgeRoot.id) return true;
        visited.add(current.id);
        current = categoryById.get(current.parentId);
      }
      return false;
    };
    const misplacedPublicEntities = entities
      .filter((entity) => entity.visibility === "public" && !belongsToKnowledgeBase(entity.categoryId))
      .map((entity) => entity.title);
    assert.deepEqual(misplacedPublicEntities, [], "公开知识条目必须全部归入山海知识库目录");
  }
  targetWorld.name = targetWorldName;
  targetWorld.description = "《山海经》十八篇创作型知识库，保留原文，并以本项目重写的今译与读法整理山川、水系、异兽、神祇、国族、草木和神物；补写故事均明确标作原创改编。";
  targetWorld.visibility = "public";
  targetWorld.wiki = {
    ...(targetWorld.wiki || {}),
    navigationCategoryIds: ["十八篇总览", "山海异兽", "神祇与人物", "山川与水系", "邦国与族群", "草木与神物"]
      .map((title) => finalByTitle.get(title)?.id)
      .filter(Boolean),
    featuredEntityIds: corpus.chapters.slice(0, 8)
      .map((chapter) => entities.find((entity) => entity.title === chapter.title)?.id)
      .filter(Boolean),
    publishedTimelineTrackIds: data.timelineTracks
      .filter((track) => track.worldId === targetWorld.id && !/改编|主时间线/.test(track.name))
      .map((track) => track.id),
    publishedQuestIds: []
  };
  targetWorld.updatedAt = now;

  const targetMapIds = new Set(data.maps.filter((map) => map.worldId === targetWorld.id).map((map) => map.id));
  data.mapMarkerGroups.filter((group) => targetMapIds.has(group.mapId)).forEach((group) => {
    group.title = String(group.title || "").replace(/篇章入口/g, "阅读入口");
    group.description = String(group.description || "")
      .replace(/逐段原文与白话释读/g, "原文、今译与百科条目")
      .replace(/篇内单元/g, "篇章内容");
  });

  const generatedRelationCount = rebuildSemanticRelations(data, targetWorld, indexInfos, passageById, now);

  targetObjects(data, targetWorld.id).forEach(cleanObjectStrings);
  const audit = auditData(data, targetWorld, sourceHash, corpus);
  assert.equal(audit.sourceUnchanged, true, "原版山海经必须保持不变");
  assert.equal(audit.counts.volumes, 18, "十八篇卷目齐全");
  assert.equal(audit.counts.passages, 869, "869 个原文分段齐全");
  assert.equal(audit.counts.entities - audit.counts.encyclopediaEntries, 1008, "合并百科同义页时不得丢失其他知识对象");
  assert.ok(
    audit.counts.encyclopediaEntries >= 900,
    `语义合并后仍须保留至少 900 个独立百科主题；当前 ${audit.counts.encyclopediaEntries}，合并 ${entityRemap.size}`
  );
  assert.equal(audit.translationCoverage, 869, "每个分段都提供本项目今译");
  assert.equal(audit.volumeReaderCoverage, 18, "每个卷目都提供连续原文与译文阅读");
  assert.equal(audit.awkwardTranslations, 0, "已清除已知机械译文痕迹");
  assert.equal(audit.inheritedAnnotationSections, 0, "重制版不得展示从转录文本继承的夹注");
  assert.equal(audit.storyCoverage.passages, 869, "每个分段都提供独立故事种子");
  assert.equal(audit.storyCoverage.encyclopedia, audit.counts.encyclopediaEntries, "每个百科主题都提供独立故事种子");
  assert.equal(audit.storyCoverage.volumes, 18, "每篇卷目都提供创作视角");
  assert.equal(
    audit.originalityDisclosureCoverage,
    audit.counts.passages + audit.counts.encyclopediaEntries + audit.counts.volumes,
    "每一处项目故事构想都必须显示原创声明"
  );
  assert.deepEqual(audit.repeatedStorySeeds, [], "故事种子不得整段重复");
  assert.deepEqual(audit.syntheticClicheHits, [], "创作札记不得出现常见机器写作套话");
  assert.deepEqual(audit.sourceBoundary.inheritedAnnotationTextHits, [], "来源夹注不得进入重制版 Wiki");
  assert.ok(audit.annotatedPassages >= 500, "本项目自写读法须覆盖至少 500 个分段");
  assert.ok(generatedRelationCount >= 250, "应从原文共现关系中建立至少 250 条语义关系");
  assert.deepEqual(audit.duplicateTitles, [], "知识库中不存在完全同名的页面");
  assert.deepEqual(audit.boilerplateHits, [], "知识库中不再出现制作流程术语");
  assert.deepEqual(audit.externalHits, [], "重制版仍不包含外部链接");
  const expectedKinds = {
    苗民: "邦国族群",
    从渊: "水系",
    大鵹: "异兽生灵",
    帝女之桑: "草木药物",
    柏子高: "神祇人物",
    大人之堂: "山岳"
  };
  for (const [name, kind] of Object.entries(expectedKinds)) {
    assert.equal(
      indexInfos.find((info) => info.normalizedName === name)?.kindLabel,
      kind,
      `${name} 的百科分类应为 ${kind}`
    );
  }
  return { targetWorld, sourceHash, audit };
}

async function verifyRenderedWiki(targetName, firstPassageTitle) {
  const env = {
    ...process.env,
    ELECTRON_START_URL: process.env.ELECTRON_START_URL || "http://127.0.0.1:3000",
    WORLDCRAFT_USER_DATA_DIR: userDataDir
  };
  delete env.ELECTRON_RUN_AS_NODE;
  const executablePath = path.join(root, "node_modules", "electron", "dist", "electron.exe");
  const app = await electron.launch({ executablePath, args: ["."], cwd: root, env, timeout: 60000 });
  try {
    const page = await app.firstWindow({ timeout: 60000 });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(() => Boolean(window.worldcraftStore?.loadWorkspace), null, { timeout: 60000 });
    await page.locator(".compact-save-status").waitFor({ state: "visible", timeout: 60000 });
    await page.getByLabel("切换世界").click();
    await page.getByRole("button", { name: targetName, exact: true }).click();
    await page.waitForFunction(
      (name) => document.querySelector(".world-menu-current")?.textContent?.trim() === name,
      targetName,
      { timeout: 60000 }
    );
    const wikiButton = page.locator('button[aria-label="世界总览"][data-label="世界总览"]').first();
    if (!(await wikiButton.isVisible())) {
      await page.locator(".rail-more > summary").click();
      await wikiButton.waitFor({ state: "visible" });
    }
    await wikiButton.click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible", timeout: 60000 });
    await page.getByRole("heading", { name: targetName, exact: true }).waitFor({ timeout: 60000 });
    await page.screenshot({ path: screenshots.home, fullPage: false });

    const search = page.getByLabel("搜索世界 Wiki", { exact: true });
    await search.fill(firstPassageTitle);
    const passageResult = page.locator(".wiki-search-page .wiki-entry-row").filter({ hasText: firstPassageTitle }).first();
    await passageResult.waitFor({ state: "visible", timeout: 60000 });
    await passageResult.click();
    await page.locator(".wiki-rich-content").waitFor({ state: "visible", timeout: 60000 });
    const passageAudit = await page.locator(".wiki-article").evaluate((article) => ({
      title: article.querySelector(".wiki-article-header h1")?.textContent?.trim() || "",
      breadcrumbs: [...article.ownerDocument.querySelectorAll(".wiki-breadcrumb-item")]
        .map((item) => item.textContent?.trim())
        .filter(Boolean),
      hasOriginal: [...article.querySelectorAll("h2")].some((heading) => heading.textContent?.trim() === "原文"),
      hasTranslation: [...article.querySelectorAll("h2")].some((heading) => heading.textContent?.trim() === "今译"),
      hasStorySeed: [...article.querySelectorAll("h2")].some((heading) => heading.textContent?.trim() === "原创改编"),
      hasOriginalityDisclosure: /原创声明：本节由 Worldcraft Codex 编写，仅供故事创作，不属于《山海经》原文或传统传说。/.test(article.textContent || ""),
      hasMechanicalPhrasing: /这里有|名叫|外形像|可以把|可以将|可用于/.test(
        [...article.querySelectorAll("h2")]
          .find((heading) => heading.textContent?.trim() === "今译")
          ?.nextElementSibling?.textContent || ""
      ),
      hasBoilerplate: /规则复核|索引说明|同名说明|项目白话释读|项目初校|稳定段落编号|复核证据/.test(article.textContent || ""),
      factLabels: [...article.querySelectorAll(".wiki-fact-sheet dt")].map((item) => item.textContent?.trim())
    }));
    await page.screenshot({ path: screenshots.reader, fullPage: false });

    await search.fill("白鵺");
    const entryResult = page.locator(".wiki-search-page .wiki-entry-row").filter({ hasText: "白鵺" }).first();
    await entryResult.waitFor({ state: "visible", timeout: 60000 });
    await entryResult.click();
    await page.locator(".wiki-rich-content").waitFor({ state: "visible", timeout: 60000 });
    const encyclopediaAudit = await page.locator(".wiki-article").evaluate((article) => ({
      breadcrumbs: [...article.ownerDocument.querySelectorAll(".wiki-breadcrumb-item")]
        .map((item) => item.textContent?.trim())
        .filter(Boolean),
      headings: [...article.querySelectorAll(".wiki-rich-content h2")].map((item) => item.textContent?.trim()),
      storySeedLength: [...article.querySelectorAll(".wiki-rich-content h2")]
        .find((heading) => heading.textContent?.trim() === "原创改编")
        ?.nextElementSibling?.nextElementSibling?.textContent?.trim().length || 0,
      hasOriginalityDisclosure: /原创声明：本节由 Worldcraft Codex 编写，仅供故事创作，不属于《山海经》原文或传统传说。/.test(article.textContent || ""),
      hasBoilerplate: /规则复核|索引说明|同名说明|项目白话释读|项目初校|稳定段落编号|复核证据/.test(article.textContent || ""),
      externalLinks: article.querySelectorAll('a[href^="http"],a[href^="ftp"],a[href^="mailto"],a[href^="tel"]').length,
      factLabels: [...article.querySelectorAll(".wiki-fact-sheet dt")].map((item) => item.textContent?.trim())
    }));
    await page.screenshot({ path: screenshots.entry, fullPage: false });
    return { passageAudit, encyclopediaAudit };
  } finally {
    await app.close().catch(() => {});
  }
}

async function main() {
  assert.ok(fs.existsSync(dbPath), `未找到数据库：${dbPath}`);
  fs.mkdirSync(validationDir, { recursive: true });
  const corpus = JSON.parse(fs.readFileSync(path.join(root, "data", "shanhai-corpus.zh-hans.json"), "utf8"));
  const store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  let backup;
  let savedAudit;
  let firstPassageTitle;
  try {
    const loaded = store.load();
    assert.ok(loaded.data, "工作区数据库为空");
    const now = new Date().toISOString();
    backup = await createCompleteBackup(loaded.data, now);
    const refined = refineWorkspace(loaded.data, corpus, now);
    firstPassageTitle = loaded.data.entities.find(
      (entity) => entity.worldId === refined.targetWorld.id && entity.slug === corpus.chapters[0].passages[0].id
    ).title;
    const saveStats = store.save(loaded.data, "refine-shanhai-remastered-knowledge-base");
    const reloaded = store.load().data;
    const persistedWorld = reloaded.worlds.find((item) => item.name === targetWorldName);
    savedAudit = {
      ...auditData(reloaded, persistedWorld, refined.sourceHash, corpus),
      saveStats,
      diagnostics: store.diagnostics()
    };
    assert.equal(savedAudit.diagnostics.ok, true, "SQLite 持久化诊断通过");
    assert.deepEqual(savedAudit.boilerplateHits, [], "持久化后制作流程术语仍为零");
    assert.deepEqual(savedAudit.externalHits, [], "持久化后外部链接仍为零");
  } finally {
    store.close();
  }

  const rendered = await verifyRenderedWiki(targetWorldName, firstPassageTitle);
  assert.deepEqual(rendered.passageAudit, {
    title: firstPassageTitle,
    breadcrumbs: ["山海知识库", "十八篇总览", "南山经", firstPassageTitle],
    hasOriginal: true,
    hasTranslation: true,
    hasStorySeed: true,
    hasOriginalityDisclosure: true,
    hasMechanicalPhrasing: false,
    hasBoilerplate: false,
    factLabels: ["所属篇目", "篇内章节", "条目类型", "原文记载"]
  });
  assert.deepEqual(rendered.encyclopediaAudit.headings, ["概览", "原创改编", "原文记载", "相关篇目"]);
  assert.ok(rendered.encyclopediaAudit.storySeedLength >= 60);
  assert.equal(rendered.encyclopediaAudit.hasOriginalityDisclosure, true);
  assert.equal(rendered.encyclopediaAudit.hasBoilerplate, false);
  assert.equal(rendered.encyclopediaAudit.externalLinks, 0);
  assert.equal(rendered.encyclopediaAudit.breadcrumbs.includes("山海知识库"), true);
  assert.equal(rendered.encyclopediaAudit.breadcrumbs.includes("创作笔记"), false);
  assert.deepEqual(rendered.encyclopediaAudit.factLabels, ["所属篇目", "篇内章节", "条目类型", "原文记载"]);

  const report = {
    generatedAt: new Date().toISOString(),
    targetWorld: targetWorldName,
    backup: backup.targetPath,
    audit: savedAudit,
    rendered,
    screenshots
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ ok: true, reportPath, ...report }, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error?.stack || error);
    process.exitCode = 1;
  });
}

module.exports = { auditData, refineWorkspace };
