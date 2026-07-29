const assert = require("node:assert/strict");

const { buildMythologyFoundation } = require("./chinese-mythology-history-data.cjs");
const { buildBuddhismTransmissionBatch } = require("./chinese-mythology-buddhism-transmission-data.cjs");
const { buildBuddhismDevotionBatch } = require("./chinese-mythology-buddhism-devotion-data.cjs");
const { buildBuddhismSchoolsBatch } = require("./chinese-mythology-buddhism-schools-data.cjs");
const { buildBuddhismPrajnaBatch } = require("./chinese-mythology-buddhism-prajna-data.cjs");
const { buildBuddhismPantheonBatch } = require("./chinese-mythology-buddhism-pantheon-data.cjs");
const {
  buildBuddhismCanonBatch,
  canonSourceId,
  familyRows,
  sourceRows
} = require("./chinese-mythology-buddhism-canon-data.cjs");

const now = "2026-07-20T00:00:00.000Z";
const foundation = buildMythologyFoundation(now);
const transmission = buildBuddhismTransmissionBatch(now, foundation.world.id);
const devotion = buildBuddhismDevotionBatch(now, foundation.world.id);
const schools = buildBuddhismSchoolsBatch(now, foundation.world.id);
const prajna = buildBuddhismPrajnaBatch(now, foundation.world.id);
const pantheon = buildBuddhismPantheonBatch(now, foundation.world.id);
const batch = buildBuddhismCanonBatch(now, foundation.world.id);

const plainText = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;

assert.equal(familyRows.length, 14);
assert.equal(sourceRows.length, 160);
assert.equal(batch.entities.length, 174);
assert.equal(batch.systems.length, 14);
assert.equal(batch.sources.length, 160);
assert.equal(batch.relations.length, 632);
assert.equal(batch.timelineEvents.length, 45);
assert.equal(uniqueIds(batch.entities), true);
assert.equal(uniqueIds(batch.relations), true);
assert.equal(uniqueIds(batch.timelineEvents), true);

const categoryIds = new Set(foundation.categories.map((item) => item.id));
const templates = new Map(foundation.templates.map((item) => [item.id, item]));
const knownEntities = [
  ...foundation.entities,
  ...transmission.entities,
  ...devotion.entities,
  ...schools.entities,
  ...prajna.entities,
  ...pantheon.entities,
  ...batch.entities
];
const entityIds = new Set(knownEntities.map((item) => item.id));
const sourceIds = new Set(knownEntities
  .filter((item) => item.templateId?.endsWith(":source-text"))
  .map((item) => item.id));
const trackIds = new Set(foundation.timelineTracks.map((item) => item.id));

for (const entity of batch.entities) {
  assert.equal(entity.worldId, foundation.world.id, `${entity.title}: world`);
  assert.ok(categoryIds.has(entity.categoryId), `${entity.title}: category`);
  assert.ok(templates.has(entity.templateId), `${entity.title}: template`);
  assert.equal(entity.visibility, "public", `${entity.title}: visibility`);
  assert.ok(entity.summary.length >= 20, `${entity.title}: summary`);
  assert.ok((entity.content.match(/<h2>/g) || []).length >= 6, `${entity.title}: sections`);
  assert.ok(plainText(entity.content).length >= 260, `${entity.title}: prose length ${plainText(entity.content).length}`);
  assert.doesNotMatch(`${entity.summary}\n${entity.content}`, /(?:https?|ftp):\/\/|\bwww\./i, `${entity.title}: external URL`);

  const template = templates.get(entity.templateId);
  for (const field of template.fields.filter((item) => item.required)) {
    assert.notEqual(entity.templateData[field.key], undefined, `${entity.title}: ${field.key}`);
    assert.notEqual(String(entity.templateData[field.key]).trim(), "", `${entity.title}: ${field.key}`);
    if (field.options?.length) assert.ok(field.options.includes(entity.templateData[field.key]), `${entity.title}: ${field.key} option`);
  }
}

for (const source of batch.sources) {
  assert.equal(source.templateData.rightsStatus, "古籍原文", `${source.title}: rights`);
  assert.equal(source.templateData.reviewStatus, "已核原文", `${source.title}: review`);
  assert.ok(["原文", "注疏", "史料记录"].includes(source.templateData.sourceLayer), `${source.title}: layer`);
  assert.equal(source.content.includes("项目原创提示"), true, `${source.title}: creative boundary`);
}

const publicText = batch.entities.map((item) => `${item.summary}\n${item.content}`).join("\n");
assert.doesNotMatch(publicText, /百度百科|维基百科|5000yan|World\s*Anvil|AI\s*生成|规则复核|索引说明|同名说明/u);
assert.doesNotMatch(publicText, /古老而神秘|命运的齿轮|不为人知的秘密|最终揭开真相|值得注意的是|毋庸置疑|众所周知|综上所述|在历史的长河中/u);

