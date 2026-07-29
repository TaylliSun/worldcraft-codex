import {
  applyStoryEffects,
  coerceStoryValue,
  createInitialStoryState,
  createStoryId,
  storyConditionOperatorsForType,
  storyConditionsPass,
  storyEffectOperationsForType
} from "./story";
import type {
  DialogueChoice,
  DialogueNode,
  StoryCondition,
  StoryEffect,
  StoryScene,
  StoryState,
  StoryValue,
  StoryVariable,
  StoryVariableType
} from "./story";

export type StoryTestPreset = {
  id: string;
  worldId: string;
  name: string;
  description: string;
  sceneId: string;
  initialState: StoryState;
  maxDepth: number;
  maxPaths: number;
  updatedAt: string;
};

export type StoryTestRunMode = "manual" | "automatic";
export type StoryTestRunStatus = "passed" | "failed" | "blocked";
export type StoryTestPathOutcome =
  | "ending"
  | "blocked"
  | "dead-end"
  | "loop"
  | "limit"
  | "merged";

export type StoryTestFindingKind =
  | "missing-variable"
  | "variable-type"
  | "operator-type"
  | "operation-type"
  | "entry-blocked"
  | "node-blocked"
  | "choice-blocked"
  | "missing-target"
  | "no-available-choice"
  | "dead-end"
  | "loop"
  | "depth-limit"
  | "path-limit"
  | "no-ending"
  | "uncovered-node"
  | "uncovered-choice"
  | "uncovered-ending";

const storyTestFindingKinds = new Set<StoryTestFindingKind>([
  "missing-variable",
  "variable-type",
  "operator-type",
  "operation-type",
  "entry-blocked",
  "node-blocked",
  "choice-blocked",
  "missing-target",
  "no-available-choice",
  "dead-end",
  "loop",
  "depth-limit",
  "path-limit",
  "no-ending",
  "uncovered-node",
  "uncovered-choice",
  "uncovered-ending"
]);

function isStoryTestFindingKind(value: unknown): value is StoryTestFindingKind {
  return (
    typeof value === "string" &&
    storyTestFindingKinds.has(value as StoryTestFindingKind)
  );
}

export type StoryTestFinding = {
  id: string;
  kind: StoryTestFindingKind;
  severity: "error" | "warning" | "info";
  title: string;
  detail: string;
  sceneId: string;
  nodeId?: string;
  choiceId?: string;
  variableId?: string;
};

export type StoryTestPath = {
  id: string;
  outcome: StoryTestPathOutcome;
  nodeIds: string[];
  choiceIds: string[];
  endingNodeId: string;
  finalState: StoryState;
  detail: string;
};

export type StoryTestCoverage = {
  nodeIds: string[];
  coveredNodeIds: string[];
  choiceIds: string[];
  coveredChoiceIds: string[];
  endingNodeIds: string[];
  coveredEndingNodeIds: string[];
  nodePercent: number;
  choicePercent: number;
  endingPercent: number;
};

export type StoryTestAnalysis = {
  id: string;
  sceneId: string;
  presetId: string;
  initialState: StoryState;
  coverage: StoryTestCoverage;
  findings: StoryTestFinding[];
  paths: StoryTestPath[];
  exploredStates: number;
  truncated: boolean;
  generatedAt: string;
};

export type StoryTestRun = {
  id: string;
  worldId: string;
  presetId: string;
  sceneId: string;
  mode: StoryTestRunMode;
  status: StoryTestRunStatus;
  nodeIds: string[];
  choiceIds: string[];
  endingNodeId: string;
  initialState: StoryState;
  finalState: StoryState;
  coverage: StoryTestCoverage;
  findingKinds: StoryTestFindingKind[];
  notes: string;
  executedAt: string;
};

export type StoryReviewIssueSeverity = "critical" | "major" | "minor";
export type StoryReviewIssueStatus = "open" | "resolved";
export type StoryReviewIssueSource = "manual" | "analysis" | "consistency";

export type StoryReviewIssue = {
  id: string;
  worldId: string;
  title: string;
  detail: string;
  severity: StoryReviewIssueSeverity;
  status: StoryReviewIssueStatus;
  source: StoryReviewIssueSource;
  sourceFindingKind: StoryTestFindingKind | "";
  presetId: string;
  runId: string;
  sceneId: string;
  nodeId: string;
  entityId: string;
  questId: string;
  consistencyFindingId: string;
  consistencyRuleId: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string;
};

