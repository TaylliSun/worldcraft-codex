const crypto = require("node:crypto");

const VERSION = "1.1.0";
const REVIEW_STATUS = "项目初校";
const METHOD = `Worldcraft Codex 自制规则释读 v${VERSION}`;

const numberPattern = "[一二三四五六七八九十百千万零〇两廿卅]+";

function compact(value) {
  return String(value || "")
    .replace(/[\t ]+/g, " ")
    .replace(/\s+([，。；：！？])/g, "$1")
    .trim();
}

function modernizeFixedPassages(text) {
  return text
    .replace(/^大凡天下名山五千三百七十，居地，大凡六万四千五十六里。?$/, "天下著名山岳共五千三百七十座，占地里程合计六万四千五十六里。")
    .replace(/^开明西有凤皇、鸾鸟，皆戴蛇践蛇，膺有赤蛇。?$/, "开明兽西边有凤凰和鸾鸟，它们头戴蛇、脚踏蛇，胸前还有赤蛇。")
    .replace(/^服常树，其上有三头人，伺琅玕树。?$/, "服常树上有一个三头人，守候着琅玕树。")
    .replace(/^开明南有树鸟，六首；蛟、蝮、蛇、蜼、豹、鸟秩树，于表池树木，诵鸟、鶽、视肉。?$/, "开明兽南边有生着六个头的树鸟；蛟、蝮、蛇、蜼、豹、鸟秩树，以及表池一带的树木、诵鸟、鶽和视肉也分布在这里。")
    .replace(/^阳污之山，河出其中；凌门之山，河出其中。?$/, "黄河从阳污山中发源；另一处记载又说黄河从凌门山中发源。")
    .replace(/^钜燕在东北陬。?$/, "钜燕位于东北角。")
    .replace(/^列姑射在海河州中。?$/, "列姑射位于海河州中。")
    .replace(/^大荒东南隅有山，名皮母地丘。?$/, "大荒东南角有一座山，名叫皮母地丘。")
    .replace(/^禹攻云雨，有赤石焉生栾，黄本，赤枝，青叶，群帝焉取药。?$/, "这里记载禹攻云雨。当地有赤石，并生长着栾木；栾木的根呈黄色、枝条红色、叶片青色，众帝从这里采药。")
    .replace(/^有轩辕之台，射者不敢西乡，畏轩辕之台。?$/, "这里有轩辕台。射箭的人因敬畏轩辕台，不敢面向西方放箭。")
    .replace(/^西南有巴国。大皥生咸鸟，咸鸟生乘釐，乘釐生后照，后照是始为巴人。?$/, "西南方有巴国。大皞生下咸鸟，咸鸟生下乘釐，乘釐生下后照；巴人从后照这一支系开始形成。")
    .replace(/^伯夷父生西岳，西岳生先龙，先龙是始生氐羌，氐羌乞姓。?$/, "伯夷父生下西岳，西岳生下先龙；氐羌从先龙这一支系开始形成，姓乞。")
    .replace(/^炎帝之孙伯陵，伯陵同吴权之妻阿女缘妇，缘妇孕三年，是生鼓、延、殳。殳始为侯，鼓、延是始为锺，为乐风。?$/, "炎帝的孙子伯陵与吴权之妻阿女缘妇结合，缘妇怀孕三年，生下鼓、延和殳。殳最早制作箭靶，鼓与延最早制作钟并创制乐曲。")
    .replace(/^帝俊赐羿彤弓素矰，以扶下国，羿是始去恤下地之百艰。?$/, "帝俊赐给羿红色的弓和白色的箭，让他扶助下方各国；羿由此开始救助人间，解除各种艰难。")
    .replace(/^炎帝之妻，赤水之子听訞生炎居，炎居生节并，节并生戏器，戏器生祝融，祝融降处于江水，生共工。共工生术器，术器首方颠，是复土穰，以处江水。共工生后土，后土生噎鸣，噎鸣生岁十有二。?$/, "炎帝的妻子、赤水之女听訞生下炎居；炎居生节并，节并生戏器，戏器生祝融。祝融降居江水一带并生下共工。共工生术器，术器头顶方正，恢复土地与农作，居于江水一带。共工又生后土，后土生噎鸣，噎鸣生出一年十二个月的次序。")
    .replace(/^洪水滔天。鲧窃帝之息壤以堙洪水，不待帝命。帝令祝融杀鲧于羽郊。鲧复生禹。帝乃命禹卒布土以定九州。?$/, "洪水漫天。鲧没有等待天帝命令，便盗取天帝的息壤堵塞洪水。天帝命祝融在羽郊杀死鲧，鲧死后又生出禹。天帝于是命禹继续完成布土治水，最终划定九州。")
    .replace(/^禹所积石之山在其东，河水所入。?$/, "禹堆积石块的山位于东面，黄河水从这里流入。")
    .replace(/^有人曰苖民。/, "这里有被称作苖民的一族。")
    .replace(/^再向西北行进四百二十里，有一座名叫峚的山，(.+)$/, "再向西北行进四百二十里，有一座名叫峚的山，$1");
}

