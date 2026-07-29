const { WORLD_ID, categoryId } = require("./chinese-mythology-history-data.cjs");
const { ancientEntityId } = require("./chinese-mythology-ancient-core-data.cjs");
const { daoismEntityId } = require("./chinese-mythology-daoism-early-data.cjs");
const { celestialEntityId } = require("./chinese-mythology-celestial-bureaucracy-data.cjs");
const { ritesEntityId } = require("./chinese-mythology-confucian-rites-data.cjs");
const { folkEntityId } = require("./chinese-mythology-folk-syncretism-data.cjs");
const { zhenlingSourceId, trackId } = require("./chinese-mythology-zhenling-first-rank-data.cjs");
const { zhenlingThirdEntityId } = require("./chinese-mythology-zhenling-third-rank-data.cjs");
const { zhenlingFourthEntityId } = require("./chinese-mythology-zhenling-fourth-rank-data.cjs");
const { zhenlingFifthEntityId } = require("./chinese-mythology-zhenling-fifth-rank-data.cjs");

const BATCH_KEY = "zhenling-weiye-sixth-rank-17";
const BATCH_LABEL = "道教神谱扩展 · 《真灵位业图》第六阶";

function zhenlingSixthEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:zhenling-weiye:sixth-rank:${key}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function f(key, title, sourceNameForm, sourceNote = "", options = {}) {
  return {
    kind: "figure",
    key,
    title,
    sourceNameForm,
    sourceNote,
    identityType: options.identityType || "仙真",
    recordNature: options.recordNature || (options.identityType === "神官" ? "官号兼人名" : "单列人名"),
    existingRef: options.existingRef || "",
    identityNote: options.identityNote || "",
    confidence: options.confidence || "原典明确列名"
  };
}

function group(key, title, sourceNameForm, count, sourceNote) {
  return { kind: "group", key, title, sourceNameForm, count, sourceNote };
}

function site(key, title, sourceNameForm, sourceNote, count = 0) {
  return { kind: "site", key, title, sourceNameForm, sourceNote, count };
}

function withSection(rows, section) {
  return rows.map((row, index) => ({ ...row, seatSide: section, section, sectionOrder: index + 1 }));
}

const mainRows = withSection([
  f("zhong-mao-jun", "中茅君（第六阶主位）", "右禁郎定録眞君中茅君", "夹注称其治华阳洞天；现本未在本行写出俗名。", { identityType: "神官", recordNature: "仅见名录", confidence: "身份待考" })
], "中位");

const leftRows = withSection([
  f("xiao-mao-jun", "小茅君（第六阶名位）", "三官保命小茅君", "名录只保存小茅君与三官保命官号。", { identityType: "神官", recordNature: "仅见名录", confidence: "身份待考" }),
  f("li-feng", "李丰", "三官大理都李豐", "名录保留三官大理都官号与姓名。", { identityType: "神官", recordNature: "官号兼人名" }),
  f("wang-fuzi", "王附子", "三官大理守王附子", "名录保留三官大理守官号与姓名。", { identityType: "神官", recordNature: "官号兼人名" }),
  f("xun-zhonghou", "荀中侯（姓名不显）", "荀中侯", "夹注明说不显名字，因此不从官称猜补名讳。", { identityType: "神官", recordNature: "仅见名录", confidence: "身份待考" }),
  f("zhu-jiaofu", "朱交甫", "白水仙都朱交甫", "名录保留白水仙都称号与姓名。", { identityType: "神官", recordNature: "官号兼人名" }),
  f("tao-jun", "桃俊", "北河司命保禁侯桃俊", "名录保留北河司命保禁侯官号与姓名。", { identityType: "神官", recordNature: "官号兼人名" }),
  f("han-chong", "韩崇", "左理中監韓崇", "夹注以大府长史、司马作官阶类比。", { identityType: "神官", recordNature: "官号兼人名" }),
  f("jiugong-xiechen-furen", "九宫协晨夫人（第六阶名位）", "九宫恊晨夫人", "原典只保存夫人官号，没有附姓名。", { identityType: "神官", recordNature: "仅见名录", confidence: "身份待考" }),
  f("wenjie", "文解", "文解", "短称独立列在九宫协晨夫人与地上主者之间。", { identityType: "名录身份待考", recordNature: "仅见名录", confidence: "身份待考" }),
  f("dishang-zhuzhe", "地上主者（第六阶名位）", "地上主者", "原典只保存职名，没有附姓名。", { identityType: "神官", recordNature: "仅见名录", confidence: "身份待考" }),
  f("bao-jing-position", "鲍靓", "鮑靚", "夹注称其曾任南海太守。", { identityType: "历史人物神格", existingRef: "d:bao-jing", recordNature: "单列人名", identityNote: "姓名与既有鲍靓页相合，第六阶只增加神谱名位。" }),
  f("bao-yuanjie", "鲍元节", "岱宗神侯領羅酆右禁司鮑元節", "名录保留岱宗神侯、罗酆右禁司与姓名。", { identityType: "神官", recordNature: "官号兼人名" }),

  f("xu-huya", "许虎牙", "許虎牙", "夹注称其名黟、字丈晖，受杨君守一之道。"),
  f("wang-zhen-sixth", "王真（第六阶地仙）", "王眞", "夹注称其为上党人。", { confidence: "身份待考" }),
  f("meng-jun-sixth", "孟君（第六阶地仙）", "孟君", "夹注称其为京兆人。", { confidence: "身份待考" }),
  f("lu-nusheng", "鲁女生", "魯女生", "夹注称其在中岳；又说与前两人受行三一、真一。"),
  f("zuo-yuanfang-position", "左慈", "左元放", "夹注称其为李仲甫弟子、在小括山。", { identityType: "历史人物神格", existingRef: "d:zuo-ci", recordNature: "同神异号候选", identityNote: "元放是既有左慈页保存的字，因此连接现有身份。" }),
  f("luo-yu", "罗郁", "九疑山女眞羅郁", "夹注称其今在湘东山。", { recordNature: "官号兼人名" }),
  f("duling-furen", "杜陵夫人", "杜陵夫人", "夹注称她与宜安宋姬同受西梁真人青精方，未书位号，暂列地真。"),
  f("yian-songji", "宜安宋姬", "宜安宋姬", "夹注称她与杜陵夫人同受西梁真人青精方，未书位号，暂列地真。"),
  f("xu-mai", "许迈", "許邁", "夹注称其字叔玄、小名晄，改名远游，并被东华署为地仙。", { identityType: "历史人物神格" }),
  f("weng-daoyuan", "翁道远", "翁道逺", "夹注把他与姜伯真称为俦侣，并有在猛山学道采药之说。"),
  f("jiang-bozhen", "姜伯真", "姜伯眞", "夹注把他与翁道远称为俦侣，并有在猛山学道采药之说。"),
  f("guo-shengzi-position", "郭声子", "郭聲子", "夹注把他与黄子阳称作常随葛玄者。", { existingRef: "z4:guo-shengzi", recordNature: "单列人名", identityNote: "姓名与第四阶郭声子相同，连接现有页面并保留跨阶位置。" }),
  f("huang-ziyang", "黄子阳", "黃子陽", "夹注一说其为魏夫人食桃皮师，又把他与郭声子称作常随葛玄者。"),
  f("ge-xuan-position", "葛玄", "葛玄", "夹注称其字孝先、丹阳句曲人、葛洪从祖，初在长山，位在太极宫。", { identityType: "历史人物神格", existingRef: "d:ge-xuan", recordNature: "单列人名", identityNote: "连接既有葛玄页；夹注中的神异与神谱名位作为中古接受层。" }),
  f("zheng-siyuan-position", "郑隐（郑思远）", "鄭思逺", "夹注称其为葛玄弟子，并在永昌元年入括苍山。", { identityType: "历史人物神格", existingRef: "d:zheng-yin", recordNature: "同神异号候选", identityNote: "既有郑隐页已保存郑思远异名与葛玄师承，因此不重复建人。" }),
  f("dai-meng", "戴孟", "戴孟", "夹注称其本姓燕、名济、字仲微，为裴君弟子。", { identityType: "历史人物神格" }),
  f("xie-yun", "谢允", "謝允", "夹注称其历阳人、戴孟弟子，并记成帝时得道。", { identityType: "历史人物神格" }),
  f("shi-cun", "施存", "施存", "夹注称一号婉盆子，又将其列入孔子弟子得道说。", { identityType: "历史人物神格", confidence: "身份待考" }),
  f("liu-fenglin", "刘奉林", "劉奉林", "夹注称其为周时人、服黄连。", { identityType: "历史人物神格" }),
  f("zhang-zhaoqi", "张兆期", "張兆期", "夹注称其为费长房之师。"),
  f("zhou-jun-sixth", "周君（第六阶名位）", "周君", "夹注称其与张兆期同读《素书》七卷得道；短称不足以并入第四阶周君。", { recordNature: "同神异号候选", confidence: "同一性有争议" }),
  f("lei-shi", "雷氏（第六阶名位）", "雷氏", "夹注接写“周氏养龙”，人物与句法仍待校。", { identityType: "名录身份待考", confidence: "身份待考" }),
  f("jiang-shu", "姜叔", "姜叔", "原典以短名独立列出。"),
  f("liu-anzhi", "刘安之", "田公劉安之", "夹注称其在裴君时任冀州别驾。", { identityType: "历史人物神格", recordNature: "官号兼人名" }),
  f("chi-luban", "赤鲁班（黄初起）", "赤魯班", "夹注称其即黄初起。", { recordNature: "同神异号候选" }),
  f("fan-anyuan", "范安远", "范安逺"),
  f("jia-xuandao", "贾玄道", "賈玄道"),
  f("li-shusheng", "李叔胜", "李叔勝"),
  f("yan-chengsheng", "言成生", "言成生"),
  f("fu-daoliu", "傅道流", "傅道流", "相邻夹注说四人隶司命、主察试学道者并在泰山，但四人边界在现行断句中不完全清楚。", { confidence: "身份待考" }),
  f("fan-ziming", "樊子明", "眞人樊子明", "原典以真人称号列名。", { recordNature: "官号兼人名" }),
  f("longwei-zhangren", "龙威丈人", "龍威丈人", "原典只给尊号。", { recordNature: "仅见名录" }),
  f("liu-shaoweng", "刘少翁", "劉少翁", "夹注只写“华山”。", { identityType: "历史人物神格" }),
  f("liang-boluan", "梁伯鸾", "梁伯鸞", "原典以姓名独立列出。", { identityType: "历史人物神格" }),
  f("fan-dafu", "樊大夫", "樊大夫", "原典只保存姓氏与大夫称号。", { recordNature: "官号兼人名", confidence: "身份待考" }),
  f("wu-mu", "吴睦", "呉睦", "夹注称其长安人，少为县吏。", { identityType: "历史人物神格" }),
  f("zhu-tun", "朱㹠", "朱㹠", "夹注称其陈留人，昔作劫盗。", { identityType: "历史人物神格", confidence: "字形待校" }),
  f("guo-duan", "郭端", "郭端", "夹注称其颍川人，少孤，曾为县吏。", { identityType: "历史人物神格" }),
  f("fan-boci", "范伯慈", "范伯慈", "夹注称其桂阳人，少时曾患邪病。", { identityType: "历史人物神格" }),
  f("bao-shuyang", "鲍叔阳", "鮑叔陽", "夹注把他与王养伯、段季正、刘伟惠称为西灵子都弟子。"),
  f("wang-yangbo", "王养伯", "王養伯", "夹注把他与鲍叔阳、段季正、刘伟惠称为西灵子都弟子。"),
  f("duan-jizheng", "段季正", "段季正", "夹注把他与鲍叔阳、王养伯、刘伟惠称为西灵子都弟子。"),
  f("liu-weihui", "刘伟惠", "劉偉惠", "夹注把他与鲍叔阳、王养伯、段季正称为西灵子都弟子。"),
  f("song-xuande", "宋玄德", "宋玄德", "夹注只写“嵩高山”。"),
  f("li-dong", "李东", "李東", "原典以姓名独立列出。"),
  site("tongchu-fu", "童初府（第六阶男真府）", "童初府", "夹注称童初府与萧闲宫所列并为男真。"),
  site("xiaoxian-gong", "萧闲宫（第六阶男真宫）", "蕭閑宫", "夹注称萧闲宫与童初府所列并为男真。"),
  site("yiqian-gong", "易迁宫（八十三人）", "易遷宫", "夹注明记八十三人，没有在本处逐名。", 83),
  site("hanzhen-tai", "含真台（近二百女真）", "含眞臺", "夹注称近二百人，并为女真，没有在本处逐名。", 200)
], "左位");

