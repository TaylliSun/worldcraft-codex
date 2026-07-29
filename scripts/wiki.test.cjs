const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

require.extensions[".ts"] = (module, filePath) => {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText;
  module._compile(output, filePath);
};

const wiki = require(path.join(__dirname, "..", "app", "wiki.ts"));
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

const settings = wiki.normalizeWorldWikiSettings({
  themeColor: "not-a-color",
  navigationCategoryIds: ["root", "root", ""],
  featuredEntityIds: ["public"],
  publishedMapIds: ["map-a", "map-a"]
});
check(settings.themeColor, "#176b5b", "invalid theme falls back safely");
check(settings.navigationCategoryIds, ["root"], "category ids are normalized");
check(settings.publishedMapIds, ["map-a"], "publication ids are deduplicated");
check(settings.publishedQuestIds, [], "new resource classes default to unpublished");

check(wiki.canViewWikiWorld("private", "author"), true, "author can inspect private world");
check(wiki.canViewWikiWorld("private", "member"), false, "member cannot inspect private world");
check(wiki.canViewWikiWorld("shared", "member"), true, "member can inspect shared world");
check(wiki.canViewWikiWorld("shared", "public"), false, "visitor cannot inspect shared world");
check(wiki.canViewWikiWorld("public", "public"), true, "visitor can inspect public world");
check(wiki.canViewWikiEntity("secret", "member"), false, "secret entity is author only");
check(wiki.canViewWikiEntity("shared", "member"), true, "shared entity is visible to members");
check(wiki.canViewWikiEntity("shared", "public"), false, "shared entity is hidden from visitors");
check(wiki.isWikiResourceVisible("map-a", [], "author"), true, "author sees unpublished resources");
check(wiki.isWikiResourceVisible("map-a", [], "public"), false, "visitor cannot see unpublished resources");
check(wiki.isWikiResourceVisible("map-a", ["map-a"], "public"), true, "visitor sees explicitly published resources");

const categories = [
  { id: "root", parentId: "", title: "山经", order: 0 },
  { id: "volume", parentId: "root", title: "南山经", order: 0 },
  { id: "empty", parentId: "", title: "空目录", order: 1 }
];
const entities = [
  {
    id: "public",
    title: "青丘之山",
    summary: "九尾狐所居",
    content: "<p>有兽焉</p>",
    tags: ["南山经", "异兽"],
    visibility: "public",
    categoryId: "volume",
    updatedAt: "2026-07-17T01:00:00.000Z"
  },
  {
    id: "shared",
    title: "成员资料",
    summary: "只给成员",
    content: "",
    tags: [],
    visibility: "shared",
    categoryId: "volume",
    updatedAt: "2026-07-17T02:00:00.000Z"
  },
  {
    id: "secret",
    title: "天机档案",
    summary: "不可外泄",
    content: "",
    tags: ["秘密"],
    visibility: "secret",
    categoryId: "volume",
    updatedAt: "2026-07-17T03:00:00.000Z"
  }
];
const publicEntities = wiki.getVisibleWikiEntities(entities, "public");
check(publicEntities.map((item) => item.id), ["public"], "visitor entity list is filtered before rendering");
const memberEntities = wiki.getVisibleWikiEntities(entities, "member");
check(memberEntities.map((item) => item.id), ["public", "shared"], "member list includes shared content only");
const counts = wiki.buildWikiCategoryCounts(categories, publicEntities);
check(counts.get("root"), 1, "parent category receives descendant article count");
check(counts.get("volume"), 1, "leaf category receives direct article count");
check(
  wiki.getWikiNavigationCategories(categories, counts, []).map((item) => item.id),
  ["root"],
  "empty directories are not exposed in automatic navigation"
);
check(
  wiki.searchWikiEntities(publicEntities, "九尾狐").map((item) => item.id),
  ["public"],
  "search includes visible summaries"
);
check(
  wiki.searchWikiEntities(publicEntities, "public").map((item) => item.id),
  ["public"],
  "stable ids are searchable"
);
check(wiki.searchWikiEntities(publicEntities, "天机").length, 0, "search never indexes hidden entities");

const referenceIndex = {
  problems: [],
  references: [
    {
      id: "ref-visible",
      worldId: "world-a",
      source: { kind: "entity", id: "public" },
      sourceLabel: "青丘之山",
      target: { kind: "entity", id: "shared" },
      targetLabel: "成员资料",
      role: "mention",
      anchor: { field: "content", path: "content", start: 0, end: 4, excerpt: "成员资料" }
    },
    {
      id: "ref-secret",
      worldId: "world-a",
      source: { kind: "entity", id: "public" },
      sourceLabel: "青丘之山",
      target: { kind: "entity", id: "secret" },
      targetLabel: "天机档案",
      role: "mention",
      anchor: { field: "content", path: "content", start: 5, end: 9, excerpt: "天机档案" }
    }
  ]
};
check(
  wiki.getWikiRelatedEntityIds({
    entity: entities[0],
    visibleEntities: memberEntities,
    relations: [],
    referenceIndex
  }),
  ["shared"],
  "related article calculation cannot return a hidden target"
);

const richText = [
  "<h2>公开小节</h2>",
  "<p onclick=\"danger()\">公开内容 ",
  '<span data-project-reference-kind="entity" data-project-reference-id="public">[[青丘之山]]</span>',
  " 与 ",
  '<span data-project-reference-kind="entity" data-project-reference-id="secret">[[天机档案]]</span>',
  "，另见 [[天机档案]]。</p>",
  '<section data-secret-block="true"><p>秘密正文不可泄漏</p></section>',
  "<script>danger()</script>"
].join("");
const publicRichText = wiki.sanitizeWikiRichText(richText, {
  audience: "public",
  visibleEntities: [entities[0]],
  restrictedEntityTitles: [entities[1].title, entities[2].title],
  visibleReferenceKeys: new Set(["entity:public"])
});
assert.match(publicRichText, /data-wiki-reference-id="public"/);
assert.doesNotMatch(publicRichText, /秘密正文不可泄漏|天机档案|danger\(\)|onclick/);
assert.match(publicRichText, /受限内容/);
assertions += 3;

const authorRichText = wiki.sanitizeWikiRichText(richText, {
  audience: "author",
  visibleEntities: entities,
  restrictedEntityTitles: [],
  visibleReferenceKeys: new Set()
});
assert.match(authorRichText, /秘密正文不可泄漏/);
assert.match(authorRichText, /data-wiki-reference-id="secret"/);
assert.doesNotMatch(authorRichText, /<script|onclick/);
assertions += 3;

const largeWorld = Array.from({ length: 2200 }, (_, index) => ({
  id: `entry-${index}`,
  title: `山海经原典 ${index}`,
  summary: index === 1932 ? "性能检索目标 九尾" : "原典段落",
  content: `<p>正文 ${index}</p>`,
  tags: [index % 2 ? "异兽" : "山川"],
  visibility: "public",
  categoryId: "volume",
  updatedAt: "2026-07-17T00:00:00.000Z"
}));
const startedAt = performance.now();
const largeResults = wiki.searchWikiEntities(largeWorld, "性能检索目标", 80);
const duration = performance.now() - startedAt;
check(largeResults.map((item) => item.id), ["entry-1932"], "large world search remains correct");
assert.ok(duration < 1500, `2200-entry search exceeded budget: ${duration.toFixed(1)}ms`);
assertions += 1;

console.log(`Wiki model tests passed: ${assertions} assertions, large search ${duration.toFixed(1)}ms.`);
