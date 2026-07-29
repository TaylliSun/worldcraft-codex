export type TemplateEntityType =
  | "character"
  | "location"
  | "faction"
  | "event"
  | "item"
  | "note";

export type EntityTemplateFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "entity_ref";

export type EntityTemplateField = {
  id: string;
  key: string;
  label: string;
  type: EntityTemplateFieldType;
  required: boolean;
  secret: boolean;
  defaultValue: string;
  options: string[];
  targetEntityTypes: TemplateEntityType[];
  order: number;
};

export type EntityTemplateDefinition = {
  id: string;
  worldId: string;
  name: string;
  description: string;
  entityTypes: TemplateEntityType[];
  fields: EntityTemplateField[];
  builtIn: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TemplateEntity = {
  id: string;
  worldId: string;
  type: TemplateEntityType;
  title: string;
  templateId?: string;
  templateData: Record<string, string>;
};

export type EntityTemplateIssue = {
  code:
    | "missing-name"
    | "missing-type"
    | "duplicate-field-key"
    | "missing-field-key"
    | "missing-field-label"
    | "invalid-select-options"
    | "missing-template"
    | "incompatible-template"
    | "missing-required-value"
    | "broken-entity-reference";
  severity: "error" | "warning";
  templateId?: string;
  entityId?: string;
  title: string;
  detail: string;
};

export type TemplateCompletion = {
  required: number;
  completed: number;
  missingKeys: string[];
  percent: number;
};

export const templateEntityTypes: TemplateEntityType[] = [
  "character",
  "location",
  "faction",
  "event",
  "item",
  "note"
];

export const templateEntityTypeLabels: Record<TemplateEntityType, string> = {
  character: "人物",
  location: "地点",
  faction: "组织",
  event: "事件",
  item: "物品",
  note: "笔记"
};

export const entityTemplateFieldTypeLabels: Record<EntityTemplateFieldType, string> = {
  text: "短文本",
  textarea: "长文本",
  number: "数值",
  boolean: "开关",
  select: "单选",
  entity_ref: "条目引用"
};

const fieldTypes: EntityTemplateFieldType[] = [
  "text",
  "textarea",
  "number",
  "boolean",
  "select",
  "entity_ref"
];

const defaultFields: Record<TemplateEntityType, Array<[string, string, EntityTemplateFieldType, boolean?]>> = {
  character: [
    ["aliases", "别名", "text"],
    ["alignment", "阵营", "text"],
    ["faction", "所属组织", "text"],
    ["birthplace", "出生地", "entity_ref"],
    ["goals", "目标", "textarea", true],
    ["secrets", "秘密", "textarea"],
    ["relationships", "关系", "textarea"]
  ],
  location: [
    ["category", "类型", "text"],
    ["region", "所属区域", "text"],
    ["residents", "居民", "textarea"],
    ["history", "历史", "textarea"],
    ["dangers", "危险", "textarea"],
    ["relatedEvents", "关联事件", "entity_ref"]
  ],
  faction: [
    ["category", "类型", "text"],
    ["leader", "领袖", "text"],
    ["members", "成员", "textarea"],
    ["goals", "目标", "textarea", true],
    ["enemies", "敌人", "textarea"],
    ["resources", "资源", "textarea"]
  ],
  event: [
    ["time", "时间", "text", true],
    ["place", "地点", "entity_ref"],
    ["participants", "参与者", "textarea"],
    ["cause", "起因", "textarea"],
    ["result", "结果", "textarea"]
  ],
  item: [
    ["category", "类型", "text"],
    ["holder", "持有者", "text"],
    ["origin", "来源", "textarea"],
    ["abilities", "能力", "textarea", true],
    ["limits", "限制", "textarea"]
  ],
  note: [
    ["topic", "主题", "text"],
    ["status", "状态", "select"],
    ["nextStep", "下一步", "textarea"]
  ]
};

type TemplateFieldPreset = [
  key: string,
  label: string,
  type: EntityTemplateFieldType,
  options?: {
    required?: boolean;
    secret?: boolean;
    defaultValue?: string;
    options?: string[];
    targetEntityTypes?: TemplateEntityType[];
  }
];

type SpecializedTemplatePreset = {
  slug: string;
  name: string;
  description: string;
  entityType: TemplateEntityType;
  fields: TemplateFieldPreset[];
};

const specializedTemplatePresets: SpecializedTemplatePreset[] = [
  {
    slug: "generic",
    name: "通用文章",
    description: "不属于固定类型的概念、规则、说明与灵感记录。",
    entityType: "note",
    fields: [
      ["topic", "主题", "text", { required: true }],
      ["purpose", "用途", "textarea"],
      ["status", "整理状态", "select", { options: ["草稿", "整理中", "已定稿"] }],
      ["nextStep", "下一步", "textarea"]
    ]
  },
  {
    slug: "building",
    name: "建筑与地标",
    description: "建筑、遗迹、设施与可探索地标。",
    entityType: "location",
    fields: [
      ["function", "主要用途", "textarea", { required: true }],
      ["parentLocation", "所在地点", "entity_ref", { targetEntityTypes: ["location"] }],
      ["owner", "所有者或管理者", "entity_ref", { targetEntityTypes: ["character", "faction"] }],
      ["appearance", "外观", "textarea"],
      ["interior", "内部结构", "textarea"],
      ["history", "历史", "textarea"],
      ["secrets", "隐藏区域与秘密", "textarea", { secret: true }]
    ]
  },
  {
    slug: "character",
    name: "角色档案",
    description: "适配游戏角色、NPC 与小说人物的完整档案。",
    entityType: "character",
    fields: [
      ["aliases", "别名", "text"],
      ["role", "叙事身份", "text", { required: true }],
      ["currentLocation", "当前位置", "entity_ref", { targetEntityTypes: ["location"] }],
      ["affiliation", "所属组织", "entity_ref", { targetEntityTypes: ["faction"] }],
      ["motivation", "核心动机", "textarea", { required: true }],
      ["conflict", "主要矛盾", "textarea"],
      ["arc", "角色弧", "textarea"],
      ["secrets", "秘密", "textarea", { secret: true }]
    ]
  },
  {
    slug: "country",
    name: "国家与政权",
    description: "国家、领地、政权及其治理结构。",
    entityType: "faction",
    fields: [
      ["capital", "首都", "entity_ref", { targetEntityTypes: ["location"] }],
      ["government", "政体", "text", { required: true }],
      ["ruler", "统治者", "entity_ref", { targetEntityTypes: ["character"] }],
      ["population", "人口与族群", "textarea"],
      ["culture", "文化特征", "textarea"],
      ["military", "军事力量", "textarea"],
      ["diplomacy", "外交关系", "textarea"]
    ]
  },
  {
    slug: "military",
    name: "军事组织",
    description: "军队、骑士团、舰队与武装势力。",
    entityType: "faction",
    fields: [
      ["commander", "指挥官", "entity_ref", { targetEntityTypes: ["character"] }],
      ["base", "驻地", "entity_ref", { targetEntityTypes: ["location"] }],
      ["doctrine", "作战原则", "textarea", { required: true }],
      ["strength", "规模与战力", "textarea"],
      ["resources", "装备与资源", "textarea"],
      ["enemies", "主要敌人", "textarea"]
    ]
  },
  {
    slug: "deity",
    name: "神祇与超凡存在",
    description: "神明、半神、祖灵与高位超凡角色。",
    entityType: "character",
    fields: [
      ["domains", "权能领域", "text", { required: true }],
      ["symbols", "象征与圣徽", "text"],
      ["religion", "关联信仰", "entity_ref", { targetEntityTypes: ["faction"] }],
      ["worshippers", "崇拜者", "textarea"],
      ["powers", "神力与显迹", "textarea"],
      ["taboos", "禁忌", "textarea"],
      ["myths", "相关神话", "textarea"]
    ]
  },
  {
    slug: "geography",
    name: "地理区域",
    description: "山脉、海域、荒野、位面与大型自然区域。",
    entityType: "location",
    fields: [
      ["region", "上级区域", "entity_ref", { targetEntityTypes: ["location"] }],
      ["terrain", "地貌", "textarea", { required: true }],
      ["climate", "气候", "textarea"],
      ["resources", "自然资源", "textarea"],
      ["hazards", "环境危险", "textarea"],
      ["inhabitants", "居民与生物", "textarea"]
    ]
  },
  {
    slug: "item",
    name: "物品档案",
    description: "关键道具、神器、装备与剧情物件。",
    entityType: "item",
    fields: [
      ["holder", "当前持有者", "entity_ref", { targetEntityTypes: ["character"] }],
      ["creator", "制造者", "entity_ref", { targetEntityTypes: ["character", "faction"] }],
      ["material", "材质", "text"],
      ["abilities", "能力与用途", "textarea", { required: true }],
      ["limits", "限制与代价", "textarea"],
      ["history", "流传历史", "textarea"]
    ]
  },
  {
    slug: "organization",
    name: "组织与势力",
    description: "公会、公司、学院、秘密结社与政治团体。",
    entityType: "faction",
    fields: [
      ["leader", "领袖", "entity_ref", { targetEntityTypes: ["character"] }],
      ["headquarters", "总部", "entity_ref", { targetEntityTypes: ["location"] }],
      ["members", "成员构成", "textarea"],
      ["goals", "目标", "textarea", { required: true }],
      ["resources", "资源", "textarea"],
      ["rivals", "盟友与对手", "textarea"]
    ]
  },
  {
    slug: "religion",
    name: "宗教与信仰",
    description: "宗教组织、教派、信条与神圣制度。",
    entityType: "faction",
    fields: [
      ["deity", "崇拜对象", "entity_ref", { targetEntityTypes: ["character"] }],
      ["doctrine", "核心教义", "textarea", { required: true }],
      ["clergy", "神职体系", "textarea"],
      ["sacredSites", "圣地", "entity_ref", { targetEntityTypes: ["location"] }],
      ["rituals", "主要仪式", "textarea"],
      ["taboos", "禁忌", "textarea"]
    ]
  },
  {
    slug: "species",
    name: "物种与族群",
    description: "智慧种族、异兽物种与生态族群。",
    entityType: "note",
    fields: [
      ["habitat", "栖息地", "entity_ref", { targetEntityTypes: ["location"] }],
      ["traits", "形态特征", "textarea", { required: true }],
      ["behavior", "行为习性", "textarea"],
      ["diet", "食性", "text"],
      ["lifecycle", "生命周期", "textarea"],
      ["relations", "与其他族群的关系", "textarea"]
    ]
  },
  {
    slug: "vehicle",
    name: "载具与交通工具",
    description: "车辆、船只、飞行器、坐骑与大型移动平台。",
    entityType: "item",
    fields: [
      ["operator", "驾驶者或所属方", "entity_ref", { targetEntityTypes: ["character", "faction"] }],
      ["origin", "制造地点", "entity_ref", { targetEntityTypes: ["location"] }],
      ["propulsion", "动力方式", "textarea", { required: true }],
      ["capacity", "载员与载荷", "text"],
      ["abilities", "特殊能力", "textarea"],
      ["limits", "限制与维护", "textarea"]
    ]
  },
  {
    slug: "settlement",
    name: "聚落与城市",
    description: "村落、城镇、都市、空间站与定居点。",
    entityType: "location",
    fields: [
      ["region", "所属区域", "entity_ref", { targetEntityTypes: ["location"] }],
      ["government", "治理者", "entity_ref", { targetEntityTypes: ["character", "faction"] }],
      ["population", "人口", "text"],
      ["economy", "经济与产业", "textarea"],
      ["districts", "区域与街区", "textarea", { required: true }],
      ["threats", "当前威胁", "textarea"]
    ]
  },
  {
    slug: "condition",
    name: "状态与疾病",
    description: "疾病、诅咒、变异、异常状态与长期影响。",
    entityType: "note",
    fields: [
      ["symptoms", "症状", "textarea", { required: true }],
      ["cause", "成因", "textarea"],
      ["transmission", "传播方式", "textarea"],
      ["stages", "发展阶段", "textarea"],
      ["treatment", "治疗与解除", "textarea"],
      ["impact", "社会与剧情影响", "textarea"]
    ]
  },
  {
    slug: "conflict",
    name: "冲突与战争",
    description: "战争、战役、决斗、政治冲突与长期对抗。",
    entityType: "event",
    fields: [
      ["time", "时间", "text", { required: true }],
      ["place", "地点", "entity_ref", { targetEntityTypes: ["location"] }],
      ["belligerents", "参与阵营", "textarea", { required: true }],
      ["cause", "起因", "textarea"],
      ["turningPoints", "关键转折", "textarea"],
      ["result", "结果与余波", "textarea"]
    ]
  },
  {
    slug: "document",
    name: "文献与文书",
    description: "书籍、法令、信件、档案、预言与游戏内文本。",
    entityType: "note",
    fields: [
      ["author", "作者", "entity_ref", { targetEntityTypes: ["character", "faction"] }],
      ["origin", "来源地点", "entity_ref", { targetEntityTypes: ["location"] }],
      ["date", "成文时间", "text"],
      ["audience", "目标读者", "textarea"],
      ["contents", "内容提要", "textarea", { required: true }],
      ["authenticity", "真伪与版本", "textarea"]
    ]
  },
  {
    slug: "culture",
    name: "文化与族群",
    description: "民族文化、社会群体、价值观与生活方式。",
    entityType: "note",
    fields: [
      ["homeland", "主要地域", "entity_ref", { targetEntityTypes: ["location"] }],
      ["language", "语言", "text"],
      ["values", "核心价值", "textarea", { required: true }],
      ["customs", "风俗", "textarea"],
      ["dress", "服饰与审美", "textarea"],
      ["relations", "与其他文化的关系", "textarea"]
    ]
  },
  {
    slug: "language",
    name: "语言与文字",
    description: "语言、方言、文字系统与命名规则。",
    entityType: "note",
    fields: [
      ["speakers", "使用者", "textarea"],
      ["family", "语系", "text"],
      ["writing", "文字系统", "textarea", { required: true }],
      ["phonology", "语音特征", "textarea"],
      ["grammar", "语法特征", "textarea"],
      ["samples", "示例词句", "textarea"]
    ]
  },
  {
    slug: "material",
    name: "材料与资源",
    description: "矿物、合金、药材、能源与特殊制作材料。",
    entityType: "item",
    fields: [
      ["source", "产地", "entity_ref", { targetEntityTypes: ["location"] }],
      ["properties", "性质", "textarea", { required: true }],
      ["processing", "加工方式", "textarea"],
      ["uses", "用途", "textarea"],
      ["rarity", "稀有度", "select", { options: ["常见", "少见", "稀有", "唯一"] }],
      ["hazards", "危险性", "textarea"]
    ]
  },
  {
    slug: "formation",
    name: "军事编制",
    description: "小队、军团、舰队编队与战术单位。",
    entityType: "faction",
    fields: [
      ["commander", "指挥官", "entity_ref", { targetEntityTypes: ["character"] }],
      ["allegiance", "所属势力", "entity_ref", { targetEntityTypes: ["faction"] }],
      ["base", "驻地", "entity_ref", { targetEntityTypes: ["location"] }],
      ["role", "战术定位", "textarea", { required: true }],
      ["structure", "编制结构", "textarea"],
      ["strength", "规模与战力", "textarea"]
    ]
  },
  {
    slug: "myth",
    name: "神话与传说",
    description: "创世故事、英雄传说、民间故事与文化母题。",
    entityType: "note",
    fields: [
      ["culture", "所属文化", "text"],
      ["characters", "主要角色", "textarea"],
      ["origin", "起源", "textarea"],
      ["narrative", "传说内容", "textarea", { required: true }],
      ["meaning", "文化意义", "textarea"],
      ["variants", "不同版本", "textarea"]
    ]
  },
  {
    slug: "natural-law",
    name: "自然法则",
    description: "魔法规律、宇宙法则、物理规则与世界底层机制。",
    entityType: "note",
    fields: [
      ["scope", "适用范围", "textarea"],
      ["principle", "核心规律", "textarea", { required: true }],
      ["evidence", "表现与证据", "textarea"],
      ["exceptions", "例外", "textarea"],
      ["consequences", "对世界的影响", "textarea"]
    ]
  },
  {
    slug: "profession",
    name: "职业与身份",
    description: "职业、社会角色、阶层身份与专门工作。",
    entityType: "note",
    fields: [
      ["organization", "相关组织", "entity_ref", { targetEntityTypes: ["faction"] }],
      ["duties", "职责", "textarea", { required: true }],
      ["training", "训练与门槛", "textarea"],
      ["tools", "常用工具", "textarea"],
      ["status", "社会地位", "textarea"],
      ["risks", "风险", "textarea"]
    ]
  },
  {
    slug: "rank",
    name: "称号与爵位",
    description: "头衔、官职、军衔、荣誉与继承身份。",
    entityType: "note",
    fields: [
      ["authority", "权力范围", "textarea", { required: true }],
      ["holder", "当前持有者", "entity_ref", { targetEntityTypes: ["character"] }],
      ["organization", "授予组织", "entity_ref", { targetEntityTypes: ["faction"] }],
      ["privileges", "特权与义务", "textarea"],
      ["succession", "授予与继承方式", "textarea"]
    ]
  },
  {
    slug: "spell",
    name: "法术与能力",
    description: "法术、技能、超能力与可复用的特殊效果。",
    entityType: "item",
    fields: [
      ["school", "体系或流派", "text"],
      ["caster", "使用者", "entity_ref", { targetEntityTypes: ["character"] }],
      ["source", "力量来源", "textarea"],
      ["effect", "效果", "textarea", { required: true }],
      ["cost", "消耗与代价", "textarea"],
      ["limitations", "限制与反制", "textarea"]
    ]
  },
  {
    slug: "technology",
    name: "技术与工艺",
    description: "科技、制造工艺、工程系统与生产方法。",
    entityType: "item",
    fields: [
      ["inventor", "发明者", "entity_ref", { targetEntityTypes: ["character", "faction"] }],
      ["origin", "起源地", "entity_ref", { targetEntityTypes: ["location"] }],
      ["principle", "工作原理", "textarea", { required: true }],
      ["components", "核心组件", "textarea"],
      ["use", "用途", "textarea"],
      ["risks", "风险与限制", "textarea"]
    ]
  },
  {
    slug: "tradition",
    name: "仪式与传统",
    description: "节庆、礼仪、习俗、宗教仪式与固定流程。",
    entityType: "note",
    fields: [
      ["culture", "所属文化或组织", "entity_ref", { targetEntityTypes: ["faction"] }],
      ["timing", "举行时间", "text"],
      ["participants", "参与者", "textarea"],
      ["steps", "仪式步骤", "textarea", { required: true }],
      ["meaning", "象征意义", "textarea"],
      ["taboos", "禁忌", "textarea"]
    ]
  },
  {
    slug: "session-report",
    name: "会话与开发记录",
    description: "跑团记录、试玩日志、剧情复盘与开发会议纪要。",
    entityType: "event",
    fields: [
      ["time", "时间", "text", { required: true }],
      ["place", "地点", "entity_ref", { targetEntityTypes: ["location"] }],
      ["participants", "参与者", "textarea"],
      ["summary", "过程摘要", "textarea", { required: true }],
      ["outcomes", "结果与决定", "textarea"],
      ["followUps", "后续事项", "textarea"],
      ["secrets", "主持人或开发者秘密", "textarea", { secret: true }]
    ]
  }
];

export const specializedTemplatePresetCount = specializedTemplatePresets.length;

function createId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}

