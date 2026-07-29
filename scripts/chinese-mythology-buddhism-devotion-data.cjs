const {
  WORLD_ID,
  categoryId
} = require("./chinese-mythology-history-data.cjs");
const {
  buddhismEntityId: transmissionEntityId,
  buddhismSourceId: transmissionSourceId
} = require("./chinese-mythology-buddhism-transmission-data.cjs");

const BATCH_KEY = "buddhism-devotion-protectors-08";
const BATCH_LABEL = "阶段 3 · 菩萨道场、罗汉与护法天部第二批";

function devotionEntityId(key, worldId = WORLD_ID) {
  return `entity:${worldId}:mythology:buddhism-devotion:${key}`;
}

function devotionSourceId(key, worldId = WORLD_ID) {
  return devotionEntityId(`source-${key}`, worldId);
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
    `<h2>${escapeHtml(row.profileHeading || "身份与叙事位置")}</h2><p>${escapeHtml(row.profile)}</p>`,
    `<h2>${escapeHtml(row.receptionHeading || "进入汉语世界")}</h2><p>${escapeHtml(row.reception)}</p>`,
    `<h2>${escapeHtml(row.distinctionHeading || "辨读边界")}</h2><p>${escapeHtml(row.distinction)}</p>`,
    "<h2>原典坐标</h2>",
    `<p>${escapeHtml(row.sourceNote)}</p><ul>${sourceItems}</ul>`,
    "<h2>创作使用</h2>",
    `<p>${escapeHtml(row.boundary)}</p>`
  ].join("");
}

function figure(row) {
  return {
    tradition: "佛教",
    confidence: "主流说法",
    sourceEvidenceType: "primary-text",
    worship: "经中身份、寺院礼仪、造像形制与地方传说按年代分层记录，不以今日通行样式倒推早期共同传统。",
    regionalVariants: "梵名、汉译、图像题名和地方称号可能各自成层，只有证据明确时才标为同一身份。",
    ...row
  };
}

const arhatOrdinals = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五", "十六"];
const arhatDefinitions = [
  ["pindola-bharadvaja", "宾度罗跋啰惰阇", "宾头卢跋罗堕阇、宾头卢尊者、Pindola Bharadvaja", "西瞿陀尼洲", "一千", "第一位尊者的译名在汉地最容易与早期经律中的宾头卢传说相接，也因此最早获得独立供养。"],
  ["kanakavatsa", "迦诺迦伐蹉", "迦诺迦伐蹉尊者、Kanakavatsa", "北方迦湿弥罗国", "五百", "第二位尊者被安置在迦湿弥罗国，这一地点比四洲神话地理更接近佛教传播史中的真实区域。"],
  ["kanaka-bharadvaja", "迦诺迦跋厘堕阇", "迦诺迦跋厘堕阇尊者、Kanaka Bharadvaja", "东胜身洲", "六百", "第三位尊者与第二位都以迦诺迦开头，汉地题名和近代通俗名单常把两者错换，必须连同全名辨认。"],
  ["subinda", "苏频陀", "苏频陀尊者、Subinda", "北俱卢洲", "七百", "第四位尊者住处被写在北俱卢洲，说明《法住记》的空间并非一张可以直接落到现代地图上的巡礼路线。"],
  ["nakula", "诺距罗", "诺矩罗、诺距罗尊者、Nakula", "南赡部洲", "八百", "第五位尊者所在的南赡部洲也是佛典叙述人间世界的常用名称，但经文没有进一步指定城邦。"],
  ["bhadra", "跋陀罗", "跋陀罗尊者、Bhadra", "耽没罗洲", "九百", "第六位尊者的驻地耽没罗洲存在音译与地理解释问题，不能仅凭近音锁定一处现代岛屿。"],
  ["kalika", "迦理迦", "迦理迦尊者、Kalika", "僧伽荼洲", "一千", "第七位尊者的材料很短，名字、眷属数和驻地之外，后世画师才逐渐为他安排手势、器物和性格。"],
  ["vajraputra", "伐阇罗弗多罗", "伐阇罗弗多罗尊者、Vajraputra", "钵刺拏洲", "一千一百", "第八位尊者之名带有金刚意涵，仍不能据此把他直接并入金刚手或密教忿怒尊体系。"],
  ["jivaka", "戍博迦", "戍博迦尊者、Jivaka", "香醉山", "九百", "第九位尊者住香醉山，山名带着佛典宇宙地理的感官色彩，却没有提供可换算的方位与里程。"],
  ["panthaka", "半托迦", "半托迦尊者、Panthaka", "三十三天", "一千三百", "第十位尊者被安排在三十三天，名单由人间、洲岛转入天界，正好显出法住叙事的神圣空间尺度。"],
  ["rahula-arhat", "啰怙罗", "罗怙罗尊者、Rahula", "毕利扬瞿洲", "一千一百", "第十一位尊者的音译与释迦之子罗睺罗接近，汉译写法却不能单独证明两页必然是同一人物。"],
  ["nagasena", "那伽犀那", "那伽犀那尊者、Nagasena", "半度波山", "一千二百", "第十二位尊者与《弥兰王问经》的那先常被联想，现存《法住记》只给出名单位置，不能替两套传统一步合档。"],
  ["angaja", "因揭陀", "因揭陀尊者、Angaja", "广胁山", "一千三百", "第十三位尊者居广胁山，后世图像中出现的布袋、经卷或香炉需要从题记和画谱另行追查。"],
  ["vanavasin", "伐那婆斯", "伐那婆斯尊者、Vanavasin", "可住山", "一千四百", "第十四位尊者的名字常被解释为林居者，经文所给的可住山仍是法住世界中的特定驻地。"],
  ["ajita-arhat", "阿氏多", "阿氏多尊者、Ajita", "鹫峰山", "一千五百", "第十五位尊者之名与阿逸多近似，不能因此自动并为弥勒；名单把他列作护法罗汉而非未来佛。"],
  ["culapanthaka", "注荼半托迦", "周利槃特、注荼半托迦尊者、Culapanthaka", "持轴山", "一千六百", "第十六位尊者的音译后来常与周利槃特传说相接，但《法住记》本身只把他放在十六人名单末位。"]
];

function canonicalArhat(definition, index) {
  const [key, title, aliases, residence, retinue, readingNote] = definition;
  return figure({
    key,
    title,
    category: "arhats",
    identityType: "罗汉",
    aliases,
    historicalLayer: "隋唐",
    confidence: "明确",
    summary: `玄奘译《法住记》所列第${arhatOrdinals[index]}位护法罗汉，住处记为${residence}。`,
    earliestSource: "《大阿罗汉难提蜜多罗所说法住记》现存汉译名单",
    sourceLocation: `《法住记》十六大阿罗汉名号与住处段，第${arhatOrdinals[index]}尊`,
    domains: "受嘱护持释迦正法、应供与随缘示现",
    iconography: "汉地绘画、塑像与题赞各有姿态和器物；《法住记》没有提供可据以复原的个人肖像。",
    lead: `${title}在《法住记》中没有一篇铺开的个人传记。经文只让名字、住处和眷属数量依次出现，却正是这份克制的名单，成为后来罗汉堂与成组绘画反复回看的根。`,
    profile: `庆友所传名单把${title}列为第${arhatOrdinals[index]}位，说他多分住在${residence}，与${retinue}名阿罗汉眷属一同护持正法。这里的数字和空间属于经中法住叙事，不是寺院户籍。`,
    reception: `${readingNote}汉地造像为十六尊逐步分配容貌、衣纹、坐具和象征物，不同寺院的次序也可能随题赞、翻刻或修复而改变。`,
    distinction: `${title}首先以《法住记》的完整音译名识别。俗称、画谱名和外语还原只能作为检索别名，若与佛弟子或另一位同名人物相连，必须保留“可能对应”而不是直接覆盖。`,
    sourceList: ["《大阿罗汉难提蜜多罗所说法住记》十六尊者名单", "同经十六尊者住处与眷属段", "汉地罗汉图像题记对读"],
    sourceNote: `本页以玄奘译本第${arhatOrdinals[index]}名及其驻地为硬边界，后世形象只在有题记、画赞或寺志时另加年代。`,
    boundary: `可以围绕${residence}与护法誓愿设计明确标注的神圣场景；个人口头禅、固定法器、降妖经历和同伴关系若无题记支持，均属项目改编。`,
    sourceRef: "b2s:arhat-abiding-record",
    sourceCitation: `《大阿罗汉难提蜜多罗所说法住记》第${arhatOrdinals[index]}尊名号与住处段`
  });
}

