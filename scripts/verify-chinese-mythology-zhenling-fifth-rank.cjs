const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

const root = path.resolve(__dirname, "..");
const executablePath = require("electron");
const userDataDir = path.join(process.env.APPDATA || path.join(process.env.USERPROFILE, "AppData", "Roaming"), "worldcraft-codex");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "chinese-mythology-zhenling-fifth-rank-ui.json");
const wikiScreenshotPath = path.join(validationDir, "chinese-mythology-zhenling-fifth-rank-wiki.png");
const relationsScreenshotPath = path.join(validationDir, "chinese-mythology-zhenling-fifth-rank-relations.png");
const timelineScreenshotPath = path.join(validationDir, "chinese-mythology-zhenling-fifth-rank-timeline.png");
const worldName = "中国上古神话史";

function environment() {
  const env = { ...process.env, ELECTRON_START_URL: process.env.ELECTRON_START_URL || "http://127.0.0.1:3000", WORLDCRAFT_USER_DATA_DIR: userDataDir };
  delete env.ELECTRON_RUN_AS_NODE;
  return env;
}

async function selectWorld(page) {
  const current = (await page.locator(".world-menu-current").textContent())?.trim();
  if (current === worldName) return;
  await page.getByLabel("切换世界").click();
  await page.getByRole("button", { name: worldName, exact: true }).click();
  await page.waitForFunction((expected) => document.querySelector(".world-menu-current")?.textContent?.trim() === expected, worldName, { timeout: 60000 });
}

async function openMoreTool(page, label) {
  const more = page.locator(".rail-more");
  if (!(await more.getAttribute("open"))) await more.locator(":scope > summary").click();
  await more.locator(".rail-more-popover").getByRole("button", { name: label, exact: true }).click();
}

function exactWikiResult(page, title) {
  return page.locator(".wiki-search-group button").filter({ has: page.locator("strong").getByText(title, { exact: true }) });
}

