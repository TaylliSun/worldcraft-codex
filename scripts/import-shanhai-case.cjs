const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createProjectPackage } = require("../electron/project-package.cjs");
const { WorkspaceStore, WORKSPACE_COLLECTIONS } = require("../electron/workspace-store.cjs");
const {
  CASE_VERSION,
  MAIN_LAYER_ID,
  MAIN_MAP_ID,
  WORLD_ID,
  buildShanhaiCaseData,
  classicVolumes,
  entityId,
  illustratedRecords,
  visualCreatures
} = require("./shanhai-case-data.cjs");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(PROJECT_ROOT, "assets", "shanhai");
const USER_DATA_DIR = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const DB_PATH = path.join(USER_DATA_DIR, "worldcraft-codex.sqlite");
const BACKUP_DIR = path.join(USER_DATA_DIR, "backups");
const ASSET_DIR = path.join(USER_DATA_DIR, "assets");
const packageVersion = require("../package.json").version;

function timestampForFile(value) {
  return value.replace(/[:.]/g, "-");
}

function imageTransform(x = 0, y = 0, scale = 1, rotation = 0) {
  return { flipX: false, flipY: false, x, y, scale, rotation };
}

function labelPlacement(minZoom = 0.1) {
  return { offsetX: 0, offsetY: 0, locked: false, minZoom };
}

function replaceById(existing, additions) {
  const ids = new Set(additions.map((item) => item.id));
  return [...additions, ...existing.filter((item) => !ids.has(item.id))];
}

function mergeById(existing, additions, merge) {
  const previousById = new Map(existing.map((item) => [item.id, item]));
  const ids = new Set(additions.map((item) => item.id));
  return [
    ...additions.map((item) => {
      const previous = previousById.get(item.id);
      return previous ? merge(previous, item) : item;
    }),
    ...existing.filter((item) => !ids.has(item.id))
  ];
}

function ensureCollections(data) {
  for (const collection of WORKSPACE_COLLECTIONS) {
    if (!Array.isArray(data[collection])) data[collection] = [];
  }
}

function materializeAsset(data, spec, now) {
  const sourcePath = path.join(SOURCE_DIR, spec.filename);
  if (!fs.existsSync(sourcePath)) throw new Error(`缺少山海经案例资源：${sourcePath}`);
  const bytes = fs.readFileSync(sourcePath);
  const digest = crypto.createHash("sha256").update(bytes).digest("hex");
  const assetKind = spec.kind || "map";
  const storedName = `${assetKind === "map" ? "map" : "image"}-${digest.slice(0, 24)}.png`;
  const destinationPath = path.join(ASSET_DIR, storedName);
  fs.mkdirSync(ASSET_DIR, { recursive: true });
  if (!fs.existsSync(destinationPath) || fs.statSync(destinationPath).size !== bytes.length) {
    fs.copyFileSync(sourcePath, destinationPath);
  }
  const previous = data.assets.find((asset) => asset.id === spec.id);
  return {
    asset: {
      id: spec.id,
      worldId: WORLD_ID,
      name: spec.name,
      kind: assetKind,
      storedName,
      originalName: spec.filename,
      mimeType: "image/png",
      size: bytes.length,
      contentHash: digest,
      tags: spec.tags || [],
      notes: spec.notes || "",
      linkedEntityIds: spec.linkedEntityIds || [],
      createdAt: previous?.createdAt || now,
      updatedAt: now
    },
    url: `worldcraft://asset/${encodeURIComponent(storedName)}`
  };
}

