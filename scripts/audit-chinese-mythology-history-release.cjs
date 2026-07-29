const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { WorkspaceStore } = require("../electron/workspace-store.cjs");
const {
  ORIGINAL_ADAPTATION_NOTICE,
  buildMythologyFoundation
} = require("./chinese-mythology-history-data.cjs");
const { buildAncientCoreBatch } = require("./chinese-mythology-ancient-core-data.cjs");
const { buildNaturePantheonBatch } = require("./chinese-mythology-nature-pantheon-data.cjs");
const { buildCivilizationLineagesBatch } = require("./chinese-mythology-civilization-lineages-data.cjs");
const { buildDaoismEarlyBatch } = require("./chinese-mythology-daoism-early-data.cjs");
const { buildCelestialBureaucracyBatch } = require("./chinese-mythology-celestial-bureaucracy-data.cjs");
const { buildDaoismLineagesBatch } = require("./chinese-mythology-daoism-lineages-data.cjs");
const { buildBuddhismTransmissionBatch } = require("./chinese-mythology-buddhism-transmission-data.cjs");
const { buildBuddhismDevotionBatch } = require("./chinese-mythology-buddhism-devotion-data.cjs");
const { buildBuddhismSchoolsBatch } = require("./chinese-mythology-buddhism-schools-data.cjs");
const { buildBuddhismPrajnaBatch } = require("./chinese-mythology-buddhism-prajna-data.cjs");
const { buildBuddhismPantheonBatch } = require("./chinese-mythology-buddhism-pantheon-data.cjs");
const { buildBuddhismCanonBatch } = require("./chinese-mythology-buddhism-canon-data.cjs");
const { buildBuddhismCanonSupplementBatch } = require("./chinese-mythology-buddhism-canon-supplement-data.cjs");
const { buildBuddhismHanPeopleBatch } = require("./chinese-mythology-buddhism-han-people-data.cjs");
const { buildBuddhismTibetanBatch } = require("./chinese-mythology-buddhism-tibetan-data.cjs");
const { buildBuddhismSouthernMaterialBatch } = require("./chinese-mythology-buddhism-southern-material-data.cjs");
const { buildConfucianRitesBatch } = require("./chinese-mythology-confucian-rites-data.cjs");
const { buildFolkSyncretismBatch } = require("./chinese-mythology-folk-syncretism-data.cjs");
const { buildZhenlingFirstRankBatch } = require("./chinese-mythology-zhenling-first-rank-data.cjs");
const { buildZhenlingSecondRankBatch } = require("./chinese-mythology-zhenling-second-rank-data.cjs");
const { buildZhenlingThirdRankBatch } = require("./chinese-mythology-zhenling-third-rank-data.cjs");
const { buildZhenlingFourthRankBatch } = require("./chinese-mythology-zhenling-fourth-rank-data.cjs");
const { buildZhenlingFifthRankBatch } = require("./chinese-mythology-zhenling-fifth-rank-data.cjs");
const { buildZhenlingSixthRankBatch } = require("./chinese-mythology-zhenling-sixth-rank-data.cjs");
const { buildZhenlingSeventhRankBatch } = require("./chinese-mythology-zhenling-seventh-rank-data.cjs");
const { buildThunderOfficesBatch } = require("./chinese-mythology-thunder-offices-data.cjs");
const { buildFengduOfficesBatch } = require("./chinese-mythology-fengdu-offices-data.cjs");
const { buildDingjiaGuardiansBatch } = require("./chinese-mythology-dingjia-guardians-data.cjs");

const root = path.resolve(__dirname, "..");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "chinese-mythology-history-release-audit.json");
const userDataDir = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const backupDir = path.join(userDataDir, "backups");

const plainText = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;

