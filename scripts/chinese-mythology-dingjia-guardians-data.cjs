const { WORLD_ID, categoryId } = require("./chinese-mythology-history-data.cjs");
const { celestialEntityId, celestialSourceId } = require("./chinese-mythology-celestial-bureaucracy-data.cjs");
const { lineageEntityId } = require("./chinese-mythology-daoism-lineages-data.cjs");
const { natureEntityId } = require("./chinese-mythology-nature-pantheon-data.cjs");
const { trackId } = require("./chinese-mythology-zhenling-first-rank-data.cjs");
const { zhenlingFourthEntityId } = require("./chinese-mythology-zhenling-fourth-rank-data.cjs");

const BATCH_KEY = "daoism-dingjia-guardians-21";
const BATCH_LABEL = "道教神谱扩展 · 六丁六甲与宫观守护实例";
const SOURCE_CITATION = "《上清六甲祈祷秘法》《灵宝六丁秘法》及《道法会元》卷一百七十五";

function dingjiaEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:daoism-dingjia-guardians:${key}`;
}

function dingjiaSourceId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:daoism-dingjia-guardians-source:${key}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function figure(key, title, sourceNameForm, cluster, role, options = {}) {
  return {
    key,
    title,
    sourceNameForm,
    cluster,
    role,
    aliases: options.aliases || "",
    sourceLinks: options.sourceLinks || [],
    sourceCitation: options.sourceCitation || SOURCE_CITATION,
    sourceLocation: options.sourceLocation || "六丁六甲名讳段",
    earliestSource: options.earliestSource || SOURCE_CITATION,
    historicalLayer: options.historicalLayer || "中古至宋元道法名录层",
    identityType: options.identityType || "神祇",
    iconography: options.iconography || "现存经本另有服色或法像描述；本页不把一部经的形象扩成所有传承的统一造像。",
    worship: options.worship || "用于六丁六甲召请、护持与坛场科仪；不据名录推定全国独立庙祀。",
    variants: options.variants || "",
    confidence: options.confidence || "明确",
    boundary: options.boundary || "只按有出处的名、字和职能建档，不补写生平、亲属、师承或固定性格。"
  };
}

const SHANGQING_SOURCE = "s:shangqing-liujia-qidao";
const LINGBAO_SOURCE = "s:lingbao-liuding";
const QIDI_SOURCE = "s:qidi-ziting-yansheng";

const figureSpecs = [
  figure("jiazi-yuande", "甲子青公元德真君", "甲子神，字青公，名元德", "六甲阳神", "领甲子旬，与丁卯神配对", {
    sourceLinks: [SHANGQING_SOURCE], sourceLocation: "《上清六甲祈祷秘法》六甲阳神名第一项"
  }),
  figure("jiaxu-xuyi", "甲戌林齐虚逸真君", "甲戌神，字林齐，名虚逸", "六甲阳神", "领甲戌旬，与丁丑神配对", {
    aliases: "甲戌林齐逸虚真君", variants: "法像段另见“逸虚”次序，当前保留名讳段的“虚逸”为规范写法。", sourceLinks: [SHANGQING_SOURCE], sourceLocation: "《上清六甲祈祷秘法》六甲阳神名第二项"
  }),
  figure("jiashen-jielue", "甲申权衡节略真君", "甲申神，字权衡，名节略", "六甲阳神", "领甲申旬，与丁亥神配对", {
    sourceLinks: [SHANGQING_SOURCE], sourceLocation: "《上清六甲祈祷秘法》六甲阳神名第三项"
  }),
  figure("jiawu-chanren", "甲午子卿潺仁真君", "甲午神，字子卿，名潺仁", "六甲阳神", "领甲午旬，与丁酉神配对", {
    sourceLinks: [SHANGQING_SOURCE], sourceLocation: "《上清六甲祈祷秘法》六甲阳神名第四项"
  }),
  figure("jiachen-tongyuan", "甲辰衮昌通元真君", "甲辰神，字衮昌，名通元", "六甲阳神", "领甲辰旬，与丁未神配对", {
    aliases: "甲辰兖昌通元真君", variants: "衮昌、兖昌在转录中并见；二者占同一甲辰位置，不拆作两神。", sourceLinks: [SHANGQING_SOURCE], sourceLocation: "《上清六甲祈祷秘法》六甲阳神名第五项", confidence: "主流说法"
  }),
  figure("jiayin-huashi", "甲寅子靡化石真君", "甲寅神，字子靡，名化石", "六甲阳神", "领甲寅旬，与丁巳神配对", {
    sourceLinks: [SHANGQING_SOURCE], sourceLocation: "《上清六甲祈祷秘法》六甲阳神名第六项"
  }),

  figure("dingmao-wenbo", "丁卯文伯仁高玉女", "丁卯神，名文伯，字仁高", "六丁阴神", "在甲子旬中与甲子元德相配", {
    aliases: "丁卯玉女文伯", sourceLinks: [SHANGQING_SOURCE, LINGBAO_SOURCE], sourceLocation: "《上清六甲祈祷秘法》六丁阴神名第一项；《灵宝六丁秘法》丁卯玉女符"
  }),
  figure("dingchou-wengong", "丁丑文公仁贤玉女", "丁丑神，名文公，字仁贤", "六丁阴神", "在甲戌旬中与甲戌虚逸相配", {
    aliases: "丁丑文公仁贵玉女", variants: "《上清六甲祈祷秘法》作仁贤，部分《灵宝六丁秘法》传本作仁贵；同属丁丑文公一位。", sourceLinks: [SHANGQING_SOURCE, LINGBAO_SOURCE], sourceLocation: "《上清六甲祈祷秘法》六丁阴神名第二项；《灵宝六丁秘法》丁丑玉女符", confidence: "主流说法"
  }),
  figure("dinghai-wentong", "丁亥文通仁和玉女", "丁亥神，名文通，字仁和", "六丁阴神", "在甲申旬中与甲申节略相配", {
    aliases: "丁亥仁通仁和玉女", variants: "现存转录偶见“仁通”，《灵宝六丁秘法》明确作“文通”；本页保留两种读法。", sourceLinks: [SHANGQING_SOURCE, LINGBAO_SOURCE], sourceLocation: "《上清六甲祈祷秘法》六丁阴神名第三项；《灵宝六丁秘法》丁亥玉女符", confidence: "主流说法"
  }),
  figure("dingyou-wenqing", "丁酉文卿仁修玉女", "丁酉神，名文卿，字仁修", "六丁阴神", "在甲午旬中与甲午潺仁相配", {
    aliases: "丁酉文卿仁通玉女", variants: "名讳段与一系符法作仁修，另一传本段落作仁通；差异留在同页，不另造一位丁酉神。", sourceLinks: [SHANGQING_SOURCE, LINGBAO_SOURCE], sourceLocation: "《上清六甲祈祷秘法》六丁阴神名第四项；《灵宝六丁秘法》丁酉玉女符", confidence: "主流说法"
  }),
  figure("dingwei-shengtong", "丁未升通仁恭玉女", "丁未神，名升通，字仁恭", "六丁阴神", "在甲辰旬中与甲辰通元相配", {
    aliases: "丁未叔通玉女", variants: "《上清六甲祈祷秘法》作升通、仁恭；《灵宝六丁秘法》又见叔通、仁富或仁集。当前按旬位合并异名。", sourceLinks: [SHANGQING_SOURCE, LINGBAO_SOURCE], sourceLocation: "《上清六甲祈祷秘法》六丁阴神名第五项；《灵宝六丁秘法》丁未玉女符", confidence: "主流说法"
  }),
  figure("dingsi-tingqing", "丁巳庭卿仁敬玉女", "丁巳神，名庭卿，字仁敬", "六丁阴神", "在甲寅旬中与甲寅化石相配", {
    aliases: "丁巳庭卿仁叔玉女", variants: "《上清六甲祈祷秘法》作仁敬，《灵宝六丁秘法》作仁叔；庭卿名号和丁巳旬位相同。", sourceLinks: [SHANGQING_SOURCE, LINGBAO_SOURCE], sourceLocation: "《上清六甲祈祷秘法》六丁阴神名第六项；《灵宝六丁秘法》丁巳玉女符", confidence: "主流说法"
  }),

  figure("qinglong-mengzhang", "青龙孟章神君", "东方青龙孟章神君", "四方守护", "东方守护与宫观山门左位", {
    aliases: "孟章神君、青龙神", sourceLinks: [QIDI_SOURCE, "cs:daofa-huiyuan"], sourceCitation: "《七帝紫庭延生经》《道法会元》四灵神位及青城山天师洞像设资料", sourceLocation: "四灵方位列名；青城山天师洞山门左殿", earliestSource: "道经四灵名号与现存宫观像设", historicalLayer: "中古星宿方位神与后世宫观守护层", iconography: "青龙形或武将形随经画、壁画与宫观塑像而变；青城山实例为山门左殿神像。", worship: "方位守护、坛场与山门护卫；各地是否单独设殿须逐观核对。", boundary: "孟章是东方青龙的道教名号，不因同含青龙二字就并入关羽兵器、地名或全部龙神。"
  }),
  figure("baihu-jianbing", "白虎监兵神君", "西方白虎监兵神君", "四方守护", "西方守护与宫观山门右位", {
    aliases: "监兵神君、白虎神", sourceLinks: [QIDI_SOURCE, "cs:daofa-huiyuan"], sourceCitation: "《七帝紫庭延生经》《道法会元》四灵神位及青城山天师洞像设资料", sourceLocation: "四灵方位列名；青城山天师洞山门右殿", earliestSource: "道经四灵名号与现存宫观像设", historicalLayer: "中古星宿方位神与后世宫观守护层", iconography: "白虎形或武将形随经画、壁画与宫观塑像而变；青城山实例为山门右殿神像。", worship: "方位守护、坛场与山门护卫；各地是否单独设殿须逐观核对。", boundary: "监兵神君不是严白虎，也不与一切虎神、白虎星象材料自动合并。"
  }),
  figure("zhuque-lingguang", "朱雀陵光神君", "南方朱雀陵光神君", "四方守护", "南方守护与坛场前位", {
    aliases: "陵光神君、朱雀神", sourceLinks: [QIDI_SOURCE, "cs:daofa-huiyuan"], sourceCitation: "《七帝紫庭延生经》与《道法会元》四灵方位列名", sourceLocation: "四灵方位列名中的南方位", earliestSource: "道经四灵名号", historicalLayer: "中古星宿方位神与道教坛场层", iconography: "朱雀鸟形、神禽形或神将化表现均须按具体经画和法坛材料辨认。", worship: "四方守护与坛场南位；本页不推定独立宫观普遍存在。", boundary: "陵光是朱雀在一系道经中的神名，不等于所有凤凰、赤鸟或火神。"
  }),
  figure("xuanwu-zhiming", "玄武执明神君", "北方玄武执明神君", "四方守护", "北方守护与坛场后位", {
    aliases: "执明神君、玄武神", sourceLinks: [QIDI_SOURCE, "cs:daofa-huiyuan"], sourceCitation: "《七帝紫庭延生经》与《道法会元》四灵方位列名", sourceLocation: "四灵方位列名中的北方位", earliestSource: "道经四灵名号", historicalLayer: "中古星宿方位神与后世真武信仰比较层", iconography: "龟蛇合体是玄武星象常见形态；披发仗剑的真武帝像属于后续神格发展，不能倒填。", worship: "四方守护与坛场北位；与真武帝尊信仰有关联而非所有阶段完全同一。", boundary: "执明神君与宋元以后玄天上帝保留阶段差，不用一个别名字段抹平星象、守护神和帝尊。"
  }),
  figure("huode-yinghuo", "火德荧惑星君（火祖）", "南方火德荧惑星君", "宫观主祀", "火德、荧惑与防火禳灾", {
    aliases: "火德星君、火德真君、火祖", sourceLinks: [], sourceCitation: "北京火德真君庙祀典、现存荧惑宝殿像设及明清宫观记录", sourceLocation: "北京火德真君庙荧惑宝殿（火祖殿）", earliestSource: "明清火神庙祀典与现存宫观像设资料", historicalLayer: "明清北京火神庙祀典与现代保存层", iconography: "火祖殿中的星君形象应按现存神像、殿额与修缮档案记录，不以通用火焰人物图替代。", worship: "火德真君庙主祀、火祖圣诞与防火禳灾；地方祭日和神职说明有差异。", variants: "火德、荧惑、火祖在北京火神庙语境中相接，但与祝融、华光、王灵官仍是不同身份。", boundary: "火德荧惑星君不是祝融或王灵官的别名；同庙供奉只证明空间并见，不建立亲属或上下级。"
  })
];

function institution(key, title, kind, summary, sourceCitation, options = {}) {
  return {
    key,
    title,
    kind,
    summary,
    sourceCitation,
    sourceNameForm: options.sourceNameForm || title,
    sourceLinks: options.sourceLinks || [],
    formationPeriod: options.formationPeriod || "中古至宋元道法材料",
    sourceLocation: options.sourceLocation || sourceCitation,
    hierarchyLevel: options.hierarchyLevel || "具体经法或宫观实例",
    jurisdiction: options.jurisdiction || summary,
    variants: options.variants || "不同经本、法派与宫观另有排法；当前页面只覆盖所列材料。",
    detail: options.detail || "页面保存可见成员、方位或殿宇关系，不把缺失位置补成整齐而虚构的组织图。",
    boundary: options.boundary || "相邻、同殿、配对和隶属分别建关系；空间靠近不自动等于神格同一。"
  };
}

const pairRows = [
  ["xun-jiazi-dingmao", "甲子旬：元德与文伯", "jiazi-yuande", "dingmao-wenbo", "甲子神与丁卯神通管甲子一旬"],
  ["xun-jiaxu-dingchou", "甲戌旬：虚逸与文公", "jiaxu-xuyi", "dingchou-wengong", "甲戌神与丁丑神通管甲戌一旬"],
  ["xun-jiashen-dinghai", "甲申旬：节略与文通", "jiashen-jielue", "dinghai-wentong", "甲申神与丁亥神通管甲申一旬"],
  ["xun-jiawu-dingyou", "甲午旬：潺仁与文卿", "jiawu-chanren", "dingyou-wenqing", "甲午神与丁酉神通管甲午一旬"],
  ["xun-jiachen-dingwei", "甲辰旬：通元与升通", "jiachen-tongyuan", "dingwei-shengtong", "甲辰神与丁未神通管甲辰一旬"],
  ["xun-jiayin-dingsi", "甲寅旬：化石与庭卿", "jiayin-huashi", "dingsi-tingqing", "甲寅神与丁巳神通管甲寅一旬"]
];

const institutionSpecs = [
  institution("dingjia-system", "六丁六甲守护体系", "科仪守护神系", "六甲阳神与六丁阴神按六旬配成十二神位，承担召请、护持与法坛执行。", SOURCE_CITATION, {
    sourceLinks: [SHANGQING_SOURCE, LINGBAO_SOURCE, "cs:daofa-huiyuan"], sourceNameForm: "六甲阳神、六丁阴神与六旬配对", hierarchyLevel: "六甲六丁总组"
  }),
  institution("liujia-yang-register", "六甲阳神名录", "神位名录", "甲子、甲戌、甲申、甲午、甲辰、甲寅六位阳神按原次序列名。", "《上清六甲祈祷秘法》六甲阳神名", {
    sourceLinks: [SHANGQING_SOURCE], sourceNameForm: "六甲阳神名", hierarchyLevel: "六丁六甲中的阳神组六位"
  }),
  institution("liuding-yin-register", "六丁阴神与六丁玉女名录", "神位名录", "丁卯、丁丑、丁亥、丁酉、丁未、丁巳六位阴神，在另一经本中以玉女称呼。", "《上清六甲祈祷秘法》六丁阴神名；《灵宝六丁秘法》六丁玉女符", {
    sourceLinks: [SHANGQING_SOURCE, LINGBAO_SOURCE], sourceNameForm: "六丁阴神名、六丁玉女符", hierarchyLevel: "六丁六甲中的阴神组六位"
  }),
  ...pairRows.map(([key, title, , , statement]) => institution(key, title, "旬值配对", statement, "《上清六甲祈祷秘法》旬中配属；《道法会元》卷一百七十五六丁六甲召法", {
    sourceLinks: [SHANGQING_SOURCE, "cs:daofa-huiyuan"], sourceNameForm: title, hierarchyLevel: "六旬之一", detail: `${statement}。本页只保存旬位配属，不把两神写成夫妻、兄妹或主从。`
  })),
  institution("dingjia-ritual-array", "六丁六甲坛位与旬值配对", "科仪坛位", "十二神位依六甲地支与相应丁日布置，符位、掐诀和召请随法本而变。", "《道法会元》卷一百七十五〈元照灵虚府玉册〉六丁六甲段", {
    sourceLinks: [SHANGQING_SOURCE, "cs:daofa-huiyuan"], sourceNameForm: "六丁六甲坛位与丁甲合同", hierarchyLevel: "六旬配对的仪式空间", detail: "卷一百七十五明确给出甲子配丁卯、甲戌配丁丑，依次至甲寅配丁巳。软件按这条轴画关系，不用生肖头像替代经内神位。"
  }),
  institution("dingjia-variant-ledger", "六丁六甲异名簿", "版本校勘", "集中保存虚逸与逸虚、衮昌与兖昌，以及六丁名、字在三套经法中的差异。", SOURCE_CITATION, {
    sourceLinks: [SHANGQING_SOURCE, LINGBAO_SOURCE, "cs:daofa-huiyuan"], sourceNameForm: "六丁六甲名讳异文", hierarchyLevel: "跨经本校勘层", detail: "异名簿按旬位、名号和相邻次序判断是否同位；只有一个字相近却缺少旬位证据时，继续保留存疑。"
  }),
  institution("alternate-twelve-jade-women", "《六丁甲真符》十二玉女异谱", "异谱名录", "卷一百七十五另列六甲与六丁交错的十二位玉女，名号与六甲阳神、六丁阴神名录不同。", "《道法会元》卷一百七十五〈元照灵虚府玉册〉《六丁甲真符》", {
    sourceLinks: ["cs:daofa-huiyuan"], sourceNameForm: "甲子太玄玉女至丁巳玉女十二位", hierarchyLevel: "同卷另一套十二玉女符谱", detail: "页面保留灵珠、须台、神元、凤环等十二位名号的存在，但本批不把它们硬并到元德、文伯等十二神，也不借近名补写身份。"
  }),
  institution("four-guardians-system", "青龙白虎朱雀玄武四方守护", "方位守护神系", "孟章、监兵、陵光、执明按东、西、南、北列位，是星宿方位进入道教坛场与宫观守护的一种结构。", "《七帝紫庭延生经》四灵名号；《道法会元》四方神位", {
    sourceLinks: [QIDI_SOURCE, "cs:daofa-huiyuan"], sourceNameForm: "青龙孟章、白虎监兵、朱雀陵光、玄武执明", formationPeriod: "中古以后道经与宋元法书层", hierarchyLevel: "四方守护神组"
  }),
  institution("temple-layout-boundary", "宫观神位布局的地方差异", "宫观像设原则", "同一位护法在不同宫观可能守山门、居前殿或列入壁画；三处实例不能拼成全国统一平面图。", "青城山天师洞、北京火德真君庙与山西太符观现存像设资料", {
    formationPeriod: "金元明清建筑与现存宫观延续层", hierarchyLevel: "跨宫观比较", detail: "本页并列山门双殿、前殿与主殿、正殿和东西配殿三种实际布局。软件只在各自实例内建立包含关系。"
  }),
  institution("qingcheng-tianshidong-gate", "青城山天师洞青龙白虎山门守护", "地方宫观实例", "天师洞山门前左右各有一座神殿，左祀青龙孟章，右祀白虎监兵。", "青城山天师洞现存山门像设与宫观资料", {
    formationPeriod: "现存宫观像设记录", sourceLocation: "青城山天师洞山门前左右神殿", hierarchyLevel: "青城山天师洞山门", variants: "这是天师洞具体陈设，不据此要求所有道观都设青龙白虎双殿。"
  }),
  institution("beijing-fire-temple-layout", "北京火德真君庙神位布局", "地方宫观实例", "现存中轴以隆恩殿所祀王灵官守前、荧惑宝殿所祀火德荧惑星君居后，形成护门与主祀的空间次序。", "北京火德真君庙现存建筑、神像与修缮资料", {
    formationPeriod: "明清重修格局与现代修复保存层", sourceLocation: "北京地安门外火德真君庙", hierarchyLevel: "火德真君庙中轴线", variants: "殿名、修缮年代和附属神位须按具体时期记录；本页不概括其他火神庙。"
  }),
  institution("fire-temple-lingguan-hall", "火德真君庙隆恩殿（灵官殿）", "宫观殿宇", "火德真君庙前部殿宇供奉隆恩真君王灵官，使护坛神将成为进入主祀空间前的第一重神位。", "北京火德真君庙隆恩殿现存像设资料", {
    formationPeriod: "明代以后灵官崇祀与现存宫观层", sourceLocation: "北京火德真君庙隆恩殿", hierarchyLevel: "山门前殿与护法殿"
  }),
  institution("fire-temple-fire-ancestor-hall", "火德真君庙荧惑宝殿（火祖殿）", "宫观殿宇", "荧惑宝殿主祀南方火德荧惑星君，火祖称谓在这座宫观的祭祀和殿额中获得具体位置。", "北京火德真君庙荧惑宝殿现存像设与祀典资料", {
    formationPeriod: "明清火德祀典与现存宫观层", sourceLocation: "北京火德真君庙荧惑宝殿", hierarchyLevel: "火德真君庙主殿"
  }),
  institution("taifu-guan-layout", "山西太符观神位布局", "地方宫观实例", "太符观以昊天玉皇上帝殿为正殿，东配后土圣母殿，西配五岳殿，并以壁画、彩塑和悬塑组织众神。", "太符观现存建筑、彩塑、壁画、悬塑与碑刻资料", {
    formationPeriod: "金承安五年建醮坛，金明清建筑与像设保存层", sourceLocation: "山西汾阳太符观", hierarchyLevel: "正殿与东西配殿"
  }),
  institution("taifu-yuhuang-hall", "太符观昊天玉皇上帝殿", "宫观殿宇", "正殿供奉昊天玉皇上帝，两壁朝元图绘三百六十五值日神君侍列。", "太符观昊天玉皇上帝殿现存彩塑与壁画资料", {
    formationPeriod: "金代建筑结构与后续彩塑壁画层", sourceLocation: "太符观正殿", hierarchyLevel: "太符观正殿"
  }),
  institution("taifu-houtu-hall", "太符观后土圣母殿", "宫观殿宇", "东配殿供奉后土圣母神像，并保存圣母出巡、游归题材的悬塑。", "太符观后土圣母殿现存神像与悬塑资料", {
    formationPeriod: "明代配殿与后续像设保存层", sourceLocation: "太符观东配殿", hierarchyLevel: "太符观东配殿", variants: "殿内九尊圣母像及地方称呼属于太符观实例，不据此改写后土在所有道经中的唯一形象。"
  }),
  institution("taifu-five-peaks-four-rivers-hall", "太符观五岳四渎殿", "宫观殿宇", "西配殿正中列五岳帝像，南北两侧列江、河、淮、济四渎神像，并保存巡幸、出行悬塑。", "太符观五岳殿现存神像与悬塑资料", {
    formationPeriod: "明清五岳殿与像设保存层", sourceLocation: "太符观西配殿", hierarchyLevel: "太符观西配殿"
  }),
  institution("taifu-daily-deities-365", "太符观三百六十五值日神君朝元图", "宫观壁画神班", "玉皇殿壁画以三百六十五值日神君朝元为题，人数和画面结构有据，个体姓名不能从人数反推。", "太符观昊天玉皇上帝殿朝元图现存壁画资料", {
    formationPeriod: "太符观壁画保存层", sourceLocation: "太符观玉皇殿内壁", hierarchyLevel: "壁画中的朝元神班", detail: "当前把整组壁画作为一条神班记录；未能从题记或图像逐名辨认者，不生成三百六十五个匿名人物。"
  }),
  institution("four-rivers-system", "江河淮济四渎神系", "山川水府神系", "江、河、淮、济四渎在国家山川礼制与后世宫观像设中成组，太符观以四尊水神列于五岳殿两侧。", "历代山川祀典与太符观五岳殿现存像设资料", {
    formationPeriod: "古代山川祀典至明清宫观像设层", sourceLocation: "四渎礼制材料；太符观五岳殿", hierarchyLevel: "四渎水神组合", detail: "本页先保存江河淮济这一制度组合；四位神的具体尊号、性别形象和地方庙史待逐项材料齐全后再拆页。"
  })
];

const sourceRows = [
  {
    key: "shangqing-liujia-qidao",
    title: "《上清六甲祈祷秘法》",
    summary: "保存六甲阳神、六丁阴神名讳、旬中配属及相关法像的道经，是本批十二神位的主要名录基线。",
    workType: "道经",
    formationPeriod: "成书年代待考，现存《正统道藏》本",
    edition: "《正统道藏》本，数字转录与影印页对读",
    volumeSection: "六甲阳神名、六丁阴神名与神像段",
    focus: "经本把六甲六丁逐名列出，又说明抄写中常有失名现象，因此姓名和次序必须保留版本状态。",
    boundary: "经内神圣叙事和法术效验按宗教文本记录，不换写成可验证的历史事件，也不从法像推导统一人格。"
  },
  {
    key: "lingbao-liuding",
    title: "《灵宝六丁秘法》",
    summary: "逐位记载六丁玉女名、字与部分法像的道经，为文公仁贵、叔通仁富等异名提供对照。",
    workType: "道经",
    formationPeriod: "约唐末至五代传本，现存《正统道藏》本",
    edition: "《正统道藏》本，多个数字转录互校",
    volumeSection: "六丁玉女名号、符式与法像段",
    focus: "六位玉女的名、字在同一经本不同转录中也会出现仁集、仁富等差异，适合建立异名簿而非强选唯一字样。",
    boundary: "黄帝受法、玄女传诀等内容属于经内神圣叙事；项目不把它们当作黄帝时代的实录。"
  },
  {
    key: "qidi-ziting-yansheng",
    title: "《七帝紫庭延生经》",
    summary: "保存青龙孟章、白虎监兵、朱雀陵光、玄武执明等四灵名号的道经材料，为方位守护神名提供文本入口。",
    workType: "道经",
    formationPeriod: "成书年代待考，现存道藏经本",
    edition: "道藏经本与相关四灵科仪材料对读",
    volumeSection: "四灵方位与延生神位段",
    focus: "本批只用经中明确列出的四灵名号和方位，不把后世各地的门神、星宿、神兽与帝尊形象一次合并。",
    boundary: "玄武执明与玄天上帝之间有接受史联系，仍需按星象、坛场守护和宋元帝尊三个阶段分别显示。"
  }
];

function renderFigureArticle(row) {
  const variants = row.variants || `${row.title}在当前核对的主要经本中没有显示需要另拆身份的异名；以后若发现异本，仍按旬位和名次复核。`;
  return [
    `<p>${escapeHtml(row.title)}属于${escapeHtml(row.cluster)}。可确认的核心是“${escapeHtml(row.sourceNameForm)}”以及${escapeHtml(row.role)}；这两项比后世拼成的完整传记更可靠。</p>`,
    "<h2>原典坐标</h2>",
    `<p>${escapeHtml(row.sourceLocation)}保存这一神位。页面采用“名号、所在组、关系位置”三项定位${escapeHtml(row.title)}，没有把经内神圣时间改写成人间出生年代。</p>`,
    "<h2>职能与形象</h2>",
    `<p>${escapeHtml(row.title)}的可见职能是${escapeHtml(row.role)}。${escapeHtml(row.iconography)}</p>`,
    "<h2>版本差异</h2>",
    `<p>${escapeHtml(variants)} 本页别名只服务检索，规范标题不宣称消灭其他传本。</p>`,
    "<h2>使用边界</h2>",
    `<p>${escapeHtml(row.boundary)} 若剧情需要为${escapeHtml(row.title)}增加对白、性格、法器效果或个人经历，这些内容应在创作条目中另行标注。</p>`
  ].join("");
}

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: dingjiaEntityId(row.key, worldId),
    worldId,
    type: "character",
    title: row.title,
    slug: `mythology-daoism-dingjia-guardian-${row.key}`,
    summary: `${row.title}是${row.cluster}中的独立神位；原文写作“${row.sourceNameForm}”，主要位置为${row.role}。`,
    content: renderFigureArticle(row),
    tags: ["中国神话史", "道教", "道教神谱", row.cluster, row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "daoism-offices"),
    order,
    templateId: `template:${worldId}:mythology:deity-person`,
    templateData: {
      canonicalName: row.title,
      aliases: row.aliases,
      tradition: "道教",
      identityType: row.identityType,
      earliestSource: row.earliestSource,
      sourceLocation: row.sourceLocation,
      narrativeEra: "经内神圣时间与科仪召请语境",
      historicalLayer: row.historicalLayer.includes("明清") && !row.historicalLayer.includes("中古") ? "明清" : "跨时期",
      domains: row.role,
      iconography: row.iconography,
      worship: row.worship,
      regionalVariants: row.variants || "具体形象和召请位置随经本、法派与宫观而变。",
      confidence: row.confidence,
      editorialStatus: "已定稿",
      originalAdaptation: "false"
    }
  };
}

function renderInstitutionArticle(row) {
  return [
    `<p>${escapeHtml(row.title)}记录的是${escapeHtml(row.kind)}。${escapeHtml(row.summary)}</p>`,
    "<h2>资料坐标</h2>",
    `<p>${escapeHtml(row.sourceCitation)}提供本页依据，原材料中的称呼为“${escapeHtml(row.sourceNameForm)}”。本项目重写说明文字，但保留可核的名号、方位和殿宇关系。</p>`,
    "<h2>实际结构</h2>",
    `<p>${escapeHtml(row.detail)} 因而${escapeHtml(row.title)}在图谱中只连接有明文或现存像设支持的成员。</p>`,
    "<h2>资料边界</h2>",
    `<p>${escapeHtml(row.boundary)} ${escapeHtml(row.variants)}</p>`,
    "<h2>创作使用</h2>",
    `<p>可以把${escapeHtml(row.title)}用作场景、坛位或组织结构的底稿；新增殿名、人物职责、冲突和仪式步骤均须与资料层分开保存。</p>`
  ].join("");
}

function buildInstitutionEntity(row, order, worldId, now) {
  return {
    id: dingjiaEntityId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-daoism-dingjia-system-${row.key}`,
    summary: `${row.title}：${row.summary}`,
    content: renderInstitutionArticle(row),
    tags: ["中国神话史", "道教", "道教史", row.kind, row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "daoism-offices"),
    order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "道教",
      institutionKind: row.kind,
      hierarchyLevel: row.hierarchyLevel,
      jurisdiction: row.jurisdiction,
      formationPeriod: row.formationPeriod,
      earliestSource: row.sourceCitation,
      sourceLocation: row.sourceLocation,
      variants: row.variants,
      confidence: "明确"
    }
  };
}

