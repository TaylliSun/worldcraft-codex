const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const {
  createProjectPackage,
  extractProjectPackage,
  inspectProjectPackage
} = require("../electron/project-package.cjs");

const root = path.join(__dirname, "..", "validation", `project-package-pressure-${process.pid}`);
const sourceDir = path.join(root, "source-assets");
const targetDir = path.join(root, "target-assets");
const packagePath = path.join(root, "large-project.wcodex");
const physicalAssetCount = 20;
const logicalAssetCount = 1000;
const bytesPerAsset = 1024 * 1024;
const budgets = {
  createMs: 20000,
  inspectMs: 12000,
  extractMs: 20000,
  reuseMs: 12000
};
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

async function measure(action) {
  const started = performance.now();
  const result = await action();
  return { result, elapsedMs: Math.round(performance.now() - started) };
}

async function run() {
  fs.rmSync(root, { recursive: true, force: true });
  fs.mkdirSync(sourceDir, { recursive: true });
  for (let index = 0; index < physicalAssetCount; index += 1) {
    fs.writeFileSync(
      path.join(sourceDir, `resource-${index}.png`),
      Buffer.alloc(bytesPerAsset, index + 1)
    );
  }
  const assets = Array.from({ length: logicalAssetCount }, (_, index) => {
    const fileIndex = index % physicalAssetCount;
    return {
      id: `asset-${index}`,
      worldId: "world-pressure",
      name: `Logical resource ${index}`,
      storedName: `resource-${fileIndex}.png`,
      originalName: `resource-${fileIndex}.png`,
      mimeType: "image/png",
      size: bytesPerAsset,
      contentHash: ""
    };
  });
  const workspace = {
    worlds: [{ id: "world-pressure", name: "Large portable project" }],
    entities: Array.from({ length: 1000 }, (_, index) => ({
      id: `entity-${index}`,
      worldId: "world-pressure",
      title: `Entity ${index}`,
      content: `Portable content ${index}`
    })),
    assets,
    maps: Array.from({ length: physicalAssetCount }, (_, index) => ({
      id: `map-${index}`,
      worldId: "world-pressure",
      imageUrl: `worldcraft://asset/resource-${index}.png`
    }))
  };

  const created = await measure(() =>
    createProjectPackage({
      targetPath: packagePath,
      data: workspace,
      assetsDir: sourceDir,
      schemaVersion: 17,
      appVersion: "pressure-test"
    })
  );
  check(created.result.summary.complete, true, "large package is complete");
  check(created.result.summary.assetCount, logicalAssetCount, "all logical assets are represented");
  check(created.result.summary.uniqueFileCount, physicalAssetCount, "duplicate files are stored once");
  check(created.elapsedMs < budgets.createMs, true, "large package creation stays within budget");

  const inspected = await measure(() => inspectProjectPackage({ filePath: packagePath }));
  check(inspected.result.summary.assetCount, logicalAssetCount, "inspection retains logical asset count");
  check(inspected.result.data.entities.length, 1000, "inspection retains project objects");
  check(inspected.elapsedMs < budgets.inspectMs, true, "full package verification stays within budget");

  const extracted = await measure(() =>
    extractProjectPackage({ filePath: packagePath, assetsDir: targetDir })
  );
  check(extracted.result.summary.importedFileCount, physicalAssetCount, "only unique files are installed");
  check(extracted.result.summary.reusedFileCount, 0, "first extraction starts clean");
  check(extracted.elapsedMs < budgets.extractMs, true, "clean extraction stays within budget");
  check(
    fs.readdirSync(targetDir).filter((name) => !name.startsWith(".")).length,
    physicalAssetCount,
    "target directory contains only unique resources"
  );
  check(
    new Set(extracted.result.data.assets.map((asset) => asset.storedName)).size,
    physicalAssetCount,
    "logical assets share content-addressed names"
  );

  const reused = await measure(() =>
    extractProjectPackage({ filePath: packagePath, assetsDir: targetDir })
  );
  check(reused.result.summary.importedFileCount, 0, "second extraction performs no copies");
  check(reused.result.summary.reusedFileCount, physicalAssetCount, "second extraction reuses every file");
  check(reused.elapsedMs < budgets.reuseMs, true, "deduplicated extraction stays within budget");

  console.log(JSON.stringify({
    assertions,
    dataset: {
      logicalAssets: logicalAssetCount,
      physicalAssets: physicalAssetCount,
      sourceBytes: physicalAssetCount * bytesPerAsset
    },
    packageBytes: fs.statSync(packagePath).size,
    timings: {
      createMs: created.elapsedMs,
      inspectMs: inspected.elapsedMs,
      extractMs: extracted.elapsedMs,
      reuseMs: reused.elapsedMs
    },
    budgets
  }));
  console.log(`Project package pressure checks passed: ${assertions} assertions.`);
}

run()
  .finally(() => fs.rmSync(root, { recursive: true, force: true }))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