function buildExpected(now) {
  const foundation = buildMythologyFoundation(now);
  const worldId = foundation.world.id;
  const batches = [
    buildAncientCoreBatch(now, worldId),
    buildNaturePantheonBatch(now, worldId),
    buildCivilizationLineagesBatch(now, worldId),
    buildDaoismEarlyBatch(now, worldId),
    buildCelestialBureaucracyBatch(now, worldId),
    buildDaoismLineagesBatch(now, worldId),
    buildBuddhismTransmissionBatch(now, worldId),
    buildBuddhismDevotionBatch(now, worldId),
    buildBuddhismSchoolsBatch(now, worldId),
    buildBuddhismPrajnaBatch(now, worldId),
    buildBuddhismPantheonBatch(now, worldId),
    buildBuddhismCanonBatch(now, worldId),
    buildBuddhismCanonSupplementBatch(now, worldId),
    buildBuddhismHanPeopleBatch(now, worldId),
    buildBuddhismTibetanBatch(now, worldId),
    buildBuddhismSouthernMaterialBatch(now, worldId),
    buildConfucianRitesBatch(now, worldId),
    buildFolkSyncretismBatch(now, worldId),
    buildZhenlingFirstRankBatch(now, worldId),
    buildZhenlingSecondRankBatch(now, worldId),
    buildZhenlingThirdRankBatch(now, worldId),
    buildZhenlingFourthRankBatch(now, worldId),
    buildZhenlingFifthRankBatch(now, worldId),
    buildZhenlingSixthRankBatch(now, worldId),
    buildZhenlingSeventhRankBatch(now, worldId),
    buildThunderOfficesBatch(now, worldId),
    buildFengduOfficesBatch(now, worldId),
    buildDingjiaGuardiansBatch(now, worldId)
  ];
  return {
    foundation,
    batches,
    entities: [...foundation.entities, ...batches.flatMap((batch) => batch.entities)],
    relations: batches.flatMap((batch) => batch.relations),
    timelineEvents: batches.flatMap((batch) => batch.timelineEvents)
  };
}

function duplicateParagraphIssues(entities) {
  const seen = new Map();
  const issues = [];
  for (const entity of entities) {
    for (const match of String(entity.content || "").matchAll(/<p>(.*?)<\/p>/gs)) {
      const paragraph = plainText(match[1]);
      if (paragraph.length < 60) continue;
      const previous = seen.get(paragraph);
      if (previous) issues.push(`${entity.title} 与 ${previous} 重复：${paragraph.slice(0, 72)}`);
      else seen.set(paragraph, entity.title);
    }
  }
  return issues;
}

function mismatchIds(actual, expected, keys) {
  const actualById = new Map(actual.map((item) => [item.id, item]));
  return expected.filter((item) => {
    const saved = actualById.get(item.id);
    return !saved || keys.some((key) => JSON.stringify(saved[key]) !== JSON.stringify(item[key]));
  }).map((item) => item.id);
}

function benchmark(entities, relations) {
  const needles = ["女娲", "妈祖", "观音", "孔子", "关帝", "北斗", "泰山", "地藏"];
  const searchable = entities.map((entity) => `${entity.title}\n${entity.summary}\n${plainText(entity.content)}`.toLowerCase());
  const started = performance.now();
  let searchHits = 0;
  for (let repeat = 0; repeat < 20; repeat += 1) {
    for (const needle of needles) {
      const normalized = needle.toLowerCase();
      searchHits += searchable.filter((text) => text.includes(normalized)).length;
    }
  }
  const searchMs = performance.now() - started;

  const graphStarted = performance.now();
  const adjacency = new Map();
  for (const relation of relations) {
    if (!adjacency.has(relation.sourceEntityId)) adjacency.set(relation.sourceEntityId, []);
    if (!adjacency.has(relation.targetEntityId)) adjacency.set(relation.targetEntityId, []);
    adjacency.get(relation.sourceEntityId).push(relation.targetEntityId);
    adjacency.get(relation.targetEntityId).push(relation.sourceEntityId);
  }
  const graphIndexMs = performance.now() - graphStarted;
  return { searchMs, searchHits, graphIndexMs, graphNodes: adjacency.size };
}

