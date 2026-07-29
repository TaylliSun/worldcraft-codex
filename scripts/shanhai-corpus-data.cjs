const crypto = require("node:crypto");
const corpus = require("../data/shanhai-corpus.zh-hans.json");

const kindLabels = {
  mountain: "山岳",
  water: "水系",
  nation: "邦国族群",
  creature: "异兽生灵",
  plant: "草木",
  deity: "神祇人物",
  other: "其他名物"
};

const kindTypes = {
  mountain: "location",
  water: "location",
  nation: "faction",
  creature: "note",
  plant: "item",
  deity: "character",
  other: "note"
};

const rejectedNames = new Set([
  "山", "水", "国", "人", "神", "兽", "鸟", "鱼", "蛇", "虫", "草", "木", "药",
  "怪", "怪兽", "怪鸟", "怪鱼", "大蛇", "白蛇", "赤蛇", "青蛇", "黑蛇", "黄蛇",
  "大鸟", "小鸟", "白鸟", "赤鸟", "青鸟", "黑鸟", "黄鸟", "文鸟",
  "大鱼", "小鱼", "白鱼", "赤鱼", "青鱼", "黑鱼", "黄鱼", "文鱼",
  "天下", "其中", "其上", "其下", "其阳", "其阴", "此山", "此水", "此国",
  "东方", "西方", "南方", "北方", "中央", "海外", "海内", "大荒"
]);

const canonicalAliases = new Map([
  ["猼𫍙", "猼訑"],
  ["駮", "驳"],
  ["毫彘", "豪彘"],
  ["蠪蛭", "蠪侄"],
  ["禺彊", "禺强"],
  ["黄帝女魃", "女魃"],
  ["夏后开", "夏后启"],
  ["女娃", "精卫"],
  ["猩猩", "狌狌"],
  ["相繇", "相柳"],
  ["烛阴", "烛龙"],
  ["不周", "不周山"],
  ["祝馀", "祝余"],
  ["迷谷", "迷榖"]
]);

function stableHash(value) {
  return crypto.createHash("sha1").update(value, "utf8").digest("hex").slice(0, 16);
}

function normalizeName(value, kind = "") {
  let name = String(value || "")
    .replace(/[\s〈〉“”‘’《》【】（）()]/g, "")
    .replace(/[—–─-]{2,}.*$/, "")
    .replace(/[，。；：！？、].*$/, "")
    .replace(/^(?:其东有|西南有|海中有|故曰|或曰|一日|生此|是维|一云|又|有|曰|名曰|其名曰|一曰|是为|是谓|号曰)+/, "")
    .replace(/(?:之国|之山|之水)$/, "")
    .replace(/之$/, "")
    .trim();
  if (kind === "water") name = name.replace(/^(?:其上有|其下有|其阳|其阴)/, "");
  if (!name || name.length > 12 || rejectedNames.has(name)) return "";
  if (kind === "nation" && (/国曰|生/.test(name) || name.startsWith("以扶"))) return "";
  if (/^[一二三四五六七八九十百千万里]+$/.test(name)) return "";
  if (/^(?:东西南北|上下|左右|内外|前后){1,4}$/.test(name)) return "";
  if (/[的了而与及或乃于为以从向自多无皆凡若如其此]$/.test(name)) return "";
  return name;
}

function passageLinkTitle(passage) {
  return `${passage.chapterTitle} ${String(passage.order).padStart(3, "0")} · ${passageLabel(passage)}`;
}

function passageLabel(passage) {
  const text = passage.originalText;
  const patterns = [
    /(?:曰|名曰)([^，。；：]{1,12}?)(?:之山|山)(?=[，。；]|$)/,
    /有国名曰([^，。；：]{1,10})/,
    /有([^，。；：]{1,10}?)(?:之国|国)(?=[，。；在])/,
    /(?:其名曰|名曰)([^，。；：]{1,10})/
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const name = normalizeName(match?.[1]);
    if (name) return name;
  }
  const compact = text.replace(/[“”‘’〈〉]/g, "").replace(/\s+/g, "");
  return `${compact.slice(0, 14)}${compact.length > 14 ? "…" : ""}`;
}

