const {
  WORLD_ID,
  categoryId
} = require("./chinese-mythology-history-data.cjs");
const {
  prajnaSourceId
} = require("./chinese-mythology-buddhism-prajna-data.cjs");

const BATCH_KEY = "buddhism-canon-core-24";
const BATCH_LABEL = "佛教完整知识库 · 经律论、异译与汉地注疏核心批";

function canonEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:buddhism-canon:${key}`;
}

function canonSourceId(key, worldId = WORLD_ID) {
  return canonEntityId(`source-${key}`, worldId);
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

function work(key, title, focus, options = {}) {
  return { key, title, focus, ...options };
}

const familyRows = [
  {
    key: "agama",
    title: "四阿含与早期教说文献群",
    formation: "早期佛教口传材料经部派传承、结集和汉译形成的复合文献层",
    scope: "以《长阿含》《中阿含》《杂阿含》《增一阿含》的具名经篇和相应、品类为入口，保存缘起、五蕴、戒行、游行与僧俗生活等早期材料。",
    boundary: "四部汉译阿含与巴利四部尼柯耶可以对读，却不能简单写成逐句相同的两套译本；部派归属、经号和篇章次序须分别记录。",
    reading: "先定位所属阿含、卷次或相应，再比较异译和对应经；人物故事不从后世传记倒填回早期经篇。",
    creation: "适合为僧团日常、城邑游化和问答场景提供细节。新增对白、连续旅程或心理活动必须标作项目原创。",
    works: [
      work("long-parinirvana", "《长阿含经·游行经》", "佛陀晚年游行、入灭、舍利分配与早期共同体记忆"),
      work("long-world-record", "《长阿含经·世记经》", "世界结构、洲海、天界与劫变叙述"),
      work("long-small-origins", "《长阿含经·小缘经》", "社会身份、王权起源和姓氏观念的佛教论辩"),
      work("long-payasi", "《长阿含经·弊宿经》", "业报、后世存在与譬喻论证"),
      work("long-sakka-questions", "《长阿含经·释提桓因问经》", "帝释问法、冲突根源与欲爱分析"),
      work("middle-arrow", "《中阿含经·箭喻经》", "拒绝无助于解脱的形而上追问"),
      work("middle-satipatthana", "《中阿含经·念处经》", "身、受、心、法四念处的修习次第"),
      work("middle-four-truths", "《中阿含经·分别圣谛经》", "四圣谛的定义、说明与弟子转述"),
      work("long-sigalovada", "《长阿含经·善生经》", "家庭、师友、雇佣与僧俗伦理的六方譬喻"),
      work("samyukta-dependent-origin", "《杂阿含经·因缘相应》", "缘起支分、此有故彼有与苦的生灭"),
      work("samyukta-aggregates", "《杂阿含经·阴相应》", "五蕴无常、苦、无我及观察方法"),
      work("ekottara-disciples", "《增一阿含经·弟子品》", "弟子专长名录及后世十大弟子说的早期资料")
    ]
  },
  {
    key: "vinaya",
    title: "律藏与戒学文献群",
    formation: "印度不同部派律藏、戒本及汉地律学疏钞长期累积的制度文献层",
    scope: "并列保存四分、五分、摩诃僧祇、十诵和根本说一切有部律，另列戒本、羯磨疏与菩萨戒传统。",
    boundary: "一条戒的制戒因缘、正文、解释和汉地执行办法不是同一层；不同部派律不能拼成一部从未存在的通行律。",
    reading: "先确认部派和文本类型，再看戒条、犍度或羯磨程序；人物逸事服务于制度解释，不直接当作完整传记。",
    creation: "可为寺院制度、受戒、布萨和僧团争议提供场景依据。虚构寺规、判罚和人物动机要另列原创设定。",
    works: [
      work("dharmaguptaka-sixty", "《四分律》六十卷", "法藏部比丘、比丘尼戒与犍度制度"),
      work("mahisasaka-five-part", "《五分律》", "化地部律制、僧团程序与佛传叙事"),
      work("mahasanghika-vinaya", "《摩诃僧祇律》", "大众部戒律、制戒因缘与僧团生活"),
      work("sarvastivada-ten-recitation", "《十诵律》", "说一切有部律制和十诵结构"),
      work("mulasarvastivada-vinaya", "《根本说一切有部毗奈耶》", "根本说一切有部律藏及丰富缘起叙事"),
      work("mulasarvastivada-bhiksuni", "《根本说一切有部苾刍尼毗奈耶》", "比丘尼戒条、僧团程序和女众生活"),
      work("mahisasaka-pratimoksa", "《弥沙塞五分戒本》", "化地部比丘戒本的条目化诵本"),
      work("dharmaguptaka-bhiksu-pratimoksa", "《四分比丘戒本》", "四分律比丘波罗提木叉诵本"),
      work("dharmaguptaka-bhiksuni-pratimoksa", "《四分比丘尼戒本》", "四分律比丘尼波罗提木叉诵本"),
      work("karma-commentary", "《四分律羯磨疏》", "道宣系统解释受戒、说戒等羯磨程序", { layer: "注疏" }),
      work("annotated-precept-commentary", "《四分律含注戒本疏》", "四分戒本的分科、释义和持犯判断", { layer: "注疏" }),
      work("south-seas-monastic-law", "《南海寄归内法传》", "义净所见印度与南海僧团日常和律仪", { layer: "史料记录" }),
      work("brahma-net-bodhisattva-precepts", "《梵网经菩萨戒本》", "十重四十八轻戒及东亚菩萨戒接受", { disputed: "其汉地成书、译者题署与文本来源长期有讨论，本库不把传统题署当成已经解决的文献结论。" }),
      work("yogacara-bodhisattva-precepts", "《菩萨戒本》（瑜伽菩萨戒系）", "从《瑜伽师地论》摄出的菩萨戒条与受持框架")
    ]
  },
  {
    key: "abhidharma",
    title: "阿毗达磨与部派论书群",
    formation: "部派佛教对法相、心所、因果与修道次第进行分类论证的论书传统",
    scope: "以说一切有部六足一身、大毗婆沙、俱舍及其反驳书为主，同时保留汉地影响显著的心论和《成实论》。",
    boundary: "论书中的分类是特定学派的分析工具，不等于全体佛教共享的一张永恒本体表；异说要保留论敌和论证语境。",
    reading: "从一个论题进入，再回看定义、问答和反驳；不要只摘术语表而舍弃该论为何提出此分类。",
    creation: "适合设计学僧辩论、译场术语选择和宗派课程。虚构论战结果需标注为项目故事。",
    works: [
      work("sangitiparyaya", "《集异门足论》", "依数目次第汇集法义的说一切有部论书"),
      work("dharmaskandha", "《法蕴足论》", "以经说为纲分析蕴、处、道品等法"),
      work("prajnaptisastra", "《施设足论》", "世界、业与名相施设的论议材料"),
      work("vijnanakaya", "《识身足论》", "心识、过去未来诸法及论敌辨析"),
      work("dhatukaya", "《界身足论》", "蕴处界与心所关系的分类"),
      work("prakaranapada", "《品类足论》", "法的分类、摄属和多门分别"),
      work("jnanaprasthana", "《发智论》", "说一切有部根本论与八蕴论题"),
      work("mahavibhasa-bonds", "《大毗婆沙论·结蕴》", "烦恼系缚、结与修断问题的广泛论议"),
      work("abhidharmakosa", "《俱舍论》", "世亲对有部阿毗达磨的系统综述与批判"),
      work("nyayanusara", "《顺正理论》", "众贤针对《俱舍论》维护有部立场的回应"),
      work("abhidharmasamayapradipika", "《显宗论》", "众贤较简明呈现有部宗义的论书"),
      work("abhidharma-heart", "《阿毗昙心论》", "以偈颂组织有部论义的早期纲要"),
      work("miscellaneous-abhidharma-heart", "《杂阿毗昙心论》", "扩充心论体系并影响汉地毗昙学"),
      work("satyasiddhi", "《成实论》", "诃梨跋摩论法、空与灭谛的汉译论书")
    ]
  },
  {
    key: "madhyamaka",
    title: "中观、三论与二谛注疏群",
    formation: "印度中观论书与陈隋汉地三论学解释相接的跨地域论释层",
    scope: "从《中论》《十二门论》《百论》进入空、缘起和二谛论证，再由吉藏等人的玄义、疏记观察汉地三论学。",
    boundary: "龙树、提婆论书与汉地三论宗的判教语言并非同时形成；作者题署、译本和后世宗派解释分栏保存。",
    reading: "先跟随偈颂和破斥对象，再看注疏如何分科；空不被改写为虚无，也不从一句名言替代整段论证。",
    creation: "可用于辩论、讲席和概念冲突。项目若写师徒对话，应把经论原义与虚构情境分开。",
    works: [
      work("mulamadhyamakakarika", "《中论》", "八不、缘起性空与二十七品论证"),
      work("twelve-gate-treatise", "《十二门论》", "以十二门集中破除自性成立"),
      work("hundred-treatise", "《百论》", "提婆破斥外道与有所得见的汉译论书"),
      work("dasheng-xuanlun", "《大乘玄论》", "吉藏汇论二谛、佛性与诸大乘经义", { layer: "注疏" }),
      work("middle-treatise-commentary", "《中观论疏》", "吉藏逐品疏解《中论》并保存旧说", { layer: "注疏" }),
      work("hundred-treatise-commentary", "《百论疏》", "吉藏解释《百论》的破邪显正结构", { layer: "注疏" }),
      work("twelve-gate-commentary", "《十二门论疏》", "吉藏对十二门论证和异说的疏解", { layer: "注疏" }),
      work("two-truths-meaning", "《二谛义》", "吉藏讲述二谛、教门与得失的记录", { layer: "注疏" }),
      work("sanlun-profound-meaning", "《三论玄义》", "三论学源流、破显方法和宗要纲领", { layer: "注疏" }),
      work("vigrahavyavartani", "《回诤论》", "龙树回应空论自身是否自相矛盾"),
      work("great-vehicle-hundred-commentary", "《大乘广百论释论》", "护法释圣天《广百论》的唯识化论辩", { layer: "注疏" }),
      work("karatalaratna", "《掌珍论》", "清辨以形式论证阐述真性空")
    ]
  },
  {
    key: "yogacara",
    title: "瑜伽行、摄论与唯识文献群",
    formation: "印度瑜伽行派论书、不同汉译系统与唐代法相唯识注疏交织的文本层",
    scope: "覆盖《瑜伽师地论》、摄论两译系统、唯识二十颂和三十颂、《成唯识论》以及心识、所缘和佛地论书。",
    boundary: "真谛摄论学和玄奘、窥基法相学不能压成一套术语；无著、世亲、护法等题署及编译过程逐项记录。",
    reading: "先辨文本属于本论、释论还是汉地糅译，再追踪一个术语在不同译师手里的变化。",
    creation: "可写译场争词、学派论难和修行者观察心识的故事；具体内心戏属于项目原创。",
    works: [
      work("yogacarabhumi", "《瑜伽师地论》", "十七地、修行阶位与广泛法相分类"),
      work("xianyang-shengjiao", "《显扬圣教论》", "以十一品提要瑜伽行派教义与修道"),
      work("mahayanasutralamkara", "《大乘庄严经论》", "菩萨道、种姓、修行与大乘功德论述"),
      work("mahayanasamgraha-xuanzang", "《摄大乘论本》（玄奘译）", "阿赖耶识、三性与十地的玄奘译本"),
      work("mahayanasamgraha-paramartha", "《摄大乘论》（真谛译）", "真谛译语中的依他、分别性与解性传统"),
      work("vasubandhu-samgraha-commentary", "《摄大乘论释》（世亲释、玄奘译）", "世亲解释无著摄论的唐译系统", { layer: "注疏" }),
      work("asvabhava-samgraha-commentary", "《摄大乘论释》（无性释、玄奘译）", "无性解释摄论的另一唐译论释", { layer: "注疏" }),
      work("madhyantavibhaga", "《辨中边论》", "虚妄分别、空性和中道修行结构"),
      work("trimsika", "《唯识三十论颂》", "世亲三十颂与识转变纲领"),
      work("cheng-weishi", "《成唯识论》", "玄奘糅译十家释论形成的唯识总论", { layer: "注疏" }),
      work("vimsatika", "《唯识二十论》", "以梦、地狱等譬喻论证识所现"),
      work("alambanapariksa", "《观所缘缘论》", "陈那考察认识对象能否成立所缘缘"),
      work("abhidharmasamuccaya", "《大乘阿毗达磨集论》", "无著组织大乘法相和修道门类"),
      work("abhidharmasamuccayavyakhya", "《大乘阿毗达磨杂集论》", "师子觉、安慧系统扩释《集论》", { layer: "注疏" }),
      work("samdhinirmocana", "《解深密经》", "三时教、三性、唯识与瑜伽止观"),
      work("buddhabhumi-commentary", "《佛地经论》", "佛地功德与净识理论的经论合释", { layer: "注疏" })
    ]
  },
  {
    key: "tathagatagarbha",
    title: "如来藏、佛性与一乘文献群",
    formation: "印度大乘经论、汉译题署与东亚佛性论述长期对读的复合文本层",
    scope: "收入《如来藏经》《胜鬘经》相关章节、《宝性论》《不增不减经》及影响东亚思想的《大乘起信论》。",
    boundary: "如来藏、佛性、清净心和一乘在不同文本中功能不同；不能把后世统一解释倒写成每部经论的原义。",
    reading: "先看譬喻和论证对象，再比较注释传统；对作者、译者和成书地有争议的文本保留多种判断。",
    creation: "可用于身份觉醒、遮蔽与显现等叙事母题，但不能把项目寓言冒充传统经说。",
    works: [
      work("ratnagotravibhaga", "《究竟一乘宝性论》", "佛性、三宝种姓和如来藏论证"),
      work("awakening-of-faith", "《大乘起信论》", "一心二门、熏习与东亚佛教心性论", { disputed: "传统题马鸣造、真谛译，近现代对作者与成书地有持续争论；本库并列传统题署与文本史问题。" }),
      work("anunatvapurnatva", "《不增不减经》", "众生界、法身与不增不减关系"),
      work("anuttarasraya", "《无上依经》", "如来界、菩提与功德的系统说明"),
      work("mahdbheri", "《大法鼓经》", "常住、如来藏与一乘宣说"),
      work("tathagatagarbha-sutra", "《如来藏经》", "九种譬喻说明烦恼所覆的如来藏"),
      work("angulimaliya-garbha", "《央掘魔罗经·如来藏相关品》", "央掘魔罗在大乘长篇中宣说如来藏"),
      work("srimala-one-vehicle", "《胜鬘经·一乘章与如来藏章》", "胜鬘夫人论一乘、法身与如来藏")
    ]
  },
  {
    key: "lotus-tiantai",
    title: "法华经异译与天台注疏群",
    formation: "法华经多种汉译、印度论释与陈隋至唐宋天台疏记形成的解释传统",
    scope: "三种完整汉译分别建页，并列世亲论释、智顗三大部、湛然记疏以及法华三昧和安乐行文献。",
    boundary: "罗什本的品名和分卷不替代竺法护、阇那崛多等译本；天台判教与经本文义分层显示。",
    reading: "先选定译本和品次，再进入论释或宗派注疏；法会人物、譬喻和后世仪式不混成一层。",
    creation: "可从授记、久远佛、譬喻和法华三昧发展剧情，新增转世、战争或对白要明确标注原创。",
    works: [
      work("lotus-dharmaraksa", "《正法华经》", "竺法护十卷译本及其早期汉译词汇"),
      work("lotus-kumarajiva", "《妙法莲华经》（鸠摩罗什七卷本）", "东亚流传最广的罗什译本及二十八品结构"),
      work("lotus-added", "《添品妙法莲华经》", "阇那崛多、达摩笈多合译的七卷增补本"),
      work("lotus-upadesa", "《妙法莲华经忧波提舍》", "传统题世亲造的法华经论释", { layer: "注疏" }),
      work("fahua-profound-meaning", "《法华玄义》", "智顗以五重玄义和十妙解释法华", { layer: "注疏" }),
      work("fahua-words-phrases", "《法华文句》", "智顗讲、灌顶记的逐品经文解释", { layer: "注疏" }),
      work("zhiguan-fuxing", "《止观辅行传弘决》", "湛然为《摩诃止观》作系统记释", { layer: "注疏" }),
      work("xuanyi-shiqian", "《法华玄义释签》", "湛然疏解《法华玄义》的教观术语", { layer: "注疏" }),
      work("wenju-ji", "《法华文句记》", "湛然为《法华文句》补释宗义和旧说", { layer: "注疏" }),
      work("lotus-samadhi-ritual", "《法华三昧忏仪》", "法华三昧的道场、行法与忏悔次第", { layer: "注疏" }),
      work("lotus-peaceful-practices", "《法华经安乐行义》", "慧思解释安乐行与法华三昧", { layer: "注疏" }),
      work("lotus-wandering-meaning", "《法华游意》", "吉藏从三论立场讲解法华宗旨", { layer: "注疏" })
    ]
  },
  {
    key: "huayan",
    title: "华严经异译与华严宗注疏群",
    formation: "分品汉译、六十卷和八十卷大经、四十卷行愿品及华严宗论疏的累积文本层",
    scope: "三大汉译本独立建页，并保存早期单品经、法藏教义、澄观疏钞和宗密、杜顺系统的法界观文献。",
    boundary: "六十、八十、四十卷本的会次和品名不可互相覆盖；五教、十玄等属于汉地解释，不冒充每个梵本共有的目录。",
    reading: "先确认使用哪一译本，再追卷品和会次；华严宗注疏作为解释层单独开启。",
    creation: "可写善财参学、重重世界和法界观照，但项目新增地点、人物对白和结局应标原创。",
    works: [
      work("huayan-sixty", "六十卷《华严经》", "佛驮跋陀罗译本与东晋华严大经结构"),
      work("huayan-eighty", "八十卷《华严经》", "实叉难陀译本及七处九会结构"),
      work("huayan-forty", "四十卷《华严经》", "般若译《入不思议解脱境界普贤行愿品》"),
      work("dousha-sutra", "《兜沙经》", "支娄迦谶译早期华严类单品与十方佛"),
      work("bodhisattva-original-karma", "《菩萨本业经》", "早期华严类菩萨行位和本业材料"),
      work("ten-abodes-sutra", "《十住经》", "鸠摩罗什译十地类单品经"),
      work("huayan-five-teachings", "《华严一乘教义分齐章》（《华严五教章》）", "法藏判教、六相和一乘义", { layer: "注疏" }),
      work("huayan-shu", "《大方广佛华严经疏》", "澄观为八十华严作分科和义理疏解", { layer: "注疏" }),
      work("huayan-yanyi-chao", "《大方广佛华严经随疏演义钞》", "澄观扩展华严疏的讲说记录", { layer: "注疏" }),
      work("golden-lion", "《华严金师子章》", "以金狮子譬喻法界缘起和六相", { layer: "注疏" }),
      work("return-to-source", "《修华严奥旨妄尽还源观》", "法藏名下法界观修与真妄结构", { layer: "注疏", disputed: "题署与文本层次需结合传本研究；本库不以一篇短文代表全部华严宗。" }),
      work("dushun-dharmadhatu", "《注华严法界观门》", "杜顺名下三重法界观的注释传统", { layer: "注疏", disputed: "现存文本与题署经历后世整理，人物著作关系按传统归名与文本史分列。" })
    ]
  },
  {
    key: "vimalakirti-lanka",
    title: "维摩诘、楞伽与居士问法文献群",
    formation: "维摩诘经三译、楞伽经三译及汉地义疏并列构成的译本比较层",
    scope: "以在家居士说法、不二法门和心识、如来藏、语言限度为主轴，保持两大经系彼此独立。",
    boundary: "《首楞严三昧经》与后出的《大佛顶首楞严经》不是同一部；三种维摩译本和三种楞伽译本也各自建页。",
    reading: "先看译者和卷数，再比较相同场景或概念；禅宗接受史不能代替早期译本原貌。",
    creation: "适合写城市居士、沉默问答和海岛说法场景；项目新增人物经历必须另标原创。",
    works: [
      work("vimalakirti-zhiqian", "《佛说维摩诘经》（支谦译）", "三卷早期汉译和吴地译语"),
      work("vimalakirti-kumarajiva", "《维摩诘所说经》（鸠摩罗什译）", "三卷罗什译本及东亚主要流通文本"),
      work("vimalakirti-xuanzang", "《说无垢称经》（玄奘译）", "六卷唐译与较细密的术语对应"),
      work("vimalakirti-annotated", "《注维摩诘经》", "僧肇等旧注汇入的罗什本解释传统", { layer: "注疏" }),
      work("vimalakirti-yishu", "《维摩经义疏》", "吉藏从三论立场分科维摩经", { layer: "注疏" }),
      work("jingming-xuanlun", "《净名玄论》", "吉藏综合讨论净名经宗旨和二智", { layer: "注疏" }),
      work("lanka-gunabhadra", "《楞伽阿跋多罗宝经》（求那跋陀罗译）", "四卷宋译与早期禅门重视的楞伽本"),
      work("lanka-bodhiruci", "《入楞伽经》（菩提流支译）", "十卷北魏译本和完整品次"),
      work("lanka-siksananda", "《大乘入楞伽经》（实叉难陀译）", "七卷唐译与新译术语"),
      work("lanka-yishu", "《楞伽经义疏》", "智旭等汉地注疏中的楞伽解释", { layer: "注疏" }),
      work("lanka-xuanyi", "《楞伽经玄义》", "汉地注家提纲楞伽宗旨与教观", { layer: "注疏" }),
      work("surangama-samadhi", "《首楞严三昧经》", "鸠摩罗什译菩萨三昧经，与大佛顶经严格消歧")
    ]
  },
  {
    key: "nirvana-surangama",
    title: "涅槃、楞严与圆觉文献群",
    formation: "大般涅槃经多译本、南北本整理和东亚后出经疏共同构成的文献群",
    scope: "保存法显六卷、昙无谶四十卷与南本三十六卷，并独立处理《大佛顶首楞严经》《圆觉经》及其汉地注疏。",
    boundary: "涅槃经异本属于译传和整理问题；《楞严经》《圆觉经》的印度来源、汉地成书和题署争议必须公开，不因信仰影响而删书，也不把争论写成定案。",
    reading: "先选经本，再进注疏；读楞严、圆觉时同时查看传统题署和现代文献研究，不以立场取代证据。",
    creation: "可用于佛性、末法、修行迷误与道场叙事。新增咒术效果和人物结局必须标为项目原创。",
    works: [
      work("nirvana-northern", "《大般涅槃经》（昙无谶北本四十卷）", "北凉译四十卷本、佛性与常乐我净论述"),
      work("nirvana-faxian", "《大般泥洹经》（法显六卷）", "法显、佛陀跋陀罗译六卷本及前分材料"),
      work("nirvana-southern", "南本《大般涅槃经》（三十六卷）", "慧严、慧观等依北本与六卷本整理的南本"),
      work("nirvana-collected-commentary", "《涅槃经集解》", "梁代汇集诸师解释的涅槃经注释资料", { layer: "注疏" }),
      work("nirvana-commentary", "《大般涅槃经疏》", "隋唐注家分科涅槃经与佛性义", { layer: "注疏" }),
      work("great-surangama", "《大佛顶首楞严经》", "十卷经的七处征心、圆通、戒摄与楞严咒", { disputed: "传统题般剌蜜帝译、房融笔受；译出经过、梵本来源与汉地成书问题长期有争议，本库不以传统题署或现代质疑单方面结案。" }),
      work("surangama-zhengmai", "《楞严经正脉疏》", "明代交光真鉴依经脉络重释见性与修证", { layer: "注疏" }),
      work("surangama-tongyi", "《楞严经通议》", "憨山德清贯通楞严义理和禅观", { layer: "注疏" }),
      work("perfect-enlightenment", "《大方广圆觉修多罗了义经》", "十二菩萨问答、圆觉与修行病的汉地流传本", { disputed: "经录始见和印度原本问题存在争论；页面并列传统佛说定位与东亚文本史，不写成无争议早期印度译经。" }),
      work("perfect-enlightenment-dashu", "《圆觉经大疏》", "宗密对圆觉经教义和修证的系统疏解", { layer: "注疏" }),
      work("perfect-enlightenment-lueshu", "《圆觉经略疏》", "宗密删繁提要的圆觉经注疏", { layer: "注疏" }),
      work("perfect-enlightenment-chao", "《圆觉经大疏钞》", "宗密系统扩释圆觉大疏的资料层", { layer: "注疏" })
    ]
  },
  {
    key: "pure-land",
    title: "净土经论与往生注疏群",
    formation: "阿弥陀佛国经多译本、观经、往生论及汉地净土论著长期汇合的文献层",
    scope: "把小经异译、无量寿经古译和宝积会本分别建页，并列世亲愿生偈、昙鸾、道绰及东亚往生论著。",
    boundary: "所谓净土三经是后世阅读组合，不代表三部经同一时期成书；古译无量寿经之间不能拼成单一原文。",
    reading: "先识别译本，再看本愿、观想、称名和往生论释；不同传统对自力、他力的解释另行比较。",
    creation: "可写愿行、临终记忆、行旅和净土想象；项目创造的往生个案必须标为原创故事。",
    works: [
      work("amitabha-kumarajiva", "《佛说阿弥陀经》（鸠摩罗什译）", "极乐国土、诸佛证诚和执持名号"),
      work("amitabha-xuanzang", "《称赞净土佛摄受经》（玄奘译）", "小经唐译及十方佛称赞结构"),
      work("contemplation-sutra", "《佛说观无量寿佛经》", "韦提希请法、十六观和九品往生"),
      work("infinite-life-pingdengjue", "《无量清净平等觉经》", "早期无量寿经译本的愿文和叙事形态"),
      work("infinite-life-dayi", "《阿弥陀三耶三佛萨楼佛檀过度人道经》", "支谦名下古译与早期净土术语"),
      work("great-amitabha", "《大阿弥陀经》", "宋代王日休会集本及其编纂性质", { layer: "注疏", disputed: "本书是汉地会集本，不作为印度原典或独立古译；页面保留其流通史和会集边界。" }),
      work("ratnakuta-infinite-life", "《大宝积经·无量寿如来会》", "菩提流志译宝积会本与四十八愿"),
      work("sukhavativyuha-upadesa", "《无量寿经优波提舍愿生偈》", "世亲名下愿生偈与五念门"),
      work("tanluan-commentary", "《往生论注》", "昙鸾解释他力、五念门与二种回向", { layer: "注疏" }),
      work("daocho-anleji", "《安乐集》", "道绰汇引经论说明圣道、净土与末法", { layer: "注疏" }),
      work("pure-land-ten-doubts", "《净土十疑论》", "智顗名下十问答的净土辩疑传统", { layer: "注疏", disputed: "传统题智顗撰，文本归属存在讨论；本库以传统影响和归属争议并列。" }),
      work("ojoden", "《往生要集》", "源信组织地狱厌离、极乐欣求与念佛实践", { layer: "注疏" })
    ]
  },
  {
    key: "medicine-ksitigarbha",
    title: "药师、地藏与救济经典群",
    formation: "药师经异译、地藏十轮经系及东亚地藏信仰文本并行的救济经典层",
    scope: "补入药师经早译、灌顶经药师材料、两种十轮经和占察传统，并对疑伪或东亚形成的延命地藏经单独标注。",
    boundary: "药师、地藏、延命和占察实践可在后世仪式中相遇，但不是一部经内固定系统；题署可疑文本不隐去也不冒充无争议译经。",
    reading: "先看译者、卷数和经录记录，再比较本愿、业报、占察与护国功能。",
    creation: "适合写医药、救难、地狱救济和忏悔剧情；新造灵验故事要显著标为项目原创。",
    works: [
      work("medicine-dharmagupta", "《佛说药师如来本愿经》（达摩笈多译）", "隋译药师经与十二愿的早期汉本"),
      work("consecration-medicine", "《灌顶拔除过罪生死得度经》", "灌顶经系中的药师名号、续命与拔罪材料"),
      work("ksitigarbha-ten-wheels", "《地藏十轮经》", "失译四卷本的地藏十轮和末世僧俗教诫"),
      work("great-collection-ten-wheels", "《大乘大集地藏十轮经》", "玄奘译十卷本与地藏菩萨护国、十轮义"),
      work("divination-karma", "《占察善恶业报经》", "木轮占察、忏悔与一实境界", { disputed: "隋代经录曾对本经出处提出疑问，后世又广泛受持；页面同时保存经录争议和信仰事实。" }),
      work("life-prolonging-ksitigarbha", "《佛说延命地藏菩萨经》", "东亚流传的延命地藏文本与图像", { disputed: "现存传播与日本地藏信仰关系密切，印度原本和汉译题署缺少可靠证明；不列作无争议汉译大藏经原典。" })
    ]
  },
  {
    key: "esoteric-dharani",
    title: "密教经轨、陀罗尼与宿曜文献群",
    formation: "唐代密教译场、陀罗尼经、曼荼罗修法和天文占候文本形成的多支文献层",
    scope: "从金刚顶念诵、理趣、菩提心论进入唐密核心，再列尊胜、十一面、准提、不空罥索、摩利支天及宿曜文献。",
    boundary: "经、仪轨、陀罗尼和后世法本用途不同；北斗经等东亚形成或题署存疑文本必须另标，不能借译师名号自动取得印度来源。",
    reading: "先辨主尊、坛法、译者和仪轨类型，再看真言、手印与观想；公开页不完整复制需要传授语境的现代法本。",
    creation: "可为宫廷法会、译场和星宿历算提供素材。项目设计的法术效果与仪式结果只属于原创世界观。",
    works: [
      work("vajrasekhara-abbreviated", "《金刚顶瑜伽中略出念诵经》", "金刚智译金刚界曼荼罗和念诵次第"),
      work("adamahavajra-pleasure", "《大乐金刚不空真实三摩耶经》（《理趣经》）", "般若理趣、十七清净句与密教诵持"),
      work("principle-interest-commentary", "《理趣释》", "不空解释理趣经句、曼荼罗和密意", { layer: "注疏" }),
      work("vajrasekhara-sacred-stages", "《金刚顶瑜伽分别圣位修证法门》", "金刚界圣位、成佛次第与曼荼罗结构"),
      work("bodhicitta-treatise", "《菩提心论》", "不空译题署下的行愿、胜义和三摩地菩提心", { disputed: "传统题龙猛造、不空译，作者与文本形成层需保留研究讨论。" }),
      work("usnisa-vijaya", "《佛顶尊胜陀罗尼经》", "尊胜陀罗尼、延寿灭罪与多译本流传"),
      work("eleven-faced-heart", "《十一面神咒心经》", "十一面观音陀罗尼及早期汉译体系"),
      work("cintamanicakra-dharani", "《如意轮陀罗尼经》", "如意轮观音、陀罗尼和坛法"),
      work("cundi-dharani", "《准提陀罗尼经》", "准提佛母陀罗尼、多臂图像与修持"),
      work("amoghapasa-transformations", "《不空罥索神变真言经》", "不空罥索观音多品真言、坛法与救济"),
      work("marici-dharani", "《摩利支天菩萨陀罗尼经》", "摩利支天隐形、护行与陀罗尼传统"),
      work("northern-dipper-life", "《北斗七星延命经》", "北斗礼拜、延命与佛道交涉的东亚文本", { disputed: "题署与成书背景显示明显东亚层，不能仅因冠以佛说便当作无争议印度译经。" }),
      work("xiuyao", "《宿曜经》", "不空、史瑶等译述的二十七宿、七曜与历日"),
      work("seven-luminaries", "《七曜攘灾决》", "七曜值日、攘灾法与唐代星占知识", { layer: "注疏" })
    ]
  },
  {
    key: "catalogues",
    title: "历代经录与目录学文献群",
    formation: "隋唐僧人和官修译场对译经、存佚、真伪与入藏次第进行整理的目录学层",
    scope: "以法经录、历代三宝纪、开元录和贞元录为四个独立入口，支持全库的译者、年代与疑伪经判断。",
    boundary: "经录会承袭旧说，也会受当代藏书和政治环境限制；目录记载是证据，不等于所有题署都被现代研究证实。",
    reading: "查询一部经时同时查看著录、译者、卷数、存缺和真伪分类，并与现存写本或刻本互证。",
    creation: "可写藏经编目、亡经追索和译场档案剧情。虚构卷帙与发现经过必须标作项目原创。",
    works: [
      work("kaiyuan-catalogue", "《开元释教录》", "智昇编纂的译经总录、入藏录与古今诸家目录", { layer: "史料记录" }),
      work("zhenyuan-catalogue", "《贞元新定释教目录》", "圆照续订开元以后译经和入藏情况", { layer: "史料记录" }),
      work("lidai-sanbao-ji", "《历代三宝纪》", "费长房按朝代编排佛法僧与译经史料", { layer: "史料记录" }),
      work("fajing-catalogue", "《众经目录》（法经录）", "隋代法经等编订经录及真伪、大小乘分类", { layer: "史料记录" })
    ]
  }
];

const sourceRows = familyRows.flatMap((family) => family.works.map((row, index) => ({
  ...row,
  familyKey: family.key,
  familyTitle: family.title,
  familyFormation: family.formation,
  familyBoundary: family.boundary,
  familyReading: family.reading,
  familyCreation: family.creation,
  position: index + 1,
  layer: row.layer || "原文",
  formation: row.formation || family.formation,
  attribution: row.attribution || "本页按现存汉译题署、历代经录和传本结构定位；题署不稳或成书有争论时，以本页边界栏为准。",
  edition: row.edition || "汉文大藏经通行本与可核古籍传本",
  volumeSection: row.volumeSection || "全书；具体卷品按条目阅读导航定位",
  disputed: row.disputed || "暂无必须以单一结论覆盖的重大题署争议；异译、卷次和后世解释仍分别记录。"
})));

function renderSystem(row) {
  return [
    `<p>${escapeHtml(row.title)}不是一份只列书名的清单，而是把同一问题下的经、律、论、异译和注疏分开安放的阅读入口。</p>`,
    `<h2>收录范围</h2><p>${escapeHtml(row.scope)}</p>`,
    `<h2>形成脉络</h2><p>${escapeHtml(row.formation)}。本页现收 ${row.works.length} 部文献，每部保留自己的题署与版本栏。</p>`,
    `<h2>辨读边界</h2><p>${escapeHtml(row.boundary)}</p>`,
    `<h2>使用顺序</h2><p>${escapeHtml(row.reading)}</p>`,
    `<h2>创作使用</h2><p>${escapeHtml(row.creation)} 这里给出的用法是项目编辑建议，不是传统文献的一部分。</p>`,
    `<h2>资料声明</h2><p>${escapeHtml(row.title)}只收古籍书目信息与项目重新撰写的概述，不复制现代受版权保护译文，也不在公开正文中保留第三方网址。</p>`
  ].join("");
}

function renderSource(row) {
  return [
    `<p>${escapeHtml(row.title)}列入“${escapeHtml(row.familyTitle)}”。这一页先回答它究竟是哪一种文本，再说明可以从哪里读起。</p>`,
    `<h2>文献概况</h2><p>${escapeHtml(row.title)}主要涉及${escapeHtml(row.focus)}。${escapeHtml(row.attribution)}</p>`,
    `<h2>成书与传本</h2><p>对于${escapeHtml(row.title)}，当前采用“${escapeHtml(row.formation)}”这一宽度定位；卷数、译者和分品差异不从别部同名文献自动补入。</p>`,
    `<h2>内容范围</h2><p>阅读${escapeHtml(row.title)}时，应把注意力放在${escapeHtml(row.focus)}，并沿本页关系进入同家族异译、论释和制度接受史。</p>`,
    `<h2>版本边界</h2><p>${escapeHtml(row.title)}的处理边界是：${escapeHtml(row.disputed)} ${escapeHtml(row.familyBoundary)}</p>`,
    `<h2>阅读路径</h2><p>查阅${escapeHtml(row.title)}可先确认版本与卷品，再按主题进入正文；${escapeHtml(row.familyReading)}</p>`,
    `<h2>创作使用（项目原创提示）</h2><p>${escapeHtml(row.title)}可提供${escapeHtml(row.focus)}方面的材料。${escapeHtml(row.familyCreation)} 新写情节不得回填为古籍事实。</p>`,
    `<h2>资料声明</h2><p>${escapeHtml(row.title)}页面保存古籍题名、版本定位和项目自写摘要；不复制第三方知识库，不收现代版权译文，公开正文不含站外链接。</p>`
  ].join("");
}

function buildSystemEntity(row, order, worldId, now) {
  return {
    id: canonEntityId(`family-${row.key}`, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-buddhism-canon-family-${row.key}`,
    summary: `${row.title}收录 ${row.works.length} 部独立文献，按原典、异译、论释与汉地接受层分开阅读。`,
    content: renderSystem(row),
    tags: ["中国神话史", "佛教完整知识库", "经律论目录", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "buddhism"),
    order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: "佛教",
      institutionKind: "经律论文献家族与阅读目录",
      hierarchyLevel: "佛教知识库文献层",
      jurisdiction: row.scope,
      formationPeriod: row.formation,
      earliestSource: row.works[0].title,
      sourceLocation: "本家族各文献页的卷品、译本与目录栏",
      variants: row.boundary,
      confidence: "主流说法"
    }
  };
}

