const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");

require.extensions[".ts"] = (module, filePath) => {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true
    },
    fileName: filePath
  }).outputText;
  module._compile(output, filePath);
};

const planning = require(path.join(root, "app", "world-planning.ts"));
const mapExport = require(path.join(root, "app", "map-export.ts"));
const mapIntelligence = require(path.join(root, "app", "map-intelligence.ts"));
const worldId = "world-test";
const map = planning.normalizeWorldMap(
  { id: "map-a", title: "  ", width: 10, height: 99999 },
  worldId
);
assert.equal(map.worldId, worldId);
assert.equal(map.title.length > 0, true);
assert.equal(map.width, 320);
assert.equal(map.height, 99999);
assert.equal(map.distanceWidth, 100);
assert.equal(map.distanceUnit, "km");
assert.equal(map.customDistanceUnit, "距离单位");
assert.equal(map.grid.visible, false);
assert.equal(map.grid.columns, 12);
assert.deepEqual(map.regions, []);
assert.deepEqual(map.storyPhases, []);
assert.deepEqual(map.viewBookmarks, []);
assert.deepEqual(map.savedFilters, []);
assert.deepEqual(map.imageTransform, {
  flipX: false,
  flipY: false,
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0
});

const advancedMap = planning.normalizeWorldMap({
  id: "map-advanced",
  viewBookmarks: [{
    id: "view-a",
    title: "  北境视图  ",
    centerX: -45,
    centerY: 130,
    zoom: 99,
    mode: "regions",
    showLabels: false
  }],
  savedFilters: [{
    id: "filter-a",
    title: "  主线地点  ",
    mode: "markers",
    query: "王都",
    markerKinds: ["location", "location", "invalid"],
    regionKinds: ["territory"],
    routeStatuses: ["active", "invalid"],
    layerIds: ["layer-a", "layer-a"],
    groupIds: ["group-a"]
  }]
}, worldId);
assert.equal(advancedMap.viewBookmarks[0].title, "北境视图");
assert.equal(advancedMap.viewBookmarks[0].zoom, 4);
assert.equal(advancedMap.viewBookmarks[0].showLabels, false);
assert.deepEqual(advancedMap.savedFilters[0].markerKinds, ["location"]);
assert.deepEqual(advancedMap.savedFilters[0].routeStatuses, ["active"]);
assert.deepEqual(advancedMap.savedFilters[0].layerIds, ["layer-a"]);

const storyPhase = planning.normalizeMapStoryPhase({
  id: "phase-siege",
  title: "  Siege  ",
  order: -4,
  hiddenLayerIds: ["layer-a", "layer-a", ""],
  hiddenMarkerIds: ["marker-a"]
});
assert.equal(storyPhase.title, "Siege");
assert.equal(storyPhase.order, 0);
assert.deepEqual(storyPhase.hiddenLayerIds, ["layer-a"]);
assert.deepEqual(storyPhase.hiddenMarkerIds, ["marker-a"]);

const transformedMap = planning.normalizeWorldMap(
  {
    id: "map-transformed",
    imageTransform: { flipX: true, flipY: true, x: 1200, y: -1500, scale: 99, rotation: 450 }
  },
  worldId
);
assert.deepEqual(
  transformedMap.imageTransform,
  { flipX: true, flipY: true, x: 1200, y: -1500, scale: 99, rotation: 90 }
);

const hierarchyMaps = planning.normalizeMapHierarchy([
  planning.normalizeWorldMap({ id: "map-root", title: "Root" }, worldId),
  planning.normalizeWorldMap({ id: "map-region", title: "Region", parentMapId: "map-root" }, worldId),
  planning.normalizeWorldMap({ id: "map-city", title: "City", parentMapId: "map-region", entryMarkerId: "marker-gate" }, worldId)
]);
assert.deepEqual(
  planning.createMapHierarchyEntries(hierarchyMaps).map((entry) => [entry.map.id, entry.depth]),
  [["map-root", 0], ["map-region", 1], ["map-city", 2]]
);
assert.deepEqual(
  planning.getMapHierarchyPath(hierarchyMaps, "map-city").map((mapItem) => mapItem.id),
  ["map-root", "map-region", "map-city"]
);
assert.deepEqual(
  [...planning.getMapDescendantIds(hierarchyMaps, "map-root")].sort(),
  ["map-city", "map-region"]
);
const cyclicHierarchy = planning.normalizeMapHierarchy([
  planning.normalizeWorldMap({ id: "map-cycle-a", parentMapId: "map-cycle-b" }, worldId),
  planning.normalizeWorldMap({ id: "map-cycle-b", parentMapId: "map-cycle-a" }, worldId),
  planning.normalizeWorldMap({ id: "map-orphan", parentMapId: "missing", entryMarkerId: "marker-x" }, worldId)
]);
assert.equal(cyclicHierarchy.some((mapItem) => !mapItem.parentMapId), true);
assert.equal(cyclicHierarchy.find((mapItem) => mapItem.id === "map-orphan").entryMarkerId, "");