const figureRows = [
  ...arhatDefinitions.map(canonicalArhat),
  figure({
    key: "nandimitra",
    title: "庆友尊者（难提蜜多罗）",
    category: "arhats",
    identityType: "罗汉",
    aliases: "难提蜜多罗、庆友大阿罗汉、Nandimitra",
    historicalLayer: "隋唐",
    confidence: "明确",
    summary: "《法住记》的说法者，以临涅槃前的问答传出十六罗汉护法名单。",
    earliestSource: "《大阿罗汉难提蜜多罗所说法住记》",
    sourceLocation: "《法住记》开篇、十六罗汉问答及卷末示寂段",
    domains: "传述法住期限、说明十六罗汉、劝护佛法",
    iconography: "后世可能作为第十七尊增入罗汉群像，但经文中的位置是名单传述者，不在十六人之内。",
    lead: "庆友面对的不是一场寻常问答。众人听说他将入涅槃，追问释迦正法还能住世多久；他由此讲出十六罗汉的名字、住处和未来使命。",
    profile: "经文称难提蜜多罗意译庆友，住在师子国胜军王都。十六罗汉是他转述的佛陀付嘱对象，他本人在说法之后示现神变、入灭并由众人起塔。",
    reception: "汉地把说法者与受嘱名单放在同一组画面时，庆友有时被视作第十七尊。这个构图习惯推动十八罗汉的形成，却不能改写玄奘译文的计数。",
    distinction: "庆友不是十六罗汉名单中的第一人宾度罗，也不能凭“记述者”身份自动列作佛陀同时代弟子。经文自称故事发生在佛灭后八百年，属于自身叙事纪年。",
    sourceList: ["《大阿罗汉难提蜜多罗所说法住记》开篇", "同经十六罗汉问答", "同经庆友示寂结尾"],
    sourceNote: "先读经文中庆友的叙事位置，再观察汉地题赞如何把他移入群像；两层计数分别保留。",
    boundary: "可写临别问答与法住焦虑；若补写庆友早年、王室关系或与十六尊逐一会面，必须标为文学重建。",
    sourceRef: "b2s:arhat-abiding-record",
    sourceCitation: "《大阿罗汉难提蜜多罗所说法住记》开篇及卷末"
  }),
  figure({
    key: "dragon-subduing-arhat",
    title: "降龙罗汉（汉地俗称）",
    category: "buddhist-sinicization",
    identityType: "罗汉",
    aliases: "降龙尊者、降龙罗汉",
    historicalLayer: "明清",
    confidence: "后世附会",
    summary: "汉地罗汉图像和传说中的功能称号，不见于玄奘译《法住记》十六人名单。",
    earliestSource: "宋元以后罗汉画赞、寺院题名与通俗传说逐渐汇成的称号",
    sourceLocation: "需按具体罗汉堂题记、画谱和地方寺志核对；《法住记》用作名单反证",
    domains: "降伏龙类、护法与水患想象中的罗汉形态",
    iconography: "常与龙相对或使龙盘绕身侧，姿态并无跨地域统一版本。",
    lead: "“降龙”听起来像一位古经中早已定名的尊者，其实它更像画面先说话：龙、风云和罗汉被摆到一起，观者再用一个有动作的称号记住他。",
    profile: "玄奘译《法住记》逐一列出十六名，没有降龙这一名号。宋元以后成组罗汉不断扩写，降龙遂在寺院塑像、绘画和口头讲述中获得独立位置。",
    reception: "不同地区会把降龙对应到迦叶、庆友、宾头卢或济颠等人物，答案并不稳定。本页保存的是汉地功能形象，不替任何一位经中罗汉改名。",
    distinction: "降龙罗汉与济公的降龙罗汉转世说、道教降龙伏虎法术及佛典龙众都须分开。若一座寺院有明确题名，可建立当地版本关系。",
    sourceList: ["《法住记》十六尊者名单（未载降龙名号）", "宋元明清罗汉画赞与寺院题记", "地方寺志中的降龙、伏虎配对"],
    sourceNote: "《法住记》用于确认早期名单边界，实际称号年代由图像题记和寺志逐件判断，不能以通俗流行度代替出处。",
    boundary: "适合创作明确标注的汉地寺院传说；龙的来历、降伏过程、真名与转世身份不得冒充古经原文。",
    sourceRef: "b2s:arhat-abiding-record",
    sourceLabel: "原典名单对照入口",
    sourceEvidenceType: "textual-variant",
    sourceCitation: "《大阿罗汉难提蜜多罗所说法住记》十六尊者名单"
  }),
  figure({
    key: "tiger-taming-arhat",
    title: "伏虎罗汉（汉地俗称）",
    category: "buddhist-sinicization",
    identityType: "罗汉",
    aliases: "伏虎尊者、伏虎罗汉",
    historicalLayer: "明清",
    confidence: "后世附会",
    summary: "与降龙并列流传的汉地罗汉称号，以猛虎驯伏图像表达定力与护持。",
    earliestSource: "宋元以后罗汉画赞、寺院题名与通俗传说层",
    sourceLocation: "按各地罗汉堂、画轴题名与寺志核对；玄奘译名单不载此名",
    domains: "伏虎、山林护持与威猛定力的图像表达",
    iconography: "多见罗汉与虎安坐、相依或彼此注视，老虎既可表示被驯服，也可成为随侍。",
    lead: "伏虎罗汉的魅力不在一段统一传记，而在罗汉与猛兽之间那点安静。画师可以让虎俯卧、回头或贴近膝前，威猛便从搏斗转成了不必动手的定力。",
    profile: "《法住记》的十六个音译名中没有伏虎。汉地罗汉群像扩展以后，它常与降龙成对，占据十八罗汉中最容易辨认的两席。",
    reception: "民间解释会把伏虎安到不同尊者名下，也会与丰干、济公等高僧传说互相借用。图像相似不代表人物谱系已经统一。",
    distinction: "伏虎罗汉不是所有“僧人与虎”故事的主角，也不能与道教赵公明黑虎、山神虎使或文殊坐骑混为一谈。",
    sourceList: ["《法住记》十六尊者名单（未载伏虎名号）", "罗汉画赞和寺院题记", "降龙伏虎成对排列的地方记录"],
    sourceNote: "以经文名单确认缺席，再按有年代的图像和寺志追踪称号；若仅有现代说明牌，只列作当代命名。",
    boundary: "可写山寺、猛兽与修行者相处的原创故事；老虎姓名、降伏奇迹和尊者本名都需明确标注项目设定。",
    sourceRef: "b2s:arhat-abiding-record",
    sourceLabel: "原典名单对照入口",
    sourceEvidenceType: "textual-variant",
    sourceCitation: "《大阿罗汉难提蜜多罗所说法住记》十六尊者名单"
  }),
  figure({
    key: "princess-miaoshan",
    title: "妙善公主",
    category: "buddhist-sinicization",
    identityType: "其他",
    aliases: "妙善、香山妙善、大悲观音本行中的三公主",
    historicalLayer: "宋元",
    confidence: "后世附会",
    summary: "北宋香山碑传系统中的观音本行人物，以拒婚、修行与舍手眼救父串起中国化传说。",
    earliestSource: "北宋元符年间《香山大悲菩萨传》碑传系统",
    sourceLocation: "《香山大悲菩萨传》妙庄王三女、香山修行与大悲成就段",
    domains: "观音中国化本行、孝亲、拒婚与舍身救苦",
    iconography: "可作未出家公主、香山行者或手眼施舍后的大悲形象；三种阶段不应塞进同一身造型。",
    lead: "妙善的故事从一句“不嫁”开始，却没有停在宫廷冲突。她离开父王安排的生活，在香山修行，后来又以手眼为药救治父亲；亲情、反抗和慈悲被压在同一条叙事弧线上。",
    profile: "现存可考的关键文本是北宋香山碑传。传中妙庄王的第三女妙善历经磨难，最终显为大悲观世音；这不是《法华经·普门品》中的观音生平。",
    reception: "妙善传让汉地读者用公主、女儿和孝亲语言理解观音，也影响宝卷、戏曲和地方香山信仰。后世版本增添地名、姐妹、刑罚和团圆细节，需逐本标记。",
    distinction: "妙善是观音中国化本行中的化身说，不等于历史王女已被考古证实。她与善财、龙女、白衣观音及送子观音都有关联，却不是同一类身份。",
    sourceList: ["北宋《香山大悲菩萨传》碑传", "后续香山宝卷和地方重刻本", "《妙法莲华经·观世音菩萨普门品》作身份对照"],
    sourceNote: "人物骨架以北宋碑传为起点，宝卷和戏曲只用于追踪改写；凡自称唐代天神口授的部分保留为文本内部溯源。",
    boundary: "可以在明确标注“宋代以后观音本行”的前提下改编；新增王国年代、宫廷对白和历史地图均不能写成传统文化事实。",
    sourceRef: "b2s:xiangshan-biography",
    sourceEvidenceType: "historical-record",
    sourceCitation: "北宋《香山大悲菩萨传》碑传"
  }),
  figure({
    key: "kim-gaksak",
    title: "金地藏（金乔觉）",
    category: "buddhist-sinicization",
    identityType: "历史人物",
    aliases: "释地藏、金乔觉、新罗地藏、九华金地藏",
    historicalLayer: "隋唐",
    confidence: "主流说法",
    summary: "《宋高僧传》所记新罗僧释地藏，九华山传统后来将其视作地藏菩萨应化。",
    earliestSource: "《宋高僧传》卷二十《唐池州九华山化城寺地藏传》",
    sourceLocation: "卷二十新罗出身、九华苦行、建寺与入塔段",
    domains: "九华山修行、僧团建立与地藏应化传统",
    iconography: "九华肉身信仰常作僧形地藏，圆顶、袈裟与锡杖不同于戴冠地藏或经中菩萨装。",
    lead: "金地藏先是一位走进九华山的僧人。《宋高僧传》写他来自新罗王族，在山中以白土和少米度日，村人见其苦行，才共同建起伽蓝。",
    profile: "传记称僧名地藏，记其居九子山、聚徒、示寂与肉身入塔。金乔觉这一姓名和更完整的王子履历在后世山志中逐渐固定，不能全部倒灌进宋代传文。",
    reception: "九华山把僧人事迹与地藏菩萨信仰相接，形成肉身殿、诞辰与朝山传统。称其“地藏菩萨化身”属于信仰解释，不是两页应当删除差别的理由。",
    distinction: "金地藏不等同佛典中的地藏菩萨，也不是暹罗王子。历史僧、宋代传记、九华地方记忆和菩萨应化说分别保留。",
    sourceList: ["《宋高僧传》卷二十《唐池州九华山化城寺地藏传》", "九华山后世山志", "《地藏菩萨本愿经》作菩萨身份对照"],
    sourceNote: "以《宋高僧传》为人物底本，姓名、年代和王族细节若只见后出山志便单独标层；应化关系只写“后世视为”。",
    boundary: "可写山居、村民建寺和跨海求法；白犬善听、完整宫廷身世及神迹对白若无早期出处，须标为后起传说或原创。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《宋高僧传》卷二十《唐池州九华山化城寺地藏传》"
  }),
  figure({
    key: "sudhana",
    title: "善财童子",
    category: "bodhisattvas",
    identityType: "菩萨",
    aliases: "善财、善财童子、Sudhana",
    historicalLayer: "隋唐",
    confidence: "明确",
    summary: "《华严经·入法界品》的求法行者，以连续参访善知识呈现菩萨行的开放道路。",
    earliestSource: "华严类经典善财求法叙事",
    sourceLocation: "《大方广佛华严经·入法界品》文殊发心、五十三参及普贤行愿段",
    domains: "参学、善知识、菩萨行与求法旅行",
    iconography: "汉地常作童子，与龙女分立观音左右；这一侍从构图晚于《华严经》本身。",
    lead: "善财的修行不是守着一位老师听到结业。他从文殊处发心，沿途拜访僧人、长者、女子、医者、船师与菩萨，每一站都只给下一段路的一把钥匙。",
    profile: "《入法界品》用连续参访展示善知识可以来自多种身份。所谓“五十三参”是汉地概括，具体计数与分段会随华严译本和注疏方式变化。",
    reception: "善财后来进入观音图像，常与龙女组成一男一女两位胁侍。这个稳定构图把华严求法者和法华龙女放进同一礼拜空间，是中国图像史的新组合。",
    distinction: "善财不是观音的血缘儿子，也不等同招财童子。童子身份表示经中形象，不能把现代商业吉祥寓意写回华严旅程。",
    sourceList: ["《大方广佛华严经·入法界品》", "六十卷与八十卷华严对读", "观音三尊造像题记"],
    sourceNote: "以华严经的参访次序建立人物关系，观音胁侍身份另按造像年代记录，不拼成经中原始组合。",
    boundary: "适合写公路式求法与多职业世界；每位善知识的现代职业、路线地图和善财内心独白若超出经文，须标文学重建。",
    sourceRef: "bs:avatamsaka-sutra",
    sourceCitation: "《大方广佛华严经·入法界品》"
  }),
  figure({
    key: "dragon-girl-lotus",
    title: "龙女（《法华经》）",
    category: "bodhisattvas",
    identityType: "菩萨",
    aliases: "娑竭罗龙王女、龙女、八岁龙女",
    historicalLayer: "魏晋六朝",
    confidence: "明确",
    summary: "《法华经·提婆达多品》中迅速成佛的龙王女，以女性、幼年与非人身份回应成佛资格争论。",
    earliestSource: "《妙法莲华经·提婆达多品》",
    sourceLocation: "文殊从龙宫来、智积质疑、龙女献珠与南方成佛段",
    domains: "成佛平等、献珠譬喻、龙宫法会与经文论辩",
    iconography: "汉地观音造像中常与善财成对，手持宝珠；这与经中献珠动作有关，但胁侍位置属后起构图。",
    lead: "龙女出场时只有八岁，面前却站着一整套不信任：年纪太小、是女性、又属于龙族。她献珠、发问，随后以比众人接珠更快的速度完成经文的回答。",
    profile: "《提婆达多品》让文殊说明龙宫教化，再由智积和舍利弗提出疑难。龙女转身示现成佛，是法华叙事中的神圣事件，不是可编入世俗年表的历史新闻。",
    reception: "在汉地，龙女逐渐与善财同侍观音，宝珠成为醒目标志。她也被用于讨论女性修行，但不同宗派对“转女身”与平等义的解释并不相同。",
    distinction: "本页只指法华经中的娑竭罗龙王女，不与东海龙女、柳毅传书龙女或民间龙王公主合并。观音胁侍身份必须另标图像史层。",
    sourceList: ["《妙法莲华经·提婆达多品》", "法华经汉译本对读", "善财龙女观音胁侍造像题记"],
    sourceNote: "成佛叙事严格以《提婆达多品》为界，性别解释和观音胁侍构图按后世注疏与图像分层。",
    boundary: "可据献珠与论辩创作法会场景；龙宫家族、成长经历和与善财的日常关系若无文本依据，均属项目改编。",
    sourceRef: "bs:lotus-sutra",
    sourceCitation: "《妙法莲华经·提婆达多品》"
  }),
  figure({
    key: "weituo",
    title: "韦驮天",
    category: "buddhist-protectors",
    identityType: "护法",
    aliases: "韦天将军、韦将军、护法韦驮",
    historicalLayer: "宋元",
    confidence: "主流说法",
    summary: "汉地寺院常见的少年武将护法，其谱系在道宣感通传与南宋《重编诸天传》中逐渐固定。",
    earliestSource: "唐代道宣感通传系统；南宋《重编诸天传》汇编成传",
    sourceLocation: "《重编诸天传》韦天将军传及其所引律相感通材料",
    domains: "守护伽蓝、护持僧众戒律与驱除修行障碍",
    iconography: "常作少年武将，披甲、合掌横持金刚杵；杵的方向与寺院接待俗解并非古典统一规则。",
    lead: "韦驮站在许多寺院的天王殿背面，面对大雄宝殿。他既像将军，又常保留少年面容；甲胄提供威严，合掌则把武力收进护法秩序。",
    profile: "《重编诸天传》称韦将军为南方天王部下，追述其向道宣示现并护持戒律。文本把梵语解释、汉姓将军和天部谱系揉在一起，正好显示中国化过程。",
    reception: "唐宋以后韦驮像进入伽蓝布局，逐渐承担守寺、护僧与察看来客的职能。现代常说金刚杵朝向表示是否留宿，这类说明需有当地寺规才可采用。",
    distinction: "韦驮天与印度塞建陀、金刚手以及中国姓韦的历史将军不能无条件合并。南宋文本自身已经在解释不同语源，条目保留这种不整齐。",
    sourceList: ["《重编诸天传·韦天将军传》", "《道宣律师感通录》", "《律相感通传》"],
    sourceNote: "以唐代感通文本和南宋重编本核对名称与职能，寺院陈设则需要造像年代或寺志支持。",
    boundary: "可写寺门守护和僧团纪律；武器神技、现代住宿暗号和与关羽的固定搭档关系若无地方记录，均属改编。",
    sourceRef: "b2s:compiled-heavenly-deities",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《重编诸天传·韦天将军传》及所引感通传"
  }),
  figure({
    key: "guanyu-garland",
    title: "关羽伽蓝（佛教护法形态）",
    category: "buddhist-sinicization",
    identityType: "护法",
    aliases: "关王伽蓝、伽蓝关帝、关公护法",
    historicalLayer: "宋元",
    confidence: "后世附会",
    summary: "宋代佛教史传将关羽显灵、受戒和护持玉泉寺连成的伽蓝神形态，与历史关羽及道教关帝分层。",
    earliestSource: "北宋玉泉关王祠记系统，南宋《释门正统》《佛祖统纪》扩写",
    sourceLocation: "《释门正统》玉泉寺关王祠堂记引文；《佛祖统纪》智者传相关段",
    domains: "寺院守护、地方伽蓝与忠义神佛教化",
    iconography: "多沿用红面长髯、袍甲或持刀的关公形象，置于伽蓝殿；并非印度佛典天部造型。",
    lead: "关羽进入佛寺，不是因为一部印度经典预先给他留了神位。宋代叙事把玉泉山的地方祠祀、智顗传说和关王忠义重新编到一起，才出现受戒护法的完整场面。",
    profile: "《释门正统》引张商英关王祠堂记，写关羽在玉泉现身、受五戒并助建道场。更早的智顗别传和隋代玉泉寺碑没有这段，沉默本身就是年代边界。",
    reception: "关王伽蓝后来随寺院和关帝信仰扩散，与道教封号、国家祭祀和民间行业神互相借力。佛寺中的护法身份只是关羽神格的一条支线。",
    distinction: "本页不是三国历史人物传，也不把关帝、武财神和伽蓝神合成一套自古不变的神职。每次连接都要写明宗教语境和成形年代。",
    sourceList: ["《释门正统》玉泉寺关王祠堂记引文", "《佛祖统纪》智者传关王段", "《国清百录·玉泉寺碑》作早期沉默对照"],
    sourceNote: "以宋代佛教史传确认护法故事的成形，同时对照隋唐早期智顗材料未载关王，避免把后传倒写成六世纪实录。",
    boundary: "适合写宋元以后寺院与地方社会互动；智顗与关羽的对白、建寺神工和受戒细节只能按后出传记或明确标原创。",
    sourceRef: "b2s:compiled-heavenly-deities",
    sourceEvidenceType: "historical-record",
    sourceCitation: "《释门正统》玉泉寺关王祠堂记引文；《佛祖统纪》相关段"
  }),
  figure({
    key: "sakra",
    title: "帝释天",
    category: "buddhist-protectors",
    identityType: "护法",
    aliases: "释提桓因、天帝释、因陀罗、忉利天主",
    historicalLayer: "跨时期",
    confidence: "明确",
    summary: "佛典中的三十三天之主，常向佛请法、护持正法；与中国天帝称号相似却不是天然同神。",
    earliestSource: "汉译阿含、大乘经及护国经典多层记载",
    sourceLocation: "《长阿含经》帝释相关篇；《金光明最胜王经》诸天护法段",
    domains: "忉利天统摄、请法、护持与天人福报",
    iconography: "可作帝王装天人，持宝盖或合掌；汉地冠服随朝代变化，不能当作印度神原貌。",
    lead: "帝释天在佛经里有权力，却并不站在觉者之上。他会请法、提问，也会因为福报和恐惧来到佛前；天主身份因此既显赫又有限。",
    profile: "阿含类经文称释提桓因，大乘和护国经又把他放入庞大的护法会众。三十三天与须弥山宇宙观属于佛典世界模型，不等同一座中国王朝宫城。",
    reception: "汉译中的“帝”“天主”让帝释容易与昊天、玉皇或道教天帝互相解释。仪礼可让诸天同席，知识库仍保留各自文献谱系。",
    distinction: "帝释天不是玉皇大帝的古印度别名，也不能与大梵天合并。印度因陀罗背景可用于比较，佛典角色必须按具体经本阅读。",
    sourceList: ["《长阿含经》帝释相关篇", "《金光明最胜王经》诸天护法段", "《重编诸天传·帝释天王传》"],
    sourceNote: "以早期汉译经文建立佛教身份，再用护国经和宋代诸天传观察汉地仪礼排序，跨传统同名只建争议关系。",
    boundary: "可写天人请法与护国法会；把帝释设成佛教最高神、玉皇旧名或固定政治盟主都需要明确标为改编。",
    sourceRef: "b2s:golden-light-sutra",
    sourceCitation: "《金光明最胜王经》诸天护法相关品"
  }),
  figure({
    key: "brahma",
    title: "大梵天",
    category: "buddhist-protectors",
    identityType: "护法",
    aliases: "梵天、梵王、娑婆世界主梵天",
    historicalLayer: "跨时期",
    confidence: "明确",
    summary: "佛典中的色界天主与请法者，其世界主称号在佛教叙事中仍受无常和层级限制。",
    earliestSource: "汉译阿含及多部大乘经",
    sourceLocation: "阿含梵天请法相关篇；《金光明最胜王经》法会会众与护法段",
    domains: "请转法轮、色界天众、护持说法",
    iconography: "汉地多作冠服天王或多面天人，具体形制受印度图像与中国仪礼双重影响。",
    lead: "大梵天最重要的一次动作不是创造世界，而是请佛说法。佛教借一位世界主的低首合掌，说明再高的天界福报也没有越过觉悟。",
    profile: "早期佛典和大乘经常写梵王来到法会、请法或赞叹。不同经中梵天名称、数量和世界范围并不一致，不能压成一位永恒唯一的造物主。",
    reception: "汉地斋天与水陆仪礼把大梵天列入诸天，造像也采用帝王礼服。儒道语境中的上帝、天皇和道教尊神与他可能同坛，却不是同一来源。",
    distinction: "大梵天与帝释分居不同天界，也不等于印度教后世梵天全部神话。佛典有时批评梵天误认自己是创造者，需依篇章说明。",
    sourceList: ["汉译阿含梵天相关篇", "《金光明最胜王经》", "《重编诸天传·大梵尊天传》"],
    sourceNote: "早期经文用于确认请法和天界身份，宋代诸天传只说明汉地供天排序；世界主称号不扩写成统一宇宙政治。",
    boundary: "可写请法与天界众会；创造万物、统辖佛菩萨或与中国昊天的秘密同一身份都属于另立设定。",
    sourceRef: "b2s:golden-light-sutra",
    sourceCitation: "《金光明最胜王经》诸天会众与护法段"
  }),
  ...[
    ["dhrtarastra", "持国天王", "提头赖吒、东方持国天、Dhritarashtra", "东方", "乾闼婆与毗舍阇众", "持国并非守住一座世俗国家，而是在护世四王结构中镇护东方。"],
    ["virudhaka", "增长天王", "毗楼勒叉、南方增长天、Virudhaka", "南方", "鸠槃荼与薜荔多众", "“增长”指善根与护法势力的增益，不宜改写成控制人口或农产的行政官。"],
    ["virupaksa", "广目天王", "毗楼博叉、西方广目天、Virupaksha", "西方", "龙众与富单那众", "广目与龙众关系让他在图像中常持龙或蛇，但不同造像也会使用塔、索等器物。"],
    ["vaisravana", "多闻天王", "毗沙门天、北方多闻天、Vaisravana", "北方", "夜叉与罗刹众", "多闻天王与独立发展的毗沙门天信仰关系密切，武财神式解释属于后续中国化支线。"]
  ].map(([key, title, aliases, direction, retinue, distinction]) => figure({
    key,
    title,
    category: "buddhist-protectors",
    identityType: "护法",
    aliases,
    historicalLayer: "跨时期",
    confidence: "明确",
    summary: `护世四天王之一，镇护${direction}并统领${retinue}；经文身份与寺门武将造型分层。`,
    earliestSource: "汉译阿含、护国经典及四天王相关经文",
    sourceLocation: `《金光明最胜王经·四天王护国品》及${title}相关段`,
    domains: `${direction}护世、护国听法与统领${retinue}`,
    iconography: `${title}在汉地常作披甲武将，持物因时代和造像组而变化；琵琶、剑、龙蛇、宝伞的固定配套属较晚图像惯例。`,
    lead: `${title}不是孤立站岗的神将。他与另外三王围绕须弥山分镇四方，带领各自部众来到佛前，护持说法，也承接王权对国土安宁的祈愿。`,
    profile: `《金光明最胜王经》让四王共同发愿护国、护法，${title}负责${direction}。经文中的国家、灾异和功德语言服务护国法会，不等于现代边防制度。`,
    reception: `汉地寺院把四王置于天王殿，武将甲胄和持物逐渐形成一眼可辨的组合。各地修复或重塑后，持物错换并不少见，题名比猜器物可靠。`,
    distinction,
    sourceList: ["《金光明最胜王经·四天王护国品》", "汉译四天王相关经典", "《重编诸天传》四王传"],
    sourceNote: `以护国品确认${title}在四王中的方位与共同誓愿，部众和持物另据经本、仪轨及有纪年的造像核对。`,
    boundary: `可写${direction}守护和寺门法会；现代国界、固定兵制、性格排行及法器超能力若无出处，须标为项目设定。`,
    sourceRef: "b2s:golden-light-sutra",
    sourceCitation: "《金光明最胜王经·四天王护国品》"
  })),
  figure({
    key: "hariti",
    title: "鬼子母",
    category: "buddhist-protectors",
    identityType: "护法",
    aliases: "诃利帝母、欢喜母、爱子母、Hariti",
    historicalLayer: "隋唐",
    confidence: "明确",
    summary: "佛教经律中由食子鬼神转为护产育、护儿童与护僧伽蓝的女性护法。",
    earliestSource: "佛教经律鬼子母因缘；义净译根本说一切有部律保存完整汉译叙事",
    sourceLocation: "《根本说一切有部毗奈耶杂事》鬼子母失幼子、受戒与寺院供食段",
    domains: "儿童养育、产育安稳、寺院供食与由害转护",
    iconography: "常抱幼儿、身边围绕群童，外观近母亲或贵妇；这与怖畏鬼神的前史形成张力。",
    lead: "鬼子母的转变并没有抹掉她曾经造成的恐惧。佛藏起她最疼爱的幼子，让她从自己的焦灼里看见别家父母的痛；护法身份由此带着悔改的重量。",
    profile: "律藏叙事称诃利底有众多子女，却取食城中儿童。受教后，她承诺不再伤害，并由僧团每日分食供养，逐渐成为寺院与育儿护法。",
    reception: "汉地把她称鬼子母、爱子母或欢喜母，图像常与儿童簇拥相连。地方求子习俗会借用其形象，但不能把所有送子女神都并入此页。",
    distinction: "鬼子母既不是观音的化身，也不等同道教送子娘娘。她与般阇迦、夜叉众及僧团供食的关系需要依律藏版本说明。",
    sourceList: ["《根本说一切有部毗奈耶杂事》鬼子母因缘", "汉译鬼子母经类", "寺院诃利帝母造像题记"],
    sourceNote: "以律藏因缘建立由害转护和僧团供食，求子、保产等地方职能按造像与仪礼年代另记。",
    boundary: "可写失子、受教与守护儿童；子女姓名、城市伤亡数字和与送子观音的亲属关系若无原文，均属改编。",
    sourceRef: "b2s:mulasarvastivada-vinaya",
    sourceCitation: "《根本说一切有部毗奈耶杂事》鬼子母因缘"
  }),
  ...[
    ["sarasvati", "大辩才天女", "辩才天、妙音天、Sarasvati", "辩才、音乐、记忆与护持诵经", "《金光明最胜王经·大辩才天女品》", "她与印度河神、语言女神的背景相连，汉地又突出诵经辩才；不能只用现代“艺术女神”概括。"],
    ["sri-mahadevi", "大吉祥天女", "吉祥天、功德天、Sri Mahadevi", "福德、资具、庄严与护持修行", "《金光明最胜王经·大吉祥天女品》", "吉祥天与民间招财女神、道教财帛星君并非天然同一身份，财富功德也不等于无条件赐财。"],
    ["prthivi", "坚牢地神", "坚牢地天、地神女、Prthivi", "大地承载、道场安稳与护持说法", "《金光明最胜王经·坚牢地神品》", "坚牢地神与中国后土、土地神可以同坛比较，文献谱系和性别形象仍需分开。"],
    ["pancika", "散脂大将", "散脂迦大将、僧慎尔耶药叉大将、Pancika传统相关名", "药叉统领、护法会众与受持经典", "《金光明最胜王经·僧慎尔耶药叉大将品》", "散脂、般阇迦与不同音译大将的对应并不完全整齐，不能只凭近音强行统一。"]
  ].map(([key, title, aliases, domains, sourceLocation, distinction]) => figure({
    key,
    title,
    category: "buddhist-protectors",
    identityType: "护法",
    aliases,
    historicalLayer: "隋唐",
    confidence: "明确",
    summary: `《金光明最胜王经》法会中的重要护法，以${domains}进入汉地诸天仪礼。`,
    earliestSource: "金光明经系汉译本及相关印度佛教传统",
    sourceLocation,
    domains,
    iconography: `${title}在壁画、经变和供天图中的服饰随时代变化，不能从一套晚期水陆画反推所有经本。`,
    lead: `${title}进入经文时，不是为了装饰一场宏大的法会。其承诺总落到可执行的事情上：听闻、守护、给予资具，或让说法和修行不被外缘打断。`,
    profile: `${sourceLocation}为其安排独立发愿和护持位置。这里的神力与受持经典相连，并不构成一套脱离佛法的自主神权。`,
    reception: `唐宋以后，${title}被列入斋天、水陆与寺院壁画的诸天群。仪礼排序会随宗派科本变化，名称也可能采用不同音译或意译。`,
    distinction,
    sourceList: [sourceLocation, "《金光明经》相关异译", "《重编诸天传》相应诸天传"],
    sourceNote: `先以义净译《金光明最胜王经》定位${title}，再用异译与宋代诸天传检查名称和仪礼排序，不把后世画面当成原经插图。`,
    boundary: `可写护经法会和天部之间的分工；现代职业化权能、固定性格、家族谱和与中国神祇的秘密同一关系均属改编。`,
    sourceRef: "b2s:golden-light-sutra",
    sourceCitation: sourceLocation
  }))
];

