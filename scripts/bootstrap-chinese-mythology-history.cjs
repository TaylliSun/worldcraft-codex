const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createProjectPackage } = require("../electron/project-package.cjs");
const { WorkspaceStore, WORKSPACE_COLLECTIONS } = require("../electron/workspace-store.cjs");
const {
  ORIGINAL_ADAPTATION_NOTICE,
  WORLD_ID,
  WORLD_NAME,
  buildMythologyFoundation
} = require("./chinese-mythology-history-data.cjs");

const root = path.resolve(__dirname, "..");
const packageVersion = require("../package.json").version;
const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");
const assetDir = path.join(userDataDir, "assets");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "chinese-mythology-history-foundation.json");

function timestampForFile(value) {
  return value.replace(/[:.]/g, "-");
}

function ensureCollections(data) {
  for (const collection of WORKSPACE_COLLECTIONS) {
    if (!Array.isArray(data[collection])) data[collection] = [];
  }
}

function replaceById(existing, additions) {
  const ids = new Set(additions.map((item) => item.id));
  return [...additions, ...existing.filter((item) => !ids.has(item.id))];
}

function mergeValidIds(managedIds, previousIds, validIds) {
  return [...new Set([
    ...(managedIds || []),
    ...(previousIds || []).filter((id) => validIds.has(id))
  ])];
}

