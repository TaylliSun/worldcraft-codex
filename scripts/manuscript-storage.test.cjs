const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  WORKSPACE_COLLECTIONS,
  WorkspaceStore,
  migrateLegacyManuscriptData
} = require("../electron/workspace-store.cjs");

const root = path.join(__dirname, "..", "validation", `manuscript-storage-${process.pid}`);
const dbPath = path.join(root, "worldcraft-codex.sqlite");
const backupDir = path.join(root, "backups");
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });

const emptyWorkspace = () =>
  Object.fromEntries(WORKSPACE_COLLECTIONS.map((collection) => [collection, []]));
const workspace = {
  ...emptyWorkspace(),
  worlds: [{ id: "world-a", name: "北境书稿" }],
  narrativeMilestones: [
    {
      id: "production-only",
      worldId: "world-a",
      title: "完成支线任务图",
      act: "第一幕",
      status: "drafting",
      order: 0
    },
    {
      id: "legacy-chapter",
      worldId: "world-a",
      title: "第一章 风雪来信",
      summary: "艾琳抵达雾堡。",
      manuscriptBody: "<p>风雪遮住了山口。</p>",
      developerNotes: "保持第一人称限知",
      act: "第一卷",
      status: "review",
      order: 1,
      linkedSceneIds: ["scene-a"],
      createdAt: "2026-07-10T00:00:00.000Z",
      updatedAt: "2026-07-11T00:00:00.000Z"
    }
  ]
};

let assertions = 0;
function check(actual, expected, label) {
  assert.deepEqual(actual, expected, label);
  assertions += 1;
}

const direct = migrateLegacyManuscriptData(workspace, "2026-07-16T00:00:00.000Z");
check(direct.manuscriptBooks.length, 1, "CJS migration creates a book");
check(direct.manuscriptChapters.length, 1, "CJS migration excludes production-only milestones");
check(direct.manuscriptChapters[0].body, "<p>风雪遮住了山口。</p>", "CJS migration preserves rich text");

let store;
try {
  const source = new WorkspaceStore({
    dbPath,
    backupDir,
    schemaVersion: 16,
    now: () => "2026-07-15T00:00:00.000Z"
  });
  source.save(workspace, "schema-16-seed");
  source.close();

  store = new WorkspaceStore({
    dbPath,
    backupDir,
    schemaVersion: 17,
    now: () => "2026-07-16T00:00:00.000Z"
  });
  const loaded = store.load();
  const diagnostics = store.diagnostics();
  check(diagnostics.schemaVersion, 17, "schema 16 upgrades to schema 17");
  check(diagnostics.lastMigration.from, 16, "migration records schema 16 source");
  check(diagnostics.lastMigration.to, 17, "migration records schema 17 target");
  check(loaded.data.narrativeMilestones, workspace.narrativeMilestones, "legacy milestones remain byte-compatible");
  check(loaded.data.manuscriptBooks.length, 1, "SQLite migration persists the book");
  check(loaded.data.manuscriptVolumes[0].title, "第一卷", "SQLite migration persists the volume");
  check(loaded.data.manuscriptChapters.length, 1, "SQLite migration persists one chapter");
  check(
    loaded.data.manuscriptChapters[0].linkedNarrativeMilestoneId,
    "legacy-chapter",
    "SQLite migration preserves the source milestone link"
  );
  check(
    store.listObjectVersions("manuscriptChapters", loaded.data.manuscriptChapters[0].id)[0]?.reason,
    "schema-17-manuscript-migration",
    "migrated chapter starts with an object history checkpoint"
  );
  check(
    store.search("风雪遮住", "world-a").some((result) => result.collection === "manuscriptChapters"),
    true,
    "migrated prose is indexed for full-project search"
  );

  store.close();
  store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  check(store.load().data.manuscriptChapters.length, 1, "reopening schema 17 does not duplicate migration output");
} finally {
  store?.close();
  fs.rmSync(root, { recursive: true, force: true });
}

console.log(`Manuscript storage checks passed: ${assertions} assertions.`);
