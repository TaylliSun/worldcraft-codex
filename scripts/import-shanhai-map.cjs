const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { WorkspaceStore } = require("../electron/workspace-store.cjs");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(PROJECT_ROOT, "assets", "shanhai");
const USER_DATA_DIR = process.env.WORLDCRAFT_USER_DATA_DIR
  || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "worldcraft-codex");
const DB_PATH = path.join(USER_DATA_DIR, "worldcraft-codex.sqlite");
const BACKUP_DIR = path.join(USER_DATA_DIR, "backups");
const ASSET_DIR = path.join(USER_DATA_DIR, "assets");

const WORLD_ID = "world-shanhai-watercolor";
const MAP_ID = "map-shanhai-watercolor";
const MARKER_LAYER_ID = `map-layer-default:${MAP_ID}`;
const MARKER_GROUP_ID = "marker-group-shanhai-creatures";
const CREATURE_CATEGORY_ID = `category:${WORLD_ID}:shanhai-creature`;

const creatures = [
  {
    key: "qiongqi",
    title: "穷奇",
    slug: "qiongqi",
    habitat: "邽山",
    color: "#b6483d",
    center: { x: 17, y: 39 },
    marker: { x: 17, y: 50 },
    scale: 0.18,
    rotation: -4,
    region: [[2, 25], [9, 12], [25, 10], [36, 25], [32, 47], [21, 62], [7, 55]],
    summary: "盘踞西山赤岳的翼虎异兽，是这张地图中最具压迫感的危险地标。",
    sourceNote: "《山海经》中穷奇形貌有不同记载；本项目采用后世最易辨识的翼虎形象进行视觉演绎。",
    mapUse: "适合作为西部禁区守卫、灾厄源头或高等级首领。"
  },
  {
    key: "dijiang",
    title: "帝江",
    slug: "dijiang",
    habitat: "天山",
    color: "#d67a2f",
    center: { x: 36, y: 17 },
    marker: { x: 36, y: 27 },
    scale: 0.15,
    rotation: -2,
    region: [[24, 3], [41, 1], [49, 12], [47, 27], [32, 31], [22, 18]],
    summary: "无面而识歌舞的浑敦神兽，六足四翼，栖居北境天山。",
    sourceNote: "原典常写其状如黄囊、赤如丹火，六足四翼，浑敦无面目而识歌舞。",
    mapUse: "适合作为北境神域、乐舞祭仪或空间异象的核心生物。"
  },
  {
    key: "zhulong",
    title: "烛龙",
    slug: "zhulong",
    habitat: "钟山",
    color: "#a93f36",
    center: { x: 56, y: 17 },
    marker: { x: 56, y: 29 },
    scale: 0.22,
    rotation: 5,
    region: [[44, 3], [62, 1], [70, 14], [63, 31], [48, 29], [42, 16]],
    summary: "人面蛇身的钟山之神，以睁目闭目和吐息象征昼夜寒暑。",
    sourceNote: "本项目保留赤色蛇身、人面与昼夜神性的核心意象，并将烛火冠饰作为地图识别特征。",
    mapUse: "适合作为历法、季候、昼夜切换或世界级事件的叙事锚点。"
  },
  {
    key: "jingwei",
    title: "精卫",
    slug: "jingwei",
    habitat: "发鸠山",
    color: "#3d6f99",
    center: { x: 62, y: 44 },
    marker: { x: 62, y: 55 },
    scale: 0.12,
    rotation: 7,
    region: [[52, 28], [68, 24], [77, 36], [75, 54], [62, 61], [50, 45]],
    summary: "衔木石填海的青鸟，象征执念、复仇与永不止息的行动。",
    sourceNote: "视觉保留文首、白喙、赤足与衔枝等辨识元素，采用轻盈的飞行姿态。",
    mapUse: "适合作为跨海任务引导、执念主题角色或动态事件信使。"
  },
  {
    key: "kui",
    title: "夔",
    slug: "kui",
    habitat: "流波山",
    color: "#4f6684",
    center: { x: 83, y: 34 },
    marker: { x: 83, y: 47 },
    scale: 0.18,
    rotation: 3,
    region: [[72, 8], [94, 6], [99, 22], [96, 49], [81, 58], [69, 38]],
    summary: "苍身无角、仅有一足的雷鸣异兽，出入海水时伴随风雨。",
    sourceNote: "独足、无角、牛形与雷声是本项目必须保留的四个视觉和叙事特征。",
    mapUse: "适合作为东海风暴机制、海域首领或雷鼓素材来源。"
  },
  {
    key: "jiuweihu",
    title: "九尾狐",
    slug: "jiuweihu",
    habitat: "青丘",
    color: "#b55e6f",
    center: { x: 27, y: 71 },
    marker: { x: 27, y: 83 },
    scale: 0.2,
    rotation: -5,
    region: [[15, 57], [34, 53], [42, 68], [37, 88], [19, 91], [11, 75]],
    summary: "栖于青丘的九尾灵狐，兼具魅惑、危险与古老祥瑞的多重解释空间。",
    sourceNote: "素材明确绘出九条尾巴，并以朱砂纹样和玉色眼睛建立项目自己的视觉识别。",
    mapUse: "适合作为南山主线势力、幻术导师或青丘区域象征。"
  },
  {
    key: "lushu",
    title: "鹿蜀",
    slug: "lushu",
    habitat: "杻阳山",
    color: "#65755a",
    center: { x: 48, y: 72 },
    marker: { x: 48, y: 84 },
    scale: 0.17,
    rotation: 2,
    region: [[34, 55], [55, 52], [65, 65], [61, 87], [43, 92], [31, 75]],
    summary: "虎纹赤尾的马形瑞兽，优雅而温和，是南山道路上的吉兆。",
    sourceNote: "原典辨识点为马形、白首、虎纹与赤尾；本项目强化了白色体态以便缩放后仍清楚可读。",
    mapUse: "适合作为坐骑、护送任务对象、家族祝福或稀有生态发现。"
  },
  {
    key: "dangkang",
    title: "当康",
    slug: "dangkang",
    habitat: "钦山",
    color: "#98723e",
    center: { x: 70, y: 72 },
    marker: { x: 70, y: 84 },
    scale: 0.17,
    rotation: -3,
    region: [[58, 55], [78, 52], [88, 67], [83, 87], [64, 91], [54, 73]],
    summary: "有牙如豚的丰穰瑞兽，出现时预示收成与土地的复苏。",
    sourceNote: "视觉采用獠牙野猪形态，并加入青绿色鬃毛与云纹来强调丰收而非凶恶。",
    mapUse: "适合作为丰收事件、农耕聚落守护兽或资源恢复机制的象征。"
  }
];

