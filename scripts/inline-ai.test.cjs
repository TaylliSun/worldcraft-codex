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

const inline = require(path.join(__dirname, "..", "app", "inline-ai.ts"));
const writing = require(path.join(__dirname, "..", "app", "ai-writing.ts"));
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

const value = "艾琳来到王都。她没有找到哥哥。";
check(inline.normalizeInlineAiSelection(value, { start: 0, end: 2 }).text, "艾琳", "selection text is derived from the current field");
check(inline.normalizeInlineAiSelection(value, { start: -5, end: 999 }).text, value, "selection bounds are clamped");
check(
  inline.applyInlineAiResult(value, "艾琳抵达王都", "rewrite", { start: 0, end: 6 }),
  "艾琳抵达王都。她没有找到哥哥。",
  "selected text is replaced without touching the rest of the field"
);
check(
  inline.applyInlineAiResult("第一段", "第二段", "continue", { start: 3, end: 3 }),
  "第一段\n第二段",
  "continuation inserts after the caret"
);
check(inline.applyInlineAiResult(value, "完整改写", "rewrite"), "完整改写", "an unselected rewrite replaces the field");

const diff = inline.buildInlineAiDiff("守卫打开旧门。", "守卫谨慎地打开旧门。");
check(diff.changed, true, "diff marks changed text");
check(diff.removed, "", "insertion diff has no removed text");
check(diff.added, "谨慎地", "diff isolates the added segment");
check(inline.buildInlineAiDiff("相同", "相同").changed, false, "identical text has no diff");

const sources = [
  { id: "world:w", kind: "world", targetId: "w", label: "苍岚纪", detail: "世界摘要", text: "北境战争正在扩大。" },
  { id: "entity:hero", kind: "entity", targetId: "hero", label: "艾琳", detail: "角色", text: "艾琳在寻找失踪的哥哥。", relationReason: "当前场景角色" },
  { id: "entity:city", kind: "entity", targetId: "city", label: "王都", detail: "地点", text: "王都由议会统治。" },
  { id: "entity:secret", kind: "entity", targetId: "secret", label: "排除项", detail: "角色", text: "不应发送" }
];
const ranked = inline.rankInlineAiSources(
  "艾琳寻找哥哥",
  sources,
  "entity:hero",
  [
    { sourceId: "entity:city", pinned: true, priority: 3 },
    { sourceId: "entity:secret", excluded: true }
  ],
  4,
  2000
);
check(ranked[0].source.id, "entity:city", "author-pinned context is ranked first");
check(ranked.some((item) => item.source.id === "entity:hero"), true, "the current object remains in context");
check(ranked.some((item) => item.source.id === "entity:secret"), false, "excluded context is omitted");
check(ranked[0].reasons.includes("作者固定"), true, "ranking explains author pinning");

const memory = writing.normalizeAiMemoryItem(
  {
    id: "memory-goal",
    title: "艾琳目标",
    content: "艾琳要找到哥哥",
    state: "confirmed",
    sourceContextId: "entity:hero",
    fact: { subject: "艾琳", property: "目标", value: "寻找哥哥", temporalScope: "第一幕" }
  },
  "w"
);
const target = {
  worldId: "w",
  kind: "entity",
  objectId: "hero",
  contextId: "entity:hero",
  fieldPath: "summary",
  fieldLabel: "角色摘要",
  format: "plain"
};
const pack = inline.buildInlineAiContextPack({
  currentText: value,
  memories: [memory],
  selection: { start: 0, end: 2 },
  sources,
  target
});
check(pack.selection.text, "艾琳", "context pack preserves the exact selection");
check(pack.memories[0].memory.id, "memory-goal", "relevant long-term memory is recalled");
check(pack.sourceSnapshot.includes("[source:entity:hero]"), true, "source snapshot uses stable citation IDs");
check(pack.memorySnapshot.includes("作者确认"), true, "memory snapshot exposes confirmation state");

const prompt = inline.buildInlineAiPrompt("rewrite", "更克制", pack);
check(prompt.prompt.includes("只修改这个范围"), true, "selection prompt constrains the edit range");
check(prompt.prompt.includes("候选事实保持草稿状态"), true, "prompt separates candidate facts from canon");
check(prompt.systemPrompt.includes("没有依据的内容必须标记为新创作"), true, "prompt requires provenance for factual output");

