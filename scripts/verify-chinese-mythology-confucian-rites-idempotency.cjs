const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");

const { WorkspaceStore } = require("../electron/workspace-store.cjs");
const {
  applyConfucianRitesBatch,
  auditConfucianRitesBatch
} = require("./bootstrap-chinese-mythology-confucian-rites.cjs");

const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");
const marker = ":mythology:confucian-rites:";

function counts(data, worldId) {
  return {
    entities: data.entities.filter((item) => item.worldId === worldId && item.id.includes(marker)).length,
    relations: data.relations.filter((item) => item.worldId === worldId && item.id.includes(marker)).length,
    timelineEvents: data.timelineEvents.filter((item) => item.worldId === worldId && item.id.includes(marker)).length
  };
}

function uniqueIds(items) {
  return new Set(items.map((item) => item.id)).size === items.length;
}

const store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
try {
  const data = store.load().data;
  const now = "2026-07-19T00:00:00.000Z";
  const first = applyConfucianRitesBatch(data, now);
  const firstCounts = counts(data, first.worldId);
  const second = applyConfucianRitesBatch(data, now);
  const secondCounts = counts(data, second.worldId);

  assert.deepEqual(firstCounts, { entities: 60, relations: 250, timelineEvents: 35 });
  assert.deepEqual(secondCounts, firstCounts);
  assert.equal(uniqueIds(data.entities), true);
  assert.equal(uniqueIds(data.relations), true);
  assert.equal(uniqueIds(data.timelineEvents), true);

  const audit = auditConfucianRitesBatch(data, second.worldId);
  assert.deepEqual(audit.batchManagedCounts, { entities: 60, relations: 250, timelineEvents: 35 });
  assert.deepEqual(audit.cumulativeManagedCounts, { entities: 591, relations: 1686, timelineEvents: 229 });
  for (const [key, issues] of Object.entries(audit)) {
    if (Array.isArray(issues)) assert.deepEqual(issues, [], key);
  }

  console.log(JSON.stringify({
    ok: true,
    firstCounts,
    secondCounts,
    cumulative: audit.cumulativeManagedCounts,
    trackCounts: audit.trackCounts
  }, null, 2));
} finally {
  store.close();
}