function imageTransform(x = 0, y = 0, scale = 1, rotation = 0) {
  return { flipX: false, flipY: false, x, y, scale, rotation };
}

function labelPlacement(minZoom = 0.1) {
  return { offsetX: 0, offsetY: 0, locked: false, minZoom };
}

function replaceFirst(items, item) {
  return [item, ...items.filter((candidate) => candidate.id !== item.id)];
}

function replaceManyFirst(items, additions) {
  const ids = new Set(additions.map((item) => item.id));
  return [...additions, ...items.filter((candidate) => !ids.has(candidate.id))];
}

function materializeAsset(data, spec, now) {
  const sourcePath = path.join(SOURCE_DIR, spec.filename);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing generated asset: ${sourcePath}`);
  }

  const bytes = fs.readFileSync(sourcePath);
  const digest = crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 24);
  const storedName = `map-${digest}.png`;
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
      kind: "map",
      storedName,
      originalName: spec.filename,
      mimeType: "image/png",
      size: bytes.length,
      tags: spec.tags,
      notes: spec.notes,
      linkedEntityIds: spec.linkedEntityIds,
      createdAt: previous?.createdAt || now,
      updatedAt: now
    },
    url: `worldcraft://asset/${encodeURIComponent(storedName)}`
  };
}

function makeEntity(creature, now) {
  return {
    id: `entity-shanhai-${creature.key}`,
    worldId: WORLD_ID,
    type: "note",
    title: creature.title,
    slug: creature.slug,
    summary: creature.summary,
    content: [
      `## 栖息区域`,
      creature.habitat,
      "",
      "## 原典与视觉演绎",
      creature.sourceNote,
      "",
      "## 剧情与玩法用途",
      creature.mapUse,
      "",
      `地图定位：[[山海异兽图]] · 区域：${creature.habitat}`
    ].join("\n"),
    tags: ["山海经", "异兽", creature.habitat, "水彩图签"],
    visibility: "private",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: CREATURE_CATEGORY_ID,
    order: creatures.indexOf(creature),
    templateData: {}
  };
}

