const {
  WORLD_ID,
  categoryId
} = require("./chinese-mythology-history-data.cjs");

const BATCH_KEY = "folk-belief-syncretism-11";
const BATCH_LABEL = "阶段 4 · 地方神职、行业信仰与三教合流第二批";

function folkEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:folk-syncretism:${key}`;
}

function folkSourceId(key, worldId = WORLD_ID) {
  return folkEntityId(`source-${key}`, worldId);
}

function trackId(key, worldId = WORLD_ID) {
  return `timeline-track:${worldId}:mythology:${key}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderArticle(row) {
  const sourceItems = row.sourceList.map((source) => `<li>${escapeHtml(source)}</li>`).join("");
  return [
    `<p>${escapeHtml(row.lead)}</p>`,
    `<h2>${escapeHtml(row.originHeading || "最早可见的线索")}</h2><p>${escapeHtml(row.origin)}</p>`,
    `<h2>${escapeHtml(row.developmentHeading || "神职如何形成")}</h2><p>${escapeHtml(row.development)}</p>`,
    `<h2>${escapeHtml(row.distinctionHeading || "需要分开的身份")}</h2><p>${escapeHtml(row.distinction)}</p>`,
    "<h2>资料边界</h2>",
    `<p>${escapeHtml(row.evidence)}</p><ul>${sourceItems}</ul>`,
    "<h2>创作使用</h2>",
    `<p>${escapeHtml(row.use)}</p>`
  ].join("");
}

function link(targetRef, label, sourceCitation, historicalScope, options = {}) {
  return {
    targetRef,
    label,
    sourceCitation,
    historicalScope,
    kind: options.kind || "custom",
    direction: options.direction || "directed",
    strength: options.strength || 4,
    evidenceType: options.evidenceType || "historical-record",
    confidence: options.confidence || "certain",
    notes: options.notes || "此关系只在所列年代与材料层内成立，不据后世合祀反推早期身份。"
  };
}

function deity(row) {
  return {
    type: "character",
    templateKey: "deity-person",
    category: "local-deities",
    tradition: "民间信仰与地方祀典",
    identityType: "神格、历史人物与后世接受分层",
    confidence: "主流说法",
    ...row
  };
}

function institution(row) {
  return {
    type: "note",
    templateKey: "institution-ritual",
    category: "shared-ritual",
    tradition: "地方礼俗与三教合流",
    identityType: "信仰制度与仪式网络",
    confidence: "主流说法",
    ...row
  };
}

function place(row) {
  return {
    type: "location",
    templateKey: "sacred-geography",
    category: "mythic-geography",
    tradition: "历史地点与信仰地理",
    identityType: "庙宇、山岳与水路节点",
    confidence: "主流说法",
    ...row
  };
}

function source(row) {
  return {
    type: "note",
    templateKey: "source-text",
    category: "primary-sources",
    tradition: "原典与史料",
    identityType: "文献入口",
    confidence: "已核原文",
    ...row
  };
}

