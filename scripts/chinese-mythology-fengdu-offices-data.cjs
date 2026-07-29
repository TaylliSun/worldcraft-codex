const { WORLD_ID, categoryId } = require("./chinese-mythology-history-data.cjs");
const { buddhismEntityId } = require("./chinese-mythology-buddhism-transmission-data.cjs");
const { celestialEntityId, celestialSourceId } = require("./chinese-mythology-celestial-bureaucracy-data.cjs");
const { folkEntityId } = require("./chinese-mythology-folk-syncretism-data.cjs");
const { trackId } = require("./chinese-mythology-zhenling-first-rank-data.cjs");
const { zhenlingSeventhEntityId } = require("./chinese-mythology-zhenling-seventh-rank-data.cjs");

const BATCH_KEY = "daoism-fengdu-offices-20";
const BATCH_LABEL = "道教神谱扩展 · 酆都二十四宫与考召坛班";
const SOURCE_CITATION = "《道法会元》卷二百六十二至二百六十三〈酆都考召大法〉";

function fengduEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:daoism-fengdu-offices:${key}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function figure(key, title, sourceNameForm, cluster, role, iconography, options = {}) {
  return {
    key,
    title,
    sourceNameForm,
    cluster,
    role,
    iconography,
    aliases: options.aliases || "",
    sourceSection: options.sourceSection || "卷二百六十二酆都帅班",
    identityType: options.identityType || "神祇",
    confidence: options.confidence || "明确",
    boundary: options.boundary || "原卷没有交代人间籍贯、师承或独立庙祀，当前不作补写。"
  };
}

