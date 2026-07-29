import {
  normalizeProjectObjectRefs,
  projectObjectRefKey,
  type ProjectObjectKind,
  type ProjectObjectRef
} from "./project-references";

export type MapMarkerKind =
  | "character"
  | "location"
  | "faction"
  | "event"
  | "item"
  | "note"
  | "quest"
  | "scene"
  | "custom";

export type MapRegionKind =
  | "territory"
  | "district"
  | "biome"
  | "danger"
  | "quest"
  | "custom";

export type MapRegionPoint = {
  x: number;
  y: number;
};

export type MapLabelPlacement = {
  offsetX: number;
  offsetY: number;
  locked: boolean;
  minZoom: number;
};

export type MapViewportBounds = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

export type MapLabelCandidate = {
  id: string;
  kind: "marker" | "region";
  label: string;
  minimumZoom?: number;
  pinned?: boolean;
  priority?: number;
  selected?: boolean;
  x: number;
  y: number;
};

export type MapLabelLayout = {
  markerIds: Set<string>;
  regionIds: Set<string>;
};

export type MapRegion = {
  id: string;
  title: string;
  description: string;
  kind: MapRegionKind;
  color: string;
  opacity: number;
  order: number;
  visible: boolean;
  locked: boolean;
  points: MapRegionPoint[];
  holes: MapRegionPoint[][];
  labelPlacement: MapLabelPlacement;
  references: ProjectObjectRef[];
  createdAt: string;
  updatedAt: string;
};

export type MapDistanceUnit = "km" | "mi" | "m" | "ft" | "li" | "custom";

export type MapGridSettings = {
  visible: boolean;
  snap: boolean;
  labels: boolean;
  columns: number;
  color: string;
  opacity: number;
};

