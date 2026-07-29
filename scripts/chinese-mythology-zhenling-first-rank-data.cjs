const {
  WORLD_ID,
  categoryId
} = require("./chinese-mythology-history-data.cjs");
const {
  daoismEntityId
} = require("./chinese-mythology-daoism-early-data.cjs");
const {
  celestialEntityId
} = require("./chinese-mythology-celestial-bureaucracy-data.cjs");

const BATCH_KEY = "zhenling-weiye-first-rank-12";
const BATCH_LABEL = "道教神谱扩展 · 《真灵位业图》第一阶";

function zhenlingEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:zhenling-weiye:first-rank:${key}`;
}

function zhenlingSourceId(worldId = WORLD_ID) {
  return zhenlingEntityId("source-zhenling-weiye-tu", worldId);
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

const figureRows = [
  {
    key: "wuling-qiming-hunsheng-gaoshang-daojun",
    title: "五灵七明混生高上道君",
    sourceNameForm: "五靈七明混生高上道君",
    seatSide: "未注明",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "《真灵位业图》第一阶在元始天尊之后首先列出的高位道君，现存正文只给尊号，不附人间行迹。",
    confirmed: "尊号把“五灵”“七明”与“混生”并置，能够确认的是它在玉清境名单中的靠前位置。原典没有在这里解释这些词分别对应哪些天象、方位或经法。",
    caution: "后世材料中出现相近的“五灵”与“七明”术语，并不能自动成为这位道君的传记。除非找到同名经句或明确的传授关系，本页不替他安排眷属、法器和故事。",
    confidence: "身份待考"
  },
  {
    key: "dongming-gaoshang-xuhuang-daojun",
    title: "东明高上虚皇道君",
    sourceNameForm: "東明高上虚皇道君",
    seatSide: "未注明",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶四方名号之一，以“东明”为区别词，与西华、北玄、南朱三位连续列出。",
    confirmed: "四个方位尊号在原典中紧邻出现，东明高上虚皇道君居其首。这样的排列足以说明编者有意呈现方向秩序，却不足以证明四位具有后世四御式的固定职掌。",
    caution: "“东明”可以让人想到东方与光明，但原典没有进一步分配日出、木德或春季权能。页面只记录文字顺序，不把现代五行联想写成古籍事实。",
    confidence: "原典明确列名"
  },
  {
    key: "xihua-gaoshang-xuhuang-daojun",
    title: "西华高上虚皇道君",
    sourceNameForm: "西華高上虚皇道君",
    seatSide: "未注明",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶四方名号中的西方一位，原典以完整尊号列名，没有另记姓氏、居山或传授事迹。",
    confirmed: "西华高上虚皇道君紧接东明而列，随后才是北玄与南朱。资料能支持的是四方并列及第一阶归属，不能支持一套完整的西方神宫叙事。",
    caution: "“西华”也见于其他女真、宫阙和尊号语汇，单凭两个字不能把这些身份合并。后续批次会以全书同名检索检查重名，而不是现在先选一个熟悉对象套上去。",
    confidence: "原典明确列名"
  },
  {
    key: "beixuan-gaoshang-xuhuang-daojun",
    title: "北玄高上虚皇道君",
    sourceNameForm: "北玄高上虚皇道君",
    seatSide: "未注明",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶四方名号中的北方一位；名称虽含“北玄”，仍不能直接等同后世玄天上帝。",
    confirmed: "原典把北玄高上虚皇道君放在西华之后、南朱之前。这里的“玄”首先是尊号构件和方位用字，页面保留它在齐梁神谱中的语境。",
    caution: "玄武、真武和玄天上帝的信仰史另有文本链条。没有同一性证据之前，本条目不与它们建立别名关系，只允许以后增加带年代的存疑对应。",
    confidence: "原典明确列名"
  },
  {
    key: "nanzhu-gaoshang-xuhuang-daojun",
    title: "南朱高上虚皇道君",
    sourceNameForm: "南朱高上虚皇道君",
    seatSide: "未注明",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶四方名号的末位，以“南朱”为区别词，与前三位共同构成一组方位排列。",
    confirmed: "南朱高上虚皇道君之后，原典转入上元、中元、下元与散位合称。这个段落边界说明四方名号是连续编排的一组，而非从后文任意抽出的拼合。",
    caution: "“朱”容易被解释成火德或朱雀，但本段没有写出这些对应。创作可以借方位色彩取意，百科资料仍须把这种延伸标作项目改编。",
    confidence: "原典明确列名"
  },
  {
    key: "zixu-gaoshang-yuanhuang-daojun",
    title: "紫虚高上元皇道君",
    sourceNameForm: "紫虚高上元皇道君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "《真灵位业图》第一阶右位的首个单列尊号，位于四组合称神位之后。",
    confirmed: "原典用“右位”明确改变了列表分区，紫虚高上元皇道君由此成为本阶右位开端。能确认的重点是座次，而不是“元皇”一词在所有道经中的统一定义。",
    caution: "其他文献里的紫虚、元皇或道君称号可能属于不同神灵。条目暂不吸收相似名称，等全七阶录完后再做跨阶字形和尊号聚类。",
    confidence: "原典明确列名"
  },
  {
    key: "dongxu-sanyuan-taiming-shanghuang-daojun",
    title: "洞虚三元太明上皇道君",
    sourceNameForm: "洞虚三元太明上皇道君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶右位第二个单列神名，长尊号同时包含洞虚、三元、太明与上皇。",
    confirmed: "这串名号在现存名单中是一个连续单位，不能因为含有“三元”便拆成三位，也不能把“上皇”单独视作另一位。数据库保留完整原名以防搜索时失去上下文。",
    caution: "尊号成分在道经中经常重复使用。未来若发现简称，必须由明确同指的经句建立异名关系，不能仅凭词语相同自动合并。",
    confidence: "原典明确列名"
  },
  {
    key: "taisu-gaoxu-shangji-zihuang-daojun",
    title: "太素高虚上极紫皇道君",
    sourceNameForm: "太素高虚上極紫皇道君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "列于第一阶右位的高位道君，原名以“太素”“上极”“紫皇”层层限定。",
    confirmed: "名单只说明太素高虚上极紫皇道君的第一阶右位身份。它没有附带人间姓名，也没有说明“太素”在这里是否指宫域、气化阶段或尊号。",
    caution: "页面不会把后世哲学解释直接填进神职栏。对长尊号最稳妥的处理，是先保存字形与位置，再等待同名经文提供职掌。",
    confidence: "原典明确列名"
  },
  {
    key: "xuming-zilan-zhongyuan-gaoshang-tinghuang-daojun",
    title: "虚明紫兰中元高上嵉皇道君",
    sourceNameForm: "虚明紫蘭中元高上嵉皇道君",
    seatSide: "右位",
    identityType: "名录身份待考",
    recordNature: "仅见名录",
    summary: "第一阶右位的一条长名号，其中“嵉”属于需要保留并继续校本的罕见字形。",
    confirmed: "现用底本作“嵉皇”，知识库照录，不擅自改成更常见的“玄皇”或“真皇”。原典位置与原始字形会一起参与后续版本比对。",
    caution: "罕见字最容易在网页转录和现代输入法中发生替换。没有看到另一底本前，规范名称仅做简繁转换，不做读音猜测或语义修补。",
    confidence: "字形待校"
  },
  {
    key: "sanyuan-shangxuan-laoxuhuang-yuanchen-jun",
    title: "三元上玄老虚皇元晨君",
    sourceNameForm: "三元上玄老虚皇元晨君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶右位神名之一，“老虚皇”与“元晨君”在原文中组成同一完整尊号。",
    confirmed: "本名紧接嵉皇道君而列，前后没有分隔成两位的标记。数据库因此采用一个身份页，同时保留完整原典字序。",
    caution: "“元晨君”可能在别处作为较短称呼出现，但目前没有足够材料确认。未来的别名匹配要同时比较阶位、上下文和传本，而不是只看尾部三字。",
    confidence: "原典明确列名"
  },
  {
    key: "sanyuan-siji-shangyuan-xuhuang-yuanling-jun",
    title: "三元四极上元虚皇元灵君",
    sourceNameForm: "三元四極上元虚皇元靈君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶右位神名，以三元、四极和上元构成长尊号，原典未附个人传记。",
    confirmed: "“三元四极”在本条中属于名号正文，不是编辑者添加的分类标签。把它完整保存，能避免搜索结果把这位元灵君与其他同尾尊号混在一起。",
    caution: "本页不把数字词直接解释成三官、四御或四方神。那些体系各有形成年代，需要关系证据才能与此名号相连。",
    confidence: "原典明确列名"
  },
  {
    key: "sanyuan-chenzhong-huangjing-xuhuang-yuantai-jun",
    title: "三元晨中黄景虚皇元台君",
    sourceNameForm: "三元晨中黄景虚皇元臺君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶右位所列元台君，名称中的“晨中黄景”保持原有连续次序。",
    confirmed: "现存名单没有为元台君另列字号、姓氏或居处。条目所能确定的是原名、第一阶、右位以及它与相邻神名的排序。",
    caution: "“黄景”与“中黄”类词汇可见于不同修炼和宇宙论语境，但不能据此拼出这位神的职掌。资料不足时留下空白，比写一段顺耳却无出处的神话更可靠。",
    confidence: "原典明确列名"
  },
  {
    key: "sanyuan-ziying-huishen-xusheng-zhuzhen-yuantai-jun",
    title: "三元紫映挥神虚生主真元胎君",
    sourceNameForm: "三元紫映揮神虚生主真元胎君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶右位的一条复合尊号，结尾作“主真元胎君”，不是现代整理者补写的职务。",
    confirmed: "这一名号在名单中独占一项。知识库不从“挥神”“虚生”“元胎”等词拆出多个角色，也不将它们转写成未经原典支持的技能。",
    caution: "长名在传抄中容易断句。当前先依现用底本作为一个整体，待校勘本或同经异文出现后，再决定是否需要调整断句。",
    confidence: "字形待校"
  },
  {
    key: "yuxuan-taihuang-jun",
    title: "玉玄太皇君",
    sourceNameForm: "玉玄太皇君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶右位中较短的神名，列于一组长尊号之后、上皇道君之前。",
    confirmed: "玉玄太皇君在原典中是一个独立条目，短名并不意味着位阶较低。页面以列表位置为依据，不以字数衡量神格高下。",
    caution: "“太皇君”可能与其他经书里的太皇、天皇称号相近，现阶段仍维持独立身份。只有出现相同阶位或明确互称，才会建立同神异号关系。",
    confidence: "原典明确列名"
  },
  {
    key: "shanghuang-daojun",
    title: "上皇道君",
    sourceNameForm: "上皇道君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "同神异号候选",
    summary: "第一阶右位的上皇道君，与同阶稍后出现的上皇天帝分别列名，暂不合并。",
    confirmed: "同一小段先列“上皇道君”，几项之后又列“上皇天帝”。编排方式至少说明现用底本把它们当作两个名位呈现。",
    caution: "两者可能是不同神、不同官号，也可能是传本中同一尊神的异称。没有旁证时，数据库保留两页并标记为同一性待考。",
    confidence: "同一性有争议"
  },
  {
    key: "yuhuang-daojun",
    title: "玉皇道君（第一阶名号）",
    sourceNameForm: "玉皇道君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "同神异号候选",
    summary: "《真灵位业图》第一阶右位的“玉皇道君”，不能仅凭近似名称直接并入宋以后玉皇上帝。",
    confirmed: "齐梁神谱中的玉皇道君是一个明确列出的名位。现有正文没有为他提供宋代玉皇上帝的统天职掌，也没有写出后世常见的完整帝号。",
    caution: "知识库保留一条“同一性有争议”关系供比较，但不会把两个页面做成别名跳转。这样既能检索名称延续，也不会用后世成熟神格覆盖早期名录。",
    confidence: "同一性有争议"
  },
  {
    key: "qingxuan-daojun",
    title: "清玄道君",
    sourceNameForm: "清玄道君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶右位神名，原典只给“清玄道君”四字，没有附加姓氏或宫府。",
    confirmed: "清玄道君夹在玉皇道君与上皇天帝之间。这个相对位置可以记录，却不能据此推导三者之间存在君臣、亲属或师承。",
    caution: "清玄也是道教常用语汇，搜索会出现同名道士、宫观和法号。后续消歧必须依完整出处，不把词汇共现当作人物关系。",
    confidence: "原典明确列名"
  },
  {
    key: "shanghuang-tiandi",
    title: "上皇天帝",
    sourceNameForm: "上皇天帝",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "同神异号候选",
    summary: "第一阶右位的天帝名号，与前列上皇道君名称相近但各占一项。",
    confirmed: "原典没有把“上皇道君”写作上皇天帝的别称，也没有用注语说明二者相同。当前最忠实的做法是保留两条记录和相邻位置。",
    caution: "若未来校本证明两名是重出，关系可以调整为异号；在证据到来之前，强行合页会让读者看不见原始名单的实际形态。",
    confidence: "同一性有争议"
  },
  {
    key: "yutian-taiyi-jun",
    title: "玉天太一君",
    sourceNameForm: "玉天太一君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "同神异号候选",
    summary: "第一阶右位的一位太一名号，和后文太一玉君分别列出，暂按两个神位管理。",
    confirmed: "玉天太一君先于太上虚皇道君等名号出现，数项之后又见太一玉君。两个名称都保留，是为了忠实反映文本没有主动合并它们。",
    caution: "“太一”横跨先秦祭祀、汉代国家祀典与中古道经，不能把所有同名对象做成一人。本页只负责《真灵位业图》第一阶这一名位。",
    confidence: "同一性有争议"
  },
  {
    key: "taishang-xuhuang-daojun",
    title: "太上虚皇道君",
    sourceNameForm: "太上虚皇道君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶右位所列道君，名称虽以“太上”起首，也不能据此等同太上老君。",
    confirmed: "原典完整写作太上虚皇道君，周围没有“老君”或“道德天尊”的说明。它在第一阶玉清境中的位置，也与后世三清太清位不同。",
    caution: "“太上”是广泛使用的尊称，并非太上老君的专有姓氏。数据库不会因两个字相同就制造同一身份。",
    confidence: "原典明确列名"
  },
  {
    key: "taishang-yuzhen-baohuang-daojun",
    title: "太上玉真保皇道君",
    sourceNameForm: "太上玉真保皇道君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "仅见名录",
    summary: "第一阶右位道君，完整尊号以“保皇”作核心区别，原典未列简称。",
    confirmed: "太上玉真保皇道君紧随太上虚皇道君。两条连续出现，反而提示“太上”只是共同尊号构件，不足以把它们视为同一位。",
    caution: "“保皇”不能直接现代化解释成护卫某位人间皇帝。这里先保留字面和座次，具体职掌需要其他道经佐证。",
    confidence: "原典明确列名"
  },
  {
    key: "xuanhuang-gaozhen",
    title: "玄皇高真",
    sourceNameForm: "玄皇高真",
    seatSide: "右位",
    identityType: "名录身份待考",
    recordNature: "仅见名录",
    summary: "第一阶右位的短名号，既没有“君”字，也没有人名，身份性质需要更多文本才能判断。",
    confirmed: "玄皇高真在现用底本中独立成项，位于太上玉真保皇道君与太一玉君之间。知识库把“高真”保留为名号的一部分。",
    caution: "它可能表示一位高阶真灵，也可能是省略后的尊称。未找到同名传记前，不填写性别、形象、修炼经历或人间时代。",
    confidence: "身份待考"
  },
  {
    key: "taiyi-yujun",
    title: "太一玉君",
    sourceNameForm: "太一玉君",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "同神异号候选",
    summary: "第一阶右位后段的太一名号，与前列玉天太一君名称相近而次序分开。",
    confirmed: "太一玉君在名单中是倒数第二项，原典并未用“又号”把它和玉天太一君连接。当前建立两个条目，另以争议关系提示读者比较。",
    caution: "只有名号相似，尚不足以确定同神异号。后续会检查《真灵位业图》其他阶位和相关灵宝、上清文献，再决定是否合并规范身份。",
    confidence: "同一性有争议"
  },
  {
    key: "gaoshang-yudi",
    title: "高上玉帝（第一阶名号）",
    sourceNameForm: "高上玉帝",
    seatSide: "右位",
    identityType: "神祇",
    recordNature: "同神异号候选",
    summary: "《真灵位业图》第一阶右位的末项，名称为“高上玉帝”，不直接覆盖后世玉皇上帝。",
    confirmed: "高上玉帝结束第一阶单列神名，随后原典用一段话概括玉清境与元始天尊的统摄关系。这个位置属于齐梁神谱自己的结构。",
    caution: "“玉帝”后来成为极具辨识度的称谓，但早期材料里的相近名号仍可能有不同来源。页面设置争议连接，避免读者误以为两者从来只有一个固定身份。",
    confidence: "同一性有争议"
  }
];

const groupRows = [
  {
    key: "yuqing-shangyuan-four-daojun",
    title: "玉清上元宫四道君（合称神位）",
    sourceNameForm: "玉清上元宫四道君",
    count: 4,
    summary: "第一阶所记四位合称神位，现行正文没有在此逐一写出四位道君的名字。",
    note: "这一项保存的是名录结构，不是四个已经识别的人物。后续若在别卷找到明确名单，也要先证明它确实解释本处“四道君”，再分别建页。"
  },
  {
    key: "yuqing-zhongyuan-ziqing-six-daojun",
    title: "玉清中元宫紫清六道君（合称神位）",
    sourceNameForm: "玉清中元宫紫清六道君",
    count: 6,
    summary: "第一阶所列紫清六道君合称，原典在这一行只报告人数和宫位。",
    note: "“六道君”不能成为六个自动编号的虚构角色。知识库先以集合页承载出处、人数和阶位，名字缺失的事实也属于文献信息。"
  },
  {
    key: "yuqing-xiayuan-gaoqing-four-yuanjun",
    title: "玉清下元宫高清四元君（合称神位）",
    sourceNameForm: "玉清下元宫高清四元君",
    count: 4,
    summary: "第一阶下元宫所列四元君合称，现有文本未提供四个可独立消歧的名号。",
    note: "这里的“元君”是名录称谓，不能据现代常见用法先判断性别或对应某四位女真。集合页会一直保留，直到版本证据足以拆分。"
  },
  {
    key: "yuqing-zhongsan-ten-jun",
    title: "玉清中散位十君（合称神位）",
    sourceNameForm: "玉清中散位一十君",
    count: 10,
    summary: "第一阶所列十位散位合称，原文写作“一十君”，没有逐名展开。",
    note: "“散位”说明它在编排中不同于随后明确标出的右位。页面记录十个席位，却不会拿十个占位符冒充十位已有名字的神灵。"
  }
];

const existingPositionRows = [
  {
    key: "yuanshi-tianzun",
    ref: "d:yuanshi-tianzun",
    title: "元始天尊",
    sourceNameForm: "上合虚皇道君應號元始天尊",
    seatSide: "中位"
  }
];

function renderFigureArticle(row) {
  return [
    `<p>${escapeHtml(row.summary)}</p>`,
    "<h2>原名与位置</h2>",
    `<p>现用底本写作“${escapeHtml(row.sourceNameForm)}”，列在《真灵位业图》第一阶玉清境的${escapeHtml(row.seatSide)}。规范页保留简体检索名，同时把原典字形单独存档。</p>`,
    "<h2>能够确认的事</h2>",
    `<p>${escapeHtml(row.confirmed)}</p>`,
    "<h2>仍须留白</h2>",
    `<p>${escapeHtml(row.caution)}</p>`,
    "<h2>资料边界</h2>",
    `<p>“${escapeHtml(row.title)}”页依据《洞玄灵宝真灵位业图》第一中位的列名与次序重新整理。原典没有写出的生平、法器、眷属和神职一律不补造；若用于故事创作，新增部分必须另列为 Worldcraft Codex 原创改编。</p>`
  ].join("");
}

function renderGroupArticle(row) {
  return [
    `<p>${escapeHtml(row.summary)}</p>`,
    "<h2>原典怎样书写</h2>",
    `<p>现用底本原名为“${escapeHtml(row.sourceNameForm)}”，位于第一阶右位名单之前，共报告 ${row.count} 个神位。</p>`,
    "<h2>为什么暂不拆分</h2>",
    `<p>${escapeHtml(row.note)}</p>`,
    "<h2>名录中的作用</h2>",
    `<p>“${escapeHtml(row.title)}”合称页让读者看见原典确实预留了多个席位，也让数量统计区分“可识别姓名”和“只知人数的神位”。它不会计入已消歧的独立神祇人数。</p>`,
    "<h2>资料边界</h2>",
    `<p>“${escapeHtml(row.sourceNameForm)}”的出处限定为《洞玄灵宝真灵位业图》第一中位。没有逐名证据前，不使用序号、方位或现代想象替这些席位命名。</p>`
  ].join("");
}

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: zhenlingEntityId(row.key, worldId),
    worldId,
    type: "character",
    title: row.title,
    slug: `mythology-zhenling-first-rank-${row.key}`,
    summary: row.summary,
    content: renderFigureArticle(row),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第一阶", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-1"),
    order,
    templateId: `template:${worldId}:mythology:zhenling-catalog-entry`,
    templateData: {
      canonicalName: row.title,
      sourceNameForm: row.sourceNameForm,
      tradition: "道教",
      identityType: row.identityType,
      pantheonSystem: "《洞玄灵宝真灵位业图》七阶神谱",
      rankPosition: "第一阶 · 玉清境",
      seatSide: row.seatSide,
      recordNature: row.recordNature,
      sourceLocation: "《洞玄灵宝真灵位业图》第一中位",
      historicalLayer: "魏晋六朝",
      normalizationStatus: "待更多原典消歧",
      confidence: row.confidence,
      editorialStatus: "初步消歧",
      originalAdaptation: "false"
    }
  };
}

function buildInstitutionEntity(row, order, worldId, now) {
  const isTier = row.key === "first-rank-yuqing";
  const content = isTier ? [
    "<p>《真灵位业图》以元始天尊为第一中位，随后列出若干单名神位、四组合称神位和右位诸神。本页保存这一层级本身，不把它误写成后世始终不变的道教天庭。</p>",
    "<h2>第一阶的构成</h2><p>现用底本可辨认二十九项记录：一项中位、二十四个其他单列名号和四项只写人数的合称神位。二十九是名录项目数，不等于二十九位都已有独立姓名。</p>",
    "<h2>编排说明</h2><p>篇末说明玉清境以元始天尊为主，并把其下道君写作受策命、号令群真的高位存在。这里反映的是齐梁神谱秩序，不能直接套用宋明宫观的固定三清四御排列。</p>",
    "<h2>计数口径</h2><p>人物统计只计算可以指向明确名号的独立身份；四组未逐名席位仍进入名录项目数，但不会被伪装成二十四位已经考定姓名的新神。</p>",
    "<h2>资料边界</h2><p>本页只归纳原典可见的名单结构。神名相似、尊号重复和合称缺名均保留为待考问题，后续以其他道经和校本建立有年代的关系。</p>"
  ].join("") : renderGroupArticle(row);
  return {
    id: zhenlingEntityId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-zhenling-first-rank-${row.key}`,
    summary: row.summary,
    content,
    tags: ["中国神话史", "道教神谱", "真灵位业图", isTier ? "七阶结构" : "合称神位", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-1"),
    order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "道教",
      institutionKind: isTier ? "神谱阶位" : "合称神位",
      hierarchyLevel: isTier ? "第一阶 · 玉清境" : `第一阶 · ${row.count} 个未逐名神位`,
      jurisdiction: isTier ? "保存第一阶中位、合称与右位的原始次序" : "名录席位集合；不代表已经识别出独立姓名",
      formationPeriod: "齐梁神谱整理层",
      earliestSource: "《洞玄灵宝真灵位业图》",
      sourceLocation: "第一中位",
      variants: isTier ? "现行整理依道藏本次序；异本字形与断句以后续校勘记录。" : `原典作“${row.sourceNameForm}”；未见逐名名单。`,
      confidence: "明确"
    }
  };
}

