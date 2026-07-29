const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const {
  STORAGE_FORMAT,
  WORKSPACE_COLLECTIONS,
  WorkspaceStore,
  workspaceRows
} = require("../electron/workspace-store.cjs");

const root = path.join(__dirname, "..", "validation", `migration-matrix-${process.pid}`);
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });

const emptyWorkspace = () =>
  Object.fromEntries(WORKSPACE_COLLECTIONS.map((collection) => [collection, []]));
const workspace = {
  ...emptyWorkspace(),
  worlds: [{ id: "world-matrix", name: "Migration matrix" }],
  entityTemplates: [
    {
      id: "template-matrix",
      worldId: "world-matrix",
      name: "Character template",
      fields: [{ id: "field-goal", key: "goal", label: "Goal", secret: true }]
    }
  ],
  entities: [
    {
      id: "entity-matrix",
      worldId: "world-matrix",
      title: "Hash-stable character",
      content: "This body must remain byte-for-byte stable."
    }
  ],
  narrativeMilestones: [
    {
      id: "milestone-matrix",
      worldId: "world-matrix",
      title: "Playable prologue",
      status: "drafting"
    }
  ],
  aiMemoryItems: [
    {
      id: "legacy-memory-matrix",
      worldId: "world-matrix",
      category: "canon",
      state: "confirmed",
      title: "Legacy memory",
      content: "This pre-1.7 memory must remain byte-for-byte stable.",
      sourceContextId: "entity:entity-matrix",
      pinned: false,
      createdAt: "2026-07-12T00:00:00.000Z",
      updatedAt: "2026-07-12T00:00:00.000Z"
    }
  ],
  aiOperationRuns: [
    {
      id: "legacy-ai-operation-matrix",
      worldId: "world-matrix",
      instruction: "Preserve this audit run during migration.",
      summary: "Migration-stable AI operation",
      model: "matrix-model",
      status: "undone",
      operations: [],
      changes: [],
      checkpointCreatedAt: "2026-07-13T00:00:00.000Z",
      createdAt: "2026-07-13T00:00:00.000Z",
      updatedAt: "2026-07-13T00:00:00.000Z",
      undoneAt: "2026-07-13T00:00:00.000Z"
    }
  ]
};

const expectedHashes = new Map(
  workspaceRows(workspace).map((row) => [`${row.collection}/${row.rowKey}`, row.hash])
);
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

function createSchema8(dbPath) {
  const database = new Database(dbPath);
  database.exec(`
    CREATE TABLE app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE workspace_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reason TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  const insert = database.prepare(
    "INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?)"
  );
  insert.run("schema_version", "8", "2026-07-12T00:00:00.000Z");
  insert.run("workspace_data", JSON.stringify(workspace), "2026-07-12T00:00:00.000Z");
  database.close();
}

function objectHashes(store) {
  return new Map(
    store.db
      .prepare("SELECT collection, row_key, data_hash FROM workspace_items")
      .all()
      .map((row) => [`${row.collection}/${row.row_key}`, row.data_hash])
  );
}

for (const fromVersion of [8, 9, 10, 11, 12, 13, 14, 15, 16]) {
  const caseRoot = path.join(root, `schema-${fromVersion}`);
  const dbPath = path.join(caseRoot, "worldcraft-codex.sqlite");
  const backupDir = path.join(caseRoot, "backups");
  fs.mkdirSync(caseRoot, { recursive: true });

  if (fromVersion === 8) {
    createSchema8(dbPath);
  } else {
    const source = new WorkspaceStore({ dbPath, backupDir, schemaVersion: fromVersion });
    source.save(workspace, "matrix-seed");
    source.close();
  }

  const target = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  target.open();
  const diagnostics = target.diagnostics();
  const migratedHashes = objectHashes(target);

  check(diagnostics.schemaVersion, 17, `schema ${fromVersion} upgrades to 17`);
  check(diagnostics.storageFormat, STORAGE_FORMAT, `schema ${fromVersion} uses object rows`);
  check(diagnostics.quickCheck, "ok", `schema ${fromVersion} passes quick_check`);
  check(diagnostics.lastMigration.from, fromVersion, `schema ${fromVersion} migration is recorded`);
  check(diagnostics.lastMigration.to, 17, `schema ${fromVersion} target is recorded`);
  check(fs.existsSync(diagnostics.lastMigration.backupPath), true, "migration backup exists");
  check(target.load().data, workspace, `schema ${fromVersion} preserves workspace values`);
  check(migratedHashes, expectedHashes, `schema ${fromVersion} preserves object hashes`);
  check(diagnostics.searchCount, expectedHashes.size, `schema ${fromVersion} rebuilds search`);

  const backupDatabase = new Database(diagnostics.lastMigration.backupPath, {
    readonly: true,
    fileMustExist: true
  });
  check(
    Number(backupDatabase.prepare("SELECT value FROM app_meta WHERE key = 'schema_version'").get().value),
    fromVersion,
    "migration backup retains its source schema"
  );
  if (fromVersion === 8) {
    check(
      JSON.parse(backupDatabase.prepare("SELECT value FROM app_meta WHERE key = 'workspace_data'").get().value),
      workspace,
      "legacy migration backup preserves workspace JSON"
    );
  } else {
    const backupHashes = new Map(
      backupDatabase
        .prepare("SELECT collection, row_key, data_hash FROM workspace_items")
        .all()
        .map((row) => [`${row.collection}/${row.row_key}`, row.data_hash])
    );
    check(backupHashes, expectedHashes, "migration backup preserves source object hashes");
  }
  backupDatabase.close();

  const backupName = path.basename(diagnostics.lastMigration.backupPath);
  const rollback = target.restoreMigrationBackup(backupName);
  check(rollback.ok, true, "rollback succeeds");
  check(fs.existsSync(rollback.safetyBackup), true, "rollback creates a safety backup");
  check(target.diagnostics().schemaVersion, 17, "rollback source is upgraded again on reopen");
  check(objectHashes(target), expectedHashes, "rollback and re-upgrade preserve hashes");
  target.close();
}

console.log(`Migration matrix checks passed: ${assertions} assertions across 9 upgrade paths.`);
fs.rmSync(root, { recursive: true, force: true });
