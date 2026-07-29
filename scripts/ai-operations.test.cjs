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

const operations = require(path.join(__dirname, "..", "app", "ai-operations.ts"));
const codexTree = require(path.join(__dirname, "..", "app", "codex-tree.ts"));
const entityTemplates = require(path.join(__dirname, "..", "app", "entity-templates.ts"));
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

function baseWorkspace() {
  const defaultTemplates = entityTemplates.createDefaultEntityTemplates(
    "world-a",
    "2026-07-13T00:00:00.000Z"
  );
  const secretTemplate = entityTemplates.normalizeEntityTemplate({
    id: "template-secret-location",
    name: "秘密地点模板",
    entityTypes: ["location"],
    fields: [{
      id: "field-secret",
      key: "secret",
      label: "秘密",
      type: "textarea",
      required: false,
      secret: true,
      defaultValue: "",
      options: [],
      targetEntityTypes: [],
      order: 0
    }],
    builtIn: false,
    createdAt: "2026-07-13T00:00:00.000Z",
    updatedAt: "2026-07-13T00:00:00.000Z"
  }, "world-a", defaultTemplates.length);
  return {
    worlds: [{
      id: "world-a",
      ownerId: "user-owner",
      name: "苍岚纪",
      description: "雾鸦堡与黑塔的奇幻世界",
      visibility: "private",
      createdAt: "2026-07-13T00:00:00.000Z",
      updatedAt: "2026-07-13T00:00:00.000Z"
    }],
    codexCategories: codexTree.createDefaultCodexCategories(
      "world-a",
      "2026-07-13T00:00:00.000Z"
    ),
    entityTemplates: [...defaultTemplates, secretTemplate],
    entities: [{
      id: "entity-castle",
      worldId: "world-a",
      type: "location",
      title: "雾鸦堡",
      slug: "mist-castle",
      summary: "边境古堡",
      content: "不应进入项目操作上下文的超长正文",
      tags: ["地点"],
      visibility: "private",
      createdBy: "owner",
      updatedAt: "2026-07-13T00:00:00.000Z",
      categoryId: codexTree.getDefaultCodexCategoryId("world-a", "location"),
      order: 0,
      templateId: secretTemplate.id,
      templateData: { secret: "隐藏模板内容" }
    }],
    quests: [],
    storyVariables: [],
    storyScenes: [],
    storyTestPresets: [],
    storyTestRuns: [],
    relations: [],
    maps: [{
      id: "map-existing",
      worldId: "world-a",
      title: "苍岚全境图",
      description: "既有地图",
      imageUrl: "asset://private-map-image.png",
      width: 1600,
      height: 1000,
      distanceWidth: 900,
      distanceUnit: "km",
      customDistanceUnit: "距离单位",
      grid: { visible: false, snap: false, labels: true, columns: 12, color: "#596660", opacity: 0.24 },
      regions: [],
      createdAt: "2026-07-13T00:00:00.000Z",
      updatedAt: "2026-07-13T00:00:00.000Z"
    }],
    mapLayers: [{
      id: "map-layer-default:map-existing",
      worldId: "world-a",
      mapId: "map-existing",
      title: "主要标记",
      description: "",
      color: "#177a61",
      order: 0,
      visible: true,
      locked: false,
      createdAt: "2026-07-13T00:00:00.000Z",
      updatedAt: "2026-07-13T00:00:00.000Z"
    }],
    mapMarkerGroups: [],
    mapMarkers: [],
    mapRoutes: [],
    narrativeMilestones: [],
    storyReviewIssues: [{
      id: "review-existing",
      worldId: "world-a",
      title: "既有审阅问题",
      detail: "用于里程碑关联验证",
      severity: "minor",
      status: "open",
      source: "manual",
      sourceFindingKind: "",
      presetId: "",
      runId: "",
      sceneId: "",
      nodeId: "",
      entityId: "entity-castle",
      questId: "",
      consistencyFindingId: "",
      consistencyRuleId: "",
      createdAt: "2026-07-13T00:00:00.000Z",
      updatedAt: "2026-07-13T00:00:00.000Z",
      resolvedAt: ""
    }],
    assets: [{
      id: "asset-existing",
      worldId: "world-a",
      name: "雾鸦堡概念图",
      kind: "concept",
      storedName: "private-concept.png",
      originalName: "mist-castle.png",
      mimeType: "image/png",
      size: 2048,
      tags: [],
      notes: "",
      linkedEntityIds: [],
      createdAt: "2026-07-13T00:00:00.000Z",
      updatedAt: "2026-07-13T00:00:00.000Z"
    }],
    members: [{
      id: "member-owner",
      worldId: "world-a",
      name: "主创作者",
      email: "creator@worldcraft.local",
      role: "owner"
    }],
    timelineTracks: [{
      id: "track-main",
      worldId: "world-a",
      name: "主时间线",
      description: "",
      color: "#0f766e",
      order: 0,
      updatedAt: "2026-07-13T00:00:00.000Z"
    }],
    timelineEvents: [],
    aiOperationRuns: []
  };
}

