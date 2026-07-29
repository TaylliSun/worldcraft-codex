const WORLD_ID = "world-chinese-mythology-history";
const WORLD_NAME = "中国上古神话史";
const ORIGINAL_ADAPTATION_NOTICE = "Worldcraft Codex 原创改编，不属于古籍原文或传统传说。";

const defaultCategoryMeta = [
  ["character", "角色", "characters", "#3f6f5c"],
  ["location", "地点", "locations", "#456d8c"],
  ["faction", "阵营与组织", "factions", "#8a5b46"],
  ["event", "事件与历史", "events", "#75608f"],
  ["item", "物品", "items", "#9a6b31"],
  ["note", "创作笔记", "notes", "#61706a"]
];

const customCategoryBlueprints = [
  ["project-rules", "note", "项目规则与编辑说明", "项目范围、来源、原创标注和审核规范。", "notes", "#52635d"],
  ["primary-sources", "note", "原典文献库", "古籍、佛典、道经、礼制文献及传本记录。", "notes", "#6a6656"],
  ["ancient-core", "character", "上古神话核心", "原初宇宙、上古神祇、帝王、英雄和自然神。", "characters", "#8a4d42"],
  ["primordial", "ancient-core", "原初宇宙与天地秩序", "开辟、造化、日月、四时及天地结构的版本组。", "folder", "#715a78"],
  ["ancient-deities", "ancient-core", "上古神祇与帝王", "先秦至两汉文献中的神祇、神圣帝王与谱系。", "characters", "#8c5a42"],
  ["heroes-ancestors", "ancient-core", "英雄、祖先与文明起源", "治水、战争、发明、迁徙与族源叙事。", "characters", "#8f6d3d"],
  ["nature-deities", "ancient-core", "山川、星辰与自然神", "山川、海岳、星辰、风雨、雷火及自然秩序。", "characters", "#426f68"],
  ["daoism", "character", "道教神谱与神职体系", "按文献年代和道派分别整理尊神、神职、仙真与祖师。", "characters", "#3f6f65"],
  ["daoism-high-gods", "daoism", "三清、四御与高位尊神", "高位尊神及其不同历史层次。", "folder", "#3b665f"],
  ["daoism-stars", "daoism", "星神与天象神", "北斗、南斗、五星、二十八宿及相关神职。", "folder", "#4e6384"],
  ["daoism-offices", "daoism", "天曹、地祇与神职机构", "天界官署、三官、雷部、城隍土地及职能系统。", "folder", "#4d705e"],
  ["daoism-immortals", "daoism", "仙真与祖师", "仙真、真人、祖师及其师承传统。", "folder", "#627247"],
  ["daoism-lineages", "daoism", "道派与传承", "正一、上清、灵宝、全真等传统的文献与师承。", "folder", "#5f6e63"],
  ["daoism-zhenling-register", "daoism", "《真灵位业图》七阶名录", "按现存道藏本原次序记录七阶神位、原名与身份消歧。", "folder", "#526b64"],
  ["zhenling-rank-1", "daoism-zhenling-register", "第一阶 · 玉清境", "元始天尊所主玉清境及其下所列道君与合称神位。", "folder", "#3f6d65"],
  ["zhenling-rank-2", "daoism-zhenling-register", "第二阶 · 上清境", "太上玉晨玄皇大道君所主神位。", "folder", "#486f69"],
  ["zhenling-rank-3", "daoism-zhenling-register", "第三阶 · 太极境", "金阙帝君所主仙真、帝王与传说人物神位。", "folder", "#5b7162"],
  ["zhenling-rank-4", "daoism-zhenling-register", "第四阶 · 太清境", "太上老君所主神位及仙官。", "folder", "#67745c"],
  ["zhenling-rank-5", "daoism-zhenling-register", "第五阶 · 九宫诸曹", "九宫尚书所主仙官与诸曹神位。", "folder", "#5a6b72"],
  ["zhenling-rank-6", "daoism-zhenling-register", "第六阶 · 地仙", "定录真君所主地仙、山岳与地域神位。", "folder", "#6f7054"],
  ["zhenling-rank-7", "daoism-zhenling-register", "第七阶 · 酆都鬼官", "酆都北阴大帝所主鬼官与冥府神位。", "folder", "#6d5d62"],
  ["buddhism", "character", "汉传佛教神圣人物", "区分印度佛典身份、汉译称谓、中国化形象和民间合祀。", "characters", "#8b653c"],
  ["buddhas", "buddhism", "佛", "诸佛名号、经典出处、净土与眷属关系。", "folder", "#98713f"],
  ["bodhisattvas", "buddhism", "菩萨", "菩萨名号、誓愿、经典形象与汉地演变。", "folder", "#9a7548"],
  ["arhats", "buddhism", "罗汉与圣弟子", "罗汉、声闻弟子和汉地罗汉信仰。", "folder", "#7e6b4c"],
  ["buddhist-protectors", "buddhism", "天部与护法", "天龙八部、护法神及其汉地形象。", "folder", "#765b48"],
  ["buddhist-patriarchs", "buddhism", "祖师与译师", "宗派祖师、译经人物与历史师承。", "folder", "#6e6651"],
  ["buddhist-sinicization", "buddhism", "汉化、化身与民间合祀", "称谓、造像、职能和地方信仰的变化。", "folder", "#80664d"],
  ["confucian-ritual", "character", "儒家礼制、圣贤与国家祀典", "以礼制、文庙、先圣先师和国家祀典为核心。", "characters", "#665b78"],
  ["heaven-earth-rites", "confucian-ritual", "天地、社稷与国家祀典", "天、地、社、稷、宗庙及国家礼制对象。", "folder", "#695e78"],
  ["confucius-temple", "confucian-ritual", "文庙与先圣先师", "孔子主祀、四配、十二哲及历代从祀制度。", "folder", "#715b72"],
  ["confucian-sages", "confucian-ritual", "圣贤与道统人物", "经传、道统与后世礼制中的圣贤人物。", "folder", "#625d74"],
  ["ritual-evolution", "confucian-ritual", "礼制沿革", "称号、配享、祭仪和国家制度的时代变化。", "folder", "#75657b"],
  ["folk-belief", "character", "民间信仰与地方神", "地方神、行业神、保护神及其区域差异。", "characters", "#7d5848"],
  ["local-deities", "folk-belief", "地方神与祖先神", "地方庙祀、祖先神与区域传说。", "folder", "#7c5b4c"],
  ["city-land-deities", "folk-belief", "城隍、土地与境域保护", "城市、乡里、境域与阴司职能。", "folder", "#705c4d"],
  ["water-sea-deities", "folk-belief", "水神、海神与航运信仰", "江河湖海、治水、航海和水域保护。", "folder", "#526d75"],
  ["profession-deities", "folk-belief", "行业神与生活信仰", "工匠、商贸、医药、农桑及行业祭祀。", "folder", "#776548"],
  ["syncretism", "note", "三教交涉、同神异名与合祀", "记录吸收、改称、合祀和争议对应，不直接合并身份。", "notes", "#6c5d74"],
  ["same-name", "syncretism", "同名异神与身份消歧", "同名、异名和身份重叠的证据页。", "folder", "#6b6079"],
  ["fusion", "syncretism", "后世合流与职能迁移", "不同传统间的吸收、化身说、职能替代和合流。", "folder", "#786070"],
  ["shared-ritual", "syncretism", "合祀与仪式共存", "庙宇共存、配祀、地方礼仪与制度交涉。", "folder", "#6b6b78"],
  ["mythic-geography", "location", "神话空间与信仰地理", "神话空间、历史地点和传播地域分层记录。", "locations", "#3e6c78"],
  ["mythic-events", "event", "神话叙事事件", "使用相对顺序，不伪造公元纪年。", "events", "#7b594c"],
  ["textual-events", "event", "文献证据与成书事件", "记录文本出现、版本演变和重要文献见证。", "events", "#5d687e"],
  ["institutional-events", "event", "宗教与礼制制度事件", "教团、祀典、封号、配享和制度沿革。", "events", "#715b79"],
  ["cult-evolution-events", "event", "信仰演变与合流事件", "地方神全国化、三教合流和图像再塑。", "events", "#6d654f"],
  ["adaptation", "note", "原创改编区", "只收录明确标注的项目原创故事、角色与视觉改编。", "notes", "#89586c"]
];