const calibratedMap = planning.normalizeWorldMap(
  {
    id: "map-calibrated",
    width: 1600,
    height: 800,
    distanceWidth: 800,
    distanceUnit: "custom",
    customDistanceUnit: "里格",
    grid: { visible: true, snap: true, labels: true, columns: 99, color: "#123456", opacity: 2 }
  },
  worldId
);
assert.equal(calibratedMap.distanceWidth, 800);
assert.equal(calibratedMap.distanceUnit, "custom");
assert.equal(calibratedMap.customDistanceUnit, "里格");
assert.equal(calibratedMap.grid.visible, true);
assert.equal(calibratedMap.grid.columns, 24);
assert.equal(calibratedMap.grid.opacity, 0.8);
const calibratedGrid = planning.calculateMapGrid(calibratedMap);
assert.equal(calibratedGrid.columns, 24);
assert.equal(calibratedGrid.rows, 12);
assert.equal(Number(calibratedGrid.stepX.toFixed(3)), 4.167);
assert.equal(Number(calibratedGrid.stepY.toFixed(3)), 8.333);
assert.deepEqual(
  planning.snapMapPointToGrid(calibratedMap, { x: 13, y: 22 }),
  { x: 12.5, y: 25 }
);
assert.equal(
  planning.calculateMapDistance(calibratedMap, { x: 0, y: 0 }, { x: 100, y: 100 }),
  894.4
);
assert.equal(planning.formatMapDistance(894.4, calibratedMap), "894 里格");
assert.deepEqual(
  planning.calculateMapScaleBar(calibratedMap, 800, 100),
  { distance: 100, pixels: 100 }
);

const region = planning.normalizeMapRegion({
  id: "region-a",
  title: "测试区域",
  kind: "unknown",
  opacity: 2,
  points: [
    { x: -5, y: 0 },
    { x: 10, y: 120 },
    { x: 10, y: 10 },
    { x: 0, y: 10 }
  ],
  references: [
    { kind: "entity", id: "entity-a" },
    { kind: "entity", id: "entity-a" }
  ]
});
assert.equal(region.kind, "custom");
assert.equal(region.opacity, 0.75);
assert.equal(region.points[0].x, -5);
assert.equal(region.points[1].y, 120);
assert.deepEqual(region.references, [{ kind: "entity", id: "entity-a" }]);
assert.deepEqual(region.holes, []);
assert.deepEqual(region.labelPlacement, { offsetX: 0, offsetY: 0, locked: false, minZoom: 0.1 });
const regionWithHole = planning.normalizeMapRegion({
  id: "region-hole",
  points: [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 20 }],
  holes: [
    [{ x: 2, y: 2 }, { x: 4, y: 2 }, { x: 3, y: 4 }],
    [{ x: 9, y: 9 }, { x: 10, y: 10 }]
  ],
  labelPlacement: { offsetX: 12, offsetY: -7, locked: true, minZoom: 99 }
});
assert.equal(regionWithHole.holes.length, 1);
assert.deepEqual(regionWithHole.labelPlacement, { offsetX: 12, offsetY: -7, locked: true, minZoom: 4 });
const squareMetrics = planning.calculateMapRegionMetrics({
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 }
  ]
});
assert.equal(squareMetrics.areaPercent, 1);
assert.equal(squareMetrics.perimeter, 40);
assert.equal(squareMetrics.centroid.x, 5);
assert.equal(squareMetrics.centroid.y, 5);
const spatialSquareMetrics = planning.calculateMapRegionMetrics(
  {
    points: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 }
    ]
  },
  { distanceWidth: 100, width: 1000, height: 1000 }
);
assert.equal(spatialSquareMetrics.perimeter, 40);
const holedSquareMetrics = planning.calculateMapRegionMetrics({
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 }
  ],
  holes: [[
    { x: 4, y: 4 },
    { x: 6, y: 4 },
    { x: 6, y: 6 },
    { x: 4, y: 6 }
  ]]
});
assert.equal(holedSquareMetrics.areaPercent, 0.96);
assert.equal(holedSquareMetrics.perimeter, 48);
assert.equal(holedSquareMetrics.centroid.x, 5);
assert.equal(holedSquareMetrics.centroid.y, 5);
assert.equal(planning.isMapPointInsidePolygon({ x: 5, y: 5 }, [
  { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }
]), true);
assert.equal(planning.isMapPointInsidePolygon({ x: 50, y: 50 }, [
  { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }
]), false);
assert.equal(
  planning.createMapRegionSvgPath(regionWithHole.points, regionWithHole.holes).split("M ").length - 1,
  2
);
const simplifiedBoundary = planning.simplifyMapRegionPoints([
  { x: 0, y: 0 },
  { x: 5, y: 0.01 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 }
], 0.1);
assert.equal(simplifiedBoundary.length, 4);
assert.equal(planning.smoothMapRegionPoints(simplifiedBoundary).length, 8);

