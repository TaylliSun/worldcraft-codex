const {
  WORLD_ID,
  categoryId
} = require("./chinese-mythology-history-data.cjs");
const { ancientEntityId } = require("./chinese-mythology-ancient-core-data.cjs");
const { civilizationEntityId } = require("./chinese-mythology-civilization-lineages-data.cjs");
const { daoismEntityId } = require("./chinese-mythology-daoism-early-data.cjs");
const { ritesEntityId } = require("./chinese-mythology-confucian-rites-data.cjs");
const {
  zhenlingSourceId,
  trackId
} = require("./chinese-mythology-zhenling-first-rank-data.cjs");

const BATCH_KEY = "zhenling-weiye-third-rank-14";
const BATCH_LABEL = "道教神谱扩展 · 《真灵位业图》第三阶";

function zhenlingThirdEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:zhenling-weiye:third-rank:${key}`;
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
    recordNature: options.recordNature || (identityType === "历史人物神格" ? "官号兼人名" : "仅见名录"),
    existingRef: options.existingRef || "",
    identityNote: options.identityNote || "",
    confidence: options.confidence || "原典明确列名"
  };
}

function g(key, title, sourceNameForm, count, sourceNote = "") {
  return {
    kind: "group",
    key,
    title,
    sourceNameForm,
    count,
    sourceNote
  };
}

function withSection(rows, seatSide, section) {
  return rows.map((row, index) => ({ ...row, seatSide, section, sectionOrder: index + 1 }));
}

const mainRows = withSection([
  f("taiji-jinque-dijun", "太极金阙帝君", "太極金闕帝君姓李", "神祇", "原文称其姓李；夹注又记“壬辰下教，太平主”。", { recordNature: "官号兼人名" })
], "中位", "中位");

const leftRows = withSection([
  f("zhongyang-huanglao-jun", "中央黄老君", "太極左眞人中央黄老君", "神祇"),
  f("zhonghua-gongzi", "中华公子", "太極左眞人紫陽左仙公中華公子", "仙真"),
  f("huang-guanzi", "黄观子", "太極左卿黄觀子", "仙真"),
  f("yin-xi", "尹喜", "無上眞人文始先生尹喜", "历史人物神格", "名录以文始先生长号收录尹喜。", { recordNature: "官号兼人名" }),
  f("gong-zhongyang", "龚仲阳", "朱火丹靈宫龔仲陽", "仙真", "原行与龚幼阳合列，夹注称二人为兄弟，并受道于青童君。", { recordNature: "官号兼人名" }),
  f("gong-youyang", "龚幼阳", "朱火丹靈宫龔㓜陽", "仙真", "原行与龚仲阳合列，夹注称二人为兄弟，并受道于青童君。", { recordNature: "官号兼人名", confidence: "字形待校" }),
  f("lingyang-ziming", "陵阳子明", "東陽眞人陵陽子明", "仙真", "名录保留完整人名陵阳子明。", { recordNature: "官号兼人名" }),
  f("zhongyang-shangxuanzi", "中央上玄子", "中元老人中央上玄子", "仙真"),
  f("an-qisheng", "安期生", "北極眞人安期生", "历史人物神格", "名录以北极真人长号收录安期生。", { recordNature: "官号兼人名" }),
  f("beiji-laozi-xuanshang-xianhuang", "北极老子玄上仙皇", "北極老子玄上仙皇", "神祇", "“老子”是本条长号构件；现阶段不据此并入老聃或太上老君。", { recordNature: "同神异号候选", identityNote: "与老聃、太上老君保持独立，等待明确同指文本。", confidence: "同一性有争议" }),
  f("qinghe-tiandi-jun", "清和天帝君", "清和天帝君", "神祇"),
  f("nanji-laoren-danling-shangzhen", "南极老人丹陵上真", "南極老人丹陵上眞", "神祇", "名称与后世南极老人信仰相近，但本条先按第三阶原位独立保存。", { recordNature: "同神异号候选", confidence: "同一性有争议" }),
  f("qingjing-xiansheng-taiwan-beiguzi", "青精先生太宛北谷子", "青精先生太宛北谷子", "仙真"),
  f("xuanhe-yinling-shangdi", "玄和阴陵上帝", "玄和隂陵上帝", "神祇", "原名字形作“隂”，规范检索转作“阴”。", { confidence: "字形待校" }),
  f("yangai-gongzi", "延盖公子", "太極髙仙伯延蓋公子", "仙真"),
  f("xuanzhou-xianbo", "玄洲仙伯", "玄洲仙伯", "仙真"),
  f("ge-xuan-position", "葛玄", "太極左仙公葛玄", "历史人物神格", "夹注称其吴时下演灵宝，后为地仙。", { existingRef: "d:ge-xuan", recordNature: "官号兼人名", identityNote: "姓名与太极左仙公称号均指向现有葛玄页。" }),
  f("suling-ziqi", "素灵子期", "西極老人素靈子期", "仙真"),
  f("wulao-shangzhen-xiandu-laogong", "五老上真仙都老公", "五老上眞仙都老公", "神祇", "夹注称其撰“灵书紫文”，但没有进一步说明篇名与传本。"),
  f("fuyang-gongzi", "扶阳公子", "東極老人扶陽公子", "仙真"),
  f("beigu-xiansheng", "北谷先生", "太極左公北谷先生", "仙真"),
  f("wang-chang", "王长（三天都护）", "三天都護王長", "神官", "原行与赵昇合列，两人共享“三天都护”标题。", { recordNature: "官号兼人名" }),
  f("zhao-sheng", "赵昇（三天都护）", "三天都護趙昇", "神官", "原行与王长合列，两人共享“三天都护”标题。", { recordNature: "官号兼人名" }),
  f("confucius-position", "孔子", "太極上眞公孔丘", "历史人物神格", "第三阶以孔丘本名与太极上真公称号列名。", { existingRef: "r:confucius", recordNature: "官号兼人名", identityNote: "连接现有孔子页，神谱名位作为后世接受层保留。" }),
  f("yan-hui-position", "颜回", "明晨侍郎三天司眞顔回", "历史人物神格", "第三阶以颜回本名与三天司真称号列名。", { existingRef: "r:yan-hui", recordNature: "官号兼人名", identityNote: "连接现有颜回页，不把天界官号改写成其生前经历。" }),
  f("huangdi-position", "黄帝", "玄圃眞人軒轅黄帝", "历史人物神格", "第三阶用轩辕黄帝全称并加玄圃真人名位。", { existingRef: "a:huangdi", recordNature: "官号兼人名", identityNote: "连接现有黄帝页，神谱尊号单独作为中古接受层。" }),
  f("zhuanxu-position", "颛顼", "玄帝顓頊", "历史人物神格", "夹注称其为黄帝孙，并受灵宝五符。", { existingRef: "a:zhuanxu", recordNature: "官号兼人名", identityNote: "连接现有颛顼页，夹注中的世系与受法说分层记录。" }),
  f("diku-position", "帝喾", "王子帝嚳", "历史人物神格", "夹注称其为黄帝曾孙，并受灵宝五符。", { existingRef: "a:diku", recordNature: "官号兼人名", identityNote: "连接现有帝喾页，王子名位不覆盖早期帝系材料。" }),
  f("shun-position", "舜", "帝舜", "历史人物神格", "夹注叙述其服九转神丹、入九疑山而得道，属于中古仙化解释。", { existingRef: "a:shun", recordNature: "单列人名", identityNote: "连接现有舜页，并把神仙化叙事限定在本书文本层。" }),
  f("bocheng-zigao", "柏成子高", "栢成子髙", "仙真", "夹注称其在尧时退耕，并修步纲之道。", { recordNature: "单列人名", confidence: "字形待校" }),
  f("yu-position", "禹", "夏禹", "历史人物神格", "夹注称其受钟山真人灵宝九迹法，并以治水有功。", { existingRef: "a:yu", recordNature: "单列人名", identityNote: "连接现有禹页，受法得道说保留为中古道教改写层。" }),
  f("zhou-muwang", "周穆王", "周穆王", "历史人物神格", "夹注称其至昆仑见西王母。", { recordNature: "单列人名" }),
  f("yao-position", "尧", "帝堯", "历史人物神格", "第三阶以帝尧称号列名。", { existingRef: "a:yao", recordNature: "单列人名", identityNote: "连接现有尧页，神谱收录不倒填为其生前信仰身份。" }),
  f("fenghou-position", "风后", "風后", "历史人物神格", "夹注称风后为黄帝师，并提到“四扇”说。", { existingRef: "c:fenghou-minister", recordNature: "单列人名", identityNote: "连接现有黄帝臣属风后页，同时保留本书把他置于仙班的变化。" }),
  f("xiguizi", "西归子", "西歸子", "仙真", "夹注只写“未显”，说明编者也没有补出其传记。", { recordNature: "单列人名", confidence: "身份待考" }),
  f("puyi", "蒲衣", "蒲衣", "仙真", "夹注引《庄子》说“犹是被衣”，提示蒲衣与被衣可能同指。", { recordNature: "同神异号候选", identityNote: "先独立建页，并与被衣建立同一性争议关系。", confidence: "同一性有争议" }),
  f("fengchezi", "丰车子", "丰車子", "仙真", "夹注只写“未显”，没有可补写的传记。", { recordNature: "单列人名", confidence: "身份待考" }),
  f("zhili", "支离", "支離", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("beiyi", "被衣", "被衣", "仙真", "原典以短名独立列出，并与蒲衣注形成同名异写问题。", { recordNature: "同神异号候选", identityNote: "与蒲衣保持两页，争议关系用于呈现《庄子》线索。", confidence: "同一性有争议" }),
  f("wang-ni", "王倪", "王倪", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("nie-que", "啮缺", "齧缺", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("chao-fu", "巢父", "巢父", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("xu-you", "许由", "許由", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("bian-sui", "卞随", "卞隨", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("hua-feng", "华封", "華封", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("beiren", "北人", "北人", "名录身份待考", "“北人”按现本作为独立短名，具体所指未明。", { recordNature: "单列人名", confidence: "身份待考" }),
  f("zizhou", "子州", "子州", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("shan-juan", "善卷", "善卷", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("ma-huang", "马皇", "馬皇", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("an-gong", "安公", "安公", "仙真", "夹注称其姓陶、乘赤龙；姓名结构仍待其他传记复核。", { recordNature: "官号兼人名", confidence: "身份待考" }),
  f("daxiang", "大项", "大項", "仙真", "夹注记名“托”。", { recordNature: "单列人名" })
], "左位", "左位");

const rightRows = withSection([
  f("xiliang-ziwen", "西梁子文", "太極右眞人西梁子文", "仙真"),
  f("an-duming", "安度明", "太極右眞人安度明", "仙真", "名录保留完整人名安度明。", { recordNature: "官号兼人名" }),
  f("jiang-wenqi", "绛文期", "玄洲仙都絳文期", "仙真", "名录保留完整人名绛文期。", { recordNature: "官号兼人名" }),
  f("fan-mingqi", "范明期", "紫陽眞人范明期", "仙真", "名录保留完整人名范明期。", { recordNature: "官号兼人名" }),
  f("pei-xuanren", "裴玄仁", "鬱絶眞人裴玄仁", "仙真", "名录保留完整人名裴玄仁。", { recordNature: "官号兼人名" }),
  f("xiling-zidu", "西灵子都", "太玄仙女西靈子都", "仙真", "名录以太玄仙女称号列名。", { recordNature: "官号兼人名" }),
  f("sima-jizhu", "司马季主", "司馬季主", "历史人物神格", "夹注称其受西灵子都剑解之道。", { recordNature: "单列人名" }),
  f("zhang-feng", "张奉", "太極仙侯張奉", "仙真", "名录保留完整人名张奉。", { recordNature: "官号兼人名" }),
  g("dongtai-qingxu-seven-zhenren", "洞台清虚七真人（合称神位）", "洞臺清虚七眞人", 7, "原典只报告七真人合称，没有在本处逐名。"),
  f("ji-yi-zhongfu", "季翼仲甫", "西嶽卿副司命季翼仲甫", "仙真", "夹注称其为左元放之师。", { recordNature: "官号兼人名" }),
  g("eight-lao-yuanxian", "八老元仙（合称神位）", "八老元仙", 8, "原典只报告八老元仙合称，没有在本处逐名。"),
  f("wang-zhong", "王中（正一上玄玉郎）", "正一上玄玉郎王中", "神官", "原行与鲍丘合列，两人共享正一上玄玉郎名号。", { recordNature: "官号兼人名" }),
  f("bao-qiu", "鲍丘（正一上玄玉郎）", "正一上玄玉郎鮑丘", "神官", "原行与王中合列，两人共享正一上玄玉郎名号。", { recordNature: "官号兼人名" }),
  f("nanling-yunv", "南陵玉女", "南陵玉女", "仙真"),
  f("chunyu-taixuan", "淳于太玄", "陽谷眞人領西歸傅淳于太玄", "仙真", "名录保留完整人名淳于太玄。", { recordNature: "官号兼人名" }),
  f("fan-bohua", "范泊华", "戎山眞人右仙公范泊華", "仙真", "名录保留完整人名范泊华。", { recordNature: "官号兼人名" }),
  f("xiguo-youdu", "西郭幼度", "陸渾眞人太極監西郭㓜度", "仙真", "名录保留完整人名西郭幼度；原字作“㓜”。", { recordNature: "官号兼人名", confidence: "字形待校" }),
  f("juanzi", "涓子", "中黄四司大夫領北海公涓子", "仙真", "夹注称其为苏君之师。", { recordNature: "官号兼人名" }),
  f("xu-laile", "徐来勒", "太極法師徐來勒", "历史人物神格", "夹注称其在吴时于天台山传葛仙公《法轮经》。", { recordNature: "官号兼人名" }),
  f("handan-zhangjun", "邯郸张君", "邯鄲張君", "仙真", "原典只给出籍贯式称呼，没有记名。", { recordNature: "单列人名", confidence: "身份待考" }),
  f("gengsangzi", "庚桑子", "庚桑子", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("xiao-shi", "萧史", "蕭史", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  g("taishang-xuanyi-three-zhen", "太上玄一三真（合称神位）", "太上玄一三眞", 3, "夹注称三真在吴时降天台山、传葛仙公灵宝经，但未逐名。"),
  f("liu-jing", "刘京", "劉京", "仙真", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("su-lin", "苏林（玄洲上卿）", "玄洲上卿太極中候大夫蘇君", "仙真", "夹注称其名林、字子玄，为涓子弟子、周君之师。", { recordNature: "官号兼人名" }),
  f("nongyu", "弄玉", "弄玉", "历史人物神格", "原典以短名独立列出；随后另列“二女”，不把二者混作一个名称。", { recordNature: "单列人名" }),
  g("baishui-two-women", "白水使者二女（合称神位）", "二女", 2, "夹注称二女为白水使者，没有在本处留下姓名。"),
  f("changsang-gongzi", "长桑公子", "長桑公子", "历史人物神格", "夹注称其为庄子之师。", { recordNature: "单列人名" }),
  f("zhuang-zhou", "庄周", "韋編郎莊周", "历史人物神格", "名录以韦编郎称号收录庄周。", { recordNature: "官号兼人名" }),
  f("qin-yi", "秦佚", "秦佚", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("jieyu", "接舆", "接輿", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("bohun", "伯昏", "伯昏", "历史人物神格", "原典以短名独立列出。", { recordNature: "单列人名" }),
  f("xi-jian", "郄间", "郄間", "历史人物神格", "原典以短名独立列出，字形与人物所指仍待校。", { recordNature: "单列人名", confidence: "字形待校" }),
  f("laodan-position", "老子（传记人物）", "老聃", "历史人物神格", "第三阶以老聃短名列入右位。", { existingRef: "d:laozi-historical", recordNature: "单列人名", identityNote: "连接现有老子传记人物页，不与本阶北极老子玄上仙皇自动合并。" })
], "右位", "右位");

const positionRows = [...mainRows, ...leftRows, ...rightRows];

function summaryFor(row) {
  if (row.kind === "group") {
    return `${row.title}是《真灵位业图》第三阶${row.section}第 ${row.sectionOrder} 项，只保存 ${row.count} 个席位的合称。${row.sourceNote}`;
  }
  if (row.sourceNote) {
    return `${row.title}列于《真灵位业图》第三阶${row.section}第 ${row.sectionOrder} 项。${row.sourceNote}`;
  }
  return `${row.title}列于《真灵位业图》第三阶${row.section}第 ${row.sectionOrder} 项；现存这一行只给出名号与次序，没有足够材料补写完整传记。`;
}

function renderFigureArticle(row) {
  const clue = row.sourceNote || `本行没有附传、籍贯或师承。可以确认的是“${row.sourceNameForm}”这个完整字串，以及它在第三阶${row.section}中的次序。`;
  const identity = row.identityNote || (
    row.recordNature === "官号兼人名"
      ? `可辨姓名与官号同时保存，但${row.title}在其他时代是否继续使用同一名位，仍须由别部道经或史传证明。`
      : row.recordNature === "单列人名"
        ? `${row.title}可以作为独立检索对象，页面不从短名反推籍贯、年代、法器或师承。`
        : `长尊号中的方位、宫域和品秩先按原文保留，不用后世成熟天庭体系替${row.title}补职掌。`
  );
  return [
    `<p>${escapeHtml(summaryFor(row))}</p>`,
    "<h2>原名与次序</h2>",
    `<p>现用底本写作“${escapeHtml(row.sourceNameForm)}”，位于第三中位${escapeHtml(row.section)}第 ${row.sectionOrder} 项。次序只用于还原这份中古名录，不能直接换算成后世恒定品级。</p>`,
    "<h2>原典线索</h2>",
    `<p>${escapeHtml(clue)}</p>`,
    "<h2>跨传统身份</h2>",
    `<p>${escapeHtml(identity)}</p>`,
    "<h2>创作边界</h2>",
    `<p>若作者为“${escapeHtml(row.title)}”续写相貌、性格、法术或事件，新增内容必须标为 Worldcraft Codex 原创改编。第三阶列名本身不能替代一篇古传。</p>`
  ].join("");
}

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: zhenlingThirdEntityId(row.key, worldId),
    worldId,
    type: "character",
    title: row.title,
    slug: `mythology-zhenling-third-rank-${row.key}`,
    summary: summaryFor(row),
    content: renderFigureArticle(row),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第三阶", row.section, row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-3"),
    order,
    templateId: `template:${worldId}:mythology:zhenling-catalog-entry`,
    templateData: {
      canonicalName: row.title,
      sourceNameForm: row.sourceNameForm,
      tradition: "道教",
      identityType: row.identityType,
      pantheonSystem: "《洞玄灵宝真灵位业图》七阶神谱",
      rankPosition: "第三阶 · 太极境",
      seatSide: row.seatSide,
      recordNature: row.recordNature,
      sourceLocation: `《洞玄灵宝真灵位业图》第三中位 · ${row.section}`,
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
      "<p>第三中位以太极金阙帝君为主，左位大量吸收古帝王、先秦人物与仙真，右位又保存传经人物和合称席位。这一层最能看出中古道教怎样把不同来源的人物重新安置进神谱。</p>",
      "<h2>项目数量</h2><p>正文共拆出八十六个名录项目，其中八十二项有可辨名字，四项只写合称与人数。十一项连接知识库既有人物，另外七十一项新建身份页。</p>",
      "<h2>跨传统人物</h2><p>黄帝、颛顼、帝喾、尧舜禹、孔子、颜回、葛玄、风后与老聃均不重复建人。现有页面保留其早期材料，第三阶关系只增加“被纳入神谱”这一中古接受层。</p>",
      "<h2>合称席位</h2><p>洞台清虚七真人、八老元仙、太上玄一三真与白水使者二女都没有在本段逐名。它们以集合页保存人数，不生成二十个没有姓名的占位人物。</p>",
      "<h2>阅读边界</h2><p>第三阶夹注中的受法、得道和亲缘说法属于本书文本层。它们可以和更早史传并列，却不能覆盖成黄帝、孔子或舜的唯一生平。</p>"
    ].join("");
  }
  return [
    `<p>${escapeHtml(summaryFor(row))}</p>`,
    "<h2>原典写法</h2>",
    `<p>现用底本在第三中位${escapeHtml(row.section)}写作“${escapeHtml(row.sourceNameForm)}”，报告 ${row.count} 个席位，却没有在这里逐一给名。</p>`,
    "<h2>为何不拆人</h2>",
    `<p>${escapeHtml(row.sourceNote)} 当前只有人数，没有可用于搜索和消歧的独立名字，因此保留为一个集合页。</p>`,
    "<h2>统计方式</h2>",
    `<p>“${escapeHtml(row.sourceNameForm)}”计作一条名录结构记录，但不计入已识别人物数。以后即使找到相似名单，也须先证明它解释的正是本处合称。</p>`,
    "<h2>创作边界</h2>",
    `<p>作者可以为“${escapeHtml(row.sourceNameForm)}”这组席位设计成员，但所有新增姓名、形象与经历都须标注 Worldcraft Codex 原创改编，不能伪装成原典失落名单。</p>`
  ].join("");
}

function buildInstitutionEntity(row, order, worldId, now, isTier = false) {
  return {
    id: zhenlingThirdEntityId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-zhenling-third-rank-${row.key}`,
    summary: row.summary || summaryFor(row),
    content: renderInstitutionArticle(row, isTier),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第三阶", isTier ? "七阶结构" : "合称神位", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-3"),
    order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "道教",
      institutionKind: isTier ? "神谱阶位" : "合称神位",
      hierarchyLevel: isTier ? "第三阶 · 太极境" : `第三阶 · ${row.section} · ${row.count} 个未逐名神位`,
      jurisdiction: isTier ? "保存中位、左右位、跨传统人物与合称席位的原始次序" : "名录席位集合；不代表已经识别出独立姓名",
      formationPeriod: "齐梁神谱整理层",
      earliestSource: "《洞玄灵宝真灵位业图》",
      sourceLocation: isTier ? "第三中位" : `第三中位 · ${row.section}`,
      variants: isTier ? "按现用道藏本文字分段；夹注与正文分别记录。" : `原典作“${row.sourceNameForm}”；未见逐名名单。`,
      confidence: "明确"
    }
  };
}