export type StoryManualSession = {
  sceneId: string;
  initialState: StoryState;
  state: StoryState;
  currentNodeId: string;
  nodeIds: string[];
  choiceIds: string[];
  endingNodeId: string;
  status: "idle" | "running" | "ending" | "blocked";
  message: string;
};

type StoryAnalysisOptions = {
  maxDepth?: number;
  maxPaths?: number;
  maxNodeVisits?: number;
};

const emptyCoverage: StoryTestCoverage = {
  nodeIds: [],
  coveredNodeIds: [],
  choiceIds: [],
  coveredChoiceIds: [],
  endingNodeIds: [],
  coveredEndingNodeIds: [],
  nodePercent: 0,
  choicePercent: 100,
  endingPercent: 0
};

function clampInteger(value: unknown, fallback: number, minimum: number, maximum: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.round(parsed)));
}

function isStoryValue(value: unknown): value is StoryValue {
  return (
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    typeof value === "string"
  );
}

export function sanitizeStoryState(value: unknown): StoryState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, StoryValue] =>
      isStoryValue(entry[1])
    )
  );
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function percentage(covered: number, total: number, emptyValue = 0) {
  if (!total) return emptyValue;
  return Math.round((covered / total) * 100);
}

function valueMatchesType(type: StoryVariableType, value: StoryValue) {
  if (type === "boolean") return typeof value === "boolean";
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === "string";
}

export function createStoryTestPreset(
  worldId: string,
  variables: StoryVariable[],
  sceneId = "",
  name = "默认剧情测试"
): StoryTestPreset {
  return {
    id: createStoryId("test-preset"),
    worldId,
    name,
    description: "为场景准备初始变量，并自动检查所有可行分支。",
    sceneId,
    initialState: createInitialStoryState(variables),
    maxDepth: 24,
    maxPaths: 120,
    updatedAt: new Date().toISOString()
  };
}

export function normalizeStoryTestPreset(
  input: Partial<StoryTestPreset>,
  fallbackWorldId: string
): StoryTestPreset {
  const created = createStoryTestPreset(fallbackWorldId, []);
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    worldId: input.worldId || fallbackWorldId,
    name: input.name?.trim() || "未命名测试预设",
    description: input.description ?? "",
    sceneId: input.sceneId || "",
    initialState: sanitizeStoryState(input.initialState),
    maxDepth: clampInteger(input.maxDepth, 24, 4, 100),
    maxPaths: clampInteger(input.maxPaths, 120, 10, 500),
    updatedAt: input.updatedAt || new Date().toISOString()
  };
}

export function normalizeStoryTestRun(
  input: Partial<StoryTestRun>,
  fallbackWorldId: string
): StoryTestRun {
  const status: StoryTestRunStatus = ["passed", "failed", "blocked"].includes(
    input.status as StoryTestRunStatus
  )
    ? (input.status as StoryTestRunStatus)
    : "blocked";
  const mode: StoryTestRunMode = input.mode === "automatic" ? "automatic" : "manual";
  const coverageInput = input.coverage;
  const nodeIds = asStringArray(coverageInput?.nodeIds);
  const coveredNodeIds = asStringArray(coverageInput?.coveredNodeIds);
  const choiceIds = asStringArray(coverageInput?.choiceIds);
  const coveredChoiceIds = asStringArray(coverageInput?.coveredChoiceIds);
  const endingNodeIds = asStringArray(coverageInput?.endingNodeIds);
  const coveredEndingNodeIds = asStringArray(coverageInput?.coveredEndingNodeIds);
  return {
    id: input.id || createStoryId("test-run"),
    worldId: input.worldId || fallbackWorldId,
    presetId: input.presetId || "",
    sceneId: input.sceneId || "",
    mode,
    status,
    nodeIds: asStringArray(input.nodeIds),
    choiceIds: asStringArray(input.choiceIds),
    endingNodeId: input.endingNodeId || "",
    initialState: sanitizeStoryState(input.initialState),
    finalState: sanitizeStoryState(input.finalState),
    coverage: {
      nodeIds,
      coveredNodeIds,
      choiceIds,
      coveredChoiceIds,
      endingNodeIds,
      coveredEndingNodeIds,
      nodePercent: percentage(coveredNodeIds.length, nodeIds.length),
      choicePercent: percentage(coveredChoiceIds.length, choiceIds.length, 100),
      endingPercent: percentage(coveredEndingNodeIds.length, endingNodeIds.length)
    },
    findingKinds: Array.isArray(input.findingKinds)
      ? input.findingKinds.filter(isStoryTestFindingKind)
      : [],
    notes: input.notes ?? "",
    executedAt: input.executedAt || new Date().toISOString()
  };
}

