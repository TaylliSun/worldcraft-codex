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
const { buildBuddhismSchoolsBatch } = require("./chinese-mythology-buddhism-schools-data.cjs");
const { buildConfucianRitesBatch } = require("./chinese-mythology-confucian-rites-data.cjs");
const { buildFolkSyncretismBatch } = require("./chinese-mythology-folk-syncretism-data.cjs");

const now = "2026-07-19T00:00:00.000Z";
const foundation = buildMythologyFoundation(now);
const previousBatches = [
  buildAncientCoreBatch(now, foundation.world.id),
  buildNaturePantheonBatch(now, foundation.world.id),
  buildCivilizationLineagesBatch(now, foundation.world.id),
  buildDaoismEarlyBatch(now, foundation.world.id),
  buildCelestialBureaucracyBatch(now, foundation.world.id),
  buildDaoismLineagesBatch(now, foundation.world.id),
  buildBuddhismTransmissionBatch(now, foundation.world.id),
  buildBuddhismDevotionBatch(now, foundation.world.id),
  buildBuddhismSchoolsBatch(now, foundation.world.id),
  buildConfucianRitesBatch(now, foundation.world.id)
];
const batch = buildFolkSyncretismBatch(now, foundation.world.id);

const idsAreUnique = (items) => new Set(items.map((item) => item.id)).size === items.length;
const plainText = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

assert.equal(batch.entities.length, 60);
assert.equal(batch.figures.length, 32);
assert.equal(batch.institutions.length, 8);
assert.equal(batch.locations.length, 7);
assert.equal(batch.sources.length, 13);
assert.equal(batch.relations.length, 250);
assert.equal(batch.timelineEvents.length, 35);
assert.equal(batch.featuredEntityIds.length, 8);
assert.equal(idsAreUnique(batch.entities), true);
assert.equal(idsAreUnique(batch.relations), true);
assert.equal(idsAreUnique(batch.timelineEvents), true);

const categoryIds = new Set(foundation.categories.map((item) => item.id));
const templates = new Map(foundation.templates.map((item) => [item.id, item]));
const previousEntities = [
  ...foundation.entities,
  ...previousBatches.flatMap((item) => item.entities)
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
assert.equal(sourceRelations.length, 47);
assert.equal(sourceRelations.every((item) => item.kind === "source" && item.strength === 5), true);
assert.equal(sourceRelations.every((item) => sourceIds.has(item.targetEntityId)), true);
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
    "mythic-narrative": 5,
    "textual-evidence": 10,
    "religious-institutions": 12,
    "cult-evolution": 8
  }
);

for (const title of [
  "妈祖（天妃、天后）",
  "碧霞元君",
  "文昌帝君（梓潼神）",
  "钟馗",
  "月下老人",
  "关帝（忠义、武庙与财神形态）",
  "赵公明（玄坛与财神形态）",
  "临水夫人（陈靖姑）",
  "泗州大圣（僧伽信仰）",
  "门神图像与岁除贴门",
  "财神谱系与商帮会馆祭祀",
  "三教合祀、同庙并存与善书传播",
  "湄洲岛与妈祖祖庙",
  "广州南海神庙（波罗庙）",
  "《搜神记》地方神与变形叙事",
  "《三教源流搜神大全》"
]) {
  assert.ok(batch.entities.some((item) => item.title === title), `${title}: required entry`);
}

for (const label of [
  "忠臣底本与后世国家庙祀分层",
  "佛教伽蓝护法形态",
  "同居家宅祭祀而空间职能不同",
  "历史人物进入道教真人谱的不同路径",
  "国家海神与先秦河神文献比较",
  "文庙武庙并称的后世制度",
  "地方冥府职能与东岳体系后起相接"
]) {
  assert.ok(batch.relations.some((item) => item.label === label), `${label}: boundary relation`);
}

assert.deepEqual(
  {
    entities: allEntities.length,
    relations: previousBatches.reduce((count, item) => count + item.relations.length, 0) + batch.relations.length,
    timelineEvents: previousBatches.reduce((count, item) => count + item.timelineEvents.length, 0) + batch.timelineEvents.length
  },
  { entities: 651, relations: 1936, timelineEvents: 264 }
);

console.log("Chinese mythology folk syncretism checks passed: 60 entries, 250 sourced relations, 35 four-track events; cumulative totals 651/1936/264.");
