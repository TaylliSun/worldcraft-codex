const assert = require("node:assert/strict");

const { buildMythologyFoundation } = require("./chinese-mythology-history-data.cjs");
const { buildBuddhismTransmissionBatch } = require("./chinese-mythology-buddhism-transmission-data.cjs");
const { buildBuddhismDevotionBatch } = require("./chinese-mythology-buddhism-devotion-data.cjs");
const { buildBuddhismSchoolsBatch } = require("./chinese-mythology-buddhism-schools-data.cjs");
const { buildBuddhismPrajnaBatch } = require("./chinese-mythology-buddhism-prajna-data.cjs");
const { buildBuddhismPantheonBatch } = require("./chinese-mythology-buddhism-pantheon-data.cjs");
const { buildBuddhismCanonBatch } = require("./chinese-mythology-buddhism-canon-data.cjs");
const {
  buildBuddhismCanonSupplementBatch,
  supplementSourceId,
  familyRows,
  sourceRows
} = require("./chinese-mythology-buddhism-canon-supplement-data.cjs");

const now = "2026-07-20T00:00:00.000Z";
const foundation = buildMythologyFoundation(now);
const transmission = buildBuddhismTransmissionBatch(now, foundation.world.id);
const devotion = buildBuddhismDevotionBatch(now, foundation.world.id);
const schools = buildBuddhismSchoolsBatch(now, foundation.world.id);
const prajna = buildBuddhismPrajnaBatch(now, foundation.world.id);
const pantheon = buildBuddhismPantheonBatch(now, foundation.world.id);
const canon = buildBuddhismCanonBatch(now, foundation.world.id);
const batch = buildBuddhismCanonSupplementBatch(now, foundation.world.id);
const plainText = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;

assert.equal(familyRows.length, 6);
assert.equal(sourceRows.length, 48);
assert.equal(batch.entities.length, 54);
assert.equal(batch.systems.length, 6);
assert.equal(batch.sources.length, 48);
assert.equal(batch.relations.length, 200);
assert.equal(batch.timelineEvents.length, 18);
assert.equal(uniqueIds(batch.entities), true);
assert.equal(uniqueIds(batch.relations), true);
assert.equal(uniqueIds(batch.timelineEvents), true);

const categoryIds = new Set(foundation.categories.map((item) => item.id));
const templates = new Map(foundation.templates.map((item) => [item.id, item]));
const knownEntities = [...foundation.entities, ...transmission.entities, ...devotion.entities, ...schools.entities, ...prajna.entities, ...pantheon.entities, ...canon.entities, ...batch.entities];
const entityIds = new Set(knownEntities.map((item) => item.id));
const sourceIds = new Set(knownEntities.filter((item) => item.templateId?.endsWith(":source-text")).map((item) => item.id));
const trackIds = new Set(foundation.timelineTracks.map((item) => item.id));

for (const entity of batch.entities) {
  assert.ok(categoryIds.has(entity.categoryId), `${entity.title}: category`);
  assert.ok(templates.has(entity.templateId), `${entity.title}: template`);
  assert.equal(entity.visibility, "public", `${entity.title}: visibility`);
  assert.ok((entity.content.match(/<h2>/g) || []).length >= 6, `${entity.title}: sections`);
  assert.ok(plainText(entity.content).length >= 230, `${entity.title}: prose`);
  assert.doesNotMatch(`${entity.summary}\n${entity.content}`, /(?:https?|ftp):\/\/|\bwww\./i, `${entity.title}: external URL`);
  const template = templates.get(entity.templateId);
  for (const field of template.fields.filter((item) => item.required)) {
    const value = entity.templateData[field.key];
    assert.notEqual(value, undefined, `${entity.title}: ${field.key}`);
    assert.notEqual(String(value).trim(), "", `${entity.title}: ${field.key}`);
    if (field.options?.length) assert.ok(field.options.includes(value), `${entity.title}: ${field.key} option`);
  }
}

for (const source of batch.sources) {
  assert.equal(source.templateData.rightsStatus, "古籍原文");
  assert.equal(source.templateData.reviewStatus, "已核原文");
  assert.ok(["原文", "注疏", "史料记录"].includes(source.templateData.sourceLayer));
  assert.equal(source.content.includes("项目原创提示"), true);
}

