export type StoryValue = boolean | number | string;
export type StoryVariableType = "boolean" | "number" | "text";
export type StorySceneStatus = "draft" | "review" | "ready";
export type StoryConditionOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "lessThan"
  | "atLeast"
  | "atMost"
  | "truthy"
  | "falsy";
export type StoryEffectOperation = "set" | "increment" | "decrement" | "toggle";
export type StoryShotFraming =
  | "establishing"
  | "wide"
  | "full"
  | "medium"
  | "close"
  | "extreme-close"
  | "insert"
  | "pov";
export type StoryShotTransition = "cut" | "fade" | "dissolve" | "wipe" | "none";

export type StoryVariable = {
  id: string;
  worldId: string;
  key: string;
  name: string;
  type: StoryVariableType;
  defaultValue: StoryValue;
  description: string;
  updatedAt: string;
};

export type StoryCondition = {
  id: string;
  variableId: string;
  operator: StoryConditionOperator;
  value: StoryValue;
};

export type StoryEffect = {
  id: string;
  variableId: string;
  operation: StoryEffectOperation;
  value: StoryValue;
};

export type DialogueChoice = {
  id: string;
  text: string;
  targetNodeId: string;
  conditions: StoryCondition[];
  effects: StoryEffect[];
};

export type DialogueNode = {
  id: string;
  label: string;
  speakerEntityId: string;
  text: string;
  stageDirection: string;
  mediaAssetId: string;
  durationSeconds: number;
  shotFraming: StoryShotFraming;
  cameraDirection: string;
  transition: StoryShotTransition;
  conditions: StoryCondition[];
  effects: StoryEffect[];
  nextNodeId: string;
  choices: DialogueChoice[];
  isEnding: boolean;
};

export type StoryScene = {
  id: string;
  worldId: string;
  title: string;
  summary: string;
  status: StorySceneStatus;
  entryNodeId: string;
  relatedEntityIds: string[];
  relatedQuestIds: string[];
  nodes: DialogueNode[];
  notes: string;
  updatedAt: string;
};

export type StoryState = Record<string, StoryValue>;

export type StoryValidationIssue = {
  id: string;
  severity: "error" | "warning";
  title: string;
  detail: string;
  nodeId?: string;
};

const variableTypes = new Set<StoryVariableType>(["boolean", "number", "text"]);
const sceneStatuses = new Set<StorySceneStatus>(["draft", "review", "ready"]);
const conditionOperators = new Set<StoryConditionOperator>([
  "equals",
  "notEquals",
  "greaterThan",
  "lessThan",
  "atLeast",
  "atMost",
  "truthy",
  "falsy"
]);
const effectOperations = new Set<StoryEffectOperation>([
  "set",
  "increment",
  "decrement",
  "toggle"
]);
const shotFramings = new Set<StoryShotFraming>([
  "establishing",
  "wide",
  "full",
  "medium",
  "close",
  "extreme-close",
  "insert",
  "pov"
]);
const shotTransitions = new Set<StoryShotTransition>([
  "cut",
  "fade",
  "dissolve",
  "wipe",
  "none"
]);

export function createStoryId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function defaultValueForType(type: StoryVariableType): StoryValue {
  if (type === "boolean") return false;
  if (type === "number") return 0;
  return "";
}

export function storyConditionOperatorsForType(
  type?: StoryVariableType
): StoryConditionOperator[] {
  if (type === "number") {
    return ["equals", "notEquals", "greaterThan", "lessThan", "atLeast", "atMost"];
  }
  if (type === "boolean") {
    return ["truthy", "falsy", "equals", "notEquals"];
  }
  return ["equals", "notEquals"];
}

export function storyEffectOperationsForType(
  type?: StoryVariableType
): StoryEffectOperation[] {
  if (type === "number") return ["set", "increment", "decrement"];
  if (type === "boolean") return ["set", "toggle"];
  return ["set"];
}