function buildSourceEntity(row, order, worldId, now) {
  return {
    id: canonSourceId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-buddhism-canon-source-${row.key}`,
    summary: `${row.title}：${row.focus}；本页区分题署、异译、注疏和后世接受。`,
    content: renderSource(row),
    tags: ["中国神话史", "佛教完整知识库", "经律论与注疏", row.familyTitle, "项目自写整理", row.title],
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
      edition: row.edition,
      volumeSection: row.volumeSection,
      sourceLayer: row.layer,
      rightsStatus: "古籍原文",
      internalCitation: `${row.title} · ${row.familyTitle} · ${row.volumeSection}`,
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
    direction: options.direction || "directed",
    strength: options.strength || 4,
    evidenceType: options.evidenceType || "primary-text",
    confidence: options.confidence || "certain",
    notes: options.notes || "关系只用于文献导航与版本辨读，不把不同成书层合并为同一原本。"
  };
}

const membershipRelations = sourceRows.map((row) => relation(
  `member-${row.key}`,
  `s:${row.key}`,
  `f:${row.familyKey}`,
  "列入本批经律论家族",
  row.title,
  row.familyFormation,
  { kind: "member", strength: 5 }
));

const familySourceRelations = sourceRows.map((row) => relation(
  `source-family-${row.key}`,
  `f:${row.familyKey}`,
  `s:${row.key}`,
  "家族文献入口",
  row.title,
  row.familyFormation,
  {
    kind: "source",
    strength: 5,
    evidenceType: row.layer === "史料记录" ? "historical-record" : "primary-text",
    notes: "此边证明该文献属于目录页的直接书目依据，不代表目录页取代原文。"
  }
));

const sequenceRelations = familyRows.flatMap((family) => family.works.slice(0, -1).map((row, index) => relation(
  `sequence-${family.key}-${String(index + 1).padStart(2, "0")}`,
  `s:${row.key}`,
  `s:${family.works[index + 1].key}`,
  "同家族下一阅读入口",
  `${row.title}；${family.works[index + 1].title}`,
  family.formation,
  { kind: "custom", strength: 2, evidenceType: "scholarly-inference", confidence: "probable", notes: "顺序服务于本库阅读导航，不声称历史上一直采用这一次第。" }
)));

const comparisonRelations = familyRows.flatMap((family) => family.works.slice(1).map((row) => relation(
  `compare-${family.key}-${row.key}`,
  `s:${row.key}`,
  `s:${family.works[0].key}`,
  "同一文献家族对读",
  `${row.title}；${family.works[0].title}`,
  family.formation,
  { kind: "evolution", strength: 3, evidenceType: "textual-variant", confidence: "probable", notes: "两页共享问题域，但可能是异译、注疏、同宗论书或后出整理，并不自动等同。" }
)));

const crossRows = [
  ["agama-vinaya", "f:agama", "f:vinaya", "早期经说与制戒因缘互证"],
  ["agama-abhidharma", "f:agama", "f:abhidharma", "经篇教说进入论书分类"],
  ["vinaya-catalogues", "f:vinaya", "f:catalogues", "律本卷数与译者依经录校核"],
  ["abhidharma-yogacara", "f:abhidharma", "f:yogacara", "部派法相与大乘阿毗达磨对读"],
  ["madhyamaka-yogacara", "f:madhyamaka", "f:yogacara", "中观与唯识论争及互释"],
  ["madhyamaka-tathagatagarbha", "f:madhyamaka", "f:tathagatagarbha", "空义与佛性解释边界"],
  ["lotus-tiantai", "f:lotus-tiantai", "f:madhyamaka", "天台与三论法华解释对读"],
  ["huayan-yogacara", "f:huayan", "f:yogacara", "华严法界与唯识术语交涉"],
  ["huayan-tathagatagarbha", "f:huayan", "f:tathagatagarbha", "华严宗心性论与如来藏资料对读"],
  ["vimalakirti-madhyamaka", "f:vimalakirti-lanka", "f:madhyamaka", "不二法门与三论解释传统"],
  ["lanka-yogacara", "f:vimalakirti-lanka", "f:yogacara", "楞伽心识说与瑜伽行文献对读"],
  ["nirvana-tathagatagarbha", "f:nirvana-surangama", "f:tathagatagarbha", "涅槃佛性与如来藏文献对读"],
  ["pureland-lotus", "f:pure-land", "f:lotus-tiantai", "天台教观中的净土经典解释"],
  ["medicine-esoteric", "f:medicine-ksitigarbha", "f:esoteric-dharani", "救济经典与陀罗尼仪礼交会"],
  ["esoteric-yogacara", "f:esoteric-dharani", "f:yogacara", "唐密菩提心论与瑜伽行术语交涉"],
  ["catalogues-lotus", "f:catalogues", "f:lotus-tiantai", "三种法华译本的经录定位"],
  ["catalogues-huayan", "f:catalogues", "f:huayan", "华严异译与入藏次第校核"],
  ["catalogues-surangama", "f:catalogues", "f:nirvana-surangama", "楞严圆觉著录与成书争议入口"],
  ["catalogues-pureland", "f:catalogues", "f:pure-land", "无量寿经古译存佚与经录辨析"],
  ["canon-diamond-anchor", "f:madhyamaka", "ps:diamond-kumarajiva", "与已完成的金刚般若专题交叉阅读"]
];

const crossRelations = crossRows.map(([key, sourceRef, targetRef, label]) => relation(
  `cross-${key}`,
  sourceRef,
  targetRef,
  label,
  key === "canon-diamond-anchor" ? "《金刚般若波罗蜜经》罗什译本与中观论书" : "本批经律论、注疏与历代经录对读",
  "印度佛教文献、汉译与东亚解释传统分层",
  { kind: "influence", strength: 3, evidenceType: "scholarly-inference", confidence: "probable", notes: "交叉边用于提示比较路径，不主张两部文献观点完全一致。" }
));

function milestone(key, trackKey, sourceKey, title, summary, startValue, endValue, displayDate, era) {
  return { key, trackKey, sourceKey, title, summary, startValue, endValue, displayDate, era };
}

const eventRows = [
  milestone("ekottara-translation", "textual-evidence", "ekottara-disciples", "《增一阿含经》在东晋译场形成现行汉本", "译本保存按法数增一编排的经篇和弟子专长材料，译者与重译过程仍需结合经录判断。", "384", "397", "约384至397年", "东晋阿含译经层"),
  milestone("middle-agama-translation", "textual-evidence", "middle-arrow", "僧伽提婆译出六十卷《中阿含经》", "中等篇幅的教说、人物问答和修行法门由此形成完整汉文入口。", "397", "398", "397至398年", "东晋建康译经层"),
  milestone("long-agama-translation", "textual-evidence", "long-parinirvana", "佛陀耶舍、竺佛念译出《长阿含经》", "游行、世记和王权问法等长篇材料被编入二十二卷汉译。", "413", "413", "413年", "后秦长安译经层"),
  milestone("samyukta-agama-translation", "textual-evidence", "samyukta-dependent-origin", "求那跋陀罗译出五十卷《杂阿含经》", "以相应组织的缘起、五蕴和弟子问答进入刘宋汉译大藏。", "435", "443", "约435至443年", "刘宋阿含译经层"),
  milestone("four-part-vinaya-translation", "textual-evidence", "dharmaguptaka-sixty", "佛陀耶舍、竺佛念译《四分律》", "六十卷律本为后世汉地律学和受戒制度提供主要文本之一。", "410", "412", "约410至412年", "后秦律藏译经层"),
  milestone("ten-recitation-translation", "textual-evidence", "sarvastivada-ten-recitation", "鸠摩罗什译场续成《十诵律》", "说一切有部律在长安译出，译事经历诵出者更替与续补。", "404", "409", "约404至409年", "后秦律藏译经层"),
  milestone("mahasanghika-translation", "textual-evidence", "mahasanghika-vinaya", "佛陀跋陀罗、法显译《摩诃僧祇律》", "大众部律藏在建康形成四十卷汉译，保留大量制戒故事。", "416", "418", "约416至418年", "东晋刘宋之际律藏译经层"),
  milestone("five-part-translation", "textual-evidence", "mahisasaka-five-part", "佛陀什等译《五分律》", "化地部律的戒条与犍度进入刘宋译经网络。", "423", "424", "约423至424年", "刘宋律藏译经层"),
  milestone("mulasarvastivada-translation", "textual-evidence", "mulasarvastivada-vinaya", "义净系统译出根本说一切有部律", "海路求法带回的律藏、戒本和羯磨文献在武周至唐初陆续译成汉文。", "700", "711", "约700至711年", "武周唐初律藏译经层"),
  milestone("satyasiddhi-translation", "textual-evidence", "satyasiddhi", "鸠摩罗什译出《成实论》", "诃梨跋摩论书进入汉地讲习，并在南朝形成成实学。", "411", "412", "约411至412年", "后秦论书译场层"),
  milestone("abhidharma-seven-treatises", "textual-evidence", "jnanaprasthana", "有部根本论与六足论陆续具备汉译", "从早期毗昙译本到玄奘新译，六足一身的汉文面貌跨越数百年才逐渐完整。", "383", "663", "约383至663年", "汉译阿毗达磨累积层"),
  milestone("abhidharmakosa-translations", "textual-evidence", "abhidharmakosa", "《俱舍论》先后形成真谛与玄奘译本", "两种汉译让世亲偈颂和长行释进入不同的摄论、法相学语境。", "563", "654", "约563至654年", "南北朝至唐代论书重译层"),
  milestone("three-treatises-translation", "textual-evidence", "mulamadhyamakakarika", "罗什译场完成三论核心论书", "《中论》《百论》《十二门论》在长安形成汉地三论学的共同文本底座。", "408", "409", "约408至409年", "后秦中观论书译场层"),
  milestone("jizang-sanlun-writing", "textual-evidence", "sanlun-profound-meaning", "吉藏整理三论玄义与多部经论疏", "陈隋之际的讲学把二谛、破显和宗派源流组织成系统解释。", "580", "623", "约580至623年", "陈隋三论注疏层"),
  milestone("paramartha-samgraha", "textual-evidence", "mahayanasamgraha-paramartha", "真谛译《摄大乘论》及释论", "南方译场形成一套具有自身术语的摄论学文本，不能被唐译词汇覆盖。", "563", "567", "约563至567年", "梁陈摄论译学层"),
  milestone("yogacarabhumi-translation", "textual-evidence", "yogacarabhumi", "玄奘译出百卷《瑜伽师地论》", "大型瑜伽行论书在唐代译场完成，成为法相、戒学与修道论的重要资料。", "646", "648", "646至648年", "唐代慈恩译场层"),
  milestone("cheng-weishi-compilation", "textual-evidence", "cheng-weishi", "玄奘译场糅译十家释为《成唯识论》", "围绕《唯识三十论颂》的多家解释被编译为十卷总论，窥基等参与记录。", "659", "659", "659年", "唐代法相唯识编译层"),
  milestone("awakening-of-faith-recorded", "textual-evidence", "awakening-of-faith", "《大乘起信论》进入南北朝末汉地文献视野", "一心二门文本迅速影响心性论，同时留下作者、译者与成书地争议。", "550", "600", "约六世纪后半", "起信论形成与接受层"),
  milestone("lotus-dharmaraksa-translation", "textual-evidence", "lotus-dharmaraksa", "竺法护译出《正法华经》", "十卷本保留早于罗什本的完整汉译法华词汇和品次。", "286", "286", "286年", "西晋法华译经层"),
  milestone("lotus-kumarajiva-translation", "textual-evidence", "lotus-kumarajiva", "鸠摩罗什译出七卷《妙法莲华经》", "流畅译文和品次成为东亚法华讲诵最有影响的文本基础。", "406", "406", "约406年", "后秦法华译经层"),
  milestone("lotus-added-translation", "textual-evidence", "lotus-added", "阇那崛多、达摩笈多完成《添品法华经》", "七卷增补本调整品次并补足罗什本相较其他传本的若干段落。", "601", "601", "601年", "隋代法华重译层"),
  milestone("huayan-sixty-translation", "textual-evidence", "huayan-sixty", "佛陀跋陀罗译六十卷《华严经》", "东晋至刘宋之际的大型译经工程奠定汉地华严学早期文本。", "418", "420", "418至420年", "东晋华严译场层"),
  milestone("huayan-forty-translation", "textual-evidence", "huayan-forty", "般若译四十卷华严行愿品", "贞元年间的新译扩展善财参学和普贤行愿在东亚的流传形态。", "795", "798", "795至798年", "唐代贞元华严译场层"),
  milestone("vimalakirti-kumarajiva-translation", "textual-evidence", "vimalakirti-kumarajiva", "鸠摩罗什重译《维摩诘所说经》", "三卷译本与僧肇等注释共同进入士人、讲席和艺术传统。", "406", "406", "约406年", "后秦维摩译经层"),
  milestone("lanka-gunabhadra-translation", "textual-evidence", "lanka-gunabhadra", "求那跋陀罗译四卷《楞伽经》", "刘宋译本后来在禅宗传灯叙事中获得突出位置。", "443", "443", "443年", "刘宋楞伽译经层"),
  milestone("nirvana-northern-translation", "textual-evidence", "nirvana-northern", "昙无谶译出北本四十卷《大般涅槃经》", "北凉译本扩大佛性、常住和一阐提等议题的汉文规模。", "421", "421", "约421年完成", "北凉涅槃译经层"),
  milestone("surangama-catalogue-appearance", "textual-evidence", "great-surangama", "《大佛顶首楞严经》在唐代题署与目录中流传", "传统译出记载与后世广泛注疏并存，文本来源争议需要与信仰史同时展示。", "705", "730", "约705至730年", "唐代楞严文本出现层"),
  milestone("amitabha-kumarajiva-translation", "textual-evidence", "amitabha-kumarajiva", "罗什译本《阿弥陀经》进入汉地", "极乐国土、执持名号和诸佛证诚形成影响深远的小经文本。", "401", "413", "约401至413年", "后秦净土译经层"),
  milestone("ksitigarbha-ten-wheels-translation", "textual-evidence", "great-collection-ten-wheels", "玄奘译《大乘大集地藏十轮经》", "十卷唐译把地藏、十轮和末法僧俗教诫组织为完整经本。", "651", "651", "651年", "唐代地藏经译场层"),
  milestone("kaiyuan-catalogue-completed", "textual-evidence", "kaiyuan-catalogue", "智昇完成《开元释教录》", "目录系统整理历代译经、存佚、入藏与别生抄经，成为版本判断的重要坐标。", "730", "730", "730年", "唐代经录编纂层"),
  milestone("agama-classification", "religious-institutions", "fajing-catalogue", "隋唐经录逐步稳定阿含部类与藏经位置", "四阿含在目录和藏经中获得较清晰的部类入口，散译对应经仍另行著录。", "594", "800", "约594至800年", "隋唐藏经分类制度层"),
  milestone("four-part-vinaya-institution", "religious-institutions", "dharmaguptaka-sixty", "四分律学成为汉地受戒制度主干", "道宣等人的疏钞、戒坛和羯磨实践让四分律取得长期制度地位。", "600", "900", "约七至九世纪", "汉地律宗与受戒制度层"),
  milestone("bodhisattva-precepts-institution", "religious-institutions", "brahma-net-bodhisattva-precepts", "梵网菩萨戒进入汉地僧俗授戒", "十重四十八轻戒与其他菩萨戒系并行，形成多种传授和解释传统。", "500", "1900", "约六世纪以后", "东亚菩萨戒制度层"),
  milestone("sanlun-curriculum", "religious-institutions", "sanlun-profound-meaning", "三论讲席以破邪显正组织僧学课程", "摄山、嘉祥等讲学网络让三论核心论书与大乘经疏共同流通。", "500", "700", "约六至七世纪", "南北朝隋唐三论学层"),
  milestone("faxiang-curriculum", "religious-institutions", "cheng-weishi", "慈恩学系围绕唯识论书建立讲习次第", "玄奘译本、窥基述记和寺院讲席共同塑造唐代法相唯识学。", "650", "900", "约七至九世纪", "唐代法相宗学制度层"),
  milestone("tiantai-canon", "religious-institutions", "fahua-profound-meaning", "天台讲席把法华解释与止观修习合为教观", "智顗三大部及后世记疏形成经文、判教和修行互相校验的课程。", "575", "900", "约六至九世纪", "天台教观制度层"),
  milestone("huayan-canon", "religious-institutions", "huayan-five-teachings", "华严宗以大经、判教和法界观组织宗学", "法藏、澄观、宗密等人的著述让多译本华严进入稳定讲习传统。", "650", "900", "约七至九世纪", "唐代华严宗学制度层"),
  milestone("pureland-three-sutras", "religious-institutions", "contemplation-sutra", "净土三经与往生论逐渐形成共同阅读组合", "无量寿经、观经、阿弥陀经和愿生偈在注疏、念佛与法会中互相解释。", "500", "1200", "约六至十二世纪", "汉地净土教观形成层"),
  milestone("tang-esoteric-ritual", "religious-institutions", "vajrasekhara-abbreviated", "唐代密教译场把经轨、坛法与国家法会连接", "金刚智、不空等人的翻译和施法活动使金刚界、陀罗尼与护国实践制度化。", "720", "800", "约八世纪", "唐代密教制度层"),
  milestone("catalogue-canon-standards", "religious-institutions", "zhenyuan-catalogue", "开元、贞元经录推动写经与入藏标准化", "书名、卷数、纸数和入藏目录成为寺院复制与国家藏经管理的共同工具。", "730", "805", "约730至805年", "唐代藏经管理制度层"),
  milestone("lotus-ritual-reception", "cult-evolution", "lotus-samadhi-ritual", "法华三昧、忏法与讲经扩大经文的仪式生命", "经中譬喻、护法和忏悔实践被重新编入寺院日程与个人修持。", "550", "1900", "约六世纪以后", "东亚法华仪礼接受层"),
  milestone("surangama-ritual-reception", "cult-evolution", "great-surangama", "楞严咒与圆通章进入汉地日常课诵和讲席", "文本来源争议没有消除其长期宗教影响，两种事实在本库并列呈现。", "800", "2026", "约九世纪至今", "汉地楞严信仰接受层"),
  milestone("ksitigarbha-devotion-reception", "cult-evolution", "great-collection-ten-wheels", "地藏经典与冥界救济信仰在东亚扩展", "十轮经、地藏本愿叙事和地方仪式逐渐形成多层地藏信仰。", "650", "1900", "约七世纪以后", "东亚地藏信仰演变层"),
  milestone("medicine-buddha-ritual-reception", "cult-evolution", "medicine-dharmagupta", "药师经异译汇入燃灯、延寿与救病法会", "不同译本的愿文、十二神将和后世仪轨共同塑造汉地药师信仰。", "600", "1900", "约七世纪以后", "汉地药师信仰演变层"),
  milestone("catalogue-modern-research", "cult-evolution", "kaiyuan-catalogue", "近现代目录学重新检验译者题署、亡佚与疑伪经", "经录、敦煌写本和版本目录的对读，使传统题署可以在不抹去信仰史的前提下重新核查。", "1900", "2026", "二十世纪至今", "现代佛教目录与文本研究层")
];

function resolveRef(reference, worldId) {
  const separator = reference.indexOf(":");
  const scope = reference.slice(0, separator);
  const key = reference.slice(separator + 1);
  if (scope === "f") return canonEntityId(`family-${key}`, worldId);
  if (scope === "s") return canonSourceId(key, worldId);
  if (scope === "ps") return prajnaSourceId(key, worldId);
  throw new Error(`未知佛教经藏批次引用：${reference}`);
}

function buildRelation(row, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:buddhism-canon:${row.key}`,
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
    id: `timeline-event:${worldId}:mythology:buddhism-canon:${row.key}`,
    worldId,
    entityId: canonSourceId(row.sourceKey, worldId),
    questId: "",
    sceneId: "",
    references: [
      { kind: "entity", id: canonSourceId(row.sourceKey, worldId) },
      { kind: "entity", id: canonEntityId(`family-${source.familyKey}`, worldId) }
    ],
    trackId: trackId(row.trackKey, worldId),
    title: row.title,
    summary: row.summary,
    displayDate: row.displayDate,
    datePrecision: row.startValue === row.endValue ? "year" : "range",
    sortOrder: 700 + index * 2,
    startValue: row.startValue,
    endValue: row.endValue,
    era: row.era,
    dependencyIds: [],
    updatedAt: now
  };
}

