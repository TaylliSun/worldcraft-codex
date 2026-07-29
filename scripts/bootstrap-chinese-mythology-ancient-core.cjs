const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createProjectPackage } = require("../electron/project-package.cjs");
const { WorkspaceStore, WORKSPACE_COLLECTIONS } = require("../electron/workspace-store.cjs");
const { buildMythologyFoundation } = require("./chinese-mythology-history-data.cjs");
const { buildAncientCoreBatch } = require("./chinese-mythology-ancient-core-data.cjs");
const { applyFoundation } = require("./bootstrap-chinese-mythology-history.cjs");

const root = path.resolve(__dirname, "..");
const packageVersion = require("../package.json").version;
const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");
const assetDir = path.join(userDataDir, "assets");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "chinese-mythology-ancient-core-01.json");

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

function unique(values) {
  return [...new Set(values)];
}

async function createCompleteBackup(data, now) {
  fs.mkdirSync(backupDir, { recursive: true });
  const targetPath = path.join(
    backupDir,
    `worldcraft-codex-complete-before-mythology-ancient-core-01-${timestampForFile(now)}.wcodex`
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

function applyAncientCoreBatch(data, now) {
  ensureCollections(data);
  const { foundation, worldId } = applyFoundation(data, now);
  const batch = buildAncientCoreBatch(now, worldId);

  data.entities = replaceById(data.entities, batch.entities);
  data.relations = replaceById(data.relations, batch.relations);
  data.timelineEvents = replaceById(data.timelineEvents, batch.timelineEvents);

  const world = data.worlds.find((item) => item.id === worldId);
  assert.ok(world, "中国上古神话史世界不存在");
  const validEntityIds = new Set(data.entities.filter((item) => item.worldId === worldId).map((item) => item.id));
  const managedIds = new Set([
    ...foundation.world.wiki.featuredEntityIds,
    ...batch.entities.map((item) => item.id)
  ]);
  const userFeatured = (world.wiki?.featuredEntityIds || [])
    .filter((id) => validEntityIds.has(id) && !managedIds.has(id));
  world.wiki = {
    ...(world.wiki || {}),
    featuredEntityIds: unique([
      ...batch.featuredEntityIds,
      ...userFeatured,
      ...foundation.world.wiki.featuredEntityIds
    ]).slice(0, 12)
  };
  data.worlds = replaceById(data.worlds, [world]);
  return { batch, worldId };
}

function auditAncientCoreBatch(data, worldId) {
  const expected = buildAncientCoreBatch("2000-01-01T00:00:00.000Z", worldId);
  const expectedEntityIds = new Set(expected.entities.map((item) => item.id));
  const expectedRelationIds = new Set(expected.relations.map((item) => item.id));
  const expectedEventIds = new Set(expected.timelineEvents.map((item) => item.id));
  const entities = data.entities.filter((item) => expectedEntityIds.has(item.id));
  const relations = data.relations.filter((item) => expectedRelationIds.has(item.id));
  const timelineEvents = data.timelineEvents.filter((item) => expectedEventIds.has(item.id));
  const tracks = new Set(data.timelineTracks.filter((item) => item.worldId === worldId).map((item) => item.id));
  const entityIds = new Set(entities.map((item) => item.id));
  const world = data.worlds.find((item) => item.id === worldId);

  const externalLinkHits = entities
    .filter((item) => /(?:https?|ftp):\/\/|\bwww\./i.test(`${item.summary}\n${item.content}`))
    .map((item) => item.title);
  const thirdPartyHits = entities
    .filter((item) => /百度百科|维基百科|5000yan/u.test(`${item.summary}\n${item.content}`))
    .map((item) => item.title);
  const styleHits = entities
    .filter((item) => /古老而神秘|命运的齿轮|不为人知的秘密|最终揭开真相|值得注意的是|综上所述/u.test(`${item.summary}\n${item.content}`))
    .map((item) => item.title);
  const sourceCoverageIssues = entities
    .filter((item) => !item.content.includes("<h2>原典坐标</h2>"))
    .map((item) => item.title);
  const originalityFlagIssues = entities
    .filter((item) => item.type === "character" && item.templateData?.originalAdaptation !== "false")
    .map((item) => item.title);
  const relationEvidenceIssues = relations
    .filter((item) => !item.evidenceType || !item.sourceCitation || !item.historicalScope || !item.confidence || !item.notes)
    .map((item) => item.id);
  const relationReferenceIssues = relations
    .filter((item) => !entityIds.has(item.sourceEntityId) || !entityIds.has(item.targetEntityId))
    .map((item) => item.id);
  const timelineReferenceIssues = timelineEvents
    .filter((item) => (
      !tracks.has(item.trackId)
      || !entityIds.has(item.entityId)
      || !item.references?.length
      || item.references.some((reference) => reference.kind !== "entity" || !entityIds.has(reference.id))
    ))
    .map((item) => item.title);
  const mythicDateIssues = timelineEvents
    .filter((item) => item.trackId.endsWith(":mythic-narrative") && (item.startValue || item.endValue || item.datePrecision !== "custom"))
    .map((item) => item.title);
  const featuredIssues = (world?.wiki?.featuredEntityIds || [])
    .filter((id) => !data.entities.some((item) => item.worldId === worldId && item.id === id));

  return {
    world: world ? { id: world.id, name: world.name, visibility: world.visibility } : null,
    counts: {
      entities: entities.length,
      figures: entities.filter((item) => item.type === "character").length,
      locations: entities.filter((item) => item.type === "location").length,
      sources: entities.filter((item) => item.type === "note").length,
      relations: relations.length,
      timelineEvents: timelineEvents.length,
      featured: world?.wiki?.featuredEntityIds?.length || 0
    },
    externalLinkHits,
    thirdPartyHits,
    styleHits,
    sourceCoverageIssues,
    originalityFlagIssues,
    relationEvidenceIssues,
    relationReferenceIssues,
    timelineReferenceIssues,
    mythicDateIssues,
    featuredIssues
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
    ({ worldId } = applyAncientCoreBatch(loaded.data, now));
    saveStats = store.save(loaded.data, "bootstrap-chinese-mythology-ancient-core-01");
  } finally {
    store.close();
  }

  const verifyStore = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  let audit;
  let diagnostics;
  try {
    const persisted = verifyStore.load().data;
    audit = auditAncientCoreBatch(persisted, worldId);
    diagnostics = verifyStore.diagnostics();
  } finally {
    verifyStore.close();
  }

  assert.equal(audit.world?.name, "中国上古神话史");
  assert.deepEqual(audit.counts, {
    entities: 42,
    figures: 27,
    locations: 8,
    sources: 7,
    relations: 41,
    timelineEvents: 20,
    featured: 12
  });
  for (const [key, issues] of Object.entries(audit)) {
    if (Array.isArray(issues)) assert.deepEqual(issues, [], key);
  }
  assert.equal(diagnostics.ok, true);

  const report = {
    generatedAt: new Date().toISOString(),
    phase: "中国上古神话史 · 阶段 1 · 上古核心第一批",
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

module.exports = { applyAncientCoreBatch, auditAncientCoreBatch };
