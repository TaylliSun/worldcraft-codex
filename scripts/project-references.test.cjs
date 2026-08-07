const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

require.extensions[".ts"] = (module, filePath) => {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true
    }
  }).outputText;
  module._compile(output, filePath);
};

const references = require(path.join(__dirname, "..", "app", "project-references.ts"));
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

const manyRefs = Array.from({ length: 25 }, (_, index) => ({
  kind: index % 2 ? "entity" : "quest",
  id: `object-${index}`
}));
const normalizedMany = references.normalizeProjectObjectRefs([
  ...manyRefs,
  manyRefs[0],
  { kind: "unknown", id: "bad" },
  { kind: "entity", id: "" }
]);
check(normalizedMany.length, 25, "at least twenty cross-type references are retained");
check(new Set(normalizedMany.map(references.projectObjectRefKey)).size, 25, "duplicate refs are removed");
check(references.normalizeProjectObjectRef({ kind: "entity", id: " hero " }), { kind: "entity", id: "hero" }, "single refs normalize");
check(references.normalizeProjectObjectRef({ kind: "invalid", id: "hero" }), null, "unknown kinds are rejected");
check(
  references.toggleProjectObjectRef([{ kind: "entity", id: "hero" }], { kind: "entity", id: "hero" }),
  [],
  "toggle removes an existing ref"
);
check(
  references.toggleProjectObjectRef([], { kind: "scene", id: "scene-a" }),
  [{ kind: "scene", id: "scene-a" }],
  "toggle adds a missing ref"
);

function workspace() {
  return {
    worlds: [{ id: "world-a", name: "苍岚纪" }],
    entityTemplates: [{
      id: "template-character",
      worldId: "world-a",
      name: "人物模板",
      fields: [
        { key: "mentor", label: "导师", type: "entity_ref", secret: false },
        { key: "secretContact", label: "秘密联系人", type: "entity_ref", secret: true }
      ]
    }],
    entities: [
      {
        id: "entity-hero",
        worldId: "world-a",
        title: "艾琳",
        summary: "来自 [[雾鸦堡]] 的骑士。",
        content: "她在 [[黑塔]] 留下记号，又听说 [[失落之门]]。",
        templateId: "template-character",
        templateData: { mentor: "entity-mentor", secretContact: "entity-secret" }
      },
      { id: "entity-fogkeep", worldId: "world-a", title: "雾鸦堡", content: "" },
      { id: "entity-blacktower-a", worldId: "world-a", title: "黑塔", content: "" },
      { id: "entity-blacktower-b", worldId: "world-a", title: "黑塔", content: "" },
      { id: "entity-mentor", worldId: "world-a", title: "导师", content: "" },
      { id: "entity-secret", worldId: "world-a", title: "秘密联系人", content: "" }
    ],
    quests: [{
      id: "quest-main",
      worldId: "world-a",
      title: "寻找哥哥",
      summary: "在 [[雾鸦堡]] 接到消息。",
      trigger: "与 [[艾琳]] 交谈后触发。",
      relatedEntityIds: ["entity-hero", "entity-missing"],
      prerequisiteQuestIds: ["quest-prelude"],
      steps: [{ id: "step-1", objective: "回到 [[雾鸦堡]]", notes: "" }]
    }, { id: "quest-prelude", worldId: "world-a", title: "序章" }],
    storyVariables: [{ id: "variable-clue", worldId: "world-a", name: "发现线索" }],
    storyScenes: [{
      id: "scene-a",
      worldId: "world-a",
      title: "城门对白",
      relatedEntityIds: ["entity-hero"],
      relatedQuestIds: ["quest-main"],
      nodes: [{
        id: "node-a",
        label: "开场",
        speakerEntityId: "entity-hero",
        mediaAssetId: "asset-a",
        text: "看向 [[雾鸦堡]]。",
        conditions: [{ id: "condition-a", variableId: "variable-clue" }],
        effects: [],
        choices: []
      }]
    }],
    relations: [{
      id: "relation-a",
      worldId: "world-a",
      label: "师徒",
      sourceEntityId: "entity-hero",
      targetEntityId: "entity-mentor"
    }],
    maps: [{
      id: "map-a",
      worldId: "world-a",
      title: "世界地图",
      regions: [{
        id: "region-a",
        title: "北境边区",
        references: [{ kind: "entity", id: "entity-fogkeep" }]
      }]
    }],
    mapMarkers: [{
      id: "marker-a",
      mapId: "map-a",
      label: "雾鸦堡",
      entityId: "entity-fogkeep",
      references: [
        { kind: "entity", id: "entity-fogkeep" },
        { kind: "quest", id: "quest-main" },
        { kind: "scene", id: "scene-a" }
      ]
    }],
    mapRoutes: [{
      id: "route-a",
      worldId: "world-a",
      title: "北境路线",
      references: [
        { kind: "quest", id: "quest-main" },
        { kind: "scene", id: "scene-a" }
      ],
      stops: [{ id: "stop-a", markerId: "marker-a", title: "雾鸦堡" }]
    }],
    timelineTracks: [{ id: "track-a", worldId: "world-a", name: "主时间线" }],
    timelineEvents: [{
      id: "event-a",
      worldId: "world-a",
      title: "战争爆发",
      entityId: "entity-hero",
      questId: "quest-main",
      references: [
        { kind: "entity", id: "entity-hero" },
        { kind: "quest", id: "quest-main" },
        { kind: "scene", id: "scene-a" },
        { kind: "map-marker", id: "marker-a" }
      ],
      dependencyIds: ["event-missing"]
    }],
    assets: [{ id: "asset-a", worldId: "world-a", name: "角色立绘", linkedEntityIds: ["entity-hero"] }],
    narrativeMilestones: [{
      id: "milestone-a",
      worldId: "world-a",
      title: "序章完成",
      linkedQuestIds: ["quest-main"],
      linkedSceneIds: ["scene-a"],
      linkedEntityIds: ["entity-hero"],
      linkedTimelineEventIds: ["event-a"],
      linkedMapMarkerIds: ["marker-a"]
    }]
  };
}