function assertBatchShape() {
  const checks = [
    [familyRows.length, 14, "文献家族"],
    [sourceRows.length, 160, "经律论与注疏"],
    [eventRows.length, 45, "时间事件"]
  ];
  for (const [actual, expected, label] of checks) {
    if (actual !== expected) throw new Error(`${BATCH_LABEL}${label}数量应为 ${expected}，实际为 ${actual}`);
  }
}

function buildBuddhismCanonBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const systems = familyRows.map((row, index) => buildSystemEntity(row, index, worldId, now));
  const sources = sourceRows.map((row, index) => buildSourceEntity(row, systems.length + index, worldId, now));
  const relationRows = [
    ...membershipRelations,
    ...familySourceRelations,
    ...sequenceRelations,
    ...comparisonRelations,
    ...crossRelations
  ];
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...systems, ...sources],
    systems,
    sources,
    relations: relationRows.map((row) => buildRelation(row, worldId, now)),
    timelineEvents: eventRows.map((row, index) => buildTimelineEvent(row, worldId, now, index)),
    featuredEntityIds: [
      canonEntityId("family-agama", worldId),
      canonEntityId("family-vinaya", worldId),
      canonEntityId("family-yogacara", worldId),
      canonSourceId("lotus-kumarajiva", worldId),
      canonSourceId("huayan-eighty", worldId),
      canonSourceId("great-surangama", worldId),
      canonSourceId("amitabha-kumarajiva", worldId),
      prajnaSourceId("diamond-kumarajiva", worldId)
    ]
  };
}

module.exports = {
  BATCH_KEY,
  BATCH_LABEL,
  buildBuddhismCanonBatch,
  canonEntityId,
  canonSourceId,
  trackId,
  familyRows,
  sourceRows,
  eventRows,
  renderSystem,
  renderSource,
  WORLD_ID,
  categoryId
};
