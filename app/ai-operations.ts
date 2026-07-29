import {
  normalizeStoryScene,
  normalizeStoryVariable,
  validateStoryScene,
  type StoryScene,
  type StoryValue,
  type StoryVariable
} from "./story";
import {
  normalizeStoryReviewIssue,
  normalizeStoryTestPreset,
  type StoryReviewIssue,
  type StoryTestPreset,
  type StoryTestRun
} from "./story-testing";
import {
  createDefaultMapLayer,
  defaultMapLayerId,
  normalizeMapLayer,
  normalizeMapMarker,
  normalizeMapMarkerGroup,
  normalizeMapRoute,
  normalizeWorldMap,
  normalizeTimelineEvent,
  normalizeTimelineTrack,
  validateMapPlanning,
  validateTimelinePlanning,
  type MapLayer,
  type MapMarker,
  type MapMarkerGroup,
  type MapRoute,
  type TimelineEvent,
  type TimelineTrack,
  type WorldMap
} from "./world-planning";
import {
  normalizeNarrativeMilestone,
  validateNarrativeMilestones,
  type NarrativeMilestone
} from "./narrative-production";
import {
  normalizeManuscriptBook,
  normalizeManuscriptChapter,
  normalizeManuscriptScene,
  normalizeManuscriptVolume,
  type ManuscriptBook,
  type ManuscriptChapter,
  type ManuscriptScene,
  type ManuscriptVolume
} from "./manuscript";
import {
  getDefaultCodexCategoryId,
  normalizeCodexHierarchy,
  validateCodexHierarchy,
  type CodexCategory,
  type CodexCategoryIcon
} from "./codex-tree";
import {
  normalizeEntityTemplate,
  validateEntityTemplates,
  type EntityTemplateDefinition
} from "./entity-templates";
import {
  projectObjectKinds,
  type ProjectObjectKind,
  type ProjectObjectRef
} from "./project-references";

export type AiOperationTarget =
  | "world"
  | "codex-category"
  | "entity-template"
  | "entity"
  | "quest"
  | "story-variable"
  | "story-scene"
  | "story-test-preset"
  | "story-review-issue"
  | "relation"
  | "asset"
  | "member"
  | "map"
  | "map-layer"
  | "map-marker-group"
  | "map-marker"
  | "map-route"
  | "narrative-milestone"
  | "manuscript-book"
  | "manuscript-volume"
  | "manuscript-chapter"
  | "manuscript-scene"
  | "timeline-track"
  | "timeline-event";
export type AiOperationAction = "create" | "update" | "delete";
export type AiOperationCollection =
  | "worlds"
  | "codexCategories"
  | "entityTemplates"
  | "entities"
  | "quests"
  | "storyVariables"
  | "storyScenes"
  | "storyTestPresets"
  | "storyReviewIssues"
  | "relations"
  | "assets"
  | "members"
  | "maps"
  | "mapLayers"
  | "mapMarkerGroups"
  | "mapMarkers"
  | "mapRoutes"
  | "narrativeMilestones"
  | "manuscriptBooks"
  | "manuscriptVolumes"
  | "manuscriptChapters"
  | "manuscriptScenes"
  | "timelineTracks"
  | "timelineEvents";

export type AiProjectOperation = {
  id: string;
  action: AiOperationAction;
  target: AiOperationTarget;
  targetId: string;
  ref: string;
  data: Record<string, unknown>;
};

export type AiOperationPlan = {
  summary: string;
  operations: AiProjectOperation[];
};

export type AiOperationChange = {
  id: string;
  target: AiOperationTarget;
  collection: AiOperationCollection;
  action: AiOperationAction;
  itemId: string;
  label: string;
  before: unknown | null;
  after: unknown | null;
  beforeIndex: number;
};

export type AiOperationRun = {
  id: string;
  worldId: string;
  instruction: string;
  summary: string;
  model: string;
  status: "applied" | "undone" | "archived";
  operations: AiProjectOperation[];
  changes: AiOperationChange[];
  checkpointCreatedAt: string;
  createdAt: string;
  updatedAt: string;
  undoneAt: string;
};

export type AiRecordedWorkspaceChange = {
  worldId: string;
  target: AiOperationTarget;
  itemId: string;
  after: unknown;
  instruction: string;
  summary: string;
  model: string;
  now?: string;
};

export type AiOperationEntity = {
  id: string;
  worldId: string;
  type: "character" | "location" | "faction" | "event" | "item" | "note";
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  visibility: "private" | "shared" | "public" | "secret";
  createdBy: string;
  updatedAt: string;
  categoryId: string;
  order: number;
  templateId?: string;
  templateData: Record<string, string>;
};

export type AiOperationQuestStep = {
  id: string;
  title: string;
  objective: string;
  condition: string;
  branch: string;
  failure: string;
  reward: string;
  notes: string;
};

export type AiOperationQuest = {
  id: string;
  worldId: string;
  title: string;
  category: "main" | "side" | "character";
  status: "draft" | "active" | "implemented" | "cut";
  summary: string;
  trigger: string;
  relatedEntityIds: string[];
  prerequisiteQuestIds: string[];
  steps: AiOperationQuestStep[];
  developerNotes: string;
  updatedAt: string;
};

export type AiOperationRelation = {
  id: string;
  worldId: string;
  sourceEntityId: string;
  targetEntityId: string;
  kind:
    | "ally" | "rival" | "family" | "member" | "leads" | "controls" | "located" | "route"
    | "teacher" | "source" | "creator" | "companion" | "protector" | "evolution"
    | "disputed" | "incarnation" | "subordinate" | "devotion" | "influence" | "leader"
    | "collaborator" | "worship" | "peer" | "ritual" | "contains" | "custom";
  label: string;
  direction: "directed" | "undirected" | "mutual";
  strength: number;
  evidenceType?:
    | "unspecified"
    | "primary-text"
    | "historical-record"
    | "ritual-record"
    | "material-evidence"
    | "scholarly-inference"
    | "textual-variant"
    | "oral-tradition"
    | "creative";
  sourceCitation?: string;
  historicalScope?: string;
  confidence?: "unspecified" | "certain" | "probable" | "disputed" | "creative";
  notes: string;
  updatedAt: string;
};

export type AiOperationWorld = {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  visibility: "private" | "shared" | "public";
  createdAt: string;
  updatedAt: string;
};

export type AiOperationAsset = {
  id: string;
  worldId: string;
  name: string;
  kind: "image" | "map" | "audio" | "concept" | "document";
  storedName: string;
  originalName: string;
  mimeType: string;
  size: number;
  tags: string[];
  notes: string;
  linkedEntityIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type AiOperationMember = {
  id: string;
  worldId: string;
  name: string;
  email: string;
  role: "owner" | "editor" | "viewer" | "player";
};

export type AiOperationWorkspace = {
  worlds: AiOperationWorld[];
  codexCategories: CodexCategory[];
  entityTemplates: EntityTemplateDefinition[];
  entities: AiOperationEntity[];
  quests: AiOperationQuest[];
  storyVariables: StoryVariable[];
  storyScenes: StoryScene[];
  storyTestPresets: StoryTestPreset[];
  storyTestRuns: StoryTestRun[];
  storyReviewIssues: StoryReviewIssue[];
  relations: AiOperationRelation[];
  assets: AiOperationAsset[];
  members: AiOperationMember[];
  maps: WorldMap[];
  mapLayers: MapLayer[];
  mapMarkerGroups: MapMarkerGroup[];
  mapMarkers: MapMarker[];
  mapRoutes: MapRoute[];
  narrativeMilestones: NarrativeMilestone[];
  manuscriptBooks: ManuscriptBook[];
  manuscriptVolumes: ManuscriptVolume[];
  manuscriptChapters: ManuscriptChapter[];
  manuscriptScenes: ManuscriptScene[];
  timelineTracks: TimelineTrack[];
  timelineEvents: TimelineEvent[];
  aiOperationRuns: AiOperationRun[];
};

export type AiOperationContext = {
  text: string;
  characters: number;
  counts: Record<AiOperationCollection, number>;
};

export const aiOperationTargetLabels: Record<AiOperationTarget, string> = {
  world: "世界设置",
  "codex-category": "项目分类",
  "entity-template": "条目模板",
  entity: "条目",
  quest: "任务",
  "story-variable": "剧情变量",
  "story-scene": "剧情场景",
  "story-test-preset": "测试预设",
  "story-review-issue": "审阅问题",
  relation: "关系",
  asset: "资源元数据",
  member: "成员权限",
  map: "地图",
  "map-layer": "地图图层",
  "map-marker-group": "地图标记组",
  "map-marker": "地图标记",
  "map-route": "地图路线",
  "narrative-milestone": "叙事里程碑",
  "manuscript-book": "书稿",
  "manuscript-volume": "卷",
  "manuscript-chapter": "章节",
  "manuscript-scene": "正文场景",
  "timeline-track": "时间轨道",
  "timeline-event": "时间点"
};

const targetCollections: Record<AiOperationTarget, AiOperationCollection> = {
  world: "worlds",
  "codex-category": "codexCategories",
  "entity-template": "entityTemplates",
  entity: "entities",
  quest: "quests",
  "story-variable": "storyVariables",
  "story-scene": "storyScenes",
  "story-test-preset": "storyTestPresets",
  "story-review-issue": "storyReviewIssues",
  relation: "relations",
  asset: "assets",
  member: "members",
  map: "maps",
  "map-layer": "mapLayers",
  "map-marker-group": "mapMarkerGroups",
  "map-marker": "mapMarkers",
  "map-route": "mapRoutes",
  "narrative-milestone": "narrativeMilestones",
  "manuscript-book": "manuscriptBooks",
  "manuscript-volume": "manuscriptVolumes",
  "manuscript-chapter": "manuscriptChapters",
  "manuscript-scene": "manuscriptScenes",
  "timeline-track": "timelineTracks",
  "timeline-event": "timelineEvents"
};
const targets = new Set<AiOperationTarget>(Object.keys(targetCollections) as AiOperationTarget[]);
const actions = new Set<AiOperationAction>(["create", "update", "delete"]);
const entityTypes = new Set<AiOperationEntity["type"]>([
  "character", "location", "faction", "event", "item", "note"
]);
const visibilities = new Set<AiOperationEntity["visibility"]>([
  "private", "shared", "public", "secret"
]);
const questCategories = new Set<AiOperationQuest["category"]>(["main", "side", "character"]);
const questStatuses = new Set<AiOperationQuest["status"]>(["draft", "active", "implemented", "cut"]);
const relationKinds = new Set<AiOperationRelation["kind"]>([
  "ally", "rival", "family", "member", "leads", "controls", "located", "route",
  "teacher", "source", "creator", "companion", "protector", "evolution", "disputed",
  "incarnation", "subordinate", "devotion", "influence", "leader", "collaborator",
  "worship", "peer", "ritual", "contains", "custom"
]);
const relationEvidenceTypes = new Set<NonNullable<AiOperationRelation["evidenceType"]>>([
  "unspecified", "primary-text", "historical-record", "ritual-record", "material-evidence",
  "scholarly-inference", "textual-variant", "oral-tradition", "creative"
]);
const relationConfidences = new Set<NonNullable<AiOperationRelation["confidence"]>>([
  "unspecified", "certain", "probable", "disputed", "creative"
]);
const worldVisibilities = new Set<AiOperationWorld["visibility"]>(["private", "shared", "public"]);
const categoryIcons = new Set<CodexCategoryIcon>([
  "folder", "characters", "locations", "factions", "events", "items", "notes"
]);
const assetKinds = new Set<AiOperationAsset["kind"]>(["image", "map", "audio", "concept", "document"]);
const memberRoles = new Set<AiOperationMember["role"]>(["owner", "editor", "viewer", "player"]);
const unsafeKeys = new Set(["__proto__", "prototype", "constructor"]);

export function createAiOperationId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function text(value: unknown, maximum: number) {
  return String(value ?? "").trim().slice(0, maximum);
}

function strings(value: unknown, maximum = 100) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => text(item, 300)).filter(Boolean))).slice(0, maximum);
}

