export type StarterPackId =
  | "game-narrative"
  | "rpg-campaign"
  | "visual-novel"
  | "open-world";

export type StarterEntityBlueprint = {
  key: string;
  type: "character" | "location" | "faction" | "event" | "item" | "note";
  title: string;
  summary: string;
  content: string;
  tags: string[];
  templateData?: Record<string, string>;
};

export type StarterQuestBlueprint = {
  title: string;
  category: "main" | "side" | "character";
  summary: string;
  trigger: string;
  relatedEntityKeys: string[];
  steps: Array<{ title: string; objective: string }>;
};

export type StarterPackDefinition = {
  id: StarterPackId;
  label: string;
  detail: string;
  initialName: string;
  worldDescription: string;
  entities: StarterEntityBlueprint[];
  quest: StarterQuestBlueprint;
  scene: {
    title: string;
    summary: string;
    speakerEntityKey: string;
    openingText: string;
  };
  variable: {
    key: string;
    name: string;
    type: "boolean" | "number" | "text";
    defaultValue: boolean | number | string;
  };
  milestoneTitle: string;
};

export const starterPacks: StarterPackDefinition[] = [
  {
    id: "game-narrative",
    label: "游戏叙事",
    detail: "角色、世界设定、主线任务与可测试剧情",
    initialName: "苍岚纪",
    worldDescription: "围绕北境、王都与黑塔议会展开的奇幻世界设定库。",
    entities: [
      {
        key: "hero",
        type: "character",
        title: "艾琳",
        summary: "边境城的女骑士，正在寻找失踪的哥哥。",
        content: "主角的目标、阻力和关键关系将在这里持续演进。",
        tags: ["主角", "骑士"]
      },
      {
        key: "hub",
        type: "location",
        title: "边境城雾鸦堡",
        summary: "故事开场的军事城市。",
        content: "记录地点历史、危险、居民和可交互区域。",
        tags: ["开场地点"]
      }
    ],
    quest: {
      title: "寻找失踪者",
      category: "main",
      summary: "沿线索调查失踪事件并决定是否公开真相。",
      trigger: "主角收到一封没有署名的旧信。",
      relatedEntityKeys: ["hero", "hub"],
      steps: [
        { title: "确认线索", objective: "在开场地点找到第一条可信证据" },
        { title: "做出选择", objective: "决定公开、隐瞒或继续追查" }
      ]
    },
    scene: {
      title: "序章抉择",
      summary: "主角获得第一条线索并面对初次选择。",
      speakerEntityKey: "hero",
      openingText: "这封信上的印记，我曾经见过。"
    },
    variable: {
      key: "story.prologue_complete",
      name: "序章已完成",
      type: "boolean",
      defaultValue: false
    },
    milestoneTitle: "序章制作里程碑"
  },
  {
    id: "rpg-campaign",
    label: "RPG 战役",
    detail: "冒险小队、据点、委托人与战役任务",
    initialName: "潮汐边境战役",
    worldDescription: "一场从灯塔镇出发、围绕失落航路展开的桌面角色扮演战役。",
    entities: [
      {
        key: "party",
        type: "character",
        title: "冒险者小队",
        summary: "由玩家角色组成的临时调查队。",
        content: "记录小队共同目标、资源、声望和重要决定。",
        tags: ["玩家角色", "队伍"]
      },
      {
        key: "patron",
        type: "character",
        title: "灯塔镇议长",
        summary: "向小队发布首个委托的地方领袖。",
        content: "议长知道部分真相，但担心公开后引发恐慌。",
        tags: ["委托人"]
      },
      {
        key: "hub",
        type: "location",
        title: "灯塔镇",
        summary: "战役据点与补给中心。",
        content: "港口、旅店、旧灯塔和镇议会构成主要交互区域。",
        tags: ["据点", "港口"]
      },
      {
        key: "enemy",
        type: "faction",
        title: "潮汐教团",
        summary: "试图唤醒海底遗迹的秘密组织。",
        content: "记录教团层级、资源、仪式和可谈判成员。",
        tags: ["敌对阵营"]
      }
    ],
    quest: {
      title: "失落灯塔",
      category: "main",
      summary: "调查熄灭的外海灯塔，并决定如何处理教团遗物。",
      trigger: "连续三艘商船在无雾夜失踪。",
      relatedEntityKeys: ["party", "patron", "hub", "enemy"],
      steps: [
        { title: "接受委托", objective: "从议长处取得航海图和补给" },
        { title: "调查灯塔", objective: "找到灯塔熄灭的真实原因" },
        { title: "处置遗物", objective: "封存、摧毁或利用教团遗物" }
      ]
    },
    scene: {
      title: "旅店里的委托",
      summary: "小队与议长第一次交换情报。",
      speakerEntityKey: "patron",
      openingText: "我需要一支不会被镇民认出来的队伍。"
    },
    variable: {
      key: "campaign.contract_accepted",
      name: "已接受灯塔委托",
      type: "boolean",
      defaultValue: false
    },
    milestoneTitle: "第一场战役准备"
  },
  {
    id: "visual-novel",
    label: "视觉小说",
    detail: "角色路线、好感变量、章节场景与选项",
    initialName: "雨季来信",
    worldDescription: "以旧校舍和雨季来信为核心的多路线视觉小说项目。",
    entities: [
      {
        key: "hero",
        type: "character",
        title: "林澈",
        summary: "转学后收到匿名来信的主视角角色。",
        content: "记录主角已知信息、内心目标和各路线共同经历。",
        tags: ["主角"]
      },
      {
        key: "route-a",
        type: "character",
        title: "苏遥",
        summary: "负责保管旧校舍钥匙的学生会成员。",
        content: "记录角色秘密、关系阶段和路线专属事件。",
        tags: ["角色路线"]
      },
      {
        key: "school",
        type: "location",
        title: "临川学园旧校舍",
        summary: "匿名来信指向的封闭建筑。",
        content: "记录教室、天台、档案室和雨天可触发事件。",
        tags: ["核心场景"]
      }
    ],
    quest: {
      title: "第一章：雨中相遇",
      category: "main",
      summary: "主角追查匿名来信，并建立第一条角色路线分歧。",
      trigger: "放学后的储物柜里出现第二封信。",
      relatedEntityKeys: ["hero", "route-a", "school"],
      steps: [
        { title: "前往旧校舍", objective: "选择独自前往或邀请苏遥同行" },
        { title: "回应质问", objective: "坦白来信、转移话题或保持沉默" }
      ]
    },
    scene: {
      title: "旧校舍门前",
      summary: "雨中对话建立第一条好感分歧。",
      speakerEntityKey: "route-a",
      openingText: "你也收到那封信了吗？"
    },
    variable: {
      key: "route.suyao_affection",
      name: "苏遥好感",
      type: "number",
      defaultValue: 0
    },
    milestoneTitle: "第一章可玩版本"
  },
  {
    id: "open-world",
    label: "开放世界任务",
    detail: "区域据点、阵营声望、探索线索与任务链",
    initialName: "灰脊高地",
    worldDescription: "围绕多个据点、阵营和可自由排序任务展开的开放世界区域。",
    entities: [
      {
        key: "guide",
        type: "character",
        title: "巡林人岚",
        summary: "引导玩家进入灰脊高地的区域联系人。",
        content: "记录区域情报、动态状态和对玩家声望的反应。",
        tags: ["区域联系人"]
      },
      {
        key: "region",
        type: "location",
        title: "灰脊高地",
        summary: "拥有废弃矿道、风暴谷和三处聚落的开放区域。",
        content: "按子区域记录探索点、资源、危险等级和环境叙事。",
        tags: ["开放区域"]
      },
      {
        key: "faction",
        type: "faction",
        title: "高地拓荒者协会",
        summary: "控制补给路线并发布区域委托的松散组织。",
        content: "记录声望阶段、奖励、竞争者和区域影响。",
        tags: ["声望阵营"]
      },
      {
        key: "relic",
        type: "item",
        title: "风暴测绘仪",
        summary: "能够标记异常天气源的旧时代设备。",
        content: "记录获取方式、修复步骤和不同阵营的用途。",
        tags: ["任务物品"]
      }
    ],
    quest: {
      title: "高地异常调查",
      category: "main",
      summary: "自由调查三处风暴源，并决定测绘数据交给哪个阵营。",
      trigger: "区域地图上同时出现三处无法解释的风暴标记。",
      relatedEntityKeys: ["guide", "region", "faction", "relic"],
      steps: [
        { title: "修复测绘仪", objective: "从任意据点收集三个替代零件" },
        { title: "调查风暴源", objective: "以任意顺序完成三个区域调查" },
        { title: "提交数据", objective: "选择阵营、公开数据或自行保留" }
      ]
    },
    scene: {
      title: "高地入口",
      summary: "联系人说明区域威胁与可自由选择的调查方向。",
      speakerEntityKey: "guide",
      openingText: "地图只能告诉你风暴在哪，不能告诉你该相信谁。"
    },
    variable: {
      key: "region.pioneer_reputation",
      name: "拓荒者协会声望",
      type: "number",
      defaultValue: 0
    },
    milestoneTitle: "灰脊高地区域切片"
  }
];

export function getStarterPack(id: StarterPackId) {
  return starterPacks.find((pack) => pack.id === id) ?? starterPacks[0];
}