function categoryId(worldId, key) {
  return key.includes(":") ? key : `category:${worldId}:mythology:${key}`;
}

function buildCategories(worldId, now) {
  const defaults = defaultCategoryMeta.map(([type, title, icon, color], order) => ({
    id: `category:${worldId}:${type}`,
    worldId,
    parentId: "",
    title,
    description: `${title}相关的世界设定条目。`,
    icon,
    color,
    order,
    createdAt: now,
    updatedAt: now
  }));
  const parentFor = (parent) => (
    defaultCategoryMeta.some(([type]) => type === parent)
      ? `category:${worldId}:${parent}`
      : categoryId(worldId, parent)
  );
  const custom = customCategoryBlueprints.map(
    ([key, parent, title, description, icon, color], index) => ({
      id: categoryId(worldId, key),
      worldId,
      parentId: parentFor(parent),
      title,
      description,
      icon,
      color,
      order: index + 10,
      createdAt: now,
      updatedAt: now
    })
  );
  return [...defaults, ...custom];
}

function templateField(worldId, templateKey, spec, order) {
  return {
    id: `template-field:${worldId}:mythology:${templateKey}:${spec.key}`,
    key: spec.key,
    label: spec.label,
    type: spec.type || "text",
    required: Boolean(spec.required),
    secret: Boolean(spec.secret),
    defaultValue: spec.defaultValue ?? (spec.type === "boolean" ? "false" : ""),
    options: spec.options || [],
    targetEntityTypes: spec.targetEntityTypes || [],
    order
  };
}

