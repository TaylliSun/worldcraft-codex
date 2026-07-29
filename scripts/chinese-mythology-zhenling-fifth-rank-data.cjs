const { WORLD_ID, categoryId } = require("./chinese-mythology-history-data.cjs");
const { daoismEntityId } = require("./chinese-mythology-daoism-early-data.cjs");
const { celestialEntityId } = require("./chinese-mythology-celestial-bureaucracy-data.cjs");
const { lineageEntityId } = require("./chinese-mythology-daoism-lineages-data.cjs");
const { zhenlingSourceId, trackId } = require("./chinese-mythology-zhenling-first-rank-data.cjs");
const { zhenlingThirdEntityId } = require("./chinese-mythology-zhenling-third-rank-data.cjs");
const { zhenlingFourthEntityId } = require("./chinese-mythology-zhenling-fourth-rank-data.cjs");

const BATCH_KEY = "zhenling-weiye-fifth-rank-16";
const BATCH_LABEL = "道教神谱扩展 · 《真灵位业图》第五阶";

function zhenlingFifthEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:zhenling-weiye:fifth-rank:${key}`;
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

const h = (key, title, sourceNameForm, sourceNote = "", options = {}) => f(key, title, sourceNameForm, "历史人物神格", sourceNote, options);

function office(key, title, sourceNameForm, sourceNote) {
  return { kind: "office", key, title, sourceNameForm, sourceNote };
}

function withSection(rows, section) {
  return rows.map((row, index) => ({ ...row, seatSide: section, section, sectionOrder: index + 1 }));
}

const mainRows = withSection([
  f("zhang-feng-fifth-position", "张奉", "九官尚書", "仙真", "夹注称其姓张、名奉、字公先、河内人，先任河北司命禁保侯，后为太极仙侯公并领北职。", {
    existingRef: "z3:zhang-feng",
    recordNature: "官号兼人名",
    identityNote: "夹注姓名与第三阶太极仙侯张奉相合，因此连接现有张奉页；九官尚书作为第五阶主位另存关系。"
  })
], "中位");

const leftRows = withSection([
  office("left-chancellor", "左相（第五阶名位）", "左相", "夹注称清虚真人曾任此位，又说小有洞天王真人替任并已度上清；姓名与换任次序仍不够清楚。"),
  f("guo-sichao", "郭四朝", "左仙公郭四朝兼玉臺執蓋郎", "仙真", "名号同时写出左仙公与玉台执盖郎。", { recordNature: "官号兼人名" }),
  h("wang-yaofu", "王遥甫", "左仙公王遥甫", "夹注称其为赤君弟子、齐献公时人。", { recordNature: "官号兼人名" }),
  f("xin-yanyun", "辛彦云", "辛彦雲", "仙真", "夹注称其为赤君弟子，并随师下降。", { recordNature: "单列人名" }),
  f("ding-shuying", "丁淑英", "朱陵嬪丁淑英", "仙真", "名录以朱陵嫔官号与姓名合列。", { recordNature: "官号兼人名" }),
  f("guanchengzi", "管城子", "管城子", "仙真", "夹注接写“尹虔子师”，现按管城子为尹虔子之师保存。", { recordNature: "单列人名" }),
  f("sumen-xiansheng", "苏门先生", "蘇門先生", "仙真", "原典只给通行称号。", { recordNature: "单列人名", confidence: "身份待考" }),
  f("zhou-shouling", "周寿陵", "周壽陵", "仙真", "原典以姓名独立列出。", { recordNature: "单列人名" }),
  f("meng-deran", "孟德然", "孟德然", "仙真", "夹注称其师为郑景女，未在本段进一步说明郑景女身份。", { recordNature: "单列人名" }),
  f("song-jun-fifth", "宋君（第五阶名位）", "宋君", "名录身份待考", "短称不足以与其他宋君合并。", { recordNature: "同神异号候选", confidence: "身份待考" }),
  f("li-facheng", "李法成", "李法成", "仙真", "夹注称赵广信为其师。", { recordNature: "单列人名" }),
  f("deng-yuanbo", "邓元伯", "鄧元伯", "仙真", "原典以姓名独立列出。", { recordNature: "单列人名" }),
  h("wang-xuanfu-fifth", "王玄甫（第五阶霍山人）", "王玄甫", "夹注只写“霍山人”，不能据同名直接并入元代全真祖统中的王玄甫。", { recordNature: "同神异号候选", confidence: "同一性有争议" }),
  f("yin-qianzi", "尹虔子", "尹䖍子", "仙真", "夹注只写“华山”。", { recordNature: "单列人名", confidence: "字形待校" }),
  f("zhang-shisheng", "张石生", "張石生", "仙真", "夹注称其为东源伯。", { recordNature: "官号兼人名" }),
  f("li-fanghui", "李方回", "李方回", "仙真", "相邻夹注说三人皆为晋时服食者，但“三人”所指边界仍待版本复核。", { recordNature: "单列人名", confidence: "身份待考" }),
  h("zhang-lizheng", "张礼正", "張禮正", "夹注称其在衡山，汉末服黄精。", { recordNature: "单列人名" }),
  f("zhi-mingqi", "治明期", "治明期", "仙真", "夹注只写“衡山”。", { recordNature: "单列人名" }),
  f("zheng-jingshi", "郑景世", "鄭景世", "仙真", "夹注只写“庐江潜山”。", { recordNature: "单列人名" })
], "左位");

const rightRows = withSection([
  office("right-chancellor", "右相（第五阶名位）", "右相", "夹注只写“已度上清”，没有保存任职者姓名。"),
  h("shao-gong-shi", "召公奭", "右保召公奭", "夹注称其从罗南明公受此位；本页只增加第五阶神谱身份。", { recordNature: "官号兼人名" }),
  office("sizhan-shanggong", "右保司展上公（第五阶名位）", "右保司展上公", "原典只保存官号，没有附姓名。"),
  f("guo-shaojin", "郭少金", "右眞公郭少金", "仙真", "名录保留右真公官号与姓名。", { recordNature: "官号兼人名" }),
  h("huang-jinghua", "黄景华", "恊晨夫人黄景華", "夹注称其为黄琼之女；这一说法只按本书人物谱系保存。", { recordNature: "官号兼人名" }),
  f("zhang-shuyin", "张叔隐", "文德右仙監張叔隱", "仙真", "名录保留文德右仙监官号与姓名。", { recordNature: "官号兼人名" }),
  f("yu-junzhang", "禺君章", "眞人禺君章", "仙真", "原行以真人称号与禺君章姓名合列。", { recordNature: "官号兼人名", confidence: "字形待校" }),
  h("zhang-chonghua", "张重华（第五阶名位）", "張重華", "夹注称其晋初服胡麻；短名与史籍同名人物的对应仍待考。", { recordNature: "同神异号候选", confidence: "身份待考" }),
  f("ping-zhongqing", "平仲卿", "平仲卿", "仙真", "夹注称其在括苍山，并有一处难以释读的受法字样。", { recordNature: "单列人名", confidence: "字形待校" }),
  h("zhao-guangxin", "赵广信", "趙廣信", "夹注称其在魏末的小白山，又在左位夹注中被称为李法成之师。", { recordNature: "单列人名" }),
  f("yu-gongsheng", "虞公生", "虞公生", "仙真", "夹注只写“海中狼山”。", { recordNature: "单列人名" }),
  f("zhu-ruzi", "朱孺子", "朱孺子", "仙真", "夹注只写“赤水山”。", { recordNature: "单列人名" }),
  f("huang-luzi", "黄卢子", "黄盧子", "仙真", "夹注称其姓葛、号西岳公，并有禁气召龙之说。", { recordNature: "官号兼人名" }),
  f("sun-tianguang", "孙田广", "孫田廣", "仙真", "夹注称其一名登。", { recordNature: "单列人名" }),
  f("mi-changsheng", "縻长生", "縻長生", "仙真", "夹注称其为周大宾弟子。", { recordNature: "单列人名" }),
  f("xu-zhao", "许肇", "許肇", "仙真", "夹注称其先在罗酆都，并任东明公右司晨；缺字不作猜补。", { recordNature: "官号兼人名", confidence: "字形待校" }),
  f("xu-fu", "许副", "許副", "仙真", "夹注称其字仲先，修大洞真经。", { recordNature: "单列人名" })
], "右位");

const positionRows = [...mainRows, ...leftRows, ...rightRows];

const headingRows = [
  {
    key: "left-scattered-ranks",
    title: "第五阶左位散位",
    sourceNameForm: "散位",
    section: "左位",
    summary: "左位在辛彦云之后转入散位，夹注说明这些人物尚未受正式职任。",
    memberKeys: leftRows.slice(4).map((row) => row.key)
  },
  {
    key: "right-scattered-ranks",
    title: "第五阶右位散位",
    sourceNameForm: "散位",
    section: "右位",
    summary: "右位在禺君章之后转入散位，随后十人以姓名和简短服食、地点或师承夹注列出。",
    memberKeys: rightRows.slice(7).map((row) => row.key)
  }
];

const locationRows = [
  { key: "huoshan", title: "霍山（第五阶修真地）", sourceNameForm: "霍山", confidence: "大致区域", memberKeys: ["wang-xuanfu-fifth"], summary: "第五阶夹注以“霍山人”说明王玄甫，但没有给出更精确的山中位置。" },
  { key: "huashan", title: "华山（第五阶修真地）", sourceNameForm: "華山", confidence: "大致区域", memberKeys: ["yin-qianzi"], summary: "第五阶在尹虔子名后只写“华山”，当前仅保存山岳线索。" },
  { key: "hengshan", title: "衡山（第五阶修真地）", sourceNameForm: "衡山", confidence: "大致区域", memberKeys: ["zhang-lizheng", "zhi-mingqi"], summary: "第五阶夹注把张礼正与治明期都连到衡山，其中张礼正另有汉末服黄精的说法。" },
  { key: "qianshan", title: "庐江潜山（第五阶修真地）", sourceNameForm: "廬江潜山", confidence: "大致区域", memberKeys: ["zheng-jingshi"], summary: "第五阶以“庐江潜山”标注郑景世，没有补充洞府或活动范围。" },
  { key: "kuocangshan", title: "括苍山（第五阶修真地）", sourceNameForm: "括蒼山", confidence: "大致区域", memberKeys: ["ping-zhongqing"], summary: "第五阶把平仲卿连到括苍山，受法夹注有一字难以释读。" },
  { key: "xiaobaishan", title: "小白山（第五阶修真地）", sourceNameForm: "小白山", confidence: "多种说法", memberKeys: ["zhao-guangxin"], summary: "第五阶称赵广信在魏末居小白山，山名的现代对应暂不固定。" },
  { key: "langshan", title: "狼山（第五阶海中仙山）", sourceNameForm: "海中狼山", confidence: "无法对应", memberKeys: ["yu-gongsheng"], summary: "第五阶只用“海中狼山”标注虞公生，现实地点与仙传空间无法据此确定。" },
  { key: "chishuishan", title: "赤水山（第五阶修真地）", sourceNameForm: "赤水山", confidence: "多种说法", memberKeys: ["zhu-ruzi"], summary: "第五阶以赤水山标注朱孺子，同名山地较多，当前不生成现代坐标。" }
];

function summaryFor(row) {
  if (row.kind === "office") return `${row.title}是《真灵位业图》第五阶${row.section}第 ${row.sectionOrder} 项。${row.sourceNote}`;
  if (row.sourceNote) return `${row.title}列于《真灵位业图》第五阶${row.section}第 ${row.sectionOrder} 项。${row.sourceNote}`;
  return `${row.title}列于《真灵位业图》第五阶${row.section}第 ${row.sectionOrder} 项；原文没有附加可核实的生平。`;
}

function renderFigureArticle(row) {
  const clue = row.sourceNote || `本行只保存“${row.sourceNameForm}”这一写法及其在第五阶${row.section}的位置。`;
  const identity = row.identityNote || (row.recordNature === "官号兼人名"
    ? `页面同时保存${row.title}的姓名与官号，但不把第五阶名位写成其一生不变的身份。`
    : row.recordNature === "同神异号候选"
      ? `短名或近名不足以把${row.title}与其他时代的同名人物合并，后续证据通过争议关系并列。`
      : `${row.title}可以独立检索，夹注没有交代的籍贯、年代、法器和眷属继续留白。`);
  return [
    `<p>${escapeHtml(summaryFor(row))}</p>`,
    "<h2>原名与位次</h2>",
    `<p>现用底本写作“${escapeHtml(row.sourceNameForm)}”，位于第五中位${escapeHtml(row.section)}第 ${row.sectionOrder} 项。次序只还原这一段名录，不换算成后世固定品级。</p>`,
    "<h2>夹注线索</h2>",
    `<p>${escapeHtml(clue)}</p>`,
    "<h2>身份处理</h2>",
    `<p>${escapeHtml(identity)}</p>`,
    "<h2>创作边界</h2>",
    `<p>若作者为“${escapeHtml(row.title)}”补写形象、性格、法术或剧情，新增部分必须标为 Worldcraft Codex 原创改编。名录和夹注不能替代一篇完整古传。</p>`
  ].join("");
}

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: zhenlingFifthEntityId(row.key, worldId),
    worldId,
    type: "character",
    title: row.title,
    slug: `mythology-zhenling-fifth-rank-${row.key}`,
    summary: summaryFor(row),
    content: renderFigureArticle(row),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第五阶", row.section, row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-5"),
    order,
    templateId: `template:${worldId}:mythology:zhenling-catalog-entry`,
    templateData: {
      canonicalName: row.title,
      sourceNameForm: row.sourceNameForm,
      tradition: "道教",
      identityType: row.identityType,
      pantheonSystem: "《洞玄灵宝真灵位业图》七阶神谱",
      rankPosition: "第五阶 · 九宫诸曹",
      seatSide: row.seatSide,
      recordNature: row.recordNature,
      sourceLocation: `《洞玄灵宝真灵位业图》第五中位 · ${row.section}`,
      historicalLayer: "魏晋六朝",
      normalizationStatus: row.identityNote ? "连接既有身份" : row.confidence === "同一性有争议" ? "独立建页" : "待更多原典消歧",
      confidence: row.confidence,
      editorialStatus: "初步消歧",
      originalAdaptation: "false"
    }
  };
}

function renderInstitutionArticle(row, mode) {
  if (mode === "tier") return [
    "<p>第五中位以九官尚书为主位，夹注点明此职由张奉所居。左右位分别排列相、仙公、夫人、仙监和散位人物，规模不大，却保存了较密集的师承、服食与山岳线索。</p>",
    "<h2>名录规模</h2><p>本阶拆出三十七个名录位置：三十四项有可辨姓名，左相、右相和右保司展上公三项只有官号。张奉连接第三阶既有页面，其余人物独立建页。</p>",
    "<h2>散位结构</h2><p>左位与右位各有一条散位标记。左位夹注明说尚未受职，右位没有补充解释，因此两组只保存成员范围，不被改写成统一官署。</p>",
    "<h2>地点与师承</h2><p>霍山、华山、衡山、潜山、括苍山、小白山、海中狼山与赤水山按夹注建立地点索引；罗酆都连接既有幽冥地理页。地点不自动等同现代精确坐标。</p>",
    "<h2>阅读边界</h2><p>服胡麻、服黄精、修大洞真经和禁气召龙都只按夹注保存。缺字、短名和同名人物不由编辑者补成连贯仙传。</p>"
  ].join("");
  if (mode === "heading") return [
    `<p>${escapeHtml(row.summary)}</p>`,
    "<h2>原典位置</h2>",
    `<p>“${escapeHtml(row.sourceNameForm)}”位于第五中位${escapeHtml(row.section)}内部，是分隔职任与散列人物的结构标记，不是一位同名神。</p>`,
    "<h2>成员范围</h2>",
    `<p>本页连接 ${row.memberKeys.length} 个随后列出的名位。每位人物仍保留自己的原名、夹注和次序，分组页不替代人物页。</p>`,
    "<h2>统计方式</h2>",
    `<p>${escapeHtml(row.title)}计作一条结构记录，不计入已消歧人物数，也不意味着所有成员共享同一种神职。</p>`,
    "<h2>创作边界</h2>",
    `<p>若为${escapeHtml(row.title)}设计办公制度、成员日常或共同任务，这些细节须标注 Worldcraft Codex 原创改编。</p>`
  ].join("");
  return [
    `<p>${escapeHtml(summaryFor(row))}</p>`,
    "<h2>原典写法</h2>",
    `<p>第五中位${escapeHtml(row.section)}第 ${row.sectionOrder} 项写作“${escapeHtml(row.sourceNameForm)}”。当前没有姓名可与这项官职稳定对应。</p>`,
    "<h2>职任线索</h2>",
    `<p>${escapeHtml(row.sourceNote)}</p>`,
    "<h2>身份处理</h2>",
    `<p>${escapeHtml(row.title)}以制度页保存，不生成无名人物。以后若发现候选身份，也先建立带出处的争议关系。</p>`,
    "<h2>创作边界</h2>",
    `<p>任职者姓名、权力范围和办公场景若由作者补写，必须标注 Worldcraft Codex 原创改编。</p>`
  ].join("");
}

function buildInstitutionEntity(row, order, worldId, now, mode) {
  const isTier = mode === "tier";
  const isHeading = mode === "heading";
  return {
    id: zhenlingFifthEntityId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-zhenling-fifth-rank-${row.key}`,
    summary: row.summary || summaryFor(row),
    content: renderInstitutionArticle(row, mode),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第五阶", isTier ? "七阶结构" : isHeading ? "散位分组" : "无名神职", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-5"),
    order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "道教",
      institutionKind: isTier ? "神谱阶位" : isHeading ? "神谱散位分组" : "无名神职",
      hierarchyLevel: isTier ? "第五阶 · 九宫诸曹" : `第五阶 · ${row.section}`,
      jurisdiction: isTier ? "保存九官尚书主位、左右位、散位和夹注次序" : isHeading ? "连接原典散位标记之后的成员" : "仅保存官号与有限换任线索",
      formationPeriod: "齐梁神谱整理层",
      earliestSource: "《洞玄灵宝真灵位业图》",
      sourceLocation: isTier ? "第五中位" : `第五中位 · ${row.section}`,
      variants: isTier ? "按现用道藏本文字分段；正文与夹注分别记录。" : `原典作“${row.sourceNameForm}”。`,
      confidence: row.kind === "office" ? "存疑" : "明确"
    }
  };
}

