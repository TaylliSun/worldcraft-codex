const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { WorkspaceStore } = require("../electron/workspace-store.cjs");

const root = path.resolve(__dirname, "..");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "buddhist-knowledge-target-audit.json");
const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");
const worldId = "world-chinese-mythology-history";
const markers = [
  ":mythology:buddhism-transmission:",
  ":mythology:buddhism-devotion:",
  ":mythology:buddhism-schools:",
  ":mythology:buddhism-prajna:",
  ":mythology:buddhism-pantheon:",
  ":mythology:buddhism-canon:",
  ":mythology:buddhism-canon-supplement:",
  ":mythology:buddhism-han-people:",
  ":mythology:buddhism-tibetan:",
  ":mythology:buddhism-southern-material:"
];
const targets = {
  entries: 1000,
  identities: 500,
  scriptureAndCommentaryEntries: 300,
  relations: 3000,
  timelineEvents: 220
};

const belongsToBuddhistCorpus = (item) => item.worldId === worldId && markers.some((marker) => item.id.includes(marker));

function buildReport(data, diagnostics) {
  const entries = data.entities.filter(belongsToBuddhistCorpus);
  const identities = entries.filter((item) => item.type === "character");
  const scriptureAndCommentaryEntries = entries.filter((item) => item.templateId?.endsWith(":source-text"));
  const relations = data.relations.filter(belongsToBuddhistCorpus);
  const timelineEvents = data.timelineEvents.filter(belongsToBuddhistCorpus);
  const counts = {
    entries: entries.length,
    identities: identities.length,
    scriptureAndCommentaryEntries: scriptureAndCommentaryEntries.length,
    relations: relations.length,
    timelineEvents: timelineEvents.length
  };
  const targetChecks = Object.fromEntries(
    Object.entries(targets).map(([key, target]) => [key, counts[key] >= target])
  );
  const byBatch = Object.fromEntries(markers.map((marker) => [
    marker.split(":").at(-2),
    {
      entries: data.entities.filter((item) => item.worldId === worldId && item.id.includes(marker)).length,
      relations: data.relations.filter((item) => item.worldId === worldId && item.id.includes(marker)).length,
      timelineEvents: data.timelineEvents.filter((item) => item.worldId === worldId && item.id.includes(marker)).length
    }
  ]));
  return {
    ok: diagnostics.ok,
    targetComplete: Object.values(targetChecks).every(Boolean),
    generatedAt: new Date().toISOString(),
    targets,
    counts,
    remaining: Object.fromEntries(
      Object.entries(targets).map(([key, target]) => [key, Math.max(0, target - counts[key])])
    ),
    targetChecks,
    byBatch,
    diagnostics: {
      ok: diagnostics.ok,
      schemaVersion: diagnostics.schemaVersion,
      quickCheck: diagnostics.quickCheck,
      foreignKeyIssues: diagnostics.foreignKeyIssues,
      dbPath: diagnostics.dbPath
    }
  };
}

function main() {
  assert.ok(fs.existsSync(dbPath), `未找到数据库：${dbPath}`);
  fs.mkdirSync(validationDir, { recursive: true });
  const store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  let report;
  try {
    report = buildReport(store.load().data, store.diagnostics());
  } finally {
    store.close();
  }
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  assert.equal(report.ok, true, "SQLite 诊断未通过");
  console.log(JSON.stringify({ reportPath, ...report }, null, 2));
}

if (require.main === module) main();

module.exports = { buildReport };