function buildTemplates(worldId, now) {
  const definitions = [
    {
      key: "deity-person",
      name: "神祇与人物考据模板",
      description: "把传统归属、最早出处、历史层、职掌、形象和争议分开记录。",
      entityTypes: ["character"],
      fields: [
        { key: "canonicalName", label: "规范名称", required: true },
        { key: "aliases", label: "别称与异名", type: "textarea" },
        { key: "tradition", label: "传统归属", type: "select", required: true, options: ["上古神话", "道教", "佛教", "儒家礼制", "民间信仰", "跨传统"] },
        { key: "identityType", label: "身份类型", type: "select", required: true, options: ["神祇", "佛", "菩萨", "罗汉", "护法", "仙真", "帝王", "英雄", "圣贤", "祖师", "地方神", "历史人物", "其他"] },
        { key: "earliestSource", label: "最早文献", required: true },
        { key: "sourceLocation", label: "原典位置", required: true },
        { key: "narrativeEra", label: "神话叙事年代" },
        { key: "historicalLayer", label: "文献历史层", type: "select", required: true, options: ["神话叙事层", "先秦文献层", "两汉文献层", "魏晋六朝", "隋唐", "宋元", "明清", "近现代整理", "跨时期"] },
        { key: "domains", label: "职掌与权能", type: "textarea" },
        { key: "iconography", label: "形象与标志", type: "textarea" },
        { key: "worship", label: "祭祀与信仰", type: "textarea" },
        { key: "regionalVariants", label: "地域与派别差异", type: "textarea" },
        { key: "confidence", label: "资料可信度", type: "select", required: true, options: ["明确", "主流说法", "存疑", "后世附会", "原创设定"] },
        { key: "editorialStatus", label: "编辑状态", type: "select", required: true, options: ["待考据", "初稿", "复核中", "已定稿"] },
        { key: "originalAdaptation", label: "包含原创改编", type: "boolean", defaultValue: "false" }
      ]
    },
    {
      key: "source-text",
      name: "原典文献与传本模板",
      description: "记录书名、成书层、版本和内部出处，不在公开 Wiki 中保存外部链接。",
      entityTypes: ["note"],
      fields: [
        { key: "workTitle", label: "书名", required: true },
        { key: "workType", label: "文献类型", type: "select", required: true, options: ["先秦两汉古籍", "魏晋六朝及隋唐古籍", "史书与礼志", "道经", "佛典", "儒家礼制文献", "地方志与碑刻", "图像与实物", "现代研究书目"] },
        { key: "formationPeriod", label: "成书或形成时期", required: true },
        { key: "edition", label: "使用版本" },
        { key: "volumeSection", label: "卷篇位置" },
        { key: "sourceLayer", label: "资料层级", type: "select", required: true, options: ["原文", "异文", "注疏", "史料记录", "现代研究"] },
        { key: "rightsStatus", label: "使用边界", type: "select", required: true, options: ["古籍原文", "授权转录", "项目自写整理", "仅作内部参考"] },
        { key: "internalCitation", label: "内部书目格式", type: "textarea", required: true },
        { key: "reviewStatus", label: "复核状态", type: "select", required: true, options: ["待核对", "已核原文", "已核版本", "可公开"] }
      ]
    },
    {
      key: "zhenling-catalog-entry",
      name: "《真灵位业图》神位名录模板",
      description: "保存原典名号、七阶位置、身份性质与消歧状态；名录只列名称时不补写无据生平。",
      entityTypes: ["character"],
      fields: [
        { key: "canonicalName", label: "规范名称", required: true },
        { key: "sourceNameForm", label: "原典名号", required: true },
        { key: "tradition", label: "传统归属", type: "select", required: true, options: ["道教"] },
        { key: "identityType", label: "身份类型", type: "select", required: true, options: ["神祇", "仙真", "神官", "鬼官", "历史人物神格", "名录身份待考"] },
        { key: "pantheonSystem", label: "神谱体系", required: true },
        { key: "rankPosition", label: "神谱阶位", required: true },
        { key: "seatSide", label: "位次分区", type: "select", required: true, options: ["中位", "左位", "右位", "女真位", "散位", "未注明"] },
        { key: "recordNature", label: "名录性质", type: "select", required: true, options: ["单列神名", "单列人名", "官号兼人名", "同神异号候选", "仅见名录", "合称神位"] },
        { key: "sourceLocation", label: "原典位置", required: true },
        { key: "historicalLayer", label: "文献历史层", type: "select", required: true, options: ["魏晋六朝", "隋唐校定层", "跨时期"] },
        { key: "normalizationStatus", label: "身份处理", type: "select", required: true, options: ["独立建页", "连接既有身份", "待更多原典消歧", "仅保留合称"] },
        { key: "confidence", label: "资料可信度", type: "select", required: true, options: ["原典明确列名", "字形待校", "身份待考", "同一性有争议"] },
        { key: "editorialStatus", label: "编辑状态", type: "select", required: true, options: ["原名已录", "初步消歧", "交叉复核中", "已定稿"] },
        { key: "originalAdaptation", label: "包含原创改编", type: "boolean", defaultValue: "false" }
      ]
    },
    {
      key: "myth-history-event",
      name: "神话与宗教史事件模板",
      description: "把神话叙事时间和可考历史时间分开。",
      entityTypes: ["event"],
      fields: [
        { key: "timelineLayer", label: "时间轴层", type: "select", required: true, options: ["神话叙事", "文献证据", "宗教制度", "信仰演变"] },
        { key: "eventType", label: "事件类型", required: true },
        { key: "narrativeDate", label: "神话相对年代" },
        { key: "historicalDate", label: "可考历史年代" },
        { key: "earliestSource", label: "最早文献", required: true },
        { key: "sourceLocation", label: "原典位置", required: true },
        { key: "participants", label: "参与者", type: "entity_ref", targetEntityTypes: ["character"] },
        { key: "place", label: "发生地点", type: "entity_ref", targetEntityTypes: ["location"] },
        { key: "confidence", label: "资料可信度", type: "select", required: true, options: ["明确", "主流说法", "存疑", "后世附会", "原创设定"] },
        { key: "versionNotes", label: "版本差异", type: "textarea" },
        { key: "originalAdaptation", label: "原创改编事件", type: "boolean", defaultValue: "false" }
      ]
    },
    {
      key: "institution-ritual",
      name: "神职、祭祀与制度模板",
      description: "记录神职机构、教团、祀典和仪式制度的形成与变化。",
      entityTypes: ["faction", "note"],
      fields: [
        { key: "tradition", label: "传统归属", type: "select", required: true, options: ["上古祭祀", "道教", "佛教", "儒家礼制", "民间信仰", "跨传统"] },
        { key: "institutionKind", label: "制度类型", required: true },
        { key: "hierarchyLevel", label: "层级与位置" },
        { key: "jurisdiction", label: "职掌范围", type: "textarea" },
        { key: "formationPeriod", label: "形成时期", required: true },
        { key: "earliestSource", label: "最早文献", required: true },
        { key: "sourceLocation", label: "原典位置", required: true },
        { key: "variants", label: "派别与地域差异", type: "textarea" },
        { key: "confidence", label: "资料可信度", type: "select", required: true, options: ["明确", "主流说法", "存疑", "后世附会"] }
      ]
    },
    {
      key: "sacred-geography",
      name: "神话空间与信仰地理模板",
      description: "区分想象空间、历史地点、传播地域和存疑的现代对应。",
      entityTypes: ["location"],
      fields: [
        { key: "spaceKind", label: "空间类型", type: "select", required: true, options: ["神话空间", "历史地点", "信仰传播区域", "庙宇与遗址", "存疑对应"] },
        { key: "tradition", label: "传统归属", type: "select", required: true, options: ["上古神话", "道教", "佛教", "儒家礼制", "民间信仰", "跨传统"] },
        { key: "historicalPeriod", label: "适用时期" },
        { key: "sourceTitle", label: "最早文献", required: true },
        { key: "sourceLocation", label: "原典位置", required: true },
        { key: "modernCorrespondence", label: "现代地理对应", type: "textarea" },
        { key: "confidence", label: "对应可信度", type: "select", required: true, options: ["明确", "大致区域", "多种说法", "无法对应"] },
        { key: "mapCaution", label: "地图说明", type: "textarea", defaultValue: "神话地图仅用于叙事与文献索引，不自动等同现代经纬度。" }
      ]
    }
  ];
  return definitions.map((definition) => ({
    id: `template:${worldId}:mythology:${definition.key}`,
    worldId,
    name: definition.name,
    description: definition.description,
    entityTypes: definition.entityTypes,
    fields: definition.fields.map((field, index) => templateField(worldId, definition.key, field, index)),
    builtIn: false,
    createdAt: now,
    updatedAt: now
  }));
}

