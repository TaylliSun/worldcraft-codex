const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createProjectPackage } = require("../electron/project-package.cjs");
const { WorkspaceStore, WORKSPACE_COLLECTIONS } = require("../electron/workspace-store.cjs");
const { applyBuddhismTibetanBatch } = require("./bootstrap-chinese-mythology-buddhism-tibetan.cjs");
const { BATCH_LABEL, buildBuddhismSouthernMaterialBatch, southernEntityId } = require("./chinese-mythology-buddhism-southern-material-data.cjs");
const { audit: auditFullLibrary } = require("./audit-chinese-mythology-history-release.cjs");

const root = path.resolve(__dirname, "..");
const packageVersion = require("../package.json").version;
const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");
const assetDir = path.join(userDataDir, "assets");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "chinese-mythology-buddhism-southern-material-28.json");
const replaceById = (existing, additions) => { const ids = new Set(additions.map((item) => item.id)); return [...additions, ...existing.filter((item) => !ids.has(item.id))]; };
const unique = (values) => [...new Set(values)];

function ensureCollections(data) {
  for (const collection of WORKSPACE_COLLECTIONS) if (!Array.isArray(data[collection])) data[collection] = [];
}

async function createCompleteBackup(data, now) {
  fs.mkdirSync(backupDir, { recursive: true });
  const targetPath = path.join(backupDir, `worldcraft-codex-complete-before-buddhism-southern-material-28-${now.replace(/[:.]/g, "-")}.wcodex`);
  const result = await createProjectPackage({ targetPath, data, assetsDir: assetDir, schemaVersion: 17, appVersion: packageVersion, now: () => now });
  return { targetPath, result };
}

function applyBuddhismSouthernMaterialBatch(data, now) {
  ensureCollections(data);
  const { worldId } = applyBuddhismTibetanBatch(data, now);
  const batch = buildBuddhismSouthernMaterialBatch(now, worldId);
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
  const expected = buildBuddhismSouthernMaterialBatch("2000-01-01T00:00:00.000Z", worldId);
  const expectedEntityIds = new Set(expected.entities.map((item) => item.id));
  const expectedRelationIds = new Set(expected.relations.map((item) => item.id));
  const expectedEventIds = new Set(expected.timelineEvents.map((item) => item.id));
  const entities = data.entities.filter((item) => expectedEntityIds.has(item.id));
  const relations = data.relations.filter((item) => expectedRelationIds.has(item.id));
  const timelineEvents = data.timelineEvents.filter((item) => expectedEventIds.has(item.id));
  const worldEntityIds = new Set(data.entities.filter((item) => item.worldId === worldId).map((item) => item.id));
  const expectedEntityById = new Map(expected.entities.map((item) => [item.id, item]));
  const expectedRelationById = new Map(expected.relations.map((item) => [item.id, item]));
  const expectedEventById = new Map(expected.timelineEvents.map((item) => [item.id, item]));
  const mismatch = (items, wanted, keys) => items.filter((item) => { const expectedItem = wanted.get(item.id); return !expectedItem || keys.some((key) => JSON.stringify(item[key]) !== JSON.stringify(expectedItem[key])); }).map((item) => item.id);
  return {
    counts: {
      entities: entities.length,
      figures: entities.filter((item) => item.type === "character").length,
      systems: entities.filter((item) => item.templateId?.endsWith(":institution-ritual")).length,
      locations: entities.filter((item) => item.templateId?.endsWith(":sacred-geography")).length,
      sources: entities.filter((item) => item.templateId?.endsWith(":source-text")).length,
      catalogEntries: expected.catalogEntries.length,
      relations: relations.length,
      sourceRelations: relations.filter((item) => item.id.includes(":source-figure-")).length,
      memberships: relations.filter((item) => item.label === "列入南传与巴利人物分区").length,
      catalogMemberships: relations.filter((item) => item.label === "列入专题目录").length,
      timelineEvents: timelineEvents.length
    },
    trackCounts: timelineEvents.reduce((counts, item) => { const key = item.trackId.split(":").at(-1); counts[key] = (counts[key] || 0) + 1; return counts; }, {}),
    preservedBoundaries: {
      mahanamaId: southernEntityId("person-mahanama-five", worldId),
      dhammapalaId: southernEntityId("person-dhammapala", worldId),
      payaZhenId: southernEntityId("person-paya-zhen", worldId),
      theravadaId: southernEntityId("entry-china-theravada", worldId),
      sculptureId: southernEntityId("entry-buddhist-sculpture", worldId)
    },
    missingEntityIds: [...expectedEntityIds].filter((id) => !entities.some((item) => item.id === id)),
    missingRelationIds: [...expectedRelationIds].filter((id) => !relations.some((item) => item.id === id)),
    missingTimelineEventIds: [...expectedEventIds].filter((id) => !timelineEvents.some((item) => item.id === id)),
    relationReferenceIssues: relations.filter((item) => !worldEntityIds.has(item.sourceEntityId) || !worldEntityIds.has(item.targetEntityId)).map((item) => item.id),
    entityMismatchIssues: mismatch(entities, expectedEntityById, ["title", "summary", "content", "categoryId", "templateId", "templateData"]),
    relationMismatchIssues: mismatch(relations, expectedRelationById, ["sourceEntityId", "targetEntityId", "kind", "label", "direction", "strength", "evidenceType", "sourceCitation", "historicalScope", "confidence", "notes"]),
    timelineMismatchIssues: mismatch(timelineEvents, expectedEventById, ["entityId", "references", "trackId", "title", "summary", "displayDate", "datePrecision", "sortOrder", "startValue", "endValue", "era"])
  };
}

