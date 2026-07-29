const {
  buildIndex,
  buildShanhaiCorpusData,
  classifyIndexTerm,
  corpus,
  kindLabels,
  matchingBaseEntity,
  stableHash
} = require("./shanhai-corpus-data.cjs");

const CASE_VERSION = "3.1.1";
const WORLD_ID = "world-shanhai-watercolor";
const MAIN_MAP_ID = "map-shanhai-watercolor";
const MAIN_LAYER_ID = `map-layer-default:${MAIN_MAP_ID}`;
const BOOK_ID = "manuscript-book-shanhai-case";

const sourceRoot = "https://ctext.org/shan-hai-jing";

const classicVolumes = [
  { key: "nan-shan", title: "南山经", group: "五藏山经", path: "nan-shan-jing/zh", chapterTitle: "南山初见", summary: "以南方三列山系为纲，记录山川、草木、鸟兽、矿物与祭祀。", highlights: ["招摇山", "祝余", "迷榖", "鹿蜀", "青丘山", "九尾狐", "丹穴山", "凤皇"], hook: "青梧从招摇山取得第一枚禹迹简，发现地图会因叙述者而改变。" },
  { key: "xi-shan", title: "西山经", group: "五藏山经", path: "xi-shan-jing/zh", chapterTitle: "昆仑三关", summary: "展开西方山系、昆仑神域、西王母与众多异兽神鸟。", highlights: ["昆仑之丘", "槐江之山", "西王母", "英招", "陆吾", "帝江", "穷奇", "毕方"], hook: "队伍必须在昆仑的三道守门规则之间选择，任何捷径都会改写后续地图。" },
  { key: "bei-shan", title: "北山经", group: "五藏山经", path: "bei-shan-jing/zh", chapterTitle: "发鸠余音", summary: "记录北方三列山脉、水系、异兽与灾异征兆。", highlights: ["发鸠山", "精卫", "狍鸮", "孟极", "耳鼠", "何罗鱼", "酸与"], hook: "精卫衔来的木石中藏着缺失的方位，北山风雪也掩盖了另一支测绘队的足迹。" },
  { key: "dong-shan", title: "东山经", group: "五藏山经", path: "dong-shan-jing/zh", chapterTitle: "东次异兆", summary: "以东方山系为骨架，集中记录水道、兽类与旱涝征兆。", highlights: ["钦山", "当康", "犰狳", "蠪侄", "合窳", "朱獳"], hook: "当康的丰收之兆与犰狳的虫灾同时出现，迫使青梧判断哪一幅图在说谎。" },
  { key: "zhong-shan", title: "中山经", group: "五藏山经", path: "zhong-shan-jing/zh", chapterTitle: "中土水脉", summary: "篇幅最长，以中部山系和江河源流构成密集的地理网络。", highlights: ["光山", "计蒙", "马腹", "夫诸", "化蛇", "驳"], hook: "中山水脉彼此牵连，任何一次封堵都会在另一条河流制造新的灾难。" },
  { key: "hai-wai-nan", title: "海外南经", group: "海外四经", path: "hai-wai-nan-jing/zh", chapterTitle: "海外南行", summary: "从海外南方展开异国、神人、地理边界与英雄传说。", highlights: ["羽民国", "讙头国", "贯胸国", "长臂国", "三首国", "凿齿", "寿华之野"], hook: "海上诸国持有不同版本的南方边界，青梧必须用访问与交换拼回航路。" },
  { key: "hai-wai-xi", title: "海外西经", group: "海外四经", path: "hai-wai-xi-jing/zh", chapterTitle: "无首之战", summary: "记录海外西方诸国、神祇与刑天等强烈的神话意象。", highlights: ["女子国", "奇肱国", "巫咸国", "刑天", "轩辕之丘"], hook: "刑天守住一段不肯结束的战争记忆，只有承认败者的叙述，西方地图才会展开。" },
  { key: "hai-wai-bei", title: "海外北经", group: "海外四经", path: "hai-wai-bei-jing/zh", chapterTitle: "逐日遗杖", summary: "汇集北海外的异国、烛阴、相柳、夸父逐日等记载。", highlights: ["钟山", "烛龙", "相柳", "夸父", "一目国", "无肠国", "深目国"], hook: "夸父遗杖化出的林地正在移动，既可能成为路标，也可能把追踪者引向北海尽头。" },
  { key: "hai-wai-dong", title: "海外东经", group: "海外四经", path: "hai-wai-dong-jing/zh", chapterTitle: "汤谷十日", summary: "描绘海外东方诸国、汤谷、扶木与日出秩序。", highlights: ["汤谷", "扶木", "天吴", "竖亥", "君子国", "黑齿国", "玄股国", "青丘国"], hook: "汤谷的十个日影同时映在水面，青梧必须找出真正升起的那一个。" },
  { key: "hai-nei-nan", title: "海内南经", group: "海内四经", path: "hai-nei-nan-jing/zh", chapterTitle: "巴蛇旧骨", summary: "从海内南方记述山陵、水域、葬地、异兽与物产。", highlights: ["巴蛇", "视肉", "洞庭"], hook: "巴蛇遗骨成为一座聚落的城墙，拆与不拆都将改变居民对过去的记忆。" },
  { key: "hai-nei-xi", title: "海内西经", group: "海内四经", path: "hai-nei-xi-jing/zh", chapterTitle: "开明九门", summary: "以昆仑之虚为核心，记录开明兽、木禾、不死药与神域结构。", highlights: ["昆仑之丘", "开明兽", "木禾", "不死药", "西王母"], hook: "开明九门分别检验名字、记忆与代价，只有一条路允许携图者原样返回。" },
  { key: "hai-nei-bei", title: "海内北经", group: "海内四经", path: "hai-nei-bei-jing/zh", chapterTitle: "凶水九声", summary: "记录海内北方诸国、水域、九婴等神异存在。", highlights: ["九婴", "凶水", "犬封国"], hook: "九婴的九种声音对应九处决口，队伍必须判断应封住声音还是水源。" },
  { key: "hai-nei-dong", title: "海内东经", group: "海内四经", path: "hai-nei-dong-jing/zh", chapterTitle: "穷桑旧学", summary: "以海内东方河流、地理方位和帝王传说为主要线索。", highlights: ["穷桑", "少昊", "颛顼"], hook: "穷桑保存着少昊教养颛顼的旧谱，也藏着一段被后人误作血缘的关系。" },
  { key: "da-huang-dong", title: "大荒东经", group: "大荒四经", path: "da-huang-dong-jing/zh", chapterTitle: "大壑雷鼓", summary: "展开东方大荒、帝俊谱系、少昊之国与流波山夔。", highlights: ["大壑", "少昊", "帝俊", "流波山", "夔"], hook: "夔的雷声使大壑边缘不断塌落，青梧要在鼓声之间测出一条不会消失的线。" },
  { key: "da-huang-nan", title: "大荒南经", group: "大荒四经", path: "da-huang-nan-jing/zh", chapterTitle: "甘渊浴日", summary: "记录南方大荒、羲和浴日、帝俊后裔与众多异域。", highlights: ["甘渊", "羲和", "帝俊"], hook: "羲和要求青梧删去一个多余的太阳，而每个太阳都能证明自己曾照亮某处土地。" },
  { key: "da-huang-xi", title: "大荒西经", group: "大荒四经", path: "da-huang-xi-jing/zh", chapterTitle: "不周天门", summary: "聚合西方大荒、不周山、夏后启、常羲与女娲之肠等神话。", highlights: ["不周山", "成都载天", "夏后启", "常羲", "女娲之肠", "赤水", "流沙"], hook: "不周山的缺口不是一处地形，而是所有版本都无法闭合的一段叙述。" },
  { key: "da-huang-bei", title: "大荒北经", group: "大荒四经", path: "da-huang-bei-jing/zh", chapterTitle: "应龙南极", summary: "记录北方大荒、黄帝蚩尤之战、女魃、应龙与夸父。", highlights: ["蚩尤", "女魃", "应龙", "夸父", "颛顼"], hook: "应龙停在南极不再上天，战后的旱灾与英雄叙事因此被绑在同一处。" },
  { key: "hai-nei", title: "海内经", group: "海内经", path: "hai-nei-jing/zh", chapterTitle: "禹终布土", summary: "汇集都广、建木、帝王谱系与鲧禹治水，是全书重要收束。", highlights: ["都广之野", "建木", "鲧", "禹", "祝融", "息壤", "羽山"], hook: "当十八枚禹迹简合拢，青梧发现所谓完成地图，其实是决定哪些差异可以共存。" }
];

function record(key, title, kind, source, place, summary, hook) {
  return { key, title, kind, source, place, summary, hook };
}

const creatureRecords = [
  record("shengsheng", "狌狌", "creature", "南山经", "招摇山", "外形像禺而有白耳，平时伏地行走，也能像人一样奔跑；原典说食用后善走。", "适合作为招摇山的敏捷生态线索，并保留猩猩这一异体写法作为原文别名。"),
  record("lushu", "鹿蜀", "creature", "南山经", "杻阳山", "马形白首，具虎纹与赤尾，其鸣如歌谣；原典将其皮毛与子孙繁衍相联。", "可作为护送、祝福或稀有坐骑线索，而非单纯战斗目标。"),
  record("xuangui", "旋龟", "creature", "南山经", "杻阳山水域", "龟身、鸟首、虺尾，叫声像劈木；佩戴相关部位被记为可使耳不聋并治足疾。", "适合承担声音谜题、水道守护和古代医药素材。"),
  record("boyi", "猼訑", "creature", "南山经", "基山", "羊形而九尾、四耳，双目位于背部；佩其皮毛被说可使人不畏。", "可把恐惧机制、背后视野与勇气试炼结合起来。"),
  record("jiuweihu", "九尾狐", "creature", "南山经", "青丘山", "狐形九尾，声音如婴儿，具有食人的危险性；后世祥瑞与魅惑形象不等同于本篇原始记载。", "案例同时保留原典危险性和后世多义形象，供阵营与传闻系统使用。"),
  record("lili", "狸力", "creature", "南山经", "柜山", "豚形而有距，叫声如犬吠；出现与大规模土木工程相联系。", "可用作城建异兆、地动预警或施工支线的触发者。"),
  record("fenghuang", "凤皇", "creature", "南山经", "丹穴山", "鸡形、五采而文，纹样对应德义礼仁信；出现意味着天下安宁。", "适合作为和平结局的远景反馈，而不是随处可见的普通坐骑。"),
  record("gudiao", "蛊雕", "creature", "南山经", "鹿吴山水域", "雕形有角，声音像婴儿并会食人。", "适合用伪装声音诱导玩家，强调听觉线索与水域伏击。"),
  record("yong", "颙", "creature", "南山经", "令丘山", "枭形、人面、四目而有耳，出现被视为天下大旱之兆。", "可作为旱灾任务的预兆节点，让玩家先见异兽再见环境后果。"),
  record("qiongqi", "穷奇", "creature", "西山经", "邽山", "本篇写作牛形、猬毛而鸣如獆狗；后世常见的翼虎形象属于另一套演变传统。", "地图保留翼虎视觉改编，但条目明确标注与西山经原貌的差别。"),
  record("dijiang", "帝江", "creature", "西山经", "天山", "形如黄囊，赤如丹火，六足四翼，浑敦无面目而识歌舞。", "适合承担空间、乐舞与非语言交流机制。"),
  record("yingzhao", "英招", "creature", "西山经", "槐江之山", "马身人面、虎文鸟翼，巡游四海并发出榴状声音。", "可作为昆仑外苑的巡守者与世界地图快速移动的许可者。"),
  record("luwu", "陆吾", "creature", "西山经", "昆仑之丘", "虎身九尾、人面虎爪，掌守帝之下都及天之九部。", "适合设计为规则守门人，挑战重点是权限和秩序而非血量。"),
  record("bifang", "毕方", "creature", "西山经", "章莪之山", "鹤形一足，青质而有赤文，白喙；出现与火灾相联。", "可作为移动火灾预警，也可让玩家追踪它寻找被掩盖的纵火源。"),
  record("wenyaoyu", "文鳐鱼", "creature", "西山经", "泰器之山观水", "鲤鱼形而有鸟翼、苍文白首赤喙，常在西海与东海之间夜飞，出现主大穰。", "可将跨海迁徙做成季节事件，并作为丰收路线的动态信号。"),
  record("huan", "讙", "creature", "西山经", "翼望之山", "形如狸，一目而三尾，可模仿多种声音；食用相关记载与瘅疾相联。", "适合作为声纹谜题与假情报制造者。"),
  record("jiao", "狡", "creature", "西山经", "玉山", "犬形豹文、牛角，叫声如犬吠；出现意味着其国大穰。", "可与西王母神域的丰收许可、祭祀或外交任务结合。"),
  record("feiyi", "肥遗", "creature", "西山经", "太华之山", "蛇形而六足四翼，出现被视为天下大旱之兆。", "与颙构成不同地区的旱兆对照，便于一致性系统检查灾异是否冲突。"),
  record("tiangou", "天狗", "creature", "西山经", "阴山", "狸形白首，叫声如榴榴；原典称可御凶。", "与后世食月天狗区分，可设计成辟凶护卫。"),
  record("haozhi", "豪彘", "creature", "西山经", "竹山", "豚形白毛，毛大如笄且末端为黑。", "可作为竹山生态与大型硬毛材料的来源。"),
  record("paoxiao", "狍鸮", "creature", "北山经", "钩吾之山", "羊身人面，目在腋下，虎齿人爪，叫声如婴儿并食人；后世常与饕餮形象相联系。", "适合做贪食主题首领，但应把后世饕餮解释放在注释层。"),
  record("mengji", "孟极", "creature", "北山经", "石者之山", "豹形而有文，白身，善于伏藏，叫声像呼唤自己的名字。", "可承担雪地潜行教学与追踪反制。"),
  record("ershu", "耳鼠", "creature", "北山经", "丹熏之山", "鼠形而兔首，麋身，以尾飞行；食用相关记载可御百毒。", "适合作为解毒任务的生态线索，避免只做可拾取素材。"),
  record("heluoyu", "何罗鱼", "creature", "北山经", "谯明之山水域", "一首而十身，声音如犬吠；食用相关记载与痈病相联。", "可把十身共享感知做成水下协同首领机制。"),
  record("suanyu", "酸与", "creature", "北山经", "景山", "鸟形蛇身，四翼、六目、三足；出现意味着其国有恐。", "适合用群体恐慌值而非直接伤害表现影响。"),
  record("jingwei", "精卫", "creature", "北山经", "发鸠山", "炎帝之少女女娃游东海溺亡，化鸟衔西山木石以堙东海。", "案例把它设计为持续改变海岸线的动态任务角色。"),
  record("zhuhuai", "诸怀", "creature", "北山经", "北岳之山", "牛形而四角、人目、彘耳，声音如鸣雁并会食人。", "可作为山口迁徙威胁，强调体型、听觉和路线规划。"),
  record("qiuyu", "犰狳", "creature", "东山经", "余峨之山", "兔形而鸟喙、鸱目蛇尾，见人便眠，出现被视为螽蝗之灾。", "可让玩家通过观察其睡眠地点预测虫灾扩散。"),
  record("longzhi", "蠪侄", "creature", "东山经", "凫丽之山", "狐形九尾、九首、虎爪，叫声如婴儿并食人。", "可用多首分工制造复杂声源，同时与九尾狐形成辨识挑战。"),
  record("dangkang", "当康", "creature", "东山经", "钦山", "豚形有牙，鸣声自呼其名；出现被视为天下大穰。", "可作为聚落生产恢复的正向世界状态反馈。"),
  record("heyu", "合窳", "creature", "东山经", "剡山", "彘身人面、黄身赤尾，叫声如婴儿，会食人与虫蛇；出现并伴随洪水。", "适合将捕食威胁与洪水系统合并为复合事件。"),
  record("zhuru", "朱獳", "creature", "东山经", "耿山", "狐形而鱼翼，叫声自呼其名；出现意味着其国有恐。", "可作为水陆交界的恐慌异兆，与酸与形成跨区域对照。"),
  record("mafu", "马腹", "creature", "中山经", "蔓渠之山", "虎形人面，叫声如婴儿并食人。", "可通过足迹像虎、声音像婴儿、面孔像人制造调查层次。"),
  record("fuzhu", "夫诸", "creature", "中山经", "敖岸之山", "白鹿形而有四角，出现被视为其邑有水灾。", "适合作为洪水提前量较长的视觉预警。"),
  record("huashe", "化蛇", "creature", "中山经", "阳山水域", "人面豺身、鸟翼而蛇行，声音如叱呼；出现意味着邑中大水。", "可在水灾前以呼喝声和逆流痕迹逐步建立悬念。"),
  record("jimeng", "计蒙", "creature", "中山经", "光山漳渊", "龙首人身，常游于漳渊，出入必有飘风暴雨。", "可作为控制天气窗口与水路开放时间的区域神。"),
  record("bo", "驳", "creature", "中山经", "中曲之山", "马形白身、黑尾、一角，虎牙爪，鸣如鼓音，能食虎豹并可御兵。", "可做护送战兽或止战象征，避免默认设定成独角兽。"),
  record("zhulong", "烛龙", "creature", "海外北经", "钟山", "人面蛇身而赤，开目为昼、闭目为夜，吹为冬、呼为夏。", "适合作为昼夜与季节切换的世界级叙事锚点。"),
  record("xiangliu", "相柳", "creature", "海外北经", "共工之台附近", "共工之臣，九首蛇身，自环而食于九土；所触之地与腥臭水泽相联。", "可设计为九条污染水系共享一个核心的区域灾害。"),
  record("jiuying", "九婴", "creature", "海内北经", "凶水", "九首的水火之怪，居于凶水。", "适合作为水火双相机制首领，并与九处决口任务联动。"),
  record("bashe", "巴蛇", "creature", "海内南经", "洞庭以西", "巨蛇吞象，三年而后出其骨；相关食用记载与心腹疾病相联。", "可把其迁徙路径做成多年尺度的地形与聚落记忆。"),
  record("kaimingshou", "开明兽", "creature", "海内西经", "昆仑之虚", "大类虎而九首，皆人面，立于昆仑开明门前。", "适合做九门权限与九种知识检验的统一守门者。"),
  record("yayu", "窫窳", "creature", "海内西经", "昆仑开明之东", "原为天神，遭危与贰负所杀；群巫以不死药围其尸，后续篇章又见其兽形记载。", "可承载同名异形、死亡与复生版本冲突，是资料考据玩法的好案例。"),
  record("kui", "夔", "creature", "大荒东经", "流波山", "牛形苍身而无角，一足，出入水必有风雨，光如日月、声如雷。", "适合成为天气、雷鼓素材与海岛生态的核心。"),
  record("yinglong", "应龙", "creature", "大荒北经", "南极", "有翼之龙，参与黄帝与蚩尤之战，杀蚩尤与夸父后不得复上，居于南方而致旱。", "可将战功、失去归途和旱灾后果放在同一角色弧中。"),
  record("zaochi", "凿齿", "creature", "海外南经", "寿华之野", "持盾与矛的异人，羿与之战于寿华之野并射杀之。", "可作为英雄叙述中被省略视角的入口。")
];