const figureSpecs = [
  figure("dai-yuan", "戴远（酆都检法大使）", "西台御史检法行刑提点通访大使戴远", "酆都帅班", "检法、行刑与通访", "金甲皂袍，执枪，戴兜鍪，着绿靴。"),
  figure("han-yi", "韩仪（九丑大魔王）", "酆都使者九丑大魔王韩仪", "酆都帅班", "酆都使者与馘魔", "青袍金甲，金冠红发，执剑。"),
  figure("jiao-zhongchang", "焦仲昌（左禁司杀君）", "左禁神咤司杀君焦，字仲昌", "酆都帅班", "左禁、司杀与兵头统摄", "三头六臂，皂衣金甲，黄巾，手执器仗。", { aliases: "焦仲卿", boundary: "同卷后文作焦仲卿，另一符文简称焦真君；当前作为同卷异文，不另拆身份。" }),
  figure("zeng-yuandao", "曾元道（右禁司杀君）", "右禁神咤司杀君曾，字元道", "酆都帅班", "右禁、司杀与兵头统摄", "两目四臂，皂衣金甲，黄巾，手执器仗。", { aliases: "曾元善", boundary: "同卷后文作曾元善；元道也可能是字，当前保留两种写法而不虚构本名。" }),
  figure("ma-zong", "马宗（酆都雷音大神）", "酆都雷音大神马宗，字世昌", "酆都帅班", "雷音、追摄与馘灭邪精", "三头六臂，蹙金罗帽，皂衣金甲绿靴，执金枪。", { aliases: "马世昌" }),
  figure("song-youqing", "宋友卿（酆都不动尊神）", "酆都不动尊神宋友卿，字元通", "酆都帅班", "不动镇摄与捉祟", "蹙金罗帽，皂袍铁皂靴，手执金戟。", { aliases: "宋元通" }),
  figure("wu-lun", "乌轮（酆都追捉大将）", "酆都追捉大将乌轮", "酆都帅班", "追捉邪鬼", "皂衣黄巾，执剑。"),
  figure("tu-cha", "屠叉（酆都追捉大将）", "酆都追捉大将屠叉", "酆都帅班", "追捉邪鬼", "皂衣黄巾，执剑。"),

  figure("wei-xi", "韦锡（酆都捉鬼将）", "酆都捉鬼将韦锡", "内坛八将", "捉鬼与鹰吏协行", "黄巾鬼面，赤发皂袍，银甲金带，执剑；金雕红毛金睛。", { sourceSection: "卷二百六十二酆都内坛八将" }),
  figure("liu-yue", "刘鉣（酆都缚鬼将）", "酆都缚鬼将刘鉣", "内坛八将", "缚鬼与犬吏协行", "黄巾青面，赤发皂帔，银甲金带，左执金索、右执剑；猛兽口吐火。", { sourceSection: "卷二百六十二酆都内坛八将" }),
  figure("meng-e", "孟锷（酆都拷鬼将）", "酆都拷鬼将孟锷", "内坛八将", "拷鬼", "黄巾青鬼面，赤发白笠，白袍银甲，执铁棒。", { sourceSection: "卷二百六十二酆都内坛八将" }),
  figure("che-zi", "车资（酆都大将）", "酆都大将车资", "内坛八将", "压鬼", "赤发青面，黄巾皂衣银甲，手提大梁。", { sourceSection: "卷二百六十二酆都内坛八将" }),
  figure("xia-kui", "夏奎（酆都大将）", "酆都大将夏奎", "内坛八将", "内坛考召", "赤发青鬼面，黄巾皂衣，着铁甲。", { sourceSection: "卷二百六十二酆都内坛八将" }),
  figure("lie-weizhi", "劣惟直（酆都大将）", "酆都大将劣惟直", "内坛八将", "内坛考召", "黄巾青面，鬼形，皂衣金甲，执杖。", { sourceSection: "卷二百六十二酆都内坛八将" }),
  figure("sang-tongguai", "桑通怪（酆都大将）", "酆都大将桑通怪", "内坛八将", "追摄与缚鬼", "牛头形，绯袍，虎皮搭膊，执戟与麻绳。", { sourceSection: "卷二百六十二酆都内坛八将" }),

  figure("zhang-yuanlian", "张元廉（酆都外坛将）", "张元廉", "外坛八将", "外坛守卫与考召", "黄巾皂衣麻鞋，执铁棒。", { sourceSection: "卷二百六十二酆都外坛八将" }),
  figure("chen-yuanqing", "陈元清（酆都外坛将）", "陈元清", "外坛八将", "外坛守卫与考召", "黄巾皂衣麻鞋，执铁棒。", { sourceSection: "卷二百六十二酆都外坛八将" }),
  figure("li-yuande", "李元德（酆都外坛将）", "李元德", "外坛八将", "外坛守卫与考召", "黄巾皂衣麻鞋，执铁棒。", { sourceSection: "卷二百六十二酆都外坛八将" }),
  figure("fan-yuanzhang", "范元章（酆都外坛将）", "范元章", "外坛八将", "外坛守卫与考召", "黄巾皂衣麻鞋，执铁棒。", { sourceSection: "卷二百六十二酆都外坛八将" }),
  figure("du-yuanzhen", "杜元贞（社元贞异文）", "社元贞", "外坛八将", "外坛守卫与考召", "黄巾皂衣麻鞋，执铁棒。", { aliases: "社元贞", sourceSection: "卷二百六十二酆都外坛八将", confidence: "存疑", boundary: "现用页面作社元贞，另一传本作杜元贞；规范题名暂采杜，原写法完整保留。" }),
  figure("liu-yuanfu", "刘元夫（酆都外坛将）", "刘元夫", "外坛八将", "外坛守卫与考召", "黄巾皂衣麻鞋，执铁棒。", { sourceSection: "卷二百六十二酆都外坛八将" }),
  figure("wang-changyuan", "王昌元（酆都外坛将）", "王昌元", "外坛八将", "外坛守卫与考召", "黄巾皂衣麻鞋，执铁棒。", { sourceSection: "卷二百六十二酆都外坛八将" }),
  figure("jia-daoyuan", "贾道元（酆都外坛将）", "贾道元", "外坛八将", "外坛守卫与考召", "黄巾皂衣麻鞋，执铁棒。", { sourceSection: "卷二百六十二酆都外坛八将" }),

  figure("ma-sheng", "马胜（酆都直坛将）", "马胜", "直坛四将", "直坛守卫与摄鬼", "红巾皂袍绿靴，执剑。", { sourceSection: "卷二百六十二酆都直坛四将" }),
  figure("ma-cunzhong", "马存中（酆都直坛将）", "马存中", "直坛四将", "直坛守卫与截鬼", "红巾皂袍绿靴，执剑。", { sourceSection: "卷二百六十二酆都直坛四将" }),
  figure("chen-yuanbo", "陈元伯（酆都直坛将）", "陈元伯", "直坛四将", "直坛守卫与摄鬼", "红巾皂袍绿靴，执剑。", { sourceSection: "卷二百六十二酆都直坛四将" }),
  figure("guo-zhongyou", "郭仲友（酆都直坛将）", "郭仲友", "直坛四将", "直坛守卫与摄鬼", "红巾皂袍绿靴，执剑。", { sourceSection: "卷二百六十二酆都直坛四将" }),
  figure("wang-jing", "王靖（提魂太子）", "提魂太子王靖", "酆都一行典吏", "提魂", "本行没有另写服色或器仗。", { sourceSection: "卷二百六十二酆都一行典吏", confidence: "存疑", boundary: "原行断句紧连太玄夜光玉女，当前只按可辨的“提魂太子王靖”建页。" }),
  figure("yao-duan", "姚端（战鬼大将）", "战鬼大将姚端", "酆都一行典吏", "战鬼", "与同段诸将并记黄巾铁甲，各执器械。", { sourceSection: "卷二百六十二酆都一行典吏" }),
  figure("lu-chu", "卢处（擒鬼大将）", "擒鬼大将卢处", "酆都一行典吏", "擒鬼", "与同段诸将并记黄巾铁甲，各执器械。", { sourceSection: "卷二百六十二酆都一行典吏" }),

  figure("xun-gongda", "荀公达（黑天大神）", "黑天大神荀；后文作荀公达", "酆都二使者", "布天罗与驱缚", "皂衣金甲，跣足，玉带散发，伏剑。", { aliases: "黑天大神荀", sourceSection: "卷二百六十二酆都二使者" }),
  figure("liu-guangzhong", "刘光仲（黑雾大神）", "黑雾大神刘；后文作刘光仲", "酆都二使者", "布地网与驱缚", "皂袍金甲，跣足，玉带散发，仗剑。", { aliases: "黑雾大神刘", sourceSection: "卷二百六十二酆都二使者" }),
  figure("chen-yan", "陈彦（酆都天医官）", "陈彦", "酆都四大天医官吏", "天医官吏", "原段只说四官服色同上清冠履，未逐人分写。", { sourceSection: "卷二百六十二酆都四大天医官吏" }),
  figure("shen-da", "沈大（酆都天医官）", "沈大", "酆都四大天医官吏", "天医官吏", "原段只说四官服色同上清冠履，未逐人分写。", { sourceSection: "卷二百六十二酆都四大天医官吏" }),
  figure("wang-zhen", "王真（酆都天医官）", "王真", "酆都四大天医官吏", "天医官吏", "原段只说四官服色同上清冠履，未逐人分写。", { sourceSection: "卷二百六十二酆都四大天医官吏" }),
  figure("wang-an", "王安（酆都功曹使者）", "功曹使者王安", "功曹使者", "功曹传命", "红抹额，黄衣，手执骨朵，形如直符。", { sourceSection: "卷二百六十二酆都功曹使者" }),
  figure("lu-jian", "卢见（酆都功曹使者）", "功曹使者卢见", "功曹使者", "功曹传命", "红抹额，黄衣，手执骨朵，形如直符。", { sourceSection: "卷二百六十二酆都功曹使者" }),
  figure("xu-mai", "许迈（酆都天符上将）", "天符上将许迈", "天符上将", "奉天符行令", "皂衣，执枝子一把。", { sourceSection: "卷二百六十二酆都天符上将" }),
  figure("tao-hui", "陶惠（酆都天符上将）", "天符上将陶惠", "天符上将", "奉天符行令", "皂衣，执枝子一把。", { sourceSection: "卷二百六十二酆都天符上将" }),
  figure("wang-jian", "王坚（酆都天符上将）", "天符上将王坚", "天符上将", "奉天符行令", "皂衣，执枝子一把。", { sourceSection: "卷二百六十二酆都天符上将" }),
  figure("deng-ai", "邓艾（酆都太守形态）", "酆都太守邓艾，济明", "酆都太守", "统兵、考召与馘灭邪精", "同卷符文称酆都太守统兵三万，未另列固定服色。", { aliases: "邓艾济明、酆都太守艾济明", sourceSection: "卷二百六十二酆都太守", identityType: "历史人物", boundary: "页面记录法书中的酆都太守神格，不把这一职任倒写进三国人物生平；“济明”的性质仍待版本校勘。" }),
  figure("wang-yuanzhen", "王元真（风雷狱主）", "风雷狱主王元真", "九狱直狱神将", "主风雷狱", "九狱神将并记红袍包巾皂衣，各执铁棒。", { sourceSection: "卷二百六十二酆都九狱直狱神将" }),
  figure("yao-quan", "姚全（金刚狱主）", "金刚狱主姚全", "九狱直狱神将", "主金刚狱", "九狱神将并记红袍包巾皂衣，各执铁棒。", { sourceSection: "卷二百六十二酆都九狱直狱神将" }),
  figure("zhou-sheng", "周胜（铜柱狱主）", "铜柱狱主周胜", "九狱直狱神将", "主铜柱狱", "九狱神将并记红袍包巾皂衣，各执铁棒。", { sourceSection: "卷二百六十二酆都九狱直狱神将" }),
  figure("wang-wentong", "王文通（普掠狱主）", "普掠狱主王文通", "九狱直狱神将", "主普掠狱", "九狱神将并记红袍包巾皂衣，各执铁棒。", { sourceSection: "卷二百六十二酆都九狱直狱神将" }),

  figure("cha-shengzhen", "查胜真（太玄夜光玉女）", "太玄夜光玉女查胜真", "夜光玉女敕捉坛班", "奉酆都敕命摄捉神鬼", "符文以日月天光、地光灵真写其神光，未给出服饰。", { sourceSection: "卷二百六十二太玄夜光玉女查胜真捉神符" }),
  figure("yin-guang", "阴光（左福大神）", "左福大神阴光", "夜光玉女敕捉坛班", "随查胜真奉行", "本段只列尊号与姓名，没有独立形象说明。", { sourceSection: "卷二百六十二太玄夜光玉女查胜真捉神符" }),
  figure("qiong-meidi", "琼妹嫡（总圣大将）", "总圣大将琼妹嫡", "夜光玉女敕捉坛班", "随查胜真奉行", "本段只列尊号与姓名，没有独立形象说明。", { sourceSection: "卷二百六十二太玄夜光玉女查胜真捉神符" }),

  figure("pan-yanshen", "潘严申（酆都考召院第一将）", "第一大将潘严申", "酆都考召院十将", "以铁火棒考鬼", "头戴铁帽，手执铁棒。", { sourceSection: "卷二百六十三摄酆都十将罗鞫法" }),
  figure("liu-chen", "刘谌（酆都考召院第二将）", "第二大将刘谌", "酆都考召院十将", "以铁火轮考鬼", "头戴铁帽，手执铁棒。", { sourceSection: "卷二百六十三摄酆都十将罗鞫法" }),
  figure("luo-shen", "罗深（酆都考召院第三将）", "第三大将罗深", "酆都考召院十将", "以铁火索考鬼", "头戴铁帽，手执棘槌。", { sourceSection: "卷二百六十三摄酆都十将罗鞫法" }),
  figure("geng-yuan", "耿渊（酆都考召院第四将）", "第四大将耿渊", "酆都考召院十将", "以铁火锤考鬼", "头戴铁帽，手执铁槌。", { sourceSection: "卷二百六十三摄酆都十将罗鞫法" }),
  figure("zhou-xuandao", "周宣道（酆都考召院第五将）", "第五大将周宣道", "酆都考召院十将", "以铁火城摄鬼", "头戴铁帽，皂衣执剑。", { sourceSection: "卷二百六十三摄酆都十将罗鞫法" }),
  figure("wei-lang", "魏朗（酆都考召院第六将）", "第六大将魏朗", "酆都考召院十将", "以铁火券考鬼", "头戴铁帽，皂衣皂靴，掩心铁甲，执棒。", { sourceSection: "卷二百六十三摄酆都十将罗鞫法" }),
  figure("xue-guang", "薛光（酆都考召院第七将）", "第七大将薛光", "酆都考召院十将", "以铁火池考鬼", "头戴铁帽，皂衣铁甲，执戟。", { sourceSection: "卷二百六十三摄酆都十将罗鞫法" }),
  figure("feng-bao", "冯宝（冯宾异文）", "第八大将冯宝；召文作冯宾", "酆都考召院十将", "以黑风飙考鬼", "头戴铁帽，皂衣皂靴，执戟。", { aliases: "冯宾", sourceSection: "卷二百六十三摄酆都十将罗鞫法", confidence: "存疑", boundary: "同段标题名与召文名不同，先以冯宝为主名并保留冯宾异文，不拆成两将。" }),
  figure("ke-ang", "柯昴（酆都考召院第九将）", "第九大将柯昴", "酆都考召院十将", "以雷公斧考鬼", "头戴铁帽，皂袍铁甲，执铁斧与戟。", { sourceSection: "卷二百六十三摄酆都十将罗鞫法" }),
  figure("shi-zhu", "史助（酆都考召院第十将）", "第十大将史助", "酆都考召院十将", "以雷公鞭考鬼", "头戴铁冠，着铁甲，执铁棒。", { sourceSection: "卷二百六十三摄酆都十将罗鞫法" })
].map((row, index) => ({ ...row, sourceOrder: index + 1 }));

