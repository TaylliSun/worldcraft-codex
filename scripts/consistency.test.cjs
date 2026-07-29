const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");

require.extensions[".ts"] = (module, filePath) => {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    },
    fileName: filePath
  }).outputText;
  module._compile(output, filePath);
};

const consistency = require(path.join(root, "app", "consistency.ts"));
const worldId = "world-test";
const timestamp = "2026-07-11T10:00:00.000Z";

const settings = consistency.createDefaultConsistencySettings(worldId);
assert.equal(settings.worldId, worldId);
assert.equal(settings.disabledRuleIds.includes("MAP-002"), true);
assert.equal(settings.requireTemplateFields, true);
assert.equal(settings.maxMissingTemplateFields, 0);
assert.equal(settings.maxRouteMarkerVisits, 1);

const modelSettings = consistency.createDefaultConsistencyModelSettings(worldId);
assert.equal(modelSettings.enabled, false);
assert.equal(consistency.isLoopbackModelEndpoint(modelSettings.endpoint), true);
assert.equal(consistency.isLoopbackModelEndpoint("https://example.com/v1"), false);
assert.equal(consistency.isSupportedModelEndpoint("https://example.com/v1", "openai-compatible"), true);
assert.equal(consistency.isSupportedModelEndpoint("http://example.com/v1", "openai-compatible"), false);
assert.equal(consistency.isSupportedModelEndpoint("https://example.com/v1", "local"), false);

const entities = [
  {
    id: "entity-a",
    worldId,
    type: "character",
    title: "艾琳",
    slug: "ailin",
    summary: "",
    content: "她认识 [[不存在]]，也提到 [[艾琳]]。",
    visibility: "public",
    templateData: { secrets: "她的哥哥仍然活着" }
  },
  {
    id: "entity-b",
    worldId,
    type: "character",
    title: "艾琳",
    slug: "ailin",
    summary: "重名角色",
    content: "",
    visibility: "private",
    templateData: { goals: "守卫北境", birthplace: "雾鸦堡" }
  },
  {
    id: "entity-war",
    worldId,
    type: "event",
    title: "北境战争",
    slug: "northern-war",
    summary: "战争事件",
    content: "",
    visibility: "shared",
    templateData: {
      time: "第三纪元 120 年",
      place: "雾鸦堡",
      cause: "越境",
      result: "停战"
    }
  },
  {
    id: "entity-eclipse",
    worldId,
    type: "event",
    title: "黑日",
    slug: "black-sun",
    summary: "地图事件",
    content: "",
    visibility: "shared",
    templateData: { time: "星历 9 年", place: "王都", cause: "未知", result: "失明" }
  }
];

const quests = [
  {
    id: "quest-a",
    worldId,
    title: "任务 A",
    status: "active",
    relatedEntityIds: [],
    prerequisiteQuestIds: ["quest-b"],
    steps: []
  },
  {
    id: "quest-b",
    worldId,
    title: "任务 B",
    status: "draft",
    relatedEntityIds: [],
    prerequisiteQuestIds: ["quest-a"],
    steps: [
      {
        id: "step-b",
        title: "选择路线",
        condition: "",
        branch: "进入密道",
        failure: ""
      }
    ]
  }
];

const scene = {
  id: "scene-a",
  worldId,
  title: "档案室",
  summary: "",
  status: "ready",
  entryNodeId: "node-a",
  relatedEntityIds: [],
  relatedQuestIds: [],
  nodes: [
    {
      id: "node-a",
      label: "开场",
      speakerEntityId: "entity-a",
      text: "",
      conditions: [],
      effects: [],
      choices: [],
      nextNodeId: "",
      isEnding: true
    }
  ],
  notes: "",
  createdAt: timestamp,
  updatedAt: timestamp
};