function stringRecord(value: unknown, maximum = 200) {
  const source = plainObject(value);
  return Object.fromEntries(
    Object.entries(source)
      .slice(0, maximum)
      .map(([key, item]) => [key.slice(0, 300), text(item, 120000)])
  );
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function cleanJson(value: unknown, depth = 0): unknown {
  if (depth > 10 || value == null) return null;
  if (typeof value === "string") return value.slice(0, 120000);
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 300).map((item) => cleanJson(item, depth + 1));
  if (typeof value !== "object") return String(value).slice(0, 2000);
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value).slice(0, 200)) {
    if (unsafeKeys.has(key)) continue;
    result[key.slice(0, 200)] = cleanJson(item, depth + 1);
  }
  return result;
}

function plainObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (cleanJson(value) as Record<string, unknown>)
    : {};
}

function slug(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("zh-CN")
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || createAiOperationId("entry");
}

function finiteNumber(value: unknown, fallback: number, minimum: number, maximum: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, parsed)) : fallback;
}

function normalizeQuestSteps(value: unknown): AiOperationQuestStep[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).map((raw, index) => {
    const step = plainObject(raw);
    return {
      id: text(step.id, 300) || createAiOperationId("quest-step"),
      title: text(step.title, 300) || `任务步骤 ${index + 1}`,
      objective: text(step.objective, 12000),
      condition: text(step.condition, 8000),
      branch: text(step.branch, 8000),
      failure: text(step.failure, 8000),
      reward: text(step.reward, 8000),
      notes: text(step.notes, 12000)
    };
  });
}

function normalizeOperation(raw: unknown, index: number): AiProjectOperation | null {
  const item = plainObject(raw);
  if (!actions.has(item.action as AiOperationAction) || !targets.has(item.target as AiOperationTarget)) {
    return null;
  }
  return {
    id: text(item.id, 200) || `operation-${index + 1}`,
    action: item.action as AiOperationAction,
    target: item.target as AiOperationTarget,
    targetId: text(item.targetId, 300),
    ref: text(item.ref, 120).replace(/[^a-zA-Z0-9_-]/g, ""),
    data: plainObject(item.data)
  };
}

export function parseAiOperationPlan(value: string):
  | { ok: true; plan: AiOperationPlan }
  | { ok: false; error: string } {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  const candidate = fenced || (start >= 0 && end > start ? value.slice(start, end + 1) : value);
  try {
    const parsed = JSON.parse(candidate);
    const rawOperations: unknown[] = Array.isArray(parsed.operations) ? parsed.operations : [];
    if (!rawOperations.length) return { ok: false, error: "AI 没有返回可执行操作" };
    if (rawOperations.length > 40) return { ok: false, error: "单次最多执行 40 个项目操作" };
    const operations = rawOperations.map(normalizeOperation);
    if (operations.some((item) => !item)) return { ok: false, error: "AI 操作包含不支持的动作或模块" };
    const normalized = operations as AiProjectOperation[];
    const refs = normalized.map((item) => item.ref).filter(Boolean);
    if (new Set(refs).size !== refs.length) return { ok: false, error: "AI 操作中的引用名称重复" };
    for (const operation of normalized) {
      if (operation.action !== "create" && !operation.targetId) {
        return { ok: false, error: `${operation.id} 缺少 targetId` };
      }
      if (JSON.stringify(operation.data).length > 240000) {
        return { ok: false, error: `${operation.id} 的数据体过大` };
      }
    }
    return {
      ok: true,
      plan: {
        summary: text(parsed.summary, 2000) || `执行 ${normalized.length} 个项目操作`,
        operations: normalized
      }
    };
  } catch {
    return { ok: false, error: "AI 返回的项目操作不是有效 JSON" };
  }
}

function resolveReferences(value: unknown, refs: Map<string, string>): unknown {
  if (typeof value === "string" && /^@[a-zA-Z0-9_-]+$/.test(value)) {
    const resolved = refs.get(value.slice(1));
    if (!resolved) throw new Error(`无法解析操作引用 ${value}`);
    return resolved;
  }
  if (Array.isArray(value)) return value.map((item) => resolveReferences(item, refs));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      const resolvedKey = /^@[a-zA-Z0-9_-]+$/.test(key)
        ? String(resolveReferences(key, refs))
        : key;
      return [resolvedKey, resolveReferences(item, refs)];
    })
  );
}

function uniqueId(collection: Array<{ id: string }>, prefix: string) {
  let id = createAiOperationId(prefix);
  while (collection.some((item) => item.id === id)) id = createAiOperationId(prefix);
  return id;
}

function allowedData(target: AiOperationTarget, data: Record<string, unknown>) {
  const fields: Record<AiOperationTarget, string[]> = {
    world: ["name", "description", "visibility"],
    "codex-category": ["parentId", "title", "description", "icon", "color", "order"],
    "entity-template": ["name", "description", "entityTypes", "fields"],
    entity: ["type", "title", "slug", "summary", "content", "tags", "visibility", "categoryId", "templateId", "templateData"],
    quest: ["title", "category", "status", "summary", "trigger", "relatedEntityIds", "prerequisiteQuestIds", "steps", "developerNotes"],
    "story-variable": ["key", "name", "type", "defaultValue", "description"],
    "story-scene": ["title", "summary", "status", "entryNodeId", "relatedEntityIds", "relatedQuestIds", "nodes", "notes"],
    "story-test-preset": ["name", "description", "sceneId", "initialState", "maxDepth", "maxPaths"],
    "story-review-issue": ["title", "detail", "severity", "status", "presetId", "sceneId", "nodeId", "entityId", "questId"],
    relation: ["sourceEntityId", "targetEntityId", "kind", "label", "direction", "strength", "evidenceType", "sourceCitation", "historicalScope", "confidence", "notes"],
    asset: ["name", "kind", "tags", "notes", "linkedEntityIds"],
    member: ["name", "email", "role"],
    map: ["title", "description", "width", "height", "distanceWidth", "distanceUnit", "customDistanceUnit", "grid", "regions"],
    "map-layer": ["mapId", "title", "description", "color", "order", "visible", "locked"],
    "map-marker-group": ["mapId", "title", "description", "color", "order", "visible", "locked"],
    "map-marker": ["mapId", "layerId", "groupId", "entityId", "questId", "sceneId", "references", "x", "y", "label", "markerType", "color", "description"],
    "map-route": ["mapId", "title", "description", "color", "status", "travelMode", "travelSpeed", "travelHoursPerDay", "stops"],
    "narrative-milestone": ["title", "summary", "act", "status", "priority", "order", "targetDate", "blockedReason", "developerNotes", "manuscriptBody", "dependencyIds", "linkedQuestIds", "linkedSceneIds", "linkedEntityIds", "linkedTimelineEventIds", "linkedMapMarkerIds", "linkedReviewIssueIds"],
    "manuscript-book": ["title", "subtitle", "summary", "status", "order", "targetWordCount", "dailyWordGoal"],
    "manuscript-volume": ["bookId", "title", "summary", "status", "order", "targetWordCount"],
    "manuscript-chapter": ["bookId", "volumeId", "title", "summary", "body", "notes", "status", "order", "targetWordCount", "viewpointEntityId", "timelineStart", "timelineEnd", "linkedNarrativeMilestoneId", "linkedStorySceneIds", "references"],
    "manuscript-scene": ["bookId", "volumeId", "chapterId", "title", "summary", "body", "notes", "status", "order", "viewpointEntityId", "locationEntityId", "relatedEntityIds", "timelineStart", "timelineEnd", "linkedStorySceneId", "references"],
    "timeline-track": ["name", "description", "color", "order"],
    "timeline-event": ["entityId", "questId", "sceneId", "references", "trackId", "title", "summary", "displayDate", "datePrecision", "sortOrder", "startValue", "endValue", "era", "dependencyIds"]
  };
  return Object.fromEntries(fields[target].filter((field) => field in data).map((field) => [field, data[field]]));
}

