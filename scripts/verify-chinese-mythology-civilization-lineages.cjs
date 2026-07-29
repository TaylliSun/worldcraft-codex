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
const reportPath = path.join(validationDir, "chinese-mythology-civilization-lineages-ui.json");
const wikiScreenshotPath = path.join(validationDir, "chinese-mythology-civilization-lineages-wiki.png");
const relationsScreenshotPath = path.join(validationDir, "chinese-mythology-civilization-lineages-relations.png");
const timelineScreenshotPath = path.join(validationDir, "chinese-mythology-civilization-lineages-timeline.png");
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
      const batchMarker = ":mythology:civilization-lineages:";
      const managedMarkers = [
        ":mythology:ancient-core:",
        ":mythology:nature-pantheon:",
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
          locations: batchEntities.filter((item) => item.type === "location").length,
          sources: batchEntities.filter((item) => item.type === "note").length,
          relations: batchRelations.length,
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
      entities: 63,
      figures: 43,
      locations: 10,
      sources: 10,
      relations: 188,
      relationEvidenceComplete: 188,
      events: 22
    });
    assert.deepEqual(dataAudit.cumulativeManaged, { entities: 171, relations: 336, events: 64 });
    assert.deepEqual(dataAudit.tracks, {
      "神话叙事": 40,
      "文献证据": 20,
      "宗教与礼制制度": 3,
      "信仰演变与合流": 1
    });
    assert.equal(dataAudit.featured, 12);

    await selectWorld(page);
    await page.locator('.tabbar button[data-label="世界总览"]').click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible", timeout: 60000 });
    await page.getByRole("heading", { name: worldName, exact: true }).waitFor({ timeout: 60000 });
    await page.locator(".wiki-stat-band").getByText("171 篇文章", { exact: true }).waitFor();
    await page.locator(".wiki-stat-band").getByText("64 个历史节点", { exact: true }).waitFor();

    const wikiSearch = page.getByLabel("搜索世界 Wiki");
    await wikiSearch.fill("羲仲");
    await (await exactWikiResult(page, "羲仲")).waitFor({ state: "visible", timeout: 60000 });
    await wikiSearch.fill("奚仲");
    await (await exactWikiResult(page, "奚仲")).waitFor({ state: "visible", timeout: 60000 });
    await wikiSearch.fill("夔");
    await (await exactWikiResult(page, "夔")).waitFor({ state: "visible", timeout: 60000 });
    await (await exactWikiResult(page, "夔（舜廷乐官）")).waitFor({ state: "visible", timeout: 60000 });
    await wikiSearch.fill("后稷");
    const houjiResult = await exactWikiResult(page, "后稷（弃）");
    await houjiResult.waitFor({ state: "visible", timeout: 60000 });
    await houjiResult.click();
    await page.locator(".wiki-article h1").getByText("后稷（弃）", { exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByRole("heading", { name: "从弃儿到农师", exact: true }).waitFor();
    await page.locator(".wiki-rich-content").getByText("被弃的婴儿因而名弃", { exact: false }).waitFor();
    await page.locator(".wiki-fact-sheet").getByText("《诗经·大雅·生民》", { exact: false }).first().waitFor();
    await page.screenshot({ path: wikiScreenshotPath, fullPage: false });

    await openMoreTool(page, "关系图");
    await page.locator(".relation-layout").waitFor({ state: "visible", timeout: 60000 });
    await page.locator(".relation-list-panel").getByText("336 条符合筛选", { exact: true }).waitFor();
    await page.getByLabel("搜索关系").fill("羲仲");
    const disambiguationRelation = page.locator(".explicit-relation-card").filter({
      hasText: "羲仲与奚仲音近异人"
    });
    await disambiguationRelation.waitFor({ state: "visible", timeout: 60000 });
    await disambiguationRelation.click();
    await page.waitForTimeout(500);
    const relationDebug = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const raw = loaded.data.relations.find((item) => item.id.endsWith(":xizhong-name-conflict"));
      const activeCard = document.querySelector(".explicit-relation-card.is-active");
      const editor = document.querySelector('[aria-label="关系证据类型"]');
      return {
        raw: raw ? {
          id: raw.id,
          label: raw.label,
          evidenceType: raw.evidenceType,
          sourceCitation: raw.sourceCitation
        } : null,
        activeCard: activeCard?.textContent?.replace(/\s+/g, " ").trim() || "",
        editorValue: editor?.value || ""
      };
    });
    if (relationDebug.editorValue !== "textual-variant") {
      throw new Error(`关系证据 UI 未保留传本异文：${JSON.stringify(relationDebug)}`);
    }
    assert.equal(await page.getByLabel("关系证据类型").inputValue(), "textual-variant");
    assert.equal(await page.getByLabel("关系可信度").inputValue(), "certain");
    assert.match(await page.getByLabel("关系原典出处").inputValue(), /尚书.*吕氏春秋/u);
    assert.match(await page.getByLabel("关系适用年代").inputValue(), /先秦/u);
    await page.screenshot({ path: relationsScreenshotPath, fullPage: false });

    await openMoreTool(page, "时间线");
    await page.locator(".planning-workspace").waitFor({ state: "visible", timeout: 60000 });
    const trackButtons = page.locator(".timeline-track-browser .planning-item-list button");
    assert.match((await trackButtons.filter({ hasText: "神话叙事" }).textContent()) || "", /40 项/u);
    assert.match((await trackButtons.filter({ hasText: "文献证据" }).textContent()) || "", /20 项/u);
    assert.match((await trackButtons.filter({ hasText: "宗教与礼制制度" }).textContent()) || "", /3 项/u);
    assert.match((await trackButtons.filter({ hasText: "信仰演变与合流" }).textContent()) || "", /1 项/u);
    await page.locator(".timeline-track-board").getByText("羲和四官分赴四方校定春夏秋冬", { exact: true }).waitFor();
    await page.locator(".timeline-track-board").getByText("《生民》保存姜嫄与后稷祭歌", { exact: true }).waitFor();
    await page.screenshot({ path: timelineScreenshotPath, fullPage: false });

    const report = {
      ok: true,
      generatedAt: new Date().toISOString(),
      world: worldName,
      dataAudit,
      ui: {
        wikiCountsVisible: { articles: 171, timelineEvents: 64 },
        disambiguationSearchVisible: ["羲仲", "奚仲", "夔", "夔（舜廷乐官）"],
        openedArticle: "后稷（弃）",
        evidenceRelationVisible: "羲仲与奚仲音近异人",
        timelineCountsVisible: { mythic: 40, textual: 20, institutional: 3, evolution: 1 }
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