const figureRecords = [
  record("xiwangmu", "西王母", "figure", "西山经", "玉山", "其状如人，豹尾虎齿而善啸，蓬发戴胜，掌司天之厉及五残。", "同时展示神祇、地理领主与后世形象变化，避免只保留仙宫女主人的版本。"),
  record("kuafu", "夸父", "figure", "海外北经", "成都载天及大泽方向", "与日逐走，渴饮河渭而不足，赴大泽途中死去，所弃之杖化为邓林。", "主线把遗杖之林设计成移动的地图校准点。"),
  record("xingtian", "刑天", "figure", "海外西经", "常羊之山", "与帝争神，断首葬于常羊，以乳为目、脐为口，操干戚而舞。", "适合作为失败后仍继续行动的主题角色，而非普通敌将。"),
  record("xihe", "羲和", "figure", "大荒南经", "甘渊", "帝俊之妻，生十日，并在甘渊为日沐浴。", "承担日序、轮值和时间系统的规则来源。"),
  record("changxi", "常羲", "figure", "大荒西经", "西方大荒", "帝俊之妻，生月十有二，并为月沐浴。", "与羲和形成日月双轨时间线，不强行合并为同一神职。"),
  record("nuwachang", "女娲之肠", "figure", "大荒西经", "栗广之野", "女娲之肠化为十神，处栗广之野并横道而居。", "条目严格采用十神记载，不把它偷换成完整的女娲造人故事。"),
  record("gun", "鲧", "figure", "海内经", "羽郊", "洪水滔天时窃取帝之息壤堙水，未待帝命，后被祝融杀于羽郊。", "可围绕越权救灾、方法代价和叙事评判建立灰度选择。"),
  record("yu", "禹", "figure", "海内经", "九州", "鲧复生禹，帝命禹继续布土，最终定九州。", "作为全案例测绘主线的历史远因，不直接代替玩家完成探索。"),
  record("zhurong", "祝融", "figure", "海内经", "羽郊", "奉帝命于羽郊杀鲧。", "在改编中承担执行秩序与理解救灾动机之间的冲突。"),
  record("chiyou", "蚩尤", "figure", "大荒北经", "冀州之野", "作兵伐黄帝，黄帝令应龙攻之，战局又牵动风伯雨师与女魃。", "用多方天气与资源系统表现战争，而不只做单场决斗。"),
  record("nuba", "女魃", "figure", "大荒北经", "冀州之野", "黄帝之女，着青衣，止住蚩尤所请风伯雨师带来的大风雨；之后不得复上。", "与应龙共同承担胜利后无法归天和旱灾的余波。"),
  record("yi", "羿", "figure", "海外南经", "寿华之野", "与凿齿战于寿华之野，以箭射杀之。", "把射手英雄放入证词冲突，让玩家接触战胜者与败者两份叙述。"),
  record("shuhai", "竖亥", "figure", "海外东经", "东极至西极", "受帝命步测大地，从东极行至西极，以步数丈量距离。", "作为青梧的职业先驱，提供古代测绘与不确定尺度的设计基准。"),
  record("xiahouqi", "夏后启", "figure", "大荒西经", "赤水之南、流沙之西", "传本作夏后开，珥两青蛇、乘两龙，并有三嫔于天得九辩九歌。", "保留避讳异文，在音乐祭仪任务中展示同名异文处理。"),
  record("shaohao", "少昊", "figure", "大荒东经", "大壑及少昊之国", "东海之外大壑旁见少昊之国，另有少昊孺养颛顼的记载。", "把国度、教养关系与后世谱系分开记录。"),
  record("zhuanxu", "颛顼", "figure", "海内东经", "穷桑", "少昊曾在穷桑孺养颛顼，颛顼弃其琴瑟；其他篇章又见其葬地与后裔。", "适合做跨篇知识状态，防止 AI 把教养关系自动写成父子。"),
  record("dijun", "帝俊", "figure", "大荒东经", "大荒诸地", "在大荒诸篇拥有广泛配偶、子裔与国族谱系，羲和、常羲等均与其相联。", "作为关系图的高连接节点，但只保留篇章明确关系，避免无限扩张。"),
  record("tianwu", "天吴", "figure", "海外东经", "朝阳之谷", "水伯之神，虎身八首皆人面，八足八尾而青黄。", "可管理东方海域潮汐和八向水门。"),
  record("yuqiang", "禺强", "figure", "海外北经", "北海之渚", "北海之神，人面鸟身，珥青蛇并践赤蛇。", "可作为北海航线与风向许可的神祇节点。")
];

const locationRecords = [
  record("zhaoyaoshan", "招摇山", "location", "南山经", "南山经首山", "南山经开篇之山，临西海，桂木繁多，盛产金玉。", "作为案例的探索起点和原典/改编分层教学区。"),
  record("niuyangshan", "杻阳山", "location", "南山经", "招摇山以东", "怪水发源之地，鹿蜀与旋龟均见于此。", "可用山地与水域两套生态层展示同一地点的多对象关联。"),
  record("qingqiushan", "青丘山", "location", "南山经", "南次一经", "阳面多玉、阴面多青雘，英水出焉，九尾狐栖息于此。", "将原典山地与海外东经青丘国分为两个条目，防止误合并。"),
  record("danxueshan", "丹穴山", "location", "南山经", "南次三经", "山上多金玉，丹水南流入渤海，凤皇栖息于此。", "适合做和平结局的远景地标和祭仪地点。"),
  record("kunlun", "昆仑之丘", "location", "西山经", "西方神域", "帝之下都，由陆吾掌守，周围水系、神兽与植物形成复杂神域。", "作为多层子地图与权限门设计样板。"),
  record("huaijiangshan", "槐江之山", "location", "西山经", "昆仑以北", "可望昆仑，英招司之，山中多藏琅玕、黄金玉与丹粟。", "适合作为昆仑外苑和材料采集边界。"),
  record("yushan", "玉山", "location", "西山经", "西方山系", "西王母所居，山中另有狡等异兽。", "将神祇居所、丰收异兆和外交权限放在同一地点。"),
  record("tianshan", "天山", "location", "西山经", "西方山系", "多金玉与青雄黄，英水出焉，帝江栖息于此。", "承担非语言交流和歌舞仪式区域。"),
  record("fajiushan", "发鸠山", "location", "北山经", "北次三经", "山上多柘木，精卫栖息并衔木石向东海。", "可让地图路线随精卫长期行动逐步变化。"),
  record("qinshan", "钦山", "location", "东山经", "东次四经", "当康栖息之山，其出现与丰收相联。", "作为农业聚落与正向世界状态的节点。"),
  record("guangshan", "光山", "location", "中山经", "中次八经", "计蒙游于其水域，出入伴随飘风暴雨。", "适合做天气窗口控制与河流关卡。"),
  record("zhongshan", "钟山", "location", "海外北经", "北方海外", "烛阴之神所在，其开闭目与呼吸对应昼夜寒暑。", "用作全局时间和季节系统的世界锚点。"),
  record("liuboshan", "流波山", "location", "大荒东经", "东海中", "位于海中，夔栖息，出入水伴随风雨雷光。", "适合做海岛首领、雷鼓素材与天气事件中心。"),
  record("buzhoushan", "不周山", "location", "大荒西经", "西北海外大荒", "西北海之外、大荒之隅的著名神山。", "案例不自动附会后世共工触山故事，只把它作为版本缺口与天门意象。"),
  record("chengduzaitian", "成都载天", "location", "海外北经", "北方海外", "夸父相关记载中的山名，夸父珥蛇、把蛇并居其上。", "作为逐日支线的起始证词地点。"),
  record("tanggu", "汤谷", "location", "海外东经", "黑齿国以北", "扶木所在，一日方至、一日方出，日皆载于乌。", "可做日序轮值和多太阳倒影谜题。"),
  record("ganyuan", "甘渊", "location", "大荒南经", "南方大荒", "羲和为十日沐浴之处。", "作为日轨时间线的维护节点。"),
  record("yushan-feather", "羽山", "location", "海内经", "羽郊", "鲧被祝融处死的地点，亦是治水叙事的重要转折。", "用同一地点承载惩罚、复生和方法继承。"),
  record("shouhuaye", "寿华之野", "location", "海外南经", "南方海外", "羿与凿齿交战之地。", "适合并置胜者战报与败者遗留证物。"),
  record("dahe", "大壑", "location", "大荒东经", "东海之外", "少昊之国附近的大壑，常被视为东方极境意象。", "作为会不断塌落的地图边界。"),
  record("duguang", "都广之野", "location", "海内经", "西南方", "百谷自生，冬夏播琴，鸾鸟自歌、凤鸟自舞，灵寿实华。", "作为资源丰饶但规则不同的非战斗区域。"),
  record("qiongsang", "穷桑", "location", "海内东经", "东海之外", "少昊孺养颛顼于此，颛顼在此舍弃琴瑟。", "承担教养关系、音乐线索与知识误读检查。"),
  record("chishui", "赤水", "location", "大荒西经", "西方大荒", "大荒西部重要方位参照，多则记载以赤水之南北定位。", "作为相对方位而非现代经纬坐标使用。"),
  record("ruoshui", "弱水", "location", "海内西经", "昆仑周边", "昆仑相关水系和边界意象之一。", "用作不可常规渡越的地图边界。"),
  record("liusha", "流沙", "location", "大荒西经", "西方大荒", "大量方位描述以流沙之东、西为参照。", "可做移动地貌，迫使路线按叙事阶段重算。"),
  record("heishui", "黑水", "location", "海内经", "海内水系", "海内篇章中重要水系与方位参照。", "作为跨篇检索节点，不强行对应单一现代河流。"),
  record("xuanyuanqiu", "轩辕之丘", "location", "海外西经", "西方海外", "与轩辕之国相关的地理节点。", "适合放置血统禁忌与边界外交任务。")
];

const nationRecords = [
  record("yuminguo", "羽民国", "nation", "海外南经", "南方海外", "其民身生羽。", "用飞行能力、垂直聚落和礼仪差异设计，不把形貌直接等同文明等级。"),
  record("huantouguo", "讙头国", "nation", "海外南经", "南方海外", "讙头人形貌与捕鱼生活均有记载，传本又见驩兜等名称关联。", "保留异名索引，避免 AI 把国名和人物名无条件合并。"),
  record("guanxiongguo", "贯胸国", "nation", "海外南经", "南方海外", "其民胸部贯通。", "以身体结构带来的服饰、建筑与医疗习惯展开，而非只做奇观。"),
  record("changbiguo", "长臂国", "nation", "海外南经", "南方海外", "其民长臂，常与捕鱼能力相联。", "可设计独特的舟船协作和远距交互。"),
  record("sanshouguo", "三首国", "nation", "海外南经", "南方海外", "其民一身三首。", "适合表现多声部议事制度，避免默认成同一意识。"),
  record("nvziguo", "女子国", "nation", "海外西经", "西方海外", "以女子构成的国度记载。", "作为社会制度条目处理，不套用后世西游叙事。"),
  record("qigongguo", "奇肱国", "nation", "海外西经", "西方海外", "其民一臂三目，能为飞车并从风远行。", "可作为机关与风行交通技术阵营。"),
  record("wuxianguo", "巫咸国", "nation", "海外西经", "登葆山一带", "巫咸国群巫操不死药等物，从地理与巫术记载相联。", "作为药物知识与复生伦理争议中心。"),
  record("yimuguo", "一目国", "nation", "海外北经", "北方海外", "其民一目居面中。", "围绕视野、文字和空间设计展开，而非用缺陷叙事。"),
  record("wuchangguo", "无肠国", "nation", "海外北经", "北方海外", "其民身长而无肠。", "可推演不同饮食与贸易制度，同时标注为神话身体书写。"),
  record("shenmuguo", "深目国", "nation", "海外北经", "北方海外", "其民举一手、一目深陷。", "适合做寒地光照与视觉文化设定。"),
  record("junziguo", "君子国", "nation", "海外东经", "东方海外", "其民衣冠带剑、好让不争，并有薰华草。", "用于礼仪外交和非暴力解法，不直接等同理想社会。"),
  record("heichiguo", "黑齿国", "nation", "海外东经", "东方海外", "其民黑齿，食稻啖蛇。", "从饮食、染齿和蛇类资源关系建立文化细节。"),
  record("xuanguoguo", "玄股国", "nation", "海外东经", "东方海外", "其民衣鱼皮并食鸥。", "可与海洋资源、服饰和迁徙路线联动。"),
  record("qingqiuguo", "青丘国", "nation", "海外东经", "东方海外", "青丘国有九尾狐，位置与南山经青丘山分属不同篇章语境。", "特意与青丘山拆分，供关系和一致性工具处理同名近义对象。"),
  record("darenguo", "大人国", "nation", "海外东经", "东方海外", "以大人形貌为核心的国度记载。", "将尺度差异落实到建筑、运输和谈判距离。")
];