function buildItem(
  target: AiOperationTarget,
  data: Record<string, unknown>,
  current: Record<string, unknown> | null,
  id: string,
  worldId: string,
  now: string,
  collectionIndex: number,
  collectionItems: Array<Record<string, unknown>>,
  workspace: AiOperationWorkspace
): Record<string, unknown> {
  const allowed = allowedData(target, data);
  if (target === "world") {
    const previous = (current || {}) as Partial<AiOperationWorld>;
    return {
      ...previous,
      id,
      name: text(allowed.name ?? previous.name, 500) || "未命名世界",
      description: text(allowed.description ?? previous.description, 24000),
      visibility: worldVisibilities.has(allowed.visibility as AiOperationWorld["visibility"])
        ? allowed.visibility
        : previous.visibility || "private",
      updatedAt: now
    };
  }
  if (target === "codex-category") {
    const previous = (current || {}) as Partial<CodexCategory>;
    const requestedColor = text(allowed.color ?? previous.color, 20);
    return {
      ...previous,
      id,
      worldId,
      parentId: text(allowed.parentId ?? previous.parentId, 300),
      title: text(allowed.title ?? previous.title, 500) || "AI 新分类",
      description: text(allowed.description ?? previous.description, 2000),
      icon: categoryIcons.has(allowed.icon as CodexCategoryIcon)
        ? allowed.icon
        : previous.icon || "folder",
      color: /^#[0-9a-f]{6}$/i.test(requestedColor) ? requestedColor : previous.color || "#3f6f5c",
      order: finiteNumber(allowed.order ?? previous.order, collectionIndex, 0, 1000000),
      createdAt: previous.createdAt || now,
      updatedAt: now
    };
  }
  if (target === "entity-template") {
    const previous = (current || {}) as Partial<EntityTemplateDefinition>;
    return normalizeEntityTemplate(
      {
        ...previous,
        ...allowed,
        id,
        worldId,
        builtIn: previous.builtIn || false,
        createdAt: previous.createdAt || now,
        updatedAt: now
      },
      worldId,
      collectionIndex
    ) as unknown as Record<string, unknown>;
  }
  if (target === "entity") {
    const previous = (current || {}) as Partial<AiOperationEntity>;
    const title = text(allowed.title ?? previous.title, 500) || "AI 新条目";
    const type = entityTypes.has(allowed.type as AiOperationEntity["type"])
      ? (allowed.type as AiOperationEntity["type"])
      : previous.type || "note";
    const worldCategories = workspace.codexCategories.filter(
      (category) => category.worldId === worldId
    );
    const defaultCategoryId = getDefaultCodexCategoryId(worldId, type);
    const matchingEntityCategory = collectionItems.find(
      (item) =>
        item.worldId === worldId &&
        item.type === type &&
        typeof item.categoryId === "string" &&
        (!worldCategories.length ||
          worldCategories.some((category) => category.id === item.categoryId))
    )?.categoryId;
    const categoryId = "categoryId" in allowed
      ? text(allowed.categoryId, 300)
      : previous.categoryId ||
        worldCategories.find((category) => category.id === defaultCategoryId)?.id ||
        (typeof matchingEntityCategory === "string" ? matchingEntityCategory : "") ||
        (worldCategories.length ? "" : defaultCategoryId);
    const categoryOrder = collectionItems.filter(
      (item) => item.worldId === worldId && item.categoryId === categoryId
    ).length;
    return {
      ...previous,
      id,
      worldId,
      type,
      title,
      slug: text(allowed.slug ?? previous.slug, 160) || slug(title),
      summary: text(allowed.summary ?? previous.summary, 24000),
      content: text(allowed.content ?? previous.content, 240000),
      tags: "tags" in allowed ? strings(allowed.tags, 100) : previous.tags || [],
      visibility: visibilities.has(allowed.visibility as AiOperationEntity["visibility"])
        ? allowed.visibility
        : previous.visibility || "private",
      createdBy: previous.createdBy || "ai-project-operator",
      updatedAt: now,
      categoryId,
      order: Number.isFinite(previous.order) ? previous.order : categoryOrder,
      templateId: "templateId" in allowed
        ? text(allowed.templateId, 300) || undefined
        : previous.templateId,
      templateData: "templateData" in allowed
        ? stringRecord(allowed.templateData)
        : previous.templateData || {}
    };
  }
  if (target === "quest") {
    const previous = (current || {}) as Partial<AiOperationQuest>;
    return {
      ...previous,
      id,
      worldId,
      title: text(allowed.title ?? previous.title, 500) || "AI 新任务",
      category: questCategories.has(allowed.category as AiOperationQuest["category"])
        ? allowed.category
        : previous.category || "side",
      status: questStatuses.has(allowed.status as AiOperationQuest["status"])
        ? allowed.status
        : previous.status || "draft",
      summary: text(allowed.summary ?? previous.summary, 24000),
      trigger: text(allowed.trigger ?? previous.trigger, 12000),
      relatedEntityIds: "relatedEntityIds" in allowed
        ? strings(allowed.relatedEntityIds)
        : previous.relatedEntityIds || [],
      prerequisiteQuestIds: "prerequisiteQuestIds" in allowed
        ? strings(allowed.prerequisiteQuestIds)
        : previous.prerequisiteQuestIds || [],
      steps: "steps" in allowed ? normalizeQuestSteps(allowed.steps) : previous.steps || [],
      developerNotes: text(allowed.developerNotes ?? previous.developerNotes, 24000),
      updatedAt: now
    };
  }
  if (target === "story-variable") {
    return normalizeStoryVariable(
      { ...(current || {}), ...allowed, id, worldId, updatedAt: now },
      worldId
    ) as unknown as Record<string, unknown>;
  }
  if (target === "story-scene") {
    return normalizeStoryScene(
      { ...(current || {}), ...allowed, id, worldId, updatedAt: now },
      worldId
    ) as unknown as Record<string, unknown>;
  }
  if (target === "story-test-preset") {
    return normalizeStoryTestPreset(
      { ...(current || {}), ...allowed, id, worldId, updatedAt: now },
      worldId
    ) as unknown as Record<string, unknown>;
  }
  if (target === "story-review-issue") {
    const previous = (current || {}) as Partial<StoryReviewIssue>;
    return normalizeStoryReviewIssue(
      {
        ...previous,
        ...allowed,
        id,
        worldId,
        source: previous.source || "manual",
        sourceFindingKind: previous.sourceFindingKind || "",
        runId: previous.runId || "",
        consistencyFindingId: previous.consistencyFindingId || "",
        consistencyRuleId: previous.consistencyRuleId || "",
        createdAt: previous.createdAt || now,
        updatedAt: now
      },
      worldId
    ) as unknown as Record<string, unknown>;
  }
  if (target === "relation") {
    const previous = (current || {}) as Partial<AiOperationRelation>;
    const evidenceType = relationEvidenceTypes.has(
      allowed.evidenceType as NonNullable<AiOperationRelation["evidenceType"]>
    )
      ? allowed.evidenceType
      : relationEvidenceTypes.has(previous.evidenceType || "unspecified")
        ? previous.evidenceType || "unspecified"
        : "unspecified";
    const confidence = relationConfidences.has(
      allowed.confidence as NonNullable<AiOperationRelation["confidence"]>
    )
      ? allowed.confidence
      : relationConfidences.has(previous.confidence || "unspecified")
        ? previous.confidence || "unspecified"
        : "unspecified";
    return {
      ...previous,
      id,
      worldId,
      sourceEntityId: text(allowed.sourceEntityId ?? previous.sourceEntityId, 300),
      targetEntityId: text(allowed.targetEntityId ?? previous.targetEntityId, 300),
      kind: relationKinds.has(allowed.kind as AiOperationRelation["kind"])
        ? allowed.kind
        : previous.kind || "custom",
      label: text(allowed.label ?? previous.label, 500),
      direction:
        allowed.direction === "undirected" || allowed.direction === "directed" || allowed.direction === "mutual"
          ? allowed.direction
          : previous.direction || "directed",
      strength: finiteNumber(allowed.strength ?? previous.strength, 3, 1, 5),
      evidenceType,
      sourceCitation: text(allowed.sourceCitation ?? previous.sourceCitation, 12000),
      historicalScope: text(allowed.historicalScope ?? previous.historicalScope, 12000),
      confidence,
      notes: text(allowed.notes ?? previous.notes, 12000),
      updatedAt: now
    };
  }
  if (target === "asset") {
    const previous = (current || {}) as Partial<AiOperationAsset>;
    return {
      ...previous,
      id,
      worldId,
      name: text(allowed.name ?? previous.name, 500) || "未命名资源",
      kind: assetKinds.has(allowed.kind as AiOperationAsset["kind"])
        ? allowed.kind
        : previous.kind || "concept",
      tags: "tags" in allowed ? strings(allowed.tags, 100) : previous.tags || [],
      notes: text(allowed.notes ?? previous.notes, 24000),
      linkedEntityIds: "linkedEntityIds" in allowed
        ? strings(allowed.linkedEntityIds)
        : previous.linkedEntityIds || [],
      updatedAt: now
    };
  }
  if (target === "member") {
    const previous = (current || {}) as Partial<AiOperationMember>;
    const name = text(allowed.name ?? previous.name, 300) || "新成员";
    return {
      ...previous,
      id,
      worldId,
      name,
      email: text(allowed.email ?? previous.email, 500) || name,
      role: memberRoles.has(allowed.role as AiOperationMember["role"])
        ? allowed.role
        : previous.role || "viewer"
    };
  }
  if (target === "map") {
    return normalizeWorldMap(
      {
        ...(current || {}),
        ...allowed,
        id,
        worldId,
        createdAt: text(current?.createdAt, 40) || now,
        updatedAt: now
      },
      worldId,
      collectionIndex + 1
    ) as unknown as Record<string, unknown>;
  }
  if (target === "map-layer") {
    const mapId = text(allowed.mapId ?? current?.mapId, 300);
    return normalizeMapLayer(
      { ...(current || {}), ...allowed, id, worldId, mapId, updatedAt: now },
      worldId,
      mapId,
      collectionIndex
    ) as unknown as Record<string, unknown>;
  }
  if (target === "map-marker-group") {
    const mapId = text(allowed.mapId ?? current?.mapId, 300);
    return normalizeMapMarkerGroup(
      { ...(current || {}), ...allowed, id, worldId, mapId, updatedAt: now },
      worldId,
      mapId,
      collectionIndex + 1
    ) as unknown as Record<string, unknown>;
  }
  if (target === "map-marker") {
    const mapId = text(allowed.mapId ?? current?.mapId, 300);
    return normalizeMapMarker(
      { ...(current || {}), ...allowed, id, mapId, updatedAt: now },
      mapId
    ) as unknown as Record<string, unknown>;
  }
  if (target === "map-route") {
    const mapId = text(allowed.mapId ?? current?.mapId, 300);
    return normalizeMapRoute(
      { ...(current || {}), ...allowed, id, worldId, mapId, updatedAt: now },
      worldId,
      mapId,
      collectionIndex + 1
    ) as unknown as Record<string, unknown>;
  }
  if (target === "narrative-milestone") {
    return normalizeNarrativeMilestone(
      {
        ...(current || {}),
        ...allowed,
        id,
        worldId,
        createdAt: text(current?.createdAt, 40) || now,
        updatedAt: now
      },
      worldId,
      collectionIndex
    ) as unknown as Record<string, unknown>;
  }
  if (target === "manuscript-book") {
    return normalizeManuscriptBook(
      {
        ...(current || {}),
        ...allowed,
        id,
        worldId,
        createdAt: text(current?.createdAt, 40) || now,
        updatedAt: now
      },
      worldId,
      collectionIndex
    ) as unknown as Record<string, unknown>;
  }
  if (target === "manuscript-volume") {
    const bookId = text(allowed.bookId ?? current?.bookId, 300);
    return normalizeManuscriptVolume(
      {
        ...(current || {}),
        ...allowed,
        id,
        worldId,
        bookId,
        createdAt: text(current?.createdAt, 40) || now,
        updatedAt: now
      },
      worldId,
      bookId,
      collectionIndex
    ) as unknown as Record<string, unknown>;
  }
  if (target === "manuscript-chapter") {
    const bookId = text(allowed.bookId ?? current?.bookId, 300);
    const volumeId = text(allowed.volumeId ?? current?.volumeId, 300);
    return normalizeManuscriptChapter(
      {
        ...(current || {}),
        ...allowed,
        id,
        worldId,
        bookId,
        volumeId,
        createdAt: text(current?.createdAt, 40) || now,
        updatedAt: now
      },
      worldId,
      bookId,
      volumeId,
      collectionIndex
    ) as unknown as Record<string, unknown>;
  }
  if (target === "manuscript-scene") {
    const chapterId = text(allowed.chapterId ?? current?.chapterId, 300);
    const chapter = (workspace.manuscriptChapters || []).find((item) => item.id === chapterId);
    if (!chapter) {
      return {
        ...(current || {}),
        ...allowed,
        id,
        worldId,
        chapterId,
        updatedAt: now
      };
    }
    return normalizeManuscriptScene(
      {
        ...(current || {}),
        ...allowed,
        id,
        worldId,
        chapterId,
        createdAt: text(current?.createdAt, 40) || now,
        updatedAt: now
      },
      chapter,
      collectionIndex
    ) as unknown as Record<string, unknown>;
  }
  if (target === "timeline-track") {
    return normalizeTimelineTrack(
      { ...(current || {}), ...allowed, id, worldId, updatedAt: now },
      worldId,
      collectionIndex
    ) as unknown as Record<string, unknown>;
  }
  return normalizeTimelineEvent(
    { ...(current || {}), ...allowed, id, worldId, updatedAt: now },
    worldId,
    text(allowed.trackId ?? current?.trackId, 300),
    collectionIndex + 1
  ) as unknown as Record<string, unknown>;
}

