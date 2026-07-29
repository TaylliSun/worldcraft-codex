const assert = require("node:assert/strict");

const { ORIGINAL_ADAPTATION_NOTICE, buildMythologyFoundation } = require("./chinese-mythology-history-data.cjs");
const { buildAncientCoreBatch } = require("./chinese-mythology-ancient-core-data.cjs");
const { buildNaturePantheonBatch } = require("./chinese-mythology-nature-pantheon-data.cjs");
const { buildCivilizationLineagesBatch } = require("./chinese-mythology-civilization-lineages-data.cjs");
const { buildDaoismEarlyBatch } = require("./chinese-mythology-daoism-early-data.cjs");
const { buildCelestialBureaucracyBatch, celestialEntityId } = require("./chinese-mythology-celestial-bureaucracy-data.cjs");
const { buildDaoismLineagesBatch } = require("./chinese-mythology-daoism-lineages-data.cjs");
const { buildBuddhismTransmissionBatch } = require("./chinese-mythology-buddhism-transmission-data.cjs");
const { buildBuddhismDevotionBatch } = require("./chinese-mythology-buddhism-devotion-data.cjs");
const { buildBuddhismSchoolsBatch } = require("./chinese-mythology-buddhism-schools-data.cjs");
const { buildConfucianRitesBatch } = require("./chinese-mythology-confucian-rites-data.cjs");
const { buildFolkSyncretismBatch, folkEntityId } = require("./chinese-mythology-folk-syncretism-data.cjs");
const { buildZhenlingFirstRankBatch } = require("./chinese-mythology-zhenling-first-rank-data.cjs");
const { buildZhenlingSecondRankBatch } = require("./chinese-mythology-zhenling-second-rank-data.cjs");
const { buildZhenlingThirdRankBatch } = require("./chinese-mythology-zhenling-third-rank-data.cjs");
const { buildZhenlingFourthRankBatch } = require("./chinese-mythology-zhenling-fourth-rank-data.cjs");
const { buildZhenlingFifthRankBatch } = require("./chinese-mythology-zhenling-fifth-rank-data.cjs");
const { buildZhenlingSixthRankBatch } = require("./chinese-mythology-zhenling-sixth-rank-data.cjs");
const { buildZhenlingSeventhRankBatch } = require("./chinese-mythology-zhenling-seventh-rank-data.cjs");
const { buildThunderOfficesBatch } = require("./chinese-mythology-thunder-offices-data.cjs");
const { SOURCE_CITATION, buildFengduOfficesBatch, fengduEntityId } = require("./chinese-mythology-fengdu-offices-data.cjs");

const now = "2026-01-01T00:00:00.000Z";
const foundation = buildMythologyFoundation(now);
const worldId = foundation.world.id;
const previousBatches = [
  buildAncientCoreBatch(now, worldId), buildNaturePantheonBatch(now, worldId), buildCivilizationLineagesBatch(now, worldId),
  buildDaoismEarlyBatch(now, worldId), buildCelestialBureaucracyBatch(now, worldId), buildDaoismLineagesBatch(now, worldId),
  buildBuddhismTransmissionBatch(now, worldId), buildBuddhismDevotionBatch(now, worldId), buildBuddhismSchoolsBatch(now, worldId),
  buildConfucianRitesBatch(now, worldId), buildFolkSyncretismBatch(now, worldId), buildZhenlingFirstRankBatch(now, worldId),
  buildZhenlingSecondRankBatch(now, worldId), buildZhenlingThirdRankBatch(now, worldId), buildZhenlingFourthRankBatch(now, worldId),
  buildZhenlingFifthRankBatch(now, worldId), buildZhenlingSixthRankBatch(now, worldId), buildZhenlingSeventhRankBatch(now, worldId),
  buildThunderOfficesBatch(now, worldId)
];
const batch = buildFengduOfficesBatch(now, worldId);
const priorEntities = [...foundation.entities, ...previousBatches.flatMap((item) => item.entities)];
const allEntities = [...priorEntities, ...batch.entities];
const entityIds = new Set(allEntities.map((item) => item.id));
const categoryIds = new Set(foundation.categories.map((item) => item.id));
const templates = new Map(foundation.templates.map((item) => [item.id, item]));
const trackIds = new Set(foundation.timelineTracks.map((item) => item.id));
const plainText = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;

assert.deepEqual({
  entities: batch.entities.length,
  figures: batch.figures.length,
  institutions: batch.institutions.length,
  relations: batch.relations.length,
  events: batch.timelineEvents.length
}, { entities: 94, figures: 58, institutions: 36, relations: 290, events: 44 });
assert.equal(uniqueIds(batch.entities), true);
assert.equal(uniqueIds(batch.relations), true);
assert.equal(uniqueIds(batch.timelineEvents), true);
assert.equal(SOURCE_CITATION, "《道法会元》卷二百六十二至二百六十三〈酆都考召大法〉");
assert.equal(batch.entities.some((item) => item.id === fengduEntityId("fengdu-examination-system", worldId)), true);
assert.equal(batch.entities.some((item) => item.title === "关帝（忠义、武庙与财神形态）"), false, "关帝应连接既有身份，不重复建页");
assert.equal(batch.relations.some((item) => item.sourceEntityId === folkEntityId("guan-di", worldId) && item.targetEntityId === fengduEntityId("marshal-register", worldId)), true);
assert.equal(batch.relations.some((item) => item.sourceEntityId === celestialEntityId("fengdu-emperor", worldId) && item.targetEntityId === fengduEntityId("fengdu-examination-system", worldId)), true);