async function createCompleteBackup(data, now) {
  fs.mkdirSync(backupDir, { recursive: true });
  const targetPath = path.join(
    backupDir,
    `worldcraft-codex-complete-before-mythology-foundation-${timestampForFile(now)}.wcodex`
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

function applyFoundation(data, now) {
  ensureCollections(data);
  const previousWorld = data.worlds.find((item) => item.id === WORLD_ID)
    || data.worlds.find((item) => item.name === WORLD_NAME);
  const worldId = previousWorld?.id || WORLD_ID;
  const foundation = buildMythologyFoundation(now, worldId);

  const validCategoryIds = new Set([
    ...data.codexCategories.map((item) => item.id),
    ...foundation.categories.map((item) => item.id)
  ]);
  const validEntityIds = new Set([
    ...data.entities.map((item) => item.id),
    ...foundation.entities.map((item) => item.id)
  ]);
  const validTrackIds = new Set([
    ...data.timelineTracks.map((item) => item.id),
    ...foundation.timelineTracks.map((item) => item.id)
  ]);
  const previousWiki = previousWorld?.wiki || {};
  foundation.world.createdAt = previousWorld?.createdAt || now;
  foundation.world.visibility = previousWorld?.visibility || foundation.world.visibility;
  foundation.world.description = previousWorld?.description?.trim() || foundation.world.description;
  foundation.world.wiki = {
    ...foundation.world.wiki,
    ...previousWiki,
    themeColor: previousWiki.themeColor || foundation.world.wiki.themeColor,
    navigationCategoryIds: mergeValidIds(
      foundation.world.wiki.navigationCategoryIds,
      previousWiki.navigationCategoryIds,
      validCategoryIds
    ),
    featuredEntityIds: mergeValidIds(
      foundation.world.wiki.featuredEntityIds,
      previousWiki.featuredEntityIds,
      validEntityIds
    ),
    publishedTimelineTrackIds: mergeValidIds(
      foundation.world.wiki.publishedTimelineTrackIds,
      previousWiki.publishedTimelineTrackIds,
      validTrackIds
    )
  };

  data.worlds = replaceById(data.worlds, [foundation.world]);
  data.codexCategories = replaceById(data.codexCategories, foundation.categories);
  data.entityTemplates = replaceById(data.entityTemplates, foundation.templates);
  data.entities = replaceById(data.entities, foundation.entities);
  data.timelineTracks = replaceById(data.timelineTracks, foundation.timelineTracks);
  data.aiMemoryItems = replaceById(data.aiMemoryItems, foundation.aiMemoryItems);
  if (!data.members.some((item) => item.worldId === worldId && item.role === "owner")) {
    data.members = replaceById(data.members, [foundation.member]);
  }
  return { foundation, worldId };
}

function auditFoundation(data, worldId) {
  const managed = buildMythologyFoundation("2000-01-01T00:00:00.000Z", worldId);
  const managedTemplateIds = new Set(managed.templates.map((item) => item.id));
  const managedEntityIds = new Set(managed.entities.map((item) => item.id));
  const managedTrackIds = new Set(managed.timelineTracks.map((item) => item.id));
  const managedMemoryIds = new Set(managed.aiMemoryItems.map((item) => item.id));
  const world = data.worlds.find((item) => item.id === worldId);
  assert.ok(world, "中国上古神话史世界不存在");
  const categories = data.codexCategories.filter((item) => item.worldId === worldId);
  const categoryIds = new Set(categories.map((item) => item.id));
  const templates = data.entityTemplates.filter(
    (item) => item.worldId === worldId && managedTemplateIds.has(item.id)
  );
  const entities = data.entities.filter(
    (item) => item.worldId === worldId && managedEntityIds.has(item.id)
  );
  const tracks = data.timelineTracks.filter(
    (item) => item.worldId === worldId && managedTrackIds.has(item.id)
  );
  const memories = data.aiMemoryItems.filter(
    (item) => item.worldId === worldId && managedMemoryIds.has(item.id)
  );
  const externalLinkHits = entities
    .filter((item) => /(?:https?|ftp):\/\/|\bwww\./i.test(`${item.summary}\n${item.content}`))
    .map((item) => item.title);
  const templateIssues = templates.flatMap((template) => {
    const keys = template.fields.map((field) => field.key);
    const unique = new Set(keys);
    return unique.size === keys.length ? [] : [template.name];
  });
  const categoryParentIssues = categories
    .filter((item) => item.parentId && !categoryIds.has(item.parentId))
    .map((item) => item.title);
  const entityCategoryIssues = entities
    .filter((item) => !categoryIds.has(item.categoryId))
    .map((item) => item.title);
  const wikiNavigationIssues = (world.wiki?.navigationCategoryIds || [])
    .filter((id) => !categoryIds.has(id));
  const wikiTrackIssues = (world.wiki?.publishedTimelineTrackIds || [])
    .filter((id) => !tracks.some((track) => track.id === id)
      && !data.timelineTracks.some((track) => track.worldId === worldId && track.id === id));
  const originalityEntities = entities.filter((item) => item.content.includes(ORIGINAL_ADAPTATION_NOTICE));
  return {
    world: { id: world.id, name: world.name, visibility: world.visibility },
    counts: {
      categories: categories.length,
      customTemplates: templates.length,
      foundationEntities: entities.length,
      timelineTracks: tracks.length,
      pinnedAiRules: memories.filter((item) => item.pinned && item.state === "confirmed").length,
      originalityNotices: originalityEntities.length
    },
    categoryParentIssues,
    entityCategoryIssues,
    templateIssues,
    wikiNavigationIssues,
    wikiTrackIssues,
    externalLinkHits
  };
}

async function main() {
  assert.ok(fs.existsSync(dbPath), `未找到数据库：${dbPath}`);
  fs.mkdirSync(validationDir, { recursive: true });
  const store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  let backup;
  let saveStats;
  let worldId;
  try {
    const loaded = store.load();
    assert.ok(loaded.data, "工作区数据库为空");
    const now = new Date().toISOString();
    backup = await createCompleteBackup(loaded.data, now);
    ({ worldId } = applyFoundation(loaded.data, now));
    saveStats = store.save(loaded.data, "bootstrap-chinese-mythology-history-foundation");
  } finally {
    store.close();
  }

  const verifyStore = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  let audit;
  let diagnostics;
  try {
    const persisted = verifyStore.load().data;
    audit = auditFoundation(persisted, worldId);
    diagnostics = verifyStore.diagnostics();
  } finally {
    verifyStore.close();
  }

  assert.equal(audit.world.name, WORLD_NAME);
  assert.equal(audit.counts.categories, 46);
  assert.equal(audit.counts.customTemplates, 5);
  assert.equal(audit.counts.foundationEntities, 8);
  assert.equal(audit.counts.timelineTracks, 4);
  assert.equal(audit.counts.pinnedAiRules, 6);
  assert.ok(audit.counts.originalityNotices >= 2);
  assert.deepEqual(audit.categoryParentIssues, []);
  assert.deepEqual(audit.entityCategoryIssues, []);
  assert.deepEqual(audit.templateIssues, []);
  assert.deepEqual(audit.wikiNavigationIssues, []);
  assert.deepEqual(audit.wikiTrackIssues, []);
  assert.deepEqual(audit.externalLinkHits, []);
  assert.equal(diagnostics.ok, true);

  const report = {
    generatedAt: new Date().toISOString(),
    phase: "中国上古神话史 · 阶段 0",
    backup: backup.targetPath,
    saveStats,
    audit,
    diagnostics: {
      ok: diagnostics.ok,
      schemaVersion: diagnostics.schemaVersion,
      quickCheck: diagnostics.quickCheck,
      foreignKeyIssues: diagnostics.foreignKeyIssues,
      dbPath: diagnostics.dbPath
    }
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

module.exports = { applyFoundation, auditFoundation };
