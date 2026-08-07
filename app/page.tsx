"use client";

import {
  AlertTriangle,
  ArchiveRestore,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Boxes,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Copy,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  Flag,
  FlaskConical,
  FolderOpen,
  FolderTree,
  GitBranch,
  Globe2,
  HardDrive,
  History,
  Image as ImageIcon,
  KeyRound,
  Layers3,
  Library,
  Link2,
  ListChecks,
  LocateFixed,
  LockKeyhole,
  Map,
  MapPin,
  MessagesSquare,
  Menu,
  Minimize2,
  Music,
  Network,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PenLine,
  Plus,
  RefreshCw,
  Route,
  Save,
  ScanSearch,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  Tags,
  Trash2,
  Upload,
  UsersRound,
  Variable,
  Video,
  Maximize2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { RichTextEditor } from "./components/RichTextEditor";
import { CodexTree } from "./components/CodexTree";
import {
  AuthorWorkspace,
  type AuthorIssueItem,
  type AuthorOpenLoopItem,
  type AuthorQueueItem,
  type AuthorRecentItem,
  type AuthorWritingItem,
  type AuthorWorkspaceStats
} from "./components/AuthorWorkspace";
import {
  CreateContentDialog,
  type CreateContentKind,
  type CreateContentRequest
} from "./components/CreateContentDialog";
import {
  CategoryDialog,
  type CategoryDialogRequest
} from "./components/CategoryDialog";
import { ChangeImpactDialog } from "./components/ChangeImpactDialog";
import {
  QuestBranchTree,
  QuestDependencyGraph,
  QuestParticipationBoard,
  QuestVisualFullscreen as VisualFullscreenDialog
} from "./components/QuestVisuals";
import { RelationGraph } from "./components/RelationGraph";
import type { StoryWorkspaceMode } from "./components/StoryWorkspace";
import type { ManuscriptChapterVersion } from "./components/ManuscriptWorkspace";
import type {
  ManuscriptPublicationExportResult,
  ManuscriptPublicationRequest
} from "./manuscript-publication";
import {
  buildOfflineWikiPublication,
  type OfflineWikiExportResult,
  type OfflineWikiPublication
} from "./offline-wiki";
import type { StoryTestWorkspaceMode } from "./components/StoryTestWorkspace";
import {
  GlobalSearchDialog,
  type GlobalSearchResult
} from "./components/GlobalSearchDialog";
import type {
  MapOperationFocus,
  MapVersionLoadResult,
  MapVersionRestoreResult,
  MapVersionSnapshot
} from "./components/MapWorkspace";
import type { ProjectReferenceOption } from "./components/ProjectReferencePicker";
import { BackReferenceList } from "./components/BackReferenceList";
import { PublicationPreview } from "./components/PublicationPreview";
import { StarterPackDialog } from "./components/StarterPackDialog";
import { WorldDeleteDialog } from "./components/WorldDeleteDialog";
import { ReleaseLifecycle } from "./components/ReleaseLifecycle";
import { ReleasePanel } from "./components/ReleasePanel";
import type { AiContext } from "./components/AiWorkspace";
import {
  isolateWorldWorkspace,
  removeWorldFromWorkspace
} from "./world-lifecycle";
import {
  InlineAiTextarea,
  InlineAiProvider,
  type InlineAiRuntime
} from "./components/InlineAiAssistant";
import {
  createAiWritingId,
  createAiWritingSession,
  normalizeAiMemoryItem,
  normalizeAiWritingSession,
  type AiMemoryItem,
  type AiWritingSession
} from "./ai-writing";
import {
  applyInlineAiWorkspaceChange,
  getInlineAiWorkspaceValue,
  undoInlineAiWorkspaceChange,
  type InlineAiAnalysisRequest,
  type InlineAiCommitRequest,
  type InlineAiSource,
  type InlineAiTarget
} from "./inline-ai";
import { getStarterPack, type StarterPackId } from "./starter-packs";
import {
  applyAiOperationPlan,
  buildAiOperationContext,
  normalizeAiOperationRun,
  recordAiWorkspaceChange,
  undoAiOperationRun,
  type AiOperationChange,
  type AiOperationPlan,
  type AiOperationRun,
  type AiOperationTarget
} from "./ai-operations";
import type { NarrativeReferenceKind } from "./components/NarrativeProductionWorkspace";
import {
  createStoryScene,
  createStoryVariable,
  getStorySceneText,
  normalizeStoryScene,
  normalizeStorySceneVariableType,
  normalizeStoryVariable,
  validateStoryScene,
  validateStoryVariables
} from "./story";
import type {
  DialogueNode,
  StoryCondition,
  StoryEffect,
  StoryScene,
  StoryState,
  StoryVariable
} from "./story";
import {
  createStoryReviewIssue,
  createStoryTestPreset,
  normalizeStoryReviewIssue,
  normalizeStoryTestPreset,
  normalizeStoryTestRun
} from "./story-testing";
import type {
  StoryReviewIssue,
  StoryTestPreset,
  StoryTestRun
} from "./story-testing";
import {
  calculateMapRegionMetrics,
  calculateMapRouteMetrics,
  createDefaultTimelineTrack,
  createDefaultMapLayer,
  createMapImageTransform,
  createMapLayer,
  createMapMarker,
  createMapMarkerGroup,
  createMapRoute,
  createTimelineEvent,
  createTimelineTrack,
  createWorldMap,
  defaultMapLayerId,
  ensureMapLayers,
  ensureTimelineTracks,
  formatMapDistance,
  formatMapTravelTime,
  formatTimelineInterval,
  mapTravelModeLabels,
  normalizeMapMarker,
  normalizeMapMarkerGroup,
  normalizeMapHierarchy,
  normalizeMapLayer,
  normalizeMapRoute,
  normalizeTimelineEvent,
  normalizeTimelineTrack,
  normalizeWorldMap,
  validateMapPlanning,
  validateTimelinePlanning
} from "./world-planning";
import {
  buildProjectReferenceIndex,
  getProjectBackReferences,
  normalizeProjectObjectRefs,
  type ProjectReference,
  type ProjectReferenceAnchor,
  type ProjectObjectKind,
  type ProjectObjectRef
} from "./project-references";
import { buildChangeImpactReport } from "./change-impact";
import {
  sanitizePublicationPayload,
  sanitizePublicationRichText
} from "./publication";
import {
  createNarrativeMilestone,
  findNarrativeCriticalPath,
  getNarrativeCoverage,
  narrativePriorityLabels,
  narrativeStatusLabels,
  moveNarrativeMilestone,
  normalizeNarrativeMilestone,
  resequenceNarrativeMilestones,
  sortNarrativeMilestones,
  validateNarrativeMilestones
} from "./narrative-production";
import type {
  NarrativeMilestone,
  NarrativeMilestoneStatus
} from "./narrative-production";
import {
  buildManuscriptContext,
  countManuscriptWords,
  createManuscriptBook,
  createManuscriptChapter as createManuscriptChapterRecord,
  createManuscriptScene as createManuscriptSceneRecord,
  createManuscriptVolume,
  getManuscriptStatistics,
  manuscriptBookStatusLabels,
  mergeManuscriptChapters,
  manuscriptPlainText,
  manuscriptStatusLabels,
  moveManuscriptUnit,
  normalizeManuscriptBook,
  normalizeManuscriptChapter,
  normalizeManuscriptClue,
  normalizeManuscriptKnowledgeState,
  normalizeManuscriptScene,
  normalizeManuscriptVolume,
  normalizeManuscriptWorkspace,
  resequenceManuscriptUnits,
  sortManuscriptUnits,
  splitManuscriptChapter,
  validateManuscriptConsistency
} from "./manuscript";
import type {
  ManuscriptBook,
  ManuscriptChapter,
  ManuscriptClue,
  ManuscriptKnowledgeState,
  ManuscriptScene,
  ManuscriptVolume,
  ManuscriptWorkspaceData
} from "./manuscript";
import {
  addMissingDefaultEntityTemplates,
  applyTemplateDefaults,
  createDefaultEntityTemplates,
  createEntityTemplate,
  entityTemplateFieldTypeLabels,
  getTemplateCompletion,
  normalizeEntityTemplate,
  resolveEntityTemplate,
  templateEntityTypeLabels,
  templateEntityTypes,
  validateEntityTemplates
} from "./entity-templates";
import type {
  EntityTemplateDefinition,
  EntityTemplateField,
  EntityTemplateFieldType,
  TemplateEntityType
} from "./entity-templates";
import {
  buildConsistencyMarkdownReport,
  buildConsistencyModelPrompt,
  createDefaultConsistencyModelSettings,
  createDefaultConsistencySettings,
  normalizeConsistencyFinding,
  normalizeConsistencyModelSettings,
  normalizeConsistencyScan,
  normalizeConsistencySettings,
  runConsistencyScan,
  setConsistencyRuleEnabled,
  updateConsistencyFindingStatus
} from "./consistency";
import type {
  ConsistencyFinding,
  ConsistencyModelSettings,
  ConsistencyScan,
  ConsistencySettings,
  ConsistencyStatus,
  ConsistencyTarget,
  ConsistencyWorkspaceInput
} from "./consistency";
import type {
  MapLayer,
  MapMarker,
  MapMarkerGroup,
  MapRegion,
  MapRoute,
  MapStoryPhase,
  TimelineEvent,
  TimelineTrack,
  WorldMap
} from "./world-planning";
import { renderMergedMapLayerImage } from "./map-export";
import {
  createCodexCategory,
  createDefaultCodexCategories,
  flattenCodexCategories,
  getCodexCategoryDescendantIds,
  getCodexCategoryPath,
  moveCodexCategory,
  moveCodexEntity,
  normalizeCodexHierarchy,
  removeCodexCategory,
  validateCodexHierarchy
} from "./codex-tree";
import type {
  CodexCategory,
  CodexEntityType
} from "./codex-tree";
import {
  normalizeWorldWikiSettings,
  type WikiAudience,
  type WorldWikiSettings
} from "./wiki";

function WorkspaceLoading() {
  return (
    <div className="workspace-loading" role="status" aria-live="polite">
      <RefreshCw aria-hidden="true" className="is-spinning" size={20} />
      <span>正在打开工作区</span>
    </div>
  );
}

const StoryWorkspace = dynamic(
  () => import("./components/StoryWorkspace").then((module) => module.StoryWorkspace),
  { loading: WorkspaceLoading, ssr: false }
);
const StoryTestWorkspace = dynamic(
  () => import("./components/StoryTestWorkspace").then((module) => module.StoryTestWorkspace),
  { loading: WorkspaceLoading, ssr: false }
);
const MapWorkspace = dynamic(
  () => import("./components/MapWorkspace").then((module) => module.MapWorkspace),
  { loading: WorkspaceLoading, ssr: false }
);
const TimelineWorkspace = dynamic(
  () => import("./components/TimelineWorkspace").then((module) => module.TimelineWorkspace),
  { loading: WorkspaceLoading, ssr: false }
);
const WikiWorkspace = dynamic(
  () => import("./components/WikiWorkspace").then((module) => module.WikiWorkspace),
  { loading: WorkspaceLoading, ssr: false }
);
const ConsistencyWorkspace = dynamic(
  () => import("./components/ConsistencyWorkspace").then((module) => module.ConsistencyWorkspace),
  { loading: WorkspaceLoading, ssr: false }
);
const TemplateWorkspace = dynamic(
  () => import("./components/TemplateWorkspace").then((module) => module.TemplateWorkspace),
  { loading: WorkspaceLoading, ssr: false }
);
const AiWorkspace = dynamic(
  () => import("./components/AiWorkspace").then((module) => module.AiWorkspace),
  { loading: WorkspaceLoading, ssr: false }
);
const NarrativeProductionWorkspace = dynamic(
  () => import("./components/NarrativeProductionWorkspace").then((module) => module.NarrativeProductionWorkspace),
  { loading: WorkspaceLoading, ssr: false }
);

type EntityType = CodexEntityType;
type Visibility = "private" | "shared" | "public" | "secret";
type Role = "owner" | "editor" | "viewer" | "player";
type AppThemeId = "forest" | "paper" | "ocean" | "plum" | "night";
type AppThemeOption = {
  id: AppThemeId;
  label: string;
  description: string;
  colors: readonly [string, string, string, string];
  dark: boolean;
};
type WorkspaceTab =
  | "author"
  | "wiki"
  | "codex"
  | "quests"
  | "story"
  | "templates"
  | "production"
  | "testing"
  | "relations"
  | "assets"
  | "map"
  | "timeline"
  | "consistency"
  | "ai"
  | "health"
  | "permissions"
  | "export";

const appThemeOptions: AppThemeOption[] = [
  {
    id: "forest",
    label: "松墨",
    description: "清爽中性的默认工作台",
    colors: ["#f2f3f2", "#ffffff", "#177a61", "#202522"],
    dark: false
  },
  {
    id: "paper",
    label: "宣纸",
    description: "温和纸白与克制朱砂",
    colors: ["#f4f1ec", "#fffefa", "#a44f3f", "#292825"],
    dark: false
  },
  {
    id: "ocean",
    label: "海雾",
    description: "冷静蓝灰，适合长时间整理",
    colors: ["#eef3f6", "#ffffff", "#2f7192", "#172a34"],
    dark: false
  },
  {
    id: "plum",
    label: "梅影",
    description: "柔和灰白与梅子强调色",
    colors: ["#f4f1f3", "#ffffff", "#8a4663", "#2c2429"],
    dark: false
  },
  {
    id: "night",
    label: "夜航",
    description: "低亮度深色创作环境",
    colors: ["#111715", "#19211e", "#5fc6a1", "#0b0f0e"],
    dark: true
  }
];

function isAppThemeId(value: string | null): value is AppThemeId {
  return appThemeOptions.some((theme) => theme.id === value);
}

const workspaceTabLabels: Record<WorkspaceTab, string> = {
  author: "作者工作台",
  wiki: "世界总览",
  codex: "知识库",
  quests: "任务线",
  story: "剧情",
  templates: "模板",
  production: "制作",
  testing: "测试",
  relations: "关系图谱",
  assets: "资源库",
  map: "地图",
  timeline: "时间线",
  consistency: "一致性",
  ai: "AI 工具",
  health: "项目检查",
  permissions: "权限",
  export: "导出"
};

const secondaryWorkspaceTabs = new Set<WorkspaceTab>([
  "production",
  "templates",
  "testing",
  "relations",
  "assets",
  "timeline",
  "consistency",
  "health",
  "permissions",
  "export"
]);
type QuestStatus = "draft" | "active" | "implemented" | "cut";
type QuestCategory = "main" | "side" | "character";
type QuestWorkspaceMode = "editor" | "graph" | "participation";
type ReferenceLocationRequest = {
  source: ProjectObjectRef;
  anchor: ProjectReferenceAnchor;
  token: number;
};
type PendingReferenceCreation = {
  source: ProjectObjectRef;
  requestedKind: ProjectObjectKind;
};

const creatableProjectReferenceKinds: ProjectObjectKind[] = [
  "entity",
  "quest",
  "scene",
  "story-variable",
  "timeline-event",
  "timeline-track",
  "map",
  "map-marker",
  "map-route",
  "milestone",
  "relation"
];
type RelationKind =
  | "ally"
  | "rival"
  | "family"
  | "member"
  | "leads"
  | "controls"
  | "located"
  | "route"
  | "teacher"
  | "source"
  | "creator"
  | "companion"
  | "protector"
  | "evolution"
  | "disputed"
  | "incarnation"
  | "subordinate"
  | "devotion"
  | "influence"
  | "leader"
  | "collaborator"
  | "worship"
  | "peer"
  | "ritual"
  | "contains"
  | "custom";
type RelationDirection = "directed" | "undirected" | "mutual";
type RelationEvidenceType =
  | "unspecified"
  | "primary-text"
  | "historical-record"
  | "ritual-record"
  | "material-evidence"
  | "scholarly-inference"
  | "textual-variant"
  | "oral-tradition"
  | "creative";
type RelationConfidence = "unspecified" | "certain" | "probable" | "disputed" | "creative";
type AssetKind = "image" | "map" | "video" | "audio" | "concept" | "document";

type World = {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  visibility: Exclude<Visibility, "secret">;
  wiki?: Partial<WorldWikiSettings>;
  createdAt: string;
  updatedAt: string;
};

type Entity = {
  id: string;
  worldId: string;
  type: EntityType;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  visibility: Visibility;
  createdBy: string;
  updatedAt: string;
  categoryId: string;
  order: number;
  templateId?: string;
  templateData: Record<string, string>;
};

type QuestStep = {
  id: string;
  title: string;
  objective: string;
  condition: string;
  branch: string;
  failure: string;
  reward: string;
  notes: string;
};

type QuestLine = {
  id: string;
  worldId: string;
  title: string;
  category: QuestCategory;
  status: QuestStatus;
  summary: string;
  trigger: string;
  relatedEntityIds: string[];
  prerequisiteQuestIds: string[];
  steps: QuestStep[];
  developerNotes: string;
  updatedAt: string;
};

type EntityRelation = {
  id: string;
  worldId: string;
  sourceEntityId: string;
  targetEntityId: string;
  kind: RelationKind;
  label: string;
  direction: RelationDirection;
  strength: number;
  evidenceType?: RelationEvidenceType;
  sourceCitation?: string;
  historicalScope?: string;
  confidence?: RelationConfidence;
  notes: string;
  updatedAt: string;
};

type WorldAsset = {
  id: string;
  worldId: string;
  name: string;
  kind: AssetKind;
  storedName: string;
  originalName: string;
  mimeType: string;
  size: number;
  contentHash: string;
  tags: string[];
  notes: string;
  linkedEntityIds: string[];
  createdAt: string;
  updatedAt: string;
};

type WorldMember = {
  id: string;
  worldId: string;
  name: string;
  email: string;
  role: Role;
};

type WorkspaceData = {
  worlds: World[];
  entityTemplates: EntityTemplateDefinition[];
  codexCategories: CodexCategory[];
  entities: Entity[];
  maps: WorldMap[];
  mapLayers: MapLayer[];
  mapMarkerGroups: MapMarkerGroup[];
  mapMarkers: MapMarker[];
  mapRoutes: MapRoute[];
  timelineTracks: TimelineTrack[];
  timelineEvents: TimelineEvent[];
  quests: QuestLine[];
  storyVariables: StoryVariable[];
  storyScenes: StoryScene[];
  storyTestPresets: StoryTestPreset[];
  storyTestRuns: StoryTestRun[];
  storyReviewIssues: StoryReviewIssue[];
  narrativeMilestones: NarrativeMilestone[];
  manuscriptBooks: ManuscriptBook[];
  manuscriptVolumes: ManuscriptVolume[];
  manuscriptChapters: ManuscriptChapter[];
  manuscriptScenes: ManuscriptScene[];
  manuscriptClues: ManuscriptClue[];
  manuscriptKnowledgeStates: ManuscriptKnowledgeState[];
  consistencyFindings: ConsistencyFinding[];
  consistencyScans: ConsistencyScan[];
  consistencySettings: ConsistencySettings[];
  consistencyModelSettings: ConsistencyModelSettings[];
  aiMemoryItems: AiMemoryItem[];
  aiWritingSessions: AiWritingSession[];
  aiOperationRuns: AiOperationRun[];
  relations: EntityRelation[];
  assets: WorldAsset[];
  members: WorldMember[];
};

type MapWorkspaceSnapshot = Pick<
  WorkspaceData,
  "maps" | "mapLayers" | "mapMarkerGroups" | "mapMarkers" | "mapRoutes"
>;

type MapHistoryEntry = {
  after: MapWorkspaceSnapshot;
  before: MapWorkspaceSnapshot;
  label: string;
  mergeKey: string;
  timestamp: number;
  worldId: string;
};

const MAP_HISTORY_LIMIT = 100;
const MAP_HISTORY_MERGE_WINDOW = 900;

function captureMapWorkspaceSnapshot(data: WorkspaceData): MapWorkspaceSnapshot {
  return {
    maps: data.maps,
    mapLayers: data.mapLayers,
    mapMarkerGroups: data.mapMarkerGroups,
    mapMarkers: data.mapMarkers,
    mapRoutes: data.mapRoutes
  };
}

function applyMapWorkspaceSnapshot(
  data: WorkspaceData,
  snapshot: MapWorkspaceSnapshot
): WorkspaceData {
  return {
    ...data,
    ...snapshot
  };
}

function mapWorkspaceSnapshotChanged(
  before: MapWorkspaceSnapshot,
  after: MapWorkspaceSnapshot
) {
  return before.maps !== after.maps
    || before.mapLayers !== after.mapLayers
    || before.mapMarkerGroups !== after.mapMarkerGroups
    || before.mapMarkers !== after.mapMarkers
    || before.mapRoutes !== after.mapRoutes;
}

function changedObjectKeys(before: object, after: object, ignored: string[] = []) {
  const ignoredKeys = new Set(ignored);
  const beforeRecord = before as Record<string, unknown>;
  const afterRecord = after as Record<string, unknown>;
  return Object.keys(afterRecord).filter(
    (key) => !ignoredKeys.has(key) && beforeRecord[key] !== afterRecord[key]
  );
}

function describeMapRegionHistory(
  map: WorldMap | undefined,
  nextRegions: MapRegion[]
) {
  const previousRegions = map?.regions ?? [];
  if (nextRegions.length > previousRegions.length) {
    return { label: "新建地图区域", mergeKey: "" };
  }
  if (nextRegions.length < previousRegions.length) {
    return { label: "删除地图区域", mergeKey: "" };
  }
  const nextRegion = nextRegions.find(
    (region) => previousRegions.find((item) => item.id === region.id) !== region
  );
  const previousRegion = nextRegion
    ? previousRegions.find((region) => region.id === nextRegion.id)
    : undefined;
  if (!nextRegion || !previousRegion) {
    return { label: "编辑地图区域", mergeKey: "" };
  }
  const fields = changedObjectKeys(previousRegion, nextRegion, ["updatedAt"]);
  if (fields.includes("points")) {
    return { label: "编辑区域边界", mergeKey: "" };
  }
  if (fields.includes("order")) {
    return { label: "调整区域顺序", mergeKey: "" };
  }
  if (fields.includes("visible")) {
    return { label: nextRegion.visible ? "显示地图区域" : "隐藏地图区域", mergeKey: "" };
  }
  if (fields.includes("locked")) {
    return { label: nextRegion.locked ? "锁定区域边界" : "解锁区域边界", mergeKey: "" };
  }
  if (fields.includes("references")) {
    return { label: "编辑区域关联", mergeKey: "" };
  }
  const fieldKey = fields.join(",") || "details";
  return {
    label: fields.includes("title") ? "重命名地图区域" : "编辑地图区域",
    mergeKey: `map-region:${nextRegion.id}:${fieldKey}`
  };
}

function describeMapStoryPhaseHistory(
  map: WorldMap | undefined,
  nextPhases: MapStoryPhase[]
) {
  const previousPhases = map?.storyPhases ?? [];
  if (nextPhases.length > previousPhases.length) {
    return { label: "新建剧情阶段", mergeKey: "" };
  }
  if (nextPhases.length < previousPhases.length) {
    return { label: "删除剧情阶段", mergeKey: "" };
  }
  const nextPhase = nextPhases.find(
    (phase) => previousPhases.find((item) => item.id === phase.id) !== phase
  );
  const previousPhase = nextPhase
    ? previousPhases.find((phase) => phase.id === nextPhase.id)
    : undefined;
  if (!nextPhase || !previousPhase) {
    return { label: "编辑剧情阶段", mergeKey: "" };
  }
  const fields = changedObjectKeys(previousPhase, nextPhase, ["updatedAt"]);
  const visibilityFields = fields.filter((field) => field.startsWith("hidden"));
  if (visibilityFields.length) {
    return { label: "调整阶段内容", mergeKey: "" };
  }
  return {
    label: fields.includes("title") ? "重命名剧情阶段" : "编辑剧情阶段",
    mergeKey: `map-phase:${nextPhase.id}:${fields.join(",") || "details"}`
  };
}

function buildConsistencyWorkspaceInput(
  workspace: WorkspaceData,
  worldId: string
): ConsistencyWorkspaceInput {
  const maps = workspace.maps.filter((item) => item.worldId === worldId);
  const mapIds = new Set(maps.map((item) => item.id));
  return {
    worldId,
    worldName: workspace.worlds.find((item) => item.id === worldId)?.name || "未命名世界",
    entities: workspace.entities.filter((item) => item.worldId === worldId),
    quests: workspace.quests.filter((item) => item.worldId === worldId),
    storyVariables: workspace.storyVariables.filter((item) => item.worldId === worldId),
    storyScenes: workspace.storyScenes.filter((item) => item.worldId === worldId),
    storyTestRuns: workspace.storyTestRuns.filter((item) => item.worldId === worldId),
    maps,
    mapMarkers: workspace.mapMarkers.filter((item) => mapIds.has(item.mapId)),
    mapRoutes: workspace.mapRoutes.filter((item) => item.worldId === worldId),
    timelineTracks: workspace.timelineTracks.filter((item) => item.worldId === worldId),
    timelineEvents: workspace.timelineEvents.filter((item) => item.worldId === worldId),
    relations: workspace.relations.filter((item) => item.worldId === worldId),
    manuscript: {
      manuscriptBooks: workspace.manuscriptBooks.filter((item) => item.worldId === worldId),
      manuscriptVolumes: workspace.manuscriptVolumes.filter((item) => item.worldId === worldId),
      manuscriptChapters: workspace.manuscriptChapters.filter((item) => item.worldId === worldId),
      manuscriptScenes: workspace.manuscriptScenes.filter((item) => item.worldId === worldId),
      manuscriptClues: workspace.manuscriptClues.filter((item) => item.worldId === worldId),
      manuscriptKnowledgeStates: workspace.manuscriptKnowledgeStates.filter(
        (item) => item.worldId === worldId
      )
    }
  };
}

function attachProjectReference(
  workspace: WorkspaceData,
  source: ProjectObjectRef | null,
  target: ProjectObjectRef
): WorkspaceData {
  if (!source) return workspace;
  const updatedAt = new Date().toISOString();
  const withReference = <T extends {
    references: ProjectObjectRef[];
    entityId: string;
    questId: string;
    sceneId: string;
  }>(item: T): T => {
    const references = normalizeProjectObjectRefs([...item.references, target]);
    return {
      ...item,
      references,
      entityId: references.find((reference) => reference.kind === "entity")?.id ?? "",
      questId: references.find((reference) => reference.kind === "quest")?.id ?? "",
      sceneId: references.find((reference) => reference.kind === "scene")?.id ?? "",
      updatedAt
    };
  };

  if (source.kind === "map-marker") {
    return {
      ...workspace,
      mapMarkers: workspace.mapMarkers.map((marker) =>
        marker.id === source.id ? withReference(marker) : marker
      )
    };
  }
  if (source.kind === "timeline-event") {
    return {
      ...workspace,
      timelineEvents: workspace.timelineEvents.map((event) =>
        event.id === source.id ? withReference(event) : event
      )
    };
  }
  return workspace;
}

type WorkspaceCollection = keyof WorkspaceData;

type StoreInfo = {
  dbPath: string;
  backupDir: string;
  updatedAt: string | null;
  appVersion?: string;
  schemaVersion?: number;
  lastProjectPath?: string;
};

type StoreLoadResult = {
  data: WorkspaceData | null;
  updatedAt: string | null;
  dbPath: string;
  backupDir: string;
  version: number;
  appVersion?: string;
  schemaVersion?: number;
  warnings?: string[];
};

type StoreActionResult = {
  ok: boolean;
  canceled?: boolean;
  filePath?: string;
  dbPath?: string;
  backupDir?: string;
  updatedAt?: string;
  data?: WorkspaceData;
  restoredFrom?: string;
  safetyBackup?: string;
  inserted?: number;
  updated?: number;
  deleted?: number;
  unchanged?: number;
  reordered?: number;
  versionsAdded?: number;
  bytesWritten?: number;
  appVersion?: string;
  schemaVersion?: number;
  format?: "package" | "legacy-json";
  packageSummary?: ProjectPackageSummary;
  assetUpdates?: Array<{ id: string; contentHash: string; size: number }>;
  error?: string;
};

type ProjectPackageSummary = {
  complete: boolean;
  assetCount: number;
  embeddedAssetCount: number;
  missingAssetCount: number;
  untrackedAssetCount?: number;
  uniqueFileCount?: number;
  importedFileCount?: number;
  reusedFileCount?: number;
  packageBytes?: number;
  packageVersion: number;
  schemaVersion: number;
};

type EntityVersion = {
  id: number;
  reason: string;
  createdAt: string;
  entity: Entity;
};

type EntityVersionsResult = {
  ok: boolean;
  versions: EntityVersion[];
  error?: string;
};

type ObjectVersion = {
  id: number;
  collection: WorkspaceCollection;
  collectionLabel: string;
  rowKey: string;
  itemId: string;
  worldId: string;
  reason: string;
  createdAt: string;
  label: string;
  item: Record<string, unknown>;
};

type ObjectVersionsResult = {
  ok: boolean;
  versions: ObjectVersion[];
  error?: string;
};

type StorageDiagnostics = {
  ok: boolean;
  schemaVersion: number;
  storageFormat: string;
  quickCheck: string;
  foreignKeyIssues: number;
  invalidItems: string[];
  duplicates: Array<{ collection: WorkspaceCollection; item_id: string; count: number }>;
  itemCounts: Partial<Record<WorkspaceCollection, number>>;
  itemCount: number;
  versionCount: number;
  versionBytes: number;
  snapshotCount: number;
  snapshotBytes: number;
  versionRetention: number;
  snapshotRetention: number;
  maintenanceReclaimableVersions: number;
  maintenanceReclaimableSnapshots: number;
  maintenanceReclaimableBytes: number;
  ftsAvailable: boolean;
  searchCount: number;
  searchMapCount: number;
  lastMigration: null | {
    from: number;
    to: number;
    completedAt: string;
    backupPath: string;
  };
  migrationBackups: Array<{
    fileName: string;
    filePath: string;
    size: number;
    createdAt: string;
  }>;
  dbPath: string;
  dbSize: number;
  walSize: number;
};

type DiagnosticsResult = {
  ok: boolean;
  diagnostics: StorageDiagnostics;
  error?: string;
};

type WorkspaceSearchMatch = {
  collection: WorkspaceCollection;
  rowKey: string;
  itemId: string;
  worldId: string;
  searchKey: string;
  score: number;
};

type WorkspaceSearchResult = {
  ok: boolean;
  results: WorkspaceSearchMatch[];
  error?: string;
};

type ImportFileResult = {
  ok: boolean;
  canceled?: boolean;
  filePath?: string;
  fileName?: string;
  format?: "json" | "markdown";
  content?: string;
  error?: string;
};

type ImportedAsset = Omit<
  WorldAsset,
  "worldId" | "tags" | "notes" | "linkedEntityIds" | "updatedAt"
>;

type AssetStoreResult = {
  ok: boolean;
  canceled?: boolean;
  missing?: boolean;
  assets?: ImportedAsset[];
  asset?: Pick<
    WorldAsset,
    "storedName" | "originalName" | "mimeType" | "size" | "contentHash"
  >;
  assetsDir?: string;
  filePath?: string;
  reusedFileCount?: number;
  hashMatchedExpected?: boolean;
  error?: string;
};

type BackupSummary = {
  fileName: string;
  filePath: string;
  size: number;
  createdAt: string;
  reason: string;
  kind?: "data" | "complete";
  complete?: boolean;
  missingAssetCount?: number;
  valid: boolean;
  counts: {
    worlds: number;
    entityTemplates: number;
    codexCategories: number;
    entities: number;
    quests: number;
    storyScenes: number;
    storyTestRuns: number;
    storyReviewIssues: number;
    narrativeMilestones: number;
    assets: number;
    maps: number;
    mapLayers: number;
    mapMarkerGroups: number;
    mapMarkers: number;
    mapRoutes: number;
    timelineTracks: number;
    timelineEvents: number;
    consistencyFindings: number;
    consistencyScans: number;
  };
};

type BackupStorageSummary = {
  totalBytes: number;
  dataBytes: number;
  completeBytes: number;
  dataCount: number;
  completeCount: number;
  reclaimableBytes: number;
  reclaimableCount: number;
  policy: {
    dataLimit: number;
    completeLimit: number;
    maxTotalBytes: number;
  };
};

type BackupListResult = {
  ok: boolean;
  backups: BackupSummary[];
  backupDir?: string;
  storage?: BackupStorageSummary;
  removedCount?: number;
  removedBytes?: number;
  error?: string;
};

type StorageMaintenanceResult = {
  ok: boolean;
  reclaimedBytes?: number;
  versionsRemoved?: number;
  snapshotsRemoved?: number;
  versionLimit?: number;
  snapshotLimit?: number;
  safetyBackup?: string;
  diagnostics?: StorageDiagnostics;
  error?: string;
};

type AssetFileCheck = {
  storedName: string;
  exists: boolean;
  size?: number;
  modifiedAt?: string;
  contentHash?: string;
  hashMatches?: boolean;
  sizeMatches?: boolean;
};

type AssetCheckResult = {
  ok: boolean;
  files: AssetFileCheck[];
  assetsDir?: string;
  error?: string;
};

type ConsistencyModelResult = {
  ok: boolean;
  text?: string;
  model?: string;
  error?: string;
  cancelled?: boolean;
};

type AiCredentialStatus = {
  ok: boolean;
  configured: boolean;
  encryptionAvailable: boolean;
  error?: string;
};

type AiCompletionRequest = {
  systemPrompt: string;
  prompt: string;
  maxTokens: number;
};

type DiagnosticExportResult = {
  ok: boolean;
  canceled?: boolean;
  filePath?: string;
  bytes?: number;
  error?: string;
};

type HealthTarget = {
  tab: Extract<
    WorkspaceTab,
    "codex" | "quests" | "story" | "templates" | "production" | "testing" | "relations" | "assets" | "map" | "timeline" | "consistency"
  >;
  itemId?: string;
  planningTargetType?: "map" | "marker" | "route" | "track" | "timeline";
  storyMode?: StoryWorkspaceMode;
  storyTestMode?: StoryTestWorkspaceMode;
};

type HealthIssue = {
  id: string;
  severity: "error" | "warning";
  title: string;
  detail: string;
  target?: HealthTarget;
  referenceLocation?: {
    source: ProjectObjectRef;
    anchor: ProjectReferenceAnchor;
    worldId: string;
  };
};

type CodexHistoryEntry = {
  worldId: string;
  entityId: string;
  openedAt: string;
};

type SavePhase = "idle" | "saving" | "saved" | "error";

declare global {
  interface Window {
    worldcraftStore?: {
      loadWorkspace: () => Promise<StoreLoadResult>;
      saveWorkspace: (data: WorkspaceData, reason?: string) => Promise<StoreActionResult>;
      createBackup: (data: WorkspaceData, reason?: string) => Promise<StoreActionResult>;
      createCompleteBackup: (data: WorkspaceData) => Promise<StoreActionResult>;
      listBackups: () => Promise<BackupListResult>;
      cleanupBackups: () => Promise<BackupListResult>;
      restoreBackup: (fileName: string) => Promise<StoreActionResult>;
      revealBackups: () => Promise<StoreActionResult>;
      saveProjectAs: (data: WorkspaceData) => Promise<StoreActionResult>;
      openProject: () => Promise<StoreActionResult>;
      importFile: () => Promise<ImportFileResult>;
      listEntityVersions: (entityId: string) => Promise<EntityVersionsResult>;
      listObjectVersions: (
        collection: WorkspaceCollection,
        itemId: string
      ) => Promise<ObjectVersionsResult>;
      listRecentObjectVersions: (
        worldId: string,
        limit?: number
      ) => Promise<ObjectVersionsResult>;
      getDiagnostics: () => Promise<DiagnosticsResult>;
      rebuildSearchIndex: () => Promise<{
        ok: boolean;
        indexed: number;
        error?: string;
      }>;
      maintainStorage: () => Promise<StorageMaintenanceResult>;
      restoreMigrationBackup: (fileName: string) => Promise<StoreActionResult>;
      searchWorkspace: (
        query: string,
        worldId: string,
        limit?: number
      ) => Promise<WorkspaceSearchResult>;
      importAssets: () => Promise<AssetStoreResult>;
      storeMapImage: (input: {
        bytes: ArrayBuffer;
        mimeType: string;
        name: string;
        originalName?: string;
      }) => Promise<AssetStoreResult>;
      exportMapImage: (input: {
        bytes: ArrayBuffer;
        mimeType: "image/png" | "image/webp";
        suggestedName: string;
      }) => Promise<DiagnosticExportResult>;
      exportManuscriptPublication: (
        input: ManuscriptPublicationRequest
      ) => Promise<ManuscriptPublicationExportResult>;
      exportOfflineWiki: (input: {
        publication: OfflineWikiPublication;
      }) => Promise<OfflineWikiExportResult>;
      checkAssets: (
        assets: Array<string | Pick<WorldAsset, "storedName" | "contentHash" | "size">>
      ) => Promise<AssetCheckResult>;
      relinkAsset: (input: {
        storedName: string;
        originalName: string;
        contentHash: string;
        missing: boolean;
      }) => Promise<AssetStoreResult>;
      revealAsset: (storedName: string) => Promise<AssetStoreResult>;
      revealAssetsFolder: () => Promise<AssetStoreResult>;
      trashAsset: (storedName: string) => Promise<AssetStoreResult>;
      explainConsistencyFinding: (
        settings: ConsistencyModelSettings,
        prompt: string
      ) => Promise<ConsistencyModelResult>;
      getAiCredentialStatus: () => Promise<AiCredentialStatus>;
      saveAiCredential: (apiKey: string) => Promise<AiCredentialStatus>;
      clearAiCredential: () => Promise<AiCredentialStatus>;
      testAiConnection: (
        settings: ConsistencyModelSettings
      ) => Promise<ConsistencyModelResult>;
      completeWithAi: (
        settings: ConsistencyModelSettings,
        request: AiCompletionRequest
      ) => Promise<ConsistencyModelResult>;
      completeWithAiStream: (
        settings: ConsistencyModelSettings,
        request: AiCompletionRequest,
        requestId: string,
        onDelta: (delta: string) => void
      ) => Promise<ConsistencyModelResult>;
      cancelAiCompletion: (
        requestId: string
      ) => Promise<{ ok: boolean; error?: string }>;
      exportDiagnostics: () => Promise<DiagnosticExportResult>;
      reportRendererError: (details: {
        category: string;
        errorName?: string;
      }) => Promise<{ ok: boolean }>;
    };
  }
}

const storageKey = "worldcraft-codex-mvp-v1";
const recoveryStorageKey = "worldcraft-codex-recovery-v1";
const appThemeStorageKey = "worldcraft-codex-app-theme-v1";
const now = "2026-07-10T09:00:00.000Z";

const entityTypeMeta: Record<
  EntityType,
  { label: string; icon: LucideIcon; accent: string; defaultSummary: string }
> = {
  character: {
    label: "人物",
    icon: UsersRound,
    accent: "emerald",
    defaultSummary: "一个正在被塑造的人物条目。"
  },
  location: {
    label: "地点",
    icon: MapPin,
    accent: "teal",
    defaultSummary: "一个承载事件、势力和传说的地点。"
  },
  faction: {
    label: "组织",
    icon: Flag,
    accent: "coral",
    defaultSummary: "一个拥有目标、成员和资源的组织。"
  },
  event: {
    label: "事件",
    icon: CalendarDays,
    accent: "amber",
    defaultSummary: "一段会影响世界走向的重要事件。"
  },
  item: {
    label: "物品",
    icon: Boxes,
    accent: "violet",
    defaultSummary: "一件具有来源、能力或象征意义的物品。"
  },
  note: {
    label: "笔记",
    icon: FileText,
    accent: "gray",
    defaultSummary: "一条自由设定笔记。"
  }
};

const visibilityMeta: Record<Visibility, { label: string; icon: LucideIcon; helper: string }> = {
  private: {
    label: "私密",
    icon: LockKeyhole,
    helper: "作者与编辑"
  },
  shared: {
    label: "成员可见",
    icon: UsersRound,
    helper: "世界成员"
  },
  public: {
    label: "公开",
    icon: Eye,
    helper: "任何读者"
  },
  secret: {
    label: "秘密",
    icon: EyeOff,
    helper: "GM/作者"
  }
};

const roleLabels: Record<Role, string> = {
  owner: "所有者",
  editor: "编辑",
  viewer: "读者",
  player: "玩家"
};

const questStatusMeta: Record<QuestStatus, { label: string; helper: string }> = {
  draft: {
    label: "草稿",
    helper: "还在构思"
  },
  active: {
    label: "制作中",
    helper: "进入开发"
  },
  implemented: {
    label: "已落地",
    helper: "可交给游戏"
  },
  cut: {
    label: "暂缓",
    helper: "先不制作"
  }
};

const questCategoryMeta: Record<QuestCategory, { label: string; helper: string }> = {
  main: {
    label: "主线任务",
    helper: "推动核心剧情"
  },
  side: {
    label: "支线任务",
    helper: "补充世界与选择"
  },
  character: {
    label: "角色任务",
    helper: "围绕角色成长"
  }
};

const relationKindMeta: Record<
  RelationKind,
  { label: string; helper: string; defaultDirection: RelationDirection }
> = {
  ally: { label: "盟友 / 合作", helper: "互相支持或共同目标", defaultDirection: "undirected" },
  rival: { label: "敌对 / 竞争", helper: "冲突、追查或竞争", defaultDirection: "undirected" },
  family: { label: "亲属 / 亲密", helper: "家庭、伴侣或亲密关系", defaultDirection: "undirected" },
  member: { label: "隶属 / 成员", helper: "角色属于某个组织", defaultDirection: "directed" },
  leads: { label: "领导", helper: "角色领导组织或团队", defaultDirection: "directed" },
  controls: { label: "控制 / 影响", helper: "一方控制或影响另一方", defaultDirection: "directed" },
  located: { label: "位于 / 出生于", helper: "条目与地点的空间关系", defaultDirection: "directed" },
  route: { label: "道路 / 相连", helper: "地点之间存在路线", defaultDirection: "undirected" },
  teacher: { label: "师承 / 授业", helper: "有文献层次的老师、弟子或传法关系", defaultDirection: "directed" },
  source: { label: "原典 / 出处", helper: "条目所据的古籍、史志、碑刻或其他资料", defaultDirection: "directed" },
  creator: { label: "创制 / 建立", helper: "人物创制器物、制度或建立组织的记载", defaultDirection: "directed" },
  companion: { label: "同伴 / 胁侍", helper: "同组出现、共同活动或图像中的稳定组合", defaultDirection: "mutual" },
  protector: { label: "护法 / 守护", helper: "对人物、地点、群体或传统承担守护职能", defaultDirection: "directed" },
  evolution: { label: "演变 / 合流", helper: "身份、图像或职能在后世发生变化", defaultDirection: "directed" },
  disputed: { label: "争议 / 异说", helper: "文献、谱系或解释之间存在冲突", defaultDirection: "undirected" },
  incarnation: { label: "化身 / 应化", helper: "特定文本或信仰传统主张的化身关系", defaultDirection: "directed" },
  subordinate: { label: "属官 / 下位", helper: "限定神谱、制度或组织中的从属关系", defaultDirection: "directed" },
  devotion: { label: "信奉 / 归依", helper: "人物或群体对神圣对象的信奉关系", defaultDirection: "directed" },
  influence: { label: "影响 / 承接", helper: "思想、文本、技艺或传统的可证影响", defaultDirection: "directed" },
  leader: { label: "主持 / 领袖", helper: "人物主持组织、仪式或群体活动", defaultDirection: "directed" },
  collaborator: { label: "协作 / 共事", helper: "可考的共同工作、译场或制度协作", defaultDirection: "mutual" },
  worship: { label: "祭祀 / 奉祀", helper: "庙宇、制度或群体对神圣对象的祭祀", defaultDirection: "directed" },
  peer: { label: "同列 / 并列", helper: "同一名单、祀位或制度中的并列关系", defaultDirection: "undirected" },
  ritual: { label: "仪式 / 科仪", helper: "条目参与或规定的礼仪、科仪与祭法", defaultDirection: "directed" },
  contains: { label: "包含 / 收录", helper: "文本、地点或制度包含另一条目的关系", defaultDirection: "directed" },
  custom: { label: "自定义", helper: "使用自己的关系标签", defaultDirection: "directed" }
};

const relationEvidenceTypeMeta: Record<RelationEvidenceType, string> = {
  unspecified: "未填写",
  "primary-text": "古籍原文",
  "historical-record": "史籍记录",
  "ritual-record": "礼制 / 科仪记录",
  "material-evidence": "实物 / 图像证据",
  "scholarly-inference": "考据推断",
  "textual-variant": "传本异文",
  "oral-tradition": "口述 / 地方传统",
  creative: "项目原创改编"
};

const relationConfidenceMeta: Record<RelationConfidence, string> = {
  unspecified: "未判断",
  certain: "明确",
  probable: "较可信",
  disputed: "存在争议",
  creative: "原创设定"
};

const assetKindMeta: Record<AssetKind, { label: string; icon: LucideIcon; helper: string }> = {
  image: { label: "图片", icon: ImageIcon, helper: "截图、照片和通用图片" },
  map: { label: "地图", icon: Map, helper: "世界地图、区域图和关卡图" },
  video: { label: "视频", icon: Video, helper: "过场、表演参考和分镜预演素材" },
  audio: { label: "音乐", icon: Music, helper: "配乐、环境音和语音参考" },
  concept: { label: "设定图", icon: Palette, helper: "角色、场景和物品概念图" },
  document: { label: "资料", icon: FileText, helper: "PDF、文本和其他参考文件" }
};

const storySceneStatusLabels: Record<StoryScene["status"], string> = {
  draft: "草稿",
  review: "待审",
  ready: "已确认"
};

const storyVariableTypeLabels: Record<StoryVariable["type"], string> = {
  boolean: "开关",
  number: "数值",
  text: "文本"
};

const initialData: WorkspaceData = {
  worlds: [
    {
      id: "world-canglan",
      ownerId: "user-owner",
      name: "苍岚纪",
      description: "围绕北境、王都与黑塔议会展开的奇幻世界设定库。",
      visibility: "shared",
      createdAt: now,
      updatedAt: now
    }
  ],
  entityTemplates: createDefaultEntityTemplates("world-canglan", now),
  codexCategories: createDefaultCodexCategories("world-canglan", now),
  entities: [
    {
      id: "entity-ailin",
      worldId: "world-canglan",
      type: "character",
      title: "艾琳",
      slug: "ailin",
      summary: "边境城雾鸦堡的女骑士，正在寻找失踪的哥哥。",
      content:
        "艾琳出生于 [[边境城雾鸦堡]]，曾在 [[北境战争]] 中救下 [[星银剑]] 的旧持有者。她怀疑 [[黑塔议会]] 与哥哥失踪有关，并准备前往 [[王都阿斯兰]] 查找档案。",
      tags: ["主角", "北境", "骑士"],
      visibility: "shared",
      createdBy: "user-owner",
      updatedAt: now,
      categoryId: "category:world-canglan:character",
      order: 0,
      templateData: {
        aliases: "银盔骑士",
        alignment: "守序善良",
        faction: "北境守卫",
        birthplace: "entity-fogkeep",
        goals: "找到失踪的哥哥，查明黑塔议会在北境战争后的行动。",
        secrets: "她的哥哥可能仍然活着，并成为黑塔议会的实验对象。",
        relationships: "与雾鸦堡守备长互相信任，对王都贵族保持戒心。"
      }
    },
    {
      id: "entity-fogkeep",
      worldId: "world-canglan",
      type: "location",
      title: "边境城雾鸦堡",
      slug: "fogkeep",
      summary: "北境山口的军事城市，常年被冷雾和乌鸦群包围。",
      content:
        "[[边境城雾鸦堡]] 是 [[艾琳]] 的出生地，也是 [[北境战争]] 的第一处战场。城墙下埋着旧时代的符文阵，黑夜里偶尔会传出钟声。",
      tags: ["北境", "城市", "军事"],
      visibility: "shared",
      createdBy: "user-owner",
      updatedAt: now,
      categoryId: "category:world-canglan:location",
      order: 0,
      templateData: {
        category: "边境要塞城市",
        region: "北境山口",
        residents: "守备军、矿工、商队、流亡者",
        history: "最初是王国抵御雪原部族的堡垒，后来发展成北境贸易节点。",
        dangers: "地下旧符文阵不稳定，黑塔议会曾在此搜集遗物。",
        relatedEvents: "entity-northwar"
      }
    },
    {
      id: "entity-aslan",
      worldId: "world-canglan",
      type: "location",
      title: "王都阿斯兰",
      slug: "aslan",
      summary: "王国的政治与档案中心，城内保存着大量战争记录。",
      content:
        "[[王都阿斯兰]] 的白石档案馆记录了 [[北境战争]] 的官方版本，但关于 [[黑塔议会]] 的部分被人为删改。",
      tags: ["王都", "档案", "政治"],
      visibility: "public",
      createdBy: "user-owner",
      updatedAt: now,
      categoryId: "category:world-canglan:location",
      order: 1,
      templateData: {
        category: "首都",
        region: "中部王领",
        residents: "王室、议会、商会、学院",
        history: "由七座古塔围绕王宫扩建而成。",
        dangers: "贵族派系斗争激烈，档案馆受到多方监控。",
        relatedEvents: "entity-northwar"
      }
    },
    {
      id: "entity-blacktower",
      worldId: "world-canglan",
      type: "faction",
      title: "黑塔议会",
      slug: "blacktower-council",
      summary: "掌握禁忌星象术的秘密组织，可能在战争期间进行人体实验。",
      content:
        "[[黑塔议会]] 表面上为王室研究星象灾害，实际上在 [[北境战争]] 期间收集战场遗物，并追踪 [[星银剑]] 的下落。",
      tags: ["秘密组织", "反派", "星象术"],
      visibility: "secret",
      createdBy: "user-owner",
      updatedAt: now,
      categoryId: "category:world-canglan:faction",
      order: 0,
      templateData: {
        category: "秘密议会",
        leader: "七席未公开",
        members: "星象术士、档案管理员、贵族资助者",
        goals: "复原星坠时代的术式，控制王国的继承危机。",
        enemies: "北境守卫、白石档案馆部分学者",
        resources: "禁书、实验室、贵族资金、密探网络"
      }
    },
    {
      id: "entity-northwar",
      worldId: "world-canglan",
      type: "event",
      title: "北境战争",
      slug: "northern-war",
      summary: "第三纪元 120 年爆发的边境战争，改变了北境与王都的权力关系。",
      content:
        "[[北境战争]] 爆发于第三纪元 120 年春，第一战发生在 [[边境城雾鸦堡]]。战争结束后，[[黑塔议会]] 获得了大量战场遗物，[[艾琳]] 的哥哥在撤离途中失踪。",
      tags: ["战争", "主线", "历史"],
      visibility: "public",
      createdBy: "user-owner",
      updatedAt: now,
      categoryId: "category:world-canglan:event",
      order: 0,
      templateData: {
        time: "第三纪元 120 年 春",
        place: "entity-fogkeep",
        participants: "北境守卫、雪原部族、王都援军",
        cause: "雪原部族越过山口，王都内部派系借机争夺军权。",
        result: "北境自治权扩大，黑塔议会获得战场研究许可。"
      }
    },
    {
      id: "entity-silversword",
      worldId: "world-canglan",
      type: "item",
      title: "星银剑",
      slug: "star-silver-sword",
      summary: "由星坠金属锻造的古剑，会在谎言附近发出低鸣。",
      content:
        "[[星银剑]] 曾在 [[北境战争]] 中出现，旧持有者被 [[艾琳]] 救下后失踪。[[黑塔议会]] 相信它能开启星坠时代的封印。",
      tags: ["遗物", "武器", "谜团"],
      visibility: "shared",
      createdBy: "user-owner",
      updatedAt: now,
      categoryId: "category:world-canglan:item",
      order: 0,
      templateData: {
        category: "古代武器",
        holder: "旧持有者失踪",
        origin: "星坠时代遗物",
        abilities: "靠近谎言、幻术或伪装时会发出低鸣。",
        limits: "过度使用会让持剑者梦见星坠时代的灾难。"
      }
    }
  ],
  maps: [
    {
      id: "map-canglan",
      worldId: "world-canglan",
      parentMapId: "",
      entryMarkerId: "",
      title: "苍岚全境图",
      description: "北境、王都与南海之间的主要叙事区域。",
      imageUrl: "",
      imageTransform: createMapImageTransform(),
      width: 1600,
      height: 1000,
      distanceWidth: 960,
      distanceUnit: "km",
      customDistanceUnit: "距离单位",
      grid: {
        visible: true,
        snap: false,
        labels: true,
        columns: 12,
        color: "#596660",
        opacity: 0.22
      },
      regions: [
        {
          id: "map-region-northern-border",
          title: "北境边区",
          description: "雾鸦堡与旧战场所在的寒冷边区，主线调查从这里展开。",
          kind: "territory",
          color: "#3f7d4d",
          opacity: 0.2,
          order: 1,
          visible: true,
          locked: false,
          points: [
            { x: 10, y: 15 },
            { x: 43, y: 14 },
            { x: 48, y: 48 },
            { x: 18, y: 55 }
          ],
          holes: [],
          labelPlacement: { offsetX: 0, offsetY: 0, locked: false, minZoom: 0.1 },
          references: [
            { kind: "entity", id: "entity-fogkeep" },
            { kind: "entity", id: "entity-northwar" }
          ],
          createdAt: now,
          updatedAt: now
        }
      ],
      storyPhases: [],
      viewBookmarks: [],
      savedFilters: [],
      createdAt: now,
      updatedAt: now
    }
  ],
  mapLayers: [
    {
      id: "map-layer-default:map-canglan",
      worldId: "world-canglan",
      mapId: "map-canglan",
      title: "主要标记",
      description: "地图上的默认叙事标记层。",
      color: "#0f766e",
      order: 0,
      visible: true,
      locked: false,
      imageUrl: "",
      imageTransform: createMapImageTransform(),
      imageOpacity: 1,
      imageBlendMode: "normal",
      imageGroupId: "",
      createdAt: now,
      updatedAt: now
    }
  ],
  mapMarkerGroups: [],
  mapMarkers: [
    {
      id: "marker-fogkeep",
      mapId: "map-canglan",
      layerId: "map-layer-default:map-canglan",
      groupId: "",
      entityId: "entity-fogkeep",
      questId: "quest-vanished-brother",
      sceneId: "scene-fogkeep-archive",
      references: [
        { kind: "entity", id: "entity-fogkeep" },
        { kind: "quest", id: "quest-vanished-brother" },
        { kind: "scene", id: "scene-fogkeep-archive" }
      ],
      x: 24,
      y: 34,
      label: "雾鸦堡",
      markerType: "location",
      color: "#0f766e",
      iconUrl: "",
      labelPlacement: { offsetX: 0, offsetY: 0, locked: false, minZoom: 0.1 },
      description: "序章与档案调查的起点。",
      updatedAt: now
    },
    {
      id: "marker-aslan",
      mapId: "map-canglan",
      layerId: "map-layer-default:map-canglan",
      groupId: "",
      entityId: "entity-aslan",
      questId: "quest-vanished-brother",
      sceneId: "",
      references: [
        { kind: "entity", id: "entity-aslan" },
        { kind: "quest", id: "quest-vanished-brother" }
      ],
      x: 61,
      y: 58,
      label: "王都",
      markerType: "location",
      color: "#2563a8",
      iconUrl: "",
      labelPlacement: { offsetX: 0, offsetY: 0, locked: false, minZoom: 0.1 },
      description: "主线中期进入档案馆的目标地点。",
      updatedAt: now
    },
    {
      id: "marker-northwar",
      mapId: "map-canglan",
      layerId: "map-layer-default:map-canglan",
      groupId: "",
      entityId: "entity-northwar",
      questId: "",
      sceneId: "",
      references: [{ kind: "entity", id: "entity-northwar" }],
      x: 31,
      y: 41,
      label: "北境战争",
      markerType: "event",
      color: "#c45d4c",
      iconUrl: "",
      labelPlacement: { offsetX: 0, offsetY: 0, locked: false, minZoom: 0.1 },
      description: "改变北境权力格局的历史战场。",
      updatedAt: now
    }
  ],
  mapRoutes: [
    {
      id: "map-route-northern-investigation",
      worldId: "world-canglan",
      mapId: "map-canglan",
      title: "北境调查路线",
      description: "从雾鸦堡的旧档案出发，经北境战场前往王都档案馆。",
      color: "#7458aa",
      status: "active",
      travelMode: "ride",
      travelSpeed: 12,
      travelHoursPerDay: 8,
      curveMode: "straight",
      waypoints: [],
      references: [],
      stops: [
        {
          id: "route-stop-fogkeep",
          markerId: "marker-fogkeep",
          title: "调查起点",
          notes: "取得旧档案与通行文书。",
          duration: "序章"
        },
        {
          id: "route-stop-northwar",
          markerId: "marker-northwar",
          title: "战场线索",
          notes: "确认官方记录与遗物证词不一致。",
          duration: "第一幕"
        },
        {
          id: "route-stop-aslan",
          markerId: "marker-aslan",
          title: "王都档案馆",
          notes: "进入中期主线并解锁黑塔议会线索。",
          duration: "第二幕"
        }
      ],
      updatedAt: now
    }
  ],
  timelineTracks: [
    {
      id: "timeline-track-main:world-canglan",
      worldId: "world-canglan",
      name: "世界历史",
      description: "影响整个世界格局的历史事件。",
      color: "#0f766e",
      order: 0,
      updatedAt: now
    },
    {
      id: "timeline-track-quest-canglan",
      worldId: "world-canglan",
      name: "主线任务",
      description: "玩家主线推进与剧情场景发生顺序。",
      color: "#7458aa",
      order: 1,
      updatedAt: now
    }
  ],
  timelineEvents: [
    {
      id: "timeline-northwar",
      worldId: "world-canglan",
      entityId: "entity-northwar",
      questId: "",
      sceneId: "",
      references: [{ kind: "entity", id: "entity-northwar" }],
      trackId: "timeline-track-main:world-canglan",
      title: "北境战争爆发",
      summary: "战争改变北境自治权，也让黑塔议会获得战场研究许可。",
      displayDate: "第三纪元 120 年 春",
      datePrecision: "range",
      sortOrder: 3012001,
      startValue: "3012001",
      endValue: "3012008",
      era: "第三纪元",
      dependencyIds: [],
      updatedAt: now
    }
  ],
  quests: [
    {
      id: "quest-vanished-brother",
      worldId: "world-canglan",
      title: "失踪哥哥的线索",
      category: "main",
      status: "active",
      summary:
        "艾琳从雾鸦堡出发，追查哥哥失踪与黑塔议会之间的关系，最终进入王都档案馆。",
      trigger: "玩家在 [[边境城雾鸦堡]] 完成序章后，与守备长交谈触发。",
      relatedEntityIds: [
        "entity-ailin",
        "entity-fogkeep",
        "entity-aslan",
        "entity-blacktower"
      ],
      prerequisiteQuestIds: [],
      steps: [
        {
          id: "step-fogkeep-archive",
          title: "检查雾鸦堡旧档案",
          objective: "在 [[边境城雾鸦堡]] 的守备档案中找到哥哥最后一次出勤记录。",
          condition: "玩家完成序章战斗，并获得守备长信任。",
          branch: "如果玩家先调查战场遗物，会提前发现 [[星银剑]] 的低鸣。",
          failure: "如果玩家烧毁档案，任务转入黑市线索，王都档案馆入口延后开放。",
          reward: "获得档案残页、北境声望 +1。",
          notes: "这里要让玩家第一次意识到官方记录被删改。"
        },
        {
          id: "step-aslan-records",
          title: "前往王都档案馆",
          objective: "在 [[王都阿斯兰]] 查找 [[北境战争]] 的封存卷宗。",
          condition: "需要雾鸦堡通行文书，或通过黑市买到伪造许可。",
          branch: "选择合法路线会得到编辑 NPC 帮助；选择黑市路线会被黑塔密探盯上。",
          failure: "如果潜入失败，玩家会失去部分档案权限，但获得密探追踪线。",
          reward: "解锁黑塔议会线索、王都地图标记。",
          notes: "这一步是进入中期主线的入口。"
        }
      ],
      developerNotes:
        "玩家不可见：艾琳的哥哥没有死亡，他被黑塔议会转移到地下观星室。",
      updatedAt: now
    }
  ],
  storyVariables: [
    {
      id: "variable-ailin-trust",
      worldId: "world-canglan",
      key: "character.ailin_trust",
      name: "艾琳信任度",
      type: "number",
      defaultValue: 0,
      description: "玩家通过守序、坦诚或帮助北境居民提高的信任数值。",
      updatedAt: now
    },
    {
      id: "variable-blacktower-known",
      worldId: "world-canglan",
      key: "lore.blacktower_known",
      name: "已发现黑塔议会",
      type: "boolean",
      defaultValue: false,
      description: "玩家是否已经确认黑塔议会参与了哥哥失踪事件。",
      updatedAt: now
    },
    {
      id: "variable-archive-route",
      worldId: "world-canglan",
      key: "quest.archive_route",
      name: "档案调查路线",
      type: "text",
      defaultValue: "未选择",
      description: "记录玩家选择官方许可还是黑市渠道进入王都档案馆。",
      updatedAt: now
    }
  ],
  storyScenes: [
    {
      id: "scene-fogkeep-archive",
      worldId: "world-canglan",
      title: "雾鸦堡档案室的抉择",
      summary: "艾琳向玩家说明两条调查哥哥失踪记录的路线。",
      status: "review",
      entryNodeId: "dialogue-archive-opening",
      relatedEntityIds: ["entity-ailin", "entity-fogkeep", "entity-blacktower"],
      relatedQuestIds: ["quest-vanished-brother"],
      nodes: [
        {
          id: "dialogue-archive-opening",
          label: "艾琳提出计划",
          speakerEntityId: "entity-ailin",
          text: "守备档案被人动过。我们可以申请正式许可，也可以去旧城区找一个认识档案管理员的掮客。",
          stageDirection: "艾琳把两张不同颜色的通行证放在桌上。",
          mediaAssetId: "",
          durationSeconds: 8,
          shotFraming: "medium",
          cameraDirection: "从桌上的两张通行证缓慢抬向艾琳。",
          transition: "cut",
          conditions: [],
          effects: [],
          nextNodeId: "",
          choices: [
            {
              id: "choice-official-route",
              text: "走正式程序，我来争取守备长的许可。",
              targetNodeId: "dialogue-official-route",
              conditions: [],
              effects: [
                {
                  id: "effect-trust-plus",
                  variableId: "variable-ailin-trust",
                  operation: "increment",
                  value: 1
                },
                {
                  id: "effect-route-official",
                  variableId: "variable-archive-route",
                  operation: "set",
                  value: "官方许可"
                }
              ]
            },
            {
              id: "choice-blackmarket-route",
              text: "时间紧迫，我们去找旧城区的掮客。",
              targetNodeId: "dialogue-blackmarket-route",
              conditions: [],
              effects: [
                {
                  id: "effect-route-blackmarket",
                  variableId: "variable-archive-route",
                  operation: "set",
                  value: "黑市渠道"
                },
                {
                  id: "effect-blacktower-known",
                  variableId: "variable-blacktower-known",
                  operation: "set",
                  value: true
                }
              ]
            }
          ],
          isEnding: false
        },
        {
          id: "dialogue-official-route",
          label: "正式许可路线",
          speakerEntityId: "entity-ailin",
          text: "好。守备长欠我一次解释，只要我们拿到盖印文书，王都也不能轻易把门关上。",
          stageDirection: "艾琳收起旧城区的灰色通行证。",
          mediaAssetId: "",
          durationSeconds: 6,
          shotFraming: "close",
          cameraDirection: "跟随艾琳收起通行证的手，再切到她的表情。",
          transition: "cut",
          conditions: [],
          effects: [],
          nextNodeId: "",
          choices: [],
          isEnding: true
        },
        {
          id: "dialogue-blackmarket-route",
          label: "黑市渠道路线",
          speakerEntityId: "entity-ailin",
          text: "这条路更快，也更容易惊动删改档案的人。准备好被跟踪。",
          stageDirection: "远处传来乌鸦拍打窗框的声音。",
          mediaAssetId: "",
          durationSeconds: 6,
          shotFraming: "wide",
          cameraDirection: "镜头移向窗外，再回到昏暗的档案室。",
          transition: "dissolve",
          conditions: [],
          effects: [],
          nextNodeId: "",
          choices: [],
          isEnding: true
        }
      ],
      notes: "正式路线提高艾琳信任；黑市路线提前揭示黑塔议会。",
      updatedAt: now
    }
  ],
  storyTestPresets: [
    {
      id: "test-preset-fogkeep-default",
      worldId: "world-canglan",
      name: "雾鸦堡默认状态",
      description: "从默认世界状态检查正式许可与黑市渠道两条路线。",
      sceneId: "scene-fogkeep-archive",
      initialState: {
        "variable-ailin-trust": 0,
        "variable-blacktower-known": false,
        "variable-archive-route": "未选择"
      },
      maxDepth: 24,
      maxPaths: 120,
      updatedAt: now
    }
  ],
  storyTestRuns: [],
  storyReviewIssues: [],
  narrativeMilestones: [
    {
      id: "milestone-fogkeep-opening",
      worldId: "world-canglan",
      title: "雾鸦堡档案调查",
      summary: "完成序章调查，并让玩家选择正式许可或黑市渠道。",
      act: "序章",
      status: "ready",
      priority: "critical",
      order: 0,
      targetDate: "",
      blockedReason: "",
      developerNotes: "确认两条路线都能进入王都阶段。",
      manuscriptBody: "",
      dependencyIds: [],
      linkedQuestIds: ["quest-vanished-brother"],
      linkedSceneIds: ["scene-fogkeep-archive"],
      linkedEntityIds: ["entity-ailin", "entity-fogkeep"],
      linkedTimelineEventIds: [],
      linkedMapMarkerIds: ["marker-fogkeep"],
      linkedReviewIssueIds: [],
      createdAt: now,
      updatedAt: now
    },
    {
      id: "milestone-northwar-truth",
      worldId: "world-canglan",
      title: "北境战争真相浮现",
      summary: "把战场遗物、官方记录与黑塔议会的行动串成同一条证据链。",
      act: "第一幕",
      status: "drafting",
      priority: "high",
      order: 1,
      targetDate: "",
      blockedReason: "",
      developerNotes: "需要补充战场调查场景。",
      manuscriptBody: "",
      dependencyIds: ["milestone-fogkeep-opening"],
      linkedQuestIds: ["quest-vanished-brother"],
      linkedSceneIds: [],
      linkedEntityIds: ["entity-northwar", "entity-silversword", "entity-blacktower"],
      linkedTimelineEventIds: ["timeline-northwar"],
      linkedMapMarkerIds: ["marker-northwar"],
      linkedReviewIssueIds: [],
      createdAt: now,
      updatedAt: now
    },
    {
      id: "milestone-aslan-archive",
      worldId: "world-canglan",
      title: "进入王都档案馆",
      summary: "玩家抵达王都，并根据序章选择获得不同的档案馆入口。",
      act: "第二幕",
      status: "blocked",
      priority: "critical",
      order: 2,
      targetDate: "",
      blockedReason: "王都档案馆剧情场景尚未建立",
      developerNotes: "正式许可与黑市渠道需要共享主目标，但反馈不同。",
      manuscriptBody: "",
      dependencyIds: ["milestone-northwar-truth"],
      linkedQuestIds: ["quest-vanished-brother"],
      linkedSceneIds: [],
      linkedEntityIds: ["entity-aslan", "entity-blacktower"],
      linkedTimelineEventIds: [],
      linkedMapMarkerIds: ["marker-aslan"],
      linkedReviewIssueIds: [],
      createdAt: now,
      updatedAt: now
    }
  ],
  manuscriptBooks: [
    {
      id: "manuscript-book-canglan",
      worldId: "world-canglan",
      title: "苍岚纪",
      subtitle: "北境档案",
      summary: "艾琳从雾鸦堡启程，沿着哥哥失踪留下的证据追查黑塔议会。",
      status: "drafting",
      order: 0,
      targetWordCount: 120000,
      dailyWordGoal: 1000,
      writingDays: [],
      createdAt: now,
      updatedAt: now
    }
  ],
  manuscriptVolumes: [
    {
      id: "manuscript-volume-canglan-one",
      worldId: "world-canglan",
      bookId: "manuscript-book-canglan",
      title: "第一卷 北境来信",
      summary: "从雾鸦堡档案调查开始，逐步揭开北境战争记录被篡改的事实。",
      status: "drafting",
      order: 0,
      targetWordCount: 40000,
      createdAt: now,
      updatedAt: now
    }
  ],
  manuscriptChapters: [
    {
      id: "manuscript-chapter-canglan-one",
      worldId: "world-canglan",
      bookId: "manuscript-book-canglan",
      volumeId: "manuscript-volume-canglan-one",
      title: "第一章 风雪来信",
      summary: "艾琳回到雾鸦堡，在档案室发现哥哥留下的第一条线索。",
      body: "",
      notes: "保持限知视角；先展示异常，不急于解释黑塔议会。",
      status: "outline",
      order: 0,
      targetWordCount: 3500,
      viewpointEntityId: "entity-ailin",
      timelineStart: "",
      timelineEnd: "",
      linkedNarrativeMilestoneId: "milestone-fogkeep-opening",
      linkedStorySceneIds: ["scene-fogkeep-archive"],
      references: [
        { kind: "entity", id: "entity-ailin" },
        { kind: "entity", id: "entity-fogkeep" }
      ],
      annotations: [],
      createdAt: now,
      updatedAt: now
    }
  ],
  manuscriptScenes: [],
  manuscriptClues: [
    {
      id: "manuscript-clue-brother",
      worldId: "world-canglan",
      bookId: "manuscript-book-canglan",
      title: "失踪哥哥留下的星银刻痕",
      description: "档案页边缘的刻痕指向北境战争遗物，尚未回收。",
      status: "open",
      setupUnitKind: "chapter",
      setupUnitId: "manuscript-chapter-canglan-one",
      payoffUnitKind: "chapter",
      payoffUnitId: "",
      relatedEntityIds: ["entity-ailin", "entity-silversword"],
      authorConfirmed: true,
      createdAt: now,
      updatedAt: now
    }
  ],
  manuscriptKnowledgeStates: [],
  consistencyFindings: [],
  consistencyScans: [],
  consistencySettings: [createDefaultConsistencySettings("world-canglan")],
  consistencyModelSettings: [createDefaultConsistencyModelSettings("world-canglan")],
  aiMemoryItems: [],
  aiWritingSessions: [],
  aiOperationRuns: [],
  relations: [
    {
      id: "relation-ailin-fogkeep",
      worldId: "world-canglan",
      sourceEntityId: "entity-ailin",
      targetEntityId: "entity-fogkeep",
      kind: "located",
      label: "出生于",
      direction: "directed",
      strength: 5,
      notes: "雾鸦堡是艾琳的故乡，也是她调查哥哥失踪的起点。",
      updatedAt: now
    },
    {
      id: "relation-ailin-blacktower",
      worldId: "world-canglan",
      sourceEntityId: "entity-ailin",
      targetEntityId: "entity-blacktower",
      kind: "rival",
      label: "追查与对抗",
      direction: "directed",
      strength: 4,
      notes: "艾琳怀疑黑塔议会绑架了她的哥哥。",
      updatedAt: now
    },
    {
      id: "relation-blacktower-aslan",
      worldId: "world-canglan",
      sourceEntityId: "entity-blacktower",
      targetEntityId: "entity-aslan",
      kind: "controls",
      label: "暗中渗透",
      direction: "directed",
      strength: 3,
      notes: "黑塔议会通过贵族资助者影响王都档案和研究许可。",
      updatedAt: now
    },
    {
      id: "relation-fogkeep-aslan",
      worldId: "world-canglan",
      sourceEntityId: "entity-fogkeep",
      targetEntityId: "entity-aslan",
      kind: "route",
      label: "北境大道",
      direction: "undirected",
      strength: 3,
      notes: "军队、商队和官方文书往返北境与王都的主要路线。",
      updatedAt: now
    }
  ],
  assets: [],
  members: [
    {
      id: "member-owner",
      worldId: "world-canglan",
      name: "主创作者",
      email: "creator@worldcraft.local",
      role: "owner"
    },
    {
      id: "member-editor",
      worldId: "world-canglan",
      name: "设定编辑",
      email: "editor@worldcraft.local",
      role: "editor"
    },
    {
      id: "member-player",
      worldId: "world-canglan",
      name: "跑团玩家",
      email: "player@worldcraft.local",
      role: "player"
    }
  ]
};

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "")
    .slice(0, 64);
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("zh-CN");
}

function extractMentions(content: string) {
  const matches = Array.from(content.matchAll(/\[\[([^\]]+)\]\]/g));
  return Array.from(new Set(matches.map((match) => match[1].trim()).filter(Boolean)));
}

function formatDateLabel(dateValue: string) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(dateValue));
  } catch {
    return "刚刚";
  }
}

function getAssetUrl(storedName: string) {
  return `worldcraft://asset/${encodeURIComponent(storedName)}`;
}

function replaceWorkspaceAssetUrl<T>(value: T, previousStoredName: string, nextStoredName: string): T {
  if (!previousStoredName || previousStoredName === nextStoredName) return value;
  const previousUrl = getAssetUrl(previousStoredName);
  const nextUrl = nextStoredName ? getAssetUrl(nextStoredName) : "";
  if (typeof value === "string") {
    return value.split(previousUrl).join(nextUrl) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceWorkspaceAssetUrl(item, previousStoredName, nextStoredName)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        replaceWorkspaceAssetUrl(child, previousStoredName, nextStoredName)
      ])
    ) as T;
  }
  return value;
}

function collectWorkspaceAssetStoredNames(value: unknown, result = new Set<string>()) {
  if (typeof value === "string") {
    const pattern = /worldcraft:\/\/asset\/([^"'<>\s)]+)/g;
    for (const match of value.matchAll(pattern)) {
      try {
        const storedName = decodeURIComponent(match[1]);
        if (storedName && !/[\\/]/.test(storedName)) result.add(storedName);
      } catch {
        // Invalid encoded URLs are reported by the reference checks that own the field.
      }
    }
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectWorkspaceAssetStoredNames(item, result));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectWorkspaceAssetStoredNames(item, result));
  }
  return result;
}

type PreparedMapImage = {
  blob: Blob;
  height: number;
  mimeType: string;
  name: string;
  optimized: boolean;
  width: number;
};

async function prepareMapImage(file: File): Promise<PreparedMapImage> {
  const previewUrl = URL.createObjectURL(file);
  let dimensions: { height: number; width: number };
  try {
    dimensions = await new Promise<{ height: number; width: number }>((resolve, reject) => {
      const image = new globalThis.Image();
      image.onerror = () => reject(new Error("decode-failed"));
      image.onload = () => resolve({ height: image.naturalHeight, width: image.naturalWidth });
      image.src = previewUrl;
    });
  } finally {
    URL.revokeObjectURL(previewUrl);
  }

  const limitScale = Math.min(1, 4096 / Math.max(dimensions.width, dimensions.height));
  const limitedWidth = Math.max(1, Math.round(dimensions.width * limitScale));
  const limitedHeight = Math.max(1, Math.round(dimensions.height * limitScale));
  const minimumScale = Math.max(1, 320 / limitedWidth, 240 / limitedHeight);
  const width = Math.round(limitedWidth * minimumScale);
  const height = Math.round(limitedHeight * minimumScale);
  const sourceMimeType = file.type.toLowerCase();
  const canOptimize = limitScale < 1
    && ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(sourceMimeType);

  if (!canOptimize) {
    return {
      blob: file,
      height,
      mimeType: sourceMimeType,
      name: file.name,
      optimized: false,
      width
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = limitedWidth;
  canvas.height = limitedHeight;
  const context = canvas.getContext("2d", { alpha: sourceMimeType === "image/png" });
  if (!context) throw new Error("canvas-unavailable");
  const renderUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const candidate = new globalThis.Image();
      candidate.onerror = () => reject(new Error("decode-failed"));
      candidate.onload = () => resolve(candidate);
      candidate.src = renderUrl;
    });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, limitedWidth, limitedHeight);
  } finally {
    URL.revokeObjectURL(renderUrl);
  }

  const outputMimeType = sourceMimeType === "image/png" ? "image/png" : "image/webp";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error("image-optimization-failed")),
      outputMimeType,
      outputMimeType === "image/webp" ? 0.9 : undefined
    );
  });
  const stem = file.name.replace(/\.[^.]+$/, "") || "map-image";
  return {
    blob,
    height,
    mimeType: outputMimeType,
    name: `${stem}.${outputMimeType === "image/png" ? "png" : "webp"}`,
    optimized: true,
    width
  };
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function versionReasonLabel(reason: string) {
  if (reason === "schema-migration") return "数据库迁移";
  if (reason.startsWith("deleted:")) return "删除前版本";
  if (reason === "before-object-version-restore") return "对象恢复前";
  if (reason === "autosave") {
    return "自动保存";
  }
  if (reason === "before-entity-version-restore") {
    return "恢复前版本";
  }
  if (reason.includes("import")) {
    return "导入数据";
  }
  if (reason.includes("open")) {
    return "打开项目";
  }
  if (reason.includes("project")) {
    return "项目保存";
  }
  return "本地快照";
}

function backupReasonLabel(reason: string) {
  if (reason === "complete") return "完整工程备份";
  if (reason === "manual") return "手动备份";
  if (reason === "auto") return "自动备份";
  if (reason === "ai-operation") return "AI 操作前检查点";
  if (reason === "ai-operation-undo") return "AI 撤销前检查点";
  if (reason === "ai-inline-edit") return "编辑器内 AI 修改前检查点";
  if (reason === "ai-inline-undo") return "编辑器内 AI 撤销前检查点";
  if (reason === "ai-content-apply") return "AI 内容写入前检查点";
  if (reason === "before-open") return "打开项目前";
  if (reason === "before-restore") return "恢复备份前";
  if (reason === "before-storage-maintenance") return "整理数据库前";
  if (reason === "damaged") return "文件损坏";
  return versionReasonLabel(reason);
}

function getEntityTitle(entities: Entity[], entityId: string) {
  return entities.find((entity) => entity.id === entityId)?.title ?? "未关联条目";
}

function emptyEntity(worldId: string, type: EntityType, title?: string): Entity {
  const entityTitle = title ?? `新的${entityTypeMeta[type].label}`;
  return {
    id: createId("entity"),
    worldId,
    type,
    title: entityTitle,
    slug: slugify(entityTitle),
    summary: entityTypeMeta[type].defaultSummary,
    content: "",
    tags: [],
    visibility: "private",
    createdBy: "user-owner",
    updatedAt: new Date().toISOString(),
    categoryId: "",
    order: 0,
    templateData: {}
  };
}

function emptyQuestStep(title = "新的任务步骤"): QuestStep {
  return {
    id: createId("step"),
    title,
    objective: "",
    condition: "",
    branch: "",
    failure: "",
    reward: "",
    notes: ""
  };
}

function emptyQuest(worldId: string, title?: string): QuestLine {
  return {
    id: createId("quest"),
    worldId,
    title: title ?? "新的任务线",
    category: "side",
    status: "draft",
    summary: "描述这条主线、支线或角色任务的剧情目标。",
    trigger: "",
    relatedEntityIds: [],
    prerequisiteQuestIds: [],
    steps: [emptyQuestStep("任务开场")],
    developerNotes: "",
    updatedAt: new Date().toISOString()
  };
}

function emptyRelation(
  worldId: string,
  sourceEntityId: string,
  targetEntityId: string
): EntityRelation {
  return {
    id: createId("relation"),
    worldId,
    sourceEntityId,
    targetEntityId,
    kind: "ally",
    label: relationKindMeta.ally.label,
    direction: relationKindMeta.ally.defaultDirection,
    strength: 3,
    evidenceType: "unspecified",
    sourceCitation: "",
    historicalScope: "",
    confidence: "unspecified",
    notes: "",
    updatedAt: new Date().toISOString()
  };
}

function buildStarterWorkspace(
  packId: StarterPackId,
  worldName: string,
  useBundledNarrativeSample = false
): WorkspaceData {
  const pack = getStarterPack(packId);
  if (packId === "game-narrative" && useBundledNarrativeSample) {
    const sample = structuredClone(initialData);
    sample.worlds[0] = {
      ...sample.worlds[0],
      name: worldName.trim() || pack.initialName,
      description: pack.worldDescription,
      updatedAt: new Date().toISOString()
    };
    return sample;
  }

  const worldId = createId("world");
  const createdAt = new Date().toISOString();
  const world: World = {
    id: worldId,
    ownerId: "user-owner",
    name: worldName.trim() || pack.initialName,
    description: pack.worldDescription,
    visibility: "private",
    createdAt,
    updatedAt: createdAt
  };
  const entityByKey = new globalThis.Map<string, Entity>();
  const entities = pack.entities.map((blueprint, index) => {
    const entity = emptyEntity(worldId, blueprint.type, blueprint.title);
    entity.summary = blueprint.summary;
    entity.content = blueprint.content;
    entity.tags = blueprint.tags;
    entity.categoryId = `category:${worldId}:${blueprint.type}`;
    entity.order = index;
    entity.templateData = { ...blueprint.templateData };
    entityByKey.set(blueprint.key, entity);
    return entity;
  });
  const quest = emptyQuest(worldId, pack.quest.title);
  quest.category = pack.quest.category;
  quest.summary = pack.quest.summary;
  quest.trigger = pack.quest.trigger;
  quest.relatedEntityIds = pack.quest.relatedEntityKeys
    .map((key) => entityByKey.get(key)?.id || "")
    .filter(Boolean);
  quest.steps = pack.quest.steps.map((step) => ({
    ...emptyQuestStep(step.title),
    objective: step.objective
  }));

  const variable = createStoryVariable(worldId, 1, pack.variable.name);
  variable.key = pack.variable.key;
  variable.type = pack.variable.type;
  variable.defaultValue = pack.variable.defaultValue;
  const scene = createStoryScene(worldId, pack.scene.title);
  const speaker = entityByKey.get(pack.scene.speakerEntityKey);
  scene.summary = pack.scene.summary;
  scene.relatedEntityIds = entities.map((entity) => entity.id);
  scene.relatedQuestIds = [quest.id];
  scene.nodes[0] = {
    ...scene.nodes[0],
    label: "场景开场",
    speakerEntityId: speaker?.id || "",
    text: pack.scene.openingText,
    isEnding: true
  };
  const testPreset = createStoryTestPreset(
    worldId,
    [variable],
    scene.id,
    "默认剧情状态"
  );
  const milestone = createNarrativeMilestone(worldId, 0, pack.milestoneTitle, createdAt);
  milestone.linkedEntityIds = entities.map((entity) => entity.id);
  milestone.linkedQuestIds = [quest.id];
  milestone.linkedSceneIds = [scene.id];
  const mapItem = createWorldMap(worldId, 1, "世界地图");
  const mapLayer = createDefaultMapLayer(worldId, mapItem.id, createdAt);
  const timelineTrack = createDefaultTimelineTrack(worldId);

  return normalizeWorkspaceData({
    worlds: [world],
    entityTemplates: createDefaultEntityTemplates(worldId, createdAt),
    codexCategories: createDefaultCodexCategories(worldId, createdAt),
    entities,
    maps: [mapItem],
    mapLayers: [mapLayer],
    mapMarkerGroups: [],
    mapMarkers: [],
    mapRoutes: [],
    timelineTracks: [timelineTrack],
    timelineEvents: [],
    quests: [quest],
    storyVariables: [variable],
    storyScenes: [scene],
    storyTestPresets: [testPreset],
    storyTestRuns: [],
    storyReviewIssues: [],
    narrativeMilestones: [milestone],
    consistencyFindings: [],
    consistencyScans: [],
    consistencySettings: [createDefaultConsistencySettings(worldId)],
    consistencyModelSettings: [createDefaultConsistencyModelSettings(worldId)],
    aiMemoryItems: [],
    aiWritingSessions: [],
    aiOperationRuns: [],
    relations: [],
    assets: [],
    members: [{
      id: createId("member"),
      worldId,
      name: "主创作者",
      email: "creator@worldcraft.local",
      role: "owner"
    }]
  });
}

function mergeWorkspaceData(current: WorkspaceData, addition: WorkspaceData): WorkspaceData {
  const output = {} as WorkspaceData;
  const target = output as unknown as Record<WorkspaceCollection, unknown[]>;
  const left = current as unknown as Record<WorkspaceCollection, unknown[]>;
  const right = addition as unknown as Record<WorkspaceCollection, unknown[]>;
  (Object.keys(current) as WorkspaceCollection[]).forEach((collection) => {
    target[collection] = [...left[collection], ...right[collection]];
  });
  return output;
}

function normalizeWorkspaceData(input: Partial<WorkspaceData>): WorkspaceData {
  const worlds = Array.isArray(input.worlds) && input.worlds.length
    ? input.worlds
    : initialData.worlds;
  const worldIds = new Set(worlds.map((world) => world.id));
  const entityTemplates = worlds.flatMap((world) => {
    const templates = Array.isArray(input.entityTemplates)
      ? input.entityTemplates.filter((template) => template.worldId === world.id)
      : [];
    const normalizedTemplates = templates.map((template, index) =>
      normalizeEntityTemplate(template, world.id, index)
    );
    return addMissingDefaultEntityTemplates(
      normalizedTemplates,
      world.id,
      world.createdAt || new Date().toISOString()
    );
  });
  const entities = Array.isArray(input.entities)
    ? input.entities.map((entity) => {
        const type = entity.type && entityTypeMeta[entity.type] ? entity.type : "note";
        const normalizedEntity = {
          ...emptyEntity(entity.worldId || worlds[0].id, type, entity.title),
          ...entity,
          type,
          tags: Array.isArray(entity.tags) ? entity.tags : [],
          templateData:
            entity.templateData && typeof entity.templateData === "object"
              ? entity.templateData
              : {}
        };
        const resolvedTemplate = resolveEntityTemplate(entityTemplates, normalizedEntity);
        return {
          ...normalizedEntity,
          templateData: applyTemplateDefaults(resolvedTemplate, normalizedEntity.templateData)
        };
      })
    : initialData.entities;
  const codexHierarchy = normalizeCodexHierarchy(
    input.codexCategories,
    entities,
    worlds.map((world) => world.id),
    new Date().toISOString()
  );
  const quests = Array.isArray(input.quests)
    ? input.quests.map((quest) => {
        const category =
          quest.category && questCategoryMeta[quest.category] ? quest.category : "main";
        return {
          ...emptyQuest(quest.worldId || worlds[0].id),
          ...quest,
          category,
          relatedEntityIds: Array.isArray(quest.relatedEntityIds) ? quest.relatedEntityIds : [],
          prerequisiteQuestIds: Array.isArray(quest.prerequisiteQuestIds)
            ? quest.prerequisiteQuestIds
            : [],
          steps: Array.isArray(quest.steps) && quest.steps.length
            ? quest.steps.map((step) => ({ ...emptyQuestStep(), ...step }))
            : [emptyQuestStep("任务开场")]
        };
      })
    : [];
  const storyVariables = Array.isArray(input.storyVariables)
    ? input.storyVariables.map((variable) =>
        normalizeStoryVariable(variable, variable.worldId || worlds[0].id)
      )
    : [];
  const storyScenes = Array.isArray(input.storyScenes)
    ? input.storyScenes.map((scene) =>
        normalizeStoryScene(scene, scene.worldId || worlds[0].id)
      )
    : [];
  const storyTestPresets = Array.isArray(input.storyTestPresets)
    ? input.storyTestPresets.map((preset) =>
        normalizeStoryTestPreset(preset, preset.worldId || worlds[0].id)
      )
    : [];
  const storyTestRuns = Array.isArray(input.storyTestRuns)
    ? input.storyTestRuns.map((run) =>
        normalizeStoryTestRun(run, run.worldId || worlds[0].id)
      )
    : [];
  const storyReviewIssues = Array.isArray(input.storyReviewIssues)
    ? input.storyReviewIssues.map((issue) =>
        normalizeStoryReviewIssue(issue, issue.worldId || worlds[0].id)
      )
    : [];
  const narrativeMilestones = Array.isArray(input.narrativeMilestones)
    ? input.narrativeMilestones
        .filter((milestone) => worldIds.has(milestone.worldId || worlds[0].id))
        .map((milestone, index) =>
          normalizeNarrativeMilestone(
            milestone,
            worldIds.has(milestone.worldId) ? milestone.worldId : worlds[0].id,
            index
          )
        )
    : [];
  const manuscript = normalizeManuscriptWorkspace(
    {
      manuscriptBooks: Array.isArray(input.manuscriptBooks) ? input.manuscriptBooks : [],
      manuscriptVolumes: Array.isArray(input.manuscriptVolumes) ? input.manuscriptVolumes : [],
      manuscriptChapters: Array.isArray(input.manuscriptChapters)
        ? input.manuscriptChapters
        : [],
      manuscriptScenes: Array.isArray(input.manuscriptScenes) ? input.manuscriptScenes : [],
      manuscriptClues: Array.isArray(input.manuscriptClues) ? input.manuscriptClues : [],
      manuscriptKnowledgeStates: Array.isArray(input.manuscriptKnowledgeStates)
        ? input.manuscriptKnowledgeStates
        : []
    },
    worlds.map((world) => world.id),
    narrativeMilestones
  );
  const relations = Array.isArray(input.relations)
    ? input.relations.map((relation) => {
        const kind =
          relation.kind && relationKindMeta[relation.kind] ? relation.kind : "custom";
        const direction =
          relation.direction === "undirected" || relation.direction === "directed" || relation.direction === "mutual"
            ? relation.direction
            : relationKindMeta[kind].defaultDirection;
        const evidenceType = Object.hasOwn(
          relationEvidenceTypeMeta,
          relation.evidenceType || ""
        )
          ? (relation.evidenceType as RelationEvidenceType)
          : "unspecified";
        const confidence = Object.hasOwn(
          relationConfidenceMeta,
          relation.confidence || ""
        )
          ? (relation.confidence as RelationConfidence)
          : "unspecified";
        return {
          ...emptyRelation(
            relation.worldId || worlds[0].id,
            relation.sourceEntityId,
            relation.targetEntityId
          ),
          ...relation,
          kind,
          direction,
          label: relation.label?.trim() || relationKindMeta[kind].label,
          strength: Math.max(1, Math.min(5, Number(relation.strength) || 3)),
          evidenceType,
          sourceCitation: relation.sourceCitation ?? "",
          historicalScope: relation.historicalScope ?? "",
          confidence,
          notes: relation.notes ?? ""
        };
      })
    : [];
  const assets = Array.isArray(input.assets)
    ? input.assets.map((asset) => {
        const kind = asset.kind && assetKindMeta[asset.kind] ? asset.kind : "document";
        const createdAt = asset.createdAt || new Date().toISOString();
        return {
          id: asset.id || createId("asset"),
          worldId: asset.worldId || worlds[0].id,
          name: asset.name?.trim() || asset.originalName || "未命名资源",
          kind,
          storedName: asset.storedName || "",
          originalName: asset.originalName || asset.name || "未命名资源",
          mimeType: asset.mimeType || "application/octet-stream",
          size: Math.max(0, Number(asset.size) || 0),
          contentHash: /^[a-f0-9]{64}$/i.test(asset.contentHash || "")
            ? asset.contentHash.toLowerCase()
            : "",
          tags: Array.isArray(asset.tags) ? asset.tags : [],
          notes: asset.notes ?? "",
          linkedEntityIds: Array.isArray(asset.linkedEntityIds) ? asset.linkedEntityIds : [],
          createdAt,
          updatedAt: asset.updatedAt || createdAt
        };
      })
    : [];
  const consistencyFindings = Array.isArray(input.consistencyFindings)
    ? input.consistencyFindings
        .filter((finding) => worldIds.has(finding.worldId))
        .map((finding) => normalizeConsistencyFinding(finding, finding.worldId))
    : [];
  const consistencyScans = Array.isArray(input.consistencyScans)
    ? input.consistencyScans
        .filter((scan) => worldIds.has(scan.worldId))
        .map((scan) => normalizeConsistencyScan(scan, scan.worldId))
    : [];
  const consistencySettings = worlds.map((world) =>
    normalizeConsistencySettings(
      input.consistencySettings?.find((settings) => settings.worldId === world.id) ?? {},
      world.id
    )
  );
  const consistencyModelSettings = worlds.map((world) =>
    normalizeConsistencyModelSettings(
      input.consistencyModelSettings?.find((settings) => settings.worldId === world.id) ?? {},
      world.id
    )
  );
  const aiMemoryItems = Array.isArray(input.aiMemoryItems)
    ? input.aiMemoryItems
        .filter((item) => worldIds.has(item.worldId))
        .map((item, index) => normalizeAiMemoryItem(item, item.worldId, index))
    : [];
  const aiWritingSessions = Array.isArray(input.aiWritingSessions)
    ? input.aiWritingSessions
        .filter((session) => worldIds.has(session.worldId))
        .map((session, index) => normalizeAiWritingSession(session, session.worldId, index))
    : [];
  const aiOperationRuns = Array.isArray(input.aiOperationRuns)
    ? input.aiOperationRuns
        .filter((run) => worldIds.has(run.worldId))
        .map((run, index) => normalizeAiOperationRun(run, run.worldId, index))
    : [];
  let maps = Array.isArray(input.maps)
    ? input.maps.map((mapItem, index) =>
        normalizeWorldMap(
          {
            ...mapItem,
            worldId: worldIds.has(mapItem.worldId) ? mapItem.worldId : worlds[0].id
          },
          worlds[0].id,
          index + 1
        )
      )
    : [];
  worlds.forEach((world) => {
    if (!maps.some((mapItem) => mapItem.worldId === world.id)) {
      maps.push(createWorldMap(world.id, 1, "世界地图"));
    }
  });
  maps = normalizeMapHierarchy(maps);
  const mapMarkers = Array.isArray(input.mapMarkers)
    ? input.mapMarkers.map((marker) =>
        normalizeMapMarker(marker, maps.find((mapItem) => mapItem.worldId === worlds[0].id)?.id)
      )
    : [];
  const markerById = new globalThis.Map(mapMarkers.map((marker) => [marker.id, marker]));
  maps = maps.map((mapItem) => {
    const entryMarker = markerById.get(mapItem.entryMarkerId);
    return entryMarker?.mapId === mapItem.parentMapId
      ? mapItem
      : { ...mapItem, entryMarkerId: "" };
  });
  const mapLayers = ensureMapLayers(
    Array.isArray(input.mapLayers) ? input.mapLayers : [],
    maps
  );
  const mapById = new globalThis.Map(maps.map((mapItem) => [mapItem.id, mapItem]));
  const mapMarkerGroups = Array.isArray(input.mapMarkerGroups)
    ? input.mapMarkerGroups
        .filter((group) => mapById.has(group.mapId))
        .map((group, index) => {
          const mapItem = mapById.get(group.mapId) || maps[0];
          return normalizeMapMarkerGroup(
            group,
            mapItem?.worldId || worlds[0].id,
            mapItem?.id || "",
            index + 1
          );
        })
    : [];
  const mapRoutes = Array.isArray(input.mapRoutes)
    ? input.mapRoutes.map((route, index) =>
        normalizeMapRoute(
          route,
          worldIds.has(route.worldId) ? route.worldId : worlds[0].id,
          route.mapId || maps.find((mapItem) => mapItem.worldId === route.worldId)?.id || "",
          index + 1
        )
      )
    : [];
  const timelineTracks = ensureTimelineTracks(
    Array.isArray(input.timelineTracks) ? input.timelineTracks : [],
    worlds.map((world) => world.id)
  );
  const timelineEvents = Array.isArray(input.timelineEvents)
    ? input.timelineEvents.map((timelineEvent, index) => {
        const worldId = worldIds.has(timelineEvent.worldId)
          ? timelineEvent.worldId
          : worlds[0].id;
        const fallbackTrack = timelineTracks.find((track) => track.worldId === worldId);
        return normalizeTimelineEvent(timelineEvent, worldId, fallbackTrack?.id || "", index + 1);
      })
    : [];
  const timelineEventById = new globalThis.Map(timelineEvents.map((event) => [event.id, event]));
  maps = maps.map((mapItem) => {
    const layerIds = new Set(mapLayers.filter((layer) => layer.mapId === mapItem.id).map((layer) => layer.id));
    const groupIds = new Set(mapMarkerGroups.filter((group) => group.mapId === mapItem.id).map((group) => group.id));
    const markerIds = new Set(mapMarkers.filter((marker) => marker.mapId === mapItem.id).map((marker) => marker.id));
    const regionIds = new Set(mapItem.regions.map((region) => region.id));
    const routeIds = new Set(mapRoutes.filter((route) => route.mapId === mapItem.id).map((route) => route.id));
    return {
      ...mapItem,
      storyPhases: mapItem.storyPhases.map((phase) => ({
        ...phase,
        timelineEventId: timelineEventById.get(phase.timelineEventId)?.worldId === mapItem.worldId
          ? phase.timelineEventId
          : "",
        hiddenLayerIds: phase.hiddenLayerIds.filter((id) => layerIds.has(id)),
        hiddenGroupIds: phase.hiddenGroupIds.filter((id) => groupIds.has(id)),
        hiddenMarkerIds: phase.hiddenMarkerIds.filter((id) => markerIds.has(id)),
        hiddenRegionIds: phase.hiddenRegionIds.filter((id) => regionIds.has(id)),
        hiddenRouteIds: phase.hiddenRouteIds.filter((id) => routeIds.has(id))
      }))
    };
  });

  return {
    worlds,
    entityTemplates,
    codexCategories: codexHierarchy.categories,
    entities: codexHierarchy.entities,
    maps,
    mapLayers,
    mapMarkerGroups,
    mapMarkers,
    mapRoutes,
    timelineTracks,
    timelineEvents,
    quests,
    storyVariables,
    storyScenes,
    storyTestPresets,
    storyTestRuns,
    storyReviewIssues,
    narrativeMilestones,
    ...manuscript,
    consistencyFindings,
    consistencyScans,
    consistencySettings,
    consistencyModelSettings,
    aiMemoryItems,
    aiWritingSessions,
    aiOperationRuns,
    relations,
    assets,
    members: Array.isArray(input.members) ? input.members : initialData.members
  };
}

function asArray<T>(value: unknown) {
  return Array.isArray(value) ? (value as T[]) : [];
}

function workspaceFromJsonImport(content: string): WorkspaceData {
  const parsed: unknown = JSON.parse(content);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("JSON 文件不是有效的项目数据");
  }

  const root = parsed as Record<string, unknown>;
  const source =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  const worlds = asArray<World>(source.worlds);
  const exportedWorld = source.world;

  if (!worlds.length && (!exportedWorld || typeof exportedWorld !== "object")) {
    throw new Error("没有找到世界项目。请导入 Worldcraft Codex JSON 或项目备份");
  }

  return normalizeWorkspaceData({
    worlds: worlds.length ? worlds : [exportedWorld as World],
    entityTemplates: asArray<EntityTemplateDefinition>(source.entityTemplates),
    codexCategories: asArray<CodexCategory>(source.codexCategories),
    entities: asArray<Entity>(source.entities),
    maps: asArray<WorldMap>(source.maps),
    mapLayers: asArray<MapLayer>(source.mapLayers),
    mapMarkerGroups: asArray<MapMarkerGroup>(source.mapMarkerGroups),
    mapMarkers: asArray<MapMarker>(source.mapMarkers),
    mapRoutes: asArray<MapRoute>(source.mapRoutes),
    timelineTracks: asArray<TimelineTrack>(source.timelineTracks),
    timelineEvents: asArray<TimelineEvent>(source.timelineEvents),
    quests: asArray<QuestLine>(source.quests),
    storyVariables: asArray<StoryVariable>(source.storyVariables),
    storyScenes: asArray<StoryScene>(source.storyScenes),
    storyTestPresets: asArray<StoryTestPreset>(source.storyTestPresets),
    storyTestRuns: asArray<StoryTestRun>(source.storyTestRuns),
    storyReviewIssues: asArray<StoryReviewIssue>(source.storyReviewIssues),
    narrativeMilestones: asArray<NarrativeMilestone>(source.narrativeMilestones),
    manuscriptBooks: asArray<ManuscriptBook>(source.manuscriptBooks),
    manuscriptVolumes: asArray<ManuscriptVolume>(source.manuscriptVolumes),
    manuscriptChapters: asArray<ManuscriptChapter>(source.manuscriptChapters),
    manuscriptScenes: asArray<ManuscriptScene>(source.manuscriptScenes),
    manuscriptClues: asArray<ManuscriptClue>(source.manuscriptClues),
    manuscriptKnowledgeStates: asArray<ManuscriptKnowledgeState>(
      source.manuscriptKnowledgeStates
    ),
    consistencyFindings: asArray<ConsistencyFinding>(source.consistencyFindings),
    consistencyScans: asArray<ConsistencyScan>(source.consistencyScans),
    consistencySettings: asArray<ConsistencySettings>(source.consistencySettings),
    consistencyModelSettings: asArray<ConsistencyModelSettings>(
      source.consistencyModelSettings
    ),
    aiMemoryItems: asArray<AiMemoryItem>(source.aiMemoryItems),
    aiWritingSessions: asArray<AiWritingSession>(source.aiWritingSessions),
    aiOperationRuns: asArray<AiOperationRun>(source.aiOperationRuns),
    relations: asArray<EntityRelation>(source.relations),
    assets: asArray<WorldAsset>(source.assets),
    members: asArray<WorldMember>(source.members)
  });
}

function splitMarkdownHeadings(markdown: string, level: number) {
  const marker = "#".repeat(level);
  const expression = new RegExp(`^${marker}\\s+(.+)$`, "gm");
  const matches = Array.from(markdown.matchAll(expression));

  return matches.map((match, index) => ({
    title: match[1].trim(),
    body: markdown
      .slice((match.index ?? 0) + match[0].length, matches[index + 1]?.index ?? markdown.length)
      .trim()
  }));
}

function getMarkdownSection(markdown: string, title: string) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `# ${title}`);
  if (start < 0) {
    return "";
  }

  const next = lines.findIndex(
    (line, index) => index > start && /^#\s+/.test(line) && !/^##\s+/.test(line)
  );
  return lines.slice(start + 1, next < 0 ? lines.length : next).join("\n").trim();
}

function getMarkdownMetadata(body: string, label: string) {
  const match = body.match(new RegExp(`^-\\s+${label}：\\s*(.*)$`, "m"));
  return match?.[1]?.trim() ?? "";
}

function stripMarkdownMetadata(body: string) {
  return body
    .replace(/^-\s+(?:类型|可见性|摘要|标签|分类|状态|触发条件|相关条目|前置任务)：.*$/gm, "")
    .replace(/^>\s*开发者备注：.*$/gm, "")
    .trim();
}

function splitChineseList(value: string) {
  if (!value || value === "无") {
    return [];
  }
  return value
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function workspaceFromMarkdownImport(content: string, fileName = "导入的世界"): WorkspaceData {
  const timestamp = new Date().toISOString();
  const projectDataSection = getMarkdownSection(content, "Worldcraft 项目数据");
  const projectDataMatch = projectDataSection.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (projectDataMatch) {
    try {
      return workspaceFromJsonImport(projectDataMatch[1]);
    } catch {
      // Fall back to the readable legacy sections when the machine block is damaged.
    }
  }
  const firstHeading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const fallbackName = fileName.replace(/\.(?:md|markdown)$/i, "") || "导入的世界";
  const worldName =
    firstHeading &&
    ![
      "条目",
      "任务线",
      "关系",
      "资源库",
      "剧情变量",
      "剧情场景",
      "剧情测试预设",
      "剧情测试记录",
      "剧情审阅问题",
      "Worldcraft 剧情数据",
      "地图",
      "地图路线",
      "时间线",
      "一致性审阅",
      "Worldcraft 编排数据",
      "Worldcraft 项目数据"
    ].includes(firstHeading)
      ? firstHeading
      : fallbackName;
  const worldId = createId("world");
  const lines = content.split(/\r?\n/);
  const worldHeadingIndex = lines.findIndex((line) => line.trim() === `# ${worldName}`);
  const firstSectionIndex = lines.findIndex(
    (line, index) => index > worldHeadingIndex && /^#\s+/.test(line) && !/^##\s+/.test(line)
  );
  const worldDescription =
    worldHeadingIndex >= 0
      ? lines
          .slice(worldHeadingIndex + 1, firstSectionIndex < 0 ? lines.length : firstSectionIndex)
          .join("\n")
          .trim()
      : "由 Markdown 文件导入的世界项目。";
  const world: World = {
    id: worldId,
    ownerId: "user-owner",
    name: worldName,
    description: worldDescription || "由 Markdown 文件导入的世界项目。",
    visibility: "private",
    createdAt: timestamp,
    updatedAt: timestamp
  };
  const typeByLabel: Record<string, EntityType> = {
    人物: "character",
    地点: "location",
    组织: "faction",
    事件: "event",
    物品: "item",
    笔记: "note"
  };
  const visibilityByLabel: Record<string, Visibility> = {
    私有: "private",
    协作可见: "shared",
    公开: "public",
    开发者秘密: "secret"
  };
  const entityBlocks = splitMarkdownHeadings(getMarkdownSection(content, "条目"), 2);
  const entities = entityBlocks.map((block) => {
    const type = typeByLabel[getMarkdownMetadata(block.body, "类型")] ?? "note";
    const entity = emptyEntity(worldId, type, block.title);
    entity.summary = getMarkdownMetadata(block.body, "摘要") || entity.summary;
    entity.tags = splitChineseList(getMarkdownMetadata(block.body, "标签"));
    entity.visibility =
      visibilityByLabel[getMarkdownMetadata(block.body, "可见性")] ?? "private";
    entity.content = stripMarkdownMetadata(block.body);
    entity.updatedAt = timestamp;
    return entity;
  });
  const statusByLabel: Record<string, QuestStatus> = {
    草稿: "draft",
    制作中: "active",
    已实装: "implemented",
    已删除: "cut"
  };
  const categoryByLabel: Record<string, QuestCategory> = {
    主线任务: "main",
    支线任务: "side",
    角色任务: "character"
  };
  const questRecords: Array<{
    quest: QuestLine;
    relatedTitles: string[];
    prerequisiteTitles: string[];
  }> = splitMarkdownHeadings(getMarkdownSection(content, "任务线"), 2).map((block) => {
    const quest = emptyQuest(worldId, block.title);
    const summaryBody = block.body.split(/^###\s+/m)[0];
    const stepBlocks = splitMarkdownHeadings(block.body, 3);
    quest.category = categoryByLabel[getMarkdownMetadata(block.body, "分类")] ?? "side";
    quest.status = statusByLabel[getMarkdownMetadata(block.body, "状态")] ?? "draft";
    quest.trigger = getMarkdownMetadata(block.body, "触发条件");
    quest.summary = stripMarkdownMetadata(summaryBody) || quest.summary;
    quest.developerNotes = block.body.match(/^>\s*开发者备注：\s*(.*)$/m)?.[1]?.trim() ?? "";
    quest.steps = stepBlocks.length
      ? stepBlocks.map((stepBlock) => {
          const step = emptyQuestStep(stepBlock.title.replace(/^\d+\.\s*/, ""));
          step.objective = getMarkdownMetadata(stepBlock.body, "目标");
          step.condition = getMarkdownMetadata(stepBlock.body, "条件");
          step.branch = getMarkdownMetadata(stepBlock.body, "分支");
          step.failure = getMarkdownMetadata(stepBlock.body, "失败分支");
          step.reward = getMarkdownMetadata(stepBlock.body, "奖励");
          step.notes = getMarkdownMetadata(stepBlock.body, "开发备注");
          return step;
        })
      : [emptyQuestStep("任务开场")];
    quest.updatedAt = timestamp;
    return {
      quest,
      relatedTitles: splitChineseList(getMarkdownMetadata(block.body, "相关条目")),
      prerequisiteTitles: splitChineseList(getMarkdownMetadata(block.body, "前置任务"))
    };
  });
  const quests = questRecords.map((record) => record.quest);

  questRecords.forEach((record) => {
    record.quest.relatedEntityIds = record.relatedTitles
      .map((title) => entities.find((entity) => normalize(entity.title) === normalize(title))?.id)
      .filter((id): id is string => Boolean(id));
    record.quest.prerequisiteQuestIds = record.prerequisiteTitles
      .map((title) => quests.find((quest) => normalize(quest.title) === normalize(title))?.id)
      .filter((id): id is string => Boolean(id));
  });
  const relationKindByLabel = Object.fromEntries(
    (Object.keys(relationKindMeta) as RelationKind[]).map((kind) => [
      relationKindMeta[kind].label,
      kind
    ])
  ) as Record<string, RelationKind>;
  const relations = splitMarkdownHeadings(getMarkdownSection(content, "关系"), 2)
    .map((block) => {
      const heading = block.title.match(/^(.+?)\s*(→|↔)\s*(.+)$/);
      if (!heading) {
        return null;
      }

      const source = entities.find(
        (entity) => normalize(entity.title) === normalize(heading[1])
      );
      const target = entities.find(
        (entity) => normalize(entity.title) === normalize(heading[3])
      );
      if (!source || !target) {
        return null;
      }

      const kind = relationKindByLabel[getMarkdownMetadata(block.body, "类型")] ?? "custom";
      const relation = emptyRelation(worldId, source.id, target.id);
      relation.kind = kind;
      relation.label = getMarkdownMetadata(block.body, "标签") || relationKindMeta[kind].label;
      relation.direction =
        getMarkdownMetadata(block.body, "方向") === "双向" || heading[2] === "↔"
          ? "undirected"
          : "directed";
      relation.strength = Math.max(
        1,
        Math.min(5, Number(getMarkdownMetadata(block.body, "强度")) || 3)
      );
      const evidenceTypeLabel = getMarkdownMetadata(block.body, "证据类型");
      relation.evidenceType =
        (Object.entries(relationEvidenceTypeMeta).find(([, label]) => label === evidenceTypeLabel)?.[0] as
          | RelationEvidenceType
          | undefined) ?? "unspecified";
      relation.sourceCitation = getMarkdownMetadata(block.body, "原典出处");
      relation.historicalScope = getMarkdownMetadata(block.body, "适用年代");
      const confidenceLabel = getMarkdownMetadata(block.body, "可信度");
      relation.confidence =
        (Object.entries(relationConfidenceMeta).find(([, label]) => label === confidenceLabel)?.[0] as
          | RelationConfidence
          | undefined) ?? "unspecified";
      relation.notes = getMarkdownMetadata(block.body, "备注");
      relation.updatedAt = timestamp;
      return relation;
    })
    .filter((relation): relation is EntityRelation => Boolean(relation));
  const assetKindByLabel = Object.fromEntries(
    (Object.keys(assetKindMeta) as AssetKind[]).map((kind) => [assetKindMeta[kind].label, kind])
  ) as Record<string, AssetKind>;
  const assets = splitMarkdownHeadings(getMarkdownSection(content, "资源库"), 2).map(
    (block) => {
      const createdAt = getMarkdownMetadata(block.body, "导入时间") || timestamp;
      return {
        id: createId("asset"),
        worldId,
        name: block.title,
        kind: assetKindByLabel[getMarkdownMetadata(block.body, "分类")] ?? "document",
        storedName: getMarkdownMetadata(block.body, "本地文件"),
        originalName: getMarkdownMetadata(block.body, "原始文件") || block.title,
        mimeType: getMarkdownMetadata(block.body, "格式") || "application/octet-stream",
        size: Math.max(0, Number(getMarkdownMetadata(block.body, "字节数")) || 0),
        contentHash: /^[a-f0-9]{64}$/i.test(getMarkdownMetadata(block.body, "SHA-256"))
          ? getMarkdownMetadata(block.body, "SHA-256").toLowerCase()
          : "",
        tags: splitChineseList(getMarkdownMetadata(block.body, "标签")),
        notes: getMarkdownMetadata(block.body, "备注"),
        linkedEntityIds: splitChineseList(getMarkdownMetadata(block.body, "关联条目"))
          .map((title) => entities.find((entity) => normalize(entity.title) === normalize(title))?.id)
          .filter((id): id is string => Boolean(id)),
        createdAt,
        updatedAt: timestamp
      } satisfies WorldAsset;
    }
  );
  let storyVariables: StoryVariable[] = [];
  let storyScenes: StoryScene[] = [];
  let storyTestPresets: StoryTestPreset[] = [];
  let storyTestRuns: StoryTestRun[] = [];
  let storyReviewIssues: StoryReviewIssue[] = [];
  const storyDataSection = getMarkdownSection(content, "Worldcraft 剧情数据");
  const storyDataMatch = storyDataSection.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (storyDataMatch) {
    try {
      const storyData = JSON.parse(storyDataMatch[1]) as {
        storyVariables?: StoryVariable[];
        storyScenes?: StoryScene[];
        storyTestPresets?: StoryTestPreset[];
        storyTestRuns?: StoryTestRun[];
        storyReviewIssues?: StoryReviewIssue[];
        entityTitles?: Record<string, string>;
        questTitles?: Record<string, string>;
        assetNames?: Record<string, string>;
      };
      storyVariables = asArray<StoryVariable>(storyData.storyVariables).map((variable) =>
        normalizeStoryVariable({ ...variable, worldId }, worldId)
      );
      const entityIdMap = new globalThis.Map<string, string>();
      Object.entries(storyData.entityTitles ?? {}).forEach(([oldId, title]) => {
        const entity = entities.find((item) => normalize(item.title) === normalize(title));
        if (entity) entityIdMap.set(oldId, entity.id);
      });
      const questIdMap = new globalThis.Map<string, string>();
      Object.entries(storyData.questTitles ?? {}).forEach(([oldId, title]) => {
        const quest = quests.find((item) => normalize(item.title) === normalize(title));
        if (quest) questIdMap.set(oldId, quest.id);
      });
      const assetIdMap = new globalThis.Map<string, string>();
      Object.entries(storyData.assetNames ?? {}).forEach(([oldId, name]) => {
        const asset = assets.find((item) => normalize(item.name) === normalize(name));
        if (asset) assetIdMap.set(oldId, asset.id);
      });
      storyScenes = asArray<StoryScene>(storyData.storyScenes).map((scene) =>
        normalizeStoryScene(
          {
            ...scene,
            worldId,
            relatedEntityIds: scene.relatedEntityIds
              .map((id) => entityIdMap.get(id))
              .filter((id): id is string => Boolean(id)),
            relatedQuestIds: scene.relatedQuestIds
              .map((id) => questIdMap.get(id))
              .filter((id): id is string => Boolean(id)),
            nodes: scene.nodes.map((node) => ({
              ...node,
              speakerEntityId: entityIdMap.get(node.speakerEntityId) ?? "",
              mediaAssetId: assetIdMap.get(node.mediaAssetId) ?? ""
            }))
          },
          worldId
        )
      );
      storyTestPresets = asArray<StoryTestPreset>(storyData.storyTestPresets).map(
        (preset) => normalizeStoryTestPreset({ ...preset, worldId }, worldId)
      );
      storyTestRuns = asArray<StoryTestRun>(storyData.storyTestRuns).map((run) =>
        normalizeStoryTestRun({ ...run, worldId }, worldId)
      );
      storyReviewIssues = asArray<StoryReviewIssue>(storyData.storyReviewIssues).map(
        (issue) =>
          normalizeStoryReviewIssue(
            {
              ...issue,
              worldId,
              entityId: entityIdMap.get(issue.entityId) ?? "",
              questId: questIdMap.get(issue.questId) ?? ""
            },
            worldId
          )
      );
    } catch {
      storyVariables = [];
      storyScenes = [];
      storyTestPresets = [];
      storyTestRuns = [];
      storyReviewIssues = [];
    }
  }
  let maps: WorldMap[] = [createWorldMap(worldId, 1, "世界地图")];
  let mapLayers: MapLayer[] = [];
  let mapMarkerGroups: MapMarkerGroup[] = [];
  let mapMarkers: MapMarker[] = [];
  let mapRoutes: MapRoute[] = [];
  let timelineTracks: TimelineTrack[] = [createDefaultTimelineTrack(worldId)];
  let timelineEvents: TimelineEvent[] = entities
    .filter((entity) => entity.type === "event")
    .map((entity, index) =>
      normalizeTimelineEvent(
        {
          id: createId("timeline"),
          worldId,
          entityId: entity.id,
          title: entity.title,
          summary: entity.summary,
          displayDate: entity.templateData.time || "未定时间",
          sortOrder: Date.now() + index
        },
        worldId,
        timelineTracks[0].id,
        index + 1
      )
    );
  const planningDataSection = getMarkdownSection(content, "Worldcraft 编排数据");
  const planningDataMatch = planningDataSection.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (planningDataMatch) {
    try {
      const planningData = JSON.parse(planningDataMatch[1]) as {
        maps?: WorldMap[];
        mapLayers?: MapLayer[];
        mapMarkerGroups?: MapMarkerGroup[];
        mapMarkers?: MapMarker[];
        mapRoutes?: MapRoute[];
        timelineTracks?: TimelineTrack[];
        timelineEvents?: TimelineEvent[];
        entityTitles?: Record<string, string>;
        questTitles?: Record<string, string>;
        sceneTitles?: Record<string, string>;
      };
      const entityIdMap = new globalThis.Map<string, string>();
      Object.entries(planningData.entityTitles ?? {}).forEach(([oldId, title]) => {
        const entity = entities.find((item) => normalize(item.title) === normalize(title));
        if (entity) entityIdMap.set(oldId, entity.id);
      });
      const questIdMap = new globalThis.Map<string, string>();
      Object.entries(planningData.questTitles ?? {}).forEach(([oldId, title]) => {
        const quest = quests.find((item) => normalize(item.title) === normalize(title));
        if (quest) questIdMap.set(oldId, quest.id);
      });
      const sceneIdMap = new globalThis.Map<string, string>();
      Object.entries(planningData.sceneTitles ?? {}).forEach(([oldId, title]) => {
        const scene = storyScenes.find((item) => normalize(item.title) === normalize(title));
        if (scene) sceneIdMap.set(oldId, scene.id);
      });
      maps = asArray<WorldMap>(planningData.maps).map((mapItem, index) =>
        normalizeWorldMap({ ...mapItem, worldId }, worldId, index + 1)
      );
      if (!maps.length) maps = [createWorldMap(worldId, 1, "世界地图")];
      mapLayers = ensureMapLayers(
        asArray<MapLayer>(planningData.mapLayers).map((layer) => ({ ...layer, worldId })),
        maps
      );
      mapMarkerGroups = asArray<MapMarkerGroup>(planningData.mapMarkerGroups)
        .filter((group) => maps.some((mapItem) => mapItem.id === group.mapId))
        .map((group, index) =>
          normalizeMapMarkerGroup(group, worldId, group.mapId, index + 1)
        );
      mapMarkers = asArray<MapMarker>(planningData.mapMarkers).map((marker) =>
        normalizeMapMarker({
          ...marker,
          entityId: entityIdMap.get(marker.entityId) ?? "",
          questId: questIdMap.get(marker.questId) ?? "",
          sceneId: sceneIdMap.get(marker.sceneId) ?? ""
        })
      );
      mapRoutes = asArray<MapRoute>(planningData.mapRoutes).map((route, index) =>
        normalizeMapRoute({ ...route, worldId }, worldId, route.mapId, index + 1)
      );
      timelineTracks = ensureTimelineTracks(
        asArray<TimelineTrack>(planningData.timelineTracks).map((track) => ({
          ...track,
          worldId
        })),
        [worldId]
      );
      timelineEvents = asArray<TimelineEvent>(planningData.timelineEvents).map(
        (timelineEvent, index) =>
          normalizeTimelineEvent(
            {
              ...timelineEvent,
              worldId,
              entityId: entityIdMap.get(timelineEvent.entityId) ?? "",
              questId: questIdMap.get(timelineEvent.questId) ?? "",
              sceneId: sceneIdMap.get(timelineEvent.sceneId) ?? ""
            },
            worldId,
            timelineTracks[0]?.id || "",
            index + 1
          )
      );
    } catch {
      maps = [createWorldMap(worldId, 1, "世界地图")];
      mapLayers = [];
      mapMarkerGroups = [];
      mapMarkers = [];
      mapRoutes = [];
      timelineTracks = [createDefaultTimelineTrack(worldId)];
    }
  }

  const importedHierarchy = normalizeCodexHierarchy(
    undefined,
    entities,
    [worldId],
    timestamp
  );
  mapLayers = ensureMapLayers(mapLayers, maps);

  return {
    worlds: [world],
    entityTemplates: createDefaultEntityTemplates(worldId),
    codexCategories: importedHierarchy.categories,
    entities: importedHierarchy.entities,
    maps,
    mapLayers,
    mapMarkerGroups,
    mapMarkers,
    mapRoutes,
    timelineTracks,
    timelineEvents,
    quests,
    storyVariables,
    storyScenes,
    storyTestPresets,
    storyTestRuns,
    storyReviewIssues,
    narrativeMilestones: [],
    manuscriptBooks: [],
    manuscriptVolumes: [],
    manuscriptChapters: [],
    manuscriptScenes: [],
    manuscriptClues: [],
    manuscriptKnowledgeStates: [],
    consistencyFindings: [],
    consistencyScans: [],
    consistencySettings: [createDefaultConsistencySettings(worldId)],
    consistencyModelSettings: [createDefaultConsistencyModelSettings(worldId)],
    aiMemoryItems: [],
    aiWritingSessions: [],
    aiOperationRuns: [],
    relations,
    assets,
    members: [
      {
        id: createId("member"),
        worldId,
        name: "主创作者",
        email: "creator@worldcraft.local",
        role: "owner"
      }
    ]
  };
}

function nextImportId(original: string, prefix: string, used: Set<string>) {
  if (original && !used.has(original)) {
    used.add(original);
    return original;
  }

  let next = createId(prefix);
  while (used.has(next)) {
    next = createId(prefix);
  }
  used.add(next);
  return next;
}

function mergeImportedWorkspace(
  current: WorkspaceData,
  imported: WorkspaceData,
  options: { worldNameSuffix?: string } = {}
) {
  const worldIds = new Set(current.worlds.map((item) => item.id));
  const entityTemplateIds = new Set(current.entityTemplates.map((item) => item.id));
  const codexCategoryIds = new Set(current.codexCategories.map((item) => item.id));
  const entityIds = new Set(current.entities.map((item) => item.id));
  const mapIds = new Set(current.maps.map((item) => item.id));
  const mapLayerIds = new Set(current.mapLayers.map((item) => item.id));
  const mapMarkerGroupIds = new Set(current.mapMarkerGroups.map((item) => item.id));
  const markerIds = new Set(current.mapMarkers.map((item) => item.id));
  const mapRouteIds = new Set(current.mapRoutes.map((item) => item.id));
  const timelineTrackIds = new Set(current.timelineTracks.map((item) => item.id));
  const timelineIds = new Set(current.timelineEvents.map((item) => item.id));
  const questIds = new Set(current.quests.map((item) => item.id));
  const storyVariableIds = new Set(current.storyVariables.map((item) => item.id));
  const storySceneIds = new Set(current.storyScenes.map((item) => item.id));
  const storyNodeIds = new Set(
    current.storyScenes.flatMap((scene) => scene.nodes.map((node) => node.id))
  );
  const storyChoiceIds = new Set(
    current.storyScenes.flatMap((scene) =>
      scene.nodes.flatMap((node) => node.choices.map((choice) => choice.id))
    )
  );
  const storyTestPresetIds = new Set(current.storyTestPresets.map((item) => item.id));
  const storyTestRunIds = new Set(current.storyTestRuns.map((item) => item.id));
  const storyReviewIssueIds = new Set(current.storyReviewIssues.map((item) => item.id));
  const narrativeMilestoneIds = new Set(current.narrativeMilestones.map((item) => item.id));
  const manuscriptBookIds = new Set(current.manuscriptBooks.map((item) => item.id));
  const manuscriptVolumeIds = new Set(current.manuscriptVolumes.map((item) => item.id));
  const manuscriptChapterIds = new Set(current.manuscriptChapters.map((item) => item.id));
  const manuscriptSceneIds = new Set(current.manuscriptScenes.map((item) => item.id));
  const manuscriptClueIds = new Set(current.manuscriptClues.map((item) => item.id));
  const manuscriptKnowledgeIds = new Set(
    current.manuscriptKnowledgeStates.map((item) => item.id)
  );
  const relationIds = new Set(current.relations.map((item) => item.id));
  const assetIds = new Set(current.assets.map((item) => item.id));
  const consistencyFindingIds = new Set(
    current.consistencyFindings.map((item) => item.id)
  );
  const consistencyScanIds = new Set(current.consistencyScans.map((item) => item.id));
  const memberIds = new Set(current.members.map((item) => item.id));
  const worldIdMap = new globalThis.Map<string, string>();
  const entityTemplateIdMap = new globalThis.Map<string, string>();
  const codexCategoryIdMap = new globalThis.Map<string, string>();
  const entityIdMap = new globalThis.Map<string, string>();
  const mapIdMap = new globalThis.Map<string, string>();
  const mapLayerIdMap = new globalThis.Map<string, string>();
  const mapMarkerGroupIdMap = new globalThis.Map<string, string>();
  const markerIdMap = new globalThis.Map<string, string>();
  const mapRouteIdMap = new globalThis.Map<string, string>();
  const timelineTrackIdMap = new globalThis.Map<string, string>();
  const timelineIdMap = new globalThis.Map<string, string>();
  const questIdMap = new globalThis.Map<string, string>();
  const storyVariableIdMap = new globalThis.Map<string, string>();
  const storySceneIdMap = new globalThis.Map<string, string>();
  const storyTestPresetIdMap = new globalThis.Map<string, string>();
  const storyTestRunIdMap = new globalThis.Map<string, string>();
  const storyReviewIssueIdMap = new globalThis.Map<string, string>();
  const narrativeMilestoneIdMap = new globalThis.Map<string, string>();
  const manuscriptBookIdMap = new globalThis.Map<string, string>();
  const manuscriptVolumeIdMap = new globalThis.Map<string, string>();
  const manuscriptChapterIdMap = new globalThis.Map<string, string>();
  const manuscriptSceneIdMap = new globalThis.Map<string, string>();
  const manuscriptClueIdMap = new globalThis.Map<string, string>();
  const manuscriptKnowledgeIdMap = new globalThis.Map<string, string>();
  const relationIdMap = new globalThis.Map<string, string>();
  const assetIdMap = new globalThis.Map<string, string>();
  const memberIdMap = new globalThis.Map<string, string>();
  const consistencyFindingIdMap = new globalThis.Map<string, string>();
  const consistencyScanIdMap = new globalThis.Map<string, string>();
  const importedWorlds = imported.worlds.map((world) => {
    const id = nextImportId(world.id, "world", worldIds);
    worldIdMap.set(world.id, id);
    return {
      ...world,
      id,
      name: `${world.name}${options.worldNameSuffix ?? "（导入）"}`,
      updatedAt: new Date().toISOString()
    };
  });
  imported.members
    .filter((member) => worldIdMap.has(member.worldId))
    .forEach((member) => {
      memberIdMap.set(member.id, nextImportId(member.id, "member", memberIds));
    });
  const importedEntityTemplates: EntityTemplateDefinition[] = [];
  imported.worlds.forEach((sourceWorld) => {
    const worldId = worldIdMap.get(sourceWorld.id) as string;
    const defaultTemplates = createDefaultEntityTemplates(worldId);
    const matchedDefaultIds = new Set<string>();
    const sourceTemplates = imported.entityTemplates.filter(
      (template) => template.worldId === sourceWorld.id
    );

    sourceTemplates.forEach((template, index) => {
      const matchingDefault = template.builtIn
        ? defaultTemplates.find(
            (candidate) =>
              candidate.name === template.name &&
              candidate.entityTypes.join("|") === template.entityTypes.join("|")
          )
        : undefined;
      const id = matchingDefault
        ? matchingDefault.id
        : nextImportId(template.id, "template", entityTemplateIds);
      if (matchingDefault) {
        entityTemplateIds.add(id);
        matchedDefaultIds.add(id);
      }
      entityTemplateIdMap.set(template.id, id);
      importedEntityTemplates.push(
        normalizeEntityTemplate(
          {
            ...template,
            id,
            worldId,
            builtIn: Boolean(matchingDefault),
            fields: template.fields.map((field) => ({
              ...field,
              id: createId("template-field")
            }))
          },
          worldId,
          index
        )
      );
    });

    defaultTemplates
      .filter((template) => !matchedDefaultIds.has(template.id))
      .forEach((template) => {
        entityTemplateIds.add(template.id);
        importedEntityTemplates.push(template);
      });
  });
  const importedCodexCategoryCandidates = imported.codexCategories.filter((category) =>
    worldIdMap.has(category.worldId)
  );
  importedCodexCategoryCandidates.forEach((category) => {
    codexCategoryIdMap.set(
      category.id,
      nextImportId(category.id, "category", codexCategoryIds)
    );
  });
  const importedCodexCategories = importedCodexCategoryCandidates.map((category) => ({
    ...category,
    id: codexCategoryIdMap.get(category.id) as string,
    worldId: worldIdMap.get(category.worldId) as string,
    parentId: codexCategoryIdMap.get(category.parentId) ?? ""
  }));
  imported.narrativeMilestones
    .filter((milestone) => worldIdMap.has(milestone.worldId))
    .forEach((milestone) => {
      narrativeMilestoneIdMap.set(
        milestone.id,
        nextImportId(milestone.id, "milestone", narrativeMilestoneIds)
      );
    });
  imported.manuscriptBooks
    .filter((book) => worldIdMap.has(book.worldId))
    .forEach((book) => {
      manuscriptBookIdMap.set(
        book.id,
        nextImportId(book.id, "manuscript-book", manuscriptBookIds)
      );
    });
  imported.manuscriptVolumes
    .filter(
      (volume) => worldIdMap.has(volume.worldId) && manuscriptBookIdMap.has(volume.bookId)
    )
    .forEach((volume) => {
      manuscriptVolumeIdMap.set(
        volume.id,
        nextImportId(volume.id, "manuscript-volume", manuscriptVolumeIds)
      );
    });
  imported.manuscriptChapters
    .filter(
      (chapter) =>
        worldIdMap.has(chapter.worldId) &&
        manuscriptBookIdMap.has(chapter.bookId) &&
        manuscriptVolumeIdMap.has(chapter.volumeId)
    )
    .forEach((chapter) => {
      manuscriptChapterIdMap.set(
        chapter.id,
        nextImportId(chapter.id, "manuscript-chapter", manuscriptChapterIds)
      );
    });
  imported.manuscriptScenes
    .filter((scene) => manuscriptChapterIdMap.has(scene.chapterId))
    .forEach((scene) => {
      manuscriptSceneIdMap.set(
        scene.id,
        nextImportId(scene.id, "manuscript-scene", manuscriptSceneIds)
      );
    });
  imported.manuscriptClues
    .filter((clue) => manuscriptBookIdMap.has(clue.bookId))
    .forEach((clue) => {
      manuscriptClueIdMap.set(
        clue.id,
        nextImportId(clue.id, "manuscript-clue", manuscriptClueIds)
      );
    });
  imported.manuscriptKnowledgeStates
    .filter((item) => manuscriptBookIdMap.has(item.bookId))
    .forEach((item) => {
      manuscriptKnowledgeIdMap.set(
        item.id,
        nextImportId(item.id, "manuscript-knowledge", manuscriptKnowledgeIds)
      );
    });
  imported.consistencyFindings
    .filter((finding) => worldIdMap.has(finding.worldId))
    .forEach((finding) => {
      consistencyFindingIdMap.set(
        finding.id,
        nextImportId(finding.id, "consistency", consistencyFindingIds)
      );
    });
  imported.consistencyScans
    .filter((scan) => worldIdMap.has(scan.worldId))
    .forEach((scan) => {
      consistencyScanIdMap.set(
        scan.id,
        nextImportId(scan.id, "consistency-scan", consistencyScanIds)
      );
    });
  const importedEntities = imported.entities
    .filter((entity) => worldIdMap.has(entity.worldId))
    .map((entity) => {
      const id = nextImportId(entity.id, "entity", entityIds);
      entityIdMap.set(entity.id, id);
      return {
        ...entity,
        id,
        worldId: worldIdMap.get(entity.worldId) as string,
        categoryId: codexCategoryIdMap.get(entity.categoryId) ?? "",
        templateId: entity.templateId
          ? entityTemplateIdMap.get(entity.templateId) ?? entity.templateId
          : undefined
      };
    });
  importedEntities.forEach((entity) => {
    const template = importedEntityTemplates.find((item) => item.id === entity.templateId);
    for (const field of template?.fields ?? []) {
      if (field.type !== "entity_ref") continue;
      const value = entity.templateData[field.key];
      if (value && entityIdMap.has(value)) entity.templateData[field.key] = entityIdMap.get(value) as string;
    }
  });
  const importedMaps = imported.maps
    .filter((mapItem) => worldIdMap.has(mapItem.worldId))
    .map((mapItem) => {
      const id = nextImportId(mapItem.id, "map", mapIds);
      mapIdMap.set(mapItem.id, id);
      return { ...mapItem, id, worldId: worldIdMap.get(mapItem.worldId) as string };
    });
  const importedMapLayerCandidates = imported.mapLayers.filter((layer) =>
    mapIdMap.has(layer.mapId)
  );
  importedMapLayerCandidates.forEach((layer) => {
    mapLayerIdMap.set(layer.id, nextImportId(layer.id, "map-layer", mapLayerIds));
  });
  const importedMapLayers = importedMapLayerCandidates.map((layer, index) =>
    normalizeMapLayer(
      {
        ...layer,
        id: mapLayerIdMap.get(layer.id) as string,
        worldId: worldIdMap.get(layer.worldId) as string,
        mapId: mapIdMap.get(layer.mapId) as string
      },
      worldIdMap.get(layer.worldId) as string,
      mapIdMap.get(layer.mapId) as string,
      index
    )
  );
  const importedMapMarkerGroupCandidates = imported.mapMarkerGroups.filter((group) =>
    mapIdMap.has(group.mapId)
  );
  importedMapMarkerGroupCandidates.forEach((group) => {
    mapMarkerGroupIdMap.set(
      group.id,
      nextImportId(group.id, "marker-group", mapMarkerGroupIds)
    );
  });
  const importedMapMarkerGroups = importedMapMarkerGroupCandidates.map((group, index) =>
    normalizeMapMarkerGroup(
      {
        ...group,
        id: mapMarkerGroupIdMap.get(group.id) as string,
        worldId: worldIdMap.get(group.worldId) as string,
        mapId: mapIdMap.get(group.mapId) as string
      },
      worldIdMap.get(group.worldId) as string,
      mapIdMap.get(group.mapId) as string,
      index + 1
    )
  );
  const importedTimelineTrackCandidates = imported.timelineTracks.filter((track) =>
    worldIdMap.has(track.worldId)
  );
  importedTimelineTrackCandidates.forEach((track) => {
    timelineTrackIdMap.set(
      track.id,
      nextImportId(track.id, "timeline-track", timelineTrackIds)
    );
  });
  const importedTimelineTracks = importedTimelineTrackCandidates.map((track, index) =>
    normalizeTimelineTrack(
      {
        ...track,
        id: timelineTrackIdMap.get(track.id) as string,
        worldId: worldIdMap.get(track.worldId) as string
      },
      worldIdMap.get(track.worldId) as string,
      index
    )
  );
  imported.quests.forEach((quest) => {
    questIdMap.set(quest.id, nextImportId(quest.id, "quest", questIds));
  });
  const importedQuests = imported.quests
    .filter((quest) => worldIdMap.has(quest.worldId))
    .map((quest) => ({
      ...quest,
      id: questIdMap.get(quest.id) as string,
      worldId: worldIdMap.get(quest.worldId) as string,
      relatedEntityIds: quest.relatedEntityIds
        .map((id) => entityIdMap.get(id))
        .filter((id): id is string => Boolean(id)),
      prerequisiteQuestIds: quest.prerequisiteQuestIds
        .map((id) => questIdMap.get(id))
        .filter((id): id is string => Boolean(id))
    }));
  const importedStoryVariables = imported.storyVariables
    .filter((variable) => worldIdMap.has(variable.worldId))
    .map((variable) => {
      const id = nextImportId(variable.id, "variable", storyVariableIds);
      storyVariableIdMap.set(variable.id, id);
      return {
        ...variable,
        id,
        worldId: worldIdMap.get(variable.worldId) as string
      };
    });
  const importedStorySceneCandidates = imported.storyScenes.filter((scene) =>
    worldIdMap.has(scene.worldId)
  );
  const storyNodeIdMaps = new globalThis.Map<
    string,
    globalThis.Map<string, string>
  >();
  const storyChoiceIdMaps = new globalThis.Map<
    string,
    globalThis.Map<string, string>
  >();
  importedStorySceneCandidates.forEach((scene) => {
    storySceneIdMap.set(scene.id, nextImportId(scene.id, "scene", storySceneIds));
    const nodeIdMap = new globalThis.Map<string, string>();
    const choiceIdMap = new globalThis.Map<string, string>();
    scene.nodes.forEach((node) => {
      nodeIdMap.set(node.id, nextImportId(node.id, "dialogue", storyNodeIds));
      node.choices.forEach((choice) => {
        choiceIdMap.set(choice.id, nextImportId(choice.id, "choice", storyChoiceIds));
      });
    });
    storyNodeIdMaps.set(scene.id, nodeIdMap);
    storyChoiceIdMaps.set(scene.id, choiceIdMap);
  });
  let importedStoryScenes = importedStorySceneCandidates.map((scene) => {
      const nodeIdMap = storyNodeIdMaps.get(scene.id) as globalThis.Map<string, string>;
      const choiceIdMap = storyChoiceIdMaps.get(scene.id) as globalThis.Map<string, string>;
      const remapConditions = (conditions: StoryCondition[]) =>
        conditions.map((condition) => ({
          ...condition,
          variableId: storyVariableIdMap.get(condition.variableId) ?? condition.variableId
        }));
      const remapEffects = (effects: StoryEffect[]) =>
        effects.map((effect) => ({
          ...effect,
          variableId: storyVariableIdMap.get(effect.variableId) ?? effect.variableId
        }));
      const nodes = scene.nodes.map<DialogueNode>((node) => ({
        ...node,
        id: nodeIdMap.get(node.id) as string,
        speakerEntityId: entityIdMap.get(node.speakerEntityId) ?? node.speakerEntityId,
        conditions: remapConditions(node.conditions),
        effects: remapEffects(node.effects),
        nextNodeId: node.nextNodeId
          ? (nodeIdMap.get(node.nextNodeId) ?? node.nextNodeId)
          : "",
        choices: node.choices.map((choice) => ({
          ...choice,
          id: choiceIdMap.get(choice.id) as string,
          targetNodeId: choice.targetNodeId
            ? (nodeIdMap.get(choice.targetNodeId) ?? choice.targetNodeId)
            : "",
          conditions: remapConditions(choice.conditions),
          effects: remapEffects(choice.effects)
        }))
      }));
      return {
        ...scene,
        id: storySceneIdMap.get(scene.id) as string,
        worldId: worldIdMap.get(scene.worldId) as string,
        entryNodeId: nodeIdMap.get(scene.entryNodeId) ?? scene.entryNodeId,
        relatedEntityIds: scene.relatedEntityIds.map(
          (id) => entityIdMap.get(id) ?? id
        ),
        relatedQuestIds: scene.relatedQuestIds.map((id) => questIdMap.get(id) ?? id),
        nodes
      };
    });
  const remapStoryState = (state: StoryState) =>
    Object.fromEntries(
      Object.entries(state).map(([variableId, value]) => [
        storyVariableIdMap.get(variableId) ?? variableId,
        value
      ])
    );
  const importedStoryTestPresetCandidates = imported.storyTestPresets.filter((preset) =>
    worldIdMap.has(preset.worldId)
  );
  importedStoryTestPresetCandidates.forEach((preset) => {
    storyTestPresetIdMap.set(
      preset.id,
      nextImportId(preset.id, "test-preset", storyTestPresetIds)
    );
  });
  const importedStoryTestPresets = importedStoryTestPresetCandidates.map((preset) =>
    normalizeStoryTestPreset(
      {
        ...preset,
        id: storyTestPresetIdMap.get(preset.id) as string,
        worldId: worldIdMap.get(preset.worldId) as string,
        sceneId: storySceneIdMap.get(preset.sceneId) ?? preset.sceneId,
        initialState: remapStoryState(preset.initialState)
      },
      worldIdMap.get(preset.worldId) as string
    )
  );
  const importedStoryTestRunCandidates = imported.storyTestRuns.filter((run) =>
    worldIdMap.has(run.worldId)
  );
  importedStoryTestRunCandidates.forEach((run) => {
    storyTestRunIdMap.set(run.id, nextImportId(run.id, "test-run", storyTestRunIds));
  });
  const importedStoryTestRuns = importedStoryTestRunCandidates.map((run) => {
    const nodeIdMap = storyNodeIdMaps.get(run.sceneId);
    const choiceIdMap = storyChoiceIdMaps.get(run.sceneId);
    const remapNodeIds = (ids: string[]) => ids.map((id) => nodeIdMap?.get(id) ?? id);
    const remapChoiceIds = (ids: string[]) => ids.map((id) => choiceIdMap?.get(id) ?? id);
    const worldId = worldIdMap.get(run.worldId) as string;
    return normalizeStoryTestRun(
      {
        ...run,
        id: storyTestRunIdMap.get(run.id) as string,
        worldId,
        presetId: storyTestPresetIdMap.get(run.presetId) ?? run.presetId,
        sceneId: storySceneIdMap.get(run.sceneId) ?? run.sceneId,
        nodeIds: remapNodeIds(run.nodeIds),
        choiceIds: remapChoiceIds(run.choiceIds),
        endingNodeId: nodeIdMap?.get(run.endingNodeId) ?? run.endingNodeId,
        initialState: remapStoryState(run.initialState),
        finalState: remapStoryState(run.finalState),
        coverage: {
          ...run.coverage,
          nodeIds: remapNodeIds(run.coverage.nodeIds),
          coveredNodeIds: remapNodeIds(run.coverage.coveredNodeIds),
          choiceIds: remapChoiceIds(run.coverage.choiceIds),
          coveredChoiceIds: remapChoiceIds(run.coverage.coveredChoiceIds),
          endingNodeIds: remapNodeIds(run.coverage.endingNodeIds),
          coveredEndingNodeIds: remapNodeIds(run.coverage.coveredEndingNodeIds)
        }
      },
      worldId
    );
  });
  const importedStoryReviewIssueCandidates = imported.storyReviewIssues.filter((issue) =>
    worldIdMap.has(issue.worldId)
  );
  importedStoryReviewIssueCandidates.forEach((issue) => {
    storyReviewIssueIdMap.set(
      issue.id,
      nextImportId(issue.id, "review-issue", storyReviewIssueIds)
    );
  });
  const importedStoryReviewIssues = importedStoryReviewIssueCandidates
    .map((issue) => {
      const nodeIdMap = storyNodeIdMaps.get(issue.sceneId);
      const worldId = worldIdMap.get(issue.worldId) as string;
      return normalizeStoryReviewIssue(
        {
          ...issue,
          id: storyReviewIssueIdMap.get(issue.id) as string,
          worldId,
          presetId: storyTestPresetIdMap.get(issue.presetId) ?? issue.presetId,
          runId: storyTestRunIdMap.get(issue.runId) ?? issue.runId,
          sceneId: storySceneIdMap.get(issue.sceneId) ?? issue.sceneId,
          nodeId: nodeIdMap?.get(issue.nodeId) ?? issue.nodeId,
          entityId: entityIdMap.get(issue.entityId) ?? issue.entityId,
          questId: questIdMap.get(issue.questId) ?? issue.questId,
          consistencyFindingId:
            consistencyFindingIdMap.get(issue.consistencyFindingId) ??
            issue.consistencyFindingId
        },
        worldId
      );
    });
  const importedMarkerCandidates = imported.mapMarkers.filter((marker) =>
    mapIdMap.has(marker.mapId)
  );
  importedMarkerCandidates.forEach((marker) => {
    markerIdMap.set(marker.id, nextImportId(marker.id, "marker", markerIds));
  });
  const importedMapMarkers = importedMarkerCandidates.map((marker) =>
    normalizeMapMarker({
      ...marker,
      id: markerIdMap.get(marker.id) as string,
      mapId: mapIdMap.get(marker.mapId) as string,
      layerId: mapLayerIdMap.get(marker.layerId) ?? "",
      groupId: mapMarkerGroupIdMap.get(marker.groupId) ?? "",
      entityId: entityIdMap.get(marker.entityId) ?? "",
      questId: questIdMap.get(marker.questId) ?? "",
      sceneId: storySceneIdMap.get(marker.sceneId) ?? ""
    })
  );
  const importedMapRouteCandidates = imported.mapRoutes.filter(
    (route) => worldIdMap.has(route.worldId) && mapIdMap.has(route.mapId)
  );
  importedMapRouteCandidates.forEach((route) => {
    mapRouteIdMap.set(
      route.id,
      nextImportId(route.id, "map-route", mapRouteIds)
    );
  });
  const importedMapRoutes = importedMapRouteCandidates.map((route, index) =>
      normalizeMapRoute(
        {
          ...route,
          id: mapRouteIdMap.get(route.id) as string,
          worldId: worldIdMap.get(route.worldId) as string,
          mapId: mapIdMap.get(route.mapId) as string,
          stops: route.stops.map((stop) => ({
            ...stop,
            markerId: markerIdMap.get(stop.markerId) ?? stop.markerId
          }))
        },
        worldIdMap.get(route.worldId) as string,
        mapIdMap.get(route.mapId) as string,
        index + 1
      )
    );
  const importedTimelineCandidates = imported.timelineEvents.filter((item) =>
    worldIdMap.has(item.worldId)
  );
  importedTimelineCandidates.forEach((item) => {
    timelineIdMap.set(item.id, nextImportId(item.id, "timeline", timelineIds));
  });
  const importedTimelineEvents = importedTimelineCandidates.map((item, index) => {
    const worldId = worldIdMap.get(item.worldId) as string;
    const fallbackTrack = importedTimelineTracks.find((track) => track.worldId === worldId);
    return normalizeTimelineEvent(
      {
        ...item,
        id: timelineIdMap.get(item.id) as string,
        worldId,
        entityId: entityIdMap.get(item.entityId) ?? "",
        questId: questIdMap.get(item.questId) ?? "",
        sceneId: storySceneIdMap.get(item.sceneId) ?? "",
        trackId: timelineTrackIdMap.get(item.trackId) ?? fallbackTrack?.id ?? "",
        dependencyIds: item.dependencyIds.map(
          (dependencyId) => timelineIdMap.get(dependencyId) ?? dependencyId
        )
      },
      worldId,
      fallbackTrack?.id ?? "",
      index + 1
    );
  });
  const importedRelationCandidates = imported.relations.filter(
      (relation) =>
        worldIdMap.has(relation.worldId) &&
        entityIdMap.has(relation.sourceEntityId) &&
        entityIdMap.has(relation.targetEntityId)
    );
  importedRelationCandidates.forEach((relation) => {
    relationIdMap.set(
      relation.id,
      nextImportId(relation.id, "relation", relationIds)
    );
  });
  const importedRelations = importedRelationCandidates.map((relation) => ({
      ...relation,
      id: relationIdMap.get(relation.id) as string,
      worldId: worldIdMap.get(relation.worldId) as string,
      sourceEntityId: entityIdMap.get(relation.sourceEntityId) as string,
      targetEntityId: entityIdMap.get(relation.targetEntityId) as string
    }));
  const importedAssetCandidates = imported.assets.filter((asset) =>
    worldIdMap.has(asset.worldId)
  );
  importedAssetCandidates.forEach((asset) => {
    assetIdMap.set(asset.id, nextImportId(asset.id, "asset", assetIds));
  });
  const importedAssets = importedAssetCandidates.map((asset) => ({
      ...asset,
      id: assetIdMap.get(asset.id) as string,
      worldId: worldIdMap.get(asset.worldId) as string,
      linkedEntityIds: asset.linkedEntityIds
        .map((id) => entityIdMap.get(id))
        .filter((id): id is string => Boolean(id))
    }));
  importedStoryScenes = importedStoryScenes.map((scene) => ({
    ...scene,
    nodes: scene.nodes.map((node) => ({
      ...node,
      mediaAssetId: assetIdMap.get(node.mediaAssetId) ?? ""
    }))
  }));
  const importedNarrativeMilestones = imported.narrativeMilestones
    .filter((milestone) => worldIdMap.has(milestone.worldId))
    .map((milestone, index) => {
      const worldId = worldIdMap.get(milestone.worldId) as string;
      return normalizeNarrativeMilestone(
        {
          ...milestone,
          id: narrativeMilestoneIdMap.get(milestone.id) as string,
          worldId,
          dependencyIds: milestone.dependencyIds
            .map((id) => narrativeMilestoneIdMap.get(id))
            .filter((id): id is string => Boolean(id)),
          linkedQuestIds: milestone.linkedQuestIds
            .map((id) => questIdMap.get(id))
            .filter((id): id is string => Boolean(id)),
          linkedSceneIds: milestone.linkedSceneIds
            .map((id) => storySceneIdMap.get(id))
            .filter((id): id is string => Boolean(id)),
          linkedEntityIds: milestone.linkedEntityIds
            .map((id) => entityIdMap.get(id))
            .filter((id): id is string => Boolean(id)),
          linkedTimelineEventIds: milestone.linkedTimelineEventIds
            .map((id) => timelineIdMap.get(id))
            .filter((id): id is string => Boolean(id)),
          linkedMapMarkerIds: milestone.linkedMapMarkerIds
            .map((id) => markerIdMap.get(id))
            .filter((id): id is string => Boolean(id)),
          linkedReviewIssueIds: milestone.linkedReviewIssueIds
            .map((id) => storyReviewIssueIdMap.get(id))
            .filter((id): id is string => Boolean(id))
        },
        worldId,
        index
      );
    });
  const importedManuscriptBooks = imported.manuscriptBooks
    .filter((book) => manuscriptBookIdMap.has(book.id))
    .map((book, index) => {
      const worldId = worldIdMap.get(book.worldId) as string;
      return normalizeManuscriptBook(
        { ...book, id: manuscriptBookIdMap.get(book.id) as string, worldId },
        worldId,
        index
      );
    });
  const importedManuscriptVolumes = imported.manuscriptVolumes
    .filter((volume) => manuscriptVolumeIdMap.has(volume.id))
    .map((volume, index) => {
      const worldId = worldIdMap.get(volume.worldId) as string;
      const bookId = manuscriptBookIdMap.get(volume.bookId) as string;
      return normalizeManuscriptVolume(
        {
          ...volume,
          id: manuscriptVolumeIdMap.get(volume.id) as string,
          worldId,
          bookId
        },
        worldId,
        bookId,
        index
      );
    });
  const importedManuscriptChapters = imported.manuscriptChapters
    .filter((chapter) => manuscriptChapterIdMap.has(chapter.id))
    .map((chapter, index) => {
      const worldId = worldIdMap.get(chapter.worldId) as string;
      const bookId = manuscriptBookIdMap.get(chapter.bookId) as string;
      const volumeId = manuscriptVolumeIdMap.get(chapter.volumeId) as string;
      return normalizeManuscriptChapter(
        {
          ...chapter,
          id: manuscriptChapterIdMap.get(chapter.id) as string,
          worldId,
          bookId,
          volumeId,
          viewpointEntityId:
            entityIdMap.get(chapter.viewpointEntityId) ?? chapter.viewpointEntityId,
          linkedNarrativeMilestoneId:
            narrativeMilestoneIdMap.get(chapter.linkedNarrativeMilestoneId) ?? "",
          linkedStorySceneIds: chapter.linkedStorySceneIds
            .map((id) => storySceneIdMap.get(id))
            .filter((id): id is string => Boolean(id))
        },
        worldId,
        bookId,
        volumeId,
        index
      );
    });
  const importedManuscriptChapterById = new globalThis.Map(
    importedManuscriptChapters.map((chapter) => [chapter.id, chapter])
  );
  const importedManuscriptScenes = imported.manuscriptScenes
    .filter((scene) => manuscriptSceneIdMap.has(scene.id))
    .map((scene, index) => {
      const chapterId = manuscriptChapterIdMap.get(scene.chapterId) as string;
      const chapter = importedManuscriptChapterById.get(chapterId) as ManuscriptChapter;
      return normalizeManuscriptScene(
        {
          ...scene,
          id: manuscriptSceneIdMap.get(scene.id) as string,
          chapterId,
          viewpointEntityId: entityIdMap.get(scene.viewpointEntityId) ?? scene.viewpointEntityId,
          locationEntityId: entityIdMap.get(scene.locationEntityId) ?? scene.locationEntityId,
          relatedEntityIds: scene.relatedEntityIds
            .map((id) => entityIdMap.get(id))
            .filter((id): id is string => Boolean(id)),
          linkedStorySceneId: storySceneIdMap.get(scene.linkedStorySceneId) ?? ""
        },
        chapter,
        index
      );
    });
  const remapManuscriptUnitId = (
    kind: "chapter" | "scene",
    id: string
  ) => (kind === "scene" ? manuscriptSceneIdMap.get(id) : manuscriptChapterIdMap.get(id)) ?? "";
  const importedManuscriptClues = imported.manuscriptClues
    .filter((clue) => manuscriptClueIdMap.has(clue.id))
    .map((clue, index) => {
      const worldId = worldIdMap.get(clue.worldId) as string;
      const bookId = manuscriptBookIdMap.get(clue.bookId) as string;
      return normalizeManuscriptClue(
        {
          ...clue,
          id: manuscriptClueIdMap.get(clue.id) as string,
          worldId,
          bookId,
          setupUnitId: remapManuscriptUnitId(clue.setupUnitKind, clue.setupUnitId),
          payoffUnitId: remapManuscriptUnitId(clue.payoffUnitKind, clue.payoffUnitId),
          relatedEntityIds: clue.relatedEntityIds
            .map((id) => entityIdMap.get(id))
            .filter((id): id is string => Boolean(id))
        },
        worldId,
        bookId,
        index
      );
    });
  const importedManuscriptKnowledgeStates = imported.manuscriptKnowledgeStates
    .filter((item) => manuscriptKnowledgeIdMap.has(item.id))
    .map((item, index) => {
      const worldId = worldIdMap.get(item.worldId) as string;
      const bookId = manuscriptBookIdMap.get(item.bookId) as string;
      return normalizeManuscriptKnowledgeState(
        {
          ...item,
          id: manuscriptKnowledgeIdMap.get(item.id) as string,
          worldId,
          bookId,
          characterId: entityIdMap.get(item.characterId) ?? item.characterId,
          unitId: remapManuscriptUnitId(item.unitKind, item.unitId)
        },
        worldId,
        bookId,
        index
      );
    });
  const importedConsistencySettings = imported.consistencySettings
    .filter((settings) => worldIdMap.has(settings.worldId))
    .map((settings) => {
      const worldId = worldIdMap.get(settings.worldId) as string;
      return normalizeConsistencySettings({ ...settings, worldId, id: "" }, worldId);
    });
  const importedConsistencyModelSettings = imported.consistencyModelSettings
    .filter((settings) => worldIdMap.has(settings.worldId))
    .map((settings) => {
      const worldId = worldIdMap.get(settings.worldId) as string;
      return normalizeConsistencyModelSettings({ ...settings, worldId, id: "" }, worldId);
    });
  const remapAiContextId = (value: string) => {
    const separator = value.indexOf(":");
    if (separator < 0) return value;
    const kind = value.slice(0, separator);
    const id = value.slice(separator + 1);
    const mapping =
      kind === "world"
        ? worldIdMap
        : kind === "entity"
          ? entityIdMap
          : kind === "quest"
            ? questIdMap
            : kind === "scene"
              ? storySceneIdMap
              : kind === "manuscript-book"
                ? manuscriptBookIdMap
                : kind === "manuscript-volume"
                  ? manuscriptVolumeIdMap
                  : kind === "manuscript-chapter"
                    ? manuscriptChapterIdMap
                    : kind === "manuscript-scene"
                      ? manuscriptSceneIdMap
              : null;
    return mapping?.get(id) ? `${kind}:${mapping.get(id)}` : value;
  };
  const importedAiMemoryItems = imported.aiMemoryItems
    .filter((item) => worldIdMap.has(item.worldId))
    .map((item, index) => {
      const worldId = worldIdMap.get(item.worldId) as string;
      return normalizeAiMemoryItem(
        {
          ...item,
          id: createId("ai-memory"),
          worldId,
          sourceContextId: remapAiContextId(item.sourceContextId)
        },
        worldId,
        index
      );
    });
  const importedAiWritingSessions = imported.aiWritingSessions
    .filter((session) => worldIdMap.has(session.worldId))
    .map((session, index) => {
      const worldId = worldIdMap.get(session.worldId) as string;
      return normalizeAiWritingSession(
        {
          ...session,
          id: createId("ai-writing"),
          worldId,
          targetContextId: remapAiContextId(session.targetContextId)
        },
        worldId,
        index
      );
    });
  const targetIdMaps: Partial<
    Record<ConsistencyTarget["type"], globalThis.Map<string, string>>
  > = {
    world: worldIdMap,
    entity: entityIdMap,
    quest: questIdMap,
    scene: storySceneIdMap,
    variable: storyVariableIdMap,
    map: mapIdMap,
    marker: markerIdMap,
    route: mapRouteIdMap,
    track: timelineTrackIdMap,
    timeline: timelineIdMap,
    relation: relationIdMap,
    asset: assetIdMap,
    "manuscript-book": manuscriptBookIdMap,
    "manuscript-chapter": manuscriptChapterIdMap,
    "manuscript-scene": manuscriptSceneIdMap,
    "manuscript-clue": manuscriptClueIdMap,
    "manuscript-knowledge": manuscriptKnowledgeIdMap
  };
  const aiOperationTargetIdMaps: Record<
    AiOperationTarget,
    globalThis.Map<string, string>
  > = {
    world: worldIdMap,
    "codex-category": codexCategoryIdMap,
    "entity-template": entityTemplateIdMap,
    entity: entityIdMap,
    quest: questIdMap,
    "story-variable": storyVariableIdMap,
    "story-scene": storySceneIdMap,
    "story-test-preset": storyTestPresetIdMap,
    "story-review-issue": storyReviewIssueIdMap,
    relation: relationIdMap,
    asset: assetIdMap,
    member: memberIdMap,
    map: mapIdMap,
    "map-layer": mapLayerIdMap,
    "map-marker-group": mapMarkerGroupIdMap,
    "map-marker": markerIdMap,
    "map-route": mapRouteIdMap,
    "narrative-milestone": narrativeMilestoneIdMap,
    "manuscript-book": manuscriptBookIdMap,
    "manuscript-volume": manuscriptVolumeIdMap,
    "manuscript-chapter": manuscriptChapterIdMap,
    "manuscript-scene": manuscriptSceneIdMap,
    "timeline-track": timelineTrackIdMap,
    "timeline-event": timelineIdMap
  };
  const remapAiOperationItemId = (target: AiOperationTarget, itemId: string) =>
    aiOperationTargetIdMaps[target].get(itemId) ?? itemId;
  const importedAiOperationRuns = imported.aiOperationRuns
    .filter((run) => worldIdMap.has(run.worldId))
    .map((run, index) => {
      const worldId = worldIdMap.get(run.worldId) as string;
      return normalizeAiOperationRun(
        {
          ...run,
          id: createId("ai-operation-run"),
          worldId,
          status: "archived",
          operations: run.operations.map((operation) => ({
            ...operation,
            targetId: remapAiOperationItemId(operation.target, operation.targetId)
          })),
          changes: run.changes.map((change) => ({
            ...change,
            itemId: remapAiOperationItemId(change.target, change.itemId)
          })),
          updatedAt: new Date().toISOString(),
          undoneAt: ""
        },
        worldId,
        index
      );
    });
  const remapConsistencyTarget = (target: ConsistencyTarget): ConsistencyTarget => ({
    ...target,
    id: targetIdMaps[target.type]?.get(target.id) ?? target.id
  });
  const remapConsistencyFingerprint = (fingerprint: string) => {
    const replacements = Object.values(targetIdMaps)
      .flatMap((mapping) => (mapping ? Array.from(mapping.entries()) : []))
      .filter(([from, to]) => from && from !== to)
      .sort((left, right) => right[0].length - left[0].length);
    return replacements.reduce(
      (value, [from, to]) => value.split(from).join(to),
      fingerprint
    );
  };
  const importedConsistencyFindings = imported.consistencyFindings
    .filter((finding) => worldIdMap.has(finding.worldId))
    .map((finding) => {
      const worldId = worldIdMap.get(finding.worldId) as string;
      return normalizeConsistencyFinding(
        {
          ...finding,
          id: consistencyFindingIdMap.get(finding.id) as string,
          worldId,
          fingerprint: remapConsistencyFingerprint(finding.fingerprint),
          primaryTarget: remapConsistencyTarget(finding.primaryTarget),
          relatedTargets: finding.relatedTargets.map(remapConsistencyTarget),
          evidence: finding.evidence.map((evidence) => ({
            ...evidence,
            target: evidence.target
              ? remapConsistencyTarget(evidence.target)
              : undefined
          })),
          lastDetectedScanId:
            consistencyScanIdMap.get(finding.lastDetectedScanId) ?? ""
        },
        worldId
      );
    });
  const remapFindingIds = (ids: string[]) =>
    ids
      .map((id) => consistencyFindingIdMap.get(id))
      .filter((id): id is string => Boolean(id));
  const importedConsistencyScans = imported.consistencyScans
    .filter((scan) => worldIdMap.has(scan.worldId))
    .map((scan) => {
      const worldId = worldIdMap.get(scan.worldId) as string;
      return normalizeConsistencyScan(
        {
          ...scan,
          id: consistencyScanIdMap.get(scan.id) as string,
          worldId,
          newFindingIds: remapFindingIds(scan.newFindingIds),
          resolvedFindingIds: remapFindingIds(scan.resolvedFindingIds),
          reopenedFindingIds: remapFindingIds(scan.reopenedFindingIds),
          activeFindingIds: remapFindingIds(scan.activeFindingIds)
        },
        worldId
      );
    });

  const projectReferenceIdMaps: Record<
    ProjectObjectKind,
    globalThis.Map<string, string>
  > = {
    world: worldIdMap,
    entity: entityIdMap,
    quest: questIdMap,
    scene: storySceneIdMap,
    "story-variable": storyVariableIdMap,
    "timeline-event": timelineIdMap,
    "timeline-track": timelineTrackIdMap,
    map: mapIdMap,
    "map-marker": markerIdMap,
    "map-route": mapRouteIdMap,
    asset: assetIdMap,
    milestone: narrativeMilestoneIdMap,
    "manuscript-book": manuscriptBookIdMap,
    "manuscript-volume": manuscriptVolumeIdMap,
    "manuscript-chapter": manuscriptChapterIdMap,
    "manuscript-scene": manuscriptSceneIdMap,
    "review-issue": storyReviewIssueIdMap,
    relation: relationIdMap
  };
  const remapProjectObjectRef = (
    reference: ProjectObjectRef
  ): ProjectObjectRef => ({
    ...reference,
    id: projectReferenceIdMaps[reference.kind].get(reference.id) ?? reference.id
  });
  const remappedImportedMapMarkers = importedMapMarkers.map((marker) => ({
    ...marker,
    references: normalizeProjectObjectRefs(
      marker.references.map(remapProjectObjectRef)
    )
  }));
  const remappedImportedMaps = importedMaps.map((mapItem) => ({
    ...mapItem,
    regions: mapItem.regions.map((region) => ({
      ...region,
      references: normalizeProjectObjectRefs(
        region.references.map(remapProjectObjectRef)
      )
    })),
    storyPhases: mapItem.storyPhases.map((phase) => ({
      ...phase,
      timelineEventId: timelineIdMap.get(phase.timelineEventId) ?? phase.timelineEventId,
      hiddenLayerIds: phase.hiddenLayerIds.map((id) => mapLayerIdMap.get(id) ?? id),
      hiddenGroupIds: phase.hiddenGroupIds.map((id) => mapMarkerGroupIdMap.get(id) ?? id),
      hiddenMarkerIds: phase.hiddenMarkerIds.map((id) => markerIdMap.get(id) ?? id),
      hiddenRouteIds: phase.hiddenRouteIds.map((id) => mapRouteIdMap.get(id) ?? id)
    })),
    savedFilters: mapItem.savedFilters.map((filter) => ({
      ...filter,
      layerIds: filter.layerIds.map((id) => mapLayerIdMap.get(id) ?? id),
      groupIds: filter.groupIds.map((id) => mapMarkerGroupIdMap.get(id) ?? id)
    }))
  }));
  const remappedImportedMapRoutes = importedMapRoutes.map((route) => ({
    ...route,
    references: normalizeProjectObjectRefs(
      route.references.map(remapProjectObjectRef)
    )
  }));
  const remappedImportedTimelineEvents = importedTimelineEvents.map((timelineEvent) => ({
    ...timelineEvent,
    references: normalizeProjectObjectRefs(
      timelineEvent.references.map(remapProjectObjectRef)
    )
  }));
  const remappedImportedManuscriptChapters = importedManuscriptChapters.map((chapter) => ({
    ...chapter,
    references: normalizeProjectObjectRefs(chapter.references.map(remapProjectObjectRef))
  }));
  const remappedImportedManuscriptScenes = importedManuscriptScenes.map((scene) => ({
    ...scene,
    references: normalizeProjectObjectRefs(scene.references.map(remapProjectObjectRef))
  }));
  const remappedImportedWorlds = importedWorlds.map((world, index) => {
    const sourceWiki = normalizeWorldWikiSettings(imported.worlds[index]?.wiki);
    return {
      ...world,
      wiki: normalizeWorldWikiSettings({
        ...sourceWiki,
        coverAssetId: assetIdMap.get(sourceWiki.coverAssetId) ?? "",
        navigationCategoryIds: sourceWiki.navigationCategoryIds
          .map((id) => codexCategoryIdMap.get(id))
          .filter((id): id is string => Boolean(id)),
        featuredEntityIds: sourceWiki.featuredEntityIds
          .map((id) => entityIdMap.get(id))
          .filter((id): id is string => Boolean(id)),
        defaultMapId: mapIdMap.get(sourceWiki.defaultMapId) ?? "",
        publishedMapIds: sourceWiki.publishedMapIds
          .map((id) => mapIdMap.get(id))
          .filter((id): id is string => Boolean(id)),
        publishedTimelineTrackIds: sourceWiki.publishedTimelineTrackIds
          .map((id) => timelineTrackIdMap.get(id))
          .filter((id): id is string => Boolean(id)),
        publishedQuestIds: sourceWiki.publishedQuestIds
          .map((id) => questIdMap.get(id))
          .filter((id): id is string => Boolean(id))
      })
    };
  });

  return {
    worlds: [...current.worlds, ...remappedImportedWorlds],
    entityTemplates: [...current.entityTemplates, ...importedEntityTemplates],
    codexCategories: [...current.codexCategories, ...importedCodexCategories],
    entities: [...current.entities, ...importedEntities],
    maps: [...current.maps, ...remappedImportedMaps],
    mapLayers: [...current.mapLayers, ...importedMapLayers],
    mapMarkerGroups: [...current.mapMarkerGroups, ...importedMapMarkerGroups],
    mapMarkers: [...current.mapMarkers, ...remappedImportedMapMarkers],
    mapRoutes: [...current.mapRoutes, ...remappedImportedMapRoutes],
    timelineTracks: [...current.timelineTracks, ...importedTimelineTracks],
    timelineEvents: [...current.timelineEvents, ...remappedImportedTimelineEvents],
    quests: [...current.quests, ...importedQuests],
    storyVariables: [...current.storyVariables, ...importedStoryVariables],
    storyScenes: [...current.storyScenes, ...importedStoryScenes],
    storyTestPresets: [...current.storyTestPresets, ...importedStoryTestPresets],
    storyTestRuns: [...current.storyTestRuns, ...importedStoryTestRuns],
    storyReviewIssues: [...current.storyReviewIssues, ...importedStoryReviewIssues],
    narrativeMilestones: [...current.narrativeMilestones, ...importedNarrativeMilestones],
    manuscriptBooks: [...current.manuscriptBooks, ...importedManuscriptBooks],
    manuscriptVolumes: [...current.manuscriptVolumes, ...importedManuscriptVolumes],
    manuscriptChapters: [
      ...current.manuscriptChapters,
      ...remappedImportedManuscriptChapters
    ],
    manuscriptScenes: [...current.manuscriptScenes, ...remappedImportedManuscriptScenes],
    manuscriptClues: [...current.manuscriptClues, ...importedManuscriptClues],
    manuscriptKnowledgeStates: [
      ...current.manuscriptKnowledgeStates,
      ...importedManuscriptKnowledgeStates
    ],
    consistencyFindings: [...current.consistencyFindings, ...importedConsistencyFindings],
    consistencyScans: [...current.consistencyScans, ...importedConsistencyScans],
    consistencySettings: [...current.consistencySettings, ...importedConsistencySettings],
    consistencyModelSettings: [
      ...current.consistencyModelSettings,
      ...importedConsistencyModelSettings
    ],
    aiMemoryItems: [...current.aiMemoryItems, ...importedAiMemoryItems],
    aiWritingSessions: [...current.aiWritingSessions, ...importedAiWritingSessions],
    aiOperationRuns: [...current.aiOperationRuns, ...importedAiOperationRuns],
    relations: [...current.relations, ...importedRelations],
    assets: [...current.assets, ...importedAssets],
    members: [
      ...current.members,
      ...imported.members
        .filter((member) => worldIdMap.has(member.worldId))
        .map((member) => ({
          ...member,
          id: memberIdMap.get(member.id) as string,
          worldId: worldIdMap.get(member.worldId) as string
        }))
    ]
  };
}

function getQuestText(quest: QuestLine) {
  return [
    quest.title,
    quest.summary,
    quest.trigger,
    quest.developerNotes,
    quest.steps
      .map((step) =>
        [
          step.title,
          step.objective,
          step.condition,
          step.branch,
          step.failure,
          step.reward,
          step.notes
        ].join(" ")
      )
      .join(" ")
  ].join(" ");
}

function resolveQuestEntities(quest: QuestLine, entities: Entity[]) {
  const mentionedTitles = extractMentions(getQuestText(quest));
  const directIds = new Set(quest.relatedEntityIds);
  mentionedTitles.forEach((title) => {
    const entity = entities.find((item) => normalize(item.title) === normalize(title));
    if (entity) {
      directIds.add(entity.id);
    }
  });

  return Array.from(directIds)
    .map((id) => entities.find((entity) => entity.id === id))
    .filter((entity): entity is Entity => Boolean(entity));
}

function buildWorldExport(world: World, source: WorkspaceData) {
  const entities = source.entities.filter((entity) => entity.worldId === world.id);
  const quests = source.quests.filter((quest) => quest.worldId === world.id);
  const storyVariables = source.storyVariables.filter(
    (variable) => variable.worldId === world.id
  );
  const storyScenes = source.storyScenes.filter((scene) => scene.worldId === world.id);
  const storyTestPresets = source.storyTestPresets.filter(
    (preset) => preset.worldId === world.id
  );
  const storyTestRuns = source.storyTestRuns.filter((run) => run.worldId === world.id);
  const storyReviewIssues = source.storyReviewIssues.filter(
    (issue) => issue.worldId === world.id
  );
  const maps = source.maps.filter((mapItem) => mapItem.worldId === world.id);
  const mapIds = new Set(maps.map((mapItem) => mapItem.id));

  const payload = {
    exportedAt: new Date().toISOString(),
    world,
    entityTemplates: source.entityTemplates.filter((template) => template.worldId === world.id),
    codexCategories: source.codexCategories.filter(
      (category) => category.worldId === world.id
    ),
    entities,
    quests: quests.map((quest) => ({
      ...quest,
      relatedEntities: resolveQuestEntities(quest, entities).map((entity) => ({
        id: entity.id,
        type: entity.type,
        title: entity.title
      })),
      prerequisites: quest.prerequisiteQuestIds
        .map((id) => quests.find((item) => item.id === id))
        .filter((item): item is QuestLine => Boolean(item))
        .map((item) => ({ id: item.id, title: item.title }))
    })),
    storyVariables,
    storyScenes,
    storyTestPresets,
    storyTestRuns,
    storyReviewIssues,
    narrativeMilestones: source.narrativeMilestones.filter(
      (milestone) => milestone.worldId === world.id
    ),
    manuscriptBooks: source.manuscriptBooks.filter((book) => book.worldId === world.id),
    manuscriptVolumes: source.manuscriptVolumes.filter(
      (volume) => volume.worldId === world.id
    ),
    manuscriptChapters: source.manuscriptChapters.filter(
      (chapter) => chapter.worldId === world.id
    ),
    manuscriptScenes: source.manuscriptScenes.filter((scene) => scene.worldId === world.id),
    manuscriptClues: source.manuscriptClues.filter((clue) => clue.worldId === world.id),
    manuscriptKnowledgeStates: source.manuscriptKnowledgeStates.filter(
      (item) => item.worldId === world.id
    ),
    consistencyFindings: source.consistencyFindings.filter(
      (finding) => finding.worldId === world.id
    ),
    consistencyScans: source.consistencyScans.filter((scan) => scan.worldId === world.id),
    consistencySettings: source.consistencySettings.filter(
      (settings) => settings.worldId === world.id
    ),
    consistencyModelSettings: source.consistencyModelSettings.filter(
      (settings) => settings.worldId === world.id
    ),
    aiMemoryItems: source.aiMemoryItems.filter((item) => item.worldId === world.id),
    aiWritingSessions: source.aiWritingSessions.filter(
      (session) => session.worldId === world.id
    ),
    aiOperationRuns: source.aiOperationRuns.filter((run) => run.worldId === world.id),
    timelineTracks: source.timelineTracks.filter((track) => track.worldId === world.id),
    timelineEvents: source.timelineEvents.filter((item) => item.worldId === world.id),
    relations: source.relations
      .filter((relation) => relation.worldId === world.id)
      .map((relation) => ({
        ...relation,
        sourceEntity: entities.find((entity) => entity.id === relation.sourceEntityId) ?? null,
        targetEntity: entities.find((entity) => entity.id === relation.targetEntityId) ?? null
      })),
    assets: source.assets.filter((asset) => asset.worldId === world.id),
    maps,
    mapLayers: source.mapLayers.filter((layer) => mapIds.has(layer.mapId)),
    mapMarkerGroups: source.mapMarkerGroups.filter((group) => mapIds.has(group.mapId)),
    mapMarkers: source.mapMarkers.filter((marker) => mapIds.has(marker.mapId)),
    mapRoutes: source.mapRoutes.filter((route) => route.worldId === world.id),
    members: source.members.filter((member) => member.worldId === world.id)
  };
  return sanitizePublicationPayload(payload);
}

function buildMarkdownExport(world: World, source: WorkspaceData) {
  const payload = buildWorldExport(world, source);
  const templateSections = payload.entityTemplates
    .map(
      (template) => `## ${template.name}

- 适用类型：${template.entityTypes.map((type) => templateEntityTypeLabels[type]).join("、")}
- 模板性质：${template.builtIn ? "默认" : "自定义"}
- 使用条目：${payload.entities.filter((entity) => resolveEntityTemplate(payload.entityTemplates, entity)?.id === template.id).length}

${template.description || "暂无说明"}

${template.fields.map((field, index) => `${index + 1}. ${field.label}（${field.key} · ${entityTemplateFieldTypeLabels[field.type]}${field.required ? " · 必填" : ""}${field.secret ? " · 秘密" : ""}）`).join("\n") || "- 暂无字段"}
`
    )
    .join("\n");
  const entitySections = payload.entities
    .map(
      (entity) => `## ${entity.title}

- 类型：${entityTypeMeta[entity.type].label}
- 可见性：${visibilityMeta[entity.visibility].label}
- 摘要：${entity.summary || "无"}
- 标签：${entity.tags.join("、") || "无"}

${entity.content || "暂无正文"}
`
    )
    .join("\n");

  const questSections = payload.quests
    .map(
      (quest) => `## ${quest.title}

- 分类：${questCategoryMeta[quest.category].label}
- 状态：${questStatusMeta[quest.status].label}
- 触发条件：${quest.trigger || "未设置"}
- 相关条目：${quest.relatedEntities.map((entity) => entity.title).join("、") || "无"}
- 前置任务：${quest.prerequisites.map((item) => item.title).join("、") || "无"}

${quest.summary || "暂无简介"}

${quest.steps
  .map(
    (step, index) => `### ${index + 1}. ${step.title}

- 目标：${step.objective || "未设置"}
- 条件：${step.condition || "未设置"}
- 分支：${step.branch || "未设置"}
- 失败分支：${step.failure || "未设置"}
- 奖励：${step.reward || "未设置"}
- 开发备注：${step.notes || "无"}`
  )
  .join("\n\n")}

> 开发者备注：${quest.developerNotes || "无"}
`
    )
    .join("\n");
  const relationSections = payload.relations
    .filter((relation) => relation.sourceEntity && relation.targetEntity)
    .map(
      (relation) => `## ${relation.sourceEntity?.title} ${
        relation.direction === "directed" ? "→" : "↔"
      } ${relation.targetEntity?.title}

- 类型：${relationKindMeta[relation.kind].label}
- 标签：${relation.label}
- 方向：${relation.direction === "directed" ? "单向" : relation.direction === "mutual" ? "互向" : "双向"}
- 强度：${relation.strength}
- 证据类型：${relationEvidenceTypeMeta[relation.evidenceType ?? "unspecified"]}
- 原典出处：${relation.sourceCitation || "未填写"}
- 适用年代：${relation.historicalScope || "未填写"}
- 可信度：${relationConfidenceMeta[relation.confidence ?? "unspecified"]}
- 备注：${relation.notes || "无"}
`
    )
    .join("\n");
  const assetSections = payload.assets
    .map(
      (asset) => `## ${asset.name}

- 分类：${assetKindMeta[asset.kind].label}
- 原始文件：${asset.originalName}
- 本地文件：${asset.storedName}
- 格式：${asset.mimeType}
- 字节数：${asset.size}
- SHA-256：${asset.contentHash || "未记录"}
- 标签：${asset.tags.join("、") || "无"}
- 关联条目：${asset.linkedEntityIds
        .map((id) => payload.entities.find((entity) => entity.id === id)?.title)
        .filter(Boolean)
        .join("、") || "无"}
- 导入时间：${asset.createdAt}
- 备注：${asset.notes || "无"}
`
    )
    .join("\n");
  const storyVariableSections = payload.storyVariables
    .map(
      (variable) => `## ${variable.name}

- 变量键：${variable.key}
- 类型：${variable.type}
- 默认值：${String(variable.defaultValue)}
- 说明：${variable.description || "无"}
`
    )
    .join("\n");
  const storySceneSections = payload.storyScenes
    .map((scene) => {
      const entry = scene.nodes.find((node) => node.id === scene.entryNodeId);
      const relatedEntities = scene.relatedEntityIds
        .map((id) => payload.entities.find((entity) => entity.id === id)?.title)
        .filter(Boolean)
        .join("、");
      const relatedQuests = scene.relatedQuestIds
        .map((id) => payload.quests.find((quest) => quest.id === id)?.title)
        .filter(Boolean)
        .join("、");
      const nodes = scene.nodes
        .map((node, index) => {
          const speaker = payload.entities.find(
            (entity) => entity.id === node.speakerEntityId
          )?.title;
          const targets = node.choices.length
            ? node.choices
                .map((choice) => {
                  const target = scene.nodes.find(
                    (item) => item.id === choice.targetNodeId
                  )?.label;
                  return `${choice.text} → ${target || "未设置"}`;
                })
                .join("；")
            : scene.nodes.find((item) => item.id === node.nextNodeId)?.label ||
              (node.isEnding ? "结局" : "未设置");
          return `### ${index + 1}. ${node.label}

- 说话者：${speaker || "旁白"}
- 舞台指示：${node.stageDirection || "无"}
- 进入条件：${node.conditions.length}
- 进入效果：${node.effects.length}
- 后续：${targets}

${node.text || "暂无对白"}`;
        })
        .join("\n\n");
      return `## ${scene.title}

- 状态：${scene.status}
- 入口节点：${entry?.label || "未设置"}
- 相关条目：${relatedEntities || "无"}
- 相关任务：${relatedQuests || "无"}
- 开发备注：${scene.notes || "无"}

${scene.summary || "暂无摘要"}

${nodes || "暂无对白节点"}
`;
    })
    .join("\n");
  const storyTestPresetSections = payload.storyTestPresets
    .map((preset) => {
      const scene = payload.storyScenes.find((item) => item.id === preset.sceneId);
      const state = Object.entries(preset.initialState)
        .map(([variableId, value]) => {
          const variable = payload.storyVariables.find((item) => item.id === variableId);
          return `${variable?.name ?? variableId}=${String(value)}`;
        })
        .join("；");
      return `## ${preset.name}

- 场景：${scene?.title ?? "失效场景"}
- 最大深度：${preset.maxDepth}
- 路径上限：${preset.maxPaths}
- 初始变量：${state || "无"}

${preset.description || "暂无说明"}
`;
    })
    .join("\n");
  const storyTestRunSections = payload.storyTestRuns
    .map((run, index) => {
      const scene = payload.storyScenes.find((item) => item.id === run.sceneId);
      const preset = payload.storyTestPresets.find((item) => item.id === run.presetId);
      return `## ${index + 1}. ${scene?.title ?? "失效场景"} · ${run.mode === "automatic" ? "自动检查" : "手动验收"}

- 状态：${run.status}
- 测试预设：${preset?.name ?? "未关联"}
- 执行时间：${run.executedAt}
- 节点覆盖：${run.coverage.coveredNodeIds.length}/${run.coverage.nodeIds.length}（${run.coverage.nodePercent}%）
- 选项覆盖：${run.coverage.coveredChoiceIds.length}/${run.coverage.choiceIds.length}（${run.coverage.choicePercent}%）
- 结局覆盖：${run.coverage.coveredEndingNodeIds.length}/${run.coverage.endingNodeIds.length}（${run.coverage.endingPercent}%）
- 备注：${run.notes || "无"}
`;
    })
    .join("\n");
  const storyReviewIssueSections = payload.storyReviewIssues
    .map((issue) => {
      const scene = payload.storyScenes.find((item) => item.id === issue.sceneId);
      const node = scene?.nodes.find((item) => item.id === issue.nodeId);
      const entity = payload.entities.find((item) => item.id === issue.entityId);
      const quest = payload.quests.find((item) => item.id === issue.questId);
      return `## ${issue.title}

- 状态：${issue.status}
- 严重程度：${issue.severity}
- 来源：${issue.source}${issue.sourceFindingKind ? ` · ${issue.sourceFindingKind}` : ""}
- 场景：${scene?.title ?? "未关联"}
- 节点：${node?.label ?? "未关联"}
- 条目：${entity?.title ?? "未关联"}
- 任务：${quest?.title ?? "未关联"}
- 更新时间：${issue.updatedAt}

${issue.detail || "暂无说明"}
`;
    })
    .join("\n");
  const mapSections = payload.maps
    .map((mapItem) => {
      const markers = payload.mapMarkers.filter((marker) => marker.mapId === mapItem.id);
      const regions = [...mapItem.regions].sort((left, right) => left.order - right.order);
      return `## ${mapItem.title}

- 尺寸：${mapItem.width} × ${mapItem.height}
- 横向跨度：${formatMapDistance(mapItem.distanceWidth, mapItem)}
- 坐标网格：${mapItem.grid.visible ? `${mapItem.grid.columns} 列${mapItem.grid.snap ? " · 已启用吸附" : ""}` : "未显示"}
- 地图图片：${mapItem.imageUrl ? "已设置" : "未设置"}
- 标记数量：${markers.length}
- 区域数量：${regions.length}

${mapItem.description || "暂无说明"}

${markers
  .map((marker) => {
    const links = [
      payload.entities.find((entity) => entity.id === marker.entityId)?.title,
      payload.quests.find((quest) => quest.id === marker.questId)?.title,
      payload.storyScenes.find((scene) => scene.id === marker.sceneId)?.title
    ].filter(Boolean);
    return `- ${marker.label}（${marker.x.toFixed(1)}%, ${marker.y.toFixed(1)}%） · ${links.join(" / ") || "未关联内容"}`;
  })
  .join("\n") || "- 暂无标记"}

### 区域与领地

${regions
  .map((region) => {
    const metrics = calculateMapRegionMetrics(region, mapItem);
    return `- ${region.title} · ${region.kind} · 覆盖 ${metrics.areaPercent}% · 周长 ${formatMapDistance(metrics.perimeter, mapItem)}${region.description ? `\n  - ${region.description}` : ""}`;
  })
  .join("\n") || "- 暂无区域"}
`;
    })
    .join("\n");
  const mapRouteSections = payload.mapRoutes
    .map((route) => {
      const mapItem = payload.maps.find((item) => item.id === route.mapId);
      const markers = payload.mapMarkers.filter((marker) => marker.mapId === route.mapId);
      const metrics = mapItem ? calculateMapRouteMetrics(route, markers, mapItem) : null;
      return `## ${route.title}

- 地图：${mapItem?.title ?? "失效地图"}
- 状态：${route.status}
- 停靠点：${route.stops.length}
- 行进方式：${mapTravelModeLabels[route.travelMode]}
- 路线距离：${metrics && mapItem ? formatMapDistance(metrics.distance, mapItem) : "无法计算"}
- 预计耗时：${metrics ? formatMapTravelTime(metrics.travelHours, route.travelHoursPerDay) : "无法计算"}

${route.description || "暂无说明"}

${route.stops
  .map((stop, index) => {
    const marker = payload.mapMarkers.find((item) => item.id === stop.markerId);
    const segment = metrics?.segments.find((item) => item.toStopId === stop.id);
    return `${index + 1}. ${stop.title} · ${marker?.label ?? "失效标记"}${segment && mapItem ? ` · 本段 ${formatMapDistance(segment.distance, mapItem)}` : ""}${stop.duration ? ` · ${stop.duration}` : ""}${stop.notes ? `\n   - ${stop.notes}` : ""}`;
  })
  .join("\n") || "- 暂无停靠点"}
`;
    })
    .join("\n");
  const timelineSections = [...payload.timelineTracks]
    .sort((left, right) => left.order - right.order)
    .map((track) => {
      const events = payload.timelineEvents
        .filter((timelineEvent) => timelineEvent.trackId === track.id)
        .sort((left, right) => left.sortOrder - right.sortOrder);
      return `## ${track.name}

- 轨道顺序：${track.order}
- 事件数量：${events.length}

${track.description || "暂无说明"}

${events
  .map((timelineEvent, index) => {
    const title =
      timelineEvent.title ||
      payload.entities.find((entity) => entity.id === timelineEvent.entityId)?.title ||
      payload.quests.find((quest) => quest.id === timelineEvent.questId)?.title ||
      payload.storyScenes.find((scene) => scene.id === timelineEvent.sceneId)?.title ||
      "未命名时间点";
    return `${index + 1}. ${timelineEvent.displayDate} · ${title}（排序 ${timelineEvent.sortOrder}）`;
  })
  .join("\n") || "- 暂无时间点"}
`;
    })
    .join("\n");
  const consistencySections = payload.consistencyFindings
    .map(
      (finding) => `## ${finding.ruleId} · ${finding.title}

- 严重程度：${finding.severity}
- 状态：${finding.status}
- 当前仍检测到：${finding.detected ? "是" : "否"}
- 主要对象：${finding.primaryTarget.label}
- 处置说明：${finding.statusReason || "无"}
- 首次发现：${finding.firstSeenAt}
- 最近发现：${finding.lastSeenAt}
- 建议：${finding.suggestion || "无"}

${finding.detail || "暂无说明"}

${finding.evidence.map((evidence) => `- 证据 · ${evidence.label}：${evidence.value}`).join("\n") || "- 暂无证据"}
`
    )
    .join("\n");
  const narrativeSections = payload.narrativeMilestones
    .sort((left, right) => left.order - right.order)
    .map(
      (milestone, index) => `## ${index + 1}. ${milestone.title}

- 幕 / 章节：${milestone.act}
- 状态：${narrativeStatusLabels[milestone.status]}
- 优先级：${narrativePriorityLabels[milestone.priority]}
- 目标日期：${milestone.targetDate || "未设置"}
- 前置里程碑：${milestone.dependencyIds
        .map((id) => payload.narrativeMilestones.find((item) => item.id === id)?.title || id)
        .join("、") || "无"}
- 关联任务：${milestone.linkedQuestIds
        .map((id) => payload.quests.find((item) => item.id === id)?.title || id)
        .join("、") || "无"}
- 关联剧情：${milestone.linkedSceneIds
        .map((id) => payload.storyScenes.find((item) => item.id === id)?.title || id)
        .join("、") || "无"}
- 阻塞原因：${milestone.blockedReason || "无"}

${milestone.summary || "暂无说明"}

### 正文

${richTextToPlainText(milestone.manuscriptBody) || "暂无正文"}

> 开发备注：${milestone.developerNotes || "无"}
`
    )
    .join("\n");
  const storyMachineData = JSON.stringify(
    {
      version: 2,
      storyVariables: payload.storyVariables,
      storyScenes: payload.storyScenes,
      storyTestPresets: payload.storyTestPresets,
      storyTestRuns: payload.storyTestRuns,
      storyReviewIssues: payload.storyReviewIssues,
      entityTitles: Object.fromEntries(
        payload.entities.map((entity) => [entity.id, entity.title])
      ),
      questTitles: Object.fromEntries(payload.quests.map((quest) => [quest.id, quest.title])),
      assetNames: Object.fromEntries(payload.assets.map((asset) => [asset.id, asset.name]))
    },
    null,
    2
  );
  const planningMachineData = JSON.stringify(
    {
      version: 2,
      maps: payload.maps,
      mapLayers: payload.mapLayers,
      mapMarkerGroups: payload.mapMarkerGroups,
      mapMarkers: payload.mapMarkers,
      mapRoutes: payload.mapRoutes,
      timelineTracks: payload.timelineTracks,
      timelineEvents: payload.timelineEvents,
      entityTitles: Object.fromEntries(
        payload.entities.map((entity) => [entity.id, entity.title])
      ),
      questTitles: Object.fromEntries(payload.quests.map((quest) => [quest.id, quest.title])),
      sceneTitles: Object.fromEntries(
        payload.storyScenes.map((scene) => [scene.id, scene.title])
      )
    },
    null,
    2
  );
  const projectMachineData = JSON.stringify(payload, null, 2);

  return `# ${world.name}

${world.description}

# 条目

${entitySections || "暂无条目"}

# 设定模板

${templateSections || "暂无设定模板"}

# 任务线

${questSections || "暂无任务线"}

# 剧情变量

${storyVariableSections || "暂无剧情变量"}

# 剧情场景

${storySceneSections || "暂无剧情场景"}

# 剧情测试预设

${storyTestPresetSections || "暂无测试预设"}

# 剧情测试记录

${storyTestRunSections || "暂无测试记录"}

# 剧情审阅问题

${storyReviewIssueSections || "暂无审阅问题"}

# 地图

${mapSections || "暂无地图"}

# 地图路线

${mapRouteSections || "暂无路线"}

# 时间线

${timelineSections || "暂无时间点"}

# 叙事制作里程碑

${narrativeSections || "暂无叙事里程碑"}

# 关系

${relationSections || "暂无显式关系"}

# 资源库

${assetSections || "暂无资源"}

# 一致性审阅

${consistencySections || "尚未运行一致性扫描"}

# Worldcraft 编排数据

\`\`\`json
${planningMachineData}
\`\`\`

# Worldcraft 剧情数据

\`\`\`json
${storyMachineData}
\`\`\`

# Worldcraft 项目数据

\`\`\`json
${projectMachineData}
\`\`\`
`;
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function richTextToPlainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|blockquote|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function plainTextToRichText(value: string) {
  const escape = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escape(paragraph.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function formatChapterOrdinal(value: number) {
  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  if (value <= 10) return value === 10 ? "十" : digits[value];
  if (value < 20) return `十${digits[value % 10]}`;
  if (value < 100) {
    const remainder = value % 10;
    return `${digits[Math.floor(value / 10)]}十${remainder ? digits[remainder] : ""}`;
  }
  return String(value);
}

function referencePathScore(anchorPath: string, candidatePath: string) {
  if (!candidatePath) return -1;
  if (anchorPath === candidatePath) return 10_000 + candidatePath.length;
  if (
    anchorPath.startsWith(`${candidatePath}.`) ||
    anchorPath.startsWith(`${candidatePath}[`)
  ) {
    return candidatePath.length;
  }
  return -1;
}

function selectReferenceExcerpt(root: HTMLElement, excerpt: string) {
  const candidates = [excerpt, excerpt.replace(/^\[\[|\]\]$/g, "")]
    .map((value) => value.trim())
    .filter(Boolean);
  if (!candidates.length) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let text = "";
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    text += current.textContent ?? "";
    current = walker.nextNode();
  }

  const match = candidates
    .map((value) => ({ value, start: text.indexOf(value) }))
    .find((item) => item.start >= 0);
  if (!match) return;

  let offset = 0;
  let startNode: Text | null = null;
  let endNode: Text | null = null;
  let startOffset = 0;
  let endOffset = 0;
  for (const node of nodes) {
    const length = node.textContent?.length ?? 0;
    if (!startNode && match.start <= offset + length) {
      startNode = node;
      startOffset = Math.max(0, match.start - offset);
    }
    const matchEnd = match.start + match.value.length;
    if (startNode && matchEnd <= offset + length) {
      endNode = node;
      endOffset = Math.max(0, matchEnd - offset);
      break;
    }
    offset += length;
  }

  if (!startNode || !endNode) return;
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function focusReferenceElement(element: HTMLElement, anchor: ProjectReferenceAnchor) {
  element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  element.classList.add("is-reference-target");
  const control = (element.matches("input, textarea, select, [contenteditable='true']")
    ? element
    : element.querySelector<HTMLElement>(
        "textarea, input, select, [contenteditable='true'], button"
      )) ?? element;
  control.focus({ preventScroll: true });

  if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
    if (anchor.start !== null && anchor.end !== null) {
      const start = Math.min(anchor.start, control.value.length);
      const end = Math.min(Math.max(start, anchor.end), control.value.length);
      control.setSelectionRange(start, end);
    }
  } else if (control.isContentEditable) {
    selectReferenceExcerpt(control, anchor.excerpt);
  }
}

export default function Home() {
  const [data, setData] = useState<WorkspaceData>(initialData);
  const dataRef = useRef<WorkspaceData>(initialData);
  const mapUndoHistoryRef = useRef<MapHistoryEntry[]>([]);
  const mapRedoHistoryRef = useRef<MapHistoryEntry[]>([]);
  const [mapHistoryRevision, setMapHistoryRevision] = useState(0);
  const [activeWorldId, setActiveWorldId] = useState(initialData.worlds[0].id);
  const activeWorldIdRef = useRef(initialData.worlds[0].id);
  const [selectedEntityId, setSelectedEntityId] = useState(initialData.entities[0].id);
  const [selectedQuestId, setSelectedQuestId] = useState(initialData.quests[0].id);
  const [selectedRelationId, setSelectedRelationId] = useState(
    initialData.relations[0]?.id ?? ""
  );
  const [selectedAssetId, setSelectedAssetId] = useState(initialData.assets[0]?.id ?? "");
  const [selectedStorySceneId, setSelectedStorySceneId] = useState(
    initialData.storyScenes[0]?.id ?? ""
  );
  const [selectedStoryVariableId, setSelectedStoryVariableId] = useState(
    initialData.storyVariables[0]?.id ?? ""
  );
  const [selectedStoryTestPresetId, setSelectedStoryTestPresetId] = useState(
    initialData.storyTestPresets[0]?.id ?? ""
  );
  const [selectedStoryReviewIssueId, setSelectedStoryReviewIssueId] = useState(
    initialData.storyReviewIssues[0]?.id ?? ""
  );
  const [selectedNarrativeMilestoneId, setSelectedNarrativeMilestoneId] = useState(
    initialData.narrativeMilestones[0]?.id ?? ""
  );
  const [selectedManuscriptChapterId, setSelectedManuscriptChapterId] = useState(
    initialData.manuscriptChapters[0]?.id ?? ""
  );
  const [selectedManuscriptSceneId, setSelectedManuscriptSceneId] = useState("");
  const [selectedEntityTemplateId, setSelectedEntityTemplateId] = useState(
    initialData.entityTemplates[0]?.id ?? ""
  );
  const [selectedMapId, setSelectedMapId] = useState(initialData.maps[0]?.id ?? "");
  const [selectedMapMarkerId, setSelectedMapMarkerId] = useState(
    initialData.mapMarkers[0]?.id ?? ""
  );
  const [selectedMapRouteId, setSelectedMapRouteId] = useState(
    initialData.mapRoutes[0]?.id ?? ""
  );
  const [mapOperationFocus, setMapOperationFocus] = useState<MapOperationFocus | null>(null);
  const [selectedTimelineTrackId, setSelectedTimelineTrackId] = useState(
    initialData.timelineTracks[0]?.id ?? ""
  );
  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState(
    initialData.timelineEvents[0]?.id ?? ""
  );
  const [selectedConsistencyFindingId, setSelectedConsistencyFindingId] = useState(
    initialData.consistencyFindings[0]?.id ?? ""
  );
  const [relationFocusEntityId, setRelationFocusEntityId] = useState(
    initialData.relations[0]?.sourceEntityId ?? initialData.entities[0].id
  );
  const [relationInspectorMode, setRelationInspectorMode] = useState<"entity" | "relation">(
    "relation"
  );
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("author");
  const [appTheme, setAppTheme] = useState<AppThemeId>("forest");
  const appThemeInitializedRef = useRef(false);
  const [wikiSettingsOpenToken, setWikiSettingsOpenToken] = useState(0);
  const [activeType, setActiveType] = useState<EntityType | "all">("all");
  const [questWorkspaceMode, setQuestWorkspaceMode] =
    useState<QuestWorkspaceMode>("editor");
  const [storyWorkspaceMode, setStoryWorkspaceMode] =
    useState<StoryWorkspaceMode>("manuscript");
  const [visualFullscreen, setVisualFullscreen] = useState<
    "dependency" | "branch" | "relation" | null
  >(null);
  const [storyTestWorkspaceMode, setStoryTestWorkspaceMode] =
    useState<StoryTestWorkspaceMode>("analysis");
  const [questCategoryFilter, setQuestCategoryFilter] =
    useState<QuestCategory | "all">("all");
  const [relationTypeFilter, setRelationTypeFilter] = useState<EntityType | "all">("all");
  const [relationQuery, setRelationQuery] = useState("");
  const [assetKindFilter, setAssetKindFilter] = useState<AssetKind | "all">("all");
  const [assetQuery, setAssetQuery] = useState("");
  const [query, setQuery] = useState("");
  const [memberDraft, setMemberDraft] = useState("");
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [saveStatus, setSaveStatus] = useState("准备保存");
  const [hydrated, setHydrated] = useState(false);
  const [entityVersions, setEntityVersions] = useState<EntityVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [codexLibraryOpen, setCodexLibraryOpen] = useState(true);
  const [codexInspectorOpen, setCodexInspectorOpen] = useState(false);
  const [impactDialogOpen, setImpactDialogOpen] = useState(false);
  const [referenceLocationRequest, setReferenceLocationRequest] =
    useState<ReferenceLocationRequest | null>(null);
  const [pendingReferenceCreation, setPendingReferenceCreation] =
    useState<PendingReferenceCreation | null>(null);
  const referenceLocationTokenRef = useRef(0);
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<Set<string>>(new Set());
  const [createContentState, setCreateContentState] = useState<{
    open: boolean;
    kind: CreateContentKind;
    categoryId: string;
  }>({ open: false, kind: "character", categoryId: "" });
  const [categoryDialogState, setCategoryDialogState] = useState<{
    open: boolean;
    categoryId: string;
    parentId: string;
  }>({ open: false, categoryId: "", parentId: "" });
  const [starterPackMode, setStarterPackMode] = useState<"first-run" | "new-world" | null>(null);
  const [starterPackBusy, setStarterPackBusy] = useState(false);
  const [worldDeleteTargetId, setWorldDeleteTargetId] = useState("");
  const [worldOperationBusy, setWorldOperationBusy] = useState<"" | "delete" | "duplicate">("");
  const [revealEntityToken, setRevealEntityToken] = useState(0);
  const [codexHistory, setCodexHistory] = useState<CodexHistoryEntry[]>([]);
  const [codexHistoryIndex, setCodexHistoryIndex] = useState(-1);
  const codexHistoryRef = useRef<CodexHistoryEntry[]>([]);
  const codexHistoryIndexRef = useRef(-1);
  const skipCodexHistoryRef = useRef(false);
  const [savePhase, setSavePhase] = useState<SavePhase>("idle");
  const [saveError, setSaveError] = useState("");
  const [saveRetryToken, setSaveRetryToken] = useState(0);
  const recoveryTimerRef = useRef<number | null>(null);
  const autosaveTimerRef = useRef<number | null>(null);
  const autosaveResumeTimerRef = useRef<number | null>(null);
  const autosaveSuspendedRef = useRef(false);
  const railMoreRef = useRef<HTMLDetailsElement>(null);

  function cancelPendingAutosave() {
    if (autosaveTimerRef.current === null) return;
    window.clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = null;
  }

  function suspendAutosaveForExternalLoad() {
    autosaveSuspendedRef.current = true;
    cancelPendingAutosave();
    if (autosaveResumeTimerRef.current !== null) {
      window.clearTimeout(autosaveResumeTimerRef.current);
      autosaveResumeTimerRef.current = null;
    }
  }

  function resumeAutosaveAfterExternalLoad() {
    autosaveResumeTimerRef.current = window.setTimeout(() => {
      autosaveResumeTimerRef.current = null;
      autosaveSuspendedRef.current = false;
      setSaveRetryToken((current) => current + 1);
    }, 250);
  }

  const mapHistoryControls = useMemo(() => ({
    canRedo: mapRedoHistoryRef.current.length > 0,
    canUndo: mapUndoHistoryRef.current.length > 0,
    redoLabel: mapRedoHistoryRef.current.at(-1)?.label ?? "",
    undoLabel: mapUndoHistoryRef.current.at(-1)?.label ?? ""
  }), [mapHistoryRevision]);

  function refreshMapHistoryControls() {
    setMapHistoryRevision((current) => current + 1);
  }

  function resetMapHistory() {
    mapUndoHistoryRef.current = [];
    mapRedoHistoryRef.current = [];
    refreshMapHistoryControls();
  }

  function commitMapMutation(
    label: string,
    updater: (current: WorkspaceData) => WorkspaceData,
    mergeKey = ""
  ) {
    const beforeData = dataRef.current;
    const afterData = updater(beforeData);
    const before = captureMapWorkspaceSnapshot(beforeData);
    const after = captureMapWorkspaceSnapshot(afterData);
    if (!mapWorkspaceSnapshotChanged(before, after)) return false;

    const timestamp = Date.now();
    const previousEntry = mapUndoHistoryRef.current.at(-1);
    if (
      mergeKey
      && previousEntry?.mergeKey === mergeKey
      && previousEntry.worldId === activeWorldIdRef.current
      && timestamp - previousEntry.timestamp <= MAP_HISTORY_MERGE_WINDOW
    ) {
      previousEntry.after = after;
      previousEntry.label = label;
      previousEntry.timestamp = timestamp;
    } else {
      mapUndoHistoryRef.current = [
        ...mapUndoHistoryRef.current,
        {
          after,
          before,
          label,
          mergeKey,
          timestamp,
          worldId: activeWorldIdRef.current
        }
      ].slice(-MAP_HISTORY_LIMIT);
    }
    mapRedoHistoryRef.current = [];
    dataRef.current = afterData;
    setData(afterData);
    refreshMapHistoryControls();
    return true;
  }

  function reconcileMapSelection(nextData: WorkspaceData) {
    const nextWorldMaps = nextData.maps.filter((mapItem) => mapItem.worldId === activeWorldIdRef.current);
    const nextMapId = nextWorldMaps.some((mapItem) => mapItem.id === selectedMapId)
      ? selectedMapId
      : nextWorldMaps[0]?.id ?? "";
    if (nextMapId !== selectedMapId) setSelectedMapId(nextMapId);
    if (!nextData.mapMarkers.some((marker) => marker.id === selectedMapMarkerId)) {
      setSelectedMapMarkerId("");
    }
    if (!nextData.mapRoutes.some((route) => route.id === selectedMapRouteId)) {
      setSelectedMapRouteId("");
    }
  }

  function undoMapOperation() {
    const entry = mapUndoHistoryRef.current.at(-1);
    if (!entry) return;
    mapUndoHistoryRef.current = mapUndoHistoryRef.current.slice(0, -1);
    mapRedoHistoryRef.current = [...mapRedoHistoryRef.current, entry].slice(-MAP_HISTORY_LIMIT);
    const nextData = applyMapWorkspaceSnapshot(dataRef.current, entry.before);
    dataRef.current = nextData;
    setData(nextData);
    reconcileMapSelection(nextData);
    setSaveStatus(`已撤销：${entry.label}`);
    refreshMapHistoryControls();
  }

  function redoMapOperation() {
    const entry = mapRedoHistoryRef.current.at(-1);
    if (!entry) return;
    mapRedoHistoryRef.current = mapRedoHistoryRef.current.slice(0, -1);
    mapUndoHistoryRef.current = [...mapUndoHistoryRef.current, entry].slice(-MAP_HISTORY_LIMIT);
    const nextData = applyMapWorkspaceSnapshot(dataRef.current, entry.after);
    dataRef.current = nextData;
    setData(nextData);
    reconcileMapSelection(nextData);
    setSaveStatus(`已重做：${entry.label}`);
    refreshMapHistoryControls();
  }

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    activeWorldIdRef.current = activeWorldId;
  }, [activeWorldId]);

  useEffect(() => {
    resetMapHistory();
  }, [activeWorldId]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeTab]);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 900px)").matches) return;
    setCodexLibraryOpen(false);
    setCodexInspectorOpen(false);
  }, []);

  useEffect(() => {
    if (!referenceLocationRequest) return;

    let located = false;
    let highlighted: HTMLElement | null = null;
    const timers: number[] = [];
    const locate = (allowSourceFallback: boolean) => {
      if (located) return;
      const sourceElements = Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-reference-source-kind][data-reference-source-id]"
        )
      ).filter(
        (element) =>
          element.dataset.referenceSourceKind === referenceLocationRequest.source.kind &&
          element.dataset.referenceSourceId === referenceLocationRequest.source.id
      );
      const ranked = sourceElements
        .map((element) => ({
          element,
          score: referencePathScore(
            referenceLocationRequest.anchor.path,
            element.dataset.referencePath ?? ""
          )
        }))
        .filter((item) => item.score >= 0)
        .sort((left, right) => right.score - left.score);
      const target = ranked[0]?.element ?? (allowSourceFallback ? sourceElements[0] : null);
      if (!target) return;
      located = true;
      highlighted = target;
      focusReferenceElement(target, referenceLocationRequest.anchor);
      timers.push(
        window.setTimeout(() => target.classList.remove("is-reference-target"), 2400)
      );
    };

    [40, 140, 360, 720].forEach((delay) => {
      timers.push(window.setTimeout(() => locate(false), delay));
    });
    timers.push(window.setTimeout(() => locate(true), 1100));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      highlighted?.classList.remove("is-reference-target");
    };
  }, [referenceLocationRequest]);
  const [assetFileStatus, setAssetFileStatus] =
    useState<Record<string, AssetFileCheck> | null>(null);
  const [assetDirectory, setAssetDirectory] = useState("");
  const [backups, setBackups] = useState<BackupSummary[]>([]);
  const [backupStorage, setBackupStorage] = useState<BackupStorageSummary | null>(null);
  const [storageDiagnostics, setStorageDiagnostics] =
    useState<StorageDiagnostics | null>(null);
  const [objectVersions, setObjectVersions] = useState<ObjectVersion[]>([]);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyCollection, setHistoryCollection] = useState<WorkspaceCollection | "all">(
    "all"
  );
  const [diagnosticsMessage, setDiagnosticsMessage] = useState("");
  const [reliabilityStatus, setReliabilityStatus] = useState<
    "idle" | "checking" | "ready" | "unavailable" | "error"
  >("idle");
  const [pendingRestoreFileName, setPendingRestoreFileName] = useState("");
  const [pendingBackupCleanup, setPendingBackupCleanup] = useState(false);
  const [storageMaintenancePending, setStorageMaintenancePending] = useState(false);
  const [storageMaintenanceBusy, setStorageMaintenanceBusy] = useState(false);
  const [modelBusyFindingId, setModelBusyFindingId] = useState("");
  const [consistencyModelMessage, setConsistencyModelMessage] = useState("");
  const [consistencyScanState, setConsistencyScanState] = useState<"idle" | "running">(
    "idle"
  );
  const consistencyScanWorkerRef = useRef<Worker | null>(null);

  function selectPlanningState(workspace: WorkspaceData, worldId: string) {
    const mapItem = workspace.maps.find((item) => item.worldId === worldId);
    const marker = workspace.mapMarkers.find((item) => item.mapId === mapItem?.id);
    const route = workspace.mapRoutes.find((item) => item.mapId === mapItem?.id);
    const track = workspace.timelineTracks
      .filter((item) => item.worldId === worldId)
      .sort((left, right) => left.order - right.order)[0];
    const timelineEvent = workspace.timelineEvents
      .filter((item) => item.worldId === worldId)
      .sort((left, right) => left.sortOrder - right.sortOrder)[0];
    const consistencyFinding = workspace.consistencyFindings.find(
      (item) => item.worldId === worldId && item.status === "open"
    ) ?? workspace.consistencyFindings.find((item) => item.worldId === worldId);
    setSelectedMapId(mapItem?.id ?? "");
    setSelectedMapMarkerId(marker?.id ?? "");
    setSelectedMapRouteId(route?.id ?? "");
    setSelectedTimelineTrackId(timelineEvent?.trackId ?? track?.id ?? "");
    setSelectedTimelineEventId(timelineEvent?.id ?? "");
    setSelectedConsistencyFindingId(consistencyFinding?.id ?? "");
    setSelectedNarrativeMilestoneId(
      sortNarrativeMilestones(
        workspace.narrativeMilestones.filter((item) => item.worldId === worldId)
      )[0]?.id ?? ""
    );
    setSelectedEntityTemplateId(
      workspace.entityTemplates.find((item) => item.worldId === worldId)?.id ?? ""
    );
  }

  useEffect(() => {
    if (!appThemeInitializedRef.current) {
      appThemeInitializedRef.current = true;
      const storedTheme = window.localStorage.getItem(appThemeStorageKey);
      const restoredTheme = isAppThemeId(storedTheme) ? storedTheme : "forest";

      document.documentElement.dataset.appTheme = restoredTheme;
      document.documentElement.style.colorScheme = restoredTheme === "night" ? "dark" : "light";
      if (restoredTheme !== appTheme) {
        setAppTheme(restoredTheme);
        return;
      }
    }

    window.localStorage.setItem(appThemeStorageKey, appTheme);
    document.documentElement.dataset.appTheme = appTheme;
    document.documentElement.style.colorScheme = appTheme === "night" ? "dark" : "light";
  }, [appTheme]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateWorkspace() {
      let nextData = initialData;
      let nextStatus = "已载入示例项目";
      let loadedUpdatedAt = "";
      let needsStarterPack = false;

      try {
        if (window.worldcraftStore) {
          const result = await window.worldcraftStore.loadWorkspace();
          setStoreInfo({
            dbPath: result.dbPath,
            backupDir: result.backupDir,
            updatedAt: result.updatedAt,
            appVersion: result.appVersion,
            schemaVersion: result.schemaVersion ?? result.version
          });

          if (result.data) {
            nextData = normalizeWorkspaceData(result.data);
            loadedUpdatedAt = result.updatedAt ?? "";
            nextStatus = `已从 SQLite 载入：${formatDateLabel(result.updatedAt ?? new Date().toISOString())}`;
          } else {
            const legacy = window.localStorage.getItem(storageKey);
            if (legacy) {
              nextData = normalizeWorkspaceData(JSON.parse(legacy) as Partial<WorkspaceData>);
              await window.worldcraftStore.saveWorkspace(nextData, "legacy-localstorage-import");
              await window.worldcraftStore.createBackup(nextData);
              nextStatus = "已导入旧本地数据到 SQLite";
            } else {
              needsStarterPack = true;
              nextStatus = "请选择项目起步包";
            }
          }
        } else {
          const saved = window.localStorage.getItem(storageKey);
          if (saved) {
            nextData = normalizeWorkspaceData(JSON.parse(saved) as Partial<WorkspaceData>);
            nextStatus = "已从浏览器本地存储载入";
          } else {
            needsStarterPack = true;
            nextStatus = "请选择项目起步包";
          }
        }
      } catch (error) {
        console.error(error);
        nextData = initialData;
        nextStatus = "载入失败，已使用示例项目";
      }

      try {
        const recoveryValue = window.localStorage.getItem(recoveryStorageKey);
        if (recoveryValue) {
          const recovery = JSON.parse(recoveryValue) as {
            savedAt?: string;
            data?: Partial<WorkspaceData>;
          };
          const recoveryTime = Date.parse(recovery.savedAt ?? "");
          const loadedTime = Date.parse(loadedUpdatedAt) || 0;
          if (recovery.data && Number.isFinite(recoveryTime) && recoveryTime > loadedTime) {
            nextData = normalizeWorkspaceData(recovery.data);
            nextStatus = `已恢复未完成草稿：${formatDateLabel(recovery.savedAt as string)}`;
          } else {
            window.localStorage.removeItem(recoveryStorageKey);
          }
        }
      } catch (error) {
        console.error(error);
        window.localStorage.removeItem(recoveryStorageKey);
      }

      if (cancelled) {
        return;
      }

      const nextWorldId = nextData.worlds[0]?.id ?? initialData.worlds[0].id;
      setData(nextData);
      setActiveWorldId(nextWorldId);
      setSelectedEntityId(nextData.entities[0]?.id ?? "");
      setSelectedQuestId(nextData.quests[0]?.id ?? "");
      setSelectedRelationId(nextData.relations[0]?.id ?? "");
      setSelectedAssetId(nextData.assets[0]?.id ?? "");
      setSelectedStorySceneId(nextData.storyScenes[0]?.id ?? "");
      setSelectedStoryVariableId(nextData.storyVariables[0]?.id ?? "");
      setSelectedStoryTestPresetId(nextData.storyTestPresets[0]?.id ?? "");
      setSelectedStoryReviewIssueId(nextData.storyReviewIssues[0]?.id ?? "");
      selectPlanningState(nextData, nextWorldId);
      setRelationFocusEntityId(
        nextData.relations[0]?.sourceEntityId ?? nextData.entities[0]?.id ?? ""
      );
      setSaveStatus(nextStatus);
      setSavePhase("saved");
      setHydrated(true);
      if (needsStarterPack) setStarterPackMode("first-run");
    }

    hydrateWorkspace();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated && activeTab === "health") {
      void refreshReliabilityData();
    }
  }, [activeTab, activeWorldId, data.assets, hydrated]);

  useEffect(() => {
    if (!hydrated || starterPackMode === "first-run") return;
    setSavePhase("idle");
    setSaveStatus("有未保存的修改");
    if (recoveryTimerRef.current === null) {
      recoveryTimerRef.current = window.setTimeout(() => {
        recoveryTimerRef.current = null;
        try {
          window.localStorage.setItem(
            recoveryStorageKey,
            JSON.stringify({ savedAt: new Date().toISOString(), data: dataRef.current })
          );
        } catch (error) {
          console.error(error);
        }
      }, 120);
    }
  }, [data, hydrated, starterPackMode]);

  useEffect(
    () => () => {
      if (recoveryTimerRef.current !== null) {
        window.clearTimeout(recoveryTimerRef.current);
      }
      if (autosaveResumeTimerRef.current !== null) {
        window.clearTimeout(autosaveResumeTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!hydrated || starterPackMode === "first-run" || autosaveSuspendedRef.current) return;
    if (!window.worldcraftStore) {
      window.localStorage.setItem(storageKey, JSON.stringify(data));
      window.localStorage.removeItem(recoveryStorageKey);
      setSaveError("");
      setSavePhase("saved");
      setSaveStatus("已保存到浏览器本地存储");
      return;
    }

    const workspaceStore = window.worldcraftStore;
    const savingData = data;
    const timeout = window.setTimeout(async () => {
      if (autosaveTimerRef.current === timeout) autosaveTimerRef.current = null;
      try {
        setSaveError("");
        setSavePhase("saving");
        setSaveStatus("正在保存...");
        const result = await workspaceStore.saveWorkspace(savingData, "autosave");
        if (!result.ok) throw new Error(result.error || "SQLite 写入失败");
        setStoreInfo((previous) => ({
          dbPath: result.dbPath ?? previous?.dbPath ?? "",
          backupDir: result.backupDir ?? previous?.backupDir ?? "",
          updatedAt: result.updatedAt ?? previous?.updatedAt ?? null,
          appVersion: result.appVersion ?? previous?.appVersion,
          schemaVersion: previous?.schemaVersion,
          lastProjectPath: previous?.lastProjectPath
        }));
        if (dataRef.current === savingData) {
          window.localStorage.removeItem(recoveryStorageKey);
          const changed =
            (result.inserted ?? 0) + (result.updated ?? 0) + (result.deleted ?? 0);
          setSavePhase("saved");
          setSaveStatus(
            changed
              ? `已保存到 SQLite · ${changed} 项 · ${formatDateLabel(result.updatedAt ?? new Date().toISOString())}`
              : `已保存到 SQLite · ${formatDateLabel(result.updatedAt ?? new Date().toISOString())}`
          );
        } else {
          setSavePhase("idle");
          setSaveStatus("有新的修改等待保存");
        }
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "自动保存失败";
        setSaveError(message);
        setSavePhase("error");
        setSaveStatus("保存失败，点击重试");
      }
    }, 500);
    autosaveTimerRef.current = timeout;

    return () => {
      window.clearTimeout(timeout);
      if (autosaveTimerRef.current === timeout) autosaveTimerRef.current = null;
    };
  }, [data, hydrated, saveRetryToken, starterPackMode]);

  useEffect(() => {
    if (!hydrated || !selectedEntityId || !activeWorldId) return;
    if (skipCodexHistoryRef.current) {
      skipCodexHistoryRef.current = false;
      return;
    }
    const current = codexHistoryRef.current[codexHistoryIndexRef.current];
    if (current?.worldId === activeWorldId && current.entityId === selectedEntityId) return;
    const next = [
      ...codexHistoryRef.current.slice(0, codexHistoryIndexRef.current + 1),
      { worldId: activeWorldId, entityId: selectedEntityId, openedAt: new Date().toISOString() }
    ].slice(-50);
    const nextIndex = next.length - 1;
    codexHistoryRef.current = next;
    codexHistoryIndexRef.current = nextIndex;
    setCodexHistory(next);
    setCodexHistoryIndex(nextIndex);
  }, [activeWorldId, hydrated, selectedEntityId]);

  useEffect(() => {
    setCollapsedCategoryIds(
      new Set(
        data.codexCategories
          .filter((category) => category.worldId === activeWorldId)
          .map((category) => category.id)
      )
    );
  }, [activeWorldId]);

  useEffect(() => {
    if (!consistencyScanWorkerRef.current) return;
    consistencyScanWorkerRef.current.terminate();
    consistencyScanWorkerRef.current = null;
    setConsistencyScanState("idle");
    setSaveStatus("世界已切换，一致性扫描已取消，原结果保持不变");
  }, [activeWorldId]);

  useEffect(() => {
    if (!consistencyScanWorkerRef.current) return;
    consistencyScanWorkerRef.current.terminate();
    consistencyScanWorkerRef.current = null;
    setConsistencyScanState("idle");
    setSaveStatus("项目内容已变化，一致性扫描已取消，请重新运行");
  }, [data]);

  useEffect(
    () => () => {
      consistencyScanWorkerRef.current?.terminate();
      consistencyScanWorkerRef.current = null;
    },
    []
  );

  useEffect(() => {
    if (!hydrated || !selectedEntityId) {
      setEntityVersions([]);
      return;
    }

    void refreshEntityVersions(selectedEntityId);
  }, [hydrated, selectedEntityId]);

  useEffect(() => {
    function handleGlobalShortcut(event: globalThis.KeyboardEvent) {
      if (event.isComposing) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setGlobalSearchOpen(true);
      }
    }

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, []);

  useEffect(() => {
    function report(category: string, value: unknown) {
      if (!window.worldcraftStore?.reportRendererError) return;
      const errorName = value instanceof Error ? value.name : undefined;
      void window.worldcraftStore.reportRendererError({ category, errorName });
    }
    function handleError(event: ErrorEvent) {
      report("window-error", event.error);
    }
    function handleRejection(event: PromiseRejectionEvent) {
      report("unhandled-rejection", event.reason);
    }
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  const activeWorld = useMemo(
    () => data.worlds.find((world) => world.id === activeWorldId) ?? data.worlds[0],
    [data.worlds, activeWorldId]
  );
  const exportPayload = useMemo(
    () => activeTab === "export" && activeWorld ? buildWorldExport(activeWorld, data) : null,
    [activeTab, activeWorld, data]
  );

  const worldDeleteTarget = useMemo(
    () => data.worlds.find((world) => world.id === worldDeleteTargetId) ?? null,
    [data.worlds, worldDeleteTargetId]
  );

  const worldDeleteCounts = useMemo(() => {
    const worldId = worldDeleteTarget?.id;
    return {
      chapters: worldId
        ? data.manuscriptChapters.filter((chapter) => chapter.worldId === worldId).length
        : 0,
      entities: worldId
        ? data.entities.filter((entity) => entity.worldId === worldId).length
        : 0,
      maps: worldId ? data.maps.filter((mapItem) => mapItem.worldId === worldId).length : 0,
      quests: worldId ? data.quests.filter((quest) => quest.worldId === worldId).length : 0
    };
  }, [data.entities, data.manuscriptChapters, data.maps, data.quests, worldDeleteTarget?.id]);

  const worldMenuCounts = useMemo(() => {
    const counts = new globalThis.Map<
      string,
      { chapters: number; entities: number; maps: number }
    >(
      data.worlds.map((world) => [
        world.id,
        { chapters: 0, entities: 0, maps: 0 }
      ])
    );
    const increment = (
      worldId: string,
      key: "chapters" | "entities" | "maps"
    ) => {
      const entry = counts.get(worldId);
      if (entry) entry[key] += 1;
    };
    data.entities.forEach((entity) => increment(entity.worldId, "entities"));
    data.maps.forEach((mapItem) => increment(mapItem.worldId, "maps"));
    data.manuscriptChapters.forEach((chapter) => increment(chapter.worldId, "chapters"));
    return counts;
  }, [data.entities, data.manuscriptChapters, data.maps, data.worlds]);

  const projectReferenceIndex = useMemo(
    () => buildProjectReferenceIndex(data),
    [data]
  );

  const worldEntityTemplates = useMemo(
    () =>
      data.entityTemplates
        .filter((template) => template.worldId === activeWorld?.id)
        .sort((left, right) => Number(right.builtIn) - Number(left.builtIn) || left.name.localeCompare(right.name, "zh-CN")),
    [activeWorld?.id, data.entityTemplates]
  );

  const worldCodexCategories = useMemo(
    () =>
      data.codexCategories
        .filter((category) => category.worldId === activeWorld?.id)
        .sort((left, right) => left.order - right.order),
    [activeWorld?.id, data.codexCategories]
  );

  const editingCodexCategory = useMemo(
    () =>
      worldCodexCategories.find(
        (category) => category.id === categoryDialogState.categoryId
      ) ?? null,
    [categoryDialogState.categoryId, worldCodexCategories]
  );

  const worldEntities = useMemo(
    () => data.entities.filter((entity) => entity.worldId === activeWorld?.id),
    [data.entities, activeWorld?.id]
  );

  const selectedEntity = useMemo(
    () =>
      worldEntities.find((entity) => entity.id === selectedEntityId) ??
      worldEntities[0] ??
      null,
    [selectedEntityId, worldEntities]
  );

  const selectedEntityTemplate = useMemo(
    () => (selectedEntity ? resolveEntityTemplate(worldEntityTemplates, selectedEntity) : null),
    [selectedEntity, worldEntityTemplates]
  );

  const selectedEntityCategoryPath = useMemo(
    () =>
      selectedEntity
        ? getCodexCategoryPath(worldCodexCategories, selectedEntity.categoryId)
        : [],
    [selectedEntity, worldCodexCategories]
  );

  const entityTemplateIssues = useMemo(
    () => activeTab === "health" ? validateEntityTemplates(worldEntityTemplates, worldEntities) : [],
    [activeTab, worldEntities, worldEntityTemplates]
  );

  const codexHierarchyIssues = useMemo(
    () =>
      activeTab === "health" && activeWorld
        ? validateCodexHierarchy(worldCodexCategories, worldEntities, activeWorld.id)
        : [],
    [activeTab, activeWorld, worldCodexCategories, worldEntities]
  );

  const worldRelations = useMemo(
    () =>
      data.relations
        .filter((relation) => relation.worldId === activeWorld?.id)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [activeWorld?.id, data.relations]
  );

  const selectedRelation = useMemo(
    () =>
      worldRelations.find((relation) => relation.id === selectedRelationId) ??
      worldRelations[0] ??
      null,
    [selectedRelationId, worldRelations]
  );

  const selectedRelationSource = useMemo(
    () =>
      selectedRelation
        ? worldEntities.find((entity) => entity.id === selectedRelation.sourceEntityId) ?? null
        : null,
    [selectedRelation, worldEntities]
  );

  const selectedRelationTarget = useMemo(
    () =>
      selectedRelation
        ? worldEntities.find((entity) => entity.id === selectedRelation.targetEntityId) ?? null
        : null,
    [selectedRelation, worldEntities]
  );

  const relationVisibleEntities = useMemo(() => {
    if (relationTypeFilter === "all") {
      const explicitlyRelatedIds = new Set(
        worldRelations.flatMap((relation) => [
          relation.sourceEntityId,
          relation.targetEntityId
        ])
      );
      return worldEntities.filter(
        (entity) =>
          entity.type === "character" ||
          entity.type === "faction" ||
          entity.type === "location" ||
          explicitlyRelatedIds.has(entity.id)
      );
    }

    const visibleIds = new Set(
      worldEntities
        .filter((entity) => entity.type === relationTypeFilter)
        .map((entity) => entity.id)
    );
    worldRelations.forEach((relation) => {
      if (visibleIds.has(relation.sourceEntityId) || visibleIds.has(relation.targetEntityId)) {
        visibleIds.add(relation.sourceEntityId);
        visibleIds.add(relation.targetEntityId);
      }
    });
    return worldEntities.filter((entity) => visibleIds.has(entity.id));
  }, [relationTypeFilter, worldEntities, worldRelations]);

  const relationVisibleIds = useMemo(
    () => new Set(relationVisibleEntities.map((entity) => entity.id)),
    [relationVisibleEntities]
  );

  const visibleGraphRelations = useMemo(
    () =>
      worldRelations.filter(
        (relation) =>
          relationVisibleIds.has(relation.sourceEntityId) &&
          relationVisibleIds.has(relation.targetEntityId)
      ),
    [relationVisibleIds, worldRelations]
  );

  const relationEntityById = useMemo(
    () => new globalThis.Map(worldEntities.map((entity) => [entity.id, entity])),
    [worldEntities]
  );

  const filteredRelations = useMemo(() => {
    const normalizedQuery = normalize(relationQuery);
    return worldRelations.filter((relation) => {
      const source = relationEntityById.get(relation.sourceEntityId);
      const target = relationEntityById.get(relation.targetEntityId);
      const matchesType =
        relationTypeFilter === "all" ||
        source?.type === relationTypeFilter ||
        target?.type === relationTypeFilter;
      const matchesQuery =
        !normalizedQuery ||
        normalize(
        [
          source?.title,
          target?.title,
          relation.label,
          relation.sourceCitation,
          relation.historicalScope,
          relation.notes
        ]
          .filter(Boolean)
          .join(" ")
        ).includes(normalizedQuery);
      return matchesType && matchesQuery;
    });
  }, [relationEntityById, relationQuery, relationTypeFilter, worldRelations]);

  const renderedRelations = useMemo(
    () => filteredRelations.slice(0, 160),
    [filteredRelations]
  );

  const focusedRelationEntity = useMemo(
    () =>
      worldEntities.find((entity) => entity.id === relationFocusEntityId) ??
      worldEntities.find((entity) => entity.id === selectedRelation?.sourceEntityId) ??
      worldEntities[0] ??
      null,
    [relationFocusEntityId, selectedRelation?.sourceEntityId, worldEntities]
  );

  const focusedEntityRelations = useMemo(
    () =>
      focusedRelationEntity
        ? worldRelations.filter(
            (relation) =>
              relation.sourceEntityId === focusedRelationEntity.id ||
              relation.targetEntityId === focusedRelationEntity.id
          )
        : [],
    [focusedRelationEntity, worldRelations]
  );

  const worldMaps = useMemo(
    () => data.maps.filter((mapItem) => mapItem.worldId === activeWorld?.id),
    [activeWorld?.id, data.maps]
  );

  const worldMapLayers = useMemo(() => {
    const mapIds = new Set(worldMaps.map((mapItem) => mapItem.id));
    return data.mapLayers
      .filter((layer) => mapIds.has(layer.mapId))
      .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN"));
  }, [data.mapLayers, worldMaps]);

  const worldMapMarkerGroups = useMemo(() => {
    const mapIds = new Set(worldMaps.map((mapItem) => mapItem.id));
    return data.mapMarkerGroups
      .filter((group) => mapIds.has(group.mapId))
      .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN"));
  }, [data.mapMarkerGroups, worldMaps]);

  const activeMap = useMemo(
    () => worldMaps.find((mapItem) => mapItem.id === selectedMapId) ?? worldMaps[0] ?? null,
    [selectedMapId, worldMaps]
  );

  const allWorldMarkers = useMemo(() => {
    const mapIds = new Set(worldMaps.map((mapItem) => mapItem.id));
    return data.mapMarkers.filter((marker) => mapIds.has(marker.mapId));
  }, [data.mapMarkers, worldMaps]);

  const worldMapRoutes = useMemo(
    () => data.mapRoutes.filter((route) => route.worldId === activeWorld?.id),
    [activeWorld?.id, data.mapRoutes]
  );

  const worldTimelineTracks = useMemo(
    () =>
      data.timelineTracks
        .filter((track) => track.worldId === activeWorld?.id)
        .sort((left, right) => left.order - right.order),
    [activeWorld?.id, data.timelineTracks]
  );

  const worldTimelineEvents = useMemo(
    () =>
      data.timelineEvents
        .filter((item) => item.worldId === activeWorld?.id)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [activeWorld?.id, data.timelineEvents]
  );

  const worldAssets = useMemo(
    () =>
      data.assets
        .filter((asset) => asset.worldId === activeWorld?.id)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [activeWorld?.id, data.assets]
  );

  const filteredAssets = useMemo(() => {
    const normalizedQuery = normalize(assetQuery);
    return worldAssets.filter((asset) => {
      const matchesKind = assetKindFilter === "all" || asset.kind === assetKindFilter;
      const matchesQuery =
        !normalizedQuery ||
        normalize([asset.name, asset.originalName, asset.tags.join(" "), asset.notes].join(" ")).includes(
          normalizedQuery
        );
      return matchesKind && matchesQuery;
    });
  }, [assetKindFilter, assetQuery, worldAssets]);

  const selectedAsset = useMemo(
    () =>
      worldAssets.find((asset) => asset.id === selectedAssetId) ?? worldAssets[0] ?? null,
    [selectedAssetId, worldAssets]
  );
  const selectedAssetFileCheck = selectedAsset
    ? assetFileStatus?.[selectedAsset.storedName]
    : undefined;

  const assetKindCounts = useMemo(
    () =>
      worldAssets.reduce<Record<AssetKind, number>>(
        (counts, asset) => {
          counts[asset.kind] += 1;
          return counts;
        },
        { image: 0, map: 0, video: 0, audio: 0, concept: 0, document: 0 }
      ),
    [worldAssets]
  );

  const worldMarkers = useMemo(
    () => allWorldMarkers.filter((marker) => marker.mapId === activeMap?.id),
    [activeMap?.id, allWorldMarkers]
  );

  const timelineItems = useMemo(() => {
    return worldTimelineEvents
      .map((item) => ({
        ...item,
        entity: worldEntities.find((entity) => entity.id === item.entityId) ?? null
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [worldEntities, worldTimelineEvents]);

  const worldQuests = useMemo(
    () =>
      data.quests
        .filter((quest) => quest.worldId === activeWorld?.id)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [activeWorld?.id, data.quests]
  );

  const worldStoryVariables = useMemo(
    () =>
      data.storyVariables
        .filter((variable) => variable.worldId === activeWorld?.id)
        .sort((left, right) => left.name.localeCompare(right.name, "zh-CN")),
    [activeWorld?.id, data.storyVariables]
  );

  const worldStoryScenes = useMemo(
    () =>
      data.storyScenes
        .filter((scene) => scene.worldId === activeWorld?.id)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [activeWorld?.id, data.storyScenes]
  );

  const selectedStoryScene = useMemo(
    () =>
      worldStoryScenes.find((scene) => scene.id === selectedStorySceneId) ??
      worldStoryScenes[0] ??
      null,
    [selectedStorySceneId, worldStoryScenes]
  );

  const selectedStoryVariable = useMemo(
    () =>
      worldStoryVariables.find((variable) => variable.id === selectedStoryVariableId) ??
      worldStoryVariables[0] ??
      null,
    [selectedStoryVariableId, worldStoryVariables]
  );

  const worldStoryTestPresets = useMemo(
    () =>
      data.storyTestPresets
        .filter((preset) => preset.worldId === activeWorld?.id)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [activeWorld?.id, data.storyTestPresets]
  );

  const worldStoryTestRuns = useMemo(
    () =>
      data.storyTestRuns
        .filter((run) => run.worldId === activeWorld?.id)
        .sort((left, right) => right.executedAt.localeCompare(left.executedAt)),
    [activeWorld?.id, data.storyTestRuns]
  );

  const worldStoryReviewIssues = useMemo(
    () =>
      data.storyReviewIssues
        .filter((issue) => issue.worldId === activeWorld?.id)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [activeWorld?.id, data.storyReviewIssues]
  );

  const worldNarrativeMilestones = useMemo(
    () =>
      sortNarrativeMilestones(
        data.narrativeMilestones.filter((milestone) => milestone.worldId === activeWorld?.id)
      ),
    [activeWorld?.id, data.narrativeMilestones]
  );
  const selectedNarrativeMilestone =
    worldNarrativeMilestones.find(
      (milestone) => milestone.id === selectedNarrativeMilestoneId
    ) ?? worldNarrativeMilestones[0] ?? null;
  const worldManuscriptData = useMemo<ManuscriptWorkspaceData>(() => ({
    manuscriptBooks: data.manuscriptBooks.filter((book) => book.worldId === activeWorld?.id),
    manuscriptVolumes: data.manuscriptVolumes.filter(
      (volume) => volume.worldId === activeWorld?.id
    ),
    manuscriptChapters: data.manuscriptChapters.filter(
      (chapter) => chapter.worldId === activeWorld?.id
    ),
    manuscriptScenes: data.manuscriptScenes.filter(
      (scene) => scene.worldId === activeWorld?.id
    ),
    manuscriptClues: data.manuscriptClues.filter((clue) => clue.worldId === activeWorld?.id),
    manuscriptKnowledgeStates: data.manuscriptKnowledgeStates.filter(
      (item) => item.worldId === activeWorld?.id
    )
  }), [
    activeWorld?.id,
    data.manuscriptBooks,
    data.manuscriptChapters,
    data.manuscriptClues,
    data.manuscriptKnowledgeStates,
    data.manuscriptScenes,
    data.manuscriptVolumes
  ]);
  const worldManuscriptBooks = useMemo(
    () => sortManuscriptUnits(worldManuscriptData.manuscriptBooks),
    [worldManuscriptData.manuscriptBooks]
  );
  const worldManuscriptVolumes = useMemo(
    () => sortManuscriptUnits(worldManuscriptData.manuscriptVolumes),
    [worldManuscriptData.manuscriptVolumes]
  );
  const worldManuscriptChapters = useMemo(
    () => sortManuscriptUnits(worldManuscriptData.manuscriptChapters),
    [worldManuscriptData.manuscriptChapters]
  );
  const worldManuscriptScenes = useMemo(
    () => sortManuscriptUnits(worldManuscriptData.manuscriptScenes),
    [worldManuscriptData.manuscriptScenes]
  );
  const selectedManuscriptChapter =
    worldManuscriptChapters.find((chapter) => chapter.id === selectedManuscriptChapterId) ??
    worldManuscriptChapters[0] ??
    null;
  const selectedManuscriptScene =
    worldManuscriptScenes.find((scene) => scene.id === selectedManuscriptSceneId) ?? null;

  useEffect(() => {
    if (
      selectedManuscriptChapterId &&
      worldManuscriptChapters.some((chapter) => chapter.id === selectedManuscriptChapterId)
    ) {
      return;
    }
    setSelectedManuscriptChapterId(worldManuscriptChapters[0]?.id ?? "");
    setSelectedManuscriptSceneId("");
  }, [selectedManuscriptChapterId, worldManuscriptChapters]);

  const projectReferenceOptions = useMemo<ProjectReferenceOption[]>(() => {
    const entityById = new globalThis.Map(
      worldEntities.map((entity) => [entity.id, entity])
    );
    const mapById = new globalThis.Map(worldMaps.map((mapItem) => [mapItem.id, mapItem]));
    return [
      ...(activeWorld
        ? [
            {
              reference: { kind: "world" as const, id: activeWorld.id },
              title: activeWorld.name,
              detail: "当前世界项目",
              keywords: [activeWorld.description]
            }
          ]
        : []),
      ...worldEntities.map((entity) => ({
        reference: { kind: "entity" as const, id: entity.id },
        title: entity.title,
        detail: entityTypeMeta[entity.type].label,
        keywords: [entity.summary, ...entity.tags]
      })),
      ...worldQuests.map((quest) => ({
        reference: { kind: "quest" as const, id: quest.id },
        title: quest.title,
        detail: `${questCategoryMeta[quest.category].label} · ${questStatusMeta[quest.status].label}`,
        keywords: [quest.summary, quest.trigger]
      })),
      ...worldStoryScenes.map((scene) => ({
        reference: { kind: "scene" as const, id: scene.id },
        title: scene.title,
        detail: `剧情场景 · ${storySceneStatusLabels[scene.status]}`,
        keywords: [scene.summary, scene.notes]
      })),
      ...worldStoryVariables.map((variable) => ({
        reference: { kind: "story-variable" as const, id: variable.id },
        title: variable.name,
        detail: `${storyVariableTypeLabels[variable.type]} · ${variable.key}`,
        keywords: [variable.description]
      })),
      ...worldTimelineEvents.map((timelineEvent) => ({
        reference: { kind: "timeline-event" as const, id: timelineEvent.id },
        title: timelineEvent.title || timelineEvent.displayDate || "未命名时间点",
        detail: formatTimelineInterval(timelineEvent),
        keywords: [timelineEvent.summary, timelineEvent.era]
      })),
      ...worldTimelineTracks.map((track) => ({
        reference: { kind: "timeline-track" as const, id: track.id },
        title: track.name,
        detail: "时间轨道",
        keywords: [track.description]
      })),
      ...worldMaps.map((mapItem) => ({
        reference: { kind: "map" as const, id: mapItem.id },
        title: mapItem.title,
        detail: "地图",
        keywords: [mapItem.description]
      })),
      ...allWorldMarkers.map((marker) => ({
        reference: { kind: "map-marker" as const, id: marker.id },
        title: marker.label,
        detail: `地图标记 · ${mapById.get(marker.mapId)?.title ?? "失效地图"}`,
        keywords: [marker.description]
      })),
      ...worldMapRoutes.map((route) => ({
        reference: { kind: "map-route" as const, id: route.id },
        title: route.title,
        detail: `地图路线 · ${mapById.get(route.mapId)?.title ?? "失效地图"}`,
        keywords: [route.description]
      })),
      ...worldAssets.map((asset) => ({
        reference: { kind: "asset" as const, id: asset.id },
        title: asset.name,
        detail: assetKindMeta[asset.kind].label,
        keywords: [asset.originalName, asset.notes, ...asset.tags]
      })),
      ...worldNarrativeMilestones.map((milestone) => ({
        reference: { kind: "milestone" as const, id: milestone.id },
        title: milestone.title,
        detail: `${milestone.act} · ${narrativeStatusLabels[milestone.status]}`,
        keywords: [milestone.summary, milestone.developerNotes]
      })),
      ...worldManuscriptBooks.map((book) => ({
        reference: { kind: "manuscript-book" as const, id: book.id },
        title: book.title,
        detail: "书稿",
        keywords: [book.subtitle, book.summary]
      })),
      ...worldManuscriptVolumes.map((volume) => ({
        reference: { kind: "manuscript-volume" as const, id: volume.id },
        title: volume.title,
        detail: "文稿卷",
        keywords: [volume.summary]
      })),
      ...worldManuscriptChapters.map((chapter) => ({
        reference: { kind: "manuscript-chapter" as const, id: chapter.id },
        title: chapter.title,
        detail: `文稿章节 · ${countManuscriptWords(chapter.body).toLocaleString("zh-CN")} 字`,
        keywords: [chapter.summary, chapter.notes, manuscriptPlainText(chapter.body)]
      })),
      ...worldManuscriptScenes.map((scene) => ({
        reference: { kind: "manuscript-scene" as const, id: scene.id },
        title: scene.title,
        detail: "文稿场景",
        keywords: [scene.summary, scene.notes, manuscriptPlainText(scene.body)]
      })),
      ...worldStoryReviewIssues.map((issue) => ({
        reference: { kind: "review-issue" as const, id: issue.id },
        title: issue.title,
        detail: issue.status === "open" ? "待处理审阅问题" : "已解决审阅问题",
        keywords: [issue.detail]
      })),
      ...worldRelations.map((relation) => {
        const source = entityById.get(relation.sourceEntityId);
        const target = entityById.get(relation.targetEntityId);
        return {
          reference: { kind: "relation" as const, id: relation.id },
          title: `${source?.title ?? "失效条目"} - ${target?.title ?? "失效条目"}`,
          detail: relation.label || relationKindMeta[relation.kind].label,
          keywords: [
            relation.sourceCitation ?? "",
            relation.historicalScope ?? "",
            relation.notes
          ]
        };
      })
    ];
  }, [
    activeWorld,
    allWorldMarkers,
    worldAssets,
    worldEntities,
    worldMapRoutes,
    worldMaps,
    worldManuscriptBooks,
    worldManuscriptChapters,
    worldManuscriptScenes,
    worldManuscriptVolumes,
    worldNarrativeMilestones,
    worldQuests,
    worldRelations,
    worldStoryReviewIssues,
    worldStoryScenes,
    worldStoryVariables,
    worldTimelineEvents,
    worldTimelineTracks
  ]);

  const narrativeToolsActive = activeTab === "production" || activeTab === "health";
  const narrativeReferenceCatalog = useMemo(
    () => narrativeToolsActive ? ({
      questIds: new Set(worldQuests.map((item) => item.id)),
      sceneIds: new Set(worldStoryScenes.map((item) => item.id)),
      entityIds: new Set(worldEntities.map((item) => item.id)),
      timelineEventIds: new Set(worldTimelineEvents.map((item) => item.id)),
      mapMarkerIds: new Set(allWorldMarkers.map((item) => item.id)),
      reviewIssueIds: new Set(worldStoryReviewIssues.map((item) => item.id))
    }) : ({
      questIds: new Set<string>(),
      sceneIds: new Set<string>(),
      entityIds: new Set<string>(),
      timelineEventIds: new Set<string>(),
      mapMarkerIds: new Set<string>(),
      reviewIssueIds: new Set<string>()
    }),
    [allWorldMarkers, narrativeToolsActive, worldEntities, worldQuests, worldStoryReviewIssues, worldStoryScenes, worldTimelineEvents]
  );

  const narrativeIssues = useMemo(
    () => narrativeToolsActive ? validateNarrativeMilestones(worldNarrativeMilestones, narrativeReferenceCatalog) : [],
    [narrativeReferenceCatalog, narrativeToolsActive, worldNarrativeMilestones]
  );

  const narrativeCoverage = useMemo(
    () =>
      getNarrativeCoverage(
        narrativeToolsActive ? worldNarrativeMilestones : [],
        narrativeToolsActive ? worldQuests.map((item) => item.id) : [],
        narrativeToolsActive ? worldStoryScenes.map((item) => item.id) : []
      ),
    [narrativeToolsActive, worldNarrativeMilestones, worldQuests, worldStoryScenes]
  );

  const narrativeCriticalPath = useMemo(
    () => narrativeToolsActive ? findNarrativeCriticalPath(worldNarrativeMilestones) : [],
    [narrativeToolsActive, worldNarrativeMilestones]
  );

  const narrativeReferences = useMemo(
    () => narrativeToolsActive ? ({
      quest: worldQuests.map((item) => ({ id: item.id, title: item.title, detail: questStatusMeta[item.status].label })),
      scene: worldStoryScenes.map((item) => ({ id: item.id, title: item.title, detail: storySceneStatusLabels[item.status] })),
      entity: worldEntities.map((item) => ({ id: item.id, title: item.title, detail: entityTypeMeta[item.type].label })),
      timeline: worldTimelineEvents.map((item) => ({ id: item.id, title: item.title || item.displayDate || "未命名时间点", detail: formatTimelineInterval(item) })),
      marker: allWorldMarkers.map((item) => ({ id: item.id, title: item.label, detail: worldMaps.find((mapItem) => mapItem.id === item.mapId)?.title })),
      issue: worldStoryReviewIssues.map((item) => ({ id: item.id, title: item.title, detail: item.status === "open" ? "待处理" : "已解决" }))
    }) : ({ quest: [], scene: [], entity: [], timeline: [], marker: [], issue: [] }),
    [allWorldMarkers, narrativeToolsActive, worldEntities, worldMaps, worldQuests, worldStoryReviewIssues, worldStoryScenes, worldTimelineEvents]
  );

  const selectedStoryTestPreset = useMemo(
    () =>
      worldStoryTestPresets.find((preset) => preset.id === selectedStoryTestPresetId) ??
      worldStoryTestPresets[0] ??
      null,
    [selectedStoryTestPresetId, worldStoryTestPresets]
  );

  const selectedStoryReviewIssue = useMemo(
    () =>
      worldStoryReviewIssues.find((issue) => issue.id === selectedStoryReviewIssueId) ??
      worldStoryReviewIssues[0] ??
      null,
    [selectedStoryReviewIssueId, worldStoryReviewIssues]
  );

  const worldConsistencyFindings = useMemo(
    () =>
      data.consistencyFindings.filter((finding) => finding.worldId === activeWorld?.id),
    [activeWorld?.id, data.consistencyFindings]
  );
  const worldConsistencyScans = useMemo(
    () => data.consistencyScans.filter((scan) => scan.worldId === activeWorld?.id),
    [activeWorld?.id, data.consistencyScans]
  );
  const activeConsistencySettings = useMemo(
    () =>
      data.consistencySettings.find((settings) => settings.worldId === activeWorld?.id) ??
      createDefaultConsistencySettings(activeWorld?.id ?? ""),
    [activeWorld?.id, data.consistencySettings]
  );
  const activeConsistencyModelSettings = useMemo(
    () =>
      data.consistencyModelSettings.find(
        (settings) => settings.worldId === activeWorld?.id
      ) ?? createDefaultConsistencyModelSettings(activeWorld?.id ?? ""),
    [activeWorld?.id, data.consistencyModelSettings]
  );
  const worldAiMemoryItems = useMemo(
    () => data.aiMemoryItems.filter((item) => item.worldId === activeWorld?.id),
    [activeWorld?.id, data.aiMemoryItems]
  );
  const worldAiWritingSessions = useMemo(
    () => data.aiWritingSessions.filter((session) => session.worldId === activeWorld?.id),
    [activeWorld?.id, data.aiWritingSessions]
  );
  const worldAiOperationRuns = useMemo(
    () => data.aiOperationRuns.filter((run) => run.worldId === activeWorld?.id),
    [activeWorld?.id, data.aiOperationRuns]
  );
  const aiOperationContext = useMemo(
    () => activeTab === "ai" ? buildAiOperationContext(data, activeWorld?.id ?? "") : null,
    [activeTab, activeWorld?.id, data]
  );
  const createAiContexts = useCallback((): AiContext[] => {
    if (!activeWorld) return [];
    const contexts: AiContext[] = [
      {
        id: `world:${activeWorld.id}`,
        kind: "world",
        targetId: activeWorld.id,
        label: activeWorld.name,
        detail: "世界摘要",
        text: [
          `世界：${activeWorld.name}`,
          `简介：${activeWorld.description}`,
          `条目：${worldEntities.length}`,
          `任务：${worldQuests.length}`,
          `剧情场景：${worldStoryScenes.length}`,
          `叙事里程碑：${worldNarrativeMilestones.length}`,
          `书稿：${worldManuscriptBooks.length}`,
          `章节：${worldManuscriptChapters.length}`,
          `文稿场景：${worldManuscriptScenes.length}`
        ].join("\n")
      }
    ];
    worldEntities.forEach((entity) => {
      contexts.push({
        id: `entity:${entity.id}`,
        kind: "entity",
        targetId: entity.id,
        label: entity.title,
        detail: entityTypeMeta[entity.type].label,
        text: [
          `条目：${entity.title}`,
          `类型：${entityTypeMeta[entity.type].label}`,
          `摘要：${entity.summary}`,
          `标签：${entity.tags.join("、") || "无"}`,
          `正文：\n${richTextToPlainText(sanitizePublicationRichText(entity.content))}`
        ].join("\n")
      });
    });
    worldQuests.forEach((quest) => {
      contexts.push({
        id: `quest:${quest.id}`,
        kind: "quest",
        targetId: quest.id,
        label: quest.title,
        detail: "任务线",
        text: [
          `任务：${quest.title}`,
          `状态：${quest.status}`,
          `摘要：${quest.summary}`,
          `触发：${quest.trigger}`,
          ...quest.steps.map(
            (step, index) =>
              `${index + 1}. ${step.title}\n目标：${step.objective}\n条件：${step.condition}\n分支：${step.branch}\n失败：${step.failure}\n奖励：${step.reward}`
          )
        ].join("\n\n")
      });
    });
    worldStoryScenes.forEach((scene) => {
      contexts.push({
        id: `scene:${scene.id}`,
        kind: "scene",
        targetId: scene.id,
        label: scene.title,
        detail: "剧情场景",
        text: `场景：${scene.title}\n摘要：${scene.summary}\n\n${getStorySceneText(scene)}`
      });
    });
    worldNarrativeMilestones.forEach((milestone) => {
      contexts.push({
        id: `milestone:${milestone.id}`,
        kind: "milestone",
        targetId: milestone.id,
        label: milestone.title,
        detail: "章节 / 叙事里程碑",
        text: [
          `章节：${milestone.title}`,
          `卷 / 幕：${milestone.act}`,
          `摘要：${milestone.summary}`,
          `正文：\n${richTextToPlainText(sanitizePublicationRichText(milestone.manuscriptBody))}`
        ].join("\n")
      });
    });
    worldManuscriptBooks.forEach((book) => {
      contexts.push({
        id: `manuscript-book:${book.id}`,
        kind: "manuscript-book",
        targetId: book.id,
        label: book.title,
        detail: "全书上下文",
        text: buildManuscriptContext(
          worldManuscriptData,
          book.id,
          { kind: "book", id: book.id },
          36_000
        )
      });
    });
    worldManuscriptVolumes.forEach((volume) => {
      contexts.push({
        id: `manuscript-volume:${volume.id}`,
        kind: "manuscript-volume",
        targetId: volume.id,
        label: volume.title,
        detail: "卷级上下文",
        text: buildManuscriptContext(
          worldManuscriptData,
          volume.bookId,
          { kind: "volume", id: volume.id },
          36_000
        )
      });
    });
    worldManuscriptChapters.forEach((chapter) => {
      contexts.push({
        id: `manuscript-chapter:${chapter.id}`,
        kind: "manuscript-chapter",
        targetId: chapter.id,
        label: chapter.title,
        detail: "章节正文",
        text: buildManuscriptContext(
          worldManuscriptData,
          chapter.bookId,
          { kind: "chapter", id: chapter.id },
          58_000
        )
      });
    });
    worldManuscriptScenes.forEach((scene) => {
      contexts.push({
        id: `manuscript-scene:${scene.id}`,
        kind: "manuscript-scene",
        targetId: scene.id,
        label: scene.title,
        detail: "场景正文",
        text: buildManuscriptContext(
          worldManuscriptData,
          scene.bookId,
          { kind: "scene", id: scene.id },
          58_000
        )
      });
    });
    return contexts;
  }, [
    activeWorld,
    worldEntities,
    worldManuscriptBooks,
    worldManuscriptChapters,
    worldManuscriptData,
    worldManuscriptScenes,
    worldManuscriptVolumes,
    worldNarrativeMilestones,
    worldQuests,
    worldStoryScenes
  ]);
  const aiContexts = useMemo(
    () => activeTab === "ai" ? createAiContexts() : [],
    [activeTab, createAiContexts]
  );
  const getInlineAiSources = useCallback((): InlineAiSource[] => {
    const activeRef: ProjectObjectRef | null =
      activeTab === "codex" && selectedEntity
        ? { kind: "entity", id: selectedEntity.id }
        : activeTab === "quests" && selectedQuestId
          ? { kind: "quest", id: selectedQuestId }
        : activeTab === "story" && storyWorkspaceMode === "manuscript" && selectedManuscriptScene
            ? { kind: "manuscript-scene", id: selectedManuscriptScene.id }
          : activeTab === "story" && storyWorkspaceMode === "manuscript" && selectedManuscriptChapter
            ? { kind: "manuscript-chapter", id: selectedManuscriptChapter.id }
          : activeTab === "story" && selectedStoryScene
            ? { kind: "scene", id: selectedStoryScene.id }
            : null;
    const linkedContextIds = new Set<string>();
    if (activeRef) {
      for (const reference of projectReferenceIndex.references) {
        const sourceMatches =
          reference.source.kind === activeRef.kind && reference.source.id === activeRef.id;
        const targetMatches =
          reference.target.kind === activeRef.kind && reference.target.id === activeRef.id;
        if (sourceMatches) linkedContextIds.add(`${reference.target.kind}:${reference.target.id}`);
        if (targetMatches) linkedContextIds.add(`${reference.source.kind}:${reference.source.id}`);
      }
    }
    return createAiContexts().map((context) => ({
      ...context,
      relationReason: linkedContextIds.has(context.id) ? "当前对象直接关联" : undefined
    }));
  }, [activeTab, createAiContexts, projectReferenceIndex, selectedEntity, selectedManuscriptChapter, selectedManuscriptScene, selectedQuestId, selectedStoryScene, storyWorkspaceMode]);
  const authorWorkspaceData = useMemo<{
    writingItems: AuthorWritingItem[];
    queueItems: AuthorQueueItem[];
    issueItems: AuthorIssueItem[];
    openLoops: AuthorOpenLoopItem[];
    recentItems: AuthorRecentItem[];
    stats: AuthorWorkspaceStats;
  }>(() => {
    const empty = {
      writingItems: [],
      queueItems: [],
      issueItems: [],
      openLoops: [],
      recentItems: [],
      stats: { words: 0, chapters: 0, entities: 0, quests: 0, openIssues: 0 }
    };
    if (activeTab !== "author") return empty;

    const booksById = new globalThis.Map(worldManuscriptBooks.map((item) => [item.id, item]));
    const volumesById = new globalThis.Map(worldManuscriptVolumes.map((item) => [item.id, item]));
    const chaptersById = new globalThis.Map(worldManuscriptChapters.map((item) => [item.id, item]));
    const openAnnotationCount = (annotations: ManuscriptChapter["annotations"]) =>
      annotations.filter((annotation) => annotation.status === "open").length;
    const writingItems: AuthorWritingItem[] = [
      ...worldManuscriptChapters.map((chapter) => ({
        id: chapter.id,
        kind: "manuscript-chapter" as const,
        title: chapter.title,
        path: [booksById.get(chapter.bookId)?.title, volumesById.get(chapter.volumeId)?.title]
          .filter(Boolean)
          .join(" / "),
        summary: chapter.summary,
        status: manuscriptStatusLabels[chapter.status],
        words: countManuscriptWords(chapter.body),
        targetWords: chapter.targetWordCount,
        openAnnotations: openAnnotationCount(chapter.annotations),
        updatedAt: chapter.updatedAt
      })),
      ...worldManuscriptScenes.map((scene) => ({
        id: scene.id,
        kind: "manuscript-scene" as const,
        title: scene.title,
        path: [
          booksById.get(scene.bookId)?.title,
          volumesById.get(scene.volumeId)?.title,
          chaptersById.get(scene.chapterId)?.title
        ].filter(Boolean).join(" / "),
        summary: scene.summary,
        status: manuscriptStatusLabels[scene.status],
        words: countManuscriptWords(scene.body),
        targetWords: 0,
        openAnnotations: openAnnotationCount(scene.annotations),
        updatedAt: scene.updatedAt
      }))
    ].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

    const queueTone: Record<NarrativeMilestoneStatus, AuthorQueueItem["tone"] | "done"> = {
      planned: "planned",
      drafting: "active",
      ready: "ready",
      blocked: "blocked",
      done: "done"
    };
    const priorityOrder: Record<NarrativeMilestone["priority"], number> = {
      critical: 0,
      high: 1,
      normal: 2,
      low: 3
    };
    const queueItems: AuthorQueueItem[] = worldNarrativeMilestones
      .filter((item) => item.status !== "done")
      .sort((left, right) => priorityOrder[left.priority] - priorityOrder[right.priority] || left.order - right.order)
      .map((item) => ({
        id: item.id,
        title: item.title,
        detail: `${item.act} · ${narrativePriorityLabels[item.priority]}`,
        summary: item.status === "blocked" ? item.blockedReason || item.summary : item.summary,
        status: narrativeStatusLabels[item.status],
        tone: queueTone[item.status] as AuthorQueueItem["tone"]
      }));

    const issueItems: AuthorIssueItem[] = [
      ...worldStoryReviewIssues
        .filter((item) => item.status === "open")
        .map((item) => ({
          id: item.id,
          title: item.title,
          detail: worldStoryScenes.find((scene) => scene.id === item.sceneId)?.title || "剧情审阅",
          kind: "review" as const,
          severity: item.severity === "critical" ? "critical" as const : item.severity === "major" ? "major" as const : "normal" as const
        })),
      ...worldConsistencyFindings
        .filter((item) => item.detected && item.status === "open" && item.severity !== "minor")
        .map((item) => ({
          id: item.id,
          title: item.title,
          detail: item.primaryTarget.label,
          kind: "consistency" as const,
          severity: item.severity === "critical" ? "critical" as const : "major" as const
        })),
      ...writingItems
        .filter((item) => item.openAnnotations > 0)
        .map((item) => ({
          id: `manuscript:${item.kind}:${item.id}`,
          title: `${item.title}有 ${item.openAnnotations} 条待处理批注`,
          detail: item.path,
          kind: "manuscript" as const,
          severity: "normal" as const,
          targetKind: item.kind,
          targetId: item.id
        }))
    ].sort((left, right) => {
      const order = { critical: 0, major: 1, normal: 2 };
      return order[left.severity] - order[right.severity] || left.title.localeCompare(right.title, "zh-CN");
    });

    const openLoops: AuthorOpenLoopItem[] = worldAiMemoryItems
      .filter((item) => item.category === "open-loop" && item.state !== "superseded")
      .sort((left, right) => Number(right.pinned) - Number(left.pinned) || right.updatedAt.localeCompare(left.updatedAt))
      .map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        confirmed: item.state === "confirmed",
        pinned: item.pinned
      }));

    const recentItems: AuthorRecentItem[] = [
      ...writingItems.map((item) => ({
        id: item.id,
        kind: item.kind,
        title: item.title,
        detail: `${item.status} · ${item.words.toLocaleString("zh-CN")} 字`,
        updatedAt: item.updatedAt
      })),
      ...worldEntities.map((item) => ({
        id: item.id,
        kind: "entity" as const,
        title: item.title,
        detail: entityTypeMeta[item.type].label,
        updatedAt: item.updatedAt
      })),
      ...worldQuests.map((item) => ({
        id: item.id,
        kind: "quest" as const,
        title: item.title,
        detail: questStatusMeta[item.status].label,
        updatedAt: item.updatedAt
      })),
      ...worldStoryScenes.map((item) => ({
        id: item.id,
        kind: "scene" as const,
        title: item.title,
        detail: storySceneStatusLabels[item.status],
        updatedAt: item.updatedAt
      })),
      ...worldNarrativeMilestones.map((item) => ({
        id: item.id,
        kind: "milestone" as const,
        title: item.title,
        detail: narrativeStatusLabels[item.status],
        updatedAt: item.updatedAt
      }))
    ].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    const manuscriptStats = getManuscriptStatistics(worldManuscriptData);

    return {
      writingItems,
      queueItems,
      issueItems,
      openLoops,
      recentItems,
      stats: {
        words: manuscriptStats.totalWords,
        chapters: worldManuscriptChapters.length,
        entities: worldEntities.length,
        quests: worldQuests.length,
        openIssues: issueItems.length
      }
    };
  }, [activeTab, worldAiMemoryItems, worldConsistencyFindings, worldEntities, worldManuscriptBooks, worldManuscriptChapters, worldManuscriptData, worldManuscriptScenes, worldManuscriptVolumes, worldNarrativeMilestones, worldQuests, worldStoryReviewIssues, worldStoryScenes]);
  const selectedConsistencyFinding = useMemo(
    () =>
      worldConsistencyFindings.find(
        (finding) => finding.id === selectedConsistencyFindingId
      ) ?? worldConsistencyFindings[0] ?? null,
    [selectedConsistencyFindingId, worldConsistencyFindings]
  );

  const filteredWorldQuests = useMemo(
    () =>
      worldQuests.filter(
        (quest) => questCategoryFilter === "all" || quest.category === questCategoryFilter
      ),
    [questCategoryFilter, worldQuests]
  );

  const questCategoryCounts = useMemo(
    () =>
      worldQuests.reduce<Record<QuestCategory, number>>(
        (counts, quest) => {
          counts[quest.category] += 1;
          return counts;
        },
        { main: 0, side: 0, character: 0 }
      ),
    [worldQuests]
  );

  const questVisuals = useMemo(
    () => {
      if (
        activeTab !== "quests" ||
        (questWorkspaceMode !== "graph" && visualFullscreen !== "dependency")
      ) {
        return [];
      }
      return filteredWorldQuests.map((quest) => ({
        ...quest,
        status: questStatusMeta[quest.status].label,
        participantIds: resolveQuestEntities(quest, worldEntities).map((entity) => entity.id)
      }));
    },
    [activeTab, filteredWorldQuests, questWorkspaceMode, visualFullscreen, worldEntities]
  );

  const questEntityNames = useMemo(
    () =>
      Object.fromEntries(worldEntities.map((entity) => [entity.id, entity.title])) as Record<
        string,
        string
      >,
    [worldEntities]
  );

  const questParticipationRows = useMemo(
    () => {
      if (activeTab !== "quests" || questWorkspaceMode !== "participation") return [];
      return worldEntities
        .filter(
          (entity): entity is Entity & { type: "character" | "location" } =>
            entity.type === "character" || entity.type === "location"
        )
        .map((entity) => ({
          entity: {
            id: entity.id,
            title: entity.title,
            type: entity.type,
            summary: entity.summary
          },
          quests: filteredWorldQuests
            .filter((quest) =>
              resolveQuestEntities(quest, worldEntities).some(
                (participant) => participant.id === entity.id
              )
            )
            .map((quest) => ({
              id: quest.id,
              title: quest.title,
              category: quest.category
            }))
        }))
        .sort((left, right) => right.quests.length - left.quests.length);
    },
    [activeTab, filteredWorldQuests, questWorkspaceMode, worldEntities]
  );

  const selectedQuest = useMemo(
    () =>
      worldQuests.find((quest) => quest.id === selectedQuestId) ??
      worldQuests[0] ??
      null,
    [selectedQuestId, worldQuests]
  );

  const selectedQuestBackReferences = useMemo(
    () =>
      selectedQuest
        ? getProjectBackReferences(projectReferenceIndex, {
            kind: "quest",
            id: selectedQuest.id
          })
        : [],
    [projectReferenceIndex, selectedQuest]
  );

  const selectedQuestEntities = useMemo(
    () => (selectedQuest ? resolveQuestEntities(selectedQuest, worldEntities) : []),
    [selectedQuest, worldEntities]
  );

  const selectedQuestMentions = useMemo(
    () => (selectedQuest ? extractMentions(getQuestText(selectedQuest)) : []),
    [selectedQuest]
  );

  const selectedQuestTimelineEvents = useMemo(
    () =>
      selectedQuest
        ? worldTimelineEvents.filter((timelineEvent) => timelineEvent.questId === selectedQuest.id)
        : [],
    [selectedQuest, worldTimelineEvents]
  );

  const selectedEntityQuestRefs = useMemo(() => {
    if (!selectedEntity) {
      return [];
    }

    return worldQuests.filter((quest) =>
      resolveQuestEntities(quest, worldEntities).some((entity) => entity.id === selectedEntity.id)
    );
  }, [selectedEntity, worldEntities, worldQuests]);

  const selectedEntityRelationRefs = useMemo(
    () =>
      selectedEntity
        ? worldRelations.filter(
            (relation) =>
              relation.sourceEntityId === selectedEntity.id ||
              relation.targetEntityId === selectedEntity.id
          )
        : [],
    [selectedEntity, worldRelations]
  );

  const worldMembers = useMemo(
    () => data.members.filter((member) => member.worldId === activeWorld?.id),
    [activeWorld?.id, data.members]
  );

  const deferredEntityQuery = useDeferredValue(query);
  const filteredEntities = useMemo(() => {
    const normalizedQuery = normalize(deferredEntityQuery);
    return worldEntities
      .filter((entity) => activeType === "all" || entity.type === activeType)
      .filter((entity) => {
        if (!normalizedQuery) {
          return true;
        }
        const haystack = normalize(
          [
            entity.title,
            entity.summary,
            entity.content,
            entity.tags.join(" "),
            Object.values(entity.templateData).join(" ")
          ].join(" ")
        );
        return haystack.includes(normalizedQuery);
      });
  }, [activeType, deferredEntityQuery, worldEntities]);

  const outgoingLinks = useMemo(() => {
    if (!selectedEntity) {
      return [];
    }

    return extractMentions(selectedEntity.content).map((mention) => ({
      label: mention,
      target:
        worldEntities.find((entity) => normalize(entity.title) === normalize(mention)) ?? null
    }));
  }, [selectedEntity, worldEntities]);

  const backlinks = useMemo(() => {
    return selectedEntity
      ? getProjectBackReferences(projectReferenceIndex, {
          kind: "entity",
          id: selectedEntity.id
        })
      : [];
  }, [projectReferenceIndex, selectedEntity]);

  const selectedEntityImpact = useMemo(
    () =>
      activeTab === "codex" && selectedEntity
        ? buildChangeImpactReport(
            projectReferenceIndex,
            { kind: "entity", id: selectedEntity.id },
            selectedEntity.title,
            3
          )
        : null,
    [activeTab, projectReferenceIndex, selectedEntity]
  );

  const missingTemplateFields = useMemo(() => {
    if (!selectedEntity || !selectedEntityTemplate) {
      return [];
    }
    return selectedEntityTemplate.fields.filter(
      (field) => field.required && !selectedEntity.templateData[field.key]?.trim()
    );
  }, [selectedEntity, selectedEntityTemplate]);

  const typeCounts = useMemo(() => {
    return worldEntities.reduce<Record<EntityType, number>>(
      (counts, entity) => {
        counts[entity.type] += 1;
        return counts;
      },
      {
        character: 0,
        location: 0,
        faction: 0,
        event: 0,
        item: 0,
        note: 0
      }
    );
  }, [worldEntities]);

  const recentCodexEntities = useMemo(() => {
    const seen = new Set<string>();
    return [...codexHistory]
      .slice(0, codexHistoryIndex + 1)
      .reverse()
      .filter((entry) => {
        const key = `${entry.worldId}:${entry.entityId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((entry) => ({
        ...entry,
        entity: data.entities.find((entity) => entity.id === entry.entityId),
        world: data.worlds.find((world) => world.id === entry.worldId)
      }))
      .filter((entry) => entry.entity && entry.world)
      .slice(0, 8);
  }, [codexHistory, codexHistoryIndex, data.entities, data.worlds]);

  const globalSearchResults = useMemo<GlobalSearchResult[]>(() => {
    if (!globalSearchOpen) return [];
    const entityNames = new globalThis.Map(
      worldEntities.map((entity) => [entity.id, entity.title])
    );
    const questNames = new globalThis.Map(worldQuests.map((quest) => [quest.id, quest.title]));
    const sceneNames = new globalThis.Map(
      worldStoryScenes.map((scene) => [scene.id, scene.title])
    );
    const mapNames = new globalThis.Map(worldMaps.map((mapItem) => [mapItem.id, mapItem.title]));
    const markerNames = new globalThis.Map(
      allWorldMarkers.map((marker) => [marker.id, marker.label])
    );
    const trackNames = new globalThis.Map(
      worldTimelineTracks.map((track) => [track.id, track.name])
    );
    const markerKindLabels: Record<MapMarker["markerType"], string> = {
      character: "角色",
      location: "地点",
      faction: "阵营",
      event: "事件",
      item: "物品",
      note: "注记",
      quest: "任务",
      scene: "剧情场景",
      custom: "自定义"
    };

    const entityResults = worldEntities.map<GlobalSearchResult>((entity) => ({
      key: `entity:${entity.id}`,
      kind: "entity",
      itemId: entity.id,
      title: entity.title,
      description: entity.summary,
      context: `${entityTypeMeta[entity.type].label} · ${entity.tags.slice(0, 3).join("、") || visibilityMeta[entity.visibility].label}`,
      searchText: [
        entity.title,
        entity.summary,
        entity.content,
        entity.tags.join(" "),
        Object.values(entity.templateData).join(" "),
        entityTypeMeta[entity.type].label
      ].join(" "),
      updatedAt: entity.updatedAt,
      icon: entityTypeMeta[entity.type].icon
    }));

    const categoryResults = worldCodexCategories.map<GlobalSearchResult>((category) => ({
      key: `category:${category.id}`,
      kind: "category",
      itemId: category.id,
      title: category.title,
      description: category.description || "知识库分类",
      context: `${worldEntities.filter((entity) => entity.categoryId === category.id).length} 个直接条目`,
      searchText: `${category.title} ${category.description}`,
      updatedAt: category.updatedAt,
      icon: FolderOpen
    }));

    const entityTemplateResults = worldEntityTemplates.map<GlobalSearchResult>((template) => ({
      key: `template:${template.id}`,
      kind: "template",
      itemId: template.id,
      title: template.name,
      description: template.description,
      context: `${template.entityTypes.map((type) => templateEntityTypeLabels[type]).join("、")} · ${template.fields.length} 字段`,
      searchText: [
        template.name,
        template.description,
        template.entityTypes.map((type) => templateEntityTypeLabels[type]).join(" "),
        ...template.fields.flatMap((field) => [field.label, field.key, entityTemplateFieldTypeLabels[field.type], field.options.join(" ")])
      ].join(" "),
      updatedAt: template.updatedAt,
      icon: Boxes
    }));

    const questResults = worldQuests.map<GlobalSearchResult>((quest) => ({
      key: `quest:${quest.id}`,
      kind: "quest",
      itemId: quest.id,
      title: quest.title,
      description: quest.summary,
      context: `${questCategoryMeta[quest.category].label} · ${questStatusMeta[quest.status].label}`,
      searchText: [
        quest.title,
        quest.summary,
        quest.trigger,
        quest.developerNotes,
        quest.steps
          .map((step) =>
            [
              step.title,
              step.objective,
              step.condition,
              step.branch,
              step.failure,
              step.reward,
              step.notes
            ].join(" ")
          )
          .join(" "),
        quest.relatedEntityIds.map((id) => entityNames.get(id) ?? "").join(" "),
        quest.prerequisiteQuestIds.map((id) => questNames.get(id) ?? "").join(" ")
      ].join(" "),
      updatedAt: quest.updatedAt,
      icon: Route
    }));

    const storySceneResults = worldStoryScenes.map<GlobalSearchResult>((scene) => {
      const referencedVariableIds = new Set(
        scene.nodes.flatMap((node) => [
          ...node.conditions.map((condition) => condition.variableId),
          ...node.effects.map((effect) => effect.variableId),
          ...node.choices.flatMap((choice) => [
            ...choice.conditions.map((condition) => condition.variableId),
            ...choice.effects.map((effect) => effect.variableId)
          ])
        ])
      );
      return {
        key: `scene:${scene.id}`,
        kind: "scene",
        itemId: scene.id,
        title: scene.title,
        description: scene.summary,
        context: `${storySceneStatusLabels[scene.status]} · ${scene.nodes.length} 节点`,
        searchText: [
          getStorySceneText(scene),
          scene.relatedEntityIds.map((id) => entityNames.get(id) ?? "").join(" "),
          scene.relatedQuestIds.map((id) => questNames.get(id) ?? "").join(" "),
          worldStoryVariables
            .filter((variable) => referencedVariableIds.has(variable.id))
            .map((variable) => `${variable.name} ${variable.key}`)
            .join(" ")
        ].join(" "),
        updatedAt: scene.updatedAt,
        icon: MessagesSquare
      };
    });

    const storyVariableResults = worldStoryVariables.map<GlobalSearchResult>((variable) => ({
      key: `variable:${variable.id}`,
      kind: "variable",
      itemId: variable.id,
      title: variable.name,
      description: variable.description,
      context: `${storyVariableTypeLabels[variable.type]} · ${variable.key}`,
      searchText: [
        variable.name,
        variable.key,
        variable.description,
        String(variable.defaultValue)
      ].join(" "),
      updatedAt: variable.updatedAt,
      icon: Variable
    }));

    const storyTestPresetResults = worldStoryTestPresets.map<GlobalSearchResult>((preset) => {
      const scene = worldStoryScenes.find((item) => item.id === preset.sceneId);
      return {
        key: `test:${preset.id}`,
        kind: "test",
        itemId: preset.id,
        title: preset.name,
        description: preset.description,
        context: `${scene?.title ?? "失效场景"} · 深度 ${preset.maxDepth}`,
        searchText: [
          preset.name,
          preset.description,
          scene?.title,
          ...Object.entries(preset.initialState).map(([variableId, value]) => {
            const variable = worldStoryVariables.find((item) => item.id === variableId);
            return `${variable?.name ?? variableId} ${variable?.key ?? ""} ${String(value)}`;
          })
        ].join(" "),
        updatedAt: preset.updatedAt,
        icon: FlaskConical
      };
    });

    const storyReviewIssueResults = worldStoryReviewIssues.map<GlobalSearchResult>((issue) => {
      const scene = worldStoryScenes.find((item) => item.id === issue.sceneId);
      return {
        key: `issue:${issue.id}`,
        kind: "issue",
        itemId: issue.id,
        title: issue.title,
        description: issue.detail,
        context: `${issue.status === "open" ? "待处理" : "已解决"} · ${scene?.title ?? "未关联场景"}`,
        searchText: [
          issue.title,
          issue.detail,
          issue.severity,
          issue.status,
          issue.sourceFindingKind,
          scene?.title,
          entityNames.get(issue.entityId),
          questNames.get(issue.questId)
        ]
          .filter(Boolean)
          .join(" "),
        updatedAt: issue.updatedAt
      };
    });

    const narrativeMilestoneResults = worldNarrativeMilestones.map<GlobalSearchResult>(
      (milestone) => ({
        key: `milestone:${milestone.id}`,
        kind: "milestone",
        itemId: milestone.id,
        title: milestone.title,
        description: milestone.summary || milestone.blockedReason,
        context: `${milestone.act} · ${narrativeStatusLabels[milestone.status]} · ${narrativePriorityLabels[milestone.priority]}`,
        searchText: [
          milestone.title,
          milestone.summary,
          milestone.act,
          milestone.blockedReason,
          milestone.developerNotes,
          richTextToPlainText(milestone.manuscriptBody),
          narrativeStatusLabels[milestone.status],
          narrativePriorityLabels[milestone.priority],
          ...milestone.dependencyIds.map(
            (id) => worldNarrativeMilestones.find((item) => item.id === id)?.title ?? id
          ),
          ...milestone.linkedQuestIds.map((id) => questNames.get(id) ?? id),
          ...milestone.linkedSceneIds.map((id) => sceneNames.get(id) ?? id),
          ...milestone.linkedEntityIds.map((id) => entityNames.get(id) ?? id),
          ...milestone.linkedMapMarkerIds.map((id) => markerNames.get(id) ?? id)
        ].join(" "),
        updatedAt: milestone.updatedAt,
        icon: Flag
      })
    );

    const manuscriptBookResults = worldManuscriptBooks.map<GlobalSearchResult>((book) => ({
      key: `manuscript-book:${book.id}`,
      kind: "manuscript",
      manuscriptTargetType: "book",
      itemId: book.id,
      title: book.title,
      description: book.summary || book.subtitle,
      context: `${manuscriptBookStatusLabels[book.status]} · 全书`,
      searchText: [book.title, book.subtitle, book.summary].join(" "),
      updatedAt: book.updatedAt,
      icon: BookOpen
    }));
    const manuscriptVolumeResults = worldManuscriptVolumes.map<GlobalSearchResult>((volume) => ({
      key: `manuscript-volume:${volume.id}`,
      kind: "manuscript",
      manuscriptTargetType: "volume",
      itemId: volume.id,
      title: volume.title,
      description: volume.summary,
      context: `${manuscriptStatusLabels[volume.status]} · 卷`,
      searchText: [volume.title, volume.summary].join(" "),
      updatedAt: volume.updatedAt,
      icon: BookOpen
    }));
    const manuscriptChapterResults = worldManuscriptChapters.map<GlobalSearchResult>((chapter) => ({
      key: `manuscript-chapter:${chapter.id}`,
      kind: "manuscript",
      manuscriptTargetType: "chapter",
      itemId: chapter.id,
      title: chapter.title,
      description: chapter.summary || manuscriptPlainText(chapter.body).slice(0, 180),
      context: `${manuscriptStatusLabels[chapter.status]} · ${countManuscriptWords(chapter.body).toLocaleString("zh-CN")} 字`,
      searchText: [
        chapter.title,
        chapter.summary,
        chapter.notes,
        manuscriptPlainText(chapter.body)
      ].join(" "),
      updatedAt: chapter.updatedAt,
      icon: FileText
    }));
    const manuscriptSceneResults = worldManuscriptScenes.map<GlobalSearchResult>((scene) => ({
      key: `manuscript-scene:${scene.id}`,
      kind: "manuscript",
      manuscriptTargetType: "scene",
      itemId: scene.id,
      title: scene.title,
      description: scene.summary || manuscriptPlainText(scene.body).slice(0, 180),
      context: `${manuscriptStatusLabels[scene.status]} · 文稿场景`,
      searchText: [scene.title, scene.summary, scene.notes, manuscriptPlainText(scene.body)].join(" "),
      updatedAt: scene.updatedAt,
      icon: FileText
    }));

    const relationResults = worldRelations.map<GlobalSearchResult>((relation) => {
      const sourceName = entityNames.get(relation.sourceEntityId) ?? "未知条目";
      const targetName = entityNames.get(relation.targetEntityId) ?? "未知条目";
      return {
        key: `relation:${relation.id}`,
        kind: "relation",
        itemId: relation.id,
        relatedEntityId: relation.sourceEntityId,
        title: relation.label || `${sourceName}与${targetName}`,
        description: `${sourceName} → ${targetName}`,
        context: relationKindMeta[relation.kind].label,
        searchText: [
          relation.label,
          relation.sourceCitation,
          relation.historicalScope,
          relation.notes,
          sourceName,
          targetName,
          relationKindMeta[relation.kind].label
        ].join(" "),
        updatedAt: relation.updatedAt,
        icon: Network
      };
    });

    const mapResults = worldMaps.map<GlobalSearchResult>((mapItem) => ({
      key: `map:${mapItem.id}`,
      kind: "map",
      itemId: mapItem.id,
      planningTargetType: "map",
      title: mapItem.title,
      description: mapItem.description,
      context: `${allWorldMarkers.filter((marker) => marker.mapId === mapItem.id).length} 个标记 · ${worldMapRoutes.filter((route) => route.mapId === mapItem.id).length} 条路线`,
      searchText: [
        mapItem.title,
        mapItem.description,
        ...allWorldMarkers
          .filter((marker) => marker.mapId === mapItem.id)
          .map((marker) => `${marker.label} ${marker.description}`),
        ...worldMapRoutes
          .filter((route) => route.mapId === mapItem.id)
          .map((route) => `${route.title} ${route.description}`)
      ].join(" "),
      updatedAt: mapItem.updatedAt,
      icon: Map
    }));

    const markerResults = allWorldMarkers.map<GlobalSearchResult>((marker) => {
      const kindLabel = markerKindLabels[marker.markerType];
      return {
        key: `marker:${marker.id}`,
        kind: "map",
        itemId: marker.id,
        relatedEntityId: marker.entityId || undefined,
        planningTargetType: "marker",
        title: marker.label,
        description: marker.description,
        context: `${mapNames.get(marker.mapId) ?? "失效地图"} · ${kindLabel}`,
        searchText: [
          marker.label,
          marker.description,
          kindLabel,
          mapNames.get(marker.mapId),
          entityNames.get(marker.entityId),
          questNames.get(marker.questId),
          sceneNames.get(marker.sceneId)
        ]
          .filter(Boolean)
          .join(" "),
        updatedAt: marker.updatedAt,
        icon: MapPin
      };
    });

    const mapRouteResults = worldMapRoutes.map<GlobalSearchResult>((route) => ({
      key: `route:${route.id}`,
      kind: "route",
      itemId: route.id,
      planningTargetType: "route",
      title: route.title,
      description: route.description,
      context: `${mapNames.get(route.mapId) ?? "失效地图"} · ${route.stops.length} 个停靠点`,
      searchText: [
        route.title,
        route.description,
        route.status,
        mapNames.get(route.mapId),
        ...route.stops.map(
          (stop) =>
            `${stop.title} ${stop.duration} ${stop.notes} ${markerNames.get(stop.markerId) ?? ""}`
        )
      ]
        .filter(Boolean)
        .join(" "),
      updatedAt: route.updatedAt,
      icon: Route
    }));

    const timelineTrackResults = worldTimelineTracks.map<GlobalSearchResult>((track) => ({
      key: `track:${track.id}`,
      kind: "timeline",
      itemId: track.id,
      planningTargetType: "track",
      title: track.name,
      description: track.description,
      context: `${worldTimelineEvents.filter((event) => event.trackId === track.id).length} 个时间点 · 轨道 ${track.order}`,
      searchText: [
        track.name,
        track.description,
        ...worldTimelineEvents
          .filter((event) => event.trackId === track.id)
          .map((event) => `${event.title} ${event.summary} ${event.displayDate} ${event.era}`)
      ].join(" "),
      updatedAt: track.updatedAt,
      icon: CalendarDays
    }));

    const timelineResults = timelineItems.map<GlobalSearchResult>((item) => ({
      key: `timeline:${item.id}`,
      kind: "timeline",
      itemId: item.id,
      relatedEntityId: item.entityId,
      planningTargetType: "timeline",
      title:
        item.title ||
        item.entity?.title ||
        questNames.get(item.questId) ||
        sceneNames.get(item.sceneId) ||
        "未命名时间点",
      description:
        item.summary ||
        item.entity?.summary ||
        worldQuests.find((quest) => quest.id === item.questId)?.summary ||
        worldStoryScenes.find((scene) => scene.id === item.sceneId)?.summary ||
        "暂无说明",
      context:
        [
          formatTimelineInterval(item),
          item.era,
          trackNames.get(item.trackId) ?? "失效轨道"
        ]
          .filter(Boolean)
          .join(" · ") || "未设置时间",
      searchText: [
        item.title,
        item.summary,
        item.entity?.title,
        item.entity?.summary,
        item.entity?.content,
        questNames.get(item.questId),
        sceneNames.get(item.sceneId),
        trackNames.get(item.trackId),
        item.displayDate,
        item.startValue,
        item.endValue,
        item.era,
        ...item.dependencyIds.map((dependencyId) => {
          const dependency = worldTimelineEvents.find((event) => event.id === dependencyId);
          return dependency?.title || dependency?.displayDate || dependencyId;
        })
      ]
        .filter(Boolean)
        .join(" "),
      updatedAt: item.updatedAt,
      icon: CalendarDays
    }));

    const assetResults = worldAssets.map<GlobalSearchResult>((asset) => ({
      key: `asset:${asset.id}`,
      kind: "asset",
      itemId: asset.id,
      title: asset.name,
      description: asset.notes || asset.originalName,
      context: `${assetKindMeta[asset.kind].label} · ${formatFileSize(asset.size)}`,
      searchText: [
        asset.name,
        asset.originalName,
        asset.notes,
        asset.tags.join(" "),
        asset.linkedEntityIds.map((id) => entityNames.get(id) ?? "").join(" "),
        assetKindMeta[asset.kind].label
      ].join(" "),
      updatedAt: asset.updatedAt,
      icon: assetKindMeta[asset.kind].icon
    }));

    const consistencySeverityLabels = {
      critical: "严重",
      major: "重要",
      minor: "提示"
    } as const;
    const consistencyStatusLabels = {
      open: "待处理",
      ignored: "已忽略",
      resolved: "已修复"
    } as const;
    const consistencyResults = worldConsistencyFindings.map<GlobalSearchResult>((finding) => ({
      key: `consistency:${finding.id}`,
      kind: "consistency",
      itemId: finding.id,
      title: `${finding.ruleId} · ${finding.title}`,
      description: finding.detail,
      context: `${consistencySeverityLabels[finding.severity]} · ${consistencyStatusLabels[finding.status]} · ${finding.primaryTarget.label}`,
      searchText: [
        finding.ruleId,
        finding.title,
        finding.detail,
        finding.suggestion,
        finding.statusReason,
        finding.category,
        finding.severity,
        finding.status,
        finding.primaryTarget.label,
        ...finding.relatedTargets.map((target) => target.label),
        ...finding.evidence.flatMap((evidence) => [
          evidence.label,
          evidence.value,
          evidence.field,
          evidence.target?.label ?? ""
        ]),
        finding.explanation?.text ?? ""
      ].join(" "),
      updatedAt: finding.statusUpdatedAt || finding.lastSeenAt,
      icon: ScanSearch
    }));
    const consistencySettingsResult: GlobalSearchResult = {
      key: `consistency-settings:${activeConsistencySettings.id}`,
      kind: "consistency",
      itemId: worldConsistencyFindings.find((finding) => finding.detected)?.id ?? "",
      title: "一致性规则设置",
      description: `${activeConsistencySettings.disabledRuleIds.length} 条规则已关闭 · 模板缺项阈值 ${activeConsistencySettings.maxMissingTemplateFields} · 路线访问阈值 ${activeConsistencySettings.maxRouteMarkerVisits}`,
      context: "按世界保存 · 规则开关与阈值",
      searchText: [
        "一致性 规则 设置 开关 阈值",
        activeConsistencySettings.disabledRuleIds.join(" "),
        `模板缺项 ${activeConsistencySettings.maxMissingTemplateFields}`,
        `路线访问 ${activeConsistencySettings.maxRouteMarkerVisits}`
      ].join(" "),
      updatedAt: activeConsistencySettings.updatedAt,
      icon: ScanSearch
    };
    const consistencyScanResults = worldConsistencyScans.map<GlobalSearchResult>((scan) => ({
      key: `consistency-scan:${scan.id}`,
      kind: "consistency",
      itemId: scan.activeFindingIds[0] ?? "",
      title: `一致性扫描 · ${formatDateLabel(scan.completedAt)}`,
      description: `${scan.totalDetected} 项发现 · ${scan.openCount} 项待处理 · 新增 ${scan.newFindingIds.length} · 消失 ${scan.resolvedFindingIds.length}`,
      context: `${scan.criticalCount} 严重 · ${scan.majorCount} 重要 · ${scan.minorCount} 提示`,
      searchText: [
        "一致性 扫描 摘要",
        scan.id,
        scan.totalDetected,
        scan.openCount,
        scan.ignoredCount,
        scan.criticalCount,
        scan.majorCount,
        scan.minorCount,
        scan.newFindingIds.length,
        scan.resolvedFindingIds.length,
        scan.reopenedFindingIds.length
      ].join(" "),
      updatedAt: scan.completedAt,
      icon: ScanSearch
    }));

    return [
      ...categoryResults,
      ...entityResults,
      ...entityTemplateResults,
      ...questResults,
      ...storySceneResults,
      ...storyVariableResults,
      ...storyTestPresetResults,
      ...storyReviewIssueResults,
      ...narrativeMilestoneResults,
      ...manuscriptBookResults,
      ...manuscriptVolumeResults,
      ...manuscriptChapterResults,
      ...manuscriptSceneResults,
      ...relationResults,
      ...mapResults,
      ...markerResults,
      ...mapRouteResults,
      ...timelineTrackResults,
      ...timelineResults,
      ...consistencyResults,
      consistencySettingsResult,
      ...consistencyScanResults,
      ...assetResults
    ];
  }, [activeConsistencySettings, allWorldMarkers, globalSearchOpen, timelineItems, worldAssets, worldCodexCategories, worldConsistencyFindings, worldConsistencyScans, worldEntities, worldEntityTemplates, worldManuscriptBooks, worldManuscriptChapters, worldManuscriptScenes, worldManuscriptVolumes, worldMapRoutes, worldMaps, worldNarrativeMilestones, worldQuests, worldRelations, worldStoryReviewIssues, worldStoryScenes, worldStoryTestPresets, worldStoryVariables, worldTimelineEvents, worldTimelineTracks]);

  const searchWorkspaceIndex = useCallback(
    async (searchQuery: string) => {
      if (!window.worldcraftStore || !activeWorldId) return [];
      const result = await window.worldcraftStore.searchWorkspace(
        searchQuery,
        activeWorldId,
        80
      );
      return result.ok ? result.results.map((match) => match.searchKey) : [];
    },
    [activeWorldId]
  );

  const projectHealthIssues = useMemo<HealthIssue[]>(() => {
    if (activeTab !== "health") return [];
    const issues: HealthIssue[] = [];
    const entityIds = new Set(worldEntities.map((entity) => entity.id));
    const entityTitles = new Set(
      worldEntities.map((entity) => normalize(entity.title)).filter(Boolean)
    );
    const questIds = new Set(worldQuests.map((quest) => quest.id));
    const storyVariableIds = new Set(worldStoryVariables.map((variable) => variable.id));
    const storySceneIds = new Set(worldStoryScenes.map((scene) => scene.id));
    const storyNodeIds = new Set(
      worldStoryScenes.flatMap((scene) => scene.nodes.map((node) => node.id))
    );
    const storyChoiceIds = new Set(
      worldStoryScenes.flatMap((scene) =>
        scene.nodes.flatMap((node) => node.choices.map((choice) => choice.id))
      )
    );
    const storyTestPresetIds = new Set(worldStoryTestPresets.map((preset) => preset.id));
    const storyTestRunIds = new Set(worldStoryTestRuns.map((run) => run.id));
    const worldMaps = data.maps.filter((mapItem) => mapItem.worldId === activeWorld.id);
    const worldMapIds = new Set(worldMaps.map((mapItem) => mapItem.id));
    const worldLayersForHealth = data.mapLayers.filter((layer) =>
      worldMapIds.has(layer.mapId)
    );
    const worldGroupsForHealth = data.mapMarkerGroups.filter((group) =>
      worldMapIds.has(group.mapId)
    );
    const worldMarkersForHealth = data.mapMarkers.filter(
      (marker) =>
        worldMapIds.has(marker.mapId) ||
        Boolean(marker.entityId && entityIds.has(marker.entityId)) ||
        Boolean(marker.questId && questIds.has(marker.questId)) ||
        Boolean(marker.sceneId && storySceneIds.has(marker.sceneId))
    );
    const worldRoutesForHealth = data.mapRoutes.filter(
      (route) => route.worldId === activeWorld.id
    );
    const worldTracksForHealth = data.timelineTracks.filter(
      (track) => track.worldId === activeWorld.id
    );
    const worldTimelineForHealth = data.timelineEvents.filter(
      (event) => event.worldId === activeWorld.id
    );

    function checkDuplicateIds(
      label: string,
      items: Array<{ id: string }>,
      tab: HealthTarget["tab"],
      storyTestMode?: StoryTestWorkspaceMode,
      planningTargetType?: HealthTarget["planningTargetType"]
    ) {
      const seen = new Set<string>();
      items.forEach((item) => {
        if (seen.has(item.id)) {
          issues.push({
            id: `duplicate:${label}:${item.id}`,
            severity: "error",
            title: `${label}存在重复 ID`,
            detail: item.id,
            target: { tab, itemId: item.id, storyTestMode, planningTargetType }
          });
        }
        seen.add(item.id);
      });
    }

    checkDuplicateIds("条目", worldEntities, "codex");
    codexHierarchyIssues.forEach((issue) => {
      issues.push({
        id: issue.id,
        severity: issue.severity,
        title: issue.title,
        detail: issue.detail,
        target: issue.entityId
          ? { tab: "codex", itemId: issue.entityId }
          : { tab: "codex" }
      });
    });
    checkDuplicateIds("设定模板", worldEntityTemplates, "templates");
    checkDuplicateIds("任务", worldQuests, "quests");
    checkDuplicateIds("剧情场景", worldStoryScenes, "story");
    checkDuplicateIds("剧情变量", worldStoryVariables, "story");
    checkDuplicateIds("测试预设", worldStoryTestPresets, "testing", "analysis");
    checkDuplicateIds("测试记录", worldStoryTestRuns, "testing", "analysis");
    checkDuplicateIds("审阅问题", worldStoryReviewIssues, "testing", "issues");
    checkDuplicateIds("叙事里程碑", worldNarrativeMilestones, "production");
    checkDuplicateIds("关系", worldRelations, "relations");
    checkDuplicateIds("资源", worldAssets, "assets");
    checkDuplicateIds("地图", worldMaps, "map", undefined, "map");
    checkDuplicateIds("地图图层", worldLayersForHealth, "map", undefined, "map");
    checkDuplicateIds("地图标记组", worldGroupsForHealth, "map", undefined, "map");
    checkDuplicateIds("地图标记", worldMarkersForHealth, "map", undefined, "marker");
    checkDuplicateIds("地图路线", worldRoutesForHealth, "map", undefined, "route");
    checkDuplicateIds("一致性发现", worldConsistencyFindings, "consistency");

    entityTemplateIssues.forEach((templateIssue, index) => {
      issues.push({
        id: `template:${templateIssue.code}:${templateIssue.templateId ?? templateIssue.entityId ?? index}:${index}`,
        severity: templateIssue.severity,
        title: templateIssue.title,
        detail: templateIssue.detail,
        target: templateIssue.entityId
          ? { tab: "codex", itemId: templateIssue.entityId }
          : { tab: "templates", itemId: templateIssue.templateId }
      });
    });

    narrativeIssues.forEach((narrativeIssue, index) => {
      issues.push({
        id: `narrative:${narrativeIssue.code}:${narrativeIssue.milestoneId}:${index}`,
        severity: narrativeIssue.severity,
        title: narrativeIssue.title,
        detail: narrativeIssue.detail,
        target: { tab: "production", itemId: narrativeIssue.milestoneId }
      });
    });

    if (narrativeCoverage.unlinkedQuestIds.length) {
      issues.push({
        id: `narrative:unlinked-quests:${activeWorld.id}`,
        severity: "warning",
        title: "部分任务尚未纳入叙事制作计划",
        detail: `${narrativeCoverage.unlinkedQuestIds.length} 条任务未被任何里程碑覆盖`,
        target: { tab: "production" }
      });
    }
    if (narrativeCoverage.unlinkedSceneIds.length) {
      issues.push({
        id: `narrative:unlinked-scenes:${activeWorld.id}`,
        severity: "warning",
        title: "部分剧情场景尚未纳入叙事制作计划",
        detail: `${narrativeCoverage.unlinkedSceneIds.length} 个场景未被任何里程碑覆盖`,
        target: { tab: "production" }
      });
    }

    worldConsistencyFindings
      .filter(
        (finding) =>
          finding.detected &&
          finding.status === "open" &&
          finding.severity !== "minor"
      )
      .forEach((finding) => {
        issues.push({
          id: `consistency:${finding.id}`,
          severity: finding.severity === "critical" ? "error" : "warning",
          title: `${finding.ruleId} · ${finding.title}`,
          detail: `${finding.primaryTarget.label}：${finding.detail}`,
          target: { tab: "consistency", itemId: finding.id }
        });
      });

    if (!worldConsistencyScans.length) {
      issues.push({
        id: `consistency:not-scanned:${activeWorld.id}`,
        severity: "warning",
        title: "项目尚未运行一致性扫描",
        detail: "运行一次离线扫描，建立可比较的项目基线。",
        target: { tab: "consistency" }
      });
    }
    checkDuplicateIds("时间轨道", worldTracksForHealth, "timeline", undefined, "track");
    checkDuplicateIds("时间点", worldTimelineForHealth, "timeline", undefined, "timeline");

    worldEntities.forEach((entity) => {
      if (!entity.title.trim()) {
        issues.push({
          id: `empty-entity-title:${entity.id}`,
          severity: "error",
          title: "条目缺少标题",
          detail: entityTypeMeta[entity.type].label,
          target: { tab: "codex", itemId: entity.id }
        });
      }

      const missingMentions = extractMentions(entity.content).filter(
        (mention) => !entityTitles.has(normalize(mention))
      );
      if (missingMentions.length) {
        issues.push({
          id: `broken-links:${entity.id}`,
          severity: "warning",
          title: `${entity.title || "未命名条目"}包含失效链接`,
          detail: missingMentions.join("、"),
          target: { tab: "codex", itemId: entity.id }
        });
      }
    });

    worldQuests.forEach((quest) => {
      if (!quest.title.trim()) {
        issues.push({
          id: `empty-quest-title:${quest.id}`,
          severity: "error",
          title: "任务缺少标题",
          detail: questCategoryMeta[quest.category].label,
          target: { tab: "quests", itemId: quest.id }
        });
      }

      const missingEntities = quest.relatedEntityIds.filter((id) => !entityIds.has(id));
      if (missingEntities.length) {
        issues.push({
          id: `quest-entities:${quest.id}`,
          severity: "error",
          title: `${quest.title || "未命名任务"}引用了不存在的条目`,
          detail: missingEntities.join("、"),
          target: { tab: "quests", itemId: quest.id }
        });
      }

      const missingPrerequisites = quest.prerequisiteQuestIds.filter(
        (id) => !questIds.has(id)
      );
      if (missingPrerequisites.length) {
        issues.push({
          id: `quest-prerequisites:${quest.id}`,
          severity: "error",
          title: `${quest.title || "未命名任务"}的前置任务已失效`,
          detail: missingPrerequisites.join("、"),
          target: { tab: "quests", itemId: quest.id }
        });
      }

      if (quest.prerequisiteQuestIds.includes(quest.id)) {
        issues.push({
          id: `quest-self-dependency:${quest.id}`,
          severity: "warning",
          title: `${quest.title || "未命名任务"}依赖了自身`,
          detail: "前置任务会形成无法满足的循环",
          target: { tab: "quests", itemId: quest.id }
        });
      }

      if (!quest.steps.length) {
        issues.push({
          id: `quest-no-steps:${quest.id}`,
          severity: "warning",
          title: `${quest.title || "未命名任务"}还没有任务步骤`,
          detail: questStatusMeta[quest.status].label,
          target: { tab: "quests", itemId: quest.id }
        });
      }
    });

    validateStoryVariables(worldStoryVariables).forEach((issue) => {
      const variable = worldStoryVariables.find((item) => issue.id.endsWith(item.id));
      issues.push({
        id: `story:${issue.id}`,
        severity: issue.severity,
        title: issue.title,
        detail: issue.detail,
        target: {
          tab: "story",
          itemId: variable?.id,
          storyMode: "variables"
        }
      });
    });

    const storyContext = {
      variableIds: storyVariableIds,
      entityIds,
      questIds,
      assetIds: new Set(worldAssets.map((asset) => asset.id))
    };
    worldStoryScenes.forEach((scene) => {
      validateStoryScene(scene, storyContext).forEach((issue) => {
        issues.push({
          id: `story:${issue.id}`,
          severity: issue.severity,
          title: issue.title,
          detail: issue.detail,
          target: { tab: "story", itemId: scene.id, storyMode: "editor" }
        });
      });
    });

    worldStoryTestPresets.forEach((preset) => {
      if (!preset.name.trim()) {
        issues.push({
          id: `test-preset-name:${preset.id}`,
          severity: "error",
          title: "测试预设缺少名称",
          detail: preset.id,
          target: { tab: "testing", itemId: preset.id, storyTestMode: "analysis" }
        });
      }
      if (!storySceneIds.has(preset.sceneId)) {
        issues.push({
          id: `test-preset-scene:${preset.id}`,
          severity: "error",
          title: `${preset.name || "未命名预设"}关联的场景不存在`,
          detail: preset.sceneId || "未选择场景",
          target: { tab: "testing", itemId: preset.id, storyTestMode: "analysis" }
        });
      }
      const missingVariables = Object.keys(preset.initialState).filter(
        (variableId) => !storyVariableIds.has(variableId)
      );
      if (missingVariables.length) {
        issues.push({
          id: `test-preset-variables:${preset.id}`,
          severity: "warning",
          title: `${preset.name || "未命名预设"}包含失效变量`,
          detail: missingVariables.join("、"),
          target: { tab: "testing", itemId: preset.id, storyTestMode: "analysis" }
        });
      }
    });

    worldStoryTestRuns.forEach((run) => {
      const scene = worldStoryScenes.find((item) => item.id === run.sceneId);
      const missingNodes = run.nodeIds.filter((nodeId) => !storyNodeIds.has(nodeId));
      const missingChoices = run.choiceIds.filter((choiceId) => !storyChoiceIds.has(choiceId));
      if (!scene) {
        issues.push({
          id: `test-run-scene:${run.id}`,
          severity: "error",
          title: "测试记录关联的场景不存在",
          detail: formatDateLabel(run.executedAt),
          target: { tab: "testing", storyTestMode: "analysis" }
        });
      }
      if (run.presetId && !storyTestPresetIds.has(run.presetId)) {
        issues.push({
          id: `test-run-preset:${run.id}`,
          severity: "warning",
          title: "测试记录关联的预设已删除",
          detail: scene?.title ?? run.sceneId,
          target: { tab: "testing", storyTestMode: "analysis" }
        });
      }
      if (missingNodes.length || missingChoices.length) {
        issues.push({
          id: `test-run-path:${run.id}`,
          severity: "warning",
          title: "测试记录中的历史路径已失效",
          detail: [...missingNodes, ...missingChoices].join("、"),
          target: { tab: "testing", storyTestMode: "analysis" }
        });
      }
    });

    worldStoryReviewIssues.forEach((reviewIssue) => {
      const scene = worldStoryScenes.find((item) => item.id === reviewIssue.sceneId);
      const missingReferences = [
        reviewIssue.sceneId && !storySceneIds.has(reviewIssue.sceneId) ? "场景" : "",
        reviewIssue.nodeId && !scene?.nodes.some((node) => node.id === reviewIssue.nodeId)
          ? "节点"
          : "",
        reviewIssue.entityId && !entityIds.has(reviewIssue.entityId) ? "条目" : "",
        reviewIssue.questId && !questIds.has(reviewIssue.questId) ? "任务" : "",
        reviewIssue.runId && !storyTestRunIds.has(reviewIssue.runId) ? "测试记录" : "",
        reviewIssue.presetId && !storyTestPresetIds.has(reviewIssue.presetId) ? "测试预设" : ""
      ].filter(Boolean);
      if (missingReferences.length) {
        issues.push({
          id: `review-issue-references:${reviewIssue.id}`,
          severity: "error",
          title: `${reviewIssue.title || "未命名问题"}包含失效关联`,
          detail: missingReferences.join("、"),
          target: { tab: "testing", itemId: reviewIssue.id, storyTestMode: "issues" }
        });
      }
      if (reviewIssue.status === "open" && reviewIssue.severity !== "minor") {
        issues.push({
          id: `review-issue-open:${reviewIssue.id}`,
          severity: reviewIssue.severity === "critical" ? "error" : "warning",
          title: `待处理${reviewIssue.severity === "critical" ? "阻断" : "重要"}问题：${reviewIssue.title}`,
          detail: scene?.title ?? "未关联场景",
          target: { tab: "testing", itemId: reviewIssue.id, storyTestMode: "issues" }
        });
      }
    });

    worldStoryScenes
      .filter((scene) => scene.status === "ready")
      .forEach((scene) => {
        const passed = worldStoryTestRuns.some(
          (run) => run.sceneId === scene.id && run.status === "passed"
        );
        if (!passed) {
          const preset = worldStoryTestPresets.find((item) => item.sceneId === scene.id);
          issues.push({
            id: `ready-scene-untested:${scene.id}`,
            severity: "warning",
            title: `${scene.title}已确认但尚未通过测试`,
            detail: preset ? "运行预设并记录通过结果" : "先为场景创建测试预设",
            target: {
              tab: "testing",
              itemId: preset?.id,
              storyTestMode: "analysis"
            }
          });
        }
      });

    worldRelations.forEach((relation) => {
      const missingEndpoints = [relation.sourceEntityId, relation.targetEntityId].filter(
        (id) => !entityIds.has(id)
      );
      if (missingEndpoints.length) {
        issues.push({
          id: `relation-endpoints:${relation.id}`,
          severity: "error",
          title: `${relation.label || "未命名关系"}的端点已失效`,
          detail: missingEndpoints.join("、"),
          target: { tab: "relations", itemId: relation.id }
        });
      } else if (relation.sourceEntityId === relation.targetEntityId) {
        issues.push({
          id: `relation-self:${relation.id}`,
          severity: "warning",
          title: `${relation.label || "未命名关系"}连接到了自身`,
          detail: getEntityTitle(worldEntities, relation.sourceEntityId),
          target: { tab: "relations", itemId: relation.id }
        });
      }
    });

    validateMapPlanning({
      worldId: activeWorld.id,
      maps: worldMaps,
      markers: worldMarkersForHealth,
      routes: worldRoutesForHealth,
      layers: worldLayersForHealth,
      groups: worldGroupsForHealth,
      entityIds,
      questIds,
      sceneIds: storySceneIds
    }).forEach((planningIssue) => {
      issues.push({
        id: `planning:${planningIssue.id}`,
        severity: planningIssue.severity,
        title: planningIssue.title,
        detail: planningIssue.detail,
        target: {
          tab: "map",
          itemId: planningIssue.targetId,
          planningTargetType: planningIssue.targetType as "map" | "marker" | "route"
        }
      });
    });

    validateTimelinePlanning({
      worldId: activeWorld.id,
      tracks: worldTracksForHealth,
      events: worldTimelineForHealth,
      entityIds,
      questIds,
      sceneIds: storySceneIds
    }).forEach((planningIssue) => {
      issues.push({
        id: `planning:${planningIssue.id}`,
        severity: planningIssue.severity,
        title: planningIssue.title,
        detail: planningIssue.detail,
        target: {
          tab: "timeline",
          itemId: planningIssue.targetId,
          planningTargetType: planningIssue.targetType as "track" | "timeline"
        }
      });
    });

    worldAssets.forEach((asset) => {
      const fileStatus = assetFileStatus?.[asset.storedName];
      if (fileStatus?.exists === false) {
        issues.push({
          id: `asset-file:${asset.id}`,
          severity: "error",
          title: `${asset.name}的本地文件不存在`,
          detail: asset.originalName,
          target: { tab: "assets", itemId: asset.id }
        });
      } else if (fileStatus?.hashMatches === false || fileStatus?.sizeMatches === false) {
        issues.push({
          id: `asset-integrity:${asset.id}`,
          severity: "error",
          title: `${asset.name}的本地文件已发生变化`,
          detail: "文件大小或 SHA-256 与项目记录不一致，请确认后重新关联。",
          target: { tab: "assets", itemId: asset.id }
        });
      }

      const missingLinks = asset.linkedEntityIds.filter((id) => !entityIds.has(id));
      if (missingLinks.length) {
        issues.push({
          id: `asset-links:${asset.id}`,
          severity: "warning",
          title: `${asset.name}关联了不存在的条目`,
          detail: missingLinks.join("、"),
          target: { tab: "assets", itemId: asset.id }
        });
      }
    });

    const knownStoredNames = new Set(data.assets.map((asset) => asset.storedName));
    collectWorkspaceAssetStoredNames(data).forEach((storedName) => {
      if (knownStoredNames.has(storedName)) return;
      const fileStatus = assetFileStatus?.[storedName];
      issues.push({
        id: `asset-untracked:${storedName}`,
        severity: fileStatus?.exists ? "warning" : "error",
        title: fileStatus?.exists
          ? `项目直接引用了未登记资源 ${storedName}`
          : `项目引用的未登记资源 ${storedName} 不存在`,
        detail: fileStatus?.exists
          ? "完整工程包会自动携带此文件；建议重新导入资源库以便管理标签和使用位置。"
          : "该文件既不在资源库，也不在本地资源目录中。",
        target: { tab: "assets" }
      });
    });

    function referenceProblemTarget(source: ProjectObjectRef): HealthTarget | undefined {
      if (source.kind === "entity") return { tab: "codex", itemId: source.id };
      if (source.kind === "quest") return { tab: "quests", itemId: source.id };
      if (source.kind === "scene") {
        return { tab: "story", itemId: source.id, storyMode: "editor" };
      }
      if (source.kind === "story-variable") {
        return { tab: "story", itemId: source.id, storyMode: "variables" };
      }
      if (source.kind === "map") {
        return { tab: "map", itemId: source.id, planningTargetType: "map" };
      }
      if (source.kind === "map-marker") {
        return { tab: "map", itemId: source.id, planningTargetType: "marker" };
      }
      if (source.kind === "map-route") {
        return { tab: "map", itemId: source.id, planningTargetType: "route" };
      }
      if (source.kind === "timeline-track") {
        return { tab: "timeline", itemId: source.id, planningTargetType: "track" };
      }
      if (source.kind === "timeline-event") {
        return { tab: "timeline", itemId: source.id, planningTargetType: "timeline" };
      }
      if (source.kind === "asset") return { tab: "assets", itemId: source.id };
      if (source.kind === "milestone") return { tab: "production", itemId: source.id };
      if (source.kind === "review-issue") {
        return {
          tab: "testing",
          itemId: source.id,
          storyTestMode: "issues"
        };
      }
      if (source.kind === "relation") return { tab: "relations", itemId: source.id };
      return undefined;
    }

    const referenceProblemLabels = {
      "broken-target": "引用目标已失效",
      "unresolved-title": "双向链接未找到目标",
      "ambiguous-title": "双向链接存在重名目标",
      "cross-world-target": "引用目标属于其他世界"
    } as const;
    projectReferenceIndex.problems
      .filter((problem) => problem.worldId === activeWorld.id)
      .forEach((problem) => {
        issues.push({
          id: `project-reference:${problem.id}`,
          severity: problem.severity,
          title: referenceProblemLabels[problem.code],
          detail: `${problem.sourceLabel} · ${problem.anchor.field} · ${problem.targetLabel}`,
          target: referenceProblemTarget(problem.source),
          referenceLocation: {
            source: problem.source,
            anchor: problem.anchor,
            worldId: problem.worldId
          }
        });
      });

    if (storageDiagnostics) {
      if (storageDiagnostics.schemaVersion !== 17) {
        issues.push({
          id: "storage-schema",
          severity: "error",
          title: "SQLite schema 版本不正确",
          detail: `当前 ${storageDiagnostics.schemaVersion}，应用需要 17`
        });
      }
      if (
        storageDiagnostics.quickCheck !== "ok" ||
        storageDiagnostics.foreignKeyIssues > 0 ||
        storageDiagnostics.invalidItems.length > 0
      ) {
        issues.push({
          id: "storage-integrity",
          severity: "error",
          title: "SQLite 完整性检查未通过",
          detail: `${storageDiagnostics.invalidItems.length} 个对象无法读取 · ${storageDiagnostics.foreignKeyIssues} 个外键问题`
        });
      }
      if (!storageDiagnostics.ftsAvailable) {
        issues.push({
          id: "storage-fts-unavailable",
          severity: "warning",
          title: "SQLite FTS5 搜索不可用",
          detail: "全局搜索将回退到内存筛选"
        });
      } else if (
        storageDiagnostics.searchCount !== storageDiagnostics.itemCount ||
        storageDiagnostics.searchMapCount !== storageDiagnostics.searchCount
      ) {
        issues.push({
          id: "storage-fts-stale",
          severity: "warning",
          title: "本地搜索索引需要重建",
          detail: `${storageDiagnostics.searchCount}/${storageDiagnostics.itemCount} 个对象已建立索引 · ${storageDiagnostics.searchMapCount} 个 rowid 映射`
        });
      }
    }

    return issues.sort((left, right) => {
      if (left.severity === right.severity) return left.title.localeCompare(right.title, "zh-CN");
      return left.severity === "error" ? -1 : 1;
    });
  }, [activeTab, activeWorld.id, assetFileStatus, codexHierarchyIssues, data.mapLayers, data.mapMarkerGroups, data.mapMarkers, data.mapRoutes, data.maps, data.timelineEvents, data.timelineTracks, entityTemplateIssues, narrativeCoverage, narrativeIssues, projectReferenceIndex, storageDiagnostics, worldAssets, worldConsistencyFindings, worldConsistencyScans.length, worldEntities, worldEntityTemplates, worldNarrativeMilestones, worldQuests, worldRelations, worldStoryReviewIssues, worldStoryScenes, worldStoryTestPresets, worldStoryTestRuns, worldStoryVariables]);

  const historyCollections = useMemo(
    () =>
      Array.from(
        new globalThis.Map(
          objectVersions.map((version) => [version.collection, version.collectionLabel])
        ).entries()
      ).sort((left, right) => left[1].localeCompare(right[1], "zh-CN")),
    [objectVersions]
  );
  const filteredObjectVersions = useMemo(() => {
    const normalizedQuery = normalize(historyQuery);
    return objectVersions.filter((version) => {
      if (historyCollection !== "all" && version.collection !== historyCollection) {
        return false;
      }
      return (
        !normalizedQuery ||
        normalize(
          `${version.collectionLabel} ${version.label} ${version.reason} ${version.itemId}`
        ).includes(normalizedQuery)
      );
    });
  }, [historyCollection, historyQuery, objectVersions]);

  const healthErrorCount = projectHealthIssues.filter(
    (issue) => issue.severity === "error"
  ).length;
  const healthWarningCount = projectHealthIssues.length - healthErrorCount;

  function openSearchResult(result: GlobalSearchResult) {
    if (result.kind === "category") {
      const categoryIds = new Set([
        result.itemId,
        ...getCodexCategoryDescendantIds(worldCodexCategories, result.itemId)
      ]);
      const firstEntity = worldEntities.find((entity) => categoryIds.has(entity.categoryId));
      setCollapsedCategoryIds((current) => {
        const next = new Set(current);
        getCodexCategoryPath(worldCodexCategories, result.itemId).forEach((category) =>
          next.delete(category.id)
        );
        next.delete(result.itemId);
        return next;
      });
      if (firstEntity) setSelectedEntityId(firstEntity.id);
      setActiveType("all");
      setQuery("");
      revealCodexLibraryForViewport();
      setActiveTab("codex");
      window.requestAnimationFrame(() => setRevealEntityToken((current) => current + 1));
      return;
    }
    if (result.kind === "template") {
      setSelectedEntityTemplateId(result.itemId);
      setActiveTab("templates");
      return;
    }
    if (result.kind === "entity") {
      setSelectedEntityId(result.itemId);
      setActiveTab("codex");
      return;
    }

    if (result.kind === "quest") {
      setSelectedQuestId(result.itemId);
      setQuestWorkspaceMode("editor");
      setActiveTab("quests");
      return;
    }

    if (result.kind === "scene") {
      setSelectedStorySceneId(result.itemId);
      setStoryWorkspaceMode("editor");
      setActiveTab("story");
      return;
    }

    if (result.kind === "variable") {
      setSelectedStoryVariableId(result.itemId);
      setStoryWorkspaceMode("variables");
      setActiveTab("story");
      return;
    }

    if (result.kind === "test") {
      setSelectedStoryTestPresetId(result.itemId);
      setStoryTestWorkspaceMode("analysis");
      setActiveTab("testing");
      return;
    }

    if (result.kind === "issue") {
      setSelectedStoryReviewIssueId(result.itemId);
      setStoryTestWorkspaceMode("issues");
      setActiveTab("testing");
      return;
    }

    if (result.kind === "milestone") {
      setSelectedNarrativeMilestoneId(result.itemId);
      const milestone = worldNarrativeMilestones.find((item) => item.id === result.itemId);
      if (milestone && richTextToPlainText(milestone.manuscriptBody)) {
        setStoryWorkspaceMode("manuscript");
        setActiveTab("story");
      } else {
        setActiveTab("production");
      }
      return;
    }

    if (result.kind === "manuscript") {
      if (result.manuscriptTargetType === "book") {
        openProjectReference({ kind: "manuscript-book", id: result.itemId });
      } else if (result.manuscriptTargetType === "volume") {
        openProjectReference({ kind: "manuscript-volume", id: result.itemId });
      } else if (result.manuscriptTargetType === "scene") {
        openProjectReference({ kind: "manuscript-scene", id: result.itemId });
      } else {
        openProjectReference({ kind: "manuscript-chapter", id: result.itemId });
      }
      return;
    }

    if (result.kind === "relation") {
      setSelectedRelationId(result.itemId);
      if (result.relatedEntityId) {
        setRelationFocusEntityId(result.relatedEntityId);
      }
      setActiveTab("relations");
      return;
    }

    if (result.kind === "map") {
      if (result.planningTargetType === "marker") {
        openMapMarker(result.itemId);
      } else {
        selectWorldMap(result.itemId);
        setActiveTab("map");
      }
      return;
    }

    if (result.kind === "route") {
      const route = data.mapRoutes.find((item) => item.id === result.itemId);
      if (route) {
        setSelectedMapId(route.mapId);
        selectMapRoute(route.id);
      }
      setActiveTab("map");
      return;
    }

    if (result.kind === "timeline") {
      if (result.planningTargetType === "track") {
        selectTimelineTrack(result.itemId);
        setActiveTab("timeline");
      } else {
        openTimelineEvent(result.itemId);
      }
      return;
    }

    if (result.kind === "consistency") {
      setSelectedConsistencyFindingId(result.itemId);
      setActiveTab("consistency");
      return;
    }

    setSelectedAssetId(result.itemId);
    setActiveTab("assets");
  }

  function openHealthIssue(issue: HealthIssue) {
    if (issue.referenceLocation) {
      if (
        issue.referenceLocation.worldId &&
        issue.referenceLocation.worldId !== activeWorldId
      ) {
        setActiveWorldId(issue.referenceLocation.worldId);
      }
      referenceLocationTokenRef.current += 1;
      setReferenceLocationRequest({
        source: issue.referenceLocation.source,
        anchor: issue.referenceLocation.anchor,
        token: referenceLocationTokenRef.current
      });
      openProjectReference(issue.referenceLocation.source);
      return;
    }
    const target = issue.target;
    if (!target) {
      return;
    }

    if (target.tab === "codex" && target.itemId) {
      setSelectedEntityId(target.itemId);
    } else if (target.tab === "templates" && target.itemId) {
      setSelectedEntityTemplateId(target.itemId);
    } else if (target.tab === "quests" && target.itemId) {
      setSelectedQuestId(target.itemId);
      setQuestWorkspaceMode("editor");
    } else if (target.tab === "story") {
      setStoryWorkspaceMode(target.storyMode ?? "editor");
      if (target.storyMode === "variables" && target.itemId) {
        setSelectedStoryVariableId(target.itemId);
      } else if (target.itemId) {
        setSelectedStorySceneId(target.itemId);
      }
    } else if (target.tab === "testing") {
      const testMode = target.storyTestMode ?? "analysis";
      setStoryTestWorkspaceMode(testMode);
      if (testMode === "issues" && target.itemId) {
        setSelectedStoryReviewIssueId(target.itemId);
      } else if (target.itemId) {
        setSelectedStoryTestPresetId(target.itemId);
      }
    } else if (target.tab === "production" && target.itemId) {
      setSelectedNarrativeMilestoneId(target.itemId);
    } else if (target.tab === "relations" && target.itemId) {
      setSelectedRelationId(target.itemId);
      const relation = worldRelations.find((item) => item.id === target.itemId);
      if (relation) setRelationFocusEntityId(relation.sourceEntityId);
    } else if (target.tab === "assets" && target.itemId) {
      setSelectedAssetId(target.itemId);
    } else if (target.tab === "timeline" && target.itemId) {
      if (target.planningTargetType === "track") {
        selectTimelineTrack(target.itemId);
      } else {
        const timelineEvent = data.timelineEvents.find((item) => item.id === target.itemId);
        if (timelineEvent) {
          setSelectedTimelineTrackId(timelineEvent.trackId);
          setSelectedTimelineEventId(timelineEvent.id);
        }
      }
    } else if (target.tab === "map" && target.itemId) {
      if (target.planningTargetType === "map") {
        selectWorldMap(target.itemId);
      } else if (target.planningTargetType === "marker") {
        const marker = data.mapMarkers.find((item) => item.id === target.itemId);
        if (marker) {
          setSelectedMapId(marker.mapId);
          selectMapMarker(marker.id);
        }
      } else if (target.planningTargetType === "route") {
        const route = data.mapRoutes.find((item) => item.id === target.itemId);
        if (route) {
          setSelectedMapId(route.mapId);
          selectMapRoute(route.id);
        }
      }
    } else if (target.tab === "consistency" && target.itemId) {
      setSelectedConsistencyFindingId(target.itemId);
    }

    setActiveTab(target.tab);
  }

  async function refreshReliabilityData(
    workspace: WorkspaceData = data,
    worldId: string = activeWorld.id
  ) {
    if (!window.worldcraftStore) {
      setReliabilityStatus("unavailable");
      setAssetFileStatus(null);
      setBackups([]);
      setBackupStorage(null);
      setStorageDiagnostics(null);
      setObjectVersions([]);
      return;
    }

    setReliabilityStatus("checking");
    try {
      const [assetResult, backupResult, diagnosticsResult, historyResult] = await Promise.all([
        window.worldcraftStore.checkAssets(
          [
            ...workspace.assets.map((asset) => ({
              storedName: asset.storedName,
              contentHash: asset.contentHash,
              size: asset.size
            })),
            ...Array.from(collectWorkspaceAssetStoredNames(workspace))
              .filter(
                (storedName) => !workspace.assets.some((asset) => asset.storedName === storedName)
              )
              .map((storedName) => ({ storedName, contentHash: "", size: 0 }))
          ]
        ),
        window.worldcraftStore.listBackups(),
        window.worldcraftStore.getDiagnostics(),
        window.worldcraftStore.listRecentObjectVersions(worldId, 120)
      ]);

      if (!assetResult.ok || !backupResult.ok || !diagnosticsResult.ok || !historyResult.ok) {
        throw new Error(
          assetResult.error ??
            backupResult.error ??
            diagnosticsResult.error ??
            historyResult.error ??
            "项目检查失败"
        );
      }

      setAssetFileStatus(
        Object.fromEntries(assetResult.files.map((file) => [file.storedName, file]))
      );
      setAssetDirectory(assetResult.assetsDir ?? "");
      setBackups(backupResult.backups);
      setBackupStorage(backupResult.storage ?? null);
      setStorageDiagnostics(diagnosticsResult.diagnostics);
      setObjectVersions(historyResult.versions);
      setDiagnosticsMessage("");
      setStoreInfo((previous) =>
        previous
          ? {
              ...previous,
              backupDir: backupResult.backupDir ?? previous.backupDir,
              schemaVersion: diagnosticsResult.diagnostics.schemaVersion
            }
          : previous
      );
      setReliabilityStatus("ready");
    } catch (error) {
      console.error(error);
      setReliabilityStatus("error");
      setSaveStatus("项目检查失败，请查看本地目录权限");
    }
  }

  async function rebuildWorkspaceSearchIndex() {
    if (!window.worldcraftStore) return;
    setDiagnosticsMessage("正在重建本地搜索索引...");
    try {
      const result = await window.worldcraftStore.rebuildSearchIndex();
      if (!result.ok) throw new Error(result.error ?? "索引重建失败");
      setDiagnosticsMessage(`索引已重建：${result.indexed} 个对象`);
      await refreshReliabilityData();
    } catch (error) {
      console.error(error);
      setDiagnosticsMessage(error instanceof Error ? error.message : "索引重建失败");
    }
  }

  async function cleanupOldBackups() {
    if (!window.worldcraftStore) return;
    setPendingBackupCleanup(false);
    setDiagnosticsMessage("正在清理超过保留策略的旧备份...");
    try {
      const result = await window.worldcraftStore.cleanupBackups();
      if (!result.ok) throw new Error(result.error ?? "旧备份清理失败");
      setBackups(result.backups);
      setBackupStorage(result.storage ?? null);
      setDiagnosticsMessage(
        result.removedCount
          ? `已清理 ${result.removedCount} 个旧备份，释放 ${formatFileSize(result.removedBytes ?? 0)}`
          : "备份目录已经符合保留策略"
      );
      setSaveStatus(
        result.removedCount
          ? `旧备份已清理，释放 ${formatFileSize(result.removedBytes ?? 0)}`
          : "备份目录无需清理"
      );
    } catch (error) {
      console.error(error);
      setDiagnosticsMessage(error instanceof Error ? error.message : "旧备份清理失败");
    }
  }

  async function maintainWorkspaceStorage() {
    if (!window.worldcraftStore || storageMaintenanceBusy) return;
    setStorageMaintenancePending(false);
    setStorageMaintenanceBusy(true);
    setDiagnosticsMessage("正在创建安全快照并整理历史记录...");
    try {
      const result = await window.worldcraftStore.maintainStorage();
      if (!result.ok) throw new Error(result.error ?? "数据库历史整理失败");
      if (result.diagnostics) setStorageDiagnostics(result.diagnostics);
      setDiagnosticsMessage(
        `历史整理完成：移除 ${result.versionsRemoved ?? 0} 个旧对象版本、${result.snapshotsRemoved ?? 0} 个整库快照，释放 ${formatFileSize(result.reclaimedBytes ?? 0)}`
      );
      setSaveStatus(`数据库历史已整理，释放 ${formatFileSize(result.reclaimedBytes ?? 0)}`);
      const backupResult = await window.worldcraftStore.listBackups();
      if (backupResult.ok) {
        setBackups(backupResult.backups);
        setBackupStorage(backupResult.storage ?? null);
      }
      await refreshReliabilityData();
    } catch (error) {
      console.error(error);
      setDiagnosticsMessage(error instanceof Error ? error.message : "数据库历史整理失败");
    } finally {
      setStorageMaintenanceBusy(false);
    }
  }

  async function restoreMigrationDatabase(fileName: string) {
    if (
      !window.worldcraftStore ||
      !window.confirm(
        "恢复迁移前数据库副本？当前 schema 11 数据库会先生成安全副本，然后重新执行迁移。"
      )
    ) {
      return;
    }
    setDiagnosticsMessage("正在验证并恢复迁移副本...");
    try {
      const result = await window.worldcraftStore.restoreMigrationBackup(fileName);
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "迁移副本恢复失败");
      }
      const nextData = normalizeWorkspaceData(result.data);
      const nextWorldId = nextData.worlds.some((world) => world.id === activeWorldId)
        ? activeWorldId
        : nextData.worlds[0]?.id ?? "";
      setData(nextData);
      setActiveWorldId(nextWorldId);
      setSelectedEntityId(
        nextData.entities.find((item) => item.worldId === nextWorldId)?.id ?? ""
      );
      setSelectedQuestId(
        nextData.quests.find((item) => item.worldId === nextWorldId)?.id ?? ""
      );
      setSelectedRelationId(
        nextData.relations.find((item) => item.worldId === nextWorldId)?.id ?? ""
      );
      setSelectedAssetId(
        nextData.assets.find((item) => item.worldId === nextWorldId)?.id ?? ""
      );
      setSelectedStorySceneId(
        nextData.storyScenes.find((item) => item.worldId === nextWorldId)?.id ?? ""
      );
      setSelectedStoryVariableId(
        nextData.storyVariables.find((item) => item.worldId === nextWorldId)?.id ?? ""
      );
      setSelectedStoryTestPresetId(
        nextData.storyTestPresets.find((item) => item.worldId === nextWorldId)?.id ?? ""
      );
      setSelectedStoryReviewIssueId(
        nextData.storyReviewIssues.find((item) => item.worldId === nextWorldId)?.id ?? ""
      );
      selectPlanningState(nextData, nextWorldId);
      setDiagnosticsMessage("迁移副本已恢复，并已重新升级到当前 schema");
      setSaveStatus("已恢复迁移前数据库，回滚前安全副本已保留");
      window.setTimeout(() => void refreshReliabilityData(), 900);
    } catch (error) {
      console.error(error);
      setDiagnosticsMessage(error instanceof Error ? error.message : "迁移副本恢复失败");
    }
  }

  async function restoreObjectVersion(version: ObjectVersion) {
    if (
      !window.confirm(
        `恢复${version.collectionLabel}“${version.label}”到 ${formatDateLabel(version.createdAt)} 的版本？当前项目会先备份。`
      )
    ) {
      return;
    }

    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-object-version-restore");
      await window.worldcraftStore.createBackup(data);
    }
    const restoredAt = new Date().toISOString();
    setData((previous) => {
      const collection = version.collection;
      const items = previous[collection] as unknown as Array<Record<string, unknown>>;
      const existing = items.find((item) => item.id === version.itemId);
      const restored: Record<string, unknown> = {
        ...version.item,
        id: version.itemId
      };
      if (existing?.worldId) restored.worldId = existing.worldId;
      if ("updatedAt" in restored || existing?.updatedAt) restored.updatedAt = restoredAt;
      const nextItems = existing
        ? items.map((item) => (item.id === version.itemId ? restored : item))
        : [restored, ...items];
      return { ...previous, [collection]: nextItems } as WorkspaceData;
    });
    setSaveStatus(`已恢复${version.collectionLabel}版本：${formatDateLabel(version.createdAt)}`);
    window.setTimeout(() => void refreshReliabilityData(), 900);
  }

  async function revealBackupDirectory() {
    if (!window.worldcraftStore) return;
    const result = await window.worldcraftStore.revealBackups();
    if (!result.ok) setSaveStatus(result.error ?? "无法打开备份目录");
  }

  async function revealAssetDirectory() {
    if (!window.worldcraftStore) return;
    const result = await window.worldcraftStore.revealAssetsFolder();
    if (!result.ok) setSaveStatus(result.error ?? "无法打开资源目录");
  }

  async function exportDiagnosticBundle() {
    if (!window.worldcraftStore?.exportDiagnostics) {
      setDiagnosticsMessage("脱敏诊断包仅在桌面版中可用");
      return;
    }
    setDiagnosticsMessage("正在汇总脱敏诊断信息...");
    const result = await window.worldcraftStore.exportDiagnostics();
    if (result.canceled) {
      setDiagnosticsMessage("已取消导出诊断包");
    } else if (result.ok) {
      setDiagnosticsMessage(`诊断包已导出：${result.filePath}`);
    } else {
      setDiagnosticsMessage(`诊断包导出失败：${result.error ?? "无法写入文件"}`);
    }
  }

  async function restoreBackup(fileName: string) {
    if (!window.worldcraftStore) return;

    suspendAutosaveForExternalLoad();
    setSaveStatus("正在恢复本地备份...");
    const flushed = await window.worldcraftStore.saveWorkspace(data, "before-restore-ui");
    if (!flushed.ok) {
      resumeAutosaveAfterExternalLoad();
      setSaveStatus(flushed.error ?? "当前修改尚未安全保存，已取消恢复");
      return;
    }
    const result = await window.worldcraftStore.restoreBackup(fileName);
    if (!result.ok || !result.data) {
      resumeAutosaveAfterExternalLoad();
      setSaveStatus(result.error ?? "备份恢复失败");
      return;
    }

    const nextData = normalizeWorkspaceData(result.data);
    const nextWorldId = nextData.worlds[0]?.id ?? initialData.worlds[0].id;
    setData(nextData);
    setActiveWorldId(nextWorldId);
    setSelectedEntityId(nextData.entities[0]?.id ?? "");
    setSelectedQuestId(nextData.quests[0]?.id ?? "");
    setSelectedRelationId(nextData.relations[0]?.id ?? "");
    setSelectedAssetId(nextData.assets[0]?.id ?? "");
    setSelectedStorySceneId(nextData.storyScenes[0]?.id ?? "");
    setSelectedStoryVariableId(nextData.storyVariables[0]?.id ?? "");
    setSelectedStoryTestPresetId(nextData.storyTestPresets[0]?.id ?? "");
    setSelectedStoryReviewIssueId(nextData.storyReviewIssues[0]?.id ?? "");
    selectPlanningState(nextData, nextWorldId);
    setRelationFocusEntityId(
      nextData.relations[0]?.sourceEntityId ?? nextData.entities[0]?.id ?? ""
    );
    setPendingRestoreFileName("");
    setAssetFileStatus(null);
    setSaveStatus(
      result.packageSummary
        ? `已恢复完整工程备份：${fileName}`
        : `已恢复快速数据备份：${fileName}`
    );
    resumeAutosaveAfterExternalLoad();
    await refreshReliabilityData(nextData, nextWorldId);
  }

  function closeWorldMenu() {
    const menu = document.querySelector<HTMLDetailsElement>(".world-menu");
    menu?.querySelector<HTMLDetailsElement>(".world-menu-settings")?.removeAttribute("open");
    menu?.removeAttribute("open");
    menu?.querySelector<HTMLElement>("summary")?.focus({ preventScroll: true });
  }

  function selectWorld(worldId: string, workspace = dataRef.current) {
    const nextEntity = workspace.entities.find((entity) => entity.worldId === worldId);
    const nextQuest = workspace.quests.find((quest) => quest.worldId === worldId);
    const nextRelation = workspace.relations.find((relation) => relation.worldId === worldId);
    const nextAsset = workspace.assets.find((asset) => asset.worldId === worldId);
    const nextStoryScene = workspace.storyScenes.find((scene) => scene.worldId === worldId);
    const nextStoryVariable = workspace.storyVariables.find(
      (variable) => variable.worldId === worldId
    );
    const nextStoryTestPreset = workspace.storyTestPresets.find(
      (preset) => preset.worldId === worldId
    );
    const nextStoryReviewIssue = workspace.storyReviewIssues.find(
      (issue) => issue.worldId === worldId
    );
    setActiveWorldId(worldId);
    setSelectedEntityId(nextEntity?.id ?? "");
    setSelectedQuestId(nextQuest?.id ?? "");
    setSelectedRelationId(nextRelation?.id ?? "");
    setSelectedAssetId(nextAsset?.id ?? "");
    setSelectedStorySceneId(nextStoryScene?.id ?? "");
    setSelectedStoryVariableId(nextStoryVariable?.id ?? "");
    setSelectedStoryTestPresetId(nextStoryTestPreset?.id ?? "");
    setSelectedStoryReviewIssueId(nextStoryReviewIssue?.id ?? "");
    selectPlanningState(workspace, worldId);
    setRelationFocusEntityId(nextRelation?.sourceEntityId ?? nextEntity?.id ?? "");
    setActiveType("all");
    setQuestCategoryFilter("all");
    setRelationTypeFilter("all");
    setRelationQuery("");
    setAssetKindFilter("all");
    setAssetQuery("");
    setQuery("");
    closeWorldMenu();
  }

  async function persistWorldLifecycleChange(nextData: WorkspaceData, reason: string) {
    cancelPendingAutosave();
    if (window.worldcraftStore) {
      const result = await window.worldcraftStore.saveWorkspace(nextData, reason);
      if (!result.ok) throw new Error(result.error || "世界项目写入失败");
      setStoreInfo((previous) => ({
        dbPath: result.dbPath ?? previous?.dbPath ?? "",
        backupDir: result.backupDir ?? previous?.backupDir ?? "",
        updatedAt: result.updatedAt ?? previous?.updatedAt ?? null,
        appVersion: result.appVersion ?? previous?.appVersion,
        schemaVersion: previous?.schemaVersion,
        lastProjectPath: previous?.lastProjectPath
      }));
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(nextData));
    }
    dataRef.current = nextData;
    setData(nextData);
  }

  async function duplicateCurrentWorld() {
    if (!activeWorld || worldOperationBusy) return;
    const current = dataRef.current;
    const sourceWorld = current.worlds.find((world) => world.id === activeWorld.id);
    if (!sourceWorld) return;

    closeWorldMenu();
    setWorldOperationBusy("duplicate");
    setSaveError("");
    setSavePhase("saving");
    setSaveStatus(`正在复制“${sourceWorld.name}”...`);
    try {
      const isolated = isolateWorldWorkspace(current, sourceWorld.id);
      const nextData = mergeImportedWorkspace(current, isolated, {
        worldNameSuffix: " 副本"
      });
      const duplicatedWorld = nextData.worlds[current.worlds.length];
      if (!duplicatedWorld) throw new Error("复制后的世界没有生成");
      await persistWorldLifecycleChange(nextData, "world-duplicate");
      selectWorld(duplicatedWorld.id, nextData);
      setActiveTab("author");
      setSavePhase("saved");
      setSaveStatus(`已复制世界：${duplicatedWorld.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "世界复制失败";
      setSaveError(message);
      setSavePhase("error");
      setSaveStatus("世界复制失败，请重试");
    } finally {
      setWorldOperationBusy("");
    }
  }

  function openWorldDeleteDialog() {
    if (!activeWorld || dataRef.current.worlds.length <= 1 || worldOperationBusy) return;
    closeWorldMenu();
    setWorldDeleteTargetId(activeWorld.id);
  }

  async function deleteWorldPermanently(worldId: string) {
    if (worldOperationBusy) return;
    const current = dataRef.current;
    const targetIndex = current.worlds.findIndex((world) => world.id === worldId);
    const target = current.worlds[targetIndex];
    if (!target || current.worlds.length <= 1) return;

    setWorldOperationBusy("delete");
    setSaveError("");
    setSavePhase("saving");
    setSaveStatus(`正在为“${target.name}”创建删除前备份...`);
    try {
      if (!window.worldcraftStore) {
        throw new Error("桌面存储未就绪，无法创建删除前完整备份");
      }
      const backup = await window.worldcraftStore.createCompleteBackup(current);
      if (!backup.ok) throw new Error(backup.error || "删除前完整工程备份失败");
      const backupPath = backup.filePath ?? "";
      const nextData = removeWorldFromWorkspace(current, worldId);
      const nextWorld = nextData.worlds[Math.min(targetIndex, nextData.worlds.length - 1)]
        ?? nextData.worlds[0];
      if (!nextWorld) throw new Error("工程必须至少保留一个世界");
      await persistWorldLifecycleChange(nextData, "world-delete");
      setWorldDeleteTargetId("");
      selectWorld(nextWorld.id, nextData);
      setSavePhase("saved");
      setSaveStatus(
        backupPath
          ? `已删除“${target.name}”，完整备份已保留`
          : `已删除“${target.name}”`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "世界删除失败";
      setSaveError(message);
      setSavePhase("error");
      setSaveStatus("世界删除失败，当前数据未更改");
    } finally {
      setWorldOperationBusy("");
    }
  }

  function navigateCodexHistory(delta: -1 | 1) {
    const nextIndex = codexHistoryIndexRef.current + delta;
    const entry = codexHistoryRef.current[nextIndex];
    if (!entry) return;
    skipCodexHistoryRef.current = true;
    codexHistoryIndexRef.current = nextIndex;
    setCodexHistoryIndex(nextIndex);
    setActiveWorldId(entry.worldId);
    setSelectedEntityId(entry.entityId);
    setActiveTab("codex");
  }

  function openRecentCodexEntity(entry: CodexHistoryEntry) {
    setActiveWorldId(entry.worldId);
    setSelectedEntityId(entry.entityId);
    setActiveType("all");
    setQuery("");
    setActiveTab("codex");
  }

  function revealSelectedEntityInTree() {
    if (!selectedEntity) return;
    const path = getCodexCategoryPath(worldCodexCategories, selectedEntity.categoryId);
    setCollapsedCategoryIds((current) => {
      const next = new Set(current);
      path.forEach((category) => next.delete(category.id));
      return next;
    });
    setActiveType("all");
    setQuery("");
    revealCodexLibraryForViewport();
    window.requestAnimationFrame(() => setRevealEntityToken((current) => current + 1));
  }

  function createWorld() {
    closeWorldMenu();
    setStarterPackMode("new-world");
  }

  async function createStarterProject(packId: StarterPackId, worldName: string) {
    const firstRun = starterPackMode === "first-run";
    setStarterPackBusy(true);
    setSaveError("");
    setSavePhase("saving");
    setSaveStatus("正在创建项目...");
    try {
      const addition = buildStarterWorkspace(packId, worldName, firstRun);
      const nextData = firstRun
        ? addition
        : mergeWorkspaceData(dataRef.current, addition);
      const worldId = addition.worlds[0].id;
      if (window.worldcraftStore) {
        const result = await window.worldcraftStore.saveWorkspace(nextData, "starter-pack");
        if (!result.ok) throw new Error(result.error || "起步包写入失败");
        setStoreInfo((previous) => ({
          dbPath: result.dbPath ?? previous?.dbPath ?? "",
          backupDir: result.backupDir ?? previous?.backupDir ?? "",
          updatedAt: result.updatedAt ?? previous?.updatedAt ?? null,
          appVersion: result.appVersion ?? previous?.appVersion,
          schemaVersion: previous?.schemaVersion,
          lastProjectPath: previous?.lastProjectPath
        }));
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify(nextData));
      }
      dataRef.current = nextData;
      setData(nextData);
      setActiveWorldId(worldId);
      setSelectedEntityId(addition.entities[0]?.id ?? "");
      setSelectedQuestId(addition.quests[0]?.id ?? "");
      setSelectedRelationId(addition.relations[0]?.id ?? "");
      setSelectedAssetId(addition.assets[0]?.id ?? "");
      setSelectedStorySceneId(addition.storyScenes[0]?.id ?? "");
      setSelectedStoryVariableId(addition.storyVariables[0]?.id ?? "");
      setSelectedStoryTestPresetId(addition.storyTestPresets[0]?.id ?? "");
      setSelectedStoryReviewIssueId("");
      selectPlanningState(nextData, worldId);
      setRelationFocusEntityId(addition.entities[0]?.id ?? "");
      setStoryWorkspaceMode("editor");
      setActiveType("all");
      setQuery("");
      revealCodexLibraryForViewport();
      setStarterPackMode(null);
      setActiveTab("author");
      setSavePhase("saved");
      setSaveStatus(`已创建${getStarterPack(packId).label}项目并保存到 SQLite`);
      closeWorldMenu();
    } catch (error) {
      const message = error instanceof Error ? error.message : "起步包创建失败";
      setSaveError(message);
      setSavePhase("error");
      setSaveStatus("创建失败，请重试");
    } finally {
      setStarterPackBusy(false);
    }
  }

  function createNarrativeProductionMilestone() {
    if (!activeWorld) return;
    const milestone = createNarrativeMilestone(
      activeWorld.id,
      worldNarrativeMilestones.length,
      `新的叙事里程碑 ${worldNarrativeMilestones.length + 1}`
    );
    setData((previous) => ({
      ...previous,
      narrativeMilestones: [...previous.narrativeMilestones, milestone]
    }));
    setSelectedNarrativeMilestoneId(milestone.id);
  }

  function createManuscriptChapter() {
    if (!activeWorld) return;
    const now = new Date().toISOString();
    let book = worldManuscriptBooks[0];
    let volume = selectedManuscriptChapter
      ? worldManuscriptVolumes.find(
          (item) => item.id === selectedManuscriptChapter.volumeId
        )
      : worldManuscriptVolumes.find((item) => item.bookId === book?.id);
    const nextBooks = [...data.manuscriptBooks];
    const nextVolumes = [...data.manuscriptVolumes];
    if (!book) {
      book = createManuscriptBook(activeWorld.id, 0, activeWorld.name, now);
      nextBooks.push(book);
    }
    if (!volume) {
      volume = createManuscriptVolume(activeWorld.id, book.id, 0, "第一卷", now);
      nextVolumes.push(volume);
    }
    const chapter = createManuscriptChapterRecord(
      activeWorld.id,
      book.id,
      volume.id,
      worldManuscriptChapters.filter((item) => item.volumeId === volume?.id).length,
      `第${formatChapterOrdinal(worldManuscriptChapters.length + 1)}章`,
      now
    );
    setData((previous) => ({
      ...previous,
      manuscriptBooks: nextBooks,
      manuscriptVolumes: nextVolumes,
      manuscriptChapters: [...previous.manuscriptChapters, chapter]
    }));
    setSelectedManuscriptChapterId(chapter.id);
    setSelectedManuscriptSceneId("");
    setStoryWorkspaceMode("manuscript");
  }

  async function updateManuscriptWorkspace(
    next: ManuscriptWorkspaceData,
    reason: string,
    destructive = false
  ) {
    if (!activeWorld) return;
    if (destructive && window.worldcraftStore) {
      await window.worldcraftStore.createBackup(dataRef.current, reason);
    }
    const currentWorldId = activeWorld.id;
    setData((previous) => ({
      ...previous,
      manuscriptBooks: [
        ...previous.manuscriptBooks.filter((item) => item.worldId !== currentWorldId),
        ...next.manuscriptBooks
      ],
      manuscriptVolumes: [
        ...previous.manuscriptVolumes.filter((item) => item.worldId !== currentWorldId),
        ...next.manuscriptVolumes
      ],
      manuscriptChapters: [
        ...previous.manuscriptChapters.filter((item) => item.worldId !== currentWorldId),
        ...next.manuscriptChapters
      ],
      manuscriptScenes: [
        ...previous.manuscriptScenes.filter((item) => item.worldId !== currentWorldId),
        ...next.manuscriptScenes
      ],
      manuscriptClues: [
        ...previous.manuscriptClues.filter((item) => item.worldId !== currentWorldId),
        ...next.manuscriptClues
      ],
      manuscriptKnowledgeStates: [
        ...previous.manuscriptKnowledgeStates.filter(
          (item) => item.worldId !== currentWorldId
        ),
        ...next.manuscriptKnowledgeStates
      ]
    }));
    setSaveStatus(destructive ? `${reason}，已先创建备份` : reason);
  }

  async function exportManuscriptPublication(
    request: ManuscriptPublicationRequest
  ): Promise<ManuscriptPublicationExportResult> {
    if (!window.worldcraftStore?.exportManuscriptPublication) {
      return { ok: false, error: "桌面出版服务未就绪" };
    }
    return window.worldcraftStore.exportManuscriptPublication(request);
  }

  async function exportOfflineWiki(
    audience: WikiAudience
  ): Promise<OfflineWikiExportResult> {
    if (!window.worldcraftStore?.exportOfflineWiki || !activeWorld) {
      return { ok: false, error: "桌面离线 Wiki 导出服务尚未就绪。" };
    }
    try {
      const publication = buildOfflineWikiPublication({
        audience,
        world: activeWorld,
        categories: worldCodexCategories,
        entities: worldEntities,
        templates: worldEntityTemplates,
        quests: worldQuests,
        maps: worldMaps,
        markers: allWorldMarkers,
        timelineTracks: worldTimelineTracks,
        timelineEvents: worldTimelineEvents,
        relations: worldRelations,
        assets: worldAssets
      });
      const result = await window.worldcraftStore.exportOfflineWiki({ publication });
      if (result.ok) {
        setSaveStatus(`离线 Wiki 已导出 · ${result.entityCount ?? 0} 篇文章`);
      }
      return result;
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "离线 Wiki 导出失败。"
      };
    }
  }

  function selectManuscriptUnit(selection: { kind: "chapter" | "scene"; id: string }) {
    if (selection.kind === "chapter") {
      setSelectedManuscriptChapterId(selection.id);
      setSelectedManuscriptSceneId("");
      return;
    }
    const scene = worldManuscriptScenes.find((item) => item.id === selection.id);
    if (!scene) return;
    setSelectedManuscriptChapterId(scene.chapterId);
    setSelectedManuscriptSceneId(scene.id);
  }

  async function loadManuscriptChapterVersions(chapterId: string) {
    if (!window.worldcraftStore?.listObjectVersions) return [];
    const result = await window.worldcraftStore.listObjectVersions(
      "manuscriptChapters",
      chapterId
    );
    if (!result.ok) return [];
    const current = dataRef.current.manuscriptChapters.find(
      (chapter) => chapter.id === chapterId
    );
    if (!current) return [];
    return result.versions.map<ManuscriptChapterVersion>((version, index) => ({
      id: version.id,
      collection: version.collection,
      itemId: version.itemId,
      reason: version.reason,
      createdAt: version.createdAt,
      item: normalizeManuscriptChapter(
        version.item as Partial<ManuscriptChapter>,
        current.worldId,
        current.bookId,
        current.volumeId,
        index
      )
    }));
  }

  async function restoreManuscriptChapterVersion(version: ManuscriptChapterVersion) {
    const current = dataRef.current.manuscriptChapters.find(
      (chapter) => chapter.id === version.itemId
    );
    if (!current) return;
    if (
      !window.confirm(
        `恢复“${current.title}”在 ${new Date(version.createdAt).toLocaleString("zh-CN")} 的版本？当前项目会先备份。`
      )
    ) {
      return;
    }
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(
        dataRef.current,
        "before-manuscript-version-restore"
      );
      await window.worldcraftStore.createBackup(
        dataRef.current,
        "before-manuscript-version-restore"
      );
    }
    const restored = normalizeManuscriptChapter(
      {
        ...version.item,
        id: current.id,
        worldId: current.worldId,
        bookId: current.bookId,
        volumeId: current.volumeId,
        updatedAt: new Date().toISOString()
      },
      current.worldId,
      current.bookId,
      current.volumeId,
      current.order
    );
    setData((previous) => ({
      ...previous,
      manuscriptChapters: previous.manuscriptChapters.map((chapter) =>
        chapter.id === current.id ? restored : chapter
      )
    }));
    setSelectedManuscriptChapterId(current.id);
    setSelectedManuscriptSceneId("");
    setSaveStatus("章节历史版本已恢复，恢复前项目已备份");
  }

  function createProjectEntityTemplate() {
    if (!activeWorld) return;
    const template = createEntityTemplate(activeWorld.id, worldEntityTemplates.length);
    setData((previous) => ({
      ...previous,
      entityTemplates: [...previous.entityTemplates, template]
    }));
    setSelectedEntityTemplateId(template.id);
  }

  function duplicateProjectEntityTemplate(templateId: string) {
    const source = data.entityTemplates.find((item) => item.id === templateId);
    if (!source) return;
    const timestamp = new Date().toISOString();
    const copy = normalizeEntityTemplate(
      {
        ...source,
        id: createId("template"),
        name: `${source.name}副本`,
        builtIn: false,
        fields: source.fields.map((field) => ({ ...field, id: createId("template-field") })),
        createdAt: timestamp,
        updatedAt: timestamp
      },
      source.worldId,
      worldEntityTemplates.length
    );
    setData((previous) => ({
      ...previous,
      entityTemplates: [...previous.entityTemplates, copy]
    }));
    setSelectedEntityTemplateId(copy.id);
  }

  function updateProjectEntityTemplate(
    templateId: string,
    patch: Partial<EntityTemplateDefinition>
  ) {
    setData((previous) => ({
      ...previous,
      entityTemplates: previous.entityTemplates.map((template, index) =>
        template.id === templateId
          ? normalizeEntityTemplate(
              { ...template, ...patch, updatedAt: new Date().toISOString() },
              template.worldId,
              index
            )
          : template
      )
    }));
  }

  async function deleteProjectEntityTemplate(templateId: string) {
    const template = data.entityTemplates.find((item) => item.id === templateId);
    if (!template || template.builtIn || data.entities.some((entity) => entity.templateId === templateId)) return;
    if (!window.confirm(`删除模板“${template.name}”？`)) return;
    if (window.worldcraftStore) await window.worldcraftStore.createBackup(data);
    setData((previous) => ({
      ...previous,
      entityTemplates: previous.entityTemplates.filter((item) => item.id !== templateId)
    }));
    setSelectedEntityTemplateId(worldEntityTemplates.find((item) => item.id !== templateId)?.id ?? "");
  }

  function addProjectTemplateField(templateId: string) {
    const template = data.entityTemplates.find((item) => item.id === templateId);
    if (!template) return;
    const field: EntityTemplateField = {
      id: createId("template-field"),
      key: `field_${template.fields.length + 1}`,
      label: `新字段 ${template.fields.length + 1}`,
      type: "text",
      required: false,
      secret: false,
      defaultValue: "",
      options: [],
      targetEntityTypes: [],
      order: template.fields.length
    };
    updateProjectEntityTemplate(templateId, { fields: [...template.fields, field] });
  }

  function updateProjectTemplateField(
    templateId: string,
    fieldId: string,
    patch: Partial<EntityTemplateField>
  ) {
    const template = data.entityTemplates.find((item) => item.id === templateId);
    if (!template) return;
    const original = template.fields.find((field) => field.id === fieldId);
    const nextKey = patch.key === undefined
      ? original?.key ?? ""
      : patch.key.trim().replace(/[^a-zA-Z0-9_.-]+/g, "_");
    setData((previous) => ({
      ...previous,
      entityTemplates: previous.entityTemplates.map((item, index) =>
        item.id === templateId
          ? normalizeEntityTemplate(
              {
                ...item,
                fields: item.fields.map((field) => field.id === fieldId ? { ...field, ...patch, key: nextKey } : field),
                updatedAt: new Date().toISOString()
              },
              item.worldId,
              index
            )
          : item
      ),
      entities: original && nextKey && original.key !== nextKey
        ? previous.entities.map((entity) => {
            if (entity.templateId !== templateId || !(original.key in entity.templateData)) return entity;
            const templateData = { ...entity.templateData, [nextKey]: entity.templateData[original.key] };
            delete templateData[original.key];
            return { ...entity, templateData, updatedAt: new Date().toISOString() };
          })
        : previous.entities
    }));
  }

  function deleteProjectTemplateField(templateId: string, fieldId: string) {
    const template = data.entityTemplates.find((item) => item.id === templateId);
    if (!template) return;
    updateProjectEntityTemplate(templateId, {
      fields: template.fields.filter((field) => field.id !== fieldId)
    });
  }

  function moveProjectTemplateField(templateId: string, fieldId: string, direction: -1 | 1) {
    const template = data.entityTemplates.find((item) => item.id === templateId);
    if (!template) return;
    const fields = [...template.fields].sort((left, right) => left.order - right.order);
    const index = fields.findIndex((field) => field.id === fieldId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= fields.length) return;
    [fields[index], fields[target]] = [fields[target], fields[index]];
    updateProjectEntityTemplate(templateId, {
      fields: fields.map((field, fieldIndex) => ({ ...field, order: fieldIndex }))
    });
  }

  function applyProjectTemplate(entityIds: string[], templateId: string) {
    const selectedIds = new Set(entityIds);
    const template = data.entityTemplates.find((item) => item.id === templateId) ?? null;
    if (!template) return;
    setData((previous) => ({
      ...previous,
      entities: previous.entities.map((entity) => selectedIds.has(entity.id)
        ? {
            ...entity,
            templateId,
            templateData: applyTemplateDefaults(template, entity.templateData),
            updatedAt: new Date().toISOString()
          }
        : entity)
    }));
  }

  function batchUpdateProjectEntities(
    entityIds: string[],
    patch: { tags?: string[]; visibility?: Visibility }
  ) {
    const selectedIds = new Set(entityIds);
    setData((previous) => ({
      ...previous,
      entities: previous.entities.map((entity) => selectedIds.has(entity.id)
        ? {
            ...entity,
            visibility: patch.visibility ?? entity.visibility,
            tags: patch.tags?.length ? Array.from(new Set([...entity.tags, ...patch.tags])) : entity.tags,
            updatedAt: new Date().toISOString()
          }
        : entity)
    }));
  }

  function updateNarrativeProductionMilestone(
    milestoneId: string,
    patch: Partial<NarrativeMilestone>
  ) {
    setData((previous) => ({
      ...previous,
      narrativeMilestones: previous.narrativeMilestones.map((milestone, index) =>
        milestone.id === milestoneId
          ? normalizeNarrativeMilestone(
              { ...milestone, ...patch, updatedAt: new Date().toISOString() },
              milestone.worldId,
              index
            )
          : milestone
      )
    }));
  }

  function moveNarrativeProductionMilestone(
    milestoneId: string,
    status: NarrativeMilestoneStatus,
    beforeId?: string
  ) {
    setData((previous) => {
      const currentWorld = previous.narrativeMilestones.filter(
        (milestone) => milestone.worldId === activeWorldId
      );
      const moved = moveNarrativeMilestone(currentWorld, milestoneId, status, beforeId).map(
        (milestone) =>
          milestone.id === milestoneId
            ? { ...milestone, updatedAt: new Date().toISOString() }
            : milestone
      );
      const movedById = new globalThis.Map(moved.map((milestone) => [milestone.id, milestone]));
      return {
        ...previous,
        narrativeMilestones: previous.narrativeMilestones.map(
          (milestone) => movedById.get(milestone.id) ?? milestone
        )
      };
    });
  }

  function reorderNarrativeProductionMilestone(milestoneId: string, direction: -1 | 1) {
    setData((previous) => {
      const ordered = sortNarrativeMilestones(
        previous.narrativeMilestones.filter((item) => item.worldId === activeWorldId)
      );
      const index = ordered.findIndex((item) => item.id === milestoneId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= ordered.length) return previous;
      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
      const resequenced = resequenceNarrativeMilestones(
        ordered,
        ordered.map((item) => item.id)
      );
      const byId = new globalThis.Map(resequenced.map((item) => [item.id, item]));
      return {
        ...previous,
        narrativeMilestones: previous.narrativeMilestones.map(
          (item) => byId.get(item.id) ?? item
        )
      };
    });
  }

  function batchNarrativeProductionStatus(
    milestoneIds: string[],
    status: NarrativeMilestoneStatus
  ) {
    const selected = new Set(milestoneIds);
    const updatedAt = new Date().toISOString();
    setData((previous) => ({
      ...previous,
      narrativeMilestones: previous.narrativeMilestones.map((item) =>
        selected.has(item.id) ? { ...item, status, updatedAt } : item
      )
    }));
  }

  async function deleteNarrativeProductionMilestone(milestoneId: string) {
    const milestone = data.narrativeMilestones.find((item) => item.id === milestoneId);
    if (!milestone || !window.confirm(`删除“${milestone.title}”？软件会先创建备份，相关前置依赖会一并清理。`)) {
      return;
    }
    if (window.worldcraftStore) await window.worldcraftStore.createBackup(data);
    const remaining = worldNarrativeMilestones.filter((item) => item.id !== milestoneId);
    setData((previous) => ({
      ...previous,
      narrativeMilestones: [
        ...previous.narrativeMilestones.filter(
          (item) => item.worldId !== activeWorldId
        ),
        ...resequenceNarrativeMilestones(
          previous.narrativeMilestones
            .filter((item) => item.worldId === activeWorldId && item.id !== milestoneId)
            .map((item) => ({
              ...item,
              dependencyIds: item.dependencyIds.filter((id) => id !== milestoneId)
            }))
        )
      ]
    }));
    setSelectedNarrativeMilestoneId(remaining[0]?.id ?? "");
    setSaveStatus("叙事里程碑已删除，相关依赖已清理并创建备份");
  }

  function openNarrativeReference(kind: NarrativeReferenceKind, id: string) {
    if (kind === "quest") {
      setSelectedQuestId(id);
      setQuestWorkspaceMode("editor");
      setActiveTab("quests");
    } else if (kind === "scene") {
      setSelectedStorySceneId(id);
      setStoryWorkspaceMode("editor");
      setActiveTab("story");
    } else if (kind === "entity") {
      setSelectedEntityId(id);
      setActiveTab("codex");
    } else if (kind === "timeline") {
      openTimelineEvent(id);
    } else if (kind === "marker") {
      openMapMarker(id);
    } else {
      setSelectedStoryReviewIssueId(id);
      setStoryTestWorkspaceMode("issues");
      setActiveTab("testing");
    }
  }

  function openProjectReference(reference: ProjectObjectRef) {
    if (reference.kind === "world") {
      setActiveWorldId(reference.id);
    } else if (reference.kind === "entity") {
      setSelectedEntityId(reference.id);
      setActiveType("all");
      setActiveTab("codex");
    } else if (reference.kind === "quest") {
      openQuestInEditor(reference.id);
      setActiveTab("quests");
    } else if (reference.kind === "scene") {
      setSelectedStorySceneId(reference.id);
      setStoryWorkspaceMode("editor");
      setActiveTab("story");
    } else if (reference.kind === "story-variable") {
      setSelectedStoryVariableId(reference.id);
      setStoryWorkspaceMode("variables");
      setActiveTab("story");
    } else if (reference.kind === "timeline-event") {
      openTimelineEvent(reference.id);
    } else if (reference.kind === "timeline-track") {
      selectTimelineTrack(reference.id);
      setActiveTab("timeline");
    } else if (reference.kind === "map") {
      selectWorldMap(reference.id);
      setActiveTab("map");
    } else if (reference.kind === "map-marker") {
      openMapMarker(reference.id);
    } else if (reference.kind === "map-route") {
      const route = data.mapRoutes.find((item) => item.id === reference.id);
      if (route) {
        setSelectedMapId(route.mapId);
        selectMapRoute(route.id);
      }
      setActiveTab("map");
    } else if (reference.kind === "asset") {
      setSelectedAssetId(reference.id);
      setActiveTab("assets");
    } else if (reference.kind === "milestone") {
      setSelectedNarrativeMilestoneId(reference.id);
      setActiveTab("production");
    } else if (reference.kind === "manuscript-book") {
      const chapter = data.manuscriptChapters.find(
        (item) => item.bookId === reference.id
      );
      setSelectedManuscriptChapterId(chapter?.id ?? "");
      setSelectedManuscriptSceneId("");
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    } else if (reference.kind === "manuscript-volume") {
      const chapter = data.manuscriptChapters.find(
        (item) => item.volumeId === reference.id
      );
      setSelectedManuscriptChapterId(chapter?.id ?? "");
      setSelectedManuscriptSceneId("");
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    } else if (reference.kind === "manuscript-chapter") {
      setSelectedManuscriptChapterId(reference.id);
      setSelectedManuscriptSceneId("");
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    } else if (reference.kind === "manuscript-scene") {
      const scene = data.manuscriptScenes.find((item) => item.id === reference.id);
      if (scene) {
        setSelectedManuscriptChapterId(scene.chapterId);
        setSelectedManuscriptSceneId(scene.id);
      }
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    } else if (reference.kind === "review-issue") {
      setSelectedStoryReviewIssueId(reference.id);
      setStoryTestWorkspaceMode("issues");
      setActiveTab("testing");
    } else if (reference.kind === "relation") {
      selectRelation(reference.id);
      setActiveTab("relations");
    }
  }

  function openBackReference(reference: ProjectReference) {
    if (reference.worldId && reference.worldId !== activeWorldId) {
      setActiveWorldId(reference.worldId);
    }
    referenceLocationTokenRef.current += 1;
    setReferenceLocationRequest({
      source: reference.source,
      anchor: reference.anchor,
      token: referenceLocationTokenRef.current
    });
    openProjectReference(reference.source);
  }

  function openCreateContent(kind: CreateContentKind, categoryId = "") {
    if (!activeWorld) return;
    setPendingReferenceCreation(null);
    setCreateContentState({ open: true, kind, categoryId });
  }

  function createEntity(type: EntityType = activeType === "all" ? "character" : activeType) {
    const categoryId =
      selectedEntity?.categoryId ||
      worldCodexCategories.find((category) => category.id.endsWith(`:${type}`))?.id ||
      "";
    openCreateContent(type, categoryId);
  }

  function createEntityInCategory(categoryId: string) {
    const defaultType = (Object.keys(entityTypeMeta) as EntityType[]).find((type) =>
      categoryId.endsWith(`:${type}`)
    );
    openCreateContent(
      activeType === "all" ? defaultType ?? selectedEntity?.type ?? "character" : activeType,
      categoryId
    );
  }

  function commitCreateContent(request: CreateContentRequest) {
    if (!activeWorld) return;
    if (request.kind === "quest") {
      const quest = emptyQuest(activeWorld.id, request.title);
      setData((previous) =>
        attachProjectReference(
          { ...previous, quests: [...previous.quests, quest] },
          pendingReferenceCreation?.source ?? null,
          { kind: "quest", id: quest.id }
        )
      );
      setSelectedQuestId(quest.id);
      setQuestWorkspaceMode("editor");
      setQuestCategoryFilter("all");
      setActiveTab("quests");
      setPendingReferenceCreation(null);
      setCreateContentState((current) => ({ ...current, open: false }));
      return;
    }
    if (request.kind === "scene") {
      const scene = createStoryScene(activeWorld.id, request.title);
      setData((previous) =>
        attachProjectReference(
          {
            ...previous,
            storyScenes: [...previous.storyScenes, scene]
          },
          pendingReferenceCreation?.source ?? null,
          { kind: "scene", id: scene.id }
        )
      );
      setSelectedStorySceneId(scene.id);
      setStoryWorkspaceMode("editor");
      setActiveTab("story");
      setPendingReferenceCreation(null);
      setCreateContentState((current) => ({ ...current, open: false }));
      return;
    }

    const entity = emptyEntity(activeWorld.id, request.kind, request.title);
    const categoryId = worldCodexCategories.some(
      (category) => category.id === request.categoryId
    )
      ? request.categoryId
      : "";
    const template = worldEntityTemplates.find(
      (item) =>
        item.id === request.templateId && item.entityTypes.includes(request.kind as EntityType)
    ) ?? null;
    entity.categoryId = categoryId;
    entity.order = worldEntities.filter((item) => item.categoryId === categoryId).length;
    entity.visibility = request.visibility;
    entity.templateId = template?.id;
    entity.templateData = applyTemplateDefaults(template, {});
    setData((previous) => {
      let nextData = { ...previous, entities: [...previous.entities, entity] };
      if (request.kind === "event") {
        const trackId = nextData.timelineTracks.find(
          (track) => track.worldId === activeWorld.id
        )?.id ?? "";
        const timelineEvent = createTimelineEvent(
          activeWorld.id,
          trackId,
          nextData.timelineEvents.length + 1
        );
        timelineEvent.entityId = entity.id;
        timelineEvent.references = [{ kind: "entity", id: entity.id }];
        timelineEvent.title = entity.title;
        timelineEvent.summary = entity.summary;
        nextData = {
          ...nextData,
          timelineEvents: [...nextData.timelineEvents, timelineEvent]
        };
      }
      return attachProjectReference(
        nextData,
        pendingReferenceCreation?.source ?? null,
        { kind: "entity", id: entity.id }
      );
    });
    setSelectedEntityId(entity.id);
    setActiveType("all");
    setQuery("");
    setActiveTab("codex");
    revealCodexLibraryForViewport();
    setPendingReferenceCreation(null);
    setCreateContentState((current) => ({ ...current, open: false }));
    window.requestAnimationFrame(() => setRevealEntityToken((current) => current + 1));
  }

  function createProjectReferenceFromPicker(
    source: ProjectObjectRef,
    kind: ProjectObjectKind
  ) {
    if (!activeWorld) return;

    if (kind === "entity" || kind === "quest" || kind === "scene") {
      openCreateContent(kind === "entity" ? "character" : kind);
      setPendingReferenceCreation({ source, requestedKind: kind });
      return;
    }

    if (kind === "story-variable") {
      const variable = createStoryVariable(
        activeWorld.id,
        worldStoryVariables.length + 1,
        `剧情变量 ${worldStoryVariables.length + 1}`
      );
      setData((previous) =>
        attachProjectReference(
          { ...previous, storyVariables: [...previous.storyVariables, variable] },
          source,
          { kind, id: variable.id }
        )
      );
      setSelectedStoryVariableId(variable.id);
      setStoryWorkspaceMode("variables");
      setActiveTab("story");
      return;
    }

    if (kind === "timeline-track") {
      const track = createTimelineTrack(activeWorld.id, worldTimelineTracks.length + 1);
      setData((previous) =>
        attachProjectReference(
          { ...previous, timelineTracks: [...previous.timelineTracks, track] },
          source,
          { kind, id: track.id }
        )
      );
      setSelectedTimelineTrackId(track.id);
      setSelectedTimelineEventId("");
      setActiveTab("timeline");
      return;
    }

    if (kind === "timeline-event") {
      const sourceEvent =
        source.kind === "timeline-event"
          ? data.timelineEvents.find((event) => event.id === source.id)
          : null;
      const existingTrackId =
        sourceEvent?.trackId || selectedTimelineTrackId || worldTimelineTracks[0]?.id || "";
      const fallbackTrack = existingTrackId
        ? null
        : createTimelineTrack(activeWorld.id, worldTimelineTracks.length + 1);
      const trackId = existingTrackId || fallbackTrack?.id || "";
      const lastSortOrder = worldTimelineEvents.at(-1)?.sortOrder ?? Date.now();
      const timelineEvent = createTimelineEvent(
        activeWorld.id,
        trackId,
        worldTimelineEvents.length + 1,
        lastSortOrder + 1
      );
      setData((previous) =>
        attachProjectReference(
          {
            ...previous,
            timelineTracks: fallbackTrack
              ? [...previous.timelineTracks, fallbackTrack]
              : previous.timelineTracks,
            timelineEvents: [...previous.timelineEvents, timelineEvent]
          },
          source,
          { kind, id: timelineEvent.id }
        )
      );
      setSelectedTimelineTrackId(trackId);
      setSelectedTimelineEventId(timelineEvent.id);
      setActiveTab("timeline");
      return;
    }

    if (kind === "map") {
      const mapItem = createWorldMap(activeWorld.id, worldMaps.length + 1);
      const layer = createDefaultMapLayer(activeWorld.id, mapItem.id);
      setData((previous) =>
        attachProjectReference(
          {
            ...previous,
            maps: [...previous.maps, mapItem],
            mapLayers: [...previous.mapLayers, layer]
          },
          source,
          { kind, id: mapItem.id }
        )
      );
      setSelectedMapId(mapItem.id);
      setSelectedMapMarkerId("");
      setSelectedMapRouteId("");
      setActiveTab("map");
      return;
    }

    if (kind === "map-marker" || kind === "map-route") {
      const sourceMapId =
        source.kind === "map-marker"
          ? data.mapMarkers.find((marker) => marker.id === source.id)?.mapId
          : undefined;
      const mapId = sourceMapId || activeMap?.id || worldMaps[0]?.id || "";
      if (!mapId) return;
      if (kind === "map-marker") {
        const layerId =
          data.mapLayers.find((layer) => layer.mapId === mapId)?.id ||
          defaultMapLayerId(mapId);
        const marker = createMapMarker(
          mapId,
          50,
          50,
          worldMarkers.length + 1,
          layerId
        );
        setData((previous) =>
          attachProjectReference(
            { ...previous, mapMarkers: [...previous.mapMarkers, marker] },
            source,
            { kind, id: marker.id }
          )
        );
        setSelectedMapId(mapId);
        setSelectedMapMarkerId(marker.id);
        setSelectedMapRouteId("");
      } else {
        const route = createMapRoute(
          activeWorld.id,
          mapId,
          worldMapRoutes.length + 1
        );
        setData((previous) =>
          attachProjectReference(
            { ...previous, mapRoutes: [...previous.mapRoutes, route] },
            source,
            { kind, id: route.id }
          )
        );
        setSelectedMapId(mapId);
        setSelectedMapRouteId(route.id);
        setSelectedMapMarkerId("");
      }
      setActiveTab("map");
      return;
    }

    if (kind === "milestone") {
      const milestone = createNarrativeMilestone(
        activeWorld.id,
        worldNarrativeMilestones.length,
        `新的叙事里程碑 ${worldNarrativeMilestones.length + 1}`
      );
      setData((previous) =>
        attachProjectReference(
          {
            ...previous,
            narrativeMilestones: [...previous.narrativeMilestones, milestone]
          },
          source,
          { kind, id: milestone.id }
        )
      );
      setSelectedNarrativeMilestoneId(milestone.id);
      setActiveTab("production");
      return;
    }

    if (kind === "relation") {
      if (worldEntities.length < 2) {
        setSaveStatus("至少需要两个条目才能创建关系");
        return;
      }
      const relation = emptyRelation(
        activeWorld.id,
        worldEntities[0].id,
        worldEntities[1].id
      );
      setData((previous) =>
        attachProjectReference(
          { ...previous, relations: [...previous.relations, relation] },
          source,
          { kind, id: relation.id }
        )
      );
      setSelectedRelationId(relation.id);
      setRelationFocusEntityId(relation.sourceEntityId);
      setActiveTab("relations");
    }
  }

  function createEntityFromMention(title: string) {
    if (!activeWorld) {
      return;
    }

    const entity = emptyEntity(activeWorld.id, "note", title);
    entity.summary = "由自动关联建议创建的设定条目。";
    entity.categoryId =
      worldCodexCategories.find((category) => category.id.endsWith(":note"))?.id ?? "";
    entity.order = worldEntities.filter((item) => item.categoryId === entity.categoryId).length;
    setData((previous) => ({
      ...previous,
      entities: [...previous.entities, entity]
    }));
    setSelectedEntityId(entity.id);
  }

  function openCategoryDialog(parentId = "", categoryId = "") {
    setCategoryDialogState({ open: true, parentId, categoryId });
  }

  function submitCategoryDialog(request: CategoryDialogRequest) {
    if (!activeWorld) return;
    const editingId = categoryDialogState.categoryId;
    setData((previous) => {
      if (editingId) {
        const moved = moveCodexCategory(
          previous.codexCategories,
          editingId,
          request.parentId
        );
        return {
          ...previous,
          codexCategories: moved.map((category) =>
            category.id === editingId
              ? {
                  ...category,
                  title: request.title,
                  description: request.description,
                  icon: request.icon,
                  color: request.color,
                  updatedAt: new Date().toISOString()
                }
              : category
          )
        };
      }
      const siblings = previous.codexCategories.filter(
        (category) =>
          category.worldId === activeWorld.id && category.parentId === request.parentId
      );
      const category = createCodexCategory(
        activeWorld.id,
        createId("category"),
        request.title,
        request.parentId,
        siblings.length
      );
      category.description = request.description;
      category.icon = request.icon;
      category.color = request.color;
      return {
        ...previous,
        codexCategories: [...previous.codexCategories, category]
      };
    });
    if (request.parentId) {
      setCollapsedCategoryIds((current) => {
        const next = new Set(current);
        next.delete(request.parentId);
        return next;
      });
    }
    setCategoryDialogState((current) => ({ ...current, open: false }));
  }

  async function deleteCodexCategory(categoryId: string) {
    const category = worldCodexCategories.find((item) => item.id === categoryId);
    if (!category) return;
    const childCount = worldCodexCategories.filter(
      (item) => item.parentId === categoryId
    ).length;
    const entityCount = worldEntities.filter((entity) => entity.categoryId === categoryId).length;
    if (
      !window.confirm(
        `删除分类“${category.title}”？其中 ${entityCount} 个条目和 ${childCount} 个子分类会移动到上一级。`
      )
    ) {
      return;
    }
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(dataRef.current, "before-category-delete");
      await window.worldcraftStore.createBackup(dataRef.current, "manual");
    }
    setData((previous) => {
      const removed = removeCodexCategory(
        previous.codexCategories,
        previous.entities,
        categoryId
      );
      return {
        ...previous,
        codexCategories: removed.categories,
        entities: removed.entities
      };
    });
    setCollapsedCategoryIds((current) => {
      const next = new Set(current);
      next.delete(categoryId);
      return next;
    });
    setSaveStatus("分类已删除，内容已移至上一级并创建备份");
  }

  function moveCategoryInTree(categoryId: string, parentId: string, targetIndex?: number) {
    setData((previous) => ({
      ...previous,
      codexCategories: moveCodexCategory(
        previous.codexCategories,
        categoryId,
        parentId,
        targetIndex
      )
    }));
    if (parentId) {
      setCollapsedCategoryIds((current) => {
        const next = new Set(current);
        next.delete(parentId);
        return next;
      });
    }
  }

  function moveEntityInTree(entityId: string, categoryId: string, targetIndex?: number) {
    setData((previous) => ({
      ...previous,
      entities: moveCodexEntity(previous.entities, entityId, categoryId, targetIndex)
    }));
    if (categoryId) {
      setCollapsedCategoryIds((current) => {
        const next = new Set(current);
        next.delete(categoryId);
        return next;
      });
    }
  }

  function toggleCodexCategory(categoryId: string) {
    setCollapsedCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  function createQuest() {
    openCreateContent("quest");
  }

  function openQuestInEditor(questId: string) {
    setSelectedQuestId(questId);
    setQuestWorkspaceMode("editor");
  }

  function openQuestParticipant(entityId: string) {
    setSelectedEntityId(entityId);
    setActiveTab("codex");
  }

  function selectQuestCategoryFilter(filter: QuestCategory | "all") {
    setQuestCategoryFilter(filter);
    if (
      filter !== "all" &&
      selectedQuest &&
      selectedQuest.category !== filter
    ) {
      const nextQuest = worldQuests.find((quest) => quest.category === filter);
      if (nextQuest) {
        setSelectedQuestId(nextQuest.id);
      }
    }
  }

  function updateSelectedQuest(patch: Partial<QuestLine>) {
    if (!selectedQuest) {
      return;
    }

    setData((previous) => ({
      ...previous,
      quests: previous.quests.map((quest) =>
        quest.id === selectedQuest.id
          ? {
              ...quest,
              ...patch,
              updatedAt: new Date().toISOString()
            }
          : quest
      )
    }));
  }

  function updateQuestStep(stepId: string, patch: Partial<QuestStep>) {
    if (!selectedQuest) {
      return;
    }

    updateSelectedQuest({
      steps: selectedQuest.steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              ...patch
            }
          : step
      )
    });
  }

  function addQuestStep() {
    if (!selectedQuest) {
      return;
    }

    updateSelectedQuest({
      steps: [...selectedQuest.steps, emptyQuestStep(`步骤 ${selectedQuest.steps.length + 1}`)]
    });
  }

  function removeQuestStep(stepId: string) {
    if (!selectedQuest) {
      return;
    }

    const nextSteps = selectedQuest.steps.filter((step) => step.id !== stepId);
    updateSelectedQuest({
      steps: nextSteps.length ? nextSteps : [emptyQuestStep("任务开场")]
    });
  }

  function toggleQuestEntity(entityId: string) {
    if (!selectedQuest) {
      return;
    }

    const relatedEntityIds = selectedQuest.relatedEntityIds.includes(entityId)
      ? selectedQuest.relatedEntityIds.filter((id) => id !== entityId)
      : [...selectedQuest.relatedEntityIds, entityId];

    updateSelectedQuest({ relatedEntityIds });
  }

  function toggleQuestPrerequisite(questId: string) {
    if (!selectedQuest || questId === selectedQuest.id) {
      return;
    }

    const prerequisiteQuestIds = selectedQuest.prerequisiteQuestIds.includes(questId)
      ? selectedQuest.prerequisiteQuestIds.filter((id) => id !== questId)
      : [...selectedQuest.prerequisiteQuestIds, questId];

    updateSelectedQuest({ prerequisiteQuestIds });
  }

  function addStoryScene() {
    openCreateContent("scene");
  }

  function updateStoryScene(sceneId: string, patch: Partial<StoryScene>) {
    setData((previous) => ({
      ...previous,
      storyScenes: previous.storyScenes.map((scene) =>
        scene.id === sceneId
          ? { ...scene, ...patch, updatedAt: new Date().toISOString() }
          : scene
      )
    }));
  }

  async function deleteStoryScene(sceneId: string) {
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-story-scene-delete");
      await window.worldcraftStore.createBackup(data);
    }
    const remaining = worldStoryScenes.filter((scene) => scene.id !== sceneId);
    setData((previous) => ({
      ...previous,
      storyScenes: previous.storyScenes.filter((scene) => scene.id !== sceneId)
    }));
    setSelectedStorySceneId(remaining[0]?.id ?? "");
    setSaveStatus("剧情场景已删除，删除前备份已创建");
  }

  function addStoryVariable() {
    if (!activeWorld) return;
    const variable = createStoryVariable(
      activeWorld.id,
      worldStoryVariables.length + 1,
      `剧情变量 ${worldStoryVariables.length + 1}`
    );
    setData((previous) => ({
      ...previous,
      storyVariables: [...previous.storyVariables, variable]
    }));
    setSelectedStoryVariableId(variable.id);
    setStoryWorkspaceMode("variables");
    setActiveTab("story");
  }

  function updateStoryVariable(variableId: string, patch: Partial<StoryVariable>) {
    setData((previous) => {
      const currentVariable = previous.storyVariables.find(
        (variable) => variable.id === variableId
      );
      const updatedAt = new Date().toISOString();
      const nextType = patch.type;
      const storyVariables = previous.storyVariables.map((variable) =>
        variable.id === variableId ? { ...variable, ...patch, updatedAt } : variable
      );

      if (!currentVariable || !nextType || nextType === currentVariable.type) {
        return { ...previous, storyVariables };
      }

      const storyScenes = previous.storyScenes.map((scene) =>
        normalizeStorySceneVariableType(scene, variableId, nextType, updatedAt)
      );

      return { ...previous, storyVariables, storyScenes };
    });
  }

  async function deleteStoryVariable(variableId: string) {
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-story-variable-delete");
      await window.worldcraftStore.createBackup(data);
    }
    const remaining = worldStoryVariables.filter((variable) => variable.id !== variableId);
    setData((previous) => ({
      ...previous,
      storyVariables: previous.storyVariables.filter(
        (variable) => variable.id !== variableId
      )
    }));
    setSelectedStoryVariableId(remaining[0]?.id ?? "");
    setSaveStatus("剧情变量已删除，引用问题会显示在项目检查中");
  }

  function addStoryTestPreset() {
    if (!activeWorld) return;
    const scene = selectedStoryScene ?? worldStoryScenes[0] ?? null;
    const preset = createStoryTestPreset(
      activeWorld.id,
      worldStoryVariables,
      scene?.id ?? "",
      `测试预设 ${worldStoryTestPresets.length + 1}`
    );
    setData((previous) => ({
      ...previous,
      storyTestPresets: [...previous.storyTestPresets, preset]
    }));
    setSelectedStoryTestPresetId(preset.id);
    setStoryTestWorkspaceMode("analysis");
    setActiveTab("testing");
  }

  function updateStoryTestPreset(presetId: string, patch: Partial<StoryTestPreset>) {
    setData((previous) => ({
      ...previous,
      storyTestPresets: previous.storyTestPresets.map((preset) =>
        preset.id === presetId
          ? normalizeStoryTestPreset(
              { ...preset, ...patch, updatedAt: new Date().toISOString() },
              preset.worldId
            )
          : preset
      )
    }));
  }

  async function deleteStoryTestPreset(presetId: string) {
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-story-test-preset-delete");
      await window.worldcraftStore.createBackup(data);
    }
    const remaining = worldStoryTestPresets.filter((preset) => preset.id !== presetId);
    setData((previous) => ({
      ...previous,
      storyTestPresets: previous.storyTestPresets.filter((preset) => preset.id !== presetId),
      storyTestRuns: previous.storyTestRuns.map((run) =>
        run.presetId === presetId ? { ...run, presetId: "" } : run
      ),
      storyReviewIssues: previous.storyReviewIssues.map((issue) =>
        issue.presetId === presetId
          ? { ...issue, presetId: "", updatedAt: new Date().toISOString() }
          : issue
      )
    }));
    setSelectedStoryTestPresetId(remaining[0]?.id ?? "");
    setSaveStatus("测试预设已删除，历史运行记录仍然保留");
  }

  function saveStoryTestRun(run: StoryTestRun) {
    setData((previous) => ({
      ...previous,
      storyTestRuns: [run, ...previous.storyTestRuns]
    }));
    setSaveStatus("剧情测试结果已记录");
  }

  async function deleteStoryTestRun(runId: string) {
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-story-test-run-delete");
    }
    setData((previous) => ({
      ...previous,
      storyTestRuns: previous.storyTestRuns.filter((run) => run.id !== runId),
      storyReviewIssues: previous.storyReviewIssues.map((issue) =>
        issue.runId === runId
          ? { ...issue, runId: "", updatedAt: new Date().toISOString() }
          : issue
      )
    }));
    setSaveStatus("测试记录已删除");
  }

  function addStoryReviewIssue(issue: StoryReviewIssue) {
    setData((previous) => ({
      ...previous,
      storyReviewIssues: [issue, ...previous.storyReviewIssues]
    }));
    setSelectedStoryReviewIssueId(issue.id);
    setSaveStatus("剧情审阅问题已创建");
  }

  function updateStoryReviewIssue(issueId: string, patch: Partial<StoryReviewIssue>) {
    setData((previous) => ({
      ...previous,
      storyReviewIssues: previous.storyReviewIssues.map((issue) =>
        issue.id === issueId
          ? normalizeStoryReviewIssue(
              { ...issue, ...patch, updatedAt: new Date().toISOString() },
              issue.worldId
            )
          : issue
      )
    }));
  }

  async function deleteStoryReviewIssue(issueId: string) {
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-story-review-issue-delete");
    }
    const remaining = worldStoryReviewIssues.filter((issue) => issue.id !== issueId);
    setData((previous) => ({
      ...previous,
      storyReviewIssues: previous.storyReviewIssues.filter((issue) => issue.id !== issueId)
    }));
    setSelectedStoryReviewIssueId(remaining[0]?.id ?? "");
    setSaveStatus("剧情审阅问题已删除");
  }

  function cancelProjectConsistencyScan() {
    consistencyScanWorkerRef.current?.terminate();
    consistencyScanWorkerRef.current = null;
    setConsistencyScanState("idle");
    setSaveStatus("一致性扫描已取消，原结果保持不变");
  }

  function runProjectConsistencyScan() {
    if (!activeWorld || consistencyScanState === "running") return;
    const worldId = activeWorld.id;
    const worker = new Worker(new URL("./consistency.worker.ts", import.meta.url), {
      type: "module"
    });
    consistencyScanWorkerRef.current = worker;
    setConsistencyScanState("running");
    setSaveStatus("正在后台扫描一致性，可随时取消");

    worker.onmessage = (
      event: MessageEvent<
        | { type: "running" }
        | {
            type: "result";
            result: { findings: ConsistencyFinding[]; scan: ConsistencyScan };
          }
        | { type: "error"; error: string }
      >
    ) => {
      if (consistencyScanWorkerRef.current !== worker) return;
      if (event.data.type === "running") return;
      worker.terminate();
      consistencyScanWorkerRef.current = null;
      setConsistencyScanState("idle");
      if (event.data.type === "error") {
        setSaveStatus(`一致性扫描失败：${event.data.error}`);
        return;
      }

      const result = event.data.result;
      setData((previous) => ({
        ...previous,
        consistencyFindings: [
          ...previous.consistencyFindings.filter((finding) => finding.worldId !== worldId),
          ...result.findings
        ],
        consistencyScans: [result.scan, ...previous.consistencyScans].slice(0, 80)
      }));
      const nextFinding =
        result.findings.find((finding) => finding.status === "open" && finding.detected) ??
        result.findings.find((finding) => finding.detected) ??
        result.findings[0];
      setSelectedConsistencyFindingId(nextFinding?.id ?? "");
      setSaveStatus(
        `一致性扫描完成：${result.scan.totalDetected} 项，新增 ${result.scan.newFindingIds.length} 项，消失 ${result.scan.resolvedFindingIds.length} 项`
      );
    };
    worker.onerror = (event) => {
      if (consistencyScanWorkerRef.current !== worker) return;
      worker.terminate();
      consistencyScanWorkerRef.current = null;
      setConsistencyScanState("idle");
      setSaveStatus(`一致性扫描失败：${event.message || "后台 Worker 无法运行"}`);
    };
    worker.postMessage({
      input: {
        worldId,
        worldName: activeWorld.name,
        entities: worldEntities,
        quests: worldQuests,
        storyVariables: worldStoryVariables,
        storyScenes: worldStoryScenes,
        storyTestRuns: worldStoryTestRuns,
        maps: worldMaps,
        mapMarkers: allWorldMarkers,
        mapRoutes: worldMapRoutes,
        timelineTracks: worldTimelineTracks,
        timelineEvents: worldTimelineEvents,
        relations: worldRelations
      },
      previousFindings: worldConsistencyFindings,
      settings: activeConsistencySettings
    });
  }

  function updateConsistencySettings(patch: Partial<ConsistencySettings>) {
    if (!activeWorld) return;
    setData((previous) => ({
      ...previous,
      consistencySettings: previous.consistencySettings.map((settings) =>
        settings.worldId === activeWorld.id
          ? normalizeConsistencySettings(
              { ...settings, ...patch, updatedAt: new Date().toISOString() },
              activeWorld.id
            )
          : settings
      )
    }));
  }

  function toggleConsistencyRule(ruleId: string, enabled: boolean) {
    if (!activeWorld) return;
    setData((previous) => ({
      ...previous,
      consistencySettings: previous.consistencySettings.map((settings) =>
        settings.worldId === activeWorld.id
          ? setConsistencyRuleEnabled(settings, ruleId, enabled)
          : settings
      )
    }));
  }

  function updateConsistencyModelSettings(
    patch: Partial<ConsistencyModelSettings>
  ) {
    if (!activeWorld) return;
    setData((previous) => ({
      ...previous,
      consistencyModelSettings: previous.consistencyModelSettings.map((settings) =>
        settings.worldId === activeWorld.id
          ? normalizeConsistencyModelSettings(
              { ...settings, ...patch, updatedAt: new Date().toISOString() },
              activeWorld.id
            )
          : settings
      )
    }));
  }

  async function getAiCredentialStatus(): Promise<AiCredentialStatus> {
    return window.worldcraftStore?.getAiCredentialStatus?.() ?? {
      ok: false,
      configured: false,
      encryptionAvailable: false,
      error: "AI 凭据仅在桌面版中可用"
    };
  }

  async function saveAiCredential(apiKey: string): Promise<AiCredentialStatus> {
    return window.worldcraftStore?.saveAiCredential?.(apiKey) ?? {
      ok: false,
      configured: false,
      encryptionAvailable: false,
      error: "AI 凭据仅在桌面版中可用"
    };
  }

  async function clearAiCredential(): Promise<AiCredentialStatus> {
    return window.worldcraftStore?.clearAiCredential?.() ?? {
      ok: false,
      configured: false,
      encryptionAvailable: false,
      error: "AI 凭据仅在桌面版中可用"
    };
  }

  async function testAiConnection() {
    if (!window.worldcraftStore?.testAiConnection) {
      return { ok: false, error: "AI 连接仅在桌面版中可用" };
    }
    return window.worldcraftStore.testAiConnection(activeConsistencyModelSettings);
  }

  async function completeWithAi(request: AiCompletionRequest) {
    if (!window.worldcraftStore?.completeWithAi) {
      return { ok: false, error: "AI 工具仅在桌面版中可用" };
    }
    return window.worldcraftStore.completeWithAi(activeConsistencyModelSettings, request);
  }

  async function completeWithAiStream(
    request: AiCompletionRequest,
    requestId: string,
    onDelta: (delta: string) => void
  ) {
    if (!window.worldcraftStore?.completeWithAiStream) {
      const result = await completeWithAi(request);
      if (result.ok && result.text) onDelta(result.text);
      return result;
    }
    return window.worldcraftStore.completeWithAiStream(
      activeConsistencyModelSettings,
      request,
      requestId,
      onDelta
    );
  }

  async function cancelAiCompletion(requestId: string) {
    return window.worldcraftStore?.cancelAiCompletion?.(requestId) ?? {
      ok: false,
      error: "当前环境没有正在运行的桌面 AI 数据流"
    };
  }

  function openInlineAiSource(source: InlineAiSource) {
    if (source.kind === "world") {
      setActiveTab("codex");
      return;
    }
    openAiWritingTarget(source);
  }

  async function analyzeInlineAiChange(request: InlineAiAnalysisRequest) {
    const current = dataRef.current;
    const worldId = request.target.worldId;
    if (!worldId || worldId !== activeWorldIdRef.current) {
      return { ok: false, error: "当前世界已经切换，请重新生成这次修改" };
    }
    const currentValue = getInlineAiWorkspaceValue(current, request.target);
    if (!currentValue.ok) return currentValue;
    if (currentValue.value !== request.storedBefore) {
      return {
        ok: false,
        error: "当前字段在生成建议后又被修改过，请重新生成以保护最新内容"
      };
    }
    const changed = applyInlineAiWorkspaceChange(
      current,
      request.target,
      request.storedAfter
    );
    if (!changed.ok) return changed;
    const settings = normalizeConsistencySettings(
      current.consistencySettings.find((item) => item.worldId === worldId) || {},
      worldId
    );
    const now = new Date().toISOString();
    const before = runConsistencyScan(
      buildConsistencyWorkspaceInput(current, worldId),
      [],
      settings,
      now
    );
    const after = runConsistencyScan(
      buildConsistencyWorkspaceInput(changed.data, worldId),
      [],
      settings,
      now
    );
    const beforeFingerprints = new Set(
      before.findings.filter((finding) => finding.detected).map((finding) => finding.fingerprint)
    );
    return {
      ok: true,
      preview: {
        beforeCount: before.scan.totalDetected,
        afterCount: after.scan.totalDetected,
        introducedIssues: after.findings
          .filter(
            (finding) =>
              finding.detected &&
              (finding.severity === "critical" || finding.severity === "major") &&
              !beforeFingerprints.has(finding.fingerprint)
          )
          .slice(0, 30)
          .map((finding) => ({
            fingerprint: finding.fingerprint,
            severity: finding.severity as "critical" | "major",
            title: finding.title,
            detail: finding.detail,
            suggestion: finding.suggestion
          }))
      }
    };
  }

  async function commitInlineAiChange(
    request: InlineAiCommitRequest
  ): Promise<{ ok: boolean; error?: string }> {
    const workspaceStore = window.worldcraftStore;
    const current = dataRef.current;
    if (!workspaceStore) {
      return { ok: false, error: "编辑器内 AI 仅在本地桌面版中写入项目" };
    }
    if (
      !request.target.worldId ||
      request.target.worldId !== activeWorldIdRef.current ||
      request.target.worldId !== activeWorld?.id
    ) {
      return { ok: false, error: "当前世界已经切换，请重新生成这次修改" };
    }
    const currentValue = getInlineAiWorkspaceValue(current, request.target);
    if (!currentValue.ok) return currentValue;
    if (currentValue.value !== request.storedBefore) {
      return {
        ok: false,
        error: "当前字段在生成建议后又被修改过，请重新生成以保护最新内容"
      };
    }
    const now = new Date().toISOString();
    const applied = applyInlineAiWorkspaceChange(
      current,
      request.target,
      request.storedAfter,
      now
    );
    if (!applied.ok) return applied;

    const contextLabel =
      getInlineAiSources().find((source) => source.id === request.target.contextId)?.label ||
      request.target.fieldLabel;
    const baseSession = createAiWritingSession(
      request.target.worldId,
      request.target.contextId,
      `内嵌 AI · ${contextLabel} · ${request.target.fieldLabel}`
    );
    const session = normalizeAiWritingSession(
      {
        ...baseSession,
        goal: request.instruction || `${request.action} ${request.target.fieldLabel}`,
        draft: request.after,
        reviewSummary: request.response.notes,
        status: "reviewed",
        rounds: [
          {
            id: createAiWritingId("ai-round"),
            kind: "checkpoint",
            model: "manual",
            content: request.before,
            memorySnapshot: request.memorySnapshot,
            createdAt: now
          },
          {
            id: createAiWritingId("ai-round"),
            kind: "draft",
            model: request.model,
            content: request.after,
            memorySnapshot: request.memorySnapshot,
            createdAt: now
          }
        ],
        inlineEdit: {
          fieldPath: request.target.fieldPath,
          fieldLabel: request.target.fieldLabel,
          action: request.action,
          instruction: request.instruction,
          selectionStart: request.selection.start,
          selectionEnd: request.selection.end,
          baseText: request.before,
          resultText: request.response.text,
          appliedText: request.after,
          storedBaseText: request.storedBefore,
          storedAppliedText: request.storedAfter,
          consistencyBeforeCount: request.consistencyPreview.beforeCount,
          consistencyAfterCount: request.consistencyPreview.afterCount,
          introducedConsistencyIssues: request.consistencyPreview.introducedIssues,
          sourceContextIds: request.response.sourceIds,
          memoryIds: request.response.memoryIds,
          newCreation: request.response.newCreation,
          status: "applied",
          appliedAt: now,
          revertedAt: ""
        },
        updatedAt: now
      },
      request.target.worldId
    );
    const candidateMemories = request.response.candidateFacts.map((fact, index) =>
      normalizeAiMemoryItem(
        {
          id: createAiWritingId("ai-memory"),
          category: fact.category,
          state: "draft",
          title: fact.title,
          content: fact.content,
          sourceContextId: request.target.contextId,
          fact: {
            subject: fact.subject,
            property: fact.property,
            value: fact.value,
            temporalScope: fact.temporalScope
          },
          sources: [
            {
              id: createAiWritingId("ai-source"),
              kind: "ai-draft",
              contextId: request.target.contextId,
              contextLabel: `${contextLabel} · ${request.target.fieldLabel}`,
              writingSessionId: session.id,
              excerpt: fact.sourceQuote,
              capturedAt: now
            }
          ],
          tags: fact.tags,
          createdAt: now,
          updatedAt: now
        },
        request.target.worldId,
        index
      )
    );
    const knownMemoryKeys = new Set(
      current.aiMemoryItems.map(
        (item) => `${item.worldId}\u0000${item.title}\u0000${item.content}`
      )
    );
    const nextData: WorkspaceData = {
      ...applied.data,
      aiWritingSessions: [...applied.data.aiWritingSessions, session],
      aiMemoryItems: [
        ...applied.data.aiMemoryItems,
        ...candidateMemories.filter(
          (item) =>
            !knownMemoryKeys.has(`${item.worldId}\u0000${item.title}\u0000${item.content}`)
        )
      ]
    };

    try {
      const checkpoint = await workspaceStore.createBackup(current, "ai-inline-edit");
      if (!checkpoint.ok) {
        return { ok: false, error: checkpoint.error || "AI 修改前检查点创建失败" };
      }
      cancelPendingAutosave();
      const saved = await workspaceStore.saveWorkspace(nextData, "ai-inline-edit");
      if (!saved.ok) {
        setSaveRetryToken((value) => value + 1);
        return { ok: false, error: saved.error || "AI 修改写入失败" };
      }
      dataRef.current = nextData;
      setData(nextData);
      setSaveStatus(
        `AI 已修改${request.target.fieldLabel}${candidateMemories.length ? ` · 新增 ${candidateMemories.length} 条草稿记忆` : ""}`
      );
      return { ok: true };
    } catch (error) {
      setSaveRetryToken((value) => value + 1);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "AI 修改写入失败"
      };
    }
  }

  async function undoInlineAiChange(
    sessionId: string
  ): Promise<{ ok: boolean; error?: string }> {
    const workspaceStore = window.worldcraftStore;
    const current = dataRef.current;
    if (!workspaceStore) {
      return { ok: false, error: "编辑器内 AI 撤销仅在本地桌面版中可用" };
    }
    const session = current.aiWritingSessions.find((item) => item.id === sessionId);
    if (!session) return { ok: false, error: "AI 修改记录已经不存在" };
    if (!session.worldId || session.worldId !== activeWorldIdRef.current) {
      return { ok: false, error: "当前世界已经切换，无法撤销这次修改" };
    }
    const undone = undoInlineAiWorkspaceChange(current, sessionId);
    if (!undone.ok) return undone;

    try {
      const checkpoint = await workspaceStore.createBackup(current, "ai-inline-undo");
      if (!checkpoint.ok) {
        return { ok: false, error: checkpoint.error || "AI 撤销前检查点创建失败" };
      }
      cancelPendingAutosave();
      const saved = await workspaceStore.saveWorkspace(undone.data, "ai-inline-undo");
      if (!saved.ok) {
        setSaveRetryToken((value) => value + 1);
        return { ok: false, error: saved.error || "AI 修改撤销失败" };
      }
      dataRef.current = undone.data;
      setData(undone.data);
      setSaveStatus(
        `已撤销编辑器内 AI 修改${undone.removedMemoryIds.length ? ` · 清理 ${undone.removedMemoryIds.length} 条候选记忆` : ""}`
      );
      return { ok: true };
    } catch (error) {
      setSaveRetryToken((value) => value + 1);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "AI 修改撤销失败"
      };
    }
  }

  async function executeAiOperationPlan(
    plan: AiOperationPlan,
    instruction: string,
    model: string
  ): Promise<{ ok: boolean; run?: AiOperationRun; error?: string }> {
    const operationWorldId = activeWorld?.id ?? "";
    if (!operationWorldId || operationWorldId !== activeWorldIdRef.current) {
      return { ok: false, error: "当前世界已经切换，请重新执行这条指令" };
    }
    const workspaceStore = window.worldcraftStore;
    if (!workspaceStore) {
      return { ok: false, error: "AI 项目操作仅在本地桌面版中可用" };
    }
    const current = dataRef.current;
    const applied = applyAiOperationPlan(current, plan, {
      worldId: operationWorldId,
      instruction,
      model
    });
    if (!applied.ok) return applied;

    try {
      const checkpoint = await workspaceStore.createBackup(current, "ai-operation");
      if (!checkpoint.ok) {
        return { ok: false, error: checkpoint.error || "AI 操作前检查点创建失败" };
      }
      cancelPendingAutosave();
      const saved = await workspaceStore.saveWorkspace(applied.data, "ai-operation");
      if (!saved.ok) {
        setSaveRetryToken((value) => value + 1);
        return { ok: false, error: saved.error || "AI 项目操作写入失败" };
      }
      dataRef.current = applied.data;
      setData(applied.data);
      setSaveStatus(`AI 已执行 ${applied.run.changes.length} 个项目操作`);
      return { ok: true, run: applied.run };
    } catch (error) {
      setSaveRetryToken((value) => value + 1);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "AI 项目操作写入失败"
      };
    }
  }

  async function undoAiOperation(
    runId: string
  ): Promise<{ ok: boolean; run?: AiOperationRun; error?: string }> {
    const workspaceStore = window.worldcraftStore;
    if (!workspaceStore) {
      return { ok: false, error: "AI 项目撤销仅在本地桌面版中可用" };
    }
    const current = dataRef.current;
    const undone = undoAiOperationRun(current, runId);
    if (!undone.ok) return undone;
    try {
      const checkpoint = await workspaceStore.createBackup(current, "ai-operation-undo");
      if (!checkpoint.ok) {
        return { ok: false, error: checkpoint.error || "AI 撤销前检查点创建失败" };
      }
      cancelPendingAutosave();
      const saved = await workspaceStore.saveWorkspace(undone.data, "ai-operation-undo");
      if (!saved.ok) {
        setSaveRetryToken((value) => value + 1);
        return { ok: false, error: saved.error || "AI 撤销写入失败" };
      }
      dataRef.current = undone.data;
      setData(undone.data);
      setSaveStatus("AI 项目操作已完整撤销");
      return { ok: true, run: undone.run };
    } catch (error) {
      setSaveRetryToken((value) => value + 1);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "AI 撤销写入失败"
      };
    }
  }

  function openAiOperationChange(change: AiOperationChange) {
    const current = dataRef.current;
    if (change.target === "world") {
      const world = current.worlds.find((item) => item.id === change.itemId);
      if (!world) return setSaveStatus("该世界已不存在");
      setActiveWorldId(world.id);
      setActiveTab("permissions");
      return;
    }
    if (change.target === "codex-category") {
      const category = current.codexCategories.find((item) => item.id === change.itemId);
      if (!category) return setSaveStatus("该项目分类已删除或已被撤销");
      setCollapsedCategoryIds((collapsed) => {
        const next = new Set(collapsed);
        getCodexCategoryPath(current.codexCategories, category.id).forEach((item) => next.delete(item.id));
        return next;
      });
      setCategoryDialogState({ open: true, categoryId: category.id, parentId: category.parentId });
      setActiveTab("codex");
      return;
    }
    if (change.target === "entity-template") {
      if (!current.entityTemplates.some((item) => item.id === change.itemId)) {
        return setSaveStatus("该条目模板已删除或已被撤销");
      }
      setSelectedEntityTemplateId(change.itemId);
      setActiveTab("templates");
      return;
    }
    if (change.target === "entity") {
      const entity = current.entities.find((item) => item.id === change.itemId);
      if (!entity) return setSaveStatus("该条目已删除或已被撤销");
      setSelectedEntityId(entity.id);
      setActiveType(entity.type);
      setActiveTab("codex");
      return;
    }
    if (change.target === "quest") {
      if (!current.quests.some((item) => item.id === change.itemId)) {
        return setSaveStatus("该任务已删除或已被撤销");
      }
      setSelectedQuestId(change.itemId);
      setQuestWorkspaceMode("editor");
      setActiveTab("quests");
      return;
    }
    if (change.target === "story-variable") {
      if (!current.storyVariables.some((item) => item.id === change.itemId)) {
        return setSaveStatus("该剧情变量已删除或已被撤销");
      }
      setSelectedStoryVariableId(change.itemId);
      setStoryWorkspaceMode("variables");
      setActiveTab("story");
      return;
    }
    if (change.target === "story-scene") {
      if (!current.storyScenes.some((item) => item.id === change.itemId)) {
        return setSaveStatus("该剧情场景已删除或已被撤销");
      }
      setSelectedStorySceneId(change.itemId);
      setStoryWorkspaceMode("editor");
      setActiveTab("story");
      return;
    }
    if (change.target === "story-test-preset") {
      if (!current.storyTestPresets.some((item) => item.id === change.itemId)) {
        return setSaveStatus("该测试预设已删除或已被撤销");
      }
      setSelectedStoryTestPresetId(change.itemId);
      setStoryTestWorkspaceMode("analysis");
      setActiveTab("testing");
      return;
    }
    if (change.target === "story-review-issue") {
      if (!current.storyReviewIssues.some((item) => item.id === change.itemId)) {
        return setSaveStatus("该审阅问题已删除或已被撤销");
      }
      setSelectedStoryReviewIssueId(change.itemId);
      setStoryTestWorkspaceMode("issues");
      setActiveTab("testing");
      return;
    }
    if (change.target === "relation") {
      const relation = current.relations.find((item) => item.id === change.itemId);
      if (!relation) return setSaveStatus("该关系已删除或已被撤销");
      setSelectedRelationId(relation.id);
      setRelationFocusEntityId(relation.sourceEntityId);
      setActiveTab("relations");
      return;
    }
    if (change.target === "asset") {
      if (!current.assets.some((item) => item.id === change.itemId)) {
        return setSaveStatus("该资源已删除或已被撤销");
      }
      setSelectedAssetId(change.itemId);
      setAssetKindFilter("all");
      setActiveTab("assets");
      return;
    }
    if (change.target === "member") {
      if (!current.members.some((item) => item.id === change.itemId)) {
        return setSaveStatus("该成员已删除或已被撤销");
      }
      setActiveTab("permissions");
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(`[data-member-id="${CSS.escape(change.itemId)}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    if (change.target === "map") {
      const mapItem = current.maps.find((item) => item.id === change.itemId);
      if (!mapItem) return setSaveStatus("该地图已删除或已被撤销");
      selectWorldMap(mapItem.id);
      setMapOperationFocus((previous) => ({
        itemId: mapItem.id,
        target: "map",
        token: (previous?.token ?? 0) + 1
      }));
      setActiveTab("map");
      return;
    }
    if (change.target === "map-layer" || change.target === "map-marker-group") {
      const structureTarget = change.target;
      const item = structureTarget === "map-layer"
        ? current.mapLayers.find((candidate) => candidate.id === change.itemId)
        : current.mapMarkerGroups.find((candidate) => candidate.id === change.itemId);
      if (!item) return setSaveStatus("该地图结构已删除或已被撤销");
      selectWorldMap(item.mapId);
      setMapOperationFocus((previous) => ({
        itemId: item.id,
        target: structureTarget,
        token: (previous?.token ?? 0) + 1
      }));
      setActiveTab("map");
      return;
    }
    if (change.target === "map-marker") {
      const marker = current.mapMarkers.find((item) => item.id === change.itemId);
      if (!marker) return setSaveStatus("该地图标记已删除或已被撤销");
      selectWorldMap(marker.mapId);
      selectMapMarker(marker.id);
      setMapOperationFocus((previous) => ({
        itemId: marker.id,
        target: "map-marker",
        token: (previous?.token ?? 0) + 1
      }));
      setActiveTab("map");
      return;
    }
    if (change.target === "map-route") {
      const route = current.mapRoutes.find((item) => item.id === change.itemId);
      if (!route) return setSaveStatus("该地图路线已删除或已被撤销");
      selectWorldMap(route.mapId);
      selectMapRoute(route.id);
      setMapOperationFocus((previous) => ({
        itemId: route.id,
        target: "map-route",
        token: (previous?.token ?? 0) + 1
      }));
      setActiveTab("map");
      return;
    }
    if (change.target === "narrative-milestone") {
      if (!current.narrativeMilestones.some((item) => item.id === change.itemId)) {
        return setSaveStatus("该叙事里程碑已删除或已被撤销");
      }
      setSelectedNarrativeMilestoneId(change.itemId);
      setActiveTab("production");
      return;
    }
    if (change.target === "manuscript-book") {
      const book = current.manuscriptBooks.find((item) => item.id === change.itemId);
      if (!book) return setSaveStatus("该书稿已删除或已被撤销");
      const chapter = current.manuscriptChapters.find((item) => item.bookId === book.id);
      if (chapter) selectManuscriptUnit({ kind: "chapter", id: chapter.id });
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
      return;
    }
    if (change.target === "manuscript-volume") {
      const volume = current.manuscriptVolumes.find((item) => item.id === change.itemId);
      if (!volume) return setSaveStatus("该卷已删除或已被撤销");
      const chapter = current.manuscriptChapters.find((item) => item.volumeId === volume.id);
      if (chapter) selectManuscriptUnit({ kind: "chapter", id: chapter.id });
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
      return;
    }
    if (change.target === "manuscript-chapter") {
      if (!current.manuscriptChapters.some((item) => item.id === change.itemId)) {
        return setSaveStatus("该章节已删除或已被撤销");
      }
      selectManuscriptUnit({ kind: "chapter", id: change.itemId });
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
      return;
    }
    if (change.target === "manuscript-scene") {
      if (!current.manuscriptScenes.some((item) => item.id === change.itemId)) {
        return setSaveStatus("该正文场景已删除或已被撤销");
      }
      selectManuscriptUnit({ kind: "scene", id: change.itemId });
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
      return;
    }
    if (change.target === "timeline-track") {
      if (!current.timelineTracks.some((item) => item.id === change.itemId)) {
        return setSaveStatus("该时间轨道已删除或已被撤销");
      }
      setSelectedTimelineTrackId(change.itemId);
      setSelectedTimelineEventId("");
      setActiveTab("timeline");
      return;
    }
    const timelineEvent = current.timelineEvents.find((item) => item.id === change.itemId);
    if (!timelineEvent) return setSaveStatus("该时间点已删除或已被撤销");
    setSelectedTimelineEventId(timelineEvent.id);
    setSelectedTimelineTrackId(timelineEvent.trackId);
    setActiveTab("timeline");
  }

  async function commitRecordedAiChange({
    after,
    instruction,
    itemId,
    summary,
    target
  }: {
    after: unknown;
    instruction: string;
    itemId: string;
    summary: string;
    target: AiOperationTarget;
  }): Promise<{ ok: boolean; run?: AiOperationRun; error?: string }> {
    const workspaceStore = window.worldcraftStore;
    if (!workspaceStore) {
      return { ok: false, error: "AI 内容写入仅在本地桌面版中可用" };
    }
    const worldId = activeWorldIdRef.current;
    const current = dataRef.current;
    const recorded = recordAiWorkspaceChange(current, {
      worldId,
      target,
      itemId,
      after,
      instruction,
      summary,
      model: activeConsistencyModelSettings.model
    });
    if (!recorded.ok) return recorded;
    try {
      const checkpoint = await workspaceStore.createBackup(current, "ai-content-apply");
      if (!checkpoint.ok) {
        return { ok: false, error: checkpoint.error || "AI 写入前检查点创建失败" };
      }
      cancelPendingAutosave();
      const saved = await workspaceStore.saveWorkspace(recorded.data, "ai-content-apply");
      if (!saved.ok) {
        setSaveRetryToken((value) => value + 1);
        return { ok: false, error: saved.error || "AI 内容写入失败" };
      }
      dataRef.current = recorded.data;
      setData(recorded.data);
      setSaveStatus(`${summary} · 可在 AI 最近操作中撤销`);
      return { ok: true, run: recorded.run };
    } catch (error) {
      setSaveRetryToken((value) => value + 1);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "AI 内容写入失败"
      };
    }
  }

  async function applyAiToEntity(
    entityId: string,
    text: string
  ): Promise<{ ok: boolean; error?: string }> {
    const addition = plainTextToRichText(text.trim());
    if (!addition) return { ok: false, error: "没有可追加的 AI 内容" };
    const entity = dataRef.current.entities.find((item) => item.id === entityId);
    if (!entity) return { ok: false, error: "目标条目已经不存在" };
    const result = await commitRecordedAiChange({
      after: {
        ...entity,
        content: `${entity.content}${entity.content ? "<hr>" : ""}${addition}`,
        updatedAt: new Date().toISOString()
      },
      instruction: "把单次 AI 工具结果追加到条目正文",
      itemId: entity.id,
      summary: `追加条目正文：${entity.title}`,
      target: "entity"
    });
    if (!result.ok) return result;
    setSelectedEntityId(entityId);
    setActiveTab("codex");
    return { ok: true };
  }

  function createAiWritingRecord(session: AiWritingSession) {
    setData((previous) => ({
      ...previous,
      aiWritingSessions: [...previous.aiWritingSessions, session]
    }));
  }

  function updateAiWritingRecord(
    sessionId: string,
    patch: Partial<AiWritingSession>
  ) {
    setData((previous) => ({
      ...previous,
      aiWritingSessions: previous.aiWritingSessions.map((session) =>
        session.id === sessionId
          ? normalizeAiWritingSession(
              { ...session, ...patch, updatedAt: new Date().toISOString() },
              session.worldId
            )
          : session
      )
    }));
  }

  function deleteAiWritingRecord(sessionId: string) {
    if (!window.confirm("删除这个写作会话？已保存到对象历史的旧版本仍可在项目检查中找到。")) {
      return;
    }
    setData((previous) => ({
      ...previous,
      aiWritingSessions: previous.aiWritingSessions.filter(
        (session) => session.id !== sessionId
      )
    }));
  }

  function addAiMemories(items: AiMemoryItem[]) {
    setData((previous) => {
      const known = new Set(
        previous.aiMemoryItems.map(
          (item) => `${item.worldId}\u0000${item.title}\u0000${item.content}`
        )
      );
      const additions = items.filter(
        (item) => !known.has(`${item.worldId}\u0000${item.title}\u0000${item.content}`)
      );
      return { ...previous, aiMemoryItems: [...previous.aiMemoryItems, ...additions] };
    });
  }

  function updateAiMemory(memoryId: string, patch: Partial<AiMemoryItem>) {
    setData((previous) => ({
      ...previous,
      aiMemoryItems: previous.aiMemoryItems.map((item) =>
        item.id === memoryId
          ? normalizeAiMemoryItem(
              { ...item, ...patch, updatedAt: new Date().toISOString() },
              item.worldId
            )
          : item
      )
    }));
  }

  function deleteAiMemory(memoryId: string) {
    setData((previous) => ({
      ...previous,
      aiMemoryItems: previous.aiMemoryItems.filter((item) => item.id !== memoryId)
    }));
  }

  function openAiWritingTarget(context: AiContext) {
    if (context.kind === "entity") {
      setSelectedEntityId(context.targetId);
      setActiveTab("codex");
    } else if (context.kind === "quest") {
      setSelectedQuestId(context.targetId);
      setActiveTab("quests");
    } else if (context.kind === "scene") {
      setSelectedStorySceneId(context.targetId);
      setStoryWorkspaceMode("editor");
      setActiveTab("story");
    } else if (context.kind === "milestone") {
      setSelectedNarrativeMilestoneId(context.targetId);
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    } else if (context.kind === "manuscript-book") {
      const chapter = worldManuscriptChapters.find(
        (item) => item.bookId === context.targetId
      );
      if (chapter) selectManuscriptUnit({ kind: "chapter", id: chapter.id });
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    } else if (context.kind === "manuscript-volume") {
      const chapter = worldManuscriptChapters.find(
        (item) => item.volumeId === context.targetId
      );
      if (chapter) selectManuscriptUnit({ kind: "chapter", id: chapter.id });
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    } else if (context.kind === "manuscript-chapter") {
      selectManuscriptUnit({ kind: "chapter", id: context.targetId });
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    } else if (context.kind === "manuscript-scene") {
      selectManuscriptUnit({ kind: "scene", id: context.targetId });
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    }
  }

  async function applyAiWritingDraft(
    context: AiContext,
    draft: string
  ): Promise<{ ok: boolean; error?: string }> {
    const text = draft.trim();
    if (!text) return { ok: false, error: "没有可追加的剧情草稿" };
    if (context.kind === "entity") {
      return applyAiToEntity(context.targetId, text);
    }
    const current = dataRef.current;
    const now = new Date().toISOString();
    const apply = async (
      target: AiOperationTarget,
      item: { id: string; title?: string; name?: string },
      after: unknown,
      destination: string
    ) => {
      const result = await commitRecordedAiChange({
        after,
        instruction: `把剧情写作会话草稿追加到${destination}`,
        itemId: item.id,
        summary: `追加 AI 草稿：${item.title || item.name || destination}`,
        target
      });
      if (result.ok) openAiWritingTarget(context);
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    };
    if (context.kind === "quest") {
      const quest = current.quests.find((item) => item.id === context.targetId);
      if (!quest) return { ok: false, error: "目标任务已经不存在" };
      return apply("quest", quest, {
        ...quest,
        developerNotes: `${quest.developerNotes}${quest.developerNotes ? "\n\n" : ""}${text}`,
        updatedAt: now
      }, "任务开发者备注");
    }
    if (context.kind === "scene") {
      const scene = current.storyScenes.find((item) => item.id === context.targetId);
      if (!scene) return { ok: false, error: "目标剧情场景已经不存在" };
      return apply("story-scene", scene, {
        ...scene,
        notes: `${scene.notes}${scene.notes ? "\n\n" : ""}${text}`,
        updatedAt: now
      }, "剧情场景备注");
    }
    if (context.kind === "manuscript-book") {
      const book = current.manuscriptBooks.find((item) => item.id === context.targetId);
      if (!book) return { ok: false, error: "目标书稿已经不存在" };
      return apply("manuscript-book", book, {
        ...book,
        summary: `${book.summary}${book.summary ? "\n\n" : ""}${text}`,
        updatedAt: now
      }, "全书摘要");
    }
    if (context.kind === "manuscript-volume") {
      const volume = current.manuscriptVolumes.find((item) => item.id === context.targetId);
      if (!volume) return { ok: false, error: "目标卷已经不存在" };
      return apply("manuscript-volume", volume, {
        ...volume,
        summary: `${volume.summary}${volume.summary ? "\n\n" : ""}${text}`,
        updatedAt: now
      }, "卷摘要");
    }
    if (context.kind === "manuscript-chapter") {
      const addition = plainTextToRichText(text);
      const chapter = current.manuscriptChapters.find((item) => item.id === context.targetId);
      if (!chapter) return { ok: false, error: "目标章节已经不存在" };
      return apply("manuscript-chapter", chapter, {
        ...chapter,
        body: `${chapter.body}${chapter.body ? "<hr>" : ""}${addition}`,
        updatedAt: now
      }, "章节正文");
    }
    if (context.kind === "manuscript-scene") {
      const addition = plainTextToRichText(text);
      const scene = current.manuscriptScenes.find((item) => item.id === context.targetId);
      if (!scene) return { ok: false, error: "目标正文场景已经不存在" };
      return apply("manuscript-scene", scene, {
        ...scene,
        body: `${scene.body}${scene.body ? "<hr>" : ""}${addition}`,
        updatedAt: now
      }, "正文场景");
    }
    if (context.kind === "milestone") {
      const addition = plainTextToRichText(text);
      const milestone = current.narrativeMilestones.find((item) => item.id === context.targetId);
      if (!milestone) return { ok: false, error: "目标叙事里程碑已经不存在" };
      return apply("narrative-milestone", milestone, {
        ...milestone,
        manuscriptBody: `${milestone.manuscriptBody}${milestone.manuscriptBody ? "<hr>" : ""}${addition}`,
        updatedAt: now
      }, "叙事里程碑正文");
    }
    return { ok: false, error: "当前目标不支持追加 AI 草稿" };
  }

  function changeConsistencyFindingStatus(
    findingId: string,
    status: ConsistencyStatus,
    reason: string
  ) {
    setData((previous) => ({
      ...previous,
      consistencyFindings: previous.consistencyFindings.map((finding) =>
        finding.id === findingId
          ? updateConsistencyFindingStatus(finding, status, reason)
          : finding
      )
    }));
    setSaveStatus(
      status === "ignored"
        ? "忽略记录已保存"
        : status === "resolved"
          ? "一致性发现已标记为修复"
          : "一致性发现已重新打开"
    );
  }

  function createReviewIssuesFromConsistency(findingIds: string[]) {
    if (!activeWorld) return;
    const existingFindingIds = new Set(
      data.storyReviewIssues
        .filter((issue) => issue.worldId === activeWorld.id)
        .map((issue) => issue.consistencyFindingId)
        .filter(Boolean)
    );
    const findings = worldConsistencyFindings.filter(
      (finding) => findingIds.includes(finding.id) && !existingFindingIds.has(finding.id)
    );
    const issues = findings.map((finding) => {
      const targets = [finding.primaryTarget, ...finding.relatedTargets];
      const sceneId = targets.find((item) => item.type === "scene")?.id ?? "";
      const entityId = targets.find((item) => item.type === "entity")?.id ?? "";
      const questId = targets.find((item) => item.type === "quest")?.id ?? "";
      return createStoryReviewIssue(activeWorld.id, {
        title: `[${finding.ruleId}] ${finding.title}`,
        detail: `${finding.detail}\n\n建议：${finding.suggestion}\n\n证据：\n${finding.evidence
          .map((item) => `- ${item.label}：${item.value}`)
          .join("\n")}`,
        severity: finding.severity,
        source: "consistency",
        consistencyFindingId: finding.id,
        consistencyRuleId: finding.ruleId,
        sceneId,
        entityId,
        questId
      });
    });
    if (!issues.length) {
      setSaveStatus("所选发现已存在对应审阅问题");
      return;
    }
    setData((previous) => ({
      ...previous,
      storyReviewIssues: [...issues, ...previous.storyReviewIssues],
      consistencyFindings: previous.consistencyFindings.map((finding) =>
        findingIds.includes(finding.id)
          ? { ...finding, statusReason: "已转为剧情审阅问题" }
          : finding
      )
    }));
    setSelectedStoryReviewIssueId(issues[0].id);
    setSaveStatus(`已创建 ${issues.length} 个剧情审阅问题`);
  }

  function openConsistencyTarget(target: ConsistencyTarget) {
    if (target.type === "entity") {
      setSelectedEntityId(target.id);
      setActiveTab("codex");
    } else if (target.type === "quest") {
      openQuestInEditor(target.id);
    } else if (target.type === "scene") {
      setSelectedStorySceneId(target.id);
      setStoryWorkspaceMode("editor");
      setActiveTab("story");
    } else if (target.type === "variable") {
      setSelectedStoryVariableId(target.id);
      setStoryWorkspaceMode("variables");
      setActiveTab("story");
    } else if (target.type === "map") {
      selectWorldMap(target.id);
      setActiveTab("map");
    } else if (target.type === "marker") {
      openMapMarker(target.id);
    } else if (target.type === "route") {
      const route = data.mapRoutes.find((item) => item.id === target.id);
      if (route) {
        setSelectedMapId(route.mapId);
        selectMapRoute(route.id);
      }
      setActiveTab("map");
    } else if (target.type === "track") {
      selectTimelineTrack(target.id);
      setActiveTab("timeline");
    } else if (target.type === "timeline") {
      openTimelineEvent(target.id);
    } else if (target.type === "relation") {
      selectRelation(target.id);
      setActiveTab("relations");
    } else if (target.type === "asset") {
      setSelectedAssetId(target.id);
      setActiveTab("assets");
    } else if (target.type === "manuscript-book") {
      const chapter = data.manuscriptChapters.find((item) => item.bookId === target.id);
      if (chapter) selectManuscriptUnit({ kind: "chapter", id: chapter.id });
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    } else if (target.type === "manuscript-chapter") {
      selectManuscriptUnit({ kind: "chapter", id: target.id });
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    } else if (target.type === "manuscript-scene") {
      selectManuscriptUnit({ kind: "scene", id: target.id });
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    } else if (target.type === "manuscript-clue") {
      const clue = data.manuscriptClues.find((item) => item.id === target.id);
      const unit = clue
        ? clue.setupUnitKind === "scene"
          ? { kind: "scene" as const, id: clue.setupUnitId }
          : { kind: "chapter" as const, id: clue.setupUnitId }
        : null;
      if (unit) selectManuscriptUnit(unit);
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    } else if (target.type === "manuscript-knowledge") {
      const item = data.manuscriptKnowledgeStates.find((entry) => entry.id === target.id);
      if (item) selectManuscriptUnit({ kind: item.unitKind, id: item.unitId });
      setStoryWorkspaceMode("manuscript");
      setActiveTab("story");
    }
  }

  function exportConsistencyJson() {
    if (!activeWorld) return;
    const latestScan = [...worldConsistencyScans].sort((left, right) =>
      right.completedAt.localeCompare(left.completedAt)
    )[0];
    downloadTextFile(
      `${slugify(activeWorld.name)}-consistency.json`,
      JSON.stringify(
        {
          app: "Worldcraft Codex",
          version: 1,
          exportedAt: new Date().toISOString(),
          world: { id: activeWorld.id, name: activeWorld.name },
          latestScan: latestScan ?? null,
          findings: worldConsistencyFindings,
          settings: activeConsistencySettings
        },
        null,
        2
      ),
      "application/json"
    );
  }

  function exportConsistencyMarkdown() {
    if (!activeWorld) return;
    const latestScan = [...worldConsistencyScans].sort((left, right) =>
      right.completedAt.localeCompare(left.completedAt)
    )[0];
    downloadTextFile(
      `${slugify(activeWorld.name)}-consistency.md`,
      buildConsistencyMarkdownReport(
        activeWorld.name,
        worldConsistencyFindings,
        latestScan
      ),
      "text/markdown;charset=utf-8"
    );
  }

  async function explainConsistencyFinding(findingId: string) {
    const finding = worldConsistencyFindings.find((item) => item.id === findingId);
    if (!finding || !activeWorld || !window.worldcraftStore) return;
    setModelBusyFindingId(findingId);
    setConsistencyModelMessage("正在连接 AI 模型...");
    try {
      const result = await window.worldcraftStore.explainConsistencyFinding(
        activeConsistencyModelSettings,
        buildConsistencyModelPrompt(activeWorld.name, finding)
      );
      if (!result.ok || !result.text) {
        setConsistencyModelMessage(result.error ?? "AI 模型没有返回解释");
        return;
      }
      setData((previous) => ({
        ...previous,
        consistencyFindings: previous.consistencyFindings.map((item) =>
          item.id === findingId
            ? {
                ...item,
                explanation: {
                  text: result.text as string,
                  model: result.model || activeConsistencyModelSettings.model,
                  generatedAt: new Date().toISOString()
                }
              }
            : item
        )
      }));
      setConsistencyModelMessage("AI 补充解释已保存");
    } catch (error) {
      console.error(error);
      setConsistencyModelMessage("无法连接 AI 模型服务");
    } finally {
      setModelBusyFindingId("");
    }
  }

  function updateWorld(patch: Partial<World>) {
    if (!activeWorld) {
      return;
    }
    setData((previous) => ({
      ...previous,
      worlds: previous.worlds.map((world) =>
        world.id === activeWorld.id
          ? { ...world, ...patch, updatedAt: new Date().toISOString() }
          : world
      )
    }));
  }

  function selectRelation(relationId: string) {
    const relation = worldRelations.find((item) => item.id === relationId);
    setSelectedRelationId(relationId);
    setRelationInspectorMode("relation");
    if (relation) {
      setRelationFocusEntityId(relation.sourceEntityId);
    }
  }

  function selectRelationEntity(entityId: string) {
    setRelationFocusEntityId(entityId);
    setRelationInspectorMode("entity");
  }

  function editSelectedRelationFromGraph() {
    setVisualFullscreen(null);
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(".relation-editor-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function createRelation() {
    if (!activeWorld || worldEntities.length < 2) {
      setSaveStatus("至少需要两个条目才能创建关系");
      return;
    }

    const source =
      worldEntities.find((entity) => entity.id === relationFocusEntityId) ?? worldEntities[0];
    const target = worldEntities.find((entity) => entity.id !== source.id) as Entity;
    const relation = emptyRelation(activeWorld.id, source.id, target.id);
    setData((previous) => ({
      ...previous,
      relations: [...previous.relations, relation]
    }));
    setSelectedRelationId(relation.id);
    setRelationFocusEntityId(source.id);
    setRelationInspectorMode("relation");
    setActiveTab("relations");
  }

  function generateRelationsFromLinks() {
    if (!activeWorld) {
      return;
    }

    const existingKeys = new Set<string>();
    worldRelations.forEach((relation) => {
      existingKeys.add(`${relation.sourceEntityId}->${relation.targetEntityId}`);
      if (relation.direction !== "directed") {
        existingKeys.add(`${relation.targetEntityId}->${relation.sourceEntityId}`);
      }
    });
    const generated: EntityRelation[] = [];

    worldEntities.forEach((source) => {
      extractMentions(source.content).forEach((mention) => {
        const target = worldEntities.find(
          (entity) => normalize(entity.title) === normalize(mention)
        );
        if (!target || target.id === source.id) {
          return;
        }

        const key = `${source.id}->${target.id}`;
        if (existingKeys.has(key)) {
          return;
        }

        existingKeys.add(key);
        const relation = emptyRelation(activeWorld.id, source.id, target.id);
        relation.kind = "custom";
        relation.label = "正文提及";
        relation.direction = "directed";
        relation.strength = 1;
        relation.notes = `由 ${source.title} 正文中的 [[${target.title}]] 自动生成。`;
        generated.push(relation);
      });
    });

    if (!generated.length) {
      setSaveStatus("没有发现新的 [[双向链接]] 关系");
      return;
    }

    setData((previous) => ({
      ...previous,
      relations: [...previous.relations, ...generated]
    }));
    setSelectedRelationId(generated[0].id);
    setRelationFocusEntityId(generated[0].sourceEntityId);
    setSaveStatus(`已从正文链接生成 ${generated.length} 条可编辑关系`);
  }

  function updateSelectedRelation(patch: Partial<EntityRelation>) {
    if (!selectedRelation) {
      return;
    }

    setData((previous) => ({
      ...previous,
      relations: previous.relations.map((relation) =>
        relation.id === selectedRelation.id
          ? { ...relation, ...patch, updatedAt: new Date().toISOString() }
          : relation
      )
    }));
  }

  function changeSelectedRelationKind(kind: RelationKind) {
    if (!selectedRelation) {
      return;
    }

    const previousDefault = relationKindMeta[selectedRelation.kind].label;
    updateSelectedRelation({
      kind,
      direction: relationKindMeta[kind].defaultDirection,
      label:
        !selectedRelation.label.trim() || selectedRelation.label === previousDefault
          ? relationKindMeta[kind].label
          : selectedRelation.label
    });
  }

  function swapSelectedRelation() {
    if (!selectedRelation) {
      return;
    }

    updateSelectedRelation({
      sourceEntityId: selectedRelation.targetEntityId,
      targetEntityId: selectedRelation.sourceEntityId
    });
    setRelationFocusEntityId(selectedRelation.targetEntityId);
  }

  async function removeSelectedRelation() {
    if (
      !selectedRelation ||
      !window.confirm(`删除关系“${selectedRelation.label}”？软件会先创建一份删除前备份。`)
    ) {
      return;
    }

    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-relation-delete");
      await window.worldcraftStore.createBackup(data);
    }

    const remaining = worldRelations.filter((relation) => relation.id !== selectedRelation.id);
    setData((previous) => ({
      ...previous,
      relations: previous.relations.filter((relation) => relation.id !== selectedRelation.id)
    }));
    setSelectedRelationId(remaining[0]?.id ?? "");
    setSaveStatus("关系已删除，删除前备份已创建");
  }

  function openRelationEntity(entityId: string) {
    setVisualFullscreen(null);
    setSelectedEntityId(entityId);
    setActiveTab("codex");
  }

  async function importAssetFiles() {
    if (!activeWorld) {
      return;
    }
    if (!window.worldcraftStore) {
      setSaveStatus("资源文件导入仅在桌面版中可用");
      return;
    }

    try {
      const result = await window.worldcraftStore.importAssets();
      if (!result.ok || !result.assets?.length) {
        if (result.error) {
          setSaveStatus(`资源导入失败：${result.error}`);
        }
        return;
      }

      const importedAssets = result.assets.map<WorldAsset>((asset) => ({
        ...asset,
        worldId: activeWorld.id,
        tags: [],
        notes: "",
        linkedEntityIds: [],
        updatedAt: asset.createdAt
      }));
      setData((previous) => ({
        ...previous,
        assets: [...previous.assets, ...importedAssets]
      }));
      setSelectedAssetId(importedAssets[0].id);
      setAssetKindFilter("all");
      setAssetQuery("");
      setAssetFileStatus(null);
      setSaveStatus(
        `已导入 ${importedAssets.length} 个资源${result.reusedFileCount ? `，复用 ${result.reusedFileCount} 个已有文件` : ""}`
      );
    } catch (error) {
      console.error(error);
      setSaveStatus("资源导入失败，请检查文件是否仍可访问");
    }
  }

  function updateSelectedAsset(patch: Partial<WorldAsset>) {
    if (!selectedAsset) {
      return;
    }

    setData((previous) => ({
      ...previous,
      assets: previous.assets.map((asset) =>
        asset.id === selectedAsset.id
          ? { ...asset, ...patch, updatedAt: new Date().toISOString() }
          : asset
      )
    }));
  }

  function toggleAssetEntity(entityId: string) {
    if (!selectedAsset) {
      return;
    }
    updateSelectedAsset({
      linkedEntityIds: selectedAsset.linkedEntityIds.includes(entityId)
        ? selectedAsset.linkedEntityIds.filter((id) => id !== entityId)
        : [...selectedAsset.linkedEntityIds, entityId]
    });
  }

  function useSelectedAssetAsMap() {
    if (
      !selectedAsset ||
      !activeMap ||
      !["image", "map", "concept"].includes(selectedAsset.kind)
    ) {
      return;
    }

    commitMapMutation("将资源设为地图底图", (previous) => ({
      ...previous,
      maps: previous.maps.map((mapItem) =>
        mapItem.id === activeMap.id
          ? {
              ...mapItem,
              imageUrl: getAssetUrl(selectedAsset.storedName),
              imageTransform: createMapImageTransform()
            }
          : mapItem
      ),
      assets: previous.assets.map((asset) =>
        asset.id === selectedAsset.id
          ? { ...asset, kind: "map", updatedAt: new Date().toISOString() }
          : asset
      )
    }));
    setSaveStatus(`已将“${selectedAsset.name}”设为世界地图`);
  }

  async function revealSelectedAsset() {
    if (!selectedAsset || !window.worldcraftStore) {
      setSaveStatus("在文件夹中显示仅在桌面版中可用");
      return;
    }
    const result = await window.worldcraftStore.revealAsset(selectedAsset.storedName);
    if (!result.ok) {
      setSaveStatus("本地资源文件不存在，元数据仍保留在项目中");
    }
  }

  async function relinkSelectedAsset() {
    if (!selectedAsset || !window.worldcraftStore) {
      setSaveStatus("资源重定位仅在桌面版中可用");
      return;
    }
    const currentStatus = assetFileStatus?.[selectedAsset.storedName];
    const result = await window.worldcraftStore.relinkAsset({
      storedName: selectedAsset.storedName,
      originalName: selectedAsset.originalName,
      contentHash: selectedAsset.contentHash,
      missing: currentStatus?.exists === false
    });
    if (!result.ok || !result.asset) {
      if (result.error) setSaveStatus(`资源重定位失败：${result.error}`);
      return;
    }
    const previousStoredName = selectedAsset.storedName;
    const nextFile = result.asset;
    const sharedAssetCount = data.assets.filter(
      (asset) => asset.storedName === previousStoredName
    ).length;
    setData((previous) => {
      const rewritten = replaceWorkspaceAssetUrl(
        previous,
        previousStoredName,
        nextFile.storedName
      );
      return {
        ...rewritten,
        assets: rewritten.assets.map((asset) =>
          asset.storedName === previousStoredName
            ? {
                ...asset,
                storedName: nextFile.storedName,
                originalName:
                  asset.id === selectedAsset.id ? nextFile.originalName : asset.originalName,
                mimeType: nextFile.mimeType,
                size: nextFile.size,
                contentHash: nextFile.contentHash,
                updatedAt: new Date().toISOString()
              }
            : asset
        )
      };
    });
    setAssetFileStatus(null);
    setSaveStatus(
      `${currentStatus?.exists === false ? "已重定位" : "已替换"}“${selectedAsset.name}”${sharedAssetCount > 1 ? `，并修复 ${sharedAssetCount} 个共享引用` : ""}`
    );
  }

  async function removeSelectedAsset() {
    const sharedFileCount = selectedAsset
      ? data.assets.filter((asset) => asset.storedName === selectedAsset.storedName).length
      : 0;
    const storyboardUseCount = selectedAsset
      ? data.storyScenes.reduce(
          (count, scene) =>
            count + scene.nodes.filter((node) => node.mediaAssetId === selectedAsset.id).length,
          0
        )
      : 0;
    if (
      !selectedAsset ||
      !window.confirm(
        (sharedFileCount > 1
          ? `删除资源“${selectedAsset.name}”？本地文件仍被其他 ${sharedFileCount - 1} 个资源引用，因此会保留。`
          : `删除资源“${selectedAsset.name}”？文件会移入 Windows 回收站，并先创建项目备份。`) +
          (storyboardUseCount
            ? `\n\n它还用于 ${storyboardUseCount} 个剧情镜头；删除后这些镜头会改为无画面。`
            : "")
      )
    ) {
      return;
    }

    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-asset-delete");
      await window.worldcraftStore.createBackup(data);
      if (sharedFileCount <= 1) {
        const result = await window.worldcraftStore.trashAsset(selectedAsset.storedName);
        if (!result.ok) {
          setSaveStatus(`资源删除失败：${result.error ?? "无法移动文件"}`);
          return;
        }
      }
    }

    const remaining = worldAssets.filter((asset) => asset.id !== selectedAsset.id);
    setData((previous) => {
      const cleaned =
        sharedFileCount > 1
          ? previous
          : replaceWorkspaceAssetUrl(previous, selectedAsset.storedName, "");
      return {
        ...cleaned,
        assets: cleaned.assets.filter((asset) => asset.id !== selectedAsset.id),
        storyScenes: cleaned.storyScenes.map((scene) => ({
          ...scene,
          nodes: scene.nodes.map((node) =>
            node.mediaAssetId === selectedAsset.id
              ? { ...node, mediaAssetId: "" }
              : node
          )
        })),
        maps:
          sharedFileCount > 1
            ? cleaned.maps
            : cleaned.maps.map((mapItem, index) =>
                previous.maps[index]?.imageUrl === getAssetUrl(selectedAsset.storedName)
                  ? { ...mapItem, imageTransform: createMapImageTransform() }
                  : mapItem
              )
      };
    });
    setSelectedAssetId(remaining[0]?.id ?? "");
    setAssetFileStatus(null);
    setSaveStatus(
      sharedFileCount > 1
        ? "资源记录已删除，共享文件仍由其他资源使用"
        : "资源已删除，文件已移入回收站，删除前备份已创建"
    );
  }

  function updateSelectedEntity(patch: Partial<Entity>) {
    if (!selectedEntity) {
      return;
    }

    setData((previous) => {
      const nextEntities = previous.entities.map((entity) => {
        if (entity.id !== selectedEntity.id) {
          return entity;
        }

        const nextEntity = {
          ...entity,
          ...patch,
          updatedAt: new Date().toISOString()
        };

        if (patch.title) {
          nextEntity.slug = slugify(patch.title);
        }
        if (patch.type && patch.type !== entity.type) {
          const nextTemplate = previous.entityTemplates.find(
            (template) =>
              template.worldId === entity.worldId &&
              template.builtIn &&
              template.entityTypes.includes(patch.type as TemplateEntityType)
          );
          nextEntity.templateId = nextTemplate?.id;
          nextEntity.templateData = applyTemplateDefaults(nextTemplate ?? null, nextEntity.templateData);
        }

        return nextEntity;
      });

      const nextSelected = nextEntities.find((entity) => entity.id === selectedEntity.id);
      const needsTimeline =
        nextSelected?.type === "event" &&
        !previous.timelineEvents.some((event) => event.entityId === selectedEntity.id);
      if (!needsTimeline) {
        return { ...previous, entities: nextEntities };
      }

      const trackId = previous.timelineTracks.find(
        (track) => track.worldId === selectedEntity.worldId
      )?.id ?? "";
      const timelineEvent = createTimelineEvent(
        selectedEntity.worldId,
        trackId,
        previous.timelineEvents.length + 1
      );
      timelineEvent.entityId = selectedEntity.id;
      timelineEvent.title = nextSelected?.title ?? selectedEntity.title;
      timelineEvent.summary = nextSelected?.summary ?? selectedEntity.summary;
      timelineEvent.displayDate = nextSelected?.templateData.time || "未定时间";

      return {
        ...previous,
        entities: nextEntities,
        timelineEvents: [...previous.timelineEvents, timelineEvent]
      };
    });
  }

  async function refreshEntityVersions(entityId = selectedEntityId) {
    if (!window.worldcraftStore || !entityId) {
      setEntityVersions([]);
      return;
    }

    setVersionsLoading(true);
    try {
      const result = await window.worldcraftStore.listEntityVersions(entityId);
      setEntityVersions(result.ok ? result.versions : []);
    } catch (error) {
      console.error(error);
      setEntityVersions([]);
    } finally {
      setVersionsLoading(false);
    }
  }

  async function restoreEntityVersion(version: EntityVersion) {
    if (!selectedEntity || !window.confirm(`恢复“${selectedEntity.title}”到这个版本？当前版本会先保存到历史记录。`)) {
      return;
    }

    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-entity-version-restore");
    }

    const restoredAt = new Date().toISOString();
    setData((previous) => ({
      ...previous,
      entities: previous.entities.map((entity) =>
        entity.id === selectedEntity.id
          ? {
              ...version.entity,
              id: entity.id,
              worldId: entity.worldId,
              categoryId: version.entity.categoryId || entity.categoryId,
              order: Number.isFinite(version.entity.order) ? version.entity.order : entity.order,
              updatedAt: restoredAt
            }
          : entity
      )
    }));
    setSaveStatus(`已恢复条目版本：${formatDateLabel(version.createdAt)}`);
    await refreshEntityVersions(selectedEntity.id);
  }

  function updateTemplateField(key: string, value: string) {
    if (!selectedEntity) {
      return;
    }

    updateSelectedEntity({
      templateData: {
        ...selectedEntity.templateData,
        [key]: value
      }
    });
  }

  function updateTimelineEvent(eventId: string, patch: Partial<TimelineEvent>) {
    setData((previous) => ({
      ...previous,
      timelineEvents: previous.timelineEvents.map((item) =>
        item.id === eventId
          ? normalizeTimelineEvent(
              { ...item, ...patch, updatedAt: new Date().toISOString() },
              item.worldId,
              item.trackId
            )
          : item
      )
    }));
  }

  function updateMember(memberId: string, role: Role) {
    setData((previous) => ({
      ...previous,
      members: previous.members.map((member) =>
        member.id === memberId ? { ...member, role } : member
      )
    }));
  }

  function addMember() {
    if (!activeWorld || !memberDraft.trim()) {
      return;
    }

    const email = memberDraft.trim();
    const name = email.includes("@") ? email.split("@")[0] : email;
    setData((previous) => ({
      ...previous,
      members: [
        ...previous.members,
        {
          id: createId("member"),
          worldId: activeWorld.id,
          name,
          email,
          role: "viewer"
        }
      ]
    }));
    setMemberDraft("");
  }

  function handleTagsChange(value: string) {
    updateSelectedEntity({
      tags: value
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    });
  }

  function runAssistantDraft() {
    if (!selectedEntity || !selectedEntityTemplate) {
      return;
    }

    const fields = selectedEntityTemplate.fields;
    const templateData = { ...selectedEntity.templateData };
    fields.forEach((field) => {
      if (!templateData[field.key]?.trim()) {
        if (field.type === "entity_ref") return;
        templateData[field.key] = field.type === "textarea"
          ? `${selectedEntity.title} 的${field.label}需要与主线冲突、关系网和地图位置保持一致。`
          : field.type === "boolean"
            ? "false"
            : field.type === "select"
              ? field.options[0] ?? ""
              : field.type === "number"
                ? "0"
                : `${selectedEntity.title}的${field.label}`;
      }
    });

    const suggestedLine = `\n\n创作检查：${selectedEntity.title} 当前已连接 ${outgoingLinks.length} 个条目，被 ${backlinks.length} 个条目引用。`;
    updateSelectedEntity({
      summary: selectedEntity.summary.trim() || entityTypeMeta[selectedEntity.type].defaultSummary,
      templateData,
      content: selectedEntity.content.includes("创作检查：")
        ? selectedEntity.content
        : `${selectedEntity.content}${suggestedLine}`
    });
  }

  async function uploadMapImage(mapId: string, file: File) {
    const supportedImage = file.type.startsWith("image/")
      || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);
    if (!supportedImage) {
      setSaveStatus("地图底图导入失败：请选择 PNG、JPG、WebP、GIF 或 SVG 图片");
      return;
    }
    if (file.size > 24 * 1024 * 1024) {
      setSaveStatus("地图底图导入失败：单张图片不能超过 24 MB");
      return;
    }

    setSaveStatus(`正在导入地图底图“${file.name}”`);
    try {
      const targetMap = dataRef.current.maps.find((mapItem) => mapItem.id === mapId);
      if (!targetMap) throw new Error("map-not-found");
      const prepared = await prepareMapImage(file);
      let imageUrl = "";
      let importedAsset: WorldAsset | null = null;

      if (window.worldcraftStore?.storeMapImage) {
        const result = await window.worldcraftStore.storeMapImage({
          bytes: await prepared.blob.arrayBuffer(),
          mimeType: prepared.mimeType,
          name: prepared.name,
          originalName: file.name
        });
        const storedAsset = result.assets?.[0];
        if (!result.ok || !storedAsset) {
          throw new Error(result.error || "asset-store-failed");
        }
        imageUrl = getAssetUrl(storedAsset.storedName);
        importedAsset = {
          ...storedAsset,
          worldId: targetMap.worldId,
          kind: "map",
          tags: ["地图底图"],
          notes: prepared.optimized ? "已自动优化为地图画布尺寸" : "由地图工作区导入",
          linkedEntityIds: [],
          updatedAt: storedAsset.createdAt
        };
      } else {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error("read-failed"));
          reader.onload = () => typeof reader.result === "string"
            ? resolve(reader.result)
            : reject(new Error("read-failed"));
          reader.readAsDataURL(prepared.blob);
        });
      }

      commitMapMutation("更换地图底图", (previous) => ({
        ...previous,
        assets: importedAsset && !previous.assets.some((asset) => asset.storedName === importedAsset.storedName)
          ? [...previous.assets, importedAsset]
          : previous.assets,
        maps: previous.maps.map((mapItem) =>
          mapItem.id === mapId
            ? normalizeWorldMap({
                ...mapItem,
                height: prepared.height,
                imageUrl,
                imageTransform: createMapImageTransform(),
                updatedAt: new Date().toISOString(),
                width: prepared.width
              }, mapItem.worldId, 1)
            : mapItem
        )
      }));
      setSaveStatus(
        `${prepared.optimized ? "已优化并" : "已"}将“${file.name}”设为地图底图 · ${prepared.width} × ${prepared.height}`
      );
    } catch (error) {
      console.error(error);
      setSaveStatus("地图底图导入失败：图片无法读取或格式已损坏");
    }
  }

  async function uploadMapLayerImage(layerId: string, file: File) {
    const supportedImage = file.type.startsWith("image/")
      || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);
    if (!supportedImage) {
      setSaveStatus("图片图层导入失败：请选择 PNG、JPG、WebP、GIF 或 SVG 图片");
      return;
    }
    if (file.size > 24 * 1024 * 1024) {
      setSaveStatus("图片图层导入失败：单张图片不能超过 24 MB");
      return;
    }

    setSaveStatus(`正在导入图片图层“${file.name}”`);
    try {
      const targetLayer = dataRef.current.mapLayers.find((layer) => layer.id === layerId);
      if (!targetLayer) throw new Error("map-layer-not-found");
      const prepared = await prepareMapImage(file);
      let imageUrl = "";
      let importedAsset: WorldAsset | null = null;

      if (window.worldcraftStore?.storeMapImage) {
        const result = await window.worldcraftStore.storeMapImage({
          bytes: await prepared.blob.arrayBuffer(),
          mimeType: prepared.mimeType,
          name: prepared.name,
          originalName: file.name
        });
        const storedAsset = result.assets?.[0];
        if (!result.ok || !storedAsset) {
          throw new Error(result.error || "asset-store-failed");
        }
        imageUrl = getAssetUrl(storedAsset.storedName);
        importedAsset = {
          ...storedAsset,
          worldId: targetLayer.worldId,
          kind: "map",
          tags: ["地图图片图层"],
          notes: prepared.optimized ? "已自动优化为地图图层尺寸" : "由地图图层导入",
          linkedEntityIds: [],
          updatedAt: storedAsset.createdAt
        };
      } else {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error("read-failed"));
          reader.onload = () => typeof reader.result === "string"
            ? resolve(reader.result)
            : reject(new Error("read-failed"));
          reader.readAsDataURL(prepared.blob);
        });
      }

      commitMapMutation("更换图层图片", (previous) => ({
        ...previous,
        assets: importedAsset && !previous.assets.some((asset) => asset.storedName === importedAsset.storedName)
          ? [...previous.assets, importedAsset]
          : previous.assets,
        mapLayers: previous.mapLayers.map((layer, index) => layer.id === layerId
          ? normalizeMapLayer({
              ...layer,
              imageUrl,
              imageTransform: createMapImageTransform(),
              updatedAt: new Date().toISOString()
            }, layer.worldId, layer.mapId, index)
          : layer)
      }));
      setSaveStatus(
        `${prepared.optimized ? "已优化并" : "已"}将“${file.name}”加入图片图层 · ${prepared.width} × ${prepared.height}`
      );
    } catch (error) {
      console.error(error);
      setSaveStatus("图片图层导入失败：图片无法读取或格式已损坏");
    }
  }

  async function uploadMapMarkerIcon(markerId: string, file: File) {
    const supportedImage = file.type.startsWith("image/")
      || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);
    if (!supportedImage) {
      setSaveStatus("标记图标导入失败：请选择 PNG、JPG、WebP、GIF 或 SVG 图片");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setSaveStatus("标记图标导入失败：图片不能超过 4 MB");
      return;
    }

    setSaveStatus(`正在导入标记图标“${file.name}”`);
    try {
      const targetMarker = dataRef.current.mapMarkers.find((marker) => marker.id === markerId);
      const targetMap = dataRef.current.maps.find((mapItem) => mapItem.id === targetMarker?.mapId);
      if (!targetMarker || !targetMap) throw new Error("map-marker-not-found");
      const prepared = await prepareMapImage(file);
      let iconUrl = "";
      let importedAsset: WorldAsset | null = null;

      if (window.worldcraftStore?.storeMapImage) {
        const result = await window.worldcraftStore.storeMapImage({
          bytes: await prepared.blob.arrayBuffer(),
          mimeType: prepared.mimeType,
          name: prepared.name,
          originalName: file.name
        });
        const storedAsset = result.assets?.[0];
        if (!result.ok || !storedAsset) {
          throw new Error(result.error || "asset-store-failed");
        }
        iconUrl = getAssetUrl(storedAsset.storedName);
        importedAsset = {
          ...storedAsset,
          worldId: targetMap.worldId,
          kind: "map",
          tags: ["地图标记图标"],
          notes: `用于地图标记“${targetMarker.label}”`,
          linkedEntityIds: targetMarker.entityId ? [targetMarker.entityId] : [],
          updatedAt: storedAsset.createdAt
        };
      } else {
        iconUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error("read-failed"));
          reader.onload = () => typeof reader.result === "string"
            ? resolve(reader.result)
            : reject(new Error("read-failed"));
          reader.readAsDataURL(prepared.blob);
        });
      }

      commitMapMutation("更换标记图标", (previous) => ({
        ...previous,
        assets: importedAsset && !previous.assets.some((asset) => asset.storedName === importedAsset.storedName)
          ? [...previous.assets, importedAsset]
          : previous.assets,
        mapMarkers: previous.mapMarkers.map((marker) => marker.id === markerId
          ? normalizeMapMarker({
              ...marker,
              iconUrl,
              updatedAt: new Date().toISOString()
            }, marker.mapId)
          : marker)
      }));
      setSaveStatus(`已将“${file.name}”设为标记图标`);
    } catch (error) {
      console.error(error);
      setSaveStatus("标记图标导入失败：图片无法读取或格式已损坏");
    }
  }

  function addWorldMap(parentMapId = "", entryMarkerId = "") {
    if (!activeWorld) return;
    const parentMap = worldMaps.find((mapItem) => mapItem.id === parentMapId);
    const entryMarker = allWorldMarkers.find(
      (marker) => marker.id === entryMarkerId && marker.mapId === parentMap?.id
    );
    const mapItem = {
      ...createWorldMap(
        activeWorld.id,
        worldMaps.length + 1,
        entryMarker ? `${entryMarker.label}详图` : parentMap ? `${parentMap.title}子地图` : ""
      ),
      parentMapId: parentMap?.id ?? "",
      entryMarkerId: entryMarker?.id ?? ""
    };
    const mapLayer = createDefaultMapLayer(activeWorld.id, mapItem.id);
    commitMapMutation(parentMap ? "新建子地图" : "新建地图", (previous) => ({
      ...previous,
      maps: [...previous.maps, mapItem],
      mapLayers: [...previous.mapLayers, mapLayer]
    }));
    setSelectedMapId(mapItem.id);
    setSelectedMapMarkerId("");
    setSelectedMapRouteId("");
    setActiveTab("map");
  }

  function addMapLayer(mapId: string) {
    if (!activeWorld) return "";
    const count = dataRef.current.mapLayers.filter((layer) => layer.mapId === mapId).length;
    const layer = createMapLayer(activeWorld.id, mapId, count);
    commitMapMutation("新建图层", (previous) => ({
      ...previous,
      mapLayers: [...previous.mapLayers, layer]
    }));
    return layer.id;
  }

  function duplicateMapLayer(layerId: string) {
    const source = dataRef.current.mapLayers.find((layer) => layer.id === layerId);
    if (!source) return "";
    const siblings = dataRef.current.mapLayers.filter((layer) => layer.mapId === source.mapId);
    const titleRoot = `${source.title} 副本`;
    let title = titleRoot;
    let suffix = 2;
    while (siblings.some((layer) => layer.title === title)) {
      title = `${titleRoot} ${suffix}`;
      suffix += 1;
    }
    const timestamp = new Date().toISOString();
    const created = createMapLayer(source.worldId, source.mapId, siblings.length, timestamp);
    const duplicate = normalizeMapLayer({
      ...source,
      id: created.id,
      title,
      order: Math.max(...siblings.map((layer) => layer.order), -1) + 1,
      createdAt: timestamp,
      updatedAt: timestamp
    }, source.worldId, source.mapId, siblings.length);
    commitMapMutation("复制图层", (previous) => ({
      ...previous,
      mapLayers: [...previous.mapLayers, duplicate]
    }));
    return duplicate.id;
  }

  function reorderMapLayers(mapId: string, orderedLayerIds: string[]) {
    const siblings = dataRef.current.mapLayers.filter((layer) => layer.mapId === mapId);
    const uniqueIds = [...new Set(orderedLayerIds)];
    if (
      uniqueIds.length !== siblings.length
      || siblings.some((layer) => !uniqueIds.includes(layer.id))
    ) {
      return;
    }
    const orderById = new globalThis.Map(uniqueIds.map((id, index) => [id, index]));
    const timestamp = new Date().toISOString();
    commitMapMutation("调整图层顺序", (previous) => ({
      ...previous,
      mapLayers: previous.mapLayers.map((layer) => {
        const order = orderById.get(layer.id);
        if (layer.mapId !== mapId || order === undefined || layer.order === order) return layer;
        return { ...layer, order, updatedAt: timestamp };
      })
    }), `map-layers:${mapId}:order`);
  }

  async function mergeMapLayers(sourceLayerId: string, targetLayerId: string) {
    const current = dataRef.current;
    const source = current.mapLayers.find((layer) => layer.id === sourceLayerId);
    const target = current.mapLayers.find((layer) => layer.id === targetLayerId);
    if (!source || !target || source.mapId !== target.mapId || source.id === target.id) {
      setSaveStatus("图层合并失败：找不到相邻的目标图层");
      return false;
    }
    const mapItem = current.maps.find((item) => item.id === source.mapId);
    const siblings = current.mapLayers
      .filter((layer) => layer.mapId === source.mapId)
      .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN"));
    const sourceIndex = siblings.findIndex((layer) => layer.id === source.id);
    if (
      !mapItem
      || sourceIndex <= 0
      || siblings[sourceIndex - 1]?.id !== target.id
      || source.id === defaultMapLayerId(source.mapId)
    ) {
      setSaveStatus("图层合并失败：只能将当前图层合并到紧邻的下一层");
      return false;
    }
    if (source.locked || target.locked || !source.visible || !target.visible) {
      setSaveStatus("图层合并失败：请先显示并解锁这两个图层");
      return false;
    }
    const phaseVisibilityDiffers = mapItem.storyPhases.some((phase) =>
      phase.hiddenLayerIds.includes(source.id) !== phase.hiddenLayerIds.includes(target.id)
    );
    if (phaseVisibilityDiffers) {
      setSaveStatus("图层合并失败：两个图层在剧情阶段中的显隐状态不同");
      return false;
    }

    setSaveStatus(`正在将“${source.title}”向下合并到“${target.title}”`);
    try {
      let imageUrl = target.imageUrl;
      let imageTransform = target.imageTransform;
      let imageOpacity = target.imageOpacity;
      let imageBlendMode = target.imageBlendMode;
      let importedAsset: WorldAsset | null = null;
      let renderedSize = "";

      if (source.imageUrl && target.imageUrl) {
        const rendered = await renderMergedMapLayerImage(mapItem, [target, source]);
        if (!rendered) throw new Error("merged-image-empty");
        renderedSize = ` · ${rendered.width} × ${rendered.height}`;
        const mergedName = `${target.title}-${source.title}-merged.webp`;
        if (window.worldcraftStore?.storeMapImage) {
          const result = await window.worldcraftStore.storeMapImage({
            bytes: await rendered.blob.arrayBuffer(),
            mimeType: "image/webp",
            name: mergedName,
            originalName: mergedName
          });
          const storedAsset = result.assets?.[0];
          if (!result.ok || !storedAsset) {
            throw new Error(result.error || "asset-store-failed");
          }
          imageUrl = getAssetUrl(storedAsset.storedName);
          importedAsset = {
            ...storedAsset,
            worldId: target.worldId,
            kind: "map",
            tags: ["地图图片图层", "图层合并"],
            notes: `由“${source.title}”向下合并至“${target.title}”`,
            linkedEntityIds: [],
            updatedAt: storedAsset.createdAt
          };
        } else {
          imageUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("merged-image-read-failed"));
            reader.onload = () => typeof reader.result === "string"
              ? resolve(reader.result)
              : reject(new Error("merged-image-read-failed"));
            reader.readAsDataURL(rendered.blob);
          });
        }
        imageTransform = createMapImageTransform();
        imageOpacity = 1;
        imageBlendMode = "normal";
      } else if (source.imageUrl) {
        imageUrl = source.imageUrl;
        imageTransform = source.imageTransform;
        imageOpacity = source.imageOpacity;
        imageBlendMode = source.imageBlendMode;
      }

      const timestamp = new Date().toISOString();
      const changed = commitMapMutation("向下合并图层", (previous) => {
        if (
          !previous.mapLayers.some((layer) => layer.id === source.id)
          || !previous.mapLayers.some((layer) => layer.id === target.id)
        ) {
          return previous;
        }
        const remainingSiblings = previous.mapLayers
          .filter((layer) => layer.mapId === source.mapId && layer.id !== source.id)
          .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN"));
        const orderById = new globalThis.Map(
          remainingSiblings.map((layer, index) => [layer.id, index])
        );
        return {
          ...previous,
          assets: importedAsset && !previous.assets.some((asset) => asset.storedName === importedAsset.storedName)
            ? [...previous.assets, importedAsset]
            : previous.assets,
          maps: previous.maps.map((item) => item.id === source.mapId
            ? {
                ...item,
                storyPhases: item.storyPhases.map((phase) => ({
                  ...phase,
                  hiddenLayerIds: phase.hiddenLayerIds.filter((id) => id !== source.id)
                })),
                updatedAt: timestamp
              }
            : item),
          mapLayers: previous.mapLayers
            .filter((layer) => layer.id !== source.id)
            .map((layer, index) => {
              if (layer.mapId !== source.mapId) return layer;
              const order = orderById.get(layer.id) ?? layer.order;
              return normalizeMapLayer({
                ...layer,
                ...(layer.id === target.id
                  ? { imageBlendMode, imageOpacity, imageTransform, imageUrl }
                  : {}),
                order,
                updatedAt: timestamp
              }, layer.worldId, layer.mapId, index);
            }),
          mapMarkers: previous.mapMarkers.map((marker) => marker.layerId === source.id
            ? { ...marker, layerId: target.id, updatedAt: timestamp }
            : marker)
        };
      });
      if (!changed) throw new Error("merge-state-changed");
      setSaveStatus(`已将“${source.title}”合并到“${target.title}”${renderedSize} · 可撤销`);
      return true;
    } catch (error) {
      console.error(error);
      const detail = error instanceof Error ? error.message : "未知错误";
      const userDetail = /fetch|image request|decode|read/i.test(detail)
        ? "本地图层图片无法读取"
        : /encode|encoding/i.test(detail)
          ? "合并图片无法编码"
          : /store|24 mb|write/i.test(detail)
            ? "合并图片无法写入本地资源库"
            : detail === "merge-state-changed"
              ? "图层状态已经变化，请重试"
              : "请稍后重试并检查本地资源库";
      setSaveStatus(`图层合并失败：${userDetail}`);
      return false;
    }
  }

  function updateMapLayer(layerId: string, patch: Partial<MapLayer>) {
    const fields = Object.keys(patch).sort();
    const label = fields.includes("imageTransform")
      ? "调整图层图片"
      : fields.includes("imageUrl")
        ? "更换图层图片"
        : fields.includes("imageOpacity") || fields.includes("imageBlendMode")
          ? "调整图层图片效果"
          : "编辑图层";
    commitMapMutation(label, (previous) => ({
      ...previous,
      mapLayers: previous.mapLayers.map((layer, index) =>
        layer.id === layerId
          ? normalizeMapLayer(
              { ...layer, ...patch, updatedAt: new Date().toISOString() },
              layer.worldId,
              layer.mapId,
              index
            )
          : layer
      )
    }), fields.includes("imageUrl") ? "" : `map-layer:${layerId}:${fields.join(",")}`);
  }

  function updateMapLayers(
    updates: Array<{ layerId: string; patch: Partial<MapLayer> }>
  ) {
    if (!updates.length) return;
    const updatesById = new globalThis.Map(
      updates.map((update) => [update.layerId, update.patch])
    );
    const allFields = [...new Set(
      updates.flatMap((update) => Object.keys(update.patch))
    )].sort();
    const label = allFields.every((field) => field === "imageTransform")
      ? updates.length > 1
        ? `变换 ${updates.length} 个图片图层`
        : "调整图层图片"
      : updates.length > 1
        ? `编辑 ${updates.length} 个图层`
        : "编辑图层";
    const mergeKey = updates
      .map((update) => `${update.layerId}:${Object.keys(update.patch).sort().join(",")}`)
      .sort()
      .join("|");
    const timestamp = new Date().toISOString();
    commitMapMutation(label, (previous) => ({
      ...previous,
      mapLayers: previous.mapLayers.map((layer, index) => {
        const patch = updatesById.get(layer.id);
        return patch
          ? normalizeMapLayer(
              { ...layer, ...patch, updatedAt: timestamp },
              layer.worldId,
              layer.mapId,
              index
            )
          : layer;
      })
    }), `map-layers:${mergeKey}`);
  }

  async function deleteMapLayer(layerId: string) {
    const layer = data.mapLayers.find((item) => item.id === layerId);
    if (!layer || layer.id === defaultMapLayerId(layer.mapId)) return;
    const fallback = data.mapLayers.find(
      (item) => item.mapId === layer.mapId && item.id !== layer.id
    );
    if (!fallback || !window.confirm(`删除图层“${layer.title}”？其中标记会移到“${fallback.title}”。`)) {
      return;
    }
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-map-layer-delete");
    }
    commitMapMutation("删除图层", (previous) => ({
      ...previous,
      maps: previous.maps.map((mapItem) => mapItem.id === layer.mapId
        ? {
            ...mapItem,
            storyPhases: mapItem.storyPhases.map((phase) => ({
              ...phase,
              hiddenLayerIds: phase.hiddenLayerIds.filter((id) => id !== layer.id)
            }))
          }
        : mapItem),
      mapLayers: previous.mapLayers.filter((item) => item.id !== layer.id),
      mapMarkers: previous.mapMarkers.map((marker) =>
        marker.layerId === layer.id
          ? { ...marker, layerId: fallback.id, updatedAt: new Date().toISOString() }
          : marker
      )
    }));
    setSaveStatus(`图层已删除，标记已移到“${fallback.title}”`);
  }

  function addMapMarkerGroup(mapId: string) {
    if (!activeWorld) return "";
    const count = worldMapMarkerGroups.filter((group) => group.mapId === mapId).length;
    const group = createMapMarkerGroup(activeWorld.id, mapId, count + 1);
    commitMapMutation("新建标记组", (previous) => ({
      ...previous,
      mapMarkerGroups: [...previous.mapMarkerGroups, group]
    }));
    return group.id;
  }

  function updateMapMarkerGroup(groupId: string, patch: Partial<MapMarkerGroup>) {
    commitMapMutation("编辑标记组", (previous) => ({
      ...previous,
      mapMarkerGroups: previous.mapMarkerGroups.map((group, index) =>
        group.id === groupId
          ? normalizeMapMarkerGroup(
              { ...group, ...patch, updatedAt: new Date().toISOString() },
              group.worldId,
              group.mapId,
              index + 1
            )
          : group
      )
    }), `map-marker-group:${groupId}:${Object.keys(patch).sort().join(",")}`);
  }

  async function deleteMapMarkerGroup(groupId: string) {
    const group = data.mapMarkerGroups.find((item) => item.id === groupId);
    if (!group || !window.confirm(`删除标记组“${group.title}”？标记会保留并变为未分组。`)) {
      return;
    }
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-map-marker-group-delete");
    }
    commitMapMutation("删除标记组", (previous) => ({
      ...previous,
      maps: previous.maps.map((mapItem) => mapItem.id === group.mapId
        ? {
            ...mapItem,
            storyPhases: mapItem.storyPhases.map((phase) => ({
              ...phase,
              hiddenGroupIds: phase.hiddenGroupIds.filter((id) => id !== group.id)
            }))
          }
        : mapItem),
      mapMarkerGroups: previous.mapMarkerGroups.filter((item) => item.id !== group.id),
      mapMarkers: previous.mapMarkers.map((marker) =>
        marker.groupId === group.id
          ? { ...marker, groupId: "", updatedAt: new Date().toISOString() }
          : marker
      )
    }));
    setSaveStatus("标记组已删除，原标记已变为未分组");
  }

  async function loadWorldMapVersions(mapId: string): Promise<MapVersionLoadResult> {
    const currentMap = dataRef.current.maps.find((mapItem) => mapItem.id === mapId);
    if (!currentMap) {
      return { ok: false, versions: [], error: "找不到要读取版本的地图" };
    }
    if (!window.worldcraftStore?.listObjectVersions) {
      return {
        ok: false,
        versions: [],
        error: "地图版本对比仅在桌面数据库中可用"
      };
    }
    const result = await window.worldcraftStore.listObjectVersions("maps", mapId);
    if (!result.ok) {
      return { ok: false, versions: [], error: result.error ?? "地图版本读取失败" };
    }
    const versions = result.versions.map((version, index): MapVersionSnapshot => {
      const historicalMap = normalizeWorldMap({
        ...(version.item as unknown as Partial<WorldMap>),
        id: mapId,
        worldId: currentMap.worldId
      }, currentMap.worldId, index + 1);
      return {
        createdAt: version.createdAt,
        id: version.id,
        label: version.label || historicalMap.title,
        map: historicalMap,
        reason: version.reason
      };
    });
    return { ok: true, versions };
  }

  async function restoreWorldMapVersion(
    version: MapVersionSnapshot
  ): Promise<MapVersionRestoreResult> {
    const currentMap = dataRef.current.maps.find((mapItem) => mapItem.id === version.map.id);
    if (!currentMap) return { ok: false, error: "当前地图已不存在" };
    if (!window.confirm(
      `恢复地图“${currentMap.title}”到 ${formatDateLabel(version.createdAt)} 的版本？当前项目会先备份。`
    )) {
      return { ok: false, canceled: true };
    }
    try {
      if (window.worldcraftStore) {
        await window.worldcraftStore.saveWorkspace(dataRef.current, "before-map-version-restore");
        await window.worldcraftStore.createBackup(dataRef.current, "before-map-version-restore");
      }
      const restoredAt = new Date().toISOString();
      commitMapMutation("恢复地图历史版本", (previous) => ({
        ...previous,
        maps: normalizeMapHierarchy(previous.maps.map((mapItem, index) =>
          mapItem.id === currentMap.id
            ? normalizeWorldMap({
                ...version.map,
                id: currentMap.id,
                worldId: currentMap.worldId,
                updatedAt: restoredAt
              }, currentMap.worldId, index + 1)
            : mapItem
        ))
      }));
      setSaveStatus(`已恢复地图版本：${formatDateLabel(version.createdAt)}`);
      return { ok: true };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "地图版本恢复失败"
      };
    }
  }

  function selectWorldMap(mapId: string) {
    setSelectedMapId(mapId);
    setSelectedMapMarkerId("");
    setSelectedMapRouteId("");
  }

  function updateWorldMap(mapId: string, patch: Partial<WorldMap>) {
    const fields = Object.keys(patch).sort();
    const currentMap = dataRef.current.maps.find((mapItem) => mapItem.id === mapId);
    const descriptor = patch.regions
      ? describeMapRegionHistory(currentMap, patch.regions)
      : patch.storyPhases
        ? describeMapStoryPhaseHistory(currentMap, patch.storyPhases)
      : patch.imageTransform && currentMap
        ? {
            label: "调整地图底图",
            mergeKey: `map:${mapId}:imageTransform:${changedObjectKeys(currentMap.imageTransform, patch.imageTransform).join(",")}`
          }
        : patch.grid && currentMap
          ? {
              label: "调整坐标网格",
              mergeKey: `map:${mapId}:grid:${changedObjectKeys(currentMap.grid, patch.grid).join(",")}`
            }
          : fields.includes("imageUrl")
            ? { label: "更换地图底图", mergeKey: "" }
            : fields.includes("parentMapId") || fields.includes("entryMarkerId")
              ? { label: "调整地图层级", mergeKey: "" }
            : { label: "编辑地图", mergeKey: `map:${mapId}:${fields.join(",")}` };
    commitMapMutation(descriptor.label, (previous) => {
      const maps = normalizeMapHierarchy(previous.maps.map((mapItem, index) =>
        mapItem.id === mapId
          ? normalizeWorldMap(
              { ...mapItem, ...patch, updatedAt: new Date().toISOString() },
              mapItem.worldId,
              index + 1
            )
          : mapItem
      ));
      const markerById = new globalThis.Map(previous.mapMarkers.map((marker) => [marker.id, marker]));
      return {
        ...previous,
        maps: maps.map((mapItem) => {
          const entryMarker = markerById.get(mapItem.entryMarkerId);
          return entryMarker?.mapId === mapItem.parentMapId
            ? mapItem
            : { ...mapItem, entryMarkerId: "" };
        })
      };
    }, descriptor.mergeKey);
  }

  async function deleteWorldMap(mapId: string) {
    const deletedMap = worldMaps.find((item) => item.id === mapId);
    if (!deletedMap || worldMaps.length <= 1) return;
    const childCount = worldMaps.filter((item) => item.parentMapId === mapId).length;
    const childNotice = childCount
      ? `\n${childCount} 张直接子地图会移到当前地图的上一级，不会被删除。`
      : "";
    if (!window.confirm(`删除这张地图及其标记和路线？${childNotice}`)) return;
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-map-delete");
      await window.worldcraftStore.createBackup(data);
    }
    const remaining = worldMaps.filter((mapItem) => mapItem.id !== mapId);
    commitMapMutation("删除地图", (previous) => ({
      ...previous,
      maps: normalizeMapHierarchy(previous.maps
        .filter((mapItem) => mapItem.id !== mapId)
        .map((mapItem) => mapItem.parentMapId === mapId
          ? { ...mapItem, parentMapId: deletedMap.parentMapId, entryMarkerId: "" }
          : mapItem)),
      mapLayers: previous.mapLayers.filter((layer) => layer.mapId !== mapId),
      mapMarkerGroups: previous.mapMarkerGroups.filter((group) => group.mapId !== mapId),
      mapMarkers: previous.mapMarkers.filter((marker) => marker.mapId !== mapId),
      mapRoutes: previous.mapRoutes.filter((route) => route.mapId !== mapId)
    }));
    setSelectedMapId(remaining.find((item) => item.id === deletedMap.parentMapId)?.id ?? remaining[0]?.id ?? "");
    setSelectedMapMarkerId("");
    setSelectedMapRouteId("");
    setSaveStatus("地图、标记与路线已删除，删除前备份已创建");
  }

  function addMapMarker(mapId: string, x: number, y: number, preferredLayerId?: string) {
    const layerId = data.mapLayers.some(
      (layer) => layer.mapId === mapId && layer.id === preferredLayerId
    )
      ? preferredLayerId
      : data.mapLayers.find((layer) => layer.mapId === mapId)?.id;
    const marker = createMapMarker(
      mapId,
      x,
      y,
      worldMarkers.length + 1,
      layerId || defaultMapLayerId(mapId)
    );
    commitMapMutation("新建地图标记", (previous) => ({
      ...previous,
      mapMarkers: [...previous.mapMarkers, marker]
    }));
    setSelectedMapMarkerId(marker.id);
    setSelectedMapRouteId("");
    return marker.id;
  }

  function selectMapMarker(markerId: string) {
    setSelectedMapMarkerId(markerId);
    setSelectedMapRouteId("");
  }

  function updateMapMarker(markerId: string, patch: Partial<MapMarker>) {
    const fields = Object.keys(patch).sort();
    const label = fields.every((field) => field === "x" || field === "y")
      ? "移动地图标记"
      : "编辑地图标记";
    commitMapMutation(label, (previous) => ({
      ...previous,
      mapMarkers: previous.mapMarkers.map((marker) =>
        marker.id === markerId
          ? normalizeMapMarker({ ...marker, ...patch, updatedAt: new Date().toISOString() })
          : marker
      )
    }), `map-marker:${markerId}:${fields.join(",")}`);
  }

  function updateMapMarkers(
    updates: Array<{ markerId: string; patch: Partial<MapMarker> }>
  ) {
    if (!updates.length) return;
    const updatesById = new globalThis.Map(
      updates.map((update) => [update.markerId, update.patch])
    );
    const mergeKey = updates
      .map((update) => `${update.markerId}:${Object.keys(update.patch).sort().join(",")}`)
      .sort()
      .join("|");
    commitMapMutation(
      updates.length > 1 ? `移动 ${updates.length} 个地图标记` : "移动地图标记",
      (previous) => ({
      ...previous,
      mapMarkers: previous.mapMarkers.map((marker) => {
        const patch = updatesById.get(marker.id);
        return patch
          ? normalizeMapMarker({ ...marker, ...patch, updatedAt: new Date().toISOString() })
          : marker;
      })
      }),
      `map-markers:${mergeKey}`
    );
  }

  async function deleteMapMarker(markerId: string) {
    const deletedMarker = dataRef.current.mapMarkers.find((marker) => marker.id === markerId);
    if (!deletedMarker) return;
    if (!window.confirm("删除这个地图标记？相关路线中的停靠点也会移除。")) return;
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-map-marker-delete");
    }
    commitMapMutation("删除地图标记", (previous) => ({
      ...previous,
      maps: previous.maps.map((mapItem) => {
        const clearsEntry = mapItem.entryMarkerId === markerId;
        const ownsPhaseState = mapItem.id === deletedMarker.mapId;
        if (!clearsEntry && !ownsPhaseState) return mapItem;
        return {
          ...mapItem,
          ...(clearsEntry ? { entryMarkerId: "" } : {}),
          storyPhases: ownsPhaseState
            ? mapItem.storyPhases.map((phase) => ({
                ...phase,
                hiddenMarkerIds: phase.hiddenMarkerIds.filter((id) => id !== markerId)
              }))
            : mapItem.storyPhases,
          updatedAt: new Date().toISOString()
        };
      }),
      mapMarkers: previous.mapMarkers.filter((marker) => marker.id !== markerId),
      mapRoutes: previous.mapRoutes.map((route) => {
        const stops = route.stops.filter((stop) => stop.markerId !== markerId);
        const validAfterStopIds = new Set(stops.slice(0, -1).map((stop) => stop.id));
        return {
          ...route,
          stops,
          waypoints: route.waypoints.filter((waypoint) => validAfterStopIds.has(waypoint.afterStopId)),
          updatedAt: new Date().toISOString()
        };
      })
    }));
    setSelectedMapMarkerId("");
    setSaveStatus("地图标记已删除，路线停靠点与子地图入口已同步更新");
  }

  function addMapRoute(mapId: string) {
    if (!activeWorld) return "";
    const route = createMapRoute(activeWorld.id, mapId, worldMapRoutes.length + 1);
    commitMapMutation("新建地图路线", (previous) => ({
      ...previous,
      mapRoutes: [...previous.mapRoutes, route]
    }));
    setSelectedMapRouteId(route.id);
    setSelectedMapMarkerId("");
    return route.id;
  }

  function selectMapRoute(routeId: string) {
    setSelectedMapRouteId(routeId);
    setSelectedMapMarkerId("");
  }

  function updateMapRoute(routeId: string, patch: Partial<MapRoute>) {
    const fields = Object.keys(patch).sort();
    const operationLabel = fields.includes("stops")
      ? "编辑路线停靠点"
      : fields.includes("waypoints")
        ? "编辑路线控制点"
        : "编辑地图路线";
    commitMapMutation(operationLabel, (previous) => ({
      ...previous,
      mapRoutes: previous.mapRoutes.map((route, index) =>
        route.id === routeId
          ? normalizeMapRoute(
              { ...route, ...patch, updatedAt: new Date().toISOString() },
              route.worldId,
              route.mapId,
              index + 1
            )
          : route
      )
    }), fields.includes("stops") || fields.includes("waypoints") ? "" : `map-route:${routeId}:${fields.join(",")}`);
  }

  async function deleteMapRoute(routeId: string) {
    const deletedRoute = dataRef.current.mapRoutes.find((route) => route.id === routeId);
    if (!deletedRoute) return;
    if (!window.confirm("删除这条地图路线？")) return;
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-map-route-delete");
    }
    commitMapMutation("删除地图路线", (previous) => ({
      ...previous,
      maps: previous.maps.map((mapItem) => mapItem.id === deletedRoute.mapId
        ? {
            ...mapItem,
            storyPhases: mapItem.storyPhases.map((phase) => ({
              ...phase,
              hiddenRouteIds: phase.hiddenRouteIds.filter((id) => id !== routeId)
            }))
          }
        : mapItem),
      mapRoutes: previous.mapRoutes.filter((route) => route.id !== routeId)
    }));
    setSelectedMapRouteId("");
    setSaveStatus("地图路线已删除");
  }

  function addTimelineTrack() {
    if (!activeWorld) return;
    const track = createTimelineTrack(activeWorld.id, worldTimelineTracks.length + 1);
    setData((previous) => ({
      ...previous,
      timelineTracks: [...previous.timelineTracks, track]
    }));
    setSelectedTimelineTrackId(track.id);
    setSelectedTimelineEventId("");
    setActiveTab("timeline");
  }

  function selectTimelineTrack(trackId: string) {
    setSelectedTimelineTrackId(trackId);
    setSelectedTimelineEventId("");
  }

  function updateTimelineTrack(trackId: string, patch: Partial<TimelineTrack>) {
    setData((previous) => ({
      ...previous,
      timelineTracks: previous.timelineTracks.map((track, index) =>
        track.id === trackId
          ? normalizeTimelineTrack(
              { ...track, ...patch, updatedAt: new Date().toISOString() },
              track.worldId,
              index
            )
          : track
      )
    }));
  }

  async function deleteTimelineTrack(trackId: string) {
    if (worldTimelineTracks.length <= 1 || !window.confirm("删除这条时间轨道？轨道内时间点会移到其他时间轨道。")) return;
    const fallback = worldTimelineTracks.find((track) => track.id !== trackId);
    if (!fallback) return;
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-timeline-track-delete");
      await window.worldcraftStore.createBackup(data);
    }
    setData((previous) => ({
      ...previous,
      timelineTracks: previous.timelineTracks.filter((track) => track.id !== trackId),
      timelineEvents: previous.timelineEvents.map((timelineEvent) =>
        timelineEvent.trackId === trackId
          ? { ...timelineEvent, trackId: fallback.id, updatedAt: new Date().toISOString() }
          : timelineEvent
      )
    }));
    setSelectedTimelineTrackId(fallback.id);
    setSelectedTimelineEventId("");
    setSaveStatus("时间轨道已删除，原时间点已移入其他时间轨道");
  }

  function addTimelineEvent(trackId: string) {
    if (!activeWorld) return;
    const lastSortOrder = worldTimelineEvents.at(-1)?.sortOrder ?? Date.now();
    const timelineEvent = createTimelineEvent(
      activeWorld.id,
      trackId,
      worldTimelineEvents.length + 1,
      lastSortOrder + 1
    );
    setData((previous) => ({
      ...previous,
      timelineEvents: [...previous.timelineEvents, timelineEvent]
    }));
    setSelectedTimelineTrackId(trackId);
    setSelectedTimelineEventId(timelineEvent.id);
    setActiveTab("timeline");
  }

  async function deleteTimelineEvent(eventId: string) {
    if (!window.confirm("删除这个时间点？")) return;
    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(data, "before-timeline-event-delete");
    }
    setData((previous) => ({
      ...previous,
      timelineEvents: previous.timelineEvents
        .filter((timelineEvent) => timelineEvent.id !== eventId)
        .map((timelineEvent) => ({
          ...timelineEvent,
          dependencyIds: timelineEvent.dependencyIds.filter((id) => id !== eventId)
        }))
    }));
    setSelectedTimelineEventId("");
    setSaveStatus("时间点已删除，相关前置依赖已清理");
  }

  function openMapMarker(markerId: string) {
    const marker = data.mapMarkers.find((item) => item.id === markerId);
    if (!marker) return;
    setSelectedMapId(marker.mapId);
    setSelectedMapMarkerId(marker.id);
    setSelectedMapRouteId("");
    setActiveTab("map");
  }

  function openTimelineEvent(eventId: string) {
    const timelineEvent = data.timelineEvents.find((item) => item.id === eventId);
    if (!timelineEvent) return;
    setSelectedTimelineTrackId(timelineEvent.trackId);
    setSelectedTimelineEventId(timelineEvent.id);
    setActiveTab("timeline");
  }

  async function saveProjectFile() {
    if (!window.worldcraftStore) {
      downloadTextFile(
        `${slugify(activeWorld?.name || "worldcraft-codex")}-project.wcodex.json`,
        JSON.stringify(data, null, 2),
        "application/json;charset=utf-8"
      );
      return;
    }

    const result = await window.worldcraftStore.saveProjectAs(data);
    if (!result.ok) {
      if (result.error) setSaveStatus(`工程包保存失败：${result.error}`);
      return;
    }
    if (result.assetUpdates?.length) {
      const updates = new globalThis.Map(
        result.assetUpdates.map((asset) => [asset.id, asset] as const)
      );
      setData((previous) => ({
        ...previous,
        assets: previous.assets.map((asset) => {
          const update = updates.get(asset.id);
          return update ? { ...asset, ...update } : asset;
        })
      }));
    }
    setStoreInfo((previous) => ({
      dbPath: previous?.dbPath ?? result.dbPath ?? "",
      backupDir: previous?.backupDir ?? result.backupDir ?? "",
      updatedAt: previous?.updatedAt ?? null,
      lastProjectPath: result.filePath
    }));
    const missingCount = result.packageSummary?.missingAssetCount ?? 0;
    setSaveStatus(
      missingCount
        ? `工程包已保存，但有 ${missingCount} 个缺失资源未能打包：${result.filePath}`
        : `完整工程包已保存：${result.filePath}`
    );
  }

  async function openProjectFile() {
    if (!window.worldcraftStore) {
      return;
    }

    suspendAutosaveForExternalLoad();
    const flushed = await window.worldcraftStore.saveWorkspace(data, "before-open-ui");
    if (!flushed.ok) {
      resumeAutosaveAfterExternalLoad();
      setSaveStatus(flushed.error ?? "当前修改尚未安全保存，已取消打开工程");
      return;
    }
    const result = await window.worldcraftStore.openProject();
    if (!result.ok || !result.data) {
      resumeAutosaveAfterExternalLoad();
      if (result.error) setSaveStatus(`项目打开失败：${result.error}`);
      return;
    }

    const nextData = normalizeWorkspaceData(result.data);
    const nextWorldId = nextData.worlds[0]?.id ?? initialData.worlds[0].id;
    setData(nextData);
    setActiveWorldId(nextWorldId);
    setSelectedEntityId(nextData.entities[0]?.id ?? "");
    setSelectedQuestId(nextData.quests[0]?.id ?? "");
    setSelectedRelationId(nextData.relations[0]?.id ?? "");
    setSelectedAssetId(nextData.assets[0]?.id ?? "");
    setSelectedStorySceneId(nextData.storyScenes[0]?.id ?? "");
    setSelectedStoryVariableId(nextData.storyVariables[0]?.id ?? "");
    setSelectedStoryTestPresetId(nextData.storyTestPresets[0]?.id ?? "");
    setSelectedStoryReviewIssueId(nextData.storyReviewIssues[0]?.id ?? "");
    selectPlanningState(nextData, nextWorldId);
    setRelationFocusEntityId(
      nextData.relations[0]?.sourceEntityId ?? nextData.entities[0]?.id ?? ""
    );
    setAssetFileStatus(null);
    setStoreInfo((previous) => ({
      dbPath: previous?.dbPath ?? result.dbPath ?? "",
      backupDir: previous?.backupDir ?? result.backupDir ?? "",
      updatedAt: previous?.updatedAt ?? null,
      lastProjectPath: result.filePath
    }));
    const packageSummary = result.packageSummary;
    setSaveStatus(
      result.format === "package"
        ? packageSummary?.missingAssetCount
          ? `工程包已打开，有 ${packageSummary.missingAssetCount} 个资源在保存时已缺失`
          : `完整工程包已打开：导入 ${packageSummary?.importedFileCount ?? 0} 个文件，复用 ${packageSummary?.reusedFileCount ?? 0} 个文件`
        : `已打开旧版 JSON 项目：${result.filePath}`
    );
    resumeAutosaveAfterExternalLoad();
    await refreshReliabilityData(nextData, nextWorldId);
  }

  async function createManualBackup() {
    if (!window.worldcraftStore) {
      window.localStorage.setItem(storageKey, JSON.stringify(data));
      setSaveStatus("已写入浏览器本地存储");
      return;
    }

    const result = await window.worldcraftStore.createBackup(data);
    if (result.ok) {
      setSaveStatus(`已创建快速数据备份：${result.filePath}`);
      setStoreInfo((previous) => ({
        dbPath: previous?.dbPath ?? "",
        backupDir: result.backupDir ?? previous?.backupDir ?? "",
        updatedAt: previous?.updatedAt ?? null,
        lastProjectPath: previous?.lastProjectPath
      }));
      if (activeTab === "health") {
        await refreshReliabilityData();
      }
    }
  }

  async function createCompleteProjectBackup() {
    if (!window.worldcraftStore) {
      setSaveStatus("完整工程备份仅在桌面版中可用");
      return;
    }
    setSaveStatus("正在校验资源并创建完整工程备份...");
    const result = await window.worldcraftStore.createCompleteBackup(data);
    if (!result.ok) {
      setSaveStatus(`完整工程备份失败：${result.error ?? "无法写入备份目录"}`);
      return;
    }
    if (result.assetUpdates?.length) {
      const updates = new globalThis.Map(
        result.assetUpdates.map((asset) => [asset.id, asset] as const)
      );
      setData((previous) => ({
        ...previous,
        assets: previous.assets.map((asset) => {
          const update = updates.get(asset.id);
          return update ? { ...asset, ...update } : asset;
        })
      }));
    }
    const missingCount = result.packageSummary?.missingAssetCount ?? 0;
    setSaveStatus(
      missingCount
        ? `完整备份已创建，但有 ${missingCount} 个资源原本已缺失`
        : `完整工程备份已创建：${result.filePath}`
    );
    const backupResult = await window.worldcraftStore.listBackups();
    if (backupResult.ok) {
      setBackups(backupResult.backups);
      setBackupStorage(backupResult.storage ?? null);
    }
  }

  async function importLegacyLocalData() {
    const legacy = window.localStorage.getItem(storageKey);
    if (!legacy) {
      setSaveStatus("没有发现旧本地数据");
      return;
    }

    const nextData = normalizeWorkspaceData(JSON.parse(legacy) as Partial<WorkspaceData>);
    const nextWorldId = nextData.worlds[0]?.id ?? initialData.worlds[0].id;
    setData(nextData);
    setActiveWorldId(nextWorldId);
    setSelectedEntityId(nextData.entities[0]?.id ?? "");
    setSelectedQuestId(nextData.quests[0]?.id ?? "");
    setSelectedRelationId(nextData.relations[0]?.id ?? "");
    setSelectedAssetId(nextData.assets[0]?.id ?? "");
    setSelectedStorySceneId(nextData.storyScenes[0]?.id ?? "");
    setSelectedStoryVariableId(nextData.storyVariables[0]?.id ?? "");
    setSelectedStoryTestPresetId(nextData.storyTestPresets[0]?.id ?? "");
    setSelectedStoryReviewIssueId(nextData.storyReviewIssues[0]?.id ?? "");
    selectPlanningState(nextData, nextWorldId);
    setRelationFocusEntityId(
      nextData.relations[0]?.sourceEntityId ?? nextData.entities[0]?.id ?? ""
    );

    if (window.worldcraftStore) {
      await window.worldcraftStore.saveWorkspace(nextData, "manual-legacy-import");
      await window.worldcraftStore.createBackup(nextData);
    }

    setSaveStatus("旧本地数据已导入 SQLite");
  }

  async function importContentFile() {
    if (!window.worldcraftStore) {
      setSaveStatus("文件导入仅在桌面版中可用");
      return;
    }

    const result = await window.worldcraftStore.importFile();
    if (!result.ok || !result.content || !result.format) {
      return;
    }

    try {
      const imported =
        result.format === "json"
          ? workspaceFromJsonImport(result.content)
          : workspaceFromMarkdownImport(result.content, result.fileName);
      const nextData = mergeImportedWorkspace(data, imported);
      const importedWorld = nextData.worlds[data.worlds.length];
      const importedEntity = nextData.entities.find(
        (entity) => entity.worldId === importedWorld?.id
      );
      const importedQuest = nextData.quests.find((quest) => quest.worldId === importedWorld?.id);
      const importedRelation = nextData.relations.find(
        (relation) => relation.worldId === importedWorld?.id
      );
      const importedAsset = nextData.assets.find((asset) => asset.worldId === importedWorld?.id);
      const importedStoryScene = nextData.storyScenes.find(
        (scene) => scene.worldId === importedWorld?.id
      );
      const importedStoryVariable = nextData.storyVariables.find(
        (variable) => variable.worldId === importedWorld?.id
      );
      const importedStoryTestPreset = nextData.storyTestPresets.find(
        (preset) => preset.worldId === importedWorld?.id
      );
      const importedStoryReviewIssue = nextData.storyReviewIssues.find(
        (issue) => issue.worldId === importedWorld?.id
      );
      const importedNarrativeMilestone = nextData.narrativeMilestones.find(
        (milestone) => milestone.worldId === importedWorld?.id
      );

      await window.worldcraftStore.createBackup(data);
      await window.worldcraftStore.saveWorkspace(nextData, "content-file-import");
      setData(nextData);
      if (importedWorld) {
        setActiveWorldId(importedWorld.id);
        setSelectedEntityId(importedEntity?.id ?? "");
        setSelectedQuestId(importedQuest?.id ?? "");
        setSelectedRelationId(importedRelation?.id ?? "");
        setSelectedAssetId(importedAsset?.id ?? "");
        setSelectedStorySceneId(importedStoryScene?.id ?? "");
        setSelectedStoryVariableId(importedStoryVariable?.id ?? "");
        setSelectedStoryTestPresetId(importedStoryTestPreset?.id ?? "");
        setSelectedStoryReviewIssueId(importedStoryReviewIssue?.id ?? "");
        setSelectedNarrativeMilestoneId(importedNarrativeMilestone?.id ?? "");
        selectPlanningState(nextData, importedWorld.id);
        setRelationFocusEntityId(
          importedRelation?.sourceEntityId ?? importedEntity?.id ?? ""
        );
      }
      setSaveStatus(
        `已导入 ${result.fileName ?? "内容文件"}：${imported.entities.length} 个条目，${imported.quests.length} 条任务线，${imported.storyScenes.length} 个剧情场景，${imported.narrativeMilestones.length} 个叙事里程碑，${imported.maps.length} 张地图，${imported.mapRoutes.length} 条路线，${imported.timelineEvents.length} 个时间点，${imported.consistencyFindings.length} 条一致性发现`
      );
    } catch (error) {
      console.error(error);
      setSaveStatus(`导入失败：${error instanceof Error ? error.message : "文件格式无法识别"}`);
    }
  }

  function exportJson() {
    if (!activeWorld) {
      return;
    }

    const payload = buildWorldExport(activeWorld, data);
    downloadTextFile(
      `${slugify(activeWorld.name) || "worldcraft-codex"}.json`,
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8"
    );
  }

  function exportMarkdown() {
    if (!activeWorld) {
      return;
    }

    downloadTextFile(
      `${slugify(activeWorld.name) || "worldcraft-codex"}.md`,
      buildMarkdownExport(activeWorld, data),
      "text/markdown;charset=utf-8"
    );
  }

  function openAuthorWriting(item: AuthorWritingItem) {
    selectManuscriptUnit({
      kind: item.kind === "manuscript-chapter" ? "chapter" : "scene",
      id: item.id
    });
    setStoryWorkspaceMode("manuscript");
    setActiveTab("story");
  }

  function createAuthorChapter() {
    createManuscriptChapter();
    setStoryWorkspaceMode("manuscript");
    setActiveTab("story");
  }

  function openAuthorQueueItem(item: AuthorQueueItem) {
    setSelectedNarrativeMilestoneId(item.id);
    setActiveTab("production");
  }

  function openAuthorIssue(item: AuthorIssueItem) {
    if (item.kind === "review") {
      setSelectedStoryReviewIssueId(item.id);
      setStoryTestWorkspaceMode("issues");
      setActiveTab("testing");
      return;
    }
    if (item.kind === "consistency") {
      setSelectedConsistencyFindingId(item.id);
      setActiveTab("consistency");
      return;
    }
    if (item.targetKind && item.targetId) {
      openAuthorWriting({
        id: item.targetId,
        kind: item.targetKind,
        title: item.title,
        path: item.detail,
        summary: "",
        status: "",
        words: 0,
        targetWords: 0,
        openAnnotations: 0,
        updatedAt: ""
      });
    }
  }

  function openAuthorLoop(_item: AuthorOpenLoopItem) {
    setActiveTab("ai");
  }

  function openAuthorRecentItem(item: AuthorRecentItem) {
    openProjectReference({ kind: item.kind, id: item.id });
  }

  function openRailTool(tab: WorkspaceTab) {
    setActiveTab(tab);
    railMoreRef.current?.removeAttribute("open");
  }

  function revealCodexLibraryForViewport() {
    setCodexLibraryOpen(!window.matchMedia("(max-width: 900px)").matches);
  }

  if (!activeWorld) {
    return null;
  }

  const selectedEntityTimelineEvent = selectedEntity
    ? data.timelineEvents.find((item) => item.entityId === selectedEntity.id)
    : null;
  const selectedTimelineEvent =
    worldTimelineEvents.find((item) => item.id === selectedTimelineEventId) ?? null;
  const inlineAiRuntime: InlineAiRuntime = {
    enabled: activeConsistencyModelSettings.enabled,
    model: activeConsistencyModelSettings.model || "未配置模型",
    getSources: getInlineAiSources,
    memories: worldAiMemoryItems,
    onComplete: completeWithAi,
    onAnalyze: analyzeInlineAiChange,
    onCommit: commitInlineAiChange,
    onOpenSettings: () => setActiveTab("ai"),
    onOpenSource: openInlineAiSource
  };
  const activeAppTheme =
    appThemeOptions.find((theme) => theme.id === appTheme) ?? appThemeOptions[0];

  return (
    <InlineAiProvider runtime={inlineAiRuntime}>
    <ReleaseLifecycle />
    <main
      className={`app-shell ${
        activeTab === "wiki" ||
        (activeTab === "story" && storyWorkspaceMode === "manuscript")
          ? "is-viewport-contained"
          : ""
      }`}
      data-theme={appTheme}
    >
      <aside className="app-rail" aria-label="主导航">
        <button
          aria-label="Worldcraft Codex 作者工作台"
          className="rail-brand"
          title="Worldcraft Codex"
          type="button"
          onClick={() => setActiveTab("author")}
        >
          <BookOpen size={22} />
        </button>

        <button
          aria-label="全局搜索"
          className="rail-search"
          title="全局搜索"
          type="button"
          onClick={() => setGlobalSearchOpen(true)}
        >
          <Search size={19} />
        </button>

        <nav className="tabbar" aria-label="主要工作区">
          <TabButton
            active={activeTab === "author"}
            icon={PenLine}
            label="作者工作台"
            onClick={() => setActiveTab("author")}
          />
          <TabButton
            active={activeTab === "wiki"}
            icon={Globe2}
            label="世界总览"
            onClick={() => setActiveTab("wiki")}
          />
          <TabButton
            active={activeTab === "codex"}
            icon={BookOpen}
            label="知识库"
            onClick={() => setActiveTab("codex")}
          />
          <TabButton
            active={activeTab === "quests"}
            icon={Route}
            label="任务线"
            onClick={() => setActiveTab("quests")}
          />
          <TabButton
            active={activeTab === "story"}
            icon={MessagesSquare}
            label="剧情"
            onClick={() => setActiveTab("story")}
          />
          <TabButton
            active={activeTab === "relations"}
            icon={Network}
            label="关系图谱"
            onClick={() => setActiveTab("relations")}
          />
          <TabButton
            active={activeTab === "map"}
            icon={Map}
            label="地图"
            onClick={() => setActiveTab("map")}
          />
          <TabButton
            active={activeTab === "ai"}
            icon={Sparkles}
            label="AI 工具"
            onClick={() => setActiveTab("ai")}
          />
        </nav>

        <details
          className={`rail-more ${secondaryWorkspaceTabs.has(activeTab) ? "is-active" : ""}`}
          ref={railMoreRef}
        >
          <summary aria-label="更多工具" title="更多工具">
            <Menu size={20} />
          </summary>
          <div className="rail-more-popover">
            <strong>更多工具</strong>
            <span className="rail-more-section-label">叙事规划</span>
            <TabButton
              active={activeTab === "production"}
              icon={Flag}
              label="制作"
              onClick={() => openRailTool("production")}
            />
            <TabButton
              active={activeTab === "templates"}
              icon={Boxes}
              label="模板"
              onClick={() => openRailTool("templates")}
            />
            <TabButton
              active={activeTab === "testing"}
              icon={FlaskConical}
              label="测试"
              onClick={() => openRailTool("testing")}
            />
            <span className="rail-more-section-label">世界工具</span>
            <TabButton
              active={activeTab === "relations"}
              icon={Network}
              label="关系图"
              onClick={() => openRailTool("relations")}
            />
            <TabButton
              active={activeTab === "timeline"}
              icon={CalendarDays}
              label="时间线"
              onClick={() => openRailTool("timeline")}
            />
            <TabButton
              active={activeTab === "assets"}
              icon={Library}
              label="资源库"
              onClick={() => openRailTool("assets")}
            />
            <span className="rail-more-section-label">项目管理</span>
            <TabButton
              active={activeTab === "consistency"}
              icon={ScanSearch}
              label="一致性"
              onClick={() => openRailTool("consistency")}
            />
            <TabButton
              active={activeTab === "health"}
              icon={ShieldCheck}
              label="项目检查"
              onClick={() => openRailTool("health")}
            />
            <TabButton
              active={activeTab === "permissions"}
              icon={Shield}
              label="权限"
              onClick={() => openRailTool("permissions")}
            />
            <TabButton
              active={activeTab === "export"}
              icon={Download}
              label="导出"
              onClick={() => openRailTool("export")}
            />
          </div>
        </details>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="world-heading">
            <span className="eyebrow">当前世界 / {workspaceTabLabels[activeTab]}</span>
            {activeTab === "wiki" ? (
              <strong className="world-title-readonly">{activeWorld.name}</strong>
            ) : (
              <input
                aria-label="世界名称"
                className="world-title-input"
                value={activeWorld.name}
                onChange={(event) => updateWorld({ name: event.target.value })}
              />
            )}
          </div>

          <div className="topbar-actions">
            <div className={`compact-save-status save-${savePhase}`} title={saveError || saveStatus}>
              <HardDrive size={14} />
              <span>{saveStatus}</span>
              {savePhase === "error" ? (
                <button
                  aria-label="重试保存"
                  title={`重试保存${saveError ? `：${saveError}` : ""}`}
                  type="button"
                  onClick={() => setSaveRetryToken((current) => current + 1)}
                >
                  <RefreshCw size={13} />
                </button>
              ) : null}
            </div>
            <button
              aria-label="全局搜索"
              className="topbar-command"
              title="全局搜索"
              type="button"
              onClick={() => setGlobalSearchOpen(true)}
            >
              <Search size={17} />
              <span>搜索</span>
            </button>
            <details className="app-theme-menu">
              <summary
                aria-label="切换界面主题"
                title={`界面主题：${activeAppTheme.label}`}
              >
                <Palette size={17} />
              </summary>
              <div className="app-theme-popover">
                <div className="app-theme-heading">
                  <div>
                    <strong>界面主题</strong>
                    <span>仅改变本机界面，不影响世界内容</span>
                  </div>
                  <Palette size={20} />
                </div>
                <div aria-label="界面主题" className="app-theme-options" role="radiogroup">
                  {appThemeOptions.map((theme) => (
                    <button
                      aria-checked={appTheme === theme.id}
                      className={appTheme === theme.id ? "is-active" : ""}
                      key={theme.id}
                      role="radio"
                      type="button"
                      onClick={(event) => {
                        setAppTheme(theme.id);
                        event.currentTarget.closest("details")?.removeAttribute("open");
                      }}
                    >
                      <span aria-hidden="true" className="app-theme-preview">
                        {theme.colors.map((color) => (
                          <span key={color} style={{ backgroundColor: color }} />
                        ))}
                      </span>
                      <span className="app-theme-copy">
                        <strong>{theme.label}</strong>
                        <small>{theme.description}</small>
                      </span>
                      {appTheme === theme.id ? <Check size={15} /> : null}
                    </button>
                  ))}
                </div>
              </div>
            </details>
            <details className="world-menu">
              <summary aria-label="切换世界" title={`切换世界，当前：${activeWorld.name}`}>
                <Globe2 size={17} />
                <span className="world-menu-current">{activeWorld.name}</span>
                <ChevronDown className="world-menu-chevron" size={14} />
              </summary>
              <div className="world-menu-popover">
                <div className="world-menu-heading">
                  <div>
                    <strong>切换世界</strong>
                    <span>{data.worlds.length} 个世界 · {storeInfo ? "SQLite 本地数据库" : "本地存储模式"}</span>
                  </div>
                  <Globe2 size={20} />
                </div>
                <div aria-label="世界列表" className="world-menu-worlds">
                  {data.worlds.map((world) => (
                    <button
                      aria-label={world.name}
                      aria-pressed={world.id === activeWorld.id}
                      className={world.id === activeWorld.id ? "is-active" : ""}
                      key={world.id}
                      type="button"
                      onClick={() => selectWorld(world.id)}
                    >
                      <Globe2 size={16} />
                      <span className="world-menu-world-copy">
                        <strong>{world.name}</strong>
                        <small>
                          {(worldMenuCounts.get(world.id)?.entities ?? 0).toLocaleString("zh-CN")} 条目
                          {" · "}
                          {worldMenuCounts.get(world.id)?.maps ?? 0} 地图
                          {" · "}
                          {worldMenuCounts.get(world.id)?.chapters ?? 0} 章节
                        </small>
                      </span>
                      {world.id === activeWorld.id ? <Check size={15} /> : null}
                    </button>
                  ))}
                </div>
                <button className="world-menu-create" type="button" onClick={createWorld}>
                  <Plus size={17} />
                  <span>创建世界</span>
                </button>
                <details className="world-menu-settings">
                  <summary>
                    <Settings2 size={16} />
                    <span>当前世界设置</span>
                    <ChevronDown className="world-menu-settings-chevron" size={14} />
                  </summary>
                  <div className="world-menu-settings-body">
                    <label>
                      <span>世界简介</span>
                      <textarea
                        aria-label="世界描述"
                        value={activeWorld.description}
                        onChange={(event) => updateWorld({ description: event.target.value })}
                        rows={4}
                      />
                    </label>
                    <button
                      className="world-menu-wiki-settings"
                      type="button"
                      onClick={(event) => {
                        setActiveTab("wiki");
                        setWikiSettingsOpenToken((current) => current + 1);
                        event.currentTarget.closest("details.world-menu")?.removeAttribute("open");
                      }}
                    >
                      <Globe2 size={16} />
                      <span>Wiki 总览设置</span>
                      <ChevronRight size={14} />
                    </button>
                    <div className="world-menu-stats">
                      <span><strong>{worldEntities.length}</strong> 条目</span>
                      <span><strong>{worldQuests.length}</strong> 任务</span>
                      <span><strong>{worldStoryScenes.length}</strong> 剧情</span>
                      <span><strong>{countLinks(worldEntities)}</strong> 链接</span>
                    </div>
                    <div className="world-menu-management">
                      <button
                        aria-label="复制当前世界"
                        disabled={Boolean(worldOperationBusy)}
                        type="button"
                        onClick={() => void duplicateCurrentWorld()}
                      >
                        <Copy size={15} />
                        <span>{worldOperationBusy === "duplicate" ? "正在复制..." : "复制世界"}</span>
                      </button>
                      <button
                        aria-label="删除当前世界"
                        className="is-danger"
                        disabled={data.worlds.length <= 1 || Boolean(worldOperationBusy)}
                        title={data.worlds.length <= 1 ? "工程必须至少保留一个世界" : "删除当前世界"}
                        type="button"
                        onClick={openWorldDeleteDialog}
                      >
                        <Trash2 size={15} />
                        <span>删除世界</span>
                      </button>
                    </div>
                  </div>
                </details>
              </div>
            </details>
          </div>
        </header>

        {activeTab === "author" && (
          <AuthorWorkspace
            issueItems={authorWorkspaceData.issueItems}
            openLoops={authorWorkspaceData.openLoops}
            queueItems={authorWorkspaceData.queueItems}
            recentItems={authorWorkspaceData.recentItems}
            stats={authorWorkspaceData.stats}
            worldDescription={activeWorld.description}
            worldName={activeWorld.name}
            writingItems={authorWorkspaceData.writingItems}
            onContinueWriting={openAuthorWriting}
            onCreateChapter={createAuthorChapter}
            onCreateEntity={() => createEntity("character")}
            onCreateQuest={createQuest}
            onOpenIssue={openAuthorIssue}
            onOpenLoop={openAuthorLoop}
            onOpenQueueItem={openAuthorQueueItem}
            onOpenRecentItem={openAuthorRecentItem}
            onOpenWiki={() => setActiveTab("wiki")}
          />
        )}

        {activeTab === "wiki" && (
          <WikiWorkspace
            assets={worldAssets}
            categories={worldCodexCategories}
            entities={worldEntities}
            getAssetUrl={getAssetUrl}
            maps={worldMaps}
            markers={allWorldMarkers}
            onOpenEditorReference={openProjectReference}
            onExportOfflineWiki={exportOfflineWiki}
            onReturnToEditor={() => setActiveTab("codex")}
            onUpdateWorld={updateWorld}
            quests={worldQuests}
            referenceIndex={projectReferenceIndex}
            relations={worldRelations}
            settingsOpenToken={wikiSettingsOpenToken}
            templates={worldEntityTemplates}
            timelineEvents={worldTimelineEvents}
            timelineTracks={worldTimelineTracks}
            world={activeWorld}
          />
        )}

        {activeTab === "codex" && (
          <section
            className={`codex-grid ${codexLibraryOpen ? "has-library" : ""} ${codexInspectorOpen ? "has-inspector" : ""}`}
          >
            {codexLibraryOpen ? (
            <div className="panel entity-browser">
              <div className="panel-heading">
                <div>
                  <h2>项目</h2>
                  <p>{filteredEntities.length} 个条目</p>
                </div>
                <div className="panel-heading-actions">
                  <button
                    aria-label="收起条目列表"
                    className="icon-button"
                    title="收起条目列表"
                    type="button"
                    onClick={() => setCodexLibraryOpen(false)}
                  >
                    <PanelLeftClose size={18} />
                  </button>
                </div>
              </div>

              <label className="search-box">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索人物、地点、事件"
                />
              </label>

              <div className="type-filter">
                <button
                  className={activeType === "all" ? "is-active" : ""}
                  type="button"
                  onClick={() => setActiveType("all")}
                >
                  全部
                </button>
                {(Object.keys(entityTypeMeta) as EntityType[]).map((type) => {
                  const Icon = entityTypeMeta[type].icon;
                  return (
                    <button
                      className={activeType === type ? "is-active" : ""}
                      key={type}
                      type="button"
                      onClick={() => setActiveType(type)}
                    >
                      <Icon size={15} />
                      <span>{entityTypeMeta[type].label}</span>
                      <strong>{typeCounts[type]}</strong>
                    </button>
                  );
                })}
              </div>

              <CodexTree
                activeEntityId={selectedEntity?.id ?? ""}
                activeType={activeType}
                categories={worldCodexCategories}
                collapsedCategoryIds={collapsedCategoryIds}
                entities={worldEntities}
                query={deferredEntityQuery}
                questCount={worldQuests.length}
                revealEntityId={selectedEntity?.id ?? ""}
                revealToken={revealEntityToken}
                sceneCount={worldStoryScenes.length}
                onCreateCategory={(parentId) => openCategoryDialog(parentId)}
                onCreateEntity={createEntityInCategory}
                onDeleteCategory={(categoryId) => void deleteCodexCategory(categoryId)}
                onMoveCategory={moveCategoryInTree}
                onMoveEntity={moveEntityInTree}
                onOpenQuests={() => setActiveTab("quests")}
                onOpenStory={() => setActiveTab("story")}
                onRenameCategory={(categoryId) => openCategoryDialog("", categoryId)}
                onSelectEntity={setSelectedEntityId}
                onToggleCategory={toggleCodexCategory}
              />
            </div>
            ) : null}

            <div className="panel editor-panel">
              <div className="codex-editor-contextbar">
                <button
                  aria-label="后退"
                  disabled={codexHistoryIndex <= 0}
                  title="后退"
                  type="button"
                  onClick={() => navigateCodexHistory(-1)}
                >
                  <ArrowLeft size={17} />
                </button>
                <button
                  aria-label="前进"
                  disabled={codexHistoryIndex < 0 || codexHistoryIndex >= codexHistory.length - 1}
                  title="前进"
                  type="button"
                  onClick={() => navigateCodexHistory(1)}
                >
                  <ArrowRight size={17} />
                </button>
                <button
                  aria-label={codexLibraryOpen ? "收起条目列表" : "展开条目列表"}
                  title={codexLibraryOpen ? "收起条目列表" : "展开条目列表"}
                  type="button"
                  onClick={() => setCodexLibraryOpen((current) => !current)}
                >
                  {codexLibraryOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                </button>
                <div className="codex-breadcrumbs">
                  <span>知识库</span>
                  {selectedEntityCategoryPath.map((category) => (
                    <span className="codex-breadcrumb-part" key={category.id}>
                      <ChevronRight size={12} />
                      {category.title}
                    </span>
                  ))}
                  <strong>
                    {selectedEntityCategoryPath.length ? <ChevronRight size={12} /> : null}
                    {selectedEntity?.title ?? "选择一个条目开始编写"}
                  </strong>
                </div>
                <details className="codex-recent-menu">
                  <summary aria-label="最近打开" title="最近打开">
                    <History size={17} />
                  </summary>
                  <div className="codex-recent-popover">
                    <span>最近打开</span>
                    {recentCodexEntities.map((entry) => (
                      <button
                        key={`${entry.worldId}:${entry.entityId}`}
                        type="button"
                        onClick={() => openRecentCodexEntity(entry)}
                      >
                        <FileText size={14} />
                        <span>{entry.entity?.title}</span>
                        <small>{entry.world?.name}</small>
                      </button>
                    ))}
                  </div>
                </details>
                <button
                  aria-label="在项目树中定位"
                  title="在项目树中定位"
                  type="button"
                  onClick={revealSelectedEntityInTree}
                >
                  <LocateFixed size={17} />
                </button>
                <button
                  aria-label={codexInspectorOpen ? "关闭条目检查" : "打开条目检查"}
                  className={codexInspectorOpen ? "is-active" : ""}
                  title={codexInspectorOpen ? "关闭条目检查" : "打开条目检查"}
                  type="button"
                  onClick={() => setCodexInspectorOpen((current) => !current)}
                >
                  {codexInspectorOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                </button>
              </div>
              <div className="entity-editor-canvas">
              {selectedEntity ? (
                <EntityEditor
                  assets={worldAssets}
                  categories={worldCodexCategories}
                  entities={worldEntities}
                  entity={selectedEntity}
                  referenceOptions={projectReferenceOptions}
                  template={selectedEntityTemplate}
                  templates={worldEntityTemplates}
                  timelineEvent={selectedEntityTimelineEvent}
                  worldName={activeWorld.name}
                  locationRequest={referenceLocationRequest}
                  onCategoryChange={(categoryId) =>
                    moveEntityInTree(selectedEntity.id, categoryId)
                  }
                  onCreateEntity={createEntity}
                  onTagsChange={handleTagsChange}
                  onTimelineChange={updateTimelineEvent}
                  onUpdate={updateSelectedEntity}
                  onUpdateTemplate={updateTemplateField}
                />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="还没有条目"
                  actionLabel="创建人物"
                  onAction={() => createEntity("character")}
                />
              )}
              </div>
            </div>

            {codexInspectorOpen ? (
            <div className="inspector-stack">
              <div className="panel">
                <div className="panel-heading compact">
                  <div>
                    <h2>变更影响</h2>
                    <p>直接引用与下游传播</p>
                  </div>
                  <ScanSearch size={20} />
                </div>

                {selectedEntityImpact ? (
                  <div className="change-impact-overview">
                    <div className="change-impact-counts" aria-label="当前条目影响摘要">
                      <span><strong>{selectedEntityImpact.direct}</strong>直接</span>
                      <span><strong>{selectedEntityImpact.downstream}</strong>下游</span>
                      <span className={selectedEntityImpact.levels.critical ? "is-critical" : ""}>
                        <strong>{selectedEntityImpact.levels.critical}</strong>重点
                      </span>
                    </div>
                    <button
                      disabled={!selectedEntityImpact.total}
                      type="button"
                      onClick={() => setImpactDialogOpen(true)}
                    >
                      <GitBranch size={16} />
                      <span>{selectedEntityImpact.total ? "查看影响范围" : "暂无下游影响"}</span>
                    </button>
                  </div>
                ) : null}

                <div className="link-section">
                  <h3>当前提及</h3>
                  {outgoingLinks.length ? (
                    outgoingLinks.map((link) => (
                      <div className="relation-row" key={link.label}>
                        <Link2 size={16} />
                        <span>{link.label}</span>
                        {link.target ? (
                          <button
                            type="button"
                            onClick={() => setSelectedEntityId(link.target?.id ?? "")}
                          >
                            打开
                          </button>
                        ) : (
                          <button type="button" onClick={() => createEntityFromMention(link.label)}>
                            创建
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="muted-text">暂无提及</p>
                  )}
                </div>

                <div className="link-section">
                  <h3>被引用</h3>
                  <BackReferenceList references={backlinks} onOpen={openBackReference} />
                </div>

                <div className="link-section">
                  <h3>显式关系</h3>
                  {selectedEntityRelationRefs.length ? (
                    selectedEntityRelationRefs.map((relation) => {
                      const otherId =
                        relation.sourceEntityId === selectedEntity?.id
                          ? relation.targetEntityId
                          : relation.sourceEntityId;
                      return (
                        <button
                          className="backlink-chip"
                          key={relation.id}
                          type="button"
                          onClick={() => {
                            selectRelation(relation.id);
                            setActiveTab("relations");
                          }}
                        >
                          {relation.label} · {getEntityTitle(worldEntities, otherId)}
                        </button>
                      );
                    })
                  ) : (
                    <p className="muted-text">暂无显式关系</p>
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading compact">
                  <div>
                    <h2>版本历史</h2>
                    <p>从 SQLite 快照恢复</p>
                  </div>
                  <button
                    aria-label="刷新版本历史"
                    className="icon-button"
                    title="刷新版本历史"
                    type="button"
                    onClick={() => void refreshEntityVersions()}
                  >
                    <History size={18} />
                  </button>
                </div>
                <div className="version-list">
                  {versionsLoading ? (
                    <p className="muted-text">正在读取版本...</p>
                  ) : entityVersions.length ? (
                    entityVersions.map((version) => (
                      <div className="version-row" key={version.id}>
                        <div>
                          <strong>{formatDateLabel(version.createdAt)}</strong>
                          <span>{versionReasonLabel(version.reason)}</span>
                        </div>
                        <button type="button" onClick={() => void restoreEntityVersion(version)}>
                          恢复
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="muted-text">编辑后会自动产生版本</p>
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading compact">
                  <div>
                    <h2>AI 辅助</h2>
                    <p>补全与检查</p>
                  </div>
                  <Sparkles size={20} />
                </div>
                <div className="assistant-card">
                  <div>
                    <strong>{missingTemplateFields.length}</strong>
                    <span> 个模板字段待补全</span>
                  </div>
                  <button type="button" onClick={() => setActiveTab("ai")}>
                    <Sparkles size={16} />
                    <span>打开 AI 工具</span>
                  </button>
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading compact">
                  <div>
                    <h2>地图与时间</h2>
                    <p>位置、事件、可见性</p>
                  </div>
                  <KeyRound size={20} />
                </div>
                {selectedEntity ? (
                  <div className="mini-facts">
                    <Fact icon={MapPin} label="地图标记" value={countMarkers(allWorldMarkers, selectedEntity.id)} />
                    <Fact
                      icon={CalendarDays}
                      label="时间线"
                      value={selectedEntityTimelineEvent?.displayDate ?? "未加入"}
                    />
                    <Fact
                      icon={Route}
                      label="任务参与"
                      value={`${selectedEntityQuestRefs.length} 条`}
                    />
                    <Fact
                      icon={Network}
                      label="显式关系"
                      value={`${selectedEntityRelationRefs.length} 条`}
                    />
                    <Fact
                      icon={visibilityMeta[selectedEntity.visibility].icon}
                      label="权限"
                      value={visibilityMeta[selectedEntity.visibility].label}
                    />
                  </div>
                ) : null}
              </div>
            </div>
            ) : null}
          </section>
        )}

        {activeTab === "templates" && (
          <TemplateWorkspace
            entities={worldEntities}
            selectedTemplateId={selectedEntityTemplateId}
            templates={worldEntityTemplates}
            onAddField={addProjectTemplateField}
            onApplyTemplate={applyProjectTemplate}
            onBatchUpdate={batchUpdateProjectEntities}
            onCreateTemplate={createProjectEntityTemplate}
            onDeleteField={deleteProjectTemplateField}
            onDeleteTemplate={deleteProjectEntityTemplate}
            onDuplicateTemplate={duplicateProjectEntityTemplate}
            onMoveField={moveProjectTemplateField}
            onOpenEntity={(entityId) => {
              setSelectedEntityId(entityId);
              setActiveTab("codex");
            }}
            onSelectTemplate={setSelectedEntityTemplateId}
            onUpdateField={updateProjectTemplateField}
            onUpdateTemplate={updateProjectEntityTemplate}
          />
        )}

        {activeTab === "story" && (
          <StoryWorkspace
            assets={worldAssets
              .filter((asset) => ["image", "map", "concept", "video"].includes(asset.kind))
              .map((asset) => ({
                id: asset.id,
                kind: asset.kind,
                mimeType: asset.mimeType,
                name: asset.name,
                storedName: asset.storedName,
                url: getAssetUrl(asset.storedName)
              }))}
            entities={worldEntities.map((entity) => ({
              id: entity.id,
              title: entity.title,
              type: entity.type,
              typeLabel: entityTypeMeta[entity.type].label
            }))}
            manuscriptData={worldManuscriptData}
            mode={storyWorkspaceMode}
            quests={worldQuests.map((quest) => ({ id: quest.id, title: quest.title }))}
            referenceOptions={projectReferenceOptions}
            referenceFocus={referenceLocationRequest}
            scenes={worldStoryScenes}
            selectedManuscriptChapterId={selectedManuscriptChapter?.id ?? ""}
            selectedSceneId={selectedStoryScene?.id ?? ""}
            selectedVariableId={selectedStoryVariable?.id ?? ""}
            tags={Array.from(new Set(worldEntities.flatMap((entity) => entity.tags)))}
            variables={worldStoryVariables}
            worldId={activeWorld.id}
            worldName={activeWorld.name}
            onCreateChapter={createManuscriptChapter}
            onCreateScene={addStoryScene}
            onCreateVariable={addStoryVariable}
            onDeleteScene={deleteStoryScene}
            onDeleteVariable={deleteStoryVariable}
            onLoadManuscriptChapterVersions={loadManuscriptChapterVersions}
            onExportManuscriptPublication={exportManuscriptPublication}
            onManuscriptChange={updateManuscriptWorkspace}
            onImportAssets={importAssetFiles}
            onModeChange={setStoryWorkspaceMode}
            onOpenTimeline={openTimelineEvent}
            onRestoreManuscriptChapterVersion={restoreManuscriptChapterVersion}
            onSelectScene={setSelectedStorySceneId}
            onSelectManuscript={selectManuscriptUnit}
            onSelectVariable={setSelectedStoryVariableId}
            onUpdateScene={updateStoryScene}
            onUpdateVariable={updateStoryVariable}
            timelineEvents={worldTimelineEvents}
          />
        )}

        {activeTab === "production" && (
          <NarrativeProductionWorkspace
            coverage={narrativeCoverage}
            criticalPath={narrativeCriticalPath}
            issues={narrativeIssues}
            milestones={worldNarrativeMilestones}
            references={narrativeReferences}
            selectedMilestoneId={selectedNarrativeMilestoneId}
            onBatchStatus={batchNarrativeProductionStatus}
            onCreate={createNarrativeProductionMilestone}
            onDelete={deleteNarrativeProductionMilestone}
            onMoveOrder={reorderNarrativeProductionMilestone}
            onMoveStatus={moveNarrativeProductionMilestone}
            onOpenReference={openNarrativeReference}
            onSelect={setSelectedNarrativeMilestoneId}
            onUpdate={updateNarrativeProductionMilestone}
          />
        )}

        {activeTab === "testing" && (
          <StoryTestWorkspace
            entities={worldEntities.map((entity) => ({
              id: entity.id,
              title: entity.title,
              typeLabel: entityTypeMeta[entity.type].label
            }))}
            issues={worldStoryReviewIssues}
            mode={storyTestWorkspaceMode}
            presets={worldStoryTestPresets}
            quests={worldQuests.map((quest) => ({ id: quest.id, title: quest.title }))}
            runs={worldStoryTestRuns}
            scenes={worldStoryScenes}
            selectedIssueId={selectedStoryReviewIssue?.id ?? ""}
            selectedPresetId={selectedStoryTestPreset?.id ?? ""}
            variables={worldStoryVariables}
            worldId={activeWorld.id}
            worldName={activeWorld.name}
            onCreateIssue={addStoryReviewIssue}
            onCreatePreset={addStoryTestPreset}
            onDeleteIssue={deleteStoryReviewIssue}
            onDeletePreset={deleteStoryTestPreset}
            onDeleteRun={deleteStoryTestRun}
            onModeChange={setStoryTestWorkspaceMode}
            onOpenConsistencyFinding={(findingId) => {
              setSelectedConsistencyFindingId(findingId);
              setActiveTab("consistency");
            }}
            onOpenScene={(sceneId) => {
              setSelectedStorySceneId(sceneId);
              setStoryWorkspaceMode("editor");
              setActiveTab("story");
            }}
            onSaveRun={saveStoryTestRun}
            onSelectIssue={setSelectedStoryReviewIssueId}
            onSelectPreset={setSelectedStoryTestPresetId}
            onUpdateIssue={updateStoryReviewIssue}
            onUpdatePreset={updateStoryTestPreset}
          />
        )}

        {activeTab === "quests" && (
          <div className="quest-workspace">
            <div className="quest-workspace-toolbar">
              <div className="quest-mode-switch" role="group" aria-label="任务工作区视图">
                <button
                  className={questWorkspaceMode === "editor" ? "is-active" : ""}
                  type="button"
                  onClick={() => setQuestWorkspaceMode("editor")}
                >
                  <ListChecks size={16} />
                  <span>编辑</span>
                </button>
                <button
                  className={questWorkspaceMode === "graph" ? "is-active" : ""}
                  type="button"
                  onClick={() => setQuestWorkspaceMode("graph")}
                >
                  <GitBranch size={16} />
                  <span>依赖图</span>
                </button>
                <button
                  className={questWorkspaceMode === "participation" ? "is-active" : ""}
                  type="button"
                  onClick={() => setQuestWorkspaceMode("participation")}
                >
                  <UsersRound size={16} />
                  <span>参与总览</span>
                </button>
              </div>

              <div className="quest-category-filter" role="group" aria-label="任务分类筛选">
                <button
                  className={questCategoryFilter === "all" ? "is-active" : ""}
                  type="button"
                  onClick={() => selectQuestCategoryFilter("all")}
                >
                  全部 <strong>{worldQuests.length}</strong>
                </button>
                {(Object.keys(questCategoryMeta) as QuestCategory[]).map((category) => (
                  <button
                    className={questCategoryFilter === category ? "is-active" : ""}
                    key={category}
                    type="button"
                    onClick={() => selectQuestCategoryFilter(category)}
                  >
                    {questCategoryMeta[category].label}
                    <strong>{questCategoryCounts[category]}</strong>
                  </button>
                ))}
              </div>
            </div>

            {questWorkspaceMode === "editor" && (
              <section className="quest-layout">
                <div className="panel quest-list-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>任务线</h2>
                      <p>{filteredWorldQuests.length} 条符合筛选</p>
                    </div>
                    <button
                      aria-label="创建任务线"
                      className="icon-button"
                      title="创建任务线"
                      type="button"
                      onClick={createQuest}
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="quest-list">
                    {filteredWorldQuests.length ? (
                      filteredWorldQuests.map((quest) => (
                        <button
                          className={`quest-card ${
                            quest.id === selectedQuest?.id ? "is-active" : ""
                          }`}
                          key={quest.id}
                          type="button"
                          onClick={() => setSelectedQuestId(quest.id)}
                        >
                          <div>
                            <strong>{quest.title}</strong>
                            <span>{questStatusMeta[quest.status].label}</span>
                          </div>
                          <div className="quest-card-badges">
                            <span className={`category-${quest.category}`}>
                              {questCategoryMeta[quest.category].label}
                            </span>
                          </div>
                          <p>{quest.summary}</p>
                          <small>
                            {quest.steps.length} 步 · {quest.prerequisiteQuestIds.length} 个前置 ·{" "}
                            {resolveQuestEntities(quest, worldEntities).length} 个参与条目
                          </small>
                        </button>
                      ))
                    ) : (
                      <p className="quest-list-empty">当前分类还没有任务</p>
                    )}
                  </div>
                </div>

                <div className="panel quest-editor-panel">
                  {selectedQuest ? (
                    <QuestEditor
                      entities={worldEntities}
                      quest={selectedQuest}
                      questEntities={selectedQuestEntities}
                      quests={worldQuests}
                      onAddStep={addQuestStep}
                      onMaximizeBranch={() => setVisualFullscreen("branch")}
                      onRemoveStep={removeQuestStep}
                      onToggleEntity={toggleQuestEntity}
                      onTogglePrerequisite={toggleQuestPrerequisite}
                      onUpdate={updateSelectedQuest}
                      onUpdateStep={updateQuestStep}
                    />
                  ) : (
                    <EmptyState
                      icon={Route}
                      title="还没有任务线"
                      actionLabel="创建任务线"
                      onAction={createQuest}
                    />
                  )}
                </div>

                <div className="inspector-stack quest-inspector">
                  <div className="panel">
                    <div className="panel-heading compact">
                      <div>
                        <h2>自动关联</h2>
                        <p>从任务文本解析</p>
                      </div>
                      <Network size={20} />
                    </div>

                    <div className="link-section">
                      <h3>任务提及</h3>
                      {selectedQuestMentions.length ? (
                        selectedQuestMentions.map((mention) => {
                          const entity = worldEntities.find(
                            (item) => normalize(item.title) === normalize(mention)
                          );
                          return (
                            <div className="relation-row" key={mention}>
                              <Link2 size={16} />
                              <span>{mention}</span>
                              {entity ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedEntityId(entity.id);
                                    setActiveTab("codex");
                                  }}
                                >
                                  打开
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => createEntityFromMention(mention)}
                                >
                                  创建
                                </button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="muted-text">在任务描述里写 [[角色名]] 或 [[地点名]]</p>
                      )}
                    </div>
                    <div className="link-section">
                      <h3>引用当前任务</h3>
                      <BackReferenceList
                        references={selectedQuestBackReferences}
                        onOpen={openBackReference}
                      />
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-heading compact">
                      <div>
                        <h2>开发信息</h2>
                        <p>任务依赖与范围</p>
                      </div>
                      <GitBranch size={20} />
                    </div>
                    {selectedQuest ? (
                      <div className="mini-facts">
                        <Fact
                          icon={Route}
                          label="任务分类"
                          value={questCategoryMeta[selectedQuest.category].label}
                        />
                        <Fact
                          icon={ListChecks}
                          label="任务步骤"
                          value={`${selectedQuest.steps.length} 步`}
                        />
                        <Fact
                          icon={GitBranch}
                          label="前置任务"
                          value={`${selectedQuest.prerequisiteQuestIds.length} 条`}
                        />
                        <Fact
                          icon={UsersRound}
                          label="关联条目"
                          value={`${selectedQuestEntities.length} 个`}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="panel">
                    <div className="panel-heading compact">
                      <div>
                        <h2>相关时间点</h2>
                        <p>{selectedQuestTimelineEvents.length} 个任务节点</p>
                      </div>
                      <CalendarDays size={20} />
                    </div>
                    <div className="planning-reference-section quest-timeline-links">
                      <div>
                        <strong>时间线关联</strong>
                        <span>{selectedQuestTimelineEvents.length}</span>
                      </div>
                      {selectedQuestTimelineEvents.map((timelineEvent) => {
                        const linkedEntity = worldEntities.find(
                          (entity) => entity.id === timelineEvent.entityId
                        );
                        return (
                          <button
                            key={timelineEvent.id}
                            type="button"
                            onClick={() => openTimelineEvent(timelineEvent.id)}
                          >
                            <CalendarDays size={15} />
                            <span>
                              <strong>
                                {timelineEvent.title || linkedEntity?.title || selectedQuest?.title}
                              </strong>
                              <small>
                                {formatTimelineInterval(timelineEvent) ||
                                  timelineEvent.era ||
                                  "未设置时间"}
                              </small>
                            </span>
                          </button>
                        );
                      })}
                      {!selectedQuestTimelineEvents.length ? (
                        <p className="muted-text">这个任务尚未关联时间点</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {questWorkspaceMode === "graph" && (
              <section className="quest-graph-layout">
                <div className="panel quest-graph-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>世界任务依赖图</h2>
                      <p>箭头从前置任务指向后续任务</p>
                    </div>
                    <div className="panel-heading-actions">
                      <GitBranch size={22} />
                      <button
                        aria-label="最大化查看任务依赖图"
                        className="icon-button"
                        title="最大化查看任务依赖图"
                        type="button"
                        onClick={() => setVisualFullscreen("dependency")}
                      >
                        <Maximize2 size={18} />
                      </button>
                    </div>
                  </div>
                  <QuestDependencyGraph
                    entitiesById={questEntityNames}
                    quests={questVisuals}
                    selectedQuestId={selectedQuest?.id ?? ""}
                    onSelectQuest={setSelectedQuestId}
                  />
                </div>

                <div className="panel quest-graph-sidebar">
                  <div className="panel-heading compact">
                    <div>
                      <h2>{selectedQuest?.title ?? "选择一个任务"}</h2>
                      <p>图谱节点详情</p>
                    </div>
                    <Route size={20} />
                  </div>
                  {selectedQuest ? (
                    <>
                      <div className="mini-facts">
                        <Fact
                          icon={Route}
                          label="分类"
                          value={questCategoryMeta[selectedQuest.category].label}
                        />
                        <Fact
                          icon={GitBranch}
                          label="前置"
                          value={`${selectedQuest.prerequisiteQuestIds.length} 条`}
                        />
                        <Fact
                          icon={ListChecks}
                          label="节点"
                          value={`${selectedQuest.steps.length} 步`}
                        />
                        <Fact
                          icon={UsersRound}
                          label="参与"
                          value={`${selectedQuestEntities.length} 个条目`}
                        />
                      </div>
                      <p className="graph-selected-summary">{selectedQuest.summary}</p>
                      <button
                        className="wide-button"
                        type="button"
                        onClick={() => openQuestInEditor(selectedQuest.id)}
                      >
                        <ListChecks size={17} />
                        <span>打开任务编辑器</span>
                      </button>
                    </>
                  ) : (
                    <p className="muted-text">从左侧图谱选择任务节点</p>
                  )}
                </div>
              </section>
            )}

            {questWorkspaceMode === "participation" && (
              <section className="panel participation-panel">
                <div className="panel-heading">
                  <div>
                    <h2>角色与地点参与总览</h2>
                    <p>查看每个角色和地点进入了哪些任务线</p>
                  </div>
                  <UsersRound size={22} />
                </div>
                <QuestParticipationBoard
                  rows={questParticipationRows}
                  onOpenEntity={openQuestParticipant}
                  onSelectQuest={openQuestInEditor}
                />
              </section>
            )}
          </div>
        )}

        {activeTab === "relations" && (
          <section className="relation-layout">
            <div className="panel relation-list-panel">
              <div className="panel-heading">
                <div>
                  <h2>显式关系</h2>
                  <p>{filteredRelations.length} 条符合筛选</p>
                </div>
                <button
                  aria-label="创建关系"
                  className="icon-button"
                  title="创建关系"
                  type="button"
                  onClick={createRelation}
                >
                  <Plus size={18} />
                </button>
              </div>

              <label className="search-box relation-search">
                <Search size={17} />
                <input
                  aria-label="搜索关系"
                  placeholder="搜索条目、标签、备注"
                  value={relationQuery}
                  onChange={(event) => setRelationQuery(event.target.value)}
                />
              </label>

              <div className="relation-type-filter" role="group" aria-label="关系图类型筛选">
                {(
                  [
                    { value: "all", label: "全部" },
                    { value: "character", label: "角色" },
                    { value: "faction", label: "组织" },
                    { value: "location", label: "地点" }
                  ] as Array<{ value: EntityType | "all"; label: string }>
                ).map((item) => (
                  <button
                    className={relationTypeFilter === item.value ? "is-active" : ""}
                    key={item.value}
                    type="button"
                    onClick={() => setRelationTypeFilter(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                className="generate-relations-button"
                type="button"
                onClick={generateRelationsFromLinks}
              >
                <Sparkles size={15} />
                <span>从 [[链接]] 生成关系</span>
              </button>

              <div className="explicit-relation-list">
                {filteredRelations.length ? (
                  renderedRelations.map((relation) => {
                    const source = relationEntityById.get(relation.sourceEntityId);
                    const target = relationEntityById.get(relation.targetEntityId);
                    const DirectionIcon =
                      relation.direction === "directed" ? ArrowRight : ArrowLeftRight;
                    return (
                      <button
                        className={`explicit-relation-card ${
                          relation.id === selectedRelation?.id ? "is-active" : ""
                        }`}
                        key={relation.id}
                        type="button"
                        onClick={() => selectRelation(relation.id)}
                      >
                        <span className="relation-card-endpoint">{source?.title ?? "缺失条目"}</span>
                        <span className="relation-card-link">
                          <DirectionIcon size={14} />
                          <strong>{relation.label}</strong>
                        </span>
                        <span className="relation-card-endpoint">{target?.title ?? "缺失条目"}</span>
                        <small>
                          {relationKindMeta[relation.kind].label} · 强度 {relation.strength}
                        </small>
                      </button>
                    );
                  })
                ) : (
                  <p className="relation-list-empty">当前没有符合条件的关系</p>
                )}
                {filteredRelations.length > renderedRelations.length ? (
                  <p className="relation-list-limit">
                    首屏显示 {renderedRelations.length} 条，共 {filteredRelations.length} 条。输入名称可检索全部关系。
                  </p>
                ) : null}
              </div>
            </div>

            <div className="panel relation-graph-panel">
              <div className="panel-heading">
                <div>
                  <h2>世界关系图</h2>
                  <p>{relationVisibleEntities.length} 个条目 · {visibleGraphRelations.length} 条关系</p>
                </div>
                <div className="panel-heading-actions">
                  <Network size={22} />
                  <button
                    aria-label="最大化查看世界关系图"
                    className="icon-button"
                    title="最大化查看世界关系图"
                    type="button"
                    onClick={() => setVisualFullscreen("relation")}
                  >
                    <Maximize2 size={18} />
                  </button>
                </div>
              </div>

              <RelationGraph
                entities={relationVisibleEntities}
                focusedEntityId={focusedRelationEntity?.id ?? ""}
                relations={visibleGraphRelations}
                selectedRelationId={selectedRelation?.id ?? ""}
                onOpenEntity={openRelationEntity}
                onSelectEntity={selectRelationEntity}
                onSelectRelation={selectRelation}
              />

              {focusedRelationEntity ? (
                <div className="relation-focus-strip">
                  <div>
                    <strong>{focusedRelationEntity.title}</strong>
                    <span>
                      {entityTypeMeta[focusedRelationEntity.type].label} · {focusedEntityRelations.length} 条关系
                    </span>
                  </div>
                  <div className="relation-focus-links">
                    {focusedEntityRelations.slice(0, 6).map((relation) => {
                      const otherId =
                        relation.sourceEntityId === focusedRelationEntity.id
                          ? relation.targetEntityId
                          : relation.sourceEntityId;
                      return (
                        <button
                          key={relation.id}
                          type="button"
                          onClick={() => selectRelation(relation.id)}
                        >
                          {relation.label} · {getEntityTitle(worldEntities, otherId)}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="relation-open-entity"
                    type="button"
                    onClick={() => openRelationEntity(focusedRelationEntity.id)}
                  >
                    <BookOpen size={16} />
                    <span>打开条目</span>
                  </button>
                </div>
              ) : null}
            </div>

            <div className="panel relation-editor-panel">
              {selectedRelation ? (
                <>
                  <div className="panel-heading compact">
                    <div>
                      <h2>关系编辑</h2>
                      <p>{relationKindMeta[selectedRelation.kind].helper}</p>
                    </div>
                    <button
                      aria-label="删除关系"
                      className="icon-button danger-icon-button"
                      title="删除关系"
                      type="button"
                      onClick={removeSelectedRelation}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="relation-endpoints">
                    <Field
                      label="起点条目"
                      referencePath="sourceEntityId"
                      referenceSource={{ kind: "relation", id: selectedRelation.id }}
                    >
                      <select
                        aria-label="关系起点"
                        value={selectedRelation.sourceEntityId}
                        onChange={(event) => {
                          const sourceEntityId = event.target.value;
                          const targetEntityId =
                            selectedRelation.targetEntityId === sourceEntityId
                              ? worldEntities.find((entity) => entity.id !== sourceEntityId)?.id ?? ""
                              : selectedRelation.targetEntityId;
                          updateSelectedRelation({ sourceEntityId, targetEntityId });
                          setRelationFocusEntityId(sourceEntityId);
                        }}
                      >
                        {worldEntities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entityTypeMeta[entity.type].label} · {entity.title}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <button
                      aria-label="交换关系方向"
                      className="relation-swap-button"
                      title="交换起点和终点"
                      type="button"
                      onClick={swapSelectedRelation}
                    >
                      <ArrowLeftRight size={17} />
                    </button>

                    <Field
                      label="终点条目"
                      referencePath="targetEntityId"
                      referenceSource={{ kind: "relation", id: selectedRelation.id }}
                    >
                      <select
                        aria-label="关系终点"
                        value={selectedRelation.targetEntityId}
                        onChange={(event) =>
                          updateSelectedRelation({ targetEntityId: event.target.value })
                        }
                      >
                        {worldEntities
                          .filter((entity) => entity.id !== selectedRelation.sourceEntityId)
                          .map((entity) => (
                            <option key={entity.id} value={entity.id}>
                              {entityTypeMeta[entity.type].label} · {entity.title}
                            </option>
                          ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="关系类型">
                    <select
                      aria-label="关系类型"
                      value={selectedRelation.kind}
                      onChange={(event) =>
                        changeSelectedRelationKind(event.target.value as RelationKind)
                      }
                    >
                      {(Object.keys(relationKindMeta) as RelationKind[]).map((kind) => (
                        <option key={kind} value={kind}>
                          {relationKindMeta[kind].label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="图上标签">
                    <input
                      value={selectedRelation.label}
                      onChange={(event) => updateSelectedRelation({ label: event.target.value })}
                    />
                  </Field>

                  <Field label="方向">
                    <select
                      aria-label="关系方向"
                      value={selectedRelation.direction}
                      onChange={(event) =>
                        updateSelectedRelation({
                          direction: event.target.value as RelationDirection
                        })
                      }
                    >
                      <option value="directed">单向：起点 → 终点</option>
                      <option value="undirected">双向：起点 ↔ 终点</option>
                      <option value="mutual">互向：双方彼此作用</option>
                    </select>
                  </Field>

                  <details className="relation-evidence-fields" open>
                    <summary>考据与证据</summary>
                    <div className="relation-evidence-grid">
                      <Field label="证据类型">
                        <select
                          aria-label="关系证据类型"
                          value={selectedRelation.evidenceType ?? "unspecified"}
                          onChange={(event) =>
                            updateSelectedRelation({
                              evidenceType: event.target.value as RelationEvidenceType
                            })
                          }
                        >
                          {(Object.keys(relationEvidenceTypeMeta) as RelationEvidenceType[]).map(
                            (value) => (
                              <option key={value} value={value}>
                                {relationEvidenceTypeMeta[value]}
                              </option>
                            )
                          )}
                        </select>
                      </Field>

                      <Field label="可信度">
                        <select
                          aria-label="关系可信度"
                          value={selectedRelation.confidence ?? "unspecified"}
                          onChange={(event) =>
                            updateSelectedRelation({
                              confidence: event.target.value as RelationConfidence
                            })
                          }
                        >
                          {(Object.keys(relationConfidenceMeta) as RelationConfidence[]).map(
                            (value) => (
                              <option key={value} value={value}>
                                {relationConfidenceMeta[value]}
                              </option>
                            )
                          )}
                        </select>
                      </Field>

                      <Field label="原典出处">
                        <input
                          aria-label="关系原典出处"
                          placeholder="书名 · 卷篇 · 章节"
                          value={selectedRelation.sourceCitation ?? ""}
                          onChange={(event) =>
                            updateSelectedRelation({ sourceCitation: event.target.value })
                          }
                        />
                      </Field>

                      <Field label="适用年代">
                        <input
                          aria-label="关系适用年代"
                          placeholder="神话叙事层、先秦、两汉或后世合流"
                          value={selectedRelation.historicalScope ?? ""}
                          onChange={(event) =>
                            updateSelectedRelation({ historicalScope: event.target.value })
                          }
                        />
                      </Field>
                    </div>
                  </details>

                  <label className="field relation-strength-field">
                    <span>关系强度</span>
                    <div>
                      <input
                        aria-label="关系强度"
                        max="5"
                        min="1"
                        type="range"
                        value={selectedRelation.strength}
                        onChange={(event) =>
                          updateSelectedRelation({ strength: Number(event.target.value) })
                        }
                      />
                      <output>{selectedRelation.strength} / 5</output>
                    </div>
                  </label>

                  <Field label="关系备注">
                    <textarea
                      rows={6}
                      value={selectedRelation.notes}
                      onChange={(event) => updateSelectedRelation({ notes: event.target.value })}
                    />
                  </Field>
                </>
              ) : (
                <EmptyState
                  icon={Network}
                  title="还没有显式关系"
                  actionLabel="创建第一条关系"
                  onAction={createRelation}
                />
              )}
            </div>
          </section>
        )}

        {activeTab === "assets" && (
          <section className="asset-layout">
            <div className="panel asset-filter-panel">
              <div className="panel-heading">
                <div>
                  <h2>资源库</h2>
                  <p>图片、地图、音乐与开发资料</p>
                </div>
                <Library size={21} />
              </div>

              <button className="wide-button" type="button" onClick={importAssetFiles}>
                <Upload size={18} />
                <span>导入本地文件</span>
              </button>

              <label className="search-box asset-search">
                <Search size={17} />
                <input
                  aria-label="搜索资源"
                  placeholder="搜索资源"
                  value={assetQuery}
                  onChange={(event) => setAssetQuery(event.target.value)}
                />
              </label>

              <div className="asset-kind-filter" aria-label="资源分类">
                <button
                  className={assetKindFilter === "all" ? "is-active" : ""}
                  type="button"
                  onClick={() => setAssetKindFilter("all")}
                >
                  <Library size={16} />
                  <span>全部资源</span>
                  <strong>{worldAssets.length}</strong>
                </button>
                {(Object.keys(assetKindMeta) as AssetKind[]).map((kind) => {
                  const Icon = assetKindMeta[kind].icon;
                  return (
                    <button
                      className={assetKindFilter === kind ? "is-active" : ""}
                      key={kind}
                      type="button"
                      onClick={() => setAssetKindFilter(kind)}
                    >
                      <Icon size={16} />
                      <span>{assetKindMeta[kind].label}</span>
                      <strong>{assetKindCounts[kind]}</strong>
                    </button>
                  );
                })}
              </div>

              <p className="asset-storage-note">
                文件保存在本地资源库；完整 .wcodex 工程包会连同资源一起保存。
              </p>
            </div>

            <div className="panel asset-browser-panel">
              <div className="panel-heading">
                <div>
                  <h2>{assetKindFilter === "all" ? "全部资源" : assetKindMeta[assetKindFilter].label}</h2>
                  <p>{filteredAssets.length} 个结果</p>
                </div>
                <button
                  aria-label="导入资源"
                  className="icon-button"
                  title="导入资源"
                  type="button"
                  onClick={importAssetFiles}
                >
                  <Plus size={18} />
                </button>
              </div>

              {filteredAssets.length ? (
                <div className="asset-grid">
                  {filteredAssets.map((asset) => {
                    const Icon = assetKindMeta[asset.kind].icon;
                    const canPreviewImage = asset.mimeType.startsWith("image/");
                    const fileCheck = assetFileStatus?.[asset.storedName];
                    const fileProblem =
                      fileCheck?.exists === false ||
                      fileCheck?.hashMatches === false ||
                      fileCheck?.sizeMatches === false;
                    return (
                      <button
                        className={`asset-card ${asset.id === selectedAsset?.id ? "is-active" : ""} ${fileProblem ? "has-file-problem" : ""}`}
                        key={asset.id}
                        type="button"
                        onClick={() => setSelectedAssetId(asset.id)}
                      >
                        <span className="asset-thumbnail">
                          {canPreviewImage && asset.storedName ? (
                            <img alt="" src={getAssetUrl(asset.storedName)} />
                          ) : (
                            <Icon size={30} />
                          )}
                          <span className="asset-kind-badge">
                            <Icon size={13} />
                            {assetKindMeta[asset.kind].label}
                          </span>
                          {fileCheck ? (
                            <span
                              className={`asset-file-state-badge ${fileProblem ? "has-error" : "is-valid"}`}
                              title={fileProblem ? "本地文件需要处理" : "本地文件完整性正常"}
                            >
                              {fileProblem ? <AlertTriangle size={13} /> : <Check size={13} />}
                            </span>
                          ) : null}
                        </span>
                        <span className="asset-card-copy">
                          <strong>{asset.name}</strong>
                          <small>{formatFileSize(asset.size)} · {formatDateLabel(asset.updatedAt)}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Library}
                  title={worldAssets.length ? "没有符合条件的资源" : "资源库还是空的"}
                  actionLabel="导入本地文件"
                  onAction={importAssetFiles}
                />
              )}
            </div>

            <div className="panel asset-inspector-panel">
              {selectedAsset ? (
                <>
                  <div className="panel-heading compact">
                    <div>
                      <h2>资源详情</h2>
                      <p>{assetKindMeta[selectedAsset.kind].helper}</p>
                    </div>
                    <button
                      aria-label="删除资源"
                      className="icon-button danger-button"
                      title="删除资源"
                      type="button"
                      onClick={removeSelectedAsset}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="asset-preview">
                    {selectedAsset.mimeType.startsWith("image/") && selectedAsset.storedName ? (
                      <img alt={selectedAsset.name} src={getAssetUrl(selectedAsset.storedName)} />
                    ) : selectedAsset.mimeType.startsWith("video/") && selectedAsset.storedName ? (
                      <video controls preload="metadata" src={getAssetUrl(selectedAsset.storedName)} />
                    ) : selectedAsset.kind === "audio" && selectedAsset.storedName ? (
                      <div className="asset-audio-preview">
                        <Music size={34} />
                        <audio controls preload="metadata" src={getAssetUrl(selectedAsset.storedName)} />
                      </div>
                    ) : (
                      <div className="asset-generic-preview">
                        {(() => {
                          const Icon = assetKindMeta[selectedAsset.kind].icon;
                          return <Icon size={40} />;
                        })()}
                        <span>{selectedAsset.originalName}</span>
                      </div>
                    )}
                  </div>

                  {selectedAssetFileCheck ? (
                    <div
                      className={`asset-integrity-state ${
                        selectedAssetFileCheck.exists === false ||
                        selectedAssetFileCheck.hashMatches === false ||
                        selectedAssetFileCheck.sizeMatches === false
                          ? "has-error"
                          : "is-valid"
                      }`}
                    >
                      {selectedAssetFileCheck.exists === false ? (
                        <AlertTriangle size={17} />
                      ) : selectedAssetFileCheck.hashMatches === false ||
                        selectedAssetFileCheck.sizeMatches === false ? (
                        <AlertTriangle size={17} />
                      ) : (
                        <ShieldCheck size={17} />
                      )}
                      <div>
                        <strong>
                          {selectedAssetFileCheck.exists === false
                            ? "本地文件缺失"
                            : selectedAssetFileCheck.hashMatches === false ||
                                selectedAssetFileCheck.sizeMatches === false
                              ? "文件内容与项目记录不一致"
                              : selectedAsset.contentHash
                                ? "SHA-256 完整性已验证"
                                : "本地文件可用"}
                        </strong>
                        <span>
                          {selectedAssetFileCheck.exists === false
                            ? "选择原文件或替代文件即可修复所有引用。"
                            : selectedAssetFileCheck.hashMatches === false ||
                                selectedAssetFileCheck.sizeMatches === false
                              ? "文件可能被外部修改，替换前会再次确认。"
                              : "保存完整工程包时会再次逐项校验。"}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <Field label="资源名称">
                    <input
                      value={selectedAsset.name}
                      onChange={(event) => updateSelectedAsset({ name: event.target.value })}
                    />
                  </Field>

                  <Field label="分类">
                    <select
                      value={selectedAsset.kind}
                      onChange={(event) => updateSelectedAsset({ kind: event.target.value as AssetKind })}
                    >
                      {(Object.keys(assetKindMeta) as AssetKind[]).map((kind) => (
                        <option key={kind} value={kind}>
                          {assetKindMeta[kind].label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="标签">
                    <div className="input-with-icon">
                      <Tags size={16} />
                      <input
                        value={selectedAsset.tags.join("，")}
                        onChange={(event) =>
                          updateSelectedAsset({
                            tags: event.target.value.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean)
                          })
                        }
                      />
                    </div>
                  </Field>

                  <Field label="开发备注">
                    <textarea
                      rows={4}
                      value={selectedAsset.notes}
                      onChange={(event) => updateSelectedAsset({ notes: event.target.value })}
                    />
                  </Field>

                  <div className="asset-file-facts">
                    <span>{selectedAsset.originalName}</span>
                    <small>{selectedAsset.mimeType} · {formatFileSize(selectedAsset.size)}</small>
                    <small title={selectedAsset.contentHash || "尚未生成哈希"}>
                      SHA-256 · {selectedAsset.contentHash ? selectedAsset.contentHash.slice(0, 16) : "待校验"}
                    </small>
                  </div>

                  <div className="asset-action-row">
                    {["image", "map", "concept"].includes(selectedAsset.kind) && (
                      <button type="button" onClick={useSelectedAssetAsMap}>
                        <Map size={17} />
                        <span>设为地图</span>
                      </button>
                    )}
                    <button type="button" onClick={revealSelectedAsset}>
                      <FolderOpen size={17} />
                      <span>文件位置</span>
                    </button>
                    <button type="button" onClick={relinkSelectedAsset}>
                      <RefreshCw size={17} />
                      <span>
                        {selectedAssetFileCheck?.exists === false ? "重定位文件" : "替换文件"}
                      </span>
                    </button>
                  </div>

                  <div
                    className="asset-link-section"
                    data-reference-path="linkedEntityIds"
                    data-reference-source-id={selectedAsset.id}
                    data-reference-source-kind="asset"
                  >
                    <div className="asset-link-heading">
                      <h3>关联条目</h3>
                      <span>{selectedAsset.linkedEntityIds.length} / {worldEntities.length}</span>
                    </div>
                    <div className="asset-entity-picker">
                      {worldEntities.map((entity) => (
                        <label key={entity.id}>
                          <input
                            checked={selectedAsset.linkedEntityIds.includes(entity.id)}
                            type="checkbox"
                            onChange={() => toggleAssetEntity(entity.id)}
                          />
                          <span>{entity.title}</span>
                          <small>{entityTypeMeta[entity.type].label}</small>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={ImageIcon}
                  title="选择一个资源查看详情"
                  actionLabel="导入资源"
                  onAction={importAssetFiles}
                />
              )}
            </div>
          </section>
        )}

        {activeTab === "map" && (
          <MapWorkspace
            activeMapId={activeMap?.id ?? ""}
            creatableReferenceKinds={creatableProjectReferenceKinds}
            entities={worldEntities.map((entity) => ({
              id: entity.id,
              title: entity.title,
              type: entity.type
            }))}
            maps={worldMaps}
            layers={worldMapLayers}
            markerGroups={worldMapMarkerGroups}
            markers={allWorldMarkers}
            onCreateMap={addWorldMap}
            onCreateLayer={addMapLayer}
            onCreateMarker={addMapMarker}
            onCreateMarkerGroup={addMapMarkerGroup}
            onCreateReference={createProjectReferenceFromPicker}
            onCreateRoute={addMapRoute}
            onCompleteAi={completeWithAi}
            onDeleteMap={deleteWorldMap}
            onDeleteLayer={deleteMapLayer}
            onDuplicateLayer={duplicateMapLayer}
            onDeleteMarker={deleteMapMarker}
            onDeleteMarkerGroup={deleteMapMarkerGroup}
            onDeleteRoute={deleteMapRoute}
            onOpenReference={openProjectReference}
            onOpenTimeline={openTimelineEvent}
            onLoadMapVersions={loadWorldMapVersions}
            onMergeLayers={mergeMapLayers}
            onRedoMapOperation={redoMapOperation}
            onReorderLayers={reorderMapLayers}
            onUndoMapOperation={undoMapOperation}
            operationFocus={mapOperationFocus}
            onSelectMap={selectWorldMap}
            onSelectMarker={selectMapMarker}
            onSelectRoute={selectMapRoute}
            onUpdateMap={updateWorldMap}
            onUpdateLayer={updateMapLayer}
            onUpdateLayers={updateMapLayers}
            onUpdateMarker={updateMapMarker}
            onUpdateMarkers={updateMapMarkers}
            onUpdateMarkerGroup={updateMapMarkerGroup}
            onUpdateRoute={updateMapRoute}
            onRestoreMapVersion={restoreWorldMapVersion}
            onUploadLayerImage={uploadMapLayerImage}
            onUploadMap={uploadMapImage}
            onUploadMarkerIcon={uploadMapMarkerIcon}
            quests={worldQuests.map((quest) => ({ id: quest.id, title: quest.title }))}
            referenceFocus={referenceLocationRequest}
            referenceOptions={projectReferenceOptions}
            redoMapOperationLabel={mapHistoryControls.redoLabel}
            routes={worldMapRoutes}
            scenes={worldStoryScenes.map((scene) => ({ id: scene.id, title: scene.title }))}
            selectedMarkerId={selectedMapMarkerId}
            selectedRouteId={selectedMapRouteId}
            timelineEvents={worldTimelineEvents}
            undoMapOperationLabel={mapHistoryControls.undoLabel}
          />
        )}

        {activeTab === "timeline" && (
          <TimelineWorkspace
            creatableReferenceKinds={creatableProjectReferenceKinds}
            entities={worldEntities.map((entity) => ({
              id: entity.id,
              title: entity.title,
              type: entity.type
            }))}
            events={worldTimelineEvents}
            maps={worldMaps}
            markers={allWorldMarkers}
            onCreateEvent={addTimelineEvent}
            onCreateTrack={addTimelineTrack}
            onCreateReference={createProjectReferenceFromPicker}
            onDeleteEvent={deleteTimelineEvent}
            onDeleteTrack={deleteTimelineTrack}
            onOpenMapMarker={openMapMarker}
            onOpenReference={openProjectReference}
            onSelectEvent={(eventId) => {
              const timelineEvent = worldTimelineEvents.find((item) => item.id === eventId);
              setSelectedTimelineEventId(eventId);
              if (timelineEvent) setSelectedTimelineTrackId(timelineEvent.trackId);
            }}
            onSelectTrack={selectTimelineTrack}
            onUpdateEvent={updateTimelineEvent}
            onUpdateTrack={updateTimelineTrack}
            quests={worldQuests.map((quest) => ({ id: quest.id, title: quest.title }))}
            referenceOptions={projectReferenceOptions}
            scenes={worldStoryScenes.map((scene) => ({ id: scene.id, title: scene.title }))}
            selectedEventId={selectedTimelineEvent?.id ?? ""}
            selectedTrackId={selectedTimelineTrackId}
            tracks={worldTimelineTracks}
          />
        )}

        {activeTab === "consistency" && (
          <ConsistencyWorkspace
            findings={worldConsistencyFindings}
            modelBusyFindingId={modelBusyFindingId}
            modelMessage={consistencyModelMessage}
            modelSettings={activeConsistencyModelSettings}
            onBatchCreateIssues={createReviewIssuesFromConsistency}
            onExplainFinding={explainConsistencyFinding}
            onExportJson={exportConsistencyJson}
            onExportMarkdown={exportConsistencyMarkdown}
            onOpenTarget={openConsistencyTarget}
            onCancelScan={cancelProjectConsistencyScan}
            onRunScan={runProjectConsistencyScan}
            onSelectFinding={setSelectedConsistencyFindingId}
            onToggleRule={toggleConsistencyRule}
            onUpdateFindingStatus={changeConsistencyFindingStatus}
            onUpdateModelSettings={updateConsistencyModelSettings}
            onUpdateSettings={updateConsistencySettings}
            scans={worldConsistencyScans}
            scanRunning={consistencyScanState === "running"}
            selectedFindingId={selectedConsistencyFinding?.id ?? ""}
            settings={activeConsistencySettings}
          />
        )}

        {activeTab === "ai" && aiOperationContext && (
          <AiWorkspace
            contexts={aiContexts}
            initialContextId={
              aiContexts.some((item) => item.id === `entity:${selectedEntityId}`)
                ? `entity:${selectedEntityId}`
                : aiContexts[0]?.id ?? ""
            }
            operationContext={aiOperationContext}
            operationRuns={worldAiOperationRuns}
            settings={activeConsistencyModelSettings}
            memories={worldAiMemoryItems}
            sessions={worldAiWritingSessions}
            onAddMemories={addAiMemories}
            onApplyToEntity={applyAiToEntity}
            onApplyWritingDraft={applyAiWritingDraft}
            onClearCredential={clearAiCredential}
            onComplete={completeWithAi}
            onCompleteStream={completeWithAiStream}
            onCancelCompletion={cancelAiCompletion}
            onCreateWritingSession={createAiWritingRecord}
            onDeleteMemory={deleteAiMemory}
            onDeleteWritingSession={deleteAiWritingRecord}
            onGetCredentialStatus={getAiCredentialStatus}
            onSaveCredential={saveAiCredential}
            onTestConnection={testAiConnection}
            onOpenWritingTarget={openAiWritingTarget}
            onExecuteOperationPlan={executeAiOperationPlan}
            onOpenOperationChange={openAiOperationChange}
            onUndoOperationRun={undoAiOperation}
            onUndoInlineEdit={undoInlineAiChange}
            onUpdateMemory={updateAiMemory}
            onUpdateSettings={updateConsistencyModelSettings}
            onUpdateWritingSession={updateAiWritingRecord}
          />
        )}

        {activeTab === "health" && (
          <section className="health-layout">
            <div className="panel health-panel">
              <div className="panel-heading">
                <div>
                  <h2>项目检查</h2>
                  <p>结构引用与本地资源完整性</p>
                </div>
                <button
                  className="health-scan-button"
                  disabled={reliabilityStatus === "checking"}
                  type="button"
                  onClick={() => void refreshReliabilityData()}
                >
                  <RefreshCw
                    className={reliabilityStatus === "checking" ? "is-spinning" : ""}
                    size={17}
                  />
                  <span>{reliabilityStatus === "checking" ? "正在检查" : "重新检查"}</span>
                </button>
              </div>

              <div className="health-summary-grid">
                <div className={`health-summary-card ${healthErrorCount ? "has-error" : ""}`}>
                  <AlertTriangle size={19} />
                  <span>错误</span>
                  <strong>{healthErrorCount}</strong>
                </div>
                <div className={`health-summary-card ${healthWarningCount ? "has-warning" : ""}`}>
                  <AlertTriangle size={19} />
                  <span>提醒</span>
                  <strong>{healthWarningCount}</strong>
                </div>
                <div className="health-summary-card">
                  <Library size={19} />
                  <span>资源文件</span>
                  <strong>
                    {assetFileStatus
                      ? `${worldAssets.filter((asset) => {
                          const status = assetFileStatus[asset.storedName];
                          return (
                            status?.exists &&
                            status.hashMatches !== false &&
                            status.sizeMatches !== false
                          );
                        }).length}/${worldAssets.length}`
                      : worldAssets.length}
                  </strong>
                </div>
              </div>

              <div
                className={`health-state-banner ${projectHealthIssues.length ? "needs-attention" : "is-clear"}`}
              >
                {projectHealthIssues.length ? (
                  <AlertTriangle size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
                <div>
                  <strong>
                    {projectHealthIssues.length
                      ? `发现 ${projectHealthIssues.length} 个需要处理的问题`
                      : "当前项目检查通过"}
                  </strong>
                  <span>
                    {reliabilityStatus === "unavailable"
                      ? "结构检查已完成，本地文件检查需要桌面版"
                      : reliabilityStatus === "error"
                        ? "结构检查已完成，本地目录读取失败"
                        : reliabilityStatus === "checking"
                          ? "正在核对本地资源与备份"
                          : "条目、任务、剧情、测试、问题、关系、地图、时间线与资源已检查"}
                  </span>
                </div>
              </div>

              <div className="health-section-heading">
                <strong>检查结果</strong>
                <span>{projectHealthIssues.length} 项</span>
              </div>

              <div className="health-issue-list">
                {projectHealthIssues.length ? (
                  projectHealthIssues.map((issue) => (
                    <button
                      className={`health-issue-row severity-${issue.severity}`}
                      disabled={!issue.target && !issue.referenceLocation}
                      key={issue.id}
                      type="button"
                      onClick={() => openHealthIssue(issue)}
                    >
                      <span className="health-issue-icon">
                        <AlertTriangle size={17} />
                      </span>
                      <span>
                        <strong>{issue.title}</strong>
                        <small>{issue.detail}</small>
                      </span>
                      {issue.target || issue.referenceLocation ? <ChevronRight size={17} /> : null}
                    </button>
                  ))
                ) : (
                  <div className="health-clear-state">
                    <CheckCircle2 size={32} />
                    <strong>没有发现断开的引用或资源</strong>
                  </div>
                )}
              </div>

              <div className="health-directory-actions">
                <button
                  disabled={reliabilityStatus === "unavailable"}
                  type="button"
                  onClick={() => void revealAssetDirectory()}
                >
                  <FolderOpen size={16} />
                  <span>打开资源目录</span>
                </button>
                <span>{assetDirectory || "资源目录仅在桌面版中可用"}</span>
              </div>
            </div>

            <div className="panel backup-panel">
              <div className="panel-heading">
                <div>
                  <h2>备份与恢复</h2>
                  <p>
                    {backups.length} 个本地备份
                    {backupStorage ? ` · ${formatFileSize(backupStorage.totalBytes)}` : ""}
                  </p>
                </div>
                <History size={21} />
              </div>

              <div className="backup-toolbar">
                <button
                  disabled={reliabilityStatus === "unavailable"}
                  type="button"
                  onClick={() => void createCompleteProjectBackup()}
                >
                  <Save size={16} />
                  <span>完整备份</span>
                </button>
                <button
                  disabled={reliabilityStatus === "unavailable"}
                  type="button"
                  onClick={() => void createManualBackup()}
                >
                  <History size={16} />
                  <span>快速快照</span>
                </button>
                <button
                  disabled={reliabilityStatus === "unavailable"}
                  type="button"
                  onClick={() => void revealBackupDirectory()}
                >
                  <FolderOpen size={16} />
                  <span>打开目录</span>
                </button>
                <button
                  disabled={
                    reliabilityStatus === "unavailable" ||
                    !backupStorage?.reclaimableCount
                  }
                  type="button"
                  onClick={() => setPendingBackupCleanup(true)}
                >
                  <Trash2 size={16} />
                  <span>清理旧备份</span>
                </button>
              </div>

              {backupStorage ? (
                <div className="backup-storage-overview">
                  <HardDrive size={18} />
                  <div>
                    <strong>{formatFileSize(backupStorage.totalBytes)} 已占用</strong>
                    <span>
                      完整工程 {backupStorage.completeCount} 份 · {formatFileSize(backupStorage.completeBytes)}，
                      快速快照 {backupStorage.dataCount} 份 · {formatFileSize(backupStorage.dataBytes)}
                    </span>
                  </div>
                  <small className={backupStorage.reclaimableCount ? "has-reclaimable" : ""}>
                    {backupStorage.reclaimableCount
                      ? `可清理 ${backupStorage.reclaimableCount} 份 · ${formatFileSize(backupStorage.reclaimableBytes)}`
                      : "符合保留策略"}
                  </small>
                </div>
              ) : null}

              {pendingBackupCleanup && backupStorage?.reclaimableCount ? (
                <div className="backup-cleanup-confirm">
                  <span>
                    将删除 {backupStorage.reclaimableCount} 个超过保留数量或容量上限的最旧备份，
                    预计释放 {formatFileSize(backupStorage.reclaimableBytes)}。最新快速快照和完整工程都会保留。
                  </span>
                  <div>
                    <button type="button" onClick={() => void cleanupOldBackups()}>
                      确认清理
                    </button>
                    <button type="button" onClick={() => setPendingBackupCleanup(false)}>
                      取消
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="backup-list">
                {backups.length ? (
                  backups.map((backup) => (
                    <div className={`backup-card ${backup.valid ? "" : "is-damaged"}`} key={backup.fileName}>
                      <div className="backup-card-heading">
                        <div>
                          <strong>{backupReasonLabel(backup.reason)}</strong>
                          <span>{formatDateLabel(backup.createdAt)}</span>
                        </div>
                        <div className="backup-kind-facts">
                          <small className={backup.kind === "complete" ? "is-complete" : ""}>
                            {backup.kind === "complete"
                              ? backup.complete
                                ? "含全部资源"
                                : `缺 ${backup.missingAssetCount ?? 0} 个资源`
                              : "仅项目数据"}
                          </small>
                          <small>{formatFileSize(backup.size)}</small>
                        </div>
                      </div>
                      <div className="backup-counts">
                        <span>{backup.counts.worlds} 世界</span>
                        <span>{backup.counts.entityTemplates ?? 0} 模板</span>
                        <span>{backup.counts.entities} 条目</span>
                        <span>{backup.counts.quests} 任务</span>
                        <span>{backup.counts.storyScenes} 剧情</span>
                        <span>{backup.counts.storyTestRuns} 测试</span>
                        <span>{backup.counts.storyReviewIssues} 问题</span>
                        <span>{backup.counts.narrativeMilestones} 里程碑</span>
                        <span>{backup.counts.assets} 资源</span>
                        <span>{backup.counts.maps} 地图</span>
                        <span>{backup.counts.mapLayers ?? 0} 图层</span>
                        <span>{backup.counts.mapMarkerGroups ?? 0} 标记组</span>
                        <span>{backup.counts.mapMarkers} 标记</span>
                        <span>{backup.counts.mapRoutes} 路线</span>
                        <span>{backup.counts.timelineTracks} 轨道</span>
                        <span>{backup.counts.timelineEvents} 时间点</span>
                        <span>{backup.counts.consistencyFindings} 一致性</span>
                        <span>{backup.counts.consistencyScans} 扫描</span>
                      </div>

                      {pendingRestoreFileName === backup.fileName ? (
                        <div className="backup-confirm">
                          <span>
                            当前项目会先自动备份，再恢复此版本。
                            {backup.kind === "complete"
                              ? "工程包中的资源会经过完整性校验后恢复。"
                              : "此快速快照不包含本地资源文件。"}
                          </span>
                          <div>
                            <button
                              type="button"
                              onClick={() => void restoreBackup(backup.fileName)}
                            >
                              确认恢复
                            </button>
                            <button type="button" onClick={() => setPendingRestoreFileName("")}>
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="backup-restore-button"
                          disabled={!backup.valid}
                          type="button"
                          onClick={() => setPendingRestoreFileName(backup.fileName)}
                        >
                          <ArchiveRestore size={16} />
                          <span>{backup.valid ? "恢复此备份" : "备份文件损坏"}</span>
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="backup-empty-state">
                    <History size={30} />
                    <strong>
                      {reliabilityStatus === "unavailable" ? "桌面版中管理本地备份" : "还没有本地备份"}
                    </strong>
                  </div>
                )}
              </div>

              <div className="storage-facts compact-storage-facts">
                <Fact icon={Database} label="数据库" value={storeInfo?.dbPath ?? "未连接"} />
                <Fact icon={History} label="备份目录" value={storeInfo?.backupDir ?? "未启用"} />
              </div>
            </div>

            <div className="panel storage-diagnostics-panel">
              <div className="panel-heading">
                <div>
                  <h2>SQLite 与搜索诊断</h2>
                  <p>对象级增量存储 · 本地 FTS5</p>
                </div>
                <div className="storage-diagnostic-actions">
                  <button
                    className="health-scan-button"
                    disabled={reliabilityStatus === "unavailable"}
                    type="button"
                    onClick={() => void exportDiagnosticBundle()}
                  >
                    <Download size={17} />
                    <span>导出诊断包</span>
                  </button>
                  <button
                    className="health-scan-button"
                    disabled={!storageDiagnostics?.ftsAvailable}
                    type="button"
                    onClick={() => void rebuildWorkspaceSearchIndex()}
                  >
                    <RefreshCw size={17} />
                    <span>重建索引</span>
                  </button>
                  <button
                    className="health-scan-button"
                    disabled={storageMaintenanceBusy || reliabilityStatus === "unavailable"}
                    type="button"
                    onClick={() => setStorageMaintenancePending(true)}
                  >
                    <Database size={17} />
                    <span>{storageMaintenanceBusy ? "正在整理" : "整理历史"}</span>
                  </button>
                </div>
              </div>

              {storageMaintenancePending && storageDiagnostics ? (
                <div className="storage-maintenance-confirm">
                  <div>
                    <strong>整理数据库历史</strong>
                    <span>
                      操作前会先创建压缩安全快照；每个对象保留最近 {storageDiagnostics.versionRetention} 个版本，
                      整库快照保留最近 {storageDiagnostics.snapshotRetention} 份，然后回收数据库空闲空间。
                      当前预计可整理 {storageDiagnostics.maintenanceReclaimableVersions} 个对象版本和 {storageDiagnostics.maintenanceReclaimableSnapshots} 个整库快照，
                      原始历史正文约 {formatFileSize(storageDiagnostics.maintenanceReclaimableBytes)}。
                    </span>
                  </div>
                  <div>
                    <button type="button" onClick={() => void maintainWorkspaceStorage()}>
                      开始整理
                    </button>
                    <button type="button" onClick={() => setStorageMaintenancePending(false)}>
                      取消
                    </button>
                  </div>
                </div>
              ) : null}

              {storageDiagnostics ? (
                <>
                  <div className="storage-diagnostic-grid">
                    <div>
                      <Database size={18} />
                      <span>Schema</span>
                      <strong>{storageDiagnostics.schemaVersion}</strong>
                    </div>
                    <div>
                      <Boxes size={18} />
                      <span>对象行</span>
                      <strong>{storageDiagnostics.itemCount}</strong>
                    </div>
                    <div>
                      <History size={18} />
                      <span>对象版本</span>
                      <strong>{storageDiagnostics.versionCount}</strong>
                    </div>
                    <div>
                      <HardDrive size={18} />
                      <span>版本正文</span>
                      <strong>{formatFileSize(storageDiagnostics.versionBytes)}</strong>
                    </div>
                    <div>
                      <ArchiveRestore size={18} />
                      <span>整库快照</span>
                      <strong>
                        {storageDiagnostics.snapshotCount} · {formatFileSize(storageDiagnostics.snapshotBytes)}
                      </strong>
                    </div>
                    <div>
                      <Search size={18} />
                      <span>FTS 覆盖</span>
                      <strong>
                        {storageDiagnostics.ftsAvailable
                          ? `${storageDiagnostics.searchCount}/${storageDiagnostics.itemCount}`
                          : "不可用"}
                      </strong>
                    </div>
                    <div>
                      <HardDrive size={18} />
                      <span>数据库</span>
                      <strong>{formatFileSize(storageDiagnostics.dbSize)}</strong>
                    </div>
                    <div>
                      <Save size={18} />
                      <span>WAL</span>
                      <strong>{formatFileSize(storageDiagnostics.walSize)}</strong>
                    </div>
                  </div>

                  <div
                    className={`storage-diagnostic-state ${storageDiagnostics.ok ? "is-clear" : "needs-attention"}`}
                  >
                    {storageDiagnostics.ok ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <AlertTriangle size={19} />
                    )}
                    <div>
                      <strong>
                        {storageDiagnostics.ok ? "数据库完整性检查通过" : "数据库需要处理"}
                      </strong>
                      <span>
                        quick_check: {storageDiagnostics.quickCheck} · 损坏对象 {storageDiagnostics.invalidItems.length} · 重复 ID {storageDiagnostics.duplicates.length} · FTS 映射 {storageDiagnostics.searchMapCount}
                      </span>
                    </div>
                  </div>

                  <div className="storage-diagnostic-details">
                    <div>
                      <span>应用版本</span>
                      <strong>{storeInfo?.appVersion ? `Worldcraft Codex ${storeInfo.appVersion}` : "桌面版"}</strong>
                    </div>
                    <div>
                      <span>存储格式</span>
                      <strong>{storageDiagnostics.storageFormat || "尚未初始化"}</strong>
                    </div>
                    <div>
                      <span>最近迁移</span>
                      <strong>
                        {storageDiagnostics.lastMigration
                          ? `${storageDiagnostics.lastMigration.from} → ${storageDiagnostics.lastMigration.to} · ${formatDateLabel(storageDiagnostics.lastMigration.completedAt)}`
                          : "当前数据库无需迁移"}
                      </strong>
                    </div>
                    <div>
                      <span>迁移保护副本</span>
                      <strong>
                        {storageDiagnostics.migrationBackups[0]
                          ? `${formatDateLabel(storageDiagnostics.migrationBackups[0].createdAt)} · ${formatFileSize(storageDiagnostics.migrationBackups[0].size)}`
                          : "尚无迁移副本"}
                      </strong>
                    </div>
                  </div>
                  {storageDiagnostics.migrationBackups[0] ? (
                    <div className="migration-rollback-row">
                      <span>恢复前会再次保护当前数据库，失败时自动回到现状。</span>
                      <button
                        type="button"
                        onClick={() =>
                          void restoreMigrationDatabase(
                            storageDiagnostics.migrationBackups[0].fileName
                          )
                        }
                      >
                        <ArchiveRestore size={16} />
                        <span>恢复迁移副本</span>
                      </button>
                    </div>
                  ) : null}
                  {diagnosticsMessage ? (
                    <div className="storage-diagnostic-message">{diagnosticsMessage}</div>
                  ) : null}
                </>
              ) : (
                <div className="health-clear-state">
                  <Database size={30} />
                  <strong>点击重新检查读取 SQLite 诊断</strong>
                </div>
              )}
            </div>

            <ReleasePanel />

            <div className="panel object-history-panel">
              <div className="panel-heading">
                <div>
                  <h2>项目对象历史</h2>
                  <p>{objectVersions.length} 个最近版本 · 所有核心集合</p>
                </div>
                <History size={21} />
              </div>
              <div className="object-history-toolbar">
                <label className="search-box">
                  <Search size={16} />
                  <input
                    aria-label="搜索对象历史"
                    placeholder="搜索对象、类型或保存原因"
                    value={historyQuery}
                    onChange={(event) => setHistoryQuery(event.target.value)}
                  />
                </label>
                <select
                  aria-label="历史对象类型"
                  value={historyCollection}
                  onChange={(event) =>
                    setHistoryCollection(event.target.value as WorkspaceCollection | "all")
                  }
                >
                  <option value="all">全部类型</option>
                  {historyCollections.map(([collection, label]) => (
                    <option key={collection} value={collection}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="object-history-list">
                {filteredObjectVersions.length ? (
                  filteredObjectVersions.slice(0, 80).map((version) => (
                    <div className="object-history-row" key={version.id}>
                      <span className="object-history-kind">{version.collectionLabel}</span>
                      <span className="object-history-copy">
                        <strong>{version.label}</strong>
                        <small>
                          {versionReasonLabel(version.reason)} · {formatDateLabel(version.createdAt)}
                        </small>
                      </span>
                      <button
                        title={`恢复${version.collectionLabel}版本`}
                        type="button"
                        onClick={() => void restoreObjectVersion(version)}
                      >
                        <ArchiveRestore size={16} />
                        <span>恢复</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="backup-empty-state">
                    <History size={30} />
                    <strong>没有匹配的对象历史</strong>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "permissions" && (
          <section className="permissions-layout">
            <div className="panel permissions-panel">
              <div className="panel-heading">
                <div>
                  <h2>世界权限</h2>
                  <p>{worldMembers.length} 个成员</p>
                </div>
                <Shield size={22} />
              </div>

              <div className="visibility-grid">
                {(["private", "shared", "public"] as const).map((visibility) => {
                  const Icon = visibilityMeta[visibility].icon;
                  return (
                    <button
                      className={activeWorld.visibility === visibility ? "is-active" : ""}
                      key={visibility}
                      type="button"
                      onClick={() => updateWorld({ visibility })}
                    >
                      <Icon size={20} />
                      <strong>{visibilityMeta[visibility].label}</strong>
                      <span>{visibilityMeta[visibility].helper}</span>
                    </button>
                  );
                })}
              </div>

              <div className="member-form">
                <input
                  value={memberDraft}
                  onChange={(event) => setMemberDraft(event.target.value)}
                  placeholder="成员邮箱或昵称"
                />
                <button type="button" onClick={addMember}>
                  <Plus size={17} />
                  <span>添加成员</span>
                </button>
              </div>
            </div>

            <div className="member-grid">
              {worldMembers.map((member) => (
                <div className="member-card" data-member-id={member.id} key={member.id}>
                  <div className="avatar">{member.name.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <h3>{member.name}</h3>
                    <p>{member.email}</p>
                  </div>
                  <select
                    value={member.role}
                    onChange={(event) => updateMember(member.id, event.target.value as Role)}
                  >
                    {(Object.keys(roleLabels) as Role[]).map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "export" && exportPayload && (
          <section className="export-layout">
            <div className="panel export-panel">
              <div className="panel-heading">
                <div>
                  <h2>本地导出</h2>
                  <p>保存完整工程，或生成安全的交接资料</p>
                </div>
                <Download size={22} />
              </div>

              <div className="export-actions">
                <button type="button" onClick={saveProjectFile}>
                  <Save size={18} />
                  <span>保存完整工程包</span>
                </button>
                <button type="button" onClick={openProjectFile}>
                  <FolderOpen size={18} />
                  <span>打开工程包</span>
                </button>
                <button type="button" onClick={createManualBackup}>
                  <History size={18} />
                  <span>创建快速快照</span>
                </button>
                <button type="button" onClick={importContentFile}>
                  <Upload size={18} />
                  <span>导入 JSON / Markdown</span>
                </button>
                <button type="button" onClick={importLegacyLocalData}>
                  <Database size={18} />
                  <span>导入旧数据</span>
                </button>
                <button type="button" onClick={exportJson}>
                  <Download size={18} />
                  <span>导出 JSON</span>
                </button>
                <button type="button" onClick={exportMarkdown}>
                  <FileText size={18} />
                  <span>导出 Markdown</span>
                </button>
              </div>

              <div className="export-safety-note">
                <ShieldCheck size={19} />
                <div>
                  <strong>发布导出已自动净化</strong>
                  <span>JSON、Markdown 和右侧预览默认排除秘密内容；.wcodex 工程包包含数据库内容与本地资源，只用于继续创作和完整备份。</span>
                </div>
              </div>

              <div className="storage-facts">
                <Fact icon={Database} label="数据库" value={storeInfo?.dbPath ?? "浏览器本地存储"} />
                <Fact icon={History} label="备份目录" value={storeInfo?.backupDir ?? "未启用"} />
                <Fact icon={Save} label="完整工程包" value={storeInfo?.lastProjectPath ?? "未另存"} />
              </div>

              <div className="export-summary-grid">
                <Metric icon={FileText} label="条目" value={exportPayload.entities.length.toString()} />
                <Metric icon={Boxes} label="设定模板" value={exportPayload.entityTemplates.length.toString()} />
                <Metric icon={Route} label="任务线" value={exportPayload.quests.length.toString()} />
                <Metric icon={MessagesSquare} label="剧情场景" value={exportPayload.storyScenes.length.toString()} />
                <Metric icon={Variable} label="剧情变量" value={exportPayload.storyVariables.length.toString()} />
                <Metric icon={FlaskConical} label="测试记录" value={exportPayload.storyTestRuns.length.toString()} />
                <Metric icon={AlertTriangle} label="审阅问题" value={exportPayload.storyReviewIssues.length.toString()} />
                <Metric icon={Flag} label="叙事里程碑" value={exportPayload.narrativeMilestones.length.toString()} />
                <Metric icon={Network} label="关系" value={exportPayload.relations.length.toString()} />
                <Metric icon={Library} label="资源" value={exportPayload.assets.length.toString()} />
                <Metric icon={Map} label="地图" value={exportPayload.maps.length.toString()} />
                <Metric icon={Layers3} label="地图图层" value={exportPayload.mapLayers.length.toString()} />
                <Metric icon={FolderTree} label="标记组" value={exportPayload.mapMarkerGroups.length.toString()} />
                <Metric icon={MapPin} label="地图标记" value={exportPayload.mapMarkers.length.toString()} />
                <Metric icon={Route} label="地图路线" value={exportPayload.mapRoutes.length.toString()} />
                <Metric icon={CircleDot} label="时间轨道" value={exportPayload.timelineTracks.length.toString()} />
                <Metric icon={CalendarDays} label="时间点" value={exportPayload.timelineEvents.length.toString()} />
                <Metric icon={ScanSearch} label="一致性发现" value={exportPayload.consistencyFindings.length.toString()} />
                <Metric icon={History} label="一致性扫描" value={exportPayload.consistencyScans.length.toString()} />
              </div>
            </div>

            <div className="panel export-preview-panel">
              <div className="panel-heading compact">
                <div>
                  <h2>JSON 预览</h2>
                  <p>显示 JSON / Markdown 共用的安全发布数据，不代表完整项目文件内容</p>
                </div>
                <FileText size={20} />
              </div>
              <pre className="export-preview">{JSON.stringify(exportPayload, null, 2)}</pre>
            </div>
          </section>
        )}
      </section>
      {visualFullscreen === "dependency" ? (
        <VisualFullscreenDialog
          subtitle="箭头从前置任务指向后续任务"
          title="世界任务依赖图"
          onClose={() => setVisualFullscreen(null)}
        >
          <QuestDependencyGraph
            entitiesById={questEntityNames}
            quests={questVisuals}
            selectedQuestId={selectedQuest?.id ?? ""}
            onSelectQuest={setSelectedQuestId}
          />
        </VisualFullscreenDialog>
      ) : null}
      {visualFullscreen === "branch" && selectedQuest ? (
        <VisualFullscreenDialog
          subtitle={selectedQuest.title}
          title="任务线分支图"
          onClose={() => setVisualFullscreen(null)}
        >
          <QuestBranchTree
            quest={{
              ...selectedQuest,
              status: questStatusMeta[selectedQuest.status].label,
              participantIds: []
            }}
          />
        </VisualFullscreenDialog>
      ) : null}
      {visualFullscreen === "relation" ? (
        <VisualFullscreenDialog
          subtitle={`${relationVisibleEntities.length} 个条目 · ${visibleGraphRelations.length} 条关系`}
          title="世界关系图"
          onClose={() => setVisualFullscreen(null)}
        >
          <div className="relation-fullscreen-workspace">
            <RelationGraph
              entities={relationVisibleEntities}
              focusedEntityId={focusedRelationEntity?.id ?? ""}
              relations={visibleGraphRelations}
              selectedRelationId={selectedRelation?.id ?? ""}
              onOpenEntity={openRelationEntity}
              onSelectEntity={selectRelationEntity}
              onSelectRelation={selectRelation}
            />

            <aside aria-label="关系图详情" className="relation-fullscreen-inspector">
              <div className="relation-fullscreen-inspector-tabs" role="tablist">
                <button
                  aria-selected={relationInspectorMode === "entity" || !selectedRelation}
                  className={relationInspectorMode === "entity" || !selectedRelation ? "is-active" : ""}
                  disabled={!focusedRelationEntity}
                  role="tab"
                  type="button"
                  onClick={() => setRelationInspectorMode("entity")}
                >
                  条目
                </button>
                <button
                  aria-selected={relationInspectorMode === "relation" && Boolean(selectedRelation)}
                  className={relationInspectorMode === "relation" && selectedRelation ? "is-active" : ""}
                  disabled={!selectedRelation}
                  role="tab"
                  type="button"
                  onClick={() => setRelationInspectorMode("relation")}
                >
                  关系
                </button>
              </div>

              {relationInspectorMode === "entity" || !selectedRelation ? (
                focusedRelationEntity ? (
                  <div className="relation-fullscreen-inspector-body">
                    <header>
                      <span>当前条目</span>
                      <h3>{focusedRelationEntity.title}</h3>
                      <p>
                        {entityTypeMeta[focusedRelationEntity.type].label} · {focusedEntityRelations.length} 条关系
                      </p>
                    </header>

                    {focusedRelationEntity.summary ? (
                      <p className="relation-fullscreen-summary">{focusedRelationEntity.summary}</p>
                    ) : null}

                    <section className="relation-fullscreen-related">
                      <h4>相关关系</h4>
                      {focusedEntityRelations.length ? (
                        <div>
                          {focusedEntityRelations.map((relation) => {
                            const otherId =
                              relation.sourceEntityId === focusedRelationEntity.id
                                ? relation.targetEntityId
                                : relation.sourceEntityId;
                            return (
                              <button
                                key={relation.id}
                                type="button"
                                onClick={() => selectRelation(relation.id)}
                              >
                                <span>{relation.label}</span>
                                <strong>{getEntityTitle(worldEntities, otherId)}</strong>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p>暂无显式关系</p>
                      )}
                    </section>

                    <button
                      className="relation-fullscreen-primary-action"
                      type="button"
                      onClick={() => openRelationEntity(focusedRelationEntity.id)}
                    >
                      <BookOpen size={16} />
                      <span>打开条目</span>
                    </button>
                  </div>
                ) : null
              ) : selectedRelation ? (
                <div className="relation-fullscreen-inspector-body">
                  <header>
                    <span>已选关系</span>
                    <h3>{selectedRelation.label}</h3>
                    <p>{relationKindMeta[selectedRelation.kind].helper}</p>
                  </header>

                  <div className="relation-fullscreen-endpoints">
                    <button
                      aria-label={`查看起点条目 ${selectedRelationSource?.title ?? "缺失条目"}`}
                      type="button"
                      onClick={() => selectRelationEntity(selectedRelation.sourceEntityId)}
                    >
                      <small>起点</small>
                      <strong>{selectedRelationSource?.title ?? "缺失条目"}</strong>
                    </button>
                    <span className="relation-fullscreen-direction">
                      {selectedRelation.direction === "directed" ? (
                        <ArrowRight size={18} />
                      ) : (
                        <ArrowLeftRight size={18} />
                      )}
                      <small>{selectedRelation.direction === "directed" ? "单向" : selectedRelation.direction === "mutual" ? "互向" : "双向"}</small>
                    </span>
                    <button
                      aria-label={`查看终点条目 ${selectedRelationTarget?.title ?? "缺失条目"}`}
                      type="button"
                      onClick={() => selectRelationEntity(selectedRelation.targetEntityId)}
                    >
                      <small>终点</small>
                      <strong>{selectedRelationTarget?.title ?? "缺失条目"}</strong>
                    </button>
                  </div>

                  <dl className="relation-fullscreen-meta">
                    <div>
                      <dt>关系类型</dt>
                      <dd>{relationKindMeta[selectedRelation.kind].label}</dd>
                    </div>
                    <div>
                      <dt>关系强度</dt>
                      <dd
                        aria-label={`关系强度 ${selectedRelation.strength} / 5`}
                        className="relation-fullscreen-strength"
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <span
                            className={level <= selectedRelation.strength ? "is-active" : ""}
                            key={level}
                          />
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt>证据类型</dt>
                      <dd>
                        {relationEvidenceTypeMeta[
                          selectedRelation.evidenceType ?? "unspecified"
                        ]}
                      </dd>
                    </div>
                    <div>
                      <dt>可信度</dt>
                      <dd>
                        {relationConfidenceMeta[
                          selectedRelation.confidence ?? "unspecified"
                        ]}
                      </dd>
                    </div>
                    <div>
                      <dt>适用年代</dt>
                      <dd>{selectedRelation.historicalScope?.trim() || "未填写"}</dd>
                    </div>
                  </dl>

                  <section className="relation-fullscreen-notes">
                    <h4>原典出处</h4>
                    <p>{selectedRelation.sourceCitation?.trim() || "未填写"}</p>
                  </section>

                  <section className="relation-fullscreen-notes">
                    <h4>关系备注</h4>
                    <p>{selectedRelation.notes.trim() || "暂无备注"}</p>
                  </section>

                  <button
                    className="relation-fullscreen-primary-action"
                    type="button"
                    onClick={editSelectedRelationFromGraph}
                  >
                    <Settings2 size={16} />
                    <span>编辑这条关系</span>
                  </button>
                </div>
              ) : null}
            </aside>
          </div>
        </VisualFullscreenDialog>
      ) : null}
      {impactDialogOpen && selectedEntityImpact ? (
        <ChangeImpactDialog
          report={selectedEntityImpact}
          onClose={() => setImpactDialogOpen(false)}
          onOpen={(reference) => {
            setImpactDialogOpen(false);
            openBackReference(reference);
          }}
        />
      ) : null}
      <CreateContentDialog
        categories={worldCodexCategories}
        initialCategoryId={createContentState.categoryId}
        initialKind={createContentState.kind}
        open={createContentState.open}
        templates={worldEntityTemplates}
        onClose={() => {
          setPendingReferenceCreation(null);
          setCreateContentState((current) => ({ ...current, open: false }));
        }}
        onCreate={commitCreateContent}
      />
      <CategoryDialog
        categories={worldCodexCategories}
        category={editingCodexCategory}
        initialParentId={categoryDialogState.parentId}
        open={categoryDialogState.open}
        onClose={() =>
          setCategoryDialogState((current) => ({ ...current, open: false }))
        }
        onSubmit={submitCategoryDialog}
      />
      <StarterPackDialog
        busy={starterPackBusy}
        firstRun={starterPackMode === "first-run"}
        open={starterPackMode !== null}
        onClose={() => setStarterPackMode(null)}
        onCreate={createStarterProject}
      />
      <WorldDeleteDialog
        busy={worldOperationBusy === "delete"}
        counts={worldDeleteCounts}
        world={worldDeleteTarget}
        onClose={() => {
          if (worldOperationBusy !== "delete") setWorldDeleteTargetId("");
        }}
        onConfirm={(worldId) => void deleteWorldPermanently(worldId)}
      />
      <GlobalSearchDialog
        open={globalSearchOpen}
        results={globalSearchResults}
        worldName={activeWorld.name}
        onClose={() => setGlobalSearchOpen(false)}
        onIndexedSearch={searchWorkspaceIndex}
        onSelect={openSearchResult}
      />
    </main>
    </InlineAiProvider>
  );
}

function countLinks(entities: Entity[]) {
  return entities.reduce((total, entity) => total + extractMentions(entity.content).length, 0);
}

function countMarkers(markers: MapMarker[], entityId: string) {
  return markers.filter((marker) => marker.entityId === entityId).length.toString();
}

function Metric({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="metric">
      <Icon size={18} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={active ? "is-active" : ""}
      data-label={label}
      title={label}
      type="button"
      onClick={onClick}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function EntityListItem({
  active,
  entity,
  onClick
}: {
  active: boolean;
  entity: Entity;
  onClick: () => void;
}) {
  const meta = entityTypeMeta[entity.type];
  const Icon = meta.icon;
  const VisibilityIcon = visibilityMeta[entity.visibility].icon;

  return (
    <button className={`entity-card ${active ? "is-active" : ""}`} type="button" onClick={onClick}>
      <div className={`entity-icon icon-${meta.accent}`}>
        <Icon size={17} />
      </div>
      <div>
        <div className="entity-card-title">
          <strong>{entity.title}</strong>
          <VisibilityIcon size={14} />
        </div>
        <p>{entity.summary}</p>
        <div className="tag-row">
          {entity.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

function EntityEditor({
  assets,
  categories,
  entities,
  entity,
  referenceOptions,
  template,
  templates,
  timelineEvent,
  worldName,
  locationRequest,
  onCategoryChange,
  onCreateEntity,
  onTagsChange,
  onTimelineChange,
  onUpdate,
  onUpdateTemplate
}: {
  assets: WorldAsset[];
  categories: CodexCategory[];
  entities: Entity[];
  entity: Entity;
  referenceOptions: ProjectReferenceOption[];
  template: EntityTemplateDefinition | null;
  templates: EntityTemplateDefinition[];
  timelineEvent: TimelineEvent | null | undefined;
  worldName: string;
  locationRequest: ReferenceLocationRequest | null;
  onCategoryChange: (categoryId: string) => void;
  onCreateEntity: (type?: EntityType) => void;
  onTagsChange: (value: string) => void;
  onTimelineChange: (eventId: string, patch: Partial<TimelineEvent>) => void;
  onUpdate: (patch: Partial<Entity>) => void;
  onUpdateTemplate: (key: string, value: string) => void;
}) {
  const TypeIcon = entityTypeMeta[entity.type].icon;
  const [activeSection, setActiveSection] = useState<"content" | "prompts" | "settings" | "preview">("content");

  useEffect(() => {
    setActiveSection("content");
  }, [entity.id]);

  useEffect(() => {
    if (
      locationRequest?.source.kind !== "entity" ||
      locationRequest.source.id !== entity.id
    ) {
      return;
    }
    setActiveSection(
      locationRequest.anchor.path.startsWith("templateData.") ? "prompts" : "content"
    );
  }, [entity.id, locationRequest?.token]);

  return (
    <>
      <div className="editor-toolbar">
        <div className={`large-entity-icon icon-${entityTypeMeta[entity.type].accent}`}>
          <TypeIcon size={24} />
        </div>
        <div className="editor-title-group">
          <input
            aria-label="条目标题"
            className="entity-title-input"
            value={entity.title}
            onChange={(event) => onUpdate({ title: event.target.value })}
          />
          <div className="editor-meta-row">
            <select
              value={entity.type}
              onChange={(event) => onUpdate({ type: event.target.value as EntityType })}
            >
              {(Object.keys(entityTypeMeta) as EntityType[]).map((type) => (
                <option key={type} value={type}>
                  {entityTypeMeta[type].label}
                </option>
              ))}
            </select>
            <select
              aria-label="条目可见性"
              value={entity.visibility}
              onChange={(event) => onUpdate({ visibility: event.target.value as Visibility })}
            >
              {(Object.keys(visibilityMeta) as Visibility[]).map((visibility) => (
                <option key={visibility} value={visibility}>
                  {visibilityMeta[visibility].label}
                </option>
              ))}
            </select>
            <button
              aria-label="创建条目"
              className="editor-create-button"
              title="创建条目"
              type="button"
              onClick={() => onCreateEntity()}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="entity-editor-tabs" role="tablist" aria-label="条目编辑分区">
        <button
          aria-selected={activeSection === "content"}
          className={activeSection === "content" ? "is-active" : ""}
          role="tab"
          type="button"
          onClick={() => setActiveSection("content")}
        >
          正文
        </button>
        <button
          aria-selected={activeSection === "prompts"}
          className={activeSection === "prompts" ? "is-active" : ""}
          role="tab"
          type="button"
          onClick={() => setActiveSection("prompts")}
        >
          资料
        </button>
        <button
          aria-selected={activeSection === "settings"}
          className={activeSection === "settings" ? "is-active" : ""}
          role="tab"
          type="button"
          onClick={() => setActiveSection("settings")}
        >
          设置
        </button>
        <button
          aria-selected={activeSection === "preview"}
          className={activeSection === "preview" ? "is-active" : ""}
          role="tab"
          type="button"
          onClick={() => setActiveSection("preview")}
        >
          预览
        </button>
      </div>

      {activeSection === "content" ? (
        <section className="entity-editor-section" role="tabpanel">
          <ExpandableTextareaField
            aiTarget={{
              worldId: entity.worldId,
              kind: "entity",
              objectId: entity.id,
              contextId: `entity:${entity.id}`,
              fieldPath: "summary",
              fieldLabel: "摘要",
              format: "plain"
            }}
            label="摘要"
            referencePath="summary"
            referenceSource={{ kind: "entity", id: entity.id }}
            rows={3}
            value={entity.summary}
            onChange={(value) => onUpdate({ summary: value })}
          />
          <div
            className="field rich-content-field"
            data-reference-path="content"
            data-reference-source-id={entity.id}
            data-reference-source-kind="entity"
          >
            <span>正文</span>
            <RichTextEditor
              aiTarget={{
                worldId: entity.worldId,
                kind: "entity",
                objectId: entity.id,
                contextId: `entity:${entity.id}`,
                fieldPath: "content",
                fieldLabel: "正文",
                format: "rich-text"
              }}
              assets={assets
                .filter((asset) => ["image", "map", "concept"].includes(asset.kind))
                .map((asset) => ({
                  id: asset.id,
                  name: asset.name,
                  url: getAssetUrl(asset.storedName)
                }))}
              content={entity.content}
              entities={entities.map((item) => ({
                id: item.id,
                title: item.title,
                type: item.type
              }))}
              entityId={entity.id}
              references={referenceOptions}
              sectionTitle={`${entity.title} / 正文`}
              tags={Array.from(new Set(entities.flatMap((item) => item.tags)))}
              onChange={(content) => onUpdate({ content })}
            />
          </div>
        </section>
      ) : null}

      {activeSection === "prompts" ? (
        <section className="entity-editor-section" role="tabpanel">
          {(template?.fields ?? []).length ? (
            <div className="template-grid">
              {(template?.fields ?? []).map((field) => {
                const label = `${field.label}${field.required ? " *" : ""}${field.secret ? " · 秘密" : ""}`;
                if (field.type === "textarea") {
                  return (
                    <ExpandableTextareaField
                      aiTarget={field.secret ? undefined : {
                        worldId: entity.worldId,
                        kind: "entity",
                        objectId: entity.id,
                        contextId: `entity:${entity.id}`,
                        fieldPath: `templateData.${field.key}`,
                        fieldLabel: field.label,
                        format: "plain"
                      }}
                      key={field.id}
                      label={label}
                      referencePath={`templateData.${field.key}`}
                      referenceSource={{ kind: "entity", id: entity.id }}
                      rows={4}
                      value={entity.templateData[field.key] ?? ""}
                      onChange={(value) => onUpdateTemplate(field.key, value)}
                    />
                  );
                }

                return (
                  <Field
                    key={field.id}
                    label={label}
                    referencePath={`templateData.${field.key}`}
                    referenceSource={{ kind: "entity", id: entity.id }}
                  >
                    {field.type === "boolean" ? (
                      <label className="template-boolean-control">
                        <input
                          checked={(entity.templateData[field.key] ?? field.defaultValue) === "true"}
                          type="checkbox"
                          onChange={(event) => onUpdateTemplate(field.key, String(event.target.checked))}
                        />
                        <span>{(entity.templateData[field.key] ?? field.defaultValue) === "true" ? "开启" : "关闭"}</span>
                      </label>
                    ) : field.type === "select" ? (
                      <select
                        value={entity.templateData[field.key] ?? field.defaultValue}
                        onChange={(event) => onUpdateTemplate(field.key, event.target.value)}
                      >
                        <option value="">未选择</option>
                        {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : field.type === "entity_ref" ? (
                      <select
                        value={entity.templateData[field.key] ?? ""}
                        onChange={(event) => onUpdateTemplate(field.key, event.target.value)}
                      >
                        <option value="">未关联</option>
                        {entity.templateData[field.key] && !entities.some((item) => item.id === entity.templateData[field.key]) ? (
                          <option value={entity.templateData[field.key]}>原值：{entity.templateData[field.key]}</option>
                        ) : null}
                        {entities
                          .filter((item) => !field.targetEntityTypes.length || field.targetEntityTypes.includes(item.type))
                          .map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        value={entity.templateData[field.key] ?? ""}
                        onChange={(event) => onUpdateTemplate(field.key, event.target.value)}
                      />
                    )}
                  </Field>
                );
              })}
            </div>
          ) : (
            <div className="entity-section-empty">
              <Boxes size={24} />
              <span>当前模板没有资料字段</span>
            </div>
          )}

          {entity.type === "event" && timelineEvent ? (
            <div className="timeline-inline">
              <Field label="时间线显示">
                <input
                  value={timelineEvent.displayDate}
                  onChange={(event) =>
                    onTimelineChange(timelineEvent.id, { displayDate: event.target.value })
                  }
                />
              </Field>
              <Field label="排序值">
                <input
                  type="number"
                  value={timelineEvent.sortOrder}
                  onChange={(event) =>
                    onTimelineChange(timelineEvent.id, { sortOrder: Number(event.target.value) })
                  }
                />
              </Field>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeSection === "settings" ? (
        <section className="entity-editor-section entity-editor-settings" role="tabpanel">
          <Field label="所在分类">
            <select
              aria-label="所在分类"
              value={entity.categoryId}
              onChange={(event) => onCategoryChange(event.target.value)}
            >
              <option value="">未归类</option>
              {flattenCodexCategories(categories).map(({ category, depth }) => (
                <option key={category.id} value={category.id}>
                  {`${"　".repeat(depth)}${category.title}`}
                </option>
              ))}
            </select>
          </Field>
          <Field label="标签">
            <div className="input-with-icon">
              <Tags size={16} />
              <input value={entity.tags.join("，")} onChange={(event) => onTagsChange(event.target.value)} />
            </div>
          </Field>
          <Field label="条目模板">
            <select
              aria-label="条目模板"
              value={template?.id ?? ""}
              onChange={(event) => {
                const nextTemplate = templates.find((item) => item.id === event.target.value) ?? null;
                onUpdate({
                  templateId: nextTemplate?.id,
                  templateData: applyTemplateDefaults(nextTemplate, entity.templateData)
                });
              }}
            >
              <option value="">不使用模板</option>
              {templates
                .filter((item) => item.entityTypes.includes(entity.type))
                .map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
            </select>
          </Field>
        </section>
      ) : null}

      {activeSection === "preview" ? (
        <section className="entity-editor-section entity-publication-section" role="tabpanel">
          <PublicationPreview
            entity={entity}
            entityNames={Object.fromEntries(entities.map((item) => [item.id, item.title]))}
            template={template}
            typeLabel={entityTypeMeta[entity.type].label}
            visibilityLabel={visibilityMeta[entity.visibility].label}
            worldName={worldName}
          />
        </section>
      ) : null}
    </>
  );
}

function QuestEditor({
  entities,
  onAddStep,
  onMaximizeBranch,
  onRemoveStep,
  onToggleEntity,
  onTogglePrerequisite,
  onUpdate,
  onUpdateStep,
  quest,
  questEntities,
  quests
}: {
  entities: Entity[];
  onAddStep: () => void;
  onMaximizeBranch: () => void;
  onRemoveStep: (stepId: string) => void;
  onToggleEntity: (entityId: string) => void;
  onTogglePrerequisite: (questId: string) => void;
  onUpdate: (patch: Partial<QuestLine>) => void;
  onUpdateStep: (stepId: string, patch: Partial<QuestStep>) => void;
  quest: QuestLine;
  questEntities: Entity[];
  quests: QuestLine[];
}) {
  const explicitEntityIds = new Set(quest.relatedEntityIds);
  const candidateEntities = entities.filter((entity) =>
    ["character", "location", "faction", "event", "item"].includes(entity.type)
  );
  const otherQuests = quests.filter((item) => item.id !== quest.id);
  const aiTarget = (fieldPath: string, fieldLabel: string): InlineAiTarget => ({
    worldId: quest.worldId,
    kind: "quest",
    objectId: quest.id,
    contextId: `quest:${quest.id}`,
    fieldPath,
    fieldLabel,
    format: "plain"
  });

  return (
    <>
      <div className="quest-editor-header">
        <div className="large-entity-icon icon-amber">
          <Route size={24} />
        </div>
        <div className="editor-title-group">
          <input
            aria-label="任务线标题"
            className="entity-title-input"
            value={quest.title}
            onChange={(event) => onUpdate({ title: event.target.value })}
          />
          <div className="editor-meta-row">
            <select
              aria-label="任务分类"
              value={quest.category}
              onChange={(event) => onUpdate({ category: event.target.value as QuestCategory })}
            >
              {(Object.keys(questCategoryMeta) as QuestCategory[]).map((category) => (
                <option key={category} value={category}>
                  {questCategoryMeta[category].label}
                </option>
              ))}
            </select>
            <select
              aria-label="任务状态"
              value={quest.status}
              onChange={(event) => onUpdate({ status: event.target.value as QuestStatus })}
            >
              {(Object.keys(questStatusMeta) as QuestStatus[]).map((status) => (
                <option key={status} value={status}>
                  {questStatusMeta[status].label}
                </option>
              ))}
            </select>
            <button type="button" onClick={onAddStep}>
              <Plus size={16} />
              <span>添加步骤</span>
            </button>
          </div>
        </div>
      </div>

      <Field
        label="任务简介"
        referencePath="summary"
        referenceSource={{ kind: "quest", id: quest.id }}
      >
        <InlineAiTextarea
          aiTarget={aiTarget("summary", "任务简介")}
          value={quest.summary}
          onChange={(value) => onUpdate({ summary: value })}
          rows={3}
        />
      </Field>

      <Field
        label="触发条件"
        referencePath="trigger"
        referenceSource={{ kind: "quest", id: quest.id }}
      >
        <InlineAiTextarea
          aiTarget={aiTarget("trigger", "触发条件")}
          value={quest.trigger}
          onChange={(value) => onUpdate({ trigger: value })}
          placeholder="例如：玩家在 [[边境城雾鸦堡]] 完成序章后触发"
          rows={3}
        />
      </Field>

      <QuestFlowGraph
        quest={quest}
        quests={quests}
        onMaximize={onMaximizeBranch}
      />

      <div className="quest-picker-grid">
        <div
          className="quest-picker"
          data-reference-path="relatedEntityIds"
          data-reference-source-id={quest.id}
          data-reference-source-kind="quest"
        >
          <div className="subsection-title">
            <UsersRound size={16} />
            <span>手动关联条目</span>
          </div>
          <div className="chip-grid">
            {candidateEntities.map((entity) => {
              const Icon = entityTypeMeta[entity.type].icon;
              return (
                <button
                  className={explicitEntityIds.has(entity.id) ? "is-active" : ""}
                  key={entity.id}
                  type="button"
                  onClick={() => onToggleEntity(entity.id)}
                >
                  <Icon size={15} />
                  <span>{entity.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="quest-picker"
          data-reference-path="prerequisiteQuestIds"
          data-reference-source-id={quest.id}
          data-reference-source-kind="quest"
        >
          <div className="subsection-title">
            <GitBranch size={16} />
            <span>前置任务</span>
          </div>
          <div className="chip-grid">
            {otherQuests.length ? (
              otherQuests.map((item) => (
                <button
                  className={quest.prerequisiteQuestIds.includes(item.id) ? "is-active" : ""}
                  key={item.id}
                  type="button"
                  onClick={() => onTogglePrerequisite(item.id)}
                >
                  <GitBranch size={15} />
                  <span>{item.title}</span>
                </button>
              ))
            ) : (
              <p className="muted-text">暂无其他任务</p>
            )}
          </div>
        </div>
      </div>

      <div className="quest-related-strip">
        <span>自动/手动关联：</span>
        {questEntities.length ? (
          questEntities.map((entity) => (
            <span className="relation-token" key={entity.id}>
              {entity.title}
            </span>
          ))
        ) : (
          <span className="muted-text">暂无关联条目</span>
        )}
      </div>

      <div className="quest-steps">
        <div className="subsection-title">
          <ListChecks size={16} />
          <span>任务步骤、分支、条件、奖励</span>
        </div>
        {quest.steps.map((step, index) => (
          <div className="quest-step-card" key={step.id}>
            <div className="quest-step-heading">
              <strong>步骤 {index + 1}</strong>
              <button type="button" onClick={() => onRemoveStep(step.id)}>
                移除
              </button>
            </div>
            <Field label="步骤标题">
              <input
                value={step.title}
                onChange={(event) => onUpdateStep(step.id, { title: event.target.value })}
              />
            </Field>
            <Field
              label="目标"
              referencePath={`steps[${index}].objective`}
              referenceSource={{ kind: "quest", id: quest.id }}
            >
              <InlineAiTextarea
                aiTarget={aiTarget(`steps[${index}].objective`, `步骤 ${index + 1} · 目标`)}
                value={step.objective}
                onChange={(value) => onUpdateStep(step.id, { objective: value })}
                placeholder="任务目标，可写 [[角色]] 或 [[地点]] 自动关联"
                rows={3}
              />
            </Field>
            <div className="quest-step-grid">
              <Field
                label="条件"
                referencePath={`steps[${index}].condition`}
                referenceSource={{ kind: "quest", id: quest.id }}
              >
                <InlineAiTextarea
                  aiTarget={aiTarget(`steps[${index}].condition`, `步骤 ${index + 1} · 条件`)}
                  value={step.condition}
                  onChange={(value) => onUpdateStep(step.id, { condition: value })}
                  rows={3}
                />
              </Field>
              <Field
                label="分支"
                referencePath={`steps[${index}].branch`}
                referenceSource={{ kind: "quest", id: quest.id }}
              >
                <InlineAiTextarea
                  aiTarget={aiTarget(`steps[${index}].branch`, `步骤 ${index + 1} · 分支`)}
                  value={step.branch}
                  onChange={(value) => onUpdateStep(step.id, { branch: value })}
                  rows={3}
                />
              </Field>
              <Field
                label="失败分支"
                referencePath={`steps[${index}].failure`}
                referenceSource={{ kind: "quest", id: quest.id }}
              >
                <InlineAiTextarea
                  aiTarget={aiTarget(`steps[${index}].failure`, `步骤 ${index + 1} · 失败分支`)}
                  value={step.failure}
                  onChange={(value) => onUpdateStep(step.id, { failure: value })}
                  rows={3}
                />
              </Field>
              <Field
                label="奖励"
                referencePath={`steps[${index}].reward`}
                referenceSource={{ kind: "quest", id: quest.id }}
              >
                <InlineAiTextarea
                  aiTarget={aiTarget(`steps[${index}].reward`, `步骤 ${index + 1} · 奖励`)}
                  value={step.reward}
                  onChange={(value) => onUpdateStep(step.id, { reward: value })}
                  rows={3}
                />
              </Field>
              <Field
                label="开发备注"
                referencePath={`steps[${index}].notes`}
                referenceSource={{ kind: "quest", id: quest.id }}
              >
                <textarea
                  value={step.notes}
                  onChange={(event) => onUpdateStep(step.id, { notes: event.target.value })}
                  rows={3}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <Field label="开发者备注 / 玩家不可见信息">
        <textarea
          value={quest.developerNotes}
          onChange={(event) => onUpdate({ developerNotes: event.target.value })}
          rows={4}
        />
      </Field>
    </>
  );
}

function QuestFlowGraph({
  onMaximize,
  quest,
  quests
}: {
  onMaximize: () => void;
  quest: QuestLine;
  quests: QuestLine[];
}) {
  const prerequisites = quest.prerequisiteQuestIds
    .map((id) => quests.find((item) => item.id === id))
    .filter((item): item is QuestLine => Boolean(item));

  return (
    <div className="quest-flow">
      <div className="subsection-title quest-flow-title">
        <span>
          <GitBranch size={16} />
          <span>分支剧情树</span>
        </span>
        <button
          aria-label="最大化查看任务线图"
          className="icon-button"
          title="最大化查看任务线图"
          type="button"
          onClick={onMaximize}
        >
          <Maximize2 size={17} />
        </button>
      </div>

      <div className="quest-prerequisite-strip">
        <span>前置任务</span>
        <div>
          {prerequisites.length ? (
            prerequisites.map((item) => (
              <span className={`category-${item.category}`} key={item.id}>
                {item.title}
              </span>
            ))
          ) : (
            <small>无前置，可直接触发</small>
          )}
        </div>
      </div>

      <QuestBranchTree
        quest={{
          ...quest,
          status: questStatusMeta[quest.status].label,
          participantIds: []
        }}
      />
    </div>
  );
}

function ExpandableTextareaField({
  aiTarget,
  label,
  onChange,
  placeholder,
  referencePath,
  referenceSource,
  rows = 4,
  value
}: {
  aiTarget?: InlineAiTarget;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  referencePath?: string;
  referenceSource?: ProjectObjectRef;
  rows?: number;
  value: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!expanded) {
      return;
    }

    document.body.classList.add("focus-editor-open");
    const frame = window.requestAnimationFrame(() => textareaRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("focus-editor-open");
    };
  }, [expanded]);

  return (
    <div
      className={`expandable-textarea-field ${expanded ? "is-focus-mode" : ""}`}
      data-reference-path={referencePath}
      data-reference-source-id={referenceSource?.id}
      data-reference-source-kind={referenceSource?.kind}
    >
      <div className="expandable-textarea-heading">
        <span>{label}</span>
        {expanded ? <small>专注写作</small> : null}
        <button
          aria-label={expanded ? `退出${label}专注模式` : `全屏编写${label}`}
          title={expanded ? "退出专注模式" : "全屏编写"}
          type="button"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? <Minimize2 size={18} /> : <Maximize2 size={16} />}
        </button>
      </div>
      {aiTarget ? (
        <InlineAiTextarea
          aiTarget={aiTarget}
          textareaRef={textareaRef}
          aria-label={label}
          placeholder={placeholder}
          rows={rows}
          value={value}
          onChange={onChange}
        />
      ) : (
        <textarea
          ref={textareaRef}
          aria-label={label}
          placeholder={placeholder}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

function Field({
  children,
  label,
  referencePath,
  referenceSource
}: {
  children: ReactNode;
  label: string;
  referencePath?: string;
  referenceSource?: ProjectObjectRef;
}) {
  return (
    <label
      className="field"
      data-reference-path={referencePath}
      data-reference-source-id={referenceSource?.id}
      data-reference-source-kind={referenceSource?.kind}
    >
      <span>{label}</span>
      {children}
    </label>
  );
}

function Fact({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="fact-row">
      <Icon size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({
  actionLabel,
  icon: Icon,
  onAction,
  title
}: {
  actionLabel: string;
  icon: LucideIcon;
  onAction: () => void;
  title: string;
}) {
  return (
    <div className="empty-state">
      <Icon size={34} />
      <h2>{title}</h2>
      <button type="button" onClick={onAction}>
        <Plus size={16} />
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}
