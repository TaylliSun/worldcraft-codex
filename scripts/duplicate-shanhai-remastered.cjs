const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

const root = path.resolve(__dirname, "..");
const executablePath = require("electron");
const userDataDir = path.join(
  process.env.APPDATA || path.join(process.env.USERPROFILE, "AppData", "Roaming"),
  "worldcraft-codex"
);
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "shanhai-remastered-publication-audit.json");
const screenshotPath = path.join(validationDir, "shanhai-remastered-wiki.png");

const SOURCE_WORLD_NAME = "山海经 · 原典内容全集";
const INTERMEDIATE_WORLD_NAME = `${SOURCE_WORLD_NAME} 副本`;
const TARGET_WORLD_NAME = `${SOURCE_WORLD_NAME}重制版`;
const TARGET_DESCRIPTION =
  "《山海经》十八篇完整知识库，收录原文、现代汉语译文，并整理山川、水系、异兽、神祇、国族、草木与神物条目。";

const WORLD_ID_COLLECTIONS = [
  "entityTemplates",
  "codexCategories",
  "entities",
  "mapRoutes",
  "timelineTracks",
  "timelineEvents",
  "quests",
  "storyVariables",
  "storyScenes",
  "storyTestPresets",
  "storyTestRuns",
  "storyReviewIssues",
  "narrativeMilestones",
  "manuscriptBooks",
  "manuscriptVolumes",
  "manuscriptChapters",
  "manuscriptScenes",
  "manuscriptClues",
  "manuscriptKnowledgeStates",
  "consistencyFindings",
  "consistencyScans",
  "consistencySettings",
  "consistencyModelSettings",
  "aiMemoryItems",
  "aiWritingSessions",
  "aiOperationRuns",
  "relations",
  "assets",
  "members"
];
const MAP_ID_COLLECTIONS = ["mapLayers", "mapMarkerGroups", "mapMarkers"];

function electronEnvironment() {
  const env = {
    ...process.env,
    ELECTRON_START_URL: process.env.ELECTRON_START_URL || "http://127.0.0.1:3000",
    WORLDCRAFT_USER_DATA_DIR: userDataDir
  };
  delete env.ELECTRON_RUN_AS_NODE;
  return env;
}

async function launchDesktop() {
  return electron.launch({
    executablePath,
    args: ["."],
    cwd: root,
    env: electronEnvironment(),
    timeout: 60000
  });
}

async function waitForWorkspace(app) {
  const page = await app.firstWindow({ timeout: 60000 });
  await page.waitForLoadState("domcontentloaded");
  await page.waitForFunction(() => Boolean(window.worldcraftStore?.loadWorkspace), null, {
    timeout: 60000
  });
  await page.locator(".compact-save-status").waitFor({ state: "visible", timeout: 60000 });
  await page.waitForFunction(
    () => document.querySelector(".compact-save-status")?.textContent?.includes("SQLite"),
    null,
    { timeout: 60000 }
  );
  await page.locator(".world-menu-current").waitFor({ state: "visible", timeout: 60000 });
  return page;
}

async function selectWorld(page, name) {
  const current = (await page.locator(".world-menu-current").textContent())?.trim();
  if (current === name) return;
  await page.getByLabel("切换世界").click();
  await page.getByRole("button", { name, exact: true }).click();
  await page.waitForFunction(
    (expected) => document.querySelector(".world-menu-current")?.textContent?.trim() === expected,
    name,
    { timeout: 60000 }
  );
}

async function sourceSignature(page) {
  return page.evaluate(
    async ({ sourceName, worldCollections, mapCollections }) => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const data = loaded.data;
      const world = data.worlds.find((item) => item.name === sourceName);
      if (!world) throw new Error(`未找到原版世界：${sourceName}`);
      const maps = data.maps.filter((item) => item.worldId === world.id);
      const mapIds = new Set(maps.map((item) => item.id));
      const snapshot = {
        world,
        maps,
        ...Object.fromEntries(
          worldCollections.map((collection) => [
            collection,
            data[collection].filter((item) => item.worldId === world.id)
          ])
        ),
        ...Object.fromEntries(
          mapCollections.map((collection) => [
            collection,
            data[collection].filter((item) => mapIds.has(item.mapId))
          ])
        )
      };
      const serialized = JSON.stringify(snapshot);
      let hash = 2166136261;
      for (let index = 0; index < serialized.length; index += 1) {
        hash ^= serialized.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return {
        worldId: world.id,
        bytes: serialized.length,
        hash: (hash >>> 0).toString(16).padStart(8, "0")
      };
    },
    {
      sourceName: SOURCE_WORLD_NAME,
      worldCollections: WORLD_ID_COLLECTIONS,
      mapCollections: MAP_ID_COLLECTIONS
    }
  );
}

