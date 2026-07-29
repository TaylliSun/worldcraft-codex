const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function loadModule(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", output)(require, module, module.exports);
  return module.exports;
}

const manuscript = loadModule(path.join(__dirname, "..", "app", "manuscript.ts"));
let assertions = 0;

function check(actual, expected, label) {
  assert.deepEqual(actual, expected, label);
  assertions += 1;
}

const migrated = manuscript.migrateLegacyManuscript(
  ["world-a"],
  [
    {
      id: "production-only",
      worldId: "world-a",
      title: "完成任务图",
      act: "第一幕",
      status: "drafting",
      order: 0
    },
    {
      id: "legacy-one",
      worldId: "world-a",
      title: "第一章 风雪来信",
      summary: "艾琳抵达雾堡。",
      manuscriptBody: "<p>艾琳走进风雪。</p><p>The gate closed.</p>",
      developerNotes: "保留低温感",
      act: "第一卷",
      status: "review",
      order: 1,
      linkedSceneIds: ["scene-a"],
      createdAt: "2026-07-10T00:00:00.000Z",
      updatedAt: "2026-07-11T00:00:00.000Z"
    },
    {
      id: "legacy-two",
      worldId: "world-a",
      title: "第二章",
      manuscriptBody: "<p>秘密浮出水面。</p>",
      act: "第一卷",
      status: "done",
      order: 2
    }
  ],
  {},
  "2026-07-16T00:00:00.000Z"
);

check(migrated.manuscriptBooks.length, 1, "legacy prose creates one book");
check(migrated.manuscriptVolumes.map((item) => item.title), ["第一卷"], "acts become volumes");
check(migrated.manuscriptChapters.length, 2, "production-only milestones stay out of manuscript");
check(
  migrated.manuscriptChapters[0].linkedNarrativeMilestoneId,
  "legacy-one",
  "migration retains a stable link to its legacy milestone"
);
check(migrated.manuscriptChapters[0].status, "revision", "legacy review status maps to revision");
check(migrated.manuscriptChapters[1].status, "final", "legacy done status maps to final");
check(
  manuscript.countManuscriptWords(migrated.manuscriptChapters[0].body),
  9,
  "word count combines CJK characters and Latin words"
);

const normalizedAgain = manuscript.normalizeManuscriptWorkspace(
  migrated,
  ["world-a"],
  [{ id: "legacy-one", worldId: "world-a", title: "第一章", manuscriptBody: "duplicate" }]
);
check(normalizedAgain.manuscriptChapters.length, 2, "normalization does not duplicate migrated chapters");
check(normalizedAgain.manuscriptBooks[0].dailyWordGoal, 1000, "legacy books receive a daily writing goal");
check(normalizedAgain.manuscriptBooks[0].writingDays, [], "legacy books receive an empty writing history");

const goalDisabled = manuscript.normalizeManuscriptBook(
  { ...normalizedAgain.manuscriptBooks[0], dailyWordGoal: 0 },
  "world-a",
  0
);
check(goalDisabled.dailyWordGoal, 0, "a zero daily goal remains disabled after normalization");

const reordered = manuscript.moveManuscriptUnit(
  migrated.manuscriptChapters,
  migrated.manuscriptChapters[1].id,
  migrated.manuscriptChapters[0].id
);
check(reordered.map((item) => item.linkedNarrativeMilestoneId), ["legacy-two", "legacy-one"], "drag reorder moves before target");
check(reordered.map((item) => item.order), [0, 1], "drag reorder resequences order values");

const firstAnnotation = manuscript.normalizeManuscriptAnnotation({
  id: "annotation-first",
  kind: "comment",
  quote: "艾琳走进风雪。",
  comment: "保留开场冷意"
});
const secondAnnotation = manuscript.normalizeManuscriptAnnotation({
  id: "annotation-second",
  kind: "suggestion",
  quote: "The gate closed.",
  comment: "强化关门声",
  replacement: "The iron gate thundered shut.",
  replies: [{ id: "reply-a", body: "同意", createdAt: "2026-07-16T00:00:00.000Z" }]
});
const globalAnnotation = manuscript.normalizeManuscriptAnnotation({
  id: "annotation-global",
  comment: "检查整章节奏"
});
check(secondAnnotation.kind, "suggestion", "suggestion annotations retain their kind");
check(secondAnnotation.replies.length, 1, "annotation replies are normalized");
const split = manuscript.splitManuscriptChapter(
  { ...migrated.manuscriptChapters[0], annotations: [firstAnnotation, secondAnnotation, globalAnnotation] },
  "第一章 下",
  6,
  "2026-07-16T01:00:00.000Z"
);
check(manuscript.manuscriptPlainText(split.first.body), "艾琳走进风雪。", "split keeps the first rich-text block");
check(manuscript.manuscriptPlainText(split.second.body), "The gate closed.", "split moves remaining blocks to a new chapter");
check(split.second.linkedNarrativeMilestoneId, "", "new half is independent from legacy production milestone");
check(split.first.annotations.map((item) => item.id), ["annotation-first", "annotation-global"], "split keeps matching and chapter-wide annotations on the first half");
check(split.second.annotations.map((item) => item.id), ["annotation-second"], "split moves matching annotations to the second half");
const merged = manuscript.mergeManuscriptChapters(split.first, split.second);
check(manuscript.manuscriptPlainText(merged.body).includes("The gate closed."), true, "merge restores the second body");
check(merged.annotations.length, 3, "merge restores annotations from both halves");

