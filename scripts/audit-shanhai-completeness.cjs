const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { WorkspaceStore } = require("../electron/workspace-store.cjs");
const { corpus, buildShanhaiCorpusData } = require("./shanhai-corpus-data.cjs");
const { VERSION: plainLanguageVersion } = require("./shanhai-plain-language.cjs");
const {
  MAIN_MAP_ID,
  WORLD_ID,
  buildShanhaiCaseData,
  classicVolumes,
  illustratedRecords
} = require("./shanhai-case-data.cjs");

const root = path.resolve(__dirname, "..");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "shanhai-completeness-audit.json");
const visualAssetDir = path.join(root, "assets", "shanhai");
const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");

function countBy(items, getKey) {
  return items.reduce((counts, item) => {
    const key = getKey(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function sourceAudit() {
  const passages = corpus.chapters.flatMap((chapter) => chapter.passages);
  const missingPlainLanguage = passages
    .filter((passage) => !String(passage.plainLanguageText || "").trim())
    .map((passage) => passage.id);
  const missingPlainLanguageReview = passages
    .filter((passage) => !String(passage.plainLanguageReviewStatus || "").trim())
    .map((passage) => passage.id);
  const invalidSourcePassages = passages
    .filter((passage) =>
      /https?:\/\//i.test(passage.originalText)
      || /[【〖]\s*[】〗]/.test(passage.originalText)
      || !/[\u3400-\u9fff]/u.test(passage.originalText)
    )
    .map((passage) => passage.id);
  const fallbackPlainLanguage = passages
    .filter((passage) => passage.plainLanguageText === passage.originalText || passage.plainLanguageText.startsWith("本段记述的是："))
    .map((passage) => passage.id);
  const outdatedPlainLanguage = passages
    .filter((passage) => passage.plainLanguageVersion !== plainLanguageVersion)
    .map((passage) => passage.id);
  const stackedRuleArtifacts = passages
    .filter((passage) => /(?:一座一座|这里有这里|位于位于|并且并且)/.test(passage.plainLanguageText))
    .map((passage) => passage.id);
  return {
    chapterCount: corpus.chapters.length,
    passageCount: passages.length,
    sourceCharacterCount: corpus.stats.characterCount,
    missingPlainLanguageCount: missingPlainLanguage.length,
    missingPlainLanguageReviewCount: missingPlainLanguageReview.length,
    invalidSourcePassageCount: invalidSourcePassages.length,
    fallbackPlainLanguageCount: fallbackPlainLanguage.length,
    outdatedPlainLanguageCount: outdatedPlainLanguage.length,
    stackedRuleArtifactCount: stackedRuleArtifacts.length,
    missingPlainLanguage: missingPlainLanguage.slice(0, 20),
    missingPlainLanguageReview: missingPlainLanguageReview.slice(0, 20),
    invalidSourcePassages: invalidSourcePassages.slice(0, 20),
    fallbackPlainLanguage: fallbackPlainLanguage.slice(0, 20),
    outdatedPlainLanguage: outdatedPlainLanguage.slice(0, 20),
    stackedRuleArtifacts: stackedRuleArtifacts.slice(0, 20)
  };
}

function generatedAudit() {
  const now = "2026-07-17T00:00:00.000Z";
  const generated = buildShanhaiCaseData(now, "worldcraft://asset/main.png", {
    fiveClassics: "worldcraft://asset/five.png",
    seaClassics: "worldcraft://asset/sea.png"
  });
  const corpusData = buildShanhaiCorpusData(now, {
    worldId: WORLD_ID,
    classicCategoryId: generated.categories.find((item) => !item.parentId)?.id || "",
    baseEntities: generated.entities.filter((item) => !item.id.startsWith("entity-shanhai-passage-") && !item.id.startsWith("entity-shanhai-index-")),
    volumeEntityIds: {}
  });
  const categories = new Map(generated.categories.map((item) => [item.id, item.title]));
  const entitiesByCategory = countBy(generated.entities, (item) => categories.get(item.categoryId) || item.categoryId || "未分类");
  const pendingIndexEntries = generated.entities.filter((item) =>
    item.id.startsWith("entity-shanhai-index-")
    && !["规则复核", "人工确认"].includes(item.templateData?.reviewStatus)
  );
  const targetCategoryKinds = new Map([
    [`category:${WORLD_ID}:shanhai-creature`, "creature"],
    [`category:${WORLD_ID}:shanhai-deity`, "figure"],
    [`category:${WORLD_ID}:shanhai-artifact`, "artifact"],
    [`category:${WORLD_ID}:shanhai-adaptation`, "character"]
  ]);
  const requiredIllustrationTargets = generated.entities.flatMap((entity) => {
    const canonicalKind = targetCategoryKinds.get(entity.categoryId);
    const indexKind = entity.id.startsWith("entity-shanhai-index-")
      && entity.templateData?.requiresIllustration === "是"
      ? entity.templateData.visualKind
      : "";
    const kind = canonicalKind || indexKind;
    return kind ? [{ entityId: entity.id, title: entity.title, kind }] : [];
  });
  const catalogByEntityId = new Map(illustratedRecords.map((item) => [
    `entity-shanhai-${item.key}`,
    item
  ]));
  const requiredEntityIds = new Set(requiredIllustrationTargets.map((item) => item.entityId));
  const missingCatalogTargets = requiredIllustrationTargets.filter((item) => !catalogByEntityId.has(item.entityId));
  const unexpectedCatalogRecords = illustratedRecords.filter((item) => !requiredEntityIds.has(`entity-shanhai-${item.key}`));
  const visualTargets = countBy(requiredIllustrationTargets, (item) => item.kind);
  const illustratedByKind = countBy(illustratedRecords, (item) => item.kind);
  const missingIllustrationFiles = illustratedRecords.filter((item) =>
    !fs.existsSync(path.join(visualAssetDir, `${item.key}.png`))
  );
  const expectedMapFiles = [
    "shanhai-map-base.png",
    "map-five-classics.png",
    "map-sea-classics.png",
    ...classicVolumes.map((volume) => `map-volume-${volume.key}.png`)
  ];
  const missingMapFiles = expectedMapFiles.filter((filename) => !fs.existsSync(path.join(visualAssetDir, filename)));
  const expectedVisualFiles = new Set([
    ...expectedMapFiles,
    ...illustratedRecords.map((item) => `${item.key}.png`)
  ]);
  const unexpectedVisualFiles = fs.readdirSync(visualAssetDir)
    .filter((filename) => filename.endsWith(".png") && !expectedVisualFiles.has(filename));
  return {
    entityCount: generated.entities.length,
    entitiesByCategory,
    indexTermCount: corpusData.stats.indexTermCount,
    pendingIndexCount: pendingIndexEntries.length,
    pendingIndexExamples: pendingIndexEntries.slice(0, 20).map((item) => item.title),
    mapInventory: {
      requiredTotal: expectedMapFiles.length,
      missingAssetFileCount: missingMapFiles.length,
      missingAssetFiles: missingMapFiles
    },
    visualTargets,
    illustrationInventory: {
      requiredTotal: requiredIllustrationTargets.length,
      total: illustratedRecords.length,
      byKind: illustratedByKind,
      missingCatalogCount: missingCatalogTargets.length,
      missingCatalogByKind: countBy(missingCatalogTargets, (item) => item.kind),
      missingCatalogTargets: missingCatalogTargets.slice(0, 30),
      unexpectedCatalogCount: unexpectedCatalogRecords.length,
      unexpectedCatalogRecords: unexpectedCatalogRecords.slice(0, 30).map((item) => ({ key: item.key, title: item.title, kind: item.kind })),
      missingAssetFileCount: missingIllustrationFiles.length,
      missingAssetFilesByKind: countBy(missingIllustrationFiles, (item) => item.kind),
      missingAssetFiles: missingIllustrationFiles.slice(0, 30).map((item) => `${item.key}.png`),
      unexpectedAssetFileCount: unexpectedVisualFiles.length,
      unexpectedAssetFiles: unexpectedVisualFiles.slice(0, 30)
    }
  };
}

function databaseAudit() {
  if (!fs.existsSync(dbPath)) return { available: false, dbPath };
  const store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  try {
    const data = store.load().data;
    if (!data) return { available: true, dbPath, empty: true };
    const worldMaps = data.maps.filter((item) => item.worldId === WORLD_ID);
    const worldAssets = data.assets.filter((item) => item.worldId === WORLD_ID);
    const worldEntities = data.entities.filter((item) => item.worldId === WORLD_ID);
    const worldBooks = data.manuscriptBooks.filter((item) => item.worldId === WORLD_ID);
    const worldVolumes = data.manuscriptVolumes.filter((item) => item.worldId === WORLD_ID);
    const worldChapters = data.manuscriptChapters.filter((item) => item.worldId === WORLD_ID);
    const expectedIllustrationAssetIds = new Set(illustratedRecords.map((item) => `asset-shanhai-${item.key}`));
    const expectedIllustrationEntityIds = new Set(illustratedRecords.map((item) => `entity-shanhai-${item.key}`));
    const expectedMapIds = new Set([
      MAIN_MAP_ID,
      "map-shanhai-five-classics",
      "map-shanhai-sea-classics",
      ...classicVolumes.map((volume) => `map-shanhai-volume-${volume.key}`)
    ]);
    const expectedMapAssetIds = new Set([
      "asset-shanhai-map-base",
      "asset-shanhai-map-five-classics",
      "asset-shanhai-map-sea-classics",
      ...classicVolumes.map((volume) => `asset-shanhai-map-volume-${volume.key}`)
    ]);
    const illustrationAssets = worldAssets.filter((item) => expectedIllustrationAssetIds.has(item.id));
    const mapAssets = worldAssets.filter((item) => expectedMapAssetIds.has(item.id));
    const expectedAssets = [...illustrationAssets, ...mapAssets];
    const missingPhysicalAssets = expectedAssets.filter((item) =>
      !item.storedName || !fs.existsSync(path.join(userDataDir, "assets", item.storedName))
    );
    const linkedEntityIds = new Set(worldAssets.flatMap((item) => item.linkedEntityIds || []));
    const linkedIllustrationEntityIds = new Set(illustrationAssets.flatMap((item) => item.linkedEntityIds || []));
    const pendingIndex = worldEntities.filter((item) =>
      item.id.startsWith("entity-shanhai-index-")
      && !["规则复核", "人工确认"].includes(item.templateData?.reviewStatus)
    );
    return {
      available: true,
      dbPath,
      entityCount: worldEntities.length,
      assetCount: worldAssets.length,
      linkedEntityCount: linkedEntityIds.size,
      illustrationAssetCount: illustrationAssets.length,
      missingIllustrationAssetCount: expectedIllustrationAssetIds.size - illustrationAssets.length,
      missingIllustrationLinkCount: Array.from(expectedIllustrationEntityIds).filter((id) => !linkedIllustrationEntityIds.has(id)).length,
      missingIllustrationLinks: Array.from(expectedIllustrationEntityIds).filter((id) => !linkedIllustrationEntityIds.has(id)).slice(0, 30),
      expectedMapCount: expectedMapIds.size,
      missingExpectedMapCount: Array.from(expectedMapIds).filter((id) => !worldMaps.some((item) => item.id === id)).length,
      missingExpectedMaps: Array.from(expectedMapIds).filter((id) => !worldMaps.some((item) => item.id === id)),
      mapAssetCount: mapAssets.length,
      missingMapAssetCount: expectedMapAssetIds.size - mapAssets.length,
      missingPhysicalAssetCount: missingPhysicalAssets.length,
      missingPhysicalAssets: missingPhysicalAssets.slice(0, 30).map((item) => ({ id: item.id, storedName: item.storedName || "" })),
      pendingIndexCount: pendingIndex.length,
      maps: worldMaps.map((item) => ({
        id: item.id,
        title: item.title,
        parentMapId: item.parentMapId || "",
        hasBaseImage: Boolean(item.imageUrl)
      })),
      childMapsWithoutBaseImage: worldMaps
        .filter((item) => item.parentMapId && !item.imageUrl)
        .map((item) => ({ id: item.id, title: item.title })),
      generatedManuscriptChapterCount: worldChapters.filter((item) => item.id.startsWith("manuscript-chapter-shanhai-")).length,
      legacyManuscriptBooks: worldBooks
        .filter((item) => !item.id.startsWith("manuscript-book-shanhai-"))
        .map((item) => ({ id: item.id, title: item.title })),
      legacyManuscriptVolumes: worldVolumes
        .filter((item) => !item.id.startsWith("manuscript-volume-shanhai-"))
        .map((item) => ({ id: item.id, title: item.title })),
      legacyManuscriptChapters: worldChapters
        .filter((item) => !item.id.startsWith("manuscript-chapter-shanhai-"))
        .map((item) => ({ id: item.id, title: item.title }))
    };
  } finally {
    store.close();
  }
}

function main() {
  const source = sourceAudit();
  const generated = generatedAudit();
  const database = databaseAudit();
  const gaps = {
    databaseUnavailable: database.available ? 0 : 1,
    missingPlainLanguage: source.missingPlainLanguageCount,
    missingPlainLanguageReview: source.missingPlainLanguageReviewCount,
    invalidSourcePassages: source.invalidSourcePassageCount,
    fallbackPlainLanguage: source.fallbackPlainLanguageCount,
    outdatedPlainLanguage: source.outdatedPlainLanguageCount,
    stackedPlainLanguageRules: source.stackedRuleArtifactCount,
    pendingIndex: generated.pendingIndexCount,
    missingIllustrationCatalogRecords: generated.illustrationInventory.missingCatalogCount,
    unexpectedIllustrationCatalogRecords: generated.illustrationInventory.unexpectedCatalogCount,
    missingIllustrationFiles: generated.illustrationInventory.missingAssetFileCount,
    unexpectedVisualAssetFiles: generated.illustrationInventory.unexpectedAssetFileCount,
    missingMapFiles: generated.mapInventory.missingAssetFileCount,
    missingDatabaseIllustrationAssets: database.missingIllustrationAssetCount || 0,
    missingDatabaseIllustrationLinks: database.missingIllustrationLinkCount || 0,
    missingDatabaseMaps: database.missingExpectedMapCount || 0,
    missingDatabaseMapAssets: database.missingMapAssetCount || 0,
    missingDatabasePhysicalAssets: database.missingPhysicalAssetCount || 0,
    childMapsWithoutBaseImage: database.childMapsWithoutBaseImage?.length || 0,
    legacyManuscriptBooks: database.legacyManuscriptBooks?.length || 0,
    legacyManuscriptVolumes: database.legacyManuscriptVolumes?.length || 0,
    legacyManuscriptChapters: database.legacyManuscriptChapters?.length || 0
  };
  const report = {
    generatedAt: new Date().toISOString(),
    complete: Object.values(gaps).every((value) => value === 0),
    source,
    generated,
    database,
    gaps
  };
  fs.mkdirSync(validationDir, { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ complete: report.complete, reportPath, gaps }, null, 2));
  if (process.argv.includes("--strict") && !report.complete) process.exitCode = 1;
}

main();
