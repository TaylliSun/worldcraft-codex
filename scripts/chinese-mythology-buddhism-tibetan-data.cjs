const { WORLD_ID, categoryId } = require("./chinese-mythology-history-data.cjs");

const BATCH_KEY = "buddhism-tibetan-27";
const BATCH_LABEL = "佛教完整知识库 · 藏传人物、传统、史料与制度批";

function tibetanEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:buddhism-tibetan:${key}`;
}

function tibetanSourceId(key, worldId = WORLD_ID) {
  return tibetanEntityId(`source-${key}`, worldId);
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

function historicalLayerFor(layer) {
  if (/十九至二十|跨|印度/u.test(layer)) return "跨时期";
  if (/二十世纪/u.test(layer)) return "近现代整理";
  if (/十四|十五|十六|十七|十八|十九/u.test(layer)) return "明清";
  if (/十至十一|十一|十二|十三/u.test(layer)) return "宋元";
  if (/吐蕃|前弘|七|八|九/u.test(layer)) return "隋唐";
  return "跨时期";
}

function figure(key, title, layer, role, sourceKey, options = {}) {
  return { key, title, layer, role, sourceKey, ...options };
}

const sourceRows = [
  {
    key: "old-tibetan-annals",
    title: "《敦煌古藏文年代记》",
    formation: "吐蕃时期编年记录，现存写本出自敦煌文书",
    layer: "吐蕃王朝同时代编年史料层",
    scope: "按年份记录王朝政治、战争、会盟与王族事件，是核对早期人物年代的首要材料之一。",
    boundary: "它不是佛教宗派史，未记载的宗教叙事不能据此直接判为虚构；写本残缺处也不能自行补齐。",
    location: "敦煌古藏文文书编年部分",
    workType: "史书与礼志"
  },
  {
    key: "testament-ba",
    title: "《巴协》",
    formation: "以吐蕃佛教初传为核心、经历多个传本层累的藏文史书",
    layer: "前弘期记忆与后世重编并存层",
    scope: "保存赤松德赞、寂护、莲花生、桑耶寺和顿渐之争等叙事，是宗教史的重要入口。",
    boundary: "不同传本增删明显，不能把所有段落都当成八世纪现场记录；人物言行须标明传本层次。",
    location: "《巴协》诸传本及相关早期残卷",
    workType: "佛典"
  },
  {
    key: "denkarma",
    title: "《丹噶目录》",
    formation: "九世纪初吐蕃官修佛典目录",
    layer: "吐蕃译经工程与目录学史料层",
    scope: "按部类记录当时已译藏文佛典，可用于核对译典、译语规范和前弘期经典规模。",
    boundary: "目录题名不等于现存文本必与当时抄本完全相同，缺载也不自动证明作品晚出。",
    location: "丹噶宫目录传本",
    workType: "佛典"
  },
  {
    key: "phangthangma",
    title: "《旁塘目录》",
    formation: "吐蕃时期另一部重要藏文佛典目录",
    layer: "前弘期译典著录与目录互证层",
    scope: "与《丹噶目录》对读，用于识别早期译典、部类差异和目录传承。",
    boundary: "现存传本经历抄写和整理，条目差异需保留，不把两部目录强行合成一个无差别清单。",
    location: "旁塘目录传本及目录学对勘资料",
    workType: "佛典"
  },
  {
    key: "blue-annals",
    title: "《青史》",
    formation: "十五世纪后期桂译师循努贝编纂的藏传佛教史",
    layer: "后弘期宗派、师承与文本流传综合史料层",
    scope: "以教法传承组织印度与西藏人物，保存噶当、噶举、萨迦、宁玛等多支资料。",
    boundary: "作者距离早期人物年代较远；祖谱、梦兆和神异应与更早题记、文书及传记对读。",
    location: "《青史》各教法与人物章节",
    workType: "佛典"
  },
  {
    key: "red-annals",
    title: "《红史》",
    formation: "十四世纪蔡巴·贡噶多吉编纂的历史著作",
    layer: "王统、宗派与跨区域政治关系史料层",
    scope: "记录印度、中国、蒙古与西藏王统和佛教传播，为元代以前政教关系提供线索。",
    boundary: "宏观王统与宗派谱系包含追溯性编排，精确年代需与诏书、碑铭和其他史书互证。",
    location: "《红史》王统与佛教史章节",
    workType: "史书与礼志"
  },
  {
    key: "buton-history",
    title: "《布敦佛教史》",
    formation: "十四世纪布敦·仁钦珠编纂的佛教史与目录学著作",
    layer: "印度佛教史、藏地传播史与大藏经编目层",
    scope: "把教法史、译师活动和经论目录并置，是理解藏文大藏经整理的重要资料。",
    boundary: "经典归类与历史判断体现作者时代的学术立场，不能代替全部异本和早期目录。",
    location: "《布敦佛教史》历史与目录部分",
    workType: "佛典"
  },
  {
    key: "biographies-monastic-records",
    title: "藏文高僧传、全集目录与寺院志资料组",
    formation: "十一至十九世纪逐步形成的传记、全集目录、寺院志和法脉记录",
    layer: "人物自述、弟子传记与机构记忆分层资料",
    scope: "为晚期祖师、伏藏师、学者和寺院创办者提供可定位的藏文资料入口。",
    boundary: "弟子所作圣传常含赞颂、授记和神异；本组只作资料导航，不把赞颂语直接改写成事实。",
    location: "各人物全集目录、传记题记与寺院沿革记录",
    workType: "地方志与碑刻"
  }
];

const systemRows = [
  ["early-diffusion", "前弘期佛教与吐蕃译场", "七至九世纪王室护持、寺院建立与官修译经共同形成的早期传播阶段", "译经目录、碑铭、敦煌文书与后世史书须分层使用；所谓一次完成的宏大传播图景属于后见性概括。"],
  ["later-diffusion", "后弘期佛教与新译传统", "十世纪以后由西部与东部多条路线恢复戒律、译经和寺院网络的历史阶段", "后弘并非单一起点；不同地区的复兴路线、戒脉与译师活动各有年代。"],
  ["nyingma", "宁玛传统", "以前弘期旧译密续、寺院传承和伏藏体系为核心的多中心传统", "宁玛名称和制度身份经历长期形成，不能把后世分类原样套回吐蕃时代。"],
  ["kadam", "噶当传统", "阿底峡、仲敦巴及其后学围绕道次第、教诫与经论学习形成的传承网络", "噶当支系与后来的格鲁继承关系需要逐条说明，二者不能直接视为同一机构。"],
  ["gelug", "格鲁传统", "宗喀巴及其弟子建立讲辩、戒律和密续修学并重的寺院体系", "格鲁制度、达赖喇嘛转世系与甘丹颇章政权是相关但不相同的历史层。"],
  ["sakya", "萨迦传统", "昆氏家族、道果教法、学术著述和元代政教关系共同构成的传统", "主支、俄尔与擦尔等支系各有机构和法脉，不应缩成一条单线祖谱。"],
  ["kagyu", "噶举诸传承", "以大手印、那若六法及师徒口传为重心，并分化为多条寺院与修持系统", "香巴噶举、玛尔巴噶举及后出的四大八小支系需分别标识，不以一个总名抹平差异。"],
  ["jonang", "觉囊传统", "以时轮、他空解释与觉囊寺院网络为核心，后在安多等地延续", "十七世纪制度变动不等于教法彻底消失；萨迦背景、独立传统和后世复兴应分期写。"],
  ["rime", "利美取向与跨宗派整理", "十九世纪康区多位学者跨宗派搜集灌顶、口传、伏藏与著述的保存取向", "利美不是取消宗派差异的新宗派，也不能把所有跨宗派活动都追称为利美。"],
  ["terma", "伏藏与伏藏师传统", "宁玛等传统中以发现、认证、传授和编集伏藏文本与圣物形成的传承机制", "伏藏的宗教真实性、文本形成史和历史事件证据属于不同问题，页面并列呈现。"],
  ["lamdre", "道果教法与萨迦教学", "围绕喜金刚续、道果口诀与师承讲授形成的萨迦核心教学体系", "公开页只记录历史、术语和文献位置，不复制需要灌顶或仍受保护的现代讲义。"],
  ["monastic-education", "藏传寺院学制与辩经体系", "以戒律、因明、般若、中观、俱舍和密续课程组织长期学习与考试", "不同寺院课程、学位名称和时代制度并不一致，不以现代通行版本覆盖全部地区。"]
].map(([key, title, scope, boundary]) => ({ key, title, scope, boundary }));

const groupRows = [
  {
    key: "imperial",
    title: "吐蕃王朝与前弘期人物群",
    anchorKey: "early-diffusion",
    scope: "王室、印度论师、译师和寺院创建者共同构成前弘期网络。",
    boundary: "王朝文书、译经题记与后世圣传各自保留，传统称号不自动证明具体事件。",
    figures: [
      figure("songtsen-gampo", "松赞干布", "吐蕃王朝", "七世纪吐蕃赞普；后世佛教史把建寺、造像与观音化身记忆汇入其王权形象。", "old-tibetan-annals"),
      figure("princess-wencheng", "文成公主", "唐蕃关系", "唐宗室女，入蕃婚盟在汉藏史料中可见；佛像携入与建寺细节存在不同叙事层。", "old-tibetan-annals"),
      figure("princess-bhrikuti", "尺尊公主", "前弘期传统记忆", "尼泊尔公主形象在后世藏文佛教史中与拉萨建寺相连，历史身份与年代仍有争议。", "testament-ba"),
      figure("thonmi-sambhota", "吞弥·桑布扎", "前弘期传统记忆", "传统称受命创制藏文并翻译佛典；文字形成过程与个人传记需要分开核对。", "testament-ba"),
      figure("trisong-detsen", "赤松德赞", "吐蕃王朝", "八世纪赞普，护持桑耶寺、译经与僧团建立，是前弘期佛教制度的关键人物。", "testament-ba"),
      figure("shantarakshita", "寂护", "前弘期译传", "印度中观论师，传统记载其参与桑耶寺僧团与戒律建立，并邀请莲花生入藏。", "testament-ba"),
      figure("padmasambhava", "莲花生", "前弘期与宁玛接受史", "印度密教上师形象，早期记载与后世伏藏传记共同塑造其在宁玛传统中的中心地位。", "testament-ba"),
      figure("kamalashila", "莲花戒", "前弘期论辩传统", "印度论师，三部《修习次第》作者；后世史书将其与桑耶顿渐之争联系。", "testament-ba"),
      figure("vimalamitra", "无垢友", "前弘期译传", "印度学者与密续传承人物，宁玛史书保存其翻译和大圆满传承叙事。", "biographies-monastic-records"),
      figure("yeshe-tsogyal", "伊喜措嘉", "前弘期圣传与宁玛记忆", "藏传佛教重要女性人物；其历史活动、莲花生弟子身份和后世圣传须分层阅读。", "biographies-monastic-records"),
      figure("ba-salnang", "巴·赛囊", "吐蕃王朝", "吐蕃贵族与佛教使者，相关家族记忆是《巴协》叙事形成的重要背景。", "testament-ba"),
      figure("vairocana-translator", "毗卢遮那（藏地译师）", "前弘期译传", "吐蕃译师，宁玛传统记载其翻译与传授多种密续；须与同名佛及其他译师消歧。", "denkarma"),
      figure("yeshe-de", "益西德", "前弘期译场", "吐蕃大译师，参与大量显密经论翻译和术语规范，题记中的合作译场比单人归名更重要。", "denkarma"),
      figure("kawa-paltsek", "噶瓦·贝则", "前弘期译场", "吐蕃译师，传统列入早期大译师群；具体译籍应逐部核对题记与目录。", "denkarma"),
      figure("ralpacan", "赤祖德赞", "吐蕃王朝", "九世纪赞普，支持译经规范与寺院供养；后世评价与王朝政治史需并读。", "old-tibetan-annals")
    ]
  },
  {
    key: "nyingma",
    title: "宁玛、伏藏与大圆满人物群",
    anchorKey: "nyingma",
    scope: "从旧译密续维护者到伏藏师和学术集成者，呈现宁玛内部不同法脉。",
    boundary: "伏藏发现叙事属于宗教传统；文本年代、传记写作与信仰意义不能用单一真假判断代替。",
    figures: [
      figure("nubchen-sangye-yeshe", "努钦·桑杰益西", "九至十世纪", "宁玛早期学者，著述保存禅法、密续与大圆满分类，是后吐蕃时期的重要文本入口。", "biographies-monastic-records"),
      figure("rongzom-chokyi-zangpo", "绒松·却吉桑波", "十一世纪", "宁玛学者和译师，以密续解释与大圆满论著连接旧译传统和后弘期学术。", "blue-annals"),
      figure("nyangral-nyima-ozer", "娘热·尼玛沃色", "十二世纪", "早期重要伏藏师，莲花生传记和教法发现传统在其名下获得新的组织。", "biographies-monastic-records"),
      figure("guru-chowang", "古如却旺", "十三世纪", "宁玛伏藏师，参与莲花生圣传与伏藏教法的扩展，传记神异须与文本史分读。", "biographies-monastic-records"),
      figure("longchen-rabjam", "隆钦饶绛", "十四世纪", "宁玛学者，系统整理大圆满与九乘教法，著述成为后世教学的核心参照。", "blue-annals"),
      figure("karma-lingpa", "噶玛林巴", "十四世纪传统记忆", "传统所称伏藏师，《中阴闻教得度》相关文本群后经传承与编集广泛流通。", "biographies-monastic-records"),
      figure("terdak-lingpa", "德达林巴", "十七世纪", "敏珠林寺创建者和伏藏师，推动宁玛仪轨、教育与文本校订进入稳定寺院制度。", "biographies-monastic-records"),
      figure("lochen-dharma-shri", "洛钦·达玛室利", "十七至十八世纪", "敏珠林学者与译师，以注疏、仪轨和语言教育延续宁玛学术。", "biographies-monastic-records"),
      figure("jigme-lingpa", "吉美林巴", "十八世纪", "龙钦宁提伏藏传统的重要人物，以修持、著述和弟子网络影响康藏宁玛。", "biographies-monastic-records"),
      figure("dodrupchen-jigme-trinle-ozer", "多竹钦·吉美成列沃色", "十八至十九世纪", "吉美林巴弟子与龙钦宁提传承者，连接伏藏教法、寺院与长期闭关传统。", "biographies-monastic-records"),
      figure("patrul-rinpoche", "巴楚仁波切", "十九世纪", "宁玛学者和行脚教师，以《普贤上师言教》等著述推动前行与伦理教育。", "biographies-monastic-records"),
      figure("mipham", "麦彭·蒋巴南杰嘉措", "十九至二十世纪初", "宁玛学者，广泛著述中观、因明、医药与密续，参与跨宗派学术讨论。", "biographies-monastic-records"),
      figure("dudjom-lingpa", "敦珠林巴", "十九世纪", "安多与康区伏藏师，其教法和传记形成多支修持传承。", "biographies-monastic-records"),
      figure("dilgo-khyentse", "顶果钦哲仁波切", "二十世纪", "宁玛教师与跨宗派传承持有者；本页仅保留可核生平，不转录现代出版物。", "biographies-monastic-records")
    ]
  },
  {
    key: "kadam-gelug",
    title: "后弘期、噶当与格鲁人物群",
    anchorKey: "gelug",
    scope: "从西部译师、阿底峡教诫到格鲁寺院学制和转世制度，按阶段组织人物。",
    boundary: "噶当、格鲁、达赖喇嘛与甘丹颇章不能互作同义词；宗教法脉与政治权力分别建关系。",
    figures: [
      figure("rinchen-zangpo", "仁钦桑波", "十至十一世纪", "古格大译师，参与西部寺院、造像与新译密续传播，是后弘期西路的重要人物。", "blue-annals"),
      figure("atisha", "阿底峡", "十一世纪", "印度论师，入藏讲授菩提道与戒行，其教诫经仲敦巴等人形成噶当传统。", "blue-annals"),
      figure("dromton", "仲敦巴", "十一世纪", "阿底峡在藏地的重要弟子，创建热振寺并组织噶当教诫传承。", "blue-annals"),
      figure("potowa", "博多瓦", "十一至十二世纪", "噶当教诫派教师，以经论讲授和修心传统影响后世道次第。", "blue-annals"),
      figure("phuchungwa", "普穹瓦", "十一至十二世纪", "噶当教授派人物，传统以口传教诫与修持次第著称。", "blue-annals"),
      figure("chengawa", "京俄瓦", "十一至十二世纪", "噶当教典派教师，重视经论学习与阿底峡教法的系统传授。", "blue-annals"),
      figure("tsongkhapa", "宗喀巴", "十四至十五世纪", "格鲁传统奠基者，以中观、戒律、道次第与密续著述建立完整修学框架。", "biographies-monastic-records"),
      figure("gyaltsab-je", "贾曹杰·达玛仁钦", "十四至十五世纪", "宗喀巴主要弟子和甘丹寺继任法台，参与论著解释与教法制度化。", "biographies-monastic-records"),
      figure("khedrup-je", "克珠杰·格勒贝桑", "十四至十五世纪", "宗喀巴弟子，著述涉及因明、中观、时轮与宗派论辩。", "biographies-monastic-records"),
      figure("gendun-drub", "根敦珠巴", "十四至十五世纪", "后世追认为第一世达赖喇嘛的格鲁学者，创建扎什伦布寺。", "biographies-monastic-records"),
      figure("sonam-gyatso", "索南嘉措", "十六世纪", "第三世达赖喇嘛，与俺答汗往来推动格鲁传统进入蒙古地区。", "biographies-monastic-records"),
      figure("fifth-dalai", "五世达赖喇嘛·阿旺罗桑嘉措", "十七世纪", "格鲁领袖、作家与甘丹颇章政权核心人物，宗教著述和政治活动均有独立史料层。", "biographies-monastic-records"),
      figure("panchen-lobsang-chokyi-gyaltsen", "罗桑却吉坚赞", "十六至十七世纪", "扎什伦布学者，后世尊为第四世班禅喇嘛，与格鲁寺院和政教网络关系密切。", "biographies-monastic-records"),
      figure("jamyang-choje", "绛央却杰·扎西贝丹", "十四至十五世纪", "宗喀巴弟子与哲蚌寺创建者，推动格鲁讲辩教育的寺院化。", "biographies-monastic-records")
    ]
  },
  {
    key: "sakya-jonang",
    title: "萨迦、觉囊与夏鲁学术人物群",
    anchorKey: "sakya",
    scope: "以昆氏五祖、萨迦支系、夏鲁目录学和觉囊时轮传统构成并列阅读区。",
    boundary: "萨迦政权、道果法脉、觉囊他空与夏鲁学术彼此相关但不从属同一条祖谱。",
    figures: [
      figure("khon-konchok-gyalpo", "昆·贡却杰布", "十一世纪", "萨迦寺创建者，将昆氏旧传与后弘期新译教法汇入新的家族寺院。", "blue-annals"),
      figure("sachen-kunga-nyingpo", "萨钦·贡噶宁波", "十一至十二世纪", "萨迦五祖之一，整合道果教法与昆氏密续传统。", "blue-annals"),
      figure("sonam-tsemo", "索南孜摩", "十二世纪", "萨迦五祖之一，以显密论著和教法分类参与早期萨迦学术建设。", "blue-annals"),
      figure("drakpa-gyaltsen", "扎巴坚赞", "十二至十三世纪", "萨迦五祖之一，长期主持萨迦寺并传授道果与密续。", "blue-annals"),
      figure("sakya-pandita", "萨迦班智达·贡噶坚赞", "十三世纪", "佛教学者与萨迦五祖之一，著述因明、语言和戒律，并参与蒙古时期政治交涉。", "red-annals"),
      figure("chogyal-phagpa", "八思巴·洛追坚赞", "十三世纪", "萨迦五祖之一，任元朝帝师并参与文字、佛教和地方治理事务。", "red-annals"),
      figure("ngorchen-kunga-zangpo", "鄂钦·贡噶桑波", "十四至十五世纪", "俄尔支系创建者，以道果、密续和寺院教育扩大萨迦传统。", "biographies-monastic-records"),
      figure("gorampa", "果然巴·索南僧格", "十五世纪", "萨迦哲学家，以中观、量论和宗派判教著述参与广泛论辩。", "biographies-monastic-records"),
      figure("tsarchen-losel-gyatso", "察钦·洛色嘉措", "十五至十六世纪", "萨迦擦尔支系关键人物，传授道果与密续口传体系。", "biographies-monastic-records"),
      figure("buton-rinchen-drub", "布敦·仁钦珠", "十三至十四世纪", "夏鲁寺学者，以佛教史、经录和译典校订影响藏文大藏经形成。", "buton-history"),
      figure("dolpopa", "笃补巴·喜饶坚赞", "十三至十四世纪", "觉囊学者，以时轮和他空解释形成鲜明思想体系。", "biographies-monastic-records"),
      figure("taranatha", "多罗那他", "十六至十七世纪", "觉囊学者与历史作者，主持达丹彭措林并著述印度佛教史和密续传承。", "biographies-monastic-records"),
      figure("bodong-chokle-namgyel", "博东·却列南杰", "十四至十五世纪", "博东传统多产学者，著述范围涵盖显密、历算与寺院教育。", "biographies-monastic-records")
    ]
  },
  {
    key: "kagyu-chod",
    title: "噶举、希解与觉域人物群",
    anchorKey: "kagyu",
    scope: "从印度大成就者、藏地译师到噶举支系和觉域传统，突出师徒网络与寺院分化。",
    boundary: "圣传中的歌诀、梦兆和苦行细节具有文学与修行功能，不默认等同逐日传记。",
    figures: [
      figure("tilopa", "帝洛巴", "十至十一世纪印度", "印度大成就者，后世噶举谱系把多支密续与大手印教法汇于其传承。", "blue-annals"),
      figure("naropa", "那若巴", "十至十一世纪印度", "印度学者与瑜伽行者，传统称从帝洛巴受法，并向马尔巴传授多种密续。", "blue-annals"),
      figure("marpa", "马尔巴", "十一世纪", "藏地译师，多次赴尼泊尔和印度求法，其译传成为玛尔巴噶举的基础。", "blue-annals"),
      figure("milarepa", "米拉日巴", "十一至十二世纪", "瑜伽行者和歌者，历史人物生涯经十五世纪传记重写后形成广泛文学形象。", "biographies-monastic-records"),
      figure("gampopa", "冈波巴", "十一至十二世纪", "把噶当教诫与大手印修持结合，并通过弟子推动多支噶举传统。", "blue-annals"),
      figure("rechungpa", "热琼·多杰扎巴", "十一至十二世纪", "米拉日巴弟子，传记记载其求法和歌诀传承；支系关系需按不同文本核对。", "blue-annals"),
      figure("dusum-khyenpa", "杜松虔巴", "十二世纪", "噶玛噶举奠基者，创建楚布寺；后世追认其为第一世噶玛巴。", "blue-annals"),
      figure("karma-pakshi", "噶玛拔希", "十三世纪", "噶玛噶举上师，活动于蒙古宫廷；转世认定的制度史在其身后逐步成形。", "red-annals"),
      figure("rangjung-dorje", "攘迥多杰", "十三至十四世纪", "第三世噶玛巴，著述涉及大手印、大圆满、医药与历算。", "blue-annals"),
      figure("phagmo-drupa", "帕木竹巴·多杰嘉波", "十二世纪", "冈波巴弟子，丹萨替寺及多支噶举法脉由其弟子网络展开。", "blue-annals"),
      figure("jigten-sumgon", "吉天颂恭", "十二至十三世纪", "直贡噶举创建者，以教诫、寺院与弟子网络扩展传承。", "blue-annals"),
      figure("tsangpa-gyare", "藏巴嘉热", "十二至十三世纪", "竹巴噶举创建者，热龙寺及其弟子推动传承进入藏地与喜马拉雅地区。", "blue-annals"),
      figure("khyungpo-neljor", "琼波南觉", "十一至十二世纪", "香巴噶举奠基者，传统记载其从尼古玛等印度教师受法。", "blue-annals"),
      figure("machik-labdron", "玛吉拉准", "十一至十二世纪", "藏地女性修行者，系统发展觉域教法，并在不同宗派中持续流传。", "blue-annals")
    ]
  },
  {
    key: "rime-interface",
    title: "跨宗派整理与汉藏交流人物群",
    anchorKey: "rime",
    scope: "选择跨宗派编集、艺术、工程、蒙古与汉藏交流中的代表人物，补足单一宗派谱系之外的网络。",
    boundary: "跨宗派学习不等于人物没有自身法脉；清代驻京、蒙古传播与藏地寺院活动也须分地域书写。",
    figures: [
      figure("thangtong-gyalpo", "唐东杰布", "十四至十五世纪", "修行者、桥梁建造者和戏剧传统人物，工程史、圣传与民间记忆相互叠加。", "biographies-monastic-records"),
      figure("situ-panchen", "司徒班钦·却吉炯乃", "十八世纪", "噶玛噶举学者、画家和印经组织者，参与德格版大藏经目录与校勘。", "biographies-monastic-records"),
      figure("katok-tsewang-norbu", "噶陀仁增·次旺诺布", "十七至十八世纪", "宁玛学者与跨地区教师，活动联系康区、卫藏和喜马拉雅诸地。", "biographies-monastic-records"),
      figure("changkya-rolpe-dorje", "章嘉·若必多吉", "十八世纪", "清廷章嘉活佛，参与蒙藏佛典翻译、术语整理、寺院与宫廷佛教事务。", "biographies-monastic-records"),
      figure("tukwan-chokyi-nyima", "土观·罗桑却吉尼玛", "十八世纪", "格鲁学者，以宗派源流著述整理藏地、蒙古与汉地多种宗教传统。", "biographies-monastic-records"),
      figure("sumpa-yeshe-paltsor", "松巴堪布·益西班觉", "十八世纪", "安多学者，著述佛教史、地理、历算与医药，兼具跨区域资料价值。", "biographies-monastic-records"),
      figure("shabkar", "夏嘎巴·措珠让卓", "十八至十九世纪", "行脚瑜伽者与歌者，自传和道歌保存其跨地区修行与不杀生倡议。", "biographies-monastic-records"),
      figure("jamyang-khyentse-wangpo", "蒋扬钦哲旺波", "十九世纪", "萨迦背景的学者与伏藏师，跨宗派搜集、传授濒失教法，是利美取向关键人物。", "biographies-monastic-records"),
      figure("jamgon-kongtrul", "蒋贡康楚·罗卓泰耶", "十九世纪", "噶举学者和大型文集编纂者，以多部宝藏集成保存不同传统。", "biographies-monastic-records"),
      figure("chokgyur-lingpa", "秋吉林巴", "十九世纪", "宁玛伏藏师，与钦哲旺波、蒋贡康楚合作形成广泛传承网络。", "biographies-monastic-records")
    ]
  }
];

const figureRows = groupRows.flatMap((group) => group.figures.map((row, index) => ({
  ...row,
  groupKey: group.key,
  groupTitle: group.title,
  groupScope: group.scope,
  groupBoundary: group.boundary,
  anchorKey: row.anchorKey || group.anchorKey,
  position: index + 1
})));

const sourceByKey = new Map(sourceRows.map((row) => [row.key, row]));
const systemByKey = new Map(systemRows.map((row) => [row.key, row]));

function renderGroup(row) {
  return [
    `<p>${escapeHtml(row.title)}收录 ${row.figures.length} 位独立历史身份，按人物、文献与制度三条线进入藏传佛教史。</p>`,
    `<h2>本组范围</h2><p>${escapeHtml(row.title)}处理${escapeHtml(row.scope)} 人物排列只服务阅读，不表示法位高低。</p>`,
    `<h2>史料入口</h2><p>${escapeHtml(row.title)}优先使用藏文编年史、译经目录、题记、传记和寺院志；晚出祖谱另列接受史。</p>`,
    `<h2>辨读边界</h2><p>${escapeHtml(row.title)}的基本边界是：${escapeHtml(row.boundary)}</p>`,
    `<h2>关系导航</h2><p>${escapeHtml(row.title)}中的师徒、护持、翻译、著述、寺院和政治关系分别建边，不以一条“传承”包办。</p>`,
    `<h2>创作使用（项目原创提示）</h2><p>可从${escapeHtml(row.title)}发展译场、行旅、辩论与寺院日常；新增对白、心理和未见史料的遭遇均属项目原创。</p>`,
    `<h2>公开边界</h2><p>${escapeHtml(row.title)}不复制第三方人物传记或现代译著，公开正文只保留项目自写概述和古籍定位。</p>`
  ].join("");
}

function renderSystem(row) {
  return [
    `<p>${escapeHtml(row.title)}是藏传佛教知识库中的传统与制度入口，用来连接人物、史料、寺院和时间事件。</p>`,
    `<h2>形成与范围</h2><p>${escapeHtml(row.title)}所指范围为：${escapeHtml(row.scope)}</p>`,
    `<h2>内部差异</h2><p>${escapeHtml(row.title)}按时代、地区、寺院和法脉继续拆分；同一名称在不同文献中的含义可以变化。</p>`,
    `<h2>史料方法</h2><p>研究${escapeHtml(row.title)}时先看可定位的目录、题记和传记，再查看后世教法史如何重排祖统。</p>`,
    `<h2>辨读边界</h2><p>${escapeHtml(row.title)}不采用单线定论：${escapeHtml(row.boundary)}</p>`,
    `<h2>关系与时间</h2><p>${escapeHtml(row.title)}的关系图分别显示人物成员、文献依据、制度影响与跨宗派往来，时间线保留形成区间。</p>`,
    `<h2>创作使用（项目原创提示）</h2><p>${escapeHtml(row.title)}可作为学院、寺院和行旅故事背景；项目新增仪轨细节和传奇事件必须显著标原创。</p>`
  ].join("");
}

function renderSource(row) {
  return [
    `<p>${escapeHtml(row.title)}在本库中作为${escapeHtml(row.layer)}使用；条目正文由项目重新整理，不转录现代译文。</p>`,
    `<h2>文献范围</h2><p>${escapeHtml(row.title)}的使用范围是：${escapeHtml(row.scope)}</p>`,
    `<h2>形成位置</h2><p>${escapeHtml(row.title)}形成于${escapeHtml(row.formation)}，内部引用定位到${escapeHtml(row.location)}。</p>`,
    `<h2>可证明什么</h2><p>${escapeHtml(row.title)}可以支持其中明确记载的人名、题名、年代或传承说法，但沉默不自动构成反证。</p>`,
    `<h2>辨读边界</h2><p>${escapeHtml(row.title)}须遵守以下边界：${escapeHtml(row.boundary)}</p>`,
    `<h2>校读方式</h2><p>使用${escapeHtml(row.title)}时记录传本、章节和异文；若与另一史书冲突，页面并列说法并下调置信度。</p>`,
    `<h2>资料声明</h2><p>${escapeHtml(row.title)}页保存古籍定位和项目自写摘要，不含站外链接，不复制第三方知识库或受版权保护的现代译注。</p>`
  ].join("");
}

function renderFigure(row) {
  const source = sourceByKey.get(row.sourceKey);
  const system = systemByKey.get(row.anchorKey);
  return [
    `<p>${escapeHtml(row.title)}被收入“${escapeHtml(row.groupTitle)}”，主要史料入口为${escapeHtml(source.title)}。</p>`,
    `<h2>人物位置</h2><p>${escapeHtml(row.title)}${escapeHtml(row.role)} 本页先确定人物所处时代，再讨论宗派追认和后世纪念。</p>`,
    `<h2>活动与传承</h2><p>${escapeHtml(row.title)}处于${escapeHtml(row.layer)}；与${escapeHtml(system.title)}的联系会拆成师承、著述、寺院或制度关系逐项记录。</p>`,
    `<h2>文献证据</h2><p>${escapeHtml(row.title)}以${escapeHtml(source.title)}及可定位题记、全集目录或传记互证；年代和归属有分歧时保留不同说法。</p>`,
    `<h2>后世形象</h2><p>${escapeHtml(row.title)}的祖师称号、化身认定、伏藏授记或神异故事属于接受史，不能倒推每项早期活动。</p>`,
    `<h2>辨读边界</h2><p>${escapeHtml(row.title)}遵守“${escapeHtml(row.groupBoundary)}”这一边界；同名、异译名与尊号须结合时代和寺院消歧。</p>`,
    `<h2>创作使用（项目原创提示）</h2><p>可围绕${escapeHtml(row.title)}的${escapeHtml(row.role)}设计场景；新增对白、私生活、秘传过程和事件结局均属项目原创。</p>`
  ].join("");
}

function buildGroupEntity(row, order, worldId, now) {
  return {
    id: tibetanEntityId(`group-${row.key}`, worldId), worldId, type: "note", title: row.title,
    slug: `mythology-buddhism-tibetan-group-${row.key}`,
    summary: `${row.title}收录 ${row.figures.length} 位人物，并把史料、传承与后世记忆分层。`,
    content: renderGroup(row), tags: ["中国神话史", "佛教完整知识库", "藏传佛教", "人物目录", "项目自写整理", row.title],
    visibility: "public", createdBy: "user-owner", updatedAt: now, categoryId: categoryId(worldId, "buddhism"), order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: { tradition: "佛教", institutionKind: "藏传佛教人物群与传承索引", hierarchyLevel: "藏传佛教历史人物层", jurisdiction: row.scope, formationPeriod: "按组内人物时代分期", earliestSource: "本组人物页所列藏文史料", sourceLocation: "本组人物关系与资料栏", variants: row.boundary, confidence: "主流说法" }
  };
}

function buildSystemEntity(row, order, worldId, now) {
  return {
    id: tibetanEntityId(`system-${row.key}`, worldId), worldId, type: "note", title: row.title,
    slug: `mythology-buddhism-tibetan-system-${row.key}`,
    summary: `${row.title}：${row.scope}`,
    content: renderSystem(row), tags: ["中国神话史", "佛教完整知识库", "藏传佛教", "传统与制度", "项目自写整理", row.title],
    visibility: "public", createdBy: "user-owner", updatedAt: now, categoryId: categoryId(worldId, "buddhism"), order,
    templateId: `template:${worldId}:mythology:institution-ritual`,
    templateData: { tradition: "佛教", institutionKind: "藏传佛教传统与制度", hierarchyLevel: "宗派、传承与寺院制度层", jurisdiction: row.scope, formationPeriod: "按文献与机构记录分期", earliestSource: "本批藏文史料入口", sourceLocation: "人物、史料与时间线关系", variants: row.boundary, confidence: "主流说法" }
  };
}

function buildSourceEntity(row, order, worldId, now) {
  return {
    id: tibetanSourceId(row.key, worldId), worldId, type: "note", title: row.title,
    slug: `mythology-buddhism-tibetan-source-${row.key}`,
    summary: `${row.title}：${row.scope}`,
    content: renderSource(row), tags: ["中国神话史", "佛教完整知识库", "藏文史料", "古籍原文", "项目自写整理", row.title],
    visibility: "public", createdBy: "user-owner", updatedAt: now, categoryId: categoryId(worldId, "primary-sources"), order,
    templateId: `template:${worldId}:mythology:source-text`,
    templateData: { workTitle: row.title, workType: row.workType, formationPeriod: row.formation, edition: "藏文传本与校勘本分列", volumeSection: row.location, sourceLayer: "史料记录", rightsStatus: "古籍原文", internalCitation: `${row.title} · ${row.location}`, reviewStatus: "已核原文" }
  };
}

function buildFigureEntity(row, order, worldId, now) {
  const source = sourceByKey.get(row.sourceKey);
  return {
    id: tibetanEntityId(`person-${row.key}`, worldId), worldId, type: "character", title: row.title,
    slug: `mythology-buddhism-tibetan-person-${row.key}`,
    summary: row.role, content: renderFigure(row),
    tags: ["中国神话史", "佛教完整知识库", "藏传佛教人物", row.groupTitle, "项目自写整理", row.title],
    visibility: "public", createdBy: "user-owner", updatedAt: now, categoryId: categoryId(worldId, "buddhist-patriarchs"), order,
    templateId: `template:${worldId}:mythology:deity-person`,
    templateData: { canonicalName: row.title, aliases: row.aliases || "", tradition: "佛教", identityType: "历史人物", earliestSource: source.title, sourceLocation: source.location, narrativeEra: "历史人物；祖师谱、化身与神异另列接受史。", historicalLayer: historicalLayerFor(row.layer), domains: row.role, iconography: "历史肖像、祖师像和后世艺术形象分开记录，不据晚出图像反推容貌。", worship: "以寺院纪念、法脉传承、著述阅读或地方文化记忆为主。", regionalVariants: row.groupBoundary, confidence: row.title === "尺尊公主" || row.title === "吞弥·桑布扎" ? "存疑" : "主流说法", editorialStatus: "复核中", originalAdaptation: "false" }
  };
}

function relation(key, sourceRef, targetRef, label, citation, scope, options = {}) {
  return { key, sourceRef, targetRef, label, sourceCitation: citation, historicalScope: scope, kind: options.kind || "custom", direction: "directed", strength: options.strength || 4, evidenceType: options.evidenceType || "historical-record", confidence: options.confidence || "probable", notes: options.notes || "关系按藏文史料、题记与后世教法史分层，不把宗派自述直接视为同时代记录。" };
}

const membershipRelations = figureRows.map((row) => relation(`member-${row.key}`, `p:${row.key}`, `g:${row.groupKey}`, "列入藏传人物分区", sourceByKey.get(row.sourceKey).title, row.layer, { kind: "member", strength: 5, confidence: "certain" }));
const sourceRelations = figureRows.map((row) => relation(`source-figure-${row.key}`, `p:${row.key}`, `src:${row.sourceKey}`, "主要藏文史料入口", `${sourceByKey.get(row.sourceKey).title}及相关题记、传记或目录`, row.layer, { kind: "source", strength: 5, evidenceType: "primary-text", confidence: row.sourceKey === "biographies-monastic-records" ? "probable" : "certain", notes: "该边给出首要古籍入口；赞颂、神异、年代和师承仍须逐项对读。" }));
const sequenceRelations = groupRows.flatMap((group) => group.figures.slice(0, -1).map((row, index) => relation(`sequence-${group.key}-${index + 1}`, `p:${row.key}`, `p:${group.figures[index + 1].key}`, "本组下一人物", sourceByKey.get(row.sourceKey).title, group.scope, { strength: 2, evidenceType: "scholarly-inference", confidence: "probable", notes: "此边只承担目录导航，不表示两人相见、师承或地位高低。" })));
const anchorRelations = figureRows.map((row) => relation(`anchor-${row.key}`, `p:${row.key}`, `sys:${row.anchorKey}`, "人物传统与制度入口", sourceByKey.get(row.sourceKey).title, row.layer, { kind: "influence", strength: 3, evidenceType: "scholarly-inference", confidence: "probable", notes: "连接人物与主要阅读分区，不把人物限制为单一宗派或后世标签。" }));

const crossRows = [
  ["imperial-early", "g:imperial", "sys:early-diffusion", "前弘期人物与译场制度"],
  ["imperial-annals", "g:imperial", "src:old-tibetan-annals", "王朝编年互证入口"],
  ["early-ba", "sys:early-diffusion", "src:testament-ba", "初传叙事的传本入口"],
  ["early-denkarma", "sys:early-diffusion", "src:denkarma", "官修译经目录入口"],
  ["early-phangthangma", "sys:early-diffusion", "src:phangthangma", "早期译典目录互证"],
  ["early-later", "sys:early-diffusion", "sys:later-diffusion", "前后弘分期与延续"],
  ["nyingma-system", "g:nyingma", "sys:nyingma", "宁玛人物与传统入口"],
  ["nyingma-terma", "sys:nyingma", "sys:terma", "伏藏在宁玛中的主要位置"],
  ["terma-biographies", "sys:terma", "src:biographies-monastic-records", "伏藏师传记资料入口"],
  ["kadam-group", "g:kadam-gelug", "sys:kadam", "噶当人物分支"],
  ["kadam-gelug", "sys:kadam", "sys:gelug", "噶当教诫进入格鲁重释"],
  ["gelug-education", "sys:gelug", "sys:monastic-education", "格鲁讲辩与寺院课程"],
  ["sakya-group", "g:sakya-jonang", "sys:sakya", "萨迦人物与制度入口"],
  ["sakya-lamdre", "sys:sakya", "sys:lamdre", "萨迦道果教学体系"],
  ["sakya-red-annals", "sys:sakya", "src:red-annals", "元代政教史料入口"],
  ["sakya-jonang", "sys:sakya", "sys:jonang", "学术背景与独立传统分化"],
  ["jonang-buton", "sys:jonang", "src:buton-history", "时轮与目录传统对读"],
  ["kagyu-group", "g:kagyu-chod", "sys:kagyu", "噶举人物与传承入口"],
  ["kagyu-later", "sys:kagyu", "sys:later-diffusion", "新译密续与后弘网络"],
  ["kagyu-blue", "sys:kagyu", "src:blue-annals", "噶举支系史料入口"],
  ["rime-group", "g:rime-interface", "sys:rime", "跨宗派人物与整理取向"],
  ["rime-nyingma", "sys:rime", "sys:nyingma", "宁玛传承保存与重刊"],
  ["rime-kagyu", "sys:rime", "sys:kagyu", "噶举教法编集与传授"],
  ["rime-sakya", "sys:rime", "sys:sakya", "萨迦教法跨宗派保存"],
  ["rime-gelug", "sys:rime", "sys:gelug", "跨宗派对读而不取消差异"],
  ["education-catalogues", "sys:monastic-education", "src:denkarma", "目录传统支撑课程用典"]
];
const crossRelations = crossRows.map(([key, sourceRef, targetRef, label]) => relation(`cross-${key}`, sourceRef, targetRef, label, "本批藏文史料、人物传记与机构记录对读", "七至十九世纪藏传佛教史层", { kind: "influence", evidenceType: "scholarly-inference", confidence: "probable" }));

function event(key, trackKey, ref, title, summary, startValue, endValue, displayDate, era) {
  return { key, trackKey, ref, title, summary, startValue, endValue, displayDate, era };
}

const eventRows = [
  event("songtsen-record", "textual-evidence", "p:songtsen-gampo", "松赞干布时代进入吐蕃编年与唐蕃史料", "王朝事件可由编年、唐代史书和碑铭互证，佛教化身叙事另列后世接受。", "617", "650", "约617至650年", "吐蕃王朝早期史料层"),
  event("script-tradition", "textual-evidence", "p:thonmi-sambhota", "藏文创制传统归于吞弥·桑布扎", "后世史书形成稳定叙事，文字史研究则关注更广的制度与书写背景。", "630", "900", "七至九世纪传统形成", "藏文书写与后世记忆层"),
  event("samye-debate", "textual-evidence", "p:kamalashila", "桑耶顿渐之争进入藏文佛教史叙述", "《巴协》等材料保存不同版本，论辩经过和结果不能压缩成单一现场记录。", "792", "794", "约792至794年", "前弘期论辩记忆层"),
  event("denkarma-catalogue", "textual-evidence", "src:denkarma", "《丹噶目录》记录前弘期译典", "官修目录使译经规模、分类和题名获得可核对入口。", "812", "824", "约九世纪初", "吐蕃佛典目录层"),
  event("rinchen-zangpo-translation", "textual-evidence", "p:rinchen-zangpo", "仁钦桑波推动西部新译与寺院艺术", "题记、寺院遗存和后世传记共同记录其译经与建寺活动。", "978", "1055", "约978至1055年", "后弘期西部译传层"),
  event("atisha-lam", "textual-evidence", "p:atisha", "阿底峡入藏并撰述道次第教诫", "入藏行程、著述题记和弟子传承共同构成噶当教法史。", "1042", "1054", "1042至1054年", "后弘期噶当文献层"),
  event("sakya-pandita-writing", "textual-evidence", "p:sakya-pandita", "萨迦班智达著述量论、语言与戒律", "著作目录和传本显示其学术范围，政治交涉另列制度轨。", "1210", "1251", "约十三世纪前半", "萨迦学术文献层"),
  event("buton-history", "textual-evidence", "p:buton-rinchen-drub", "布敦编纂佛教史并整理经论目录", "历史叙述和目录工作参与藏文大藏经分类定型。", "1320", "1364", "约十四世纪", "夏鲁目录学层"),
  event("longchenpa-corpus", "textual-evidence", "p:longchen-rabjam", "隆钦饶绛系统整理宁玛与大圆满著述", "多部论著把旧译教法、修持次第和哲学解释编成可传授体系。", "1326", "1364", "约十四世纪中叶", "宁玛学术文献层"),
  event("blue-annals-written", "textual-evidence", "src:blue-annals", "桂译师循努贝编成《青史》", "全书按教法传承汇集人物与文本，成为后弘期宗派史的重要入口。", "1476", "1478", "1476至1478年", "藏传佛教史编纂层"),
  event("fifth-dalai-writing", "textual-evidence", "p:fifth-dalai", "五世达赖喇嘛留下自传、史书与仪轨著述", "个人著述与官署记录可帮助区分政治活动、宗教教育和后世神圣化。", "1642", "1682", "1642至1682年", "甘丹颇章文献层"),
  event("rime-collections", "textual-evidence", "p:jamgon-kongtrul", "蒋贡康楚编集多部宝藏文集", "跨宗派搜集让不同法脉的灌顶、教诫和著述得到系统保存。", "1860", "1899", "约十九世纪后半", "康区跨宗派编集层"),
  event("jokhang-memory", "religious-institutions", "p:songtsen-gampo", "拉萨建寺与佛像供奉形成王权佛教记忆", "寺院遗存、后世史书和公主叙事共同构成，具体建造阶段分期处理。", "630", "700", "约七世纪", "拉萨早期寺院制度层"),
  event("samye-founded", "religious-institutions", "p:trisong-detsen", "桑耶寺与首批僧团建立", "王室护持、寂护戒律传统和译场活动在寺院制度中汇合。", "775", "779", "约775至779年", "前弘期寺院制度层"),
  event("imperial-translation", "religious-institutions", "sys:early-diffusion", "吐蕃译场统一部分译语与校订程序", "印度班智达与藏地译师协作，目录和词汇规范保留制度痕迹。", "800", "840", "约九世纪前半", "吐蕃官修译经制度层"),
  event("later-diffusion-networks", "religious-institutions", "sys:later-diffusion", "后弘期多路恢复戒律与寺院网络", "西部译师活动和东部戒律传承并行，不能归为单一起点。", "950", "1050", "约十至十一世纪", "后弘期制度恢复层"),
  event("reting-founded", "religious-institutions", "p:dromton", "仲敦巴创建热振寺", "热振寺成为噶当教诫、弟子学习和机构记忆的重要中心。", "1056", "1057", "约1056年", "噶当寺院制度层"),
  event("sakya-founded", "religious-institutions", "p:khon-konchok-gyalpo", "昆·贡却杰布创建萨迦寺", "家族法脉、寺院土地与新译教法由此形成稳定机构。", "1073", "1074", "1073年", "萨迦寺院制度层"),
  event("tsurphu-founded", "religious-institutions", "p:dusum-khyenpa", "杜松虔巴创建楚布寺", "寺院成为噶玛噶举传承和后来转世制度的重要中心。", "1189", "1190", "约1189年", "噶玛噶举寺院层"),
  event("jonang-stupa", "religious-institutions", "p:dolpopa", "笃补巴在觉囊修建大佛塔并讲授时轮", "建筑、教学和弟子网络巩固觉囊作为独立传统的机构位置。", "1330", "1335", "约1333年", "觉囊寺院制度层"),
  event("ganden-founded", "religious-institutions", "p:tsongkhapa", "宗喀巴建立甘丹寺", "寺院与大祈愿法会推动格鲁教学、戒律和组织形式展开。", "1409", "1410", "1409年", "格鲁寺院制度层"),
  event("ganden-phodrang", "religious-institutions", "p:fifth-dalai", "甘丹颇章政权形成", "格鲁寺院网络、蒙古军事支持与地方政治重组交织，宗教身份和政权结构分别记录。", "1642", "1653", "1642至1653年", "十七世纪政教制度层"),
  event("padmasambhava-cult", "cult-evolution", "p:padmasambhava", "莲花生形象在伏藏传记中持续扩展", "早期人物记载、八相图像和后世伏藏圣传形成不同层次。", "1100", "1900", "约十二至十九世纪", "宁玛祖师接受史层"),
  event("yeshe-tsogyal-memory", "cult-evolution", "p:yeshe-tsogyal", "伊喜措嘉圣传塑造女性译传与伏藏典范", "不同传记把王妃、弟子、译者和佛母形象叠加，历史层与象征层分开。", "1200", "1900", "约十三至十九世纪", "藏传女性圣传层"),
  event("milarepa-life", "cult-evolution", "p:milarepa", "米拉日巴传记与道歌塑造苦行诗人形象", "十五世纪传记编纂显著影响后世对其生平、歌诀和修行的理解。", "1450", "1500", "约十五世纪后半", "噶举圣传文学层"),
  event("karmapa-reincarnation", "cult-evolution", "p:karma-pakshi", "噶玛巴转世谱系逐步制度化", "第二世人物与前世追认、寺院继承和信物叙事共同形成制度记忆。", "1283", "1500", "十三至十五世纪", "活佛转世制度形成层"),
  event("dalai-title", "cult-evolution", "p:sonam-gyatso", "索南嘉措与俺答汗会晤后达赖喇嘛称号流行", "称号、前世追认和蒙古地区传播相互连接，不能把后世序号提前当作当时自称。", "1578", "1588", "1578至1588年", "格鲁与蒙古传播层"),
  event("tangtong-memory", "cult-evolution", "p:thangtong-gyalpo", "唐东杰布成为桥梁、戏剧与长寿修行的复合文化形象", "工程遗迹、传记和地方表演传统分别保存其影响。", "1450", "1900", "约十五至十九世纪", "藏地工程与民间记忆层"),
  event("jonang-survival", "cult-evolution", "sys:jonang", "觉囊传统在制度改组后于安多等地延续", "寺院转属与教法传承并非同一过程，后世复兴据地方资料分区记录。", "1650", "1900", "约十七至十九世纪", "觉囊传播与复兴层"),
  event("rime-network", "cult-evolution", "sys:rime", "康区跨宗派保存活动被后世概括为利美取向", "钦哲、康楚和秋吉林巴的合作并未取消各自法脉，后世命名须避免过度统一。", "1800", "1900", "十九世纪", "康区跨宗派接受史层")
];

function resolveRef(reference, worldId) {
  const cut = reference.indexOf(":");
  const scope = reference.slice(0, cut);
  const key = reference.slice(cut + 1);
  if (scope === "p") return tibetanEntityId(`person-${key}`, worldId);
  if (scope === "g") return tibetanEntityId(`group-${key}`, worldId);
  if (scope === "sys") return tibetanEntityId(`system-${key}`, worldId);
  if (scope === "src") return tibetanSourceId(key, worldId);
  throw new Error(`未知藏传佛教批引用：${reference}`);
}

function buildRelation(row, worldId, now) {
  return { id: `relation:${worldId}:mythology:buddhism-tibetan:${row.key}`, worldId, sourceEntityId: resolveRef(row.sourceRef, worldId), targetEntityId: resolveRef(row.targetRef, worldId), kind: row.kind, label: row.label, direction: row.direction, strength: row.strength, evidenceType: row.evidenceType, sourceCitation: row.sourceCitation, historicalScope: row.historicalScope, confidence: row.confidence, notes: row.notes, updatedAt: now };
}

function buildTimelineEvent(row, worldId, now, index) {
  const primary = resolveRef(row.ref, worldId);
  return { id: `timeline-event:${worldId}:mythology:buddhism-tibetan:${row.key}`, worldId, entityId: primary, questId: "", sceneId: "", references: [{ kind: "entity", id: primary }], trackId: trackId(row.trackKey, worldId), title: row.title, summary: row.summary, displayDate: row.displayDate, datePrecision: row.startValue === row.endValue ? "year" : "range", sortOrder: 1000 + index * 2, startValue: row.startValue, endValue: row.endValue, era: row.era, dependencyIds: [], updatedAt: now };
}

function assertBatchShape() {
  const relationCount = membershipRelations.length + sourceRelations.length + sequenceRelations.length + anchorRelations.length + crossRelations.length;
  const checks = [[groupRows.length, 6, "人物分区"], [figureRows.length, 80, "人物"], [systemRows.length, 12, "传统制度"], [sourceRows.length, 8, "史料"], [relationCount, 340, "关系"], [eventRows.length, 30, "事件"]];
  for (const [actual, expected, label] of checks) if (actual !== expected) throw new Error(`${BATCH_LABEL}${label}数量应为 ${expected}，实际为 ${actual}`);
}

function buildBuddhismTibetanBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
  assertBatchShape();
  const figures = figureRows.map((row, index) => buildFigureEntity(row, index, worldId, now));
  const systems = systemRows.map((row, index) => buildSystemEntity(row, figures.length + index, worldId, now));
  const sources = sourceRows.map((row, index) => buildSourceEntity(row, figures.length + systems.length + index, worldId, now));
  const groups = groupRows.map((row, index) => buildGroupEntity(row, figures.length + systems.length + sources.length + index, worldId, now));
  const relationRows = [...membershipRelations, ...sourceRelations, ...sequenceRelations, ...anchorRelations, ...crossRelations];
  return {
    key: BATCH_KEY,
    label: BATCH_LABEL,
    entities: [...figures, ...systems, ...sources, ...groups],
    figures,
    systems: [...systems, ...groups],
    sources,
    relations: relationRows.map((row) => buildRelation(row, worldId, now)),
    timelineEvents: eventRows.map((row, index) => buildTimelineEvent(row, worldId, now, index)),
    featuredEntityIds: [tibetanEntityId("person-tsongkhapa", worldId), tibetanEntityId("person-padmasambhava", worldId), tibetanEntityId("person-sakya-pandita", worldId), tibetanEntityId("person-milarepa", worldId), tibetanEntityId("system-early-diffusion", worldId), tibetanEntityId("system-rime", worldId)]
  };
}

module.exports = { BATCH_KEY, BATCH_LABEL, buildBuddhismTibetanBatch, tibetanEntityId, tibetanSourceId, groupRows, figureRows, systemRows, sourceRows, eventRows, WORLD_ID, categoryId };