function uniqueStrings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean)));
}

export function normalizeTemplateField(
  input: Partial<EntityTemplateField>,
  index: number
): EntityTemplateField {
  const type = fieldTypes.includes(input.type as EntityTemplateFieldType)
    ? (input.type as EntityTemplateFieldType)
    : "text";
  const key = String(input.key ?? "").trim().replace(/[^a-zA-Z0-9_.-]+/g, "_");
  return {
    id: String(input.id ?? "").trim() || createId("template-field"),
    key,
    label: String(input.label ?? "").trim(),
    type,
    required: Boolean(input.required),
    secret: Boolean(input.secret),
    defaultValue: String(input.defaultValue ?? ""),
    options: uniqueStrings(input.options),
    targetEntityTypes: uniqueStrings(input.targetEntityTypes).filter(
      (item): item is TemplateEntityType => templateEntityTypes.includes(item as TemplateEntityType)
    ),
    order: Number.isFinite(Number(input.order)) ? Math.max(0, Number(input.order)) : index
  };
}

export function normalizeEntityTemplate(
  input: Partial<EntityTemplateDefinition>,
  worldId: string,
  index: number
): EntityTemplateDefinition {
  const timestamp = input.updatedAt || input.createdAt || new Date().toISOString();
  const entityTypes = uniqueStrings(input.entityTypes).filter(
    (item): item is TemplateEntityType => templateEntityTypes.includes(item as TemplateEntityType)
  );
  return {
    id: String(input.id ?? "").trim() || createId("template"),
    worldId,
    name: String(input.name ?? "").trim() || `未命名模板 ${index + 1}`,
    description: String(input.description ?? ""),
    entityTypes: entityTypes.length ? entityTypes : ["note"],
    fields: (Array.isArray(input.fields) ? input.fields : [])
      .map((field, fieldIndex) => normalizeTemplateField(field, fieldIndex))
      .sort((left, right) => left.order - right.order)
      .map((field, fieldIndex) => ({ ...field, order: fieldIndex })),
    builtIn: Boolean(input.builtIn),
    createdAt: input.createdAt || timestamp,
    updatedAt: timestamp
  };
}