const parsed = inline.parseInlineAiResponse(
  '```json\n{"text":"艾琳悄然抵达王都。","sourceIds":["entity:hero","made-up"],"memoryIds":["memory-goal"],"newCreation":false,"notes":"保持既有目标","candidateFacts":[{"category":"plot","title":"抵达王都","content":"艾琳抵达王都","subject":"艾琳","property":"位置","value":"王都","temporalScope":"第一幕","sourceQuote":"艾琳悄然抵达王都。","tags":["艾琳","王都","艾琳"]}]}\n```',
  pack.sources.map((item) => item.source.id),
  pack.memories.map((item) => item.memory.id)
);
check(parsed.text, "艾琳悄然抵达王都。", "structured model text is parsed");
check(parsed.sourceIds, ["entity:hero"], "invented source IDs are rejected");
check(parsed.memoryIds, ["memory-goal"], "used memory IDs are retained");
check(parsed.newCreation, false, "sourced output is not forced to new creation");
check(parsed.candidateFacts[0].category, "plot", "candidate facts remain separately typed");
check(parsed.candidateFacts[0].tags, ["艾琳", "王都"], "candidate fact tags are deduplicated");

const fallback = inline.parseInlineAiResponse("普通模型文本", [], []);
check(fallback.text, "普通模型文本", "plain-text fallback remains editable");
check(fallback.newCreation, true, "uncited fallback is marked as new creation");
check(fallback.candidateFacts.length, 0, "fallback cannot invent structured facts");

const workspace = {
  untouched: { value: "preserve" },
  entities: [{ id: "hero", summary: value, content: "<p>正文</p>", templateData: { motive: "旧动机" }, updatedAt: "old" }],
  quests: [{ id: "quest", summary: "旧摘要", trigger: "旧触发", developerNotes: "秘密", steps: [{ objective: "旧目标", condition: "", branch: "", failure: "", reward: "", notes: "" }], updatedAt: "old" }],
  storyScenes: [{ id: "scene", summary: "旧场景", notes: "旧备注", nodes: [{ stageDirection: "旧动作", text: "旧对白", choices: [{ text: "旧选项" }] }], updatedAt: "old" }],
  narrativeMilestones: [{ id: "chapter", summary: "旧提要", developerNotes: "旧备注", manuscriptBody: "<p>旧正文</p>", updatedAt: "old" }]
};
let changed = inline.applyInlineAiWorkspaceChange(workspace, target, "新摘要", "now");
check(changed.ok, true, "whitelisted entity field can be changed");
check(changed.data.entities[0].summary, "新摘要", "entity summary is updated exactly");
check(changed.data.entities[0].content, "<p>正文</p>", "unrelated entity content is preserved");
check(changed.data.untouched, workspace.untouched, "unrelated workspace branches keep identity");
check(workspace.entities[0].summary, value, "workspace application is immutable");

changed = inline.applyInlineAiWorkspaceChange(
  workspace,
  { ...target, kind: "quest", objectId: "quest", contextId: "quest:quest", fieldPath: "steps[0].objective" },
  "新目标",
  "now"
);
check(changed.ok && changed.data.quests[0].steps[0].objective, "新目标", "nested quest step field is updated");
changed = inline.applyInlineAiWorkspaceChange(
  workspace,
  { ...target, kind: "scene", objectId: "scene", contextId: "scene:scene", fieldPath: "nodes[0].choices[0].text" },
  "新选项",
  "now"
);
check(changed.ok && changed.data.storyScenes[0].nodes[0].choices[0].text, "新选项", "nested story choice is updated");
changed = inline.applyInlineAiWorkspaceChange(
  workspace,
  { ...target, kind: "milestone", objectId: "chapter", contextId: "milestone:chapter", fieldPath: "manuscriptBody", format: "rich-text" },
  "<p>新章节正文</p>",
  "now"
);
check(changed.ok && changed.data.narrativeMilestones[0].manuscriptBody, "<p>新章节正文</p>", "chapter manuscript body is updated");
check(
  inline.getInlineAiWorkspaceValue(changed.data, { ...target, kind: "milestone", objectId: "chapter", contextId: "milestone:chapter", fieldPath: "manuscriptBody", format: "rich-text" }).value,
  "<p>新章节正文</p>",
  "chapter manuscript body can be read for conflict-safe AI commits"
);
const denied = inline.applyInlineAiWorkspaceChange(workspace, { ...target, fieldPath: "title" }, "越权标题");
check(denied.ok, false, "non-whitelisted fields are rejected");
check(workspace.entities[0].summary, value, "a rejected edit leaves data unchanged");