function itemLabel(target: AiOperationTarget, item: Record<string, unknown>) {
  return text(item.title || item.name || item.label || item.key || aiOperationTargetLabels[target], 500);
}

function detectQuestCycles(quests: AiOperationQuest[]) {
  const graph = new Map(quests.map((quest) => [quest.id, quest.prerequisiteQuestIds]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string): boolean {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    if ((graph.get(id) || []).some(visit)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  }
  return quests.some((quest) => visit(quest.id));
}

function storyValueMatchesVariable(variable: StoryVariable, value: StoryValue) {
  if (variable.type === "boolean") return typeof value === "boolean";
  if (variable.type === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === "string";
}

function validateWorkspace(
  workspace: AiOperationWorkspace,
  worldId: string,
  originalMapIds: Set<string> = new Set()
) {
  const errors: string[] = [];
  const world = workspace.worlds.find((item) => item.id === worldId);
  const categories = workspace.codexCategories.filter((item) => item.worldId === worldId);
  const templates = workspace.entityTemplates
    .filter((item) => item.worldId === worldId)
    .sort((left, right) => Number(left.builtIn) - Number(right.builtIn) || left.name.localeCompare(right.name, "zh-CN"));
  const entities = workspace.entities.filter((item) => item.worldId === worldId);
  const quests = workspace.quests.filter((item) => item.worldId === worldId);
  const variables = workspace.storyVariables.filter((item) => item.worldId === worldId);
  const scenes = workspace.storyScenes.filter((item) => item.worldId === worldId);
  const presets = workspace.storyTestPresets.filter((item) => item.worldId === worldId);
  const testRuns = workspace.storyTestRuns.filter((item) => item.worldId === worldId);
  const reviewIssues = workspace.storyReviewIssues.filter((item) => item.worldId === worldId);
  const relations = workspace.relations.filter((item) => item.worldId === worldId);
  const assets = workspace.assets.filter((item) => item.worldId === worldId);
  const members = workspace.members.filter((item) => item.worldId === worldId);
  const maps = workspace.maps.filter((item) => item.worldId === worldId);
  const mapIds = new Set(maps.map((item) => item.id));
  const scopedMapIds = new Set([...originalMapIds, ...mapIds]);
  const layers = workspace.mapLayers.filter(
    (item) => item.worldId === worldId || scopedMapIds.has(item.mapId)
  );
  const groups = workspace.mapMarkerGroups.filter(
    (item) => item.worldId === worldId || scopedMapIds.has(item.mapId)
  );
  const markers = workspace.mapMarkers.filter(
    (item) => scopedMapIds.has(item.mapId) || !workspace.maps.some((mapItem) => mapItem.id === item.mapId)
  );
  const routes = workspace.mapRoutes.filter((item) => item.worldId === worldId);
  const milestones = workspace.narrativeMilestones.filter((item) => item.worldId === worldId);
  const manuscriptBooks = (workspace.manuscriptBooks || []).filter((item) => item.worldId === worldId);
  const manuscriptVolumes = (workspace.manuscriptVolumes || []).filter((item) => item.worldId === worldId);
  const manuscriptChapters = (workspace.manuscriptChapters || []).filter((item) => item.worldId === worldId);
  const manuscriptScenes = (workspace.manuscriptScenes || []).filter((item) => item.worldId === worldId);
  const tracks = workspace.timelineTracks.filter((item) => item.worldId === worldId);
  const events = workspace.timelineEvents.filter((item) => item.worldId === worldId);
  const entityIds = new Set(entities.map((item) => item.id));
  const questIds = new Set(quests.map((item) => item.id));
  const variableIds = new Set(variables.map((item) => item.id));
  const sceneIds = new Set(scenes.map((item) => item.id));
  const markerIds = new Set(markers.map((item) => item.id));
  const routeIds = new Set(routes.map((item) => item.id));
  const milestoneIds = new Set(milestones.map((item) => item.id));
  const presetIds = new Set(presets.map((item) => item.id));
  const testRunIds = new Set(testRuns.map((item) => item.id));
  const reviewIssueIds = new Set(reviewIssues.map((item) => item.id));
  const manuscriptBookIds = new Set(manuscriptBooks.map((item) => item.id));
  const manuscriptVolumeIds = new Set(manuscriptVolumes.map((item) => item.id));
  const manuscriptChapterIds = new Set(manuscriptChapters.map((item) => item.id));
  const manuscriptSceneIds = new Set(manuscriptScenes.map((item) => item.id));
  const referenceIds = Object.fromEntries(
    projectObjectKinds.map((kind) => [kind, new Set<string>()])
  ) as Record<ProjectObjectKind, Set<string>>;
  referenceIds.world.add(worldId);
  referenceIds.entity = entityIds;
  referenceIds.quest = questIds;
  referenceIds.scene = sceneIds;
  referenceIds["story-variable"] = variableIds;
  referenceIds["timeline-event"] = new Set(events.map((item) => item.id));
  referenceIds["timeline-track"] = new Set(tracks.map((item) => item.id));
  referenceIds.map = mapIds;
  referenceIds["map-marker"] = markerIds;
  referenceIds["map-route"] = routeIds;
  referenceIds.asset = new Set(assets.map((item) => item.id));
  referenceIds.milestone = milestoneIds;
  referenceIds["manuscript-book"] = manuscriptBookIds;
  referenceIds["manuscript-volume"] = manuscriptVolumeIds;
  referenceIds["manuscript-chapter"] = manuscriptChapterIds;
  referenceIds["manuscript-scene"] = manuscriptSceneIds;
  referenceIds["review-issue"] = reviewIssueIds;
  referenceIds.relation = new Set(relations.map((item) => item.id));

  const validateReferences = (label: string, references: ProjectObjectRef[]) => {
    const invalid = references.filter((reference) => !referenceIds[reference.kind].has(reference.id));
    if (invalid.length) {
      errors.push(`${label} 包含失效引用：${invalid.map((item) => `${item.kind}:${item.id}`).join("、")}`);
    }
  };

  if (!world) errors.push("当前世界不存在");
  else {
    if (!world.name.trim()) errors.push("世界名称不能为空");
    if (!worldVisibilities.has(world.visibility)) errors.push("世界可见性无效");
  }

  const categoryIssues = validateCodexHierarchy(categories, entities, worldId);
  errors.push(
    ...categoryIssues.filter((issue) => issue.severity === "error").map((issue) => issue.title)
  );
  const categoryIds = new Set(categories.map((item) => item.id));
  for (const entity of entities) {
    if (entity.categoryId && !categoryIds.has(entity.categoryId)) {
      errors.push(`${entity.title} 所在的项目分类不存在`);
    }
  }

  const templateIssues = validateEntityTemplates(templates, entities);
  errors.push(
    ...templateIssues.filter((issue) => issue.severity === "error").map((issue) => issue.title)
  );
  for (const template of templates) {
    const fieldIds = template.fields.map((field) => field.id);
    if (new Set(fieldIds).size !== fieldIds.length) errors.push(`${template.name} 包含重复字段 ID`);
  }

  for (const quest of quests) {
    const missingEntities = quest.relatedEntityIds.filter((id) => !entityIds.has(id));
    const missingQuests = quest.prerequisiteQuestIds.filter((id) => !questIds.has(id) || id === quest.id);
    if (missingEntities.length) errors.push(`${quest.title} 关联了不存在的条目`);
    if (missingQuests.length) errors.push(`${quest.title} 的前置任务无效`);
    if (new Set(quest.steps.map((step) => step.id)).size !== quest.steps.length) {
      errors.push(`${quest.title} 存在重复步骤 ID`);
    }
  }
  if (detectQuestCycles(quests)) errors.push("任务前置关系形成循环");

  for (const relation of relations) {
    if (!entityIds.has(relation.sourceEntityId) || !entityIds.has(relation.targetEntityId)) {
      errors.push(`${relation.label || "关系"} 的关系端点不存在`);
    }
    if (relation.sourceEntityId === relation.targetEntityId) errors.push("关系不能连接同一个条目");
  }

  const variableKeys = variables.map((item) => item.key);
  if (new Set(variableKeys).size !== variableKeys.length) errors.push("剧情变量键重复");
  for (const scene of scenes) {
    const issues = validateStoryScene(scene, { variableIds, entityIds, questIds });
    errors.push(...issues.filter((issue) => issue.severity === "error").map((issue) => issue.title));
  }

  const variableById = new Map(variables.map((item) => [item.id, item]));
  for (const preset of presets) {
    if (!sceneIds.has(preset.sceneId)) errors.push(`${preset.name} 关联的剧情场景不存在`);
    for (const [variableId, value] of Object.entries(preset.initialState)) {
      const variable = variableById.get(variableId);
      if (!variable) errors.push(`${preset.name} 包含不存在的剧情变量`);
      else if (!storyValueMatchesVariable(variable, value)) {
        errors.push(`${preset.name} 的初始变量类型不匹配`);
      }
    }
  }
  for (const run of testRuns) {
    if (run.presetId && !presetIds.has(run.presetId)) {
      errors.push("测试预设仍被不可编辑的历史运行记录引用");
    }
  }
  for (const issue of reviewIssues) {
    const scene = scenes.find((item) => item.id === issue.sceneId);
    const invalid =
      (issue.presetId && !presetIds.has(issue.presetId)) ||
      (issue.runId && !testRunIds.has(issue.runId)) ||
      (issue.sceneId && !scene) ||
      (issue.nodeId && !scene?.nodes.some((node) => node.id === issue.nodeId)) ||
      (issue.entityId && !entityIds.has(issue.entityId)) ||
      (issue.questId && !questIds.has(issue.questId));
    if (invalid) errors.push(`${issue.title} 包含失效的审阅关联`);
  }

  for (const asset of assets) {
    if (!asset.name.trim()) errors.push("资源名称不能为空");
    if (!assetKinds.has(asset.kind)) errors.push(`${asset.name} 的资源类型无效`);
    if (asset.linkedEntityIds.some((id) => !entityIds.has(id))) {
      errors.push(`${asset.name} 关联了不存在的条目`);
    }
  }

  const normalizedMemberEmails = members.map((member) => member.email.trim().toLocaleLowerCase());
  for (const member of members) {
    if (!member.name.trim() || !member.email.trim()) errors.push("成员名称和账号不能为空");
    if (!memberRoles.has(member.role)) errors.push(`${member.name} 的成员角色无效`);
  }
  if (new Set(normalizedMemberEmails).size !== normalizedMemberEmails.length) {
    errors.push("成员账号不能重复");
  }
  if (!members.some((member) => member.role === "owner")) {
    errors.push("世界必须保留至少一名所有者");
  }

  for (const layer of layers) {
    if (layer.worldId !== worldId || !mapIds.has(layer.mapId)) {
      errors.push(`${layer.title} 的地图图层归属无效`);
    }
  }
  for (const group of groups) {
    if (group.worldId !== worldId || !mapIds.has(group.mapId)) {
      errors.push(`${group.title} 的地图标记组归属无效`);
    }
  }
  const mapIssues = validateMapPlanning({
    worldId,
    maps,
    layers,
    groups,
    markers,
    routes,
    entityIds,
    questIds,
    sceneIds
  });
  errors.push(...mapIssues.filter((issue) => issue.severity === "error").map((issue) => issue.title));
  for (const mapItem of maps) {
    const regionIds = mapItem.regions.map((region) => region.id);
    if (new Set(regionIds).size !== regionIds.length) errors.push(`${mapItem.title} 包含重复区域 ID`);
    for (const region of mapItem.regions) {
      if (region.points.length < 3) errors.push(`${region.title} 至少需要 3 个边界点`);
      validateReferences(`${mapItem.title} / ${region.title}`, region.references);
    }
  }
  for (const marker of markers) validateReferences(marker.label, marker.references);

  const narrativeIssues = validateNarrativeMilestones(milestones, {
    questIds,
    sceneIds,
    entityIds,
    timelineEventIds: referenceIds["timeline-event"],
    mapMarkerIds: markerIds,
    reviewIssueIds
  });
  errors.push(
    ...narrativeIssues.filter((issue) => issue.severity === "error").map((issue) => issue.title)
  );

  for (const volume of manuscriptVolumes) {
    if (!manuscriptBookIds.has(volume.bookId)) errors.push(`${volume.title} 所属书稿不存在`);
  }
  for (const chapter of manuscriptChapters) {
    if (!manuscriptBookIds.has(chapter.bookId)) errors.push(`${chapter.title} 所属书稿不存在`);
    if (chapter.volumeId && !manuscriptVolumeIds.has(chapter.volumeId)) {
      errors.push(`${chapter.title} 所属卷不存在`);
    }
    if (chapter.viewpointEntityId && !entityIds.has(chapter.viewpointEntityId)) {
      errors.push(`${chapter.title} 的视角人物不存在`);
    }
    if (chapter.linkedNarrativeMilestoneId && !milestoneIds.has(chapter.linkedNarrativeMilestoneId)) {
      errors.push(`${chapter.title} 关联的叙事里程碑不存在`);
    }
    if (chapter.linkedStorySceneIds.some((id) => !sceneIds.has(id))) {
      errors.push(`${chapter.title} 关联了不存在的剧情场景`);
    }
    validateReferences(chapter.title, chapter.references);
  }
  for (const scene of manuscriptScenes) {
    if (!manuscriptChapterIds.has(scene.chapterId)) errors.push(`${scene.title} 所属章节不存在`);
    if (!manuscriptBookIds.has(scene.bookId)) errors.push(`${scene.title} 所属书稿不存在`);
    if (scene.volumeId && !manuscriptVolumeIds.has(scene.volumeId)) {
      errors.push(`${scene.title} 所属卷不存在`);
    }
    if (scene.viewpointEntityId && !entityIds.has(scene.viewpointEntityId)) {
      errors.push(`${scene.title} 的视角人物不存在`);
    }
    if (scene.locationEntityId && !entityIds.has(scene.locationEntityId)) {
      errors.push(`${scene.title} 的地点不存在`);
    }
    if (scene.relatedEntityIds.some((id) => !entityIds.has(id))) {
      errors.push(`${scene.title} 关联了不存在的条目`);
    }
    if (scene.linkedStorySceneId && !sceneIds.has(scene.linkedStorySceneId)) {
      errors.push(`${scene.title} 关联的剧情场景不存在`);
    }
    validateReferences(scene.title, scene.references);
  }

  const timelineIssues = validateTimelinePlanning({
    worldId,
    tracks,
    events,
    entityIds,
    questIds,
    sceneIds,
    referenceIds
  });
  errors.push(...timelineIssues.filter((issue) => issue.severity === "error").map((issue) => issue.title));
  return Array.from(new Set(errors)).slice(0, 30);
}

function operationItemWorldId(
  target: AiOperationTarget,
  item: Record<string, unknown>,
  current: AiOperationWorkspace,
  original: AiOperationWorkspace
) {
  if (target === "world") return text(item.id, 300);
  if (target !== "map-marker") return text(item.worldId, 300);
  const mapId = text(item.mapId, 300);
  return current.maps.find((mapItem) => mapItem.id === mapId)?.worldId ||
    original.maps.find((mapItem) => mapItem.id === mapId)?.worldId ||
    "";
}

function normalizeAiCodexOrdering(
  workspace: AiOperationWorkspace,
  worldId: string,
  now: string,
  changes: AiOperationChange[]
) {
  const beforeCategories = cloneJson(workspace.codexCategories);
  const beforeEntities = cloneJson(workspace.entities);
  const normalized = normalizeCodexHierarchy(
    workspace.codexCategories.filter((item) => item.worldId === worldId),
    workspace.entities.filter((item) => item.worldId === worldId),
    [worldId],
    now
  );

  const reconcile = (
    collection: "codexCategories" | "entities",
    target: "codex-category" | "entity",
    beforeItems: Array<Record<string, unknown>>,
    normalizedItems: Array<Record<string, unknown>>
  ) => {
    const normalizedById = new Map(normalizedItems.map((item) => [String(item.id), item]));
    const items = workspace[collection] as unknown as Array<Record<string, unknown>>;
    items.forEach((item, index) => {
      const normalizedItem = normalizedById.get(String(item.id));
      if (!normalizedItem || sameJson(item, normalizedItem)) return;
      items[index] = cloneJson(normalizedItem);
    });
    for (const normalizedItem of normalizedItems) {
      if (!items.some((item) => item.id === normalizedItem.id)) items.push(cloneJson(normalizedItem));
    }

    for (const after of normalizedItems) {
      const itemId = String(after.id);
      const before = beforeItems.find((item) => item.id === itemId) || null;
      if (sameJson(before, after)) continue;
      const existing = changes.find(
        (change) => change.collection === collection && change.itemId === itemId
      );
      if (existing) {
        existing.after = cloneJson(after);
        existing.label = itemLabel(target, after);
        continue;
      }
      changes.push({
        id: createAiOperationId("ai-change"),
        target,
        collection,
        action: before ? "update" : "create",
        itemId,
        label: itemLabel(target, after),
        before: before ? cloneJson(before) : null,
        after: cloneJson(after),
        beforeIndex: beforeItems.findIndex((item) => item.id === itemId)
      });
    }
  };

  reconcile(
    "codexCategories",
    "codex-category",
    beforeCategories as unknown as Array<Record<string, unknown>>,
    normalized.categories as unknown as Array<Record<string, unknown>>
  );
  reconcile(
    "entities",
    "entity",
    beforeEntities as unknown as Array<Record<string, unknown>>,
    normalized.entities as unknown as Array<Record<string, unknown>>
  );
}

export function applyAiOperationPlan<T extends AiOperationWorkspace>(
  workspace: T,
  plan: AiOperationPlan,
  options: { worldId: string; instruction: string; model: string; now?: string }
): { ok: true; data: T; run: AiOperationRun; refs: Record<string, string> } | { ok: false; error: string } {
  const now = options.now || new Date().toISOString();
  if (!workspace.worlds.some((world) => world.id === options.worldId)) {
    return { ok: false, error: "当前世界不存在" };
  }
  for (const operation of plan.operations) {
    if (operation.target === "world" && operation.action !== "update") {
      return { ok: false, error: "AI 只能更新当前世界设置，不能创建或删除世界" };
    }
    if (operation.target === "asset" && operation.action !== "update") {
      return { ok: false, error: "AI 只能更新已导入资源的元数据，资源创建与删除必须由本地文件流程完成" };
    }
  }
  const next = cloneJson(workspace);
  for (const collection of Object.values(targetCollections)) {
    const holder = next as unknown as Record<string, unknown>;
    if (!Array.isArray(holder[collection])) holder[collection] = [];
  }
  const originalMapIds = new Set(
    workspace.maps.filter((mapItem) => mapItem.worldId === options.worldId).map((mapItem) => mapItem.id)
  );
  const refs = new Map<string, string>();
  const prefixes: Record<AiOperationTarget, string> = {
    world: "world",
    "codex-category": "category",
    "entity-template": "template",
    entity: "entity",
    quest: "quest",
    "story-variable": "variable",
    "story-scene": "scene",
    "story-test-preset": "test-preset",
    "story-review-issue": "review-issue",
    relation: "relation",
    asset: "asset",
    member: "member",
    map: "map",
    "map-layer": "map-layer",
    "map-marker-group": "marker-group",
    "map-marker": "marker",
    "map-route": "map-route",
    "narrative-milestone": "milestone",
    "manuscript-book": "manuscript-book",
    "manuscript-volume": "manuscript-volume",
    "manuscript-chapter": "manuscript-chapter",
    "manuscript-scene": "manuscript-scene",
    "timeline-track": "timeline-track",
    "timeline-event": "timeline"
  };
  const createdMapIds = new Set<string>();

  for (const operation of plan.operations) {
    if (operation.action !== "create") continue;
    const collection = targetCollections[operation.target];
    const id = uniqueId(next[collection] as Array<{ id: string }>, prefixes[operation.target]);
    refs.set(operation.ref || operation.id, id);
    if (operation.target === "map") createdMapIds.add(id);
  }

  const changes: AiOperationChange[] = [];
  try {
    for (const operation of plan.operations) {
      const collection = targetCollections[operation.target];
      const items = next[collection] as unknown as Array<Record<string, unknown>>;
      const resolvedTargetId = operation.targetId.startsWith("@")
        ? String(resolveReferences(operation.targetId, refs))
        : operation.targetId;
      const targetId = operation.action === "create"
        ? refs.get(operation.ref || operation.id) || ""
        : resolvedTargetId;
      const index = items.findIndex((item) => item.id === targetId);

      if (operation.action === "create" && index >= 0) throw new Error(`${operation.id} 试图创建重复对象`);
      if (operation.action !== "create" && index < 0) throw new Error(`${operation.id} 的目标不存在`);
      if (
        index >= 0 &&
        operationItemWorldId(operation.target, items[index], next, workspace) !== options.worldId
      ) {
        throw new Error(`${operation.id} 不能修改其他世界`);
      }
      if (
        operation.target === "entity-template" &&
        operation.action === "delete" &&
        Boolean(items[index]?.builtIn)
      ) {
        throw new Error(`${operation.id} 不能删除项目内置模板`);
      }

      const resolvedData = resolveReferences(operation.data, refs) as Record<string, unknown>;
      if (
        operation.target === "member" &&
        "email" in resolvedData &&
        text(resolvedData.email, 500) &&
        !options.instruction.includes(text(resolvedData.email, 500))
      ) {
        throw new Error(`${operation.id} 的成员账号未在用户指令中明确提供`);
      }
      const before = index >= 0 ? cloneJson(items[index]) : null;
      if (operation.action === "delete") {
        const removed = items.splice(index, 1)[0];
        changes.push({
          id: createAiOperationId("ai-change"),
          target: operation.target,
          collection,
          action: "delete",
          itemId: targetId,
          label: itemLabel(operation.target, removed),
          before,
          after: null,
          beforeIndex: index
        });
        continue;
      }

      const item = buildItem(
        operation.target,
        resolvedData,
        before,
        targetId,
        options.worldId,
        now,
        operation.action === "create" ? items.length : index,
        items,
        next
      );
      if (
        operation.target === "map-layer" ||
        operation.target === "map-marker-group" ||
        operation.target === "map-marker" ||
        operation.target === "map-route"
      ) {
        const mapId = text(item.mapId, 300);
        const mapItem = next.maps.find((candidate) => candidate.id === mapId) ||
          workspace.maps.find((candidate) => candidate.id === mapId);
        if (
          (mapItem && mapItem.worldId !== options.worldId) ||
          (!mapItem && !createdMapIds.has(mapId))
        ) {
          throw new Error(`${operation.id} 不能关联其他世界或不存在的地图`);
        }
      }
      if (operation.action === "create") items.push(item);
      else items[index] = item;
      changes.push({
        id: createAiOperationId("ai-change"),
        target: operation.target,
        collection,
        action: operation.action,
        itemId: targetId,
        label: itemLabel(operation.target, item),
        before,
        after: cloneJson(item),
        beforeIndex: index
      });
    }

    for (const mapId of createdMapIds) {
      const mapItem = next.maps.find((item) => item.id === mapId);
      const layerId = defaultMapLayerId(mapId);
      if (!mapItem || next.mapLayers.some((layer) => layer.id === layerId)) continue;
      const layer = createDefaultMapLayer(options.worldId, mapId, now);
      next.mapLayers.push(layer);
      changes.push({
        id: createAiOperationId("ai-change"),
        target: "map-layer",
        collection: "mapLayers",
        action: "create",
        itemId: layer.id,
        label: layer.title,
        before: null,
        after: cloneJson(layer),
        beforeIndex: -1
      });
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "AI 操作引用解析失败" };
  }

  const validationErrors = validateWorkspace(next, options.worldId, originalMapIds);
  if (validationErrors.length) return { ok: false, error: validationErrors.join("；") };
  normalizeAiCodexOrdering(next, options.worldId, now, changes);
  const normalizedValidationErrors = validateWorkspace(next, options.worldId, originalMapIds);
  if (normalizedValidationErrors.length) {
    return { ok: false, error: normalizedValidationErrors.join("；") };
  }
  const run: AiOperationRun = {
    id: createAiOperationId("ai-operation-run"),
    worldId: options.worldId,
    instruction: text(options.instruction, 12000),
    summary: text(plan.summary, 2000),
    model: text(options.model, 300),
    status: "applied",
    operations: cloneJson(plan.operations),
    changes: consolidateChanges(changes),
    checkpointCreatedAt: now,
    createdAt: now,
    updatedAt: now,
    undoneAt: ""
  };
  next.aiOperationRuns = [...(next.aiOperationRuns || []), run].slice(-200);
  return { ok: true, data: next, run, refs: Object.fromEntries(refs) };
}

function canonicalJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => [key, canonicalJson((value as Record<string, unknown>)[key])])
  );
}