const replacedQuote = manuscript.replaceManuscriptAnnotationQuote(
  "<p>旧句仍在这里。</p>",
  "旧句",
  "新句"
);
check(replacedQuote.replaced, true, "annotation suggestions replace an exact quote");
check(replacedQuote.body, "<p>新句仍在这里。</p>", "annotation replacement preserves surrounding content");
check(
  manuscript.replaceManuscriptAnnotationQuote("作者已经改写", "旧句", "新句").replaced,
  false,
  "stale annotation quotes are not applied"
);

const bookId = migrated.manuscriptBooks[0].id;
const chapterOne = migrated.manuscriptChapters[0];
const chapterTwo = migrated.manuscriptChapters[1];
const scene = manuscript.createManuscriptScene(chapterOne, 0, "门厅对话");
scene.body = "<p>额外场景。</p>";
scene.timelineStart = "12";
scene.timelineEnd = "10";
const consistencyData = {
  ...migrated,
  manuscriptScenes: [scene],
  manuscriptClues: [
    {
      id: "clue-a",
      worldId: "world-a",
      bookId,
      title: "星银剑",
      description: "剑的去向",
      status: "resolved",
      setupUnitKind: "chapter",
      setupUnitId: chapterTwo.id,
      payoffUnitKind: "chapter",
      payoffUnitId: chapterOne.id,
      relatedEntityIds: [],
      authorConfirmed: true,
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z"
    }
  ],
  manuscriptKnowledgeStates: [
    {
      id: "knowledge-known",
      worldId: "world-a",
      bookId,
      characterId: "entity-a",
      fact: "黑塔掌握星银剑",
      level: "known",
      unitKind: "chapter",
      unitId: chapterOne.id,
      authorConfirmed: true,
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z"
    },
    {
      id: "knowledge-unknown",
      worldId: "world-a",
      bookId,
      characterId: "entity-a",
      fact: "黑塔掌握星银剑",
      level: "unknown",
      unitKind: "chapter",
      unitId: chapterTwo.id,
      authorConfirmed: true,
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z"
    }
  ]
};
const issues = manuscript.validateManuscriptConsistency(consistencyData, bookId);
check(new Set(issues.map((issue) => issue.ruleId)), new Set(["MS-002", "MS-003", "MS-004"]), "manuscript scan covers clue order, knowledge regression, and local time");
check(issues.find((issue) => issue.ruleId === "MS-003")?.severity, "critical", "confirmed knowledge conflict is critical");

consistencyData.manuscriptClues[0].status = "open";
const context = manuscript.buildManuscriptContext(consistencyData, bookId, {
  kind: "chapter",
  id: chapterOne.id
});
check(context.includes("【全书】主书稿"), true, "AI context starts with the book summary layer");
check(context.includes("【卷】第一卷"), true, "AI context includes volume summary layer");
check(context.includes("【当前章节正文】"), true, "AI context includes target chapter prose");
check(context.includes("星银剑"), true, "AI context includes unresolved clue ledger");
check(context.includes("黑塔掌握星银剑"), true, "AI context prioritizes author-confirmed knowledge");
check(context.includes("【场景索引】"), true, "AI context includes scene-level summaries");
check(
  context.indexOf("【作者确认的事实，优先级最高】") < context.indexOf("【当前章节正文】"),
  true,
  "author-confirmed facts are retained before long target prose"
);
const sceneContext = manuscript.buildManuscriptContext(consistencyData, bookId, {
  kind: "scene",
  id: consistencyData.manuscriptScenes[0].id
});
check(sceneContext.includes("【当前场景】"), true, "AI context can target a manuscript scene precisely");

const statistics = manuscript.getManuscriptStatistics(consistencyData, bookId);
check(statistics.chapterCount, 2, "statistics count chapters");
check(statistics.sceneCount, 1, "statistics count scenes");
check(statistics.statusCounts.final, 1, "statistics group chapter status");
check(
  statistics.totalWords,
  migrated.manuscriptChapters.reduce((sum, chapter) => sum + manuscript.countManuscriptWords(chapter.body), 0) + manuscript.countManuscriptWords(scene.body),
  "statistics include scene prose as well as chapter prose"
);

let writingBook = manuscript.normalizeManuscriptBook(
  { ...migrated.manuscriptBooks[0], dailyWordGoal: 500, writingDays: [] },
  "world-a",
  0
);
writingBook = manuscript.recordManuscriptWritingDay(
  writingBook,
  1000,
  1200,
  "2026-07-15",
  "2026-07-15T09:00:00.000Z"
);
writingBook = manuscript.recordManuscriptWritingDay(
  writingBook,
  1200,
  1550,
  "2026-07-15",
  "2026-07-15T18:00:00.000Z"
);
writingBook = manuscript.recordManuscriptWritingDay(
  writingBook,
  1550,
  1800,
  "2026-07-16",
  "2026-07-16T12:00:00.000Z"
);
check(writingBook.writingDays[0].startWordCount, 1000, "same-day edits retain the first word-count baseline");
check(writingBook.writingDays[0].endWordCount, 1550, "same-day edits retain the latest word count");
const rhythm = manuscript.getManuscriptWritingRhythm(writingBook, new Date(2026, 6, 16, 12));
check(rhythm.todayWords, 250, "writing rhythm reports today's net word gain");
check(rhythm.streak, 2, "writing rhythm reports consecutive productive days");
check(rhythm.goalPercent, 50, "writing rhythm compares today's gain with the daily goal");

console.log(`Manuscript domain checks passed: ${assertions} assertions.`);