async function duplicateIfNeeded(page) {
  const initial = await page.evaluate(async () => {
    const loaded = await window.worldcraftStore.loadWorkspace();
    return loaded.data.worlds.map((world) => ({
      id: world.id,
      name: world.name,
      createdAt: world.createdAt
    }));
  });
  assert.ok(initial.some((world) => world.name === SOURCE_WORLD_NAME), "原版山海经世界存在");

  const existingTarget = initial.filter((world) => world.name === TARGET_WORLD_NAME);
  assert.ok(existingTarget.length <= 1, "重制版世界只能存在一份");
  if (existingTarget.length === 1) return { targetId: existingTarget[0].id, created: false };

  const intermediate = initial.filter((world) => world.name === INTERMEDIATE_WORLD_NAME);
  assert.ok(intermediate.length <= 1, "未完成的山海经副本只能存在一份");
  if (intermediate.length === 1) return { targetId: intermediate[0].id, created: false };

  await selectWorld(page, SOURCE_WORLD_NAME);
  await page.getByLabel("切换世界").click();
  await page.locator(".world-menu-settings > summary").click();
  await page.getByRole("button", { name: "复制当前世界", exact: true }).click();
  await page.waitForFunction(
    (expected) => document.querySelector(".world-menu-current")?.textContent?.trim() === expected,
    INTERMEDIATE_WORLD_NAME,
    { timeout: 180000 }
  );
  await page.waitForFunction(
    async (expected) => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      return loaded.data.worlds.some((world) => world.name === expected);
    },
    INTERMEDIATE_WORLD_NAME,
    { timeout: 180000 }
  );
  const duplicated = await page.evaluate(async (name) => {
    const loaded = await window.worldcraftStore.loadWorkspace();
    return loaded.data.worlds.find((world) => world.name === name)?.id || "";
  }, INTERMEDIATE_WORLD_NAME);
  assert.ok(duplicated, "软件自身的世界复制流程已持久化副本");
  return { targetId: duplicated, created: true };
}