export function createStoryReviewIssue(
  worldId: string,
  input: Partial<StoryReviewIssue> = {}
): StoryReviewIssue {
  const timestamp = new Date().toISOString();
  return {
    id: input.id || createStoryId("review-issue"),
    worldId: input.worldId || worldId,
    title: input.title?.trim() || "新的剧情问题",
    detail: input.detail ?? "记录复现步骤、预期结果和实际结果。",
    severity: input.severity || "major",
    status: input.status || "open",
    source: input.source || "manual",
    sourceFindingKind: isStoryTestFindingKind(input.sourceFindingKind)
      ? input.sourceFindingKind
      : "",
    presetId: input.presetId || "",
    runId: input.runId || "",
    sceneId: input.sceneId || "",
    nodeId: input.nodeId || "",
    entityId: input.entityId || "",
    questId: input.questId || "",
    consistencyFindingId: input.consistencyFindingId || "",
    consistencyRuleId: input.consistencyRuleId || "",
    createdAt: input.createdAt || timestamp,
    updatedAt: input.updatedAt || timestamp,
    resolvedAt: input.status === "resolved" ? input.resolvedAt || timestamp : ""
  };
}

export function normalizeStoryReviewIssue(
  input: Partial<StoryReviewIssue>,
  fallbackWorldId: string
) {
  const severity: StoryReviewIssueSeverity = ["critical", "major", "minor"].includes(
    input.severity as StoryReviewIssueSeverity
  )
    ? (input.severity as StoryReviewIssueSeverity)
    : "major";
  const status: StoryReviewIssueStatus = input.status === "resolved" ? "resolved" : "open";
  const source: StoryReviewIssueSource = ["analysis", "consistency"].includes(
    input.source || ""
  )
    ? (input.source as StoryReviewIssueSource)
    : "manual";
  return createStoryReviewIssue(fallbackWorldId, { ...input, severity, status, source });
}

export function resolvePresetState(
  variables: StoryVariable[],
  overrides: StoryState
): StoryState {
  const state = createInitialStoryState(variables);
  Object.entries(overrides).forEach(([variableId, value]) => {
    const variable = variables.find((item) => item.id === variableId);
    if (variable) state[variableId] = coerceStoryValue(variable.type, value);
  });
  return state;
}

function serializeState(nodeId: string, state: StoryState, variables: StoryVariable[]) {
  return JSON.stringify([
    nodeId,
    variables
      .map((variable) => [
        variable.id,
        coerceStoryValue(variable.type, state[variable.id] ?? variable.defaultValue)
      ])
      .sort((left, right) => String(left[0]).localeCompare(String(right[0])))
  ]);
}

function createCoverage(
  scene: StoryScene,
  coveredNodeIds: Set<string>,
  coveredChoiceIds: Set<string>,
  coveredEndingNodeIds: Set<string>
): StoryTestCoverage {
  const nodeIds = scene.nodes.map((node) => node.id);
  const choiceIds = scene.nodes.flatMap((node) => node.choices.map((choice) => choice.id));
  const endingNodeIds = scene.nodes.filter((node) => node.isEnding).map((node) => node.id);
  const coveredNodes = nodeIds.filter((id) => coveredNodeIds.has(id));
  const coveredChoices = choiceIds.filter((id) => coveredChoiceIds.has(id));
  const coveredEndings = endingNodeIds.filter((id) => coveredEndingNodeIds.has(id));
  return {
    nodeIds,
    coveredNodeIds: coveredNodes,
    choiceIds,
    coveredChoiceIds: coveredChoices,
    endingNodeIds,
    coveredEndingNodeIds: coveredEndings,
    nodePercent: percentage(coveredNodes.length, nodeIds.length),
    choicePercent: percentage(coveredChoices.length, choiceIds.length, 100),
    endingPercent: percentage(coveredEndings.length, endingNodeIds.length)
  };
}

function findingSeverityForScene(scene: StoryScene) {
  return scene.status === "ready" ? "error" : "warning";
}

