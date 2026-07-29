const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

require.extensions[".ts"] = (module, filePath) => {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true
    }
  }).outputText;
  module._compile(output, filePath);
};

const lifecycle = require(path.join(__dirname, "..", "app", "world-lifecycle.ts"));
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

const workspace = {
  worlds: [
    { id: "world-a", name: "甲世界" },
    { id: "world-b", name: "乙世界" }
  ],
  maps: [
    { id: "map-a", worldId: "world-a" },
    { id: "map-b", worldId: "world-b" }
  ]
};

for (const collection of lifecycle.worldIdCollections) {
  workspace[collection] = [
    { id: `${collection}-a`, worldId: "world-a" },
    { id: `${collection}-b`, worldId: "world-b" }
  ];
}
for (const collection of lifecycle.mapIdCollections) {
  workspace[collection] = [
    { id: `${collection}-a`, mapId: "map-a" },
    { id: `${collection}-b`, mapId: "map-b" }
  ];
}

const original = structuredClone(workspace);
const isolated = lifecycle.isolateWorldWorkspace(workspace, "world-a");
check(isolated.worlds.map((item) => item.id), ["world-a"], "isolation keeps the selected world");
check(isolated.maps.map((item) => item.id), ["map-a"], "isolation keeps the selected world's maps");
for (const collection of lifecycle.worldIdCollections) {
  check(
    isolated[collection].map((item) => item.worldId),
    ["world-a"],
    `${collection} is isolated by worldId`
  );
}
for (const collection of lifecycle.mapIdCollections) {
  check(
    isolated[collection].map((item) => item.mapId),
    ["map-a"],
    `${collection} follows the selected world's map ids`
  );
}

const removed = lifecycle.removeWorldFromWorkspace(workspace, "world-a");
check(removed.worlds.map((item) => item.id), ["world-b"], "removal keeps other worlds");
check(removed.maps.map((item) => item.id), ["map-b"], "removal keeps other worlds' maps");
for (const collection of lifecycle.worldIdCollections) {
  check(
    removed[collection].map((item) => item.worldId),
    ["world-b"],
    `${collection} removes only the target world`
  );
}
for (const collection of lifecycle.mapIdCollections) {
  check(
    removed[collection].map((item) => item.mapId),
    ["map-b"],
    `${collection} removes only target map data`
  );
}

check(workspace, original, "world lifecycle operations do not mutate their source");
assert.throws(
  () => lifecycle.assertWorldLifecycleCoverage({ ...workspace, futureCollection: [] }),
  /futureCollection/,
  "new workspace collections must be added to lifecycle coverage"
);
assertions += 1;

console.log(`World lifecycle checks passed: ${assertions} assertions.`);