function excerpt(value, length = 120) {
  const compact = String(value || "").replace(/\s+/g, " ").trim();
  return `${compact.slice(0, length)}${compact.length > length ? "…" : ""}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function externalLink(url, label) {
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
}

function addOccurrence(index, kind, rawName, passage) {
  const name = normalizeName(rawName, kind);
  if (!name) return;
  const key = `${kind}\u0000${name}`;
  const current = index.get(key) || { kind, name, occurrences: [] };
  if (!current.occurrences.some((item) => item.passageId === passage.id)) {
    current.occurrences.push({
      passageId: passage.id,
      passageTitle: passageLinkTitle(passage),
      chapterTitle: passage.chapterTitle,
      sectionTitle: passage.sectionTitle,
      excerpt: excerpt(passage.originalText)
    });
  }
  index.set(key, current);
}

function collectPattern(index, kind, passage, patterns) {
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(passage.originalText))) addOccurrence(index, kind, match[1], passage);
  }
}

function collectIntroducedNames(index, passage) {
  const text = passage.originalText;
  const introduction = /有(兽|鸟|鱼|蛇|虫|神|草|木|药)(?:焉)?[，。]/g;
  const starts = [];
  let match;
  while ((match = introduction.exec(text))) starts.push({ index: match.index, end: introduction.lastIndex, type: match[1] });
  const typeMap = { 兽: "creature", 鸟: "creature", 鱼: "creature", 蛇: "creature", 虫: "creature", 神: "deity", 草: "plant", 木: "plant", 药: "plant" };
  starts.forEach((item, position) => {
    const end = starts[position + 1]?.index ?? text.length;
    const segment = text.slice(item.end, Math.min(end, item.end + 360));
    const nameMatch = segment.match(/(?:其名曰|名曰)([^，。；：]{1,12})/);
    if (nameMatch) addOccurrence(index, typeMap[item.type], nameMatch[1], passage);
  });
}

function collectGeneralNamedTerms(index, passage) {
  const text = passage.originalText;
  const matcher = /(?:其名曰|名曰)([^，。；：]{1,12})/g;
  let match;
  while ((match = matcher.exec(text))) {
    const name = normalizeName(match[1]);
    const alreadyClassified = name && [...index.values()].some((item) =>
      item.name === name && item.occurrences.some((occurrence) => occurrence.passageId === passage.id)
    );
    if (!alreadyClassified) addOccurrence(index, "other", match[1], passage);
  }
}

function collectNationAliases(index, passage) {
  const matcher = /([^，。；：]{1,8})国曰([^，。；：]{1,8})国/g;
  let match;
  while ((match = matcher.exec(passage.originalText))) {
    addOccurrence(index, "nation", match[1], passage);
    addOccurrence(index, "nation", match[2], passage);
  }
}

function buildIndex(baseEntities) {
  const index = new Map();
  const passages = corpus.chapters.flatMap((chapter) => chapter.passages);
  for (const passage of passages) {
    collectPattern(index, "mountain", passage, [
      /(?:曰|名曰)([^，。；：]{1,12}?)(?:之山|山)(?=[，。；]|$)/g,
      /有山(?:焉)?，?(?:名)?曰([^，。；：]{1,12})/g
    ]);
    collectPattern(index, "water", passage, [
      /(?:^|[，。；])(?:有|其上有|其下有)?([^，。；：\s]{1,8}?)(?:之水|水)出焉/g,
      /(?:^|[，。；])有水(?:焉)?，?(?:名)?曰([^，。；：]{1,10})/g
    ]);
    collectPattern(index, "nation", passage, [
      /(?:^|[，。；])有国名曰([^，。；：]{1,10})/g,
      /(?:^|[，。；])(?:有)?([^，。；：]{1,8}?)(?:之国|国)(?=[，。；在]|$)/g
    ]);
    collectIntroducedNames(index, passage);
    collectGeneralNamedTerms(index, passage);
    collectNationAliases(index, passage);
  }

  const baseKind = {
    character: "deity",
    location: "mountain",
    faction: "nation",
    item: "plant",
    note: "creature"
  };
  for (const entity of baseEntities) {
    const title = normalizeName(entity.title);
    if (!title || title.length < 2 || entity.slug?.startsWith("classic-")) continue;
    for (const passage of passages) {
      if (passage.originalText.includes(title)) {
        addOccurrence(index, baseKind[entity.type] || "other", title, passage);
      }
    }
  }
  return [...index.values()].sort((left, right) =>
    left.kind.localeCompare(right.kind) || left.name.localeCompare(right.name, "zh-CN")
  );
}

function buildCategories(now, worldId, classicCategoryId) {
  const rootId = `category:${worldId}:shanhai-corpus`;
  const passageRootId = `category:${worldId}:shanhai-corpus-passages`;
  const indexRootId = `category:${worldId}:shanhai-corpus-index`;
  const rows = [
    [rootId, classicCategoryId, "原典内容全集", "十八篇全文、逐段定位、校注显示文本与固定修订来源。", "notes", "#28695d"],
    [passageRootId, rootId, "原典逐段", `按十八篇收录的 ${corpus.stats.passageCount} 个原文段落。`, "notes", "#397268"],
    [indexRootId, rootId, "名物出现索引", "由全文公式与既有校订条目生成的名物出现位置。", "notes", "#5c6570"]
  ];
  for (const chapter of corpus.chapters) {
    rows.push([
      `category:${worldId}:shanhai-corpus-${chapter.key}`,
      passageRootId,
      chapter.title,
      `${chapter.passages.length} 段，去注原文 ${chapter.characterCount.toLocaleString("zh-CN")} 字。`,
      "notes",
      "#4d7168"
    ]);
  }
  const colors = { mountain: "#477567", water: "#47728b", nation: "#786243", creature: "#a14c43", plant: "#5f7d4e", deity: "#8b623f", other: "#686a70" };
  const icons = { mountain: "locations", water: "locations", nation: "factions", creature: "notes", plant: "items", deity: "characters", other: "notes" };
  for (const kind of Object.keys(kindLabels)) {
    rows.push([
      `category:${worldId}:shanhai-index-${kind}`,
      indexRootId,
      kindLabels[kind],
      `${kindLabels[kind]}在完整原文中的出现索引。`,
      icons[kind],
      colors[kind]
    ]);
  }
  return rows.map(([id, parentId, title, description, icon, color], order) => ({
    id, worldId, parentId, title, description, icon, color, order: 100 + order, createdAt: now, updatedAt: now
  }));
}

function buildTemplate(now, worldId) {
  const fields = [
    ["corpusChapter", "原典篇目", "select", corpus.chapters.map((item) => item.title)],
    ["corpusSection", "篇内单元", "text", []],
    ["passageId", "稳定段落编号", "text", []],
    ["sourceRevision", "来源修订号", "text", []],
    ["sourceUrl", "固定来源", "text", []],
    ["occurrenceCount", "出现次数", "text", []],
    ["occurrencePassageIds", "出现段落编号", "textarea", []],
    ["reviewStatus", "整理状态", "select", ["开放底本原文", "项目初校", "规则复核", "人工确认"]],
    ["indexKind", "索引类别", "text", []],
    ["normalizedName", "规范名称", "text", []],
    ["reviewEvidence", "复核证据", "textarea", []],
    ["ambiguityNote", "同名说明", "textarea", []],
    ["visualKind", "图鉴类型", "text", []],
    ["requiresIllustration", "需要独立图鉴", "select", ["是", "否"]],
    ["plainLanguageVersion", "白话释读版本", "text", []],
    ["plainLanguageMethod", "白话释读方法", "text", []]
  ];
  return {
    id: `template:${worldId}:shanhai-corpus`,
    worldId,
    name: "山海经原典全集模板",
    description: "记录完整原文段落、固定来源与名物出现位置，不混入现代改编。",
    entityTypes: ["character", "location", "faction", "item", "note"],
    fields: fields.map(([key, label, type, options], order) => ({
      id: `template-field:${worldId}:shanhai-corpus:${key}`,
      key, label, type, required: ["corpusChapter", "sourceUrl", "reviewStatus"].includes(key),
      secret: false, defaultValue: "", options, targetEntityTypes: [], order
    })),
    builtIn: false,
    createdAt: now,
    updatedAt: now
  };
}

function chapterContent(chapter) {
  const lines = [
    `<h1>${escapeHtml(chapter.title)}</h1>`,
    "<h2>底本与范围</h2>",
    `<p>本条收录《${escapeHtml(chapter.title)}》完整去注原文，共 ${chapter.passages.length} 段、${chapter.characterCount.toLocaleString("zh-CN")} 字。段落条目另存维基文库校注显示文本、郭璞注与异文。</p>`,
    "<ul>",
    `<li>维基文库固定修订：${externalLink(chapter.sourceRevisionUrl, String(chapter.sourceRevisionId))}</li>`,
    `<li>中国哲学书电子化计划复核入口：${externalLink(chapter.ctextUrl, chapter.title)}</li>`,
    "<li>说明：地图方位不自动等同现代经纬度；现代白话和创作改编不得写回原文层。</li>",
    "</ul>"
  ];
  let section = "";
  for (const passage of chapter.passages) {
    if (passage.sectionTitle !== section) {
      section = passage.sectionTitle;
      lines.push(`<h2>${escapeHtml(section)}</h2>`);
    }
    lines.push(`<p id="${escapeHtml(passage.id)}"><strong>${String(passage.order).padStart(3, "0")}</strong>　${escapeHtml(passage.originalText)}</p>`);
    lines.push(`<blockquote><strong>项目白话释读：</strong>${escapeHtml(passage.plainLanguageText)}</blockquote>`);
  }
  return lines.join("");
}

function buildPassageEntities(now, worldId) {
  const entities = [];
  for (const chapter of corpus.chapters) {
    for (const passage of chapter.passages) {
      const annotations = passage.annotations.length
        ? `<ul>${passage.annotations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
        : "<p>本段在当前开放底本中没有单列的尖括号注释或“一作”异文。</p>";
      entities.push({
        id: `entity-shanhai-passage-${passage.id.replace(/^corpus-/, "")}`,
        worldId,
        type: "note",
        title: passageLinkTitle(passage),
        slug: passage.id,
        summary: excerpt(passage.originalText, 90),
        content: [
          "<h2>原文（去注）</h2>",
          `<p>${escapeHtml(passage.originalText)}</p>`,
          "<h2>项目白话释读</h2>",
          `<p>${escapeHtml(passage.plainLanguageText)}</p>`,
          `<p><small>${escapeHtml(passage.plainLanguageReviewStatus)} · ${escapeHtml(passage.plainLanguageMethod)}</small></p>`,
          "<h2>郭璞注与异文</h2>",
          annotations,
          "<h2>校注显示文本</h2>",
          `<p>${escapeHtml(passage.annotatedText)}</p>`,
          "<h2>精确定位</h2>",
          "<ul>",
          `<li>篇目：${escapeHtml(chapter.title)}</li>`,
          `<li>篇内单元：${escapeHtml(passage.sectionTitle)}</li>`,
          `<li>稳定编号：<code>${escapeHtml(passage.id)}</code></li>`,
          `<li>固定修订：${externalLink(chapter.sourceRevisionUrl, `维基文库 ${chapter.sourceRevisionId}`)}</li>`,
          `<li>复核入口：${externalLink(chapter.ctextUrl, "中国哲学书电子化计划")}</li>`,
          "</ul>"
        ].join(""),
        tags: ["山海经", "原典全文", chapter.title, passage.sectionTitle, passage.id],
        visibility: "shared",
        createdBy: "user-owner",
        updatedAt: now,
        categoryId: `category:${worldId}:shanhai-corpus-${chapter.key}`,
        order: passage.order,
        templateId: `template:${worldId}:shanhai-corpus`,
        templateData: {
          corpusChapter: chapter.title,
          corpusSection: passage.sectionTitle,
          passageId: passage.id,
          sourceRevision: String(chapter.sourceRevisionId),
          sourceUrl: chapter.sourceRevisionUrl,
          occurrenceCount: "",
          occurrencePassageIds: "",
          reviewStatus: passage.plainLanguageReviewStatus,
          plainLanguageVersion: passage.plainLanguageVersion,
          plainLanguageMethod: passage.plainLanguageMethod
        }
      });
    }
  }
  return entities;
}