const rawPlan = JSON.stringify({
  summary: "创建艾琳调查哥哥下落的完整支线",
  operations: [
    {
      id: "create-hero",
      action: "create",
      target: "entity",
      ref: "hero",
      data: { type: "character", title: "艾琳", summary: "寻找失踪哥哥的调查者", tags: ["主角"] }
    },
    {
      id: "create-quest",
      action: "create",
      target: "quest",
      ref: "quest",
      data: {
        title: "黑塔的划痕",
        category: "character",
        status: "active",
        summary: "艾琳在雾鸦堡调查黑塔徽记",
        relatedEntityIds: ["@hero", "entity-castle"],
        steps: [{ id: "step-clue", title: "检查徽记", objective: "找到哥哥留下的划痕" }]
      }
    },
    {
      id: "create-variable",
      action: "create",
      target: "story-variable",
      ref: "clue",
      data: { key: "story.found_black_tower_mark", name: "发现黑塔划痕", type: "boolean", defaultValue: false }
    },
    {
      id: "create-scene",
      action: "create",
      target: "story-scene",
      ref: "scene",
      data: {
        title: "雾鸦堡调查",
        summary: "艾琳检查徽记",
        status: "draft",
        entryNodeId: "node-entry",
        relatedEntityIds: ["@hero", "entity-castle"],
        relatedQuestIds: ["@quest"],
        nodes: [
          { id: "node-entry", label: "检查徽记", speakerEntityId: "@hero", text: "这道划痕是哥哥留下的。", nextNodeId: "node-end", choices: [], conditions: [], effects: [], isEnding: false },
          { id: "node-end", label: "保留悬念", speakerEntityId: "@hero", text: "但他是否还在黑塔？", nextNodeId: "", choices: [], conditions: [], effects: [], isEnding: true }
        ]
      }
    },
    {
      id: "create-relation",
      action: "create",
      target: "relation",
      ref: "hero-location",
      data: { sourceEntityId: "@hero", targetEntityId: "entity-castle", kind: "located", label: "在此调查", direction: "undirected", strength: 70 }
    },
    {
      id: "create-track",
      action: "create",
      target: "timeline-track",
      ref: "chapter-two",
      data: { name: "第二章", description: "哥哥失踪调查", color: "#2563a8", order: 1 }
    },
    {
      id: "create-event",
      action: "create",
      target: "timeline-event",
      ref: "investigation-event",
      data: {
        trackId: "@chapter-two",
        entityId: "@hero",
        questId: "@quest",
        sceneId: "@scene",
        references: [
          { kind: "entity", id: "@hero" },
          { kind: "quest", id: "@quest" },
          { kind: "scene", id: "@scene" },
          { kind: "timeline-track", id: "@chapter-two" }
        ],
        title: "艾琳发现黑塔划痕",
        displayDate: "第二章第 1 日",
        datePrecision: "exact",
        sortOrder: 200
      }
    },
    {
      id: "create-map",
      action: "create",
      target: "map",
      ref: "investigation-map",
      data: {
        title: "黑塔调查图",
        description: "艾琳调查黑塔线索的局部地图",
        width: 1200,
        height: 800,
        distanceWidth: 180,
        distanceUnit: "km",
        grid: { visible: true, snap: true, labels: true, columns: 10, color: "#177a61", opacity: 0.2 }
      }
    },
    {
      id: "create-map-layer",
      action: "create",
      target: "map-layer",
      ref: "clue-layer",
      data: { mapId: "@investigation-map", title: "调查线索", color: "#2563a8", order: 1 }
    },
    {
      id: "create-marker-group",
      action: "create",
      target: "map-marker-group",
      ref: "investigation-group",
      data: { mapId: "@investigation-map", title: "艾琳支线", color: "#7c5bb4" }
    },
    {
      id: "create-castle-marker",
      action: "create",
      target: "map-marker",
      ref: "castle-marker",
      data: {
        mapId: "@investigation-map",
        layerId: "@clue-layer",
        groupId: "@investigation-group",
        entityId: "entity-castle",
        references: [{ kind: "entity", id: "entity-castle" }],
        x: 22,
        y: 68,
        label: "雾鸦堡",
        markerType: "location"
      }
    },
    {
      id: "create-clue-marker",
      action: "create",
      target: "map-marker",
      ref: "clue-marker",
      data: {
        mapId: "@investigation-map",
        layerId: "@clue-layer",
        groupId: "@investigation-group",
        entityId: "@hero",
        questId: "@quest",
        sceneId: "@scene",
        references: [
          { kind: "entity", id: "@hero" },
          { kind: "quest", id: "@quest" },
          { kind: "scene", id: "@scene" },
          { kind: "timeline-event", id: "@investigation-event" }
        ],
        x: 73,
        y: 31,
        label: "黑塔划痕",
        markerType: "quest"
      }
    },
    {
      id: "create-map-route",
      action: "create",
      target: "map-route",
      ref: "investigation-route",
      data: {
        mapId: "@investigation-map",
        title: "雾鸦堡至黑塔",
        status: "active",
        travelMode: "ride",
        travelSpeed: 12,
        travelHoursPerDay: 8,
        stops: [
          { markerId: "@castle-marker", title: "从雾鸦堡出发" },
          { markerId: "@clue-marker", title: "抵达黑塔划痕" }
        ]
      }
    },
    {
      id: "add-investigation-region",
      action: "update",
      target: "map",
      targetId: "@investigation-map",
      data: {
        regions: [{
          id: "region-black-tower",
          title: "黑塔警戒区",
          description: "调查任务的高风险范围",
          kind: "danger",
          color: "#c45f4b",
          opacity: 0.24,
          order: 0,
          visible: true,
          locked: false,
          points: [{ x: 58, y: 18 }, { x: 88, y: 22 }, { x: 82, y: 48 }, { x: 54, y: 44 }],
          references: [
            { kind: "entity", id: "@hero" },
            { kind: "quest", id: "@quest" },
            { kind: "map-marker", id: "@clue-marker" }
          ]
        }]
      }
    },
    {
      id: "create-milestone",
      action: "create",
      target: "narrative-milestone",
      ref: "investigation-milestone",
      data: {
        title: "第二章：黑塔划痕",
        summary: "艾琳沿地图路线抵达黑塔并确认哥哥留下的记号",
        act: "第二幕",
        status: "drafting",
        priority: "critical",
        manuscriptBody: "<p>艾琳在风雪中辨认出哥哥留下的划痕。</p>",
        developerNotes: "不应进入项目操作上下文的制作秘密",
        linkedQuestIds: ["@quest"],
        linkedSceneIds: ["@scene"],
        linkedEntityIds: ["@hero", "entity-castle"],
        linkedTimelineEventIds: ["@investigation-event"],
        linkedMapMarkerIds: ["@clue-marker"],
        linkedReviewIssueIds: ["review-existing"]
      }
    }
  ]
});