function renderLocationArticle(row) {
  return [
    `<p>${escapeHtml(row.summary)}</p>`,
    "<h2>原典线索</h2>",
    `<p>现用底本在第五中位人物夹注中写作“${escapeHtml(row.sourceNameForm)}”。页面只负责保存这一地点字串和关联人物。</p>`,
    "<h2>地理性质</h2>",
    `<p>${escapeHtml(row.title)}既可能指现实山岳，也可能经过仙传空间化。缺少路线、方位和年代证据时，不生成伪精确坐标。</p>`,
    "<h2>关联范围</h2>",
    `<p>本页连接 ${row.memberKeys.length} 位第五阶人物。关系证明夹注曾把人名与地点并列，不自动证明长期居住、建观或创派。</p>`,
    "<h2>创作边界</h2>",
    `<p>洞府、道路、聚落和山中事件若由项目补写，必须标注 Worldcraft Codex 原创改编。</p>`
  ].join("");
}

function buildLocationEntity(row, order, worldId, now) {
  return {
    id: zhenlingFifthEntityId(row.key, worldId),
    worldId,
    type: "location",
    title: row.title,
    slug: `mythology-zhenling-fifth-rank-${row.key}`,
    summary: row.summary,
    content: renderLocationArticle(row),
    tags: ["中国神话史", "道教神谱", "真灵位业图", "第五阶", "修真地理", row.sourceNameForm],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "zhenling-rank-5"),
    order,
    templateId: `template:${worldId}:mythology:sacred-geography`,
    templateData: {
      spaceKind: row.confidence === "无法对应" ? "神话空间" : "存疑对应",
      tradition: "道教",
      historicalPeriod: "齐梁神谱整理层",
      sourceTitle: "《洞玄灵宝真灵位业图》",
      sourceLocation: "第五中位人物夹注",
      modernCorrespondence: row.confidence === "无法对应" ? "现有短句无法对应现代地点。" : "仅保存传统山名；现代对应需另以地志和历史地理复核。",
      confidence: row.confidence,
      mapCaution: "现实山岳、同名地点与仙传空间分层展示，夹注不生成精确经纬度。"
    }
  };
}

