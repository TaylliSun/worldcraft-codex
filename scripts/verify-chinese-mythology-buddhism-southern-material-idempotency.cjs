const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const { WorkspaceStore } = require("../electron/workspace-store.cjs");
const { applyBuddhismSouthernMaterialBatch, auditBatch } = require("./bootstrap-chinese-mythology-buddhism-southern-material.cjs");
const { audit: auditFullLibrary } = require("./audit-chinese-mythology-history-release.cjs");

const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const store = new WorkspaceStore({ dbPath: path.join(userDataDir, "worldcraft-codex.sqlite"), backupDir: path.join(userDataDir, "backups"), schemaVersion: 17 });
const marker = ":mythology:buddhism-southern-material:";
const counts = (data, worldId) => ({ entities: data.entities.filter((item) => item.worldId === worldId && item.id.includes(marker)).length, relations: data.relations.filter((item) => item.worldId === worldId && item.id.includes(marker)).length, timelineEvents: data.timelineEvents.filter((item) => item.worldId === worldId && item.id.includes(marker)).length });

try {
  const data = store.load().data;
  const first = applyBuddhismSouthernMaterialBatch(data, "2026-07-20T00:00:00.000Z");
  const firstCounts = counts(data, first.worldId);
  const second = applyBuddhismSouthernMaterialBatch(data, "2026-07-20T00:00:00.000Z");
  const secondCounts = counts(data, second.worldId);
  assert.deepEqual(firstCounts, { entities: 128, relations: 320, timelineEvents: 32 });
  assert.deepEqual(secondCounts, firstCounts);
  const batchAudit = auditBatch(data, second.worldId);
  for (const [key, issues] of Object.entries(batchAudit)) if (Array.isArray(issues)) assert.deepEqual(issues, [], key);
  const fullAudit = auditFullLibrary(data, store.diagnostics());
  assert.equal(fullAudit.ok, true, `南传与物质文化批重复导入后的全库审计未通过：${JSON.stringify(fullAudit.issues)}`);
  console.log(JSON.stringify({ ok: true, firstCounts, secondCounts, boundaries: batchAudit.preservedBoundaries, fullLibrary: { counts: fullAudit.counts, trackCounts: fullAudit.trackCounts, benchmarks: fullAudit.benchmarks } }, null, 2));
} finally {
  store.close();
}