const rightRows = withSection([
  f("liu-yi", "刘翊", "右理中監劉翊", "名录保留右理中监官号与姓名。", { identityType: "神官", recordNature: "官号兼人名" }),
  f("chunyu-zhen", "淳于斟", "典柄執法郎淳于斟", "名录保留典柄执法郎官号与姓名。", { identityType: "神官", recordNature: "官号兼人名" }),
  f("zhang-xuanbin", "张玄宾", "理禁張玄賔", "夹注称其掌雨水之官，亦属保命书。", { identityType: "神官", recordNature: "官号兼人名" }),
  f("liu-kuan", "刘宽", "童初府師上侯劉寛", "夹注称童初府即保命府。", { identityType: "神官", recordNature: "官号兼人名" }),
  f("zhao-weibo", "赵威伯", "丞四人：趙威伯", "夹注称其主仙籍并掌暴雨水。", { identityType: "神官", recordNature: "官号兼人名" }),
  f("yue-changzhi", "乐长治", "樂長治", "夹注称其主灾害。", { identityType: "神官" }),
  f("zheng-zhizheng", "郑稚政", "鄭稚政", "夹注称其主考注。", { identityType: "神官" }),
  f("tang-gongfang", "唐公房", "唐公房", "夹注称其主死生。", { identityType: "神官" }),
  group("mingchen-seven", "明晨侍郎七人（合称神位）", "明晨侍郎七人，比御史中丞", 7, "原典报告七名侍郎并以御史中丞作比，没有逐一给名。"),
  f("xia-fu", "夏馥", "三男眞。夏馥字子恬，陳留人，桐栢眞人弟", "原文在三男真条下写出夏馥字子恬、陈留人，并称桐柏真人弟。", { identityType: "历史人物神格" }),
  group("two-unrevealed-male", "两名不显男真（第六阶）", "子二人不顯", 2, "三男真中除夏馥外另有二人，现本不显姓名。"),
  f("zhou-xiayou", "周夏友", "四女眞。周夏友", "原文称其汝南安城人、河南尹用畅之女。", { identityType: "历史人物神格" }),
  f("zhang-taozhi", "张桃枝", "張桃枝", "原文称其沛人、司隶朱寓之母。", { identityType: "历史人物神格" }),
  group("two-unrevealed-female", "两名不显女真（第六阶）", "二人不顯", 2, "四女真中除周夏友、张桃枝外另有二人，现本不显姓名。"),
  f("fan-youzhong", "范幽仲", "監二人：范幽仲", "夹注称其辽西人。", { identityType: "神官", recordNature: "官号兼人名" }),
  f("li-zheng", "李整", "漠尚書，即李整", "夹注称另一监官为漠尚书李整、河内人。", { identityType: "神官", recordNature: "官号兼人名", confidence: "字形待校" }),
  f("wang-yan", "王延", "武解鬼帥者：王延", "四名武解鬼帅之一，夹注称四人已度。", { identityType: "鬼官", recordNature: "官号兼人名" }),
  f("fan-liang", "范粮", "范糧", "四名武解鬼帅之一，夹注称四人已度。", { identityType: "鬼官" }),
  f("fu-huang", "傅晃", "傅晃", "四名武解鬼帅之一，夹注称四人已度。", { identityType: "鬼官" }),
  f("chu-xian", "除衔", "除衘", "四名武解鬼帅之一；字形与身份仍待校。", { identityType: "鬼官", confidence: "字形待校" }),

  f("song-laizi", "宋来子", "中嶽仙人宋來子", "夹注称其先为楚市长，遇冯延寿。", { identityType: "历史人物神格", recordNature: "官号兼人名" }),
  f("zhongyue-li-xiansheng", "中岳李先生", "中嶽李先生", "原典只保存中岳与李先生称呼。", { confidence: "身份待考" }),
  f("bianque-zirong", "子容（扁鹊弟子）", "扁鵲弟子五人：子容", "扁鹊弟子五人之一。", { recordNature: "官号兼人名" }),
  f("bianque-ziming", "子明（扁鹊弟子）", "子明", "扁鹊弟子五人之一。", { recordNature: "官号兼人名", confidence: "身份待考" }),
  f("bianque-ziwei", "子威（扁鹊弟子）", "子威", "扁鹊弟子五人之一。", { recordNature: "官号兼人名", confidence: "身份待考" }),
  f("bianque-zixi", "子戏（扁鹊弟子）", "子戲", "扁鹊弟子五人之一。", { recordNature: "官号兼人名", confidence: "身份待考" }),
  f("bianque-ziyou", "子游（扁鹊弟子）", "子游", "扁鹊弟子五人之一。", { recordNature: "官号兼人名", confidence: "身份待考" }),
  f("zhao-taizi", "赵太子", "趙太子", "夹注只称服术者。", { identityType: "历史人物神格", confidence: "身份待考" }),
  f("jiang-xiansheng", "将先生", "將先生", "夹注称其为支子元之师。", { confidence: "身份待考" }),
  f("zhi-ziyuan", "支子元", "支子元", "夹注称其曾作裴君小时师。"),
  f("lu-sheng", "庐生（第六阶地仙）", "廬生", "短称不足以与其他同名人物合并。", { confidence: "身份待考" }),
  f("hou-gong", "侯公（第六阶地仙）", "侯公", "原典只保存侯公称呼。", { confidence: "身份待考" }),
  f("shi-sheng", "石生（第六阶地仙）", "石生", "夹注称其入东海、为始皇使；短名仍需与其他石生分开。", { identityType: "历史人物神格", confidence: "身份待考" }),
  f("wang-weixuan", "王玮玄", "林屋仙人王瑋玄", "名录保留林屋仙人称号与姓名。", { recordNature: "官号兼人名" }),
  f("shantu-gongzi", "山图公子", "山圖公子", "夹注称其为周哀王时大夫、张禁保之师。", { identityType: "历史人物神格" }),
  f("chixuzi", "赤须子", "赤須子", "夹注称其为夏明晨之师。"),
  f("qinggu-xiansheng", "青谷先生", "青谷先生", "夹注称其为刘上缊之师。"),
  f("huichezi", "惠车子", "惠車子", "夹注称其为淳于典柄之师。"),
  f("shi-changsheng", "石长生", "石長生", "夹注称其为周明晨之师。"),
  f("dongguo-youping", "东郭幼平", "東郭幼平", "夹注称其为桃北河之师。"),
  f("zheng-zizhen", "郑子真", "鄭子眞", "夹注只写“阳翟山”。"),
  f("deng-yunshan", "邓云山", "鄧雲山", "夹注把他与唐览连到华山。"),
  f("tang-lan", "唐览", "唐覽", "夹注把他与邓云山连到华山。"),
  f("xihe-ji-gong", "西河蓟公", "西河薊公", "夹注称其为张理禁之师。", { confidence: "身份待考" }),
  f("zhou-zhengshi", "周正时", "周正時", "原典以姓名独立列出。"),
  f("diao-daolin", "刁道林", "刁道林", "夹注称其为龙伯高之师。"),
  f("guo-zihua", "郭子华", "郭子華", "夹注把他与赵叔逵、张季连称作三人在霍山。"),
  f("zhao-shukui", "赵叔逵", "趙叔逵", "夹注把他与郭子华、张季连称作三人在霍山。"),
  f("zhang-jilian", "张季连", "張季連", "夹注把他与郭子华、赵叔逵称作三人在霍山。"),
  f("zhao-gongcheng", "赵公成", "趙公成", "夹注只写“鹤鸣山”。"),
  f("fan-qiulin", "范丘林", "范丘林", "夹注称其为女真、赵盛伯六甲之师。"),
  f("xiuyang-gong", "修羊公", "修羊公", "夹注称其化为白石。"),
  f("jiqiuzi", "稷丘子", "稷丘子", "原典以称号独立列出。"),
  f("cui-wenzi", "崔文子", "崔文子", "夹注把他与商丘子称作服菖蒲而不老。", { identityType: "历史人物神格" }),
  f("shangqiuzi", "商丘子", "商丘子", "夹注把他与崔文子称作服菖蒲而不老。"),
  f("liu-gen", "刘根", "劉根", "夹注称其服甘草。", { identityType: "历史人物神格" }),
  f("jie-xiang", "介象", "介象", "原典以姓名独立列出。", { identityType: "历史人物神格" }),
  f("baiyang-gong", "白羊公", "白羊公", "夹注明说不显姓名，因此只保存称号。", { recordNature: "仅见名录", confidence: "身份待考" }),
  f("jie-yan", "介琰", "介琰", "夹注称其为白羊公弟子。"),
  f("liu-gang-wife", "刘纲妻（第六阶名位）", "劉綱妻", "夹注把她与严青列为善禁气者；没有在本行写出姓名。", { identityType: "历史人物神格", recordNature: "仅见名录", confidence: "身份待考" }),
  f("yan-qing", "严青", "嚴青", "夹注把他与刘纲妻列为善禁气者。"),
  f("chen-zhonglin", "陈仲林", "陳仲林", "相邻夹注把他与道君、赵叔道称作盖竹山中真人。"),
  f("daojun-sixth", "道君（第六阶地仙散位）", "道君", "短称不足以并入其他道君；相邻夹注称其为盖竹山中真人。", { identityType: "名录身份待考", recordNature: "同神异号候选", confidence: "身份待考" }),
  f("zhao-shudao", "赵叔道", "趙叔道", "相邻夹注把他与陈仲林、道君称作盖竹山中真人。"),
  f("wang-shilong", "王世龙", "王世龍", "夹注称其为许远游之师。"),
  f("zhao-daoxuan", "赵道玄", "趙道玄", "夹注称其为许远游之交。"),
  f("fu-taichu", "傅太初", "傅太初", "夹注称其为许远游之交。"),
  f("gong-youjie", "龚幼节", "龔幼節", "夹注称其为许远游代对者。"),
  f("li-kailin", "李开林", "李開林", "夹注称其为许远游代对者。"),
  f("wang-shaodao", "王少道", "王少道", "相邻夹注把三人称作童初府标表，但成员边界仍待校。", { confidence: "身份待考" }),
  f("fan-shusheng", "范叔胜", "范叔勝", "相邻夹注把三人称作童初府标表，但成员边界仍待校。", { confidence: "身份待考" }),
  f("li-boshan", "李伯山", "李伯山", "相邻夹注把三人称作童初府标表，但成员边界仍待校。", { confidence: "身份待考" }),
  f("li-zhongwen", "李仲文", "李仲文", "原典以姓名独立列出。"),
  f("fu-zhili", "傅知礼", "傅知禮", "原典以姓名独立列出。"),
  f("dou-qiongying", "窦琼英", "竇瓊英", "女真段首位。"),
  f("han-taihua", "韩太华", "韓太華", "夹注称其为安国妹、李广利妇。", { identityType: "历史人物神格" }),
  f("liu-chunlong", "刘春龙", "劉春龍", "女真段单列姓名。"),
  f("li-xizi", "李奚子", "李奚子", "女真段单列姓名。"),
  f("wang-jinxian", "王进贤", "王進賢", "夹注称其为衍女。", { identityType: "历史人物神格" }),
  f("guo-shuxiang", "郭叔香", "郭叔香", "女真段单列姓名。"),
  f("zhao-sutai", "赵素台", "趙素臺", "夹注称其为熙女。", { identityType: "历史人物神格" }),
  f("zheng-tiansheng", "郑天生", "鄭天生", "夹注只写“邓父母”，关系与字义仍待校。", { confidence: "字形待校" }),
  f("xu-kedou", "许科斗", "許科斗", "夹注称其为长史妇。", { identityType: "历史人物神格" }),
  f("li-huigu", "李惠姑", "李惠姑", "夹注称其为夏侯玄妇；现本文字作“夏喉”待校。", { identityType: "历史人物神格", confidence: "字形待校" }),
  f("zhang-meizi", "张美子", "張美子", "夹注与施淑女后接“续女”，具体亲属所指待校。", { confidence: "身份待考" }),
  f("shi-shunv", "施淑女", "施淑女", "夹注与张美子后接“续女”，具体亲属所指待校。", { confidence: "身份待考" }),
  f("song-piaojin-mu", "宋漂金母", "宋漂金母", "原典以母称列入女真段。", { recordNature: "仅见名录", confidence: "身份待考" }),
  f("bao-jing-sister", "鲍靓妹（第六阶女真）", "鮑靚妹", "原典以亲属称谓列名，没有写出姓名。", { identityType: "历史人物神格", recordNature: "仅见名录", confidence: "身份待考" }),
  f("zhang-weizi", "张微子", "張微子", "夹注把她与傅和称作含真台主。", { identityType: "神官" }),
  f("fu-he", "傅和", "傅和", "夹注把她与张微子称作含真台主。", { identityType: "神官" }),
  f("du-qi", "杜契", "山外其東者杜契", "名录以“山外其东者”标出杜契。", { recordNature: "官号兼人名" }),
  f("xu-zongdu", "徐宗度", "徐宗度", "夹注把他与晏贤生称作契友。"),
  f("yan-xiansheng", "晏贤生", "晏賢生", "夹注把他与徐宗度称作契友。"),
  f("sun-hanhua", "孙寒华", "孫寒華", "夹注明记女真。"),
  f("chen-shijing", "陈世景", "陳世景", "夹注与孙寒华后接“二人，契弟子”，断句仍待校。", { confidence: "身份待考" }),
  f("zhao-xi", "赵熙", "趙熈", "与方山下洞室主者相邻列出。"),
  f("fangshan-cave-master", "方山下洞室主者", "方山下洞室主者", "原典只保存洞室职称，没有附姓名。", { identityType: "神官", recordNature: "仅见名录", confidence: "身份待考" }),
  f("zhang-zuchang", "张祖常", "張祖常", "夹注把他与随后四人称作并处方台。"),
  f("liu-pinga", "刘平阿", "劉平阿", "夹注把他与张祖常等称作并处方台。"),
  f("lu-zihua", "吕子华", "吕子華", "夹注把他与张祖常等称作并处方台。"),
  f("cai-tiansheng", "蔡天生", "蔡天生", "夹注把他与张祖常等称作并处方台。"),
  f("long-bogao", "龙伯高", "龍伯髙", "夹注把他与张祖常等称作并处方台；前文另称刁道林为其师。"),
  f("xie-zhijian", "谢稚坚", "謝稚堅", "夹注把他与随后四人称作在鹿迹洞。"),
  f("wang-boliao", "王伯辽", "王伯遼", "夹注把他与谢稚坚等称作在鹿迹洞。"),
  f("heyangzi-he-miao", "繁阳子何苗", "繁陽子何苖", "夹注把他与谢稚坚等称作在鹿迹洞。", { recordNature: "官号兼人名", confidence: "字形待校" }),
  f("feng-liang", "冯良", "馮良", "夹注把他与谢稚坚等称作在鹿迹洞。"),
  f("lang-zong", "郎宗", "郎宗", "夹注把他与谢稚坚等称作在鹿迹洞。"),
  f("wang-shuming", "王叔明", "王叔明", "夹注把他与鲍元治、尹盖妇列在北山下绝洞语境。"),
  f("bao-yuanzhi", "鲍元治", "鮑元治", "夹注把他与王叔明、尹盖妇列在北山下绝洞语境。"),
  f("yin-gai-wife", "尹盖妇（第六阶名位）", "尹蓋婦", "原典以亲属称谓列名；夹注又说其外尚有三十人在北山下绝洞。", { identityType: "历史人物神格", recordNature: "仅见名录", confidence: "身份待考" }),
  f("xin-xuanzi", "辛玄子", "辛玄子", "夹注称其自云禁无中郎将、吴越鬼神之司。", { identityType: "鬼官", recordNature: "官号兼人名" }),
  f("bigan-position", "比干", "比干", "夹注只写“在戎山”；连接既有比干页并增加第六阶神谱层。", { identityType: "历史人物神格", existingRef: "x:bigan-caishen", recordNature: "单列人名", identityNote: "既有比干页已区分商末忠臣与后世财神形态，第六阶关系补入中古道教名录位置。" }),
  f("li-xi", "李喜", "李喜", "夹注称其南阳人。", { identityType: "历史人物神格" }),
  f("wu-guang", "务光", "務光", "原典以古代隐士姓名列入地仙散位。", { identityType: "历史人物神格" })
], "右位");

