const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createProjectPackage } = require("../electron/project-package.cjs");
const { WorkspaceStore, WORKSPACE_COLLECTIONS } = require("../electron/workspace-store.cjs");
const {
  ORIGINAL_ADAPTATION_NOTICE,
  buildMythologyFoundation
} = require("./chinese-mythology-history-data.cjs");
const { buildAncientCoreBatch } = require("./chinese-mythology-ancient-core-data.cjs");
const { buildNaturePantheonBatch } = require("./chinese-mythology-nature-pantheon-data.cjs");
const { buildCivilizationLineagesBatch } = require("./chinese-mythology-civilization-lineages-data.cjs");
const { buildDaoismEarlyBatch } = require("./chinese-mythology-daoism-early-data.cjs");
const { applyCivilizationLineagesBatch } = require("./bootstrap-chinese-mythology-civilization-lineages.cjs");

const root = path.resolve(__dirname, "..");
const packageVersion = require("../package.json").version;
const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");
const assetDir = path.join(userDataDir, "assets");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "chinese-mythology-daoism-early-04.json");

function timestampForFile(value) {
  return value.replace(/[:.]/g, "-");
}

function ensureCollections(data) {
  for (const collection of WORKSPACE_COLLECTIONS) {
    if (!Array.isArray(data[collection])) data[collection] = [];
  }
}

function replaceById(existing, additions) {
  const ids = new Set(additions.map((item) => item.id));
  return [...additions, ...existing.filter((item) => !ids.has(item.id))];
}

function unique(values) {
  return [...new Set(values)];
}