function ensureVisualAssets(data, now) {
  const base = materializeAsset(data, {
    id: "asset-shanhai-map-base",
    filename: "shanhai-map-base.png",
    name: "山海异兽图 · 水彩底图",
    tags: ["山海经", "地图底图", "水彩手绘", "无文字"],
    notes: "完整案例的可编辑水彩总图底图。",
    linkedEntityIds: []
  }, now);

  const fiveClassicsMap = materializeAsset(data, {
    id: "asset-shanhai-map-five-classics",
    filename: "map-five-classics.png",
    name: "五藏山经索引图 · 水彩底图",
    kind: "map",
    tags: ["山海经", "地图底图", "五藏山经", "水彩手绘", "无文字"],
    notes: "五藏山经子地图的独立水彩底图，不复用异兽总图。",
    linkedEntityIds: []
  }, now);
  const seaClassicsMap = materializeAsset(data, {
    id: "asset-shanhai-map-sea-classics",
    filename: "map-sea-classics.png",
    name: "海外海内大荒索引图 · 水彩底图",
    kind: "map",
    tags: ["山海经", "地图底图", "海外海内大荒", "水彩手绘", "无文字"],
    notes: "海外、海内与大荒诸经子地图的独立水彩底图。",
    linkedEntityIds: []
  }, now);
  const chapterMaps = new Map(classicVolumes.map((volume) => [
    volume.key,
    materializeAsset(data, {
      id: `asset-shanhai-map-volume-${volume.key}`,
      filename: `map-volume-${volume.key}.png`,
      name: `${volume.title} · 独立水彩底图`,
      kind: "map",
      tags: ["山海经", "地图底图", volume.title, "水彩手绘", "无文字"],
      notes: `${volume.title}原典路线图的独立底图，不与其他卷目复用。`,
      linkedEntityIds: [`entity-shanhai-volume-${volume.key}`]
    }, now)
  ]));

  const illustrationMeta = {
    creature: { label: "异兽", tags: ["山海经", "异兽", "透明素材", "条目插图"] },
    figure: { label: "人物神祇", tags: ["山海经", "人物神祇", "透明素材", "条目插图"] },
    artifact: { label: "草木神物", tags: ["山海经", "草木神物", "透明素材", "条目插图"] },
    character: { label: "原创角色", tags: ["山海经", "原创角色", "透明素材", "条目插图"] }
  };
  const illustrations = new Map(illustratedRecords.map((record) => {
    const meta = illustrationMeta[record.kind] || illustrationMeta.character;
    return [
      record.key,
      materializeAsset(data, {
        id: `asset-shanhai-${record.key}`,
        filename: `${record.key}.png`,
        name: `${record.title} · 透明水彩图鉴`,
        kind: "image",
        tags: meta.tags,
        notes: `${record.title}的独立透明 PNG ${meta.label}插图，可用于 Wiki 条目，也可加入地图图层后移动、缩放、旋转和排序。`,
        linkedEntityIds: [entityId(record.key)]
      }, now)
    ];
  }));
  const generatedAssets = [
    base.asset,
    fiveClassicsMap.asset,
    seaClassicsMap.asset,
    ...Array.from(chapterMaps.values(), (item) => item.asset),
    ...Array.from(illustrations.values(), (item) => item.asset)
  ];
  const generatedAssetIds = new Set(generatedAssets.map((item) => item.id));
  data.assets = data.assets.filter((item) => {
    const isManagedCaseAsset = item.worldId === WORLD_ID
      && item.id.startsWith("asset-shanhai-")
      && (item.tags || []).includes("山海经")
      && ((item.tags || []).includes("地图底图") || (item.tags || []).includes("条目插图"));
    return !isManagedCaseAsset || generatedAssetIds.has(item.id);
  });
  data.assets = replaceById(data.assets, generatedAssets);
  return {
    baseUrl: base.url,
    mapImageUrls: {
      fiveClassics: fiveClassicsMap.url,
      seaClassics: seaClassicsMap.url,
      chapters: Object.fromEntries(Array.from(chapterMaps, ([key, item]) => [key, item.url]))
    },
    illustrationAssets: illustrations
  };
}

