const { WORLD_ID, categoryId } = require("./chinese-mythology-history-data.cjs");
const { canonEntityId } = require("./chinese-mythology-buddhism-canon-data.cjs");

const BATCH_KEY = "buddhism-canon-supplement-25";
const BATCH_LABEL = "佛教完整知识库 · 佛传、禅籍、净土论著与史书补充批";

function supplementEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:buddhism-canon-supplement:${key}`;
}

function supplementSourceId(key, worldId = WORLD_ID) {
  return supplementEntityId(`source-${key}`, worldId);
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

function item(key, title, focus, options = {}) {
  return { key, title, focus, ...options };
}

const familyRows = [
  {
    key: "biography-avadana",
    title: "佛传、本生与譬喻文献群",
    anchorKey: "agama",
    formation: "印度佛传、本生、因缘譬喻经过多次汉译和编集形成的叙事文献层",
    scope: "并列诗体佛传、长篇本行、方广佛传、本生和譬喻集，用来追踪同一人物或故事在不同文本中的改写。",
    boundary: "佛传的神圣叙事、历史地理和教化譬喻不能拼成一份现代意义的逐日传记；题名相近的因缘集也各自保留。",
    works: [
      item("buddhacarita", "《佛所行赞》", "马鸣名下诗体佛传与昙无谶汉译"),
      item("buddhacarita-samgraha", "《佛本行集经》", "从降神、出家到弟子因缘的六十卷佛传总集"),
      item("lalitavistara-puyao", "《普曜经》", "竺法护译方广佛传与菩萨降生、成道叙事"),
      item("lalitavistara-expanded", "《方广大庄严经》", "地婆诃罗译十二卷佛传与神圣庄严叙述"),
      item("six-paramita-collection", "《六度集经》", "康僧会编译的菩萨本生与六度故事"),
      item("wise-and-foolish", "《贤愚经》", "因缘、业报和求法故事的北朝译集"),
      item("compiled-hundred-avadanas", "《撰集百缘经》", "百则因缘故事与供养、业报叙事"),
      item("miscellaneous-treasure-store", "《杂宝藏经》", "譬喻、因缘和僧俗故事汇编"),
      item("hundred-parables", "《百喻经》", "僧伽斯那撰譬喻与求那毗地汉译"),
      item("old-miscellaneous-parables", "《旧杂譬喻经》", "早期汉译譬喻故事与多源编集问题")
    ]
  },
  {
    key: "mahayana-collections",
    title: "宝积、大集与方等经典群",
    anchorKey: "tathagatagarbha",
    formation: "多部独立大乘经在汉地以宝积、大集、方等或护国经类被编入大型合集的文本层",
    scope: "补入《大宝积经》《大方等大集经》以及菩萨戒、护国、金光明、本生心地和菩萨授记类重要经本。",
    boundary: "合集不是一次说法留下的单一书稿；各会、各品可能有独立译本和成书史，必须逐部辨认。",
    works: [
      item("mahartnakuta", "《大宝积经》", "四十九会、一百二十卷的大乘经合集"),
      item("mahasamnipata", "《大方等大集经》", "大集经系多品、多译与护法末世议题"),
      item("bodhisattva-diadem-karma", "《菩萨璎珞本业经》", "菩萨阶位、十波罗蜜与璎珞戒传统", { disputed: "文本的汉地形成与传统译者题署存在讨论，页面不把题署写成无争议结论。" }),
      item("renwang-amoghavajra", "不空译《仁王护国般若波罗蜜多经》", "唐译仁王经、五忍与护国法会"),
      item("golden-light-four-fascicle", "四卷本《金光明经》", "昙无谶译本的忏悔、护国与诸天护持"),
      item("mahayana-mind-ground", "《大乘本生心地观经》", "报恩、出家、心地观与菩萨戒"),
      item("karunapundarika", "《悲华经》", "诸佛本愿、净土选择与宝海梵志故事"),
      item("brahma-special-thought", "《思益梵天所问经》", "思益梵天问法、无生与菩萨辩才")
    ]
  },
  {
    key: "chan-records",
    title: "禅宗灯录、公案与语录文献群",
    anchorKey: "vimalakirti-lanka",
    formation: "唐宋禅宗以传法记、灯录、语录和公案评唱持续编纂宗派记忆的文献层",
    scope: "从早期传法史书进入《祖堂集》《景德传灯录》，再列临济语录、碧岩、无门、从容、公案与禅教会通著述。",
    boundary: "灯录中的对话经过后世编纂，不应全部当作现场速记；祖师谱系、语录文本和后代宗派身份分别标注。",
    works: [
      item("chuanfa-baoji", "《传法宝纪》", "净觉撰早期禅宗传法史和北宗记忆", { layer: "史料记录" }),
      item("lidai-fabao-ji", "《历代法宝记》", "保唐宗立场下的禅宗谱系与无住材料", { layer: "史料记录" }),
      item("zutang-ji", "《祖堂集》", "五代泉州编成的祖师传记与机缘问答", { layer: "史料记录" }),
      item("jingde-chuandeng-lu", "《景德传灯录》", "北宋三十卷灯录与传法谱系", { layer: "史料记录" }),
      item("linji-lu", "《镇州临济慧照禅师语录》", "临济义玄示众、勘辨与后世编本"),
      item("blue-cliff-record", "《佛果圜悟禅师碧岩录》", "百则公案、雪窦颂古与圆悟评唱", { layer: "注疏" }),
      item("gateless-gate", "《无门关》", "无门慧开四十八则公案与评唱", { layer: "注疏" }),
      item("book-of-equanimity", "《万松老人评唱天童觉和尚颂古从容庵录》", "宏智颂古与万松评唱的一百则公案", { layer: "注疏" }),
      item("zongjing-lu", "《宗镜录》", "永明延寿会通禅教的一百卷资料汇编", { layer: "注疏" }),
      item("chan-preface", "《禅源诸诠集都序》", "宗密说明禅门诸宗与经教关系", { layer: "注疏" })
    ]
  },
  {
    key: "pure-land-writings",
    title: "汉地净土行仪与论著群",
    anchorKey: "pure-land",
    formation: "隋唐以来净土注疏、赞偈、礼仪和宋代文献汇编形成的汉地实践层",
    scope: "以善导观经疏和五部九卷相关著作为中心，补入吉藏净土义疏、宋代居士净土文与资料汇编。",
    boundary: "祖师归属、后世合刊和原始单行本不完全相同；行仪用语也不能直接倒填为印度经文。",
    works: [
      item("wuliangshou-yishu-jizang", "《无量寿经义疏》（吉藏）", "吉藏从三论义学解释无量寿经", { layer: "注疏" }),
      item("guan-jing-yishu-jizang", "《观无量寿经义疏》（吉藏）", "吉藏解释观经十六观与九品", { layer: "注疏" }),
      item("guan-jing-four-fascicle", "《观经四帖疏》", "善导以玄义、序分、定善、散善四帖疏释观经", { layer: "注疏" }),
      item("fashi-zan", "《法事赞》", "善导依阿弥陀经组织转经行道和赞偈", { layer: "注疏" }),
      item("guan-nian-famen", "《观念阿弥陀佛相海三昧功德法门》", "善导说明观佛、念佛与护念功德", { layer: "注疏" }),
      item("wangsheng-lizan", "《往生礼赞偈》", "善导六时礼赞与愿往生行仪", { layer: "注疏" }),
      item("longshu-jingtu-wen", "《龙舒增广净土文》", "王日休汇编劝修、仪式和往生材料", { layer: "注疏" }),
      item("lebon-wenlei", "《乐邦文类》", "宗晓分类汇集宋以前净土经论与文记", { layer: "史料记录" })
    ]
  },
  {
    key: "school-commentaries",
    title: "天台、华严与律学补充论著群",
    anchorKey: "lotus-tiantai",
    formation: "隋唐至宋代宗派教学把修法纲要、判教图式和律学记释整理成便于讲习的文献层",
    scope: "补入智顗小部止观、四教文献、华严纲要和元照律学记释，填补大型宗典与日常学习之间的层级。",
    boundary: "提纲、讲记和后人整理本不等于宗祖一次写定；题署、版本和流通层各自保存。",
    works: [
      item("xiaozhiguan", "《修习止观坐禅法要》（《小止观》）", "智顗名下坐禅前行、调身息心和治病方法", { layer: "注疏" }),
      item("six-wondrous-gates", "《六妙法门》", "数、随、止、观、还、净六门禅法", { layer: "注疏" }),
      item("four-teachings-meaning", "《四教义》", "智顗解释藏通别圆四教和菩萨阶位", { layer: "注疏" }),
      item("tiantai-four-teachings-ritual", "《天台四教仪》", "高丽谛观整理五时八教与化仪化法", { layer: "注疏" }),
      item("huayan-jing-zhi-gui", "《华严经旨归》", "法藏以十门提纲华严经说法与旨趣", { layer: "注疏" }),
      item("zichi-ji", "《四分律行事钞资持记》", "元照为道宣行事钞作宋代律学记释", { layer: "注疏" })
    ]
  },
  {
    key: "historiography",
    title: "佛教史书、护教集与类书文献群",
    anchorKey: "catalogues",
    formation: "六朝至元代僧人以护教文集、类书、地理志和编年史整理佛教公共记忆的史料层",
    scope: "从《弘明集》《广弘明集》进入佛教与国家、儒道的论辩，再由《法苑珠林》、地理志和佛祖编年史追踪制度与传说。",
    boundary: "史书会采用宗派立场、神异传闻和前代材料；它们是接受史证据，不自动证明所载每一神迹。",
    works: [
      item("hongming-ji", "《弘明集》", "僧祐编六朝佛教护教文章与儒道论辩", { layer: "史料记录" }),
      item("guang-hongming-ji", "《广弘明集》", "道宣续编历代诏令、论辩和佛教文集", { layer: "史料记录" }),
      item("fayuan-zhulin", "《法苑珠林》", "道世按主题编成的一百卷佛教类书", { layer: "史料记录" }),
      item("shijia-fangzhi", "《释迦方志》", "道宣整理佛教世界地理、圣迹与汉地交通", { layer: "史料记录" }),
      item("fozu-tongji", "《佛祖统纪》", "志磐以天台立场编纂佛教编年和制度志", { layer: "史料记录" }),
      item("fozu-lidai-tongzai", "《佛祖历代通载》", "念常编元代佛教通史与历代纪事", { layer: "史料记录" })
    ]
  }
];

const sourceRows = familyRows.flatMap((family) => family.works.map((row, index) => ({
  ...row,
  familyKey: family.key,
  familyTitle: family.title,
  familyFormation: family.formation,
  familyBoundary: family.boundary,
  familyScope: family.scope,
  anchorKey: family.anchorKey,
  position: index + 1,
  layer: row.layer || "原文",
  formation: row.formation || family.formation,
  disputed: row.disputed || "当前以古籍题署和目录位置为基本坐标；故事细节、卷次差异和后世宗派解释不互相覆盖。"
})));

function renderFamily(row) {
  return [
    `<p>${escapeHtml(row.title)}把 ${row.works.length} 部常被大部头目录遮住的文本放回各自位置，使故事、宗派记忆和历史资料可以分别检索。</p>`,
    `<h2>收录范围</h2><p>${escapeHtml(row.scope)}</p>`,
    `<h2>文献形成</h2><p>${escapeHtml(row.formation)}。本页不把后世合刊误写成最初编纂形态。</p>`,
    `<h2>辨读边界</h2><p>${escapeHtml(row.boundary)}</p>`,
    `<h2>阅读方法</h2><p>阅读${escapeHtml(row.title)}时，先看单书题署和文本类型，再通过关系册进入异本、人物和制度史；引文仍回到对应古籍页核对。</p>`,
    `<h2>创作使用</h2><p>${escapeHtml(row.title)}可为人物语言、寺院生活和传播路径提供材料。项目新写对白、神异结果和人物私史必须显著标作原创。</p>`,
    `<h2>资料声明</h2><p>${escapeHtml(row.title)}的说明文字由项目重新撰写，不复制第三方 Wiki 或现代版权译文，公开正文不保存站外链接。</p>`
  ].join("");
}

function renderSource(row) {
  return [
    `<p>${escapeHtml(row.title)}属于“${escapeHtml(row.familyTitle)}”，主要用于查阅${escapeHtml(row.focus)}。</p>`,
    `<h2>这部书是什么</h2><p>${escapeHtml(row.title)}在本库中的位置是${escapeHtml(row.formation)}。它与同题材文献互相参照，却保留自己的题署、卷数和编纂立场。</p>`,
    `<h2>可以读到什么</h2><p>从${escapeHtml(row.title)}进入，可以看到${escapeHtml(row.focus)}；页面关系只提示阅读路径，不把不同文本拼成一篇无出处的故事。</p>`,
    `<h2>传本与题署</h2><p>${escapeHtml(row.title)}采用汉文古籍通行本作为书目坐标。${escapeHtml(row.disputed)}</p>`,
    `<h2>辨读边界</h2><p>处理${escapeHtml(row.title)}时，${escapeHtml(row.familyBoundary)} 人物言行若只见后出的灯录、史书或类书，须注明所见层次。</p>`,
    `<h2>创作使用（项目原创提示）</h2><p>${escapeHtml(row.title)}可提供${escapeHtml(row.focus)}方面的素材；项目新增的对白、连续剧情和心理描写不属于传统古籍，必须保留原创标签。</p>`,
    `<h2>资料声明</h2><p>${escapeHtml(row.title)}页面仅保存古籍书目事实与项目自写概述，不复制现代译文、第三方百科或站外文章。</p>`
  ].join("");
}

function buildFamilyEntity(row, order, worldId, now) {
  return {
    id: supplementEntityId(`family-${row.key}`, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-buddhism-canon-supplement-family-${row.key}`,
    summary: `${row.title}收录 ${row.works.length} 部文献，补足叙事、宗派实践与佛教史料层。`,
    content: renderFamily(row),
    tags: ["中国神话史", "佛教完整知识库", "经藏补充目录", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "buddhism"),
    order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "佛教",
      institutionKind: "佛教文献补充目录",
      hierarchyLevel: "经律论、宗派文献与史料层",
      jurisdiction: row.scope,
      formationPeriod: row.formation,
      earliestSource: row.works[0].title,
      sourceLocation: "本目录所列各文献的独立条目",
      variants: row.boundary,
      confidence: "主流说法"
    }
  };
}

