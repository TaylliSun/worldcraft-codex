const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createProjectPackage } = require("../electron/project-package.cjs");
const { WorkspaceStore, WORKSPACE_COLLECTIONS } = require("../electron/workspace-store.cjs");
const { applyFolkSyncretismBatch } = require("./bootstrap-chinese-mythology-folk-syncretism.cjs");
const {
  BATCH_LABEL,
  buildZhenlingFirstRankBatch,
  zhenlingEntityId,
  zhenlingSourceId
} = require("./chinese-mythology-zhenling-first-rank-data.cjs");
const { audit: auditFullLibrary } = require("./audit-chinese-mythology-history-release.cjs");

const root = path.resolve(__dirname, "..");
const packageVersion = require("../package.json").version;
const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");
const assetDir = path.join(userDataDir, "assets");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "chinese-mythology-zhenling-first-rank-12.json");

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
    `worldcraft-codex-complete-before-zhenling-first-rank-12-${timestampForFile(now)}.wcodex`
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

function applyZhenlingFirstRankBatch(data, now) {
  ensureCollections(data);
  const { worldId } = applyFolkSyncretismBatch(data, now);
  const batch = buildZhenlingFirstRankBatch(now, worldId);
  data.entities = replaceById(data.entities, batch.entities);
  data.relations = replaceById(data.relations, batch.relations);
  data.timelineEvents = replaceById(data.timelineEvents, batch.timelineEvents);

  const world = data.worlds.find((item) => item.id === worldId);
  assert.ok(world, "中国上古神话史世界不存在");
  const validEntityIds = new Set(data.entities.filter((item) => item.worldId === worldId).map((item) => item.id));
  const priorFeatured = (world.wiki?.featuredEntityIds || []).filter((id) => validEntityIds.has(id));
  world.wiki = {
    ...(world.wiki || {}),
    featuredEntityIds: unique([...batch.featuredEntityIds, ...priorFeatured]).slice(0, 12)
  };
  data.worlds = replaceById(data.worlds, [world]);
  return { batch, worldId };
}

function auditBatch(data, worldId) {
  const expected = buildZhenlingFirstRankBatch("2000-01-01T00:00:00.000Z", worldId);
  const expectedEntityIds = new Set(expected.entities.map((item) => item.id));
  const expectedRelationIds = new Set(expected.relations.map((item) => item.id));
  const expectedEventIds = new Set(expected.timelineEvents.map((item) => item.id));
  const entities = data.entities.filter((item) => expectedEntityIds.has(item.id));
  const relations = data.relations.filter((item) => expectedRelationIds.has(item.id));
  const timelineEvents = data.timelineEvents.filter((item) => expectedEventIds.has(item.id));
  const actualEntityIds = new Set(data.entities.filter((item) => item.worldId === worldId).map((item) => item.id));
  const expectedEntityById = new Map(expected.entities.map((item) => [item.id, item]));
  const expectedRelationById = new Map(expected.relations.map((item) => [item.id, item]));
  const expectedEventById = new Map(expected.timelineEvents.map((item) => [item.id, item]));
  const mismatch = (items, expectedById, keys) => items.filter((item) => {
    const wanted = expectedById.get(item.id);
    return !wanted || keys.some((key) => JSON.stringify(item[key]) !== JSON.stringify(wanted[key]));
  }).map((item) => item.id);

  return {
    counts: {
      entities: entities.length,
      figures: entities.filter((item) => item.templateId?.endsWith(":zhenling-catalog-entry")).length,
      institutions: entities.filter((item) => item.templateId?.endsWith(":institution-ritual")).length,
      sources: entities.filter((item) => item.templateId?.endsWith(":source-text")).length,
      catalogPositions: expected.catalogPositions.length,
      relations: relations.length,
      sourceRelations: relations.filter((item) => item.id.includes(":source-")).length,
      timelineEvents: timelineEvents.length
    },
    preservedBoundaries: {
      existingYuanshiLinked: relations.some((item) => item.targetEntityId.endsWith(":daoism-early:yuanshi-tianzun") && item.kind === "contains"),
      collectiveSeats: expected.institutions.filter((item) => /合称神位/u.test(item.title)).length,
      disputedJadeRelations: relations.filter((item) => item.kind === "disputed" && item.targetEntityId.endsWith(":daoism-celestial:jade-emperor")).length,
      sourceEntryId: zhenlingSourceId(worldId),
      tierEntryId: zhenlingEntityId("first-rank-yuqing", worldId)
    },
    missingEntityIds: [...expectedEntityIds].filter((id) => !entities.some((item) => item.id === id)),
    missingRelationIds: [...expectedRelationIds].filter((id) => !relations.some((item) => item.id === id)),
    missingTimelineEventIds: [...expectedEventIds].filter((id) => !timelineEvents.some((item) => item.id === id)),
    relationReferenceIssues: relations
      .filter((item) => !actualEntityIds.has(item.sourceEntityId) || !actualEntityIds.has(item.targetEntityId))
      .map((item) => item.id),
    entityMismatchIssues: mismatch(entities, expectedEntityById, ["title", "summary", "content", "categoryId", "templateId", "templateData"]),
    relationMismatchIssues: mismatch(relations, expectedRelationById, ["sourceEntityId", "targetEntityId", "kind", "label", "direction", "strength", "evidenceType", "sourceCitation", "historicalScope", "confidence", "notes"]),
    timelineMismatchIssues: mismatch(timelineEvents, expectedEventById, ["entityId", "references", "trackId", "title", "summary", "displayDate", "datePrecision", "sortOrder", "startValue", "endValue", "era"])
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
    ({ worldId } = applyZhenlingFirstRankBatch(loaded.data, now));
    saveStats = store.save(loaded.data, "bootstrap-chinese-mythology-zhenling-first-rank-12");
  } finally {
    store.close();
  }

  const verifyStore = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  let batchAudit;
  let fullAudit;
  let diagnostics;
  try {
    const persisted = verifyStore.load().data;
    diagnostics = verifyStore.diagnostics();
    batchAudit = auditBatch(persisted, worldId);
    fullAudit = auditFullLibrary(persisted, diagnostics);
  } finally {
    verifyStore.close();
  }

  assert.deepEqual(batchAudit.counts, {
    entities: 30,
    figures: 24,
    institutions: 5,
    sources: 1,
    catalogPositions: 29,
    relations: 62,
    sourceRelations: 30,
    timelineEvents: 2
  });
  assert.deepEqual(batchAudit.preservedBoundaries, {
    existingYuanshiLinked: true,
    collectiveSeats: 4,
    disputedJadeRelations: 2,
    sourceEntryId: zhenlingSourceId(worldId),
    tierEntryId: zhenlingEntityId("first-rank-yuqing", worldId)
  });
  for (const [key, issues] of Object.entries(batchAudit)) {
    if (Array.isArray(issues)) assert.deepEqual(issues, [], key);
  }
  assert.equal(diagnostics.ok, true);
  assert.equal(fullAudit.ok, true, "全库审计未通过");

  const report = {
    ok: true,
    generatedAt: new Date().toISOString(),
    phase: BATCH_LABEL,
    backup: backup.targetPath,
    saveStats,
    batchAudit,
    fullLibrary: {
      counts: fullAudit.counts,
      trackCounts: fullAudit.trackCounts,
      benchmarks: fullAudit.benchmarks
    },
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

module.exports = { applyZhenlingFirstRankBatch, auditBatch };
