import type { StoryScene, StoryVariable } from "./story";
import type { StoryTestRun } from "./story-testing";
import {
  validateManuscriptConsistency,
  type ManuscriptWorkspaceData
} from "./manuscript";
import type {
  MapMarker,
  MapRoute,
  TimelineEvent,
  TimelineTrack,
  WorldMap
} from "./world-planning";

export type ConsistencySeverity = "critical" | "major" | "minor";
export type ConsistencyStatus = "open" | "ignored" | "resolved";
export type ConsistencyCategory =
  | "identity"
  | "references"
  | "templates"
  | "privacy"
  | "quests"
  | "story"
  | "manuscript"
  | "maps"
  | "timeline"
  | "relations";
export type ConsistencyTargetType =
  | "world"
  | "entity"
  | "quest"
  | "scene"
  | "variable"
  | "map"
  | "marker"
  | "route"
  | "track"
  | "timeline"
  | "relation"
  | "asset"
  | "manuscript-book"
  | "manuscript-chapter"
  | "manuscript-scene"
  | "manuscript-clue"
  | "manuscript-knowledge";

export type ConsistencyTarget = {
  type: ConsistencyTargetType;
  id: string;
  label: string;
};

export type ConsistencyEvidence = {
  label: string;
  value: string;
  field: string;
  target?: ConsistencyTarget;
};

export type ConsistencyExplanation = {
  text: string;
  model: string;
  generatedAt: string;
};

export type ConsistencyFinding = {
  id: string;
  worldId: string;
  fingerprint: string;
  ruleId: string;
  category: ConsistencyCategory;
  severity: ConsistencySeverity;
  status: ConsistencyStatus;
  statusReason: string;
  title: string;
  detail: string;
  suggestion: string;
  primaryTarget: ConsistencyTarget;
  relatedTargets: ConsistencyTarget[];
  evidence: ConsistencyEvidence[];
  detected: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  statusUpdatedAt: string;
  lastDetectedScanId: string;
  explanation?: ConsistencyExplanation;
};

export type ConsistencyScan = {
  id: string;
  worldId: string;
  startedAt: string;
  completedAt: string;
  totalDetected: number;
  openCount: number;
  ignoredCount: number;
  criticalCount: number;
  majorCount: number;
  minorCount: number;
  newFindingIds: string[];
  resolvedFindingIds: string[];
  reopenedFindingIds: string[];
  activeFindingIds: string[];
};

export type ConsistencySettings = {
  id: string;
  worldId: string;
  disabledRuleIds: string[];
  requireTemplateFields: boolean;
  detectRouteRevisits: boolean;
  maxMissingTemplateFields: number;
  maxRouteMarkerVisits: number;
  updatedAt: string;
};

export type ConsistencyModelSettings = {
  id: string;
  worldId: string;
  enabled: boolean;
  provider: "local" | "openai-compatible";
  endpoint: string;
  model: string;
  temperature: number;
  updatedAt: string;
};

export type ConsistencyRule = {
  id: string;
  category: ConsistencyCategory;
  severity: ConsistencySeverity;
  label: string;
  description: string;
  defaultEnabled: boolean;
};

export type ConsistencyEntity = {
  id: string;
  worldId: string;
  type: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  visibility: string;
  templateData: Record<string, string>;
};

export type ConsistencyQuestStep = {
  id: string;
  title: string;
  condition: string;
  branch: string;
  failure: string;
};

export type ConsistencyQuest = {
  id: string;
  worldId: string;
  title: string;
  status: string;
  relatedEntityIds: string[];
  prerequisiteQuestIds: string[];
  steps: ConsistencyQuestStep[];
};

export type ConsistencyRelation = {
  id: string;
  worldId: string;
  sourceEntityId: string;
  targetEntityId: string;
  kind: string;
  label: string;
  direction: string;
};

export type ConsistencyWorkspaceInput = {
  worldId: string;
  worldName: string;
  entities: ConsistencyEntity[];
  quests: ConsistencyQuest[];
  storyVariables: StoryVariable[];
  storyScenes: StoryScene[];
  storyTestRuns: StoryTestRun[];
  maps: WorldMap[];
  mapMarkers: MapMarker[];
  mapRoutes: MapRoute[];
  timelineTracks: TimelineTrack[];
  timelineEvents: TimelineEvent[];
  relations: ConsistencyRelation[];
  manuscript?: ManuscriptWorkspaceData;
};

type RawFinding = Omit<
  ConsistencyFinding,
  | "id"
  | "worldId"
  | "fingerprint"
  | "status"
  | "statusReason"
  | "detected"
  | "firstSeenAt"
  | "lastSeenAt"
  | "statusUpdatedAt"
  | "lastDetectedScanId"
  | "explanation"
> & { fingerprintHint?: string };

