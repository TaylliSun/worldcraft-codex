const assert = require("node:assert/strict");

const {
  ORIGINAL_ADAPTATION_NOTICE,
  buildMythologyFoundation
} = require("./chinese-mythology-history-data.cjs");
const { buildAncientCoreBatch } = require("./chinese-mythology-ancient-core-data.cjs");
const { buildNaturePantheonBatch } = require("./chinese-mythology-nature-pantheon-data.cjs");
const { buildCivilizationLineagesBatch } = require("./chinese-mythology-civilization-lineages-data.cjs");

const now = "2026-01-01T00:00:00.000Z";
const foundation = buildMythologyFoundation(now);
const ancientCore = buildAncientCoreBatch(now, foundation.world.id);
const naturePantheon = buildNaturePantheonBatch(now, foundation.world.id);
const batch = buildCivilizationLineagesBatch(now, foundation.world.id);
const idsAreUnique = (items) => new Set(items.map((item) => item.id)).size === items.length;
const plainText = (value) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

assert.equal(batch.entities.length, 63);
assert.equal(batch.figures.length, 43);
assert.equal(batch.locations.length, 10);
assert.equal(batch.sources.length, 10);
assert.equal(batch.relations.length, 188);
assert.equal(batch.timelineEvents.length, 22);
assert.equal(batch.featuredEntityIds.length, 8);
assert.equal(idsAreUnique(batch.entities), true);
assert.equal(idsAreUnique(batch.relations), true);
assert.equal(idsAreUnique(batch.timelineEvents), true);

const categoryIds = new Set(foundation.categories.map((item) => item.id));
const templates = new Map(foundation.templates.map((item) => [item.id, item]));
const entityIds = new Set([
  ...foundation.entities,
  ...ancientCore.entities,
  ...naturePantheon.entities,
  ...batch.entities
].map((item) => item.id));
const trackIds = new Set(foundation.timelineTracks.map((item) => item.id));

for (const entity of batch.entities) {
  assert.equal(entity.worldId, foundation.world.id, `${entity.title}: world`);
  assert.ok(categoryIds.has(entity.categoryId), `${entity.title}: category`);
  assert.ok(templates.has(entity.templateId), `${entity.title}: template`);
  assert.equal(entity.visibility, "public", `${entity.title}: visibility`);
  assert.ok(entity.summary.length >= 20, `${entity.title}: summary`);
  assert.ok((entity.content.match(/<h2>/g) || []).length >= 4, `${entity.title}: sections`);
  assert.ok(plainText(entity.content).length >= 220, `${entity.title}: prose length`);
  assert.doesNotMatch(`${entity.summary}\n${entity.content}`, /(?:https?|ftp):\/\/|\bwww\./i);

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
  assert.equal(entity.content.includes(ORIGINAL_ADAPTATION_NOTICE), false, `${entity.title}: false notice`);
}

const publicText = batch.entities.map((item) => `${item.summary}\n${item.content}`).join("\n");
assert.doesNotMatch(publicText, /百度百科|维基百科|5000yan|AI\s*生成|规则复核|索引说明/u);
assert.doesNotMatch(
  publicText,
  /古老而神秘|命运的齿轮|不为人知的秘密|最终揭开真相|值得注意的是|毋庸置疑|众所周知|综上所述/u
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
  assert.equal(previous, undefined, `${item.title} repeats ${previous}`);
  seenParagraphs.set(item.paragraph, item.title);
}

for (const relation of batch.relations) {
  assert.equal(relation.worldId, foundation.world.id, `${relation.id}: world`);
  assert.ok(entityIds.has(relation.sourceEntityId), `${relation.id}: source entity`);
  assert.ok(entityIds.has(relation.targetEntityId), `${relation.id}: target entity`);
  assert.notEqual(relation.sourceEntityId, relation.targetEntityId, `${relation.id}: self relation`);
  assert.ok(relation.evidenceType, `${relation.id}: evidence type`);
  assert.ok(relation.sourceCitation, `${relation.id}: source citation`);
  assert.ok(relation.historicalScope, `${relation.id}: historical scope`);
  assert.ok(relation.confidence, `${relation.id}: confidence`);
  assert.ok(relation.notes, `${relation.id}: notes`);
}

const sourceRelations = batch.relations.filter((item) => item.label === "原典载录");
assert.equal(sourceRelations.length, batch.figures.length + batch.locations.length);
assert.equal(sourceRelations.every((item) => item.evidenceType === "primary-text"), true);

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
    assert.equal(event.datePrecision, "custom", `${event.title}: mythic date precision`);
    assert.equal(event.startValue, "", `${event.title}: no invented date`);
    assert.equal(event.endValue, "", `${event.title}: no invented date`);
  } else {
    assert.notEqual(event.startValue, "", `${event.title}: historical date`);
  }
}

assert.deepEqual(
  batch.timelineEvents.reduce((counts, event) => {
    const key = event.trackId.split(":").at(-1);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {}),
  {
    "mythic-narrative": 12,
    "textual-evidence": 8,
    "religious-institutions": 1,
    "cult-evolution": 1
  }
);

for (const title of [
  "玄嚣（青阳）",
  "少皞",
  "句望",
  "句芒",
  "羲仲",
  "奚仲",
  "夔（舜廷乐官）",
  "夔",
  "垂（共工）",
  "共工"
]) {
  assert.ok(
    [...ancientCore.entities, ...naturePantheon.entities, ...batch.entities].some((item) => item.title === title),
    `${title}: disambiguation entry`
  );
}

for (const label of [
  "青阳称谓与少皞对应存疑",
  "句望与句芒异文易混",
  "同名而人兽身份不同",
  "共工官名与神名异义",
  "羲仲与奚仲音近异人",
  "西陵氏嫘祖逐渐进入先蚕祭主谱"
]) {
  assert.ok(
    batch.relations.some((item) => item.label === label)
    || batch.timelineEvents.some((item) => item.title === label),
    `${label}: boundary evidence`
  );
}

assert.deepEqual(
  {
    entities: foundation.entities.length + ancientCore.entities.length + naturePantheon.entities.length + batch.entities.length,
    relations: ancientCore.relations.length + naturePantheon.relations.length + batch.relations.length,
    timelineEvents: ancientCore.timelineEvents.length + naturePantheon.timelineEvents.length + batch.timelineEvents.length
  },
  { entities: 171, relations: 336, timelineEvents: 64 }
);

console.log("Chinese mythology civilization lineages checks passed: 63 entries, 188 sourced relations, 22 four-track events; phase 1 totals 171/336/64.");