const positionRows = [...mainRows, ...leftRows, ...rightRows];

const headingRows = [
  { key: "left-earth-immortals", title: "第六阶左位地仙散位", sourceNameForm: "地仙散位", section: "左位", summary: "左位在鲍元节之后转入地仙散位，随后人物多附籍贯、师承、服食或山居线索。", memberKeys: leftRows.slice(12, 57).map((row) => row.key) },
  { key: "four-assistants", title: "童初府丞四人", sourceNameForm: "丞四人", section: "右位", summary: "赵威伯、乐长治、郑稚政与唐公房分别掌仙籍雨水、灾害、考注和死生。", memberKeys: ["zhao-weibo", "yue-changzhi", "zheng-zhizheng", "tang-gongfang"] },
  { key: "three-male-immortals", title: "第六阶三男真", sourceNameForm: "三男眞", section: "右位", summary: "第六阶三男真中只写出夏馥姓名，其余二人不显。", memberKeys: ["xia-fu", "two-unrevealed-male"] },
  { key: "four-female-immortals", title: "第六阶四女真", sourceNameForm: "四女眞", section: "右位", summary: "四女真中写出周夏友、张桃枝，其余二人不显。", memberKeys: ["zhou-xiayou", "zhang-taozhi", "two-unrevealed-female"] },
  { key: "two-supervisors", title: "第六阶监二人", sourceNameForm: "監二人", section: "右位", summary: "第六阶夹注补出范幽仲与漠尚书李整两名监官。", memberKeys: ["fan-youzhong", "li-zheng"] },
  { key: "four-ghost-marshals", title: "第六阶武解鬼帅四人", sourceNameForm: "武解鬼帥者", section: "右位", summary: "王延、范粮、傅晃与除衔被合列为武解鬼帅，夹注称四人已度。", memberKeys: ["wang-yan", "fan-liang", "fu-huang", "chu-xian"] },
  { key: "right-earth-immortals", title: "第六阶右位地仙散位", sourceNameForm: "地仙散位", section: "右位", summary: "右位武解鬼帅之后转入规模庞大的地仙散位，连续收录地仙、女真、洞室主者与古史人物。", memberKeys: rightRows.slice(20).map((row) => row.key) },
  { key: "bianque-five-disciples", title: "扁鹊弟子五人", sourceNameForm: "扁鵲弟子五人", section: "右位", summary: "子容、子明、子威、子戏与子游在第六阶被合列为扁鹊弟子五人。", memberKeys: ["bianque-zirong", "bianque-ziming", "bianque-ziwei", "bianque-zixi", "bianque-ziyou"] },
  { key: "female-immortals-section", title: "第六阶右位女真段", sourceNameForm: "女眞", section: "右位", summary: "傅知礼之后出现女真标记，窦琼英至傅和十六项保存女性姓名、亲属称谓与含真台职任。", memberKeys: rightRows.slice(74, 90).map((row) => row.key) }
];

