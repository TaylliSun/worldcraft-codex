const { WORLD_ID, categoryId } = require("./chinese-mythology-history-data.cjs");

const BATCH_KEY = "buddhism-southern-material-28";
const BATCH_LABEL = "佛教完整知识库 · 中国南传、寺院仪轨与物质文化批";

function southernEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:buddhism-southern-material:${key}`;
}

function southernSourceId(key, worldId = WORLD_ID) {
  return southernEntityId(`source-${key}`, worldId);
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

function figure(key, title, layer, role, sourceKey, options = {}) {
  return { key, title, layer, role, sourceKey, ...options };
}

function catalog(key, title, sectionKey, kind, scope, boundary, options = {}) {
  return { key, title, sectionKey, kind, scope, boundary, ...options };
}

const sourceRows = [
  ["pali-vinaya", "巴利《律藏》", "约公元前后逐步定型并由多种写本传承", "原文", "佛典", "经分别、犍度与附随组织比丘、比丘尼戒律及僧团程序。", "巴利三藏律藏部类", "戒条的制定缘起与后世执行不是同一层，现代僧团实践须另看当地制度。"],
  ["digha", "巴利《长部》", "部派经典结集与斯里兰卡写本传承阶段", "原文", "佛典", "收长篇经四部类，是政治、修行、宇宙观和佛陀晚年叙事的重要入口。", "《长部》各经", "经中人物对话属于经典叙事，不能自动当作逐字现场记录。"],
  ["majjhima", "巴利《中部》", "部派经典结集与斯里兰卡写本传承阶段", "原文", "佛典", "以中等篇幅经文保存修行、问答和人物个案。", "《中部》各经", "平行汉译阿含应逐经比较，不以相近标题直接认定完全同本。"],
  ["samyutta", "巴利《相应部》", "部派经典结集与斯里兰卡写本传承阶段", "原文", "佛典", "按主题和人物编组短经，是概念索引与弟子活动的重要来源。", "《相应部》各相应", "短经在传承中形成套组，人物出现不等于可还原完整生平。"],
  ["anguttara", "巴利《增支部》", "部派经典结集与斯里兰卡写本传承阶段", "原文", "佛典", "按法数编排教说，保存大量僧尼与在家弟子材料。", "《增支部》各集", "法数编排服务记诵，跨经重复与次序差异需要保留。"],
  ["khuddaka", "巴利《小部》", "多种早晚文献汇成的经典集合", "原文", "佛典", "含《法句》《经集》《自说》《长老偈》《长老尼偈》《本生》等不同文本。", "《小部》各独立经典", "小部不是一次成书；偈颂、注释故事和本生散文必须分层。"],
  ["dipavamsa", "《岛史》", "约四世纪形成的巴利编年史", "史料记录", "史书与礼志", "以斯里兰卡王统、僧团与佛教传播组织早期历史记忆。", "《岛史》相关章", "编年、护教叙事与宗派立场并存，需与碑铭和《大史》互证。"],
  ["mahavamsa", "《大史》", "约五至六世纪形成并持续续编的巴利史书", "史料记录", "史书与礼志", "记述斯里兰卡王统、摩哂陀传法、寺院和舍利崇拜。", "《大史》及续编相关章", "王权合法性与佛教史叙事彼此交织，神异段落不直接作政治史证据。"],
  ["yunnan-inscriptions", "云南南传佛教地方志、寺院碑记与贝叶经题记资料组", "明清以来地方志、寺院记录和贝叶经题记逐步累积", "史料记录", "地方志与碑刻", "用于核对西双版纳、德宏、临沧和普洱的寺塔、僧团与文本传播。", "地方志佛寺条、寺院碑记及贝叶经题记", "初传年代有多种说法，地方传说、建筑年代与现存重修年代分别记录。"],
  ["modern-yunnan-records", "中国南传佛教公开机构史料与版本目录", "二十世纪以来公开机构记录、会议资料和出版目录", "现代研究", "现代研究书目", "只保存人物任职、教育机构、版本项目和公开活动的项目自写摘要。", "公开机构史料、地方年鉴与版本目录", "不收录隐私，不复制新闻全文、现代传记或《中国贝叶经全集》受版权保护的正文。", { rightsStatus: "项目自写整理", reviewStatus: "可公开" }]
].map(([key, title, formation, sourceLayer, workType, scope, location, boundary, options = {}]) => ({ key, title, formation, sourceLayer, workType, scope, location, boundary, rightsStatus: options.rightsStatus || "古籍原文", reviewStatus: options.reviewStatus || "已核原文" }));

const personGroupRows = [
  {
    key: "early-disciples", title: "巴利经典早期僧团人物群", anchorKey: "china-theravada",
    scope: "补入十位尚未建页的早期比丘与说法人物。", boundary: "经典记载、注释传记与后世礼敬分开；巴利名和汉译名逐人消歧。",
    figures: [
      figure("vappa", "婆敷（五比丘）", "巴利经典叙事层", "五比丘之一，经典传统将其列为鹿野苑初转法轮后最早证悟与受戒者之一。", "samyutta"),
      figure("bhaddiya-five", "跋提迦（五比丘）", "巴利经典叙事层", "五比丘成员，与鹿野苑初期僧团形成相连；须与其他同名跋提人物区分。", "samyutta"),
      figure("mahanama-five", "摩诃男（五比丘）", "巴利经典叙事层", "五比丘成员，早期僧团名录中的摩诃男；不与释族在家弟子摩诃男合并。", "samyutta"),
      figure("assaji", "阿说示（五比丘）", "巴利经典叙事层", "五比丘成员，其简短缘起偈在舍利弗归信叙事中具有关键位置。", "khuddaka"),
      figure("yasa", "耶舍（鹿野苑弟子）", "巴利律藏叙事层", "早期富家子弟出家故事的主人公，其亲友随后加入僧团。", "pali-vinaya"),
      figure("bahiya", "巴希亚·达鲁奇利亚", "巴利经典叙事层", "《自说》中接受简要观法教诫的人物，后世以迅速证悟的故事著称。", "khuddaka"),
      figure("ratthapala", "赖吒和罗", "巴利经典叙事层", "出身富裕而坚持出家的比丘，其与国王对话讨论衰老、无常与无所有。", "majjhima"),
      figure("vakkali", "跋迦梨", "巴利经典叙事层", "以见佛与见法关系著称的比丘，不同经与注释对其晚年叙事存在层次差异。", "samyutta"),
      figure("vangisa", "婆耆舍", "巴利经典叙事层", "以即席偈颂见长的比丘，《长老偈》和《相应部》保存其诗偈与修行问答。", "khuddaka"),
      figure("radha", "罗陀长老", "巴利经典叙事层", "常以问答形式出现的比丘，相关经文集中讨论五蕴、无常与解脱。", "samyutta")
    ]
  },
  {
    key: "nuns", title: "巴利经典比丘尼人物群", anchorKey: "china-theravada",
    scope: "以《长老尼偈》、律藏与尼相应补足女性修行者。", boundary: "偈颂自述、注释故事与后世传奇各自标层，不把苦难叙事写成猎奇传记。",
    figures: [
      figure("patacara", "波吒遮罗比丘尼", "巴利经典与注释层", "比丘尼长老，传统以经历丧亲后出家及精通戒律著称。", "khuddaka"),
      figure("kisa-gotami", "乔答弥比丘尼", "巴利经典与注释层", "以丧子、芥子譬喻和无常修行为人熟知；故事细节主要见后出注释。", "khuddaka"),
      figure("bhadda-kundalakesa", "跋陀军陀罗拘夷比丘尼", "巴利经典与注释层", "曾为游行论辩者的比丘尼，传统记载其归入僧团并善于迅速通达。", "khuddaka"),
      figure("sundari-nanda", "孙陀利难陀比丘尼", "巴利经典与注释层", "释族女性出家者，偈颂传统以观身无常转化对容貌的执著。", "khuddaka"),
      figure("sona-nun", "索那比丘尼", "巴利经典与注释层", "年长后出家的比丘尼，传统以勤勉精进和晚年修学著称。", "anguttara"),
      figure("sakula-nun", "娑俱罗比丘尼", "巴利经典与注释层", "巴利女弟子名录中的比丘尼，传统称在天眼方面突出。", "anguttara"),
      figure("soma-nun", "苏摩比丘尼", "巴利经典叙事层", "尼相应保存其回应魔罗、拒绝以女性身份否定智慧能力的偈颂。", "samyutta"),
      figure("bhadda-kapilani", "跋陀迦毗罗尼比丘尼", "巴利经典与注释层", "比丘尼长老，传统将其与大迦叶早年婚姻及宿命智成就相连。", "khuddaka")
    ]
  },
  {
    key: "lay-rulers", title: "巴利经典在家弟子与护持者群", anchorKey: "three-refuges",
    scope: "补入女性闻法者、居士领袖、商人与城市护持者。", boundary: "供养关系、王室身份和修行成就逐项写，不把财富或地位等同宗教层级。",
    figures: [
      figure("khujjuttara", "久寿多罗", "巴利经典与注释层", "王宫侍女出身的在家女弟子，传统称善闻法并向舍摩婆帝等人复述教说。", "anguttara"),
      figure("samavati", "舍摩婆帝", "巴利经典与注释层", "王后与在家女弟子，相关故事围绕慈心、宫廷生活与火灾展开。", "anguttara"),
      figure("uttara-nandamata", "郁多罗难陀母", "巴利经典叙事层", "在家女弟子，经典名录赞其禅修与护持，须与多位同名郁多罗区分。", "anguttara"),
      figure("citta-householder", "质多长者", "巴利经典叙事层", "重要在家男弟子，《相应部》保存其与僧人讨论心、禅定和教义的材料。", "samyutta"),
      figure("hatthaka", "哈达卡·阿罗毗", "巴利经典叙事层", "在家弟子，经典以布施、爱语、利行与同事等摄众方法描述其社群能力。", "anguttara"),
      figure("nakulapita", "那拘罗父", "巴利经典叙事层", "年长在家弟子，与那拘罗母共同出现于婚姻、信任和病中修心教说。", "anguttara"),
      figure("nakulamata", "那拘罗母", "巴利经典叙事层", "年长在家女弟子，与那拘罗父共同呈现家庭生活中的修行与相互承诺。", "anguttara"),
      figure("ambapali", "庵摩罗女", "巴利经典叙事层", "毗舍离园林施主与在家女弟子，部分传统又记其后来出家。", "pali-vinaya"),
      figure("tapussa", "提谓商人", "巴利经典与跨传本层", "传统列为佛陀成道后最早供养者之一，与波利同行；不同语系故事有所扩展。", "pali-vinaya"),
      figure("bhallika", "波利商人", "巴利经典与跨传本层", "与提谓共同供养佛陀的商人，后世多地舍利和归乡传说须分区核对。", "pali-vinaya")
    ]
  },
  {
    key: "lanka", title: "斯里兰卡传承、王室与论师人物群", anchorKey: "china-theravada",
    scope: "从传统传法人物到巴利注疏家，说明云南南传经典所处的更大巴利语文化背景。", boundary: "《岛史》《大史》的王权叙事、碑铭证据和后世僧史并列，不以单部编年史定案。",
    figures: [
      figure("moggaliputta-tissa", "目犍连子帝须", "部派与编年传统层", "传统称阿育王时期长老，与第三次结集及向外传法叙事相连。", "mahavamsa"),
      figure("mahinda", "摩哂陀", "斯里兰卡编年传统层", "传统称阿育王之子与赴楞伽传法长老，相关事件主要见巴利编年史。", "mahavamsa"),
      figure("sanghamitta", "僧伽蜜多", "斯里兰卡编年传统层", "传统称携菩提树枝赴楞伽并建立比丘尼传承的女性长老。", "mahavamsa"),
      figure("devanampiya-tissa", "天爱帝须王", "斯里兰卡古代王权层", "阿努拉德普勒国王，编年史把其与摩哂陀传法、大寺和菩提树供养相连。", "mahavamsa"),
      figure("dutthagamani", "杜多伽摩尼王", "斯里兰卡古代王权层", "编年史中的护教国王，大塔营造与战争叙事同时构成其形象。", "mahavamsa"),
      figure("vattagamani", "婆他伽马尼·阿巴耶王", "斯里兰卡古代王权层", "与阿卢寺结集和无畏山寺传统相关的国王，年代与宗派叙事需互证。", "dipavamsa"),
      figure("parakramabahu-first", "波罗迦罗摩跋护一世", "十二世纪斯里兰卡", "波隆纳鲁沃国王，其僧团整顿在编年史中被写成统一工程，执行过程仍需细分。", "mahavamsa"),
      figure("buddhaghosa", "觉音", "五世纪巴利注疏传统", "巴利注疏家，《清净道论》及多部尼柯耶注释传统集中归于其名下。", "mahavamsa"),
      figure("buddhadatta", "佛授论师", "五世纪巴利论书传统", "巴利论师，著述以戒律、阿毗达摩和修学纲要见长。", "khuddaka"),
      figure("dhammapala", "护法论师（南传）", "五至六世纪巴利注疏传统", "巴利注疏家，多部小部经典复注归于其名下；须与唯识论师护法消歧。", "khuddaka")
    ]
  },
  {
    key: "yunnan", title: "云南南传佛教传播与教育人物群", anchorKey: "china-theravada",
    scope: "收录一位早期地方王权人物与五位近现代教界、教育和组织人物。", boundary: "公开机构记录只支持公开活动，不延伸私生活；现任职务必须按时间版本化。",
    figures: [
      figure("paya-zhen", "帕雅真", "宋元", "十二世纪后期勐泐王权人物，地方传统称其为首位召片领，并与上座部佛教影响扩大相连。", "yunnan-inscriptions", { historicalLayer: "宋元" }),
      figure("songliu-agamuni", "松溜·阿嘎牟尼", "近现代整理", "西双版纳南传佛教长老，二十世纪公共记录保存其教务、寺院和对外交流活动。", "modern-yunnan-records", { historicalLayer: "近现代整理" }),
      figure("wubingya-wensa", "伍并亚·温撒", "近现代整理", "德宏傣族南传佛教长老，参与寺院恢复、教界公共事务与跨境佛教交流。", "modern-yunnan-records", { historicalLayer: "近现代整理" }),
      figure("dao-shuren", "刀述仁", "近现代整理", "傣族在家佛教人士与公共文化工作者，推动云南佛教教育和南传佛教组织建设。", "modern-yunnan-records", { historicalLayer: "近现代整理" }),
      figure("pasonglie-longzhuangmeng", "帕松列龙庄勐", "近现代整理", "西双版纳南传佛教僧人，公开记录保存其僧阶晋升、教育和法务活动。", "modern-yunnan-records", { historicalLayer: "近现代整理" }),
      figure("du-hanting", "都罕听", "近现代整理", "西双版纳南传佛教僧人，参与佛学院、寺院与教界公共教育事务。", "modern-yunnan-records", { historicalLayer: "近现代整理" })
    ]
  }
];

const catalogGroupRows = [
  ["china-theravada", "中国南传佛教与云南区域目录", "把地区、文字、僧阶、节庆和跨境传播作为独立对象。", "云南各地传统具有差异，不用单一版纳模式覆盖德宏、临沧和普洱。"],
  ["sites", "中国佛教寺院、圣山与石窟目录", "收录影响教团、朝圣、译经与艺术史的代表性历史地点。", "创建传说、考古年代、历代重修和当代建筑必须分层。"],
  ["rituals", "佛教戒律、节日与共修仪式目录", "覆盖僧团程序、在家戒行、节庆和汉地大型法会。", "经典根据、仪轨文本和地方实行版本并列，不提供替代真实师承的操作手册。"],
  ["material", "佛教造像、法器与写经物质文化目录", "从塔、石窟、壁画到日常法器记录形制、用途和地域变化。", "物件形制不能脱离年代、材质和使用环境，也不据现代商品样式反推古制。"]
].map(([key, title, scope, boundary]) => ({ key, title, scope, boundary }));

const catalogRows = [
  catalog("china-theravada", "中国南传上座部佛教", "china-theravada", "传统总览", "中国佛教三大语系传统之一，主要分布在云南西南边疆的傣、布朗、德昂、阿昌等社群。", "传入年代尚无单一定论，七世纪可能传入、十三世纪后形成稳定僧团等说法分层呈现。"),
  catalog("xishuangbanna-yun", "西双版纳润派传承", "china-theravada", "区域传承", "以傣泐文贝叶经、村寨佛寺和跨兰那文化交流为重要特征。", "润派内部及不同时期并非完全一致，不把现代组织边界投射到早期。", { place: true, spaceKind: "信仰传播区域", modern: "云南省西双版纳傣族自治州" }),
  catalog("dehong-traditions", "德宏南传佛教传统", "china-theravada", "区域传承", "与缅甸掸邦往来密切，佛寺、私家供奉和文字传统具有地方特点。", "德宏与西双版纳的僧阶、文字和节庆不能互相替代。", { place: true, spaceKind: "信仰传播区域", modern: "云南省德宏傣族景颇族自治州" }),
  catalog("lincang-network", "临沧南传佛教网络", "china-theravada", "区域传承", "耿马、孟定等地佛寺与跨境上座部佛教往来形成地方网络。", "县域、民族和寺院传统差异需逐地核对。", { place: true, spaceKind: "信仰传播区域", modern: "云南省临沧市相关县区" }),
  catalog("puer-network", "普洱南传佛教网络", "china-theravada", "区域传承", "孟连、景谷等地的傣族及其他社群佛寺、节庆和教育构成区域传播。", "普洱不是单一教派单元，具体条目按寺院和社区拆分。", { place: true, spaceKind: "信仰传播区域", modern: "云南省普洱市相关县区" }),
  catalog("xishuangbanna-general-temple", "西双版纳总佛寺", "china-theravada", "总佛寺", "西双版纳重要南传佛教寺院与教务、教育活动场所。", "早期创建传说、历史毁建和现代重建分别记录。", { place: true, spaceKind: "庙宇与遗址", modern: "云南省景洪市" }),
  catalog("manduan-temple", "曼短佛寺", "china-theravada", "历史佛寺", "保存西双版纳傣族佛寺木构、壁画与村寨宗教生活资料。", "始建传说与现存建筑年代不可混写。", { place: true, spaceKind: "庙宇与遗址", modern: "云南省勐海县" }),
  catalog("jingzhen-octagonal-pavilion", "景真八角亭", "china-theravada", "戒堂建筑", "傣族佛寺建筑代表之一，与戒律仪式、建筑装饰和历代修缮相连。", "现代修复部分与原构件需在建筑史中区分。", { place: true, spaceKind: "庙宇与遗址", modern: "云南省勐海县" }),
  catalog("jiele-pagoda", "姐勒金塔", "china-theravada", "佛塔", "德宏瑞丽地区重要南传佛塔与地方供养中心。", "传说年代、重建年代和现存形制分别记录。", { place: true, spaceKind: "庙宇与遗址", modern: "云南省瑞丽市" }),
  catalog("zhuangfang", "奘房", "china-theravada", "村寨佛寺", "滇西南部分傣族地区对佛寺或寺院空间的称谓，兼具礼仪、教育与社区功能。", "各地称谓、规模和居住规则不同，不作统一建筑模板。"),
  catalog("palm-leaf-manuscripts", "贝叶经", "china-theravada", "写经传统", "以处理后的贝叶刻写或书写佛典、叙事、历算与地方知识。", "贝叶只是载体，不等于内容全部属于巴利三藏。"),
  catalog("tai-lue-scripture", "傣泐文佛典", "china-theravada", "文字与译典", "西双版纳等地以傣泐文抄刻、讲诵和翻译的佛教文献。", "巴利语原文、傣文音译、意译和地方故事须分栏。"),
  catalog("dehong-dai-scripture", "德宏傣文佛典", "china-theravada", "文字与译典", "德宏地区使用地方傣文保存的佛典、仪式和叙事文本。", "与傣泐文、润文的关系需按具体写本判断。"),
  catalog("temple-education-yunnan", "云南南传佛寺教育", "china-theravada", "教育制度", "寺院承担经典、民族文字、礼仪和社区知识教育，现代又与佛学院课程并行。", "男童入寺并非云南所有南传社群的统一义务，地区与时代差异需明确。"),
  catalog("tan-offering", "赕佛", "china-theravada", "供养实践", "傣语文化区对向佛、法、僧及寺院进行布施供养的一类实践称谓。", "赕的对象、规模与节期各地不同，不将所有民俗都解释为单一功德公式。"),
  catalog("tan-tan-scripture", "赕坦献经", "china-theravada", "献经节仪", "围绕讲经、献经书和本生故事形成的地方节仪与文学传播。", "文本题名、表演版本和供养程序须按村寨与传本记录。"),
  catalog("water-splashing-buddha-bathing", "泼水节与浴佛", "china-theravada", "节庆复合体", "新年、水的祝福、浴佛与社区节庆在云南形成多层结合。", "公共节庆、宗教仪式和旅游表演不能混作同一种活动。"),
  catalog("huba-ranks", "祜巴与云南南传僧阶", "china-theravada", "僧阶制度", "记录帕、都、祜巴、帕祜巴、帕松列等称谓在不同地区的使用。", "僧阶名称和晋升规则会随地区、时代与组织规范变化。"),
  catalog("cross-border-pali-world", "滇西南跨境巴利语文化圈", "china-theravada", "传播网络", "云南与缅甸、泰国、老挝等地在经典、戒律、教育和节庆上的长期往来。", "跨境相似不等于同一教派或单向输入，具体流动逐事件记录。", { place: true, spaceKind: "信仰传播区域", modern: "云南西南边疆与相邻东南亚地区" }),

  catalog("white-horse-temple", "白马寺", "sites", "历史寺院", "洛阳佛教寺院，后世常被置于汉地佛教初传叙事中心。", "永平求法故事、寺院创建史和现存建筑年代分开。", { place: true, spaceKind: "庙宇与遗址", modern: "河南省洛阳市" }),
  catalog("jianchu-temple", "建初寺", "sites", "历史寺院", "建康早期佛教寺院记忆，与康僧会及江南佛教传播相连。", "舍利感应叙事与可核寺院史分别记录。", { place: true, spaceKind: "历史地点", modern: "今南京相关历史区域" }),
  catalog("qixia-temple", "南京栖霞寺", "sites", "历史寺院", "南朝以来的江南佛教寺院，与三论学、舍利塔和石刻造像史相连。", "创建传说、舍利塔年代、石窟开凿和历代重修分别说明。", { place: true, spaceKind: "庙宇与遗址", modern: "江苏省南京市栖霞区" }),
  catalog("lingyin-temple", "杭州灵隐寺", "sites", "历史寺院", "杭州重要佛教寺院，与吴越、宋代禅宗和飞来峰造像长期相连。", "慧理创建传说、寺院沿革和飞来峰不同造像层分别核对。", { place: true, spaceKind: "庙宇与遗址", modern: "浙江省杭州市西湖区" }),
  catalog("daxingshan-temple", "大兴善寺", "sites", "译经与密教寺院", "长安佛教寺院，隋唐译经和密教活动的重要场所。", "不同朝代寺址、寺名和译场活动需逐期核对。", { place: true, spaceKind: "庙宇与遗址", modern: "陕西省西安市" }),
  catalog("qinglong-temple", "青龙寺", "sites", "唐代密教寺院", "惠果等活动及东亚求法僧往来的重要寺院记忆。", "遗址考古、唐代寺院和现代复建不可合并。", { place: true, spaceKind: "庙宇与遗址", modern: "陕西省西安市" }),
  catalog("daci-en-temple", "大慈恩寺", "sites", "译经寺院", "玄奘译经、慈恩学和大雁塔文物史的重要场所。", "寺院机构、译场和塔的修缮年代分别建立事件。", { place: true, spaceKind: "庙宇与遗址", modern: "陕西省西安市" }),
  catalog("famen-temple", "法门寺", "sites", "舍利与国家佛教遗址", "地宫、佛指舍利供奉与唐代迎奉活动构成重要考古和礼仪资料。", "舍利信仰、题记鉴定和现代展示分层。", { place: true, spaceKind: "庙宇与遗址", modern: "陕西省宝鸡市扶风县" }),
  catalog("wutai-mountain", "五台山佛教圣地", "sites", "佛教圣山", "文殊信仰、寺院网络和跨区域朝圣长期汇聚的山岳空间。", "经典清凉山、历史五台山与现代行政地理的对应有形成过程。", { place: true, spaceKind: "信仰传播区域", modern: "山西省忻州市五台县" }),
  catalog("emei-mountain", "峨眉山佛教圣地", "sites", "佛教圣山", "普贤信仰、山岳寺院与朝圣路线共同形成的历史空间。", "普贤道场认定与寺院扩展分期处理。", { place: true, spaceKind: "信仰传播区域", modern: "四川省乐山市峨眉山市" }),
  catalog("jiuhua-mountain", "九华山佛教圣地", "sites", "佛教圣山", "金地藏记忆、地藏信仰与山岳寺院群交织的朝圣区域。", "新罗僧金乔觉生平、肉身传说和地藏化身说分别记录。", { place: true, spaceKind: "信仰传播区域", modern: "安徽省池州市青阳县" }),
  catalog("putuo-mountain", "普陀山佛教圣地", "sites", "佛教圣山", "观音信仰、海上交通与寺院朝圣长期结合的岛屿空间。", "不肯去观音叙事、寺院史和航海史分别核对。", { place: true, spaceKind: "信仰传播区域", modern: "浙江省舟山市普陀区" }),
  catalog("mogao-caves", "敦煌莫高窟", "sites", "石窟与写经遗址", "壁画、塑像、供养人题记和藏经洞文书构成跨世纪佛教资料库。", "洞窟营造年代、重绘层和近现代文物流散史分开。", { place: true, spaceKind: "庙宇与遗址", modern: "甘肃省敦煌市" }),
  catalog("yungang-grottoes", "云冈石窟", "sites", "石窟寺", "北魏皇家造像、僧团与都城文化的重要遗址。", "各窟开凿次序和昙曜五窟对应按考古研究保留差异。", { place: true, spaceKind: "庙宇与遗址", modern: "山西省大同市" }),
  catalog("longmen-grottoes", "龙门石窟", "sites", "石窟寺", "北魏至唐宋持续营造的造像、题记和功德主资料群。", "单尊造像年代不能只凭风格猜测，题记与考古层优先。", { place: true, spaceKind: "庙宇与遗址", modern: "河南省洛阳市" }),

  catalog("three-refuges", "三皈依", "rituals", "入门礼仪", "以佛、法、僧为依止的基本表达，见于多语系经典与不同仪式文本。", "汉传、藏传与南传文句和授受程序各有版本。"),
  catalog("five-precepts", "五戒", "rituals", "在家戒行", "不杀生、不偷盗、不邪淫、不妄语、不饮酒等在家伦理框架。", "戒相解释、授戒文本和地域用语不同。"),
  catalog("eight-precepts", "八关斋戒", "rituals", "在家短期戒仪", "在特定日夜受持八项训练，连接布萨日、寺院生活与在家修行。", "时限、称名和仪式程序按传统分别记录。"),
  catalog("full-ordination", "具足戒", "rituals", "僧团戒法", "比丘或比丘尼进入完整戒律身份的羯磨程序与制度。", "汉传四分律、藏传根本说一切有部律与南传律制不可混用。"),
  catalog("uposatha", "布萨", "rituals", "僧团定期仪式", "僧团诵戒、忏悔与维持共同生活秩序的周期性制度。", "日期计算、诵本和在家参与方式依传统与地区变化。"),
  catalog("rains-retreat", "安居", "rituals", "季节性僧团制度", "雨季或夏季集中居住修学的制度，在不同气候和语系传统中形成不同日历。", "汉地夏安居与南传雨安居的时间和仪式不作等同。"),
  catalog("pavarana", "自恣", "rituals", "安居终结程序", "安居结束时僧众相互邀请指出所见、所闻、所疑过失。", "律藏程序与地方节庆活动分层。"),
  catalog("buddha-birthday", "佛诞与浴佛仪式", "rituals", "纪念节仪", "围绕佛陀诞生纪念、浴佛偈与寺院供养形成的多地节仪。", "纪念日期和合并卫塞节的方式随传统不同。"),
  catalog("ullambana", "盂兰盆会", "rituals", "汉地节仪", "以《盂兰盆经》、供僧与荐亡实践形成的汉地佛教节会。", "目连救母故事、僧自恣供养与民间中元习俗分别说明。"),
  catalog("water-land", "水陆法会", "rituals", "汉地大型法会", "以普度水陆众生、设坛诵经与绘制神位形成的复合仪式。", "历代仪文和当代寺院执行差异较大，公开页不替代仪轨本。"),
  catalog("yankou", "瑜伽焰口", "rituals", "施食仪式", "汉地密教化施食仪轨，以救济饿鬼和荐亡为核心。", "经轨题署、明清仪文和现代法会形式分层。"),
  catalog("life-release", "放生会", "rituals", "慈悲实践", "赎买、救护生命并诵愿回向的佛教实践，历代与地方组织形式不同。", "现代生态、市场和动物福利问题必须纳入实践评估。"),
  catalog("nianfo-group", "念佛共修", "rituals", "净土共修", "围绕佛号、赞偈、绕佛与回向组织个人和集体修持。", "佛号、节奏和仪次依寺院传统变化。"),
  catalog("chan-retreat", "禅七", "rituals", "禅修共住", "以七日为单位强化坐禅、行香、开示与寺院作息的汉地修持形式。", "不同禅门规矩和现代课程不可概括为一套固定程序。"),
  catalog("ordination-platform", "传戒法会", "rituals", "戒坛制度", "集中完成出家、沙弥、具足或菩萨戒授受的寺院组织活动。", "戒种、戒期和资格规则随传统与时代变化。"),

  catalog("stupa", "佛塔", "material", "宗教建筑", "安置舍利、经典或纪念对象的塔形建筑，在中国形成多种材料和楼阁、密檐形制。", "窣堵波原型与中国塔式演变按地区和时代分开。"),
  catalog("reliquary", "佛教舍利容器", "material", "供养器物", "盛放舍利的函、瓶、棺椁或复合套装，常与地宫题记共同出土。", "宗教认定、材质检测和考古层位分别记录。"),
  catalog("sutra-pillar", "经幢", "material", "刻经建筑", "在石柱或幢身刻写陀罗尼、经文、发愿与建造题记。", "经幢与墓幢、纪念碑的功能需依铭文判断。"),
  catalog("cave-temple", "石窟寺", "material", "宗教空间", "在崖壁开凿礼拜、禅修、造像和供养空间的佛教建筑类型。", "洞窟功能会随时期改变，不以主尊一项概括整窟。"),
  catalog("buddhist-murals", "佛教壁画", "material", "图像艺术", "以佛传、本生、经变、供养人和装饰图案组织墙面叙事。", "重绘、修补和颜料褪变会改变现状，图像释读须结合层位。"),
  catalog("buddhist-sculpture", "佛教造像", "material", "雕塑艺术", "以石、木、金铜、夹纻、泥塑等材料表现佛、菩萨、弟子和护法。", "题记、仪轨尺度、地域风格与后世补配共同决定鉴定。"),
  catalog("buddhapada", "佛足迹", "material", "象征图像", "以足印、法轮和吉祥纹象征佛陀在场，在南传与亚洲多地尤受重视。", "天然石纹、人工刻制和传说认定须分开。"),
  catalog("mandala", "曼荼罗", "material", "仪轨图像", "以二维图、立体坛城或观想结构组织本尊、方位与修法空间。", "不同密续系统不可混成一张通用图，公开页不替代灌顶教学。"),
  catalog("thangka", "唐卡", "material", "卷轴绘画", "藏传佛教便携卷轴画，服务礼拜、教学、传记和仪轨。", "年代、画派、开光和图像题材分别记录，不以商品名称鉴定。"),
  catalog("palm-leaf-covers", "贝叶经夹", "material", "护经器物", "夹护贝叶写本的木板、织物与系带，可带彩绘、题记和供养信息。", "经夹年代不必与内部每片贝叶相同。"),
  catalog("wooden-fish", "木鱼", "material", "法器", "汉地寺院用于诵念节拍和集众的木质打击法器。", "大型鱼梆与手持圆形木鱼的用途和年代分开。"),
  catalog("qing-chime", "磬与引磬", "material", "法器", "石、铜等材质的击鸣器与手持引磬，用于法会、诵经和动作提示。", "名称、形制与组合随寺院制度变化。"),
  catalog("dharma-drum", "法鼓", "material", "法器", "寺院集众、法会节奏和说法象征中的鼓类器物。", "鼓楼大鼓与仪式手鼓不作同一器型。"),
  catalog("kasaya", "袈裟", "material", "僧服", "由律制衣法发展出的僧衣总称，在汉、藏、南传形成不同裁制、颜色与披搭方式。", "颜色不能单独判断宗派或僧阶，现代制服另列。"),
  catalog("alms-bowl", "僧钵", "material", "僧用器", "僧侣受食与日常生活的重要器物，材料、容量和持用规则见各律传统。", "佛钵传说、考古器物和现代钵具分开。"),
  catalog("vajra-bell", "金刚杵与金刚铃", "material", "密教法器", "密教仪轨中常成对使用的法器，象征和具体用法依续部与传承解释。", "不同股数、材质与仪轨配套不可只凭外形推断用途。")
];

const figureRows = personGroupRows.flatMap((group) => group.figures.map((row, index) => ({ ...row, groupKey: group.key, groupTitle: group.title, groupScope: group.scope, groupBoundary: group.boundary, anchorKey: row.anchorKey || group.anchorKey, position: index + 1 })));
const sourceByKey = new Map(sourceRows.map((row) => [row.key, row]));
const catalogByKey = new Map(catalogRows.map((row) => [row.key, row]));
const catalogGroupByKey = new Map(catalogGroupRows.map((row) => [row.key, row]));

function renderGroup(row) {
  return [
    `<p>${escapeHtml(row.title)}收录 ${row.figures ? row.figures.length : catalogRows.filter((item) => item.sectionKey === row.key).length} 个独立入口，用于把人物、地方与器物从总览拆开。</p>`,
    `<h2>收录范围</h2><p>${escapeHtml(row.title)}处理${escapeHtml(row.scope)}</p>`,
    `<h2>资料方法</h2><p>${escapeHtml(row.title)}优先使用经典、题记、考古报告、地方志和公开机构记录，并注明各自能证明的范围。</p>`,
    `<h2>辨读边界</h2><p>${escapeHtml(row.title)}遵守以下边界：${escapeHtml(row.boundary)}</p>`,
    `<h2>关系导航</h2><p>${escapeHtml(row.title)}中的成员顺序只服务目录；人物师承、地点沿革、仪式依据和物件用途另建证据关系。</p>`,
    `<h2>创作使用（项目原创提示）</h2><p>可从${escapeHtml(row.title)}发展寺院、节庆、行旅和工艺场景；新增人物对白与神异结果均属项目原创。</p>`,
    `<h2>公开边界</h2><p>${escapeHtml(row.title)}不复制第三方百科、新闻全文、现代传记或受版权保护的仪轨讲义。</p>`
  ].join("");
}

function renderSource(row) {
  return [
    `<p>${escapeHtml(row.title)}是本批人物、仪式与制度关系的资料入口；页面只保存项目自写说明和内部定位。</p>`,
    `<h2>文献范围</h2><p>${escapeHtml(row.title)}用于${escapeHtml(row.scope)}</p>`,
    `<h2>形成与版本</h2><p>${escapeHtml(row.title)}形成或整理于${escapeHtml(row.formation)}，本库定位到${escapeHtml(row.location)}。</p>`,
    `<h2>可证明什么</h2><p>${escapeHtml(row.title)}只支持其中明确记载的人名、制度、题名或年代；后世注释和现实执行另列。</p>`,
    `<h2>辨读边界</h2><p>${escapeHtml(row.title)}须遵守：${escapeHtml(row.boundary)}</p>`,
    `<h2>校读方法</h2><p>${escapeHtml(row.title)}与平行经典、碑铭、写本或机构档案对读，冲突处并列说法并标置信度。</p>`,
    `<h2>版权声明</h2><p>${escapeHtml(row.title)}不转录现代受版权保护译文；现代资料只提取可核事实并由项目重新表述。</p>`
  ].join("");
}

function renderFigure(row) {
  const source = sourceByKey.get(row.sourceKey);
  const anchor = catalogByKey.get(row.anchorKey);
  return [
    `<p>${escapeHtml(row.title)}被收入“${escapeHtml(row.groupTitle)}”，首要资料入口为${escapeHtml(source.title)}。</p>`,
    `<h2>人物位置</h2><p>${escapeHtml(row.title)}${escapeHtml(row.role)} 本页不把经典赞语或公共职衔扩写成完整私人生平。</p>`,
    `<h2>活动与传统</h2><p>${escapeHtml(row.title)}处于${escapeHtml(row.layer)}，并通过${escapeHtml(anchor.title)}进入更大的经典、制度或区域网络。</p>`,
    `<h2>文献证据</h2><p>${escapeHtml(row.title)}以${escapeHtml(source.title)}及可定位平行经、碑记或机构档案互证；异名和年代差异保留。</p>`,
    `<h2>后世形象</h2><p>${escapeHtml(row.title)}在礼敬、注释、地方故事或公共纪念中的形象属于接受史，不能倒推所有早期细节。</p>`,
    `<h2>辨读边界</h2><p>${escapeHtml(row.title)}遵守“${escapeHtml(row.groupBoundary)}”这一边界，同名人物依据语系、时代和身份消歧。</p>`,
    `<h2>创作使用（项目原创提示）</h2><p>可围绕${escapeHtml(row.title)}的${escapeHtml(row.role)}设计故事；新增对白、心理、行程和结局均属项目原创。</p>`
  ].join("");
}

function renderCatalog(row) {
  const group = catalogGroupByKey.get(row.sectionKey);
  return [
    `<p>${escapeHtml(row.title)}属于“${escapeHtml(group.title)}”，本页记录其历史位置、实际用途与地域差异。</p>`,
    `<h2>对象说明</h2><p>${escapeHtml(row.title)}的条目类型为${escapeHtml(row.kind)}：${escapeHtml(row.scope)}</p>`,
    `<h2>形成与使用</h2><p>${escapeHtml(row.title)}按经典、题记、建筑层、器物年代或地方记录分期，不把今天的样貌视为固定古制。</p>`,
    `<h2>关系位置</h2><p>${escapeHtml(row.title)}会连接相应人物、寺院、经轨、节庆或物件；相似外观和同名不足以建立历史关系。</p>`,
    `<h2>辨读边界</h2><p>${escapeHtml(row.title)}必须注意：${escapeHtml(row.boundary)}</p>`,
    `<h2>创作使用（项目原创提示）</h2><p>${escapeHtml(row.title)}可为场景、任务和物件设计提供依据；新增功效、传说与事件结果必须标为项目原创。</p>`,
    `<h2>资料声明</h2><p>${escapeHtml(row.title)}采用项目自写说明，不复制景区文案、第三方百科或现代仪轨出版物。</p>`
  ].join("");
}

function buildGroupEntity(row, order, worldId, now) {
  return { id: southernEntityId(`group-${row.key}`, worldId), worldId, type: "note", title: row.title, slug: `mythology-buddhism-southern-material-group-${row.key}`, summary: `${row.title}：${row.scope}`, content: renderGroup(row), tags: ["中国神话史", "佛教完整知识库", "目录", "项目自写整理", row.title], visibility: "public", createdBy: "user-owner", updatedAt: now, categoryId: categoryId(worldId, "buddhism"), order, templateId: `template:${worldId}:mythology:institution-ritual`, templateData: { tradition: "佛教", institutionKind: "佛教知识库分区目录", hierarchyLevel: "南传、寺院、仪轨与物质文化层", jurisdiction: row.scope, formationPeriod: "按对象历史分期", earliestSource: "本组条目所列经典、题记与机构记录", sourceLocation: "本组关系与资料栏", variants: row.boundary, confidence: "主流说法" } };
}

function buildSourceEntity(row, order, worldId, now) {
  return { id: southernSourceId(row.key, worldId), worldId, type: "note", title: row.title, slug: `mythology-buddhism-southern-material-source-${row.key}`, summary: `${row.title}：${row.scope}`, content: renderSource(row), tags: ["中国神话史", "佛教完整知识库", "巴利与云南史料", "项目自写整理", row.title], visibility: "public", createdBy: "user-owner", updatedAt: now, categoryId: categoryId(worldId, "primary-sources"), order, templateId: `template:${worldId}:mythology:source-text`, templateData: { workTitle: row.title, workType: row.workType, formationPeriod: row.formation, edition: "原文传本、校勘本与现代目录分层", volumeSection: row.location, sourceLayer: row.sourceLayer, rightsStatus: row.rightsStatus, internalCitation: `${row.title} · ${row.location}`, reviewStatus: row.reviewStatus } };
}

function buildFigureEntity(row, order, worldId, now) {
  const source = sourceByKey.get(row.sourceKey);
  return { id: southernEntityId(`person-${row.key}`, worldId), worldId, type: "character", title: row.title, slug: `mythology-buddhism-southern-material-person-${row.key}`, summary: row.role, content: renderFigure(row), tags: ["中国神话史", "佛教完整知识库", "南传佛教人物", row.groupTitle, "项目自写整理", row.title], visibility: "public", createdBy: "user-owner", updatedAt: now, categoryId: categoryId(worldId, "buddhist-patriarchs"), order, templateId: `template:${worldId}:mythology:deity-person`, templateData: { canonicalName: row.title, aliases: row.aliases || "", tradition: "佛教", identityType: "历史人物", earliestSource: source.title, sourceLocation: source.location, narrativeEra: "经典人物或历史人物；注释传记与后世礼敬另列接受史。", historicalLayer: row.historicalLayer || "跨时期", domains: row.role, iconography: "经典人物图像、历史肖像和后世艺术形象分开记录，不据晚出造像反推容貌。", worship: "以经典阅读、僧团记忆、寺院纪念或公共文化活动为主。", regionalVariants: row.groupBoundary, confidence: row.title === "帕雅真" ? "存疑" : "主流说法", editorialStatus: "复核中", originalAdaptation: "false" } };
}

function buildCatalogEntity(row, order, worldId, now) {
  const sourceTitle = row.sectionKey === "china-theravada" ? "云南地方志、寺院碑记、贝叶经题记与公开机构记录" : "佛教经典、经录、碑铭、考古资料与寺院志";
  const common = { id: southernEntityId(`entry-${row.key}`, worldId), worldId, title: row.title, slug: `mythology-buddhism-southern-material-entry-${row.key}`, summary: `${row.title}：${row.scope}`, content: renderCatalog(row), tags: ["中国神话史", "佛教完整知识库", catalogGroupByKey.get(row.sectionKey).title, "项目自写整理", row.title], visibility: "public", createdBy: "user-owner", updatedAt: now, order };
  if (row.place) {
    return { ...common, type: "location", categoryId: categoryId(worldId, "mythic-geography"), templateId: `template:${worldId}:mythology:sacred-geography`, templateData: { spaceKind: row.spaceKind || "庙宇与遗址", tradition: "佛教", historicalPeriod: "按题记、遗址和地方志分期", sourceTitle, sourceLocation: "本条资料与时间线栏", modernCorrespondence: row.modern || "按历史地名与现代行政区对照", confidence: "明确", mapCaution: "地图坐标只标识现代对应或大致区域，不把传说地点自动等同精确经纬度。" } };
  }
  return { ...common, type: "note", categoryId: categoryId(worldId, "buddhism"), templateId: `template:${worldId}:mythology:institution-ritual`, templateData: { tradition: "佛教", institutionKind: row.kind, hierarchyLevel: catalogGroupByKey.get(row.sectionKey).title, jurisdiction: row.scope, formationPeriod: "按经典、题记与实物分期", earliestSource: sourceTitle, sourceLocation: "本条资料、关系与时间线栏", variants: row.boundary, confidence: "主流说法" } };
}

function relation(key, sourceRef, targetRef, label, citation, scope, options = {}) {
  return { key, sourceRef, targetRef, label, sourceCitation: citation, historicalScope: scope, kind: options.kind || "custom", direction: "directed", strength: options.strength || 4, evidenceType: options.evidenceType || "historical-record", confidence: options.confidence || "probable", notes: options.notes || "关系按经典、碑铭、地方志、考古或机构记录分层，不以相似名称代替证据。" };
}

const membershipRelations = figureRows.map((row) => relation(`member-${row.key}`, `p:${row.key}`, `g:${row.groupKey}`, "列入南传与巴利人物分区", sourceByKey.get(row.sourceKey).title, row.layer, { kind: "member", strength: 5, confidence: "certain" }));
const sourceRelations = figureRows.map((row) => relation(`source-figure-${row.key}`, `p:${row.key}`, `src:${row.sourceKey}`, "主要史料入口", sourceByKey.get(row.sourceKey).title, row.layer, { kind: "source", strength: 5, evidenceType: row.sourceKey === "modern-yunnan-records" ? "historical-record" : "primary-text", confidence: row.sourceKey === "modern-yunnan-records" ? "probable" : "certain", notes: "该边只给出首要资料入口；异名、年代、注释故事与现任职务继续逐项核对。" }));
const personSequenceRelations = personGroupRows.flatMap((group) => group.figures.slice(0, -1).map((row, index) => relation(`sequence-person-${group.key}-${index + 1}`, `p:${row.key}`, `p:${group.figures[index + 1].key}`, "本组下一人物", sourceByKey.get(row.sourceKey).title, group.scope, { strength: 2, evidenceType: "scholarly-inference", notes: "此边只承担目录导航，不表示师承、相见或地位高低。" })));
const personAnchorRelations = figureRows.map((row) => relation(`anchor-person-${row.key}`, `p:${row.key}`, `e:${row.anchorKey}`, "人物传统与阅读入口", sourceByKey.get(row.sourceKey).title, row.layer, { kind: "influence", strength: 3, evidenceType: "scholarly-inference", notes: "连接人物与主要阅读分区，不把人物限制为单一身份。" }));
const catalogMembershipRelations = catalogRows.map((row) => relation(`catalog-member-${row.key}`, `e:${row.key}`, `g:${row.sectionKey}`, "列入专题目录", "本批经典、地方志、题记、考古与机构资料对读", catalogGroupByKey.get(row.sectionKey).scope, { kind: "member", strength: 5, confidence: "certain" }));
const catalogSequenceRelations = catalogGroupRows.flatMap((group) => {
  const rows = catalogRows.filter((item) => item.sectionKey === group.key);
  return rows.slice(0, -1).map((row, index) => relation(`sequence-catalog-${group.key}-${index + 1}`, `e:${row.key}`, `e:${rows[index + 1].key}`, "本专题下一条目", "本批专题目录次序", group.scope, { strength: 2, evidenceType: "scholarly-inference", notes: "目录次序仅服务浏览，不表示历史因果或等级。" }));
});

const crossRows = [
  ["south-sources", "e:china-theravada", "src:yunnan-inscriptions", "云南历史资料入口"],
  ["south-modern", "e:china-theravada", "src:modern-yunnan-records", "近现代公开记录入口"],
  ["pali-vinaya-ordination", "src:pali-vinaya", "e:full-ordination", "具足戒经典制度入口"],
  ["pali-vinaya-uposatha", "src:pali-vinaya", "e:uposatha", "布萨经典制度入口"],
  ["pali-vinaya-rains", "src:pali-vinaya", "e:rains-retreat", "安居经典制度入口"],
  ["pali-vinaya-pavarana", "src:pali-vinaya", "e:pavarana", "自恣经典制度入口"],
  ["palm-script", "e:palm-leaf-manuscripts", "e:tai-lue-scripture", "贝叶载体与傣泐文佛典"],
  ["palm-cover", "e:palm-leaf-manuscripts", "e:palm-leaf-covers", "贝叶写本与经夹"],
  ["tan-scripture", "e:tan-tan-scripture", "e:palm-leaf-manuscripts", "献经节仪与贝叶文本"],
  ["water-birthday", "e:water-splashing-buddha-bathing", "e:buddha-birthday", "云南新年与浴佛节仪交会"],
  ["education-script", "e:temple-education-yunnan", "e:tai-lue-scripture", "佛寺教育与民族文字"],
  ["border-network", "e:cross-border-pali-world", "e:china-theravada", "跨境经典与戒律交流"],
  ["stupa-relic", "e:stupa", "e:reliquary", "佛塔与舍利瘗藏"],
  ["famen-relic", "e:famen-temple", "e:reliquary", "法门寺地宫与舍利器"],
  ["mogao-murals", "e:mogao-caves", "e:buddhist-murals", "莫高窟壁画资料"],
  ["yungang-sculpture", "e:yungang-grottoes", "e:buddhist-sculpture", "云冈造像资料"],
  ["longmen-sculpture", "e:longmen-grottoes", "e:buddhist-sculpture", "龙门造像与题记"],
  ["wutai-manjusri", "e:wutai-mountain", "g:sites", "文殊道场与圣地目录"],
  ["kasaya-ordination", "e:kasaya", "e:full-ordination", "僧衣与戒律身份"],
  ["bowl-vinaya", "e:alms-bowl", "src:pali-vinaya", "僧钵与律制资料"],
  ["vajra-mandala", "e:vajra-bell", "e:mandala", "密教法器与坛城系统"],
  ["chant-instruments", "e:wooden-fish", "e:qing-chime", "汉地诵念节拍法器"],
  ["drum-ritual", "e:dharma-drum", "g:rituals", "法鼓与法会秩序"]
];
const crossRelations = crossRows.map(([key, sourceRef, targetRef, label]) => relation(`cross-${key}`, sourceRef, targetRef, label, "本批经典、题记、考古、地方志与机构记录对读", "古代至当代佛教传播与物质文化层", { kind: "influence", evidenceType: "scholarly-inference", confidence: "probable" }));

function event(key, trackKey, ref, title, summary, startValue, endValue, displayDate, era) { return { key, trackKey, ref, title, summary, startValue, endValue, displayDate, era }; }
const eventRows = [
  event("first-community", "textual-evidence", "p:vappa", "五比丘与鹿野苑初期僧团进入律藏和经藏叙事", "不同语系经典保存相近框架与细节差异，本库按平行文本互证。", "-500", "-400", "传统约公元前五世纪", "早期佛教经典叙事层"),
  event("therigatha", "textual-evidence", "p:patacara", "《长老尼偈》保存早期女性修行偈颂", "偈颂核心与后出注释传记分层，避免用注释故事覆盖人物自述。", "-300", "100", "约公元前后数世纪定型", "巴利小部文本形成层"),
  event("pali-written", "textual-evidence", "src:pali-vinaya", "斯里兰卡传统记载巴利三藏写定", "编年史把战争与饥荒背景下的口传保存写成阿卢寺结集记忆。", "-29", "-17", "传统约公元前一世纪", "巴利三藏写本化记忆层"),
  event("dipavamsa-formed", "textual-evidence", "src:dipavamsa", "《岛史》形成早期巴利编年叙事", "王统、僧团和传法路线首次获得连续巴利史书框架。", "300", "400", "约四世纪", "斯里兰卡巴利史书层"),
  event("buddhaghosa-commentaries", "textual-evidence", "p:buddhaghosa", "觉音整理巴利注疏与《清净道论》传统", "作者生平主要依后世资料，具体著作归属按题记和注疏谱系核对。", "400", "500", "约五世纪", "巴利注疏学层"),
  event("mahavamsa-formed", "textual-evidence", "src:mahavamsa", "《大史》编成并持续接受续写", "摩哂陀传法、王统和塔寺叙事形成影响深远的历史框架。", "500", "600", "约五至六世纪", "斯里兰卡佛教史编纂层"),
  event("yunnan-palm-texts", "textual-evidence", "e:palm-leaf-manuscripts", "傣文贝叶经推动云南南传文本传播", "十三世纪以后文字、佛寺和僧团逐步形成稳定网络，早期传入说另列。", "1200", "1500", "约十三至十五世纪", "云南贝叶经传播层"),
  event("dehong-records", "textual-evidence", "e:dehong-traditions", "明代史料出现德宏寺塔与南传佛教线索", "地方志和朝廷记录与傣文、缅文传统需互证。", "1400", "1600", "约十五至十六世纪", "德宏南传史料层"),
  event("palm-leaf-cataloging", "textual-evidence", "src:yunnan-inscriptions", "云南贝叶经、地方志与寺院题记得到系统整理", "整理工作使地方经目、文字和寺院沿革获得可检索入口。", "1950", "2010", "约二十世纪后半至2010年", "云南南传资料整理层"),
  event("pali-education-texts", "textual-evidence", "src:modern-yunnan-records", "云南佛学院与教界建立巴利语系课程和版本目录", "课程材料只作目录记录，不转录现代讲义。", "1986", "2026", "约1986年至今", "云南南传现代教育资料层"),
  event("bhikkhuni-order", "religious-institutions", "p:patacara", "巴利律藏叙述比丘尼僧团建立与戒法形成", "制度形成涉及摩诃波阇波提和八敬法等复杂传本问题，另页比较。", "-500", "-400", "传统约公元前五世纪", "早期佛教僧团制度层"),
  event("lanka-mission", "religious-institutions", "p:mahinda", "编年史记摩哂陀赴楞伽传法", "传法、王室护持和大寺建立构成斯里兰卡佛教起源叙事。", "-250", "-200", "传统约公元前三世纪", "斯里兰卡传法制度记忆层"),
  event("bodhi-tree-lanka", "religious-institutions", "p:sanghamitta", "僧伽蜜多与菩提树枝传入楞伽的传统", "比丘尼传承、王室供养和圣树礼敬在编年史中相互连接。", "-250", "-200", "传统约公元前三世纪", "斯里兰卡尼众与圣树制度层"),
  event("mahavihara", "religious-institutions", "p:devanampiya-tissa", "大寺僧团获得王室园林供养", "编年史以园林布施说明僧团、城市与王权关系。", "-250", "-200", "传统约公元前三世纪", "阿努拉德普勒大寺制度层"),
  event("parakramabahu-reform", "religious-institutions", "p:parakramabahu-first", "波罗迦罗摩跋护一世时期重整僧团", "编年史称统一受戒与寺院管理，具体范围和长期效果另作复核。", "1153", "1186", "1153至1186年", "斯里兰卡中世纪僧团层"),
  event("paya-zhen", "religious-institutions", "p:paya-zhen", "帕雅真入主勐泐并进入南传传播记忆", "地方王权、兰那往来和佛教影响扩大相连，确切初传年代仍存不同观点。", "1180", "1200", "约十二世纪后期", "西双版纳王权与佛教层"),
  event("xishuangbanna-sangha", "religious-institutions", "e:xishuangbanna-yun", "西双版纳逐步形成佛寺、佛塔与僧团", "傣文佛典、跨境交往和地方王权共同支持十三世纪后的稳定传播。", "1200", "1600", "约十三至十六世纪", "西双版纳南传制度层"),
  event("dehong-sangha", "religious-institutions", "e:dehong-traditions", "德宏地区形成多支南传佛教寺院网络", "来自缅甸方向的传承与地方社会结合，各派名称和范围按地记录。", "1400", "1900", "约十五至十九世纪", "德宏南传制度层"),
  event("temple-education", "religious-institutions", "e:temple-education-yunnan", "云南南传佛寺长期承担文字与社区教育", "入寺学习、经典讲诵和民族文字教育的普及程度随地区变化。", "1500", "2000", "约十六至二十世纪", "云南佛寺教育制度层"),
  event("white-horse-memory", "religious-institutions", "e:white-horse-temple", "白马寺成为汉地佛教初传的制度象征", "寺院沿革与永平求法故事长期叠加，史料层次分别保存。", "68", "1000", "东汉以后", "汉地初传寺院记忆层"),
  event("lingyin-center", "religious-institutions", "e:lingyin-temple", "灵隐寺在吴越以后持续成为杭州佛教中心", "寺院沿革、禅宗活动与飞来峰造像共同构成多层历史空间。", "907", "2026", "吴越至今", "杭州佛教寺院制度层"),
  event("pali-college", "religious-institutions", "p:dao-shuren", "云南佛学院逐步建设南传巴利语系教育", "教界、教育者与公共机构合作形成课程和人才培养体系。", "1986", "2026", "约1986年至今", "云南现代佛教教育层"),
  event("general-temple-restored", "religious-institutions", "e:xishuangbanna-general-temple", "西双版纳总佛寺恢复并承担教务教育活动", "现代恢复、升座和交流活动按公开机构记录分期。", "1980", "2026", "约二十世纪末至今", "西双版纳现代寺院层"),
  event("ordination-recognition", "religious-institutions", "p:pasonglie-longzhuangmeng", "西双版纳举行帕松列与帕祜巴升座活动", "僧阶认定依据公开教职规范和教界程序，不能扩写为私人传记。", "2016", "2016", "2016年", "中国南传僧阶制度层"),
  event("stupa-cult", "cult-evolution", "e:stupa", "舍利塔从印度窣堵波发展出中国多种塔式", "建筑技术、供养对象与政治纪念在不同地区重新组合。", "-300", "1900", "古代至近代", "佛塔形制与信仰演变层"),
  event("buddhapada-devotion", "cult-evolution", "e:buddhapada", "佛足迹在南传地区持续作为佛陀在场象征", "天然印迹认定、人工刻制和朝圣礼仪形成不同地方传统。", "-200", "2026", "古代至今", "佛足迹礼敬层"),
  event("vessantara-offering", "cult-evolution", "e:tan-tan-scripture", "本生故事在云南献经与民间文学中地方化", "须大拏、召树屯等故事在诵讲、绘画和节庆中形成地方版本。", "1300", "2026", "约十四世纪至今", "云南佛教文学接受层"),
  event("water-festival", "cult-evolution", "e:water-splashing-buddha-bathing", "新年、浴佛与泼水活动形成复合节庆", "宗教仪式、社区祝福和公共文化展示在现代继续分化。", "1500", "2026", "约十六世纪至今", "云南节庆演变层"),
  event("ullambana-development", "cult-evolution", "e:ullambana", "盂兰盆会与中元荐亡传统长期交会", "供僧、救母叙事、家族祭祖和地方节俗各有来源。", "500", "1900", "约六世纪至近代", "汉地佛教节仪演变层"),
  event("water-land-development", "cult-evolution", "e:water-land", "水陆法会在宋元以后形成大型复合仪式", "仪文、坛场、绘画和国家或地方功德活动逐步汇合。", "1000", "1900", "宋代至近代", "汉地大型法会形成层"),
  event("sculpture-sinicization", "cult-evolution", "e:buddhist-sculpture", "中国佛教造像形成多地区材料与风格系统", "印度、中亚输入与地方工匠传统在石窟、寺院和单体造像中重新组合。", "100", "1300", "约二至十三世纪", "中国佛教艺术演变层"),
  event("heritage-documentation", "cult-evolution", "e:mogao-caves", "近现代考古与保护重新组织佛教遗产知识", "洞窟编号、测绘、影像和修复记录成为新资料层，也伴随文物流散问题。", "1900", "2026", "二十世纪至今", "佛教文化遗产研究层")
];

function resolveRef(reference, worldId) {
  const cut = reference.indexOf(":");
  const scope = reference.slice(0, cut);
  const key = reference.slice(cut + 1);
  if (scope === "p") return southernEntityId(`person-${key}`, worldId);
  if (scope === "g") return southernEntityId(`group-${key}`, worldId);
  if (scope === "e") return southernEntityId(`entry-${key}`, worldId);
  if (scope === "src") return southernSourceId(key, worldId);
  throw new Error(`未知南传与物质文化批引用：${reference}`);
}

function buildRelation(row, worldId, now) {
  return { id: `relation:${worldId}:mythology:buddhism-southern-material:${row.key}`, worldId, sourceEntityId: resolveRef(row.sourceRef, worldId), targetEntityId: resolveRef(row.targetRef, worldId), kind: row.kind, label: row.label, direction: row.direction, strength: row.strength, evidenceType: row.evidenceType, sourceCitation: row.sourceCitation, historicalScope: row.historicalScope, confidence: row.confidence, notes: row.notes, updatedAt: now };
}

function buildTimelineEvent(row, worldId, now, index) {
  const primary = resolveRef(row.ref, worldId);
  return { id: `timeline-event:${worldId}:mythology:buddhism-southern-material:${row.key}`, worldId, entityId: primary, questId: "", sceneId: "", references: [{ kind: "entity", id: primary }], trackId: trackId(row.trackKey, worldId), title: row.title, summary: row.summary, displayDate: row.displayDate, datePrecision: row.startValue === row.endValue ? "year" : "range", sortOrder: 1100 + index * 2, startValue: row.startValue, endValue: row.endValue, era: row.era, dependencyIds: [], updatedAt: now };
}

function assertBatchShape() {
  const groupRows = [...personGroupRows, ...catalogGroupRows];
  const relationCount = membershipRelations.length + sourceRelations.length + personSequenceRelations.length + personAnchorRelations.length + catalogMembershipRelations.length + catalogSequenceRelations.length + crossRelations.length;
  const checks = [[personGroupRows.length, 5, "人物分区"], [catalogGroupRows.length, 4, "专题分区"], [figureRows.length, 44, "人物"], [sourceRows.length, 10, "史料"], [catalogRows.length, 65, "专题条目"], [groupRows.length, 9, "目录"], [relationCount, 320, "关系"], [eventRows.length, 32, "事件"]];
  for (const [actual, expected, label] of checks) if (actual !== expected) throw new Error(`${BATCH_LABEL}${label}数量应为 ${expected}，实际为 ${actual}`);
}

function buildBuddhismSouthernMaterialBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const figures = figureRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const sources = sourceRows.map((row, index) => buildSourceEntity(row, figures.length + index, worldId, now));
  const catalogEntries = catalogRows.map((row, index) => buildCatalogEntity(row, figures.length + sources.length + index, worldId, now));
  const groups = [...personGroupRows, ...catalogGroupRows].map((row, index) => buildGroupEntity(row, figures.length + sources.length + catalogEntries.length + index, worldId, now));
  const relationRows = [...membershipRelations, ...sourceRelations, ...personSequenceRelations, ...personAnchorRelations, ...catalogMembershipRelations, ...catalogSequenceRelations, ...crossRelations];
  return { key: BATCH_KEY, label: BATCH_LABEL, entities: [...figures, ...sources, ...catalogEntries, ...groups], figures, sources, catalogEntries, systems: groups, relations: relationRows.map((row) => buildRelation(row, worldId, now)), timelineEvents: eventRows.map((row, index) => buildTimelineEvent(row, worldId, now, index)), featuredEntityIds: [southernEntityId("entry-china-theravada", worldId), southernEntityId("entry-xishuangbanna-general-temple", worldId), southernEntityId("person-mahinda", worldId), southernEntityId("person-paya-zhen", worldId), southernEntityId("entry-water-land", worldId), southernEntityId("entry-buddhist-sculpture", worldId)] };
}

module.exports = { BATCH_KEY, BATCH_LABEL, buildBuddhismSouthernMaterialBatch, southernEntityId, southernSourceId, personGroupRows, catalogGroupRows, figureRows, sourceRows, catalogRows, eventRows, WORLD_ID, categoryId };
