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
const reportPath = path.join(validationDir, "chinese-mythology-daoism-early-ui.json");
const wikiScreenshotPath = path.join(validationDir, "chinese-mythology-daoism-early-wiki.png");
const relationsScreenshotPath = path.join(validationDir, "chinese-mythology-daoism-early-relations.png");
const timelineScreenshotPath = path.join(validationDir, "chinese-mythology-daoism-early-timeline.png");
const worldName = "中国上古神话史";

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

async function openMoreTool(page, label) {
  const more = page.locator(".rail-more");
  if (!(await more.getAttribute("open"))) await more.locator(":scope > summary").click();
  await more.locator(".rail-more-popover").getByRole("button", { name: label, exact: true }).click();
}

async function exactWikiResult(page, title) {
  return page.locator(".wiki-search-group button").filter({
    has: page.locator("strong").getByText(title, { exact: true })
  });
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
    await page.waitForFunction(() => Boolean(window.worldcraftStore?.loadWorkspace), null, { timeout: 60000 });
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
      const batchMarker = ":mythology:daoism-early:";
      const managedMarkers = [
        ":mythology:ancient-core:",
        ":mythology:nature-pantheon:",
        ":mythology:civilization-lineages:",
        batchMarker
      ];
      const inBatch = (item) => item.worldId === world.id && item.id.includes(batchMarker);
      const isManagedRelationOrEvent = (item) => (
        item.worldId === world.id && managedMarkers.some((marker) => item.id.includes(marker))
      );
      const batchEntities = data.entities.filter(inBatch);
      const batchRelations = data.relations.filter(inBatch);
      const batchEvents = data.timelineEvents.filter(inBatch);
      return {
        worldId: world.id,
        totalWorldEntities: data.entities.filter((item) => item.worldId === world.id).length,
        batch: {
          entities: batchEntities.length,
          figures: batchEntities.filter((item) => item.type === "character").length,
          institutions: batchEntities.filter((item) => item.templateId?.endsWith(":institution-ritual")).length,
          locations: batchEntities.filter((item) => item.type === "location").length,
          sources: batchEntities.filter((item) => item.templateId?.endsWith(":source-text")).length,
          relations: batchRelations.length,
          sourceRelations: batchRelations.filter((item) => item.label === "主要原典入口").length,
          relationEvidenceComplete: batchRelations.filter(
            (item) => item.evidenceType && item.sourceCitation && item.historicalScope && item.confidence && item.notes
          ).length,
          events: batchEvents.length
        },
        cumulativeManaged: {
          entities: data.entities.filter(
            (item) => item.worldId === world.id && item.id.includes(":mythology:")
          ).length,
          relations: data.relations.filter(isManagedRelationOrEvent).length,
          events: data.timelineEvents.filter(isManagedRelationOrEvent).length
        },
        tracks: Object.fromEntries(data.timelineTracks
          .filter((track) => track.worldId === world.id)
          .map((track) => [track.name, data.timelineEvents.filter((event) => event.trackId === track.id).length])),
        featured: world.wiki?.featuredEntityIds?.length || 0
      };
    }, worldName);

    assert.ok(dataAudit, "未找到中国上古神话史世界");
    assert.equal(dataAudit.worldId, "world-chinese-mythology-history");
    assert.deepEqual(dataAudit.batch, {
      entities: 70,
      figures: 31,
      institutions: 12,
      locations: 8,
      sources: 19,
      relations: 200,
      sourceRelations: 51,
      relationEvidenceComplete: 200,
      events: 28
    });
    assert.deepEqual(dataAudit.cumulativeManaged, { entities: 241, relations: 536, events: 92 });
    assert.deepEqual(dataAudit.tracks, {
      "神话叙事": 45,
      "文献证据": 32,
      "宗教与礼制制度": 11,
      "信仰演变与合流": 4
    });
    assert.equal(dataAudit.featured, 12);

    await selectWorld(page);
    await page.locator('.tabbar button[data-label="世界总览"]').click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible", timeout: 60000 });
    await page.getByRole("heading", { name: worldName, exact: true }).waitFor({ timeout: 60000 });
    await page.locator(".wiki-stat-band").getByText("241 篇文章", { exact: true }).waitFor();
    await page.locator(".wiki-stat-band").getByText("92 个历史节点", { exact: true }).waitFor();

    const wikiSearch = page.getByLabel("搜索世界 Wiki");
    await wikiSearch.fill("老子");
    await (await exactWikiResult(page, "老子（传记人物）")).waitFor({ state: "visible", timeout: 60000 });
    await (await exactWikiResult(page, "太上老君")).waitFor({ state: "visible", timeout: 60000 });
    await wikiSearch.fill("张衡");
    await (await exactWikiResult(page, "张衡（天师道嗣师）")).waitFor({ state: "visible", timeout: 60000 });
    await wikiSearch.fill("太上大道君");
    await (await exactWikiResult(page, "太上大道君")).waitFor({ state: "visible", timeout: 60000 });
    await wikiSearch.fill("灵宝天尊");
    await (await exactWikiResult(page, "灵宝天尊")).waitFor({ state: "visible", timeout: 60000 });
    await wikiSearch.fill("陆修静");
    const luResult = await exactWikiResult(page, "陆修静");
    await luResult.waitFor({ state: "visible", timeout: 60000 });
    await luResult.click();
    await page.locator(".wiki-article h1").getByText("陆修静", { exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByRole("heading", { name: "三洞不是一人凭空发明", exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByText("所谓“整理”会改变后人看到的传统", { exact: false }).waitFor();
    await page.locator(".wiki-fact-sheet").getByText("《陆先生道门科略》", { exact: false }).first().waitFor();
    await page.screenshot({ path: wikiScreenshotPath, fullPage: false });

    await openMoreTool(page, "关系图");
    await page.locator(".relation-layout").waitFor({ state: "visible", timeout: 60000 });
    await page.locator(".relation-list-panel").getByText("536 条符合筛选", { exact: true }).waitFor();
    await page.getByLabel("搜索关系").fill("张修");
    const variantRelation = page.locator(".explicit-relation-card").filter({
      hasText: "传写相近但并非一人"
    });
    await variantRelation.waitFor({ state: "visible", timeout: 60000 });
    await variantRelation.click();
    await page.waitForTimeout(500);
    assert.equal(await page.getByLabel("关系证据类型").inputValue(), "textual-variant");
    assert.equal(await page.getByLabel("关系可信度").inputValue(), "disputed");
    assert.match(await page.getByLabel("关系原典出处").inputValue(), /张鲁传.*典略/u);
    assert.match(await page.getByLabel("关系适用年代").inputValue(), /汉末/u);
    await page.screenshot({ path: relationsScreenshotPath, fullPage: false });

    await openMoreTool(page, "时间线");
    await page.locator(".planning-workspace").waitFor({ state: "visible", timeout: 60000 });
    const trackButtons = page.locator(".timeline-track-browser .planning-item-list button");
    assert.match((await trackButtons.filter({ hasText: "神话叙事" }).textContent()) || "", /45 项/u);
    assert.match((await trackButtons.filter({ hasText: "文献证据" }).textContent()) || "", /32 项/u);
    assert.match((await trackButtons.filter({ hasText: "宗教与礼制制度" }).textContent()) || "", /11 项/u);
    assert.match((await trackButtons.filter({ hasText: "信仰演变与合流" }).textContent()) || "", /4 项/u);
    await page.locator(".timeline-track-board").getByText("老君降授张道陵盟威新法", { exact: true }).waitFor();
    await page.locator(".timeline-track-board").getByText("三洞分类与三清尊位逐步相配", { exact: true }).waitFor();
    await page.screenshot({ path: timelineScreenshotPath, fullPage: false });

    const report = {
      ok: true,
      generatedAt: new Date().toISOString(),
      world: worldName,
      dataAudit,
      ui: {
        wikiCountsVisible: { articles: 241, timelineEvents: 92 },
        disambiguationSearchVisible: ["老子（传记人物）", "太上老君", "张衡（天师道嗣师）", "太上大道君", "灵宝天尊"],
        openedArticle: "陆修静",
        evidenceRelationVisible: "传写相近但并非一人",
        timelineCountsVisible: { mythic: 45, textual: 32, institutional: 11, evolution: 4 }
      },
      screenshots: [wikiScreenshotPath, relationsScreenshotPath, timelineScreenshotPath]
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
