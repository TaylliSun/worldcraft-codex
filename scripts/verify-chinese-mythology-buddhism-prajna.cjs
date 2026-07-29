const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

const root = path.resolve(__dirname, "..");
const executablePath = require("electron");
const userDataDir = path.join(process.env.APPDATA || path.join(process.env.USERPROFILE, "AppData", "Roaming"), "worldcraft-codex");
const validationDir = path.join(root, "validation");
const reportPath = path.join(validationDir, "chinese-mythology-buddhism-prajna-ui.json");
const wikiScreenshotPath = path.join(validationDir, "chinese-mythology-buddhism-prajna-wiki.png");
const relationsScreenshotPath = path.join(validationDir, "chinese-mythology-buddhism-prajna-relations.png");
const timelineScreenshotPath = path.join(validationDir, "chinese-mythology-buddhism-prajna-timeline.png");
const worldName = "中国上古神话史";
const articleTitle = "《金刚般若波罗蜜经》（鸠摩罗什译本）";

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
      const data = (await window.worldcraftStore.loadWorkspace()).data;
      const world = data.worlds.find((item) => item.name === expectedName);
      if (!world) return null;
      const marker = ":mythology:buddhism-prajna:";
      const batchEntities = data.entities.filter((item) => item.worldId === world.id && item.id.includes(marker));
      const batchRelations = data.relations.filter((item) => item.worldId === world.id && item.id.includes(marker));
      const batchEvents = data.timelineEvents.filter((item) => item.worldId === world.id && item.id.includes(marker));
      const entities = data.entities.filter((item) => item.worldId === world.id && item.id.includes(":mythology:"));
      const relations = data.relations.filter((item) => item.worldId === world.id && item.id.includes(":mythology:"));
      const events = data.timelineEvents.filter((item) => item.worldId === world.id && item.id.includes(":mythology:"));
      return {
        worldId: world.id,
        batch: {
          entities: batchEntities.length,
          figures: batchEntities.filter((item) => item.templateId?.endsWith(":deity-person")).length,
          concepts: batchEntities.filter((item) => item.templateId?.endsWith(":institution-ritual")).length,
          sources: batchEntities.filter((item) => item.templateId?.endsWith(":source-text")).length,
          relations: batchRelations.length,
          sourceRelations: batchRelations.filter((item) => item.id.includes(":source-")).length,
          sectionContains: batchRelations.filter((item) => item.label?.startsWith("后世导航第 ")).length,
          sectionSequence: batchRelations.filter((item) => item.label === "三十二分流通本下一分").length,
          events: batchEvents.length
        },
        cumulative: { entities: entities.length, relations: relations.length, events: events.length },
        tracks: Object.fromEntries(
          data.timelineTracks
            .filter((track) => track.worldId === world.id)
            .map((track) => [track.name, data.timelineEvents.filter((event) => event.trackId === track.id).length])
        )
      };
    }, worldName);

    assert.ok(dataAudit, "未找到中国上古神话史世界");
    assert.equal(dataAudit.worldId, "world-chinese-mythology-history");
    assert.deepEqual(dataAudit.batch, {
      entities: 76,
      figures: 8,
      concepts: 16,
      sources: 52,
      relations: 217,
      sourceRelations: 24,
      sectionContains: 32,
      sectionSequence: 31,
      events: 29
    });
    assert.deepEqual(dataAudit.cumulative, { entities: 1671, relations: 4789, events: 426 });
    assert.deepEqual(dataAudit.tracks, {
      "神话叙事": 72,
      "文献证据": 130,
      "宗教与礼制制度": 152,
      "信仰演变与合流": 72
    });

    await selectWorld(page);
    await page.locator('.tabbar button[data-label="世界总览"]').click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible", timeout: 60000 });
    await page.locator(".wiki-stat-band").getByText("1671 篇文章", { exact: true }).waitFor();
    await page.locator(".wiki-stat-band").getByText("426 个历史节点", { exact: true }).waitFor();
    await page.getByLabel("搜索世界 Wiki").fill(articleTitle);
    const result = exactWikiResult(page, articleTitle);
    await result.waitFor({ state: "visible", timeout: 60000 });
    await result.click();
    await page.locator(".wiki-article h1").getByText(articleTitle, { exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByText("三十二分标题不是最初译文正文", { exact: false }).waitFor();
    await page.locator(".wiki-rich-content").getByText("须菩提", { exact: false }).first().waitFor();
    await page.screenshot({ path: wikiScreenshotPath, fullPage: false });

    await openMoreTool(page, "关系图");
    await page.locator(".relation-list-panel").getByText("4789 条符合筛选", { exact: true }).waitFor();
    await page.getByLabel("搜索关系").fill("六译对读以经句而非分题对齐");
    const relationCard = page.locator(".explicit-relation-card").filter({ hasText: "六译对读以经句而非分题对齐" }).first();
    await relationCard.waitFor({ state: "visible", timeout: 60000 });
    await relationCard.click();
    assert.equal(await page.getByLabel("关系证据类型").inputValue(), "textual-variant");
    await page.screenshot({ path: relationsScreenshotPath, fullPage: false });

    await openMoreTool(page, "时间线");
    await page.locator(".planning-workspace").waitFor({ state: "visible", timeout: 60000 });
    const trackButtons = page.locator(".timeline-track-browser .planning-item-list button");
    assert.match((await trackButtons.filter({ hasText: "文献证据" }).textContent()) || "", /130 项/u);
    await trackButtons.filter({ hasText: "文献证据" }).click();
    const event = page.locator(".timeline-track-board").getByText("咸通九年敦煌刻本留下明确刊印日期", { exact: true });
    await event.waitFor();
    await event.scrollIntoViewIfNeeded();
    await page.screenshot({ path: timelineScreenshotPath, fullPage: false });

    const report = {
      ok: true,
      generatedAt: new Date().toISOString(),
      world: worldName,
      dataAudit,
      ui: {
        wikiCountsVisible: { articles: 1671, timelineEvents: 426 },
        openedArticle: articleTitle,
        evidenceRelationVisible: "六译对读以经句而非分题对齐",
        timelineEventVisible: "咸通九年敦煌刻本留下明确刊印日期"
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
