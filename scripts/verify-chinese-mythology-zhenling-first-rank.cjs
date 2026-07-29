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
const reportPath = path.join(validationDir, "chinese-mythology-zhenling-first-rank-ui.json");
const wikiScreenshotPath = path.join(validationDir, "chinese-mythology-zhenling-first-rank-wiki.png");
const relationsScreenshotPath = path.join(validationDir, "chinese-mythology-zhenling-first-rank-relations.png");
const timelineScreenshotPath = path.join(validationDir, "chinese-mythology-zhenling-first-rank-timeline.png");
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

function exactWikiResult(page, title) {
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
      const entityMarker = ":mythology:zhenling-weiye:first-rank:";
      const relationEventMarker = ":mythology:zhenling-first-rank:";
      const managedMarkers = [
        ":mythology:ancient-core:",
        ":mythology:nature-pantheon:",
        ":mythology:civilization-lineages:",
        ":mythology:daoism-early:",
        ":mythology:daoism-celestial:",
        ":mythology:daoism-lineages:",
        ":mythology:buddhism-transmission:",
        ":mythology:buddhism-devotion:",
        ":mythology:buddhism-schools:",
        ":mythology:confucian-rites:",
        ":mythology:folk-syncretism:",
        relationEventMarker
      ];
      const batchEntities = data.entities.filter((item) => item.worldId === world.id && item.id.includes(entityMarker));
      const batchRelations = data.relations.filter((item) => item.worldId === world.id && item.id.includes(relationEventMarker));
      const batchEvents = data.timelineEvents.filter((item) => item.worldId === world.id && item.id.includes(relationEventMarker));
      const managedRelations = data.relations.filter((item) => item.worldId === world.id && managedMarkers.some((marker) => item.id.includes(marker)));
      const managedEvents = data.timelineEvents.filter((item) => item.worldId === world.id && managedMarkers.some((marker) => item.id.includes(marker)));
      return {
        worldId: world.id,
        batch: {
          entities: batchEntities.length,
          figures: batchEntities.filter((item) => item.templateId?.endsWith(":zhenling-catalog-entry")).length,
          institutions: batchEntities.filter((item) => item.templateId?.endsWith(":institution-ritual")).length,
          sources: batchEntities.filter((item) => item.templateId?.endsWith(":source-text")).length,
          relations: batchRelations.length,
          sourceRelations: batchRelations.filter((item) => item.id.includes(":source-")).length,
          events: batchEvents.length,
          collectiveSeats: batchEntities.filter((item) => item.title.includes("合称神位")).length,
          disputedJadeRelations: batchRelations.filter((item) => item.kind === "disputed" && item.targetEntityId.endsWith(":daoism-celestial:jade-emperor")).length
        },
        cumulativeManaged: {
          entities: data.entities.filter((item) => item.worldId === world.id && item.id.includes(":mythology:")).length,
          relations: managedRelations.length,
          events: managedEvents.length
        },
        preservedSemantics: {
          sourceRelations: managedRelations.filter((item) => item.kind === "source").length,
          teacherRelations: managedRelations.filter((item) => item.kind === "teacher").length,
          mutualRelations: managedRelations.filter((item) => item.direction === "mutual").length,
          yearPrecisionEvents: managedEvents.filter((item) => item.datePrecision === "year").length
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
      entities: 30,
      figures: 24,
      institutions: 5,
      sources: 1,
      relations: 62,
      sourceRelations: 30,
      events: 2,
      collectiveSeats: 4,
      disputedJadeRelations: 2
    });
    assert.deepEqual(dataAudit.cumulativeManaged, { entities: 681, relations: 1998, events: 266 });
    assert.deepEqual(dataAudit.preservedSemantics, {
      sourceRelations: 428,
      teacherRelations: 88,
      mutualRelations: 44,
      yearPrecisionEvents: 8
    });
    assert.deepEqual(dataAudit.tracks, {
      "神话叙事": 70,
      "文献证据": 84,
      "宗教与礼制制度": 68,
      "信仰演变与合流": 44
    });
    assert.equal(dataAudit.featured, 12);

    await selectWorld(page);
    await page.locator('.tabbar button[data-label="世界总览"]').click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible", timeout: 60000 });
    await page.getByRole("heading", { name: worldName, exact: true }).waitFor({ timeout: 60000 });
    await page.locator(".wiki-stat-band").getByText("681 篇文章", { exact: true }).waitFor();
    await page.locator(".wiki-stat-band").getByText("266 个历史节点", { exact: true }).waitFor();

    const wikiSearch = page.getByLabel("搜索世界 Wiki");
    await wikiSearch.fill("玉皇道君");
    const result = exactWikiResult(page, "玉皇道君（第一阶名号）");
    await result.waitFor({ state: "visible", timeout: 60000 });
    await result.click();
    await page.locator(".wiki-article h1").getByText("玉皇道君（第一阶名号）", { exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByText("不能仅凭近似名称直接并入宋以后玉皇上帝", { exact: false }).waitFor();
    await page.locator(".wiki-rich-content").getByText("仍须留白", { exact: true }).waitFor();
    await page.screenshot({ path: wikiScreenshotPath, fullPage: false });

    await openMoreTool(page, "关系图");
    await page.locator(".relation-layout").waitFor({ state: "visible", timeout: 60000 });
    await page.locator(".relation-list-panel").getByText("1998 条符合筛选", { exact: true }).waitFor();
    await page.getByLabel("搜索关系").fill("玉皇道君");
    const relationCard = page.locator(".explicit-relation-card").filter({
      hasText: "与后世玉皇上帝同一性待考"
    }).first();
    await relationCard.waitFor({ state: "visible", timeout: 60000 });
    await relationCard.click();
    await page.waitForTimeout(500);
    assert.equal(await page.getByLabel("关系证据类型").inputValue(), "scholarly-inference");
    assert.equal(await page.getByLabel("关系可信度").inputValue(), "disputed");
    assert.match(await page.getByLabel("关系原典出处").inputValue(), /真灵位业图/u);
    await page.screenshot({ path: relationsScreenshotPath, fullPage: false });

    await openMoreTool(page, "时间线");
    await page.locator(".planning-workspace").waitFor({ state: "visible", timeout: 60000 });
    const trackButtons = page.locator(".timeline-track-browser .planning-item-list button");
    assert.match((await trackButtons.filter({ hasText: "神话叙事" }).textContent()) || "", /70 项/u);
    assert.match((await trackButtons.filter({ hasText: "文献证据" }).textContent()) || "", /84 项/u);
    assert.match((await trackButtons.filter({ hasText: "宗教与礼制制度" }).textContent()) || "", /68 项/u);
    assert.match((await trackButtons.filter({ hasText: "信仰演变与合流" }).textContent()) || "", /44 项/u);
    await trackButtons.filter({ hasText: "文献证据" }).click();
    await page.locator(".timeline-track-board").getByText("《真灵位业图》形成齐梁神谱整理层", { exact: true }).waitFor();
    await page.screenshot({ path: timelineScreenshotPath, fullPage: false });

    const report = {
      ok: true,
      generatedAt: new Date().toISOString(),
      world: worldName,
      dataAudit,
      ui: {
        wikiCountsVisible: { articles: 681, timelineEvents: 266 },
        openedArticle: "玉皇道君（第一阶名号）",
        evidenceRelationVisible: "与后世玉皇上帝同一性待考",
        timelineEventVisible: "《真灵位业图》形成齐梁神谱整理层"
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
