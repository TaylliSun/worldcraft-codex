import {
  isMapPointInsidePolygon,
  type MapMarker,
  type MapRegion,
  type MapRoute,
  type WorldMap
} from "./world-planning";

export type MapReviewTargetType = "map" | "marker" | "region" | "route";
export type MapReviewSeverity = "error" | "info" | "warning";

export type MapReviewFinding = {
  id: string;
  severity: MapReviewSeverity;
  title: string;
  detail: string;
  targetId: string;
  targetType: MapReviewTargetType;
};

export type MapAiSuggestion = MapReviewFinding & {
  patch: Record<string, unknown>;
};

export type MapVersionComparison = {
  changedFields: string[];
  changedRegionIds: string[];
  currentRegionCount: number;
  previousRegionCount: number;
  removedRegionIds: string[];
  addedRegionIds: string[];
};

type MapReviewInput = {
  map: WorldMap;
  markers: MapMarker[];
  routes: MapRoute[];
};

type Bounds = { bottom: number; left: number; right: number; top: number };

function normalizedTitle(value: string) {
  return value.trim().toLocaleLowerCase("zh-CN");
}

function regionBounds(region: Pick<MapRegion, "points">): Bounds {
  return {
    bottom: Math.max(...region.points.map((point) => point.y)),
    left: Math.min(...region.points.map((point) => point.x)),
    right: Math.max(...region.points.map((point) => point.x)),
    top: Math.min(...region.points.map((point) => point.y))
  };
}

function boundsOverlap(left: Bounds, right: Bounds) {
  return left.left <= right.right
    && left.right >= right.left
    && left.top <= right.bottom
    && left.bottom >= right.top;
}

function orientation(a: MapRegion["points"][number], b: MapRegion["points"][number], c: MapRegion["points"][number]) {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
}

function segmentsIntersect(
  a: MapRegion["points"][number],
  b: MapRegion["points"][number],
  c: MapRegion["points"][number],
  d: MapRegion["points"][number]
) {
  const first = orientation(a, b, c);
  const second = orientation(a, b, d);
  const third = orientation(c, d, a);
  const fourth = orientation(c, d, b);
  return ((first > 0 && second < 0) || (first < 0 && second > 0))
    && ((third > 0 && fourth < 0) || (third < 0 && fourth > 0));
}

function polygonSelfIntersects(points: MapRegion["points"]) {
  for (let leftIndex = 0; leftIndex < points.length; leftIndex += 1) {
    const leftNext = (leftIndex + 1) % points.length;
    for (let rightIndex = leftIndex + 1; rightIndex < points.length; rightIndex += 1) {
      const rightNext = (rightIndex + 1) % points.length;
      if (
        leftIndex === rightIndex
        || leftNext === rightIndex
        || rightNext === leftIndex
      ) {
        continue;
      }
      if (segmentsIntersect(
        points[leftIndex],
        points[leftNext],
        points[rightIndex],
        points[rightNext]
      )) return true;
    }
  }
  return false;
}

function polygonsOverlap(left: MapRegion, right: MapRegion) {
  const leftBounds = regionBounds(left);
  const rightBounds = regionBounds(right);
  if (!boundsOverlap(leftBounds, rightBounds)) return false;
  if (left.points.some((point) => isMapPointInsidePolygon(point, right.points))) return true;
  if (right.points.some((point) => isMapPointInsidePolygon(point, left.points))) return true;
  for (let leftIndex = 0; leftIndex < left.points.length; leftIndex += 1) {
    const leftNext = (leftIndex + 1) % left.points.length;
    for (let rightIndex = 0; rightIndex < right.points.length; rightIndex += 1) {
      const rightNext = (rightIndex + 1) % right.points.length;
      if (segmentsIntersect(
        left.points[leftIndex],
        left.points[leftNext],
        right.points[rightIndex],
        right.points[rightNext]
      )) return true;
    }
  }
  return false;
}

function duplicateTitleFindings(
  findings: MapReviewFinding[],
  items: Array<{ id: string; title: string }>,
  targetType: MapReviewTargetType,
  label: string
) {
  const byTitle = new Map<string, Array<{ id: string; title: string }>>();
  items.forEach((item) => {
    const key = normalizedTitle(item.title);
    if (!key) return;
    const matches = byTitle.get(key) ?? [];
    matches.push(item);
    byTitle.set(key, matches);
  });
  byTitle.forEach((matches) => {
    if (matches.length < 2) return;
    matches.forEach((item) => findings.push({
      id: `duplicate:${targetType}:${item.id}`,
      severity: "warning",
      title: `${label}名称重复：${item.title}`,
      detail: `同一地图中共有 ${matches.length} 个同名${label}，引用和搜索时容易混淆。`,
      targetId: item.id,
      targetType
    }));
  });
}

