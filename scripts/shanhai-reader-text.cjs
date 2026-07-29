const chapterIntroductions = {
  南山经: "《南山经》是五藏山经的第一篇，自南方山系写起，记述山川次序、草木矿产、异兽形貌及其效验。",
  西山经: "《西山经》沿西方山系展开，昆仑、华山等重要神山与大量神兽、神木和祭祀记录集中见于本篇。",
  北山经: "《北山经》记述北方山川与水系，篇幅宏富，保存了诸多异兽、怪鸟、鱼类及灾异征兆。",
  东山经: "《东山经》依次描绘东方诸山，重点记录山中物产、奇异生灵以及河流的发源与流向。",
  中山经: "《中山经》是五藏山经中篇幅最长的一篇，围绕中部山系、江汉水系、山神形貌与祭礼展开。",
  海外南经: "《海外南经》从海外南方写起，记录羽民、交胫等国族，以及分布在南方海域之外的神人与异兽。",
  海外西经: "《海外西经》描写海外西方的国族、神山与神话人物，刑天、夸父等著名形象均见于相关记载。",
  海外北经: "《海外北经》记述海外北方的奇国异民、神灵与地理景观，兼有相柳、烛阴等重要神话。",
  海外东经: "《海外东经》篇幅精炼，围绕海外东方诸国、扶桑、汤谷以及日月运行等内容展开。",
  海内南经: "《海内南经》记录海内南方的山川、国族与异兽，多以彼此方位关系勾勒出古代想象中的南方世界。",
  海内西经: "《海内西经》以昆仑为中心描绘海内西方，集中记载帝之下都、开明兽、不死树与诸巫等神话景观。",
  海内北经: "《海内北经》记述海内北方的国族、异兽和神话遗迹，其中包含犬戎、穷奇、驺吾等著名条目。",
  海内东经: "《海内东经》以河流源流和东方地理为主线，保存了黄河、淮水、济水等水系的古代叙述。",
  大荒东经: "《大荒东经》描绘大荒东方的神山、国族与帝王谱系，少昊、帝俊及日月神话在本篇多有呈现。",
  大荒南经: "《大荒南经》记述大荒南方的山海、神人和异兽，羲和浴日、鲧禹治水等神话与本篇关系密切。",
  大荒西经: "《大荒西经》汇集大荒西方的神山、国族与天象神话，西王母、女娲、日月山等记载尤为重要。",
  大荒北经: "《大荒北经》描写大荒北方的神灵、国族和战争传说，黄帝、蚩尤、夸父等故事在此交织。",
  海内经: "《海内经》综述海内山川、族群与古帝世系，并以鲧禹治水等叙事为全书作结。"
};

const chapterStoryAngles = {
  南山经: "这是一条很适合用作开篇远征的路线。饥饿、迷途、陌生山兽与能够救命的草木接连出现，人物每得到一种帮助，也会更深地踏入无人知晓的南方群山。",
  西山经: "西方群山富饶而神圣，金玉、祭礼与守山之神让这里天然带有争夺意味。故事的矛盾可以落在探险者、采掘者与古老禁忌之间，越珍贵的收获，代价越难回避。",
  北山经: "北方山水辽阔而寒冷，异兽和灾兆往往先于人声出现。沿河追索、雪地失踪和边地求生都能在本篇找到支点，危险也常常来自人们对征兆的误读。",
  东山经: "东部诸山以连续行进和河流源头串联起来，适合写成一场逐步逼近真相的调查旅程。每越过一座山，队伍都会发现上游正在发生的事，最终会在下游留下后果。",
  中山经: "中部山系像一张彼此咬合的政治与祭祀地图。山神、河流、矿产和祭礼相互牵制，适合承载诸侯争界、祭仪失序以及守山者之间漫长的旧怨。",
  海外南经: "海外南方的国族与异人彼此遥望，却未必真正了解对方。使团、流亡者或迷航船队进入这里后，很容易被卷入风俗冲突，也可能发现所谓怪异只是旁观者的误解。",
  海外西经: "刑天、夸父等未竟的抗争让西方海外带着强烈的悲剧余韵。人物可以追随失败者留下的道路，在旧战场、神山与异国之间寻找一场被胜者改写的真相。",
  海外北经: "北方海外适合写成冷峻的边境神话：洪水遗迹、长夜和庞大神灵共同压迫着这里的人。故事不必从英雄开始，也可以从负责守望异兆的小人物开始。",
  海外东经: "东方海外与日出、扶桑和时间秩序紧密相连。若太阳没有按时升起，最先发现问题的或许不是神，而是一群靠潮汐、光照和候鸟生活的普通人。",
  海内南经: "南方海内由方位、道路与族群关系织成，适合表现边界如何被讲述出来。一次地图勘定、一桩跨族婚约或一场失踪，都可能让看似稳定的疆界重新移动。",
  海内西经: "昆仑周围的神树、守门者与不死传说构成了一座层层设防的神话中心。闯入者真正面对的未必是不死的诱惑，而是自己愿意为此舍弃什么。",
  海内北经: "北方海内同时容纳珍兽、强族和古老遗迹，适合写成多方势力围绕同一线索展开的追逐。谁先找到目标并不重要，谁能带着它离开才是故事的核心。",
  海内东经: "本篇的河流谱系天然就是一条侦查路线。上游发生的隐秘会在下游显形，人物只要沿水而行，就会逐渐拼起一场横跨多地的灾难或阴谋。",
  大荒东经: "东方大荒里的日月秩序、帝王谱系和神山彼此牵连，适合写宏大的家族秘密。一次天象失常，可能只是某段被压下的血缘重新要求世人承认。",
  大荒南经: "南方大荒把洪水、烈日和神人命运放在同一片炽热土地上。求雨、治水与救亡都能成为主线，而每一种拯救方式都可能伤害另一群人。",
  大荒西经: "西方大荒充满残缺的身体、停滞的日月与未结束的战争。这里适合讲失败者如何存活，也适合追问一场古老胜利究竟掩埋了多少名字。",
  大荒北经: "北方大荒聚集黄帝、蚩尤、夸父等冲突余波，战争从未真正远去。后世人物寻找遗物或失踪者时，会一步步走进当年没有被解决的仇恨。",
  海内经: "全书在这里收束到世系、洪水与文明起源。一个追查祖先身份的人，可以沿鲧禹治水的旧路回望全书，并发现家族记忆与天下秩序原来出自同一道裂缝。"
};