export function analyzeStoryScene(
  scene: StoryScene,
  variables: StoryVariable[],
  preset?: StoryTestPreset,
  options: StoryAnalysisOptions = {}
): StoryTestAnalysis {
  const maxDepth = clampInteger(options.maxDepth ?? preset?.maxDepth, 24, 4, 100);
  const maxPaths = clampInteger(options.maxPaths ?? preset?.maxPaths, 120, 10, 500);
  const maxNodeVisits = clampInteger(options.maxNodeVisits, 4, 2, 12);
  const initialState = resolvePresetState(variables, preset?.initialState ?? {});
  const variableMap = new Map(variables.map((variable) => [variable.id, variable]));
  const nodeMap = new Map(scene.nodes.map((node) => [node.id, node]));
  const coveredNodeIds = new Set<string>();
  const coveredChoiceIds = new Set<string>();
  const coveredEndingNodeIds = new Set<string>();
  const seenStates = new Set<string>();
  const findings: StoryTestFinding[] = [];
  const findingKeys = new Set<string>();
  const paths: StoryTestPath[] = [];
  let truncated = false;
  let pathLimitReached = false;

  function addFinding(finding: Omit<StoryTestFinding, "id" | "sceneId">) {
    const key = [finding.kind, finding.nodeId, finding.choiceId, finding.variableId].join(":");
    if (findingKeys.has(key)) return;
    findingKeys.add(key);
    findings.push({
      ...finding,
      id: `test-finding:${scene.id}:${key}`,
      sceneId: scene.id
    });
  }

  function addPath(
    outcome: StoryTestPathOutcome,
    nodeIds: string[],
    choiceIds: string[],
    state: StoryState,
    detail: string,
    endingNodeId = ""
  ) {
    if (paths.length >= maxPaths) {
      truncated = true;
      pathLimitReached = true;
      addFinding({
        kind: "path-limit",
        severity: "warning",
        title: "路径数量达到测试上限",
        detail: `已保留前 ${maxPaths} 条路径，可提高预设中的路径上限后重试`
      });
      return;
    }
    paths.push({
      id: `test-path:${scene.id}:${paths.length + 1}`,
      outcome,
      nodeIds,
      choiceIds,
      endingNodeId,
      finalState: { ...state },
      detail
    });
  }

  function inspectValue(
    variable: StoryVariable,
    value: StoryValue,
    owner: string,
    nodeId: string,
    choiceId?: string
  ) {
    if (!valueMatchesType(variable.type, value)) {
      addFinding({
        kind: "variable-type",
        severity: "warning",
        title: `${owner}的变量值类型不一致`,
        detail: `${variable.name}需要${variable.type === "boolean" ? "开关" : variable.type === "number" ? "数值" : "文本"}值，运行时会自动转换`,
        nodeId,
        choiceId,
        variableId: variable.id
      });
    }
  }

  function inspectRules(
    node: DialogueNode,
    conditions: StoryCondition[],
    effects: StoryEffect[],
    owner: string,
    choiceId?: string
  ) {
    conditions.forEach((condition) => {
      const variable = variableMap.get(condition.variableId);
      if (!variable) {
        addFinding({
          kind: "missing-variable",
          severity: "error",
          title: `${owner}引用了不存在的变量`,
          detail: condition.variableId || "未选择变量",
          nodeId: node.id,
          choiceId,
          variableId: condition.variableId
        });
        return;
      }
      if (!storyConditionOperatorsForType(variable.type).includes(condition.operator)) {
        addFinding({
          kind: "operator-type",
          severity: "error",
          title: `${owner}使用了不兼容的条件运算符`,
          detail: `${variable.name}不能使用 ${condition.operator}`,
          nodeId: node.id,
          choiceId,
          variableId: variable.id
        });
      }
      if (condition.operator !== "truthy" && condition.operator !== "falsy") {
        inspectValue(variable, condition.value, owner, node.id, choiceId);
      }
    });
    effects.forEach((effect) => {
      const variable = variableMap.get(effect.variableId);
      if (!variable) {
        addFinding({
          kind: "missing-variable",
          severity: "error",
          title: `${owner}引用了不存在的变量`,
          detail: effect.variableId || "未选择变量",
          nodeId: node.id,
          choiceId,
          variableId: effect.variableId
        });
        return;
      }
      if (!storyEffectOperationsForType(variable.type).includes(effect.operation)) {
        addFinding({
          kind: "operation-type",
          severity: "error",
          title: `${owner}使用了不兼容的变量效果`,
          detail: `${variable.name}不能使用 ${effect.operation}`,
          nodeId: node.id,
          choiceId,
          variableId: variable.id
        });
      }
      if (effect.operation !== "toggle") {
        inspectValue(variable, effect.value, owner, node.id, choiceId);
      }
    });
  }

  Object.entries(preset?.initialState ?? {}).forEach(([variableId, value]) => {
    const variable = variableMap.get(variableId);
    if (!variable) {
      addFinding({
        kind: "missing-variable",
        severity: "warning",
        title: "测试预设包含不存在的变量",
        detail: variableId,
        variableId
      });
    } else {
      inspectValue(variable, value, "测试预设", scene.entryNodeId || scene.id);
    }
  });

  scene.nodes.forEach((node) => {
    inspectRules(node, node.conditions, node.effects, node.label);
    node.choices.forEach((choice) =>
      inspectRules(
        node,
        choice.conditions,
        choice.effects,
        `${node.label}中的选项“${choice.text || "未命名"}”`,
        choice.id
      )
    );
  });

  function visit(
    nodeId: string,
    state: StoryState,
    pathNodeIds: string[],
    pathChoiceIds: string[],
    pathStateKeys: Set<string>,
    depth: number
  ) {
    if (pathLimitReached) return;
    if (depth > maxDepth) {
      truncated = true;
      addFinding({
        kind: "depth-limit",
        severity: "warning",
        title: "分支达到最大测试深度",
        detail: `当前预设最多进入 ${maxDepth} 个节点`,
        nodeId
      });
      addPath("limit", pathNodeIds, pathChoiceIds, state, "达到最大测试深度");
      return;
    }

    const node = nodeMap.get(nodeId);
    if (!node) {
      addFinding({
        kind: "missing-target",
        severity: "error",
        title: "路径指向不存在的节点",
        detail: nodeId
      });
      addPath("blocked", pathNodeIds, pathChoiceIds, state, `目标节点 ${nodeId} 不存在`);
      return;
    }

    if (!storyConditionsPass(node.conditions, variables, state)) {
      addFinding({
        kind: pathNodeIds.length ? "node-blocked" : "entry-blocked",
        severity: pathNodeIds.length ? "warning" : "error",
        title: pathNodeIds.length ? `${node.label}的进入条件阻断了路径` : "入口条件无法满足",
        detail: pathNodeIds.length ? "当前路径状态不能进入该节点" : `${scene.title}无法从此预设开始`,
        nodeId: node.id
      });
      addPath(
        "blocked",
        [...pathNodeIds, node.id],
        pathChoiceIds,
        state,
        `无法进入 ${node.label}`
      );
      return;
    }

    const stateKey = serializeState(node.id, state, variables);
    if (pathStateKeys.has(stateKey)) {
      addFinding({
        kind: "loop",
        severity: "warning",
        title: `${node.label}形成了状态循环`,
        detail: "相同节点与变量状态在同一路径中再次出现",
        nodeId: node.id
      });
      addPath("loop", [...pathNodeIds, node.id], pathChoiceIds, state, `循环回到 ${node.label}`);
      return;
    }

    const visits = pathNodeIds.filter((id) => id === node.id).length;
    if (visits >= maxNodeVisits) {
      addFinding({
        kind: "loop",
        severity: "warning",
        title: `${node.label}被循环回访多次`,
        detail: `同一路径已进入该节点 ${maxNodeVisits} 次，测试停止继续展开`,
        nodeId: node.id
      });
      addPath("loop", [...pathNodeIds, node.id], pathChoiceIds, state, `反复进入 ${node.label}`);
      return;
    }

    if (seenStates.has(stateKey)) {
      addPath(
        "merged",
        [...pathNodeIds, node.id],
        pathChoiceIds,
        state,
        `路径汇入已分析的 ${node.label}`
      );
      return;
    }
    seenStates.add(stateKey);

    coveredNodeIds.add(node.id);
    const afterNode = applyStoryEffects(node.effects, variables, state);
    const nextNodeIds = [...pathNodeIds, node.id];
    const nextStateKeys = new Set(pathStateKeys).add(stateKey);

    if (node.isEnding) {
      coveredEndingNodeIds.add(node.id);
      addPath("ending", nextNodeIds, pathChoiceIds, afterNode, `到达结局 ${node.label}`, node.id);
      return;
    }

    if (node.choices.length) {
      let availableChoices = 0;
      node.choices.forEach((choice) => {
        if (!storyConditionsPass(choice.conditions, variables, afterNode)) {
          addFinding({
            kind: "choice-blocked",
            severity: "info",
            title: `选项“${choice.text || "未命名"}”在此预设下被锁定`,
            detail: node.label,
            nodeId: node.id,
            choiceId: choice.id
          });
          addPath(
            "blocked",
            nextNodeIds,
            [...pathChoiceIds, choice.id],
            afterNode,
            `选项“${choice.text || "未命名"}”条件未满足`
          );
          return;
        }

        availableChoices += 1;
        coveredChoiceIds.add(choice.id);
        const afterChoice = applyStoryEffects(choice.effects, variables, afterNode);
        if (!choice.targetNodeId || !nodeMap.has(choice.targetNodeId)) {
          addFinding({
            kind: "missing-target",
            severity: "error",
            title: `选项“${choice.text || "未命名"}”没有有效目标`,
            detail: node.label,
            nodeId: node.id,
            choiceId: choice.id
          });
          addPath(
            "blocked",
            nextNodeIds,
            [...pathChoiceIds, choice.id],
            afterChoice,
            `选项“${choice.text || "未命名"}”缺少目标`
          );
          return;
        }
        visit(
          choice.targetNodeId,
          afterChoice,
          nextNodeIds,
          [...pathChoiceIds, choice.id],
          nextStateKeys,
          depth + 1
        );
      });

      if (!availableChoices) {
        addFinding({
          kind: "no-available-choice",
          severity: "error",
          title: `${node.label}没有可用的玩家选项`,
          detail: "当前变量状态会让流程停在此处",
          nodeId: node.id
        });
      }
      return;
    }

    if (node.nextNodeId) {
      if (!nodeMap.has(node.nextNodeId)) {
        addFinding({
          kind: "missing-target",
          severity: "error",
          title: `${node.label}的下一节点不存在`,
          detail: node.nextNodeId,
          nodeId: node.id
        });
        addPath("blocked", nextNodeIds, pathChoiceIds, afterNode, "顺序跳转目标不存在");
        return;
      }
      visit(node.nextNodeId, afterNode, nextNodeIds, pathChoiceIds, nextStateKeys, depth + 1);
      return;
    }

    addFinding({
      kind: "dead-end",
      severity: findingSeverityForScene(scene),
      title: `${node.label}形成了未声明的死路`,
      detail: "节点没有下一步，也没有标记为结局",
      nodeId: node.id
    });
    addPath("dead-end", nextNodeIds, pathChoiceIds, afterNode, `停在 ${node.label}`);
  }

  if (!scene.entryNodeId || !nodeMap.has(scene.entryNodeId)) {
    addFinding({
      kind: "missing-target",
      severity: "error",
      title: "场景入口节点不存在",
      detail: scene.entryNodeId || "未设置入口"
    });
    addPath("blocked", [], [], initialState, "场景没有有效入口");
  } else {
    visit(scene.entryNodeId, initialState, [], [], new Set(), 0);
  }

  const coverage = createCoverage(
    scene,
    coveredNodeIds,
    coveredChoiceIds,
    coveredEndingNodeIds
  );

  if (!coverage.endingNodeIds.length) {
    addFinding({
      kind: "no-ending",
      severity: findingSeverityForScene(scene),
      title: `${scene.title}没有结局节点`,
      detail: "自动测试无法确认流程是否完整结束"
    });
  } else if (!coverage.coveredEndingNodeIds.length) {
    addFinding({
      kind: "no-ending",
      severity: "error",
      title: `${scene.title}没有可到达的结局`,
      detail: "当前测试预设未能抵达任何结局"
    });
  }

  coverage.nodeIds
    .filter((id) => !coveredNodeIds.has(id))
    .forEach((nodeId) => {
      const node = nodeMap.get(nodeId);
      addFinding({
        kind: "uncovered-node",
        severity: "warning",
        title: `${node?.label || nodeId}未被测试覆盖`,
        detail: "调整初始变量或新增测试预设以覆盖此节点",
        nodeId
      });
    });

  scene.nodes.forEach((node) => {
    node.choices
      .filter((choice) => !coveredChoiceIds.has(choice.id))
      .forEach((choice) =>
        addFinding({
          kind: "uncovered-choice",
          severity: "info",
          title: `选项“${choice.text || "未命名"}”未被覆盖`,
          detail: node.label,
          nodeId: node.id,
          choiceId: choice.id
        })
      );
  });

  coverage.endingNodeIds
    .filter((id) => !coveredEndingNodeIds.has(id))
    .forEach((nodeId) => {
      const node = nodeMap.get(nodeId);
      addFinding({
        kind: "uncovered-ending",
        severity: "warning",
        title: `结局“${node?.label || nodeId}”未被覆盖`,
        detail: "当前测试预设无法抵达此结局",
        nodeId
      });
    });

  return {
    id: createStoryId("test-analysis"),
    sceneId: scene.id,
    presetId: preset?.id ?? "",
    initialState,
    coverage,
    findings: findings.sort((left, right) => {
      const rank = { error: 0, warning: 1, info: 2 };
      return rank[left.severity] - rank[right.severity] || left.title.localeCompare(right.title, "zh-CN");
    }),
    paths,
    exploredStates: seenStates.size,
    truncated,
    generatedAt: new Date().toISOString()
  };
}

