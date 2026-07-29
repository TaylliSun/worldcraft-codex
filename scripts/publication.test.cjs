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

const publication = require(path.join(__dirname, "..", "app", "publication.ts"));
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

const source = {
  world: { id: "world-a", name: "测试世界" },
  entityTemplates: [{
    id: "template-a",
    fields: [
      { id: "field-public", key: "role", label: "身份", secret: false },
      { id: "field-secret", key: "secret", label: "秘密", secret: true }
    ]
  }],
  entities: [
    {
      id: "entity-public",
      visibility: "public",
      templateId: "template-a",
      templateData: { role: "守门人", secret: "泄漏模板秘密" },
      content: '<p>公开正文</p><section data-secret-block="true"><div><p>泄漏正文秘密</p></div></section><script>danger()</script><p onclick="danger()">结尾</p>'
    },
    { id: "entity-shared", visibility: "shared", templateData: {}, content: "<p>同伴</p>" },
    { id: "entity-secret", visibility: "secret", templateData: {}, content: "秘密条目正文" }
  ],
  quests: [{
    id: "quest-a",
    relatedEntityIds: ["entity-public", "entity-secret"],
    developerNotes: "泄漏任务备注",
    steps: [{ id: "step-a", notes: "泄漏步骤备注", objective: "公开目标" }]
  }],
  storyScenes: [{
    id: "scene-a",
    relatedEntityIds: ["entity-secret", "entity-public"],
    notes: "泄漏场景备注",
    nodes: [
      { id: "node-a", speakerEntityId: "entity-secret" },
      { id: "node-b", speakerEntityId: "entity-public" }
    ]
  }],
  storyVariables: [{ id: "variable-a" }],
  relations: [
    { id: "relation-keep", sourceEntityId: "entity-public", targetEntityId: "entity-shared" },
    { id: "relation-drop", sourceEntityId: "entity-public", targetEntityId: "entity-secret" }
  ],
  assets: [{
    id: "asset-a",
    linkedEntityIds: ["entity-public", "entity-secret"],
    notes: "泄漏资源开发备注"
  }],
  maps: [{
    id: "map-a",
    regions: [{
      id: "region-a",
      references: [
        { kind: "entity", id: "entity-secret" },
        { kind: "quest", id: "quest-a" }
      ]
    }]
  }],
  mapMarkers: [{
    id: "marker-a",
    entityId: "entity-secret",
    references: [
      { kind: "entity", id: "entity-secret" },
      { kind: "quest", id: "quest-a" }
    ]
  }],
  mapRoutes: [{
    id: "route-a",
    references: [
      { kind: "entity", id: "entity-secret" },
      { kind: "scene", id: "scene-a" }
    ]
  }],
  timelineTracks: [{ id: "track-a" }],
  timelineEvents: [{
    id: "event-a",
    entityId: "entity-secret",
    references: [
      { kind: "entity", id: "entity-secret" },
      { kind: "scene", id: "scene-a" }
    ]
  }],
  narrativeMilestones: [{
    id: "milestone-a",
    linkedEntityIds: ["entity-public", "entity-secret"],
    linkedReviewIssueIds: ["issue-a"],
    developerNotes: "泄漏里程碑备注",
    blockedReason: "泄漏阻塞原因",
    manuscriptBody: '<p>公开章节正文</p><section data-secret-block="true"><p>泄漏章节秘密</p></section>'
  }],
  manuscriptBooks: [{
    id: "book-a",
    title: "长篇",
    dailyWordGoal: 1200,
    writingDays: [{ date: "2026-07-16", startWordCount: 1000, endWordCount: 1400 }]
  }],
  manuscriptVolumes: [
    { id: "volume-a", bookId: "book-a", title: "第一卷" },
    { id: "volume-orphan", bookId: "missing-book", title: "孤立卷" }
  ],
  manuscriptChapters: [
    {
      id: "chapter-a",
      bookId: "book-a",
      volumeId: "volume-a",
      title: "第一章",
      body: '<p>章节公开正文</p><section data-secret-block="true"><p>章节秘密</p></section>',
      notes: "作者章节备注",
      viewpointEntityId: "entity-secret",
      linkedNarrativeMilestoneId: "milestone-a",
      linkedStorySceneIds: ["scene-a", "missing-scene"],
      references: [
        { kind: "entity", id: "entity-secret" },
        { kind: "quest", id: "quest-a" }
      ],
      annotations: [{ id: "annotation-a", quote: "章节公开正文", comment: "作者批注" }]
    },
    { id: "chapter-orphan", bookId: "book-a", volumeId: "volume-orphan", title: "孤立章" }
  ],
  manuscriptScenes: [{
    id: "manuscript-scene-a",
    bookId: "book-a",
    volumeId: "volume-a",
    chapterId: "chapter-a",
    title: "开场",
    body: '<p>场景公开正文</p><section data-secret-block="true"><p>场景秘密</p></section>',
    notes: "作者场景备注",
    viewpointEntityId: "entity-public",
    locationEntityId: "entity-secret",
    relatedEntityIds: ["entity-public", "entity-secret"],
    linkedStorySceneId: "scene-a",
    references: [
      { kind: "entity", id: "entity-secret" },
      { kind: "scene", id: "scene-a" }
    ],
    annotations: [{ id: "annotation-scene", quote: "场景公开正文", comment: "场景批注" }]
  }],
  manuscriptClues: [
    {
      id: "clue-a",
      bookId: "book-a",
      setupUnitKind: "chapter",
      setupUnitId: "chapter-a",
      payoffUnitKind: "scene",
      payoffUnitId: "missing-scene",
      relatedEntityIds: ["entity-public", "entity-secret"]
    },
    { id: "clue-orphan", bookId: "missing-book" }
  ],
  manuscriptKnowledgeStates: [
    {
      id: "knowledge-a",
      bookId: "book-a",
      characterId: "entity-secret",
      unitKind: "scene",
      unitId: "manuscript-scene-a",
      authorConfirmed: true
    },
    {
      id: "knowledge-orphan",
      bookId: "book-a",
      characterId: "entity-public",
      unitKind: "chapter",
      unitId: "missing-chapter"
    }
  ],
  storyTestPresets: [{ id: "preset-a" }],
  storyTestRuns: [{ id: "run-a" }],
  storyReviewIssues: [{ id: "issue-a" }],
  consistencyFindings: [{ id: "finding-a" }],
  consistencyScans: [{ id: "scan-a" }],
  consistencySettings: [{ id: "settings-a" }],
  consistencyModelSettings: [{ id: "model-a" }],
  aiMemoryItems: [{ id: "memory-a", content: "泄漏 AI 记忆" }],
  aiWritingSessions: [{ id: "session-a" }],
  aiOperationRuns: [{ id: "operation-a" }],
  members: [{ id: "member-a", email: "private@example.com" }]
};

