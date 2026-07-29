const assert = require("node:assert/strict");

const {
  WORLD_ID,
  buildShanhaiCaseData,
  classicVolumes,
  illustratedRecords,
  volumeEntityId
} = require("./shanhai-case-data.cjs");
const { corpus } = require("./shanhai-corpus-data.cjs");

const baseImageUrl = "worldcraft://asset/test-map.png";
const mapImageUrls = {
  fiveClassics: "worldcraft://asset/test-five-classics.png",
  seaClassics: "worldcraft://asset/test-sea-classics.png",
  chapters: Object.fromEntries(classicVolumes.map((volume) => [volume.key, `worldcraft://asset/test-${volume.key}.png`]))
};
const data = buildShanhaiCaseData("2026-07-16T00:00:00.000Z", baseImageUrl, mapImageUrls);

function uniqueIds(items, label) {
  assert.equal(new Set(items.map((item) => item.id)).size, items.length, `${label} IDs are unique`);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

for (const [key, value] of Object.entries(data)) {
  if (Array.isArray(value)) uniqueIds(value, key);
}

assert.equal(data.world.id, WORLD_ID);
assert.equal(data.world.name, "山海经 · 原典内容全集");
assert.equal(data.world.wiki.coverAssetId, "asset-shanhai-map-base");
assert.equal(data.world.wiki.defaultMapId, "map-shanhai-watercolor");
assert.equal(data.world.wiki.navigationCategoryIds.length, 7);
assert.equal(data.world.wiki.featuredEntityIds.length, 8);
assert.equal(data.world.wiki.publishedMapIds.length, 21);
assert.equal(data.world.wiki.publishedTimelineTrackIds.length, 4);
assert.equal(data.world.wiki.publishedQuestIds.length, data.quests.length);
assert.equal(classicVolumes.length, 18);
assert.equal(illustratedRecords.length, 263);
assert.equal(new Set(illustratedRecords.map((item) => item.key)).size, illustratedRecords.length, "illustrated record keys are unique");
const illustrationKindByTitle = new Map(illustratedRecords.map((item) => [item.title, item.kind]));
assert.equal(illustrationKindByTitle.has("碧阳"), false, "named water bodies are represented by maps rather than item cutouts");
assert.equal(illustrationKindByTitle.has("三淖"), false, "named marshes are represented by maps rather than item cutouts");
assert.equal(illustrationKindByTitle.has("祝馀"), false, "祝馀 is merged into the canonical 祝余 entry");
assert.equal(illustrationKindByTitle.has("迷谷"), false, "迷谷 is merged into the canonical 迷榖 entry");
assert.equal(illustrationKindByTitle.has("猩猩"), false, "猩猩 is merged into the canonical 狌狌 entry");
assert.equal(illustrationKindByTitle.get("狌狌"), "creature", "狌狌 has one canonical creature illustration");
for (const title of ["菌人", "灵恝", "女丑", "女虔"]) assert.equal(illustrationKindByTitle.get(title), "figure", `${title} is illustrated as a figure`);
  for (const title of ["三骓", "天犬", "育蛇", "戎宣王尸"]) assert.equal(illustrationKindByTitle.get(title), "creature", `${title} is illustrated as a creature`);
assert.equal(data.entities.filter((item) => item.slug.startsWith("classic-")).length, 18);
assert.deepEqual(data.corpusStats, {
  chapterCount: 18,
  passageCount: 869,
  characterCount: 38320,
  sectionCount: 45,
  indexTermCount: 1047,
  newIndexEntityCount: 906,
  entityCount: 1914
});
assert.equal(data.entities.length, data.corpusStats.entityCount);
assert.ok(data.entities.every((item) => String(item.title || "").trim()), "every encyclopedia entry has a title");
assert.ok(data.entities.every((item) => String(item.summary || "").trim()), "every encyclopedia entry has a summary");
assert.ok(data.entities.every((item) => String(item.content || "").replace(/<[^>]+>/g, "").trim()), "every encyclopedia entry has body content");
assert.deepEqual(
  data.entities.filter((item) => /(^|\n)#{1,6}\s+/.test(String(item.content || ""))).map((item) => item.id),
  [],
  "Wiki article bodies use rich-text HTML instead of exposing Markdown heading tokens"
);
assert.equal(data.entities.filter((item) => item.id.startsWith("entity-shanhai-passage-")).length, corpus.stats.passageCount);
assert.equal(data.entities.filter((item) => item.id.startsWith("entity-shanhai-index-")).length, data.corpusStats.newIndexEntityCount);
assert.equal(new Set(data.entities.map((item) => item.title)).size, data.entities.length, "entity titles are unique");
assert.equal(data.maps.length, 20);
assert.equal(data.maps.find((item) => item.id === "map-shanhai-five-classics")?.imageUrl, mapImageUrls.fiveClassics);
assert.equal(data.maps.find((item) => item.id === "map-shanhai-sea-classics")?.imageUrl, mapImageUrls.seaClassics);
assert.equal(new Set([baseImageUrl, ...data.maps.map((item) => item.imageUrl)]).size, 21, "every published map uses an independent base image");
assert.equal(data.maps.filter((item) => item.id.startsWith("map-shanhai-volume-")).length, 18);
assert.ok(data.maps.filter((item) => item.id.startsWith("map-shanhai-volume-")).every((item) => item.parentMapId && item.entryMarkerId && item.imageUrl));
assert.ok(data.maps.filter((item) => item.id.startsWith("map-shanhai-volume-")).every((item) => item.width === 1536 && item.height === 1024));
assert.equal(data.mapMarkers.length, 65);
assert.equal(data.mapRoutes.length, 20);
assert.equal(data.timelineEvents.length, 12);
assert.equal(data.quests.length, 8);
assert.equal(data.storyScenes.length, 4);
assert.equal(data.manuscriptVolumes.length, 5);
assert.equal(data.manuscriptBooks.length, 1);
assert.equal(data.manuscriptChapters.length, 18);
assert.equal(data.manuscriptScenes.length, 6);
assert.equal(data.aiMemoryItems.length, 15);

assert.equal(corpus.chapters.length, 18);
assert.equal(corpus.chapters.reduce((total, chapter) => total + chapter.passages.length, 0), 869);
assert.equal(corpus.chapters.reduce((total, chapter) => total + chapter.characterCount, 0), 38320);
assert.equal(corpus.corpusVersion, "1.2.0");
assert.equal(new Set(corpus.chapters.map((chapter) => chapter.extractSha256)).size, 18);
const sourcePassages = corpus.chapters.flatMap((chapter) => chapter.passages);
assert.ok(sourcePassages.every((passage) => !/https?:\/\//i.test(passage.originalText)), "source navigation links never become corpus passages");
assert.ok(sourcePassages.every((passage) => !/[【〖]\s*[】〗]/.test(passage.originalText)), "empty annotation brackets are removed from original text");
assert.ok(sourcePassages.every((passage) => /[\u3400-\u9fff\ud840-\ud87f]/u.test(passage.originalText)), "each corpus passage contains source text");
assert.ok(sourcePassages.every((passage) => passage.plainLanguageText !== passage.originalText), "each passage has a distinct project reading");
assert.ok(sourcePassages.every((passage) => !passage.plainLanguageText.startsWith("本段记述的是：")), "no passage relies on the unchanged-text fallback");
assert.ok(sourcePassages.every((passage) => passage.plainLanguageVersion === "1.1.0"), "each passage uses the current project reading rules");
assert.ok(sourcePassages.every((passage) => !/(?:一座一座|这里有这里|位于位于|并且并且)/.test(passage.plainLanguageText)), "project readings contain no known stacked-rule artifacts");
const passageEntities = new Map(data.entities
  .filter((item) => item.id.startsWith("entity-shanhai-passage-"))
  .map((item) => [item.templateData.passageId, item]));
const indexEntities = data.entities.filter((item) => item.id.startsWith("entity-shanhai-index-"));
assert.equal(indexEntities.length, 906);
for (const entity of indexEntities) {
  assert.equal(entity.templateData.reviewStatus, "规则复核", `${entity.title} exposes its rule-review state`);
  assert.ok(entity.templateData.normalizedName, `${entity.title} has a normalized index name`);
  assert.ok(entity.templateData.reviewEvidence.includes("原文段落"), `${entity.title} records review evidence`);
  assert.ok(entity.templateData.occurrencePassageIds, `${entity.title} retains occurrence passage IDs`);
  assert.ok(entity.templateData.visualKind, `${entity.title} records its visual classification`);
  assert.ok(["是", "否"].includes(entity.templateData.requiresIllustration), `${entity.title} records whether it needs an illustration`);
  assert.equal(entity.tags.includes("待人工复核"), false, `${entity.title} no longer carries the pending-review tag`);
  assert.equal(entity.title.includes("──"), false, `${entity.title} strips source-side explanatory dashes from its normalized title`);
}
for (const chapter of corpus.chapters) {
  assert.ok(chapter.sourceRevisionId, `${chapter.title} has a fixed source revision`);
  assert.match(chapter.extractSha256, /^[a-f0-9]{64}$/, `${chapter.title} has a SHA-256`);
  assert.deepEqual(chapter.passages.map((passage) => passage.order), Array.from({ length: chapter.passages.length }, (_, index) => index + 1), `${chapter.title} passage order is continuous`);
  const volumeEntity = data.entities.find((item) => item.id === volumeEntityId(chapter.key));
  assert.ok(volumeEntity?.content.includes(escapeHtml(chapter.passages[0].originalText)), `${chapter.title} full entry contains its first passage`);
  assert.ok(volumeEntity?.content.includes(escapeHtml(chapter.passages[0].plainLanguageText)), `${chapter.title} full entry contains its first plain-language reading`);
  assert.ok(volumeEntity?.content.includes(escapeHtml(chapter.passages.at(-1).originalText)), `${chapter.title} full entry contains its final passage`);
  for (const passage of chapter.passages) {
    const entity = passageEntities.get(passage.id);
    assert.ok(entity, `${passage.id} resolves to a knowledge entry`);
    assert.ok(entity.content.includes(escapeHtml(passage.originalText)), `${passage.id} preserves the complete original text`);
    assert.ok(
      passage.plainLanguageText.length >= Math.min(6, passage.originalText.length),
      `${passage.id} has a project-authored plain-language reading`
    );
    assert.equal(passage.plainLanguageReviewStatus, "项目初校", `${passage.id} exposes an honest review state`);
    assert.match(passage.plainLanguageMethod, /^Worldcraft Codex 自制规则释读 v\d+\.\d+\.\d+$/, `${passage.id} records its interpretation method`);
    assert.match(passage.plainLanguageSha256, /^[a-f0-9]{64}$/, `${passage.id} has an interpretation checksum`);
    assert.ok(entity.content.includes(escapeHtml(passage.plainLanguageText)), `${passage.id} exposes its plain-language reading`);
    assert.equal(entity.templateData.sourceRevision, String(chapter.sourceRevisionId), `${passage.id} preserves its source revision`);
    assert.equal(entity.templateData.reviewStatus, "项目初校", `${passage.id} is marked as a project-reviewed reading`);
    assert.equal(entity.templateData.plainLanguageVersion, passage.plainLanguageVersion, `${passage.id} records its reading version`);
  }
}

const entityIds = new Set(data.entities.map((item) => item.id));
const mapIds = new Set(data.maps.map((item) => item.id));
mapIds.add("map-shanhai-watercolor");
const mapLayerIds = new Set(data.mapLayers.map((item) => item.id));
mapLayerIds.add("map-layer-default:map-shanhai-watercolor");
const markerIds = new Set(data.mapMarkers.map((item) => item.id));
const questIds = new Set(data.quests.map((item) => item.id));
const variableIds = new Set(data.storyVariables.map((item) => item.id));
const sceneIds = new Set(data.storyScenes.map((item) => item.id));
const timelineIds = new Set(data.timelineEvents.map((item) => item.id));
const milestoneIds = new Set(data.narrativeMilestones.map((item) => item.id));
const bookIds = new Set(data.manuscriptBooks.map((item) => item.id));
const volumeIds = new Set(data.manuscriptVolumes.map((item) => item.id));
const chapterIds = new Set(data.manuscriptChapters.map((item) => item.id));

for (const relation of data.relations) {
  assert.ok(entityIds.has(relation.sourceEntityId), `${relation.id} source resolves`);
  assert.ok(entityIds.has(relation.targetEntityId), `${relation.id} target resolves`);
}
for (const marker of data.mapMarkers) {
  assert.ok(mapIds.has(marker.mapId), `${marker.id} map resolves`);
  assert.ok(mapLayerIds.has(marker.layerId), `${marker.id} layer resolves`);
  assert.ok(entityIds.has(marker.entityId), `${marker.id} entity resolves`);
  if (marker.questId) assert.ok(questIds.has(marker.questId), `${marker.id} quest resolves`);
  if (marker.sceneId) assert.ok(sceneIds.has(marker.sceneId), `${marker.id} scene resolves`);
}
for (const route of data.mapRoutes) {
  assert.ok(mapIds.has(route.mapId), `${route.id} map resolves`);
  route.stops.forEach((stop) => assert.ok(markerIds.has(stop.markerId), `${route.id}/${stop.id} marker resolves`));
}
for (const quest of data.quests) {
  quest.relatedEntityIds.forEach((id) => assert.ok(entityIds.has(id), `${quest.id} entity resolves`));
  quest.prerequisiteQuestIds.forEach((id) => assert.ok(questIds.has(id), `${quest.id} prerequisite resolves`));
}
for (const scene of data.storyScenes) {
  const nodeIds = new Set(scene.nodes.map((node) => node.id));
  assert.ok(nodeIds.has(scene.entryNodeId), `${scene.id} entry resolves`);
  scene.relatedEntityIds.forEach((id) => assert.ok(entityIds.has(id), `${scene.id} entity resolves`));
  scene.relatedQuestIds.forEach((id) => assert.ok(questIds.has(id), `${scene.id} quest resolves`));
  for (const node of scene.nodes) {
    if (node.speakerEntityId) assert.ok(entityIds.has(node.speakerEntityId), `${node.id} speaker resolves`);
    if (node.nextNodeId) assert.ok(nodeIds.has(node.nextNodeId), `${node.id} next node resolves`);
    for (const choice of node.choices) {
      assert.ok(nodeIds.has(choice.targetNodeId), `${choice.id} target resolves`);
      [...choice.conditions, ...choice.effects].forEach((item) => assert.ok(variableIds.has(item.variableId), `${choice.id} variable resolves`));
    }
    [...node.conditions, ...node.effects].forEach((item) => assert.ok(variableIds.has(item.variableId), `${node.id} variable resolves`));
  }
}
for (const event of data.timelineEvents) {
  assert.ok(entityIds.has(event.entityId), `${event.id} entity resolves`);
  event.dependencyIds.forEach((id) => assert.ok(timelineIds.has(id), `${event.id} dependency resolves`));
}
for (const milestone of data.narrativeMilestones) {
  milestone.dependencyIds.forEach((id) => assert.ok(milestoneIds.has(id), `${milestone.id} dependency resolves`));
  milestone.linkedQuestIds.forEach((id) => assert.ok(questIds.has(id), `${milestone.id} quest resolves`));
  milestone.linkedSceneIds.forEach((id) => assert.ok(sceneIds.has(id), `${milestone.id} scene resolves`));
  milestone.linkedEntityIds.forEach((id) => assert.ok(entityIds.has(id), `${milestone.id} entity resolves`));
  milestone.linkedTimelineEventIds.forEach((id) => assert.ok(timelineIds.has(id), `${milestone.id} timeline resolves`));
}
for (const volume of data.manuscriptVolumes) assert.ok(bookIds.has(volume.bookId), `${volume.id} book resolves`);
for (const chapter of data.manuscriptChapters) {
  assert.ok(bookIds.has(chapter.bookId), `${chapter.id} book resolves`);
  assert.ok(volumeIds.has(chapter.volumeId), `${chapter.id} volume resolves`);
  assert.ok(entityIds.has(chapter.viewpointEntityId), `${chapter.id} viewpoint resolves`);
  assert.ok(milestoneIds.has(chapter.linkedNarrativeMilestoneId), `${chapter.id} milestone resolves`);
  chapter.linkedStorySceneIds.forEach((id) => assert.ok(sceneIds.has(id), `${chapter.id} scene resolves`));
}
for (const scene of data.manuscriptScenes) {
  assert.ok(bookIds.has(scene.bookId), `${scene.id} book resolves`);
  assert.ok(volumeIds.has(scene.volumeId), `${scene.id} volume resolves`);
  assert.ok(chapterIds.has(scene.chapterId), `${scene.id} chapter resolves`);
  assert.ok(entityIds.has(scene.viewpointEntityId), `${scene.id} viewpoint resolves`);
  assert.ok(entityIds.has(scene.locationEntityId), `${scene.id} location resolves`);
  if (scene.linkedStorySceneId) assert.ok(sceneIds.has(scene.linkedStorySceneId), `${scene.id} story scene resolves`);
}
for (const clue of data.manuscriptClues) {
  assert.ok(bookIds.has(clue.bookId), `${clue.id} book resolves`);
  assert.ok(chapterIds.has(clue.setupUnitId), `${clue.id} setup resolves`);
  assert.ok(chapterIds.has(clue.payoffUnitId), `${clue.id} payoff resolves`);
}
for (const state of data.manuscriptKnowledgeStates) {
  assert.ok(bookIds.has(state.bookId), `${state.id} book resolves`);
  assert.ok(entityIds.has(state.characterId), `${state.id} character resolves`);
  assert.ok(chapterIds.has(state.unitId), `${state.id} unit resolves`);
}

const serialized = JSON.stringify(data);
assert.equal(serialized.includes("�"), false, "case contains no replacement characters");
assert.equal(/灞辨捣|绌峰|鍦板浘/.test(serialized), false, "case contains no legacy mojibake markers");

console.log("Shan Hai Jing corpus checks passed: 18 chapters, 869 valid original passages with project-authored readings, 38,320 source characters, 1,914 entities, 20 generated maps, all references resolved.");