async function sanitizeTarget(page, targetId) {
  return page.evaluate(
    async ({
      sourceName,
      targetName,
      targetDescription,
      targetId: requestedTargetId,
      worldCollections,
      mapCollections
    }) => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const data = loaded.data;
      const sourceWorld = data.worlds.find((world) => world.name === sourceName);
      const targetWorld = data.worlds.find((world) => world.id === requestedTargetId);
      if (!sourceWorld) throw new Error(`未找到原版世界：${sourceName}`);
      if (!targetWorld) throw new Error(`未找到待整理副本：${requestedTargetId}`);

      const stats = {
        externalLinksRemoved: 0,
        externalMediaRemoved: 0,
        providerSourceBlocksRemoved: 0,
        providerMentionsRemoved: 0,
        publicationLabelsRewritten: 0,
        duplicateTemplatesRemoved: 0,
        templateFieldsRemoved: 0,
        structuredFieldsRemoved: 0
      };
      const externalTest = /(?:https?|ftp):\/\/|(?:mailto|tel):|(?:https?|ftp)%3a%2f%2f|\bwww\./i;
      const externalGlobal = /(?:https?|ftp):\/\/[^\s<>"')\]}]+|(?:mailto|tel):[^\s<>"')\]}]+|(?:https?|ftp)%3a%2f%2f[^\s<>"')\]}]+|\bwww\.[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s<>"')\]}]*)?/gi;
      const providerTest = /维基文库|維基文庫|Wikisource|中国哲学书电子化计划|中國哲學書電子化計劃|ctext(?:\.org)?|api\.openai\.com/i;
      const providerGlobal = /维基文库|維基文庫|Wikisource|中国哲学书电子化计划|中國哲學書電子化計劃|(?:zh\.)?wikisource\.org|ctext\.org|api\.openai\.com/gi;
      const providerSourceTest = /原典索引|固定来源|固定修订|复核入口|原典入口|来源网址|外部链接|第三方(?:连接|链接)/i;
      const forbiddenKeyTest = /^(?:sourceUrl|sourceRevisionUrl|externalUrl|externalLink|websiteUrl|referenceUrl|originalUrl|thirdPartyUrl)$/i;
      const forbiddenTemplateFieldTest = /source\s*(?:url|link)|revision\s*url|external\s*(?:url|link)|website\s*url|reference\s*url|原典索引|固定来源|来源网址|外部链接|第三方(?:连接|链接)/i;

      const isExternal = (value) => {
        const text = String(value || "").trim();
        return externalTest.test(text) || /(?:^|[/.])(?:wikisource\.org|ctext\.org|api\.openai\.com)(?:[/:]|$)/i.test(text);
      };

      const cleanPlainText = (value, removeProviderLines = true) => {
        let text = String(value ?? "");
        if (!text) return text;
        if (removeProviderLines && text.includes("\n")) {
          text = text
            .split(/\r?\n/)
            .filter((line) => !(providerTest.test(line) && (isExternal(line) || providerSourceTest.test(line))))
            .join("\n");
        }
        text = text.replace(/\[([^\]]*)\]\(((?:https?|ftp):\/\/|(?:mailto|tel):)[^)]+\)/gi, (_match, label) => {
          stats.externalLinksRemoved += 1;
          return label.trim();
        });
        text = text.replace(externalGlobal, () => {
          stats.externalLinksRemoved += 1;
          return "";
        });
        text = text.replace(providerGlobal, () => {
          stats.providerMentionsRemoved += 1;
          return "";
        });
        const replacements = [
          [/原典索引/g, "篇章索引"],
          [/原典入口/g, "篇章入口"],
          [/固定来源/g, "资料版本"],
          [/固定修订/g, "整理版本"],
          [/复核入口/g, "复核说明"],
          [/外部链接/g, ""],
          [/第三方(?:连接|链接)/g, ""]
        ];
        replacements.forEach(([pattern, replacement]) => {
          text = text.replace(pattern, () => {
            stats.publicationLabelsRewritten += 1;
            return replacement;
          });
        });
        return text
          .replace(/[ \t]+([，。；：、])/g, "$1")
          .replace(/([：:])\s*(?=(?:。|；|;|$))/g, "")
          .replace(/[ \t]{2,}/g, " ")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      };

      const sanitizeHtml = (value) => {
        const documentNode = new DOMParser().parseFromString(String(value), "text/html");
        documentNode.querySelectorAll("script, iframe, embed, object, link").forEach((element) => {
          if (isExternal(element.getAttribute("src") || element.getAttribute("href") || element.getAttribute("data") || "")) {
            stats.externalMediaRemoved += 1;
          }
          element.remove();
        });
        documentNode.querySelectorAll("a[href]").forEach((anchor) => {
          const href = anchor.getAttribute("href") || "";
          if (!isExternal(href)) return;
          stats.externalLinksRemoved += 1;
          const sourceBlock = anchor.closest("li, p, blockquote");
          if (sourceBlock && (providerTest.test(sourceBlock.textContent || "") || providerSourceTest.test(sourceBlock.textContent || ""))) {
            sourceBlock.remove();
            stats.providerSourceBlocksRemoved += 1;
            return;
          }
          anchor.replaceWith(documentNode.createTextNode(anchor.textContent?.trim() || ""));
        });
        documentNode.querySelectorAll("*").forEach((element) => {
          for (const attribute of Array.from(element.attributes)) {
            if (isExternal(attribute.value)) {
              element.removeAttribute(attribute.name);
              stats.externalLinksRemoved += 1;
            }
          }
          const style = element.getAttribute("style");
          if (style && /url\(\s*['\"]?(?:https?|ftp):\/\//i.test(style)) {
            element.removeAttribute("style");
            stats.externalLinksRemoved += 1;
          }
        });
        const textNodes = [];
        const walker = documentNode.createTreeWalker(documentNode.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        textNodes.forEach((node) => {
          node.textContent = cleanPlainText(node.textContent || "", false);
        });
        Array.from(documentNode.querySelectorAll("li, p, blockquote, div, section"))
          .reverse()
          .forEach((element) => {
            const hasMedia = element.querySelector("img, video, audio, table, hr, br");
            if (!element.textContent?.trim() && !hasMedia) element.remove();
          });
        return documentNode.body.innerHTML.trim();
      };

      const sanitizeString = (value) => {
        const text = String(value ?? "");
        return /<\/?[a-z][\s\S]*>/i.test(text) ? sanitizeHtml(text) : cleanPlainText(text);
      };

      const sanitizeObject = (value) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === "string") value[index] = sanitizeString(item);
            else sanitizeObject(item);
          });
          return;
        }
        if (!value || typeof value !== "object") return;
        Object.keys(value).forEach((key) => {
          if (forbiddenKeyTest.test(key)) {
            delete value[key];
            stats.structuredFieldsRemoved += 1;
            return;
          }
          if (typeof value[key] === "string") value[key] = sanitizeString(value[key]);
          else sanitizeObject(value[key]);
        });
      };

      const sourceMaps = data.maps.filter((item) => item.worldId === sourceWorld.id);
      const targetMaps = data.maps.filter((item) => item.worldId === targetWorld.id);
      const targetMapIds = new Set(targetMaps.map((item) => item.id));
      const sourceItems = (collection) => data[collection].filter((item) => item.worldId === sourceWorld.id);
      const targetItems = (collection) => data[collection].filter((item) => item.worldId === targetWorld.id);
      const matchId = (sourceId, sourceList, targetList, fingerprint) => {
        if (!sourceId) return "";
        const source = sourceList.find((item) => item.id === sourceId);
        if (!source) return "";
        const sourceFingerprint = fingerprint(source);
        return targetList.find((item) => fingerprint(item) === sourceFingerprint)?.id || "";
      };
      const mapIds = (ids, sourceList, targetList, fingerprint) =>
        Array.from(new Set((Array.isArray(ids) ? ids : [])
          .map((id) => matchId(id, sourceList, targetList, fingerprint))
          .filter(Boolean)));

      const sourceWiki = sourceWorld.wiki || {};
      const sourceAssets = sourceItems("assets");
      const targetAssets = targetItems("assets");
      const sourceCategories = sourceItems("codexCategories");
      const targetCategories = targetItems("codexCategories");
      const sourceEntities = sourceItems("entities");
      const targetEntities = targetItems("entities");
      const sourceTracks = sourceItems("timelineTracks");
      const targetTracks = targetItems("timelineTracks");
      const sourceQuests = sourceItems("quests");
      const targetQuests = targetItems("quests");
      targetWorld.wiki = {
        ...sourceWiki,
        coverAssetId: matchId(
          sourceWiki.coverAssetId,
          sourceAssets,
          targetAssets,
          (item) => `${item.storedName || ""}|${item.name || ""}|${item.size || 0}`
        ),
        navigationCategoryIds: mapIds(
          sourceWiki.navigationCategoryIds,
          sourceCategories,
          targetCategories,
          (item) => `${item.title}|${item.order}`
        ),
        featuredEntityIds: mapIds(
          sourceWiki.featuredEntityIds,
          sourceEntities,
          targetEntities,
          (item) => item.slug || `${item.type}|${item.title}`
        ),
        defaultMapId: matchId(sourceWiki.defaultMapId, sourceMaps, targetMaps, (item) => item.title),
        publishedMapIds: mapIds(sourceWiki.publishedMapIds, sourceMaps, targetMaps, (item) => item.title),
        publishedTimelineTrackIds: mapIds(
          sourceWiki.publishedTimelineTrackIds,
          sourceTracks,
          targetTracks,
          (item) => item.name
        ),
        publishedQuestIds: mapIds(
          sourceWiki.publishedQuestIds,
          sourceQuests,
          targetQuests,
          (item) => item.title
        )
      };

      const sourceBuiltInTemplateNames = new Set(
        sourceItems("entityTemplates").filter((template) => template.builtIn).map((template) => template.name)
      );
      const targetTemplateList = targetItems("entityTemplates");
      const targetBuiltInByName = new Map(
        targetTemplateList.filter((template) => template.builtIn).map((template) => [template.name, template])
      );
      const duplicateTemplateIdMap = new Map();
      targetTemplateList.forEach((template) => {
        if (template.builtIn || !sourceBuiltInTemplateNames.has(template.name)) return;
        const canonical = targetBuiltInByName.get(template.name);
        if (canonical) duplicateTemplateIdMap.set(template.id, canonical.id);
      });
      if (duplicateTemplateIdMap.size) {
        data.entityTemplates = data.entityTemplates.filter((template) => {
          if (template.worldId !== targetWorld.id || !duplicateTemplateIdMap.has(template.id)) return true;
          stats.duplicateTemplatesRemoved += 1;
          return false;
        });
        targetEntities.forEach((entity) => {
          entity.templateId = duplicateTemplateIdMap.get(entity.templateId) || entity.templateId;
        });
      }

      const removedTemplateKeys = new Set();
      targetItems("entityTemplates").forEach((template) => {
        template.fields = template.fields.filter((field) => {
          const descriptor = [field.id, field.key, field.label].filter(Boolean).join(" ");
          if (!forbiddenTemplateFieldTest.test(descriptor)) return true;
          removedTemplateKeys.add(field.id);
          removedTemplateKeys.add(field.key);
          stats.templateFieldsRemoved += 1;
          return false;
        });
      });
      targetEntities.forEach((entity) => {
        Object.keys(entity.templateData || {}).forEach((key) => {
          if (removedTemplateKeys.has(key) || forbiddenTemplateFieldTest.test(key)) {
            delete entity.templateData[key];
            stats.structuredFieldsRemoved += 1;
          }
        });
      });

      const targetObjects = [targetWorld, ...targetMaps];
      worldCollections.forEach((collection) => targetObjects.push(...targetItems(collection)));
      mapCollections.forEach((collection) => {
        targetObjects.push(...data[collection].filter((item) => targetMapIds.has(item.mapId)));
      });
      targetObjects.forEach(sanitizeObject);
      targetEntities.forEach((entity) => {
        entity.tags = Array.from(new Set((entity.tags || []).map(sanitizeString).filter(Boolean)));
      });
      targetWorld.name = targetName;
      targetWorld.description = targetDescription;
      targetWorld.updatedAt = new Date().toISOString();

      const saveResult = await window.worldcraftStore.saveWorkspace(
        data,
        "duplicate-shanhai-remastered-publication-sanitize"
      );
      if (!saveResult?.ok) throw new Error(saveResult?.error || "重制版保存失败");
      return {
        targetId: targetWorld.id,
        stats,
        saveResult: {
          ok: saveResult.ok,
          savedAt: saveResult.savedAt,
          schemaVersion: saveResult.schemaVersion
        }
      };
    },
    {
      sourceName: SOURCE_WORLD_NAME,
      targetName: TARGET_WORLD_NAME,
      targetDescription: TARGET_DESCRIPTION,
      targetId,
      worldCollections: WORLD_ID_COLLECTIONS,
      mapCollections: MAP_ID_COLLECTIONS
    }
  );
}