const figureRows = [
  deity({
    key: "mazu",
    title: "妈祖（天妃、天后）",
    aliases: "妈祖、林默、灵惠夫人、天妃、天后圣母",
    category: "water-sea-deities",
    historicalLayer: "宋代莆田地方祠祀至元明清海运与国家封号",
    summary: "发端于福建莆田沿海的女神信仰，随航海、漕运、移民与王朝封号扩展为跨海域的天妃天后祭祀。",
    earliestSource: "南宋廖鹏飞《圣墩祖庙重建顺济庙记》及宋代封号记录",
    sourceLocation: "宋代庙记、元代海运祭祀与明清礼志",
    domains: "航海、救难、漕运、移民共同体与沿海庙祀",
    iconography: "常作冠服女神，千里眼、顺风耳侍立属于后世庙宇与戏曲常见配置。",
    lead: "妈祖的故事从海边庙宇出发，却不是一开始就拥有“天后”名号。莆田人先在风浪、渔汛和船期里记住一位林氏女神，朝廷随后用封号把地方灵验纳入海运秩序，移民又把香火带过更远的水面。",
    origin: "早期可考材料把信仰放在莆田、湄洲与圣墩一带。林氏女的生平细节在后世庙记、方志和宝卷中逐渐增多，出生年份、家世与神异不能全当作同一时代的现场记录。",
    development: "南宋封为夫人，元代因护海运而加天妃号，明清又与使航、漕粮和沿海防务相连。庙宇网络的扩大既靠官方致祭，也靠船户、商帮与移民自行建庙。",
    distinction: "林氏历史记忆、宋代灵惠夫人、元代天妃、清代天后与各地妈祖娘娘是相续的接受层，不是五个互不相干的人物，也不能用最晚封号改写最早庙记。",
    evidence: "以宋代庙记确定早期地方坐标，以《元史》观察海运国家祭祀，再用明清礼志核对封号。显灵场景按记载年代归档，不以现代传说补全古文沉默处。",
    sourceList: ["廖鹏飞《圣墩祖庙重建顺济庙记》", "《元史·祭祀志》南海女神条", "明清礼志与沿海方志天妃庙条"],
    use: "适合写船队、移民与港口共同体如何在同一香火下互认。若补写林氏女的对白、航程或家庭生活，应明确标为项目原创改编。",
    sourceRef: "s:yuanshi-jisi",
    sourceCitation: "《元史·祭祀志》南海女神灵惠夫人条",
    sourceEvidenceType: "ritual-record",
    institutionKey: "water-navigation",
    links: [
      link("p:meizhou", "祖庙与信仰发端地", "宋代圣墩庙记及湄洲地方祠记", "南宋以后莆田沿海祠祀层", { kind: "located", notes: "湄洲祖庙传统与圣墩早期庙记应并读，不把一处材料吞并另一处。" }),
      link("p:south-sea-temple", "同属海上保护而祭祀谱系不同", "《元史·祭祀志》与南海神庙碑记对读", "元明海运与海神祭祀比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "妈祖与南海神可同受航海者祈请，但不是同神异名。" }),
      link("f:hongsheng", "沿海庙宇并存的海神", "沿海方志与庙宇碑记", "明清华南港口信仰层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable", notes: "同港并祀只说明功能相邻，不构成亲属或上下级。" })
    ]
  }),
  deity({
    key: "bixia-yuanjun",
    title: "碧霞元君",
    aliases: "天仙玉女碧霞元君、泰山娘娘、碧霞娘娘",
    category: "local-deities",
    historicalLayer: "宋以后泰山玉女祠至明清华北娘娘信仰",
    summary: "依托泰山顶昭真祠成长的女神，明清香火尤盛，兼具护生、赐子、行旅与山岳朝拜职能。",
    earliestSource: "宋代泰山玉女池、昭真祠材料及明《岱史》",
    sourceLocation: "《岱史》昭真祠、宫廷遣祭与历代登岱记",
    domains: "泰山朝拜、生育祈愿、护生与华北娘娘庙网络",
    iconography: "常作冠服女神居中，眼光、送子等娘娘配位随地区与时代不同。",
    lead: "登泰山的人先看见山路、石阶和香烟，之后才会遇到关于元君来历的多种回答。有人称她泰山神女，有人追溯玉女池，也有人把她写成黄帝遣女；这些说法共同服务一座香火极盛的山，却并不出自同一部早期经典。",
    origin: "宋代泰山顶已有玉女石像、玉女池与昭真祠相关记载。碧霞元君名号及完整身世在明代材料中更清楚，早于此的“玉女”不能不经说明就全部改名。",
    development: "明清朝山者把求子、治病、还愿和登岱结合，宫廷也曾遣官致祭。山顶祠与各地娘娘庙形成远近香火关系，使元君超出单一山神侍从的范围。",
    distinction: "碧霞元君不等同后土、泰山府君之女、送子观音或所有娘娘神。不同来历说可以并列，不能为追求完整家谱而挑一说写成唯一史实。",
    evidence: "《岱史》能证明明代祠祀与宫廷祈嗣，却不是宋初建祠的原始档案。登山记只证明作者所见，神女身世仍按各书出现年代分别标记。",
    sourceList: ["《岱史》碧霞元君祠及遣祭文", "宋代泰山玉女池与昭真祠记录", "姚鼐《登泰山记》所见祠宇"],
    use: "可以围绕朝山路、香社与女性祈愿写故事。任何确定的神女童年、父母或与东岳大帝的家庭对白，若无所据，应标为项目原创改编。",
    sourceRef: "s:mingqing-lizhi",
    sourceCitation: "《岱史》昭真祠与嘉靖遣祭材料；《明史·礼志》神祠制度对照",
    sourceEvidenceType: "ritual-record",
    institutionKey: "women-life-cycle",
    links: [
      link("p:taishan-bixia", "核心朝拜祠宇", "《岱史》昭真祠条", "明清泰山朝拜层", { kind: "located" }),
      link("x:dongyue-emperor", "同山并祀而神职有别", "泰山历代祠庙与礼志", "宋明清泰山信仰层", { direction: "undirected", evidenceType: "ritual-record", notes: "东岳大帝的国家岳祭、冥府职能与碧霞元君的娘娘信仰分别建页。" }),
      link("x:guanyin-lineage", "求子职能在地方礼俗中相邻", "明清娘娘庙、观音堂与香会材料", "明清生育信仰比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "求子愿望相同不等于碧霞元君是观音化身。" })
    ]
  }),
  deity({
    key: "wenchang-dijun",
    title: "文昌帝君（梓潼神）",
    aliases: "梓潼帝君、张亚子、文昌司禄宏仁帝君",
    category: "profession-deities",
    historicalLayer: "蜀地梓潼神、道教化书与宋元科举神职合流",
    summary: "由蜀地七曲山梓潼神与文昌星官、禄籍观念逐步合流的科名神，元明以后遍入书院与士人生活。",
    earliestSource: "唐人梓神君材料、宋代封号与元《梓潼帝君化书》",
    sourceLocation: "《梓潼帝君化书》《明史·礼志》梓潼帝君条",
    domains: "科举、文章、禄籍、善恶劝诫与士人祈愿",
    iconography: "常作冠服帝君执如意或文卷，魁星与文昌六星不宜直接画成其随从。",
    lead: "文昌帝君不是一颗星突然走进学校。七曲山先有梓潼神，士人又仰望文昌星官，道教化书把多世化身、禄籍和劝善编在一起，几条来路到宋元才逐渐汇成科名神。",
    origin: "唐宋材料已见梓潼张神及封号，元代《化书》展开九十七化叙事。文昌六星属于星官系统，二者的结合有明确的后起过程。",
    development: "科举社会让梓潼神从蜀地庙祀进入学校、书院和城市文昌宫。官方有时赐号、遣祭，有时又批评把地方神与文昌星牵合，制度态度并不始终一致。",
    distinction: "张亚子、梓潼地方神、文昌六星、文昌帝君和魁星需要分层。帝君的多世化身属于《化书》宗教自传，不能拆成可核实的历代官员简历。",
    evidence: "用唐宋诗文与封号确认梓潼神，再以《化书》观察道教化身叙事，以《明史·礼志》记录礼官反对意见。批评材料同样是信仰史证据。",
    sourceList: ["《梓潼帝君化书》", "《明史·礼志》梓潼帝君条", "唐宋梓神君诗文与七曲山庙记"],
    use: "可以写考生、书院与地方庙宇之间的真实压力。若为帝君补造某一世完整人生或考试判卷场景，须标为项目原创改编。",
    sourceRef: "s:zitong-huashu",
    sourceCitation: "《梓潼帝君化书》；《明史·礼志》梓潼帝君条",
    sourceEvidenceType: "textual-variant",
    institutionKey: "three-teachings",
    links: [
      link("p:qiqushan", "梓潼祖庙与地方根基", "七曲山庙记及历代封号材料", "唐宋以后蜀地庙祀层", { kind: "located" }),
      link("f:kuixing", "同受科名祈愿而星象与神格不同", "文昌宫、魁星阁题记与明清士人笔记", "明清科举信仰层", { direction: "undirected", evidenceType: "material-evidence", notes: "同处学校建筑群不表示魁星隶属文昌帝君。" }),
      link("x:confucius", "书院中可并祀而礼制身份不同", "明清学校祀典与文昌祠记", "明清学校祭祀层", { direction: "undirected", evidenceType: "ritual-record", notes: "孔子属文庙国家礼制中心，文昌属科名神祠，不合成一位。" })
    ]
  }),
  deity({
    key: "kuixing",
    title: "魁星",
    aliases: "魁星点斗、魁斗星君、大魁夫子",
    category: "profession-deities",
    historicalLayer: "星名语义、字形图像与明清科举祈愿",
    summary: "由北斗魁部、科举“夺魁”语言和踢斗点斗图像结合而成的文运神，常见于魁星阁与学校附祠。",
    earliestSource: "星官与魁名古义，明清魁星图像、祠阁题记",
    sourceLocation: "明清地方志魁星阁条、文昌宫图像与士人笔记",
    domains: "夺魁、文章、科举名次与学校空间",
    iconography: "常作一足后踢北斗、手执朱笔点名的鬼形，图像借“魁”字结构造意。",
    lead: "魁星最醒目的地方不是一段生平，而是一副姿势：一脚向后勾斗，一手提笔点名。画师把“魁”字、北斗魁部和考场夺魁压进同一身体，才有了后来魁星阁里那尊难以认错的神像。",
    origin: "早期星官资料提供“魁”的天文语汇，却没有完整的踢斗神像。明清地方志、祠阁和画谱更能证明人格化魁星如何进入科举文化。",
    development: "魁星阁常与文庙、书院或文昌宫相邻，士子以朱笔点名理解功名。图像流行靠建筑、版画和节令祭祀，不需要假定一位历史人物死后受封。",
    distinction: "魁星不是文昌帝君的别名，也不等于奎宿、北斗第一星或传说中的丑陋状元。星区、字形神像和科举神职应按材料分别说明。",
    evidence: "本页以可见图像、匾额和地方志为主，不把近代故事倒填为古代星官神话。有关“魁”字拆形的解释只用于说明造像逻辑。",
    sourceList: ["明清地方志魁星阁条", "文昌宫、书院魁星造像题记", "历代星官书中北斗魁部资料"],
    use: "适合写考前夜、题名榜与士人自我安慰。若创造魁星生前应试、落榜或被天帝任命的连续故事，须标为项目原创改编。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "明清魁星阁题记与《三教源流搜神大全》同类科名神材料对读",
    sourceEvidenceType: "material-evidence",
    institutionKey: "three-teachings",
    links: [
      link("f:wenchang-dijun", "科举空间中的并祀神", "明清文昌宫与魁星阁记录", "明清学校与书院信仰层", { direction: "undirected", evidenceType: "material-evidence" }),
      link("x:beidou-system", "借用北斗魁部语汇", "星官书与魁星图像对读", "古代星官至明清图像转化层", { evidenceType: "scholarly-inference", confidence: "probable", notes: "语源关联不等于魁星在早期北斗经中已有同一神像。" }),
      link("i:craft-guild", "书写行业与士人群体的文运象征", "明清书坊、书院与地方祠阁材料", "明清职业与教育信仰层", { evidenceType: "historical-record", confidence: "probable" })
    ]
  }),
  deity({
    key: "zhongkui",
    title: "钟馗",
    aliases: "锺馗、锺葵、赐福镇宅圣君",
    category: "local-deities",
    historicalLayer: "唐代画记传说、宋代岁除赐像与后世镇宅图像",
    summary: "以唐玄宗梦鬼和吴道子画记著称的驱鬼人物，宋代已有岁暮颁像传统，后来又兼具镇宅与赐福形象。",
    earliestSource: "《补笔谈》保存的唐人题吴道子画钟馗记",
    sourceLocation: "《补笔谈》钟馗画记及宋代赐像记录",
    domains: "驱鬼、岁除、镇宅、端午悬像与赐福图",
    iconography: "常作虬髯官服、持剑或捉鬼；蝙蝠、童子和嫁妹情节多属后世画题与戏曲。",
    lead: "钟馗先以一幅画进入可考材料。题记说唐玄宗病中梦见大鬼吞小鬼，吴道子奉诏摹成；到了宋代，朝廷在岁除印赐钟馗像，梦里的驱鬼者便有了可以贴挂、传抄和再画的身体。",
    origin: "《补笔谈》见到宫中旧画及题记，并谨慎指出钟馗一名早已有之，开元故事更可能解释画像流行而非姓名起源。",
    development: "宋以后钟馗进入年画、端午画、戏曲和小说，驱鬼之外又出现赐福、嫁妹等主题。不同节日、地区与画派可以并存，不必追成一条单线神职。",
    distinction: "钟馗不是门神秦琼，也不是道教所有斩鬼将军的统称。唐玄宗梦、吴道子画、宋代赐像和后世戏曲分别属于传说、图像传播与文学再造。",
    evidence: "以《补笔谈》保存的画记为核心，同时保留沈括对名字来源的质疑。后世嫁妹故事只按出现作品注明，不写进唐代梦境。",
    sourceList: ["《补笔谈》唐人题吴道子画钟馗记", "宋代岁除赐钟馗像记录", "明清钟馗画题与戏曲文本"],
    use: "可以把一幅被反复临摹的旧画作为叙事中心。若补写钟馗应试、妹妹婚事或完整地府履历，须注明所据戏曲，或标为项目原创改编。",
    sourceRef: "s:bu-bitan",
    sourceCitation: "《补笔谈》钟馗画记",
    sourceEvidenceType: "historical-record",
    institutionKey: "gate-new-year",
    links: [
      link("i:gate-new-year", "岁除悬像与镇宅", "《补笔谈》宋代赐像记载及年画题记", "北宋以后岁时图像层", { evidenceType: "material-evidence" }),
      link("f:shentu", "同司驱鬼而门神谱系不同", "《风俗通义》与《补笔谈》对读", "汉代门神叙事与唐宋钟馗图像比较层", { direction: "undirected", evidenceType: "scholarly-inference", notes: "共同驱鬼职能不能证明钟馗取代神荼的全国统一日期。" }),
      link("f:wang-lingguan", "驱邪神将形象比较", "明清庙宇图像与道教科仪材料", "明清驱邪神将比较层", { direction: "undirected", evidenceType: "material-evidence", confidence: "probable", notes: "钟馗多见民俗画，王灵官属道观护法系统，身份不合并。" })
    ]
  }),
  deity({
    key: "shentu",
    title: "神荼",
    aliases: "荼、神荼门神",
    category: "local-deities",
    historicalLayer: "汉代驱鬼叙事与六朝岁旦门神",
    summary: "度朔山桃树下检阅百鬼的古门神之一，常与郁垒执苇索、御恶鬼，并进入桃人和门画传统。",
    earliestSource: "《风俗通义》所引古说及汉代相关文赋",
    sourceLocation: "《风俗通义》祀典、桃梗门神材料；《荆楚岁时记》岁旦条",
    domains: "门户、驱鬼、桃符、岁旦与傩礼想象",
    iconography: "早期重点是桃树、苇索与虎，后世门画才逐步固定武将式面貌。",
    lead: "神荼守的不是一扇普通城门，而是度朔山大桃树下百鬼出入之处。古说让他与郁垒检点恶鬼、用苇索捆缚，再交给虎；家门上的桃木和画像因此借来一套神话尺度。",
    origin: "汉代文献和《风俗通义》保存神荼郁垒故事，六朝岁时记已见元日画二神于门户。名字写法与读音存在异文，不宜按现代常用字反推唯一古音。",
    development: "从桃人、桃梗到纸画门神，材料与图像不断改变。唐宋以后又出现武将门神，神荼没有在某一年突然消失，而是与新组合并存。",
    distinction: "神荼不等于秦琼，也不应与郁垒合成一个名字。度朔山属于驱鬼神话空间，不能拿现代地图定位为历史庙址。",
    evidence: "本页以汉代引文和《荆楚岁时记》为早期证据，后世年画仅说明图像接受。关于兄弟排行、盔甲颜色和私人战史均无早期资料支持。",
    sourceList: ["《风俗通义》神荼郁垒材料", "《荆楚岁时记》元日画门神条", "汉魏文赋中的桃梗、苇索与驱鬼语汇"],
    use: "适合写门内门外、名单与越界的故事。若设计度朔山守门班次、百鬼册籍或两神生前经历，须标为项目原创改编。",
    sourceRef: "s:fengsu-tongyi",
    sourceCitation: "《风俗通义》神荼郁垒条；《荆楚岁时记》元日门神条",
    sourceEvidenceType: "primary-text",
    institutionKey: "gate-new-year",
    links: [
      link("f:yulei", "共同检阅百鬼", "《风俗通义》神荼郁垒条", "汉代驱鬼叙事层", { direction: "undirected", evidenceType: "primary-text" }),
      link("f:qin-yuchi-door-gods", "后世门户图像并行与替换", "《荆楚岁时记》及明清门神图像对读", "六朝至明清门神图像演变层", { direction: "undirected", evidenceType: "material-evidence", confidence: "probable" }),
      link("x:city-god-system", "门户驱邪与城市境域保护相邻", "门神、城隍庙与地方岁时材料", "宋明以后城市礼俗比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "门神守户与城隍守城属于不同尺度，非上下级定制。" })
    ]
  }),
  deity({
    key: "yulei",
    title: "郁垒",
    aliases: "郁律、垒、郁垒门神",
    category: "local-deities",
    historicalLayer: "汉代异名、六朝门画与后世门神接受",
    summary: "与神荼同守度朔山桃树的古门神，执苇索制恶鬼；其名称在古书中有郁垒、郁律等写法。",
    earliestSource: "《风俗通义》所引古说及汉代门禁语汇",
    sourceLocation: "《风俗通义》《荆楚岁时记》门神条",
    domains: "门户、缚鬼、桃符、岁旦与家宅边界",
    iconography: "常与神荼成对，后世武将化面貌不代表汉代已有同一套盔甲。",
    lead: "郁垒的名字比画像更难固定。古书里可见郁垒、郁律等写法，读音争议延续很久；真正稳定的是他与神荼同守桃树、执索缚鬼的动作。",
    origin: "汉代材料把两位门神放在度朔山神话中，《荆楚岁时记》说明六朝家庭已在元日画神于门。名字异文属于传本和古音问题，不能用一个现代读法抹平。",
    development: "桃木辟邪、纸画门神与武将门神后来交叠，郁垒有时被画成披甲将军。图像借用时代服装，并不说明早期文献漏写了一套军职。",
    distinction: "郁垒与神荼是成对人物，不是同神两名；也不能因后世门画位置相似就认作尉迟敬德。不同门神组合应允许同宅、同节并存。",
    evidence: "早期身份只取《风俗通义》和岁时记录可证部分。年画位置、肤色、兵器及左右次序若因地区不同，应保存版本差异。",
    sourceList: ["《风俗通义》神荼郁垒材料", "《荆楚岁时记》岁旦门神条", "历代桃符与门画实物题记"],
    use: "可以借名字异文写抄书人、画师与家庭习俗的变化。若补造郁垒军旅履历或与秦琼交班的场面，须标为项目原创改编。",
    sourceRef: "s:fengsu-tongyi",
    sourceCitation: "《风俗通义》神荼郁垒条；《荆楚岁时记》岁旦门神条",
    sourceEvidenceType: "textual-variant",
    institutionKey: "gate-new-year",
    links: [
      link("f:shentu", "桃树下共同守门", "《风俗通义》神荼郁垒条", "汉代驱鬼叙事层", { direction: "undirected", evidenceType: "primary-text" }),
      link("f:qin-yuchi-door-gods", "武将门神兴起后的并存组合", "明清岁时记录与门画题记", "明清家宅门神层", { direction: "undirected", evidenceType: "material-evidence", confidence: "probable" }),
      link("x:land-deity-system", "家宅边界与乡里境域保护相邻", "地方门神、土地庙与家礼材料", "明清生活信仰比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "郁垒不属于土地神僚属，关系只表示保护尺度相邻。" })
    ]
  }),
  deity({
    key: "qin-yuchi-door-gods",
    title: "秦琼、尉迟敬德（门神形态）",
    aliases: "秦叔宝、尉迟恭、胡敬德、武将门神",
    category: "local-deities",
    historicalLayer: "唐代历史将领、宋元以后宫门故事与明清年画",
    summary: "由唐初名将形象发展出的武将门神组合，明清年画中极常见，但其守宫门故事晚于两人本传。",
    earliestSource: "唐代正史人物传与后世宫门守夜传说、门画实物",
    sourceLocation: "《旧唐书》人物传；《三教源流搜神大全》门神二将军；明清年画",
    domains: "镇宅、守门、武德象征与岁除门画",
    iconography: "常作披甲执兵器的对称武将，左右位置、肤色、旗号和兵器随画坊而变。",
    lead: "秦琼与尉迟敬德在正史里是唐初将领，在门画里却日复一日守着百姓家门。把两层连接起来的是后出的宫门故事：皇帝夜受鬼扰，两将披甲守门，画像随后代替真人。",
    origin: "正史只证明两人的军功与仕历，不记他们受命成为天下门神。门神故事见于后世神谱和小说，年画实物则证明这一组合在明清已经广泛流通。",
    development: "印刷年画让武将门神适合成对出售，也可与神荼郁垒、钟馗或地方英雄轮换。家庭选择取决于地区、门位和画坊，不存在全国唯一标准。",
    distinction: "历史秦琼、历史尉迟敬德与门神组合分别记录。两人也不是神荼郁垒转世，门画上的左右位置不能当作唐代官阶。",
    evidence: "人物生平依唐史，神格依后出神谱、岁时笔记和年画。凡把唐太宗梦境、守门夜数与画像颁行写得极具体者，须注明版本。",
    sourceList: ["《旧唐书》秦叔宝、尉迟敬德传", "《三教源流搜神大全》门神二将军", "明清武将门神年画与题记"],
    use: "适合写真人功业如何被一张成对年画重新解释。若补写两将守宫门的对白、鬼怪形态或第一次贴画日期，应注明后世版本或标原创。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "《三教源流搜神大全》门神二将军；《旧唐书》人物传对照",
    sourceEvidenceType: "textual-variant",
    institutionKey: "gate-new-year",
    links: [
      link("f:shentu", "古门神与武将门神并存", "《荆楚岁时记》及明清年画对读", "六朝至明清门神变迁层", { direction: "undirected", evidenceType: "material-evidence", confidence: "probable" }),
      link("f:zhongkui", "岁除镇宅图像并列", "宋明岁除图像与年画题记", "宋明清驱邪图像层", { direction: "undirected", evidenceType: "material-evidence" }),
      link("f:guan-di", "武将神格与忠勇象征比较", "明清关帝庙与门神年画材料", "明清武将信仰比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "秦尉门神组合与关帝祭祀没有固定亲属或统属关系。" })
    ]
  }),
  deity({
    key: "yuelao",
    title: "月下老人",
    aliases: "月老、月下老、定婚店老人",
    category: "local-deities",
    historicalLayer: "唐传奇定婚叙事至明清婚姻神信仰",
    summary: "源自唐人《定婚店》的月下老人，以婚书与赤绳预定婚姻，后来从传奇人物发展为婚姻祈愿神。",
    earliestSource: "李复言《续玄怪录·定婚店》",
    sourceLocation: "《续玄怪录》定婚店篇及后世月老祠记",
    domains: "婚姻、姻缘、赤绳、定婚与庙宇祈愿",
    iconography: "常作白须老人持婚书、红绳或拐杖；红线细节由赤绳叙事与后世图像共同强化。",
    lead: "韦固在月色未退的清晨遇见一位老人。老人倚着布囊查阅陌生文字，说囊中赤绳用来系定夫妻；这场唐传奇里的相遇，后来被无数庙宇缩成一尊手持婚书的月老。",
    origin: "《定婚店》讲的是命定婚姻与人的抗拒：韦固企图杀死预定妻子，最终仍与她相逢。篇中老人未展开天界官衔，后世“月老府”式组织属于再造。",
    development: "月下老人从传奇人物进入戏曲、说唱和婚姻祠祀，赤绳成为视觉核心。现代许愿方式继续变化，但不能反写为唐代已有成套签牌。",
    distinction: "月老不是和合二仙，也不是所有婚姻媒神的统一上司。唐传奇里的老人、后世庙神与现代婚恋符号应按传播场景分别说明。",
    evidence: "核心叙事以《定婚店》为准，保留篇中强迫命定与暴力企图等不舒适部分，不用现代温柔媒人形象改写全文。",
    sourceList: ["《续玄怪录·定婚店》", "宋元以后定婚店与月老故事转述", "明清月老祠、婚书与赤绳图像"],
    use: "可用于讨论命定、选择与婚姻制度的冲突。若设计月老配对规则、天界档案机关或替角色改命，须标为项目原创改编。",
    sourceRef: "s:xuxuanguailu",
    sourceCitation: "《续玄怪录·定婚店》",
    sourceEvidenceType: "primary-text",
    institutionKey: "women-life-cycle",
    links: [
      link("i:women-life-cycle", "婚姻祈愿与家庭礼俗", "《定婚店》及明清婚姻祠记", "唐传奇至明清婚姻信仰层", { evidenceType: "historical-record" }),
      link("f:zigu", "同入家庭生活而职能不同", "岁时笔记与地方祠俗对读", "明清家庭信仰比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "婚姻与妇女生活相邻，不表示紫姑主管姻缘。" }),
      link("x:guanyin-lineage", "婚育祈愿场景可相接", "明清婚姻、生育庙祀材料", "明清人生礼俗层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "月老定婚与送子观音救愿属于不同神职。" })
    ]
  }),
  deity({
    key: "zigu",
    title: "紫姑",
    aliases: "紫姑神、紫仙、厕姑、何媚",
    category: "local-deities",
    historicalLayer: "六朝岁时传说至明清扶紫姑与占问习俗",
    summary: "与正月迎厕神、妇女占问和扶乩游戏相连的女神，身世版本多样，不能只用一则后出故事定名。",
    earliestSource: "六朝以来紫姑、厕神传说与岁时材料",
    sourceLocation: "《搜神秘览》紫姑神条；《三教源流搜神大全》紫姑神",
    domains: "正月十五、厕神、占问、妇女生活与扶乩",
    iconography: "可用草木、箕帚或简易人形迎请，固定宫装像多为庙宇后设。",
    lead: "紫姑往往不是从正殿里被请出来，而是在正月夜里由家中妇女用草木、箕帚或简易人形迎入。她能否降临、怎样摆动、回答什么，构成一种介于祭祀、游戏和占问之间的家庭时刻。",
    origin: "早期材料对紫姑身世并不一致，后世常讲何姓女子受妒死于厕间。故事解释了神与边缘空间的关系，却不等于每地迎紫姑都知道同一姓名。",
    development: "迎紫姑与扶箕、问蚕桑、问年成等做法互相吸收。士人笔记既记录也嘲讽这种习俗，批评声音不能作为习俗不存在的证明。",
    distinction: "紫姑不是单纯“厕所卫生神”，也不与坑三姑娘、织女或送子娘娘自动合并。家庭仪式、庙中神像与文人笔记里的灵异叙事分别存档。",
    evidence: "本页保留多个名字与死因版本，只把明确见于文献的迎请时间、空间和占问方式写作可考习俗。降神答语不作为历史事实。",
    sourceList: ["《搜神秘览》紫姑神条", "《三教源流搜神大全》紫姑神", "宋明岁时与扶紫姑笔记"],
    use: "适合写女性在家宅边缘空间分享消息、焦虑与愿望。若让紫姑准确预言重大历史或建立完整阴司官职，应标为项目原创改编。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "《三教源流搜神大全》紫姑神；《搜神秘览》相关条",
    sourceEvidenceType: "textual-variant",
    institutionKey: "women-life-cycle",
    links: [
      link("f:yuelao", "家庭人生礼俗中的相邻神职", "岁时与婚姻祠俗材料对读", "明清家庭信仰比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable" }),
      link("f:cannu", "妇女劳动与家庭占问相接", "蚕桑岁时记录与紫姑占问材料", "宋明妇女生活信仰层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable", notes: "两神可同属妇女生活，却无固定亲属关系。" }),
      link("x:siming-zaojun", "同居家宅祭祀而空间职能不同", "家礼、岁时与神谱材料", "明清家宅神祀层", { direction: "undirected", evidenceType: "ritual-record", notes: "灶君上天奏事与迎紫姑占问是两套仪式。" })
    ]
  }),
  deity({
    key: "cannu",
    title: "蚕女（马头娘）",
    aliases: "蚕女、马头娘、马明王、蚕神女",
    category: "profession-deities",
    historicalLayer: "六朝蚕马变形叙事与后世蚕桑祭祀",
    summary: "《搜神记》中被马皮卷走并化蚕的女子，后世与马头娘、蚕桑祈愿相连，但不等同国家先蚕礼中的全部神位。",
    earliestSource: "《搜神记》卷十四蚕马故事",
    sourceLocation: "《搜神记》卷十四；后世蚕书与马头娘祠俗",
    domains: "养蚕、桑树、婚誓、变形与女工信仰",
    iconography: "常作披马皮女子或骑马女神；国家先蚕礼像制与地方马头娘图像需分开。",
    lead: "少女一句戏言把婚约许给了能迎回父亲的马。马真的把人带回家，却被父亲杀死；晒在庭中的马皮卷起少女飞上桑树，几日后两者化成吐丝的蚕。故事的力量来自承诺、羞耻和劳动起源缠在一起。",
    origin: "《搜神记》卷十四保存完整蚕马叙事，并附汉礼祭蚕神材料。文本没有给少女姓名，马头娘等称谓是后世图像与祠祀的进一步人格化。",
    development: "养蚕地区以蚕花、蚕娘、马头娘等名称祈愿丰收，礼制中的先蚕又常与嫘祖等人物相接。地方神话和国家礼仪共享蚕桑主题，却不是同一条谱系。",
    distinction: "蚕女不是嫘祖的女儿，也不等同菀窳妇人、寓氏公主或所有蚕神。马皮化蚕属于志怪叙事，不能拿来替代真实养蚕技术史。",
    evidence: "叙事按《搜神记》原有次序整理，后世马头娘称谓注明出处。有关桑字来自“丧”的解释属于古人附会，不作现代语言学结论。",
    sourceList: ["《搜神记》卷十四蚕马故事", "汉礼皇后亲蚕与蚕神材料", "明清蚕书、蚕花与马头娘祠俗"],
    use: "可以写承诺被轻慢后造成的家庭悲剧，也可写蚕乡女性如何重新理解故事。新增少女姓名、马的语言或神婚结局应标原创。",
    sourceRef: "s:soushenji",
    sourceCitation: "《搜神记》卷十四蚕马化蚕条",
    sourceEvidenceType: "primary-text",
    institutionKey: "craft-guild",
    links: [
      link("x:leizu", "蚕桑起源叙事并列", "《搜神记》蚕女与历代先蚕礼对读", "六朝志怪与后世先蚕礼比较层", { direction: "undirected", evidenceType: "textual-variant", notes: "蚕女变形叙事与嫘祖先蚕接受不可合为母女谱系。" }),
      link("f:zigu", "蚕桑占问与妇女生活相邻", "岁时笔记与蚕乡祠俗", "宋明妇女生活信仰层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable" }),
      link("i:craft-guild", "蚕桑行业的保护与起源记忆", "地方蚕神庙、蚕会与行业祭祀材料", "明清蚕桑行业层", { evidenceType: "ritual-record", confidence: "probable" })
    ]
  }),
  deity({
    key: "sun-simiao-yaowang",
    title: "孙思邈（药王形态）",
    aliases: "孙真人、药王孙思邈、妙应真人",
    category: "profession-deities",
    historicalLayer: "隋唐医家生平、真人传说与宋元以后药王祭祀",
    summary: "以《千金方》著称的隋唐医家，身后逐步获得真人、药王称号，并进入医家、药铺与地方庙祀。",
    earliestSource: "《旧唐书·方伎传》孙思邈传及其医书",
    sourceLocation: "《旧唐书》卷一百九十一；《备急千金要方》序论",
    domains: "医学、养生、医德、药业祖师与医者纪念",
    iconography: "常作长髯道者或医者，虎、龙侍从多取自后世治兽与伏龙传说。",
    lead: "孙思邈留下的是可以翻阅的医书，也留下了一个不断被延长的寿命。正史称其博通医药、屡辞征召，后世传说又让他活过数朝、骑虎行医；药王形象正是在真实著述与神异长寿之间长成。",
    origin: "《旧唐书》记录他隐居、著书与受唐太宗等人礼遇，《千金方》则直接呈现医学思想。具体生年与高寿说本就有分歧，不宜算出一个绝对年龄。",
    development: "宋元以后孙思邈获真人封号，药王庙与医药行业祭祀逐渐普及。医者以他代表医德和方药传统，民间又加入治虎、龙宫取方等故事。",
    distinction: "历史医家孙思邈、道教真人、药王神与《西游记》等文学中的药王不可混为一页。尊奉药王也不表示其方剂可绕过现代医疗判断。",
    evidence: "生平以唐史和本人医书为底，封号与庙祀按宋以后材料，动物报恩等故事只标后传。页面不提供现实诊疗处方。",
    sourceList: ["《旧唐书·方伎传》孙思邈传", "《备急千金要方》序论", "宋元以来真人封号与药王庙记"],
    use: "适合写医者面对名声、贫病与职业伦理。若补写龙宫授方、虎口拔骨的细节或神药效果，应注明后传或标原创，不能写成医疗承诺。",
    sourceRef: "s:jiutangshu-sun",
    sourceCitation: "《旧唐书》卷一百九十一孙思邈传；《备急千金要方》序论",
    sourceEvidenceType: "historical-record",
    institutionKey: "medicine-birth",
    links: [
      link("x:shennong", "医药始祖与历史医家并祀", "药王庙、医药会馆与本草传统材料", "宋明以后医药行业祭祀层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable", notes: "神农药祖与孙思邈历史医家身份不同，行业并祀不构成师承。" }),
      link("f:baosheng-dadi", "地区不同的医神传统", "药王庙与保生大帝庙碑志对读", "宋明清医药信仰比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable" }),
      link("i:medicine-birth", "医家与药业祖师祭祀", "宋元以后药王庙、药王会与药铺祭祀", "宋元以后医药行业层", { evidenceType: "ritual-record" })
    ]
  }),
  deity({
    key: "baosheng-dadi",
    title: "保生大帝（吴夲）",
    aliases: "吴真人、大道公、花桥公、保生大帝",
    category: "profession-deities",
    historicalLayer: "宋代闽南医者记忆、地方庙祀与历代封号",
    summary: "以吴夲医者记忆为核心的闽南医神，宋以后庙宇与封号不断扩大，并随移民传播至海峡两岸。",
    earliestSource: "宋代地方祠记、封号材料与后世闽南方志",
    sourceLocation: "白礁、青礁祖宫碑志及宋元明封号记录",
    domains: "治病、护生、闽南移民、医药行业与社区庙祀",
    iconography: "多作文官或真人冠服，药童、虎患、点龙眼等故事形成多种壁画版本。",
    lead: "保生大帝的香火横跨海峡，但故事仍牢牢抓住一位会看病的吴氏真人。地方人记得他诊治贫病、采药施方，庙宇与王朝封号再把医者的仁心推成护境神职。",
    origin: "吴夲生平主要依赖地方庙记和方志，早期材料密度不如正史名医。名字写作吴夲或吴本，年代与具体官职也有异说，页面保留这些不确定。",
    development: "宋元明以来，白礁、青礁等庙宇争持祖庙记忆，信仰随闽南移民和商船传播。神医职能逐渐兼及瘟疫、社区平安与仪式巡境。",
    distinction: "保生大帝不是孙思邈的化身，也不等同所有大道公。历史医者、地方真人、皇封神号和各庙分灵应分层，祖庙争议不由项目裁成唯一答案。",
    evidence: "以碑志和地方志互校，较晚神迹按最早见本注明。宫廷御医、点龙睛和医虎故事若缺早期材料，只作为地方传说。",
    sourceList: ["白礁慈济宫、青礁慈济宫历代碑志", "宋元明保生大帝封号与地方志", "闽南及台湾保生大帝庙沿革记录"],
    use: "适合写医术、移民与祖庙认同如何互相支撑。新增病例、处方和神迹疗效应标原创，并避免让虚构治疗替代现实医学。",
    sourceRef: "s:songshi-shenci",
    sourceCitation: "宋代神祠封赐制度材料与闽南保生大帝庙碑志",
    sourceEvidenceType: "historical-record",
    institutionKey: "medicine-birth",
    links: [
      link("f:sun-simiao-yaowang", "并行的医神与行业祖师", "药王庙与保生大帝庙碑志", "宋元明清医药信仰层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable" }),
      link("f:linshui-furen", "闽地护生信仰并行", "闽地宫庙碑记与科仪材料", "宋明以后福建地方信仰层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable", notes: "共同护生不表示吴夲与陈靖姑有历史师承。" }),
      link("f:mazu", "随闽南移民跨海传播", "闽台宫庙分灵与移民记录", "明清海峡移民信仰层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable", notes: "两种香火可同随移民传播，神格与祖庙仍分开。" })
    ]
  }),
  deity({
    key: "linshui-furen",
    title: "临水夫人（陈靖姑）",
    aliases: "陈靖姑、顺天圣母、大奶夫人、临水奶",
    category: "local-deities",
    historicalLayer: "福建地方女神、闾山法传统与明清护产叙事",
    summary: "闽地重要女神，以护产、救婴和闾山法事闻名；斩蛇、祈雨与产难殉身等情节随地方传本展开。",
    earliestSource: "福建地方祠记、闾山科仪与《三教源流搜神大全》大奶夫人条",
    sourceLocation: "古田临水宫碑志、闾山科仪、明清地方志与传说本",
    domains: "护产、育儿、祈雨、驱邪、女性仪式与闾山法脉",
    iconography: "常作冠服女神，怀抱或护佑婴儿；姐妹、婆姐团与兵将配置依宫庙而异。",
    lead: "临水夫人的故事从女性最危险的时刻说起。传说中的陈靖姑学法、斩蛇、祈雨，最终因孕身行法而亡；庙宇却让这场死亡反转为保护产妇与婴儿的长期承诺。",
    origin: "早期可考材料多来自福建地方与科仪传统，完整生平在明清传本中逐步定型。籍贯、师门、丈夫和两位姐妹的细节存在地区版本。",
    development: "古田临水宫与各地分灵推动信仰扩展，闾山法师、婆姐仪式和家庭还愿共同维持香火。护产神职也随移民传播到台湾及东南亚华人社区。",
    distinction: "陈靖姑不等同妈祖、碧霞元君或送子观音。历史女性线索、法师祖师、顺天圣母封号和民间大奶夫人可以相接，却不能删去时代差别。",
    evidence: "庙志与科仪可证明宫庙和法脉，传奇只能证明某版本如何讲述。产难、斩蛇和闾山师承不拼成一份无争议年谱。",
    sourceList: ["古田临水宫历代碑志", "闾山法科仪与大奶夫人神谱", "《三教源流搜神大全》大奶夫人条"],
    use: "适合写女性经验、法脉传承和社区互助。若补写学法旅程、姐妹对白或具体产科神迹，须标明传本或项目原创改编。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "《三教源流搜神大全》大奶夫人条及古田临水宫碑志",
    sourceEvidenceType: "textual-variant",
    institutionKey: "women-life-cycle",
    links: [
      link("f:baosheng-dadi", "闽地护生与医疗信仰相邻", "闽地宫庙碑志与地方科仪", "宋明以后福建护生信仰层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable" }),
      link("f:bixia-yuanjun", "跨区域的护产与赐子职能", "福建临水夫人庙与华北娘娘庙材料对读", "明清女神信仰比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "相似神职源于生活需求，不构成同神或姐妹关系。" }),
      link("x:guanyin-lineage", "护产与送子祈愿可在同庙并见", "明清观音堂与临水夫人宫庙记录", "明清民间合祀层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable", notes: "合祀不证明陈靖姑是观音化身。" })
    ]
  }),
  deity({
    key: "zhao-gongming",
    title: "赵公明（玄坛与财神形态）",
    aliases: "赵元帅、玄坛元帅、黑虎玄坛、武财神",
    category: "profession-deities",
    historicalLayer: "道教瘟疫与玄坛元帅传统、明清求财神职扩张",
    summary: "早期多见驱瘟、执法与玄坛元帅职能，明清神谱、小说和商贸祭祀逐步把公平买卖、求财与武财神形象推到前台。",
    earliestSource: "道教法书赵元帅材料与《三教源流搜神大全》赵元帅条",
    sourceLocation: "《三教源流搜神大全》卷三赵元帅；明清玄坛科仪与财神图像",
    domains: "玄坛执法、驱瘟、赏罚、公平买卖、求财与武财神",
    iconography: "常作黑面铁冠、执鞭跨虎；元宝、招财使者与五路财神配置多属后期财神化。",
    lead: "赵公明先握着铁鞭巡察，并不是先抱着元宝站在店门口。神谱称他为正一玄坛元帅，司赏罚、诉冤、驱瘟；其中“公平买求财可宜利”的一句，为后来财神形象留下了可以扩大的缝隙。",
    origin: "道教法书和《三教源流搜神大全》把赵元帅放在雷法、玄坛与执法系统。关于秦代隐士、终南山修道等传记属于神谱叙事，缺乏同时代人物记录。",
    development: "明清小说、年画与商贸祭祀不断强化其求财职能，黑虎和铁鞭成为武财神标志。五路财神、招宝纳珍使者等组合在不同神谱中并不一致。",
    distinction: "玄坛元帅、瘟神赵公明、《封神演义》人物和现代武财神是连续又有差别的形态。赵公明不等同刘海蟾，也不是一切财神的历史总管。",
    evidence: "先以道教神谱确定玄坛与执法，再按小说、版画和商号祭祀追踪财神化。小说封神名单只证明文学传播，不证明更早科仪照此运行。",
    sourceList: ["《三教源流搜神大全》赵元帅", "明清玄坛元帅科仪与神像题记", "《封神演义》赵公明及五路财神接受材料"],
    use: "适合写公道与逐利如何拉扯同一位神。若设计财神发放财富、核算功过的具体规则，须标为项目原创改编，不能冒称古代统一制度。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "《三教源流搜神大全》卷三赵元帅",
    sourceEvidenceType: "ritual-record",
    institutionKey: "wealth-commerce",
    links: [
      link("x:liu-haichan", "金蟾与财神图像后起相邻", "明清刘海戏金蟾图与财神年画", "明清吉祥图像层", { direction: "undirected", evidenceType: "material-evidence", confidence: "probable", notes: "全真谱系祖师刘海蟾不等同赵公明。" }),
      link("f:guan-di", "并列为武财神的不同传统", "明清商帮祠祀与财神年画", "明清商业信仰层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable" }),
      link("x:thunder-department", "玄坛执法与雷法系统相接", "道教雷法与赵元帅科仪", "宋元明道教法术层", { kind: "member", evidenceType: "ritual-record", confidence: "probable", notes: "具体隶属随法派不同，不设置跨传统唯一编制。" })
    ]
  }),
  deity({
    key: "bigan-caishen",
    title: "比干（文财神形态）",
    aliases: "王子比干、文曲财神、无心财神",
    category: "profession-deities",
    historicalLayer: "商末忠臣叙事、明清神谱小说与文财神接受",
    summary: "先秦至汉代史传中的殷臣比干，后世因忠直、无偏与剖心故事被纳入文财神谱系；财神身份不是早期本传内容。",
    earliestSource: "《尚书》《论语》《史记·殷本纪》等比干材料",
    sourceLocation: "《史记·殷本纪》及明清财神神谱、年画",
    domains: "忠谏、殷商记忆、公平无私与文财神",
    iconography: "财神图多作文官冠服持如意或元宝，“无心故不偏”是后世解释。",
    lead: "比干在早期史传里因忠谏而死，手里没有元宝。到了明清，人们却从“剖心”故事另取一层意思：既然无心，便不会偏私，于是忠臣被请进商铺，成为讲公平的文财神。",
    origin: "先秦文献和《史记》提供殷臣、谏死与忠直评价，具体剖心细节随文本发展。早期材料没有文财神名号，不能把后世香火写回商朝。",
    development: "神谱、小说和年画把比干与赵公明、范蠡、关帝等并列，文武财神分类由此日渐常见。各地选择不同，不存在一份古代全国通用名单。",
    distinction: "历史比干、忠臣祠中的比干、《封神演义》人物与文财神形态分别记录。无心不偏是象征性解释，不是古代经济制度。",
    evidence: "本传依《史记》等古史材料，财神层依明清图像、庙祀和小说。剖心后仍行走、获封财神等内容只按文学版本说明。",
    sourceList: ["《史记·殷本纪》", "先秦典籍比干忠谏材料", "明清财神神谱、年画与《封神演义》接受"],
    use: "可以写忠诚如何被商业伦理重新理解。若让比干制定财富分配法、审理商号账目或与赵公明争位，须标为项目原创改编。",
    sourceRef: "s:shiji-figures-commerce",
    sourceCitation: "《史记·殷本纪》比干条；明清财神图像材料",
    sourceEvidenceType: "textual-variant",
    institutionKey: "wealth-commerce",
    links: [
      link("f:zhao-gongming", "文武财神并列组合", "明清财神年画与庙宇神位", "明清财神分类层", { direction: "undirected", evidenceType: "material-evidence", confidence: "probable" }),
      link("f:fanli-caishen", "忠义象征与经商典范并列", "明清商帮祠祀与财神谱", "明清商业伦理层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable" }),
      link("x:emperors-temple", "忠臣底本与后世国家庙祀分层", "《史记·殷本纪》《周本纪》与历代帝王庙礼志对读", "战国秦汉古史叙事与明清国家庙祀比较层", { evidenceType: "primary-text", notes: "关系只提示比干的历史人物底本后来被不同祀典重新解释，不把财神身份带回商周战争。" })
    ]
  }),
  deity({
    key: "fanli-caishen",
    title: "范蠡（商圣与财神形态）",
    aliases: "陶朱公、鸱夷子皮、商圣、文财神",
    category: "profession-deities",
    historicalLayer: "越国谋臣与《史记》货殖人物、明清商人典范",
    summary: "《史记》所写功成身退、三徙成名的范蠡，后世以陶朱公身份尊为商圣并纳入文财神谱系。",
    earliestSource: "《国语》《史记·越王勾践世家》《货殖列传》",
    sourceLocation: "《史记》卷四十一、卷一百二十九",
    domains: "经商、财富伦理、功成身退、商帮祖师与文财神",
    iconography: "常作文士或富商冠服，聚宝盆等吉祥物多为后世财神图像添加。",
    lead: "范蠡最适合财神想象的地方，不只是富，而是懂得离开。他帮助越王复国后改名换姓，到齐、到陶重新经营；《史记》称他三徙成名，后世商人便把“会进也会退”看作陶朱公的本领。",
    origin: "《史记》分别在越世家和货殖列传写其政治与经商经历，姓名转换与致富叙事已有早期史传根据。西施同行、泛舟终老等细节仍有文本层差别。",
    development: "商帮、会馆和商业读物把陶朱公尊为商圣，后来又进入文财神组合。致富术书常托名范蠡，不能因此都认作本人著作。",
    distinction: "历史范蠡、陶朱公商人形象、托名经商书与文财神神像不可合并。财富成就不证明他生前主持过宗教祭祀。",
    evidence: "以《史记》确认人物和货殖叙事，后世祠祀以会馆、商号和图像为证。所有托名《陶朱公生意经》须另查版本。",
    sourceList: ["《史记·越王勾践世家》", "《史记·货殖列传》", "明清商帮会馆、陶朱公祠与财神图像"],
    use: "适合写退出权力、改名经商与家庭选择。若加入聚宝盆法术、现代投资秘诀或与其他财神会商，须标为项目原创改编。",
    sourceRef: "s:shiji-figures-commerce",
    sourceCitation: "《史记·越王勾践世家》《货殖列传》",
    sourceEvidenceType: "historical-record",
    institutionKey: "wealth-commerce",
    links: [
      link("f:bigan-caishen", "文财神组合中的不同伦理象征", "明清财神谱与商帮祠祀", "明清商业信仰层", { direction: "undirected", evidenceType: "material-evidence", confidence: "probable" }),
      link("f:guan-di", "商帮会馆中的并行主祀选择", "明清会馆、关帝庙与陶朱公祠记录", "明清商帮网络层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable" }),
      link("i:wealth-commerce", "商圣与财神接受", "《史记》货殖叙事及明清会馆祀典", "明清商业伦理与祭祀层", { evidenceType: "historical-record" })
    ]
  }),
  deity({
    key: "guan-di",
    title: "关帝（忠义、武庙与财神形态）",
    aliases: "关羽、关公、关王、关圣帝君、协天大帝",
    category: "profession-deities",
    historicalLayer: "三国历史人物、宋元关王封号、明清关帝国家与商帮祭祀",
    summary: "由三国将领关羽的忠勇记忆发展出的跨传统神格，兼具护国、武庙、司法誓约、商帮信任与武财神等形态。",
    earliestSource: "《三国志·关羽传》与六朝隋唐地方祠祀材料",
    sourceLocation: "宋元封号、明清礼志、关帝庙碑与商帮会馆记录",
    domains: "忠义、战争、护国、誓约、司法、商帮与武财神",
    iconography: "红面长髯、绿袍与偃月刀主要由戏曲、小说和造像共同定型；历史服饰不可直接照搬。",
    lead: "关羽身后的道路很多：玉泉山故事把他带进佛寺，宋元封号把他推成关王，道教神谱给他降魔职能，明清国家与商帮又分别看重忠义、军威和守信。关帝不是一条线长大的，而是多种社会需要在同一名字上会合。",
    origin: "《三国志》提供将领生平，早期祠祀与显灵故事另有年代。赤面、青龙刀、单刀赴会等熟悉形象受《三国演义》和戏曲影响，不能全部当正史。",
    development: "宋元累封关王，明万历以后帝号显著，清代国家祭祀进一步提高。商帮会馆以结义、守信和共同乡籍组织祭祀，武财神职能由此更广。",
    distinction: "历史关羽、佛教伽蓝关王、道教关帝、国家武庙主神与商帮财神形态必须互链而不合并。不同教门尊号也不构成一套自古固定的职位表。",
    evidence: "人物事迹依正史，神格扩展依封号、庙碑、礼志与会馆记录，小说情节单列文学接受。所有“儒释道共同认证”式说法都需落实到具体材料。",
    sourceList: ["《三国志·蜀书·关羽传》", "明清礼志关帝祭祀条", "关帝庙碑、商帮会馆与佛教玉泉山材料"],
    use: "适合写不同群体争用同一忠义符号。若安排关帝主持统一三教会议、直接授予财富或评价现代商业，须标为项目原创改编。",
    sourceRef: "s:mingqing-lizhi",
    sourceCitation: "《明史·礼志》《清史稿·礼志》关帝祭祀材料；《三国志》本传对照",
    sourceEvidenceType: "ritual-record",
    institutionKey: "wealth-commerce",
    links: [
      link("x:guanyu-garland", "佛教伽蓝护法形态", "玉泉山关王祠记与佛教史传", "宋代以后佛教关王接受层", { direction: "undirected", evidenceType: "textual-variant", notes: "本页保留关帝主流神格，佛教受戒护法由专页处理。" }),
      link("f:zhao-gongming", "武财神称谓下的并列传统", "明清财神年画与商帮祭祀", "明清商业信仰层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable" }),
      link("i:three-teachings", "跨佛道国家礼制与民间会馆", "明清关帝庙碑、佛寺伽蓝与国家礼志", "宋元明清跨传统接受层", { evidenceType: "historical-record" })
    ]
  }),
  deity({
    key: "luban",
    title: "鲁班（百工祖师形态）",
    aliases: "公输般、公输盘、班输、巧圣先师",
    category: "profession-deities",
    historicalLayer: "战国工匠记忆、技艺传说与明清百工祖师祭祀",
    summary: "先秦文献中的公输般因巧技著名，后世被木匠、建筑、石作等行业尊为鲁班祖师，并衍生大量工具发明传说。",
    earliestSource: "《墨子·公输》《孟子》等先秦材料",
    sourceLocation: "《墨子·公输》及明清《鲁班经》、行业会馆碑记",
    domains: "木作、营造、工具发明、行业规矩与祖师祭祀",
    iconography: "多作工匠或冠服祖师，持曲尺、墨斗、斧锯；法术符咒属于后世《鲁班经》传统。",
    lead: "《墨子》里的公输般是善造攻城器械的工匠，墨子却用守城模型让他的巧技失去胜算。后世百工没有只记住这场辩论，而是把锯、刨、曲尺和营造规矩一件件归到鲁班名下。",
    origin: "先秦文献能证明公输般以机械巧技闻名，却不能证明所有木工工具都由他独创。鲁班姓名、籍贯和活动年代本身也有文本差别。",
    development: "木匠、建筑、石作和戏台营造等行业以鲁班为祖师，《鲁班经》又把尺寸、营造和符法编在一起。行业规矩在师徒传承中不断地方化。",
    distinction: "历史公输般、发明家传说、行业祖师和法术鲁班分别记录。托名鲁班的营造书不必然出自战国本人，工具起源也不能用单一祖师代替技术史。",
    evidence: "人物底本以《墨子》为主，行业祭祀以会馆、工匠口传与《鲁班经》版本为证。每件发明都应另查最早材料。",
    sourceList: ["《墨子·公输》", "《孟子》公输子材料", "明清《鲁班经》与百工会馆碑记"],
    use: "适合写师徒规矩、工程伦理与技术被神化的过程。若让鲁班留下万能机关图或可验证的秘术，须标为项目原创改编。",
    sourceRef: "s:shiji-figures-commerce",
    sourceCitation: "《墨子·公输》；明清《鲁班经》与行业碑记",
    sourceEvidenceType: "textual-variant",
    institutionKey: "craft-guild",
    links: [
      link("f:du-kang", "不同行业的祖师并列", "明清行业会馆与岁时祭祀材料", "明清行业祖师层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable" }),
      link("i:craft-guild", "木作与营造行业主祀", "《鲁班经》及工匠会馆碑记", "明清百工组织层", { evidenceType: "ritual-record" }),
      link("x:confucius", "先师称谓相同而制度场域不同", "文庙释奠与鲁班会馆祭祀对读", "明清先师称谓比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "巧圣先师与至圣先师不是同一礼制序列。" })
    ]
  }),
  deity({
    key: "du-kang",
    title: "杜康（酒祖传说）",
    aliases: "杜康、酒祖、杜康仙师",
    category: "profession-deities",
    historicalLayer: "古代诗文酒名与明清酿酒行业祖师传说",
    summary: "长期被称为造酒者和酒的代称，身份时代众说纷纭；后世酿酒行业以杜康为祖师，但不能据传说断定酒由一人发明。",
    earliestSource: "汉魏以来杜康造酒说与诗文用典",
    sourceLocation: "古代字书、魏晋诗文及明清酒业祠祀材料",
    domains: "酿酒、酒业祖师、宴饮文化与发明传说",
    iconography: "多作文士、酿酒者或持爵老人，具体朝代服饰随地方庙像而变。",
    lead: "杜康有时像一个人，有时干脆就是酒。曹操说“何以解忧，唯有杜康”，已经把名字变成饮物的代称；行业祠祀又把这两个字重新塑成一位能够受香火的酿酒祖师。",
    origin: "古书对杜康年代、籍贯和身份说法不一，有黄帝时人、夏代君主及周秦人物等版本。酒的考古史远早于这些整齐传记，不能归功一人。",
    development: "酒坊和酿造行业选择杜康作为共同祖师，以祭祀维系师徒、工艺和商业信誉。各地也可能尊仪狄、刘伶或地方酒仙，名单没有全国统一。",
    distinction: "杜康作为诗文代称、传说发明者、历史人物猜测和行业祖师是四个层次。杜康酒品牌或现代产地争论不用于裁决上古身份。",
    evidence: "本页以早期用典证明名字流传，以行业碑记证明祖师祭祀，同时明确考古酿造与人物传说不是同类证据。",
    sourceList: ["汉魏诗文中的杜康用典", "古代字书与酒谱的造酒异说", "明清酒坊、会馆与杜康祠材料"],
    use: "适合写一种名字如何从人物变成酒、再回到神像。若补写第一次酿酒配方、确切王朝或神授酒曲，须标为项目原创改编。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "汉魏杜康用典、古代酒谱与明清行业祭祀材料",
    sourceEvidenceType: "textual-variant",
    institutionKey: "craft-guild",
    links: [
      link("f:luban", "行业祖师制度中的并列对象", "明清会馆与行业祭祀材料", "明清行业祖师层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable" }),
      link("i:craft-guild", "酿酒行业的祖师记忆", "酒坊祭祀、酒谱与地方祠记", "明清酿酒行业层", { evidenceType: "historical-record", confidence: "probable" }),
      link("f:fanli-caishen", "生产祖师与商业典范相邻", "酒业会馆、商帮与财神祀典", "明清行业商业层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "同受商号尊奉不表示杜康从属于陶朱公。" })
    ]
  }),
  deity({
    key: "huaguang-dadi",
    title: "华光大帝（马元帅）",
    aliases: "灵官马元帅、华光天王、马天君、三眼华光",
    category: "local-deities",
    historicalLayer: "道教灵官马元帅、火神职能与明代《南游记》文学扩展",
    summary: "道教护法神将与火神，常以三眼、火轮和金砖示人；明代小说把其降生、盗金枪与南游经历编成长篇。",
    earliestSource: "道教法书灵官马元帅材料与《三教源流搜神大全》",
    sourceLocation: "《三教源流搜神大全》灵官马元帅；《南游记》文学层",
    domains: "护法、火禁、驱邪、戏班与南方地方庙祀",
    iconography: "常作三眼武将持金砖、枪或火轮；五显、马灵耀等对应因地区和文本不同。",
    lead: "华光的第三只眼、火焰和金砖让他在庙门前格外醒目。道教科仪把马元帅当作护法神将，明代《南游记》却给他一连串投胎、闯天宫和寻母的冒险，两种华光共享名字，不共享全部情节。",
    origin: "灵官马元帅见于道教神谱和法书，身份与五显神、火部神将有多种牵合。小说中的马灵耀属于文学重编，不能用来替代早期科仪。",
    development: "华光进入南方庙宇、火神祭祀和戏曲行业，部分地区以其巡境驱邪。神职随庙宇可能偏火禁、护法或行业保护，没有唯一固定版本。",
    distinction: "华光大帝、马元帅、五显神和小说马灵耀可关联但不直接合并；三眼也不证明他与二郎神同源。文学母子关系只属于具体作品。",
    evidence: "先读法书与神谱，再把《南游记》标作小说接受。庙宇若称五显华光，应记录地方牌位和年代，不从名称自动推导全国谱系。",
    sourceList: ["《三教源流搜神大全》灵官马元帅", "道教灵官马元帅科仪", "余象斗《南游记》"],
    use: "适合写火、戏台和城市巡境。若采用《南游记》的闯天宫情节，应明确小说来源；新增神将编制须标项目原创改编。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "《三教源流搜神大全》灵官马元帅；《南游记》文学接受层",
    sourceEvidenceType: "textual-variant",
    institutionKey: "plague-protection",
    links: [
      link("f:wuxian-gods", "部分地区五显与华光相连", "五显庙、华光庙与明代神谱对读", "宋明以后南方地方信仰层", { direction: "undirected", evidenceType: "textual-variant", confidence: "disputed", notes: "不同地区称谓不能汇成唯一同神结论。" }),
      link("f:wang-lingguan", "道观前殿护法神将并列", "明清道观像设与科仪", "明清道教护法层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable" }),
      link("x:thunder-department", "法术神将系统中的协同", "道教雷法、火法与灵官科仪", "宋元明法派科仪层", { kind: "member", evidenceType: "ritual-record", confidence: "probable", notes: "法派编制有别，不写成天界恒定部门。" })
    ]
  }),
  deity({
    key: "wang-lingguan",
    title: "王灵官",
    aliases: "王天君、隆恩真君、太乙雷声应化天尊",
    category: "local-deities",
    historicalLayer: "宋元道法神将、明代萨守坚传说与道观护法像设",
    summary: "明清道观常见的赤面三眼护法，执鞭镇殿；其王善、王恶等姓名与受萨守坚收伏的故事存在版本差异。",
    earliestSource: "宋元道法神将材料与明代灵官崇祀记录",
    sourceLocation: "《道法会元》相关法脉、明代灵官庙与《三教源流搜神大全》王元帅",
    domains: "道观护法、纠察、雷火、驱邪与坛场秩序",
    iconography: "常作赤面三眼、披甲执金鞭，额眼与火焰强调监察和雷火，不等于二郎神。",
    lead: "许多道观里，信众还没见到三清，先会遇见举鞭怒目的王灵官。这个位置很重要：他既守门，也提醒进殿者坛场有规矩；“先拜王灵官”是建筑经验，不是说他位阶高过所有尊神。",
    origin: "王灵官与萨守坚相遇、由邪归正的故事在明代以后影响很大，姓名写作王善、王恶等。更早的法书需要按神将名号逐项核对，不能把后世传记倒填。",
    development: "明成祖时期灵官崇祀显著，道观前殿像设随后普及。王灵官兼具雷火、纠察与护法职能，不同道派使用的咒诀、官号和部将有所差别。",
    distinction: "王灵官不等同华光、赵公明或火德星君；三眼图像也不构成亲属。萨守坚收伏关系属于法派传说，不是可按世俗师徒年表核算的历史事件。",
    evidence: "道观像设、明代宫观记录与法书互证。王善王恶异名保持并列，现代统一神像说明不替代古代科仪。",
    sourceList: ["《道法会元》相关神将法", "《三教源流搜神大全》王元帅", "明代灵官庙与道观前殿像设记录"],
    use: "适合写庙门、戒律与神将从敌手变护法的转换。新增审判权限、雷部军衔或与华光争位，应标项目原创改编。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "《三教源流搜神大全》王元帅及明代灵官祀典材料",
    sourceEvidenceType: "ritual-record",
    institutionKey: "three-teachings",
    links: [
      link("f:huaguang-dadi", "道观护法神将并见", "明清道观像设与神谱", "明清道教护法层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable" }),
      link("x:thunder-department", "雷火与纠察法职相接", "《道法会元》相关科仪", "宋元明雷法层", { kind: "member", evidenceType: "ritual-record", confidence: "probable" }),
      link("x:jade-emperor", "神谱中奉命纠察的关系", "明清王灵官神谱与科仪", "明清道教神职叙事层", { kind: "controls", evidenceType: "textual-variant", confidence: "probable", notes: "奉命说属于神谱和科仪，不据此制造跨时代固定官僚表。" })
    ]
  }),
  deity({
    key: "wuxian-gods",
    title: "五显神",
    aliases: "五显灵官、五圣、五通侯",
    category: "local-deities",
    historicalLayer: "宋代徽州婺源地方神系与明清五显庙网络",
    summary: "以兄弟五神、五显灵官等名号见于江南庙祀的地方神系，宋代已有赐额加封；与五通神既常牵连又不可无条件合并。",
    earliestSource: "宋代《舆地纪胜》所引婺源庙祀、告命与地方志材料",
    sourceLocation: "《舆地纪胜》徽州仙释条及《三教源流搜神大全》五圣始末",
    domains: "地方护境、祈福、显应、江南庙会与五神组合",
    iconography: "常作五位冠服神或武将，姓名、次序与职掌因庙而异。",
    lead: "五显神最先需要回答的不是五位各叫什么，而是这座庙把“显”理解为什么。宋代婺源一带已有五神庙、赐额和加封，后世神谱却不断补出兄弟身世；名字越整齐，越要记得它们可能来自较晚整理。",
    origin: "《舆地纪胜》所引地方材料能证明宋代徽州五神受封与庙祀。《三教源流搜神大全》再把五圣编成可读传记，二者的史料距离需要保留。",
    development: "五显庙沿江南城市、商路和移民扩散，部分地区与华光大帝、五通神或五路神相互对应。每一次合名都应看具体庙额、神位和年代。",
    distinction: "五显、五通、五路财神和华光不是四个可任意替换的名称。数字相同只提供比较线索，不能直接证明同源。",
    evidence: "以宋代封号与庙记确定地方神系，再用明清神谱观察身世整编。现代庙方统一表只代表该庙当前解释。",
    sourceList: ["《舆地纪胜》徽州五神庙与封号材料", "《三教源流搜神大全》五圣始末", "明清五显庙碑与地方志"],
    use: "适合写五位神如何在不同城镇被重新排位。若为五神补造统一父母、出生年月或固定分工，须标为项目原创改编。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "《三教源流搜神大全》五圣始末；《舆地纪胜》徽州庙祀材料",
    sourceEvidenceType: "textual-variant",
    institutionKey: "three-teachings",
    links: [
      link("f:wutong-gods", "名称相近且长期互相牵合", "宋明地方志、五显五通庙记对读", "宋明清江南地方信仰层", { direction: "undirected", evidenceType: "textual-variant", confidence: "disputed", notes: "部分地方可对应，不能据一个庙例合并全国五显五通。" }),
      link("f:huaguang-dadi", "部分地区以华光统摄或对应五显", "明清华光庙、五显庙与神谱", "明清南方神祀层", { direction: "undirected", evidenceType: "textual-variant", confidence: "disputed" }),
      link("f:zhao-gongming", "数字五与财神组合被后世借用", "五路财神年画与五显庙资料对读", "明清吉祥神谱比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "五显不因数字相同就成为赵公明五路财神。" })
    ]
  }),
  deity({
    key: "wutong-gods",
    title: "五通神",
    aliases: "五通、五通仙、五圣",
    category: "local-deities",
    historicalLayer: "江南地方灵神、宋代庙祀与士人淫祠争论",
    summary: "江南多地所见的五神组合，既有护境赐福与商旅祈愿，也在笔记和禁毁记录中被写成扰民灵怪，评价长期分裂。",
    earliestSource: "宋代江南地方志、庙记与士人笔记中的五通材料",
    sourceLocation: "《舆地纪胜》《咸淳临安志》及宋明笔记",
    domains: "地方显应、财富祈愿、灵媒、淫祠争论与禁毁",
    iconography: "可作五位冠服神、少年或无固定像，具体名称和面貌依地方庙本。",
    lead: "五通神在不同作者笔下像两组完全不同的神：庙里的人说他们护境赐福，士人笔记却常写成索取财色、扰乱家庭的邪神。把一方删掉，就看不见地方信仰与礼法批评真正的冲突。",
    origin: "宋代地方志可见五神庙与封赐，笔记材料又保存恐惧和禁祀意见。五通一名可能与五显、五圣互相流转，但各地组合并不整齐。",
    development: "财富愿望、灵媒仪式和地方保护使五通香火延续，官府与士绅则时有毁祠。禁毁并不自动终止信仰，庙名也可能改写以寻求正当性。",
    distinction: "五通神不是五路财神的古称，也不能全部并入五显神。所谓淫祠是历史评价范畴，需要注明说话者与制度语境。",
    evidence: "本页并列庙志、封号、笔记批评和禁毁记录，不把灵验故事作事实证明，也不沿用污名替代描述。",
    sourceList: ["《舆地纪胜》江南五神庙材料", "《咸淳临安志》五通祠条", "宋明士人笔记与禁毁淫祠记录"],
    use: "适合写香客、巫者、官府和士绅围绕同一座庙的争执。若塑造五位神固定性格或欲望，须标为项目原创改编。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "宋代地方志五通祠材料；《三教源流搜神大全》五圣辨析",
    sourceEvidenceType: "textual-variant",
    institutionKey: "three-teachings",
    links: [
      link("f:wuxian-gods", "同名互涉而地方版本不一", "宋明五通、五显庙志对读", "宋明清江南信仰层", { direction: "undirected", evidenceType: "textual-variant", confidence: "disputed" }),
      link("i:wealth-commerce", "部分地区承接求财愿望", "地方五通庙香会与笔记", "宋明清地方求财信仰层", { evidenceType: "historical-record", confidence: "probable", notes: "求财职能不等于纳入统一财神编制。" }),
      link("x:city-god-system", "官府正祀与地方神祠的张力", "宋明神祠封禁与城隍祀典材料", "宋明地方祀典治理层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable", notes: "关系表示制度比较，不设置城隍对五通的固定管辖。" })
    ]
  }),
  deity({
    key: "five-plague-envoys",
    title: "五瘟使者",
    aliases: "五瘟神、五方瘟神、五瘟使者",
    category: "local-deities",
    historicalLayer: "宋代岁时驱瘟材料、明代神谱与地方瘟醮",
    summary: "以五方、五色或五位使者组织的瘟神组合，既被畏惧为疫病来临者，也在送瘟、瘟醮中转为可礼送和约束的对象。",
    earliestSource: "宋代《岁时广记》所见五瘟神材料",
    sourceLocation: "《三教源流搜神大全》五瘟使者及地方瘟醮、送瘟记录",
    domains: "疫病解释、五方、瘟醮、送瘟、巡境与社区危机",
    iconography: "常作五位不同服色神将，姓名与方位配属在各科仪、庙宇间并不一致。",
    lead: "瘟神最难处理的地方，是人们既怕他来，又必须把他请进仪式。五瘟使者把无形疫病分成五方五位，社区才能设坛、献送、约定出境的路线；这不是医学解释，却是真实的危机组织方式。",
    origin: "宋代岁时书已见五瘟神，明代神谱进一步列名、配方位。名单异文很多，不能选一套姓名覆盖所有地方。",
    development: "瘟醮、巡境、送王船等仪式把瘟神从加害者转为受控使者或代天巡狩者。不同地区可能尊称王爷、元帅或行瘟使，神职并非简单善恶。",
    distinction: "五瘟使者不等于五显、五通或五路财神，也不代表所有流行病。宗教仪式能维持秩序和情感，不替代病原学与公共卫生。",
    evidence: "以岁时书和神谱追踪名单，以地方科仪记录送瘟实践。具体疫情死亡数、病种和仪式疗效不从传说推断。",
    sourceList: ["《岁时广记》五瘟神材料", "《三教源流搜神大全》五瘟使者", "明清地方瘟醮、送瘟与王船科仪"],
    use: "适合写社区如何在疾病中分工、恐惧与互助。若设定五神传播病症的精确机制，应标为项目原创改编，并避免医疗误导。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "《三教源流搜神大全》五瘟使者；《岁时广记》相关条",
    sourceEvidenceType: "ritual-record",
    institutionKey: "plague-protection",
    links: [
      link("f:wen-qiong", "瘟部元帅与驱瘟神将相接", "明清瘟醮与温元帅科仪", "明清道法与地方驱瘟层", { kind: "member", evidenceType: "ritual-record", confidence: "probable" }),
      link("f:huaguang-dadi", "火法护境与送瘟仪式并行", "南方华光庙、瘟醮与巡境材料", "明清南方护境层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable" }),
      link("x:siming-zaojun", "岁时祭祀中的不同家庭与社区尺度", "岁时书灶祭与送瘟条对读", "宋明岁时礼俗比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "同属岁时仪式，不表示灶君属于瘟部。" })
    ]
  }),
  deity({
    key: "wen-qiong",
    title: "温元帅（温琼）",
    aliases: "温天君、孚祐温元帅、温将军",
    category: "local-deities",
    historicalLayer: "宋元道法神将、明代神谱与浙江福建驱瘟护境",
    summary: "道教神将温琼在法书与地方庙祀中承担驱邪、收瘟和护境职能，神谱身世与具体隶属随法派而变。",
    earliestSource: "宋元道法与地方温将军祠材料",
    sourceLocation: "《三教源流搜神大全》孚祐温元帅；明清温元帅科仪",
    domains: "驱瘟、护境、雷火法、巡境与神将坛班",
    iconography: "常作武将执剑、锤或令旗，面色与坐骑依科仪和地方塑像而异。",
    lead: "温元帅的名字很容易让人误以为他只主管瘟疫，其实法书里的任务更杂：收邪、护坛、驱瘟、巡境都可能出现。地方庙会再把这些职能压缩成一位能在危急时出队的神将。",
    origin: "宋元以来道法材料可见温将军、温元帅等神将，后世神谱补出温琼生平。不同法派官号不一，不宜拼成连续世俗履历。",
    development: "温元帅进入浙江、福建等地庙宇与巡境，常和五瘟、雷部或其他元帅同坛。疫病时的祈禳加强其驱瘟形象。",
    distinction: "温琼不等同五瘟使者中的某一位，也不与温疫概念同源即视为唯一瘟神。温元帅、温将军和地方王爷须看神位题名。",
    evidence: "科仪证明神将在坛场中的调用，庙志证明地方香火，神谱传记只代表具体版本。仪式结果不作为医学疗效数据。",
    sourceList: ["《三教源流搜神大全》孚祐温元帅", "宋元明道法温将军科仪", "浙闽温元帅庙碑与巡境记录"],
    use: "适合写法师如何调度神将和社区如何送瘟。新增军队规模、疫病能力或与五瘟的固定血缘，应标项目原创改编。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "《三教源流搜神大全》孚祐温元帅及道法科仪",
    sourceEvidenceType: "ritual-record",
    institutionKey: "plague-protection",
    links: [
      link("f:five-plague-envoys", "瘟醮中可协同或制约", "明清瘟醮与温元帅科仪", "明清驱瘟仪式层", { kind: "controls", evidenceType: "ritual-record", confidence: "probable", notes: "制约关系随法派科仪，不作永久天界统属。" }),
      link("x:thunder-department", "雷火神将系统的地方调用", "宋元明道法科仪", "宋元明道教法术层", { kind: "member", evidenceType: "ritual-record", confidence: "probable" }),
      link("f:wang-lingguan", "护坛纠察神将并列", "道观科仪与地方神将坛班", "明清道教护法层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable" })
    ]
  }),
  deity({
    key: "sizhou-dasheng",
    title: "泗州大圣（僧伽信仰）",
    aliases: "僧伽大师、泗州僧伽、泗州大圣、普照明觉大师",
    category: "local-deities",
    historicalLayer: "唐代僧伽人物、泗州寺塔与宋代全国性水陆护佑信仰",
    summary: "唐代西域僧伽在泗州建寺、示寂后形成大圣信仰，宋代庙像遍布水路；观音化身说属于后世佛教接受。",
    earliestSource: "唐宋僧传、泗州普光王寺材料与宋代祠庙记录",
    sourceLocation: "《宋高僧传》相关传记、泗州寺塔记与《三教源流搜神大全》",
    domains: "水路护佑、祈雨、治水、佛教感应与地方大圣庙",
    iconography: "常作胡僧或高僧像，杨枝、瓶钵等持物与观音化身解释需看题记。",
    lead: "僧伽先是一位在淮河边建寺的僧人，身后却沿水路走得比生前更远。商旅、舟人和城市寺院供奉泗州大圣，宋代又把他解释为观音化身；历史僧与大圣像因此重叠，却没有消失。",
    origin: "唐宋僧传记录僧伽在泗州活动、受中宗礼遇和归葬泗州。后世神谱加入掘出古寺、异香和化身等细节，需与早期传记对读。",
    development: "宋代泗州大圣庙随交通网络扩散，祈雨、护水和治病等感应不断累积。泗州城陷于洪泽湖后，地理记忆与分庙香火又产生新的分离。",
    distinction: "历史僧伽、泗州大圣、普光王佛与观音化身说不是同一身份字段。称大圣也不表示与孙悟空有关。",
    evidence: "生平依僧传与寺塔材料，神格依宋代祠记和后出神谱，观音化身只标信仰解释。水患年代与寺址须用历史地理核对。",
    sourceList: ["唐宋僧传中的僧伽", "泗州普光王寺与僧伽塔材料", "《三教源流搜神大全》泗州大圣"],
    use: "适合写一座沉没城市如何靠分庙和旅人延续记忆。若补写观音亲授身份或水下寺城，须标明宗教传说或项目原创。",
    sourceRef: "s:songshi-shenci",
    sourceCitation: "唐宋僧传、泗州寺塔记及宋代神祠记录",
    sourceEvidenceType: "historical-record",
    institutionKey: "three-teachings",
    links: [
      link("p:sizhou", "寺塔与大圣信仰核心地", "唐宋泗州寺塔记与地方志", "唐宋泗州历史地理层", { kind: "located" }),
      link("x:avalokitesvara", "后世观音化身说", "宋元佛教感应录与神谱", "宋元以后佛教接受层", { evidenceType: "textual-variant", confidence: "probable", notes: "化身属于信仰解释，不删除僧伽历史人物身份。" }),
      link("f:hongsheng", "水路保护神职比较", "泗州大圣庙与南海神庙材料对读", "宋明水路信仰比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "淮河与南海祭祀地理不同，不设固定同僚关系。" })
    ]
  }),
  deity({
    key: "jiang-ziwen",
    title: "蒋子文（蒋侯、钟山神）",
    aliases: "蒋侯、蒋王、蒋庄武帝、钟山神",
    category: "city-land-deities",
    historicalLayer: "东汉末地方官记忆、六朝建康钟山神与后世城市庙祀",
    summary: "《搜神记》所载秣陵尉蒋子文死后显灵、迫使孙吴立祠的地方神，兼具钟山、建康城与疫火叙事。",
    earliestSource: "《搜神记》卷五蒋子文条",
    sourceLocation: "《搜神记》卷五及六朝建康庙宇、蒋山地名材料",
    domains: "钟山、城市保护、疫病火灾、地方官神化与冥府属吏",
    iconography: "早期叙事中乘白马执白羽，后世王侯冠服与帝号来自历代封赠。",
    lead: "蒋子文的成神故事一点也不温和。他死于追贼，后来乘白马向故吏索祠；疫病、耳虫和大火接连发生，孙吴最终封侯立庙，钟山也因他改称蒋山。信仰在威胁与保护之间成立。",
    origin: "《搜神记》把蒋子文写成汉末秣陵尉，死后要求为土地神。故事能证明六朝人如何解释建康旧祠，却不能逐项验证显灵灾害。",
    development: "蒋侯庙与钟山地名让地方神进入都城记忆，后世又获王帝称号，并可能与城隍、冥府官署相接。不同朝代封号不应倒填孙吴初祀。",
    distinction: "历史蒋子文、蒋侯、钟山神、蒋王与城隍形态相续但不完全相同。蒋山地名不表示整座山从此只奉一神。",
    evidence: "核心叙事按《搜神记》保留其强制索祠性质；庙址和封号另用六朝地志、碑记核对。灾害不作超自然因果结论。",
    sourceList: ["《搜神记》卷五蒋子文条", "《六朝事迹》建康庙宇材料", "历代蒋王庙与钟山地名记录"],
    use: "适合写新都如何收编一位令人畏惧的旧神。若扩写耳虫疫病、阴司主簿或孙吴宫廷谈判，应标明志怪底本或项目原创。",
    sourceRef: "s:soushenji",
    sourceCitation: "《搜神记》卷五蒋子文条",
    sourceEvidenceType: "primary-text",
    institutionKey: "plague-protection",
    links: [
      link("p:jiangwang-temple", "钟山与建康核心庙祀", "《搜神记》及六朝建康地志", "孙吴六朝地方信仰层", { kind: "located" }),
      link("x:city-god-system", "都城保护与阴司职能后起相接", "六朝至明清蒋王庙、城隍庙材料", "宋明以后城市神职比较层", { evidenceType: "historical-record", confidence: "probable", notes: "蒋子文在部分传统中具城隍性质，不等于全国城隍原型。" }),
      link("f:five-plague-envoys", "疫病叙事与驱瘟仪式相邻", "《搜神记》疫病叙事与明清瘟醮材料对读", "六朝志怪与明清驱瘟比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "蒋侯并非五瘟使者成员。" })
    ]
  }),
  deity({
    key: "wu-zixu-tide-god",
    title: "伍子胥（潮神形态）",
    aliases: "伍员、胥山神、潮神、威惠显圣王",
    category: "water-sea-deities",
    historicalLayer: "春秋人物、投江叙事与吴越江潮祭祀",
    summary: "吴国大夫伍子胥死后被投江的历史叙事，后世在吴越地区与潮神、江神及端午纪念相接。",
    earliestSource: "《史记·伍子胥列传》及《吴越春秋》相关叙事",
    sourceLocation: "伍子胥列传、吴越地方志与潮神庙记",
    domains: "忠愤、吴越记忆、江潮、航运与地方纪念",
    iconography: "多作文武官或持剑忠臣，潮神王冠与水府仪仗属后世庙像。",
    lead: "伍子胥先是一个被迫看着吴国走向败局的人。夫差赐剑令死，尸体被盛入皮囊投入江中；吴越地方记忆没有让他沉没，而是把怒气听成潮声，让忠臣成为江上来去的神。",
    origin: "《史记》记录伍员仕吴、谏争与被杀，投江为潮神的完整解释在《吴越春秋》、地方志和庙祀中继续发展。",
    development: "吴越沿江地区以伍公祠、胥山和潮神庙纪念他，端午人物也可能与屈原、曹娥并列。不同水域的纪念对象不必争成全国唯一来源。",
    distinction: "历史伍员、忠臣祠、潮神和小说伍子胥分别建层。他不是河伯、南海神或所有钱塘潮的唯一人格化原因。",
    evidence: "人物传依《史记》，潮神层依地方志、庙碑与岁时材料。将自然潮汐归因于神怒属于传统解释，不作地理科学结论。",
    sourceList: ["《史记·伍子胥列传》", "《吴越春秋》伍子胥叙事", "吴越伍公祠、胥山与潮神庙记"],
    use: "适合写政治忠告如何被地方水域长期记住。若让伍子胥直接操纵潮汐、与龙王争水府，须标为项目原创改编。",
    sourceRef: "s:shiji-figures-commerce",
    sourceCitation: "《史记·伍子胥列传》及吴越地方潮神材料",
    sourceEvidenceType: "textual-variant",
    institutionKey: "water-navigation",
    links: [
      link("f:cao-e", "吴越水域与端午纪念并列", "地方岁时记、曹娥庙与伍公祠材料", "六朝以后吴越水神纪念层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable" }),
      link("x:hebo", "江潮地方神与先秦河神比较", "《楚辞》《庄子》与吴越潮神庙记对读", "先秦河神与后世地方水神比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "河伯不因水神职能相似而成为伍子胥上司。" }),
      link("p:south-sea-temple", "国家海神祭与地方潮神祭尺度不同", "南海神庙碑与吴越伍公祠记录", "唐宋以后水神祀典比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable" })
    ]
  }),
  deity({
    key: "dragon-mother",
    title: "龙母（悦城龙母）",
    aliases: "龙母娘娘、温氏龙母、悦城龙母",
    category: "water-sea-deities",
    historicalLayer: "西江流域地方女神、龙子传说与历代龙母庙祀",
    summary: "西江流域以温氏女抚养龙子故事为核心的地方女神，庙宇把母职、治水、舟行与区域认同连在一起。",
    earliestSource: "岭南地方志、龙母庙碑与明清传说汇编",
    sourceLocation: "德庆悦城龙母祖庙碑志及西江沿岸方志",
    domains: "西江、龙子、护航、治水、母神与区域香火",
    iconography: "常作冠服母神，五龙子或龙纹环绕；龙子数量、名称与性别随庙本而异。",
    lead: "西江的龙母故事把抚养放在神力之前。温氏女拾得异卵或小兽，耐心养大，后来才知道所育为龙；龙子离水归来守母坟，航船和村落也由此获得一位熟悉水性的母神。",
    origin: "龙母早期年代常被推到秦汉以前，但可核材料主要是后世地方志和庙碑。温氏名号、五龙数量与与秦始皇相遇等情节需要逐本标记。",
    development: "悦城祖庙与西江航运把香火传到沿岸城镇，诞期、开金印与水上仪式强化区域共同体。国家封号与地方称娘娘可同时存在。",
    distinction: "悦城龙母不是佛典龙女，也不等同妈祖、四海龙王之母或所有龙母娘娘。母子关系属于本地传说，不扩成全国龙族谱。",
    evidence: "本页以祖庙碑志和地方志确认庙祀，古老年代只作传统自述。龙子显灵与航行获救按记录年代保存，不作水文因果。",
    sourceList: ["悦城龙母祖庙历代碑志", "西江沿岸地方志龙母庙条", "岭南龙母诞与水上仪式记录"],
    use: "适合写收养、母职与河流社区。若命名五龙、建立龙宫王位或补写秦汉宫廷经历，须注明地方版本或标项目原创。",
    sourceRef: "s:mingqing-lizhi",
    sourceCitation: "岭南地方志与悦城龙母庙碑；清代地方祀典材料",
    sourceEvidenceType: "historical-record",
    institutionKey: "water-navigation",
    links: [
      link("f:mazu", "南方水路女神信仰并行", "妈祖庙与龙母庙碑志对读", "明清华南航运信仰层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable" }),
      link("x:dragon-girl", "龙族女性称谓相近而文本谱系不同", "《法华经》龙女与岭南龙母传说对读", "佛典文本与岭南地方传说比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "certain", notes: "龙母抚养龙子，法华龙女为娑竭罗龙王女，两者不合并。" }),
      link("f:hongsheng", "西江与南海水域保护信仰相邻", "岭南龙母庙、南海神庙与航运记录", "明清岭南水神网络层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable" })
    ]
  }),
  deity({
    key: "hongsheng",
    title: "洪圣（南海神）",
    aliases: "南海神、广利王、南海广利洪圣大王、祝融",
    category: "water-sea-deities",
    historicalLayer: "隋唐国家四海祭祀、南海神庙与华南洪圣地方称谓",
    summary: "广州扶胥口南海神庙的国家海神，唐封广利王，明以后仍入祀典；华南民间常称洪圣，但与人物洪熙等附会须分开。",
    earliestSource: "隋唐礼制、韩愈《南海神广利王庙碑》与历代祭文",
    sourceLocation: "南海神庙碑、唐宋礼志及明清地方志",
    domains: "南海国家祭祀、海贸、港口、风雨与华南洪圣诞",
    iconography: "国家庙像多依王者冠服，夫人配位与地方洪圣像制随时期变化。",
    lead: "南海神庙面对的不是神话地图上的抽象海洋，而是广州外港真实的潮水、商船和使路。朝廷在这里以四海祀典祭南海，地方人则把广利王称作洪圣，国家礼仪与港口生活在同一庙门里交汇。",
    origin: "隋代已立南海神祠，唐代礼制与韩愈碑记可见祭祀规格和广利王封号。将南海神直接定为祝融有古代解释背景，却不是所有时代唯一神名。",
    development: "宋元明清屡有加封、赐物、遣祭和重修，海商与地方社群又发展洪圣诞等活动。庙中夫人、陪祀和海外商人遗迹需逐项看年代。",
    distinction: "南海神、祝融、广利王与洪圣是制度和地方称谓的叠层，不等同妈祖、四海龙王或某位明代官员。国家海祭与民间航海救难可相接但不能混写。",
    evidence: "以韩愈碑、礼志和历代祭文确定国家祀典，以地方志、庙碑观察洪圣称谓。后起人物身世说只列异说。",
    sourceList: ["韩愈《南海神广利王庙碑》", "历代礼志四海与南海神祭祀条", "广州南海神庙碑刻与《广东新语》"],
    use: "适合写港口官祭、外来船队与本地庙会如何共享空间。若把南海神写成固定龙王家族成员或妈祖上司，须标项目原创。",
    sourceRef: "s:mingqing-lizhi",
    sourceCitation: "韩愈《南海神广利王庙碑》；历代礼志南海神祭祀条",
    sourceEvidenceType: "ritual-record",
    institutionKey: "water-navigation",
    links: [
      link("p:south-sea-temple", "国家南海祭祀核心庙宇", "韩愈《南海神广利王庙碑》及历代祭文", "隋唐至明清南海祀典层", { kind: "located" }),
      link("f:mazu", "海运保护与港口香火并行", "元明清海神祭祀与沿海庙志", "元明清海上信仰层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable" }),
      link("x:houtu", "国家山川地祇礼制中的不同祭位", "历代礼志岳镇海渎与地祇祭祀", "唐宋明国家礼制比较层", { direction: "undirected", evidenceType: "ritual-record", notes: "同入国家吉礼不表示南海神与后土同一位阶或身份。" })
    ]
  }),
  deity({
    key: "cao-e",
    title: "曹娥（孝女与水神接受）",
    aliases: "孝女曹娥、曹孝女、曹娥娘娘",
    category: "water-sea-deities",
    historicalLayer: "东汉孝女传记、曹娥碑与吴越江神纪念",
    summary: "《后汉书》记载的上虞孝女，为寻溺亡父亲投江而死；碑祠、江名与岁时纪念使其逐渐兼具水域保护形象。",
    earliestSource: "《后汉书·列女传》曹娥传与汉代曹娥碑记忆",
    sourceLocation: "《后汉书》卷八十四及历代曹娥碑、孝女庙志",
    domains: "孝女纪念、曹娥江、溺水、端午与地方水神",
    iconography: "多作少女或冠服孝女，水神娘娘式像制属于庙宇后世发展。",
    lead: "曹娥十四岁时沿江寻找父亲，昼夜号哭十七日，最终投水而死。五日后，她抱着父尸浮出江面；东汉县长为她改葬立碑，地方也用她的名字重新称呼江水。",
    origin: "《后汉书·列女传》给出上虞、父曹盱、投江和立碑等核心信息。抱尸出水是传记叙事的一部分，不能从中推断水流细节。",
    development: "曹娥碑、孝女庙与曹娥江地名使纪念延续，端午人物谱中又与伍子胥、屈原等并列。水域保护神职来自地方祭祀，不抹去历史孝女身份。",
    distinction: "曹娥不是湘夫人、妈祖或龙女，也不是所有端午节的唯一纪念对象。历史人物、孝道范型和水神娘娘像分别保存。",
    evidence: "人物底本依《后汉书》，碑刻传承和庙祀另按时代。孝道评价属于古代传记伦理，项目同时保留少女死亡所呈现的社会压力。",
    sourceList: ["《后汉书·列女传》曹娥传", "曹娥碑历代重书与题记", "上虞孝女庙、曹娥江与端午地方志"],
    use: "适合写纪念如何改变地名，也可反思孝道叙事对少女的要求。若安排曹娥统领江府、与伍子胥会面，须标项目原创改编。",
    sourceRef: "s:houhanshu-caoe",
    sourceCitation: "《后汉书》卷八十四曹娥传",
    sourceEvidenceType: "historical-record",
    institutionKey: "water-navigation",
    links: [
      link("f:wu-zixu-tide-god", "吴越水域与端午纪念并列", "地方岁时志、伍公祠与曹娥庙材料", "六朝以后吴越纪念层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable" }),
      link("p:caoe-temple", "碑祠与江名核心地点", "《后汉书》曹娥传及历代碑记", "东汉以后上虞纪念层", { kind: "located" }),
      link("f:dragon-mother", "女性水神与母女伦理比较", "岭南龙母庙与吴越曹娥庙材料对读", "明清地方女神比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "一为孝女、一为母神，水域职能相邻不构成同神。" })
    ]
  }),
];

