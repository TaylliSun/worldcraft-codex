const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

const root = path.resolve(__dirname, "..");
const executablePath = require("electron");
const userDataDir = path.join(process.env.APPDATA || path.join(process.env.USERPROFILE, "AppData", "Roaming"), "worldcraft-codex");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "chinese-mythology-buddhism-southern-material-ui.json");
const screenshots = {
  wiki: path.join(validationDir, "chinese-mythology-buddhism-southern-material-wiki.png"),
  relations: path.join(validationDir, "chinese-mythology-buddhism-southern-material-relations.png"),
  timeline: path.join(validationDir, "chinese-mythology-buddhism-southern-material-timeline.png")
};
const worldName = "中国上古神话史";
const articleTitle = "中国南传上座部佛教";

function environment() {
  const env = { ...process.env, ELECTRON_START_URL: process.env.ELECTRON_START_URL || "http://127.0.0.1:3000", WORLDCRAFT_USER_DATA_DIR: userDataDir };
  delete env.ELECTRON_RUN_AS_NODE;
  return env;
}

async function selectWorld(page) {
  if ((await page.locator(".world-menu-current").textContent())?.trim() === worldName) return;
  await page.getByLabel("切换世界").click();
  await page.getByRole("button", { name: worldName, exact: true }).click();
  await page.waitForFunction((name) => document.querySelector(".world-menu-current")?.textContent?.trim() === name, worldName, { timeout: 60000 });
}

async function openMoreTool(page, label) {
  const more = page.locator(".rail-more");
  if (!(await more.getAttribute("open"))) await more.locator(":scope > summary").click();
  await more.locator(".rail-more-popover").getByRole("button", { name: label, exact: true }).click();
}

async function run() {
  fs.mkdirSync(validationDir, { recursive: true });
  const app = await electron.launch({ executablePath, args: ["."], cwd: root, env: environment(), timeout: 60000 });
  try {
    const page = await app.firstWindow({ timeout: 60000 });
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(() => Boolean(window.worldcraftStore?.loadWorkspace), null, { timeout: 60000 });
    await page.waitForFunction(() => document.querySelector(".compact-save-status")?.textContent?.includes("SQLite"), null, { timeout: 60000 });

    const dataAudit = await page.evaluate(async (expectedName) => {
      const data = (await window.worldcraftStore.loadWorkspace()).data;
      const world = data.worlds.find((item) => item.name === expectedName);
      if (!world) return null;
      const marker = ":mythology:buddhism-southern-material:";
      const batchEntities = data.entities.filter((item) => item.worldId === world.id && item.id.includes(marker));
      const batchRelations = data.relations.filter((item) => item.worldId === world.id && item.id.includes(marker));
      const batchEvents = data.timelineEvents.filter((item) => item.worldId === world.id && item.id.includes(marker));
      return {
        worldId: world.id,
        batch: {
          entities: batchEntities.length,
          figures: batchEntities.filter((item) => item.type === "character").length,
          locations: batchEntities.filter((item) => item.type === "location").length,
          sources: batchEntities.filter((item) => item.templateId?.endsWith(":source-text")).length,
          relations: batchRelations.length,
          sourceRelations: batchRelations.filter((item) => item.id.includes(":source-figure-")).length,
          events: batchEvents.length
        },
        cumulative: {
          entities: data.entities.filter((item) => item.worldId === world.id && item.id.includes(":mythology:")).length,
          relations: data.relations.filter((item) => item.worldId === world.id && item.id.includes(":mythology:")).length,
          events: data.timelineEvents.filter((item) => item.worldId === world.id && item.id.includes(":mythology:")).length
        },
        tracks: Object.fromEntries(data.timelineTracks.filter((track) => track.worldId === world.id).map((track) => [track.name, data.timelineEvents.filter((event) => event.trackId === track.id).length]))
      };
    }, worldName);

    assert.ok(dataAudit);
    assert.equal(dataAudit.worldId, "world-chinese-mythology-history");
    assert.deepEqual(dataAudit.batch, { entities: 128, figures: 44, locations: 24, sources: 10, relations: 320, sourceRelations: 44, events: 32 });
    assert.deepEqual(dataAudit.cumulative, { entities: 2442, relations: 7333, events: 635 });
    assert.deepEqual(dataAudit.tracks, { "神话叙事": 85, "文献证据": 227, "宗教与礼制制度": 209, "信仰演变与合流": 114 });

    await selectWorld(page);
    await page.locator('.tabbar button[data-label="世界总览"]').click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible", timeout: 60000 });
    await page.locator(".wiki-stat-band").getByText("2442 篇文章", { exact: true }).waitFor();
    await page.getByLabel("搜索世界 Wiki").fill(articleTitle);
    const result = page.locator(".wiki-search-group button").filter({ has: page.locator("strong").getByText(articleTitle, { exact: true }) });
    await result.waitFor({ state: "visible", timeout: 60000 });
    await result.click();
    await page.locator(".wiki-article h1").getByText(articleTitle, { exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByText("传入年代尚无单一定论", { exact: false }).waitFor();
    await page.locator(".wiki-rich-content").getByText("创作使用（项目原创提示）", { exact: true }).waitFor();
    await page.screenshot({ path: screenshots.wiki, fullPage: false });

    await openMoreTool(page, "关系图");
    await page.locator(".relation-list-panel").getByText("7333 条符合筛选", { exact: true }).waitFor();
    const relationSearch = page.locator('.relation-list-panel input[aria-label="搜索关系"]');
    await relationSearch.waitFor({ state: "visible", timeout: 60000 });
    await relationSearch.fill("云南新年与浴佛节仪交会");
    const relation = page.locator(".explicit-relation-card").filter({ hasText: "云南新年与浴佛节仪交会" }).first();
    await relation.waitFor({ state: "visible", timeout: 60000 });
    await relation.click();
    assert.equal(await page.getByLabel("关系证据类型").inputValue(), "scholarly-inference");
    assert.equal(await page.getByLabel("关系可信度").inputValue(), "probable");
    await page.screenshot({ path: screenshots.relations, fullPage: false });

    await openMoreTool(page, "时间线");
    await page.locator(".planning-workspace").waitFor({ state: "visible", timeout: 60000 });
    const track = page.locator(".timeline-track-browser .planning-item-list button").filter({ hasText: "宗教与礼制制度" });
    assert.match((await track.textContent()) || "", /209 项/u);
    await track.click();
    const timelineEvent = page.locator(".timeline-track-board").getByText("西双版纳逐步形成佛寺、佛塔与僧团", { exact: true });
    await timelineEvent.waitFor();
    await timelineEvent.scrollIntoViewIfNeeded();
    await page.screenshot({ path: screenshots.timeline, fullPage: false });

    const report = { ok: true, generatedAt: new Date().toISOString(), world: worldName, dataAudit, ui: { articleTitle, boundaryVisible: true, relationVisible: "云南新年与浴佛节仪交会", timelineEventVisible: "西双版纳逐步形成佛寺、佛塔与僧团" }, screenshots: Object.values(screenshots) };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ ok: true, reportPath, screenshots: report.screenshots }, null, 2));
  } finally {
    await app.close();
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