const kindMeta = {
  异兽生灵: { label: "异兽", category: "异兽图鉴", noun: "异兽或奇异生灵" },
  异兽: { label: "异兽", category: "异兽图鉴", noun: "异兽或奇异生灵" },
  山岳: { label: "山川地貌", category: "山岳与地貌", noun: "山岳或地貌" },
  水系: { label: "水系", category: "河流与水域", noun: "河流或水域" },
  邦国族群: { label: "国族", category: "国族与部落", noun: "国族或部落" },
  国族: { label: "国族", category: "国族与部落", noun: "国族或部落" },
  草木药物: { label: "草木", category: "草木与药物", noun: "草木或药物" },
  草木: { label: "草木", category: "草木与药物", noun: "草木或药物" },
  神祇人物: { label: "神祇与人物", category: "全书人物", noun: "神祇或人物" },
  神祇与人物: { label: "神祇与人物", category: "全书人物", noun: "神祇或人物" },
  神物与其他: { label: "神物与其他", category: "神物与其他", noun: "奇异名物" },
  其他名物: { label: "神物与其他", category: "神物与其他", noun: "奇异名物" }
};

const ORIGINAL_ADAPTATION_NOTICE = "本节由 Worldcraft Codex 编写，仅供故事创作，不属于《山海经》原文或传统传说。";

