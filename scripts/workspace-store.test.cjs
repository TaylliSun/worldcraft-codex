const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const {
  STORAGE_FORMAT,
  WORKSPACE_COLLECTIONS,
  WorkspaceStore
} = require("../electron/workspace-store.cjs");

const root = path.join(__dirname, "..", "validation", `workspace-store-${process.pid}`);
const dbPath = path.join(root, "worldcraft-codex.sqlite");
const backupDir = path.join(root, "backups");
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });

let tick = 0;
const now = () => new Date(Date.UTC(2026, 6, 12, 1, 0, tick++)).toISOString();
const emptyWorkspace = () =>
  Object.fromEntries(WORKSPACE_COLLECTIONS.map((collection) => [collection, []]));

const workspace = {
  ...emptyWorkspace(),
  worlds: [
    {
      id: "world-a",
      name: "北境编年史",
      description: "大型剧情项目",
      updatedAt: "2026-07-12T00:00:00.000Z"
    }
  ],
  entities: [
    {
      id: "entity-a",
      worldId: "world-a",
      title: "雾堡骑士",
      summary: "守卫北境边关",
      content: "她正在追踪失落的星银剑。",
      updatedAt: "2026-07-12T00:00:00.000Z"
    },
    {
      id: "entity-b",
      worldId: "world-a",
      title: "黑塔议会",
      summary: "秘密组织",
      content: "掌握禁忌星象术。",
      updatedAt: "2026-07-12T00:00:00.000Z"
    }
  ],
  quests: [
    {
      id: "quest-a",
      worldId: "world-a",
      title: "寻找星银剑",
      summary: "穿越北境",
      steps: [],
      updatedAt: "2026-07-12T00:00:00.000Z"
    }
  ],
  maps: [
    {
      id: "map-a",
      worldId: "world-a",
      title: "北境地图",
      description: "边境与王都",
      updatedAt: "2026-07-12T00:00:00.000Z"
    }
  ],
  mapMarkers: [
    {
      id: "marker-a",
      mapId: "map-a",
      label: "雾鸦堡",
      description: "北境山口",
      updatedAt: "2026-07-12T00:00:00.000Z"
    }
  ],
  consistencySettings: [
    {
      id: "consistency-settings:world-a",
      worldId: "world-a",
      disabledRuleIds: [],
      maxMissingTemplateFields: 0,
      maxRouteMarkerVisits: 1,
      updatedAt: "2026-07-12T00:00:00.000Z"
    }
  ]
};

