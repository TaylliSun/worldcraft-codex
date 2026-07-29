const assert = require("node:assert/strict");

const {
  ORIGINAL_ADAPTATION_NOTICE,
  buildMythologyFoundation
} = require("./chinese-mythology-history-data.cjs");
const { buildBuddhismTransmissionBatch } = require("./chinese-mythology-buddhism-transmission-data.cjs");
const { buildBuddhismDevotionBatch } = require("./chinese-mythology-buddhism-devotion-data.cjs");
const { buildBuddhismSchoolsBatch } = require("./chinese-mythology-buddhism-schools-data.cjs");
const { buildBuddhismPrajnaBatch } = require("./chinese-mythology-buddhism-prajna-data.cjs");
const { buildBuddhismPantheonBatch } = require("./chinese-mythology-buddhism-pantheon-data.cjs");

const now = "2026-07-20T00:00:00.000Z";
const foundation = buildMythologyFoundation(now);
const transmission = buildBuddhismTransmissionBatch(now, foundation.world.id);
const devotion = buildBuddhismDevotionBatch(now, foundation.world.id);
const schools = buildBuddhismSchoolsBatch(now, foundation.world.id);
const prajna = buildBuddhismPrajnaBatch(now, foundation.world.id);
const batch = buildBuddhismPantheonBatch(now, foundation.world.id);

const idsAreUnique = (items) => new Set(items.map((item) => item.id)).size === items.length;
const plainText = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

assert.equal(batch.entities.length, 153);
assert.equal(batch.figures.length, 110);
assert.equal(batch.systems.length, 18);
assert.equal(batch.sources.length, 25);
assert.equal(batch.relations.length, 452);
assert.equal(batch.timelineEvents.length, 44);
assert.equal(batch.featuredEntityIds.length, 8);
assert.equal(idsAreUnique(batch.entities), true);
assert.equal(idsAreUnique(batch.relations), true);
assert.equal(idsAreUnique(batch.timelineEvents), true);

const categoryIds = new Set(foundation.categories.map((item) => item.id));
const templates = new Map(foundation.templates.map((item) => [item.id, item]));
const knownEntities = [
  ...foundation.entities,
  ...transmission.entities,
  ...devotion.entities,
  ...schools.entities,
  ...prajna.entities,
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
  assert.ok(entity.summary.length >= 10, `${entity.title}: summary`);
  assert.ok((entity.content.match(/<h2>/g) || []).length >= 5, `${entity.title}: sections`);
  assert.ok(plainText(entity.content).length >= 200, `${entity.title}: prose length ${plainText(entity.content).length}`);
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
  assert.equal(entity.content.includes("项目原创创作提示"), true, `${entity.title}: creative boundary`);
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
const relationKinds = new Set([
  "ally", "rival", "family", "member", "leads", "controls", "located", "route", "teacher", "source",
  "creator", "companion", "protector", "evolution", "disputed", "incarnation", "subordinate", "devotion",
  "influence", "leader", "collaborator", "worship", "peer", "ritual", "contains", "custom"
]);
const confidenceValues = new Set(["certain", "probable", "disputed", "creative"]);
for (const relationItem of batch.relations) {
  assert.ok(entityIds.has(relationItem.sourceEntityId), `${relationItem.id}: source entity`);
  assert.ok(entityIds.has(relationItem.targetEntityId), `${relationItem.id}: target entity`);
  assert.notEqual(relationItem.sourceEntityId, relationItem.targetEntityId, `${relationItem.id}: self relation`);
  assert.ok(relationKinds.has(relationItem.kind), `${relationItem.id}: kind ${relationItem.kind}`);
  assert.ok(evidenceTypes.has(relationItem.evidenceType), `${relationItem.id}: evidence ${relationItem.evidenceType}`);
  assert.ok(relationItem.sourceCitation.trim(), `${relationItem.id}: citation`);
  assert.ok(relationItem.historicalScope.trim(), `${relationItem.id}: historical scope`);
  assert.ok(confidenceValues.has(relationItem.confidence), `${relationItem.id}: confidence`);
  assert.ok(relationItem.notes.trim(), `${relationItem.id}: notes`);
}

const sourceRelations = batch.relations.filter((item) => item.id.includes(":source-"));
assert.equal(sourceRelations.length, 128);
assert.equal(sourceRelations.every((item) => item.kind === "source" && item.strength === 5), true);
assert.equal(sourceRelations.every((item) => sourceIds.has(item.targetEntityId)), true);

for (const event of batch.timelineEvents) {
  assert.ok(trackIds.has(event.trackId), `${event.title}: track`);
  assert.ok(entityIds.has(event.entityId), `${event.title}: primary entity`);
  assert.ok(event.references.length >= 1, `${event.title}: references`);
  assert.equal(event.references.every((reference) => reference.kind === "entity" && entityIds.has(reference.id)), true, `${event.title}: valid references`);
  if (event.trackId.endsWith(":mythic-narrative")) {
    assert.equal(event.datePrecision, "custom", `${event.title}: mythic precision`);
    assert.equal(event.startValue, "", `${event.title}: no invented start`);
    assert.equal(event.endValue, "", `${event.title}: no invented end`);
  } else if (!event.displayDate.includes("释迦时代") && !event.displayDate.includes("早期佛教经律")) {
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
    "mythic-narrative": 13,
    "textual-evidence": 15,
    "religious-institutions": 8,
    "cult-evolution": 8
  }
);

for (const title of [
  "过去七佛谱系",
  "五方佛与五智体系",
  "七佛药师体系",
  "八大菩萨曼荼罗",
  "佛陀十大弟子名录",
  "十二药叉大将",
  "五大明王与独立明王",
  "法华十罗刹女",
  "法华会八龙王",
  "毗婆尸佛",
  "阿閦佛",
  "善名称吉祥王如来",
  "虚空藏菩萨",
  "富楼那弥多罗尼子",
  "胜鬘夫人",
  "阿育王",
  "不动明王",
  "宫毗罗大将",
  "娑伽罗龙王",
  "罗睺阿修罗王"
]) {
  assert.ok(batch.entities.some((item) => item.title === title), `${title}: required entry`);
}

assert.equal(batch.relations.filter((item) => item.label === "原典名录下一位").length, 49);
assert.equal(batch.relations.filter((item) => item.label === "五大明王仪轨次序下一尊").length, 4);
assert.equal(batch.relations.filter((item) => item.label === "十大弟子之一").length, 10);
assert.equal(batch.relations.filter((item) => item.label === "八大菩萨之一").length, 8);

assert.deepEqual(
  {
    entities: transmission.entities.length + devotion.entities.length + schools.entities.length + prajna.entities.length + batch.entities.length,
    identities: transmission.figures.length + devotion.figures.length + schools.figures.length + prajna.figures.length + batch.figures.length,
    relations: transmission.relations.length + devotion.relations.length + schools.relations.length + prajna.relations.length + batch.relations.length,
    timelineEvents: transmission.timelineEvents.length + devotion.timelineEvents.length + schools.timelineEvents.length + prajna.timelineEvents.length + batch.timelineEvents.length,
    sourceEntries: transmission.sources.length + devotion.sources.length + schools.sources.length + prajna.sources.length + batch.sources.length
  },
  { entities: 409, identities: 226, relations: 1169, timelineEvents: 133, sourceEntries: 106 }
);

console.log("Chinese mythology Buddhism pantheon checks passed: 153 entries, 452 sourced relations, 44 events; Buddhist direct totals 409/1169/133 with 226 identities and 106 source entries.");