function modernizeDirections(text) {
  return text
    .replace(new RegExp(`又([东南西北]{1,2})(${numberPattern})里，?曰([^，。；]{1,16}?)(?:之山|山)(?=[，。；])`, "g"), "再向$1行进$2里，有一座名叫$3的山")
    .replace(new RegExp(`又([东南西北]{1,2})(${numberPattern})里`, "g"), "再向$1行进$2里")
    .replace(/又([东南西北]{1,2})，/g, "再向$1，")
    .replace(/东北流注于/g, "向东北流入")
    .replace(/东南流注于/g, "向东南流入")
    .replace(/西北流注于/g, "向西北流入")
    .replace(/西南流注于/g, "向西南流入")
    .replace(/东流注于/g, "向东流入")
    .replace(/西流注于/g, "向西流入")
    .replace(/南流注于/g, "向南流入")
    .replace(/北流注于/g, "向北流入")
    .replace(/流注于/g, "流入")
    .replace(/出焉/g, "发源于这里");
}

function modernizeNames(text) {
  return text
    .replace(/^南山经之首曰([^，。；]{1,16}?)(?:之山|山)/, "《南山经》第一列山系名为$1山")
    .replace(/^([东西北中]山经)([^，。；]{0,10})之首，?曰([^，。；]{1,16}?)(?:之山|山)/, "《$1》$2第一列山系从$3山开始")
    .replace(/^《([东西北中]山经)》([^，。；]{0,10})之首，?曰([^，。；]{1,16}?)(?:之山|山)/, "《$1》$2第一列山系从$3山开始")
    .replace(/^海外自([^，。；]{1,12})至([^，。；]{1,12})者。?$/, "本篇记载海外从$1到$2之间的区域。")
    .replace(/^海内([^，。；]{1,12})以([^，。；]{1,12})者。?$/, "本篇记载海内$1以$2的区域。")
    .replace(/有国名曰/g, "有一个国家名叫")
    .replace(/有([^，。；]{1,10})之国(?=[，。；])/g, "有一个名叫$1的国家")
    .replace(/其首曰([^，。；]{1,16}?)(?:之山|山)(?=[，。；])/g, "第一座山名叫$1山")
    .replace(/(?:其名曰|名曰)/g, "名叫")
    .replace(/有(兽|鸟|鱼|蛇|虫|神|草|木|药)焉/g, "这里有一种$1")
    .replace(/有(兽|鸟|鱼|蛇|虫|神|草|木|药)(?=[，。；]|其状|状如|名曰)/g, "这里有一种$1，")
    .replace(/有山焉/g, "这里有一座山")
    .replace(/有水焉/g, "这里有一条水");
}