function institution(row) {
  return {
    entityType: "note",
    category: "buddhist-sinicization",
    tradition: "佛教",
    hierarchyLevel: "跨寺院、跨地区的信仰与仪礼形态",
    jurisdiction: "按经典、造像、寺院和地方材料分别说明",
    confidence: "主流说法",
    sourceEvidenceType: "historical-record",
    ...row
  };
}

const institutionRows = [
  institution({
    key: "guanyin-image-lineages",
    title: "汉地观音形象谱系",
    institutionKind: "图像与信仰形态",
    formationPeriod: "魏晋至明清持续变化",
    summary: "水月、白衣、送子及女相观音并非同一时刻出现，而是经典、绘画与地方愿望长期叠出的形象谱系。",
    earliestSource: "观音类汉译佛典、敦煌画题与宋元以来造像题记",
    sourceLocation: "《法华经·普门品》三十三身；大悲类经典；历代观音图像题记",
    variants: "经中观音、密教观音、水月观音、白衣观音、送子观音与妙善本行分层",
    lead: "观音在汉地没有只换过一次衣服。经文讲应以何身得度便现何身，画师把这种开放性落实为水边月影、白衣静坐、怀抱童子和女性面容；每次变化都回应新的观看与祈愿。",
    profile: "《普门品》提供多种示现的教义基础，却没有列出后世全部名相。水月观音重在观照意境，白衣观音与大悲、净瓶图像相接，送子观音则进入生育和家族生活。",
    reception: "宋元以后女相观音日渐普遍，妙善公主传又补出一套中国式本行。不同形象可在同一寺院并存，不能按服色推断一条简单的“男变女”日期。",
    distinction: "形象谱系不是多位观音必须合并的许可证。密教十一面、千手、如意轮等有仪轨依据，白衣、鱼篮和送子则各有图像与民俗来源。",
    sourceList: ["《妙法莲华经·观世音菩萨普门品》", "大悲与观音陀罗尼经群", "宋元明清观音造像、画赞与宝卷"],
    sourceNote: "先以具体经典确认名号和示现，再用有年代的图像题记追踪形态；现代商品名和旅游解说不充当早期证据。",
    boundary: "可以为项目设计一套观音形态，但须逐一标注“经中形态、历史图像或 Worldcraft Codex 原创改编”，不能把新造服装称为传统定制。",
    sourceRef: "bs:lotus-sutra",
    sourceCitation: "《妙法莲华经·观世音菩萨普门品》及历代观音图像题记"
  }),
  institution({
    key: "thousand-armed-compassion",
    title: "千手千眼观音与大悲法门",
    institutionKind: "陀罗尼、造像与忏仪",
    formationPeriod: "唐代译经后持续发展",
    summary: "千手象征遍行救护，千眼象征遍照苦难；大悲心陀罗尼使观音形象进入日常持诵和寺院仪礼。",
    earliestSource: "唐译千手千眼观音与大悲心陀罗尼类经典",
    sourceLocation: "《千手千眼观世音菩萨广大圆满无碍大悲心陀罗尼经》发愿、陀罗尼与利益段",
    variants: "千手、四十手、四十二臂等造像和仪轨系统；各译本咒句与手眼配置有别",
    lead: "千手不是为了把观音变成一尊难以辨认的奇观。每一只手都指向一种可以做出的救护，每一只眼都提醒救护先要看见；图像把“无量方便”压缩成可礼拜的身体。",
    profile: "大悲心陀罗尼经把观音的发愿、陀罗尼、护法会众和受持功德连在一起。千手千眼既是经中神圣形态，也通过四十手、四十二臂等造像方案获得可制作的秩序。",
    reception: "大悲咒进入汉地早晚课、忏仪与个人持诵后，千手观音成为最广泛的形象之一。各地读音、句数和手持物并不完全一致，不能用一套现代注音裁定古代唯一版本。",
    distinction: "千手观音与准提、如意轮、不空羂索等多臂尊像需要凭手印、持物和题记区分。千手是象征性数量，也不要求每件造像都雕出一千只完整手臂。",
    sourceList: ["《千手千眼观世音菩萨广大圆满无碍大悲心陀罗尼经》", "大悲类异译与仪轨", "唐宋以后千手观音造像题记"],
    sourceNote: "经文负责确认愿力和陀罗尼，造像仪轨负责说明手眼配置；持诵实践按寺院科本记录，不把今日读法写成古代原音。",
    boundary: "可围绕手眼功能设计创作形态；新增咒句、保证现实疗效或声称某一持物自古全国统一，均越过传统材料。",
    sourceRef: "b2s:great-compassion-dharani",
    sourceEvidenceType: "primary-text",
    sourceCitation: "《千手千眼观世音菩萨广大圆满无碍大悲心陀罗尼经》"
  }),
  institution({
    key: "four-sacred-mountains",
    title: "汉传佛教四大菩萨道场网络",
    institutionKind: "朝圣地理与后起总称",
    formationPeriod: "唐宋各山形成，明清以后总称趋于稳定",
    summary: "五台文殊、峨眉普贤、普陀观音、九华地藏各有不同形成史，四山并称是后起网络而非佛典原有名单。",
    earliestSource: "各山传记、朝山录、碑志与寺院沿革分别出现",
    sourceLocation: "《古清凉传》《补陀洛迦山传》《宋高僧传》及峨眉碑志；晚期清规出现四山并称",
    variants: "道场次序、中心寺院、显圣故事和朝山路线随时代与地区变化",
    lead: "把四座山画成一张巡礼图很方便，却容易遮住它们不同的来路。五台的文殊传统在唐代已经吸引远方僧人，普陀的观音、九华的地藏与峨眉的普贤又在各自年代逐渐成形。",
    profile: "四大名山并非某部印度佛典列出的中国地址。它是多座成熟道场后来被并置的总称，各山都需要经文象征、地方山水、寺院组织、国家敕赐和显圣传说共同支撑。",
    reception: "明清以后四山朝礼、进香图和寺院清规让这一组合深入人心。近现代旅游线路进一步固定名称，但不能反过来替唐宋材料补出不存在的统一管理机构。",
    distinction: "佛典中的补陀落迦、清凉山等神圣地名与中国实地的对应方式不同。道场关系是信仰地理，不表示菩萨只在一山、山神自古就是菩萨。",
    sourceList: ["《古清凉传》", "《补陀洛迦山传》", "《宋高僧传》九华地藏传", "峨眉山宋代碑记与后世山志"],
    sourceNote: "四山分别建立时间证据，再追踪“并称”为整体的晚期材料；地图同时显示神圣对应、历史寺院与现代行政位置。",
    boundary: "适合构建跨山朝圣路线；若设计四山联盟、固定排名或统一印信，必须标注 Worldcraft Codex 原创改编。",
    sourceRef: "b2s:ancient-qingliang-record",
    sourceCitation: "《古清凉传》等四山史料对读"
  }),
  institution({
    key: "sixteen-arhats-tradition",
    title: "十六罗汉法住传统",
    institutionKind: "护法名单、供养与群像",
    formationPeriod: "唐译《法住记》后在汉地持续发展",
    summary: "十六位罗汉受嘱护持释迦正法、接受施主供养并等待弥勒出世，是群像供养的经典骨架。",
    earliestSource: "玄奘译《大阿罗汉难提蜜多罗所说法住记》",
    sourceLocation: "十六尊者名号、住处、受施与法灭后使命段",
    variants: "译名、排序、画中姿态与供养仪式会变；十六这一经文计数保持为底本",
    lead: "十六罗汉的共同任务比个人传奇更早成形：释迦入灭后，他们不急于离世，而是留在不同洲山，随缘进入施会，护持正法直到弥勒时代。",
    profile: "《法住记》逐名列出十六尊者、眷属与住处，又说明他们可隐去圣者形貌接受供养。这为寺院罗汉斋、群像和法住主题绘画提供了紧密骨架。",
    reception: "汉地画家为一份简短名单补上姿态、器物和山水，十六尊因此拥有丰富视觉生命。名单的次序与题名仍可能在传抄、翻刻和修复中错位。",
    distinction: "十六罗汉不是释迦十大弟子的另一套简单扩充，也不是十八罗汉的残缺版本。庆友是说法者，降龙伏虎则为后起增补。",
    sourceList: ["《大阿罗汉难提蜜多罗所说法住记》", "十六罗汉画赞与造像题记", "寺院罗汉供养记录"],
    sourceNote: "所有成员先按玄奘译名和顺序连接；个人图像属性只有在题记明确时才进入关系，不靠后世俗称猜人。",
    boundary: "可创作十六尊共同护法的神圣场景；新增队长制度、个人法器和现代地图坐标必须标注改编。",
    sourceRef: "b2s:arhat-abiding-record",
    sourceEvidenceType: "primary-text",
    sourceCitation: "《大阿罗汉难提蜜多罗所说法住记》"
  }),
  institution({
    key: "eighteen-arhats-sinicization",
    title: "十八罗汉的汉地增补",
    institutionKind: "名单扩展与图像定型",
    formationPeriod: "宋元以后多说并行，明清通俗化",
    summary: "十六罗汉在汉地群像中增为十八，庆友、玄奘、降龙、伏虎等候选并不共享一张跨时代唯一名单。",
    earliestSource: "宋代罗汉题赞、群像讨论及后世寺院题名",
    sourceLocation: "《法住记》作十六人底本；宋元明清画赞、寺志与造像题记记录增补",
    variants: "第十七、十八尊可能是庆友与玄奘，也可能采用降龙、伏虎或其他地方名单",
    confidence: "明确",
    lead: "十八罗汉不是在十六人名单末尾简单添上两个名字。谁应站在新增位置，宋元以来一直有不同答案；每个答案都反映一套画面、题赞或地方寺院的选择。",
    profile: "《法住记》只列十六。汉地为了构图、纪念传译或吸收通俗护法形象，逐渐加入庆友、玄奘及降龙伏虎等候选，十八这个数字比两位新增者的身份更稳定。",
    reception: "明清罗汉堂和通俗印刷让降龙、伏虎极为醒目，也让不少读者误以为二名直接出自佛经。知识库按具体寺院保存名单，不制定全国统一答案。",
    distinction: "庆友、玄奘是文本传述和翻译人物；降龙、伏虎是功能称号。四者来源不同，即使同列一堂也不能互设别名。",
    sourceList: ["《法住记》十六人名单", "宋元罗汉画赞", "明清寺院罗汉堂题名与地方志"],
    sourceNote: "用《法住记》锁定原始计数，再让每座寺院和每套图像自行陈述新增者；没有题名的塑像只作待识别对象。",
    boundary: "项目可选择一套十八罗汉阵容，但必须在设定页写明采用哪一地方传统，不能称为佛经唯一标准。",
    sourceRef: "b2s:arhat-abiding-record",
    sourceLabel: "十六人底本对照",
    sourceEvidenceType: "textual-variant",
    sourceCitation: "《法住记》十六名单及宋元以后罗汉题赞"
  }),
  institution({
    key: "garland-guardian-system",
    title: "伽蓝护法与寺院守护",
    institutionKind: "寺院空间与护法信仰",
    formationPeriod: "唐宋持续整合",
    summary: "伽蓝原指僧园，护伽蓝神可来自佛典天部、地方神与感通传说；韦驮、关羽的普及道路并不相同。",
    earliestSource: "佛教经律护寺神传统、唐代感通记录与宋代寺院史传",
    sourceLocation: "道宣感通传系统、《重编诸天传》及玉泉关王祠记材料",
    variants: "韦驮、关王、土地与地方山神可各自护寺；殿堂设置和称号随寺院而异",
    lead: "一座寺院的守护者未必来自同一部经典。有人随佛法从经文进入，有人原是山川或地方祠神，也有人在高僧感通故事里受戒转身；伽蓝把这些来路不同的力量安置在共同空间。",
    profile: "韦驮由唐代律学感通叙事获得护僧职能，关羽伽蓝则在宋代玉泉寺故事中成形。二者后来常见于佛寺，却没有一份古代全国寺院必须照办的统一神位表。",
    reception: "伽蓝殿、天王殿与山门布局让护法形象变得日常。地方寺院还可能供奉本山土地、建寺功臣或区域神，关系需由寺志和碑记确认。",
    distinction: "“伽蓝菩萨”是尊称和职能归纳，不表示所有护寺神都达到同一教理位阶。历史关羽、关帝信仰与佛教关王护法必须分层。",
    sourceList: ["《道宣律师感通录》", "《重编诸天传》", "《释门正统》玉泉关王祠堂记引文"],
    sourceNote: "每位护法按自己的最早材料建页，再以寺院空间关系连接；没有年代的现代陈设不用于证明唐宋起源。",
    boundary: "可设计寺院守护体系，但新增神职、轮班制度和跨寺院总指挥必须标注 Worldcraft Codex 原创改编。",
    sourceRef: "b2s:compiled-heavenly-deities",
    sourceCitation: "《重编诸天传》及宋代伽蓝护法材料"
  }),
  institution({
    key: "four-kings-temple-guardians",
    title: "四天王护国与寺门造像",
    institutionKind: "护国经典、寺院殿堂与成组造像",
    formationPeriod: "南北朝至唐宋逐步定型",
    summary: "四王从须弥山护世和护国经典进入寺门空间，方位、部众与汉地持物需要分层阅读。",
    earliestSource: "汉译四天王相关经典与金光明经护国品",
    sourceLocation: "《金光明最胜王经·四天王护国品》及历代寺院造像题记",
    variants: "方位和四王名号较稳定，乐器、宝剑、龙蛇、宝伞等持物组合形成较晚且会错换",
    lead: "寺门里的四位武将不是为了营造一场热闹。他们把佛典须弥山四方压进建筑轴线：来客穿过天王殿，也就从世俗道路进入受护持的道场。",
    profile: "护国经让四王向佛发愿守护受持经典的国土。寺院造像又把四方守护改造成可步行穿越的空间，方位和视线比单件法器更重要。",
    reception: "唐宋以后四王甲胄越来越中国化，民间再用“风调雨顺”解释四件持物。这套谐音便于记忆，却不能当作早期佛典对职掌的定义。",
    distinction: "多闻天王可独立发展为毗沙门信仰，四王成组时又有共同职责。把四人简化成天气神，会丢失护法、听经和统领八部的文本层。",
    sourceList: ["《金光明最胜王经·四天王护国品》", "四天王经类", "唐宋以后天王殿造像与碑记"],
    sourceNote: "经文用于确认四方和护国誓愿，持物以有纪年的造像为准；“风调雨顺”单列民间解释年代。",
    boundary: "可以设计地方版天王殿持物，但要记录修造年代；新增天气权限或军团编制不得冒充佛典原说。",
    sourceRef: "b2s:golden-light-sutra",
    sourceEvidenceType: "primary-text",
    sourceCitation: "《金光明最胜王经·四天王护国品》"
  }),
  institution({
    key: "heavenly-deities-offering",
    title: "诸天供与护法仪礼",
    institutionKind: "寺院供天与护法科仪",
    formationPeriod: "隋唐经典基础，宋代科仪整理",
    summary: "梵天、帝释、四王、辩才、吉祥、坚牢等天部在供天仪礼中同坛，各自经典身份并未因此消失。",
    earliestSource: "《金光明经》诸天护法品群及宋代供天科仪整理",
    sourceLocation: "《金光明最胜王经》诸天品；《重编诸天传》序与各天传",
    variants: "天位排序、二十天或二十四天名单、供品与赞文因寺院科本而异",
    lead: "供天把许多来路不同的神圣人物排在同一场仪礼里。排列并不是宣布他们原本就是一套家族，而是请各自以既有誓愿护持佛法、道场和参与者。",
    profile: "金光明经系提供四王、辩才、吉祥、地神和药叉大将等护法群。南宋《重编诸天传》又讨论供天次序，说明当时寺院已经面对名单和位置不一的问题。",
    reception: "二十诸天、二十四天等组合在不同寺院流传，壁画和水陆画进一步扩展会众。仪礼同坛可产生视觉亲近，却不自动抹去印度佛教、地方神或后起汉化来源。",
    distinction: "斋天、供天与民间祭天不是同一仪式，大梵、帝释也不是道教玉皇的左右臣。名单必须连同科本和年代保存。",
    sourceList: ["《金光明最胜王经》诸天护法品群", "《重编诸天传》", "宋元以后供天科本与水陆画题名"],
    sourceNote: "先按具体经品建立天部身份，再记录科本如何排序；若某寺增列地方神，只在该寺版本中出现。",
    boundary: "项目可制作自己的诸天仪礼场景，但名单、座次和祝文若重新设计，须完整标注原创，不得称为通行古仪。",
    sourceRef: "b2s:compiled-heavenly-deities",
    sourceEvidenceType: "ritual-record",
    sourceCitation: "《重编诸天传》序及诸天传；《金光明最胜王经》"
  })
];

