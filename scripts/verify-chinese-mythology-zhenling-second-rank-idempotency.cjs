const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");

const { WorkspaceStore } = require("../electron/workspace-store.cjs");
const {
  applyZhenlingSecondRankBatch,
  auditBatch
} = require("./bootstrap-chinese-mythology-zhenling-second-rank.cjs");

const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");
const entityMarker = ":mythology:zhenling-weiye:second-rank:";
const relationEventMarker = ":mythology:zhenling-second-rank:";

function counts(data, worldId) {
  return {
    entities: data.entities.filter((item) => item.worldId === worldId && item.id.includes(entityMarker)).length,
    relations: data.relations.filter((item) => item.worldId === worldId && item.id.includes(relationEventMarker)).length,
    timelineEvents: data.timelineEvents.filter((item) => item.worldId === worldId && item.id.includes(relationEventMarker)).length
  };
}

const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;

const store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
try {
  const data = store.load().data;
  const now = "2026-07-19T00:00:00.000Z";
  const first = applyZhenlingSecondRankBatch(data, now);
  const firstCounts = counts(data, first.worldId);
  const second = applyZhenlingSecondRankBatch(data, now);
  const secondCounts = counts(data, second.worldId);

  assert.deepEqual(firstCounts, { entities: 99, relations: 235, timelineEvents: 6 });
  assert.deepEqual(secondCounts, firstCounts);
  assert.equal(uniqueIds(data.entities), true);
  assert.equal(uniqueIds(data.relations), true);
  assert.equal(uniqueIds(data.timelineEvents), true);

  const audit = auditBatch(data, second.worldId);
  for (const [key, issues] of Object.entries(audit)) {
    if (Array.isArray(issues)) assert.deepEqual(issues, [], key);
  }
  assert.equal(audit.preservedBoundaries.institutionGroups, 2);
  assert.equal(audit.preservedBoundaries.sacredArchitecture, 10);
  assert.equal(audit.preservedBoundaries.disputedRedPineRelations, 1);

  console.log(JSON.stringify({ ok: true, firstCounts, secondCounts, boundaries: audit.preservedBoundaries }, null, 2));
} finally {
  store.close();
}