function createSchema8Database() {
  const database = new Database(dbPath);
  database.exec(`
    CREATE TABLE app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE workspace_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reason TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  database
    .prepare("INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?)")
    .run("schema_version", "8", "2026-07-12T00:00:00.000Z");
  database
    .prepare("INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?)")
    .run("workspace_data", JSON.stringify(workspace), "2026-07-12T00:00:00.000Z");
  database
    .prepare("INSERT INTO workspace_snapshots (reason, data, created_at) VALUES (?, ?, ?)")
    .run("autosave", JSON.stringify(workspace), "2026-07-12T00:00:00.000Z");
  database.close();
}

let store;
try {
  createSchema8Database();
  store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 11, now });
  store.open();

  const migrated = store.load();
  assert.deepEqual(migrated.data, workspace);
  assert.equal(migrated.updatedAt, "2026-07-12T00:00:00.000Z");
  assert.deepEqual(migrated.warnings, []);

  const diagnostics = store.diagnostics();
  assert.equal(diagnostics.schemaVersion, 11);
  assert.equal(diagnostics.storageFormat, STORAGE_FORMAT);
  assert.equal(diagnostics.ok, true);
  assert.equal(diagnostics.quickCheck, "ok");
  assert.equal(diagnostics.foreignKeyIssues, 0);
  assert.equal(diagnostics.itemCount, 7);
  assert.equal(diagnostics.itemCounts.entities, 2);
  assert.equal(diagnostics.itemCounts.mapMarkers, 1);
  assert.equal(diagnostics.versionCount, 7);
  assert.equal(diagnostics.ftsAvailable, true);
  assert.equal(diagnostics.searchCount, 7);
  assert.equal(diagnostics.searchMapCount, 7);
  assert.equal(diagnostics.migrationBackups.length, 1);
  assert.equal(fs.existsSync(diagnostics.migrationBackups[0].filePath), true);
  assert.equal(diagnostics.lastMigration.from, 8);
  assert.equal(diagnostics.lastMigration.to, 11);

  const backupDatabase = new Database(diagnostics.migrationBackups[0].filePath, {
    readonly: true
  });
  assert.equal(
    backupDatabase.prepare("SELECT value FROM app_meta WHERE key = 'schema_version'").get().value,
    "8"
  );
  assert.throws(
    () => backupDatabase.prepare("SELECT COUNT(*) FROM workspace_items").get(),
    /no such table/
  );
  backupDatabase.close();

  const chineseSearch = store.search("北境", "world-a");
  assert.equal(chineseSearch.some((result) => result.searchKey === "entity:entity-a"), true);
  assert.equal(chineseSearch.some((result) => result.searchKey === "map:map-a"), true);
  const titleSearch = store.search("星银剑", "world-a");
  assert.equal(titleSearch.some((result) => result.searchKey === "quest:quest-a"), true);

  const changed = structuredClone(workspace);
  changed.entities[0].summary = "守卫北境边关并追踪失落武器";
  changed.entities[0].updatedAt = "2026-07-12T01:01:00.000Z";
  const changedResult = store.save(changed, "autosave");
  assert.equal(changedResult.updated, 1);
  assert.equal(changedResult.inserted, 0);
  assert.equal(changedResult.deleted, 0);
  assert.equal(changedResult.versionsAdded, 1);
  assert.equal(changedResult.bytesWritten > 0, true);
  assert.equal(store.load().data.entities[0].summary, changed.entities[0].summary);

  const unchangedResult = store.save(changed, "autosave");
  assert.equal(unchangedResult.updated, 0);
  assert.equal(unchangedResult.inserted, 0);
  assert.equal(unchangedResult.deleted, 0);
  assert.equal(unchangedResult.bytesWritten, 0);
  assert.equal(unchangedResult.unchanged, 7);

  const entityVersions = store.listObjectVersions("entities", "entity-a");
  assert.equal(entityVersions.length, 2);
  assert.equal(entityVersions[0].item.summary, changed.entities[0].summary);
  assert.equal(entityVersions[1].item.summary, workspace.entities[0].summary);

  const deleted = structuredClone(changed);
  deleted.quests = [];
  const deleteResult = store.save(deleted, "before-quest-delete");
  assert.equal(deleteResult.deleted, 1);
  assert.equal(store.load().data.quests.length, 0);
  const questVersions = store.listObjectVersions("quests", "quest-a");
  assert.equal(questVersions.length >= 1, true);
  assert.equal(questVersions[0].item.title, "寻找星银剑");

  const recent = store.listRecentVersions("world-a", 20);
  assert.equal(recent.some((version) => version.collection === "entities"), true);
  assert.equal(recent.some((version) => version.collection === "quests"), true);
  assert.equal(recent.every((version) => version.worldId === "world-a"), true);

  const rebuild = store.rebuildSearchIndex();
  assert.equal(rebuild.ok, true);
  assert.equal(rebuild.indexed, 6);
  assert.equal(store.diagnostics().searchCount, 6);
  assert.equal(store.diagnostics().searchMapCount, 6);

  store.db
    .prepare("DELETE FROM workspace_search_rows WHERE collection = ? AND row_key = ?")
    .run("entities", "entity-a");
  const damagedSearchMap = store.diagnostics();
  assert.equal(damagedSearchMap.searchMapCount, 5);
  assert.equal(damagedSearchMap.ok, false);
  store.close();
  store.open();
  assert.equal(store.diagnostics().searchMapCount, 6);
  assert.equal(store.diagnostics().ok, true);

  store.db
    .prepare("UPDATE workspace_items SET data = ? WHERE collection = ? AND row_key = ?")
    .run("{broken", "entities", "entity-b");
  const damaged = store.diagnostics();
  assert.equal(damaged.ok, false);
  assert.deepEqual(damaged.invalidItems, ["entities/entity-b"]);
  const damagedLoad = store.load();
  assert.equal(damagedLoad.warnings.length, 1);
  assert.equal(damagedLoad.data.entities.length, 1);

  const rollback = store.restoreMigrationBackup(
    path.basename(diagnostics.migrationBackups[0].filePath)
  );
  assert.equal(rollback.ok, true);
  assert.deepEqual(rollback.data, workspace);
  assert.equal(fs.existsSync(rollback.safetyBackup), true);
  assert.equal(rollback.restoredFrom, diagnostics.migrationBackups[0].filePath);
  assert.equal(store.diagnostics().schemaVersion, 11);
  assert.equal(store.diagnostics().ok, true);
  assert.deepEqual(store.diagnostics().invalidItems, []);

  store.close();
  const freshPath = path.join(root, "fresh.sqlite");
  const fresh = new WorkspaceStore({ dbPath: freshPath, backupDir, schemaVersion: 11, now });
  const freshLoad = fresh.load();
  assert.equal(freshLoad.data, null);
  assert.equal(fresh.diagnostics().schemaVersion, 11);
  fresh.close();

  const schema9Path = path.join(root, "schema-10.sqlite");
  const schema9Workspace = structuredClone(workspace);
  schema9Workspace.narrativeMilestones = [
    {
      id: "milestone-a",
      worldId: "world-a",
      title: "北境序章制作",
      summary: "串联任务与雾堡开场",
      act: "序章",
      status: "drafting",
      priority: "critical",
      order: 0,
      targetDate: "2026-08-01",
      blockedReason: "",
      developerNotes: "先完成任务触发与对白",
      dependencyIds: [],
      linkedQuestIds: ["quest-a"],
      linkedSceneIds: [],
      linkedEntityIds: ["entity-a"],
      linkedTimelineEventIds: [],
      linkedMapMarkerIds: ["marker-a"],
      linkedReviewIssueIds: [],
      createdAt: "2026-07-12T04:30:00.000Z",
      updatedAt: "2026-07-12T04:30:00.000Z"
    }
  ];
  schema9Workspace.entityTemplates = [
    {
      id: "template-a",
      worldId: "world-a",
      name: "角色制作模板",
      description: "schema 10 migration source",
      entityTypes: ["character"],
      fields: [{ id: "field-a", key: "goal", label: "目标", type: "textarea", required: true, secret: false, defaultValue: "", options: [], targetEntityTypes: [], order: 0 }],
      builtIn: false,
      createdAt: "2026-07-12T04:30:00.000Z",
      updatedAt: "2026-07-12T04:30:00.000Z"
    }
  ];
  const schema9Store = new WorkspaceStore({
    dbPath: schema9Path,
    backupDir,
    schemaVersion: 10,
    now
  });
  schema9Store.save(schema9Workspace, "schema-9-seed");
  assert.equal(schema9Store.diagnostics().schemaVersion, 10);
  schema9Store.close();

  const schema10Store = new WorkspaceStore({
    dbPath: schema9Path,
    backupDir,
    schemaVersion: 11,
    now
  });
  const schema10Load = schema10Store.load();
  const schema10Diagnostics = schema10Store.diagnostics();
  assert.deepEqual(schema10Load.data, schema9Workspace);
  assert.equal(schema10Diagnostics.schemaVersion, 11);
  assert.equal(schema10Diagnostics.lastMigration.from, 10);
  assert.equal(schema10Diagnostics.lastMigration.to, 11);
  assert.equal(fs.existsSync(schema10Diagnostics.lastMigration.backupPath), true);
  assert.equal(schema10Diagnostics.searchCount, schema10Diagnostics.itemCount);
  assert.equal(
    schema10Store.search("北境序章", "world-a")[0]?.searchKey,
    "milestone:milestone-a"
  );
  assert.equal(
    schema10Store.listObjectVersions("narrativeMilestones", "milestone-a")[0]?.item.title,
    "北境序章制作"
  );
  assert.equal(
    schema10Store.search("角色制作模板", "world-a")[0]?.searchKey,
    "template:template-a"
  );
  assert.equal(
    schema10Store.listObjectVersions("entityTemplates", "template-a")[0]?.item.name,
    "角色制作模板"
  );
  const schema9Backup = new Database(schema10Diagnostics.lastMigration.backupPath, {
    readonly: true
  });
  assert.equal(
    schema9Backup.prepare("SELECT value FROM app_meta WHERE key = 'schema_version'").get().value,
    "10"
  );
  assert.equal(
    schema9Backup
      .prepare("SELECT COUNT(*) count FROM workspace_items WHERE collection = 'narrativeMilestones'")
      .get().count,
    1
  );
  assert.equal(
    schema9Backup
      .prepare("SELECT COUNT(*) count FROM workspace_items WHERE collection = 'entityTemplates'")
      .get().count,
    1
  );
  schema9Backup.close();
  schema10Store.close();

  const codexPath = path.join(root, "codex-categories.sqlite");
  const codexStore = new WorkspaceStore({
    dbPath: codexPath,
    backupDir,
    schemaVersion: 17,
    now
  });
  const codexWorkspace = {
    ...emptyWorkspace(),
    worlds: [{ id: "world-codex", name: "分类存储测试" }],
    mapLayers: [
      {
        id: "map-layer-codex",
        worldId: "world-codex",
        mapId: "map-codex",
        title: "剧情标记层",
        visible: true,
        locked: false
      }
    ],
    mapMarkerGroups: [
      {
        id: "marker-group-codex",
        worldId: "world-codex",
        mapId: "map-codex",
        title: "主线标记",
        visible: true,
        locked: false
      }
    ],
    codexCategories: [
      {
        id: "category-characters",
        worldId: "world-codex",
        parentId: "",
        title: "主要角色资料",
        description: "角色与关系",
        order: 0
      }
    ],
    entities: [
      {
        id: "entity-codex",
        worldId: "world-codex",
        type: "character",
        title: "守灯人岚",
        categoryId: "category-characters",
        order: 0
      }
    ]
  };
  codexStore.save(codexWorkspace, "codex-category-seed");
  assert.deepEqual(codexStore.load().data, codexWorkspace);
  assert.equal(codexStore.diagnostics().itemCounts.codexCategories, 1);
  assert.equal(codexStore.diagnostics().itemCounts.mapLayers, 1);
  assert.equal(codexStore.diagnostics().itemCounts.mapMarkerGroups, 1);
  assert.equal(
    codexStore.search("主要角色资料", "world-codex")[0]?.searchKey,
    "category:category-characters"
  );
  assert.equal(
    codexStore.listObjectVersions("codexCategories", "category-characters")[0]?.item.title,
    "主要角色资料"
  );
  assert.equal(
    codexStore.search("剧情标记层", "world-codex")[0]?.searchKey,
    "map-layer:map-layer-codex"
  );
  for (let index = 1; index <= 8; index += 1) {
    codexWorkspace.entities[0] = {
      ...codexWorkspace.entities[0],
      summary: `历史版本 ${index}`,
      updatedAt: `2026-07-18T00:00:0${index}.000Z`
    };
    codexStore.save(codexWorkspace, `history-${index}`);
  }
  const historyDiagnostics = codexStore.diagnostics();
  assert.equal(historyDiagnostics.snapshotCount, 9);
  assert.equal(historyDiagnostics.snapshotBytes > 0, true);
  assert.equal(historyDiagnostics.versionBytes > 0, true);
  assert.equal(historyDiagnostics.maintenanceReclaimableVersions > 0, false);
  assert.equal(historyDiagnostics.maintenanceReclaimableSnapshots, 1);
  assert.equal(historyDiagnostics.maintenanceReclaimableBytes > 0, true);
  const maintenance = codexStore.maintainStorage({ versionLimit: 4, snapshotLimit: 2 });
  assert.equal(maintenance.versionsRemoved > 0, true);
  assert.equal(maintenance.snapshotsRemoved, 7);
  assert.equal(maintenance.after.snapshotCount, 2);
  assert.equal(
    codexStore.listObjectVersions("entities", "entity-codex", 24).length,
    4
  );
  assert.equal(codexStore.load().data.entities[0].summary, "历史版本 8");
  codexStore.close();

  console.log("Workspace store checks passed, including codex category persistence and search.");
} finally {
  store?.close();
  fs.rmSync(root, { recursive: true, force: true });
}