function plainText(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function createCompleteBackup(data, now) {
  fs.mkdirSync(backupDir, { recursive: true });
  const targetPath = path.join(
    backupDir,
    `worldcraft-codex-complete-before-mythology-daoism-early-04-${timestampForFile(now)}.wcodex`
  );
  const result = await createProjectPackage({
    targetPath,
    data,
    assetsDir: assetDir,
    schemaVersion: 17,
    appVersion: packageVersion,
    now: () => now
  });
  return { targetPath, result };
}

function applyDaoismEarlyBatch(data, now) {
  ensureCollections(data);
  const { worldId } = applyCivilizationLineagesBatch(data, now);
  const foundation = buildMythologyFoundation(now, worldId);
  const ancientCore = buildAncientCoreBatch(now, worldId);
  const naturePantheon = buildNaturePantheonBatch(now, worldId);
  const civilizationLineages = buildCivilizationLineagesBatch(now, worldId);
  const batch = buildDaoismEarlyBatch(now, worldId);

  data.entities = replaceById(data.entities, batch.entities);
  data.relations = replaceById(data.relations, batch.relations);
  data.timelineEvents = replaceById(data.timelineEvents, batch.timelineEvents);

  const world = data.worlds.find((item) => item.id === worldId);
  assert.ok(world, "中国上古神话史世界不存在");
  const validEntityIds = new Set(data.entities.filter((item) => item.worldId === worldId).map((item) => item.id));
  const managedIds = new Set([
    ...foundation.entities,
    ...ancientCore.entities,
    ...naturePantheon.entities,
    ...civilizationLineages.entities,
    ...batch.entities
  ].map((item) => item.id));
  const userFeatured = (world.wiki?.featuredEntityIds || [])
    .filter((id) => validEntityIds.has(id) && !managedIds.has(id));
  world.wiki = {
    ...(world.wiki || {}),
    featuredEntityIds: unique([
      ...batch.featuredEntityIds,
      ...userFeatured,
      ...civilizationLineages.featuredEntityIds,
      ...naturePantheon.featuredEntityIds,
      ...ancientCore.featuredEntityIds,
      ...foundation.world.wiki.featuredEntityIds
    ]).slice(0, 12)
  };
  data.worlds = replaceById(data.worlds, [world]);
  return { batch, worldId };
}

function findDuplicateParagraphIssues(entities) {
  const seen = new Map();
  const issues = [];
  for (const entity of entities) {
    for (const match of entity.content.matchAll(/<p>(.*?)<\/p>/gs)) {
      const paragraph = plainText(match[1]);
      if (paragraph.length < 60) continue;
      const previous = seen.get(paragraph);
      if (previous) issues.push(`${entity.title} 与 ${previous} 重复`);
      else seen.set(paragraph, entity.title);
    }
  }
  return issues;
}

function auditDaoismEarlyBatch(data, worldId) {
  const auditTime = "2000-01-01T00:00:00.000Z";
  const foundation = buildMythologyFoundation(auditTime, worldId);
  const ancientCore = buildAncientCoreBatch(auditTime, worldId);
  const naturePantheon = buildNaturePantheonBatch(auditTime, worldId);
  const civilizationLineages = buildCivilizationLineagesBatch(auditTime, worldId);
  const expected = buildDaoismEarlyBatch(auditTime, worldId);
  const expectedEntityIds = new Set(expected.entities.map((item) => item.id));
  const expectedFigureIds = new Set(expected.figures.map((item) => item.id));
  const expectedInstitutionIds = new Set(expected.institutions.map((item) => item.id));
  const expectedLocationIds = new Set(expected.locations.map((item) => item.id));
  const expectedSourceIds = new Set(expected.sources.map((item) => item.id));
  const expectedRelationIds = new Set(expected.relations.map((item) => item.id));
  const expectedEventIds = new Set(expected.timelineEvents.map((item) => item.id));
  const entities = data.entities.filter((item) => expectedEntityIds.has(item.id));
  const relations = data.relations.filter((item) => expectedRelationIds.has(item.id));
  const timelineEvents = data.timelineEvents.filter((item) => expectedEventIds.has(item.id));
  const worldEntityIds = new Set(data.entities.filter((item) => item.worldId === worldId).map((item) => item.id));
  const tracks = new Set(data.timelineTracks.filter((item) => item.worldId === worldId).map((item) => item.id));
  const world = data.worlds.find((item) => item.id === worldId);

  const externalLinkHits = entities
    .filter((item) => /(?:https?|ftp):\/\/|\bwww\./i.test(`${item.summary}\n${item.content}`))
    .map((item) => item.title);
  const thirdPartyHits = entities
    .filter((item) => /百度百科|维基百科|5000yan|World\s*Anvil/u.test(`${item.summary}\n${item.content}`))
    .map((item) => item.title);
  const styleHits = entities
    .filter((item) => /古老而神秘|命运的齿轮|不为人知的秘密|最终揭开真相|值得注意的是|综上所述|在历史的长河中|规则复核|索引说明/u.test(`${item.summary}\n${item.content}`))
    .map((item) => item.title);
  const sourceCoverageIssues = entities
    .filter((item) => !item.content.includes("<h2>原典坐标</h2>"))
    .map((item) => item.title);
  const originalityFlagIssues = entities
    .filter((item) => expectedFigureIds.has(item.id) && item.templateData?.originalAdaptation !== "false")
    .map((item) => item.title);
  const falseOriginalNoticeIssues = entities
    .filter((item) => item.content.includes(ORIGINAL_ADAPTATION_NOTICE))
    .map((item) => item.title);
  const duplicateParagraphIssues = findDuplicateParagraphIssues(entities);
  const relationEvidenceIssues = relations
    .filter((item) => !item.evidenceType || !item.sourceCitation || !item.historicalScope || !item.confidence || !item.notes)
    .map((item) => item.id);
  const expectedRelationById = new Map(expected.relations.map((item) => [item.id, item]));
  const relationMetadataMismatchIssues = relations
    .filter((item) => {
      const expectedRelation = expectedRelationById.get(item.id);
      return !expectedRelation || [
        "evidenceType",
        "sourceCitation",
        "historicalScope",
        "confidence",
        "notes"
      ].some((key) => item[key] !== expectedRelation[key]);
    })
    .map((item) => item.id);
  const relationReferenceIssues = relations
    .filter((item) => !worldEntityIds.has(item.sourceEntityId) || !worldEntityIds.has(item.targetEntityId))
    .map((item) => item.id);
  const timelineReferenceIssues = timelineEvents
    .filter((item) => (
      !tracks.has(item.trackId)
      || !worldEntityIds.has(item.entityId)
      || !item.references?.length
      || item.references.some((reference) => reference.kind !== "entity" || !worldEntityIds.has(reference.id))
    ))
    .map((item) => item.title);
  const mythicDateIssues = timelineEvents
    .filter((item) => item.trackId.endsWith(":mythic-narrative") && (item.startValue || item.endValue || item.datePrecision !== "custom"))
    .map((item) => item.title);
  const historicalDateIssues = timelineEvents
    .filter((item) => !item.trackId.endsWith(":mythic-narrative") && (!item.startValue || !item.endValue))
    .map((item) => item.title);
  const featuredIssues = (world?.wiki?.featuredEntityIds || []).filter((id) => !worldEntityIds.has(id));
  const sourceRelationIssues = expected.relations
    .filter((item) => item.label === "主要原典入口")
    .filter((item) => !relations.some((actual) => actual.id === item.id && actual.sourceCitation === item.sourceCitation))
    .map((item) => item.id);

  const managedEntityIds = new Set([
    ...foundation.entities,
    ...ancientCore.entities,
    ...naturePantheon.entities,
    ...civilizationLineages.entities,
    ...expected.entities
  ].map((item) => item.id));
  const managedRelationIds = new Set([
    ...ancientCore.relations,
    ...naturePantheon.relations,
    ...civilizationLineages.relations,
    ...expected.relations
  ].map((item) => item.id));
  const managedEventIds = new Set([
    ...ancientCore.timelineEvents,
    ...naturePantheon.timelineEvents,
    ...civilizationLineages.timelineEvents,
    ...expected.timelineEvents
  ].map((item) => item.id));
  const cumulativeManagedCounts = {
    entities: data.entities.filter((item) => managedEntityIds.has(item.id)).length,
    relations: data.relations.filter((item) => managedRelationIds.has(item.id)).length,
    timelineEvents: data.timelineEvents.filter((item) => managedEventIds.has(item.id)).length
  };

  return {
    world: world ? { id: world.id, name: world.name, visibility: world.visibility } : null,
    counts: {
      entities: entities.length,
      figures: entities.filter((item) => expectedFigureIds.has(item.id)).length,
      institutions: entities.filter((item) => expectedInstitutionIds.has(item.id)).length,
      locations: entities.filter((item) => expectedLocationIds.has(item.id)).length,
      sources: entities.filter((item) => expectedSourceIds.has(item.id)).length,
      relations: relations.length,
      sourceRelations: relations.filter((item) => item.label === "主要原典入口").length,
      timelineEvents: timelineEvents.length,
      featured: world?.wiki?.featuredEntityIds?.length || 0
    },
    trackCounts: timelineEvents.reduce((counts, event) => {
      const key = event.trackId.split(":").at(-1);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {}),
    cumulativeManagedCounts,
    externalLinkHits,
    thirdPartyHits,
    styleHits,
    sourceCoverageIssues,
    originalityFlagIssues,
    falseOriginalNoticeIssues,
    duplicateParagraphIssues,
    relationEvidenceIssues,
    relationMetadataMismatchIssues,
    relationReferenceIssues,
    timelineReferenceIssues,
    mythicDateIssues,
    historicalDateIssues,
    featuredIssues,
    sourceRelationIssues
  };
}

async function main() {
  assert.ok(fs.existsSync(dbPath), `未找到数据库：${dbPath}`);
  fs.mkdirSync(validationDir, { recursive: true });
  const store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  let backup;
  let saveStats;
  let worldId;
  try {
    const loaded = store.load();
    assert.ok(loaded.data, "工作区数据库为空");
    const now = new Date().toISOString();
    backup = await createCompleteBackup(loaded.data, now);
    ({ worldId } = applyDaoismEarlyBatch(loaded.data, now));
    saveStats = store.save(loaded.data, "bootstrap-chinese-mythology-daoism-early-04");
  } finally {
    store.close();
  }

  const verifyStore = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  let audit;
  let diagnostics;
  try {
    const persisted = verifyStore.load().data;
    audit = auditDaoismEarlyBatch(persisted, worldId);
    diagnostics = verifyStore.diagnostics();
  } finally {
    verifyStore.close();
  }

  assert.equal(audit.world?.name, "中国上古神话史");
  assert.deepEqual(audit.counts, {
    entities: 70,
    figures: 31,
    institutions: 12,
    locations: 8,
    sources: 19,
    relations: 200,
    sourceRelations: 51,
    timelineEvents: 28,
    featured: 12
  });
  assert.deepEqual(audit.trackCounts, {
    "mythic-narrative": 5,
    "textual-evidence": 12,
    "religious-institutions": 8,
    "cult-evolution": 3
  });
  assert.deepEqual(audit.cumulativeManagedCounts, { entities: 241, relations: 536, timelineEvents: 92 });
  for (const [key, issues] of Object.entries(audit)) {
    if (Array.isArray(issues)) assert.deepEqual(issues, [], key);
  }
  assert.equal(diagnostics.ok, true);

  const report = {
    generatedAt: new Date().toISOString(),
    phase: "中国上古神话史 · 阶段 2 · 早期道教与三清形成第一批",
    backup: backup.targetPath,
    saveStats,
    audit,
    diagnostics: {
      ok: diagnostics.ok,
      schemaVersion: diagnostics.schemaVersion,
      quickCheck: diagnostics.quickCheck,
      foreignKeyIssues: diagnostics.foreignKeyIssues,
      dbPath: diagnostics.dbPath
    }
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ ok: true, reportPath, ...report }, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error?.stack || error);
    process.exitCode = 1;
  });
}

module.exports = { applyDaoismEarlyBatch, auditDaoismEarlyBatch };