export function createAutomaticStoryTestRun(
  worldId: string,
  analysis: StoryTestAnalysis,
  notes = ""
): StoryTestRun {
  const endingPaths = analysis.paths.filter((path) => path.outcome === "ending");
  const hasErrors = analysis.findings.some((finding) => finding.severity === "error");
  const status: StoryTestRunStatus = endingPaths.length
    ? hasErrors
      ? "failed"
      : "passed"
    : "blocked";
  const representative = endingPaths[0] ?? analysis.paths[0];
  return {
    id: createStoryId("test-run"),
    worldId,
    presetId: analysis.presetId,
    sceneId: analysis.sceneId,
    mode: "automatic",
    status,
    nodeIds: representative?.nodeIds ?? [],
    choiceIds: representative?.choiceIds ?? [],
    endingNodeId: representative?.endingNodeId ?? "",
    initialState: { ...analysis.initialState },
    finalState: { ...(representative?.finalState ?? analysis.initialState) },
    coverage: analysis.coverage,
    findingKinds: Array.from(new Set(analysis.findings.map((finding) => finding.kind))),
    notes,
    executedAt: analysis.generatedAt
  };
}

function blockedSession(
  sceneId: string,
  initialState: StoryState,
  state: StoryState,
  message: string,
  nodeIds: string[] = [],
  choiceIds: string[] = []
): StoryManualSession {
  return {
    sceneId,
    initialState,
    state,
    currentNodeId: "",
    nodeIds,
    choiceIds,
    endingNodeId: "",
    status: "blocked",
    message
  };
}

