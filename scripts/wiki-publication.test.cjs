const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { exportOfflineWiki, sanitizeRichText } = require(path.join(__dirname, "..", "electron", "wiki-publication.cjs"));

let assertions = 0;
function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

async function run() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "worldcraft-offline-wiki-"));
  const assetsDir = path.join(root, "assets-source");
  const outputDir = path.join(root, "published");
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(path.join(assetsDir, "hero.png"), Buffer.from("89504e470d0a1a0a", "hex"));
  try {
    const sanitized = sanitizeRichText('<p onclick="steal()">正文 <a href="https://evil.example">外链</a></p><script>alert(1)</script><img src=x onerror=alert(2)>');
    check(sanitized.includes("onclick"), false, "event handlers are removed from rich text");
    check(sanitized.includes("https://evil.example"), false, "external links are removed from rich text");
    check(sanitized.includes("alert(1)"), false, "script bodies are removed from rich text");
    check(sanitized.includes("<img"), false, "unapproved embedded images are removed from rich text");

    const result = await exportOfflineWiki({
      assetsDir,
      outputDir,
      publication: {
        schemaVersion: 1,
        exportedAt: "2026-07-18T00:00:00.000Z",
        audience: "public",
        world: { id: "world-1", name: "苍岚纪", description: "风雪大陆", visibility: "public", themeColor: "#176b5b", coverAssetId: "asset-hero", featuredEntityIds: ["hero"], navigationCategoryIds: ["people"], defaultMapId: "map-1" },
        categories: [{ id: "people", parentId: "", title: "人物", description: "", order: 0 }],
        entities: [{ id: "hero", type: "character", title: "艾琳", slug: "ailin", summary: "骑士", content: '<p onclick="steal()">正文 <a href="https://evil.example">外链</a></p><script>privateLeak()</script>', tags: ["骑士"], categoryId: "people", updatedAt: "2026-07-18", fields: [{ label: "身份", value: "守门人" }] }],
        quests: [],
        maps: [{ id: "map-1", parentMapId: "", title: "雾鸦堡", description: "", imageStoredName: "missing-map.png", markers: [], regions: [] }],
        timelines: [],
        relations: [],
        assets: [
          { id: "asset-hero", name: "艾琳", mimeType: "image/png", storedName: "hero.png", linkedEntityIds: ["hero"] },
          { id: "asset-map", name: "地图", mimeType: "image/png", storedName: "missing-map.png", linkedEntityIds: [] },
          { id: "asset-bad", name: "越界", mimeType: "image/png", storedName: "../secret.png", linkedEntityIds: [] }
        ]
      }
    });

    check(result.entityCount, 1, "export reports article count");
    check(result.assetCount, 1, "export reports copied image count");
    check(result.missingAssets, ["missing-map.png"], "missing images are reported without aborting the Wiki");
    check(result.files.every((file) => fs.existsSync(path.join(outputDir, file))), true, "all static entry files are written");
    check(fs.existsSync(path.join(outputDir, "assets", "hero.png")), true, "available local images are copied");

    const index = fs.readFileSync(path.join(outputDir, "index.html"), "utf8");
    const data = fs.readFileSync(path.join(outputDir, "wiki-data.js"), "utf8");
    const script = fs.readFileSync(path.join(outputDir, "wiki.js"), "utf8");
    const manifest = JSON.parse(fs.readFileSync(path.join(outputDir, "manifest.json"), "utf8"));
    assert.doesNotThrow(() => new vm.Script(script), "offline runtime JavaScript must parse");
    assertions += 1;
    check(index.includes("Content-Security-Policy"), true, "offline shell carries a restrictive CSP");
    check(index.includes("http://") || index.includes("https://"), false, "offline shell has no network dependency");
    check(data.includes("https://evil.example"), false, "published data contains no external article links");
    check(data.includes("privateLeak"), false, "published data contains no injected script body");
    check(data.includes("onclick"), false, "published data contains no event handler attributes");
    check(manifest.audience, "public", "manifest records the exported audience");
    check(manifest.counts.articles, 1, "manifest records article count");
    check(manifest.counts.assets, 1, "manifest records copied image count");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
  console.log(`Offline Wiki publication checks passed: ${assertions} assertions across sanitization, local assets, manifest, and static output.`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
