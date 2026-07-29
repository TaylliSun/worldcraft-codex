const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  ReleaseLogger,
  buildDiagnosticBundle,
  sanitizeLogEntry,
  writeDiagnosticBundle
} = require("../electron/release-diagnostics.cjs");

const root = path.join(__dirname, "..", "validation", `release-diagnostics-${process.pid}`);
fs.rmSync(root, { recursive: true, force: true });
let tick = 0;
const now = () => new Date(Date.UTC(2026, 6, 12, 12, 0, tick++)).toISOString();

try {
  const logger = new ReleaseLogger({ logDir: path.join(root, "logs"), now, maxBytes: 180 });
  assert.equal(logger.initialize().endsWith("worldcraft.log.jsonl"), true);
  logger.log("info", "app.started", { message: "SECRET STORY CONTENT" });
  logger.log("error", "store.save-failed", {
    error: Object.assign(new Error("C:\\Users\\writer\\secret.wcodex"), { code: "SQLITE_BUSY" })
  });
  assert.equal(fs.existsSync(logger.logPath), true);
  assert.equal(logger.readRecent().some((event) => event.event === "store.save-failed"), true);
  assert.equal(JSON.stringify(logger.readRecent()).includes("SECRET STORY CONTENT"), false);
  assert.equal(JSON.stringify(logger.readRecent()).includes("Users"), false);
  assert.equal(logger.readRecent().some((event) => event.errorCode === "sqlite_busy"), true);

  for (let index = 0; index < 12; index += 1) logger.log("info", `test.event-${index}`);
  assert.equal(fs.existsSync(logger.previousLogPath), true);
  assert.equal(logger.readRecent(5).length, 5);

  const sanitized = sanitizeLogEntry({
    timestamp: "2026-07-12T12:00:00.000Z",
    level: "not-level",
    event: "Renderer Error with spaces",
    message: "private body"
  });
  assert.equal(sanitized.level, "info");
  assert.equal(sanitized.event, "renderer-error-with-spaces");
  assert.equal("message" in sanitized, false);

  const bundle = buildDiagnosticBundle({
    appVersion: "1.4.0-rc.1",
    schemaVersion: 11,
    generatedAt: now(),
    runtime: { platform: "win32", architecture: "x64", osRelease: "10.0.26200", packaged: true },
    diagnostics: {
      ok: false,
      quickCheck: "ok",
      foreignKeyIssues: 1,
      invalidItems: ["entities/secret-id"],
      duplicates: [{ collection: "entities", itemId: "secret-id" }],
      itemCount: 42,
      itemCounts: { entities: 6, narrativeMilestones: 3, "bad/path": 99 },
      versionCount: 50,
      ftsAvailable: true,
      searchCount: 42,
      searchMapCount: 42,
      dbSize: 4096,
      walSize: 512,
      dbPath: "C:\\Users\\writer\\worldcraft.sqlite",
      lastMigration: { from: 10, to: 11, completedAt: now(), backupPath: "C:\\secret.sqlite" }
    },
    events: [
      { timestamp: now(), level: "error", event: "renderer.error", message: "secret text" }
    ],
    backups: { total: 4, valid: 3, damaged: 1 },
    assets: { metadataCount: 8, localFileCount: 7, missingFileCount: 1 },
    apiKey: "sk-secret"
  });
  assert.equal(bundle.format, "worldcraft-codex-diagnostics-v1");
  assert.equal(bundle.application.schemaVersion, 11);
  assert.equal(bundle.storage.invalidItemCount, 1);
  assert.equal(bundle.storage.duplicateCount, 1);
  assert.deepEqual(bundle.storage.itemCounts, { entities: 6, narrativeMilestones: 3 });
  assert.equal(bundle.migration.backupRecorded, true);
  assert.equal(bundle.backups.damaged, 1);
  assert.equal(bundle.assets.missingFileCount, 1);
  assert.equal(bundle.privacy.includesProjectContent, false);
  const serialized = JSON.stringify(bundle);
  assert.equal(serialized.includes("secret-id"), false);
  assert.equal(serialized.includes("secret text"), false);
  assert.equal(serialized.includes("sk-secret"), false);
  assert.equal(serialized.includes("C:\\\\Users"), false);

  const outputPath = path.join(root, "exports", "diagnostics.json");
  const output = writeDiagnosticBundle(outputPath, bundle);
  assert.equal(fs.existsSync(output.filePath), true);
  assert.equal(output.bytes > 100, true);
  assert.deepEqual(JSON.parse(fs.readFileSync(output.filePath, "utf8")), bundle);
  console.log("Release diagnostics checks passed: 28 assertions across 4 scenarios.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
