const {
  WORLD_ID,
  categoryId
} = require("./chinese-mythology-history-data.cjs");
const {
  buddhismEntityId: transmissionEntityId,
  buddhismSourceId: transmissionSourceId
} = require("./chinese-mythology-buddhism-transmission-data.cjs");
const {
  devotionEntityId,
  devotionSourceId
} = require("./chinese-mythology-buddhism-devotion-data.cjs");

const BATCH_KEY = "buddhism-schools-patriarchs-09";
const BATCH_LABEL = "阶段 3 · 汉传宗派、祖师谱系与核心论疏第三批";

function schoolsEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:buddhism-schools:${key}`;
}

function schoolsSourceId(key, worldId = WORLD_ID) {
  return schoolsEntityId(`source-${key}`, worldId);
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
  const sourceItems = row.sourceList.map((source) => `<li>${escapeHtml(source)}</li>`).join("");
  return [
    `<p>${escapeHtml(row.lead)}</p>`,
    `<h2>${escapeHtml(row.profileHeading || "生平与工作")}</h2><p>${escapeHtml(row.profile)}</p>`,
    `<h2>${escapeHtml(row.receptionHeading || "后来的位置")}</h2><p>${escapeHtml(row.reception)}</p>`,
    `<h2>${escapeHtml(row.distinctionHeading || "辨读边界")}</h2><p>${escapeHtml(row.distinction)}</p>`,
    "<h2>原典坐标</h2>",
    `<p>${escapeHtml(row.sourceNote)}</p><ul>${sourceItems}</ul>`,
    "<h2>创作使用</h2>",
    `<p>${escapeHtml(row.boundary)}</p>`
  ].join("");
}

function person(row) {
  return {
    category: "buddhist-patriarchs",
    identityType: "祖师",
    tradition: "佛教",
    confidence: "主流说法",
    worship: "以祖师纪念、讲学谱系、寺院法脉与著述流传为主；历史人物、后世祖位和神圣传灯分别标注。",
    regionalVariants: "中国不同宗派及朝鲜半岛、日本、越南的祖统排序可能不同，不能用一地谱系覆盖全部东亚传统。",
    ...row
  };
}

const figureRows = [
  person({
    key: "huiwen",
    schoolKey: "tiantai-system",
    title: "慧文",
    aliases: "北齐慧文禅师、慧文大师",
    historicalLayer: "魏晋六朝",
    summary: "北齐禅师，慧思所从受法者；后世天台祖统借其一心三智观念追认早期源头。",
    earliestSource: "《续高僧传》卷十七慧思传中的简短追述",
    sourceLocation: "慧思传叙其投慧文受正法一段",
    domains: "禅观、三智一心、天台前史",
    iconography: "后世祖师像多作持经或禅坐僧形，缺少同期肖像依据。",
    lead: "慧文留下的不是一部可以逐页翻查的自传，而是慧思传里几句很有分量的话。门下数百、众法清肃，这个短促的背影后来被天台史家放到了宗门开端。",
    profile: "现存材料能较稳妥确认的是，慧思曾投慧文门下受法。后世把《中论》四句推检、一心三智和圆融观法归到慧文名下，但具体讲授次第主要靠较晚的宗派史补写，不能全部当作北齐课堂实录。",
    reception: "天台祖统常从印度龙树接到慧文，再传慧思、智顗。这个排列表达思想继承，也替宗派建立深远源头；它与有年表、书信和共同活动记录的师徒关系并不处在同一证据层。",
    distinction: "慧文不是《摩诃止观》的作者，也不应与北朝其他同名僧人合并。所谓天台初祖、二祖等序号会随祖统起点改变，页面只记录具体谱系中的称法。",
    sourceList: ["《续高僧传》卷十七慧思传", "天台宗后出祖统记述", "《中论》相关观法的宗派解释"],
    sourceNote: "人物生平以《续高僧传》的直接记载为底；思想归属和祖位使用后世天台史料，并明确标为追认层。",
    boundary: "适合写一位只在弟子记忆里留下轮廓的老师。若补写讲堂对白、悟入经过或著作手稿，须在独立故事页标明项目原创，不回填史料正文。",
    sourceRef: "bs:gaoseng-zhuan-group",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《续高僧传》卷十七慧思传"
  }),
  person({
    key: "huisi",
    schoolKey: "tiantai-system",
    title: "慧思",
    aliases: "南岳慧思、思大禅师",
    historicalLayer: "魏晋六朝",
    summary: "南北朝禅师，以法华行、禅观和定慧并修影响智顗，被天台传统尊为重要祖师。",
    earliestSource: "《续高僧传》卷十七《陈南岳衡山释慧思传》",
    sourceLocation: "卷十七习禅篇慧思本传",
    domains: "法华三昧、禅观、定慧双修、讲学",
    iconography: "南岳祖师像常作端坐说法相，形貌属于后世礼敬塑造。",
    lead: "慧思的生活有两种节奏：白日面对问法的人，夜里把刚讲过的义理重新放回坐禅中检验。他不把讲经和修定分成两门事业，这一点深深影响了后来到门下求法的智顗。",
    profile: "《续高僧传》记他早年诵《法华经》、长期习定，后来在南方聚众讲修。传中神梦、宿命和感通很多，仍可从迁居、弟子、讲学和著述线索里看见六世纪禅师的真实活动。",
    reception: "智顗之后的天台文献把慧思置于慧文与智顗之间，并从他的法华三昧、安乐行和定慧观法寻找宗门前史。南岳道场也因祖师记忆持续成为天台礼祖地点。",
    distinction: "慧思并非后来完整天台教判的共同作者。传记中的证悟位次、梦中受戒与预言属于僧传叙事，不能和可考行止写成同等确定的年表。",
    sourceList: ["《续高僧传》卷十七慧思传", "《法华经安乐行义》", "智顗著述中的师承回忆"],
    sourceNote: "生平优先采用道宣本传；存世著作与天台后出祖传只用于补充修法和接受史。",
    boundary: "可围绕日讲夜禅、南北佛教交流与师徒问答设计剧情；任何具体私语、旅途同伴和未载冲突都要加原创改编标识。",
    sourceRef: "bs:gaoseng-zhuan-group",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《续高僧传》卷十七《陈南岳衡山释慧思传》"
  }),
  person({
    key: "zhiyi",
    schoolKey: "tiantai-system",
    title: "智顗",
    aliases: "智者大师、天台智者、智者顗",
    historicalLayer: "魏晋六朝",
    summary: "陈隋之际佛教思想家，把法华解释、教判与止观实践组织成天台学的主体结构。",
    earliestSource: "灌顶《隋天台智者大师别传》及《续高僧传》卷十七",
    sourceLocation: "别传生平段；《摩诃止观》题记与十卷正文",
    domains: "止观、法华教判、讲经、僧团组织",
    iconography: "常作持如意或经卷的祖师相；须与历史形貌和后世尊像分开。",
    lead: "智顗并不只在天台山静坐。他往返金陵、荆州和天台，在政权更替、王室延请与山林修行之间安排讲席；那套后来显得严整的天台体系，正是在这种不断移动的生活里长成。",
    profile: "智顗师从慧思，讲说《法华玄义》《法华文句》和《摩诃止观》，多由灌顶记录整理。陈隋两朝的往来和晋王杨广授予“智者”号有史传依据，具体神异则需要按别传修辞另读。",
    reception: "后世天台以他为实际奠基者，国清寺、玉泉寺和众多讲院围绕其行迹建立记忆。日本天台与东亚法华传统又重新选择他的教判、止观和戒法，各自强调的部分并不相同。",
    distinction: "智顗不是所有署名“天台大师”的注疏都可无疑归属的作者。关羽在玉泉受戒护寺的完整故事见于宋代以后，不能倒写成智顗同期实录。",
    sourceList: ["《隋天台智者大师别传》", "《续高僧传》卷十七智顗传", "《摩诃止观》灌顶记录本"],
    sourceNote: "用别传与僧传交叉建立行年，用《摩诃止观》观察讲说内容；后世寺志和祖传只放在接受史。",
    boundary: "适合表现一位在讲席、山居与政治邀请之间作选择的宗师；若书写内心独白或与杨广、关羽的戏剧对白，应标明具体史料层或原创改编。",
    sourceRef: "b3s:maha-zhiguan",
    sourceEvidenceType: "primary-text",
    sourceCitation: "《摩诃止观》题记及十卷讲说记录"
  }),
  person({
    key: "guanding",
    schoolKey: "tiantai-system",
    title: "灌顶",
    aliases: "章安灌顶、章安大师",
    historicalLayer: "隋唐",
    summary: "智顗弟子与记录整理者，保存天台三大部并重建宗门讲学秩序。",
    earliestSource: "《续高僧传》及其整理的智顗讲说题记",
    sourceLocation: "《摩诃止观》卷首题记；天台祖传灌顶事迹",
    domains: "笔录、校订、讲学、天台传承",
    iconography: "后世多以持卷侍师或独坐讲经表现，属于祖统图像。",
    lead: "一场讲说能不能活过听众散去，往往取决于坐在下首记笔记的人。灌顶把智顗的口说、反复说明和未竟段落整理成书，也因此决定后人实际读到怎样的天台。",
    profile: "灌顶长期随侍智顗，记录并整理《法华玄义》《法华文句》《摩诃止观》等讲说。智顗去世后，他继续讲学、修订文稿并维系天台山门，身份既是弟子，也是编辑者和制度承接者。",
    reception: "天台传统尊灌顶为祖师，强调他使口传成为可反复讲习的文本。现代阅读更需要留意“智顗说、灌顶记”这一双重署名，它并非机械抄写，而包含整理过程。",
    distinction: "灌顶不是智顗著作旁可省略的书记，也不能反过来把全部文字都判为个人创作。不同版本的增删、治定年代与后人注疏应逐层辨认。",
    sourceList: ["《摩诃止观》卷首题记", "《法华玄义》题记", "天台祖传与僧传灌顶材料"],
    sourceNote: "以现存论疏题记确认记录者身份，再用祖传说明其讲学与续统，不把后世赞辞当同期履历。",
    boundary: "可写口授、笔录和校书之间的具体劳动；未见于题记的删改争执、密藏手稿或师徒遗命，都应明确标原创。",
    sourceRef: "b3s:maha-zhiguan",
    sourceEvidenceType: "primary-text",
    sourceCitation: "《摩诃止观》卷首“隋天台智者大师说、门人灌顶记”"
  }),
  person({
    key: "zhanran",
    schoolKey: "tiantai-system",
    title: "湛然",
    aliases: "荆溪湛然、妙乐大师",
    historicalLayer: "隋唐",
    summary: "唐代天台学者，以注释和论辩重整智顗著述，使天台在多宗并立中重新取得声音。",
    earliestSource: "《宋高僧传》湛然传及其《法华玄义释签》等著述",
    sourceLocation: "僧传本传；《法华玄义释签》卷首与正文",
    domains: "天台注疏、法华解释、宗派论辩",
    iconography: "祖师像常持疏钞，具体容貌无同期可核底本。",
    lead: "湛然面对的天台已经不是创宗时的空地。华严、法相和禅门都在唐代拥有自己的语言，他于是回到智顗旧文，一句一句加注，让沉下去的术语重新参与争论。",
    profile: "湛然活动于八世纪，长期研习天台典籍，撰《法华玄义释签》《止观辅行传弘决》等。其工作既解释艰深语句，也替天台回应当时的佛性、教判和修观问题。",
    reception: "后世称其“中兴天台”，并把他的注释视作阅读三大部的重要入口。这个称号说明实际影响，不表示唐代存在一场由单人完成、日期明确的官方复兴。",
    distinction: "湛然的“无情有性”等论述要放在具体文本和论敌中理解，不能缩成一句万物皆神。注释中的前代材料与他自己的判断也需要分开。",
    sourceList: ["《宋高僧传》湛然传", "《法华玄义释签》", "《止观辅行传弘决》"],
    sourceNote: "人物行迹以宋代僧传和著述题记互证；“中兴”按后世宗派评价使用。",
    boundary: "适合写旧宗门如何靠注释而不是奇迹重获生命；如设计与华严、禅僧当面对辩，需标明是否有书信或碑传依据。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《宋高僧传》湛然传及存世注疏题记"
  }),

  person({
    key: "dushun",
    schoolKey: "huayan-system",
    title: "杜顺",
    aliases: "法顺、帝心尊者、杜顺和尚",
    historicalLayer: "隋唐",
    summary: "隋唐之际僧人，后世华严五祖谱列为初祖；历史行迹与法界观著作归属需分层。",
    earliestSource: "《续高僧传》法顺传及后出华严祖传",
    sourceLocation: "僧传感通材料；《华严法界观门》题署传统",
    domains: "华严观法、民间教化、祖统",
    iconography: "常作朴素老僧或帝王礼敬的祖师形象，受感通传影响明显。",
    lead: "杜顺在僧传里更像一位走入村落、替人解困的奇僧，在后来的华严史里却成了法界观的开端。两幅面孔并非只能择一，它们来自不同年代的人在回答不同问题。",
    profile: "早期传记记其俗姓杜、法名法顺，活动于关中并以感通教化闻名。后世华严祖统把《华严法界观门》等系于其名下，著作形成和传抄过程仍需保留讨论。",
    reception: "华严传统尊杜顺为初祖，常把智俨、法藏的学说追接到他。民间还流传文殊化身、帝心尊者等称号，属于礼敬与神圣化层，不是可核的历史身份。",
    distinction: "杜顺不等同文殊菩萨，也不能仅凭题署认定每篇法界观文都由他亲笔定稿。法顺与同名僧人须用地点、弟子和卷篇辨别。",
    sourceList: ["《续高僧传》法顺传", "《华严法界观门》传本", "唐宋华严祖统记述"],
    sourceNote: "早期生平和后出祖统分别建层；化身说只作为信仰接受史。",
    boundary: "可写一位乡野僧人如何被后世宗门重新看见；文殊显身、宫廷问答和治病细节若扩写，必须注明采用传记或原创改编。",
    sourceRef: "bs:gaoseng-zhuan-group",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《续高僧传》法顺传"
  }),
  person({
    key: "zhiyan",
    schoolKey: "huayan-system",
    title: "智俨",
    aliases: "云华智俨、至相尊者",
    historicalLayer: "隋唐",
    summary: "唐初华严学者，在终南山讲习经论，承接杜顺传统并培养法藏。",
    earliestSource: "华严祖传、僧传附见及存世《搜玄记》等",
    sourceLocation: "《华严经搜玄记》题署；至相寺传承材料",
    domains: "华严经疏、十玄门、讲学",
    iconography: "多作持经讲学僧相，至相寺与云华寺名号常进入题记。",
    lead: "智俨工作的地方不在宫廷中心，而在终南山寺院的经卷之间。他把庞大的《华严经》拆成可以讲、可以问、也可以继续推演的结构，法藏后来正从这些结构向外扩展。",
    profile: "智俨研习《华严经》，著《搜玄记》《孔目章》等，形成十玄、六相等解释工具。其与杜顺的承接兼有宗派追认成分，与法藏的教学关系则有较清楚的著述和传记线索。",
    reception: "后世华严五祖谱将智俨列为二祖，尊称至相尊者。日本与朝鲜半岛华严学也保存其著作，使他不只作为法藏的老师而存在。",
    distinction: "智俨不是《华严经》的译者，十玄门的不同文本也不能无差别归为一份定稿。云华、至相是寺院和尊称线索，不是另两位人物。",
    sourceList: ["《华严经搜玄记》", "《华严经内章门等杂孔目章》", "华严祖统传记"],
    sourceNote: "先以著述题署确认学术活动，再用祖传梳理师承；早期传记缺口不以传说填平。",
    boundary: "适合表现山寺里缓慢形成的概念工具；若安排杜顺正式授法仪式或法藏少年问答，应注明祖传层或原创。",
    sourceRef: "bs:gaoseng-zhuan-group",
    sourceEvidenceType: "historical-record",
    sourceCitation: "华严祖传所引僧传材料及智俨著述题署"
  }),
  person({
    key: "fazang",
    schoolKey: "huayan-system",
    title: "法藏",
    aliases: "贤首法藏、香象大师、康藏法师",
    historicalLayer: "隋唐",
    summary: "武周至唐初华严学者与译场参与者，以《探玄记》等系统展开华严教判和法界缘起。",
    earliestSource: "《华严经探玄记》及法藏传记、诏令材料",
    sourceLocation: "《探玄记》二十卷题署与序；荐福寺相关传记",
    domains: "华严教判、法界缘起、讲经、译场协助",
    iconography: "后世常以讲经、金狮子或香象象征其学说，金狮子说法场景有后出叙述层。",
    lead: "法藏擅长把抽象关系变成眼前可以转动的东西。无论金狮子故事后来增饰了多少，它准确抓住他的讲学方法：从一件具体事物出发，让部分、整体和缘起同时显现。",
    profile: "法藏出身康居后裔家庭，师事智俨，参与八十卷《华严经》译场并广泛撰疏。《探玄记》依据六十卷本展开五教、十玄与法界解释，是观察其成熟思想的核心文献。",
    reception: "华严宗常尊其为三祖或实际集大成者，贤首宗之名亦由其号而来。武后问法、宫廷讲经和译场活动扩大了影响，但后世把一切华严命题都归给法藏，会遮住前后学者。",
    distinction: "法藏不是经中法藏菩萨，也不是阿弥陀佛因地人物；两者同名而传统、时代完全不同。《探玄记》解释六十卷华严，不能直接代替八十卷经文。",
    sourceList: ["《华严经探玄记》", "《华严经金师子章》传本", "《宋高僧传》及法藏碑传材料"],
    sourceNote: "以法藏自署著述为思想主轴，生平用传记和诏令补充；同名身份单独消歧。",
    boundary: "可以用讲物明理构造有现场感的课堂，但武后手中金狮子的材质、听众对白和即时反应若无原文，都应标原创。",
    sourceRef: "b3s:huayan-tanxuan",
    sourceEvidenceType: "primary-text",
    sourceCitation: "法藏《华严经探玄记》二十卷"
  }),
  person({
    key: "chengguan",
    schoolKey: "huayan-system",
    title: "澄观",
    aliases: "清凉澄观、清凉国师、华严菩萨",
    historicalLayer: "隋唐",
    summary: "中晚唐华严学者，为八十卷《华严经》撰大疏，长期活动于五台山与长安讲席。",
    earliestSource: "《宋高僧传》澄观传及《大方广佛华严经疏》",
    sourceLocation: "僧传义解篇；华严经疏卷首",
    domains: "华严经疏、五台讲学、教判会通",
    iconography: "清凉国师像常配高背椅、经卷或文殊道场背景，属后世祖师图式。",
    lead: "澄观一生面对的是另一部《华严经》：实叉难陀新译八十卷本已经流行，旧疏不能原封不动套用。他在五台与长安之间重做注释，也把禅、天台等当时语言带进华严解释。",
    profile: "澄观遍学多家，经五台山讲习后撰成《华严经疏》与随疏演义钞。传记称其受多朝礼遇，具体国师称号和神异赞语仍应与著述可证部分分开。",
    reception: "华严祖统列澄观为四祖，尊称清凉国师。其疏钞成为八十卷华严的重要阅读框架，并影响宋代以后讲经，却不意味着所有寺院采用同一教判。",
    distinction: "澄观不是《古清凉传》的作者，也不等同文殊化身。其会通诸宗是注释策略，不能解释成各宗差异已经消失。",
    sourceList: ["《宋高僧传》澄观传", "《大方广佛华严经疏》", "《华严经随疏演义钞》"],
    sourceNote: "著述与传记交叉使用，国师、菩萨等尊称按出现年代标注。",
    boundary: "适合写一位注释家在新译本前重新开工的压力；若安排与诸宗代表面对面合判，须找到具体传记或标原创。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《宋高僧传》澄观传"
  }),
  person({
    key: "zongmi",
    schoolKey: "huayan-system",
    title: "宗密",
    aliases: "圭峰宗密、定慧禅师",
    historicalLayer: "隋唐",
    summary: "唐代华严学者兼禅门观察者，试图用教禅一致框架整理当时多支禅法。",
    earliestSource: "《宋高僧传》宗密传及其《禅源诸诠集都序》",
    sourceLocation: "僧传本传；都序卷上卷下",
    domains: "华严、禅教会通、宗派分类、注疏",
    iconography: "圭峰祖师像多作披衣持卷，缺少同期写实依据。",
    lead: "宗密既站在华严讲席里，也认真听禅门内部怎样谈顿悟、修心和师承。他没有把所有说法揉成一句，而是先分类，再判断哪些差异只是用语，哪些会改变修行方向。",
    profile: "宗密从澄观学华严，又承荷泽禅系，撰《禅源诸诠集都序》《原人论》等。他对禅门分派的记录极重要，同时带有自己的教判立场，不能当无色透明的调查报告。",
    reception: "后世华严列其为五祖，禅史也常借都序认识唐代流派。宋以后教禅一致成为常见理想，宗密被不断引用，但具体宗派归属仍因传统而异。",
    distinction: "宗密不是所有禅宗共同认可的总裁判者，也不能把其分类直接回填到六祖以前。圭峰是居处和尊称线索，不是另一位祖师。",
    sourceList: ["《宋高僧传》宗密传", "《禅源诸诠集都序》", "《原人论》"],
    sourceNote: "以宗密自著观察思想，以僧传补行迹；其对他宗的描述同时记录事实与评价。",
    boundary: "可围绕他整理互相冲突的禅门说法展开调查式剧情；虚构访谈、完整会议或失传《禅源诸诠集》内容须标原创。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《宋高僧传》宗密传及《禅源诸诠集都序》"
  }),

  person({
    key: "kuiji",
    schoolKey: "faxiang-system",
    title: "窥基",
    aliases: "大乘基、慈恩基、慈恩大师",
    historicalLayer: "隋唐",
    summary: "玄奘弟子与慈恩寺学者，以大量疏记解释新译唯识、因明和瑜伽文献。",
    earliestSource: "《宋高僧传》卷四窥基传及《成唯识论述记》",
    sourceLocation: "卷四译经义解传；述记十卷",
    domains: "唯识、因明、经论注疏、译场传承",
    iconography: "“三车和尚”图像取自后世轶事，不宜作为历史默认形象。",
    lead: "窥基最容易被一个热闹的“三车和尚”故事盖住。真正留下重量的，是一批密集到几乎没有空隙的疏记：他把玄奘新译的术语、论证和不同解释拆开，给后来学者一条可以追索的路。",
    profile: "窥基出身尉迟氏家族，入大慈恩寺从玄奘学梵文、唯识与因明，并参与译经。其《成唯识论述记》等形成慈恩学系基础；僧传中的强度出家、三车与神异故事需分别判断。",
    reception: "后世法相、唯识学尊其为重要祖师，常以“百本疏主”概括著述。日本法相宗尤其保存其解释传统，但圆测等同时代学者另有路线，不能写成一人独占玄奘之学。",
    distinction: "窥基与玄奘是历史师徒，不等于《成唯识论》由两人共同随意创作。大乘基、慈恩基是同一人物称法；灵基等异写要逐条校勘。",
    sourceList: ["《宋高僧传》卷四窥基传", "《成唯识论述记》", "大慈恩寺译场题记"],
    sourceNote: "著述归属与译场活动优先，传奇轶事作为宋代僧传接受层展示。",
    boundary: "适合写高强度注疏劳动和同门学术竞争；三车细节若入剧情，应注明来自后传且已有传作者质疑。",
    sourceRef: "b3s:weishi-shuji",
    sourceEvidenceType: "primary-text",
    sourceCitation: "窥基《成唯识论述记》十卷"
  }),
  person({
    key: "woncheuk",
    schoolKey: "faxiang-system",
    title: "圆测（西明法师）",
    aliases: "西明圆测、新罗圆测、文雅法师",
    historicalLayer: "隋唐",
    summary: "新罗出身的唐代唯识学者，在长安研经著疏，与慈恩系形成既共享译本又有差异的解释路线。",
    earliestSource: "《宋高僧传》圆测传及《解深密经疏》",
    sourceLocation: "僧传义解篇；《解深密经疏》传本",
    domains: "唯识、解深密经、跨地域佛教学术",
    iconography: "后世以西明寺学僧相纪念，未见可核同期肖像。",
    lead: "圆测来到长安之后，并没有因为身在玄奘时代就只剩旁听者的位置。他写下自己的《解深密经疏》，在同一批新译术语上作出不同取舍，也让长安佛学沿海路继续传回新罗。",
    profile: "圆测来自新罗，长期居西明寺，通晓多种经论并参与唐代唯识讨论。后世僧传把他与窥基并置，夹杂“盗听”一类竞争故事；著述差异比戏剧化品评更能说明两条学系。",
    reception: "其疏在中国部分散佚，却经朝鲜半岛和日本传承保存重要内容。东亚唯识史因此不是从玄奘到窥基的一条单线，而是多语际、多寺院共同展开。",
    distinction: "圆测不是窥基的化名，也不能仅以“西明系”假定一个组织严密的现代学派。是否直接受玄奘个别讲授，要按具体传记和题记陈述。",
    sourceList: ["《宋高僧传》圆测传", "《解深密经疏》", "唐代唯识论疏互证"],
    sourceNote: "以存世疏文和僧传建立人物轮廓；竞争轶事只作接受史，不据以贬定学术。",
    boundary: "适合写同城学者如何在共享译本上分岔；偷听、密授和私下冲突若没有直接材料，不可装成确定史实。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《宋高僧传》圆测传及《解深密经疏》"
  }),
  person({
    key: "huizhao",
    schoolKey: "faxiang-system",
    title: "慧沼",
    aliases: "淄州慧沼、淄州大师",
    historicalLayer: "隋唐",
    summary: "唐代慈恩学系学者，承接窥基唯识解释并通过论疏回应异说。",
    earliestSource: "《宋高僧传》慧沼传及《成唯识论了义灯》",
    sourceLocation: "僧传义解篇；《了义灯》卷首",
    domains: "唯识注疏、因明、宗义辨析",
    iconography: "淄州大师祖像多为后世讲席纪念形态。",
    lead: "慧沼接过的不是一套无人争论的答案。玄奘新译不过数十年，各家已经围绕种性、识变和经论会通提出不同解释；他的写作因此常带着逐条辨义的锋面。",
    profile: "慧沼学习慈恩系唯识，著《成唯识论了义灯》等，对窥基解释作续申，也批评圆测诸说。文本能确认论争主题，僧传提供行迹，但不能把所有反对意见简化成人身冲突。",
    reception: "后世法相宗把慧沼列入重要传承，日本唯识学大量引用《了义灯》。其地位说明宗派并非只靠创宗祖师，也靠第二、三代把术语磨清。",
    distinction: "慧沼不是唐代所有唯识学者的裁判者；淄州是称号线索，不是籍贯与居处所有阶段的唯一答案。论疏中的“西明”批评要按段落对应具体观点。",
    sourceList: ["《宋高僧传》慧沼传", "《成唯识论了义灯》", "窥基《成唯识论述记》"],
    sourceNote: "传记、题署和论疏互证；宗派后设序号不反写入人物自称。",
    boundary: "可围绕一场具体义理争论写学术剧情；若将圆测、窥基、慧沼安排同席辩论，须标为合成场景。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《宋高僧传》慧沼传及《成唯识论了义灯》"
  }),

  person({
    key: "lushan-huiyuan",
    schoolKey: "pure-land-system",
    title: "庐山慧远",
    aliases: "东林慧远、庐山远公",
    historicalLayer: "魏晋六朝",
    summary: "东晋高僧，在庐山东林寺组织念佛誓愿与僧俗交游，后世追尊为净土祖师。",
    earliestSource: "《高僧传》卷六慧远传及庐山文集",
    sourceLocation: "卷六义解篇；《庐山出修行方便禅经统序》等",
    domains: "东林讲学、念佛三昧、僧俗交往、译经通信",
    iconography: "虎溪三笑、白莲社十八贤多属后世组合图，不是同期群像记录。",
    lead: "慧远在庐山经营的不是一个只念佛号的封闭社团。译经书信、戒律问题、士人往来和山中修行同时发生，后人用“白莲社”三个字收拢了它，也因此抹平了不少复杂处。",
    profile: "慧远早年从道安，后居庐山东林寺。传记与文集显示他关注念佛三昧、神不灭论、沙门礼制及经论翻译；与刘遗民等在无量寿佛前立誓有材料依据，固定十八贤名单较晚。",
    reception: "宋以后净土祖统常以慧远为初祖，东林寺成为重要记忆地点。白莲社、虎溪三笑与陶渊明谢灵运故事不断扩写，应与东晋文书层分开。",
    distinction: "庐山慧远须与隋代净影慧远等同名僧分开。他的念佛实践不应直接等同善导以后称名体系，也不能把后世莲宗组织倒推为东晋定制。",
    sourceList: ["《高僧传》卷六慧远传", "刘遗民《庐山出修行方便禅经统序》及誓文材料", "慧远与鸠摩罗什问答"],
    sourceNote: "以梁代僧传、东晋文书和通信为主，白莲社名单及虎溪故事另列后世层。",
    boundary: "适合写山中共同体和远程书信网络；十八贤齐聚、陶渊明破戒入社或虎溪大笑若无对应早期材料，须注明后传或原创。",
    sourceRef: "bs:gaoseng-zhuan-group",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《高僧传》卷六庐山慧远传"
  }),
  person({
    key: "tanluan",
    schoolKey: "pure-land-system",
    title: "昙鸾",
    aliases: "神鸾、玄简大士、昙峦",
    historicalLayer: "魏晋六朝",
    summary: "北魏净土思想家，以《往生论注》阐明愿力、易行与往生，被后世多种净土祖统追尊。",
    earliestSource: "《续高僧传》卷六昙鸾传及《往生论注》",
    sourceLocation: "卷六义解篇；《无量寿经优婆提舍愿生偈注》",
    domains: "净土论释、愿力、念佛、北方佛教",
    iconography: "烧仙经、遇菩提流支的画面来自僧传叙事，常被后世祖传强化。",
    lead: "昙鸾传里最有戏剧性的动作，是把刚得到的仙经烧掉。这个故事让净土与长生术在一瞬间分出方向；真正持续影响后世的，却是他在《往生论注》中反复推敲愿力怎样进入凡夫修行。",
    profile: "昙鸾活动于北魏，曾研经并撰《往生论注》。僧传记其南访陶弘景、返程遇菩提流支而转修净土，路线和对话带有传记组织，著述则清楚呈现难易二道、他力与往生解释。",
    reception: "中国、日本净土传统以不同祖序尊昙鸾，他与道绰、善导常被连成思想谱系。所谓“神鸾”及灵验故事属于尊崇层，不替代其文本工作。",
    distinction: "昙鸾不是道教仙人转世，也不是所有他力说法的唯一源头。菩提流支授经故事不能证明现存《观经》由该次会面传入。",
    sourceList: ["《续高僧传》卷六昙鸾传", "《往生论注》", "《赞阿弥陀佛偈》"],
    sourceNote: "思想以存世著作为准，烧仙经和会面采用僧传叙事口径并保留文学性。",
    boundary: "可写求长生者转向净土的思想震动；具体旅程天气、经卷焚烧现场和两人长谈若扩写，必须标原创。",
    sourceRef: "bs:gaoseng-zhuan-group",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《续高僧传》卷六昙鸾传"
  }),
  person({
    key: "daochuo",
    schoolKey: "pure-land-system",
    title: "道绰",
    aliases: "西河道绰、禅师道绰",
    historicalLayer: "隋唐",
    summary: "隋唐之际净土僧人，在玄中寺继承昙鸾记忆，以圣净二门和《安乐集》推广念佛。",
    earliestSource: "《续高僧传》道绰传及《安乐集》",
    sourceLocation: "僧传习禅篇；《安乐集》上下卷",
    domains: "净土教判、称名念佛、玄中寺讲化",
    iconography: "念珠计数与豆粒记数常见于后传图像，需注明文本层。",
    lead: "道绰来到玄中寺时，昙鸾已经成为墙壁、碑文与地方记忆的一部分。他没有只守着旧迹，而是把散在经论中的净土论说重新分类，让听众知道为何在自己的时代选择这条路。",
    profile: "道绰早年研习《涅槃经》，后转入净土，撰《安乐集》，以圣道门、净土门等框架论证念佛实践。传记所载豆粒计数和广劝称名可见其教化形象，细节需按版本核对。",
    reception: "善导被视为道绰弟子，后世净土史由此把昙鸾、道绰、善导连成北方到长安的线索。不同宗派的祖师序号不一，思想继承比固定名次更可靠。",
    distinction: "道绰不是《安乐集》中所有引文的原作者，引用经论须返回原典。所谓末法判断是宗教时间观，不可直接换算为科学年代结论。",
    sourceList: ["《续高僧传》道绰传", "《安乐集》", "玄中寺昙鸾纪念材料"],
    sourceNote: "人物活动与著述互证；计数念佛、末法判断分别标明传记和教义语境。",
    boundary: "可写旧寺碑刻怎样改变一位讲经僧的方向；若补写他与昙鸾跨世相见或神授法门，只能作为明确原创。",
    sourceRef: "bs:gaoseng-zhuan-group",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《续高僧传》道绰传"
  }),
  person({
    key: "shandao",
    schoolKey: "pure-land-system",
    title: "善导",
    aliases: "光明和尚、终南大师",
    historicalLayer: "隋唐",
    summary: "唐代净土僧人，以《观经疏》重释定散二善并在长安推广称名与礼赞实践。",
    earliestSource: "善导《观无量寿佛经疏》及唐宋僧传",
    sourceLocation: "《观经玄义分》至《散善义》四卷；僧传本传",
    domains: "净土教义、称名念佛、礼赞、造像写经",
    iconography: "口出光明、写经放光等图像来自尊称和感应传，非同期肖像。",
    lead: "善导的文字并不飘在净土图景上方。他不断追问普通人怎样进入经文：坐观做不到怎么办，散乱生活里怎样回向，称名到底只是方便还是正行。答案由此落到了每天能做的功课上。",
    profile: "善导从道绰学净土，后在长安弘化，著《观经疏》《往生礼赞》等。《观经疏》区分定善、散善，强调阿弥陀愿与凡夫往生，是其思想最可直接核读的依据。",
    reception: "中日净土诸宗都深受善导影响，却以不同祖序和教义重点继承他。光明和尚称号、写经造像和临终感应丰富了祖师形象，需与著作内容并列而不混合。",
    distinction: "善导不等同另一位同名僧，也不能把后世一句“万修万人去”无条件当作其原文。净土实践中的观想、称名、礼赞与回向各有文本位置。",
    sourceList: ["《观无量寿佛经疏》", "《往生礼赞偈》", "唐宋僧传善导材料"],
    sourceNote: "以善导自著四帖疏为核心，祖传和感应故事另标接受层。",
    boundary: "适合写长安城市里可重复实践的日课如何形成；放光、见佛与临终去向若叙事化，须准确注明传记或原创。",
    sourceRef: "b3s:guanjing-shu",
    sourceEvidenceType: "primary-text",
    sourceCitation: "善导《观无量寿佛经疏》四卷"
  }),
  person({
    key: "chengyuan",
    schoolKey: "pure-land-system",
    title: "承远",
    aliases: "南岳承远、弥陀和尚",
    historicalLayer: "隋唐",
    summary: "唐代南岳净土僧人，以山中念佛道场和教化影响法照，后列入净土祖统。",
    earliestSource: "《宋高僧传》承远传及后世南岳碑传",
    sourceLocation: "僧传习禅或兴福相关本传；南岳弥陀寺记忆",
    domains: "山林念佛、般舟修行、净土师承",
    iconography: "多作朴衣苦行僧，弥陀和尚称号是后世纪念。",
    lead: "承远的道场没有长安讲席的排场。山路、茅庵和来去不定的求法者构成日常，法照后来正是在这种安静而有纪律的生活里找到自己的念佛方向。",
    profile: "承远活动于南岳，传记强调其苦行、念佛和教化，法照曾前往参学。可考材料晚于本人且夹杂感应，仍能看见中唐净土实践由北方讲学向南岳山林扩展。",
    reception: "后世净土祖统尊承远为祖师，南岳道场也围绕其记忆发展。祖位通常由较晚谱系追定，不代表承远生前建立了名为某宗的中央组织。",
    distinction: "承远不应与同时代同名僧合并，也不能把法照全部五会念佛制度都归为他的亲授。师承关系可靠，具体仪轨传递需分别找证。",
    sourceList: ["《宋高僧传》承远传", "南岳弥陀寺相关碑传", "法照传中的参学回忆"],
    sourceNote: "以宋代僧传互见为底，寺志与祖谱用于观察后世纪念。",
    boundary: "适合写山中师徒短暂相遇留下的长期影响；若铺陈传法仪式、密语或固定日课文本，应标原创或注明后出谱系。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《宋高僧传》承远传"
  }),
  person({
    key: "fazhao",
    schoolKey: "pure-land-system",
    title: "法照",
    aliases: "五会法师、五会念佛法照",
    historicalLayer: "隋唐",
    summary: "中唐净土僧人，以五会念佛和五台感应叙事把称名实践带入更广阔的公共仪礼。",
    earliestSource: "《宋高僧传》法照传及其五会念佛赞文",
    sourceLocation: "僧传本传；五会念佛相关赞仪传本",
    domains: "五会念佛、声乐仪礼、五台朝礼",
    iconography: "常与五台竹林寺感应、文殊授法场景相连，属于传记神圣层。",
    lead: "法照让念佛拥有了人群的声音。节奏由缓到急，唱赞与称名彼此接续，个人功课因此变成可以在法会中共同完成的五会念佛。",
    profile: "法照曾参承远，后在五台等地活动并推广五会念佛。僧传记有入竹林寺见文殊、得授法门等感应故事；可考仪礼则应从赞文、目录和后世沿用痕迹重建。",
    reception: "唐代宫廷与寺院对五会念佛的接纳扩大其影响，后世净土祖统亦列法照。具体旋律大多无法由文字完整复原，不应以现代曲调冒充唐音。",
    distinction: "法照不是善导的直接弟子，思想承接与谱系名次须经过承远等中间层。五台竹林寺神圣显现与历史寺址也要分图层。",
    sourceList: ["《宋高僧传》法照传", "五会念佛赞文传本", "五台山佛教史料"],
    sourceNote: "人物行迹、赞仪文字和感应叙事分别记证；旋律缺失不作伪复原。",
    boundary: "可用合唱节奏设计有声音感的场景；若提供具体唐代旋律、乐器编制或文殊对白，必须注明重建或原创。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《宋高僧传》法照传"
  }),
  person({
    key: "bodhidharma",
    schoolKey: "chan-system",
    title: "菩提达摩",
    aliases: "达摩、达磨、菩提达磨",
    historicalLayer: "魏晋六朝",
    summary: "南北朝来华禅师，早期传记以壁观与二入四行相联系，后世追尊为汉地禅宗初祖。",
    earliestSource: "昙林序《菩提达摩四行论》及《续高僧传》卷十六",
    sourceLocation: "《续高僧传》菩提达摩传；二入四行长卷序文",
    domains: "壁观、二入四行、楞伽传统、禅宗祖统",
    iconography: "浓须、环眼、芦苇渡江和只履西归是后世高度定型的图像语汇。",
    lead: "最早材料里的达摩并没有一连串机锋公案。他教人从“理入”和“行入”下手，传记只留下游化嵩洛、壁观和少数弟子的轮廓；越到后来，江河、皇帝和一只鞋才陆续走进故事。",
    profile: "《续高僧传》称达摩为南天竺僧，入魏游化，以大乘壁观教人，并记慧可从学。二入四行文本较接近早期思想，梁武帝问答、少林面壁九年和只履西归见于后出叙事。",
    reception: "唐宋禅宗祖统把达摩定为西天第二十八祖、东土初祖，少林寺成为重要纪念地点。化身、武术祖师和茶叶起源等说法属于不同接受层，不能并回僧传。",
    distinction: "菩提达摩不是译经目录中的菩提流支，也不应与佛陀跋陀罗等音近人物合并。付法世系表达禅门合法性，不等于二十八代都有连续同期档案。",
    sourceList: ["《续高僧传》卷十六菩提达摩传", "昙林序《菩提达摩四行论》", "唐宋禅宗灯录"],
    sourceNote: "以六七世纪材料为历史底层，梁武帝问答、芦苇渡江与只履故事按后出灯录标注。",
    boundary: "可写一位言语不多的外来禅师与北方弟子磨合；渡江方式、少林九年每日细节和西归结局若扩写，须标后传或原创。",
    sourceRef: "bs:gaoseng-zhuan-group",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《续高僧传》卷十六菩提达摩传"
  }),
  person({
    key: "huike",
    schoolKey: "chan-system",
    title: "慧可",
    aliases: "僧可、神光、禅宗二祖",
    historicalLayer: "魏晋六朝",
    summary: "北朝禅僧，早期传记明确记其从菩提达摩受学；断臂求法与传衣细节在后世不断扩写。",
    earliestSource: "《续高僧传》卷十六僧可传",
    sourceLocation: "卷十六习禅篇《齐邺中释僧可传》",
    domains: "大乘禅观、楞伽教学、早期达摩门下",
    iconography: "断臂立雪成为最鲜明图像，但早期传记对失臂原因与后世公案不同。",
    lead: "慧可的断臂后来被写成雪夜求法的一刀，早期僧传却没有这样完整的舞台。它记得他在乱世中失臂，也记得他遇达摩后愿意把余生放进一种艰难、少有外饰的修法。",
    profile: "慧可本名僧可，研习经论，四十岁左右遇菩提达摩并奉师。道宣记其传大乘禅法、遭谤与流离，后世灯录才把立雪、安心问答、传衣等编成连贯祖师公案。",
    reception: "禅宗尊慧可为二祖，断臂图成为决心求法的象征。象征力量很强，却不应反过来抹去僧传中北朝政治环境、同道往来和多位弟子。",
    distinction: "慧可与僧可是同一人物称法；神光名号的早期依据较弱。所谓达摩唯一法嗣属于后世祖统选择，不能推定同时代没有其他门人。",
    sourceList: ["《续高僧传》卷十六僧可传", "《楞伽师资记》祖统段", "唐宋灯录慧可公案"],
    sourceNote: "断臂、师承和结局逐本对读；最早僧传与宋代灯录不拼成无缝传记。",
    boundary: "立雪断臂可以作为后世传说场景使用，但要标明版本；若写手术、雪夜时辰、达摩表情等具体细节，属于原创重建。",
    sourceRef: "bs:gaoseng-zhuan-group",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《续高僧传》卷十六《齐邺中释僧可传》"
  }),
  person({
    key: "sengcan",
    schoolKey: "chan-system",
    title: "僧璨",
    aliases: "僧粲、鉴智禅师、禅宗三祖",
    historicalLayer: "魏晋六朝",
    confidence: "存疑",
    summary: "后世禅宗列为三祖的人物，生平材料稀薄；与慧可、道信的连续付法主要由唐代谱系建立。",
    earliestSource: "唐代《楞伽师资记》及后出禅宗祖传",
    sourceLocation: "祖统叙述中的慧可之后、道信之前",
    domains: "禅宗祖统、舒州传法记忆",
    iconography: "祖师列像常作持锡杖或合掌僧形，缺乏同期形貌材料。",
    lead: "僧璨处在祖师谱最安静的一格：前有慧可，后有道信，中间却几乎没有能独立展开的同期材料。后人给他的沉默安上诗、疾病和山居，使这段空白变得可讲。",
    profile: "唐代禅史把僧璨列为慧可法嗣、道信之师，并与舒州山居相连。《信心铭》常题其名，作者归属并无早期充分证据。人物存在与完整生平的可证程度需分开。",
    reception: "禅宗尊僧璨为三祖，塔号、谥号和祖庭在唐宋以后逐步固定。祖位稳定不等于所有传法对白、患病缘由与示寂场景同样可靠。",
    distinction: "僧璨、僧粲多为字形异写，但还需防止与《续高僧传》其他同名义学僧混淆。《信心铭》不得无说明地当作其亲笔自传。",
    sourceList: ["《楞伽师资记》", "《历代法宝记》祖统材料", "宋代灯录僧璨传"],
    sourceNote: "本页主动保留材料空缺；后世谱系用于记录宗门记忆，不反称六世纪实录。",
    boundary: "可以把空白本身写进故事，让人物少言而非替他伪造大量语录；任何完整付法仪式和《信心铭》写作场景都须标原创。",
    sourceRef: "b3s:lengqie-shizi",
    sourceEvidenceType: "textual-variant",
    sourceCitation: "《楞伽师资记》祖统叙述"
  }),
  person({
    key: "daoxin",
    schoolKey: "chan-system",
    title: "道信",
    aliases: "双峰道信、禅宗四祖",
    historicalLayer: "隋唐",
    summary: "隋唐之际禅僧，在黄梅双峰山形成较稳定的山林僧团，后世列为禅宗四祖。",
    earliestSource: "《续高僧传》道信传及《楞伽师资记》",
    sourceLocation: "习禅篇道信材料；师资记道信章",
    domains: "山林僧团、一行三昧、东山法门前史",
    iconography: "双峰祖师像常配山门与锡杖，属于后世祖庭纪念。",
    lead: "到道信这里，禅法不再只像几位游方者之间的窄桥。双峰山有了长期居住、共同劳作和反复来学的人群，师资关系开始长出一个可以延续的场所。",
    profile: "道信活动于隋唐之际，传记记其游学后居蕲州双峰山，聚众修习。《楞伽师资记》把《文殊说般若经》一行三昧与其教法相连，具体制度仍不能直接等同后世丛林。",
    reception: "禅宗尊为四祖，黄梅一带形成四祖寺等祖庭记忆。其与僧璨的师承主要由祖传建立，与弘忍及东山僧团的承接材料相对更丰富。",
    distinction: "道信不是道教人物，也不能把“农禅并重”这句现代概括直接当其原话。双峰山、破头山和后世寺名要按时代校对。",
    sourceList: ["《续高僧传》道信传", "《楞伽师资记》道信章", "唐宋禅宗祖传"],
    sourceNote: "以僧传确认行迹，以师资记观察教法和谱系；后世清规不倒推至道信。",
    boundary: "适合写游方禅者如何第一次安顿成群体；每日作息、田亩制度和完整寺院布局若无材料，应标重建。",
    sourceRef: "b3s:lengqie-shizi",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《楞伽师资记》道信章并参《续高僧传》"
  }),
  person({
    key: "hongren",
    schoolKey: "chan-system",
    title: "弘忍",
    aliases: "黄梅弘忍、东山弘忍、禅宗五祖",
    historicalLayer: "隋唐",
    summary: "唐初东山法门领袖，门下神秀、慧能等后被不同禅系纳入祖统竞争。",
    earliestSource: "《楞伽师资记》弘忍章及唐代碑传、史传",
    sourceLocation: "师资记东山弘忍部分；《旧唐书》神秀传追述",
    domains: "东山法门、禅众教化、弟子网络",
    iconography: "传衣、夜授《金刚经》的场景主要由《坛经》定型。",
    lead: "弘忍门下后来走出了彼此竞争的历史。神秀在两京受到礼遇，慧能一系借神会北上而取得正统叙事；回看东山时，谁站在弘忍身边便不再只是师生名单，而成了八世纪的立场。",
    profile: "弘忍从道信学，居黄梅东山聚众，形成影响广泛的东山法门。《楞伽师资记》列神秀等弟子，《坛经》则以夜授衣法突出慧能；两类文本服务的谱系不同。",
    reception: "后世禅宗统一尊弘忍为五祖，却对法嗣排序有过激烈竞争。传衣袈裟成为正统象征，历史上是否有一件连续传至慧能的实物仍属宗门叙事问题。",
    distinction: "弘忍不是只教授《金刚经》或只教授《楞伽经》的单线老师；不同弟子群保留了不同记忆。五祖寺名与五祖称号属于后世纪念。",
    sourceList: ["《楞伽师资记》弘忍章", "《六祖坛经》行由品", "《旧唐书》神秀传"],
    sourceNote: "把东山同期材料与南北宗竞争文本并列，不裁剪成唯一秘密传法版本。",
    boundary: "可以写同一师门内不同修学气质，但夜半传衣、偈语竞赛与弟子反应必须指明采用《坛经》版本或原创。",
    sourceRef: "b3s:lengqie-shizi",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《楞伽师资记》弘忍章"
  }),
  person({
    key: "huineng",
    schoolKey: "chan-system",
    title: "慧能",
    aliases: "曹溪慧能、六祖、大鉴禅师",
    historicalLayer: "隋唐",
    summary: "唐代曹溪禅师，身后经神会与《坛经》传统成为南宗顿教核心和禅宗六祖。",
    earliestSource: "敦煌本《坛经》、唐代碑铭及《宋高僧传》",
    sourceLocation: "《坛经》行由、般若、定慧诸段；曹溪碑传",
    domains: "见性、无念、定慧一体、曹溪教团",
    iconography: "负薪闻经、舂米、传衣和肉身像构成主要图像，但来源年代不同。",
    lead: "慧能在后世故事里从一首偈子赢得祖位，历史却更曲折。他在岭南形成自己的教化，身后由神会把曹溪推到北方辩论中心，《坛经》又经过多次增订，才有今天熟悉的六祖形象。",
    profile: "慧能活动于七世纪后半至八世纪初，居曹溪弘法。《坛经》保存无念、无相、无住与定慧一体等教说，也包含自传和付法叙事；敦煌本、惠昕本、宗宝本差异明显。",
    reception: "神会及后继禅系成功确立慧能六祖地位，南宗遂成为主流祖统。岭南祖庭、肉身像与大量公案不断扩展其形象，不能全部视为本人当场言行。",
    distinction: "慧能不是“不识字所以反对经典”的简单符号，《坛经》反复援引多部经。偈语版本、传衣经过和神秀对立应按具体文本，不拼成唯一实录。",
    sourceList: ["敦煌本《坛经》", "宗宝本《六祖大师法宝坛经》", "《宋高僧传》慧能传及唐代碑铭"],
    sourceNote: "《坛经》各本分层引用，碑铭与僧传用于校正行迹；不把晚本新增段落倒填早年。",
    boundary: "适合写一个身后不断被重写的人；若采用舂米、偈墙和夜授衣法，要注明《坛经》传统，细节扩写需标原创。",
    sourceRef: "b3s:platform-sutra",
    sourceEvidenceType: "textual-variant",
    sourceCitation: "敦煌本与宗宝本《六祖坛经》对读"
  }),
  person({
    key: "shenxiu",
    schoolKey: "chan-system",
    title: "神秀",
    aliases: "大通禅师、玉泉神秀、北宗神秀",
    historicalLayer: "隋唐",
    summary: "弘忍弟子与武周、唐廷尊崇的禅师；“北宗渐修”形象多由后来的南宗论争塑成。",
    earliestSource: "《楞伽师资记》、张说碑文及《旧唐书》神秀传",
    sourceLocation: "师资记末章；《大通禅师碑铭》；旧唐书方伎传",
    domains: "东山法门、两京讲化、观心修行",
    iconography: "两京法主、帝王迎请与偈墙形象分别来自碑传、史书和《坛经》。",
    lead: "神秀生前并不是一位败在偈墙前的旁支僧。他在荆州玉泉寺讲化，晚年受武后迎入两京，门下遍布朝野；“渐门”这个标签更多是在他去世后由竞争者贴牢的。",
    profile: "神秀从弘忍学，后居玉泉寺，武周时入京并受高礼。《楞伽师资记》把他放在东山传承末端，碑铭与正史提供生平；《坛经》的偈语竞赛则属于南宗版本。",
    reception: "弟子普寂、义福延续其影响，八世纪中叶神会公开批评北宗祖统后，神秀逐渐在后世禅史中成为“渐悟”对照。这个二分未必覆盖本人全部教法。",
    distinction: "神秀不是慧能的固定宿敌，两人是否直接相见缺乏可靠记录。“北宗”是论争中的分类，不能假定神秀自建同名宗派。",
    sourceList: ["《楞伽师资记》神秀章", "张说《大通禅师碑铭》", "《旧唐书》神秀传", "《六祖坛经》偈语叙事"],
    sourceNote: "生平以碑、正史和早期禅史为主，《坛经》用于展示南宗如何重塑其位置。",
    boundary: "可写一位声望极高者怎样在身后输掉叙事权；偈墙对决若出现，必须标明是《坛经》文学结构。",
    sourceRef: "b3s:lengqie-shizi",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《楞伽师资记》神秀章及张说碑铭"
  }),
  person({
    key: "shenhui",
    schoolKey: "chan-system",
    title: "神会",
    aliases: "荷泽神会、真宗大师",
    historicalLayer: "隋唐",
    summary: "唐代曹溪门人，以公开论辩和北上弘法推动慧能祖统，深刻改变禅宗正统叙事。",
    earliestSource: "敦煌神会语录、唐代碑文及《坛经》后出段落",
    sourceLocation: "荷泽神会语录与显宗记残卷；滑台论辩记忆",
    domains: "南宗顿教、祖统论争、公开讲辩",
    iconography: "滑台定宗、北上辩论多见现代叙事图，古代固定像式不强。",
    lead: "神会做的事不只是讲禅。他把师承变成公共议题，在北方质问谁真正得到弘忍付嘱，也把原本偏居岭南的慧能推到帝国佛教的正统中心。",
    profile: "神会自称受学慧能，后在洛阳等地弘法，滑台大会成为其批评神秀系祖统的标志。敦煌出土语录保存部分思想和论辩，后世传记对日期、对手和处分经过仍有差异。",
    reception: "安史乱后神会一系影响上升，慧能六祖地位日益稳固。后来禅门虽未全以荷泽为主流，却继承了他推动的南宗正统叙述。",
    distinction: "神会不是《坛经》全部文字的已证作者，也不能把每次南北宗争论都归他策划。所谓七祖追封和官方认可须标具体诏令与年代。",
    sourceList: ["敦煌本神会语录", "《显宗记》残存文本", "唐代碑传", "《坛经》顿渐品后记"],
    sourceNote: "以敦煌材料为思想底本，后出灯录用于观察胜利后的记忆重写。",
    boundary: "适合写言论、舆论和宗门政治交叉的故事；论辩现场逐字对白若非语录所载，应标戏剧重建。",
    sourceRef: "b3s:platform-sutra",
    sourceEvidenceType: "textual-variant",
    sourceCitation: "敦煌神会语录并参《坛经》顿渐品"
  }),
  person({
    key: "mazu-daoyi",
    schoolKey: "chan-system",
    title: "马祖道一",
    aliases: "马祖、大寂禅师、洪州道一",
    historicalLayer: "隋唐",
    summary: "中唐洪州禅师，门下广布；其机锋和“即心是佛”等说法主要由较晚语录与灯录保存。",
    earliestSource: "唐代碑铭、《祖堂集》《景德传灯录》及《宋高僧传》",
    sourceLocation: "洪州开元寺相关传；灯录马祖章",
    domains: "洪州禅、日常机用、弟子网络",
    iconography: "坐禅磨砖公案常见于后世禅画，不是同期实景记录。",
    lead: "马祖的教法在后世记录里总带着动作：一喝、一扭鼻、一句忽然翻转的话。那些场面离本人已有传抄距离，却保住了洪州禅把修行拉回日常应对的气质。",
    profile: "道一曾从南岳怀让学，后在江西弘法，弟子众多。碑铭和僧传提供基本行迹，语录、公案多经《祖堂集》《景德传灯录》整理，不能视为现场速记。",
    reception: "洪州禅经百丈、南泉等展开，成为晚唐禅门重要网络。马祖被尊称大寂，许多名句集中到其名下，版本先后和弟子归属需要逐案核对。",
    distinction: "马祖不是“马姓祖师”的泛称，也不应因后世公案鲜明而忽略寺院、施主和地方网络。“即心是佛”与“非心非佛”须在语境中并读。",
    sourceList: ["《宋高僧传》马祖道一材料", "《祖堂集》马祖章", "《景德传灯录》卷六相关章"],
    sourceNote: "基本生平与公案分层；宋代灯录只证明故事在该时已成形。",
    boundary: "可以采用公案式短场景，但需标明出自哪部灯录；人物表情、围观弟子和连续剧情属于创作。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《宋高僧传》及唐代碑传中的马祖道一材料"
  }),
  person({
    key: "baizhang-huaihai",
    schoolKey: "chan-system",
    title: "百丈怀海",
    aliases: "怀海、大智禅师、百丈禅师",
    historicalLayer: "隋唐",
    summary: "马祖弟子，百丈山教团领袖；后世把禅院制度与“百丈清规”集中归于其名。",
    earliestSource: "《宋高僧传》卷十怀海传及《景德传灯录》",
    sourceLocation: "卷十习禅篇；传灯录卷六百丈章",
    domains: "禅院组织、普请、上堂、洪州禅传承",
    iconography: "野狐禅、清规祖师与“一日不作”图像多由后出公案定型。",
    lead: "百丈怀海面对的难题很实际：越来越多禅僧聚到山中，住哪里、怎样吃饭、谁来劳动、长老如何说法。后世用一部“清规”回答了所有问题，历史上却更像多代制度逐渐汇到百丈名下。",
    profile: "怀海从马祖道一学，居百丈山，门下有黄檗、沩山等。《宋高僧传》记其别立禅居、僧堂、普请与法堂安排，但现存《敕修百丈清规》成书很晚，不能当其亲笔原本。",
    reception: "“马祖建丛林，百丈立清规”成为禅院史的经典概括。它抓住制度变化，也把漫长演化压成两位祖师的一次创制，知识库保留二者差别。",
    distinction: "怀海不等于后世所有清规条款的作者。“一日不作，一日不食”广为流传，最早出处和原句形态需要谨慎，不作为无条件同期口号。",
    sourceList: ["《宋高僧传》卷十怀海传", "《景德传灯录》卷六", "《禅门规式》后出引文", "《敕修百丈清规》"],
    sourceNote: "以宋代僧传确认制度记忆，后世清规用于观察追溯，不倒署怀海亲撰。",
    boundary: "适合写一个快速扩张的山中共同体如何发明秩序；完整规章、职事表和口号若用后世文本，应清楚标注年代。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《宋高僧传》卷十《唐新吴百丈山怀海传》"
  }),

  person({
    key: "daoxuan",
    schoolKey: "vinaya-system",
    title: "道宣",
    aliases: "南山道宣、道宣律师",
    historicalLayer: "隋唐",
    summary: "唐代律学家、史传编纂者，以《四分律行事钞》等建立南山律学并记录初唐佛教。",
    earliestSource: "道宣自著诸书题记、《开元释教录》及后出僧传",
    sourceLocation: "《四分律删繁补阙行事钞》卷首；《开元释教录》卷八",
    domains: "四分律、戒坛、僧传编纂、佛教制度史",
    iconography: "天人送供、韦将军护法是感通传形象，与史家和律学家身份并列。",
    lead: "道宣既给僧团写规则，也给前代僧人写传。他熟悉制度如何在日常里失去边界，因此《行事钞》总从具体场合落笔；与此同时，《续高僧传》又保存了许多没有别处可找的人。",
    profile: "道宣居终南山，研习四分律，撰行事钞、羯磨、戒本疏，并编《续高僧传》《大唐内典录》等。他的历史写作有分类和护教立场，仍是六朝隋唐佛教不可替代的资料。",
    reception: "后世尊其为南山律宗祖师，净业寺与戒坛成为纪念中心。感通录中的天人、韦将军和佛牙舍利扩展其神圣形象，需与制度著述分层。",
    distinction: "道宣不是所有《四分律》条文的制定者，而是汉地解释与行事体系的重要整理者。《续高僧传》的判断也不等于无立场官方档案。",
    sourceList: ["《四分律删繁补阙行事钞》", "《续高僧传》", "《大唐内典录》", "《道宣律师感通录》"],
    sourceNote: "以自著题记和目录建立著述史，感通故事单独标作信仰叙事。",
    boundary: "可写一位规则编纂者如何处理真实僧团困境；韦驮夜访、天厨送供和具体断案若扩写，须说明史料来源或原创。",
    sourceRef: "b3s:sifen-xingshi-chao",
    sourceEvidenceType: "primary-text",
    sourceCitation: "道宣《四分律删繁补阙行事钞》"
  }),
  person({
    key: "jianzhen",
    schoolKey: "vinaya-system",
    title: "鉴真",
    aliases: "鉴真大和尚、过海大师",
    historicalLayer: "隋唐",
    summary: "唐代律僧，数次东渡后抵达日本，主持授戒并携带佛典、医药与工艺知识。",
    earliestSource: "淡海三船《唐大和上东征传》及日本早期寺院文书",
    sourceLocation: "东征传六次航行、抵日授戒与唐招提寺段",
    domains: "授戒、跨海佛教、寺院营建、文化传播",
    iconography: "日本唐招提寺干漆坐像接近奈良时代纪念实物，仍非日常写实肖像。",
    lead: "鉴真东渡不是一条英雄式直线。船只失期、风向转变、官府阻拦、弟子离散和失明反复打断计划；真正抵达日本时，他带去的是一整个可以运作的授戒共同体。",
    profile: "鉴真在扬州弘律，应日本僧荣叡、普照邀请多次尝试东渡，终于在753年抵日。其授戒、寺院与同行者主要见《唐大和上东征传》，传记也具有纪念大德的写作目的。",
    reception: "鉴真在日本律学、东大寺戒坛和唐招提寺历史中地位突出，中日两地均以渡海坚忍纪念他。医药、建筑和艺术贡献需按具体物证与文书，不宜无限扩张。",
    distinction: "鉴真不是日本佛教的唯一创始人，抵日前已有佛教和戒律活动。他与道宣同属律学谱系，但不存在直接师徒关系。",
    sourceList: ["《唐大和上东征传》", "奈良时代授戒与唐招提寺文书", "《宋高僧传》相关传记"],
    sourceNote: "航次与人员以东征传为主，实物和寺院文书校验；后世民族叙事另作接受层。",
    boundary: "适合写航海失败如何改变同行者；每次风暴的天气细节、航线坐标和私人对话若无记录，都应标重建。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《唐大和上东征传》并参《宋高僧传》"
  }),

  person({
    key: "subhakarasimha",
    schoolKey: "tang-esoteric-system",
    title: "善无畏",
    aliases: "输波迦罗、净师子、无畏三藏",
    historicalLayer: "隋唐",
    summary: "中印度来唐译师，主持《大日经》等译事，与一行讲释形成唐代真言教学的重要文本。",
    earliestSource: "《开元释教录》《宋高僧传》及《大日经》译记",
    sourceLocation: "《宋高僧传》卷二；《大毗卢遮那成佛神变加持经》题记",
    domains: "真言译经、灌顶、胎藏法门、跨域传法",
    iconography: "阿阇梨持金刚杵或结印形象多依后世密教祖师画。",
    lead: "善无畏抵达长安时已经年长，他带来的不只是一卷梵本，还包括口授、坛场和必须在师徒之间学习的仪轨。译经桌因此无法独自完成工作，一行的记录与解释成为另一半。",
    profile: "善无畏来自中印度，唐开元年间来华，主持译出《大日经》《苏悉地经》等。僧传把其王族出身、游历和神异铺陈得很丰富，译经题记与目录更适合确认时间和作品。",
    reception: "后世把善无畏、金刚智、不空并称开元三大士，视为唐密奠基者。日本真言和天台密教也追溯其传承，但各自谱系与灌顶线不完全相同。",
    distinction: "善无畏不是大日如来的化身这一点无法由历史材料证明；其梵名异译不代表多位译师。胎藏、金刚界两条教学也不能简单各归一人独创。",
    sourceList: ["《开元释教录》善无畏译籍", "《宋高僧传》卷二善无畏传", "《大日经》及经疏题记"],
    sourceNote: "译籍以目录和题记为准，王族与神异故事按僧传叙事层展示。",
    boundary: "可写翻译必须靠口授、笔受与坛场经验共同完成；宫廷召见和降雨等神异若使用，要指出僧传来源或标原创。",
    sourceRef: "b3s:dainichi-commentary",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《大日经》译记与《大毗卢遮那成佛经疏》题署"
  }),
  person({
    key: "vajrabodhi",
    schoolKey: "tang-esoteric-system",
    title: "金刚智",
    aliases: "跋日罗菩提、金刚智三藏",
    historicalLayer: "隋唐",
    summary: "南印度来唐译师，经海路抵达广州与长安，传播金刚顶系仪轨并培养不空。",
    earliestSource: "《开元释教录》《贞元新定释教目录》及《宋高僧传》",
    sourceLocation: "译经目录金刚智条；僧传卷一译经篇",
    domains: "金刚顶系、海路传法、灌顶、译经",
    iconography: "后世密教祖师画常配五股杵与坛城，不能据此复原历史携物。",
    lead: "金刚智从海上来到唐朝，行程穿过多个港口和语言区。到长安后，他所传的仪轨并不只靠译文保存，不空作为弟子、译语者和继承者，让这条海路知识继续落地。",
    profile: "金刚智出身南印度佛教环境，经师子国和海路来唐，开元年间从事译经与灌顶。现存译籍归属复杂，有些题署和后录需要校勘；与不空的师徒关系较为稳定。",
    reception: "开元三大士叙事把金刚智置于唐密形成中心，金刚顶法门亦经不空扩展。后世谱系常把印度诸师串成单线，实际旅学和文本来源更为多元。",
    distinction: "金刚智不是金刚手菩萨，也不与金刚萨埵合并。梵名的“菩提”成分不表示其为菩萨化身。",
    sourceList: ["《开元释教录》金刚智条", "《宋高僧传》金刚智传", "金刚顶系译经题记"],
    sourceNote: "海路、生平与译籍分别用僧传、目录和题记核对；谱系神圣化不替代文献史。",
    boundary: "适合写跨海携带的不只是书，还有无法脱离师承的动作与声音；具体航线日记和船上授法若无材料须标原创。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《宋高僧传》金刚智传及《开元释教录》"
  }),
  person({
    key: "amoghavajra",
    schoolKey: "tang-esoteric-system",
    title: "不空",
    aliases: "不空金刚、阿目佉跋折罗、不空三藏",
    historicalLayer: "隋唐",
    summary: "唐代译师与密教组织者，师承金刚智并再赴南海求法，回唐后主持大规模译经与护国仪礼。",
    earliestSource: "不空表制、译经题记、《贞元新定释教目录》及《宋高僧传》",
    sourceLocation: "进翻译佛经表；译经目录不空条；僧传卷一",
    domains: "译经、灌顶、护国仪礼、弟子网络",
    iconography: "宫廷阿阇梨、持杵结印与五部灌顶图像多由后世祖统塑造。",
    lead: "不空把师承变成了组织能力。他再赴海上求法，带回梵本与仪轨，又在长安安排译语、笔受、校勘和灌顶；密教由少数外来师的教学，转为能进入国家法会的庞大网络。",
    profile: "不空早年从金刚智，后赴师子国等地求法，天宝年间返唐，历玄宗至代宗主持译经和仪礼。其表奏、目录和题记保留较多可考活动，僧传中的神异另列。",
    reception: "唐廷赐号与护国法会提升不空地位，弟子含惠果等多位僧人。后世称其开元三大士之一或密教祖师，具体灌顶法系因传统而有不同排列。",
    distinction: "不空不是所有唐代陀罗尼经的译者，题署需经目录校勘。他与“不空羂索观音”只是汉字相同部分，不是同一身份。",
    sourceList: ["不空《进翻译佛经表》", "《贞元新定释教目录》不空译籍", "《宋高僧传》不空传", "现存译经题记"],
    sourceNote: "用表奏和目录建立可考活动，护国灵验按僧传与仪礼记述分层。",
    boundary: "适合写大型译场和朝廷法会背后的协调工作；战争胜负由法术决定等叙述只能作为当时信仰或明确原创。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《宋高僧传》不空传及不空表制"
  }),
  person({
    key: "yixing",
    schoolKey: "tang-esoteric-system",
    title: "一行",
    aliases: "一行禅师、张遂、大慧禅师",
    historicalLayer: "隋唐",
    summary: "唐代僧人与历算家，参与《大日经》笔受和疏释，也主持天文测量与历法编制。",
    earliestSource: "《旧唐书》一行传、《大日经疏》题署及唐代历法记录",
    sourceLocation: "正史方技传；经疏卷首“沙门一行阿阇梨记”",
    domains: "大日经疏、天文测量、大衍历、禅学",
    iconography: "观星僧与密教阿阇梨两种图像常被合并，需避免把仪器神奇化。",
    lead: "一行的一天可以同时面对两种尺度：坛场里的种子字与宇宙观，测影台上的日影和里程。他没有觉得这两类工作必须互相排斥，却也不能因此被改写成用密法计算星球的传奇术士。",
    profile: "一行本名张遂，出家后习禅与历算，参与善无畏《大日经》讲释并记录为疏，又奉诏主持测量、编成大衍历。经疏、正史和历法记录分别保存其不同工作面。",
    reception: "后世既尊一行为密教祖师，也纪念其天文学成就，民间更出现推背、预言和机关术等附会。可考贡献须与术士传奇分开。",
    distinction: "一行不是《大日经》的译者主名，而是笔受、记录和解释者；也不能把所有以“一行”为名的预言书归给他。天文观测不等于占星神通。",
    sourceList: ["《大毗卢遮那成佛经疏》", "《旧唐书》一行传", "《新唐书·历志》大衍历材料"],
    sourceNote: "经疏题署确认佛学工作，正史历志确认测量与历法；民间预言不进入事实层。",
    boundary: "适合写同一人物在经疏与观测之间切换；若让计算直接召来天象、预知王朝或制造自动人偶，应明确标原创。",
    sourceRef: "b3s:dainichi-commentary",
    sourceEvidenceType: "primary-text",
    sourceCitation: "《大毗卢遮那成佛经疏》“沙门一行阿阇梨记”"
  }),
  person({
    key: "huiguo",
    schoolKey: "tang-esoteric-system",
    title: "惠果",
    aliases: "青龙寺惠果、遍照金刚阿阇梨",
    historicalLayer: "隋唐",
    summary: "不空弟子与青龙寺阿阇梨，以胎藏、金刚界灌顶教学影响空海等多国求法僧。",
    earliestSource: "空海《惠果和尚行状》、唐代碑文与密教目录",
    sourceLocation: "《大唐神都青龙寺故三朝国师灌顶阿阇梨惠果和尚之碑》及行状",
    domains: "灌顶、两部曼荼罗、青龙寺教学、跨国传承",
    iconography: "两界曼荼罗前授灌顶的祖师像多由日本真言宗传承定型。",
    lead: "惠果晚年面对来自不同地方的求法者，时间却已经不多。空海的行状把相遇写得极有命定感；无论修辞怎样，青龙寺确实成为唐代密教知识向东亚多地分流的一处节点。",
    profile: "惠果幼年入道，受学不空等师，在青龙寺主持灌顶。日本僧空海于805年从其受法并撰行状、碑文；这些材料珍贵，也带有弟子追念恩师的视角。",
    reception: "日本真言宗把惠果置于核心付法谱，空海传承尤为突出。唐代本土密教并未因此只有一位继承者，其他弟子和仪轨网络仍需保留。",
    distinction: "惠果与慧果等异写要按文献校订，不能与其他同名僧混并。所谓同时承受胎藏、金刚界全部密法是谱系概括，具体灌顶内容应依行状和目录。",
    sourceList: ["空海《惠果和尚行状》", "《惠果和尚之碑》", "《贞元新定释教目录》相关材料", "青龙寺密教史料"],
    sourceNote: "弟子行状既是直接见闻入口，也是纪念文本；与碑文和目录互相校验。",
    boundary: "适合写时间紧迫的跨语际传法；宿命预言、一次授尽所有秘法和临终密语若超出行状，须标原创。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "空海《惠果和尚行状》及唐代碑文"
  })
];

function institution(row) {
  return {
    entityType: "organization",
    category: "buddhist-sinicization",
    tradition: "佛教",
    confidence: "主流说法",
    hierarchyLevel: "汉传佛教学系、修行传统与后世宗派层",
    ...row
  };
}

const institutionRows = [
  institution({
    key: "tiantai-system",
    title: "天台教观与止观体系",
    institutionKind: "法华教观与修行学系",
    jurisdiction: "教判、法华解释、止观修习、忏法与僧团教学",
    formationPeriod: "六世纪慧思、智顗讲修奠基，隋唐注疏与祖统逐步定型",
    earliestSource: "智顗讲说、灌顶记录的天台三大部及僧传",
    sourceLocation: "《摩诃止观》《法华玄义》《法华文句》卷首与正文",
    variants: "山家山外、宋代天台诸家及日本天台在教判、观心和密教结合上各有发展。",
    summary: "以《法华经》解释与止观实践相互支撑的汉传佛教学系，后世通过祖统和寺院形成天台宗。",
    lead: "天台并不是先画好一张教义表，再把修行塞进去。智顗的讲说总在经文解释和观心方法之间往返：怎样判断佛说的方便，也怎样在一念里真正开始用功。",
    profile: "慧文、慧思提供禅观与法华实践前史，智顗组织五时八教、三谛与止观，灌顶保存讲本，湛然再作注释。这个链条包含真实师承，也包含后世对早期人物的宗派追认。",
    reception: "国清寺及各地天台讲院让教观成为可教学、可礼祖的传统。宋代山家山外论争、日本天台的密教与戒法发展，说明“天台”从未只有一套静止答案。",
    distinction: "五时八教不是释迦当年亲自颁布的历史课程表，而是汉地解释经教差异的工具。天台、法华宗等称法在具体时代有不同范围。",
    sourceList: ["《摩诃止观》", "《法华玄义》", "《法华文句》", "《续高僧传》慧思、智顗传"],
    sourceNote: "以三大部建立教观骨架，祖传和后世注疏说明制度化过程；不把后期定型术语倒写到慧文。",
    boundary: "可作为宗门、学院或角色修行体系的参考；若将教判变成客观宇宙等级或赋予即时法术效果，须标原创设定。",
    sourceRef: "b3s:maha-zhiguan",
    sourceCitation: "智顗说、灌顶记《摩诃止观》"
  }),
  institution({
    key: "huayan-system",
    title: "华严法界观与五教判",
    institutionKind: "华严经学与法界观传统",
    jurisdiction: "华严经疏、法界缘起、十玄六相、五教判与祖师讲学",
    formationPeriod: "隋唐之间由终南山经学、译场与长安讲席逐步形成",
    earliestSource: "智俨著述、法藏《探玄记》及澄观疏钞",
    sourceLocation: "《华严经探玄记》卷一教起因缘与宗趣；历代华严疏钞",
    variants: "六十卷、八十卷与四十卷华严的注疏重点不同；中日韩华严祖统和判教有所差别。",
    summary: "围绕《华严经》形成的法界缘起、十玄六相与教判传统，由多代讲师和不同译本共同塑成。",
    lead: "华严学最擅长处理“同时”。一粒尘与无数世界、一个行位与整体修行如何不相妨碍，讲师们为此发展出十玄、六相和法界观，但这些工具不是一次完成的。",
    profile: "智俨建立重要解释框架，法藏以《探玄记》系统展开，澄观面向八十卷本重写大疏，宗密又将禅教问题带入。杜顺初祖位置则主要由后世祖统确立。",
    reception: "长安译场、终南山寺院和五台讲席共同支撑华严传统，随后传入新罗、日本与越南。贤首宗、华严宗等名称常互用，具体内涵需看时代。",
    distinction: "法界缘起不能简化成所有人物共享意识，也不是游戏里的无限套娃法术。五教判是解释框架，不代表佛教史真的按五级依次出现。",
    sourceList: ["《华严经探玄记》", "智俨《搜玄记》", "澄观《华严经疏》", "宗密《禅源诸诠集都序》"],
    sourceNote: "按著述年代追踪概念变化，祖师谱只标后世追认，不替代作者间的真实时间距离。",
    boundary: "可为世界观中的整体关联、视角与层级设计提供灵感；若化为确定物理规则，必须注明项目原创。",
    sourceRef: "b3s:huayan-tanxuan",
    sourceCitation: "法藏《华严经探玄记》卷一至卷二十"
  }),
  institution({
    key: "faxiang-system",
    title: "法相唯识与慈恩学系",
    institutionKind: "译经注疏与唯识论学传统",
    jurisdiction: "瑜伽行、识论、因明、经论会通与大慈恩寺讲学",
    formationPeriod: "七世纪玄奘译场后，由窥基、圆测、慧沼等多条解释路线展开",
    earliestSource: "玄奘译《成唯识论》及窥基、圆测等人的疏记",
    sourceLocation: "《成唯识论述记》卷首；《解深密经疏》等",
    variants: "慈恩系、西明系及东亚法相诸派对五性、识变和佛性问题的解释并不一致。",
    summary: "以玄奘新译唯识典籍为共同资源、在大慈恩寺和西明寺等讲席形成的多支注疏传统。",
    lead: "新译本并没有终结争论，反而把问题写得更精确。一个梵语术语怎样落成汉字，一段论证该由哪部经来解释，窥基、圆测和慧沼都给出了不完全相同的答案。",
    profile: "玄奘主持译出《成唯识论》《瑜伽师地论》等，窥基形成慈恩注疏，圆测在西明寺展开另一解释，慧沼再回应异说。后世所谓法相宗由这些文本网络逐渐归纳。",
    reception: "日本法相宗和朝鲜半岛唯识学保存了中国部分散佚的注疏，使这套学问具有跨地域生命。宗派史常偏爱一条正统线，知识库并列各家。",
    distinction: "“万法唯识”不等于世界只是个人幻想，也不表示伦理和外在关系可以忽略。慈恩、西明是学系称法，不应想象成现代互斥政党。",
    sourceList: ["《成唯识论》", "《成唯识论述记》", "圆测《解深密经疏》", "慧沼《成唯识论了义灯》"],
    sourceNote: "同一术语回到具体论疏核对，争议关系标明作者和年代，不压成一条百科结论。",
    boundary: "可用于设计记忆、认知与误判主题；若改成读心、修改现实或绝对唯心能力，须标原创。",
    sourceRef: "b3s:weishi-shuji",
    sourceCitation: "窥基《成唯识论述记》"
  }),
  institution({
    key: "pure-land-system",
    title: "净土念佛与往生实践",
    institutionKind: "念佛、观想、礼赞与往生愿行传统",
    jurisdiction: "阿弥陀经典解释、称名念佛、观想、礼忏、临终关怀与结社",
    formationPeriod: "东晋庐山实践、北朝论释与隋唐称名仪礼多线汇合",
    earliestSource: "净土三经、慧远结社材料、昙鸾《往生论注》与善导《观经疏》",
    sourceLocation: "《观经疏》玄义分和散善义；各祖师著述",
    variants: "庐山念佛三昧、昙鸾道绰论释、善导称名及后世莲社并非一套从未变化的制度。",
    summary: "围绕阿弥陀佛、极乐世界与往生愿行形成的多种汉地实践，包含观想、称名、礼赞和结社。",
    lead: "净土传统的入口很多：有人在山中立誓，有人从论书解释愿力，有人在长安把称名编成日课，也有人用五会声腔让整座法堂一起念佛。它们后来被一条祖统串联，却保留各自节奏。",
    profile: "慧远的念佛三昧、昙鸾的《往生论注》、道绰的《安乐集》、善导的《观经疏》与承远法照的仪礼实践共同构成历史层。后世追祖不是同期组织证明。",
    reception: "宋以后莲社与祖师谱继续扩展，中日净土诸宗各自选择正依经典、祖次和修法重点。临终助念和大众佛号尤其深入民间生活。",
    distinction: "净土不是只有临终才使用的信仰，也不能把全部实践缩成机械重复名号。极乐世界属于佛典神圣地理，不放入现代天文坐标。",
    sourceList: ["《佛说无量寿经》", "《观无量寿佛经》", "《阿弥陀经》", "《往生论注》", "善导《观经疏》"],
    sourceNote: "按经文、论释、仪礼和后世祖统四层组织，不把不同年代的“净土宗”当单一机构。",
    boundary: "可支持角色愿望、死亡观和共同仪礼；若具体描绘往生后的城市政治或灵魂规则，应标项目原创。",
    sourceRef: "b3s:guanjing-shu",
    sourceCitation: "善导《观无量寿佛经疏》四卷"
  }),
  institution({
    key: "chan-system",
    title: "禅宗祖统与丛林制度",
    institutionKind: "禅法师承、灯录叙事与山林教团",
    jurisdiction: "禅观、师徒问答、祖师谱、禅院日常与丛林职事",
    formationPeriod: "六世纪达摩门下至唐宋祖统、灯录和清规逐步形成",
    earliestSource: "《续高僧传》早期禅师传、《楞伽师资记》与唐代碑铭",
    sourceLocation: "达摩、慧可传；师资记祖统；《坛经》与灯录",
    variants: "东山、北宗、曹溪、荷泽、洪州及宋代五家祖统彼此竞争又重组。",
    summary: "由早期禅观师承、唐代祖统论争、山林僧团和宋代灯录清规共同形成的禅门传统。",
    lead: "禅宗最著名的故事常像一瞬间发生：一句话、一次棒喝、忽然开悟。把镜头拉远，却能看见寺院要吃饭、弟子要住宿、谱系要争论、语录要多年后才被写定。",
    profile: "达摩与慧可的早期材料较简，东山法门开始形成稳定群体，神秀与慧能诸系在八世纪竞争祖统，马祖百丈后山林教团扩张。宋代灯录再把分散记忆编成传灯史。",
    reception: "禅宗成为东亚影响广泛的佛教传统，祖师像、公案、清规和五家七宗叙事进入寺院教育。不同支系并不共享每一条付法名单。",
    distinction: "“不立文字”不等于反对读写，禅宗留下大量碑、语录和灯录。公案也不是可脱离语境套用的谜语题库。",
    sourceList: ["《续高僧传》达摩、慧可等传", "《楞伽师资记》", "《六祖坛经》", "《景德传灯录》", "《宋高僧传》怀海传"],
    sourceNote: "真实师承、宗派追认和神圣付法谱使用不同关系类型，公案按最早可见文本标年代。",
    boundary: "可用于师徒、共同体与语言误导的剧情；若把棒喝写成超能力或将某公案设为历史现场，须标出处或原创。",
    sourceRef: "b3s:lengqie-shizi",
    sourceEvidenceType: "textual-variant",
    sourceCitation: "《楞伽师资记》及早期禅宗史料"
  }),
  institution({
    key: "vinaya-system",
    title: "南山律学与四分律行事",
    institutionKind: "戒律解释、受戒与僧团行事传统",
    jurisdiction: "戒本解释、羯磨、戒坛、衣食住行、僧团处分与授戒",
    formationPeriod: "唐初道宣整理四分律行事，后世南山律宗与东亚授戒制度延续",
    earliestSource: "法藏部《四分律》汉译与道宣行事钞、羯磨疏",
    sourceLocation: "《四分律删繁补阙行事钞》三卷及戒坛文",
    variants: "南山、相部、东塔律学及中日授戒制度在解释与行事细节上不同。",
    summary: "以《四分律》为底、由道宣等人整理成适应汉地僧团日常的戒律解释和行事体系。",
    lead: "戒律落到寺院里，总会变成具体问题：谁有资格羯磨，雨天怎样护衣，远行如何结界，过错怎样听取双方。道宣的工作是把大部律文重新放回这些场景。",
    profile: "汉译《四分律》提供条文和因缘，道宣用行事钞、羯磨及疏记整理汉地实践。鉴真东渡又把授戒和律学带入日本制度环境；两者之间是学统承接，不是直接师徒。",
    reception: "南山律宗影响汉地寺院清规、受戒和律学教育，东亚多地另有本土制度发展。韦驮护律和天人送供丰富信仰形象，但不替代程序文本。",
    distinction: "律宗不等于只处罚僧人，戒律同时安排共同生活、财物、疾病和争端。后世清规也不能全部称作佛世原戒。",
    sourceList: ["《四分律》", "《四分律删繁补阙行事钞》", "《四分律删补随机羯磨》", "戒坛碑铭"],
    sourceNote: "条文、唐代疏钞与后世实际规约分层，制度变化不伪装成一成不变。",
    boundary: "可作为组织规则和冲突调解参考；若加入魔法誓约、即时惩罚或现代法庭程序，须标原创。",
    sourceRef: "b3s:sifen-xingshi-chao",
    sourceCitation: "道宣《四分律删繁补阙行事钞》"
  }),
  institution({
    key: "tang-esoteric-system",
    title: "唐代密教译场与灌顶坛",
    institutionKind: "真言译经、坛场灌顶与护国仪礼网络",
    jurisdiction: "陀罗尼、曼荼罗、灌顶、译经、宫廷法会与弟子传承",
    formationPeriod: "七至九世纪由善无畏、金刚智、不空及其弟子在唐代多处道场推动",
    earliestSource: "《大日经》《金刚顶经》系译记、经疏、表制与译经目录",
    sourceLocation: "《大日经疏》卷首；不空表制；开元、贞元目录",
    variants: "善无畏、金刚智、不空诸系及日本真言、天台密教对两部传承的排列不同。",
    summary: "以译经、口授、曼荼罗和灌顶共同运作的唐代佛教网络，兼具寺院教学与国家法会功能。",
    lead: "密教文本从来不是译完就算结束。手印怎样结、坛场怎样布置、种子字怎样读，都需要口授和现场训练；这使译场、灌顶坛和弟子网络彼此离不开。",
    profile: "善无畏与一行形成《大日经》译释，金刚智、不空传播金刚顶系，不空再组织大规模译经与护国仪礼，惠果等弟子延续。所谓“唐密”是后世归纳，不是当时唯一自称。",
    reception: "长安大兴善寺、青龙寺等成为传播节点，来自新罗、日本和其他地区的僧人受法后带回本土。会昌以后制度衰变，并非所有仪轨突然消失。",
    distinction: "曼荼罗不是普通世界地图，真言也不等同无条件咒语。铁塔付法属于神圣谱系，不能当印度至唐的逐代旅行档案。",
    sourceList: ["《大毗卢遮那成佛神变加持经》", "《大日经疏》", "金刚顶系译经", "不空表制", "《贞元新定释教目录》"],
    sourceNote: "译经题记、目录、表奏和弟子行状互证，神圣付法谱独立标为宗教叙事。",
    boundary: "可为仪式、图像和跨语际传承提供参考；若把真言写成稳定战斗技能或坛城写成传送装置，须标原创。",
    sourceRef: "b3s:dainichi-commentary",
    sourceCitation: "《大毗卢遮那成佛经疏》及唐代译经目录"
  }),
  institution({
    key: "panjiao-lineages",
    title: "中国佛教判教与宗派祖统",
    institutionKind: "经教分类、历史记忆与宗派合法性机制",
    jurisdiction: "判释诸经、安排祖师、确认法脉、建构宗门历史与教学目录",
    formationPeriod: "南北朝判教兴起，隋唐各家成熟，唐宋祖统与灯录进一步固定",
    earliestSource: "南北朝至隋唐诸家教判著述、僧传和祖统文本",
    sourceLocation: "《法华玄义》《探玄记》《楞伽师资记》《坛经》等",
    variants: "天台、华严、三论、法相、禅、净土与密教使用不同分类和祖统，互有吸收与竞争。",
    summary: "汉传佛教用来解释经典差异、安排师承和书写宗门过去的一组方法，不是一张所有传统共享的唯一谱系。",
    lead: "经典越来越多以后，读者必须回答先读什么、冲突怎样解释；宗门越来越多以后，又必须回答自己从哪里来。判教和祖统正是两种答案，一种整理文本，一种整理记忆。",
    profile: "天台五时八教、华严五教、净土圣净二门等处理教说层次；禅宗祖统、华严五祖、净土祖师谱则组织人物传承。它们都具有历史作用，也带有鲜明立场。",
    reception: "唐宋以后寺院教育、碑铭、灯录和祖堂让这些结构深入日常。现代“八宗”之类概括便于入门，却常把交叉学习、未成宗的学系和地方差异隐藏。",
    distinction: "判教不是佛教经典自带的发布日期排名，祖统也不等于每一代都有可核面对面授法。真实师徒、思想继承、追尊祖位和神圣付法必须分边。",
    sourceList: ["智顗《法华玄义》", "法藏《华严经探玄记》", "《楞伽师资记》", "《六祖坛经》", "历代僧传与灯录"],
    sourceNote: "每条谱系注明最早可见文本和追认年代，不让后起完整名单覆盖早期资料的沉默。",
    boundary: "可用于设计派系记忆和正统争论；若创造一条项目法脉，须在独立故事页统一标明项目原创，不混入传统谱系。",
    sourceRef: "b3s:lengqie-shizi",
    sourceEvidenceType: "textual-variant",
    sourceCitation: "《楞伽师资记》祖统及隋唐诸家判教著述"
  })
];

function sacredLocation(row) {
  return {
    tradition: "佛教",
    spaceKind: "庙宇与遗址",
    confidence: "明确",
    ...row
  };
}

const locationRows = [
  sacredLocation({
    key: "guoqing-temple",
    title: "天台山国清寺",
    historicalPeriod: "隋代建寺至今，历代兴废重建",
    sourceTitle: "《国清百录》、天台祖传与历代寺志",
    sourceLocation: "智顗遗愿、灌顶建寺及隋代赐额相关记录",
    modernCorrespondence: "今浙江省台州市天台县国清寺；现存建筑多为后世重修。",
    summary: "依智顗遗愿、由灌顶等营建的天台祖庭，寺址延续与现存建筑年代需要分层。",
    lead: "国清寺的“起点”发生在智顗身后。遗愿、选址、弟子营建和隋廷赐额共同构成建寺过程，它不是祖师生前早已完工的一座纪念馆。",
    profile: "天台山佛陇修禅寺等早期道场在先，国清寺于隋代依智顗规划和遗愿兴建，灌顶参与。寺院历经毁建，今日空间不能直接充当六世纪场景。",
    reception: "国清寺成为天台宗祖庭，吸引中日等地求法者，祖师殿、讲堂和碑刻不断重写宗门记忆。不同朝代寺域与道路应在地图上分层。",
    distinction: "国清寺与玉泉寺、修禅寺不是同一地点。智顗在天台山活动的所有事件也不能都放到现存国清寺院落。",
    sourceList: ["《国清百录》", "《隋天台智者大师别传》", "历代国清寺碑志"],
    sourceNote: "用早期文献定位建寺层，用碑志处理重修；现代坐标只标现址。",
    boundary: "可作为祖庭与跨国求法场景；复原隋代院落、钟楼和房间需标推测或原创。",
    sourceRef: "b3s:maha-zhiguan",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《国清百录》及天台早期传记"
  }),
  sacredLocation({
    key: "zhixiang-temple",
    title: "终南山至相寺",
    historicalPeriod: "隋唐华严讲学重地，后世祖庭记忆延续",
    sourceTitle: "智俨、法藏传记与华严著述题记",
    sourceLocation: "至相尊者称号、终南山讲学与弟子活动材料",
    modernCorrespondence: "约在今陕西西安南部终南山地区；古寺范围与后世遗址对应需谨慎。",
    confidence: "大致区域",
    summary: "智俨讲习华严、法藏受学的重要山寺，后世以至相尊者之名成为华严祖庭记忆。",
    lead: "至相寺把华严学留在了山里。经卷从长安送来，学僧在终南山反复讲读，智俨的称号也逐渐与寺名重叠；后来追述华严五祖时，这里便成了自然的第二站。",
    profile: "智俨在终南山至相寺一带讲学，法藏曾从其受学。古代寺址、名称和范围经历变化，地图应标大致区域与文献层，不绘成一处未经考古确认的精确院落。",
    reception: "华严祖统把至相寺与杜顺、智俨、法藏的传承连接，朝礼和重建延续影响。寺院记忆比现存物质连续性更稳定。",
    distinction: "至相寺不是华严宗唯一祖庭，也不与云华寺、大荐福寺或五台清凉寺合并。智俨“至相尊者”是由居处生出的称号。",
    sourceList: ["智俨著述题记", "法藏传记", "华严祖统与终南山寺志"],
    sourceNote: "地点采用历史大区，不虚构精确经纬度；不同寺名分别建关联。",
    boundary: "适合写山中讲学和经卷往来；隋唐建筑复原、密室和固定藏书量须标重建。",
    sourceRef: "b3s:huayan-tanxuan",
    sourceEvidenceType: "historical-record",
    sourceCitation: "华严祖传与智俨、法藏著述题记"
  }),
  sacredLocation({
    key: "daci-en-temple",
    title: "长安大慈恩寺",
    historicalPeriod: "唐贞观末年建寺，玄奘译场与慈恩学系活动重地",
    sourceTitle: "《大唐大慈恩寺三藏法师传》及唐代译经题记",
    sourceLocation: "法师传归国译经诸卷；窥基居寺与著述材料",
    modernCorrespondence: "今陕西省西安市大慈恩寺及大雁塔区域；现存格局非唐代原貌。",
    summary: "玄奘译经和窥基讲学的重要长安寺院，连接国家译场、藏经、注疏与跨国求法。",
    lead: "大慈恩寺里的知识生产有明确分工：梵本要校，译语要定，汉文要润，目录要记，讲义还要继续写。大雁塔只是最醒目的建筑，真正让寺院运转的是这些人。",
    profile: "唐高宗为纪念文德皇后建寺，玄奘及译场僧入住，窥基等在此学习著述。寺院和大雁塔多次修葺，唐代院落不能从今日游客路线直接反推。",
    reception: "慈恩寺成为法相唯识的重要象征，也接待东亚求法僧。后世“慈恩宗”称法由人物、寺院和著述共同形成，并非寺院内只有一门学问。",
    distinction: "大慈恩寺不等于西明寺，也不等于玄奘全部译经地点。大雁塔与寺院是相关但不同的地图对象。",
    sourceList: ["《大唐大慈恩寺三藏法师传》", "《成唯识论》译记", "窥基著述题记", "唐代长安寺院史料"],
    sourceNote: "译场活动按具体年份与经题记录，现址和唐代遗址分图层。",
    boundary: "适合写多人协作译场；若复原某日座次、房间和争论对白，需要注明推测。",
    sourceRef: "b3s:weishi-shuji",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《大唐大慈恩寺三藏法师传》及译经题记"
  }),
  sacredLocation({
    key: "donglin-temple",
    title: "庐山东林寺",
    historicalPeriod: "东晋慧远居寺以来，历代重修并形成净土祖庭",
    sourceTitle: "《高僧传》慧远传、庐山文集与历代寺志",
    sourceLocation: "慧远入庐山、建东林与僧俗结誓材料",
    modernCorrespondence: "今江西省九江市庐山西北麓东林寺；现存建筑为历代重修。",
    summary: "慧远长期讲学和组织念佛誓愿的庐山寺院，白莲社与虎溪故事在后世逐层附着。",
    lead: "东林寺一面朝向山林，一面通过书信连着长安、江南与远方译师。慧远不轻易出山，问题和经卷却不断越过山路来到他面前。",
    profile: "慧远在庐山东林寺长期居住，组织僧众、与士人往来，并围绕无量寿佛立誓修行。白莲、十八贤和虎溪三笑的完整组合较晚，应与东晋文书层分开。",
    reception: "后世净土宗尊东林为祖庭，莲社传统持续重建。寺院兴废和地貌变化使现代空间不宜直接承担全部东晋事件。",
    distinction: "东林寺与西林寺为邻近但不同寺院，慧永与慧远活动亦应分别记录。陶渊明、谢灵运是否入社不能只凭后世名画。",
    sourceList: ["《高僧传》慧远传", "庐山结誓与书信材料", "历代东林寺志"],
    sourceNote: "东晋人物和结誓依据早期文本，白莲社图像按宋明以后接受层展示。",
    boundary: "可用于山中共同体、书信与访客剧情；固定十八人同时聚会若采用后世名单，须注明。",
    sourceRef: "bs:gaoseng-zhuan-group",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《高僧传》卷六慧远传"
  }),
  sacredLocation({
    key: "shaolin-temple",
    title: "嵩山少林寺",
    historicalPeriod: "北魏建寺，隋唐以后与达摩禅宗祖庭记忆逐步结合",
    sourceTitle: "北朝碑刻、《续高僧传》及唐宋禅宗史料",
    sourceLocation: "跋陀建寺记忆、达摩游化嵩洛与后世面壁传说",
    modernCorrespondence: "今河南省登封市嵩山少室山少林寺；现存建筑多经后世重建。",
    summary: "北魏以来的嵩山寺院，后世成为达摩面壁和禅宗初祖的重要祖庭，也另有武术史层。",
    lead: "少林寺的历史比达摩面壁故事更早，也比一套武术传奇更宽。北魏寺院、翻译僧跋陀、达摩记忆、唐代军事碑刻和后世拳法在同一地点叠了许多层。",
    profile: "少林寺创建于北魏，早期与跋陀等僧人相关。《续高僧传》只说达摩游化嵩洛，少林面壁九年的完整定位见于后出禅史。",
    reception: "宋以后少林作为禅宗祖庭的形象加强，近世武术声名又覆盖全球。佛教、寺产、军事与武术材料需要分别建页连接。",
    distinction: "少林寺不是达摩亲自创建，达摩也不能凭后世传说认定为少林拳创始人。面壁洞、塔林与主寺院是不同空间对象。",
    sourceList: ["北魏少林寺建置材料", "《续高僧传》菩提达摩传", "唐宋禅宗祖传", "少林寺碑刻"],
    sourceNote: "早期建寺与达摩传说分层，武术史不并入禅宗事实栏。",
    boundary: "可作为多重历史争夺同一地点的场景；若写达摩授拳或寺僧统一武装制度，必须标后传或原创。",
    sourceRef: "bs:gaoseng-zhuan-group",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《续高僧传》达摩传与少林寺碑刻"
  }),
  sacredLocation({
    key: "caoxi-baolin-temple",
    title: "曹溪宝林寺（南华寺）",
    historicalPeriod: "唐代慧能教化地点，后世更名、扩建并形成六祖祖庭",
    sourceTitle: "《六祖坛经》、唐代碑铭与《宋高僧传》",
    sourceLocation: "《坛经》曹溪说法与示寂段；六祖碑铭",
    modernCorrespondence: "今广东省韶关市曲江区南华寺；唐代宝林寺范围与现存格局不同。",
    summary: "慧能长期弘法并形成身后祖师记忆的曹溪寺院，宝林寺与南华寺名称需按时代使用。",
    lead: "曹溪在慧能生前是一处南方讲法地点，在神会和《坛经》之后却成为整个禅宗正统叙事的地理中心。名字从宝林到南华变化，祖师记忆也随殿宇不断扩建。",
    profile: "《坛经》和碑传把慧能教化、说戒与示寂同曹溪相连。寺院在后世获赐额、重修并供奉肉身像，今日建筑和唐代活动空间不可直接重叠。",
    reception: "曹溪成为六祖祖庭，来自各地的禅僧朝礼，“曹溪一滴”也成为法脉隐喻。不同《坛经》版本对寺名和事件叙述略有差异。",
    distinction: "宝林寺、南华寺是同地不同历史称名，但不等于所有“宝林寺”。大梵寺讲法发生在韶州城中，不能全部放入曹溪。",
    sourceList: ["敦煌本及后世本《坛经》", "唐代六祖碑铭", "《宋高僧传》慧能传", "南华寺历代碑志"],
    sourceNote: "寺名按年代标注，肉身与建筑另用物质文化层；《坛经》版本差异保留。",
    boundary: "可写祖庭如何在人物身后形成；若复原唐代寺院布局或肉身保存全过程，应标推测。",
    sourceRef: "b3s:platform-sutra",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《六祖坛经》曹溪相关段及唐代碑铭"
  }),
  sacredLocation({
    key: "jingye-temple",
    title: "终南山净业寺",
    historicalPeriod: "唐代道宣律学与戒坛记忆重地，历代重修",
    sourceTitle: "道宣戒坛铭、律学著述与寺院碑志",
    sourceLocation: "《净业寺戒坛铭》及终南山道宣活动材料",
    modernCorrespondence: "今陕西省西安市长安区终南山净业寺；古代寺域与现址范围需分层。",
    summary: "道宣居山研律和建立戒坛记忆的重要地点，后世尊为南山律宗祖庭。",
    lead: "净业寺的山路把律学带离了喧闹城门，却没有让它脱离现实。受戒、结界、僧众往来和文书整理都在这里发生，终南山因而不仅是隐居背景，也是制度实验场。",
    profile: "道宣在终南山活动并撰律学著作，戒坛铭保存建坛与舍利记忆。寺院名称、位置和建筑历经变化，现址只作为后世连续性的一个节点。",
    reception: "南山律宗以净业寺为祖庭，道宣塔、戒坛与韦驮感通故事吸引礼祖。日本等地律学追溯道宣，却不表示所有授戒都在此发生。",
    distinction: "净业寺与至相寺同在终南山地区但不是一寺；道宣也曾在长安多寺活动，不能把全部著述写于同一房间。",
    sourceList: ["道宣《净业寺戒坛铭》", "《四分律行事钞》题记", "终南山寺院碑志"],
    sourceNote: "戒坛和居处用道宣自述、碑铭核实；神圣舍利与天人故事另标信仰层。",
    boundary: "适合写山寺如何处理具体制度问题；戒坛机关、密道和超自然守护若添加，须标原创。",
    sourceRef: "b3s:sifen-xingshi-chao",
    sourceEvidenceType: "historical-record",
    sourceCitation: "道宣《大唐雍州长安县清官乡净业寺戒坛铭》"
  }),
  sacredLocation({
    key: "qinglong-temple",
    title: "长安青龙寺",
    historicalPeriod: "唐代密教灌顶与跨国求法重地，后世遗址与复建并存",
    sourceTitle: "惠果碑、空海行状与唐代长安寺院记录",
    sourceLocation: "惠果住青龙寺、授空海灌顶与示寂材料",
    modernCorrespondence: "今陕西省西安市青龙寺遗址及复建寺院；唐代寺域范围另据考古。",
    summary: "惠果主持灌顶并接待空海等求法僧的长安寺院，是唐代密教跨地域传播节点。",
    lead: "青龙寺最重要的不是一间神秘密室，而是不同语言的人能在这里共同学习。图像、梵字、手印和口授让翻译超出纸面，也让短暂相遇产生跨海影响。",
    profile: "惠果在青龙寺东塔院等处活动，空海于805年受灌顶并撰行状。寺院唐以后兴废，现代复建与遗址展示不能充作全部唐代空间。",
    reception: "日本真言宗长期纪念青龙寺传法，近现代中日交流又推动遗址研究与复建。唐代本土弟子和其他外国僧同样属于网络。",
    distinction: "青龙寺不是大兴善寺，也不是所有开元三大士共同长期住锡的唯一中心。空海受法是重要一线，不等于惠果只有一名弟子。",
    sourceList: ["空海《惠果和尚行状》", "《惠果和尚之碑》", "唐长安寺院记录", "青龙寺考古材料"],
    sourceNote: "用行状和碑文确认传法，用考古区分遗址与复建；不虚构坛场房间坐标。",
    boundary: "适合写跨语言学习与限时传法；曼荼罗位置、灌顶流程和私密对白若无原文，应标推测或原创。",
    sourceRef: "b3s:dainichi-commentary",
    sourceEvidenceType: "historical-record",
    sourceCitation: "空海《惠果和尚行状》及《惠果和尚之碑》"
  })
];

function sourceText(row) {
  return {
    workType: "佛典",
    rightsStatus: "古籍原文",
    ...row
  };
}

const sourceRows = [
  sourceText({
    key: "maha-zhiguan",
    title: "《摩诃止观》",
    formationPeriod: "隋开皇十四年前后智顗讲说，灌顶记录整理，后世续有校订注释",
    edition: "大正藏本并参历代刊本",
    volumeSection: "十卷，卷首题记及十境十乘观法",
    sourceLayer: "注疏",
    summary: "智顗讲说、灌顶记录的天台止观巨著，现存十卷保留已讲部分与未竟结构。",
    lead: "《摩诃止观》开头先说明它怎样被讲、怎样被记，也坦白原定结构没有全部讲完。这个未完成状态不是缺陷遮掩，反而让读者看见一场大型讲席真实留下的边缘。",
    profile: "全书以圆顿止观为核心，铺陈发大心、行大行、感大果等纲目，实际详讲十境十乘中的部分内容。智顗口说与灌顶整理共同构成文本，后人又通过湛然等注疏继续解释。",
    reception: "它成为天台修观和教义研究的核心书，也影响日本天台及后世禅观讨论。许多现代概括只摘“一念三千”等名句，阅读时仍需回到卷次和观法语境。",
    distinction: "《摩诃止观》不是释迦直接说出的经，也不是灌顶个人独著。现存文字、讲说现场与后世注本三者不能无说明地互换。",
    sourceList: ["《摩诃止观》卷一至卷十", "卷首智顗说、灌顶记题署", "湛然《止观辅行传弘决》"],
    sourceNote: "引用标卷次与段落，保留讲说者、记录者和注释者身份；公开页不嵌外部链接。",
    boundary: "可摘录必要短句并另写今译，长段正文仅作内部校读；创作化修法效果须标项目原创。"
  }),
  sourceText({
    key: "huayan-tanxuan",
    title: "《华严经探玄记》",
    formationPeriod: "唐代法藏据六十卷《华严经》撰成",
    edition: "大正藏本并参宋元明刊本",
    volumeSection: "二十卷，各品解释及卷一教起、藏部、宗趣",
    sourceLayer: "注疏",
    summary: "法藏解释六十卷《华严经》的二十卷大疏，是五教、十玄与法界缘起的重要文本。",
    lead: "《探玄记》不是从第一句经文立刻开讲。法藏先问这部经为何出现、属于哪类教、以什么为宗趣，再进入逐品解释；一套宗派语言正是在这些前置问题里被搭起来。",
    profile: "全书依佛陀跋陀罗六十卷译本作疏，广引经论和前代解释，讨论教判、行位、六相十玄等。它早于澄观针对八十卷本的大疏，两者不能按同一卷页互引。",
    reception: "《探玄记》确立法藏华严学的系统面貌，东亚华严研究长期依赖。后世贤首宗常以其概念概括全宗，但智俨、澄观、宗密各有增改。",
    distinction: "书中“阿含”常指所闻教法，不可总按四阿含经理解。标题的“玄”是探究深义，不表示秘传或占卜。",
    sourceList: ["《华严经探玄记》卷一至卷二十", "六十卷《华严经》", "法藏其他华严章疏"],
    sourceNote: "引文同时标明所释经本和卷品，避免用八十卷品次替换；公开内容均为项目重新表述。",
    boundary: "可将缘起结构转化为剧情灵感，但不得把注疏概念伪装成古代自然科学定律。"
  }),
  sourceText({
    key: "weishi-shuji",
    title: "《成唯识论述记》",
    formationPeriod: "唐代窥基据玄奘译《成唯识论》讲习撰述",
    edition: "大正藏本并参东亚传本",
    volumeSection: "十卷，随《成唯识论》逐段疏解",
    sourceLayer: "注疏",
    summary: "窥基解释《成唯识论》的十卷疏记，保存玄奘新译唯识术语及慈恩学系判断。",
    lead: "读《述记》像进入一张高密度的讨论现场。短短一句论文本后，窥基会列出名义、来源、异说和难问；读者必须慢下来，才看得见“唯识”并不是一句口号。",
    profile: "《成唯识论》本身由玄奘综合护法等十家释论译成，窥基《述记》再对文解释，涉及八识、三性、种子、五位等。它也记录与其他论师不同的取舍。",
    reception: "慈恩法相学以《述记》为核心，日本法相宗尤其重视。慧沼《了义灯》等后续著作又为它辩护或补释，形成多层注疏链。",
    distinction: "《述记》不是《成唯识论》原文，也不是印度十家释论的逐字全译。窥基的说明具有宗派立场，不能替代所有唯识传统。",
    sourceList: ["玄奘译《成唯识论》", "窥基《成唯识论述记》", "慧沼《成唯识论了义灯》"],
    sourceNote: "引用时分清论本与述记，异说标作者；不摘用现代网站解释作为公开正文。",
    boundary: "适合为记忆、认知与自我叙事提供概念坐标；任何超能力化设定须标原创。"
  }),
  sourceText({
    key: "guanjing-shu",
    title: "《观无量寿佛经疏》",
    formationPeriod: "唐代善导集记，通常分玄义、序分、定善、散善四部分",
    edition: "大正藏善导本并参历代净土宗刊本",
    volumeSection: "四卷四帖，重点为玄义分与散善义",
    sourceLayer: "注疏",
    summary: "善导解释《观无量寿佛经》的核心著作，以定散二善、本愿与凡夫往生建立净土门径。",
    lead: "善导在卷首先不急着逐字解释，而是列出七门料简，先回答这部经为何而说、面向怎样的人、观想与日常善行怎样相接。读者因此知道他正在和哪些旧解释分岔。",
    profile: "四帖疏依次处理玄义、序分、定善十三观与散善九品，强调韦提希请法、阿弥陀愿力和凡夫往生。文本中引经、问答与礼赞交错，需要按段落辨别。",
    reception: "《观经疏》在中国长期流传，日本法然、亲鸾等尤其重视，反过来又推动近现代汉地重读。不同净土宗派对“正定业”等术语解释不全相同。",
    distinction: "本书不是智顗题《观经疏》，两部同名注疏必须用作者区分。善导解释也不是《观经》唯一传统答案。",
    sourceList: ["善导《观经玄义分》", "《观经序分义》", "《观经定善义》", "《观经散善义》"],
    sourceNote: "内部书目统一写“善导《观无量寿佛经疏》”，避免与智顗题本混淆。",
    boundary: "可用于角色愿行、临终与共同礼赞的设计；极乐世界的新增地理和人物须标原创。"
  }),
  sourceText({
    key: "lengqie-shizi",
    title: "《楞伽师资记》",
    formationPeriod: "唐景龙年间净觉编述，敦煌写本保存",
    edition: "敦煌写本校录并参大正藏本",
    volumeSection: "一卷，从求那跋陀罗至神秀的师资叙述",
    sourceLayer: "史料记录",
    summary: "唐初禅史著作，以《楞伽经》组织求那跋陀罗至神秀的传承，是东山与北宗祖统的重要见证。",
    lead: "《楞伽师资记》写下的是禅宗正统尚未定于慧能之前的一种过去。它从译经僧求那跋陀罗起笔，最终落到神秀，让读者看见后来被遮住的另一条祖统。",
    profile: "净觉在八世纪初汇集师说和前代材料，排列达摩、慧可、道信、弘忍、神秀等，并突出《楞伽经》与观心法。僧璨等位置和后世六祖谱并不完全相同。",
    reception: "敦煌本重见后，本书成为重建早期禅史的关键材料，也说明“北宗”并非后世描述的简单失败者。文本仍有编者立场，不能当逐代档案汇编。",
    distinction: "《楞伽师资记》不是《楞伽经》注疏，也不等同宋代《景德传灯录》。其中谱系证明八世纪初的记忆，不自动证明每一代传法细节。",
    sourceList: ["《楞伽师资记》敦煌本", "《续高僧传》达摩、慧可、法冲等传", "唐代神秀碑铭"],
    sourceNote: "用作祖统最早可见层，并与《坛经》南宗版本并列；公开页不复制校录正文。",
    boundary: "可为多版本宗门史提供叙事冲突；若把谱系空白写成确定密会，须标原创。"
  }),
  sourceText({
    key: "platform-sutra",
    title: "《六祖坛经》",
    formationPeriod: "唐代曹溪教说与神会系记忆为基础，敦煌本至宋元刊本持续增订",
    edition: "敦煌本、惠昕本与宗宝本分层对读",
    volumeSection: "行由、般若、定慧、坐禅、顿渐、付嘱等篇；版本篇目不同",
    sourceLayer: "异文",
    summary: "围绕慧能生平、说戒与禅法形成的汉文佛典，不同版本清楚呈现祖师记忆的长期改写。",
    lead: "《坛经》最值得注意的不只是写了什么，也包括后来多了什么。敦煌写本较短，宋元本篇目更整齐、故事更饱满；文本成长本身就是禅宗取得正统位置的一部分。",
    profile: "各本共同保存慧能行由、般若与无念等教说，但偈语、传衣、弟子问答和付嘱细节存在差异。它兼具说法记录、祖师传与宗门经典性质。",
    reception: "《坛经》成为禅宗最具影响力的汉文经典之一，塑造慧能、神秀、弘忍和神会形象。后世注本、戏曲与大众读物又继续选择性放大。",
    distinction: "不能把宗宝本全部内容无说明地称作慧能逐字口述，也不能因为文本增订就否定所有早期资料。作者、记录者和编者问题保持开放。",
    sourceList: ["敦煌本《南宗顿教最上大乘摩诃般若波罗蜜经六祖惠能大师于韶州大梵寺施法坛经》", "惠昕本", "宗宝本《六祖大师法宝坛经》"],
    sourceNote: "所有关系注明采用版本；偈语和传衣叙事至少区分敦煌本与后世本。",
    boundary: "可引用少量公版原文并配项目今译；版本拼接或新增公案必须清楚标注。"
  }),
  sourceText({
    key: "sifen-xingshi-chao",
    title: "《四分律删繁补阙行事钞》",
    formationPeriod: "唐初道宣据《四分律》及诸律论撰成，后世广为注释",
    edition: "大正藏本并参宋元律学刊本",
    volumeSection: "上中下三卷，分众集、受戒、安居、衣药等行事门",
    sourceLayer: "注疏",
    summary: "道宣把大部律文整理为汉地僧团可按场景检索的行事指南，是南山律学核心著作。",
    lead: "《行事钞》的书名已经说明方法：删去重复，补足实践中必须交代的环节，再按一件件僧事重新排布。它不是缩写律藏，而是让制度在具体日常里可执行。",
    profile: "全书综合《四分律》、其他部律和论疏，讨论僧团集会、受戒、安居、自恣、衣食药物、瞻病与丧葬等。道宣判断有明确汉地律学立场。",
    reception: "后世南山律宗以行事钞为核心，形成多层记、资持等注释，并影响东亚受戒和寺院生活。实际清规仍会因时代、地域而调整。",
    distinction: "行事钞不是佛陀直接说的律文，也不等于所有佛教部派戒律。删繁补阙是道宣的解释工程，不可掩去所引原律差异。",
    sourceList: ["《四分律》", "《四分律删繁补阙行事钞》", "道宣羯磨与戒坛著述", "后世南山律注疏"],
    sourceNote: "引用同时标原律与钞文层，现代寺院制度不反写为唐代原规。",
    boundary: "可为共同体规则和伦理冲突提供参考；不得直接替代现实宗教或法律建议。"
  }),
  sourceText({
    key: "dainichi-commentary",
    title: "《大毗卢遮那成佛经疏》",
    formationPeriod: "唐开元年间善无畏讲释、一行记录整理",
    edition: "大正藏本并参东密传本",
    volumeSection: "二十卷，释《大日经》住心、入真言门与诸品仪轨",
    sourceLayer: "注疏",
    summary: "善无畏讲释、一行记录的《大日经》大疏，保存唐代胎藏真言教学和汉译术语形成。",
    lead: "经文译成汉语以后，许多动作仍在纸外：坛场方位、手印、字音和灌顶次第需要讲释。《大日经疏》正是在这种口授需求中出现，一行把善无畏的说明整理成可传的文字。",
    profile: "疏文解释菩提心、住心品、曼荼罗和真言行，广泛说明梵字与仪轨。讲释者、记录者和后续增修问题需要依题记与版本研究，不宜只署一人。",
    reception: "它成为东亚胎藏密教的重要依据，日本真言与台密保存、注释尤多。汉地唐以后流传起伏，并不表示全部仪轨断绝或始终不变。",
    distinction: "《大日经疏》不是《大日经》原文，也不能当一张可直接照搬的建筑施工图。口传限制与宗教资格应尊重，不把敏感仪轨娱乐化。",
    sourceList: ["《大毗卢遮那成佛神变加持经》", "《大毗卢遮那成佛经疏》", "《开元释教录》相关译记"],
    sourceNote: "引用分经、疏、后世仪轨三层，梵字和手印不凭现代二手图随意补全。",
    boundary: "可提供象征、色彩和仪式结构灵感；任何战斗法术、召唤或传送效果都须标原创。"
  })
];

function relation(key, sourceRef, targetRef, label, sourceCitation, historicalScope, options = {}) {
  return {
    key,
    sourceRef,
    targetRef,
    label,
    kind: options.kind || "custom",
    direction: options.direction || "directed",
    strength: options.strength ?? 4,
    evidenceType: options.evidenceType || "historical-record",
    sourceCitation,
    historicalScope,
    confidence: options.confidence || "certain",
    notes: options.notes || "本边只表达所列年代与文本中的关系，不自动扩展为跨时代唯一谱系。"
  };
}

const schoolLabels = {
  "tiantai-system": "列入天台教观传承",
  "huayan-system": "列入华严祖统与经学传承",
  "faxiang-system": "参与法相唯识学系",
  "pure-land-system": "列入净土实践与祖统",
  "chan-system": "列入禅门师资与祖统",
  "vinaya-system": "列入南山律学及东亚授戒传承",
  "tang-esoteric-system": "参与唐代密教译传网络"
};

const schoolMembershipRows = figureRows.map((row) => relation(
  `school-membership-${row.key}`,
  `b3:${row.key}`,
  `b3:${row.schoolKey}`,
  schoolLabels[row.schoolKey],
  row.sourceCitation,
  `${row.historicalLayer}人物活动与后世宗派编排层`,
  {
    kind: "member",
    evidenceType: "textual-variant",
    confidence: "probable",
    notes: "成员边表示该人物在相关学系中的历史作用或后世祖位；不把后起宗派名称强加为人物生前自称。"
  }
));

const tiantaiRelationRows = [
  relation("huiwen-teaches-huisi", "b3:huiwen", "b3:huisi", "师承见于慧思本传", "《续高僧传》卷十七慧思传", "北齐禅学师承层", { kind: "teacher", confidence: "probable", notes: "本传明确慧思投慧文受法，所授完整教目多由后世天台祖传补足。" }),
  relation("huisi-teaches-zhiyi", "b3:huisi", "b3:zhiyi", "历史师徒与法华禅观传授", "《续高僧传》卷十七慧思、智顗传", "陈代大苏山受学层", { kind: "teacher", strength: 5 }),
  relation("zhiyi-teaches-guanding", "b3:zhiyi", "b3:guanding", "师徒与讲说记录", "《摩诃止观》《法华玄义》卷首题记", "陈隋天台讲席层", { kind: "teacher", strength: 5, evidenceType: "primary-text", notes: "灌顶既是弟子也是记录整理者，关系不缩减为单纯笔受。" }),
  relation("zhiyi-zhanran-doctrinal", "b3:zhiyi", "b3:zhanran", "隔代著述祖承", "湛然《法华玄义释签》《止观辅行传弘决》", "唐代天台注疏复兴层", { kind: "teacher", evidenceType: "scholarly-inference", confidence: "certain", notes: "二人并非同时代师徒，此边表示湛然以注疏承接智顗。" }),
  relation("guanding-records-zhiguan", "b3:guanding", "b3s:maha-zhiguan", "记录并整理讲说", "《摩诃止观》卷首“门人灌顶记”", "隋代文本形成层", { kind: "source", strength: 5, evidenceType: "primary-text" }),
  relation("zhanran-comments-zhiguan", "b3:zhanran", "b3s:maha-zhiguan", "以辅行记续释止观", "《止观辅行传弘决》", "唐代注疏层", { kind: "source", evidenceType: "primary-text" }),
  relation("tiantai-lotus-foundation", "b3:tiantai-system", "bs:lotus-sutra", "核心经教依据但非唯一文本", "《法华玄义》《法华文句》", "隋唐天台教判层", { kind: "source", evidenceType: "primary-text", notes: "天台还广引般若、涅槃等经论，不能称只读《法华经》。" })
];

const huayanRelationRows = [
  relation("dushun-zhiyan-lineage", "b3:dushun", "b3:zhiyan", "华严祖统追认的前后承接", "唐宋华严祖传", "后世华严五祖谱层", { kind: "teacher", evidenceType: "textual-variant", confidence: "probable", notes: "表示祖统中的承接，直接从学细节不如智俨与法藏清楚。" }),
  relation("zhiyan-teaches-fazang", "b3:zhiyan", "b3:fazang", "历史师徒与华严经学传授", "法藏传记及智俨著述传承记", "唐初终南山讲学层", { kind: "teacher", strength: 5 }),
  relation("fazang-chengguan-doctrinal", "b3:fazang", "b3:chengguan", "隔代华严疏学祖承", "澄观《华严经疏》引前代诸师", "中唐重释八十卷华严层", { kind: "teacher", evidenceType: "scholarly-inference", notes: "二人非直接师徒，澄观是在新经本上承接并改造法藏系统。" }),
  relation("chengguan-teaches-zongmi", "b3:chengguan", "b3:zongmi", "历史师徒与华严疏钞传授", "《宋高僧传》澄观、宗密传", "中晚唐华严讲学层", { kind: "teacher", strength: 5 }),
  relation("fazang-authors-tanxuan", "b3:fazang", "b3s:huayan-tanxuan", "撰述者", "《华严经探玄记》各卷题署", "唐代六十卷华严注疏层", { kind: "source", strength: 5, evidenceType: "primary-text" }),
  relation("tanxuan-comments-avatamsaka", "b3s:huayan-tanxuan", "bs:avatamsaka-sutra", "解释六十卷华严译本", "《华严经探玄记》卷次与所释品", "唐代六十卷华严文本层", { kind: "source", strength: 5, evidenceType: "primary-text", notes: "不直接对应八十卷本卷页，引用必须标经本。" }),
  relation("huayan-vairocana-interpretation", "b3:huayan-system", "b:vairocana", "以华严佛身解释毗卢遮那", "《探玄记》及澄观华严疏", "隋唐华严教理层", { kind: "teacher", evidenceType: "scholarly-inference", confidence: "probable", notes: "这是宗派解释关系，不把毗卢遮那与历史释迦页面强制合并。" }),
  relation("chengguan-wutai", "b3:chengguan", "b2:wutai-mountain", "长期讲学与清凉名号来源", "《宋高僧传》澄观传及五台山传记", "唐代五台华严讲学层", { kind: "located", strength: 5 })
];

const faxiangRelationRows = [
  relation("xuanzang-teaches-kuiji", "b:xuanzang", "b3:kuiji", "历史师徒与译场教学", "《宋高僧传》卷四窥基传", "唐高宗时期慈恩译场层", { kind: "teacher", strength: 5 }),
  relation("xuanzang-woncheuk-learning", "b:xuanzang", "b3:woncheuk", "共享玄奘新译与长安讲学环境", "圆测传、《解深密经疏》与玄奘译籍", "七世纪长安唯识学层", { kind: "teacher", evidenceType: "scholarly-inference", confidence: "probable", notes: "直接亲授程度存在传记差异，不据后世竞争故事设为秘密师徒。" }),
  relation("kuiji-huizhao-lineage", "b3:kuiji", "b3:huizhao", "慈恩唯识的隔代学统承接", "《成唯识论了义灯》对《述记》的续申", "唐代慈恩注疏层", { kind: "teacher", evidenceType: "scholarly-inference", confidence: "probable", notes: "表示著述学统，不必然证明长期面对面受学。" }),
  relation("kuiji-authors-shuji", "b3:kuiji", "b3s:weishi-shuji", "撰述者", "《成唯识论述记》各卷题署", "唐代慈恩唯识注疏层", { kind: "source", strength: 5, evidenceType: "primary-text" }),
  relation("faxiang-dacien", "b3:faxiang-system", "b3:daci-en-temple", "译经与慈恩学系核心地点", "《大唐大慈恩寺三藏法师传》及窥基传", "七世纪长安寺院学术层", { kind: "located", strength: 5 }),
  relation("woncheuk-kuiji-parallel", "b3:woncheuk", "b3:kuiji", "同代唯识解释分流", "《解深密经疏》《成唯识论述记》及后续论疏互证", "唐代西明、慈恩学系并行层", { kind: "disputed", direction: "mutual", evidenceType: "scholarly-inference", confidence: "certain", notes: "二者并非简单胜负或正邪关系，具体差异按论题连接。" }),
  relation("shuji-xuanzang-translation", "b3s:weishi-shuji", "b:xuanzang", "以玄奘译论为疏释底本", "《成唯识论》译记与《述记》卷次", "唐代新译唯识文本层", { kind: "source", strength: 5, evidenceType: "primary-text" }),
  relation("huizhao-critiques-woncheuk", "b3:huizhao", "b3:woncheuk", "论疏中批评西明异解", "慧沼《成唯识论了义灯》", "唐代唯识宗义争论层", { kind: "rival", evidenceType: "primary-text", confidence: "certain", notes: "只表示文本观点冲突，不推导两人当面敌对或私人恩怨。" })
];

const pureLandRelationRows = [
  relation("huiyuan-donglin", "b3:lushan-huiyuan", "b3:donglin-temple", "长期居寺并组织山中共同体", "《高僧传》卷六慧远传", "东晋庐山佛教层", { kind: "located", strength: 5 }),
  relation("tanluan-daochuo-lineage", "b3:tanluan", "b3:daochuo", "玄中寺记忆与思想祖承", "《续高僧传》道绰传及《安乐集》", "北魏至隋唐净土承接层", { kind: "teacher", evidenceType: "scholarly-inference", confidence: "certain", notes: "二人并非同时代直接师徒，道绰承接的是著述和遗迹。" }),
  relation("daochuo-teaches-shandao", "b3:daochuo", "b3:shandao", "历史师徒与净土教学", "唐宋僧传善导、道绰材料", "唐初净土师承层", { kind: "teacher", strength: 5 }),
  relation("chengyuan-teaches-fazhao", "b3:chengyuan", "b3:fazhao", "南岳参学师承", "《宋高僧传》承远、法照传", "中唐南岳净土层", { kind: "teacher", strength: 5 }),
  relation("shandao-influences-chengyuan", "b3:shandao", "b3:chengyuan", "隔代净土实践与祖统影响", "净土祖传及承远传记", "唐代净土实践扩展层", { kind: "teacher", evidenceType: "scholarly-inference", confidence: "probable", notes: "表示法门和后世祖统承接，不称直接会面。" }),
  relation("amitabha-pureland-system", "b:amitabha", "b3:pure-land-system", "本尊与往生愿行核心", "净土三经及历代注疏", "佛典神圣叙事与汉地实践层", { kind: "teacher", evidenceType: "primary-text", strength: 5 }),
  relation("pureland-infinite-life", "b3:pure-land-system", "bs:infinite-life-sutra", "核心经典入口之一", "《佛说无量寿经》及净土祖师注疏", "汉译净土经典层", { kind: "source", strength: 5, evidenceType: "primary-text" }),
  relation("huiyuan-amitabha-vow", "b3:lushan-huiyuan", "b:amitabha", "在无量寿佛前立誓修行", "庐山结誓材料与《高僧传》慧远传", "东晋念佛三昧共同体层", { kind: "devotion", strength: 5 }),
  relation("fazhao-wutai", "b3:fazhao", "b2:wutai-mountain", "五台修行与竹林寺感应叙事", "《宋高僧传》法照传", "中唐五台净土感应层", { kind: "located", evidenceType: "historical-record", confidence: "probable", notes: "法照赴五台可作历史行迹，入圣寺见文殊属于传记神圣叙事。" }),
  relation("shandao-authors-guanjing", "b3:shandao", "b3s:guanjing-shu", "撰述并建立四帖解释", "善导《观无量寿佛经疏》", "唐代净土注疏层", { kind: "source", strength: 5, evidenceType: "primary-text" })
];

const chanRelationRows = [
  relation("bodhidharma-teaches-huike", "b3:bodhidharma", "b3:huike", "早期传记明确的师徒", "《续高僧传》卷十六达摩、僧可传", "北魏至东魏禅学师承层", { kind: "teacher", strength: 5 }),
  relation("huike-sengcan-lineage", "b3:huike", "b3:sengcan", "后世祖统列为付法承接", "《楞伽师资记》及后出祖传", "唐代追述六世纪祖统层", { kind: "teacher", evidenceType: "textual-variant", confidence: "probable", notes: "僧璨材料稀少，不把后世完整对白视为同期记录。" }),
  relation("sengcan-daoxin-lineage", "b3:sengcan", "b3:daoxin", "后世祖统列为师徒", "《楞伽师资记》及唐宋祖传", "唐代禅宗祖统层", { kind: "teacher", evidenceType: "textual-variant", confidence: "probable" }),
  relation("daoxin-teaches-hongren", "b3:daoxin", "b3:hongren", "东山法门历史师承", "《楞伽师资记》道信、弘忍章", "唐初黄梅僧团层", { kind: "teacher", strength: 5 }),
  relation("hongren-teaches-shenxiu", "b3:hongren", "b3:shenxiu", "东山法门历史师徒", "《楞伽师资记》神秀章与张说碑", "唐初至武周北方禅学层", { kind: "teacher", strength: 5 }),
  relation("hongren-huineng-transmission", "b3:hongren", "b3:huineng", "南宗传统的传衣付法", "敦煌本及后世本《六祖坛经》", "八世纪曹溪祖统叙事层", { kind: "teacher", strength: 5, evidenceType: "textual-variant", confidence: "probable", notes: "慧能从弘忍受学可采，夜授衣法和唯一继承人地位按《坛经》版本标注。" }),
  relation("huineng-teaches-shenhui", "b3:huineng", "b3:shenhui", "曹溪门下师承", "神会语录、碑传及《坛经》", "唐代曹溪与荷泽传承层", { kind: "teacher", strength: 5 }),
  relation("huineng-shenxiu-lineage-rivalry", "b3:huineng", "b3:shenxiu", "身后南北宗正统竞争", "神会语录、《坛经》及神秀碑传对读", "八世纪祖统论争层", { kind: "rival", direction: "mutual", evidenceType: "textual-variant", confidence: "certain", notes: "竞争主要在二人身后展开，不构造本人当面对决。" }),
  relation("shenhui-panjiao-lineage", "b3:shenhui", "b3:panjiao-lineages", "公开推动曹溪正统叙事", "敦煌神会语录与滑台论辩记忆", "唐开元以后南宗定是非层", { kind: "influence", strength: 5 }),
  relation("mazu-teaches-baizhang", "b3:mazu-daoyi", "b3:baizhang-huaihai", "洪州禅历史师徒", "《宋高僧传》怀海传及《景德传灯录》卷六", "中唐江西禅门层", { kind: "teacher", strength: 5 }),
  relation("huineng-mazu-lineage", "b3:huineng", "b3:mazu-daoyi", "经南岳怀让形成的隔代祖统", "唐宋禅宗祖传与马祖碑传", "中晚唐曹溪至洪州谱系层", { kind: "teacher", evidenceType: "textual-variant", confidence: "probable", notes: "中间有怀让，不能画成慧能直接教授马祖。" }),
  relation("bodhidharma-shaolin", "b3:bodhidharma", "b3:shaolin-temple", "后世固定为面壁祖庭", "《续高僧传》游化嵩洛与唐宋禅史对读", "宋代以后少林达摩记忆层", { kind: "located", evidenceType: "textual-variant", confidence: "probable", notes: "早期僧传未写少林九年，地点关联按形成层标注。" }),
  relation("huineng-caoxi", "b3:huineng", "b3:caoxi-baolin-temple", "长期弘法与祖庭记忆", "《六祖坛经》及唐代碑铭", "唐代曹溪教化层", { kind: "located", strength: 5 }),
  relation("baizhang-institutionalizes-chan", "b3:baizhang-huaihai", "b3:chan-system", "禅居制度集中归名百丈", "《宋高僧传》卷十怀海传", "唐宋禅院制度记忆层", { kind: "leader", evidenceType: "historical-record", confidence: "probable", notes: "表示制度转折记忆，不认定后世整部清规为怀海亲撰。" }),
  relation("chan-lengqie-source", "b3:chan-system", "b3s:lengqie-shizi", "早期东山与北宗祖统见证", "《楞伽师资记》", "八世纪初禅宗史料层", { kind: "source", strength: 5, evidenceType: "primary-text" }),
  relation("chan-platform-source", "b3:chan-system", "b3s:platform-sutra", "曹溪南宗教说与祖统见证", "敦煌本及后世本《坛经》", "八至十三世纪文本演变层", { kind: "source", strength: 5, evidenceType: "textual-variant" }),
  relation("mahakasyapa-bodhidharma-sacred-lineage", "b:mahakasyapa", "b3:bodhidharma", "禅宗神圣付法谱跨二十八祖承接", "唐宋禅宗付法祖统", "后世神圣谱系层", { kind: "teacher", evidenceType: "textual-variant", confidence: "disputed", notes: "两人之间跨越多代，本边只表示禅宗谱系首尾，不是直接师徒或历史会面。" }),
  relation("bodhidharma-shakyamuni-lineage", "b3:bodhidharma", "b:shakyamuni", "后世追溯为释迦心印传承", "禅宗灯录与付法藏谱系", "唐宋禅宗合法性叙事层", { kind: "teacher", direction: "mutual", evidenceType: "textual-variant", confidence: "disputed", notes: "表示宗门自我追溯，不用来证明跨千年的无缺口档案。" })
];

const vinayaRelationRows = [
  relation("upali-vinaya-lineage", "b:upali", "b3:vinaya-system", "持律传统的神圣与经典前源", "汉译阿含、律藏及后世律宗祖统", "早期佛教持律记忆至汉地律学层", { kind: "teacher", evidenceType: "textual-variant", confidence: "probable", notes: "优波离持律第一不表示唐代南山制度由其逐条亲授。" }),
  relation("daoxuan-vinaya-sangha", "b3:daoxuan", "b:vinaya-sangha", "以行事钞整理汉地僧团规范", "道宣《四分律行事钞》", "唐代四分律行事层", { kind: "teacher", strength: 5, evidenceType: "primary-text" }),
  relation("daoxuan-jingye", "b3:daoxuan", "b3:jingye-temple", "终南山居学与戒坛记忆", "道宣《净业寺戒坛铭》", "唐代终南山律学层", { kind: "located", strength: 5 }),
  relation("daoxuan-jianzhen-lineage", "b3:daoxuan", "b3:jianzhen", "隔代南山律学影响", "《唐大和上东征传》及东亚律学谱系", "唐代中日律学承接层", { kind: "teacher", evidenceType: "scholarly-inference", confidence: "probable", notes: "二人非直接师徒，关系经著述和中间师承传递。" }),
  relation("jianzhen-vinaya-system", "b3:jianzhen", "b3:vinaya-system", "将授戒共同体带往日本", "《唐大和上东征传》", "753年以后日本授戒制度层", { kind: "leader", strength: 5 }),
  relation("jianzhen-vinaya-sangha", "b3:jianzhen", "b:vinaya-sangha", "主持东亚僧团授戒", "《唐大和上东征传》及奈良授戒文书", "八世纪日本佛教制度层", { kind: "teacher", strength: 5 }),
  relation("weituo-protects-daoxuan", "b2:weituo", "b3:daoxuan", "感通传中的护律示现", "《道宣律师感通录》《重编诸天传》", "唐宋护律神圣叙事层", { kind: "protector", evidenceType: "textual-variant", confidence: "probable", notes: "表示传记信仰关系，不把韦驮写成可考历史侍从。" })
];

const esotericRelationRows = [
  relation("subhakarasimha-yixing-collaboration", "b3:subhakarasimha", "b3:yixing", "讲释与笔受协作", "《大毗卢遮那成佛经疏》题署", "唐开元《大日经》译释层", { kind: "collaborator", direction: "mutual", strength: 5, evidenceType: "primary-text" }),
  relation("vajrabodhi-teaches-amoghavajra", "b3:vajrabodhi", "b3:amoghavajra", "历史师徒与金刚顶法传授", "《宋高僧传》金刚智、不空传", "唐开元密教师承层", { kind: "teacher", strength: 5 }),
  relation("amoghavajra-teaches-huiguo", "b3:amoghavajra", "b3:huiguo", "灌顶师承与弟子网络", "惠果行状、碑文及不空弟子记", "中晚唐密教传承层", { kind: "teacher", strength: 5 }),
  relation("huiguo-qinglong", "b3:huiguo", "b3:qinglong-temple", "住寺授灌顶", "空海《惠果和尚行状》", "唐贞元青龙寺传法层", { kind: "located", strength: 5 }),
  relation("subhakarasimha-tang-esoteric", "b3:subhakarasimha", "b3:tang-esoteric-system", "主持胎藏系译经与灌顶", "《开元释教录》与《大日经》译记", "唐开元译经层", { kind: "leader", strength: 5 }),
  relation("vajrabodhi-tang-esoteric", "b3:vajrabodhi", "b3:tang-esoteric-system", "传播金刚顶系仪轨", "《开元释教录》金刚智译籍", "唐开元密教层", { kind: "leader", strength: 5 }),
  relation("amoghavajra-tang-esoteric", "b3:amoghavajra", "b3:tang-esoteric-system", "扩建译场、灌顶与护国法会网络", "不空表制及《贞元新定释教目录》", "唐天宝至大历密教制度层", { kind: "leader", strength: 5 }),
  relation("dainichi-vairocana", "b3s:dainichi-commentary", "b:vairocana", "以大毗卢遮那为说法主尊", "《大日经》及《大日经疏》", "唐译真言教理层", { kind: "source", strength: 5, evidenceType: "primary-text", notes: "经疏中的大日如来解释不强制覆盖华严毗卢遮那全部语境。" }),
  relation("esoteric-translation-workshop", "b3:tang-esoteric-system", "b:translation-workshop", "依赖多人译场又超出书面翻译", "《开元释教录》译事与经疏题记", "唐代国家译场层", { kind: "member", evidenceType: "historical-record", notes: "真言口授、笔受、证义和绘制坛样共同参与，不视为单人译著。" }),
  relation("dainichi-subhakarasimha-yixing", "b3s:dainichi-commentary", "b3:subhakarasimha", "保存善无畏讲释", "《大日经疏》题署", "唐开元讲释层", { kind: "source", strength: 5, evidenceType: "primary-text" }),
  relation("huiguo-cross-border-lineage", "b3:huiguo", "b3:panjiao-lineages", "经多国弟子形成跨境付法谱", "惠果行状、碑文与东亚密教祖统", "九世纪以后东亚密教传承层", { kind: "influence", evidenceType: "textual-variant", confidence: "probable", notes: "空海一线重要但不是惠果全部弟子网络。" })
];

const networkRelationRows = [
  relation("tiantai-guoqing-network", "b3:tiantai-system", "b3:guoqing-temple", "祖庭、讲学与礼祖中心", "《国清百录》及天台祖传", "隋唐以后天台制度层", { kind: "located", strength: 5 }),
  relation("huayan-zhixiang-network", "b3:huayan-system", "b3:zhixiang-temple", "终南山早期讲学节点", "智俨、法藏传记与华严祖传", "唐初华严经学层", { kind: "located", strength: 5 }),
  relation("pureland-donglin-network", "b3:pure-land-system", "b3:donglin-temple", "后世净土祖庭与莲社记忆", "《高僧传》慧远传及后世净土祖谱", "东晋实践与宋以后祖庭层", { kind: "located", evidenceType: "textual-variant", confidence: "certain" }),
  relation("chan-shaolin-network", "b3:chan-system", "b3:shaolin-temple", "后世初祖面壁与禅宗祖庭", "唐宋禅史与少林碑志", "宋代以后祖庭定型层", { kind: "located", evidenceType: "textual-variant", confidence: "probable" }),
  relation("chan-caoxi-network", "b3:chan-system", "b3:caoxi-baolin-temple", "曹溪南宗与六祖祖庭", "《坛经》、唐代碑铭及寺志", "唐代以后曹溪祖统层", { kind: "located", strength: 5 }),
  relation("vinaya-jingye-network", "b3:vinaya-system", "b3:jingye-temple", "南山律宗祖庭", "道宣戒坛铭与律学祖传", "唐代以后南山律学层", { kind: "located", strength: 5 }),
  relation("esoteric-qinglong-network", "b3:tang-esoteric-system", "b3:qinglong-temple", "灌顶教学与跨国求法节点", "惠果行状与碑文", "中晚唐长安密教层", { kind: "located", strength: 5 }),
  relation("panjiao-translation-plurality", "b3:panjiao-lineages", "b:translation-workshop", "经本增多推动判教与宗派解释", "南北朝隋唐经录、译场与判教著述", "汉传佛教文本扩张层", { kind: "influence", evidenceType: "scholarly-inference", confidence: "certain", notes: "判教并非仅由译经数量造成，还回应修行、政治与宗门竞争。" })
];

const explicitRelationGroups = [
  tiantaiRelationRows,
  huayanRelationRows,
  faxiangRelationRows,
  pureLandRelationRows,
  chanRelationRows,
  vinayaRelationRows,
  esotericRelationRows,
  networkRelationRows
];
const explicitRelationRows = explicitRelationGroups.flat();
const semanticRelationRows = [...schoolMembershipRows, ...explicitRelationRows];

function timeline(row) {
  return {
    datePrecision: "range",
    ...row
  };
}

const eventRows = [
  timeline({
    key: "flower-sermon-mind-seal",
    trackKey: "mythic-narrative",
    title: "灵山拈花与迦叶微笑被立为禅门心印",
    summary: "后世禅宗以释迦拈花、迦叶微笑说明教外付法；故事不见早期阿含，作为神圣祖统而非佛世实录展示。",
    displayDate: "禅宗付法谱中的灵山法会之时",
    era: "后世禅门神圣叙事时间",
    sortOrder: 410,
    primaryRef: "b:mahakasyapa",
    referenceRefs: ["b:mahakasyapa", "b:shakyamuni", "b3:chan-system", "b3:panjiao-lineages"],
    datePrecision: "custom",
    startValue: "",
    endValue: ""
  }),
  timeline({
    key: "hongren-midnight-robe",
    trackKey: "mythic-narrative",
    title: "弘忍夜授衣法给慧能",
    summary: "《坛经》以偈语、夜讲《金刚经》和密授衣钵构成南宗祖位转折，不同版本细节各异。",
    displayDate: "《坛经》祖师叙事中的黄梅深夜",
    era: "曹溪付法神圣叙事时间",
    sortOrder: 412,
    primaryRef: "b3:huineng",
    referenceRefs: ["b3:huineng", "b3:hongren", "b3:shenxiu", "b3s:platform-sutra"],
    datePrecision: "custom",
    startValue: "",
    endValue: ""
  }),
  timeline({
    key: "southern-iron-stupa",
    trackKey: "mythic-narrative",
    title: "南天铁塔开启并传出金刚顶法",
    summary: "后世密教谱系叙述龙猛开启铁塔、从金刚萨埵受法，用以连接佛陀内证与人间师承；不作历史旅行年表。",
    displayDate: "密教付法谱中的南天铁塔开显之时",
    era: "唐密神圣付法时间",
    sortOrder: 414,
    primaryRef: "b3:tang-esoteric-system",
    referenceRefs: ["b3:tang-esoteric-system", "b:vairocana", "b3:panjiao-lineages", "b3s:dainichi-commentary"],
    datePrecision: "custom",
    startValue: "",
    endValue: ""
  }),

  timeline({
    key: "zhiyi-lectures-maha-zhiguan",
    trackKey: "textual-evidence",
    title: "智顗讲《摩诃止观》，灌顶随讲记录",
    summary: "玉泉寺讲席把圆顿止观组织成十卷文本，现存本也保留原定纲目未全部讲完的痕迹。",
    displayDate: "594年",
    era: "隋开皇十四年天台讲说层",
    sortOrder: 416,
    primaryRef: "b3s:maha-zhiguan",
    referenceRefs: ["b3s:maha-zhiguan", "b3:zhiyi", "b3:guanding", "b2:yuquan-temple"],
    datePrecision: "year",
    startValue: "594",
    endValue: "594"
  }),
  timeline({
    key: "fazang-composes-tanxuan",
    trackKey: "textual-evidence",
    title: "法藏撰《华严经探玄记》",
    summary: "二十卷疏依六十卷华严展开五教、十玄与法界解释，成为贤首华严学的核心坐标。",
    displayDate: "约680至712年",
    era: "武周至唐初华严注疏层",
    sortOrder: 418,
    primaryRef: "b3s:huayan-tanxuan",
    referenceRefs: ["b3s:huayan-tanxuan", "b3:fazang", "b3:huayan-system", "bs:avatamsaka-sutra"],
    startValue: "680",
    endValue: "712"
  }),
  timeline({
    key: "lengqie-shizi-compiled",
    trackKey: "textual-evidence",
    title: "净觉编《楞伽师资记》",
    summary: "书中以求那跋陀罗至神秀组织一条早期禅门师资线，保存后来南宗正统之外的历史记忆。",
    displayDate: "约708年",
    era: "唐景龙年间禅史编述层",
    sortOrder: 420,
    primaryRef: "b3s:lengqie-shizi",
    referenceRefs: ["b3s:lengqie-shizi", "b3:hongren", "b3:shenxiu", "b3:chan-system"],
    datePrecision: "year",
    startValue: "708",
    endValue: "708"
  }),
  timeline({
    key: "dainichi-commentary-recorded",
    trackKey: "textual-evidence",
    title: "善无畏讲释《大日经》，一行记录成疏",
    summary: "经文汉译、口授仪轨和一行笔受共同形成《大日经疏》，说明唐密知识不能只靠译文传递。",
    displayDate: "约724至727年",
    era: "唐开元真言译释层",
    sortOrder: 422,
    primaryRef: "b3s:dainichi-commentary",
    referenceRefs: ["b3s:dainichi-commentary", "b3:subhakarasimha", "b3:yixing", "b3:tang-esoteric-system"],
    startValue: "724",
    endValue: "727"
  }),
  timeline({
    key: "dunhuang-platform-sutra",
    trackKey: "textual-evidence",
    title: "敦煌本《坛经》所代表的早期文本形成",
    summary: "较短的唐写本保存曹溪教说和南宗祖传早期形态，宋元版本后来继续扩写篇目与故事。",
    displayDate: "约780至830年",
    era: "唐代坛经早期传本层",
    sortOrder: 424,
    primaryRef: "b3s:platform-sutra",
    referenceRefs: ["b3s:platform-sutra", "b3:huineng", "b3:shenhui", "b3:hongren"],
    startValue: "780",
    endValue: "830"
  }),

  timeline({
    key: "guoqing-founded",
    trackKey: "religious-institutions",
    title: "智顗遗愿转化为国清寺祖庭",
    summary: "智顗身后，灌顶等依其规划推动建寺，隋廷赐额使天台山讲修传统获得稳定制度地点。",
    displayDate: "约598至605年",
    era: "隋代国清寺创建层",
    sortOrder: 426,
    primaryRef: "b3:guoqing-temple",
    referenceRefs: ["b3:guoqing-temple", "b3:zhiyi", "b3:guanding", "b3:tiantai-system"],
    startValue: "598",
    endValue: "605"
  }),
  timeline({
    key: "daci-en-faxiang-network",
    trackKey: "religious-institutions",
    title: "大慈恩寺译场催生法相唯识注疏网络",
    summary: "玄奘归国后的多人译场与窥基、圆测等讲疏，使同一批新译典籍在长安分出多条解释路线。",
    displayDate: "约645至700年",
    era: "初唐长安唯识学层",
    sortOrder: 428,
    primaryRef: "b3:daci-en-temple",
    referenceRefs: ["b3:daci-en-temple", "b:xuanzang", "b3:kuiji", "b3:woncheuk", "b3:faxiang-system"],
    startValue: "645",
    endValue: "700"
  }),
  timeline({
    key: "zhixiang-huayan-network",
    trackKey: "religious-institutions",
    title: "终南山与长安讲席形成华严经学网络",
    summary: "智俨、法藏等由山寺讲学连接宫廷译场和都市寺院，华严学逐渐拥有著述、祖庭与弟子传承。",
    displayDate: "约650至740年",
    era: "初盛唐华严制度层",
    sortOrder: 430,
    primaryRef: "b3:zhixiang-temple",
    referenceRefs: ["b3:zhixiang-temple", "b3:zhiyan", "b3:fazang", "b3:huayan-system"],
    startValue: "650",
    endValue: "740"
  }),
  timeline({
    key: "shandao-public-nianfo",
    trackKey: "religious-institutions",
    title: "善导将净土称名与礼赞带入长安大众实践",
    summary: "《观经疏》与礼赞仪把经中愿行转为可重复日课，造像写经和公共讲化扩大了参与范围。",
    displayDate: "约640至681年",
    era: "初唐长安净土实践层",
    sortOrder: 432,
    primaryRef: "b3:shandao",
    referenceRefs: ["b3:shandao", "b3:pure-land-system", "b3s:guanjing-shu", "b:amitabha"],
    startValue: "640",
    endValue: "681"
  }),
  timeline({
    key: "daoxuan-nanshan-vinaya",
    trackKey: "religious-institutions",
    title: "道宣整理南山律学与汉地行事体系",
    summary: "行事钞、羯磨和戒坛著述把大部律文按僧团场景重组，终南山由此成为律学祖庭记忆。",
    displayDate: "约624至667年",
    era: "唐初南山律学层",
    sortOrder: 434,
    primaryRef: "b3:daoxuan",
    referenceRefs: ["b3:daoxuan", "b3:vinaya-system", "b3:jingye-temple", "b3s:sifen-xingshi-chao"],
    startValue: "624",
    endValue: "667"
  }),
  timeline({
    key: "baizhang-chan-residence",
    trackKey: "religious-institutions",
    title: "百丈禅居制度成为丛林秩序的共同记忆",
    summary: "怀海门下的僧堂、普请和长老制度在宋代传记中被集中叙述，后世清规再追溯到百丈。",
    displayDate: "约780至900年",
    era: "中晚唐禅院制度形成层",
    sortOrder: 436,
    primaryRef: "b3:baizhang-huaihai",
    referenceRefs: ["b3:baizhang-huaihai", "b3:mazu-daoyi", "b3:chan-system", "b2s:song-gaoseng-biographies"],
    startValue: "780",
    endValue: "900"
  }),

  timeline({
    key: "north-south-lineage-contest",
    trackKey: "cult-evolution",
    title: "神秀与曹溪诸系被重画为南北宗",
    summary: "神秀生前声望极高，神会北上后以顿渐和传衣问题挑战其门下，身后叙事逐渐形成胜负鲜明的两宗图。",
    displayDate: "约700至780年",
    era: "盛唐禅宗祖统论争层",
    sortOrder: 438,
    primaryRef: "b3:panjiao-lineages",
    referenceRefs: ["b3:shenxiu", "b3:huineng", "b3:shenhui", "b3:hongren", "b3:panjiao-lineages"],
    startValue: "700",
    endValue: "780"
  }),
  timeline({
    key: "jianzhen-japan-vinaya",
    trackKey: "cult-evolution",
    title: "鉴真抵达日本并建立新的授戒节点",
    summary: "多次渡海失败后，鉴真与同行僧人于753年抵日，授戒和寺院活动让南山律学进入新的制度环境。",
    displayDate: "753至759年",
    era: "奈良时代中日律学交流层",
    sortOrder: 440,
    primaryRef: "b3:jianzhen",
    referenceRefs: ["b3:jianzhen", "b3:vinaya-system", "b3:daoxuan", "b:vinaya-sangha"],
    startValue: "753",
    endValue: "759"
  }),
  timeline({
    key: "fazhao-five-assembly",
    trackKey: "cult-evolution",
    title: "五会念佛把称名转为公共声乐仪礼",
    summary: "法照结合南岳参学、五台感应与宫廷寺院传播，使由缓至急的五会称名成为可共同参与的法会形式。",
    displayDate: "约770至810年",
    era: "中唐净土仪礼扩展层",
    sortOrder: 442,
    primaryRef: "b3:fazhao",
    referenceRefs: ["b3:fazhao", "b3:chengyuan", "b3:pure-land-system", "b2:wutai-mountain"],
    startValue: "770",
    endValue: "810"
  }),
  timeline({
    key: "huiguo-kukai-transmission",
    trackKey: "cult-evolution",
    title: "青龙寺灌顶经空海传向日本",
    summary: "805年空海从惠果受法并携带经轨、图像与目录归国，青龙寺由此成为东亚密教共同记忆。",
    displayDate: "805至806年",
    era: "唐日密教跨海传承层",
    sortOrder: 444,
    primaryRef: "b3:huiguo",
    referenceRefs: ["b3:huiguo", "b3:qinglong-temple", "b3:tang-esoteric-system", "b3s:dainichi-commentary"],
    startValue: "805",
    endValue: "806"
  }),
  timeline({
    key: "huichang-esoteric-reconfiguration",
    trackKey: "cult-evolution",
    title: "会昌毁佛后唐密网络分散重组",
    summary: "845年前后的寺院与僧籍打击削弱长安灌顶网络，但经轨、陀罗尼和海外传承继续存在，不能写成一夜绝传。",
    displayDate: "约842至900年",
    era: "晚唐密教制度衰变与续传层",
    sortOrder: 446,
    primaryRef: "b3:tang-esoteric-system",
    referenceRefs: ["b3:tang-esoteric-system", "b3:qinglong-temple", "b3:huiguo", "b3:panjiao-lineages"],
    startValue: "842",
    endValue: "900"
  }),
  timeline({
    key: "song-lineage-canons",
    trackKey: "cult-evolution",
    title: "宋代灯录与祖谱把多支学系整理为宗门历史",
    summary: "《景德传灯录》、僧传与各宗祖统把分散师承编成连续谱系，今天熟悉的宗派地图由此进一步稳定。",
    displayDate: "约960至1100年",
    era: "北宋宗派史编纂层",
    sortOrder: 448,
    primaryRef: "b3:panjiao-lineages",
    referenceRefs: ["b3:panjiao-lineages", "b3:chan-system", "b3:huayan-system", "b3:pure-land-system", "b2s:song-gaoseng-biographies"],
    startValue: "960",
    endValue: "1100"
  })
];

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: schoolsEntityId(row.key, worldId),
    worldId,
    type: "character",
    title: row.title,
    slug: `mythology-buddhism-schools-person-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "汉传佛教祖师", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, row.category),
    order,
    templateId: `template:${worldId}:mythology:deity-person`,
    templateData: {
      canonicalName: row.title,
      aliases: row.aliases,
      tradition: row.tradition,
      identityType: row.identityType,
      earliestSource: row.earliestSource,
      sourceLocation: row.sourceLocation,
      narrativeEra: "历史行年、传记神异、后世祖统与宗派追认分别记录。",
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

function buildInstitutionEntity(row, order, worldId, now) {
  return {
    id: schoolsEntityId(row.key, worldId),
    worldId,
    type: row.entityType,
    title: row.title,
    slug: `mythology-buddhism-schools-system-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "汉传佛教宗派制度", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, row.category),
    order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: {
      tradition: row.tradition,
      institutionKind: row.institutionKind,
      hierarchyLevel: row.hierarchyLevel,
      jurisdiction: row.jurisdiction,
      formationPeriod: row.formationPeriod,
      earliestSource: row.earliestSource,
      sourceLocation: row.sourceLocation,
      variants: row.variants,
      confidence: row.confidence
    }
  };
}

function buildLocationEntity(row, order, worldId, now) {
  return {
    id: schoolsEntityId(row.key, worldId),
    worldId,
    type: "location",
    title: row.title,
    slug: `mythology-buddhism-schools-place-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "汉传佛教祖庭地理", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "mythic-geography"),
    order,
    templateId: `template:${worldId}:mythology:sacred-geography`,
    templateData: {
      spaceKind: row.spaceKind,
      tradition: row.tradition,
      historicalPeriod: row.historicalPeriod,
      sourceTitle: row.sourceTitle,
      sourceLocation: row.sourceLocation,
      modernCorrespondence: row.modernCorrespondence,
      confidence: row.confidence,
      mapCaution: "古寺旧址、历代重建、现代院落与祖师传说分图层显示；现址坐标不证明每一段古代叙事发生在同一建筑内。"
    }
  };
}

