const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

const root = path.resolve(__dirname, "..");
const executablePath = require("electron");
const userDataDir = path.join(
  process.env.APPDATA || path.join(process.env.USERPROFILE, "AppData", "Roaming"),
  "worldcraft-codex"
);
const screenshotPath = path.join(root, "validation", "shanhai-map-preview.png");

async function openWorkspace(page, name) {
  const button = page.getByRole("button", { name, exact: true });
  if (!(await button.isVisible())) {
    await page.locator(".rail-more > summary").click();
    await button.waitFor({ state: "visible" });
  }
  await button.click();
}

async function main() {
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  const env = {
    ...process.env,
    WORLDCRAFT_USER_DATA_DIR: userDataDir
  };
  delete env.ELECTRON_RUN_AS_NODE;

  const electronApp = await electron.launch({
    executablePath,
    args: ["."],
    cwd: root,
    env,
    timeout: 30000
  });

  try {
    const page = await electronApp.firstWindow({ timeout: 30000 });
    await page.waitForLoadState("domcontentloaded");
    await page.locator(".compact-save-status").waitFor({ state: "visible", timeout: 30000 });
    await page.waitForFunction(() =>
      document.querySelector(".compact-save-status")?.textContent?.includes("SQLite")
    );

    await page.locator(".world-title-input").waitFor({ state: "visible", timeout: 30000 });
    assert.equal(
      await page.locator(".world-title-input").inputValue(),
      "山海经异兽图志",
      "the imported world is active"
    );
    await openWorkspace(page, "地图");
    await page.getByRole("heading", { name: "山海异兽图", exact: true }).waitFor({ timeout: 30000 });
    await page.getByLabel("交互式地图画布", { exact: true }).waitFor({ state: "visible" });

    await page.waitForFunction(() => {
      const base = document.querySelector(".map-background-image");
      const layers = Array.from(document.querySelectorAll(".map-layer-image"));
      return base instanceof HTMLImageElement
        && base.complete
        && base.naturalWidth > 0
        && layers.length === 8
        && layers.every((layer) => layer instanceof HTMLImageElement && layer.complete && layer.naturalWidth > 0);
    }, undefined, { timeout: 30000 });

    assert.equal(await page.locator(".map-layer-image").count(), 8, "eight creature images render");
    assert.equal(
      await page.locator(".map-region-layer [data-region-id^='map-region-shanhai-']").count(),
      8,
      "eight editable habitat regions render"
    );
    assert.equal(
      await page.getByRole("button", { name: /^地图标记 (穷奇|帝江|烛龙|精卫|夔|九尾狐|鹿蜀|当康) · / }).count(),
      8,
      "eight linked creature markers render"
    );

    await page.getByRole("button", { name: "最大化地图工作区", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "山海异兽图", exact: true });
    await dialog.waitFor({ state: "visible" });
    await dialog.getByRole("button", { name: "适配整张地图", exact: true }).click();
    await page.waitForTimeout(800);
    await dialog.getByLabel("交互式地图画布", { exact: true }).screenshot({ path: screenshotPath });

    const viewportBox = await dialog.getByLabel("交互式地图画布", { exact: true }).boundingBox();
    assert.ok(viewportBox && viewportBox.width > 700 && viewportBox.height > 450, "fullscreen map has a usable viewport");

    console.log(JSON.stringify({
      ok: true,
      world: "山海经异兽图志",
      map: "山海异兽图",
      creatureImages: 8,
      regions: 8,
      markers: 8,
      screenshotPath,
      viewport: viewportBox
    }, null, 2));
  } finally {
    await electronApp.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
