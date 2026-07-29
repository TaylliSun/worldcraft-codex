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

const {
  applyAiOperationPlan,
  normalizeAiOperationRun,
  recordAiWorkspaceChange,
  undoAiOperationRun
} = require(path.join(__dirname, "..", "app", "ai-operations.ts"));

function workspace() {
  return {
    worlds: [{ id: "world-1", ownerId: "member-1", name: "测试世界", description: "", visibility: "private", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" }],
    codexCategories: [], entityTemplates: [], entities: [], quests: [],
    storyVariables: [], storyScenes: [], storyTestPresets: [], storyTestRuns: [], storyReviewIssues: [],
    relations: [], assets: [],
    members: [{ id: "member-1", worldId: "world-1", name: "作者", email: "author", role: "owner" }],
    maps: [], mapLayers: [], mapMarkerGroups: [], mapMarkers: [], mapRoutes: [],
    narrativeMilestones: [], timelineTracks: [], timelineEvents: [],
    manuscriptBooks: [], manuscriptVolumes: [], manuscriptChapters: [], manuscriptScenes: [],
    aiOperationRuns: []
  };
}

const created = applyAiOperationPlan(workspace(), {
  summary: "建立小说正文结构",
  operations: [
    { id: "book", action: "create", target: "manuscript-book", targetId: "", ref: "book", data: { title: "雾鸦堡纪事", status: "drafting" } },
    { id: "volume", action: "create", target: "manuscript-volume", targetId: "", ref: "volume", data: { bookId: "@book", title: "第一卷" } },
    { id: "chapter", action: "create", target: "manuscript-chapter", targetId: "", ref: "chapter", data: { bookId: "@book", volumeId: "@volume", title: "第一章 风雪来信", body: "<p>钟声沉入风雪。</p>" } }
  ]
}, {
  worldId: "world-1",
  instruction: "新建第一卷和第一章",
  model: "test-model",
  now: "2026-01-02T00:00:00.000Z"
});
assert.equal(created.ok, true);
assert.equal(created.data.manuscriptBooks.length, 1);
assert.equal(created.data.manuscriptVolumes[0].bookId, created.data.manuscriptBooks[0].id);
assert.equal(created.data.manuscriptChapters[0].volumeId, created.data.manuscriptVolumes[0].id);
assert.equal(
  created.run.changes.filter((change) => change.target.startsWith("manuscript-")).length,
  3
);

const chapter = created.data.manuscriptChapters[0];
const recorded = recordAiWorkspaceChange(created.data, {
  worldId: "world-1",
  target: "manuscript-chapter",
  itemId: chapter.id,
  after: { ...chapter, body: `${chapter.body}<p>艾琳认出了哥哥的暗号。</p>`, updatedAt: "2026-01-03T00:00:00.000Z" },
  instruction: "把生成正文追加到第一章",
  summary: "追加 AI 章节正文",
  model: "test-model",
  now: "2026-01-03T00:00:00.000Z"
});
assert.equal(recorded.ok, true);
assert.match(recorded.data.manuscriptChapters[0].body, /艾琳认出了哥哥的暗号/);
assert.equal(recorded.run.changes[0].collection, "manuscriptChapters");
assert.equal(recorded.run.status, "applied");

const normalized = normalizeAiOperationRun(recorded.run, "world-1");
assert.equal(normalized.changes[0].target, "manuscript-chapter");
assert.equal(normalized.changes[0].collection, "manuscriptChapters");

const undone = undoAiOperationRun(recorded.data, recorded.run.id, "2026-01-04T00:00:00.000Z");
assert.equal(undone.ok, true);
assert.equal(undone.data.manuscriptChapters[0].body, chapter.body);
assert.equal(undone.run.status, "undone");

const editedAfterAi = structuredClone(recorded.data);
editedAfterAi.manuscriptChapters[0].body += "<p>作者随后手工修改。</p>";
const blocked = undoAiOperationRun(editedAfterAi, recorded.run.id);
assert.equal(blocked.ok, false);
assert.match(blocked.error, /又被修改/);

const wrongWorld = recordAiWorkspaceChange(created.data, {
  worldId: "another-world",
  target: "manuscript-chapter",
  itemId: chapter.id,
  after: { ...chapter, title: "错误写入" },
  instruction: "错误世界",
  summary: "错误世界",
  model: "test-model"
});
assert.equal(wrongWorld.ok, false);

console.log("Unified AI undo checks passed: 16 assertions across manuscript creation, recorded writes, normalization, undo, conflict blocking, and world isolation.");