function enterManualNode(
  session: StoryManualSession,
  nodeId: string,
  state: StoryState,
  scene: StoryScene,
  variables: StoryVariable[]
): StoryManualSession {
  const node = scene.nodes.find((item) => item.id === nodeId);
  if (!node) {
    return blockedSession(
      scene.id,
      session.initialState,
      state,
      "目标节点不存在",
      session.nodeIds,
      session.choiceIds
    );
  }
  if (!storyConditionsPass(node.conditions, variables, state)) {
    return blockedSession(
      scene.id,
      session.initialState,
      state,
      `“${node.label}”的进入条件未满足`,
      [...session.nodeIds, node.id],
      session.choiceIds
    );
  }
  const nextState = applyStoryEffects(node.effects, variables, state);
  return {
    ...session,
    state: nextState,
    currentNodeId: node.id,
    nodeIds: [...session.nodeIds, node.id],
    endingNodeId: node.isEnding ? node.id : "",
    status: node.isEnding ? "ending" : "running",
    message: node.isEnding ? "场景已到达结局" : ""
  };
}

export function startStoryManualSession(
  scene: StoryScene,
  variables: StoryVariable[],
  initialOverrides: StoryState
): StoryManualSession {
  const initialState = resolvePresetState(variables, initialOverrides);
  const session: StoryManualSession = {
    sceneId: scene.id,
    initialState,
    state: initialState,
    currentNodeId: "",
    nodeIds: [],
    choiceIds: [],
    endingNodeId: "",
    status: "idle",
    message: ""
  };
  if (!scene.entryNodeId) {
    return blockedSession(scene.id, initialState, initialState, "场景没有入口节点");
  }
  return enterManualNode(session, scene.entryNodeId, initialState, scene, variables);
}

