const assert = require("node:assert/strict");
const { buildMythologyFoundation, ORIGINAL_ADAPTATION_NOTICE } = require("./chinese-mythology-history-data.cjs");
const { buildBuddhismTransmissionBatch } = require("./chinese-mythology-buddhism-transmission-data.cjs");
const { buildBuddhismDevotionBatch } = require("./chinese-mythology-buddhism-devotion-data.cjs");
const { buildBuddhismSchoolsBatch } = require("./chinese-mythology-buddhism-schools-data.cjs");
const { buildBuddhismPrajnaBatch } = require("./chinese-mythology-buddhism-prajna-data.cjs");
const { buildBuddhismPantheonBatch } = require("./chinese-mythology-buddhism-pantheon-data.cjs");
const { buildBuddhismCanonBatch } = require("./chinese-mythology-buddhism-canon-data.cjs");
const { buildBuddhismCanonSupplementBatch } = require("./chinese-mythology-buddhism-canon-supplement-data.cjs");
const { buildBuddhismHanPeopleBatch } = require("./chinese-mythology-buddhism-han-people-data.cjs");
const { buildBuddhismTibetanBatch } = require("./chinese-mythology-buddhism-tibetan-data.cjs");
const {
  buildBuddhismSouthernMaterialBatch,
  southernEntityId,
  personGroupRows,
  catalogGroupRows,
  figureRows,
  sourceRows,
  catalogRows
} = require("./chinese-mythology-buddhism-southern-material-data.cjs");

const now = "2026-07-20T00:00:00.000Z";
const foundation = buildMythologyFoundation(now);
const batches = [
  buildBuddhismTransmissionBatch(now, foundation.world.id),
  buildBuddhismDevotionBatch(now, foundation.world.id),
  buildBuddhismSchoolsBatch(now, foundation.world.id),
  buildBuddhismPrajnaBatch(now, foundation.world.id),
  buildBuddhismPantheonBatch(now, foundation.world.id),
  buildBuddhismCanonBatch(now, foundation.world.id),
  buildBuddhismCanonSupplementBatch(now, foundation.world.id),
  buildBuddhismHanPeopleBatch(now, foundation.world.id),
  buildBuddhismTibetanBatch(now, foundation.world.id)
];
const batch = buildBuddhismSouthernMaterialBatch(now, foundation.world.id);
const plainText = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;

assert.equal(personGroupRows.length, 5);
assert.equal(catalogGroupRows.length, 4);
assert.equal(figureRows.length, 44);
assert.equal(sourceRows.length, 10);
assert.equal(catalogRows.length, 65);
assert.equal(batch.entities.length, 128);
assert.equal(batch.figures.length, 44);
assert.equal(batch.sources.length, 10);
assert.equal(batch.catalogEntries.length, 65);
assert.equal(batch.systems.length, 9);
assert.equal(batch.relations.length, 320);
assert.equal(batch.timelineEvents.length, 32);
assert.equal(uniqueIds(batch.entities) && uniqueIds(batch.relations) && uniqueIds(batch.timelineEvents), true);

const priorEntities = [...foundation.entities, ...batches.flatMap((item) => item.entities)];
const priorTitles = new Set(priorEntities.map((item) => item.title));
assert.deepEqual(batch.entities.filter((item) => priorTitles.has(item.title)).map((item) => item.title), []);
assert.equal(new Set(batch.entities.map((item) => item.title)).size, 128);
const categoryIds = new Set(foundation.categories.map((item) => item.id));
const templates = new Map(foundation.templates.map((item) => [item.id, item]));
const knownEntities = [...priorEntities, ...batch.entities];
const entityIds = new Set(knownEntities.map((item) => item.id));
const sourceIds = new Set(knownEntities.filter((item) => item.templateId?.endsWith(":source-text")).map((item) => item.id));
const trackIds = new Set(foundation.timelineTracks.map((item) => item.id));