function sameJson(left: unknown, right: unknown) {
  return JSON.stringify(canonicalJson(left)) === JSON.stringify(canonicalJson(right));
}

export function recordAiWorkspaceChange<T extends AiOperationWorkspace>(
  workspace: T,
  input: AiRecordedWorkspaceChange
): { ok: true; data: T; run: AiOperationRun } | { ok: false; error: string } {
  const collection = targetCollections[input.target];
  const items = workspace[collection] as unknown as Array<Record<string, unknown>>;
  const beforeIndex = items.findIndex((item) => item.id === input.itemId);
  if (beforeIndex < 0) return { ok: false, error: `${aiOperationTargetLabels[input.target]}已经不存在` };
  const before = cloneJson(items[beforeIndex]);
  const after = cleanJson(input.after) as Record<string, unknown> | null;
  if (!after || typeof after !== "object" || Array.isArray(after)) {
    return { ok: false, error: "AI 写入结果格式无效" };
  }
  if (text(after.id, 300) !== input.itemId) {
    return { ok: false, error: "AI 写入结果与目标对象不一致" };
  }
  const itemWorldId = operationItemWorldId(input.target, after, workspace, workspace);
  if (itemWorldId !== input.worldId) {
    return { ok: false, error: "AI 写入目标不属于当前世界" };
  }
  if (sameJson(before, after)) return { ok: false, error: "AI 没有产生可记录的修改" };

  const now = input.now || new Date().toISOString();
  const next = cloneJson(workspace);
  const nextItems = next[collection] as unknown as Array<Record<string, unknown>>;
  nextItems[beforeIndex] = cloneJson(after);
  const change: AiOperationChange = {
    id: createAiOperationId("ai-change"),
    target: input.target,
    collection,
    action: "update",
    itemId: input.itemId,
    label: itemLabel(input.target, after),
    before,
    after: cloneJson(after),
    beforeIndex
  };
  const run: AiOperationRun = {
    id: createAiOperationId("ai-operation-run"),
    worldId: input.worldId,
    instruction: text(input.instruction, 12000),
    summary: text(input.summary, 2000) || "AI 内容写入",
    model: text(input.model, 300),
    status: "applied",
    operations: [{
      id: createAiOperationId("ai-operation"),
      action: "update",
      target: input.target,
      targetId: input.itemId,
      ref: "",
      data: {}
    }],
    changes: [change],
    checkpointCreatedAt: now,
    createdAt: now,
    updatedAt: now,
    undoneAt: ""
  };
  next.aiOperationRuns.push(run);
  return { ok: true, data: next, run };
}