export function analyzeMapConflicts(input: MapReviewInput): MapReviewFinding[] {
  const findings: MapReviewFinding[] = [];
  duplicateTitleFindings(findings, input.markers.map((marker) => ({
    id: marker.id,
    title: marker.label
  })), "marker", "标记");
  duplicateTitleFindings(findings, input.routes, "route", "路线");
  duplicateTitleFindings(findings, input.map.regions, "region", "区域");

  const collisionCellSize = 1.5;
  const cells = new Map<string, MapMarker[]>();
  input.markers.forEach((marker) => {
    const cellX = Math.floor(marker.x / collisionCellSize);
    const cellY = Math.floor(marker.y / collisionCellSize);
    for (let x = cellX - 1; x <= cellX + 1; x += 1) {
      for (let y = cellY - 1; y <= cellY + 1; y += 1) {
        const matches = cells.get(`${x}:${y}`) ?? [];
        const collision = matches.find((candidate) =>
          Math.hypot(candidate.x - marker.x, candidate.y - marker.y) < 0.8
        );
        if (collision) {
          findings.push({
            id: `marker-collision:${collision.id}:${marker.id}`,
            severity: "warning",
            title: `标记位置重叠：${collision.label} / ${marker.label}`,
            detail: "两个标记在常用倍率下会共用同一个命中区域。",
            targetId: marker.id,
            targetType: "marker"
          });
          x = cellX + 2;
          break;
        }
      }
    }
    const ownKey = `${cellX}:${cellY}`;
    cells.set(ownKey, [...(cells.get(ownKey) ?? []), marker]);
    if (!marker.references.length) {
      findings.push({
        id: `marker-unlinked:${marker.id}`,
        severity: "info",
        title: `${marker.label}尚未关联剧情对象`,
        detail: "关联人物、任务、场景或时间点后，AI 才能理解这个位置的叙事作用。",
        targetId: marker.id,
        targetType: "marker"
      });
    }
  });

  input.map.regions.forEach((region) => {
    if (polygonSelfIntersects(region.points)) {
      findings.push({
        id: `region-self-intersection:${region.id}`,
        severity: "error",
        title: `${region.title}的边界发生自交`,
        detail: "交叉边界会让面积、镂空与导出结果产生歧义。",
        targetId: region.id,
        targetType: "region"
      });
    }
    if (region.holes.some((hole) => hole.some((point) => !isMapPointInsidePolygon(point, region.points)))) {
      findings.push({
        id: `region-hole-outside:${region.id}`,
        severity: "error",
        title: `${region.title}包含越界镂空`,
        detail: "至少一个镂空顶点不在区域外边界内。",
        targetId: region.id,
        targetType: "region"
      });
    }
  });

  const overlapLimit = Math.min(input.map.regions.length, 250);
  for (let leftIndex = 0; leftIndex < overlapLimit; leftIndex += 1) {
    const left = input.map.regions[leftIndex];
    if (left.points.length < 3) continue;
    for (let rightIndex = leftIndex + 1; rightIndex < overlapLimit; rightIndex += 1) {
      const right = input.map.regions[rightIndex];
      if (right.points.length < 3 || !polygonsOverlap(left, right)) continue;
      findings.push({
        id: `region-overlap:${left.id}:${right.id}`,
        severity: "info",
        title: `区域相交：${left.title} / ${right.title}`,
        detail: "如果这是层级或争议领土，可以保留；否则建议调整边界或顺序。",
        targetId: right.id,
        targetType: "region"
      });
      if (findings.length >= 100) return findings;
    }
  }

  input.routes.forEach((route) => {
    const seen = new Set<string>();
    const repeated = route.stops.find((stop) => {
      if (seen.has(stop.markerId)) return true;
      seen.add(stop.markerId);
      return false;
    });
    if (repeated) {
      findings.push({
        id: `route-repeat:${route.id}`,
        severity: "warning",
        title: `${route.title}重复经过同一标记`,
        detail: "请确认这是返程/回环，而不是误加的停靠点。",
        targetId: route.id,
        targetType: "route"
      });
    }
    if (!route.references.length) {
      findings.push({
        id: `route-unlinked:${route.id}`,
        severity: "info",
        title: `${route.title}尚未关联任务或场景`,
        detail: "关联剧情对象后，可以按任务阶段审阅路线是否完整。",
        targetId: route.id,
        targetType: "route"
      });
    }
  });

  return findings.slice(0, 100);
}

export const mapAiReviewSystemPrompt = `你是游戏叙事与关卡地图的高级编辑。请审阅地图结构、空间叙事、任务动线、场景节奏、命名清晰度和引用完整性。只输出 JSON：{"suggestions":[{"id":"...","severity":"error|warning|info","title":"...","detail":"...","targetType":"map|marker|region|route","targetId":"...","patch":{}}]}。patch 只能包含目标对象可安全直接修改的字段；没有可靠修改时返回空对象。不要编造不存在的 ID。`;

