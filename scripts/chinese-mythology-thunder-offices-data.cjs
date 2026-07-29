const { WORLD_ID, categoryId } = require("./chinese-mythology-history-data.cjs");
const { celestialEntityId, celestialSourceId } = require("./chinese-mythology-celestial-bureaucracy-data.cjs");
const { trackId } = require("./chinese-mythology-zhenling-first-rank-data.cjs");

const BATCH_KEY = "daoism-thunder-offices-19";
const BATCH_LABEL = "道教神谱扩展 · 雷城、五雷与玉枢神位";
const SOURCE_CITATION = "《道法会元》卷五十六〈上清玉府大法〉“雷霆分司”";

function thunderEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:daoism-thunder-offices:${key}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const figureSpecs = [
  ["liubo-tianzhu", "六波天主帝君", "雷霆高位", "列在雷霆神位表首位，原卷没有在此段补写谱系。"],
  ["yufu-shangqing-wuleishi", "玉府上卿五雷使", "玉枢统摄", "五雷使被解释为雷城专司，统摄五雷并关申诸司。"],
  ["yushu-yuan-zhenjun", "玉枢院真君", "玉枢统摄", "以玉枢院名号列位，职位与具体法派传承须分卷核对。"],
  ["penglai-dushui-shizhe", "蓬莱都水使者", "水府分司", "蓬莱司专理水职、云气、江海河渎与泉源。"],
  ["central-yellow-thunder-lord", "中央黄帝雷君", "五方雷君", "五方雷君之一，以中央与黄色标明方位。"],
  ["eastern-green-thunder-lord", "东方青帝雷君", "五方雷君", "五方雷君之一，以东方与青色标明方位。"],
  ["southern-red-thunder-lord", "南方赤帝雷君", "五方雷君", "五方雷君之一，以南方与赤色标明方位。"],
  ["western-white-thunder-lord", "西方白帝雷君", "五方雷君", "五方雷君之一，以西方与白色标明方位。"],
  ["northern-black-thunder-lord", "北方黑帝雷君", "五方雷君", "五方雷君之一，以北方与黑色标明方位。"],
  ["leibo-green-emperor", "雷伯青帝雷君", "雷霆高位", "尊号把雷伯、青帝与雷君组合在同一神位。"],
  ["shangqing-chizhi-dafajun", "上清赤知大法君", "上清玉府", "原卷按上清玉府法系列名，赤知二字照底本保存。"],
  ["yufu-yuanming-left-wenjun", "上清玉府元命左文君", "上清玉府", "以元命、左文君职号进入玉府神位。"],
  ["yushu-deputy-yuanjun", "玉枢院副元君", "玉枢统摄", "明确写出玉枢院副职，不推定与其他卷同号者必为一神。"],
  ["rain-master-yuanjun", "雨师元君", "风雨雷电", "在雷霆神位表中以雨师元君尊号单列。"],
  ["wind-fire-yuanjun", "风火元君", "风雨雷电", "风与火在此合成一个神位名号。"],
  ["wind-earl-yuanjun", "风伯元君", "风雨雷电", "以风伯和元君合号出现，不能直接并入所有早期风伯传说。"],
  ["rain-master-immortal-elder", "雨师仙君丈人", "风雨雷电", "雨师、仙君、丈人三层称号在原行合写。"],
  ["electric-light-yuansheng", "电光元圣君", "风雨雷电", "以电光为职能标志的神位。"],
  ["fire-earl-wind-thunder", "火伯风霆君", "风雨雷电", "火伯与风霆在原名中合为一位。"],
  ["dragon-thunder-lord", "龙雷君", "五雷分型", "以龙雷为名，属于本卷五雷语汇中的神位。"],
  ["thunder-command-green-lord", "雷令青君", "雷令执行", "以雷令与青君合号列名。"],
  ["rolling-water-dragon-lord", "捲水龙君", "水府分司", "尊号写捲水，保留水势与龙君的组合。"],
  ["dongling-shangbai-yuanjun", "东灵上柏元君", "雷霆高位", "原段只列尊号，不另补地域与家世。"],
  ["dipper-heaven-thunder-zhentai", "斗中真人天雷真宰", "斗枢雷令", "斗中真人与天雷真宰两重称号在原行连写。"],
  ["spirit-thunder-zhentai", "神雷真宰", "五雷分型", "以神雷为名的真宰神位。"],
  ["dragon-thunder-xianzai", "龙雷仙宰", "五雷分型", "以龙雷为名的仙宰神位。"],
  ["water-thunder-xianzai", "水雷仙宰", "五雷分型", "以水雷为名的仙宰神位。"],
  ["thunder-command-supervisor", "雷令主者", "雷令执行", "原名更接近职任，当前按有位号的神官身份收录。"],
  ["heaven-thunder-chancellor", "天雷上相", "五雷分型", "以天雷上相列位，不把上相理解为人间实官。"],
  ["five-thunder-deputy-envoy", "五雷院副使", "五雷院", "明确属于五雷院的副使神位。"],
  ["fire-script-golden-canon-immortal", "掌火书金经大仙", "法书与火令", "职号连接火书、金经与大仙。"],
  ["thunderbolt-immortal", "霹雳大仙", "霹雳火光", "以霹雳为名的大仙神位。"],
  ["fire-bell-immortal", "火铃大仙", "霹雳火光", "以火铃为名的大仙神位。"],
  ["cangya-immortal", "仓牙大仙", "霹雳火光", "仓牙二字照现用底本保存，不改写成相近异体。"],
  ["chief-thunder-great-deity", "主雷大神", "雷令执行", "职号直接标出主雷。"],
  ["xuhuo-great-deity", "欻火大神", "霹雳火光", "欻火尊号照底本保留，未与同名元帅自动合并。"],
  ["bearing-light-official", "负光吏", "雷霆官吏", "短名只说明负光之吏，姓名未见。"],
  ["displaying-might-great-deity", "振威大神", "雷令执行", "以振威为名的执行神位。"],
  ["registering-thunder-great-deity", "典雷大神", "雷令执行", "典雷表示掌理雷令，不据此补写独立传说。"],
  ["guiding-great-deity", "引领大神", "雷令执行", "原表以引领职能列名。"],
  ["six-eyed-electric-deity", "六目电光神", "风雨雷电", "六目与电光构成尊号，原段没有图像描述。"],
  ["many-eyed-great-deity", "众目大神", "雷霆监察", "众目尊号提示监察意象，但具体形象另须图像证据。"],
  ["troop-command-great-deity", "执部领兵大神", "雷霆军伍", "职号写明执部与领兵。"],
  ["silver-fang-dazzling-mighty-deity", "掌霹雳火光银牙耀目威神", "霹雳火光", "长尊号逐项保存霹雳、火光、银牙与耀目，不另造简称。"],
  ["yufu-xuantian-dafashi", "上清玉府玄天大法师", "上清玉府", "以玄天大法师位列玉府神位。"],
  ["auspicious-light-xianshi", "瑞光仙师", "雷霆师位", "原表以瑞光仙师列名。"],
  ["dipper-pivot-chancellor", "斗中枢相", "斗枢雷令", "斗中与枢相合成职号。"],
  ["thunder-command-master", "雷令大师", "雷令执行", "以雷令大师列位。"],
  ["yuzhen-yaoling-xianshi", "玉真耀灵仙师", "雷霆师位", "原表只保存玉真耀灵仙师尊号。"],
  ["thunder-master-haoweng", "雷师皓翁", "雷霆师位", "《玉枢宝经》说法对象中亦见雷师皓翁，本批只保存卷五十六神位。"],
  ["five-thunder-haoweng", "五雷皓翁", "雷霆师位", "与雷师皓翁相邻而分列，不按近名合页。"],
  ["forbidden-master-zhao-hou-faling", "禁师赵侯法令", "雷霆师位", "赵侯与法令连写，是否为姓名、官号或法令名仍待异本复核。"],
  ["punishing-evil-fashi", "伐恶法师", "雷霆监察", "以伐恶为职掌的法师神位。"],
  ["yufu-right-minister", "上清司命玉府右卿", "上清玉府", "司命、玉府右卿合为一条职号。"],
  ["southern-palace-minister", "南宫上卿", "南宫分司", "只保存南宫上卿位号。"],
  ["siming-gongbin-yuanjun", "四明公宾元君", "南宫分司", "四明、公宾、元君的断句保持原表形式。"],
  ["thunder-fire-cloud-marshal", "雷公火云元帅", "雷霆军伍", "雷公、火云与元帅合成将位。"],
  ["dongyang-youling-deity", "洞阳幽灵之神", "霹雳火光", "原表以洞阳幽灵之神列名。"],
  ["fire-light-flowing-essence-deity", "火光流精之神", "霹雳火光", "原表以火光流精之神列名。"],
  ["xuhuang-taihua-deity", "虚皇太华之神", "雷霆高位", "虚皇、太华在原名中合写。"],
  ["gold-essence-qingsi-xiangniang", "金精青思仙娘", "雷霆女神", "以仙娘称号进入雷霆神位表。"],
  ["heaven-thunder-wind-leader", "天雷风领之神", "风雨雷电", "天雷与风领职能在原名中并列。"],
  ["dipper-water-left-envoy", "斗中都水左使者", "水府分司", "斗中都水左使者负责水府语境下的左使职。"],
  ["dipper-six-communications-envoy", "斗中六通使者", "斗枢雷令", "六通使者列于斗中系统，具体六通含义不由本段展开。"]
].map(([key, title, cluster, role], index) => ({ key, title, sourceNameForm: title, cluster, role, sourceOrder: index + 1 }));