function renderSourceArticle(row) {
  return [
    `<p>${escapeHtml(row.title)}是本批校核神名与关系的文本入口。${escapeHtml(row.summary)}</p>`,
    "<h2>保存内容</h2>",
    `<p>${escapeHtml(row.focus)} 项目引用时保留卷段和名次，不用现代列表替代原有次序。</p>`,
    "<h2>版本处理</h2>",
    `<p>当前采用${escapeHtml(row.edition)}。遇到难字、异体或转录差异时，规范写法与原写法并列，不能只凭字形相近增删人物。</p>`,
    "<h2>史料边界</h2>",
    `<p>${escapeHtml(row.boundary)} 这使${escapeHtml(row.title)}既能提供神谱证据，又不会被误读成无缝连续的世俗史书。</p>`,
    "<h2>项目用法</h2>",
    `<p>页面正文由项目重新组织和说明，古籍短名只作为必要的校核对象。后续校勘若改变字样，会保留旧写法、版本依据和修改记录。</p>`
  ].join("");
}

function buildSourceEntity(row, order, worldId, now) {
  return {
    id: dingjiaSourceId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-daoism-dingjia-source-${row.key}`,
    summary: row.summary,
    content: renderSourceArticle(row),
    tags: ["中国神话史", "道教原典与史料", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "primary-sources"),
    order,
    templateId: `template:${worldId}:mythology:source-text`,
    templateData: {
      workTitle: row.title,
      workType: row.workType,
      formationPeriod: row.formationPeriod,
      edition: row.edition,
      volumeSection: row.volumeSection,
      sourceLayer: "原文",
      rightsStatus: "古籍原文",
      internalCitation: `${row.title} · ${row.volumeSection} · ${row.edition}`,
      reviewStatus: "已核原文"
    }
  };
}

function resolveRef(reference, worldId) {
  const split = reference.indexOf(":");
  const scope = reference.slice(0, split);
  const key = reference.slice(split + 1);
  if (scope === "d") return dingjiaEntityId(key, worldId);
  if (scope === "s") return dingjiaSourceId(key, worldId);
  if (scope === "c") return celestialEntityId(key, worldId);
  if (scope === "cs") return celestialSourceId(key, worldId);
  if (scope === "l") return lineageEntityId(key, worldId);
  if (scope === "n") return natureEntityId(key, worldId);
  if (scope === "z4") return zhenlingFourthEntityId(key, worldId);
  throw new Error(`未知六丁六甲与宫观引用：${reference}`);
}

function relation({
  key,
  sourceRef,
  targetRef,
  kind,
  label,
  direction = "directed",
  strength = 5,
  evidenceType = "primary-text",
  sourceCitation = SOURCE_CITATION,
  historicalScope = "中古至宋元道法与后世宫观实例层",
  confidence = "certain",
  notes
}, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:daoism-dingjia-guardians:${key}`,
    worldId,
    sourceEntityId: resolveRef(sourceRef, worldId),
    targetEntityId: resolveRef(targetRef, worldId),
    kind,
    label,
    direction,
    strength,
    evidenceType,
    sourceCitation,
    historicalScope,
    confidence,
    notes,
    updatedAt: now
  };
}