const institutionRows = [
  institution({
    key: "gate-new-year",
    title: "门神图像与岁除贴门",
    category: "shared-ritual",
    historicalLayer: "汉代桃人驱鬼、六朝门画至明清年画",
    summary: "从桃木、神荼郁垒到钟馗与武将门神，门户保护通过材料、图像和印刷不断换形，地区组合从未完全统一。",
    earliestSource: "《风俗通义》门禁古说与《荆楚岁时记》元日门神",
    sourceLocation: "岁时书、宫廷赐像、寺观门画及明清年画题记",
    domains: "家宅边界、岁除、驱邪、年画生产与家庭礼俗",
    lead: "贴门神看似只是把两张画贴在门上，背后却有一条很长的材料史：桃木先承担辟邪，神荼郁垒被画到门扇，钟馗图在岁暮颁赐，武将门神又随版画进入千家万户。门没有变，守门者一直在变。",
    origin: "汉代材料保存桃人与执索神人，六朝《荆楚岁时记》明确写元日画二神于门。唐宋以后钟馗和武将故事加入，不能用明清年画倒推汉代图像。",
    development: "木板印刷使成对门画易于购买和更换，门位、家庭身份、城镇行业影响选神。寺院山门、官署门与民居门也可能使用不同守护者。",
    distinction: "门神是一项位置与功能，不是一位固定神。神荼郁垒、秦琼尉迟、钟馗和地方英雄可并存，左右次序与肤色没有全国唯一标准。",
    evidence: "用文字确定最早可见习俗，用现存版画和题记观察后世形象。某地口传只用于解释该地门画，不扩写成全国规则。",
    sourceList: ["《风俗通义》神荼郁垒材料", "《荆楚岁时记》元日门神条", "《补笔谈》钟馗赐像及明清门神年画"],
    use: "可帮助创作者设计同一城镇不同门位的守护差异。新增“门神总署”或换岗仪式属于项目原创时必须明确标注。",
    sourceRef: "s:jingchu-suishiji",
    sourceCitation: "《荆楚岁时记》元日门神条；《风俗通义》相关材料",
    sourceEvidenceType: "ritual-record",
    institutionKey: "gate-new-year",
    links: [
      link("f:shentu", "古门神图像核心", "《风俗通义》《荆楚岁时记》", "汉至六朝门神层", { kind: "member", evidenceType: "primary-text" }),
      link("f:qin-yuchi-door-gods", "明清常见武将门神组合", "神谱、岁时笔记与门神年画", "明清门画层", { kind: "member", evidenceType: "material-evidence" }),
      link("x:city-god-system", "家门与城界保护尺度相邻", "门神、城隍与地方岁时材料", "宋明清城乡保护信仰层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "位置尺度相邻，不设置城隍统一管辖门神。" })
    ]
  }),
  institution({
    key: "wealth-commerce",
    title: "财神谱系与商帮会馆祭祀",
    category: "profession-deities",
    historicalLayer: "宋元地方求财神祠、明清文武财神分类与商帮网络",
    summary: "赵公明、关帝、比干、范蠡及其他地方财神由不同来路进入商号与会馆，文武、五路等分类是后期整理而非上古定制。",
    earliestSource: "宋元地方神祠、玄坛科仪与明清商帮会馆资料",
    sourceLocation: "财神神谱、会馆碑记、商号祭祀与年画",
    domains: "商业信用、求财、行会、商帮、文武财神与吉祥图像",
    lead: "财神从来不是只有一张脸。商人可以敬关帝的守信，也可以敬陶朱公的经营，年画铺又把赵公明、比干和五路使者排成喜庆阵容。所谓财神谱，更像不同职业伦理和地方网络不断协商出的座次。",
    origin: "早期求财对象多依地方神、玄坛法职或历史人物纪念而来。文财神、武财神和五路财神的整齐分类在明清图像与商业祭祀中才更清楚。",
    development: "会馆把乡籍、行业和信用绑在共同祭祀上，商号开市、年节与账期又推动财神仪式。印刷年画让跨地域组合加速传播。",
    distinction: "财神是职能集合，不是血缘家族。赵公明、关帝、比干、范蠡和刘海蟾不能因共同求财而抹去道教、历史人物与图像来源。",
    evidence: "庙碑与会馆记录用来确认实际祭祀，神谱和小说说明组合方式，现代营销名单不用于反推古代。财富愿望也不能证明神迹收益。",
    sourceList: ["《三教源流搜神大全》赵元帅", "《史记·货殖列传》陶朱公材料", "明清关帝庙、商帮会馆与财神年画"],
    use: "适合搭建不同商帮对“公道、忠义、经营、运气”的争论。新增财神分区、财富法则或可量化加护须标项目原创改编。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "明清财神神谱、会馆碑记与商号祭祀材料",
    sourceEvidenceType: "ritual-record",
    institutionKey: "wealth-commerce",
    links: [
      link("f:zhao-gongming", "玄坛与武财神核心形态", "玄坛科仪与明清财神年画", "明清财神接受层", { kind: "member", evidenceType: "ritual-record" }),
      link("f:guan-di", "商帮守信与武财神主祀", "关帝庙、会馆碑记与清代礼志", "明清商业与国家祭祀交叉层", { kind: "member", evidenceType: "ritual-record" }),
      link("f:fanli-caishen", "陶朱公商圣与文财神接受", "《史记·货殖列传》及明清商帮材料", "明清商人典范层", { kind: "member", evidenceType: "historical-record" })
    ]
  }),
  institution({
    key: "medicine-birth",
    title: "药王、医神与护生祭祀",
    category: "profession-deities",
    historicalLayer: "历史医家纪念、地方医神与妇幼护生信仰并行",
    summary: "神农、孙思邈、保生大帝及地方护产女神分别代表本草始祖、历史医家、社区医神和人生礼俗，庙宇可并祀但身份不合并。",
    earliestSource: "历代医家传记、医书序论、药王庙与地方护生宫庙碑志",
    sourceLocation: "唐史孙思邈传、闽南保生庙志、临水夫人科仪与行业会馆",
    domains: "医德、药业、治病祈愿、护产育儿与行业祖师",
    lead: "医药信仰最容易被误写成一位“万能药神”。真实庙宇往往更具体：药铺敬祖师，地方人求保生大帝，产妇家属请临水夫人，古医书又尊神农尝草。几种期待共享香火，却各有生活背景。",
    origin: "历史医家有传记与著述，地方医神依庙志和封号，护产女神依科仪与家庭礼俗。把不同证据放在同一表里，才不会用神迹替代人物史。",
    development: "行业会馆、药市、疫病和移民让祭祀网络扩大。医神也可进入道观、佛寺或民间宫庙，但跨庙出现不等于宗派身份被统一。",
    distinction: "医学知识、宗教祈愿和社区照护是不同层面。页面不提供诊断，不宣称仪式能治疗疾病，也不把所有药王合成孙思邈。",
    evidence: "人物生平取正史和医书，神职取庙碑、封号与科仪，现实医疗结论不从灵验录提取。地区异名保留原庙坐标。",
    sourceList: ["《旧唐书》孙思邈传与《千金方》", "闽南保生大帝庙碑志", "临水夫人、药王庙与药业会馆材料"],
    use: "可用于表现医疗资源、职业伦理和家庭互助。任何神药疗效、疾病机制或取代医生的情节必须标原创且避免误导。",
    sourceRef: "s:jiutangshu-sun",
    sourceCitation: "《旧唐书》孙思邈传及历代医神庙志",
    sourceEvidenceType: "historical-record",
    institutionKey: "medicine-birth",
    links: [
      link("f:sun-simiao-yaowang", "历史医家与药王祖师", "唐史、医书与药王庙记", "唐至明清医药信仰层", { kind: "member", evidenceType: "historical-record" }),
      link("f:baosheng-dadi", "闽南社区医神", "保生大帝庙碑与地方志", "宋元明清闽南医神层", { kind: "member", evidenceType: "historical-record" }),
      link("x:shennong", "本草始祖与行业祭祀", "神农本草传统与药业会馆材料", "汉以后本草与明清行业层", { kind: "member", evidenceType: "textual-variant", confidence: "probable" })
    ]
  }),
  institution({
    key: "craft-guild",
    title: "行业祖师、会馆与师徒规矩",
    category: "profession-deities",
    historicalLayer: "明清行业组织、祖师祭祀与技术谱系",
    summary: "工匠、酿造、医药、戏曲、商贸等行业借祖师维系师承与信用；同一行业可有多位祖师，同一人物也可跨行业。",
    earliestSource: "行业规约、会馆碑记、工匠传书与地方岁时材料",
    sourceLocation: "《鲁班经》、酒谱、会馆碑记及师徒行规",
    domains: "师徒、技术传承、行业信用、会馆空间与祖师诞",
    lead: "祖师祭祀不是给每项技术找一位孤独发明者，而是给同行找一个共同开端。学徒拜师、工匠立规、会馆筹款和节日聚餐都需要一套能被大家承认的名字，鲁班、杜康等人因此比历史履历更长久。",
    origin: "部分祖师有早期人物记录，部分只见于行业传说。祖师名号能证明群体认同，不能单独证明某种工具或配方的发明权。",
    development: "城市会馆和跨地商帮扩大祖师祭祀，印刷行业书又把行规、技术和符法汇编。地方行业会随竞争改换或增配祖师。",
    distinction: "祖师、保护神、财神与历史发明者不是同一字段。称“先师”也不表示纳入文庙，师徒谱系必须看实际文书。",
    evidence: "优先使用会馆碑、行规和传世工艺书，口传用于记录从业者记忆。现代企业宣传不替代古代行业史。",
    sourceList: ["明清会馆与行业祖师碑记", "《鲁班经》及工匠行规", "酒谱、药业与其他行业祭祀记录"],
    use: "可帮助创作者为城镇设计真实的职业社群与节日。新增跨行业祖师联盟、秘传技术或神授专利须标项目原创改编。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "明清行业神谱、会馆碑记与师徒行规",
    sourceEvidenceType: "ritual-record",
    institutionKey: "craft-guild",
    links: [
      link("f:luban", "百工与营造祖师", "《鲁班经》及工匠会馆碑记", "明清工匠行业层", { kind: "member", evidenceType: "ritual-record" }),
      link("f:du-kang", "酿酒行业祖师", "酒谱与酒业祠祀材料", "明清酿造行业层", { kind: "member", evidenceType: "textual-variant", confidence: "probable" }),
      link("i:wealth-commerce", "生产组织与商帮信用相接", "会馆碑记与商帮祭祀", "明清城市行业网络层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable" })
    ]
  }),
  institution({
    key: "women-life-cycle",
    title: "婚育、护产与女神信仰",
    category: "shared-ritual",
    historicalLayer: "家庭人生礼俗、地方娘娘庙与跨传统求愿",
    summary: "月老、碧霞元君、临水夫人、送子观音等围绕婚姻、生育、护产与儿童成长形成相邻神职，但来历与仪式各不相同。",
    earliestSource: "唐传奇婚姻叙事、宋明娘娘庙志、佛教观音图像与地方科仪",
    sourceLocation: "《定婚店》《岱史》、临水宫碑志与观音造像题记",
    domains: "婚姻、求子、护产、育儿、妇女香社与家庭还愿",
    lead: "人生礼俗把不同宗教带到同一张供桌前。求婚姻时人们想到月老，临产时请临水夫人，求子可能登泰山或拜观音；愿望彼此相连，神的来历却没有因此变成一家人。",
    origin: "唐传奇、佛典图像、地方庙志与科仪分别提供不同神职的最早线索。家庭做法往往比官方礼志更灵活，也更依地区。",
    development: "娘娘庙、香社、分灵与移民让女神网络跨地域传播。神像可在同庙并列，称号也会借用“圣母”“夫人”“娘娘”等共同语汇。",
    distinction: "婚姻神、送子神、护产神和儿童保护神不是天然同位。共同面向女性不等于只由女性参与，也不应把复杂生活缩成生育功能。",
    evidence: "庙碑、科仪、造像和家庭口述各有证据范围。页面记录历史做法，不为生育结果提供保证，也不把现代性别观念倒填古代。",
    sourceList: ["《续玄怪录·定婚店》", "《岱史》碧霞元君祠材料", "临水夫人科仪与汉地送子观音图像"],
    use: "适合塑造女性香社、家庭协商与人生压力。新增神女亲属谱、必然赐子规则或医学效果须标项目原创改编。",
    sourceRef: "s:xuxuanguailu",
    sourceCitation: "《续玄怪录·定婚店》及明清婚育神祠材料",
    sourceEvidenceType: "textual-variant",
    institutionKey: "women-life-cycle",
    links: [
      link("f:linshui-furen", "护产与育儿核心女神", "临水宫碑志与闾山科仪", "明清闽地护产层", { kind: "member", evidenceType: "ritual-record" }),
      link("f:bixia-yuanjun", "华北娘娘庙与求嗣香火", "《岱史》及华北娘娘庙志", "明清华北女神信仰层", { kind: "member", evidenceType: "ritual-record" }),
      link("x:guanyin-lineage", "送子观音的佛教中国化支线", "宋元明清观音图像与祈愿材料", "宋元以后观音生活信仰层", { kind: "member", evidenceType: "material-evidence", confidence: "probable" })
    ]
  }),
  institution({
    key: "water-navigation",
    title: "海运、水路与港口神祀",
    category: "water-sea-deities",
    historicalLayer: "国家海渎礼制、地方水神与船户移民香火",
    summary: "南海神、妈祖、泗州大圣、伍子胥、龙母与曹娥分别依海域、河道、港口和地方记忆形成保护网络。",
    earliestSource: "历代海渎礼志、水神庙碑、船户祭祀与港口方志",
    sourceLocation: "南海神庙碑、《元史·祭祀志》及各地水神祠记",
    domains: "航海、漕运、河运、港口、移民、风浪与水域纪念",
    lead: "船从一条河驶进海里，沿途不只遇见一位水神。国家在南海神庙举行官祭，漕运官员奉天妃，舟人也可能在泗州大圣、龙母或本地潮神前还愿；航路本身把不同香火串成网络。",
    origin: "国家海渎祭祀有礼志与碑文，地方水神常依人物传记、庙志和船户口传。相同救难职能不表示一个神由另一个神分封。",
    development: "海贸、漕粮、移民和庙宇分灵推动跨区域传播。港口可同时容纳官庙、行业会馆与民间娘娘庙，祭期也随航运节奏调整。",
    distinction: "海神、水神、龙王、潮神与航海女神不是统一官署。神圣地理与现代航道图可叠加查看，却不能把传说坐标伪装成测绘结果。",
    evidence: "以礼志和庙碑确认制度，以航海记录和地方志观察传播。灵验录只说明信众如何解释险情，不作为天气与事故原因。",
    sourceList: ["韩愈《南海神广利王庙碑》", "《元史·祭祀志》天妃海运祭祀", "沿江沿海水神庙、船户与港口方志"],
    use: "可用于建立一条随航程变化的祭祀地图。新增水府行政区、神祇航权或必然保航规则须标项目原创改编。",
    sourceRef: "s:yuanshi-jisi",
    sourceCitation: "《元史·祭祀志》天妃条及历代海渎礼志",
    sourceEvidenceType: "ritual-record",
    institutionKey: "water-navigation",
    links: [
      link("f:mazu", "沿海航运与移民香火", "宋元明清天妃庙记与海运祭祀", "宋元明清海上信仰层", { kind: "member", evidenceType: "ritual-record" }),
      link("f:hongsheng", "国家南海祭祀与港口洪圣信仰", "南海神庙碑及历代礼志", "隋唐至明清南海祀典层", { kind: "member", evidenceType: "ritual-record" }),
      link("f:wu-zixu-tide-god", "吴越地方潮神与水域纪念", "伍公祠、潮神庙与地方志", "六朝以后吴越水神层", { kind: "member", evidenceType: "historical-record" })
    ]
  }),
  institution({
    key: "plague-protection",
    title: "瘟醮、巡境与送瘟仪式",
    category: "shared-ritual",
    historicalLayer: "宋代岁时驱瘟、明清地方醮仪与近世王船传统",
    summary: "社区以设醮、巡境、送瘟和王船等仪式面对疫病，将瘟神从不可见威胁转成可迎、可送、可约束的角色。",
    earliestSource: "宋代岁时书五瘟材料及道教驱瘟科仪",
    sourceLocation: "《岁时广记》、明清瘟醮科仪、地方王船与巡境记录",
    domains: "疫病、社区动员、神将、巡境、送王船与危机秩序",
    lead: "瘟醮并不只是在求神消灾，它把一座城要做的事排出次序：清洁道路、设坛、请神、巡境、送出界外。面对看不见的疾病，仪式让恐惧有了时间表，也让社区看见谁在承担工作。",
    origin: "宋代岁时书可见五瘟神，道教科仪提供驱瘟神将与坛法。王船、代天巡狩等形式在闽粤台及其他地区另有发展，不能全部追成一条古老源流。",
    development: "明清城市人口、港口流动与周期性疫病使巡境和送瘟更重要。仪式可与城隍、王爷、温元帅、华光等地方神祀结合。",
    distinction: "宗教仪式、社区防疫和医学治疗是不同措施。页面不宣称瘟神造成疾病，也不把每次王船都解释成同一位神。",
    evidence: "使用科仪、庙志和地方记录重建行动流程，避免把灵验叙事变成疗效证明。病名只在原始文献可辨时记录。",
    sourceList: ["《岁时广记》五瘟材料", "道教驱瘟、禳疫科仪", "闽粤台送瘟、王船与巡境记录"],
    use: "适合写灾难中的组织、冲突和互助。新增瘟神传播机制、仪式治愈率或替代公共卫生的设定必须标原创并避免误导。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "《三教源流搜神大全》五瘟使者及明清驱瘟科仪",
    sourceEvidenceType: "ritual-record",
    institutionKey: "plague-protection",
    links: [
      link("f:five-plague-envoys", "可迎送与约束的疫神组合", "岁时书与瘟醮科仪", "宋明清驱瘟仪式层", { kind: "member", evidenceType: "ritual-record" }),
      link("f:wen-qiong", "驱瘟护坛神将", "道教温元帅科仪与地方巡境", "宋元明清神将法层", { kind: "member", evidenceType: "ritual-record", confidence: "probable" }),
      link("x:city-god-system", "社区巡境与境域秩序相接", "城隍出巡与地方送瘟记录", "明清城市仪式层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable", notes: "部分地区协同不代表全国城隍都主持瘟醮。" })
    ]
  }),
  institution({
    key: "three-teachings",
    title: "三教合祀、同庙并存与善书传播",
    category: "fusion",
    historicalLayer: "宋元以后庙宇共存、明清神谱汇编与善书网络",
    summary: "佛、道、儒家礼制人物和地方神可在同一庙宇、神谱或善书中并列；这表示社会共用，不证明教义与身份完全合一。",
    earliestSource: "宋元地方庙志、明清三教神谱、善书与会馆碑记",
    sourceLocation: "《三教源流搜神大全》、关帝文昌善书及地方合祀庙记",
    domains: "同庙并祀、神谱编排、劝善、善书、教门交涉与地方整合",
    lead: "三教合流最常见的样子，不是一场抽象辩论，而是一座庙里多出一间殿、一册善书里并列几位圣贤。人们可以同时求关帝守信、文昌赐文、观音救苦，却不需要先解决所有教义差异。",
    origin: "宋元地方社会已见寺观与地方神互相借庙，明清神谱和善书把并列关系写得更系统。所谓“三教”本身也是历史分类，边界随语境而变。",
    development: "印刷、会馆、香社和慈善组织推动善书传播，关帝、文昌等跨群体神格尤其活跃。合祀可来自现实共享空间，也可来自后世编者的谱系想象。",
    distinction: "同庙不等于同神，尊称菩萨、帝君或圣人也不自动改变原有传统。项目用关系记录借称、配祀和化身说，不删除独立页面。",
    evidence: "以庙碑、神位、善书版本和科仪确认具体连接。现代口号式“儒释道本来一家”不作为古代事实，争议对应保留置信度。",
    sourceList: ["《三教源流搜神大全》", "明清关帝、文昌类善书", "寺观、会馆与地方合祀庙碑"],
    use: "可为多传统城市设计共享空间与现实摩擦。新增统一神学、最高议会或跨教固定官阶须标为项目原创改编。",
    sourceRef: "s:sanjiao-soushen",
    sourceCitation: "《三教源流搜神大全》及明清善书、合祀庙碑",
    sourceEvidenceType: "textual-variant",
    institutionKey: "three-teachings",
    links: [
      link("f:guan-di", "跨佛道国家礼制与商帮的共享神格", "关帝庙碑、佛寺伽蓝与明清礼志", "宋元明清跨传统接受层", { kind: "member", evidenceType: "historical-record" }),
      link("f:wenchang-dijun", "道教神格与士人劝善网络", "《梓潼帝君化书》及文昌善书", "宋元明清科名与善书层", { kind: "member", evidenceType: "textual-variant" }),
      link("f:sizhou-dasheng", "历史僧与地方大圣合流实例", "唐宋僧传、泗州庙记与观音化身说", "唐宋以后佛教地方化层", { kind: "member", evidenceType: "textual-variant", confidence: "probable" })
    ]
  }),
];