const locationRows = [
  { key: "zhongyue-songgao", title: "中岳嵩高山（第六阶地仙地理）", sourceNameForm: "中嶽、嵩髙山", confidence: "大致区域", memberKeys: ["song-laizi", "zhongyue-li-xiansheng", "song-xuande"], summary: "第六阶以中岳仙人、中岳李先生和嵩高山三种写法连接同一山岳传统，但不抹去称名差异。" },
  { key: "xiaokuoshan", title: "小括山（第六阶地仙地理）", sourceNameForm: "小括山", confidence: "多种说法", memberKeys: ["zuo-yuanfang-position"], summary: "第六阶夹注称左元放在小括山，山名与括苍山是否同指仍需历史地理复核。" },
  { key: "xiangdongshan", title: "湘东山（第六阶地仙地理）", sourceNameForm: "湘東山", confidence: "多种说法", memberKeys: ["luo-yu"], summary: "第六阶夹注称九疑山女真罗郁今在湘东山，当前不生成精确坐标。" },
  { key: "mengshan", title: "猛山（第六阶采药地）", sourceNameForm: "猛山", confidence: "多种说法", memberKeys: ["weng-daoyuan", "jiang-bozhen"], summary: "第六阶一说翁道远与姜伯真在猛山学道采药，并称二人为俦侣。" },
  { key: "changshan", title: "长山（葛玄夹注地）", sourceNameForm: "長山", confidence: "多种说法", memberKeys: ["ge-xuan-position"], summary: "第六阶葛玄夹注称其初在长山，具体山地对应不能仅凭短名确定。" },
  { key: "yangdizhan", title: "阳翟山（第六阶地仙地理）", sourceNameForm: "陽翟山", confidence: "多种说法", memberKeys: ["zheng-zizhen"], summary: "第六阶在郑子真名后只写阳翟山，页面保存原名而不补洞府。" },
  { key: "gaizhushan", title: "盖竹山（第六阶地仙地理）", sourceNameForm: "蓋竹山", confidence: "大致区域", memberKeys: ["chen-zhonglin", "daojun-sixth", "zhao-shudao"], summary: "第六阶把陈仲林、道君与赵叔道称作盖竹山中真人。" },
  { key: "fangtai", title: "方台（第六阶地仙地理）", sourceNameForm: "方臺", confidence: "无法对应", memberKeys: ["zhang-zuchang", "liu-pinga", "lu-zihua", "cai-tiansheng", "long-bogao"], summary: "第六阶夹注称张祖常以下五人并处方台，方台性质与位置未展开。" },
  { key: "lujidong", title: "鹿迹洞（第六阶地仙洞室）", sourceNameForm: "鹿跡洞", confidence: "无法对应", memberKeys: ["xie-zhijian", "wang-boliao", "heyangzi-he-miao", "feng-liang", "lang-zong"], summary: "第六阶夹注称谢稚坚以下五人在鹿迹洞，未给现实坐标。" },
  { key: "beishan-juedong", title: "北山下绝洞（第六阶地仙洞室）", sourceNameForm: "北山下絶洞", confidence: "无法对应", memberKeys: ["wang-shuming", "bao-yuanzhi", "yin-gai-wife"], summary: "第六阶在王叔明、鲍元治与尹盖妇之后提到北山下绝洞及另三十人，姓名未被编造。" },
  { key: "rongshan", title: "戎山（比干第六阶夹注地）", sourceNameForm: "戎山", confidence: "多种说法", memberKeys: ["bigan-position"], summary: "第六阶在比干名后只写戎山，页面保存这一中古神谱地理线索。" }
];