const artifactRecords = [
  record("zhuyu", "祝余", "artifact", "南山经", "招摇山", "草形如韭而青华，食之不饥。", "作为长途探索补给，但设置稀缺与生态恢复规则。"),
  record("migu", "迷榖", "artifact", "南山经", "招摇山", "木形如榖而有黑理，华光照四方，佩之不迷。", "可作为有限范围的导航校准器，而非全知地图。"),
  record("shatang", "沙棠", "artifact", "西山经", "昆仑之丘", "木形如棠，黄华赤实，食之可御水而使人不溺。", "可为水下路线提供一次性许可，并与采集伦理相联。"),
  record("muhe", "木禾", "artifact", "海内西经", "昆仑之虚", "昆仑开明附近所记巨大木禾。", "作为神域粮食尺度和资源冲突的视觉锚点。"),
  record("fumu", "扶木", "artifact", "海外东经", "汤谷", "汤谷上的神木，日方至方出，皆载于乌。", "作为太阳轮值与东方时间系统的实体接口。"),
  record("xirang", "息壤", "artifact", "海内经", "帝所", "能够自生增长的神土，鲧未待帝命而窃取以堙洪水。", "把无限材料与越权救灾的伦理代价绑定。"),
  record("busiyao", "不死药", "artifact", "海内西经", "昆仑开明之东", "群巫夹窫窳之尸，操持不死之药。", "作为复生技术而非普通消耗品，并记录使用对象和后果。"),
  record("jianmu", "建木", "artifact", "海内经", "都广之野", "都广附近的神木，具有沟通上下的宇宙树意象。", "可作为跨层地图入口和章回结构的垂直轴。"),
  record("shirou", "视肉", "artifact", "海内南经", "狄山一带", "与帝王葬地及众兽并列出现的神异肉类存在。", "作为会恢复的生态资源，迫使玩家区分生物、食物与祭物。")
];

const adaptationRecords = [
  { key: "adapt-qingwu", title: "青梧", type: "character", summary: "原创主角，负责校勘十八卷并重绘禹迹图的年轻司方使。", content: "青梧能看见不同叙述在地图上留下的重影，但不能判断哪一个版本天然正确。她的任务不是消灭差异，而是记录来源、后果与选择。", tags: ["原创角色", "主角", "司方使"], templateData: { aliases: "执简人", alignment: "求真而不武断", faction: "司方台", goals: "集齐十八枚禹迹简，建立一张允许差异共存的山海图。", secrets: "她的第一枚禹迹简来自一份被判为伪本的家传抄录。", relationships: "信任巫弦的记忆，却经常质疑墨堪的单一测量标准。" } },
  { key: "adapt-wuxian", title: "巫弦", type: "character", summary: "原创同行者，以歌诀保存山海异名与祭仪顺序的巫祝。", content: "巫弦相信声音比刻度更能保存路径。他会纠正青梧对异名的误合并，也会隐去可能被滥用的复生仪式。", tags: ["原创角色", "巫祝", "同行者"], templateData: { aliases: "弦歌巫", alignment: "守秘", faction: "巫咸学派", goals: "保存会因文字统一而消失的异名与地方记忆。", secrets: "他知道不死药并不能让复生者保持原来的形貌。", relationships: "与青梧互补，对玄简保持警惕。" } },
  { key: "adapt-mokan", title: "墨堪", type: "character", summary: "原创测绘师，坚持距离、方向和重复测量的技术派同行者。", content: "墨堪用绳墨、步数和水钟校正地图。他的测量常与神话方位冲突，但这种冲突正是案例用来展示资料分层的核心。", tags: ["原创角色", "测绘师", "同行者"], templateData: { aliases: "绳墨客", alignment: "经验主义", faction: "司方台", goals: "建立可重复验证的旅行尺度。", secrets: "他曾擅自删去无法测量的钟山昼夜记录。", relationships: "尊重青梧的判断，与巫弦争论口传证据。" } },
  { key: "adapt-xuanjian", title: "玄简", type: "character", summary: "原创简灵，由十八枚禹迹残简共同形成的可交互地图意识。", content: "玄简不会忘记已经确认的事实，却会把互相矛盾的记载同时保留。它是软件内 AI 长期记忆机制在案例故事中的叙事化身。", tags: ["原创角色", "简灵", "AI记忆隐喻"], templateData: { aliases: "禹迹简灵", alignment: "依来源行事", faction: "无", goals: "收齐来源并维持可追溯的记忆网络。", secrets: "它无法自行决定哪一种改编应成为作者最终设定。", relationships: "把青梧视为最终确认者。" } }
];

const allCanonicalRecords = [
  ...creatureRecords,
  ...figureRecords,
  ...locationRecords,
  ...nationRecords,
  ...artifactRecords
];

const canonicalIndexEntities = allCanonicalRecords.map((item) => ({
  id: entityId(item.key),
  title: item.title,
  type: item.kind === "figure"
    ? "character"
    : item.kind === "location"
      ? "location"
      : item.kind === "nation"
        ? "faction"
        : item.kind === "artifact"
          ? "item"
          : "note",
  slug: item.key
}));
const indexTermsForIllustration = buildIndex(canonicalIndexEntities);
const indexNameCounts = indexTermsForIllustration.reduce(
  (counts, term) => counts.set(term.name, (counts.get(term.name) || 0) + 1),
  new Map()
);
const generatedIllustratedRecords = indexTermsForIllustration
  .filter((term) => !matchingBaseEntity(term, canonicalIndexEntities))
  .map((term) => ({ term, visual: classifyIndexTerm(term) }))
  .filter(({ visual }) => visual.requiresIllustration)
  .map(({ term, visual }) => ({
    key: `index-${term.kind}-${stableHash(term.name)}`,
    title: (indexNameCounts.get(term.name) || 0) > 1
      ? `${term.name}（${term.kind === "other" ? ({ creature: "异兽形态", figure: "人物原型", artifact: "草木神物" }[visual.visualKind] || kindLabels[term.kind]) : kindLabels[term.kind]}）`
      : term.name,
    kind: visual.visualKind,
    source: term.occurrences[0]?.chapterTitle || "山海经",
    place: term.occurrences[0]?.sectionTitle || "原典名物索引",
    summary: term.occurrences[0]?.excerpt || `${kindLabels[term.kind]}原典索引条目。`,
    hook: `完整图鉴补充项；出现于 ${term.occurrences.length} 个原文段落。`,
    indexKind: term.kind,
    occurrencePassageIds: term.occurrences.map((item) => item.passageId)
  }));

const curatedIllustratedRecords = [
  ...creatureRecords,
  ...figureRecords,
  ...artifactRecords,
  ...adaptationRecords.map((item) => ({ ...item, kind: "character" }))
];

const illustratedRecords = [
  ...curatedIllustratedRecords,
  ...generatedIllustratedRecords
];

const visualCreatures = [
  { key: "qiongqi", title: "穷奇", habitat: "邽山", color: "#b6483d", center: { x: 17, y: 39 }, marker: { x: 17, y: 50 }, scale: 0.18, rotation: -4, region: [[2, 25], [9, 12], [25, 10], [36, 25], [32, 47], [21, 62], [7, 55]] },
  { key: "dijiang", title: "帝江", habitat: "天山", color: "#d67a2f", center: { x: 36, y: 17 }, marker: { x: 36, y: 27 }, scale: 0.15, rotation: -2, region: [[24, 3], [41, 1], [49, 12], [47, 27], [32, 31], [22, 18]] },
  { key: "zhulong", title: "烛龙", habitat: "钟山", color: "#a93f36", center: { x: 56, y: 17 }, marker: { x: 56, y: 29 }, scale: 0.22, rotation: 5, region: [[44, 3], [62, 1], [70, 14], [63, 31], [48, 29], [42, 16]] },
  { key: "jingwei", title: "精卫", habitat: "发鸠山", color: "#3d6f99", center: { x: 62, y: 44 }, marker: { x: 62, y: 55 }, scale: 0.12, rotation: 7, region: [[52, 28], [68, 24], [77, 36], [75, 54], [62, 61], [50, 45]] },
  { key: "kui", title: "夔", habitat: "流波山", color: "#4f6684", center: { x: 83, y: 34 }, marker: { x: 83, y: 47 }, scale: 0.18, rotation: 3, region: [[72, 8], [94, 6], [99, 22], [96, 49], [81, 58], [69, 38]] },
  { key: "jiuweihu", title: "九尾狐", habitat: "青丘山", color: "#b55e6f", center: { x: 27, y: 71 }, marker: { x: 27, y: 83 }, scale: 0.2, rotation: -5, region: [[15, 57], [34, 53], [42, 68], [37, 88], [19, 91], [11, 75]] },
  { key: "lushu", title: "鹿蜀", habitat: "杻阳山", color: "#65755a", center: { x: 48, y: 72 }, marker: { x: 48, y: 84 }, scale: 0.17, rotation: 2, region: [[34, 55], [55, 52], [65, 65], [61, 87], [43, 92], [31, 75]] },
  { key: "dangkang", title: "当康", habitat: "钦山", color: "#98723e", center: { x: 70, y: 72 }, marker: { x: 70, y: 84 }, scale: 0.17, rotation: -3, region: [[58, 55], [78, 52], [88, 67], [83, 87], [64, 91], [54, 73]] }
];

const categoryIds = {
  classic: `category:${WORLD_ID}:shanhai-classics`,
  mountainClassics: `category:${WORLD_ID}:shanhai-classics-mountain`,
  overseasClassics: `category:${WORLD_ID}:shanhai-classics-overseas`,
  innerClassics: `category:${WORLD_ID}:shanhai-classics-inner`,
  wildernessClassics: `category:${WORLD_ID}:shanhai-classics-wilderness`,
  creature: `category:${WORLD_ID}:shanhai-creature`,
  deity: `category:${WORLD_ID}:shanhai-deity`,
  location: `category:${WORLD_ID}:shanhai-location`,
  nation: `category:${WORLD_ID}:shanhai-nation`,
  artifact: `category:${WORLD_ID}:shanhai-artifact`,
  adaptation: `category:${WORLD_ID}:shanhai-adaptation`
};

function entityId(key) {
  return `entity-shanhai-${key}`;
}

function volumeEntityId(key) {
  return `entity-shanhai-volume-${key}`;
}