export function coerceStoryValue(type: StoryVariableType, value: unknown): StoryValue {
  if (type === "boolean") {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    return ["true", "1", "yes", "是"].includes(String(value ?? "").trim().toLowerCase());
  }

  if (type === "number") {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  return String(value ?? "");
}

export function createStoryVariable(
  worldId: string,
  index = 1,
  name = "新的剧情变量"
): StoryVariable {
  return {
    id: createStoryId("variable"),
    worldId,
    key: `story.variable_${index}`,
    name,
    type: "boolean",
    defaultValue: false,
    description: "",
    updatedAt: new Date().toISOString()
  };
}

export function createStoryCondition(
  variableId = "",
  variableType: StoryVariableType = "boolean"
): StoryCondition {
  return {
    id: createStoryId("condition"),
    variableId,
    operator: storyConditionOperatorsForType(variableType)[0],
    value: defaultValueForType(variableType)
  };
}

export function createStoryEffect(
  variableId = "",
  variableType: StoryVariableType = "boolean"
): StoryEffect {
  return {
    id: createStoryId("effect"),
    variableId,
    operation: storyEffectOperationsForType(variableType)[0],
    value: defaultValueForType(variableType)
  };
}

export function createDialogueChoice(targetNodeId = ""): DialogueChoice {
  return {
    id: createStoryId("choice"),
    text: "新的玩家选项",
    targetNodeId,
    conditions: [],
    effects: []
  };
}

export function createDialogueNode(label = "新的对白节点"): DialogueNode {
  return {
    id: createStoryId("dialogue"),
    label,
    speakerEntityId: "",
    text: "",
    stageDirection: "",
    mediaAssetId: "",
    durationSeconds: 4,
    shotFraming: "medium",
    cameraDirection: "",
    transition: "cut",
    conditions: [],
    effects: [],
    nextNodeId: "",
    choices: [],
    isEnding: false
  };
}

export function createStoryScene(worldId: string, title = "新的剧情场景"): StoryScene {
  const entry = createDialogueNode("场景开场");
  return {
    id: createStoryId("scene"),
    worldId,
    title,
    summary: "描述这段场景在剧情中的作用。",
    status: "draft",
    entryNodeId: entry.id,
    relatedEntityIds: [],
    relatedQuestIds: [],
    nodes: [entry],
    notes: "",
    updatedAt: new Date().toISOString()
  };
}

function isStoryValue(value: unknown): value is StoryValue {
  return typeof value === "boolean" || typeof value === "number" || typeof value === "string";
}

function normalizeCondition(input: Partial<StoryCondition>): StoryCondition {
  return {
    id: input.id || createStoryId("condition"),
    variableId: input.variableId || "",
    operator: conditionOperators.has(input.operator as StoryConditionOperator)
      ? (input.operator as StoryConditionOperator)
      : "equals",
    value: isStoryValue(input.value) ? input.value : true
  };
}

function normalizeEffect(input: Partial<StoryEffect>): StoryEffect {
  return {
    id: input.id || createStoryId("effect"),
    variableId: input.variableId || "",
    operation: effectOperations.has(input.operation as StoryEffectOperation)
      ? (input.operation as StoryEffectOperation)
      : "set",
    value: isStoryValue(input.value) ? input.value : true
  };
}

function normalizeChoice(input: Partial<DialogueChoice>): DialogueChoice {
  return {
    id: input.id || createStoryId("choice"),
    text: input.text ?? "新的玩家选项",
    targetNodeId: input.targetNodeId || "",
    conditions: Array.isArray(input.conditions)
      ? input.conditions.map((condition) => normalizeCondition(condition))
      : [],
    effects: Array.isArray(input.effects)
      ? input.effects.map((effect) => normalizeEffect(effect))
      : []
  };
}

export function normalizeDialogueNode(input: Partial<DialogueNode>): DialogueNode {
  const base = createDialogueNode(input.label || "对白节点");
  return {
    ...base,
    ...input,
    id: input.id || base.id,
    label: input.label?.trim() || "对白节点",
    speakerEntityId: input.speakerEntityId || "",
    text: input.text ?? "",
    stageDirection: input.stageDirection ?? "",
    mediaAssetId: input.mediaAssetId || "",
    durationSeconds: Number.isFinite(Number(input.durationSeconds))
      ? Math.min(600, Math.max(0.5, Number(input.durationSeconds)))
      : 4,
    shotFraming: shotFramings.has(input.shotFraming as StoryShotFraming)
      ? (input.shotFraming as StoryShotFraming)
      : "medium",
    cameraDirection: input.cameraDirection ?? "",
    transition: shotTransitions.has(input.transition as StoryShotTransition)
      ? (input.transition as StoryShotTransition)
      : "cut",
    conditions: Array.isArray(input.conditions)
      ? input.conditions.map((condition) => normalizeCondition(condition))
      : [],
    effects: Array.isArray(input.effects)
      ? input.effects.map((effect) => normalizeEffect(effect))
      : [],
    nextNodeId: input.nextNodeId || "",
    choices: Array.isArray(input.choices)
      ? input.choices.map((choice) => normalizeChoice(choice))
      : [],
    isEnding: Boolean(input.isEnding)
  };
}

export function normalizeStoryVariable(
  input: Partial<StoryVariable>,
  fallbackWorldId: string
): StoryVariable {
  const type = variableTypes.has(input.type as StoryVariableType)
    ? (input.type as StoryVariableType)
    : "boolean";
  const created = createStoryVariable(fallbackWorldId);
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    worldId: input.worldId || fallbackWorldId,
    key: input.key?.trim() || created.key,
    name: input.name?.trim() || "未命名变量",
    type,
    defaultValue: coerceStoryValue(type, input.defaultValue),
    description: input.description ?? "",
    updatedAt: input.updatedAt || new Date().toISOString()
  };
}