function summaryFor(row) {
  if (row.kind === "group") return `${row.title}是《真灵位业图》第六阶${row.section}第 ${row.sectionOrder} 项，只保存 ${row.count} 个席位的合称。${row.sourceNote}`;
  if (row.kind === "site") return `${row.title}列于《真灵位业图》第六阶${row.section}第 ${row.sectionOrder} 项。${row.sourceNote}`;
  if (row.sourceNote) return `${row.title}列于《真灵位业图》第六阶${row.section}第 ${row.sectionOrder} 项。${row.sourceNote}`;
  return `${row.title}列于《真灵位业图》第六阶${row.section}第 ${row.sectionOrder} 项；原文没有附加可核实的生平。`;
}

function renderFigureArticle(row) {
  const identity = row.identityNote || (row.recordNature === "官号兼人名"
    ? `页面同时保存${row.title}的姓名与官号，却不把第六阶职任倒填为其一生履历。`
    : row.recordNature === "同神异号候选"
      ? `${row.title}与近名人物分层保存；只有原典对应充分时才连接既有身份。`
      : `短名能够建立检索入口，却不能推出${row.title}未见于夹注的籍贯、师承、法器或眷属。`);
  return [
    `<p>${escapeHtml(summaryFor(row))}</p>`,
    "<h2>原名与位次</h2>",
    `<p>现用底本写作“${escapeHtml(row.sourceNameForm)}”，位于第六中位${escapeHtml(row.section)}第 ${row.sectionOrder} 项。编号只还原本段次序，不换算成后世固定品级。</p>`,
    "<h2>夹注线索</h2>",
    `<p>${escapeHtml(row.sourceNote || `本行只保存“${row.sourceNameForm}”这一写法，没有另附传记。`)}</p>`,
    "<h2>身份处理</h2>",
    `<p>${escapeHtml(identity)}</p>`,
    "<h2>创作边界</h2>",
    `<p>若作者为“${escapeHtml(row.title)}”续写形象、性格、法术或剧情，新增内容必须标为 Worldcraft Codex 原创改编。名录短句不能替代一篇古传。</p>`
  ].join("");
}

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: zhenlingSixthEntityId(row.key, worldId), worldId, type: "character", title: row.title,
    slug: `mythology-zhenling-sixth-rank-${row.key}`,
    summary: summaryFor(row), content: renderFigureArticle(row),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第六阶", row.section, row.title],
    visibility: "public", createdBy: "user-owner", updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-6"), order,
    templateId: `template:${worldId}:mythology:zhenling-catalog-entry`,
    templateData: {
      canonicalName: row.title, sourceNameForm: row.sourceNameForm, tradition: "道教", identityType: row.identityType,
      pantheonSystem: "《洞玄灵宝真灵位业图》七阶神谱", rankPosition: "第六阶 · 地仙与诸曹", seatSide: row.seatSide,
      recordNature: row.recordNature, sourceLocation: `《洞玄灵宝真灵位业图》第六中位 · ${row.section}`, historicalLayer: "魏晋六朝",
      normalizationStatus: row.identityNote ? "连接既有身份" : row.confidence === "同一性有争议" ? "独立建页" : "待更多原典消歧",
      confidence: row.confidence, editorialStatus: "初步消歧", originalAdaptation: "false"
    }
  };
}

function renderInstitutionArticle(row, mode) {
  if (mode === "tier") return [
    "<p>第六中位由中茅君主位展开，左位先列三官与罗酆神职，再进入地仙散位；右位从童初府诸曹转入更大的地仙、女真与洞室人物名单。</p>",
    "<h2>名录规模</h2><p>本阶拆出一百七十六个名录位置。六个位置连接现有身份，七项为有数无名集合或仙府仙台，其余可辨神官、地仙、女真与古史人物独立建页。</p>",
    "<h2>无名席位</h2><p>七名明晨侍郎、两名不显男真、两名不显女真、易迁宫八十三人、含真台近二百女真及北山洞中另三十人都只保留原数，不生成姓名。</p>",
    "<h2>跨阶人物</h2><p>鲍靓、左慈、郭声子、葛玄、郑隐与比干连接既有页面。第六阶只增加名位、夹注和地理关系，不覆盖这些人物的史传或后世信仰层。</p>",
    "<h2>阅读边界</h2><p>夹注中的师承、服食、山居、亲属与得道说法按本书文本层保存。缺字和成员边界不由编辑者补成统一仙传。</p>"
  ].join("");
  if (mode === "heading") return [
    `<p>${escapeHtml(row.summary)}</p>`,
    "<h2>原典位置</h2>",
    `<p>“${escapeHtml(row.sourceNameForm)}”是第六中位${escapeHtml(row.section)}的结构标记或合称说明，不是一位同名人物。</p>`,
    "<h2>成员范围</h2>",
    `<p>本页连接 ${row.memberKeys.length} 个原文名位或集合。成员仍各自保留原名、夹注与位置，分组页不替代人物页。</p>`,
    "<h2>统计方式</h2>",
    `<p>${escapeHtml(row.title)}计作一条结构记录，不重复计入已消歧人物数。没有姓名的席位继续保持匿名。</p>`,
    "<h2>创作边界</h2>",
    `<p>组织日常、共同任务与成员对白若由项目补写，必须标注 Worldcraft Codex 原创改编。</p>`
  ].join("");
  return [
    `<p>${escapeHtml(summaryFor(row))}</p>`,
    "<h2>原典写法</h2>",
    `<p>第六中位${escapeHtml(row.section)}第 ${row.sectionOrder} 项写作“${escapeHtml(row.sourceNameForm)}”，报告 ${row.count} 个席位而没有逐名。</p>`,
    "<h2>为何不拆人</h2>",
    `<p>${escapeHtml(row.sourceNote)} 人数不是姓名表，知识库不以现代序号制造占位角色。</p>`,
    "<h2>统计方式</h2>",
    `<p>${escapeHtml(row.title)}计作一项原典集合，不计作 ${row.count} 个已消歧人物；日后只有找到明确对应名单才增加成员。</p>`,
    "<h2>创作边界</h2>",
    `<p>作者可以为这一集合设计角色，但新增姓名与经历必须标注 Worldcraft Codex 原创改编。</p>`
  ].join("");
}

