const {
  WORLD_ID,
  categoryId
} = require("./chinese-mythology-history-data.cjs");

const BATCH_KEY = "ancient-core-01";
const BATCH_LABEL = "阶段 1 · 上古核心第一批";

function ancientEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:ancient-core:${key}`;
}

function sourceEntityId(key, worldId = WORLD_ID) {
  return ancientEntityId(`source-${key}`, worldId);
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

function renderArticle(row) {
  const sections = row.sections.map((section) => [
    `<h2>${escapeHtml(section.heading)}</h2>`,
    ...section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
  ].join("")).join("");
  const sources = row.sources
    .map((source) => `<li>${escapeHtml(source)}</li>`)
    .join("");
  return [
    `<p>${escapeHtml(row.lead)}</p>`,
    sections,
    "<h2>原典坐标</h2>",
    `<ul>${sources}</ul>`,
    "<h2>版本边界</h2>",
    `<p>${escapeHtml(row.boundary)}</p>`
  ].join("");
}

const figureRows = [
  {
    key: "nuwa",
    title: "女娲",
    summary: "早期文献中与造化、补天相关的神圣女性，其完整创世母神形象由多层文献累积而成。",
    category: "primordial",
    aliases: "女娲氏",
    identityType: "神祇",
    earliestSource: "《楚辞·天问》",
    sourceLocation: "《楚辞·天问》；《淮南子·览冥训》",
    historicalLayer: "跨时期",
    domains: "造化、修补天地秩序、止息洪水",
    iconography: "早期文字没有给出统一标准像；人首蛇身主要见于汉代以后图像传统。",
    worship: "后世进入创世始母、婚姻生育与地方庙祀等多种传统。",
    regionalVariants: "补天、造人、制乐器等职能来自不同文献层，不宜拼成一段同时发生的生平。",
    confidence: "明确",
    lead: "女娲最容易被后世讲成一位履历完整的创世女神，早期文献却没有替她写好这样一部传记。她的形象是在一条条短促的记载里逐渐长出来的。",
    sections: [
      {
        heading: "先看早期文字",
        paragraphs: [
          "《楚辞·天问》以设问提到女娲之体从何而来，说明战国时代的听众已经熟悉她，却没有交代完整故事。《淮南子·览冥训》则把她放进天地崩坏的灾变中：她补天、立四极、止洪水，使失序的世界重新能够承载生命。",
          "这里的重点不是女娲怎样出生，而是她怎样收拾一个几乎无法居住的宇宙。补天因此更接近恢复秩序的叙事，而不只是一次神奇的修补工程。"
        ]
      },
      {
        heading: "造人故事出现得更晚",
        paragraphs: [
          "女娲造人的细节在汉代以后材料中逐渐清晰，和补天并非同一篇早期文献里的连续情节。后世又把她与伏羲并列，形成兄妹、夫妇或二皇等不同解释。",
          "阅读女娲时，最好先问一句：眼前说的是战国设问、汉代宇宙论，还是更晚的民间叙事。这样才能保住每个时代自己的女娲。"
        ]
      }
    ],
    sources: ["《楚辞·天问》", "《淮南子·览冥训》", "《风俗通义·皇霸》相关佚文与引文"],
    boundary: "本页不把后世造人细节、人首蛇身图像和伏羲婚配关系倒写成《楚辞》已经完整记载的事实。"
  },
  {
    key: "fuxi",
    title: "伏羲",
    summary: "又称包牺、庖牺，古籍将八卦、渔猎工具和文明秩序的开端归在他名下。",
    category: "heroes-ancestors",
    aliases: "包牺、庖牺、宓羲、太昊伏羲",
    identityType: "帝王",
    earliestSource: "《周易·系辞下》",
    sourceLocation: "《周易·系辞下》第二章",
    historicalLayer: "先秦文献层",
    domains: "观象、八卦、结绳为网、渔猎与文明起源",
    iconography: "汉代画像中常与女娲并列，并持规矩或日月等象征；这属于后出的图像层。",
    worship: "后世作为人文始祖进入帝王谱系和地方庙祀。",
    regionalVariants: "伏羲与太昊、风姓祖先及女娲的对应关系随时代和地域而变化。",
    confidence: "明确",
    lead: "伏羲在古书里常写作包牺或庖牺。几个名字指向的不是一位材料齐全的古代君王，而是一组关于观察天地、制作工具和建立秩序的文明记忆。",
    sections: [
      {
        heading: "从观象到八卦",
        paragraphs: [
          "《周易·系辞下》说包牺仰观天象、俯察地法，又看鸟兽纹理与土地所宜，随后作八卦。这段文字关心的是知识怎样从观察中产生，并没有讲伏羲的出生、婚姻或战事。",
          "同一段又把结绳制网、狩猎捕鱼归到包牺名下。八卦和网罟并置，使伏羲兼有认识世界与安排生活两种意义。"
        ]
      },
      {
        heading: "伏羲与女娲要分层阅读",
        paragraphs: [
          "汉代以后，伏羲与女娲在画像和谱系里频繁并列，有时被解释为夫妇，有时被列为二皇。这些材料很重要，却不能反过来证明《系辞下》已经讲过同样的关系。",
          "本库把文字记载、汉代图像与后世庙祀分别记录，再用关系标明它们在哪个时代成立。"
        ]
      }
    ],
    sources: ["《周易·系辞下》", "《汉书·古今人表》", "汉代伏羲女娲画像石与画像砖"],
    boundary: "伏羲与太昊是否原本同一身份、伏羲与女娲是否为固定婚配，均需按具体文献和图像年代说明。"
  },
  {
    key: "shennong",
    title: "神农",
    summary: "文明起源叙事中的农事与交易开创者，后世又逐渐承担医药祖神职能。",
    category: "heroes-ancestors",
    aliases: "神农氏",
    identityType: "帝王",
    earliestSource: "《周易·系辞下》",
    sourceLocation: "《周易·系辞下》第二章",
    historicalLayer: "跨时期",
    domains: "农耕、耒耜、市场；后世扩展为医药与百草",
    iconography: "牛首、人身等形象多见于较晚传统，不能作为先秦文字的直接图解。",
    worship: "农祖、药祖与地方先农祭祀中的重要对象。",
    regionalVariants: "神农与炎帝常被合称，也有材料将两者保留为不同层次。",
    confidence: "明确",
    lead: "神农的名字让人想到尝百草，但《周易·系辞下》先讲的不是药，而是耒耜和市场。这个次序很重要，它提醒我们不要让最熟悉的后世故事盖住早期文字。",
    sections: [
      {
        heading: "农具与交换",
        paragraphs: [
          "《系辞下》把神农安排在包牺之后，说他削木成耜、揉木作耒，把耕作的便利教给天下，又在日中设市，让人们带着货物交换。神农在这里代表的是一整套定居生活的技术。",
          "这类文明起源叙事并不等同于现代意义上的发明史。古人借一个名字，把农具、耕作和交易的来历收拢成可传述的秩序。"
        ]
      },
      {
        heading: "医药祖神是后续生长出来的",
        paragraphs: [
          "尝百草、辨药性和一日遇毒等故事，在后世本草与传说中不断扩充。它们塑造了极有生命力的药祖形象，却不应冒充《系辞下》的原句。",
          "神农与炎帝的合一也经历了谱系整理。本库保留两个条目，用一条存在争议的对应关系连接。"
        ]
      }
    ],
    sources: ["《周易·系辞下》", "《淮南子·修务训》相关文明起源叙述", "汉以后本草与帝王谱系材料"],
    boundary: "本页不把尝百草的完整情节写成《周易》原有内容，也不默认神农与炎帝在所有文献里完全等同。"
  },
  {
    key: "yandi",
    title: "炎帝",
    summary: "上古帝系与族源叙事中的重要名号，在《山海经》中又是精卫前身女娃之父。",
    category: "ancient-deities",
    aliases: "炎帝氏",
    identityType: "帝王",
    earliestSource: "《国语》及先秦两汉相关材料",
    sourceLocation: "《国语·晋语四》；《山海经·北山经》",
    historicalLayer: "跨时期",
    domains: "帝系、族源、火德解释；后世兼农祖与药祖",
    iconography: "没有可从早期文字直接还原的统一肖像。",
    worship: "后世与神农合祀或以炎帝神农氏名义祭祀。",
    regionalVariants: "与神农的关系有同一、承继和分立等不同处理。",
    confidence: "主流说法",
    lead: "炎帝既是上古帝系中的名号，也是许多姓氏与族源叙事追溯的节点。《山海经》写精卫时，只用一句“炎帝之少女”，便让这个宏大的帝号落进一个具体而悲凉的家庭关系里。",
    sections: [
      {
        heading: "帝系中的炎帝",
        paragraphs: [
          "《国语》等材料把黄帝、炎帝放进上古族源与政权更替的叙述。到《史记·五帝本纪》，炎帝又成为黄帝在阪泉交战的对象。这里的炎帝更像一个时代或集团的代表，并非所有文字都在讲同一段个人经历。",
          "火德、南方和赤色等解释多由五行体系与后世神谱继续加工，需要标明形成时期。"
        ]
      },
      {
        heading: "精卫的父亲",
        paragraphs: [
          "《山海经·北山经》明确称女娃为炎帝最小的女儿。女娃溺亡后化为精卫，这条父女关系有直接文字依据。",
          "后世常把炎帝、神农、赤帝一次性合并。本库不否认这种传统，却把它记录为后来形成的身份对应，而不是删除差异。"
        ]
      }
    ],
    sources: ["《国语·晋语四》", "《史记·五帝本纪》", "《山海经·北山经》发鸠山条"],
    boundary: "炎帝、神农与赤帝的合一不是所有早期文献共有的前提，使用时应说明采用哪一层传统。"
  },
  {
    key: "huangdi",
    title: "黄帝",
    summary: "上古帝王谱系的枢纽人物，在战争、文明起源、族源与后世神仙传统中拥有不同面貌。",
    category: "ancient-deities",
    aliases: "轩辕氏、有熊氏",
    identityType: "帝王",
    earliestSource: "先秦诸子与史传材料",
    sourceLocation: "《史记·五帝本纪》；《山海经·大荒北经》",
    historicalLayer: "跨时期",
    domains: "帝系、战争、秩序建立、文明发明；后世兼入神仙与医药传统",
    iconography: "帝王冕服、乘龙升天等形象来自不同历史层。",
    worship: "国家与地方祖先祭祀、黄老与神仙传统中的重要名号。",
    regionalVariants: "古史黄帝、战争叙事黄帝和道教神仙黄帝需要分层。",
    confidence: "明确",
    lead: "从先秦诸子到《史记》，黄帝逐渐成为上古叙事的交通枢纽：战争、制度、技术和族谱都从这里经过。材料越多，越不能把它们压成一篇没有年代差别的传奇。",
    sections: [
      {
        heading: "《史记》怎样安排黄帝",
        paragraphs: [
          "《五帝本纪》以黄帝开篇，写神农氏世衰、诸侯相侵，黄帝先后与炎帝、蚩尤交战，最终取得诸侯承认。司马迁同时承认黄帝材料杂乱，因此选择了他认为较为雅正的说法。",
          "这段自我说明很难得：它告诉读者，《史记》并非照录一份完整古史，而是在既有传说中做了整理。"
        ]
      },
      {
        heading: "《山海经》的战争版本",
        paragraphs: [
          "《大荒北经》让应龙、女魃、风伯和雨师进入黄帝与蚩尤的战争。战场不再只是人间军阵，天气与水旱也成为交锋的一部分。",
          "女魃在胜利后不能返天、所居之处无雨，使这场战争留下了不轻松的余波。黄帝阵营并非只得到荣耀，也承担了气候失衡的后果。"
        ]
      }
    ],
    sources: ["《史记·五帝本纪》", "《山海经·大荒北经》", "《国语》相关帝系材料"],
    boundary: "本页不把《黄帝内经》的对话人物、道教神仙黄帝和《史记》的古史黄帝视为没有变化的单一历史人物。"
  },
  {
    key: "chiyou",
    title: "蚩尤",
    summary: "黄帝战争叙事中的强敌，也与兵器、风雨和地方祖先记忆相连，不能只写成简单反派。",
    category: "ancient-deities",
    aliases: "蚩尤氏",
    identityType: "英雄",
    earliestSource: "先秦两汉史传与诸子材料",
    sourceLocation: "《史记·五帝本纪》；《山海经·大荒北经》",
    historicalLayer: "跨时期",
    domains: "战争、兵器、部族首领；后世兼兵主与地方祖先",
    iconography: "铜头铁额、兽角等形象多由后世文本与图像累积。",
    worship: "汉代已有兵主祭祀记载，地方传统又发展出祖先与护佑意义。",
    regionalVariants: "敌酋、兵主、战神和祖先等身份并存。",
    confidence: "明确",
    lead: "蚩尤的形象从来不只是一张“反派”面孔。《史记》把他放在黄帝统一叙事的对面，《山海经》则给他风伯、雨师和一场足以改变天气的战争。",
    sections: [
      {
        heading: "两种战场",
        paragraphs: [
          "《史记·五帝本纪》说蚩尤最为暴，黄帝征诸侯之师，与他战于涿鹿并将其擒杀。这是古史编排中的决定性战役。",
          "《山海经·大荒北经》写得更像神话：蚩尤兴兵，黄帝命应龙进攻；应龙蓄水，蚩尤请来风伯雨师，黄帝又降女魃止雨。胜负由军队、风雨与神力共同决定。"
        ]
      },
      {
        heading: "战败者后来仍被祭祀",
        paragraphs: [
          "两汉材料中，蚩尤与兵主、兵器相连。战败并没有让他的名字退出文化记忆，反而让他成为战争力量本身的象征。",
          "一些地方传统又把蚩尤视为祖先。面对这种差异，最稳妥的做法不是选一个标签，而是标清每个标签出现的文献和地域。"
        ]
      }
    ],
    sources: ["《史记·五帝本纪》", "《山海经·大荒北经》", "《史记·封禅书》兵主材料"],
    boundary: "铜头铁额、八肱八趾等细节并非《五帝本纪》战役段落的全部原貌；地方祖先说也不能反写成全国统一传统。"
  },
  {
    key: "yinglong",
    title: "应龙",
    summary: "能够蓄水、行雨并参与神战的有翼龙神，在黄帝战争和治水材料中承担不同任务。",
    category: "nature-deities",
    aliases: "应龙氏",
    identityType: "神祇",
    earliestSource: "《楚辞·天问》《山海经》",
    sourceLocation: "《楚辞·天问》；《山海经·大荒北经》",
    historicalLayer: "先秦文献层",
    domains: "水、雨、战争、治水辅助",
    iconography: "后世常画作有翼之龙，具体翼形并非所有早期段落都详述。",
    worship: "更多作为神话龙神与雨水象征进入文学和图像。",
    regionalVariants: "黄帝战蚩尤与禹治水是两组不同叙事场景。",
    confidence: "明确",
    lead: "应龙在《山海经》的战场上不是黄帝的坐骑，而是一位能够蓄水作战的行动者。把它只画成交通工具，会漏掉最有分量的部分。",
    sections: [
      {
        heading: "蓄水攻蚩尤",
        paragraphs: [
          "《大荒北经》写黄帝命应龙攻蚩尤，应龙先蓄水；蚩尤请风伯雨师纵大风雨，战局才转向女魃止雨。应龙的力量与水势直接相连。",
          "同篇另有应龙杀夸父的版本线索，说明它并不总是温顺的护佑者。"
        ]
      },
      {
        heading: "治水记忆中的龙迹",
        paragraphs: [
          "《楚辞·天问》在追问鲧禹治水时提到应龙画地或行水的疑问，后世据此发展出应龙以尾划地、帮助禹疏导洪水的故事。",
          "原诗本身是问句，不宜把后来的回答直接塞回屈原的文字里。"
        ]
      }
    ],
    sources: ["《楚辞·天问》", "《山海经·大荒北经》", "《淮南子·览冥训》女娲仪仗段"],
    boundary: "应龙帮助禹的具体动作多依后世注释展开；本页把原始问句与后来的完整故事分开。"
  },
  {
    key: "nuba",
    title: "女魃",
    summary: "黄帝在神战中降下的旱神；她止住风雨，却因不能返天而给人间留下新的难题。",
    category: "nature-deities",
    aliases: "黄帝女魃、魃、赤水女子献（相关异名有争议）",
    identityType: "神祇",
    earliestSource: "《山海经·大荒北经》",
    sourceLocation: "《山海经·大荒北经》黄帝战蚩尤段",
    historicalLayer: "先秦文献层",
    domains: "止雨、旱灾、神战",
    iconography: "原文只说有人衣青衣，后世旱魃形象变化很大。",
    worship: "更多见于驱旱、逐魃与求雨叙事，不是单一的善神或恶神。",
    regionalVariants: "女魃、旱魃与赤水女子献之间的对应存在解释差异。",
    confidence: "明确",
    lead: "女魃的故事有一层常被删掉的余波：她帮助黄帝止住暴雨，却从此不能回到天上。胜利结束了战争，也把旱灾带进了她此后的行踪。",
    sections: [
      {
        heading: "止雨之后",
        paragraphs: [
          "《大荒北经》说蚩尤请风伯、雨师纵起风雨，黄帝于是降下天女魃。雨止，蚩尤被杀；女魃却无法复上，住在哪里，哪里便不下雨。",
          "她并不是为了害人而来到人间。旱灾是神战留下的后果，这让女魃同时带着功劳与灾异两面。"
        ]
      },
      {
        heading: "逐魃也有规矩",
        paragraphs: [
          "原文还记下驱逐女魃时要先疏通水道，再呼告神向北行。这里既有仪式语言，也有实际水利动作。",
          "后世“旱魃”逐渐妖异化，甚至与僵尸传说相连。那是很晚的形象变化，不能拿来覆盖青衣天女的早期面貌。"
        ]
      }
    ],
    sources: ["《山海经·大荒北经》"],
    boundary: "本页不把明清以后僵尸化的旱魃形象当作《山海经》女魃的原始外貌。"
  },
  {
    key: "gonggong",
    title: "共工",
    summary: "与洪水、天柱倾折和上古权力冲突相连的神话人物，其对手与事迹随文献而变。",
    category: "nature-deities",
    aliases: "共工氏、康回（相关称呼）",
    identityType: "神祇",
    earliestSource: "先秦史传与《山海经》材料",
    sourceLocation: "《山海经·海外北经》；《淮南子·天文训》",
    historicalLayer: "跨时期",
    domains: "洪水、水势、权力冲突、天地倾斜解释",
    iconography: "人面蛇身、朱发等形象多见于注释和后世转述。",
    worship: "主要存于神话与古史记忆，后世偶有水神化解释。",
    regionalVariants: "共工的对手在不同材料中可为颛顼、祝融或其他对象。",
    confidence: "主流说法",
    lead: "提到共工，今人往往先想到怒触不周山。早期材料却还留下共工台、臣属相柳和洪水等线索，它们并没有自动拼成一部首尾齐全的生平。",
    sections: [
      {
        heading: "水与权力",
        paragraphs: [
          "《海外北经》写共工之臣相柳，又写共工之台，说明共工在这一材料里拥有臣属与神圣空间。《淮南子·本经训》还把舜时洪水与共工相连。",
          "这些记载让共工不只是一次失败冲撞的主角，更像一股与水势、疆域和旧秩序捆在一起的力量。"
        ]
      },
      {
        heading: "不周山故事的版本",
        paragraphs: [
          "《淮南子·天文训》说共工与颛顼争帝，怒触不周山，使天柱折、地维绝，并借此解释天向西北倾、地向东南陷。",
          "较早或平行材料并不总把颛顼列为对手。使用这一关系时，应明确写成《天文训》的版本，而不是唯一古老事实。"
        ]
      }
    ],
    sources: ["《山海经·海外北经》", "《淮南子·天文训》", "《淮南子·本经训》"],
    boundary: "共工与颛顼争帝是明确的汉代文本叙述，但共工神话还有其他对手和版本，不能一概抹平。"
  },
  {
    key: "xiangliu",
    title: "相柳",
    summary: "共工的九首臣属，所到之处化为泽溪，死后腥血又使土地无法生长。",
    category: "nature-deities",
    aliases: "相柳氏",
    identityType: "神祇",
    earliestSource: "《山海经·海外北经》",
    sourceLocation: "《山海经·海外北经》共工台前后",
    historicalLayer: "先秦文献层",
    domains: "洪水、沼泽、毒土、共工集团",
    iconography: "九首人面、青色蛇身。",
    worship: "主要作为治水叙事中的灾害形象流传。",
    regionalVariants: "后世文学常扩写其毒性与再生能力，早期原文没有完整说明。",
    confidence: "明确",
    lead: "相柳几乎没有脱离共工单独出现。他的九个头、蛇一样的身体和所到之处形成的泽溪，共同把洪水写成了一种会行走、会吞食土地的生命。",
    sections: [
      {
        heading: "共工之臣",
        paragraphs: [
          "《海外北经》明确称相柳为共工之臣。它以九首分别取食九山，身体抵达的地方便成为泽溪，这种夸张形体对应的是无处不在的水患。",
          "相柳因此不仅是怪物，也是共工力量的延伸。臣属关系在原文里十分清楚。"
        ]
      },
      {
        heading: "禹杀相柳",
        paragraphs: [
          "禹杀死相柳后，它的血腥臭，使土地不能种植五谷。禹多次填治仍然下陷，最后在那里筑成众帝之台。",
          "故事没有把灾害写成一刀便结束。杀死相柳只是第一步，污染的土地仍要被重新安排。"
        ]
      }
    ],
    sources: ["《山海经·海外北经》"],
    boundary: "本页不补写相柳复活、分身或与其他九头蛇神的亲属关系。"
  },
  {
    key: "zhuanxu",
    title: "颛顼",
    summary: "五帝古史与《山海经》神话谱系中的高阳氏，在不同文本中承担统治、谱系和神战对手等角色。",
    category: "ancient-deities",
    aliases: "高阳氏、帝颛顼",
    identityType: "帝王",
    earliestSource: "先秦史传材料",
    sourceLocation: "《史记·五帝本纪》；《山海经》多篇",
    historicalLayer: "跨时期",
    domains: "五帝谱系、天地秩序、族源",
    iconography: "无统一早期肖像。",
    worship: "后世进入五帝祭祀与帝王祖先谱系。",
    regionalVariants: "与共工争帝、绝地天通等叙事需要逐篇核对。",
    confidence: "明确",
    lead: "颛顼横跨两套阅读方式：在《史记》里，他是五帝次序中的高阳氏；在《山海经》里，他又生出许多国族与神异谱系。两边都重要，却不是同一种写法。",
    sections: [
      {
        heading: "古史中的高阳",
        paragraphs: [
          "《五帝本纪》把颛顼列为黄帝之后的帝王，强调其静深有谋、通达事理，并安排帝喾继承。这是司马迁整理出的帝系次序。",
          "《山海经》则更关心他的后裔、葬地与边远国族。名字相同，叙事功能已经不同。"
        ]
      },
      {
        heading: "共工的对手",
        paragraphs: [
          "《淮南子·天文训》让颛顼成为共工争帝的对手，并用不周山倾折解释天地走势。这个版本影响极大。",
          "但其他材料对共工的对手另有说法，所以关系图上要保留出处和适用年代。"
        ]
      }
    ],
    sources: ["《史记·五帝本纪》", "《山海经·海外北经》《大荒南经》等", "《淮南子·天文训》"],
    boundary: "本页不把《史记》的帝王纪年当作可与考古年代直接对照的精确年表。"
  },
  {
    key: "diku",
    title: "帝喾",
    summary: "五帝谱系中的高辛氏，在《史记》古史系统与后世族源叙述中占据承前启后的位置。",
    category: "ancient-deities",
    aliases: "高辛氏、帝俈",
    identityType: "帝王",
    earliestSource: "先秦史传与帝系材料",
    sourceLocation: "《史记·五帝本纪》",
    historicalLayer: "跨时期",
    domains: "五帝谱系、族源、礼制古史",
    iconography: "没有统一可考的早期标准像。",
    worship: "后世进入五帝与祖先祭祀。",
    regionalVariants: "帝喾与《山海经》帝俊是否相关，长期存在讨论，不能直接合并。",
    confidence: "明确",
    lead: "帝喾在通行的五帝次序里并不显眼，却是许多王朝祖先谱系的转轴。《史记》借高辛氏，把尧、契、弃等不同支系接进同一张古史家谱。",
    sections: [
      {
        heading: "《史记》的谱系位置",
        paragraphs: [
          "《五帝本纪》把帝喾列在颛顼之后，称其为黄帝曾孙一系，并写他普施利物、顺应天时。随后，帝尧从这一谱系中继位。",
          "这种写法服务于古史的连续性，也让后来商、周等族源能够向上追溯。"
        ]
      },
      {
        heading: "不要急着与帝俊合并",
        paragraphs: [
          "《山海经》的帝俊拥有羲和、常羲等配偶和广泛后裔，与帝喾在读音、谱系上存在可比较之处。学者因此提出过对应关系。",
          "但两部书中的称谓和叙事网络并不相同。本库保留两个条目，只建立存疑的对应关系。"
        ]
      }
    ],
    sources: ["《史记·五帝本纪》", "《大戴礼记·帝系》"],
    boundary: "帝喾与帝俊的关系属于考据问题，不以别名方式直接覆盖。"
  },
  {
    key: "dijun",
    title: "帝俊",
    summary: "《山海经》神话谱系中的核心祖神，与日月、国族和多支后裔相连，后来却淡出通行五帝表。",
    category: "ancient-deities",
    aliases: "帝俊氏",
    identityType: "神祇",
    earliestSource: "《山海经》",
    sourceLocation: "《山海经·大荒南经》《大荒西经》等",
    historicalLayer: "先秦文献层",
    domains: "日月谱系、族源、诸国始祖",
    iconography: "原文没有汇总成统一标准像。",
    worship: "主要存于神话谱系与后世研究，不见统一独立祭祀系统。",
    regionalVariants: "与帝喾、舜等人物的对应均有争议。",
    confidence: "明确",
    lead: "帝俊是《山海经》内部极重要、在后世通行五帝表里却逐渐淡出的名字。若只读《史记》，很容易错过这一整套以日月和远国为枝干的神话谱系。",
    sections: [
      {
        heading: "日与月的父系节点",
        paragraphs: [
          "《大荒南经》说羲和为帝俊之妻，生十日；《大荒西经》又说常羲为帝俊之妻，生十二月。太阳和月亮在这里被写成有亲属关系、有生养过程的群体。",
          "帝俊并不亲自驾驶日月，却处在谱系的中心。"
        ]
      },
      {
        heading: "被古史系统遮住的祖神",
        paragraphs: [
          "《山海经》多次以“帝俊生某”连接国族、人物与技艺。到了以五帝本纪为中心的古史叙述，这个名字不再占据同样位置。",
          "帝俊是否就是帝喾，不能只凭近音或相似谱系决定。保留差异，反而更能看见两套传统怎样交错。"
        ]
      }
    ],
    sources: ["《山海经·大荒南经》", "《山海经·大荒西经》", "《山海经·大荒东经》"],
    boundary: "本页不把帝俊直接改名为帝喾，也不把《山海经》的所有后裔并入《史记》五帝家谱。"
  },
  {
    key: "xihe",
    title: "羲和",
    summary: "《山海经》中帝俊之妻、十日之母，在甘渊浴日；后世又发展出御日与历法职能。",
    category: "nature-deities",
    aliases: "羲和氏",
    identityType: "神祇",
    earliestSource: "《山海经·大荒南经》",
    sourceLocation: "《山海经·大荒南经》羲和国与甘渊段",
    historicalLayer: "跨时期",
    domains: "太阳、生养十日、浴日；后世兼御日与历法",
    iconography: "浴日、御日车等图像对应不同文本层。",
    worship: "主要存在于神话、文学与日神解释中。",
    regionalVariants: "《尚书》羲氏、和氏官名与女神羲和不能无证据合并。",
    confidence: "明确",
    lead: "《大荒南经》写羲和时，场面很安静：她在甘渊为太阳沐浴。日光尚未化成抽象天体，而像一群需要照料、轮流出行的孩子。",
    sections: [
      {
        heading: "十日之母",
        paragraphs: [
          "原文称羲和是帝俊之妻，生十日。她所做的是浴日，不是射日，也不是在这段文字里驾驶太阳车。",
          "这条亲属关系和甘渊地点都有直接文献依据，是帝俊谱系中最清晰的一支。"
        ]
      },
      {
        heading: "御日形象如何长出来",
        paragraphs: [
          "《楚辞》等文学又把羲和写成日御或与太阳运行相关的角色。后世读者常把浴日、御日和历官羲和并成一人。",
          "这些联结有传统基础，但在知识库中仍需标明各自文本，不把同名当作自动身份证明。"
        ]
      }
    ],
    sources: ["《山海经·大荒南经》", "《楚辞·离骚》《天问》相关日行材料", "《尚书·尧典》羲和历官材料"],
    boundary: "本页将女神羲和、日御羲和与羲氏和氏历官分层处理。"
  },
  {
    key: "changxi",
    title: "常羲",
    summary: "《山海经》中帝俊之妻、十二月之母，以浴月叙事连接月相与岁时秩序。",
    category: "nature-deities",
    aliases: "常仪（相关异写与对应）",
    identityType: "神祇",
    earliestSource: "《山海经·大荒西经》",
    sourceLocation: "《山海经·大荒西经》常羲浴月段",
    historicalLayer: "先秦文献层",
    domains: "月亮、十二月、岁时",
    iconography: "没有统一早期标准像，浴月图景主要依据文字重构。",
    worship: "主要见于神话与月神研究，后世常被其他月宫人物遮蔽。",
    regionalVariants: "与嫦娥、常仪的关系需按文字与音变证据讨论。",
    confidence: "明确",
    lead: "常羲没有嫦娥那样家喻户晓，却在《山海经》的日月谱系里与羲和相对：一位生十日，一位生十二月。她保存的是月亮还没有被月宫故事独占时的样子。",
    sections: [
      {
        heading: "十二月之母",
        paragraphs: [
          "《大荒西经》称常羲为帝俊之妻，生月十有二，并为月亮沐浴。十二这个数字让她天然与历月、岁时和周期相连。",
          "原文简短，没有写她的性格、宫殿或与羲和的相处。"
        ]
      },
      {
        heading: "不要被嫦娥覆盖",
        paragraphs: [
          "后世月亮故事以嫦娥最为显眼，常羲因名称相近，也常被猜测为同一人物的早期形态。这个假说值得记录，却还不足以直接合并。",
          "保留常羲独立条目，能看见《山海经》自己的月亮家谱。"
        ]
      }
    ],
    sources: ["《山海经·大荒西经》"],
    boundary: "常羲与嫦娥、常仪的对应属于考据讨论，本页不以异名方式直接判定。"
  },
  {
    key: "xiwangmu",
    title: "西王母",
    summary: "从《山海经》的西方神灵到汉代不死信仰与后世女仙领袖，形象变化极为显著。",
    category: "ancient-deities",
    aliases: "王母、西姥、金母（后世称号）",
    identityType: "神祇",
    earliestSource: "《山海经》",
    sourceLocation: "《山海经·西山经》《海内北经》",
    historicalLayer: "跨时期",
    domains: "灾厉与刑罚、不死资源、西方神域；后世女仙统领",
    iconography: "早期有人面、虎齿、豹尾、蓬发等特征；后世转为冠服端严的女神。",
    worship: "汉代西王母信仰、道教女仙体系与民间王母庙祀。",
    regionalVariants: "怪异西方神、宴饮主人、不死药持有者与女仙之首属于不同阶段。",
    confidence: "明确",
    lead: "西王母像一面能照出时代变化的镜子。她在《山海经》中带着虎齿、豹尾和灾厉权能，后来却坐进瑶池，成为赐寿与统领女仙的王母。两种形象都是真的，只是不属于同一层。",
    sections: [
      {
        heading: "《山海经》的西方神",
        paragraphs: [
          "《西山经》写西王母居玉山，有人形而具虎齿、豹尾、蓬发戴胜等特征，并掌管灾厉与刑杀之气。这个形象既有人格，也保留强烈的兽性与边地感。",
          "《海内北经》等篇又把她放在特定神话空间中。昆仑与玉山的关系需要逐篇阅读，不能只说她固定住在今日某座山。"
        ]
      },
      {
        heading: "不死与女仙秩序",
        paragraphs: [
          "到《穆天子传》和汉代图像，西王母更像能与人间君王宴饮的神圣主人。不死药、东王公配对和女仙领袖等意义也逐渐加强。",
          "后世王母的庄严冠服不是“画错”，而是信仰真的发生了变化。"
        ]
      }
    ],
    sources: ["《山海经·西山经》", "《山海经·海内北经》", "《穆天子传》", "汉代画像石与镜铭材料"],
    boundary: "本页不以明清戏曲和小说中的蟠桃会形象覆盖《山海经》的早期西王母。"
  },
  {
    key: "zhuyin",
    title: "烛阴",
    summary: "居钟山之下的人面蛇身神，以目与呼吸支配昼夜、寒暑和风。",
    category: "nature-deities",
    aliases: "烛龙（相关称呼）",
    identityType: "神祇",
    earliestSource: "《山海经·海外北经》",
    sourceLocation: "《山海经·海外北经》钟山段",
    historicalLayer: "先秦文献层",
    domains: "昼夜、冬夏、风、北方幽暗",
    iconography: "人面蛇身、赤色，身长千里。",
    worship: "主要作为宇宙自然神进入文学与图像。",
    regionalVariants: "烛阴与烛龙通常相互对应，篇章名称和细节略有差异。",
    confidence: "明确",
    lead: "烛阴几乎不需要兵器。睁眼就是白昼，闭眼便成黑夜；吹气为冬，呼气为夏，偶然一息又化成风。它的身体本身就是一套天候机关。",
    sections: [
      {
        heading: "钟山之下",
        paragraphs: [
          "《海外北经》称钟山之神为烛阴，居钟山下，人面蛇身而赤。原文用一连串动作说明它怎样改变世界，没有交代出身或亲属。",
          "昼夜和四季在这里不是远处天体的运行，而是神睁眼、闭眼和呼吸的结果。"
        ]
      },
      {
        heading: "烛阴与烛龙",
        paragraphs: [
          "《大荒北经》等材料又见烛龙，形态与权能接近。通行解释常把两者视为同一神名的不同写法。",
          "本库保留这一主流对应，同时注明具体篇名，避免把所有句子混成一个不存在的长段落。"
        ]
      }
    ],
    sources: ["《山海经·海外北经》", "《山海经·大荒北经》"],
    boundary: "烛阴的昼夜寒暑权能来自明确原文；现代作品补写的性格、阵营与神职层级不属于传统记载。"
  },
  {
    key: "gun",
    title: "鲧",
    summary: "治水失败、受刑而死并生禹的洪水英雄，其失败原因和死后变化存在多种版本。",
    category: "heroes-ancestors",
    aliases: "崇伯鲧、白马（部分变化说）",
    identityType: "英雄",
    earliestSource: "《尚书》《楚辞·天问》《山海经》相关材料",
    sourceLocation: "《尚书·尧典》；《楚辞·天问》；《山海经·海内经》",
    historicalLayer: "跨时期",
    domains: "治水、息壤、洪水谱系",
    iconography: "无统一早期标准像；黄熊、玄鱼、白马等死后变化说分属不同文本。",
    worship: "主要作为治水先行者与禹父进入地方传说。",
    regionalVariants: "被殛原因、尸体变化、生禹方式各有异文。",
    confidence: "明确",
    lead: "鲧常被写成禹成功之前的失败者，但早期文本对他的态度并不简单。《楚辞·天问》连续追问他的任用、受刑与变化，显然没有把答案看成理所当然。",
    sections: [
      {
        heading: "失败并不只有一种解释",
        paragraphs: [
          "《尚书》系统说鲧治水九年而无成，最终受殛。《海内经》则写鲧窃帝之息壤以堙洪水，未待帝命，因而被杀于羽郊。",
          "一个强调治理失败，一个强调越权取物；两者给鲧的责任并不完全相同。"
        ]
      },
      {
        heading: "从鲧到禹",
        paragraphs: [
          "《山海经》写鲧死后生禹，禹继续布土治水。《天问》也把父子的方法差异当作问题提出。",
          "鲧因此不仅是失败的终点，也是治水经验转向下一代的关节。"
        ]
      }
    ],
    sources: ["《尚书·尧典》", "《楚辞·天问》", "《山海经·海内经》"],
    boundary: "鲧化黄熊、玄鱼或其他形态的说法应逐条注明出处，不拼成一次连续变形。"
  },
  {
    key: "yu",
    title: "禹",
    summary: "跨越神话与古史的治水英雄，在疏导洪水、划定九州和王朝起源叙事中占据中心。",
    category: "heroes-ancestors",
    aliases: "大禹、夏禹、文命",
    identityType: "英雄",
    earliestSource: "《尚书》《诗经》等早期材料",
    sourceLocation: "《尚书·禹贡》；《楚辞·天问》；《山海经》相关篇章",
    historicalLayer: "跨时期",
    domains: "治水、九州、道路、王朝起源",
    iconography: "手持耒锸、跛行等形象来自后世叙述与图像。",
    worship: "治水圣王、地方水利祭祀和夏后氏祖先。",
    regionalVariants: "神话治水、地理秩序与夏代古史三层相互交叠。",
    confidence: "明确",
    lead: "禹的故事一半在水里，一半在地图上。洪水退去之后，山川、道路、贡赋与九州也被重新说清；治水因此同时是一场空间秩序的重建。",
    sections: [
      {
        heading: "疏导与布土",
        paragraphs: [
          "《尚书·禹贡》按山川与区域铺陈治理后的天下，《山海经》则保存息壤、杀相柳和神异地理等叙事。《淮南子·本经训》又写舜使禹疏三江五湖，使洪水归海。",
          "这些文本共同塑造禹，却各自关心不同的问题：行政地理、神话敌手或圣王功业。"
        ]
      },
      {
        heading: "父子两种治水",
        paragraphs: [
          "鲧以堙塞见长，禹以后世概括的疏导著称。不过早期文本的实际差别比一句“堵不如疏”更复杂。",
          "《天问》把禹怎样续父业、为何策略不同当作需要追问的事情，这比简单褒贬更接近材料本身。"
        ]
      }
    ],
    sources: ["《尚书·禹贡》", "《楚辞·天问》", "《山海经·海内经》《海外北经》", "《淮南子·本经训》"],
    boundary: "禹迹遍布各地，许多现代地理对应来自后世地方记忆；地图中不得自动视为同一历史路线。"
  },
  {
    key: "yao",
    title: "尧",
    summary: "《尚书》与《史记》古史中的圣王，也是羿射日等神话被安置的时代背景。",
    category: "ancient-deities",
    aliases: "帝尧、陶唐氏、放勋",
    identityType: "帝王",
    earliestSource: "《尚书·尧典》",
    sourceLocation: "《尚书·尧典》；《史记·五帝本纪》",
    historicalLayer: "跨时期",
    domains: "历法、政治秩序、禅让、灾害治理",
    iconography: "后世多作圣王冠服形象。",
    worship: "帝王祖先、圣王与地方尧庙祭祀。",
    regionalVariants: "圣王古史与十日并出神话属于不同文本层。",
    confidence: "明确",
    lead: "《尧典》里的尧首先是一位安排历法和官职的统治者，而不是神怪故事的主角。到《淮南子》，十日并出与群害又被放进尧的时代，他因此成了危机中选用英雄的圣王。",
    sections: [
      {
        heading: "观天与授时",
        paragraphs: [
          "《尚书·尧典》以命羲和历象日月星辰、敬授民时为重要内容。尧的功业从确定时序开始，和农业社会的节律紧密相连。",
          "同篇又展开选贤与让位，为后世禅让叙事提供骨架。"
        ]
      },
      {
        heading: "羿为何出现在尧时",
        paragraphs: [
          "《淮南子·本经训》说十日并出、怪兽为害，尧使羿射日除害。这里的尧负责识人和授权，羿负责行动。",
          "这段神话不应被当成《尧典》已经记载的事件，而是汉代文本对圣王时代的另一种组织。"
        ]
      }
    ],
    sources: ["《尚书·尧典》", "《淮南子·本经训》", "《史记·五帝本纪》"],
    boundary: "尧的精确在位年份属于后世推算，本库时间轴只记录神话次序与文献年代。"
  },
  {
    key: "shun",
    title: "舜",
    summary: "以孝、任贤、巡守和禅让著称的上古圣王，又在洪水治理与南方葬地叙事中留下痕迹。",
    category: "ancient-deities",
    aliases: "帝舜、有虞氏、重华",
    identityType: "帝王",
    earliestSource: "《尚书》相关篇章",
    sourceLocation: "《尚书·舜典》；《史记·五帝本纪》；《山海经·大荒南经》",
    historicalLayer: "跨时期",
    domains: "禅让、官职秩序、巡守、治水任命",
    iconography: "重瞳等特征见于后世叙述，早期标准像不可考。",
    worship: "圣王、孝德典范与南方舜庙祭祀。",
    regionalVariants: "苍梧、九疑等葬地传统与地方记忆交织。",
    confidence: "明确",
    lead: "舜的故事通常从家庭磨难讲起，但在早期政治叙事中，更关键的是他怎样被尧选中、怎样安排百官，又怎样把治水任务交给禹。",
    sections: [
      {
        heading: "从受试到摄政",
        paragraphs: [
          "《尚书》和《史记》把舜写成经受家庭与政治考验后进入权力中心的人。禅让叙事由此不只是一次交位，也是一套反复观察和试用贤者的程序。",
          "舜即位后整饬官职、巡守四方，形成圣王治理的范型。"
        ]
      },
      {
        heading: "洪水与南巡",
        paragraphs: [
          "《淮南子·本经训》把共工洪水置于舜时，并写舜使禹疏导江湖。《史记》又说舜南巡死于苍梧，葬于江南九疑。",
          "《山海经》也保存舜与苍梧、叔均等南方谱系。不同材料让舜的空间记忆远远越过中原。"
        ]
      }
    ],
    sources: ["《尚书·舜典》", "《史记·五帝本纪》", "《淮南子·本经训》", "《山海经·大荒南经》"],
    boundary: "舜的寿数、在位年数和具体巡行路线来自古史系统，不与现代考古年代直接等同。"
  },
  {
    key: "yi-archer",
    title: "羿（神话射者）",
    summary: "受尧命射日、诛除群害的神话英雄，需与夏代古史中的后羿分开辨认。",
    category: "heroes-ancestors",
    aliases: "夷羿、后羿（通称但易与夏代人物混淆）",
    identityType: "英雄",
    earliestSource: "《楚辞·天问》及先秦两汉材料",
    sourceLocation: "《楚辞·天问》；《淮南子·本经训》",
    historicalLayer: "跨时期",
    domains: "射日、除害、弓箭",
    iconography: "持弓射日；具体服饰多为后世艺术改编。",
    worship: "主要作为神射手和英雄母题进入文学、民俗与艺术。",
    regionalVariants: "神话射者羿与有穷氏后羿常被合并，早期材料并不完全一致。",
    confidence: "明确",
    lead: "羿的箭太有名，以至于两个不同问题常被忽略：他射落的是九个太阳，还是只射击日中之乌？他又是不是夏代取代太康的那位后羿？古书没有给出一个省事的答案。",
    sections: [
      {
        heading: "射日与除害",
        paragraphs: [
          "《楚辞·天问》以问句提到羿射日和日乌落羽。《淮南子·本经训》把故事展开在尧时，十日并出，羿上射十日，下杀猰貐，又诛凿齿、九婴等群害。",
          "《淮南子》的重点不只是神射，而是一个英雄如何把失控的自然重新压回可生活的尺度。"
        ]
      },
      {
        heading: "不要和夏代后羿自动合并",
        paragraphs: [
          "《左传》等古史材料中的后羿属于有穷氏，与夏代政权更替相关。神话射者和古史后羿后来不断重叠。",
          "本页只收神话射者；夏代后羿应另建条目，再记录两者为何被视为同一人的传统。"
        ]
      }
    ],
    sources: ["《楚辞·天问》", "《淮南子·本经训》", "《山海经·大荒南经》羿杀凿齿段"],
    boundary: "本页标题加限定词，用来避免把神话羿和夏代有穷氏后羿未经说明地合并。"
  },
  {
    key: "change",
    title: "嫦娥",
    summary: "与羿、不死药和月亮相连的女性形象，早期故事主要依赖佚文、古注与汉代传本线索。",
    category: "nature-deities",
    aliases: "姮娥、恒娥",
    identityType: "神祇",
    earliestSource: "《归藏》佚文与汉代《淮南子》传本线索",
    sourceLocation: "《归藏》佚文；《淮南子·览冥训》古注与类书引文",
    historicalLayer: "两汉文献层",
    domains: "月亮、不死药、奔月",
    iconography: "月中女子、蟾蜍、玉兔与桂树来自不同材料层。",
    worship: "后世进入中秋、月宫文学与女性仙真想象。",
    regionalVariants: "窃药、受药、奔月后化蟾等版本并存。",
    confidence: "存疑",
    lead: "嫦娥的故事人人会讲，真正落到早期文字时却比想象中稀薄。现存线索散在佚文、古注和类书引文里，正因为如此，每一个熟悉细节都需要问清出处。",
    sections: [
      {
        heading: "不死药与奔月",
        paragraphs: [
          "汉代传本线索把羿从西王母处取得不死药、姮娥奔月联系起来。《归藏》佚文也保存恒我窃药奔月的片段。",
          "这些材料的传承状态并不整齐，不能假装我们手里有一篇从头到尾保存完好的先秦故事。"
        ]
      },
      {
        heading: "月宫后来越来越热闹",
        paragraphs: [
          "蟾蜍、玉兔、桂树、吴刚和广寒宫逐渐进入月亮叙事，但出现时代不同。嫦娥也从带有惩罚或异变意味的人物，转成孤居月宫的仙女。",
          "这些后续变化会在信仰演变阶段分别建条目，本页只先固定早期证据。"
        ]
      }
    ],
    sources: ["《归藏》佚文", "《淮南子·览冥训》相关古注与类书引文", "《论衡·顺鼓篇》等汉代月中材料"],
    boundary: "嫦娥奔月的早期文本有佚失与转引问题；本页不把吴刚、广寒宫等晚出内容写成先秦故事。"
  },
  {
    key: "kuafu",
    title: "夸父",
    summary: "逐日而渴死、遗杖化林的巨人英雄；另有参与神战并被应龙所杀的版本。",
    category: "heroes-ancestors",
    aliases: "夸父氏、博父（异写）",
    identityType: "英雄",
    earliestSource: "《山海经·海外北经》",
    sourceLocation: "《山海经·海外北经》夸父逐日段；《大荒北经》",
    historicalLayer: "先秦文献层",
    domains: "逐日、巨人、旱渴、邓林",
    iconography: "巨人持杖逐日；青蛇黄蛇等特征见夸父国相关材料。",
    worship: "主要作为不屈追逐与旱灾母题进入文学。",
    regionalVariants: "逐日渴死与神战中被应龙所杀是两条不同叙事。",
    confidence: "明确",
    lead: "夸父逐日的篇幅很短，力量却全在节奏里：追上太阳，口渴，饮尽河渭，再向北方大泽赶去，最后倒在路上。遗下的手杖化成邓林，失败没有把他的行动彻底抹去。",
    sections: [
      {
        heading: "逐日版本",
        paragraphs: [
          "《海外北经》写夸父与日逐走，渴饮河渭仍不足，未到大泽便死。手杖化为邓林，使干渴的结局长出一片可供后来者停留的树木。",
          "原文没有解释他为何追日。后世赋予志向、治旱或挑战天命等动机，都属于解释。"
        ]
      },
      {
        heading: "另一条死亡叙事",
        paragraphs: [
          "《大荒北经》又把夸父放进蚩尤之后的战争余波，应龙杀蚩尤并杀夸父。这与道渴而死显然不同。",
          "两个版本都保留，比挑一个当“真正结局”更符合古籍原貌。"
        ]
      }
    ],
    sources: ["《山海经·海外北经》", "《山海经·大荒北经》"],
    boundary: "夸父逐日的动机在原文中未明，本页不把现代励志解释写成传统事实。"
  },
  {
    key: "jingwei",
    title: "精卫",
    summary: "炎帝少女女娃溺亡后所化之鸟，长期衔西山木石填塞东海。",
    category: "heroes-ancestors",
    aliases: "女娃（生前名）、誓鸟（后世称誉）",
    identityType: "神祇",
    earliestSource: "《山海经·北山经》",
    sourceLocation: "《山海经·北山经》发鸠山条",
    historicalLayer: "先秦文献层",
    domains: "溺亡、化鸟、填海、执念",
    iconography: "状如乌，文首、白喙、赤足。",
    worship: "主要作为文学与伦理象征流传。",
    regionalVariants: "复仇、治水、悲冤和坚毅等解释由后世阅读不断加重。",
    confidence: "明确",
    lead: "精卫的故事几乎没有多余的话。女娃游于东海，溺而不返，化成一只小鸟；从此，她不断把西山的木石投向那片夺走她生命的海。",
    sections: [
      {
        heading: "发鸠山上的鸟",
        paragraphs: [
          "《北山经》先写发鸠山的柘木，再写一只像乌鸦、花头、白嘴、红脚的鸟。它的叫声像在呼喊自己的名字，名为精卫。",
          "紧接着，原文才说明它原是炎帝少女女娃。山川记录与人物身世在同一条地理行程里相遇。"
        ]
      },
      {
        heading: "填海没有写结局",
        paragraphs: [
          "精卫常衔西山木石填东海，原文没有说她成功，也没有说她放弃。行动因此停在持续进行的状态。",
          "后世把它读成复仇、坚忍或明知不可为而为之，各有道理，但都是阅读产生的意义。"
        ]
      }
    ],
    sources: ["《山海经·北山经》发鸠山条"],
    boundary: "精卫与海燕婚配、生子等后出叙事另行记录；本页不替原文补写填海结局。"
  },
  {
    key: "xingtian",
    title: "刑天",
    summary: "与帝争神、失首后仍以乳为目、脐为口操持干戚的抗争者。",
    category: "heroes-ancestors",
    aliases: "形天（古本异文）",
    identityType: "英雄",
    earliestSource: "《山海经·海外西经》",
    sourceLocation: "《山海经·海外西经》刑天段",
    historicalLayer: "先秦文献层",
    domains: "神权争夺、战斗、不屈",
    iconography: "无首，以乳为目、脐为口，执干戚。",
    worship: "主要作为文学与艺术中的抗争象征。",
    regionalVariants: "原文只称对手为帝，后世多解释为黄帝；与炎帝阵营的关系也多由注释展开。",
    confidence: "明确",
    lead: "刑天失去头颅之后，故事反而没有结束。他把乳当作眼睛，以肚脐为口，仍然挥舞盾与斧。这个形象之所以长久，不在于胜负，而在于身体被毁后行动还在继续。",
    sections: [
      {
        heading: "原文留下的空白",
        paragraphs: [
          "《海外西经》说刑天与帝争神，帝断其首，葬于常羊之山。原文没有在正文中指明这位“帝”是谁，也没有交代争夺的前因。",
          "后世注释常把帝解释为黄帝，并把刑天纳入炎帝一方。这是影响很大的解释，却仍应写清来源。"
        ]
      },
      {
        heading: "干戚之舞",
        paragraphs: [
          "失首后的刑天以身体重新组织感官，操干戚而舞。这里的“舞”不是轻快表演，而是持续战斗的姿态。",
          "陶渊明诗句进一步强化了刑天不屈的后世形象，但诗歌接受史与《山海经》正文需要分开。"
        ]
      }
    ],
    sources: ["《山海经·海外西经》", "郭璞《山海经注》", "陶渊明《读山海经》其十"],
    boundary: "刑天属于炎帝部下、对手必为黄帝等说法主要依后世注释与重述，本页标为解释层。"
  },
  {
    key: "pangu",
    title: "盘古",
    summary: "开辟天地并以身体化生万物的创世人物，完整叙事最早见于三国时期佚籍引文。",
    category: "primordial",
    aliases: "盘古氏、盘瓠（不可轻率混同）",
    identityType: "神祇",
    earliestSource: "徐整《三五历纪》佚文",
    sourceLocation: "《艺文类聚》《太平御览》所引徐整佚文",
    historicalLayer: "魏晋六朝",
    domains: "天地开辟、宇宙生长、身体化生",
    iconography: "巨人持斧的形象很常见，但斧并非最早佚文的必备细节。",
    worship: "后世进入开天始祖、地方盘古庙与文学创作。",
    regionalVariants: "天地日长、死后化生、持斧开天和盘古王等版本层次不同。",
    confidence: "明确",
    lead: "盘古常被放在所有中国神话的第一页，文献年代却比女娲、羿、精卫等叙事晚得多。这个反差不是缺陷，反而说明创世开端也会在历史中被重新发明。",
    sections: [
      {
        heading: "三国时期的开辟者",
        paragraphs: [
          "徐整《三五历纪》已经亡佚，相关文字由《艺文类聚》《太平御览》等类书保存。佚文写天地混沌如鸡子，盘古生其中；天地分开后每日增长，盘古也随之长大。",
          "另一组佚文把盘古死后的气息、声音、双目和四肢化为风云雷霆、日月山岳，形成身体化宇宙的壮阔图景。"
        ]
      },
      {
        heading: "为什么不能倒推到先秦",
        paragraphs: [
          "现有先秦核心文献没有保存这套完整盘古叙事。把盘古排在神话内部的最早时刻可以，但不能把他的文献出现年代也写成最早。",
          "持斧劈开天地是极有影响力的后世画面，做视觉资产时必须标明艺术传统层。"
        ]
      }
    ],
    sources: ["徐整《三五历纪》佚文", "《艺文类聚》卷一所引", "《太平御览》卷二所引"],
    boundary: "盘古是神话叙事中的开端，不等于现存文献中最早出现的中国神祇；持斧形象按后世艺术改编处理。"
  }
];

const locationRows = [
  {
    key: "buzhou-mountain",
    title: "不周山",
    summary: "《山海经》中的西北神话山岳，汉代宇宙论又把它写成共工撞折天柱的地点。",
    spaceKind: "神话空间",
    sourceTitle: "《山海经》《淮南子》",
    sourceLocation: "《山海经·大荒西经》；《淮南子·天文训》",
    historicalPeriod: "先秦至两汉文献层",
    modernCorrespondence: "无可确认的单一现代坐标。",
    confidence: "无法对应",
    lead: "不周山在古籍里首先是一处不完整、环合有缺的西北山岳。到《淮南子》，它又成为天柱折断、地维崩绝的灾变地点。",
    sections: [
      { heading: "两种写法", paragraphs: ["《大荒西经》把不周山放在西北海之外的大荒之隅。《天文训》则借共工触山解释天体西北倾、河流东南下。", "地理位置和宇宙结构在这里叠在一起，不能按普通山岳测绘。"] }
    ],
    sources: ["《山海经·大荒西经》", "《淮南子·天文训》"],
    boundary: "各种现代山脉对应均属推测，地图只表现神话方位，不落精确经纬度。"
  },
  {
    key: "kunlun",
    title: "昆仑",
    summary: "多部古籍反复书写的神圣山域，兼有帝都、神园、河源和西方门户等不同层次。",
    spaceKind: "神话空间",
    sourceTitle: "《山海经》《楚辞》《穆天子传》",
    sourceLocation: "《山海经·海内西经》等；《楚辞·天问》",
    historicalPeriod: "先秦至后世持续演变",
    modernCorrespondence: "与现实昆仑山脉不能未经论证直接等同。",
    confidence: "多种说法",
    lead: "神话昆仑不是一张现代地图上可以圈定的单点。它有时是高山，有时像帝之下都，有时又连接河源、神园和西方世界。",
    sections: [
      { heading: "一座不断增层的山", paragraphs: ["《山海经》不同篇章为昆仑安排宫阙、神兽、水源和守护者。《楚辞·天问》又追问昆仑县圃与增城。", "西王母、开明兽和不死资源后来不断进入昆仑想象，使它成为多层神圣空间。"] }
    ],
    sources: ["《山海经·海内西经》及相关篇章", "《楚辞·天问》", "《穆天子传》"],
    boundary: "本页不把所有昆仑叙事强制放到现代昆仑山同一位置。"
  },
  {
    key: "fajiu-mountain",
    title: "发鸠山",
    summary: "《北山经》北次三经中的山岳，精卫居于其上并从西山衔取木石。",
    spaceKind: "神话空间",
    sourceTitle: "《山海经·北山经》",
    sourceLocation: "《北山经》发鸠山条",
    historicalPeriod: "先秦文献层",
    modernCorrespondence: "历代有多种地望推测，尚无唯一确认。",
    confidence: "多种说法",
    lead: "发鸠山不是精卫故事的布景板。原文先记山上的柘木，再从树木之间引出精卫；她日后衔取的木石，也因此有了清楚的出发地。",
    sections: [
      { heading: "山与故事连在一起", paragraphs: ["《北山经》把发鸠山放在一条连续山系行程中，精卫条目属于地理记录的一部分。", "这种写法提醒我们，许多《山海经》神话原本就嵌在山川、物产和水系之间。"] }
    ],
    sources: ["《山海经·北山经》发鸠山条"],
    boundary: "现代地望只作研究线索，不在神话地图中标为确定坐标。"
  },
  {
    key: "east-sea",
    title: "东海（神话空间）",
    summary: "精卫溺亡与填海的对象，也是多种东方日出、仙境和海神叙事汇集的广阔水域。",
    spaceKind: "神话空间",
    sourceTitle: "《山海经》",
    sourceLocation: "《山海经·北山经》精卫段及海经诸篇",
    historicalPeriod: "先秦至后世",
    modernCorrespondence: "大致指向东方海域，但神话边界不等于现代海区。",
    confidence: "大致区域",
    lead: "精卫面对的东海既是真实方向上的海，也是一片没有写出边界的神话水域。她的行动因海的广大而近乎不可能，也因原文不写结局而永远持续。",
    sections: [
      { heading: "真实方位与神话尺度", paragraphs: ["《北山经》说女娃游于东海而溺，精卫遂常衔木石堙海。", "后世东海又容纳龙宫、仙山和海神等叙事，这些内容不会自动并入精卫时代。"] }
    ],
    sources: ["《山海经·北山经》", "《山海经》海经诸篇"],
    boundary: "地图以神话空间显示，不把现代东海行政或海洋边界套入。"
  },
  {
    key: "zhuolu",
    title: "涿鹿之野",
    summary: "《史记》黄帝与蚩尤决战之地，后世有多种现实地望解释。",
    spaceKind: "存疑对应",
    sourceTitle: "《史记·五帝本纪》",
    sourceLocation: "《史记·五帝本纪》黄帝战蚩尤段",
    historicalPeriod: "两汉古史整理层",
    modernCorrespondence: "河北涿鹿等说影响较大，但古代地名与战场范围仍需辨析。",
    confidence: "多种说法",
    lead: "涿鹿之野在《史记》里是一句决定胜负的地名，到了后世却长出许多遗迹、路线和地方传说。文本中的战场与现代地望不能只凭同名直接重合。",
    sections: [
      { heading: "古史中的战场", paragraphs: ["《五帝本纪》说黄帝征师诸侯，与蚩尤战于涿鹿之野并擒杀蚩尤。", "《山海经》的神战版本则称冀州之野，两处不宜无说明合并。"] }
    ],
    sources: ["《史记·五帝本纪》", "《山海经·大荒北经》对照"],
    boundary: "地图同时保留“涿鹿之野”与“冀州之野”两个文本地点，不强制画成同一战场。"
  },
  {
    key: "zhong-mountain",
    title: "钟山（烛阴所居）",
    summary: "《海外北经》中烛阴居住的北方神山，昼夜寒暑随山神开目与呼吸而变化。",
    spaceKind: "神话空间",
    sourceTitle: "《山海经·海外北经》",
    sourceLocation: "《海外北经》烛阴段",
    historicalPeriod: "先秦文献层",
    modernCorrespondence: "无可确认的单一现代坐标。",
    confidence: "无法对应",
    lead: "钟山在烛阴故事里不是被动地标。山神的身体和山域共同构成北方幽暗世界，昼夜与季节从这里被放出去。",
    sections: [
      { heading: "山下之神", paragraphs: ["《海外北经》说烛阴居钟山下，身长千里。山的尺度与神的尺度彼此匹配。", "其他文献中的同名钟山未必都指这一神话地点。"] }
    ],
    sources: ["《山海经·海外北经》"],
    boundary: "同名现实山岳需另建地点条目，不能自动与烛阴所居钟山合并。"
  },
  {
    key: "yushan-gun",
    title: "羽山与羽郊",
    summary: "鲧受刑之地，在《尚书》古史与《山海经》神话中承担不同叙事功能。",
    spaceKind: "存疑对应",
    sourceTitle: "《尚书》《山海经》",
    sourceLocation: "《尚书·尧典》相关传述；《山海经·海内经》",
    historicalPeriod: "先秦文献层",
    modernCorrespondence: "山东、江苏等地均有地望传统，尚无单一确认。",
    confidence: "多种说法",
    lead: "羽山是鲧故事里最沉重的地点。《尚书》在这里结束一名失败治水者的政治生命，《山海经》则让死亡之后的生禹故事继续发生。",
    sections: [
      { heading: "受刑与变化", paragraphs: ["《海内经》写帝令祝融杀鲧于羽郊，鲧死后生禹。", "古史叙述与神话变化在同一地点交叠，使羽山既像刑场，也像下一代治水故事的起点。"] }
    ],
    sources: ["《尚书·尧典》相关鲧叙述", "《山海经·海内经》"],
    boundary: "各地羽山遗迹作为地方记忆分别记录，不选定唯一现代坐标。"
  },
  {
    key: "ganyuan",
    title: "甘渊",
    summary: "《大荒南经》中羲和浴日之处，连接十日谱系与太阳每日出行的想象。",
    spaceKind: "神话空间",
    sourceTitle: "《山海经·大荒南经》",
    sourceLocation: "《大荒南经》羲和浴日段",
    historicalPeriod: "先秦文献层",
    modernCorrespondence: "无法对应现代经纬度。",
    confidence: "无法对应",
    lead: "甘渊是太阳出发以前的水域。羲和在这里浴日，光明还没有升上天空，先以一种可触摸、可照料的形态停在水中。",
    sections: [
      { heading: "浴日之水", paragraphs: ["《大荒南经》把甘渊放在东南海之外、甘水之间，并写羲和正在浴日。", "这一地点属于神话日行系统，不宜寻找现代温泉或海湾作唯一对应。"] }
    ],
    sources: ["《山海经·大荒南经》"],
    boundary: "甘渊只按文本方位进入神话地图，不设现代坐标。"
  }
];

const sourceRows = [
  {
    key: "shanhaijing",
    title: "《山海经》",
    summary: "由山经、海经与大荒经等多层材料构成的早期地理、物产、祭祀与神话文献集合。",
    formationPeriod: "战国至汉代逐层形成，非一人一时所作",
    edition: "项目核对以今本十八篇及郭璞注本系统为基础",
    volumeSection: "山经五篇、海经八篇、大荒经四篇与海内经一篇",
    lead: "《山海经》不是一部按人物传记编排的神话大全。它沿着山系、海域和荒外空间行进，神话往往只在一条山川记录中突然露面。",
    sections: [
      { heading: "怎样使用这部书", paragraphs: ["人物关系以具体篇章为准，不把不同篇的同名人物自动合并。", "项目只摘录必要短句，正文和今译均重新撰写；郭璞注等注释与经文分层记录。"] }
    ],
    sources: ["《山海经》今本十八篇", "晋郭璞《山海经注》"],
    boundary: "公开页面不引用第三方网页地址；底本差异在内部校勘记录中保存。"
  },
  {
    key: "chuci-tianwen",
    title: "《楚辞·天问》",
    summary: "以连续设问保存宇宙、洪水、羿、鲧禹等古老叙事线索的重要诗篇。",
    formationPeriod: "战国时期楚地文学传统",
    edition: "以《楚辞章句》系统及通行校本互校",
    volumeSection: "《楚辞》天问篇",
    lead: "《天问》最珍贵之处在于它不急着替古老故事收尾。诗人不断发问，让许多已经流传的神话只露出轮廓，也把当时人心中的疑惑一并保存下来。",
    sections: [
      { heading: "问句不是答案", paragraphs: ["女娲之体、鲧禹治水、应龙画地、羿射日等都以问题出现。后世注家提供了答案，但答案不能冒充原诗本身。", "项目引用《天问》时，会把诗句、古注和后世故事分成三个层次。"] }
    ],
    sources: ["《楚辞·天问》", "王逸《楚辞章句》相关注释"],
    boundary: "本页不将某一家注解定为诗中所有问题的唯一答案。"
  },
  {
    key: "huainanzi",
    title: "《淮南子》",
    summary: "西汉淮南王刘安及其宾客编撰的思想著作，系统保存和重组了大量上古神话材料。",
    formationPeriod: "西汉，建元二年前后进献（前139年）",
    edition: "以《淮南鸿烈》通行本及高诱注系统互校",
    volumeSection: "《天文训》《览冥训》《本经训》等",
    lead: "许多今天耳熟能详的上古神话，是在《淮南子》里第一次获得较完整的叙述。它不是单纯保存传说，也在用神话解释宇宙、政治与道的秩序。",
    sections: [
      { heading: "保存，也重新组织", paragraphs: ["女娲补天、共工触山、羿射日和禹治水分别进入不同篇章，各自服务于该篇论证。", "阅读时既要看故事内容，也要看作者为什么在这里讲这个故事。"] }
    ],
    sources: ["《淮南子·天文训》", "《淮南子·览冥训》", "《淮南子·本经训》"],
    boundary: "项目今译自行撰写，不复制现代《淮南子》译注。"
  },
  {
    key: "zhouyi-xici",
    title: "《周易·系辞下》",
    summary: "以包牺、神农、黄帝尧舜等圣王串联技术与制度起源的重要易传文本。",
    formationPeriod: "战国至两汉间形成的易传材料",
    edition: "以十三经注疏系统及通行校本互校",
    volumeSection: "《系辞传》下篇第二章",
    lead: "《系辞下》讲上古圣王时，关心的是器物和制度怎样出现。八卦、网罟、耒耜、市场、衣裳依次展开，像一份古人理解文明成长的次序表。",
    sections: [
      { heading: "不是现代发明年表", paragraphs: ["包牺、神农与黄帝尧舜代表不同文明阶段，不能据此换算成精确年代。", "项目把这些段落用于理解文化记忆，不把它们写成可直接考证的个人专利记录。"] }
    ],
    sources: ["《周易·系辞下》"],
    boundary: "圣王次序属于文献中的文明叙事，不与考古分期机械对号。"
  },
  {
    key: "shangshu-yushu",
    title: "《尚书·虞书》",
    summary: "以尧、舜、禹及百官治理为核心的古史文献群，是圣王、历法和治水叙事的重要骨架。",
    formationPeriod: "篇章年代复杂，今古文系统需分别辨析",
    edition: "以十三经注疏系统与今文研究成果互校",
    volumeSection: "《尧典》《舜典》《大禹谟》《皋陶谟》《益稷》",
    lead: "《虞书》的世界不像《山海经》那样布满异兽，它把上古秩序写在历法、官职、巡守、刑罚和治水里。尧舜禹从这里获得了圣王古史的主要骨架。",
    sections: [
      { heading: "篇章需要分辨", paragraphs: ["《尚书》今古文问题复杂，不能把所有篇章都视为同一时代的直接记录。", "项目引用时标明具体篇名，并把经文、传注和后世古史整理分开。"] }
    ],
    sources: ["《尚书·尧典》", "《尚书·舜典》", "《尚书·禹贡》及虞夏书相关篇章"],
    boundary: "不依据后世年表为尧舜禹设置看似精确的公元纪年。"
  },
  {
    key: "shiji-wudi",
    title: "《史记·五帝本纪》",
    summary: "司马迁对黄帝至舜禹古史材料的选择与编排，奠定后世通行五帝次序。",
    formationPeriod: "西汉太初前后编成",
    edition: "以《史记》三家注系统及通行点校本互校",
    volumeSection: "本纪第一《五帝本纪》",
    lead: "《五帝本纪》最大的影响，不只是讲了哪些故事，而是把分散的黄帝、颛顼、帝喾、尧、舜材料排成一条连续古史。后世熟悉的五帝次序，很大程度上由此固定。",
    sections: [
      { heading: "司马迁承认材料不整齐", paragraphs: ["篇末太史公说明，黄帝传说繁多且文字不够雅驯，他综合《春秋》《国语》等材料，选择较为可信者编次。", "这一说明应保留在阅读入口，提醒我们《史记》本身也是一次整理。"] }
    ],
    sources: ["《史记·五帝本纪》", "裴骃《集解》、司马贞《索隐》、张守节《正义》"],
    boundary: "《五帝本纪》是重要古史文本，不等同于已经由考古证明的逐年实录。"
  },
  {
    key: "sanwu-liji",
    title: "徐整《三五历纪》佚文",
    workType: "魏晋六朝及隋唐古籍",
    summary: "三国吴人徐整所作、今已亡佚的古史神话著作，其引文保存了早期完整盘古开辟叙事。",
    formationPeriod: "三国吴时期",
    edition: "依据《艺文类聚》《太平御览》等类书引文辑录",
    volumeSection: "原书已佚，卷次依引书说明",
    lead: "《三五历纪》原书已经看不见，我们读到的是后代类书留下的窗口。盘古故事因此既著名又脆弱：文字广为流传，原始书貌却无法完整复原。",
    sections: [
      { heading: "怎样使用佚文", paragraphs: ["项目只采用有明确引书名的类书文字，并标注转引来源。", "类书可能节录或改字，不能把拼合后的长篇当作徐整原书原貌。"] }
    ],
    sources: ["《艺文类聚》卷一所引徐整《三五历纪》", "《太平御览》卷二等所引徐整佚文"],
    boundary: "盘古条目会明确写出转引链，不声称保存了《三五历纪》完整原文。"
  }
];

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: ancientEntityId(row.key, worldId),
    worldId,
    type: "character",
    title: row.title,
    slug: `mythology-ancient-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "上古核心", "项目自写整理", ...row.title.split("·").filter(Boolean)],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, row.category),
    order,
    templateId: `template:${worldId}:mythology:deity-person`,
    templateData: {
      canonicalName: row.title,
      aliases: row.aliases,
      tradition: "上古神话",
      identityType: row.identityType,
      earliestSource: row.earliestSource,
      sourceLocation: row.sourceLocation,
      narrativeEra: "神话叙事层，不设公元纪年",
      historicalLayer: row.historicalLayer,
      domains: row.domains,
      iconography: row.iconography,
      worship: row.worship,
      regionalVariants: row.regionalVariants,
      confidence: row.confidence,
      editorialStatus: "复核中",
      originalAdaptation: "false"
    }
  };
}

