const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const {
  OBJECT_VERSION_RETENTION,
  WORKSPACE_COLLECTIONS,
  WorkspaceStore
} = require("../electron/workspace-store.cjs");

const root = path.join(__dirname, "..", "validation", `release-resilience-${process.pid}`);
const backupDir = path.join(root, "backups");
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });

const emptyWorkspace = () =>
  Object.fromEntries(WORKSPACE_COLLECTIONS.map((collection) => [collection, []]));
const makeWorkspace = (revision = 0) => ({
  ...emptyWorkspace(),
  worlds: [{ id: "world-a", name: "Release fixture", revision }],
  entities: [
    {
      id: "entity-a",
      worldId: "world-a",
      title: "Persistent character",
      content: `revision-${revision}`
    }
  ],
  assets: [
    {
      id: "asset-missing",
      worldId: "world-a",
      name: "Missing source",
      storedName: "missing-source.png"
    }
  ]
});

let assertions = 0;
function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

const stores = [];
try {
  const lockPath = path.join(root, "locked.sqlite");
  const writer = new WorkspaceStore({ dbPath: lockPath, backupDir, schemaVersion: 11 });
  const contender = new WorkspaceStore({ dbPath: lockPath, backupDir, schemaVersion: 11 });
  stores.push(writer, contender);
  writer.save(makeWorkspace(0), "initial-seed");
  contender.open();
  contender.db.pragma("busy_timeout = 50");
  writer.db.exec("BEGIN IMMEDIATE");
  assert.throws(() => contender.save(makeWorkspace(1), "autosave"), /locked|busy/i);
  assertions += 1;
  writer.db.exec("ROLLBACK");
  check(contender.save(makeWorkspace(1), "autosave").updated, 2, "save resumes after lock");
  check(contender.diagnostics().quickCheck, "ok", "lock failure keeps database healthy");

  contender.close();
  writer.close();
  const readonly = new Database(lockPath, { readonly: true, fileMustExist: true });
  assert.throws(
    () => readonly.prepare("UPDATE app_meta SET value = '0' WHERE key = 'schema_version'").run(),
    /readonly/i
  );
  assertions += 1;
  check(readonly.pragma("quick_check", { simple: true }), "ok", "readonly probe is nondestructive");
  readonly.close();

  const parentIsFile = path.join(root, "not-a-directory");
  fs.writeFileSync(parentIsFile, "blocked", "utf8");
  const unwritable = new WorkspaceStore({
    dbPath: path.join(parentIsFile, "workspace.sqlite"),
    backupDir,
    schemaVersion: 11
  });
  assert.throws(() => unwritable.save(makeWorkspace(0), "autosave"));
  assertions += 1;

  const autosavePath = path.join(root, "autosave.sqlite");
  const autosave = new WorkspaceStore({ dbPath: autosavePath, backupDir, schemaVersion: 11 });
  stores.push(autosave);
  for (let revision = 0; revision < 120; revision += 1) {
    autosave.save(makeWorkspace(revision), "autosave");
  }
  check(autosave.load().data.entities[0].content, "revision-119", "last autosave wins");
  check(autosave.diagnostics().quickCheck, "ok", "continuous autosave remains healthy");
  check(
    autosave.listObjectVersions("entities", "entity-a").length,
    OBJECT_VERSION_RETENTION,
    "object history is bounded"
  );
  check(
    fs.existsSync(path.join(root, "assets", "missing-source.png")),
    false,
    "missing resource fixture remains detectable"
  );

  autosave.db
    .prepare("UPDATE workspace_items SET data = ? WHERE collection = ? AND row_key = ?")
    .run("{damaged", "entities", "entity-a");
  check(autosave.diagnostics().ok, false, "damaged object fails diagnostics");
  check(autosave.load().warnings.length, 1, "damaged object is isolated during load");
  check(autosave.load().data.worlds.length, 1, "healthy objects remain readable");

  autosave.close();
  const reopened = new WorkspaceStore({ dbPath: autosavePath, backupDir, schemaVersion: 11 });
  stores.push(reopened);
  check(reopened.diagnostics().quickCheck, "ok", "abrupt-style reopen passes SQLite check");
  check(reopened.load().warnings.length, 1, "reopen preserves corruption warning");

  console.log(`Release resilience checks passed: ${assertions} assertions across 6 scenarios.`);
} finally {
  for (const store of stores) store.close();
  fs.rmSync(root, { recursive: true, force: true });
}