for (const entity of batch.entities) {
  assert.ok(categoryIds.has(entity.categoryId), `${entity.title}: category`);
  const template = templates.get(entity.templateId);
  assert.ok(template, `${entity.title}: template`);
  assert.ok((entity.content.match(/<h2>/g) || []).length >= 6, `${entity.title}: sections`);
  assert.ok(plainText(entity.content).length >= 240, `${entity.title}: prose`);
  assert.doesNotMatch(`${entity.summary}\n${entity.content}`, /(?:https?|ftp):\/\/|\bwww\./i, `${entity.title}: URL`);
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
for (const source of batch.sources) {
  const ancient = source.templateData.rightsStatus === "古籍原文" && source.templateData.reviewStatus === "已核原文";
  const project = source.templateData.rightsStatus === "项目自写整理" && source.templateData.reviewStatus === "可公开";
  assert.equal(ancient || project, true, `${source.title}: rights matrix`);
  assert.match(source.content, /不转录现代受版权保护译文/u, `${source.title}: copyright boundary`);
}
assert.equal(batch.catalogEntries.filter((item) => item.type === "location").length, 24);
assert.equal(batch.catalogEntries.filter((item) => item.templateId?.endsWith(":institution-ritual")).length, 41);

const publicText = batch.entities.map((item) => `${item.summary}\n${item.content}`).join("\n");
assert.doesNotMatch(publicText, /百度百科|维基百科|5000yan|World\s*Anvil|AI\s*生成|规则复核|索引说明|同名说明/u);
assert.doesNotMatch(publicText, /古老而神秘|命运的齿轮|不为人知的秘密|最终揭开真相|值得注意的是|毋庸置疑|众所周知|综上所述|在历史的长河中/u);

const seen = new Map();
for (const entity of batch.entities) {
  for (const match of entity.content.matchAll(/<p>(.*?)<\/p>/gs)) {
    const paragraph = plainText(match[1]);
    if (paragraph.length < 60) continue;
    assert.equal(seen.get(paragraph), undefined, `${entity.title}: repeats ${seen.get(paragraph)}`);
    seen.set(paragraph, entity.title);
  }
}

for (const relation of batch.relations) {
  assert.ok(entityIds.has(relation.sourceEntityId), `${relation.id}: source`);
  assert.ok(entityIds.has(relation.targetEntityId), `${relation.id}: target`);
  assert.notEqual(relation.sourceEntityId, relation.targetEntityId, `${relation.id}: self`);
  assert.ok(relation.sourceCitation && relation.historicalScope && relation.confidence && relation.notes, `${relation.id}: evidence`);
}
const sourceRelations = batch.relations.filter((item) => item.id.includes(":source-figure-"));
assert.equal(sourceRelations.length, 44);
assert.equal(sourceRelations.every((item) => item.kind === "source" && item.strength === 5 && sourceIds.has(item.targetEntityId)), true);
assert.equal(batch.relations.filter((item) => item.label === "列入南传与巴利人物分区").length, 44);
assert.equal(batch.relations.filter((item) => item.label === "本组下一人物").length, 39);
assert.equal(batch.relations.filter((item) => item.label === "人物传统与阅读入口").length, 44);
assert.equal(batch.relations.filter((item) => item.label === "列入专题目录").length, 65);
assert.equal(batch.relations.filter((item) => item.label === "本专题下一条目").length, 61);

for (const timelineEvent of batch.timelineEvents) {
  assert.ok(trackIds.has(timelineEvent.trackId), `${timelineEvent.title}: track`);
  assert.ok(entityIds.has(timelineEvent.entityId), `${timelineEvent.title}: entity`);
  assert.ok(timelineEvent.startValue && timelineEvent.endValue, `${timelineEvent.title}: date`);
}
assert.deepEqual(batch.timelineEvents.reduce((counts, item) => {
  const key = item.trackId.split(":").at(-1);
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {}), { "textual-evidence": 10, "religious-institutions": 14, "cult-evolution": 8 });

for (const title of ["中国南传上座部佛教", "巴利《律藏》", "波吒遮罗比丘尼", "摩哂陀", "帕雅真", "西双版纳总佛寺", "水陆法会", "佛教造像", "金刚杵与金刚铃"]) {
  assert.ok(batch.entities.some((item) => item.title === title), `${title}: required`);
}
const mahanama = batch.entities.find((item) => item.id === southernEntityId("person-mahanama-five", foundation.world.id));
assert.match(mahanama.content, /释族在家弟子摩诃男|消歧/u);
const dhammapala = batch.entities.find((item) => item.id === southernEntityId("person-dhammapala", foundation.world.id));
assert.match(dhammapala.content, /唯识论师护法|消歧/u);

assert.deepEqual({
  entities: batches.reduce((sum, item) => sum + item.entities.length, 0) + batch.entities.length,
  identities: batches.reduce((sum, item) => sum + (item.figures?.length || 0), 0) + batch.figures.length,
  relations: batches.reduce((sum, item) => sum + item.relations.length, 0) + batch.relations.length,
  timelineEvents: batches.reduce((sum, item) => sum + item.timelineEvents.length, 0) + batch.timelineEvents.length,
  sourceEntries: batches.reduce((sum, item) => sum + (item.sources?.length || 0), 0) + batch.sources.length
}, { entities: 1027, identities: 500, relations: 3261, timelineEvents: 298, sourceEntries: 332 });

console.log("Chinese mythology Buddhism Southern/material checks passed: 128 entries, 320 sourced relations, 32 events; Buddhist direct totals 1027/3261/298 with 500 identities and 332 source entries.");