async function verifyTarget(page, expectedSourceSignature) {
  return page.evaluate(
    async ({
      sourceName,
      targetName,
      targetDescription,
      worldCollections,
      mapCollections,
      expectedSourceSignature
    }) => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const data = loaded.data;
      const sourceWorlds = data.worlds.filter((world) => world.name === sourceName);
      const targetWorlds = data.worlds.filter((world) => world.name === targetName);
      if (sourceWorlds.length !== 1) throw new Error(`原版世界数量异常：${sourceWorlds.length}`);
      if (targetWorlds.length !== 1) throw new Error(`重制版世界数量异常：${targetWorlds.length}`);
      const sourceWorld = sourceWorlds[0];
      const targetWorld = targetWorlds[0];
      const sourceMaps = data.maps.filter((item) => item.worldId === sourceWorld.id);
      const targetMaps = data.maps.filter((item) => item.worldId === targetWorld.id);
      const sourceMapIds = new Set(sourceMaps.map((item) => item.id));
      const targetMapIds = new Set(targetMaps.map((item) => item.id));
      const sourceItems = (collection) => data[collection].filter((item) => item.worldId === sourceWorld.id);
      const targetItems = (collection) => data[collection].filter((item) => item.worldId === targetWorld.id);

      const countMismatches = [];
      for (const collection of ["maps", ...worldCollections]) {
        const sourceCount = collection === "maps" ? sourceMaps.length : sourceItems(collection).length;
        const targetCount = collection === "maps" ? targetMaps.length : targetItems(collection).length;
        if (sourceCount !== targetCount) countMismatches.push({ collection, sourceCount, targetCount });
      }
      for (const collection of mapCollections) {
        const sourceCount = data[collection].filter((item) => sourceMapIds.has(item.mapId)).length;
        const targetCount = data[collection].filter((item) => targetMapIds.has(item.mapId)).length;
        if (sourceCount !== targetCount) countMismatches.push({ collection, sourceCount, targetCount });
      }

      const targetObjects = [targetWorld, ...targetMaps];
      worldCollections.forEach((collection) => targetObjects.push(...targetItems(collection)));
      mapCollections.forEach((collection) => {
        targetObjects.push(...data[collection].filter((item) => targetMapIds.has(item.mapId)));
      });
      const externalTest = /(?:https?|ftp):\/\/|(?:mailto|tel):|(?:https?|ftp)%3a%2f%2f|\bwww\.|(?:^|[/.])(?:wikisource\.org|ctext\.org|api\.openai\.com)(?:[/:]|$)/i;
      const providerTest = /维基文库|維基文庫|Wikisource|中国哲学书电子化计划|中國哲學書電子化計劃|ctext(?:\.org)?|api\.openai\.com/i;
      const publicationLabelTest = /原典索引|原典入口|固定来源|固定修订|复核入口|外部链接|第三方(?:连接|链接)/i;
      const forbiddenKeyTest = /^(?:sourceUrl|sourceRevisionUrl|externalUrl|externalLink|websiteUrl|referenceUrl|originalUrl|thirdPartyUrl)$/i;
      const hits = { external: [], providers: [], labels: [], forbiddenKeys: [] };
      let internalReferenceCount = 0;
      const scan = (value, path = "") => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => scan(item, `${path}[${index}]`));
          return;
        }
        if (!value || typeof value !== "object") {
          if (typeof value !== "string") return;
          if (externalTest.test(value)) hits.external.push(path);
          if (providerTest.test(value)) hits.providers.push(path);
          if (publicationLabelTest.test(value)) hits.labels.push(path);
          internalReferenceCount += (value.match(/\[\[[^\]]+\]\]|data-project-reference|worldcraft:\/\//g) || []).length;
          return;
        }
        Object.entries(value).forEach(([key, child]) => {
          const childPath = path ? `${path}.${key}` : key;
          if (forbiddenKeyTest.test(key)) hits.forbiddenKeys.push(childPath);
          scan(child, childPath);
        });
      };
      targetObjects.forEach((item, index) => scan(item, `target[${index}]`));

      const sourceSnapshot = {
        world: sourceWorld,
        maps: sourceMaps,
        ...Object.fromEntries(worldCollections.map((collection) => [collection, sourceItems(collection)])),
        ...Object.fromEntries(mapCollections.map((collection) => [
          collection,
          data[collection].filter((item) => sourceMapIds.has(item.mapId))
        ]))
      };
      const serializedSource = JSON.stringify(sourceSnapshot);
      let sourceHash = 2166136261;
      for (let index = 0; index < serializedSource.length; index += 1) {
        sourceHash ^= serializedSource.charCodeAt(index);
        sourceHash = Math.imul(sourceHash, 16777619);
      }
      const currentSourceSignature = {
        worldId: sourceWorld.id,
        bytes: serializedSource.length,
        hash: (sourceHash >>> 0).toString(16).padStart(8, "0")
      };

      const targetEntityIds = new Set(targetItems("entities").map((item) => item.id));
      const sourceEntityIds = new Set(sourceItems("entities").map((item) => item.id));
      const targetAssetIds = new Set(targetItems("assets").map((item) => item.id));
      const targetCategoryIds = new Set(targetItems("codexCategories").map((item) => item.id));
      const targetTrackIds = new Set(targetItems("timelineTracks").map((item) => item.id));
      const targetQuestIds = new Set(targetItems("quests").map((item) => item.id));
      const wiki = targetWorld.wiki || {};
      const wikiReferencesValid = Boolean(wiki.coverAssetId && targetAssetIds.has(wiki.coverAssetId))
        && (wiki.navigationCategoryIds || []).every((id) => targetCategoryIds.has(id))
        && (wiki.featuredEntityIds || []).every((id) => targetEntityIds.has(id))
        && Boolean(wiki.defaultMapId && targetMapIds.has(wiki.defaultMapId))
        && (wiki.publishedMapIds || []).every((id) => targetMapIds.has(id))
        && (wiki.publishedTimelineTrackIds || []).every((id) => targetTrackIds.has(id))
        && (wiki.publishedQuestIds || []).every((id) => targetQuestIds.has(id));
      const relationsValid = targetItems("relations").every((relation) =>
        targetEntityIds.has(relation.sourceEntityId) && targetEntityIds.has(relation.targetEntityId)
      );
      const mapChildrenValid = mapCollections.every((collection) =>
        data[collection]
          .filter((item) => targetMapIds.has(item.mapId))
          .every((item) => !sourceMapIds.has(item.mapId))
      );
      const originalExternalMentions = [];
      scanSource(sourceSnapshot, originalExternalMentions);

      function scanSource(value, result) {
        if (Array.isArray(value)) {
          value.forEach((item) => scanSource(item, result));
        } else if (value && typeof value === "object") {
          Object.values(value).forEach((item) => scanSource(item, result));
        } else if (typeof value === "string" && (externalTest.test(value) || providerTest.test(value))) {
          result.push(true);
        }
      }

      return {
        sourceId: sourceWorld.id,
        targetId: targetWorld.id,
        targetName: targetWorld.name,
        targetDescription: targetWorld.description,
        sourceSignatureUnchanged: JSON.stringify(currentSourceSignature) === JSON.stringify(expectedSourceSignature),
        sourceSignature: currentSourceSignature,
        originalExternalMentionFields: originalExternalMentions.length,
        countMismatches,
        counts: Object.fromEntries([
          "entities",
          "maps",
          "quests",
          "storyScenes",
          "manuscriptChapters",
          "aiMemoryItems",
          "relations",
          "assets"
        ].map((collection) => [
          collection,
          collection === "maps" ? targetMaps.length : targetItems(collection).length
        ])),
        targetEntityIdsOverlapSource: targetItems("entities").some((item) => sourceEntityIds.has(item.id)),
        relationsValid,
        mapChildrenValid,
        wikiReferencesValid,
        wikiCounts: {
          navigationCategories: wiki.navigationCategoryIds?.length || 0,
          featuredEntities: wiki.featuredEntityIds?.length || 0,
          publishedMaps: wiki.publishedMapIds?.length || 0,
          publishedTimelineTracks: wiki.publishedTimelineTrackIds?.length || 0,
          publishedQuests: wiki.publishedQuestIds?.length || 0
        },
        internalReferenceCount,
        forbiddenHits: {
          external: hits.external.slice(0, 20),
          providers: hits.providers.slice(0, 20),
          labels: hits.labels.slice(0, 20),
          forbiddenKeys: hits.forbiddenKeys.slice(0, 20),
          totals: Object.fromEntries(Object.entries(hits).map(([key, value]) => [key, value.length]))
        },
        descriptionMatches: targetWorld.description === targetDescription
      };
    },
    {
      sourceName: SOURCE_WORLD_NAME,
      targetName: TARGET_WORLD_NAME,
      targetDescription: TARGET_DESCRIPTION,
      worldCollections: WORLD_ID_COLLECTIONS,
      mapCollections: MAP_ID_COLLECTIONS,
      expectedSourceSignature
    }
  );
}

