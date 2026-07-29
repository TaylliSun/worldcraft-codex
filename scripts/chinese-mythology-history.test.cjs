const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  ORIGINAL_ADAPTATION_NOTICE,
  WORLD_NAME,
  buildMythologyFoundation
} = require("./chinese-mythology-history-data.cjs");

const foundation = buildMythologyFoundation("2026-01-01T00:00:00.000Z");
const idsAreUnique = (items) => new Set(items.map((item) => item.id)).size === items.length;

assert.equal(foundation.world.name, WORLD_NAME);
assert.equal(foundation.world.visibility, "private");
assert.equal(foundation.categories.length, 54);
assert.equal(foundation.templates.length, 6);
assert.equal(foundation.entities.length, 8);
assert.equal(foundation.timelineTracks.length, 4);
assert.equal(foundation.timelineEvents.length, 0);
assert.equal(foundation.aiMemoryItems.length, 6);
assert.equal(idsAreUnique(foundation.categories), true);
assert.equal(idsAreUnique(foundation.templates), true);
assert.equal(idsAreUnique(foundation.entities), true);
assert.equal(idsAreUnique(foundation.timelineTracks), true);

const categoryIds = new Set(foundation.categories.map((item) => item.id));
assert.deepEqual(
  foundation.categories.filter((item) => item.parentId && !categoryIds.has(item.parentId)),
  []
);
assert.deepEqual(
  foundation.entities.filter((item) => !categoryIds.has(item.categoryId)),
  []
);
assert.equal(
  foundation.world.wiki.navigationCategoryIds.every((id) => categoryIds.has(id)),
  true
);
assert.equal(
  foundation.world.wiki.publishedTimelineTrackIds.every((id) => (
    foundation.timelineTracks.some((track) => track.id === id)
  )),
  true
);

for (const template of foundation.templates) {
  assert.equal(template.fields.length >= 8, true, `${template.name} fields`);
  assert.equal(new Set(template.fields.map((field) => field.key)).size, template.fields.length);
}

const publicText = foundation.entities.map((item) => `${item.summary}\n${item.content}`).join("\n");
assert.doesNotMatch(publicText, /(?:https?|ftp):\/\/|\bwww\./i);
assert.doesNotMatch(publicText, /古老而神秘|命运的齿轮|不为人知的秘密|最终揭开真相/u);
assert.equal(publicText.includes(ORIGINAL_ADAPTATION_NOTICE), true);
assert.equal(
  foundation.aiMemoryItems.some((item) => item.content === ORIGINAL_ADAPTATION_NOTICE),
  true
);
assert.equal(
  foundation.aiMemoryItems.every((item) => item.pinned && item.state === "confirmed"),
  true
);

const pageSource = fs.readFileSync(path.join(__dirname, "..", "app", "page.tsx"), "utf8");
for (const label of ["关系证据类型", "关系原典出处", "关系适用年代", "关系可信度"]) {
  assert.equal(pageSource.includes(`aria-label=\"${label}\"`), true, label);
}
for (const metadata of ["证据类型：", "原典出处：", "适用年代：", "可信度："]) {
  assert.equal(pageSource.includes(metadata), true, metadata);
}
assert.equal(pageSource.includes('| "textual-variant"'), true, "textual variant evidence type");
assert.equal(pageSource.includes('"textual-variant": "传本异文"'), true, "textual variant label");

console.log("Chinese mythology foundation checks passed: 54 categories, 6 templates, 4 timelines, 6 pinned AI rules.");