export const consistencyRules: ConsistencyRule[] = [
  {
    id: "ID-001",
    category: "identity",
    severity: "major",
    label: "重复条目标题",
    description: "同一世界内多个条目使用相同标题，会让链接和搜索产生歧义。",
    defaultEnabled: true
  },
  {
    id: "ID-002",
    category: "identity",
    severity: "major",
    label: "重复条目 slug",
    description: "多个条目使用相同 slug，导出或后续发布时无法稳定寻址。",
    defaultEnabled: true
  },
  {
    id: "REF-001",
    category: "references",
    severity: "major",
    label: "失效双向链接",
    description: "正文中的 [[条目]] 找不到对应条目。",
    defaultEnabled: true
  },
  {
    id: "REF-002",
    category: "references",
    severity: "critical",
    label: "歧义双向链接",
    description: "正文链接能匹配多个同名条目，无法确定目标。",
    defaultEnabled: true
  },
  {
    id: "TPL-001",
    category: "templates",
    severity: "minor",
    label: "关键模板字段缺失",
    description: "生产阶段常用的模板字段尚未填写。",
    defaultEnabled: true
  },
  {
    id: "PRV-001",
    category: "privacy",
    severity: "critical",
    label: "公开条目包含秘密",
    description: "公开可见条目填写了秘密字段，可能造成剧情泄露。",
    defaultEnabled: true
  },
  {
    id: "QST-001",
    category: "quests",
    severity: "critical",
    label: "任务依赖形成闭环",
    description: "前置任务互相依赖，玩家无法满足启动条件。",
    defaultEnabled: true
  },
  {
    id: "QST-002",
    category: "quests",
    severity: "major",
    label: "活动任务没有步骤",
    description: "活动或已实现任务缺少可执行步骤。",
    defaultEnabled: true
  },
  {
    id: "QST-003",
    category: "quests",
    severity: "minor",
    label: "任务分支缺少条件",
    description: "任务步骤声明了分支或失败路径，但没有进入条件。",
    defaultEnabled: true
  },
  {
    id: "STY-001",
    category: "story",
    severity: "major",
    label: "说话人未关联场景",
    description: "对白节点使用了人物，但场景关联内容中没有该条目。",
    defaultEnabled: true
  },
  {
    id: "STY-002",
    category: "story",
    severity: "major",
    label: "已确认场景未通过测试",
    description: "标记为已确认的场景尚无通过记录。",
    defaultEnabled: true
  },
  {
    id: "STY-003",
    category: "story",
    severity: "major",
    label: "时间点的场景任务关联不一致",
    description: "同一时间点关联了场景与任务，但场景没有关联该任务。",
    defaultEnabled: true
  },
  {
    id: "MS-001",
    category: "manuscript",
    severity: "major",
    label: "已回收线索缺少有效落点",
    description: "线索标记为已回收，但对应章节或场景已缺失。",
    defaultEnabled: true
  },
  {
    id: "MS-002",
    category: "manuscript",
    severity: "major",
    label: "线索回收早于埋设",
    description: "按当前书稿顺序，伏笔回收位置不晚于埋设位置。",
    defaultEnabled: true
  },
  {
    id: "MS-003",
    category: "manuscript",
    severity: "major",
    label: "人物知识状态倒退",
    description: "同一人物对同一事实的知情程度在后续章节无解释地降低。",
    defaultEnabled: true
  },
  {
    id: "MS-004",
    category: "manuscript",
    severity: "major",
    label: "章节时间顺序反转",
    description: "章节或场景的开始时间晚于结束时间。",
    defaultEnabled: true
  },
  {
    id: "MAP-001",
    category: "maps",
    severity: "minor",
    label: "地图标记未关联内容",
    description: "标记没有关联条目、任务或剧情场景。",
    defaultEnabled: true
  },
  {
    id: "MAP-002",
    category: "maps",
    severity: "minor",
    label: "路线重复经过同一标记",
    description: "路线中同一地图标记出现多次，可能是误操作。",
    defaultEnabled: false
  },
  {
    id: "MAP-003",
    category: "maps",
    severity: "major",
    label: "事件标记缺少时间点",
    description: "地图上的事件标记没有出现在时间线中。",
    defaultEnabled: true
  },
  {
    id: "TML-001",
    category: "timeline",
    severity: "critical",
    label: "前置事件排序不早于当前事件",
    description: "时间依赖与排序值相矛盾。",
    defaultEnabled: true
  },
  {
    id: "TML-002",
    category: "timeline",
    severity: "minor",
    label: "时间点排序值冲突",
    description: "多个时间点使用相同精确排序值。",
    defaultEnabled: true
  },
  {
    id: "TML-003",
    category: "timeline",
    severity: "critical",
    label: "事件条目与时间线日期冲突",
    description: "事件模板中的时间与时间线显示日期不一致。",
    defaultEnabled: true
  },
  {
    id: "TML-004",
    category: "timeline",
    severity: "major",
    label: "时间区间顺序反转",
    description: "时间点的开始值晚于结束值。",
    defaultEnabled: true
  },
  {
    id: "REL-001",
    category: "relations",
    severity: "minor",
    label: "重复显式关系",
    description: "相同端点与类型的显式关系重复存在。",
    defaultEnabled: true
  }
];

const ruleMap = new Map(consistencyRules.map((rule) => [rule.id, rule]));

const requiredTemplateFields: Record<string, Array<{ key: string; label: string }>> = {
  character: [
    { key: "goals", label: "目标" },
    { key: "birthplace", label: "出生地" }
  ],
  location: [
    { key: "category", label: "类型" },
    { key: "region", label: "所属区域" }
  ],
  faction: [
    { key: "leader", label: "领袖" },
    { key: "goals", label: "目标" }
  ],
  event: [
    { key: "time", label: "时间" },
    { key: "place", label: "地点" },
    { key: "cause", label: "起因" },
    { key: "result", label: "结果" }
  ],
  item: [
    { key: "category", label: "类型" },
    { key: "origin", label: "来源" }
  ],
  note: [{ key: "topic", label: "主题" }]
};

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
}

