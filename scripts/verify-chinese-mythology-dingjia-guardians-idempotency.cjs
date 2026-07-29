const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");

const { WorkspaceStore } = require("../electron/workspace-store.cjs");
const { applyDingjiaGuardiansBatch, auditBatch } = require("./bootstrap-chinese-mythology-dingjia-guardians.cjs");
const { audit: auditFullLibrary } = require("./audit-chinese-mythology-history-release.cjs");

const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const store = new WorkspaceStore({
  dbPath: path.join(userDataDir, "worldcraft-codex.sqlite"),
  backupDir: path.join(userDataDir, "backups"),
  schemaVersion: 17
});
const entityMarker = ":mythology:daoism-dingjia-guardians:";
const sourceMarker = ":mythology:daoism-dingjia-guardians-source:";
const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;
const counts = (data, worldId) => ({
  entities: data.entities.filter((item) => item.worldId === worldId && (item.id.includes(entityMarker) || item.id.includes(sourceMarker))).length,
  relations: data.relations.filter((item) => item.worldId === worldId && item.id.includes(entityMarker)).length,
  timelineEvents: data.timelineEvents.filter((item) => item.worldId === worldId && item.id.includes(entityMarker)).length
});

try {
  const data = store.load().data;
  const first = applyDingjiaGuardiansBatch(data, "2026-07-19T00:00:00.000Z");
  const firstCounts = counts(data, first.worldId);
  const second = applyDingjiaGuardiansBatch(data, "2026-07-19T00:00:00.000Z");
  const secondCounts = counts(data, second.worldId);
  assert.deepEqual(firstCounts, { entities: 44, relations: 134, timelineEvents: 26 });
  assert.deepEqual(secondCounts, firstCounts);
  assert.equal(uniqueIds(data.entities) && uniqueIds(data.relations) && uniqueIds(data.timelineEvents), true);
  const batchAudit = auditBatch(data, second.worldId);
  for (const [key, issues] of Object.entries(batchAudit)) {
    if (Array.isArray(issues)) assert.deepEqual(issues, [], key);
  }
  const fullAudit = auditFullLibrary(data, store.diagnostics());
  assert.equal(fullAudit.ok, true, `六丁六甲预演后的全库审计未通过：${JSON.stringify(fullAudit.issues)}`);
  console.log(JSON.stringify({
    ok: true,
    firstCounts,
    secondCounts,
    boundaries: batchAudit.preservedBoundaries,
    fullLibrary: {
      counts: fullAudit.counts,
      trackCounts: fullAudit.trackCounts,
      benchmarks: fullAudit.benchmarks
    }
  }, null, 2));
} finally {
  store.close();
}
