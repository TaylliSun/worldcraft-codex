const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function loadTypeScriptModule(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const module = { exports: {} };
  new Function("module", "exports", "require", output)(module, module.exports, require);
  return module.exports;
}

const tree = loadTypeScriptModule(path.join(__dirname, "..", "app", "codex-tree.ts"));
const timestamp = "2026-07-13T10:00:00.000Z";
const worldId = "world-a";

const defaults = tree.createDefaultCodexCategories(worldId, timestamp);
assert.equal(defaults.length, 6);
assert.deepEqual(
  defaults.map((category) => category.id),
  ["character", "location", "faction", "event", "item", "note"].map(
    (type) => `category:${worldId}:${type}`
  )
);

const legacyEntities = [
  { id: "entity-a", worldId, type: "character", order: 99 },
  { id: "entity-b", worldId, type: "character" },
  { id: "entity-c", worldId, type: "location", categoryId: "missing" }
];
const migrated = tree.normalizeCodexHierarchy(undefined, legacyEntities, [worldId], timestamp);
assert.equal(migrated.categories.length, 6);
assert.equal(migrated.entities[0].categoryId, `category:${worldId}:character`);
assert.equal(migrated.entities[1].categoryId, `category:${worldId}:character`);
assert.equal(migrated.entities[2].categoryId, `category:${worldId}:location`);
assert.deepEqual(
  migrated.entities
    .filter((entity) => entity.categoryId.endsWith(":character"))
    .map((entity) => entity.order),
  [1, 0]
);

const nested = [
  tree.createCodexCategory(worldId, "root", "Root", "", 0, timestamp),
  tree.createCodexCategory(worldId, "child", "Child", "root", 0, timestamp),
  tree.createCodexCategory(worldId, "grandchild", "Grandchild", "child", 0, timestamp)
];
assert.deepEqual(
  tree.getCodexCategoryPath(nested, "grandchild").map((category) => category.id),
  ["root", "child", "grandchild"]
);
assert.deepEqual([...tree.getCodexCategoryDescendantIds(nested, "root")], ["child", "grandchild"]);
assert.equal(tree.moveCodexCategory(nested, "root", "grandchild"), nested);

const nestedCounts = tree.countCodexEntitiesByCategory(nested, [
  { id: "entity-root", categoryId: "root" },
  { id: "entity-child", categoryId: "child" },
  { id: "entity-grandchild", categoryId: "grandchild" },
  { id: "entity-unfiled" }
]);
assert.equal(nestedCounts.get("root"), 3);
assert.equal(nestedCounts.get("child"), 2);
assert.equal(nestedCounts.get("grandchild"), 1);

const filteredNestedCounts = tree.countCodexEntitiesByCategory(
  nested,
  [
    { id: "entity-child", categoryId: "child" },
    { id: "entity-grandchild", categoryId: "grandchild" }
  ],
  (entity) => entity.id === "entity-grandchild"
);
assert.equal(filteredNestedCounts.get("root"), 1);
assert.equal(filteredNestedCounts.get("child"), 1);
assert.equal(filteredNestedCounts.get("grandchild"), 1);

const movedCategory = tree.moveCodexCategory(nested, "grandchild", "", 0, timestamp);
assert.equal(movedCategory.find((category) => category.id === "grandchild").parentId, "");
assert.equal(movedCategory.find((category) => category.id === "grandchild").order, 0);

const rootSiblings = [
  tree.createCodexCategory(worldId, "sibling-a", "A", "", 0, timestamp),
  tree.createCodexCategory(worldId, "sibling-b", "B", "", 1, timestamp),
  tree.createCodexCategory(worldId, "sibling-c", "C", "", 2, timestamp)
];
assert.deepEqual(
  tree
    .moveCodexCategory(rootSiblings, "sibling-a", "", 2, timestamp)
    .sort((left, right) => left.order - right.order)
    .map((category) => category.id),
  ["sibling-b", "sibling-a", "sibling-c"]
);

const reorderedEntities = tree.moveCodexEntity(
  migrated.entities,
  "entity-a",
  `category:${worldId}:character`,
  0
);
assert.deepEqual(
  reorderedEntities
    .filter((entity) => entity.categoryId.endsWith(":character"))
    .sort((left, right) => left.order - right.order)
    .map((entity) => entity.id),
  ["entity-a", "entity-b"]
);

const removed = tree.removeCodexCategory(
  nested,
  [{ id: "entity-nested", worldId, type: "note", categoryId: "child", order: 0 }],
  "child",
  timestamp
);
assert.equal(removed.categories.find((category) => category.id === "grandchild").parentId, "root");
assert.equal(removed.entities[0].categoryId, "root");

const broken = tree.normalizeCodexHierarchy(
  [
    { id: "cycle-a", worldId, parentId: "cycle-b", title: "A" },
    { id: "cycle-b", worldId, parentId: "cycle-a", title: "B" }
  ],
  [],
  [worldId],
  timestamp
);
assert.equal(broken.categories.some((category) => !category.parentId), true);
assert.deepEqual(tree.validateCodexHierarchy(broken.categories, broken.entities, worldId), []);

const flattened = tree.flattenCodexCategories(nested);
assert.deepEqual(flattened.map((row) => [row.category.id, row.depth]), [
  ["root", 0],
  ["child", 1],
  ["grandchild", 2]
]);

console.log("Codex hierarchy checks passed.");
