const { WORLD_ID, categoryId } = require("./chinese-mythology-history-data.cjs");
const { ancientEntityId } = require("./chinese-mythology-ancient-core-data.cjs");
const { natureEntityId } = require("./chinese-mythology-nature-pantheon-data.cjs");
const { civilizationEntityId } = require("./chinese-mythology-civilization-lineages-data.cjs");
const { daoismEntityId } = require("./chinese-mythology-daoism-early-data.cjs");
const { celestialEntityId } = require("./chinese-mythology-celestial-bureaucracy-data.cjs");
const { zhenlingSourceId, trackId } = require("./chinese-mythology-zhenling-first-rank-data.cjs");
const { zhenlingSecondEntityId } = require("./chinese-mythology-zhenling-second-rank-data.cjs");

const BATCH_KEY = "zhenling-weiye-fourth-rank-15";
const BATCH_LABEL = "道教神谱扩展 · 《真灵位业图》第四阶";

function zhenlingFourthEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:zhenling-weiye:fourth-rank:${key}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function f(key, title, sourceNameForm, identityType = "仙真", sourceNote = "", options = {}) {
  return {
    kind: "figure",
    key,
    title,
    sourceNameForm,
    identityType,
    sourceNote,
    recordNature: options.recordNature || (identityType === "历史人物神格" ? "官号兼人名" : identityType === "神官" ? "仅见名录" : "仅见名录"),
    existingRef: options.existingRef || "",
    identityNote: options.identityNote || "",
    confidence: options.confidence || "原典明确列名"
  };
}

const h = (key, title, sourceNameForm, sourceNote = "", options = {}) => f(key, title, sourceNameForm, "历史人物神格", sourceNote, options);
const j = (key, title, sourceNameForm, sourceNote = "", options = {}) => f(key, title, sourceNameForm, "神祇", sourceNote, options);
const o = (key, title, sourceNameForm, sourceNote = "", options = {}) => f(key, title, sourceNameForm, "神官", sourceNote, options);

function g(key, title, sourceNameForm, count, sourceNote = "") {
  return { kind: "group", key, title, sourceNameForm, count, sourceNote };
}

function withSection(rows, seatSide, section) {
  return rows.map((row, index) => ({ ...row, seatSide, section, sectionOrder: index + 1 }));
}

const mainRows = withSection([
  j("taishang-laojun-position", "太上老君", "太清太上老君", "原注称其为太清道主，下临万民。", { existingRef: "d:taishang-laojun", recordNature: "同神异号候选", identityNote: "完整尊号连接现有太上老君页，并保留第四阶主位语境。" }),
  j("shanghuang-taishang-wushang-dadaojun", "上皇太上无上大道君", "上皇太上無上大道君")
], "中位", "中位");

