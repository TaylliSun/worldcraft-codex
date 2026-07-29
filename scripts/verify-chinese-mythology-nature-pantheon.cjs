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
const reportPath = path.join(validationDir, "chinese-mythology-nature-pantheon-ui.json");
const wikiScreenshotPath = path.join(validationDir, "chinese-mythology-nature-pantheon-wiki.png");
const relationsScreenshotPath = path.join(validationDir, "chinese-mythology-nature-pantheon-relations.png");
const timelineScreenshotPath = path.join(validationDir, "chinese-mythology-nature-pantheon-timeline.png");
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
      const natureEntities = data.entities.filter(
        (item) => item.worldId === world.id && item.id.includes(":mythology:nature-pantheon:")
      );
      const natureRelations = data.relations.filter(
        (item) => item.worldId === world.id && item.id.includes(":mythology:nature-pantheon:")
      );
      const natureEvents = data.timelineEvents.filter(
        (item) => item.worldId === world.id && item.id.includes(":mythology:nature-pantheon:")
      );
      const managedEntity = (id) => id.includes(":mythology:");
      const managedRelation = (id) => id.includes(":mythology:ancient-core:") || id.includes(":mythology:nature-pantheon:");
      const managedEvent = (id) => id.includes(":mythology:ancient-core:") || id.includes(":mythology:nature-pantheon:");
      return {
        worldId: world.id,
        totalEntities: data.entities.filter((item) => item.worldId === world.id).length,
        natureEntities: natureEntities.length,
        figures: natureEntities.filter((item) => item.type === "character").length,
        locations: natureEntities.filter((item) => item.type === "location").length,
        sources: natureEntities.filter((item) => item.type === "note").length,
        natureRelations: natureRelations.length,
        relationEvidenceComplete: natureRelations.filter(
          (item) => item.evidenceType && item.sourceCitation && item.historicalScope && item.confidence
        ).length,
        natureEvents: natureEvents.length,
        cumulativeManaged: {
          entities: data.entities.filter((item) => item.worldId === world.id && managedEntity(item.id)).length,
          relations: data.relations.filter((item) => item.worldId === world.id && managedRelation(item.id)).length,
          events: data.timelineEvents.filter((item) => item.worldId === world.id && managedEvent(item.id)).length
        },
        tracks: Object.fromEntries(data.timelineTracks
          .filter((track) => track.worldId === world.id)
          .map((track) => [track.name, data.timelineEvents.filter((event) => event.trackId === track.id).length])),
        featured: world.wiki?.featuredEntityIds?.length || 0
      };
    }, worldName);

    assert.deepEqual(dataAudit, {
      worldId: "world-chinese-mythology-history",
      totalEntities: 108,
      natureEntities: 58,
      figures: 45,
      locations: 7,
      sources: 6,
      natureRelations: 107,
      relationEvidenceComplete: 107,
      natureEvents: 22,
      cumulativeManaged: { entities: 108, relations: 148, events: 42 },
      tracks: {
        "神话叙事": 28,
        "文献证据": 12,
        "宗教与礼制制度": 2,
        "信仰演变与合流": 0
      },
      featured: 12
    });

    await selectWorld(page);
    await page.locator('.tabbar button[data-label="世界总览"]').click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible", timeout: 60000 });
    await page.getByRole("heading", { name: worldName, exact: true }).waitFor({ timeout: 60000 });
    await page.locator(".wiki-stat-band").getByText("108 篇文章", { exact: true }).waitFor();
    await page.locator(".wiki-stat-band").getByText("42 个历史节点", { exact: true }).waitFor();

    const wikiSearch = page.getByLabel("搜索世界 Wiki");
    await wikiSearch.fill("太一");
    await page.locator(".wiki-search-group button strong").getByText("东皇太一", { exact: true }).waitFor();
    await page.locator(".wiki-search-group button strong").getByText("太一（汉代祀典）", { exact: true }).waitFor();
    await wikiSearch.fill("句芒");
    const goumangResult = page.locator(".wiki-search-group button").filter({
      has: page.locator("strong").getByText("句芒", { exact: true })
    });
    await goumangResult.waitFor({ state: "visible", timeout: 60000 });
    await goumangResult.click();
    await page.locator(".wiki-article h1").getByText("句芒", { exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByRole("heading", { name: "神名也是官名", exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByText("句芒首先是一项可由人物担任的职掌", { exact: false }).waitFor();
    await page.locator(".wiki-fact-sheet").getByText("《左传·昭公二十九年》；《礼记·月令》", { exact: true }).waitFor();
    await page.screenshot({ path: wikiScreenshotPath, fullPage: false });

    await openMoreTool(page, "关系图");
    await page.locator(".relation-layout").waitFor({ state: "visible", timeout: 60000 });
    await page.locator(".relation-list-panel").getByText("148 条符合筛选", { exact: true }).waitFor();
    await page.getByLabel("搜索关系").fill("句芒");
    const officeRelation = page.locator(".explicit-relation-card").filter({ hasText: "担任木正句芒" });
    await officeRelation.waitFor({ state: "visible", timeout: 60000 });
    await officeRelation.click();
    assert.equal(await page.getByLabel("关系证据类型").inputValue(), "historical-record");
    assert.equal(await page.getByLabel("关系可信度").inputValue(), "certain");
    assert.match(await page.getByLabel("关系原典出处").inputValue(), /左传/u);
    assert.match(await page.getByLabel("关系适用年代").inputValue(), /先秦/u);
    await page.screenshot({ path: relationsScreenshotPath, fullPage: false });

    await openMoreTool(page, "时间线");
    await page.locator(".planning-workspace").waitFor({ state: "visible", timeout: 60000 });
    const trackButtons = page.locator(".timeline-track-browser .planning-item-list button");
    assert.match((await trackButtons.filter({ hasText: "神话叙事" }).textContent()) || "", /28 项/u);
    assert.match((await trackButtons.filter({ hasText: "文献证据" }).textContent()) || "", /12 项/u);
    assert.match((await trackButtons.filter({ hasText: "宗教与礼制制度" }).textContent()) || "", /2 项/u);
    await page.locator(".timeline-track-board").getByText("五方帝神进入季令循环", { exact: true }).waitFor();
    await page.locator(".timeline-track-board").getByText("汉武帝建太一坛并亲郊", { exact: true }).waitFor();
    await page.screenshot({ path: timelineScreenshotPath, fullPage: false });

    const report = {
      ok: true,
      generatedAt: new Date().toISOString(),
      world: worldName,
      dataAudit,
      ui: {
        disambiguationSearchVisible: ["东皇太一", "太一（汉代祀典）"],
        openedArticle: "句芒",
        officeRelationEvidenceVisible: true,
        timelineCountsVisible: { mythic: 28, textual: 12, institutional: 2 }
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
