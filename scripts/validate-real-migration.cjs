const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const Database = require("better-sqlite3");
const {
  WORKSPACE_COLLECTIONS,
  WorkspaceStore
} = require("../electron/workspace-store.cjs");

const [mode, dbPath, snapshotPath, versionArgument] = process.argv.slice(2);

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function readDatabase(filePath) {
  const db = new Database(filePath, { readonly: true });
  try {
    const schemaVersion = Number(
      db.prepare("SELECT value FROM app_meta WHERE key = 'schema_version'").get()?.value ?? 0
    );
    const workspaceJson = db.prepare("SELECT value FROM app_meta WHERE key = 'workspace_data'").get()?.value;
    const hasObjectRows = Boolean(
      db.prepare("SELECT 1 found FROM sqlite_master WHERE type = 'table' AND name = 'workspace_items'").get()
    );
    const data = workspaceJson
      ? JSON.parse(workspaceJson)
      : hasObjectRows
        ? Object.fromEntries(
            WORKSPACE_COLLECTIONS.map((collection) => [
              collection,
              db
                .prepare("SELECT data FROM workspace_items WHERE collection = ? ORDER BY position, row_key")
                .all(collection)
                .map((row) => JSON.parse(row.data))
            ])
          )
        : null;
    return {
      schemaVersion,
      quickCheck: db.pragma("quick_check", { simple: true }),
      workspaceJson: data ? JSON.stringify(data) : "",
      data
    };
  } finally {
    db.close();
  }
}

function collectionSummary(data) {
  return Object.fromEntries(
    WORKSPACE_COLLECTIONS.map((collection) => {
      const items = Array.isArray(data?.[collection]) ? data[collection] : [];
      return [collection, { count: items.length, hash: hash(JSON.stringify(items)) }];
    })
  );
}

if (!mode || !dbPath || !snapshotPath) {
  throw new Error("Usage: validate-real-migration.cjs <capture|verify> <dbPath> <snapshotPath> [schemaVersion]");
}

if (mode === "capture") {
  const expectedFromVersion = Number(versionArgument || 10);
  const legacy = readDatabase(dbPath);
  assert.equal(legacy.schemaVersion, expectedFromVersion);
  assert.equal(legacy.quickCheck, "ok");
  assert.ok(legacy.data);
  const snapshot = {
    schemaVersion: legacy.schemaVersion,
    workspaceHash: hash(legacy.workspaceJson),
    workspaceBytes: Buffer.byteLength(legacy.workspaceJson),
    collections: collectionSummary(legacy.data)
  };
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
  console.log(JSON.stringify(snapshot, null, 2));
} else if (mode === "verify") {
  const targetVersion = Number(versionArgument || 11);
  const expected = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  const backupDir = require("node:path").join(require("node:path").dirname(dbPath), "backups");
  const store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: targetVersion });
  try {
    const loaded = store.load();
    const diagnostics = store.diagnostics();
    const actualCollections = collectionSummary(loaded.data);
    const initializedCollections =
      expected.schemaVersion === 10 && targetVersion === 11 ? ["entityTemplates"] : [];
    const preservedActual = Object.fromEntries(
      Object.entries(actualCollections).filter(([collection]) => !initializedCollections.includes(collection))
    );
    const preservedExpected = Object.fromEntries(
      Object.entries(expected.collections).filter(([collection]) => !initializedCollections.includes(collection))
    );

    assert.equal(diagnostics.schemaVersion, targetVersion);
    assert.equal(diagnostics.quickCheck, "ok");
    assert.equal(diagnostics.ok, true);
    assert.equal(diagnostics.ftsAvailable, true);
    assert.equal(diagnostics.searchCount, diagnostics.itemCount);
    assert.equal(diagnostics.searchMapCount, diagnostics.searchCount);
    assert.deepEqual(preservedActual, preservedExpected);
    if (initializedCollections.includes("entityTemplates")) {
      assert.equal(actualCollections.entityTemplates.count >= 6, true);
    }
    assert.equal(
      diagnostics.itemCount,
      Object.values(preservedExpected).reduce((total, collection) => total + collection.count, 0) +
        initializedCollections.reduce(
          (total, collection) => total + actualCollections[collection].count,
          0
        )
    );
    assert.equal(diagnostics.lastMigration.from, expected.schemaVersion);
    assert.equal(diagnostics.lastMigration.to, targetVersion);
    assert.equal(fs.existsSync(diagnostics.lastMigration.backupPath), true);

    const migrationBackup = readDatabase(diagnostics.lastMigration.backupPath);
    assert.equal(migrationBackup.schemaVersion, expected.schemaVersion);
    assert.equal(migrationBackup.quickCheck, "ok");
    assert.equal(hash(migrationBackup.workspaceJson), expected.workspaceHash);

    console.log(
      JSON.stringify(
        {
          ok: true,
          from: expected.schemaVersion,
          to: diagnostics.schemaVersion,
          itemCount: diagnostics.itemCount,
          versionCount: diagnostics.versionCount,
          searchCount: diagnostics.searchCount,
          migrationBackup: diagnostics.lastMigration.backupPath,
          collections: actualCollections
        },
        null,
        2
      )
    );
  } finally {
    store.close();
  }
} else {
  throw new Error(`Unknown mode: ${mode}`);
}