function audit(data, diagnostics) {
  const expected = buildExpected("2000-01-01T00:00:00.000Z");
  const worldId = expected.foundation.world.id;
  const world = data.worlds.find((item) => item.id === worldId);
  const isManaged = (item) => item.worldId === worldId && item.id.includes(":mythology:");
  const entities = data.entities.filter(isManaged);
  const relations = data.relations.filter(isManaged);
  const timelineEvents = data.timelineEvents.filter(isManaged);
  const expectedEntityIds = new Set(expected.entities.map((item) => item.id));
  const expectedRelationIds = new Set(expected.relations.map((item) => item.id));
  const expectedEventIds = new Set(expected.timelineEvents.map((item) => item.id));
  const worldEntityIds = new Set(data.entities.filter((item) => item.worldId === worldId).map((item) => item.id));
  const worldTrackIds = new Set(data.timelineTracks.filter((item) => item.worldId === worldId).map((item) => item.id));
  const sourceIds = new Set(entities.filter((item) => item.templateId?.endsWith(":source-text")).map((item) => item.id));
  const foundationEntityIds = new Set(expected.foundation.entities.map((item) => item.id));
  const templates = new Map(expected.foundation.templates.map((item) => [item.id, item]));
  const categoryIds = new Set(expected.foundation.categories.map((item) => item.id));

  const externalLinkIssues = entities
    .filter((item) => /(?:https?|ftp):\/\/|\bwww\./i.test(JSON.stringify(item)))
    .map((item) => item.title);
  const thirdPartyIssues = entities
    .filter((item) => /百度百科|维基百科|5000yan|World\s*Anvil/u.test(JSON.stringify(item)))
    .map((item) => item.title);
  const styleIssues = entities
    .filter((item) => item.templateId)
    .filter((item) => /古老而神秘|命运的齿轮|不为人知的秘密|最终揭开真相|值得注意的是|毋庸置疑|众所周知|综上所述|在历史的长河中|规则复核|索引说明|同名说明/u.test(`${item.summary}\n${item.content}`))
    .map((item) => item.title);
  const proseIssues = entities
    .filter((item) => item.templateId && ((item.content.match(/<h2>/g) || []).length < 3 || plainText(item.content).length < 150))
    .map((item) => item.title);
  const templateIssues = entities.flatMap((entity) => {
    if (!entity.templateId) return [];
    const template = templates.get(entity.templateId);
    if (!template) return [`${entity.title}：模板不存在`];
    const issues = [];
    if (!categoryIds.has(entity.categoryId)) issues.push(`${entity.title}：目录不存在`);
    for (const field of template.fields.filter((item) => item.required)) {
      const value = entity.templateData?.[field.key];
      if (value === undefined || String(value).trim() === "") issues.push(`${entity.title}：缺少 ${field.key}`);
      else if (field.options?.length && !field.options.includes(value)) issues.push(`${entity.title}：${field.key} 选项非法`);
    }
    return issues;
  });
  const sourceBoundaryIssues = entities
    .filter((item) => item.templateId?.endsWith(":source-text"))
    .filter((item) => !foundationEntityIds.has(item.id))
    .filter((item) => {
      const rights = item.templateData?.rightsStatus;
      const review = item.templateData?.reviewStatus;
      return !((rights === "古籍原文" && review === "已核原文") || (rights === "项目自写整理" && review === "可公开"));
    })
    .map((item) => item.title);
  const originalityIssues = entities
    .filter((item) => item.templateId?.endsWith(":deity-person"))
    .filter((item) => item.templateData?.originalAdaptation !== "false" || item.content.includes(ORIGINAL_ADAPTATION_NOTICE))
    .map((item) => item.title);
  const relationEvidenceIssues = relations
    .filter((item) => !item.evidenceType || !item.sourceCitation || !item.historicalScope || !item.confidence || !item.notes)
    .map((item) => item.id);
  const relationReferenceIssues = relations
    .filter((item) => !worldEntityIds.has(item.sourceEntityId) || !worldEntityIds.has(item.targetEntityId) || item.sourceEntityId === item.targetEntityId)
    .map((item) => item.id);
  const sourceRelationIssues = relations
    .filter((item) => item.id.includes(":source-"))
    .filter((item) => item.strength !== 5 || !sourceIds.has(item.targetEntityId))
    .map((item) => item.id);
  const timelineReferenceIssues = timelineEvents
    .filter((item) => !worldTrackIds.has(item.trackId) || !worldEntityIds.has(item.entityId) || item.references.some((reference) => reference.kind !== "entity" || !worldEntityIds.has(reference.id)))
    .map((item) => item.id);
  const timelineDateIssues = timelineEvents
    .filter((item) => item.trackId.endsWith(":mythic-narrative")
      ? (item.datePrecision !== "custom" || item.startValue || item.endValue)
      : (!item.startValue || !item.endValue))
    .map((item) => item.id);
  const expectedMismatchIssues = {
    entities: mismatchIds(entities, expected.entities, ["title", "slug", "summary", "content", "tags", "visibility", "categoryId", "templateId", "templateData"]),
    relations: mismatchIds(relations, expected.relations, ["sourceEntityId", "targetEntityId", "kind", "label", "direction", "strength", "evidenceType", "sourceCitation", "historicalScope", "confidence", "notes"]),
    timelineEvents: mismatchIds(timelineEvents, expected.timelineEvents, ["entityId", "references", "trackId", "title", "summary", "displayDate", "datePrecision", "sortOrder", "startValue", "endValue", "era"])
  };
  const missingIds = {
    entities: [...expectedEntityIds].filter((id) => !entities.some((item) => item.id === id)),
    relations: [...expectedRelationIds].filter((id) => !relations.some((item) => item.id === id)),
    timelineEvents: [...expectedEventIds].filter((id) => !timelineEvents.some((item) => item.id === id))
  };
  const unexpectedIds = {
    entities: entities.filter((item) => !expectedEntityIds.has(item.id)).map((item) => item.id),
    relations: relations.filter((item) => !expectedRelationIds.has(item.id)).map((item) => item.id),
    timelineEvents: timelineEvents.filter((item) => !expectedEventIds.has(item.id)).map((item) => item.id)
  };
  const trackCounts = timelineEvents.reduce((counts, event) => {
    const key = event.trackId.split(":").at(-1);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  const issueGroups = {
    externalLinkIssues,
    thirdPartyIssues,
    styleIssues,
    proseIssues,
    templateIssues,
    sourceBoundaryIssues,
    originalityIssues,
    duplicateParagraphIssues: duplicateParagraphIssues(entities),
    relationEvidenceIssues,
    relationReferenceIssues,
    sourceRelationIssues,
    timelineReferenceIssues,
    timelineDateIssues,
    entityMismatchIssues: expectedMismatchIssues.entities,
    relationMismatchIssues: expectedMismatchIssues.relations,
    timelineMismatchIssues: expectedMismatchIssues.timelineEvents,
    missingEntityIds: missingIds.entities,
    missingRelationIds: missingIds.relations,
    missingTimelineEventIds: missingIds.timelineEvents,
    unexpectedEntityIds: unexpectedIds.entities,
    unexpectedRelationIds: unexpectedIds.relations,
    unexpectedTimelineEventIds: unexpectedIds.timelineEvents
  };
  const counts = {
    entities: entities.length,
    relations: relations.length,
    timelineEvents: timelineEvents.length,
    sourceEntries: sourceIds.size,
    sourceRelations: relations.filter((item) => item.id.includes(":source-")).length
  };
  const countChecks = counts.entities === 2442 && counts.relations === 7333 && counts.timelineEvents === 635;
  const expectedTrackCounts = {
    "mythic-narrative": 85,
    "textual-evidence": 227,
    "religious-institutions": 209,
    "cult-evolution": 114
  };
  const trackChecks = Object.keys(expectedTrackCounts).length === Object.keys(trackCounts).length
    && Object.entries(expectedTrackCounts).every(([key, value]) => trackCounts[key] === value);
  const uniquenessChecks = uniqueIds(entities) && uniqueIds(relations) && uniqueIds(timelineEvents);
  const benchmarks = benchmark(entities, relations);
  const performanceChecks = benchmarks.searchMs < 1000 && benchmarks.graphIndexMs < 1000;
  const noIssues = Object.values(issueGroups).every((issues) => issues.length === 0);

  return {
    ok: Boolean(world) && diagnostics.ok && countChecks && trackChecks && uniquenessChecks && performanceChecks && noIssues,
    generatedAt: new Date().toISOString(),
    world: world ? { id: world.id, name: world.name, visibility: world.visibility, featured: world.wiki?.featuredEntityIds?.length || 0 } : null,
    counts,
    trackCounts,
    checks: {
      sqlite: diagnostics.ok,
      countChecks,
      trackChecks,
      uniquenessChecks,
      performanceChecks,
      noIssues
    },
    benchmarks,
    diagnostics: {
      schemaVersion: diagnostics.schemaVersion,
      quickCheck: diagnostics.quickCheck,
      foreignKeyIssues: diagnostics.foreignKeyIssues,
      dbPath: diagnostics.dbPath
    },
    issues: issueGroups
  };
}

function main() {
  assert.ok(fs.existsSync(dbPath), `未找到数据库：${dbPath}`);
  fs.mkdirSync(validationDir, { recursive: true });
  const store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  let report;
  try {
    const data = store.load().data;
    report = audit(data, store.diagnostics());
  } finally {
    store.close();
  }
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  assert.equal(report.ok, true, `全库发布审计未通过，见 ${reportPath}`);
  console.log(JSON.stringify({ ok: true, reportPath, counts: report.counts, trackCounts: report.trackCounts, benchmarks: report.benchmarks }, null, 2));
}

if (require.main === module) main();

module.exports = { audit, buildExpected };
