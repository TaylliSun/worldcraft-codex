const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");

function loadTypeScriptModule(filePath, localModules = {}) {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    },
    fileName: filePath
  }).outputText;
  const module = { exports: {} };
  const localRequire = (specifier) => localModules[specifier] || require(specifier);
  new Function("require", "module", "exports", output)(localRequire, module, module.exports);
  return module.exports;
}

const story = loadTypeScriptModule(path.join(root, "app", "story.ts"));
const testing = loadTypeScriptModule(path.join(root, "app", "story-testing.ts"), {
  "./story": story
});

const worldId = "world-test";
const keyVariable = {
  id: "variable-key",
  worldId,
  key: "inventory.has_key",
  name: "Has key",
  type: "boolean",
  defaultValue: false,
  description: "",
  updatedAt: "2026-01-01T00:00:00.000Z"
};
const trustVariable = {
  id: "variable-trust",
  worldId,
  key: "character.trust",
  name: "Trust",
  type: "number",
  defaultValue: 0,
  description: "",
  updatedAt: "2026-01-01T00:00:00.000Z"
};
const variables = [keyVariable, trustVariable];

function choice(id, targetNodeId, patch = {}) {
  return {
    id,
    text: id,
    targetNodeId,
    conditions: [],
    effects: [],
    ...patch
  };
}

function node(id, patch = {}) {
  return {
    id,
    label: id,
    speakerEntityId: "",
    text: id,
    stageDirection: "",
    conditions: [],
    effects: [],
    nextNodeId: "",
    choices: [],
    isEnding: false,
    ...patch
  };
}