function changedTopLevelFields(left: unknown, right: unknown) {
  const leftObject = left && typeof left === "object" && !Array.isArray(left)
    ? left as Record<string, unknown>
    : {};
  const rightObject = right && typeof right === "object" && !Array.isArray(right)
    ? right as Record<string, unknown>
    : {};
  return Array.from(new Set([...Object.keys(leftObject), ...Object.keys(rightObject)]))
    .filter((key) => !sameJson(leftObject[key], rightObject[key]))
    .slice(0, 6);
}

function consolidateChanges(changes: AiOperationChange[]) {
  const consolidated = new Map<string, AiOperationChange>();
  for (const change of changes) {
    const key = `${change.collection}\u0000${change.itemId}`;
    const existing = consolidated.get(key);
    if (!existing) {
      consolidated.set(key, cloneJson(change));
      continue;
    }
    existing.after = cloneJson(change.after);
    existing.label = change.label || existing.label;
  }
  return Array.from(consolidated.values())
    .filter((change) => !(change.before == null && change.after == null))
    .map((change) => ({
      ...change,
      action:
        change.before == null
          ? "create"
          : change.after == null
            ? "delete"
            : "update"
    })) as AiOperationChange[];
}

export function undoAiOperationRun<T extends AiOperationWorkspace>(
  workspace: T,
  runId: string,
  now = new Date().toISOString()
): { ok: true; data: T; run: AiOperationRun } | { ok: false; error: string } {
  const run = workspace.aiOperationRuns.find((item) => item.id === runId);
  if (!run || run.status !== "applied") return { ok: false, error: "该 AI 操作当前不可撤销" };
  const next = cloneJson(workspace);

  for (const change of run.changes) {
    const items = next[change.collection] as unknown as Array<Record<string, unknown>>;
    const current = items.find((item) => item.id === change.itemId) || null;
    if (!sameJson(current, change.after)) {
      const fields = changedTopLevelFields(change.after, current);
      return {
        ok: false,
        error: `${change.label} 在 AI 执行后又被修改，已阻止覆盖式撤销${fields.length ? `（变化字段：${fields.join("、")}）` : ""}`
      };
    }
  }

  for (const change of [...run.changes].reverse()) {
    const items = next[change.collection] as unknown as Array<Record<string, unknown>>;
    const index = items.findIndex((item) => item.id === change.itemId);
    if (change.action === "create") {
      if (index >= 0) items.splice(index, 1);
    } else if (change.action === "update" && change.before) {
      items[index] = cloneJson(change.before) as Record<string, unknown>;
    } else if (change.action === "delete" && change.before) {
      items.splice(Math.max(0, Math.min(change.beforeIndex, items.length)), 0, cloneJson(change.before) as Record<string, unknown>);
    }
  }

  const runIndex = next.aiOperationRuns.findIndex((item) => item.id === runId);
  next.aiOperationRuns[runIndex] = {
    ...next.aiOperationRuns[runIndex],
    status: "undone",
    updatedAt: now,
    undoneAt: now
  };
  return { ok: true, data: next, run: next.aiOperationRuns[runIndex] };
}