const palaceSpecs = [
  ["zhoujue-yintian", "纣绝阴天宫", "上六宫第一", "上宫名录第一宫；原卷未在本段展开其专属职掌。"],
  ["taisha-liangshi-zongtian", "泰杀谅事宗天宫", "上六宫第二", "上宫名录第二宫；谅事等字只按底本保留。"],
  ["mingchen-naifan-wucheng", "明晨耐犯武城天宫", "上六宫第三", "上宫名录第三宫；不由宫名推造刑罚程序。"],
  ["tianzhao-zuiqi", "恬照罪气天宫", "上六宫第四", "上宫名录第四宫；现用简体底本作罪气，繁体页面作罪炁。"],
  ["zongling-qifei", "宗灵七非天宫", "上六宫第五", "上宫名录第五宫；七非是宫名组成部分。"],
  ["gansi-lianwan-lu", "敢司连宛屡天宫", "上六宫第六", "上宫名录第六宫；连宛屡依现用底本，不改成近形字。"],
  ["xiuming-zongling-dongtian", "休明总灵洞天宫", "下六宫第一", "下宫名录第一宫；原卷说下宫统神。"],
  ["xuansi-zhongzheng-zongling", "玄司重正宗灵天宫", "下六宫第二", "下宫名录第二宫；不把重正解释成现代司法复审。"],
  ["tongxian-shengling-xiwei", "统仙升灵希微天宫", "下六宫第三", "下宫名录第三宫；升灵与希微只保留原名。"],
  ["zhengzhen-shaoling-wansi", "正真绍灵宛司天宫", "下六宫第四", "下宫名录第四宫；宛司的断句仍从原行。"],
  ["yunlou-yuji-mingchen", "云娄玉纪明晨天宫", "下六宫第五", "下宫名录第五宫；云娄、玉纪、明晨合成一宫名。"],
  ["chongxu-chiying", "崇虚赤映天宫", "下六宫第六", "下宫名录第六宫；不与《真灵位业图》近名职号自动合并。"]
];

function institution(key, title, sourceNameForm, kind, summary, options = {}) {
  return {
    key,
    title,
    sourceNameForm,
    kind,
    summary,
    members: options.members || [],
    list: options.list || "",
    sourceSection: options.sourceSection || "卷二百六十二〈酆都考召大法〉",
    confidence: options.confidence || "明确",
    variants: options.variants || "本页只代表《酆都考召大法》所见宋元法书层，不覆盖六朝罗酆名录、东岳阴司或佛教地狱。"
  };
}

