const {
  WORLD_ID,
  categoryId
} = require("./chinese-mythology-history-data.cjs");
const {
  ancientEntityId
} = require("./chinese-mythology-ancient-core-data.cjs");
const {
  natureEntityId
} = require("./chinese-mythology-nature-pantheon-data.cjs");
const {
  daoismEntityId
} = require("./chinese-mythology-daoism-early-data.cjs");
const {
  zhenlingSourceId,
  trackId
} = require("./chinese-mythology-zhenling-first-rank-data.cjs");

const BATCH_KEY = "zhenling-weiye-second-rank-13";
const BATCH_LABEL = "道教神谱扩展 · 《真灵位业图》第二阶";

function zhenlingSecondEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:zhenling-weiye:second-rank:${key}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function f(key, title, sourceNameForm, identityType = "名录身份待考", sourceNote = "", options = {}) {
  return {
    key,
    title,
    sourceNameForm,
    identityType,
    sourceNote,
    recordNature: options.recordNature || (
      identityType === "历史人物神格" ? "官号兼人名"
        : identityType === "仙真" ? "单列人名"
          : identityType === "神官" ? "仅见名录"
            : "仅见名录"
    ),
    existingRef: options.existingRef || "",
    identityNote: options.identityNote || "",
    confidence: options.confidence || "原典明确列名"
  };
}

function withSection(rows, seatSide, section) {
  return rows.map((row, index) => ({
    ...row,
    seatSide,
    section,
    sectionOrder: index + 1
  }));
}

const mainRows = withSection([
  f(
    "main-taishang-yuchen-xuanhuang-dadaojun",
    "太上大道君",
    "上清高聖太上玉晨玄皇大道君",
    "神祇",
    "原注称其为万道之主。",
    {
      existingRef: "d:taishang-dadaojun",
      recordNature: "同神异号候选",
      identityNote: "完整尊号连接现有太上大道君页，同时保留第二阶原名，不再另造一个同名神格。"
    }
  )
], "中位", "中位");