function buildLocationEntity(row, order, worldId, now) {
  return {
    id: ancientEntityId(row.key, worldId),
    worldId,
    type: "location",
    title: row.title,
    slug: `mythology-place-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "神话地理", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "mythic-geography"),
    order,
    templateId: `template:${worldId}:mythology:sacred-geography`,
    templateData: {
      spaceKind: row.spaceKind,
      tradition: "上古神话",
      historicalPeriod: row.historicalPeriod,
      sourceTitle: row.sourceTitle,
      sourceLocation: row.sourceLocation,
      modernCorrespondence: row.modernCorrespondence,
      confidence: row.confidence,
      mapCaution: "神话地图仅用于叙事与文献索引，不自动等同现代经纬度。"
    }
  };
}

function buildSourceEntity(row, order, worldId, now) {
  return {
    id: sourceEntityId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-source-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "原典文献", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "primary-sources"),
    order,
    templateId: `template:${worldId}:mythology:source-text`,
    templateData: {
      workTitle: row.title,
      workType: row.workType || "先秦两汉古籍",
      formationPeriod: row.formationPeriod,
      edition: row.edition,
      volumeSection: row.volumeSection,
      sourceLayer: "原文",
      rightsStatus: "古籍原文",
      internalCitation: `${row.title} · ${row.volumeSection} · ${row.edition}`,
      reviewStatus: "已核原文"
    }
  };
}

const relationRows = [
  ["fuxi-shennong", "fuxi", "shennong", "custom", "文明次序上的承继", "directed", 4, "primary-text", "《周易·系辞下》", "先秦至两汉易传叙事层", "certain", "只表示《系辞下》安排的文明次序，不表示可考王朝纪年。"],
  ["shennong-huangdi", "shennong", "huangdi", "custom", "文明次序上的承继", "directed", 4, "primary-text", "《周易·系辞下》", "先秦至两汉易传叙事层", "certain", "《系辞下》在神农之后并称黄帝、尧、舜。"],
  ["shennong-yandi", "shennong", "yandi", "custom", "后世常被视作同一身份", "undirected", 3, "scholarly-inference", "汉以后帝王谱系与神农炎帝合称传统", "两汉以后身份合流层", "disputed", "早期文献功能并不完全相同，因此保留两个条目。"],
  ["yandi-jingwei", "yandi", "jingwei", "family", "父女", "directed", 5, "primary-text", "《山海经·北山经》发鸠山条", "神话叙事层", "certain", "原文称女娃为炎帝之少女。"],
  ["huangdi-chiyou", "huangdi", "chiyou", "rival", "战争对手", "undirected", 5, "historical-record", "《史记·五帝本纪》；《山海经·大荒北经》", "古史整理层与神话叙事层", "certain", "两部文献均记交战，但战场细节不同。"],
  ["huangdi-yinglong", "huangdi", "yinglong", "leads", "命令出战", "directed", 5, "primary-text", "《山海经·大荒北经》", "神话叙事层", "certain", "黄帝命应龙攻蚩尤。"],
  ["huangdi-nuba", "huangdi", "nuba", "family", "黄帝之女", "directed", 5, "primary-text", "《山海经·大荒北经》", "神话叙事层", "certain", "原文称黄帝女魃。"],
  ["yinglong-chiyou", "yinglong", "chiyou", "rival", "奉命进攻", "directed", 5, "primary-text", "《山海经·大荒北经》", "神话叙事层", "certain", "应龙蓄水攻蚩尤。"],
  ["nuba-chiyou", "nuba", "chiyou", "rival", "止雨破阵", "directed", 5, "primary-text", "《山海经·大荒北经》", "神话叙事层", "certain", "女魃止住风伯雨师所纵大风雨。"],
  ["yinglong-nuba", "yinglong", "nuba", "ally", "同属黄帝阵营", "undirected", 4, "primary-text", "《山海经·大荒北经》", "神话叙事层", "probable", "同篇先后出战，未直接写二者对话或固定同盟。"],
  ["gonggong-xiangliu", "gonggong", "xiangliu", "leads", "君臣", "directed", 5, "primary-text", "《山海经·海外北经》", "神话叙事层", "certain", "原文称相柳为共工之臣。"],
  ["yu-xiangliu", "yu", "xiangliu", "rival", "诛杀", "directed", 5, "primary-text", "《山海经·海外北经》", "神话叙事层", "certain", "禹杀相柳，随后处理其血污染的土地。"],
  ["gonggong-zhuanxu", "gonggong", "zhuanxu", "rival", "争帝", "undirected", 5, "primary-text", "《淮南子·天文训》", "西汉文本叙事层", "certain", "明确指《天文训》版本，不代表所有共工故事。"],
  ["gonggong-buzhou", "gonggong", "buzhou-mountain", "controls", "怒触致天柱折", "directed", 5, "primary-text", "《淮南子·天文训》", "西汉宇宙神话层", "certain", "以山体倾折解释天地西北高、东南下。"],
  ["huangdi-zhuanxu", "huangdi", "zhuanxu", "family", "祖孙谱系", "directed", 4, "historical-record", "《史记·五帝本纪》", "西汉古史整理层", "certain", "按《五帝本纪》黄帝、昌意、颛顼谱系。"],
  ["huangdi-diku", "huangdi", "diku", "family", "祖先谱系", "directed", 4, "historical-record", "《史记·五帝本纪》", "西汉古史整理层", "certain", "帝喾属于黄帝玄嚣一支。"],
  ["zhuanxu-diku", "zhuanxu", "diku", "custom", "五帝次序承继", "directed", 4, "historical-record", "《史记·五帝本纪》", "西汉古史整理层", "certain", "表示本纪编排的帝位次序，不表示父子。"],
  ["diku-yao", "diku", "yao", "family", "父子谱系", "directed", 4, "historical-record", "《史记·五帝本纪》", "西汉古史整理层", "certain", "按《五帝本纪》帝喾生放勋，即帝尧。"],
  ["dijun-diku", "dijun", "diku", "custom", "疑似对应", "undirected", 2, "scholarly-inference", "《山海经》帝俊谱系与《史记》帝喾谱系对读", "现代考据层", "disputed", "保留为存疑对应，不作为别名合并。"],
  ["dijun-xihe", "dijun", "xihe", "family", "夫妻", "undirected", 5, "primary-text", "《山海经·大荒南经》", "神话叙事层", "certain", "原文称羲和者，帝俊之妻。"],
  ["dijun-changxi", "dijun", "changxi", "family", "夫妻", "undirected", 5, "primary-text", "《山海经·大荒西经》", "神话叙事层", "certain", "原文称常羲为帝俊妻。"],
  ["xihe-ganyuan", "xihe", "ganyuan", "located", "浴日于甘渊", "directed", 5, "primary-text", "《山海经·大荒南经》", "神话叙事层", "certain", "羲和在甘渊浴日。"],
  ["xiwangmu-kunlun", "xiwangmu", "kunlun", "located", "西方神域关联", "directed", 3, "primary-text", "《山海经·西山经》《海内北经》", "先秦神话地理层", "probable", "不同篇章涉及玉山、昆仑等西方空间，不固定为单一居所。"],
  ["zhuyin-zhongshan", "zhuyin", "zhong-mountain", "located", "居钟山下", "directed", 5, "primary-text", "《山海经·海外北经》", "神话叙事层", "certain", "原文明确称钟山之神烛阴居钟山下。"],
  ["gun-yu", "gun", "yu", "family", "父子", "directed", 5, "primary-text", "《山海经·海内经》；《史记·夏本纪》", "神话与古史叙事层", "certain", "《海内经》写鲧复生禹。"],
  ["gun-yushan", "gun", "yushan-gun", "located", "受刑于羽郊", "directed", 5, "primary-text", "《山海经·海内经》", "神话叙事层", "certain", "帝令祝融杀鲧于羽郊。"],
  ["yu-gonggong", "yu", "gonggong", "rival", "平治其洪水余患", "directed", 3, "primary-text", "《淮南子·本经训》", "西汉圣王叙事层", "probable", "篇中先写共工振洪水，后写舜使禹疏治；未直接写二人交战。"],
  ["yao-yi", "yao", "yi-archer", "leads", "命羿除害", "directed", 5, "primary-text", "《淮南子·本经训》", "西汉神话叙事层", "certain", "尧使羿射日并诛群害。"],
  ["yao-shun", "yao", "shun", "custom", "禅让与摄政承继", "directed", 5, "historical-record", "《尚书·尧典》；《史记·五帝本纪》", "古史叙事层", "certain", "表示文献中的政治承继。"],
  ["shun-yu", "shun", "yu", "leads", "任命治水并承继", "directed", 5, "historical-record", "《尚书》相关篇章；《史记·五帝本纪》", "古史叙事层", "certain", "治水任命与帝位承继需分别阅读。"],
  ["yi-change", "yi-archer", "change", "family", "配偶传统", "undirected", 4, "historical-record", "《淮南子》相关古注与类书引文", "汉代传本层", "probable", "早期传本文字不完整，关系标为较可信。"],
  ["yi-xiwangmu", "yi-archer", "xiwangmu", "custom", "求取不死药", "directed", 4, "historical-record", "《淮南子》相关古注与类书引文", "汉代传本层", "probable", "通过转引保存，不按完整现存篇章处理。"],
  ["change-xiwangmu", "change", "xiwangmu", "custom", "不死药来源关联", "directed", 3, "historical-record", "《淮南子》相关古注与类书引文", "汉代传本层", "probable", "药由羿从西王母处取得，嫦娥与西王母并非直接授受。"],
  ["kuafu-yinglong", "kuafu", "yinglong", "rival", "应龙杀夸父的异说", "directed", 4, "primary-text", "《山海经·大荒北经》", "神话叙事层", "certain", "与《海外北经》道渴而死并列为不同版本。"],
  ["jingwei-fajiu", "jingwei", "fajiu-mountain", "located", "栖于发鸠山", "directed", 5, "primary-text", "《山海经·北山经》", "神话叙事层", "certain", "精卫条目见发鸠山记录。"],
  ["jingwei-eastsea", "jingwei", "east-sea", "rival", "衔木石堙海", "directed", 5, "primary-text", "《山海经·北山经》", "神话叙事层", "certain", "东海既是女娃溺亡处，也是精卫持续填塞的对象。"],
  ["huangdi-zhuolu", "huangdi", "zhuolu", "located", "战于涿鹿之野", "directed", 5, "historical-record", "《史记·五帝本纪》", "西汉古史整理层", "certain", "只表示《史记》战场。"],
  ["chiyou-zhuolu", "chiyou", "zhuolu", "located", "战败于涿鹿之野", "directed", 5, "historical-record", "《史记·五帝本纪》", "西汉古史整理层", "certain", "《山海经》另写冀州之野。"],
  ["xingtian-huangdi", "xingtian", "huangdi", "rival", "后世解释的争神对手", "undirected", 2, "scholarly-inference", "《山海经·海外西经》正文及郭璞注", "晋代注释及后世接受层", "disputed", "正文只称帝，黄帝说依注释传统。"],
  ["nuwa-yinglong", "nuwa", "yinglong", "custom", "仪仗驾乘", "directed", 3, "primary-text", "《淮南子·览冥训》", "西汉女娲补天叙事层", "certain", "女娲功成后乘雷车，服驾应龙。"],
  ["pangu-nuwa", "pangu", "nuwa", "custom", "后世创世叙事次序", "directed", 2, "historical-record", "徐整《三五历纪》佚文与后世神话汇编传统", "魏晋以后叙事编排层", "disputed", "只表示后世常见编排，不表示早期文献中的直接关系。"]
];

const eventRows = [
  ["pangu-separates", "mythic-narrative", "盘古开辟天地", "天地混沌如鸡子，盘古生其中；天地分判后与之俱长。", "开辟之初", "神话叙事层", 10, "pangu", ["pangu"], "custom", "", ""],
  ["nuwa-repairs", "mythic-narrative", "女娲补天立极", "天地倾裂、水火不息，女娲炼五色石补天并止住洪水。", "天地失序之后", "神话叙事层", 20, "nuwa", ["nuwa", "yinglong"], "custom", "", ""],
  ["fuxi-trigrams", "mythic-narrative", "包牺观象作八卦", "包牺观察天、地、鸟兽与万物，作八卦并结绳为网。", "文明肇始阶段", "神话叙事层", 30, "fuxi", ["fuxi"], "custom", "", ""],
  ["shennong-farming", "mythic-narrative", "神农教耕并设日中之市", "神农制作耒耜，教人耕作，并以日中为市组织交换。", "农耕与交易兴起", "神话叙事层", 40, "shennong", ["shennong"], "custom", "", ""],
  ["huangdi-chiyou-war", "mythic-narrative", "黄帝与蚩尤之战", "黄帝、蚩尤、应龙与女魃进入同一神战，风雨与蓄水成为战局的一部分。", "上古战争阶段", "神话叙事层", 50, "huangdi", ["huangdi", "chiyou", "yinglong", "nuba"], "custom", "", ""],
  ["gonggong-strikes", "mythic-narrative", "共工触不周山", "共工与颛顼争帝后触山，天柱折、地维绝，天地由此西北高而东南下。", "天地倾斜之变", "神话叙事层", 60, "gonggong", ["gonggong", "zhuanxu", "buzhou-mountain"], "custom", "", ""],
  ["kuafu-chases", "mythic-narrative", "夸父逐日", "夸父追逐太阳，渴饮河渭仍不足，赴大泽途中身亡，遗杖化为邓林。", "日行失衡时期", "神话叙事层", 70, "kuafu", ["kuafu"], "custom", "", ""],
  ["jingwei-fills", "mythic-narrative", "女娃化精卫并填海", "女娃溺于东海，化为精卫，持续衔取西山木石填塞东海。", "炎帝世系叙事中", "神话叙事层", 80, "jingwei", ["jingwei", "yandi", "fajiu-mountain", "east-sea"], "custom", "", ""],
  ["gun-controls-flood", "mythic-narrative", "鲧以息壤治水", "鲧未经帝命取息壤堙洪水，受刑于羽郊，治水事业转到禹手中。", "洪水前期", "神话叙事层", 90, "gun", ["gun", "yushan-gun"], "custom", "", ""],
  ["yu-controls-flood", "mythic-narrative", "禹疏导洪水", "禹续鲧之业，疏江湖、平水土，并在不同文本中建立九州与道路秩序。", "洪水后期", "神话叙事层", 100, "yu", ["yu", "gun", "xiangliu"], "custom", "", ""],
  ["yi-shoots-suns", "mythic-narrative", "羿射日并诛群害", "尧时十日并出，羿奉命射日并清除猰貐、凿齿等群害。", "尧时灾异", "神话叙事层", 110, "yi-archer", ["yi-archer", "yao"], "custom", "", ""],
  ["yao-yields", "mythic-narrative", "尧选舜并让位", "尧在古史叙事中考察舜，使其摄政并最终承继帝位。", "圣王禅让阶段", "神话叙事层", 120, "yao", ["yao", "shun"], "custom", "", ""],
  ["shun-appoints-yu", "mythic-narrative", "舜命禹治水并传位", "舜时洪水为患，禹受命疏治；古史又安排禹最终承继舜。", "圣王禅让阶段", "神话叙事层", 130, "shun", ["shun", "yu"], "custom", "", ""],
  ["xingtian-resists", "mythic-narrative", "刑天失首而舞干戚", "刑天与帝争神，被断首后仍以乳为目、脐为口，操干戚而舞。", "上古神战阶段", "神话叙事层", 140, "xingtian", ["xingtian"], "custom", "", ""],
  ["xici-formation", "textual-evidence", "《系辞下》形成圣王文明次序", "包牺、神农、黄帝尧舜被用于说明器物与制度的发生。", "战国至两汉间", "文献形成层", 10, "source-zhouyi-xici", ["source-zhouyi-xici", "fuxi", "shennong"], "range", "-350", "50"],
  ["tianwen-formation", "textual-evidence", "《天问》保存神话问句", "女娲、鲧禹、应龙与羿等叙事以连续设问进入楚辞传统。", "战国时期", "文献形成层", 20, "source-chuci-tianwen", ["source-chuci-tianwen", "nuwa", "gun", "yi-archer"], "approximate", "-300", "-200"],
  ["shanhaijing-formation", "textual-evidence", "《山海经》材料逐层汇集", "山经、海经与大荒经等不同材料在战国至汉代逐步形成今本基础。", "战国至汉代", "文献形成层", 30, "source-shanhaijing", ["source-shanhaijing"], "range", "-350", "100"],
  ["huainanzi-presented", "textual-evidence", "《淮南子》进献朝廷", "刘安及宾客编撰的《淮南子》在西汉建元二年前后进献，系统保存多组神话。", "西汉建元二年（前139年）", "文献形成层", 40, "source-huainanzi", ["source-huainanzi"], "exact", "-139", "-139"],
  ["shiji-compiled", "textual-evidence", "《五帝本纪》编定通行帝系", "司马迁整理黄帝至舜禹材料，形成影响深远的五帝古史次序。", "西汉太初前后", "文献形成层", 50, "source-shiji-wudi", ["source-shiji-wudi", "huangdi", "zhuanxu", "diku", "yao", "shun"], "approximate", "-110", "-90"],
  ["pangu-text-recorded", "textual-evidence", "徐整佚籍记录盘古开辟", "三国吴时期的《三五历纪》等佚籍留下完整盘古开辟与化生叙事。", "三国吴时期", "文献形成层", 60, "source-sanwu-liji", ["source-sanwu-liji", "pangu"], "approximate", "220", "280"]
];

function buildRelation(row, worldId, now) {
  const [key, sourceKey, targetKey, kind, label, direction, strength, evidenceType, sourceCitation, historicalScope, confidence, notes] = row;
  return {
    id: `relation:${worldId}:mythology:ancient-core:${key}`,
    worldId,
    sourceEntityId: ancientEntityId(sourceKey, worldId),
    targetEntityId: ancientEntityId(targetKey, worldId),
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

function buildTimelineEvent(row, worldId, now) {
  const [key, trackKey, title, summary, displayDate, era, sortOrder, primaryKey, referenceKeys, datePrecision, startValue, endValue] = row;
  const references = referenceKeys.map((referenceKey) => ({
    kind: "entity",
    id: ancientEntityId(referenceKey, worldId)
  }));
  return {
    id: `timeline-event:${worldId}:mythology:ancient-core:${key}`,
    worldId,
    entityId: ancientEntityId(primaryKey, worldId),
    questId: "",
    sceneId: "",
    references,
    trackId: trackId(trackKey, worldId),
    title,
    summary,
    displayDate,
    datePrecision,
    sortOrder,
    startValue,
    endValue,
    era,
    dependencyIds: [],
    updatedAt: now
  };
}

function buildAncientCoreBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  const figures = figureRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const locations = locationRows.map((row, index) => buildLocationEntity(row, figures.length + index, worldId, now));
  const sources = sourceRows.map((row, index) => buildSourceEntity(row, figures.length + locations.length + index, worldId, now));
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...figures, ...locations, ...sources],
    figures,
    locations,
    sources,
    relations: relationRows.map((row) => buildRelation(row, worldId, now)),
    timelineEvents: eventRows.map((row) => buildTimelineEvent(row, worldId, now)),
    featuredEntityIds: ["nuwa", "huangdi", "dijun", "xiwangmu", "yu", "yi-archer", "jingwei", "pangu"]
      .map((key) => ancientEntityId(key, worldId))
  };
}

module.exports = {
  BATCH_KEY,
  BATCH_LABEL,
  ancientEntityId,
  buildAncientCoreBatch,
  sourceEntityId,
  trackId
};