export function normalizeStoryScene(
  input: Partial<StoryScene>,
  fallbackWorldId: string
): StoryScene {
  const created = createStoryScene(fallbackWorldId, input.title || "未命名场景");
  const nodes = Array.isArray(input.nodes)
    ? input.nodes.map((node) => normalizeDialogueNode(node))
    : created.nodes;
  const entryNodeId = input.entryNodeId || nodes[0]?.id || "";

  return {
    ...created,
    ...input,
    id: input.id || created.id,
    worldId: input.worldId || fallbackWorldId,
    title: input.title?.trim() || "未命名场景",
    summary: input.summary ?? "",
    status: sceneStatuses.has(input.status as StorySceneStatus)
      ? (input.status as StorySceneStatus)
      : "draft",
    entryNodeId,
    relatedEntityIds: Array.isArray(input.relatedEntityIds) ? input.relatedEntityIds : [],
    relatedQuestIds: Array.isArray(input.relatedQuestIds) ? input.relatedQuestIds : [],
    nodes,
    notes: input.notes ?? "",
    updatedAt: input.updatedAt || new Date().toISOString()
  };
}

export function normalizeStorySceneVariableType(
  scene: StoryScene,
  variableId: string,
  nextType: StoryVariableType,
  updatedAt = new Date().toISOString()
) {
  let changed = false;
  const allowedOperators = storyConditionOperatorsForType(nextType);
  const allowedOperations = storyEffectOperationsForType(nextType);
  const normalizeConditions = (conditions: StoryCondition[]) =>
    conditions.map((condition) => {
      if (condition.variableId !== variableId) return condition;
      changed = true;
      return {
        ...condition,
        operator: allowedOperators.includes(condition.operator)
          ? condition.operator
          : allowedOperators[0],
        value: coerceStoryValue(nextType, condition.value)
      };
    });
  const normalizeEffects = (effects: StoryEffect[]) =>
    effects.map((effect) => {
      if (effect.variableId !== variableId) return effect;
      changed = true;
      return {
        ...effect,
        operation: allowedOperations.includes(effect.operation)
          ? effect.operation
          : allowedOperations[0],
        value: coerceStoryValue(nextType, effect.value)
      };
    });
  const nodes = scene.nodes.map((node) => ({
    ...node,
    conditions: normalizeConditions(node.conditions),
    effects: normalizeEffects(node.effects),
    choices: node.choices.map((choice) => ({
      ...choice,
      conditions: normalizeConditions(choice.conditions),
      effects: normalizeEffects(choice.effects)
    }))
  }));

  return changed ? { ...scene, nodes, updatedAt } : scene;
}

export function createInitialStoryState(variables: StoryVariable[]): StoryState {
  return Object.fromEntries(
    variables.map((variable) => [
      variable.id,
      coerceStoryValue(variable.type, variable.defaultValue)
    ])
  );
}

export function evaluateStoryCondition(
  condition: StoryCondition,
  variables: StoryVariable[],
  state: StoryState
) {
  const variable = variables.find((item) => item.id === condition.variableId);
  if (!variable) return false;

  const current = coerceStoryValue(
    variable.type,
    state[variable.id] ?? variable.defaultValue
  );
  const expected = coerceStoryValue(variable.type, condition.value);

  switch (condition.operator) {
    case "equals":
      return current === expected;
    case "notEquals":
      return current !== expected;
    case "greaterThan":
      return Number(current) > Number(expected);
    case "lessThan":
      return Number(current) < Number(expected);
    case "atLeast":
      return Number(current) >= Number(expected);
    case "atMost":
      return Number(current) <= Number(expected);
    case "truthy":
      return Boolean(current);
    case "falsy":
      return !Boolean(current);
    default:
      return false;
  }
}