const sourceTitleByRef = new Map([
  [SHANGQING_SOURCE, "《上清六甲祈祷秘法》"],
  [LINGBAO_SOURCE, "《灵宝六丁秘法》"],
  [QIDI_SOURCE, "《七帝紫庭延生经》"],
  ["cs:daofa-huiyuan", "《道法会元》"]
]);

function sourceRelation(row, sourceRef, worldId, now) {
  const sourceKey = sourceRef.slice(sourceRef.indexOf(":") + 1);
  const sourceTitle = sourceTitleByRef.get(sourceRef);
  return relation({
    key: `source-${row.key}-${sourceKey}`,
    sourceRef: `d:${row.key}`,
    targetRef: sourceRef,
    kind: "source",
    label: `${row.title}的文本依据`,
    strength: 5,
    evidenceType: "primary-text",
    sourceCitation: sourceTitle,
    historicalScope: row.historicalLayer || row.formationPeriod || "道经文本层",
    confidence: "certain",
    notes: `${sourceTitle}支持“${row.sourceNameForm || row.title}”这一名号、名录或结构；关系不把经内叙事改写成人间实录。`
  }, worldId, now);
}

function buildRelations(worldId, now) {
  const sourcedRows = [...figureSpecs, ...institutionSpecs].filter((row) => row.sourceLinks?.length);
  const sourceRelations = sourcedRows.flatMap((row) => row.sourceLinks.map((sourceRef) => sourceRelation(row, sourceRef, worldId, now)));

  const structuralRelations = [
    relation({ key: "system-liujia", sourceRef: "d:dingjia-system", targetRef: "d:liujia-yang-register", kind: "contains", label: "六甲阳神分组", notes: "六甲六位按甲子至甲寅的旬首次序进入总组。" }, worldId, now),
    relation({ key: "system-liuding", sourceRef: "d:dingjia-system", targetRef: "d:liuding-yin-register", kind: "contains", label: "六丁阴神分组", notes: "六丁六位按丁卯至丁巳的旬中次序进入总组。" }, worldId, now),
    relation({ key: "system-array", sourceRef: "d:dingjia-system", targetRef: "d:dingjia-ritual-array", kind: "contains", label: "六旬配对与坛位", notes: "配对结构来自明确旬中记载，坛位细节仍依具体法本。" }, worldId, now),
    relation({ key: "system-variants", sourceRef: "d:dingjia-system", targetRef: "d:dingjia-variant-ledger", kind: "contains", label: "跨经本异名校勘", evidenceType: "textual-variant", notes: "异名簿保存差异，不替代十二位神的规范页面。" }, worldId, now),
    ...figureSpecs.slice(0, 6).map((row, index) => relation({
      key: `liujia-member-${index + 1}`, sourceRef: "d:liujia-yang-register", targetRef: `d:${row.key}`, kind: "contains", label: "六甲阳神成员", notes: `第 ${index + 1} 位按《上清六甲祈祷秘法》次序保存。`
    }, worldId, now)),
    ...figureSpecs.slice(6, 12).map((row, index) => relation({
      key: `liuding-member-${index + 1}`, sourceRef: "d:liuding-yin-register", targetRef: `d:${row.key}`, kind: "contains", label: "六丁阴神成员", notes: `第 ${index + 1} 位兼录阴神与玉女称呼，不把异名拆成新人。`
    }, worldId, now)),
    ...pairRows.flatMap(([pairKey, title, jiaKey, dingKey], index) => [
      relation({ key: `array-pair-${index + 1}`, sourceRef: "d:dingjia-ritual-array", targetRef: `d:${pairKey}`, kind: "contains", label: "六旬配对之一", notes: `${title}按六甲旬序列入坛位结构。` }, worldId, now),
      relation({ key: `${pairKey}-jia`, sourceRef: `d:${pairKey}`, targetRef: `d:${jiaKey}`, kind: "contains", label: "旬首六甲神", notes: `${title}中的甲神由原文明确列名。` }, worldId, now),
      relation({ key: `${pairKey}-ding`, sourceRef: `d:${pairKey}`, targetRef: `d:${dingKey}`, kind: "contains", label: "旬中六丁神", notes: `${title}中的丁神由原文明确配属。` }, worldId, now),
      relation({ key: `${pairKey}-paired`, sourceRef: `d:${jiaKey}`, targetRef: `d:${dingKey}`, kind: "custom", direction: "undirected", label: "同管一旬", notes: `${title}只表示旬值配对，不表示亲属、婚姻或永久上下级。` }, worldId, now)
    ]),
    ...figureSpecs.slice(0, 12).map((row, index) => relation({
      key: `variant-ledger-entry-${index + 1}`, sourceRef: "d:dingjia-variant-ledger", targetRef: `d:${row.key}`, kind: "custom", label: "名号与异文校勘对象", evidenceType: "textual-variant", confidence: row.confidence === "明确" ? "certain" : "probable", notes: `${row.title}的旬位、规范名和异名同时保留，近字不重复计神。`
    }, worldId, now)),
    relation({ key: "alternate-register-ledger", sourceRef: "d:alternate-twelve-jade-women", targetRef: "d:dingjia-variant-ledger", kind: "custom", direction: "undirected", strength: 4, label: "同卷另一套十二玉女名录", evidenceType: "textual-variant", sourceCitation: "《道法会元》卷一百七十五《六丁甲真符》", historicalScope: "宋元六丁六甲法多谱并存层", confidence: "certain", notes: "灵珠、须台等十二位与元德、文伯等名录不同，当前并列而不合并。" }, worldId, now),
    relation({ key: "liuding-zhenling-fourth", sourceRef: "d:liuding-yin-register", targetRef: "z4:liuding-shizhe", kind: "custom", direction: "undirected", strength: 3, label: "与《真灵位业图》六丁使者名位对读", evidenceType: "scholarly-inference", sourceCitation: "《真灵位业图》第四阶；六丁六甲相关道经", historicalScope: "齐梁名录与后世六丁名讳比较层", confidence: "probable", notes: "第四阶只写六丁使者合称，后世六位名讳不能无条件倒填为齐梁名录的完整姓名。" }, worldId, now),

    ...figureSpecs.slice(12, 16).map((row, index) => relation({
      key: `four-guardian-member-${index + 1}`, sourceRef: "d:four-guardians-system", targetRef: `d:${row.key}`, kind: "contains", label: "四方守护神成员", sourceCitation: "《七帝紫庭延生经》与《道法会元》四灵方位列名", historicalScope: "中古以后四灵道教神位层", notes: `${row.title}按方位和完整神名列入四灵组，不与近似动物神自动合并。`
    }, worldId, now)),
    relation({ key: "qinglong-baihu-pair", sourceRef: "d:qinglong-mengzhang", targetRef: "d:baihu-jianbing", kind: "custom", direction: "undirected", strength: 4, label: "东西方位相对", sourceCitation: "四灵方位列名与青城山天师洞山门像设", historicalScope: "四灵方位与青城山宫观实例层", notes: "方位相对和山门左右同见，不等于二神存在世俗亲属关系。" }, worldId, now),
    relation({ key: "zhuque-xuanwu-pair", sourceRef: "d:zhuque-lingguang", targetRef: "d:xuanwu-zhiming", kind: "custom", direction: "undirected", strength: 4, label: "南北方位相对", sourceCitation: "《七帝紫庭延生经》与《道法会元》四灵方位列名", historicalScope: "中古以后四灵道教神位层", notes: "南北相对用于坛场方位，不创造对偶神话。" }, worldId, now),
    relation({ key: "xuanwu-zhenwu-development", sourceRef: "d:xuanwu-zhiming", targetRef: "c:zhenwu-emperor", kind: "custom", direction: "directed", strength: 4, label: "玄武星象与守护神向真武帝尊传统发展", evidenceType: "scholarly-inference", sourceCitation: "四灵道经、真武经与宋元封号材料对读", historicalScope: "中古玄武至宋元玄天上帝接受史层", confidence: "probable", notes: "关系说明历史承接，不把执明神君和宋元玄天上帝所有文本写成同一时刻。" }, worldId, now),

    relation({ key: "layout-qingcheng", sourceRef: "d:temple-layout-boundary", targetRef: "d:qingcheng-tianshidong-gate", kind: "contains", label: "山门左右双殿实例", evidenceType: "material-evidence", sourceCitation: "青城山天师洞现存宫观像设资料", historicalScope: "青城山天师洞现存像设层", notes: "只证明天师洞具体布局，不推定全国通例。" }, worldId, now),
    relation({ key: "qingcheng-qinglong", sourceRef: "d:qingcheng-tianshidong-gate", targetRef: "d:qinglong-mengzhang", kind: "contains", label: "山门左殿供奉", evidenceType: "material-evidence", sourceCitation: "青城山天师洞山门现存像设资料", historicalScope: "青城山天师洞地方宫观层", notes: "左殿位置是该宫观的实际陈设。" }, worldId, now),
    relation({ key: "qingcheng-baihu", sourceRef: "d:qingcheng-tianshidong-gate", targetRef: "d:baihu-jianbing", kind: "contains", label: "山门右殿供奉", evidenceType: "material-evidence", sourceCitation: "青城山天师洞山门现存像设资料", historicalScope: "青城山天师洞地方宫观层", notes: "右殿位置是该宫观的实际陈设。" }, worldId, now),
    relation({ key: "qingcheng-four-system", sourceRef: "d:qingcheng-tianshidong-gate", targetRef: "d:four-guardians-system", kind: "custom", direction: "undirected", strength: 3, label: "从四灵中选取青龙白虎守山门", evidenceType: "scholarly-inference", sourceCitation: "四灵道经与青城山天师洞像设对读", historicalScope: "道经方位神到地方宫观接受层", confidence: "probable", notes: "天师洞实例只实际连接青龙、白虎，不补造朱雀玄武殿。" }, worldId, now),

    relation({ key: "layout-fire-temple", sourceRef: "d:temple-layout-boundary", targetRef: "d:beijing-fire-temple-layout", kind: "contains", label: "前殿护法与主殿火祖实例", evidenceType: "material-evidence", sourceCitation: "北京火德真君庙现存建筑与像设资料", historicalScope: "明清至现代北京宫观层", notes: "火神庙中轴布局不替代其他宫观的殿序。" }, worldId, now),
    relation({ key: "fire-layout-lingguan", sourceRef: "d:beijing-fire-temple-layout", targetRef: "d:fire-temple-lingguan-hall", kind: "contains", label: "中轴前部隆恩殿", evidenceType: "material-evidence", sourceCitation: "北京火德真君庙现存建筑资料", historicalScope: "北京火德真君庙现存格局层", notes: "记录前部殿宇，不以现代参观动线推导神阶。" }, worldId, now),
    relation({ key: "fire-layout-fire-hall", sourceRef: "d:beijing-fire-temple-layout", targetRef: "d:fire-temple-fire-ancestor-hall", kind: "contains", label: "中轴主祀荧惑宝殿", evidenceType: "material-evidence", sourceCitation: "北京火德真君庙现存建筑资料", historicalScope: "北京火德真君庙现存格局层", notes: "殿序说明空间关系，不把王灵官设成火德星君的化身。" }, worldId, now),
    relation({ key: "lingguan-hall-wang", sourceRef: "d:fire-temple-lingguan-hall", targetRef: "l:wang-lingguan", kind: "contains", label: "隆恩殿供奉王灵官", evidenceType: "material-evidence", sourceCitation: "中国道教协会所载北京火神庙宫观资料", historicalScope: "明代隆恩真君崇祀与现存像设层", notes: "复用既有王灵官身份，不重复建立同名人物。" }, worldId, now),
    relation({ key: "fire-hall-huode", sourceRef: "d:fire-temple-fire-ancestor-hall", targetRef: "d:huode-yinghuo", kind: "contains", label: "荧惑宝殿主祀火德星君", evidenceType: "material-evidence", sourceCitation: "北京火德真君庙现存像设与祀典资料", historicalScope: "明清火德祀典与现存宫观层", notes: "火祖称谓在本宫观语境中连接火德与荧惑。" }, worldId, now),
    relation({ key: "huode-zhurong-distinction", sourceRef: "d:huode-yinghuo", targetRef: "n:zhurong", kind: "custom", direction: "undirected", strength: 2, label: "火神职能相近而来源不同", evidenceType: "scholarly-inference", sourceCitation: "先秦祝融材料与明清火德真君庙资料对读", historicalScope: "先秦火正神格与明清星君祀典比较层", confidence: "certain", notes: "共享火德和南方象征不能证明祝融就是火德荧惑星君。" }, worldId, now),
    relation({ key: "wang-huode-colocated", sourceRef: "l:wang-lingguan", targetRef: "d:huode-yinghuo", kind: "custom", direction: "undirected", strength: 3, label: "同在北京火德真君庙而分居前殿与主殿", evidenceType: "material-evidence", sourceCitation: "北京火德真君庙现存殿宇与神像资料", historicalScope: "北京火德真君庙地方宫观层", confidence: "certain", notes: "同观并祀说明护法与主祀分工，不建立同神关系。" }, worldId, now),

    relation({ key: "layout-taifu", sourceRef: "d:temple-layout-boundary", targetRef: "d:taifu-guan-layout", kind: "contains", label: "正殿与东西配殿实例", evidenceType: "material-evidence", sourceCitation: "太符观现存建筑与像设资料", historicalScope: "金明清太符观建筑像设层", notes: "只记录太符观实际格局，不用三殿结构概括全国宫观。" }, worldId, now),
    relation({ key: "taifu-layout-yuhuang", sourceRef: "d:taifu-guan-layout", targetRef: "d:taifu-yuhuang-hall", kind: "contains", label: "正殿", evidenceType: "material-evidence", sourceCitation: "太符观建筑与壁画资料", historicalScope: "太符观正殿现存层", notes: "正殿位置和玉皇像有现存建筑、彩塑支持。" }, worldId, now),
    relation({ key: "taifu-layout-houtu", sourceRef: "d:taifu-guan-layout", targetRef: "d:taifu-houtu-hall", kind: "contains", label: "东配殿", evidenceType: "material-evidence", sourceCitation: "太符观建筑与悬塑资料", historicalScope: "太符观东配殿现存层", notes: "后土圣母殿位于东侧是太符观具体格局。" }, worldId, now),
    relation({ key: "taifu-layout-five-peaks", sourceRef: "d:taifu-guan-layout", targetRef: "d:taifu-five-peaks-four-rivers-hall", kind: "contains", label: "西配殿", evidenceType: "material-evidence", sourceCitation: "太符观建筑与悬塑资料", historicalScope: "太符观西配殿现存层", notes: "五岳四渎在西配殿同见，不表示山神与水神身份合并。" }, worldId, now),
    relation({ key: "taifu-yuhuang-deity", sourceRef: "d:taifu-yuhuang-hall", targetRef: "c:jade-emperor", kind: "contains", label: "正殿供奉昊天玉皇上帝", evidenceType: "material-evidence", sourceCitation: "太符观玉皇殿现存彩塑资料", historicalScope: "太符观正殿像设层", notes: "复用既有玉皇上帝页面，只新增其在太符观的具体位置。" }, worldId, now),
    relation({ key: "taifu-yuhuang-daily", sourceRef: "d:taifu-yuhuang-hall", targetRef: "d:taifu-daily-deities-365", kind: "contains", label: "殿内朝元图神班", evidenceType: "material-evidence", sourceCitation: "太符观玉皇殿现存壁画资料", historicalScope: "太符观壁画神班层", notes: "三百六十五是画面题材所示规模，不转换成未经题名的个人页。" }, worldId, now),
    relation({ key: "taifu-houtu-deity", sourceRef: "d:taifu-houtu-hall", targetRef: "c:houtu-sovereign", kind: "contains", label: "东配殿后土圣母主位", evidenceType: "material-evidence", sourceCitation: "太符观后土圣母殿现存神像资料", historicalScope: "太符观东配殿地方接受层", confidence: "probable", notes: "以既有后土皇地祇页面承接高位身份，同时保留太符观九尊圣母像和地方称呼的具体差异。" }, worldId, now),
    relation({ key: "taifu-five-peaks-system", sourceRef: "d:taifu-five-peaks-four-rivers-hall", targetRef: "c:five-peaks-system", kind: "contains", label: "殿中五岳帝像", evidenceType: "material-evidence", sourceCitation: "太符观五岳殿现存神像资料", historicalScope: "太符观西配殿像设层", notes: "复用五岳大帝体系页面，具体五尊在殿内居中。" }, worldId, now),
    relation({ key: "taifu-four-rivers", sourceRef: "d:taifu-five-peaks-four-rivers-hall", targetRef: "d:four-rivers-system", kind: "contains", label: "殿侧江河淮济四渎神像", evidenceType: "material-evidence", sourceCitation: "太符观五岳殿现存神像与悬塑资料", historicalScope: "太符观西配殿像设层", notes: "四渎以组合页保存，未辨清尊号前不虚构四位姓名。" }, worldId, now),
    relation({ key: "five-peaks-four-rivers-pair", sourceRef: "c:five-peaks-system", targetRef: "d:four-rivers-system", kind: "custom", direction: "undirected", strength: 3, label: "山川祀典与太符观同殿并列", evidenceType: "ritual-record", sourceCitation: "历代岳渎祀典与太符观五岳殿资料", historicalScope: "国家山川礼制与地方宫观像设交会层", confidence: "certain", notes: "五岳和四渎是两套成组地祇，同殿并列不互相隶属。" }, worldId, now)
  ];

  return [...sourceRelations, ...structuralRelations];
}