function entityId(worldId, key) {
  return `entity:${worldId}:mythology:${key}`;
}

function buildEntities(worldId, now) {
  const rows = [
    {
      key: "reading-and-sources",
      title: "阅读与来源说明",
      summary: "说明原文、项目今译、百科整理与原创改编之间的边界。",
      category: "project-rules",
      visibility: "public",
      content: [
        "<h2>四种内容</h2>",
        "<p><strong>古籍原文</strong>保留古代文献文字；<strong>项目今译</strong>是 Worldcraft Codex 依据原文重新编写的现代汉语；<strong>百科整理</strong>将原典事实、文献年代和后世演变分开说明；<strong>原创改编</strong>只服务小说、游戏和剧情创作。</p>",
        "<h2>原创声明</h2>",
        `<p><strong>${ORIGINAL_ADAPTATION_NOTICE}</strong></p>`,
        "<h2>公开规则</h2>",
        "<p>公开 Wiki 不保存第三方链接。出处使用书名、卷篇、章节和版本说明；事实、推断与原创内容不得互相冒充。</p>"
      ].join("")
    },
    {
      key: "relation-evidence-rules",
      title: "关系证据规则",
      summary: "每条神谱关系都必须说明证据类型、出处、适用年代与可信度。",
      category: "project-rules",
      visibility: "public",
      content: [
        "<h2>关系不是永恒事实</h2>",
        "<p>血缘、师承、神职、化身、合祀和同神异名可能只在特定文献或特定年代成立，因此关系必须记录适用时期。</p>",
        "<h2>四项必填</h2>",
        "<ul><li>证据类型：古籍原文、史籍、礼制科仪、实物图像、考据推断、地方传统或原创设定。</li><li>原典出处：书名、卷篇与章节。</li><li>适用年代：神话叙事层、文献层或后世合流时期。</li><li>可信度：明确、较可信、存在争议或原创设定。</li></ul>",
        "<h2>禁止自动合并</h2>",
        "<p>“同一位神”和“后来被视作同一位神”必须使用不同关系。存疑对应只能建立争议关系，不能覆盖原条目。</p>"
      ].join("")
    },
    {
      key: "timeline-rules",
      title: "四条时间轴使用说明",
      summary: "神话叙事、文献证据、宗教制度与信仰演变分别排序。",
      category: "project-rules",
      visibility: "public",
      content: [
        "<h2>神话叙事轴</h2><p>记录开辟、造化、战争、洪水和圣王等故事内部的相对次序，不伪造公元纪年。</p>",
        "<h2>文献证据轴</h2><p>记录某一形象、关系或称谓何时见于可考文献。</p>",
        "<h2>宗教制度轴</h2><p>记录教团、神谱、国家祀典、封号和配享制度。</p>",
        "<h2>信仰演变轴</h2><p>记录地方神全国化、三教合流、小说戏曲与图像再塑。</p>"
      ].join("")
    },
    {
      key: "original-adaptation-rules",
      title: "原创改编说明",
      summary: "所有项目新编故事、角色和视觉设定都必须显式标注。",
      category: "adaptation",
      visibility: "public",
      content: [
        "<h2>固定标注</h2>",
        `<p><strong>${ORIGINAL_ADAPTATION_NOTICE}</strong></p>`,
        "<h2>使用范围</h2>",
        "<p>原创内容可以借用已注明出处的传统人物、地点和母题，但不得把新写的对白、亲属、神职、事件或结局写成传统流传事实。</p>",
        "<h2>视觉改编</h2>",
        "<p>项目新画形象要记录参考时代与改编说明，不能让后世小说造型冒充早期文献形象。</p>"
      ].join("")
    },
    {
      key: "source-register",
      title: "原典书目总表",
      summary: "第一阶段使用的古籍、道经、佛典和礼制文献登记页。",
      category: "primary-sources",
      visibility: "shared",
      template: "source-text",
      templateData: {
        workTitle: "中国神话与三教原典书目总表",
        workType: "现代研究书目",
        formationPeriod: "项目阶段 0",
        edition: "逐书登记",
        volumeSection: "总表",
        sourceLayer: "现代研究",
        rightsStatus: "项目自写整理",
        internalCitation: "书名 · 卷篇 · 章节 · 使用版本",
        reviewStatus: "待核对"
      },
      content: [
        "<h2>上古与礼制核心</h2><p>《诗经》《尚书》《仪礼》《周礼》《礼记》《楚辞》《山海经》《淮南子》《史记》及历代史书礼志。</p>",
        "<h2>道教文献层</h2><p>按早期道教、上清、灵宝、正一、全真及后世科仪分别登记，不以后世神谱倒推上古。</p>",
        "<h2>汉传佛教文献层</h2><p>按汉译佛典、经录、宗派文献与中国化信仰材料分别登记，保留译名和时代差异。</p>",
        "<h2>书目规则</h2><p>公开条目只显示内部书目，不嵌入外部链接；现代论文与数据库仅作内部核对，不能直接复制其文案。</p>"
      ].join("")
    },
    {
      key: "identity-disambiguation",
      title: "同名神祇与异名辨识",
      summary: "从时代、地域、原典和职掌辨认同名异神、异名同神与后世合流。",
      category: "same-name",
      visibility: "public",
      content: [
        "<h2>名字为何会重合</h2><p>神名可能来自官职、星名、山川称谓或地方尊号。两个时代都出现“司命”或“王灵官”，并不表示说的是同一位神。</p>",
        "<h2>先看时代与地域</h2><p>辨认身份时先找最早文献，再比较活动地域、祭祀场所和传统归属。线索不能合拢时，宁可保留两个条目，也不把相似名字硬接成一条生平。</p>",
        "<h2>再看职掌与出处</h2><p>同一身份可以拥有多个尊号，不同神祇也可能共享护城、司命或求财职能。页面之间用原典、后世合流、职能迁移和存疑异说分别连接，让读者看见称谓如何变化。</p>"
      ].join("")
    },
    {
      key: "visual-rules",
      title: "图像与视觉改编规则",
      summary: "人物透明图、宗教图像和历史形制的制作边界。",
      category: "project-rules",
      visibility: "shared",
      content: [
        "<h2>独立素材</h2><p>神祇与人物使用透明背景独立图，并记录参考时代、服饰依据、宗教传统和是否为项目艺术改编。</p>",
        "<h2>版本组</h2><p>同一人物在不同经典、朝代或地域存在稳定差异时，建立图像版本组，不强行选定唯一标准像。</p>",
        "<h2>尊重形制</h2><p>宗教图像优先遵循经典形制与可考图像；不能把游戏化造型标作传统圣像。</p>"
      ].join("")
    },
    {
      key: "phase-one-checklist",
      title: "阶段一：上古核心制作清单",
      summary: "首批 120 个上古核心条目的内部执行清单。",
      category: "project-rules",
      visibility: "private",
      content: [
        "<h2>交付量</h2><p>120 个核心人物与神祇、300 条证据关系、50 个双时间事件。</p>",
        "<h2>制作顺序</h2><ol><li>原初宇宙与天地秩序</li><li>上古神祇与帝王</li><li>英雄、祖先与文明起源</li><li>山川、星辰与自然神</li></ol>",
        "<h2>完成条件</h2><p>每个条目必须有最早文献、原典位置、历史层、可信度和编辑状态；原创剧情另行标注。</p>"
      ].join("")
    }
  ];
  return rows.map((row, order) => ({
    id: entityId(worldId, row.key),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-${row.key}`,
    summary: row.summary,
    content: row.content,
    tags: ["中国神话史", "项目规则", row.title],
    visibility: row.visibility,
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, row.category),
    order,
    templateId: row.template ? `template:${worldId}:mythology:${row.template}` : undefined,
    templateData: row.templateData || {}
  }));
}

function buildTimelineTracks(worldId, now) {
  return [
    ["mythic-narrative", "神话叙事", "故事内部的相对次序；不使用伪造的公元纪年。", "#8a4d42"],
    ["textual-evidence", "文献证据", "形象、称谓、关系和事件在可考文本中的出现与变化。", "#4f6785"],
    ["religious-institutions", "宗教与礼制制度", "教团、神谱、国家祀典、封号和配享制度。", "#6b5b7d"],
    ["cult-evolution", "信仰演变与合流", "地域传播、合祀、职能迁移、小说戏曲和图像再塑。", "#527064"]
  ].map(([key, name, description, color], order) => ({
    id: `timeline-track:${worldId}:mythology:${key}`,
    worldId,
    name,
    description,
    color,
    order,
    updatedAt: now
  }));
}

function buildAiMemories(worldId, now) {
  const rules = [
    ["source-layers", "内容来源四分法", "所有内容必须区分古籍原文、项目今译、百科整理和原创改编。", "内容", "来源层级", "原文/今译/整理/原创"],
    ["tradition-boundaries", "传统边界规则", "佛教、道教、儒家礼制、上古神话和民间信仰分别建类；后世合流只能用有证据关系表达。", "宗教传统", "合并规则", "先分后连"],
    ["timeline-layers", "四条时间轴规则", "神话叙事、文献证据、宗教制度和信仰演变分别排序；神话年代不得伪装成精确公元纪年。", "时间轴", "分层", "叙事/文献/制度/演变"],
    ["relation-evidence", "关系证据规则", "每条关系必须记录证据类型、原典出处、适用年代和可信度。", "关系", "必填证据", "类型/出处/年代/可信度"],
    ["originality-label", "原创故事标注", ORIGINAL_ADAPTATION_NOTICE, "原创内容", "公开标注", ORIGINAL_ADAPTATION_NOTICE],
    ["public-no-links", "公开 Wiki 不保存第三方链接", "公开条目使用书名、卷篇、章节和版本说明，不嵌入第三方链接，也不复制第三方 Wiki 文案。", "公开 Wiki", "外部链接", "禁止"]
  ];
  return rules.map(([key, title, content, subject, property, value], order) => ({
    id: `ai-memory:${worldId}:mythology:${key}`,
    worldId,
    category: "rule",
    state: "confirmed",
    title,
    content,
    sourceContextId: `world:${worldId}`,
    fact: { subject, property, value, temporalScope: "全项目" },
    sources: [{
      id: `ai-memory-source:${worldId}:mythology:${key}`,
      kind: "imported",
      contextId: `world:${worldId}`,
      contextLabel: "中国上古神话史 · 阶段 0 编辑规则",
      writingSessionId: "",
      excerpt: content,
      capturedAt: now
    }],
    relations: [],
    tags: ["中国神话史", "作者确认", "编辑规则"],
    ignoredConflictIds: [],
    excludedContextIds: [],
    pinned: true,
    lastVerifiedAt: now,
    createdAt: now,
    updatedAt: now,
    order
  }));
}

function buildMythologyFoundation(now = new Date().toISOString(), worldId = WORLD_ID) {
  const categories = buildCategories(worldId, now);
  const templates = buildTemplates(worldId, now);
  const entities = buildEntities(worldId, now);
  const timelineTracks = buildTimelineTracks(worldId, now);
  const navKeys = [
    "ancient-core",
    "daoism",
    "buddhism",
    "confucian-ritual",
    "folk-belief",
    "syncretism",
    "primary-sources",
    "adaptation"
  ];
  const world = {
    id: worldId,
    ownerId: "user-owner",
    name: WORLD_NAME,
    description: "以上古神话为核心，分层整理佛教、道教、儒家礼制与民间信仰的神圣人物、文献证据、关系谱系和历史演变。",
    visibility: "private",
    wiki: {
      coverAssetId: "",
      themeColor: "#315f58",
      navigationCategoryIds: navKeys.map((key) => categoryId(worldId, key)),
      featuredEntityIds: [
        "reading-and-sources",
        "relation-evidence-rules",
        "timeline-rules",
        "original-adaptation-rules"
      ].map((key) => entityId(worldId, key)),
      defaultMapId: "",
      publishedMapIds: [],
      publishedTimelineTrackIds: timelineTracks.map((item) => item.id),
      publishedQuestIds: []
    },
    createdAt: now,
    updatedAt: now
  };
  return {
    world,
    categories,
    templates,
    entities,
    timelineTracks,
    timelineEvents: [],
    relations: [],
    aiMemoryItems: buildAiMemories(worldId, now),
    member: {
      id: `member:${worldId}:owner`,
      worldId,
      name: "主创作者",
      email: "creator@worldcraft.local",
      role: "owner"
    }
  };
}

module.exports = {
  ORIGINAL_ADAPTATION_NOTICE,
  WORLD_ID,
  WORLD_NAME,
  buildMythologyFoundation,
  categoryId,
  entityId
};
