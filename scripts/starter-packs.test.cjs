const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

require.extensions[".ts"] = (module, filePath) => {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  module._compile(output, filePath);
};

const { starterPacks, getStarterPack } = require(path.join(__dirname, "..", "app", "starter-packs.ts"));
const expectedIds = ["game-narrative", "rpg-campaign", "visual-novel", "open-world"];

assert.deepEqual(starterPacks.map((pack) => pack.id), expectedIds);
assert.equal(new Set(starterPacks.map((pack) => pack.initialName)).size, 4);

for (const pack of starterPacks) {
  assert.equal(pack.entities.length >= 2, true, `${pack.id} seeds useful entities`);
  assert.equal(pack.quest.steps.length >= 2, true, `${pack.id} seeds an actionable quest`);
  const entityKeys = new Set(pack.entities.map((entity) => entity.key));
  assert.equal(entityKeys.size, pack.entities.length, `${pack.id} entity keys are unique`);
  assert.equal(pack.quest.relatedEntityKeys.every((key) => entityKeys.has(key)), true, `${pack.id} quest references resolve`);
  assert.equal(entityKeys.has(pack.scene.speakerEntityKey), true, `${pack.id} scene speaker resolves`);
  assert.equal(/^[a-z][a-z0-9_.]+$/.test(pack.variable.key), true, `${pack.id} variable key is stable`);
}

assert.equal(getStarterPack("visual-novel").label, "视觉小说");
assert.equal(getStarterPack("missing").id, "game-narrative");

console.log("Starter pack checks passed: 27 assertions across 4 project types.");