const institutionSpecs = [
  { key: "thunder-city", title: "雷城", sourceNameForm: "雷城", kind: "雷霆神话官府", summary: "位于玉清真王府碧霄上梵炁中的按治之城；高度与距离属于法书宇宙描述。", members: [] },
  { key: "yushu-court", title: "玉枢院（斗枢院）", sourceNameForm: "玉樞院，又名斗樞院", kind: "雷霆官署", summary: "设官近二百员，处理水旱、兵戈、饥馑与雷霆刑赏。", members: ["yushu-yuan-zhenjun", "yushu-deputy-yuanjun"] },
  { key: "thunder-directorate", title: "雷霆都司", sourceNameForm: "雷霆都司", kind: "雷霆官署", summary: "北帝专司，列官分职，水潦旱魃须请玉枢院禀听施行。", members: [] },
  { key: "penglai-water-office", title: "蓬莱都水司", sourceNameForm: "篷萊司", kind: "水府官署", summary: "由都水使者统将吏，专管水职、云气、江海河渎和泉源。", members: ["penglai-dushui-shizhe", "dipper-water-left-envoy"] },
  { key: "five-thunder-court", title: "五雷院", sourceNameForm: "五雷院", kind: "雷霆官署", summary: "四司之中被称为专权，所属五雷使统摄五雷并兼领三司将吏。", members: ["yufu-shangqing-wuleishi", "five-thunder-deputy-envoy"] },
  { key: "heaven-thunder", title: "天雷", sourceNameForm: "天雷", kind: "五雷分型", summary: "卷五十六所列五雷之一；是法门分类，不是一位无名人物。", members: ["dipper-heaven-thunder-zhentai", "heaven-thunder-chancellor"] },
  { key: "spirit-thunder", title: "神雷", sourceNameForm: "神雷", kind: "五雷分型", summary: "卷五十六所列五雷之一，与神雷真宰相连。", members: ["spirit-thunder-zhentai"] },
  { key: "dragon-thunder", title: "龙雷", sourceNameForm: "龍雷", kind: "五雷分型", summary: "卷五十六所列五雷之一，与龙雷君、龙雷仙宰相连。", members: ["dragon-thunder-lord", "dragon-thunder-xianzai"] },
  { key: "water-thunder", title: "水雷", sourceNameForm: "水雷", kind: "五雷分型", summary: "卷五十六所列五雷之一，与水雷仙宰相连。", members: ["water-thunder-xianzai"] },
  { key: "sheling-thunder", title: "社令雷", sourceNameForm: "社令雷", kind: "五雷分型", summary: "卷五十六所列五雷之一，强调社令法脉，未在本段列独立神名。", members: [] },
  { key: "five-direction-thunder-lords", title: "五方雷君", sourceNameForm: "中央黄帝雷君、東方青帝雷君、南方赤帝雷君、西方白帝雷君、北方黑帝雷君", kind: "雷君分组", summary: "中央与四方雷君按五方、五色成组，仍各自保留神位页。", members: ["central-yellow-thunder-lord", "eastern-green-thunder-lord", "southern-red-thunder-lord", "western-white-thunder-lord", "northern-black-thunder-lord"] },
  { key: "high-divine-register", title: "卷五十六雷霆神位表", sourceNameForm: "雷霆神位", kind: "神位名录", summary: "从六波天主帝君至斗中六通使者的高位神名按原次序建立，不与后段无名吏兵混算。", members: figureSpecs.map((row) => row.key) },
  { key: "judges-and-clerks", title: "雷霆判官与功曹职群", sourceNameForm: "左右大判官、左右判官、霹靂功曹諸職", kind: "职群", summary: "收束左、右判官，掌善恶簿判官，以及典籍、覆勘、记过、掌恶簿等功曹。", list: "左大判官；右大判官；左判官；右判官；伏雷博士；掌善簿判官；霹雳典籍功曹；霹雳覆勘功曹；霹雳记书过功曹；掌恶簿功曹" },
  { key: "fierce-officials", title: "雷霆猛吏与主吏职群", sourceNameForm: "猛吏、神吏、上吏、主吏", kind: "职群", summary: "把斩妖、追雷、风云、雷车、刑部、妖魔校勘和山林水界等执行职号按职群保存。", list: "吹海揭波驰役押阵灵华猛吏；斩妖伐木开山火铃神吏；追雷击雷神吏；神诀风云上吏；飞云走电大神吏；掌雷车黑气神吏；吞魔啖妖六甲神吏；擒龙捉孽撼山大吏；掌火辂金车上吏；丹元掌罪刑部正直吏；部辖灵魔掌律文华上吏；勘会妖魔校正善恶主吏；察善恶孝逆忠和都吏；掌水界分野灾沴上吏；掌山林圹野溪谷主吏" },
  { key: "thunder-car-officials", title: "雷车、兵甲与风雨职群", sourceNameForm: "雷城主吏至掌雷風雪雹電光吏", kind: "职群", summary: "雷车、雷鼓、风雨、火铃、兵器与雪雹电光的职号被整理为执行链。", list: "雷城主吏；雷威猛吏；执节都吏；风雷神吏；掌书判官；雷车判官；五雷直符吏；黑面神荼大神；雷车左领将军；雷车右领将军；主籍吏；掌雷鼓主帅；都神部吏；掌刚风天汉吏；起雨兴云吏；威剑威灵吏；掌火铃使者；掌四季风雨令；掌霹雳火令；负天担石太微令；掌天书文籍令吏；掌居吏；福元将军；掌霹雳火光令；掌鬼政龙书吏；西台雷雨吏；龙圈池水吏；追风布云虎吏；掌兵器甲卒吏；掌雷风雪雹电光吏" },
  { key: "thunder-messengers", title: "雷霆使者职群", sourceNameForm: "龍隊監催使者至江河使者", kind: "职群", summary: "传令、苍牙、火车、送魂、禁火、奔云、移山翻海、疫疠与江河等使者按原段保留。", list: "龙队监催使者；霹雳搜龙使者；律令使者；传令使者；苍牙使者；五雷使者；南宫火钤使者；雷阵左车使者；雷阵右车使者；散云呖黑使者；缚魂监送使者；典录考禁使者；霹雳催风使者；霹雳送魂使者；霹雳火车腥烟使者；霹雳送火禁火使者；霹雳火车黑火使者；霹雳倒捉催拉使者；霹雳四望使者；霹雳察听使者；霹雳回车使者；掣电奔云使者；掌兵甲横身飞云使者；驱云雷电雹使者；斤斧使者；云中使者；移山翻海铁甲使者；动风鼓震天威赤文使者；掌风雹金铃火铃使者；掌疫疠使者；江河使者" },
  { key: "thunder-strength-attendants", title: "雷鼓力士与童子职群", sourceNameForm: "三十六雷鼓力士至執幡童子", kind: "职群", summary: "三十六雷鼓力士以合称保存，降雹、摧邪力士与持幢、捧剑、掷光、执幡童子不拆成无名个人。", list: "三十六雷鼓力士；降雹力士；摧邪力士；左持幢仙人；右持幢仙人；紫光童子；掌录童子；捧剑童子；掷光童子；执幡童子" },
  { key: "thunder-generals", title: "雷公将军与殿下神将职群", sourceNameForm: "三五邵陽將軍至蓬萊司右神將", kind: "职群", summary: "邵阳雷公、五方雷公将军、霹雳将军和玉枢、北帝、蓬莱左右神将按卷末将班成组。", list: "三五邵阳将军；邵阳雷公；火车将军；起罡童子；发罡将军；六龙将军；黄帝雷公将军；青帝雷公将军；赤帝雷公将军；白帝雷公将军；黑帝雷公将军；天雷晃光将军；水雷电光将军；邀放扑杀将军；掷火将军；霹雳号黑将军；霹雳戮伐将军；玉枢斗下左神将；玉枢斗下右神将；北帝殿下左神将；北帝殿下右神将；蓬莱司左神将；蓬莱司右神将" }
];