function buildSourceEntity(row, order, worldId, now) {
  return {
    id: supplementSourceId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-buddhism-canon-supplement-source-${row.key}`,
    summary: `${row.title}：${row.focus}；题署、编纂与后世接受分层说明。`,
    content: renderSource(row),
    tags: ["中国神话史", "佛教完整知识库", "佛教文献补充", row.familyTitle, "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "primary-sources"),
    order,
    templateId: `template:${worldId}:mythology:source-text`,
    templateData: {
      workTitle: row.title,
      workType: "佛典",
      formationPeriod: row.formation,
      edition: "汉文大藏经、续藏或古籍通行本",
      volumeSection: "全书；卷篇由条目内部阅读导航定位",
      sourceLayer: row.layer,
      rightsStatus: "古籍原文",
      internalCitation: `${row.title} · ${row.familyTitle} · 全书`,
      reviewStatus: "已核原文"
    }
  };
}

function relation(key, sourceRef, targetRef, label, citation, scope, options = {}) {
  return {
    key,
    sourceRef,
    targetRef,
    label,
    sourceCitation: citation,
    historicalScope: scope,
    kind: options.kind || "custom",
    direction: "directed",
    strength: options.strength || 4,
    evidenceType: options.evidenceType || "primary-text",
    confidence: options.confidence || "certain",
    notes: options.notes || "关系用于书目定位和文本分层，不将不同传本合并。"
  };
}

const membershipRelations = sourceRows.map((row) => relation(
  `member-${row.key}`,
  `s:${row.key}`,
  `f:${row.familyKey}`,
  "列入佛教文献补充目录",
  row.title,
  row.familyFormation,
  { kind: "member", strength: 5 }
));

const sourceRelations = sourceRows.map((row) => relation(
  `source-family-${row.key}`,
  `f:${row.familyKey}`,
  `s:${row.key}`,
  "补充目录直接文献入口",
  row.title,
  row.familyFormation,
  { kind: "source", strength: 5, evidenceType: row.layer === "史料记录" ? "historical-record" : "primary-text" }
));

const sequenceRelations = familyRows.flatMap((family) => family.works.slice(0, -1).map((row, index) => relation(
  `sequence-${family.key}-${index + 1}`,
  `s:${row.key}`,
  `s:${family.works[index + 1].key}`,
  "同组下一部文献",
  `${row.title}；${family.works[index + 1].title}`,
  family.formation,
  { strength: 2, evidenceType: "scholarly-inference", confidence: "probable", notes: "次序只用于本库阅读，不代表历史目录的固定排列。" }
)));

const comparisonRelations = familyRows.flatMap((family) => family.works.slice(1).map((row) => relation(
  `compare-${family.key}-${row.key}`,
  `s:${row.key}`,
  `s:${family.works[0].key}`,
  "同题材文献对读",
  `${row.title}；${family.works[0].title}`,
  family.formation,
  { kind: "evolution", strength: 3, evidenceType: "textual-variant", confidence: "probable", notes: "对读不等于同本异译，具体关系由两页正文说明。" }
)));

const crossRelations = familyRows.flatMap((family) => [
  relation(`anchor-${family.key}`, `f:${family.key}`, `c:${family.anchorKey}`, "连接经藏主干目录", family.works.map((item) => item.title).join("；"), family.formation, { kind: "contains", evidenceType: "scholarly-inference", confidence: "probable" }),
  relation(`anchor-first-${family.key}`, `s:${family.works[0].key}`, `c:${family.anchorKey}`, "与主干经藏分区对读", family.works[0].title, family.formation, { kind: "influence", evidenceType: "scholarly-inference", confidence: "probable" })
]);

const extraCrossRows = [
  ["biography-history", "f:biography-avadana", "f:historiography", "佛传故事与后世佛教史书分层"],
  ["mahayana-pureland", "f:mahayana-collections", "f:pure-land-writings", "大乘合集与净土论著互引"],
  ["chan-history", "f:chan-records", "f:historiography", "灯录谱系由史书与经录互校"],
  ["chan-schools", "f:chan-records", "f:school-commentaries", "禅教关系与宗派课程对读"],
  ["pureland-history", "f:pure-land-writings", "f:historiography", "往生资料与编年史料互校"],
  ["schools-history", "f:school-commentaries", "f:historiography", "宗派论著的历史背景入口"],
  ["avadana-mahayana", "f:biography-avadana", "f:mahayana-collections", "本生因缘与大乘菩萨叙事对读"],
  ["pureland-chan", "f:pure-land-writings", "f:chan-records", "宋代禅净会通资料入口"]
];

for (const [key, sourceRef, targetRef, label] of extraCrossRows) {
  crossRelations.push(relation(`cross-${key}`, sourceRef, targetRef, label, "本批古籍与宗派文献互证", "六朝至元代佛教文本与制度史层", { kind: "influence", evidenceType: "scholarly-inference", confidence: "probable" }));
}

function event(key, trackKey, sourceKey, title, summary, startValue, endValue, displayDate, era) {
  return { key, trackKey, sourceKey, title, summary, startValue, endValue, displayDate, era };
}

const eventRows = [
  event("six-paramita-translation", "textual-evidence", "six-paramita-collection", "康僧会译编《六度集经》", "吴地译经把多则菩萨本生按布施、持戒等六度组织起来。", "247", "280", "约三世纪中叶", "三国吴佛教译述层"),
  event("puyao-translation", "textual-evidence", "lalitavistara-puyao", "竺法护译《普曜经》", "方广佛传在西晋形成八卷汉译，保存与后出庄严经不同的译语。", "308", "308", "308年", "西晋佛传译经层"),
  event("wise-foolish-formation", "textual-evidence", "wise-and-foolish", "沙门从西域讲席带回并整理《贤愚经》", "因缘故事在北魏凉州一带编成汉文集，题署和记录保留集体整理痕迹。", "445", "445", "约445年", "北魏佛教故事编集层"),
  event("mahartnakuta-compiled", "textual-evidence", "mahartnakuta", "菩提流志主持编译一百二十卷《大宝积经》", "旧译、新译和失译会本被汇入四十九会总集。", "706", "713", "706至713年", "唐代宝积经编译层"),
  event("chuandeng-record", "textual-evidence", "jingde-chuandeng-lu", "《景德传灯录》奉敕入藏", "道原编三十卷灯录，经杨亿等刊定后成为宋代禅宗谱系的重要文本。", "1004", "1011", "约1004至1011年", "北宋灯录编纂层"),
  event("blue-cliff-compiled", "textual-evidence", "blue-cliff-record", "圆悟克勤评唱汇成《碧岩录》", "雪窦颂古与圆悟垂示、评唱形成多层公案文本。", "1111", "1125", "约十二世纪初", "北宋禅宗公案评唱层"),
  event("guan-jing-commentary", "textual-evidence", "guan-jing-four-fascicle", "善导完成观经四帖疏解释体系", "玄义与三分义注把九品、定善和散善组织为净土宗关键解释。", "640", "681", "约七世纪中叶", "唐代净土注疏层"),
  event("tiantai-four-teachings-korea", "textual-evidence", "tiantai-four-teachings-ritual", "谛观将天台教观纲要带入宋初", "高丽僧谛观整理的四教仪成为东亚天台初学常用提纲。", "960", "970", "约十世纪后半", "宋初天台复兴文本层"),
  event("fayuan-zhulin-compiled", "textual-evidence", "fayuan-zhulin", "道世编成《法苑珠林》", "一百卷类书从经律论和史传摘录材料，按主题构建佛教知识体系。", "668", "668", "668年", "唐代佛教类书编纂层"),
  event("fozu-tongji-compiled", "textual-evidence", "fozu-tongji", "志磐编成《佛祖统纪》", "天台立场的编年史、世系和制度志保存宋代佛教历史观。", "1258", "1269", "约1258至1269年", "南宋佛教史书编纂层"),
  event("parable-preaching", "religious-institutions", "hundred-parables", "譬喻集进入讲经、俗讲与劝善传播", "短篇故事便于讲席和民间转述，也使原经语境常被重新安排。", "500", "1300", "约六至十三世纪", "中古佛教讲唱制度层"),
  event("chan-lamp-history", "religious-institutions", "zutang-ji", "寺院以灯录保存法系和祖师记忆", "祖堂集、传灯录等把分散语录编成可供宗门教学的谱系文本。", "900", "1300", "约十至十三世纪", "宋代禅宗谱系制度层"),
  event("pureland-liturgy", "religious-institutions", "wangsheng-lizan", "净土礼赞形成六时行仪与大众唱念", "赞偈、礼拜和念佛次第把经义带入寺院与结社实践。", "650", "1300", "约七至十三世纪", "汉地净土行仪层"),
  event("tiantai-study-manuals", "religious-institutions", "four-teachings-meaning", "四教提纲进入天台僧学和跨地域传习", "简明纲要帮助学习者在大部疏论之前建立判教坐标。", "600", "1300", "约七至十三世纪", "东亚天台教学制度层"),
  event("buddhist-historiography", "religious-institutions", "hongming-ji", "护教集与佛教史书形成专门编纂传统", "文集、类书和编年史让佛教群体保存诏令、论辩、传记和制度记忆。", "500", "1300", "约六至十三世纪", "中国佛教史学制度层"),
  event("gong-an-printing", "cult-evolution", "gateless-gate", "宋元刊刻推动公案集跨寺院流传", "评唱和颂古成为可以反复阅读、讲解和再编的禅宗文本类型。", "1200", "1600", "约十三至十六世纪", "禅宗公案刊刻接受层"),
  event("pureland-lay-reading", "cult-evolution", "longshu-jingtu-wen", "宋代净土文集扩大居士与家庭阅读", "劝修、仪式和往生故事通过刻本进入寺院之外的读者网络。", "1100", "1600", "约十二至十六世纪", "宋明净土居士阅读层"),
  event("modern-text-layering", "cult-evolution", "fozu-tongji", "近现代研究重新区分灯录、史书与原始佛典", "写本、版本和目录对读让祖师问答、神异传说与可考制度可以分层使用。", "1900", "2026", "二十世纪至今", "现代佛教文献研究层")
];

function resolveRef(reference, worldId) {
  const [scope, key] = [reference.slice(0, reference.indexOf(":")), reference.slice(reference.indexOf(":") + 1)];
  if (scope === "f") return supplementEntityId(`family-${key}`, worldId);
  if (scope === "s") return supplementSourceId(key, worldId);
  if (scope === "c") return canonEntityId(`family-${key}`, worldId);
  throw new Error(`未知佛教经藏补充批引用：${reference}`);
}

function buildRelation(row, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:buddhism-canon-supplement:${row.key}`,
    worldId,
    sourceEntityId: resolveRef(row.sourceRef, worldId),
    targetEntityId: resolveRef(row.targetRef, worldId),
    kind: row.kind,
    label: row.label,
    direction: row.direction,
    strength: row.strength,
    evidenceType: row.evidenceType,
    sourceCitation: row.sourceCitation,
    historicalScope: row.historicalScope,
    confidence: row.confidence,
    notes: row.notes,
    updatedAt: now
  };
}

