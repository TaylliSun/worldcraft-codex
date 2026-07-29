const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { WorkspaceStore } = require("../electron/workspace-store.cjs");

const root = path.resolve(__dirname, "..");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "daoist-pantheon-target-audit.json");
const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");
const worldId = "world-chinese-mythology-history";
const coreMarkers = [":mythology:daoism-early:", ":mythology:celestial-bureaucracy:", ":mythology:daoism-lineages:", ":mythology:zhenling-weiye:"];
const expansionRelationMarkers = [":mythology:zhenling-", ":mythology:daoism-thunder-offices:", ":mythology:daoism-fengdu-offices:", ":mythology:daoism-dingjia-guardians:"];
const expansionEventMarkers = [":mythology:zhenling-", ":mythology:daoism-thunder-offices:", ":mythology:daoism-fengdu-offices:", ":mythology:daoism-dingjia-guardians:"];

const isCoreEntry = (entity) => entity.worldId === worldId && coreMarkers.some((marker) => entity.id.includes(marker));
const isDaoistTagged = (entity) => entity.worldId === worldId && (
  entity.templateData?.tradition === "道教"
  || (entity.tags || []).some((tag) => tag === "道教" || tag === "道教神谱" || tag === "道教史")
);

function buildReport(data, diagnostics) {
  const worldEntities = data.entities.filter((entity) => entity.worldId === worldId);
  const entityById = new Map(worldEntities.map((entity) => [entity.id, entity]));
  const coreEntries = worldEntities.filter((entity) => isCoreEntry(entity) || isDaoistTagged(entity));
  const zhenlingIdentityIds = new Set(data.relations
    .filter((relation) => relation.worldId === worldId && relation.id.includes(":mythology:zhenling-") && relation.kind === "contains")
    .map((relation) => relation.targetEntityId)
    .filter((id) => entityById.get(id)?.type === "character"));
  const identityIds = new Set([
    ...coreEntries.filter((entity) => entity.type === "character").map((entity) => entity.id),
    ...zhenlingIdentityIds
  ]);
  const identities = [...identityIds].map((id) => entityById.get(id)).filter(Boolean);
  const zhenlingIdentities = identities.filter((entity) => entity.templateId?.endsWith(":zhenling-catalog-entry") || zhenlingIdentityIds.has(entity.id));
  const identityTypes = identities.reduce((counts, entity) => {
    const key = entity.templateData?.identityType || "未分类";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const entryTypes = coreEntries.reduce((counts, entity) => {
    counts[entity.type] = (counts[entity.type] || 0) + 1;
    return counts;
  }, {});
  const rankCounts = zhenlingIdentities.reduce((counts, entity) => {
    const rank = entity.templateData?.rankPosition || "复用身份";
    counts[rank] = (counts[rank] || 0) + 1;
    return counts;
  }, {});
  const expansionRelations = data.relations.filter((relation) => relation.worldId === worldId && expansionRelationMarkers.some((marker) => relation.id.includes(marker)));
  const expansionEvents = data.timelineEvents.filter((event) => event.worldId === worldId && expansionEventMarkers.some((marker) => event.id.includes(marker)));
  const targetChecks = {
    identitiesAtLeast700: identities.length >= 700,
    entriesAtLeast850: coreEntries.length >= 850,
    expansionRelationsAtLeast1800: expansionRelations.length >= 1800,
    expansionEventsAtLeast120: expansionEvents.length >= 120
  };
  return {
    ok: diagnostics.ok,
    generatedAt: new Date().toISOString(),
    counts: {
      independentDaoistIdentities: identities.length,
      daoistSectionEntries: coreEntries.length,
      zhenlingIdentityLinks: zhenlingIdentityIds.size,
      zhenlingCanonicalIdentities: zhenlingIdentities.length,
      expansionRelations: expansionRelations.length,
      expansionTimelineEvents: expansionEvents.length
    },
    remaining: {
      identities: Math.max(0, 700 - identities.length),
      entries: Math.max(0, 850 - coreEntries.length),
      relations: Math.max(0, 1800 - expansionRelations.length),
      timelineEvents: Math.max(0, 120 - expansionEvents.length)
    },
    targetChecks,
    breakdown: { identityTypes, entryTypes, rankCounts },
    diagnostics: { ok: diagnostics.ok, schemaVersion: diagnostics.schemaVersion, quickCheck: diagnostics.quickCheck, foreignKeyIssues: diagnostics.foreignKeyIssues, dbPath: diagnostics.dbPath }
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