const index = references.buildProjectReferenceIndex(workspace());
check(index.references.length > 20, true, "reference index spans all core modules");
check(
  index.references.some((item) => item.source.id === "entity-hero" && item.target.id === "entity-fogkeep" && item.anchor.start !== null),
  true,
  "wiki links retain exact character offsets"
);
check(
  index.references.filter((item) => item.source.id === "event-a" && item.target.id === "entity-hero").length,
  1,
  "unified timeline refs suppress duplicate legacy slots"
);
check(
  index.references.filter((item) => item.source.id === "marker-a" && item.target.id === "entity-fogkeep").length,
  1,
  "unified marker refs suppress duplicate legacy slots"
);
check(
  references.getProjectBackReferences(index, { kind: "entity", id: "entity-hero" }).some(
    (item) => item.source.kind === "timeline-event" && item.anchor.path === "references[0]"
  ),
  true,
  "backrefs retain the source object and exact field path"
);
check(
  index.references.some((item) => item.role === "speaker" && item.anchor.path === "nodes[0].speakerEntityId"),
  true,
  "scene speaker refs are indexed precisely"
);
check(
  index.references.some(
    (item) =>
      item.source.id === "scene-a" &&
      item.target.kind === "asset" &&
      item.target.id === "asset-a" &&
      item.anchor.path === "nodes[0].mediaAssetId"
  ),
  true,
  "storyboard media participates in asset back references"
);
check(
  index.references.some((item) => item.source.id === "quest-main" && item.anchor.path === "summary"),
  true,
  "quest summary mentions retain their exact field"
);
check(
  index.references.some((item) => item.source.id === "quest-main" && item.anchor.path === "trigger"),
  true,
  "quest trigger mentions retain their exact field"
);
check(
  index.references.some((item) => item.role === "template" && item.anchor.path === "templateData.mentor"),
  true,
  "non-secret template entity refs are indexed"
);
check(
  index.references.some((item) => item.anchor.path === "templateData.secretContact"),
  false,
  "secret template fields are excluded from the shared reference index"
);
check(
  index.problems.some((item) => item.code === "ambiguous-title" && item.targetLabel === "黑塔"),
  true,
  "duplicate-title mentions are reported as ambiguous"
);
check(
  index.problems.some((item) => item.code === "unresolved-title" && item.targetLabel === "失落之门"),
  true,
  "renamed or unknown title links are never silently ignored"
);
check(
  index.problems.some((item) => item.code === "broken-target" && item.target?.id === "entity-missing"),
  true,
  "deleted explicit targets are reported"
);
check(
  index.problems.some((item) => item.code === "broken-target" && item.target?.id === "event-missing"),
  true,
  "missing timeline dependencies are reported"
);
check(
  index.references.some((item) => item.source.kind === "map-route" && item.role === "route"),
  true,
  "map route stops participate in the same index"
);
check(
  index.references.some(
    (item) =>
      item.source.kind === "map-route" &&
      item.target.kind === "quest" &&
      item.target.id === "quest-main" &&
      item.anchor.path === "references[0]"
  ),
  true,
  "map route unified references retain their exact source path"
);
check(
  index.references.some(
    (item) =>
      item.source.kind === "map" &&
      item.target.id === "entity-fogkeep" &&
      item.anchor.path === "regions[0].references[0]"
  ),
  true,
  "map region associations retain their nested source path"
);