function sacredPlace(row) {
  return {
    tradition: "佛教",
    sourceEvidenceType: "historical-record",
    ...row
  };
}

const locationRows = [
  sacredPlace({
    key: "potalaka-scriptural",
    title: "补陀落迦山（佛典神圣地理）",
    spaceKind: "神话空间",
    historicalPeriod: "大乘佛典神圣叙事时间",
    confidence: "无法对应",
    summary: "观音经典中的住处或法会空间；它为中国普陀山命名提供宗教坐标，却不能等同一枚现代经纬度。",
    sourceTitle: "观音类汉译经典",
    sourceLocation: "《千手千眼大悲心陀罗尼经》补陀落迦山法会开篇及相关经本",
    modernCorrespondence: "印度、中国及海上多地均有对应传统，本页不指定唯一实地",
    lead: "补陀落迦山先存在于经文里：观音宫殿、宝座、海风与无数会众构成一处可被想象和礼拜的圣境。后来的人寻找它，并把寻找本身变成朝圣史。",
    profile: "观音类经本以不同音译书写山名，也可能给出海岛、山岩或南方方位。神圣地理的功能是安置法会和示现，不等于提供勘测坐标。",
    reception: "中国舟山普陀山、印度南方山地以及藏传传统各有对应解释。普陀山借此获得名字和圣境模板，但地方沿革仍需元明山志证明。",
    distinction: "佛典补陀落迦与浙江普陀山不是简单别名：前者是经中圣境，后者是历史朝圣地及其中国化对应。地图必须分层显示。",
    sourceList: ["《千手千眼观世音菩萨广大圆满无碍大悲心陀罗尼经》开篇", "观音类经本山名异译", "《补陀洛迦山传》中国道场解释"],
    sourceNote: "以具体经本保留音译和空间描述，不根据现代旅游路线反推古经位置；各实地对应另建关系。",
    boundary: "可创作神圣山境，但若赋予精确经纬度、行政边界或唯一入口，须标为项目设定。",
    sourceRef: "b2s:great-compassion-dharani",
    sourceEvidenceType: "primary-text",
    sourceCitation: "《千手千眼观世音菩萨广大圆满无碍大悲心陀罗尼经》开篇"
  }),
  sacredPlace({
    key: "putuo-mountain",
    title: "普陀山",
    spaceKind: "信仰传播区域",
    historicalPeriod: "唐宋传说积累，元明山志定型",
    confidence: "明确",
    summary: "浙江舟山的观音道场，以海路、拒去观音传说和寺院沿革将佛典补陀落迦转化为中国朝圣地。",
    sourceTitle: "《补陀洛迦山传》",
    sourceLocation: "洞宇封域、应感祥瑞与兴建沿革诸部分",
    modernCorrespondence: "浙江省舟山市普陀区普陀山",
    lead: "普陀山的朝圣先要过海。岛屿、潮汐和船路让观音救难不再只是文字中的承诺，香客抵达之前便已经在风浪里经历了一段祈愿。",
    profile: "元代《补陀洛迦山传》整理山体、寺院和感应故事，也追溯唐宋以来的观音像与拒去观音传统。它记录的是已形成的道场记忆，不是初创当年的现场日记。",
    reception: "元明以后普陀山成为全国性观音朝圣地，与白衣、南海和不肯去观音形象相连。国家敕赐、海商和地方寺院共同塑造其地位。",
    distinction: "普陀山是佛典补陀落迦在中国的一种历史对应，不证明经文原本专指舟山。南海观音也不能据名称锁定一片唯一海域。",
    sourceList: ["《补陀洛迦山传》", "宋元普陀寺院碑志", "观音类经典补陀落迦山段"],
    sourceNote: "地方沿革以山传和碑志为主，拒去观音等故事标为应感传统；经中圣境与岛屿实地建立“后世对应”关系。",
    boundary: "可写海路朝圣和寺院社会；唐代具体对白、航程细节及观音亲自指定岛名若无早期材料，须标后传或原创。",
    sourceRef: "b2s:potalaka-record",
    sourceCitation: "《补陀洛迦山传》"
  }),
  sacredPlace({
    key: "wutai-mountain",
    title: "五台山",
    spaceKind: "信仰传播区域",
    historicalPeriod: "北魏至唐代文殊道场成熟，后世持续扩展",
    confidence: "明确",
    summary: "清凉山与文殊信仰在华严解释、寺院网络和跨国朝圣中结合，唐代已成为高度成熟的圣山。",
    sourceTitle: "《古清凉传》",
    sourceLocation: "山名、寺院、文殊显圣与历代巡礼记录",
    modernCorrespondence: "山西省忻州市五台县及周边五台山区域",
    lead: "五台山的五座台顶把一片山地切成可巡礼的方向。僧人从寺院走向台顶，也在寒风、云雾和显圣传说之间寻找文殊；山路因此兼具地理和修行的尺度。",
    profile: "唐代《古清凉传》已经系统整理山名、寺院和文殊灵迹，显示道场并非一日建成。华严经的清凉意象、地方山形与国家佛教共同推动对应。",
    reception: "唐代五台吸引汉地、新罗、日本及后来的藏传佛教朝圣者。不同传统共享圣山，却会使用不同寺院、语言和文殊形态。",
    distinction: "五台山实地与经中清凉山是信仰对应，不是现代地理对古经的唯一解码。山上每一处传为显圣的地点也须按文献年代分层。",
    sourceList: ["《古清凉传》", "《入唐求法巡礼行记》五台山段", "《宋高僧传》五台感通传记"],
    sourceNote: "以唐代山传和朝圣记录建立寺院、路线和显圣层，现代行政地图只用于导航，不替代历史范围。",
    boundary: "适合写跨国朝圣与高山寺院生活；把所有台顶设为固定神官辖区或编造统一显圣年表属于项目改编。",
    sourceRef: "b2s:ancient-qingliang-record",
    sourceCitation: "《古清凉传》"
  }),
  sacredPlace({
    key: "emei-mountain",
    title: "峨眉山",
    spaceKind: "信仰传播区域",
    historicalPeriod: "唐宋普贤信仰增长，宋代国家营建显著",
    confidence: "明确",
    summary: "四川峨眉的普贤道场，以白水寺、山路、光相与宋代敕建铜像形成独特的高山信仰地理。",
    sourceTitle: "宋代峨眉碑记与游山记录",
    sourceLocation: "《峨眉山普贤寺新建铜殿记》及宋人峨眉行纪",
    modernCorrespondence: "四川省乐山市峨眉山市峨眉山",
    lead: "峨眉的山路不断改变身体感受：暑热退去，雾气、寒冷和高差接管行程。普贤的六牙白象与山顶光相在这里相遇，使登山本身成为行愿的比喻。",
    profile: "唐宋之间峨眉普贤信仰逐渐清晰，宋代朝廷营建和铜像记录提供较稳的历史节点。早期传说仍不能拼成从汉代开始的连续寺院档案。",
    reception: "宋元以后白水寺、光相寺和金顶等节点不断重修，普贤示现、佛光和朝山仪式互相强化。道教洞天与地方山神也在同一山域留下传统。",
    distinction: "峨眉是普贤道场，不表示每次自然光学现象都是可证神迹。佛教、道教和地方山岳叙事可以并列，不能互相吞并。",
    sourceList: ["《峨眉山普贤寺新建铜殿记》", "宋代峨眉行纪", "《大方广佛华严经》普贤相关品"],
    sourceNote: "寺院沿革和国家营建优先使用碑记，显圣与光相按游记原话标层；经中普贤行愿不直接提供山址。",
    boundary: "可写登山、雾光和寺院重建；精确神迹次数、古代山门路线和跨宗教密约若无史料，须标为原创。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceCitation: "宋代峨眉碑记、行纪及相关僧传"
  }),
  sacredPlace({
    key: "jiuhua-mountain",
    title: "九华山",
    spaceKind: "信仰传播区域",
    historicalPeriod: "唐代僧地藏山居，宋以后地藏道场化",
    confidence: "明确",
    summary: "安徽九华的地藏道场由唐代新罗僧释地藏传记、肉身塔和地方寺院记忆逐步形成。",
    sourceTitle: "《宋高僧传》卷二十",
    sourceLocation: "《唐池州九华山化城寺地藏传》",
    modernCorrespondence: "安徽省池州市青阳县九华山",
    lead: "九华山的道场记忆从一位僧人的简陋生活开始：山谷、泉水、白土和少量米。后来建寺、聚徒与肉身塔把苦行者的驻地变成可以不断回访的圣山。",
    profile: "《宋高僧传》记新罗僧释地藏来到九子山，村人助建伽蓝，僧人示寂后肉身入塔。九华之名、寺额和地方供养都有可读的历史层。",
    reception: "宋明以后金地藏被视为地藏菩萨应化，九华遂与救拔幽冥、孝亲和肉身信仰相连。应化说增强圣山地位，却不取消历史僧身份。",
    distinction: "九华山不是《地藏经》直接指定的中国地址，金地藏也不是经中地藏菩萨的世俗本名。山地、僧传和菩萨信仰三层同时保留。",
    sourceList: ["《宋高僧传》卷二十地藏传", "九华山历代山志与碑刻", "《地藏菩萨本愿经》作信仰对照"],
    sourceNote: "人物和早期寺院以宋代僧传为核心，肉身殿与应化信仰按后出山志追踪；现代景区范围不等于古代道场边界。",
    boundary: "可写跨海僧人与山民建寺；把九华直接写进印度佛典、虚构王室诏令或完整神迹年表都属改编。",
    sourceRef: "b2s:song-gaoseng-biographies",
    sourceCitation: "《宋高僧传》卷二十《唐池州九华山化城寺地藏传》"
  }),
  sacredPlace({
    key: "xiangshan-temple",
    title: "汝州香山寺（妙善传承）",
    spaceKind: "庙宇与遗址",
    historicalPeriod: "北宋碑传定型，后世多地香山共享传说",
    confidence: "大致区域",
    summary: "北宋《香山大悲菩萨传》碑传的关键场所，河南汝州香山由此成为妙善观音本行的重要地理锚点。",
    sourceTitle: "《香山大悲菩萨传》碑",
    sourceLocation: "北宋元符年间蒋之奇撰传与蔡京书碑系统",
    modernCorrespondence: "河南省平顶山市宝丰县香山寺传统；各地同名香山另行辨识",
    lead: "妙善传给香山增加了一层不同于普通山寺的时间。公主在这里离开宫廷叙事，成为修行者；碑文又让这个故事在一块可以重刻、拓印和远传的石面上定形。",
    profile: "北宋汝州香山碑传是妙善观音故事的重要早期证据。文本自述更早传承，但现存可核层首先属于十一世纪末的立碑与重刻。",
    reception: "碑传传播后，各地香山、宝卷和戏曲都可能认领妙善足迹。地名相同不能证明故事原址一致，需用碑刻、寺志和版本链条辨别。",
    distinction: "本页指汝州香山传承，不与北京香山、浙江香山或佛典香醉山合并。妙善修行地也是信仰地理，不是经考古证实的王国遗址。",
    sourceList: ["北宋《香山大悲菩萨传》碑传", "香山寺后世重刻和寺志", "妙善宝卷异本"],
    sourceNote: "以现存碑传年代为可靠起点，文本内部自称唐代来源只标“传称”；同名香山逐一消歧。",
    boundary: "可以写立碑、拓本传播和地方朝香；妙庄王国都、宫殿位置及完整古道若无证据，必须标原创。",
    sourceRef: "b2s:xiangshan-biography",
    sourceCitation: "北宋《香山大悲菩萨传》碑传"
  }),
  sacredPlace({
    key: "yuquan-temple",
    title: "当阳玉泉寺",
    spaceKind: "庙宇与遗址",
    historicalPeriod: "隋代建寺，宋代关王护法传说扩展",
    confidence: "明确",
    summary: "智顗在当阳的重要道场，也是关羽伽蓝故事的核心地点；早期寺碑与宋代祠记内容并不相同。",
    sourceTitle: "《国清百录·玉泉寺碑》与宋代关王祠记",
    sourceLocation: "隋代玉泉寺碑；《释门正统》所引玉泉寺关王祠堂记",
    modernCorrespondence: "湖北省宜昌市当阳市玉泉寺",
    lead: "玉泉寺最能说明一处地方怎样拥有多层过去。隋代碑记写智顗卜居与建寺，宋人则在同一山场讲述关羽现灵、受戒和助建；两种记忆不能互相替代。",
    profile: "《国清百录》所收玉泉寺碑记录寺院与智顗，却不见关羽。北宋张商英关王祠记及南宋佛教史传才给出完整护法故事。",
    reception: "关王祠与玉泉寺相互增益，地方关羽信仰进入佛教伽蓝系统。后世关帝封号、香火和武财神职能又让此地连接更多传统。",
    distinction: "寺院建造史与显灵传说要并列呈现：早期材料沉默并不证明传说绝无可能，却足以阻止我们把宋代叙事写成隋代实录。",
    sourceList: ["《国清百录·玉泉寺碑》", "《释门正统》玉泉寺关王祠堂记引文", "《佛祖统纪》智者传相关段"],
    sourceNote: "以隋代碑记建立寺院底层，以宋代祠记标出关羽故事的可考成形；两层在时间线分开。",
    boundary: "可写寺院记忆如何变化；若重现智顗与关羽会面，只能注明采用宋代传说，不能称六世纪同期记录。",
    sourceRef: "b2s:compiled-heavenly-deities",
    sourceCitation: "《国清百录·玉泉寺碑》与宋代关王祠记对读"
  })
];

