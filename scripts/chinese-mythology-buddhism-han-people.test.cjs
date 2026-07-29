const assert = require("node:assert/strict");
const { buildMythologyFoundation, ORIGINAL_ADAPTATION_NOTICE } = require("./chinese-mythology-history-data.cjs");
const { buildBuddhismTransmissionBatch } = require("./chinese-mythology-buddhism-transmission-data.cjs");
const { buildBuddhismDevotionBatch } = require("./chinese-mythology-buddhism-devotion-data.cjs");
const { buildBuddhismSchoolsBatch } = require("./chinese-mythology-buddhism-schools-data.cjs");
const { buildBuddhismPrajnaBatch } = require("./chinese-mythology-buddhism-prajna-data.cjs");
const { buildBuddhismPantheonBatch } = require("./chinese-mythology-buddhism-pantheon-data.cjs");
const { buildBuddhismCanonBatch } = require("./chinese-mythology-buddhism-canon-data.cjs");
const { buildBuddhismCanonSupplementBatch } = require("./chinese-mythology-buddhism-canon-supplement-data.cjs");
const { buildBuddhismHanPeopleBatch, hanEntityId, groupRows, figureRows } = require("./chinese-mythology-buddhism-han-people-data.cjs");

const now = "2026-07-20T00:00:00.000Z";
const foundation = buildMythologyFoundation(now);
const batches = [
  buildBuddhismTransmissionBatch(now, foundation.world.id),
  buildBuddhismDevotionBatch(now, foundation.world.id),
  buildBuddhismSchoolsBatch(now, foundation.world.id),
  buildBuddhismPrajnaBatch(now, foundation.world.id),
  buildBuddhismPantheonBatch(now, foundation.world.id),
  buildBuddhismCanonBatch(now, foundation.world.id),
  buildBuddhismCanonSupplementBatch(now, foundation.world.id)
];
const batch = buildBuddhismHanPeopleBatch(now, foundation.world.id);
const plainText = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;

assert.equal(groupRows.length, 6);
assert.equal(figureRows.length, 150);
assert.equal(batch.entities.length, 156);
assert.equal(batch.figures.length, 150);
assert.equal(batch.systems.length, 6);
assert.equal(batch.relations.length, 600);
assert.equal(batch.timelineEvents.length, 40);
assert.equal(uniqueIds(batch.entities) && uniqueIds(batch.relations) && uniqueIds(batch.timelineEvents), true);
assert.equal(new Set(figureRows.map((item) => item.title)).size, 150);

const priorTitles = new Set(batches.flatMap((item) => item.figures || []).map((item) => item.title));
assert.deepEqual(figureRows.filter((item) => priorTitles.has(item.title)).map((item) => item.title), []);
const categoryIds = new Set(foundation.categories.map((item) => item.id));
const templates = new Map(foundation.templates.map((item) => [item.id, item]));
const knownEntities = [...foundation.entities, ...batches.flatMap((item) => item.entities), ...batch.entities];
const entityIds = new Set(knownEntities.map((item) => item.id));
const sourceIds = new Set(knownEntities.filter((item) => item.templateId?.endsWith(":source-text")).map((item) => item.id));
const trackIds = new Set(foundation.timelineTracks.map((item) => item.id));

for (const entity of batch.entities) {
  assert.ok(categoryIds.has(entity.categoryId), `${entity.title}: category`);
  assert.ok(templates.has(entity.templateId), `${entity.title}: template`);
  assert.ok((entity.content.match(/<h2>/g) || []).length >= 6, `${entity.title}: sections`);
  assert.ok(plainText(entity.content).length >= 240, `${entity.title}: prose`);
  assert.doesNotMatch(`${entity.summary}\n${entity.content}`, /(?:https?|ftp):\/\/|\bwww\./i, `${entity.title}: URL`);
  const template = templates.get(entity.templateId);
  for (const field of template.fields.filter((item) => item.required)) {
    const value = entity.templateData[field.key];
    assert.notEqual(value, undefined, `${entity.title}: ${field.key}`);
    assert.notEqual(String(value).trim(), "", `${entity.title}: ${field.key}`);
    if (field.options?.length) assert.ok(field.options.includes(value), `${entity.title}: ${field.key} option`);
  }
}