const stableWorkspace = workspace();
stableWorkspace.worlds.push({ id: "world-b", name: "Second world" });
stableWorkspace.entities.push(
  { id: "entity-renamed", worldId: "world-a", title: "New display name", content: "" },
  { id: "entity-duplicate", worldId: "world-a", title: "New display name", content: "" },
  { id: "entity-foreign", worldId: "world-b", title: "Foreign character", content: "" }
);
stableWorkspace.manuscriptBooks = [{
  id: "book-a",
  worldId: "world-a",
  title: "Book"
}];
stableWorkspace.manuscriptVolumes = [{
  id: "volume-a",
  worldId: "world-a",
  bookId: "book-a",
  title: "Volume"
}];
stableWorkspace.manuscriptChapters = [{
  id: "chapter-a",
  worldId: "world-a",
  bookId: "book-a",
  volumeId: "volume-a",
  title: "Chapter",
  body: [
    '<p><span data-project-reference-kind="entity" data-project-reference-id="entity-renamed" data-project-reference-world-id="world-a" data-project-reference-label="Old display name">Old display name</span></p>',
    '<p><span data-project-reference-kind="entity" data-project-reference-id="entity-foreign" data-project-reference-world-id="world-b" data-project-reference-label="Foreign character">Foreign character</span></p>',
    "<p>Legacy link remains [[New display name]].</p>"
  ].join("")
}];

const stableIndex = references.buildProjectReferenceIndex(stableWorkspace);
const renamedReference = stableIndex.references.find(
  (item) => item.source.id === "chapter-a" && item.target.id === "entity-renamed"
);
check(Boolean(renamedReference), true, "stable manuscript links resolve by id");
check(renamedReference?.targetLabel, "New display name", "renamed targets expose their current label");
check(renamedReference?.anchor.path, "body", "stable manuscript links retain their source field");
check(
  stableIndex.references.filter(
    (item) => item.source.id === "chapter-a" && item.target.id === "entity-renamed"
  ).length,
  1,
  "stable links are not parsed again as legacy links"
);
check(
  stableIndex.problems.some(
    (item) => item.code === "ambiguous-title" && item.targetLabel === "New display name"
  ),
  true,
  "legacy links remain ambiguity-safe when titles collide"
);
check(
  stableIndex.problems.some(
    (item) =>
      item.code === "cross-world-target" &&
      item.source.id === "chapter-a" &&
      item.target?.id === "entity-foreign"
  ),
  true,
  "cross-world stable links remain visible and are diagnosed"
);
check(
  stableIndex.problems.some(
    (item) => item.code === "broken-target" && item.source.id === "chapter-a"
  ),
  false,
  "valid manuscript parent and stable references do not produce broken targets"
);

console.log(`Project reference checks passed: ${assertions} assertions across 9 scenarios.`);