const parsed = operations.parseAiOperationPlan(`\n\`\`\`json\n${rawPlan}\n\`\`\``);
check(parsed.ok, true, "fenced operation plan parses");
check(parsed.plan.operations.length, 15, "all operation types are retained");
check(parsed.plan.summary.includes("完整支线"), true, "plan summary is retained");
check(operations.parseAiOperationPlan("not json").ok, false, "invalid JSON is rejected");
check(operations.parseAiOperationPlan('{"operations":[]}').ok, false, "empty operation plan is rejected");
check(
  operations.parseAiOperationPlan('{"operations":[{"action":"launch","target":"entity"}]}').ok,
  false,
  "unknown actions are rejected"
);

const before = baseWorkspace();
const applied = operations.applyAiOperationPlan(before, parsed.plan, {
  worldId: "world-a",
  instruction: "创建艾琳支线",
  model: "smart-model",
  now: "2026-07-13T01:00:00.000Z"
});
check(applied.ok, true, "cross-module plan applies atomically");
check(before.entities.length, 1, "transaction does not mutate its input");
check(applied.data.entities.length, 2, "entity is created");
check(applied.data.quests.length, 1, "quest is created");
check(applied.data.storyVariables.length, 1, "story variable is created");
check(applied.data.storyScenes.length, 1, "story scene is created");
check(applied.data.relations.length, 1, "relation is created");
check(applied.data.relations[0].strength, 5, "relation strength is clamped to the app's 1-5 range");
check(applied.data.relations[0].evidenceType, "unspecified", "relation evidence defaults are normalized before persistence");
check(applied.data.relations[0].sourceCitation, "", "relation source citation defaults before persistence");
check(applied.data.relations[0].historicalScope, "", "relation historical scope defaults before persistence");
check(applied.data.relations[0].confidence, "unspecified", "relation confidence defaults are normalized before persistence");
check(applied.data.maps.length, 2, "map is created");
check(applied.data.mapLayers.length, 3, "custom and automatic default map layers are created");
check(
  applied.data.mapLayers.some((item) => item.id === `map-layer-default:${applied.refs["investigation-map"]}`),
  true,
  "AI-created map receives its deterministic default layer"
);
check(applied.data.mapMarkerGroups.length, 1, "map marker group is created");
check(applied.data.mapMarkers.length, 2, "map markers are created");
check(applied.data.mapRoutes.length, 1, "map route is created");
check(applied.data.mapRoutes[0].stops.map((item) => item.markerId), [applied.refs["castle-marker"], applied.refs["clue-marker"]], "route stop references resolve within the batch");
check(applied.data.maps.find((item) => item.id === applied.refs["investigation-map"]).regions.length, 1, "map region update is consolidated into the created map");
check(applied.data.maps.find((item) => item.id === applied.refs["investigation-map"]).regions[0].references[2], { kind: "map-marker", id: applied.refs["clue-marker"] }, "region references resolve to a batch-created marker");
check(applied.data.narrativeMilestones.length, 1, "narrative milestone is created");
check(applied.data.narrativeMilestones[0].linkedMapMarkerIds, [applied.refs["clue-marker"]], "milestone links to the batch-created map marker");
check(applied.data.timelineTracks.length, 2, "timeline track is created");
check(applied.data.timelineEvents.length, 1, "timeline event is created");
check(applied.run.changes.length, 15, "audit run records explicit and automatic changed objects");
check(applied.run.status, "applied", "new audit run is applied");
check(applied.data.aiOperationRuns.length, 1, "audit run enters project data");
check(
  applied.run.changes.find((change) => change.target === "relation").after,
  applied.data.relations[0],
  "relation audit snapshot records the fully normalized persisted object"
);
check(
  applied.data.entities.find((item) => item.id === applied.refs.hero).categoryId,
  codexTree.getDefaultCodexCategoryId("world-a", "character"),
  "AI-created entity enters its stable default category"
);
const normalizedAppliedHierarchy = codexTree.normalizeCodexHierarchy(
  applied.data.codexCategories,
  applied.data.entities,
  ["world-a"],
  "2026-07-13T01:30:00.000Z"
);
const normalizedApplied = {
  ...applied.data,
  codexCategories: normalizedAppliedHierarchy.categories,
  entities: normalizedAppliedHierarchy.entities
};
check(
  operations.undoAiOperationRun(normalizedApplied, applied.run.id).ok,
  true,
  "hierarchy normalization does not invalidate AI undo"
);
check(applied.data.quests[0].relatedEntityIds.includes(applied.refs.hero), true, "create refs resolve in quest relations");
check(applied.data.storyScenes[0].relatedQuestIds[0], applied.refs.quest, "create refs resolve in story scene");
check(applied.data.timelineEvents[0].trackId, applied.refs["chapter-two"], "create refs resolve in timeline event");
check(applied.data.timelineEvents[0].references.length, 4, "AI timeline event keeps multi-object references");
check(applied.data.timelineEvents[0].datePrecision, "exact", "AI timeline event keeps date precision");
check(applied.data.relations[0].sourceEntityId, applied.refs.hero, "create refs resolve in entity relation");
check(applied.data.mapMarkers.find((item) => item.id === applied.refs["clue-marker"]).references.length, 4, "AI map marker keeps unified project references");

const directionPlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "调整关系方向",
  operations: [
    {
      id: "direct-relation",
      action: "update",
      target: "relation",
      targetId: applied.refs["hero-location"],
      data: {
        direction: "directed",
        evidenceType: "primary-text",
        sourceCitation: "《雾鸦堡纪事》卷一",
        historicalScope: "苍岚历 117 年",
        confidence: "probable"
      }
    }
  ]
}));
check(directionPlan.ok, true, "relation direction update parses");
const directed = operations.applyAiOperationPlan(applied.data, directionPlan.plan, {
  worldId: "world-a",
  instruction: "调整关系方向",
  model: "smart-model",
  now: "2026-07-13T01:30:00.000Z"
});
check(directed.ok, true, "relation direction update applies");
check(directed.data.relations[0].direction, "directed", "relation direction can be changed back to directed");
check(directed.data.relations[0].evidenceType, "primary-text", "relation evidence type can be updated");
check(directed.data.relations[0].sourceCitation, "《雾鸦堡纪事》卷一", "relation source citation can be updated");
check(directed.data.relations[0].historicalScope, "苍岚历 117 年", "relation historical scope can be updated");
check(directed.data.relations[0].confidence, "probable", "relation confidence can be updated");
const revertedDirection = operations.undoAiOperationRun(directed.data, directed.run.id, "2026-07-13T01:45:00.000Z");
check(revertedDirection.ok, true, "relation direction update can be undone");
check(revertedDirection.data.relations[0].direction, "undirected", "direction undo restores the original value");
check(revertedDirection.data.relations[0].evidenceType, "unspecified", "relation evidence undo restores the normalized default");

const updateDeletePlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "更新艾琳并移除位置关系",
  operations: [
    { id: "update-hero", action: "update", target: "entity", targetId: applied.refs.hero, data: { summary: "已经找到哥哥留下的第一条线索" } },
    { id: "delete-relation", action: "delete", target: "relation", targetId: applied.refs["hero-location"], data: {} }
  ]
}));
check(updateDeletePlan.ok, true, "update/delete plan parses");
const updated = operations.applyAiOperationPlan(revertedDirection.data, updateDeletePlan.plan, {
  worldId: "world-a",
  instruction: "推进调查状态",
  model: "smart-model",
  now: "2026-07-13T02:00:00.000Z"
});
check(updated.ok, true, "update and delete apply in one transaction");
check(updated.data.entities.find((item) => item.id === applied.refs.hero).summary.includes("第一条线索"), true, "entity update applies");
check(updated.data.relations.length, 0, "relation delete applies");

const undoneSecond = operations.undoAiOperationRun(updated.data, updated.run.id, "2026-07-13T03:00:00.000Z");
check(undoneSecond.ok, true, "latest operation can be undone");
check(undoneSecond.data.relations.length, 1, "undo restores deleted relation");
check(undoneSecond.data.relations[0].direction, "undirected", "undo restores the original relation direction");
check(undoneSecond.data.entities.find((item) => item.id === applied.refs.hero).summary, "寻找失踪哥哥的调查者", "undo restores updated entity");
check(undoneSecond.run.status, "undone", "undo is recorded in audit status");
const undoneFirst = operations.undoAiOperationRun(undoneSecond.data, applied.run.id, "2026-07-13T04:00:00.000Z");
check(undoneFirst.ok, true, "earlier transaction can be undone after later transaction is reversed");
check(undoneFirst.data.entities.length, 1, "undo removes AI-created entity");
check(undoneFirst.data.quests.length, 0, "undo removes AI-created quest");
check(undoneFirst.data.timelineEvents.length, 0, "undo removes AI-created timeline event");
check(undoneFirst.data.maps.length, 1, "undo removes the AI-created map");
check(undoneFirst.data.mapLayers.length, 1, "undo removes explicit and automatic map layers");
check(undoneFirst.data.mapMarkers.length, 0, "undo removes AI-created map markers");
check(undoneFirst.data.mapRoutes.length, 0, "undo removes the AI-created route");
check(undoneFirst.data.narrativeMilestones.length, 0, "undo removes the AI-created narrative milestone");

const manuallyChanged = structuredClone(applied.data);
manuallyChanged.entities.find((item) => item.id === applied.refs.hero).summary = "作者后来手动修改";
const blockedUndo = operations.undoAiOperationRun(manuallyChanged, applied.run.id);
check(blockedUndo.ok, false, "undo is blocked after a later manual edit");
check(blockedUndo.error.includes("已阻止覆盖式撤销"), true, "blocked undo explains why data was protected");

const manuallyChangedMap = structuredClone(applied.data);
manuallyChangedMap.maps.find((item) => item.id === applied.refs["investigation-map"]).title = "作者后来重命名";
const blockedMapUndo = operations.undoAiOperationRun(manuallyChangedMap, applied.run.id);
check(blockedMapUndo.ok, false, "undo is blocked after a later manual map edit");
check(blockedMapUndo.error.includes("已阻止覆盖式撤销"), true, "blocked map undo protects the author's later change");

const danglingDeletePlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "错误删除",
  operations: [{ id: "delete-hero", action: "delete", target: "entity", targetId: applied.refs.hero, data: {} }]
}));
const danglingDelete = operations.applyAiOperationPlan(applied.data, danglingDeletePlan.plan, {
  worldId: "world-a",
  instruction: "删除艾琳",
  model: "smart-model"
});
check(danglingDelete.ok, false, "delete with dangling cross-module references is rejected");
check(applied.data.entities.length, 2, "failed transaction leaves source data untouched");

const unknownRefPlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "错误引用",
  operations: [{ id: "bad-relation", action: "create", target: "relation", ref: "bad", data: { sourceEntityId: "@missing", targetEntityId: "entity-castle" } }]
}));
const unknownRef = operations.applyAiOperationPlan(baseWorkspace(), unknownRefPlan.plan, {
  worldId: "world-a",
  instruction: "建立关系",
  model: "smart-model"
});
check(unknownRef.ok, false, "unknown create refs reject the full transaction");
check(unknownRef.error.includes("@missing"), true, "unknown ref error names the bad reference");

const orphanMarkerPlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "错误地图标记",
  operations: [{ id: "orphan-marker", action: "create", target: "map-marker", ref: "orphan", data: { mapId: "missing-map", label: "孤立标记", x: 20, y: 30 } }]
}));
const orphanMarker = operations.applyAiOperationPlan(baseWorkspace(), orphanMarkerPlan.plan, {
  worldId: "world-a",
  instruction: "创建孤立标记",
  model: "smart-model"
});
check(orphanMarker.ok, false, "marker with a missing map rejects the full transaction");
check(orphanMarker.error.includes("不存在的地图"), true, "orphan marker error identifies the map integrity failure");

const crossWorldWorkspace = baseWorkspace();
crossWorldWorkspace.worlds.push({ id: "world-b", name: "另一世界", description: "隔离测试" });
crossWorldWorkspace.maps.push({
  ...crossWorldWorkspace.maps[0],
  id: "map-other-world",
  worldId: "world-b",
  title: "另一世界地图",
  imageUrl: ""
});
const crossWorldMarkerPlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "错误跨世界标记",
  operations: [{ id: "cross-world-marker", action: "create", target: "map-marker", ref: "cross-world", data: { mapId: "map-other-world", label: "越界标记", x: 50, y: 50 } }]
}));
const crossWorldMarker = operations.applyAiOperationPlan(crossWorldWorkspace, crossWorldMarkerPlan.plan, {
  worldId: "world-a",
  instruction: "在另一世界创建标记",
  model: "smart-model"
});
check(crossWorldMarker.ok, false, "map-bound operations cannot cross world boundaries");
check(crossWorldMarker.error.includes("不能关联其他世界"), true, "cross-world map rejection explains the ownership boundary");

const invalidRegionPlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "错误区域引用",
  operations: [{
    id: "invalid-region",
    action: "update",
    target: "map",
    targetId: "map-existing",
    data: { regions: [{ id: "bad-region", title: "失效区域", kind: "danger", points: [{ x: 10, y: 10 }, { x: 30, y: 10 }, { x: 20, y: 30 }], references: [{ kind: "entity", id: "missing-entity" }] }] }
  }]
}));
const invalidRegion = operations.applyAiOperationPlan(baseWorkspace(), invalidRegionPlan.plan, {
  worldId: "world-a",
  instruction: "建立错误区域",
  model: "smart-model"
});
check(invalidRegion.ok, false, "region with a broken project reference is rejected");
check(invalidRegion.error.includes("失效引用"), true, "region validation reports its broken reference");

const milestoneCyclePlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "错误里程碑依赖",
  operations: [
    { id: "milestone-a", action: "create", target: "narrative-milestone", ref: "milestone-a", data: { title: "里程碑 A", dependencyIds: ["@milestone-b"] } },
    { id: "milestone-b", action: "create", target: "narrative-milestone", ref: "milestone-b", data: { title: "里程碑 B", dependencyIds: ["@milestone-a"] } }
  ]
}));
const milestoneCycle = operations.applyAiOperationPlan(baseWorkspace(), milestoneCyclePlan.plan, {
  worldId: "world-a",
  instruction: "建立循环里程碑",
  model: "smart-model"
});
check(milestoneCycle.ok, false, "cyclic milestone dependencies reject the full transaction");
check(milestoneCycle.error.includes("依赖循环"), true, "milestone cycle validation explains the failure");

const danglingMarkerDeletePlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "错误删除地图标记",
  operations: [{ id: "delete-route-stop", action: "delete", target: "map-marker", targetId: applied.refs["castle-marker"], data: {} }]
}));
const danglingMarkerDelete = operations.applyAiOperationPlan(applied.data, danglingMarkerDeletePlan.plan, {
  worldId: "world-a",
  instruction: "删除路线停靠点",
  model: "smart-model"
});
check(danglingMarkerDelete.ok, false, "deleting a route stop without cleaning its route is rejected");
check(danglingMarkerDelete.error.includes("失效停靠点"), true, "route integrity explains the rejected marker deletion");

const mapImageBoundaryPlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "更新地图但不接触本地图片",
  operations: [{ id: "safe-map-update", action: "update", target: "map", targetId: "map-existing", data: { title: "安全更新地图", imageUrl: "file:///should-not-be-written.png" } }]
}));
const mapImageBoundary = operations.applyAiOperationPlan(baseWorkspace(), mapImageBoundaryPlan.plan, {
  worldId: "world-a",
  instruction: "更新地图标题",
  model: "smart-model"
});
check(mapImageBoundary.ok, true, "ordinary map metadata update applies");
check(mapImageBoundary.data.maps[0].title, "安全更新地图", "allowed map metadata is updated");
check(mapImageBoundary.data.maps[0].imageUrl, "asset://private-map-image.png", "AI cannot overwrite a local map image path");

const multiStepPlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "同一批次连续完善条目",
  operations: [
    { id: "create-note", action: "create", target: "entity", ref: "draft-note", data: { type: "note", title: "调查笔记" } },
    { id: "update-note", action: "update", target: "entity", targetId: "@draft-note", data: { summary: "已经在同一事务中完善" } }
  ]
}));
const multiStep = operations.applyAiOperationPlan(baseWorkspace(), multiStepPlan.plan, {
  worldId: "world-a",
  instruction: "建立并完善调查笔记",
  model: "smart-model"
});
check(multiStep.ok, true, "multiple operations can target one object in a transaction");
check(multiStep.data.entities.find((item) => item.id === multiStep.refs["draft-note"]).summary, "已经在同一事务中完善", "later operations see the batch's created object");
check(multiStep.run.changes.length, 1, "same-object steps consolidate into one before-to-after audit change");
const multiStepUndo = operations.undoAiOperationRun(multiStep.data, multiStep.run.id);
check(multiStepUndo.ok, true, "consolidated same-object transaction can be undone");
check(multiStepUndo.data.entities.some((item) => item.title === "调查笔记"), false, "consolidated undo restores the pre-transaction state");

const projectAdminPlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "完善项目结构、测试与协作设置",
  operations: [
    { id: "update-world", action: "update", target: "world", targetId: "world-a", data: { description: "由 AI 补全的世界项目说明", visibility: "shared", ownerId: "should-not-change" } },
    { id: "create-category", action: "create", target: "codex-category", ref: "investigation-category", data: { parentId: "category:world-a:note", title: "调查档案", description: "集中管理调查线索", icon: "notes", color: "#2563a8", order: 2 } },
    { id: "create-template", action: "create", target: "entity-template", ref: "investigation-template", data: { name: "调查地点模板", description: "记录线索负责人", entityTypes: ["location"], fields: [{ id: "field-clue-owner", key: "clue_owner", label: "线索负责人", type: "text", required: true, secret: false, defaultValue: "", options: [], targetEntityTypes: [], order: 0 }] } },
    { id: "organize-entity", action: "update", target: "entity", targetId: "entity-castle", data: { categoryId: "@investigation-category", templateId: "@investigation-template", templateData: { clue_owner: "档案调查组" } } },
    { id: "update-asset", action: "update", target: "asset", targetId: "asset-existing", data: { name: "雾鸦堡调查概念图", kind: "image", tags: ["调查", "雾鸦堡"], notes: "供序章审阅使用", linkedEntityIds: ["entity-castle"], storedName: "forged-path.png", size: 1 } },
    { id: "create-test-variable", action: "create", target: "story-variable", ref: "admin-state", data: { key: "story.archive_open", name: "档案室已开启", type: "boolean", defaultValue: false } },
    { id: "create-test-scene", action: "create", target: "story-scene", ref: "admin-scene", data: { title: "档案室复核", summary: "复核调查线索", status: "review", entryNodeId: "admin-node", relatedEntityIds: ["entity-castle"], nodes: [{ id: "admin-node", label: "复核结束", speakerEntityId: "", text: "记录已经归档。", nextNodeId: "", choices: [], conditions: [], effects: [], isEnding: true }] } },
    { id: "create-preset", action: "create", target: "story-test-preset", ref: "admin-preset", data: { name: "档案室关闭状态", sceneId: "@admin-scene", initialState: { "@admin-state": false }, maxDepth: 16, maxPaths: 80 } },
    { id: "create-review", action: "create", target: "story-review-issue", ref: "admin-issue", data: { title: "补充档案开启反馈", detail: "玩家选择后需要增加视觉反馈。", severity: "major", status: "open", source: "consistency", runId: "forged-run", presetId: "@admin-preset", sceneId: "@admin-scene", nodeId: "admin-node", entityId: "entity-castle" } },
    { id: "create-editor", action: "create", target: "member", ref: "admin-editor", data: { name: "剧情审阅员", email: "reviewer@example.test", role: "editor" } }
  ]
}));
check(projectAdminPlan.ok, true, "project administration plan parses");
const administered = operations.applyAiOperationPlan(baseWorkspace(), projectAdminPlan.plan, {
  worldId: "world-a",
  instruction: "完善项目分类、模板、测试、资源和成员权限，并邀请 reviewer@example.test",
  model: "smart-model",
  now: "2026-07-13T05:00:00.000Z"
});
check(administered.ok, true, "project administration targets apply in one transaction");
check(administered.run.changes.length, 10, "all administration changes enter one audit run");
check(administered.data.worlds[0].description, "由 AI 补全的世界项目说明", "world settings can be updated");
check(administered.data.worlds[0].ownerId, "user-owner", "world ownership identity is protected");
check(administered.data.codexCategories.some((item) => item.id === administered.refs["investigation-category"]), true, "project category is created");
check(administered.data.entityTemplates.some((item) => item.id === administered.refs["investigation-template"]), true, "entity template is created");
check(administered.data.entities[0].categoryId, administered.refs["investigation-category"], "entity can move into a batch-created category");
check(administered.data.entities[0].templateId, administered.refs["investigation-template"], "entity can use a batch-created template");
check(administered.data.assets[0].name, "雾鸦堡调查概念图", "asset metadata can be updated");
check(administered.data.assets[0].storedName, "private-concept.png", "asset binary identity cannot be overwritten");
check(administered.data.assets[0].size, 2048, "asset binary size cannot be forged");
check(administered.data.storyTestPresets[0].sceneId, administered.refs["admin-scene"], "test preset links to a batch-created scene");
check(Object.keys(administered.data.storyTestPresets[0].initialState), [administered.refs["admin-state"]], "batch references resolve in story-state object keys");
check(administered.data.storyReviewIssues.find((item) => item.id === administered.refs["admin-issue"]).source, "manual", "AI-created review issues cannot impersonate generated sources");
check(administered.data.storyReviewIssues.find((item) => item.id === administered.refs["admin-issue"]).runId, "", "AI-created review issues cannot forge test run provenance");
check(administered.data.members.some((item) => item.id === administered.refs["admin-editor"] && item.role === "editor"), true, "member permission is created");
const rehydratedAdministrationHierarchy = codexTree.normalizeCodexHierarchy(
  administered.data.codexCategories,
  administered.data.entities,
  ["world-a"],
  "2026-07-13T05:30:00.000Z"
);
const rehydratedAdministration = {
  ...administered.data,
  codexCategories: rehydratedAdministrationHierarchy.categories,
  entities: rehydratedAdministrationHierarchy.entities
};
check(rehydratedAdministration.codexCategories, administered.data.codexCategories, "AI category ordering is stable across workspace rehydration");
check(operations.undoAiOperationRun(rehydratedAdministration, administered.run.id).ok, true, "rehydration does not invalidate administration undo");
const reorderedAdministration = structuredClone(rehydratedAdministration);
const administeredEntityIndex = reorderedAdministration.entities.findIndex((item) => item.id === "entity-castle");
reorderedAdministration.entities[administeredEntityIndex] = Object.fromEntries(
  Object.entries(reorderedAdministration.entities[administeredEntityIndex]).reverse()
);
check(operations.undoAiOperationRun(reorderedAdministration, administered.run.id).ok, true, "JSON object key ordering does not invalidate safe undo");

