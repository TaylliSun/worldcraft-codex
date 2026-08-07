"use client";

import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalDistributeCenter,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bookmark,
  BoxSelect,
  Building2,
  CalendarClock,
  CalendarPlus,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Combine,
  Copy,
  Download,
  Eye,
  EyeOff,
  Flag,
  Frame,
  FlipHorizontal2,
  FlipVertical2,
  FolderPlus,
  FolderTree,
  Gem,
  GitBranch,
  GripVertical,
  Group,
  Hand,
  History,
  Image as ImageIcon,
  ImagePlus,
  Info,
  Layers3,
  ListFilter,
  LoaderCircle,
  Lock,
  Map,
  MapPin,
  Maximize2,
  MessagesSquare,
  Minimize2,
  LocateFixed,
  Move,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PenTool,
  Pentagon,
  Plus,
  Redo2,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Ruler,
  Route as RouteIcon,
  Search,
  Save,
  Scan,
  Scaling,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  StickyNote,
  Tags,
  Trash2,
  Undo2,
  Upload,
  Unlock,
  Ungroup,
  UserRound,
  X,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent,
  CSSProperties,
  DragEvent as ReactDragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode
} from "react";
import {
  calculateMapDistance,
  calculateMapGrid,
  calculateMapRegionMetrics,
  calculateMapRouteMetrics,
  calculateMapScaleBar,
  calculateMapViewportBounds,
  createMapHierarchyEntries,
  createMapImageTransform,
  createMapRegion,
  createMapRegionSvgPath,
  createMapRouteSvgPath,
  createMapRouteStop,
  createMapRouteWaypoint,
  createMapSavedFilter,
  createMapStoryPhase,
  createMapViewBookmark,
  formatMapDistance,
  formatMapTravelTime,
  getMapDescendantIds,
  getMapDistanceUnitLabel,
  getMapHierarchyPath,
  getMapRoutePathPoints,
  isMapMarkerEditable,
  isMapMarkerVisible,
  isMapPointInsidePolygon,
  isMapPointWithinBounds,
  MAP_CANVAS_COORDINATE_LIMIT,
  mapDistanceUnitLabels,
  mapDistanceUnits,
  mapMarkerKinds,
  mapMarkerMatchesTimelineEvent,
  mapRegionIntersectsBounds,
  mapTravelModeLabels,
  mapTravelModes,
  moveMapRouteStop,
  normalizeMapImageTransform,
  normalizeMapStoryPhase,
  planningColors,
  resolveMapLabelVisibility,
  simplifyMapRegionPoints,
  smoothMapRegionPoints,
  snapMapPointToGrid
} from "../world-planning";
import {
  calculateMapExportDimensions,
  defaultMapExportOptions,
  renderMapExport,
  type MapExportBounds,
  type MapExportOptions
} from "../map-export";
import {
  analyzeMapConflicts,
  buildMapAiReviewPrompt,
  compareMapVersions,
  mapAiReviewSystemPrompt,
  parseMapAiReviewResponse,
  type MapAiSuggestion,
  type MapReviewFinding,
  type MapReviewTargetType
} from "../map-intelligence";
import { ProjectReferencePicker } from "./ProjectReferencePicker";
import type { ProjectReferenceOption } from "./ProjectReferencePicker";
import type { ProjectObjectKind, ProjectObjectRef } from "../project-references";
import type {
  MapHierarchyEntry,
  MapLayer,
  MapLayerImageBlendMode,
  MapLabelPlacement,
  MapImageTransform,
  MapMarker,
  MapMarkerGroup,
  MapMarkerKind,
  MapRegion,
  MapRegionKind,
  MapRegionPoint,
  MapRoute,
  MapRouteStatus,
  MapRouteWaypoint,
  MapSavedFilter,
  MapStoryPhase,
  MapTravelMode,
  MapViewBookmark,
  TimelineEvent,
  WorldMap
} from "../world-planning";

export type MapEntityOption = {
  id: string;
  title: string;
  type: "character" | "location" | "faction" | "event" | "item" | "note";
};

export type MapQuestOption = { id: string; title: string };
export type MapSceneOption = { id: string; title: string };

type MapWorkspaceMode = "markers" | "routes" | "regions" | "layers";
type MapCanvasTool = "pan" | "select" | "route" | "region" | "measure";
type MapStructureSelection = { kind: "layer" | "group"; id: string };
type MapPhaseVisibilityField =
  | "hiddenLayerIds"
  | "hiddenGroupIds"
  | "hiddenMarkerIds"
  | "hiddenRegionIds"
  | "hiddenRouteIds";
export type MapOperationFocus = {
  itemId: string;
  target: "map" | "map-layer" | "map-marker-group" | "map-marker" | "map-route";
  token: number;
};
export type MapVersionSnapshot = {
  createdAt: string;
  id: number;
  label: string;
  map: WorldMap;
  reason: string;
};
export type MapVersionLoadResult = {
  error?: string;
  ok: boolean;
  versions: MapVersionSnapshot[];
};
export type MapVersionRestoreResult = {
  canceled?: boolean;
  error?: string;
  ok: boolean;
};
export type MapAiCompletionResult = {
  error?: string;
  model?: string;
  ok: boolean;
  text?: string;
};
type MapPoint = { x: number; y: number };
type MapMeasurement = {
  complete: boolean;
  end: MapPoint;
  start: MapPoint;
};
type MarkerDrag = {
  markerId: string;
  origins: Array<{ markerId: string; point: MapPoint }>;
  pointerId: number;
  startClientX: number;
  startClientY: number;
};
type MarqueeSelection = {
  additive: boolean;
  currentX: number;
  currentY: number;
  pointerId: number;
  startX: number;
  startY: number;
};
type MapContextMenu = {
  mapX: number;
  mapY: number;
  markerId?: string;
  x: number;
  y: number;
};
type MapMarkerUpdate = {
  markerId: string;
  patch: Partial<MapMarker>;
};
type MapLayerUpdate = {
  layerId: string;
  patch: Partial<MapLayer>;
};
type RegionVertexDrag = {
  pointIndex: number;
  points: MapRegionPoint[];
  pointerId: number;
  regionId: string;
};
type RouteWaypointDrag = {
  latest: MapPoint;
  pointerId: number;
  routeId: string;
  waypointId: string;
};
type MapLabelDrag = {
  itemId: string;
  kind: "marker" | "region";
  latest: MapPoint;
  moved: boolean;
  placement: MapLabelPlacement;
  pointerId: number;
  startClientX: number;
  startClientY: number;
};
type MapImageTransformMode = "move" | "scale" | "rotate";
type MapImageArrangeAction =
  | "align-bottom"
  | "align-center-x"
  | "align-center-y"
  | "align-left"
  | "align-right"
  | "align-top"
  | "distribute-x"
  | "distribute-y"
  | "flip-x"
  | "flip-y";
type MapImageBounds = {
  bottom: number;
  centerX: number;
  centerY: number;
  left: number;
  right: number;
  top: number;
};
type MapImageTransformDrag = {
  centerClientX: number;
  centerClientY: number;
  centerMapX: number;
  centerMapY: number;
  latest: MapImageTransform;
  latestLayers: Record<string, MapImageTransform>;
  layerIds: string[];
  layerStarts: Record<string, MapImageTransform>;
  mode: MapImageTransformMode;
  pointerId: number;
  stageHeight: number;
  stageWidth: number;
  start: MapImageTransform;
  startBounds: MapImageBounds | null;
  startAngle: number;
  startClientX: number;
  startClientY: number;
  startDistance: number;
};

const MIN_MAP_ZOOM = 0.01;
const MAX_MAP_ZOOM = 4;
const PLANNING_VIRTUALIZATION_THRESHOLD = 80;
const PLANNING_VIRTUAL_ROW_HEIGHT = 59;

