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

const production = loadModule(path.join(__dirname, "..", "app", "narrative-production.ts"));
const {
  createNarrativeMilestone,
  findNarrativeCriticalPath,
  findNarrativeDependencyCycles,
  getNarrativeCoverage,
  moveNarrativeMilestone,
  normalizeNarrativeMilestone,
  resequenceNarrativeMilestones,
  sortNarrativeMilestones,
  validateNarrativeMilestones
} = production;

function milestone(id, order, patch = {}) {
  return {
    ...createNarrativeMilestone(
      "world-a",
      order,
      `Milestone ${id}`,
      "2026-07-12T05:00:00.000Z",
      id
    ),
    ...patch
  };
}

const references = {
  questIds: new Set(["quest-a", "quest-b"]),
  sceneIds: new Set(["scene-a", "scene-b"]),
  entityIds: new Set(["entity-a"]),
  timelineEventIds: new Set(["timeline-a"]),
  mapMarkerIds: new Set(["marker-a"]),
  reviewIssueIds: new Set(["issue-a"])
};

const normalized = normalizeNarrativeMilestone(
  {
    id: " milestone-a ",
    worldId: "wrong-world",
    title: "  Opening  ",
    act: "",
    status: "invalid",
    priority: "invalid",
    order: -4,
    manuscriptBody: "<p>第一章正文</p>",
    dependencyIds: ["m-1", "m-1", "", "  m-2  "],
    linkedQuestIds: ["quest-a", "quest-a"]
  },
  "world-a",
  3
);
assert.equal(normalized.id, "milestone-a");
assert.equal(normalized.worldId, "world-a");
assert.equal(normalized.title, "Opening");
assert.equal(normalized.act, "未分幕");
assert.equal(normalized.status, "planned");
assert.equal(normalized.priority, "normal");
assert.equal(normalized.order, 0);
assert.equal(normalized.manuscriptBody, "<p>第一章正文</p>");
assert.deepEqual(normalized.dependencyIds, ["m-1", "m-2"]);
assert.deepEqual(normalized.linkedQuestIds, ["quest-a"]);
assert.equal(createNarrativeMilestone("world-a", 0).manuscriptBody, "");

const unsorted = [
  milestone("b", 2, { priority: "low" }),
  milestone("c", 1, { priority: "normal" }),
  milestone("a", 1, { priority: "critical" })
];
assert.deepEqual(sortNarrativeMilestones(unsorted).map((item) => item.id), ["a", "c", "b"]);
const resequenced = resequenceNarrativeMilestones(unsorted, ["b", "a", "c"]);
assert.deepEqual(resequenced.map((item) => item.id), ["b", "a", "c"]);
assert.deepEqual(resequenced.map((item) => item.order), [0, 1, 2]);

const moved = moveNarrativeMilestone(
  [milestone("a", 0), milestone("b", 1), milestone("c", 2, { status: "drafting" })],
  "b",
  "drafting",
  "c"
);
assert.deepEqual(moved.map((item) => item.id), ["a", "b", "c"]);
assert.equal(moved[1].status, "drafting");
assert.deepEqual(moved.map((item) => item.order), [0, 1, 2]);
assert.strictEqual(moveNarrativeMilestone(moved, "missing", "done"), moved);

const graph = [
  milestone("a", 0),
  milestone("b", 1, { dependencyIds: ["a"] }),
  milestone("c", 2, { dependencyIds: ["b"] }),
  milestone("d", 3, { dependencyIds: ["a"] })
];
assert.deepEqual(findNarrativeDependencyCycles(graph), []);
assert.deepEqual(findNarrativeCriticalPath(graph), ["a", "b", "c"]);

const cyclic = [
  milestone("a", 0, { dependencyIds: ["c"] }),
  milestone("b", 1, { dependencyIds: ["a"] }),
  milestone("c", 2, { dependencyIds: ["b"] })
];
assert.deepEqual(findNarrativeDependencyCycles(cyclic), [["a", "c", "b", "a"]]);
assert.deepEqual(findNarrativeCriticalPath(cyclic), []);

const broken = [
  milestone("duplicate", 0, {
    title: "",
    status: "blocked",
    dependencyIds: ["duplicate", "missing-dependency"],
    linkedQuestIds: ["missing-quest"],
    linkedSceneIds: ["missing-scene"]
  }),
  milestone("duplicate", 1, { status: "ready" })
];
const issues = validateNarrativeMilestones(broken, references);
assert.equal(issues.some((issue) => issue.code === "duplicate-id"), true);
assert.equal(issues.some((issue) => issue.code === "missing-title"), true);
assert.equal(issues.some((issue) => issue.code === "self-dependency"), true);
assert.equal(issues.some((issue) => issue.code === "missing-dependency"), true);
assert.equal(issues.filter((issue) => issue.code === "broken-reference").length, 2);
assert.equal(issues.some((issue) => issue.code === "blocked-without-reason"), true);
assert.equal(issues.some((issue) => issue.code === "ready-without-content"), true);

const valid = [
  milestone("a", 0, {
    linkedQuestIds: ["quest-a"],
    linkedSceneIds: ["scene-a"],
    linkedEntityIds: ["entity-a"],
    linkedTimelineEventIds: ["timeline-a"],
    linkedMapMarkerIds: ["marker-a"],
    linkedReviewIssueIds: ["issue-a"]
  }),
  milestone("b", 1, {
    status: "done",
    dependencyIds: ["a"],
    linkedQuestIds: ["quest-b"],
    linkedSceneIds: ["scene-b"]
  })
];
assert.deepEqual(validateNarrativeMilestones(valid, references), []);
const coverage = getNarrativeCoverage(valid, ["quest-a", "quest-b", "quest-c"], ["scene-a", "scene-b", "scene-c"]);
assert.equal(coverage.total, 2);
assert.equal(coverage.completed, 1);
assert.equal(coverage.blocked, 0);
assert.equal(coverage.completionPercent, 50);
assert.equal(coverage.linkedQuestCount, 2);
assert.equal(coverage.linkedSceneCount, 2);
assert.deepEqual(coverage.unlinkedQuestIds, ["quest-c"]);
assert.deepEqual(coverage.unlinkedSceneIds, ["scene-c"]);

console.log("Narrative production checks passed: 38 assertions across 7 scenarios.");