const markerA = planning.normalizeMapMarker({
  id: "marker-a",
  mapId: map.id,
  entityId: "entity-a",
  x: -3,
  y: 200,
  label: "A",
  markerType: "location"
});
const markerB = planning.normalizeMapMarker({
  id: "marker-b",
  mapId: map.id,
  x: 3,
  y: 4,
  label: "B",
  markerType: "unknown",
  color: "invalid"
});
assert.equal(markerA.x, -3);
assert.equal(markerA.y, 200);
assert.equal(markerA.markerType, "location");
assert.deepEqual(markerA.references, [{ kind: "entity", id: "entity-a" }]);
assert.equal(markerA.iconUrl, "");
assert.deepEqual(markerA.labelPlacement, { offsetX: 0, offsetY: 0, locked: false, minZoom: 0.1 });
assert.equal(markerA.layerId, planning.defaultMapLayerId(map.id));
assert.equal(markerB.markerType, "custom");
assert.equal(markerB.color, planning.planningColors[0]);
assert.deepEqual(
  planning.snapMapPointToGrid(calibratedMap, { x: -13, y: 122 }),
  { x: -12.5, y: 125 }
);
const farCanvasMarker = planning.createMapMarker(
  map.id,
  -planning.MAP_CANVAS_COORDINATE_LIMIT * 2,
  planning.MAP_CANVAS_COORDINATE_LIMIT * 2
);
assert.equal(farCanvasMarker.x, -planning.MAP_CANVAS_COORDINATE_LIMIT);
assert.equal(farCanvasMarker.y, planning.MAP_CANVAS_COORDINATE_LIMIT);

const layers = planning.ensureMapLayers([], [map]);
assert.equal(layers.length, 1);
assert.equal(layers[0].id, planning.defaultMapLayerId(map.id));
assert.deepEqual(layers[0].imageTransform, {
  flipX: false,
  flipY: false,
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0
});
assert.equal(layers[0].imageOpacity, 1);
assert.equal(layers[0].imageBlendMode, "normal");
const imageLayer = planning.normalizeMapLayer({
  id: "layer-image",
  mapId: map.id,
  imageUrl: "worldcraft://asset/map-layer.png",
  imageTransform: { flipX: true, x: 20, y: -30, scale: 2, rotation: 450 },
  imageGroupId: "image-group-a",
  imageOpacity: 0,
  imageBlendMode: "multiply"
}, worldId, map.id, 1);
assert.deepEqual(imageLayer.imageTransform, {
  flipX: true,
  flipY: false,
  x: 20,
  y: -30,
  scale: 2,
  rotation: 90
});
assert.equal(imageLayer.imageGroupId, "image-group-a");
assert.equal(imageLayer.imageOpacity, 0.05);
assert.equal(imageLayer.imageBlendMode, "multiply");
assert.equal(planning.isMapMarkerVisible(markerA, layers, []), true);
assert.equal(planning.isMapMarkerEditable(markerA, layers, []), true);
const hiddenLayers = [{ ...layers[0], visible: false }];
assert.equal(planning.isMapMarkerVisible(markerA, hiddenLayers, []), false);
const lockedLayers = [{ ...layers[0], locked: true }];
assert.equal(planning.isMapMarkerEditable(markerA, lockedLayers, []), false);
const markerGroup = planning.normalizeMapMarkerGroup(
  { id: "group-a", mapId: map.id, title: "主线", visible: true, locked: true },
  worldId,
  map.id
);
assert.equal(
  planning.isMapMarkerEditable({ ...markerA, groupId: markerGroup.id }, layers, [markerGroup]),
  false
);