export type MapImageTransform = {
  flipX: boolean;
  flipY: boolean;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export type MapStoryPhase = {
  id: string;
  title: string;
  description: string;
  timelineEventId: string;
  order: number;
  hiddenLayerIds: string[];
  hiddenGroupIds: string[];
  hiddenMarkerIds: string[];
  hiddenRegionIds: string[];
  hiddenRouteIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type MapCatalogMode = "markers" | "routes" | "regions" | "layers";

export type MapViewBookmark = {
  id: string;
  title: string;
  centerX: number;
  centerY: number;
  zoom: number;
  storyPhaseId: string;
  mode: MapCatalogMode;
  showLabels: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MapSavedFilter = {
  id: string;
  title: string;
  mode: MapCatalogMode;
  query: string;
  markerKinds: MapMarkerKind[];
  regionKinds: MapRegionKind[];
  routeStatuses: MapRouteStatus[];
  layerIds: string[];
  groupIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type WorldMap = {
  id: string;
  worldId: string;
  parentMapId: string;
  entryMarkerId: string;
  title: string;
  description: string;
  imageUrl: string;
  imageTransform: MapImageTransform;
  width: number;
  height: number;
  distanceWidth: number;
  distanceUnit: MapDistanceUnit;
  customDistanceUnit: string;
  grid: MapGridSettings;
  regions: MapRegion[];
  storyPhases: MapStoryPhase[];
  viewBookmarks: MapViewBookmark[];
  savedFilters: MapSavedFilter[];
  createdAt: string;
  updatedAt: string;
};

export type MapLayerImageBlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "soft-light";

export type MapLayer = {
  id: string;
  worldId: string;
  mapId: string;
  title: string;
  description: string;
  color: string;
  order: number;
  visible: boolean;
  locked: boolean;
  imageUrl: string;
  imageTransform: MapImageTransform;
  imageOpacity: number;
  imageBlendMode: MapLayerImageBlendMode;
  imageGroupId: string;
  createdAt: string;
  updatedAt: string;
};

export type MapHierarchyEntry = {
  depth: number;
  map: WorldMap;
};

export type MapMarkerGroup = {
  id: string;
  worldId: string;
  mapId: string;
  title: string;
  description: string;
  color: string;
  order: number;
  visible: boolean;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MapMarker = {
  id: string;
  mapId: string;
  layerId: string;
  groupId: string;
  entityId: string;
  questId: string;
  sceneId: string;
  references: ProjectObjectRef[];
  x: number;
  y: number;
  label: string;
  markerType: MapMarkerKind;
  color: string;
  iconUrl: string;
  labelPlacement: MapLabelPlacement;
  description: string;
  updatedAt: string;
};

export type MapRouteStatus = "draft" | "active" | "complete";
export type MapTravelMode = "walk" | "ride" | "vehicle" | "sail" | "air" | "custom";

export type MapRouteStop = {
  id: string;
  markerId: string;
  title: string;
  notes: string;
  duration: string;
};

export type MapRouteCurveMode = "straight" | "smooth";

export type MapRouteWaypoint = {
  id: string;
  afterStopId: string;
  x: number;
  y: number;
  order: number;
};

export type MapRoute = {
  id: string;
  worldId: string;
  mapId: string;
  title: string;
  description: string;
  color: string;
  status: MapRouteStatus;
  travelMode: MapTravelMode;
  travelSpeed: number;
  travelHoursPerDay: number;
  stops: MapRouteStop[];
  curveMode: MapRouteCurveMode;
  waypoints: MapRouteWaypoint[];
  references: ProjectObjectRef[];
  updatedAt: string;
};

export type TimelineTrack = {
  id: string;
  worldId: string;
  name: string;
  description: string;
  color: string;
  order: number;
  updatedAt: string;
};

export type TimelineDatePrecision =
  | "exact"
  | "year"
  | "approximate"
  | "unknown"
  | "range"
  | "custom";

export type TimelineEvent = {
  id: string;
  worldId: string;
  entityId: string;
  questId: string;
  sceneId: string;
  references: ProjectObjectRef[];
  trackId: string;
  title: string;
  summary: string;
  displayDate: string;
  datePrecision: TimelineDatePrecision;
  sortOrder: number;
  startValue: string;
  endValue: string;
  era: string;
  dependencyIds: string[];
  updatedAt: string;
};

export type PlanningIssue = {
  id: string;
  severity: "error" | "warning";
  title: string;
  detail: string;
  targetType: "map" | "marker" | "route" | "track" | "timeline";
  targetId: string;
};

export const planningColors = [
  "#0f766e",
  "#2563a8",
  "#7458aa",
  "#b7791f",
  "#c45d4c",
  "#3f7d4d",
  "#596660"
] as const;

export const mapMarkerKinds: MapMarkerKind[] = [
  "location",
  "character",
  "faction",
  "event",
  "item",
  "note",
  "quest",
  "scene",
  "custom"
];

export const MAP_CANVAS_COORDINATE_LIMIT = 100000;

export function calculateMapViewportBounds(
  map: Pick<WorldMap, "height" | "width">,
  zoom: number,
  offset: { x: number; y: number },
  viewport: { height: number; width: number },
  paddingPixels = 160
): MapViewportBounds {
  const scaledWidth = Math.max(0.0001, map.width * Math.max(zoom, 0.0001));
  const scaledHeight = Math.max(0.0001, map.height * Math.max(zoom, 0.0001));
  const padding = Math.max(0, paddingPixels);
  return {
    bottom: ((viewport.height + padding - offset.y) / scaledHeight) * 100,
    left: ((-padding - offset.x) / scaledWidth) * 100,
    right: ((viewport.width + padding - offset.x) / scaledWidth) * 100,
    top: ((-padding - offset.y) / scaledHeight) * 100
  };
}

export function isMapPointWithinBounds(
  point: Pick<MapRegionPoint, "x" | "y">,
  bounds: MapViewportBounds
) {
  return point.x >= bounds.left
    && point.x <= bounds.right
    && point.y >= bounds.top
    && point.y <= bounds.bottom;
}

export function mapRegionIntersectsBounds(
  region: Pick<MapRegion, "points">,
  bounds: MapViewportBounds
) {
  if (!region.points.length) return false;
  let left = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  region.points.forEach((point) => {
    left = Math.min(left, point.x);
    right = Math.max(right, point.x);
    top = Math.min(top, point.y);
    bottom = Math.max(bottom, point.y);
  });
  return right >= bounds.left
    && left <= bounds.right
    && bottom >= bounds.top
    && top <= bounds.bottom;
}

function estimateMapLabelWidth(candidate: MapLabelCandidate) {
  const characters = Array.from(candidate.label.trim()).length;
  const iconAndPadding = candidate.kind === "marker" ? 44 : 42;
  const maximum = candidate.kind === "marker" ? 190 : 170;
  return Math.min(maximum, Math.max(54, iconAndPadding + characters * 7));
}

export function resolveMapLabelVisibility(
  candidates: MapLabelCandidate[],
  options: {
    mapHeight: number;
    mapWidth: number;
    showLabels: boolean;
    zoom: number;
  }
): MapLabelLayout {
  const markerIds = new Set<string>();
  const regionIds = new Set<string>();
  const accepted: Array<{ bottom: number; left: number; right: number; top: number }> = [];
  const scaledWidth = Math.max(0.0001, options.mapWidth * Math.max(options.zoom, 0.0001));
  const scaledHeight = Math.max(0.0001, options.mapHeight * Math.max(options.zoom, 0.0001));
  const gap = options.zoom < 0.45 ? 10 : options.zoom < 0.8 ? 7 : 4;

  [...candidates]
    .sort((left, right) =>
      Number(Boolean(right.selected)) - Number(Boolean(left.selected))
      || Number(Boolean(right.pinned)) - Number(Boolean(left.pinned))
      || (right.priority ?? 0) - (left.priority ?? 0)
      || Number(right.kind === "marker") - Number(left.kind === "marker")
      || left.label.localeCompare(right.label, "zh-CN")
      || left.id.localeCompare(right.id)
    )
    .forEach((candidate) => {
      if (!options.showLabels && !candidate.selected) return;
      if (options.zoom < (candidate.minimumZoom ?? MINIMUM_MAP_LABEL_ZOOM) && !candidate.selected) return;
      const width = estimateMapLabelWidth(candidate);
      const height = candidate.kind === "marker" ? 34 : 28;
      const centerX = (candidate.x / 100) * scaledWidth;
      const centerY = (candidate.y / 100) * scaledHeight;
      const bounds = {
        bottom: centerY + height / 2 + gap,
        left: centerX - width / 2 - gap,
        right: centerX + width / 2 + gap,
        top: centerY - height / 2 - gap
      };
      const collides = accepted.some((item) =>
        bounds.left < item.right
        && bounds.right > item.left
        && bounds.top < item.bottom
        && bounds.bottom > item.top
      );
      if (collides && !candidate.selected && !candidate.pinned) return;
      accepted.push(bounds);
      if (candidate.kind === "marker") markerIds.add(candidate.id);
      else regionIds.add(candidate.id);
    });

  return { markerIds, regionIds };
}

export const mapRegionKinds: MapRegionKind[] = [
  "territory",
  "district",
  "biome",
  "danger",
  "quest",
  "custom"
];

export const mapDistanceUnits: MapDistanceUnit[] = ["km", "mi", "m", "ft", "li", "custom"];

export const mapDistanceUnitLabels: Record<MapDistanceUnit, string> = {
  km: "千米",
  mi: "英里",
  m: "米",
  ft: "英尺",
  li: "里",
  custom: "自定义"
};

export const mapTravelModes: MapTravelMode[] = ["walk", "ride", "vehicle", "sail", "air", "custom"];

export const mapTravelModeLabels: Record<MapTravelMode, string> = {
  walk: "步行",
  ride: "骑乘",
  vehicle: "载具",
  sail: "航海",
  air: "飞行",
  custom: "自定义"
};

const routeStatuses = new Set<MapRouteStatus>(["draft", "active", "complete"]);
const routeCurveModes = new Set<MapRouteCurveMode>(["straight", "smooth"]);
const mapCatalogModes = new Set<MapCatalogMode>(["markers", "routes", "regions", "layers"]);
const markerKinds = new Set<MapMarkerKind>(mapMarkerKinds);
const regionKinds = new Set<MapRegionKind>(mapRegionKinds);
const distanceUnits = new Set<MapDistanceUnit>(mapDistanceUnits);
const travelModes = new Set<MapTravelMode>(mapTravelModes);
const timelineDatePrecisions = new Set<TimelineDatePrecision>([
  "exact",
  "year",
  "approximate",
  "unknown",
  "range",
  "custom"
]);

export const timelineDatePrecisionLabels: Record<TimelineDatePrecision, string> = {
  exact: "精确",
  year: "精确到年",
  approximate: "约略",
  unknown: "未知",
  range: "区间",
  custom: "自定义纪元"
};

export function createPlanningId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function clampNumber(value: unknown, fallback: number, minimum: number, maximum: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, parsed));
}

function normalizeMapCanvasCoordinate(value: unknown, fallback = 50) {
  return clampNumber(
    value,
    fallback,
    -MAP_CANVAS_COORDINATE_LIMIT,
    MAP_CANVAS_COORDINATE_LIMIT
  );
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeColor(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

function nowOr(value: unknown) {
  return typeof value === "string" && value ? value : new Date().toISOString();
}

export function createMapGridSettings(): MapGridSettings {
  return {
    visible: false,
    snap: false,
    labels: true,
    columns: 12,
    color: "#596660",
    opacity: 0.24
  };
}

export function normalizeMapGridSettings(input?: Partial<MapGridSettings>): MapGridSettings {
  const created = createMapGridSettings();
  return {
    visible: input?.visible === true,
    snap: input?.visible === true && input?.snap === true,
    labels: input?.labels !== false,
    columns: Math.round(clampNumber(input?.columns, created.columns, 4, 24)),
    color: normalizeColor(input?.color, created.color),
    opacity: clampNumber(input?.opacity, created.opacity, 0.05, 0.8)
  };
}

export function createMapImageTransform(): MapImageTransform {
  return {
    flipX: false,
    flipY: false,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  };
}

export function normalizeMapImageTransform(
  input?: Partial<MapImageTransform>
): MapImageTransform {
  const created = createMapImageTransform();
  const rawRotation = Number(input?.rotation);
  const rotation = Number.isFinite(rawRotation)
    ? ((rawRotation + 180) % 360 + 360) % 360 - 180
    : created.rotation;
  return {
    flipX: input?.flipX === true,
    flipY: input?.flipY === true,
    x: Math.round(clampNumber(input?.x, created.x, -MAP_CANVAS_COORDINATE_LIMIT, MAP_CANVAS_COORDINATE_LIMIT) * 1000) / 1000,
    y: Math.round(clampNumber(input?.y, created.y, -MAP_CANVAS_COORDINATE_LIMIT, MAP_CANVAS_COORDINATE_LIMIT) * 1000) / 1000,
    scale: Math.round(clampNumber(input?.scale, created.scale, 0.01, 1000) * 10000) / 10000,
    rotation: Math.round(rotation * 1000) / 1000
  };
}

function normalizeIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string" && Boolean(item))));
}

export function createMapLabelPlacement(): MapLabelPlacement {
  return {
    offsetX: 0,
    offsetY: 0,
    locked: false,
    minZoom: MINIMUM_MAP_LABEL_ZOOM
  };
}

export const MINIMUM_MAP_LABEL_ZOOM = 0.1;
export const MAXIMUM_MAP_LABEL_ZOOM = 4;

export function normalizeMapLabelPlacement(
  input?: Partial<MapLabelPlacement> | null
): MapLabelPlacement {
  const created = createMapLabelPlacement();
  return {
    offsetX: normalizeMapCanvasCoordinate(input?.offsetX, created.offsetX),
    offsetY: normalizeMapCanvasCoordinate(input?.offsetY, created.offsetY),
    locked: input?.locked === true,
    minZoom: clampNumber(
      input?.minZoom,
      created.minZoom,
      MINIMUM_MAP_LABEL_ZOOM,
      MAXIMUM_MAP_LABEL_ZOOM
    )
  };
}

export function createMapViewBookmark(
  index = 1,
  view: Partial<MapViewBookmark> = {}
): MapViewBookmark {
  const timestamp = new Date().toISOString();
  return normalizeMapViewBookmark({
    id: createPlanningId("map-view"),
    title: `视图 ${index}`,
    centerX: 50,
    centerY: 50,
    zoom: 1,
    storyPhaseId: "",
    mode: "markers",
    showLabels: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...view
  }, index);
}

export function normalizeMapViewBookmark(
  input: Partial<MapViewBookmark>,
  index = 1
): MapViewBookmark {
  const timestamp = nowOr(input.createdAt);
  return {
    id: input.id || createPlanningId("map-view"),
    title: input.title?.trim() || `视图 ${index}`,
    centerX: normalizeMapCanvasCoordinate(input.centerX),
    centerY: normalizeMapCanvasCoordinate(input.centerY),
    zoom: clampNumber(input.zoom, 1, MINIMUM_MAP_LABEL_ZOOM, MAXIMUM_MAP_LABEL_ZOOM),
    storyPhaseId: typeof input.storyPhaseId === "string" ? input.storyPhaseId : "",
    mode: mapCatalogModes.has(input.mode as MapCatalogMode)
      ? (input.mode as MapCatalogMode)
      : "markers",
    showLabels: input.showLabels !== false,
    createdAt: timestamp,
    updatedAt: nowOr(input.updatedAt || timestamp)
  };
}

export function createMapSavedFilter(
  index = 1,
  filter: Partial<MapSavedFilter> = {}
): MapSavedFilter {
  const timestamp = new Date().toISOString();
  return normalizeMapSavedFilter({
    id: createPlanningId("map-filter"),
    title: `筛选 ${index}`,
    mode: "markers",
    query: "",
    markerKinds: [],
    regionKinds: [],
    routeStatuses: [],
    layerIds: [],
    groupIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...filter
  }, index);
}

export function normalizeMapSavedFilter(
  input: Partial<MapSavedFilter>,
  index = 1
): MapSavedFilter {
  const timestamp = nowOr(input.createdAt);
  const normalizeValues = <Value extends string>(
    value: unknown,
    allowed: Set<Value>
  ) => Array.isArray(value)
    ? Array.from(new Set(value.filter((item): item is Value => allowed.has(item as Value))))
    : [];
  return {
    id: input.id || createPlanningId("map-filter"),
    title: input.title?.trim() || `筛选 ${index}`,
    mode: mapCatalogModes.has(input.mode as MapCatalogMode)
      ? (input.mode as MapCatalogMode)
      : "markers",
    query: typeof input.query === "string" ? input.query : "",
    markerKinds: normalizeValues(input.markerKinds, markerKinds),
    regionKinds: normalizeValues(input.regionKinds, regionKinds),
    routeStatuses: normalizeValues(input.routeStatuses, routeStatuses),
    layerIds: normalizeIdList(input.layerIds),
    groupIds: normalizeIdList(input.groupIds),
    createdAt: timestamp,
    updatedAt: nowOr(input.updatedAt || timestamp)
  };
}

export function createMapStoryPhase(index = 1, title = ""): MapStoryPhase {
  const timestamp = new Date().toISOString();
  return {
    id: createPlanningId("map-phase"),
    title: title.trim() || `剧情阶段 ${index}`,
    description: "",
    timelineEventId: "",
    order: index,
    hiddenLayerIds: [],
    hiddenGroupIds: [],
    hiddenMarkerIds: [],
    hiddenRegionIds: [],
    hiddenRouteIds: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function normalizeMapStoryPhase(
  input: Partial<MapStoryPhase>,
  index = 1
): MapStoryPhase {
  const created = createMapStoryPhase(index);
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    title: input.title?.trim() || created.title,
    description: input.description ?? "",
    timelineEventId: input.timelineEventId || "",
    order: Math.round(clampNumber(input.order, index, 0, 10000)),
    hiddenLayerIds: normalizeIdList(input.hiddenLayerIds),
    hiddenGroupIds: normalizeIdList(input.hiddenGroupIds),
    hiddenMarkerIds: normalizeIdList(input.hiddenMarkerIds),
    hiddenRegionIds: normalizeIdList(input.hiddenRegionIds),
    hiddenRouteIds: normalizeIdList(input.hiddenRouteIds),
    createdAt: nowOr(input.createdAt),
    updatedAt: nowOr(input.updatedAt || input.createdAt)
  };
}

export function createWorldMap(worldId: string, index = 1, title = ""):
  WorldMap {
  const timestamp = new Date().toISOString();
  return {
    id: createPlanningId("map"),
    worldId,
    parentMapId: "",
    entryMarkerId: "",
    title: title.trim() || `地图 ${index}`,
    description: "记录区域、关卡或场景中的叙事位置。",
    imageUrl: "",
    imageTransform: createMapImageTransform(),
    width: 1600,
    height: 1000,
    distanceWidth: 100,
    distanceUnit: "km",
    customDistanceUnit: "距离单位",
    grid: createMapGridSettings(),
    regions: [],
    storyPhases: [],
    viewBookmarks: [],
    savedFilters: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function normalizeWorldMap(
  input: Partial<WorldMap>,
  fallbackWorldId: string,
  index = 1
): WorldMap {
  const created = createWorldMap(fallbackWorldId, index);
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    worldId: input.worldId || fallbackWorldId,
    parentMapId: typeof input.parentMapId === "string" ? input.parentMapId : "",
    entryMarkerId: typeof input.entryMarkerId === "string" ? input.entryMarkerId : "",
    title: input.title?.trim() || created.title,
    description: input.description ?? "",
    imageUrl: input.imageUrl || "",
    imageTransform: normalizeMapImageTransform(input.imageTransform),
    width: Math.round(clampNumber(input.width, 1600, 320, MAP_CANVAS_COORDINATE_LIMIT)),
    height: Math.round(clampNumber(input.height, 1000, 240, MAP_CANVAS_COORDINATE_LIMIT)),
    distanceWidth: clampNumber(input.distanceWidth, created.distanceWidth, 0.01, 1000000000),
    distanceUnit: distanceUnits.has(input.distanceUnit as MapDistanceUnit)
      ? (input.distanceUnit as MapDistanceUnit)
      : created.distanceUnit,
    customDistanceUnit: input.customDistanceUnit?.trim() || created.customDistanceUnit,
    grid: normalizeMapGridSettings(input.grid),
    regions: Array.isArray(input.regions)
      ? input.regions.map((region, regionIndex) => normalizeMapRegion(region, regionIndex + 1))
      : [],
    storyPhases: Array.isArray(input.storyPhases)
      ? input.storyPhases.map((phase, phaseIndex) => normalizeMapStoryPhase(phase, phaseIndex + 1))
      : [],
    viewBookmarks: Array.isArray(input.viewBookmarks)
      ? input.viewBookmarks.map((bookmark, bookmarkIndex) =>
          normalizeMapViewBookmark(bookmark, bookmarkIndex + 1)
        )
      : [],
    savedFilters: Array.isArray(input.savedFilters)
      ? input.savedFilters.map((filter, filterIndex) =>
          normalizeMapSavedFilter(filter, filterIndex + 1)
        )
      : [],
    createdAt: nowOr(input.createdAt),
    updatedAt: nowOr(input.updatedAt || input.createdAt)
  };
}

export function normalizeMapHierarchy(maps: WorldMap[]): WorldMap[] {
  const originalById = new Map(maps.map((mapItem) => [mapItem.id, mapItem]));
  const normalized = maps.map((mapItem) => {
    const parent = originalById.get(mapItem.parentMapId);
    const parentMapId = parent && parent.id !== mapItem.id && parent.worldId === mapItem.worldId
      ? parent.id
      : "";
    return {
      ...mapItem,
      parentMapId,
      entryMarkerId: parentMapId ? mapItem.entryMarkerId : ""
    };
  });
  const byId = new Map(normalized.map((mapItem) => [mapItem.id, mapItem]));

  normalized.forEach((mapItem) => {
    const visited = new Set([mapItem.id]);
    let parentMapId = mapItem.parentMapId;
    while (parentMapId) {
      if (visited.has(parentMapId)) {
        mapItem.parentMapId = "";
        mapItem.entryMarkerId = "";
        break;
      }
      visited.add(parentMapId);
      parentMapId = byId.get(parentMapId)?.parentMapId ?? "";
    }
  });

  return normalized;
}

export function createMapHierarchyEntries(maps: WorldMap[]): MapHierarchyEntry[] {
  const childrenByParent = new Map<string, WorldMap[]>();
  maps.forEach((mapItem) => {
    const children = childrenByParent.get(mapItem.parentMapId) ?? [];
    children.push(mapItem);
    childrenByParent.set(mapItem.parentMapId, children);
  });
  const entries: MapHierarchyEntry[] = [];
  const visited = new Set<string>();
  const append = (mapItem: WorldMap, depth: number) => {
    if (visited.has(mapItem.id)) return;
    visited.add(mapItem.id);
    entries.push({ depth, map: mapItem });
    (childrenByParent.get(mapItem.id) ?? []).forEach((child) => append(child, depth + 1));
  };
  (childrenByParent.get("") ?? []).forEach((mapItem) => append(mapItem, 0));
  maps.forEach((mapItem) => append(mapItem, 0));
  return entries;
}

export function getMapHierarchyPath(maps: WorldMap[], mapId: string): WorldMap[] {
  const byId = new Map(maps.map((mapItem) => [mapItem.id, mapItem]));
  const path: WorldMap[] = [];
  const visited = new Set<string>();
  let current = byId.get(mapId);
  while (current && !visited.has(current.id)) {
    path.unshift(current);
    visited.add(current.id);
    current = byId.get(current.parentMapId);
  }
  return path;
}

export function getMapDescendantIds(maps: WorldMap[], mapId: string): Set<string> {
  const descendants = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    maps.forEach((mapItem) => {
      if (
        mapItem.id !== mapId
        && !descendants.has(mapItem.id)
        && (mapItem.parentMapId === mapId || descendants.has(mapItem.parentMapId))
      ) {
        descendants.add(mapItem.id);
        changed = true;
      }
    });
  }
  return descendants;
}

export function createMapRegion(
  index = 1,
  points: MapRegionPoint[] = [],
  timestamp = new Date().toISOString()
): MapRegion {
  return {
    id: createPlanningId("map-region"),
    title: `区域 ${index}`,
    description: "",
    kind: "territory",
    color: planningColors[(index + 2) % planningColors.length],
    opacity: 0.24,
    order: index,
    visible: true,
    locked: false,
    points: points.map((point) => ({
      x: normalizeMapCanvasCoordinate(point.x),
      y: normalizeMapCanvasCoordinate(point.y)
    })),
    holes: [],
    labelPlacement: createMapLabelPlacement(),
    references: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function normalizeMapRegion(input: Partial<MapRegion>, index = 1): MapRegion {
  const created = createMapRegion(index);
  const normalizePoints = (value: unknown) => Array.isArray(value)
    ? value
        .filter((point): point is MapRegionPoint => Boolean(point) && typeof point === "object")
        .slice(0, 200)
        .map((point) => ({
          x: normalizeMapCanvasCoordinate(point.x),
          y: normalizeMapCanvasCoordinate(point.y)
        }))
    : [];
  const points = normalizePoints(input.points);
  const holes = Array.isArray(input.holes)
    ? input.holes.slice(0, 32).map(normalizePoints).filter((ring) => ring.length >= 3)
    : [];
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    title: input.title?.trim() || created.title,
    description: input.description ?? "",
    kind: regionKinds.has(input.kind as MapRegionKind)
      ? (input.kind as MapRegionKind)
      : "custom",
    color: normalizeColor(input.color, created.color),
    opacity: clampNumber(input.opacity, created.opacity, 0.05, 0.75),
    order: Math.round(clampNumber(input.order, index, -10000, 10000)),
    visible: input.visible !== false,
    locked: input.locked === true,
    points,
    holes,
    labelPlacement: normalizeMapLabelPlacement(input.labelPlacement),
    references: normalizeProjectObjectRefs(input.references),
    createdAt: nowOr(input.createdAt),
    updatedAt: nowOr(input.updatedAt || input.createdAt)
  };
}

export function createMapRegionSvgPath(
  points: MapRegionPoint[],
  holes: MapRegionPoint[][] = []
) {
  const ringPath = (ring: MapRegionPoint[]) => ring.length
    ? `M ${ring.map((point) => `${Number(point.x.toFixed(3))} ${Number(point.y.toFixed(3))}`).join(" L ")} Z`
    : "";
  return [ringPath(points), ...holes.map(ringPath)].filter(Boolean).join(" ");
}

export function isMapPointInsidePolygon(
  point: MapRegionPoint,
  polygon: MapRegionPoint[]
) {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index, index += 1) {
    const current = polygon[index];
    const previous = polygon[previousIndex];
    const crosses = (current.y > point.y) !== (previous.y > point.y)
      && point.x < (
        ((previous.x - current.x) * (point.y - current.y))
        / ((previous.y - current.y) || Number.EPSILON)
      ) + current.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function pointToSegmentDistance(
  point: MapRegionPoint,
  start: MapRegionPoint,
  end: MapRegionPoint
) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  if (!deltaX && !deltaY) return Math.hypot(point.x - start.x, point.y - start.y);
  const ratio = Math.max(0, Math.min(1, (
    (point.x - start.x) * deltaX + (point.y - start.y) * deltaY
  ) / (deltaX * deltaX + deltaY * deltaY)));
  return Math.hypot(
    point.x - (start.x + ratio * deltaX),
    point.y - (start.y + ratio * deltaY)
  );
}

export function simplifyMapRegionPoints(
  points: MapRegionPoint[],
  tolerance = 0.18
) {
  let simplified = points.map((point) => ({ ...point }));
  const normalizedTolerance = clampNumber(tolerance, 0.18, 0.01, 20);
  for (let pass = 0; pass < 6 && simplified.length > 3; pass += 1) {
    const next = simplified.filter((point, index, ring) => {
      if (ring.length <= 3) return true;
      const previous = ring[(index - 1 + ring.length) % ring.length];
      const following = ring[(index + 1) % ring.length];
      return pointToSegmentDistance(point, previous, following) >= normalizedTolerance;
    });
    if (next.length < 3 || next.length === simplified.length) break;
    simplified = next;
  }
  return simplified;
}

export function smoothMapRegionPoints(
  points: MapRegionPoint[],
  iterations = 1
) {
  let smoothed = points.map((point) => ({ ...point }));
  const passes = Math.round(clampNumber(iterations, 1, 1, 3));
  for (let pass = 0; pass < passes && smoothed.length >= 3 && smoothed.length < 200; pass += 1) {
    const next: MapRegionPoint[] = [];
    smoothed.forEach((point, index) => {
      const following = smoothed[(index + 1) % smoothed.length];
      next.push({
        x: normalizeMapCanvasCoordinate(point.x * 0.75 + following.x * 0.25),
        y: normalizeMapCanvasCoordinate(point.y * 0.75 + following.y * 0.25)
      });
      next.push({
        x: normalizeMapCanvasCoordinate(point.x * 0.25 + following.x * 0.75),
        y: normalizeMapCanvasCoordinate(point.y * 0.25 + following.y * 0.75)
      });
    });
    smoothed = next.slice(0, 200);
  }
  return smoothed;
}

export function calculateMapRegionMetrics(
  region: Pick<MapRegion, "points"> & Partial<Pick<MapRegion, "holes">>,
  map?: Pick<WorldMap, "distanceWidth" | "width" | "height">
) {
  const points = region.points;
  if (points.length < 3) {
    const centroid = points.length
      ? {
          x: points.reduce((total, point) => total + point.x, 0) / points.length,
          y: points.reduce((total, point) => total + point.y, 0) / points.length
        }
      : { x: 50, y: 50 };
    return { areaPercent: 0, perimeter: 0, centroid };
  }
  const ringMetrics = (ring: MapRegionPoint[]) => {
    let twiceArea = 0;
    let centroidX = 0;
    let centroidY = 0;
    let perimeter = 0;
    ring.forEach((point, index) => {
      const next = ring[(index + 1) % ring.length];
      const cross = point.x * next.y - next.x * point.y;
      twiceArea += cross;
      centroidX += (point.x + next.x) * cross;
      centroidY += (point.y + next.y) * cross;
      perimeter += map
        ? calculateMapDistance(map, point, next)
        : Math.hypot(next.x - point.x, next.y - point.y);
    });
    const fallback = {
      x: ring.reduce((total, point) => total + point.x, 0) / ring.length,
      y: ring.reduce((total, point) => total + point.y, 0) / ring.length
    };
    return {
      area: Math.abs(twiceArea) / 2,
      centroid: Math.abs(twiceArea) < 0.0001
        ? fallback
        : { x: centroidX / (3 * twiceArea), y: centroidY / (3 * twiceArea) },
      perimeter
    };
  };
  const outer = ringMetrics(points);
  const holes = (region.holes ?? []).filter((ring) => ring.length >= 3).map(ringMetrics);
  const holeArea = holes.reduce((total, hole) => total + hole.area, 0);
  const area = Math.max(0, outer.area - holeArea);
  const perimeter = outer.perimeter + holes.reduce((total, hole) => total + hole.perimeter, 0);
  const fallbackCentroid = {
    x: points.reduce((total, point) => total + point.x, 0) / points.length,
    y: points.reduce((total, point) => total + point.y, 0) / points.length
  };
  const centroid = area < 0.0001
    ? fallbackCentroid
    : {
        x: (outer.centroid.x * outer.area - holes.reduce(
          (total, hole) => total + hole.centroid.x * hole.area,
          0
        )) / area,
        y: (outer.centroid.y * outer.area - holes.reduce(
          (total, hole) => total + hole.centroid.y * hole.area,
          0
        )) / area
      };
  return {
    areaPercent: Math.round((area / 100) * 100) / 100,
    perimeter: Math.round(perimeter * 10) / 10,
    centroid: {
      x: Math.round(normalizeMapCanvasCoordinate(centroid.x, fallbackCentroid.x) * 100) / 100,
      y: Math.round(normalizeMapCanvasCoordinate(centroid.y, fallbackCentroid.y) * 100) / 100
    }
  };
}

export function defaultMapLayerId(mapId: string) {
  return `map-layer-default:${mapId}`;
}

export function createDefaultMapLayer(
  worldId: string,
  mapId: string,
  timestamp = new Date().toISOString()
): MapLayer {
  return {
    id: defaultMapLayerId(mapId),
    worldId,
    mapId,
    title: "主要标记",
    description: "地图上的默认叙事标记层。",
    color: planningColors[0],
    order: 0,
    visible: true,
    locked: false,
    imageUrl: "",
    imageTransform: createMapImageTransform(),
    imageOpacity: 1,
    imageBlendMode: "normal",
    imageGroupId: "",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function createMapLayer(
  worldId: string,
  mapId: string,
  index = 1,
  timestamp = new Date().toISOString()
): MapLayer {
  return {
    ...createDefaultMapLayer(worldId, mapId, timestamp),
    id: createPlanningId("map-layer"),
    title: `图层 ${index}`,
    color: planningColors[index % planningColors.length],
    order: index
  };
}

export function normalizeMapLayer(
  input: Partial<MapLayer>,
  fallbackWorldId: string,
  fallbackMapId: string,
  index = 0
): MapLayer {
  const created = index === 0
    ? createDefaultMapLayer(fallbackWorldId, fallbackMapId)
    : createMapLayer(fallbackWorldId, fallbackMapId, index);
  const imageBlendModes = new Set<MapLayerImageBlendMode>([
    "normal",
    "multiply",
    "screen",
    "overlay",
    "soft-light"
  ]);
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    worldId: input.worldId || fallbackWorldId,
    mapId: input.mapId || fallbackMapId,
    title: input.title?.trim() || created.title,
    description: input.description ?? "",
    color: normalizeColor(input.color, planningColors[index % planningColors.length]),
    order: Math.round(clampNumber(input.order, index, -10000, 10000)),
    visible: input.visible !== false,
    locked: input.locked === true,
    imageUrl: input.imageUrl || "",
    imageTransform: normalizeMapImageTransform(input.imageTransform),
    imageOpacity: clampNumber(input.imageOpacity, 1, 0.05, 1),
    imageBlendMode: imageBlendModes.has(input.imageBlendMode as MapLayerImageBlendMode)
      ? (input.imageBlendMode as MapLayerImageBlendMode)
      : "normal",
    imageGroupId: input.imageGroupId || "",
    createdAt: nowOr(input.createdAt),
    updatedAt: nowOr(input.updatedAt || input.createdAt)
  };
}

export function ensureMapLayers(
  layers: Partial<MapLayer>[],
  maps: WorldMap[]
): MapLayer[] {
  const mapById = new Map(maps.map((mapItem) => [mapItem.id, mapItem]));
  const normalized = layers
    .filter((layer) => !layer.mapId || mapById.has(layer.mapId))
    .map((layer, index) => {
      const mapItem = mapById.get(layer.mapId || "") || maps[0];
      return normalizeMapLayer(layer, mapItem?.worldId || "", mapItem?.id || "", index);
    });
  maps.forEach((mapItem) => {
    if (!normalized.some((layer) => layer.mapId === mapItem.id)) {
      normalized.push(createDefaultMapLayer(mapItem.worldId, mapItem.id));
    }
  });
  return normalized;
}

export function createMapMarkerGroup(
  worldId: string,
  mapId: string,
  index = 1,
  timestamp = new Date().toISOString()
): MapMarkerGroup {
  return {
    id: createPlanningId("marker-group"),
    worldId,
    mapId,
    title: `标记组 ${index}`,
    description: "",
    color: planningColors[index % planningColors.length],
    order: index,
    visible: true,
    locked: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function normalizeMapMarkerGroup(
  input: Partial<MapMarkerGroup>,
  fallbackWorldId: string,
  fallbackMapId: string,
  index = 1
): MapMarkerGroup {
  const created = createMapMarkerGroup(fallbackWorldId, fallbackMapId, index);
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    worldId: input.worldId || fallbackWorldId,
    mapId: input.mapId || fallbackMapId,
    title: input.title?.trim() || created.title,
    description: input.description ?? "",
    color: normalizeColor(input.color, planningColors[index % planningColors.length]),
    order: Math.round(clampNumber(input.order, index, -10000, 10000)),
    visible: input.visible !== false,
    locked: input.locked === true,
    createdAt: nowOr(input.createdAt),
    updatedAt: nowOr(input.updatedAt || input.createdAt)
  };
}

export function createMapMarker(
  mapId: string,
  x: number,
  y: number,
  index = 1,
  layerId = defaultMapLayerId(mapId)
): MapMarker {
  return {
    id: createPlanningId("marker"),
    mapId,
    layerId,
    groupId: "",
    entityId: "",
    questId: "",
    sceneId: "",
    references: [],
    x: normalizeMapCanvasCoordinate(x),
    y: normalizeMapCanvasCoordinate(y),
    label: `新标记 ${index}`,
    markerType: "custom",
    color: planningColors[0],
    iconUrl: "",
    labelPlacement: createMapLabelPlacement(),
    description: "",
    updatedAt: new Date().toISOString()
  };
}

export function normalizeMapMarker(input: Partial<MapMarker>, fallbackMapId = ""): MapMarker {
  const created = createMapMarker(fallbackMapId, 50, 50);
  const references = normalizeProjectObjectRefs(input.references);
  const referenceKeys = new Set(references.map(projectObjectRefKey));
  const legacyReferences = normalizeProjectObjectRefs([
    { kind: "entity", id: input.entityId },
    { kind: "quest", id: input.questId },
    { kind: "scene", id: input.sceneId }
  ]).filter((reference) => !referenceKeys.has(projectObjectRefKey(reference)));
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    mapId: input.mapId || fallbackMapId,
    layerId: input.layerId || defaultMapLayerId(input.mapId || fallbackMapId),
    groupId: input.groupId || "",
    entityId: input.entityId || "",
    questId: input.questId || "",
    sceneId: input.sceneId || "",
    references: [...references, ...legacyReferences],
    x: normalizeMapCanvasCoordinate(input.x),
    y: normalizeMapCanvasCoordinate(input.y),
    label: input.label?.trim() || "未命名标记",
    markerType: markerKinds.has(input.markerType as MapMarkerKind)
      ? (input.markerType as MapMarkerKind)
      : "custom",
    color: normalizeColor(input.color, planningColors[0]),
    iconUrl: typeof input.iconUrl === "string" ? input.iconUrl : "",
    labelPlacement: normalizeMapLabelPlacement(input.labelPlacement),
    description: input.description ?? "",
    updatedAt: nowOr(input.updatedAt)
  };
}

export function isMapMarkerVisible(
  marker: MapMarker,
  layers: MapLayer[],
  groups: MapMarkerGroup[]
) {
  const layer = layers.find((item) => item.id === marker.layerId);
  const group = marker.groupId ? groups.find((item) => item.id === marker.groupId) : undefined;
  return layer?.visible !== false && group?.visible !== false;
}

export function isMapMarkerEditable(
  marker: MapMarker,
  layers: MapLayer[],
  groups: MapMarkerGroup[]
) {
  const layer = layers.find((item) => item.id === marker.layerId);
  const group = marker.groupId ? groups.find((item) => item.id === marker.groupId) : undefined;
  return isMapMarkerVisible(marker, layers, groups) && layer?.locked !== true && group?.locked !== true;
}

export function createMapRouteStop(markerId: string, index = 1): MapRouteStop {
  return {
    id: createPlanningId("route-stop"),
    markerId,
    title: `阶段 ${index}`,
    notes: "",
    duration: ""
  };
}

function normalizeMapRouteStop(input: Partial<MapRouteStop>, index: number): MapRouteStop {
  const created = createMapRouteStop(input.markerId || "", index);
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    markerId: input.markerId || "",
    title: input.title?.trim() || created.title,
    notes: input.notes ?? "",
    duration: input.duration ?? ""
  };
}

export function createMapRouteWaypoint(
  afterStopId: string,
  x: number,
  y: number,
  order = 1
): MapRouteWaypoint {
  return {
    id: createPlanningId("route-waypoint"),
    afterStopId,
    x: normalizeMapCanvasCoordinate(x),
    y: normalizeMapCanvasCoordinate(y),
    order
  };
}

function normalizeMapRouteWaypoint(
  input: Partial<MapRouteWaypoint>,
  index: number
): MapRouteWaypoint {
  const created = createMapRouteWaypoint(input.afterStopId || "", 50, 50, index);
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    afterStopId: input.afterStopId || "",
    x: normalizeMapCanvasCoordinate(input.x),
    y: normalizeMapCanvasCoordinate(input.y),
    order: Math.round(clampNumber(input.order, index, -10000, 10000))
  };
}

export function createMapRoute(worldId: string, mapId: string, index = 1): MapRoute {
  return {
    id: createPlanningId("map-route"),
    worldId,
    mapId,
    title: `路线 ${index}`,
    description: "记录玩家、NPC 或任务目标经过地图的顺序。",
    color: planningColors[2],
    status: "draft",
    travelMode: "walk",
    travelSpeed: 5,
    travelHoursPerDay: 8,
    stops: [],
    curveMode: "straight",
    waypoints: [],
    references: [],
    updatedAt: new Date().toISOString()
  };
}

export function normalizeMapRoute(
  input: Partial<MapRoute>,
  fallbackWorldId: string,
  fallbackMapId = "",
  index = 1
): MapRoute {
  const created = createMapRoute(fallbackWorldId, fallbackMapId, index);
  const stops = Array.isArray(input.stops)
    ? input.stops.map((stop, stopIndex) => normalizeMapRouteStop(stop, stopIndex + 1))
    : [];
  const validAfterStopIds = new Set(stops.slice(0, -1).map((stop) => stop.id));
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    worldId: input.worldId || fallbackWorldId,
    mapId: input.mapId || fallbackMapId,
    title: input.title?.trim() || created.title,
    description: input.description ?? "",
    color: normalizeColor(input.color, planningColors[2]),
    status: routeStatuses.has(input.status as MapRouteStatus)
      ? (input.status as MapRouteStatus)
      : "draft",
    travelMode: travelModes.has(input.travelMode as MapTravelMode)
      ? (input.travelMode as MapTravelMode)
      : created.travelMode,
    travelSpeed: clampNumber(input.travelSpeed, created.travelSpeed, 0.01, 1000000),
    travelHoursPerDay: clampNumber(input.travelHoursPerDay, created.travelHoursPerDay, 1, 24),
    stops,
    curveMode: routeCurveModes.has(input.curveMode as MapRouteCurveMode)
      ? (input.curveMode as MapRouteCurveMode)
      : created.curveMode,
    waypoints: Array.isArray(input.waypoints)
      ? input.waypoints
          .map((waypoint, waypointIndex) => normalizeMapRouteWaypoint(waypoint, waypointIndex + 1))
          .filter((waypoint) => validAfterStopIds.has(waypoint.afterStopId))
      : [],
    references: normalizeProjectObjectRefs(input.references),
    updatedAt: nowOr(input.updatedAt)
  };
}

function sortedRouteWaypoints(
  route: Pick<MapRoute, "waypoints">,
  afterStopId: string
) {
  return (route.waypoints ?? [])
    .filter((waypoint) => waypoint.afterStopId === afterStopId)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}

export function getMapRoutePathPoints(
  route: Pick<MapRoute, "stops" | "waypoints">,
  markers: Array<Pick<MapMarker, "id" | "x" | "y">>
): MapRegionPoint[] {
  const markerMap = new Map(markers.map((marker) => [marker.id, marker]));
  const points: MapRegionPoint[] = [];
  route.stops.forEach((stop, index) => {
    const marker = markerMap.get(stop.markerId);
    if (!marker) return;
    points.push({ x: marker.x, y: marker.y });
    if (index < route.stops.length - 1) {
      sortedRouteWaypoints(route, stop.id).forEach((waypoint) => {
        points.push({ x: waypoint.x, y: waypoint.y });
      });
    }
  });
  return points;
}

function formatMapPathCoordinate(value: number) {
  return Number(value.toFixed(3));
}

export function createMapRouteSvgPath(
  points: MapRegionPoint[],
  curveMode: MapRouteCurveMode
) {
  if (!points.length) return "";
  const commands = [`M ${formatMapPathCoordinate(points[0].x)} ${formatMapPathCoordinate(points[0].y)}`];
  if (curveMode === "straight" || points.length < 3) {
    points.slice(1).forEach((point) => {
      commands.push(`L ${formatMapPathCoordinate(point.x)} ${formatMapPathCoordinate(point.y)}`);
    });
    return commands.join(" ");
  }
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const following = points[index + 2] ?? next;
    const controlOne = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6
    };
    const controlTwo = {
      x: next.x - (following.x - current.x) / 6,
      y: next.y - (following.y - current.y) / 6
    };
    commands.push(
      `C ${formatMapPathCoordinate(controlOne.x)} ${formatMapPathCoordinate(controlOne.y)}`
      + ` ${formatMapPathCoordinate(controlTwo.x)} ${formatMapPathCoordinate(controlTwo.y)}`
      + ` ${formatMapPathCoordinate(next.x)} ${formatMapPathCoordinate(next.y)}`
    );
  }
  return commands.join(" ");
}

export function sampleMapRoutePath(
  points: MapRegionPoint[],
  curveMode: MapRouteCurveMode,
  subdivisions = 10
): MapRegionPoint[] {
  if (curveMode === "straight" || points.length < 3) return points.map((point) => ({ ...point }));
  const samples: MapRegionPoint[] = [{ ...points[0] }];
  const steps = Math.max(2, Math.round(subdivisions));
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    for (let step = 1; step <= steps; step += 1) {
      const t = step / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      samples.push({
        x: 0.5 * (
          2 * p1.x
          + (-p0.x + p2.x) * t
          + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2
          + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        ),
        y: 0.5 * (
          2 * p1.y
          + (-p0.y + p2.y) * t
          + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2
          + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        )
      });
    }
  }
  return samples;
}

export function moveMapRouteStop(
  route: MapRoute,
  stopId: string,
  direction: -1 | 1
): MapRoute {
  const index = route.stops.findIndex((stop) => stop.id === stopId);
  const targetIndex = index + direction;
  if (index < 0 || targetIndex < 0 || targetIndex >= route.stops.length) return route;
  const stops = [...route.stops];
  [stops[index], stops[targetIndex]] = [stops[targetIndex], stops[index]];
  return { ...route, stops, updatedAt: new Date().toISOString() };
}

function roundMapMetric(value: number) {
  if (!Number.isFinite(value)) return 0;
  const precision = Math.abs(value) >= 100 ? 1 : Math.abs(value) >= 10 ? 2 : 3;
  return Number(value.toFixed(precision));
}

export function getMapDistanceUnitLabel(
  map: Pick<WorldMap, "customDistanceUnit" | "distanceUnit">
) {
  return map.distanceUnit === "custom"
    ? map.customDistanceUnit.trim() || "距离单位"
    : mapDistanceUnitLabels[map.distanceUnit];
}

export function calculateMapDistance(
  map: Pick<WorldMap, "distanceWidth" | "width" | "height">,
  start: MapRegionPoint,
  end: MapRegionPoint
) {
  const horizontalScale = map.distanceWidth / 100;
  const verticalScale = horizontalScale * (map.height / map.width);
  return roundMapMetric(Math.hypot(
    (end.x - start.x) * horizontalScale,
    (end.y - start.y) * verticalScale
  ));
}

export function formatMapDistance(
  distance: number,
  map: Pick<WorldMap, "customDistanceUnit" | "distanceUnit">
) {
  const absolute = Math.abs(distance);
  const precision = absolute >= 100 ? 0 : absolute >= 10 ? 1 : 2;
  return `${Number(distance.toFixed(precision))} ${getMapDistanceUnitLabel(map)}`;
}

export function calculateMapGrid(
  map: Pick<WorldMap, "grid" | "height" | "width">
) {
  const columns = Math.round(clampNumber(map.grid.columns, 12, 4, 24));
  const rows = Math.round(clampNumber(columns * (map.height / map.width), 8, 2, 24));
  return {
    columns,
    rows,
    stepX: 100 / columns,
    stepY: 100 / rows
  };
}

export function snapMapPointToGrid(
  map: Pick<WorldMap, "grid" | "height" | "width">,
  point: MapRegionPoint
) {
  const normalized = {
    x: normalizeMapCanvasCoordinate(point.x),
    y: normalizeMapCanvasCoordinate(point.y)
  };
  if (!map.grid.visible || !map.grid.snap) {
    return {
      x: Number(normalized.x.toFixed(2)),
      y: Number(normalized.y.toFixed(2))
    };
  }
  const grid = calculateMapGrid(map);
  return {
    x: Number(normalizeMapCanvasCoordinate(Math.round(normalized.x / grid.stepX) * grid.stepX).toFixed(2)),
    y: Number(normalizeMapCanvasCoordinate(Math.round(normalized.y / grid.stepY) * grid.stepY).toFixed(2))
  };
}

export function calculateMapScaleBar(
  map: Pick<WorldMap, "distanceWidth">,
  renderedWidth: number,
  targetPixels = 96
) {
  const safeRenderedWidth = Math.max(1, renderedWidth);
  const rawDistance = (map.distanceWidth * Math.max(24, targetPixels)) / safeRenderedWidth;
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(rawDistance, Number.EPSILON)));
  const candidates = [1, 2, 5, 10].map((factor) => factor * magnitude);
  const distance = candidates.reduce((best, candidate) =>
    Math.abs(Math.log(candidate / rawDistance)) < Math.abs(Math.log(best / rawDistance))
      ? candidate
      : best
  );
  return {
    distance: roundMapMetric(distance),
    pixels: Math.max(24, Math.round((distance / map.distanceWidth) * safeRenderedWidth))
  };
}