function ensureMainVisualMap(data, now, baseUrl, creatureAssets) {
  const generatedRegions = visualCreatures.map((creature, index) => ({
    id: `map-region-shanhai-${creature.key}`,
    title: `${creature.habitat} · ${creature.title}活动范围`,
    description: `${creature.title}视觉案例的活动范围；边界可继续逐点编辑。`,
    kind: index === 0 || index === 4 ? "danger" : "biome",
    color: creature.color,
    opacity: 0.14,
    order: index + 1,
    visible: true,
    locked: false,
    points: creature.region.map(([x, y]) => ({ x, y })),
    holes: [],
    labelPlacement: labelPlacement(0.55),
    references: [{ kind: "entity", id: entityId(creature.key) }],
    createdAt: now,
    updatedAt: now
  }));
  const generatedBookmark = {
    id: "map-view-shanhai-overview",
    title: "全境总览",
    centerX: 50,
    centerY: 50,
    zoom: 1,
    storyPhaseId: "",
    mode: "layers",
    showLabels: true,
    createdAt: now,
    updatedAt: now
  };
  const imageLayerIds = visualCreatures.map((creature) => `map-layer-shanhai-${creature.key}`);
  const generatedFilter = {
    id: "map-filter-shanhai-creatures",
    title: "八大视觉异兽",
    mode: "layers",
    query: "",
    markerKinds: [],
    regionKinds: [],
    routeStatuses: [],
    layerIds: imageLayerIds,
    groupIds: ["marker-group-shanhai-creatures"],
    createdAt: now,
    updatedAt: now
  };
  const previousMap = data.maps.find((item) => item.id === MAIN_MAP_ID);
  const mainMap = previousMap
    ? {
        ...previousMap,
        title: "山海异兽总图",
        description: "水彩视觉总图与完整案例入口。八个异兽图签、范围、标记和新增索引子地图均可独立编辑。",
        imageUrl: previousMap.imageUrl || baseUrl,
        regions: mergeById(previousMap.regions || [], generatedRegions, (previous) => previous),
        viewBookmarks: mergeById(previousMap.viewBookmarks || [], [generatedBookmark], (previous) => previous),
        savedFilters: mergeById(previousMap.savedFilters || [], [generatedFilter], (previous) => previous),
        updatedAt: now
      }
    : {
        id: MAIN_MAP_ID,
        worldId: WORLD_ID,
        parentMapId: "",
        entryMarkerId: "",
        title: "山海异兽总图",
        description: "水彩视觉总图与完整案例入口。",
        imageUrl: baseUrl,
        imageTransform: imageTransform(),
        width: 1586,
        height: 992,
        distanceWidth: 12000,
        distanceUnit: "li",
        customDistanceUnit: "里",
        grid: { visible: false, snap: false, labels: true, columns: 16, color: "#526761", opacity: 0.16 },
        regions: generatedRegions,
        storyPhases: [],
        viewBookmarks: [generatedBookmark],
        savedFilters: [generatedFilter],
        createdAt: now,
        updatedAt: now
      };
  data.maps = replaceById(data.maps, [mainMap]);

  const generatedMainLayer = {
    id: MAIN_LAYER_ID,
    worldId: WORLD_ID,
    mapId: MAIN_MAP_ID,
    title: "异兽坐标与案例入口",
    description: "异兽条目、子地图入口和叙事标记。",
    color: "#8d3f37",
    order: 0,
    visible: true,
    locked: false,
    imageUrl: "",
    imageTransform: imageTransform(),
    imageOpacity: 1,
    imageBlendMode: "normal",
    imageGroupId: "",
    createdAt: now,
    updatedAt: now
  };
  const generatedImageLayers = visualCreatures.map((creature, index) => ({
    id: `map-layer-shanhai-${creature.key}`,
    worldId: WORLD_ID,
    mapId: MAIN_MAP_ID,
    title: `${String(index + 1).padStart(2, "0")} · ${creature.title}`,
    description: `${creature.title}独立透明图签；当前放置于${creature.habitat}。`,
    color: creature.color,
    order: index + 1,
    visible: true,
    locked: false,
    imageUrl: creatureAssets.get(creature.key).url,
    imageTransform: imageTransform(creature.center.x - 50, creature.center.y - 50, creature.scale, creature.rotation),
    imageOpacity: 1,
    imageBlendMode: "normal",
    imageGroupId: "",
    createdAt: now,
    updatedAt: now
  }));
  data.mapLayers = mergeById(
    data.mapLayers,
    [generatedMainLayer, ...generatedImageLayers],
    (previous, generated) => ({
      ...generated,
      order: previous.order,
      visible: previous.visible,
      locked: previous.locked,
      imageTransform: previous.imageTransform || generated.imageTransform,
      imageOpacity: previous.imageOpacity ?? generated.imageOpacity,
      imageBlendMode: previous.imageBlendMode || generated.imageBlendMode,
      imageGroupId: previous.imageGroupId || "",
      createdAt: previous.createdAt || generated.createdAt,
      updatedAt: now
    })
  );

  const group = {
    id: "marker-group-shanhai-creatures",
    worldId: WORLD_ID,
    mapId: MAIN_MAP_ID,
    title: "八大视觉异兽",
    description: "与独立异兽图层和原典条目配套的地图题签。",
    color: "#8d3f37",
    order: 1,
    visible: true,
    locked: false,
    createdAt: now,
    updatedAt: now
  };
  data.mapMarkerGroups = mergeById(data.mapMarkerGroups, [group], (previous, generated) => ({
    ...generated,
    visible: previous.visible,
    locked: previous.locked,
    order: previous.order,
    createdAt: previous.createdAt || generated.createdAt
  }));

  const markers = visualCreatures.map((creature) => {
    const entity = data.entities.find((item) => item.id === entityId(creature.key));
    return {
      id: `map-marker-shanhai-${creature.key}`,
      mapId: MAIN_MAP_ID,
      layerId: MAIN_LAYER_ID,
      groupId: group.id,
      entityId: entityId(creature.key),
      questId: creature.key === "jingwei" ? "quest-shanhai-jingwei" : creature.key === "jiuweihu" ? "quest-shanhai-nine-tail" : "",
      sceneId: creature.key === "jingwei" ? "scene-shanhai-jingwei" : "",
      references: [{ kind: "entity", id: entityId(creature.key) }],
      x: creature.marker.x,
      y: creature.marker.y,
      label: `${creature.title} · ${creature.habitat}`,
      markerType: "custom",
      color: creature.color,
      iconUrl: "",
      labelPlacement: labelPlacement(0.45),
      description: `${entity?.summary || creature.title} 点击可打开原典与改编分层条目。`,
      updatedAt: now
    };
  });
  data.mapMarkers = mergeById(data.mapMarkers, markers, (previous, generated) => ({
    ...generated,
    x: previous.x,
    y: previous.y,
    layerId: previous.layerId || generated.layerId,
    groupId: previous.groupId || generated.groupId,
    labelPlacement: previous.labelPlacement || generated.labelPlacement,
    iconUrl: previous.iconUrl || generated.iconUrl,
    updatedAt: now
  }));
}