function originalAdaptationNotice() {
  return `<p><strong>原创声明：</strong>${escapeHtml(ORIGINAL_ADAPTATION_NOTICE)}</p>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function compact(value) {
  return String(value ?? "")
    .replace(/[\t ]+/g, " ")
    .replace(/\s+([，。；：！？])/g, "$1")
    .replace(/([，。；：！？])\s+/g, "$1")
    .trim();
}

function truncate(value, limit = 150) {
  const text = compact(value);
  if ([...text].length <= limit) return text;
  return `${[...text].slice(0, limit).join("").replace(/[，；：、\s]+$/u, "")}……`;
}

function seedNumber(value) {
  let result = 2166136261;
  for (const character of String(value || "山海经")) {
    result ^= character.codePointAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function stablePick(seed, values, offset = 0) {
  return values[(seedNumber(seed) + offset) % values.length];
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function polishTranslation(value) {
  let text = compact(value);
  text = text
    .replace(/名叫叫/g, "名叫")
    .replace(/有一处名为一座名叫([^，。；]{1,18})的地方的山/g, "有一座$1山")
    .replace(/有一处名为一座名叫([^，。；]{1,18})的地方/g, "有一处名为$1的地方")
    .replace(/有一座名叫([^，。；]{1,18})的山/g, "有一座$1山")
    .replace(/有一座名叫([^，。；]{1,18})山/g, "有一座$1山")
    .replace(/([东西南北]{1,2})([一二三四五六七八九十百千万零〇两廿卅]+里)，称作([^，。；]{1,18})之山/g, "向$1行进$2，来到$3山")
    .replace(/([东西南北]{1,2})([一二三四五六七八九十百千万零〇两廿卅]+里)，称作([^，。；]{1,18})山/g, "向$1行进$2，来到$3山")
    .replace(/位于([^，。；]{1,36})之的(东南|东北|西南|西北)方向/g, "位于$1$2方")
    .replace(/位于([^，。；]{1,36})的西的北方向/g, "位于$1西北方")
    .replace(/位于([^，。；]{1,36})的东的北方向/g, "位于$1东北方")
    .replace(/位于([^，。；]{1,36})的(东南|东北|西南|西北)方向/g, "位于$1$2方")
    .replace(/位于([^，。；]{1,36})的东方向/g, "位于$1以东")
    .replace(/位于([^，。；]{1,36})的西方向/g, "位于$1以西")
    .replace(/位于([^，。；]{1,36})的南方向/g, "位于$1以南")
    .replace(/位于([^，。；]{1,36})的北方向/g, "位于$1以北")
    .replace(/位于它的(东南|东北|西南|西北)方向/g, "位于其$1方")
    .replace(/皆位于西的北方向/g, "都位于西北方")
    .replace(/位于西的北方向/g, "位于西北方")
    .replace(/这里的树木以([^，。；]+)/g, "这里多生长$1")
    .replace(/这里的草以([^，。；]+)/g, "这里多生长$1")
    .replace(/这里的兽类以([^，。；]+)/g, "这里常见$1")
    .replace(/这里的鸟类以([^，。；]+)/g, "这里常见$1")
    .replace(/不生长草木，盛产水(?=[，。；])/g, "不生长草木，但水源丰富")
    .replace(/山下盛产水(?=[，。；])/g, "山下水源丰富")
    .replace(/盛产怪雨/g, "常有怪异的雨")
    .replace(/山上盛产雨/g, "山上常年多雨")
    .replace(/盛产火(?=[，。；])/g, "常有火焰")
    .replace(/盛产怪兽/g, "生活着许多怪兽")
    .replace(/盛产怪鸟/g, "生活着许多怪鸟")
    .replace(/盛产白猿/g, "有许多白猿")
    .replace(/水这里有一种兽/g, "水中有一种兽")
    .replace(/食用的人使人/g, "食用后会使人")
    .replace(/食用的人不受/g, "食用后可免受")
    .replace(/吃下它后已([^，。；]+)/g, "食用后可以缓解$1")
    .replace(/吃下它后不劳/g, "食用后可消除疲劳")
    .replace(/佩戴它后不迷(?=[，。；]|$)/g, "佩戴它便不会迷失方向")
    .replace(/名自号也/g, "鸣叫时会报出自己的名字")
    .replace(/其鸣自号也/g, "鸣叫时会报出自己的名字")
    .replace(/一旦出现就天下大旱/g, "一旦出现，天下便会发生大旱")
    .replace(/一旦出现就天下大水/g, "一旦出现，天下便会发生洪水")
    .replace(/一旦出现就其县/g, "一旦出现，当地便会")
    .replace(/([^，。；]{1,16})的事物(?=[，。；])/g, "$1")
    .replace(/称作/g, "叫作")
    .replace(/并且/g, "，")
    .replace(/，\s*，+/g, "，")
    .replace(/，([。；])/g, "$1")
    .replace(/；，/g, "；")
    .replace(/之的/g, "的")
    .replace(/于于/g, "于")
    .replace(/名为名为/g, "名为")
    .replace(/叫作叫作/g, "叫作")
    .replace(/\s+/g, " ")
    .trim();
  return text || compact(value);
}

function editorialTranslation(value, passage = {}) {
  const seed = passage.id || passage.originalText || value;
  const sentences = polishTranslation(value).match(/[^。！？；]+[。！？；]?/gu) || [];
  const creatureOpenings = {
    鸟: ["林间还栖息着一种鸟，", "当地另有一种鸟，", "山野间常能见到一种鸟，", "近旁还生活着一种鸟，"],
    兽: ["山中还栖息着一种兽，", "当地另有一种兽，", "荒野间出没着一种兽，", "山野里还生活着一种兽，"],
    鱼: ["水中还生活着一种鱼，", "当地水域另有一种鱼，", "水下常能见到一种鱼，", "这片水域还生有一种鱼，"],
    蛇: ["岩隙与草木间还栖息着一种蛇，", "当地另有一种蛇，", "山野间出没着一种蛇，", "岩地里还生活着一种蛇，"],
    虫: ["草木间还生有一种虫，", "当地另有一种虫，", "山野间常能见到一种虫，", "近旁还生活着一种虫，"],
    草: ["坡地上还生长着一种草，", "当地另有一种草，", "山中还生有一种草，", "坡上还长着一种草，"],
    木: ["山中还生长着一种树木，", "当地另有一种树木，", "林地间还生有一种树木，", "山林间还长着一种树木，"]
  };
  const genericOpenings = ["此地有", "当地还有", "其间有", "附近另有"];
  return sentences.map((sentence, index) => {
    let result = sentence.trim();
    result = result.replace(/^这里有一种([鸟兽鱼蛇虫草木])，?/u, (_, noun) => (
      stablePick(`${seed}:${noun}`, creatureOpenings[noun], index)
    ));
    result = result.replace(/^这里有/u, stablePick(seed, genericOpenings, index));
    result = result.replace(/，这里有一种([鸟兽鱼蛇虫草木])，?/gu, (_, noun) => (
      `，${stablePick(`${seed}:${noun}:mid`, creatureOpenings[noun], index)}`
    ));
    result = result.replace(/，这里有/gu, `，${stablePick(`${seed}:mid`, genericOpenings, index)}`);
    result = result
      .replace(/有人名叫/gu, "有一人名为")
      .replace(/有神名叫/gu, "有一位神名为")
      .replace(/有女子([^，。；]{0,24})名叫/gu, "有一名女子$1，名为")
      .replace(/名叫/gu, "名为")
      .replace(/外形像/gu, "形似")
      .replace(/其状像/gu, "形似")
      .replace(/这里多生长/gu, "当地多生长")
      .replace(/这里常见/gu, "当地常见")
      .replace(/方吃下它后/gu, "正在食用它")
      .replace(/吃下它后/gu, "食用后")
      .replace(/佩戴它后/gu, "佩在身上后")
      .replace(/第一列山系名为/gu, "记述的第一列山系叫作")
      .replace(/临于/gu, "坐落在")
      .replace(/盛产([^，。；]*(?:木|草|竹|桂|松|桑|棠))，盛产([^，。；]+)/gu, "多生长$1，也出产$2")
      .replace(/盛产([^，。；]+)，盛产([^，。；]+)/gu, "出产$1和$2")
      .replace(/其所下者有兵/gu, "它降临的地方会发生兵灾")
      .replace(/凡十这里有一座九山/gu, "共十九座山")
      .replace(/左耳这里有一种蛇/gu, "左耳上缠着一条蛇")
      .replace(/另一种说法称这里有/gu, "另一种说法还记有")
      .replace(/这里有/gu, "有")
      .replace(/是山也/gu, "这座山")
      .replace(/是水(?=[，。；])/gu, "这条水")
      .replace(/实惟/gu, "正是")
      .replace(/是多/gu, "这里多有")
      .replace(/其上/gu, "山上")
      .replace(/其下/gu, "山下")
      .replace(/其阴/gu, "山的北面")
      .replace(/其阳/gu, "山的南面")
      .replace(/其豪/gu, "身上的长毛")
      .replace(/状如/gu, "形似")
      .replace(/音如/gu, "叫声像")
      .replace(/其鸣自呼/gu, "鸣叫声像是在喊自己的名字")
      .replace(/服者不/gu, "服用后不会")
      .replace(/服者/gu, "服用后")
      .replace(/可以消除聋/gu, "能够缓解耳聋")
      .replace(/有一个名为([^，。；]{1,20})的国家/gu, "有一国名为$1")
      .replace(/有国叫作/gu, "有一国名为")
      .replace(/司之/gu, "守护这里")
      .replace(/其祠/gu, "祭祀它们时")
      .replace(/祭祀它们时之/gu, "祭祀它们时")
      .replace(/这里山神/gu, "这些山神")
      .replace(/其神皆/gu, "这些山神都")
      .replace(/其([一二三四五六七八九十百]+)神/gu, "其中$1位山神")
      .replace(/凡([一二三四五六七八九十百]+)山/gu, "共$1座山")
      .replace(/多生长桂(?=[，。；])/gu, "多生长桂木")
      .replace(/佩在身上后/gu, "佩在身上便")
      .replace(/方齿/gu, "牙齿方正")
      .replace(/反踵/gu, "脚跟反转")
      .replace(/无首/gu, "没有头")
      .replace(/的地方也(?=[，。；])/gu, "的地方")
      .replace(/，\s*，+/gu, "，");
    return result;
  }).join("");
}

function passageHint(entityTitle) {
  const parts = String(entityTitle || "").split(/\s+[·｜]\s+/u);
  const hint = parts.at(-1)?.trim() || "";
  return /^\d+$/.test(hint) ? "" : hint.replace(/^第?\d+段[:：]?\s*/u, "");
}

function passageDisplayTitle(chapterTitle, passage, existingTitle = "") {
  const original = String(passage.originalText || "");
  const mountain = original.match(/其首曰([^，。；]{1,16}?)(?:之山|山)(?=[，。；])/u)
    || original.match(/(?:曰|名曰)([^，。；]{1,16}?)(?:之山|山)(?=[，。；])/u);
  const named = original.match(/(?:其名曰|名曰)([^，。；]{1,16})(?=[，。；])/u);
  const country = original.match(/有国名曰([^，。；]{1,16})(?=[，。；])/u);
  const hint = mountain
    ? `${mountain[1]}山`
    : country?.[1] || named?.[1] || passageHint(existingTitle);
  return `${chapterTitle} · 第${passage.order}段${hint ? ` · ${hint}` : ""}`;
}

function naturalizeIndexTitle(name, kindLabel) {
  const value = compact(name).replace(/（[^）]+）$/u, "");
  if (kindLabel === "山岳" && !/(?:山|丘|陵|峰|岳|谷|林|原|野|堂|墟|冢|台|岩|穴)$/u.test(value)) return `${value}山`;
  if (kindLabel === "水系" && !/(?:水|河|江|泽|海|溪|渊|湖|池|川|井|淖)$/u.test(value)) return `${value}水`;
  if (kindLabel === "邦国族群" && !/(?:国|氏|民|族|人)$/u.test(value)) return `${value}国`;
  return value;
}

function readerKind(kindLabel) {
  return kindMeta[kindLabel] || kindMeta.其他名物;
}

function normalizeKindLabel(value) {
  return {
    异兽: "异兽生灵",
    国族: "邦国族群",
    草木: "草木药物",
    神祇与人物: "神祇人物",
    神物与其他: "其他名物"
  }[value] || value || "其他名物";
}

function classifyIndexKind({ name, currentKind, occurrences = [] }) {
  const normalizedName = compact(name).replace(/（[^）]+）$/u, "");
  const sourceKind = normalizeKindLabel(currentKind);
  const original = occurrences
    .map((item) => item.passage?.originalText || item.originalText || "")
    .join("。");
  if (sourceKind === "其他名物") {
    if (/(?:国|民|氏|族)$/u.test(normalizedName)) return "邦国族群";
    if (/(?:水|河|江|泽|海|溪|渊|湖|池|川|井|淖)$/u.test(normalizedName)) return "水系";
    if (/(?:山|丘|陵|峰|岳|谷|林|原|野|堂|墟|冢|台|岩|穴)$/u.test(normalizedName)) return "山岳";
    if (/(?:木|树|草|桑|松|棠|竹|华|果)$/u.test(normalizedName)) return "草木药物";
    if (/(?:鸟|兽|蛇|鱼|马|犬|狗|虫)$/u.test(normalizedName)) return "异兽生灵";
  }
  if (sourceKind !== "其他名物") return sourceKind;

  const term = escapeRegExp(normalizedName);
  const marker = new RegExp(`(?:一名曰|名曰|名为|谓之)${term}(?=[，。；]|$)`, "gu");
  const windows = [...original.matchAll(marker)].map((match) => (
    original.slice(Math.max(0, match.index - 56), match.index)
  ));
  const nounKinds = [
    { kind: "草木药物", pattern: /木|树|草|桑|竹/gu },
    { kind: "异兽生灵", pattern: /鸟|兽|鱼|蛇|虫|马|犬/gu },
    { kind: "水系", pattern: /水|渊|泽|井|河|江|海/gu },
    { kind: "邦国族群", pattern: /国|民|氏|族/gu },
    { kind: "神祇人物", pattern: /人|神|女子|帝女/gu },
    { kind: "山岳", pattern: /山|谷|林|丘|堂|冢/gu }
  ];
  for (const window of windows) {
    let nearest = null;
    for (const candidate of nounKinds) {
      const matches = [...window.matchAll(candidate.pattern)];
      const index = matches.at(-1)?.index ?? -1;
      if (index > (nearest?.index ?? -1)) nearest = { kind: candidate.kind, index };
      candidate.pattern.lastIndex = 0;
    }
    if (nearest) return nearest.kind;
  }
  return sourceKind;
}

function readingNotesForPassage(passage) {
  const original = String(passage.originalText || "");
  const notes = [
    { pattern: /其状如/u, quote: "其状如", text: "用熟悉的动物或器物作比较，说明异兽、鸟鱼或草木的外形。" },
    { pattern: /其音如/u, quote: "其音如", text: "以日常声音比拟鸣叫，读者可以把声音视作辨认这种生灵的重要线索。" },
    { pattern: /食之/u, quote: "食之", text: "指食用前文所说的草木、鱼兽或其他物产；后文通常接它带来的效验。" },
    { pattern: /佩之/u, quote: "佩之", text: "指把前文所说之物佩带在身上，而不是将它食用。" },
    { pattern: /见则/u, quote: "见则", text: "表示这种生灵一旦出现，随后便会发生相应的吉凶征兆。" },
    { pattern: /其鸣自号/u, quote: "其鸣自号", text: "意为它鸣叫时发出的声音像是在说出自己的名字。" },
    { pattern: /可以御/u, quote: "可以御", text: "这里的“御”有抵御、避免之意，后面接的是它能够防止的灾害。" },
    { pattern: /是多怪/u, quote: "是多怪", text: "表示当地怪异事物频繁出现，也常被用来渲染某片地域的危险。" },
    { pattern: /百神之所在/u, quote: "百神之所在", text: "说明此地被视为众神聚集或接受祭祀的场所。" }
    ,{ pattern: /出焉/u, quote: "出焉", text: "在山川记述中多指河流从这里发源，后文往往继续说明它流向何处。" }
    ,{ pattern: /其阳|其阴/u, quote: "其阳／其阴", text: "山南水北为“阳”，山北水南为“阴”；这里用于说明物产或水源所在的方位。" }
    ,{ pattern: /(?:一曰|又曰)/u, quote: "一曰／又曰", text: "表示另一种名称或另一种传本说法，未必与前文互相否定。" }
    ,{ pattern: /祠之|其祠/u, quote: "祠之／其祠", text: "以下内容转入祭祀方式，通常会交代祭品、用玉和埋藏等礼仪。" }
    ,{ pattern: /又[东南西北]{1,2}[一二三四五六七八九十百千万零〇两廿卅]+里/u, quote: "又……里", text: "这是山经常用的行路句式：先给方向与里程，再进入下一座山的物产和生灵。" }
    ,{ pattern: /(?:东|南|西|北|东北|东南|西北|西南)(?:流)?注于/u, quote: "注于", text: "这里交代水流去向，可与前面的发源地连起来读，形成一条连续水路。" }
    ,{ pattern: /有国名曰|有[^，。；]{1,10}之国/u, quote: "有国", text: "文字由山川转入国族记载；名称、方位和风俗往往是理解这一地区的三条线索。" }
    ,{ pattern: /(?:帝|神|人|女|妻|子|孙)[^。；]{0,20}生/u, quote: "生", text: "此处的“生”用于串联神人与族属的世系，重点在关系次序，不宜按现代年代直接换算。" }
  ].filter((item) => item.pattern.test(original));
  return notes.slice(0, 3);
}

function motifSentence(value) {
  const sentences = compact(value).match(/[^。！？；]+[。！？；]?/gu) || [];
  return sentences.find((sentence) => /大旱|洪水|兵灾|灾祸|疫病|毒|不迷|寿|治|缓解|消除|食用|佩戴|金|玉|不死/u.test(sentence))
    || sentences[0]
    || "";
}

function passageStorySeed(passage, relatedTitles = [], translation = editorialTranslation(passage.plainLanguageText, passage)) {
  const names = [...new Set(relatedTitles)].slice(0, 4);
  const motif = truncate(motifSentence(translation).replace(/[。；]$/u, ""), 62);
  const focus = names.length
    ? names.slice(0, 3).join("、")
    : passage.sectionTitle || "这片无名之地";
  const spare = names[3] || names[0] || "旧路上的见证者";
  const original = String(passage.originalText || "");
  const groups = [];
  if (/见则|大旱|大水|兵|灾|恐|疫/u.test(original + translation)) {
    groups.push(
      `先写${focus}的传闻如何改变日常：封路、迁居、囤粮，甚至把陌生人当成灾祸的源头。等到“${motif}”真的应验，最值得追问的反而是谁借恐惧得到了权力。`,
      `“${motif}”很适合成为一则人人都听过、却没人亲眼见过的预兆。让${spare}在异兆出现前就被定罪，故事的分量会落在众人是否愿意承认自己看错了。`,
      `${focus}可以被写成一场缓慢逼近的灾变，而不是突然降下的天罚。最早变化的是市价、鸟群与人的口风，真正的异象反而最后才出现。`
    );
  }
  if (/食之|佩之|服之|可以御|可以已|不饥|不聋|不惑|治|消除|缓解/u.test(original + translation)) {
    groups.push(
      `古书只说“${motif}”，没有替人决定这份效验该归谁。把${focus}放进一次救命却不能两全的选择里，人物的立场会比神物本身更耐写。`,
      `${focus}适合从一次失效写起：过去人人相信“${motif}”，偏偏这回没有奏效。采集者、病人和守护者会因此给出三种完全不同的解释。`,
      `别急着把${focus}当作奖赏。若“${motif}”确有其事，采摘、服食或佩带它的人也该承担代价；这份代价可以来自身体，也可以来自一条守了许多年的旧规矩。`
    );
  }
  if (/又[东南西北]|[东南西北](?:流)?注于|出焉|入海|流入/u.test(original + translation)) {
    groups.push(
      `这一段本身就是路线。让人物依次经过${focus}，每一处地名都提供一条可靠线索，却把他们带向错误的终点；回头再读“${motif}”，才会看见被忽略的方向。`,
      `可以把${focus}之间的距离写进人物关系：同行者越往前走，彼此的说法越对不上。路没有变，变的是有人不愿抵达原定的终点。`,
      `从${focus}出发写一趟逆行会更有意思。人物沿水路或山序追索源头，沿途看到的后果越来越轻，直到源头处只剩一个极小、却不能挽回的选择。`
    );
  }
  if (/祠|祭|珪|璧|糈|牲/u.test(original + translation)) {
    groups.push(
      `${focus}的祭礼不妨从一次小小的省略开始。有人少放了一件祭物，起初什么也没有发生；几个月后，人们才发现失去的不是神佑，而是维系各村信任的凭据。`,
      `“${motif}”背后应当有具体的人来准备、搬运和守夜。把故事交给这些无名的执礼者，神意会从他们的迟疑与争执中慢慢显出来。`,
      `让两地都声称自己保存着${focus}的正统祭法。争论表面围绕礼数，深处却牵着水源、婚盟和旧年的死者，任何一次让步都会伤到活人的生活。`
    );
  }
  if (/(?:帝|神|人|女|妻|子|孙)[^。；]{0,20}生|杀|攻|伐|逐/u.test(original + translation)) {
    groups.push(
      `${focus}之间的关系不要只写成一张世系表。挑一位没有留下姓名的人，让他在两代神人之间传递命令、遗物或谎言，宏大的谱系就会有人的温度。`,
      `这一段适合从后代写起。后人只记得“${motif}”，却要替从未见过的祖先偿还承诺；他越追查${focus}，越难把血缘与责任当成同一件事。`,
      `${focus}的旧事可以拆成几份互相冲突的家族记忆。没有哪一份完全虚假，只是每一代人都删去了最不愿交代的那一夜。`
    );
  }
  if (!groups.length) {
    groups.push(
      `先从${focus}留下的一件小事写起：一段脚印、一笔交换，或一句被传错的话。“${motif}”不必马上解释，让人物在各自的需要里慢慢把它读成不同的意思。`,
      `${focus}最适合作为地方生活的一部分出现，而不是陈列在冒险者面前。等外来者打破原有节奏，读者才会明白“${motif}”对当地人究竟意味着什么。`,
      `把“${motif}”交给两个立场相反的人。一个把它当经验，一个把它当禁令；他们围绕${focus}作出的选择，会自然长出故事。`
    );
  }
  const selected = stablePick(`${passage.id}:${motif}`, groups);
  if (!motif || selected.includes(motif)) return selected;
  const factBridges = [
    `原文中的“${motif}”，适合留作人物彼此核对经历的一处实证。`,
    `落笔时不妨保留“${motif}”这句具体记载，让想象始终贴着原文生长。`,
    `至于原文所说“${motif}”，可以让不同人物各自解释，但不要轻易替他们判定。`,
    `原文另有“${motif}”这一笔，正好能给这段故事添上一处可触摸的细节。`,
    `把“${motif}”原样交给故事中的当地人，他们会比旁白更自然地说明它为何重要。`,
    `原文记下的“${motif}”，可以成为场景里最安静、也最不该被忽略的东西。`
  ];
  return `${selected}${stablePick(`${passage.id}:fact`, factBridges)}`;
}

function entryStorySeed({ title, kindLabel, occurrences = [], overview = "" }) {
  const kind = normalizeKindLabel(kindLabel);
  const chapter = occurrences[0]?.chapterTitle || "山海经世界";
  const motif = truncate(motifSentence(overview).replace(/[。；]$/u, ""), 52);
  const variants = {
    异兽生灵: [
      `写${title}时，可以先不让它露面。猎户谈足迹，牧人谈失踪的牲畜，孩子只记得夜里的叫声；三种说法彼此抵牾，山里的生灵才会真正有重量。`,
      `${title}若只是袭人的怪物，很快就会写尽。让它的迁徙改变村落的季节、猎路和禁忌，再安排一个坚持旧规矩的人，故事会从人与土地的摩擦里长出来。`,
      `把${title}交给一位不愿猎杀它的向导。他并非仁慈，而是知道山中还有更难应付的东西；这层隐情足以撑起一段追踪与互不信任。`,
      `${chapter}的人可以把${title}视作征兆，外来者却只把它当罕见猎物。两种眼光在同一具尸体前相遇，冲突便有了落脚处。`,
      `关于${title}的故事，最好留一处无法证实的目击。那点含混能让恐惧、贪欲和地方经验同时成立，也让读者保留自己的判断。`
    ],
    山岳: [
      `${title}不是布景，它应当决定人怎样生活。山口何时封闭、谁能采矿、祭礼由哪一村主持，把这些小事写清，争端自然会出现。`,
      `可以从一条废弃山路写${title}。老地图说它通向旧村，现实中却没人承认那座村子存在，只有每年同一日送进山里的粮食还在。`,
      `一场山崩让${title}改变了轮廓，也改变了山下几家的边界。有人争的是土地，有人怕的是埋在新断崖里的旧事。`,
      `写进山队伍时，给每个人一个不同的目的：采药、寻亲、勘界、还愿。${title}会把同行变成暂时的关系，也会决定谁先离开。`,
      `${title}最适合承载一条地方禁忌。禁忌未必来自神怒，也可能是前人用神话包住的一次灾难经验。`
    ],
    水系: [
      `写${title}，先写上下游。上游的一次取水、筑坝或祭祀，会在下游变成饥荒、流言和迁徙，因果比水怪更有力量。`,
      `${title}枯水时露出旧路，涨水时又把它吞没。让两代人对这条路保存不同记忆，一次渡河就能牵出一段被水隔开的往事。`,
      `渡口是${title}最有人情味的入口：船钱、等候、天气和陌生同路人都能生事。神异只需藏在船夫不肯解释的一条规矩里。`,
      `让一件尚未失去的东西先沿${title}漂来。人物逆水追查时，沿岸每个人都认识它，却给出不同的主人。`,
      `${title}改道后，两岸争论的不只是水源，也是谁有权讲述旧河道。把地图、祖坟和婚姻放在一起，冲突会落到具体生活中。`
    ],
    邦国族群: [
      `写${title}时，不妨从一场交易而非战争开始。称量、饮食、作保和还价最能显出彼此的规矩，也最容易让善意变成冒犯。`,
      `${title}的使者到了边地，却没有人认得他的凭信。接待者一面维持礼数，一面要判断是制度失传了，还是有人故意让这次会面无法成立。`,
      `一名流亡者自称来自${title}，口音、习俗与记忆都说得通，唯独故乡人不承认他。身份争议背后可以藏着一次迁徙或旧政权的更替。`,
      `让${title}与邻国共守一项已经没人完全理解的礼仪。年轻人想简化它，老人怕的不是触怒神明，而是两地终于失去见面的理由。`,
      `外来者眼中的奇俗，对${title}的人只是生活。故事应给双方各一次误解和一次改口的机会，异域才不会沦为陈列。`
    ],
    草木药物: [
      `最后一株${title}若能救人，故事就不该只问药效，还要问谁培育、谁采摘、谁承担试药的风险。稀缺会把每个人的善意都推到边缘。`,
      `${title}突然长在不该出现的地方。老人认作吉兆，药师怀疑水土改变，孩子只关心花期；三种眼光足以撑起一个地方故事。`,
      `守护${title}的家族未必神秘，他们也要过冬、还债和传手艺。一次歉收能让古老誓言变得非常现实。`,
      `有人偷走${title}，却留下最值钱的根与种子。顺着这个反常选择追下去，盗窃会变成一次阻止仪式或救人的笨拙尝试。`,
      `写${title}的效验时，最好给它清楚的限制：时辰、用量、产地或交换条件。限制越具体，人物的选择越可信。`
    ],
    神祇人物: [
      `写${title}，先决定普通人在哪件小事上需要这位神祇或人物：求雨、守约、治病、辨路。宏大身份只有落到日常，才会显出分量。`,
      `关于${title}的两种说法不必急着判定真伪。让两座村落各自靠一种版本生活，考据就会变成活人的利益与感情。`,
      `${title}留下的命令隔了几代才被重新发现。后人真正要判断的不是如何执行，而是旧日处境已经消失后，这道命令还剩多少正当性。`,
      `有人借${title}之名办成了一件好事。揭穿冒名者很容易，难的是说明真名、善举与权力之间究竟该由谁作主。`,
      `让祭司、亲族和敌手分别讲述${title}。三个人都说真话，却只说了自己能承受的那一部分。`
    ],
    其他名物: [
      `先弄清${title}在谁手里、平日放在哪里、什么场合才会取出。物件一旦有了使用习惯，丢失或损坏才会真正牵动人物。`,
      `围绕${title}形成的旧规矩曾经保护过人，也可能让一次错误延续至今。规矩失效的那天，受益者和受害者会同时要求解释。`,
      `${title}重新出现后，几家都拿出继承凭证。最可信的一份反而没有文字，只保存在一位老匠人的手势里。`,
      `古书记下${title}的用途，却没写它上一次被谁用过。把磨损、修补和转手痕迹当作证词，物件自己就能讲出半段历史。`,
      `若“${motif}”是${title}最重要的记载，可以让故事从一次误用开始。人物先承担后果，才有理由回头理解古人的话。`
    ]
  };
  const selected = stablePick(`${title}:${chapter}`, variants[kind] || variants.其他名物);
  if (!motif || selected.includes(motif) || selected.length > 150) return selected;
  return `${selected}原文中的“${motif}”，可以作为这篇故事里最可靠的一处细节。`;
}

function sentenceAround(value, term, limit = 220) {
  const text = compact(value);
  const sentences = text.split(/(?<=[。！？；])/u).filter(Boolean);
  const hit = sentences.find((sentence) => term && sentence.includes(term));
  if (hit) return truncate(hit, limit);
  return truncate(text, limit);
}

function buildPassageContent(passage, relatedTitles = []) {
  const translation = editorialTranslation(passage.plainLanguageText, passage);
  const lines = [
    "<h2>原文</h2>",
    `<blockquote><p>${escapeHtml(passage.originalText)}</p></blockquote>`,
    "<h2>今译</h2>",
    `<p>${escapeHtml(translation)}</p>`
  ];
  const readingNotes = readingNotesForPassage(passage);
  if (readingNotes.length) {
    lines.push(
      "<h2>读法</h2>",
      `<ul>${readingNotes.map((item) => `<li><strong>${escapeHtml(item.quote)}</strong>：${escapeHtml(item.text)}</li>`).join("")}</ul>`
    );
  }
  if (relatedTitles.length) {
    lines.push(
      "<h2>本段名物</h2>",
      `<p>${relatedTitles.slice(0, 24).map((title) => `[[${escapeHtml(title)}]]`).join("　")}</p>`
    );
  }
  lines.push(
    "<h2>原创改编</h2>",
    originalAdaptationNotice(),
    `<p>${escapeHtml(passageStorySeed(passage, relatedTitles, translation))}</p>`
  );
  return lines.join("");
}

function buildChapterContent(chapter, passageTitles) {
  const lines = [
    "<h2>篇章导读</h2>",
    `<p>${escapeHtml(chapterIntroductions[chapter.title] || `《${chapter.title}》收录山川、国族、神人和异物的相关记载。`)}</p>`,
    `<p>全篇共 ${chapter.passages.length} 段，下列内容按原文顺序排列，并附今译。</p>`,
    "<h2>原创改编</h2>",
    originalAdaptationNotice(),
    `<p>${escapeHtml(chapterStoryAngles[chapter.title] || "沿着原文的地理顺序推进，让人物在每一次抵达、迷失和选择中逐渐认识这个世界。")}</p>`
  ];
  let currentSection = "";
  for (const passage of chapter.passages) {
    if (passage.sectionTitle !== currentSection) {
      currentSection = passage.sectionTitle;
      lines.push(`<h2>${escapeHtml(currentSection)}</h2>`);
    }
    const displayTitle = passageTitles.get(passage.id) || `${chapter.title} · 第${passage.order}段`;
    const hint = passageHint(displayTitle);
    lines.push(
      `<h3 id="${escapeHtml(passage.id)}">第 ${passage.order} 段${hint ? ` · ${escapeHtml(hint)}` : ""}</h3>`,
      `<p><strong>原文</strong></p><blockquote><p>${escapeHtml(passage.originalText)}</p></blockquote>`,
      `<p><strong>今译</strong></p><p>${escapeHtml(editorialTranslation(passage.plainLanguageText, passage))}</p>`,
      `<p>[[${escapeHtml(displayTitle)}]]</p>`
    );
  }
  return lines.join("");
}

function buildIndexArticle({ title, normalizedName, kindLabel, occurrences }) {
  const meta = readerKind(kindLabel);
  const first = occurrences[0];
  const firstTranslation = first
    ? sentenceAround(editorialTranslation(first.passage.plainLanguageText, first.passage), normalizedName)
    : "";
  const overview = first
    ? stablePick(`${title}:overview`, [
      `${title}见于《${first.chapterTitle}》，属于书中记下的${meta.noun}。${firstTranslation}`,
      `《${first.chapterTitle}》留下了关于${title}的记载。${firstTranslation}`,
      `关于${title}的文字出自《${first.chapterTitle}》。${firstTranslation}`,
      `${title}的记载保存在《${first.chapterTitle}》中。${firstTranslation}`
    ])
    : `${title}见于《山海经》，属于书中记下的${meta.noun}。`;
  const storySeed = entryStorySeed({ title, kindLabel, occurrences, overview });
  const lines = [
    "<h2>概览</h2>",
    `<p>${escapeHtml(overview)}</p>`,
    "<h2>原创改编</h2>",
    originalAdaptationNotice(),
    `<p>${escapeHtml(storySeed)}</p>`,
    "<h2>原文记载</h2>"
  ];
  for (const occurrence of occurrences) {
    const originalExcerpt = sentenceAround(occurrence.passage.originalText, normalizedName, 260);
    const translatedExcerpt = sentenceAround(
      editorialTranslation(occurrence.passage.plainLanguageText, occurrence.passage),
      normalizedName,
      260
    );
    lines.push(
      `<h3>《${escapeHtml(occurrence.chapterTitle)}》 · ${escapeHtml(occurrence.passage.sectionTitle)}</h3>`,
      `<blockquote><p>${escapeHtml(originalExcerpt)}</p></blockquote>`,
      `<p><strong>今译：</strong>${escapeHtml(translatedExcerpt)}</p>`,
      `<p>[[${escapeHtml(occurrence.displayTitle)}]]</p>`
    );
  }
  const chapterTitles = [...new Set(occurrences.map((item) => item.chapterTitle))];
  if (chapterTitles.length) {
    lines.push("<h2>相关篇目</h2>", `<p>${chapterTitles.map((item) => `《${escapeHtml(item)}》`).join("、")}</p>`);
  }
  return {
    content: lines.join(""),
    summary: truncate(overview, 150),
    meta
  };
}

function chapterGroup(title) {
  if (["南山经", "西山经", "北山经", "东山经", "中山经"].includes(title)) return "五藏山经";
  if (title.startsWith("海外")) return "海外四经";
  if (title.startsWith("海内")) return "海内诸经";
  if (title.startsWith("大荒")) return "大荒四经";
  return "十八篇";
}

module.exports = {
  buildChapterContent,
  buildIndexArticle,
  buildPassageContent,
  chapterGroup,
  chapterIntroductions,
  chapterStoryAngles,
  classifyIndexKind,
  compact,
  editorialTranslation,
  entryStorySeed,
  escapeHtml,
  naturalizeIndexTitle,
  ORIGINAL_ADAPTATION_NOTICE,
  passageDisplayTitle,
  passageStorySeed,
  polishTranslation,
  readingNotesForPassage,
  readerKind,
  truncate
};