async function run() {
  fs.mkdirSync(validationDir, { recursive: true });
  const app = await electron.launch({ executablePath, args: ["."], cwd: root, env: environment(), timeout: 60000 });
  try {
    const page = await app.firstWindow({ timeout: 60000 });
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(() => Boolean(window.worldcraftStore?.loadWorkspace), null, { timeout: 60000 });
    await page.locator(".compact-save-status").waitFor({ state: "visible", timeout: 60000 });
    await page.waitForFunction(() => document.querySelector(".compact-save-status")?.textContent?.includes("SQLite"), null, { timeout: 60000 });

    const dataAudit = await page.evaluate(async (expectedName) => {
      const data = (await window.worldcraftStore.loadWorkspace()).data;
      const world = data.worlds.find((item) => item.name === expectedName);
      if (!world) return null;
      const entityMarker = ":mythology:zhenling-weiye:fifth-rank:";
      const marker = ":mythology:zhenling-fifth-rank:";
      const batchEntities = data.entities.filter((item) => item.worldId === world.id && item.id.includes(entityMarker));
      const batchRelations = data.relations.filter((item) => item.worldId === world.id && item.id.includes(marker));
      const batchEvents = data.timelineEvents.filter((item) => item.worldId === world.id && item.id.includes(marker));
      const entities = data.entities.filter((item) => item.worldId === world.id && item.id.includes(":mythology:"));
      const relations = data.relations.filter((item) => item.worldId === world.id && item.id.includes(":mythology:"));
      const events = data.timelineEvents.filter((item) => item.worldId === world.id && item.id.includes(":mythology:"));
      return {
        worldId: world.id,
        batch: {
          entities: batchEntities.length,
          figures: batchEntities.filter((item) => item.templateId?.endsWith(":zhenling-catalog-entry")).length,
          institutions: batchEntities.filter((item) => item.templateId?.endsWith(":institution-ritual")).length,
          locations: batchEntities.filter((item) => item.templateId?.endsWith(":sacred-geography")).length,
          relations: batchRelations.length,
          sourceRelations: batchRelations.filter((item) => item.id.includes(":source-")).length,
          events: batchEvents.length,
          disputedRelations: batchRelations.filter((item) => item.kind === "disputed").length,
          teacherRelations: batchRelations.filter((item) => item.kind === "teacher").length
        },
        cumulative: { entities: entities.length, relations: relations.length, events: events.length },
        semantics: {
          sourceRelations: relations.filter((item) => item.kind === "source").length,
          teacherRelations: relations.filter((item) => item.kind === "teacher").length,
          mutualRelations: relations.filter((item) => item.direction === "mutual").length,
          yearPrecisionEvents: events.filter((item) => item.datePrecision === "year").length
        },
        tracks: Object.fromEntries(data.timelineTracks.filter((track) => track.worldId === world.id).map((track) => [track.name, data.timelineEvents.filter((event) => event.trackId === track.id).length])),
        featured: world.wiki?.featuredEntityIds?.length || 0
      };
    }, worldName);

    assert.ok(dataAudit, "未找到中国上古神话史世界");
    assert.equal(dataAudit.worldId, "world-chinese-mythology-history");
    assert.deepEqual(dataAudit.batch, { entities: 47, figures: 33, institutions: 6, locations: 8, relations: 136, sourceRelations: 48, events: 6, disputedRelations: 2, teacherRelations: 3 });
    assert.deepEqual(dataAudit.cumulative, { entities: 1078, relations: 2975, events: 292 });
    assert.deepEqual(dataAudit.semantics, { sourceRelations: 850, teacherRelations: 103, mutualRelations: 50, yearPrecisionEvents: 8 });
    assert.deepEqual(dataAudit.tracks, { "神话叙事": 70, "文献证据": 92, "宗教与礼制制度": 76, "信仰演变与合流": 54 });
    assert.equal(dataAudit.featured, 12);

    await selectWorld(page);
    await page.locator('.tabbar button[data-label="世界总览"]').click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible", timeout: 60000 });
    await page.locator(".wiki-stat-band").getByText("1078 篇文章", { exact: true }).waitFor();
    await page.locator(".wiki-stat-band").getByText("292 个历史节点", { exact: true }).waitFor();
    await page.getByLabel("搜索世界 Wiki").fill("王玄甫");
    const result = exactWikiResult(page, "王玄甫（第五阶霍山人）");
    await result.waitFor({ state: "visible", timeout: 60000 });
    await result.click();
    await page.locator(".wiki-article h1").getByText("王玄甫（第五阶霍山人）", { exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByText("夹注只写“霍山人”，不能据同名直接并入元代全真祖统中的王玄甫。", { exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByText("创作边界", { exact: true }).waitFor();
    await page.screenshot({ path: wikiScreenshotPath, fullPage: false });

    await openMoreTool(page, "关系图");
    await page.locator(".relation-list-panel").getByText("2975 条符合筛选", { exact: true }).waitFor();
    await page.getByLabel("搜索关系").fill("霍山人王玄甫");
    const relationCard = page.locator(".explicit-relation-card").filter({ hasText: "霍山人王玄甫与全真祖统王玄甫同一性待考" }).first();
    await relationCard.waitFor({ state: "visible", timeout: 60000 });
    await relationCard.click();
    assert.equal(await page.getByLabel("关系证据类型").inputValue(), "scholarly-inference");
    assert.equal(await page.getByLabel("关系可信度").inputValue(), "disputed");
    await page.screenshot({ path: relationsScreenshotPath, fullPage: false });

    await openMoreTool(page, "时间线");
    await page.locator(".planning-workspace").waitFor({ state: "visible", timeout: 60000 });
    const trackButtons = page.locator(".timeline-track-browser .planning-item-list button");
    assert.match((await trackButtons.filter({ hasText: "文献证据" }).textContent()) || "", /92 项/u);
    assert.match((await trackButtons.filter({ hasText: "宗教与礼制制度" }).textContent()) || "", /76 项/u);
    assert.match((await trackButtons.filter({ hasText: "信仰演变与合流" }).textContent()) || "", /54 项/u);
    await trackButtons.filter({ hasText: "信仰演变与合流" }).click();
    const event = page.locator(".timeline-track-board").getByText("第五阶人物夹注形成多山修真地理网", { exact: true });
    await event.waitFor();
    await event.scrollIntoViewIfNeeded();
    await page.screenshot({ path: timelineScreenshotPath, fullPage: false });

    const report = {
      ok: true,
      generatedAt: new Date().toISOString(),
      world: worldName,
      dataAudit,
      ui: { wikiCountsVisible: { articles: 1078, timelineEvents: 292 }, openedArticle: "王玄甫（第五阶霍山人）", evidenceRelationVisible: "霍山人王玄甫与全真祖统王玄甫同一性待考", timelineEventVisible: "第五阶人物夹注形成多山修真地理网" },
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