async function createCompleteBackup(data, now) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const targetPath = path.join(
    BACKUP_DIR,
    `worldcraft-codex-complete-before-shanhai-case-${timestampForFile(now)}.wcodex`
  );
  const result = await createProjectPackage({
    targetPath,
    data,
    assetsDir: ASSET_DIR,
    schemaVersion: 17,
    appVersion: packageVersion,
    now: () => now
  });
  return { targetPath, result };
}

function applyCaseData(data, generated, now) {
  const previousWorld = data.worlds.find((item) => item.id === WORLD_ID);
  const previousMainMapImageUrl = data.maps.find((item) => item.id === MAIN_MAP_ID)?.imageUrl || "";
  const existingCaseMapIds = new Set(data.maps
    .filter((item) => item.worldId === WORLD_ID)
    .map((item) => item.id));
  data.mapMarkers = data.mapMarkers.filter((item) => !(
    existingCaseMapIds.has(item.mapId)
    && /^新标记\s+\d+$/.test(String(item.label || ""))
    && !String(item.description || "").trim()
    && !item.entityId
    && !item.questId
    && !item.sceneId
    && !(item.references || []).length
    && !item.groupId
    && !item.iconUrl
  ));
  data.mapRoutes = data.mapRoutes.filter((item) => !(
    item.worldId === WORLD_ID
    && /^路线\s+\d+$/.test(String(item.title || ""))
    && (!String(item.description || "").trim() || item.description === "记录玩家、NPC 或任务目标经过地图的顺序。")
    && item.status === "draft"
    && !(item.stops || []).length
    && !(item.waypoints || []).length
    && !(item.references || []).length
  ));
  data.timelineEvents = data.timelineEvents.filter((item) => !(
    item.worldId === WORLD_ID
    && /^新时间点\s+\d+$/.test(String(item.title || ""))
    && !String(item.summary || "").trim()
    && item.displayDate === "未定时间"
    && item.datePrecision === "unknown"
    && !item.startValue
    && !item.endValue
    && !item.era
    && !item.entityId
    && !item.questId
    && !item.sceneId
    && !(item.references || []).length
    && !(item.dependencyIds || []).length
  ));
  const removableEmptyMapIds = new Set(data.maps
    .filter((item) =>
      item.worldId === WORLD_ID
      && item.parentMapId === MAIN_MAP_ID
      && item.title === "山海异兽图子地图"
      && !item.imageUrl
      && !(item.regions || []).length
      && !data.mapLayers.some((layer) => layer.mapId === item.id && layer.imageUrl)
      && !data.mapMarkerGroups.some((group) => group.mapId === item.id)
      && !data.mapMarkers.some((marker) => marker.mapId === item.id)
      && !data.mapRoutes.some((route) => route.mapId === item.id)
      && !generated.maps.some((generatedMap) => generatedMap.id === item.id)
    )
    .map((item) => item.id));
  if (removableEmptyMapIds.size) {
    data.maps = data.maps.filter((item) => !removableEmptyMapIds.has(item.id));
    data.mapLayers = data.mapLayers.filter((item) => !removableEmptyMapIds.has(item.mapId));
    data.mapMarkerGroups = data.mapMarkerGroups.filter((item) => !removableEmptyMapIds.has(item.mapId));
    data.mapMarkers = data.mapMarkers.filter((item) => !removableEmptyMapIds.has(item.mapId));
    data.mapRoutes = data.mapRoutes.filter((item) => !removableEmptyMapIds.has(item.mapId));
  }
  const removableEmptyChapterIds = new Set(data.manuscriptChapters
    .filter((item) =>
      item.worldId === WORLD_ID
      && item.title === "第一章"
      && !String(item.body || "").replace(/<[^>]+>/g, "").trim()
      && !String(item.summary || "").trim()
      && !String(item.notes || "").trim()
      && !(item.references || []).length
      && !data.manuscriptScenes.some((scene) => scene.chapterId === item.id)
      && !data.manuscriptClues.some((clue) => clue.setupUnitId === item.id || clue.payoffUnitId === item.id)
      && !data.manuscriptKnowledgeStates.some((state) => state.unitId === item.id)
      && !item.id.startsWith("manuscript-chapter-shanhai-")
    )
    .map((item) => item.id));
  if (removableEmptyChapterIds.size) {
    data.manuscriptChapters = data.manuscriptChapters.filter((item) => !removableEmptyChapterIds.has(item.id));
    data.manuscriptScenes = data.manuscriptScenes.filter((item) => !removableEmptyChapterIds.has(item.chapterId));
    data.manuscriptClues = data.manuscriptClues.filter((item) =>
      !removableEmptyChapterIds.has(item.setupUnitId) && !removableEmptyChapterIds.has(item.payoffUnitId)
    );
    data.manuscriptKnowledgeStates = data.manuscriptKnowledgeStates.filter((item) => !removableEmptyChapterIds.has(item.unitId));
  }
  const generatedMilestoneIds = new Set(generated.narrativeMilestones.map((item) => item.id));
  const removableEmptyMilestoneIds = new Set(data.narrativeMilestones
    .filter((item) =>
      item.worldId === WORLD_ID
      && !generatedMilestoneIds.has(item.id)
      && removableEmptyChapterIds.has(`manuscript-chapter:${item.id}`)
      && !String(item.summary || "").trim()
      && !String(item.developerNotes || "").trim()
      && !String(item.manuscriptBody || "").replace(/<[^>]+>/g, "").trim()
      && !String(item.targetDate || "").trim()
      && !String(item.blockedReason || "").trim()
      && !(item.dependencyIds || []).length
      && !(item.linkedQuestIds || []).length
      && !(item.linkedSceneIds || []).length
      && !(item.linkedEntityIds || []).length
      && !(item.linkedTimelineEventIds || []).length
      && !(item.linkedMapMarkerIds || []).length
      && !(item.linkedReviewIssueIds || []).length
    )
    .map((item) => item.id));
  if (removableEmptyMilestoneIds.size) {
    data.narrativeMilestones = data.narrativeMilestones.filter(
      (item) => !removableEmptyMilestoneIds.has(item.id)
    );
  }
  const legacyVolumeId = `manuscript-volume:manuscript-book:${WORLD_ID}:%E7%AC%AC%E4%B8%80%E5%8D%B7`;
  const legacyBookId = `manuscript-book:${WORLD_ID}`;
  const legacyVolume = data.manuscriptVolumes.find((item) => item.id === legacyVolumeId);
  if (
    legacyVolume
    && legacyVolume.title === "第一卷"
    && !String(legacyVolume.summary || "").trim()
    && Number(legacyVolume.targetWordCount || 0) === 0
    && !data.manuscriptChapters.some((chapter) => chapter.volumeId === legacyVolumeId)
  ) {
    data.manuscriptVolumes = data.manuscriptVolumes.filter((item) => item.id !== legacyVolumeId);
  }
  const legacyBook = data.manuscriptBooks.find((item) => item.id === legacyBookId);
  if (
    legacyBook
    && legacyBook.title === "主书稿"
    && !String(legacyBook.subtitle || "").trim()
    && !String(legacyBook.summary || "").trim()
    && !data.manuscriptVolumes.some((volume) => volume.bookId === legacyBookId)
    && !data.manuscriptChapters.some((chapter) => chapter.bookId === legacyBookId)
  ) {
    data.manuscriptBooks = data.manuscriptBooks.filter((item) => item.id !== legacyBookId);
  }
  const mergeValidIds = (generatedIds, previousIds, validIds) => Array.from(new Set([
    ...(generatedIds || []),
    ...(previousIds || []).filter((id) => validIds.has(id))
  ]));
  const validCategoryIds = new Set([...data.codexCategories, ...generated.categories].map((item) => item.id));
  const validEntityIds = new Set([...data.entities, ...generated.entities].map((item) => item.id));
  const validMapIds = new Set([...data.maps, ...generated.maps].map((item) => item.id));
  const validTimelineTrackIds = new Set([...data.timelineTracks, ...generated.timelineTracks].map((item) => item.id));
  const validQuestIds = new Set([...data.quests, ...generated.quests].map((item) => item.id));
  const previousWiki = previousWorld?.wiki || {};
  generated.world.createdAt = previousWorld?.createdAt || generated.world.createdAt;
  generated.world.visibility = previousWorld?.visibility || generated.world.visibility;
  generated.world.wiki = {
    ...generated.world.wiki,
    ...previousWiki,
    coverAssetId: previousWiki.coverAssetId || generated.world.wiki.coverAssetId,
    defaultMapId: validMapIds.has(previousWiki.defaultMapId) ? previousWiki.defaultMapId : generated.world.wiki.defaultMapId,
    navigationCategoryIds: mergeValidIds(generated.world.wiki.navigationCategoryIds, previousWiki.navigationCategoryIds, validCategoryIds),
    featuredEntityIds: mergeValidIds(generated.world.wiki.featuredEntityIds, previousWiki.featuredEntityIds, validEntityIds),
    publishedMapIds: mergeValidIds(generated.world.wiki.publishedMapIds, previousWiki.publishedMapIds, validMapIds),
    publishedTimelineTrackIds: mergeValidIds(generated.world.wiki.publishedTimelineTrackIds, previousWiki.publishedTimelineTrackIds, validTimelineTrackIds),
    publishedQuestIds: mergeValidIds(generated.world.wiki.publishedQuestIds, previousWiki.publishedQuestIds, validQuestIds)
  };
  data.codexCategories = data.codexCategories.filter((item) =>
    !String(item.id || "").startsWith(`category:${WORLD_ID}:shanhai-corpus`)
    && !String(item.id || "").startsWith(`category:${WORLD_ID}:shanhai-index-`)
  );
  data.entityTemplates = data.entityTemplates.filter(
    (item) => item.id !== `template:${WORLD_ID}:shanhai-corpus`
  );
  data.entities = data.entities.filter((item) =>
    !String(item.id || "").startsWith("entity-shanhai-passage-")
    && !String(item.id || "").startsWith("entity-shanhai-index-")
  );
  data.worlds = replaceById(data.worlds, [generated.world]);
  data.codexCategories = replaceById(data.codexCategories, generated.categories);
  data.entityTemplates = replaceById(data.entityTemplates, generated.templates);
  data.entities = replaceById(data.entities, generated.entities);
  data.maps = mergeById(data.maps, generated.maps, (previous, item) => ({
    ...item,
    imageUrl: !previous.imageUrl || previous.imageUrl === previousMainMapImageUrl
      ? item.imageUrl
      : previous.imageUrl,
    imageTransform: previous.imageTransform || item.imageTransform,
    regions: mergeById(previous.regions || [], item.regions, (oldRegion) => oldRegion),
    viewBookmarks: mergeById(previous.viewBookmarks || [], item.viewBookmarks, (oldBookmark) => oldBookmark),
    savedFilters: mergeById(previous.savedFilters || [], item.savedFilters, (oldFilter) => oldFilter),
    createdAt: previous.createdAt || item.createdAt,
    updatedAt: now
  }));
  data.mapLayers = mergeById(data.mapLayers, generated.mapLayers, (previous, item) => ({
    ...item,
    order: previous.order,
    visible: previous.visible,
    locked: previous.locked,
    imageTransform: previous.imageTransform || item.imageTransform,
    createdAt: previous.createdAt || item.createdAt,
    updatedAt: now
  }));
  data.mapMarkerGroups = mergeById(data.mapMarkerGroups, generated.mapMarkerGroups, (previous, item) => ({ ...item, visible: previous.visible, locked: previous.locked, order: previous.order, createdAt: previous.createdAt || item.createdAt, updatedAt: now }));
  data.mapMarkers = mergeById(data.mapMarkers, generated.mapMarkers, (previous, item) => ({ ...item, x: previous.x, y: previous.y, labelPlacement: previous.labelPlacement || item.labelPlacement, updatedAt: now }));
  data.mapRoutes = mergeById(data.mapRoutes, generated.mapRoutes, (previous, item) => ({ ...item, status: previous.status, stops: previous.stops?.length ? previous.stops : item.stops, waypoints: previous.waypoints || item.waypoints, updatedAt: now }));
  data.timelineTracks = replaceById(data.timelineTracks, generated.timelineTracks);
  data.timelineEvents = replaceById(data.timelineEvents, generated.timelineEvents);
  data.quests = replaceById(data.quests, generated.quests);
  data.storyVariables = replaceById(data.storyVariables, generated.storyVariables);
  data.storyScenes = replaceById(data.storyScenes, generated.storyScenes);
  data.storyTestPresets = replaceById(data.storyTestPresets, generated.storyTestPresets);
  data.narrativeMilestones = replaceById(data.narrativeMilestones, generated.narrativeMilestones);
  data.manuscriptBooks = replaceById(data.manuscriptBooks, generated.manuscriptBooks);
  data.manuscriptVolumes = data.manuscriptVolumes.filter(
    (item) => !String(item.id || "").startsWith("manuscript-volume:manuscript-book-shanhai-case:")
  );
  data.manuscriptChapters = data.manuscriptChapters.filter(
    (item) => !String(item.id || "").startsWith("manuscript-chapter:milestone-shanhai-")
  );
  data.manuscriptVolumes = replaceById(data.manuscriptVolumes, generated.manuscriptVolumes);
  data.manuscriptChapters = replaceById(data.manuscriptChapters, generated.manuscriptChapters);
  data.manuscriptScenes = replaceById(data.manuscriptScenes, generated.manuscriptScenes);
  data.manuscriptClues = replaceById(data.manuscriptClues, generated.manuscriptClues);
  data.manuscriptKnowledgeStates = replaceById(data.manuscriptKnowledgeStates, generated.manuscriptKnowledgeStates);
  data.relations = replaceById(data.relations, generated.relations);
  data.aiMemoryItems = replaceById(data.aiMemoryItems, generated.aiMemoryItems);
  data.members = replaceById(data.members, [{
    id: "member-shanhai-owner",
    worldId: WORLD_ID,
    name: "主创作者",
    email: "creator@worldcraft.local",
    role: "owner"
  }]);
}

