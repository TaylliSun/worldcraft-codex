const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const {
  WORKSPACE_COLLECTIONS,
  WorkspaceStore
} = require("../electron/workspace-store.cjs");

const root = path.join(__dirname, "..", "validation", `workspace-pressure-${process.pid}`);
const dbPath = path.join(root, "worldcraft-codex.sqlite");
const backupDir = path.join(root, "backups");
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });

const workspace = Object.fromEntries(
  WORKSPACE_COLLECTIONS.map((collection) => [collection, []])
);
workspace.worlds = [
  {
    id: "world-pressure",
    name: "大型北境项目",
    description: "压力验证",
    updatedAt: "2026-07-12T02:00:00.000Z"
  }
];
workspace.entities = Array.from({ length: 6000 }, (_, index) => ({
  id: `entity-${index}`,
  worldId: "world-pressure",
  type: index % 5 === 0 ? "location" : "character",
  title: `北境对象 ${index}`,
  slug: `north-${index}`,
  summary: index % 137 === 0 ? `星银剑线索 ${index}` : `大型项目条目 ${index}`,
  content: `第 ${index} 个条目的生产正文与任务关联。`,
  tags: ["北境", `批次-${index % 20}`],
  templateData: { goals: "推进剧情", birthplace: "雾鸦堡" },
  visibility: "private",
  createdAt: "2026-07-12T02:00:00.000Z",
  updatedAt: "2026-07-12T02:00:00.000Z"
}));
workspace.entities.push({ ...workspace.entities[0] });
workspace.quests = Array.from({ length: 120 }, (_, index) => ({
  id: `quest-${index}`,
  worldId: "world-pressure",
  title: `任务线 ${index}`,
  summary: `关联北境对象 ${index}`,
  steps: [],
  relatedEntityIds: [`entity-${index}`],
  prerequisiteQuestIds: [],
  updatedAt: "2026-07-12T02:00:00.000Z"
}));

let tick = 0;
const now = () => new Date(Date.UTC(2026, 6, 12, 2, 0, tick++)).toISOString();
const store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 11, now });

try {
  const firstStarted = performance.now();
  const first = store.save(workspace, "initial-seed");
  const firstMs = performance.now() - firstStarted;
  assert.equal(first.inserted, 6122);
  assert.equal(first.updated, 0);
  assert.equal(first.deleted, 0);
  assert.equal(first.versionsAdded, 6122);
  assert.equal(firstMs < 30000, true);

  const loaded = store.load();
  assert.equal(loaded.data.entities.length, 6001);
  assert.equal(loaded.data.entities.filter((item) => item.id === "entity-0").length, 2);
  assert.equal(loaded.data.quests.length, 120);

  const noChangeStarted = performance.now();
  const noChange = store.save(workspace, "autosave");
  const noChangeMs = performance.now() - noChangeStarted;
  assert.equal(noChange.inserted, 0);
  assert.equal(noChange.updated, 0);
  assert.equal(noChange.deleted, 0);
  assert.equal(noChange.bytesWritten, 0);
  assert.equal(noChange.unchanged, 6122);
  assert.equal(noChangeMs < 10000, true);

  assert.equal(
    store
      .open()
      .prepare(
        "SELECT COUNT(*) count FROM sqlite_master WHERE type = 'index' AND name = 'object_versions_row'"
      )
      .get().count,
    1
  );

  const bulkChanged = structuredClone(workspace);
  bulkChanged.entities.forEach((entity, index) => {
    entity.summary = `${entity.summary} bulk-revision-${index}`;
    entity.updatedAt = "2026-07-12T02:05:00.000Z";
  });
  const bulkChangedStarted = performance.now();
  const bulkChangedResult = store.save(bulkChanged, "autosave");
  const bulkChangedMs = performance.now() - bulkChangedStarted;
  console.log(`Bulk second-version save: ${bulkChangedMs.toFixed(0)}ms`);
  assert.equal(bulkChangedResult.updated, 6001);
  assert.equal(bulkChangedResult.inserted, 0);
  assert.equal(bulkChangedResult.deleted, 0);
  assert.equal(bulkChangedResult.versionsAdded, 6001);
  assert.equal(bulkChangedMs < 15000, true);

  const changed = structuredClone(bulkChanged);
  for (let index = 0; index < 12; index += 1) {
    changed.entities[index].summary = `已更新的星银剑线索 ${index}`;
    changed.entities[index].updatedAt = "2026-07-12T02:10:00.000Z";
  }
  const changedStarted = performance.now();
  const changedResult = store.save(changed, "autosave");
  const changedMs = performance.now() - changedStarted;
  assert.equal(changedResult.updated, 12);
  assert.equal(changedResult.inserted, 0);
  assert.equal(changedResult.deleted, 0);
  assert.equal(changedResult.versionsAdded, 12);
  assert.equal(changedResult.unchanged, 6110);
  assert.equal(changedResult.bytesWritten < 100000, true);
  assert.equal(changedMs < 10000, true);

  const searchStarted = performance.now();
  const search = store.search("星银剑", "world-pressure", 80);
  const searchMs = performance.now() - searchStarted;
  assert.equal(search.length > 12, true);
  assert.equal(search.some((result) => result.searchKey === "entity:entity-0"), true);
  assert.equal(searchMs < 3000, true);

  const deleted = structuredClone(changed);
  deleted.entities.splice(100, 60);
  const deleteResult = store.save(deleted, "bulk-delete");
  assert.equal(deleteResult.deleted, 60);
  assert.equal(deleteResult.inserted, 0);
  assert.equal(store.load().data.entities.length, 5941);

  const diagnostics = store.diagnostics();
  assert.equal(diagnostics.ok, true);
  assert.equal(diagnostics.itemCount, 6062);
  assert.equal(diagnostics.searchCount, diagnostics.itemCount);
  assert.equal(diagnostics.searchMapCount, diagnostics.searchCount);
  assert.equal(diagnostics.duplicates.length, 1);
  assert.equal(diagnostics.duplicates[0].item_id, "entity-0");
  assert.equal(diagnostics.versionCount >= 6134, true);

  console.log(
    `Workspace pressure checks passed: 39 assertions; first ${firstMs.toFixed(0)}ms, no-op ${noChangeMs.toFixed(0)}ms, 6001 updates ${bulkChangedMs.toFixed(0)}ms, 12 updates ${changedMs.toFixed(0)}ms, FTS ${searchMs.toFixed(0)}ms.`
  );
} finally {
  store.close();
  fs.rmSync(root, { recursive: true, force: true });
}