function modernizeDescriptions(text) {
  return text
    .replace(/其状如/g, "外形像")
    .replace(/其状/g, "形貌")
    .replace(/其音如/g, "叫声像")
    .replace(/其音若/g, "叫声像")
    .replace(/其声如/g, "声音像")
    .replace(/其鸣自詨/g, "鸣叫时会报出自己的名字")
    .replace(/而青华/g, "，开青色的花")
    .replace(/而赤华/g, "，开红色的花")
    .replace(/而白华/g, "，开白色的花")
    .replace(/而黄华/g, "，开黄色的花")
    .replace(/而黑理/g, "，带有黑色纹理")
    .replace(/其华四照/g, "花朵的光芒能照向四方")
    .replace(/伏行人走/g, "平时伏地行走，也能像人一样奔跑")
    .replace(/善走/g, "跑得更快")
    .replace(/食之/g, "吃下它后")
    .replace(/佩之/g, "佩戴它后")
    .replace(/服之/g, "服用它后")
    .replace(/浴之/g, "用它沐浴后")
    .replace(/见则/g, "一旦出现就")
    .replace(/是食人/g, "这种生物会吃人")
    .replace(/食者/g, "食用的人")
    .replace(/可以为底/g, "可以治疗足部疾病")
    .replace(/可以为/g, "可以用来治疗")
    .replace(/可以已/g, "可以消除")
    .replace(/可以御/g, "可以抵御")
    .replace(/可以禦/g, "可以抵御")
    .replace(/不可以上/g, "无法攀登")
    .replace(/无草木/g, "不生长草木")
    .replace(/无水/g, "没有水源")
    .replace(/宜子孙/g, "有助于子孙繁衍")
    .replace(/不蛊/g, "不受蛊毒侵害")
    .replace(/不惑/g, "不受迷惑")
    .replace(/不畏/g, "使人不再畏惧")
    .replace(/不妒/g, "使人不生嫉妒之心")
    .replace(/无卧/g, "不再睡眠")
    .replace(/无瘕疾/g, "不患腹中结块一类的疾病")
    .replace(/无肿疾/g, "不患肿胀类疾病")
    .replace(/不疥/g, "不患疥疮")
    .replace(/不聋/g, "不会耳聋")
    .replace(/不饥/g, "不会感到饥饿")
    .replace(/已疠/g, "消除疫病")
    .replace(/主大穰/g, "预示天下丰收")
    .replace(/天下大穰/g, "预示天下大丰收")
    .replace(/其国有恐/g, "预示这个国家将发生恐慌")
    .replace(/其邑大水/g, "预示当地将发生洪水")
    .replace(/天下大水/g, "预示天下将发生洪水")
    .replace(/天下大旱/g, "预示天下将发生大旱");
}

function modernizeTerrain(text) {
  return text
    .replace(/其上多/g, "山上盛产")
    .replace(/其下多/g, "山下盛产")
    .replace(/其阳多/g, "山的南面盛产")
    .replace(/其阴多/g, "山的北面盛产")
    .replace(/其中多/g, "其中盛产")
    .replace(/水多/g, "水中多有")
    .replace(/，多(?=[^，。；]{1,20})/g, "，盛产")
    .replace(/其木多/g, "这里的树木以")
    .replace(/其草多/g, "这里的草以")
    .replace(/其兽多/g, "这里的兽类以")
    .replace(/其鸟多/g, "这里的鸟类以")
    .replace(/其鱼多/g, "这里的鱼类以");
}

function modernizeRitualAndSummary(text) {
  return text
    .replace(/^地之所载，六合之闲，四海之内，照之以日月，经之以星辰，纪之以四时，要之以太岁，神灵所生，其物异形，或夭或寿，唯圣人能通其道。?$/, "大地承载万物，六合与四海之内由日月照耀、星辰运行、四季记录，并以太岁统摄。神灵孕育的万物形态各异，寿命有长有短，只有圣人能够通晓其中的规律。")
    .replace(/^凡/g, "总计")
    .replace(/凡([东西南北中]次[^，。；]{1,18})/g, "总计$1")
    .replace(/其神状/g, "这里山神的形貌")
    .replace(/其祠之礼/g, "祭祀这些神的礼仪")
    .replace(/祠用/g, "祭祀时使用")
    .replace(/糈用/g, "祭祀用的精米采用")
    .replace(/是神也/g, "这是这里的神")
    .replace(/是为/g, "这就是")
    .replace(/一曰/g, "另一种说法称")
    .replace(/或曰/g, "另一种说法称")
    .replace(/盖国在/g, "盖国位于")
    .replace(/大荒之中/g, "在大荒之中")
    .replace(/海外自/g, "海外从")
    .replace(/海内自/g, "海内从");
}