export function createEntityTemplate(
  worldId: string,
  index: number,
  timestamp = new Date().toISOString()
) {
  return normalizeEntityTemplate(
    {
      id: createId("template"),
      name: `自定义模板 ${index + 1}`,
      description: "项目专用设定字段。",
      entityTypes: ["note"],
      fields: [
        {
          id: createId("template-field"),
          key: "overview",
          label: "概览",
          type: "textarea",
          required: false,
          secret: false,
          defaultValue: "",
          options: [],
          targetEntityTypes: [],
          order: 0
        }
      ],
      builtIn: false,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    worldId,
    index
  );
}

export function createDefaultEntityTemplates(
  worldId: string,
  timestamp = new Date().toISOString()
) {
  const baseTemplates = templateEntityTypes.map((entityType, templateIndex) =>
    normalizeEntityTemplate(
      {
        id: `template:${worldId}:${entityType}`,
        name: `${templateEntityTypeLabels[entityType]}默认模板`,
        description: `适用于${templateEntityTypeLabels[entityType]}设定的基础字段。`,
        entityTypes: [entityType],
        builtIn: true,
        fields: defaultFields[entityType].map(([key, label, type, required], index) => ({
          id: `template-field:${worldId}:${entityType}:${key}`,
          key,
          label,
          type,
          required: Boolean(required),
          secret: key === "secrets",
          defaultValue: type === "boolean" ? "false" : "",
          options: key === "status" ? ["待整理", "进行中", "已完成"] : [],
          targetEntityTypes:
            key === "birthplace" || key === "region" || key === "place"
              ? ["location"]
              : key === "faction"
                ? ["faction"]
                : key === "relatedEvents"
                  ? ["event"]
                  : key === "leader" || key === "holder"
                    ? ["character"]
                    : [],
          order: index
        })),
        createdAt: timestamp,
        updatedAt: timestamp
      },
      worldId,
      templateIndex
    )
  );

  const specializedTemplates = specializedTemplatePresets.map((preset, presetIndex) =>
    normalizeEntityTemplate(
      {
        id: `template:${worldId}:preset:${preset.slug}`,
        name: preset.name,
        description: preset.description,
        entityTypes: [preset.entityType],
        builtIn: true,
        fields: preset.fields.map(([key, label, type, options], fieldIndex) => ({
          id: `template-field:${worldId}:preset:${preset.slug}:${key}`,
          key,
          label,
          type,
          required: Boolean(options?.required),
          secret: Boolean(options?.secret),
          defaultValue: options?.defaultValue ?? (type === "boolean" ? "false" : ""),
          options: options?.options ?? [],
          targetEntityTypes: options?.targetEntityTypes ?? [],
          order: fieldIndex
        })),
        createdAt: timestamp,
        updatedAt: timestamp
      },
      worldId,
      baseTemplates.length + presetIndex
    )
  );

  return [...baseTemplates, ...specializedTemplates];
}

export function addMissingDefaultEntityTemplates(
  templates: EntityTemplateDefinition[],
  worldId: string,
  timestamp = new Date().toISOString()
) {
  const existingIds = new Set(templates.map((template) => template.id));
  return [
    ...templates,
    ...createDefaultEntityTemplates(worldId, timestamp).filter(
      (template) => !existingIds.has(template.id)
    )
  ];
}

export function resolveEntityTemplate(
  templates: EntityTemplateDefinition[],
  entity: Pick<TemplateEntity, "type" | "templateId">
) {
  return (
    templates.find((template) => template.id === entity.templateId) ??
    templates.find(
      (template) => template.builtIn && template.entityTypes.includes(entity.type)
    ) ??
    templates.find((template) => template.entityTypes.includes(entity.type)) ??
    null
  );
}

export function getTemplateCompletion(
  template: EntityTemplateDefinition | null,
  templateData: Record<string, string>
): TemplateCompletion {
  const requiredFields = template?.fields.filter((field) => field.required) ?? [];
  const missingKeys = requiredFields
    .filter((field) => !String(templateData[field.key] ?? field.defaultValue).trim())
    .map((field) => field.key);
  const completed = requiredFields.length - missingKeys.length;
  return {
    required: requiredFields.length,
    completed,
    missingKeys,
    percent: requiredFields.length ? Math.round((completed / requiredFields.length) * 100) : 100
  };
}

export function applyTemplateDefaults(
  template: EntityTemplateDefinition | null,
  templateData: Record<string, string>
) {
  const result = { ...templateData };
  for (const field of template?.fields ?? []) {
    if (!(field.key in result) && field.defaultValue) result[field.key] = field.defaultValue;
  }
  return result;
}

export function validateEntityTemplates(
  templates: EntityTemplateDefinition[],
  entities: TemplateEntity[]
) {
  const issues: EntityTemplateIssue[] = [];
  const templateById = new Map(templates.map((template) => [template.id, template]));
  const entityById = new Map(entities.map((entity) => [entity.id, entity]));
  const entityByTitle = new Map(entities.map((entity) => [entity.title.trim().toLocaleLowerCase(), entity]));
  for (const template of templates) {
    if (!template.name.trim()) issues.push({ code: "missing-name", severity: "error", templateId: template.id, title: "模板缺少名称", detail: template.id });
    if (!template.entityTypes.length) issues.push({ code: "missing-type", severity: "error", templateId: template.id, title: `${template.name}没有适用条目类型`, detail: "至少选择一种条目类型" });
    const keys = new Set<string>();
    for (const field of template.fields) {
      if (!field.key) issues.push({ code: "missing-field-key", severity: "error", templateId: template.id, title: `${template.name}包含无键名字段`, detail: field.label || field.id });
      if (!field.label) issues.push({ code: "missing-field-label", severity: "warning", templateId: template.id, title: `${template.name}包含无标题字段`, detail: field.key || field.id });
      if (field.key && keys.has(field.key)) issues.push({ code: "duplicate-field-key", severity: "error", templateId: template.id, title: `${template.name}包含重复字段键`, detail: field.key });
      keys.add(field.key);
      if (field.type === "select" && !field.options.length) issues.push({ code: "invalid-select-options", severity: "warning", templateId: template.id, title: `${template.name}的单选字段没有选项`, detail: field.label });
    }
  }
  for (const entity of entities) {
    const template = entity.templateId ? templateById.get(entity.templateId) : undefined;
    if (entity.templateId && !template) {
      issues.push({ code: "missing-template", severity: "error", entityId: entity.id, title: `${entity.title}关联了失效模板`, detail: entity.templateId });
      continue;
    }
    const resolved = template ?? resolveEntityTemplate(templates, entity);
    if (resolved && !resolved.entityTypes.includes(entity.type)) issues.push({ code: "incompatible-template", severity: "warning", entityId: entity.id, templateId: resolved.id, title: `${entity.title}使用了不兼容模板`, detail: `${templateEntityTypeLabels[entity.type]} · ${resolved.name}` });
    const completion = getTemplateCompletion(resolved, entity.templateData);
    if (completion.missingKeys.length) issues.push({ code: "missing-required-value", severity: "warning", entityId: entity.id, templateId: resolved?.id, title: `${entity.title}缺少必填模板字段`, detail: completion.missingKeys.join("、") });
    if (!resolved) continue;
    for (const field of resolved?.fields ?? []) {
      if (field.type !== "entity_ref") continue;
      const value = String(entity.templateData[field.key] ?? "").trim();
      const titledEntity = entityByTitle.get(value.toLocaleLowerCase());
      if (!value || entityById.has(value) || (titledEntity && (!field.targetEntityTypes.length || field.targetEntityTypes.includes(titledEntity.type)))) continue;
      issues.push({ code: "broken-entity-reference", severity: "error", entityId: entity.id, templateId: resolved.id, title: `${entity.title}包含失效条目引用`, detail: `${field.label}：${value}` });
    }
  }
  return issues;
}