const locationRows = [
  place({
    key: "meizhou",
    title: "湄洲岛与妈祖祖庙",
    category: "mythic-geography",
    historicalLayer: "福建莆田海岛、宋代地方庙祀与历代祖庙重建",
    summary: "莆田外海的妈祖核心朝拜地；祖庙、港湾与分灵网络共同塑造信仰地理，现存建筑不等于宋代原貌。",
    earliestSource: "宋代莆田圣墩、湄洲祠记与后世祖庙碑志",
    sourceLocation: "莆田沿海地方志、祖庙碑刻及历代重建记录",
    domains: "海岛、祖庙、朝圣、分灵、渔港与跨海移民",
    lead: "到湄洲朝拜必须先过一段海路，这让妈祖救难不只是庙里的故事。岛、港、潮汐和进香船共同构成祖庙经验；香火从这里分出，却不会让所有外地妈祖庙失去自己的历史。",
    origin: "宋代早期证据同时涉及圣墩与湄洲一带，祖庙起点应结合庙记、地方志和后世重建记录理解。最早小祠的位置与今天建筑群不能直接重合。",
    development: "历代封号、海商捐修、战乱毁建和现代修复不断改变祖庙。分灵仪式把湄洲变成跨海庙宇确认来源的中心。",
    distinction: "湄洲岛、圣墩祖庙记、现存妈祖祖庙建筑与神话中的海上宫阙是不同图层。祖庙称谓也不用于否定白礁、圣墩等其他早期庙史。",
    evidence: "历史地图标注可核庙址、港湾与重建年代，传说地点另用说明层。现代游客路线不冒充宋代进香道路。",
    sourceList: ["宋代圣墩祖庙重建庙记", "湄洲祖庙历代碑刻与地方志", "元明清天妃封号及分灵记录"],
    use: "适合设计海岛朝圣、船队抵达与祖庙分灵场景。若重建宋代建筑细节或林氏女故居，应标推测或项目原创。",
    sourceRef: "s:yuanshi-jisi",
    sourceCitation: "宋代莆田庙记及《元史·祭祀志》天妃条",
    sourceEvidenceType: "historical-record",
    institutionKey: "water-navigation",
    links: [
      link("f:mazu", "祖庙与核心朝拜地", "宋代庙记与湄洲祖庙碑志", "南宋以后妈祖信仰层", { kind: "located" }),
      link("i:water-navigation", "海上进香与分灵航路", "沿海进香、船户与庙宇记录", "明清海上香路层", { kind: "located", evidenceType: "historical-record" }),
      link("p:south-sea-temple", "华南海神朝拜节点比较", "湄洲祖庙与南海神庙碑志", "宋明清沿海信仰地理比较层", { kind: "route", direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "关系表示海路网络与比较，不宣称固定古航线直达。" })
    ]
  }),
  place({
    key: "taishan-bixia",
    title: "泰山碧霞祠与朝山路",
    category: "mythic-geography",
    historicalLayer: "宋代昭真祠、明清碧霞元君祠与泰山香社",
    summary: "泰山顶碧霞元君祠及沿山朝拜节点，明清香火极盛；宫殿、玉女池与现代景区应按年代分层。",
    earliestSource: "宋代玉女池、昭真祠材料与明《岱史》",
    sourceLocation: "《岱史》、历代登岱记、祠宇碑刻与朝山香会记录",
    domains: "泰山、山顶祠、香社、进香路线、求子与还愿",
    lead: "碧霞祠不是孤立在山顶的一座殿。朝山者从山下起香，沿石阶经过庙、坊、泉池和歇脚处，身体的劳累本身构成还愿；只有把路线画出来，才能看见元君信仰为何不止一尊神像。",
    origin: "宋代玉女池与昭真祠提供早期坐标，明代《岱史》记录元君祠、宫廷遣祭和多种来历。不同建筑名不能无年代地叠在同一平面。",
    development: "明清香社与山下娘娘庙连接远方进香者，洪水、火灾和重修多次改变山顶空间。现代景区保留的是历代叠加后的结果。",
    distinction: "碧霞祠、岱庙、东岳庙与玉女池不是同一地点。泰山国家岳祭和娘娘香会可共享山体，却有不同礼仪路线。",
    evidence: "地图将山顶祠、岱庙和朝山路分层，现存建筑标修缮年代。神女降临地点若仅见传说，不给精确坐标。",
    sourceList: ["《岱史》碧霞元君祠材料", "历代登泰山记", "泰山祠宇碑刻、灾毁与重修记录"],
    use: "适合写一支香社从山下到山顶的完整行程。新增密道、神宫或古代建筑平面须标项目原创或复原推测。",
    sourceRef: "s:mingqing-lizhi",
    sourceCitation: "《岱史》碧霞元君祠、明代遣祭及历代登岱记录",
    sourceEvidenceType: "material-evidence",
    institutionKey: "women-life-cycle",
    links: [
      link("f:bixia-yuanjun", "核心山顶祠宇", "《岱史》昭真祠条", "明清碧霞元君朝拜层", { kind: "located" }),
      link("x:mount-tai", "同一山体的不同信仰空间", "泰山礼志、山志与祠庙碑刻", "宋明清泰山信仰地理层", { kind: "located", notes: "本地点专写碧霞祠与朝山路，泰山国家岳祭由旧页承载。" }),
      link("x:dongyue-emperor", "山下岱庙国家岳祭相邻", "历代泰山祭祀与碧霞祠记录", "明清泰山双重祭祀层", { direction: "undirected", evidenceType: "ritual-record" })
    ]
  }),
  place({
    key: "qiqushan",
    title: "七曲山大庙与梓潼信仰",
    category: "mythic-geography",
    historicalLayer: "蜀道梓潼地方神庙、唐宋封号与文昌朝拜地",
    summary: "四川梓潼七曲山的文昌祖庭，以蜀道位置、张亚子地方神记忆和历代封号连接士人朝拜。",
    earliestSource: "唐宋梓神君诗文、庙记与封号材料",
    sourceLocation: "七曲山碑刻、地方志及《梓潼帝君化书》",
    domains: "蜀道、文昌祖庭、科举朝拜、古柏与地方庙史",
    lead: "七曲山先是一处蜀道路上的地方庙，然后才成为天下士子想象中的文昌祖庭。赶考者经过梓潼，山路、古柏和庙宇把遥远星官变成可以进香、题名和还愿的具体地点。",
    origin: "唐宋材料已见梓潼神庙与封号，七曲山作为信仰核心早于元代文昌帝君完整称号。现存殿宇经过多次重建。",
    development: "文昌神职扩展后，各地文昌宫回望七曲山为祖庭。科举、蜀道交通和地方官修庙共同维持其全国影响。",
    distinction: "七曲山大庙不是文昌六星的天文位置，也不等于《化书》九十七化发生的全部地点。神话生平、历史庙址和现代景区分别标层。",
    evidence: "庙址沿革取碑志与地方志，建筑年代按构件和修缮记录，文昌显灵路线不冒充实测道路。",
    sourceList: ["唐宋梓潼神诗文与庙记", "七曲山大庙历代碑刻", "《梓潼帝君化书》与明清地方志"],
    use: "适合写蜀道旅人与赶考士子在庙中相遇。新增地下文书库、星官通道或古代精确布局须标项目原创。",
    sourceRef: "s:zitong-huashu",
    sourceCitation: "《梓潼帝君化书》及七曲山历代庙记",
    sourceEvidenceType: "historical-record",
    institutionKey: "three-teachings",
    links: [
      link("f:wenchang-dijun", "梓潼地方神核心庙宇", "唐宋庙记与《梓潼帝君化书》", "唐宋元明梓潼信仰层", { kind: "located" }),
      link("f:kuixing", "科举祈愿空间可配魁星阁", "明清文昌宫与魁星阁记录", "明清科举信仰层", { direction: "undirected", evidenceType: "material-evidence", confidence: "probable" }),
      link("i:three-teachings", "士人、道教与地方庙祀交汇", "七曲山庙志、善书与科举香会", "宋元明清跨传统层", { kind: "located", evidenceType: "historical-record" })
    ]
  }),
  place({
    key: "jiangwang-temple",
    title: "钟山蒋王庙与六朝建康",
    category: "mythic-geography",
    historicalLayer: "孙吴蒋侯立祠、六朝都城庙宇与钟山地名",
    summary: "蒋子文显灵故事依托的钟山与建康庙祀空间；蒋山、蒋王庙和后世钟山景观需按时代复原。",
    earliestSource: "《搜神记》卷五蒋子文条与六朝建康地志",
    sourceLocation: "钟山、蒋山地名记录及历代蒋王庙材料",
    domains: "建康、钟山、都城保护、地方庙祀与地名记忆",
    lead: "蒋子文的神格直接改动了城市地图：《搜神记》说孙吴立庙后，钟山转号蒋山。都城居民从此可以在山名、庙门和灾异故事中反复遇见蒋侯。",
    origin: "孙吴立祠的故事见《搜神记》，六朝地志和后世庙录补充庙址。古代钟山范围、蒋山称谓与今日景区边界不能简单重合。",
    development: "历朝建康、金陵城市建设改变庙宇位置和规模，蒋侯又获得王帝称号。某些旧庙毁废后，地名仍继续保存神的存在。",
    distinction: "钟山自然地理、蒋山历史地名、蒋王庙建筑和志怪中的神山是四个图层。蒋王庙也不等于南京所有城隍庙。",
    evidence: "采用地志、庙录和考古地理限定大致范围，不伪造孙吴庙宇平面。显灵路线只按文本相对位置描绘。",
    sourceList: ["《搜神记》卷五蒋子文条", "六朝建康地志与庙宇记录", "历代钟山、蒋山地名和蒋王庙材料"],
    use: "适合表现一位地方神如何改变都城地名。新增孙吴庙殿结构、阴司入口或山中巡逻路线须标项目原创。",
    sourceRef: "s:soushenji",
    sourceCitation: "《搜神记》卷五蒋子文条及六朝建康地志",
    sourceEvidenceType: "historical-record",
    institutionKey: "plague-protection",
    links: [
      link("f:jiang-ziwen", "地方神核心庙祀与山域", "《搜神记》及六朝地志", "孙吴六朝蒋侯信仰层", { kind: "located" }),
      link("x:city-god-system", "都城保护神祀的历史先例", "蒋王庙与后世城隍祀典对读", "六朝至明清城市保护层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable" }),
      link("x:land-deity-system", "土地神称谓的早期地方用例", "《搜神记》蒋子文自称土地神条", "六朝志怪称谓层", { evidenceType: "primary-text", confidence: "certain", notes: "此处土地神是文本自称，不等于后世福德正神标准像。" })
    ]
  }),
  place({
    key: "sizhou",
    title: "泗州城、普光王寺与僧伽塔",
    category: "mythic-geography",
    historicalLayer: "唐宋泗州佛教中心、淮河交通与清代洪泽湖水患",
    summary: "泗州大圣信仰的历史中心，寺塔依淮河交通扩散；旧城后来陷入洪泽湖水域，遗址与传说需分层。",
    earliestSource: "唐宋僧传、普光王寺与僧伽塔记录",
    sourceLocation: "泗州地方志、寺塔记、淮河水运与旧城水患材料",
    domains: "泗州旧城、僧伽塔、淮河、水路朝拜与沉城记忆",
    lead: "泗州大圣的香火曾围绕一座真正的淮河城市和寺塔展开。后来黄河夺淮、洪泽湖水势改变，泗州旧城逐渐被水吞没；分布各地的僧伽庙因此像一群替旧城保存名字的岸上坐标。",
    origin: "唐宋材料记录僧伽在泗州建寺、归葬和受封，水运让寺塔成为旅人熟知的节点。旧城位置要依历史地理与遗址资料确认。",
    development: "宋代分庙广布，明清水患改变泗州城市格局。沉城传说会夸大一夜消失，实际过程应结合河道变迁和历年灾害。",
    distinction: "泗州旧城、现行政区、普光王寺遗址与神话水下城不是一个对象。僧伽塔的舍利传说也不等于所有分庙都有同样遗物。",
    evidence: "地图用历史河道、城址和寺塔记构建年代图层，传说水下景观单列。现代水面坐标不直接代替唐宋街区。",
    sourceList: ["唐宋僧传与泗州寺塔记", "泗州地方志和淮河水运资料", "明清黄河夺淮、洪泽湖与旧城水患记录"],
    use: "适合写水路圣地从繁华到沉没的长期变化。新增完整水下寺城或神力沉城情节须标项目原创。",
    sourceRef: "s:songshi-shenci",
    sourceCitation: "唐宋泗州寺塔记、僧传与地方志",
    sourceEvidenceType: "historical-record",
    institutionKey: "three-teachings",
    links: [
      link("f:sizhou-dasheng", "历史僧伽与大圣信仰核心地", "唐宋僧传与泗州寺塔记", "唐宋泗州信仰层", { kind: "located" }),
      link("i:water-navigation", "淮河水路朝拜节点", "宋代水运、分庙与旅人记录", "宋代淮河交通层", { kind: "located", evidenceType: "historical-record" }),
      link("p:caoe-temple", "水域人物纪念地理比较", "泗州寺塔与曹娥江庙碑材料", "宋明水神地理比较层", { kind: "route", direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "只表示知识地图上的比较，不声称固定朝圣路线。" })
    ]
  }),
  place({
    key: "south-sea-temple",
    title: "广州南海神庙（波罗庙）",
    category: "mythic-geography",
    historicalLayer: "隋代建祠、唐宋国家海祭与明清港口庙宇",
    summary: "位于广州扶胥口一带的国家南海祭祀中心，碑刻、祭文、海贸遗物与地方洪圣诞共同叠出长期港口史。",
    earliestSource: "隋唐礼制与韩愈《南海神广利王庙碑》",
    sourceLocation: "历代南海神庙碑刻、祭文、地方志与港口地理",
    domains: "国家海祭、广州港、波罗诞、海贸与历代重修",
    lead: "南海神庙既面对海，也面对王朝。立夏官祭、远航商船、碑廊和地方庙会在扶胥口交叠，使这里不像一处封闭圣地，更像国家礼制与港口社会长期谈判的场所。",
    origin: "隋代立祠，唐代祭典和韩愈碑提供较早完整材料。扶胥口、黄木湾等古地名与现代海岸线需要历史地图转换。",
    development: "宋元明清不断加封、赐物与重修，庙中保存不同朝代祭文和海贸记忆。地方波罗诞让官祭空间进入民间节庆。",
    distinction: "南海神庙、广州港古岸线、洪圣地方庙和四海神话宫阙分别建图层。现存殿宇不是隋唐原建，海岸也已变化。",
    evidence: "碑刻和礼志确定庙史，历史地理校正古今岸线。海商传说和异物陈列只按记载时代呈现。",
    sourceList: ["韩愈《南海神广利王庙碑》", "历代南海神祭文与庙碑", "《广东新语》及广州港历史地理"],
    use: "适合写官员祭海、外来船队和地方庙会同日相遇。新增隋唐建筑复原、海神密室或不变海岸线须标项目原创或推测。",
    sourceRef: "s:mingqing-lizhi",
    sourceCitation: "韩愈《南海神广利王庙碑》及历代礼志南海神条",
    sourceEvidenceType: "material-evidence",
    institutionKey: "water-navigation",
    links: [
      link("f:hongsheng", "国家南海神核心庙宇", "韩愈庙碑及历代祭文", "隋唐至明清南海祀典层", { kind: "located" }),
      link("i:water-navigation", "港口与海运祭祀节点", "海贸、祭海与港口方志", "唐宋元明清广州港层", { kind: "located", evidenceType: "historical-record" }),
      link("p:meizhou", "沿海海神信仰节点比较", "南海神庙与妈祖祖庙材料对读", "宋元明清沿海信仰地理层", { kind: "route", direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "不声称两庙之间存在单一固定朝圣航线。" })
    ]
  }),
  place({
    key: "caoe-temple",
    title: "曹娥江、孝女庙与曹娥碑",
    category: "mythic-geography",
    historicalLayer: "东汉立碑、上虞地方纪念与历代江庙重修",
    summary: "曹娥传记落地的上虞江域，江名、孝女庙与反复重书的曹娥碑共同维持人物记忆。",
    earliestSource: "《后汉书·列女传》曹娥条与东汉立碑记忆",
    sourceLocation: "上虞地方志、孝女庙碑、曹娥碑重书与江道记录",
    domains: "曹娥江、孝女庙、碑刻、端午与水域地名",
    lead: "曹娥死后，纪念没有只停在一块碑上。县长改葬立碑，后人反复重书碑文，江水也逐渐以曹娥为名；一名少女由此同时存在于传记、书法、庙宇和地图。",
    origin: "《后汉书》明确上虞、投江、改葬和立碑。最初碑刻已不存，后世所见曹娥碑涉及重书与翻刻，不能当作东汉原石。",
    development: "孝女庙、江名和端午纪念不断强化地方认同，水利与城镇变化又改变庙前江道。碑文也因书法声名获得独立传播。",
    distinction: "曹娥江现代河段、东汉投江地点、孝女庙和各代碑刻是不同对象。碑文传承不意味着每块石刻都出自同一年代。",
    evidence: "人物地点依正史与地方志，碑刻按书写和翻刻年代标注，现代河道不假装保持东汉形态。",
    sourceList: ["《后汉书·列女传》曹娥传", "历代曹娥碑题记与重书", "上虞孝女庙、曹娥江地方志"],
    use: "适合写一块碑如何改变地名与地方记忆。新增东汉江岸建筑、精确投江点或水府入口须标项目原创。",
    sourceRef: "s:houhanshu-caoe",
    sourceCitation: "《后汉书》卷八十四曹娥传及历代曹娥碑记",
    sourceEvidenceType: "material-evidence",
    institutionKey: "water-navigation",
    links: [
      link("f:cao-e", "人物纪念、江名与庙祀中心", "《后汉书》曹娥传及地方碑志", "东汉以后上虞纪念层", { kind: "located" }),
      link("f:wu-zixu-tide-god", "吴越水域与端午人物并列", "地方岁时记与庙祀材料", "六朝以后吴越纪念层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable" }),
      link("i:water-navigation", "水域纪念与地方航路节点", "曹娥江地方志与水运记录", "宋明清浙东水路层", { kind: "located", evidenceType: "historical-record" })
    ]
  }),
];