function occurrenceSection(term) {
  const visible = term.occurrences.slice(0, 40);
  const lines = [
    "<h2>全集出现位置</h2>",
    `<p>该名称在完整语料中出现于 ${term.occurrences.length} 个段落。以下引用仅表示字面出现，不自动断言同名对象一定相同。</p>`,
    "<ul>"
  ];
  for (const item of visible) lines.push(`<li><strong>${escapeHtml(item.passageTitle)}</strong>：${escapeHtml(item.excerpt)}</li>`);
  if (visible.length < term.occurrences.length) lines.push(`<li>其余 ${term.occurrences.length - visible.length} 处可通过稳定段落编号检索。</li>`);
  lines.push("</ul>");
  return lines.join("");
}

function compatibleTitles(term) {
  const titles = new Set([term.name]);
  if (canonicalAliases.has(term.name)) titles.add(canonicalAliases.get(term.name));
  if (term.kind === "mountain" && !term.name.endsWith("山")) titles.add(`${term.name}山`);
  if (term.kind === "water" && !term.name.endsWith("水")) titles.add(`${term.name}水`);
  if (term.kind === "nation" && !term.name.endsWith("国")) titles.add(`${term.name}国`);
  return titles;
}

function matchingBaseEntity(term, baseEntities) {
  const expectedType = kindTypes[term.kind];
  const titles = [...compatibleTitles(term)];
  const typedMatch = titles.map((title) =>
    baseEntities.find((item) => item.type === expectedType && item.title === title && !item.slug?.startsWith("classic-"))
  ).find(Boolean);
  if (typedMatch) return typedMatch;
  if (term.kind === "other" || canonicalAliases.has(term.name)) {
    return titles.map((title) =>
      baseEntities.find((item) => item.title === title && !item.slug?.startsWith("classic-"))
    ).find(Boolean);
  }
  return undefined;
}