const eventSpecs = [
  { key: "shangqing-liujia-names", track: "textual-evidence", title: "《上清六甲祈祷秘法》逐名保存六甲阳神", summary: "元德、虚逸、节略、潺仁、通元、化石六位依甲子至甲寅次序列出，名与字不再被现代简称吞掉。", displayDate: "现存《正统道藏》本，成书年代待考", start: "900", end: "1445", era: "六甲经法文本层", entityRef: "d:liujia-yang-register", refs: ["s:shangqing-liujia-qidao", "d:jiazi-yuande", "d:jiayin-huashi"] },
  { key: "shangqing-liuding-names", track: "textual-evidence", title: "《上清六甲祈祷秘法》逐名保存六丁阴神", summary: "文伯、文公、文通、文卿、升通、庭卿六位各有字与旬位，形成可核对的六丁名录。", displayDate: "现存《正统道藏》本，成书年代待考", start: "900", end: "1445", era: "六丁经法文本层", entityRef: "d:liuding-yin-register", refs: ["s:shangqing-liujia-qidao", "d:dingmao-wenbo", "d:dingsi-tingqing"] },
  { key: "dingjia-pair-framework", track: "religious-institutions", title: "六甲与六丁按六旬组成十二守护神位", summary: "六位旬首甲神与六位旬中丁神依地支配对，构成召请、护持和坛位排列的基本轴。", displayDate: "中古以后六丁六甲科仪", start: "900", end: "1445", era: "六丁六甲科仪制度层", entityRef: "d:dingjia-system", refs: ["d:liujia-yang-register", "d:liuding-yin-register", "d:dingjia-ritual-array"] },
  ...pairRows.map(([key, title, jiaKey, dingKey], index) => ({ key: `pair-${index + 1}`, track: "religious-institutions", title: `${title}形成旬值配对`, summary: `原文把${title.replace("：", "中的")}置于同一旬内；项目以配对关系展示，不增加亲属或主从叙事。`, displayDate: "中古以后六丁六甲科仪", start: "900", end: "1445", era: "六旬配对制度层", entityRef: `d:${key}`, refs: [`d:${jiaKey}`, `d:${dingKey}`, "d:dingjia-ritual-array"] })),
  { key: "lingbao-liuding-variants", track: "textual-evidence", title: "《灵宝六丁秘法》留下六丁玉女异名", summary: "文公仁贵、叔通仁富或仁集、庭卿仁叔等写法与另一名录并存，说明六丁名称不能只保留一张现代标准表。", displayDate: "约唐末至五代传本", start: "900", end: "1100", era: "灵宝六丁传本层", entityRef: "s:lingbao-liuding", refs: ["d:liuding-yin-register", "d:dingjia-variant-ledger", "d:dingwei-shengtong"] },
  { key: "daofa-alternate-register", track: "textual-evidence", title: "卷一百七十五保存另一套十二玉女符谱", summary: "灵珠、须台、神元、凤环等名号与六甲阳神、六丁阴神名录同卷并存，证明不同符谱不能自动互作别名。", displayDate: "宋元材料，元末明初汇编", start: "1200", end: "1445", era: "《道法会元》多谱并存层", entityRef: "d:alternate-twelve-jade-women", refs: ["cs:daofa-huiyuan", "d:dingjia-variant-ledger"] },
  { key: "variant-ledger-method", track: "textual-evidence", title: "六丁六甲异名按旬位和名次校勘", summary: "虚逸与逸虚、衮昌与兖昌、升通与叔通均先比较旬位、相邻项和法本，再决定合页或保留存疑。", displayDate: "本项目版本校勘层", start: "2026", end: "2026", era: "现代资料整理层", entityRef: "d:dingjia-variant-ledger", refs: ["s:shangqing-liujia-qidao", "s:lingbao-liuding", "cs:daofa-huiyuan"] },
  { key: "zhenling-liuding-distinction", track: "textual-evidence", title: "《真灵位业图》六丁使者与后世六丁名讳分层", summary: "齐梁名录只见六丁使者合称，后世六位名、字不得无证据倒填为第四阶原有完整名单。", displayDate: "齐梁神谱与后世六丁经法比较", start: "500", end: "1445", era: "六丁名位接受史层", entityRef: "z4:liuding-shizhe", refs: ["d:liuding-yin-register", "d:dingjia-variant-ledger"] },
  { key: "four-guardians-register", track: "textual-evidence", title: "道经以孟章、监兵、陵光、执明命名四灵", summary: "青龙、白虎、朱雀、玄武在方位之外获得可检索神名，为坛场与宫观守护关系提供文本坐标。", displayDate: "中古以后四灵道经材料", start: "700", end: "1445", era: "四灵道教神位层", entityRef: "d:four-guardians-system", refs: ["s:qidi-ziting-yansheng", "d:qinglong-mengzhang", "d:xuanwu-zhiming"] },
  { key: "qingcheng-gate", track: "religious-institutions", title: "青城山天师洞以青龙白虎分守山门左右", summary: "山门左殿祀青龙孟章，右殿祀白虎监兵，为四灵方位神进入具体宫观空间的清楚实例。", displayDate: "现存青城山天师洞像设", start: "1800", end: "2026", era: "青城山地方宫观层", entityRef: "d:qingcheng-tianshidong-gate", refs: ["d:qinglong-mengzhang", "d:baihu-jianbing", "d:four-guardians-system"] },
  { key: "local-layout-boundary", track: "religious-institutions", title: "宫观神位布局按具体建筑和时代分别记录", summary: "山门双殿、灵官前殿与火祖主殿、玉皇正殿与东西配殿三种结构并列存在，没有一张全国统一模板。", displayDate: "金元明清至现存宫观比较", start: "1200", end: "2026", era: "地方宫观像设比较层", entityRef: "d:temple-layout-boundary", refs: ["d:qingcheng-tianshidong-gate", "d:beijing-fire-temple-layout", "d:taifu-guan-layout"] },
  { key: "fire-temple-lingguan", track: "religious-institutions", title: "北京火德真君庙以隆恩殿奉王灵官", summary: "王灵官居前部护法殿，使入观者先经过守门与纠察神位，再进入火德主祀空间。", displayDate: "明代以后灵官崇祀与现存宫观", start: "1400", end: "2026", era: "北京火神庙护法殿层", entityRef: "d:fire-temple-lingguan-hall", refs: ["l:wang-lingguan", "d:beijing-fire-temple-layout"] },
  { key: "fire-temple-fire-ancestor", track: "religious-institutions", title: "荧惑宝殿以火德荧惑星君为火祖主祀", summary: "火德、荧惑与火祖称谓在这座宫观的主殿、祭日和像设中相接，同时与王灵官身份分开。", displayDate: "明清火德祀典与现存宫观", start: "1500", end: "2026", era: "北京火神庙主祀层", entityRef: "d:fire-temple-fire-ancestor-hall", refs: ["d:huode-yinghuo", "d:beijing-fire-temple-layout"] },
  { key: "fire-temple-sequence", track: "religious-institutions", title: "火德真君庙形成护法前殿与火祖主殿次序", summary: "隆恩殿和荧惑宝殿沿中轴前后分工，空间顺序说明礼拜路径，却不等于天界固定官阶。", displayDate: "现存北京火德真君庙格局", start: "1500", end: "2026", era: "北京火神庙建筑像设层", entityRef: "d:beijing-fire-temple-layout", refs: ["d:fire-temple-lingguan-hall", "d:fire-temple-fire-ancestor-hall"] },
  { key: "taifu-founded", track: "religious-institutions", title: "太符观于金承安五年创建醮坛", summary: "碑刻与建筑资料把太符观的制度现场落在公元一二〇〇年，后续殿宇和像设又经历明清重修。", displayDate: "金承安五年（1200）", start: "1200", end: "1200", precision: "exact", era: "金代太符观创建层", entityRef: "d:taifu-guan-layout", refs: ["d:taifu-yuhuang-hall", "d:taifu-houtu-hall", "d:taifu-five-peaks-four-rivers-hall"] },
  { key: "taifu-yuhuang", track: "religious-institutions", title: "太符观以昊天玉皇上帝殿为正殿", summary: "玉皇像居正殿核心，侍臣、侍女与壁画神班共同构成朝元空间，具体陈设由现存彩塑壁画支持。", displayDate: "金代建筑与后续像设保存层", start: "1200", end: "2026", era: "太符观正殿像设层", entityRef: "d:taifu-yuhuang-hall", refs: ["c:jade-emperor", "d:taifu-daily-deities-365"] },
  { key: "taifu-houtu", track: "religious-institutions", title: "太符观东配殿形成后土圣母像设", summary: "九尊圣母像和出巡、游归悬塑展现地方后土信仰的具体形态，不能反推所有早期后土都是同一女性形象。", displayDate: "明代配殿与现存像设", start: "1500", end: "2026", era: "太符观后土地方接受层", entityRef: "d:taifu-houtu-hall", refs: ["c:houtu-sovereign", "d:taifu-guan-layout"] },
  { key: "taifu-five-peaks-four-rivers", track: "religious-institutions", title: "太符观西配殿并列五岳与江河淮济四渎", summary: "五岳帝像居中，四渎神像列于南北两侧，山川神系同殿而仍保留各自制度来源。", displayDate: "明清五岳殿与现存像设", start: "1500", end: "2026", era: "太符观岳渎像设层", entityRef: "d:taifu-five-peaks-four-rivers-hall", refs: ["c:five-peaks-system", "d:four-rivers-system"] },
  { key: "taifu-daily-365", track: "religious-institutions", title: "太符观玉皇殿朝元图绘三百六十五值日神君", summary: "壁画保存明确规模和朝元主题，但未逐名辨认的画中神位仍以整体神班记录，不凭人数制造人物页。", displayDate: "太符观现存壁画层", start: "1200", end: "2026", era: "太符观朝元壁画层", entityRef: "d:taifu-daily-deities-365", refs: ["d:taifu-yuhuang-hall", "c:jade-emperor"] },
  { key: "huode-zhurong-distinction", track: "cult-evolution", title: "火德荧惑星君与祝融保持不同来源", summary: "两者共享火与南方象征，前者在明清火德祀典和宫观中形成具体主位，后者有更早的火正与季令材料。", displayDate: "先秦火正至明清火德祀典比较", start: "-400", end: "1900", era: "火神身份演变比较层", entityRef: "d:huode-yinghuo", refs: ["n:zhurong", "d:fire-temple-fire-ancestor-hall"] },
  { key: "xuanwu-zhenwu-distinction", track: "cult-evolution", title: "玄武执明与玄天上帝按阶段连接", summary: "龟蛇星象、四方守护神和披发仗剑的真武帝尊具有承接关系，知识库仍保留文本、形象与封号的时间差。", displayDate: "中古玄武神位至宋元真武帝尊", start: "500", end: "1400", era: "玄武至真武接受史层", entityRef: "d:xuanwu-zhiming", refs: ["c:zhenwu-emperor", "d:four-guardians-system"] }
];