async function openWikiArticle(page) {
  await selectWorld(page, TARGET_WORLD_NAME);
  const wikiButton = page.getByRole("button", { name: "世界总览", exact: true });
  if (!(await wikiButton.isVisible())) {
    await page.locator(".rail-more > summary").click();
    await wikiButton.waitFor({ state: "visible" });
  }
  await wikiButton.click();
  await page.locator(".wiki-workspace").waitFor({ state: "visible", timeout: 60000 });
  await page.getByRole("heading", { name: TARGET_WORLD_NAME, exact: true }).waitFor({ timeout: 60000 });
  const featured = page.locator(".wiki-featured-section .wiki-entry-row").first();
  await featured.waitFor({ state: "visible", timeout: 60000 });
  await featured.click();
  await page.locator(".wiki-rich-content").waitFor({ state: "visible", timeout: 60000 });
  const renderedAudit = await page.locator(".wiki-article").evaluate((article) => ({
    externalLinks: article.querySelectorAll(
      'a[href^="http://"], a[href^="https://"], a[href^="ftp://"], a[href^="mailto:"], a[href^="tel:"]'
    ).length,
    forbiddenText: /维基文库|維基文庫|Wikisource|中国哲学书电子化计划|中國哲學書電子化計劃|ctext(?:\.org)?|原典索引|固定来源/.test(article.textContent || "")
  }));
  await page.screenshot({ path: screenshotPath, fullPage: false });
  return renderedAudit;
}