function buildInstitutionEntity(row, order, worldId, now, mode) {
  const isTier = mode === "tier";
  const isHeading = mode === "heading";
  return {
    id: zhenlingSixthEntityId(row.key, worldId), worldId, type: "note", title: row.title,
    slug: `mythology-zhenling-sixth-rank-${row.key}`,
    summary: row.summary || summaryFor(row), content: renderInstitutionArticle(row, mode),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第六阶", isTier ? "七阶结构" : isHeading ? "名录分组" : "合称神位", row.title],
    visibility: "public", createdBy: "user-owner", updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-6"), order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "道教", institutionKind: isTier ? "神谱阶位" : isHeading ? "神谱名录分组" : "合称神位",
      hierarchyLevel: isTier ? "第六阶 · 地仙与诸曹" : `第六阶 · ${row.section || "右位"}`,
      jurisdiction: isTier ? "保存中位、左右位、地仙散位、女真与诸曹次序" : isHeading ? "连接原典分组范围" : "只保存人数与合称，不生成无名成员",
      formationPeriod: "齐梁神谱整理层", earliestSource: "《洞玄灵宝真灵位业图》",
      sourceLocation: isTier ? "第六中位" : `第六中位 · ${row.section || "右位"}`,
      variants: isTier ? "按现用道藏本文字分段；正文与夹注分别记录。" : `原典作“${row.sourceNameForm}”。`, confidence: "明确"
    }
  };
}

function renderLocationArticle(row, isCatalogSite) {
  const memberCount = row.memberKeys?.length || row.count || 0;
  return [
    `<p>${escapeHtml(row.summary || summaryFor(row))}</p>`,
    "<h2>原典线索</h2>",
    `<p>现用底本在第六中位${isCatalogSite ? `${escapeHtml(row.section)}第 ${row.sectionOrder} 项` : "人物夹注"}写作“${escapeHtml(row.sourceNameForm)}”。页面保存原名字串与关系范围。</p>`,
    "<h2>空间性质</h2>",
    `<p>${escapeHtml(row.title)}可能是仙府、仙台、现实山岳或仙传洞室。短句不足以生成精确经纬度和完整内部布局。</p>`,
    "<h2>人数与关联</h2>",
    `<p>本页保存 ${memberCount} 项可见人数或人物关联。只写人数的部分不拆成无名角色，只写地点的部分不推定长期居住。</p>`,
    "<h2>创作边界</h2>",
    `<p>建筑格局、道路、守卫和山中事件若由项目补写，必须标注 Worldcraft Codex 原创改编。</p>`
  ].join("");
}

function buildLocationEntity(row, order, worldId, now, isCatalogSite = false) {
  return {
    id: zhenlingSixthEntityId(row.key, worldId), worldId, type: "location", title: row.title,
    slug: `mythology-zhenling-sixth-rank-${row.key}`,
    summary: row.summary || summaryFor(row), content: renderLocationArticle(row, isCatalogSite),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第六阶", isCatalogSite ? "仙府仙台" : "地仙地理", row.sourceNameForm],
    visibility: "public", createdBy: "user-owner", updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-6"), order,
    templateId: `template:${worldId}:mythology:sacred-geography`,
    templateData: {
      spaceKind: isCatalogSite ? "神话空间" : row.confidence === "大致区域" ? "存疑对应" : "神话空间",
      tradition: "道教", historicalPeriod: "齐梁神谱整理层", sourceTitle: "《洞玄灵宝真灵位业图》",
      sourceLocation: isCatalogSite ? `第六中位 · ${row.section}` : "第六中位人物夹注",
      modernCorrespondence: isCatalogSite ? "仙府仙台不对应现代地理坐标。" : "只保存传统地名；现代对应需另以地志与历史地理复核。",
      confidence: isCatalogSite ? "无法对应" : row.confidence,
      mapCaution: "现实山岳、同名地点与仙传空间分层展示，原典短句不生成精确坐标。"
    }
  };
}

function resolveRowRef(row) {
  return row.existingRef || `z6:${row.key}`;
}

function resolveRef(reference, worldId) {
  const [scope, key] = reference.split(":");
  if (scope === "z6") return zhenlingSixthEntityId(key, worldId);
  if (scope === "z3") return zhenlingThirdEntityId(key, worldId);
  if (scope === "z4") return zhenlingFourthEntityId(key, worldId);
  if (scope === "z5") return zhenlingFifthEntityId(key, worldId);
  if (scope === "zs") return zhenlingSourceId(worldId);
  if (scope === "a") return ancientEntityId(key, worldId);
  if (scope === "d") return daoismEntityId(key, worldId);
  if (scope === "cb") return celestialEntityId(key, worldId);
  if (scope === "r") return ritesEntityId(key, worldId);
  if (scope === "x") return folkEntityId(key, worldId);
  throw new Error(`未知《真灵位业图》第六阶引用：${reference}`);
}

function buildRelation({ key, sourceRef, targetRef, kind, label, direction = "directed", strength = 5, evidenceType = "primary-text", sourceCitation = "《洞玄灵宝真灵位业图》第六中位", historicalScope = "齐梁神谱整理层", confidence = "certain", notes }, worldId, now) {
  return { id: `relation:${worldId}:mythology:zhenling-sixth-rank:${key}`, worldId, sourceEntityId: resolveRef(sourceRef, worldId), targetEntityId: resolveRef(targetRef, worldId), kind, label, direction, strength, evidenceType, sourceCitation, historicalScope, confidence, notes, updatedAt: now };
}

