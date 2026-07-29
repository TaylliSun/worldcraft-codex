const assert = require("node:assert/strict");

const corpus = require("../data/shanhai-corpus.zh-hans.json");
const {
  buildIndexArticle,
  buildPassageContent,
  chapterStoryAngles,
  classifyIndexKind,
  editorialTranslation,
  naturalizeIndexTitle,
  ORIGINAL_ADAPTATION_NOTICE,
  passageStorySeed,
  readingNotesForPassage
} = require("./shanhai-reader-text.cjs");

const passages = corpus.chapters.flatMap((chapter) => chapter.passages.map((passage) => ({
  ...passage,
  chapterTitle: chapter.title
})));

assert.equal(passages.length, 869);
assert.equal(Object.keys(chapterStoryAngles).length, 18);
assert.equal(new Set(Object.values(chapterStoryAngles)).size, 18);

const translations = passages.map((passage) => editorialTranslation(passage.plainLanguageText, passage));
for (const phrase of ["这里有", "名叫", "外形像", "可以把", "可以将"]) {
  assert.equal(translations.filter((translation) => translation.includes(phrase)).length, 0, `译文仍包含：${phrase}`);
}

const annotated = passages.filter((passage) => readingNotesForPassage(passage).length);
assert.ok(annotated.length >= 500, `项目自写读法覆盖不足：${annotated.length}`);

const classificationCases = [
  ["苗民", "西北海外，黑水之北，有人有翼，名曰苗民。", "邦国族群"],
  ["从渊", "南旁名曰从渊。", "水系"],
  ["大鵹", "有三青鸟，赤首黑目，一名曰大鵹。", "异兽生灵"],
  ["帝女之桑", "其上有桑，名曰帝女之桑。", "草木药物"],
  ["柏子高", "有人名曰柏子高。", "神祇人物"],
  ["大人之堂", "有大人之市，名曰大人之堂。", "山岳"]
];
for (const [name, originalText, expected] of classificationCases) {
  assert.equal(classifyIndexKind({
    name,
    currentKind: "其他名物",
    occurrences: [{ originalText }]
  }), expected, name);
}

assert.equal(naturalizeIndexTitle("蛇谷", "山岳"), "蛇谷");
assert.equal(naturalizeIndexTitle("天井", "水系"), "天井");
assert.equal(naturalizeIndexTitle("苗民", "邦国族群"), "苗民");

const firstPassage = passages[0];
const related = ["招摇山", "丽麂水", "祝馀", "狌狌"];
const passageContent = buildPassageContent(firstPassage, related);
assert.match(passageContent, /<h2>原文<\/h2>/u);
assert.match(passageContent, /<h2>今译<\/h2>/u);
assert.match(passageContent, /<h2>原创改编<\/h2>/u);
assert.ok(passageContent.includes(ORIGINAL_ADAPTATION_NOTICE));
assert.doesNotMatch(passageContent, /<h2>原文注释<\/h2>/u);
assert.doesNotMatch(passageStorySeed(firstPassage, related), /可以把|可以将|可用于|作为创作者/u);

const occurrence = {
  chapterTitle: firstPassage.chapterTitle,
  passage: firstPassage,
  displayTitle: "南山经 · 第1段 · 招摇山"
};
const indexArticle = buildIndexArticle({
  title: "狌狌",
  normalizedName: "狌狌",
  kindLabel: "异兽生灵",
  occurrences: [occurrence]
});
assert.match(indexArticle.content, /<h2>原创改编<\/h2>/u);
assert.ok(indexArticle.content.includes(ORIGINAL_ADAPTATION_NOTICE));
assert.match(indexArticle.content, /<h2>原文记载<\/h2>/u);
assert.ok(indexArticle.summary.length >= 20);

console.log(`Shanhai story editor checks passed: ${passages.length} passages, ${annotated.length} annotated.`);