for (const figure of batch.figures) {
  assert.equal(figure.templateData.originalAdaptation, "false", `${figure.title}: adaptation`);
  assert.equal(figure.content.includes(ORIGINAL_ADAPTATION_NOTICE), false, `${figure.title}: no false notice`);
  assert.equal(figure.content.includes("项目原创提示"), true, `${figure.title}: boundary`);
}
const publicText = batch.entities.map((item) => `${item.summary}\n${item.content}`).join("\n");
assert.doesNotMatch(publicText, /百度百科|维基百科|5000yan|World\s*Anvil|AI\s*生成|规则复核|索引说明|同名说明/u);
assert.doesNotMatch(publicText, /古老而神秘|命运的齿轮|不为人知的秘密|最终揭开真相|值得注意的是|毋庸置疑|众所周知|综上所述|在历史的长河中/u);

const seen = new Map();
for (const entity of batch.entities) for (const match of entity.content.matchAll(/<p>(.*?)<\/p>/gs)) {
  const paragraph = plainText(match[1]);
  if (paragraph.length < 60) continue;
  assert.equal(seen.get(paragraph), undefined, `${entity.title}: repeats ${seen.get(paragraph)}`);
  seen.set(paragraph, entity.title);
}

for (const relation of batch.relations) {
  assert.ok(entityIds.has(relation.sourceEntityId), `${relation.id}: source`);
  assert.ok(entityIds.has(relation.targetEntityId), `${relation.id}: target`);
  assert.notEqual(relation.sourceEntityId, relation.targetEntityId, `${relation.id}: self`);
  assert.ok(relation.sourceCitation && relation.historicalScope && relation.confidence && relation.notes, `${relation.id}: evidence`);
}
const sourceRelations = batch.relations.filter((item) => item.id.includes(":source-figure-"));
assert.equal(sourceRelations.length, 140);
assert.equal(sourceRelations.every((item) => item.kind === "source" && item.strength === 5 && sourceIds.has(item.targetEntityId)), true);
assert.equal(batch.relations.filter((item) => item.label === "列入汉传人物分区").length, 150);
assert.equal(batch.relations.filter((item) => item.label === "本组下一人物").length, 144);
assert.equal(batch.relations.filter((item) => item.label === "人物研究分区入口").length, 150);

for (const event of batch.timelineEvents) {
  assert.ok(trackIds.has(event.trackId), `${event.title}: track`);
  assert.ok(entityIds.has(event.entityId), `${event.title}: entity`);
  assert.ok(event.startValue && event.endValue, `${event.title}: date`);
}
assert.deepEqual(batch.timelineEvents.reduce((counts, event) => {
  const key = event.trackId.split(":").at(-1);
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {}), { "textual-evidence": 20, "religious-institutions": 10, "cult-evolution": 10 });

for (const title of ["道安", "法显", "实叉难陀", "知礼", "李通玄", "临济义玄", "大慧宗杲", "净检比丘尼", "杨文会", "太虚"]) assert.ok(batch.entities.some((item) => item.title === title), `${title}: required`);
const jingying = batch.entities.find((item) => item.id === hanEntityId("huiyuan-jingying", foundation.world.id));
assert.match(jingying.content, /庐山慧远|消歧/u);

assert.deepEqual({
  entities: batches.reduce((sum, item) => sum + item.entities.length, 0) + batch.entities.length,
  identities: batches.reduce((sum, item) => sum + (item.figures?.length || 0), 0) + batch.figures.length,
  relations: batches.reduce((sum, item) => sum + item.relations.length, 0) + batch.relations.length,
  timelineEvents: batches.reduce((sum, item) => sum + item.timelineEvents.length, 0) + batch.timelineEvents.length,
  sourceEntries: batches.reduce((sum, item) => sum + (item.sources?.length || 0), 0)
}, { entities: 793, identities: 376, relations: 2601, timelineEvents: 236, sourceEntries: 314 });

console.log("Chinese mythology Buddhism Han people checks passed: 156 entries, 600 sourced relations, 40 events; Buddhist direct totals 793/2601/236 with 376 identities and 314 source entries.");
