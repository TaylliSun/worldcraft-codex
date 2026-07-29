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
const reportPath = path.join(validationDir, "chinese-mythology-celestial-bureaucracy-ui.json");
const wikiScreenshotPath = path.join(validationDir, "chinese-mythology-celestial-bureaucracy-wiki.png");
const relationsScreenshotPath = path.join(validationDir, "chinese-mythology-celestial-bureaucracy-relations.png");
const timelineScreenshotPath = path.join(validationDir, "chinese-mythology-celestial-bureaucracy-timeline.png");
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
      const batchMarker = ":mythology:daoism-celestial:";
      const managedMarkers = [
        ":mythology:ancient-core:",
        ":mythology:nature-pantheon:",
        ":mythology:civilization-lineages:",
        ":mythology:daoism-early:",
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
      entities: 60,
      figures: 36,
      institutions: 8,
      locations: 5,
      sources: 11,
      relations: 220,
      sourceRelations: 49,
      relationEvidenceComplete: 220,
      events: 22
    });
    assert.deepEqual(dataAudit.cumulativeManaged, { entities: 301, relations: 756, events: 114 });
    assert.deepEqual(dataAudit.tracks, {
      "神话叙事": 49,
      "文献证据": 40,
      "宗教与礼制制度": 17,
      "信仰演变与合流": 8
    });
    assert.equal(dataAudit.featured, 12);

    await selectWorld(page);
    await page.locator('.tabbar button[data-label="世界总览"]').click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible", timeout: 60000 });
    await page.getByRole("heading", { name: worldName, exact: true }).waitFor({ timeout: 60000 });
    await page.locator(".wiki-stat-band").getByText("301 篇文章", { exact: true }).waitFor();
    await page.locator(".wiki-stat-band").getByText("114 个历史节点", { exact: true }).waitFor();

    const wikiSearch = page.getByLabel("搜索世界 Wiki");
    await wikiSearch.fill("后土");
    await (await exactWikiResult(page, "后土皇地祇")).waitFor({ state: "visible", timeout: 60000 });
    await (await exactWikiResult(page, "后土")).waitFor({ state: "visible", timeout: 60000 });
    await wikiSearch.fill("司命");
    await (await exactWikiResult(page, "司命灶君")).waitFor({ state: "visible", timeout: 60000 });
    await (await exactWikiResult(page, "南斗第一天府司命星君")).waitFor({ state: "visible", timeout: 60000 });
    await wikiSearch.fill("玄天上帝");
    const zhenwuResult = await exactWikiResult(page, "玄天上帝（真武大帝）");
    await zhenwuResult.waitFor({ state: "visible", timeout: 60000 });
    await zhenwuResult.click();
    await page.locator(".wiki-article h1").getByText("玄天上帝（真武大帝）", { exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByRole("heading", { name: "神格与职掌", exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByText("真武的历史像一条不断改道的河", { exact: false }).waitFor();
    await page.locator(".wiki-fact-sheet").getByText("《元始天尊说北方真武妙经》", { exact: false }).first().waitFor();
    await page.screenshot({ path: wikiScreenshotPath, fullPage: false });

    await openMoreTool(page, "关系图");
    await page.locator(".relation-layout").waitFor({ state: "visible", timeout: 60000 });
    await page.locator(".relation-list-panel").getByText("756 条符合筛选", { exact: true }).waitFor();
    await page.getByLabel("搜索关系").fill("后土");
    const houthuRelation = page.locator(".explicit-relation-card").filter({
      hasText: "由早期后土观念发展而尊号重构"
    });
    await houthuRelation.waitFor({ state: "visible", timeout: 60000 });
    await houthuRelation.click();
    await page.waitForTimeout(500);
    assert.equal(await page.getByLabel("关系证据类型").inputValue(), "scholarly-inference");
    assert.equal(await page.getByLabel("关系可信度").inputValue(), "probable");
    assert.match(await page.getByLabel("关系原典出处").inputValue(), /封禅书.*宋史/u);
    assert.match(await page.getByLabel("关系适用年代").inputValue(), /先秦至宋代/u);
    await page.screenshot({ path: relationsScreenshotPath, fullPage: false });

    await openMoreTool(page, "时间线");
    await page.locator(".planning-workspace").waitFor({ state: "visible", timeout: 60000 });
    const trackButtons = page.locator(".timeline-track-browser .planning-item-list button");
    assert.match((await trackButtons.filter({ hasText: "神话叙事" }).textContent()) || "", /49 项/u);
    assert.match((await trackButtons.filter({ hasText: "文献证据" }).textContent()) || "", /40 项/u);
    assert.match((await trackButtons.filter({ hasText: "宗教与礼制制度" }).textContent()) || "", /17 项/u);
    assert.match((await trackButtons.filter({ hasText: "信仰演变与合流" }).textContent()) || "", /8 项/u);
    await page.locator(".timeline-track-board").getByText("斗姆化生北斗九皇", { exact: true }).waitFor();
    await page.locator(".timeline-track-board").getByText("《道法会元》汇编多派法书", { exact: true }).waitFor();
    await page.screenshot({ path: timelineScreenshotPath, fullPage: false });

    const report = {
      ok: true,
      generatedAt: new Date().toISOString(),
      world: worldName,
      dataAudit,
      ui: {
        wikiCountsVisible: { articles: 301, timelineEvents: 114 },
        disambiguationSearchVisible: ["后土皇地祇", "后土", "司命灶君", "南斗第一天府司命星君"],
        openedArticle: "玄天上帝（真武大帝）",
        evidenceRelationVisible: "由早期后土观念发展而尊号重构",
        timelineCountsVisible: { mythic: 49, textual: 40, institutional: 17, evolution: 8 }
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
