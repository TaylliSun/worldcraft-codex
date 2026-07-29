const { WORLD_ID, categoryId } = require("./chinese-mythology-history-data.cjs");
const { ancientEntityId } = require("./chinese-mythology-ancient-core-data.cjs");
const { civilizationEntityId } = require("./chinese-mythology-civilization-lineages-data.cjs");
const { celestialEntityId } = require("./chinese-mythology-celestial-bureaucracy-data.cjs");
const { zhenlingSourceId, trackId } = require("./chinese-mythology-zhenling-first-rank-data.cjs");
const { zhenlingFifthEntityId } = require("./chinese-mythology-zhenling-fifth-rank-data.cjs");

const BATCH_KEY = "zhenling-weiye-seventh-rank-18";
const BATCH_LABEL = "道教神谱扩展 · 《真灵位业图》第七阶";

function zhenlingSeventhEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:zhenling-weiye:seventh-rank:${key}`;
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
    identityType: options.identityType || "历史人物神格",
    recordNature: options.recordNature || "官号兼人名",
    existingRef: options.existingRef || "",
    identityNote: options.identityNote || "",
    confidence: options.confidence || "原典明确列名"
  };
}

function group(key, title, sourceNameForm, sourceNote, count, memberRefs = []) {
  return { kind: "group", key, title, sourceNameForm, sourceNote, count, memberRefs };
}

function office(key, title, sourceNameForm, sourceNote, memberRefs = []) {
  return { kind: "office", key, title, sourceNameForm, sourceNote, memberRefs };
}

function withSection(rows, section) {
  return rows.map((row, index) => ({ ...row, seatSide: section, section, sectionOrder: index + 1 }));
}

const mainRows = withSection([
  f("fengdu-emperor-position", "北阴酆都大帝", "酆都北隂大帝", "夹注称其为炎帝大庭氏、讳庆甲、天下鬼神之宗，治罗酆山，三千年一替；这是一条六朝名录身份说。", {
    identityType: "冥府帝尊",
    existingRef: "cb:fengdu-emperor",
    identityNote: "连接现有北阴酆都大帝页；夹注中的炎帝大庭氏说另以争议身份关系保存。"
  })
], "中位");

const leftRows = withSection([
  f("qin-shihuang", "秦始皇", "北帝上相秦始皇", "名录授予北帝上相职，不把这一神职倒写进秦代生平。"),
  f("cao-cao", "曹操（魏武帝）", "北帝太傅魏武帝", "原典只写魏武帝；规范名补入曹操以便检索。"),
  group("five-emperor-chancellors", "五帝上相（姓名未显）", "五帝上相", "夹注直说姓名未显，因此只建五人合称。", 5),
  f("zhou-wenwang", "周文王", "西明公領北帝師周文王", "夹注以人间少傅比拟其位。"),
  f("sima-yi", "司马懿（晋宣帝）", "賔友晉宣帝", "晋宣帝是后世追尊，本页只记录其在西明公一组中的宾友位置。"),
  f("zhou-yi", "周顗", "中護軍周顗", "原典以中护军官号列名。"),
  f("xia-qi-position", "启", "東明公領斗君師夏啓", "夏启连接现有古史人物页，只增加东明公、斗君师这一六朝神谱身份。", { existingRef: "cv:qi-xia", identityNote: "连接现有夏启页面。" }),
  f("sun-ce", "孙策", "賔友孫䇿", "原典字形作孙䇿，列为东明公宾友。"),
  office("right-shichen", "右师晨（姓名未显）", "右師晨", "夹注以人间中书监比拟，未列姓名。"),
  f("xu-zhao-position", "许肇", "許肇", "夹注称已升度九宫位；第五阶页面已经保存其更早名位。", { existingRef: "z5:xu-zhao", identityNote: "连接第五阶许肇页面。" }),
  f("shao-gong-position", "召公奭", "南明公召奭", "夹注另有东明公之说，并称已升度九官右保公。", { existingRef: "z5:shao-gong-shi", identityNote: "连接第五阶召公奭页面；南明、东明异说不合并成两个神。", confidence: "同一性有争议" }),
  f("liu-bang", "刘邦（汉高祖）", "賔友漢髙祖", "原典以汉高祖帝号列为南明公宾友。"),
  f("wu-jizha", "吴季札", "北明公呉季札", "夹注称其为吴王寿梦之子、阖闾之叔，并以延陵季子识别。"),
  f("xun-yu", "荀彧", "賔友荀彧", "夹注写字文若、魏武谋臣、汉尚书令。"),
  f("zhao-shutai", "赵叔台", "趙叔臺", "夹注称身份未显。", { identityType: "名录身份待考", recordNature: "单列人名", confidence: "身份待考" }),
  f("wang-shiqing", "王世卿", "王世卿", "夹注称身份未显。", { identityType: "名录身份待考", recordNature: "单列人名", confidence: "身份待考" }),
  f("zhou-wuwang", "周武王", "鬼官北斗君周武王", "夹注称其治一天宫。"),
  f("qi-huangong", "齐桓公", "三官都禁郎齊桓公", "夹注明记姓姜、名小白。"),
  f("jin-wengong", "晋文公", "水官司命晉文公", "夹注明记姓姬、名重耳。"),
  group("great-jinchen-two", "大禁晨二人", "大禁晨二人，位比尚書令", "后列汉光武帝与孙文台两人，位比尚书令。", 2, ["z7:liu-xiu", "z7:sun-jian"]),
  f("liu-xiu", "刘秀（汉光武帝）", "漢光武帝", "以帝号列入大禁晨二人。"),
  f("sun-jian", "孙坚（孙文台）", "孫文臺", "夹注明记名坚。"),
  group("middle-jin-two", "中禁二人", "中禁二人，位比中書令監", "后列颜怀与杨彪两人，位比中书令监。", 2, ["z7:yan-huai", "z7:yang-biao"]),
  f("yan-huai", "颜怀", "顔懷", "夹注写字思季。"),
  f("yang-biao", "杨彪", "楊彪", "夹注写字文光；只按现用底本保存。"),
  f("xi-jian", "郄鉴", "北帝南朱陽大門靈關侯郄鑒", "正文称其先为高明司直，现任灵关侯，位比尚书仆射。"),
  f("xie-kun", "谢鲲（谢幼舆）", "右禁監謝幼輿", "夹注明记名鲲，并称晋官太常。"),
  f("deng-yue", "邓岳", "司馬鄧嶽", "原典以司马官号列名。"),
  f("yu-liang", "庾亮（庾元规）", "右禁監侍帝晨𢈔元規", "夹注明记名亮，并保存侍中、右卫及中卫大将军异说。", { confidence: "字形待校" }),
  f("feng-huai", "冯怀", "司馬馮懷", "夹注写字相思，后有一字缺损。", { confidence: "字形待校" }),
  f("hua-xin", "华歆", "華歆", "原典独立列名，没有在本行补写官号。"),
  f("yu-fan", "虞翻", "長史虞翻", "夹注写字长翔、武昌人，又称庾亮引为上佐而不就。"),
  f("kong-rong", "孔融（孔文举）", "後中衞大將軍孔文舉", "夹注明记名融。"),
  f("tang-zhou", "唐周", "長史唐周", "夹注称为吴尚书。"),
  f("zhang-xiu", "张绣", "司馬張繡", "夹注称后汉将军。"),
  f("wen-qiao", "温峤（温太真）", "監海伯治東海温太眞", "正文称治东海、位比大将军。"),
  f("du-yu", "杜预", "長史杜預", "夹注称晋征南将军，并写位左傅。"),
  group("north-emperor-attendants-eight", "北帝侍晨八人", "北帝侍晨八人，位比侍中", "八人姓名随后依次列出，位比侍中。", 8, ["z7:xu-shu", "z7:pang-de", "z7:yuan-yu", "z7:li-guang", "z7:wang-jia", "z7:xie-jie", "z7:he-yan", "z7:yin-hao"]),
  f("xu-shu", "徐庶", "徐庶", "夹注写字文直。"),
  f("pang-de", "庞德", "龐德", "夹注字形作“今明”，不据后世通行字擅改原注。", { confidence: "字形待校" }),
  f("yuan-yu", "爰榆", "爰榆", "夹注写字世都。", { identityType: "名录身份待考", recordNature: "单列人名" }),
  f("li-guang", "李广", "李廣", "夹注只写汉将。"),
  f("wang-jia", "王嘉", "王嘉", "与解结并列于北帝侍晨八人。"),
  f("xie-jie", "解结", "解結", "夹注写字叔连。"),
  f("he-yan", "何晏", "何晏", "夹注写字平叔。"),
  f("yin-hao", "殷浩", "殷浩", "夹注写字渊源。"),
  group("four-ming-beidou-attendants", "四明公与北斗君侍帝晨", "四明公北斗君，各有侍帝晨五人", "五位主官各有五名侍帝晨，共二十五人，姓名均未显。", 25),
  group("hebei-marquis-two", "河北侯二人", "河北侯二人", "后列刘备与韩遂。", 2, ["z7:liu-bei", "z7:han-sui"]),
  f("liu-bei", "刘备", "劉備", "夹注写字玄德。"),
  f("han-sui", "韩遂", "韓遂", "原典以姓名列入河北侯二人。")
], "左位");

const rightRows = withSection([
  group("stable-duty-four", "中厩直事四人", "中廐直事四人，如世尚書", "四人姓名随后列出，以人间尚书比拟。", 4, ["z7:dai-yuan", "z7:gongsun-du", "z7:guo-jia", "z7:liu-feng"]),
  f("dai-yuan", "戴渊", "戴淵", "夹注写字若思，并称晋骠骑。"),
  f("gongsun-du", "公孙度", "公孫度", "夹注写字叔济，并称王辽东。"),
  f("guo-jia", "郭嘉", "郭嘉", "原典与刘封并列于中厩直事四人。"),
  f("liu-feng", "刘封", "劉封", "夹注称刘备养子。"),
  group("south-gate-tingzhang-two", "北帝南门亭长二人", "北帝南門亭長二人", "后列郄鉴与周抚，夹注称周抚代郄鉴。", 2, ["z7:xi-jian", "z7:zhou-fu"]),
  f("xi-jian-right", "郄鉴", "郄鑒", "右位再次列名，仍连接左位灵关侯郄鉴。", { existingRef: "z7:xi-jian", identityNote: "同一人物在第七阶左右位各有一次位置记录。" }),
  f("zhou-fu", "周抚", "周撫", "夹注写字道和，并称代郄鉴。"),
  group("north-heaven-xiumen-two", "北天修门郎二人", "北天脩門郎二人", "后列虞讳与纪瞻。", 2, ["z7:yu-hui", "z7:ji-zhan"]),
  f("yu-hui", "虞讳", "虞諱", "原典只存姓名，身份仍待考。", { identityType: "名录身份待考", recordNature: "单列人名", confidence: "身份待考" }),
  f("ji-zhan", "纪瞻", "紀瞻", "列入北天修门郎二人。"),
  group("xiumen-eight", "修门郎八人（姓名未显）", "脩門郎八人", "夹注称北斗君门亦有此职，姓名均未显。", 8),
  group("beidou-gate-tingzhang-two", "北斗君天门亭长二人", "北斗君天門亭長二人", "后列臧洪与王放。", 2, ["z7:zang-hong", "z7:wang-fang"]),
  f("zang-hong", "臧洪", "臧洪", "夹注写字子源。"),
  f("wang-fang", "王放", "王放", "夹注称晋中书郎。"),
  f("wang-yunzhi", "王允之", "期門郎王允之", "夹注称王敦堂弟。"),
  f("xie-feng", "谢凤", "謝鳳", "与王允之相邻列出，具体官号边界未另补。", { confidence: "身份待考" }),
  f("fan-ming", "范明", "典柄侯范明", "与周鲂并列于典柄侯一行。", { confidence: "身份待考" }),
  f("zhou-fang", "周鲂", "周魴", "夹注写字子鱼，并称主察试。"),
  f("gu-he", "顾和", "北帝執蓋郎顧和", "夹注写字君孝，并称晋吏部尚书。"),
  f("wang-yi", "王廙", "部鬼將軍王廙", "夹注写字世将，并称晋时荆州刺史。"),
  group("killer-ghosts-three", "杀鬼三鬼（姓名未显）", "殺鬼地映日遊", "夹注明说是北帝常使杀人的三鬼，且无姓名；不把“地映日游”误拆成人名。", 3),
  group("west-gate-langs-sixteen", "西门郎十六人（姓名未显）", "西門郎十六人", "夹注称主天下房庙血食之鬼，或隶四明公；姓名未显。", 16),
  f("yan-baihu", "严白虎", "主非使者嚴白虎", "夹注称吴时人，为孙策所杀。"),
  f("xu-fu-position", "许副", "南彈方侯許副，領威南兵千人", "夹注称已升度九官而继任者未详。", { existingRef: "z5:xu-fu", identityNote: "连接第五阶许副页面。" }),
  f("liu-zan", "留赞", "主南門鑰司馬留賛", "夹注称长山人、吴将。", { confidence: "字形待校" }),
  f("bao-xun", "鲍勋", "北彈方侯鮑勛，領威北兵千人", "夹注写字叔业，并称魏中丞。"),
  f("wei-zun", "韦遵", "主北門鑰司馬韋遵", "夹注保存吴时门禁职掌比拟，句中一处人名关系难解。", { confidence: "字形待校" }),
  f("tao-kan", "陶侃", "西河侯陶侃", "夹注写字士行，并称亦领兵数千。"),
  office("west-river-chief-secretary", "西河侯长史（徐宁、蔡谟先后任）", "長史", "夹注称先用徐宁，后改用蔡谟；主行未直接列姓名。", ["z7:xu-ning", "z7:cai-mo"]),
  f("wei-zhao", "魏钊", "廬山侯魏釗", "夹注称会稽人。"),
  f("jiang-ji", "蒋济", "南山伯蔣濟", "夹注写字子通，并称魏太尉。"),
  f("xun-yi", "荀顗", "泰山君荀顗", "夹注写字景倩。"),
  f("gu-zhong", "顾众", "將軍顧衆", "夹注写字长始，并称晋丹阳尹、仆射。"),
  f("huan-fan", "桓范", "長史桓範", "夹注写字元则。"),
  f("cao-hong", "曹洪", "司馬曹洪", "夹注称魏武帝操弟、字子廉；另本线索又提到贾谊，分作异说。", { confidence: "同一性有争议" }),
  f("cao-ren", "曹仁", "盧龍公曹仁", "夹注写字子孝，称魏武帝弟、位大将军。"),
  office("chief-secretary-sima", "长史司马（姓名未显）", "長史司馬", "夹注明说姓名未显。"),
  f("he-zeng", "何曾", "南巴侯何曽", "夹注写字颍孝，并称魏司徒。"),
  f("liu-tao", "刘陶", "東越大將軍劉陶", "夹注写字子寄，并称魏人。"),
  f("chu-yangong", "楚严公（夹注称楚庄王熊鬻）", "楚嚴公", "夹注把此号解释为楚庄王熊鬻；字形与后世通行名需分层校读。", { confidence: "字形待校" }),
  f("zhao-jianzi", "赵简子", "趙簡子", "夹注称与楚严公此前未有职，今方受位。"),
  f("xiang-liangcheng", "项梁成", "項梁成", "夹注称为作《酆都宫颂》者。", { identityType: "名录身份待考", recordNature: "单列人名" }),
  f("du-qiong", "杜琼", "杜瓊", "夹注只称蜀人。"),
  f("ma-rong", "马融", "馬融", "与刘庆孙并列，夹注接写与贾谊争名誉。", { confidence: "身份待考" }),
  f("liu-qingsun", "刘庆孙", "劉慶孫", "与马融并列，夹注接写与贾谊争名誉。", { confidence: "身份待考" }),
  f("wang-xizhi", "王羲之（王逸少）", "王逸少", "以字逸少列名。"),
  f("deng-you", "邓攸", "鄧攸", "与此前五人合称六人位未显。")
], "右位");

const annotationRows = [
  f("xu-ning", "徐宁（西河侯前任长史）", "先用徐寧", "只见于长史夹注，称其被弹后换任。", { recordNature: "官号兼人名" }),
  f("cai-mo", "蔡谟（西河侯长史）", "今用蔡謨", "夹注写字道明，并称晋司徒。", { recordNature: "官号兼人名" }),
  f("jia-yi-variant", "贾谊（第七阶异文线索）", "又云先周賈誼", "异文紧接曹洪夹注，所指前任及句读不稳，暂不并入固定官位。", { recordNature: "单列人名", confidence: "同一性有争议" })
].map((row, index) => ({ ...row, seatSide: "右位", section: "右位夹注", sectionOrder: index + 1 }));

const positionRows = [...mainRows, ...leftRows, ...rightRows];

const headingRows = [
  { key: "four-ming-offices", title: "四明公与北斗君神职组", sourceNameForm: "此四明，主領四方", section: "左位", summary: "西明、东明、南明、北明四公分领四方并各治一天宫；北斗君另治一天宫。", memberRefs: ["z7:zhou-wenwang", "cv:qi-xia", "z5:shao-gong-shi", "z7:wu-jizha", "z7:zhou-wuwang", "z7:four-ming-beidou-attendants"] },
  { key: "qimen-pair", title: "期门郎并列二人", sourceNameForm: "期門郎王允之。謝鳳", section: "右位", summary: "王允之与谢凤在同一行相邻，官号是否同时统摄二人暂不强定。", memberRefs: ["z7:wang-yunzhi", "z7:xie-feng"] },
  { key: "dianbing-pair", title: "典柄侯并列二人", sourceNameForm: "典柄侯范明。周魴", section: "右位", summary: "范明与周鲂同列，夹注只在周鲂处写主察试。", memberRefs: ["z7:fan-ming", "z7:zhou-fang"] },
  { key: "four-garrisons-segment", title: "第七阶四镇鬼军段", sourceNameForm: "右號爲四鎭，各領鬼兵萬人", section: "右位", summary: "西河、庐山、南山、泰山、卢龙等官号与将军、长史、司马相连，原文总结为四镇；具体四镇边界仍按段落整体保存。", memberRefs: ["z7:tao-kan", "z7:west-river-chief-secretary", "z7:wei-zhao", "z7:jiang-ji", "z7:xun-yi", "z7:gu-zhong", "z7:huan-fan", "z7:cao-hong", "z7:cao-ren", "z7:chief-secretary-sima", "z7:he-zeng", "z7:liu-tao"] },
  { key: "six-unassigned", title: "六名位次未显人物", sourceNameForm: "此六人位未顯", section: "右位", summary: "项梁成、杜琼、马融、刘庆孙、王逸少与邓攸六人有名而未显具体职位。", memberRefs: ["z7:xiang-liangcheng", "z7:du-qiong", "z7:ma-rong", "z7:liu-qingsun", "z7:wang-xizhi", "z7:deng-you"] }
];

const auxiliaryRows = [
  { key: "south-troops-thousand", title: "威南兵千人", sourceNameForm: "領威南兵千人", summary: "南弹方侯许副所领的千人鬼军，只保存集体规模，不生成千个匿名人物。", count: 1000, leaderRef: "z5:xu-fu" },
  { key: "north-troops-thousand", title: "威北兵千人", sourceNameForm: "領威北兵千人", summary: "北弹方侯鲍勋所领的千人鬼军，只建立军伍条目。", count: 1000, leaderRef: "z7:bao-xun" },
  { key: "four-garrison-ghost-armies", title: "四镇鬼兵", sourceNameForm: "各領鬼兵萬人", summary: "四镇各领鬼兵万人；人数是神谱军制规模，不换算成四万独立角色。", count: 40000, leaderRef: "z7:four-garrisons-segment" },
  { key: "minor-garrisons", title: "数百小镇鬼军", sourceNameForm: "有小鎭數百各領鬼兵數千人", summary: "原典另记数百小镇、各领数千鬼兵，未列镇名与将领姓名。", count: 0, leaderRef: "z7:four-garrisons-segment" }
];

function summaryFor(row) {
  const position = row.section === "右位夹注" ? `第七阶${row.section}第 ${row.sectionOrder} 条` : `第七阶${row.section}第 ${row.sectionOrder} 项`;
  if (row.kind === "figure") return `${row.title}见于《真灵位业图》${position}。${row.sourceNote}`;
  return `${row.title}是《真灵位业图》${position}保存的${row.kind === "group" ? "集体神职" : "无名职任"}。${row.sourceNote}`;
}

function renderFigureArticle(row) {
  const identity = row.identityNote || (row.identityType === "历史人物神格"
    ? `${row.title}的历史身份与第七阶鬼官身份分栏保存；名录只能证明六朝整理者把这一人物列入冥府官班。`
    : `${row.title}的姓名、官号和次序按原行保存，原典没有交代的生平不作补写。`);
  return [
    `<p>${escapeHtml(summaryFor(row))}</p>`,
    "<h2>原名与位次</h2>",
    `<p>现用底本写作“${escapeHtml(row.sourceNameForm)}”。它位于${escapeHtml(row.section)}第 ${row.sectionOrder} 条，次序用于还原名录，不换算成后世固定神阶。</p>`,
    "<h2>正文与夹注</h2>",
    `<p>${escapeHtml(row.sourceNote || "本行没有附加可核实的生平线索。")}</p>`,
    "<h2>身份边界</h2>",
    `<p>${escapeHtml(identity)}</p>`,
    "<h2>创作使用</h2>",
    `<p>若作者据“${escapeHtml(row.sourceNameForm)}”扩写审判、军务、性格或人物对白，新增内容须标注 Worldcraft Codex 原创改编，不能写成原典旧闻。</p>`
  ].join("");
}

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: zhenlingSeventhEntityId(row.key, worldId), worldId, type: "character", title: row.title,
    slug: `mythology-zhenling-seventh-rank-${row.key}`, summary: summaryFor(row), content: renderFigureArticle(row),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第七阶", "酆都鬼官", row.section, row.title],
    visibility: "public", createdBy: "user-owner", updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-7"), order,
    templateId: `template:${worldId}:mythology:zhenling-catalog-entry`,
    templateData: {
      canonicalName: row.title, sourceNameForm: row.sourceNameForm, tradition: "道教", identityType: row.identityType,
      pantheonSystem: "《洞玄灵宝真灵位业图》七阶神谱", rankPosition: "第七阶 · 酆都鬼官", seatSide: row.seatSide,
      recordNature: row.recordNature, sourceLocation: `《洞玄灵宝真灵位业图》第七中位 · ${row.section}`,
      historicalLayer: "魏晋六朝", normalizationStatus: row.identityNote ? "连接既有身份" : row.confidence === "原典明确列名" ? "独立建页" : "待更多原典消歧",
      confidence: row.confidence, editorialStatus: "初步消歧", originalAdaptation: "false"
    }
  };
}

function renderInstitutionArticle(row, mode) {
  if (mode === "tier") return [
    "<p>第七中位以酆都北阴大帝为主位，把帝王、将相、晋人名士、门官、鬼将与军伍编进北阴官班。它呈现的是六朝神谱中的一套冥府秩序，不是历代阴司信仰的唯一总表。</p>",
    "<h2>原典总数</h2><p>篇末自称现有七十五职、名显者一百一十九人。当前按可辨姓名、明确人数合称、无名职任和夹注换任者分别建模，不用人数反造姓名。</p>",
    "<h2>左右位结构</h2><p>左位以四明公、北斗君、禁晨和侍帝晨为骨架；右位转入门禁、鬼将、弹方侯与四镇鬼军。人间官名只说明文本采用的比拟方式。</p>",
    "<h2>历史人物层</h2><p>秦始皇、魏武帝、周文王、刘备、郭嘉等人的鬼官身份属于六朝接受史。页面不会把这些神职倒写成他们生前已经担任的官职。</p>",
    "<h2>匿名成员</h2><p>五帝上相、侍帝晨、修门郎、西门郎与万千鬼兵按集体条目保存。未显姓名者不会为了凑数被生成占位人物。</p>"
  ].join("");
  const countText = row.count ? `原典人数为 ${row.count}；` : "原典没有给出可拆分姓名；";
  return [
    `<p>${escapeHtml(row.summary || summaryFor(row))}</p>`,
    "<h2>原典写法</h2>",
    `<p>现用底本写作“${escapeHtml(row.sourceNameForm)}”。${escapeHtml(countText)}页面保存制度或集体身份，不创建匿名个人。</p>`,
    "<h2>成员与职掌</h2>",
    `<p>${escapeHtml(row.sourceNote || row.summary || "成员范围仅按本段上下文确定。")}</p>`,
    "<h2>资料边界</h2>",
    `<p>${escapeHtml(row.title)}只属于第七中位的六朝整理层；后世酆都法、东岳阴司与佛教地狱系统另页并行。</p>`,
    "<h2>创作使用</h2>",
    `<p>若为${escapeHtml(row.title)}补写成员姓名、制服、刑具、营地或案件，必须标注 Worldcraft Codex 原创改编。</p>`
  ].join("");
}

function buildInstitutionEntity(row, order, worldId, now, mode) {
  const isTier = mode === "tier";
  return {
    id: zhenlingSeventhEntityId(row.key, worldId), worldId, type: "note", title: row.title,
    slug: `mythology-zhenling-seventh-rank-${row.key}`, summary: row.summary || summaryFor(row), content: renderInstitutionArticle(row, mode),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第七阶", isTier ? "七阶结构" : "冥府官署", row.title],
    visibility: "public", createdBy: "user-owner", updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-7"), order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "道教", institutionKind: isTier ? "神谱阶位" : mode === "heading" ? "神谱名录分组" : mode === "auxiliary" ? "鬼军集体" : row.kind === "office" ? "无名神职" : "集体神职",
      hierarchyLevel: isTier ? "第七阶 · 酆都鬼官" : `第七阶 · ${row.section || "右位军伍"}`,
      jurisdiction: isTier ? "保存北阴大帝、四明公、鬼官、门禁与军伍名录" : row.summary || row.sourceNote,
      formationPeriod: "齐梁神谱整理层", earliestSource: "《洞玄灵宝真灵位业图》",
      sourceLocation: isTier ? "第七中位" : `第七中位 · ${row.section || "右位"}`,
      variants: `原典作“${row.sourceNameForm}”。`, confidence: row.confidence || "明确"
    }
  };
}

function resolveRowRef(row) {
  return row.existingRef || `z7:${row.key}`;
}

function resolveRef(reference, worldId) {
  const split = reference.indexOf(":");
  const scope = reference.slice(0, split);
  const key = reference.slice(split + 1);
  if (scope === "z7") return zhenlingSeventhEntityId(key, worldId);
  if (scope === "z5") return zhenlingFifthEntityId(key, worldId);
  if (scope === "zs") return zhenlingSourceId(worldId);
  if (scope === "a") return ancientEntityId(key, worldId);
  if (scope === "cv") return civilizationEntityId(key, worldId);
  if (scope === "cb") return celestialEntityId(key, worldId);
  throw new Error(`未知《真灵位业图》第七阶引用：${reference}`);
}

function buildRelation({ key, sourceRef, targetRef, kind, label, direction = "directed", strength = 5, evidenceType = "primary-text", sourceCitation = "《洞玄灵宝真灵位业图》第七中位", historicalScope = "齐梁神谱整理层", confidence = "certain", notes }, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:zhenling-seventh-rank:${key}`, worldId,
    sourceEntityId: resolveRef(sourceRef, worldId), targetEntityId: resolveRef(targetRef, worldId), kind, label, direction, strength,
    evidenceType, sourceCitation, historicalScope, confidence, notes, updatedAt: now
  };
}