function resolveRowRef(row) {
  return row.existingRef || `z3:${row.key}`;
}

function resolveRef(reference, worldId) {
  const [scope, key] = reference.split(":");
  if (scope === "z3") return zhenlingThirdEntityId(key, worldId);
  if (scope === "zs") return zhenlingSourceId(worldId);
  if (scope === "a") return ancientEntityId(key, worldId);
  if (scope === "c") return civilizationEntityId(key, worldId);
  if (scope === "d") return daoismEntityId(key, worldId);
  if (scope === "r") return ritesEntityId(key, worldId);
  throw new Error(`未知《真灵位业图》第三阶引用：${reference}`);
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
  sourceCitation = "《洞玄灵宝真灵位业图》第三中位",
  historicalScope = "齐梁神谱整理层",
  confidence = "certain",
  notes
}, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:zhenling-third-rank:${key}`,
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
  const tierRef = "z3:third-rank-taiji";
  const sourceRelations = [
    buildRelation({ key: "source-tier-third-rank", sourceRef: tierRef, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第三阶结构原典", notes: "第三中位的主位、左右位、夹注和合称席位均据现用底本整理。" }, worldId, now),
    ...positionRows.map((row) => buildRelation({
      key: `source-position-${row.key}`,
      sourceRef: resolveRowRef(row),
      targetRef: "zs:zhenling-weiye-tu",
      kind: "source",
      label: "第三阶列名出处",
      notes: `原典以“${row.sourceNameForm}”列入第三阶${row.section}第 ${row.sectionOrder} 项；关系只证明列名与位置。`
    }, worldId, now))
  ];
  const membershipRelations = positionRows.map((row) => buildRelation({
    key: `rank-membership-${row.key}`,
    sourceRef: tierRef,
    targetRef: resolveRowRef(row),
    kind: "contains",
    label: row.kind === "group" ? `第三阶${row.section}合称席位` : `第三阶${row.section}名位`,
    notes: `按现用底本收录“${row.sourceNameForm}”；被列入神谱不等于原人物生前具有此名位。`
  }, worldId, now));
  const evidenceRelations = [
    buildRelation({ key: "qingtong-teaches-gong-zhongyang", sourceRef: "d:qingtong-jun", targetRef: "z3:gong-zhongyang", kind: "teacher", label: "原注称龚仲阳受道于青童君", notes: "龚氏兄弟合列条的夹注明确记录受道对象。" }, worldId, now),
    buildRelation({ key: "qingtong-teaches-gong-youyang", sourceRef: "d:qingtong-jun", targetRef: "z3:gong-youyang", kind: "teacher", label: "原注称龚幼阳受道于青童君", notes: "龚氏兄弟合列条的夹注明确记录受道对象。" }, worldId, now),
    buildRelation({ key: "gong-brothers", sourceRef: "z3:gong-zhongyang", targetRef: "z3:gong-youyang", kind: "family", direction: "mutual", label: "龚仲阳、幼阳兄弟", notes: "原注直接称二人为兄弟。" }, worldId, now),
    buildRelation({ key: "ge-xuan-lingbao", sourceRef: "d:ge-xuan", targetRef: "d:lingbao-corpus", kind: "custom", label: "第三阶夹注称葛玄下演灵宝", confidence: "probable", notes: "“下演灵宝”反映本书的传经祖师解释，不等于现存灵宝经群都由葛玄个人创作。" }, worldId, now),
    buildRelation({ key: "ji-yi-teaches-zuo-ci", sourceRef: "z3:ji-yi-zhongfu", targetRef: "d:zuo-ci", kind: "teacher", label: "原注称季翼仲甫为左元放师", notes: "左元放是左慈的常见字，现有页据此连接。" }, worldId, now),
    buildRelation({ key: "xiling-teaches-sima", sourceRef: "z3:xiling-zidu", targetRef: "z3:sima-jizhu", kind: "teacher", label: "司马季主受西灵子都剑解之道", notes: "夹注直接记录授受双方与剑解之道。" }, worldId, now),
    buildRelation({ key: "juanzi-teaches-su", sourceRef: "z3:juanzi", targetRef: "z3:su-lin", kind: "teacher", label: "原注称苏林为涓子弟子", notes: "苏君条写明名林、字子玄，并称涓子弟子。" }, worldId, now),
    buildRelation({ key: "xu-laile-transmits-ge", sourceRef: "z3:xu-laile", targetRef: "d:ge-xuan", kind: "custom", label: "吴时天台山传葛仙公法轮经", confidence: "probable", notes: "夹注描述徐来勒传葛仙公法轮经；这里记录文本所述传经，不推定两人生年相会。" }, worldId, now),
    buildRelation({ key: "three-zhen-transmit-ge", sourceRef: "z3:taishang-xuanyi-three-zhen", targetRef: "d:ge-xuan", kind: "custom", label: "三真降天台山传葛仙公灵宝经", notes: "合称夹注给出受经者葛仙公，却没有逐一写出三真姓名。" }, worldId, now),
    buildRelation({ key: "changsang-teaches-zhuang", sourceRef: "z3:changsang-gongzi", targetRef: "z3:zhuang-zhou", kind: "teacher", label: "原注称长桑公子为庄子师", confidence: "probable", notes: "本关系忠实记录《真灵位业图》夹注，不把它提升为所有早期文献一致的历史师承。" }, worldId, now),
    buildRelation({ key: "puyi-beiyi-disputed", sourceRef: "z3:puyi", targetRef: "z3:beiyi", kind: "disputed", direction: "mutual", label: "蒲衣与被衣可能同名异写", strength: 2, evidenceType: "textual-variant", confidence: "disputed", notes: "夹注引《庄子》说蒲衣“犹是被衣”；现本仍把两名分列，故保留两页。" }, worldId, now),
    buildRelation({ key: "zhou-muwang-meets-xiwangmu", sourceRef: "z3:zhou-muwang", targetRef: "a:xiwangmu", kind: "custom", label: "至昆仑见西王母", notes: "周穆王条夹注明写昆仑会见西王母，属于神仙化叙事层。" }, worldId, now),
    buildRelation({ key: "fenghou-teaches-huangdi", sourceRef: "c:fenghou-minister", targetRef: "a:huangdi", kind: "teacher", label: "第三阶夹注称风后为黄帝师", confidence: "probable", notes: "这是中古名录的师承解释，与更早材料中的臣属关系并列保存。" }, worldId, now),
    buildRelation({ key: "huangdi-grandparent-zhuanxu", sourceRef: "a:huangdi", targetRef: "a:zhuanxu", kind: "family", label: "夹注称颛顼为黄帝孙", notes: "关系记录第三阶夹注的帝系说，不替代其他古史谱系页面。" }, worldId, now),
    buildRelation({ key: "huangdi-great-grandparent-diku", sourceRef: "a:huangdi", targetRef: "a:diku", kind: "family", label: "夹注称帝喾为黄帝曾孙", notes: "关系记录第三阶夹注的帝系说，不把不同古史谱系强行统一。" }, worldId, now),
    buildRelation({ key: "wulao-lingbao-text", sourceRef: "z3:wulao-shangzhen-xiandu-laogong", targetRef: "d:lingbao-corpus", kind: "creator", label: "夹注称撰灵书紫文", confidence: "probable", notes: "夹注只有“撰灵书紫文”一句，未给可独立识别的书名；暂连接古灵宝经教而不虚构具体卷册。" }, worldId, now)
  ];
  return [...sourceRelations, ...membershipRelations, ...evidenceRelations];
}

function buildTimelineEvents(worldId, now) {
  const event = (key, entityRef, trackKey, title, summary, sortOrder, era, references) => ({
    id: `timeline-event:${worldId}:mythology:zhenling-third-rank:${key}`,
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
    event("third-rank-compiled", "z3:third-rank-taiji", "textual-evidence", "第三中位汇编太极境名录", "八十六个项目把神祇、仙真、历史人物与四组合称席位并排编入太极境。", 518, "齐梁神谱整理层", ["z3:third-rank-taiji", "zs:zhenling-weiye-tu"]),
    event("annotations-preserved", "z3:taiji-jinque-dijun", "textual-evidence", "第三阶夹注保存受法与传经线索", "姓氏、师承、亲属、得道和传经注记与正文名号并存，为身份消歧提供了比单纯列名更多的线索。", 519, "齐梁名录夹注层", ["z3:taiji-jinque-dijun", "z3:gong-zhongyang", "d:ge-xuan", "zs:zhenling-weiye-tu"]),
    event("taiji-left-right", "z3:third-rank-taiji", "religious-institutions", "第三阶以左右位重排多源人物", "太极境不只排列专名神祇，也把古帝王、儒家人物与传经仙真放入左右位。", 520, "齐梁神谱制度层", ["z3:third-rank-taiji", "a:huangdi", "r:confucius", "d:ge-xuan"]),
    event("ancient-rulers-immortalized", "a:huangdi", "cult-evolution", "古帝王在第三阶获得仙真名位", "黄帝、颛顼、帝喾、尧舜禹被纳入太极境，夹注以受符、服丹和得道重新解释古史人物。", 521, "中古古帝王仙化层", ["a:huangdi", "a:zhuanxu", "a:diku", "a:yao", "a:shun", "a:yu"]),
    event("confucian-figures-ranked", "r:confucius", "cult-evolution", "孔子与颜回被列入第三阶", "孔丘被称太极上真公，颜回被称明晨侍郎三天司真，显示儒家人物进入中古道教神谱的接受过程。", 522, "中古儒道人物合流层", ["r:confucius", "r:yan-hui", "z3:third-rank-taiji", "zs:zhenling-weiye-tu"]),
    event("classical-recluses-ranked", "z3:zhuang-zhou", "cult-evolution", "先秦隐者与诸子人物进入太极右位", "庄周、接舆、许由、善卷等名字被放进同一仙班，原有哲人或隐者身份由神谱重新诠释。", 523, "中古诸子仙化层", ["z3:zhuang-zhou", "z3:jieyu", "z3:xu-you", "z3:shan-juan", "zs:zhenling-weiye-tu"])
  ];
}

function assertBatchShape() {
  const figures = positionRows.filter((row) => row.kind === "figure");
  const groups = positionRows.filter((row) => row.kind === "group");
  const reused = figures.filter((row) => row.existingRef);
  if (mainRows.length !== 1) throw new Error(`${BATCH_LABEL}中位应为 1，实际为 ${mainRows.length}`);
  if (leftRows.length !== 51) throw new Error(`${BATCH_LABEL}左位项目应为 51，实际为 ${leftRows.length}`);
  if (rightRows.length !== 34) throw new Error(`${BATCH_LABEL}右位项目应为 34，实际为 ${rightRows.length}`);
  if (positionRows.length !== 86) throw new Error(`${BATCH_LABEL}名录项目应为 86，实际为 ${positionRows.length}`);
  if (figures.length !== 82) throw new Error(`${BATCH_LABEL}可辨人物名位应为 82，实际为 ${figures.length}`);
  if (groups.length !== 4) throw new Error(`${BATCH_LABEL}合称神位应为 4，实际为 ${groups.length}`);
  if (reused.length !== 11) throw new Error(`${BATCH_LABEL}连接既有身份应为 11，实际为 ${reused.length}`);
  if (new Set(positionRows.map((row) => row.key)).size !== positionRows.length) throw new Error(`${BATCH_LABEL}名位键重复`);
  if (new Set(positionRows.map((row) => row.sourceNameForm)).size !== positionRows.length) throw new Error(`${BATCH_LABEL}原典名号重复`);
}

function buildZhenlingThirdRankBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const newFigureRows = positionRows.filter((row) => row.kind === "figure" && !row.existingRef);
  const groupRows = positionRows.filter((row) => row.kind === "group");
  const figures = newFigureRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const tier = buildInstitutionEntity({
    key: "third-rank-taiji",
    title: "《真灵位业图》第三阶（太极境）",
    summary: "太极金阙帝君所主的第三阶，共见八十六个名录项目，其中八十二项有可辨名字、四项只存合称。"
  }, figures.length, worldId, now, true);
  const groups = groupRows.map((row, index) => buildInstitutionEntity(row, figures.length + 1 + index, worldId, now));
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...figures, tier, ...groups],
    figures,
    institutions: [tier, ...groups],
    sources: [],
    catalogPositions: positionRows.map((row) => ({ ...row, ref: resolveRowRef(row) })),
    relations: buildRelations(worldId, now),
    timelineEvents: buildTimelineEvents(worldId, now),
    featuredEntityIds: [
      tier.id,
      zhenlingThirdEntityId("taiji-jinque-dijun", worldId),
      zhenlingThirdEntityId("yin-xi", worldId),
      zhenlingThirdEntityId("zhuang-zhou", worldId)
    ]
  };
}

module.exports = {
  BATCH_KEY,
  BATCH_LABEL,
  buildZhenlingThirdRankBatch,
  zhenlingThirdEntityId
};