export function normalizeAiOperationRun(
  input: Partial<AiOperationRun>,
  worldId: string,
  index = 0
): AiOperationRun {
  const now = new Date().toISOString();
  const operations = Array.isArray(input.operations)
    ? input.operations.map(normalizeOperation).filter(Boolean).slice(0, 40) as AiProjectOperation[]
    : [];
  const changes = Array.isArray(input.changes)
    ? input.changes.slice(0, 100).map((raw, changeIndex) => {
        const change = plainObject(raw);
        const target = targets.has(change.target as AiOperationTarget)
          ? change.target as AiOperationTarget
          : "entity";
        return {
          id: text(change.id, 300) || `ai-change-${changeIndex + 1}`,
          target,
          collection: targetCollections[target],
          action: actions.has(change.action as AiOperationAction)
            ? change.action as AiOperationAction
            : "update",
          itemId: text(change.itemId, 300),
          label: text(change.label, 500) || aiOperationTargetLabels[target],
          before: cleanJson(change.before),
          after: cleanJson(change.after),
          beforeIndex: Math.max(-1, Math.round(Number(change.beforeIndex) || 0))
        };
      })
    : [];
  return {
    id: text(input.id, 300) || `ai-operation-run-${worldId}-${index + 1}`,
    worldId,
    instruction: text(input.instruction, 12000),
    summary: text(input.summary, 2000) || "AI 项目操作",
    model: text(input.model, 300),
    status: ["applied", "undone", "archived"].includes(input.status || "")
      ? input.status as AiOperationRun["status"]
      : "archived",
    operations,
    changes,
    checkpointCreatedAt: text(input.checkpointCreatedAt, 40),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || input.createdAt || now,
    undoneAt: text(input.undoneAt, 40)
  };
}

function compactSections(workspace: AiOperationWorkspace, worldId: string) {
  const maps = workspace.maps.filter((item) => item.worldId === worldId);
  const mapIds = new Set(maps.map((item) => item.id));
  const templates = workspace.entityTemplates
    .filter((item) => item.worldId === worldId)
    .sort((left, right) => Number(left.builtIn) - Number(right.builtIn) || left.name.localeCompare(right.name, "zh-CN"));
  const templateForEntity = (entity: AiOperationEntity) =>
    templates.find((template) => template.id === entity.templateId) ||
    templates.find((template) => template.builtIn && template.entityTypes.includes(entity.type));
  const visibleTemplateData = (entity: AiOperationEntity) => {
    const secretKeys = new Set(
      (templateForEntity(entity)?.fields || []).filter((field) => field.secret).map((field) => field.key)
    );
    return Object.fromEntries(
      Object.entries(entity.templateData).filter(([key]) => !secretKeys.has(key))
    );
  };
  return {
    worlds: workspace.worlds.filter((item) => item.id === worldId).map((item) => ({
      id: item.id, name: item.name, description: item.description.slice(0, 1800), visibility: item.visibility
    })),
    codexCategories: workspace.codexCategories.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, parentId: item.parentId, title: item.title,
      description: item.description.slice(0, 500), icon: item.icon, color: item.color, order: item.order
    })),
    entityTemplates: templates.map((item) => ({
      id: item.id, name: item.name, description: item.description.slice(0, 700),
      entityTypes: item.entityTypes, builtIn: item.builtIn,
      fields: item.fields.map((field) => ({
        id: field.id, key: field.key, label: field.label, type: field.type,
        required: field.required, secret: field.secret,
        ...(field.secret ? {} : { defaultValue: field.defaultValue }),
        options: field.options, targetEntityTypes: field.targetEntityTypes, order: field.order
      }))
    })),
    entities: workspace.entities.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, type: item.type, title: item.title, summary: item.summary.slice(0, 800), tags: item.tags,
      categoryId: item.categoryId, templateId: item.templateId || "", templateData: visibleTemplateData(item)
    })),
    quests: workspace.quests.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, title: item.title, category: item.category, status: item.status,
      summary: item.summary.slice(0, 800), trigger: item.trigger.slice(0, 500),
      relatedEntityIds: item.relatedEntityIds, prerequisiteQuestIds: item.prerequisiteQuestIds,
      steps: item.steps.map((step) => ({ id: step.id, title: step.title, objective: step.objective.slice(0, 500) }))
    })),
    storyVariables: workspace.storyVariables.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, key: item.key, name: item.name, type: item.type, defaultValue: item.defaultValue,
      description: item.description.slice(0, 500)
    })),
    storyScenes: workspace.storyScenes.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, title: item.title, summary: item.summary.slice(0, 800), status: item.status,
      entryNodeId: item.entryNodeId, relatedEntityIds: item.relatedEntityIds, relatedQuestIds: item.relatedQuestIds,
      nodes: item.nodes.slice(0, 30).map((node) => ({
        id: node.id, label: node.label, speakerEntityId: node.speakerEntityId,
        text: node.text.slice(0, 500), nextNodeId: node.nextNodeId, isEnding: node.isEnding,
        choices: node.choices.slice(0, 12).map((choice) => ({ id: choice.id, text: choice.text.slice(0, 300), targetNodeId: choice.targetNodeId }))
      }))
    })),
    storyTestPresets: workspace.storyTestPresets.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, name: item.name, description: item.description.slice(0, 600),
      sceneId: item.sceneId, initialState: item.initialState,
      maxDepth: item.maxDepth, maxPaths: item.maxPaths
    })),
    storyReviewIssues: workspace.storyReviewIssues.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, title: item.title, detail: item.detail.slice(0, 900),
      severity: item.severity, status: item.status, source: item.source,
      presetId: item.presetId, sceneId: item.sceneId, nodeId: item.nodeId,
      entityId: item.entityId, questId: item.questId
    })),
    relations: workspace.relations.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, sourceEntityId: item.sourceEntityId, targetEntityId: item.targetEntityId,
      kind: item.kind, label: item.label, direction: item.direction, strength: item.strength,
      evidenceType: item.evidenceType || "unspecified",
      sourceCitation: item.sourceCitation?.slice(0, 600) || "",
      historicalScope: item.historicalScope?.slice(0, 300) || "",
      confidence: item.confidence || "unspecified"
    })),
    assets: workspace.assets.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, name: item.name, kind: item.kind, tags: item.tags,
      notes: item.notes.slice(0, 700), linkedEntityIds: item.linkedEntityIds
    })),
    members: workspace.members.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, name: item.name, role: item.role
    })),
    maps: maps.map((item) => ({
      id: item.id, title: item.title, description: item.description.slice(0, 800),
      width: item.width, height: item.height, distanceWidth: item.distanceWidth,
      distanceUnit: item.distanceUnit, customDistanceUnit: item.customDistanceUnit, grid: item.grid,
      regions: item.regions.slice(0, 30).map((region) => ({
        id: region.id, title: region.title, description: region.description.slice(0, 500),
        kind: region.kind, color: region.color, opacity: region.opacity, order: region.order,
        visible: region.visible, locked: region.locked, points: region.points.slice(0, 100),
        references: region.references
      }))
    })),
    mapLayers: workspace.mapLayers.filter((item) => mapIds.has(item.mapId)).map((item) => ({
      id: item.id, mapId: item.mapId, title: item.title, description: item.description.slice(0, 500),
      color: item.color, order: item.order, visible: item.visible, locked: item.locked
    })),
    mapMarkerGroups: workspace.mapMarkerGroups.filter((item) => mapIds.has(item.mapId)).map((item) => ({
      id: item.id, mapId: item.mapId, title: item.title, description: item.description.slice(0, 500),
      color: item.color, order: item.order, visible: item.visible, locked: item.locked
    })),
    mapMarkers: workspace.mapMarkers.filter((item) => mapIds.has(item.mapId)).map((item) => ({
      id: item.id, mapId: item.mapId, layerId: item.layerId, groupId: item.groupId,
      entityId: item.entityId, questId: item.questId, sceneId: item.sceneId,
      references: item.references, x: item.x, y: item.y, label: item.label,
      markerType: item.markerType, color: item.color, description: item.description.slice(0, 700)
    })),
    mapRoutes: workspace.mapRoutes.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, mapId: item.mapId, title: item.title, description: item.description.slice(0, 700),
      color: item.color, status: item.status, travelMode: item.travelMode,
      travelSpeed: item.travelSpeed, travelHoursPerDay: item.travelHoursPerDay,
      stops: item.stops.map((stop) => ({
        id: stop.id, markerId: stop.markerId, title: stop.title,
        notes: stop.notes.slice(0, 500), duration: stop.duration
      }))
    })),
    narrativeMilestones: workspace.narrativeMilestones.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, title: item.title, summary: item.summary.slice(0, 900), act: item.act,
      status: item.status, priority: item.priority, order: item.order, targetDate: item.targetDate,
      blockedReason: item.blockedReason.slice(0, 500), manuscriptPreview: item.manuscriptBody.slice(0, 1200),
      dependencyIds: item.dependencyIds, linkedQuestIds: item.linkedQuestIds,
      linkedSceneIds: item.linkedSceneIds, linkedEntityIds: item.linkedEntityIds,
      linkedTimelineEventIds: item.linkedTimelineEventIds,
      linkedMapMarkerIds: item.linkedMapMarkerIds,
      linkedReviewIssueIds: item.linkedReviewIssueIds
    })),
    manuscriptBooks: (workspace.manuscriptBooks || []).filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, title: item.title, subtitle: item.subtitle, summary: item.summary.slice(0, 900),
      status: item.status, order: item.order, targetWordCount: item.targetWordCount,
      dailyWordGoal: item.dailyWordGoal
    })),
    manuscriptVolumes: (workspace.manuscriptVolumes || []).filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, bookId: item.bookId, title: item.title, summary: item.summary.slice(0, 800),
      status: item.status, order: item.order, targetWordCount: item.targetWordCount
    })),
    manuscriptChapters: (workspace.manuscriptChapters || []).filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, bookId: item.bookId, volumeId: item.volumeId, title: item.title,
      summary: item.summary.slice(0, 900), bodyPreview: item.body.slice(0, 2200), notes: item.notes.slice(0, 700),
      status: item.status, order: item.order, targetWordCount: item.targetWordCount,
      viewpointEntityId: item.viewpointEntityId, linkedNarrativeMilestoneId: item.linkedNarrativeMilestoneId,
      linkedStorySceneIds: item.linkedStorySceneIds, references: item.references
    })),
    manuscriptScenes: (workspace.manuscriptScenes || []).filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, bookId: item.bookId, volumeId: item.volumeId, chapterId: item.chapterId,
      title: item.title, summary: item.summary.slice(0, 700), bodyPreview: item.body.slice(0, 1600),
      notes: item.notes.slice(0, 500), status: item.status, order: item.order,
      viewpointEntityId: item.viewpointEntityId, locationEntityId: item.locationEntityId,
      relatedEntityIds: item.relatedEntityIds, linkedStorySceneId: item.linkedStorySceneId,
      references: item.references
    })),
    timelineTracks: workspace.timelineTracks.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, name: item.name, description: item.description.slice(0, 500), order: item.order
    })),
    timelineEvents: workspace.timelineEvents.filter((item) => item.worldId === worldId).map((item) => ({
      id: item.id, trackId: item.trackId, entityId: item.entityId, questId: item.questId,
      sceneId: item.sceneId, references: item.references, title: item.title,
      summary: item.summary.slice(0, 700), displayDate: item.displayDate,
      datePrecision: item.datePrecision, startValue: item.startValue, endValue: item.endValue,
      era: item.era, sortOrder: item.sortOrder, dependencyIds: item.dependencyIds
    }))
  };
}