let route = planning.normalizeMapRoute(
  {
    id: "route-a",
    mapId: map.id,
    title: "Route",
    status: "active",
    travelMode: "ride",
    travelSpeed: 10,
    travelHoursPerDay: 8,
    stops: [
      { id: "stop-a", markerId: markerA.id, title: "A" },
      { id: "stop-b", markerId: markerB.id, title: "B" }
    ]
  },
  worldId,
  map.id
);
assert.equal(route.stops.length, 2);
assert.equal(route.travelMode, "ride");
assert.equal(route.travelSpeed, 10);
assert.equal(route.travelHoursPerDay, 8);
assert.equal(route.curveMode, "straight");
assert.deepEqual(route.waypoints, []);
assert.deepEqual(route.references, []);
assert.equal(planning.calculateMapRouteDistance(route, [markerA, markerB]), 196.1);
route = planning.moveMapRouteStop(route, "stop-b", -1);
assert.equal(route.stops[0].id, "stop-b");

const curvedRoute = planning.normalizeMapRoute({
  id: "route-curved",
  mapId: map.id,
  curveMode: "smooth",
  stops: [
    { id: "curve-stop-a", markerId: markerA.id, title: "A" },
    { id: "curve-stop-b", markerId: markerB.id, title: "B" }
  ],
  waypoints: [
    { id: "waypoint-a", afterStopId: "curve-stop-a", x: 12, y: 44, order: 1 },
    { id: "waypoint-orphan", afterStopId: "missing", x: 10, y: 10, order: 2 }
  ],
  references: [{ kind: "quest", id: "quest-a" }]
}, worldId, map.id);
assert.equal(curvedRoute.waypoints.length, 1);
assert.deepEqual(curvedRoute.references, [{ kind: "quest", id: "quest-a" }]);
assert.deepEqual(
  planning.getMapRoutePathPoints(curvedRoute, [markerA, markerB]),
  [{ x: markerA.x, y: markerA.y }, { x: 12, y: 44 }, { x: markerB.x, y: markerB.y }]
);
assert.match(planning.createMapRouteSvgPath(
  planning.getMapRoutePathPoints(curvedRoute, [markerA, markerB]),
  curvedRoute.curveMode
), /^M .* C /);
assert.equal(planning.sampleMapRoutePath(
  planning.getMapRoutePathPoints(curvedRoute, [markerA, markerB]),
  curvedRoute.curveMode
).length > 3, true);

const metricMarkers = [
  planning.normalizeMapMarker({ id: "metric-a", mapId: calibratedMap.id, x: 0, y: 0, label: "起点" }),
  planning.normalizeMapMarker({ id: "metric-b", mapId: calibratedMap.id, x: 30, y: 40, label: "终点" })
];
const metricRoute = planning.normalizeMapRoute(
  {
    id: "metric-route",
    mapId: calibratedMap.id,
    travelSpeed: 20,
    travelHoursPerDay: 10,
    stops: [
      { id: "metric-stop-a", markerId: "metric-a", title: "起点" },
      { id: "metric-stop-b", markerId: "metric-b", title: "终点" }
    ]
  },
  worldId,
  calibratedMap.id
);
const routeMetrics = planning.calculateMapRouteMetrics(metricRoute, metricMarkers, calibratedMap);
assert.equal(routeMetrics.distance, 288.4);
assert.equal(routeMetrics.travelHours, 14.42);
assert.equal(routeMetrics.travelDays, 1.442);
assert.equal(routeMetrics.segments.length, 1);
assert.equal(routeMetrics.segments[0].toStopId, "metric-stop-b");
assert.equal(planning.formatMapTravelTime(routeMetrics.travelHours, metricRoute.travelHoursPerDay), "1 天 4.4 小时");
assert.equal(planning.formatMapTravelTime(0.5, 8), "30 分钟");