export function advanceStoryManualSession(
  session: StoryManualSession,
  scene: StoryScene,
  variables: StoryVariable[],
  choiceId = ""
): StoryManualSession {
  if (session.status !== "running") return session;
  const node = scene.nodes.find((item) => item.id === session.currentNodeId);
  if (!node) {
    return blockedSession(
      scene.id,
      session.initialState,
      session.state,
      "当前节点不存在",
      session.nodeIds,
      session.choiceIds
    );
  }
  if (node.isEnding) return { ...session, status: "ending", endingNodeId: node.id };

  if (node.choices.length) {
    const choice = node.choices.find((item) => item.id === choiceId);
    if (!choice) return { ...session, message: "请选择一个玩家选项" };
    if (!storyConditionsPass(choice.conditions, variables, session.state)) {
      return { ...session, message: `选项“${choice.text || "未命名"}”的条件未满足` };
    }
    const nextSession = {
      ...session,
      choiceIds: [...session.choiceIds, choice.id],
      message: ""
    };
    const nextState = applyStoryEffects(choice.effects, variables, session.state);
    return enterManualNode(nextSession, choice.targetNodeId, nextState, scene, variables);
  }

  if (!node.nextNodeId) {
    return blockedSession(
      scene.id,
      session.initialState,
      session.state,
      `${node.label}没有后续路径`,
      session.nodeIds,
      session.choiceIds
    );
  }
  return enterManualNode(session, node.nextNodeId, session.state, scene, variables);
}