const institutionSpecs = [
  institution("fengdu-examination-system", "酆都考召法坛体系", "酆都考召大法", "法坛体系", "以北阴酆都大帝、二十四宫、帅班、内外坛、狱主与考召院组成的宋元法书执行网络。"),
  institution("twenty-four-palaces", "酆都二十四宫结构", "山上有十二宫领鬼，下有十二宫统神……故二十四宫也", "冥府宫城", "原卷说明上下各十二宫、左右各六宫；当前段落只显出上六宫和下六宫共十二个宫名。", { members: palaceSpecs.map(([key]) => `fd:${key}`) }),
  ...palaceSpecs.map(([key, title, position, summary]) => institution(key, title, title, "冥府宫城", `${position}。${summary}`, { sourceSection: "卷二百六十二酆都二十四宫段" })),
  institution("marshal-register", "酆都帅班", "酆都帅班", "神将坛班", "戴远、韩仪、焦曾二司杀君、马宋二神、朗灵馘魔大神与乌轮、屠叉等组成的帅将段。", { members: ["fd:dai-yuan", "fd:han-yi", "fd:jiao-zhongchang", "fd:zeng-yuandao", "fd:ma-zong", "fd:song-youqing", "f:guan-di", "fd:wu-lun", "fd:tu-cha"] }),
  institution("inner-eight", "酆都内坛八将", "韦刘王孟车夏劣桑八大将军", "神将坛班", "八将分别承担捉、缚、枷、拷和强力镇压；七人姓名可辨，枷鬼将只残留王姓。", { members: ["fd:wei-xi", "fd:liu-yue", "fd:incomplete-wang-general", "fd:meng-e", "fd:che-zi", "fd:xia-kui", "fd:lie-weizhi", "fd:sang-tongguai"] }),
  institution("incomplete-wang-general", "枷鬼将王（名缺）", "酆都枷鬼将王", "残名神职", "原行在王字后直接转入形象描述，无法确认完整姓名；页面只保存王姓、枷鬼职与所见形象。", { confidence: "存疑", variants: "不得把残名补成任意王姓人物，也不计作完整独立神祇姓名。" }),
  institution("outer-eight", "酆都外坛八将", "张元廉、陈元清、李元德、范元章、社元贞、刘元夫、王昌元、贾道元", "神将坛班", "外坛八将共用黄巾、皂衣、麻鞋与铁棒形象；第五名在传本间有社、杜异文。", { members: ["fd:zhang-yuanlian", "fd:chen-yuanqing", "fd:li-yuande", "fd:fan-yuanzhang", "fd:du-yuanzhen", "fd:liu-yuanfu", "fd:wang-changyuan", "fd:jia-daoyuan"] }),
  institution("altar-four", "酆都直坛四将", "马胜、马存中、陈元伯、郭仲友", "神将坛班", "四将都以红巾、皂袍、绿靴和剑出现，负责法坛近侧的守卫与执行。", { members: ["fd:ma-sheng", "fd:ma-cunzhong", "fd:chen-yuanbo", "fd:guo-zhongyou"] }),
  institution("clerks-and-captors", "酆都一行典吏与追擒将", "酆都一行典吏", "职群", "紧接直坛四将的一组提魂、远捉、斩头、撼鬼、战鬼与擒鬼职名；只为可辨完整姓名者建人物页。", { members: ["fd:wang-jing", "fd:yao-duan", "fd:lu-chu"], list: "提魂太子王靖；五方远捉大将一行字形不稳；斩头沥血大将曾；撼鬼大将赵；战鬼大将姚端；擒鬼大将卢处。" }),
  institution("four-strength-men", "酆都四大力士", "太乙力士张、三天力士胡、斩妖力士孙、斩鬼力士唐", "合称神职", "四名力士只见职号与姓氏，均记黄巾执斧；不以一个姓氏虚构完整人物。"),
  institution("two-envoys", "酆都二使者", "黑天大神荀、黑雾大神刘", "神将坛班", "黑天大神荀与黑雾大神刘在后文补见公达、光仲，分别承担布天罗与布地网的驱缚职能。", { members: ["fd:xun-gongda", "fd:liu-guangzhong"] }),
  institution("four-doctors", "酆都四大天医官吏", "陈彦、沈大、王真、徐", "天医职群", "四名天医官吏与三十六掌药童子并列；前三名可辨，第四名仅存徐姓。", { members: ["fd:chen-yan", "fd:shen-da", "fd:wang-zhen"], list: "陈彦、沈大、王真、徐；第四位姓名残缺，不另建人物。" }),
  institution("medicine-children", "酆都掌药童子三十六人", "掌药童子三十六人", "合称神职", "三十六名掌药童子随四大天医官吏列入酆都职班，原卷没有逐名。"),
  institution("gongcao-envoys", "酆都功曹使者二员", "功曹使者二员，王安、卢见", "神将坛班", "王安、卢见两名功曹使者以直符式装束传命。", { members: ["fd:wang-an", "fd:lu-jian"] }),
  institution("tianfu-generals", "酆都天符上将三员", "天符上将三员，许迈、陶惠、王坚", "神将坛班", "许迈、陶惠、王坚三名上将奉天符行令，原卷同记皂衣与枝子。", { members: ["fd:xu-mai", "fd:tao-hui", "fd:wang-jian"] }),
  institution("nine-prisons", "酆都九狱直狱神将", "风雷、火翳、金刚、溟泠、铜柱、镬汤、火车、屠割、普掠九狱", "冥狱职群", "九狱各列狱主，四名完整姓名可辨，五名只存姓氏；共同形象为红袍、包巾、皂衣与铁棒。", { members: ["fd:wang-yuanzhen", "fd:yao-quan", "fd:zhou-sheng", "fd:wang-wentong", "fd:partial-prison-masters"] }),
  institution("partial-prison-masters", "五位残名狱主", "火翳狱主郑、溟泠狱主时、镬汤狱主刁、火车狱主孔、屠割狱主武", "残名神职", "五位狱主只有职名和姓氏，作为一组可检索记录保存，不计成五个完整人物。", { confidence: "存疑", variants: "后续若有可靠异本补足姓名，应新增校勘记录，不直接覆盖本卷残名。" }),
  institution("six-path-officials", "酆都六道冥官", "天道曹、鬼道田、地道崔、神道济、饿鬼道陈、畜生道高", "冥官职群", "六道冥官按道别与姓氏排列，均记幞头、红抹额、皂袍、绿靴；原文没有完整姓名。", { list: "天道冥官曹；鬼道冥官田；地道冥官崔；神道冥官济；饿鬼道冥官陈；畜生道冥官高。" }),
  institution("case-judges", "酆都诸司案判官", "追魂案至五道案诸判官", "冥府案司", "追魂、监生、考掠、罪业、断刑、受生、刀山、剑树、注死生禄病算善等案各见判官姓氏，合组保存。", { list: "追魂案王；监生案班；考掠案訾；罪业案贾；断刑案赵；主罪案张；受生案杨；受牒案符；刀山案祝；剑树案李；注死案薛；执对案永；注生案卢；注禄案成；注病案黄；注算案周；注善案采；欠杀案程；劫监案刘；放生案董；五道案郭。" }),
  institution("three-yuan-and-officials", "三元判官与一百二十曹僚官吏", "三元判官，一百二十曹僚官吏", "冥府官署", "卷二百六十三召请三元判官与一百二十曹僚官吏，人数明确而姓名未列。", { sourceSection: "卷二百六十三〈酆都考召大法〉" }),
  institution("ritual-retinue", "酆都考召法坛随班", "内外坛八将、三十六狱卒、七十二真官、九狱主吏、直坛土地", "法坛随班", "卷二百六十三把内外坛将、狱卒、真官、狱吏与土地一并召至法席，构成仪式性的到坛队伍。", { sourceSection: "卷二百六十三〈酆都考召大法〉", members: ["fd:inner-eight", "fd:outer-eight", "fd:nine-prisons", "fd:altar-four"] }),
  institution("night-light-command", "太玄夜光玉女敕捉坛班", "太玄夜光玉女查胜真、左福大神阴光、总圣大将琼妹嫡", "神将坛班", "查胜真奉酆都敕命，阴光与琼妹嫡同列奉行；该段以神光照破鬼群。", { members: ["fd:cha-shengzhen", "fd:yin-guang", "fd:qiong-meidi"] }),
  institution("interrogation-ten", "酆都考召院十将", "摄酆都十将罗鞫法", "神将坛班", "潘严申至史助依次配十柱、十轮的铁火器象，形成独立于内外坛八将的十将序列。", { sourceSection: "卷二百六十三摄酆都十将罗鞫法", members: ["fd:pan-yanshen", "fd:liu-chen", "fd:luo-shen", "fd:geng-yuan", "fd:zhou-xuandao", "fd:wei-lang", "fd:xue-guang", "fd:feng-bao", "fd:ke-ang", "fd:shi-zhu"] }),
  institution("ten-pillar-array", "酆都十柱十轮法象", "铁火棒、轮、索、锤、城、券、池、黑风飙、雷公斧、雷公鞭", "科仪法象", "十项法象与考召院十将按序相连，是罗鞫法中的器象结构，不是十件现存文物。", { sourceSection: "卷二百六十三摄酆都十将罗鞫法", members: ["fd:pan-yanshen", "fd:liu-chen", "fd:luo-shen", "fd:geng-yuan", "fd:zhou-xuandao", "fd:wei-lang", "fd:xue-guang", "fd:feng-bao", "fd:ke-ang", "fd:shi-zhu"] }),
  institution("variant-ledger", "酆都考召名号异文簿", "焦仲昌/焦仲卿、曾元道/曾元善、社元贞/杜元贞、冯宝/冯宾", "文献异文", "集中保存同卷或传本间的近名差异，避免搜索时误拆成两位神将。", { confidence: "存疑", sourceSection: "卷二百六十二至二百六十三异文对照", members: ["fd:jiao-zhongchang", "fd:zeng-yuandao", "fd:du-yuanzhen", "fd:feng-bao", "fd:incomplete-wang-general"] })
];