function buildSourceEntity(order, worldId, now) {
  return {
    id: zhenlingSourceId(worldId),
    worldId,
    type: "note",
    title: "《洞玄灵宝真灵位业图》",
    slug: "mythology-source-zhenling-weiye-tu",
    summary: "现存道藏本把真灵分为七阶，并保存大量神名、官号、仙真、历史人物神格与鬼官名位。",
    content: [
      "<p>《洞玄灵宝真灵位业图》是一份按阶位阅读的中古道教神谱。现本题陶弘景纂、闾丘方远校定，序文也坦言名爵、学号和任职彼此参杂，整理者未必能证实每一处对应。</p>",
      "<h2>怎样使用这份名录</h2><p>项目先照录原名和所在阶位，再判断它是独立神名、人名兼官号、历史人物神格、合称席位还是同神异号候选。原典只列名字时，页面不会补写顺滑却无出处的传记。</p>",
      "<h2>七阶并非永久定制</h2><p>这份排序反映齐梁前后的上清、灵宝与既有仙传材料怎样被重新安置。后世三清四御、雷部和地府体系继续变化，不能拿一张晚期神谱反过来改写本书。</p>",
      "<h2>版本与字形</h2><p>本批以《正统道藏》系统所见文本为内部底本，保留罕见字和长尊号。唐代校定层、其他传本与现代标点只用于校勘，不覆盖原始名号记录。</p>",
      "<h2>资料边界</h2><p>公开页只保存书名、篇内位置和版本说明，不嵌入外部网站。所有现代说明由 Worldcraft Codex 重新撰写，古籍事实与编辑判断分别陈述。</p>"
    ].join(""),
    tags: ["中国神话史", "道教原典", "神谱", "真灵位业图"],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "primary-sources"),
    order,
    templateId: `template:${worldId}:mythology:source-text`,
    templateData: {
      workTitle: "《洞玄灵宝真灵位业图》",
      workType: "道经",
      formationPeriod: "齐梁整理层，现本含唐代校定题记",
      edition: "《正统道藏》洞真部谱录类系统",
      volumeSection: "序、第一至第七中位",
      sourceLayer: "原文",
      rightsStatus: "古籍原文",
      internalCitation: "《洞玄灵宝真灵位业图》 · 第一中位 · 《正统道藏》洞真部谱录类",
      reviewStatus: "已核原文"
    }
  };
}