function buildRelations(worldId, now) {
  const tierRef = "z7:seventh-rank-fengdu-officials";
  const institutionRows = positionRows.filter((row) => row.kind !== "figure");
  const sourceRelations = [
    buildRelation({ key: "source-tier", sourceRef: tierRef, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第七阶结构原典", notes: "第七中位主位、左右鬼官、夹注换任与篇末统计均据现用底本整理。" }, worldId, now),
    ...positionRows.map((row) => buildRelation({ key: `source-position-${row.key}`, sourceRef: resolveRowRef(row), targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第七阶列名出处", notes: `原典以“${row.sourceNameForm}”列入第七阶${row.section}第 ${row.sectionOrder} 项；关系只证明列名与位置。` }, worldId, now)),
    ...annotationRows.map((row) => buildRelation({ key: `source-annotation-${row.key}`, sourceRef: `z7:${row.key}`, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第七阶夹注人物出处", notes: `“${row.sourceNameForm}”只见于第七阶右位夹注，未提升为正文独立职位。` }, worldId, now)),
    ...headingRows.map((row) => buildRelation({ key: `source-heading-${row.key}`, sourceRef: `z7:${row.key}`, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第七阶分组出处", notes: `“${row.sourceNameForm}”保存原典分组、计数或位次边界。` }, worldId, now)),
    ...auxiliaryRows.map((row) => buildRelation({ key: `source-aux-${row.key}`, sourceRef: `z7:${row.key}`, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第七阶鬼军计数出处", notes: `原典以“${row.sourceNameForm}”记军伍规模，匿名兵员不拆分建页。` }, worldId, now))
  ];
  const membershipRelations = [
    ...positionRows.map((row) => buildRelation({ key: `rank-member-${row.key}`, sourceRef: tierRef, targetRef: resolveRowRef(row), kind: "contains", label: `第七阶${row.section}${row.kind === "figure" ? "名位" : "集体或无名神职"}`, notes: `按现用底本收录“${row.sourceNameForm}”；第七阶身份不覆盖人物其他历史层。` }, worldId, now)),
    ...annotationRows.map((row) => buildRelation({ key: `rank-annotation-${row.key}`, sourceRef: tierRef, targetRef: `z7:${row.key}`, kind: "contains", label: "第七阶夹注人物", notes: `${row.title}只按夹注层进入本阶。` }, worldId, now)),
    ...headingRows.map((row) => buildRelation({ key: `rank-heading-${row.key}`, sourceRef: tierRef, targetRef: `z7:${row.key}`, kind: "contains", label: "第七阶名录分组", notes: `${row.title}保存原典成员边界。` }, worldId, now)),
    ...auxiliaryRows.map((row) => buildRelation({ key: `rank-aux-${row.key}`, sourceRef: tierRef, targetRef: `z7:${row.key}`, kind: "contains", label: "第七阶鬼军集体", notes: `${row.title}只按人数与所属关系保存。` }, worldId, now))
  ];
  const groupMemberships = [
    ...institutionRows.flatMap((row) => (row.memberRefs || []).map((memberRef, index) => buildRelation({ key: `${row.key}-member-${index + 1}`, sourceRef: `z7:${row.key}`, targetRef: memberRef, kind: "contains", label: `${row.title}成员`, notes: `成员按“${row.sourceNameForm}”之后的列名次序归组。` }, worldId, now))),
    ...headingRows.flatMap((row) => row.memberRefs.map((memberRef, index) => buildRelation({ key: `${row.key}-member-${index + 1}`, sourceRef: `z7:${row.key}`, targetRef: memberRef, kind: "contains", label: `${row.title}所含名位`, notes: `关系保存第七阶段落结构；有争议的官号边界仍在页面中说明。` }, worldId, now))),
    ...auxiliaryRows.map((row) => buildRelation({ key: `${row.key}-leader`, sourceRef: row.leaderRef, targetRef: `z7:${row.key}`, kind: "contains", label: `统领${row.title}`, notes: `人数按原典“${row.sourceNameForm}”保存，不生成匿名兵员。` }, worldId, now))
  ];
  const explicitRelations = [
    buildRelation({ key: "fengdu-luofeng", sourceRef: "cb:fengdu-emperor", targetRef: "cb:luofeng-fengdu", kind: "located", label: "第七阶夹注称治罗酆山", notes: "连接既有罗酆山神话空间，不对应现代精确坐标。" }, worldId, now),
    buildRelation({ key: "fengdu-yandi-identity", sourceRef: "cb:fengdu-emperor", targetRef: "a:yandi", kind: "disputed", direction: "undirected", strength: 2, label: "夹注称酆都北阴大帝为炎帝大庭氏庆甲", evidenceType: "primary-text", confidence: "disputed", notes: "这是一条六朝神谱身份说，不据此把所有炎帝传统并入酆都大帝。" }, worldId, now),
    buildRelation({ key: "sun-jian-sun-ce", sourceRef: "z7:sun-jian", targetRef: "z7:sun-ce", kind: "family", label: "父子", notes: "关系用于识别第七阶中分处两组的孙坚与孙策，不扩写家族神谱。" }, worldId, now),
    buildRelation({ key: "liu-bei-liu-feng", sourceRef: "z7:liu-bei", targetRef: "z7:liu-feng", kind: "family", label: "养父子", notes: "夹注明说刘封为刘备养子。" }, worldId, now),
    buildRelation({ key: "cao-cao-cao-hong", sourceRef: "z7:cao-cao", targetRef: "z7:cao-hong", kind: "family", label: "夹注称弟", confidence: "disputed", notes: "只保存现用底本的亲属用语；历史亲等须另据史籍复核。" }, worldId, now),
    buildRelation({ key: "cao-cao-cao-ren", sourceRef: "z7:cao-cao", targetRef: "z7:cao-ren", kind: "family", label: "夹注称弟", confidence: "disputed", notes: "只保存现用底本的亲属用语；不以此覆盖史籍宗族关系。" }, worldId, now),
    buildRelation({ key: "xi-jian-zhou-fu-succession", sourceRef: "z7:xi-jian", targetRef: "z7:zhou-fu", kind: "custom", label: "南门亭长换任", notes: "夹注称周抚代郄鉴。" }, worldId, now),
    buildRelation({ key: "xu-ning-cai-mo-succession", sourceRef: "z7:xu-ning", targetRef: "z7:cai-mo", kind: "custom", label: "西河侯长史换任", notes: "夹注称徐宁被弹，今用蔡谟。" }, worldId, now),
    buildRelation({ key: "shao-gong-ming-office-variant", sourceRef: "z5:shao-gong-shi", targetRef: "z7:four-ming-offices", kind: "disputed", strength: 2, label: "南明公、一云东明公", confidence: "disputed", notes: "正文作南明公，夹注保留东明公异说。" }, worldId, now),
    buildRelation({ key: "cao-hong-jia-yi-variant", sourceRef: "z7:cao-hong", targetRef: "z7:jia-yi-variant", kind: "disputed", strength: 2, label: "夹注异文前任归属待考", confidence: "disputed", notes: "“又云先周贾谊”句读不稳，暂不指定贾谊担任哪一职位。" }, worldId, now)
  ];
  return [...sourceRelations, ...membershipRelations, ...groupMemberships, ...explicitRelations];
}

function buildTimelineEvents(worldId, now) {
  const event = (key, entityRef, trackKey, title, summary, sortOrder, era, references) => {
    const refs = [...new Set([entityRef, ...references])];
    return {
      id: `timeline-event:${worldId}:mythology:zhenling-seventh-rank:${key}`, worldId,
      entityId: resolveRef(entityRef, worldId), questId: "", sceneId: "",
      references: refs.map((reference) => ({ kind: "entity", id: resolveRef(reference, worldId) })),
      trackId: trackId(trackKey, worldId), title, summary, displayDate: "约五世纪末至六世纪前半", datePrecision: "range",
      sortOrder, startValue: "499", endValue: "536", era, dependencyIds: [], updatedAt: now
    };
  };
  return [
    event("seventh-rank-compiled", "z7:seventh-rank-fengdu-officials", "textual-evidence", "第七中位形成酆都鬼官名录", "北阴大帝主位、左右位、门禁、鬼将与军伍被编入同一阶，篇末自称七十五职、一百一十九人。", 546, "齐梁神谱整理层", ["cb:fengdu-emperor", "zs:zhenling-weiye-tu"]),
    event("fengdu-qingjia-claim", "cb:fengdu-emperor", "textual-evidence", "夹注以炎帝大庭氏庆甲解释北阴大帝", "这一身份说进入六朝酆都神谱，但不覆盖其他炎帝谱系与后世酆都法。", 547, "齐梁名录夹注层", ["a:yandi", "cb:luofeng-fengdu", "zs:zhenling-weiye-tu"]),
    event("four-ming-offices", "z7:four-ming-offices", "religious-institutions", "四明公与北斗君分治天宫", "西、东、南、北四明公领四方，北斗君另治一天宫，五位主官各配五名未显姓名的侍帝晨。", 548, "齐梁北阴宫府层", ["z7:zhou-wenwang", "cv:qi-xia", "z5:shao-gong-shi", "z7:wu-jizha", "z7:zhou-wuwang"]),
    event("historical-rulers-as-ghost-officials", "z7:qin-shihuang", "cult-evolution", "历代帝王将相被编入北阴官班", "秦始皇、魏武帝、周文王、汉高祖、周武王等以新官号进入鬼官名录，形成明确的历史人物神格化层。", 549, "六朝历史人物冥官化层", ["z7:cao-cao", "z7:zhou-wenwang", "z7:liu-bang", "z7:zhou-wuwang"]),
    event("named-attendant-groups", "z7:north-emperor-attendants-eight", "religious-institutions", "禁晨、侍帝晨与门官按人数成组", "二人、四人、八人、十六人与二十五人的神职组并列；有姓名者逐人建页，无姓名者只保存合称。", 550, "齐梁冥府官班层", ["z7:great-jinchen-two", "z7:stable-duty-four", "z7:xiumen-eight", "z7:west-gate-langs-sixteen", "z7:four-ming-beidou-attendants"]),
    event("gate-and-killer-ghost-offices", "z7:killer-ghosts-three", "religious-institutions", "北帝门禁与杀鬼神职形成右位前段", "南门亭长、修门郎、天门亭长、执盖郎、部鬼将军与三名无名杀鬼按门禁和执行职掌排列。", 551, "齐梁北帝门禁层", ["z7:south-gate-tingzhang-two", "z7:north-heaven-xiumen-two", "z7:beidou-gate-tingzhang-two", "z7:wang-yi"]),
    event("four-garrison-armies", "z7:four-garrisons-segment", "religious-institutions", "四镇与大小鬼军进入北阴军制", "弹方侯领千人，四镇各领万人，另有数百小镇；人数仅作为军制规模，不生成匿名角色。", 552, "齐梁北阴鬼军层", ["z7:south-troops-thousand", "z7:north-troops-thousand", "z7:four-garrison-ghost-armies", "z7:minor-garrisons"]),
    event("office-succession-notes", "z7:west-river-chief-secretary", "textual-evidence", "夹注保存郄鉴、周抚与徐宁、蔡谟换任", "第七阶不只列名，也记录门亭长和西河侯长史的前后任，为静态名录留下职任变化。", 553, "齐梁名录换任夹注层", ["z7:xi-jian", "z7:zhou-fu", "z7:xu-ning", "z7:cai-mo"]),
    event("six-unassigned", "z7:six-unassigned", "textual-evidence", "篇末六人有名而位次未显", "项梁成至邓攸六人保留姓名与有限夹注，不由编辑者猜补官号。", 554, "齐梁名录未定职位层", ["z7:xiang-liangcheng", "z7:du-qiong", "z7:ma-rong", "z7:liu-qingsun", "z7:wang-xizhi", "z7:deng-you"])
  ];
}

function assertBatchShape() {
  const figures = positionRows.filter((row) => row.kind === "figure");
  const collectives = positionRows.filter((row) => row.kind === "group");
  const offices = positionRows.filter((row) => row.kind === "office");
  const reused = figures.filter((row) => row.existingRef);
  if (mainRows.length !== 1) throw new Error(`${BATCH_LABEL}中位项目应为 1，实际为 ${mainRows.length}`);
  if (new Set(positionRows.map((row) => row.key)).size !== positionRows.length) throw new Error(`${BATCH_LABEL}名位键重复`);
  if (figures.length < 80) throw new Error(`${BATCH_LABEL}可辨人物位置不足：${figures.length}`);
  if (collectives.length < 10) throw new Error(`${BATCH_LABEL}集体神职遗漏：${collectives.length}`);
  if (offices.length < 3) throw new Error(`${BATCH_LABEL}无名神职遗漏：${offices.length}`);
  if (reused.length !== 6) throw new Error(`${BATCH_LABEL}连接既有身份位置应为 6，实际为 ${reused.length}`);
  if (annotationRows.length !== 3 || headingRows.length !== 5 || auxiliaryRows.length !== 4) throw new Error(`${BATCH_LABEL}夹注人物或结构分组数量异常`);
}

function buildZhenlingSeventhRankBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const newFigureRows = [...positionRows, ...annotationRows].filter((row) => row.kind === "figure" && !row.existingRef);
  const positionInstitutionRows = positionRows.filter((row) => row.kind !== "figure");
  const figures = newFigureRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const tier = buildInstitutionEntity({ key: "seventh-rank-fengdu-officials", title: "《真灵位业图》第七阶（酆都鬼官）", sourceNameForm: "第七中位", section: "中位", summary: "酆都北阴大帝所主的第七阶，按可辨姓名、人数合称、无名职任、夹注换任和鬼军规模分层整理。" }, figures.length, worldId, now, "tier");
  const positionInstitutions = positionInstitutionRows.map((row, index) => buildInstitutionEntity(row, figures.length + 1 + index, worldId, now, "position"));
  const headings = headingRows.map((row, index) => buildInstitutionEntity(row, figures.length + positionInstitutions.length + 1 + index, worldId, now, "heading"));
  const auxiliaries = auxiliaryRows.map((row, index) => buildInstitutionEntity({ ...row, section: "右位军伍" }, figures.length + positionInstitutions.length + headings.length + 1 + index, worldId, now, "auxiliary"));
  return {
    key: BATCH_KEY, label: BATCH_LABEL,
    entities: [...figures, tier, ...positionInstitutions, ...headings, ...auxiliaries],
    figures, institutions: [tier, ...positionInstitutions, ...headings, ...auxiliaries], locations: [], sources: [],
    catalogPositions: positionRows.map((row) => ({ ...row, ref: resolveRowRef(row) })),
    annotationFigures: annotationRows,
    relations: buildRelations(worldId, now), timelineEvents: buildTimelineEvents(worldId, now),
    featuredEntityIds: [tier.id, celestialEntityId("fengdu-emperor", worldId), zhenlingSeventhEntityId("four-ming-offices", worldId), zhenlingSeventhEntityId("four-garrisons-segment", worldId)]
  };
}

module.exports = { BATCH_KEY, BATCH_LABEL, buildZhenlingSeventhRankBatch, zhenlingSeventhEntityId };