const visualTermOverrides = new Map([
  ["碧阳", { visualKind: "location", requiresIllustration: false }],
  ["三淖", { visualKind: "location", requiresIllustration: false }],
  ["菌人", { visualKind: "figure", requiresIllustration: true }],
  ["灵恝", { visualKind: "figure", requiresIllustration: true }],
  ["女丑", { visualKind: "figure", requiresIllustration: true }],
  ["女虔", { visualKind: "figure", requiresIllustration: true }],
  ["三骓", { visualKind: "creature", requiresIllustration: true }],
  ["天犬", { visualKind: "creature", requiresIllustration: true }],
  ["育蛇", { visualKind: "creature", requiresIllustration: true }],
  ["戎宣王尸", { visualKind: "creature", requiresIllustration: true }]
]);

function classifyIndexTerm(term) {
  if (visualTermOverrides.has(term.name)) return visualTermOverrides.get(term.name);
  if (term.kind === "creature") return { visualKind: "creature", requiresIllustration: true };
  if (term.kind === "deity") return { visualKind: "figure", requiresIllustration: true };
  if (term.kind === "plant") return { visualKind: "artifact", requiresIllustration: true };
  if (term.kind === "mountain" || term.kind === "water") return { visualKind: "location", requiresIllustration: false };
  if (term.kind === "nation") return { visualKind: "faction", requiresIllustration: false };

  const name = term.name;
  const evidence = term.occurrences.map((item) => item.excerpt).join(" ");
  if (/(?:山|水|渊|谷|丘|泽|坛|堂|冢|井|野|林)$/.test(name)) {
    return { visualKind: "location", requiresIllustration: false };
  }
  if (/(?:国|民)$/.test(name)) return { visualKind: "faction", requiresIllustration: false };
  if (/(?:木|桑|松|栾|草|华)$/.test(name) || /(?:有木|有树|有草)[^。；]{0,80}(?:名曰|其名曰)/.test(evidence)) {
    return { visualKind: "artifact", requiresIllustration: true };
  }
  if (
    /(?:鸟|蛇|鱼|兽|狗|鼠|狐|马|鵹|鴸|鵸|䳜|䴔|蛩蛩|双双|吉量|猎猎|罗罗|猩猩|驺吾)$/.test(name)
    || /(?:有兽|有鸟|有鱼|有蛇|有虫|文马|青兽)[^。；]{0,100}(?:名曰|其名曰)/.test(evidence)
  ) {
    return { visualKind: "creature", requiresIllustration: true };
  }
  if (
    /(?:女|母|父|尸|王|高|均|回|夷|开|献|丹|吴)$/.test(name)
    || /(?:有人|有神)[^。；]{0,100}(?:名曰|其名曰)/.test(evidence)
  ) {
    return { visualKind: "figure", requiresIllustration: true };
  }
  return { visualKind: "artifact", requiresIllustration: true };
}