const sourceRows = [
  source({
    key: "fengsu-tongyi",
    title: "《风俗通义》祀典与门禁材料",
    workType: "东汉风俗论著",
    formationPeriod: "东汉应劭编撰，今本有辑佚与传本问题",
    edition: "通行校本，参核类书引文",
    volumeSection: "祀典、怪神及神荼郁垒相关辑文",
    sourceLayer: "东汉风俗解释与后世辑佚层",
    historicalLayer: "东汉原书、残卷传承与类书保存引文",
    rightsStatus: "公版古籍；公开页使用书名、卷篇与项目自写释义",
    summary: "应劭讨论祀典、俗信与名物的著作，是早期门神、地方祠祀和礼俗批评的重要入口；佚文须注明保存来源。",
    earliestSource: "东汉应劭原著",
    sourceLocation: "今本《风俗通义》及《艺文类聚》《太平御览》等引文",
    domains: "风俗解释、祀典、门禁、神荼郁垒与地方信仰",
    lead: "《风俗通义》既记录习俗，也不断追问习俗为何成立。它常把民间说法、经典语句和作者判断放在一起，因此适合观察东汉知识人如何看待神祠，而不只是摘取一则奇谈。",
    origin: "原书在长期传抄中有散佚，今天有些名段依类书保存。凡不是今本连续正文的内容，项目在引用位置注明辑佚来源。",
    development: "后世讨论门神、桃符和淫祠时频繁引用应劭，原本具体语境也可能被压缩。页面不把后世转引自动当作东汉原句无误本。",
    distinction: "作者记录的俗信不等于作者全部赞同，类书引文也不等于完整章节。神荼郁垒材料与《山海经》归属问题另作传本说明。",
    evidence: "引用精确到篇目或辑文，异体字和人名保留校本差异。项目释义重新撰写，不复制现代百科说明。",
    sourceList: ["《风俗通义》通行校本", "《艺文类聚》相关引文", "《太平御览》门神与祀典辑文"],
    use: "适合作为汉代礼俗与后世岁时书的对照入口。创作时若补成完整度朔山故事，应标明所据后世版本。"
  }),
  source({
    key: "soushenji",
    title: "《搜神记》地方神与变形叙事",
    workType: "魏晋志怪汇编",
    formationPeriod: "东晋干宝编撰，今本经后世辑合",
    edition: "通行二十卷校本，参核类书引文",
    volumeSection: "卷五蒋子文、卷十四蚕马等条",
    sourceLayer: "六朝志怪叙事与今本重编层",
    historicalLayer: "东晋编撰、早期引文与后世二十卷本",
    rightsStatus: "公版古籍；公开页仅保留必要短引与项目自写整理",
    summary: "干宝志怪传统中关于蒋子文索祠、蚕女化蚕等故事的核心入口，也保存地方人如何解释灾异、神祠与物种起源。",
    earliestSource: "东晋干宝《搜神记》",
    sourceLocation: "今本卷五、卷十四及相关类书保存文本",
    domains: "志怪、地方神、灾异、变形、祭祀与六朝社会记忆",
    lead: "《搜神记》最有价值的地方，不只在“怪”，还在故事总要落到某座城、某个家或一项祭祀上。蒋子文索庙、蚕女化蚕，都把超自然变化写进现实制度和劳动生活。",
    origin: "干宝原书早佚，今本由后世材料重编，单条归属需参核类书和版本。项目不把所有题作《搜神记》的增补本混为东晋原编。",
    development: "蒋侯、蚕女、紫姑等故事被神谱、戏曲与地方庙志反复改写。后出姓名和封号只用于接受史。",
    distinction: "志怪叙事可以记录信仰，不等于灾害、变形真实发生。今本《搜神记》与《新刻出像增补搜神记》属于不同文本层。",
    evidence: "每条引用标卷次、人物和传本，较长原文不复制到公开页；释义保留叙事不适与矛盾，不用温情改写遮盖。",
    sourceList: ["今本《搜神记》二十卷", "《太平御览》等早期引文", "《新刻出像增补搜神记》作后世接受对照"],
    use: "适合提供六朝地方神叙事骨架。新增对白、地形或因果解释必须标项目原创改编。"
  }),
  source({
    key: "jingchu-suishiji",
    title: "《荆楚岁时记》",
    workType: "六朝岁时风俗记",
    formationPeriod: "南朝梁宗懔撰，后世注本传承",
    edition: "通行校注本，参核类书所引",
    volumeSection: "元日门神、腊日祭灶及荆楚岁时诸条",
    sourceLayer: "六朝荆楚风俗记录与后世注释层",
    historicalLayer: "南朝梁成书、隋唐注释及类书转引",
    rightsStatus: "公版古籍；公开页使用项目自写释义",
    summary: "按节令记录荆楚饮食、祭祀、禁忌与游戏，是门神、灶祭和驱疫习俗的重要时间坐标，但地域范围不能扩成全国。",
    earliestSource: "南朝梁宗懔《荆楚岁时记》",
    sourceLocation: "元日、腊日、端午等岁时条目",
    domains: "节令、家宅祭祀、门神、饮食、驱邪与地方习俗",
    lead: "《荆楚岁时记》把一年拆成一连串可以看见和品尝的动作：门上画神、庭中爆竹、节日饮食、祭灶与避忌。它提供的是六朝荆楚的生活节奏，不是永恒不变的“中国年俗清单”。",
    origin: "宗懔记录南方岁时，原书与后注在传本中相连。引用时区分正文、注引和后世类书摘要。",
    development: "唐宋以后节俗继续变化，后人常借此书证明某习俗“自古已有”。项目只在文本明确处使用，不用相似做法推定连续。",
    distinction: "荆楚地区记录不代表同时代全国，节日同名也不保证仪式相同。门神神荼郁垒与后世秦琼尉迟组合要分期。",
    evidence: "引用注明节日和正文层，现代节庆不倒灌。物品名称若有校勘争议，保留异说。",
    sourceList: ["《荆楚岁时记》通行校注本", "隋唐以来注释材料", "宋代《岁时广记》作后续对照"],
    use: "适合搭建六朝家庭的一年时间表。若将各朝风俗拼成同一天庆典，应标为项目原创混合设定。"
  }),
  source({
    key: "xuxuanguailu",
    title: "《续玄怪录·定婚店》",
    workType: "唐代传奇",
    formationPeriod: "唐李复言编撰，篇目传本有题名差异",
    edition: "通行《续玄怪录》及《续幽怪录》系统校本",
    volumeSection: "定婚店",
    sourceLayer: "唐传奇文本与后世月老接受层",
    historicalLayer: "中晚唐传奇、宋以后转述与婚姻神祠接受",
    rightsStatus: "公版古籍；公开页只使用必要情节和自写分析",
    summary: "韦固遇月下老人、见婚书赤绳并试图抗拒命定婚姻的传奇，是月下老人形象最重要的早期文本。",
    earliestSource: "唐李复言《续玄怪录》",
    sourceLocation: "定婚店篇",
    domains: "婚姻、命定、赤绳、唐传奇与月老信仰",
    lead: "《定婚店》并不是一则只讲甜美姻缘的故事。韦固得知未来妻子出身贫寒后，竟命人行刺幼女；十四年后真相重现，命定与人的傲慢一起成为篇章重点。",
    origin: "故事见《续玄怪录》系统，题作《续幽怪录》等传本需要互校。老人查书、囊藏赤绳和宋城题店构成核心。",
    development: "后世月老祠与婚恋图像从篇中抽取老人、婚书和赤绳，常淡化暴力与门第偏见。项目保留原故事复杂性。",
    distinction: "唐传奇人物不等于当时已有全国月老庙，后世签诗、红线墙和网络用语也不写回原篇。",
    evidence: "情节依校本重述，不大段复制原文。人物态度、婚姻制度与叙事伦理由项目另行分析。",
    sourceList: ["《续玄怪录》定婚店篇", "《续幽怪录》相关传本", "后世定婚店与月老祠记"],
    use: "适合讨论命运与选择的冲突。续写老人官署、改命条件或女方视角时须标项目原创改编。"
  }),
  source({
    key: "bu-bitan",
    title: "《补笔谈》钟馗画记",
    workType: "北宋笔记与旧画题记抄录",
    formationPeriod: "沈括《补笔谈》保存唐人题记与北宋赐像见闻",
    edition: "通行《梦溪笔谈》附《补笔谈》校本",
    volumeSection: "吴道子画钟馗及岁除赐像条",
    sourceLayer: "唐代题记传说、北宋目验与名字考辨层",
    historicalLayer: "唐代画记内容经北宋沈括保存",
    rightsStatus: "公版古籍；公开页使用短引与自写释义",
    summary: "保存唐玄宗梦钟馗、吴道子奉诏作画及宋代摹印赐像的重要材料，同时指出钟馗之名早于开元画记。",
    earliestSource: "北宋沈括所见宫中旧画题记",
    sourceLocation: "《补笔谈》钟馗条",
    domains: "钟馗、宫廷旧画、岁除赐像、名字考证与图像传播",
    lead: "沈括没有只抄一则神异梦，他还查看题记、记录宋代摹印赐像，并举出更早的人名说明“钟馗”未必始于唐玄宗。观察与怀疑同时存在，使这条笔记格外重要。",
    origin: "条文声称题记为唐人所作，但沈括处在北宋，所见是宫中旧画和题记传统。项目把题记内容与沈括目验分成两层。",
    development: "宋代赐像证明钟馗图已进入岁除制度，后世年画和戏曲继续放大。嫁妹等情节不在这条画记中。",
    distinction: "画记能证明传说和图像流行，不能证明唐玄宗梦境客观发生。钟馗名字更早出现也不等于那些同名者就是驱鬼神。",
    evidence: "引用保留沈括的质疑语气，图像若无存世原件不作造型细节复原。后世画本另建版本。",
    sourceList: ["《补笔谈》钟馗条", "北宋岁除赐像记录", "后世钟馗画题作图像接受对照"],
    use: "适合展示文人如何在记录怪谈时做考证。复原吴道子原画或梦境细节须标推测或原创。"
  }),
  source({
    key: "zitong-huashu",
    title: "《梓潼帝君化书》",
    workType: "道教降笔与神传文献",
    formationPeriod: "宋元以来文昌梓潼信仰汇编，收入《正统道藏》",
    edition: "《正统道藏》本及通行整理本",
    volumeSection: "序、九十七化及劝善诸章",
    sourceLayer: "文昌帝君宗教自传与劝善教化层",
    historicalLayer: "宋元文昌信仰整合与明代道藏保存",
    rightsStatus: "公版道教文献；公开页使用项目自写释义",
    summary: "以多世化身、禄籍与劝善组织文昌帝君身世的核心文本，反映梓潼地方神、道教教化和科举愿望的合流。",
    earliestSource: "宋元文昌梓潼降笔传统",
    sourceLocation: "《正统道藏》所收《梓潼帝君化书》",
    domains: "文昌、梓潼、化身、科名、禄籍与善恶劝诫",
    lead: "《化书》没有只讲张亚子一生，而是让帝君在九十七次变化中反复进入人间。多世叙事把忠孝、医药、科名和劝善收进同一声音，是宗教自传，不是普通历史年谱。",
    origin: "文献来自宋元降笔与文昌信仰整合，现见道藏本。各化身年代跨越极大，意在教化和证明神圣连续性。",
    development: "《化书》影响文昌善书、庙宇讲述和士人祈愿，也帮助梓潼神与文昌司禄神职结合。明代礼官仍对这一合流提出批评。",
    distinction: "书中第一人称不自动等于历史人物自述，九十七化也不能拆成九十七份已核官档。梓潼神与文昌星合流应另有制度证据。",
    evidence: "项目按章节概括，不复制现代注解；与唐宋梓潼庙记、元代封号和《明史·礼志》交叉核对。",
    sourceList: ["《正统道藏》本《梓潼帝君化书》", "唐宋梓潼神庙记", "《明史·礼志》梓潼帝君条"],
    use: "适合写神如何借多世经历劝善。采用具体化身故事时须注明《化书》，续造新化身必须标项目原创。"
  }),
  source({
    key: "sanjiao-soushen",
    title: "《三教源流搜神大全》",
    workType: "元明神谱与图像汇编",
    formationPeriod: "以元代神谱为基础，现传明代增补本，清末又有重刊",
    edition: "现传七卷绘图本，参核序跋与早期引书",
    volumeSection: "梓潼、五圣、赵元帅、紫姑、五瘟、灵官与海神诸卷",
    sourceLayer: "后期神谱整理与早期材料转引层",
    historicalLayer: "元明神谱编纂、坊刻增补与清末重刊",
    rightsStatus: "公版古籍；公开页不复制整段神传或现代网页说明",
    summary: "把儒释道人物与民间诸神并列成传、配图的重要神谱，能证明明代以后身份整理方式，但不可替代更早史传与科仪。",
    earliestSource: "元板画像搜神广记系统与明代增补本",
    sourceLocation: "现传《三教源流搜神大全》七卷及序跋",
    domains: "神谱、图像、三教并列、地方神、元帅神与后世传记",
    lead: "这部书像一座纸上的众神殿：孔子、佛僧、道教尊神、地方王侯和瘟神都被编进同一套卷帙。并列方式本身很有价值，却不能让其中每段身世都获得同等史料可信度。",
    origin: "现传本以元代神谱为基础，明代增补封号和人物，清末重刊序跋已指出坊刻杂入。每条传记须回查所引早期书。",
    development: "书中图像和简传影响后世神谱、年画与庙宇说明，也保存一些已佚材料线索。它更适合研究神格如何被整理，而非直接证明上古生平。",
    distinction: "书名中的三教并列不表示所有神都是三教共有，也不意味着同卷人物存在上下级。后序考辨与正文神传应分层。",
    evidence: "项目标出卷次、神名和版本层，重要事实另以正史、方志、科仪或碑志核实。无更早材料时保留“后出神谱说”。",
    sourceList: ["现传七卷《三教源流搜神大全》", "重刊序、后序的版本说明", "书中所引《舆地纪胜》、僧传与礼志线索"],
    use: "适合搭建明代神谱视角和图像参考。直接照搬全部生平会制造年代混乱，续写必须标明版本或原创。"
  }),
  source({
    key: "shiji-figures-commerce",
    title: "《史记》忠臣、吴越与货殖材料",
    workType: "西汉纪传体史书",
    formationPeriod: "西汉司马迁撰述，后世注本传承",
    edition: "中华书局点校本体系，参核三家注",
    volumeSection: "殷本纪、越王勾践世家、伍子胥列传、货殖列传",
    sourceLayer: "西汉历史叙事与后世神格接受的早期人物底本",
    historicalLayer: "先秦人物的西汉史传整理层",
    rightsStatus: "公版古籍；公开页只保留必要短引与自写释义",
    summary: "为比干、范蠡、伍子胥等后世神格提供人物底本；《史记》能证明早期史传形象，不能证明财神或潮神身份已同时成立。",
    earliestSource: "西汉司马迁《史记》",
    sourceLocation: "卷三、卷四十一、卷六十六、卷一百二十九",
    domains: "忠臣、吴越政治、商业人物、人物接受与后世神化边界",
    lead: "后世把比干请进财神殿、把伍子胥推入江潮、把范蠡尊为商圣时，都仍借用《史记》留下的人物骨架。最重要的工作，是不把后来神职塞回司马迁的章节。",
    origin: "《史记》依据更早传闻与文献整理先秦人物，本身也有叙事选择。三家注提供异文、地名和后世解释。",
    development: "小说、庙碑和行业祭祀不断从忠谏、投江、货殖中抽取新象征。人物底本与神格接受须分别引用。",
    distinction: "史传不是同时代档案，后世神号更不是《史记》原文。范蠡与西施、比干剖心细节、伍子胥潮神说均需跨文本比较。",
    evidence: "引用精确到卷与传，不大段复制原文；神职关系必须另有庙祀、图像或礼志证据。",
    sourceList: ["《史记·殷本纪》", "《史记·越王勾践世家》《伍子胥列传》", "《史记·货殖列传》及三家注"],
    use: "适合建立人物历史层。将三位人物安排在同一神谱会议或共享财神职权时，必须标项目原创改编。"
  }),
  source({
    key: "jiutangshu-sun",
    title: "《旧唐书·方伎传》孙思邈材料",
    workType: "五代纪传体史书中的人物传",
    formationPeriod: "后晋刘昫等编撰《旧唐书》",
    edition: "中华书局点校本体系",
    volumeSection: "卷一百九十一孙思邈传",
    sourceLayer: "历史医家传记与长寿传闻并存层",
    historicalLayer: "五代史官整理隋唐医家记忆",
    rightsStatus: "公版古籍；公开页使用项目自写整理",
    summary: "记录孙思邈隐居、医术、著书、辞召和高寿说，是药王历史人物层的主要入口，需与本人医书互校。",
    earliestSource: "《旧唐书》卷一百九十一",
    sourceLocation: "方伎传孙思邈条",
    domains: "孙思邈、生平、医学、隐居、著述与长寿传说",
    lead: "史传里的孙思邈已经带有传奇色彩：他屡辞官职，通晓医药，被后辈称叹，又仿佛活过远超常人的年岁。正因为史与传说贴得很近，才更需要用《千金方》补回他的著述声音。",
    origin: "《旧唐书》成书晚于孙思邈时代，所录生年和年龄有内在张力。传记仍是理解唐人、五代人如何记忆他的关键材料。",
    development: "宋元封号、药王庙和治虎故事在史传之外成长。后世神格不能拿来解释正史每一处异闻。",
    distinction: "方伎传不等于医学论文，长寿说不等于可核出生证明。历史医家与药王神像需要不同证据。",
    evidence: "项目将本传与《千金方》序论、新唐书异文及碑志互校，年龄保持争议，不给出伪精确结论。",
    sourceList: ["《旧唐书》卷一百九十一", "《备急千金要方》", "《新唐书》隐逸与方技相关材料"],
    use: "适合建立历史人物层和后世神化分界。新增医案、神方与寿命数字须标推测或原创。"
  }),
  source({
    key: "houhanshu-caoe",
    title: "《后汉书·列女传》曹娥材料",
    workType: "南朝纪传体史书中的列女传",
    formationPeriod: "南朝宋范晔编撰，记录东汉人物",
    edition: "中华书局点校本体系",
    volumeSection: "卷八十四孝女曹娥传",
    sourceLayer: "东汉地方记忆的南朝史传整理层",
    historicalLayer: "东汉事件、南朝成传与后世孝女庙接受",
    rightsStatus: "公版古籍；公开页使用必要短引与自写分析",
    summary: "记录曹娥寻父投江、抱尸浮出、改葬立碑等核心情节，是孝女历史层与曹娥江地名的主要文献入口。",
    earliestSource: "《后汉书》卷八十四",
    sourceLocation: "列女传曹娥条及注引碑记",
    domains: "曹娥、孝女、投江、立碑、地方纪念与列女书写",
    lead: "《后汉书》把曹娥写进列女传，让十四岁少女的死亡成为孝道范型。今天阅读这段文字，既要看见地方如何纪念她，也要看见古代伦理如何要求一个孩子承担无法挽回的责任。",
    origin: "范晔成书晚于东汉曹娥时代，传中又涉及早期立碑记忆。人物、碑刻和后世书法传本应分开核对。",
    development: "孝女庙、曹娥江和端午纪念从史传继续生长，水神形态不在本传中完整出现。后世封号须另查地方志。",
    distinction: "列女传的伦理赞颂不等于现代价值判断，抱尸浮出也不能用于还原水文。曹娥碑现存传本不是东汉原石。",
    evidence: "项目保留人物年龄、地点和立碑信息，同时以地方志、碑刻学区分后世纪念。分析文字为项目自写。",
    sourceList: ["《后汉书》卷八十四曹娥传", "曹娥碑历代重书材料", "上虞地方志与孝女庙志"],
    use: "适合建立曹娥历史层与地方记忆层。续写江中经历、父女对白或水府神职须标项目原创。"
  }),
  source({
    key: "songshi-shenci",
    title: "《宋史·礼志》神祠封赐材料",
    workType: "元代编纂的宋代制度史料",
    formationPeriod: "元至正年间修成《宋史》",
    edition: "中华书局点校本体系",
    volumeSection: "礼志神祠、岳渎、仙佛与地方小祠封赐条",
    sourceLayer: "宋代国家神祠治理的元代史志整理层",
    historicalLayer: "北宋南宋制度记录与元代编纂",
    rightsStatus: "公版史书；公开页使用项目自写概括",
    summary: "记录宋代对岳渎、城隍、龙神、仙佛和地方祠庙赐额加封的制度，是地方神进入国家认可网络的重要入口。",
    earliestSource: "宋代诏令、礼官文书与《宋史·礼志》汇编",
    sourceLocation: "礼志吉礼神祠相关卷",
    domains: "神祠、赐额、封爵、灵验奏报、地方庙祀与国家治理",
    lead: "宋代神祠制度像一道筛网：地方先有香火和显应奏报，官员再申报赐额、封爵或禁毁。制度并没有收尽天下小祠，《宋史》也坦言封赐之多不能尽录。",
    origin: "材料源自宋代制度，现由元修《宋史》整理。具体神祠仍需回查《宋会要》、地方志与碑刻。",
    development: "封号使地方神获得跨地区传播的官方语言，也可能改变庙宇竞争。未获封不等于没有信众，获封也不证明所有神迹。",
    distinction: "赐额、封夫人、封王和纳入常祀不是同一制度等级。礼志中的“仙佛山神龙神”是分类，不是固定天界部门。",
    evidence: "引用给出朝代、年号、神名与封号，地方神生平另查庙志。感应奏报作为制度理由，不作超自然事实判断。",
    sourceList: ["《宋史·礼志》神祠条", "《宋会要辑稿》礼与崇儒相关神祠材料", "宋代地方庙碑和方志"],
    use: "适合写地方庙如何争取朝廷认可。新增审批流程细节或神明亲自受封场景须标项目原创。"
  }),
  source({
    key: "yuanshi-jisi",
    title: "《元史·祭祀志》天妃与海运材料",
    workType: "明初编纂的元代制度史料",
    formationPeriod: "明洪武初修成《元史》",
    edition: "中华书局点校本体系",
    volumeSection: "祭祀志南海女神灵惠夫人、天妃致祭条",
    sourceLayer: "元代海运国家祭祀的明初史志整理层",
    historicalLayer: "元代漕运祭祀与明初编纂",
    rightsStatus: "公版史书；公开页使用项目自写释义",
    summary: "记载元代因海运显应加封天妃、遣使赍香与致祭祝文，是妈祖从地方夫人进入国家海运祭祀的关键证据。",
    earliestSource: "元代海运与祭祀文书",
    sourceLocation: "《元史·祭祀志》南海女神条及本纪遣祭记录",
    domains: "天妃、海运、漕粮、国家祭祀、封号与沿海庙宇",
    lead: "元代海运把江南漕粮送往北方，也把妈祖香火带进国家制度。《祭祀志》不只列一串封号，还记录遣使、祭品和祝文，让天妃与海运风险直接相连。",
    origin: "《元史》成书于明初，所记元代祭祀需与本纪、地方庙记互校。称“南海女神”是史志分类，不表示神籍来自南海神庙。",
    development: "元代天妃祭祀沿海运节点展开，为明清更广的使航、海防和天后封号提供制度基础。地方妈祖称谓仍继续存在。",
    distinction: "元史天妃不等于国家南海神，灵惠夫人与天妃是封号演变，不是两位神。祝文能证明官祭，不能验证每次显应。",
    evidence: "项目记录年号、封号和祭祀地点，不公开嵌入现代网页。莆田早期身世仍依宋代庙记。",
    sourceList: ["《元史·祭祀志》天妃条", "《元史》本纪海漕至直沽遣祭记录", "宋代莆田妈祖庙记作前期对照"],
    use: "适合建立国家海运与地方香火的连接。续写官船获救细节时必须注明原记或标项目原创。"
  }),
  source({
    key: "mingqing-lizhi",
    title: "《明史》《清史稿》地方神祠材料",
    workType: "明清礼制史志对读入口",
    formationPeriod: "清修《明史》与民国初《清史稿》分别整理两朝制度",
    edition: "中华书局点校本体系",
    volumeSection: "礼志神祠、关帝、文昌、真武、海神与地方祭祀相关条",
    sourceLayer: "明清国家礼制记录及编纂者评价层",
    historicalLayer: "明代制度的清代定稿与清代制度的近代史稿",
    rightsStatus: "公版史书；两书分开引用，不合成同一原典",
    summary: "用于核对关帝、梓潼文昌、南海神、天妃天后及其他地方神在明清国家礼制中的升降、争议和祭法。",
    earliestSource: "明清诏令、礼官议奏与史志汇编",
    sourceLocation: "《明史·礼志》《清史稿·礼志》相关卷",
    domains: "国家祀典、关帝、文昌、海神、封号、罢祀与礼官争论",
    lead: "礼志不仅告诉我们朝廷祭了谁，也保存“为什么不该祭”的争论。《明史》礼官批评梓潼与文昌星牵合，清代又提高关帝、天后等祭祀；赞成与反对共同画出国家正祀的边界。",
    origin: "《明史》与《清史稿》成书年代、体例和完成度不同，本页只提供并读入口。每条关系仍明确标注引用哪一部书。",
    development: "明清国家对地方神既可能加封，也可能裁撤祭典。政策变化影响庙宇声望，却不完全决定民间香火。",
    distinction: "《清史稿》是史稿，不与《明史》拥有相同编纂状态；两书也不能替代地方碑志。礼官批评不自动证明神祠消失。",
    evidence: "引用逐书、逐卷、逐朝代，封号保持原年代。项目释义不复制现代百科，也不把清代制度倒填明代。",
    sourceList: ["《明史·礼志》", "《清史稿·礼志》", "明清诏令、地方庙碑与会馆资料作互校"],
    use: "适合搭建国家与地方神祠的制度冲突。虚构礼官奏议或皇帝梦神必须标项目原创改编。"
  }),
];

