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

const { normalizeAiMemoryItem } = require(path.join(__dirname, "..", "app", "ai-writing.ts"));
const {
  buildHybridMemoryBundle,
  rankHybridProjectSources
} = require(path.join(__dirname, "..", "app", "ai-hybrid-memory.ts"));

const memory = normalizeAiMemoryItem({
  id: "memory-brother",
  title: "哥哥下落",
  content: "序章阶段仍未确认艾琳哥哥的位置",
  state: "confirmed",
  pinned: true,
  fact: {
    subject: "艾琳的哥哥",
    property: "当前位置",
    value: "未知",
    temporalScope: "序章"
  },
  tags: ["艾琳", "哥哥", "悬念"]
}, "world-test");

const sources = [
  {
    id: "manuscript-chapter:current",
    kind: "manuscript-chapter",
    label: "第一章 风雪来信",
    detail: "章节正文",
    text: "艾琳在当前章节打开哥哥留下的信。"
  },
  {
    id: "entity:ailin",
    kind: "entity",
    label: "艾琳",
    detail: "人物",
    text: "艾琳是银盔骑士，正在追查哥哥失踪与黑塔议会之间的关系。"
  },
  {
    id: "quest:brother",
    kind: "quest",
    label: "失踪哥哥的线索",
    detail: "任务线",
    text: "玩家帮助艾琳调查黑塔档案，但序章不能确认哥哥所在的位置。"
  },
  {
    id: "manuscript-volume:one",
    kind: "manuscript-volume",
    label: "第一卷",
    detail: "卷级上下文",
    text: "玩家帮助艾琳调查黑塔档案，但序章不能确认哥哥所在的位置。"
  },
  {
    id: "entity:baker",
    kind: "entity",
    label: "面包师",
    detail: "人物",
    text: "面包师每天清晨烘烤麦饼。"
  }
];

const ranked = rankHybridProjectSources(
  "艾琳追查哥哥失踪，黑塔的线索不能过早揭晓",
  sources,
  "manuscript-chapter:current",
  8
);
assert.equal(ranked[0].source.id, "entity:ailin");
assert.ok(ranked.some((item) => item.source.id === "quest:brother"));
assert.equal(ranked.some((item) => item.source.id === "manuscript-chapter:current"), false);
assert.equal(ranked.filter((item) => item.excerpt.includes("玩家帮助艾琳调查黑塔档案")).length, 1);
assert.ok(ranked[0].reasons.some((item) => item.includes("标题明确提及")));
assert.ok(ranked[0].score > 0);

const withoutSemantic = rankHybridProjectSources(
  "艾琳 黑塔",
  sources,
  "manuscript-chapter:current",
  4,
  { semantic: false }
);
assert.equal(withoutSemantic[0].semanticSimilarity, 0);
assert.ok(withoutSemantic.some((item) => item.source.id === "entity:ailin"));

const bundle = buildHybridMemoryBundle({
  query: "艾琳追查哥哥失踪，黑塔的线索不能过早揭晓",
  memories: [memory],
  sources,
  targetContextId: "manuscript-chapter:current",
  characterBudget: 8_000
});
assert.equal(bundle.memories.length, 1);
assert.ok(bundle.projectSources.length >= 2);
assert.match(bundle.snapshot, /【作者长期记忆】/);
assert.match(bundle.snapshot, /哥哥下落/);
assert.match(bundle.snapshot, /【项目原文召回】/);
assert.match(bundle.snapshot, /entity:ailin/);
assert.equal(bundle.characters, bundle.snapshot.length);
assert.ok(bundle.characters <= 8_000);

const empty = buildHybridMemoryBundle({
  query: "完全无关的占位查询",
  memories: [],
  sources: [],
  targetContextId: "none"
});
assert.equal(empty.snapshot, "");
assert.deepEqual(empty.projectSources, []);

console.log("AI hybrid memory checks passed: 18 assertions across project recall, memory authority, deduplication, exclusion, and budgets.");