function buildTimelineEvents(worldId, now) {
  return eventSpecs.map((row, index) => {
    const refs = [...new Set([row.entityRef, ...row.refs])];
    return {
      id: `timeline-event:${worldId}:mythology:daoism-dingjia-guardians:${row.key}`,
      worldId,
      entityId: resolveRef(row.entityRef, worldId),
      questId: "",
      sceneId: "",
      references: refs.map((reference) => ({ kind: "entity", id: resolveRef(reference, worldId) })),
      trackId: trackId(row.track, worldId),
      title: row.title,
      summary: row.summary,
      displayDate: row.displayDate,
      datePrecision: row.precision || "range",
      sortOrder: 617 + index,
      startValue: row.start,
      endValue: row.end,
      era: row.era,
      dependencyIds: [],
      updatedAt: now
    };
  });
}

function assertBatchShape() {
  if (figureSpecs.length !== 17) throw new Error(`${BATCH_LABEL}独立神位应为 17，实际为 ${figureSpecs.length}`);
  if (institutionSpecs.length !== 24) throw new Error(`${BATCH_LABEL}制度与宫观条目应为 24，实际为 ${institutionSpecs.length}`);
  if (sourceRows.length !== 3) throw new Error(`${BATCH_LABEL}古籍来源条目应为 3，实际为 ${sourceRows.length}`);
  if (eventSpecs.length !== 26) throw new Error(`${BATCH_LABEL}时间事件应为 26，实际为 ${eventSpecs.length}`);
  if (new Set([...figureSpecs, ...institutionSpecs].map((row) => row.key)).size !== 41) throw new Error(`${BATCH_LABEL}条目键重复`);
}

function buildDingjiaGuardiansBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const figures = figureSpecs.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const institutions = institutionSpecs.map((row, index) => buildInstitutionEntity(row, figures.length + index, worldId, now));
  const sources = sourceRows.map((row, index) => buildSourceEntity(row, figures.length + institutions.length + index, worldId, now));
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...figures, ...institutions, ...sources],
    figures,
    institutions,
    locations: [],
    sources,
    relations: buildRelations(worldId, now),
    timelineEvents: buildTimelineEvents(worldId, now),
    featuredEntityIds: [
      dingjiaEntityId("dingjia-system", worldId),
      dingjiaEntityId("qinglong-mengzhang", worldId),
      dingjiaEntityId("huode-yinghuo", worldId),
      dingjiaEntityId("temple-layout-boundary", worldId)
    ]
  };
}

module.exports = {
  BATCH_KEY,
  BATCH_LABEL,
  SOURCE_CITATION,
  buildDingjiaGuardiansBatch,
  dingjiaEntityId,
  dingjiaSourceId
};