function compactDate(value: string) {
  return normalizeText(value).replace(/[\s·,，。._/-]+/g, "");
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function extractMentions(content: string) {
  return unique(
    Array.from(content.matchAll(/\[\[([^\]]+)\]\]/g))
      .map((match) => match[1].trim())
      .filter(Boolean)
  );
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function createConsistencyFingerprint(
  ruleId: string,
  primaryTarget: ConsistencyTarget,
  relatedTargets: ConsistencyTarget[] = [],
  hint = ""
) {
  const related = relatedTargets
    .map((target) => `${target.type}:${target.id}`)
    .sort()
    .join("|");
  return `${ruleId}:${primaryTarget.type}:${primaryTarget.id}:${related}:${normalizeText(hint)}`;
}

export function createDefaultConsistencySettings(worldId: string): ConsistencySettings {
  return {
    id: `consistency-settings:${worldId}`,
    worldId,
    disabledRuleIds: consistencyRules
      .filter((rule) => !rule.defaultEnabled)
      .map((rule) => rule.id),
    requireTemplateFields: true,
    detectRouteRevisits: false,
    maxMissingTemplateFields: 0,
    maxRouteMarkerVisits: 1,
    updatedAt: new Date().toISOString()
  };
}

export function normalizeConsistencySettings(
  input: Partial<ConsistencySettings>,
  worldId: string
): ConsistencySettings {
  const defaults = createDefaultConsistencySettings(worldId);
  return {
    ...defaults,
    ...input,
    id: input.id || defaults.id,
    worldId,
    disabledRuleIds: Array.isArray(input.disabledRuleIds)
      ? unique(input.disabledRuleIds.filter((id) => ruleMap.has(id)))
      : defaults.disabledRuleIds,
    requireTemplateFields: input.requireTemplateFields !== false,
    detectRouteRevisits: input.detectRouteRevisits === true,
    maxMissingTemplateFields: Number.isFinite(Number(input.maxMissingTemplateFields))
      ? Math.max(0, Math.min(20, Math.floor(Number(input.maxMissingTemplateFields))))
      : defaults.maxMissingTemplateFields,
    maxRouteMarkerVisits: Number.isFinite(Number(input.maxRouteMarkerVisits))
      ? Math.max(1, Math.min(10, Math.floor(Number(input.maxRouteMarkerVisits))))
      : defaults.maxRouteMarkerVisits,
    updatedAt: input.updatedAt || defaults.updatedAt
  };
}

export function createDefaultConsistencyModelSettings(
  worldId: string
): ConsistencyModelSettings {
  return {
    id: `consistency-model-settings:${worldId}`,
    worldId,
    enabled: false,
    provider: "local",
    endpoint: "http://127.0.0.1:11434/v1",
    model: "",
    temperature: 0.2,
    updatedAt: new Date().toISOString()
  };
}

export function normalizeConsistencyModelSettings(
  input: Partial<ConsistencyModelSettings>,
  worldId: string
): ConsistencyModelSettings {
  const defaults = createDefaultConsistencyModelSettings(worldId);
  const temperature = Number(input.temperature);
  return {
    ...defaults,
    ...input,
    id: input.id || defaults.id,
    worldId,
    enabled: input.enabled === true,
    provider: input.provider === "openai-compatible" ? "openai-compatible" : "local",
    endpoint: typeof input.endpoint === "string" ? input.endpoint.trim() : defaults.endpoint,
    model: typeof input.model === "string" ? input.model.trim() : "",
    temperature: Number.isFinite(temperature)
      ? Math.max(0, Math.min(1, temperature))
      : defaults.temperature,
    updatedAt: input.updatedAt || defaults.updatedAt
  };
}

export function normalizeConsistencyFinding(
  input: Partial<ConsistencyFinding>,
  worldId: string
): ConsistencyFinding {
  const timestamp = new Date().toISOString();
  const primaryTarget: ConsistencyTarget = input.primaryTarget ?? {
    type: "world",
    id: worldId,
    label: "世界"
  };
  const relatedTargets = Array.isArray(input.relatedTargets) ? input.relatedTargets : [];
  const rule = ruleMap.get(input.ruleId || "") ?? consistencyRules[0];
  const fingerprint =
    input.fingerprint ||
    createConsistencyFingerprint(rule.id, primaryTarget, relatedTargets, input.title || "");
  return {
    id: input.id || `consistency-${stableHash(fingerprint)}`,
    worldId,
    fingerprint,
    ruleId: input.ruleId || rule.id,
    category: input.category || rule.category,
    severity: ["critical", "major", "minor"].includes(input.severity || "")
      ? (input.severity as ConsistencySeverity)
      : rule.severity,
    status: ["open", "ignored", "resolved"].includes(input.status || "")
      ? (input.status as ConsistencyStatus)
      : "open",
    statusReason: input.statusReason || "",
    title: input.title || rule.label,
    detail: input.detail || "",
    suggestion: input.suggestion || "检查相关内容并手动确认。",
    primaryTarget,
    relatedTargets,
    evidence: Array.isArray(input.evidence) ? input.evidence : [],
    detected: input.detected !== false,
    firstSeenAt: input.firstSeenAt || timestamp,
    lastSeenAt: input.lastSeenAt || timestamp,
    statusUpdatedAt: input.statusUpdatedAt || timestamp,
    lastDetectedScanId: input.lastDetectedScanId || "",
    explanation: input.explanation?.text
      ? {
          text: input.explanation.text,
          model: input.explanation.model || "local",
          generatedAt: input.explanation.generatedAt || timestamp
        }
      : undefined
  };
}

export function normalizeConsistencyScan(
  input: Partial<ConsistencyScan>,
  worldId: string
): ConsistencyScan {
  const timestamp = new Date().toISOString();
  return {
    id: input.id || createId("consistency-scan"),
    worldId,
    startedAt: input.startedAt || timestamp,
    completedAt: input.completedAt || timestamp,
    totalDetected: Math.max(0, Number(input.totalDetected) || 0),
    openCount: Math.max(0, Number(input.openCount) || 0),
    ignoredCount: Math.max(0, Number(input.ignoredCount) || 0),
    criticalCount: Math.max(0, Number(input.criticalCount) || 0),
    majorCount: Math.max(0, Number(input.majorCount) || 0),
    minorCount: Math.max(0, Number(input.minorCount) || 0),
    newFindingIds: Array.isArray(input.newFindingIds) ? unique(input.newFindingIds) : [],
    resolvedFindingIds: Array.isArray(input.resolvedFindingIds)
      ? unique(input.resolvedFindingIds)
      : [],
    reopenedFindingIds: Array.isArray(input.reopenedFindingIds)
      ? unique(input.reopenedFindingIds)
      : [],
    activeFindingIds: Array.isArray(input.activeFindingIds)
      ? unique(input.activeFindingIds)
      : []
  };
}

function target(type: ConsistencyTargetType, id: string, label: string): ConsistencyTarget {
  return { type, id, label: label || "未命名内容" };
}

function evidence(
  label: string,
  value: string,
  field = "",
  evidenceTarget?: ConsistencyTarget
): ConsistencyEvidence {
  return { label, value, field, target: evidenceTarget };
}

function detectQuestCycleIds(quests: ConsistencyQuest[]) {
  const questMap = new Map(quests.map((quest) => [quest.id, quest]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const cycleIds = new Set<string>();

  function visit(id: string) {
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      stack.slice(Math.max(0, start)).forEach((item) => cycleIds.add(item));
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    stack.push(id);
    const quest = questMap.get(id);
    quest?.prerequisiteQuestIds.forEach((dependencyId) => {
      if (questMap.has(dependencyId)) visit(dependencyId);
    });
    stack.pop();
    visiting.delete(id);
    visited.add(id);
  }

  quests.forEach((quest) => visit(quest.id));
  return Array.from(cycleIds).sort();
}

function collectRawFindings(
  input: ConsistencyWorkspaceInput,
  settings: ConsistencySettings
): RawFinding[] {
  const findings: RawFinding[] = [];
  const disabled = new Set(settings.disabledRuleIds);
  if (!settings.requireTemplateFields) disabled.add("TPL-001");
  if (!settings.detectRouteRevisits) disabled.add("MAP-002");

  function push(
    ruleId: string,
    primaryTarget: ConsistencyTarget,
    title: string,
    detail: string,
    suggestion: string,
    findingEvidence: ConsistencyEvidence[] = [],
    relatedTargets: ConsistencyTarget[] = [],
    fingerprintHint = ""
  ) {
    if (disabled.has(ruleId)) return;
    const rule = ruleMap.get(ruleId);
    if (!rule) return;
    findings.push({
      ruleId,
      category: rule.category,
      severity: rule.severity,
      title,
      detail,
      suggestion,
      primaryTarget,
      relatedTargets,
      evidence: findingEvidence,
      fingerprintHint
    });
  }

  const entities = input.entities.filter((entity) => entity.worldId === input.worldId);
  const quests = input.quests.filter((quest) => quest.worldId === input.worldId);
  const scenes = input.storyScenes.filter((scene) => scene.worldId === input.worldId);
  const runs = input.storyTestRuns.filter((run) => run.worldId === input.worldId);
  const maps = input.maps.filter((mapItem) => mapItem.worldId === input.worldId);
  const mapIds = new Set(maps.map((mapItem) => mapItem.id));
  const markers = input.mapMarkers.filter((marker) => mapIds.has(marker.mapId));
  const routes = input.mapRoutes.filter((route) => route.worldId === input.worldId);
  const tracks = input.timelineTracks.filter((track) => track.worldId === input.worldId);
  const timelineEvents = input.timelineEvents.filter(
    (timelineEvent) => timelineEvent.worldId === input.worldId
  );
  const relations = input.relations.filter((relation) => relation.worldId === input.worldId);
  const entityMap = new Map(entities.map((entity) => [entity.id, entity]));
  const questMap = new Map(quests.map((quest) => [quest.id, quest]));
  const sceneMap = new Map(scenes.map((scene) => [scene.id, scene]));
  const timelineMap = new Map(timelineEvents.map((timelineEvent) => [timelineEvent.id, timelineEvent]));

  const titleGroups = new Map<string, ConsistencyEntity[]>();
  entities.forEach((entity) => {
    const key = normalizeText(entity.title);
    if (!key) return;
    titleGroups.set(key, [...(titleGroups.get(key) ?? []), entity]);
  });
  titleGroups.forEach((group, normalizedTitle) => {
    if (group.length < 2) return;
    const primary = group[0];
    const related = group.slice(1).map((entity) => target("entity", entity.id, entity.title));
    push(
      "ID-001",
      target("entity", primary.id, primary.title),
      `“${primary.title}”存在 ${group.length} 个同名条目`,
      "双向链接与搜索结果无法唯一确定目标。",
      "重命名其中一个条目，或合并重复内容。",
      group.map((entity) => evidence("同名条目", entity.title, "title", target("entity", entity.id, entity.title))),
      related,
      normalizedTitle
    );
  });

  const slugGroups = new Map<string, ConsistencyEntity[]>();
  entities.forEach((entity) => {
    const key = normalizeText(entity.slug);
    if (!key) return;
    slugGroups.set(key, [...(slugGroups.get(key) ?? []), entity]);
  });
  slugGroups.forEach((group, slug) => {
    if (group.length < 2) return;
    const primary = group[0];
    push(
      "ID-002",
      target("entity", primary.id, primary.title),
      `slug “${slug}”被多个条目使用`,
      group.map((entity) => entity.title).join("、"),
      "调整标题或手动修改 slug，确保导出标识唯一。",
      group.map((entity) => evidence("slug", entity.slug, "slug", target("entity", entity.id, entity.title))),
      group.slice(1).map((entity) => target("entity", entity.id, entity.title)),
      slug
    );
  });

  entities.forEach((entity) => {
    extractMentions(entity.content).forEach((mention) => {
      const candidates = titleGroups.get(normalizeText(mention)) ?? [];
      if (!candidates.length) {
        push(
          "REF-001",
          target("entity", entity.id, entity.title),
          `${entity.title}包含失效链接 [[${mention}]]`,
          "当前世界中没有同名条目。",
          "创建对应条目，或把链接文字改为现有条目标题。",
          [evidence("正文链接", `[[${mention}]]`, "content")],
          [],
          mention
        );
      } else if (candidates.length > 1) {
        push(
          "REF-002",
          target("entity", entity.id, entity.title),
          `${entity.title}中的 [[${mention}]] 存在歧义`,
          `该链接可匹配 ${candidates.length} 个条目。`,
          "先消除同名条目，再重新扫描。",
          [evidence("歧义链接", `[[${mention}]]`, "content")],
          candidates.map((candidate) => target("entity", candidate.id, candidate.title)),
          mention
        );
      }
    });

    const requiredFields = requiredTemplateFields[entity.type] ?? [];
    const missingFields = requiredFields.filter(
      (field) => !String(entity.templateData[field.key] ?? "").trim()
    );
    if (missingFields.length > settings.maxMissingTemplateFields) {
      push(
        "TPL-001",
        target("entity", entity.id, entity.title),
        `${entity.title}缺少关键模板字段`,
        missingFields.map((field) => field.label).join("、"),
        "补齐参与剧情生产所需的最小结构化信息。",
        missingFields.map((field) => evidence(field.label, "未填写", `templateData.${field.key}`)),
        [],
        missingFields.map((field) => field.key).join("|")
      );
    }

    if (entity.visibility === "public" && String(entity.templateData.secrets ?? "").trim()) {
      push(
        "PRV-001",
        target("entity", entity.id, entity.title),
        `${entity.title}公开可见但包含秘密字段`,
        entity.templateData.secrets,
        "将条目改为私密/秘密，或移除公开内容中的剧透。",
        [evidence("秘密", entity.templateData.secrets, "templateData.secrets")]
      );
    }
  });

  const cycleIds = detectQuestCycleIds(quests);
  if (cycleIds.length) {
    const cycleQuests = cycleIds.map((id) => questMap.get(id)).filter(Boolean) as ConsistencyQuest[];
    const primary = cycleQuests[0];
    push(
      "QST-001",
      target("quest", primary.id, primary.title),
      "任务依赖形成闭环",
      cycleQuests.map((quest) => quest.title).join(" → "),
      "移除至少一条前置关系，使依赖图恢复为有向无环图。",
      cycleQuests.map((quest) => evidence("循环成员", quest.title, "prerequisiteQuestIds", target("quest", quest.id, quest.title))),
      cycleQuests.slice(1).map((quest) => target("quest", quest.id, quest.title)),
      cycleIds.join("|")
    );
  }

  quests.forEach((quest) => {
    if (["active", "implemented"].includes(quest.status) && !quest.steps.length) {
      push(
        "QST-002",
        target("quest", quest.id, quest.title),
        `${quest.title}已进入生产但没有步骤`,
        `当前状态：${quest.status}`,
        "添加至少一个可执行任务步骤，或把状态改回草稿。",
        [evidence("任务状态", quest.status, "status")]
      );
    }
    const incompleteSteps = quest.steps.filter(
      (step) => (step.branch.trim() || step.failure.trim()) && !step.condition.trim()
    );
    if (incompleteSteps.length) {
      push(
        "QST-003",
        target("quest", quest.id, quest.title),
        `${quest.title}有分支步骤缺少条件`,
        incompleteSteps.map((step) => step.title).join("、"),
        "为分支或失败路径补充明确触发条件。",
        incompleteSteps.map((step) => evidence("任务步骤", step.title, `steps.${step.id}.condition`)),
        [],
        incompleteSteps.map((step) => step.id).join("|")
      );
    }
  });

  scenes.forEach((scene) => {
    const speakerIds = unique(
      scene.nodes.map((node) => node.speakerEntityId).filter(Boolean)
    );
    const missingSpeakerIds = speakerIds.filter(
      (speakerId) => !scene.relatedEntityIds.includes(speakerId)
    );
    if (missingSpeakerIds.length) {
      push(
        "STY-001",
        target("scene", scene.id, scene.title),
        `${scene.title}的说话人未加入场景关联`,
        missingSpeakerIds.map((id) => entityMap.get(id)?.title ?? id).join("、"),
        "把说话人加入场景关联条目，方便任务、时间线与地图交叉检索。",
        missingSpeakerIds.map((id) => evidence("说话人", entityMap.get(id)?.title ?? id, "nodes.speakerEntityId", target("entity", id, entityMap.get(id)?.title ?? id))),
        missingSpeakerIds.map((id) => target("entity", id, entityMap.get(id)?.title ?? id)),
        missingSpeakerIds.join("|")
      );
    }
    if (
      scene.status === "ready" &&
      !runs.some((run) => run.sceneId === scene.id && run.status === "passed")
    ) {
      push(
        "STY-002",
        target("scene", scene.id, scene.title),
        `${scene.title}已确认但没有通过记录`,
        "场景状态为已确认，测试记录中没有 passed 结果。",
        "运行剧情测试并保存通过结果，或将场景状态改为待审。",
        [evidence("场景状态", "ready", "status")]
      );
    }
  });

  timelineEvents.forEach((timelineEvent) => {
    const scene = sceneMap.get(timelineEvent.sceneId);
    const quest = questMap.get(timelineEvent.questId);
    if (scene && quest && !scene.relatedQuestIds.includes(quest.id)) {
      push(
        "STY-003",
        target("timeline", timelineEvent.id, timelineEvent.title || timelineEvent.displayDate),
        `${timelineEvent.title || timelineEvent.displayDate}的场景与任务关联不一致`,
        `${scene.title}没有关联任务 ${quest.title}`,
        "在剧情场景中关联该任务，或移除时间点上的错误任务关联。",
        [
          evidence("剧情场景", scene.title, "sceneId", target("scene", scene.id, scene.title)),
          evidence("任务", quest.title, "questId", target("quest", quest.id, quest.title))
        ],
        [target("scene", scene.id, scene.title), target("quest", quest.id, quest.title)]
      );
    }
  });

  markers.forEach((marker) => {
    if (!marker.entityId && !marker.questId && !marker.sceneId) {
      push(
        "MAP-001",
        target("marker", marker.id, marker.label),
        `${marker.label}没有关联任何内容`,
        "标记目前只保存了坐标。",
        "关联条目、任务或剧情场景，使标记进入项目导航与搜索。",
        [evidence("地图标记", marker.label, "references")]
      );
    }
    const linkedEntity = entityMap.get(marker.entityId);
    const isEventMarker = marker.markerType === "event" || linkedEntity?.type === "event";
    const hasTimelineEvent = timelineEvents.some(
      (timelineEvent) =>
        (marker.entityId && timelineEvent.entityId === marker.entityId) ||
        (marker.questId && timelineEvent.questId === marker.questId) ||
        (marker.sceneId && timelineEvent.sceneId === marker.sceneId)
    );
    if (isEventMarker && !hasTimelineEvent) {
      push(
        "MAP-003",
        target("marker", marker.id, marker.label),
        `${marker.label}是事件标记但没有时间点`,
        linkedEntity?.title || marker.description || "未关联事件说明",
        "创建并关联时间点，使地图事件进入历史与依赖检查。",
        [evidence("事件标记", marker.label, "markerType")],
        linkedEntity ? [target("entity", linkedEntity.id, linkedEntity.title)] : []
      );
    }
  });

  routes.forEach((route) => {
    const counts = new Map<string, number>();
    route.stops.forEach((stop) => counts.set(stop.markerId, (counts.get(stop.markerId) ?? 0) + 1));
    const repeatedIds = Array.from(counts.entries())
      .filter(([, count]) => count > settings.maxRouteMarkerVisits)
      .map(([id]) => id);
    if (repeatedIds.length) {
      push(
        "MAP-002",
        target("route", route.id, route.title),
        `${route.title}重复经过同一标记`,
        repeatedIds
          .map((id) => markers.find((marker) => marker.id === id)?.label ?? id)
          .join("、"),
        "确认这是有意折返；否则移除重复停靠点。",
        repeatedIds.map((id) => evidence("重复标记", markers.find((marker) => marker.id === id)?.label ?? id, "stops", target("marker", id, markers.find((marker) => marker.id === id)?.label ?? id))),
        repeatedIds.map((id) => target("marker", id, markers.find((marker) => marker.id === id)?.label ?? id)),
        repeatedIds.join("|")
      );
    }
  });

  timelineEvents.forEach((timelineEvent) => {
    timelineEvent.dependencyIds.forEach((dependencyId) => {
      const dependency = timelineMap.get(dependencyId);
      if (dependency && dependency.sortOrder >= timelineEvent.sortOrder) {
        push(
          "TML-001",
          target("timeline", timelineEvent.id, timelineEvent.title || timelineEvent.displayDate),
          `${timelineEvent.title || timelineEvent.displayDate}的前置事件排序过晚`,
          `${dependency.title || dependency.displayDate}（${dependency.sortOrder}）不早于当前事件（${timelineEvent.sortOrder}）`,
          "调整精确排序值或移除错误的前置关系。",
          [
            evidence("当前排序", String(timelineEvent.sortOrder), "sortOrder"),
            evidence("前置排序", String(dependency.sortOrder), "dependencyIds", target("timeline", dependency.id, dependency.title || dependency.displayDate))
          ],
          [target("timeline", dependency.id, dependency.title || dependency.displayDate)],
          dependencyId
        );
      }
    });

    const linkedEntity = entityMap.get(timelineEvent.entityId);
    const entityTime = linkedEntity?.type === "event" ? linkedEntity.templateData.time?.trim() : "";
    if (
      linkedEntity &&
      entityTime &&
      timelineEvent.displayDate.trim() &&
      timelineEvent.displayDate !== "未定时间" &&
      compactDate(entityTime) !== compactDate(timelineEvent.displayDate)
    ) {
      push(
        "TML-003",
        target("timeline", timelineEvent.id, timelineEvent.title || linkedEntity.title),
        `${linkedEntity.title}存在两个不同日期`,
        `条目模板：${entityTime}；时间线：${timelineEvent.displayDate}`,
        "确认正确日期，并同步事件模板与时间线。",
        [
          evidence("事件模板时间", entityTime, "templateData.time", target("entity", linkedEntity.id, linkedEntity.title)),
          evidence("时间线日期", timelineEvent.displayDate, "displayDate")
        ],
        [target("entity", linkedEntity.id, linkedEntity.title)]
      );
    }

    const start = Number(timelineEvent.startValue);
    const end = Number(timelineEvent.endValue);
    if (
      timelineEvent.startValue &&
      timelineEvent.endValue &&
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      start > end
    ) {
      push(
        "TML-004",
        target("timeline", timelineEvent.id, timelineEvent.title || timelineEvent.displayDate),
        `${timelineEvent.title || timelineEvent.displayDate}的时间区间顺序反转`,
        `${timelineEvent.startValue} > ${timelineEvent.endValue}`,
        "交换开始值和结束值，或修正录入的排序数字。",
        [
          evidence("开始值", timelineEvent.startValue, "startValue"),
          evidence("结束值", timelineEvent.endValue, "endValue")
        ]
      );
    }
  });

  const sortGroups = new Map<string, TimelineEvent[]>();
  timelineEvents.forEach((timelineEvent) => {
    const key = String(timelineEvent.sortOrder);
    sortGroups.set(key, [...(sortGroups.get(key) ?? []), timelineEvent]);
  });
  sortGroups.forEach((group, sortOrder) => {
    if (group.length < 2) return;
    const primary = group[0];
    push(
      "TML-002",
      target("timeline", primary.id, primary.title || primary.displayDate),
      `${group.length} 个时间点使用排序值 ${sortOrder}`,
      group.map((item) => item.title || item.displayDate).join("、"),
      "为需要确定先后关系的时间点分配不同排序值。",
      group.map((item) => evidence("时间点", item.title || item.displayDate, "sortOrder", target("timeline", item.id, item.title || item.displayDate))),
      group.slice(1).map((item) => target("timeline", item.id, item.title || item.displayDate)),
      sortOrder
    );
  });

  const relationGroups = new Map<string, ConsistencyRelation[]>();
  relations.forEach((relation) => {
    const endpoints =
      relation.direction !== "directed"
        ? [relation.sourceEntityId, relation.targetEntityId].sort()
        : [relation.sourceEntityId, relation.targetEntityId];
    const key = `${endpoints.join(":")}:${relation.kind}:${relation.direction}`;
    relationGroups.set(key, [...(relationGroups.get(key) ?? []), relation]);
  });
  relationGroups.forEach((group, key) => {
    if (group.length < 2) return;
    const primary = group[0];
    push(
      "REL-001",
      target("relation", primary.id, primary.label || "未命名关系"),
      "相同端点之间存在重复关系",
      group.map((relation) => relation.label || relation.kind).join("、"),
      "合并重复关系并保留最完整的备注和强度。",
      group.map((relation) => evidence("关系", relation.label || relation.kind, "relation", target("relation", relation.id, relation.label || relation.kind))),
      group.slice(1).map((relation) => target("relation", relation.id, relation.label || relation.kind)),
      key
    );
  });

  if (input.manuscript) {
    const manuscript = input.manuscript;
    const books = new Map(manuscript.manuscriptBooks.map((item) => [item.id, item]));
    const chapters = new Map(manuscript.manuscriptChapters.map((item) => [item.id, item]));
    const scenes = new Map(manuscript.manuscriptScenes.map((item) => [item.id, item]));
    const clues = new Map(manuscript.manuscriptClues.map((item) => [item.id, item]));
    const knowledge = new Map(
      manuscript.manuscriptKnowledgeStates.map((item) => [item.id, item])
    );
    const manuscriptTarget = (
      unitKind: "book" | "chapter" | "scene" | "clue" | "knowledge",
      unitId: string
    ): ConsistencyTarget => {
      if (unitKind === "book") {
        return target("manuscript-book", unitId, books.get(unitId)?.title || unitId);
      }
      if (unitKind === "chapter") {
        return target("manuscript-chapter", unitId, chapters.get(unitId)?.title || unitId);
      }
      if (unitKind === "scene") {
        return target("manuscript-scene", unitId, scenes.get(unitId)?.title || unitId);
      }
      if (unitKind === "clue") {
        return target("manuscript-clue", unitId, clues.get(unitId)?.title || unitId);
      }
      const item = knowledge.get(unitId);
      return target("manuscript-knowledge", unitId, item?.fact || unitId);
    };
    const relatedManuscriptTarget = (unitId: string) => {
      if (chapters.has(unitId)) return manuscriptTarget("chapter", unitId);
      if (scenes.has(unitId)) return manuscriptTarget("scene", unitId);
      return null;
    };

    manuscript.manuscriptBooks.forEach((book) => {
      validateManuscriptConsistency(manuscript, book.id).forEach((issue) => {
        if (disabled.has(issue.ruleId)) return;
        const rule = ruleMap.get(issue.ruleId);
        if (!rule) return;
        const primaryTarget = manuscriptTarget(issue.unitKind, issue.unitId);
        const relatedTargets = issue.relatedUnitIds
          .map(relatedManuscriptTarget)
          .filter((item): item is ConsistencyTarget => Boolean(item));
        findings.push({
          ruleId: issue.ruleId,
          category: "manuscript",
          severity: issue.severity,
          title: issue.title,
          detail: issue.detail,
          suggestion: issue.suggestion,
          primaryTarget,
          relatedTargets,
          evidence: [
            evidence("书稿", book.title, "bookId", manuscriptTarget("book", book.id)),
            ...relatedTargets.map((item) =>
              evidence("相关位置", item.label, "relatedUnitIds", item)
            )
          ],
          fingerprintHint: issue.id
        });
      });
    });
  }

  void tracks;
  return findings;
}

export function runConsistencyScan(
  input: ConsistencyWorkspaceInput,
  previousFindings: ConsistencyFinding[],
  rawSettings: ConsistencySettings,
  timestamp = new Date().toISOString()
) {
  const settings = normalizeConsistencySettings(rawSettings, input.worldId);
  const scanId = createId("consistency-scan");
  const previous = previousFindings
    .filter((finding) => finding.worldId === input.worldId)
    .map((finding) => normalizeConsistencyFinding(finding, input.worldId));
  const previousByFingerprint = new Map(previous.map((finding) => [finding.fingerprint, finding]));
  const rawFindings = collectRawFindings(input, settings);
  const detectedFingerprints = new Set<string>();
  const newFindingIds: string[] = [];
  const reopenedFindingIds: string[] = [];

  const detectedFindings = rawFindings.map((raw) => {
    const fingerprint = createConsistencyFingerprint(
      raw.ruleId,
      raw.primaryTarget,
      raw.relatedTargets,
      raw.fingerprintHint
    );
    detectedFingerprints.add(fingerprint);
    const existing = previousByFingerprint.get(fingerprint);
    const id = existing?.id ?? `consistency-${stableHash(fingerprint)}`;
    if (!existing) newFindingIds.push(id);
    if (existing?.status === "resolved") reopenedFindingIds.push(id);
    return normalizeConsistencyFinding(
      {
        ...raw,
        id,
        worldId: input.worldId,
        fingerprint,
        status: existing?.status === "ignored" ? "ignored" : "open",
        statusReason: existing?.status === "ignored" ? existing.statusReason : "",
        detected: true,
        firstSeenAt: existing?.firstSeenAt || timestamp,
        lastSeenAt: timestamp,
        statusUpdatedAt:
          existing?.status === "ignored" ? existing.statusUpdatedAt : timestamp,
        lastDetectedScanId: scanId,
        explanation: existing?.explanation
      },
      input.worldId
    );
  });

  const resolvedFindingIds: string[] = [];
  const historicalFindings = previous
    .filter((finding) => !detectedFingerprints.has(finding.fingerprint))
    .map((finding) => {
      if (finding.status === "open") resolvedFindingIds.push(finding.id);
      return normalizeConsistencyFinding(
        {
          ...finding,
          detected: false,
          status: finding.status === "open" ? "resolved" : finding.status,
          statusReason:
            finding.status === "open" ? "本次扫描未再检测到" : finding.statusReason,
          statusUpdatedAt: finding.status === "open" ? timestamp : finding.statusUpdatedAt
        },
        input.worldId
      );
    });
  const findings = [...detectedFindings, ...historicalFindings].sort((left, right) => {
    const severityOrder = { critical: 0, major: 1, minor: 2 } as const;
    if (left.detected !== right.detected) return left.detected ? -1 : 1;
    if (left.status !== right.status) return left.status === "open" ? -1 : 1;
    return severityOrder[left.severity] - severityOrder[right.severity] || left.title.localeCompare(right.title, "zh-CN");
  });
  const active = detectedFindings;
  const scan: ConsistencyScan = {
    id: scanId,
    worldId: input.worldId,
    startedAt: timestamp,
    completedAt: timestamp,
    totalDetected: active.length,
    openCount: active.filter((finding) => finding.status === "open").length,
    ignoredCount: active.filter((finding) => finding.status === "ignored").length,
    criticalCount: active.filter((finding) => finding.severity === "critical").length,
    majorCount: active.filter((finding) => finding.severity === "major").length,
    minorCount: active.filter((finding) => finding.severity === "minor").length,
    newFindingIds,
    resolvedFindingIds,
    reopenedFindingIds,
    activeFindingIds: active.map((finding) => finding.id)
  };

  return { findings, scan };
}

export function updateConsistencyFindingStatus(
  finding: ConsistencyFinding,
  status: ConsistencyStatus,
  reason = "",
  timestamp = new Date().toISOString()
) {
  return normalizeConsistencyFinding(
    {
      ...finding,
      status,
      statusReason: reason.trim(),
      statusUpdatedAt: timestamp
    },
    finding.worldId
  );
}

export function setConsistencyRuleEnabled(
  settings: ConsistencySettings,
  ruleId: string,
  enabled: boolean
) {
  const disabled = new Set(settings.disabledRuleIds);
  if (enabled) disabled.delete(ruleId);
  else disabled.add(ruleId);
  return normalizeConsistencySettings(
    {
      ...settings,
      disabledRuleIds: Array.from(disabled),
      detectRouteRevisits:
        ruleId === "MAP-002" ? enabled : settings.detectRouteRevisits,
      updatedAt: new Date().toISOString()
    },
    settings.worldId
  );
}

export function buildConsistencyMarkdownReport(
  worldName: string,
  findings: ConsistencyFinding[],
  scan?: ConsistencyScan
) {
  const active = findings.filter((finding) => finding.detected);
  const lines = [
    `# ${worldName} 一致性审阅报告`,
    "",
    `- 生成时间：${new Date().toISOString()}`,
    `- 当前发现：${active.length}`,
    `- 待处理：${active.filter((finding) => finding.status === "open").length}`,
    `- 已忽略：${active.filter((finding) => finding.status === "ignored").length}`,
    `- 严重：${active.filter((finding) => finding.severity === "critical").length}`,
    `- 重要：${active.filter((finding) => finding.severity === "major").length}`,
    `- 提示：${active.filter((finding) => finding.severity === "minor").length}`
  ];
  if (scan) {
    lines.push(
      `- 本次新增：${scan.newFindingIds.length}`,
      `- 本次消失：${scan.resolvedFindingIds.length}`
    );
  }
  lines.push("");
  active.forEach((finding, index) => {
    lines.push(
      `## ${index + 1}. ${finding.title}`,
      "",
      `- 规则：${finding.ruleId}`,
      `- 严重程度：${finding.severity}`,
      `- 状态：${finding.status}`,
      `- 主要对象：${finding.primaryTarget.label}`,
      `- 详情：${finding.detail}`,
      `- 建议：${finding.suggestion}`
    );
    if (finding.statusReason) lines.push(`- 处置说明：${finding.statusReason}`);
    finding.evidence.forEach((item) => lines.push(`- 证据 · ${item.label}：${item.value}`));
    if (finding.explanation?.text) lines.push("", "### AI 模型补充解释", "", finding.explanation.text);
    lines.push("");
  });
  return lines.join("\n");
}

export function buildConsistencyModelPrompt(
  worldName: string,
  finding: ConsistencyFinding
) {
  const evidenceLines = finding.evidence
    .map((item) => `- ${item.label}：${item.value}`)
    .join("\n");
  return `你是游戏叙事一致性审阅助手。只解释给定证据，不虚构世界设定，不直接改写用户内容。\n\n世界：${worldName}\n规则：${finding.ruleId}\n问题：${finding.title}\n详情：${finding.detail}\n证据：\n${evidenceLines || "- 无附加证据"}\n\n请用中文输出：1. 为什么这可能造成生产问题；2. 用户应核对的两个具体位置；3. 一条最小修复建议。`;
}

export function isLoopbackModelEndpoint(endpoint: string) {
  try {
    const url = new URL(endpoint);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      ["127.0.0.1", "localhost", "::1", "[::1]"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

export function isSupportedModelEndpoint(
  endpoint: string,
  provider: ConsistencyModelSettings["provider"]
) {
  try {
    const url = new URL(endpoint);
    if (url.username || url.password || !["http:", "https:"].includes(url.protocol)) {
      return false;
    }
    const loopback = ["127.0.0.1", "localhost", "::1", "[::1]"].includes(url.hostname);
    return provider === "local" ? loopback : loopback || url.protocol === "https:";
  } catch {
    return false;
  }
}