function extraRelation(key, sourceRef, targetRef, label, sourceCitation, historicalScope, options = {}) {
  return { key, sourceRef, ...link(targetRef, label, sourceCitation, historicalScope, options) };
}

const extraRelationRows = [
  extraRelation("mazu-bixia-pilgrimage", "f:mazu", "f:bixia-yuanjun", "跨区域女神朝拜网络比较", "妈祖进香与泰山香社材料对读", "明清女神朝拜比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "一为沿海航运女神，一为泰山娘娘；香社结构相似不构成同神。" }),
  extraRelation("mazu-guandi-diaspora", "f:mazu", "f:guan-di", "移民会馆与港口庙宇常并见", "明清沿海会馆、关帝庙与天后宫碑记", "明清移民商业网络层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable", notes: "并见反映乡籍与行业组织，不设置夫妻、亲属或固定配祀。" }),
  extraRelation("bixia-linshui-protection", "f:bixia-yuanjun", "f:linshui-furen", "南北护产女神传统比较", "泰山娘娘庙与闽地临水宫材料对读", "明清护产信仰比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "生活需求相近，但神名、法脉和朝拜地各自独立。" }),
  extraRelation("wenchang-guandi-morality-books", "f:wenchang-dijun", "f:guan-di", "善书网络中的并列劝诫者", "明清文昌、关帝降笔善书与书坊版本", "明清善书传播层", { direction: "undirected", evidenceType: "textual-variant", confidence: "probable", notes: "同见善书不表示两神共同撰写或存在历史会面。" }),
  extraRelation("wenchang-confucius-school", "f:wenchang-dijun", "x:confucius", "学校空间并祀而礼制中心不同", "明清学校祀典、文昌祠与文庙材料", "明清教育祭祀层", { direction: "undirected", evidenceType: "ritual-record", notes: "孔子主祀属于文庙制度，文昌为科名神祠，不合并神位。" }),
  extraRelation("kuixing-confucius-education", "f:kuixing", "x:confucius", "魁星阁与文庙空间相邻", "明清书院、文庙与魁星阁地方志", "明清学校建筑层", { direction: "undirected", evidenceType: "material-evidence", confidence: "probable", notes: "空间相邻不说明魁星进入文庙四配哲贤序列。" }),
  extraRelation("zhongkui-five-plague", "f:zhongkui", "f:five-plague-envoys", "岁时驱鬼与社区送瘟相邻", "钟馗岁除图、五瘟科仪与岁时书", "宋明清驱邪礼俗比较层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable", notes: "钟馗不属于五瘟使者，关系只表示驱邪场景可相接。" }),
  extraRelation("gate-zaojun-household-calendar", "i:gate-new-year", "x:siming-zaojun", "家宅岁时祭祀前后相接", "《荆楚岁时记》、灶祭与门神年俗材料", "六朝至明清家宅年节层", { direction: "undirected", evidenceType: "ritual-record", notes: "门神守门与灶君奏事是不同仪式。" }),
  extraRelation("women-zigu-household", "i:women-life-cycle", "f:zigu", "妇女家庭占问与人生礼俗", "紫姑岁时、扶乩与家庭祭祀材料", "宋明清家庭信仰层", { kind: "member", evidenceType: "ritual-record", confidence: "probable", notes: "紫姑参与家庭生活，不因此成为婚育神谱固定成员。" }),
  extraRelation("medicine-women-protection", "i:medicine-birth", "i:women-life-cycle", "护产愿望连接医疗与人生礼俗", "临水夫人、保生大帝庙与家庭还愿材料", "明清护生实践层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable", notes: "两制度交叉不表示宗教祈愿替代医学。" }),
  extraRelation("sun-zhang-daoist-reception", "f:sun-simiao-yaowang", "x:zhang-daoling", "历史人物进入道教真人谱的不同路径", "唐史孙思邈传、天师谱与宋元道教封号", "宋元道教人物接受比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "两人不存在可证师承，关系只比较后世真人化。" }),
  extraRelation("baosheng-shennong-medicine", "f:baosheng-dadi", "x:shennong", "地方医神与本草始祖并祀", "闽南医神庙、药业会馆与本草传统", "明清医药行业层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable", notes: "共同医药职能不构成历史师徒。" }),
  extraRelation("linshui-mazu-fujian", "f:linshui-furen", "f:mazu", "福建女神香火随移民并行", "闽台宫庙分灵、地方志与移民记录", "明清福建移民信仰层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable", notes: "两位女神在部分社区并祀，但身世与祖庙不同。" }),
  extraRelation("zhao-jade-command", "f:zhao-gongming", "x:jade-emperor", "神谱中奉命任玄坛元帅", "《三教源流搜神大全》赵元帅", "明代神谱神职层", { kind: "controls", evidenceType: "textual-variant", confidence: "probable", notes: "奉命说属于后出神谱，不倒填为秦代历史官职。" }),
  extraRelation("bigan-guandi-loyalty", "f:bigan-caishen", "f:guan-di", "忠臣形象进入商业伦理", "明清忠义祠、关帝庙与财神年画", "明清忠义与商业信仰层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "忠义象征相近不构成同朝同僚或神谱上下级。" }),
  extraRelation("fanli-wuzixu-wuyue", "f:fanli-caishen", "f:wu-zixu-tide-god", "吴越政治叙事中的不同立场", "《史记》越王勾践世家、伍子胥列传", "春秋末吴越史传层", { direction: "undirected", evidenceType: "historical-record", notes: "关系限于吴越史事，不把后世财神与潮神身份带回。" }),
  extraRelation("guandi-confucius-civil-martial", "f:guan-di", "x:confucius", "文庙武庙并称的后世制度", "明清文庙、武庙与关帝祭祀记录", "明清国家与地方祀典层", { direction: "undirected", evidenceType: "ritual-record", notes: "文武并称是制度类比，不表示孔子与关帝同属一个神阶。" }),
  extraRelation("luban-wenchang-skill-writing", "f:luban", "f:wenchang-dijun", "技术师承与文运祈愿在会馆相邻", "工匠会馆、文昌祠与行业碑记", "明清城市行业层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable", notes: "鲁班管百工的说法不让文昌变成其文书官。" }),
  extraRelation("dukang-fanli-production-trade", "f:du-kang", "f:fanli-caishen", "酿造生产与商业典范相接", "酒业会馆、陶朱公祠与商帮材料", "明清酒业商业层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "行业共祀不构成师徒或合伙史实。" }),
  extraRelation("huaguang-guandi-temple", "f:huaguang-dadi", "f:guan-di", "南方庙宇中的护法武神并见", "明清华光庙、关帝庙与地方志", "明清南方庙祀层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable", notes: "并见不表示华光隶属于关帝。" }),
  extraRelation("wang-zhenwu-daoist-guard", "f:wang-lingguan", "x:zhenwu", "道观护法与北方尊神并祀", "明清道观像设、真武庙与灵官殿记录", "明清道教宫观层", { direction: "undirected", evidenceType: "ritual-record", confidence: "probable", notes: "具体殿序因宫观而异，不设置恒定直属关系。" }),
  extraRelation("wuxian-city-god", "f:wuxian-gods", "x:city-god-system", "地方五神与城市正祀并存", "宋明五显庙、城隍庙与地方志", "宋明清地方祀典层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable", notes: "同城并祀不等于五显成为城隍属官。" }),
  extraRelation("wutong-land-deity", "f:wutong-gods", "x:land-deity-system", "地方灵神与乡里境域祭祀相邻", "宋明地方五通祠与土地庙材料", "宋明清乡里信仰层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "地方保护职能相似不构成同神。" }),
  extraRelation("five-plague-city-god", "f:five-plague-envoys", "x:city-god-system", "城市瘟醮中可由城隍协调", "明清城隍出巡、瘟醮与送瘟科仪", "明清城市驱瘟仪式层", { kind: "controls", evidenceType: "ritual-record", confidence: "probable", notes: "只在部分地方仪式成立，不推广为全国天界编制。" }),
  extraRelation("wen-jiang-plague-protection", "f:wen-qiong", "f:jiang-ziwen", "驱瘟神将与疫灾地方神比较", "温元帅科仪与《搜神记》蒋子文疫灾叙事", "六朝志怪与明清驱瘟比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "两者时代和传统不同，不构成同一瘟部关系。" }),
  extraRelation("sizhou-mazu-water-routes", "f:sizhou-dasheng", "f:mazu", "内河与海运香火沿水路接续", "宋元分庙、水运与天妃海运祭祀材料", "宋元明水路信仰层", { direction: "undirected", evidenceType: "historical-record", confidence: "probable", notes: "关系表示交通传播，不设两神共同水府。" }),
  extraRelation("jiang-dongyue-underworld", "f:jiang-ziwen", "x:dongyue-emperor", "地方冥府职能与东岳体系后起相接", "六朝蒋王庙与宋元东岳冥府材料", "宋元以后冥府信仰比较层", { evidenceType: "textual-variant", confidence: "probable", notes: "早期蒋子文故事不见东岳大帝任命，连接属于后世神职整合。" }),
  extraRelation("wuzixu-guandi-loyalty", "f:wu-zixu-tide-god", "f:guan-di", "忠愤与忠义神格比较", "《史记》伍子胥传、关羽本传与明清祠祀", "明清忠臣神祀比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "伦理比较不构成同祀或同朝关系。" }),
  extraRelation("dragon-bixia-mother-goddesses", "f:dragon-mother", "f:bixia-yuanjun", "区域母神与女性朝拜比较", "岭南龙母庙、泰山娘娘庙与香会材料", "明清区域女神比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "probable", notes: "母神称谓与护生职能相近，不是同神异名。" }),
  extraRelation("hongsheng-hebo-water-cults", "f:hongsheng", "x:hebo", "国家海神与先秦河神文献比较", "韩愈南海神碑、《楚辞·河伯》《庄子·秋水》", "先秦河神与唐以后海神祀典比较层", { direction: "undirected", evidenceType: "scholarly-inference", confidence: "certain", notes: "水域与文献体系不同，不建立海河上下级。" })
];

function timeline(row) {
  const mythic = row.trackKey === "mythic-narrative";
  return {
    datePrecision: mythic ? "custom" : (row.datePrecision || "range"),
    startValue: mythic ? "" : String(row.startValue),
    endValue: mythic ? "" : String(row.endValue ?? row.startValue),
    ...row,
    ...(mythic ? { datePrecision: "custom", startValue: "", endValue: "" } : {})
  };
}

const eventRows = [
  timeline({
    key: "shentu-yulei-inspect-ghosts",
    trackKey: "mythic-narrative",
    title: "神荼与郁垒在桃树下检阅百鬼",
    summary: "度朔山大桃树下，两位守门神辨认害人之鬼，以苇索执送虎食；这则早期门禁叙事后来进入桃符和门画传统。",
    displayDate: "度朔山桃树覆盖鬼门的神话之时",
    era: "门禁驱鬼神圣叙事层",
    sortOrder: 520,
    primaryRef: "f:shentu",
    referenceRefs: ["f:shentu", "f:yulei", "s:fengsu-tongyi", "i:gate-new-year"]
  }),
  timeline({
    key: "silkworm-maiden-transforms",
    trackKey: "mythic-narrative",
    title: "蚕女被马皮卷上桑树而化蚕",
    summary: "少女失言许婚，父亲杀马，马皮忽然卷走少女并停在桑树；六朝志怪借这场变形解释蚕形、食桑与缫丝。",
    displayDate: "人间尚在讲述蚕桑起源的神话之时",
    era: "蚕桑起源志怪叙事层",
    sortOrder: 522,
    primaryRef: "f:cannu",
    referenceRefs: ["f:cannu", "s:soushenji", "x:leizu", "i:craft-guild"]
  }),
  timeline({
    key: "old-man-moon-red-cord",
    trackKey: "mythic-narrative",
    title: "月下老人翻检婚书并以赤绳系足",
    summary: "韦固在月下遇见携书老人，得知婚姻名册和赤绳早已相连；故事以多年后的相认收束，却不把自由婚姻都解释成不可改变的命定。",
    displayDate: "韦固夜过宋城旅舍的传说之时",
    era: "唐人婚姻志怪叙事层",
    sortOrder: 524,
    primaryRef: "f:yuelao",
    referenceRefs: ["f:yuelao", "s:xuxuanguailu", "i:women-life-cycle"]
  }),
  timeline({
    key: "zhongkui-devours-ghosts",
    trackKey: "mythic-narrative",
    title: "钟馗在梦中捉鬼并守护岁暮",
    summary: "唐宋笔记把钟馗画的来历安在一场梦里：大鬼擒住小鬼，掐目吞食，自称愿为帝王除尽虚耗；后世画师再把他带入端午和岁除。",
    displayDate: "帝王梦见钟馗捉鬼的传说之时",
    era: "钟馗赐像神圣叙事层",
    sortOrder: 526,
    primaryRef: "f:zhongkui",
    referenceRefs: ["f:zhongkui", "s:bu-bitan", "i:gate-new-year"]
  }),
  timeline({
    key: "zhao-gongming-appointed-xuantan",
    trackKey: "mythic-narrative",
    title: "赵公明奉命执掌玄坛与赏罚",
    summary: "明代神谱与后来小说把赵公明写进神将任命场景，玄坛由驱邪法职渐与迎祥纳福相接；这是后出神圣叙事，不是秦汉官署档案。",
    displayDate: "神谱编排玄坛元帅职掌的神圣叙事之时",
    era: "明代以后玄坛神谱叙事层",
    sortOrder: 528,
    primaryRef: "f:zhao-gongming",
    referenceRefs: ["f:zhao-gongming", "s:sanjiao-soushen", "x:jade-emperor", "i:wealth-commerce"]
  }),

  timeline({
    key: "fengsu-tongyi-records-door-cults",
    trackKey: "textual-evidence",
    title: "《风俗通义》整理祀典与门禁旧说",
    summary: "应劭把经典语句、地方俗信和自己的辨析写在一起，留下东汉知识人观察神荼郁垒、祠祀和怪神的重要入口；辑佚段仍须标出保存来源。",
    displayDate: "约二世纪末",
    era: "东汉风俗论著成书层",
    sortOrder: 530,
    primaryRef: "s:fengsu-tongyi",
    referenceRefs: ["s:fengsu-tongyi", "f:shentu", "f:yulei", "i:gate-new-year"],
    startValue: "180",
    endValue: "200"
  }),
  timeline({
    key: "soushenji-local-gods",
    trackKey: "textual-evidence",
    title: "《搜神记》保存蒋子文与蚕女异闻",
    summary: "干宝所编志怪把地方祠祀、疫灾记忆和变形故事纳入同一书中；蒋子文与蚕女两篇因此可互见，但不能被拼成同一神谱。",
    displayDate: "约四世纪上半叶",
    era: "东晋志怪编纂层",
    sortOrder: 532,
    primaryRef: "s:soushenji",
    referenceRefs: ["s:soushenji", "f:jiang-ziwen", "f:cannu", "p:jiangwang-temple"],
    startValue: "317",
    endValue: "350"
  }),
  timeline({
    key: "jingchu-new-year-customs",
    trackKey: "textual-evidence",
    title: "《荆楚岁时记》记录元日画门神",
    summary: "宗懔把荆楚一带岁时活动按月日排写，元日门画、桃板和饮食由此得到可定位的六朝文本坐标，后世全国年俗不能全部倒填进本书。",
    displayDate: "约六世纪中叶",
    era: "南朝岁时书成书层",
    sortOrder: 534,
    primaryRef: "s:jingchu-suishiji",
    referenceRefs: ["s:jingchu-suishiji", "i:gate-new-year", "f:shentu", "f:yulei"],
    startValue: "520",
    endValue: "560"
  }),
  timeline({
    key: "dinghun-dian-tale",
    trackKey: "textual-evidence",
    title: "《定婚店》把婚书与赤绳写成完整志怪",
    summary: "唐人故事让韦固在宋城遇见月下老人，又以多年后的婚姻结果回扣旧言；文本证明故事流传，不证明婚姻真有可查天籍。",
    displayDate: "约九世纪",
    era: "唐人传奇编纂层",
    sortOrder: 536,
    primaryRef: "s:xuxuanguailu",
    referenceRefs: ["s:xuxuanguailu", "f:yuelao", "i:women-life-cycle"],
    startValue: "800",
    endValue: "850"
  }),
  timeline({
    key: "bupitan-preserves-zhongkui",
    trackKey: "textual-evidence",
    title: "《补笔谈》保存钟馗画题与赐像旧闻",
    summary: "沈括转录钟馗画题与宫廷旧说，使唐代赐像叙事在北宋获得清楚书面坐标；画题的传承层和唐代事件本身仍须分开。",
    displayDate: "约十一世纪末",
    era: "北宋笔记保存层",
    sortOrder: 538,
    primaryRef: "s:bu-bitan",
    referenceRefs: ["s:bu-bitan", "f:zhongkui", "i:gate-new-year"],
    startValue: "1080",
    endValue: "1095"
  }),
  timeline({
    key: "wenchang-huashu-compiled",
    trackKey: "textual-evidence",
    title: "《梓潼帝君化书》汇成文昌本行",
    summary: "宋元间的化书把梓潼地方神、累世化身和劝善报应编成连贯传记，拓宽了文昌信仰的叙事，却不能替代更早庙记与封号。",
    displayDate: "约十三世纪",
    era: "宋元文昌道书编纂层",
    sortOrder: 540,
    primaryRef: "s:zitong-huashu",
    referenceRefs: ["s:zitong-huashu", "f:wenchang-dijun", "p:qiqushan"],
    startValue: "1200",
    endValue: "1300"
  }),
  timeline({
    key: "yuanshi-records-tianfei",
    trackKey: "textual-evidence",
    title: "《元史·祭祀志》整理天妃海运祭祀",
    summary: "明初史官把元代封号、遣祭和漕运材料编入礼志，为妈祖进入国家海运祀典留下制度证据；显应故事仍按奏报语境阅读。",
    displayDate: "1370年",
    era: "明初元代制度史编纂层",
    sortOrder: 542,
    primaryRef: "s:yuanshi-jisi",
    referenceRefs: ["s:yuanshi-jisi", "f:mazu", "p:meizhou", "i:water-navigation"],
    datePrecision: "year",
    startValue: "1370",
    endValue: "1370"
  }),
  timeline({
    key: "sanjiao-soushen-recension",
    trackKey: "textual-evidence",
    title: "现传《三教源流搜神大全》形成明代增补面貌",
    summary: "现传本把佛、道、儒家圣贤与地方神将并列成册，保留丰富图像线索，也混入多层神传；每则身世仍须回查更早材料。",
    displayDate: "约十五至十六世纪",
    era: "明代神谱增补与刊刻层",
    sortOrder: 544,
    primaryRef: "s:sanjiao-soushen",
    referenceRefs: ["s:sanjiao-soushen", "i:three-teachings", "f:zhao-gongming", "f:wen-qiong"],
    startValue: "1450",
    endValue: "1600"
  }),
  timeline({
    key: "mingshi-local-cults-compiled",
    trackKey: "textual-evidence",
    title: "《明史·礼志》定稿地方神祠评议",
    summary: "清代史官汇整明代文昌、真武、关帝、海神与地方神祠材料，既保存加封，也保存礼官反对意见；编纂年代与所记制度年代不可混写。",
    displayDate: "1739年",
    era: "清代明史定稿层",
    sortOrder: 546,
    primaryRef: "s:mingqing-lizhi",
    referenceRefs: ["s:mingqing-lizhi", "f:wenchang-dijun", "f:guan-di", "f:hongsheng"],
    datePrecision: "year",
    startValue: "1739",
    endValue: "1739"
  }),
  timeline({
    key: "qingshigao-local-cults-published",
    trackKey: "textual-evidence",
    title: "《清史稿》刊行并汇录清代神祠制度",
    summary: "《清史稿》为关帝、天后等清代祭祀留下集中入口，但其史稿性质和编纂局限必须明示，不能与官修正史完成状态混同。",
    displayDate: "1927年至1928年",
    era: "近代清史稿刊行层",
    sortOrder: 548,
    primaryRef: "s:mingqing-lizhi",
    referenceRefs: ["s:mingqing-lizhi", "f:guan-di", "f:mazu", "i:water-navigation"],
    startValue: "1927",
    endValue: "1928"
  }),

  timeline({
    key: "sui-south-sea-temple",
    trackKey: "religious-institutions",
    title: "隋代在广州扶胥镇建南海神祠",
    summary: "国家海神祭祀在珠江口形成固定礼仪节点，唐宋以后使臣、商船和地方社会继续扩充祠宇；现存建筑是历代重修结果。",
    displayDate: "594年",
    era: "隋代国家海神祀典层",
    sortOrder: 550,
    primaryRef: "p:south-sea-temple",
    referenceRefs: ["p:south-sea-temple", "f:hongsheng", "i:water-navigation"],
    datePrecision: "year",
    startValue: "594",
    endValue: "594"
  }),
  timeline({
    key: "sengqie-sizhou-cult",
    trackKey: "religious-institutions",
    title: "僧伽示寂后泗州塔寺成为香火中心",
    summary: "僧伽在泗州活动并于唐景龙年间示寂，塔寺、舍利与水路传播让历史僧人逐步获得泗州大圣称号，化身说属于后起接受。",
    displayDate: "约710年以后",
    era: "唐宋泗州僧伽信仰形成层",
    sortOrder: 552,
    primaryRef: "p:sizhou",
    referenceRefs: ["p:sizhou", "f:sizhou-dasheng", "x:avalokitesvara", "i:water-navigation"],
    startValue: "710",
    endValue: "1000"
  }),
  timeline({
    key: "song-wuxian-titles",
    trackKey: "religious-institutions",
    title: "宋代五显祠屡获赐额加封",
    summary: "地方五神在宋代灵验奏报与敕封制度中扩大声名，同名、五通与五显仍须按庙址和文书逐案消歧。",
    displayDate: "约十二世纪初",
    era: "北宋地方神祠封赐层",
    sortOrder: 554,
    primaryRef: "f:wuxian-gods",
    referenceRefs: ["f:wuxian-gods", "s:songshi-shenci", "x:city-god-system", "i:three-teachings"],
    startValue: "1100",
    endValue: "1127"
  }),
  timeline({
    key: "song-mazu-title",
    trackKey: "religious-institutions",
    title: "南宋封号推动妈祖进入跨港口祀典",
    summary: "莆田地方女神在南宋获得夫人封号，海商、使船和沿海庙宇借共同名号扩大香火；封号并未抹去各港口自己的庙史。",
    displayDate: "约1156年以后",
    era: "南宋妈祖封号扩展层",
    sortOrder: 556,
    primaryRef: "f:mazu",
    referenceRefs: ["f:mazu", "p:meizhou", "i:water-navigation", "s:yuanshi-jisi"],
    startValue: "1156",
    endValue: "1277"
  }),
  timeline({
    key: "yuan-tianfei-sea-transport",
    trackKey: "religious-institutions",
    title: "元代天妃祭祀与海运粮道相连",
    summary: "朝廷以天妃封号、遣祭和祝文回应漕粮海运风险，地方香火由此进入国家交通制度，却不能据封号验证每一则海上显应。",
    displayDate: "1278年至1368年",
    era: "元代海运国家祭祀层",
    sortOrder: 558,
    primaryRef: "i:water-navigation",
    referenceRefs: ["i:water-navigation", "f:mazu", "s:yuanshi-jisi", "p:meizhou"],
    startValue: "1278",
    endValue: "1368"
  }),
  timeline({
    key: "yuan-wenchang-imperial-title",
    trackKey: "religious-institutions",
    title: "元代加封梓潼神为文昌帝君",
    summary: "梓潼地方神、文昌星名和士人科名愿望在元代封号中进一步合流，七曲山仍保留其地方信仰根基。",
    displayDate: "1316年",
    era: "元代文昌国家封号层",
    sortOrder: 560,
    primaryRef: "f:wenchang-dijun",
    referenceRefs: ["f:wenchang-dijun", "p:qiqushan", "s:zitong-huashu", "x:beidou-system"],
    datePrecision: "year",
    startValue: "1316",
    endValue: "1316"
  }),
  timeline({
    key: "ming-bixia-court-offerings",
    trackKey: "religious-institutions",
    title: "明代宫廷遣祭与民间朝山共同扩张碧霞信仰",
    summary: "碧霞元君在泰山香社、求子还愿和宫廷遣祭之间获得广泛声望，国家岳祭与娘娘香会共享山体而不合并礼制。",
    displayDate: "约十六世纪上半叶",
    era: "明代泰山女神朝拜层",
    sortOrder: 562,
    primaryRef: "f:bixia-yuanjun",
    referenceRefs: ["f:bixia-yuanjun", "p:taishan-bixia", "x:dongyue-emperor", "s:mingqing-lizhi"],
    startValue: "1500",
    endValue: "1550"
  }),
  timeline({
    key: "mingqing-guild-founder-rites",
    trackKey: "religious-institutions",
    title: "行业会馆把祖师祭祀写进师徒与同行规矩",
    summary: "木作、酒业、医药和商帮以共同祖师维系行规、募捐与信用，不同行业即使共用一座会馆，也不会自动共享祖师谱。",
    displayDate: "约1500年至1850年",
    era: "明清城市行业组织层",
    sortOrder: 564,
    primaryRef: "i:craft-guild",
    referenceRefs: ["i:craft-guild", "f:luban", "f:du-kang", "i:wealth-commerce"],
    startValue: "1500",
    endValue: "1850"
  }),
  timeline({
    key: "ming-guandi-imperial-title",
    trackKey: "religious-institutions",
    title: "晚明帝号扩展关羽的关帝形态",
    summary: "明代后期加封把忠臣、武神、护法与地方庙祀纳入更高尊号，商帮财神接受仍由会馆、誓约和图像另行推动。",
    displayDate: "1614年",
    era: "晚明关帝加封层",
    sortOrder: 566,
    primaryRef: "f:guan-di",
    referenceRefs: ["f:guan-di", "x:guanyu-garland", "i:wealth-commerce", "s:mingqing-lizhi"],
    datePrecision: "year",
    startValue: "1614",
    endValue: "1614"
  }),
  timeline({
    key: "qing-tianhou-coastal-rites",
    trackKey: "religious-institutions",
    title: "清初天后封号扩大沿海国家祭祀",
    summary: "清廷在海疆秩序、使航与地方报功中提升妈祖封号，天后宫与移民社群一同扩展；地方祖庙叙事并未因此变成单一官方版本。",
    displayDate: "1684年以后",
    era: "清代天后国家祭祀层",
    sortOrder: 568,
    primaryRef: "f:mazu",
    referenceRefs: ["f:mazu", "i:water-navigation", "p:meizhou", "s:mingqing-lizhi"],
    startValue: "1684",
    endValue: "1908"
  }),
  timeline({
    key: "mingqing-plague-processions",
    trackKey: "religious-institutions",
    title: "瘟醮、巡境与送瘟形成社区协作仪式",
    summary: "沿海与城市社区以清醮、出巡、王船和送瘟处理疫灾焦虑，五瘟、温元帅、城隍及地方主神的组合随地区而变。",
    displayDate: "约1600年至1900年",
    era: "明清社区驱瘟仪式层",
    sortOrder: 570,
    primaryRef: "i:plague-protection",
    referenceRefs: ["i:plague-protection", "f:five-plague-envoys", "f:wen-qiong", "x:city-god-system"],
    startValue: "1600",
    endValue: "1900"
  }),
  timeline({
    key: "qing-guandi-major-sacrifice",
    trackKey: "religious-institutions",
    title: "晚清关帝祭祀升格并进入文武并称格局",
    summary: "关帝在清代国家祀典中继续升格，武庙与文庙被并称讨论；这种制度类比不把关帝写成孔门人物，也不覆盖民间财神身份。",
    displayDate: "约1856年前后",
    era: "晚清关帝国家祭祀升格层",
    sortOrder: 572,
    primaryRef: "f:guan-di",
    referenceRefs: ["f:guan-di", "x:confucius", "i:wealth-commerce", "s:mingqing-lizhi"],
    startValue: "1856",
    endValue: "1856"
  }),

  timeline({
    key: "door-gods-image-transition",
    trackKey: "cult-evolution",
    title: "门神从桃木神人扩展为钟馗与武将组合",
    summary: "门禁功能保持稳定，图像却从桃人、神荼郁垒转向钟馗和多种武将；印刷让新组合扩散，却没有消灭地方旧样。",
    displayDate: "约600年至1600年",
    era: "六朝至明代门神图像演变层",
    sortOrder: 574,
    primaryRef: "i:gate-new-year",
    referenceRefs: ["i:gate-new-year", "f:shentu", "f:zhongkui", "f:qin-yuchi-door-gods"],
    startValue: "600",
    endValue: "1600"
  }),
  timeline({
    key: "wenchang-star-zitong-exams",
    trackKey: "cult-evolution",
    title: "梓潼神、文昌星名与科举愿望逐步合流",
    summary: "地方祠神沿蜀道传播，士人把功名愿望投向文昌名号，化书和国家封号再把多层来路编成较稳定的帝君形态。",
    displayDate: "约1000年至1350年",
    era: "宋元文昌信仰合流层",
    sortOrder: 576,
    primaryRef: "f:wenchang-dijun",
    referenceRefs: ["f:wenchang-dijun", "p:qiqushan", "s:zitong-huashu", "x:beidou-system"],
    startValue: "1000",
    endValue: "1350"
  }),
  timeline({
    key: "zhao-gongming-wealth-god",
    trackKey: "cult-evolution",
    title: "赵公明由玄坛神将进入财神图像",
    summary: "玄坛的驱邪、执法和迎祥职能在神谱、小说、科仪与年画中重新组合，赵公明遂成为常见武财神；变化没有一个全国同步年份。",
    displayDate: "约1300年至1800年",
    era: "元明清玄坛财神接受层",
    sortOrder: 578,
    primaryRef: "f:zhao-gongming",
    referenceRefs: ["f:zhao-gongming", "i:wealth-commerce", "s:sanjiao-soushen", "x:liu-haichan"],
    startValue: "1300",
    endValue: "1800"
  }),
  timeline({
    key: "guanyu-loyalty-protector-wealth",
    trackKey: "cult-evolution",
    title: "关羽由忠臣记忆扩展为关帝、护法与财神",
    summary: "史传忠臣、地方显灵、佛寺护法、道教神职和商帮信用依次叠加在关羽身上；各形态相连，却不能互相充当最早证据。",
    displayDate: "约1000年至1800年",
    era: "宋元明清关羽多传统接受层",
    sortOrder: 580,
    primaryRef: "f:guan-di",
    referenceRefs: ["f:guan-di", "x:guanyu-garland", "i:wealth-commerce", "s:mingqing-lizhi"],
    startValue: "1000",
    endValue: "1800"
  }),
  timeline({
    key: "mazu-local-to-maritime-state",
    trackKey: "cult-evolution",
    title: "妈祖由莆田女神扩展为海运天妃天后",
    summary: "地方庙记、宋元封号、海运祭祀和移民分灵共同扩大妈祖信仰；每一层都留下自己的称谓和用途，不宜压成一条无缝神传。",
    displayDate: "约1100年至1700年",
    era: "宋元明清妈祖扩展层",
    sortOrder: 582,
    primaryRef: "f:mazu",
    referenceRefs: ["f:mazu", "p:meizhou", "i:water-navigation", "s:yuanshi-jisi"],
    startValue: "1100",
    endValue: "1700"
  }),
  timeline({
    key: "sengqie-sizhou-avalokitesvara",
    trackKey: "cult-evolution",
    title: "僧伽由历史僧人进入泗州大圣与观音化身传统",
    summary: "塔寺、舍利、感应录与水路香火把僧伽塑造成泗州大圣，部分文本又以观音化身解释其神异；后起解释不删除历史僧人层。",
    displayDate: "约700年至1200年",
    era: "唐宋僧伽神圣化层",
    sortOrder: 584,
    primaryRef: "f:sizhou-dasheng",
    referenceRefs: ["f:sizhou-dasheng", "p:sizhou", "x:avalokitesvara", "i:three-teachings"],
    startValue: "700",
    endValue: "1200"
  }),
  timeline({
    key: "caoe-daughter-to-river-memory",
    trackKey: "cult-evolution",
    title: "曹娥由孝女史传进入江神与地方纪念",
    summary: "列女传、碑刻、孝女庙和江名让曹娥记忆跨越朝代，部分地方祭祀再赋予水上护佑；水神职掌不应倒填进东汉传记。",
    displayDate: "约150年至1600年",
    era: "东汉至明代曹娥地方接受层",
    sortOrder: 586,
    primaryRef: "f:cao-e",
    referenceRefs: ["f:cao-e", "p:caoe-temple", "s:houhanshu-caoe", "i:water-navigation"],
    startValue: "150",
    endValue: "1600"
  }),
  timeline({
    key: "shared-temples-morality-books",
    trackKey: "cult-evolution",
    title: "同庙并祀与善书传播重组三教神谱",
    summary: "寺观、会馆和社区庙宇让不同来路的神同处一院，善书与神谱又在纸面上重新排座；空间相邻和文本并列都不等于同一教义来源。",
    displayDate: "约1200年至1900年",
    era: "宋元明清三教合流实践层",
    sortOrder: 588,
    primaryRef: "i:three-teachings",
    referenceRefs: ["i:three-teachings", "s:sanjiao-soushen", "f:wenchang-dijun", "f:guan-di"],
    startValue: "1200",
    endValue: "1900"
  })
];

function normalizeHistoricalLayer(value) {
  const text = String(value || "");
  if (/明|清/.test(text) && !/先秦|春秋|战国|汉|唐|宋|元/.test(text)) return "明清";
  if (/宋|元/.test(text) && !/先秦|春秋|战国|汉|唐|明|清/.test(text)) return "宋元";
  if (/隋|唐/.test(text) && !/先秦|春秋|战国|汉|宋|元|明|清/.test(text)) return "隋唐";
  if (/魏晋|六朝/.test(text) && !/先秦|春秋|战国|汉|唐|宋|元|明|清/.test(text)) return "魏晋六朝";
  if (/汉|秦汉/.test(text) && !/先秦|春秋|战国|唐|宋|元|明|清/.test(text)) return "两汉文献层";
  if (/西周|春秋|战国|先秦/.test(text) && !/汉|唐|宋|元|明|清|后世|历代/.test(text)) return "先秦文献层";
  return "跨时期";
}

function sourceWorkType(row) {
  if (row.key === "fengsu-tongyi") return "先秦两汉古籍";
  if (["soushenji", "jingchu-suishiji", "xu-xuanguailu"].includes(row.key)) return "魏晋六朝及隋唐古籍";
  if (["wenchang-huashu", "sanjiao-soushen"].includes(row.key)) return "道经";
  return "史书与礼志";
}

function sourceLayer(row) {
  if ([
    "shiji-figures-commerce",
    "jiutangshu-sun",
    "houhanshu-caoe",
    "songshi-shenci",
    "yuanshi-jisi",
    "mingqing-lizhi"
  ].includes(row.key)) return "史料记录";
  return "原文";
}

function relationFromLink(prefix, sourceRef, item, index) {
  return {
    key: `${prefix}-${index + 1}`,
    sourceRef,
    ...item
  };
}

const figureMembershipRows = figureRows.map((row) => extraRelation(
  `figure-institution-${row.key}`,
  `f:${row.key}`,
  `i:${row.institutionKey}`,
  "主要信仰与社会实践入口",
  row.sourceCitation,
  row.historicalLayer,
  {
    kind: "member",
    evidenceType: row.sourceEvidenceType || "historical-record",
    confidence: "certain",
    notes: "归类只帮助读者进入相关祭祀与社会实践，不把同组神祇写成固定天界编制。"
  }
));

const figureLinkRows = figureRows.flatMap((row) => row.links.map((item, index) => (
  relationFromLink(`figure-${row.key}`, `f:${row.key}`, item, index)
)));
const institutionLinkRows = institutionRows.flatMap((row) => row.links.map((item, index) => (
  relationFromLink(`institution-${row.key}`, `i:${row.key}`, item, index)
)));
const locationLinkRows = locationRows.flatMap((row) => row.links.map((item, index) => (
  relationFromLink(`location-${row.key}`, `p:${row.key}`, item, index)
)));
const semanticRelationRows = [
  ...figureMembershipRows,
  ...figureLinkRows,
  ...institutionLinkRows,
  ...locationLinkRows,
  ...extraRelationRows
];

function externalRefs(worldId) {
  const id = (batch, key) => `entity:${worldId}:mythology:${batch}:${key}`;
  return new Map([
    ["avalokitesvara", id("buddhism-transmission", "avalokitesvara")],
    ["beidou-system", id("daoism-celestial", "beidou-nine-emperors")],
    ["city-god-system", id("daoism-celestial", "city-god-system")],
    ["confucius", id("confucian-rites", "confucius")],
    ["dongyue-emperor", id("daoism-celestial", "dongyue-emperor")],
    ["dragon-girl", id("buddhism-devotion", "dragon-girl-lotus")],
    ["emperors-temple", id("confucian-rites", "emperors-temple")],
    ["guanyin-lineage", id("buddhism-devotion", "guanyin-image-lineages")],
    ["guanyu-garland", id("buddhism-devotion", "guanyu-garland")],
    ["hebo", id("nature-pantheon", "hebo")],
    ["houtu", id("daoism-celestial", "houtu-sovereign")],
    ["jade-emperor", id("daoism-celestial", "jade-emperor")],
    ["land-deity-system", id("daoism-celestial", "land-deity-system")],
    ["leizu", id("civilization-lineages", "leizu")],
    ["liu-haichan", id("daoism-lineages", "liu-haichan")],
    ["mount-tai", id("daoism-celestial", "mount-tai")],
    ["shennong", id("ancient-core", "shennong")],
    ["siming-zaojun", id("daoism-celestial", "siming-zaojun")],
    ["thunder-department", id("daoism-celestial", "thunder-department")],
    ["zhang-daoling", id("daoism-early", "zhang-daoling")],
    ["zhenwu", id("daoism-celestial", "zhenwu-emperor")]
  ]);
}

function resolveRef(reference, worldId) {
  const separator = reference.indexOf(":");
  const scope = reference.slice(0, separator);
  const key = reference.slice(separator + 1);
  if (scope === "f" || scope === "i" || scope === "p") return folkEntityId(key, worldId);
  if (scope === "s") return folkSourceId(key, worldId);
  if (scope === "x") {
    const resolved = externalRefs(worldId).get(key);
    if (resolved) return resolved;
  }
  throw new Error(`未知民间信仰批次引用：${reference}`);
}

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: folkEntityId(row.key, worldId),
    worldId,
    type: "character",
    title: row.title,
    slug: `mythology-folk-syncretism-person-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "地方神职与民间信仰", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, row.category),
    order,
    templateId: `template:${worldId}:mythology:deity-person`,
    templateData: {
      canonicalName: row.title,
      aliases: row.aliases,
      tradition: "民间信仰",
      identityType: "地方神",
      earliestSource: row.earliestSource,
      sourceLocation: row.sourceLocation,
      narrativeEra: "历史人物、地方祠神、后世封号与神谱叙事分别记录。",
      historicalLayer: normalizeHistoricalLayer(row.historicalLayer),
      domains: row.domains,
      iconography: row.iconography,
      worship: "庙宇祭祀、行业会馆、家宅岁时与国家封号按正文年代分层。",
      regionalVariants: "神名、图像、配祀与仪式随地区和时代变化，不设全国唯一版本。",
      confidence: row.confidence,
      editorialStatus: "复核中",
      originalAdaptation: "false"
    }
  };
}

function buildInstitutionEntity(row, order, worldId, now) {
  return {
    id: folkEntityId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-folk-syncretism-system-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "行业礼俗与三教合流", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, row.category),
    order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "跨传统",
      institutionKind: "民间祭祀与社会组织",
      hierarchyLevel: "家宅、社区、行业或跨地域网络，随条目而定",
      jurisdiction: row.domains,
      formationPeriod: row.historicalLayer,
      earliestSource: row.earliestSource,
      sourceLocation: row.sourceLocation,
      variants: "组合、位次与仪式随地域、行业、庙宇和时代变化，正文逐层记录。",
      confidence: row.confidence
    }
  };
}

function buildLocationEntity(row, order, worldId, now) {
  return {
    id: folkEntityId(row.key, worldId),
    worldId,
    type: "location",
    title: row.title,
    slug: `mythology-folk-syncretism-place-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "地方信仰地理", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, row.category),
    order,
    templateId: `template:${worldId}:mythology:sacred-geography`,
    templateData: {
      spaceKind: "庙宇与遗址",
      tradition: "民间信仰",
      historicalPeriod: row.historicalLayer,
      sourceTitle: row.earliestSource,
      sourceLocation: row.sourceLocation,
      modernCorrespondence: `可与现今${row.title}相关区域对照；具体建筑、河道和朝拜路线按年代另建图层。`,
      confidence: "大致区域",
      mapCaution: "现存建筑、历代重建、历史水系与神圣叙事分别建图层；现代坐标不证明每个传说发生在该点。"
    }
  };
}