function buildSourceEntity(row, order, worldId, now) {
  return {
    id: schoolsSourceId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-buddhism-schools-source-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "汉传佛教原典与论疏", "项目自写整理", row.title],
    visibility: "public",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryId(worldId, "primary-sources"),
    order,
    templateId: `template:${worldId}:mythology:source-text`,
    templateData: {
      workTitle: row.title,
      workType: row.workType,
      formationPeriod: row.formationPeriod,
      edition: row.edition,
      volumeSection: row.volumeSection,
      sourceLayer: row.sourceLayer,
      rightsStatus: row.rightsStatus,
      internalCitation: `${row.title} · ${row.volumeSection} · ${row.edition}`,
      reviewStatus: "已核原文"
    }
  };
}

function resolveRef(reference, worldId) {
  const [scope, key] = reference.split(":");
  if (scope === "b3") return schoolsEntityId(key, worldId);
  if (scope === "b3s") return schoolsSourceId(key, worldId);
  if (scope === "b2") return devotionEntityId(key, worldId);
  if (scope === "b2s") return devotionSourceId(key, worldId);
  if (scope === "b") return transmissionEntityId(key, worldId);
  if (scope === "bs") return transmissionSourceId(key, worldId);
  throw new Error(`未知佛教宗派批次引用：${reference}`);
}

