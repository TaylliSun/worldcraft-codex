const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function loadModule(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", output)(require, module, module.exports);
  return module.exports;
}

async function main() {
  const writing = loadModule(path.join(__dirname, "..", "app", "ai-writing.ts"));
  const session = writing.createAiWritingSession("world-a", "scene:scene-a", "序章写作");
  assert.equal(session.worldId, "world-a");
  assert.equal(session.targetContextId, "scene:scene-a");
  assert.equal(session.rounds.length, 0);

  const memories = [
    writing.normalizeAiMemoryItem({ id: "m1", title: "艾琳目标", content: "艾琳要寻找哥哥", state: "confirmed", fact: { subject: "艾琳", property: "目标", value: "寻找哥哥", temporalScope: "序章" }, tags: ["艾琳", "主线"], sources: [{ id: "src-1", kind: "project", contextId: "scene:scene-a", contextLabel: "序章", writingSessionId: "", excerpt: "艾琳决定寻找失踪的哥哥。", capturedAt: "2026-07-13T00:00:00.000Z" }] }, "world-a"),
    writing.normalizeAiMemoryItem({ id: "m2", title: "王都天气", content: "王都今天下雨" }, "world-a"),
    writing.normalizeAiMemoryItem({ id: "m3", title: "序章规则", content: "序章不能揭露哥哥身份", pinned: true }, "world-a")
  ];
  const ranked = writing.rankAiMemories("艾琳寻找哥哥的序章", memories, "scene:scene-a", 2);
  assert.deepEqual(ranked.map((item) => item.id), ["m1", "m3"]);
  assert.equal(writing.buildMemorySnapshot(ranked).includes("作者确认"), true);
  assert.equal(writing.buildMemorySnapshot(ranked).includes("置顶"), true);
  assert.equal(writing.buildMemorySnapshot(memories).includes("艾琳 · 目标 = 寻找哥哥"), true);
  assert.equal(writing.buildMemorySnapshot(memories).includes("来源：序章"), true);
  const matches = writing.rankAiMemoryMatches("艾琳的主线目标", memories, "scene:scene-a", 3);
  assert.equal(matches[0].memory.id, "m1");
  assert.equal(matches[0].reasons.includes("同一项目目标"), true);
  assert.equal(matches[0].reasons.includes("作者确认"), true);
  assert.equal(matches[0].sourceLabel, "序章");
  assert.equal(matches[0].authority, "confirmed");

  const semanticMemory = writing.normalizeAiMemoryItem({
    id: "semantic-death",
    title: "北境噩耗",
    content: "艾琳哥哥已经阵亡",
    sources: [{
      id: "semantic-source",
      kind: "project",
      contextId: "scene:report",
      contextLabel: "北境战报",
      writingSessionId: "",
      excerpt: "哥哥已经阵亡。",
      capturedAt: "2026-07-13T00:00:00.000Z"
    }]
  }, "world-a");
  const semanticMatches = writing.rankAiMemoryMatches(
    "那位少女的兄长去世了吗",
    [semanticMemory],
    "scene:scene-a",
    3
  );
  assert.equal(semanticMatches[0].memory.id, "semantic-death");
  assert.equal(semanticMatches[0].semanticSimilarity > 0, true);
  assert.equal(semanticMatches[0].reasons.some((reason) => reason.startsWith("语义相近")), true);
  assert.equal(semanticMatches[0].sourceLabel, "北境战报");
  assert.equal(semanticMatches[0].authority, "draft");
  assert.equal(writing.rankAiMemoryMatches(
    "那位少女的兄长去世了吗",
    [semanticMemory],
    "scene:scene-a",
    3,
    { semantic: false }
  ).length, 0);
  const excludedSemanticMemory = writing.normalizeAiMemoryItem({
    ...semanticMemory,
    excludedContextIds: ["scene:scene-a", "scene:scene-a"]
  }, "world-a");
  assert.deepEqual(excludedSemanticMemory.excludedContextIds, ["scene:scene-a"]);
  assert.equal(writing.rankAiMemoryMatches("兄长去世", [excludedSemanticMemory], "scene:scene-a", 3).length, 0);
  assert.equal(writing.rankAiMemoryMatches("兄长去世", [excludedSemanticMemory], "scene:scene-b", 3).length, 1);

  const draft = "艾琳走进雾鸦堡。她立刻知道哥哥就在黑塔。";
  const review = writing.parseAiReviewPayload(
    '```json\n{"summary":"过早揭示","suggestions":[{"quote":"她立刻知道哥哥就在黑塔。","replacement":"她只在黑塔徽记上认出哥哥留下的划痕。","reason":"保留悬念","severity":"important"},{"quote":"不存在","replacement":"忽略","reason":"无法定位"}],"memories":[{"category":"open-loop","title":"哥哥下落","content":"序章仍未确认哥哥的位置","subject":"哥哥","property":"当前位置","value":"未知","temporalScope":"序章","sourceQuote":"艾琳走进雾鸦堡。","tags":["哥哥","伏笔","哥哥"]}]}\n```',
    draft
  );
  assert.equal(review.summary, "过早揭示");
  assert.equal(review.suggestions.length, 1);
  assert.equal(review.memories[0].category, "open-loop");
  assert.equal(review.memories[0].subject, "哥哥");
  assert.equal(review.memories[0].sourceQuote, "艾琳走进雾鸦堡。");
  assert.deepEqual(review.memories[0].tags, ["哥哥", "伏笔"]);
  const suggestion = { ...review.suggestions[0], id: "s1", status: "open" };
  const applied = writing.applyAiEditSuggestion(draft, suggestion);
  assert.equal(applied.includes("哥哥留下的划痕"), true);
  assert.equal(writing.applyAiEditSuggestion("已被作者修改", suggestion), null);

  const normalized = writing.normalizeAiWritingSession(
    { ...session, draft, rounds: [{ id: "r1", kind: "draft", model: "smart", content: draft, memorySnapshot: "snapshot", createdAt: "2026-07-13T00:00:00.000Z" }] },
    "world-a"
  );
  assert.equal(normalized.rounds[0].memorySnapshot, "snapshot");
  assert.equal(normalized.draft, draft);
  assert.equal(normalized.semanticRecallEnabled, true);
  assert.equal(
    writing.normalizeAiWritingSession({ ...session, semanticRecallEnabled: false }, "world-a").semanticRecallEnabled,
    false
  );
  const inlineSession = writing.normalizeAiWritingSession(
    {
      ...session,
      inlineEdit: {
        fieldPath: "nodes[0].text",
        fieldLabel: "对白",
        action: "rewrite",
        instruction: "更克制",
        selectionStart: 1,
        selectionEnd: 4,
        baseText: "旧对白",
        resultText: "新对白",
        appliedText: "新对白",
        storedBaseText: "<p>旧对白</p>",
        storedAppliedText: "<p>新对白</p>",
        consistencyBeforeCount: 2,
        consistencyAfterCount: 3,
        introducedConsistencyIssues: [{ fingerprint: "issue-1", severity: "major", title: "新增冲突", detail: "详情", suggestion: "修复" }],
        sourceContextIds: ["scene:scene-a", "scene:scene-a"],
        memoryIds: ["m1"],
        newCreation: false,
        status: "applied",
        appliedAt: "2026-07-13T00:00:00.000Z",
        revertedAt: ""
      }
    },
    "world-a"
  );
  assert.equal(inlineSession.inlineEdit.fieldPath, "nodes[0].text");
  assert.deepEqual(inlineSession.inlineEdit.sourceContextIds, ["scene:scene-a"]);
  assert.equal(inlineSession.inlineEdit.storedBaseText, "<p>旧对白</p>");
  assert.equal(inlineSession.inlineEdit.storedAppliedText, "<p>新对白</p>");
  assert.equal(inlineSession.inlineEdit.consistencyBeforeCount, 2);
  assert.equal(inlineSession.inlineEdit.introducedConsistencyIssues[0].title, "新增冲突");

  const legacy = writing.normalizeAiMemoryItem(
    { id: "legacy", sourceContextId: "entity:old", title: "旧记忆", content: "旧版内容" },
    "world-a"
  );
  assert.equal(legacy.sources.length, 1);
  assert.equal(legacy.sources[0].kind, "imported");
  assert.equal(legacy.sources[0].contextId, "entity:old");
  assert.deepEqual(legacy.fact, { subject: "", property: "", value: "", temporalScope: "" });

  const conflicting = [
    writing.normalizeAiMemoryItem({ id: "location-a", title: "艾琳在王都", state: "confirmed", fact: { subject: "艾琳", property: "当前位置", value: "王都", temporalScope: "第三章" } }, "world-a"),
    writing.normalizeAiMemoryItem({ id: "location-b", title: "艾琳在雾鸦堡", state: "confirmed", fact: { subject: "艾琳", property: "当前位置", value: "雾鸦堡", temporalScope: "第三章" } }, "world-a"),
    writing.normalizeAiMemoryItem({ id: "location-c", title: "艾琳第四章位置", state: "confirmed", fact: { subject: "艾琳", property: "当前位置", value: "黑塔", temporalScope: "第四章" } }, "world-a"),
    writing.normalizeAiMemoryItem({ id: "lead", title: "可能在北境", category: "open-loop", fact: { subject: "艾琳", property: "当前位置", value: "北境", temporalScope: "第三章" } }, "world-a")
  ];
  let conflicts = writing.detectAiMemoryConflicts(conflicting);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].kind, "fact-value");
  assert.equal(conflicts[0].severity, "important");
  assert.equal(conflicts[0].summary.includes("王都"), true);
  assert.equal(conflicts[0].summary.includes("雾鸦堡"), true);
  const ignored = writing.normalizeAiMemoryItem({ ...conflicting[0], ignoredConflictIds: [conflicts[0].id] }, "world-a");
  assert.equal(writing.detectAiMemoryConflicts([ignored, ...conflicting.slice(1)]).length, 0);
  const superseded = writing.normalizeAiMemoryItem({ ...conflicting[1], state: "superseded" }, "world-a");
  assert.equal(writing.detectAiMemoryConflicts([conflicting[0], superseded]).length, 0);
  assert.equal(writing.rankAiMemories("雾鸦堡", [superseded], "scene:scene-a", 5).length, 0);

  const declaredLeft = writing.normalizeAiMemoryItem({ id: "declared-a", title: "王座规则", state: "confirmed", relations: [{ id: "rel-1", kind: "contradicts", targetMemoryId: "declared-b", note: "两条王位继承规则不能同时成立", createdAt: "2026-07-13T00:00:00.000Z" }] }, "world-a");
  const declaredRight = writing.normalizeAiMemoryItem({ id: "declared-b", title: "旧王令", state: "draft" }, "world-a");
  conflicts = writing.detectAiMemoryConflicts([declaredLeft, declaredRight]);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].kind, "declared");
  assert.equal(conflicts[0].severity, "normal");
  assert.equal(conflicts[0].summary, "两条王位继承规则不能同时成立");

  console.log("AI writing memory checks passed: 50 assertions across 11 scenarios.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