const cleanupPlan = operations.parseAiOperationPlan(JSON.stringify({
  summary: "删除本批项目结构",
  operations: [
    { id: "restore-entity-structure", action: "update", target: "entity", targetId: "entity-castle", data: { categoryId: "category:world-a:location", templateId: "template-secret-location", templateData: { secret: "隐藏模板内容" } } },
    { id: "delete-category", action: "delete", target: "codex-category", targetId: administered.refs["investigation-category"], data: {} },
    { id: "delete-template", action: "delete", target: "entity-template", targetId: administered.refs["investigation-template"], data: {} },
    { id: "delete-review", action: "delete", target: "story-review-issue", targetId: administered.refs["admin-issue"], data: {} },
    { id: "delete-preset", action: "delete", target: "story-test-preset", targetId: administered.refs["admin-preset"], data: {} },
    { id: "delete-scene", action: "delete", target: "story-scene", targetId: administered.refs["admin-scene"], data: {} },
    { id: "delete-variable", action: "delete", target: "story-variable", targetId: administered.refs["admin-state"], data: {} },
    { id: "delete-member", action: "delete", target: "member", targetId: administered.refs["admin-editor"], data: {} }
  ]
}));
const cleaned = operations.applyAiOperationPlan(administered.data, cleanupPlan.plan, {
  worldId: "world-a",
  instruction: "清理测试结构",
  model: "smart-model",
  now: "2026-07-13T06:00:00.000Z"
});
check(cleaned.ok, true, "referentially complete administration deletes apply");
check(cleaned.data.codexCategories.some((item) => item.id === administered.refs["investigation-category"]), false, "category delete applies after entity cleanup");
check(cleaned.data.entityTemplates.some((item) => item.id === administered.refs["investigation-template"]), false, "template delete applies after entity cleanup");
check(cleaned.data.storyTestPresets.length, 0, "test preset delete applies after issue cleanup");
check(cleaned.data.members.length, 1, "member delete preserves the owner");
const restoredCleanup = operations.undoAiOperationRun(cleaned.data, cleaned.run.id);
check(restoredCleanup.ok, true, "administration cleanup can be fully undone");
const restoredAdministration = operations.undoAiOperationRun(restoredCleanup.data, administered.run.id);
check(restoredAdministration.ok, true, "administration transaction can be fully undone");
check(restoredAdministration.data.worlds[0].description, "雾鸦堡与黑塔的奇幻世界", "administration undo restores world settings");
check(restoredAdministration.data.assets[0].name, "雾鸦堡概念图", "administration undo restores asset metadata");
check(restoredAdministration.data.members.length, 1, "administration undo removes the created member");

const generatedRunWorkspace = structuredClone(administered.data);
generatedRunWorkspace.storyTestRuns.push({ id: "generated-run", worldId: "world-a", presetId: administered.refs["admin-preset"] });
const generatedRunDelete = operations.applyAiOperationPlan(generatedRunWorkspace, {
  summary: "错误删除被历史记录引用的预设",
  operations: [
    { id: "delete-review-first", action: "delete", target: "story-review-issue", targetId: administered.refs["admin-issue"], ref: "", data: {} },
    { id: "delete-used-preset", action: "delete", target: "story-test-preset", targetId: administered.refs["admin-preset"], ref: "", data: {} }
  ]
}, { worldId: "world-a", instruction: "删除预设", model: "smart-model" });
check(generatedRunDelete.ok, false, "preset deletion cannot rewrite generated test history");
check(generatedRunDelete.error.includes("历史运行记录"), true, "generated test boundary explains the rejection");

const ownerDelete = operations.applyAiOperationPlan(baseWorkspace(), {
  summary: "错误删除唯一所有者",
  operations: [{ id: "delete-owner", action: "delete", target: "member", targetId: "member-owner", ref: "", data: {} }]
}, { worldId: "world-a", instruction: "删除所有者", model: "smart-model" });
check(ownerDelete.ok, false, "the final owner cannot be deleted");
check(ownerDelete.error.includes("至少一名所有者"), true, "owner safety rule explains the rejection");

const worldDelete = operations.applyAiOperationPlan(baseWorkspace(), {
  summary: "错误删除世界",
  operations: [{ id: "delete-world", action: "delete", target: "world", targetId: "world-a", ref: "", data: {} }]
}, { worldId: "world-a", instruction: "删除世界", model: "smart-model" });
check(worldDelete.ok, false, "AI cannot delete a world");

const assetCreate = operations.applyAiOperationPlan(baseWorkspace(), {
  summary: "错误伪造资源",
  operations: [{ id: "create-asset", action: "create", target: "asset", targetId: "", ref: "fake-asset", data: { name: "不存在的文件" } }]
}, { worldId: "world-a", instruction: "创建资源", model: "smart-model" });
check(assetCreate.ok, false, "AI cannot fabricate asset records without local files");

const builtInDelete = operations.applyAiOperationPlan(baseWorkspace(), {
  summary: "错误删除内置模板",
  operations: [{ id: "delete-built-in", action: "delete", target: "entity-template", targetId: "template:world-a:location", ref: "", data: {} }]
}, { worldId: "world-a", instruction: "删除内置模板", model: "smart-model" });
check(builtInDelete.ok, false, "built-in entity templates cannot be deleted");

const brokenAssetLink = operations.applyAiOperationPlan(baseWorkspace(), {
  summary: "错误资源关联",
  operations: [{ id: "break-asset", action: "update", target: "asset", targetId: "asset-existing", ref: "", data: { linkedEntityIds: ["missing-entity"] } }]
}, { worldId: "world-a", instruction: "更新资源关联", model: "smart-model" });
check(brokenAssetLink.ok, false, "asset metadata cannot keep broken entity links");