function buildRelation(row, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:buddhism-schools:${row.key}`,
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

function buildSourceRelation(row, kind, worldId, now) {
  return buildRelation(relation(
    `source-${kind}-${row.key}`,
    `b3:${row.key}`,
    row.sourceRef,
    row.sourceLabel || "主要原典入口",
    row.sourceCitation,
    row.historicalLayer || row.historicalPeriod || row.formationPeriod,
    {
      kind: "source",
      direction: "directed",
      strength: 5,
      evidenceType: row.sourceEvidenceType || "primary-text",
      confidence: "certain",
      notes: row.sourceRelationNote || "本边指向该页优先核对的原典、传记或论疏；同名异人、后出祖谱和神圣叙事仍按正文分层。"
    }
  ), worldId, now);
}

function buildTimelineEvent(row, worldId, now) {
  return {
    id: `timeline-event:${worldId}:mythology:buddhism-schools:${row.key}`,
    worldId,
    entityId: resolveRef(row.primaryRef, worldId),
    questId: "",
    sceneId: "",
    references: row.referenceRefs.map((reference) => ({ kind: "entity", id: resolveRef(reference, worldId) })),
    trackId: trackId(row.trackKey, worldId),
    title: row.title,
    summary: row.summary,
    displayDate: row.displayDate,
    datePrecision: row.datePrecision,
    sortOrder: row.sortOrder,
    startValue: row.startValue,
    endValue: row.endValue,
    era: row.era,
    dependencyIds: [],
    updatedAt: now
  };
}

function assertBatchShape() {
  const checks = [
    [figureRows.length, 36, "人物"],
    [institutionRows.length, 8, "宗派制度"],
    [locationRows.length, 8, "祖庭地点"],
    [sourceRows.length, 8, "原典论疏"],
    [schoolMembershipRows.length, 36, "人物学系关系"],
    [explicitRelationRows.length, 77, "显式语义关系"],
    [semanticRelationRows.length, 113, "全部语义关系"],
    [eventRows.length, 20, "时间点"]
  ];
  const expectedGroupCounts = [7, 8, 8, 10, 18, 7, 11, 8];
  explicitRelationGroups.forEach((group, index) => {
    checks.push([group.length, expectedGroupCounts[index], `关系分组 ${index + 1}`]);
  });
  for (const [actual, expected, label] of checks) {
    if (actual !== expected) throw new Error(`${BATCH_LABEL}${label}数量应为 ${expected}，实际为 ${actual}`);
  }
}

function buildBuddhismSchoolsBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const figures = figureRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const institutions = institutionRows.map((row, index) => buildInstitutionEntity(row, figures.length + index, worldId, now));
  const locations = locationRows.map((row, index) => buildLocationEntity(row, figures.length + institutions.length + index, worldId, now));
  const sources = sourceRows.map((row, index) => buildSourceEntity(row, figures.length + institutions.length + locations.length + index, worldId, now));
  const sourceRelations = [
    ...figureRows.map((row) => buildSourceRelation(row, "figure", worldId, now)),
    ...institutionRows.map((row) => buildSourceRelation(row, "institution", worldId, now)),
    ...locationRows.map((row) => buildSourceRelation(row, "location", worldId, now))
  ];
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...figures, ...institutions, ...locations, ...sources],
    figures,
    institutions,
    locations,
    sources,
    relations: [...sourceRelations, ...semanticRelationRows.map((row) => buildRelation(row, worldId, now))],
    timelineEvents: eventRows.map((row) => buildTimelineEvent(row, worldId, now)),
    featuredEntityIds: [
      schoolsEntityId("zhiyi", worldId),
      schoolsEntityId("fazang", worldId),
      schoolsEntityId("kuiji", worldId),
      schoolsEntityId("shandao", worldId),
      schoolsEntityId("huineng", worldId),
      schoolsEntityId("daoxuan", worldId),
      schoolsEntityId("amoghavajra", worldId),
      schoolsEntityId("panjiao-lineages", worldId)
    ]
  };
}

module.exports = {
  BATCH_KEY,
  BATCH_LABEL,
  buildBuddhismSchoolsBatch,
  schoolsEntityId,
  schoolsSourceId,
  trackId
};