export function buildMapAiReviewPrompt(input: MapReviewInput) {
  return JSON.stringify({
    task: "审阅当前地图并给出可定位、可执行的改进建议",
    map: {
      id: input.map.id,
      title: input.map.title,
      description: input.map.description,
      width: input.map.width,
      height: input.map.height,
      distanceWidth: input.map.distanceWidth,
      distanceUnit: input.map.distanceUnit,
      regions: input.map.regions.map((region) => ({
        id: region.id,
        title: region.title,
        kind: region.kind,
        pointCount: region.points.length,
        holeCount: region.holes.length,
        references: region.references
      }))
    },
    markers: input.markers.map((marker) => ({
      id: marker.id,
      label: marker.label,
      markerType: marker.markerType,
      x: marker.x,
      y: marker.y,
      description: marker.description,
      references: marker.references
    })),
    routes: input.routes.map((route) => ({
      id: route.id,
      title: route.title,
      status: route.status,
      curveMode: route.curveMode,
      stopMarkerIds: route.stops.map((stop) => stop.markerId),
      description: route.description,
      references: route.references
    }))
  }, null, 2);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function parseMapAiReviewResponse(text: string): {
  error?: string;
  suggestions: MapAiSuggestion[];
} {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidates = [fenced, text].filter((value): value is string => Boolean(value));
  let parsed: Record<string, unknown> | null = null;
  for (const candidate of candidates) {
    try {
      parsed = asRecord(JSON.parse(candidate.trim()));
      if (parsed) break;
    } catch {
      const start = candidate.indexOf("{");
      const end = candidate.lastIndexOf("}");
      if (start < 0 || end <= start) continue;
      try {
        parsed = asRecord(JSON.parse(candidate.slice(start, end + 1)));
        if (parsed) break;
      } catch {
        // Continue to the next extraction candidate.
      }
    }
  }
  if (!parsed || !Array.isArray(parsed.suggestions)) {
    return { error: "AI 返回内容不是有效的地图建议 JSON。", suggestions: [] };
  }
  const validTargetTypes = new Set<MapReviewTargetType>(["map", "marker", "region", "route"]);
  const validSeverities = new Set<MapReviewSeverity>(["error", "info", "warning"]);
  const suggestions = parsed.suggestions.slice(0, 50).flatMap((value, index) => {
    const item = asRecord(value);
    if (!item) return [];
    const targetType = String(item.targetType ?? "") as MapReviewTargetType;
    const targetId = String(item.targetId ?? "").trim();
    const title = String(item.title ?? "").trim();
    if (!validTargetTypes.has(targetType) || !targetId || !title) return [];
    const patch = asRecord(item.patch) ?? {};
    return [{
      id: String(item.id ?? `map-ai-${index + 1}`).trim() || `map-ai-${index + 1}`,
      severity: validSeverities.has(item.severity as MapReviewSeverity)
        ? item.severity as MapReviewSeverity
        : "info",
      title,
      detail: String(item.detail ?? "").trim(),
      targetId,
      targetType,
      patch: Object.fromEntries(
        Object.entries(patch).filter(([key]) => key !== "__proto__" && key !== "constructor")
      )
    } satisfies MapAiSuggestion];
  });
  return suggestions.length
    ? { suggestions }
    : { error: "AI 没有返回可定位的地图建议。", suggestions: [] };
}

export function compareMapVersions(
  current: WorldMap,
  previous: WorldMap
): MapVersionComparison {
  const currentRegions = new Map(current.regions.map((region) => [region.id, region]));
  const previousRegions = new Map(previous.regions.map((region) => [region.id, region]));
  const addedRegionIds = current.regions
    .filter((region) => !previousRegions.has(region.id))
    .map((region) => region.id);
  const removedRegionIds = previous.regions
    .filter((region) => !currentRegions.has(region.id))
    .map((region) => region.id);
  const changedRegionIds = current.regions
    .filter((region) => {
      const oldRegion = previousRegions.get(region.id);
      return oldRegion && JSON.stringify(region) !== JSON.stringify(oldRegion);
    })
    .map((region) => region.id);
  const comparedFields: Array<keyof WorldMap> = [
    "title",
    "description",
    "imageUrl",
    "imageTransform",
    "width",
    "height",
    "distanceWidth",
    "distanceUnit",
    "grid",
    "storyPhases",
    "viewBookmarks",
    "savedFilters"
  ];
  const changedFields = comparedFields.filter((field) =>
    JSON.stringify(current[field]) !== JSON.stringify(previous[field])
  );
  return {
    addedRegionIds,
    changedFields,
    changedRegionIds,
    currentRegionCount: current.regions.length,
    previousRegionCount: previous.regions.length,
    removedRegionIds
  };
}