function buildRelations(worldId, now) {
  const tierRef = "z6:sixth-rank-earth-immortals";
  const sourceRelations = [
    buildRelation({ key: "source-tier-sixth-rank", sourceRef: tierRef, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第六阶结构原典", notes: "第六中位主位、左右位、地仙散位、诸曹、女真与夹注均据现用底本整理。" }, worldId, now),
    ...positionRows.map((row) => buildRelation({ key: `source-position-${row.key}`, sourceRef: resolveRowRef(row), targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第六阶列名出处", notes: `原典以“${row.sourceNameForm}”列入第六阶${row.section}第 ${row.sectionOrder} 项；关系只证明列名与位置。` }, worldId, now)),
    ...headingRows.map((row) => buildRelation({ key: `source-heading-${row.key}`, sourceRef: `z6:${row.key}`, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第六阶结构标记出处", notes: `原典以“${row.sourceNameForm}”界定${row.title}成员范围。` }, worldId, now)),
    ...locationRows.map((row) => buildRelation({ key: `source-location-${row.key}`, sourceRef: `z6:${row.key}`, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第六阶地点夹注出处", notes: `“${row.sourceNameForm}”见于第六中位人物夹注，地点页不扩大原文范围。` }, worldId, now))
  ];
  const membershipRelations = [
    ...positionRows.map((row) => buildRelation({ key: `rank-membership-${row.key}`, sourceRef: tierRef, targetRef: resolveRowRef(row), kind: "contains", label: row.kind === "group" ? `第六阶${row.section}合称席位` : row.kind === "site" ? `第六阶${row.section}仙府仙台` : `第六阶${row.section}名位`, notes: `按现用底本收录“${row.sourceNameForm}”；神谱归属不覆盖人物其他历史层。` }, worldId, now)),
    ...headingRows.map((row) => buildRelation({ key: `rank-heading-${row.key}`, sourceRef: tierRef, targetRef: `z6:${row.key}`, kind: "contains", label: "第六阶名录分组", notes: `${row.title}保存原典结构与成员范围。` }, worldId, now)),
    ...locationRows.map((row) => buildRelation({ key: `rank-location-${row.key}`, sourceRef: tierRef, targetRef: `z6:${row.key}`, kind: "contains", label: "第六阶夹注所见地点", notes: `${row.title}由第六中位人物夹注建立。` }, worldId, now))
  ];
  const headingMemberships = headingRows.flatMap((heading) => heading.memberKeys.map((memberKey) => {
    const member = positionRows.find((row) => row.key === memberKey);
    return buildRelation({ key: `${heading.key}-member-${memberKey}`, sourceRef: `z6:${heading.key}`, targetRef: resolveRowRef(member), kind: "contains", label: `${heading.title}成员`, notes: `“${member.sourceNameForm}”由原典位置、计数或分段归入“${heading.sourceNameForm}”。` }, worldId, now);
  }));
  const explicitRelations = [
    buildRelation({ key: "zhong-mao-jun-huayang", sourceRef: "z6:zhong-mao-jun", targetRef: "d:maoshan", kind: "located", label: "夹注称治华阳洞天", notes: "华阳洞天连接既有句曲山（茅山）页，不据此猜补中茅君俗名。" }, worldId, now),
    buildRelation({ key: "bao-yuanjie-luofeng", sourceRef: "z6:bao-yuanjie", targetRef: "cb:luofeng-fengdu", kind: "located", label: "官号领罗酆右禁司", notes: "官号明确出现罗酆，关系只表示第六阶神职空间。" }, worldId, now),
    buildRelation({ key: "weng-jiang-companions", sourceRef: "z6:weng-daoyuan", targetRef: "z6:jiang-bozhen", kind: "custom", direction: "mutual", label: "夹注称二人为俦侣", notes: "俦侣表示共同修学线索，不自动解释为亲属或婚配。" }, worldId, now),
    buildRelation({ key: "guo-shengzi-follows-ge-xuan", sourceRef: "d:ge-xuan", targetRef: "z4:guo-shengzi", kind: "teacher", label: "夹注称郭声子常随葛玄", confidence: "probable", notes: "“常相随”不足以证明正式授箓，先按师承网络保存。" }, worldId, now),
    buildRelation({ key: "huang-ziyang-follows-ge-xuan", sourceRef: "d:ge-xuan", targetRef: "z6:huang-ziyang", kind: "teacher", label: "夹注称黄子阳常随葛玄", confidence: "probable", notes: "“常相随”不足以证明所有法脉均由葛玄传授。" }, worldId, now),
    buildRelation({ key: "ge-xuan-teaches-zheng-yin", sourceRef: "d:ge-xuan", targetRef: "d:zheng-yin", kind: "teacher", label: "第六阶夹注明称郑思远为葛玄弟子", notes: "为既有葛玄—郑隐师承增加《真灵位业图》证据。" }, worldId, now),
    buildRelation({ key: "dai-meng-teaches-xie-yun", sourceRef: "z6:dai-meng", targetRef: "z6:xie-yun", kind: "teacher", label: "夹注称谢允为戴孟弟子", notes: "关系限定于第六阶夹注层。" }, worldId, now),
    buildRelation({ key: "confucius-teaches-shi-cun", sourceRef: "r:confucius", targetRef: "z6:shi-cun", kind: "teacher", label: "夹注把施存列入孔子弟子得道说", confidence: "disputed", notes: "这是中古仙谱的接受说法，不改写早期孔门弟子名录。" }, worldId, now),
    buildRelation({ key: "zhang-zhou-sushu", sourceRef: "z6:zhang-zhaoqi", targetRef: "z6:zhou-jun-sixth", kind: "custom", direction: "mutual", label: "同读《素书》七卷得道", notes: "关系不据短名推断两人其他经历。" }, worldId, now),
    buildRelation({ key: "zhou-jun-cross-rank-disputed", sourceRef: "z6:zhou-jun-sixth", targetRef: "z4:zhou-jun", kind: "disputed", label: "第四阶与第六阶周君同一性待考", strength: 2, evidenceType: "scholarly-inference", confidence: "disputed", notes: "两处都只保存短称周君，位次与夹注不同，不能只按名字合页。" }, worldId, now),
    ...["bao-shuyang", "wang-yangbo", "duan-jizheng", "liu-weihui"].map((key) => buildRelation({ key: `xiling-zidu-teaches-${key}`, sourceRef: "z3:xiling-zidu", targetRef: `z6:${key}`, kind: "teacher", label: "夹注称四人为西灵子都弟子", notes: "四人由同一夹注归入西灵子都门下。" }, worldId, now)),
    buildRelation({ key: "song-laizi-meets-feng-yanshou", sourceRef: "z6:song-laizi", targetRef: "z4:feng-yanshou", kind: "custom", label: "夹注称宋来子遇冯延寿", notes: "只记录相遇，不推定长期师承。" }, worldId, now),
    buildRelation({ key: "jiang-teaches-zhi", sourceRef: "z6:jiang-xiansheng", targetRef: "z6:zhi-ziyuan", kind: "teacher", label: "夹注称将先生为支子元师", notes: "短称将先生仍保留身份待考。" }, worldId, now),
    buildRelation({ key: "diao-teaches-long", sourceRef: "z6:diao-daolin", targetRef: "z6:long-bogao", kind: "teacher", label: "夹注称刁道林为龙伯高师", notes: "龙伯高稍后在同一右位散位中单列。" }, worldId, now),
    buildRelation({ key: "wang-shilong-teaches-xu-mai", sourceRef: "z6:wang-shilong", targetRef: "z6:xu-mai", kind: "teacher", label: "夹注称王世龙为许远游师", notes: "许远游即本阶许迈夹注所记改名。" }, worldId, now),
    buildRelation({ key: "zhao-daoxuan-xu-mai", sourceRef: "z6:zhao-daoxuan", targetRef: "z6:xu-mai", kind: "custom", label: "夹注称赵道玄为许远游之交", notes: "“交”只按交游关系保存。" }, worldId, now),
    buildRelation({ key: "fu-taichu-xu-mai", sourceRef: "z6:fu-taichu", targetRef: "z6:xu-mai", kind: "custom", label: "夹注称傅太初为许远游之交", notes: "“交”只按交游关系保存。" }, worldId, now),
    buildRelation({ key: "gong-youjie-xu-mai", sourceRef: "z6:gong-youjie", targetRef: "z6:xu-mai", kind: "custom", label: "夹注称龚幼节为许远游代对者", confidence: "probable", notes: "代对含义按原词保存，不扩写具体职务。" }, worldId, now),
    buildRelation({ key: "li-kailin-xu-mai", sourceRef: "z6:li-kailin", targetRef: "z6:xu-mai", kind: "custom", label: "夹注称李开林为许远游代对者", confidence: "probable", notes: "代对含义按原词保存，不扩写具体职务。" }, worldId, now),
    buildRelation({ key: "bao-jing-sibling", sourceRef: "d:bao-jing", targetRef: "z6:bao-jing-sister", kind: "family", label: "原典以鲍靓妹列名", notes: "没有姓名与其他家族资料时，只保存兄妹称谓。" }, worldId, now),
    ...locationRows.flatMap((row) => row.memberKeys.map((memberKey) => {
      const member = positionRows.find((item) => item.key === memberKey);
      return buildRelation({ key: `${memberKey}-located-${row.key}`, sourceRef: resolveRowRef(member), targetRef: `z6:${row.key}`, kind: "located", label: `夹注记“${row.sourceNameForm}”`, notes: "地点关系只保存第六中位夹注，不推定精确洞府或长期居住。" }, worldId, now);
    })),
    buildRelation({ key: "zheng-yin-kuocang", sourceRef: "d:zheng-yin", targetRef: "z5:kuocangshan", kind: "located", label: "夹注称永昌元年入括苍山", notes: "连接第五阶已建括苍山页；纪年只按本书夹注保存。" }, worldId, now),
    ...["liu-shaoweng", "deng-yunshan", "tang-lan"].map((key) => buildRelation({ key: `${key}-huashan`, sourceRef: `z6:${key}`, targetRef: "z5:huashan", kind: "located", label: "第六阶夹注所见华山", notes: "只保存山名关联，不推定同处同一洞府。" }, worldId, now)),
    buildRelation({ key: "shi-sheng-east-sea", sourceRef: "z6:shi-sheng", targetRef: "a:east-sea", kind: "located", label: "夹注称入东海为始皇使", notes: "连接既有东海神话空间页，不生成航线与年代。" }, worldId, now),
    ...["guo-zihua", "zhao-shukui", "zhang-jilian"].map((key) => buildRelation({ key: `${key}-huoshan`, sourceRef: `z6:${key}`, targetRef: "z5:huoshan", kind: "located", label: "夹注称三人在霍山", notes: "三人共享同一地点夹注。" }, worldId, now)),
    buildRelation({ key: "zhao-gongcheng-heming", sourceRef: "z6:zhao-gongcheng", targetRef: "d:heming-mountain", kind: "located", label: "夹注记鹤鸣山", notes: "连接既有鹤鸣山页，不补活动细节。" }, worldId, now)
  ];
  return [...sourceRelations, ...membershipRelations, ...headingMemberships, ...explicitRelations];
}

function buildTimelineEvents(worldId, now) {
  const event = (key, entityRef, trackKey, title, summary, sortOrder, era, references) => ({
    id: `timeline-event:${worldId}:mythology:zhenling-sixth-rank:${key}`, worldId, entityId: resolveRef(entityRef, worldId), questId: "", sceneId: "",
    references: references.map((reference) => ({ kind: "entity", id: resolveRef(reference, worldId) })), trackId: trackId(trackKey, worldId),
    title, summary, displayDate: "约五世纪末至六世纪前半", datePrecision: "range", sortOrder, startValue: "499", endValue: "536", era, dependencyIds: [], updatedAt: now
  });
  return [
    event("sixth-rank-compiled", "z6:sixth-rank-earth-immortals", "textual-evidence", "第六中位形成地仙与诸曹大型名录", "一百七十六个名录位置把三官神职、地仙散位、男女真、鬼帅与洞室人物放入同一阶。", 538, "齐梁神谱整理层", ["z6:sixth-rank-earth-immortals", "zs:zhenling-weiye-tu"]),
    event("sixth-rank-annotations", "z6:xu-mai", "textual-evidence", "第六阶夹注保存密集人名、师承与地理线索", "字、籍贯、师承、服食、得道年号和山名与正文列名并存，缺字与短名仍保留复核状态。", 539, "齐梁名录夹注层", ["z6:xu-mai", "d:ge-xuan", "d:zheng-yin", "zs:zhenling-weiye-tu"]),
    event("earth-immortal-ranks", "z6:left-earth-immortals", "religious-institutions", "第六阶以左右地仙散位扩展低阶仙班", "左右两侧散位容纳大量尚无固定官号或另附山居线索的人物，散位不被误写成单一官署。", 540, "齐梁地仙名位层", ["z6:left-earth-immortals", "z6:right-earth-immortals", "z6:sixth-rank-earth-immortals"]),
    event("tongchu-offices", "z6:four-assistants", "religious-institutions", "童初府丞与明晨侍郎形成诸曹分组", "四丞各有职掌，七名明晨侍郎只存人数；监官与武解鬼帅又形成另外两组职任。", 541, "齐梁童初府诸曹层", ["z6:four-assistants", "z6:mingchen-seven", "z6:two-supervisors", "z6:four-ghost-marshals"]),
    event("male-female-registers", "z6:female-immortals-section", "religious-institutions", "男真、女真与仙府人数被分组保存", "三男真、四女真、易迁宫八十三人和含真台近二百女真按原数保留，未显姓名者不生成占位人物。", 542, "齐梁仙籍分组层", ["z6:three-male-immortals", "z6:four-female-immortals", "z6:yiqian-gong", "z6:hanzhen-tai", "z6:female-immortals-section"]),
    event("historical-adepts-sixth", "d:ge-xuan", "cult-evolution", "左慈、葛玄、郑隐与鲍靓进入第六阶地仙网络", "史传与道教传承人物通过跨阶名位、师承和山居夹注进入第六阶，人物史与仙谱层继续分栏。", 543, "中古道教人物神格化层", ["d:zuo-ci", "d:ge-xuan", "d:zheng-yin", "d:bao-jing"]),
    event("ancient-figures-sixth", "x:bigan-caishen", "cult-evolution", "比干、务光与孔门得道说进入第六阶", "古史人物和孔门人物被重新放入地仙名录，相关说法只标为中古接受层。", 544, "中古古史人物仙化层", ["x:bigan-caishen", "z6:wu-guang", "z6:shi-cun", "r:confucius"]),
    event("sixth-rank-geography", "z6:zhongyue-songgao", "cult-evolution", "第六阶夹注展开山岳与洞室修真地理网", "中岳、括苍、华山、霍山、盖竹山、鹿迹洞、北山绝洞等地点通过人物夹注相连，现实与仙传空间分层展示。", 545, "中古仙传地理层", ["z6:zhongyue-songgao", "z6:gaizhushan", "z6:lujidong", "z5:huoshan"])
  ];
}

function assertBatchShape() {
  const figures = positionRows.filter((row) => row.kind === "figure");
  const groups = positionRows.filter((row) => row.kind === "group");
  const sites = positionRows.filter((row) => row.kind === "site");
  const reused = figures.filter((row) => row.existingRef);
  if (mainRows.length !== 1) throw new Error(`${BATCH_LABEL}中位项目应为 1，实际为 ${mainRows.length}`);
  if (leftRows.length !== 61) throw new Error(`${BATCH_LABEL}左位项目应为 61，实际为 ${leftRows.length}`);
  if (rightRows.length !== 114) throw new Error(`${BATCH_LABEL}右位项目应为 114，实际为 ${rightRows.length}`);
  if (positionRows.length !== 176) throw new Error(`${BATCH_LABEL}名录项目应为 176，实际为 ${positionRows.length}`);
  if (figures.length !== 169) throw new Error(`${BATCH_LABEL}可辨人物或称号应为 169，实际为 ${figures.length}`);
  if (groups.length !== 3) throw new Error(`${BATCH_LABEL}合称席位应为 3，实际为 ${groups.length}`);
  if (sites.length !== 4) throw new Error(`${BATCH_LABEL}仙府仙台应为 4，实际为 ${sites.length}`);
  if (reused.length !== 6) throw new Error(`${BATCH_LABEL}连接既有身份应为 6，实际为 ${reused.length}`);
  if (headingRows.length !== 9) throw new Error(`${BATCH_LABEL}结构分组应为 9，实际为 ${headingRows.length}`);
  if (locationRows.length !== 11) throw new Error(`${BATCH_LABEL}地点索引应为 11，实际为 ${locationRows.length}`);
  if (new Set(positionRows.map((row) => row.key)).size !== positionRows.length) throw new Error(`${BATCH_LABEL}名位键重复`);
  if (new Set(positionRows.map((row) => row.sourceNameForm)).size !== positionRows.length) throw new Error(`${BATCH_LABEL}原典名号重复`);
  for (const heading of headingRows) if (heading.memberKeys.some((key) => !positionRows.some((row) => row.key === key))) throw new Error(`${heading.title}含未知成员`);
}

function buildZhenlingSixthRankBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const newFigureRows = positionRows.filter((row) => row.kind === "figure" && !row.existingRef);
  const groupRows = positionRows.filter((row) => row.kind === "group");
  const siteRows = positionRows.filter((row) => row.kind === "site");
  const figures = newFigureRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const tier = buildInstitutionEntity({ key: "sixth-rank-earth-immortals", title: "《真灵位业图》第六阶（地仙与诸曹）", sourceNameForm: "第六中位", section: "中位", summary: "中茅君所主的第六阶，共拆出一百七十六个名录位置，并保存地仙散位、诸曹、男女真与仙府人数。" }, figures.length, worldId, now, "tier");
  const groups = groupRows.map((row, index) => buildInstitutionEntity(row, figures.length + 1 + index, worldId, now, "group"));
  const headings = headingRows.map((row, index) => buildInstitutionEntity(row, figures.length + groups.length + 1 + index, worldId, now, "heading"));
  const catalogSites = siteRows.map((row, index) => buildLocationEntity(row, figures.length + groups.length + headings.length + 1 + index, worldId, now, true));
  const locations = locationRows.map((row, index) => buildLocationEntity(row, figures.length + groups.length + headings.length + catalogSites.length + 1 + index, worldId, now, false));
  return {
    key: BATCH_KEY, label: BATCH_LABEL,
    entities: [...figures, tier, ...groups, ...headings, ...catalogSites, ...locations],
    figures, institutions: [tier, ...groups, ...headings], locations: [...catalogSites, ...locations], sources: [],
    catalogPositions: positionRows.map((row) => ({ ...row, ref: resolveRowRef(row) })),
    relations: buildRelations(worldId, now), timelineEvents: buildTimelineEvents(worldId, now),
    featuredEntityIds: [tier.id, zhenlingSixthEntityId("xu-mai", worldId), zhenlingSixthEntityId("four-ghost-marshals", worldId), zhenlingSixthEntityId("zhongyue-songgao", worldId)]
  };
}

module.exports = { BATCH_KEY, BATCH_LABEL, buildZhenlingSixthRankBatch, zhenlingSixthEntityId };