function sourceText(row) {
  return {
    edition: "以公开古籍影印或电子校录本核对",
    sourceLayer: "原文",
    ...row
  };
}

const sourceRows = [
  sourceText({
    key: "arhat-abiding-record",
    title: "《大阿罗汉难提蜜多罗所说法住记》",
    workType: "佛典",
    formationPeriod: "唐代玄奘汉译，印度法住传统形成更早",
    volumeSection: "全一卷；庆友问答、十六名号、住处与法住期限",
    summary: "十六罗汉名单的核心汉译底本，明确区分说法者庆友与受嘱护法的十六尊者。",
    lead: "这部一卷小经并不长，却决定了汉地罗汉群像最坚实的数字和名字。庆友临入涅槃时回答法住问题，十六尊者由此逐一登场。",
    profile: "文本先交代难提蜜多罗意译庆友，再列十六尊名号、眷属与住处，说明他们隐现受供、护持正法直到法灭与弥勒出世。",
    reception: "玄奘译名进入画赞、罗汉堂和寺院供养后，形象远比原文丰富。庆友、玄奘或降龙伏虎被增入十八人，是接受史而非漏译。",
    distinction: "经文自身的佛灭后八百年属于叙事纪年，不能直接换算成可靠成书年。地名多属佛典宇宙地理，也不宜强制现代定位。",
    sourceList: ["十六尊者名号段", "十六尊者住处与眷属段", "法灭、弥勒与庆友示寂段"],
    sourceNote: "本项目依据完整汉译次序录名，不从现代十八罗汉表反校古经；异体字保留检索别名。",
    boundary: "原文可单独引用，今译和导读必须另层；为十六尊补写传记时统一标注原创改编。"
  }),
  sourceText({
    key: "great-compassion-dharani",
    title: "《千手千眼观世音菩萨广大圆满无碍大悲心陀罗尼经》",
    workType: "佛典",
    formationPeriod: "唐代汉译本，传统题伽梵达摩译",
    volumeSection: "全一卷；补陀落迦法会、观音发愿、陀罗尼与受持功德",
    summary: "千手千眼观音与大悲心陀罗尼的重要汉译文本，连接神圣形态、持诵和护法会众。",
    lead: "经文开场没有先解释千手，而是先把读者带到补陀落迦山。佛、菩萨、四王和山川诸神聚在一起，观音的大悲愿随后从这片会众中展开。",
    profile: "文本叙述观音发愿、示现千手千眼与宣说陀罗尼，并列受持利益。现存汉译题署、咒句分法和相关异译仍需经录对读。",
    reception: "大悲咒成为汉地常用持诵，千手观音则进入造像、忏仪和地方救难信仰。实践层丰富，不表示所有仪式都逐字见于此经。",
    distinction: "经题中的“大悲心”与后世所有大悲忏本不是同一文本。音译陀罗尼也不能用现代汉字读音宣称还原唯一梵音。",
    sourceList: ["补陀落迦山法会开篇", "观音发愿与千手千眼段", "陀罗尼和利益段"],
    sourceNote: "经文、传统译者题署和后世科仪分别登记；公开条目不复制现代注音、译解或受版权保护的校注。",
    boundary: "原咒文只在古籍原文层呈现；项目今译不伪造咒义，原创仪式必须明示非传统科本。"
  }),
  sourceText({
    key: "golden-light-sutra",
    title: "《金光明最胜王经》",
    workType: "佛典",
    formationPeriod: "唐代义净汉译，金光明经系流传更早",
    volumeSection: "十卷；四天王、大辩才、大吉祥、坚牢地神与药叉大将诸品",
    summary: "护国佛教和诸天护法的重要文本，集中保存四王、天女、地神与药叉大将的发愿。",
    lead: "《金光明最胜王经》把听经与护国放在一处。国土安宁不是凭空降下的奖赏，而与持经、施舍、正法和统治者行为反复相连。",
    profile: "义净译本分列四天王护国、大辩才天女、大吉祥天女、坚牢地神和药叉大将等品，使多位护法各自发言而又进入共同法会。",
    reception: "经文支持国家法会、寺院供天与诸天图像。宋代以后名单继续扩展，二十天和二十四天并非经中一次列出的固定编制。",
    distinction: "“护国”是佛教政治和仪礼语言，不等于任何现实政权天然受到神明支持。经中天部也不能直接改名为道教或民间同职神。",
    sourceList: ["《四天王护国品》", "《大辩才天女品》《大吉祥天女品》", "《坚牢地神品》《僧慎尔耶药叉大将品》"],
    sourceNote: "本项目按品建立人物和关系，异译只用于校名；现代仪轨、讲记和祈福文案不混入古籍原文层。",
    boundary: "可据法会结构创作护国场景；新增政治背书、现实灾害保证或诸天军政系统必须标为原创。"
  }),
  sourceText({
    key: "mulasarvastivada-vinaya",
    title: "《根本说一切有部毗奈耶杂事》",
    workType: "佛典",
    formationPeriod: "唐代义净汉译的根本说一切有部律藏材料",
    volumeSection: "鬼子母因缘、寺院供食及多组僧团杂事",
    summary: "以叙事解释僧团规则和寺院日常的重要律藏文本，保存鬼子母由害童转为护法的完整因缘。",
    lead: "“杂事”并不等于无关紧要。衣食、住处、冲突和鬼神因缘都在僧团日常里发生，规则往往正从这些难处理的小事中长出来。",
    profile: "义净译本保存根本说一切有部律藏的多组故事。鬼子母失去爱子、理解他人痛苦并接受僧食，是其中影响汉地护法信仰的一段。",
    reception: "律藏故事进入寺院图像和民俗后，诃利帝母逐渐成为育儿与产育护法。后世求子仪式并不全由本段直接规定。",
    distinction: "律藏叙事既说明戒制，也包含教化性的神圣事件。不能把每个细节当作外部历史档案，更不能用现代医学替换其宗教意义。",
    sourceList: ["鬼子母失子与受教段", "寺院每日供食段", "相关僧团住持规则"],
    sourceNote: "按卷段核对鬼子母因缘和僧团规定，其他部派律藏的平行故事另列异文，不强拼统一版本。",
    boundary: "古籍叙事可作素材，现代育儿建议和疗效承诺不得借经文名义发布。"
  }),
  sourceText({
    key: "xiangshan-biography",
    title: "《香山大悲菩萨传》碑传",
    workType: "地方志与碑刻",
    formationPeriod: "北宋元符年间立碑，后续重刻与宝卷扩写",
    volumeSection: "妙庄王三女、拒婚出家、香山修行、舍手眼救父与显为观音",
    summary: "妙善观音本行的关键早期文本层，现存可考位置是北宋香山碑传而非印度佛典。",
    lead: "这篇传记把观音放进一户中国王室家庭：父亲逼婚，女儿拒绝，刑罚与修行彼此拉扯。碑石让故事获得年代，也让后人有了不断重刻和改写的底本。",
    profile: "北宋汝州知州蒋之奇整理传文并立碑，文本自述来自更早的道宣传承。可核的史料层首先是十一世纪末，传内溯源需保留为“自称”。",
    reception: "碑传影响香山宝卷、戏曲和女相观音叙事，手眼救父与孝亲主题尤其突出。流传越广，王国、姐妹和磨难细节也越多。",
    distinction: "妙善传不是《普门品》的注释，也不能证明观音在历史上出生于某中国王国。碑传、重刻本和民间宝卷应分别标注。",
    sourceList: ["北宋香山碑传正文", "蒋之奇赞与后续重刻", "香山宝卷异本"],
    sourceNote: "以碑传年代作为可靠下限，不采用无来源的现代故事拼接；公开导读由项目重新撰写。",
    boundary: "若据此写完整小说，需要在作品页标注文学重建；新增对白不得冒充碑文原句。"
  }),
  sourceText({
    key: "ancient-qingliang-record",
    title: "《古清凉传》",
    workType: "魏晋六朝及隋唐古籍",
    formationPeriod: "唐代慧祥编述",
    volumeSection: "五台山名、寺院沿革、文殊灵迹与巡礼材料",
    summary: "五台山早期道场史的核心山传，把地理、寺院和文殊显圣传统整理为可追踪的文本。",
    lead: "《古清凉传》不是一篇单纯山水游记。它一边认路、记寺，一边收集显圣与旧闻，让读者看见一座普通山域怎样逐渐被理解为文殊道场。",
    profile: "慧祥在唐代汇集清凉山名、佛教建立和感应故事。书中有历史沿革，也有神圣叙事，两者需按段落和所引前代材料辨别。",
    reception: "此后《广清凉传》、巡礼日记和寺志继续扩充五台记忆。跨国僧人把所见带回新罗、日本与藏传区域，使圣山网络越出一地。",
    distinction: "山传记录显圣，不等于每处灵迹都有同时代物证。经中清凉山与山西五台的对应是信仰史事实，不是唯一地理解码。",
    sourceList: ["山名与地理段", "寺院沿革段", "文殊显圣与巡礼段"],
    sourceNote: "历史地点、传闻出处和作者时代分别标示；后代山志不回填到唐代正文。",
    boundary: "可据山传重建唐代朝山氛围，具体天气、对白和路线连续性若无记录须标文学重建。"
  }),
  sourceText({
    key: "potalaka-record",
    title: "《补陀洛迦山传》",
    workType: "地方志与碑刻",
    formationPeriod: "元至正二十一年盛熙明撰，明代有重刻增附",
    volumeSection: "自在功德、洞宇封域、应感祥瑞、兴建沿革及后附赞咏",
    summary: "元代普陀山史志，系统连接观音经典、舟山地理、感应传说和寺院沿革。",
    lead: "这部山传写海岛时总有两套尺度：洞宇、港湾和寺院可以辨认，观音应现和补陀落迦却把岛屿拉进更大的神圣世界。",
    profile: "盛熙明分篇整理观音功德、山域、祥瑞和兴建。现存本还包含后人增附赞咏，使用时要区分元代正文与明代重刻层。",
    reception: "山传帮助普陀山建立连贯过去，也让拒去观音、海上救难和寺院沿革进入后世志书。它是成熟道场的自我叙述，不是唐代起源现场。",
    distinction: "文本把浙江海岛解释为补陀洛迦道场，这是一项历史信仰对应。经中圣山、现实岛屿和后世景区仍需三层建页。",
    sourceList: ["自在功德品", "洞宇封域与应感祥瑞", "兴建沿革及后附材料"],
    sourceNote: "按篇和版本标出增附内容，公开正文只保留书名、篇目与必要年代，不嵌入现代网站链接。",
    boundary: "可以据山传写元代道场记忆；唐宋航海细节若只见后追，不可伪装同期日记。"
  }),
  sourceText({
    key: "song-gaoseng-biographies",
    title: "《宋高僧传》",
    workType: "魏晋六朝及隋唐古籍",
    formationPeriod: "北宋赞宁奉敕编成，记唐至宋初僧人",
    volumeSection: "三十卷；译经、义解、习禅、明律、护法、感通等十科",
    summary: "北宋僧传总集，保存金地藏、五台感通及大量唐代僧人材料，同时带有编者分类和后见之明。",
    lead: "《宋高僧传》面对的不是一群只靠奇迹被记住的人。译经、讲学、持律、建寺和旅行被分进不同门类，感通故事也与寺院制度并排出现。",
    profile: "赞宁奉敕续写前代高僧传，采碑铭、行状和传闻编成三十卷。它离部分传主已有数百年，材料价值高，却需要追问所据文书。",
    reception: "后世佛教史、山志与地方信仰频繁引用此书。金地藏传尤其影响九华山，但乔觉姓名和完整王子传仍有后续增衍。",
    distinction: "僧传中的神迹是作者所记录的宗教记忆，不自动等于现代可复验事件。四库本整理意见也不能替代佛藏本原文。",
    sourceList: ["卷二十九华山释地藏传", "五台山感通相关传记", "序、十科体例与各传所引碑状"],
    sourceNote: "按卷、传主和材料来源引用；历史事实、编者评价与感通叙事分别做证据类型。",
    boundary: "可据僧传重建寺院社会，但未见原文的心理活动和连续对白必须标为文学重建。"
  }),
  sourceText({
    key: "compiled-heavenly-deities",
    title: "《重编诸天传》",
    workType: "佛典",
    formationPeriod: "南宋乾道年间行霆重编",
    volumeSection: "上下卷；诸天次序、各天传赞及韦天将军传",
    summary: "南宋寺院诸天供养的重要整理文本，既征引经论，也暴露当时名单和座次已有争议。",
    lead: "行霆动笔重编，是因为供天名单已经“不整齐”。不同寺院排列有别，旧传又遗漏经论依据；这部书本身便是一场十二世纪的仪礼校订。",
    profile: "文本按天位立传，汇集梵天、帝释、四王、辩才、吉祥、地神、鬼子母、韦驮等，并为排序辩证。韦将军传尤其依赖道宣感通系统。",
    reception: "《重编诸天传》影响诸天供养与图像理解，也保存汉地护法如何吸收武将、地方神和经中天部的线索。后世二十四天名单仍会继续变化。",
    distinction: "它是南宋重编，不是释迦时代的天界官册。书中梵汉语源解释和历史追述需与更早经本核对，不能一概视作同时代事实。",
    sourceList: ["重编序与诸天次序讨论", "四天王及诸天传", "韦天将军传"],
    sourceNote: "以南宋文本说明当时仪礼和解释，再回查它所引经典；公开页面不把赞词改写成现代百科事实。",
    boundary: "可用于重建宋代供天语境；若项目重新排序诸天，必须标注原创科仪，不得借书名背书。"
  })
];
function metadata(sourceCitation, historicalScope, notes, options = {}) {
  return { sourceCitation, historicalScope, notes, ...options };
}

