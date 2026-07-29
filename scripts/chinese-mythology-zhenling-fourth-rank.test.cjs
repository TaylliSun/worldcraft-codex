const assert = require("node:assert/strict");

const { ORIGINAL_ADAPTATION_NOTICE, buildMythologyFoundation } = require("./chinese-mythology-history-data.cjs");
const { buildAncientCoreBatch } = require("./chinese-mythology-ancient-core-data.cjs");
const { buildNaturePantheonBatch } = require("./chinese-mythology-nature-pantheon-data.cjs");
const { buildCivilizationLineagesBatch } = require("./chinese-mythology-civilization-lineages-data.cjs");
const { buildDaoismEarlyBatch } = require("./chinese-mythology-daoism-early-data.cjs");
const { buildCelestialBureaucracyBatch } = require("./chinese-mythology-celestial-bureaucracy-data.cjs");
const { buildDaoismLineagesBatch } = require("./chinese-mythology-daoism-lineages-data.cjs");
const { buildBuddhismTransmissionBatch } = require("./chinese-mythology-buddhism-transmission-data.cjs");
const { buildBuddhismDevotionBatch } = require("./chinese-mythology-buddhism-devotion-data.cjs");
const { buildBuddhismSchoolsBatch } = require("./chinese-mythology-buddhism-schools-data.cjs");
const { buildConfucianRitesBatch } = require("./chinese-mythology-confucian-rites-data.cjs");
const { buildFolkSyncretismBatch } = require("./chinese-mythology-folk-syncretism-data.cjs");
const { buildZhenlingFirstRankBatch, zhenlingSourceId } = require("./chinese-mythology-zhenling-first-rank-data.cjs");
const { buildZhenlingSecondRankBatch } = require("./chinese-mythology-zhenling-second-rank-data.cjs");
const { buildZhenlingThirdRankBatch } = require("./chinese-mythology-zhenling-third-rank-data.cjs");
const { buildZhenlingFourthRankBatch, zhenlingFourthEntityId } = require("./chinese-mythology-zhenling-fourth-rank-data.cjs");

const now = "2026-01-01T00:00:00.000Z";
const foundation = buildMythologyFoundation(now);
const worldId = foundation.world.id;
const previousBatches = [
  buildAncientCoreBatch(now, worldId), buildNaturePantheonBatch(now, worldId), buildCivilizationLineagesBatch(now, worldId),
  buildDaoismEarlyBatch(now, worldId), buildCelestialBureaucracyBatch(now, worldId), buildDaoismLineagesBatch(now, worldId),
  buildBuddhismTransmissionBatch(now, worldId), buildBuddhismDevotionBatch(now, worldId), buildBuddhismSchoolsBatch(now, worldId),
  buildConfucianRitesBatch(now, worldId), buildFolkSyncretismBatch(now, worldId), buildZhenlingFirstRankBatch(now, worldId),
  buildZhenlingSecondRankBatch(now, worldId), buildZhenlingThirdRankBatch(now, worldId)
];
const batch = buildZhenlingFourthRankBatch(now, worldId);
const allEntities = [...foundation.entities, ...previousBatches.flatMap((item) => item.entities), ...batch.entities];
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
  locations: batch.locations.length,
  sources: batch.sources.length,
  positions: batch.catalogPositions.length,
  reused: batch.catalogPositions.filter((item) => item.existingRef).length,
  groups: batch.catalogPositions.filter((item) => item.kind === "group").length,
  relations: batch.relations.length,
  events: batch.timelineEvents.length
}, { entities: 175, figures: 157, institutions: 17, locations: 1, sources: 0, positions: 174, reused: 6, groups: 11, relations: 417, events: 8 });
assert.equal(uniqueIds(batch.entities), true);
assert.equal(uniqueIds(batch.relations), true);
assert.equal(uniqueIds(batch.timelineEvents), true);
assert.deepEqual(batch.catalogPositions.reduce((counts, item) => {
  counts[item.section] = (counts[item.section] || 0) + 1;
  return counts;
}, {}), { "中位": 2, "左位": 63, "右位": 109 });
assert.deepEqual(batch.catalogPositions.filter((item) => item.existingRef).map((item) => item.existingRef), [
  "d:taishang-laojun", "d:zhang-daoling", "z2:chisongzi", "c:limu", "n:hebo", "d:ge-hong"
]);
assert.equal(batch.figures.some((item) => item.title === "太上老君"), false);
assert.equal(batch.figures.some((item) => item.title === "葛洪"), false);
assert.equal(batch.entities.some((item) => item.id === zhenlingFourthEntityId("fourth-rank-taiqing", worldId)), true);
assert.equal(batch.entities.some((item) => item.id === zhenlingSourceId(worldId)), false);

for (const entity of batch.entities) {
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
    if (field.options?.length) assert.ok(field.options.includes(value), `${entity.title}: ${field.key} option`);
  }
}

for (const figure of batch.figures) {
  assert.equal(figure.templateData.originalAdaptation, "false", `${figure.title}: original flag`);
  assert.equal(figure.content.includes(ORIGINAL_ADAPTATION_NOTICE), false, `${figure.title}: no false notice`);
  assert.equal(figure.templateData.rankPosition, "第四阶 · 太清境");
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
assert.equal(batch.relations.filter((item) => item.id.includes(":source-")).length, 181);
assert.equal(batch.relations.filter((item) => item.kind === "contains").length, 222);
assert.equal(batch.relations.filter((item) => item.kind === "disputed").length, 4);
assert.equal(batch.relations.filter((item) => item.kind === "located").length, 5);
assert.equal(batch.relations.filter((item) => item.direction === "mutual").length, 1);

for (const event of batch.timelineEvents) {
  assert.ok(trackIds.has(event.trackId), `${event.title}: track`);
  assert.ok(entityIds.has(event.entityId), `${event.title}: entity`);
  assert.equal(event.references.every((item) => item.kind === "entity" && entityIds.has(item.id)), true, `${event.title}: references`);
  assert.ok(event.startValue && event.endValue, `${event.title}: dates`);
}
assert.deepEqual(batch.timelineEvents.reduce((counts, item) => {
  const key = item.trackId.split(":").at(-1);
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {}), { "textual-evidence": 2, "religious-institutions": 3, "cult-evolution": 3 });

assert.deepEqual({
  entities: allEntities.length,
  relations: previousBatches.flatMap((item) => item.relations).length + batch.relations.length,
  timelineEvents: previousBatches.flatMap((item) => item.timelineEvents).length + batch.timelineEvents.length
}, { entities: 1031, relations: 2839, timelineEvents: 286 });

console.log("Chinese mythology Zhenling fourth-rank checks passed: 174 positions, 6 reused identities, 157 new figures, 11 collective groups, 175 entries, 417 relations, 8 events; cumulative totals 1031/2839/286.");
