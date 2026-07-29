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
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "chinese-mythology-history-ui.json");
const wikiScreenshotPath = path.join(validationDir, "chinese-mythology-history-foundation-wiki.png");
const timelineScreenshotPath = path.join(validationDir, "chinese-mythology-history-foundation-timelines.png");
const worldName = "中国上古神话史";
const trackNames = ["神话叙事", "文献证据", "宗教与礼制制度", "信仰演变与合流"];

function environment() {
  const env = {
    ...process.env,
    ELECTRON_START_URL: process.env.ELECTRON_START_URL || "http://127.0.0.1:3000",
    WORLDCRAFT_USER_DATA_DIR: userDataDir
  };
  delete env.ELECTRON_RUN_AS_NODE;
  return env;
}

async function selectWorld(page) {
  const current = (await page.locator(".world-menu-current").textContent())?.trim();
  if (current === worldName) return;
  await page.getByLabel("切换世界").click();
  await page.getByRole("button", { name: worldName, exact: true }).click();
  await page.waitForFunction(
    (expected) => document.querySelector(".world-menu-current")?.textContent?.trim() === expected,
    worldName,
    { timeout: 60000 }
  );
}

async function run() {
  fs.mkdirSync(validationDir, { recursive: true });
  const app = await electron.launch({
    executablePath,
    args: ["."],
    cwd: root,
    env: environment(),
    timeout: 60000
  });

  try {
    const page = await app.firstWindow({ timeout: 60000 });
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(() => Boolean(window.worldcraftStore?.loadWorkspace), null, {
      timeout: 60000
    });
    await page.locator(".compact-save-status").waitFor({ state: "visible", timeout: 60000 });
    await page.waitForFunction(
      () => document.querySelector(".compact-save-status")?.textContent?.includes("SQLite"),
      null,
      { timeout: 60000 }
    );

    const dataAudit = await page.evaluate(async (expectedName) => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const data = loaded.data;
      const world = data.worlds.find((item) => item.name === expectedName);
      if (!world) return null;
      return {
        worldId: world.id,
        categories: data.codexCategories.filter((item) => item.worldId === world.id).length,
        templates: data.entityTemplates.filter((item) => item.worldId === world.id).length,
        managedTemplates: data.entityTemplates.filter(
          (item) => item.worldId === world.id && item.id.includes(":mythology:")
        ).length,
        entities: data.entities.filter((item) => item.worldId === world.id).length,
        timelineTracks: data.timelineTracks
          .filter((item) => item.worldId === world.id)
          .sort((a, b) => a.order - b.order)
          .map((item) => item.name),
        pinnedAiRules: data.aiMemoryItems.filter(
          (item) => item.worldId === world.id && item.pinned && item.state === "confirmed"
        ).length
      };
    }, worldName);

    assert.ok(dataAudit, "新世界应存在于桌面客户端读取的数据中");
    assert.equal(dataAudit.categories, 46);
    assert.ok(dataAudit.templates >= 5);
    assert.equal(dataAudit.managedTemplates, 5);
    assert.equal(dataAudit.entities, 8);
    assert.deepEqual(dataAudit.timelineTracks, trackNames);
    assert.equal(dataAudit.pinnedAiRules, 6);

    await selectWorld(page);
    assert.equal((await page.locator(".world-menu-current").textContent())?.trim(), worldName);

    await page.locator('.tabbar button[data-label="世界总览"]').click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible", timeout: 60000 });
    await page.getByRole("heading", { name: worldName, exact: true }).waitFor({ timeout: 60000 });
    for (const title of ["阅读与来源说明", "关系证据规则", "四条时间轴使用说明", "原创改编说明"]) {
      await page.getByText(title, { exact: true }).first().waitFor({ state: "visible", timeout: 60000 });
    }
    await page.screenshot({ path: wikiScreenshotPath, fullPage: false });

    await page.locator(".rail-more > summary").click();
    await page.locator(".rail-more-popover").getByRole("button", { name: "时间线", exact: true }).click();
    await page.locator(".planning-workspace").waitFor({ state: "visible", timeout: 60000 });
    for (const trackName of trackNames) {
      await page.locator(".timeline-track-browser").getByText(trackName, { exact: true }).waitFor({
        state: "visible",
        timeout: 60000
      });
    }
    await page.screenshot({ path: timelineScreenshotPath, fullPage: false });

    const report = {
      ok: true,
      generatedAt: new Date().toISOString(),
      world: worldName,
      dataAudit,
      ui: {
        selectedWorld: worldName,
        featuredRulesVisible: 4,
        timelineTracksVisible: trackNames.length
      },
      screenshots: [wikiScreenshotPath, timelineScreenshotPath]
    };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ ok: true, reportPath, screenshots: report.screenshots }, null, 2));
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