const canonicalArhatRelationRows = arhatDefinitions.flatMap(([key, title]) => [
  relation(
    `${key}-member-of-sixteen`,
    `b2:${key}`,
    "b2:sixteen-arhats-tradition",
    "法住十六尊者之一",
    metadata(
      "《大阿罗汉难提蜜多罗所说法住记》十六尊者名单",
      "玄奘译本所呈法住叙事层",
      `${title}按玄奘译本次序列入十六人；后世俗称和图像错位不改动此名单。`,
      { kind: "member", strength: 5 }
    )
  ),
  relation(
    `${key}-protects-shakyamuni-dharma`,
    `b2:${key}`,
    "b:shakyamuni",
    "受嘱护持释迦正法",
    metadata(
      "《大阿罗汉难提蜜多罗所说法住记》法付嘱十六罗汉段",
      "佛灭后正法住世的经中时间",
      `${title}的护持对象是释迦正法；这里表示经中付嘱，不建立可考的世俗任命日期。`,
      { kind: "protector", strength: 5 }
    )
  ),
  relation(
    `${key}-maitreya-future-boundary`,
    `b2:${key}`,
    "b:maitreya",
    "法住任务的未来边界",
    metadata(
      "《大阿罗汉难提蜜多罗所说法住记》法灭及弥勒出世段",
      "经中未来佛神圣时间",
      `${title}与弥勒并非师徒；关系只标出法住叙事把十六罗汉任务放在释迦法运与未来佛之间。`,
      { kind: "custom", strength: 3, confidence: "probable" }
    )
  )
]);

const arhatEvolutionRelationRows = [
  relation("nandimitra-narrates-sixteen", "b2:nandimitra", "b2:sixteen-arhats-tradition", "传述十六尊者名单", metadata("《法住记》庆友答问段", "玄奘译本叙事层", "庆友是名单说法者而非十六人之一。", { kind: "source", strength: 5 })),
  relation("sixteen-grounded-in-abiding-record", "b2:sixteen-arhats-tradition", "b2s:arhat-abiding-record", "名单与法住使命底本", metadata("《大阿罗汉难提蜜多罗所说法住记》", "唐译佛典文本层", "十六计数、名号与住处直接来自该译本。", { kind: "source", strength: 5 })),
  relation("sixteen-expanded-to-eighteen", "b2:sixteen-arhats-tradition", "b2:eighteen-arhats-sinicization", "汉地群像由十六增为十八", metadata("宋元罗汉题赞及明清寺院题名", "宋元至明清图像接受层", "增补事实明确，新增两席的具体姓名随版本变化。", { kind: "evolution", strength: 5, evidenceType: "material-evidence", confidence: "probable" })),
  relation("dragon-arhat-added-to-eighteen", "b2:dragon-subduing-arhat", "b2:eighteen-arhats-sinicization", "通俗十八罗汉常见增补者", metadata("明清以来罗汉堂题名与地方寺志", "明清通俗信仰层", "降龙是功能称号，各寺对应人物可能不同。", { kind: "member", strength: 4, evidenceType: "material-evidence", confidence: "probable" })),
  relation("tiger-arhat-added-to-eighteen", "b2:tiger-taming-arhat", "b2:eighteen-arhats-sinicization", "通俗十八罗汉常见增补者", metadata("明清以来罗汉堂题名与地方寺志", "明清通俗信仰层", "伏虎是功能称号，不以一地题名覆盖全部版本。", { kind: "member", strength: 4, evidenceType: "material-evidence", confidence: "probable" })),
  relation("nandimitra-later-seventeenth", "b2:nandimitra", "b2:eighteen-arhats-sinicization", "部分名单列作第十七尊", metadata("宋代以后罗汉题赞与名单讨论", "宋元以后增补层", "庆友作为传述者被移入群像，是汉地解释而非《法住记》原计数。", { kind: "member", strength: 3, evidenceType: "textual-variant", confidence: "probable" })),
  relation("xuanzang-later-eighteenth", "b:xuanzang", "b2:eighteen-arhats-sinicization", "部分名单列作传译纪念者", metadata("宋元以后十八罗汉名单异说", "宋元以后增补层", "玄奘是译者，列入群像表示传译纪念，不把他改成释迦同时代罗汉。", { kind: "member", strength: 3, evidenceType: "textual-variant", confidence: "disputed" })),
  relation("dragon-not-in-sixteen", "b2:dragon-subduing-arhat", "b2:sixteen-arhats-tradition", "不见于玄奘十六人名单", metadata("《法住记》完整十六尊者名单", "唐译底本与后起称号对照", "缺席用于划定来源边界，不表示后世信仰无效。", { kind: "disputed", direction: "mutual", strength: 5, evidenceType: "textual-variant" })),
  relation("tiger-not-in-sixteen", "b2:tiger-taming-arhat", "b2:sixteen-arhats-tradition", "不见于玄奘十六人名单", metadata("《法住记》完整十六尊者名单", "唐译底本与后起称号对照", "伏虎名号属于后起群像层，不能倒填经文。", { kind: "disputed", direction: "mutual", strength: 5, evidenceType: "textual-variant" })),
  relation("dragon-tiger-pair", "b2:dragon-subduing-arhat", "b2:tiger-taming-arhat", "汉地常成对排列", metadata("明清罗汉堂与通俗图像题名", "明清寺院图像层", "成对关系源于构图和称号，不证明两位有古经共同传记。", { kind: "companion", direction: "mutual", strength: 4, evidenceType: "material-evidence", confidence: "probable" })),
  relation("nandimitra-maitreya-horizon", "b2:nandimitra", "b:maitreya", "转述法灭后未来佛次第", metadata("《法住记》法灭、独觉与弥勒出世段", "经中未来时间", "庆友只转述次第，不建立与弥勒同时会面的关系。", { kind: "source", strength: 3 })),
  relation("eighteen-uses-sixteen-source", "b2:eighteen-arhats-sinicization", "b2s:arhat-abiding-record", "以十六底本展开后世增补", metadata("《法住记》与宋元以后罗汉题赞对读", "唐译至明清接受史", "十八传统承接十六骨架，但新增名单不能写进原经。", { kind: "source", strength: 4, evidenceType: "textual-variant" }))
];