const map = {
  id: "map-a",
  worldId,
  title: "世界地图",
  description: "",
  imageUrl: "",
  width: 1600,
  height: 1000,
  createdAt: timestamp,
  updatedAt: timestamp
};
const markers = [
  {
    id: "marker-empty",
    mapId: map.id,
    entityId: "",
    questId: "",
    sceneId: "",
    x: 10,
    y: 20,
    label: "空标记",
    markerType: "custom",
    color: "#0f766e",
    description: "",
    updatedAt: timestamp
  },
  {
    id: "marker-eclipse",
    mapId: map.id,
    entityId: "entity-eclipse",
    questId: "",
    sceneId: "",
    x: 30,
    y: 40,
    label: "黑日",
    markerType: "event",
    color: "#c45d4c",
    description: "",
    updatedAt: timestamp
  }
];
const route = {
  id: "route-a",
  worldId,
  mapId: map.id,
  title: "折返路线",
  description: "",
  color: "#7458aa",
  status: "draft",
  stops: [
    { id: "stop-a", markerId: "marker-empty", title: "A", notes: "", duration: "" },
    { id: "stop-b", markerId: "marker-empty", title: "B", notes: "", duration: "" }
  ],
  updatedAt: timestamp
};

const track = {
  id: "track-a",
  worldId,
  name: "历史",
  description: "",
  color: "#0f766e",
  order: 0,
  updatedAt: timestamp
};
const timelineEvents = [
  {
    id: "timeline-a",
    worldId,
    entityId: "entity-war",
    questId: "quest-a",
    sceneId: "scene-a",
    trackId: track.id,
    title: "战争爆发",
    summary: "",
    displayDate: "第三纪元 121 年",
    sortOrder: 10,
    startValue: "5",
    endValue: "2",
    era: "第三纪元",
    dependencyIds: ["timeline-b"],
    updatedAt: timestamp
  },
  {
    id: "timeline-b",
    worldId,
    entityId: "",
    questId: "",
    sceneId: "",
    trackId: track.id,
    title: "战争准备",
    summary: "",
    displayDate: "第三纪元 119 年",
    sortOrder: 20,
    startValue: "",
    endValue: "",
    era: "第三纪元",
    dependencyIds: [],
    updatedAt: timestamp
  },
  {
    id: "timeline-c",
    worldId,
    entityId: "",
    questId: "",
    sceneId: "",
    trackId: track.id,
    title: "同序事件",
    summary: "",
    displayDate: "第三纪元 119 年 夏",
    sortOrder: 20,
    startValue: "",
    endValue: "",
    era: "第三纪元",
    dependencyIds: [],
    updatedAt: timestamp
  }
];

const relations = [
  {
    id: "relation-a",
    worldId,
    sourceEntityId: "entity-a",
    targetEntityId: "entity-war",
    kind: "ally",
    label: "参与",
    direction: "directed"
  },
  {
    id: "relation-b",
    worldId,
    sourceEntityId: "entity-a",
    targetEntityId: "entity-war",
    kind: "ally",
    label: "参加",
    direction: "directed"
  }
];