function sourceUrl(title) {
  const volume = classicVolumes.find((item) => item.title === title);
  return volume ? `${sourceRoot}/${volume.path}` : `${sourceRoot}/zh`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sourceLink(title) {
  return `<a href="${escapeHtml(sourceUrl(title))}">中国哲学书电子化计划 · ${escapeHtml(title)}</a>`;
}

function volumeCategory(group) {
  if (group === "五藏山经") return categoryIds.mountainClassics;
  if (group === "海外四经") return categoryIds.overseasClassics;
  if (group === "大荒四经") return categoryIds.wildernessClassics;
  return categoryIds.innerClassics;
}

function buildCategories(now) {
  const rows = [
    [categoryIds.classic, `category:${WORLD_ID}:note`, "经典卷目", "十八篇原典索引与项目范围说明。", "book-open", "#635f52"],
    [categoryIds.mountainClassics, categoryIds.classic, "五藏山经", "南、西、北、东、中五篇山经。", "mountain", "#397268"],
    [categoryIds.overseasClassics, categoryIds.classic, "海外四经", "海外南、西、北、东四篇。", "compass", "#3b6f91"],
    [categoryIds.innerClassics, categoryIds.classic, "海内诸经", "海内四经与最终海内经。", "map", "#735d91"],
    [categoryIds.wildernessClassics, categoryIds.classic, "大荒四经", "大荒东、南、西、北四篇。", "sun", "#a05846"],
    [categoryIds.creature, `category:${WORLD_ID}:note`, "山海异兽", "原典异兽、神鸟、水怪与视觉改编说明。", "sparkles", "#a4483f"],
    [categoryIds.deity, `category:${WORLD_ID}:character`, "神祇与人物", "原典神祇、帝王、英雄及明确关系。", "crown", "#8a633e"],
    [categoryIds.location, `category:${WORLD_ID}:location`, "山川神域", "山川、水域、极境与相对方位。", "mountain", "#3f7167"],
    [categoryIds.nation, `category:${WORLD_ID}:faction`, "邦国与族群", "海外与海内诸国的结构化索引。", "landmark", "#506e8b"],
    [categoryIds.artifact, `category:${WORLD_ID}:item`, "草木与神物", "草木、药物、神土和宇宙树。", "leaf", "#62804c"],
    [categoryIds.adaptation, `category:${WORLD_ID}:character`, "原创改编角色", "仅属于本案例的游戏与小说角色，绝不冒充原典。", "pen-tool", "#865b72"]
  ];
  return rows.map(([id, parentId, title, description, icon, color], order) => ({
    id, worldId: WORLD_ID, parentId, title, description, icon, color, order: order + 10,
    createdAt: now, updatedAt: now
  }));
}

function buildRecordTemplate(now) {
  const options = classicVolumes.map((item) => item.title);
  const fields = [
    ["canonicalSection", "原典篇目", "select", true, options],
    ["recordKind", "条目类型", "select", true, ["经典卷目", "异兽与神鸟", "神祇与人物", "山川神域", "邦国与族群", "草木与神物"]],
    ["canonicalPlace", "原典位置", "text", false, []],
    ["sourceStatus", "资料状态", "select", true, ["原典明确记载", "传本存在异文", "现代改编"]],
    ["adaptationRole", "改编用途", "textarea", false, []],
    ["sourceUrl", "原典索引", "text", false, []]
  ];
  return {
    id: `template:${WORLD_ID}:shanhai-record`,
    worldId: WORLD_ID,
    name: "山海原典条目模板",
    description: "把原典定位、资料状态和现代改编用途分开记录。",
    entityTypes: ["character", "location", "faction", "event", "item", "note"],
    fields: fields.map(([key, label, type, required, fieldOptions], order) => ({
      id: `template-field:${WORLD_ID}:shanhai-record:${key}`,
      key, label, type, required, secret: false, defaultValue: "", options: fieldOptions,
      targetEntityTypes: [], order
    })),
    builtIn: false,
    createdAt: now,
    updatedAt: now
  };
}

function buildEntities(now) {
  const knownTitles = new Set([
    ...classicVolumes.map((item) => item.title),
    ...allCanonicalRecords.map((item) => item.title),
    ...adaptationRecords.map((item) => item.title)
  ]);
  const wiki = (title) => knownTitles.has(title) ? `[[${escapeHtml(title)}]]` : escapeHtml(title);
  const volumeEntities = classicVolumes.map((volume, order) => ({
    id: volumeEntityId(volume.key),
    worldId: WORLD_ID,
    type: "note",
    title: volume.title,
    slug: `classic-${volume.key}`,
    summary: volume.summary,
    content: [
      "<h2>篇章范围</h2>",
      `<p>${escapeHtml(volume.summary)}</p>`,
      "<h2>本案例代表条目</h2>",
      `<ul>${volume.highlights.map((title) => `<li>${wiki(title)}</li>`).join("")}</ul>`,
      "<h2>改编主线</h2>",
      `<p>${escapeHtml(volume.hook)}</p>`,
      "<h2>资料边界</h2>",
      "<p>本条是结构化索引，不替代古籍全文或专业校勘。项目中的地图位置为创作索引，不主张对应现代地理。</p>",
      `<p>原典入口：${sourceLink(volume.title)}</p>`
    ].join(""),
    tags: ["山海经", "十八卷", volume.group, "原典索引"],
    visibility: "shared",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: volumeCategory(volume.group),
    order,
    templateId: `template:${WORLD_ID}:shanhai-record`,
    templateData: {
      canonicalSection: volume.title,
      recordKind: "经典卷目",
      canonicalPlace: volume.group,
      sourceStatus: "原典明确记载",
      adaptationRole: volume.hook,
      sourceUrl: sourceUrl(volume.title)
    }
  }));

  const kindMeta = {
    creature: { type: "note", categoryId: categoryIds.creature, label: "异兽与神鸟" },
    figure: { type: "character", categoryId: categoryIds.deity, label: "神祇与人物" },
    location: { type: "location", categoryId: categoryIds.location, label: "山川神域" },
    nation: { type: "faction", categoryId: categoryIds.nation, label: "邦国与族群" },
    artifact: { type: "item", categoryId: categoryIds.artifact, label: "草木与神物" }
  };
  const canonicalEntities = allCanonicalRecords.map((item, order) => {
    const meta = kindMeta[item.kind];
    const placeLabel = item.place ? wiki(item.place) : "未单列";
    return {
      id: entityId(item.key),
      worldId: WORLD_ID,
      type: meta.type,
      title: item.title,
      slug: item.key,
      summary: item.summary,
      content: [
        "<h2>原典定位</h2>",
        "<ul>",
        `<li>篇目：${wiki(item.source)}</li>`,
        `<li>所在：${placeLabel}</li>`,
        `<li>类型：${escapeHtml(meta.label)}</li>`,
        "<li>资料状态：原典明确记载；形貌与关系以本项目采用的通行本为准</li>",
        "</ul>",
        "<h2>原典要点</h2>",
        `<p>${escapeHtml(item.summary)}</p>`,
        "<h2>创作转译</h2>",
        `<p>${escapeHtml(item.hook)}</p>`,
        "<h2>使用规则</h2>",
        "<p>正文创作必须区分原典事实、传本异文与本案例原创设定。若 AI 扩写超出本条内容，应先以草稿记忆保存，不能自动写成已确认设定。</p>",
        `<p>原典入口：${sourceLink(item.source)}</p>`
      ].join(""),
      tags: ["山海经", meta.label, item.source, item.place].filter(Boolean),
      visibility: "shared",
      createdBy: "user-owner",
      updatedAt: now,
      categoryId: meta.categoryId,
      order,
      templateId: `template:${WORLD_ID}:shanhai-record`,
      templateData: {
        canonicalSection: item.source,
        recordKind: meta.label,
        canonicalPlace: item.place,
        sourceStatus: "原典明确记载",
        adaptationRole: item.hook,
        sourceUrl: sourceUrl(item.source)
      }
    };
  });

  const originalEntities = adaptationRecords.map((item, order) => ({
    id: entityId(item.key),
    worldId: WORLD_ID,
    type: item.type,
    title: item.title,
    slug: item.key,
    summary: item.summary,
    content: [
      "<h2>原创声明</h2>",
      "<p>本角色仅属于 Worldcraft Codex 山海经案例，不是《山海经》原典人物。</p>",
      "<h2>角色设定</h2>",
      `<p>${escapeHtml(item.content)}</p>`
    ].join(""),
    tags: item.tags,
    visibility: "private",
    createdBy: "user-owner",
    updatedAt: now,
    categoryId: categoryIds.adaptation,
    order,
    templateId: `template:${WORLD_ID}:character`,
    templateData: item.templateData
  }));
  return [...volumeEntities, ...canonicalEntities, ...originalEntities];
}

function imageTransform(x = 0, y = 0, scale = 1, rotation = 0) {
  return { flipX: false, flipY: false, x, y, scale, rotation };
}

function labelPlacement(minZoom = 0.1) {
  return { offsetX: 0, offsetY: 0, locked: false, minZoom };
}

function region(id, title, description, color, points, references, order, now) {
  return {
    id, title, description, kind: "territory", color, opacity: 0.15, order,
    visible: true, locked: false, points: points.map(([x, y]) => ({ x, y })), holes: [],
    labelPlacement: labelPlacement(0.45), references, createdAt: now, updatedAt: now
  };
}

function chapterMapId(key) {
  return `map-shanhai-volume-${key}`;
}

function passageEntityId(passageId) {
  return `entity-shanhai-passage-${passageId.replace(/^corpus-/, "")}`;
}

function buildChapterMapData(now, mapImageUrls, fiveMapId, seaMapId) {
  const maps = [];
  const layers = [];
  const groups = [];
  const markers = [];
  const routes = [];
  const colors = ["#397268", "#4d7193", "#9a6940", "#735d91", "#a05846", "#607b52"];

  corpus.chapters.forEach((chapter, chapterIndex) => {
    const volume = classicVolumes.find((item) => item.key === chapter.key);
    const mapId = chapterMapId(chapter.key);
    const parentMapId = chapterIndex < 5 ? fiveMapId : seaMapId;
    const entryMarkerId = chapterIndex < 5
      ? `marker-shanhai-five-${chapter.key}`
      : `marker-shanhai-sea-${chapter.key}`;
    const layerId = `map-layer-default:${mapId}`;
    const groupId = `marker-group-shanhai-volume-${chapter.key}`;
    const sectionNames = chapter.sections.length ? chapter.sections : [chapter.title];
    const sectionRows = sectionNames.map((sectionTitle, sectionIndex) => {
      const passages = chapter.passages.filter((passage) => passage.sectionTitle === sectionTitle);
      const x = sectionNames.length === 1 ? 50 : 12 + (76 * sectionIndex) / (sectionNames.length - 1);
      const y = 50 + Math.sin((sectionIndex / Math.max(1, sectionNames.length - 1)) * Math.PI * 2) * 23;
      const color = colors[(chapterIndex + sectionIndex) % colors.length];
      const markerId = `marker-shanhai-volume-${chapter.key}-${String(sectionIndex + 1).padStart(2, "0")}`;
      const firstPassage = passages[0] || chapter.passages[0];
      const bandWidth = 88 / sectionNames.length;
      const left = 6 + sectionIndex * bandWidth;
      const right = left + bandWidth;
      return {
        marker: {
          id: markerId,
          mapId,
          layerId,
          groupId,
          entityId: passageEntityId(firstPassage.id),
          questId: "quest-shanhai-eighteen-scrolls",
          sceneId: "",
          references: [
            { kind: "entity", id: volumeEntityId(chapter.key) },
            { kind: "entity", id: passageEntityId(firstPassage.id) }
          ],
          x,
          y,
          label: `${sectionTitle} · ${passages.length} 段`,
          markerType: "note",
          color,
          iconUrl: "",
          labelPlacement: labelPlacement(0.3),
          description: `${chapter.title}篇内单元，共 ${passages.length} 段原文与项目白话释读。`,
          updatedAt: now
        },
        region: region(
          `region-shanhai-volume-${chapter.key}-${String(sectionIndex + 1).padStart(2, "0")}`,
          sectionTitle,
          `${chapter.title}篇内单元；包含 ${passages.length} 个稳定原文段落。`,
          color,
          [[left, 12], [right, 12], [right, 88], [left, 88]],
          [{ kind: "entity", id: volumeEntityId(chapter.key) }],
          sectionIndex,
          now
        )
      };
    });

    maps.push({
      id: mapId,
      worldId: WORLD_ID,
      parentMapId,
      entryMarkerId,
      title: `${chapter.title} · 原典路线图`,
      description: `${volume?.summary || chapter.title} 本图按篇内单元组织原文、白话释读与名物入口，不自动对应现代经纬度。`,
      imageUrl: mapImageUrls.chapters?.[chapter.key] || "",
      imageTransform: imageTransform(),
      width: 1536,
      height: 1024,
      distanceWidth: Math.max(1000, chapter.characterCount),
      distanceUnit: "li",
      customDistanceUnit: "里",
      grid: { visible: false, snap: false, labels: true, columns: 16, color: "#526761", opacity: 0.12 },
      regions: sectionRows.map((item) => item.region),
      storyPhases: [],
      viewBookmarks: [{ id: `bookmark-shanhai-volume-${chapter.key}`, title: "篇目总览", centerX: 50, centerY: 50, zoom: 1, storyPhaseId: "", mode: "markers", showLabels: true, createdAt: now, updatedAt: now }],
      savedFilters: [{ id: `filter-shanhai-volume-${chapter.key}`, title: chapter.title, mode: "markers", query: "", markerKinds: ["note"], regionKinds: ["territory"], routeStatuses: ["active"], layerIds: [layerId], groupIds: [groupId], createdAt: now, updatedAt: now }],
      createdAt: now,
      updatedAt: now
    });
    layers.push({ id: layerId, worldId: WORLD_ID, mapId, title: `${chapter.title}篇内单元`, description: "篇内区域、段落入口和阅读路线。", color: colors[chapterIndex % colors.length], order: 0, visible: true, locked: false, imageUrl: "", imageTransform: imageTransform(), imageOpacity: 1, imageBlendMode: "normal", imageGroupId: "", createdAt: now, updatedAt: now });
    groups.push({ id: groupId, worldId: WORLD_ID, mapId, title: `${chapter.title}原典入口`, description: "按篇内单元进入逐段原文与白话释读。", color: colors[chapterIndex % colors.length], order: 0, visible: true, locked: false, createdAt: now, updatedAt: now });
    markers.push(...sectionRows.map((item) => item.marker));
    routes.push({
      id: `route-shanhai-volume-${chapter.key}`,
      worldId: WORLD_ID,
      mapId,
      title: `${chapter.title}阅读路线`,
      description: `依次浏览${sectionNames.join("、")}。`,
      color: colors[chapterIndex % colors.length],
      status: "active",
      travelMode: chapterIndex < 5 ? "walk" : "sail",
      travelSpeed: 20,
      travelHoursPerDay: 8,
      stops: sectionRows.map((item, index) => ({ id: `route-stop-volume-${chapter.key}-${index + 1}`, markerId: item.marker.id, title: item.marker.label, notes: item.marker.description, duration: `第 ${index + 1} 单元` })),
      curveMode: "smooth",
      waypoints: [],
      references: [{ kind: "entity", id: volumeEntityId(chapter.key) }],
      updatedAt: now
    });
  });

  return { maps, layers, groups, markers, routes };
}

function buildPlanningData(now, baseImageUrl, mapImageUrls = {}) {
  const fiveMapId = "map-shanhai-five-classics";
  const seaMapId = "map-shanhai-sea-classics";
  const fiveLayerId = `map-layer-default:${fiveMapId}`;
  const seaLayerId = `map-layer-default:${seaMapId}`;
  const fiveGroupId = "marker-group-shanhai-five-classics";
  const seaGroupId = "marker-group-shanhai-sea-classics";
  const chapterData = buildChapterMapData(now, mapImageUrls, fiveMapId, seaMapId);
  const fiveSpecs = [
    ["nan-shan", "南山经", "青丘山", 28, 76, "#4b8462"],
    ["xi-shan", "西山经", "昆仑之丘", 22, 30, "#9a6940"],
    ["bei-shan", "北山经", "发鸠山", 52, 18, "#4d7193"],
    ["dong-shan", "东山经", "钦山", 80, 48, "#9a5d50"],
    ["zhong-shan", "中山经", "光山", 53, 54, "#6d658f"]
  ];
  const fiveMarkers = fiveSpecs.map(([key, title, place, x, y, color]) => ({
    id: `marker-shanhai-five-${key}`, mapId: fiveMapId, layerId: fiveLayerId,
    groupId: fiveGroupId, entityId: volumeEntityId(key), questId: "quest-shanhai-five-mountains",
    sceneId: key === "xi-shan" ? "scene-shanhai-kunlun" : "",
    references: [{ kind: "entity", id: volumeEntityId(key) }, { kind: "map", id: chapterMapId(key) }], x, y,
    label: `${title} · ${place}`, markerType: "note", color, iconUrl: "",
    labelPlacement: labelPlacement(0.35), description: `${title}索引入口；代表地标为${place}。`, updatedAt: now
  }));
  const fiveRegions = [
    region("region-shanhai-south", "南山", "南山三列山系索引区。", "#4b8462", [[8, 56], [42, 54], [46, 94], [10, 94]], [{ kind: "entity", id: volumeEntityId("nan-shan") }], 0, now),
    region("region-shanhai-west", "西山", "西山与昆仑神域索引区。", "#9a6940", [[5, 8], [38, 8], [43, 52], [8, 55]], [{ kind: "entity", id: volumeEntityId("xi-shan") }], 1, now),
    region("region-shanhai-north", "北山", "北山水系与灾异索引区。", "#4d7193", [[39, 5], [69, 5], [66, 36], [42, 39]], [{ kind: "entity", id: volumeEntityId("bei-shan") }], 2, now),
    region("region-shanhai-east", "东山", "东山异兆与聚落索引区。", "#9a5d50", [[68, 8], [95, 12], [94, 75], [69, 68]], [{ kind: "entity", id: volumeEntityId("dong-shan") }], 3, now),
    region("region-shanhai-middle", "中山", "中部河流网络索引区。", "#6d658f", [[40, 36], [68, 34], [70, 72], [43, 78]], [{ kind: "entity", id: volumeEntityId("zhong-shan") }], 4, now)
  ];

  const seaSpecs = [
    ["hai-wai-nan", 35, 84], ["hai-nei-nan", 50, 76], ["da-huang-nan", 65, 84],
    ["hai-wai-xi", 16, 35], ["hai-nei-xi", 24, 50], ["da-huang-xi", 16, 65],
    ["hai-wai-bei", 35, 16], ["hai-nei-bei", 50, 24], ["da-huang-bei", 65, 16],
    ["hai-wai-dong", 84, 35], ["hai-nei-dong", 76, 50], ["da-huang-dong", 84, 65],
    ["hai-nei", 50, 50]
  ];
  const seaMarkers = seaSpecs.map(([key, x, y], index) => {
    const volume = classicVolumes.find((item) => item.key === key);
    return {
      id: `marker-shanhai-sea-${key}`, mapId: seaMapId, layerId: seaLayerId,
      groupId: seaGroupId, entityId: volumeEntityId(key), questId: index < 4 ? "quest-shanhai-overseas" : "",
      sceneId: key === "hai-wai-bei" ? "scene-shanhai-jingwei" : "",
      references: [{ kind: "entity", id: volumeEntityId(key) }, { kind: "map", id: chapterMapId(key) }], x, y,
      label: volume.title, markerType: "note", color: volume.group === "大荒四经" ? "#a05846" : volume.group === "海外四经" ? "#3b6f91" : "#735d91",
      iconUrl: "", labelPlacement: labelPlacement(0.32), description: volume.summary, updatedAt: now
    };
  });
  const seaRegions = [
    region("region-shanhai-sea-south", "南方三层", "海外南、海内南与大荒南。", "#4b8462", [[26, 66], [74, 66], [87, 96], [13, 96]], [{ kind: "entity", id: volumeEntityId("hai-wai-nan") }, { kind: "entity", id: volumeEntityId("hai-nei-nan") }, { kind: "entity", id: volumeEntityId("da-huang-nan") }], 0, now),
    region("region-shanhai-sea-west", "西方三层", "海外西、海内西与大荒西。", "#9a6940", [[4, 13], [34, 26], [34, 74], [4, 87]], [{ kind: "entity", id: volumeEntityId("hai-wai-xi") }, { kind: "entity", id: volumeEntityId("hai-nei-xi") }, { kind: "entity", id: volumeEntityId("da-huang-xi") }], 1, now),
    region("region-shanhai-sea-north", "北方三层", "海外北、海内北与大荒北。", "#4d7193", [[13, 4], [87, 4], [74, 34], [26, 34]], [{ kind: "entity", id: volumeEntityId("hai-wai-bei") }, { kind: "entity", id: volumeEntityId("hai-nei-bei") }, { kind: "entity", id: volumeEntityId("da-huang-bei") }], 2, now),
    region("region-shanhai-sea-east", "东方三层", "海外东、海内东与大荒东。", "#9a5d50", [[66, 26], [96, 13], [96, 87], [66, 74]], [{ kind: "entity", id: volumeEntityId("hai-wai-dong") }, { kind: "entity", id: volumeEntityId("hai-nei-dong") }, { kind: "entity", id: volumeEntityId("da-huang-dong") }], 3, now),
    region("region-shanhai-sea-center", "海内经", "作为十八篇收束的中心索引。", "#735d91", [[37, 37], [63, 37], [63, 63], [37, 63]], [{ kind: "entity", id: volumeEntityId("hai-nei") }], 4, now)
  ];
  const maps = [
    {
      id: fiveMapId, worldId: WORLD_ID, parentMapId: MAIN_MAP_ID,
      entryMarkerId: "marker-shanhai-index-five", title: "五藏山经索引图",
      description: "以五方工作区组织山经条目；位置仅用于创作索引，不主张对应现代地理。",
      imageUrl: mapImageUrls.fiveClassics || baseImageUrl, imageTransform: imageTransform(), width: 1586, height: 992,
      distanceWidth: 44700, distanceUnit: "li", customDistanceUnit: "里",
      grid: { visible: true, snap: false, labels: true, columns: 15, color: "#526761", opacity: 0.16 },
      regions: fiveRegions, storyPhases: [],
      viewBookmarks: [{ id: "bookmark-shanhai-five-overview", title: "五方总览", centerX: 50, centerY: 50, zoom: 1, storyPhaseId: "", mode: "markers", showLabels: true, createdAt: now, updatedAt: now }],
      savedFilters: [{ id: "filter-shanhai-five-volumes", title: "五藏山经", mode: "markers", query: "", markerKinds: ["note"], regionKinds: ["territory"], routeStatuses: ["active"], layerIds: [fiveLayerId], groupIds: [fiveGroupId], createdAt: now, updatedAt: now }],
      createdAt: now, updatedAt: now
    },
    {
      id: seaMapId, worldId: WORLD_ID, parentMapId: MAIN_MAP_ID,
      entryMarkerId: "marker-shanhai-index-sea", title: "海内海外与大荒索引图",
      description: "以方位和叙事层组织海外、海内、大荒诸篇；中心为海内经收束。",
      imageUrl: mapImageUrls.seaClassics || baseImageUrl, imageTransform: imageTransform(), width: 1586, height: 992,
      distanceWidth: 28000, distanceUnit: "li", customDistanceUnit: "里",
      grid: { visible: true, snap: false, labels: true, columns: 16, color: "#526761", opacity: 0.13 },
      regions: seaRegions, storyPhases: [],
      viewBookmarks: [{ id: "bookmark-shanhai-sea-overview", title: "三层四方", centerX: 50, centerY: 50, zoom: 1, storyPhaseId: "", mode: "regions", showLabels: true, createdAt: now, updatedAt: now }],
      savedFilters: [{ id: "filter-shanhai-sea-volumes", title: "十三篇海经", mode: "markers", query: "", markerKinds: ["note"], regionKinds: ["territory"], routeStatuses: ["active"], layerIds: [seaLayerId], groupIds: [seaGroupId], createdAt: now, updatedAt: now }],
      createdAt: now, updatedAt: now
    },
    ...chapterData.maps
  ];
  const layers = [
    { id: fiveLayerId, worldId: WORLD_ID, mapId: fiveMapId, title: "五方篇目与地点", description: "山经卷目、代表地点和路线。", color: "#397268", order: 0, visible: true, locked: false, imageUrl: "", imageTransform: imageTransform(), imageOpacity: 1, imageBlendMode: "normal", imageGroupId: "", createdAt: now, updatedAt: now },
    { id: seaLayerId, worldId: WORLD_ID, mapId: seaMapId, title: "海经篇目与方位", description: "海外、海内、大荒篇目索引。", color: "#3b6f91", order: 0, visible: true, locked: false, imageUrl: "", imageTransform: imageTransform(), imageOpacity: 1, imageBlendMode: "normal", imageGroupId: "", createdAt: now, updatedAt: now },
    ...chapterData.layers
  ];
  const groups = [
    { id: "marker-group-shanhai-case-index", worldId: WORLD_ID, mapId: MAIN_MAP_ID, title: "完整案例入口", description: "进入五藏山经或海经索引子地图。", color: "#635f52", order: 9, visible: true, locked: false, createdAt: now, updatedAt: now },
    { id: fiveGroupId, worldId: WORLD_ID, mapId: fiveMapId, title: "五藏山经", description: "南、西、北、东、中五篇入口。", color: "#397268", order: 0, visible: true, locked: false, createdAt: now, updatedAt: now },
    { id: seaGroupId, worldId: WORLD_ID, mapId: seaMapId, title: "海内海外与大荒", description: "十二方位篇与海内经入口。", color: "#3b6f91", order: 0, visible: true, locked: false, createdAt: now, updatedAt: now },
    ...chapterData.groups
  ];
  const indexMarkers = [
    { id: "marker-shanhai-index-five", mapId: MAIN_MAP_ID, layerId: MAIN_LAYER_ID, groupId: "marker-group-shanhai-case-index", entityId: volumeEntityId("nan-shan"), questId: "quest-shanhai-five-mountains", sceneId: "", references: [{ kind: "map", id: fiveMapId }], x: 8, y: 9, label: "进入五藏山经", markerType: "note", color: "#397268", iconUrl: "", labelPlacement: labelPlacement(0.25), description: "打开五藏山经索引子地图。", updatedAt: now },
    { id: "marker-shanhai-index-sea", mapId: MAIN_MAP_ID, layerId: MAIN_LAYER_ID, groupId: "marker-group-shanhai-case-index", entityId: volumeEntityId("hai-wai-nan"), questId: "quest-shanhai-overseas", sceneId: "", references: [{ kind: "map", id: seaMapId }], x: 92, y: 9, label: "进入海经与大荒", markerType: "note", color: "#3b6f91", iconUrl: "", labelPlacement: labelPlacement(0.25), description: "打开海内、海外与大荒索引子地图。", updatedAt: now }
  ];
  const routeStop = (id, markerId, title, notes, duration) => ({ id, markerId, title, notes, duration });
  const routes = [
    { id: "route-shanhai-five-classics", worldId: WORLD_ID, mapId: fiveMapId, title: "五藏山经校勘路线", description: "按南、西、北、东、中推进的案例主路线。", color: "#397268", status: "active", travelMode: "walk", travelSpeed: 20, travelHoursPerDay: 8, stops: fiveSpecs.map(([key, title, place], index) => routeStop(`route-stop-five-${key}`, `marker-shanhai-five-${key}`, title, `校勘${place}及其代表条目。`, `第${index + 1}幕`)), curveMode: "smooth", waypoints: [], references: [{ kind: "quest", id: "quest-shanhai-five-mountains" }], updatedAt: now },
    { id: "route-shanhai-sea-classics", worldId: WORLD_ID, mapId: seaMapId, title: "海外—海内—大荒阅读路线", description: "从海外观察进入海内，再抵达大荒和海内经收束。", color: "#3b6f91", status: "active", travelMode: "sail", travelSpeed: 28, travelHoursPerDay: 10, stops: seaSpecs.map(([key], index) => { const volume = classicVolumes.find((item) => item.key === key); return routeStop(`route-stop-sea-${key}`, `marker-shanhai-sea-${key}`, volume.title, volume.summary, `第${index + 6}章`); }), curveMode: "smooth", waypoints: [], references: [{ kind: "quest", id: "quest-shanhai-overseas" }], updatedAt: now },
    ...chapterData.routes
  ];
  return { maps, layers, groups, markers: [...indexMarkers, ...fiveMarkers, ...seaMarkers, ...chapterData.markers], routes };
}

const timelineBlueprints = [
  ["sun-order", "宇宙秩序", "羲和浴日，十日轮值", "十日由羲和所生，并在甘渊沐浴。", "神话纪·日序建立", "xihe", []],
  ["moon-order", "宇宙秩序", "常羲浴月，十二月成序", "十二月由常羲所生，并依次形成月序。", "神话纪·月序建立", "changxi", []],
  ["kuafu-sun", "英雄与战争", "夸父逐日", "夸父逐日，饮河渭而不足，赴大泽途中死去，遗杖化林。", "神话纪·逐日", "kuafu", []],
  ["jingwei-sea", "英雄与战争", "女娃化精卫", "女娃游东海溺亡，化为精卫并持续衔木石堙海。", "神话纪·填海", "jingwei", []],
  ["chiyou-war", "英雄与战争", "蚩尤作兵伐黄帝", "战争引来应龙、风伯雨师与女魃，改变雨旱秩序。", "神话纪·涿鹿战事", "chiyou", []],
  ["yinglong-stays", "英雄与战争", "应龙居南方", "应龙杀蚩尤与夸父后不得复上，南方因此多雨、北方相对多旱。", "神话纪·战后", "yinglong", ["timeline-shanhai-chiyou-war"]],
  ["gun-xirang", "洪水与禹迹", "鲧窃息壤堙洪水", "鲧未待帝命而取息壤治水。", "洪水纪·鲧治水", "gun", []],
  ["gun-falls", "洪水与禹迹", "祝融杀鲧于羽郊", "帝命祝融在羽郊处死鲧。", "洪水纪·羽郊", "zhurong", ["timeline-shanhai-gun-xirang"]],
  ["yu-born", "洪水与禹迹", "鲧复生禹", "鲧死后复生禹，治水方法与责任得以继续。", "洪水纪·继承", "yu", ["timeline-shanhai-gun-falls"]],
  ["yu-nine", "洪水与禹迹", "禹布土定九州", "帝命禹继续布土，最终定九州。", "洪水纪·完成", "yu", ["timeline-shanhai-yu-born"]],
  ["case-start", "改编主线", "青梧取得第一枚禹迹简", "招摇山的地图重影开启十八卷校勘旅程。", "旅程第 1 日", "adapt-qingwu", []],
  ["case-complete", "改编主线", "十八简合图", "青梧决定保留可追溯的差异，而不是制造唯一版本。", "旅程终章", "adapt-xuanjian", ["timeline-shanhai-case-start"]]
];

function buildTimeline(now) {
  const tracks = [
    ["cosmos", "宇宙秩序", "日月、季节与神域规则。", "#9a6940"],
    ["heroes", "英雄与战争", "逐日、填海与帝王战争。", "#a05846"],
    ["flood", "洪水与禹迹", "鲧禹治水与布土。", "#3b6f91"],
    ["adaptation", "改编主线", "青梧校勘十八卷的旅程。", "#735d91"]
  ].map(([key, name, description, color], order) => ({ id: `timeline-track-shanhai-${key}`, worldId: WORLD_ID, name, description, color, order, updatedAt: now }));
  const trackByName = new Map(tracks.map((item) => [item.name, item.id]));
  const events = timelineBlueprints.map(([key, track, title, summary, displayDate, entityKey, dependencies], index) => ({
    id: `timeline-shanhai-${key}`, worldId: WORLD_ID, entityId: entityId(entityKey), questId: key.startsWith("case-") ? "quest-shanhai-eighteen-scrolls" : "", sceneId: "",
    references: [{ kind: "entity", id: entityId(entityKey) }], trackId: trackByName.get(track), title, summary,
    displayDate, datePrecision: "custom", sortOrder: (index + 1) * 100, startValue: String((index + 1) * 100), endValue: "", era: "神话纪", dependencyIds: dependencies, updatedAt: now
  }));
  return { tracks, events };
}

function questStep(id, title, objective, condition, branch, failure, reward, notes) {
  return { id, title, objective, condition, branch, failure, reward, notes };
}

const questBlueprints = [
  { key: "eighteen-scrolls", title: "重绘禹迹图", category: "main", status: "active", summary: "收集十八篇的禹迹简，以可追溯来源重建山海图。", trigger: "青梧在招摇山看见同一条路同时指向两个方向。", entities: ["adapt-qingwu", "adapt-wuxian", "adapt-mokan", "adapt-xuanjian", "yu"], prerequisites: [], steps: [
    questStep("step-shanhai-scrolls-register", "建立来源册", "为每枚残简记录篇目、地点、异名和持有人。", "完成招摇山教学。", "可选择先按地理或按神话人物整理。", "遗漏来源会让玄简只保存为草稿记忆。", "解锁十八卷进度面板。", "总任务只追踪覆盖，不强迫单一路线。"),
    questStep("step-shanhai-scrolls-merge", "处理冲突记载", "将至少三组同名异地或同名异形条目分开。", "取得青丘、昆仑和窫窳记录。", "保留并列版本可提高原典可信度；强行合并可简化地图但产生一致性风险。", "错误合并会制造后续剧情矛盾。", "玄简获得冲突检测能力。", "重点展示 AI 不忘记来源。"),
    questStep("step-shanhai-scrolls-complete", "十八简合图", "完成十八篇索引并决定最终改编原则。", "所有主篇章任务完成。", "选择唯一叙述或保留可追溯差异。", "若来源不足，结局保持开放。", "完成全功能案例主线。", "最终选择不会删除原始记录。" )] },
  { key: "five-mountains", title: "五藏山经校勘", category: "main", status: "active", summary: "按南、西、北、东、中五方走完山经的代表路线。", trigger: "取得第一枚南山禹迹简。", entities: ["zhaoyaoshan", "kunlun", "fajiushan", "qinshan", "guangshan"], prerequisites: [], steps: [
    questStep("step-five-south", "南山辨草木", "在招摇山分辨祝余、迷榖与普通草木。", "进入五藏山经索引图。", "可食用、移植或只记录。", "过度采集会关闭后续补给。", "获得南山简。", "展示资源后果。"),
    questStep("step-five-west", "昆仑三关", "通过陆吾、英招和开明门的权限检验。", "完成南山辨草木。", "选择测量、歌诀或交换通行。", "强闯会失去神域记录权限。", "获得西山简。", "连接分支场景。"),
    questStep("step-five-north", "追随精卫", "沿木石来源校正北山至东海方位。", "取得西山简。", "帮助填海或保持观察。", "误认后世传说会降低原典分。", "获得北山简。", "动态海岸线。"),
    questStep("step-five-east-middle", "校正旱涝征兆", "比较当康、犰狳、夫诸和化蛇对应的环境后果。", "取得北山简。", "优先救灾或继续观测。", "漏记征兆会导致聚落损失。", "获得东山、中山简。", "汇总世界状态。" )] },
  { key: "kunlun-gate", title: "昆仑九门", category: "side", status: "active", summary: "取得昆仑神域的测绘许可，并确认开明兽与陆吾的职责差别。", trigger: "抵达昆仑之丘边界。", entities: ["kunlun", "luwu", "kaimingshou", "xiwangmu", "yingzhao"], prerequisites: ["quest-shanhai-five-mountains"], steps: [
    questStep("step-kunlun-name", "报出真名", "为每份证词标注来源而非只报一个答案。", "持有西山简。", "承认不确定可走学者门；坚持唯一答案走武备门。", "伪造来源将被陆吾逐出。", "开明第一门开启。", "原典和改编边界测试。"),
    questStep("step-kunlun-return", "带着差异返回", "在不删改证词的前提下离开昆仑。", "通过至少三门。", "可把冲突交给玄简保存。", "擅自统一记录会触发关系冲突。", "解锁昆仑子地图书签。", "强调可追溯性。" )] },
  { key: "jingwei", title: "精卫衔木", category: "character", status: "active", summary: "决定如何回应精卫永不停息的填海行动。", trigger: "在发鸠山取得带盐的柘木枝。", entities: ["jingwei", "fajiushan", "adapt-qingwu"], prerequisites: ["quest-shanhai-five-mountains"], steps: [
    questStep("step-jingwei-source", "追查木石来源", "从发鸠山追踪到东海沿岸。", "取得北山简。", "帮助搬运或记录潮汐。", "打断路线会让海岸标记失效。", "解锁动态海岸线。", "不把执念简单判定为善恶。"),
    questStep("step-jingwei-choice", "留下界碑", "选择支持填海、保护海潮或建立共存边界。", "理解女娃来历。", "三种结果影响后续航海路线。", "无失败，只产生不同世界状态。", "精卫关系更新。", "角色任务结局。" )] },
  { key: "overseas", title: "海外四方访录", category: "main", status: "draft", summary: "访问海外四方诸国，收集身体、技术与礼俗的第一手记录。", trigger: "五藏山经路线完成后取得出海许可。", entities: ["yuminguo", "qigongguo", "yimuguo", "junziguo", "shuhai"], prerequisites: ["quest-shanhai-five-mountains"], steps: [
    questStep("step-overseas-south", "南海五国", "完成不带价值判断的访谈记录。", "抵达海外南方。", "可按地理、礼俗或技术分类。", "把形貌写成道德评价会失去信任。", "取得海外南简。", "展示资料伦理。"),
    questStep("step-overseas-west", "飞车与无首之舞", "记录奇肱飞车与刑天证词。", "完成南海访问。", "选择工程证据或口述史优先。", "只保留胜者叙述会关闭刑天支线。", "取得海外西简。", "技术与神话并置。"),
    questStep("step-overseas-north-east", "逐日与汤谷", "校正北方遗杖和东方日序。", "取得海外西简。", "按竖亥步数或天吴潮汐校准。", "尺度混用会使航线偏移。", "取得海外北、海外东简。", "进入海内四经。" )] },
  { key: "great-waste", title: "大荒日月之谜", category: "main", status: "draft", summary: "穿越四方大荒，厘清日月、战争与帝俊谱系。", trigger: "海内外十二篇索引达到完整。", entities: ["xihe", "changxi", "dijun", "kui", "yinglong", "nuwachang"], prerequisites: ["quest-shanhai-overseas"], steps: [
    questStep("step-waste-east-south", "雷鼓与十日", "在大壑和甘渊取得东、南大荒简。", "完成海外四方访录。", "先平息夔雷或先校正日序。", "错过日序窗口需等待下一轮。", "大荒东、南简。", "天气与时间联动。"),
    questStep("step-waste-west-north", "不周与战后", "记录不周山缺口和应龙女魃战后处境。", "取得东南两简。", "保留后世传说为旁注或完全排除。", "把旁注写成原典会触发 AI 记忆冲突。", "大荒西、北简。", "资料层级测试。" )] },
  { key: "flood", title: "鲧禹息壤", category: "main", status: "draft", summary: "围绕息壤、羽山和禹布土完成全书收束。", trigger: "取得四篇大荒简。", entities: ["gun", "yu", "zhurong", "xirang", "yushan-feather", "duguang"], prerequisites: ["quest-shanhai-great-waste"], steps: [
    questStep("step-flood-judgment", "重审鲧的选择", "核对窃息壤、未待帝命与洪水情势。", "抵达羽山。", "评价动机、方法或秩序。", "单一结论会失去部分角色证词。", "海内经简开启。", "不代替作者作最终道德判断。"),
    questStep("step-flood-map", "禹终布土", "把十八篇索引合为可追溯地图。", "完成重审。", "保留差异或发布统一改编版。", "来源不足则不能发布为原典版。", "主线完成。", "完整案例结局。" )] },
  { key: "nine-tail", title: "青丘两处，九尾三说", category: "side", status: "active", summary: "区分青丘山、青丘国和后世九尾狐形象。", trigger: "同时检索到青丘山与青丘国。", entities: ["jiuweihu", "qingqiushan", "qingqiuguo"], prerequisites: ["quest-shanhai-five-mountains"], steps: [
    questStep("step-nine-tail-separate", "拆分同名地点", "确认青丘山与青丘国分属不同篇章语境。", "拥有南山经和海外东经索引。", "建立关联但不合并，或选择改编合并并明确标记。", "无标记合并会触发一致性问题。", "解锁青丘关系册。", "这是同名消歧案例。"),
    questStep("step-nine-tail-rumor", "整理三种传闻", "分别记录原典危险性、后世祥瑞和现代魅惑形象。", "完成地点拆分。", "作者可选择改编主形象。", "不区分来源会让 AI 自动混写。", "九尾狐条目完成。", "展示 AI 记忆来源权重。" )] }
];

function buildQuests(now) {
  return questBlueprints.map((item) => ({
    id: `quest-shanhai-${item.key}`, worldId: WORLD_ID, title: item.title, category: item.category,
    status: item.status, summary: item.summary, trigger: item.trigger,
    relatedEntityIds: item.entities.map(entityId), prerequisiteQuestIds: item.prerequisites,
    steps: item.steps,
    developerNotes: "案例规则：原典事实、传本异文和现代改编必须分层；AI 生成内容默认进入草稿，作者确认后才成为正典。",
    updatedAt: now
  }));
}

function effect(id, variableId, operation, value) {
  return { id, variableId, operation, value };
}

function buildStory(now) {
  const variables = [
    ["canon-score", "lore.canon_score", "原典可信度", "number", 0, "正确保留来源和异文时增加。"],
    ["adaptation-mode", "lore.adaptation_mode", "改编模式", "text", "未选择", "记录项目偏向严谨考据、传奇改编或并行双轨。"],
    ["jingwei-helped", "world.jingwei_helped", "已帮助精卫", "boolean", false, "是否主动参与填海。"],
    ["kunlun-route", "route.kunlun_gate", "昆仑通行路线", "text", "未选择", "学者门、歌舞门或武备门。"],
    ["flood-truth", "lore.flood_truth_open", "治水证词已公开", "boolean", false, "鲧、祝融与禹的证词是否同时公开。"],
    ["map-fragments", "progress.map_fragments", "禹迹简数量", "number", 1, "已确认来源的禹迹简数量。"]
  ].map(([key, variableKey, name, type, defaultValue, description]) => ({ id: `variable-shanhai-${key}`, worldId: WORLD_ID, key: variableKey, name, type, defaultValue, description, updatedAt: now }));
  const v = (key) => `variable-shanhai-${key}`;
  const scenes = [
    {
      id: "scene-shanhai-council", worldId: WORLD_ID, title: "招摇山的第一道重影", summary: "青梧决定案例采用何种原典与改编边界。", status: "ready", entryNodeId: "node-shanhai-council-open",
      relatedEntityIds: [entityId("adapt-qingwu"), entityId("adapt-wuxian"), entityId("adapt-mokan"), entityId("zhaoyaoshan")], relatedQuestIds: ["quest-shanhai-eighteen-scrolls"],
      nodes: [
        { id: "node-shanhai-council-open", label: "地图出现两条路", speakerEntityId: entityId("adapt-qingwu"), text: "同一枚简上有两条向东的路。删掉一条，地图就会干净；留下两条，我们就得解释它们分别来自哪里。", stageDirection: "水彩山脊在纸面上缓慢错开。", conditions: [], effects: [], nextNodeId: "", choices: [
          { id: "choice-shanhai-rigorous", text: "保留两条，先记录来源。", targetNodeId: "node-shanhai-rigorous", conditions: [], effects: [effect("effect-canon-plus", v("canon-score"), "increment", 2), effect("effect-mode-rigorous", v("adaptation-mode"), "set", "原典优先双轨改编")] },
          { id: "choice-shanhai-legend", text: "合成一条，但把改编写清楚。", targetNodeId: "node-shanhai-legend", conditions: [], effects: [effect("effect-canon-one", v("canon-score"), "increment", 1), effect("effect-mode-legend", v("adaptation-mode"), "set", "传奇改编并标注来源")] }
        ], isEnding: false },
        { id: "node-shanhai-rigorous", label: "双轨原则", speakerEntityId: entityId("adapt-xuanjian"), text: "已建立两条记录。它们可以互相矛盾，但不能失去出处。", stageDirection: "玄简为两条路分别刻下篇名。", conditions: [], effects: [], nextNodeId: "", choices: [], isEnding: true },
        { id: "node-shanhai-legend", label: "标注改编", speakerEntityId: entityId("adapt-wuxian"), text: "故事可以选择一条路。只要别让后人以为另一条从未存在。", stageDirection: "巫弦在合并处系上一根红绳。", conditions: [], effects: [], nextNodeId: "", choices: [], isEnding: true }
      ], notes: "首次选择只设定写作原则，不删除任何来源。", updatedAt: now
    },
    {
      id: "scene-shanhai-kunlun", worldId: WORLD_ID, title: "昆仑开明门", summary: "用来源、歌舞或武力申请进入昆仑。", status: "review", entryNodeId: "node-kunlun-open",
      relatedEntityIds: [entityId("adapt-qingwu"), entityId("luwu"), entityId("kaimingshou"), entityId("dijiang")], relatedQuestIds: ["quest-shanhai-kunlun-gate"],
      nodes: [
        { id: "node-kunlun-open", label: "九面同时发问", speakerEntityId: entityId("kaimingshou"), text: "你带来的穷奇，是牛形，还是有翼之虎？", stageDirection: "九张人面从不同方向看向地图。", conditions: [], effects: [], nextNodeId: "", choices: [
          { id: "choice-kunlun-source", text: "西山经记牛形；翼虎是后世视觉改编。", targetNodeId: "node-kunlun-scholar", conditions: [], effects: [effect("effect-kunlun-canon", v("canon-score"), "increment", 2), effect("effect-kunlun-route", v("kunlun-route"), "set", "学者门")] },
          { id: "choice-kunlun-dance", text: "让帝江用歌舞证明图像只是另一种语言。", targetNodeId: "node-kunlun-dance", conditions: [], effects: [effect("effect-kunlun-dance-route", v("kunlun-route"), "set", "歌舞门")] }
        ], isEnding: false },
        { id: "node-kunlun-scholar", label: "学者门", speakerEntityId: entityId("luwu"), text: "能分出处，方可入帝之下都。", stageDirection: "一扇刻满篇名的门向内开启。", conditions: [], effects: [effect("effect-fragment-west", v("map-fragments"), "increment", 1)], nextNodeId: "", choices: [], isEnding: true },
        { id: "node-kunlun-dance", label: "歌舞门", speakerEntityId: entityId("dijiang"), text: "它没有面目，却让整座门随节拍转向。", stageDirection: "地图边缘出现一条只能用节奏记住的路。", conditions: [], effects: [effect("effect-fragment-west-dance", v("map-fragments"), "increment", 1)], nextNodeId: "", choices: [], isEnding: true }
      ], notes: "两条路线都有效，但提供不同的后续证据。", updatedAt: now
    },
    {
      id: "scene-shanhai-jingwei", worldId: WORLD_ID, title: "东海边的第三种选择", summary: "帮助精卫、保护海潮或建立共存界碑。", status: "review", entryNodeId: "node-jingwei-open",
      relatedEntityIds: [entityId("adapt-qingwu"), entityId("jingwei"), entityId("fajiushan")], relatedQuestIds: ["quest-shanhai-jingwei"],
      nodes: [
        { id: "node-jingwei-open", label: "木石落海", speakerEntityId: entityId("adapt-qingwu"), text: "每一块石头都让海岸前进一步，也让一处潮池消失。我们要帮谁？", stageDirection: "精卫在浪尖盘旋，喙中仍衔着柘枝。", conditions: [], effects: [], nextNodeId: "", choices: [
          { id: "choice-jingwei-help", text: "帮精卫完成今天的填海。", targetNodeId: "node-jingwei-help", conditions: [], effects: [effect("effect-jingwei-help", v("jingwei-helped"), "set", true)] },
          { id: "choice-jingwei-boundary", text: "立一条随潮汐移动的界碑。", targetNodeId: "node-jingwei-boundary", conditions: [], effects: [effect("effect-jingwei-canon", v("canon-score"), "increment", 1)] }
        ], isEnding: false },
        { id: "node-jingwei-help", label: "共同衔石", speakerEntityId: entityId("jingwei"), text: "鸟鸣像在重复自己的名字。新的浅滩出现在地图上。", stageDirection: "玄简记录了一条临时海岸线。", conditions: [], effects: [], nextNodeId: "", choices: [], isEnding: true },
        { id: "node-jingwei-boundary", label: "潮汐界碑", speakerEntityId: entityId("adapt-wuxian"), text: "不是劝它忘记，也不是命海停止。让两种坚持都留下边界。", stageDirection: "界碑随着潮水前后移动。", conditions: [], effects: [], nextNodeId: "", choices: [], isEnding: true }
      ], notes: "不存在简单失败，选择改变海岸世界状态。", updatedAt: now
    },
    {
      id: "scene-shanhai-flood", worldId: WORLD_ID, title: "羽山三份证词", summary: "在鲧、祝融与禹的叙述之间决定如何公开治水真相。", status: "draft", entryNodeId: "node-flood-open",
      relatedEntityIds: [entityId("gun"), entityId("yu"), entityId("zhurong"), entityId("xirang"), entityId("adapt-qingwu")], relatedQuestIds: ["quest-shanhai-flood"],
      nodes: [
        { id: "node-flood-open", label: "三份证词", speakerEntityId: entityId("adapt-xuanjian"), text: "鲧写下洪水，祝融写下帝命，禹写下尚未完成的土地。三份都是真的，却没有一份足够。", stageDirection: "三列文字在羽山上空并排展开。", conditions: [], effects: [], nextNodeId: "", choices: [
          { id: "choice-flood-publish", text: "同时公开三份证词。", targetNodeId: "node-flood-open-truth", conditions: [], effects: [effect("effect-flood-truth", v("flood-truth"), "set", true), effect("effect-flood-canon", v("canon-score"), "increment", 2)] },
          { id: "choice-flood-adapt", text: "先写成青梧的限知经历，证词留在附录。", targetNodeId: "node-flood-story", conditions: [], effects: [effect("effect-flood-mode", v("adaptation-mode"), "set", "小说正文限知，附录保留证词")] }
        ], isEnding: false },
        { id: "node-flood-open-truth", label: "公开来源", speakerEntityId: entityId("yu"), text: "地图终于没有替任何人沉默。", stageDirection: "十八枚残简围成一圈，各自保留裂痕。", conditions: [], effects: [effect("effect-fragments-complete", v("map-fragments"), "set", 18)], nextNodeId: "", choices: [], isEnding: true },
        { id: "node-flood-story", label: "限知正文", speakerEntityId: entityId("adapt-qingwu"), text: "我只能写我看见的，但我会把没看见的放在读者能找到的地方。", stageDirection: "正文与附录在玄简上分成两层。", conditions: [], effects: [effect("effect-fragments-story", v("map-fragments"), "set", 18)], nextNodeId: "", choices: [], isEnding: true }
      ], notes: "最终选择展示正文叙事与资料附录可以并存。", updatedAt: now
    }
  ];
  const presets = [
    { id: "test-preset-shanhai-default", worldId: WORLD_ID, name: "首次校勘", description: "从默认状态测试四个分支场景。", sceneId: "scene-shanhai-council", initialState: Object.fromEntries(variables.map((item) => [item.id, item.defaultValue])), maxDepth: 24, maxPaths: 120, updatedAt: now },
    { id: "test-preset-shanhai-rigorous", worldId: WORLD_ID, name: "原典优先路线", description: "以较高原典可信度测试昆仑和终章。", sceneId: "scene-shanhai-kunlun", initialState: { [v("canon-score")]: 6, [v("adaptation-mode")]: "原典优先双轨改编", [v("jingwei-helped")]: false, [v("kunlun-route")]: "未选择", [v("flood-truth")]: false, [v("map-fragments")]: 5 }, maxDepth: 24, maxPaths: 120, updatedAt: now }
  ];
  return { variables, scenes, presets };
}

const milestoneBlueprints = [
  ["principles", "案例原则确认", "序章", "done", "critical", [], ["eighteen-scrolls"], ["scene-shanhai-council"], ["adapt-qingwu", "adapt-xuanjian"], ["case-start"]],
  ["mountains", "五藏山经可走通", "第一幕", "drafting", "critical", ["principles"], ["five-mountains", "kunlun-gate", "jingwei", "nine-tail"], ["scene-shanhai-kunlun", "scene-shanhai-jingwei"], ["zhaoyaoshan", "kunlun", "fajiushan", "qinshan", "guangshan"], []],
  ["overseas", "海外四方访录", "第二幕", "planned", "high", ["mountains"], ["overseas"], [], ["yuminguo", "qigongguo", "yimuguo", "junziguo"], []],
  ["inner", "海内四经校勘", "第三幕", "planned", "high", ["overseas"], ["overseas"], [], ["bashe", "kaimingshou", "jiuying", "qiongsang"], []],
  ["wilderness", "四方大荒完成", "第四幕", "planned", "critical", ["inner"], ["great-waste"], [], ["kui", "xihe", "changxi", "yinglong"], []],
  ["flood", "羽山三份证词", "终幕", "planned", "critical", ["wilderness"], ["flood"], ["scene-shanhai-flood"], ["gun", "yu", "zhurong", "xirang"], ["gun-xirang", "gun-falls", "yu-nine"]],
  ["manuscript", "十八章书稿结构", "全书", "done", "high", ["principles"], [], [], ["adapt-qingwu"], []],
  ["memory", "AI 长期记忆基线", "全项目", "done", "critical", ["principles"], [], [], ["adapt-xuanjian"], []]
];

function buildMilestones(now) {
  return milestoneBlueprints.map(([key, title, act, status, priority, dependencyKeys, questKeys, sceneIds, entityKeys, timelineKeys], order) => ({
    id: `milestone-shanhai-${key}`, worldId: WORLD_ID, title,
    summary: key === "principles" ? "明确原典、异文和现代改编的资料边界。" : `完成${title}并保持所有来源可追溯。`,
    act, status, priority, order, targetDate: "", blockedReason: "",
    developerNotes: "不以自动生成内容覆盖作者确认的原典记录。",
    manuscriptBody: "",
    dependencyIds: dependencyKeys.map((item) => `milestone-shanhai-${item}`),
    linkedQuestIds: questKeys.map((item) => `quest-shanhai-${item}`), linkedSceneIds: sceneIds,
    linkedEntityIds: entityKeys.map(entityId), linkedTimelineEventIds: timelineKeys.map((item) => `timeline-shanhai-${item}`),
    linkedMapMarkerIds: [], linkedReviewIssueIds: [], createdAt: now, updatedAt: now
  }));
}

const chapterOpenings = [
  "青梧第一次看见地图重影时，招摇山正下着没有云的雨。雨线落在简面上，一半向东流，一半沿着不存在的山脊折回西海。墨堪说绳墨没有错，巫弦却从雨声里听见两个不同的地名。",
  "昆仑没有城墙。真正的边界是陆吾问出的第一个问题：你带来的穷奇，究竟是牛形，还是生着双翼的虎？青梧低头看向水彩图签，忽然明白图像也会把后来者的记忆压在原文之上。",
  "发鸠山的柘枝上结着盐。精卫每一次振翅，都会从东海带回一点潮气。青梧沿着落下的木屑测量，发现海岸线并非被填平，而是在两种执念之间缓慢移动。",
  "钦山脚下的人们正在庆祝丰收，远处却有犰狳蜷在石缝中沉睡。一个异兆许诺谷物，另一个异兆预告虫灾；玄简把两条消息同时点亮，没有替任何人决定该相信哪一条。",
  "中山的河流像一部互相引用的书。青梧封住一条支流，另一页地图便渗出水迹。计蒙从漳渊抬起龙首，风雨把所有固定比例尺冲得模糊。",
  "离开熟悉的山系后，地图不再以山为句读。羽民国的屋舍从崖壁向上生长，贯胸国的衣带从身体中穿过；青梧删掉了笔记里第一个惊异的形容词，重新从居民的用途写起。",
  "刑天没有头，却不妨碍他记得败北。常羊山上的每一次干戚起落，都像在反驳一份只记录胜者的战报。巫弦把节拍录成旁注，墨堪第一次没有要求把它换算成步数。",
  "夸父遗下的杖林在夜里向北移动。树根饮尽一段旧河床，又在天亮前把道路还给荒原。青梧必须决定：地图究竟记录树的位置，还是记录它移动的愿望。",
  "汤谷水面同时托起十个太阳。每一个倒影都能指出自己照亮过的国度，只有扶木知道今天该轮到谁。青梧把时间也画成一条路线，才看见东方地图的出口。",
  "巴蛇的骨骼成了聚落的白色城墙。老人说墙保护他们，孩子却说每到雨季，骨缝里仍会传来吞咽声。青梧不敢把它标成遗迹，也不敢写成活物。",
  "开明九门没有同时打开。九张人面分别索要名字、记忆、代价和归途。玄简可以回答前三项，却把最后一项留给青梧，因为机器能保存目的地，不能替作者决定回去意味着什么。",
  "凶水在夜里发出九种声音。每一种声音都对应一处决口，但只有八处出现在墨堪的图上。巫弦提醒他们，第九处也许不是水口，而是被遗漏的证词。",
  "穷桑的旧琴瑟已经没有弦。少昊孺养颛顼的记录被后人写成了另一种关系，青梧把两张关系卡拆开，才在琴腹中找到通往东海之外的刻痕。",
  "夔从流波山入水，雷声先于它的身体抵达大壑。每一次鼓响，地图边缘便少一寸。墨堪开始用声音间隔测量距离，终于承认并非所有尺度都需要一把尺。",
  "羲和在甘渊洗过第九个太阳时，第十个仍拒绝落下。青梧逐一核对它们照亮过的篇章，发现多出的不是太阳，而是一段被复制到错误来源的记忆。",
  "不周山的缺口没有向任何方向延伸。它只是让所有线条都无法闭合。青梧把后世最熟悉的故事写进旁注，却没有让旁注冒充眼前这篇原典。",
  "应龙停在南方，翅上还留着战场的泥。女魃站在干裂的北地，两位功臣都无法回到原来的天上。胜利写在同一页，旱灾也写在同一页。",
  "羽山上悬着三份证词：鲧写洪水，祝融写帝命，禹写尚未完成的土地。十八枚残简终于围成一圈。青梧没有磨平它们的裂口，只在每一道裂口旁写下来源。"
];

function chapterBody(volume, index) {
  const second = [
    "她把这次分歧记为案例的第一条规则：无法立即裁定的内容，先保存为带来源的并列记录。玄简照做了，纸面上的两条路没有消失，却第一次变得可以理解。",
    "青梧回答西山经的穷奇本作牛形，翼虎属于本项目沿用的现代视觉演绎。九张面孔没有判她错误，只把两种形象分送到不同的门。",
    "她最终立下一块随潮水移动的界碑。界碑不命令精卫停止，也不要求海放弃涨落；它只让后来者知道，这条边界来自一次仍未结束的选择。"
  ][index] || `这一章以${volume.highlights.slice(0, 3).join("、")}为核心，把原典索引转成青梧可经历的事件。章末保留来源页，所有新增对白和因果均标为现代改编。`;
  return `<p>${chapterOpenings[index]}</p><p>${second}</p><hr><p><strong>资料层说明：</strong>本章为原创小说正文，原典事实请从关联的《${volume.title}》条目进入核对。</p>`;
}

function volumeIndexForChapter(index) {
  if (index <= 4) return 0;
  if (index <= 8) return 1;
  if (index <= 12) return 2;
  if (index <= 16) return 3;
  return 4;
}

function milestoneForVolume(volume) {
  if (volume.group === "五藏山经") return "milestone-shanhai-mountains";
  if (volume.group === "海外四经") return "milestone-shanhai-overseas";
  if (volume.group === "大荒四经") return "milestone-shanhai-wilderness";
  if (volume.title === "海内经") return "milestone-shanhai-flood";
  return "milestone-shanhai-inner";
}

function buildManuscript(now) {
  const book = { id: BOOK_ID, worldId: WORLD_ID, title: "禹迹山海录", subtitle: "十八卷改编长篇示例", summary: "青梧与同行者校勘十八枚禹迹残简，在原典、异文和现代改编之间重绘一张可追溯的山海图。", status: "drafting", order: 0, targetWordCount: 120000, dailyWordGoal: 1200, writingDays: [], createdAt: now, updatedAt: now };
  const volumeDefs = [
    ["mountains", "第一卷 五藏山经", "沿南、西、北、东、中五方建立测绘与资料规则。", 30000],
    ["overseas", "第二卷 海外四方", "以访问、礼俗和异名校勘打开海外世界。", 24000],
    ["inner", "第三卷 海内诸境", "回到内圈，处理昆仑、凶水和帝王旧谱。", 24000],
    ["wilderness", "第四卷 四方大荒", "进入日月、战争和神谱交叠的大荒。", 28000],
    ["final", "第五卷 海内收束", "在羽山与都广完成十八简合图。", 14000]
  ];
  const volumes = volumeDefs.map(([key, title, summary, targetWordCount], order) => ({ id: `manuscript-volume-shanhai-${key}`, worldId: WORLD_ID, bookId: BOOK_ID, title, summary, status: order === 0 ? "drafting" : "outline", order, targetWordCount, createdAt: now, updatedAt: now }));
  const chapters = classicVolumes.map((volume, index) => {
    const volumeIndex = volumeIndexForChapter(index);
    const refs = [{ kind: "entity", id: volumeEntityId(volume.key) }];
    volume.highlights.slice(0, 2).forEach((title) => {
      const canonical = allCanonicalRecords.find((item) => item.title === title);
      if (canonical) refs.push({ kind: "entity", id: entityId(canonical.key) });
    });
    return {
      id: `manuscript-chapter-shanhai-${String(index + 1).padStart(2, "0")}`, worldId: WORLD_ID, bookId: BOOK_ID,
      volumeId: volumes[volumeIndex].id, title: `第${index + 1}章 ${volume.chapterTitle}`,
      summary: volume.hook, body: chapterBody(volume, index),
      notes: `原典底本索引：${sourceUrl(volume.title)}。正文为现代原创，不得反向写入原典事实字段。`,
      status: index < 2 ? "revision" : index < 5 ? "drafting" : "outline", order: index,
      targetWordCount: index === 17 ? 6500 : 5200, viewpointEntityId: entityId("adapt-qingwu"),
      timelineStart: `旅程第 ${index + 1} 阶段`, timelineEnd: `旅程第 ${index + 1} 阶段末`,
      linkedNarrativeMilestoneId: milestoneForVolume(volume),
      linkedStorySceneIds: index === 0 ? ["scene-shanhai-council"] : index === 1 ? ["scene-shanhai-kunlun"] : index === 2 ? ["scene-shanhai-jingwei"] : index === 17 ? ["scene-shanhai-flood"] : [],
      references: refs, annotations: [], createdAt: now, updatedAt: now
    };
  });
  const sceneDefs = [
    ["rain-map", 0, "无云雨中的重影", "青梧、巫弦和墨堪第一次确认地图存在两个来源。", "scene-shanhai-council", "zhaoyaoshan"],
    ["kunlun-answer", 1, "九面问穷奇", "青梧用原典与视觉改编的分层回答开明兽。", "scene-shanhai-kunlun", "kunlun"],
    ["moving-boundary", 2, "会移动的海岸界碑", "青梧为精卫与海潮留下可变化的边界。", "scene-shanhai-jingwei", "fajiushan"],
    ["winner-report", 6, "常羊山的败者节拍", "刑天的舞补上战报中被删去的败者视角。", "", "xingtian"],
    ["nine-voices", 11, "凶水第九声", "队伍发现遗漏的不是决口，而是一份证词。", "", "jiuying"],
    ["three-testimonies", 17, "羽山三份证词", "青梧决定同时保留鲧、祝融与禹的记录。", "scene-shanhai-flood", "yushan-feather"]
  ];
  const scenes = sceneDefs.map(([key, chapterIndex, title, summary, linkedStorySceneId, locationKey], order) => ({
    id: `manuscript-scene-shanhai-${key}`, worldId: WORLD_ID, bookId: BOOK_ID,
    volumeId: chapters[chapterIndex].volumeId, chapterId: chapters[chapterIndex].id, title, summary,
    body: `<p>${chapterOpenings[chapterIndex]}</p>`, notes: "场景正文可在最大化编辑器中继续扩写。",
    status: order < 3 ? "drafting" : "outline", order, viewpointEntityId: entityId("adapt-qingwu"),
    locationEntityId: entityId(locationKey), relatedEntityIds: [entityId("adapt-qingwu"), entityId(locationKey)],
    timelineStart: chapters[chapterIndex].timelineStart, timelineEnd: chapters[chapterIndex].timelineEnd,
    linkedStorySceneId, references: [{ kind: "entity", id: entityId(locationKey) }], annotations: [], createdAt: now, updatedAt: now
  }));
  const clues = [
    ["false-first-map", "被判作伪本的第一枚简", "青梧家传简与通行路线不一致，终章证明它记录的是另一叙述层。", 0, 17, ["adapt-qingwu", "adapt-xuanjian"]],
    ["qiongqi-image", "穷奇的两种形貌", "昆仑问答建立原典牛形与现代翼虎图签的分层。", 1, 15, ["qiongqi", "kaimingshou"]],
    ["moving-coast", "精卫改变的海岸线", "第三章立下的潮汐界碑在终章成为保留差异的模型。", 2, 17, ["jingwei", "fajiushan"]],
    ["missing-ninth", "凶水缺失的第九处", "第九声对应的是被删去证词，不是地理决口。", 11, 17, ["jiuying", "adapt-wuxian"]],
    ["copied-sun", "多出的太阳倒影", "被复制到错误来源的记忆将在甘渊被识别。", 8, 14, ["xihe", "fumu"]],
    ["three-testimonies", "羽山三份证词", "鲧、祝融、禹三份记录在终章同时公开。", 9, 17, ["gun", "zhurong", "yu"]]
  ].map(([key, title, description, setupIndex, payoffIndex, relatedKeys], order) => ({ id: `manuscript-clue-shanhai-${key}`, worldId: WORLD_ID, bookId: BOOK_ID, title, description, status: payoffIndex <= 2 ? "resolved" : "open", setupUnitKind: "chapter", setupUnitId: chapters[setupIndex].id, payoffUnitKind: "chapter", payoffUnitId: chapters[payoffIndex].id, relatedEntityIds: relatedKeys.map(entityId), authorConfirmed: true, createdAt: now, updatedAt: now, order }));
  const knowledge = [
    ["qingwu-source", "adapt-qingwu", "地图重影来自不同来源，而非单纯测量错误。", "known", 0],
    ["qingwu-qiongqi", "adapt-qingwu", "西山经穷奇为牛形；翼虎是案例视觉改编。", "known", 1],
    ["mokan-oral", "adapt-mokan", "口传节拍也能保存可重复的路线信息。", "suspected", 6],
    ["wuxian-elixir", "adapt-wuxian", "不死药不能保证复生者保持原貌。", "known", 10],
    ["qingwu-flood", "adapt-qingwu", "治水真相必须同时包含鲧的动机、帝命与禹的继承。", "suspected", 16],
    ["xuanjian-author", "adapt-xuanjian", "最终设定必须由作者确认，记忆系统不能自行裁决。", "known", 17]
  ].map(([key, characterKey, fact, level, chapterIndex]) => ({ id: `manuscript-knowledge-shanhai-${key}`, worldId: WORLD_ID, bookId: BOOK_ID, characterId: entityId(characterKey), fact, level, unitKind: "chapter", unitId: chapters[chapterIndex].id, authorConfirmed: true, createdAt: now, updatedAt: now }));
  return { books: [book], volumes, chapters, scenes, clues, knowledge };
}

const relationBlueprints = [
  ["lushu-place", "lushu", "niuyangshan", "located", "栖息于", "directed", 5],
  ["jiuweihu-place", "jiuweihu", "qingqiushan", "located", "栖息于", "directed", 5],
  ["fenghuang-place", "fenghuang", "danxueshan", "located", "栖息于", "directed", 5],
  ["dijiang-place", "dijiang", "tianshan", "located", "栖息于", "directed", 5],
  ["yingzhao-place", "yingzhao", "huaijiangshan", "located", "司守", "directed", 5],
  ["luwu-place", "luwu", "kunlun", "located", "掌守", "directed", 5],
  ["xiwangmu-place", "xiwangmu", "yushan", "located", "居于", "directed", 5],
  ["jingwei-place", "jingwei", "fajiushan", "located", "发源于", "directed", 5],
  ["dangkang-place", "dangkang", "qinshan", "located", "栖息于", "directed", 5],
  ["jimeng-place", "jimeng", "guangshan", "located", "游于漳渊", "directed", 5],
  ["zhulong-place", "zhulong", "zhongshan", "located", "居于", "directed", 5],
  ["kui-place", "kui", "liuboshan", "located", "栖息于", "directed", 5],
  ["kuafu-place", "kuafu", "chengduzaitian", "located", "见于", "directed", 4],
  ["zaochi-place", "zaochi", "shouhuaye", "located", "战于", "directed", 4],
  ["xihe-place", "xihe", "ganyuan", "located", "浴日于", "directed", 5],
  ["gun-place", "gun", "yushan-feather", "located", "死于羽郊", "directed", 5],
  ["gun-yu", "gun", "yu", "family", "复生禹", "directed", 5],
  ["zhurong-gun", "zhurong", "gun", "rival", "奉命诛杀", "directed", 5],
  ["yinglong-chiyou", "yinglong", "chiyou", "rival", "交战并杀之", "directed", 5],
  ["yi-zaochi", "yi", "zaochi", "rival", "寿华之野交战", "directed", 5],
  ["shaohao-zhuanxu", "shaohao", "zhuanxu", "custom", "孺养", "directed", 5],
  ["dijun-xihe", "dijun", "xihe", "family", "配偶", "undirected", 5],
  ["dijun-changxi", "dijun", "changxi", "family", "配偶", "undirected", 5],
  ["qingqiu-two", "qingqiushan", "qingqiuguo", "custom", "同名异地索引", "undirected", 3],
  ["kunlun-yushan", "kunlun", "yushan", "route", "昆仑神域关联", "undirected", 4],
  ["zhaoyao-qingqiu", "zhaoyaoshan", "qingqiushan", "route", "南次一经路线", "undirected", 4],
  ["tanggu-dahe", "tanggu", "dahe", "route", "东方极境航线", "undirected", 3],
  ["chishui-liusha", "chishui", "liusha", "route", "大荒西方位参照", "undirected", 3],
  ["qingwu-wuxian", "adapt-qingwu", "adapt-wuxian", "ally", "同行校勘", "undirected", 4],
  ["qingwu-mokan", "adapt-qingwu", "adapt-mokan", "ally", "共同测绘", "undirected", 4],
  ["qingwu-xuanjian", "adapt-qingwu", "adapt-xuanjian", "controls", "作者最终确认", "directed", 5],
  ["xuanjian-yu", "adapt-xuanjian", "yu", "custom", "禹迹记忆载体", "directed", 3],
  ["jingwei-qingwu", "jingwei", "adapt-qingwu", "custom", "海岸选择", "undirected", 3],
  ["luwu-kaiming", "luwu", "kaimingshou", "ally", "共同守卫昆仑", "undirected", 4],
  ["xirang-gun", "xirang", "gun", "custom", "被窃用于治水", "directed", 5],
  ["fumu-tanggu", "fumu", "tanggu", "located", "生于", "directed", 5],
  ["jianmu-duguang", "jianmu", "duguang", "located", "立于", "directed", 5]
];

function buildRelations(now) {
  return relationBlueprints.map(([key, sourceKey, targetKey, kind, label, direction, strength]) => ({
    id: `relation-shanhai-${key}`, worldId: WORLD_ID, sourceEntityId: entityId(sourceKey), targetEntityId: entityId(targetKey),
    kind, label, direction, strength, notes: "案例关系只表达原典明确联系或已标注的现代改编联系。", updatedAt: now
  }));
}

const memoryBlueprints = [
  ["scope", "canon", "原典全集资料边界", "本项目完整收录十八篇开放底本、逐段校注显示文本和固定修订来源；名物公式索引与现代改编仍需和原文层分开。", "项目", "资料范围", "十八篇完整原文与可追溯索引", true],
  ["layers", "rule", "三层资料规则", "所有内容必须区分原典明确记载、传本异文和现代改编。AI 新增内容默认是草稿。", "项目", "资料分层", "原典/异文/改编", true],
  ["map", "rule", "地图不是现代地理定位", "案例地图用于篇章与叙事索引，不主张山川对应现代经纬度。", "地图", "地理解释", "叙事索引", true],
  ["author", "rule", "作者拥有最终确认权", "玄简和 AI 可以保存、检索和提示冲突，但不能自行把草稿升级为作者正典。", "AI", "确认权", "作者", true],
  ["qiongqi", "canon", "穷奇形貌分层", "西山经本篇穷奇为牛形猬毛；地图翼虎图签属于现代视觉改编。", "穷奇", "形貌", "牛形原典/翼虎改编", true],
  ["qingqiu", "canon", "青丘山与青丘国分开", "南山经青丘山和海外东经青丘国是两个独立条目，只建立同名关联，不自动合并。", "青丘", "消歧", "山与国分开", true],
  ["yayu", "canon", "窫窳同名异形", "窫窳涉及天神被杀、群巫持不死药及后续兽形记载，必须保留跨篇状态。", "窫窳", "状态", "死亡/复生/兽形并列", false],
  ["zhuanxu", "canon", "少昊与颛顼关系", "项目记录少昊在穷桑孺养颛顼，不自动写成父子关系。", "少昊与颛顼", "关系", "孺养", true],
  ["flood", "canon", "鲧禹治水链", "鲧窃息壤、祝融奉命杀鲧、鲧复生禹、禹布土定九州，四步不能被压缩成单一事件。", "治水", "事件链", "鲧—祝融—禹", true],
  ["protagonist", "character", "青梧的能力限制", "青梧能看见不同叙述的地图重影，但不能天然判断哪一个版本正确。", "青梧", "能力", "看见重影但不能裁决", true],
  ["wuxian", "character", "巫弦的守秘原则", "巫弦保存异名和口传路线，会隐去可能被滥用的复生仪式。", "巫弦", "原则", "保存异名并限制危险知识", false],
  ["mokan", "character", "墨堪的测绘转变", "墨堪起初只承认绳墨步数，常羊山后开始接受可重复的声音节拍也是路线证据。", "墨堪", "成长", "接受多种可验证证据", false],
  ["jingwei", "plot", "精卫海岸线是动态的", "精卫支线的选择会改变海岸线；不能把任一阶段的岸线写成永恒固定。", "精卫支线", "世界状态", "动态海岸", false],
  ["ending", "open-loop", "十八简终局选择", "终章需要作者决定发布唯一改编版，还是保留可追溯的并列版本。", "终章", "待决定", "唯一版或并列版", true],
  ["white-zhe", "rule", "不把白泽列为原典异兽", "白泽常见于后世神怪传统，但本案例不把它冒充《山海经》原典条目。", "白泽", "收录规则", "仅作后世旁注", true]
];

function buildAiMemories(now) {
  return memoryBlueprints.map(([key, category, title, content, subject, property, value, pinned], index) => ({
    id: `ai-memory-shanhai-${key}`, worldId: WORLD_ID, category, state: "confirmed", title, content,
    sourceContextId: key === "protagonist" ? `entity:${entityId("adapt-qingwu")}` : `world:${WORLD_ID}`,
    fact: { subject, property, value, temporalScope: "全项目" },
    sources: [{ id: `ai-memory-source-shanhai-${key}`, kind: "imported", contextId: `world:${WORLD_ID}`, contextLabel: "山海经原典内容全集 v2.0", writingSessionId: "", excerpt: content, capturedAt: now }],
    relations: [], tags: ["山海经", "作者确认", category], ignoredConflictIds: [], excludedContextIds: [],
    pinned, lastVerifiedAt: now, createdAt: now, updatedAt: now, order: index
  }));
}

function buildShanhaiCaseData(now, baseImageUrl = "", mapImageUrls = {}) {
  const planning = buildPlanningData(now, baseImageUrl, mapImageUrls);
  const timeline = buildTimeline(now);
  const story = buildStory(now);
  const manuscript = buildManuscript(now);
  const corpusData = buildShanhaiCorpusData(now, {
    worldId: WORLD_ID,
    classicCategoryId: categoryIds.classic,
    baseEntities: buildEntities(now),
    volumeEntityIds: Object.fromEntries(classicVolumes.map((volume) => [volume.key, volumeEntityId(volume.key)]))
  });
  return {
    world: {
      id: WORLD_ID, ownerId: "user-owner", name: "山海经 · 原典内容全集",
      description: `完整收录十八篇开放底本、${corpusData.corpus.stats.passageCount} 个原文段落、逐段校注与固定来源，并结合互动地图、关系、时间线、任务、原创长篇书稿和 AI 长期记忆。`,
      visibility: "private",
      wiki: {
        coverAssetId: "asset-shanhai-map-base",
        themeColor: "#28695d",
        navigationCategoryIds: [
          categoryIds.classic,
          categoryIds.creature,
          categoryIds.deity,
          categoryIds.location,
          categoryIds.nation,
          categoryIds.artifact,
          categoryIds.adaptation
        ],
        featuredEntityIds: classicVolumes.slice(0, 8).map((volume) => volumeEntityId(volume.key)),
        defaultMapId: MAIN_MAP_ID,
        publishedMapIds: [
          MAIN_MAP_ID,
          "map-shanhai-five-classics",
          "map-shanhai-sea-classics",
          ...classicVolumes.map((volume) => chapterMapId(volume.key))
        ],
        publishedTimelineTrackIds: [
          "timeline-track-shanhai-cosmos",
          "timeline-track-shanhai-heroes",
          "timeline-track-shanhai-flood",
          "timeline-track-shanhai-adaptation"
        ],
        publishedQuestIds: questBlueprints.map((quest) => `quest-shanhai-${quest.key}`)
      },
      createdAt: now, updatedAt: now
    },
    categories: [...buildCategories(now), ...corpusData.categories],
    templates: [buildRecordTemplate(now), ...corpusData.templates],
    entities: corpusData.entities,
    maps: planning.maps,
    mapLayers: planning.layers,
    mapMarkerGroups: planning.groups,
    mapMarkers: planning.markers,
    mapRoutes: planning.routes,
    timelineTracks: timeline.tracks,
    timelineEvents: timeline.events,
    quests: buildQuests(now),
    storyVariables: story.variables,
    storyScenes: story.scenes,
    storyTestPresets: story.presets,
    narrativeMilestones: buildMilestones(now),
    manuscriptBooks: manuscript.books,
    manuscriptVolumes: manuscript.volumes,
    manuscriptChapters: manuscript.chapters,
    manuscriptScenes: manuscript.scenes,
    manuscriptClues: manuscript.clues,
    manuscriptKnowledgeStates: manuscript.knowledge,
    relations: buildRelations(now),
    aiMemoryItems: buildAiMemories(now),
    corpusStats: corpusData.stats
  };
}

module.exports = {
  BOOK_ID,
  CASE_VERSION,
  MAIN_LAYER_ID,
  MAIN_MAP_ID,
  WORLD_ID,
  allCanonicalRecords,
  buildShanhaiCaseData,
  categoryIds,
  classicVolumes,
  entityId,
  illustratedRecords,
  sourceUrl,
  visualCreatures,
  volumeEntityId
};