const previousTitles = new Set(priorEntities.map((item) => item.title));
for (const entity of batch.entities) {
  assert.equal(previousTitles.has(entity.title), false, `${entity.title}: duplicate prior title`);
  assert.equal(entity.worldId, worldId, `${entity.title}: world`);
  assert.ok(categoryIds.has(entity.categoryId), `${entity.title}: category`);
  assert.ok(templates.has(entity.templateId), `${entity.title}: template`);
  assert.equal(entity.visibility, "public", `${entity.title}: visibility`);
  assert.ok(entity.summary.length >= 20, `${entity.title}: summary`);
  assert.ok((entity.content.match(/<h2>/g) || []).length >= 4, `${entity.title}: section count`);
  assert.ok(plainText(entity.content).length >= 180, `${entity.title}: prose length`);
  assert.doesNotMatch(`${entity.summary}\n${entity.content}`, /(?:https?|ftp):\/\/|\bwww\./i, `${entity.title}: no URL`);
  const template = templates.get(entity.templateId);
  for (const field of template.fields.filter((item) => item.required)) {
    const value = entity.templateData?.[field.key];
    assert.notEqual(value, undefined, `${entity.title}: ${field.key}`);
    assert.notEqual(String(value).trim(), "", `${entity.title}: ${field.key}`);
    if (field.options?.length) assert.ok(field.options.includes(value), `${entity.title}: ${field.key} option ${value}`);
  }
}
for (const figure of batch.figures) {
  assert.equal(figure.templateData.originalAdaptation, "false", `${figure.title}: original flag`);
  assert.equal(figure.content.includes(ORIGINAL_ADAPTATION_NOTICE), false, `${figure.title}: no false notice`);
}

const publicText = batch.entities.map((item) => `${item.summary}\n${item.content}`).join("\n");
assert.doesNotMatch(publicText, /百度百科|维基百科|5000yan|World\s*Anvil|AI\s*生成|规则复核|索引说明|同名说明/u);
assert.doesNotMatch(publicText, /古老而神秘|命运的齿轮|不为人知的秘密|最终揭开真相|值得注意的是|毋庸置疑|众所周知|综上所述|在历史的长河中/u);
const seenParagraphs = new Map();
for (const entity of batch.entities) {
  for (const match of entity.content.matchAll(/<p>(.*?)<\/p>/gs)) {
    const paragraph = plainText(match[1]);
    if (paragraph.length < 60) continue;
    const previous = seenParagraphs.get(paragraph);
    assert.equal(previous, undefined, `${entity.title}: repeats ${previous}`);
    seenParagraphs.set(paragraph, entity.title);
  }
}

const evidenceTypes = new Set(["primary-text", "historical-record", "ritual-record", "material-evidence", "scholarly-inference", "textual-variant", "oral-tradition", "creative"]);
const confidenceValues = new Set(["certain", "probable", "disputed", "creative"]);
for (const relation of batch.relations) {
  assert.ok(entityIds.has(relation.sourceEntityId), `${relation.id}: source`);
  assert.ok(entityIds.has(relation.targetEntityId), `${relation.id}: target`);
  assert.notEqual(relation.sourceEntityId, relation.targetEntityId, `${relation.id}: self`);
  assert.ok(evidenceTypes.has(relation.evidenceType), `${relation.id}: evidence`);
  assert.ok(confidenceValues.has(relation.confidence), `${relation.id}: confidence`);
  assert.ok(relation.sourceCitation && relation.historicalScope && relation.notes, `${relation.id}: metadata`);
}
assert.equal(batch.relations.filter((item) => item.id.includes(":source-")).length, 94);
assert.equal(batch.relations.filter((item) => item.kind === "contains").length, 187);
assert.equal(batch.relations.filter((item) => item.evidenceType === "ritual-record").length, 2);

for (const event of batch.timelineEvents) {
  assert.ok(trackIds.has(event.trackId), `${event.title}: track`);
  assert.ok(entityIds.has(event.entityId), `${event.title}: entity`);
  assert.equal(event.references.every((item) => item.kind === "entity" && entityIds.has(item.id)), true, `${event.title}: references`);
  assert.equal(event.references.some((item) => item.id === event.entityId), true, `${event.title}: primary entity reference`);
  assert.ok(event.startValue && event.endValue, `${event.title}: dates`);
}
assert.deepEqual(batch.timelineEvents.reduce((counts, item) => {
  const key = item.trackId.split(":").at(-1);
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {}), { "religious-institutions": 31, "textual-evidence": 9, "cult-evolution": 4 });

assert.deepEqual({
  entities: allEntities.length,
  relations: previousBatches.flatMap((item) => item.relations).length + batch.relations.length,
  timelineEvents: previousBatches.flatMap((item) => item.timelineEvents).length + batch.timelineEvents.length
}, { entities: 1551, relations: 4438, timelineEvents: 371 });

console.log("Chinese mythology Fengdu-office checks passed: 58 named figures, 36 palace and office entries, 94 entries, 290 relations, 44 events; cumulative totals 1551/4438/371.");