async function main() {
  fs.mkdirSync(validationDir, { recursive: true });
  let mutationApp;
  let verificationApp;
  let backup;
  let duplication;
  let sanitation;
  let sourceBefore;
  try {
    mutationApp = await launchDesktop();
    const page = await waitForWorkspace(mutationApp);
    sourceBefore = await sourceSignature(page);
    backup = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      return window.worldcraftStore.createCompleteBackup(loaded.data);
    });
    assert.equal(backup?.ok, true, backup?.error || "创建完整备份失败");
    duplication = await duplicateIfNeeded(page);
    sanitation = await sanitizeTarget(page, duplication.targetId);
  } finally {
    if (mutationApp) await mutationApp.close().catch(() => {});
  }

  let verification;
  let renderedAudit;
  try {
    verificationApp = await launchDesktop();
    const page = await waitForWorkspace(verificationApp);
    verification = await verifyTarget(page, sourceBefore);
    assert.equal(verification.sourceSignatureUnchanged, true, "原版山海经数据必须保持不变");
    assert.ok(verification.originalExternalMentionFields > 0, "原版仍保留原始来源资料，证明清理只作用于复制品");
    assert.deepEqual(verification.countMismatches, [], "重制版保留全部世界数据集合");
    assert.equal(verification.targetEntityIdsOverlapSource, false, "重制版条目 ID 与原版独立");
    assert.equal(verification.relationsValid, true, "重制版关系全部指向重制版条目");
    assert.equal(verification.mapChildrenValid, true, "重制版地图子对象全部指向重制版地图");
    assert.equal(verification.wikiReferencesValid, true, "重制版 Wiki 发布目录全部指向重制版资源");
    assert.equal(verification.descriptionMatches, true, "重制版简介不再提及固定来源");
    assert.ok(verification.internalReferenceCount > 0, "内部条目引用仍被保留");
    assert.deepEqual(
      verification.forbiddenHits.totals,
      { external: 0, providers: 0, labels: 0, forbiddenKeys: 0 },
      "重制版中的第三方链接、服务名与来源字段全部清零"
    );
    renderedAudit = await openWikiArticle(page);
    assert.deepEqual(renderedAudit, { externalLinks: 0, forbiddenText: false }, "Wiki 实际渲染页不含第三方链接");
  } finally {
    if (verificationApp) await verificationApp.close().catch(() => {});
  }

  const report = {
    generatedAt: new Date().toISOString(),
    sourceWorld: SOURCE_WORLD_NAME,
    targetWorld: TARGET_WORLD_NAME,
    backup: {
      ok: backup.ok,
      filePath: backup.filePath || backup.path || "",
      assetCount: backup.assetCount,
      missingAssets: backup.missingAssets
    },
    duplication,
    sanitation,
    verification,
    renderedAudit,
    screenshotPath
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ ok: true, reportPath, ...report }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
