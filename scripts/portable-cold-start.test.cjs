const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const Database = require("better-sqlite3");

const root = path.resolve(__dirname, "..");
const version = process.argv[2] || require(path.join(root, "package.json")).version;
const expectedSchema = Number(process.argv[3] || 17);
const executablePath = path.resolve(
  process.argv[4] || path.join(root, "release", `Worldcraft Codex-Portable-${version}.exe`)
);
const userDataDir = path.resolve(
  process.argv[5] || path.join(root, "validation", `portable-cold-start-${version}`)
);
const validationDir = `${path.join(root, "validation")}${path.sep}`.toLocaleLowerCase("en-US");
const logPath = path.join(userDataDir, "logs", "worldcraft.log.jsonl");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const portableTempDir = path.join(userDataDir, "portable-temp");
const reportPath = path.join(root, "validation", `portable-cold-start-${version}.json`);
let assertions = 0;
let child = null;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function readEvents() {
  if (!fs.existsSync(logPath)) return [];
  return fs
    .readFileSync(logPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function waitForReady(timeout = 120000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const events = readEvents();
    if (events.some((entry) => entry.event === "window.ready")) {
      return { elapsedMs: Date.now() - started, events };
    }
    if (child?.exitCode != null) {
      throw new Error(`Portable process exited before window.ready with ${child.exitCode}.`);
    }
    await delay(250);
  }
  throw new Error(`Portable process did not report window.ready within ${timeout}ms.`);
}

function productVersion() {
  const result = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "(Get-Item -LiteralPath $env:WORLDCRAFT_PORTABLE_TEST_EXE).VersionInfo.ProductVersion"
    ],
    {
      encoding: "utf8",
      env: { ...process.env, WORLDCRAFT_PORTABLE_TEST_EXE: executablePath },
      timeout: 30000,
      windowsHide: true
    }
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || "Unable to read portable version.");
  return result.stdout.trim();
}

function inspectDatabase() {
  const database = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    return {
      quickCheck: database.pragma("quick_check", { simple: true }),
      schemaVersion: Number(
        database.prepare("SELECT value FROM app_meta WHERE key = 'schema_version'").get()?.value || 0
      )
    };
  } finally {
    database.close();
  }
}

async function stopProcessTree() {
  if (!child?.pid || child.exitCode != null) return;
  spawnSync("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], {
    encoding: "utf8",
    timeout: 30000,
    windowsHide: true
  });
  for (let attempt = 0; attempt < 40 && child.exitCode == null; attempt += 1) {
    await delay(250);
  }
}

(async () => {
  check(fs.existsSync(executablePath), true, "portable executable exists");
  check(productVersion(), version, "portable executable reports the expected product version");
  if (!`${userDataDir}${path.sep}`.toLocaleLowerCase("en-US").startsWith(validationDir)) {
    throw new Error("Portable test user-data directory must stay inside validation.");
  }
  fs.rmSync(userDataDir, { recursive: true, force: true });
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.mkdirSync(portableTempDir, { recursive: true });
  check(
    path.parse(executablePath).root.toLowerCase(),
    path.parse(portableTempDir).root.toLowerCase(),
    "portable executable and private extraction temp share a spacious volume"
  );

  const childEnv = {
    ...process.env,
    TEMP: portableTempDir,
    TMP: portableTempDir,
    WORLDCRAFT_USER_DATA_DIR: userDataDir
  };
  delete childEnv.ELECTRON_RUN_AS_NODE;
  child = spawn(executablePath, [], {
    cwd: root,
    env: childEnv,
    stdio: "ignore",
    windowsHide: true
  });
  const ready = await waitForReady();
  check(child.exitCode, null, "portable application remains running after showing its window");
  check(ready.events.some((entry) => entry.event === "app.starting"), true, "portable log records app startup");
  check(ready.events.some((entry) => entry.event === "database.opened"), true, "portable log records database open");
  check(ready.events.some((entry) => entry.event === "window.ready"), true, "portable log records a ready main window");
  check(
    ready.events.some((entry) => entry.level === "error"),
    false,
    "portable cold start records no release errors"
  );
  check(fs.existsSync(dbPath), true, "portable application creates its SQLite database");
  const liveDatabase = inspectDatabase();
  check(liveDatabase.schemaVersion, expectedSchema, "portable database uses the expected schema");
  check(liveDatabase.quickCheck, "ok", "portable database passes quick_check while running");

  await stopProcessTree();
  const closedDatabase = inspectDatabase();
  check(closedDatabase.quickCheck, "ok", "portable database remains healthy after test shutdown");

  const report = {
    assertions,
    databasePath: dbPath,
    events: ready.events.map((entry) => entry.event),
    productVersion: version,
    quickCheck: closedDatabase.quickCheck,
    schemaVersion: liveDatabase.schemaVersion,
    startupMs: ready.elapsedMs,
    tempVolume: path.parse(portableTempDir).root
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report));
  console.log(`Portable cold-start checks passed: ${assertions} assertions; report ${reportPath}`);
})().catch(async (error) => {
  await stopProcessTree();
  console.error(error);
  process.exitCode = 1;
});