export function buildAiOperationContext(
  workspace: AiOperationWorkspace,
  worldId: string,
  maximumCharacters = 48000
): AiOperationContext {
  const world = workspace.worlds.find((item) => item.id === worldId);
  const sections = compactSections(workspace, worldId);
  const budgets: Record<AiOperationCollection, number> = {
    worlds: 0.02,
    codexCategories: 0.04,
    entityTemplates: 0.05,
    entities: 0.075,
    quests: 0.07,
    storyVariables: 0.035,
    storyScenes: 0.09,
    storyTestPresets: 0.03,
    storyReviewIssues: 0.03,
    relations: 0.05,
    assets: 0.035,
    members: 0.02,
    maps: 0.04,
    mapLayers: 0.025,
    mapMarkerGroups: 0.02,
    mapMarkers: 0.04,
    mapRoutes: 0.05,
    narrativeMilestones: 0.05,
    manuscriptBooks: 0.02,
    manuscriptVolumes: 0.02,
    manuscriptChapters: 0.085,
    manuscriptScenes: 0.05,
    timelineTracks: 0.02,
    timelineEvents: 0.035
  };
  const output: Record<string, unknown> = {
    world: world ? { id: world.id, name: world.name, description: world.description.slice(0, 1800) } : null,
    omitted: {}
  };
  const counts = {} as Record<AiOperationCollection, number>;
  for (const collection of Object.keys(sections) as AiOperationCollection[]) {
    const items = sections[collection];
    counts[collection] = items.length;
    const budget = Math.max(1000, Math.floor((maximumCharacters - 3000) * budgets[collection]));
    const selected: unknown[] = [];
    let used = 2;
    for (const item of items) {
      const serialized = JSON.stringify(item);
      if (used + serialized.length + 1 > budget) break;
      selected.push(item);
      used += serialized.length + 1;
    }
    output[collection] = selected;
    (output.omitted as Record<string, number>)[collection] = items.length - selected.length;
  }
  const serialized = JSON.stringify(output, null, 2);
  return { text: serialized.slice(0, maximumCharacters), characters: Math.min(serialized.length, maximumCharacters), counts };
}

export const aiOperationSystemPrompt = `你是 Worldcraft Codex 的项目操作智能体。你只能输出有效 JSON，不使用 Markdown，不解释。
输出格式：{"summary":"执行摘要","operations":[{"id":"步骤名","action":"create|update|delete","target":"world|codex-category|entity-template|entity|quest|story-variable|story-scene|story-test-preset|story-review-issue|relation|asset|member|map|map-layer|map-marker-group|map-marker|map-route|narrative-milestone|manuscript-book|manuscript-volume|manuscript-chapter|manuscript-scene|timeline-track|timeline-event","targetId":"更新或删除时使用现有 ID","ref":"创建对象的短引用名","data":{}}]}
创建对象后，后续操作可以用字符串 "@引用名" 填入关联 ID。只使用上下文中存在的 ID 或本批创建引用。
world 只允许 update 当前世界的 name、description、visibility。asset 只允许 update 已导入资源的 name、kind、tags、notes、linkedEntityIds；不得创建或删除资源，不得修改本地文件名、路径、MIME、大小和时间。测试运行、自动一致性扫描与凭据均不可操作。成员上下文不含账号；只有用户在本次指令中明确给出账号时，才可把它写入 member.email，并且世界必须始终保留至少一名 owner。
项目分类可用 parentId 建立层级；条目可用 categoryId、templateId 与 templateData 关联分类和模板。内置模板不可删除。story-test-preset 的 initialState 使用变量 ID 作为键；若变量在本批创建，可用 "@引用名" 作为对象键。story-review-issue 只能创建或编辑人工问题，不得伪造测试运行、分析或一致性扫描来源。
关系可填写 evidenceType、sourceCitation、historicalScope 与 confidence。evidenceType 使用 unspecified、primary-text、historical-record、ritual-record、material-evidence、scholarly-inference、textual-variant、oral-tradition 或 creative；confidence 使用 unspecified、certain、probable、disputed 或 creative。
地图坐标、标记 x/y 和区域 points 均使用 0 至 100 的百分比。新建地图会自动获得默认图层；标记可省略 layerId 使用默认图层，也可引用本批创建的图层或标记组。地图图片路径不可由 AI 修改。区域属于 map.regions；更新区域时提交该地图完整的目标 regions 数组，每个区域至少 3 个点。路线 stops 的 markerId 必须属于同一地图。
叙事里程碑可关联任务、场景、条目、时间点、地图标记和审阅问题；依赖不得指向自身或形成循环。时间点和地图内容的多对象关联使用 references 数组，每项格式为 {"kind":"world|entity|quest|scene|story-variable|timeline-event|timeline-track|map|map-marker|map-route|asset|milestone|review-issue|relation","id":"对象 ID"}；日期精度使用 exact、approximate、unknown、range 或 custom。
书稿结构按 manuscript-book、manuscript-volume、manuscript-chapter、manuscript-scene 逐级组织。卷必须给出 bookId，章节必须给出 bookId，可选 volumeId，正文场景必须给出 chapterId；创建父级后可用 @引用名。正文使用 body，策划说明使用 summary 或 notes，不得伪造批注和写作统计。
删除对象时必须在同一批次清理其全部关联。剧情场景的每个节点必须有唯一 id，入口、nextNodeId 和选项 targetNodeId 必须引用同场景节点。不要修改未被用户要求的内容。`;