function VirtualizedPlanningList<Item>({
  emptyText,
  itemKey,
  items,
  renderItem,
  selectedIndex = -1
}: {
  emptyText: string;
  itemKey: (item: Item) => string;
  items: Item[];
  renderItem: (item: Item, index: number) => ReactNode;
  selectedIndex?: number;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(420);
  const virtualized = items.length > PLANNING_VIRTUALIZATION_THRESHOLD;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const updateHeight = () => setViewportHeight(Math.max(80, list.clientHeight));
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(list);
    return () => observer.disconnect();
  }, [virtualized]);

  useEffect(() => {
    const list = listRef.current;
    if (!virtualized || !list || selectedIndex < 0) return;
    const itemTop = selectedIndex * PLANNING_VIRTUAL_ROW_HEIGHT;
    const itemBottom = itemTop + PLANNING_VIRTUAL_ROW_HEIGHT;
    if (itemTop < list.scrollTop) list.scrollTop = itemTop;
    else if (itemBottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = itemBottom - list.clientHeight;
    }
  }, [selectedIndex, virtualized]);

  if (!items.length) {
    return <div className="planning-item-list"><p className="muted-text">{emptyText}</p></div>;
  }
  if (!virtualized) {
    return <div className="planning-item-list">{items.map(renderItem)}</div>;
  }

  const overscan = 6;
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / PLANNING_VIRTUAL_ROW_HEIGHT) - overscan
  );
  const visibleCount = Math.ceil(viewportHeight / PLANNING_VIRTUAL_ROW_HEIGHT) + overscan * 2;
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  const visibleItems = items.slice(startIndex, endIndex);
  return (
    <div
      className="planning-item-list is-virtualized"
      data-virtualized-count={items.length}
      ref={listRef}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div
        className="planning-virtual-spacer"
        style={{ height: items.length * PLANNING_VIRTUAL_ROW_HEIGHT }}
      >
        <div
          className="planning-virtual-window"
          style={{ transform: `translateY(${startIndex * PLANNING_VIRTUAL_ROW_HEIGHT}px)` }}
        >
          {visibleItems.map((item, index) => (
            <div className="planning-virtual-row" key={itemKey(item)}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function mapLabelPreviewKey(kind: "marker" | "region", itemId: string) {
  return `${kind}:${itemId}`;
}

function getMapImageTransformStyle(transform: MapImageTransform) {
  const scaleX = transform.scale * (transform.flipX ? -1 : 1);
  const scaleY = transform.scale * (transform.flipY ? -1 : 1);
  return {
    left: `${50 + transform.x}%`,
    top: `${50 + transform.y}%`,
    transform: `translate(-50%, -50%) rotate(${transform.rotation}deg) scale(${scaleX}, ${scaleY})`
  };
}

type MapImageNaturalSize = {
  height: number;
  width: number;
};

type MapImageFrameStyle = CSSProperties & {
  "--image-transform-inverse-rotation"?: string;
  "--image-transform-inverse-scale"?: string;
  "--image-transform-inverse-scale-x"?: string;
  "--image-transform-inverse-scale-y"?: string;
};

function getContainedMapImagePercentSize(
  map: Pick<WorldMap, "height" | "width">,
  naturalSize: MapImageNaturalSize | undefined
) {
  const mapAspect = map.width / Math.max(1, map.height);
  const imageAspect = naturalSize
    ? naturalSize.width / Math.max(1, naturalSize.height)
    : mapAspect;
  return imageAspect >= mapAspect
    ? { height: (mapAspect / imageAspect) * 100, width: 100 }
    : { height: 100, width: (imageAspect / mapAspect) * 100 };
}

function getContainedMapImageFrameStyle(
  map: Pick<WorldMap, "height" | "width">,
  naturalSize: MapImageNaturalSize | undefined,
  transform: MapImageTransform,
  includeHandleCompensation = false
): MapImageFrameStyle {
  const { height, width } = getContainedMapImagePercentSize(map, naturalSize);
  return {
    ...getMapImageTransformStyle(transform),
    height: `${height}%`,
    width: `${width}%`,
    ...(includeHandleCompensation
      ? {
          "--image-transform-inverse-rotation": `${-transform.rotation}deg`,
          "--image-transform-inverse-scale": `${1 / Math.max(0.01, transform.scale)}`,
          "--image-transform-inverse-scale-x": `${(transform.flipX ? -1 : 1) / Math.max(0.01, transform.scale)}`,
          "--image-transform-inverse-scale-y": `${(transform.flipY ? -1 : 1) / Math.max(0.01, transform.scale)}`
        }
      : {})
  };
}

function getMapImageTransformBounds(
  map: Pick<WorldMap, "height" | "width">,
  naturalSize: MapImageNaturalSize | undefined,
  transform: MapImageTransform
): MapPoint[] {
  const size = getContainedMapImagePercentSize(map, naturalSize);
  const centerX = 50 + transform.x;
  const centerY = 50 + transform.y;
  const halfWidth = (map.width * size.width * transform.scale) / 200;
  const halfHeight = (map.height * size.height * transform.scale) / 200;
  const radians = transform.rotation * (Math.PI / 180);
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return ([-1, 1] as const).flatMap((horizontal) =>
    ([-1, 1] as const).map((vertical) => {
      const x = horizontal * halfWidth;
      const y = vertical * halfHeight;
      return {
        x: centerX + ((x * cosine - y * sine) / map.width) * 100,
        y: centerY + ((x * sine + y * cosine) / map.height) * 100
      };
    })
  );
}

function getMapImageBounds(points: MapPoint[]): MapImageBounds {
  const left = Math.min(...points.map((point) => point.x));
  const right = Math.max(...points.map((point) => point.x));
  const top = Math.min(...points.map((point) => point.y));
  const bottom = Math.max(...points.map((point) => point.y));
  return {
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
    left,
    right,
    top
  };
}

const markerKindMeta: Record<
  MapMarkerKind,
  { label: string; icon: typeof MapPin }
> = {
  character: { label: "人物", icon: UserRound },
  location: { label: "地点", icon: MapPin },
  faction: { label: "组织", icon: Building2 },
  event: { label: "事件", icon: CalendarClock },
  item: { label: "物品", icon: Gem },
  note: { label: "笔记", icon: StickyNote },
  quest: { label: "任务", icon: RouteIcon },
  scene: { label: "剧情场景", icon: MessagesSquare },
  custom: { label: "自定义", icon: CircleDot }
};

const routeStatusMeta = {
  draft: "草稿",
  active: "进行中",
  complete: "已完成"
} as const;

const regionKindMeta: Record<MapRegionKind, string> = {
  territory: "领地",
  district: "城区 / 区块",
  biome: "生态区",
  danger: "危险区",
  quest: "任务区域",
  custom: "自定义"
};

const mapLayerImageBlendModeLabels: Record<MapLayerImageBlendMode, string> = {
  normal: "正常",
  multiply: "正片叠底",
  screen: "滤色",
  overlay: "叠加",
  "soft-light": "柔光"
};

const mapVersionFieldLabels: Partial<Record<keyof WorldMap, string>> = {
  description: "地图说明",
  distanceUnit: "距离单位",
  distanceWidth: "距离比例",
  grid: "坐标网格",
  height: "画布高度",
  imageTransform: "底图变换",
  imageUrl: "底图",
  savedFilters: "保存的筛选",
  storyPhases: "剧情阶段",
  title: "地图名称",
  viewBookmarks: "视图书签",
  width: "画布宽度"
};

function isSafeMapReviewColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function asFiniteMapReviewNumber(value: unknown, minimum: number, maximum: number) {
  const number = typeof value === "number" ? value : Number.NaN;
  return Number.isFinite(number) ? clamp(number, minimum, maximum) : null;
}

function getSafeMapAiPatch(suggestion: MapAiSuggestion) {
  const source = suggestion.patch;
  const safe: Record<string, number | string> = {};
  const addString = (key: string, maximumLength: number) => {
    const value = source[key];
    if (typeof value === "string") safe[key] = value.slice(0, maximumLength);
  };
  const addNumber = (key: string, minimum: number, maximum: number) => {
    const value = asFiniteMapReviewNumber(source[key], minimum, maximum);
    if (value !== null) safe[key] = value;
  };

  if (suggestion.targetType === "map") {
    addString("title", 120);
    addString("description", 4000);
    addString("customDistanceUnit", 32);
    addNumber("distanceWidth", 0.01, 100000000);
    if (mapDistanceUnits.includes(source.distanceUnit as WorldMap["distanceUnit"])) {
      safe.distanceUnit = source.distanceUnit as string;
    }
  } else if (suggestion.targetType === "marker") {
    addString("label", 120);
    addString("description", 4000);
    addNumber("x", -MAP_CANVAS_COORDINATE_LIMIT, MAP_CANVAS_COORDINATE_LIMIT);
    addNumber("y", -MAP_CANVAS_COORDINATE_LIMIT, MAP_CANVAS_COORDINATE_LIMIT);
    if (mapMarkerKinds.includes(source.markerType as MapMarkerKind)) {
      safe.markerType = source.markerType as string;
    }
    if (isSafeMapReviewColor(source.color)) safe.color = source.color;
  } else if (suggestion.targetType === "route") {
    addString("title", 120);
    addString("description", 4000);
    addNumber("travelSpeed", 0.01, 100000);
    addNumber("travelHoursPerDay", 0.1, 24);
    if (["draft", "active", "complete"].includes(String(source.status))) {
      safe.status = String(source.status);
    }
    if (mapTravelModes.includes(source.travelMode as MapTravelMode)) {
      safe.travelMode = source.travelMode as string;
    }
    if (["smooth", "straight"].includes(String(source.curveMode))) {
      safe.curveMode = String(source.curveMode);
    }
    if (isSafeMapReviewColor(source.color)) safe.color = source.color;
  } else {
    addString("title", 120);
    addString("description", 4000);
    addNumber("opacity", 0.05, 1);
    if (Object.prototype.hasOwnProperty.call(regionKindMeta, String(source.kind))) {
      safe.kind = String(source.kind);
    }
    if (isSafeMapReviewColor(source.color)) safe.color = source.color;
  }
  return safe;
}

function formatMapVersionDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("zh-CN", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(date);
}

function findTitle<T extends { id: string; title: string }>(items: T[], id: string) {
  return items.find((item) => item.id === id)?.title ?? "";
}

function timelineTitle(
  event: TimelineEvent,
  entities: MapEntityOption[],
  quests: MapQuestOption[],
  scenes: MapSceneOption[]
) {
  return (
    event.title ||
    findTitle(entities, event.entityId) ||
    findTitle(quests, event.questId) ||
    findTitle(scenes, event.sceneId) ||
    "未命名时间点"
  );
}

export function MapWorkspace({
  activeMapId,
  creatableReferenceKinds,
  entities,
  layers,
  maps,
  markerGroups,
  markers,
  onCreateLayer,
  onCreateMap,
  onCreateMarker,
  onCreateMarkerGroup,
  onCreateReference,
  onCreateRoute,
  onCompleteAi,
  onDeleteMap,
  onDeleteLayer,
  onDeleteMarker,
  onDeleteMarkerGroup,
  onDeleteRoute,
  onOpenReference,
  onOpenTimeline,
  onLoadMapVersions,
  onMergeLayers,
  onDuplicateLayer,
  onRedoMapOperation,
  onReorderLayers,
  onUndoMapOperation,
  operationFocus,
  onSelectMap,
  onSelectMarker,
  onSelectRoute,
  onUpdateMap,
  onUpdateLayer,
  onUpdateLayers,
  onUpdateMarker,
  onUpdateMarkers,
  onUpdateMarkerGroup,
  onUpdateRoute,
  onRestoreMapVersion,
  onUploadLayerImage,
  onUploadMap,
  onUploadMarkerIcon,
  quests,
  referenceFocus,
  referenceOptions,
  redoMapOperationLabel,
  routes,
  scenes,
  selectedMarkerId,
  selectedRouteId,
  timelineEvents,
  undoMapOperationLabel
}: {
  activeMapId: string;
  creatableReferenceKinds: ProjectObjectKind[];
  entities: MapEntityOption[];
  layers: MapLayer[];
  maps: WorldMap[];
  markerGroups: MapMarkerGroup[];
  markers: MapMarker[];
  onCreateLayer: (mapId: string) => string;
  onCreateMap: (parentMapId?: string, entryMarkerId?: string) => void;
  onCreateMarker: (mapId: string, x: number, y: number, layerId?: string) => string;
  onCreateMarkerGroup: (mapId: string) => string;
  onCreateReference: (source: ProjectObjectRef, kind: ProjectObjectKind) => void;
  onCreateRoute: (mapId: string) => string;
  onCompleteAi: (request: {
    maxTokens: number;
    prompt: string;
    systemPrompt: string;
  }) => Promise<MapAiCompletionResult>;
  onDeleteMap: (mapId: string) => void | Promise<void>;
  onDeleteLayer: (layerId: string) => void | Promise<void>;
  onDeleteMarker: (markerId: string) => void | Promise<void>;
  onDeleteMarkerGroup: (groupId: string) => void | Promise<void>;
  onDeleteRoute: (routeId: string) => void | Promise<void>;
  onOpenReference: (reference: ProjectObjectRef) => void;
  onOpenTimeline: (timelineEventId: string) => void;
  onLoadMapVersions: (mapId: string) => Promise<MapVersionLoadResult>;
  onMergeLayers: (sourceLayerId: string, targetLayerId: string) => Promise<boolean>;
  onDuplicateLayer: (layerId: string) => string;
  onRedoMapOperation: () => void;
  onReorderLayers: (mapId: string, orderedLayerIds: string[]) => void;
  onUndoMapOperation: () => void;
  operationFocus: MapOperationFocus | null;
  onSelectMap: (mapId: string) => void;
  onSelectMarker: (markerId: string) => void;
  onSelectRoute: (routeId: string) => void;
  onUpdateMap: (mapId: string, patch: Partial<WorldMap>) => void;
  onUpdateLayer: (layerId: string, patch: Partial<MapLayer>) => void;
  onUpdateLayers: (updates: MapLayerUpdate[]) => void;
  onUpdateMarker: (markerId: string, patch: Partial<MapMarker>) => void;
  onUpdateMarkers: (updates: MapMarkerUpdate[]) => void;
  onUpdateMarkerGroup: (groupId: string, patch: Partial<MapMarkerGroup>) => void;
  onUpdateRoute: (routeId: string, patch: Partial<MapRoute>) => void;
  onRestoreMapVersion: (version: MapVersionSnapshot) => Promise<MapVersionRestoreResult>;
  onUploadLayerImage: (layerId: string, file: File) => void;
  onUploadMap: (mapId: string, file: File) => void;
  onUploadMarkerIcon: (markerId: string, file: File) => void;
  quests: MapQuestOption[];
  referenceFocus: { source: ProjectObjectRef; token: number } | null;
  referenceOptions: ProjectReferenceOption[];
  redoMapOperationLabel: string;
  routes: MapRoute[];
  scenes: MapSceneOption[];
  selectedMarkerId: string;
  selectedRouteId: string;
  timelineEvents: TimelineEvent[];
  undoMapOperationLabel: string;
}) {
  const [mode, setMode] = useState<MapWorkspaceMode>("markers");
  const [query, setQuery] = useState("");
  const [markerKindFilter, setMarkerKindFilter] = useState<"" | MapMarkerKind>("");
  const [markerLayerFilter, setMarkerLayerFilter] = useState("");
  const [markerGroupFilter, setMarkerGroupFilter] = useState("");
  const [routeStatusFilter, setRouteStatusFilter] = useState<"" | MapRouteStatus>("");
  const [regionKindFilter, setRegionKindFilter] = useState<"" | MapRegionKind>("");
  const [selectedSavedFilterId, setSelectedSavedFilterId] = useState("");
  const [filterSaveDraftOpen, setFilterSaveDraftOpen] = useState(false);
  const [filterSaveTitle, setFilterSaveTitle] = useState("");
  const [placing, setPlacing] = useState(false);
  const [nextStopMarkerId, setNextStopMarkerId] = useState("");
  const [selectedStructure, setSelectedStructure] =
    useState<MapStructureSelection | null>(null);
  const [browserCollapsed, setBrowserCollapsed] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenDockTab, setFullscreenDockTab] = useState<"layers" | "properties">("properties");
  const [activePaletteLayerId, setActivePaletteLayerId] = useState("");
  const [isImageDropActive, setIsImageDropActive] = useState(false);
  const [isImageTransformMode, setIsImageTransformMode] = useState(false);
  const [transformingLayerImageId, setTransformingLayerImageId] = useState("");
  const [transformingLayerImageIds, setTransformingLayerImageIds] = useState<string[]>([]);
  const [selectedImageLayerIds, setSelectedImageLayerIds] = useState<string[]>([]);
  const [imageTransformPreview, setImageTransformPreview] =
    useState<MapImageTransform | null>(null);
  const [layerImageTransformPreviews, setLayerImageTransformPreviews] =
    useState<Record<string, MapImageTransform>>({});
  const [imageSnapGuides, setImageSnapGuides] = useState<{
    horizontal: number | null;
    vertical: number | null;
  }>({ horizontal: null, vertical: null });
  const [pendingTransformLayerId, setPendingTransformLayerId] = useState("");
  const [imageNaturalSizes, setImageNaturalSizes] = useState<Record<string, MapImageNaturalSize>>({});
  const [isPanning, setIsPanning] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedStoryPhaseId, setSelectedStoryPhaseId] = useState("");
  const [canvasTool, setCanvasTool] = useState<MapCanvasTool>("pan");
  const [selectedMarkerIds, setSelectedMarkerIds] = useState<string[]>([]);
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [regionIsolationEnabled, setRegionIsolationEnabled] = useState(false);
  const [editingRegionId, setEditingRegionId] = useState("");
  const [regionDraft, setRegionDraft] = useState<MapRegionPoint[]>([]);
  const [regionHoleTargetId, setRegionHoleTargetId] = useState("");
  const [regionDrawingError, setRegionDrawingError] = useState("");
  const [regionDraftCursor, setRegionDraftCursor] = useState<MapRegionPoint | null>(null);
  const [regionVertexPreview, setRegionVertexPreview] = useState<{
    points: MapRegionPoint[];
    regionId: string;
  } | null>(null);
  const [routeWaypointPreviews, setRouteWaypointPreviews] = useState<Record<string, MapPoint>>({});
  const [labelPlacementPreviews, setLabelPlacementPreviews] = useState<Record<string, MapPoint>>({});
  const [measurement, setMeasurement] = useState<MapMeasurement | null>(null);
  const [zoom, setZoom] = useState(0.5);
  const [offset, setOffset] = useState<MapPoint>({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ height: 0, width: 0 });
  const [dragPreviews, setDragPreviews] = useState<Record<string, MapPoint>>({});
  const [marquee, setMarquee] = useState<MarqueeSelection | null>(null);
  const [contextMenu, setContextMenu] = useState<MapContextMenu | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [bookmarkMenuOpen, setBookmarkMenuOpen] = useState(false);
  const [bookmarkDraftTitle, setBookmarkDraftTitle] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState<"intelligence" | "versions">("intelligence");
  const [aiSuggestions, setAiSuggestions] = useState<MapAiSuggestion[]>([]);
  const [aiReviewStatus, setAiReviewStatus] = useState<{
    kind: "error" | "idle" | "success" | "working";
    message: string;
  }>({ kind: "idle", message: "" });
  const [mapVersions, setMapVersions] = useState<MapVersionSnapshot[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [versionStatus, setVersionStatus] = useState<{
    kind: "error" | "idle" | "success" | "working";
    message: string;
  }>({ kind: "idle", message: "" });
  const [exportOptions, setExportOptions] = useState<MapExportOptions>(defaultMapExportOptions);
  const [exportStatus, setExportStatus] = useState<{
    kind: "error" | "idle" | "success" | "working";
    message: string;
  }>({ kind: "idle", message: "" });
  const viewportRef = useRef<HTMLDivElement>(null);
  const mapImageInputRef = useRef<HTMLInputElement>(null);
  const mapLayerImageInputRef = useRef<HTMLInputElement>(null);
  const mapLayerImageTargetRef = useRef("");
  const markerIconInputRef = useRef<HTMLInputElement>(null);
  const markerIconTargetRef = useRef("");
  const stageRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const exportDialogRef = useRef<HTMLElement>(null);
  const reviewDialogRef = useRef<HTMLElement>(null);
  const bookmarkMenuRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<MarkerDrag | null>(null);
  const imageTransformDragRef = useRef<MapImageTransformDrag | null>(null);
  const fullscreenLayerBrowserStateRef = useRef<boolean | null>(null);
  const regionVertexDragRef = useRef<RegionVertexDrag | null>(null);
  const routeWaypointDragRef = useRef<RouteWaypointDrag | null>(null);
  const labelDragRef = useRef<MapLabelDrag | null>(null);
  const marqueeRef = useRef<MarqueeSelection | null>(null);
  const panRef = useRef<{
    moved: boolean;
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startOffset: MapPoint;
  } | null>(null);
  const ignoreNextStageClickRef = useRef(false);
  const zoomRef = useRef(zoom);
  const offsetRef = useRef(offset);

  useEffect(() => {
    inspectorRef.current?.scrollTo({ left: 0, top: 0 });
  }, [activeMapId, mode, selectedMarkerId, selectedRegionId, selectedRouteId, selectedStructure?.id, selectedStructure?.kind]);

  useEffect(() => {
    if (referenceFocus?.source.kind === "map-marker") {
      setMode("markers");
      setFullscreenDockTab("properties");
      setSelectedStructure(null);
    } else if (referenceFocus?.source.kind === "map-route") {
      setMode("routes");
      setFullscreenDockTab("properties");
      setSelectedStructure(null);
    }
  }, [referenceFocus?.token]);

  useEffect(() => {
    if (!operationFocus) return;
    setSelectedRegionId("");
    setSelectedRegionIds([]);
    if (operationFocus.target === "map-layer") {
      setMode("layers");
      setFullscreenDockTab("properties");
      setActivePaletteLayerId(operationFocus.itemId);
      setSelectedImageLayerIds([operationFocus.itemId]);
      setSelectedStructure({ kind: "layer", id: operationFocus.itemId });
      return;
    }
    if (operationFocus.target === "map-marker-group") {
      setMode("layers");
      setFullscreenDockTab("properties");
      setSelectedStructure({ kind: "group", id: operationFocus.itemId });
      return;
    }
    setSelectedStructure(null);
    setMode(operationFocus.target === "map-route" ? "routes" : "markers");
  }, [operationFocus?.token]);
  const activeMap = maps.find((mapItem) => mapItem.id === activeMapId) ?? maps[0] ?? null;
  const hierarchyEntries = useMemo(() => createMapHierarchyEntries(maps), [maps]);
  const activeMapPath = useMemo(
    () => getMapHierarchyPath(maps, activeMap?.id ?? ""),
    [activeMap?.id, maps]
  );
  const activeMapDescendantIds = useMemo(
    () => getMapDescendantIds(maps, activeMap?.id ?? ""),
    [activeMap?.id, maps]
  );
  const directChildMaps = maps.filter((mapItem) => mapItem.parentMapId === activeMap?.id);
  const storyPhases = [...(activeMap?.storyPhases ?? [])].sort(
    (left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN")
  );
  const activeStoryPhase = storyPhases.find((phase) => phase.id === selectedStoryPhaseId) ?? null;
  const phaseVisibility = useMemo(() => ({
    groups: new Set(activeStoryPhase?.hiddenGroupIds ?? []),
    layers: new Set(activeStoryPhase?.hiddenLayerIds ?? []),
    markers: new Set(activeStoryPhase?.hiddenMarkerIds ?? []),
    regions: new Set(activeStoryPhase?.hiddenRegionIds ?? []),
    routes: new Set(activeStoryPhase?.hiddenRouteIds ?? [])
  }), [activeStoryPhase]);
  const activeLayers = layers
    .filter((layer) => layer.mapId === activeMap?.id)
    .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN"));
  const selectedImageLayerSet = useMemo(
    () => new Set(selectedImageLayerIds),
    [selectedImageLayerIds]
  );
  const selectedImageLayers = activeLayers.filter((layer) =>
    selectedImageLayerSet.has(layer.id) && Boolean(layer.imageUrl)
  );
  const transformingLayerImageSet = useMemo(
    () => new Set(transformingLayerImageIds),
    [transformingLayerImageIds]
  );
  const transformingImageLayers = activeLayers.filter((layer) =>
    transformingLayerImageSet.has(layer.id) && Boolean(layer.imageUrl)
  );
  const transformingImageLayer = activeLayers.find(
    (layer) => layer.id === transformingLayerImageId
  ) ?? null;
  const pendingTransformLayer = activeLayers.find(
    (layer) => layer.id === pendingTransformLayerId
  ) ?? null;
  const activeImageTransform = (transformingLayerImageId
    ? layerImageTransformPreviews[transformingLayerImageId]
      ?? transformingImageLayer?.imageTransform
    : imageTransformPreview ?? activeMap?.imageTransform)
    ?? createMapImageTransform();
  const activeTransformImageUrl = transformingLayerImageId
    ? transformingImageLayer?.imageUrl ?? ""
    : activeMap?.imageUrl ?? "";
  const isMapImageTransformMode = isImageTransformMode && !transformingLayerImageId;
  const transformingImageSelectionBounds = activeMap && transformingImageLayers.length
    ? getMapImageBounds(
        transformingImageLayers.flatMap((layer) =>
          getMapImageTransformBounds(
            activeMap,
            imageNaturalSizes[layer.imageUrl],
            layerImageTransformPreviews[layer.id] ?? layer.imageTransform
          )
        )
      )
    : null;
  const isMultiLayerImageTransform = transformingImageLayers.length > 1;
  const activeTransformFrameStyle: MapImageFrameStyle | null = !activeMap || !activeTransformImageUrl
    ? null
    : isMultiLayerImageTransform && transformingImageSelectionBounds
      ? {
          "--image-transform-inverse-rotation": "0deg",
          "--image-transform-inverse-scale": "1",
          "--image-transform-inverse-scale-x": "1",
          "--image-transform-inverse-scale-y": "1",
          height: `${transformingImageSelectionBounds.bottom - transformingImageSelectionBounds.top}%`,
          left: `${transformingImageSelectionBounds.centerX}%`,
          top: `${transformingImageSelectionBounds.centerY}%`,
          transform: "translate(-50%, -50%)",
          width: `${transformingImageSelectionBounds.right - transformingImageSelectionBounds.left}%`
        }
      : getContainedMapImageFrameStyle(
          activeMap,
          imageNaturalSizes[activeTransformImageUrl],
          activeImageTransform,
          true
        );
  const activeGroups = markerGroups
    .filter((group) => group.mapId === activeMap?.id)
    .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN"));
  const activeMarkers = markers.filter((marker) => marker.mapId === activeMap?.id);
  const visibleActiveMarkers = activeMarkers.filter((marker) =>
    !phaseVisibility.markers.has(marker.id)
    && !phaseVisibility.layers.has(marker.layerId)
    && !phaseVisibility.groups.has(marker.groupId)
    && isMapMarkerVisible(marker, activeLayers, activeGroups)
  );
  const activeRoutes = routes.filter((route) => route.mapId === activeMap?.id);
  const visibleActiveRoutes = activeRoutes.filter((route) => !phaseVisibility.routes.has(route.id));
  const activeRegions = [...(activeMap?.regions ?? [])].sort(
    (left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN")
  );
  const localMapFindings = useMemo(
    () => activeMap
      ? analyzeMapConflicts({
          map: activeMap,
          markers: markers.filter((marker) => marker.mapId === activeMap.id),
          routes: routes.filter((route) => route.mapId === activeMap.id)
        })
      : [],
    [activeMap, markers, routes]
  );
  const selectedMapVersion = mapVersions.find((version) =>
    version.id === selectedVersionId && version.map.id === activeMap?.id
  ) ?? null;
  const selectedMapVersionComparison = activeMap && selectedMapVersion
    ? compareMapVersions(activeMap, selectedMapVersion.map)
    : null;
  const visibleActiveRegions = activeRegions.filter(
    (region) => region.visible && !phaseVisibility.regions.has(region.id)
  );
  const activeGrid = activeMap ? calculateMapGrid(activeMap) : null;
  const scaleBar = activeMap
    ? calculateMapScaleBar(activeMap, activeMap.width * zoom)
    : null;
  const measurementDistance = activeMap && measurement
    ? calculateMapDistance(activeMap, measurement.start, measurement.end)
    : 0;
  const selectedMarker = activeMarkers.find((marker) => marker.id === selectedMarkerId) ?? null;
  const selectedRoute = activeRoutes.find((route) => route.id === selectedRouteId) ?? null;
  const selectedRegion = activeRegions.find((region) => region.id === selectedRegionId) ?? null;
  const selectedMarkerSet = useMemo(
    () => new Set(selectedMarkerIds),
    [selectedMarkerIds]
  );
  const selectedRegionSet = useMemo(
    () => new Set(selectedRegionIds),
    [selectedRegionIds]
  );
  const displayedActiveRegions = regionIsolationEnabled && selectedRegionIds.length
    ? visibleActiveRegions.filter((region) => selectedRegionSet.has(region.id))
    : visibleActiveRegions;
  const viewportBounds = activeMap && viewportSize.width && viewportSize.height
    ? calculateMapViewportBounds(activeMap, zoom, offset, viewportSize)
    : null;
  const renderedActiveMarkers = viewportBounds
    ? visibleActiveMarkers.filter(
        (marker) => selectedMarkerSet.has(marker.id) || isMapPointWithinBounds(marker, viewportBounds)
      )
    : visibleActiveMarkers;
  const renderedActiveRegions = viewportBounds
    ? displayedActiveRegions.filter(
        (region) => selectedRegionSet.has(region.id) || mapRegionIntersectsBounds(region, viewportBounds)
      )
    : displayedActiveRegions;
  const selectedActiveMarkers = activeMarkers.filter((marker) => selectedMarkerSet.has(marker.id));
  const selectionExportBounds = useMemo<MapExportBounds | null>(() => {
    if (!activeMap) return null;
    const points: MapPoint[] = [
      ...selectedActiveMarkers.map((marker) => ({ x: marker.x, y: marker.y })),
      ...activeRegions
        .filter((region) => selectedRegionSet.has(region.id))
        .flatMap((region) => region.points),
      ...(selectedRoute ? getMapRoutePathPoints(selectedRoute, activeMarkers) : [])
    ];
    if (!points.length) return null;
    const paddingX = (48 / activeMap.width) * 100;
    const paddingY = (48 / activeMap.height) * 100;
    return {
      bottom: Math.max(...points.map((point) => point.y)) + paddingY,
      left: Math.min(...points.map((point) => point.x)) - paddingX,
      right: Math.max(...points.map((point) => point.x)) + paddingX,
      top: Math.min(...points.map((point) => point.y)) - paddingY
    };
  }, [activeMap, activeMarkers, activeRegions, selectedActiveMarkers, selectedRegionSet, selectedRoute]);
  const exportViewportBounds = activeMap && viewportSize.width && viewportSize.height
    ? calculateMapViewportBounds(activeMap, zoom, offset, viewportSize, 0)
    : null;
  const exportBounds: MapExportBounds | undefined = exportOptions.scope === "selection"
    ? selectionExportBounds ?? undefined
    : exportOptions.scope === "viewport"
      ? exportViewportBounds ?? undefined
      : undefined;
  const exportDimensions = activeMap
    ? calculateMapExportDimensions(activeMap, exportOptions.scale, exportBounds)
    : null;
  const selectedEditableMarkers = selectedActiveMarkers.filter((marker) =>
    isMapMarkerEditable(marker, activeLayers, activeGroups)
  );
  const selectedLayer = selectedStructure?.kind === "layer"
    ? activeLayers.find((layer) => layer.id === selectedStructure.id) ?? activeLayers[0] ?? null
    : null;
  const selectedGroup = selectedStructure?.kind === "group"
    ? activeGroups.find((group) => group.id === selectedStructure.id) ?? activeGroups[0] ?? null
    : null;
  const paletteLayer = activePaletteLayerId === "__base-map__" && !selectedLayer
    ? null
    : activeLayers.find(
        (layer) => layer.id === (selectedLayer?.id || activePaletteLayerId)
      ) ?? activeLayers.at(-1) ?? null;
  const layerMarkerCounts = activeMarkers.reduce<Record<string, number>>((counts, marker) => {
    counts[marker.layerId] = (counts[marker.layerId] ?? 0) + 1;
    return counts;
  }, {});
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const filteredMarkers = activeMarkers.filter((marker) => {
    if (markerKindFilter && marker.markerType !== markerKindFilter) return false;
    if (markerLayerFilter && marker.layerId !== markerLayerFilter) return false;
    if (markerGroupFilter === "__ungrouped__" && marker.groupId) return false;
    if (markerGroupFilter && markerGroupFilter !== "__ungrouped__" && marker.groupId !== markerGroupFilter) {
      return false;
    }
    return [
      marker.label,
      marker.description,
      markerKindMeta[marker.markerType].label,
      findTitle(entities, marker.entityId),
      findTitle(quests, marker.questId),
      findTitle(scenes, marker.sceneId)
    ]
      .join(" ")
      .toLocaleLowerCase("zh-CN")
      .includes(normalizedQuery);
  });
  const filteredRoutes = activeRoutes.filter((route) =>
    (!routeStatusFilter || route.status === routeStatusFilter)
    && [route.title, route.description, routeStatusMeta[route.status]]
      .join(" ")
      .toLocaleLowerCase("zh-CN")
      .includes(normalizedQuery)
  );
  const filteredRegions = activeRegions.filter((region) =>
    (!regionKindFilter || region.kind === regionKindFilter)
    && [region.title, region.description, regionKindMeta[region.kind]]
      .join(" ")
      .toLocaleLowerCase("zh-CN")
      .includes(normalizedQuery)
  );
  const filteredLayers = activeLayers.filter((layer) =>
    [layer.title, layer.description]
      .join(" ")
      .toLocaleLowerCase("zh-CN")
      .includes(normalizedQuery)
  );
  const filteredGroups = activeGroups.filter((group) =>
    [group.title, group.description]
      .join(" ")
      .toLocaleLowerCase("zh-CN")
      .includes(normalizedQuery)
  );
  const savedFilters = (activeMap?.savedFilters ?? []).filter((filter) => filter.mode === mode);
  const hasActiveCatalogFilter = Boolean(
    normalizedQuery
    || (mode === "markers" && (markerKindFilter || markerLayerFilter || markerGroupFilter))
    || (mode === "routes" && routeStatusFilter)
    || (mode === "regions" && regionKindFilter)
  );
  const filteredCatalogCount = mode === "markers"
    ? filteredMarkers.length
    : mode === "routes"
      ? filteredRoutes.length
      : mode === "regions"
        ? filteredRegions.length
        : isFullscreen
          ? filteredGroups.length
          : filteredLayers.length + filteredGroups.length;
  const totalCatalogCount = mode === "markers"
    ? activeMarkers.length
    : mode === "routes"
      ? activeRoutes.length
      : mode === "regions"
        ? activeRegions.length
        : isFullscreen
          ? activeGroups.length
          : activeLayers.length + activeGroups.length;
  const markerMap = useMemo(
    () => new globalThis.Map(visibleActiveMarkers.map((marker) => [marker.id, marker])),
    [visibleActiveMarkers]
  );
  const routePathMarkers = useMemo(
    () => visibleActiveMarkers.map((marker) => ({
      ...marker,
      ...(dragPreviews[marker.id] ?? {})
    })),
    [dragPreviews, visibleActiveMarkers]
  );
  const markerTimelineEvents = selectedMarker
    ? timelineEvents.filter((event) => mapMarkerMatchesTimelineEvent(selectedMarker, event))
    : [];
  const placementLayer = activeLayers.find((layer) => layer.visible && !layer.locked) ?? null;

  const clusteredMarkers = useMemo(() => {
    const cellSize = zoom < 0.36 ? 18 : zoom < 0.56 ? 13 : zoom < 0.78 ? 9 : 0;
    if (!cellSize || renderedActiveMarkers.length < 3) {
      return { clusters: [] as Array<{ ids: string[]; x: number; y: number }>, ids: new Set<string>() };
    }
    const cells = new globalThis.Map<string, MapMarker[]>();
    renderedActiveMarkers.forEach((marker) => {
      const key = `${Math.floor(marker.x / cellSize)}:${Math.floor(marker.y / cellSize)}`;
      const cell = cells.get(key) ?? [];
      cell.push(marker);
      cells.set(key, cell);
    });
    const ids = new Set<string>();
    const clusters = Array.from(cells.values())
      .filter(
        (items) =>
          items.length >= 3 && !items.some((marker) => selectedMarkerSet.has(marker.id))
      )
      .map((items) => {
        items.forEach((marker) => ids.add(marker.id));
        return {
          ids: items.map((marker) => marker.id),
          x: items.reduce((total, marker) => total + marker.x, 0) / items.length,
          y: items.reduce((total, marker) => total + marker.y, 0) / items.length
        };
      });
    return { clusters, ids };
  }, [renderedActiveMarkers, selectedMarkerSet, zoom]);

  const labelLayout = useMemo(() => {
    if (!activeMap) return { markerIds: new Set<string>(), regionIds: new Set<string>() };
    return resolveMapLabelVisibility(
      [
        ...renderedActiveMarkers
          .filter((marker) => !clusteredMarkers.ids.has(marker.id))
          .map((marker) => {
            const anchor = dragPreviews[marker.id] ?? marker;
            const placementPreview = labelPlacementPreviews[mapLabelPreviewKey("marker", marker.id)];
            return {
              id: marker.id,
              kind: "marker" as const,
              label: marker.label,
              minimumZoom: marker.labelPlacement.minZoom,
              pinned: marker.labelPlacement.locked,
              priority: marker.id === selectedMarker?.id ? 20 : 5,
              selected: selectedMarkerSet.has(marker.id),
              x: anchor.x + (placementPreview?.x ?? marker.labelPlacement.offsetX),
              y: anchor.y + (placementPreview?.y ?? marker.labelPlacement.offsetY)
                - (32 / Math.max(1, activeMap.height * zoom)) * 100
            };
          }),
        ...renderedActiveRegions
          .filter((region) => region.points.length >= 3)
          .map((region) => {
            const points = regionVertexPreview?.regionId === region.id
              ? regionVertexPreview.points
              : region.points;
            const centroid = calculateMapRegionMetrics({ points, holes: region.holes }).centroid;
            const placementPreview = labelPlacementPreviews[mapLabelPreviewKey("region", region.id)];
            return {
              id: region.id,
              kind: "region" as const,
              label: region.title,
              minimumZoom: region.labelPlacement.minZoom,
              pinned: region.labelPlacement.locked,
              priority: region.id === selectedRegion?.id ? 18 : 3,
              selected: selectedRegionSet.has(region.id),
              x: centroid.x + (placementPreview?.x ?? region.labelPlacement.offsetX),
              y: centroid.y + (placementPreview?.y ?? region.labelPlacement.offsetY)
            };
          })
      ],
      {
        mapHeight: activeMap.height,
        mapWidth: activeMap.width,
        showLabels,
        zoom
      }
    );
  }, [activeMap, clusteredMarkers.ids, dragPreviews, labelPlacementPreviews, regionVertexPreview, renderedActiveMarkers, renderedActiveRegions, selectedMarker, selectedMarkerSet, selectedRegion, selectedRegionSet, showLabels, zoom]);
  const visibleLabelIds = labelLayout.markerIds;
  const visibleRegionLabelIds = labelLayout.regionIds;

  function updateView(nextZoom: number, nextOffset: MapPoint) {
    const normalizedZoom = clamp(nextZoom, MIN_MAP_ZOOM, MAX_MAP_ZOOM);
    zoomRef.current = normalizedZoom;
    offsetRef.current = nextOffset;
    setZoom(normalizedZoom);
    setOffset(nextOffset);
  }

  const fitToView = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !activeMap) return;
    const availableWidth = Math.max(120, viewport.clientWidth - 28);
    const availableHeight = Math.max(120, viewport.clientHeight - 28);
    const nextZoom = clamp(
      Math.min(availableWidth / activeMap.width, availableHeight / activeMap.height),
      MIN_MAP_ZOOM,
      MAX_MAP_ZOOM
    );
    updateView(nextZoom, {
      x: Math.round((viewport.clientWidth - activeMap.width * nextZoom) / 2),
      y: Math.round((viewport.clientHeight - activeMap.height * nextZoom) / 2)
    });
  }, [activeMap?.height, activeMap?.id, activeMap?.width]);

  function fitContentToView() {
    const viewport = viewportRef.current;
    if (!viewport || !activeMap) return;
    const routePoints = visibleActiveRoutes.flatMap((route) =>
      route.stops
        .map((stop) => markerMap.get(stop.markerId))
        .filter((marker): marker is MapMarker => Boolean(marker))
    );
    const points: MapPoint[] = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      ...(activeMap.imageUrl
        ? getMapImageTransformBounds(
            activeMap,
            imageNaturalSizes[activeMap.imageUrl],
            activeMap.imageTransform
          )
        : []),
      ...activeLayers
        .filter(
          (layer) => layer.visible
            && layer.imageUrl
            && !phaseVisibility.layers.has(layer.id)
        )
        .flatMap((layer) =>
          getMapImageTransformBounds(
            activeMap,
            imageNaturalSizes[layer.imageUrl],
            layer.imageTransform
          )
        ),
      ...visibleActiveMarkers.map((marker) => dragPreviews[marker.id] ?? marker),
      ...visibleActiveRegions.flatMap((region) => region.points),
      ...routePoints,
      ...regionDraft,
      ...(regionDraftCursor ? [regionDraftCursor] : []),
      ...(measurement ? [measurement.start, measurement.end] : [])
    ];
    const minimumX = Math.min(...points.map((point) => point.x));
    const maximumX = Math.max(...points.map((point) => point.x));
    const minimumY = Math.min(...points.map((point) => point.y));
    const maximumY = Math.max(...points.map((point) => point.y));
    const contentWidth = Math.max(1, (activeMap.width * (maximumX - minimumX)) / 100);
    const contentHeight = Math.max(1, (activeMap.height * (maximumY - minimumY)) / 100);
    const availableWidth = Math.max(120, viewport.clientWidth - 56);
    const availableHeight = Math.max(120, viewport.clientHeight - 56);
    const nextZoom = clamp(
      Math.min(availableWidth / contentWidth, availableHeight / contentHeight),
      MIN_MAP_ZOOM,
      MAX_MAP_ZOOM
    );
    const centerX = (activeMap.width * (minimumX + maximumX)) / 200;
    const centerY = (activeMap.height * (minimumY + maximumY)) / 200;
    updateView(nextZoom, {
      x: Math.round(viewport.clientWidth / 2 - centerX * nextZoom),
      y: Math.round(viewport.clientHeight / 2 - centerY * nextZoom)
    });
  }

  function zoomAt(nextZoom: number, clientX?: number, clientY?: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const bounds = viewport.getBoundingClientRect();
    const anchorX = clientX === undefined ? bounds.width / 2 : clientX - bounds.left;
    const anchorY = clientY === undefined ? bounds.height / 2 : clientY - bounds.top;
    const currentZoom = zoomRef.current;
    const currentOffset = offsetRef.current;
    const mapX = (anchorX - currentOffset.x) / currentZoom;
    const mapY = (anchorY - currentOffset.y) / currentZoom;
    const normalizedZoom = clamp(nextZoom, MIN_MAP_ZOOM, MAX_MAP_ZOOM);
    updateView(normalizedZoom, {
      x: anchorX - mapX * normalizedZoom,
      y: anchorY - mapY * normalizedZoom
    });
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (!event.deltaY) return;
      const normalizedDelta = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? event.deltaY * 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? event.deltaY * viewport.clientHeight
          : event.deltaY;
      const factor = Math.exp(-clamp(normalizedDelta, -240, 240) * 0.0012);
      zoomAt(zoomRef.current * factor, event.clientX, event.clientY);
    };
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [activeMap?.id]);

  function centerMapPoint(xPercent: number, yPercent: number, nextZoom = zoomRef.current) {
    const viewport = viewportRef.current;
    if (!viewport || !activeMap) return;
    const normalizedZoom = clamp(nextZoom, MIN_MAP_ZOOM, MAX_MAP_ZOOM);
    updateView(normalizedZoom, {
      x: viewport.clientWidth / 2 - (activeMap.width * xPercent * normalizedZoom) / 100,
      y: viewport.clientHeight / 2 - (activeMap.height * yPercent * normalizedZoom) / 100
    });
  }

  function revealImageTransform(
    imageUrl: string,
    transform: MapImageTransform,
    naturalSize = imageNaturalSizes[imageUrl]
  ) {
    if (!activeMap) return;
    revealImageBounds(getMapImageBounds(
      getMapImageTransformBounds(activeMap, naturalSize, transform)
    ));
  }

  function getLayerImageSelectionBounds(
    layerIds: string[],
    transformOverrides: Record<string, MapImageTransform> = {}
  ) {
    if (!activeMap) return null;
    const points = activeLayers
      .filter((layer) => layerIds.includes(layer.id) && Boolean(layer.imageUrl))
      .flatMap((layer) =>
        getMapImageTransformBounds(
          activeMap,
          imageNaturalSizes[layer.imageUrl],
          transformOverrides[layer.id] ?? layer.imageTransform
        )
      );
    return points.length ? getMapImageBounds(points) : null;
  }

  function revealImageBounds(bounds: MapImageBounds) {
    const viewport = viewportRef.current;
    if (!viewport || !activeMap) return;
    const { bottom, left, right, top } = bounds;
    const currentZoom = zoomRef.current;
    const currentOffset = offsetRef.current;
    const padding = 64;
    const screenLeft = currentOffset.x + (activeMap.width * left * currentZoom) / 100;
    const screenRight = currentOffset.x + (activeMap.width * right * currentZoom) / 100;
    const screenTop = currentOffset.y + (activeMap.height * top * currentZoom) / 100;
    const screenBottom = currentOffset.y + (activeMap.height * bottom * currentZoom) / 100;
    if (
      screenLeft >= padding
      && screenRight <= viewport.clientWidth - padding
      && screenTop >= padding
      && screenBottom <= viewport.clientHeight - padding
    ) return;
    const contentWidth = Math.max(1, (activeMap.width * (right - left)) / 100);
    const contentHeight = Math.max(1, (activeMap.height * (bottom - top)) / 100);
    const fitZoom = clamp(
      Math.min(
        Math.max(120, viewport.clientWidth - padding * 2) / contentWidth,
        Math.max(120, viewport.clientHeight - padding * 2) / contentHeight
      ),
      MIN_MAP_ZOOM,
      MAX_MAP_ZOOM
    );
    const nextZoom = Math.min(currentZoom, fitZoom);
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    updateView(nextZoom, {
      x: viewport.clientWidth / 2 - (activeMap.width * centerX * nextZoom) / 100,
      y: viewport.clientHeight / 2 - (activeMap.height * centerY * nextZoom) / 100
    });
  }

  function captureCurrentMapView(): Omit<
    MapViewBookmark,
    "createdAt" | "id" | "title" | "updatedAt"
  > | null {
    const viewport = viewportRef.current;
    if (!viewport || !activeMap) return null;
    return {
      centerX: ((viewport.clientWidth / 2 - offsetRef.current.x) / (
        activeMap.width * zoomRef.current
      )) * 100,
      centerY: ((viewport.clientHeight / 2 - offsetRef.current.y) / (
        activeMap.height * zoomRef.current
      )) * 100,
      zoom: zoomRef.current,
      storyPhaseId: selectedStoryPhaseId,
      mode,
      showLabels
    };
  }

  function saveMapViewBookmark() {
    if (!activeMap) return;
    const view = captureCurrentMapView();
    if (!view) return;
    const index = activeMap.viewBookmarks.length + 1;
    const bookmark = createMapViewBookmark(index, {
      ...view,
      title: bookmarkDraftTitle.trim() || `视图 ${index}`
    });
    onUpdateMap(activeMap.id, {
      viewBookmarks: [...activeMap.viewBookmarks, bookmark]
    });
    setBookmarkDraftTitle("");
  }

  function openMapViewBookmark(bookmark: MapViewBookmark) {
    changeMode(bookmark.mode);
    setSelectedStoryPhaseId(
      !bookmark.storyPhaseId
        || activeMap?.storyPhases.some((phase) => phase.id === bookmark.storyPhaseId)
        ? bookmark.storyPhaseId
        : ""
    );
    setShowLabels(bookmark.showLabels);
    centerMapPoint(bookmark.centerX, bookmark.centerY, bookmark.zoom);
    setBookmarkMenuOpen(false);
  }

  function updateMapViewBookmark(
    bookmarkId: string,
    patch: Partial<MapViewBookmark>
  ) {
    if (!activeMap) return;
    onUpdateMap(activeMap.id, {
      viewBookmarks: activeMap.viewBookmarks.map((bookmark) =>
        bookmark.id === bookmarkId
          ? { ...bookmark, ...patch, updatedAt: new Date().toISOString() }
          : bookmark
      )
    });
  }

  function overwriteMapViewBookmark(bookmarkId: string) {
    const view = captureCurrentMapView();
    if (view) updateMapViewBookmark(bookmarkId, view);
  }

  function deleteMapViewBookmark(bookmarkId: string) {
    if (!activeMap) return;
    onUpdateMap(activeMap.id, {
      viewBookmarks: activeMap.viewBookmarks.filter((bookmark) => bookmark.id !== bookmarkId)
    });
  }

  function prepareMapPoint(point: MapPoint) {
    return activeMap ? snapMapPointToGrid(activeMap, point) : point;
  }

  function mapPointFromClient(clientX: number, clientY: number) {
    const stage = stageRef.current;
    if (!stage) return null;
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    return prepareMapPoint({
      x: ((clientX - bounds.left) / bounds.width) * 100,
      y: ((clientY - bounds.top) / bounds.height) * 100
    });
  }

  function startMeasurement(point?: MapPoint) {
    const initial = point ? prepareMapPoint(point) : null;
    setCanvasTool("measure");
    setPlacing(false);
    setRegionDraft([]);
    setRegionHoleTargetId("");
    setRegionDrawingError("");
    setRegionDraftCursor(null);
    setMeasurement(initial ? { complete: false, end: initial, start: initial } : null);
    setContextMenu(null);
  }

  function addMeasurementPoint(point: MapPoint) {
    const next = prepareMapPoint(point);
    setMeasurement((current) =>
      !current || current.complete
        ? { complete: false, end: next, start: next }
        : { ...current, complete: true, end: next }
    );
  }

  function openMapSettings() {
    setFullscreenDockTab("properties");
    setInspectorCollapsed(false);
    setSelectedStructure(null);
    setSelectedMarkerIds([]);
    setSelectedRegionIds([]);
    setSelectedRegionId("");
    setEditingRegionId("");
    setRegionIsolationEnabled(false);
    onSelectMarker("");
    onSelectRoute("");
  }

  function toggleMapFullscreen() {
    if (!isFullscreen) {
      setInspectorCollapsed(false);
      setFullscreenDockTab(mode === "layers" ? "layers" : "properties");
    }
    setIsFullscreen((current) => !current);
  }

  function mapReviewTargetExists(finding: Pick<MapReviewFinding, "targetId" | "targetType">) {
    if (!activeMap) return false;
    if (finding.targetType === "map") return finding.targetId === activeMap.id;
    if (finding.targetType === "marker") {
      return activeMarkers.some((marker) => marker.id === finding.targetId);
    }
    if (finding.targetType === "route") {
      return activeRoutes.some((route) => route.id === finding.targetId);
    }
    return activeRegions.some((region) => region.id === finding.targetId);
  }

  function getMapReviewTargetLabel(
    finding: Pick<MapReviewFinding, "targetId" | "targetType">
  ) {
    if (finding.targetType === "map") return activeMap?.title ?? "地图";
    if (finding.targetType === "marker") {
      return activeMarkers.find((marker) => marker.id === finding.targetId)?.label ?? "标记";
    }
    if (finding.targetType === "route") {
      return activeRoutes.find((route) => route.id === finding.targetId)?.title ?? "路线";
    }
    return activeRegions.find((region) => region.id === finding.targetId)?.title ?? "区域";
  }

  async function refreshMapVersions() {
    if (!activeMap) return;
    const mapId = activeMap.id;
    setVersionStatus({ kind: "working", message: "正在读取地图版本..." });
    const result = await onLoadMapVersions(mapId);
    if (activeMapId && activeMapId !== mapId) return;
    if (!result.ok) {
      setMapVersions([]);
      setSelectedVersionId(null);
      setVersionStatus({
        kind: "error",
        message: result.error ?? "地图版本读取失败"
      });
      return;
    }
    setMapVersions(result.versions);
    setSelectedVersionId(result.versions[0]?.id ?? null);
    setVersionStatus({
      kind: "success",
      message: result.versions.length
        ? `已读取 ${result.versions.length} 个历史版本`
        : "这张地图还没有历史版本"
    });
  }

  function openMapReviewCenter(tab: "intelligence" | "versions" = "intelligence") {
    setBookmarkMenuOpen(false);
    setReviewTab(tab);
    setReviewDialogOpen(true);
    if (tab === "versions" && versionStatus.kind === "idle") {
      void refreshMapVersions();
    }
  }

  async function runMapAiReview() {
    if (!activeMap || aiReviewStatus.kind === "working") return;
    const requestedMapId = activeMap.id;
    setAiReviewStatus({ kind: "working", message: "AI 正在审阅空间叙事与任务动线..." });
    const result = await onCompleteAi({
      maxTokens: 2400,
      systemPrompt: mapAiReviewSystemPrompt,
      prompt: `${buildMapAiReviewPrompt({
        map: activeMap,
        markers: activeMarkers,
        routes: activeRoutes
      })}\n\n本地几何与引用检查：\n${JSON.stringify(localMapFindings, null, 2)}`
    });
    if (activeMapId && activeMapId !== requestedMapId) return;
    if (!result.ok || !result.text) {
      setAiReviewStatus({
        kind: "error",
        message: result.error ?? "AI 没有返回审阅结果"
      });
      return;
    }
    const parsed = parseMapAiReviewResponse(result.text);
    const suggestions = parsed.suggestions.filter(mapReviewTargetExists);
    setAiSuggestions(suggestions);
    setAiReviewStatus({
      kind: suggestions.length ? "success" : "error",
      message: suggestions.length
        ? `${result.model ? `${result.model} · ` : ""}已生成 ${suggestions.length} 条可定位建议`
        : parsed.error ?? "AI 没有返回适用于当前地图的建议"
    });
  }

  function locateMapReviewTarget(
    finding: Pick<MapReviewFinding, "targetId" | "targetType">
  ) {
    if (!activeMap || !mapReviewTargetExists(finding)) return;
    setReviewDialogOpen(false);
    if (finding.targetType === "marker") {
      const marker = activeMarkers.find((item) => item.id === finding.targetId);
      if (!marker) return;
      selectMarker(marker.id);
      centerMapPoint(marker.x, marker.y, Math.max(zoomRef.current, 0.8));
    } else if (finding.targetType === "route") {
      const route = activeRoutes.find((item) => item.id === finding.targetId);
      if (!route) return;
      selectRoute(route.id);
      const points = getMapRoutePathPoints(route, activeMarkers);
      if (points.length) {
        centerMapPoint(
          points.reduce((total, point) => total + point.x, 0) / points.length,
          points.reduce((total, point) => total + point.y, 0) / points.length,
          Math.max(zoomRef.current, 0.65)
        );
      }
    } else if (finding.targetType === "region") {
      const region = activeRegions.find((item) => item.id === finding.targetId);
      if (!region) return;
      selectRegion(region.id);
      const centroid = calculateMapRegionMetrics(region).centroid;
      centerMapPoint(centroid.x, centroid.y, Math.max(zoomRef.current, 0.7));
    } else {
      openMapSettings();
    }
  }

  function applyMapAiSuggestion(suggestion: MapAiSuggestion) {
    if (!activeMap || !mapReviewTargetExists(suggestion)) return;
    const patch = getSafeMapAiPatch(suggestion);
    if (!Object.keys(patch).length) return;
    if (suggestion.targetType === "map") {
      onUpdateMap(activeMap.id, patch as Partial<WorldMap>);
    } else if (suggestion.targetType === "marker") {
      onUpdateMarker(suggestion.targetId, patch as Partial<MapMarker>);
    } else if (suggestion.targetType === "route") {
      onUpdateRoute(suggestion.targetId, patch as Partial<MapRoute>);
    } else {
      updateRegion(suggestion.targetId, patch as Partial<MapRegion>);
    }
    setAiSuggestions((current) => current.filter((item) => item.id !== suggestion.id));
    setAiReviewStatus({
      kind: "success",
      message: `已直接应用“${suggestion.title}”中的安全修改`
    });
  }

  async function restoreSelectedMapVersion() {
    if (!selectedMapVersion || versionStatus.kind === "working") return;
    setVersionStatus({ kind: "working", message: "正在创建备份并恢复地图版本..." });
    const result = await onRestoreMapVersion(selectedMapVersion);
    if (result.canceled) {
      setVersionStatus({ kind: "idle", message: "已取消恢复" });
      return;
    }
    if (!result.ok) {
      setVersionStatus({
        kind: "error",
        message: result.error ?? "地图版本恢复失败"
      });
      return;
    }
    setReviewDialogOpen(false);
    setVersionStatus({ kind: "success", message: "地图版本已恢复" });
  }

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    if (!dragRef.current) {
      setDragPreviews((current) => Object.keys(current).length ? {} : current);
    }
  }, [markers]);

  useEffect(() => {
    if (!routeWaypointDragRef.current) {
      setRouteWaypointPreviews((current) => Object.keys(current).length ? {} : current);
    }
  }, [routes]);

  useEffect(() => {
    if (!labelDragRef.current) {
      setLabelPlacementPreviews((current) => Object.keys(current).length ? {} : current);
    }
  }, [activeMap?.regions, markers]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => {
      setViewportSize({
        height: Math.round(entry.contentRect.height),
        width: Math.round(entry.contentRect.width)
      });
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [activeMap?.id]);

  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(fitToView);
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [activeMap?.id, browserCollapsed, fitToView, inspectorCollapsed, isFullscreen]);

  useEffect(() => {
    if (canvasTool !== "pan" || placing) {
      setIsImageTransformMode(false);
      setTransformingLayerImageId("");
      setTransformingLayerImageIds([]);
      setLayerImageTransformPreviews({});
      setImageSnapGuides({ horizontal: null, vertical: null });
    }
  }, [canvasTool, placing]);

  useEffect(() => {
    if (!isImageTransformMode || activeTransformImageUrl) return;
    setIsImageTransformMode(false);
    setTransformingLayerImageId("");
    setTransformingLayerImageIds([]);
    setImageTransformPreview(null);
    setLayerImageTransformPreviews({});
    setImageSnapGuides({ horizontal: null, vertical: null });
    imageTransformDragRef.current = null;
  }, [activeTransformImageUrl, isImageTransformMode]);

  useEffect(() => {
    if (!pendingTransformLayerId || !pendingTransformLayer?.imageUrl) return;
    setPendingTransformLayerId("");
    startLayerImageTransformMode(pendingTransformLayerId);
  }, [pendingTransformLayer?.imageUrl, pendingTransformLayerId]);

  useEffect(() => {
    if (!isImageTransformMode || !activeTransformImageUrl) return;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        const selectionBounds = transformingLayerImageIds.length > 1
          ? getLayerImageSelectionBounds(transformingLayerImageIds)
          : null;
        if (selectionBounds) revealImageBounds(selectionBounds);
        else revealImageTransform(activeTransformImageUrl, activeImageTransform);
      });
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [activeTransformImageUrl, isImageTransformMode, transformingLayerImageId, transformingLayerImageIds.join("|")]);

  useEffect(() => {
    setDragPreviews({});
    setQuery("");
    setMarkerKindFilter("");
    setMarkerLayerFilter("");
    setMarkerGroupFilter("");
    setRouteStatusFilter("");
    setRegionKindFilter("");
    setSelectedSavedFilterId("");
    setFilterSaveDraftOpen(false);
    setFilterSaveTitle("");
    setBookmarkMenuOpen(false);
    setBookmarkDraftTitle("");
    setReviewDialogOpen(false);
    setReviewTab("intelligence");
    setAiSuggestions([]);
    setAiReviewStatus({ kind: "idle", message: "" });
    setMapVersions([]);
    setSelectedVersionId(null);
    setVersionStatus({ kind: "idle", message: "" });
    setSelectedStoryPhaseId("");
    setSelectedMarkerIds([]);
    setSelectedRegionIds([]);
    setSelectedRegionId("");
    setEditingRegionId("");
    setRegionIsolationEnabled(false);
    setRegionDraft([]);
    setRegionHoleTargetId("");
    setRegionDrawingError("");
    setRegionDraftCursor(null);
    setRegionVertexPreview(null);
    setRouteWaypointPreviews({});
    setLabelPlacementPreviews({});
    setMeasurement(null);
    setIsImageDropActive(false);
    setIsImageTransformMode(false);
    setTransformingLayerImageId("");
    setTransformingLayerImageIds([]);
    setSelectedImageLayerIds([]);
    setPendingTransformLayerId("");
    setImageTransformPreview(null);
    setLayerImageTransformPreviews({});
    setImageSnapGuides({ horizontal: null, vertical: null });
    setContextMenu(null);
    setMarquee(null);
    dragRef.current = null;
    imageTransformDragRef.current = null;
    regionVertexDragRef.current = null;
    routeWaypointDragRef.current = null;
    labelDragRef.current = null;
    marqueeRef.current = null;
  }, [activeMap?.id]);

  useEffect(() => {
    const availableIds = new Set(activeLayers.filter((layer) => layer.imageUrl).map((layer) => layer.id));
    setSelectedImageLayerIds((current) => current.filter((id) => availableIds.has(id)));
    if (transformingLayerImageIds.some((id) => !availableIds.has(id))) {
      stopImageTransformMode();
    }
  }, [activeMap?.id, layers]);

  useEffect(() => {
    if (
      selectedStoryPhaseId
      && !activeMap?.storyPhases.some((phase) => phase.id === selectedStoryPhaseId)
    ) {
      setSelectedStoryPhaseId("");
    }
  }, [activeMap?.storyPhases, selectedStoryPhaseId]);

  useEffect(() => {
    if (selectedMarkerId && activeMarkers.some((marker) => marker.id === selectedMarkerId)) {
      setSelectedMarkerIds((current) =>
        current.includes(selectedMarkerId) ? current : [selectedMarkerId]
      );
    } else if (!selectedMarkerId) {
      setSelectedMarkerIds([]);
    }
  }, [activeMap?.id, selectedMarkerId]);

  useEffect(() => {
    if (!editingRegionId) return;
    const editingRegion = activeRegions.find((region) => region.id === editingRegionId);
    if (
      mode !== "regions"
      || canvasTool !== "pan"
      || selectedRegionId !== editingRegionId
      || !editingRegion?.visible
      || editingRegion.locked
    ) {
      regionVertexDragRef.current = null;
      setRegionVertexPreview(null);
      setEditingRegionId("");
    }
  }, [activeRegions, canvasTool, editingRegionId, mode, selectedRegionId]);

  useEffect(() => {
    document.body.classList.toggle("map-focus-open", isFullscreen);
    return () => document.body.classList.remove("map-focus-open");
  }, [isFullscreen]);

  useEffect(() => {
    const layerFocusActive = isFullscreen && mode === "layers";
    if (layerFocusActive && fullscreenLayerBrowserStateRef.current === null) {
      fullscreenLayerBrowserStateRef.current = browserCollapsed;
      setBrowserCollapsed(true);
      return;
    }
    if (!layerFocusActive && fullscreenLayerBrowserStateRef.current !== null) {
      const previousState = fullscreenLayerBrowserStateRef.current;
      fullscreenLayerBrowserStateRef.current = null;
      setBrowserCollapsed(previousState);
    }
  }, [isFullscreen, mode]);

  useEffect(() => {
    if (!contextMenu) return;
    const frame = requestAnimationFrame(() => {
      contextMenuRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [contextMenu]);

  useEffect(() => {
    if (!exportDialogOpen) return;
    const frame = requestAnimationFrame(() => exportDialogRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [exportDialogOpen]);

  useEffect(() => {
    if (!reviewDialogOpen) return;
    const frame = requestAnimationFrame(() => reviewDialogRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [reviewDialogOpen]);

  useEffect(() => {
    if (!bookmarkMenuOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!bookmarkMenuRef.current?.contains(event.target as Node)) {
        setBookmarkMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
  }, [bookmarkMenuOpen]);

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.key === "Tab" && isFullscreen) {
        const focusable = Array.from(
          workspaceRef.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])"
          ) ?? []
        ).filter((element) => element.offsetParent !== null);
        const first = focusable[0];
        const last = focusable.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      const editing = Boolean(
        target?.closest("input, textarea, select, [contenteditable='true']")
      );
      if (event.key === "Escape") {
        if (reviewDialogOpen) {
          if (aiReviewStatus.kind !== "working" && versionStatus.kind !== "working") {
            setReviewDialogOpen(false);
          }
        }
        else if (exportDialogOpen) {
          if (exportStatus.kind !== "working") setExportDialogOpen(false);
        }
        else if (bookmarkMenuOpen) setBookmarkMenuOpen(false);
        else if (contextMenu) setContextMenu(null);
        else if (isImageTransformMode) {
          stopImageTransformMode();
        }
        else if (marqueeRef.current) {
          marqueeRef.current = null;
          setMarquee(null);
        } else if (regionDraft.length) {
          setRegionDraft([]);
          setRegionHoleTargetId("");
          setRegionDraftCursor(null);
          setCanvasTool("pan");
        } else if (measurement) {
          setMeasurement(null);
          setCanvasTool("pan");
        } else if (placing) setPlacing(false);
        else if (canvasTool !== "pan") {
          if (canvasTool === "region") setRegionHoleTargetId("");
          setCanvasTool("pan");
        }
        else if (editingRegionId) setEditingRegionId("");
        else if (
          selectedMarkerIds.length
          || selectedRegionIds.length
          || selectedRouteId
          || selectedStructure
        ) clearMapSelection();
        else if (isFullscreen) setIsFullscreen(false);
        return;
      }
      if (editing) return;
      if (canvasTool === "region" && event.key === "Backspace" && regionDraft.length) {
        event.preventDefault();
        setRegionDraft((current) => current.slice(0, -1));
      } else if (canvasTool === "region" && event.key === "Enter" && regionDraft.length >= 3) {
        event.preventDefault();
        finishRegionDrawing();
      } else if (canvasTool === "route" && event.key === "Backspace" && selectedRoute?.stops.length) {
        event.preventDefault();
        onUpdateRoute(selectedRoute.id, { stops: selectedRoute.stops.slice(0, -1) });
      } else if (canvasTool === "route" && event.key === "Enter") {
        event.preventDefault();
        setCanvasTool("pan");
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) onRedoMapOperation();
        else onUndoMapOperation();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "y") {
        event.preventDefault();
        onRedoMapOperation();
      } else if ((event.ctrlKey || event.metaKey) && event.key === "0") {
        event.preventDefault();
        fitToView();
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomAt(zoomRef.current * 1.15);
      } else if (event.key === "-") {
        event.preventDefault();
        zoomAt(zoomRef.current / 1.15);
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [aiReviewStatus.kind, bookmarkMenuOpen, canvasTool, contextMenu, editingRegionId, exportDialogOpen, exportStatus.kind, isFullscreen, isImageTransformMode, measurement, onRedoMapOperation, onUndoMapOperation, placing, regionDraft, reviewDialogOpen, selectedMarkerIds, selectedRegionIds, selectedRoute, selectedRouteId, selectedStructure, versionStatus.kind]);

  function clearMapSelection() {
    setSelectedStructure(null);
    setSelectedMarkerIds([]);
    setSelectedRegionIds([]);
    setSelectedRegionId("");
    setEditingRegionId("");
    setRegionIsolationEnabled(false);
    onSelectMarker("");
    onSelectRoute("");
  }

  function selectMap(mapId: string) {
    setPlacing(false);
    setNextStopMarkerId("");
    setSelectedStructure(null);
    setSelectedMarkerIds([]);
    setSelectedRegionIds([]);
    setSelectedRegionId("");
    setEditingRegionId("");
    setRegionIsolationEnabled(false);
    setRegionDraft([]);
    setRegionHoleTargetId("");
    setRegionDrawingError("");
    setRegionDraftCursor(null);
    setMeasurement(null);
    setCanvasTool("pan");
    setContextMenu(null);
    onSelectMap(mapId);
  }

  function changeMode(nextMode: MapWorkspaceMode) {
    setMode(nextMode);
    setFullscreenDockTab(nextMode === "layers" ? "layers" : "properties");
    stopImageTransformMode();
    if (nextMode !== "layers") setSelectedImageLayerIds([]);
    setPlacing(false);
    clearCatalogFilters();
    setContextMenu(null);
    setRegionDraft([]);
    setRegionDraftCursor(null);
    setMeasurement(null);
    if (nextMode === "regions") {
      setCanvasTool("pan");
      setSelectedMarkerIds([]);
      setSelectedStructure(null);
      onSelectMarker("");
      onSelectRoute("");
      const nextRegionId = activeRegions.some((region) => region.id === selectedRegionId)
        ? selectedRegionId
        : activeRegions[0]?.id ?? "";
      setSelectedRegionId(nextRegionId);
      setSelectedRegionIds(nextRegionId ? [nextRegionId] : []);
    } else if (nextMode === "layers") {
      setCanvasTool("pan");
      setSelectedMarkerIds([]);
      setSelectedRegionIds([]);
      setSelectedRegionId("");
      setEditingRegionId("");
      setRegionIsolationEnabled(false);
      onSelectMarker("");
      onSelectRoute("");
      const firstLayer = activeLayers[0];
      setActivePaletteLayerId(firstLayer?.id ?? "");
      setSelectedStructure(firstLayer ? { kind: "layer", id: firstLayer.id } : null);
    } else {
      setSelectedStructure(null);
      setSelectedRegionIds([]);
      setSelectedRegionId("");
      setEditingRegionId("");
      setRegionIsolationEnabled(false);
    }
  }

  function clearCatalogFilters() {
    setQuery("");
    setMarkerKindFilter("");
    setMarkerLayerFilter("");
    setMarkerGroupFilter("");
    setRouteStatusFilter("");
    setRegionKindFilter("");
    setSelectedSavedFilterId("");
  }

  function applySavedFilter(filter: MapSavedFilter) {
    setMode(filter.mode);
    setQuery(filter.query);
    setMarkerKindFilter(filter.markerKinds[0] ?? "");
    setMarkerLayerFilter(filter.layerIds[0] ?? "");
    setMarkerGroupFilter(filter.groupIds[0] ?? "");
    setRouteStatusFilter(filter.routeStatuses[0] ?? "");
    setRegionKindFilter(filter.regionKinds[0] ?? "");
    setSelectedSavedFilterId(filter.id);
    setFilterSaveDraftOpen(false);
  }

  function saveCurrentFilter() {
    if (!activeMap) return;
    const title = filterSaveTitle.trim() || `筛选 ${activeMap.savedFilters.length + 1}`;
    const filter = createMapSavedFilter(activeMap.savedFilters.length + 1, {
      title,
      mode,
      query,
      markerKinds: mode === "markers" && markerKindFilter ? [markerKindFilter] : [],
      regionKinds: mode === "regions" && regionKindFilter ? [regionKindFilter] : [],
      routeStatuses: mode === "routes" && routeStatusFilter ? [routeStatusFilter] : [],
      layerIds: mode === "markers" && markerLayerFilter ? [markerLayerFilter] : [],
      groupIds: mode === "markers" && markerGroupFilter ? [markerGroupFilter] : []
    });
    onUpdateMap(activeMap.id, { savedFilters: [...activeMap.savedFilters, filter] });
    setSelectedSavedFilterId(filter.id);
    setFilterSaveDraftOpen(false);
    setFilterSaveTitle("");
  }

  function deleteSelectedSavedFilter() {
    if (!activeMap || !selectedSavedFilterId) return;
    onUpdateMap(activeMap.id, {
      savedFilters: activeMap.savedFilters.filter((filter) => filter.id !== selectedSavedFilterId)
    });
    setSelectedSavedFilterId("");
  }

  function applyMarkerSelection(markerIds: string[], primaryId?: string) {
    const validIds = Array.from(new Set(markerIds)).filter((id) =>
      activeMarkers.some((marker) => marker.id === id)
    );
    const nextPrimary = primaryId && validIds.includes(primaryId)
      ? primaryId
      : validIds.at(-1) ?? "";
    setSelectedMarkerIds(validIds);
    onSelectMarker(nextPrimary);
  }

  function selectMarker(markerId: string, additive = false) {
    stopImageTransformMode();
    setSelectedImageLayerIds([]);
    setMode("markers");
    setFullscreenDockTab("properties");
    setSelectedStructure(null);
    setSelectedRegionIds([]);
    setSelectedRegionId("");
    setEditingRegionId("");
    setRegionIsolationEnabled(false);
    if (!additive) {
      applyMarkerSelection([markerId], markerId);
      return;
    }
    const nextIds = selectedMarkerSet.has(markerId)
      ? selectedMarkerIds.filter((id) => id !== markerId)
      : [...selectedMarkerIds, markerId];
    applyMarkerSelection(nextIds, nextIds.includes(markerId) ? markerId : undefined);
  }

  function selectRoute(routeId: string) {
    stopImageTransformMode();
    setSelectedImageLayerIds([]);
    setMode("routes");
    setFullscreenDockTab("properties");
    setSelectedStructure(null);
    setSelectedMarkerIds([]);
    setSelectedRegionIds([]);
    setSelectedRegionId("");
    setEditingRegionId("");
    setRegionIsolationEnabled(false);
    onSelectRoute(routeId);
  }

  function applyRegionSelection(regionIds: string[], primaryId?: string) {
    const validIds = Array.from(new Set(regionIds)).filter((id) =>
      activeRegions.some((region) => region.id === id)
    );
    const nextPrimary = primaryId && validIds.includes(primaryId)
      ? primaryId
      : validIds.at(-1) ?? "";
    setSelectedRegionIds(validIds);
    setSelectedRegionId(nextPrimary);
    if (!validIds.length) {
      setEditingRegionId("");
      setRegionIsolationEnabled(false);
    }
  }

  function selectRegion(regionId: string, editBoundary = false, additive = false) {
    stopImageTransformMode();
    setSelectedImageLayerIds([]);
    setMode("regions");
    setFullscreenDockTab("properties");
    setSelectedStructure(null);
    setSelectedMarkerIds([]);
    if (additive && !editBoundary) {
      const nextIds = selectedRegionSet.has(regionId)
        ? selectedRegionIds.filter((id) => id !== regionId)
        : [...selectedRegionIds, regionId];
      applyRegionSelection(nextIds, nextIds.includes(regionId) ? regionId : undefined);
      setEditingRegionId("");
    } else {
      applyRegionSelection([regionId], regionId);
      setEditingRegionId(editBoundary ? regionId : "");
    }
    onSelectMarker("");
    onSelectRoute("");
  }

  function selectAllVisibleMarkers() {
    const ids = visibleActiveMarkers.map((marker) => marker.id);
    applyMarkerSelection(ids, ids.at(-1));
    setMode("markers");
    setSelectedRegionIds([]);
    setSelectedRegionId("");
    setEditingRegionId("");
    setRegionIsolationEnabled(false);
  }

  function batchUpdateSelected(patch: Partial<MapMarker>) {
    if (!selectedEditableMarkers.length) return;
    onUpdateMarkers(
      selectedEditableMarkers.map((marker) => ({ markerId: marker.id, patch }))
    );
  }

  function createRouteForDrawing(firstMarker?: MapMarker) {
    if (!activeMap) return "";
    const routeId = onCreateRoute(activeMap.id);
    if (!routeId) return "";
    if (firstMarker) {
      const stop = createMapRouteStop(firstMarker.id, 1);
      stop.title = firstMarker.label;
      onUpdateRoute(routeId, { stops: [stop] });
    }
    setMode("routes");
    setSelectedMarkerIds([]);
    setSelectedRegionIds([]);
    setSelectedRegionId("");
    setEditingRegionId("");
    setRegionIsolationEnabled(false);
    setSelectedStructure(null);
    setMeasurement(null);
    setCanvasTool("route");
    setContextMenu(null);
    return routeId;
  }

  function toggleRouteTool() {
    if (canvasTool === "route") {
      setCanvasTool("pan");
      return;
    }
    if (selectedRoute) {
      setMode("routes");
      setSelectedMarkerIds([]);
      setSelectedRegionIds([]);
      setSelectedRegionId("");
      setEditingRegionId("");
      setRegionIsolationEnabled(false);
      setSelectedStructure(null);
      setMeasurement(null);
      setCanvasTool("route");
    } else {
      createRouteForDrawing();
    }
  }

  function appendMarkerToRoute(marker: MapMarker) {
    if (!selectedRoute) {
      createRouteForDrawing(marker);
      return;
    }
    if (selectedRoute.stops.at(-1)?.markerId === marker.id) return;
    const stop = createMapRouteStop(marker.id, selectedRoute.stops.length + 1);
    stop.title = marker.label;
    onUpdateRoute(selectedRoute.id, { stops: [...selectedRoute.stops, stop] });
  }

  function removeMarkerFromRoute(markerId: string) {
    if (!selectedRoute) return;
    onUpdateRoute(selectedRoute.id, {
      stops: selectedRoute.stops.filter((stop) => stop.markerId !== markerId)
    });
  }

  function createStoryPhase() {
    if (!activeMap) return;
    const phase = createMapStoryPhase(activeMap.storyPhases.length + 1);
    onUpdateMap(activeMap.id, { storyPhases: [...activeMap.storyPhases, phase] });
    setSelectedStoryPhaseId(phase.id);
    setSelectedStructure(null);
    setSelectedRegionIds([]);
    setSelectedRegionId("");
    setEditingRegionId("");
    setRegionIsolationEnabled(false);
    onSelectMarker("");
    onSelectRoute("");
  }

  function updateStoryPhase(phaseId: string, patch: Partial<MapStoryPhase>) {
    if (!activeMap) return;
    onUpdateMap(activeMap.id, {
      storyPhases: activeMap.storyPhases.map((phase, index) =>
        phase.id === phaseId
          ? normalizeMapStoryPhase(
              { ...phase, ...patch, updatedAt: new Date().toISOString() },
              index + 1
            )
          : phase
      )
    });
  }

  function deleteStoryPhase(phase: MapStoryPhase) {
    if (!activeMap || !window.confirm(`删除剧情阶段“${phase.title}”？地图内容本身不会被删除。`)) {
      return;
    }
    onUpdateMap(activeMap.id, {
      storyPhases: activeMap.storyPhases.filter((item) => item.id !== phase.id)
    });
    setSelectedStoryPhaseId("");
  }

  function setPhaseItemVisibility(
    field: MapPhaseVisibilityField,
    itemId: string,
    visible: boolean
  ) {
    if (!activeStoryPhase) return;
    const hiddenIds = new Set(activeStoryPhase[field]);
    if (visible) hiddenIds.delete(itemId);
    else hiddenIds.add(itemId);
    updateStoryPhase(activeStoryPhase.id, { [field]: Array.from(hiddenIds) });
  }

  function updateRegion(regionId: string, patch: Partial<MapRegion>) {
    if (!activeMap) return;
    onUpdateMap(activeMap.id, {
      regions: activeMap.regions.map((region) =>
        region.id === regionId
          ? { ...region, ...patch, updatedAt: new Date().toISOString() }
          : region
      )
    });
  }

  function batchUpdateSelectedRegions(patch: Partial<MapRegion>) {
    if (!activeMap || !selectedRegionIds.length) return;
    const selectedIds = new Set(selectedRegionIds);
    const updatedAt = new Date().toISOString();
    onUpdateMap(activeMap.id, {
      regions: activeMap.regions.map((region) =>
        selectedIds.has(region.id) ? { ...region, ...patch, updatedAt } : region
      )
    });
  }

  function deleteSelectedRegions() {
    if (!activeMap || !selectedRegionIds.length) return;
    if (!window.confirm(`删除选中的 ${selectedRegionIds.length} 个区域？`)) return;
    const selectedIds = new Set(selectedRegionIds);
    onUpdateMap(activeMap.id, {
      regions: activeMap.regions.filter((region) => !selectedIds.has(region.id)),
      storyPhases: activeMap.storyPhases.map((phase) => ({
        ...phase,
        hiddenRegionIds: phase.hiddenRegionIds.filter((id) => !selectedIds.has(id))
      }))
    });
    applyRegionSelection([]);
  }

  function startRegionDrawing(firstPoint?: MapRegionPoint) {
    const preparedFirstPoint = firstPoint ? prepareMapPoint(firstPoint) : null;
    setMode("regions");
    setSelectedStructure(null);
    setSelectedMarkerIds([]);
    setSelectedRegionIds([]);
    setSelectedRegionId("");
    setEditingRegionId("");
    setRegionIsolationEnabled(false);
    onSelectMarker("");
    onSelectRoute("");
    setPlacing(false);
    setMeasurement(null);
    setCanvasTool("region");
    setRegionHoleTargetId("");
    setRegionDrawingError("");
    setRegionDraft(preparedFirstPoint ? [preparedFirstPoint] : []);
    setRegionDraftCursor(preparedFirstPoint);
    setContextMenu(null);
  }

  function startRegionHoleDrawing(region: MapRegion) {
    if (region.locked || !region.visible) return;
    setMode("regions");
    applyRegionSelection([region.id], region.id);
    setEditingRegionId("");
    setPlacing(false);
    setMeasurement(null);
    setCanvasTool("region");
    setRegionHoleTargetId(region.id);
    setRegionDrawingError("");
    setRegionDraft([]);
    setRegionDraftCursor(null);
    setContextMenu(null);
  }

  function finishRegionDrawing() {
    if (!activeMap || regionDraft.length < 3) return;
    const points = regionDraft.filter(
      (point, index) =>
        index === 0 || Math.hypot(point.x - regionDraft[index - 1].x, point.y - regionDraft[index - 1].y) > 0.15
    );
    if (points.length < 3) return;
    const holeTarget = regionHoleTargetId
      ? activeMap.regions.find((region) => region.id === regionHoleTargetId)
      : null;
    if (holeTarget) {
      if (!points.every((point) => isMapPointInsidePolygon(point, holeTarget.points))) {
        setRegionDrawingError("镂空边界必须完全位于区域内部");
        return;
      }
      updateRegion(holeTarget.id, { holes: [...holeTarget.holes, points] });
      setRegionDraft([]);
      setRegionHoleTargetId("");
      setRegionDrawingError("");
      setRegionDraftCursor(null);
      setCanvasTool("pan");
      return;
    }
    const region = createMapRegion(activeMap.regions.length + 1, points);
    onUpdateMap(activeMap.id, { regions: [...activeMap.regions, region] });
    setSelectedRegionIds([region.id]);
    setSelectedRegionId(region.id);
    setRegionDraft([]);
    setRegionHoleTargetId("");
    setRegionDrawingError("");
    setRegionDraftCursor(null);
    setCanvasTool("pan");
  }

  function cancelRegionDrawing() {
    setRegionDraft([]);
    setRegionHoleTargetId("");
    setRegionDrawingError("");
    setRegionDraftCursor(null);
    setCanvasTool("pan");
  }

  function deleteRegion(regionId: string) {
    if (!activeMap) return;
    const region = activeMap.regions.find((item) => item.id === regionId);
    if (!region || !window.confirm(`删除区域“${region.title}”？`)) return;
    onUpdateMap(activeMap.id, {
      regions: activeMap.regions.filter((item) => item.id !== regionId),
      storyPhases: activeMap.storyPhases.map((phase) => ({
        ...phase,
        hiddenRegionIds: phase.hiddenRegionIds.filter((id) => id !== regionId)
      }))
    });
    applyRegionSelection(selectedRegionIds.filter((id) => id !== regionId));
  }

  function moveRegion(regionId: string, direction: -1 | 1) {
    if (!activeMap) return;
    const ordered = [...activeRegions];
    const index = ordered.findIndex((region) => region.id === regionId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return;
    [ordered[index], ordered[targetIndex]] = [ordered[targetIndex], ordered[index]];
    onUpdateMap(activeMap.id, {
      regions: ordered.map((region, order) => ({
        ...region,
        order: order + 1,
        updatedAt: region.id === regionId ? new Date().toISOString() : region.updatedAt
      }))
    });
  }

  function insertRegionPoint(region: MapRegion, afterIndex: number, point: MapRegionPoint) {
    if (region.locked) return;
    const points = [...region.points];
    points.splice(afterIndex + 1, 0, point);
    updateRegion(region.id, { points });
  }

  function createLayer(revealProperties = true) {
    if (!activeMap) return "";
    const id = onCreateLayer(activeMap.id);
    if (id) {
      setActivePaletteLayerId(id);
      setSelectedImageLayerIds([]);
      setSelectedStructure({ kind: "layer", id });
      if (revealProperties) setFullscreenDockTab("properties");
    }
    return id;
  }

  function selectPaletteLayer(layerId: string, additive = false) {
    changeMode("layers");
    setActivePaletteLayerId(layerId);
    setSelectedStructure({ kind: "layer", id: layerId });
    const layer = activeLayers.find((item) => item.id === layerId);
    if (!layer?.imageUrl) {
      setSelectedImageLayerIds([]);
      return;
    }
    const groupedLayerIds = layer.imageGroupId
      ? activeLayers
          .filter((item) => item.imageGroupId === layer.imageGroupId && Boolean(item.imageUrl))
          .map((item) => item.id)
      : [layerId];
    setSelectedImageLayerIds(
      additive
        ? selectedImageLayerSet.has(layerId)
          ? selectedImageLayerIds.filter((id) => id !== layerId)
          : [...selectedImageLayerIds, layerId]
        : groupedLayerIds
    );
  }

  function duplicatePaletteLayer(layerId: string) {
    const id = onDuplicateLayer(layerId);
    if (!id) return;
    setActivePaletteLayerId(id);
    setSelectedImageLayerIds([id]);
    setSelectedStructure({ kind: "layer", id });
  }

  function createMarkerGroup() {
    if (!activeMap) return;
    const id = onCreateMarkerGroup(activeMap.id);
    if (id) {
      setSelectedStructure({ kind: "group", id });
      setFullscreenDockTab("properties");
    }
  }

  function handleCanvasClick(event: MouseEvent<HTMLDivElement>) {
    if (ignoreNextStageClickRef.current) {
      ignoreNextStageClickRef.current = false;
      return;
    }
    if (!activeMap) return;
    const target = event.target as Element;
    if (target.closest("[data-map-interactive='true']")) return;
    const point = mapPointFromClient(event.clientX, event.clientY);
    if (!point) return;
    if (canvasTool === "measure") {
      addMeasurementPoint(point);
      return;
    }
    if (canvasTool === "region") {
      if (event.detail > 1) return;
      setRegionDrawingError("");
      setRegionDraft((current) => [...current, point]);
      return;
    }
    if (!placing || !placementLayer) {
      if (canvasTool === "pan") clearMapSelection();
      return;
    }
    onCreateMarker(activeMap.id, point.x, point.y, placementLayer.id);
    setPlacing(false);
  }

  function handleCanvasPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (canvasTool !== "region" && canvasTool !== "measure") return;
    const point = mapPointFromClient(event.clientX, event.clientY);
    if (!point) return;
    if (canvasTool === "region") setRegionDraftCursor(point);
    else if (measurement && !measurement.complete) {
      setMeasurement((current) => current && !current.complete ? { ...current, end: point } : current);
    }
  }

  function handleCanvasDoubleClick(event: MouseEvent<HTMLDivElement>) {
    if (canvasTool !== "region") return;
    event.preventDefault();
    finishRegionDrawing();
  }

  function openMapContextMenu(event: MouseEvent<HTMLElement>, marker?: MapMarker) {
    const viewport = viewportRef.current;
    const stage = stageRef.current;
    if (!viewport || !stage) return;
    event.preventDefault();
    event.stopPropagation();
    const viewportBounds = viewport.getBoundingClientRect();
    const stageBounds = stage.getBoundingClientRect();
    const mapX = marker?.x ?? ((event.clientX - stageBounds.left) / stageBounds.width) * 100;
    const mapY = marker?.y ?? ((event.clientY - stageBounds.top) / stageBounds.height) * 100;
    setContextMenu({
      mapX,
      mapY,
      markerId: marker?.id,
      x: clamp(event.clientX - viewportBounds.left, 8, Math.max(8, viewportBounds.width - 232)),
      y: clamp(event.clientY - viewportBounds.top, 8, Math.max(8, viewportBounds.height - 268))
    });
  }

  function createMarkerFromContext(startRoute: boolean) {
    if (!activeMap || !placementLayer || !contextMenu) return;
    const point = prepareMapPoint({ x: contextMenu.mapX, y: contextMenu.mapY });
    const markerId = onCreateMarker(
      activeMap.id,
      point.x,
      point.y,
      placementLayer.id
    );
    if (startRoute && markerId) {
      const routeId = onCreateRoute(activeMap.id);
      if (routeId) {
        const stop = createMapRouteStop(markerId, 1);
        stop.title = "新标记";
        onUpdateRoute(routeId, { stops: [stop] });
        setMode("routes");
        setSelectedMarkerIds([]);
        setCanvasTool("route");
      }
    }
    setContextMenu(null);
  }

  function handleContextMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")
    );
    if (!buttons.length) return;
    event.preventDefault();
    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? buttons.length - 1
        : event.key === "ArrowDown"
          ? (currentIndex + 1 + buttons.length) % buttons.length
          : (currentIndex - 1 + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus();
  }

  function handleViewportPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (placing || (event.button !== 0 && event.button !== 1)) return;
    const target = event.target as Element;
    if (target.closest("[data-map-interactive='true']")) return;
    setContextMenu(null);
    if (canvasTool === "select" && event.button === 0) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const selection = {
        additive: event.ctrlKey || event.metaKey || event.shiftKey,
        currentX: event.clientX - bounds.left,
        currentY: event.clientY - bounds.top,
        pointerId: event.pointerId,
        startX: event.clientX - bounds.left,
        startY: event.clientY - bounds.top
      };
      marqueeRef.current = selection;
      setMarquee(selection);
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (canvasTool !== "pan" && event.button !== 1) return;
    panRef.current = {
      moved: false,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffset: offsetRef.current
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
  }

  function handleViewportPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    handleCanvasPointerMove(event);
    const activeMarquee = marqueeRef.current;
    if (activeMarquee?.pointerId === event.pointerId && activeMap) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const nextMarquee = {
        ...activeMarquee,
        currentX: clamp(event.clientX - bounds.left, 0, bounds.width),
        currentY: clamp(event.clientY - bounds.top, 0, bounds.height)
      };
      marqueeRef.current = nextMarquee;
      setMarquee(nextMarquee);
      return;
    }
    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - pan.startClientX;
    const deltaY = event.clientY - pan.startClientY;
    if (Math.hypot(deltaX, deltaY) > 3) pan.moved = true;
    const nextOffset = {
      x: pan.startOffset.x + deltaX,
      y: pan.startOffset.y + deltaY
    };
    offsetRef.current = nextOffset;
    if (stageRef.current) {
      stageRef.current.style.left = `${nextOffset.x}px`;
      stageRef.current.style.top = `${nextOffset.y}px`;
    }
    const gridSize = Math.max(10, 64 * zoomRef.current);
    event.currentTarget.style.backgroundPosition = `${nextOffset.x}px ${nextOffset.y}px`;
    event.currentTarget.style.backgroundSize = `${gridSize}px ${gridSize}px`;
  }

  function stopViewportPanning(event: ReactPointerEvent<HTMLDivElement>) {
    const activeMarquee = marqueeRef.current;
    if (activeMarquee?.pointerId === event.pointerId && activeMap) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      const left = Math.min(activeMarquee.startX, activeMarquee.currentX);
      const right = Math.max(activeMarquee.startX, activeMarquee.currentX);
      const top = Math.min(activeMarquee.startY, activeMarquee.currentY);
      const bottom = Math.max(activeMarquee.startY, activeMarquee.currentY);
      const moved = right - left > 4 || bottom - top > 4;
      const mapLeft = ((left - offsetRef.current.x) / zoomRef.current / activeMap.width) * 100;
      const mapRight = ((right - offsetRef.current.x) / zoomRef.current / activeMap.width) * 100;
      const mapTop = ((top - offsetRef.current.y) / zoomRef.current / activeMap.height) * 100;
      const mapBottom = ((bottom - offsetRef.current.y) / zoomRef.current / activeMap.height) * 100;
      const foundIds = moved
        ? visibleActiveMarkers
            .filter(
              (marker) =>
                marker.x >= mapLeft && marker.x <= mapRight &&
                marker.y >= mapTop && marker.y <= mapBottom
            )
            .map((marker) => marker.id)
        : [];
      const nextIds = activeMarquee.additive
        ? Array.from(new Set([...selectedMarkerIds, ...foundIds]))
        : foundIds;
      applyMarkerSelection(nextIds, foundIds.at(-1));
      marqueeRef.current = null;
      setMarquee(null);
      if (moved) ignoreNextStageClickRef.current = true;
      return;
    }
    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (pan.moved && event.type === "pointerup") {
      ignoreNextStageClickRef.current = true;
    }
    setOffset(offsetRef.current);
    panRef.current = null;
    setIsPanning(false);
  }

  function handleMarkerPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    marker: MapMarker,
    editable: boolean
  ) {
    if (event.button !== 0) return;
    event.stopPropagation();
    if (canvasTool === "measure") {
      addMeasurementPoint(marker);
      return;
    }
    if (canvasTool === "route") return;
    const additive = event.ctrlKey || event.metaKey || event.shiftKey;
    if (additive) {
      selectMarker(marker.id, true);
      return;
    }
    const preservingSelection = selectedMarkerSet.has(marker.id) && selectedMarkerIds.length > 1;
    const dragSelectionIds = preservingSelection ? selectedMarkerIds : [marker.id];
    if (preservingSelection) {
      setMode("markers");
      setSelectedStructure(null);
      onSelectMarker(marker.id);
    } else {
      selectMarker(marker.id);
    }
    if (!editable) return;
    const dragMarkers = activeMarkers.filter(
      (item) =>
        dragSelectionIds.includes(item.id) &&
        isMapMarkerEditable(item, activeLayers, activeGroups)
    );
    if (!dragMarkers.length) return;
    dragRef.current = {
      markerId: marker.id,
      origins: dragMarkers.map((item) => ({
        markerId: item.id,
        point: { x: item.x, y: item.y }
      })),
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY
    };
    setDragPreviews(
      Object.fromEntries(dragMarkers.map((item) => [item.id, { x: item.x, y: item.y }]))
    );
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleMarkerPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !stage) return;
    const bounds = stage.getBoundingClientRect();
    const deltaX = ((event.clientX - drag.startClientX) / bounds.width) * 100;
    const deltaY = ((event.clientY - drag.startClientY) / bounds.height) * 100;
    const primary = drag.origins.find((origin) => origin.markerId === drag.markerId) ?? drag.origins[0];
    const primaryTarget = prepareMapPoint({
      x: primary.point.x + deltaX,
      y: primary.point.y + deltaY
    });
    const snappedDeltaX = primaryTarget.x - primary.point.x;
    const snappedDeltaY = primaryTarget.y - primary.point.y;
    setDragPreviews(
      Object.fromEntries(
        drag.origins.map((origin) => [
          origin.markerId,
          {
            x: clamp(origin.point.x + snappedDeltaX, -MAP_CANVAS_COORDINATE_LIMIT, MAP_CANVAS_COORDINATE_LIMIT),
            y: clamp(origin.point.y + snappedDeltaY, -MAP_CANVAS_COORDINATE_LIMIT, MAP_CANVAS_COORDINATE_LIMIT)
          }
        ])
      )
    );
  }

  function finishMarkerDrag(event: ReactPointerEvent<HTMLButtonElement>, commit: boolean) {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (commit && stage) {
      const bounds = stage.getBoundingClientRect();
      if (Math.hypot(event.clientX - drag.startClientX, event.clientY - drag.startClientY) > 3) {
        const deltaX = ((event.clientX - drag.startClientX) / bounds.width) * 100;
        const deltaY = ((event.clientY - drag.startClientY) / bounds.height) * 100;
        const primary = drag.origins.find((origin) => origin.markerId === drag.markerId) ?? drag.origins[0];
        const primaryTarget = prepareMapPoint({
          x: primary.point.x + deltaX,
          y: primary.point.y + deltaY
        });
        const snappedDeltaX = primaryTarget.x - primary.point.x;
        const snappedDeltaY = primaryTarget.y - primary.point.y;
        const moves = drag.origins.map((origin) => ({
          markerId: origin.markerId,
          before: origin.point,
          after: {
            x: Number(clamp(origin.point.x + snappedDeltaX, -MAP_CANVAS_COORDINATE_LIMIT, MAP_CANVAS_COORDINATE_LIMIT).toFixed(2)),
            y: Number(clamp(origin.point.y + snappedDeltaY, -MAP_CANVAS_COORDINATE_LIMIT, MAP_CANVAS_COORDINATE_LIMIT).toFixed(2))
          }
        }));
        onUpdateMarkers(
          moves.map((move) => ({ markerId: move.markerId, patch: move.after }))
        );
        ignoreNextStageClickRef.current = true;
      }
    }
    dragRef.current = null;
    setDragPreviews({});
  }

  function handleMarkerKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    marker: MapMarker,
    editable: boolean
  ) {
    if (canvasTool === "measure") return;
    const directions: Record<string, MapPoint> = {
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 }
    };
    const direction = directions[event.key];
    if (!direction) return;
    const targets = (selectedMarkerSet.has(marker.id) ? selectedActiveMarkers : [marker]).filter(
      (item) => isMapMarkerEditable(item, activeLayers, activeGroups)
    );
    if (!targets.length || (!editable && targets.length === 1 && targets[0].id === marker.id)) return;
    event.preventDefault();
    const baseStepX = activeMap?.grid.snap && activeGrid ? activeGrid.stepX : 0.25;
    const baseStepY = activeMap?.grid.snap && activeGrid ? activeGrid.stepY : 0.25;
    const multiplier = event.shiftKey ? 2 : 1;
    const primary = targets.find((item) => item.id === marker.id) ?? targets[0];
    const primaryTarget = prepareMapPoint({
      x: primary.x + direction.x * baseStepX * multiplier,
      y: primary.y + direction.y * baseStepY * multiplier
    });
    const deltaX = primaryTarget.x - primary.x;
    const deltaY = primaryTarget.y - primary.y;
    const moves = targets.map((item) => ({
      markerId: item.id,
      before: { x: item.x, y: item.y },
      after: {
        x: Number(clamp(item.x + deltaX, -MAP_CANVAS_COORDINATE_LIMIT, MAP_CANVAS_COORDINATE_LIMIT).toFixed(2)),
        y: Number(clamp(item.y + deltaY, -MAP_CANVAS_COORDINATE_LIMIT, MAP_CANVAS_COORDINATE_LIMIT).toFixed(2))
      }
    }));
    onUpdateMarkers(moves.map((move) => ({ markerId: move.markerId, patch: move.after })));
  }

  function handleRegionVertexPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    region: MapRegion,
    pointIndex: number
  ) {
    if (event.button !== 0 || region.locked) return;
    event.stopPropagation();
    regionVertexDragRef.current = {
      pointIndex,
      points: region.points.map((point) => ({ ...point })),
      pointerId: event.pointerId,
      regionId: region.id
    };
    setRegionVertexPreview({
      points: region.points.map((point) => ({ ...point })),
      regionId: region.id
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleRegionVertexPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = regionVertexDragRef.current;
    const stage = stageRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !stage) return;
    const bounds = stage.getBoundingClientRect();
    const points = drag.points.map((point) => ({ ...point }));
    points[drag.pointIndex] = prepareMapPoint({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100
    });
    setRegionVertexPreview({ points, regionId: drag.regionId });
  }

  function finishRegionVertexDrag(
    event: ReactPointerEvent<HTMLButtonElement>,
    commit: boolean
  ) {
    const drag = regionVertexDragRef.current;
    const stage = stageRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (commit && stage) {
      const bounds = stage.getBoundingClientRect();
      const points = drag.points.map((point) => ({ ...point }));
      points[drag.pointIndex] = prepareMapPoint({
        x: ((event.clientX - bounds.left) / bounds.width) * 100,
        y: ((event.clientY - bounds.top) / bounds.height) * 100
      });
      updateRegion(drag.regionId, { points });
    }
    regionVertexDragRef.current = null;
    setRegionVertexPreview(null);
  }

  function removeRegionPoint(region: MapRegion, pointIndex: number) {
    if (region.locked || region.points.length <= 3) return;
    updateRegion(region.id, {
      points: region.points.filter((_, index) => index !== pointIndex)
    });
  }

  function handleMinimapClick(event: MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    centerMapPoint(
      ((event.clientX - bounds.left) / bounds.width) * 100,
      ((event.clientY - bounds.top) / bounds.height) * 100
    );
  }

  function updateImageTransform(patch: Partial<MapImageTransform>) {
    if (!activeTransformImageUrl) return;
    const imageTransform = normalizeMapImageTransform({
      ...activeImageTransform,
      ...patch
    });
    if (transformingImageLayer) {
      onUpdateLayer(transformingImageLayer.id, { imageTransform });
    } else if (activeMap) {
      onUpdateMap(activeMap.id, { imageTransform });
    }
  }

  function arrangeSelectedImageLayers(action: MapImageArrangeAction) {
    if (!activeMap) return;
    const editableLayers = selectedImageLayers.filter(
      (layer) => layer.visible && !layer.locked && !phaseVisibility.layers.has(layer.id)
    );
    const minimumCount = action === "flip-x" || action === "flip-y"
      ? 1
      : action === "distribute-x" || action === "distribute-y"
        ? 3
        : 2;
    if (editableLayers.length < minimumCount) return;
    if (action === "flip-x" || action === "flip-y") {
      onUpdateLayers(editableLayers.map((layer) => ({
        layerId: layer.id,
        patch: {
          imageTransform: normalizeMapImageTransform({
            ...layer.imageTransform,
            ...(action === "flip-x"
              ? { flipX: !layer.imageTransform.flipX }
              : { flipY: !layer.imageTransform.flipY })
          })
        }
      })));
      return;
    }
    const entries = editableLayers.map((layer) => ({
      bounds: getMapImageBounds(
        getMapImageTransformBounds(
          activeMap,
          imageNaturalSizes[layer.imageUrl],
          layer.imageTransform
        )
      ),
      layer
    }));
    const selectionBounds = getMapImageBounds(entries.flatMap((entry) => ([
      { x: entry.bounds.left, y: entry.bounds.top },
      { x: entry.bounds.right, y: entry.bounds.bottom }
    ])));
    const deltas = new globalThis.Map<string, MapPoint>(
      entries.map(({ layer }) => [layer.id, { x: 0, y: 0 }])
    );
    if (action === "distribute-x" || action === "distribute-y") {
      const horizontal = action === "distribute-x";
      const sorted = [...entries].sort((left, right) => (
        horizontal
          ? left.bounds.centerX - right.bounds.centerX
          : left.bounds.centerY - right.bounds.centerY
      ));
      const first = horizontal ? sorted[0].bounds.centerX : sorted[0].bounds.centerY;
      const lastEntry = sorted.at(-1)!;
      const last = horizontal ? lastEntry.bounds.centerX : lastEntry.bounds.centerY;
      const gap = (last - first) / (sorted.length - 1);
      sorted.forEach((entry, index) => {
        const current = horizontal ? entry.bounds.centerX : entry.bounds.centerY;
        const delta = first + gap * index - current;
        deltas.set(entry.layer.id, horizontal ? { x: delta, y: 0 } : { x: 0, y: delta });
      });
    } else {
      entries.forEach((entry) => {
        const x = action === "align-left"
          ? selectionBounds.left - entry.bounds.left
          : action === "align-center-x"
            ? selectionBounds.centerX - entry.bounds.centerX
            : action === "align-right"
              ? selectionBounds.right - entry.bounds.right
              : 0;
        const y = action === "align-top"
          ? selectionBounds.top - entry.bounds.top
          : action === "align-center-y"
            ? selectionBounds.centerY - entry.bounds.centerY
            : action === "align-bottom"
              ? selectionBounds.bottom - entry.bounds.bottom
              : 0;
        deltas.set(entry.layer.id, { x, y });
      });
    }
    onUpdateLayers(editableLayers.map((layer) => {
      const delta = deltas.get(layer.id) ?? { x: 0, y: 0 };
      return {
        layerId: layer.id,
        patch: {
          imageTransform: normalizeMapImageTransform({
            ...layer.imageTransform,
            x: layer.imageTransform.x + delta.x,
            y: layer.imageTransform.y + delta.y
          })
        }
      };
    }));
  }

  function groupSelectedImageLayers() {
    if (selectedImageLayers.length < 2) return;
    const imageGroupId = `map-image-group:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    onUpdateLayers(selectedImageLayers.map((layer) => ({
      layerId: layer.id,
      patch: { imageGroupId }
    })));
  }

  function ungroupSelectedImageLayers() {
    const groupIds = new Set(
      selectedImageLayers.map((layer) => layer.imageGroupId).filter(Boolean)
    );
    if (!groupIds.size) return;
    onUpdateLayers(activeLayers
      .filter((layer) => groupIds.has(layer.imageGroupId))
      .map((layer) => ({ layerId: layer.id, patch: { imageGroupId: "" } })));
  }

  function rememberMapImageNaturalSize(imageUrl: string, image: HTMLImageElement) {
    if (!imageUrl || !image.naturalWidth || !image.naturalHeight) return;
    setImageNaturalSizes((current) => {
      const existing = current[imageUrl];
      if (existing?.width === image.naturalWidth && existing.height === image.naturalHeight) {
        return current;
      }
      return {
        ...current,
        [imageUrl]: {
          height: image.naturalHeight,
          width: image.naturalWidth
        }
      };
    });
    if (isImageTransformMode && activeTransformImageUrl === imageUrl) {
      requestAnimationFrame(() => revealImageTransform(imageUrl, activeImageTransform, {
        height: image.naturalHeight,
        width: image.naturalWidth
      }));
    }
  }

  function toggleImageTransformMode() {
    if (!activeMap?.imageUrl) return;
    const nextMode = !(isImageTransformMode && !transformingLayerImageId);
    setIsImageTransformMode(nextMode);
    setTransformingLayerImageId("");
    setTransformingLayerImageIds([]);
    setSelectedImageLayerIds([]);
    setImageTransformPreview(null);
    setLayerImageTransformPreviews({});
    setImageSnapGuides({ horizontal: null, vertical: null });
    imageTransformDragRef.current = null;
    if (nextMode) {
      setFullscreenDockTab("properties");
      setCanvasTool("pan");
      setPlacing(false);
      setMeasurement(null);
      setRegionDraft([]);
      setRegionDraftCursor(null);
      setContextMenu(null);
      openMapSettings();
      revealImageTransform(activeMap.imageUrl, activeMap.imageTransform);
    }
  }

  function startLayerImageTransformMode(
    layerId: string,
    requestedLayerIds = selectedImageLayerIds.includes(layerId)
      ? selectedImageLayerIds
      : [layerId],
    reveal = true
  ) {
    const layer = activeLayers.find((item) => item.id === layerId);
    if (!layer?.imageUrl) return;
    const layerIds = Array.from(new Set(requestedLayerIds))
      .filter((id) => {
        const item = activeLayers.find((candidate) => candidate.id === id);
        return Boolean(
          item?.imageUrl
          && !item.locked
          && item.visible
          && !phaseVisibility.layers.has(item.id)
        );
      });
    if (!layerIds.includes(layerId)) return;
    setIsImageTransformMode(true);
    setTransformingLayerImageId(layerId);
    setTransformingLayerImageIds(layerIds);
    setSelectedImageLayerIds(layerIds);
    setImageTransformPreview(null);
    setLayerImageTransformPreviews({});
    setImageSnapGuides({ horizontal: null, vertical: null });
    imageTransformDragRef.current = null;
    setCanvasTool("pan");
    setPlacing(false);
    setMeasurement(null);
    setRegionDraft([]);
    setRegionDraftCursor(null);
    setContextMenu(null);
    setMode("layers");
    setActivePaletteLayerId(layerId);
    setSelectedStructure({ kind: "layer", id: layerId });
    onSelectMarker("");
    onSelectRoute("");
    if (reveal) {
      const bounds = getLayerImageSelectionBounds(layerIds);
      if (bounds) revealImageBounds(bounds);
    }
  }

  function stopImageTransformMode() {
    imageTransformDragRef.current = null;
    setImageTransformPreview(null);
    setLayerImageTransformPreviews({});
    setImageSnapGuides({ horizontal: null, vertical: null });
    setIsImageTransformMode(false);
    setTransformingLayerImageId("");
    setTransformingLayerImageIds([]);
  }

  function toggleLayerImageTransformMode(layerId: string) {
    if (
      isImageTransformMode
      && transformingLayerImageId === layerId
      && transformingLayerImageIds.length > 0
    ) {
      stopImageTransformMode();
      return;
    }
    startLayerImageTransformMode(layerId);
  }

  function handleLayerImagePointerDown(
    event: ReactPointerEvent<HTMLElement>,
    layer: MapLayer
  ) {
    if (
      event.button !== 0
      || layer.locked
      || !layer.visible
      || phaseVisibility.layers.has(layer.id)
    ) return;
    const additive = event.shiftKey || event.ctrlKey || event.metaKey;
    if (additive) {
      event.preventDefault();
      event.stopPropagation();
      const nextLayerIds = selectedImageLayerSet.has(layer.id)
        ? selectedImageLayerIds.filter((id) => id !== layer.id)
        : [...selectedImageLayerIds, layer.id];
      if (!nextLayerIds.length) {
        setSelectedImageLayerIds([]);
        stopImageTransformMode();
        return;
      }
      const primaryId = nextLayerIds.includes(layer.id)
        ? layer.id
        : nextLayerIds.at(-1) ?? "";
      startLayerImageTransformMode(primaryId, nextLayerIds, false);
      return;
    }
    const nextLayerIds = selectedImageLayerSet.has(layer.id) && selectedImageLayerIds.length > 1
      ? selectedImageLayerIds
      : layer.imageGroupId
        ? activeLayers
            .filter((item) => item.imageGroupId === layer.imageGroupId && Boolean(item.imageUrl))
            .map((item) => item.id)
        : [layer.id];
    startLayerImageTransformMode(layer.id, nextLayerIds, false);
    beginImageTransformDrag(event, "move", nextLayerIds);
  }

  function handleLayerImageKeyDown(
    event: ReactKeyboardEvent<HTMLElement>,
    layer: MapLayer
  ) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    startLayerImageTransformMode(layer.id, [layer.id]);
  }

  function beginImageTransformDrag(
    event: ReactPointerEvent<HTMLElement>,
    mode: MapImageTransformMode,
    forcedLayerIds?: string[]
  ) {
    if (event.button !== 0) return;
    const stage = stageRef.current;
    if (!stage || (!activeTransformImageUrl && !forcedLayerIds?.length)) return;
    const bounds = stage.getBoundingClientRect();
    const layerIds = (forcedLayerIds ?? transformingLayerImageIds).filter((id) =>
      activeLayers.some((layer) => layer.id === id && Boolean(layer.imageUrl))
    );
    const layerStarts = Object.fromEntries(
      layerIds.map((id) => {
        const layer = activeLayers.find((item) => item.id === id);
        return [id, layerImageTransformPreviews[id] ?? layer?.imageTransform ?? createMapImageTransform()];
      })
    );
    const primaryLayerId = layerIds.includes(transformingLayerImageId)
      ? transformingLayerImageId
      : layerIds.at(-1) ?? "";
    const start = primaryLayerId ? layerStarts[primaryLayerId] : activeImageTransform;
    const startBounds = layerIds.length
      ? getLayerImageSelectionBounds(layerIds, layerStarts)
      : null;
    const centerMapX = startBounds?.centerX ?? 50 + start.x;
    const centerMapY = startBounds?.centerY ?? 50 + start.y;
    const centerClientX = bounds.left + (centerMapX / 100) * bounds.width;
    const centerClientY = bounds.top + (centerMapY / 100) * bounds.height;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    imageTransformDragRef.current = {
      centerClientX,
      centerClientY,
      centerMapX,
      centerMapY,
      latest: start,
      latestLayers: { ...layerStarts },
      layerIds,
      layerStarts,
      mode,
      pointerId: event.pointerId,
      stageHeight: bounds.height,
      stageWidth: bounds.width,
      start,
      startBounds,
      startAngle: Math.atan2(event.clientY - centerClientY, event.clientX - centerClientX),
      startClientX: event.clientX,
      startClientY: event.clientY,
      startDistance: Math.max(1, Math.hypot(event.clientX - centerClientX, event.clientY - centerClientY))
    };
  }

  function handleImageTransformPointerDown(event: ReactPointerEvent<HTMLElement>) {
    const handle = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-image-transform-handle]"
    );
    const mode = (handle?.dataset.imageTransformHandle ?? "move") as MapImageTransformMode;
    if (mode !== "move" && mode !== "scale" && mode !== "rotate") return;
    beginImageTransformDrag(event, mode);
  }

  function handleImageTransformPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = imageTransformDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    if (drag.layerIds.length) {
      let nextLayers: Record<string, MapImageTransform> = {};
      if (drag.mode === "move") {
        let deltaX = ((event.clientX - drag.startClientX) / drag.stageWidth) * 100;
        let deltaY = ((event.clientY - drag.startClientY) / drag.stageHeight) * 100;
        if (event.shiftKey) {
          if (Math.abs(event.clientX - drag.startClientX) >= Math.abs(event.clientY - drag.startClientY)) {
            deltaY = 0;
          } else {
            deltaX = 0;
          }
        }
        let verticalGuide: number | null = null;
        let horizontalGuide: number | null = null;
        if (!event.altKey && drag.startBounds) {
          const horizontalTargets = [0, 50, 100];
          const verticalTargets = [0, 50, 100];
          activeLayers
            .filter(
              (layer) => layer.imageUrl
                && layer.visible
                && !phaseVisibility.layers.has(layer.id)
                && !drag.layerIds.includes(layer.id)
            )
            .forEach((layer) => {
              const itemBounds = getLayerImageSelectionBounds([layer.id]);
              if (!itemBounds) return;
              horizontalTargets.push(itemBounds.left, itemBounds.centerX, itemBounds.right);
              verticalTargets.push(itemBounds.top, itemBounds.centerY, itemBounds.bottom);
            });
          const selectedHorizontal = [
            drag.startBounds.left,
            drag.startBounds.centerX,
            drag.startBounds.right
          ];
          const selectedVertical = [
            drag.startBounds.top,
            drag.startBounds.centerY,
            drag.startBounds.bottom
          ];
          const snapXThreshold = (8 / drag.stageWidth) * 100;
          const snapYThreshold = (8 / drag.stageHeight) * 100;
          let closestX = snapXThreshold;
          let closestY = snapYThreshold;
          let correctionX = 0;
          let correctionY = 0;
          selectedHorizontal.forEach((anchor) => {
            horizontalTargets.forEach((target) => {
              const correction = target - (anchor + deltaX);
              if (Math.abs(correction) <= closestX) {
                closestX = Math.abs(correction);
                correctionX = correction;
                verticalGuide = target;
              }
            });
          });
          selectedVertical.forEach((anchor) => {
            verticalTargets.forEach((target) => {
              const correction = target - (anchor + deltaY);
              if (Math.abs(correction) <= closestY) {
                closestY = Math.abs(correction);
                correctionY = correction;
                horizontalGuide = target;
              }
            });
          });
          deltaX += correctionX;
          deltaY += correctionY;
        }
        nextLayers = Object.fromEntries(
          drag.layerIds.map((id) => {
            const start = drag.layerStarts[id];
            return [id, normalizeMapImageTransform({
              ...start,
              x: start.x + deltaX,
              y: start.y + deltaY
            })];
          })
        );
        setImageSnapGuides({ horizontal: horizontalGuide, vertical: verticalGuide });
      } else if (drag.mode === "scale") {
        const distance = Math.hypot(
          event.clientX - drag.centerClientX,
          event.clientY - drag.centerClientY
        );
        const ratio = distance / drag.startDistance;
        nextLayers = Object.fromEntries(
          drag.layerIds.map((id) => {
            const start = drag.layerStarts[id];
            const centerX = drag.centerMapX + (50 + start.x - drag.centerMapX) * ratio;
            const centerY = drag.centerMapY + (50 + start.y - drag.centerMapY) * ratio;
            return [id, normalizeMapImageTransform({
              ...start,
              scale: start.scale * ratio,
              x: centerX - 50,
              y: centerY - 50
            })];
          })
        );
        setImageSnapGuides({ horizontal: null, vertical: null });
      } else if (activeMap) {
        const currentAngle = Math.atan2(
          event.clientY - drag.centerClientY,
          event.clientX - drag.centerClientX
        );
        let angleDelta = currentAngle - drag.startAngle;
        if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
        if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;
        if (event.shiftKey) {
          angleDelta = Math.round((angleDelta * 180) / Math.PI / 15) * 15 * (Math.PI / 180);
        }
        const cosine = Math.cos(angleDelta);
        const sine = Math.sin(angleDelta);
        const groupCenterX = (drag.centerMapX / 100) * activeMap.width;
        const groupCenterY = (drag.centerMapY / 100) * activeMap.height;
        nextLayers = Object.fromEntries(
          drag.layerIds.map((id) => {
            const start = drag.layerStarts[id];
            const itemCenterX = ((50 + start.x) / 100) * activeMap.width;
            const itemCenterY = ((50 + start.y) / 100) * activeMap.height;
            const relativeX = itemCenterX - groupCenterX;
            const relativeY = itemCenterY - groupCenterY;
            const rotatedX = groupCenterX + relativeX * cosine - relativeY * sine;
            const rotatedY = groupCenterY + relativeX * sine + relativeY * cosine;
            return [id, normalizeMapImageTransform({
              ...start,
              rotation: start.rotation + (angleDelta * 180) / Math.PI,
              x: (rotatedX / activeMap.width) * 100 - 50,
              y: (rotatedY / activeMap.height) * 100 - 50
            })];
          })
        );
        setImageSnapGuides({ horizontal: null, vertical: null });
      }
      drag.latestLayers = nextLayers;
      drag.latest = nextLayers[transformingLayerImageId]
        ?? nextLayers[drag.layerIds.at(-1) ?? ""]
        ?? drag.start;
      setLayerImageTransformPreviews(nextLayers);
      return;
    }
    let next = drag.start;
    if (drag.mode === "move") {
      next = normalizeMapImageTransform({
        ...drag.start,
        x: drag.start.x + ((event.clientX - drag.startClientX) / drag.stageWidth) * 100,
        y: drag.start.y + ((event.clientY - drag.startClientY) / drag.stageHeight) * 100
      });
    } else if (drag.mode === "scale") {
      const distance = Math.hypot(
        event.clientX - drag.centerClientX,
        event.clientY - drag.centerClientY
      );
      next = normalizeMapImageTransform({
        ...drag.start,
        scale: drag.start.scale * (distance / drag.startDistance)
      });
    } else {
      const currentAngle = Math.atan2(
        event.clientY - drag.centerClientY,
        event.clientX - drag.centerClientX
      );
      let angleDelta = currentAngle - drag.startAngle;
      if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
      if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;
      next = normalizeMapImageTransform({
        ...drag.start,
        rotation: drag.start.rotation + angleDelta * (180 / Math.PI)
      });
    }
    drag.latest = next;
    setImageTransformPreview(next);
  }

  function finishImageTransformDrag(
    event: ReactPointerEvent<HTMLElement>,
    commit: boolean
  ) {
    const drag = imageTransformDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    imageTransformDragRef.current = null;
    if (commit) {
      if (drag.layerIds.length) {
        onUpdateLayers(drag.layerIds.map((layerId) => ({
          layerId,
          patch: { imageTransform: drag.latestLayers[layerId] ?? drag.layerStarts[layerId] }
        })));
      }
      else if (activeMap) onUpdateMap(activeMap.id, { imageTransform: drag.latest });
    }
    setImageTransformPreview(null);
    setLayerImageTransformPreviews({});
    setImageSnapGuides({ horizontal: null, vertical: null });
    ignoreNextStageClickRef.current = true;
  }

  function handleImageTransformKeyDown(
    event: ReactKeyboardEvent<HTMLElement>,
    mode: MapImageTransformMode
  ) {
    if (!["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const direction = event.key === "ArrowUp" || event.key === "ArrowRight" ? 1 : -1;
    const selectedLayers = transformingLayerImageIds
      .map((id) => activeLayers.find((layer) => layer.id === id))
      .filter((layer): layer is MapLayer => Boolean(layer?.imageUrl));
    if (activeMap && selectedLayers.length) {
      const selectionBounds = getLayerImageSelectionBounds(selectedLayers.map((layer) => layer.id));
      if (!selectionBounds) return;
      if (mode === "move") {
        const amount = event.shiftKey ? 5 : 1;
        const deltaX = event.key === "ArrowLeft" || event.key === "ArrowRight"
          ? direction * amount
          : 0;
        const deltaY = event.key === "ArrowDown"
          ? amount
          : event.key === "ArrowUp"
            ? -amount
            : 0;
        onUpdateLayers(selectedLayers.map((layer) => ({
          layerId: layer.id,
          patch: {
            imageTransform: normalizeMapImageTransform({
              ...layer.imageTransform,
              x: layer.imageTransform.x + deltaX,
              y: layer.imageTransform.y + deltaY
            })
          }
        })));
        return;
      }
      if (mode === "scale") {
        const primaryScale = Math.max(0.01, activeImageTransform.scale);
        const targetScale = clamp(
          primaryScale + direction * (event.shiftKey ? 0.25 : 0.05),
          0.01,
          1000
        );
        const ratio = targetScale / primaryScale;
        onUpdateLayers(selectedLayers.map((layer) => ({
          layerId: layer.id,
          patch: {
            imageTransform: normalizeMapImageTransform({
              ...layer.imageTransform,
              scale: layer.imageTransform.scale * ratio,
              x: selectionBounds.centerX
                + (50 + layer.imageTransform.x - selectionBounds.centerX) * ratio
                - 50,
              y: selectionBounds.centerY
                + (50 + layer.imageTransform.y - selectionBounds.centerY) * ratio
                - 50
            })
          }
        })));
        return;
      }
      const angleDelta = direction * (event.shiftKey ? 15 : 1);
      const radians = angleDelta * (Math.PI / 180);
      const cosine = Math.cos(radians);
      const sine = Math.sin(radians);
      const centerX = (selectionBounds.centerX / 100) * activeMap.width;
      const centerY = (selectionBounds.centerY / 100) * activeMap.height;
      onUpdateLayers(selectedLayers.map((layer) => {
        const itemX = ((50 + layer.imageTransform.x) / 100) * activeMap.width;
        const itemY = ((50 + layer.imageTransform.y) / 100) * activeMap.height;
        const relativeX = itemX - centerX;
        const relativeY = itemY - centerY;
        return {
          layerId: layer.id,
          patch: {
            imageTransform: normalizeMapImageTransform({
              ...layer.imageTransform,
              rotation: layer.imageTransform.rotation + angleDelta,
              x: (centerX + relativeX * cosine - relativeY * sine) / activeMap.width * 100 - 50,
              y: (centerY + relativeX * sine + relativeY * cosine) / activeMap.height * 100 - 50
            })
          }
        };
      }));
      return;
    }
    if (mode === "move") {
      const amount = event.shiftKey ? 5 : 1;
      updateImageTransform(
        event.key === "ArrowLeft" || event.key === "ArrowRight"
          ? { x: activeImageTransform.x + direction * amount }
          : { y: activeImageTransform.y + (event.key === "ArrowDown" ? amount : -amount) }
      );
    } else if (mode === "scale") {
      updateImageTransform({ scale: activeImageTransform.scale + direction * (event.shiftKey ? 0.25 : 0.05) });
    } else {
      updateImageTransform({ rotation: activeImageTransform.rotation + direction * (event.shiftKey ? 15 : 1) });
    }
  }

  function handleMapFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (activeMap && file) onUploadMap(activeMap.id, file);
    event.target.value = "";
  }

  function openMapImagePicker() {
    stopImageTransformMode();
    mapImageInputRef.current?.click();
  }

  function openMapLayerImagePicker(layerId: string) {
    stopImageTransformMode();
    setPendingTransformLayerId("");
    mapLayerImageTargetRef.current = layerId;
    mapLayerImageInputRef.current?.click();
  }

  function openNewMapLayerImagePicker() {
    stopImageTransformMode();
    setPendingTransformLayerId("");
    mapLayerImageTargetRef.current = "__new-layer__";
    mapLayerImageInputRef.current?.click();
  }

  function handleMapLayerFile(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const targetLayerId = mapLayerImageTargetRef.current;
    mapLayerImageTargetRef.current = "";
    let lastLayerId = "";
    files.forEach((file, index) => {
      const replacesExistingLayer = targetLayerId !== "__new-layer__" && index === 0;
      const layerId = replacesExistingLayer ? targetLayerId : createLayer(false);
      if (!layerId) return;
      if (!replacesExistingLayer) {
        const title = file.name.replace(/\.[^.]+$/, "").trim();
        if (title) onUpdateLayer(layerId, { title });
      }
      lastLayerId = layerId;
      onUploadLayerImage(layerId, file);
    });
    if (lastLayerId) setPendingTransformLayerId(lastLayerId);
    event.target.value = "";
  }

  function openMarkerIconPicker(markerId: string) {
    markerIconTargetRef.current = markerId;
    markerIconInputRef.current?.click();
  }

  function handleMarkerIconFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const markerId = markerIconTargetRef.current || selectedMarker?.id || selectedMarkerId;
    if (markerId && file) onUploadMarkerIcon(markerId, file);
    event.target.value = "";
  }

  function openMapExportDialog() {
    setExportStatus({ kind: "idle", message: "" });
    if (exportOptions.scope === "selection" && !selectionExportBounds) {
      setExportOptions((current) => ({ ...current, scope: "map" }));
    }
    setExportDialogOpen(true);
  }

  function updateExportOption<Key extends keyof MapExportOptions>(
    key: Key,
    value: MapExportOptions[Key]
  ) {
    setExportOptions((current) => ({ ...current, [key]: value }));
    setExportStatus({ kind: "idle", message: "" });
  }

  async function exportMapImage() {
    if (!activeMap || exportStatus.kind === "working") return;
    setExportStatus({ kind: "working", message: "正在绘制高清地图…" });
    try {
      const rendered = await renderMapExport({
        bounds: exportBounds,
        layers: activeLayers.filter(
          (layer) => layer.visible && !phaseVisibility.layers.has(layer.id)
        ),
        map: activeMap,
        markers: visibleActiveMarkers,
        options: exportOptions,
        regions: displayedActiveRegions,
        routes: visibleActiveRoutes
      });
      const mimeType = exportOptions.format === "webp" ? "image/webp" : "image/png";
      const scopeLabel = exportOptions.scope === "viewport"
        ? "当前视口"
        : exportOptions.scope === "selection"
          ? "所选范围"
          : "整图";
      const suggestedName = `${activeMap.title}-${scopeLabel}-${exportOptions.scale}x`;
      const bytes = await rendered.blob.arrayBuffer();
      if (window.worldcraftStore?.exportMapImage) {
        setExportStatus({ kind: "working", message: "请选择保存位置…" });
        const saved = await window.worldcraftStore.exportMapImage({
          bytes,
          mimeType,
          suggestedName
        });
        if (saved.canceled) {
          setExportStatus({ kind: "idle", message: "已取消导出。" });
          return;
        }
        if (!saved.ok) throw new Error(saved.error || "地图文件保存失败。");
        const warning = rendered.warnings.length ? ` ${rendered.warnings.join(" ")}` : "";
        setExportStatus({
          kind: "success",
          message: `已导出 ${rendered.dimensions.width} × ${rendered.dimensions.height}。${warning}`
        });
        return;
      }

      const url = URL.createObjectURL(rendered.blob);
      const link = document.createElement("a");
      link.download = `${suggestedName}.${exportOptions.format}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setExportStatus({
        kind: "success",
        message: `已导出 ${rendered.dimensions.width} × ${rendered.dimensions.height}。`
      });
    } catch (error) {
      setExportStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "地图导出失败。"
      });
    }
  }

  function handleExportDialogKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (exportStatus.kind !== "working") setExportDialogOpen(false);
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex='-1'])"
      )
    ).filter((element) => element.offsetParent !== null);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleMapReviewDialogKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (aiReviewStatus.kind !== "working" && versionStatus.kind !== "working") {
        setReviewDialogOpen(false);
      }
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex='-1'])"
      )
    ).filter((element) => element.offsetParent !== null);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleMapImageDrag(event: ReactDragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setIsImageDropActive(true);
  }

  function handleMapImageDragLeave(event: ReactDragEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) return;
    setIsImageDropActive(false);
    setIsImageTransformMode(false);
  }

  function handleMapImageDrop(event: ReactDragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsImageDropActive(false);
    const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith("image/"))
      ?? event.dataTransfer.files[0];
    if (activeMap && file) onUploadMap(activeMap.id, file);
  }

  function addRouteStop() {
    if (!selectedRoute || !nextStopMarkerId) return;
    const marker = markerMap.get(nextStopMarkerId);
    const stop = createMapRouteStop(nextStopMarkerId, selectedRoute.stops.length + 1);
    stop.title = marker?.label || stop.title;
    onUpdateRoute(selectedRoute.id, { stops: [...selectedRoute.stops, stop] });
    setNextStopMarkerId("");
  }

  function updateRouteStop(stopId: string, patch: Partial<MapRoute["stops"][number]>) {
    if (!selectedRoute) return;
    onUpdateRoute(selectedRoute.id, {
      stops: selectedRoute.stops.map((stop) =>
        stop.id === stopId ? { ...stop, ...patch } : stop
      )
    });
  }

  function addRouteWaypoint(afterStopId: string) {
    if (!selectedRoute) return;
    const stopIndex = selectedRoute.stops.findIndex((stop) => stop.id === afterStopId);
    const nextStop = selectedRoute.stops[stopIndex + 1];
    const startMarker = activeMarkers.find(
      (marker) => marker.id === selectedRoute.stops[stopIndex]?.markerId
    );
    const endMarker = activeMarkers.find((marker) => marker.id === nextStop?.markerId);
    if (stopIndex < 0 || !nextStop || !startMarker || !endMarker) return;
    const segmentWaypoints = selectedRoute.waypoints
      .filter((waypoint) => waypoint.afterStopId === afterStopId)
      .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
    const nodes: MapPoint[] = [startMarker, ...segmentWaypoints, endMarker];
    let insertionIndex = 0;
    let longestDistance = -1;
    for (let index = 0; index < nodes.length - 1; index += 1) {
      const distance = Math.hypot(
        nodes[index + 1].x - nodes[index].x,
        nodes[index + 1].y - nodes[index].y
      );
      if (distance > longestDistance) {
        longestDistance = distance;
        insertionIndex = index;
      }
    }
    const point = prepareMapPoint({
      x: (nodes[insertionIndex].x + nodes[insertionIndex + 1].x) / 2,
      y: (nodes[insertionIndex].y + nodes[insertionIndex + 1].y) / 2
    });
    const waypoint = createMapRouteWaypoint(afterStopId, point.x, point.y, insertionIndex + 1);
    const nextSegmentWaypoints = [...segmentWaypoints];
    nextSegmentWaypoints.splice(insertionIndex, 0, waypoint);
    const segmentIds = new Set(segmentWaypoints.map((item) => item.id));
    onUpdateRoute(selectedRoute.id, {
      waypoints: [
        ...selectedRoute.waypoints.filter((item) => !segmentIds.has(item.id)),
        ...nextSegmentWaypoints.map((item, index) => ({ ...item, order: index + 1 }))
      ]
    });
  }

  function removeRouteWaypoint(waypointId: string) {
    if (!selectedRoute) return;
    onUpdateRoute(selectedRoute.id, {
      waypoints: selectedRoute.waypoints.filter((waypoint) => waypoint.id !== waypointId)
    });
  }

  function handleRouteWaypointPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    waypoint: MapRouteWaypoint
  ) {
    if (!selectedRoute || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const latest = routeWaypointPreviews[waypoint.id] ?? waypoint;
    routeWaypointDragRef.current = {
      latest,
      pointerId: event.pointerId,
      routeId: selectedRoute.id,
      waypointId: waypoint.id
    };
    setRouteWaypointPreviews({ [waypoint.id]: latest });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleRouteWaypointPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = routeWaypointDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = mapPointFromClient(event.clientX, event.clientY);
    if (!point) return;
    drag.latest = point;
    setRouteWaypointPreviews({ [drag.waypointId]: point });
  }

  function finishRouteWaypointDrag(
    event: ReactPointerEvent<HTMLButtonElement>,
    commit: boolean
  ) {
    const drag = routeWaypointDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (commit && selectedRoute?.id === drag.routeId) {
      onUpdateRoute(selectedRoute.id, {
        waypoints: selectedRoute.waypoints.map((waypoint) =>
          waypoint.id === drag.waypointId
            ? { ...waypoint, x: drag.latest.x, y: drag.latest.y }
            : waypoint
        )
      });
    }
    routeWaypointDragRef.current = null;
    setRouteWaypointPreviews({});
    ignoreNextStageClickRef.current = true;
  }

  function handleRouteWaypointKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    waypoint: MapRouteWaypoint
  ) {
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      removeRouteWaypoint(waypoint.id);
      return;
    }
    if (!["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"].includes(event.key)) return;
    event.preventDefault();
    const amount = event.shiftKey ? 1 : 0.25;
    const point = prepareMapPoint({
      x: waypoint.x + (event.key === "ArrowRight" ? amount : event.key === "ArrowLeft" ? -amount : 0),
      y: waypoint.y + (event.key === "ArrowDown" ? amount : event.key === "ArrowUp" ? -amount : 0)
    });
    if (!selectedRoute) return;
    onUpdateRoute(selectedRoute.id, {
      waypoints: selectedRoute.waypoints.map((item) =>
        item.id === waypoint.id ? { ...item, ...point } : item
      )
    });
  }

  function handleMapLabelPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    kind: "marker" | "region",
    itemId: string,
    placement: MapLabelPlacement,
    editable = true
  ) {
    if (canvasTool !== "pan" || placement.locked || !editable || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const latest = labelPlacementPreviews[mapLabelPreviewKey(kind, itemId)] ?? {
      x: placement.offsetX,
      y: placement.offsetY
    };
    labelDragRef.current = {
      itemId,
      kind,
      latest,
      moved: false,
      placement,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY
    };
    setLabelPlacementPreviews({ [mapLabelPreviewKey(kind, itemId)]: latest });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleMapLabelPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = labelDragRef.current;
    const stage = stageRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !stage) return;
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const deltaX = event.clientX - drag.startClientX;
    const deltaY = event.clientY - drag.startClientY;
    if (Math.hypot(deltaX, deltaY) > 2) drag.moved = true;
    drag.latest = {
      x: Number((drag.placement.offsetX + (deltaX / bounds.width) * 100).toFixed(2)),
      y: Number((drag.placement.offsetY + (deltaY / bounds.height) * 100).toFixed(2))
    };
    setLabelPlacementPreviews({
      [mapLabelPreviewKey(drag.kind, drag.itemId)]: drag.latest
    });
  }

  function finishMapLabelDrag(
    event: ReactPointerEvent<HTMLButtonElement>,
    commit: boolean
  ) {
    const drag = labelDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (commit && drag.moved) {
      const labelPlacement = {
        ...drag.placement,
        offsetX: drag.latest.x,
        offsetY: drag.latest.y
      };
      if (drag.kind === "marker") onUpdateMarker(drag.itemId, { labelPlacement });
      else updateRegion(drag.itemId, { labelPlacement });
      ignoreNextStageClickRef.current = true;
    }
    labelDragRef.current = null;
    setLabelPlacementPreviews({});
  }

  function handleMapLabelKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    kind: "marker" | "region",
    itemId: string,
    placement: MapLabelPlacement,
    editable = true
  ) {
    if (placement.locked || !editable) return;
    if (!["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const amount = event.shiftKey ? 1 : 0.25;
    const labelPlacement = {
      ...placement,
      offsetX: Number((placement.offsetX + (
        event.key === "ArrowRight" ? amount : event.key === "ArrowLeft" ? -amount : 0
      )).toFixed(2)),
      offsetY: Number((placement.offsetY + (
        event.key === "ArrowDown" ? amount : event.key === "ArrowUp" ? -amount : 0
      )).toFixed(2))
    };
    if (kind === "marker") onUpdateMarker(itemId, { labelPlacement });
    else updateRegion(itemId, { labelPlacement });
  }

  if (!activeMap) {
    return (
      <section className="panel planning-empty-state">
        <Map size={30} />
        <h2>当前世界没有地图</h2>
        <button type="button" onClick={() => onCreateMap()}><Plus size={17} />新建地图</button>
      </section>
    );
  }

  const contextMarker = contextMenu?.markerId
    ? activeMarkers.find((marker) => marker.id === contextMenu.markerId) ?? null
    : null;
  const contextMarkerIsRouteStop = Boolean(
    contextMarker && selectedRoute?.stops.some((stop) => stop.markerId === contextMarker.id)
  );
  const selectedRegionPoints = selectedRegion && regionVertexPreview?.regionId === selectedRegion.id
    ? regionVertexPreview.points
    : selectedRegion?.points ?? [];
  const selectedRegionOrderIndex = selectedRegion
    ? activeRegions.findIndex((region) => region.id === selectedRegion.id)
    : -1;

  const minimapViewportWidth = clamp(
    (viewportSize.width / Math.max(1, activeMap.width * zoom)) * 100,
    4,
    100
  );
  const minimapViewportHeight = clamp(
    (viewportSize.height / Math.max(1, activeMap.height * zoom)) * 100,
    4,
    100
  );
  const minimapViewportLeft = clamp(
    (-offset.x / Math.max(1, activeMap.width * zoom)) * 100,
    0,
    100 - minimapViewportWidth
  );
  const minimapViewportTop = clamp(
    (-offset.y / Math.max(1, activeMap.height * zoom)) * 100,
    0,
    100 - minimapViewportHeight
  );

  return (
    <div
      aria-labelledby={isFullscreen ? "map-workspace-title" : undefined}
      aria-modal={isFullscreen || undefined}
      className={`planning-workspace ${isFullscreen ? "is-map-fullscreen" : ""}`}
      ref={workspaceRef}
      role={isFullscreen ? "dialog" : undefined}
    >
      <header className="planning-toolbar">
        <div className="map-heading-block">
          <nav aria-label="地图层级" className="map-hierarchy-breadcrumb">
            <span><Map size={14} />地图</span>
            {activeMapPath.map((mapItem, index) => (
              <span key={mapItem.id}>
                <ChevronRight size={13} />
                {index === activeMapPath.length - 1 ? (
                  <strong aria-current="page">{mapItem.title}</strong>
                ) : (
                  <button type="button" onClick={() => selectMap(mapItem.id)}>{mapItem.title}</button>
                )}
              </span>
            ))}
          </nav>
          <h2 id="map-workspace-title">{activeMap.title}</h2>
        </div>
        <div className="planning-map-switcher">
          <label>
            <span>当前地图</span>
            <select aria-label="当前地图" value={activeMap.id} onChange={(event) => selectMap(event.target.value)}>
              {hierarchyEntries.map((entry) => (
                <option key={entry.map.id} value={entry.map.id}>
                  {`${"\u00a0\u00a0".repeat(entry.depth)}${entry.depth ? "↳ " : ""}${entry.map.title}`}
                </option>
              ))}
            </select>
          </label>
          <label className="map-phase-switcher">
            <span>剧情阶段</span>
            <select
              aria-label="当前剧情阶段"
              value={selectedStoryPhaseId}
              onChange={(event) => setSelectedStoryPhaseId(event.target.value)}
            >
              <option value="">全量编辑</option>
              {storyPhases.map((phase) => (
                <option key={phase.id} value={phase.id}>{phase.title}</option>
              ))}
            </select>
          </label>
          <button
            aria-label="新建剧情阶段"
            className="map-phase-add"
            title="新建剧情阶段"
            type="button"
            onClick={createStoryPhase}
          >
            <CalendarPlus size={17} />
          </button>
          <button type="button" onClick={() => onCreateMap()}><Plus size={17} /><span>新建地图</span></button>
          <button
            title={selectedMarker ? `以“${selectedMarker.label}”为入口创建子地图` : "在当前地图下创建子地图"}
            type="button"
            onClick={() => onCreateMap(activeMap.id, selectedMarker?.id)}
          >
            <FolderPlus size={17} /><span>子地图</span>
          </button>
          <button
            aria-label={isFullscreen ? "退出地图专注模式" : "最大化地图工作区"}
            className="map-focus-toggle"
            title={isFullscreen ? "退出地图专注模式" : "最大化地图工作区"}
            type="button"
            onClick={toggleMapFullscreen}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      <input
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="map-image-file-input"
        ref={mapImageInputRef}
        type="file"
        onChange={handleMapFile}
      />
      <input
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="map-image-file-input"
        multiple
        ref={mapLayerImageInputRef}
        type="file"
        onChange={handleMapLayerFile}
      />
      <input
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        aria-label="自定义标记图标文件"
        className="map-image-file-input"
        ref={markerIconInputRef}
        type="file"
        onChange={handleMarkerIconFile}
      />

      <section className={`map-planning-layout ${browserCollapsed ? "is-browser-collapsed" : ""} ${inspectorCollapsed ? "is-inspector-collapsed" : ""}`}>
        {!browserCollapsed ? <aside className="panel planning-browser">
          <div className="planning-mode-switch has-four" role="group" aria-label="地图内容类型">
            <button className={mode === "markers" ? "is-active" : ""} type="button" onClick={() => changeMode("markers")}>
              <MapPin size={16} /><span>标记 {activeStoryPhase ? `${visibleActiveMarkers.length}/${activeMarkers.length}` : activeMarkers.length}</span>
            </button>
            <button className={mode === "routes" ? "is-active" : ""} type="button" onClick={() => changeMode("routes")}>
              <GitBranch size={16} /><span>路线 {activeStoryPhase ? `${visibleActiveRoutes.length}/${activeRoutes.length}` : activeRoutes.length}</span>
            </button>
            <button className={mode === "regions" ? "is-active" : ""} type="button" onClick={() => changeMode("regions")}>
              <Pentagon size={16} /><span>区域 {activeStoryPhase ? `${visibleActiveRegions.length}/${activeRegions.length}` : activeRegions.length}</span>
            </button>
            <button className={mode === "layers" ? "is-active" : ""} type="button" onClick={() => changeMode("layers")}>
              <Layers3 size={16} /><span>图层 {activeStoryPhase ? `${activeLayers.filter((layer) => !phaseVisibility.layers.has(layer.id)).length}/${activeLayers.length}` : activeLayers.length}</span>
            </button>
          </div>
          <label className="planning-search">
            <Search size={16} />
            <input
              value={query}
              placeholder={mode === "markers" ? "搜索标记" : mode === "routes" ? "搜索路线" : mode === "regions" ? "搜索区域" : isFullscreen ? "搜索标记组" : "搜索图层或分组"}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedSavedFilterId("");
              }}
            />
          </label>
          <div className={`map-catalog-filter-bar ${mode === "markers" ? "has-three" : ""}`}>
            <span aria-hidden="true" className="map-catalog-filter-icon"><ListFilter size={15} /></span>
            {mode === "markers" ? (
              <>
                <select
                  aria-label="按标记类型筛选"
                  value={markerKindFilter}
                  onChange={(event) => {
                    setMarkerKindFilter(event.target.value as "" | MapMarkerKind);
                    setSelectedSavedFilterId("");
                  }}
                >
                  <option value="">全部类型</option>
                  {mapMarkerKinds.map((kind) => <option key={kind} value={kind}>{markerKindMeta[kind].label}</option>)}
                </select>
                <select
                  aria-label="按标记图层筛选"
                  value={markerLayerFilter}
                  onChange={(event) => {
                    setMarkerLayerFilter(event.target.value);
                    setSelectedSavedFilterId("");
                  }}
                >
                  <option value="">全部图层</option>
                  {activeLayers.map((layer) => <option key={layer.id} value={layer.id}>{layer.title}</option>)}
                </select>
                <select
                  aria-label="按标记分组筛选"
                  value={markerGroupFilter}
                  onChange={(event) => {
                    setMarkerGroupFilter(event.target.value);
                    setSelectedSavedFilterId("");
                  }}
                >
                  <option value="">全部分组</option>
                  <option value="__ungrouped__">未分组</option>
                  {activeGroups.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}
                </select>
              </>
            ) : mode === "routes" ? (
              <select
                aria-label="按路线状态筛选"
                value={routeStatusFilter}
                onChange={(event) => {
                  setRouteStatusFilter(event.target.value as "" | MapRouteStatus);
                  setSelectedSavedFilterId("");
                }}
              >
                <option value="">全部状态</option>
                {(Object.keys(routeStatusMeta) as MapRouteStatus[]).map((status) => (
                  <option key={status} value={status}>{routeStatusMeta[status]}</option>
                ))}
              </select>
            ) : mode === "regions" ? (
              <select
                aria-label="按区域类型筛选"
                value={regionKindFilter}
                onChange={(event) => {
                  setRegionKindFilter(event.target.value as "" | MapRegionKind);
                  setSelectedSavedFilterId("");
                }}
              >
                <option value="">全部类型</option>
                {(Object.keys(regionKindMeta) as MapRegionKind[]).map((kind) => (
                  <option key={kind} value={kind}>{regionKindMeta[kind]}</option>
                ))}
              </select>
            ) : <span className="map-catalog-filter-hint">名称与说明</span>}
            <output title={`显示 ${filteredCatalogCount} / ${totalCatalogCount}`}>{filteredCatalogCount}/{totalCatalogCount}</output>
            <button
              aria-label="清除地图目录筛选"
              disabled={!hasActiveCatalogFilter}
              title="清除筛选"
              type="button"
              onClick={clearCatalogFilters}
            >
              <X size={14} />
            </button>
          </div>
          <div className="map-saved-filter-row">
            <select
              aria-label="已保存的地图筛选"
              value={selectedSavedFilterId}
              onChange={(event) => {
                const filter = savedFilters.find((item) => item.id === event.target.value);
                if (filter) applySavedFilter(filter);
                else setSelectedSavedFilterId("");
              }}
            >
              <option value="">已保存筛选</option>
              {savedFilters.map((filter) => <option key={filter.id} value={filter.id}>{filter.title}</option>)}
            </select>
            <button
              aria-label="保存当前地图筛选"
              disabled={!hasActiveCatalogFilter}
              title="保存当前筛选"
              type="button"
              onClick={() => {
                setFilterSaveTitle("");
                setFilterSaveDraftOpen(true);
              }}
            >
              <Save size={15} />
            </button>
            <button
              aria-label="删除已保存的地图筛选"
              disabled={!selectedSavedFilterId}
              title="删除已保存筛选"
              type="button"
              onClick={deleteSelectedSavedFilter}
            >
              <Trash2 size={15} />
            </button>
          </div>
          {filterSaveDraftOpen ? (
            <div className="map-filter-save-draft">
              <input
                aria-label="地图筛选名称"
                autoFocus
                placeholder={`筛选 ${activeMap.savedFilters.length + 1}`}
                value={filterSaveTitle}
                onChange={(event) => setFilterSaveTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveCurrentFilter();
                  else if (event.key === "Escape") setFilterSaveDraftOpen(false);
                }}
              />
              <button aria-label="确认保存地图筛选" title="保存" type="button" onClick={saveCurrentFilter}><Check size={15} /></button>
              <button aria-label="取消保存地图筛选" title="取消" type="button" onClick={() => setFilterSaveDraftOpen(false)}><X size={15} /></button>
            </div>
          ) : null}
          {mode === "markers" ? (
            <>
              <button className={`planning-primary-action ${placing ? "is-active" : ""}`} disabled={!placementLayer} title={placementLayer ? `放置到图层：${placementLayer.title}` : "没有可编辑的可见图层"} type="button" onClick={() => setPlacing((value) => !value)}>
                <MapPin size={17} /><span>{placing ? "取消放置" : "放置标记"}</span>
              </button>
              <VirtualizedPlanningList
                emptyText="没有匹配的标记"
                itemKey={(marker) => marker.id}
                items={filteredMarkers}
                selectedIndex={filteredMarkers.findIndex((marker) => marker.id === selectedMarker?.id)}
                renderItem={(marker) => {
                  const Icon = markerKindMeta[marker.markerType].icon;
                  const phaseHidden = Boolean(activeStoryPhase) && (
                    phaseVisibility.markers.has(marker.id)
                    || phaseVisibility.layers.has(marker.layerId)
                    || phaseVisibility.groups.has(marker.groupId)
                  );
                  const visible = !phaseHidden && isMapMarkerVisible(marker, activeLayers, activeGroups);
                  const editable = isMapMarkerEditable(marker, activeLayers, activeGroups);
                  return (
                    <button
                      aria-pressed={selectedMarkerSet.has(marker.id)}
                      className={`${selectedMarkerSet.has(marker.id) ? "is-active" : ""} ${visible ? "" : "is-hidden"}`}
                      key={marker.id}
                      type="button"
                      onClick={(event) => selectMarker(marker.id, event.ctrlKey || event.metaKey || event.shiftKey)}
                    >
                      <span className="planning-color-icon" style={{ background: marker.color }}>
                        {marker.iconUrl ? <img alt="" src={marker.iconUrl} /> : <Icon size={15} />}
                      </span>
                      <span><strong>{marker.label}</strong><small>{markerKindMeta[marker.markerType].label} · {phaseHidden ? "本阶段隐藏" : visible ? editable ? "可编辑" : "已锁定" : "已隐藏"}</small></span>
                    </button>
                  );
                }}
              />
            </>
          ) : mode === "routes" ? (
            <>
              <button className="planning-primary-action" type="button" onClick={() => onCreateRoute(activeMap.id)}>
                <Plus size={17} /><span>新建路线</span>
              </button>
              <VirtualizedPlanningList
                emptyText="没有匹配的路线"
                itemKey={(route) => route.id}
                items={filteredRoutes}
                selectedIndex={filteredRoutes.findIndex((route) => route.id === selectedRoute?.id)}
                renderItem={(route) => {
                  const metrics = calculateMapRouteMetrics(route, activeMarkers, activeMap);
                  const phaseHidden = phaseVisibility.routes.has(route.id);
                  return (
                    <button className={`${route.id === selectedRoute?.id ? "is-active" : ""} ${phaseHidden ? "is-hidden" : ""}`} key={route.id} type="button" onClick={() => selectRoute(route.id)}>
                      <span className="planning-color-icon" style={{ background: route.color }}><GitBranch size={15} /></span>
                      <span><strong>{route.title}</strong><small>{phaseHidden ? "本阶段隐藏" : `${routeStatusMeta[route.status]} · ${route.stops.length} 站 · ${formatMapDistance(metrics.distance, activeMap)}`}</small></span>
                    </button>
                  );
                }}
              />
            </>
          ) : mode === "regions" ? (
            <>
              <button
                className={`planning-primary-action ${canvasTool === "region" ? "is-active" : ""}`}
                type="button"
                onClick={() => canvasTool === "region" ? cancelRegionDrawing() : startRegionDrawing()}
              >
                <Pentagon size={17} /><span>{canvasTool === "region" ? "取消绘制" : "绘制区域"}</span>
              </button>
              <VirtualizedPlanningList
                emptyText="没有匹配的区域"
                itemKey={(region) => region.id}
                items={filteredRegions}
                selectedIndex={filteredRegions.findIndex((region) => region.id === selectedRegion?.id)}
                renderItem={(region) => {
                  const metrics = calculateMapRegionMetrics(region);
                  const phaseHidden = phaseVisibility.regions.has(region.id);
                  return (
                    <button
                      aria-pressed={selectedRegionSet.has(region.id)}
                      className={`${selectedRegionSet.has(region.id) ? "is-active" : ""} ${region.visible && !phaseHidden ? "" : "is-hidden"}`}
                      key={region.id}
                      type="button"
                      onClick={(event) => selectRegion(region.id, false, event.ctrlKey || event.metaKey || event.shiftKey)}
                    >
                      <span className="planning-color-icon" style={{ background: region.color }}><Pentagon size={15} /></span>
                      <span>
                        <strong>{region.title}</strong>
                        <small>{phaseHidden ? "本阶段隐藏" : `${regionKindMeta[region.kind]} · ${metrics.areaPercent}% · ${region.visible ? region.locked ? "已锁定" : `${region.points.length} 点` : "已隐藏"}`}</small>
                      </span>
                    </button>
                  );
                }}
              />
            </>
          ) : (
            <>
              <div className={`planning-structure-actions ${isFullscreen ? "is-groups-only" : ""}`}>
                {!isFullscreen ? <button type="button" onClick={() => void createLayer()}><Layers3 size={16} /><span>新建图层</span></button> : null}
                <button type="button" onClick={createMarkerGroup}><FolderTree size={16} /><span>新建分组</span></button>
              </div>
              <div className="planning-item-list map-structure-list">
                {!isFullscreen ? (
                  <>
                    <h3>图层</h3>
                    {filteredLayers.map((layer) => (
                      <button className={`${selectedLayer?.id === layer.id ? "is-active" : ""} ${phaseVisibility.layers.has(layer.id) ? "is-hidden" : ""}`} key={layer.id} type="button" onClick={() => {
                        setSelectedStructure({ kind: "layer", id: layer.id });
                        setActivePaletteLayerId(layer.id);
                        setFullscreenDockTab("properties");
                      }}>
                        <span className="planning-color-icon" style={{ background: layer.color }}><Layers3 size={15} /></span>
                        <span><strong>{layer.title}</strong><small>{phaseVisibility.layers.has(layer.id) ? "本阶段隐藏" : `${layer.visible ? "显示" : "隐藏"} · ${layer.locked ? "锁定" : `${activeMarkers.filter((marker) => marker.layerId === layer.id).length} 个标记`}${layer.imageUrl ? " · 图片" : ""}`}</small></span>
                      </button>
                    ))}
                  </>
                ) : null}
                <h3>标记组</h3>
                {filteredGroups.map((group) => (
                  <button className={`${selectedGroup?.id === group.id ? "is-active" : ""} ${phaseVisibility.groups.has(group.id) ? "is-hidden" : ""}`} key={group.id} type="button" onClick={() => {
                    setSelectedStructure({ kind: "group", id: group.id });
                    setFullscreenDockTab("properties");
                  }}>
                    <span className="planning-color-icon" style={{ background: group.color }}><FolderTree size={15} /></span>
                    <span><strong>{group.title}</strong><small>{phaseVisibility.groups.has(group.id) ? "本阶段隐藏" : `${group.visible ? "显示" : "隐藏"} · ${group.locked ? "锁定" : `${activeMarkers.filter((marker) => marker.groupId === group.id).length} 个标记`}`}</small></span>
                  </button>
                ))}
                {(!filteredGroups.length && (isFullscreen || !filteredLayers.length)) ? <p className="muted-text">{isFullscreen ? "没有匹配的标记组" : "没有匹配的图层或分组"}</p> : null}
              </div>
            </>
          )}
        </aside> : null}

        <div className="map-canvas-column">
          <div className="map-canvas-toolbar" role="toolbar" aria-label="地图画布工具栏">
            <div className="map-canvas-toolbar-group">
              <button
                aria-label={browserCollapsed ? "展开地图目录" : "收起地图目录"}
                aria-pressed={!browserCollapsed}
                className={!browserCollapsed ? "is-active" : ""}
                data-map-interactive="true"
                title={browserCollapsed ? "展开地图目录" : "收起地图目录"}
                type="button"
                onClick={() => setBrowserCollapsed((current) => !current)}
              >
                {browserCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
              <span aria-hidden="true" className="map-toolbar-divider" />
              <button
                aria-label="手形平移工具"
                aria-pressed={canvasTool === "pan"}
                className={canvasTool === "pan" ? "is-active" : ""}
                data-map-interactive="true"
                title="手形平移工具"
                type="button"
                onClick={() => {
                  setCanvasTool("pan");
                  setPlacing(false);
                }}
              >
                <Hand size={16} />
              </button>
              <button
                aria-label="框选标记工具"
                aria-pressed={canvasTool === "select"}
                className={canvasTool === "select" ? "is-active" : ""}
                data-map-interactive="true"
                title="框选标记工具"
                type="button"
                onClick={() => {
                  setCanvasTool("select");
                  setMode("markers");
                  setSelectedRegionIds([]);
                  setSelectedRegionId("");
                  setEditingRegionId("");
                  setRegionIsolationEnabled(false);
                  setPlacing(false);
                }}
              >
                <BoxSelect size={16} />
              </button>
              <button
                aria-label={canvasTool === "route" ? "完成路线绘制" : "路线绘制工具"}
                aria-pressed={canvasTool === "route"}
                className={canvasTool === "route" ? "is-active" : ""}
                data-map-interactive="true"
                title={canvasTool === "route" ? "完成路线绘制" : "路线绘制工具"}
                type="button"
                onClick={toggleRouteTool}
              >
                <PenTool size={16} />
              </button>
              <button
                aria-label={canvasTool === "region" ? "取消区域绘制" : "区域绘制工具"}
                aria-pressed={canvasTool === "region"}
                className={canvasTool === "region" ? "is-active" : ""}
                data-map-interactive="true"
                title={canvasTool === "region" ? "取消区域绘制" : "区域绘制工具"}
                type="button"
                onClick={() => canvasTool === "region" ? cancelRegionDrawing() : startRegionDrawing()}
              >
                <Pentagon size={16} />
              </button>
              <button
                aria-label={canvasTool === "measure" ? "结束地图测距" : "地图测距工具"}
                aria-pressed={canvasTool === "measure"}
                className={canvasTool === "measure" ? "is-active" : ""}
                data-map-interactive="true"
                title={canvasTool === "measure" ? "结束地图测距" : "地图测距工具"}
                type="button"
                onClick={() => canvasTool === "measure" ? setCanvasTool("pan") : startMeasurement()}
              >
                <Ruler size={16} />
              </button>
              <button
                aria-label="全选可见标记"
                data-map-interactive="true"
                disabled={!visibleActiveMarkers.length}
                title="全选可见标记"
                type="button"
                onClick={selectAllVisibleMarkers}
              >
                <Check size={16} />
              </button>
              <span aria-hidden="true" className="map-toolbar-divider" />
              <button
                aria-label={undoMapOperationLabel ? `撤销：${undoMapOperationLabel}` : "撤销地图操作"}
                data-map-interactive="true"
                disabled={!undoMapOperationLabel}
                title={undoMapOperationLabel ? `撤销：${undoMapOperationLabel}` : "没有可撤销的地图操作"}
                type="button"
                onClick={onUndoMapOperation}
              >
                <Undo2 size={16} />
              </button>
              <button
                aria-label={redoMapOperationLabel ? `重做：${redoMapOperationLabel}` : "重做地图操作"}
                data-map-interactive="true"
                disabled={!redoMapOperationLabel}
                title={redoMapOperationLabel ? `重做：${redoMapOperationLabel}` : "没有可重做的地图操作"}
                type="button"
                onClick={onRedoMapOperation}
              >
                <Redo2 size={16} />
              </button>
              <button
                aria-label={showLabels ? "隐藏地图标签" : "显示地图标签"}
                aria-pressed={showLabels}
                className={showLabels ? "is-active" : ""}
                data-map-interactive="true"
                title={showLabels ? "隐藏地图标签" : "显示地图标签"}
                type="button"
                onClick={() => setShowLabels((current) => !current)}
              >
                <Tags size={16} />
              </button>
            </div>
            {activeStoryPhase ? (
              <output className="map-active-phase-status" title={`当前剧情阶段：${activeStoryPhase.title}`}>
                <CalendarClock size={14} /><span>{activeStoryPhase.title}</span>
              </output>
            ) : null}
            <div className="map-canvas-toolbar-group">
              <button
                aria-label={activeMap.imageUrl ? "更换地图底图" : "添加地图底图"}
                data-map-interactive="true"
                title={activeMap.imageUrl ? "更换地图底图" : "添加地图底图"}
                type="button"
                onClick={openMapImagePicker}
              >
                <ImageIcon size={16} />
              </button>
              <button
                aria-label={isMapImageTransformMode ? "完成底图调整" : "调整地图底图"}
                aria-pressed={isMapImageTransformMode}
                className={isMapImageTransformMode ? "is-active" : ""}
                data-map-interactive="true"
                disabled={!activeMap.imageUrl}
                title={isMapImageTransformMode ? "完成底图调整" : "调整地图底图"}
                type="button"
                onClick={toggleImageTransformMode}
              >
                <Move size={16} />
              </button>
              <span aria-hidden="true" className="map-toolbar-divider" />
              <button
                aria-label="缩小地图"
                data-map-interactive="true"
                disabled={zoom <= MIN_MAP_ZOOM}
                title="缩小地图"
                type="button"
                onClick={() => zoomAt(zoomRef.current / 1.15)}
              >
                <ZoomOut size={16} />
              </button>
              <output className="map-zoom-value">{Math.round(zoom * 100)}%</output>
              <button
                aria-label="放大地图"
                data-map-interactive="true"
                disabled={zoom >= MAX_MAP_ZOOM}
                title="放大地图"
                type="button"
                onClick={() => zoomAt(zoomRef.current * 1.15)}
              >
                <ZoomIn size={16} />
              </button>
              <button
                aria-label="适配整张地图"
                data-map-interactive="true"
                title="适配整张地图"
                type="button"
                onClick={fitToView}
              >
                <Scan size={16} />
              </button>
              <button
                aria-label="适配全部画布内容"
                data-map-interactive="true"
                title="适配全部画布内容"
                type="button"
                onClick={fitContentToView}
              >
                <Frame size={16} />
              </button>
              <div className="map-view-bookmark-menu" ref={bookmarkMenuRef}>
                <button
                  aria-label="地图视图书签"
                  aria-expanded={bookmarkMenuOpen}
                  aria-pressed={bookmarkMenuOpen}
                  className={bookmarkMenuOpen ? "is-active" : ""}
                  data-map-interactive="true"
                  title="地图视图书签"
                  type="button"
                  onClick={() => setBookmarkMenuOpen((current) => !current)}
                >
                  <Bookmark size={16} />
                </button>
                {bookmarkMenuOpen ? (
                  <div
                    aria-label="地图视图书签列表"
                    className="map-view-bookmark-popover"
                    data-map-interactive="true"
                    role="dialog"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <header>
                      <strong>视图书签</strong>
                      <span>{activeMap.viewBookmarks.length}</span>
                    </header>
                    <div className="map-view-bookmark-adder">
                      <input
                        aria-label="新视图书签名称"
                        placeholder={`视图 ${activeMap.viewBookmarks.length + 1}`}
                        value={bookmarkDraftTitle}
                        onChange={(event) => setBookmarkDraftTitle(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") saveMapViewBookmark();
                        }}
                      />
                      <button
                        aria-label="保存当前地图视图"
                        title="保存当前视图"
                        type="button"
                        onClick={saveMapViewBookmark}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <div className="map-view-bookmark-list">
                      {activeMap.viewBookmarks.map((bookmark, index) => (
                        <div key={bookmark.id}>
                          <button
                            aria-label={`打开视图书签 ${bookmark.title}`}
                            title="打开视图"
                            type="button"
                            onClick={() => openMapViewBookmark(bookmark)}
                          >
                            <LocateFixed size={14} />
                          </button>
                          <input
                            aria-label={`视图书签 ${index + 1} 名称`}
                            value={bookmark.title}
                            onChange={(event) => updateMapViewBookmark(bookmark.id, {
                              title: event.target.value
                            })}
                          />
                          <button
                            aria-label={`用当前视图更新 ${bookmark.title}`}
                            title="用当前视图更新"
                            type="button"
                            onClick={() => overwriteMapViewBookmark(bookmark.id)}
                          >
                            <Save size={14} />
                          </button>
                          <button
                            aria-label={`删除视图书签 ${bookmark.title}`}
                            title="删除视图"
                            type="button"
                            onClick={() => deleteMapViewBookmark(bookmark.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {!activeMap.viewBookmarks.length ? <p>暂无视图书签</p> : null}
                    </div>
                  </div>
                ) : null}
              </div>
              <button
                aria-label="定位当前地图标记"
                data-map-interactive="true"
                disabled={!selectedMarker}
                title="定位当前地图标记"
                type="button"
                onClick={() => selectedMarker && centerMapPoint(selectedMarker.x, selectedMarker.y)}
              >
                <LocateFixed size={16} />
              </button>
              <button
                aria-label="打开地图审阅中心"
                aria-pressed={reviewDialogOpen}
                className={`map-review-toolbar-button ${reviewDialogOpen ? "is-active" : ""}`}
                data-map-interactive="true"
                title="地图智能检查与版本对比"
                type="button"
                onClick={() => openMapReviewCenter("intelligence")}
              >
                <Sparkles size={16} />
                {localMapFindings.some((finding) => finding.severity !== "info") ? (
                  <span aria-hidden="true" className="map-review-toolbar-badge">
                    {Math.min(99, localMapFindings.filter((finding) => finding.severity !== "info").length)}
                  </span>
                ) : null}
              </button>
              <button
                aria-label="打开地图设置"
                data-map-interactive="true"
                title="打开地图设置"
                type="button"
                onClick={openMapSettings}
              >
                <Map size={16} />
              </button>
              <button
                aria-label="导出高清地图"
                data-map-interactive="true"
                title="导出高清地图"
                type="button"
                onClick={openMapExportDialog}
              >
                <Download size={16} />
              </button>
              <button
                aria-label={inspectorCollapsed ? "展开地图检查器" : "收起地图检查器"}
                aria-pressed={!inspectorCollapsed}
                className={!inspectorCollapsed ? "is-active" : ""}
                data-map-interactive="true"
                title={inspectorCollapsed ? "展开地图检查器" : "收起地图检查器"}
                type="button"
                onClick={() => setInspectorCollapsed((current) => !current)}
              >
                {inspectorCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
              </button>
            </div>
          </div>

          <div
            aria-label="交互式地图画布"
            className={`map-planning-viewport ${isPanning ? "is-panning" : ""} ${placing ? "is-placing" : ""} ${isImageDropActive ? "is-image-drop-active" : ""} ${isImageTransformMode ? "is-image-transforming" : ""} ${canvasTool === "select" ? "is-selecting" : ""} ${canvasTool === "route" ? "is-route-drawing" : ""} ${canvasTool === "region" ? "is-region-drawing" : ""} ${canvasTool === "measure" ? "is-measuring" : ""}`}
            ref={viewportRef}
            style={{
              backgroundPosition: `${offset.x}px ${offset.y}px`,
              backgroundSize: `${Math.max(10, 64 * zoom)}px ${Math.max(10, 64 * zoom)}px`
            }}
            tabIndex={0}
            onClick={handleCanvasClick}
            onContextMenu={(event) => openMapContextMenu(event)}
            onDoubleClick={handleCanvasDoubleClick}
            onDragEnter={handleMapImageDrag}
            onDragLeave={handleMapImageDragLeave}
            onDragOver={handleMapImageDrag}
            onDrop={handleMapImageDrop}
            onPointerCancel={stopViewportPanning}
            onPointerDown={handleViewportPointerDown}
            onPointerLeave={() => canvasTool === "region" && setRegionDraftCursor(null)}
            onPointerMove={handleViewportPointerMove}
            onPointerUp={stopViewportPanning}
          >
            <div
              aria-label="地图坐标空间，中心原点为 0,0"
              className={`map-planning-stage is-unbounded ${placing ? "is-placing" : ""} ${canvasTool === "region" ? "is-region-drawing" : ""} ${canvasTool === "measure" ? "is-measuring" : ""}`}
              ref={stageRef}
              style={{
                height: activeMap.height * zoom,
                left: offset.x,
                top: offset.y,
                width: activeMap.width * zoom
              }}
          >
          <div className="map-basemap-surface">
          {activeMap.imageUrl ? (
            <img
              alt={activeMap.title}
              className="map-background-image"
              draggable={false}
              src={activeMap.imageUrl}
              style={getContainedMapImageFrameStyle(
                activeMap,
                imageNaturalSizes[activeMap.imageUrl],
                isImageTransformMode && !transformingLayerImageId
                  ? activeImageTransform
                  : activeMap.imageTransform
              )}
              onLoad={(event) => rememberMapImageNaturalSize(activeMap.imageUrl, event.currentTarget)}
            />
          ) : null}
          <div aria-hidden="true" className="map-canvas-origin">
            <span />
            <small>0,0</small>
          </div>
          {activeLayers
            .filter(
              (layer) => layer.visible
                && layer.imageUrl
                && !phaseVisibility.layers.has(layer.id)
            )
            .map((layer) => {
              const selectable = mode === "layers"
                && canvasTool === "pan"
                && !layer.locked
                && !phaseVisibility.layers.has(layer.id);
              const renderedTransform = isImageTransformMode && transformingLayerImageSet.has(layer.id)
                ? layerImageTransformPreviews[layer.id] ?? layer.imageTransform
                : layer.imageTransform;
              const frameStyle = getContainedMapImageFrameStyle(
                activeMap,
                imageNaturalSizes[layer.imageUrl],
                renderedTransform
              );
              return (
                <Fragment key={layer.id}>
                  <img
                    alt=""
                    aria-hidden="true"
                    className={`map-layer-image ${transformingLayerImageSet.has(layer.id) ? "is-transforming" : ""} ${selectedImageLayerSet.has(layer.id) ? "is-selected" : ""}`}
                    data-map-layer-image-id={layer.id}
                    draggable={false}
                    src={layer.imageUrl}
                    style={{
                      ...frameStyle,
                      mixBlendMode: layer.imageBlendMode,
                      opacity: layer.imageOpacity
                    }}
                    onLoad={(event) => rememberMapImageNaturalSize(layer.imageUrl, event.currentTarget)}
                  />
                  {selectable ? (
                    <button
                      aria-label={`选择图片图层 ${layer.title}`}
                      className={`map-layer-image-hit-target ${selectedImageLayerSet.has(layer.id) ? "is-selected" : ""}`}
                      data-map-interactive="true"
                      data-map-layer-image-target-id={layer.id}
                      style={frameStyle}
                      title={`选择并移动“${layer.title}”`}
                      type="button"
                      onKeyDown={(event) => handleLayerImageKeyDown(event, layer)}
                      onPointerCancel={(event) => finishImageTransformDrag(event, true)}
                      onPointerDown={(event) => handleLayerImagePointerDown(event, layer)}
                      onPointerMove={handleImageTransformPointerMove}
                      onPointerUp={(event) => finishImageTransformDrag(event, true)}
                    />
                  ) : null}
                </Fragment>
              );
            })}
          {activeTransformImageUrl && isImageTransformMode ? (
            <div
              aria-label={isMultiLayerImageTransform ? `地图多图层图片变换框 ${transformingImageLayers.length}` : transformingLayerImageId ? "地图图层图片变换框" : "地图底图变换框"}
              className="map-image-transform-layer"
              role="group"
            >
              <div
                className={`map-image-transform-frame ${isMultiLayerImageTransform ? "is-multi" : ""}`}
                style={activeTransformFrameStyle ?? undefined}
                onClick={(event) => event.stopPropagation()}
                onPointerCancel={(event) => finishImageTransformDrag(event, true)}
                onPointerDown={handleImageTransformPointerDown}
                onPointerMove={handleImageTransformPointerMove}
                onPointerUp={(event) => finishImageTransformDrag(event, true)}
              >
                <div
                  aria-label={isMultiLayerImageTransform ? `移动 ${transformingImageLayers.length} 个图片图层` : transformingLayerImageId ? "移动图层图片" : "移动地图底图"}
                  className="map-image-transform-box"
                  data-image-transform-handle="move"
                  role="button"
                  tabIndex={0}
                  title={isMultiLayerImageTransform ? `移动 ${transformingImageLayers.length} 个图片图层` : transformingLayerImageId ? "移动图层图片" : "移动地图底图"}
                  onKeyDown={(event) => handleImageTransformKeyDown(event, "move")}
                />
                <button
                  aria-label={isMultiLayerImageTransform ? `旋转 ${transformingImageLayers.length} 个图片图层` : transformingLayerImageId ? "旋转图层图片" : "旋转地图底图"}
                  className="map-image-transform-handle is-rotate"
                  data-image-transform-handle="rotate"
                  title={isMultiLayerImageTransform ? "旋转所选图片图层" : transformingLayerImageId ? "旋转图层图片" : "旋转地图底图"}
                  type="button"
                  onKeyDown={(event) => handleImageTransformKeyDown(event, "rotate")}
                >
                  <RotateCw size={16} />
                </button>
                <button
                  aria-label={isMultiLayerImageTransform ? `缩放 ${transformingImageLayers.length} 个图片图层` : transformingLayerImageId ? "缩放图层图片" : "缩放地图底图"}
                  className="map-image-transform-handle is-scale is-southeast"
                  data-image-transform-handle="scale"
                  title={isMultiLayerImageTransform ? "缩放所选图片图层" : transformingLayerImageId ? "缩放图层图片" : "缩放地图底图"}
                  type="button"
                  onKeyDown={(event) => handleImageTransformKeyDown(event, "scale")}
                >
                  <Scaling size={16} />
                </button>
                {(["northwest", "northeast", "southwest"] as const).map((corner) => (
                  <button
                    aria-label={`${corner === "northwest" ? "左上" : corner === "northeast" ? "右上" : "左下"}角缩放${isMultiLayerImageTransform ? "所选图片图层" : transformingLayerImageId ? "图层图片" : "地图底图"}`}
                    className={`map-image-transform-corner is-${corner}`}
                    data-image-transform-handle="scale"
                    key={corner}
                    title="按住拖动等比缩放"
                    type="button"
                    onKeyDown={(event) => handleImageTransformKeyDown(event, "scale")}
                  />
                ))}
              </div>
            </div>
          ) : null}
          {imageSnapGuides.vertical !== null ? (
            <span
              aria-hidden="true"
              className="map-image-snap-guide is-vertical"
              style={{ left: `${imageSnapGuides.vertical}%` }}
            />
          ) : null}
          {imageSnapGuides.horizontal !== null ? (
            <span
              aria-hidden="true"
              className="map-image-snap-guide is-horizontal"
              style={{ top: `${imageSnapGuides.horizontal}%` }}
            />
          ) : null}
          {activeMap.grid.visible && activeGrid ? (
            <>
              <svg
                aria-hidden="true"
                className="map-grid-layer"
                preserveAspectRatio="none"
                style={{ color: activeMap.grid.color, opacity: activeMap.grid.opacity }}
                viewBox="0 0 100 100"
              >
                {Array.from({ length: activeGrid.columns + 1 }, (_, index) => (
                  <line
                    key={`grid-column:${index}`}
                    vectorEffect="non-scaling-stroke"
                    x1={index * activeGrid.stepX}
                    x2={index * activeGrid.stepX}
                    y1={0}
                    y2={100}
                  />
                ))}
                {Array.from({ length: activeGrid.rows + 1 }, (_, index) => (
                  <line
                    key={`grid-row:${index}`}
                    vectorEffect="non-scaling-stroke"
                    x1={0}
                    x2={100}
                    y1={index * activeGrid.stepY}
                    y2={index * activeGrid.stepY}
                  />
                ))}
              </svg>
              {activeMap.grid.labels
                ? Array.from({ length: activeGrid.columns }, (_, index) => (
                    <span
                      aria-hidden="true"
                      className="map-grid-coordinate is-column"
                      key={`grid-column-label:${index}`}
                      style={{
                        left: `${(index + 0.5) * activeGrid.stepX}%`,
                        top: `${Math.min(1.6, activeGrid.stepY * 0.14)}%`,
                        transform: "translate(-50%, -50%)"
                      }}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                  ))
                : null}
              {activeMap.grid.labels
                ? Array.from({ length: activeGrid.rows }, (_, index) => (
                    <span
                      aria-hidden="true"
                      className="map-grid-coordinate is-row"
                      key={`grid-row-label:${index}`}
                      style={{
                        left: `${Math.min(1.2, activeGrid.stepX * 0.14)}%`,
                        top: `${(index + 0.5) * activeGrid.stepY}%`,
                        transform: "translate(-50%, -50%)"
                      }}
                    >
                      {index + 1}
                    </span>
                  ))
                : null}
            </>
          ) : null}
          </div>
          <svg className="map-region-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
            {renderedActiveRegions
              .filter((region) => region.points.length >= 3)
              .map((region) => {
                const points = regionVertexPreview?.regionId === region.id
                  ? regionVertexPreview.points
                  : region.points;
                const isSelected = selectedRegionSet.has(region.id);
                const pointList = points.map((point) => `${point.x},${point.y}`).join(" ");
                const shapeProps = {
                  "aria-label": `地图区域 ${region.title}`,
                  "aria-pressed": isSelected,
                  className: `${isSelected ? "is-active" : ""} ${region.id === selectedRegion?.id ? "is-primary" : ""} ${editingRegionId === region.id ? "is-editing" : ""} ${region.locked ? "is-locked" : ""}`,
                  "data-region-id": region.id,
                  role: "button",
                  stroke: region.color,
                  style: { fill: region.color, fillOpacity: region.opacity },
                  tabIndex: 0,
                  onClick: (event: MouseEvent<SVGElement>) => {
                    if (canvasTool !== "pan") return;
                    event.stopPropagation();
                    if (ignoreNextStageClickRef.current) {
                      ignoreNextStageClickRef.current = false;
                      return;
                    }
                    selectRegion(region.id, false, event.ctrlKey || event.metaKey || event.shiftKey);
                  },
                  onDoubleClick: (event: MouseEvent<SVGElement>) => {
                    if (canvasTool !== "pan" || region.locked) return;
                    event.preventDefault();
                    event.stopPropagation();
                    selectRegion(region.id, true);
                  },
                  onKeyDown: (event: ReactKeyboardEvent<SVGElement>) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectRegion(region.id);
                    }
                  }
                };
                return (
                  <g key={region.id}>
                    {region.holes.length ? (
                      <path
                        {...shapeProps}
                        d={createMapRegionSvgPath(points, region.holes)}
                        fillRule="evenodd"
                      />
                    ) : <polygon {...shapeProps} points={pointList} />}
                  </g>
                );
              })}
            {regionDraft.length >= 3 ? (
              <polygon
                aria-hidden="true"
                className="is-draft"
                points={regionDraft.map((point) => `${point.x},${point.y}`).join(" ")}
              />
            ) : null}
            {regionDraft.length ? (
              <polyline
                aria-hidden="true"
                className="is-draft-line"
                points={[...regionDraft, ...(regionDraftCursor ? [regionDraftCursor] : [])]
                  .map((point) => `${point.x},${point.y}`)
                  .join(" ")}
              />
            ) : null}
          </svg>
          <svg className="map-route-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {visibleActiveRoutes.map((route) => {
              const previewRoute = Object.keys(routeWaypointPreviews).length
                ? {
                    ...route,
                    waypoints: route.waypoints.map((waypoint) => ({
                      ...waypoint,
                      ...(routeWaypointPreviews[waypoint.id] ?? {})
                    }))
                  }
                : route;
              const path = createMapRouteSvgPath(
                getMapRoutePathPoints(previewRoute, routePathMarkers),
                route.curveMode
              );
              if (!path) return null;
              return <path className={route.id === selectedRoute?.id ? "is-active" : ""} d={path} key={route.id} stroke={route.color} />;
            })}
          </svg>
          {measurement ? (
            <>
              <svg aria-hidden="true" className="map-measurement-layer" preserveAspectRatio="none" viewBox="0 0 100 100">
                <line
                  className={`map-measurement-line ${measurement.complete ? "is-complete" : ""}`}
                  vectorEffect="non-scaling-stroke"
                  x1={measurement.start.x}
                  x2={measurement.end.x}
                  y1={measurement.start.y}
                  y2={measurement.end.y}
                />
              </svg>
              {[measurement.start, measurement.end].map((point, index) => (
                <i
                  aria-hidden="true"
                  className={`map-measurement-point ${index === 0 ? "is-start" : "is-end"}`}
                  key={index === 0 ? "measurement-start" : "measurement-end"}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                />
              ))}
              <output
                className="map-measurement-label"
                style={{
                  left: `${(measurement.start.x + measurement.end.x) / 2}%`,
                  top: `${(measurement.start.y + measurement.end.y) / 2}%`,
                  transform: "translate(-50%, -50%)"
                }}
              >
                {formatMapDistance(measurementDistance, activeMap)}
              </output>
            </>
          ) : null}
          {renderedActiveRegions
            .filter((region) => region.points.length >= 3 && visibleRegionLabelIds.has(region.id))
            .map((region) => {
              const points = regionVertexPreview?.regionId === region.id
                ? regionVertexPreview.points
                : region.points;
              const metrics = calculateMapRegionMetrics({ points, holes: region.holes });
              const placementPreview = labelPlacementPreviews[mapLabelPreviewKey("region", region.id)];
              return (
                <button
                  aria-label={`选择地图区域 ${region.title}`}
                  aria-pressed={selectedRegionSet.has(region.id)}
                  className={`map-region-label ${selectedRegionSet.has(region.id) ? "is-active" : ""} ${region.id === selectedRegion?.id ? "is-primary" : ""} ${region.labelPlacement.locked ? "is-locked" : ""} ${labelPlacementPreviews[mapLabelPreviewKey("region", region.id)] ? "is-dragging" : ""}`}
                  data-map-interactive="true"
                  key={region.id}
                  style={{
                    borderColor: region.color,
                    left: `${metrics.centroid.x + (placementPreview?.x ?? region.labelPlacement.offsetX)}%`,
                    top: `${metrics.centroid.y + (placementPreview?.y ?? region.labelPlacement.offsetY)}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                  title={`${region.title} · 覆盖 ${metrics.areaPercent}%`}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (ignoreNextStageClickRef.current) {
                      ignoreNextStageClickRef.current = false;
                      return;
                    }
                    if (canvasTool === "measure") addMeasurementPoint(metrics.centroid);
                    else selectRegion(region.id, false, event.ctrlKey || event.metaKey || event.shiftKey);
                  }}
                  onKeyDown={(event) => handleMapLabelKeyDown(
                    event,
                    "region",
                    region.id,
                    region.labelPlacement
                  )}
                  onPointerCancel={(event) => finishMapLabelDrag(event, false)}
                  onPointerDown={(event) => handleMapLabelPointerDown(
                    event,
                    "region",
                    region.id,
                    region.labelPlacement
                  )}
                  onPointerMove={handleMapLabelPointerMove}
                  onPointerUp={(event) => finishMapLabelDrag(event, true)}
                >
                  <Pentagon size={14} style={{ color: region.color }} />
                  <span>{region.title}</span>
                  {region.labelPlacement.locked ? <Lock aria-hidden="true" size={11} /> : null}
                </button>
              );
            })}
          {mode === "regions" && editingRegionId === selectedRegion?.id && selectedRegion.visible && !selectedRegion.locked && canvasTool === "pan"
            ? selectedRegionPoints.map((point, index) => {
                const next = selectedRegionPoints[(index + 1) % selectedRegionPoints.length];
                const midpoint = { x: (point.x + next.x) / 2, y: (point.y + next.y) / 2 };
                return (
                  <button
                    aria-label={`在区域边 ${index + 1} 添加顶点`}
                    className="map-region-midpoint"
                    data-map-interactive="true"
                    key={`midpoint:${selectedRegion.id}:${index}`}
                    style={{
                      color: selectedRegion.color,
                      left: `${midpoint.x}%`,
                      top: `${midpoint.y}%`,
                      transform: "translate(-50%, -50%)"
                    }}
                    title="添加顶点"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      insertRegionPoint(selectedRegion, index, prepareMapPoint(midpoint));
                    }}
                  />
                );
              })
            : null}
          {mode === "regions" && editingRegionId === selectedRegion?.id && selectedRegion.visible && !selectedRegion.locked && canvasTool === "pan"
            ? selectedRegionPoints.map((point, index) => (
                <button
                  aria-label={`区域顶点 ${index + 1}`}
                  className="map-region-vertex"
                  data-map-interactive="true"
                  key={`vertex:${selectedRegion.id}:${index}`}
                  style={{
                    color: selectedRegion.color,
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                  title={selectedRegion.points.length > 3 ? "拖动顶点，双击移除" : "拖动顶点"}
                  type="button"
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    removeRegionPoint(selectedRegion, index);
                  }}
                  onPointerCancel={(event) => finishRegionVertexDrag(event, false)}
                  onPointerDown={(event) => handleRegionVertexPointerDown(event, selectedRegion, index)}
                  onPointerMove={handleRegionVertexPointerMove}
                  onPointerUp={(event) => finishRegionVertexDrag(event, true)}
                />
              ))
            : null}
          {canvasTool === "region"
            ? regionDraft.map((point, index) => (
                <i
                  aria-hidden="true"
                  className="map-region-draft-vertex"
                  key={`draft:${index}`}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                />
              ))
            : null}
          {renderedActiveMarkers.map((marker) => {
            if (clusteredMarkers.ids.has(marker.id)) return null;
            const Icon = markerKindMeta[marker.markerType].icon;
            const editable = isMapMarkerEditable(marker, activeLayers, activeGroups);
            const preview = dragPreviews[marker.id] ?? marker;
            const labelVisible = visibleLabelIds.has(marker.id);
            const labelPlacementPreview = labelPlacementPreviews[
              mapLabelPreviewKey("marker", marker.id)
            ];
            const labelX = preview.x + (
              labelPlacementPreview?.x ?? marker.labelPlacement.offsetX
            );
            const labelY = preview.y + (
              labelPlacementPreview?.y ?? marker.labelPlacement.offsetY
            );
            const linkedChildMaps = directChildMaps.filter(
              (mapItem) => mapItem.entryMarkerId === marker.id
            );
            const markerTitle = canvasTool === "route"
              ? `${marker.label} · 点击加入路线`
              : canvasTool === "measure"
                ? `${marker.label} · 设为测距点`
                : linkedChildMaps.length === 1
                  ? `${marker.label} · 双击进入“${linkedChildMaps[0].title}”`
                  : linkedChildMaps.length > 1
                    ? `${marker.label} · 关联 ${linkedChildMaps.length} 张子地图`
                    : editable
                      ? `${marker.label} · 拖动调整位置`
                      : `${marker.label} · 所在图层或分组已锁定`;
            return (
              <Fragment key={marker.id}>
                <button
                  aria-label={`地图标记 ${marker.label}`}
                  aria-pressed={selectedMarkerSet.has(marker.id)}
                  className={`planning-map-marker ${selectedMarkerSet.has(marker.id) ? "is-active" : ""} ${marker.id === selectedMarker?.id ? "is-primary" : ""} ${editable ? "" : "is-locked"} ${labelVisible ? "" : "is-label-hidden"} ${dragPreviews[marker.id] ? "is-dragging" : ""} ${linkedChildMaps.length ? "is-map-entry" : ""} ${canvasTool === "route" ? "is-route-target" : ""} ${canvasTool === "measure" ? "is-measure-target" : ""}`}
                  data-map-interactive="true"
                  style={{
                    background: marker.color,
                    left: `${preview.x}%`,
                    top: `${preview.y}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                  title={markerTitle}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (ignoreNextStageClickRef.current) {
                      ignoreNextStageClickRef.current = false;
                      return;
                    }
                    if (canvasTool === "route") appendMarkerToRoute(marker);
                    else if (event.detail === 0) {
                      selectMarker(marker.id, event.ctrlKey || event.metaKey || event.shiftKey);
                    }
                  }}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    if (canvasTool === "pan" && linkedChildMaps.length === 1) {
                      selectMap(linkedChildMaps[0].id);
                    }
                  }}
                  onContextMenu={(event) => openMapContextMenu(event, marker)}
                  onKeyDown={(event) => handleMarkerKeyDown(event, marker, editable)}
                  onPointerCancel={(event) => finishMarkerDrag(event, false)}
                  onPointerDown={(event) => handleMarkerPointerDown(event, marker, editable)}
                  onPointerMove={handleMarkerPointerMove}
                  onPointerUp={(event) => finishMarkerDrag(event, true)}
                >
                  {marker.iconUrl
                    ? <img alt="" className="planning-map-marker-icon" src={marker.iconUrl} />
                    : <Icon size={16} />}
                  <span className="planning-map-marker-name">{marker.label}</span>
                </button>
                {labelVisible ? (
                  <button
                    aria-label={`地图标记标签 ${marker.label}`}
                    aria-pressed={selectedMarkerSet.has(marker.id)}
                    className={`map-marker-label ${selectedMarkerSet.has(marker.id) ? "is-active" : ""} ${marker.labelPlacement.locked ? "is-locked" : ""} ${labelPlacementPreview ? "is-dragging" : ""}`}
                    data-map-interactive="true"
                    style={{
                      borderColor: marker.color,
                      left: `${labelX}%`,
                      top: `${labelY}%`,
                      transform: "translate(-50%, calc(-100% - 19px))"
                    }}
                    title={marker.labelPlacement.locked ? `${marker.label} · 标签已锁定` : `${marker.label} · 拖动标签调整位置`}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (ignoreNextStageClickRef.current) {
                        ignoreNextStageClickRef.current = false;
                        return;
                      }
                      if (canvasTool === "route") appendMarkerToRoute(marker);
                      else if (canvasTool === "measure") addMeasurementPoint(preview);
                      else selectMarker(marker.id, event.ctrlKey || event.metaKey || event.shiftKey);
                    }}
                    onContextMenu={(event) => openMapContextMenu(event, marker)}
                    onKeyDown={(event) => handleMapLabelKeyDown(
                      event,
                      "marker",
                      marker.id,
                      marker.labelPlacement,
                      editable
                    )}
                    onPointerCancel={(event) => finishMapLabelDrag(event, false)}
                    onPointerDown={(event) => handleMapLabelPointerDown(
                      event,
                      "marker",
                      marker.id,
                      marker.labelPlacement,
                      editable
                    )}
                    onPointerMove={handleMapLabelPointerMove}
                    onPointerUp={(event) => finishMapLabelDrag(event, true)}
                  >
                    <span>{marker.label}</span>
                    {marker.labelPlacement.locked ? <Lock aria-hidden="true" size={11} /> : null}
                  </button>
                ) : null}
              </Fragment>
            );
          })}
          {canvasTool === "route" && selectedRoute
            ? selectedRoute.stops.map((stop, index) => {
                const marker = markerMap.get(stop.markerId);
                if (!marker) return null;
                const preview = dragPreviews[marker.id] ?? marker;
                return (
                  <button
                    aria-label={`移除路线停靠点 ${index + 1} ${marker.label}`}
                    className="map-route-stop-node"
                    data-map-interactive="true"
                    key={stop.id}
                    style={{
                      left: `${preview.x}%`,
                      top: `${preview.y}%`,
                      transform: "translate(-50%, -46px)"
                    }}
                    title={`停靠点 ${index + 1} · 点击移除`}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onUpdateRoute(selectedRoute.id, {
                        stops: selectedRoute.stops.filter((item) => item.id !== stop.id)
                      });
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })
            : null}
          {mode === "routes" && selectedRoute && !phaseVisibility.routes.has(selectedRoute.id)
            ? selectedRoute.waypoints.map((waypoint, index) => {
                const preview = routeWaypointPreviews[waypoint.id] ?? waypoint;
                return (
                  <button
                    aria-label={`路线控制点 ${index + 1}`}
                    className={`map-route-waypoint ${routeWaypointPreviews[waypoint.id] ? "is-dragging" : ""}`}
                    data-map-interactive="true"
                    key={waypoint.id}
                    style={{
                      color: selectedRoute.color,
                      left: `${preview.x}%`,
                      top: `${preview.y}%`,
                      transform: "translate(-50%, -50%)"
                    }}
                    title="拖动调整曲线，双击删除"
                    type="button"
                    onDoubleClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      removeRouteWaypoint(waypoint.id);
                    }}
                    onKeyDown={(event) => handleRouteWaypointKeyDown(event, waypoint)}
                    onPointerCancel={(event) => finishRouteWaypointDrag(event, false)}
                    onPointerDown={(event) => handleRouteWaypointPointerDown(event, waypoint)}
                    onPointerMove={handleRouteWaypointPointerMove}
                    onPointerUp={(event) => finishRouteWaypointDrag(event, true)}
                  >
                    <span />
                  </button>
                );
              })
            : null}
          {clusteredMarkers.clusters.map((cluster) => (
            <button
              aria-label={`展开 ${cluster.ids.length} 个密集标记`}
              className="map-marker-cluster"
              data-map-interactive="true"
              key={cluster.ids.join(":")}
              style={{
                left: `${cluster.x}%`,
                top: `${cluster.y}%`,
                transform: "translate(-50%, -50%)"
              }}
              title={`展开 ${cluster.ids.length} 个密集标记`}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (canvasTool === "measure") addMeasurementPoint(cluster);
                else centerMapPoint(cluster.x, cluster.y, Math.max(0.9, zoomRef.current * 1.8));
              }}
            >
              <MapPin size={16} />
              <span>{cluster.ids.length}</span>
            </button>
          ))}
            </div>

            {isImageDropActive ? (
              <div aria-live="polite" className="map-image-drop-overlay">
                <ImageIcon size={28} />
                <strong>设为地图底图</strong>
              </div>
            ) : !activeMap.imageUrl ? (
              <button
                className="map-image-empty-action"
                data-map-interactive="true"
                title="添加地图底图"
                type="button"
                onClick={openMapImagePicker}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <ImageIcon size={18} />
                <span>添加地图底图</span>
              </button>
            ) : null}

            {scaleBar && !placing ? (
              <div className="map-scale-bar" aria-label={`地图比例尺 ${formatMapDistance(scaleBar.distance, activeMap)}`}>
                <strong>{formatMapDistance(scaleBar.distance, activeMap)}</strong>
                <span style={{ width: scaleBar.pixels }}><i /></span>
              </div>
            ) : null}

            {placing ? <div className="map-placement-status"><Flag size={16} />放置标记</div> : null}

            {marquee ? (
              <span
                aria-hidden="true"
                className="map-selection-marquee"
                style={{
                  height: Math.abs(marquee.currentY - marquee.startY),
                  left: Math.min(marquee.startX, marquee.currentX),
                  top: Math.min(marquee.startY, marquee.currentY),
                  width: Math.abs(marquee.currentX - marquee.startX)
                }}
              />
            ) : null}

            {selectedMarkerIds.length > 1 && canvasTool !== "route" ? (
              <div className="map-batch-bar" data-map-interactive="true">
                <div>
                  <strong>已选 {selectedMarkerIds.length}</strong>
                  <small>{selectedEditableMarkers.length} 个可编辑</small>
                </div>
                <select
                  aria-label="批量设置标记图层"
                  defaultValue=""
                  disabled={!selectedEditableMarkers.length}
                  onChange={(event) => {
                    if (event.target.value) batchUpdateSelected({ layerId: event.target.value });
                    event.target.value = "";
                  }}
                >
                  <option disabled value="">移动到图层</option>
                  {activeLayers.map((layer) => <option key={layer.id} value={layer.id}>{layer.title}</option>)}
                </select>
                <select
                  aria-label="批量设置标记分组"
                  defaultValue=""
                  disabled={!selectedEditableMarkers.length}
                  onChange={(event) => {
                    if (event.target.value) {
                      batchUpdateSelected({ groupId: event.target.value === "__none" ? "" : event.target.value });
                    }
                    event.target.value = "";
                  }}
                >
                  <option disabled value="">设置标记组</option>
                  <option value="__none">不分组</option>
                  {activeGroups.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}
                </select>
                <button aria-label="清除多选" title="清除多选" type="button" onClick={() => applyMarkerSelection([])}>
                  <X size={16} />
                </button>
              </div>
            ) : null}

            {mode === "regions" && selectedRegionIds.length > 1 && canvasTool === "pan" ? (
              <div className="map-batch-bar map-region-batch-bar" data-map-interactive="true">
                <div>
                  <strong>已选 {selectedRegionIds.length}</strong>
                  <small>{selectedRegionIds.filter((id) => visibleActiveRegions.some((region) => region.id === id)).length} 个可见</small>
                </div>
                <button
                  aria-label={selectedRegionIds.every((id) => activeRegions.find((region) => region.id === id)?.locked) ? "解锁所选区域" : "锁定所选区域"}
                  title={selectedRegionIds.every((id) => activeRegions.find((region) => region.id === id)?.locked) ? "解锁所选区域" : "锁定所选区域"}
                  type="button"
                  onClick={() => batchUpdateSelectedRegions({ locked: !selectedRegionIds.every((id) => activeRegions.find((region) => region.id === id)?.locked) })}
                >
                  {selectedRegionIds.every((id) => activeRegions.find((region) => region.id === id)?.locked) ? <Unlock size={16} /> : <Lock size={16} />}
                </button>
                <button
                  aria-label={selectedRegionIds.every((id) => activeRegions.find((region) => region.id === id)?.visible) ? "隐藏所选区域" : "显示所选区域"}
                  title={selectedRegionIds.every((id) => activeRegions.find((region) => region.id === id)?.visible) ? "隐藏所选区域" : "显示所选区域"}
                  type="button"
                  onClick={() => batchUpdateSelectedRegions({ visible: !selectedRegionIds.every((id) => activeRegions.find((region) => region.id === id)?.visible) })}
                >
                  {selectedRegionIds.every((id) => activeRegions.find((region) => region.id === id)?.visible) ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  aria-label={regionIsolationEnabled ? "显示全部区域" : "仅看所选区域"}
                  aria-pressed={regionIsolationEnabled}
                  className={regionIsolationEnabled ? "is-active" : ""}
                  title={regionIsolationEnabled ? "显示全部区域" : "仅看所选区域"}
                  type="button"
                  onClick={() => setRegionIsolationEnabled((current) => !current)}
                >
                  <Scan size={16} />
                </button>
                <button aria-label="删除所选区域" title="删除所选区域" type="button" onClick={deleteSelectedRegions}>
                  <Trash2 size={16} />
                </button>
                <button aria-label="清除区域多选" title="清除区域多选" type="button" onClick={() => applyRegionSelection([])}>
                  <X size={16} />
                </button>
              </div>
            ) : null}

            {canvasTool === "route" ? (
              <div className="map-route-drawing-bar" data-map-interactive="true">
                <PenTool size={16} />
                <div>
                  <strong>{selectedRoute?.title ?? "正在创建路线"}</strong>
                  <small>点击标记追加停靠点，点击序号移除</small>
                </div>
                <button
                  aria-label="撤回最后一个停靠点"
                  disabled={!selectedRoute?.stops.length}
                  title="撤回最后一个停靠点"
                  type="button"
                  onClick={() => selectedRoute && onUpdateRoute(selectedRoute.id, { stops: selectedRoute.stops.slice(0, -1) })}
                >
                  <Undo2 size={16} />
                </button>
                <button aria-label="完成路线绘制" title="完成路线绘制" type="button" onClick={() => setCanvasTool("pan")}>
                  <Check size={16} />
                </button>
              </div>
            ) : null}

            {canvasTool === "measure" ? (
              <div className="map-measurement-bar" data-map-interactive="true">
                <Ruler size={16} />
                <div>
                  <strong>{measurement ? formatMapDistance(measurementDistance, activeMap) : "地图测距"}</strong>
                  <small>{measurement ? measurement.complete ? "测距已完成" : "等待终点" : "等待起点"}</small>
                </div>
                <button
                  aria-label="清除测距"
                  disabled={!measurement}
                  title="清除测距"
                  type="button"
                  onClick={() => setMeasurement(null)}
                >
                  <X size={16} />
                </button>
                <button aria-label="完成地图测距" title="完成地图测距" type="button" onClick={() => setCanvasTool("pan")}>
                  <Check size={16} />
                </button>
              </div>
            ) : null}

            {canvasTool === "region" ? (
              <div className="map-region-drawing-bar" data-map-interactive="true">
                <Pentagon size={16} />
                <div>
                  <strong>{regionHoleTargetId ? "绘制区域镂空" : "绘制新区域"}</strong>
                  <small className={regionDrawingError ? "is-error" : ""}>
                    {regionDrawingError || `${regionDraft.length} 个顶点 · 单击添加，双击或 Enter 完成`}
                  </small>
                </div>
                <button
                  aria-label="撤回最后一个区域顶点"
                  disabled={!regionDraft.length}
                  title="撤回最后一个区域顶点"
                  type="button"
                  onClick={() => setRegionDraft((current) => current.slice(0, -1))}
                >
                  <Undo2 size={16} />
                </button>
                <button
                  aria-label="完成区域绘制"
                  disabled={regionDraft.length < 3}
                  title="完成区域绘制"
                  type="button"
                  onClick={finishRegionDrawing}
                >
                  <Check size={16} />
                </button>
                <button aria-label="取消区域绘制" title="取消区域绘制" type="button" onClick={cancelRegionDrawing}>
                  <X size={16} />
                </button>
              </div>
            ) : null}

            {contextMenu ? (
              <>
                <div
                  aria-hidden="true"
                  className="map-context-backdrop"
                  data-map-interactive="true"
                  onPointerDown={() => setContextMenu(null)}
                />
                <div
                  aria-label={contextMarker ? `${contextMarker.label} 快捷操作` : "地图快捷操作"}
                  className="map-context-menu"
                  data-map-interactive="true"
                  ref={contextMenuRef}
                  role="menu"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                  onKeyDown={handleContextMenuKeyDown}
                >
                  <header>
                    <strong>{contextMarker?.label ?? "地图位置"}</strong>
                    <small>{contextMarker ? markerKindMeta[contextMarker.markerType].label : `${contextMenu.mapX.toFixed(1)}%, ${contextMenu.mapY.toFixed(1)}%`}</small>
                  </header>
                  {contextMarker ? (
                    <>
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          selectMarker(contextMarker.id, selectedMarkerIds.length > 0);
                          setContextMenu(null);
                        }}
                      >
                        <BoxSelect size={16} />
                        <span>{selectedMarkerSet.has(contextMarker.id) ? "从多选中移除" : selectedMarkerIds.length ? "加入当前多选" : "选择此标记"}</span>
                      </button>
                      {selectedRoute ? (
                        <button
                          role="menuitem"
                          type="button"
                          onClick={() => {
                            if (contextMarkerIsRouteStop) removeMarkerFromRoute(contextMarker.id);
                            else appendMarkerToRoute(contextMarker);
                            setContextMenu(null);
                          }}
                        >
                          <GitBranch size={16} />
                          <span>{contextMarkerIsRouteStop ? "从当前路线移除" : "加入当前路线"}</span>
                        </button>
                      ) : null}
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => createRouteForDrawing(contextMarker)}
                      >
                        <PenTool size={16} />
                        <span>从这里新建路线</span>
                      </button>
                      <button role="menuitem" type="button" onClick={() => startMeasurement(contextMarker)}>
                        <Ruler size={16} />
                        <span>从这里开始测距</span>
                      </button>
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          centerMapPoint(contextMarker.x, contextMarker.y);
                          setContextMenu(null);
                        }}
                      >
                        <LocateFixed size={16} />
                        <span>定位到此标记</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button disabled={!placementLayer} role="menuitem" type="button" onClick={() => createMarkerFromContext(false)}>
                        <MapPin size={16} />
                        <span>在此创建标记</span>
                      </button>
                      <button disabled={!placementLayer} role="menuitem" type="button" onClick={() => createMarkerFromContext(true)}>
                        <PenTool size={16} />
                        <span>创建标记并开始路线</span>
                      </button>
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => startRegionDrawing({ x: contextMenu.mapX, y: contextMenu.mapY })}
                      >
                        <Pentagon size={16} />
                        <span>从这里绘制区域</span>
                      </button>
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => startMeasurement({ x: contextMenu.mapX, y: contextMenu.mapY })}
                      >
                        <Ruler size={16} />
                        <span>从这里开始测距</span>
                      </button>
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          centerMapPoint(contextMenu.mapX, contextMenu.mapY);
                          setContextMenu(null);
                        }}
                      >
                        <LocateFixed size={16} />
                        <span>定位到这里</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : null}

            <button
              aria-label="地图缩略导航"
              className="map-minimap"
              data-map-interactive="true"
              style={{ aspectRatio: `${activeMap.width} / ${activeMap.height}` }}
              title="点击缩略图定位地图"
              type="button"
              onClick={handleMinimapClick}
            >
              {activeMap.imageUrl ? (
                <img
                  alt=""
                  draggable={false}
                  src={activeMap.imageUrl}
                  style={getMapImageTransformStyle(activeMap.imageTransform)}
                />
              ) : <span className="map-minimap-generated" />}
              {activeLayers
                .filter(
                  (layer) => layer.visible
                    && layer.imageUrl
                    && !phaseVisibility.layers.has(layer.id)
                )
                .map((layer) => (
                  <img
                    alt=""
                    aria-hidden="true"
                    className="map-minimap-layer-image"
                    draggable={false}
                    key={layer.id}
                    src={layer.imageUrl}
                    style={{
                      ...getMapImageTransformStyle(layer.imageTransform),
                      mixBlendMode: layer.imageBlendMode,
                      opacity: layer.imageOpacity
                    }}
                  />
                ))}
              <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
                {visibleActiveRegions
                  .filter((region) => region.points.length >= 3)
                  .map((region) => (
                    <polygon
                      key={region.id}
                      points={region.points.map((point) => `${point.x},${point.y}`).join(" ")}
                      stroke={region.color}
                      style={{ fill: region.color, fillOpacity: Math.min(0.48, region.opacity + 0.1) }}
                    />
                  ))}
                {visibleActiveRoutes.map((route) => {
                  const points = route.stops
                    .map((stop) => markerMap.get(stop.markerId))
                    .filter((marker): marker is MapMarker => Boolean(marker))
                    .map((marker) => `${marker.x},${marker.y}`)
                    .join(" ");
                  return points ? <polyline key={route.id} points={points} stroke={route.color} /> : null;
                })}
              </svg>
              {visibleActiveMarkers.map((marker) => (
                <i
                  aria-hidden="true"
                  key={marker.id}
                  style={{ background: marker.color, left: `${marker.x}%`, top: `${marker.y}%` }}
                />
              ))}
              <span
                aria-hidden="true"
                className="map-minimap-viewport"
                style={{
                  height: `${minimapViewportHeight}%`,
                  left: `${minimapViewportLeft}%`,
                  top: `${minimapViewportTop}%`,
                  width: `${minimapViewportWidth}%`
                }}
              />
            </button>
          </div>
        </div>

        {!inspectorCollapsed ? <aside
          className={`panel planning-inspector ${isFullscreen && fullscreenDockTab === "layers" ? "is-layer-dock" : ""}`}
          ref={inspectorRef}
          data-reference-path={selectedRegion ? `regions.${selectedRegion.id}.references` : selectedMarker ? "references" : selectedRoute ? "stops" : undefined}
          data-reference-source-id={selectedRegion ? activeMap.id : selectedMarker?.id ?? selectedRoute?.id}
          data-reference-source-kind={
            selectedRegion ? "map" : selectedMarker ? "map-marker" : selectedRoute ? "map-route" : undefined
          }
        >
          {isFullscreen ? (
            <div aria-label="地图右侧面板" className="map-inspector-dock-tabs" role="tablist">
              <button
                aria-selected={fullscreenDockTab === "properties"}
                className={fullscreenDockTab === "properties" ? "is-active" : ""}
                role="tab"
                type="button"
                onClick={() => setFullscreenDockTab("properties")}
              >
                <SlidersHorizontal size={15} /><span>属性</span>
              </button>
              <button
                aria-selected={fullscreenDockTab === "layers"}
                className={fullscreenDockTab === "layers" ? "is-active" : ""}
                role="tab"
                type="button"
                onClick={() => setFullscreenDockTab("layers")}
              >
                <Layers3 size={15} /><span>图层 {activeLayers.length}</span>
              </button>
            </div>
          ) : null}
          {isFullscreen && fullscreenDockTab === "layers" ? (
            <MapLayerPalette
              activeLayerId={paletteLayer?.id ?? ""}
              hiddenLayerIds={phaseVisibility.layers}
              layerMarkerCounts={layerMarkerCounts}
              layers={activeLayers}
              map={activeMap}
              selectedLayerIds={selectedImageLayerIds}
              transformingLayerId={isImageTransformMode ? transformingLayerImageId : ""}
              onAddImageLayer={openNewMapLayerImagePicker}
              onArrangeSelection={arrangeSelectedImageLayers}
              onCreateLayer={() => void createLayer(false)}
              onDeleteLayer={(layerId) => void onDeleteLayer(layerId)}
              onDuplicateLayer={duplicatePaletteLayer}
              onEditProperties={() => setFullscreenDockTab("properties")}
              onGroupSelection={groupSelectedImageLayers}
              onMergeLayer={onMergeLayers}
              onOpenMapSettings={() => {
                setActivePaletteLayerId("__base-map__");
                openMapSettings();
              }}
              onReorderLayers={(orderedLayerIds) => onReorderLayers(activeMap.id, orderedLayerIds)}
              onSelectLayer={selectPaletteLayer}
              onToggleTransform={toggleLayerImageTransformMode}
              onUngroupSelection={ungroupSelectedImageLayers}
              onUpdateLayer={onUpdateLayer}
            />
          ) : mode === "layers" && selectedGroup ? (
            <MapStructureInspector
              canDelete
              item={selectedGroup}
              kind="group"
              markerCount={activeMarkers.filter((marker) => marker.groupId === selectedGroup.id).length}
              phase={activeStoryPhase}
              phaseVisible={!phaseVisibility.groups.has(selectedGroup.id)}
              onDelete={() => onDeleteMarkerGroup(selectedGroup.id)}
              onPhaseVisibleChange={(visible) => setPhaseItemVisibility("hiddenGroupIds", selectedGroup.id, visible)}
              onUpdate={(patch) => onUpdateMarkerGroup(selectedGroup.id, patch)}
            />
          ) : mode === "layers" && selectedLayer ? (
            <MapStructureInspector
              canDelete={activeLayers.length > 1 && selectedLayer.id !== `map-layer-default:${activeMap.id}`}
              item={selectedLayer}
              imageTransformMode={isImageTransformMode && transformingLayerImageId === selectedLayer.id}
              kind="layer"
              markerCount={activeMarkers.filter((marker) => marker.layerId === selectedLayer.id).length}
              phase={activeStoryPhase}
              phaseVisible={!phaseVisibility.layers.has(selectedLayer.id)}
              onDelete={() => onDeleteLayer(selectedLayer.id)}
              onChooseImage={() => openMapLayerImagePicker(selectedLayer.id)}
              onPhaseVisibleChange={(visible) => setPhaseItemVisibility("hiddenLayerIds", selectedLayer.id, visible)}
              onRemoveImage={() => {
                if (transformingLayerImageSet.has(selectedLayer.id)) stopImageTransformMode();
                setSelectedImageLayerIds((current) => current.filter((id) => id !== selectedLayer.id));
                onUpdateLayer(selectedLayer.id, {
                  imageUrl: "",
                  imageTransform: createMapImageTransform(),
                  imageGroupId: ""
                });
              }}
              onToggleImageTransform={() => toggleLayerImageTransformMode(selectedLayer.id)}
              onUpdate={(patch) => onUpdateLayer(selectedLayer.id, patch)}
            />
          ) : mode === "regions" && selectedRegion ? (
            <RegionInspector
              boundaryEditing={editingRegionId === selectedRegion.id}
              canMoveDown={selectedRegionOrderIndex >= 0 && selectedRegionOrderIndex < activeRegions.length - 1}
              canMoveUp={selectedRegionOrderIndex > 0}
              map={activeMap}
              phase={activeStoryPhase}
              phaseVisible={!phaseVisibility.regions.has(selectedRegion.id)}
              region={selectedRegion}
              referenceOptions={referenceOptions}
              onDelete={() => deleteRegion(selectedRegion.id)}
              onBoundaryEditingChange={(editing) => setEditingRegionId(editing ? selectedRegion.id : "")}
              onMove={moveRegion}
              onOpenReference={onOpenReference}
              onPhaseVisibleChange={(visible) => setPhaseItemVisibility("hiddenRegionIds", selectedRegion.id, visible)}
              onStartHole={() => startRegionHoleDrawing(selectedRegion)}
              onUpdate={(patch) => updateRegion(selectedRegion.id, patch)}
            />
          ) : selectedMarker ? (
            <MarkerInspector
              creatableReferenceKinds={creatableReferenceKinds}
              editable={isMapMarkerEditable(selectedMarker, activeLayers, activeGroups)}
              groups={activeGroups}
              layers={activeLayers}
              linkedMaps={directChildMaps.filter(
                (mapItem) => mapItem.entryMarkerId === selectedMarker.id
              )}
              marker={selectedMarker}
              phase={activeStoryPhase}
              phaseVisible={!phaseVisibility.markers.has(selectedMarker.id)}
              referenceOptions={referenceOptions}
              relatedEvents={markerTimelineEvents}
              onDelete={() => onDeleteMarker(selectedMarker.id)}
              onCreateChildMap={() => onCreateMap(activeMap.id, selectedMarker.id)}
              onChooseIcon={() => openMarkerIconPicker(selectedMarker.id)}
              onOpenReference={onOpenReference}
              onCreateReference={(kind) =>
                onCreateReference({ kind: "map-marker", id: selectedMarker.id }, kind)
              }
              onOpenTimeline={onOpenTimeline}
              onRemoveIcon={() => onUpdateMarker(selectedMarker.id, { iconUrl: "" })}
              onPhaseVisibleChange={(visible) => setPhaseItemVisibility("hiddenMarkerIds", selectedMarker.id, visible)}
              onSelectMap={selectMap}
              onUpdate={(patch) => onUpdateMarker(selectedMarker.id, patch)}
            />
          ) : selectedRoute ? (
            <RouteInspector
              creatableReferenceKinds={creatableReferenceKinds}
              map={activeMap}
              markers={activeMarkers}
              nextStopMarkerId={nextStopMarkerId}
              phase={activeStoryPhase}
              phaseVisible={!phaseVisibility.routes.has(selectedRoute.id)}
              referenceOptions={referenceOptions}
              route={selectedRoute}
              onAddStop={addRouteStop}
              onAddWaypoint={addRouteWaypoint}
              onDelete={() => onDeleteRoute(selectedRoute.id)}
              onCreateReference={(kind) =>
                onCreateReference({ kind: "map-route", id: selectedRoute.id }, kind)
              }
              onMoveStop={(stopId, direction) => {
                const nextRoute = moveMapRouteStop(selectedRoute, stopId, direction);
                onUpdateRoute(selectedRoute.id, { stops: nextRoute.stops });
              }}
              onNextStopChange={setNextStopMarkerId}
              onOpenReference={onOpenReference}
              onPhaseVisibleChange={(visible) => setPhaseItemVisibility("hiddenRouteIds", selectedRoute.id, visible)}
              onRemoveStop={(stopId) => onUpdateRoute(selectedRoute.id, { stops: selectedRoute.stops.filter((stop) => stop.id !== stopId) })}
              onUpdate={(patch) => onUpdateRoute(selectedRoute.id, patch)}
              onUpdateStop={updateRouteStop}
            />
          ) : (
            <MapInspector
              canDelete={maps.length > 1}
              childMaps={directChildMaps}
              hierarchyEntries={hierarchyEntries.filter(
                (entry) => entry.map.id !== activeMap.id && !activeMapDescendantIds.has(entry.map.id)
              )}
              imageTransformMode={isMapImageTransformMode}
              map={activeMap}
              markers={markers}
              phase={activeStoryPhase}
              phaseTimelineEvents={timelineEvents}
              onDelete={() => onDeleteMap(activeMap.id)}
              onDeletePhase={deleteStoryPhase}
              onChooseImage={openMapImagePicker}
              onRemoveImage={() => {
                stopImageTransformMode();
                onUpdateMap(activeMap.id, {
                  imageUrl: "",
                  imageTransform: createMapImageTransform()
                });
              }}
              onSelectMap={selectMap}
              onToggleImageTransform={toggleImageTransformMode}
              onUpdate={(patch) => onUpdateMap(activeMap.id, patch)}
              onUpdatePhase={(patch) => activeStoryPhase && updateStoryPhase(activeStoryPhase.id, patch)}
            />
          )}
        </aside> : null}
      </section>
      {reviewDialogOpen ? (
        <div
          className="map-review-backdrop"
          role="presentation"
          onMouseDown={() => {
            if (aiReviewStatus.kind !== "working" && versionStatus.kind !== "working") {
              setReviewDialogOpen(false);
            }
          }}
        >
          <section
            ref={reviewDialogRef}
            aria-label={`地图审阅中心 ${activeMap.title}`}
            aria-modal="true"
            className="map-review-dialog"
            role="dialog"
            tabIndex={-1}
            onKeyDown={handleMapReviewDialogKeyDown}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="map-review-dialog-header">
              <div className="map-review-dialog-title">
                <span><Sparkles size={19} /></span>
                <div>
                  <strong>地图审阅中心</strong>
                  <small>{activeMap.title}</small>
                </div>
              </div>
              <button
                aria-label="关闭地图审阅中心"
                disabled={aiReviewStatus.kind === "working" || versionStatus.kind === "working"}
                title="关闭"
                type="button"
                onClick={() => setReviewDialogOpen(false)}
              >
                <X size={18} />
              </button>
            </header>

            <nav aria-label="地图审阅视图" className="map-review-tabs" role="tablist">
              <button
                aria-selected={reviewTab === "intelligence"}
                className={reviewTab === "intelligence" ? "is-active" : ""}
                role="tab"
                type="button"
                onClick={() => setReviewTab("intelligence")}
              >
                <ShieldCheck size={16} />
                <span>智能检查</span>
                <small>{localMapFindings.length + aiSuggestions.length}</small>
              </button>
              <button
                aria-selected={reviewTab === "versions"}
                className={reviewTab === "versions" ? "is-active" : ""}
                role="tab"
                type="button"
                onClick={() => {
                  setReviewTab("versions");
                  if (versionStatus.kind === "idle") void refreshMapVersions();
                }}
              >
                <History size={16} />
                <span>版本对比</span>
                <small>{mapVersions.length}</small>
              </button>
            </nav>

            {reviewTab === "intelligence" ? (
              <div className="map-review-body map-review-intelligence">
                <section className="map-review-summary" aria-label="本地检查摘要">
                  <div className="is-error">
                    <AlertTriangle size={17} />
                    <span>错误</span>
                    <strong>{localMapFindings.filter((finding) => finding.severity === "error").length}</strong>
                  </div>
                  <div className="is-warning">
                    <AlertTriangle size={17} />
                    <span>提醒</span>
                    <strong>{localMapFindings.filter((finding) => finding.severity === "warning").length}</strong>
                  </div>
                  <div className="is-info">
                    <Info size={17} />
                    <span>建议</span>
                    <strong>{localMapFindings.filter((finding) => finding.severity === "info").length}</strong>
                  </div>
                  <button
                    className="map-ai-review-run"
                    disabled={aiReviewStatus.kind === "working"}
                    type="button"
                    onClick={() => void runMapAiReview()}
                  >
                    {aiReviewStatus.kind === "working"
                      ? <LoaderCircle className="is-spinning" size={17} />
                      : <Sparkles size={17} />}
                    <span>{aiReviewStatus.kind === "working" ? "正在审阅" : "AI 深度审阅"}</span>
                  </button>
                </section>

                {aiReviewStatus.message ? (
                  <output
                    aria-live="polite"
                    className={`map-review-status is-${aiReviewStatus.kind}`}
                  >
                    {aiReviewStatus.message}
                  </output>
                ) : null}

                <div className="map-review-finding-columns">
                  <section className="map-review-finding-section">
                    <header>
                      <div>
                        <ShieldCheck size={17} />
                        <strong>结构检查</strong>
                      </div>
                      <span>{localMapFindings.length}</span>
                    </header>
                    <div className="map-review-finding-list">
                      {localMapFindings.map((finding) => (
                        <article className={`map-review-finding is-${finding.severity}`} key={finding.id}>
                          <span className="map-review-severity-icon">
                            {finding.severity === "error"
                              ? <AlertTriangle size={16} />
                              : finding.severity === "warning"
                                ? <AlertTriangle size={16} />
                                : <Info size={16} />}
                          </span>
                          <div>
                            <header>
                              <strong>{finding.title}</strong>
                              <small>{getMapReviewTargetLabel(finding)}</small>
                            </header>
                            <p>{finding.detail}</p>
                            <footer>
                              <button type="button" onClick={() => locateMapReviewTarget(finding)}>
                                <LocateFixed size={14} />
                                <span>定位</span>
                              </button>
                            </footer>
                          </div>
                        </article>
                      ))}
                      {!localMapFindings.length ? (
                        <div className="map-review-empty">
                          <ShieldCheck size={26} />
                          <strong>未发现结构问题</strong>
                        </div>
                      ) : null}
                    </div>
                  </section>

                  <section className="map-review-finding-section is-ai">
                    <header>
                      <div>
                        <Sparkles size={17} />
                        <strong>AI 建议</strong>
                      </div>
                      <span>{aiSuggestions.length}</span>
                    </header>
                    <div className="map-review-finding-list">
                      {aiSuggestions.map((suggestion) => {
                        const safePatch = getSafeMapAiPatch(suggestion);
                        return (
                          <article className={`map-review-finding is-${suggestion.severity}`} key={suggestion.id}>
                            <span className="map-review-severity-icon">
                              {suggestion.severity === "error"
                                ? <AlertTriangle size={16} />
                                : suggestion.severity === "warning"
                                  ? <AlertTriangle size={16} />
                                  : <Sparkles size={16} />}
                            </span>
                            <div>
                              <header>
                                <strong>{suggestion.title}</strong>
                                <small>{getMapReviewTargetLabel(suggestion)}</small>
                              </header>
                              <p>{suggestion.detail}</p>
                              {Object.keys(safePatch).length ? (
                                <div className="map-review-patch-fields">
                                  {Object.keys(safePatch).map((field) => <span key={field}>{field}</span>)}
                                </div>
                              ) : null}
                              <footer>
                                <button type="button" onClick={() => locateMapReviewTarget(suggestion)}>
                                  <LocateFixed size={14} />
                                  <span>定位</span>
                                </button>
                                {Object.keys(safePatch).length ? (
                                  <button
                                    className="is-apply"
                                    type="button"
                                    onClick={() => applyMapAiSuggestion(suggestion)}
                                  >
                                    <Check size={14} />
                                    <span>直接应用</span>
                                  </button>
                                ) : null}
                              </footer>
                            </div>
                          </article>
                        );
                      })}
                      {!aiSuggestions.length ? (
                        <div className="map-review-empty">
                          {aiReviewStatus.kind === "working"
                            ? <LoaderCircle className="is-spinning" size={26} />
                            : <Sparkles size={26} />}
                          <strong>{aiReviewStatus.kind === "working" ? "正在生成建议" : "尚无 AI 审阅结果"}</strong>
                        </div>
                      ) : null}
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="map-review-body map-version-workspace">
                <aside className="map-version-list-pane">
                  <header>
                    <div>
                      <History size={17} />
                      <strong>历史版本</strong>
                    </div>
                    <button
                      aria-label="刷新地图版本"
                      disabled={versionStatus.kind === "working"}
                      title="刷新版本"
                      type="button"
                      onClick={() => void refreshMapVersions()}
                    >
                      <RefreshCw className={versionStatus.kind === "working" ? "is-spinning" : ""} size={15} />
                    </button>
                  </header>
                  <div className="map-version-list">
                    {mapVersions.map((version) => (
                      <button
                        aria-pressed={selectedVersionId === version.id}
                        className={selectedVersionId === version.id ? "is-active" : ""}
                        key={version.id}
                        type="button"
                        onClick={() => setSelectedVersionId(version.id)}
                      >
                        <Clock3 size={15} />
                        <span>
                          <strong>{formatMapVersionDate(version.createdAt)}</strong>
                          <small>{version.reason || version.label}</small>
                        </span>
                        <ChevronRight size={14} />
                      </button>
                    ))}
                    {!mapVersions.length ? (
                      <div className="map-review-empty">
                        {versionStatus.kind === "working"
                          ? <LoaderCircle className="is-spinning" size={25} />
                          : <History size={25} />}
                        <strong>{versionStatus.kind === "working" ? "正在读取版本" : "暂无历史版本"}</strong>
                      </div>
                    ) : null}
                  </div>
                  {versionStatus.message ? (
                    <output className={`map-review-status is-${versionStatus.kind}`}>
                      {versionStatus.message}
                    </output>
                  ) : null}
                </aside>

                <section className="map-version-compare-pane">
                  {selectedMapVersion && selectedMapVersionComparison ? (
                    <>
                      <header>
                        <div>
                          <strong>{formatMapVersionDate(selectedMapVersion.createdAt)}</strong>
                          <span>{selectedMapVersion.reason || "历史地图版本"}</span>
                        </div>
                        <button
                          className="map-version-restore"
                          disabled={versionStatus.kind === "working"}
                          type="button"
                          onClick={() => void restoreSelectedMapVersion()}
                        >
                          <RotateCcw size={16} />
                          <span>恢复此版本</span>
                        </button>
                      </header>

                      <div className="map-version-previews">
                        <figure>
                          <figcaption><span>当前版本</span><small>{activeMap.title}</small></figcaption>
                          <MapVersionPreview map={activeMap} />
                        </figure>
                        <figure>
                          <figcaption><span>历史版本</span><small>{selectedMapVersion.map.title}</small></figcaption>
                          <MapVersionPreview map={selectedMapVersion.map} />
                        </figure>
                      </div>

                      <dl className="map-version-diff-summary">
                        <div>
                          <dt>字段变化</dt>
                          <dd>{selectedMapVersionComparison.changedFields.length}</dd>
                        </div>
                        <div>
                          <dt>新增区域</dt>
                          <dd>{selectedMapVersionComparison.addedRegionIds.length}</dd>
                        </div>
                        <div>
                          <dt>修改区域</dt>
                          <dd>{selectedMapVersionComparison.changedRegionIds.length}</dd>
                        </div>
                        <div>
                          <dt>移除区域</dt>
                          <dd>{selectedMapVersionComparison.removedRegionIds.length}</dd>
                        </div>
                      </dl>

                      <div className="map-version-change-groups">
                        <section>
                          <h3>地图字段</h3>
                          <div>
                            {selectedMapVersionComparison.changedFields.map((field) => (
                              <span key={field}>{mapVersionFieldLabels[field as keyof WorldMap] ?? field}</span>
                            ))}
                            {!selectedMapVersionComparison.changedFields.length ? <small>无变化</small> : null}
                          </div>
                        </section>
                        <section>
                          <h3>区域变化</h3>
                          <div>
                            {selectedMapVersionComparison.addedRegionIds.map((id) => (
                              <span className="is-added" key={`added-${id}`}>
                                + {activeMap.regions.find((region) => region.id === id)?.title ?? id}
                              </span>
                            ))}
                            {selectedMapVersionComparison.changedRegionIds.map((id) => (
                              <span className="is-changed" key={`changed-${id}`}>
                                ~ {activeMap.regions.find((region) => region.id === id)?.title ?? id}
                              </span>
                            ))}
                            {selectedMapVersionComparison.removedRegionIds.map((id) => (
                              <span className="is-removed" key={`removed-${id}`}>
                                - {selectedMapVersion.map.regions.find((region) => region.id === id)?.title ?? id}
                              </span>
                            ))}
                            {!selectedMapVersionComparison.addedRegionIds.length
                              && !selectedMapVersionComparison.changedRegionIds.length
                              && !selectedMapVersionComparison.removedRegionIds.length
                              ? <small>无变化</small>
                              : null}
                          </div>
                        </section>
                      </div>
                    </>
                  ) : (
                    <div className="map-version-compare-empty">
                      <History size={30} />
                      <strong>选择一个历史版本</strong>
                    </div>
                  )}
                </section>
              </div>
            )}
          </section>
        </div>
      ) : null}
      {exportDialogOpen && exportDimensions ? (
        <div
          className="map-export-backdrop"
          role="presentation"
          onMouseDown={() => exportStatus.kind !== "working" && setExportDialogOpen(false)}
        >
          <section
            ref={exportDialogRef}
            aria-label={`导出高清地图 ${activeMap.title}`}
            aria-modal="true"
            className="map-export-dialog"
            role="dialog"
            tabIndex={-1}
            onKeyDown={handleExportDialogKeyDown}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <strong>导出高清地图</strong>
                <span>{activeMap.title} · {exportDimensions.width} × {exportDimensions.height}</span>
              </div>
              <button
                aria-label="关闭地图导出"
                disabled={exportStatus.kind === "working"}
                title="关闭"
                type="button"
                onClick={() => setExportDialogOpen(false)}
              >
                <X size={18} />
              </button>
            </header>

            <div className="map-export-body">
              <fieldset>
                <legend>导出范围</legend>
                <div className="map-export-segmented has-three" role="group" aria-label="地图导出范围">
                  {([
                    ["map", "整张地图"],
                    ["viewport", "当前视口"],
                    ["selection", "所选范围"]
                  ] as const).map(([scope, label]) => (
                    <button
                      aria-pressed={exportOptions.scope === scope}
                      className={exportOptions.scope === scope ? "is-active" : ""}
                      disabled={scope === "selection" && !selectionExportBounds}
                      key={scope}
                      type="button"
                      onClick={() => updateExportOption("scope", scope)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>图像格式</legend>
                <div className="map-export-segmented" role="group" aria-label="地图导出格式">
                  {(["png", "webp"] as const).map((format) => (
                    <button
                      aria-pressed={exportOptions.format === format}
                      className={exportOptions.format === format ? "is-active" : ""}
                      key={format}
                      type="button"
                      onClick={() => updateExportOption("format", format)}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>输出倍率</legend>
                <div className="map-export-segmented has-three" role="group" aria-label="地图导出倍率">
                  {([1, 2, 4] as const).map((scale) => (
                    <button
                      aria-pressed={exportOptions.scale === scale}
                      className={exportOptions.scale === scale ? "is-active" : ""}
                      key={scale}
                      type="button"
                      onClick={() => updateExportOption("scale", scale)}
                    >
                      {scale}×
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="map-export-content-options">
                <legend>导出内容</legend>
                <div>
                  {([
                    ["includeBaseMap", "底图"],
                    ["includeLayers", "图片图层"],
                    ["includeGrid", "网格"],
                    ["includeRegions", "区域"],
                    ["includeRoutes", "路线"],
                    ["includeMarkers", "标记"],
                    ["includeLabels", "标签"]
                  ] as const).map(([key, label]) => (
                    <label key={key}>
                      <input
                        checked={exportOptions[key]}
                        type="checkbox"
                        onChange={(event) => updateExportOption(key, event.target.checked)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                  <label>
                    <input
                      checked={exportOptions.transparent}
                      type="checkbox"
                      onChange={(event) => updateExportOption("transparent", event.target.checked)}
                    />
                    <span>透明背景</span>
                  </label>
                </div>
              </fieldset>

              <output
                aria-live="polite"
                className={`map-export-summary is-${exportStatus.kind}`}
              >
                {exportStatus.message || (
                  exportDimensions.limited
                    ? `输出已限制为 ${exportDimensions.width} × ${exportDimensions.height}`
                    : `${exportDimensions.width} × ${exportDimensions.height} · ${exportOptions.format.toUpperCase()}`
                )}
              </output>
            </div>

            <footer>
              <button
                className="secondary"
                disabled={exportStatus.kind === "working"}
                type="button"
                onClick={() => setExportDialogOpen(false)}
              >
                取消
              </button>
              <button
                className="primary"
                disabled={exportStatus.kind === "working"}
                type="button"
                onClick={() => void exportMapImage()}
              >
                <Download size={16} />
                <span>{exportStatus.kind === "working" ? "正在导出" : "导出地图"}</span>
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function MapVersionPreview({ map }: { map: WorldMap }) {
  return (
    <svg
      aria-label={`${map.title}区域预览`}
      className="map-version-preview"
      preserveAspectRatio="none"
      role="img"
      style={{ aspectRatio: `${map.width} / ${map.height}` }}
      viewBox="0 0 100 100"
    >
      <defs>
        <pattern height="8" id={`version-grid-${map.id}`} patternUnits="userSpaceOnUse" width="8">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="0.25" />
        </pattern>
      </defs>
      <rect fill="currentColor" fillOpacity="0.025" height="100" width="100" />
      {map.imageUrl ? (
        <image height="100" href={map.imageUrl} opacity="0.74" preserveAspectRatio="xMidYMid slice" width="100" />
      ) : null}
      <rect fill={`url(#version-grid-${map.id})`} height="100" width="100" />
      {map.regions.filter((region) => region.points.length >= 3).map((region) => (
        <path
          d={createMapRegionSvgPath(region.points, region.holes)}
          fill={region.color}
          fillOpacity={Math.min(0.65, Math.max(0.12, region.opacity))}
          fillRule="evenodd"
          key={region.id}
          stroke={region.color}
          strokeLinejoin="round"
          strokeWidth="0.65"
        />
      ))}
    </svg>
  );
}

function MapLabelPlacementControl({
  disabled = false,
  onChange,
  placement
}: {
  disabled?: boolean;
  onChange: (placement: MapLabelPlacement) => void;
  placement: MapLabelPlacement;
}) {
  const zoomOptions = Array.from(new Set([
    0.1,
    0.25,
    0.5,
    0.75,
    1,
    1.5,
    2,
    3,
    4,
    placement.minZoom
  ])).sort((left, right) => left - right);
  return (
    <div className="map-label-placement-control">
      <header>
        <span><Tags size={15} /><strong>标签布局</strong></span>
        <div>
          <button
            aria-label={placement.locked ? "解锁标签位置" : "锁定标签位置"}
            aria-pressed={placement.locked}
            disabled={disabled}
            title={placement.locked ? "解锁标签位置" : "锁定标签位置"}
            type="button"
            onClick={() => onChange({ ...placement, locked: !placement.locked })}
          >
            {placement.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          <button
            aria-label="重置标签位置"
            disabled={disabled || (!placement.offsetX && !placement.offsetY)}
            title="重置标签位置"
            type="button"
            onClick={() => onChange({ ...placement, offsetX: 0, offsetY: 0 })}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>
      <label>
        <span>最低显示倍率</span>
        <select
          aria-label="标签最低显示倍率"
          disabled={disabled}
          value={placement.minZoom}
          onChange={(event) => onChange({ ...placement, minZoom: Number(event.target.value) })}
        >
          {zoomOptions.map((value) => (
            <option key={value} value={value}>
              {value === 0.1 ? "始终显示" : `${Math.round(value * 100)}%`}
            </option>
          ))}
        </select>
      </label>
      <output>{placement.offsetX.toFixed(2)}, {placement.offsetY.toFixed(2)}</output>
    </div>
  );
}

function RegionInspector({
  boundaryEditing,
  canMoveDown,
  canMoveUp,
  onDelete,
  onBoundaryEditingChange,
  onMove,
  onOpenReference,
  onPhaseVisibleChange,
  onStartHole,
  onUpdate,
  phase,
  phaseVisible,
  referenceOptions,
  map,
  region
}: {
  boundaryEditing: boolean;
  canMoveDown: boolean;
  canMoveUp: boolean;
  onDelete: () => void;
  onBoundaryEditingChange: (editing: boolean) => void;
  onMove: (regionId: string, direction: -1 | 1) => void;
  onOpenReference: (reference: ProjectObjectRef) => void;
  onPhaseVisibleChange: (visible: boolean) => void;
  onStartHole: () => void;
  onUpdate: (patch: Partial<MapRegion>) => void;
  phase: MapStoryPhase | null;
  phaseVisible: boolean;
  referenceOptions: ProjectReferenceOption[];
  map: WorldMap;
  region: MapRegion;
}) {
  const metrics = calculateMapRegionMetrics(region, map);
  return (
    <>
      <InspectorHeading
        icon={Pentagon}
        title={region.title}
        subtitle={`${regionKindMeta[region.kind]} · ${region.points.length} 个顶点`}
      />
      <PhaseVisibilityControl phase={phase} visible={phaseVisible} onChange={onPhaseVisibleChange} />
      <MapLabelPlacementControl
        placement={region.labelPlacement}
        onChange={(labelPlacement) => onUpdate({ labelPlacement })}
      />
      <section className="map-region-geometry-tools">
        <header><Pentagon size={15} /><strong>区域几何</strong><span>{region.holes.length} 个镂空</span></header>
        <div>
          <button
            disabled={region.locked || region.points.length <= 3}
            type="button"
            onClick={() => onUpdate({ points: simplifyMapRegionPoints(region.points) })}
          >
            <Scan size={14} /><span>简化边界</span>
          </button>
          <button
            disabled={region.locked || region.points.length >= 100}
            type="button"
            onClick={() => onUpdate({ points: smoothMapRegionPoints(region.points) })}
          >
            <PenTool size={14} /><span>平滑边界</span>
          </button>
          <button disabled={region.locked || !region.visible} type="button" onClick={onStartHole}>
            <Plus size={14} /><span>绘制镂空</span>
          </button>
        </div>
        {region.holes.map((hole, index) => (
          <div className="map-region-hole-row" key={`hole:${index}`}>
            <span>镂空 {index + 1} · {hole.length} 点</span>
            <button
              aria-label={`删除区域镂空 ${index + 1}`}
              disabled={region.locked}
              title="删除镂空"
              type="button"
              onClick={() => onUpdate({
                holes: region.holes.filter((_, holeIndex) => holeIndex !== index)
              })}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </section>
      <button
        aria-label={boundaryEditing ? "完成区域边界编辑" : "编辑区域边界"}
        aria-pressed={boundaryEditing}
        className={`map-region-boundary-action ${boundaryEditing ? "is-active" : ""}`}
        disabled={!region.visible || region.locked}
        type="button"
        onClick={() => onBoundaryEditingChange(!boundaryEditing)}
      >
        {boundaryEditing ? <Check size={17} /> : <Move size={17} />}
        <span>{boundaryEditing ? "完成边界编辑" : "编辑边界"}</span>
      </button>
      <div className="map-region-metrics">
        <span><strong>{metrics.areaPercent}%</strong><small>地图覆盖</small></span>
        <span><strong>{formatMapDistance(metrics.perimeter, map)}</strong><small>边界周长</small></span>
      </div>
      <PlanningField label="区域名称">
        <input aria-label="区域名称" value={region.title} onChange={(event) => onUpdate({ title: event.target.value })} />
      </PlanningField>
      <PlanningField label="区域类型">
        <select aria-label="区域类型" value={region.kind} onChange={(event) => onUpdate({ kind: event.target.value as MapRegionKind })}>
          {Object.entries(regionKindMeta).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </PlanningField>
      <PlanningField label="区域说明">
        <textarea aria-label="区域说明" rows={4} value={region.description} onChange={(event) => onUpdate({ description: event.target.value })} />
      </PlanningField>
      <PlanningField label="识别颜色">
        <div className="planning-color-swatches" role="radiogroup" aria-label="区域颜色">
          {planningColors.map((color) => (
            <button
              aria-label={`选择区域颜色 ${color}`}
              aria-checked={region.color === color}
              className={region.color === color ? "is-active" : ""}
              key={color}
              role="radio"
              style={{ background: color }}
              title={color}
              type="button"
              onClick={() => onUpdate({ color })}
            >
              {region.color === color ? <Check size={13} /> : null}
            </button>
          ))}
        </div>
      </PlanningField>
      <PlanningField label="填充透明度">
        <div className="map-region-opacity-control">
          <input
            aria-label="区域透明度"
            max={0.75}
            min={0.05}
            step={0.01}
            type="range"
            value={region.opacity}
            onChange={(event) => onUpdate({ opacity: Number(event.target.value) })}
          />
          <output>{Math.round(region.opacity * 100)}%</output>
        </div>
      </PlanningField>
      <PlanningField label="显示顺序">
        <div className="map-region-order-control">
          <input aria-label="区域顺序" type="number" value={region.order} onChange={(event) => onUpdate({ order: Number(event.target.value) })} />
          <button aria-label="区域下移一层" disabled={!canMoveUp} title="区域下移一层" type="button" onClick={() => onMove(region.id, -1)}><ArrowDown size={16} /></button>
          <button aria-label="区域上移一层" disabled={!canMoveDown} title="区域上移一层" type="button" onClick={() => onMove(region.id, 1)}><ArrowUp size={16} /></button>
        </div>
      </PlanningField>
      <div className="planning-structure-toggles">
        <label>
          <input aria-label="显示区域" checked={region.visible} type="checkbox" onChange={(event) => onUpdate({ visible: event.target.checked })} />
          {region.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          <span>在地图上显示</span>
        </label>
        <label>
          <input aria-label="锁定区域顶点" checked={region.locked} type="checkbox" onChange={(event) => onUpdate({ locked: event.target.checked })} />
          {region.locked ? <Lock size={16} /> : <Unlock size={16} />}
          <span>锁定区域顶点</span>
        </label>
      </div>
      <PlanningField label="关联剧情对象">
        <ProjectReferencePicker
          allowedKinds={["entity", "quest", "scene", "timeline-event", "map-marker"]}
          emptyLabel="尚未关联剧情对象"
          options={referenceOptions}
          placeholder="搜索角色、地点、任务或场景"
          value={region.references}
          onChange={(references) => onUpdate({ references })}
          onOpenReference={onOpenReference}
        />
      </PlanningField>
      <button className="planning-danger-action" type="button" onClick={onDelete}><Trash2 size={17} /><span>删除区域</span></button>
    </>
  );
}

function MapInspector({
  canDelete,
  childMaps,
  hierarchyEntries,
  imageTransformMode,
  map,
  markers,
  phase,
  phaseTimelineEvents,
  onChooseImage,
  onDelete,
  onDeletePhase,
  onRemoveImage,
  onSelectMap,
  onToggleImageTransform,
  onUpdate,
  onUpdatePhase
}: {
  canDelete: boolean;
  childMaps: WorldMap[];
  hierarchyEntries: MapHierarchyEntry[];
  imageTransformMode: boolean;
  map: WorldMap;
  markers: MapMarker[];
  phase: MapStoryPhase | null;
  phaseTimelineEvents: TimelineEvent[];
  onChooseImage: () => void;
  onDelete: () => void | Promise<void>;
  onDeletePhase: (phase: MapStoryPhase) => void;
  onRemoveImage: () => void;
  onSelectMap: (mapId: string) => void;
  onToggleImageTransform: () => void;
  onUpdate: (patch: Partial<WorldMap>) => void;
  onUpdatePhase: (patch: Partial<MapStoryPhase>) => void;
}) {
  const grid = calculateMapGrid(map);
  const parentMarkers = markers.filter((marker) => marker.mapId === map.parentMapId);
  const updateGrid = (patch: Partial<WorldMap["grid"]>) =>
    onUpdate({ grid: { ...map.grid, ...patch } });
  const updateImageTransform = (patch: Partial<MapImageTransform>) =>
    onUpdate({
      imageTransform: normalizeMapImageTransform({
        ...map.imageTransform,
        ...patch
      })
    });
  return (
    <>
      <InspectorHeading
        icon={Map}
        title="地图设置"
        subtitle={`${map.parentMapId ? "子地图" : "顶层地图"} · 画布、比例尺与坐标网格`}
      />
      {phase ? (
        <section aria-label="剧情阶段设置" className="map-story-phase-settings">
          <header>
            <span>
              <CalendarClock size={16} />
              <strong>剧情阶段</strong>
              <small>
                {phase.hiddenLayerIds.length
                  + phase.hiddenGroupIds.length
                  + phase.hiddenMarkerIds.length
                  + phase.hiddenRegionIds.length
                  + phase.hiddenRouteIds.length} 项隐藏
              </small>
            </span>
            <button aria-label="删除当前剧情阶段" title="删除当前剧情阶段" type="button" onClick={() => onDeletePhase(phase)}>
              <Trash2 size={16} />
            </button>
          </header>
          <PlanningField label="阶段名称">
            <input aria-label="剧情阶段名称" value={phase.title} onChange={(event) => onUpdatePhase({ title: event.target.value })} />
          </PlanningField>
          <PlanningField label="关联时间点">
            <select aria-label="剧情阶段时间点" value={phase.timelineEventId} onChange={(event) => onUpdatePhase({ timelineEventId: event.target.value })}>
              <option value="">不关联时间点</option>
              {phaseTimelineEvents.map((event) => (
                <option key={event.id} value={event.id}>{event.displayDate} · {event.title || "未命名时间点"}</option>
              ))}
            </select>
          </PlanningField>
          <PlanningField label="阶段说明">
            <textarea aria-label="剧情阶段说明" rows={3} value={phase.description} onChange={(event) => onUpdatePhase({ description: event.target.value })} />
          </PlanningField>
        </section>
      ) : null}
      <section aria-label="地图层级设置" className="map-hierarchy-settings">
        <header><FolderTree size={16} /><strong>地图层级</strong></header>
        <PlanningField label="上级地图">
          <select
            aria-label="地图上级地图"
            value={map.parentMapId}
            onChange={(event) => onUpdate({ parentMapId: event.target.value, entryMarkerId: "" })}
          >
            <option value="">顶层地图</option>
            {hierarchyEntries.map((entry) => (
              <option key={entry.map.id} value={entry.map.id}>
                {`${"\u00a0\u00a0".repeat(entry.depth)}${entry.depth ? "↳ " : ""}${entry.map.title}`}
              </option>
            ))}
          </select>
        </PlanningField>
        <PlanningField label="上级入口标记">
          <select
            aria-label="地图上级入口标记"
            disabled={!map.parentMapId}
            value={map.entryMarkerId}
            onChange={(event) => onUpdate({ entryMarkerId: event.target.value })}
          >
            <option value="">不绑定入口</option>
            {parentMarkers.map((marker) => (
              <option key={marker.id} value={marker.id}>{marker.label}</option>
            ))}
          </select>
        </PlanningField>
        {childMaps.length ? (
          <div className="map-child-map-list">
            <span>下级地图</span>
            {childMaps.map((childMap) => (
              <button key={childMap.id} type="button" onClick={() => onSelectMap(childMap.id)}>
                <Map size={15} /><span>{childMap.title}</span><ChevronRight size={14} />
              </button>
            ))}
          </div>
        ) : null}
      </section>
      <div className={`map-image-control ${map.imageUrl ? "has-image" : ""}`}>
        <div className="map-image-preview">
          {map.imageUrl ? (
            <img
              alt={`${map.title} 底图预览`}
              draggable={false}
              src={map.imageUrl}
              style={getMapImageTransformStyle(map.imageTransform)}
            />
          ) : <ImageIcon size={30} />}
        </div>
        <div className="map-image-actions">
          <button className="planning-file-action" type="button" onClick={onChooseImage}>
            <Upload size={17} />
            <span>{map.imageUrl ? "更换地图底图" : "选择地图底图"}</span>
          </button>
          {map.imageUrl ? (
            <button className="map-image-remove-action" type="button" onClick={onRemoveImage}>
              <Trash2 size={16} />
              <span>移除底图</span>
            </button>
          ) : null}
        </div>
      </div>
      {map.imageUrl ? (
        <section aria-label="底图变换设置" className="map-image-transform-settings">
          <header>
            <span><Move size={16} /><strong>底图变换</strong></span>
            <button
              aria-label="复位底图变换"
              title="复位底图变换"
              type="button"
              onClick={() => onUpdate({ imageTransform: createMapImageTransform() })}
            >
              <Undo2 size={16} />
            </button>
          </header>
          <button
            aria-pressed={imageTransformMode}
            className={`map-image-canvas-action ${imageTransformMode ? "is-active" : ""}`}
            type="button"
            onClick={onToggleImageTransform}
          >
            <Move size={16} />
            <span>{imageTransformMode ? "完成画布调整" : "在画布上调整"}</span>
          </button>
          <div className="map-image-transform-quick-actions" role="group" aria-label="底图快捷变换">
            <button aria-label="底图居中" title="底图居中" type="button" onClick={() => updateImageTransform({ x: 0, y: 0 })}>
              <LocateFixed size={16} />
            </button>
            <button aria-label="底图向左旋转 90 度" title="向左旋转 90 度" type="button" onClick={() => updateImageTransform({ rotation: map.imageTransform.rotation - 90 })}>
              <RotateCcw size={16} />
            </button>
            <button aria-label="底图向右旋转 90 度" title="向右旋转 90 度" type="button" onClick={() => updateImageTransform({ rotation: map.imageTransform.rotation + 90 })}>
              <RotateCw size={16} />
            </button>
          </div>
          <div className="planning-field-grid">
            <PlanningField label="水平位置 (%)">
              <input
                aria-label="底图横向位置"
                max={MAP_CANVAS_COORDINATE_LIMIT}
                min={-MAP_CANVAS_COORDINATE_LIMIT}
                step={0.1}
                type="number"
                value={map.imageTransform.x}
                onChange={(event) => updateImageTransform({ x: Number(event.target.value) })}
              />
            </PlanningField>
            <PlanningField label="垂直位置 (%)">
              <input
                aria-label="底图纵向位置"
                max={MAP_CANVAS_COORDINATE_LIMIT}
                min={-MAP_CANVAS_COORDINATE_LIMIT}
                step={0.1}
                type="number"
                value={map.imageTransform.y}
                onChange={(event) => updateImageTransform({ y: Number(event.target.value) })}
              />
            </PlanningField>
          </div>
          <PlanningField label="底图大小">
            <div className="map-image-transform-value">
              <input
                aria-label="底图缩放滑杆"
                max={5000}
                min={1}
                step={1}
                type="range"
                value={map.imageTransform.scale * 100}
                onChange={(event) => updateImageTransform({ scale: Number(event.target.value) / 100 })}
              />
              <label>
                <input
                  aria-label="底图缩放比例"
                  max={100000}
                  min={1}
                  step={0.1}
                  type="number"
                  value={Math.round(map.imageTransform.scale * 1000) / 10}
                  onChange={(event) => updateImageTransform({ scale: Number(event.target.value) / 100 })}
                />
                <span>%</span>
              </label>
            </div>
          </PlanningField>
          <PlanningField label="旋转角度">
            <div className="map-image-transform-value">
              <input
                aria-label="底图旋转滑杆"
                max={180}
                min={-180}
                step={1}
                type="range"
                value={map.imageTransform.rotation}
                onChange={(event) => updateImageTransform({ rotation: Number(event.target.value) })}
              />
              <label>
                <input
                  aria-label="底图旋转角度"
                  step={0.1}
                  type="number"
                  value={map.imageTransform.rotation}
                  onChange={(event) => updateImageTransform({ rotation: Number(event.target.value) })}
                />
                <span>°</span>
              </label>
            </div>
          </PlanningField>
        </section>
      ) : null}
      <PlanningField label="地图名称"><input aria-label="地图名称" value={map.title} onChange={(event) => onUpdate({ title: event.target.value })} /></PlanningField>
      <PlanningField label="地图说明"><textarea aria-label="地图说明" rows={4} value={map.description} onChange={(event) => onUpdate({ description: event.target.value })} /></PlanningField>
      <div className="planning-field-grid">
        <PlanningField label="宽度"><input aria-label="地图宽度" type="number" min={320} value={map.width} onChange={(event) => onUpdate({ width: Number(event.target.value) })} /></PlanningField>
        <PlanningField label="高度"><input aria-label="地图高度" type="number" min={240} value={map.height} onChange={(event) => onUpdate({ height: Number(event.target.value) })} /></PlanningField>
      </div>
      <div className="planning-field-grid">
        <PlanningField label="横向跨度">
          <input aria-label="地图横向跨度" min={0.01} step={0.1} type="number" value={map.distanceWidth} onChange={(event) => onUpdate({ distanceWidth: Number(event.target.value) })} />
        </PlanningField>
        <PlanningField label="距离单位">
          <select aria-label="地图距离单位" value={map.distanceUnit} onChange={(event) => onUpdate({ distanceUnit: event.target.value as WorldMap["distanceUnit"] })}>
            {mapDistanceUnits.map((unit) => <option key={unit} value={unit}>{mapDistanceUnitLabels[unit]}</option>)}
          </select>
        </PlanningField>
      </div>
      {map.distanceUnit === "custom" ? (
        <PlanningField label="自定义单位">
          <input aria-label="地图自定义距离单位" value={map.customDistanceUnit} onChange={(event) => onUpdate({ customDistanceUnit: event.target.value })} />
        </PlanningField>
      ) : null}
      <div className="map-grid-settings-heading">
        <strong>坐标网格</strong>
        <small>{grid.columns} 列 × {grid.rows} 行</small>
      </div>
      <div className="planning-structure-toggles map-grid-toggles">
        <label>
          <input
            aria-label="显示坐标网格"
            checked={map.grid.visible}
            type="checkbox"
            onChange={(event) => updateGrid({ visible: event.target.checked, ...(!event.target.checked ? { snap: false } : {}) })}
          />
          {map.grid.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          <span>显示网格</span>
        </label>
        <label>
          <input aria-label="显示网格坐标" checked={map.grid.labels} disabled={!map.grid.visible} type="checkbox" onChange={(event) => updateGrid({ labels: event.target.checked })} />
          <Tags size={16} />
          <span>坐标标签</span>
        </label>
        <label>
          <input aria-label="吸附到坐标网格" checked={map.grid.snap} disabled={!map.grid.visible} type="checkbox" onChange={(event) => updateGrid({ snap: event.target.checked })} />
          <LocateFixed size={16} />
          <span>吸附网格</span>
        </label>
      </div>
      <PlanningField label="网格列数">
        <input aria-label="地图网格列数" disabled={!map.grid.visible} max={24} min={4} type="number" value={map.grid.columns} onChange={(event) => updateGrid({ columns: Number(event.target.value) })} />
      </PlanningField>
      <PlanningField label="网格颜色">
        <div className="planning-color-swatches" role="radiogroup" aria-label="地图网格颜色">
          {planningColors.map((color) => (
            <button
              aria-checked={map.grid.color === color}
              aria-label={`选择网格颜色 ${color}`}
              className={map.grid.color === color ? "is-active" : ""}
              disabled={!map.grid.visible}
              key={color}
              role="radio"
              style={{ background: color }}
              title={color}
              type="button"
              onClick={() => updateGrid({ color })}
            >
              {map.grid.color === color ? <Check size={13} /> : null}
            </button>
          ))}
        </div>
      </PlanningField>
      <PlanningField label="网格透明度">
        <div className="map-region-opacity-control">
          <input aria-label="地图网格透明度" disabled={!map.grid.visible} max={0.8} min={0.05} step={0.01} type="range" value={map.grid.opacity} onChange={(event) => updateGrid({ opacity: Number(event.target.value) })} />
          <output>{Math.round(map.grid.opacity * 100)}%</output>
        </div>
      </PlanningField>
      <button className="planning-danger-action" disabled={!canDelete} type="button" onClick={() => void onDelete()}><Trash2 size={17} /><span>删除地图</span></button>
    </>
  );
}

function MapLayerPalette({
  activeLayerId,
  hiddenLayerIds,
  layerMarkerCounts,
  layers,
  map,
  selectedLayerIds,
  transformingLayerId,
  onAddImageLayer,
  onArrangeSelection,
  onCreateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onEditProperties,
  onGroupSelection,
  onMergeLayer,
  onOpenMapSettings,
  onReorderLayers,
  onSelectLayer,
  onToggleTransform,
  onUngroupSelection,
  onUpdateLayer
}: {
  activeLayerId: string;
  hiddenLayerIds: Set<string>;
  layerMarkerCounts: Record<string, number>;
  layers: MapLayer[];
  map: WorldMap;
  selectedLayerIds: string[];
  transformingLayerId: string;
  onAddImageLayer: () => void;
  onArrangeSelection: (action: MapImageArrangeAction) => void;
  onCreateLayer: () => void;
  onDeleteLayer: (layerId: string) => void;
  onDuplicateLayer: (layerId: string) => void;
  onEditProperties: () => void;
  onGroupSelection: () => void;
  onMergeLayer: (sourceLayerId: string, targetLayerId: string) => Promise<boolean>;
  onOpenMapSettings: () => void;
  onReorderLayers: (orderedLayerIds: string[]) => void;
  onSelectLayer: (layerId: string, additive?: boolean) => void;
  onToggleTransform: (layerId: string) => void;
  onUngroupSelection: () => void;
  onUpdateLayer: (layerId: string, patch: Partial<MapLayer>) => void;
}) {
  const [draggingLayerId, setDraggingLayerId] = useState("");
  const [mergingLayerId, setMergingLayerId] = useState("");
  const [dropTarget, setDropTarget] = useState<{
    edge: "after" | "before";
    layerId: string;
  } | null>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const stack = [...layers].reverse();
  const selectedLayerSet = new Set(selectedLayerIds);
  const selectedImageLayers = layers.filter(
    (layer) => selectedLayerSet.has(layer.id) && Boolean(layer.imageUrl)
  );
  const editableSelectedImageLayers = selectedImageLayers.filter(
    (layer) => layer.visible && !layer.locked && !hiddenLayerIds.has(layer.id)
  );
  const selectedGroupIds = new Set(
    selectedImageLayers.map((layer) => layer.imageGroupId).filter(Boolean)
  );
  const imageGroupNumbers = new globalThis.Map(
    Array.from(new Set(stack.map((layer) => layer.imageGroupId).filter(Boolean)))
      .map((groupId, index) => [groupId, index + 1])
  );
  const activeLayer = layers.find((layer) => layer.id === activeLayerId) ?? null;
  const activeStackIndex = stack.findIndex((layer) => layer.id === activeLayer?.id);
  const mergeTarget = activeStackIndex >= 0 ? stack[activeStackIndex + 1] ?? null : null;
  const phaseVisibilityDiffers = Boolean(
    activeLayer
    && mergeTarget
    && map.storyPhases.some((phase) =>
      phase.hiddenLayerIds.includes(activeLayer.id) !== phase.hiddenLayerIds.includes(mergeTarget.id)
    )
  );
  const mergeDisabledReason = !activeLayer
    ? "请先选择图层"
    : activeLayer.id === `map-layer-default:${map.id}`
      ? "默认图层不能被合并移除"
      : !mergeTarget
        ? "当前图层下方没有可合并图层"
        : activeLayer.locked || mergeTarget.locked
          ? "请先解锁当前图层和下一图层"
          : !activeLayer.visible || !mergeTarget.visible
            ? "请先显示当前图层和下一图层"
            : hiddenLayerIds.has(activeLayer.id) || hiddenLayerIds.has(mergeTarget.id)
              ? "请先在当前剧情阶段显示这两个图层"
              : phaseVisibilityDiffers
                ? "两个图层在剧情阶段中的显隐不同，先统一显隐"
                : "";
  const canDeleteActive = Boolean(
    activeLayer
    && layers.length > 1
    && activeLayer.id !== `map-layer-default:${map.id}`
  );
  const transformSelection = selectedImageLayers.length
    ? selectedImageLayers
    : activeLayer?.imageUrl
      ? [activeLayer]
      : [];
  const transformDisabledReason = !activeLayer
    ? "请先选择图片图层"
    : !transformSelection.length
      ? "当前图层还没有图片"
      : transformSelection.some((layer) => layer.locked)
        ? "请先解锁选中的图片图层"
        : transformSelection.some((layer) => !layer.visible || hiddenLayerIds.has(layer.id))
          ? "请先显示选中的图片图层"
          : "";
  const isTransformingActiveLayer = Boolean(
    activeLayer && transformingLayerId === activeLayer.id
  );

  function commitStack(nextStack: MapLayer[]) {
    const currentIds = stack.map((layer) => layer.id).join("|");
    const nextIds = nextStack.map((layer) => layer.id).join("|");
    if (currentIds === nextIds) return;
    onReorderLayers([...nextStack].reverse().map((layer) => layer.id));
  }

  function moveLayer(layerId: string, direction: "down" | "up") {
    const next = [...stack];
    const index = next.findIndex((layer) => layer.id === layerId);
    const targetIndex = index + (direction === "up" ? -1 : 1);
    if (index < 0 || targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    commitStack(next);
  }

  function handleLayerDragOver(event: ReactDragEvent<HTMLDivElement>, layerId: string) {
    if (mergingLayerId) return;
    const sourceId = draggingLayerId || event.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === layerId) {
      setDropTarget(null);
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const bounds = event.currentTarget.getBoundingClientRect();
    setDropTarget({
      edge: event.clientY < bounds.top + bounds.height / 2 ? "before" : "after",
      layerId
    });
  }

  function handleStackDragOver(event: ReactDragEvent<HTMLDivElement>) {
    if (!draggingLayerId || mergingLayerId) return;
    const stackElement = stackRef.current;
    if (!stackElement) return;
    const bounds = stackElement.getBoundingClientRect();
    const edgeSize = Math.min(48, bounds.height * 0.18);
    if (event.clientY < bounds.top + edgeSize) stackElement.scrollBy({ top: -18 });
    else if (event.clientY > bounds.bottom - edgeSize) stackElement.scrollBy({ top: 18 });
  }

  function handleLayerDrop(event: ReactDragEvent<HTMLDivElement>, targetLayerId: string) {
    event.preventDefault();
    const sourceId = draggingLayerId || event.dataTransfer.getData("text/plain");
    const sourceLayer = stack.find((layer) => layer.id === sourceId);
    if (!sourceLayer || sourceId === targetLayerId) {
      setDraggingLayerId("");
      setDropTarget(null);
      return;
    }
    const next = stack.filter((layer) => layer.id !== sourceId);
    const targetIndex = next.findIndex((layer) => layer.id === targetLayerId);
    if (targetIndex < 0) return;
    const edge = dropTarget?.layerId === targetLayerId ? dropTarget.edge : "before";
    next.splice(targetIndex + (edge === "after" ? 1 : 0), 0, sourceLayer);
    commitStack(next);
    setDraggingLayerId("");
    setDropTarget(null);
  }

  async function mergeActiveLayer() {
    if (!activeLayer || !mergeTarget || mergeDisabledReason || mergingLayerId) return;
    setMergingLayerId(activeLayer.id);
    try {
      if (await onMergeLayer(activeLayer.id, mergeTarget.id)) {
        onSelectLayer(mergeTarget.id);
      }
    } finally {
      setMergingLayerId("");
    }
  }

  return (
    <section aria-busy={Boolean(mergingLayerId)} aria-label="地图图层栏" className="map-layer-palette">
      <header>
        <div className="map-layer-palette-title">
          <Layers3 size={17} />
          <span>
            <strong>图层</strong>
            <small>
              {selectedImageLayers.length > 1
                ? `${selectedImageLayers.length} 个已选`
                : `${layers.filter((layer) => layer.visible && !hiddenLayerIds.has(layer.id)).length}/${layers.length} 可见`}
            </small>
          </span>
        </div>
        <div className="map-layer-palette-header-actions">
          <button aria-label="导入图片为新图层" disabled={Boolean(mergingLayerId)} title="导入图片为新图层" type="button" onClick={onAddImageLayer}>
            <ImagePlus size={16} />
          </button>
          <button aria-label="新建空图层" disabled={Boolean(mergingLayerId)} title="新建空图层" type="button" onClick={onCreateLayer}>
            <Plus size={16} />
          </button>
        </div>
        {selectedImageLayers.length > 1 ? (
          <div aria-label="图片图层排列" className="map-layer-arrange-toolbar" role="toolbar">
            <button aria-label="左对齐图片图层" disabled={editableSelectedImageLayers.length < 2} title="左对齐" type="button" onClick={() => onArrangeSelection("align-left")}><AlignStartVertical size={15} /></button>
            <button aria-label="水平居中对齐图片图层" disabled={editableSelectedImageLayers.length < 2} title="水平居中" type="button" onClick={() => onArrangeSelection("align-center-x")}><AlignCenterVertical size={15} /></button>
            <button aria-label="右对齐图片图层" disabled={editableSelectedImageLayers.length < 2} title="右对齐" type="button" onClick={() => onArrangeSelection("align-right")}><AlignEndVertical size={15} /></button>
            <button aria-label="顶对齐图片图层" disabled={editableSelectedImageLayers.length < 2} title="顶对齐" type="button" onClick={() => onArrangeSelection("align-top")}><AlignStartHorizontal size={15} /></button>
            <button aria-label="垂直居中对齐图片图层" disabled={editableSelectedImageLayers.length < 2} title="垂直居中" type="button" onClick={() => onArrangeSelection("align-center-y")}><AlignCenterHorizontal size={15} /></button>
            <button aria-label="底对齐图片图层" disabled={editableSelectedImageLayers.length < 2} title="底对齐" type="button" onClick={() => onArrangeSelection("align-bottom")}><AlignEndHorizontal size={15} /></button>
            <button aria-label="水平等距分布图片图层" disabled={editableSelectedImageLayers.length < 3} title="水平等距分布" type="button" onClick={() => onArrangeSelection("distribute-x")}><AlignHorizontalDistributeCenter size={15} /></button>
            <button aria-label="垂直等距分布图片图层" disabled={editableSelectedImageLayers.length < 3} title="垂直等距分布" type="button" onClick={() => onArrangeSelection("distribute-y")}><AlignVerticalDistributeCenter size={15} /></button>
            <button aria-label="水平翻转图片图层" disabled={!editableSelectedImageLayers.length} title="水平翻转" type="button" onClick={() => onArrangeSelection("flip-x")}><FlipHorizontal2 size={15} /></button>
            <button aria-label="垂直翻转图片图层" disabled={!editableSelectedImageLayers.length} title="垂直翻转" type="button" onClick={() => onArrangeSelection("flip-y")}><FlipVertical2 size={15} /></button>
          </div>
        ) : null}
      </header>
      <div aria-label="图层堆栈" className="map-layer-palette-stack" ref={stackRef} role="list" onDragOver={handleStackDragOver}>
            {stack.map((layer) => {
              const phaseHidden = hiddenLayerIds.has(layer.id);
              const dropEdge = dropTarget?.layerId === layer.id ? dropTarget.edge : "";
              const imageGroupNumber = imageGroupNumbers.get(layer.imageGroupId);
              return (
                <div
                  className={`map-layer-palette-row ${activeLayer?.id === layer.id ? "is-active" : ""} ${selectedLayerSet.has(layer.id) ? "is-selected" : ""} ${imageGroupNumber ? "is-grouped" : ""} ${!layer.visible || phaseHidden ? "is-hidden" : ""} ${draggingLayerId === layer.id ? "is-dragging" : ""} ${dropEdge ? `is-drop-${dropEdge}` : ""}`}
                  data-map-layer-row-id={layer.id}
                  draggable={!mergingLayerId}
                  key={layer.id}
                  role="listitem"
                  title="拖动整行调整图层层级"
                  onDragEnd={() => {
                    setDraggingLayerId("");
                    setDropTarget(null);
                  }}
                  onDragOver={(event) => handleLayerDragOver(event, layer.id)}
                  onDragStart={(event) => {
                    if (mergingLayerId) {
                      event.preventDefault();
                      return;
                    }
                    setDraggingLayerId(layer.id);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", layer.id);
                  }}
                  onDrop={(event) => handleLayerDrop(event, layer.id)}
                >
                  <span
                    aria-hidden="true"
                    className="map-layer-drag-handle"
                  >
                    <GripVertical size={15} />
                  </span>
                  <button
                    aria-label={`${layer.visible ? "隐藏" : "显示"}图层 ${layer.title}`}
                    className="map-layer-quick-toggle"
                    disabled={Boolean(mergingLayerId)}
                    title={layer.visible ? "隐藏图层" : "显示图层"}
                    type="button"
                    onClick={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
                  >
                    {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    aria-current={activeLayer?.id === layer.id ? "true" : undefined}
                    aria-label={`选择图层 ${layer.title}`}
                    aria-pressed={selectedLayerSet.has(layer.id)}
                    className="map-layer-palette-select"
                    disabled={Boolean(mergingLayerId)}
                    type="button"
                    onClick={(event) => onSelectLayer(
                      layer.id,
                      event.shiftKey || event.ctrlKey || event.metaKey
                    )}
                  >
                    <span className="map-layer-palette-thumbnail" style={{ borderColor: layer.color }}>
                      {layer.imageUrl ? <img alt="" draggable={false} src={layer.imageUrl} /> : <Layers3 size={17} />}
                    </span>
                    <span>
                      <strong>{layer.title}</strong>
                      <small>
                        {phaseHidden
                          ? "本阶段隐藏"
                          : !layer.visible
                            ? "已隐藏"
                            : `${imageGroupNumber ? `组合 ${imageGroupNumber} · ` : ""}${layerMarkerCounts[layer.id] ?? 0} 标记 · ${layer.imageUrl ? `${Math.round(layer.imageOpacity * 100)}%` : "空图层"}`}
                      </small>
                    </span>
                  </button>
                  <button
                    aria-label={`${layer.locked ? "解锁" : "锁定"}图层 ${layer.title}`}
                    className="map-layer-quick-toggle"
                    disabled={Boolean(mergingLayerId)}
                    title={layer.locked ? "解锁图层" : "锁定图层"}
                    type="button"
                    onClick={() => onUpdateLayer(layer.id, { locked: !layer.locked })}
                  >
                    {layer.locked ? <Lock size={15} /> : <Unlock size={15} />}
                  </button>
                </div>
              );
            })}
            <div className={`map-layer-palette-row is-base ${!activeLayer ? "is-active" : ""}`} role="listitem">
              <span aria-hidden="true" className="map-layer-drag-spacer"><GripVertical size={15} /></span>
              <span aria-hidden="true" className="map-layer-fixed-toggle"><Eye size={16} /></span>
              <button className="map-layer-palette-select" type="button" onClick={onOpenMapSettings}>
                <span className="map-layer-palette-thumbnail is-base">
                  {map.imageUrl ? <img alt="" draggable={false} src={map.imageUrl} /> : <Map size={17} />}
                </span>
                <span><strong>地图底图</strong><small>固定背景 · 点击编辑</small></span>
              </button>
              <span aria-label="底图已锁定" className="map-layer-fixed-toggle" title="底图固定在最底层"><Lock size={15} /></span>
            </div>
      </div>

      <footer aria-label="图层快捷操作">
        <button aria-label="图层上移" disabled={Boolean(mergingLayerId) || !activeLayer || activeStackIndex <= 0} title="上移一层" type="button" onClick={() => activeLayer && moveLayer(activeLayer.id, "up")}><ArrowUp size={16} /></button>
        <button aria-label="图层下移" disabled={Boolean(mergingLayerId) || !activeLayer || activeStackIndex < 0 || activeStackIndex >= stack.length - 1} title="下移一层" type="button" onClick={() => activeLayer && moveLayer(activeLayer.id, "down")}><ArrowDown size={16} /></button>
        <button aria-label="复制当前图层" disabled={Boolean(mergingLayerId) || !activeLayer} title="复制图层" type="button" onClick={() => activeLayer && onDuplicateLayer(activeLayer.id)}><Copy size={16} /></button>
        <button
          aria-label={selectedGroupIds.size ? "取消图片图层组合" : "组合选中的图片图层"}
          disabled={Boolean(mergingLayerId) || (!selectedGroupIds.size && selectedImageLayers.length < 2)}
          title={selectedGroupIds.size ? "取消组合" : "将所选图层组合"}
          type="button"
          onClick={selectedGroupIds.size ? onUngroupSelection : onGroupSelection}
        >{selectedGroupIds.size ? <Ungroup size={16} /> : <Group size={16} />}</button>
        <button aria-label={isTransformingActiveLayer ? selectedImageLayers.length > 1 ? `完成 ${selectedImageLayers.length} 个图片图层自由变换` : "完成当前图层自由变换" : selectedImageLayers.length > 1 ? `自由变换 ${selectedImageLayers.length} 个图片图层` : "自由变换当前图层"} aria-pressed={isTransformingActiveLayer} className={isTransformingActiveLayer ? "is-active" : ""} disabled={Boolean(mergingLayerId) || (!isTransformingActiveLayer && Boolean(transformDisabledReason))} title={isTransformingActiveLayer ? "完成自由变换" : transformDisabledReason || "自由变换"} type="button" onClick={() => activeLayer && onToggleTransform(activeLayer.id)}>{isTransformingActiveLayer ? <Check size={16} /> : <Scaling size={16} />}</button>
        <button aria-label="向下合并图层" disabled={Boolean(mergingLayerId) || Boolean(mergeDisabledReason)} title={mergingLayerId ? "正在合并图层" : mergeDisabledReason || `合并到“${mergeTarget?.title}”`} type="button" onClick={() => void mergeActiveLayer()}>{mergingLayerId ? <LoaderCircle className="is-spinning" size={16} /> : <Combine size={16} />}</button>
        <button aria-label="编辑当前图层属性" disabled={Boolean(mergingLayerId) || !activeLayer} title="打开图层属性" type="button" onClick={onEditProperties}><SlidersHorizontal size={16} /></button>
        <button aria-label="删除当前图层" className="is-danger" disabled={Boolean(mergingLayerId) || !canDeleteActive} title={canDeleteActive ? "删除图层" : "默认图层不能删除"} type="button" onClick={() => activeLayer && onDeleteLayer(activeLayer.id)}><Trash2 size={16} /></button>
      </footer>
    </section>
  );
}

function MapLayerImageInspector({
  imageTransformMode,
  layer,
  onChooseImage,
  onRemoveImage,
  onToggleImageTransform,
  onUpdate
}: {
  imageTransformMode: boolean;
  layer: MapLayer;
  onChooseImage: () => void;
  onRemoveImage: () => void;
  onToggleImageTransform: () => void;
  onUpdate: (patch: Partial<MapLayer>) => void;
}) {
  const updateTransform = (patch: Partial<MapImageTransform>) => onUpdate({
    imageTransform: normalizeMapImageTransform({ ...layer.imageTransform, ...patch })
  });
  return (
    <section aria-label="图片图层设置" className="map-layer-image-settings">
      <header>
        <span><ImageIcon size={16} /><strong>图片图层</strong></span>
        {layer.imageUrl ? (
          <button aria-label="移除图层图片" title="移除图层图片" type="button" onClick={onRemoveImage}>
            <Trash2 size={16} />
          </button>
        ) : null}
      </header>
      {!layer.imageUrl ? (
        <button className="planning-file-action" type="button" onClick={onChooseImage}>
          <Upload size={17} /><span>添加图层图片</span>
        </button>
      ) : (
        <>
          <div className="map-layer-image-overview">
            <div className="map-image-preview">
              <img
                alt={`${layer.title} 图片预览`}
                draggable={false}
                src={layer.imageUrl}
                style={{
                  ...getMapImageTransformStyle(layer.imageTransform),
                  mixBlendMode: layer.imageBlendMode,
                  opacity: layer.imageOpacity
                }}
              />
            </div>
            <div>
              <button className="planning-file-action" type="button" onClick={onChooseImage}>
                <Upload size={16} /><span>更换图片</span>
              </button>
              <button
                aria-pressed={imageTransformMode}
                className={`map-image-canvas-action ${imageTransformMode ? "is-active" : ""}`}
                type="button"
                onClick={onToggleImageTransform}
              >
                <Move size={16} /><span>{imageTransformMode ? "完成画布调整" : "在画布上调整"}</span>
              </button>
            </div>
          </div>
          <PlanningField label="混合模式">
            <select
              aria-label="图层图片混合模式"
              value={layer.imageBlendMode}
              onChange={(event) => onUpdate({ imageBlendMode: event.target.value as MapLayerImageBlendMode })}
            >
              {Object.entries(mapLayerImageBlendModeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </PlanningField>
          <PlanningField label="图片透明度">
            <div className="map-region-opacity-control">
              <input
                aria-label="图层图片透明度"
                max={1}
                min={0.05}
                step={0.01}
                type="range"
                value={layer.imageOpacity}
                onChange={(event) => onUpdate({ imageOpacity: Number(event.target.value) })}
              />
              <output>{Math.round(layer.imageOpacity * 100)}%</output>
            </div>
          </PlanningField>
          <div className="map-image-transform-quick-actions" role="group" aria-label="图层图片快捷变换">
            <button aria-label="图层图片居中" title="图层图片居中" type="button" onClick={() => updateTransform({ x: 0, y: 0 })}>
              <LocateFixed size={16} />
            </button>
            <button aria-label="图层图片向左旋转 90 度" title="向左旋转 90 度" type="button" onClick={() => updateTransform({ rotation: layer.imageTransform.rotation - 90 })}>
              <RotateCcw size={16} />
            </button>
            <button aria-label="图层图片向右旋转 90 度" title="向右旋转 90 度" type="button" onClick={() => updateTransform({ rotation: layer.imageTransform.rotation + 90 })}>
              <RotateCw size={16} />
            </button>
            <button aria-label="水平翻转图层图片" aria-pressed={layer.imageTransform.flipX} className={layer.imageTransform.flipX ? "is-active" : ""} title="水平翻转" type="button" onClick={() => updateTransform({ flipX: !layer.imageTransform.flipX })}>
              <FlipHorizontal2 size={16} />
            </button>
            <button aria-label="垂直翻转图层图片" aria-pressed={layer.imageTransform.flipY} className={layer.imageTransform.flipY ? "is-active" : ""} title="垂直翻转" type="button" onClick={() => updateTransform({ flipY: !layer.imageTransform.flipY })}>
              <FlipVertical2 size={16} />
            </button>
          </div>
          <div className="planning-field-grid">
            <PlanningField label="水平位置 (%)">
              <input aria-label="图层图片横向位置" max={MAP_CANVAS_COORDINATE_LIMIT} min={-MAP_CANVAS_COORDINATE_LIMIT} step={0.1} type="number" value={layer.imageTransform.x} onChange={(event) => updateTransform({ x: Number(event.target.value) })} />
            </PlanningField>
            <PlanningField label="垂直位置 (%)">
              <input aria-label="图层图片纵向位置" max={MAP_CANVAS_COORDINATE_LIMIT} min={-MAP_CANVAS_COORDINATE_LIMIT} step={0.1} type="number" value={layer.imageTransform.y} onChange={(event) => updateTransform({ y: Number(event.target.value) })} />
            </PlanningField>
          </div>
          <PlanningField label="图片大小">
            <div className="map-image-transform-value">
              <input aria-label="图层图片缩放滑杆" max={5000} min={1} step={1} type="range" value={layer.imageTransform.scale * 100} onChange={(event) => updateTransform({ scale: Number(event.target.value) / 100 })} />
              <label><input aria-label="图层图片缩放比例" max={100000} min={1} step={0.1} type="number" value={Math.round(layer.imageTransform.scale * 1000) / 10} onChange={(event) => updateTransform({ scale: Number(event.target.value) / 100 })} /><span>%</span></label>
            </div>
          </PlanningField>
          <PlanningField label="旋转角度">
            <div className="map-image-transform-value">
              <input aria-label="图层图片旋转滑杆" max={180} min={-180} step={1} type="range" value={layer.imageTransform.rotation} onChange={(event) => updateTransform({ rotation: Number(event.target.value) })} />
              <label><input aria-label="图层图片旋转角度" step={0.1} type="number" value={layer.imageTransform.rotation} onChange={(event) => updateTransform({ rotation: Number(event.target.value) })} /><span>°</span></label>
            </div>
          </PlanningField>
        </>
      )}
    </section>
  );
}

function MapStructureInspector({
  canDelete,
  imageTransformMode = false,
  item,
  kind,
  markerCount,
  onChooseImage,
  onDelete,
  onPhaseVisibleChange,
  onRemoveImage,
  onToggleImageTransform,
  phase,
  phaseVisible,
  onUpdate
}: {
  canDelete: boolean;
  imageTransformMode?: boolean;
  item: MapLayer | MapMarkerGroup;
  kind: "layer" | "group";
  markerCount: number;
  onChooseImage?: () => void;
  onDelete: () => void | Promise<void>;
  onPhaseVisibleChange: (visible: boolean) => void;
  onRemoveImage?: () => void;
  onToggleImageTransform?: () => void;
  phase: MapStoryPhase | null;
  phaseVisible: boolean;
  onUpdate: (patch: Partial<MapLayer>) => void;
}) {
  const isLayer = kind === "layer";
  const Icon = isLayer ? Layers3 : FolderTree;
  return (
    <>
      <InspectorHeading
        icon={Icon}
        title={item.title}
        subtitle={`${isLayer ? "地图图层" : "标记组"} · ${markerCount} 个标记`}
      />
      <PhaseVisibilityControl phase={phase} visible={phaseVisible} onChange={onPhaseVisibleChange} />
      {isLayer && onChooseImage && onRemoveImage && onToggleImageTransform ? (
        <MapLayerImageInspector
          imageTransformMode={imageTransformMode}
          layer={item as MapLayer}
          onChooseImage={onChooseImage}
          onRemoveImage={onRemoveImage}
          onToggleImageTransform={onToggleImageTransform}
          onUpdate={onUpdate}
        />
      ) : null}
      <PlanningField label={isLayer ? "图层名称" : "分组名称"}>
        <input aria-label={isLayer ? "图层名称" : "分组名称"} value={item.title} onChange={(event) => onUpdate({ title: event.target.value })} />
      </PlanningField>
      <PlanningField label="说明">
        <textarea aria-label={isLayer ? "图层说明" : "分组说明"} rows={3} value={item.description} onChange={(event) => onUpdate({ description: event.target.value })} />
      </PlanningField>
      <PlanningField label="排列顺序">
        <input aria-label={isLayer ? "图层顺序" : "分组顺序"} type="number" value={item.order} onChange={(event) => onUpdate({ order: Number(event.target.value) })} />
      </PlanningField>
      <PlanningField label="识别颜色">
        <div className="planning-color-swatches" role="radiogroup" aria-label={isLayer ? "图层颜色" : "分组颜色"}>
          {planningColors.map((color) => (
            <button aria-label={`选择颜色 ${color}`} aria-checked={item.color === color} className={item.color === color ? "is-active" : ""} key={color} role="radio" style={{ background: color }} title={color} type="button" onClick={() => onUpdate({ color })}>
              {item.color === color ? <Check size={13} /> : null}
            </button>
          ))}
        </div>
      </PlanningField>
      <div className="planning-structure-toggles">
        <label>
          <input checked={item.visible} type="checkbox" onChange={(event) => onUpdate({ visible: event.target.checked })} />
          {item.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          <span>在地图上显示</span>
        </label>
        <label>
          <input checked={item.locked} type="checkbox" onChange={(event) => onUpdate({ locked: event.target.checked })} />
          {item.locked ? <Lock size={16} /> : <Unlock size={16} />}
          <span>锁定其中标记</span>
        </label>
      </div>
      <button className="planning-danger-action" disabled={!canDelete} title={!canDelete && isLayer ? "默认图层不能删除" : undefined} type="button" onClick={() => void onDelete()}>
        <Trash2 size={17} />
        <span>删除{isLayer ? "图层" : "分组"}</span>
      </button>
    </>
  );
}

function MarkerInspector({
  creatableReferenceKinds,
  editable,
  groups,
  layers,
  linkedMaps,
  marker,
  phase,
  phaseVisible,
  onDelete,
  onCreateChildMap,
  onChooseIcon,
  onCreateReference,
  onOpenReference,
  onOpenTimeline,
  onRemoveIcon,
  onPhaseVisibleChange,
  onSelectMap,
  onUpdate,
  referenceOptions,
  relatedEvents,
}: {
  creatableReferenceKinds: ProjectObjectKind[];
  editable: boolean;
  groups: MapMarkerGroup[];
  layers: MapLayer[];
  linkedMaps: WorldMap[];
  marker: MapMarker;
  phase: MapStoryPhase | null;
  phaseVisible: boolean;
  onDelete: () => void | Promise<void>;
  onCreateChildMap: () => void;
  onChooseIcon: () => void;
  onCreateReference: (kind: ProjectObjectKind) => void;
  onOpenReference: (reference: ProjectObjectRef) => void;
  onOpenTimeline: (id: string) => void;
  onRemoveIcon: () => void;
  onPhaseVisibleChange: (visible: boolean) => void;
  onSelectMap: (mapId: string) => void;
  onUpdate: (patch: Partial<MapMarker>) => void;
  referenceOptions: ProjectReferenceOption[];
  relatedEvents: TimelineEvent[];
}) {
  function updateReferences(references: ProjectObjectRef[]) {
    onUpdate({
      references,
      entityId: references.find((reference) => reference.kind === "entity")?.id ?? "",
      questId: references.find((reference) => reference.kind === "quest")?.id ?? "",
      sceneId: references.find((reference) => reference.kind === "scene")?.id ?? ""
    });
  }

  return (
    <>
      <InspectorHeading icon={MapPin} title={marker.label} subtitle={markerKindMeta[marker.markerType].label} />
      {!editable ? <div className="planning-lock-notice"><Lock size={15} /><span>所在图层或标记组已锁定；可以查看关联，但不能修改标记。</span></div> : null}
      <PhaseVisibilityControl phase={phase} visible={phaseVisible} onChange={onPhaseVisibleChange} />
      <MapLabelPlacementControl
        disabled={!editable}
        placement={marker.labelPlacement}
        onChange={(labelPlacement) => onUpdate({ labelPlacement })}
      />
      <section aria-label="标记子地图" className="map-marker-child-maps">
        <header>
          <span><FolderTree size={16} /><strong>下级地图</strong><small>{linkedMaps.length}</small></span>
          <button
            aria-label="从此标记创建子地图"
            title="从此标记创建子地图"
            type="button"
            onClick={onCreateChildMap}
          >
            <FolderPlus size={16} />
          </button>
        </header>
        {linkedMaps.map((mapItem) => (
          <button className="map-marker-child-link" key={mapItem.id} type="button" onClick={() => onSelectMap(mapItem.id)}>
            <Map size={15} /><span>{mapItem.title}</span><ChevronRight size={14} />
          </button>
        ))}
        {!linkedMaps.length ? <p>可将城市、建筑或关卡详图挂在这个标记下。</p> : null}
      </section>
      <PlanningField label="标记名称"><input aria-label="标记名称" disabled={!editable} value={marker.label} onChange={(event) => onUpdate({ label: event.target.value })} /></PlanningField>
      <PlanningField label="标记类型">
        <select aria-label="标记类型" disabled={!editable} value={marker.markerType} onChange={(event) => onUpdate({ markerType: event.target.value as MapMarkerKind })}>
          {mapMarkerKinds.map((kind) => <option key={kind} value={kind}>{markerKindMeta[kind].label}</option>)}
        </select>
      </PlanningField>
      <PlanningField label="自定义图标">
        <div className="map-marker-icon-control">
          <span style={{ background: marker.color }}>
            {marker.iconUrl
              ? <img alt="" src={marker.iconUrl} />
              : (() => {
                  const Icon = markerKindMeta[marker.markerType].icon;
                  return <Icon size={18} />;
                })()}
          </span>
          <button disabled={!editable} type="button" onClick={onChooseIcon}>
            <Upload size={15} /><span>{marker.iconUrl ? "更换图片" : "选择图片"}</span>
          </button>
          <button
            aria-label="移除自定义标记图标"
            disabled={!editable || !marker.iconUrl}
            title="移除自定义图标"
            type="button"
            onClick={onRemoveIcon}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </PlanningField>
      <div className="planning-field-grid">
        <PlanningField label="所在图层">
          <select aria-label="标记所在图层" disabled={!editable} value={marker.layerId} onChange={(event) => onUpdate({ layerId: event.target.value })}>
            {layers.map((layer) => <option key={layer.id} value={layer.id}>{layer.title}</option>)}
          </select>
        </PlanningField>
        <PlanningField label="标记组">
          <select aria-label="标记所在分组" disabled={!editable} value={marker.groupId} onChange={(event) => onUpdate({ groupId: event.target.value })}>
            <option value="">未分组</option>
            {groups.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}
          </select>
        </PlanningField>
      </div>
      <PlanningField label="颜色">
        <div className="planning-color-swatches" role="radiogroup" aria-label="标记颜色">
          {planningColors.map((color) => (
            <button aria-label={`选择颜色 ${color}`} aria-checked={marker.color === color} className={marker.color === color ? "is-active" : ""} disabled={!editable} key={color} role="radio" style={{ background: color }} title={color} type="button" onClick={() => onUpdate({ color })}>
              {marker.color === color ? <Check size={13} /> : null}
            </button>
          ))}
        </div>
      </PlanningField>
      <PlanningField label="说明"><textarea aria-label="标记说明" disabled={!editable} rows={4} value={marker.description} onChange={(event) => onUpdate({ description: event.target.value })} /></PlanningField>
      <div className="planning-field-grid">
        <PlanningField label="横坐标 %"><input aria-label="标记横坐标" disabled={!editable} type="number" min={-MAP_CANVAS_COORDINATE_LIMIT} max={MAP_CANVAS_COORDINATE_LIMIT} step={0.1} value={marker.x} onChange={(event) => onUpdate({ x: Number(event.target.value) })} /></PlanningField>
        <PlanningField label="纵坐标 %"><input aria-label="标记纵坐标" disabled={!editable} type="number" min={-MAP_CANVAS_COORDINATE_LIMIT} max={MAP_CANVAS_COORDINATE_LIMIT} step={0.1} value={marker.y} onChange={(event) => onUpdate({ y: Number(event.target.value) })} /></PlanningField>
      </div>
      <div
        data-reference-path="references"
        data-reference-source-id={marker.id}
        data-reference-source-kind="map-marker"
      >
        <ProjectReferencePicker
          creatableKinds={creatableReferenceKinds}
          disabled={!editable}
          onChange={updateReferences}
          onCreate={onCreateReference}
          onOpenReference={onOpenReference}
          options={referenceOptions.filter(
            (option) =>
              option.reference.kind !== "map-marker" || option.reference.id !== marker.id
          )}
          value={marker.references}
        />
      </div>
      <div className="planning-reference-section">
        <div><strong>相关时间点</strong><span>{relatedEvents.length}</span></div>
        {relatedEvents.map((event) => (
          <button key={event.id} type="button" onClick={() => onOpenTimeline(event.id)}>
            <ClockLabel event={event} />
          </button>
        ))}
        {!relatedEvents.length ? <p className="muted-text">暂无相关时间点</p> : null}
      </div>
      <button className="planning-danger-action" disabled={!editable} type="button" onClick={() => void onDelete()}><Trash2 size={17} /><span>删除标记</span></button>
    </>
  );
}

function RouteInspector({
  creatableReferenceKinds,
  map,
  markers,
  nextStopMarkerId,
  phase,
  phaseVisible,
  referenceOptions,
  onAddStop,
  onAddWaypoint,
  onCreateReference,
  onDelete,
  onMoveStop,
  onNextStopChange,
  onOpenReference,
  onPhaseVisibleChange,
  onRemoveStop,
  onUpdate,
  onUpdateStop,
  route
}: {
  creatableReferenceKinds: ProjectObjectKind[];
  map: WorldMap;
  markers: MapMarker[];
  nextStopMarkerId: string;
  phase: MapStoryPhase | null;
  phaseVisible: boolean;
  referenceOptions: ProjectReferenceOption[];
  onAddStop: () => void;
  onAddWaypoint: (afterStopId: string) => void;
  onCreateReference: (kind: ProjectObjectKind) => void;
  onDelete: () => void | Promise<void>;
  onMoveStop: (stopId: string, direction: -1 | 1) => void;
  onNextStopChange: (id: string) => void;
  onOpenReference: (reference: ProjectObjectRef) => void;
  onPhaseVisibleChange: (visible: boolean) => void;
  onRemoveStop: (stopId: string) => void;
  onUpdate: (patch: Partial<MapRoute>) => void;
  onUpdateStop: (stopId: string, patch: Partial<MapRoute["stops"][number]>) => void;
  route: MapRoute;
}) {
  const metrics = calculateMapRouteMetrics(route, markers, map);
  return (
    <>
      <InspectorHeading icon={GitBranch} title={route.title} subtitle={`${route.stops.length} 个停靠点 · ${route.waypoints.length} 个控制点 · ${mapTravelModeLabels[route.travelMode]}`} />
      <PhaseVisibilityControl phase={phase} visible={phaseVisible} onChange={onPhaseVisibleChange} />
      <div className="map-route-metrics">
        <span><strong>{formatMapDistance(metrics.distance, map)}</strong><small>路线距离</small></span>
        <span><strong>{formatMapTravelTime(metrics.travelHours, route.travelHoursPerDay)}</strong><small>预计耗时</small></span>
        <span><strong>{route.travelSpeed} {getMapDistanceUnitLabel(map)}/时</strong><small>行进速度</small></span>
      </div>
      <PlanningField label="路线名称"><input aria-label="路线名称" value={route.title} onChange={(event) => onUpdate({ title: event.target.value })} /></PlanningField>
      <div className="planning-field-grid">
        <PlanningField label="状态"><select aria-label="路线状态" value={route.status} onChange={(event) => onUpdate({ status: event.target.value as MapRoute["status"] })}>{Object.entries(routeStatusMeta).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></PlanningField>
        <PlanningField label="行进方式">
          <select aria-label="路线行进方式" value={route.travelMode} onChange={(event) => onUpdate({ travelMode: event.target.value as MapTravelMode })}>
            {mapTravelModes.map((mode) => <option key={mode} value={mode}>{mapTravelModeLabels[mode]}</option>)}
          </select>
        </PlanningField>
      </div>
      <div className="planning-field-grid">
        <PlanningField label={`速度（${getMapDistanceUnitLabel(map)}/时）`}>
          <input aria-label="路线行进速度" min={0.01} step={0.1} type="number" value={route.travelSpeed} onChange={(event) => onUpdate({ travelSpeed: Number(event.target.value) })} />
        </PlanningField>
        <PlanningField label="每日行进时长">
          <input aria-label="路线每日行进时长" max={24} min={1} step={0.5} type="number" value={route.travelHoursPerDay} onChange={(event) => onUpdate({ travelHoursPerDay: Number(event.target.value) })} />
        </PlanningField>
      </div>
      <PlanningField label="路径形态">
        <div className="map-route-curve-switch" role="group" aria-label="路线曲线模式">
          <button
            aria-pressed={route.curveMode === "straight"}
            className={route.curveMode === "straight" ? "is-active" : ""}
            type="button"
            onClick={() => onUpdate({ curveMode: "straight" })}
          >
            折线路径
          </button>
          <button
            aria-pressed={route.curveMode === "smooth"}
            className={route.curveMode === "smooth" ? "is-active" : ""}
            type="button"
            onClick={() => onUpdate({ curveMode: "smooth" })}
          >
            平滑曲线
          </button>
        </div>
      </PlanningField>
      <PlanningField label="颜色"><div className="planning-color-swatches" role="radiogroup" aria-label="路线颜色">{planningColors.map((color) => <button aria-label={`选择颜色 ${color}`} aria-checked={route.color === color} className={route.color === color ? "is-active" : ""} key={color} role="radio" style={{ background: color }} title={color} type="button" onClick={() => onUpdate({ color })}>{route.color === color ? <Check size={13} /> : null}</button>)}</div></PlanningField>
      <PlanningField label="路线说明"><textarea aria-label="路线说明" rows={3} value={route.description} onChange={(event) => onUpdate({ description: event.target.value })} /></PlanningField>
      <div
        data-reference-path="references"
        data-reference-source-id={route.id}
        data-reference-source-kind="map-route"
      >
        <ProjectReferencePicker
          creatableKinds={creatableReferenceKinds}
          onChange={(references) => onUpdate({ references })}
          onCreate={onCreateReference}
          onOpenReference={onOpenReference}
          options={referenceOptions.filter(
            (option) => option.reference.kind !== "map-route" || option.reference.id !== route.id
          )}
          value={route.references}
        />
      </div>
      <div className="planning-stop-adder"><select aria-label="新增停靠标记" value={nextStopMarkerId} onChange={(event) => onNextStopChange(event.target.value)}><option value="">选择地图标记</option>{markers.map((marker) => <option key={marker.id} value={marker.id}>{marker.label}</option>)}</select><button aria-label="添加停靠点" disabled={!nextStopMarkerId} title="添加停靠点" type="button" onClick={onAddStop}><Plus size={16} /></button></div>
      <div className="planning-stop-list">
        {route.stops.map((stop, index) => {
          const marker = markers.find((item) => item.id === stop.markerId);
          const segment = metrics.segments.find((item) => item.toStopId === stop.id);
          return (
            <div
              key={stop.id}
              data-reference-path={`stops[${index}].markerId`}
              data-reference-source-id={route.id}
              data-reference-source-kind="map-route"
            >
              {segment ? (
                <div className="map-route-segment">
                  <RouteIcon size={15} />
                  <span><strong>{formatMapDistance(segment.distance, map)}</strong><small>{formatMapTravelTime(segment.travelHours, route.travelHoursPerDay)}</small></span>
                  <button
                    aria-label={`在路段 ${index} 添加路线控制点`}
                    title="添加控制点"
                    type="button"
                    onClick={() => onAddWaypoint(route.stops[index - 1].id)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ) : null}
              <div className="planning-stop-heading"><span>{index + 1}</span><strong>{marker?.label ?? "失效标记"}</strong><div><button aria-label="上移停靠点" disabled={index === 0} title="上移停靠点" type="button" onClick={() => onMoveStop(stop.id, -1)}><ArrowUp size={14} /></button><button aria-label="下移停靠点" disabled={index === route.stops.length - 1} title="下移停靠点" type="button" onClick={() => onMoveStop(stop.id, 1)}><ArrowDown size={14} /></button><button aria-label="删除停靠点" title="删除停靠点" type="button" onClick={() => onRemoveStop(stop.id)}><Trash2 size={14} /></button></div></div>
              <input aria-label={`停靠点 ${index + 1} 名称`} value={stop.title} onChange={(event) => onUpdateStop(stop.id, { title: event.target.value })} />
              <input aria-label={`停靠点 ${index + 1} 阶段`} placeholder="阶段或耗时" value={stop.duration} onChange={(event) => onUpdateStop(stop.id, { duration: event.target.value })} />
              <textarea aria-label={`停靠点 ${index + 1} 说明`} rows={2} placeholder="阶段说明" value={stop.notes} onChange={(event) => onUpdateStop(stop.id, { notes: event.target.value })} />
            </div>
          );
        })}
        {!route.stops.length ? <p className="muted-text">暂无停靠点</p> : null}
      </div>
      <button className="planning-danger-action" type="button" onClick={() => void onDelete()}><Trash2 size={17} /><span>删除路线</span></button>
    </>
  );
}

function PhaseVisibilityControl({
  onChange,
  phase,
  visible
}: {
  onChange: (visible: boolean) => void;
  phase: MapStoryPhase | null;
  visible: boolean;
}) {
  if (!phase) return null;
  return (
    <label className="map-phase-visibility-control">
      <input
        aria-label={`在“${phase.title}”阶段显示`}
        checked={visible}
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      {visible ? <Eye size={17} /> : <EyeOff size={17} />}
      <span><strong>{visible ? "本阶段显示" : "本阶段隐藏"}</strong><small>{phase.title}</small></span>
    </label>
  );
}

function InspectorHeading({ icon: Icon, subtitle, title }: { icon: typeof MapPin; subtitle: string; title: string }) {
  return <div className="planning-inspector-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><Icon size={20} /></div>;
}

function PlanningField({ children, label }: { children: ReactNode; label: string }) {
  return <label className="planning-field"><span>{label}</span>{children}</label>;
}

function ClockLabel({ event }: { event: TimelineEvent }) {
  return <><CalendarClock size={15} /><span><strong>{event.displayDate}</strong><small>{event.title || "未命名时间点"}</small></span></>;
}
