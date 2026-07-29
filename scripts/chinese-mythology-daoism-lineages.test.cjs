const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

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

const now = "2026-07-19T00:00:00.000Z";
const foundation = buildMythologyFoundation(now);
const ancientCore = buildAncientCoreBatch(now, foundation.world.id);
const naturePantheon = buildNaturePantheonBatch(now, foundation.world.id);
const civilizationLineages = buildCivilizationLineagesBatch(now, foundation.world.id);
const daoismEarly = buildDaoismEarlyBatch(now, foundation.world.id);
const celestial = buildCelestialBureaucracyBatch(now, foundation.world.id);
const batch = buildDaoismLineagesBatch(now, foundation.world.id);
const idsAreUnique = (items) => new Set(items.map((item) => item.id)).size === items.length;
const plainText = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

assert.equal(batch.entities.length, 50);
assert.equal(batch.figures.length, 29);
assert.equal(batch.institutions.length, 10);
assert.equal(batch.locations.length, 4);
assert.equal(batch.sources.length, 7);
assert.equal(batch.relations.length, 180);
assert.equal(batch.timelineEvents.length, 20);
assert.equal(batch.featuredEntityIds.length, 8);
assert.equal(idsAreUnique(batch.entities), true);
assert.equal(idsAreUnique(batch.relations), true);
assert.equal(idsAreUnique(batch.timelineEvents), true);

const categoryIds = new Set(foundation.categories.map((item) => item.id));
const templates = new Map(foundation.templates.map((item) => [item.id, item]));
const allEntities = [
  ...foundation.entities,
  ...ancientCore.entities,
  ...naturePantheon.entities,
  ...civilizationLineages.entities,
  ...daoismEarly.entities,
  ...celestial.entities,
  ...batch.entities
];
const entityIds = new Set(allEntities.map((item) => item.id));
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

const sourceRelations = batch.relations.filter((item) => item.label === "主要原典入口");
assert.equal(sourceRelations.length, 43);
assert.equal(sourceRelations.every((item) => item.strength === 5), true);
assert.equal(sourceRelations.some((item) => item.evidenceType === "historical-record"), true);
assert.equal(sourceRelations.some((item) => item.evidenceType === "ritual-record"), true);
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
    "textual-evidence": 7,
    "religious-institutions": 6,
    "cult-evolution": 4
  }
);

for (const title of [
  "王重阳",
  "丘处机",
  "孙不二",
  "张伯端",
  "白玉蟾",
  "张宗演（三十六代天师）",
  "张留孙（玄教大宗师）",
  "王灵官（隆恩真君）",
  "正一道（元明规范化）",
  "净明忠孝道（元代重兴）"
]) {
  assert.ok(batch.entities.some((item) => item.title === title), `${title}: required entry`);
}

for (const label of [
  "源出龙虎山网络而制度有别",
  "教内传为奉祖师启示重兴",
  "同属神霄史而直接师承未定",
  "雷法交流而祖统有别",
  "后世谱传授法",
  "后世纳入更大全真祖统"
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
      + batch.relations.length,
    timelineEvents: ancientCore.timelineEvents.length
      + naturePantheon.timelineEvents.length
      + civilizationLineages.timelineEvents.length
      + daoismEarly.timelineEvents.length
      + celestial.timelineEvents.length
      + batch.timelineEvents.length
  },
  { entities: 351, relations: 936, timelineEvents: 134 }
);

const appSource = fs.readFileSync(path.join(__dirname, "..", "app", "page.tsx"), "utf8");
assert.match(appSource, /"textual-variant": "传本异文"/u);

console.log("Chinese mythology Daoist lineages checks passed: 50 entries, 180 sourced relations, 20 four-track events; phase 2 totals 180/600/70 and cumulative totals 351/936/134.");
