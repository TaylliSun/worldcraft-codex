const { WORLD_ID, categoryId } = require("./chinese-mythology-history-data.cjs");
const { buddhismEntityId, buddhismSourceId } = require("./chinese-mythology-buddhism-transmission-data.cjs");
const { schoolsEntityId } = require("./chinese-mythology-buddhism-schools-data.cjs");
const { pantheonSourceId } = require("./chinese-mythology-buddhism-pantheon-data.cjs");
const { canonEntityId } = require("./chinese-mythology-buddhism-canon-data.cjs");
const { supplementEntityId, supplementSourceId } = require("./chinese-mythology-buddhism-canon-supplement-data.cjs");

const BATCH_KEY = "buddhism-han-people-26";
const BATCH_LABEL = "佛教完整知识库 · 汉传译师、祖师、尼众与近现代人物批";

function hanEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:buddhism-han-people:${key}`;
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

function person(key, title, layer, role, options = {}) {
  return { key, title, layer, role, ...options };
}

const groupRows = [
  {
    key: "translators",
    title: "汉传译经与早期僧史人物群",
    category: "buddhist-patriarchs",
    scope: "从三国至宋初，记录译师、游方僧、经录编者和僧传作者怎样让不同语言的佛教文本进入中国。",
    boundary: "译经是口授、笔受、证义、润文和校勘共同完成的工作；人物名下的译籍须逐部看题记与经录，不以僧传一句话包办。",
    sourceRef: "bs:gaoseng-zhuan-group",
    anchorRef: "b:translation-workshop",
    sourceCitation: "《出三藏记集》《高僧传》《续高僧传》与历代经录",
    sourceLayer: "汉晋至宋初译经与僧传编纂层",
    figures: [
      person("kang-senghui", "康僧会", "魏晋六朝", "三国吴地译经僧与佛教活动者，传统记忆把译述、感应与建寺相连。"),
      person("kang-mengxiang", "康孟详", "两汉文献层", "东汉末译经者，参与中本起经等早期汉译，生平材料有限。"),
      person("zhu-dali", "竺大力", "两汉文献层", "东汉末来华译经者，与康孟详等共同处在早期译经网络。"),
      person("zhu-fonian", "竺佛念", "魏晋六朝", "后秦译场的重要传语与译者，参与《长阿含经》等多部经律翻译。"),
      person("fotudeng", "佛图澄", "魏晋六朝", "后赵时期西域高僧，参与北方政治与僧团扩展，神异叙事尤其丰富。"),
      person("daoan", "道安", "魏晋六朝", "东晋僧团领袖、经录整理者和般若学者，推动释姓与译经规范。"),
      person("huijiao", "慧皎", "魏晋六朝", "梁代《高僧传》作者，以十科体例组织汉晋以来僧人历史。"),
      person("sengyou", "僧祐", "魏晋六朝", "梁代律学僧和目录学家，编《出三藏记集》保存早期经序与译人材料。"),
      person("faxian", "法显", "魏晋六朝", "东晋求法僧，经陆路至印度、海路归国并译律典、撰旅行记录。"),
      person("baoyun", "宝云", "魏晋六朝", "与法显同路西行的求法僧和译者，后在江南参与译经。"),
      person("zhimeng", "智猛", "魏晋六朝", "刘宋以前西行求法者，旅行记忆见僧传与经录引述。"),
      person("juqu-jingsheng", "沮渠京声", "魏晋六朝", "北凉王族出身的译经者，入宋后继续译出禅法与大乘文献。"),
      person("dharmaksema", "昙无谶", "魏晋六朝", "北凉译师，译出四十卷《大般涅槃经》等，经传亦保存政治死亡叙事。"),
      person("buddhayasas", "佛陀耶舍", "魏晋六朝", "罽宾译师，主持《长阿含经》《四分律》等后秦汉译。"),
      person("sanghadeva", "僧伽提婆", "魏晋六朝", "罽宾译师，在建康译出《中阿含经》和阿毗昙文献。"),
      person("ratnamati", "勒那摩提", "魏晋六朝", "北魏译师，参与《十地经论》等大乘论书汉译。"),
      person("dharmaruci-wei", "达摩流支（北魏译师）", "魏晋六朝", "北魏时期译经者，须与隋代达摩笈多及同名译师分开。"),
      person("buddhasanta", "佛陀扇多", "魏晋六朝", "北魏译师，译出摄大乘与大乘经论相关文献。"),
      person("vimoksaprajna", "毗目智仙", "魏晋六朝", "北魏译场成员，参与《金刚仙论》等题署复杂的论释翻译。"),
      person("narendrayasas", "那连提耶舍", "魏晋六朝", "北齐至隋初译师，译出大集、月藏等经本。"),
      person("jnanagupta", "阇那崛多", "隋唐", "北周至隋代译师，参与《添品法华经》等译经和目录校核。"),
      person("mandrasena", "曼陀罗仙", "魏晋六朝", "梁代来华译师，译出大乘经与陀罗尼文献。"),
      person("sanghabhara", "僧伽婆罗", "魏晋六朝", "扶南来华译师，在梁代译出阿育王、解脱道等经论。"),
      person("upasunya", "月婆首那", "魏晋六朝", "北魏至北齐译师，译出胜天王般若等大乘经。"),
      person("prabhakaramitra", "波罗颇迦罗蜜多罗", "隋唐", "唐初译师，参与大庄严论和宝星陀罗尼等文献翻译。"),
      person("siksananda", "实叉难陀", "隋唐", "于武周译八十卷《华严经》和七卷《楞伽经》的于阗译师。"),
      person("bodhiruci-tang", "菩提流志", "隋唐", "唐代译师，主持《大宝积经》编译，须与北魏菩提流支分开。"),
      person("prajna-translator", "般若三藏", "隋唐", "唐代罽宾译师，译四十卷华严行愿品等，与般若概念词消歧。"),
      person("danapala", "施护", "宋元", "北宋译经院译师，译出密教、大乘和部派文献。"),
      person("devasanti", "天息灾", "宋元", "北宋译经院初期重要译师，与施护、法天等共同参与官译。")
    ]
  },
  {
    key: "scholars",
    title: "汉传宗派义学与律学人物群",
    category: "buddhist-patriarchs",
    scope: "补足三论、天台、华严、法相与律学中尚未建页的讲师、注家和跨地域传承者。",
    boundary: "宗派祖位常由后世追排；同一人物可以兼学多宗，不能因一部代表作便抹去其余活动。",
    sourceRef: "hs:fozu-tongji",
    anchorRef: "h:family-school-commentaries",
    sourceCitation: "僧传、著述题记、《佛祖统纪》与宗派史料",
    sourceLayer: "六朝至宋元宗派义学与律学层",
    figures: [
      person("sengquan", "僧诠", "魏晋六朝", "摄山三论学者，法朗所从受学人物，生平多见后出宗派记忆。"),
      person("falang", "法朗", "魏晋六朝", "梁陈三论学者，在兴皇寺讲学并影响吉藏。"),
      person("huibu", "慧布", "魏晋六朝", "陈代三论学僧，僧传保留其游学、讲论和与同门往来。"),
      person("huijun", "慧均", "隋唐", "隋唐之际三论注家，著述保存早期宗义和诸家解释。"),
      person("yuankang", "元康", "隋唐", "唐代三论学者，著《肇论疏》等，连接三论与僧肇研究。"),
      person("zhiwei", "智威", "隋唐", "唐代天台传承人物，后世祖统列为智顗、灌顶之后的重要一环。"),
      person("huiwei", "慧威", "隋唐", "唐代天台学僧，长期活动于东阳一带，祖统称东阳尊者。"),
      person("xuanlang", "玄朗", "隋唐", "唐代天台祖师，居左溪讲学，湛然从其门下受学。"),
      person("daosui", "道邃", "隋唐", "唐代天台学僧，最澄入唐时从学者之一，史料需中日对读。"),
      person("xingman", "行满", "隋唐", "唐代天台山学僧，参与向日本求法僧传授天台文献。"),
      person("zhili", "知礼", "宋元", "北宋四明天台代表人物，围绕山家山外和观心问题展开论辩。"),
      person("zhiyuan", "智圆", "宋元", "北宋天台山外派学者，兼通儒释并留下大量注疏。"),
      person("renyue", "仁岳", "宋元", "北宋天台学者，与知礼门下及山家解释发生复杂往来。"),
      person("congyi", "从义", "宋元", "北宋天台僧，著述回应宗派争论并整理教观。"),
      person("huiyuan-huayan", "慧苑", "隋唐", "法藏弟子和华严注家，著刊定记，对新译华严分科有独立意见。"),
      person("li-tongxuan", "李通玄", "隋唐", "唐代在家华严学者，以《新华严经论》形成独特解释。"),
      person("jingyuan", "净源", "宋元", "北宋华严僧，推动华严教典刊刻、讲学和跨海传播。"),
      person("zixuan", "子璿", "宋元", "北宋华严兼楞严注家，被后世华严传承列入祖师系统。"),
      person("uisang", "义湘", "隋唐", "新罗华严僧，入唐从智俨学，返国后发展海东华严。"),
      person("wonhyo", "元晓", "隋唐", "新罗思想家，广注大乘经论，其著述深刻进入东亚佛教。"),
      person("shenfang", "神昉", "隋唐", "玄奘门下法相学僧，参与译场并讲习唯识。"),
      person("puguang", "普光", "隋唐", "玄奘门下俱舍学者，著《俱舍论记》。"),
      person("fabao", "法宝", "隋唐", "唐代俱舍注家，与普光在若干判释上有异。"),
      person("zhizhou", "智周", "隋唐", "唐代法相宗学者，承慧沼学系并影响日本法相传承。"),
      person("dunlun", "遁伦", "隋唐", "新罗出身瑜伽行注家，著《瑜伽论记》保存多家解释。"),
      person("taehyon", "太贤", "隋唐", "新罗法相与戒学僧，著述涵盖梵网、唯识和菩萨戒。"),
      person("huiguang", "慧光", "魏晋六朝", "北朝地论和律学重要人物，后世相部律系追认其地位。"),
      person("fali", "法砺", "隋唐", "唐初相部律宗学者，围绕《四分律》建立解释系统。"),
      person("zhishou", "智首", "隋唐", "唐初律学僧，道宣所从受学的重要老师。"),
      person("huaisu-law", "怀素（东塔律宗）", "隋唐", "唐代东塔律宗代表人物，与相部、南山的判释存在分歧。"),
      person("dingbin", "定宾", "隋唐", "唐代律学注家，参与戒本和羯磨的精细解释。"),
      person("yuanzhao-law", "元照", "宋元", "北宋南山律学复兴者，著资持记并兼重净土。"),
      person("yunkan", "允堪", "宋元", "北宋律学僧，与元照形成会正、资持两系讨论。"),
      person("lingyu", "灵裕", "魏晋六朝", "北齐至隋初义学高僧，广涉地论、华严与涅槃。"),
      person("huiyuan-jingying", "慧远（净影寺）", "魏晋六朝", "隋代地论学者和大乘义章作者，须与东晋庐山慧远消歧。")
    ]
  },
  {
    key: "chan",
    title: "唐宋禅门师家与语录人物群",
    category: "buddhist-patriarchs",
    scope: "从南岳、青原两系到五家七宗、宋代公案禅与明清复兴，补足灯录和语录中具有持续影响的人物。",
    boundary: "机缘问答常在人物去世后数十年甚至更久才定稿；页面保存文本影响，不把所有对白当作当日原话。",
    sourceRef: "hs:jingde-chuandeng-lu",
    anchorRef: "h:family-chan-records",
    sourceCitation: "碑铭、灯录、语录及其版本题记",
    sourceLayer: "唐宋至明清禅宗谱系与语录编纂层",
    figures: [
      person("nanyue-huairang", "南岳怀让", "隋唐", "后世南岳系祖师，马祖道一师承叙事的关键人物。"),
      person("qingyuan-xingsi", "青原行思", "隋唐", "后世青原系祖师，石头希迁师承链的重要节点。"),
      person("puji", "普寂", "隋唐", "神秀门下北宗领袖，长期在两京受朝廷礼遇。"),
      person("yifu", "义福", "隋唐", "神秀门下禅师，与普寂并列为唐代北宗重要人物。"),
      person("shitou-xiqian", "石头希迁", "隋唐", "唐代禅师，青原系关键人物，《参同契》传统归于其名下。"),
      person("yaoshan-weiyan", "药山惟俨", "隋唐", "石头门下禅师，后世曹洞谱系的重要前驱。"),
      person("tianhuang-daowu", "天皇道悟", "隋唐", "唐代禅师，其师承与荆南禅系在灯录中有不同记法。"),
      person("danxia-tianran", "丹霞天然", "隋唐", "唐代禅师，烧木佛故事最著名，但事件文本晚出需分层。"),
      person("nanquan-puyuan", "南泉普愿", "隋唐", "马祖门下禅师，赵州等从学；著名公案多见宋代编本。"),
      person("zhaozhou-congshen", "赵州从谂", "隋唐", "唐代禅师，以平常语言式问答在宋代公案集中影响深远。"),
      person("huangbo-xiyun", "黄檗希运", "隋唐", "唐代禅师，临济义玄之师，裴休编录其法语。"),
      person("linji-yixuan", "临济义玄", "隋唐", "临济宗名祖，语录经宋代编订后成为宗派核心文本。"),
      person("guishan-lingyou", "沩山灵祐", "隋唐", "马祖再传禅师，与仰山慧寂共同成为沩仰宗祖师。"),
      person("yangshan-huiji", "仰山慧寂", "隋唐", "沩山灵祐弟子，沩仰宗师资和圆相传统人物。"),
      person("dongshan-liangjie", "洞山良价", "隋唐", "曹洞宗祖师，五位说与语录传统在后世系统化。"),
      person("caoshan-benji", "曹山本寂", "隋唐", "洞山门下禅师，曹洞宗名号和五位解释的重要人物。"),
      person("xuefeng-yicun", "雪峰义存", "隋唐", "晚唐闽地禅师，门下展开云门、法眼等多条法系。"),
      person("xuansha-shibei", "玄沙师备", "隋唐", "雪峰门下禅师，以三句等教说影响法眼系。"),
      person("yunmen-wenyan", "云门文偃", "魏晋六朝", "五代禅师、云门宗祖师；历史层模板按六朝不足，正文以五代明确。", { layer: "宋元" }),
      person("fayan-wenyi", "法眼文益", "宋元", "五代南唐禅师、法眼宗祖师，重视问答与教眼。"),
      person("deshan-xuanjian", "德山宣鉴", "隋唐", "唐代禅师，呵佛骂祖形象多由后世语录塑造。"),
      person("yantou-quanhuo", "岩头全豁", "隋唐", "德山门下禅师，在雪峰等人师承叙事中位置突出。"),
      person("shoushan-shengnian", "首山省念", "宋元", "宋初临济宗传承人物，汾阳善昭之师。"),
      person("fenyang-shanzhao", "汾阳善昭", "宋元", "北宋临济宗禅师，以颂古、代别等形式扩展公案教学。"),
      person("shishuang-chuyuan", "石霜楚圆", "宋元", "北宋临济宗禅师，黄龙慧南和杨岐方会之师。"),
      person("huanglong-huinan", "黄龙慧南", "宋元", "临济宗黄龙派祖师，在江西形成广泛门庭。"),
      person("yangqi-fanghui", "杨岐方会", "宋元", "临济宗杨岐派祖师，后世临济主流多由此展开。"),
      person("wuzu-fayan", "五祖法演", "宋元", "北宋杨岐派禅师，圆悟克勤等从学。"),
      person("xuedou-chongxian", "雪窦重显", "宋元", "北宋云门宗禅师，以百则颂古成为《碧岩录》前层文本作者。"),
      person("touzi-yiqing", "投子义青", "宋元", "北宋曹洞宗禅师，后世法系以代付方式解释其传承。"),
      person("furong-daokai", "芙蓉道楷", "宋元", "北宋曹洞宗禅师，门下推动宗风在宋代扩展。"),
      person("danxia-zichun", "丹霞子淳", "宋元", "北宋曹洞禅师，宏智正觉、真歇清了从其受学。"),
      person("hongzhi-zhengjue", "宏智正觉", "宋元", "南宋曹洞宗禅师，默照禅与颂古传统的重要人物。"),
      person("yuanwu-keqin", "圆悟克勤", "宋元", "北宋至南宋临济宗禅师，《碧岩录》评唱者。"),
      person("dahui-zonggao", "大慧宗杲", "宋元", "南宋临济宗禅师，倡看话禅并批评把默照变成停滞工夫。"),
      person("zhenxie-qingliao", "真歇清了", "宋元", "南宋曹洞宗禅师，参与默照传统与海上寺院网络。"),
      person("changlu-zongze", "长芦宗赜", "宋元", "北宋禅僧，编《禅苑清规》并提倡念佛禅观。"),
      person("yongming-yanshou", "永明延寿", "宋元", "五代宋初法眼系禅师，以《宗镜录》会通禅教并重净土。"),
      person("wumen-huikai", "无门慧开", "宋元", "南宋临济宗禅师，《无门关》编者。"),
      person("wansong-xingxiu", "万松行秀", "宋元", "金元曹洞宗禅师，《从容录》评唱者。"),
      person("zhongfeng-mingben", "中峰明本", "宋元", "元代临济宗禅师，游方结庵并影响东亚禅门。"),
      person("chushi-fanqi", "楚石梵琦", "宋元", "元明之际禅僧，兼具语录、诗文与净土实践。"),
      person("hanshan-deqing", "憨山德清", "明清", "明代禅僧与注经家，参与晚明佛教复兴。"),
      person("zibo-zhenke", "紫柏真可", "明清", "晚明禅僧，推动刻藏和寺院复兴，政治遭际有史料可考。"),
      person("yinyuan-longqi", "隐元隆琦", "明清", "明末赴日禅僧，成为黄檗宗开祖并连接中日寺院文化。")
    ]
  },
  {
    key: "pure-land",
    title: "汉地净土祖师、注家与居士人物群",
    category: "buddhist-patriarchs",
    scope: "补入唐宋行仪、明清居士写作和近代净土复兴人物，展示祖统之外的文献与社会网络。",
    boundary: "净土祖师名单在不同传统中会变；这里记录可核人物与著述，不把后世排序当作本人自称。",
    sourceRef: "hs:lebon-wenlei",
    anchorRef: "h:family-pure-land-writings",
    sourceCitation: "净土论著题记、《乐邦文类》、僧传与祖师史料",
    sourceLayer: "唐代至近代净土教观与实践层",
    figures: [
      person("shaokang", "少康", "隋唐", "唐代净土僧，后世祖统重视其念佛教化和新定仪式记忆。"),
      person("huiri", "慧日", "隋唐", "唐代西行求法僧与净土倡导者，著述多有散佚。"),
      person("feixi", "飞锡", "隋唐", "唐代念佛论著作者，参与多种念佛法门的义理说明。"),
      person("shengchang", "省常", "宋元", "北宋杭州净土结社人物，后世称净行社或白莲社。"),
      person("zunshi", "慈云遵式", "宋元", "北宋天台僧，编忏法并推动净土礼仪和社会救济。"),
      person("jiedu", "戒度", "宋元", "南宋净土注家，著闻持记等解释阿弥陀经。"),
      person("zongxiao", "宗晓", "宋元", "南宋净土史料编者，编《乐邦文类》。"),
      person("wang-riyou", "王日休", "宋元", "南宋居士，编《龙舒净土文》和会集本《大阿弥陀经》。"),
      person("zhuhong", "云栖祩宏", "明清", "晚明高僧，兼弘禅、净、戒，著述影响居士社会。"),
      person("zhixu", "蕅益智旭", "明清", "明末清初僧人，天台、净土、戒学和经论注释并重。"),
      person("xingce", "截流行策", "明清", "清初净土僧，组织念佛道场并著劝修文。"),
      person("shixian", "省庵实贤", "明清", "清代净土僧，以发菩提心文和莲社实践著称。"),
      person("jixing", "彻悟际醒", "明清", "清代禅净僧，晚年专弘净土，后世列入净土祖统。"),
      person("peng-shaosheng", "彭绍升", "明清", "清代居士，著净土论述并整理往生传。"),
      person("yinguang", "印光圣量", "近现代整理", "近代净土僧，通过书信、刊刻和慈善网络推动净土传播；不复制现代整理文本。")
    ]
  },
  {
    key: "women-lay",
    title: "汉地尼众、帝王与在家护持人物群",
    category: "buddhist-sinicization",
    scope: "以早期比丘尼传记为一支，以国家护持、居士讲学和家庭修行为另一支，补足僧团之外的参与者。",
    boundary: "护持不等于教义权威，帝王功德叙事也不掩盖政策冲突；尼传神异与可考行止分栏处理。",
    sourceRef: "ns:buddhist-biographies-nuns",
    anchorRef: "h:family-historiography",
    sourceCitation: "《比丘尼传》、正史、护教文集与碑铭",
    sourceLayer: "六朝至唐宋尼众、王权与在家佛教层",
    figures: [
      person("jingjian-nun", "净检比丘尼", "魏晋六朝", "传统记载中中国最早正式受具足戒的比丘尼之一。", { sourceRef: "ns:buddhist-biographies-nuns" }),
      person("huiguo-nun", "慧果比丘尼", "魏晋六朝", "《比丘尼传》所载尼众人物，修行与弘化叙事按本传定位。", { sourceRef: "ns:buddhist-biographies-nuns" }),
      person("zhixian-nun", "智仙比丘尼", "魏晋六朝", "六朝尼众传记人物，相关神异和戒行叙述不超出本传。", { sourceRef: "ns:buddhist-biographies-nuns" }),
      person("tanhui-nun", "昙晖比丘尼", "魏晋六朝", "《比丘尼传》所录尼僧，页面保留传记文本层和寺院活动线索。", { sourceRef: "ns:buddhist-biographies-nuns" }),
      person("baoxian-nun", "宝贤比丘尼", "魏晋六朝", "六朝尼众人物，戒学和师承以《比丘尼传》为主要入口。", { sourceRef: "ns:buddhist-biographies-nuns" }),
      person("fabian-nun", "法辩比丘尼", "魏晋六朝", "六朝比丘尼传记人物，讲诵与德行材料按原传核读。", { sourceRef: "ns:buddhist-biographies-nuns" }),
      person("sengduan-nun", "僧端比丘尼", "魏晋六朝", "《比丘尼传》所载人物，寺院主持与戒行信息不由同名者补足。", { sourceRef: "ns:buddhist-biographies-nuns" }),
      person("liang-wudi", "梁武帝萧衍", "魏晋六朝", "南梁皇帝，广建法会、撰护教文并深度介入僧团与国家关系。", { sourceRef: "hs:guang-hongming-ji" }),
      person("sui-wendi", "隋文帝杨坚", "隋唐", "隋朝建立者，以舍利分送、建寺写经等政策重建国家佛教。", { sourceRef: "hs:guang-hongming-ji" }),
      person("tang-taizong", "唐太宗李世民", "隋唐", "唐代皇帝，与玄奘译场、慈恩寺和《大唐西域记》序文关系密切。", { sourceRef: "hs:guang-hongming-ji" }),
      person("wu-zetian", "武则天", "隋唐", "武周皇帝，支持华严译场、佛教造像和政治经义解释。", { sourceRef: "hs:guang-hongming-ji" }),
      person("pei-xiu", "裴休", "隋唐", "唐代官员和居士，与宗密、黄檗希运著述传承关系密切。", { sourceRef: "hs:guang-hongming-ji" }),
      person("pang-yun", "庞蕴", "隋唐", "唐代居士，后世禅录以家庭修行和机语塑造其形象。", { sourceRef: "hs:jingde-chuandeng-lu" }),
      person("pang-lingzhao", "庞灵照", "隋唐", "庞蕴之女，灯录以敏捷问答呈现其在家禅者形象。", { sourceRef: "hs:jingde-chuandeng-lu" }),
      person("fu-dashi", "傅大士", "魏晋六朝", "梁代居士傅翕，后世以弥勒化身、讲经和轮藏发明者等多层形象纪念。", { sourceRef: "hs:guang-hongming-ji" })
    ]
  },
  {
    key: "modern",
    title: "近现代汉传佛教教育与复兴人物群",
    category: "buddhist-patriarchs",
    scope: "记录晚清至二十世纪的刻经、学院教育、僧制改革、戒律复兴和汉藏佛学交流。",
    boundary: "人物著作可能仍受版权保护；页面只写可核生平和机构关系，不转录现代作品，不把门人纪念文当作无偏见史料。",
    sourceRef: "",
    anchorRef: "h:family-historiography",
    sourceCitation: "公开年表、学校与寺院档案、本人著述题记及近现代史料",
    sourceLayer: "晚清至二十世纪佛教复兴与教育层",
    figures: [
      person("yang-wenhui", "杨文会", "近现代整理", "晚清居士，创金陵刻经处并推动佛典刊刻、教育与国际交流。"),
      person("ouyang-jingwu", "欧阳竟无", "近现代整理", "近代佛教学者，主持支那内学院并推动唯识文献研究。"),
      person("lv-cheng", "吕澂", "近现代整理", "近现代佛教学者，研究印度佛学、因明、唯识与藏汉文献。"),
      person("taixu", "太虚", "近现代整理", "近代僧人，倡导佛教教育、僧制改革和人生佛教。"),
      person("xuyun", "虚云", "近现代整理", "近现代禅僧，参与多座祖庭复兴；年寿和部分行迹需按不同传记核对。"),
      person("hongyi", "弘一", "近现代整理", "近代律学僧李叔同，推动南山律研究、书写和佛教艺术传播。"),
      person("yuanying", "圆瑛", "近现代整理", "近代禅教僧和佛教组织领袖，讲经、赈济与僧团公共事务并重。"),
      person("dixian", "谛闲", "近现代整理", "近代天台宗讲师，创办佛学院并培养多位讲经僧。"),
      person("fazun", "法尊", "近现代整理", "近现代汉藏佛学译者和教育者，译介宗喀巴等藏传论著。"),
      person("nenghai", "能海", "近现代整理", "近现代汉地学习藏传格鲁教法的僧人，建立译修与僧团实践网络。")
    ]
  }
];

const figureRows = groupRows.flatMap((group) => group.figures.map((row, index) => ({
  ...row,
  groupKey: group.key,
  groupTitle: group.title,
  groupScope: group.scope,
  groupBoundary: group.boundary,
  category: row.category || group.category,
  sourceRef: row.sourceRef === undefined ? group.sourceRef : row.sourceRef,
  anchorRef: row.anchorRef || group.anchorRef,
  sourceCitation: row.sourceCitation || group.sourceCitation,
  sourceLayer: row.sourceLayer || group.sourceLayer,
  position: index + 1
})));

function renderGroup(row) {
  return [
    `<p>${escapeHtml(row.title)}现收 ${row.figures.length} 位独立历史身份，服务于人物检索、时间线和宗派关系图。</p>`,
    `<h2>收录范围</h2><p>${escapeHtml(row.scope)}</p>`,
    `<h2>证据用法</h2><p>${escapeHtml(row.title)}优先使用题记、经录、碑铭和可定位史传；后出祖谱与纪念叙事另列接受层。</p>`,
    `<h2>辨读边界</h2><p>${escapeHtml(row.boundary)}</p>`,
    `<h2>关系导航</h2><p>人物按本组排列只是阅读次序，不表示法位高低。师徒、译场、著述和王权关系必须各自带来源。</p>`,
    `<h2>创作使用</h2><p>可以从行旅、讲席、译场和寺院日常发展故事；项目新增对白、内心活动和未见史料的遭遇须标明原创。</p>`,
    `<h2>资料声明</h2><p>${escapeHtml(row.title)}不复制第三方人物传记；近现代文字仅作书目定位，不转录仍受保护的作品。</p>`
  ].join("");
}

function renderFigure(row) {
  return [
    `<p>${escapeHtml(row.title)}被收入“${escapeHtml(row.groupTitle)}”，身份入口来自${escapeHtml(row.sourceCitation)}。</p>`,
    `<h2>人物位置</h2><p>${escapeHtml(row.title)}${escapeHtml(row.role)} 本页只处理能够落到文献或机构记录的部分。</p>`,
    `<h2>活动与工作</h2><p>理解${escapeHtml(row.title)}时，应把译经、讲学、修行、护持或组织工作放回${escapeHtml(row.sourceLayer)}，不借后世名号提前替人物定义宗派。</p>`,
    `<h2>文献证据</h2><p>${escapeHtml(row.title)}的主要核对入口为${escapeHtml(row.sourceCitation)}。若不同材料对年代、师承或著作归属说法不一，页面保留差异而不强行拼合。</p>`,
    `<h2>后来的位置</h2><p>${escapeHtml(row.title)}在祖统、寺院纪念或现代研究中的地位，属于接受史；它可以解释影响，却不能倒过来证明早期传记的每一个细节。</p>`,
    `<h2>辨读边界</h2><p>${escapeHtml(row.title)}在本页的辨读边界是：${escapeHtml(row.groupBoundary)} 同名僧、法号变化和追谥须以时代、寺院和师承共同消歧。</p>`,
    `<h2>创作使用（项目原创提示）</h2><p>可围绕${escapeHtml(row.title)}的${escapeHtml(row.role)}设计场景，但新增对白、私人情感、秘闻或神异结局均为项目原创，不属于传统史料。</p>`
  ].join("");
}

function buildGroupEntity(row, order, worldId, now) {
  return {
    id: hanEntityId(`group-${row.key}`, worldId), worldId, type: "note", title: row.title,
    slug: `mythology-buddhism-han-people-group-${row.key}`,
    summary: `${row.title}收录 ${row.figures.length} 位人物，按史料、祖统和后世接受分层。`,
    content: renderGroup(row), tags: ["中国神话史", "佛教完整知识库", "汉传佛教人物", "项目自写整理", row.title],
    visibility: "public", createdBy: "user-owner", updatedAt: now,
    categoryId: categoryId(worldId, "buddhism"), order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: { tradition: "佛教", institutionKind: "人物群与传承索引", hierarchyLevel: "汉传佛教历史人物层", jurisdiction: row.scope, formationPeriod: row.sourceLayer, earliestSource: row.sourceCitation, sourceLocation: "本组人物页及其关系证据", variants: row.boundary, confidence: "主流说法" }
  };
}

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: hanEntityId(row.key, worldId), worldId, type: "character", title: row.title,
    slug: `mythology-buddhism-han-person-${row.key}`,
    summary: row.role, content: renderFigure(row),
    tags: ["中国神话史", "佛教完整知识库", "汉传佛教人物", row.groupTitle, "项目自写整理", row.title],
    visibility: "public", createdBy: "user-owner", updatedAt: now,
    categoryId: categoryId(worldId, row.category), order,
    templateId: `template:${worldId}:mythology:deity-person`,
    templateData: {
      canonicalName: row.title, aliases: row.aliases || "", tradition: "佛教", identityType: row.identityType || (["translators", "women-lay", "modern"].includes(row.groupKey) ? "历史人物" : "祖师"),
      earliestSource: row.sourceCitation, sourceLocation: row.sourceCitation,
      narrativeEra: "历史人物，神异与祖师传说另列接受层。", historicalLayer: row.layer,
      domains: row.role, iconography: "历史肖像、祖师像与后世艺术形象分开记录，不据晚出造像反推容貌。",
      worship: "以寺院纪念、宗派祖堂、著述流传或公共文化记忆为主。",
      regionalVariants: row.groupBoundary, confidence: "主流说法", editorialStatus: "复核中", originalAdaptation: "false"
    }
  };
}

function rel(key, sourceRef, targetRef, label, citation, scope, options = {}) {
  return { key, sourceRef, targetRef, label, sourceCitation: citation, historicalScope: scope, kind: options.kind || "custom", direction: "directed", strength: options.strength || 4, evidenceType: options.evidenceType || "historical-record", confidence: options.confidence || "probable", notes: options.notes || "关系依据所列史料层，不把后世祖谱自动当作同时代记录。" };
}

const membershipRelations = figureRows.map((row) => rel(`member-${row.key}`, `p:${row.key}`, `g:${row.groupKey}`, "列入汉传人物分区", row.sourceCitation, row.sourceLayer, { kind: "member", strength: 5, confidence: "certain" }));
const sourceRelations = figureRows.filter((row) => row.sourceRef).map((row) => rel(`source-figure-${row.key}`, `p:${row.key}`, row.sourceRef, "主要史料入口", row.sourceCitation, row.sourceLayer, { kind: "source", strength: 5, confidence: row.groupKey === "chan" ? "probable" : "certain", notes: "此边给出人物页的首要史料入口；著作归属、年代和神异仍须逐项复核。" }));
const sequenceRelations = groupRows.flatMap((group) => group.figures.slice(0, -1).map((row, index) => rel(`sequence-${group.key}-${index + 1}`, `p:${row.key}`, `p:${group.figures[index + 1].key}`, "本组下一人物", group.sourceCitation, group.sourceLayer, { strength: 2, evidenceType: "scholarly-inference", confidence: "probable", notes: "顺序只为目录导航，不表示师承、地位或先后相见。" })));
const anchorRelations = figureRows.map((row) => rel(`anchor-${row.key}`, `p:${row.key}`, row.anchorRef, "人物研究分区入口", row.sourceCitation, row.sourceLayer, { kind: "influence", strength: 3, evidenceType: "scholarly-inference", confidence: "probable", notes: "连接人物与相应文献或制度分区，不把人物限定为单一宗派。" }));

const crossRows = [
  ["translators-workshop", "g:translators", "b:translation-workshop", "译经团队与人物网络"],
  ["scholars-tiantai", "g:scholars", "b3:tiantai-system", "天台学者分支"],
  ["scholars-huayan", "g:scholars", "b3:huayan-system", "华严学者分支"],
  ["scholars-faxiang", "g:scholars", "b3:faxiang-system", "法相唯识学者分支"],
  ["scholars-sanlun", "g:scholars", "c:family-madhyamaka", "三论学者分支"],
  ["scholars-vinaya", "g:scholars", "b3:vinaya-system", "律学人物分支"],
  ["chan-system", "g:chan", "b3:chan-system", "禅宗师资与语录人物"],
  ["pureland-system", "g:pure-land", "b3:pure-land-system", "净土教观与祖师人物"],
  ["women-history", "g:women-lay", "h:family-historiography", "尼众与在家护持史料"],
  ["modern-history", "g:modern", "h:family-historiography", "近现代佛教史研究入口"],
  ["chan-pureland", "g:chan", "g:pure-land", "禅净兼修人物交叉区"],
  ["lay-pureland", "g:women-lay", "g:pure-land", "居士净土实践交叉区"],
  ["translators-scholars", "g:translators", "g:scholars", "译本扩展推动义学分化"],
  ["scholars-chan", "g:scholars", "g:chan", "禅教论辩与会通"],
  ["modern-translators", "g:modern", "g:translators", "近现代重新整理汉藏译学"],
  ["modern-schools", "g:modern", "g:scholars", "现代学院重读宗派论著"]
];
const crossRelations = crossRows.map(([key, sourceRef, targetRef, label]) => rel(`cross-${key}`, sourceRef, targetRef, label, "本批人物史料、宗派著述与制度记录对读", "汉晋至近现代佛教传播史层", { kind: "influence", evidenceType: "scholarly-inference", confidence: "probable" }));

function evt(key, trackKey, ref, title, summary, startValue, endValue, displayDate, era) { return { key, trackKey, ref, title, summary, startValue, endValue, displayDate, era }; }
const eventRows = [
  evt("kang-senghui-wu", "textual-evidence", "p:kang-senghui", "康僧会在吴地译述并建立僧团记忆", "经录与僧传把译经、舍利感应和建初寺叙事连在一起，历史层次分别保存。", "247", "280", "约247至280年", "三国吴佛教传播层"),
  evt("daoan-catalogue", "textual-evidence", "p:daoan", "道安整理经录并推动译经规范", "经序和目录传统记录其辨经、注经与僧团组织工作。", "365", "385", "约365至385年", "东晋佛教目录与僧团层"),
  evt("faxian-travel", "textual-evidence", "p:faxian", "法显西行求取戒律并由海路归国", "旅行和译经记录连接长安、印度、师子国与建康。", "399", "414", "约399至414年", "东晋求法旅行层"),
  evt("dharmaksema-nirvana", "textual-evidence", "p:dharmaksema", "昙无谶在北凉译出涅槃等大乘经", "四十卷涅槃经的形成与译师政治遭际在经录、僧传中分别可见。", "412", "433", "约412至433年", "北凉译经层"),
  evt("sengyou-chu", "textual-evidence", "p:sengyou", "僧祐编成《出三藏记集》", "经录、序跋和译人传被汇为现存最重要的早期佛教文献史料之一。", "500", "518", "约六世纪初", "梁代佛教目录编纂层"),
  evt("huijiao-gaoseng", "textual-evidence", "p:huijiao", "慧皎编成《高僧传》", "十科体例让译经、义解、习禅、明律等人物进入系统僧史。", "519", "530", "约六世纪前半", "梁代僧传编纂层"),
  evt("siksananda-huayan", "textual-evidence", "p:siksananda", "实叉难陀主持八十卷华严新译", "武周译场以新本重整华严会次和译语。", "695", "699", "695至699年", "武周华严译场层"),
  evt("bodhiruci-ratnakuta", "textual-evidence", "p:bodhiruci-tang", "菩提流志编译《大宝积经》", "旧译与新译会本汇成一百二十卷总集。", "706", "713", "706至713年", "唐代宝积编译层"),
  evt("zhili-debate", "textual-evidence", "p:zhili", "知礼参与山家山外论争并著述教观", "北宋天台学围绕观心、理毒等问题形成大量往复文本。", "990", "1028", "约990至1028年", "北宋天台论辩层"),
  evt("li-tongxuan-huayan", "textual-evidence", "p:li-tongxuan", "李通玄撰《新华严经论》", "在家学者以八十华严为基础发展独特的方位、十信和佛果解释。", "700", "730", "约八世纪初", "唐代华严居士论释层"),
  evt("puguang-kosa", "textual-evidence", "p:puguang", "普光撰《俱舍论记》", "玄奘新译俱舍在门下形成系统注释和讲习文本。", "650", "680", "约七世纪后半", "唐代俱舍注疏层"),
  evt("yuanzhao-zichi", "textual-evidence", "p:yuanzhao-law", "元照以《资持记》重整南山律学", "宋代律学在戒本、行事钞和净土实践之间建立新的解释网络。", "1060", "1116", "约十一至十二世纪", "北宋南山律复兴层"),
  evt("jingde-lineage", "textual-evidence", "p:fayan-wenyi", "法眼、云门等法系进入宋初灯录总谱", "五代人物的语录和师承由宋代编者整理为五家宗派记忆。", "970", "1011", "约十至十一世纪初", "宋初禅宗灯录层"),
  evt("blue-cliff-voices", "textual-evidence", "p:yuanwu-keqin", "圆悟评唱雪窦颂古形成《碧岩录》", "一百则公案叠加本则、颂古、垂示和评唱，不能视作单一时代文本。", "1111", "1125", "约十二世纪初", "宋代禅宗公案文本层"),
  evt("dahui-letters", "textual-evidence", "p:dahui-zonggao", "大慧宗杲以书信和法语推广看话禅", "士大夫通信与寺院示众共同塑造南宋临济禅实践。", "1130", "1163", "约十二世纪中叶", "南宋看话禅文献层"),
  evt("zongxiao-lebang", "textual-evidence", "p:zongxiao", "宗晓编《乐邦文类》", "宋以前净土经论、碑记和往生材料得到分类汇编。", "1190", "1200", "约十二世纪末", "南宋净土史料编纂层"),
  evt("wang-riyou-longshu", "textual-evidence", "p:wang-riyou", "王日休编《龙舒净土文》", "居士写作把劝修、仪式和往生故事带入更广的读者群。", "1160", "1173", "约十二世纪后半", "南宋净土居士文献层"),
  evt("zhuhong-writing", "textual-evidence", "p:zhuhong", "云栖祩宏以丛林与著述会通禅净戒", "晚明刻书、放生和居士网络共同扩大其影响。", "1570", "1615", "约十六世纪后半至1615年", "晚明佛教复兴文本层"),
  evt("yang-wenhui-printing", "textual-evidence", "p:yang-wenhui", "杨文会以金陵刻经处重刊散佚佛典", "海内外搜书、刻版和学堂计划改变近代佛典流通。", "1866", "1911", "1866至1911年", "晚清佛典刊刻层"),
  evt("fazun-translation", "textual-evidence", "p:fazun", "法尊持续翻译藏传佛教论著", "汉藏院教育和译著让宗喀巴等人的论书获得现代汉文入口。", "1930", "1980", "约1930至1980年", "近现代汉藏译学层"),
  evt("fotudeng-north", "religious-institutions", "p:fotudeng", "佛图澄影响后赵僧团与国家关系", "僧传把政治劝诫、建寺和神异能力交织，制度事实与圣传修辞分读。", "310", "348", "约310至348年", "十六国北方佛教制度层"),
  evt("liang-wudi-buddhism", "religious-institutions", "p:liang-wudi", "梁武帝以法会、诏令和寺院政策重塑国家佛教", "帝王护教与僧团治理、财政和儒道论辩同时展开。", "502", "549", "502至549年", "南梁国家佛教层"),
  evt("sui-relic", "religious-institutions", "p:sui-wendi", "隋文帝分送舍利并重建全国寺塔网络", "多轮舍利分送把新王朝合法性与地方佛教设施连接。", "601", "604", "601至604年", "隋代舍利与国家寺院层"),
  evt("wu-zetian-huayan", "religious-institutions", "p:wu-zetian", "武周支持华严译场与佛教政治象征", "八十华严翻译、造像和经典解释与武周政治文化相互作用。", "690", "705", "690至705年", "武周国家佛教层"),
  evt("five-houses", "religious-institutions", "g:chan", "五家禅门在唐宋灯录中形成宗派图式", "沩仰、临济、曹洞、云门、法眼的名称和谱系经后世编纂逐步定型。", "850", "1100", "约九至十一世纪", "唐宋禅宗制度记忆层"),
  evt("pureland-societies", "religious-institutions", "g:pure-land", "宋以后莲社、念佛会与礼赞行仪持续扩展", "僧侣和居士共同组织结社，使净土实践进入城市和家庭网络。", "960", "1900", "约宋代至清代", "汉地净土社会组织层"),
  evt("bhiksuni-memory", "religious-institutions", "g:women-lay", "《比丘尼传》保存早期汉地尼众制度记忆", "本传让受戒、住寺、讲诵和女众师承获得独立史料入口。", "500", "520", "约六世纪初", "梁代尼传编纂层"),
  evt("song-vinaya-revival", "religious-institutions", "p:yuanzhao-law", "北宋南山律学形成会正与资持讨论", "律疏刊刻、戒坛和净土实践共同推动戒学复兴。", "1000", "1150", "约十一至十二世纪", "宋代律学制度层"),
  evt("modern-buddhist-education", "religious-institutions", "g:modern", "近代佛学院与研究机构形成新式佛教教育", "祇洹精舍、支那内学院和各地佛学院把刻经、语言训练与僧伽教育连接。", "1900", "1950", "约1900至1950年", "近代佛教教育制度层"),
  evt("modern-organizations", "religious-institutions", "p:yuanying", "近代全国佛教组织参与教育、赈济与寺产协调", "圆瑛、太虚等人在不同组织中推动僧团公共事务，路线并不完全一致。", "1912", "1949", "1912至1949年", "民国佛教公共组织层"),
  evt("daoan-surname-memory", "cult-evolution", "p:daoan", "释姓传统把道安塑为汉地僧团规范象征", "后世以释为共同姓氏的实践持续关联道安记忆，具体普及过程跨越多期。", "350", "1000", "约四至十世纪", "汉地僧名制度接受层"),
  evt("danxia-burning-buddha", "cult-evolution", "p:danxia-tianran", "丹霞烧木佛成为禅宗反常规叙事", "晚出灯录和公案集不断重述该故事，其象征意义不等于可核现场记录。", "900", "1600", "约十至十六世纪的编纂传播", "禅宗公案接受层"),
  evt("zhaozhou-gongan", "cult-evolution", "p:zhaozhou-congshen", "赵州问答进入宋代公案课程", "无字、公案和茶语被反复评唱，人物历史与教学文本分层。", "1000", "1600", "约十一至十六世纪", "禅宗公案接受层"),
  evt("chan-japan", "cult-evolution", "p:yinyuan-longqi", "隐元隆琦赴日形成黄檗宗与明风文化记忆", "寺院建筑、饮食、书法和法脉共同构成跨海接受史。", "1654", "1700", "1654年以后", "中日黄檗文化传播层"),
  evt("fu-dashi-incarnation", "cult-evolution", "p:fu-dashi", "傅大士逐渐获得弥勒化身与轮藏祖师形象", "历史居士、神圣化身和寺院轮藏传说在宋以后叠加。", "500", "1600", "约六至十六世纪", "傅大士信仰演变层"),
  evt("empress-wu-images", "cult-evolution", "p:wu-zetian", "武则天与龙门造像、弥勒政治象征形成后世讨论", "造像题记、政治文本和后世传说需分别核对，不以面貌相似直接认定肖像。", "680", "2026", "唐代至现代研究", "武周佛教艺术接受层"),
  evt("pureland-patriarch-list", "cult-evolution", "g:pure-land", "净土祖师名单在宋明清逐步扩展", "不同地区和著述选择的祖师数目并不一致，本库保存版本化名单。", "1000", "1900", "约宋代至清代", "净土祖统形成层"),
  evt("zhuhong-lay-network", "cult-evolution", "p:zhuhong", "晚明居士社会重读云栖祩宏的禅净戒实践", "刻书、功过格、放生和家庭佛教让其形象超出单一禅门。", "1580", "1800", "约十六至十八世纪", "晚明清初居士佛教层"),
  evt("hongyi-art", "cult-evolution", "p:hongyi", "弘一的书法、戒学与公共形象在现代广泛传播", "艺术家李叔同与律僧弘一属于同一生涯的不同阶段，纪念叙事不替代年表。", "1918", "2026", "1918年至今", "现代佛教文化记忆层"),
  evt("modern-biography-review", "cult-evolution", "g:modern", "现代档案研究重新校核高僧年谱与自传", "书信、报刊、学校档案和口述回忆让近现代人物可以多源互证。", "1980", "2026", "约1980年至今", "近现代佛教史研究层")
];

function resolveRef(reference, worldId) {
  const cut = reference.indexOf(":");
  const scope = reference.slice(0, cut);
  const key = reference.slice(cut + 1);
  if (scope === "p") return hanEntityId(key, worldId);
  if (scope === "g") return hanEntityId(`group-${key}`, worldId);
  if (scope === "b") return buddhismEntityId(key, worldId);
  if (scope === "bs") return buddhismSourceId(key, worldId);
  if (scope === "b3") return schoolsEntityId(key, worldId);
  if (scope === "c") return canonEntityId(key, worldId);
  if (scope === "ns") return pantheonSourceId(key, worldId);
  if (scope === "h") return supplementEntityId(key, worldId);
  if (scope === "hs") return supplementSourceId(key, worldId);
  throw new Error(`未知汉传人物批引用：${reference}`);
}

function buildRelation(row, worldId, now) {
  return { id: `relation:${worldId}:mythology:buddhism-han-people:${row.key}`, worldId, sourceEntityId: resolveRef(row.sourceRef, worldId), targetEntityId: resolveRef(row.targetRef, worldId), kind: row.kind, label: row.label, direction: row.direction, strength: row.strength, evidenceType: row.evidenceType, sourceCitation: row.sourceCitation, historicalScope: row.historicalScope, confidence: row.confidence, notes: row.notes, updatedAt: now };
}

function buildTimelineEvent(row, worldId, now, index) {
  const primary = resolveRef(row.ref, worldId);
  return { id: `timeline-event:${worldId}:mythology:buddhism-han-people:${row.key}`, worldId, entityId: primary, questId: "", sceneId: "", references: [{ kind: "entity", id: primary }], trackId: trackId(row.trackKey, worldId), title: row.title, summary: row.summary, displayDate: row.displayDate, datePrecision: row.startValue === row.endValue ? "year" : "range", sortOrder: 900 + index * 2, startValue: row.startValue, endValue: row.endValue, era: row.era, dependencyIds: [], updatedAt: now };
}

function assertBatchShape() {
  const relationCount = membershipRelations.length + sourceRelations.length + sequenceRelations.length + anchorRelations.length + crossRelations.length;
  const checks = [[groupRows.length, 6, "人物分区"], [figureRows.length, 150, "人物"], [sourceRelations.length, 140, "史料关系"], [relationCount, 600, "关系"], [eventRows.length, 40, "事件"]];
  for (const [actual, expected, label] of checks) if (actual !== expected) throw new Error(`${BATCH_LABEL}${label}数量应为 ${expected}，实际为 ${actual}`);
}

function buildBuddhismHanPeopleBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const figures = figureRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const systems = groupRows.map((row, index) => buildGroupEntity(row, figures.length + index, worldId, now));
  const relationRows = [...membershipRelations, ...sourceRelations, ...sequenceRelations, ...anchorRelations, ...crossRelations];
  return { key: BATCH_KEY, label: BATCH_LABEL, entities: [...figures, ...systems], figures, systems, relations: relationRows.map((row) => buildRelation(row, worldId, now)), timelineEvents: eventRows.map((row, index) => buildTimelineEvent(row, worldId, now, index)), featuredEntityIds: [hanEntityId("daoan", worldId), hanEntityId("faxian", worldId), hanEntityId("linji-yixuan", worldId), hanEntityId("dahui-zonggao", worldId), hanEntityId("zhuhong", worldId), hanEntityId("jingjian-nun", worldId), hanEntityId("yang-wenhui", worldId), hanEntityId("taixu", worldId)] };
}

module.exports = { BATCH_KEY, BATCH_LABEL, buildBuddhismHanPeopleBatch, hanEntityId, groupRows, figureRows, eventRows, WORLD_ID, categoryId };