function scene(id, nodes, entryNodeId = nodes[0]?.id || "") {
  return {
    id,
    worldId,
    title: id,
    summary: "",
    status: "ready",
    entryNodeId,
    relatedEntityIds: [],
    relatedQuestIds: [],
    nodes,
    notes: "",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
}

function preset(id, sceneId, initialState, patch = {}) {
  return {
    id,
    worldId,
    name: id,
    description: "",
    sceneId,
    initialState,
    maxDepth: 24,
    maxPaths: 120,
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...patch
  };
}

const branchScene = scene("scene-branch", [
  node("entry", {
    choices: [
      choice("choice-key", "ending-key", {
        conditions: [
          { id: "condition-key", variableId: keyVariable.id, operator: "equals", value: true }
        ]
      }),
      choice("choice-no-key", "ending-no-key", {
        conditions: [
          { id: "condition-no-key", variableId: keyVariable.id, operator: "equals", value: false }
        ],
        effects: [
          {
            id: "effect-trust",
            variableId: trustVariable.id,
            operation: "increment",
            value: 1
          }
        ]
      })
    ]
  }),
  node("ending-key", { isEnding: true }),
  node("ending-no-key", { isEnding: true })
]);

const noKeyPreset = preset("preset-no-key", branchScene.id, {
  [keyVariable.id]: false,
  [trustVariable.id]: 0
});
const noKeyAnalysis = testing.analyzeStoryScene(branchScene, variables, noKeyPreset);
assert.equal(noKeyAnalysis.coverage.nodePercent, 67);
assert.equal(noKeyAnalysis.coverage.choicePercent, 50);
assert.equal(noKeyAnalysis.coverage.endingPercent, 50);
assert.equal(noKeyAnalysis.paths.some((item) => item.endingNodeId === "ending-no-key"), true);
assert.equal(noKeyAnalysis.findings.some((item) => item.kind === "choice-blocked"), true);

const keyPreset = preset("preset-key", branchScene.id, {
  [keyVariable.id]: true,
  [trustVariable.id]: 0
});
const keyAnalysis = testing.analyzeStoryScene(branchScene, variables, keyPreset);
assert.equal(keyAnalysis.paths.some((item) => item.endingNodeId === "ending-key"), true);
assert.equal(testing.createAutomaticStoryTestRun(worldId, keyAnalysis).status, "passed");

let manualSession = testing.startStoryManualSession(
  branchScene,
  variables,
  noKeyPreset.initialState
);
assert.equal(manualSession.status, "running");
manualSession = testing.advanceStoryManualSession(
  manualSession,
  branchScene,
  variables,
  "choice-no-key"
);
assert.equal(manualSession.status, "ending");
assert.equal(manualSession.state[trustVariable.id], 1);
const manualRun = testing.createManualStoryTestRun(
  worldId,
  noKeyPreset.id,
  branchScene,
  manualSession,
  "passed",
  "Manual route passed"
);
assert.equal(manualRun.coverage.nodePercent, 67);
assert.equal(manualRun.finalState[trustVariable.id], 1);

const loopScene = scene("scene-loop", [node("loop", { nextNodeId: "loop" })]);
const loopAnalysis = testing.analyzeStoryScene(loopScene, variables);
assert.equal(loopAnalysis.findings.some((item) => item.kind === "loop"), true);
assert.equal(loopAnalysis.paths.some((item) => item.outcome === "loop"), true);

const blockedScene = scene("scene-blocked", [
  node("blocked-entry", {
    choices: [
      choice("locked-choice", "blocked-ending", {
        conditions: [
          { id: "locked-condition", variableId: keyVariable.id, operator: "equals", value: true }
        ]
      })
    ]
  }),
  node("blocked-ending", { isEnding: true })
]);
const blockedAnalysis = testing.analyzeStoryScene(blockedScene, variables, noKeyPreset);
assert.equal(blockedAnalysis.findings.some((item) => item.kind === "no-available-choice"), true);
assert.equal(testing.createAutomaticStoryTestRun(worldId, blockedAnalysis).status, "blocked");

const depthNodes = [
  node("depth-entry", {
    choices: [choice("deep-route", "deep-1"), choice("short-route", "short-ending")]
  }),
  node("deep-1", { nextNodeId: "deep-2" }),
  node("deep-2", { nextNodeId: "deep-3" }),
  node("deep-3", { nextNodeId: "deep-4" }),
  node("deep-4", { nextNodeId: "deep-5" }),
  node("deep-5", { nextNodeId: "deep-ending" }),
  node("deep-ending", { isEnding: true }),
  node("short-ending", { isEnding: true })
];
const depthScene = scene("scene-depth", depthNodes);
const depthAnalysis = testing.analyzeStoryScene(
  depthScene,
  variables,
  preset("preset-depth", depthScene.id, {}, { maxDepth: 4 })
);
assert.equal(depthAnalysis.truncated, true);
assert.equal(depthAnalysis.findings.some((item) => item.kind === "depth-limit"), true);
assert.equal(depthAnalysis.coverage.coveredEndingNodeIds.includes("short-ending"), true);

const pathLimitEndings = Array.from({ length: 12 }, (_, index) =>
  node(`path-ending-${index + 1}`, { isEnding: true })
);
const pathLimitScene = scene("scene-path-limit", [
  node("path-entry", {
    choices: pathLimitEndings.map((item, index) =>
      choice(`path-choice-${index + 1}`, item.id)
    )
  }),
  ...pathLimitEndings
]);
const pathLimitAnalysis = testing.analyzeStoryScene(
  pathLimitScene,
  variables,
  preset("preset-path-limit", pathLimitScene.id, {}, { maxPaths: 10 })
);
assert.equal(pathLimitAnalysis.paths.length, 10);
assert.equal(pathLimitAnalysis.truncated, true);
assert.equal(pathLimitAnalysis.findings.some((item) => item.kind === "path-limit"), true);

const invalidScene = scene("scene-invalid", [
  node("invalid-entry", {
    conditions: [
      {
        id: "invalid-operator",
        variableId: keyVariable.id,
        operator: "greaterThan",
        value: true
      },
      {
        id: "missing-variable",
        variableId: "variable-missing",
        operator: "equals",
        value: true
      }
    ],
    effects: [
      {
        id: "invalid-value",
        variableId: trustVariable.id,
        operation: "increment",
        value: true
      }
    ],
    isEnding: true
  })
]);
const invalidAnalysis = testing.analyzeStoryScene(invalidScene, variables);
assert.equal(invalidAnalysis.findings.some((item) => item.kind === "operator-type"), true);
assert.equal(invalidAnalysis.findings.some((item) => item.kind === "missing-variable"), true);
assert.equal(invalidAnalysis.findings.some((item) => item.kind === "variable-type"), true);

const typeFinding = invalidAnalysis.findings.find((item) => item.kind === "variable-type");
const issue = testing.createIssueFromFinding(worldId, typeFinding, "preset-invalid");
assert.equal(issue.severity, "major");
assert.equal(issue.source, "analysis");
assert.equal(issue.sceneId, invalidScene.id);

const report = testing.buildStoryTestReportMarkdown({
  worldName: "Test World",
  scene: branchScene,
  variables,
  preset: noKeyPreset,
  analysis: noKeyAnalysis,
  issues: [{ ...issue, sceneId: branchScene.id }]
});
assert.match(report, /Test World/);
assert.match(report, /scene-branch/);
assert.match(report, /67%/);
assert.match(report, new RegExp(issue.title));

const normalizedPreset = testing.normalizeStoryTestPreset(
  {
    name: "  ",
    maxDepth: 1,
    maxPaths: 999,
    initialState: { good: 3, bad: null }
  },
  worldId
);
assert.equal(normalizedPreset.name.length > 0, true);
assert.equal(normalizedPreset.maxDepth, 4);
assert.equal(normalizedPreset.maxPaths, 500);
assert.deepEqual(normalizedPreset.initialState, { good: 3 });

const normalizedRun = testing.normalizeStoryTestRun(
  { findingKinds: ["loop", "not-a-finding"] },
  worldId
);
assert.deepEqual(normalizedRun.findingKinds, ["loop"]);
const normalizedIssue = testing.normalizeStoryReviewIssue(
  { sourceFindingKind: "not-a-finding" },
  worldId
);
assert.equal(normalizedIssue.sourceFindingKind, "");

console.log("Story testing domain checks passed: 37 assertions across 9 scenarios.");