function renderFigureArticle(row) {
  return [
    `<p>${escapeHtml(row.title)}见于${escapeHtml(SOURCE_CITATION)}的“雷霆神位”段，属于${escapeHtml(row.cluster)}一组。</p>`,
    "<h2>原典位置</h2>",
    `<p>底本写作“${escapeHtml(row.sourceNameForm)}”，在本批高位神名中排第 ${row.sourceOrder}。顺序用于还原卷内名单，不代表所有雷法共有同一品级。</p>`,
    "<h2>名号所见职能</h2>",
    `<p>${escapeHtml(row.role)}本页只从完整尊号解释可见职掌，不补造姓名、师承或法器。</p>`,
    "<h2>体系边界</h2>",
    `<p>${escapeHtml(row.title)}先归入卷五十六上清玉府五雷法；其他卷即使出现近名，也须有卷次证据才建立同一身份或跨法派关系。</p>`,
    "<h2>创作使用</h2>",
    `<p>若为${escapeHtml(row.title)}设计形象、对白、技能或战斗数值，新增部分必须标为 Worldcraft Codex 原创改编。</p>`
  ].join("");
}

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: thunderEntityId(row.key, worldId), worldId, type: "character", title: row.title,
    slug: `mythology-daoism-thunder-${row.key}`,
    summary: `${row.title}是${SOURCE_CITATION}“雷霆神位”所列${row.cluster}神名。${row.role}`,
    content: renderFigureArticle(row), tags: ["中国神话史", "道教", "雷部", "上清玉府五雷法", row.cluster, row.title],
    visibility: "public", createdBy: "user-owner", updatedAt: now, categoryId: categoryId(worldId, "daoism-offices"), order,
    templateId: `template:${worldId}:mythology:deity-person`,
    templateData: {
      canonicalName: row.title, aliases: "", tradition: "道教", identityType: "神祇", earliestSource: SOURCE_CITATION,
      sourceLocation: `卷五十六“雷霆神位”第 ${row.sourceOrder} 项`, narrativeEra: "雷城与玉枢院法书神圣时间",
      historicalLayer: "宋元", domains: row.role, iconography: "本卷神位表未提供图像；形象须另据法画、神像或科仪材料核对。",
      worship: "当前只确认其在上清玉府五雷法神位中的位置，不据名单推定独立庙祀。",
      regionalVariants: "神霄、清微、天心与地方雷法将班并不自动共享同一身份。", confidence: "明确", editorialStatus: "复核中", originalAdaptation: "false"
    }
  };
}