function buildTimelineEvent(row, worldId, now, index) {
  const source = sourceRows.find((item) => item.key === row.sourceKey);
  return {
    id: `timeline-event:${worldId}:mythology:buddhism-canon-supplement:${row.key}`,
    worldId,
    entityId: supplementSourceId(row.sourceKey, worldId),
    questId: "",
    sceneId: "",
    references: [
      { kind: "entity", id: supplementSourceId(row.sourceKey, worldId) },
      { kind: "entity", id: supplementEntityId(`family-${source.familyKey}`, worldId) }
    ],
    trackId: trackId(row.trackKey, worldId),
    title: row.title,
    summary: row.summary,
    displayDate: row.displayDate,
    datePrecision: row.startValue === row.endValue ? "year" : "range",
    sortOrder: 800 + index * 2,
    startValue: row.startValue,
    endValue: row.endValue,
    era: row.era,
    dependencyIds: [],
    updatedAt: now
  };
}

function assertBatchShape() {
  const relationCount = membershipRelations.length + sourceRelations.length + sequenceRelations.length + comparisonRelations.length + crossRelations.length;
  const checks = [
    [familyRows.length, 6, "目录"],
    [sourceRows.length, 48, "文献"],
    [relationCount, 200, "关系"],
    [eventRows.length, 18, "事件"]
  ];
  for (const [actual, expected, label] of checks) {
    if (actual !== expected) throw new Error(`${BATCH_LABEL}${label}数量应为 ${expected}，实际为 ${actual}`);
  }
}

function buildBuddhismCanonSupplementBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const systems = familyRows.map((row, index) => buildFamilyEntity(row, index, worldId, now));
  const sources = sourceRows.map((row, index) => buildSourceEntity(row, systems.length + index, worldId, now));
  const relationRows = [...membershipRelations, ...sourceRelations, ...sequenceRelations, ...comparisonRelations, ...crossRelations];
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...systems, ...sources],
    systems,
    sources,
    relations: relationRows.map((row) => buildRelation(row, worldId, now)),
    timelineEvents: eventRows.map((row, index) => buildTimelineEvent(row, worldId, now, index)),
    featuredEntityIds: [
      supplementEntityId("family-biography-avadana", worldId),
      supplementEntityId("family-chan-records", worldId),
      supplementEntityId("family-pure-land-writings", worldId),
      supplementSourceId("jingde-chuandeng-lu", worldId),
      supplementSourceId("guan-jing-four-fascicle", worldId),
      supplementSourceId("fayuan-zhulin", worldId)
    ]
  };
}

module.exports = {
  BATCH_KEY,
  BATCH_LABEL,
  buildBuddhismCanonSupplementBatch,
  supplementEntityId,
  supplementSourceId,
  familyRows,
  sourceRows,
  eventRows,
  WORLD_ID,
  categoryId
};