const mapIssues = planning.validateMapPlanning({
  worldId,
  maps: [map],
  markers: [markerA, { ...markerB, questId: "missing-quest" }],
  routes: [
    route,
    planning.normalizeMapRoute(
      {
        id: "route-invalid",
        mapId: map.id,
        title: "Invalid route",
        status: "complete",
        stops: [{ id: "stop-missing", markerId: "missing", title: "Missing" }]
      },
      worldId,
      map.id
    )
  ],
  layers,
  groups: [markerGroup],
  entityIds: ["entity-a"],
  questIds: [],
  sceneIds: []
});
assert.equal(mapIssues.some((issue) => issue.id === `map-image:${map.id}`), true);
assert.equal(mapIssues.some((issue) => issue.id === `marker-reference:${markerB.id}`), true);
assert.equal(mapIssues.some((issue) => issue.id === "route-stops:route-invalid"), true);
assert.equal(mapIssues.some((issue) => issue.id === "route-short:route-invalid"), true);

const tracks = planning.ensureTimelineTracks([], [worldId, "world-two"]);
assert.equal(tracks.length, 2);
assert.equal(tracks[0].id, `timeline-track-main:${worldId}`);
const legacyEvent = planning.normalizeTimelineEvent(
  {
    id: "event-legacy",
    worldId,
    entityId: "entity-a",
    displayDate: "Era 3",
    sortOrder: 3,
    startValue: "4",
    endValue: "2"
  },
  worldId,
  tracks[0].id
);
assert.equal(legacyEvent.trackId, tracks[0].id);
assert.equal(legacyEvent.questId, "");
assert.deepEqual(legacyEvent.dependencyIds, []);
assert.deepEqual(legacyEvent.references, [{ kind: "entity", id: "entity-a" }]);
assert.equal(legacyEvent.datePrecision, "range");

const eventA = planning.normalizeTimelineEvent(
  { id: "event-a", worldId, title: "A", sortOrder: 2, dependencyIds: ["event-b"] },
  worldId,
  tracks[0].id
);
const eventB = planning.normalizeTimelineEvent(
  { id: "event-b", worldId, title: "B", sortOrder: 1, dependencyIds: ["event-a"] },
  worldId,
  tracks[0].id
);
assert.deepEqual(planning.sortTimelineEvents([eventA, eventB]).map((event) => event.id), ["event-b", "event-a"]);
assert.deepEqual(planning.detectTimelineDependencyCycles([eventA, eventB]), ["event-a", "event-b"]);
assert.equal(
  planning.timelineEventMatchesReference(legacyEvent, { entityId: "entity-a" }),
  true
);
assert.equal(
  planning.timelineEventMatchesReference(legacyEvent, { kind: "entity", id: "entity-a" }),
  true
);
assert.equal(
  planning.mapMarkerMatchesTimelineEvent(
    markerA,
    planning.normalizeTimelineEvent(
      { id: "event-marker-ref", worldId, references: [{ kind: "map-marker", id: markerA.id }] },
      worldId,
      tracks[0].id
    )
  ),
  true
);
assert.equal(
  planning.mapMarkerMatchesTimelineEvent(
    planning.normalizeMapMarker({ ...markerB, references: [{ kind: "timeline-event", id: eventA.id }] }),
    eventA
  ),
  true
);
assert.equal(planning.mapMarkerMatchesTimelineEvent(markerA, legacyEvent), true);
assert.equal(planning.mapMarkerMatchesTimelineEvent(markerB, legacyEvent), false);
assert.equal(planning.formatTimelineInterval(legacyEvent), "4 - 2");

const approximateEvent = planning.normalizeTimelineEvent(
  { id: "event-approximate", worldId, displayDate: "第三纪元末", datePrecision: "approximate" },
  worldId,
  tracks[0].id
);
assert.equal(planning.formatTimelineInterval(approximateEvent), "约 第三纪元末");
const twentyRefs = Array.from({ length: 20 }, (_, index) => ({
  kind: index % 2 ? "entity" : "quest",
  id: `ref-${index}`
}));
const multiReferenceEvent = planning.normalizeTimelineEvent(
  { id: "event-many", worldId, references: twentyRefs },
  worldId,
  tracks[0].id
);
assert.equal(multiReferenceEvent.references.length, 20);