function renderFigureArticle(row) {
  return [
    `<p>${escapeHtml(row.title)}见于${escapeHtml(SOURCE_CITATION)}，在${escapeHtml(row.cluster)}中承担${escapeHtml(row.role)}。本页只写法书能够确认的名号、次序和形象。</p>`,
    "<h2>原典名号</h2>",
    `<p>底本写作“${escapeHtml(row.sourceNameForm)}”，位置在${escapeHtml(row.sourceSection)}。别名、字号和同段异写仅用于检索，不据此增造第二位神将。</p>`,
    "<h2>坛班位置</h2>",
    `<p>${escapeHtml(row.title)}归入${escapeHtml(row.cluster)}，可见职掌是${escapeHtml(row.role)}。这项职任属于酆都考召法的仪式组织，不等于地方官署的真实建制。</p>`,
    "<h2>形象记录</h2>",
    `<p>${escapeHtml(row.iconography)}形象字段逐项取自本段文字；没有写出的坐骑、颜色、法器与面貌继续留白。</p>`,
    "<h2>身份边界</h2>",
    `<p>关于${escapeHtml(row.title)}，${escapeHtml(row.boundary)}六朝《真灵位业图》鬼官、东岳阴司和佛教地狱中的近名者，必须另有证据才能建立同一关系。</p>`,
    "<h2>创作使用</h2>",
    `<p>若为${escapeHtml(row.title)}补写对白、战斗招式、性格、个人经历或坛外故事，新增段落须标注 Worldcraft Codex 原创改编。</p>`
  ].join("");
}

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: fengduEntityId(row.key, worldId),
    worldId,
    type: "character",
    title: row.title,
    slug: `mythology-daoism-fengdu-${row.key}`,
    summary: `${row.title}是${SOURCE_CITATION}所列${row.cluster}成员，职掌为${row.role}。`,
    content: renderFigureArticle(row),
    tags: ["中国神话史", "道教", "酆都", "酆都考召大法", row.cluster, row.title],
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
      earliestSource: SOURCE_CITATION,
      sourceLocation: row.sourceSection,
      narrativeEra: "北阴酆都考召法的仪式神圣时间",
      historicalLayer: "宋元",
      domains: row.role,
      iconography: row.iconography,
      worship: "当前只确认法书坛班身份，不据一卷神将表推定独立宫观主祀。",
      regionalVariants: row.boundary,
      confidence: row.confidence,
      editorialStatus: "复核中",
      originalAdaptation: "false"
    }
  };
}

function renderInstitutionArticle(row) {
  const list = row.list ? `<h2>卷内名目</h2><p>${escapeHtml(row.list)}</p>` : "";
  return [
    `<p>${escapeHtml(row.summary)}</p>`,
    "<h2>原典位置</h2>",
    `<p>${escapeHtml(SOURCE_CITATION)}在${escapeHtml(row.sourceSection)}写作“${escapeHtml(row.sourceNameForm)}”。本页按${escapeHtml(row.kind)}收录，不把人数或残姓变成完整人物。</p>`,
    "<h2>制度位置</h2>",
    `<p>${escapeHtml(row.title)}属于酆都考召法的宫府、神将或案司层。条目之间的包含关系用于还原卷内编排，不表示所有时代都采用同一套冥府组织。</p>`,
    list,
    "<h2>资料边界</h2>",
    `<p>${escapeHtml(row.title)}的版本边界是：${escapeHtml(row.variants)}原文未写的成员、刑期、审判流程、地理尺寸与上下级关系保持空白。</p>`,
    "<h2>创作使用</h2>",
    `<p>若围绕${escapeHtml(row.title)}设计案件、宫室平面、刑狱规则、对白或新成员，必须明确标注 Worldcraft Codex 原创改编。</p>`
  ].join("");
}

