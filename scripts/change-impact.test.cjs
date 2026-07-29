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

const { buildChangeImpactReport } = require(path.join(__dirname, "..", "app", "change-impact.ts"));

function ref(id, sourceKind, sourceId, sourceLabel, targetKind, targetId, role, field) {
  return {
    id,
    worldId: "world-test",
    source: { kind: sourceKind, id: sourceId },
    sourceLabel,
    target: { kind: targetKind, id: targetId },
    targetLabel: targetId,
    role,
    anchor: { field, path: field, start: null, end: null, excerpt: "" }
  };
}

const references = [
  ref("r1", "manuscript-chapter", "chapter-1", "第一章", "entity", "hero", "mention", "正文"),
  ref("r2", "manuscript-chapter", "chapter-1", "第一章", "entity", "hero", "association", "相关人物"),
  ref("r3", "quest", "quest-1", "寻找遗剑", "entity", "hero", "association", "关联条目"),
  ref("r4", "milestone", "milestone-1", "序章收束", "quest", "quest-1", "association", "关联任务"),
  ref("r5", "manuscript-chapter", "chapter-2", "第二章", "milestone", "milestone-1", "association", "制作节点"),
  ref("r6", "entity", "hero", "主角", "manuscript-chapter", "chapter-2", "mention", "正文"),
  ref("r7", "map-marker", "marker-1", "出生地标记", "entity", "hero", "association", "关联条目")
];

const report = buildChangeImpactReport(
  { references, problems: [] },
  { kind: "entity", id: "hero" },
  "主角",
  3
);

assert.equal(report.total, 5);
assert.equal(report.direct, 3);
assert.equal(report.downstream, 2);
assert.equal(report.maximumDepth, 3);
assert.deepEqual(report.counts, { manuscript: 2, story: 1, quest: 1, world: 1 });
assert.deepEqual(report.levels, { critical: 1, high: 2, normal: 2 });

const firstChapter = report.items.find((item) => item.target.id === "chapter-1");
assert.ok(firstChapter);
assert.equal(firstChapter.depth, 1);
assert.equal(firstChapter.level, "critical");
assert.equal(firstChapter.domain, "manuscript");
assert.equal(firstChapter.references.length, 2);
assert.match(firstChapter.reason, /2 处/);
assert.deepEqual(firstChapter.pathLabels, ["主角", "第一章"]);

const downstreamChapter = report.items.find((item) => item.target.id === "chapter-2");
assert.ok(downstreamChapter);
assert.equal(downstreamChapter.depth, 3);
assert.equal(downstreamChapter.level, "high");
assert.deepEqual(downstreamChapter.pathLabels, ["主角", "寻找遗剑", "序章收束", "第二章"]);
assert.equal(report.items.some((item) => item.target.id === "hero"), false, "cycles do not re-add the root target");

const shallow = buildChangeImpactReport(
  { references, problems: [] },
  { kind: "entity", id: "hero" },
  "主角",
  2
);
assert.equal(shallow.total, 4);
assert.equal(shallow.maximumDepth, 2);
assert.equal(shallow.items.some((item) => item.target.id === "chapter-2"), false);

const empty = buildChangeImpactReport(
  { references: [], problems: [] },
  { kind: "entity", id: "unused" },
  "无人引用"
);
assert.equal(empty.total, 0);
assert.deepEqual(empty.counts, { manuscript: 0, story: 0, quest: 0, world: 0 });

console.log("Change impact checks passed: 22 assertions across direct, downstream, grouped, cyclic, and empty graphs.");