const sanitized = publication.sanitizePublicationPayload(source);
check(source.entities.length, 3, "sanitizing does not mutate its input");
check(sanitized.entities.map((item) => item.id), ["entity-public", "entity-shared"], "secret entities are excluded");
check(sanitized.entities[0].templateData, { role: "守门人" }, "secret template values are excluded");
check(sanitized.entityTemplates[0].fields.map((field) => field.key), ["role"], "secret template definitions are excluded");
check(sanitized.entities[0].content.includes("泄漏正文秘密"), false, "secret rich-text blocks are excluded");
check(sanitized.entities[0].content.includes("danger"), false, "unsafe rich-text markup is excluded");
check(sanitized.entities[0].content.includes("公开正文"), true, "public rich text remains");
check(sanitized.entities[0].content.includes("结尾"), true, "content after a secret block remains");
check(sanitized.quests[0].relatedEntityIds, ["entity-public"], "quest links to secret entities are removed");
check(sanitized.quests[0].developerNotes, "", "quest developer notes are excluded");
check(sanitized.quests[0].steps[0].notes, "", "quest step notes are excluded");
check(sanitized.storyScenes[0].notes, "", "scene developer notes are excluded");
check(sanitized.storyScenes[0].nodes[0].speakerEntityId, "", "secret speakers are removed");
check(sanitized.storyScenes[0].nodes[1].speakerEntityId, "entity-public", "public speakers remain");
check(sanitized.relations.map((item) => item.id), ["relation-keep"], "relations to secret entities are removed");
check(sanitized.assets[0].linkedEntityIds, ["entity-public"], "asset links to secret entities are removed");
check(sanitized.assets[0].notes, "", "asset developer notes are excluded");
check(sanitized.mapMarkers[0].entityId, "", "legacy marker secret links are removed");
check(sanitized.mapMarkers[0].references, [{ kind: "quest", id: "quest-a" }], "marker unified secret links are removed");
check(sanitized.timelineEvents[0].references, [{ kind: "scene", id: "scene-a" }], "timeline unified secret links are removed");
check(sanitized.maps[0].regions[0].references, [{ kind: "quest", id: "quest-a" }], "map region stable references are filtered");
check(sanitized.mapRoutes[0].references, [{ kind: "scene", id: "scene-a" }], "route stable references are filtered");
check(sanitized.narrativeMilestones[0].developerNotes, "", "milestone developer notes are excluded");
check(sanitized.narrativeMilestones[0].manuscriptBody.includes("公开章节正文"), true, "public manuscript prose remains");
check(sanitized.narrativeMilestones[0].manuscriptBody.includes("泄漏章节秘密"), false, "secret manuscript blocks are excluded");
check(sanitized.narrativeMilestones[0].linkedReviewIssueIds, [], "links to excluded review issues are removed");
check(sanitized.manuscriptVolumes.map((item) => item.id), ["volume-a"], "orphan manuscript volumes are removed");
check(sanitized.manuscriptChapters.map((item) => item.id), ["chapter-a"], "orphan manuscript chapters are removed");
check(sanitized.manuscriptChapters[0].body.includes("章节秘密"), false, "chapter secret blocks are excluded");
check(sanitized.manuscriptChapters[0].notes, "", "chapter author notes are excluded");
check(sanitized.manuscriptChapters[0].annotations, [], "chapter annotations never enter publication payloads");
check(sanitized.manuscriptChapters[0].references, [{ kind: "quest", id: "quest-a" }], "chapter stable references are filtered");
check(sanitized.manuscriptScenes[0].locationEntityId, "", "secret manuscript locations are removed");
check(sanitized.manuscriptScenes[0].relatedEntityIds, ["entity-public"], "manuscript scene entity links are filtered");
check(sanitized.manuscriptScenes[0].annotations, [], "scene annotations never enter publication payloads");
check(sanitized.manuscriptBooks[0].dailyWordGoal, 0, "daily writing goals never enter publication payloads");
check(sanitized.manuscriptBooks[0].writingDays, [], "private writing history never enters publication payloads");
check(sanitized.manuscriptClues.length, 0, "clue ledger is private by default");
check(sanitized.manuscriptKnowledgeStates.length, 0, "knowledge ledger is private by default");
check(sanitized.aiMemoryItems.length, 0, "AI memory never enters publication payloads");
check(sanitized.storyReviewIssues.length, 0, "review issues are excluded from reader payloads");
check(sanitized.members.length, 0, "member data is excluded from reader payloads");

const developerView = publication.sanitizePublicationPayload(source, {
  includeDeveloperNotes: true
});
check(developerView.quests[0].developerNotes, "泄漏任务备注", "developer notes can be explicitly included");
check(developerView.entities.some((item) => item.id === "entity-secret"), false, "developer mode still excludes secrets by default");
check(developerView.aiMemoryItems.length, 0, "developer mode still excludes AI memory");
check(developerView.manuscriptClues.length, 1, "developer mode can retain valid clue ledgers");
check(developerView.manuscriptClues[0].payoffUnitId, "", "invalid clue payoff locations are cleared");
check(developerView.manuscriptClues[0].relatedEntityIds, ["entity-public"], "developer clue links still respect privacy");
check(developerView.manuscriptKnowledgeStates.length, 1, "invalid knowledge locations are removed");
check(developerView.manuscriptKnowledgeStates[0].characterId, "", "secret knowledge characters are cleared");
check(developerView.manuscriptChapters[0].annotations, [], "developer publication also strips chapter annotations");
check(developerView.manuscriptBooks[0].writingDays, [], "developer publication also strips writing history");

console.log(`Publication privacy checks passed: ${assertions} assertions across 2 modes.`);