function visualDisplayLabel(term, visual = classifyIndexTerm(term)) {
  if (term.kind !== "other") return kindLabels[term.kind];
  return { creature: "异兽形态", figure: "人物原型", artifact: "草木神物" }[visual.visualKind]
    || kindLabels[term.kind];
}

function matchedBaseTermMap(terms, baseEntities) {
  const result = new Map();
  for (const term of terms) {
    const entity = matchingBaseEntity(term, baseEntities);
    if (!entity) continue;
    const current = result.get(entity.id);
    if (!current || term.occurrences.length > current.occurrences.length) result.set(entity.id, term);
  }
  return result;
}

function buildIndexEntities(now, worldId, terms, baseEntities) {
  const matchedTerms = new Set(terms.filter((term) => matchingBaseEntity(term, baseEntities)));
  const nameCounts = terms.reduce((counts, term) => counts.set(term.name, (counts.get(term.name) || 0) + 1), new Map());
  return terms.filter((term) => !matchedTerms.has(term)).map((term, order) => {
    const ambiguous = (nameCounts.get(term.name) || 0) > 1;
    const visual = classifyIndexTerm(term);
    const displayLabel = visualDisplayLabel(term, visual);
    const reviewEvidence = `已回查 ${term.occurrences.length} 个原文段落；名称均由“名曰”“之山”“之水”“之国”等对应句式定位，并保留稳定段落编号。`;
    const ambiguityNote = ambiguous
      ? `“${term.name}”在多个索引类别中出现；当前条目按“${displayLabel}”（规则来源：${kindLabels[term.kind]}）保留，未自动合并不同语义。`
      : "当前全集索引中未发现跨类别同名项。";
    return {
      id: `entity-shanhai-index-${term.kind}-${stableHash(term.name)}`,
      worldId,
      type: kindTypes[term.kind],
      title: ambiguous ? `${term.name}（${displayLabel}）` : term.name,
      slug: `corpus-index-${term.kind}-${stableHash(term.name)}`,
      summary: `${kindLabels[term.kind]}名物，在完整原典中出现于 ${term.occurrences.length} 个段落。`,
      content: [
        "<h2>索引说明</h2>",
        `<p>本条由完整原文中的稳定命名句式建立，分类为“${escapeHtml(kindLabels[term.kind])}”。它用于全文检索与出现位置追踪，不把同名对象自动合并。</p>`,
        "<h2>规则复核</h2>",
        `<p>${escapeHtml(reviewEvidence)}</p>`,
        `<p>${escapeHtml(ambiguityNote)}</p>`,
        occurrenceSection(term)
      ].join(""),
      tags: ["山海经", "全集名物", kindLabels[term.kind], "规则复核"],
      visibility: "shared",
      createdBy: "user-owner",
      updatedAt: now,
      categoryId: `category:${worldId}:shanhai-index-${term.kind}`,
      order,
      templateId: `template:${worldId}:shanhai-corpus`,
      templateData: {
        corpusChapter: term.occurrences[0]?.chapterTitle || "",
        corpusSection: term.occurrences[0]?.sectionTitle || "",
        passageId: term.occurrences[0]?.passageId || "",
        sourceRevision: "",
        sourceUrl: corpus.sources.primary,
        occurrenceCount: String(term.occurrences.length),
        occurrencePassageIds: term.occurrences.map((item) => item.passageId).join(", "),
        reviewStatus: "规则复核",
        indexKind: kindLabels[term.kind],
        normalizedName: term.name,
        reviewEvidence,
        ambiguityNote,
        visualKind: visual.visualKind,
        requiresIllustration: visual.requiresIllustration ? "是" : "否"
      }
    };
  });
}

