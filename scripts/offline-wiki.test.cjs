const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

require.extensions[".ts"] = (module, filePath) => {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  module._compile(output, filePath);
};

const { buildOfflineWikiPublication } = require(path.join(__dirname, "..", "app", "offline-wiki.ts"));

let assertions = 0;
function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

const input = {
  audience: "public",
  exportedAt: "2026-07-18T00:00:00.000Z",
  world: {
    id: "world-1",
    name: "苍岚纪",
    description: "一座被风雪围困的大陆。",
    visibility: "public",
    wiki: {
      coverAssetId: "asset-cover",
      featuredEntityIds: ["hero", "mentor"],
      navigationCategoryIds: ["people"],
      defaultMapId: "map-public",
      publishedMapIds: ["map-public"],
      publishedTimelineTrackIds: ["track-public"],
      publishedQuestIds: ["quest-public"]
    }
  },
  categories: [{ id: "people", parentId: "", title: "人物", description: "公开人物目录", order: 0 }],
  entities: [
    {
      id: "hero", type: "character", title: "艾琳", slug: "ailin", summary: "银盔骑士",
      content: '<p>她正在追查[[隐秘导师]]。</p><section data-secret-block="true"><p>作者密令</p></section>',
      tags: ["骑士"], visibility: "public", categoryId: "people", templateId: "character-template",
      templateData: { role: "守门人", secret: "王室血脉" }, updatedAt: "2026-07-18T00:00:00.000Z"
    },
    {
      id: "mentor", type: "character", title: "隐秘导师", slug: "mentor", summary: "不可公开",
      content: "<p>秘密身份</p>", tags: [], visibility: "secret", categoryId: "people", templateId: "character-template",
      templateData: { role: "导师", secret: "幕后主使" }, updatedAt: "2026-07-18T00:00:00.000Z"
    }
  ],
  templates: [{
    id: "character-template",
    fields: [
      { key: "role", label: "身份", secret: false },
      { key: "secret", label: "秘密", secret: true }
    ]
  }],
  quests: [
    { id: "quest-public", title: "追查来信", category: "main", status: "active", summary: "公开任务", trigger: "收到来信", relatedEntityIds: ["hero", "mentor"], steps: [{ id: "step-1", title: "检查城门", objective: "寻找脚印", condition: "", branch: "", failure: "", reward: "" }], updatedAt: "2026-07-18T00:00:00.000Z" },
    { id: "quest-draft", title: "幕后密谋", category: "side", status: "draft", summary: "未发布", trigger: "", relatedEntityIds: ["mentor"], steps: [], updatedAt: "2026-07-18T00:00:00.000Z" }
  ],
  maps: [
    { id: "map-public", parentMapId: "", title: "雾鸦堡", description: "公开地图", imageUrl: "worldcraft-asset://map.png", regions: [{ id: "region-1", title: "外城", description: "", color: "#176b5b", opacity: 0.2, visible: true, points: [{ x: 10, y: 10 }, { x: 40, y: 10 }, { x: 30, y: 40 }] }] },
    { id: "map-draft", parentMapId: "", title: "密道", description: "未发布", imageUrl: "worldcraft-asset://secret-map.png", regions: [] }
  ],
  markers: [
    { id: "marker-public", mapId: "map-public", label: "北门", description: "城堡入口", x: 20, y: 30, entityId: "hero", questId: "quest-public" },
    { id: "marker-secret", mapId: "map-public", label: "导师密室", description: "不可公开", x: 60, y: 70, entityId: "mentor", questId: "" }
  ],
  timelineTracks: [
    { id: "track-public", name: "王国纪年", description: "公开历史" },
    { id: "track-draft", name: "幕后纪年", description: "未发布" }
  ],
  timelineEvents: [
    { id: "event-public", trackId: "track-public", title: "北门陷落", summary: "守军退入内城", displayDate: "霜月十二日", entityId: "hero", questId: "quest-public", sortOrder: 1 },
    { id: "event-secret", trackId: "track-public", title: "导师现身", summary: "不可公开", displayDate: "同日", entityId: "mentor", questId: "", sortOrder: 2 }
  ],
  relations: [
    { id: "relation-public", sourceEntityId: "hero", targetEntityId: "hero", label: "自我誓约", kind: "custom", strength: 3 },
    { id: "relation-secret", sourceEntityId: "hero", targetEntityId: "mentor", label: "师徒", kind: "mentor", strength: 5 }
  ],
  assets: [
    { id: "asset-cover", name: "封面", mimeType: "image/png", storedName: "cover.png", linkedEntityIds: [] },
    { id: "asset-hero", name: "艾琳立绘", mimeType: "image/png", storedName: "hero.png", linkedEntityIds: ["hero"] },
    { id: "asset-mentor", name: "导师立绘", mimeType: "image/png", storedName: "mentor.png", linkedEntityIds: ["mentor"] },
    { id: "asset-map", name: "地图", mimeType: "image/png", storedName: "map.png", linkedEntityIds: [] }
  ]
};

const publication = buildOfflineWikiPublication(input);
check(publication.entities.map((item) => item.id), ["hero"], "public export contains only public entities");
check(publication.entities[0].fields, [{ label: "身份", value: "守门人" }], "secret template fields are removed");
check(publication.entities[0].content.includes("作者密令"), false, "secret rich-text blocks are removed");
check(publication.entities[0].content.includes("隐秘导师"), false, "restricted reference labels are removed");
check(publication.entities[0].content.includes("受限内容"), true, "restricted references leave a neutral redaction marker");
check(publication.quests.map((item) => item.id), ["quest-public"], "only published quests are exported");
check(publication.quests[0].relatedEntityIds, ["hero"], "quest references are filtered to visible entities");
check(publication.maps.map((item) => item.id), ["map-public"], "only published maps are exported");
check(publication.maps[0].markers.map((item) => item.id), ["marker-public"], "markers linked to restricted content are removed");
check(publication.timelines.map((item) => item.id), ["track-public"], "only published timelines are exported");
check(publication.timelines[0].events.map((item) => item.id), ["event-public"], "restricted timeline events are removed");
check(publication.relations.map((item) => item.id), ["relation-public"], "relations cannot reveal restricted endpoints");
check(publication.assets.map((item) => item.id).sort(), ["asset-cover", "asset-hero", "asset-map"], "only visible and required images are included");
check(publication.world.featuredEntityIds, ["hero"], "featured entries are filtered to visible content");
assert.throws(() => buildOfflineWikiPublication({ ...input, audience: "public", world: { ...input.world, visibility: "private" } }), /无权导出/);
assertions += 1;

console.log(`Offline Wiki model checks passed: ${assertions} assertions across audience filtering, references, resources, and assets.`);