function modernizeGeographyAndPeople(text) {
  return text
    .replace(/^右([^，。；]+)，?(?:大)?总计([^。]+)。?$/, "以上是$1的汇总：总计$2。")
    .replace(/^右([^，。；]+)，([^。]+)。?$/, "以上是$1的汇总：$2。")
    .replace(/建平元年四月丙戌，待诏太常属臣望校治，侍中光禄勋臣龚、侍中奉车都尉光禄大夫臣秀领主省/g, "建平元年四月丙戌，待诏、太常属臣望负责校治，侍中光禄勋臣龚与侍中奉车都尉光禄大夫臣秀主持审定")
    .replace(/其为人([^，。；]+)/g, "当地人的形貌为$1")
    .replace(/(?<=[，。；])为人([^，。；]+)/g, "当地人的形貌为$1")
    .replace(/其为兽([^，。；]+)/g, "这种兽的形貌为$1")
    .replace(/其为物([^，。；]+)/g, "这种存在的形貌为$1")
    .replace(/为鸟青，赤尾/g, "这种鸟全身青色，尾巴为红色")
    .replace(/在其([东西南北]{1,2})/g, "位于它的$1方向")
    .replace(/在([^，。；]{1,24}?)([东西南北]{1,2})(?=[，。；]|$)/g, "位于$1的$2方向")
    .replace(/居两水闲/g, "居住在两条水流之间")
    .replace(/在海中/g, "位于海中")
    .replace(/居海中/g, "位于海中")
    .replace(/山环之/g, "群山环绕着它")
    .replace(/洲环其下/g, "水洲环绕在它下方")
    .replace(/方([一二三四五六七八九十百千万]+)里/g, "方圆$1里")
    .replace(/长([一二三四五六七八九十百千万]+)(里|仞)/g, "长达$1$2")
    .replace(/乘两龙/g, "驾乘两条龙")
    .replace(/珥两青蛇/g, "以两条青蛇作为耳饰")
    .replace(/践两青蛇/g, "脚踩两条青蛇")
    .replace(/操/g, "手持")
    .replace(/之尸/g, "的遗体")
    .replace(/生并且十日炙杀之/g, "生前被十个太阳炙烤而死")
    .replace(/以右手鄣其面/g, "用右手遮住自己的脸")
    .replace(/帝断其首/g, "天帝斩下他的头")
    .replace(/葬之常羊之山/g, "并把他葬在常羊山")
    .replace(/乃以乳为目，以脐为口/g, "于是以双乳为眼、以肚脐为口")
    .replace(/干戚以舞/g, "盾牌和大斧继续舞动")
    .replace(/其不寿者八百岁/g, "其中寿命较短的人也能活八百岁")
    .replace(/尾交首上/g, "尾巴交叠在头顶")
    .replace(/葬于阳/g, "葬在山南")
    .replace(/葬于阴/g, "葬在山北")
    .replace(/雁出其闲/g, "大雁从山间飞出")
    .replace(/群鸟所生及所解/g, "群鸟繁衍和换羽的地方")
    .replace(/([^，。；]{1,12}水)出([^，。；]+)/g, "$1发源于$2")
    .replace(/([东西南北]{1,2})注([^，。；]+)/g, "向$1流入$2")
    .replace(/([东西南北]{1,2})入([^，。；]+)/g, "向$1流入$2")
    .replace(/绝钜鹿泽/g, "横穿钜鹿泽")
    .replace(/有([^，。；]{1,12})国，名([^，。；]+)/g, "有一个$1国，名叫$2")
    .replace(/有山名([^，。；]+)/g, "这里有一座山，名叫$1")
    .replace(/有(?!一座)([^，。；]{1,10})山(?=[，。；]|$)/g, "这里有一座$1山")
    .replace(/(^|[。；])有([^，。；]{1,6})民(?=[，。；]|$)/g, "$1这里有$2族人")
    .replace(/有大泽方/g, "这里有一片大泽，方圆")
    .replace(/有池，名/g, "这里有一座水池，名叫")
    .replace(/五采之鸟/g, "五彩羽毛的鸟")
    .replace(/黍食/g, "以黍为食")
    .replace(/使四鸟/g, "驱使四种兽类")
    .replace(/是始为舟/g, "最早造出船")
    .replace(/是始以木为车/g, "最早用木材造车")
    .replace(/是始为弓矢/g, "最早制作弓箭")
    .replace(/是始为歌舞/g, "最早创作歌舞")
    .replace(/方啖之/g, "正在吞食蛇")
    .replace(/见人则笑，唇蔽其目，因可逃也/g, "见到人便发笑，嘴唇会遮住双眼，人们可趁此逃走")
    .replace(/百兽莫能处/g, "各种兽类都无法在那里生存")
    .replace(/不可生榖/g, "不能生长谷物")
    .replace(/不可居也/g, "也无法居住")
    .replace(/人主得(?:而|并且)飨吃下它后，伯天下/g, "君主若得到并祭享它，便能称霸天下")
    .replace(/歌儛/g, "歌舞");
}

