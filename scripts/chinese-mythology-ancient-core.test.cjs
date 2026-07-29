const assert = require("node:assert/strict");

const {
  ORIGINAL_ADAPTATION_NOTICE,
  buildMythologyFoundation
} = require("./chinese-mythology-history-data.cjs");
const { buildAncientCoreBatch } = require("./chinese-mythology-ancient-core-data.cjs");

const now = "2026-01-01T00:00:00.000Z";
const foundation = buildMythologyFoundation(now);
const batch = buildAncientCoreBatch(now, foundation.world.id);
const idsAreUnique = (items) => new Set(items.map((item) => item.id)).size === items.length;
const plainText = (value) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

assert.equal(batch.entities.length, 42);
assert.equal(batch.figures.length, 27);
assert.equal(batch.locations.length, 8);
assert.equal(batch.sources.length, 7);
assert.equal(batch.relations.length, 41);
assert.equal(batch.timelineEvents.length, 20);
assert.equal(batch.featuredEntityIds.length, 8);
assert.equal(idsAreUnique(batch.entities), true);
assert.equal(idsAreUnique(batch.relations), true);
assert.equal(idsAreUnique(batch.timelineEvents), true);

const categoryIds = new Set(foundation.categories.map((item) => item.id));
const templates = new Map(foundation.templates.map((item) => [item.id, item]));
const entityIds = new Set(batch.entities.map((item) => item.id));
const trackIds = new Set(foundation.timelineTracks.map((item) => item.id));

for (const entity of batch.entities) {
  assert.equal(entity.worldId, foundation.world.id, `${entity.title}: world`);
  assert.ok(categoryIds.has(entity.categoryId), `${entity.title}: category`);
  assert.ok(templates.has(entity.templateId), `${entity.title}: template`);
  assert.equal(entity.visibility, "public", `${entity.title}: visibility`);
  assert.ok(entity.summary.length >= 20, `${entity.title}: summary`);
  assert.ok((entity.content.match(/<h2>/g) || []).length >= 3, `${entity.title}: sections`);
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
  assert.ok(plainText(entity.content).length >= 260, `${entity.title}: prose length`);
  assert.equal(entity.templateData.originalAdaptation, "false", `${entity.title}: adaptation flag`);
  assert.equal(entity.content.includes(ORIGINAL_ADAPTATION_NOTICE), false, `${entity.title}: false notice`);
}
for (const entity of batch.locations) {
  assert.ok(plainText(entity.content).length >= 140, `${entity.title}: prose length`);
}
for (const entity of batch.sources) {
  assert.ok(plainText(entity.content).length >= 170, `${entity.title}: prose length`);
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
    assert.notEqual(event.startValue, "", `${event.title}: textual date`);
  }
}

const sourceTemplate = foundation.templates.find((item) => item.id.endsWith(":source-text"));
const workType = sourceTemplate.fields.find((item) => item.key === "workType");
assert.ok(workType.options.includes("魏晋六朝及隋唐古籍"));
assert.equal(
  batch.sources.find((item) => item.title.includes("三五历纪")).templateData.workType,
  "魏晋六朝及隋唐古籍"
);

console.log("Chinese mythology ancient core checks passed: 42 entries, 41 sourced relations, 20 dual-track events.");
