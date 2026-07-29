const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

const { inspectProjectPackage } = require("../electron/project-package.cjs");
const { MAIN_MAP_ID, WORLD_ID, illustratedRecords } = require("./shanhai-case-data.cjs");

const root = path.resolve(__dirname, "..");
const executablePath = require("electron");
const userDataDir = path.join(
  process.env.APPDATA || path.join(process.env.USERPROFILE, "AppData", "Roaming"),
  "worldcraft-codex"
);
const backupDir = path.join(userDataDir, "backups");
const validationDir = path.join(root, "validation");

function rgbChannels(value) {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  assert.equal(channels?.length, 3, `expected an rgb color, received ${value}`);
  return channels;
}

function luminance(color) {
  return rgbChannels(color)
    .map((channel) => channel / 255)
    .map((channel) => channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(first, second) {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

async function openWorkspace(page, name) {
  const button = page.getByRole("button", { name, exact: true });
  if (!(await button.isVisible())) {
    await page.locator(".rail-more > summary").click();
    await button.waitFor({ state: "visible" });
  }
  await button.click();
}

function worldItems(data, collection) {
  return data[collection].filter((item) => item.worldId === WORLD_ID);
}

async function verifyLatestBackup() {
  const candidates = fs.readdirSync(backupDir)
    .filter((name) => name.startsWith("worldcraft-codex-complete-before-shanhai-case-") && name.endsWith(".wcodex"))
    .map((name) => ({ name, path: path.join(backupDir, name), mtime: fs.statSync(path.join(backupDir, name)).mtimeMs }))
    .sort((left, right) => right.mtime - left.mtime);
  assert.ok(candidates.length, "a complete pre-import backup exists");
  const inspected = await inspectProjectPackage({ filePath: candidates[0].path, supportedSchemaVersion: 17 });
  assert.equal(inspected.summary.complete, true, "pre-import backup contains every asset");
  assert.equal(inspected.summary.missingAssetCount, 0, "pre-import backup has no missing assets");
  return { file: candidates[0].path, summary: inspected.summary };
}

async function main() {
  fs.mkdirSync(validationDir, { recursive: true });
  const backup = await verifyLatestBackup();
  const env = {
    ...process.env,
    ELECTRON_START_URL: process.env.ELECTRON_START_URL || "http://localhost:3000",
    WORLDCRAFT_USER_DATA_DIR: userDataDir
  };
  delete env.ELECTRON_RUN_AS_NODE;
  const electronApp = await electron.launch({
    executablePath,
    args: ["."],
    cwd: root,
    env,
    timeout: 45000
  });
  const rendererErrors = [];
  try {
    const page = await electronApp.firstWindow({ timeout: 45000 });
    page.on("console", (message) => {
      if (message.type() === "error") rendererErrors.push(message.text());
    });
    page.on("pageerror", (error) => rendererErrors.push(error.message));
    await page.waitForLoadState("domcontentloaded");
    await page.locator(".compact-save-status").waitFor({ state: "visible", timeout: 45000 });
    await page.waitForFunction(() => document.querySelector(".compact-save-status")?.textContent?.includes("SQLite"));
    await page.locator(".world-title-input").waitFor({ state: "visible" });
    assert.equal(await page.locator(".world-title-input").inputValue(), "山海经 · 原典内容全集");

    const loaded = await page.evaluate(async () => window.worldcraftStore.loadWorkspace());
    assert.ok(loaded?.data, "workspace loads through the desktop IPC bridge");
    const data = loaded.data;
    const maps = worldItems(data, "maps");
    const mapIds = new Set(maps.map((item) => item.id));
    const markers = data.mapMarkers.filter((item) => mapIds.has(item.mapId));
    const caseAssets = worldItems(data, "assets").filter((item) => item.id.startsWith("asset-shanhai-"));
    const illustrationAssets = caseAssets.filter((item) => item.kind === "image");
    assert.equal(worldItems(data, "entities").length, 1914);
    assert.equal(worldItems(data, "entities").filter((item) => item.id.startsWith("entity-shanhai-passage-")).length, 869);
    assert.equal(worldItems(data, "entities").filter((item) => item.id.startsWith("entity-shanhai-index-")).length, 906);
    assert.equal(maps.length, 21, "the main atlas, two indexes, and eighteen volume maps are present");
    assert.equal(markers.length, 73);
    assert.equal(worldItems(data, "mapRoutes").length, 20);
    assert.equal(worldItems(data, "quests").length, 8);
    assert.equal(worldItems(data, "storyScenes").length, 4);
    assert.equal(worldItems(data, "timelineEvents").length, 12);
    assert.equal(worldItems(data, "manuscriptBooks").length, 1, "the case keeps one populated manuscript book");
    const manuscriptVolumes = worldItems(data, "manuscriptVolumes");
    const manuscriptChapters = worldItems(data, "manuscriptChapters");
    assert.equal(
      manuscriptVolumes.length,
      5,
      `the case keeps five populated manuscript volumes; found ${manuscriptVolumes.map((item) => `${item.id} (${item.title})`).join(", ")}`
    );
    assert.equal(
      manuscriptChapters.length,
      18,
      `the complete eighteen-chapter manuscript has no blank legacy chapter; found ${manuscriptChapters.map((item) => `${item.id} (${item.title})`).join(", ")}`
    );
    assert.equal(
      worldItems(data, "manuscriptChapters").filter((item) => item.id.startsWith("manuscript-chapter:milestone-shanhai-")).length,
      0,
      "case production milestones do not leak into the manuscript tree"
    );
    assert.equal(worldItems(data, "aiMemoryItems").length, 15);
    assert.equal(worldItems(data, "relations").length, 37);
    assert.equal(caseAssets.length, 284, "twenty-one map assets and 263 illustrations are imported");
    assert.equal(illustrationAssets.length, illustratedRecords.length);
    assert.deepEqual(
      new Set(illustrationAssets.flatMap((item) => item.linkedEntityIds)),
      new Set(illustratedRecords.map((item) => `entity-shanhai-${item.key}`)),
      "each illustration links to its encyclopedia entry"
    );
    const chapterMaps = maps.filter((item) => item.id.startsWith("map-shanhai-volume-"));
    assert.equal(chapterMaps.length, 18, "each classic volume owns a child map");
    assert.ok(chapterMaps.every((item) => item.parentMapId && item.imageUrl), "each volume map has a parent and a base image");
    assert.equal(new Set(maps.map((item) => item.imageUrl)).size, 21, "all published maps use independent base images");
    assert.equal(data.entities.filter((item) => item.worldId === WORLD_ID && item.slug?.startsWith("classic-")).length, 18);
    const shanhaiWorld = data.worlds.find((item) => item.id === WORLD_ID);
    assert.equal(shanhaiWorld.wiki.coverAssetId, "asset-shanhai-map-base");
    assert.equal(shanhaiWorld.wiki.navigationCategoryIds.length, 7);
    assert.equal(shanhaiWorld.wiki.featuredEntityIds.length, 8);
    assert.equal(shanhaiWorld.wiki.publishedMapIds.length, 21);
    assert.equal(shanhaiWorld.wiki.publishedTimelineTrackIds.length, 4);
    assert.equal(shanhaiWorld.wiki.publishedQuestIds.length, 8);

    const firstPassageTitle = data.entities.find((item) => item.id === "entity-shanhai-passage-nan-shan-001")?.title;
    assert.ok(firstPassageTitle?.startsWith("南山经 001 · "));

    await openWorkspace(page, "世界总览");
    await page.locator(".wiki-workspace").waitFor({ state: "visible" });
    await page.getByRole("heading", { name: "山海经 · 原典内容全集", exact: true }).waitFor();
    await page.waitForFunction(() => {
      const image = document.querySelector(".wiki-world-intro.has-cover img");
      return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
    });
    assert.equal(await page.locator(".wiki-stat-band strong").first().textContent(), "1914");
    assert.equal(await page.locator(".wiki-directory-item").count(), 7);
    assert.equal(await page.getByText("经典卷目", { exact: true }).count(), 1);
    assert.equal(await page.getByText("山海异兽", { exact: true }).count(), 1);
    await page.screenshot({ path: path.join(validationDir, "shanhai-wiki-home.png"), fullPage: false });

    const wikiSearch = page.getByLabel("搜索世界 Wiki", { exact: true });
    await wikiSearch.fill("corpus-nan-shan-001");
    await page.getByRole("heading", { name: "“corpus-nan-shan-001”的搜索结果", exact: true }).waitFor();
    const wikiPassageResult = page.locator(".wiki-search-page .wiki-entry-row").filter({ hasText: firstPassageTitle });
    assert.equal(await wikiPassageResult.count(), 1, "stable passage id is searchable in Wiki mode");
    await wikiPassageResult.click();
    await page.getByRole("heading", { name: firstPassageTitle, exact: true }).waitFor();
    assert.ok((await page.locator(".wiki-rich-content").textContent()).includes("南山经之首曰䧿山"));
    await page.locator(".wiki-viewport").evaluate((element) => {
      element.scrollTop = 0;
      void element.getBoundingClientRect();
    });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(validationDir, "shanhai-wiki-article.png"),
      fullPage: false,
      animations: "disabled"
    });

    await wikiSearch.fill("西王母");
    await page.getByRole("heading", { name: "“西王母”的搜索结果", exact: true }).waitFor();
    await page.locator(".wiki-search-page .wiki-entry-row").filter({ hasText: "西王母" }).first().click();
    await page.getByRole("heading", { name: "西王母", exact: true }).waitFor();
    await page.waitForFunction(() => {
      const image = document.querySelector(".wiki-article-illustration img");
      return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
    });
    assert.equal(await page.locator(".wiki-article-illustration img").getAttribute("alt"), "西王母条目插图");
    await page.screenshot({
      path: path.join(validationDir, "shanhai-wiki-illustrated-article.png"),
      fullPage: false,
      animations: "disabled"
    });

    const previousTheme = await page.locator(".app-shell").getAttribute("data-theme");
    await page.locator(".app-shell").evaluate((element) => element.setAttribute("data-theme", "night"));
    const nightArticleColors = await page.evaluate(() => {
      const color = (selector) => {
        const element = document.querySelector(selector);
        return element ? getComputedStyle(element).color : "";
      };
      return {
        background: getComputedStyle(document.querySelector(".wiki-workspace")).backgroundColor,
        breadcrumb: color(".wiki-breadcrumbs button"),
        summary: color(".wiki-article-heading-copy > p"),
        meta: color(".wiki-article-meta span"),
        factLabel: color(".wiki-fact-sheet dt"),
        factValue: color(".wiki-fact-sheet dd"),
        richText: color(".wiki-rich-content"),
        outlineHeading: color(".wiki-on-this-page > strong"),
        outlineItem: color(".wiki-on-this-page button"),
        articleFactLabel: color(".wiki-article-facts span"),
        articleFactValue: color(".wiki-article-facts b")
      };
    });
    for (const [label, color] of Object.entries(nightArticleColors).filter(([key]) => key !== "background")) {
      assert.ok(color, `night Shan Hai Jing Wiki article exposes ${label}`);
      assert.ok(
        contrastRatio(nightArticleColors.background, color) >= 4.5,
        `night Shan Hai Jing Wiki article ${label} remains readable`
      );
    }
    await page.screenshot({
      path: path.join(validationDir, "shanhai-wiki-night-article.png"),
      fullPage: false,
      animations: "disabled"
    });
    await page.locator(".app-shell").evaluate(
      (element, theme) => element.setAttribute("data-theme", theme || "forest"),
      previousTheme
    );

    await page.getByRole("button", { name: "公开访客", exact: true }).click();
    await page.getByRole("heading", { name: "这个世界尚未向当前身份开放", exact: true }).waitFor();
    assert.equal(await page.locator(".wiki-stat-band").count(), 0, "private world statistics do not leak into visitor preview");
    await page.getByRole("button", { name: "返回作者视图", exact: true }).click();
    await page.getByRole("button", { name: "Wiki 总览设置", exact: true }).click();
    const wikiSettings = page.getByRole("complementary", { name: "Wiki 总览设置", exact: true });
    await wikiSettings.waitFor({ state: "visible" });
    assert.equal(await wikiSettings.getByLabel("Wiki 封面", { exact: true }).inputValue(), "asset-shanhai-map-base");
    assert.equal(await wikiSettings.getByLabel("默认地图", { exact: true }).inputValue(), "map-shanhai-watercolor");
    await wikiSettings.getByRole("button", { name: "关闭设置", exact: true }).click();

    await openWorkspace(page, "知识库");
    const codexSearch = page.getByPlaceholder("搜索人物、地点、事件");
    await codexSearch.fill("");
    const worldCategories = data.codexCategories.filter((item) => item.worldId === WORLD_ID);
    const categoryById = new Map(worldCategories.map((item) => [item.id, item]));
    const rootCategoryCounts = worldCategories
      .filter((item) => !item.parentId)
      .map((root) => ({
        title: root.title,
        count: worldItems(data, "entities").filter((entity) => {
          const seen = new Set();
          let current = categoryById.get(entity.categoryId ?? "");
          while (current && !seen.has(current.id)) {
            if (current.id === root.id) return true;
            seen.add(current.id);
            current = categoryById.get(current.parentId);
          }
          return false;
        }).length
      }));
    const displayedRootCounts = await page
      .locator(".codex-tree-scroll > .codex-tree-branch > .codex-tree-category")
      .evaluateAll((rows) =>
        Object.fromEntries(
          rows.map((row) => [
            row.querySelector(".codex-tree-category-title")?.textContent?.trim() ?? "",
            Number(row.querySelector("small")?.textContent ?? -1)
          ])
        )
      );
    rootCategoryCounts.forEach(({ title, count }) => {
      assert.equal(displayedRootCounts[title], count, `${title} displays its recursive entry count`);
    });
    await page.locator(".entity-browser").screenshot({
      path: path.join(validationDir, "shanhai-codex-sidebar.png")
    });
    await page
      .locator(".entity-browser")
      .getByRole("button", { name: "创建条目", exact: true })
      .click();
    const createDialog = page.getByRole("dialog", { name: "新建内容", exact: true });
    await createDialog.waitFor({ state: "visible" });
    const characterKind = createDialog.getByRole("button", { name: "角色", exact: true });
    assert.equal(await characterKind.count(), 1, "create dialog exposes the character content type");
    await characterKind.click();
    const templateSearch = createDialog.getByLabel("搜索条目模板", { exact: true });
    assert.equal(await templateSearch.count(), 1, "create dialog exposes template search");
    await templateSearch.fill("神祇");
    assert.equal(
      await createDialog.getByText("神祇与超凡存在", { exact: true }).count(),
      1,
      "specialized character templates are searchable"
    );
    await createDialog.screenshot({
      path: path.join(validationDir, "worldanvil-aligned-create-dialog.png")
    });
    await createDialog.getByRole("button", { name: "关闭", exact: true }).click();
    await codexSearch.fill("corpus-nan-shan-001");
    await page.getByText(firstPassageTitle, { exact: true }).click();
    await page.waitForFunction((title) => document.querySelector(".entity-title-input")?.value === title, firstPassageTitle);
    assert.ok((await page.locator("[data-reference-path='content']").textContent()).includes("南山经之首曰䧿山"));
    await page.screenshot({ path: path.join(validationDir, "shanhai-corpus-reader.png"), fullPage: false });

    await openWorkspace(page, "地图");
    await page.getByRole("heading", { name: "山海异兽总图", exact: true }).waitFor({ timeout: 30000 });
    const mapSelect = page.getByLabel("当前地图", { exact: true });
    assert.equal(await mapSelect.locator("option").count(), 21);
    const optionLabels = await mapSelect.locator("option").allTextContents();
    assert.ok(optionLabels.some((label) => label.includes("五藏山经索引图")));
    assert.ok(optionLabels.some((label) => label.includes("海内海外与大荒索引图")));
    assert.ok(optionLabels.some((label) => label.includes("南山经")));
    assert.ok(optionLabels.some((label) => label.includes("海内经")));
    await page.waitForFunction(() => Array.from(document.querySelectorAll(".map-layer-image")).filter((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0).length >= 8, undefined, { timeout: 30000 });

    await mapSelect.selectOption("map-shanhai-five-classics");
    await page.getByRole("heading", { name: "五藏山经索引图", exact: true }).waitFor();
    assert.equal(await page.locator(".map-region-layer [data-region-id^='region-shanhai-']").count(), 5);
    assert.equal(await page.getByRole("button", { name: /^地图标记 (南山经|西山经|北山经|东山经|中山经) · / }).count(), 5);
    await page.getByRole("button", { name: "最大化地图工作区", exact: true }).click();
    const mapDialog = page.getByRole("dialog", { name: "五藏山经索引图", exact: true });
    await mapDialog.waitFor({ state: "visible" });
    await mapDialog.screenshot({ path: path.join(validationDir, "shanhai-case-map.png") });
    await mapDialog.getByRole("button", { name: "退出地图专注模式", exact: true }).click();

    await openWorkspace(page, "剧情");
    await page.getByRole("button", { name: "正文", exact: true }).click();
    await page.getByRole("heading", { name: "小说正文与章节", exact: true }).waitFor();
    const manuscriptTree = page.getByRole("tree", { name: "书稿结构", exact: true });
    await manuscriptTree.waitFor({ state: "visible" });
    assert.ok(await manuscriptTree.getByText("禹迹山海录", { exact: true }).isVisible());
    assert.ok(await manuscriptTree.getByText("第1章 南山初见", { exact: true }).isVisible());
    assert.ok(await manuscriptTree.getByText("第18章 禹终布土", { exact: true }).isVisible());
    assert.ok((await page.locator(".manuscript-chapter-tree").count()) >= 18);
    await manuscriptTree.getByText("第1章 南山初见", { exact: true }).click();
    await page.waitForFunction(() => document.querySelector(".manuscript-title-line input")?.value === "第1章 南山初见");
    await page.screenshot({ path: path.join(validationDir, "shanhai-case-manuscript.png"), fullPage: false });

    await openWorkspace(page, "AI 工具");
    await page.getByRole("button", { name: "剧情写作", exact: true }).click();
    await page.getByRole("group", { name: "AI 写作资料", exact: true }).getByRole("button", { name: /^记忆/ }).click();
    await page.getByLabel("搜索长期记忆", { exact: true }).waitFor();
    assert.ok(await page.getByText("原典全集资料边界", { exact: true }).isVisible());
    assert.ok(await page.getByText("穷奇形貌分层", { exact: true }).isVisible());
    assert.ok((await page.locator(".ai-story-list > button").count()) >= 15);
    await page.screenshot({ path: path.join(validationDir, "shanhai-case-ai-memory.png"), fullPage: false });

    assert.deepEqual(rendererErrors, [], `renderer has no errors: ${rendererErrors.join(" | ")}`);
    console.log(JSON.stringify({
      ok: true,
      world: "山海经 · 原典内容全集",
      backup,
      counts: {
        entries: 1914,
        sourcePassages: 869,
        indexEntries: 906,
        classicVolumes: 18,
        maps: 21,
        mapRoutes: 20,
        quests: 8,
        storyScenes: 4,
        timelineEvents: 12,
        manuscriptBooks: 1,
        manuscriptVolumes: 5,
        manuscriptChapters: 18,
        aiMemories: 15,
        relations: 37,
        visualAssets: 284
      },
      screenshots: [
        path.join(validationDir, "shanhai-codex-sidebar.png"),
        path.join(validationDir, "shanhai-wiki-home.png"),
        path.join(validationDir, "shanhai-wiki-article.png"),
        path.join(validationDir, "shanhai-wiki-illustrated-article.png"),
        path.join(validationDir, "shanhai-wiki-night-article.png"),
        path.join(validationDir, "worldanvil-aligned-create-dialog.png"),
        path.join(validationDir, "shanhai-corpus-reader.png"),
        path.join(validationDir, "shanhai-case-map.png"),
        path.join(validationDir, "shanhai-case-manuscript.png"),
        path.join(validationDir, "shanhai-case-ai-memory.png")
      ]
    }, null, 2));
  } finally {
    await electronApp.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