function makeRegion(creature, index, now) {
  return {
    id: `map-region-shanhai-${creature.key}`,
    title: `${creature.habitat} · ${creature.title}活动范围`,
    description: `${creature.title}的主要栖息地与事件影响范围。边界可继续逐点编辑。`,
    kind: index === 0 || index === 4 ? "danger" : "biome",
    color: creature.color,
    opacity: 0.14,
    order: index + 1,
    visible: true,
    locked: false,
    points: creature.region.map(([x, y]) => ({ x, y })),
    holes: [],
    labelPlacement: labelPlacement(0.55),
    references: [{ kind: "entity", id: `entity-shanhai-${creature.key}` }],
    createdAt: now,
    updatedAt: now
  };
}

function main() {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Worldcraft Codex database was not found: ${DB_PATH}`);
  }

  const store = new WorkspaceStore({
    dbPath: DB_PATH,
    backupDir: BACKUP_DIR,
    schemaVersion: 17
  });

  try {
    const loaded = store.load();
    if (!loaded.data) throw new Error("The workspace database is empty.");
    const data = loaded.data;
    const now = new Date().toISOString();

    store.save(data, "before-shanhai-map-import");

    const world = {
      id: WORLD_ID,
      ownerId: "user-owner",
      name: "山海经异兽图志",
      description: "一套可编辑的山海经水彩地图工程：底图、异兽图签、活动范围与设定条目彼此独立。",
      visibility: "private",
      createdAt: data.worlds.find((item) => item.id === WORLD_ID)?.createdAt || now,
      updatedAt: now
    };
    data.worlds = replaceFirst(data.worlds, world);

    const defaultCategories = [
      ["character", "角色", "characters", "#3f6f5c"],
      ["location", "地点", "locations", "#456d8c"],
      ["faction", "阵营与组织", "factions", "#8a5b46"],
      ["event", "事件与历史", "events", "#75608f"],
      ["item", "物品", "items", "#9a6b31"],
      ["note", "创作笔记", "notes", "#61706a"]
    ].map(([type, title, icon, color], index) => ({
      id: `category:${WORLD_ID}:${type}`,
      worldId: WORLD_ID,
      parentId: "",
      title,
      description: `${title}相关的山海经世界设定条目。`,
      icon,
      color,
      order: index,
      createdAt: now,
      updatedAt: now
    }));
    const creatureCategory = {
      id: CREATURE_CATEGORY_ID,
      worldId: WORLD_ID,
      parentId: "",
      title: "山海异兽",
      description: "地图中的独立异兽图签、原典印象与剧情用途。",
      icon: "folder",
      color: "#a4483f",
      order: 6,
      createdAt: now,
      updatedAt: now
    };
    data.codexCategories = replaceManyFirst(
      data.codexCategories,
      [...defaultCategories, creatureCategory]
    );

    const entities = creatures.map((creature) => makeEntity(creature, now));
    data.entities = replaceManyFirst(data.entities, entities);

    const baseMaterial = materializeAsset(data, {
      id: "asset-shanhai-map-base",
      filename: "shanhai-map-base.png",
      name: "山海异兽图 · 水彩底图",
      tags: ["山海经", "地图底图", "水彩手绘", "无文字"],
      notes: "无异兽、无文字的可编辑底图。",
      linkedEntityIds: []
    }, now);
    const creatureMaterials = new Map(creatures.map((creature) => [
      creature.key,
      materializeAsset(data, {
        id: `asset-shanhai-${creature.key}`,
        filename: `${creature.key}.png`,
        name: `${creature.title} · 透明水彩图签`,
        tags: ["山海经", "异兽", "透明素材", "地图图片图层"],
        notes: `${creature.title}独立透明 PNG，可在地图图层中移动、缩放、旋转、隐藏或重新排序。`,
        linkedEntityIds: [`entity-shanhai-${creature.key}`]
      }, now)
    ]));
    const importedAssets = [
      baseMaterial.asset,
      ...creatures.map((creature) => creatureMaterials.get(creature.key).asset)
    ];
    data.assets = replaceManyFirst(data.assets, importedAssets);

    const imageLayerIds = creatures.map((creature) => `map-layer-shanhai-${creature.key}`);
    const map = {
      id: MAP_ID,
      worldId: WORLD_ID,
      parentMapId: "",
      entryMarkerId: "",
      title: "山海异兽图",
      description: "卡通水彩手绘风格的山海经地图。八个异兽、八处活动范围与题签均可独立编辑。",
      imageUrl: baseMaterial.url,
      imageTransform: imageTransform(),
      width: 1586,
      height: 992,
      distanceWidth: 12000,
      distanceUnit: "li",
      customDistanceUnit: "里",
      grid: {
        visible: false,
        snap: false,
        labels: true,
        columns: 16,
        color: "#526761",
        opacity: 0.16
      },
      regions: creatures.map((creature, index) => makeRegion(creature, index, now)),
      storyPhases: [],
      viewBookmarks: [{
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
      }],
      savedFilters: [{
        id: "map-filter-shanhai-creatures",
        title: "八大异兽图层",
        mode: "layers",
        query: "",
        markerKinds: [],
        regionKinds: [],
        routeStatuses: [],
        layerIds: imageLayerIds,
        groupIds: [MARKER_GROUP_ID],
        createdAt: now,
        updatedAt: now
      }],
      createdAt: data.maps.find((item) => item.id === MAP_ID)?.createdAt || now,
      updatedAt: now
    };
    data.maps = replaceFirst(data.maps, map);

    const markerLayer = {
      id: MARKER_LAYER_ID,
      worldId: WORLD_ID,
      mapId: MAP_ID,
      title: "异兽坐标与题签",
      description: "异兽设定条目的地图入口。",
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
    const imageLayers = creatures.map((creature, index) => ({
      id: `map-layer-shanhai-${creature.key}`,
      worldId: WORLD_ID,
      mapId: MAP_ID,
      title: `${String(index + 1).padStart(2, "0")} · ${creature.title}`,
      description: `${creature.title}独立透明图签；当前放置于${creature.habitat}。`,
      color: creature.color,
      order: index + 1,
      visible: true,
      locked: false,
      imageUrl: creatureMaterials.get(creature.key).url,
      imageTransform: imageTransform(
        creature.center.x - 50,
        creature.center.y - 50,
        creature.scale,
        creature.rotation
      ),
      imageOpacity: 1,
      imageBlendMode: "normal",
      imageGroupId: "",
      createdAt: now,
      updatedAt: now
    }));
    data.mapLayers = replaceManyFirst(data.mapLayers, [markerLayer, ...imageLayers]);

    const markerGroup = {
      id: MARKER_GROUP_ID,
      worldId: WORLD_ID,
      mapId: MAP_ID,
      title: "八大异兽",
      description: "与独立异兽图层和设定条目配套的地图题签。",
      color: "#8d3f37",
      order: 1,
      visible: true,
      locked: false,
      createdAt: now,
      updatedAt: now
    };
    data.mapMarkerGroups = replaceFirst(data.mapMarkerGroups, markerGroup);

    const markers = creatures.map((creature) => ({
      id: `map-marker-shanhai-${creature.key}`,
      mapId: MAP_ID,
      layerId: MARKER_LAYER_ID,
      groupId: MARKER_GROUP_ID,
      entityId: `entity-shanhai-${creature.key}`,
      questId: "",
      sceneId: "",
      references: [{ kind: "entity", id: `entity-shanhai-${creature.key}` }],
      x: creature.marker.x,
      y: creature.marker.y,
      label: `${creature.title} · ${creature.habitat}`,
      markerType: "custom",
      color: creature.color,
      iconUrl: "",
      labelPlacement: labelPlacement(0.45),
      description: `${creature.summary} 点击可打开对应设定条目。`,
      updatedAt: now
    }));
    data.mapMarkers = replaceManyFirst(data.mapMarkers, markers);

    const ownerMember = {
      id: "member-shanhai-owner",
      worldId: WORLD_ID,
      name: "主创作者",
      email: "creator@worldcraft.local",
      role: "owner"
    };
    data.members = replaceFirst(data.members, ownerMember);

    const stats = store.save(data, "import-shanhai-watercolor-map");
    console.log(JSON.stringify({
      worldId: WORLD_ID,
      mapId: MAP_ID,
      creatures: creatures.length,
      regions: map.regions.length,
      imageLayers: imageLayers.length,
      markers: markers.length,
      assets: importedAssets.length,
      database: DB_PATH,
      assetDirectory: ASSET_DIR,
      stats
    }, null, 2));
  } finally {
    store.close();
  }
}

main();