function smooth(text) {
  return text
    .replace(/少昊孺帝颛顼于此/g, "少昊曾在这里抚育颛顼帝")
    .replace(/弃其琴瑟/g, "并把琴瑟留在这里")
    .replace(/有([^，。；]{1,12})者/g, "有一处名为$1的地方")
    .replace(/爰有/g, "这里有")
    .replace(/葬焉/g, "安葬在这里")
    .replace(/在焉/g, "位于这里")
    .replace(/生焉/g, "生长在这里")
    .replace(/守之/g, "守护它")
    .replace(/所浴/g, "沐浴的地方")
    .replace(/皆出于山/g, "都出产于这座山")
    .replace(/有山而不合/g, "有一座山体断裂、不能相合的山")
    .replace(/左右有首/g, "身体左右两侧各有一个头")
    .replace(/相并/g, "并排而行")
    .replace(/而(?=[^，。；]{1,24})/g, "并且")
    .replace(/焉(?=[，。；]|$)/g, "")
    .replace(/者(?=[，。；])/g, "的事物")
    .replace(/曰(?=[^，。；]{1,16})/g, "称作")
    .replace(/，并且，/g, "，并且")
    .replace(/，，+/g, "，")
    .replace(/；，/g, "；")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPlainLanguageText(originalText) {
  const original = compact(originalText);
  let interpretation = modernizeFixedPassages(original);
  interpretation = modernizeDirections(interpretation);
  interpretation = modernizeNames(interpretation);
  interpretation = modernizeDescriptions(interpretation);
  interpretation = modernizeTerrain(interpretation);
  interpretation = modernizeRitualAndSummary(interpretation);
  interpretation = modernizeGeographyAndPeople(interpretation);
  interpretation = smooth(interpretation);
  if (!interpretation || interpretation === original) {
    interpretation = `本段记述的是：${original}`;
  }
  return interpretation;
}

function buildPlainLanguageRecord(originalText) {
  const plainLanguageText = buildPlainLanguageText(originalText);
  return {
    plainLanguageText,
    plainLanguageReviewStatus: REVIEW_STATUS,
    plainLanguageMethod: METHOD,
    plainLanguageVersion: VERSION,
    plainLanguageSha256: crypto.createHash("sha256").update(plainLanguageText, "utf8").digest("hex")
  };
}

module.exports = {
  METHOD,
  REVIEW_STATUS,
  VERSION,
  buildPlainLanguageRecord,
  buildPlainLanguageText
};
