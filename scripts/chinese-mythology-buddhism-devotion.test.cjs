const assert = require("node:assert/strict");

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

const now = "2026-07-19T00:00:00.000Z";
const foundation = buildMythologyFoundation(now);
const ancientCore = buildAncientCoreBatch(now, foundation.world.id);
const naturePantheon = buildNaturePantheonBatch(now, foundation.world.id);
const civilizationLineages = buildCivilizationLineagesBatch(now, foundation.world.id);
const daoismEarly = buildDaoismEarlyBatch(now, foundation.world.id);
const celestial = buildCelestialBureaucracyBatch(now, foundation.world.id);
const daoismLineages = buildDaoismLineagesBatch(now, foundation.world.id);
const buddhismTransmission = buildBuddhismTransmissionBatch(now, foundation.world.id);
const batch = buildBuddhismDevotionBatch(now, foundation.world.id);
const idsAreUnique = (items) => new Set(items.map((item) => item.id)).size === items.length;
const plainText = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

assert.equal(batch.entities.length, 60);
assert.equal(batch.figures.length, 36);
assert.equal(batch.institutions.length, 8);
assert.equal(batch.locations.length, 7);
assert.equal(batch.sources.length, 9);
assert.equal(batch.relations.length, 170);
assert.equal(batch.timelineEvents.length, 20);
assert.equal(batch.featuredEntityIds.length, 8);
assert.equal(idsAreUnique(batch.entities), true);
assert.equal(idsAreUnique(batch.relations), true);
assert.equal(idsAreUnique(batch.timelineEvents), true);

const categoryIds = new Set(foundation.categories.map((item) => item.id));
const templates = new Map(foundation.templates.map((item) => [item.id, item]));
const previousEntities = [
  ...foundation.entities,
  ...ancientCore.entities,
  ...naturePantheon.entities,
  ...civilizationLineages.entities,
  ...daoismEarly.entities,
  ...celestial.entities,
  ...daoismLineages.entities,
  ...buddhismTransmission.entities
];
const allEntities = [...previousEntities, ...batch.entities];
const entityIds = new Set(allEntities.map((item) => item.id));
const sourceIds = new Set(allEntities
  .filter((item) => item.templateId?.endsWith(":source-text"))
  .map((item) => item.id));
const trackIds = new Set(foundation.timelineTracks.map((item) => item.id));

for (const entity of batch.entities) {
  assert.equal(entity.worldId, foundation.world.id, `${entity.title}: world`);
  assert.ok(categoryIds.has(entity.categoryId), `${entity.title}: category`);
  assert.ok(templates.has(entity.templateId), `${entity.title}: template`);
  assert.equal(entity.visibility, "public", `${entity.title}: visibility`);
  assert.ok(entity.summary.length >= 20, `${entity.title}: summary`);
  assert.ok((entity.content.match(/<h2>/g) || []).length >= 5, `${entity.title}: sections`);
  assert.ok(plainText(entity.content).length >= 220, `${entity.title}: prose length`);
  assert.doesNotMatch(`${entity.summary}\n${entity.content}`, /(?:https?|ftp):\/\/|\bwww\./i, `${entity.title}: no external URL`);

  const template = templates.get(entity.templateId);
  for (const field of template.fields.filter((item) => item.required)) {
    assert.notEqual(entity.templateData[field.key], undefined, `${entity.title}: ${field.key}`);
    assert.notEqual(String(entity.templateData[field.key]).trim(), "", `${entity.title}: ${field.key}`);
    if (field.options?.length) {
      assert.ok(field.options.includes(entity.templateData[field.key]), `${entity.title}: ${field.key} option`);
    }
  }
}

for (const entity of batch.figures) {
  assert.equal(entity.templateData.originalAdaptation, "false", `${entity.title}: adaptation flag`);
  assert.equal(entity.content.includes(ORIGINAL_ADAPTATION_NOTICE), false, `${entity.title}: no false originality notice`);
}

for (const entity of batch.sources) {
  assert.equal(entity.templateData.rightsStatus, "古籍原文", `${entity.title}: source rights`);
  assert.equal(entity.templateData.reviewStatus, "已核原文", `${entity.title}: source review`);
}

const publicText = batch.entities.map((item) => `${item.summary}\n${item.content}`).join("\n");
assert.doesNotMatch(publicText, /百度百科|维基百科|5000yan|World\s*Anvil|AI\s*生成|规则复核|索引说明|同名说明/u);
assert.doesNotMatch(
  publicText,
  /古老而神秘|命运的齿轮|不为人知的秘密|最终揭开真相|值得注意的是|毋庸置疑|众所周知|综上所述|在历史的长河中/u
);

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