export function storyConditionsPass(
  conditions: StoryCondition[],
  variables: StoryVariable[],
  state: StoryState
) {
  return conditions.every((condition) => evaluateStoryCondition(condition, variables, state));
}

export function applyStoryEffects(
  effects: StoryEffect[],
  variables: StoryVariable[],
  state: StoryState
): StoryState {
  const next = { ...state };

  effects.forEach((effect) => {
    const variable = variables.find((item) => item.id === effect.variableId);
    if (!variable) return;

    const current = coerceStoryValue(
      variable.type,
      next[variable.id] ?? variable.defaultValue
    );
    if (effect.operation === "toggle" && variable.type === "boolean") {
      next[variable.id] = !Boolean(current);
      return;
    }
    if (effect.operation === "increment" && variable.type === "number") {
      next[variable.id] = Number(current) + Number(effect.value || 0);
      return;
    }
    if (effect.operation === "decrement" && variable.type === "number") {
      next[variable.id] = Number(current) - Number(effect.value || 0);
      return;
    }
    next[variable.id] = coerceStoryValue(variable.type, effect.value);
  });

  return next;
}

export function getStorySceneText(scene: StoryScene) {
  return [
    scene.title,
    scene.summary,
    scene.notes,
    scene.nodes
      .map((node) =>
        [
          node.label,
          node.text,
          node.stageDirection,
          node.cameraDirection,
          node.choices.map((choice) => choice.text).join(" ")
        ].join(" ")
      )
      .join(" ")
  ].join(" ");
}