export function formatMapTravelTime(hours: number, hoursPerDay = 8) {
  if (!Number.isFinite(hours) || hours <= 0) return "未估算";
  const dayLength = clampNumber(hoursPerDay, 8, 1, 24);
  const days = Math.floor(hours / dayLength);
  const remainder = hours - days * dayLength;
  if (days > 0) {
    const remainderLabel = remainder >= 0.05 ? ` ${Number(remainder.toFixed(1))} 小时` : "";
    return `${days} 天${remainderLabel}`;
  }
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} 分钟`;
  return `${Number(hours.toFixed(1))} 小时`;
}

export function calculateMapRouteMetrics(
  route: Pick<
    MapRoute,
    "curveMode" | "stops" | "travelHoursPerDay" | "travelSpeed" | "waypoints"
  >,
  markers: MapMarker[],
  map: Pick<WorldMap, "distanceWidth" | "width" | "height">
) {
  const markerMap = new Map(markers.map((marker) => [marker.id, marker]));
  const segments: Array<{
    distance: number;
    fromMarkerId: string;
    fromStopId: string;
    toMarkerId: string;
    toStopId: string;
    travelHours: number;
  }> = [];
  let totalDistance = 0;
  for (let index = 1; index < route.stops.length; index += 1) {
    const previousStop = route.stops[index - 1];
    const currentStop = route.stops[index];
    const previous = markerMap.get(previousStop.markerId);
    const current = markerMap.get(currentStop.markerId);
    if (!previous || !current) continue;
    const path = sampleMapRoutePath(
      [
        { x: previous.x, y: previous.y },
        ...sortedRouteWaypoints(route, previousStop.id).map((waypoint) => ({
          x: waypoint.x,
          y: waypoint.y
        })),
        { x: current.x, y: current.y }
      ],
      route.curveMode
    );
    const distance = roundMapMetric(path.slice(1).reduce(
      (total, point, pointIndex) => total + calculateMapDistance(map, path[pointIndex], point),
      0
    ));
    totalDistance += distance;
    segments.push({
      distance,
      fromMarkerId: previous.id,
      fromStopId: previousStop.id,
      toMarkerId: current.id,
      toStopId: currentStop.id,
      travelHours: roundMapMetric(distance / route.travelSpeed)
    });
  }
  const distance = roundMapMetric(totalDistance);
  const travelHours = roundMapMetric(distance / route.travelSpeed);
  return {
    distance,
    segments,
    travelDays: roundMapMetric(travelHours / route.travelHoursPerDay),
    travelHours
  };
}

export function calculateMapRouteDistance(
  route: MapRoute,
  markers: MapMarker[],
  map?: Pick<WorldMap, "distanceWidth" | "width" | "height">
) {
  if (map) return calculateMapRouteMetrics(route, markers, map).distance;
  const markerMap = new Map(markers.map((marker) => [marker.id, marker]));
  let distance = 0;
  for (let index = 1; index < route.stops.length; index += 1) {
    const previous = markerMap.get(route.stops[index - 1].markerId);
    const current = markerMap.get(route.stops[index].markerId);
    if (!previous || !current) continue;
    const path = sampleMapRoutePath(
      [
        { x: previous.x, y: previous.y },
        ...sortedRouteWaypoints(route, route.stops[index - 1].id).map((waypoint) => ({
          x: waypoint.x,
          y: waypoint.y
        })),
        { x: current.x, y: current.y }
      ],
      route.curveMode
    );
    distance += path.slice(1).reduce(
      (total, point, pointIndex) => total + Math.hypot(
        point.x - path[pointIndex].x,
        point.y - path[pointIndex].y
      ),
      0
    );
  }
  return Math.round(distance * 10) / 10;
}

export function createDefaultTimelineTrack(worldId: string): TimelineTrack {
  return {
    id: `timeline-track-main:${worldId}`,
    worldId,
    name: "主时间线",
    description: "世界主线事件与关键剧情节点。",
    color: planningColors[0],
    order: 0,
    updatedAt: new Date().toISOString()
  };
}

export function createTimelineTrack(worldId: string, index = 1): TimelineTrack {
  return {
    ...createDefaultTimelineTrack(worldId),
    id: createPlanningId("timeline-track"),
    name: `时间轨道 ${index}`,
    order: index
  };
}

export function normalizeTimelineTrack(
  input: Partial<TimelineTrack>,
  fallbackWorldId: string,
  index = 0
): TimelineTrack {
  const created = index === 0
    ? createDefaultTimelineTrack(fallbackWorldId)
    : createTimelineTrack(fallbackWorldId, index + 1);
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    worldId: input.worldId || fallbackWorldId,
    name: input.name?.trim() || created.name,
    description: input.description ?? "",
    color: normalizeColor(input.color, planningColors[index % planningColors.length]),
    order: Math.round(clampNumber(input.order, index, -10000, 10000)),
    updatedAt: nowOr(input.updatedAt)
  };
}

export function ensureTimelineTracks(
  tracks: Partial<TimelineTrack>[],
  worldIds: string[]
): TimelineTrack[] {
  const validWorldIds = new Set(worldIds);
  const normalized = tracks
    .filter((track) => !track.worldId || validWorldIds.has(track.worldId))
    .map((track, index) =>
      normalizeTimelineTrack(track, track.worldId || worldIds[0] || "", index)
    );
  worldIds.forEach((worldId) => {
    if (!normalized.some((track) => track.worldId === worldId)) {
      normalized.push(createDefaultTimelineTrack(worldId));
    }
  });
  return normalized;
}

export function createTimelineEvent(
  worldId: string,
  trackId: string,
  index = 1,
  sortOrder = Date.now()
): TimelineEvent {
  return {
    id: createPlanningId("timeline"),
    worldId,
    entityId: "",
    questId: "",
    sceneId: "",
    references: [],
    trackId,
    title: `新时间点 ${index}`,
    summary: "",
    displayDate: "未定时间",
    datePrecision: "unknown",
    sortOrder,
    startValue: "",
    endValue: "",
    era: "",
    dependencyIds: [],
    updatedAt: new Date().toISOString()
  };
}

export function normalizeTimelineEvent(
  input: Partial<TimelineEvent>,
  fallbackWorldId: string,
  fallbackTrackId = "",
  index = 1
): TimelineEvent {
  const created = createTimelineEvent(fallbackWorldId, fallbackTrackId, index);
  const references = normalizeProjectObjectRefs(input.references);
  const referenceKeys = new Set(references.map(projectObjectRefKey));
  const legacyReferences = normalizeProjectObjectRefs([
    { kind: "entity", id: input.entityId },
    { kind: "quest", id: input.questId },
    { kind: "scene", id: input.sceneId }
  ]).filter((reference) => !referenceKeys.has(projectObjectRefKey(reference)));
  const inferredPrecision: TimelineDatePrecision = input.startValue && input.endValue
    ? "range"
    : input.displayDate && input.displayDate !== "未定时间"
      ? "exact"
      : "unknown";
  return {
    ...created,
    ...input,
    id: input.id || created.id,
    worldId: input.worldId || fallbackWorldId,
    entityId: input.entityId || "",
    questId: input.questId || "",
    sceneId: input.sceneId || "",
    references: [...references, ...legacyReferences],
    trackId: input.trackId || fallbackTrackId,
    title: input.title?.trim() || "",
    summary: input.summary ?? "",
    displayDate: input.displayDate?.trim() || "未定时间",
    datePrecision: timelineDatePrecisions.has(input.datePrecision as TimelineDatePrecision)
      ? (input.datePrecision as TimelineDatePrecision)
      : inferredPrecision,
    sortOrder: clampNumber(input.sortOrder, Date.now() + index, -1e15, 1e15),
    startValue: input.startValue ?? "",
    endValue: input.endValue ?? "",
    era: input.era ?? "",
    dependencyIds: Array.from(new Set(asStringArray(input.dependencyIds))),
    updatedAt: nowOr(input.updatedAt)
  };
}

export function sortTimelineEvents(events: TimelineEvent[]) {
  return [...events].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder ||
      left.displayDate.localeCompare(right.displayDate, "zh-CN") ||
      left.id.localeCompare(right.id)
  );
}

export function detectTimelineDependencyCycles(events: TimelineEvent[]) {
  const eventIds = new Set(events.map((event) => event.id));
  const dependencies = new Map(
    events.map((event) => [
      event.id,
      event.dependencyIds.filter((dependencyId) => eventIds.has(dependencyId))
    ])
  );
  const state = new Map<string, 0 | 1 | 2>();
  const stack: string[] = [];
  const cycleIds = new Set<string>();

  function visit(eventId: string) {
    const currentState = state.get(eventId) ?? 0;
    if (currentState === 2) return;
    if (currentState === 1) {
      const start = stack.lastIndexOf(eventId);
      stack.slice(Math.max(0, start)).forEach((id) => cycleIds.add(id));
      cycleIds.add(eventId);
      return;
    }
    state.set(eventId, 1);
    stack.push(eventId);
    dependencies.get(eventId)?.forEach(visit);
    stack.pop();
    state.set(eventId, 2);
  }

  events.forEach((event) => visit(event.id));
  return Array.from(cycleIds).sort();
}

export function timelineEventMatchesReference(
  event: TimelineEvent,
  reference: ProjectObjectRef | { entityId?: string; questId?: string; sceneId?: string }
) {
  if ("kind" in reference) {
    const key = projectObjectRefKey(reference);
    if (event.references.some((item) => projectObjectRefKey(item) === key)) return true;
    if (reference.kind === "entity") return event.entityId === reference.id;
    if (reference.kind === "quest") return event.questId === reference.id;
    if (reference.kind === "scene") return event.sceneId === reference.id;
    return false;
  }
  return Boolean(
    (reference.entityId && event.entityId === reference.entityId) ||
      (reference.questId && event.questId === reference.questId) ||
      (reference.sceneId && event.sceneId === reference.sceneId)
  );
}

const sharedPlanningReferenceKinds = new Set<ProjectObjectKind>([
  "entity",
  "quest",
  "scene",
  "story-variable",
  "asset",
  "milestone",
  "review-issue",
  "relation"
]);

export function mapMarkerMatchesTimelineEvent(
  marker: MapMarker,
  event: TimelineEvent
) {
  const markerKeys = new Set(marker.references.map(projectObjectRefKey));
  const eventKeys = new Set(event.references.map(projectObjectRefKey));
  if (eventKeys.has(projectObjectRefKey({ kind: "map-marker", id: marker.id }))) {
    return true;
  }
  if (markerKeys.has(projectObjectRefKey({ kind: "timeline-event", id: event.id }))) {
    return true;
  }
  if (
    marker.references.some(
      (reference) =>
        sharedPlanningReferenceKinds.has(reference.kind) &&
        eventKeys.has(projectObjectRefKey(reference))
    )
  ) {
    return true;
  }
  return Boolean(
    (marker.entityId && marker.entityId === event.entityId) ||
      (marker.questId && marker.questId === event.questId) ||
      (marker.sceneId && marker.sceneId === event.sceneId)
  );
}

export function formatTimelineInterval(event: TimelineEvent) {
  if (event.datePrecision === "unknown") return "时间未知";
  if (event.datePrecision === "approximate") return `约 ${event.displayDate || event.startValue || "未定"}`;
  if (event.datePrecision === "custom") {
    return [event.era, event.displayDate].filter(Boolean).join(" · ") || "自定义纪元";
  }
  if (event.startValue && event.endValue) return `${event.startValue} - ${event.endValue}`;
  return event.displayDate || event.startValue || event.endValue || "未设置时间";
}

function idSet(value: Iterable<string>) {
  return value instanceof Set ? value : new Set(value);
}

export function validateMapPlanning(input: {
  worldId: string;
  maps: WorldMap[];
  markers: MapMarker[];
  routes: MapRoute[];
  layers?: MapLayer[];
  groups?: MapMarkerGroup[];
  entityIds: Iterable<string>;
  questIds: Iterable<string>;
  sceneIds: Iterable<string>;
}): PlanningIssue[] {
  const mapIds = new Set(input.maps.filter((map) => map.worldId === input.worldId).map((map) => map.id));
  const markers = input.markers.filter((marker) => mapIds.has(marker.mapId));
  const markerMap = new Map(markers.map((marker) => [marker.id, marker]));
  const entities = idSet(input.entityIds);
  const quests = idSet(input.questIds);
  const scenes = idSet(input.sceneIds);
  const layers = input.layers || [];
  const groups = input.groups || [];
  const layerIds = new Set(layers.filter((layer) => mapIds.has(layer.mapId)).map((layer) => layer.id));
  const groupIds = new Set(groups.filter((group) => mapIds.has(group.mapId)).map((group) => group.id));
  const issues: PlanningIssue[] = [];

  input.maps
    .filter((map) => map.worldId === input.worldId && !map.imageUrl)
    .forEach((map) =>
      issues.push({
        id: `map-image:${map.id}`,
        severity: "warning",
        title: `${map.title}还没有地图图片`,
        detail: "地图标记暂时使用默认底图",
        targetType: "map",
        targetId: map.id
      })
    );

  input.markers.forEach((marker) => {
    if (!mapIds.has(marker.mapId)) {
      issues.push({
        id: `marker-map:${marker.id}`,
        severity: "error",
        title: `${marker.label}关联的地图不存在`,
        detail: marker.mapId || "未关联地图",
        targetType: "marker",
        targetId: marker.id
      });
    }
    if (layers.length && !layerIds.has(marker.layerId)) {
      issues.push({
        id: `marker-layer:${marker.id}`,
        severity: "error",
        title: `${marker.label}关联的地图图层不存在`,
        detail: marker.layerId || "未关联图层",
        targetType: "marker",
        targetId: marker.id
      });
    }
    if (marker.groupId && !groupIds.has(marker.groupId)) {
      issues.push({
        id: `marker-group:${marker.id}`,
        severity: "error",
        title: `${marker.label}关联的标记组不存在`,
        detail: marker.groupId,
        targetType: "marker",
        targetId: marker.id
      });
    }
    const missing = [
      marker.entityId && !entities.has(marker.entityId) ? "条目" : "",
      marker.questId && !quests.has(marker.questId) ? "任务" : "",
      marker.sceneId && !scenes.has(marker.sceneId) ? "剧情场景" : ""
    ].filter(Boolean);
    if (missing.length) {
      issues.push({
        id: `marker-reference:${marker.id}`,
        severity: "error",
        title: `${marker.label}包含失效关联`,
        detail: missing.join("、"),
        targetType: "marker",
        targetId: marker.id
      });
    }
  });

  input.routes
    .filter((route) => route.worldId === input.worldId)
    .forEach((route) => {
      if (!mapIds.has(route.mapId)) {
        issues.push({
          id: `route-map:${route.id}`,
          severity: "error",
          title: `${route.title}关联的地图不存在`,
          detail: route.mapId || "未关联地图",
          targetType: "route",
          targetId: route.id
        });
      }
      const invalidStops = route.stops.filter((stop) => {
        const marker = markerMap.get(stop.markerId);
        return !marker || marker.mapId !== route.mapId;
      });
      if (invalidStops.length) {
        issues.push({
          id: `route-stops:${route.id}`,
          severity: "error",
          title: `${route.title}包含失效停靠点`,
          detail: invalidStops.map((stop) => stop.title).join("、"),
          targetType: "route",
          targetId: route.id
        });
      }
      if (route.status !== "draft" && route.stops.length < 2) {
        issues.push({
          id: `route-short:${route.id}`,
          severity: "warning",
          title: `${route.title}还不能形成路线`,
          detail: "进行中或已完成路线至少需要两个停靠点",
          targetType: "route",
          targetId: route.id
        });
      }
    });

  return issues;
}

export function validateTimelinePlanning(input: {
  worldId: string;
  tracks: TimelineTrack[];
  events: TimelineEvent[];
  entityIds: Iterable<string>;
  questIds: Iterable<string>;
  sceneIds: Iterable<string>;
  referenceIds?: Partial<Record<ProjectObjectKind, Iterable<string>>>;
}): PlanningIssue[] {
  const tracks = input.tracks.filter((track) => track.worldId === input.worldId);
  const trackIds = new Set(tracks.map((track) => track.id));
  const events = input.events.filter((event) => event.worldId === input.worldId);
  const eventIds = new Set(events.map((event) => event.id));
  const entities = idSet(input.entityIds);
  const quests = idSet(input.questIds);
  const scenes = idSet(input.sceneIds);
  const referenceIds = new Map<ProjectObjectKind, Set<string>>([
    ["entity", entities],
    ["quest", quests],
    ["scene", scenes],
    ["timeline-event", eventIds]
  ]);
  Object.entries(input.referenceIds || {}).forEach(([kind, ids]) => {
    if (ids) referenceIds.set(kind as ProjectObjectKind, idSet(ids));
  });
  const cycleIds = new Set(detectTimelineDependencyCycles(events));
  const issues: PlanningIssue[] = [];
  const sortKeys = new Set<string>();

  tracks.forEach((track) => {
    const key = `${track.order}`;
    if (sortKeys.has(key)) {
      issues.push({
        id: `track-order:${track.id}`,
        severity: "warning",
        title: `${track.name}与其他轨道使用相同顺序`,
        detail: `轨道顺序 ${track.order}`,
        targetType: "track",
        targetId: track.id
      });
    }
    sortKeys.add(key);
  });

  events.forEach((event) => {
    if (!trackIds.has(event.trackId)) {
      issues.push({
        id: `timeline-track:${event.id}`,
        severity: "error",
        title: `${event.title || event.displayDate}关联的时间轨道不存在`,
        detail: event.trackId || "未选择轨道",
        targetType: "timeline",
        targetId: event.id
      });
    }
    const missing = [
      event.entityId && !entities.has(event.entityId) ? "条目" : "",
      event.questId && !quests.has(event.questId) ? "任务" : "",
      event.sceneId && !scenes.has(event.sceneId) ? "剧情场景" : "",
      ...event.dependencyIds
        .filter((dependencyId) => !eventIds.has(dependencyId))
        .map(() => "前置事件")
    ].filter(Boolean);
    if (missing.length) {
      issues.push({
        id: `timeline-reference:${event.id}`,
        severity: "error",
        title: `${event.title || event.displayDate}包含失效关联`,
        detail: Array.from(new Set(missing)).join("、"),
        targetType: "timeline",
        targetId: event.id
      });
    }
    const missingUnifiedKinds = event.references
      .filter((reference) => {
        const ids = referenceIds.get(reference.kind);
        return ids ? !ids.has(reference.id) : false;
      })
      .map((reference) => reference.kind);
    if (missingUnifiedKinds.length) {
      issues.push({
        id: `timeline-unified-reference:${event.id}`,
        severity: "error",
        title: `${event.title || event.displayDate}包含失效的多对象关联`,
        detail: Array.from(new Set(missingUnifiedKinds)).join("、"),
        targetType: "timeline",
        targetId: event.id
      });
    }
    if (event.dependencyIds.includes(event.id)) {
      issues.push({
        id: `timeline-self:${event.id}`,
        severity: "error",
        title: `${event.title || event.displayDate}把自身设为前置事件`,
        detail: "移除此依赖后才能形成有效顺序",
        targetType: "timeline",
        targetId: event.id
      });
    }
    if (cycleIds.has(event.id)) {
      issues.push({
        id: `timeline-cycle:${event.id}`,
        severity: "error",
        title: `${event.title || event.displayDate}处于循环依赖中`,
        detail: "时间事件的前置关系不能形成闭环",
        targetType: "timeline",
        targetId: event.id
      });
    }
    const start = Number(event.startValue);
    const end = Number(event.endValue);
    if (event.startValue && event.endValue && Number.isFinite(start) && Number.isFinite(end) && start > end) {
      issues.push({
        id: `timeline-range:${event.id}`,
        severity: "warning",
        title: `${event.title || event.displayDate}的时间区间顺序相反`,
        detail: `${event.startValue} > ${event.endValue}`,
        targetType: "timeline",
        targetId: event.id
      });
    }
  });

  return issues;
}