const categoryCycle = operations.applyAiOperationPlan(baseWorkspace(), {
  summary: "错误分类循环",
  operations: [
    { id: "category-a", action: "create", target: "codex-category", targetId: "", ref: "category-a", data: { title: "循环 A", parentId: "@category-b" } },
    { id: "category-b", action: "create", target: "codex-category", targetId: "", ref: "category-b", data: { title: "循环 B", parentId: "@category-a" } }
  ]
}, { worldId: "world-a", instruction: "创建分类", model: "smart-model" });
check(categoryCycle.ok, false, "cyclic project categories reject the full transaction");
check(categoryCycle.error.includes("循环"), true, "category cycle validation explains the rejection");

const usedTemplateDelete = operations.applyAiOperationPlan(baseWorkspace(), {
  summary: "错误删除使用中的模板",
  operations: [{ id: "delete-used-template", action: "delete", target: "entity-template", targetId: "template-secret-location", ref: "", data: {} }]
}, { worldId: "world-a", instruction: "删除模板", model: "smart-model" });
check(usedTemplateDelete.ok, false, "templates still used by entities cannot be deleted");

const unspecifiedMemberAccount = operations.applyAiOperationPlan(baseWorkspace(), {
  summary: "错误猜测成员账号",
  operations: [{ id: "guess-member", action: "create", target: "member", targetId: "", ref: "guessed-member", data: { name: "审阅员", email: "guessed@example.test", role: "editor" } }]
}, { worldId: "world-a", instruction: "增加一名审阅员", model: "smart-model" });
check(unspecifiedMemberAccount.ok, false, "member accounts cannot be guessed by the model");
check(unspecifiedMemberAccount.error.includes("未在用户指令中明确提供"), true, "member privacy rejection explains the boundary");

const mismatchedPreset = operations.applyAiOperationPlan(administered.data, {
  summary: "错误测试变量类型",
  operations: [{ id: "mismatch-state", action: "update", target: "story-test-preset", targetId: administered.refs["admin-preset"], ref: "", data: { initialState: { [administered.refs["admin-state"]]: "false" } } }]
}, { worldId: "world-a", instruction: "更新测试状态", model: "smart-model" });
check(mismatchedPreset.ok, false, "story test preset values must match variable types");

const context = operations.buildAiOperationContext(applied.data, "world-a", 24000);
check(context.text.includes("艾琳"), true, "operation context includes structured project summaries");
check(context.text.includes("不应进入项目操作上下文的超长正文"), false, "operation context excludes entity body text");
check(context.text.includes("隐藏模板内容"), false, "operation context excludes secret template values");
check(context.text.includes("asset://private-map-image.png"), false, "operation context excludes local map image paths");
check(context.text.includes("不应进入项目操作上下文的制作秘密"), false, "operation context excludes milestone developer notes");
check(context.text.includes('"references"'), true, "operation context includes unified timeline references");
check(context.text.includes("黑塔调查图"), true, "operation context includes compact map structure");
check(context.text.includes("第二章：黑塔划痕"), true, "operation context includes narrative production milestones");
check(context.characters <= 24000, true, "operation context respects its character budget");
check(context.counts.entities, 2, "operation context reports full collection counts");
check(context.counts.maps, 2, "operation context reports map counts");
check(context.counts.mapMarkers, 2, "operation context reports map marker counts");
check(context.counts.narrativeMilestones, 1, "operation context reports milestone counts");
const administrationContext = operations.buildAiOperationContext(administered.data, "world-a", 30000);
check(administrationContext.text.includes("调查档案"), true, "operation context includes project categories");
check(administrationContext.text.includes("调查地点模板"), true, "operation context includes entity template definitions");
check(administrationContext.text.includes("档案室关闭状态"), true, "operation context includes story test presets");
check(administrationContext.text.includes("补充档案开启反馈"), true, "operation context includes review issues");
check(administrationContext.text.includes("雾鸦堡调查概念图"), true, "operation context includes asset metadata");
check(administrationContext.text.includes("reviewer@example.test"), false, "operation context excludes member accounts");
check(administrationContext.text.includes("private-concept.png"), false, "operation context excludes local asset storage names");
check(administrationContext.counts.codexCategories > 0, true, "operation context reports category counts");
check(administrationContext.counts.entityTemplates > 0, true, "operation context reports template counts");
check(administrationContext.counts.storyTestPresets, 1, "operation context reports preset counts");
check(administrationContext.counts.members, 2, "operation context reports member counts");
check(operations.aiOperationSystemPrompt.includes("map-marker-group"), true, "system prompt advertises map operation targets");
check(operations.aiOperationSystemPrompt.includes("narrative-milestone"), true, "system prompt advertises narrative milestone operations");
check(operations.aiOperationSystemPrompt.includes("entity-template"), true, "system prompt advertises template operations");
check(operations.aiOperationSystemPrompt.includes("story-test-preset"), true, "system prompt advertises testing operations");
check(operations.aiOperationSystemPrompt.includes("不得创建或删除资源"), true, "system prompt states the asset binary boundary");

const normalized = operations.normalizeAiOperationRun({
  id: "legacy-run",
  summary: "旧操作记录",
  status: "applied",
  changes: applied.run.changes,
  operations: applied.run.operations,
  createdAt: "2026-07-13T00:00:00.000Z"
}, "world-a");
check(normalized.status, "applied", "stored applied run normalizes");
check(normalized.changes.length, 15, "stored changes normalize");
check(normalized.changes.some((change) => change.target === "map-route"), true, "stored map changes retain their operation target");
check(operations.normalizeAiOperationRun({ id: "unknown" }, "world-a").status, "archived", "incomplete imported runs are not undoable");

console.log(`AI project operation checks passed: ${assertions} assertions across 29 scenarios.`);