const guanyinDevotionRelationRows = [
  relation("miaoshan-guanyin-incarnation", "b2:princess-miaoshan", "b:avalokitesvara", "宋代以后视为观音本行化身", metadata("北宋《香山大悲菩萨传》碑传", "北宋以后中国化传说层", "关系记录碑传主张，不把妙善写成《普门品》历史生平。", { kind: "incarnation", strength: 5, evidenceType: "historical-record", confidence: "probable" })),
  relation("miaoshan-xiangshan", "b2:princess-miaoshan", "b2:xiangshan-temple", "香山修行传说", metadata("北宋《香山大悲菩萨传》碑传", "宋代本行传说层", "地点采用汝州香山传统，同名香山需另行辨别。", { kind: "located", strength: 5, evidenceType: "historical-record" })),
  relation("miaoshan-image-lineage", "b2:princess-miaoshan", "b2:guanyin-image-lineages", "推动女相与公主本行表达", metadata("香山碑传、宝卷与宋元以后观音图像", "宋元至明清接受层", "妙善传强化女性化理解，但不是女相观音唯一原因。", { kind: "evolution", strength: 4, confidence: "probable" })),
  relation("image-lineage-avalokitesvara", "b2:guanyin-image-lineages", "b:avalokitesvara", "汉地多形态展开", metadata("《普门品》及历代观音图像题记", "魏晋至明清图像史", "多形态共享观音身份，具体名相仍按经典和题记分层。", { kind: "evolution", strength: 5, evidenceType: "material-evidence" })),
  relation("thousand-arms-avalokitesvara", "b2:thousand-armed-compassion", "b:avalokitesvara", "大悲愿与千手千眼形态", metadata("《千手千眼观世音菩萨广大圆满无碍大悲心陀罗尼经》", "唐译密教观音文本层", "千手千眼是观音特定形态，不覆盖全部观音经典。", { kind: "incarnation", strength: 5 })),
  relation("thousand-arms-potalaka", "b2:thousand-armed-compassion", "b2:potalaka-scriptural", "法会发生于经中补陀落迦", metadata("《大悲心陀罗尼经》开篇", "经中神圣地理", "关系不赋予现代坐标。", { kind: "located", strength: 5 })),
  relation("potalaka-avalokitesvara", "b2:potalaka-scriptural", "b:avalokitesvara", "经中住处与法会空间", metadata("观音类汉译经典补陀落迦山段", "大乘佛典神圣地理", "不同经本的山名音译和空间细节可有差异。", { kind: "located", direction: "mutual", strength: 5 })),
  relation("putuo-potalaka-correspondence", "b2:putuo-mountain", "b2:potalaka-scriptural", "汉地后世地理对应", metadata("《补陀洛迦山传》", "唐宋传说至元明山志层", "表示历史信仰对应，不声明经中圣山唯一位于舟山。", { kind: "evolution", direction: "mutual", strength: 5, evidenceType: "historical-record" })),
  relation("putuo-image-lineage", "b2:putuo-mountain", "b2:guanyin-image-lineages", "南海、白衣与拒去观音图像汇聚", metadata("《补陀洛迦山传》及普陀造像题记", "宋元以后普陀信仰层", "不同形态在普陀共存，不能只据一尊像定义全山。", { kind: "located", strength: 4, evidenceType: "material-evidence" })),
  relation("sudhana-taught-by-manjushri", "b2:sudhana", "b:manjushri", "由文殊启发菩提心", metadata("《华严经·入法界品》", "华严经神圣叙事层", "文殊开启参学道路，后续善知识不等于文殊下属。", { kind: "teacher", strength: 5 })),
  relation("sudhana-visits-avalokitesvara", "b2:sudhana", "b:avalokitesvara", "入法界参访观音", metadata("《华严经·入法界品》观自在善知识段", "华严经神圣叙事层", "参访关系先于汉地胁侍构图。", { kind: "teacher", strength: 5 })),
  relation("sudhana-samantabhadra-vows", "b2:sudhana", "b:samantabhadra", "归入普贤行愿海", metadata("《华严经·入法界品》末段及普贤行愿传统", "华严经神圣叙事层", "表示求法旅程的收束，不把善财改作普贤唯一弟子。", { kind: "teacher", strength: 5 })),
  relation("dragon-girl-manjushri", "b2:dragon-girl-lotus", "b:manjushri", "龙宫受教传统", metadata("《妙法莲华经·提婆达多品》", "法华经法会叙事层", "文殊说明龙女利根，具体师徒称谓依经文语境。", { kind: "teacher", strength: 4 })),
  relation("dragon-girl-shakyamuni", "b2:dragon-girl-lotus", "b:shakyamuni", "佛前示现成佛", metadata("《妙法莲华经·提婆达多品》", "法华经神圣叙事层", "事件属于经中论辩和示现，不填写世俗公元年份。", { kind: "custom", strength: 5 })),
  relation("dragon-girl-avalokitesvara-attendant", "b2:dragon-girl-lotus", "b:avalokitesvara", "后世观音胁侍形象", metadata("宋元以后观音三尊造像题记", "宋元以后汉地图像层", "胁侍构图晚于法华经，不能改写经中亲属关系。", { kind: "companion", strength: 4, evidenceType: "material-evidence", confidence: "probable" })),
  relation("sudhana-dragon-girl-pair", "b2:sudhana", "b2:dragon-girl-lotus", "后世观音两侧常见组合", metadata("宋元以后观音三尊造像与寺院题名", "宋元至明清图像层", "两人来自不同经典，成对关系属于汉地图像重组。", { kind: "companion", direction: "mutual", strength: 5, evidenceType: "material-evidence" })),
  relation("image-lineage-absorbs-miaoshan", "b2:guanyin-image-lineages", "b2:princess-miaoshan", "吸收妙善本行叙事", metadata("香山碑传、宝卷与观音图像", "宋元以后中国化层", "图像可借用公主装和孝亲主题，但并非所有女相观音都是妙善。", { kind: "evolution", strength: 4 })),
  relation("image-lineage-includes-thousand-arms", "b2:guanyin-image-lineages", "b2:thousand-armed-compassion", "包含有经典仪轨的多臂形态", metadata("大悲类经典与千手观音造像", "唐代以后图像与仪礼层", "千手形态有独立文本，不只是艺术家的自由变体。", { kind: "custom", direction: "mutual", strength: 4 })),
  relation("xiangshan-temple-guanyin", "b2:xiangshan-temple", "b:avalokitesvara", "妙善观音本行道场", metadata("北宋《香山大悲菩萨传》碑传", "北宋以后香山信仰层", "道场身份来自碑传和后续香火，不追溯为印度佛典地名。", { kind: "located", strength: 5, evidenceType: "historical-record" })),
  relation("xiangshan-putuo-distinct", "b2:xiangshan-temple", "b2:putuo-mountain", "同属观音信仰而形成道路不同", metadata("香山碑传与《补陀洛迦山传》对读", "宋元以后观音道场网络", "两地共享观音信仰，但妙善本行与海上补陀对应不可互换。", { kind: "companion", direction: "mutual", strength: 3, evidenceType: "scholarly-inference", confidence: "probable" }))
];

const sacredMountainRelationRows = [
  ...[
    ["wutai", "wutai-mountain"],
    ["emei", "emei-mountain"],
    ["putuo", "putuo-mountain"],
    ["jiuhua", "jiuhua-mountain"]
  ].map(([key, place]) => relation(`four-mountains-includes-${key}`, "b2:four-sacred-mountains", `b2:${place}`, "四大菩萨道场之一", metadata("四山山传、寺志与明清并称材料", "唐宋各山形成、明清网络化", "并称是后起总括，各山沿革仍独立阅读。", { kind: "member", strength: 5, evidenceType: "historical-record" }))),
  relation("wutai-manjushri", "b2:wutai-mountain", "b:manjushri", "汉地文殊道场", metadata("《古清凉传》及五台巡礼记录", "唐代以后五台信仰层", "道场关系为历史信仰对应，不表示文殊只在一山。", { kind: "located", strength: 5, evidenceType: "historical-record" })),
  relation("emei-samantabhadra", "b2:emei-mountain", "b:samantabhadra", "汉地普贤道场", metadata("宋代峨眉普贤寺碑记与后世山志", "唐宋以后峨眉信仰层", "宋代国家营建是重要节点，早期传说另标。", { kind: "located", strength: 5, evidenceType: "historical-record" })),
  relation("putuo-avalokitesvara", "b2:putuo-mountain", "b:avalokitesvara", "汉地观音道场", metadata("《补陀洛迦山传》及宋元寺院史料", "宋元以后普陀信仰层", "舟山实地是后世对应，不替换经中补陀落迦。", { kind: "located", strength: 5, evidenceType: "historical-record" })),
  relation("jiuhua-ksitigarbha", "b2:jiuhua-mountain", "b:ksitigarbha", "汉地地藏道场", metadata("《宋高僧传》地藏传及后出九华山志", "唐代僧传至宋明信仰层", "道场形成与金地藏应化说相关，非《地藏经》直接指定。", { kind: "located", strength: 5, evidenceType: "historical-record" })),
  ...[
    ["manjushri", "manjushri"],
    ["samantabhadra", "samantabhadra"],
    ["avalokitesvara", "avalokitesvara"],
    ["ksitigarbha", "ksitigarbha"]
  ].map(([key, figureKey]) => relation(`four-mountains-patron-${key}`, "b2:four-sacred-mountains", `b:${figureKey}`, "四山网络所联系的菩萨", metadata("各山传记、寺志及明清四山并称材料", "明清以后四山总称层", "网络将四位菩萨并列，不创建经中共同组织。", { kind: "custom", strength: 4, evidenceType: "historical-record" }))),
  relation("kim-gaksak-ksitigarbha-incarnation", "b2:kim-gaksak", "b:ksitigarbha", "九华传统视为地藏应化", metadata("《宋高僧传》地藏传及后世九华山志", "宋代以后九华信仰解释层", "应化说保留为信仰关系，历史僧与菩萨页面不合并。", { kind: "incarnation", strength: 5, evidenceType: "oral-tradition", confidence: "probable" })),
  relation("kim-gaksak-jiuhua", "b2:kim-gaksak", "b2:jiuhua-mountain", "山居、建寺与肉身塔传统", metadata("《宋高僧传》卷二十地藏传", "唐代人物、北宋僧传记录层", "传记记载山居和入塔，具体现代殿宇另按重建年代。", { kind: "located", strength: 5, evidenceType: "historical-record" })),
  relation("xiangshan-outside-four-mountains", "b2:xiangshan-temple", "b2:four-sacred-mountains", "重要观音本行地但不属于通行四山", metadata("四山并称材料与香山碑传对读", "明清以后圣地网络层", "关系用于防止把所有菩萨道场都塞入四大名山。", { kind: "disputed", direction: "mutual", strength: 3, evidenceType: "scholarly-inference", confidence: "probable" })),
  relation("potalaka-prototype-four-mountains", "b2:potalaka-scriptural", "b2:four-sacred-mountains", "观音一支的经中神圣地理原型", metadata("观音类经典与《补陀洛迦山传》对读", "经中圣境至中国道场对应层", "只影响普陀一支，不表示四座山都由同一经文指定。", { kind: "evolution", strength: 3, evidenceType: "scholarly-inference", confidence: "probable" }))
];

const protectorRelationRows = [
  relation("weituo-garland-guardian", "b2:weituo", "b2:garland-guardian-system", "汉地寺院常见护法", metadata("《重编诸天传·韦天将军传》", "唐宋以后寺院护法层", "护寺职能明确，具体殿位随寺院布局变化。", { kind: "protector", strength: 5, evidenceType: "historical-record" })),
  relation("guanyu-garland-guardian", "b2:guanyu-garland", "b2:garland-guardian-system", "宋代以后关王伽蓝形态", metadata("《释门正统》玉泉关王祠记引文", "宋代以后佛教护法层", "关系不覆盖历史关羽和道教关帝页面。", { kind: "protector", strength: 5, evidenceType: "historical-record" })),
  relation("weituo-vinaya-sangha", "b2:weituo", "b:vinaya-sangha", "护持持戒僧众", metadata("道宣感通传系统及《重编诸天传》", "唐宋律学感通层", "韦将军职能与道宣持律关切相关，不等于僧团执法官。", { kind: "protector", strength: 5, evidenceType: "historical-record" })),
  relation("guanyu-yuquan", "b2:guanyu-garland", "b2:yuquan-temple", "关王护寺传说核心地点", metadata("北宋玉泉关王祠记及南宋佛教史传", "宋代后起传说层", "隋代玉泉寺碑未载关王，时间边界必须保留。", { kind: "located", strength: 5, evidenceType: "historical-record" })),
  relation("weituo-southern-king-retinue", "b2:weituo", "b2:virudhaka", "后世称南方天王部将", metadata("《重编诸天传·韦天将军传》", "南宋诸天谱系解释层", "该关系见后出汇编，不据此重写所有印度塞建陀传统。", { kind: "subordinate", strength: 4, evidenceType: "historical-record", confidence: "probable" })),
  relation("weituo-guanyu-distinct-guardians", "b2:weituo", "b2:guanyu-garland", "同为寺院护法但来源不同", metadata("《重编诸天传》与玉泉关王祠记对读", "宋元以后伽蓝空间层", "并列供奉不表示二神是师徒、同族或固定左右将。", { kind: "companion", direction: "mutual", strength: 3, evidenceType: "scholarly-inference", confidence: "probable" })),
  relation("brahma-requests-teaching", "b2:brahma", "b:shakyamuni", "梵天劝请佛陀说法", metadata("汉译阿含梵天劝请相关篇", "早期佛教神圣叙事层", "大梵以世界主身份请法，正说明天界权位并不凌驾于觉悟。", { kind: "custom", strength: 5 })),
  ...[
    ["dhrtarastra", "持国天王"],
    ["virudhaka", "增长天王"],
    ["virupaksa", "广目天王"],
    ["vaisravana", "多闻天王"]
  ].flatMap(([key, title]) => [
    relation(`${key}-four-kings-system`, `b2:${key}`, "b2:four-kings-temple-guardians", "护世四王之一", metadata("《金光明最胜王经·四天王护国品》", "佛典护国与寺院造像层", `${title}的方位和共同护法誓愿可证，持物须另据造像年代。`, { kind: "member", strength: 5 })),
    relation(`${key}-protects-shakyamuni-teaching`, `b2:${key}`, "b:shakyamuni", "佛前发愿护持正法", metadata("《金光明最胜王经·四天王护国品》", "经中护国法会层", `${title}向佛发愿护经护国，不表示世俗君臣隶属。`, { kind: "protector", strength: 5 }))
  ]),
  relation("four-kings-to-heavenly-offering", "b2:four-kings-temple-guardians", "b2:heavenly-deities-offering", "四王列入诸天供养", metadata("《金光明最胜王经》与《重编诸天传》", "唐宋以后诸天仪礼层", "四王在供天中成组出现，寺门造像与法会座次仍是不同场景。", { kind: "member", strength: 5, evidenceType: "ritual-record" })),
  relation("sakra-heavenly-offering", "b2:sakra", "b2:heavenly-deities-offering", "诸天供养核心天主之一", metadata("《重编诸天传·帝释天王传》", "南宋诸天仪礼层", "帝释列位不等于汉地天帝身份被合并。", { kind: "member", strength: 5, evidenceType: "ritual-record" })),
  relation("brahma-heavenly-offering", "b2:brahma", "b2:heavenly-deities-offering", "诸天供养核心天主之一", metadata("《重编诸天传·大梵尊天传》", "南宋诸天仪礼层", "大梵的请法身份和供天位次同时保留。", { kind: "member", strength: 5, evidenceType: "ritual-record" })),
  relation("hariti-garland-guardian", "b2:hariti", "b2:garland-guardian-system", "由害童转为护寺育儿神", metadata("《根本说一切有部毗奈耶杂事》鬼子母因缘", "律藏叙事与汉地寺院供养层", "护法关系源于受教和供食，不与所有送子女神合并。", { kind: "protector", strength: 5 })),
  ...[
    ["sarasvati", "大辩才天女"],
    ["sri-mahadevi", "大吉祥天女"],
    ["prthivi", "坚牢地神"],
    ["pancika", "散脂大将"]
  ].map(([key, title]) => relation(`${key}-heavenly-offering`, `b2:${key}`, "b2:heavenly-deities-offering", "列入诸天护法供养", metadata("《金光明最胜王经》相应品及《重编诸天传》", "隋唐经典至宋代仪礼层", `${title}在同坛仪礼中保留自己的经文职能，不按中国官署改名。`, { kind: "member", strength: 5, evidenceType: "ritual-record" })))
];

const semanticRelationRows = [
  ...canonicalArhatRelationRows,
  ...arhatEvolutionRelationRows,
  ...guanyinDevotionRelationRows,
  ...sacredMountainRelationRows,
  ...protectorRelationRows
];

function timeline(row) {
  return { datePrecision: "range", ...row };
}