const timelineIssues = planning.validateTimelinePlanning({
  worldId,
  tracks: tracks.filter((track) => track.worldId === worldId),
  events: [legacyEvent, eventA, eventB],
  entityIds: ["entity-a"],
  questIds: [],
  sceneIds: []
});
assert.equal(timelineIssues.some((issue) => issue.id === "timeline-range:event-legacy"), true);
assert.equal(timelineIssues.filter((issue) => issue.id.startsWith("timeline-cycle:")).length, 2);

const roundTripMap = { ...map, imageUrl: "data:image/png;base64,dGVzdA==" };
const roundTripEventA = planning.normalizeTimelineEvent(
  { id: "round-event-a", worldId, title: "Departure", sortOrder: 1 },
  worldId,
  tracks[0].id
);
const roundTripEventB = planning.normalizeTimelineEvent(
  {
    id: "round-event-b",
    worldId,
    title: "Arrival",
    questId: "quest-a",
    sceneId: "scene-a",
    sortOrder: 2,
    dependencyIds: [roundTripEventA.id]
  },
  worldId,
  tracks[0].id
);
const planningBundle = {
  version: 2,
  maps: [roundTripMap],
  mapLayers: layers,
  mapMarkerGroups: [markerGroup],
  mapMarkers: [markerA, markerB],
  mapRoutes: [route],
  timelineTracks: [tracks[0]],
  timelineEvents: [roundTripEventA, roundTripEventB]
};
const markdown = `# Export\n\n# Worldcraft 编排数据\n\n\`\`\`json\n${JSON.stringify(planningBundle, null, 2)}\n\`\`\``;
const machineMatch = markdown.match(/# Worldcraft 编排数据[\s\S]*?```(?:json)?\s*([\s\S]*?)```/i);
assert.equal(Boolean(machineMatch), true);
const parsedBundle = JSON.parse(machineMatch[1]);
assert.equal(parsedBundle.version, 2);
assert.deepEqual(parsedBundle.maps[0].imageTransform, roundTripMap.imageTransform);
assert.equal(parsedBundle.mapLayers[0].id, layers[0].id);
assert.equal(parsedBundle.mapRoutes.length, 1);
assert.equal(parsedBundle.mapRoutes[0].stops[0].markerId, route.stops[0].markerId);
assert.deepEqual(parsedBundle.timelineEvents[1].dependencyIds, [roundTripEventA.id]);
assert.equal(parsedBundle.timelineEvents[1].sceneId, "scene-a");
assert.equal(
  planning.validateMapPlanning({
    worldId,
    maps: parsedBundle.maps,
    markers: parsedBundle.mapMarkers,
    routes: parsedBundle.mapRoutes,
    layers: parsedBundle.mapLayers,
    groups: parsedBundle.mapMarkerGroups,
    entityIds: ["entity-a"],
    questIds: [],
    sceneIds: []
  }).filter((issue) => issue.severity === "error").length,
  0
);
assert.equal(
  planning.validateTimelinePlanning({
    worldId,
    tracks: parsedBundle.timelineTracks,
    events: parsedBundle.timelineEvents,
    entityIds: ["entity-a"],
    questIds: ["quest-a"],
    sceneIds: ["scene-a"]
  }).length,
  0
);
assert.equal(JSON.stringify(parsedBundle), JSON.stringify(planningBundle));

const viewportBounds = planning.calculateMapViewportBounds(
  { width: 1000, height: 500 },
  0.5,
  { x: -100, y: -50 },
  { width: 800, height: 600 },
  0
);
assert.deepEqual(viewportBounds, { bottom: 260, left: 20, right: 180, top: 20 });
assert.equal(planning.isMapPointWithinBounds({ x: 20, y: 20 }, viewportBounds), true);
assert.equal(planning.isMapPointWithinBounds({ x: 19.99, y: 20 }, viewportBounds), false);
assert.equal(
  planning.mapRegionIntersectsBounds(
    { points: [{ x: 175, y: 40 }, { x: 185, y: 40 }, { x: 185, y: 50 }] },
    viewportBounds
  ),
  true
);
assert.equal(
  planning.mapRegionIntersectsBounds(
    { points: [{ x: 181, y: 261 }, { x: 190, y: 261 }, { x: 190, y: 270 }] },
    viewportBounds
  ),
  false
);

const crowdedLabels = [
  { id: "marker-alpha", kind: "marker", label: "Alpha", x: 10, y: 10 },
  { id: "marker-beta", kind: "marker", label: "Beta", x: 13, y: 10 }
];
const lowZoomLabels = planning.resolveMapLabelVisibility(crowdedLabels, {
  mapHeight: 600,
  mapWidth: 1000,
  showLabels: true,
  zoom: 0.25
});
assert.equal(lowZoomLabels.markerIds.size, 1);
const highZoomLabels = planning.resolveMapLabelVisibility(crowdedLabels, {
  mapHeight: 600,
  mapWidth: 1000,
  showLabels: true,
  zoom: 4
});
assert.equal(highZoomLabels.markerIds.size, 2);
const selectedOnlyLabels = planning.resolveMapLabelVisibility(
  [
    ...crowdedLabels,
    { id: "region-selected", kind: "region", label: "Selected", selected: true, x: 10, y: 10 }
  ],
  { mapHeight: 600, mapWidth: 1000, showLabels: false, zoom: 0.5 }
);
assert.deepEqual(Array.from(selectedOnlyLabels.markerIds), []);
assert.deepEqual(Array.from(selectedOnlyLabels.regionIds), ["region-selected"]);
const zoomAwareLabels = planning.resolveMapLabelVisibility(
  [
    { id: "late-label", kind: "marker", label: "Late", minimumZoom: 1.5, x: 10, y: 10 },
    { id: "pinned-label", kind: "marker", label: "Pinned", pinned: true, x: 10, y: 10 }
  ],
  { mapHeight: 600, mapWidth: 1000, showLabels: true, zoom: 0.5 }
);
assert.deepEqual(Array.from(zoomAwareLabels.markerIds), ["pinned-label"]);

const pressureCandidates = Array.from({ length: 5000 }, (_, index) => ({
  id: `pressure-${index}`,
  kind: index % 5 === 0 ? "region" : "marker",
  label: `Label ${index}`,
  x: (index % 100) + (index % 3) * 0.12,
  y: Math.floor(index / 100) * 2 + (index % 5) * 0.08
}));
const pressureStartedAt = performance.now();
const pressureLayout = planning.resolveMapLabelVisibility(pressureCandidates, {
  mapHeight: 4096,
  mapWidth: 8192,
  showLabels: true,
  zoom: 0.6
});
assert.equal(pressureLayout.markerIds.size + pressureLayout.regionIds.size > 0, true);
assert.equal(performance.now() - pressureStartedAt < 1500, true);

const largeViewportBounds = planning.calculateMapViewportBounds(
  { width: 8000, height: 4000 },
  0.5,
  { x: -2000, y: -1000 },
  { width: 1000, height: 800 },
  100
);
const cullingStartedAt = performance.now();
const largeMarkers = Array.from({ length: 20000 }, (_, index) => ({
  x: (index % 200) - 50,
  y: Math.floor(index / 200) - 25
}));
const largeRegions = Array.from({ length: 1000 }, (_, index) => {
  const x = (index % 50) * 4 - 50;
  const y = Math.floor(index / 50) * 5 - 25;
  return { points: [{ x, y }, { x: x + 2, y }, { x: x + 2, y: y + 2 }, { x, y: y + 2 }] };
});
const culledMarkerCount = largeMarkers.filter((point) =>
  planning.isMapPointWithinBounds(point, largeViewportBounds)
).length;
const culledRegionCount = largeRegions.filter((region) =>
  planning.mapRegionIntersectsBounds(region, largeViewportBounds)
).length;
assert.equal(culledMarkerCount > 0 && culledMarkerCount < largeMarkers.length / 10, true);
assert.equal(culledRegionCount > 0 && culledRegionCount < largeRegions.length / 5, true);
assert.equal(performance.now() - cullingStartedAt < 500, true);

const standardExport = mapExport.calculateMapExportDimensions({ width: 1200, height: 800 }, 2);
assert.deepEqual(standardExport, {
  actualScale: 2,
  bounds: { bottom: 100, left: 0, right: 100, top: 0 },
  height: 1600,
  limited: false,
  width: 2400
});
const croppedExport = mapExport.calculateMapExportDimensions(
  { width: 1200, height: 800 },
  2,
  { bottom: 75, left: 25, right: 75, top: 25 }
);
assert.equal(croppedExport.width, 1200);
assert.equal(croppedExport.height, 800);
assert.deepEqual(croppedExport.bounds, { bottom: 75, left: 25, right: 75, top: 25 });
const limitedExport = mapExport.calculateMapExportDimensions({ width: 8192, height: 8192 }, 4);
assert.equal(limitedExport.limited, true);
assert.equal(Math.max(limitedExport.width, limitedExport.height) <= 8192, true);
assert.equal(limitedExport.width * limitedExport.height <= 48_000_000, true);

const reviewMap = planning.normalizeWorldMap({
  id: "map-review",
  title: "北境",
  regions: [
    {
      id: "region-crossed",
      title: "争议地",
      points: [
        { x: 0, y: 0 },
        { x: 20, y: 20 },
        { x: 0, y: 20 },
        { x: 20, y: 0 }
      ]
    },
    {
      id: "region-overlap",
      title: "争议地",
      points: [
        { x: 10, y: 10 },
        { x: 30, y: 10 },
        { x: 30, y: 30 },
        { x: 10, y: 30 }
      ]
    }
  ]
}, worldId);
const reviewMarkers = [
  {
    ...planning.createMapMarker(reviewMap.id, 10, 10, 1, "layer-a"),
    id: "marker-review-a",
    label: "北门",
    references: []
  },
  {
    ...planning.createMapMarker(reviewMap.id, 10.2, 10.2, 2, "layer-a"),
    id: "marker-review-b",
    label: "北门",
    references: [{ kind: "quest", id: "quest-a" }]
  }
];
const reviewRoute = {
  ...planning.createMapRoute(worldId, reviewMap.id, 1),
  id: "route-review",
  title: "巡逻线",
  references: [],
  stops: [
    planning.createMapRouteStop("marker-review-a", 1),
    planning.createMapRouteStop("marker-review-b", 2),
    planning.createMapRouteStop("marker-review-a", 3)
  ]
};
const mapFindings = mapIntelligence.analyzeMapConflicts({
  map: reviewMap,
  markers: reviewMarkers,
  routes: [reviewRoute]
});
assert.equal(mapFindings.some((finding) => finding.id.startsWith("duplicate:marker:")), true);
assert.equal(mapFindings.some((finding) => finding.id.startsWith("marker-collision:")), true);
assert.equal(mapFindings.some((finding) => finding.id === "region-self-intersection:region-crossed"), true);
assert.equal(mapFindings.some((finding) => finding.id.startsWith("region-overlap:")), true);
assert.equal(mapFindings.some((finding) => finding.id === "route-repeat:route-review"), true);
assert.equal(mapFindings.every((finding) => finding.targetId && finding.targetType), true);

const parsedMapSuggestions = mapIntelligence.parseMapAiReviewResponse(`审阅结果：\n\`\`\`json
{"suggestions":[{"id":"suggestion-a","severity":"warning","title":"补充入口说明","detail":"入口用途不够明确","targetType":"marker","targetId":"marker-review-a","patch":{"description":"主线任务入口","__proto__":{"unsafe":true}}}]}
\`\`\``);
assert.equal(parsedMapSuggestions.error, undefined);
assert.equal(parsedMapSuggestions.suggestions.length, 1);
assert.equal(parsedMapSuggestions.suggestions[0].patch.description, "主线任务入口");
assert.equal(Object.hasOwn(parsedMapSuggestions.suggestions[0].patch, "__proto__"), false);
assert.equal(
  mapIntelligence.parseMapAiReviewResponse("不是 JSON").suggestions.length,
  0
);

const previousReviewMap = planning.normalizeWorldMap({
  ...reviewMap,
  title: "旧北境",
  regions: [reviewMap.regions[0]]
}, worldId);
const versionComparison = mapIntelligence.compareMapVersions(reviewMap, previousReviewMap);
assert.equal(versionComparison.changedFields.includes("title"), true);
assert.deepEqual(versionComparison.addedRegionIds, ["region-overlap"]);
assert.deepEqual(versionComparison.removedRegionIds, []);
assert.equal(versionComparison.currentRegionCount, 2);
assert.equal(versionComparison.previousRegionCount, 1);

const assertionCount = (fs.readFileSync(__filename, "utf8").match(/\bassert\./g) || []).length;
console.log(`World planning domain checks passed: ${assertionCount} assertions.`);