function renderInstitutionArticle(row) {
  const list = row.list ? `<h2>卷内职名</h2><p>${escapeHtml(row.list)}</p>` : "";
  return [
    `<p>${escapeHtml(row.summary)}</p>`,
    "<h2>原典坐标</h2>",
    `<p>${escapeHtml(SOURCE_CITATION)}写作“${escapeHtml(row.sourceNameForm)}”。页面按${escapeHtml(row.kind)}保存，不把职群人数转换成匿名人物。</p>`,
    "<h2>制度位置</h2>",
    `<p>${escapeHtml(row.title)}属于卷五十六的雷城、玉枢与五雷分司结构；该卷内部关系不能覆盖《道法会元》其他法派卷次。</p>`,
    list,
    "<h2>资料边界</h2>",
    `<p>${escapeHtml(row.title)}的名称和成员来自原卷，现代部门图只是项目整理；没有明文的上下级、人数和固定驻所继续留白。</p>`,
    "<h2>创作使用</h2>",
    `<p>新增成员、制服、案件流程和法术规则均须标为 Worldcraft Codex 原创改编。</p>`
  ].join("");
}

function buildInstitutionEntity(row, order, worldId, now) {
  return {
    id: thunderEntityId(row.key, worldId), worldId, type: "note", title: row.title,
    slug: `mythology-daoism-thunder-system-${row.key}`, summary: `${row.title}：${row.summary}`, content: renderInstitutionArticle(row),
    tags: ["中国神话史", "道教", "雷部", "上清玉府五雷法", row.kind, row.title], visibility: "public", createdBy: "user-owner", updatedAt: now,
    categoryId: categoryId(worldId, "daoism-offices"), order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "道教", institutionKind: row.kind, hierarchyLevel: "《道法会元》卷五十六上清玉府五雷法",
      jurisdiction: row.summary, formationPeriod: "宋元雷法材料，元末明初汇入《道法会元》",
      earliestSource: SOURCE_CITATION, sourceLocation: `卷五十六“${row.sourceNameForm}”段`, variants: "只代表本卷结构；其他雷法另建版本关系。", confidence: "明确"
    }
  };
}