function resolveRowRef(row) {
  return row.existingRef || `z5:${row.key}`;
}

function resolveRef(reference, worldId) {
  const [scope, key] = reference.split(":");
  if (scope === "z5") return zhenlingFifthEntityId(key, worldId);
  if (scope === "z3") return zhenlingThirdEntityId(key, worldId);
  if (scope === "z4") return zhenlingFourthEntityId(key, worldId);
  if (scope === "zs") return zhenlingSourceId(worldId);
  if (scope === "d") return daoismEntityId(key, worldId);
  if (scope === "dl") return lineageEntityId(key, worldId);
  if (scope === "cb") return celestialEntityId(key, worldId);
  throw new Error(`未知《真灵位业图》第五阶引用：${reference}`);
}

function buildRelation({ key, sourceRef, targetRef, kind, label, direction = "directed", strength = 5, evidenceType = "primary-text", sourceCitation = "《洞玄灵宝真灵位业图》第五中位", historicalScope = "齐梁神谱整理层", confidence = "certain", notes }, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:zhenling-fifth-rank:${key}`,
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
  const tierRef = "z5:fifth-rank-nine-offices";
  const sourceRelations = [
    buildRelation({ key: "source-tier-fifth-rank", sourceRef: tierRef, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第五阶结构原典", notes: "第五中位主位、左右位、散位与夹注均据现用底本整理。" }, worldId, now),
    ...positionRows.map((row) => buildRelation({ key: `source-position-${row.key}`, sourceRef: resolveRowRef(row), targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第五阶列名出处", notes: `原典以“${row.sourceNameForm}”列入第五阶${row.section}第 ${row.sectionOrder} 项；关系只证明列名与位置。` }, worldId, now)),
    ...headingRows.map((row) => buildRelation({ key: `source-heading-${row.key}`, sourceRef: `z5:${row.key}`, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第五阶散位标记出处", notes: `原典以“${row.sourceNameForm}”分隔${row.section}职任与散位人物。` }, worldId, now)),
    ...locationRows.map((row) => buildRelation({ key: `source-location-${row.key}`, sourceRef: `z5:${row.key}`, targetRef: "zs:zhenling-weiye-tu", kind: "source", label: "第五阶地点夹注出处", notes: `“${row.sourceNameForm}”见于第五中位人物夹注，地点页不扩大原文范围。` }, worldId, now))
  ];
  const membershipRelations = [
    ...positionRows.map((row) => buildRelation({ key: `rank-membership-${row.key}`, sourceRef: tierRef, targetRef: resolveRowRef(row), kind: "contains", label: row.kind === "office" ? `第五阶${row.section}无名神职` : `第五阶${row.section}名位`, notes: `按现用底本收录“${row.sourceNameForm}”；第五阶归属不覆盖人物其他历史层。` }, worldId, now)),
    ...headingRows.map((row) => buildRelation({ key: `rank-heading-${row.key}`, sourceRef: tierRef, targetRef: `z5:${row.key}`, kind: "contains", label: "第五阶散位分组", notes: `${row.title}保存原典散位标记及成员范围。` }, worldId, now)),
    ...locationRows.map((row) => buildRelation({ key: `rank-location-${row.key}`, sourceRef: tierRef, targetRef: `z5:${row.key}`, kind: "contains", label: "第五阶夹注所见地点", notes: `${row.title}由第五中位人物夹注建立。` }, worldId, now))
  ];
  const headingMemberships = headingRows.flatMap((heading) => heading.memberKeys.map((memberKey) => {
    const member = positionRows.find((row) => row.key === memberKey);
    return buildRelation({ key: `${heading.key}-member-${memberKey}`, sourceRef: `z5:${heading.key}`, targetRef: resolveRowRef(member), kind: "contains", label: `${heading.section}散位成员`, notes: `“${member.sourceNameForm}”位于“散位”标记之后、下一分区之前。` }, worldId, now);
  }));
  const explicitRelations = [
    buildRelation({ key: "left-chancellor-wang-bao-disputed", sourceRef: "z5:left-chancellor", targetRef: "d:wang-bao-qingxu", kind: "disputed", label: "第五阶左相与清虚真人王褒的对应待考", strength: 2, evidenceType: "scholarly-inference", confidence: "disputed", notes: "夹注出现清虚真人、小有洞天王受与王真人替任等语，句法不足以直接锁定王褒。" }, worldId, now),
    buildRelation({ key: "wang-yaofu-xin-yanyun-companions", sourceRef: "z5:wang-yaofu", targetRef: "z5:xin-yanyun", kind: "custom", direction: "mutual", label: "夹注均称赤君弟子", notes: "两条相邻夹注共享赤君师名，但赤君身份未在本段展开，故只建立同门关系。" }, worldId, now),
    buildRelation({ key: "guanchengzi-teaches-yin-qianzi", sourceRef: "z5:guanchengzi", targetRef: "z5:yin-qianzi", kind: "teacher", label: "夹注称管城子为尹虔子师", confidence: "probable", notes: "夹注紧接管城子之后，按当前断句保存；若异本改变归属再修订。" }, worldId, now),
    buildRelation({ key: "zhao-guangxin-teaches-li-facheng", sourceRef: "z5:zhao-guangxin", targetRef: "z5:li-facheng", kind: "teacher", label: "夹注称赵广信为李法成师", notes: "赵广信稍后在右位散位中单列，因此两处姓名合并为同一页。" }, worldId, now),
    buildRelation({ key: "zhou-dabin-teaches-mi-changsheng", sourceRef: "z4:zhou-dabin", targetRef: "z5:mi-changsheng", kind: "teacher", label: "夹注称縻长生为周大宾弟子", notes: "周大宾已在第四阶建页，第五阶只新增跨阶师承。" }, worldId, now),
    buildRelation({ key: "wang-xuanfu-quanzhen-disputed", sourceRef: "z5:wang-xuanfu-fifth", targetRef: "dl:wang-xuanfu", kind: "disputed", label: "霍山人王玄甫与全真祖统王玄甫同一性待考", strength: 2, evidenceType: "scholarly-inference", confidence: "disputed", notes: "第五阶夹注的霍山线索与元代全真祖统叙述年代相隔很远，不能仅按姓名合页。" }, worldId, now),
    ...locationRows.flatMap((row) => row.memberKeys.map((memberKey) => buildRelation({ key: `${memberKey}-located-${row.key}`, sourceRef: `z5:${memberKey}`, targetRef: `z5:${row.key}`, kind: "located", label: `夹注记“${row.sourceNameForm}”`, notes: `关系只保存第五中位夹注中的地点字串，不推定精确洞府或长期居住。` }, worldId, now))),
    buildRelation({ key: "xu-zhao-luofeng", sourceRef: "z5:xu-zhao", targetRef: "cb:luofeng-fengdu", kind: "located", label: "夹注称许肇先在罗酆都", notes: "本关系连接既有罗酆山神话空间页；原文缺字不影响地点本身的识别。" }, worldId, now)
  ];
  return [...sourceRelations, ...membershipRelations, ...headingMemberships, ...explicitRelations];
}

function buildTimelineEvents(worldId, now) {
  const event = (key, entityRef, trackKey, title, summary, sortOrder, era, references) => ({
    id: `timeline-event:${worldId}:mythology:zhenling-fifth-rank:${key}`,
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
    event("fifth-rank-compiled", "z5:fifth-rank-nine-offices", "textual-evidence", "第五中位形成九官诸曹名录", "三十七个位置保存九官尚书主位、左右相、仙公、夫人、仙监与散位人物。", 532, "齐梁神谱整理层", ["z5:fifth-rank-nine-offices", "zs:zhenling-weiye-tu"]),
    event("fifth-rank-annotations", "z5:zhang-lizheng", "textual-evidence", "第五阶夹注密集保存师承、服食与山名", "赤君弟子、赵广信师承、汉末服黄精及多处山名与正文列名并存，缺字与短句仍保留复核状态。", 533, "齐梁名录夹注层", ["z5:zhang-lizheng", "z5:zhao-guangxin", "z5:wang-yaofu", "zs:zhenling-weiye-tu"]),
    event("fifth-rank-chancellors", "z5:left-chancellor", "religious-institutions", "第五阶以左右相和散位区分职任层次", "左右相与有官号者在前，散位标记把尚未受职或另列的人物分组，但两侧说明并不完全相同。", 534, "齐梁九宫神职层", ["z5:left-chancellor", "z5:right-chancellor", "z5:left-scattered-ranks", "z5:right-scattered-ranks"]),
    event("zhang-feng-nine-offices", "z3:zhang-feng", "religious-institutions", "张奉由第三阶太极仙侯名位连接第五阶九官尚书", "第五阶主位夹注明记张奉姓名与旧职，使同一人物在两阶中的不同官号可以并列阅读。", 535, "齐梁跨阶仙职层", ["z3:zhang-feng", "z5:fifth-rank-nine-offices", "zs:zhenling-weiye-tu"]),
    event("historical-figures-fifth", "z5:shao-gong-shi", "cult-evolution", "召公奭与带有时代夹注的人物进入第五阶", "召公奭、王遥甫、张礼正、赵广信等被放入九宫诸曹，古史人物与仙传身份由此形成不同资料层。", 536, "中古历史人物仙化层", ["z5:shao-gong-shi", "z5:wang-yaofu", "z5:zhang-lizheng", "z5:zhao-guangxin"]),
    event("fifth-rank-mountain-network", "z5:hengshan", "cult-evolution", "第五阶人物夹注形成多山修真地理网", "霍山、华山、衡山、潜山、括苍山、小白山、海中狼山、赤水山与罗酆都通过人物夹注进入同一知识图谱。", 537, "中古仙传地理层", ["z5:hengshan", "z5:huoshan", "z5:langshan", "cb:luofeng-fengdu"])
  ];
}

function assertBatchShape() {
  const figures = positionRows.filter((row) => row.kind === "figure");
  const offices = positionRows.filter((row) => row.kind === "office");
  const reused = figures.filter((row) => row.existingRef);
  if (mainRows.length !== 1) throw new Error(`${BATCH_LABEL}中位项目应为 1，实际为 ${mainRows.length}`);
  if (leftRows.length !== 19) throw new Error(`${BATCH_LABEL}左位项目应为 19，实际为 ${leftRows.length}`);
  if (rightRows.length !== 17) throw new Error(`${BATCH_LABEL}右位项目应为 17，实际为 ${rightRows.length}`);
  if (positionRows.length !== 37) throw new Error(`${BATCH_LABEL}名录项目应为 37，实际为 ${positionRows.length}`);
  if (figures.length !== 34) throw new Error(`${BATCH_LABEL}可辨人物名位应为 34，实际为 ${figures.length}`);
  if (offices.length !== 3) throw new Error(`${BATCH_LABEL}无名神职应为 3，实际为 ${offices.length}`);
  if (reused.length !== 1) throw new Error(`${BATCH_LABEL}连接既有身份应为 1，实际为 ${reused.length}`);
  if (headingRows.length !== 2) throw new Error(`${BATCH_LABEL}散位结构应为 2，实际为 ${headingRows.length}`);
  if (locationRows.length !== 8) throw new Error(`${BATCH_LABEL}地点索引应为 8，实际为 ${locationRows.length}`);
  if (new Set(positionRows.map((row) => row.key)).size !== positionRows.length) throw new Error(`${BATCH_LABEL}名位键重复`);
  if (new Set(positionRows.map((row) => row.sourceNameForm)).size !== positionRows.length) throw new Error(`${BATCH_LABEL}原典名号重复`);
}

function buildZhenlingFifthRankBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const newFigureRows = positionRows.filter((row) => row.kind === "figure" && !row.existingRef);
  const officeRows = positionRows.filter((row) => row.kind === "office");
  const figures = newFigureRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const tier = buildInstitutionEntity({ key: "fifth-rank-nine-offices", title: "《真灵位业图》第五阶（九宫诸曹）", sourceNameForm: "第五中位", section: "中位", summary: "九官尚书张奉所主的第五阶，共拆出三十七个名录位置，并保留左右散位和人物夹注。" }, figures.length, worldId, now, "tier");
  const offices = officeRows.map((row, index) => buildInstitutionEntity(row, figures.length + 1 + index, worldId, now, "office"));
  const headings = headingRows.map((row, index) => buildInstitutionEntity(row, figures.length + offices.length + 1 + index, worldId, now, "heading"));
  const locations = locationRows.map((row, index) => buildLocationEntity(row, figures.length + offices.length + headings.length + 1 + index, worldId, now));
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...figures, tier, ...offices, ...headings, ...locations],
    figures,
    institutions: [tier, ...offices, ...headings],
    locations,
    sources: [],
    catalogPositions: positionRows.map((row) => ({ ...row, ref: resolveRowRef(row) })),
    relations: buildRelations(worldId, now),
    timelineEvents: buildTimelineEvents(worldId, now),
    featuredEntityIds: [tier.id, zhenlingFifthEntityId("wang-xuanfu-fifth", worldId), zhenlingFifthEntityId("shao-gong-shi", worldId), zhenlingFifthEntityId("hengshan", worldId)]
  };
}

module.exports = { BATCH_KEY, BATCH_LABEL, buildZhenlingFifthRankBatch, zhenlingFifthEntityId };