const manuscript = {
  manuscriptBooks: [{
    id: "book-a",
    worldId,
    title: "Test novel",
    subtitle: "",
    summary: "",
    status: "drafting",
    order: 0,
    targetWordCount: 10000,
    createdAt: timestamp,
    updatedAt: timestamp
  }],
  manuscriptVolumes: [{
    id: "volume-a",
    worldId,
    bookId: "book-a",
    title: "Volume one",
    summary: "",
    status: "drafting",
    order: 0,
    targetWordCount: 10000,
    createdAt: timestamp,
    updatedAt: timestamp
  }],
  manuscriptChapters: [
    {
      id: "chapter-a",
      worldId,
      bookId: "book-a",
      volumeId: "volume-a",
      title: "Chapter one",
      summary: "",
      body: "",
      notes: "",
      status: "drafting",
      order: 0,
      targetWordCount: 1000,
      viewpointEntityId: "entity-a",
      timelineStart: "9",
      timelineEnd: "2",
      linkedNarrativeMilestoneId: "",
      linkedStorySceneIds: [],
      references: [],
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "chapter-b",
      worldId,
      bookId: "book-a",
      volumeId: "volume-a",
      title: "Chapter two",
      summary: "",
      body: "",
      notes: "",
      status: "drafting",
      order: 1,
      targetWordCount: 1000,
      viewpointEntityId: "entity-a",
      timelineStart: "10",
      timelineEnd: "11",
      linkedNarrativeMilestoneId: "",
      linkedStorySceneIds: [],
      references: [],
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ],
  manuscriptScenes: [],
  manuscriptClues: [
    {
      id: "clue-missing-payoff",
      worldId,
      bookId: "book-a",
      title: "Missing payoff",
      description: "",
      status: "resolved",
      setupUnitKind: "chapter",
      setupUnitId: "chapter-a",
      payoffUnitKind: "chapter",
      payoffUnitId: "missing-chapter",
      relatedEntityIds: [],
      authorConfirmed: true,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "clue-reversed",
      worldId,
      bookId: "book-a",
      title: "Reversed clue",
      description: "",
      status: "open",
      setupUnitKind: "chapter",
      setupUnitId: "chapter-b",
      payoffUnitKind: "chapter",
      payoffUnitId: "chapter-a",
      relatedEntityIds: [],
      authorConfirmed: true,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ],
  manuscriptKnowledgeStates: [
    {
      id: "knowledge-known",
      worldId,
      bookId: "book-a",
      characterId: "entity-a",
      fact: "The gate is open",
      level: "known",
      unitKind: "chapter",
      unitId: "chapter-a",
      authorConfirmed: true,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "knowledge-unknown",
      worldId,
      bookId: "book-a",
      characterId: "entity-a",
      fact: "The gate is open",
      level: "unknown",
      unitKind: "chapter",
      unitId: "chapter-b",
      authorConfirmed: true,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ]
};

function input(overrides = {}) {
  return {
    worldId,
    worldName: "测试世界",
    entities,
    quests,
    storyVariables: [],
    storyScenes: [scene],
    storyTestRuns: [],
    maps: [map],
    mapMarkers: markers,
    mapRoutes: [route],
    timelineTracks: [track],
    timelineEvents,
    relations,
    manuscript,
    ...overrides
  };
}

const firstScan = consistency.runConsistencyScan(input(), [], settings, timestamp);
const ruleIds = new Set(firstScan.findings.filter((finding) => finding.detected).map((finding) => finding.ruleId));
[
  "ID-001",
  "ID-002",
  "REF-001",
  "REF-002",
  "TPL-001",
  "PRV-001",
  "QST-001",
  "QST-002",
  "QST-003",
  "STY-001",
  "STY-002",
  "STY-003",
  "MS-001",
  "MS-002",
  "MS-003",
  "MS-004",
  "MAP-001",
  "MAP-003",
  "TML-001",
  "TML-002",
  "TML-003",
  "TML-004",
  "REL-001"
].forEach((ruleId) => assert.equal(ruleIds.has(ruleId), true, ruleId));
assert.equal(ruleIds.has("MAP-002"), false);
assert.equal(firstScan.scan.totalDetected, firstScan.findings.filter((finding) => finding.detected).length);
assert.equal(firstScan.scan.newFindingIds.length, firstScan.scan.totalDetected);
assert.equal(firstScan.scan.criticalCount > 0, true);

const secondScan = consistency.runConsistencyScan(
  input(),
  firstScan.findings,
  settings,
  "2026-07-11T10:05:00.000Z"
);
assert.equal(secondScan.scan.newFindingIds.length, 0);
assert.deepEqual(
  secondScan.findings.filter((finding) => finding.detected).map((finding) => finding.fingerprint).sort(),
  firstScan.findings.filter((finding) => finding.detected).map((finding) => finding.fingerprint).sort()
);

const brokenLink = firstScan.findings.find((finding) => finding.ruleId === "REF-001");
const ignored = consistency.updateConsistencyFindingStatus(
  brokenLink,
  "ignored",
  "这是刻意保留的占位链接",
  "2026-07-11T10:06:00.000Z"
);
const ignoredScan = consistency.runConsistencyScan(
  input(),
  firstScan.findings.map((finding) => (finding.id === ignored.id ? ignored : finding)),
  settings,
  "2026-07-11T10:10:00.000Z"
);
const ignoredAfterScan = ignoredScan.findings.find((finding) => finding.id === ignored.id);
assert.equal(ignoredAfterScan.status, "ignored");
assert.equal(ignoredAfterScan.statusReason, "这是刻意保留的占位链接");

const timeConflict = firstScan.findings.find((finding) => finding.ruleId === "TML-003");
const fixedTimeline = timelineEvents.map((event) =>
  event.id === "timeline-a" ? { ...event, displayDate: "第三纪元 120 年" } : event
);
const fixedScan = consistency.runConsistencyScan(
  input({ timelineEvents: fixedTimeline }),
  firstScan.findings,
  settings,
  "2026-07-11T10:15:00.000Z"
);
const resolvedConflict = fixedScan.findings.find((finding) => finding.id === timeConflict.id);
assert.equal(resolvedConflict.status, "resolved");
assert.equal(resolvedConflict.detected, false);
assert.equal(fixedScan.scan.resolvedFindingIds.includes(timeConflict.id), true);

const manuallyResolved = consistency.updateConsistencyFindingStatus(
  timeConflict,
  "resolved",
  "已尝试修复",
  "2026-07-11T10:16:00.000Z"
);
const reopenedScan = consistency.runConsistencyScan(
  input(),
  firstScan.findings.map((finding) =>
    finding.id === manuallyResolved.id ? manuallyResolved : finding
  ),
  settings,
  "2026-07-11T10:20:00.000Z"
);
const reopened = reopenedScan.findings.find((finding) => finding.id === manuallyResolved.id);
assert.equal(reopened.status, "open");
assert.equal(reopenedScan.scan.reopenedFindingIds.includes(reopened.id), true);

const routeSettings = consistency.setConsistencyRuleEnabled(settings, "MAP-002", true);
const routeScan = consistency.runConsistencyScan(input(), [], routeSettings, timestamp);
assert.equal(routeScan.findings.some((finding) => finding.ruleId === "MAP-002"), true);
const relaxedRouteScan = consistency.runConsistencyScan(
  input(),
  [],
  { ...routeSettings, maxRouteMarkerVisits: 2 },
  timestamp
);
assert.equal(relaxedRouteScan.findings.some((finding) => finding.ruleId === "MAP-002"), false);
const relaxedTemplateScan = consistency.runConsistencyScan(
  input(),
  [],
  { ...settings, maxMissingTemplateFields: 20 },
  timestamp
);
assert.equal(relaxedTemplateScan.findings.some((finding) => finding.ruleId === "TPL-001"), false);
const clampedSettings = consistency.normalizeConsistencySettings(
  { ...settings, maxMissingTemplateFields: -4, maxRouteMarkerVisits: 99 },
  worldId
);
assert.equal(clampedSettings.maxMissingTemplateFields, 0);
assert.equal(clampedSettings.maxRouteMarkerVisits, 10);
const disabledQuestSettings = consistency.setConsistencyRuleEnabled(settings, "QST-001", false);
const disabledQuestScan = consistency.runConsistencyScan(input(), [], disabledQuestSettings, timestamp);
assert.equal(disabledQuestScan.findings.some((finding) => finding.ruleId === "QST-001"), false);

const report = consistency.buildConsistencyMarkdownReport(
  "测试世界",
  firstScan.findings,
  firstScan.scan
);
assert.equal(report.includes("一致性审阅报告"), true);
assert.equal(report.includes("ID-001"), true);
const prompt = consistency.buildConsistencyModelPrompt("测试世界", timeConflict);
assert.equal(prompt.includes("不虚构世界设定"), true);
assert.equal(prompt.includes("TML-003"), true);

console.log("Consistency domain checks passed: 57 assertions across 11 scenarios.");