function buildInstitutionEntity(row, order, worldId, now) {
  return {
    id: fengduEntityId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-daoism-fengdu-system-${row.key}`,
    summary: `${row.title}：${row.summary}`,
    content: renderInstitutionArticle(row),
    tags: ["中国神话史", "道教", "酆都", "酆都考召大法", row.kind, row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "daoism-offices"),
    order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "道教",
      institutionKind: row.kind,
      hierarchyLevel: "《道法会元》酆都考召法坛层",
      jurisdiction: row.summary,
      formationPeriod: "宋元酆都法材料，元末明初汇入《道法会元》",
      earliestSource: SOURCE_CITATION,
      sourceLocation: row.sourceSection,
      variants: row.variants,
      confidence: row.confidence
    }
  };
}

function resolveRef(reference, worldId) {
  const split = reference.indexOf(":");
  const scope = reference.slice(0, split);
  const key = reference.slice(split + 1);
  if (scope === "fd") return fengduEntityId(key, worldId);
  if (scope === "c") return celestialEntityId(key, worldId);
  if (scope === "cs") return celestialSourceId(key, worldId);
  if (scope === "f") return folkEntityId(key, worldId);
  if (scope === "b") return buddhismEntityId(key, worldId);
  if (scope === "z7") return zhenlingSeventhEntityId(key, worldId);
  throw new Error(`未知酆都考召引用：${reference}`);
}

function relation({ key, sourceRef, targetRef, kind, label, direction = "directed", strength = 5, evidenceType = "primary-text", confidence = "certain", sourceCitation = SOURCE_CITATION, historicalScope = "宋元酆都考召法书层", notes }, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:daoism-fengdu-offices:${key}`,
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

function buildRelations(worldId, now) {
  const rows = [...figureSpecs, ...institutionSpecs];
  const rootRef = "fd:fengdu-examination-system";
  const sourceRelations = rows.map((row) => relation({
    key: `source-${row.key}`,
    sourceRef: `fd:${row.key}`,
    targetRef: "cs:daofa-huiyuan",
    kind: "source",
    label: "酆都考召法卷次出处",
    notes: `“${row.sourceNameForm}”按${row.sourceSection}保存；关系只证明本卷列名、职群或宫名。`
  }, worldId, now));
  const systemRelations = rows.filter((row) => row.key !== "fengdu-examination-system").map((row) => relation({
    key: `system-${row.key}`,
    sourceRef: rootRef,
    targetRef: `fd:${row.key}`,
    kind: "contains",
    label: "酆都考召法宫府、坛班或职官",
    notes: `${row.title}只进入卷二百六十二至二百六十三这一法书版本层。`
  }, worldId, now));
  const groupRelations = institutionSpecs.flatMap((row) => row.members.map((memberRef, index) => relation({
    key: `${row.key}-member-${index + 1}`,
    sourceRef: `fd:${row.key}`,
    targetRef: memberRef,
    kind: "contains",
    label: `${row.title}成员或组成项`,
    notes: `成员按“${row.sourceNameForm}”的卷内顺序或同段归组；残名仍保留为职官页。`
  }, worldId, now)));
  const explicitRelations = [
    relation({ key: "emperor-authority", sourceRef: "c:fengdu-emperor", targetRef: rootRef, kind: "contains", label: "考召法奉北阴酆都大帝敕令", notes: "关系指向本法书权威结构，不把所有冥府传统都设为同一行政体系。" }, worldId, now),
    relation({ key: "luofeng-setting", sourceRef: "c:luofeng-fengdu", targetRef: "fd:twenty-four-palaces", kind: "contains", label: "法书在酆都山布置上下二十四宫", notes: "二十四宫是仪式宇宙空间，不对应现代可测量城市。" }, worldId, now),
    relation({ key: "emperor-marshal-register", sourceRef: "c:fengdu-emperor", targetRef: "fd:marshal-register", kind: "contains", label: "酆都大帝敕下帅班", notes: "帅班按卷二百六十二神将段建立。" }, worldId, now),
    relation({ key: "guandi-langling", sourceRef: "f:guan-di", targetRef: "fd:marshal-register", kind: "custom", label: "朗灵馘魔大神关子云进入酆都帅班", evidenceType: "ritual-record", confidence: "probable", notes: "同卷后文直接召关羽；此处连接现有关帝多层身份页，不另造一位同名关神。" }, worldId, now),
    relation({ key: "rank-seven-parallel", sourceRef: rootRef, targetRef: "z7:seventh-rank-fengdu-officials", kind: "custom", direction: "undirected", strength: 3, label: "宋元考召法与六朝酆都鬼官名录并行", evidenceType: "scholarly-inference", confidence: "probable", notes: "两者都以北阴酆都为中心，但时代、职官表和仪式功能不同，不能直接互补姓名。" }, worldId, now),
    relation({ key: "dongyue-parallel", sourceRef: rootRef, targetRef: "c:dongyue-emperor", kind: "custom", direction: "undirected", strength: 2, label: "与东岳冥府系统并行而不合并", evidenceType: "scholarly-inference", confidence: "probable", notes: "东岳治死传统与酆都法可以在后世并见，但本卷没有把两套官署写成一张统一组织图。" }, worldId, now),
    relation({ key: "taishan-fujun-parallel", sourceRef: rootRef, targetRef: "c:taishan-fujun", kind: "custom", direction: "undirected", strength: 2, label: "与泰山府君治死传统分层", evidenceType: "scholarly-inference", confidence: "probable", notes: "近似职能不构成同一神或固定上下级。" }, worldId, now),
    relation({ key: "buddhist-hell-parallel", sourceRef: rootRef, targetRef: "b:ksitigarbha", kind: "custom", direction: "undirected", strength: 2, label: "与地藏救度及佛教地狱叙事并行", evidenceType: "scholarly-inference", confidence: "probable", notes: "六道、狱名等词汇可在跨传统环境中交会，本页不把地藏纳入酆都考召帅班。" }, worldId, now),
    relation({ key: "qinghua-rescue-parallel", sourceRef: rootRef, targetRef: "c:qinghua-jiuku", kind: "custom", direction: "undirected", strength: 2, label: "与太乙救苦炼度系统并行", evidenceType: "ritual-record", confidence: "probable", notes: "救苦、破狱与考召各有科仪语境，不用一条统属关系抹平差别。" }, worldId, now),
    relation({ key: "city-god-parallel", sourceRef: rootRef, targetRef: "c:city-god-system", kind: "custom", direction: "undirected", strength: 2, label: "与地方城隍阴司分层", evidenceType: "scholarly-inference", confidence: "probable", notes: "地方城隍的行政隐喻与酆都法坛可互相借用，但本卷没有给出全国城隍隶属表。" }, worldId, now),
    relation({ key: "night-light-marshal-cooperation", sourceRef: "fd:night-light-command", targetRef: "fd:marshal-register", kind: "custom", label: "敕捉符并召焦曾、马宋与夜光坛班", notes: "同卷符文把两组神将并列召请，证明仪式协行，不证明亲属关系。" }, worldId, now),
    relation({ key: "ten-generals-distinct", sourceRef: "fd:interrogation-ten", targetRef: "fd:inner-eight", kind: "custom", direction: "undirected", strength: 3, label: "考召院十将与内坛八将分列", notes: "人数、姓名与法象均不同，不能把十将当成内坛八将的另一组别名。" }, worldId, now)
  ];
  return [...sourceRelations, ...systemRelations, ...groupRelations, ...explicitRelations];
}

const eventSpecs = [
  ["palace-frame", "religious-institutions", "酆都山被写成上下二十四宫", "原卷以上十二宫领鬼、下十二宫统神，并说上下左右各有六宫，形成二十四宫框架。", "fd:twenty-four-palaces", ["c:luofeng-fengdu", "c:fengdu-emperor"]],
  ["upper-six", "religious-institutions", "上六宫宫名依次列出", "纣绝阴天至敢司连宛屡六宫按次序保留，宫名本身不被扩写成刑狱故事。", "fd:zhoujue-yintian", ["fd:taisha-liangshi-zongtian", "fd:mingchen-naifan-wucheng", "fd:tianzhao-zuiqi", "fd:zongling-qifei", "fd:gansi-lianwan-lu"]],
  ["lower-six", "religious-institutions", "下六宫宫名依次列出", "休明总灵洞天至崇虚赤映六宫按次序保留，原段只说下宫统神。", "fd:xiuming-zongling-dongtian", ["fd:xuansi-zhongzheng-zongling", "fd:tongxian-shengling-xiwei", "fd:zhengzhen-shaoling-wansi", "fd:yunlou-yuji-mingchen", "fd:chongxu-chiying"]],
  ["twelve-visible-boundary", "textual-evidence", "二十四宫结构只显出十二个宫名", "总数与现存列名必须分开：未显名的另十二宫不由编辑者命名。", "fd:twenty-four-palaces", ["cs:daofa-huiyuan"]],
  ["marshal-register", "religious-institutions", "酆都帅班由检法、司杀、雷音与追捉神将组成", "戴远以下神将按卷内次序进入帅班，职号与形象各自保留。", "fd:marshal-register", ["fd:dai-yuan", "fd:han-yi", "fd:wu-lun", "fd:tu-cha"]],
  ["dai-inspection", "religious-institutions", "戴远以检法行刑通访大使居帅班之首", "长职号同时包含检法、行刑、提点与通访，当前不压缩成现代单一岗位。", "fd:dai-yuan", ["fd:marshal-register"]],
  ["han-magic-king", "religious-institutions", "韩仪以九丑大魔王兼酆都使者列位", "魔王在这里是法书神将尊号，不能直接等同邪恶叙事角色。", "fd:han-yi", ["fd:marshal-register"]],
  ["left-right-prohibitions", "religious-institutions", "焦仲昌与曾元道分掌左右禁司杀", "两位兵头大将军以左右对称职号列名，并在后段出现仲卿、元善异写。", "fd:jiao-zhongchang", ["fd:zeng-yuandao", "fd:variant-ledger"]],
  ["ma-song-pair", "religious-institutions", "马宗与宋友卿组成雷音、不动二神", "符文常把马世昌与宋元通并列召请，保留协行关系而不写成亲属。", "fd:ma-zong", ["fd:song-youqing", "fd:marshal-register"]],
  ["guan-langling", "cult-evolution", "关羽以朗灵馘魔大神身份进入酆都法", "这一层连接关羽后世降魔神格，不覆盖三国史传、佛寺伽蓝或明清武财神身份。", "f:guan-di", ["fd:marshal-register"]],
  ["pursuit-generals", "religious-institutions", "乌轮与屠叉并列为追捉大将", "两将同着皂衣黄巾、同执剑，原卷没有进一步写明分工。", "fd:wu-lun", ["fd:tu-cha"]],
  ["inner-eight-formed", "religious-institutions", "韦刘王孟车夏劣桑组成内坛八将", "八将按捉、缚、枷、拷及强力镇摄排成法坛核心执行班。", "fd:inner-eight", ["fd:wei-xi", "fd:liu-yue", "fd:meng-e", "fd:sang-tongguai"]],
  ["inner-four-functions", "religious-institutions", "捉缚枷拷四职在内坛前段分列", "韦锡、刘鉣、残名王将与孟锷分别对应捉、缚、枷、拷，残名不补全。", "fd:wei-xi", ["fd:liu-yue", "fd:incomplete-wang-general", "fd:meng-e"]],
  ["inner-heavy-generals", "religious-institutions", "车夏劣桑四将承担重压与追摄形象", "车资提梁、桑通怪持绳等形象在卷内逐项保存，不从器仗反推个人传记。", "fd:che-zi", ["fd:xia-kui", "fd:lie-weizhi", "fd:sang-tongguai"]],
  ["wang-name-truncated", "textual-evidence", "枷鬼将只残留王姓", "原行在王字后转入形象，项目以残名神职页保存，不把它计成完整姓名。", "fd:incomplete-wang-general", ["fd:inner-eight", "cs:daofa-huiyuan"]],
  ["outer-eight-formed", "religious-institutions", "外坛八将以共同服色和铁棒列班", "张元廉至贾道元八人逐名建页，共同形象不替代各自姓名。", "fd:outer-eight", ["fd:zhang-yuanlian", "fd:jia-daoyuan"]],
  ["du-she-variant", "textual-evidence", "外坛第五将出现社元贞与杜元贞异文", "规范题名暂采杜元贞，现用页面的社元贞写法仍完整可见。", "fd:du-yuanzhen", ["fd:variant-ledger", "cs:daofa-huiyuan"]],
  ["altar-four-formed", "religious-institutions", "马胜、马存中、陈元伯、郭仲友列为直坛四将", "四将以相同装束执剑近坛守卫，与内外坛八将分组。", "fd:altar-four", ["fd:ma-sheng", "fd:ma-cunzhong", "fd:chen-yuanbo", "fd:guo-zhongyou"]],
  ["clerks-captors", "religious-institutions", "典吏段列出提魂、战鬼与擒鬼职名", "王靖、姚端、卢处姓名可辨；其余残姓和断句只留在职群正文。", "fd:clerks-and-captors", ["fd:wang-jing", "fd:yao-duan", "fd:lu-chu"]],
  ["strength-men", "religious-institutions", "四大力士仅以职号和姓氏列名", "太乙、三天、斩妖、斩鬼四力士都记黄巾执斧，项目不虚构名字。", "fd:four-strength-men", ["fd:ritual-retinue"]],
  ["two-envoys", "religious-institutions", "黑天与黑雾二使者分布天罗地网", "荀公达、刘光仲的完整写法由同卷后段补见，前段简称仍作为别名保存。", "fd:two-envoys", ["fd:xun-gongda", "fd:liu-guangzhong"]],
  ["four-doctors", "religious-institutions", "四大天医官吏进入酆都坛班", "陈彦、沈大、王真与残名徐并列，医疗职群不被改写成四篇虚构传记。", "fd:four-doctors", ["fd:chen-yan", "fd:shen-da", "fd:wang-zhen"]],
  ["medicine-children", "religious-institutions", "三十六掌药童子随天医官吏列位", "人数可考而姓名未显，作为集体神职保留。", "fd:medicine-children", ["fd:four-doctors"]],
  ["gongcao-envoys", "religious-institutions", "王安与卢见列为功曹使者", "两使者以直符式装束传命，卷内未写更长谱系。", "fd:gongcao-envoys", ["fd:wang-an", "fd:lu-jian"]],
  ["tianfu-generals", "religious-institutions", "许迈、陶惠、王坚列为天符上将", "三员上将同着皂衣并执枝子，当前不与同名历史人物自动合并。", "fd:tianfu-generals", ["fd:xu-mai", "fd:tao-hui", "fd:wang-jian"]],
  ["deng-ai-prefect", "cult-evolution", "邓艾以酆都太守形态进入考召法", "法书神格与三国人物史传分层，济明字样仍待版本校勘。", "fd:deng-ai", ["fd:fengdu-examination-system"]],
  ["nine-prisons", "religious-institutions", "九狱各列直狱神将", "风雷至普掠九狱形成执行序列，四名完整姓名与五名残姓分开保存。", "fd:nine-prisons", ["fd:wang-yuanzhen", "fd:yao-quan", "fd:zhou-sheng", "fd:wang-wentong"]],
  ["partial-prison-masters", "textual-evidence", "五位狱主只保存姓氏", "郑、时、刁、孔、武分别对应五狱，后续须凭异本补名而不能猜名。", "fd:partial-prison-masters", ["fd:nine-prisons", "cs:daofa-huiyuan"]],
  ["six-path-officials", "religious-institutions", "六道冥官按道别与姓氏列班", "天、鬼、地、神、饿鬼、畜生六道各有冥官，姓名均不完整。", "fd:six-path-officials", ["fd:fengdu-examination-system"]],
  ["case-judges", "religious-institutions", "诸司案判官按追魂、生死、罪业与刑狱分案", "二十一项案司只见判官姓氏，项目以一页保存司法分工。", "fd:case-judges", ["fd:fengdu-examination-system"]],
  ["three-yuan-officials", "religious-institutions", "三元判官与一百二十曹僚官吏被召入法席", "卷二百六十三给出规模而不逐名，人数不转换成匿名角色。", "fd:three-yuan-and-officials", ["fd:ritual-retinue"]],
  ["ritual-retinue", "religious-institutions", "三十六狱卒、七十二真官与九狱主吏构成随班", "卷二百六十三把多组未具名吏兵与内外坛将一并召请。", "fd:ritual-retinue", ["fd:inner-eight", "fd:outer-eight", "fd:nine-prisons"]],
  ["night-light", "religious-institutions", "查胜真奉酆都敕命摄捉神鬼", "夜光玉女捉神符以日月、地光与神光组织其敕捉形象。", "fd:cha-shengzhen", ["fd:night-light-command"]],
  ["yin-qiong-assist", "religious-institutions", "阴光与琼妹嫡随夜光玉女奉行", "两位神将只在本段列名，未补写服色或独立传说。", "fd:yin-guang", ["fd:qiong-meidi", "fd:cha-shengzhen"]],
  ["ten-generals", "religious-institutions", "酆都考召院十将按第一至第十列位", "潘严申至史助各有次序、器仗与召词，独立于内外坛八将。", "fd:interrogation-ten", ["fd:pan-yanshen", "fd:shi-zhu"]],
  ["ten-pillars", "religious-institutions", "十柱十轮法象与十将逐项相配", "铁火棒至雷公鞭构成罗鞫法器象次序，不被当作现实遗物。", "fd:ten-pillar-array", ["fd:interrogation-ten"]],
  ["feng-bao-variant", "textual-evidence", "第八将出现冯宝与冯宾异写", "同段名次与召文不一致，当前作为同一位置的异文而非两人。", "fd:feng-bao", ["fd:variant-ledger", "cs:daofa-huiyuan"]],
  ["daofa-compilation", "textual-evidence", "《道法会元》汇存酆都考召法材料", "卷二百六十二至二百六十三保存宫名、帅班、符咒和召将次序，只代表一支宋元法书传统。", "cs:daofa-huiyuan", ["fd:fengdu-examination-system", "fd:marshal-register", "fd:interrogation-ten"]],
  ["rank-seven-distinction", "textual-evidence", "六朝酆都鬼官与宋元考召坛班分层", "两套材料共享酆都中心，却不能用后世帅班补齐早期名录。", "fd:fengdu-examination-system", ["z7:seventh-rank-fengdu-officials"]],
  ["dongyue-distinction", "cult-evolution", "酆都考召与东岳治死传统在后世并行", "职能交会不等于机构合并，东岳大帝和泰山府君仍保留独立来源层。", "c:dongyue-emperor", ["c:taishan-fujun", "fd:fengdu-examination-system"]],
  ["buddhist-distinction", "cult-evolution", "六道与地狱词汇跨传统交会而神班不合并", "地藏救度、太乙救苦与酆都考召分别建页，避免拼成一套自古统一的冥府。", "b:ksitigarbha", ["c:qinghua-jiuku", "fd:fengdu-examination-system"]],
  ["city-god-distinction", "textual-evidence", "地方城隍阴司不被倒写进酆都考召卷", "行政语言相近仍须按地方祀典和法书卷次分别核对。", "c:city-god-system", ["fd:fengdu-examination-system"]],
  ["variant-ledger", "textual-evidence", "同卷近名被集中记录而不重复建神", "焦、曾、杜、冯及残名王将的异文状态在关系与页面中同时可查。", "fd:variant-ledger", ["fd:jiao-zhongchang", "fd:zeng-yuandao", "fd:du-yuanzhen", "fd:feng-bao"]],
  ["no-unified-underworld", "religious-institutions", "案例库保持多套冥府系统并列", "六朝罗酆、宋元酆都法、东岳治死、城隍阴司、道教救苦与佛教地狱各有来源和时间边界。", "fd:fengdu-examination-system", ["z7:seventh-rank-fengdu-officials", "c:dongyue-emperor", "c:city-god-system", "c:qinghua-jiuku", "b:ksitigarbha"]]
];

function buildTimelineEvents(worldId, now) {
  const trackRanges = {
    "religious-institutions": ["1100", "1445", "宋元酆都法制度层"],
    "textual-evidence": ["1300", "1445", "《道法会元》文献整理层"],
    "cult-evolution": ["1000", "1900", "跨传统冥府接受层"]
  };
  return eventSpecs.map(([key, trackKey, title, summary, entityRef, references], index) => {
    const refs = [...new Set([entityRef, ...references])];
    const [startValue, endValue, era] = trackRanges[trackKey];
    return {
      id: `timeline-event:${worldId}:mythology:daoism-fengdu-offices:${key}`,
      worldId,
      entityId: resolveRef(entityRef, worldId),
      questId: "",
      sceneId: "",
      references: refs.map((reference) => ({ kind: "entity", id: resolveRef(reference, worldId) })),
      trackId: trackId(trackKey, worldId),
      title,
      summary,
      displayDate: trackKey === "cult-evolution" ? "宋元以后多传统并行发展" : "宋元法书材料，元末明初汇编",
      datePrecision: "range",
      sortOrder: 573 + index,
      startValue,
      endValue,
      era,
      dependencyIds: [],
      updatedAt: now
    };
  });
}

function assertBatchShape() {
  if (figureSpecs.length !== 58) throw new Error(`${BATCH_LABEL}确名神将应为 58，实际为 ${figureSpecs.length}`);
  if (institutionSpecs.length !== 36) throw new Error(`${BATCH_LABEL}宫府与职群应为 36，实际为 ${institutionSpecs.length}`);
  if (palaceSpecs.length !== 12) throw new Error(`${BATCH_LABEL}现用段落显名宫室应为 12，实际为 ${palaceSpecs.length}`);
  if (eventSpecs.length !== 44) throw new Error(`${BATCH_LABEL}时间事件应为 44，实际为 ${eventSpecs.length}`);
  if (new Set([...figureSpecs, ...institutionSpecs].map((row) => row.key)).size !== 94) throw new Error(`${BATCH_LABEL}条目键重复`);
}

function buildFengduOfficesBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const figures = figureSpecs.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const institutions = institutionSpecs.map((row, index) => buildInstitutionEntity(row, figures.length + index, worldId, now));
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...figures, ...institutions],
    figures,
    institutions,
    locations: [],
    sources: [],
    relations: buildRelations(worldId, now),
    timelineEvents: buildTimelineEvents(worldId, now),
    featuredEntityIds: [
      fengduEntityId("fengdu-examination-system", worldId),
      fengduEntityId("twenty-four-palaces", worldId),
      fengduEntityId("inner-eight", worldId),
      fengduEntityId("interrogation-ten", worldId)
    ]
  };
}

module.exports = {
  BATCH_KEY,
  BATCH_LABEL,
  SOURCE_CITATION,
  buildFengduOfficesBatch,
  fengduEntityId
};