const publicText = batch.entities.map((item) => `${item.summary}\n${item.content}`).join("\n");
assert.doesNotMatch(publicText, /百度百科|维基百科|5000yan|World\s*Anvil|AI\s*生成|规则复核|索引说明|同名说明/u);
assert.doesNotMatch(publicText, /古老而神秘|命运的齿轮|不为人知的秘密|最终揭开真相|值得注意的是|毋庸置疑|众所周知|综上所述|在历史的长河中/u);

const seen = new Map();
for (const entity of batch.entities) {
  for (const match of entity.content.matchAll(/<p>(.*?)<\/p>/gs)) {
    const paragraph = plainText(match[1]);
    if (paragraph.length < 60) continue;
    assert.equal(seen.get(paragraph), undefined, `${entity.title}: repeated from ${seen.get(paragraph)}`);
    seen.set(paragraph, entity.title);
  }
}

for (const relation of batch.relations) {
  assert.ok(entityIds.has(relation.sourceEntityId), `${relation.id}: source`);
  assert.ok(entityIds.has(relation.targetEntityId), `${relation.id}: target`);
  assert.notEqual(relation.sourceEntityId, relation.targetEntityId, `${relation.id}: self`);
  assert.ok(relation.sourceCitation && relation.historicalScope && relation.confidence && relation.notes, `${relation.id}: evidence`);
}
const sourceRelations = batch.relations.filter((item) => item.id.includes(":source-family-"));
assert.equal(sourceRelations.length, 48);
assert.equal(sourceRelations.every((item) => item.kind === "source" && item.strength === 5 && sourceIds.has(item.targetEntityId)), true);

for (const event of batch.timelineEvents) {
  assert.ok(trackIds.has(event.trackId), `${event.title}: track`);
  assert.ok(entityIds.has(event.entityId), `${event.title}: entity`);
  assert.equal(event.references.every((reference) => reference.kind === "entity" && entityIds.has(reference.id)), true);
  assert.ok(event.startValue && event.endValue, `${event.title}: date`);
}
assert.deepEqual(batch.timelineEvents.reduce((counts, event) => {
  const key = event.trackId.split(":").at(-1);
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {}), { "textual-evidence": 10, "religious-institutions": 5, "cult-evolution": 3 });

for (const title of ["《佛所行赞》", "《大宝积经》", "《景德传灯录》", "《观经四帖疏》", "《天台四教仪》", "《法苑珠林》"]) {
  assert.ok(batch.entities.some((item) => item.title === title), `${title}: required`);
}
const yingluo = batch.entities.find((item) => item.id === supplementSourceId("bodhisattva-diadem-karma", foundation.world.id));
assert.match(yingluo.content, /汉地形成|题署存在讨论/u);

assert.deepEqual({
  entities: transmission.entities.length + devotion.entities.length + schools.entities.length + prajna.entities.length + pantheon.entities.length + canon.entities.length + batch.entities.length,
  identities: transmission.figures.length + devotion.figures.length + schools.figures.length + prajna.figures.length + pantheon.figures.length,
  relations: transmission.relations.length + devotion.relations.length + schools.relations.length + prajna.relations.length + pantheon.relations.length + canon.relations.length + batch.relations.length,
  timelineEvents: transmission.timelineEvents.length + devotion.timelineEvents.length + schools.timelineEvents.length + prajna.timelineEvents.length + pantheon.timelineEvents.length + canon.timelineEvents.length + batch.timelineEvents.length,
  sourceEntries: transmission.sources.length + devotion.sources.length + schools.sources.length + prajna.sources.length + pantheon.sources.length + canon.sources.length + batch.sources.length
}, { entities: 637, identities: 226, relations: 2001, timelineEvents: 196, sourceEntries: 314 });

console.log("Chinese mythology Buddhism canon supplement checks passed: 54 entries, 200 sourced relations, 18 events; Buddhist direct totals 637/2001/196 with 226 identities and 314 source entries.");
