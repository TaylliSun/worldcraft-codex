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
const reportPath = path.join(validationDir, "chinese-mythology-ancient-core-ui.json");
const wikiScreenshotPath = path.join(validationDir, "chinese-mythology-ancient-core-wiki.png");
const relationsScreenshotPath = path.join(validationDir, "chinese-mythology-ancient-core-relations.png");
const timelineScreenshotPath = path.join(validationDir, "chinese-mythology-ancient-core-timeline.png");
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
      const managed = (id) => id.includes(":mythology:ancient-core:");
      const managedEntities = data.entities.filter((item) => item.worldId === world.id && managed(item.id));
      const managedRelations = data.relations.filter(
        (item) => item.worldId === world.id && item.id.includes(":mythology:ancient-core:")
      );
      const managedEvents = data.timelineEvents.filter(
        (item) => item.worldId === world.id && item.id.includes(":mythology:ancient-core:")
      );
      return {
        worldId: world.id,
        totalEntities: data.entities.filter((item) => item.worldId === world.id).length,
        managedEntities: managedEntities.length,
        figures: managedEntities.filter((item) => item.type === "character").length,
        locations: managedEntities.filter((item) => item.type === "location").length,
        sources: managedEntities.filter((item) => item.type === "note").length,
        relations: managedRelations.length,
        relationEvidenceComplete: managedRelations.filter(
          (item) => item.evidenceType && item.sourceCitation && item.historicalScope && item.confidence
        ).length,
        timelineEvents: managedEvents.length,
        mythicEvents: managedEvents.filter((item) => item.trackId.endsWith(":mythic-narrative")).length,
        textualEvents: managedEvents.filter((item) => item.trackId.endsWith(":textual-evidence")).length,
        featured: world.wiki?.featuredEntityIds?.length || 0
      };
    }, worldName);

    assert.deepEqual(dataAudit, {
      worldId: "world-chinese-mythology-history",
      totalEntities: 50,
      managedEntities: 42,
      figures: 27,
      locations: 8,
      sources: 7,
      relations: 41,
      relationEvidenceComplete: 41,
      timelineEvents: 20,
      mythicEvents: 14,
      textualEvents: 6,
      featured: 12
    });

    await selectWorld(page);
    await page.locator('.tabbar button[data-label="世界总览"]').click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible", timeout: 60000 });
    await page.getByRole("heading", { name: worldName, exact: true }).waitFor({ timeout: 60000 });
    await page.locator(".wiki-stat-band").getByText("50 篇文章", { exact: true }).waitFor();
    await page.locator(".wiki-stat-band").getByText("20 个历史节点", { exact: true }).waitFor();

    const wikiSearch = page.getByLabel("搜索世界 Wiki");
    await wikiSearch.fill("女娲");
    const nuwaResult = page.locator(".wiki-search-group button").filter({ hasText: "女娲" }).first();
    await nuwaResult.waitFor({ state: "visible", timeout: 60000 });
    await nuwaResult.click();
    await page.locator(".wiki-article h1").getByText("女娲", { exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByRole("heading", { name: "先看早期文字", exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByRole("heading", { name: "造人故事出现得更晚", exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByRole("heading", { name: "原典坐标", exact: true }).waitFor();
    await page.locator(".wiki-fact-sheet").getByText("《楚辞·天问》", { exact: true }).first().waitFor();
    await page.screenshot({ path: wikiScreenshotPath, fullPage: false });

    await openMoreTool(page, "关系图");
    await page.locator(".relation-layout").waitFor({ state: "visible", timeout: 60000 });
    await page.locator(".relation-list-panel").getByText("41 条符合筛选", { exact: true }).waitFor();
    await page.getByLabel("搜索关系").fill("女娲");
    const relationCard = page.locator(".explicit-relation-card").first();
    await relationCard.waitFor({ state: "visible", timeout: 60000 });
    await relationCard.click();
    assert.notEqual(await page.getByLabel("关系证据类型").inputValue(), "unspecified");
    assert.notEqual(await page.getByLabel("关系可信度").inputValue(), "unspecified");
    assert.notEqual((await page.getByLabel("关系原典出处").inputValue()).trim(), "");
    assert.notEqual((await page.getByLabel("关系适用年代").inputValue()).trim(), "");
    await page.screenshot({ path: relationsScreenshotPath, fullPage: false });

    await openMoreTool(page, "时间线");
    await page.locator(".planning-workspace").waitFor({ state: "visible", timeout: 60000 });
    const mythicTrack = page.locator(".timeline-track-browser .planning-item-list button").filter({ hasText: "神话叙事" });
    const textualTrack = page.locator(".timeline-track-browser .planning-item-list button").filter({ hasText: "文献证据" });
    await mythicTrack.waitFor({ state: "visible", timeout: 60000 });
    await textualTrack.waitFor({ state: "visible", timeout: 60000 });
    assert.match((await mythicTrack.textContent()) || "", /14 项/u);
    assert.match((await textualTrack.textContent()) || "", /6 项/u);
    await page.locator(".timeline-track-board").getByText("女娲补天立极", { exact: true }).waitFor();
    await page.locator(".timeline-track-board").getByText("《淮南子》进献朝廷", { exact: true }).waitFor();
    await page.screenshot({ path: timelineScreenshotPath, fullPage: false });

    const report = {
      ok: true,
      generatedAt: new Date().toISOString(),
      world: worldName,
      dataAudit,
      ui: {
        openedArticle: "女娲",
        relationEvidenceVisible: true,
        timelineCountsVisible: { mythic: 14, textual: 6 }
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