const evidenceTypes = new Set([
  "primary-text",
  "historical-record",
  "ritual-record",
  "material-evidence",
  "scholarly-inference",
  "textual-variant",
  "oral-tradition",
  "creative"
]);
const confidenceValues = new Set(["certain", "probable", "disputed", "creative"]);
for (const relation of batch.relations) {
  assert.equal(relation.worldId, foundation.world.id, `${relation.id}: world`);
  assert.ok(entityIds.has(relation.sourceEntityId), `${relation.id}: source entity`);
  assert.ok(entityIds.has(relation.targetEntityId), `${relation.id}: target entity`);
  assert.notEqual(relation.sourceEntityId, relation.targetEntityId, `${relation.id}: self relation`);
  assert.ok(evidenceTypes.has(relation.evidenceType), `${relation.id}: evidence type ${relation.evidenceType}`);
  assert.ok(relation.sourceCitation.trim(), `${relation.id}: source citation`);
  assert.ok(relation.historicalScope.trim(), `${relation.id}: historical scope`);
  assert.ok(confidenceValues.has(relation.confidence), `${relation.id}: confidence`);
  assert.ok(relation.notes.trim(), `${relation.id}: notes`);
}

const sourceRelations = batch.relations.filter((item) => item.id.includes(":source-"));
assert.equal(sourceRelations.length, 51);
assert.equal(sourceRelations.every((item) => item.kind === "source" && item.strength === 5), true);
assert.equal(sourceRelations.every((item) => sourceIds.has(item.targetEntityId)), true);
assert.equal(sourceRelations.some((item) => item.evidenceType === "historical-record"), true);
assert.equal(sourceRelations.some((item) => item.evidenceType === "textual-variant"), true);
assert.equal(sourceRelations.some((item) => item.evidenceType === "primary-text"), true);

for (const event of batch.timelineEvents) {
  assert.equal(event.worldId, foundation.world.id, `${event.title}: world`);
  assert.ok(trackIds.has(event.trackId), `${event.title}: track`);
  assert.ok(entityIds.has(event.entityId), `${event.title}: primary entity`);
  assert.ok(event.references.length >= 1, `${event.title}: references`);
  assert.equal(
    event.references.every((reference) => reference.kind === "entity" && entityIds.has(reference.id)),
    true,
    `${event.title}: valid references`
  );
  if (event.trackId.endsWith(":mythic-narrative")) {
    assert.equal(event.datePrecision, "custom", `${event.title}: mythic precision`);
    assert.equal(event.startValue, "", `${event.title}: no invented numeric start`);
    assert.equal(event.endValue, "", `${event.title}: no invented numeric end`);
  } else {
    assert.notEqual(event.startValue, "", `${event.title}: historical start`);
    assert.notEqual(event.endValue, "", `${event.title}: historical end`);
  }
}

assert.deepEqual(
  batch.timelineEvents.reduce((counts, event) => {
    const key = event.trackId.split(":").at(-1);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {}),
  {
    "mythic-narrative": 3,
    "textual-evidence": 5,
    "religious-institutions": 6,
    "cult-evolution": 6
  }
);

for (const title of [
  "宾度罗跋啰惰阇",
  "庆友尊者（难提蜜多罗）",
  "降龙罗汉（汉地俗称）",
  "伏虎罗汉（汉地俗称）",
  "妙善公主",
  "金地藏（金乔觉）",
  "善财童子",
  "龙女（《法华经》）",
  "韦驮天",
  "关羽伽蓝（佛教护法形态）",
  "帝释天",
  "大梵天",
  "鬼子母",
  "十八罗汉的汉地增补",
  "汉传佛教四大菩萨道场网络",
  "普陀山",
  "五台山",
  "峨眉山",
  "九华山",
  "《重编诸天传》"
]) {
  assert.ok(batch.entities.some((item) => item.title === title), `${title}: required entry`);
}

for (const label of [
  "不见于玄奘十六人名单",
  "宋代以后视为观音本行化身",
  "九华传统视为地藏应化",
  "汉地后世地理对应",
  "同为寺院护法但来源不同",
  "同属观音信仰而形成道路不同",
  "梵天劝请佛陀说法"
]) {
  assert.ok(batch.relations.some((item) => item.label === label), `${label}: boundary relation`);
}

assert.deepEqual(
  {
    entities: allEntities.length,
    relations: ancientCore.relations.length
      + naturePantheon.relations.length
      + civilizationLineages.relations.length
      + daoismEarly.relations.length
      + celestial.relations.length
      + daoismLineages.relations.length
      + buddhismTransmission.relations.length
      + batch.relations.length,
    timelineEvents: ancientCore.timelineEvents.length
      + naturePantheon.timelineEvents.length
      + civilizationLineages.timelineEvents.length
      + daoismEarly.timelineEvents.length
      + celestial.timelineEvents.length
      + daoismLineages.timelineEvents.length
      + buddhismTransmission.timelineEvents.length
      + batch.timelineEvents.length
  },
  { entities: 471, relations: 1271, timelineEvents: 174 }
);

console.log("Chinese mythology Buddhism devotion checks passed: 60 entries, 170 sourced relations, 20 four-track events; phase 3 subtotal 120/335/40 and cumulative totals 471/1271/174.");