function worldCounts(data) {
  const mapIds = new Set(data.maps.filter((item) => item.worldId === WORLD_ID).map((item) => item.id));
  return {
    entities: data.entities.filter((item) => item.worldId === WORLD_ID).length,
    maps: mapIds.size,
    markers: data.mapMarkers.filter((item) => mapIds.has(item.mapId)).length,
    routes: data.mapRoutes.filter((item) => item.worldId === WORLD_ID).length,
    timelineEvents: data.timelineEvents.filter((item) => item.worldId === WORLD_ID).length,
    quests: data.quests.filter((item) => item.worldId === WORLD_ID).length,
    storyScenes: data.storyScenes.filter((item) => item.worldId === WORLD_ID).length,
    manuscriptChapters: data.manuscriptChapters.filter((item) => item.worldId === WORLD_ID).length,
    relations: data.relations.filter((item) => item.worldId === WORLD_ID).length,
    aiMemories: data.aiMemoryItems.filter((item) => item.worldId === WORLD_ID).length,
    assets: data.assets.filter((item) => item.worldId === WORLD_ID).length
  };
}

async function main() {
  if (!fs.existsSync(DB_PATH)) throw new Error(`未找到 Worldcraft Codex 数据库：${DB_PATH}`);
  const store = new WorkspaceStore({ dbPath: DB_PATH, backupDir: BACKUP_DIR, schemaVersion: 17 });
  try {
    const loaded = store.load();
    if (!loaded.data) throw new Error("工作区数据库为空。");
    const data = loaded.data;
    ensureCollections(data);
    const now = new Date().toISOString();
    const backup = await createCompleteBackup(data, now);
    store.save(data, "before-shanhai-complete-case");

    const visuals = ensureVisualAssets(data, now);
    const generated = buildShanhaiCaseData(now, visuals.baseUrl, visuals.mapImageUrls);
    applyCaseData(data, generated, now);
    ensureMainVisualMap(data, now, visuals.baseUrl, visuals.illustrationAssets);

    const stats = store.save(data, `import-shanhai-complete-case-v${CASE_VERSION}`);
    const diagnostics = store.diagnostics();
    if (!diagnostics.ok) throw new Error(`导入后数据库检查失败：${JSON.stringify(diagnostics)}`);
    console.log(JSON.stringify({
      ok: true,
      caseVersion: CASE_VERSION,
      worldId: WORLD_ID,
      worldName: generated.world.name,
      backup: backup.targetPath,
      database: DB_PATH,
      counts: worldCounts(data),
      saveStats: stats,
      diagnostics: {
        quickCheck: diagnostics.quickCheck,
        foreignKeyIssues: diagnostics.foreignKeyIssues,
        invalidItems: diagnostics.invalidItems.length,
        duplicates: diagnostics.duplicates.length,
        itemCount: diagnostics.itemCount
      }
    }, null, 2));
  } finally {
    store.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