function resolveRef(reference, worldId) {
  const [scope, key] = reference.split(":");
  if (scope === "z") return zhenlingEntityId(key, worldId);
  if (scope === "zs") return zhenlingSourceId(worldId);
  if (scope === "d") return daoismEntityId(key, worldId);
  if (scope === "c") return celestialEntityId(key, worldId);
  throw new Error(`未知《真灵位业图》引用：${reference}`);
}

function buildRelation({
  key,
  sourceRef,
  targetRef,
  kind,
  label,
  direction = "directed",
  strength = 5,
  evidenceType = "primary-text",
  sourceCitation = "《洞玄灵宝真灵位业图》第一中位",
  historicalScope = "齐梁神谱整理层",
  confidence = "certain",
  notes
}, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:zhenling-first-rank:${key}`,
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

function positionRows() {
  return [
    ...existingPositionRows,
    ...figureRows.map((row) => ({ ...row, ref: `z:${row.key}` })),
    ...groupRows.map((row) => ({ ...row, ref: `z:${row.key}`, seatSide: "未注明" }))
  ];
}

function buildRelations(worldId, now) {
  const positions = positionRows();
  const sourceRelations = positions.map((row) => buildRelation({
    key: `source-position-${row.key}`,
    sourceRef: row.ref,
    targetRef: "zs:zhenling-weiye-tu",
    kind: "source",
    label: "第一阶列名出处",
    notes: `原典以“${row.sourceNameForm}”列入第一阶；本关系只证明名号与位置，不延伸出生平或后世职掌。`
  }, worldId, now));
  const membershipRelations = positions.map((row) => buildRelation({
    key: `rank-membership-${row.key}`,
    sourceRef: "z:first-rank-yuqing",
    targetRef: row.ref,
    kind: "contains",
    label: row.seatSide === "中位" ? "第一阶中位主神" : row.seatSide === "右位" ? "第一阶右位神名" : "第一阶名录项目",
    direction: "directed",
    strength: 5,
    notes: `按现用底本顺序收录“${row.sourceNameForm}”；阶位关系不等同于后世固定神职隶属。`
  }, worldId, now));
  return [
    ...sourceRelations,
    ...membershipRelations,
    buildRelation({
      key: "source-tier-first-rank",
      sourceRef: "z:first-rank-yuqing",
      targetRef: "zs:zhenling-weiye-tu",
      kind: "source",
      label: "七阶结构原典",
      notes: "第一阶结构与二十九项记录均以本书现存正文为依据。"
    }, worldId, now),
    buildRelation({
      key: "tao-hongjing-attributed-compiler",
      sourceRef: "zs:zhenling-weiye-tu",
      targetRef: "d:tao-hongjing",
      kind: "creator",
      label: "现本题为陶弘景纂",
      strength: 4,
      evidenceType: "primary-text",
      confidence: "probable",
      notes: "书首题署与序文保留陶弘景名；页面使用“现本题”表述，不把后世传本问题藏起来。"
    }, worldId, now),
    buildRelation({
      key: "yuhuang-daojun-jade-emperor-disputed",
      sourceRef: "z:yuhuang-daojun",
      targetRef: "c:jade-emperor",
      kind: "disputed",
      label: "与后世玉皇上帝同一性待考",
      strength: 2,
      evidenceType: "scholarly-inference",
      historicalScope: "齐梁名录与宋以后玉皇信仰比较层",
      confidence: "disputed",
      notes: "名称相近但职掌、帝号和文本年代不同；在缺少明确承继材料前保持两个身份。"
    }, worldId, now),
    buildRelation({
      key: "gaoshang-yudi-jade-emperor-disputed",
      sourceRef: "z:gaoshang-yudi",
      targetRef: "c:jade-emperor",
      kind: "disputed",
      label: "玉帝称号相近而不能直接合并",
      strength: 2,
      evidenceType: "scholarly-inference",
      historicalScope: "齐梁名录与宋以后玉皇信仰比较层",
      confidence: "disputed",
      notes: "本书第一阶的高上玉帝与后世玉皇上帝需要经过称号演变和科仪文献证明，不能只按简称合并。"
    }, worldId, now)
  ];
}

function buildTimelineEvents(worldId, now) {
  return [
    {
      id: `timeline-event:${worldId}:mythology:zhenling-first-rank:zhenling-compilation-layer`,
      worldId,
      entityId: zhenlingSourceId(worldId),
      questId: "",
      sceneId: "",
      references: [
        { kind: "entity", id: zhenlingSourceId(worldId) },
        { kind: "entity", id: daoismEntityId("tao-hongjing", worldId) }
      ],
      trackId: trackId("textual-evidence", worldId),
      title: "《真灵位业图》形成齐梁神谱整理层",
      summary: "现本题陶弘景纂，汇集并重新排列此前道经、仙传和历史人物神格；项目以约五世纪末至六世纪前半作为文本整理范围。",
      displayDate: "约五世纪末至六世纪前半",
      datePrecision: "range",
      sortOrder: 500,
      startValue: "499",
      endValue: "536",
      era: "齐梁神谱整理层",
      dependencyIds: [],
      updatedAt: now
    },
    {
      id: `timeline-event:${worldId}:mythology:zhenling-first-rank:seven-rank-order`,
      worldId,
      entityId: zhenlingEntityId("first-rank-yuqing", worldId),
      questId: "",
      sceneId: "",
      references: [
        { kind: "entity", id: zhenlingEntityId("first-rank-yuqing", worldId) },
        { kind: "entity", id: zhenlingSourceId(worldId) },
        { kind: "entity", id: daoismEntityId("sanqing-system", worldId) }
      ],
      trackId: trackId("religious-institutions", worldId),
      title: "七阶神谱把不同来源的真灵纳入位次",
      summary: "第一阶以元始天尊为中位，同时保留单列名号、合称席位和右位次序，显示中古道教开始用成体系的阶位整理庞杂神名。",
      displayDate: "约六世纪前半",
      datePrecision: "range",
      sortOrder: 510,
      startValue: "500",
      endValue: "536",
      era: "齐梁神谱编排层",
      dependencyIds: [],
      updatedAt: now
    }
  ];
}

function assertBatchShape() {
  if (figureRows.length !== 24) throw new Error(`${BATCH_LABEL}单列新身份应为 24，实际为 ${figureRows.length}`);
  if (groupRows.length !== 4) throw new Error(`${BATCH_LABEL}合称神位应为 4，实际为 ${groupRows.length}`);
  if (positionRows().length !== 29) throw new Error(`${BATCH_LABEL}原典项目应为 29，实际为 ${positionRows().length}`);
  if (new Set(positionRows().map((row) => row.sourceNameForm)).size !== 29) throw new Error(`${BATCH_LABEL}原典名号存在重复`);
}

function buildZhenlingFirstRankBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const figures = figureRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const tier = buildInstitutionEntity({
    key: "first-rank-yuqing",
    title: "《真灵位业图》第一阶（玉清境）",
    summary: "元始天尊所主的第一阶名录，共见二十九项记录，其中四项只保存合称与人数。"
  }, figures.length, worldId, now);
  const groups = groupRows.map((row, index) => buildInstitutionEntity(row, figures.length + 1 + index, worldId, now));
  const source = buildSourceEntity(figures.length + groups.length + 1, worldId, now);
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...figures, tier, ...groups, source],
    figures,
    institutions: [tier, ...groups],
    sources: [source],
    catalogPositions: positionRows(),
    relations: buildRelations(worldId, now),
    timelineEvents: buildTimelineEvents(worldId, now),
    featuredEntityIds: [
      tier.id,
      zhenlingEntityId("wuling-qiming-hunsheng-gaoshang-daojun", worldId),
      zhenlingEntityId("yuhuang-daojun", worldId),
      zhenlingEntityId("gaoshang-yudi", worldId)
    ]
  };
}

module.exports = {
  BATCH_KEY,
  BATCH_LABEL,
  buildZhenlingFirstRankBatch,
  zhenlingEntityId,
  zhenlingSourceId,
  trackId
};