function resolveRef(reference, worldId) {
  const split = reference.indexOf(":");
  const scope = reference.slice(0, split);
  const key = reference.slice(split + 1);
  if (scope === "t") return thunderEntityId(key, worldId);
  if (scope === "c") return celestialEntityId(key, worldId);
  if (scope === "cs") return celestialSourceId(key, worldId);
  throw new Error(`未知雷部引用：${reference}`);
}

function relation({ key, sourceRef, targetRef, kind, label, direction = "directed", strength = 5, evidenceType = "primary-text", confidence = "certain", notes }, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:daoism-thunder-offices:${key}`, worldId,
    sourceEntityId: resolveRef(sourceRef, worldId), targetEntityId: resolveRef(targetRef, worldId), kind, label, direction, strength,
    evidenceType, sourceCitation: SOURCE_CITATION, historicalScope: "宋元上清玉府五雷法材料层", confidence, notes, updatedAt: now
  };
}

function buildRelations(worldId, now) {
  const allRows = [...figureSpecs, ...institutionSpecs];
  const sourceRelations = allRows.map((row) => relation({
    key: `source-${row.key}`, sourceRef: `t:${row.key}`, targetRef: "cs:daofa-huiyuan", kind: "source", label: "卷五十六雷霆分司出处",
    notes: `“${row.sourceNameForm}”按卷五十六本段保存；关系不把全书二百六十八卷压成一套神班。`
  }, worldId, now));
  const departmentRelations = allRows.map((row) => relation({
    key: `department-${row.key}`, sourceRef: "c:thunder-department", targetRef: `t:${row.key}`, kind: "contains", label: "卷五十六雷部神位或职群",
    notes: `${row.title}只归入上清玉府五雷法这一版本层。`
  }, worldId, now));
  const groupRelations = institutionSpecs.flatMap((row) => (row.members || []).map((memberKey, index) => relation({
    key: `${row.key}-member-${index + 1}`, sourceRef: `t:${row.key}`, targetRef: `t:${memberKey}`, kind: "contains", label: `${row.title}成员或相关神位`,
    notes: `根据卷五十六的相邻列名与职号归组，不增加原文未写的个人履历。`
  }, worldId, now)));
  const structuralRelations = [
    relation({ key: "puhua-high-register", sourceRef: "c:leisheng-puhua", targetRef: "t:high-divine-register", kind: "custom", label: "玉枢雷霆高位权威与卷五十六神位表并读", evidenceType: "ritual-record", confidence: "probable", notes: "《玉枢宝经》与卷五十六属于相近雷霆神学环境，但不能据高位权威推定每名将吏都由同一文本直接统辖。" }, worldId, now),
    relation({ key: "thunder-city-yushu", sourceRef: "t:thunder-city", targetRef: "t:yushu-court", kind: "contains", label: "雷城内设玉枢院", notes: "卷内以雷城为按治空间，并说明玉枢院设官分职。" }, worldId, now),
    relation({ key: "yushu-five-thunder", sourceRef: "t:yushu-court", targetRef: "t:five-thunder-court", kind: "contains", label: "玉枢院申行五雷院", notes: "水旱灾异由玉枢院听施，五雷院在前四司中专权。" }, worldId, now),
    relation({ key: "yushu-directorate", sourceRef: "t:yushu-court", targetRef: "t:thunder-directorate", kind: "custom", label: "雷霆都司遇水旱申请玉枢院", notes: "两司有申行关系，不写成同一机构。" }, worldId, now),
    relation({ key: "yushu-penglai", sourceRef: "t:yushu-court", targetRef: "t:penglai-water-office", kind: "custom", label: "亢阳时由蓬莱司申玉枢院请雨", notes: "蓬莱司专理水职，仍须按卷内程序申请。" }, worldId, now),
    ...["heaven-thunder", "spirit-thunder", "dragon-thunder", "water-thunder", "sheling-thunder"].map((key) => relation({ key: `five-thunder-${key}`, sourceRef: "t:five-thunder-court", targetRef: `t:${key}`, kind: "contains", label: "五雷分型", notes: "天雷、神雷、龙雷、水雷与社令雷按卷五十六五雷段并列。" }, worldId, now)),
    relation({ key: "five-thunder-directional-lords", sourceRef: "t:five-thunder-court", targetRef: "t:five-direction-thunder-lords", kind: "contains", label: "五方雷君神位组", notes: "五雷分型与五方雷君是两种组织轴，不彼此等同。" }, worldId, now)
  ];
  return [...sourceRelations, ...departmentRelations, ...groupRelations, ...structuralRelations];
}

const eventSpecs = [
  ["five-thunder-classification", "religious-institutions", "五雷被分为天雷、神雷、龙雷、水雷与社令雷", "卷五十六先说明五雷分类，再展开雷城、玉枢院与将吏。", "t:five-thunder-court", ["t:heaven-thunder", "t:spirit-thunder", "t:dragon-thunder", "t:water-thunder", "t:sheling-thunder"]],
  ["thunder-city-cosmology", "religious-institutions", "雷城成为玉清真王按治空间", "法书以距离、高度和府城方位组织雷霆神圣空间，这些尺度不对应现实地图。", "t:thunder-city", ["t:yushu-court", "c:thunder-department"]],
  ["yushu-near-two-hundred", "religious-institutions", "玉枢院设官近二百员", "卷内用近二百员说明玉枢院规模，并把水旱、兵戈、饥馑与刑赏纳入分司。", "t:yushu-court", ["t:high-divine-register", "t:judges-and-clerks"]],
  ["five-thunder-envoy-command", "religious-institutions", "五雷使统摄五雷并兼领三司将吏", "玉府上卿五雷使成为五雷院申令与统摄的关键神位。", "t:yufu-shangqing-wuleishi", ["t:five-thunder-court", "t:five-thunder-deputy-envoy"]],
  ["thunder-directorate-punishment", "religious-institutions", "雷霆都司分掌斧钺、庆赏与刑罚", "北帝专司与玉枢院形成申行关系，卷内强调刑赏各有司存。", "t:thunder-directorate", ["t:yushu-court", "t:judges-and-clerks"]],
  ["penglai-water-jurisdiction", "religious-institutions", "蓬莱都水司专理云气与江海河渎", "都水使者所统将吏处理水职，亢阳时仍向玉枢院申奏请雨。", "t:penglai-water-office", ["t:penglai-dushui-shizhe", "t:dipper-water-left-envoy"]],
  ["directional-thunder-lords", "religious-institutions", "五方雷君按中央与四方列位", "黄、青、赤、白、黑五位雷君形成方色结构，不与五雷分型互相替代。", "t:five-direction-thunder-lords", ["t:central-yellow-thunder-lord", "t:eastern-green-thunder-lord", "t:southern-red-thunder-lord", "t:western-white-thunder-lord", "t:northern-black-thunder-lord"]],
  ["wind-rain-lightning-positions", "religious-institutions", "风伯、雨师、电光与火伯进入雷霆神位", "风、雨、电、火不再只是自然现象，而以元君、仙君、圣君等尊号进入法书神班。", "t:electric-light-yuansheng", ["t:rain-master-yuanjun", "t:wind-fire-yuanjun", "t:wind-earl-yuanjun", "t:rain-master-immortal-elder", "t:fire-earl-wind-thunder"]],
  ["thunder-zhentai-positions", "religious-institutions", "天雷、神雷、龙雷与水雷各见真宰或仙宰", "不同雷型通过真宰、仙宰和上相位号获得人格化神职。", "t:dipper-heaven-thunder-zhentai", ["t:spirit-thunder-zhentai", "t:dragon-thunder-xianzai", "t:water-thunder-xianzai", "t:heaven-thunder-chancellor"]],
  ["haoweng-distinct-positions", "textual-evidence", "雷师皓翁与五雷皓翁在神位表中分列", "近名人物不因同含皓翁二字而合页，后续须以具体经法证明关系。", "t:thunder-master-haoweng", ["t:five-thunder-haoweng", "cs:daofa-huiyuan"]],
  ["high-register-preserved", "textual-evidence", "雷霆高位神名按卷内次序保存", "六波天主帝君至斗中六通使者逐条建页，原卷未说明的谱系与图像保持空白。", "t:high-divine-register", ["t:liubo-tianzhu", "t:dipper-six-communications-envoy", "cs:daofa-huiyuan"]],
  ["judges-clerks-cluster", "religious-institutions", "判官与功曹组成雷霆勘录职群", "善恶簿、典籍、覆勘、记过与掌恶簿等职号按执行环节成组。", "t:judges-and-clerks", ["t:thunder-directorate", "t:yushu-court"]],
  ["fierce-officials-cluster", "religious-institutions", "猛吏与主吏分掌妖魔、刑部、山林和水界", "长职号显示雷法把自然灾异、地域与善恶校勘放入同一执行网络。", "t:fierce-officials", ["t:thunder-car-officials", "c:thunder-department"]],
  ["thunder-car-chain", "religious-institutions", "雷车、雷鼓、火铃与兵甲形成行动链", "雷车判官、左右领将、风雨吏与掌兵器甲卒吏被归到同一职群页面。", "t:thunder-car-officials", ["t:troop-command-great-deity", "t:thunder-fire-cloud-marshal"]],
  ["messenger-network", "religious-institutions", "雷霆使者负责传令、送魂、禁火与云雨", "原卷密集列出使者职号，项目按职群保存而不虚构姓名。", "t:thunder-messengers", ["t:yushu-court", "t:penglai-water-office"]],
  ["strength-attendants", "religious-institutions", "三十六雷鼓力士与童子按合称入录", "雷鼓力士人数明确，持幢、捧剑、掷光与执幡童子仍无个人姓名。", "t:thunder-strength-attendants", ["t:thunder-generals", "c:thunder-department"]],
  ["thunder-generals-cluster", "religious-institutions", "五方雷公将军与左右神将构成卷末将班", "邵阳、五方、霹雳及玉枢、北帝、蓬莱左右神将共同呈现雷部军事化语言。", "t:thunder-generals", ["t:five-direction-thunder-lords", "t:penglai-water-office", "t:thunder-directorate"]],
  ["daofa-huiyuan-thunder-preservation", "textual-evidence", "《道法会元》汇录上清玉府五雷法神位", "元末明初汇编保存了更早宋元雷法材料；卷五十六只代表其中一支，不是全道教统一名册。", "cs:daofa-huiyuan", ["t:high-divine-register", "c:thunder-department"]]
];

function buildTimelineEvents(worldId, now) {
  return eventSpecs.map(([key, trackKey, title, summary, entityRef, references], index) => {
    const refs = [...new Set([entityRef, ...references])];
    return {
      id: `timeline-event:${worldId}:mythology:daoism-thunder-offices:${key}`, worldId,
      entityId: resolveRef(entityRef, worldId), questId: "", sceneId: "",
      references: refs.map((reference) => ({ kind: "entity", id: resolveRef(reference, worldId) })), trackId: trackId(trackKey, worldId),
      title, summary, displayDate: "宋元雷法材料，元末明初汇编", datePrecision: "range", sortOrder: 555 + index,
      startValue: "1100", endValue: "1445", era: trackKey === "textual-evidence" ? "《道法会元》雷法文献层" : "宋元雷霆制度层", dependencyIds: [], updatedAt: now
    };
  });
}

function assertBatchShape() {
  if (figureSpecs.length !== 64) throw new Error(`${BATCH_LABEL}高位神名应为 64，实际为 ${figureSpecs.length}`);
  if (institutionSpecs.length !== 18) throw new Error(`${BATCH_LABEL}制度与职群应为 18，实际为 ${institutionSpecs.length}`);
  if (new Set([...figureSpecs, ...institutionSpecs].map((row) => row.key)).size !== 82) throw new Error(`${BATCH_LABEL}条目键重复`);
  if (eventSpecs.length !== 18) throw new Error(`${BATCH_LABEL}时间事件应为 18，实际为 ${eventSpecs.length}`);
}

function buildThunderOfficesBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const figures = figureSpecs.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const institutions = institutionSpecs.map((row, index) => buildInstitutionEntity(row, figures.length + index, worldId, now));
  return {
    key: BATCH_KEY, label: BATCH_LABEL, entities: [...figures, ...institutions], figures, institutions, locations: [], sources: [],
    relations: buildRelations(worldId, now), timelineEvents: buildTimelineEvents(worldId, now),
    featuredEntityIds: [thunderEntityId("high-divine-register", worldId), thunderEntityId("yushu-court", worldId), thunderEntityId("five-thunder-court", worldId), thunderEntityId("thunder-master-haoweng", worldId)]
  };
}

module.exports = { BATCH_KEY, BATCH_LABEL, SOURCE_CITATION, buildThunderOfficesBatch, thunderEntityId };