const paragraphs = batch.entities.flatMap((entity) => (
  [...entity.content.matchAll(/<p>(.*?)<\/p>/gs)]
    .map((match) => plainText(match[1]))
    .filter((paragraph) => paragraph.length >= 60)
    .map((paragraph) => ({ title: entity.title, paragraph }))
));
const seenParagraphs = new Map();
for (const item of paragraphs) {
  const previous = seenParagraphs.get(item.paragraph);
  assert.equal(previous, undefined, `${item.title}: repeats paragraph from ${previous}`);
  seenParagraphs.set(item.paragraph, item.title);
}

for (const relation of batch.relations) {
  assert.ok(entityIds.has(relation.sourceEntityId), `${relation.id}: source`);
  assert.ok(entityIds.has(relation.targetEntityId), `${relation.id}: target`);
  assert.notEqual(relation.sourceEntityId, relation.targetEntityId, `${relation.id}: self`);
  assert.ok(relation.sourceCitation.trim(), `${relation.id}: citation`);
  assert.ok(relation.historicalScope.trim(), `${relation.id}: scope`);
  assert.ok(relation.notes.trim(), `${relation.id}: notes`);
}

const familySourceRelations = batch.relations.filter((item) => item.id.includes(":source-family-"));
assert.equal(familySourceRelations.length, 160);
assert.equal(familySourceRelations.every((item) => item.kind === "source" && item.strength === 5), true);
assert.equal(familySourceRelations.every((item) => sourceIds.has(item.targetEntityId)), true);
assert.equal(batch.relations.filter((item) => item.label === "列入本批经律论家族").length, 160);
assert.equal(batch.relations.filter((item) => item.label === "同家族下一阅读入口").length, 146);
assert.equal(batch.relations.filter((item) => item.label === "同一文献家族对读").length, 146);

for (const event of batch.timelineEvents) {
  assert.ok(trackIds.has(event.trackId), `${event.title}: track`);
  assert.ok(entityIds.has(event.entityId), `${event.title}: entity`);
  assert.equal(event.references.every((reference) => reference.kind === "entity" && entityIds.has(reference.id)), true, `${event.title}: references`);
  assert.notEqual(event.startValue, "", `${event.title}: start`);
  assert.notEqual(event.endValue, "", `${event.title}: end`);
}

assert.deepEqual(
  batch.timelineEvents.reduce((counts, event) => {
    const key = event.trackId.split(":").at(-1);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {}),
  {
    "textual-evidence": 30,
    "religious-institutions": 10,
    "cult-evolution": 5
  }
);

for (const title of [
  "《中论》",
  "《瑜伽师地论》",
  "《大乘起信论》",
  "《妙法莲华经》（鸠摩罗什七卷本）",
  "八十卷《华严经》",
  "《大佛顶首楞严经》",
  "《大方广圆觉修多罗了义经》",
  "《佛说阿弥陀经》（鸠摩罗什译）",
  "《北斗七星延命经》",
  "《开元释教录》"
]) {
  assert.ok(batch.entities.some((item) => item.title === title), `${title}: required`);
}

for (const key of ["great-surangama", "perfect-enlightenment", "northern-dipper-life", "life-prolonging-ksitigarbha", "awakening-of-faith"]) {
  const source = batch.entities.find((item) => item.id === canonSourceId(key, foundation.world.id));
  assert.ok(source, `${key}: exists`);
  assert.match(source.content, /争议|争论|疑问|缺少可靠证明/u, `${key}: disputed boundary`);
}

assert.deepEqual(
  {
    entities: transmission.entities.length + devotion.entities.length + schools.entities.length + prajna.entities.length + pantheon.entities.length + batch.entities.length,
    identities: transmission.figures.length + devotion.figures.length + schools.figures.length + prajna.figures.length + pantheon.figures.length,
    relations: transmission.relations.length + devotion.relations.length + schools.relations.length + prajna.relations.length + pantheon.relations.length + batch.relations.length,
    timelineEvents: transmission.timelineEvents.length + devotion.timelineEvents.length + schools.timelineEvents.length + prajna.timelineEvents.length + pantheon.timelineEvents.length + batch.timelineEvents.length,
    sourceEntries: transmission.sources.length + devotion.sources.length + schools.sources.length + prajna.sources.length + pantheon.sources.length + batch.sources.length
  },
  { entities: 583, identities: 226, relations: 1801, timelineEvents: 178, sourceEntries: 266 }
);

console.log("Chinese mythology Buddhism canon checks passed: 174 entries, 632 sourced relations, 45 events; Buddhist direct totals 583/1801/178 with 226 identities and 266 source entries.");