function buildSourceEntity(row, order, worldId, now) {
  return {
    id: folkSourceId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-folk-syncretism-source-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "地方神祠原典", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, row.category),
    order,
    templateId: `template:${worldId}:mythology:source-text`,
    templateData: {
      workTitle: row.title,
      workType: sourceWorkType(row),
      formationPeriod: row.formationPeriod,
      edition: row.edition,
      volumeSection: row.volumeSection,
      sourceLayer: sourceLayer(row),
      rightsStatus: "古籍原文",
      internalCitation: `${row.title} · ${row.volumeSection} · ${row.edition}`,
      reviewStatus: "已核原文"
    }
  };
}

function buildRelation(row, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:folk-syncretism:${row.key}`,
    worldId,
    sourceEntityId: resolveRef(row.sourceRef, worldId),
    targetEntityId: resolveRef(row.targetRef, worldId),
    kind: row.kind,
    label: row.label,
    direction: row.direction,
    strength: row.strength,
    evidenceType: row.evidenceType,
    sourceCitation: row.sourceCitation,
    historicalScope: row.historicalScope,
    confidence: row.confidence,
    notes: row.notes,
    updatedAt: now
  };
}

function buildSourceRelation(row, kind, worldId, now) {
  return buildRelation(extraRelation(
    `source-${kind}-${row.key}`,
    `${kind === "figure" ? "f" : kind === "institution" ? "i" : "p"}:${row.key}`,
    row.sourceRef,
    row.sourceLabel || "主要原典与史料入口",
    row.sourceCitation,
    row.historicalLayer || row.historicalPeriod,
    {
      kind: "source",
      strength: 5,
      evidenceType: row.sourceEvidenceType || "primary-text",
      confidence: "certain",
      notes: row.sourceRelationNote || "本边只指向该页优先核对的古籍、史志或碑记入口；后出神格、地方异说与制度层仍按正文分别处理。"
    }
  ), worldId, now);
}

function buildTimelineEvent(row, worldId, now) {
  return {
    id: `timeline-event:${worldId}:mythology:folk-syncretism:${row.key}`,
    worldId,
    entityId: resolveRef(row.primaryRef, worldId),
    questId: "",
    sceneId: "",
    references: row.referenceRefs.map((reference) => ({ kind: "entity", id: resolveRef(reference, worldId) })),
    trackId: trackId(row.trackKey, worldId),
    title: row.title,
    summary: row.summary,
    displayDate: row.displayDate,
    datePrecision: row.datePrecision,
    sortOrder: row.sortOrder,
    startValue: row.startValue,
    endValue: row.endValue,
    era: row.era,
    dependencyIds: [],
    updatedAt: now
  };
}

function assertBatchShape() {
  const trackCounts = eventRows.reduce((counts, row) => {
    counts[row.trackKey] = (counts[row.trackKey] || 0) + 1;
    return counts;
  }, {});
  const checks = [
    [figureRows.length, 32, "人物"],
    [institutionRows.length, 8, "制度"],
    [locationRows.length, 7, "地点"],
    [sourceRows.length, 13, "原典入口"],
    [figureMembershipRows.length, 32, "人物制度入口关系"],
    [figureLinkRows.length, 96, "人物关系"],
    [institutionLinkRows.length, 24, "制度关系"],
    [locationLinkRows.length, 21, "地点关系"],
    [extraRelationRows.length, 30, "跨条目关系"],
    [semanticRelationRows.length, 203, "语义关系"],
    [eventRows.length, 35, "时间点"],
    [trackCounts["mythic-narrative"], 5, "神话叙事轨"],
    [trackCounts["textual-evidence"], 10, "文献证据轨"],
    [trackCounts["religious-institutions"], 12, "宗教礼制轨"],
    [trackCounts["cult-evolution"], 8, "信仰演变轨"]
  ];
  for (const [actual, expected, label] of checks) {
    if (actual !== expected) throw new Error(`${BATCH_LABEL}${label}数量应为 ${expected}，实际为 ${actual}`);
  }
  for (const row of [...figureRows, ...institutionRows, ...locationRows]) {
    if (!row.sourceRef) throw new Error(`${row.title} 缺少来源入口`);
  }
  for (const row of figureRows) {
    if (!row.institutionKey) throw new Error(`${row.title} 缺少主要制度入口`);
  }
}

function buildFolkSyncretismBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const figures = figureRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const institutions = institutionRows.map((row, index) => buildInstitutionEntity(row, figures.length + index, worldId, now));
  const locations = locationRows.map((row, index) => buildLocationEntity(row, figures.length + institutions.length + index, worldId, now));
  const sources = sourceRows.map((row, index) => buildSourceEntity(row, figures.length + institutions.length + locations.length + index, worldId, now));
  const sourceRelations = [
    ...figureRows.map((row) => buildSourceRelation(row, "figure", worldId, now)),
    ...institutionRows.map((row) => buildSourceRelation(row, "institution", worldId, now)),
    ...locationRows.map((row) => buildSourceRelation(row, "location", worldId, now))
  ];
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...figures, ...institutions, ...locations, ...sources],
    figures,
    institutions,
    locations,
    sources,
    relations: [...sourceRelations, ...semanticRelationRows.map((row) => buildRelation(row, worldId, now))],
    timelineEvents: eventRows.map((row) => buildTimelineEvent(row, worldId, now)),
    featuredEntityIds: [
      folkEntityId("mazu", worldId),
      folkEntityId("bixia-yuanjun", worldId),
      folkEntityId("wenchang-dijun", worldId),
      folkEntityId("guan-di", worldId),
      folkEntityId("zhao-gongming", worldId),
      folkEntityId("water-navigation", worldId),
      folkEntityId("three-teachings", worldId),
      folkEntityId("south-sea-temple", worldId)
    ]
  };
}

module.exports = {
  BATCH_KEY,
  BATCH_LABEL,
  buildFolkSyncretismBatch,
  folkEntityId,
  folkSourceId,
  trackId
};
