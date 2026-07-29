const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outputRoot = path.join(root, "out");
const indexPath = path.join(outputRoot, "index.html");
const loadableManifestPath = path.join(
  root,
  ".next",
  "server",
  "app",
  "page",
  "react-loadable-manifest.json"
);
const pageSourcePath = path.join(root, "app", "page.tsx");
const inlineAiSourcePath = path.join(root, "app", "components", "InlineAiAssistant.tsx");

assert.equal(
  fs.existsSync(indexPath),
  true,
  "production output is required; run npm run build before the bundle budget"
);
assert.equal(fs.existsSync(loadableManifestPath), true, "Next loadable manifest exists");

const budgets = {
  initialJavaScriptBytes: 2 * 1024 * 1024,
  largestInitialChunkBytes: 600 * 1024,
  initialCssBytes: 500 * 1024,
  minimumLazyWorkspaces: 9,
  largestLazyChunkBytes: 300 * 1024
};

const html = fs.readFileSync(indexPath, "utf8");
const source = fs.readFileSync(pageSourcePath, "utf8");
const inlineAiSource = fs.readFileSync(inlineAiSourcePath, "utf8");
const loadableManifest = JSON.parse(fs.readFileSync(loadableManifestPath, "utf8"));

function uniqueMatches(pattern) {
  return [...new Set([...html.matchAll(pattern)].map((match) => match[1]))];
}

function outputAssetPath(relativeUrl) {
  return path.join(outputRoot, relativeUrl.replace(/^\//, "").replaceAll("/", path.sep));
}

function assetBytes(relativeUrls) {
  return relativeUrls.reduce((total, relativeUrl) => {
    const filePath = outputAssetPath(relativeUrl);
    assert.equal(fs.existsSync(filePath), true, `built asset exists: ${relativeUrl}`);
    return total + fs.statSync(filePath).size;
  }, 0);
}

const initialJavaScript = uniqueMatches(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g);
const initialCss = uniqueMatches(/href="(\/_next\/static\/chunks\/[^"]+\.css)"/g);
const initialJavaScriptBytes = assetBytes(initialJavaScript);
const initialCssBytes = assetBytes(initialCss);
const largestInitialChunkBytes = Math.max(
  0,
  ...initialJavaScript.map((relativeUrl) => fs.statSync(outputAssetPath(relativeUrl)).size)
);

assert.equal(
  initialJavaScriptBytes <= budgets.initialJavaScriptBytes,
  true,
  `initial JavaScript stays under ${budgets.initialJavaScriptBytes} bytes`
);
assert.equal(
  largestInitialChunkBytes <= budgets.largestInitialChunkBytes,
  true,
  `largest initial chunk stays under ${budgets.largestInitialChunkBytes} bytes`
);
assert.equal(
  initialCssBytes <= budgets.initialCssBytes,
  true,
  `initial CSS stays under ${budgets.initialCssBytes} bytes`
);

const lazyEntries = Object.values(loadableManifest);
const initialFileNames = new Set(initialJavaScript.map((url) => url.split("/").at(-1)));
assert.equal(
  lazyEntries.length >= budgets.minimumLazyWorkspaces,
  true,
  `at least ${budgets.minimumLazyWorkspaces} workspaces are lazy loaded`
);

const lazyJavaScript = [...new Set(lazyEntries.flatMap((entry) => entry.files)
  .filter((file) => file.endsWith(".js"))
  .map((file) => file.split("/").at(-1)))];
for (const entry of lazyEntries) {
  const deferredFiles = entry.files
    .filter((file) => file.endsWith(".js"))
    .map((file) => file.split("/").at(-1))
    .filter((file) => !initialFileNames.has(file));
  assert.equal(deferredFiles.length > 0, true, `loadable module ${entry.id} has a deferred chunk`);
}

const largestLazyChunkBytes = Math.max(
  0,
  ...lazyJavaScript.map((file) => fs.statSync(path.join(outputRoot, "_next", "static", "chunks", file)).size)
);
assert.equal(
  largestLazyChunkBytes <= budgets.largestLazyChunkBytes,
  true,
  `largest lazy chunk stays under ${budgets.largestLazyChunkBytes} bytes`
);

const workspaceModules = [
  "StoryWorkspace",
  "StoryTestWorkspace",
  "MapWorkspace",
  "TimelineWorkspace",
  "WikiWorkspace",
  "ConsistencyWorkspace",
  "TemplateWorkspace",
  "AiWorkspace",
  "NarrativeProductionWorkspace"
];
for (const moduleName of workspaceModules) {
  assert.equal(
    source.includes(`import("./components/${moduleName}")`),
    true,
    `${moduleName} remains an on-demand workspace`
  );
}

const onDemandComputations = [
  [source, 'if (!globalSearchOpen) return [];', "global search index"],
  [source, 'if (activeTab !== "health") return [];', "project health scan"],
  [source, 'activeTab === "ai" ? createAiContexts() : []', "AI workspace contexts"],
  [inlineAiSource, 'getSources && open ? getSources() : []', "inline AI contexts"]
];
for (const [fileSource, marker, label] of onDemandComputations) {
  assert.equal(fileSource.includes(marker), true, `${label} remains on demand`);
}

console.log(JSON.stringify({
  budgets,
  measured: {
    initialJavaScriptBytes,
    largestInitialChunkBytes,
    initialCssBytes,
    lazyWorkspaceCount: lazyEntries.length,
    lazyJavaScriptFiles: lazyJavaScript.length,
    largestLazyChunkBytes
  }
}));
console.log(`Frontend bundle checks passed: ${workspaceModules.length} workspaces and ${onDemandComputations.length} expensive computations remain on demand.`);