function enrichBaseEntities(baseEntities, terms, volumeEntityIds) {
  const baseTerms = matchedBaseTermMap(terms, baseEntities);
  const chapterByEntityId = new Map(Object.entries(volumeEntityIds).map(([key, id]) => [id, corpus.chapters.find((item) => item.key === key)]));
  return baseEntities.map((entity) => {
    const chapter = chapterByEntityId.get(entity.id);
    if (chapter) {
      return {
        ...entity,
        summary: `完整收录《${chapter.title}》${chapter.passages.length} 段去注原文，并保存固定修订与逐段校注入口。`,
        content: chapterContent(chapter),
        tags: [...new Set([...(entity.tags || []), "原典全文", "固定修订", `${chapter.passages.length}段`])],
        templateData: {
          ...entity.templateData,
          adaptationRole: "本条为完整原典阅读入口；现代改编内容仅通过关联条目引用。",
          sourceUrl: chapter.sourceRevisionUrl
        }
      };
    }
    const term = baseTerms.get(entity.id);
    if (!term) return entity;
    return {
      ...entity,
      content: `${entity.content}\n\n${occurrenceSection(term)}`,
      tags: [...new Set([...(entity.tags || []), "全集索引", `${term.occurrences.length}处原文`])]
    };
  });
}

function buildShanhaiCorpusData(now, options) {
  const { worldId, classicCategoryId, baseEntities, volumeEntityIds } = options;
  const terms = buildIndex(baseEntities);
  const enrichedBase = enrichBaseEntities(baseEntities, terms, volumeEntityIds);
  const passageEntities = buildPassageEntities(now, worldId);
  const indexEntities = buildIndexEntities(now, worldId, terms, enrichedBase);
  return {
    corpus,
    categories: buildCategories(now, worldId, classicCategoryId),
    templates: [buildTemplate(now, worldId)],
    entities: [...enrichedBase, ...passageEntities, ...indexEntities],
    stats: {
      ...corpus.stats,
      sectionCount: corpus.chapters.reduce((total, item) => total + item.sections.length, 0),
      indexTermCount: terms.length,
      newIndexEntityCount: indexEntities.length,
      entityCount: enrichedBase.length + passageEntities.length + indexEntities.length
    },
    terms
  };
}

module.exports = {
  buildIndex,
  buildShanhaiCorpusData,
  classifyIndexTerm,
  corpus,
  kindLabels,
  matchingBaseEntity,
  normalizeName,
  passageLinkTitle,
  stableHash
};