export function createManualStoryTestRun(
  worldId: string,
  presetId: string,
  scene: StoryScene,
  session: StoryManualSession,
  status: StoryTestRunStatus,
  notes: string
): StoryTestRun {
  const coveredNodeIds = new Set(session.nodeIds);
  const coveredChoiceIds = new Set(session.choiceIds);
  const coveredEndingNodeIds = new Set(session.endingNodeId ? [session.endingNodeId] : []);
  return {
    id: createStoryId("test-run"),
    worldId,
    presetId,
    sceneId: scene.id,
    mode: "manual",
    status,
    nodeIds: [...session.nodeIds],
    choiceIds: [...session.choiceIds],
    endingNodeId: session.endingNodeId,
    initialState: { ...session.initialState },
    finalState: { ...session.state },
    coverage: createCoverage(scene, coveredNodeIds, coveredChoiceIds, coveredEndingNodeIds),
    findingKinds: session.status === "blocked" ? ["node-blocked"] : [],
    notes,
    executedAt: new Date().toISOString()
  };
}

export function createIssueFromFinding(
  worldId: string,
  finding: StoryTestFinding,
  presetId = ""
) {
  const severity: StoryReviewIssueSeverity =
    finding.severity === "error" ? "critical" : finding.severity === "warning" ? "major" : "minor";
  return createStoryReviewIssue(worldId, {
    title: finding.title,
    detail: finding.detail,
    severity,
    source: "analysis",
    sourceFindingKind: finding.kind,
    presetId,
    sceneId: finding.sceneId,
    nodeId: finding.nodeId || ""
  });
}

export function buildStoryTestReportMarkdown(input: {
  worldName: string;
  scene: StoryScene;
  variables: StoryVariable[];
  preset: StoryTestPreset;
  analysis: StoryTestAnalysis;
  issues: StoryReviewIssue[];
}) {
  const { analysis, issues, preset, scene, variables, worldName } = input;
  const variableNames = new Map(variables.map((variable) => [variable.id, variable.name]));
  const nodeNames = new Map(scene.nodes.map((node) => [node.id, node.label]));
  const outcomeLabels: Record<StoryTestPathOutcome, string> = {
    ending: "到达结局",
    blocked: "被阻断",
    "dead-end": "死路",
    loop: "循环",
    limit: "达到上限",
    merged: "汇入已分析路径"
  };
  const stateLines = Object.entries(analysis.initialState)
    .map(([id, value]) => `- ${variableNames.get(id) ?? id}：${String(value)}`)
    .join("\n");
  const findingLines = analysis.findings
    .map(
      (finding) =>
        `- [${finding.severity.toUpperCase()}] ${finding.title}：${finding.detail}`
    )
    .join("\n");
  const pathLines = analysis.paths
    .map((path, index) => {
      const route = path.nodeIds.map((id) => nodeNames.get(id) ?? id).join(" → ");
      return `${index + 1}. ${outcomeLabels[path.outcome]}：${route || "未进入节点"}（${path.detail}）`;
    })
    .join("\n");
  const issueLines = issues
    .filter((issue) => issue.sceneId === scene.id && issue.status === "open")
    .map((issue) => `- [${issue.severity}] ${issue.title}：${issue.detail}`)
    .join("\n");

  return `# ${worldName} · 剧情测试报告

- 场景：${scene.title}
- 测试预设：${preset.name}
- 生成时间：${analysis.generatedAt}
- 探索状态：${analysis.exploredStates}
- 路径数量：${analysis.paths.length}${analysis.truncated ? "（已达到上限）" : ""}

## 覆盖率

- 节点：${analysis.coverage.coveredNodeIds.length}/${analysis.coverage.nodeIds.length}（${analysis.coverage.nodePercent}%）
- 玩家选项：${analysis.coverage.coveredChoiceIds.length}/${analysis.coverage.choiceIds.length}（${analysis.coverage.choicePercent}%）
- 结局：${analysis.coverage.coveredEndingNodeIds.length}/${analysis.coverage.endingNodeIds.length}（${analysis.coverage.endingPercent}%）

## 初始变量

${stateLines || "- 无剧情变量"}

## 检查发现

${findingLines || "- 未发现问题"}

## 路径结果

${pathLines || "- 未生成路径"}

## 待处理审阅问题

${issueLines || "- 无待处理问题"}
`;
}

export function emptyStoryTestCoverage() {
  return { ...emptyCoverage };
}