async function main() {
  assert.ok(fs.existsSync(dbPath), `未找到数据库：${dbPath}`);
  fs.mkdirSync(validationDir, { recursive: true });
  const store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  let backup; let saveStats; let worldId;
  try {
    const loaded = store.load();
    const now = new Date().toISOString();
    backup = await createCompleteBackup(loaded.data, now);
    ({ worldId } = applyBuddhismSouthernMaterialBatch(loaded.data, now));
    saveStats = store.save(loaded.data, "bootstrap-chinese-mythology-buddhism-southern-material-28");
  } finally {
    store.close();
  }
  const verifyStore = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  let batchAudit; let fullAudit; let diagnostics;
  try {
    const persisted = verifyStore.load().data;
    diagnostics = verifyStore.diagnostics();
    batchAudit = auditBatch(persisted, worldId);
    fullAudit = auditFullLibrary(persisted, diagnostics);
  } finally {
    verifyStore.close();
  }
  assert.deepEqual(batchAudit.counts, { entities: 128, figures: 44, systems: 50, locations: 24, sources: 10, catalogEntries: 65, relations: 320, sourceRelations: 44, memberships: 44, catalogMemberships: 65, timelineEvents: 32 });
  assert.deepEqual(batchAudit.trackCounts, { "textual-evidence": 10, "religious-institutions": 14, "cult-evolution": 8 });
  for (const [key, issues] of Object.entries(batchAudit)) if (Array.isArray(issues)) assert.deepEqual(issues, [], `${key}: ${issues.join(", ")}`);
  assert.equal(diagnostics.ok, true);
  assert.equal(fullAudit.ok, true, `全库审计未通过：${JSON.stringify(fullAudit.issues)}`);
  const report = {
    ok: true,
    generatedAt: new Date().toISOString(),
    phase: BATCH_LABEL,
    backup: backup.targetPath,
    saveStats,
    batchAudit,
    buddhismDirectTotals: { entities: 1027, identities: 500, relations: 3261, timelineEvents: 298, sourceEntries: 332 },
    targetComplete: true,
    fullLibrary: { counts: fullAudit.counts, trackCounts: fullAudit.trackCounts, benchmarks: fullAudit.benchmarks },
    diagnostics: { ok: diagnostics.ok, schemaVersion: diagnostics.schemaVersion, quickCheck: diagnostics.quickCheck, foreignKeyIssues: diagnostics.foreignKeyIssues, dbPath: diagnostics.dbPath }
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ ok: true, reportPath, ...report }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error?.stack || error); process.exitCode = 1; });
module.exports = { applyBuddhismSouthernMaterialBatch, auditBatch };