const leftRows = withSection([
  f("zuosheng-zichen-taiwei-tiandi-daojun", "左圣紫晨太微天帝道君", "左聖紫晨太微天帝道君", "神祇"),
  f("chisongzi", "赤松子", "左聖南極南嶽真人左仙公太虚真人赤松子", "仙真", "原注称其为黄老君弟子、清灵真人裴君之师。", { recordNature: "官号兼人名", identityNote: "与后世部分雨师传统只建立争议比较，不直接合并。" }),
  f("wang-fangping", "王方平", "左輔後聖上宰西域西極真人總真君", "历史人物神格", "原注称其姓王，讳远，字方平；为紫阳君弟子、司命茅君之师。", { recordNature: "官号兼人名" }),
  f("ziqing-taisu-gaoxu-dongyao-daojun", "紫清太素高虚洞曜道君", "紫清太素高虚洞曜道君", "神祇"),
  f("taixu-shangxiao-feichen-zhongyang-daojun", "太虚上霄飞晨中央道君", "太虚上霄飛晨中央道君", "神祇", "原注以“赤松”二字提示其称号或传承线索，但未明说是否就是赤松子。", { identityNote: "暂不与赤松子合并，等待同卷异文或其他道经证明。", confidence: "身份待考" }),
  f("taiwei-dongxia-fusang-danlin-dadi-shangdaojun", "太微东霞扶桑丹林大帝上道君", "太微東霞扶桑丹林大帝上道君", "神祇"),
  f("housheng-taishi-taiwei-zuozhen-baohuang-daojun", "后圣太师太微左真保皇道君", "後聖太師太微左真保皇道君", "神祇"),
  f("ziming-taiwei-jiudao-gaoyuan-yuchen-daojun", "紫明太微九道高元玉晨道君", "紫明太微九道高元玉晨道君", "神祇"),
  f("ziyuan-taiwei-basu-sanyuan-xuanchen-daojun", "紫元太微八素三元玄晨道君", "紫元太微八素三元玄晨道君", "神祇"),
  f("jiuwei-taizhen-yubaowang-jinque-shangxiang-dasiming-gaochenshi", "九微太真玉保王金阙上相大司命高晨师", "九微太真玉保王金闕上相大司命高晨師", "神官"),
  f("qingtong-jun-position", "青童君", "東海王青華小童君", "神官", "该名号与上清材料中的青童君相合。", { existingRef: "d:qingtong-jun", recordNature: "同神异号候选", identityNote: "连接现有青童君页，原典长号保留在名录关系中。" }),
  f("xue-jun", "薛君（长里先生）", "領九宫上相長里先生薛君", "仙真", "原注称其周代得道，并记作许长史前缘之兄。", { recordNature: "官号兼人名" }),
  f("yan-jun", "燕君（希林真人）", "太微右真公領九宫上相希林真人燕君", "仙真", "原注讨论其所受名位以及由王君替代的情况，显示传本编次本身已有疑问。", { recordNature: "官号兼人名", confidence: "身份待考" }),
  f("mao-ying", "茅盈", "司命東嶽上真卿太元真人茅君", "历史人物神格", "原注称其为大茅君，讳盈，字叔申。", { recordNature: "官号兼人名" }),
  f("xu-mi-position", "许谧", "左卿仙侯真君許君", "历史人物神格", "原注称其讳穆，曾任晋护军长史，受业于南岳夫人，后退居句曲山。", { existingRef: "d:xu-mi", recordNature: "官号兼人名", identityNote: "讳名、官历和师承均与现有许谧页相合。" }),
  f("guo-shigan", "郭世干", "侍帝晨青蓋真人郭君", "历史人物神格", "原注记名世干。", { recordNature: "官号兼人名" }),
  f("zhou-yishan", "周义山", "紫陽左真人周君", "历史人物神格", "原注记名义山。", { recordNature: "官号兼人名" }),
  f("pei-jun", "裴君（清灵真人）", "清靈真人裴君", "仙真", "原注称其为汉代右扶风人，于汉时得道。", { recordNature: "官号兼人名" }),
  f("lingfei-taizhen-taishang-dafu", "灵飞太真太上大夫", "靈飛太真太上大夫", "神官"),
  f("yang-xi-position", "杨羲", "侍帝晨東華上佐司命楊君", "历史人物神格", "名录以“杨君”列入东华上佐司命位。", { existingRef: "d:yang-xi", recordNature: "官号兼人名", identityNote: "结合上清降授人物圈与现有别名，连接杨羲页；关系可信度标为较高而非绝对。" }),
  f("shi-shumen", "石叔门", "恊晨大夫石叔門", "仙真", "名录保留完整人名石叔门。", { recordNature: "官号兼人名" }),
  f("yang-ziming", "杨子明", "正一羽晨侯公楊子明", "仙真", "名录保留完整人名杨子明。", { recordNature: "官号兼人名" }),
  f("xuanzhou-zhuxian-daojun-taishang-gongzi", "玄洲主仙道君太上公子", "玄洲主仙道君太上公子", "神官", "原注称其姓勤，主掌关奏仙名。", { recordNature: "官号兼人名" }),
  f("jingming-xianbo-taibao-zhenren", "经命仙伯太保真人", "經命仙伯太保真人", "神官"),
  f("gu-jun", "谷君（八玄仙伯）", "八玄仙伯右仙公谷君", "仙真", "原典只保留谷氏称呼和官号。", { recordNature: "官号兼人名" }),
  f("xi-weixuan", "郄伟玄", "正一左玄執蓋郎郄偉玄", "仙真", "名录保留完整人名郄伟玄。", { recordNature: "官号兼人名" }),
  f("meng-liuqi", "孟六奇", "繡衣使者孟六奇", "神官", "名录保留完整人名孟六奇。", { recordNature: "官号兼人名" }),
  f("qiu-wenjian", "裘文坚", "太素宫官保禁仙郎裘文堅", "神官", "名录保留完整人名裘文坚。", { recordNature: "官号兼人名" }),
  f("zuoyang-wang", "左杨王", "左楊王", "名录身份待考", "原典与华仲戒连续列名，但没有说明二者关系。", { recordNature: "单列人名" }),
  f("hua-zhongjie", "华仲戒", "華仲戒", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("xi-linzao", "西林藻", "繡衣使者西林藻", "神官", "名录保留完整人名西林藻。", { recordNature: "官号兼人名" }),
  f("zhao-yueluo", "赵约罗", "右嬪之姬趙約羅", "仙真", "“右嫔之姬”是原名号的一部分，现本没有说明她所侍奉的具体对象。", { recordNature: "官号兼人名", confidence: "身份待考" }),
  f("guan-changtiao", "管长条", "三天左官直御史管長條", "神官", "名录保留完整人名管长条。", { recordNature: "官号兼人名" })
], "左位", "左位");

const rightRows = withSection([
  f("yousheng-jinque-dichen-housheng-xuanyuan-daojun", "右圣金阙帝晨后圣玄元道君", "右聖金闕帝晨後聖玄元道君", "神祇", "原注说壬辰运当下生，属于名录自己的未来降生表述。"),
  f("wang-jin", "王晋（桐柏真人）", "右輔侍帝晨領五嶽司命右弼桐柏真人金庭宫王君", "历史人物神格", "原注称其讳晋，为灵王太子，并承担下教之职。", { recordNature: "官号兼人名" }),
  f("wang-bao-position", "王褒（清虚真人）", "右輔小有洞天太素清虚真人四司三元右保公王君", "历史人物神格", "原注称其讳褒，为魏夫人之师。", { existingRef: "d:wang-bao-qingxu", recordNature: "官号兼人名", identityNote: "讳名、清虚真人称号与师承均指向现有王褒页。" }),
  f("xu-hui-position", "许翙", "侍帝晨右仙公許君", "历史人物神格", "原注说明这位许君是许长史之子，讳翙。", { existingRef: "d:xu-hui", recordNature: "官号兼人名", identityNote: "父子关系和讳名均与现有许翙页相合。" }),
  f("xuanzhou-xiandu-taishang-zhangren", "玄洲仙都太上丈人", "玄洲仙都太上丈人", "神官", "原注记其治所为玄洲紫桂宫。"),
  f("li-fei", "李飞（太保玉郎）", "太保玉郎李君", "仙真", "原注记名飞。", { recordNature: "官号兼人名" }),
  f("yuchen-lang", "玉晨郎（九宫太傅）", "侍帝晨觀大夫九宫太傅玉晨郎", "神官"),
  f("fan-yao", "范遥", "北牖弟子中候仙人", "历史人物神格", "原注称其姓范，讳遥，字度世，曾名永；汉桓帝时任侍郎，并撰有魏夫人传。", { recordNature: "官号兼人名" })
], "右位", "右位");

const femaleRows = withSection([
  f("ziwei-yuanling-baiyu-guitai-jiuling-taizhen-yuanjun", "紫微元灵白玉龟台九灵太真元君", "紫微元靈白玉龜臺九靈太真元君", "神祇"),
  f("wei-huacun-position", "魏华存", "紫虚元君領上真司命南嶽魏夫人", "历史人物神格", "原名号明确写作南岳魏夫人。", { existingRef: "d:wei-huacun", recordNature: "官号兼人名", identityNote: "连接现有魏华存页，保留紫虚元君与领上真司命长号。" }),
  f("jiang-furen", "蒋夫人（八灵道母）", "八靈道母西嶽蔣夫人", "仙真", "原典只给出蒋氏与八灵道母、西岳名号。", { recordNature: "官号兼人名" }),
  f("beihai-liuwei-xuanqing-furen", "北海六微玄清夫人", "北海六微玄清夫人", "仙真"),
  f("shangzhen-donggong-wei-furen", "上真东宫卫夫人", "上真東宫衛夫人", "仙真", "原典只给出卫氏称呼与东宫名位。", { recordNature: "官号兼人名" }),
  f("beihan-qiling-shi-furen", "北汉七灵石夫人", "北漢七靈石夫人", "仙真", "原典只给出石氏称呼与北汉七灵名位。", { recordNature: "官号兼人名" }),
  f("an-fei-jiuhua", "安妃（九华真妃）", "紫清上宫九華真妃", "历史人物神格", "原注称其姓安，并记晋代曾降于茅山。", { recordNature: "官号兼人名" }),
  f("zixu-zuogong-guo-furen", "紫虚左宫郭夫人", "紫虚左宫郭夫人", "仙真", "原典只给出郭氏称呼与左宫名位。", { recordNature: "官号兼人名" }),
  f("taiji-zhonghua-shi-furen", "太极中华石夫人", "太極中華石夫人", "仙真", "原典只给出石氏称呼与太极中华名位。", { recordNature: "官号兼人名" }),
  f("taizhen-wang-furen", "太真王夫人", "太真王夫人", "仙真", "原典只给出王氏称呼与太真名位。", { recordNature: "官号兼人名" }),
  f("canglang-yunlin-youying-wang-furen", "沧浪云林右英王夫人", "滄浪雲林右英王夫人", "仙真", "原典只给出王氏称呼与右英名位。", { recordNature: "官号兼人名" }),
  f("zhuling-beijuetai-shangpin-guanfei", "朱陵北绝台上嫔管妃", "朱陵北絶臺上嬪管妃", "神官", "管妃的上嫔称号和朱陵北绝台位置均见于原名。", { recordNature: "官号兼人名" }),
  f("fangzhangtai-zhaoling-li-furen", "方丈台昭灵李夫人", "方丈臺昭靈李夫人", "仙真", "原典只给出李氏称呼与方丈台名位。", { recordNature: "官号兼人名" }),
  f("beiyue-shangzhen-shan-furen", "北岳上真山夫人", "北嶽上真山夫人", "仙真", "“山夫人”按现本连读；山是姓氏、名号构件还是地理称呼仍待校。", { confidence: "字形待校" }),
  f("qionghua-furen", "琼华夫人", "瓊華夫人", "仙真"),
  f("sanyuan-feng-furen", "三元冯夫人", "三元馮夫人", "仙真", "原典只给出冯氏称呼与三元名位。", { recordNature: "官号兼人名" }),
  f("youhua-jiucheng-fan-furen", "右华九成范夫人", "右華九成范夫人", "仙真", "原典只给出范氏称呼与右华九成名位。", { recordNature: "官号兼人名" }),
  f("wang-qinge", "王清娥", "紫微左宫王夫人", "仙真", "原注称其讳清娥，字愈音，为阿母第二十六女。", { recordNature: "官号兼人名" }),
  f("changling-du-furen", "长陵杜夫人", "長陵杜夫人", "仙真", "原典只给出杜氏称呼与长陵名位。", { recordNature: "官号兼人名" }),
  f("taiwei-xuanqing-zuo-furen", "太微玄清左夫人", "太微玄清左夫人", "仙真"),
  f("youyang-wang-huazhong-feiji", "右阳王华仲飞姬", "右陽王華仲飛姬", "仙真", "原名断句与人名结构仍有讨论空间，当前按现本整条保留。", { confidence: "字形待校" }),
  f("zhen-youxiao", "甄幽萧", "西華靈妃甄幽蕭", "仙真", "原典保留完整人名甄幽萧。", { recordNature: "官号兼人名" }),
  f("ziyuan-furen", "紫元夫人", "後聖上保南極元君紫元夫人", "神官"),
  f("housheng-shangfu-taisu-yuanjun", "后圣上傅太素元君", "後聖上傅太素元君", "神官"),
  f("chun-wenqi", "淳文期", "東華玉妃淳文期", "仙真", "原注称其为青童君之妹。", { recordNature: "官号兼人名" }),
  f("donggong-zhonghou-wang-furen", "东宫中候王夫人", "東宫中候王夫人", "仙真", "原注称其为桐柏真人王晋的异母妹。", { recordNature: "官号兼人名" }),
  f("taihe-shangzhen-zuo-furen", "太和上真左夫人", "太和上真左夫人", "仙真"),
  f("xihan-furen", "西汉夫人", "西漢夫人", "仙真", "“西汉”在这里是名号构件还是时代提示，原文没有解释。", { confidence: "身份待考" }),
  f("huashan-furen", "华山夫人", "華山夫人", "仙真", "原典没有说明她与现实华山祭祀的具体对应。", { confidence: "身份待考" }),
  f("fang-su", "房素", "玉清神女房素", "仙真", "原典保留完整人名房素。", { recordNature: "官号兼人名" }),
  f("wang-shanghua", "王上华", "西王母侍女王上華", "仙真", "原名明确称其为西王母侍女。", { recordNature: "官号兼人名" }),
  f("dong-shuangcheng", "董双成", "董雙成", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("shi-gongzi", "石公子", "石公子", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("yuan-jueqing", "苑绝青", "苑絶青", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("di-chengjun", "地成君", "地成君", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("guo-mixiang", "郭密香", "郭密香", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("gan-ruobin", "干若宾", "干若賓", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("li-fangming", "李方明", "李方明", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("zhang-lingzi", "张灵子", "張靈子", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" })
], "女真位", "女真位");

const taidiOfficialRows = withSection([
  f("linglin-yunv", "灵林玉女", "靈林玉女", "神官"),
  f("jia-quting", "贾屈庭", "賈屈庭", "神官", "太帝宫官分组中以短名列出。", { recordNature: "单列人名" })
], "女真位", "太帝宫官");

const jinqueOfficialRows = withSection([
  f("fan-faan", "范法安", "太保侯范法安", "神官", "名录保留完整人名范法安。", { recordNature: "官号兼人名" }),
  f("ya-shuping", "牙叔平", "經命仙伯牙叔平", "神官", "名录保留完整人名牙叔平。", { recordNature: "官号兼人名" }),
  f("yan-jingzhu", "烟景珠", "東華宫玉女煙景珠", "神官", "名录保留完整人名烟景珠。", { recordNature: "官号兼人名" }),
  f("song-pifei", "宋辟非", "上元夫人侍女宋辟非", "神官", "原名明确称其为上元夫人侍女。", { recordNature: "官号兼人名" }),
  f("fan-yunhua", "范运华", "主仙道君侍女范運華", "神官", "原名明确称其为主仙道君侍女。", { recordNature: "官号兼人名" }),
  f("zhao-junzhu", "赵峻珠", "趙峻珠", "神官", "金阙宫官分组中以短名列出。", { recordNature: "单列人名" }),
  f("wang-baoyi", "王抱一", "王抱一", "神官", "金阙宫官分组中以短名列出。", { recordNature: "单列人名" }),
  f("hua-jingdi", "华敬涤", "華敬滌", "神官", "金阙宫官分组中以短名列出。", { recordNature: "单列人名" }),
  f("li-boyi", "李伯益", "李伯益", "神官", "金阙宫官分组中以短名列出。", { recordNature: "单列人名" }),
  f("xianyu-lingjin", "鲜于灵金", "鮮于靈金", "神官", "金阙宫官分组中以短名列出。", { recordNature: "单列人名" })
], "女真位", "金阙宫官");

const catalogRows = [
  ...mainRows,
  ...leftRows,
  ...rightRows,
  ...femaleRows,
  ...taidiOfficialRows,
  ...jinqueOfficialRows
];

const institutionRows = [
  {
    key: "taidi-palace-officials",
    title: "太帝宫官（第二阶名录分组）",
    sourceNameForm: "太帝宫官",
    memberKeys: taidiOfficialRows.map((row) => row.key),
    summary: "第二阶女真位后段的一处宫官分组，现存正文在标题下列出灵林玉女与贾屈庭。"
  },
  {
    key: "jinque-palace-officials",
    title: "金阙宫官（第二阶名录分组）",
    sourceNameForm: "金闕宫官",
    memberKeys: jinqueOfficialRows.map((row) => row.key),
    summary: "第二阶末段的宫官分组，从范法安至鲜于灵金共列十个可辨名位。"
  }
];

const locationRows = [
  { key: "yiyu-palace", title: "逸域宫", sourceNameForm: "逸域宫", seatSide: "左位" },
  { key: "bajing-city", title: "八景城", sourceNameForm: "八景城", seatSide: "左位" },
  { key: "qiling-platform", title: "七灵台", sourceNameForm: "七靈臺", seatSide: "左位" },
  { key: "fengtai-qiongque", title: "凤台琼阙", sourceNameForm: "鳳臺瓊闕", seatSide: "左位" },
  { key: "jinchen-huaque", title: "金晨华阙", sourceNameForm: "金晨華闕", seatSide: "左位" },
  { key: "taihe-hall", title: "太和殿", sourceNameForm: "太和殿", seatSide: "女真位" },
  { key: "liaoyang-hall", title: "寥阳殿", sourceNameForm: "寥陽殿", seatSide: "女真位" },
  { key: "ruizhu-que", title: "蕊珠阙", sourceNameForm: "蕊珠闕", seatSide: "女真位" },
  { key: "qiying-room", title: "七映房", sourceNameForm: "七映房", seatSide: "女真位" },
  { key: "changmian-tower", title: "长绵楼", sourceNameForm: "長綿樓", seatSide: "女真位" }
];

function rowSummary(row) {
  if (row.sourceNote) {
    return `${row.title}列于《真灵位业图》第二阶${row.section}第 ${row.sectionOrder} 项。${row.sourceNote}`;
  }
  const descriptions = {
    中位: "作为这一阶的主位出现",
    左位: "位于上清境左位的连续名录中",
    右位: "位于上清境右位的连续名录中",
    女真位: row.section === "女真位" ? "列入第二阶女真位" : `列入第二阶女真位下的${row.section}分组`
  };
  return `${row.title}${descriptions[row.seatSide]}；现存这一条只给出名号与次序，没有足够材料补成完整生平。`;
}

function renderFigureArticle(row) {
  const clue = row.sourceNote
    ? row.sourceNote
    : `本行没有附传、籍贯或师承。能确定的是“${row.sourceNameForm}”这个完整字串，以及它在${row.section}中的相对位置。`;
  const identity = row.identityNote || (
    row.recordNature === "官号兼人名"
      ? `页面把可辨人名与官号放在一起保存，但不因一条长尊号就推定${row.title}在所有时代都使用同一神职。`
      : row.recordNature === "单列人名"
        ? `短名可以支持独立检索，却不能单凭姓名补出籍贯、年代或传法经历；${row.title}暂按本书中的名录身份管理。`
        : `名号中的宫位、方位和职称先按原文保留。没有同名经句互证前，${row.title}不与其他相似称号自动合并。`
  );
  return [
    `<p>${escapeHtml(rowSummary(row))}</p>`,
    "<h2>名号与位次</h2>",
    `<p>现用底本写作“${escapeHtml(row.sourceNameForm)}”，在第二中位的${escapeHtml(row.section)}中排第 ${row.sectionOrder} 项。这里的编号只描述本段次序，不代表后世道观沿用的永久品秩。</p>`,
    "<h2>原典留下的线索</h2>",
    `<p>${escapeHtml(clue)}</p>`,
    "<h2>身份处理</h2>",
    `<p>${escapeHtml(identity)}</p>`,
    "<h2>用于创作时</h2>",
    `<p>原典没有写出的相貌、法器、性情与故事仍保持空白。若作者以“${escapeHtml(row.title)}”继续创作，新增经历须在条目中标为 Worldcraft Codex 原创改编，不能写成古籍旧闻。</p>`
  ].join("");
}

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: zhenlingSecondEntityId(row.key, worldId),
    worldId,
    type: "character",
    title: row.title,
    slug: `mythology-zhenling-second-rank-${row.key}`,
    summary: rowSummary(row),
    content: renderFigureArticle(row),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第二阶", row.section, row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-2"),
    order,
    templateId: `template:${worldId}:mythology:zhenling-catalog-entry`,
    templateData: {
      canonicalName: row.title,
      sourceNameForm: row.sourceNameForm,
      tradition: "道教",
      identityType: row.identityType,
      pantheonSystem: "《洞玄灵宝真灵位业图》七阶神谱",
      rankPosition: "第二阶 · 上清境",
      seatSide: row.seatSide,
      recordNature: row.recordNature,
      sourceLocation: `《洞玄灵宝真灵位业图》第二中位 · ${row.section}`,
      historicalLayer: "魏晋六朝",
      normalizationStatus: row.identityNote ? "独立建页" : "待更多原典消歧",
      confidence: row.confidence,
      editorialStatus: "初步消歧",
      originalAdaptation: "false"
    }
  };
}

function renderInstitutionArticle(row, isTier) {
  if (isTier) {
    return [
      "<p>第二中位以上清高圣太上玉晨玄皇大道君为主位，随后分左位、右位与女真位，并在名单中穿插宫官和宫阙。它呈现的是中古道经的编排现场，不是后来所有道派共同采用的一张组织架构图。</p>",
      "<h2>可辨名位</h2><p>本段共辨出九十三个人物或神位名称：中位一项、左位三十三项、右位八项，女真位及其宫官分组五十一项。七个名位连接知识库已有身份，其余八十六个新建页。</p>",
      "<h2>宫官与宫阙</h2><p>“太帝宫官”“金阙宫官”是分组标题，不算人物；逸域宫、八景城等十处是神圣建筑，也不混入神祇计数。三种对象各自建页，读者仍能从本阶总页回到原始顺序。</p>",
      "<h2>女性名位</h2><p>女真位并非附录。它保存夫人、元君、玉女、真妃与宫官等不同称谓，其中一部分带人名和亲属注记，另一部分只有长号；页面按证据多少分别处理。</p>",
      "<h2>阅读边界</h2><p>九十三是可辨名位数，不等于九十三个全新神格。相似称号、历史人物和既有上清仙真经过消歧后才进入人物统计，未见于原文的故事不会为了填满页面而补写。</p>"
    ].join("");
  }
  return [
    `<p>${escapeHtml(row.summary)}</p>`,
    "<h2>分组位置</h2>",
    `<p>现用底本在第二中位女真位后段另起“${escapeHtml(row.sourceNameForm)}”标题；本页把标题保留为宫官分组，而不是创造一位同名神。</p>`,
    "<h2>所列成员</h2>",
    `<p>标题下可辨 ${row.memberKeys.length} 个名位。成员各自建页，并通过带原典出处的关系连接到本分组，以便关系图和搜索都能还原这段结构。</p>`,
    "<h2>计数办法</h2>",
    `<p>“${escapeHtml(row.sourceNameForm)}”自身计作一条制度与名录结构记录，不计入独立神祇人数。只有原文实际写出的成员名称才进入人物名位统计。</p>`,
    "<h2>资料边界</h2>",
    `<p>“${escapeHtml(row.sourceNameForm)}”标题说明这些名字被共同编排，却没有自动证明他们的上下级、任期或日常职掌。相关故事若用于项目创作，仍须明确标注为原创改编。</p>`
  ].join("");
}

function buildInstitutionEntity(row, order, worldId, now, isTier = false) {
  return {
    id: zhenlingSecondEntityId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-zhenling-second-rank-${row.key}`,
    summary: row.summary,
    content: renderInstitutionArticle(row, isTier),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第二阶", isTier ? "七阶结构" : "宫官分组", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-2"),
    order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "道教",
      institutionKind: isTier ? "神谱阶位" : "神谱宫官分组",
      hierarchyLevel: isTier ? "第二阶 · 上清境" : "第二阶 · 女真位宫官分组",
      jurisdiction: isTier ? "保存中位、左右位、女真位、宫官与宫阙的原始次序" : `收录原典在“${row.sourceNameForm}”标题下列出的 ${row.memberKeys.length} 个名位`,
      formationPeriod: "齐梁神谱整理层",
      earliestSource: "《洞玄灵宝真灵位业图》",
      sourceLocation: isTier ? "第二中位" : `第二中位 · ${row.sourceNameForm}`,
      variants: isTier ? "按现用道藏本文字分段；罕见字与断句以后续校本交叉复核。" : "标题只表示编排分组，不补设现代机构职能。",
      confidence: "明确"
    }
  };
}

function renderLocationArticle(row) {
  return [
    `<p>${escapeHtml(row.title)}是《真灵位业图》第二中位${escapeHtml(row.seatSide)}名单旁列出的一处神圣建筑。原典只给名称，没有提供可换算为现代坐标的方位。</p>`,
    "<h2>原典位置</h2>",
    `<p>现用底本写作“${escapeHtml(row.sourceNameForm)}”。它与相邻宫、城、台、阙、殿、房或楼连续出现，因此本页按建筑与神话空间处理，不计作人物名位。</p>`,
    "<h2>地图处理</h2>",
    `<p>${escapeHtml(row.title)}可以在创作地图中作为叙事地点使用，但当前不绑定现实经纬度、山系或行政区。地图上的形状、距离和朝向都属于项目表达。</p>`,
    "<h2>可确认范围</h2>",
    `<p>现阶段只确认名称、第二阶归属和${escapeHtml(row.seatSide)}上下文。建筑尺度、居住者、门户关系与仪式用途仍需其他道经提供旁证。</p>`,
    "<h2>创作标记</h2>",
    `<p>若作者为${escapeHtml(row.title)}设计内部空间、守卫、景观或事件，应在相关段落标注 Worldcraft Codex 原创改编，避免与古籍原句混读。</p>`
  ].join("");
}

function buildLocationEntity(row, order, worldId, now) {
  return {
    id: zhenlingSecondEntityId(row.key, worldId),
    worldId,
    type: "location",
    title: row.title,
    slug: `mythology-zhenling-second-rank-${row.key}`,
    summary: `${row.title}见于《真灵位业图》第二中位${row.seatSide}上下文，现按无法对应现实坐标的神圣建筑收录。`,
    content: renderLocationArticle(row),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第二阶", "神圣建筑", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-2"),
    order,
    templateId: `template:${worldId}:mythology:sacred-geography`,
    templateData: {
      spaceKind: "神话空间",
      tradition: "道教",
      historicalPeriod: "齐梁神谱整理层",
      sourceTitle: "《洞玄灵宝真灵位业图》",
      sourceLocation: `第二中位 · ${row.seatSide}`,
      modernCorrespondence: "原典没有提供可核定的现实位置，不绑定现代经纬度。",
      confidence: "无法对应",
      mapCaution: "仅作为神谱建筑与叙事空间索引；地图造型、尺度和方位属于项目改编。"
    }
  };
}

function resolveRowRef(row) {
  return row.existingRef || `z2:${row.key}`;
}

function resolveRef(reference, worldId) {
  const [scope, key] = reference.split(":");
  if (scope === "z2") return zhenlingSecondEntityId(key, worldId);
  if (scope === "zs") return zhenlingSourceId(worldId);
  if (scope === "d") return daoismEntityId(key, worldId);
  if (scope === "a") return ancientEntityId(key, worldId);
  if (scope === "n") return natureEntityId(key, worldId);
  throw new Error(`未知《真灵位业图》第二阶引用：${reference}`);
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
  sourceCitation = "《洞玄灵宝真灵位业图》第二中位",
  historicalScope = "齐梁神谱整理层",
  confidence = "certain",
  notes
}, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:zhenling-second-rank:${key}`,
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
  const tierRef = "z2:second-rank-shangqing";
  const sourceRelations = [
    buildRelation({
      key: "source-tier-second-rank",
      sourceRef: tierRef,
      targetRef: "zs:zhenling-weiye-tu",
      kind: "source",
      label: "第二阶结构原典",
      notes: "中位、左位、右位、女真位、宫官与宫阙的结构均以第二中位正文为依据。"
    }, worldId, now),
    ...catalogRows.map((row) => buildRelation({
      key: `source-position-${row.key}`,
      sourceRef: resolveRowRef(row),
      targetRef: "zs:zhenling-weiye-tu",
      kind: "source",
      label: "第二阶列名出处",
      confidence: row.key === "yang-xi-position" ? "probable" : "certain",
      notes: `原典以“${row.sourceNameForm}”列入第二阶${row.section}第 ${row.sectionOrder} 项；关系只证明列名与位置。`
    }, worldId, now)),
    ...institutionRows.map((row) => buildRelation({
      key: `source-institution-${row.key}`,
      sourceRef: `z2:${row.key}`,
      targetRef: "zs:zhenling-weiye-tu",
      kind: "source",
      label: "第二阶宫官标题出处",
      notes: `原典以“${row.sourceNameForm}”另起分组标题，不把标题本身算作人物。`
    }, worldId, now)),
    ...locationRows.map((row) => buildRelation({
      key: `source-location-${row.key}`,
      sourceRef: `z2:${row.key}`,
      targetRef: "zs:zhenling-weiye-tu",
      kind: "source",
      label: "第二阶神圣建筑出处",
      notes: `“${row.sourceNameForm}”以空间名称列在第二中位${row.seatSide}上下文，不计作人物。`
    }, worldId, now))
  ];

  const membershipRelations = [
    ...catalogRows.map((row) => buildRelation({
      key: `rank-membership-${row.key}`,
      sourceRef: tierRef,
      targetRef: resolveRowRef(row),
      kind: "contains",
      label: `第二阶${row.section}名位`,
      confidence: row.key === "yang-xi-position" ? "probable" : "certain",
      notes: `按现用底本次序收录“${row.sourceNameForm}”；名录归属不等于后世固定神职隶属。`
    }, worldId, now)),
    ...institutionRows.map((row) => buildRelation({
      key: `rank-institution-${row.key}`,
      sourceRef: tierRef,
      targetRef: `z2:${row.key}`,
      kind: "contains",
      label: "第二阶女真位宫官分组",
      notes: `“${row.sourceNameForm}”是第二阶内部标题，单独保存以维持原始层级。`
    }, worldId, now)),
    ...locationRows.map((row) => buildRelation({
      key: `rank-location-${row.key}`,
      sourceRef: tierRef,
      targetRef: `z2:${row.key}`,
      kind: "contains",
      label: "第二阶所列神圣建筑",
      notes: `${row.title}与人物名位分开计数，但仍属于第二中位的文本结构。`
    }, worldId, now))
  ];

  const officialMemberships = institutionRows.flatMap((institution) => institution.memberKeys.map((memberKey) => {
    const member = catalogRows.find((row) => row.key === memberKey);
    return buildRelation({
      key: `${institution.key}-member-${memberKey}`,
      sourceRef: `z2:${institution.key}`,
      targetRef: resolveRowRef(member),
      kind: "contains",
      label: `${institution.sourceNameForm}所列名位`,
      notes: `“${member.sourceNameForm}”紧随“${institution.sourceNameForm}”标题列出；只据此确认分组归属。`
    }, worldId, now);
  }));

  const evidenceRelations = [
    buildRelation({ key: "chisongzi-teaches-pei", sourceRef: "z2:chisongzi", targetRef: "z2:pei-jun", kind: "teacher", label: "原注称赤松子为裴君之师", notes: "第二中位赤松子条下注明“裴君师”，可直接建立师承。" }, worldId, now),
    buildRelation({ key: "wang-fangping-teaches-mao-ying", sourceRef: "z2:wang-fangping", targetRef: "z2:mao-ying", kind: "teacher", label: "原注称王方平为司命茅君之师", notes: "王方平条原注明记“司命茅君师”，这里的茅君由同段讳盈注消歧为茅盈。" }, worldId, now),
    buildRelation({ key: "wang-bao-teaches-wei", sourceRef: "d:wang-bao-qingxu", targetRef: "d:wei-huacun", kind: "teacher", label: "第二阶注记王褒为魏夫人师", notes: "右位王君条以讳褒和“魏夫人师”确认师承；此关系保留本书这一条独立证据。" }, worldId, now),
    buildRelation({ key: "wei-teaches-xu-mi", sourceRef: "d:wei-huacun", targetRef: "d:xu-mi", kind: "teacher", label: "第二阶注记许谧为南岳夫人弟子", notes: "左卿许君条明确称南岳夫人弟子；结合讳穆可连接现有许谧页。" }, worldId, now),
    buildRelation({ key: "xu-mi-father-xu-hui", sourceRef: "d:xu-mi", targetRef: "d:xu-hui", kind: "family", label: "许长史与许翙父子", notes: "右仙公许君条写作许长史子、讳翙，为既有父子关系增加名录证据。" }, worldId, now),
    buildRelation({ key: "qingtong-sibling-chun-wenqi", sourceRef: "d:qingtong-jun", targetRef: "z2:chun-wenqi", kind: "family", direction: "mutual", label: "原注称淳文期为青童君之妹", notes: "东华玉妃淳文期条的亲属注记直接建立兄妹关系。" }, worldId, now),
    buildRelation({ key: "wang-jin-sibling-donggong-wang", sourceRef: "z2:wang-jin", targetRef: "z2:donggong-zhonghou-wang-furen", kind: "family", direction: "mutual", label: "原注称王夫人为桐柏真人异母妹", notes: "东宫中候王夫人条以桐柏真人为亲属参照，和右位讳晋的王君相连。" }, worldId, now),
    buildRelation({ key: "xiwangmu-mother-wang-qinge", sourceRef: "a:xiwangmu", targetRef: "z2:wang-qinge", kind: "family", label: "原注称王清娥为阿母第二十六女", confidence: "probable", notes: "上清女真语境中的“阿母”通常指向西王母；页面保留较高概率关系，不把省称当成绝对证明。" }, worldId, now),
    buildRelation({ key: "xiwangmu-attendant-wang-shanghua", sourceRef: "a:xiwangmu", targetRef: "z2:wang-shanghua", kind: "custom", label: "西王母侍女", notes: "原名完整写作“西王母侍女王上华”，从属称谓明确。" }, worldId, now),
    buildRelation({ key: "chisongzi-yushi-disputed", sourceRef: "z2:chisongzi", targetRef: "n:yushi", kind: "disputed", label: "赤松子与雨师传统的同一性有层次差异", strength: 2, evidenceType: "scholarly-inference", historicalScope: "先秦两汉雨师传统与中古道教仙真名录比较层", confidence: "disputed", notes: "第二中位把赤松子作为有师承的仙真列名；后世部分材料又把赤松子解释为雨师，不能反向抹平两个文本层。" }, worldId, now),
    buildRelation({ key: "xu-mi-located-maoshan", sourceRef: "d:xu-mi", targetRef: "d:maoshan", kind: "located", label: "原注记许谧退居句曲山", notes: "许君条把退居句曲山写入人物注记，为既有地点关系补充《真灵位业图》证据。" }, worldId, now),
    buildRelation({ key: "an-fei-descends-maoshan", sourceRef: "z2:an-fei-jiuhua", targetRef: "d:maoshan", kind: "located", label: "原注记九华真妃晋时降于茅山", notes: "此处记录文本所述降临地点，不把它改写成可考的日常居所。" }, worldId, now)
  ];

  return [...sourceRelations, ...membershipRelations, ...officialMemberships, ...evidenceRelations];
}

function buildTimelineEvents(worldId, now) {
  const event = (key, entityRef, trackKey, title, summary, sortOrder, era, references) => ({
    id: `timeline-event:${worldId}:mythology:zhenling-second-rank:${key}`,
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
    event("second-rank-compiled", "z2:second-rank-shangqing", "textual-evidence", "第二中位形成上清境名位序列", "主位、左右位与女真位被编为一个连续阶层，九十三个可辨名位同时保留神号、官号与人名。", 512, "齐梁神谱整理层", ["z2:second-rank-shangqing", "zs:zhenling-weiye-tu"]),
    event("female-register-preserved", "z2:ziwei-yuanling-baiyu-guitai-jiuling-taizhen-yuanjun", "textual-evidence", "第二阶集中保存女真与宫官名录", "女真位连同太帝宫官、金阙宫官留下五十一项人物名位，显示女性仙真不是七阶神谱的边缘附录。", 513, "齐梁女真名录层", ["z2:ziwei-yuanling-baiyu-guitai-jiuling-taizhen-yuanjun", "z2:taidi-palace-officials", "z2:jinque-palace-officials", "zs:zhenling-weiye-tu"]),
    event("left-right-offices", "z2:second-rank-shangqing", "religious-institutions", "第二阶以左右位组织上清神官", "左位三十三项、右位八项在同一主位之下排列，长尊号把宫位、司命、仙公和真人称号编入秩序。", 514, "齐梁神谱制度层", ["z2:second-rank-shangqing", "d:taishang-dadaojun", "zs:zhenling-weiye-tu"]),
    event("palace-official-groups", "z2:jinque-palace-officials", "religious-institutions", "太帝宫官与金阙宫官成为独立分组", "两个标题分别统摄二人与十人，知识库按原文保留组别，而不把机构名称计作神祇。", 515, "齐梁宫官编排层", ["z2:taidi-palace-officials", "z2:jinque-palace-officials", "zs:zhenling-weiye-tu"]),
    event("historical-adepts-ranked", "z2:wang-fangping", "cult-evolution", "历史仙真与上清降授人物进入第二阶", "王方平、茅盈、魏华存、杨羲与许氏父子等人物被置入神谱，历史身份和天界名位在同一文本层相接。", 516, "中古仙真神格化层", ["z2:wang-fangping", "z2:mao-ying", "d:wei-huacun", "d:yang-xi", "d:xu-mi", "d:xu-hui"]),
    event("sacred-architecture-ranked", "z2:yiyu-palace", "cult-evolution", "第二阶名录同时保存十处神圣建筑", "逸域宫、八景城以及太和殿、蕊珠阙等空间和人物相邻列出，显示神谱也在安排天界宫域。", 517, "中古天界空间编排层", ["z2:yiyu-palace", "z2:ruizhu-que", "z2:second-rank-shangqing", "zs:zhenling-weiye-tu"])
  ];
}

function assertBatchShape() {
  const existingRows = catalogRows.filter((row) => row.existingRef);
  const newRows = catalogRows.filter((row) => !row.existingRef);
  if (catalogRows.length !== 93) throw new Error(`${BATCH_LABEL}可辨名位应为 93，实际为 ${catalogRows.length}`);
  if (existingRows.length !== 7) throw new Error(`${BATCH_LABEL}连接既有身份应为 7，实际为 ${existingRows.length}`);
  if (newRows.length !== 86) throw new Error(`${BATCH_LABEL}新建身份应为 86，实际为 ${newRows.length}`);
  if (institutionRows.length !== 2) throw new Error(`${BATCH_LABEL}宫官分组应为 2，实际为 ${institutionRows.length}`);
  if (locationRows.length !== 10) throw new Error(`${BATCH_LABEL}神圣建筑应为 10，实际为 ${locationRows.length}`);
  if (new Set(catalogRows.map((row) => row.key)).size !== catalogRows.length) throw new Error(`${BATCH_LABEL}名位键重复`);
  if (new Set(catalogRows.map((row) => row.sourceNameForm)).size !== catalogRows.length) throw new Error(`${BATCH_LABEL}原典名号重复`);
}

function buildZhenlingSecondRankBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const newRows = catalogRows.filter((row) => !row.existingRef);
  const figures = newRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const tier = buildInstitutionEntity({
    key: "second-rank-shangqing",
    title: "《真灵位业图》第二阶（上清境）",
    summary: "太上大道君所主的第二阶名录，共辨出九十三个人物或神位名称、两个宫官分组与十处神圣建筑。"
  }, figures.length, worldId, now, true);
  const institutions = institutionRows.map((row, index) => buildInstitutionEntity(row, figures.length + 1 + index, worldId, now));
  const locations = locationRows.map((row, index) => buildLocationEntity(row, figures.length + institutions.length + 1 + index, worldId, now));
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...figures, tier, ...institutions, ...locations],
    figures,
    institutions: [tier, ...institutions],
    locations,
    sources: [],
    catalogPositions: catalogRows.map((row) => ({ ...row, ref: resolveRowRef(row) })),
    relations: buildRelations(worldId, now),
    timelineEvents: buildTimelineEvents(worldId, now),
    featuredEntityIds: [
      tier.id,
      zhenlingSecondEntityId("wang-fangping", worldId),
      zhenlingSecondEntityId("mao-ying", worldId),
      zhenlingSecondEntityId("ziwei-yuanling-baiyu-guitai-jiuling-taizhen-yuanjun", worldId)
    ]
  };
}

module.exports = {
  BATCH_KEY,
  BATCH_LABEL,
  buildZhenlingSecondRankBatch,
  zhenlingSecondEntityId
};