export function validateStoryScene(
  scene: StoryScene,
  context: {
    variableIds: Set<string>;
    entityIds: Set<string>;
    questIds: Set<string>;
    assetIds?: Set<string>;
  }
) {
  const issues: StoryValidationIssue[] = [];
  const nodeIds = new Set<string>();

  if (!scene.title.trim()) {
    issues.push({
      id: `scene-title:${scene.id}`,
      severity: "error",
      title: "场景缺少标题",
      detail: scene.id
    });
  }

  if (!scene.nodes.length) {
    issues.push({
      id: `scene-nodes:${scene.id}`,
      severity: "error",
      title: `${scene.title || "未命名场景"}没有对白节点`,
      detail: "至少需要一个入口节点"
    });
    return issues;
  }

  scene.nodes.forEach((node) => {
    if (nodeIds.has(node.id)) {
      issues.push({
        id: `duplicate-node:${scene.id}:${node.id}`,
        severity: "error",
        title: `${scene.title}存在重复节点 ID`,
        detail: node.id,
        nodeId: node.id
      });
    }
    nodeIds.add(node.id);
    if (node.mediaAssetId && context.assetIds && !context.assetIds.has(node.mediaAssetId)) {
      issues.push({
        id: `missing-node-media:${scene.id}:${node.id}`,
        severity: "warning",
        title: `${node.label}的预演素材不存在`,
        detail: "重新选择图片或视频，或清空这个镜头的素材。",
        nodeId: node.id
      });
    }
  });

  if (!nodeIds.has(scene.entryNodeId)) {
    issues.push({
      id: `scene-entry:${scene.id}`,
      severity: "error",
      title: `${scene.title}的入口节点不存在`,
      detail: scene.entryNodeId || "未设置"
    });
  }

  const missingEntities = scene.relatedEntityIds.filter((id) => !context.entityIds.has(id));
  if (missingEntities.length) {
    issues.push({
      id: `scene-entities:${scene.id}`,
      severity: "error",
      title: `${scene.title}关联了不存在的条目`,
      detail: missingEntities.join("、")
    });
  }

  const missingQuests = scene.relatedQuestIds.filter((id) => !context.questIds.has(id));
  if (missingQuests.length) {
    issues.push({
      id: `scene-quests:${scene.id}`,
      severity: "error",
      title: `${scene.title}关联了不存在的任务`,
      detail: missingQuests.join("、")
    });
  }

  function validateVariableRefs(
    nodeId: string,
    conditions: StoryCondition[],
    effects: StoryEffect[],
    ownerLabel: string
  ) {
    const missing = [
      ...conditions.map((condition) => condition.variableId),
      ...effects.map((effect) => effect.variableId)
    ].filter((id) => !context.variableIds.has(id));
    if (missing.length) {
      issues.push({
        id: `variable-ref:${scene.id}:${ownerLabel}:${nodeId}`,
        severity: "error",
        title: `${ownerLabel}引用了不存在的剧情变量`,
        detail: Array.from(new Set(missing)).join("、") || "未选择变量",
        nodeId
      });
    }
  }

  scene.nodes.forEach((node) => {
    if (node.speakerEntityId && !context.entityIds.has(node.speakerEntityId)) {
      issues.push({
        id: `speaker:${scene.id}:${node.id}`,
        severity: "error",
        title: `${node.label}的说话者不存在`,
        detail: node.speakerEntityId,
        nodeId: node.id
      });
    }

    validateVariableRefs(node.id, node.conditions, node.effects, node.label);

    if (node.nextNodeId && !nodeIds.has(node.nextNodeId)) {
      issues.push({
        id: `next-node:${scene.id}:${node.id}`,
        severity: "error",
        title: `${node.label}的下一节点不存在`,
        detail: node.nextNodeId,
        nodeId: node.id
      });
    }

    if (node.nextNodeId && node.choices.length) {
      issues.push({
        id: `mixed-route:${scene.id}:${node.id}`,
        severity: "warning",
        title: `${node.label}同时设置了顺序跳转和玩家选项`,
        detail: "模拟时优先使用玩家选项",
        nodeId: node.id
      });
    }

    if (node.isEnding && (node.nextNodeId || node.choices.length)) {
      issues.push({
        id: `ending-route:${scene.id}:${node.id}`,
        severity: "warning",
        title: `${node.label}已标记为结局但仍有后续路径`,
        detail: "模拟会在该节点结束",
        nodeId: node.id
      });
    }

    if (!node.isEnding && !node.nextNodeId && !node.choices.length) {
      issues.push({
        id: `dead-end:${scene.id}:${node.id}`,
        severity: "warning",
        title: `${node.label}形成了未标记的死路`,
        detail: "设置下一节点、玩家选项或标记为结局",
        nodeId: node.id
      });
    }

    node.choices.forEach((choice) => {
      validateVariableRefs(
        node.id,
        choice.conditions,
        choice.effects,
        `${node.label}中的选项“${choice.text || "未命名"}”`
      );
      if (!choice.text.trim()) {
        issues.push({
          id: `choice-text:${scene.id}:${choice.id}`,
          severity: "warning",
          title: `${node.label}包含空白玩家选项`,
          detail: choice.id,
          nodeId: node.id
        });
      }
      if (!choice.targetNodeId || !nodeIds.has(choice.targetNodeId)) {
        issues.push({
          id: `choice-target:${scene.id}:${choice.id}`,
          severity: "error",
          title: `${node.label}的玩家选项没有有效目标`,
          detail: choice.text || "未命名选项",
          nodeId: node.id
        });
      }
    });
  });

  if (nodeIds.has(scene.entryNodeId)) {
    const reachable = new Set<string>();
    const queue = [scene.entryNodeId];
    while (queue.length) {
      const currentId = queue.shift() as string;
      if (reachable.has(currentId)) continue;
      reachable.add(currentId);
      const node = scene.nodes.find((item) => item.id === currentId);
      if (!node) continue;
      const targets = node.isEnding
        ? []
        : [node.nextNodeId, ...node.choices.map((choice) => choice.targetNodeId)].filter(
            (id) => nodeIds.has(id)
          );
      targets.forEach((target) => {
        if (!reachable.has(target)) queue.push(target);
      });
    }

    scene.nodes
      .filter((node) => !reachable.has(node.id))
      .forEach((node) => {
        issues.push({
          id: `unreachable:${scene.id}:${node.id}`,
          severity: "warning",
          title: `${node.label}无法从入口到达`,
          detail: scene.title,
          nodeId: node.id
        });
      });
  }

  return issues;
}

export function validateStoryVariables(variables: StoryVariable[]) {
  const issues: StoryValidationIssue[] = [];
  const seenKeys = new Set<string>();

  variables.forEach((variable) => {
    const key = variable.key.trim().toLowerCase();
    if (!key) {
      issues.push({
        id: `variable-key:${variable.id}`,
        severity: "error",
        title: `${variable.name || "未命名变量"}缺少变量键`,
        detail: variable.id
      });
    } else if (seenKeys.has(key)) {
      issues.push({
        id: `variable-duplicate:${variable.id}`,
        severity: "error",
        title: `剧情变量键重复：${variable.key}`,
        detail: variable.name
      });
    }
    seenKeys.add(key);
  });

  return issues;
}
