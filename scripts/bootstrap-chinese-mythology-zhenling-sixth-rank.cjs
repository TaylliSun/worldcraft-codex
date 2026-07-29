const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createProjectPackage } = require("../electron/project-package.cjs");
const { WorkspaceStore, WORKSPACE_COLLECTIONS } = require("../electron/workspace-store.cjs");
const { applyZhenlingFifthRankBatch } = require("./bootstrap-chinese-mythology-zhenling-fifth-rank.cjs");
const { zhenlingSourceId } = require("./chinese-mythology-zhenling-first-rank-data.cjs");
const { BATCH_LABEL, buildZhenlingSixthRankBatch, zhenlingSixthEntityId } = require("./chinese-mythology-zhenling-sixth-rank-data.cjs");
const { audit: auditFullLibrary } = require("./audit-chinese-mythology-history-release.cjs");

const root = path.resolve(__dirname, "..");
const packageVersion = require("../package.json").version;
const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");
const assetDir = path.join(userDataDir, "assets");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "chinese-mythology-zhenling-sixth-rank-17.json");

const replaceById = (existing, additions) => {
  const ids = new Set(additions.map((item) => item.id));
  return [...additions, ...existing.filter((item) => !ids.has(item.id))];
};
const unique = (values) => [...new Set(values)];

function ensureCollections(data) {
  for (const collection of WORKSPACE_COLLECTIONS) if (!Array.isArray(data[collection])) data[collection] = [];
}

async function createCompleteBackup(data, now) {
  fs.mkdirSync(backupDir, { recursive: true });
  const targetPath = path.join(backupDir, `worldcraft-codex-complete-before-zhenling-sixth-rank-17-${now.replace(/[:.]/g, "-")}.wcodex`);
  const result = await createProjectPackage({ targetPath, data, assetsDir: assetDir, schemaVersion: 17, appVersion: packageVersion, now: () => now });
  return { targetPath, result };
}

function applyZhenlingSixthRankBatch(data, now) {
  ensureCollections(data);
  const { worldId } = applyZhenlingFifthRankBatch(data, now);
  const batch = buildZhenlingSixthRankBatch(now, worldId);
  data.entities = replaceById(data.entities, batch.entities);
  data.relations = replaceById(data.relations, batch.relations);
  data.timelineEvents = replaceById(data.timelineEvents, batch.timelineEvents);
  const world = data.worlds.find((item) => item.id === worldId);
  assert.ok(world, "中国上古神话史世界不存在");
  const validIds = new Set(data.entities.filter((item) => item.worldId === worldId).map((item) => item.id));
  const priorFeatured = (world.wiki?.featuredEntityIds || []).filter((id) => validIds.has(id));
  world.wiki = { ...(world.wiki || {}), featuredEntityIds: unique([...batch.featuredEntityIds, ...priorFeatured]).slice(0, 12) };
  data.worlds = replaceById(data.worlds, [world]);
  return { batch, worldId };
}

function auditBatch(data, worldId) {
  const expected = buildZhenlingSixthRankBatch("2000-01-01T00:00:00.000Z", worldId);
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
  const mismatch = (items, wanted, keys) => items.filter((item) => {
    const expectedItem = wanted.get(item.id);
    return !expectedItem || keys.some((key) => JSON.stringify(item[key]) !== JSON.stringify(expectedItem[key]));
  }).map((item) => item.id);
  return {
    counts: {
      entities: entities.length,
      figures: entities.filter((item) => item.templateId?.endsWith(":zhenling-catalog-entry")).length,
      institutions: entities.filter((item) => item.templateId?.endsWith(":institution-ritual")).length,
      locations: entities.filter((item) => item.templateId?.endsWith(":sacred-geography")).length,
      sources: entities.filter((item) => item.templateId?.endsWith(":source-text")).length,
      catalogPositions: expected.catalogPositions.length,
      reusedPositions: expected.catalogPositions.filter((item) => item.existingRef).length,
      collectiveGroups: expected.catalogPositions.filter((item) => item.kind === "group").length,
      sacredSites: expected.catalogPositions.filter((item) => item.kind === "site").length,
      relations: relations.length,
      sourceRelations: relations.filter((item) => item.id.includes(":source-")).length,
      timelineEvents: timelineEvents.length
    },
    preservedBoundaries: {
      sectionCounts: expected.catalogPositions.reduce((counts, item) => { counts[item.section] = (counts[item.section] || 0) + 1; return counts; }, {}),
      structureHeadings: expected.institutions.filter((item) => item.templateData?.institutionKind === "神谱名录分组").length,
      indexedLocations: expected.locations.length,
      disputedIdentityRelations: relations.filter((item) => item.kind === "disputed").length,
      teacherRelations: relations.filter((item) => item.kind === "teacher").length,
      sourceEntryId: zhenlingSourceId(worldId),
      tierEntryId: zhenlingSixthEntityId("sixth-rank-earth-immortals", worldId)
    },
    missingEntityIds: [...expectedEntityIds].filter((id) => !entities.some((item) => item.id === id)),
    missingRelationIds: [...expectedRelationIds].filter((id) => !relations.some((item) => item.id === id)),
    missingTimelineEventIds: [...expectedEventIds].filter((id) => !timelineEvents.some((item) => item.id === id)),
    relationReferenceIssues: relations.filter((item) => !actualEntityIds.has(item.sourceEntityId) || !actualEntityIds.has(item.targetEntityId)).map((item) => item.id),
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
    const now = new Date().toISOString();
    backup = await createCompleteBackup(loaded.data, now);
    ({ worldId } = applyZhenlingSixthRankBatch(loaded.data, now));
    saveStats = store.save(loaded.data, "bootstrap-chinese-mythology-zhenling-sixth-rank-17");
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
  assert.deepEqual(batchAudit.counts, { entities: 191, figures: 163, institutions: 13, locations: 15, sources: 0, catalogPositions: 176, reusedPositions: 6, collectiveGroups: 3, sacredSites: 4, relations: 626, sourceRelations: 197, timelineEvents: 8 });
  assert.deepEqual(batchAudit.preservedBoundaries, { sectionCounts: { "中位": 1, "左位": 61, "右位": 114 }, structureHeadings: 9, indexedLocations: 15, disputedIdentityRelations: 1, teacherRelations: 12, sourceEntryId: zhenlingSourceId(worldId), tierEntryId: zhenlingSixthEntityId("sixth-rank-earth-immortals", worldId) });
  for (const [key, issues] of Object.entries(batchAudit)) if (Array.isArray(issues)) assert.deepEqual(issues, [], key);
  assert.equal(diagnostics.ok, true);
  assert.equal(fullAudit.ok, true, "全库审计未通过");
  const report = {
    ok: true, generatedAt: new Date().toISOString(), phase: BATCH_LABEL, backup: backup.targetPath, saveStats, batchAudit,
    fullLibrary: { counts: fullAudit.counts, trackCounts: fullAudit.trackCounts, benchmarks: fullAudit.benchmarks },
    diagnostics: { ok: diagnostics.ok, schemaVersion: diagnostics.schemaVersion, quickCheck: diagnostics.quickCheck, foreignKeyIssues: diagnostics.foreignKeyIssues, dbPath: diagnostics.dbPath }
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ ok: true, reportPath, ...report }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error?.stack || error); process.exitCode = 1; });

module.exports = { applyZhenlingSixthRankBatch, auditBatch };