const eventRows = [
  timeline({ key: "sixteen-arhats-entrusted", trackKey: "mythic-narrative", title: "释迦付嘱十六罗汉护持正法", summary: "《法住记》让十六尊者延寿住世、随缘受供，在释迦入灭后继续护持法藏。", displayDate: "释迦入灭后正法住世之时", era: "法住记神圣时间", sortOrder: 365, primaryRef: "b2:sixteen-arhats-tradition", referenceRefs: ["b2:sixteen-arhats-tradition", "b:shakyamuni", "b2:nandimitra", "b2s:arhat-abiding-record"], datePrecision: "custom", startValue: "", endValue: "" }),
  timeline({ key: "dragon-girl-buddhahood", trackKey: "mythic-narrative", title: "龙女献珠并示现成佛", summary: "法华会上，龙女以献珠速度回应疑难，随后往南方世界示现成佛，打破会众对女性与龙身的成见。", displayDate: "《法华经》法会示现之时", era: "法华经神圣叙事时间", sortOrder: 370, primaryRef: "b2:dragon-girl-lotus", referenceRefs: ["b2:dragon-girl-lotus", "b:manjushri", "b:shakyamuni", "bs:lotus-sutra"], datePrecision: "custom", startValue: "", endValue: "" }),
  timeline({ key: "thousand-arms-vow", trackKey: "mythic-narrative", title: "观音大悲愿显千手千眼", summary: "大悲心陀罗尼经以观音发愿和手眼示现，表达遍见苦难、遍行救护的神圣能力。", displayDate: "经中大悲愿成就之时", era: "观音陀罗尼经神圣时间", sortOrder: 375, primaryRef: "b2:thousand-armed-compassion", referenceRefs: ["b2:thousand-armed-compassion", "b:avalokitesvara", "b2:potalaka-scriptural", "b2s:great-compassion-dharani"], datePrecision: "custom", startValue: "", endValue: "" }),
  timeline({ key: "xuanzang-translates-arhat-record", trackKey: "textual-evidence", title: "玄奘译出十六罗汉《法住记》", summary: "唐代译本固定庆友、十六尊者名号与住处，为后世罗汉群像提供文本底本。", displayDate: "约七世纪中叶", era: "唐代译经层", sortOrder: 376, primaryRef: "b2s:arhat-abiding-record", referenceRefs: ["b2s:arhat-abiding-record", "b:xuanzang", "b2:nandimitra", "b2:sixteen-arhats-tradition"], startValue: "650", endValue: "660" }),
  timeline({ key: "yijing-golden-light", trackKey: "textual-evidence", title: "义净译《金光明最胜王经》", summary: "义净译本分品保存四天王、辩才、吉祥、地神与药叉大将的护法发愿。", displayDate: "约700至705年", era: "武周至唐初译经层", sortOrder: 378, primaryRef: "b2s:golden-light-sutra", referenceRefs: ["b2s:golden-light-sutra", "b:yijing", "b2:four-kings-temple-guardians", "b2:heavenly-deities-offering"], startValue: "700", endValue: "705" }),
  timeline({ key: "ancient-qingliang-compiled", trackKey: "textual-evidence", title: "《古清凉传》整理五台文殊道场", summary: "慧祥汇集山名、寺院和显圣材料，显示唐代五台山道场记忆已具规模。", displayDate: "约七世纪后半", era: "唐代山传编述层", sortOrder: 380, primaryRef: "b2s:ancient-qingliang-record", referenceRefs: ["b2s:ancient-qingliang-record", "b2:wutai-mountain", "b:manjushri"], startValue: "660", endValue: "700" }),
  timeline({ key: "xiangshan-stele", trackKey: "textual-evidence", title: "香山碑传固定妙善观音本行", summary: "北宋汝州香山碑传把拒婚、修行、舍手眼救父与显为观音连成可传播的本行故事。", displayDate: "1099至1100年", era: "北宋碑传层", sortOrder: 382, primaryRef: "b2s:xiangshan-biography", referenceRefs: ["b2s:xiangshan-biography", "b2:princess-miaoshan", "b2:xiangshan-temple", "b:avalokitesvara"], startValue: "1099", endValue: "1100" }),
  timeline({ key: "potalaka-record-compiled", trackKey: "textual-evidence", title: "盛熙明撰《补陀洛迦山传》", summary: "元代山传系统整理普陀地理、观音感应与寺院沿革，后世重刻又增附赞咏。", displayDate: "1361年", era: "元代山志层", sortOrder: 384, primaryRef: "b2s:potalaka-record", referenceRefs: ["b2s:potalaka-record", "b2:putuo-mountain", "b2:potalaka-scriptural", "b:avalokitesvara"], datePrecision: "year", startValue: "1361", endValue: "1361" }),
  timeline({ key: "wutai-pilgrimage-network", trackKey: "religious-institutions", title: "五台山形成跨地域文殊朝圣网络", summary: "唐代寺院、山传和远方僧人共同推动五台成为汉地及东亚共享的文殊圣山。", displayDate: "约650至850年", era: "唐代五台朝圣制度层", sortOrder: 386, primaryRef: "b2:wutai-mountain", referenceRefs: ["b2:wutai-mountain", "b:manjushri", "b2s:ancient-qingliang-record"], startValue: "650", endValue: "850" }),
  timeline({ key: "weituo-temple-images", trackKey: "religious-institutions", title: "韦将军护法进入汉地寺院空间", summary: "唐代感通传与寺院造像使韦将军逐渐成为面向佛殿、护僧守寺的常见护法。", displayDate: "约650至900年", era: "唐代寺院护法层", sortOrder: 388, primaryRef: "b2:weituo", referenceRefs: ["b2:weituo", "b2:garland-guardian-system", "b2s:compiled-heavenly-deities", "b:vinaya-sangha"], startValue: "650", endValue: "900" }),
  timeline({ key: "jiuhua-ksitigarbha-center", trackKey: "religious-institutions", title: "九华山由僧地藏记忆走向地藏道场", summary: "唐代新罗僧地藏山居、建寺与肉身塔传统，经宋代僧传和后世山志发展为全国性地藏朝圣地。", displayDate: "约750至1000年", era: "唐宋九华信仰层", sortOrder: 390, primaryRef: "b2:jiuhua-mountain", referenceRefs: ["b2:jiuhua-mountain", "b2:kim-gaksak", "b:ksitigarbha", "b2s:song-gaoseng-biographies"], startValue: "750", endValue: "1000" }),
  timeline({ key: "emei-puxian-center", trackKey: "religious-institutions", title: "峨眉普贤寺院与国家营建扩展", summary: "宋代碑记、铜像与朝山路线让峨眉的普贤道场身份获得更清楚的制度和物质支撑。", displayDate: "约950至1100年", era: "北宋峨眉道场层", sortOrder: 392, primaryRef: "b2:emei-mountain", referenceRefs: ["b2:emei-mountain", "b:samantabhadra", "bs:avatamsaka-sutra"], startValue: "950", endValue: "1100" }),
  timeline({ key: "putuo-guanyin-center", trackKey: "religious-institutions", title: "普陀观音海上道场逐步成熟", summary: "唐宋传说、海路和寺院积累先行，元代山传再把普陀沿革整理为连贯的观音圣地史。", displayDate: "约850至1361年", era: "唐宋元普陀道场层", sortOrder: 394, primaryRef: "b2:putuo-mountain", referenceRefs: ["b2:putuo-mountain", "b:avalokitesvara", "b2:potalaka-scriptural", "b2s:potalaka-record"], startValue: "850", endValue: "1361" }),
  timeline({ key: "four-mountains-network", trackKey: "religious-institutions", title: "四大菩萨道场总称趋于稳定", summary: "各山先后形成后，明清清规、山志和朝礼实践才逐渐把五台、峨眉、普陀、九华并成固定网络。", displayDate: "约1500至1800年", era: "明清四山网络化层", sortOrder: 396, primaryRef: "b2:four-sacred-mountains", referenceRefs: ["b2:four-sacred-mountains", "b2:wutai-mountain", "b2:emei-mountain", "b2:putuo-mountain", "b2:jiuhua-mountain"], startValue: "1500", endValue: "1800" }),
  timeline({ key: "sixteen-to-eighteen", trackKey: "cult-evolution", title: "十六罗汉群像在汉地增为十八", summary: "宋元以来庆友、玄奘、降龙、伏虎等增补说并行，明清寺院最终让十八这一计数广泛流行。", displayDate: "约1000至1800年", era: "宋元明清罗汉图像层", sortOrder: 398, primaryRef: "b2:eighteen-arhats-sinicization", referenceRefs: ["b2:eighteen-arhats-sinicization", "b2:sixteen-arhats-tradition", "b2:nandimitra", "b2:dragon-subduing-arhat", "b2:tiger-taming-arhat"], startValue: "1000", endValue: "1800" }),
  timeline({ key: "guanyin-image-transformation", trackKey: "cult-evolution", title: "观音在汉地图像中出现女相、白衣与水月等谱系", summary: "造像、绘画和本行传不断扩展观音形态，女性面容逐渐普遍，却没有一个全国同步的单一转折年。", displayDate: "约500至1200年", era: "南北朝至宋代观音图像层", sortOrder: 400, primaryRef: "b2:guanyin-image-lineages", referenceRefs: ["b2:guanyin-image-lineages", "b:avalokitesvara", "b2:princess-miaoshan", "b2:thousand-armed-compassion"], startValue: "500", endValue: "1200" }),
  timeline({ key: "sudhana-dragon-girl-attendants", trackKey: "cult-evolution", title: "善财与龙女组合为观音两侧胁侍", summary: "华严求法童子与法华龙女在汉地图像中相遇，形成经文之外却极为稳定的观音三尊构图。", displayDate: "约900至1400年", era: "宋元观音造像组合层", sortOrder: 402, primaryRef: "b2:sudhana", referenceRefs: ["b2:sudhana", "b2:dragon-girl-lotus", "b:avalokitesvara", "b2:guanyin-image-lineages"], startValue: "900", endValue: "1400" }),
  timeline({ key: "guanyu-becomes-garland", trackKey: "cult-evolution", title: "关王故事进入佛教伽蓝护法谱", summary: "北宋祠记和南宋佛教史传把玉泉显灵、受戒与助建寺院连成完整叙事，早期智顗材料并未记载。", displayDate: "约1000至1300年", era: "宋代关王佛教化层", sortOrder: 404, primaryRef: "b2:guanyu-garland", referenceRefs: ["b2:guanyu-garland", "b2:yuquan-temple", "b2:garland-guardian-system", "b2s:compiled-heavenly-deities"], startValue: "1000", endValue: "1300" }),
  timeline({ key: "four-kings-temple-hall", trackKey: "cult-evolution", title: "四天王从护国法会进入寺门殿堂", summary: "经典四方护世与中国武将造型结合，天王殿逐渐成为寺院轴线上可穿行的守护空间。", displayDate: "约600至1300年", era: "隋唐至宋元寺院图像层", sortOrder: 406, primaryRef: "b2:four-kings-temple-guardians", referenceRefs: ["b2:four-kings-temple-guardians", "b2:dhrtarastra", "b2:virudhaka", "b2:virupaksa", "b2:vaisravana"], startValue: "600", endValue: "1300" }),
  timeline({ key: "heavenly-offering-reordered", trackKey: "cult-evolution", title: "宋代寺院重整诸天供养名单与座次", summary: "《重编诸天传》因既有供天排序不一而重新汇集经论，证明诸天仪礼一直处于编排和校订之中。", displayDate: "约960至1279年", era: "宋代诸天仪礼整理层", sortOrder: 408, primaryRef: "b2:heavenly-deities-offering", referenceRefs: ["b2:heavenly-deities-offering", "b2s:compiled-heavenly-deities", "b2:sakra", "b2:brahma", "b2:four-kings-temple-guardians"], startValue: "960", endValue: "1279" })
];

function buildFigureEntity(row, order, worldId, now) {
  return {
    id: devotionEntityId(row.key, worldId),
    worldId,
    type: "character",
    title: row.title,
    slug: `mythology-buddhism-devotion-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "汉传佛教道场与护法", "项目自写整理", row.title],
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
      narrativeEra: "经中神圣时间、汉译年代、造像年代与地方信仰形成分别记录。",
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
    id: devotionEntityId(row.key, worldId),
    worldId,
    type: row.entityType,
    title: row.title,
    slug: `mythology-buddhism-devotion-system-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "汉传佛教信仰与仪礼", "项目自写整理", row.title],
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
    id: devotionEntityId(row.key, worldId),
    worldId,
    type: "location",
    title: row.title,
    slug: `mythology-buddhism-devotion-place-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "汉传佛教信仰地理", "项目自写整理", row.title],
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
      mapCaution: row.mapCaution || "佛典神圣空间、古代山志、寺院沿革和现代地理分图层显示；一枚坐标不能证明全部显圣叙事。"
    }
  };
}

function buildSourceEntity(row, order, worldId, now) {
  return {
    id: devotionSourceId(row.key, worldId),
    worldId,
    type: "note",
    title: row.title,
    slug: `mythology-buddhism-devotion-source-${row.key}`,
    summary: row.summary,
    content: renderArticle(row),
    tags: ["中国神话史", "汉传佛教原典与史料", "项目自写整理", row.title],
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
      rightsStatus: row.rightsStatus || "古籍原文",
      internalCitation: `${row.title} · ${row.volumeSection} · ${row.edition}`,
      reviewStatus: "已核原文"
    }
  };
}

function resolveRef(reference, worldId) {
  const [scope, key] = reference.split(":");
  if (scope === "b2") return devotionEntityId(key, worldId);
  if (scope === "b2s") return devotionSourceId(key, worldId);
  if (scope === "b") return transmissionEntityId(key, worldId);
  if (scope === "bs") return transmissionSourceId(key, worldId);
  throw new Error(`未知佛教信仰批次引用：${reference}`);
}

function relation(key, sourceRef, targetRef, label, options = {}) {
  return {
    key,
    sourceRef,
    targetRef,
    label,
    kind: options.kind || "custom",
    direction: options.direction || "directed",
    strength: options.strength ?? 4,
    evidenceType: options.evidenceType || "primary-text",
    sourceCitation: options.sourceCitation,
    historicalScope: options.historicalScope,
    confidence: options.confidence || "certain",
    notes: options.notes
  };
}

function buildRelation(row, worldId, now) {
  return {
    id: `relation:${worldId}:mythology:buddhism-devotion:${row.key}`,
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
    `b2:${row.key}`,
    row.sourceRef,
    row.sourceLabel || "主要原典入口",
    {
      kind: "source",
      direction: "directed",
      strength: 5,
      evidenceType: row.sourceEvidenceType || "primary-text",
      sourceCitation: row.sourceCitation,
      historicalScope: row.historicalLayer || row.historicalPeriod || row.formationPeriod,
      confidence: "certain",
      notes: row.sourceRelationNote || "本边指向条目优先核对的原典或史料入口；异译、后出山志、图像题记与地方传说仍按正文分层阅读。"
    }
  ), worldId, now);
}

function buildTimelineEvent(row, worldId, now) {
  return {
    id: `timeline-event:${worldId}:mythology:buddhism-devotion:${row.key}`,
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
    [institutionRows.length, 8, "信仰制度"],
    [locationRows.length, 7, "道场地点"],
    [sourceRows.length, 9, "原典史料"],
    [semanticRelationRows.length, 119, "语义关系"],
    [eventRows.length, 20, "时间点"]
  ];
  for (const [actual, expected, label] of checks) {
    if (actual !== expected) throw new Error(`${BATCH_LABEL}${label}数量应为 ${expected}，实际为 ${actual}`);
  }
}

function buildBuddhismDevotionBatch(now = new Date().toISOString(), worldId = WORLD_ID) {
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
      devotionEntityId("princess-miaoshan", worldId),
      devotionEntityId("kim-gaksak", worldId),
      devotionEntityId("pindola-bharadvaja", worldId),
      devotionEntityId("weituo", worldId),
      devotionEntityId("four-sacred-mountains", worldId),
      devotionEntityId("putuo-mountain", worldId),
      devotionEntityId("wutai-mountain", worldId),
      devotionEntityId("eighteen-arhats-sinicization", worldId)
    ]
  };
}

module.exports = {
  BATCH_KEY,
  BATCH_LABEL,
  buildBuddhismDevotionBatch,
  devotionEntityId,
  devotionSourceId,
  trackId
};