const inlineSession = writing.normalizeAiWritingSession(
  {
    ...writing.createAiWritingSession("w", "entity:hero", "内嵌 AI"),
    id: "inline-session",
    inlineEdit: {
      fieldPath: "summary",
      fieldLabel: "角色摘要",
      action: "rewrite",
      instruction: "",
      selectionStart: 0,
      selectionEnd: 2,
      baseText: value,
      resultText: "新摘要",
      appliedText: "新摘要",
      storedBaseText: value,
      storedAppliedText: "新摘要",
      consistencyBeforeCount: 0,
      consistencyAfterCount: 0,
      introducedConsistencyIssues: [],
      sourceContextIds: ["entity:hero"],
      memoryIds: [],
      newCreation: false,
      status: "applied",
      appliedAt: "now",
      revertedAt: ""
    }
  },
  "w"
);
const candidate = writing.normalizeAiMemoryItem(
  {
    id: "candidate",
    state: "draft",
    title: "候选事实",
    sources: [{ id: "candidate-source", kind: "ai-draft", contextId: "entity:hero", contextLabel: "艾琳", writingSessionId: "inline-session", excerpt: "新摘要", capturedAt: "now" }]
  },
  "w"
);
const confirmedCandidate = writing.normalizeAiMemoryItem({ ...candidate, id: "confirmed-candidate", state: "confirmed" }, "w");
const undoWorkspace = {
  ...workspace,
  entities: [{ ...workspace.entities[0], summary: "新摘要" }],
  aiWritingSessions: [inlineSession],
  aiMemoryItems: [candidate, confirmedCandidate]
};
const undone = inline.undoInlineAiWorkspaceChange(undoWorkspace, "inline-session", "later");
check(undone.ok, true, "an applied inline edit can be undone");
check(undone.data.entities[0].summary, value, "undo restores the exact stored field value");
check(undone.data.aiWritingSessions[0].inlineEdit.status, "reverted", "undo marks the edit branch as reverted");
check(undone.removedMemoryIds, ["candidate"], "undo removes only draft facts owned by the edit branch");
check(undone.data.aiMemoryItems.map((item) => item.id), ["confirmed-candidate"], "author-confirmed candidate facts survive undo");
const protectedUndo = inline.undoInlineAiWorkspaceChange(
  { ...undoWorkspace, entities: [{ ...undoWorkspace.entities[0], summary: "作者后续修改" }] },
  "inline-session"
);
check(protectedUndo.ok, false, "undo refuses to overwrite later author edits");
check(protectedUndo.error.includes("保护作者"), true, "protected undo explains why it stopped");

const richSession = writing.normalizeAiWritingSession(
  {
    ...inlineSession,
    id: "rich-session",
    inlineEdit: {
      ...inlineSession.inlineEdit,
      fieldPath: "content",
      fieldLabel: "正文",
      baseText: "旧正文",
      appliedText: "新正文",
      storedBaseText: '<p><strong>旧正文</strong></p>',
      storedAppliedText: '<p><strong>新正文</strong></p>'
    }
  },
  "w"
);
const richUndo = inline.undoInlineAiWorkspaceChange(
  {
    ...workspace,
    entities: [{ ...workspace.entities[0], content: '<p><strong>新正文</strong></p>' }],
    aiWritingSessions: [richSession],
    aiMemoryItems: []
  },
  "rich-session"
);
check(richUndo.ok && richUndo.data.entities[0].content, '<p><strong>旧正文</strong></p>', "rich-text undo restores exact stored HTML");

const largeSources = Array.from({ length: 1200 }, (_, index) => ({
  id: `entity:${index}`,
  kind: "entity",
  targetId: String(index),
  label: `角色 ${index}`,
  detail: "人物",
  text: index === 1199 ? "失落王冠线索由守门人保管。" : `普通背景资料 ${index} ${"设定".repeat(40)}`
}));
const largeRanked = inline.rankInlineAiSources("失落王冠守门人线索", largeSources, "entity:0", [], 8, 24000);
check(largeRanked.some((item) => item.source.id === "entity:1199"), true, "relevant source is recalled from a 100k-plus character project");
check(largeRanked.reduce((sum, item) => sum + item.excerpt.length, 0) <= 24000, true, "large-project context stays inside its character budget");

console.log(`Inline AI checks passed: ${assertions} assertions across 8 scenarios.`);