const leftRows = withSection([
  h("zhang-daoling-position", "张道陵", "正一眞人三天法師張", "原注记讳道陵。", { existingRef: "d:zhang-daoling", recordNature: "官号兼人名", identityNote: "讳名与正一真人、三天法师称号均指向现有张道陵页。" }),
  f("baishisheng", "白石生", "東華左仙卿白石生", "仙真", "名录保留完整人名白石生。", { recordNature: "官号兼人名" }),
  f("zhang-shumao", "张叔茂", "張叔茂", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  j("yuanshi-tianwang-fourth", "元始天王（第四阶名位）", "元始天王", "原注称其为西王母之师。", { recordNature: "同神异号候选", identityNote: "这一阶位和师承描述与后世元始天尊形象不能只按名字直接合并。", confidence: "同一性有争议" }),
  j("xuancheng-qingtian-shanghuang", "玄成青天上皇", "玄成青天上皇", "夹注把相邻三人称为太清尊位，并说不领兆民。"),
  j("nanshang-dadaojun", "南上大道君", "南上大道君"),
  j("taishang-zhangren", "太上丈人", "太上丈人"),
  j("tiandi-jun", "天帝君", "天帝君"),
  j("jiulao-xiandu-jun", "九老仙都君", "九老仙都君"),
  j("jiuqi-zhangren", "九气丈人", "九氣丈人", "夹注将相邻名位归入太清三天东宫真官，并关联章奏关启。"),
  f("gaoqiuzi", "高丘子", "中嶽眞人髙丘子", "仙真", "原行与景云真人合列。", { recordNature: "官号兼人名", confidence: "字形待校" }),
  f("jingyun-zhenren", "景云真人", "景雲眞人"),
  h("guigu-xiansheng", "鬼谷先生", "鬼谷先生", "原典以通行称号列入太清左位。", { recordNature: "单列人名" }),
  j("taiqing-wang", "泰清王", "泰清王"),
  o("jiutian-langli", "九天郎吏", "九天郎吏"),
  g("beidou-zhifu-seven", "北斗直符七人（合称神位）", "北斗直符七人", 7, "原典报告七人，没有在本处逐名。"),
  o("dingqi-zhenren", "定气真人", "定氣眞人"),
  o("jianxian-zhenren", "监仙真人", "監仙眞人"),
  f("wuxian-furen", "五仙夫人", "五仙夫人", "仙真", "本行与郭内夫人分列为两个名号，不按“五位夫人”拆分。"),
  f("guonei-furen", "郭内夫人", "郭内夫人", "仙真", "原典只给出郭氏称呼。", { recordNature: "官号兼人名" }),
  g("twenty-four-guanjun", "二十四官君将吏（合称神位）", "二十四官君將吏", 24, "与下一项同被夹注称为气化结成，没有逐名。"),
  g("twelve-hundred-guanjun", "一千二百官君将吏（合称神位）", "千二百官君將吏", 1200, "与上一项同被夹注称为气化结成，没有逐名。"),
  f("zhao-boxuan", "赵伯玄", "趙伯玄", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("liu-zixian", "刘子先", "劉子先", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("zang-yanfu", "臧延甫", "臧延甫", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  h("zhang-liang", "张良（张子房）", "張子房", "名录以字子房列入太清左位。", { recordNature: "单列人名" }),
  f("ning-zhongjun", "宁仲君", "甯仲君", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  h("yan-zhaowang", "燕昭王", "燕昭王", "原典以历史王号列入太清左位。", { recordNature: "单列人名" }),
  f("mao-chucheng", "茅初成", "茅初成", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("qianshou", "千寿", "少室山伯北臺郎千壽", "仙真", "名录保留千寿名与少室山伯、北台郎称号。", { recordNature: "官号兼人名" }),
  f("chisongzi-position", "赤松子", "赤松子", "仙真", "第四阶再次以短名列出赤松子。", { existingRef: "z2:chisongzi", recordNature: "单列人名", identityNote: "连接第二阶已建立的赤松子页，保留跨阶重复位置。" }),
  f("wei-xianren", "魏显仁", "大梁眞人魏顯仁", "仙真", "名录保留完整人名魏显仁。", { recordNature: "官号兼人名" }),
  f("qin-shuyin", "秦叔隐", "華山仙伯秦叔隱", "仙真", "名录保留完整人名秦叔隐。", { recordNature: "官号兼人名" }),
  f("zhou-jitong", "周季通", "葛衍眞人周季通", "仙真", "名录保留完整人名周季通。", { recordNature: "官号兼人名" }),
  f("shan-shiyuan", "山世远", "太和眞人山世逺", "仙真", "名录保留完整人名山世远。", { recordNature: "官号兼人名", confidence: "字形待校" }),
  f("mao-gu", "茅固", "句曲眞人定録右禁師茅君", "历史人物神格", "原注记讳固、字季伟，并称为地真。", { recordNature: "官号兼人名" }),
  f("wang-daoning", "王道宁", "磻冡眞人右禁郎王道寧", "仙真", "名录保留完整人名王道宁。", { recordNature: "官号兼人名" }),
  f("li-baozu", "李抱祖", "太清右公李抱祖", "仙真", "名录保留完整人名李抱祖。", { recordNature: "官号兼人名" }),
  f("song-chensheng", "宋晨生", "蓬萊左公宋晨生", "仙真", "名录保留完整人名宋晨生。", { recordNature: "官号兼人名" }),
  f("jia-baoan", "贾保安", "蓬萊右公賈保安", "仙真", "名录保留完整人名贾保安。", { recordNature: "官号兼人名" }),
  f("zhao-zuyang", "赵祖阳", "潜山眞伯趙祖陽", "仙真", "名录保留完整人名赵祖阳。", { recordNature: "官号兼人名" }),
  f("zhang-shanggui", "张上贵", "九疑仙侯張上貴", "仙真", "名录保留完整人名张上贵。", { recordNature: "官号兼人名" }),
  f("jiang-shumao", "姜叔茂", "蓬萊左卿姜叔茂", "仙真", "名录保留完整人名姜叔茂。", { recordNature: "官号兼人名" }),
  f("zhou-dabin", "周大宾", "周大賔", "仙真", "原典以短名独立列出。", { recordNature: "单列人名", confidence: "字形待校" }),
  f("mao-bodao", "毛伯道", "毛伯道", "仙真", "夹注称其与刘道恭二人在王屋山得道。", { recordNature: "单列人名" }),
  f("liu-daogong", "刘道恭", "劉道恭", "仙真", "夹注称其与毛伯道二人在王屋山得道。", { recordNature: "单列人名" }),
  h("dongfang-shuo", "东方朔", "東方朔", "原典以历史人物姓名列入太清左位。", { recordNature: "单列人名" }),
  f("ma-mingsheng", "马明生", "馬明生", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  h("peng-keng", "彭铿", "彭鏗", "夹注称其西入流沙。", { recordNature: "单列人名" }),
  f("feng-gang", "凤纲", "鳳綱", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("han-zhong", "韩终", "韓終", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  h("mozi", "墨子（墨翟）", "墨翟", "夹注称“宋大水解”，语义与断句仍待校。", { recordNature: "单列人名", confidence: "身份待考" }),
  f("yue-zichang", "乐子长", "樂子長", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("li-ming", "李明", "李明", "仙真", "夹注称其“雷平合丹”。", { recordNature: "单列人名" }),
  g("shangxi-four-hao", "商西四皓（合称神位）", "商西四皓", 4, "原典只用合称列入本阶，没有在本处逐名。"),
  g("huainan-eight-gong", "淮南八公（合称神位）", "淮南八公", 8, "原典只用合称列入本阶，没有在本处逐名。"),
  f("qingwu-gong", "青乌公", "青烏公", "仙真"),
  f("huangshan-jun", "黄山君", "黄山君", "仙真"),
  f("ning-feng", "宁封", "甯封", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("fang-ming", "方明", "方明", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  h("limu-position", "力牧", "力牧", "第四阶以短名列入力牧。", { existingRef: "c:limu", recordNature: "单列人名", identityNote: "连接现有黄帝臣属力牧页，神谱收录作为中古接受层。" }),
  f("chang-yu", "昌宇", "昌宇", "历史人物神格", "夹注称其与庄伯微为汉时人。", { recordNature: "单列人名" }),
  f("zhuang-bowei", "庄伯微", "莊伯微", "历史人物神格", "夹注称其与昌宇为汉时人。", { recordNature: "单列人名" })
], "左位", "左位");

const rightRows = withSection([
  f("zhao-chezi", "赵车子", "太清仙王趙車子", "仙真", "名录保留完整人名赵车子。", { recordNature: "官号兼人名" }),
  f("li-yuanrong", "李元容", "太清仙王李元容", "仙真", "名录保留完整人名李元容。", { recordNature: "官号兼人名" }),
  f("deng-lizi", "邓离子", "小有仙王鄧離子", "仙真", "名录保留完整人名邓离子。", { recordNature: "官号兼人名" }),
  f("ximen-shudu", "西门叔度", "五嶽司西門叔度", "神官", "名录保留完整人名西门叔度。", { recordNature: "官号兼人名" }),
  f("song-dexuan", "宋德玄", "中央眞人宋德玄", "仙真", "名录保留完整人名宋德玄。", { recordNature: "官号兼人名" }),
  f("yanmenzi", "衍门子", "中嶽仙卿衍門子", "仙真"),
  f("meng-zizhuo", "孟子卓", "中嶽眞人孟子卓", "仙真", "名录保留完整人名孟子卓。", { recordNature: "官号兼人名" }),
  f("feng-yanshou", "冯延寿", "西嶽眞人馮延壽", "仙真", "名录保留完整人名冯延寿。", { recordNature: "官号兼人名" }),
  f("fu-xiansheng", "傅先生", "南嶽眞人傅先生", "仙真", "原典只保留傅氏称呼。", { recordNature: "官号兼人名", confidence: "身份待考" }),
  f("hongya-xiansheng", "洪崖先生", "青城眞人洪崖先生", "仙真"),
  f("han-weiyuan", "韩伟远", "九疑眞人韓偉逺", "仙真", "名录保留完整人名韩伟远。", { recordNature: "官号兼人名", confidence: "字形待校" }),
  f("yin-youzong", "阴友宗", "岷山眞人隂友宗", "仙真", "名录保留完整人名阴友宗。", { recordNature: "官号兼人名", confidence: "字形待校" }),
  g("zitai-four-zhenren", "紫台四真人（合称神位）", "司命太元定録紫臺四眞人", 4, "原典报告四真人，没有在本处逐名。"),
  f("wang-zhongfu", "王仲甫", "中嶽眞人王仲甫", "仙真", "名录保留完整人名王仲甫。", { recordNature: "官号兼人名" }),
  j("beiling-zhangren", "北陵丈人", "北陵丈人"),
  j("taixuan-zhangren", "太玄丈人", "太玄丈人"),
  j("beishang-zhangren", "北上丈人", "北上丈人"),
  j("nanshang-zhangren", "南上丈人", "南上丈人"),
  j("taiqi-zhangren", "太气丈人", "太氣丈人"),
  j("yiming-zhangren", "益命丈人", "益命丈人"),
  j("feizhen-zhangren", "飞真丈人", "飛眞丈人"),
  j("jiudao-zhangren", "九道丈人", "九道丈人"),
  j("shian-zhangren", "示安丈人", "示安丈人"),
  j("baifu-zhangren", "百福丈人", "百福丈人"),
  j("baiqian-shenqi-zhangren", "百千神气丈人", "百千神氣丈人"),
  g("dengtian-shanglu-four-yunv", "登天上箓玉女四人（合称神位）", "登天上籙玉女四人", 4, "十五玉女号之一，原典只报告四人。"),
  g("shangtian-three-yunv", "上天玉女三人（合称神位）", "上天玉女三人", 3, "十五玉女号之一，原典只报告三人。"),
  g("santian-hundred-yunv", "三天玉女百人（合称神位）", "三天玉女百人", 100, "十五玉女号之一，原典只报告百人。"),
  g("qingyao-ten-yunv", "青腰玉女官十人（合称神位）", "青腰玉女官十人", 10, "十五玉女号之一，原典只报告十人。"),
  o("xiadeng-yunv", "下等玉女", "下等玉女"),
  o("beigong-yunv", "北宫玉女", "北宫玉女"),
  o("wudi-yunv", "五帝玉女", "五帝玉女"),
  o("taisu-yunv", "太素玉女", "太素玉女"),
  o("tiansu-yunv", "天素玉女", "天素玉女"),
  o("baisu-yunv", "白素玉女", "白素玉女"),
  o("pingtian-yunv", "平天玉女", "平天玉女"),
  o("liuwu-yunv", "六戊玉女", "六戊玉女"),
  o("qingtian-yiming-yunv", "青天益命玉女", "青天益命玉女"),
  o("shendan-yunv", "神丹玉女", "神丹玉女"),
  o("wuliu-yunv", "五流玉女", "五流玉女"),
  o("gaoshang-jiangjun", "高上将军", "髙上將軍", "夹注称其与随后三位皆有姓名、各领天兵十万，合号四将军；姓名未录。", { confidence: "字形待校" }),
  o("hengshan-shizhe", "衡山使者", "衡山使者", "夹注称其属于四将军之一，但姓名未录。"),
  o("shangtian-lishi", "上天力士", "上天力士", "夹注称其属于四将军之一，但姓名未录。"),
  o("tianding-lishi", "天丁力士", "天丁力士", "夹注称其属于四将军之一，但姓名未录。"),
  o("feitian-shizhe", "飞天使者", "飛天使者"),
  o("jiutian-shizhe", "九天使者", "九天使者"),
  o("jiutian-zhenwang-shizhe", "九天真王使者", "九天眞王使者"),
  o("gaoxian-qitian-shizhe", "高仙启天使者", "髙仙啓天使者", "", { confidence: "字形待校" }),
  o("youtian-shizhe", "游天使者", "游天使者"),
  o("taiqing-shizhe", "太清使者", "太清使者"),
  o("liuyi-shizhe", "六乙使者", "六乙使者"),
  o("liubing-shizhe", "六丙使者", "六丙使者"),
  o("liuding-shizhe", "六丁使者", "六丁使者"),
  o("liuren-shizhe", "六壬使者", "六壬使者"),
  o("liugui-shizhe", "六癸使者", "六癸使者"),
  j("dongfang-lingweiyang", "东方灵威仰", "東方靈威仰", "夹注把五方名号合称太清五帝、自然之神。"),
  j("nanfang-chibiaonu", "南方赤熛弩", "南方赤熛弩", "夹注把五方名号合称太清五帝、自然之神。"),
  j("xifang-yaopobao", "西方曜魄宝", "西方曜魄寳", "夹注把五方名号合称太清五帝、自然之神。"),
  j("beifang-yinhouju", "北方隐侯局", "北方隱侯局", "夹注把五方名号合称太清五帝、自然之神。"),
  j("zhongyang-hanshuniu", "中央含枢纽", "中央含樞紐", "夹注把五方名号合称太清五帝、自然之神。"),
  g("wuyue-jun", "五岳君（轮替合称神位）", "五嶽君", 5, "夹注称五百年一替，显示这是可更替的名位集合。"),
  j("hehou", "河侯", "河侯", "夹注把五岳君、河侯、河伯三条称为得道人所补。", { recordNature: "同神异号候选", confidence: "同一性有争议" }),
  j("hebo-position", "河伯", "河伯", "夹注把五岳君、河侯、河伯三条称为得道人所补。", { existingRef: "n:hebo", recordNature: "同神异号候选", identityNote: "连接现有河伯页，并保留第四阶对其来源的特殊说明。" }),
  j("xiyue-zhangren", "西岳丈人", "西嶽丈人"),
  o("santian-yutong", "三天玉童", "三天玉童", "夹注称相邻三条也是学道人所补。"),
  j("luoshui-shennv", "洛水神女", "洛水神女", "夹注称相邻三条也是学道人所补；不直接等同后世某一洛神形象。", { confidence: "身份待考" }),
  j("feitian-zhangren", "飞天丈人", "飛天丈人"),
  j("taiyi-zhonghuang", "太一中黄", "太一中黄"),
  o("xuanshang-yutong", "玄上玉童", "玄上玉童"),
  j("mengshou-xiansheng", "猛兽先生", "猛獸先生", "夹注称其为自然之神，主天下鬼神禽兽。"),
  f("zhao-shengqi", "赵昇期", "趙昇期", "仙真", "夹注称其在王屋山。", { recordNature: "单列人名" }),
  f("yin-changsheng", "阴长生", "隂長生", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名", confidence: "字形待校" }),
  f("liu-weidao", "刘伟道", "劉偉道", "历史人物神格", "夹注称其为汉时人。", { recordNature: "单列人名" }),
  f("guo-chongzi", "郭崇子", "郭崇子", "历史人物神格", "夹注称其为殷人。", { recordNature: "单列人名" }),
  f("guo-shengzi", "郭声子", "郭聲子", "仙真", "夹注称其在洛市中卜。", { recordNature: "单列人名" }),
  f("zhou-jun", "周君（第四阶名位）", "周君", "名录身份待考", "短名不足以确认与其他阶位周君同一。", { recordNature: "同神异号候选", confidence: "同一性有争议" }),
  f("xu-jidao", "徐季道", "徐季道", "仙真", "夹注记鹄鸣山。", { recordNature: "单列人名" }),
  f("lupi-gong", "鹿皮公", "鹿皮公", "仙真"),
  f("qiu-jizi", "仇季子", "仇季子", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  o("silu-jun", "司录君", "司録君"),
  f("zhang-jijun", "张巨君", "張巨君", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("guo-shaoyao", "郭芍药", "郭芍藥", "仙真", "夹注称其与赵爱儿、王鲁连三人为女真。", { recordNature: "单列人名" }),
  f("zhao-aier", "赵爱儿", "趙愛兒", "仙真", "夹注称其与郭芍药、王鲁连三人为女真。", { recordNature: "单列人名" }),
  f("wang-lulian", "王鲁连", "王魯連", "仙真", "夹注称其与郭芍药、赵爱儿三人为女真。", { recordNature: "单列人名" }),
  o("jiuku-zhenren-jungui", "救苦真人君轨", "救苦眞人君軌"),
  o("siwei", "司危", "司危"),
  o("sie", "司厄", "司厄"),
  o("siming-fourth", "司命（第四阶名位）", "司命", "短名不足以与楚辞司命、南斗司命或灶神司命合并。", { recordNature: "同神异号候选", confidence: "同一性有争议" }),
  o("bawei", "八威", "八威"),
  o("chufu", "除福", "除福"),
  f("bo-he", "帛和", "帛和", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("hua-ziqi", "华子期", "華子期", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("bao-cha", "鲍察", "鮑察", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  h("luan-ba", "栾巴", "欒巴", "原典以历史仙传人物姓名列出。", { recordNature: "单列人名" }),
  h("ge-hong-position", "葛洪", "葛洪", "夹注称其隐罗浮山。", { existingRef: "d:ge-hong", recordNature: "单列人名", identityNote: "连接现有葛洪页，并以关系保存第四阶的罗浮山注记。" }),
  j("zuodong-wushang-wang", "左东无上王", "左東无上王"),
  j("sitian-guanwang", "四天官王", "四天官王"),
  j("changming-tianwang", "昌命天王", "昌命天王"),
  j("zuoming-junwang", "佐命君王", "佐命君王"),
  j("feizhen-huwang", "飞真虎王", "飛眞虎王"),
  j("jiudu-qusi-wang", "九都去死王", "九都去死王"),
  j("sihai-yinwang", "四海阴王", "四海隂王", "", { confidence: "字形待校" }),
  j("taiyi-yuanjun", "太一元君", "太一元君"),
  j("shangxu-jun", "上虚君", "上虚君"),
  j("mobing-shangyuan-jun", "摩病上元君", "摩病上元君"),
  j("qixing-yaoguang-jun", "七星瑶光君", "七星瑶光君", "名称与后世北斗摇光星君相近，但本条先按第四阶原名独立保存。", { recordNature: "同神异号候选", confidence: "同一性有争议" }),
  j("sanyuan-wanfu-jun", "三元万福君", "三元萬福君"),
  f("yeguang-furen", "夜光夫人", "夜光夫人", "仙真"),
  f("heshi-furen", "和适夫人", "和適夫人", "仙真")
], "右位", "右位");

const positionRows = [...mainRows, ...leftRows, ...rightRows];

const headingRows = [
  {
    key: "fifteen-yunv-titles",
    title: "第四阶十五玉女号",
    sourceNameForm: "右十五玉女號",
    summary: "第四阶右位把四组合称玉女与十一项单列玉女名号合计为十五号。",
    memberKeys: ["dengtian-shanglu-four-yunv", "shangtian-three-yunv", "santian-hundred-yunv", "qingyao-ten-yunv", "xiadeng-yunv", "beigong-yunv", "wudi-yunv", "taisu-yunv", "tiansu-yunv", "baisu-yunv", "pingtian-yunv", "liuwu-yunv", "qingtian-yiming-yunv", "shendan-yunv", "wuliu-yunv"]
  },
  {
    key: "four-generals",
    title: "第四阶四将军",
    sourceNameForm: "四將軍",
    summary: "夹注把高上将军、衡山使者、上天力士与天丁力士合称四将军，并说各有姓名、各领天兵十万。",
    memberKeys: ["gaoshang-jiangjun", "hengshan-shizhe", "shangtian-lishi", "tianding-lishi"]
  },
  {
    key: "fifteen-emissaries",
    title: "第四阶十五使者自然神",
    sourceNameForm: "右十五使者自然之神",
    summary: "第四阶右位把四将军与其后十一项使者、力士名号合计为十五项自然神名位。",
    memberKeys: ["gaoshang-jiangjun", "hengshan-shizhe", "shangtian-lishi", "tianding-lishi", "feitian-shizhe", "jiutian-shizhe", "jiutian-zhenwang-shizhe", "gaoxian-qitian-shizhe", "youtian-shizhe", "taiqing-shizhe", "liuyi-shizhe", "liubing-shizhe", "liuding-shizhe", "liuren-shizhe", "liugui-shizhe"]
  },
  {
    key: "taiqing-five-emperors",
    title: "第四阶太清五帝",
    sourceNameForm: "此太清五帝，自然之神",
    summary: "夹注把灵威仰、赤熛弩、曜魄宝、隐侯局与含枢纽合称太清五帝。",
    memberKeys: ["dongfang-lingweiyang", "nanfang-chibiaonu", "xifang-yaopobao", "beifang-yinhouju", "zhongyang-hanshuniu"]
  },
  {
    key: "three-female-immortals",
    title: "第四阶三位女真",
    sourceNameForm: "此三人，女眞",
    summary: "夹注明确把郭芍药、赵爱儿和王鲁连三人归为女真。",
    memberKeys: ["guo-shaoyao", "zhao-aier", "wang-lulian"]
  }
];

const locationRows = [
  {
    key: "wangwu-mountain",
    title: "王屋山（第四阶修真地）",
    sourceNameForm: "王屋山",
    summary: "第四阶夹注两次提到王屋山：毛伯道与刘道恭在此得道，赵昇期也被记作在王屋山。"
  }
];

function summaryFor(row) {
  if (row.kind === "group") return `${row.title}是《真灵位业图》第四阶${row.section}第 ${row.sectionOrder} 项，只保存 ${row.count} 个席位的合称。${row.sourceNote}`;
  if (row.sourceNote) return `${row.title}列于《真灵位业图》第四阶${row.section}第 ${row.sectionOrder} 项。${row.sourceNote}`;
  return `${row.title}列于《真灵位业图》第四阶${row.section}第 ${row.sectionOrder} 项；原行只给出名号和位置，没有足够材料补写完整传记。`;
}

function renderFigureArticle(row) {
  const clue = row.sourceNote || `本行没有附传、籍贯或师承。能够确认的是“${row.sourceNameForm}”这个完整字串，以及它在第四阶${row.section}中的次序。`;
  const identity = row.identityNote || (row.recordNature === "官号兼人名"
    ? `页面同时保存姓名与名位，却不假定${row.title}在所有时代都使用同一官号。`
    : row.recordNature === "单列人名"
      ? `${row.title}可以独立检索，短名本身不能推出籍贯、年代、师承或法器。`
      : `名号中的方位、宫域和职掌先按原文保留，不用晚期天庭结构替${row.title}补齐生平。`);
  return [
    `<p>${escapeHtml(summaryFor(row))}</p>`,
    "<h2>原名与位次</h2>",
    `<p>现用底本写作“${escapeHtml(row.sourceNameForm)}”，位于第四中位${escapeHtml(row.section)}第 ${row.sectionOrder} 项。编号只还原本段顺序，不换算成后世恒定品级。</p>`,
    "<h2>原典线索</h2>",
    `<p>${escapeHtml(clue)}</p>`,
    "<h2>身份处理</h2>",
    `<p>${escapeHtml(identity)}</p>`,
    "<h2>创作边界</h2>",
    `<p>若作者为“${escapeHtml(row.title)}”续写形象、性格、法术或事件，新增部分必须标为 Worldcraft Codex 原创改编。名录中的一行不能替代一篇古传。</p>`
  ].join("");
}

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: zhenlingFourthEntityId(row.key, worldId),
    worldId,
    type: "character",
    title: row.title,
    slug: `mythology-zhenling-fourth-rank-${row.key}`,
    summary: summaryFor(row),
    content: renderFigureArticle(row),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第四阶", row.section, row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-4"),
    order,
    templateId: `template:${worldId}:mythology:zhenling-catalog-entry`,
    templateData: {
      canonicalName: row.title,
      sourceNameForm: row.sourceNameForm,
      tradition: "道教",
      identityType: row.identityType,
      pantheonSystem: "《洞玄灵宝真灵位业图》七阶神谱",
      rankPosition: "第四阶 · 太清境",
      seatSide: row.seatSide,
      recordNature: row.recordNature,
      sourceLocation: `《洞玄灵宝真灵位业图》第四中位 · ${row.section}`,
      historicalLayer: "魏晋六朝",
      normalizationStatus: row.identityNote ? "独立建页" : "待更多原典消歧",
      confidence: row.confidence,
      editorialStatus: "初步消歧",
      originalAdaptation: "false"
    }
  };
}

function renderInstitutionArticle(row, isTier, isHeading) {
  if (isTier) {
    return [
      "<p>第四中位以太清太上老君为主，左位保存天师、仙真和大量历史人物，右位则展开丈人、玉女、使者、五方自然神与职能神。它是七阶中规模最大的层次之一。</p>",
      "<h2>名录规模</h2><p>正文拆出一百七十四个项目，其中十一项只写人数或合称。六个名位连接现有身份，其余可辨人物与神名独立建页。</p>",
      "<h2>集合与分组</h2><p>七真人、二十四官君、一千二百官君、四皓、八公、玉女多人组和五岳君不生成无名占位人。十五玉女号、四将军、十五使者、太清五帝和三位女真另建结构页。</p>",
      "<h2>多种来源</h2><p>本阶同时吸收张道陵、张良、东方朔、墨翟、葛洪等历史人物，以及河伯、五方帝号和众多自然神名位。页面只增加中古神谱层，不覆盖他们更早的材料。</p>",
      "<h2>阅读边界</h2><p>“气化结成”“五百年一替”“各领天兵十万”等夹注按原文保存，不被扩写成完整天庭行政手册。缺名之处继续留白。</p>"
    ].join("");
  }
  if (isHeading) {
    return [
      `<p>${escapeHtml(row.summary)}</p>`,
      "<h2>原典位置</h2>",
      `<p>“${escapeHtml(row.sourceNameForm)}”是第四中位右位的总结或夹注，不是一位同名神。页面以结构分组保存这句话。</p>`,
      "<h2>成员范围</h2>",
      `<p>“${escapeHtml(row.title)}”连接 ${row.memberKeys.length} 个原文名位。成员仍各自保留原名、次序和身份性质，分组页不替代人物页。</p>`,
      "<h2>统计方式</h2>",
      `<p>“${escapeHtml(row.title)}”计作一条名录结构记录，不计入独立人物数；成员中写有人数的合称也不会自动拆成占位角色。</p>`,
      "<h2>创作边界</h2>",
      `<p>“${escapeHtml(row.title)}”只说明原典怎样把名位放在一起。任何组织日常、军制细节和成员故事都须标注 Worldcraft Codex 原创改编。</p>`
    ].join("");
  }
  return [
    `<p>${escapeHtml(summaryFor(row))}</p>`,
    "<h2>原典写法</h2>",
    `<p>现用底本在第四中位${escapeHtml(row.section)}写作“${escapeHtml(row.sourceNameForm)}”，报告 ${row.count} 个席位，没有在本处逐一给名。</p>`,
    "<h2>为何不拆人</h2>",
    `<p>${escapeHtml(row.sourceNote)} 只有人数或合称时，知识库保留集合页而不编造姓名。</p>`,
    "<h2>统计方式</h2>",
    `<p>“${escapeHtml(row.sourceNameForm)}”计作一条名录项目，但不计入已识别人物数。以后若发现相似名单，仍须先证明它解释本处合称。</p>`,
    "<h2>创作边界</h2>",
    `<p>作者可以为“${escapeHtml(row.sourceNameForm)}”设计成员，但新增姓名、形象与经历必须标注 Worldcraft Codex 原创改编。</p>`
  ].join("");
}

function buildInstitutionEntity(row, order, worldId, now, mode = "group") {
  const isTier = mode === "tier";
  const isHeading = mode === "heading";
  return {
    id: zhenlingFourthEntityId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-zhenling-fourth-rank-${row.key}`,
    summary: row.summary || summaryFor(row),
    content: renderInstitutionArticle(row, isTier, isHeading),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第四阶", isTier ? "七阶结构" : isHeading ? "名录分组" : "合称神位", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-4"),
    order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "道教",
      institutionKind: isTier ? "神谱阶位" : isHeading ? "神谱名录分组" : "合称神位",
      hierarchyLevel: isTier ? "第四阶 · 太清境" : isHeading ? "第四阶 · 右位结构" : `第四阶 · ${row.section} · ${row.count} 个未逐名神位`,
      jurisdiction: isTier ? "保存中位、左右位、集合席位和结构注记的原始次序" : isHeading ? `连接原典归入“${row.sourceNameForm}”的名位` : "名录席位集合；不代表已经识别出独立姓名",
      formationPeriod: "齐梁神谱整理层",
      earliestSource: "《洞玄灵宝真灵位业图》",
      sourceLocation: isTier ? "第四中位" : `第四中位 · ${row.section || "右位"}`,
      variants: isTier ? "按现用道藏本文字分段；正文与夹注分别记录。" : `原典作“${row.sourceNameForm}”。`,
      confidence: "明确"
    }
  };
}

function renderLocationArticle(row) {
  return [
    `<p>${escapeHtml(row.summary)}</p>`,
    "<h2>原典线索</h2>",
    `<p>现用底本两处写到“${escapeHtml(row.sourceNameForm)}”，均在第四中位人物夹注中。页面由重复地点线索建立，不把山中故事扩写成原典正文。</p>`,
    "<h2>地理性质</h2>",
    "<p>王屋山既是现实山岳，也进入道教仙传。当前页面保存第四阶修真地这一用法；具体活动地点不生成伪精确坐标。</p>",
    "<h2>关联人物</h2>",
    "<p>毛伯道、刘道恭与赵昇期通过有出处的地点关系连到本页。三人的经历仍以各自夹注为限。</p>",
    "<h2>创作边界</h2>",
    "<p>洞府布局、道路、守山者与事件若由项目补写，必须标注 Worldcraft Codex 原创改编。</p>"
  ].join("");
}

function buildLocationEntity(row, order, worldId, now) {
  return {
    id: zhenlingFourthEntityId(row.key, worldId),
    worldId,
    type: "location",
    title: row.title,
    slug: `mythology-zhenling-fourth-rank-${row.key}`,
    summary: row.summary,
    content: renderLocationArticle(row),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第四阶", "修真地理", "王屋山"],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-4"),
    order,
    templateId: `template:${worldId}:mythology:sacred-geography`,
    templateData: {
      spaceKind: "历史地点",
      tradition: "道教",
      historicalPeriod: "齐梁神谱整理层",
      sourceTitle: "《洞玄灵宝真灵位业图》",
      sourceLocation: "第四中位 · 毛伯道、刘道恭与赵昇期夹注",
      modernCorrespondence: "可对应传统王屋山名区，但本项目不以夹注生成精确洞府坐标。",
      confidence: "大致区域",
      mapCaution: "现实山岳与仙传空间分层展示，创作地图不自动等同现代经纬度。"
    }
  };
}

function resolveRowRef(row) {
  return row.existingRef || `z4:${row.key}`;
}

function resolveRef(reference, worldId) {
  const [scope, key] = reference.split(":");
  if (scope === "z4") return zhenlingFourthEntityId(key, worldId);
  if (scope === "z2") return zhenlingSecondEntityId(key, worldId);
  if (scope === "zs") return zhenlingSourceId(worldId);
  if (scope === "a") return ancientEntityId(key, worldId);
  if (scope === "n") return natureEntityId(key, worldId);
  if (scope === "c") return civilizationEntityId(key, worldId);
  if (scope === "d") return daoismEntityId(key, worldId);
  if (scope === "cb") return celestialEntityId(key, worldId);
  throw new Error(`未知《真灵位业图》第四阶引用：${reference}`);
}

function buildRelation({ key, sourceRef, targetRef, kind, label, direction = "directed", strength = 5, evidenceType = "primary-text", sourceCitation = "《洞玄灵宝真灵位业图》第四中位", historicalScope = "齐梁神谱整理层", confidence = "certain", notes }, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:zhenling-fourth-rank:${key}`,
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
  const tierRef = "z4:fourth-rank-taiqing";
  const sourceRelations = [
    buildRelation({ key: "source-tier-fourth-rank", sourceRef: tierRef, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第四阶结构原典", notes: "第四中位主位、左右位、夹注、集合与总结行均据现用底本整理。" }, worldId, now),
    ...positionRows.map((row) => buildRelation({ key: `source-position-${row.key}`, sourceRef: resolveRowRef(row), targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第四阶列名出处", notes: `原典以“${row.sourceNameForm}”列入第四阶${row.section}第 ${row.sectionOrder} 项；关系只证明列名与位置。` }, worldId, now)),
    ...headingRows.map((row) => buildRelation({ key: `source-heading-${row.key}`, sourceRef: `z4:${row.key}`, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第四阶结构注记出处", notes: `原典以“${row.sourceNameForm}”总结相邻名位，本页不把总结行算作人物。` }, worldId, now)),
    ...locationRows.map((row) => buildRelation({ key: `source-location-${row.key}`, sourceRef: `z4:${row.key}`, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第四阶修真地夹注出处", notes: `“${row.sourceNameForm}”两次出现于人物夹注，因此建立地点索引页。` }, worldId, now))
  ];
  const membershipRelations = [
    ...positionRows.map((row) => buildRelation({ key: `rank-membership-${row.key}`, sourceRef: tierRef, targetRef: resolveRowRef(row), kind: "contains", label: row.kind === "group" ? `第四阶${row.section}合称席位` : `第四阶${row.section}名位`, notes: `按现用底本收录“${row.sourceNameForm}”；神谱归属不覆盖该人物的其他历史层。` }, worldId, now)),
    ...headingRows.map((row) => buildRelation({ key: `rank-heading-${row.key}`, sourceRef: tierRef, targetRef: `z4:${row.key}`, kind: "contains", label: "第四阶结构分组", notes: `${row.title}保存原典总结行与成员范围。` }, worldId, now)),
    ...locationRows.map((row) => buildRelation({ key: `rank-location-${row.key}`, sourceRef: tierRef, targetRef: `z4:${row.key}`, kind: "contains", label: "第四阶夹注所见修真地", notes: `${row.title}由第四阶多条人物夹注共同指向。` }, worldId, now))
  ];
  const headingMemberships = headingRows.flatMap((heading) => heading.memberKeys.map((memberKey) => {
    const member = positionRows.find((row) => row.key === memberKey);
    return buildRelation({ key: `${heading.key}-member-${memberKey}`, sourceRef: `z4:${heading.key}`, targetRef: resolveRowRef(member), kind: "contains", label: `${heading.sourceNameForm}所含名位`, notes: `“${member.sourceNameForm}”由原典总结或夹注归入“${heading.sourceNameForm}”。` }, worldId, now);
  }));
  const evidenceRelations = [
    buildRelation({ key: "yuanshi-tianwang-teaches-xiwangmu", sourceRef: "z4:yuanshi-tianwang-fourth", targetRef: "a:xiwangmu", kind: "teacher", label: "原注称元始天王为西王母师", notes: "关系只记录第四阶夹注，不把该师承投射到所有西王母传统。" }, worldId, now),
    buildRelation({ key: "yuanshi-tianwang-yuanshi-tianzun-disputed", sourceRef: "z4:yuanshi-tianwang-fourth", targetRef: "d:yuanshi-tianzun", kind: "disputed", label: "元始天王与元始天尊同一性待考", strength: 2, evidenceType: "scholarly-inference", confidence: "disputed", notes: "名称相近，但第四阶位置与西王母师承需要独立解释，不能仅按后世别名表合并。" }, worldId, now),
    buildRelation({ key: "zhang-daoling-tianshi-dao", sourceRef: "d:zhang-daoling", targetRef: "d:tianshi-dao", kind: "member", label: "第四阶以正一真人三天法师列名", notes: "讳道陵注明确人物身份，本关系补充《真灵位业图》名位证据。" }, worldId, now),
    buildRelation({ key: "wuyue-office-five-peaks-disputed", sourceRef: "z4:wuyue-jun", targetRef: "cb:five-peaks-system", kind: "disputed", label: "轮替五岳君与后世五岳大帝体系不可直接合并", strength: 2, confidence: "disputed", notes: "第四阶夹注称五百年一替，显示其名位逻辑不同于后世固定帝号。" }, worldId, now),
    buildRelation({ key: "hehou-hebo-disputed", sourceRef: "z4:hehou", targetRef: "n:hebo", kind: "disputed", label: "河侯与河伯同一性待考", strength: 2, confidence: "disputed", notes: "现本把河侯、河伯连续分列，故不能因职能相近直接合页。" }, worldId, now),
    buildRelation({ key: "yaoguang-beidou-seven-disputed", sourceRef: "z4:qixing-yaoguang-jun", targetRef: "cb:beidou-7-pojun", kind: "disputed", label: "瑶光君与北斗第七星君对应待考", strength: 2, evidenceType: "scholarly-inference", confidence: "disputed", notes: "瑶光、摇光字形与星名相近，但完整尊号和文献年代不同，先保留两页。" }, worldId, now),
    buildRelation({ key: "ge-hong-luofu", sourceRef: "d:ge-hong", targetRef: "d:luofu-mountain", kind: "located", label: "夹注称葛洪隐罗浮山", notes: "第四阶夹注为既有葛洪与罗浮山关系增加一条神谱证据。" }, worldId, now),
    buildRelation({ key: "xu-jidao-heming", sourceRef: "z4:xu-jidao", targetRef: "d:heming-mountain", kind: "located", label: "夹注记徐季道在鹄鸣山", notes: "原文只给地点，不补写活动年代与洞府。" }, worldId, now),
    buildRelation({ key: "mao-bodao-wangwu", sourceRef: "z4:mao-bodao", targetRef: "z4:wangwu-mountain", kind: "located", label: "王屋山得道", notes: "夹注称毛伯道与刘道恭二人在王屋山得道。" }, worldId, now),
    buildRelation({ key: "liu-daogong-wangwu", sourceRef: "z4:liu-daogong", targetRef: "z4:wangwu-mountain", kind: "located", label: "王屋山得道", notes: "夹注称刘道恭与毛伯道二人在王屋山得道。" }, worldId, now),
    buildRelation({ key: "zhao-shengqi-wangwu", sourceRef: "z4:zhao-shengqi", targetRef: "z4:wangwu-mountain", kind: "located", label: "夹注记在王屋山", notes: "原文只写“在王屋山”，不补造修炼过程。" }, worldId, now),
    buildRelation({ key: "mao-liu-companions", sourceRef: "z4:mao-bodao", targetRef: "z4:liu-daogong", kind: "custom", direction: "mutual", label: "同在王屋山得道", notes: "两人由同一夹注合称，不据此推定师兄弟或亲属。" }, worldId, now),
    buildRelation({ key: "twenty-four-qi-formed", sourceRef: "z4:twenty-four-guanjun", targetRef: "d:taishang-laojun", kind: "custom", label: "太清阶位中被称气化结成", confidence: "probable", notes: "夹注说两条官君将吏为气化结成；与太上老君的连接只表示同属太清主位，不推定直接创造。" }, worldId, now),
    buildRelation({ key: "twelve-hundred-qi-formed", sourceRef: "z4:twelve-hundred-guanjun", targetRef: "d:taishang-laojun", kind: "custom", label: "太清阶位中被称气化结成", confidence: "probable", notes: "夹注说两条官君将吏为气化结成；与太上老君的连接只表示同属太清主位，不推定直接创造。" }, worldId, now)
  ];
  return [...sourceRelations, ...membershipRelations, ...headingMemberships, ...evidenceRelations];
}

function buildTimelineEvents(worldId, now) {
  const event = (key, entityRef, trackKey, title, summary, sortOrder, era, references) => ({
    id: `timeline-event:${worldId}:mythology:zhenling-fourth-rank:${key}`,
    worldId,
    entityId: resolveRef(entityRef, worldId),
    questId: "",
    sceneId: "",
    references: references.map((reference) => ({ kind: "entity", id: resolveRef(reference, worldId) })),
    trackId: trackId(trackKey, worldId),
    title,
    summary,
    displayDate: "约五世纪末至六世纪前半",
    datePrecision: "range",
    sortOrder,
    startValue: "499",
    endValue: "536",
    era,
    dependencyIds: [],
    updatedAt: now
  });
  return [
    event("fourth-rank-compiled", "z4:fourth-rank-taiqing", "textual-evidence", "第四中位形成太清境大型名录", "一百七十四个项目把天师、仙真、自然神、玉女、使者和无名集合纳入太清境。", 524, "齐梁神谱整理层", ["z4:fourth-rank-taiqing", "zs:zhenling-weiye-tu"]),
    event("collective-counts-preserved", "z4:twenty-four-guanjun", "textual-evidence", "第四阶保存多组有数无名席位", "七真人、二十四官君、一千二百官君、百玉女等人数被保留，却不被伪造为独立姓名。", 525, "齐梁名录计数层", ["z4:twenty-four-guanjun", "z4:twelve-hundred-guanjun", "z4:santian-hundred-yunv", "zs:zhenling-weiye-tu"]),
    event("taiqing-main-rank", "d:taishang-laojun", "religious-institutions", "太上老君被置为第四阶太清道主", "主位夹注称太上老君为太清道主、下临万民，第四阶由此统摄左右两侧名位。", 526, "齐梁太清神谱层", ["d:taishang-laojun", "z4:fourth-rank-taiqing", "zs:zhenling-weiye-tu"]),
    event("yunv-emissary-groups", "z4:fifteen-yunv-titles", "religious-institutions", "十五玉女号与十五使者被编为成组名位", "玉女号、四将军和使者自然神分别保留成员范围，显示第四阶内部已有成组官号。", 527, "齐梁太清官号层", ["z4:fifteen-yunv-titles", "z4:four-generals", "z4:fifteen-emissaries", "zs:zhenling-weiye-tu"]),
    event("wuyue-rotating-office", "z4:wuyue-jun", "religious-institutions", "五岳君被描述为五百年一替", "轮替注记呈现可更换的五岳名位，与后世固定五岳帝号需要分层阅读。", 528, "齐梁五岳仙职层", ["z4:wuyue-jun", "cb:five-peaks-system", "zs:zhenling-weiye-tu"]),
    event("historical-figures-taiqing", "z4:zhang-liang", "cult-evolution", "张良、东方朔与墨翟等被列入太清左位", "历史人物和诸子名字进入太清神谱，人物生前经历与中古仙班身份由此形成两个资料层。", 529, "中古历史人物仙化层", ["z4:zhang-liang", "z4:dongfang-shuo", "z4:mozi", "z4:yan-zhaowang"]),
    event("taiqing-five-emperors", "z4:taiqing-five-emperors", "cult-evolution", "五方名号被合称太清五帝", "灵威仰、赤熛弩、曜魄宝、隐侯局与含枢纽在第四阶被解释为五方自然之神。", 530, "中古五方帝神谱层", ["z4:taiqing-five-emperors", "z4:dongfang-lingweiyang", "z4:zhongyang-hanshuniu", "zs:zhenling-weiye-tu"]),
    event("daoist-adepts-ranked", "d:ge-hong", "cult-evolution", "张道陵、葛洪与众仙传人物进入第四阶", "天师与修道人物被置入同一太清层，人物传记、修真地点和神谱名位通过有出处关系连接。", 531, "中古道教人物神格化层", ["d:zhang-daoling", "d:ge-hong", "z4:mao-gu", "z4:wangwu-mountain"])
  ];
}

function assertBatchShape() {
  const figures = positionRows.filter((row) => row.kind === "figure");
  const groups = positionRows.filter((row) => row.kind === "group");
  const reused = figures.filter((row) => row.existingRef);
  if (mainRows.length !== 2) throw new Error(`${BATCH_LABEL}中位项目应为 2，实际为 ${mainRows.length}`);
  if (leftRows.length !== 63) throw new Error(`${BATCH_LABEL}左位项目应为 63，实际为 ${leftRows.length}`);
  if (rightRows.length !== 109) throw new Error(`${BATCH_LABEL}右位项目应为 109，实际为 ${rightRows.length}`);
  if (positionRows.length !== 174) throw new Error(`${BATCH_LABEL}名录项目应为 174，实际为 ${positionRows.length}`);
  if (figures.length !== 163) throw new Error(`${BATCH_LABEL}可辨人物名位应为 163，实际为 ${figures.length}`);
  if (groups.length !== 11) throw new Error(`${BATCH_LABEL}合称神位应为 11，实际为 ${groups.length}`);
  if (reused.length !== 6) throw new Error(`${BATCH_LABEL}连接既有身份应为 6，实际为 ${reused.length}`);
  if (headingRows.length !== 5) throw new Error(`${BATCH_LABEL}结构注记应为 5，实际为 ${headingRows.length}`);
  if (new Set(positionRows.map((row) => row.key)).size !== positionRows.length) throw new Error(`${BATCH_LABEL}名位键重复`);
  if (new Set(positionRows.map((row) => row.sourceNameForm)).size !== positionRows.length) throw new Error(`${BATCH_LABEL}原典名号重复`);
  for (const heading of headingRows) {
    if (heading.memberKeys.some((key) => !positionRows.some((row) => row.key === key))) throw new Error(`${heading.title}含未知成员`);
  }
}

function buildZhenlingFourthRankBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const newFigureRows = positionRows.filter((row) => row.kind === "figure" && !row.existingRef);
  const collectiveRows = positionRows.filter((row) => row.kind === "group");
  const figures = newFigureRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const tier = buildInstitutionEntity({ key: "fourth-rank-taiqing", title: "《真灵位业图》第四阶（太清境）", summary: "太上老君所主的第四阶，共拆出一百七十四个名录项目，并保存多组有数无名席位。" }, figures.length, worldId, now, "tier");
  const collectives = collectiveRows.map((row, index) => buildInstitutionEntity(row, figures.length + 1 + index, worldId, now, "group"));
  const headings = headingRows.map((row, index) => buildInstitutionEntity(row, figures.length + collectives.length + 1 + index, worldId, now, "heading"));
  const locations = locationRows.map((row, index) => buildLocationEntity(row, figures.length + collectives.length + headings.length + 1 + index, worldId, now));
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...figures, tier, ...collectives, ...headings, ...locations],
    figures,
    institutions: [tier, ...collectives, ...headings],
    locations,
    sources: [],
    catalogPositions: positionRows.map((row) => ({ ...row, ref: resolveRowRef(row) })),
    relations: buildRelations(worldId, now),
    timelineEvents: buildTimelineEvents(worldId, now),
    featuredEntityIds: [tier.id, zhenlingFourthEntityId("yuanshi-tianwang-fourth", worldId), zhenlingFourthEntityId("taiqing-five-emperors", worldId), zhenlingFourthEntityId("fifteen-emissaries", worldId)]
  };
}

module.exports = { BATCH_KEY, BATCH_LABEL, buildZhenlingFourthRankBatch, zhenlingFourthEntityId };
