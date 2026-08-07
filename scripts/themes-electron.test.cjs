const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

const root = path.resolve(__dirname, "..");
const runRoot = path.join(root, "validation", `themes-electron-${process.pid}`);
const userDataDir = path.join(runRoot, "user-data");
const executablePath = require("electron");

fs.rmSync(runRoot, { recursive: true, force: true });
fs.mkdirSync(runRoot, { recursive: true });

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

async function findLargeWhiteSurfaces(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll("body *"))
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width * rect.height > 10000 &&
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        style.backgroundColor === "rgb(255, 255, 255)";
    })
    .map((element) => ({
      className: element.className,
      tagName: element.tagName
    })));
}

async function selectTheme(page, label, id) {
  await page.getByLabel("切换界面主题", { exact: true }).click();
  const option = page.getByRole("radio", { name: new RegExp(`^${label}`) });
  await option.click();
  await page.locator(".app-shell").waitFor({ state: "visible" });
  await page.waitForFunction(
    (themeId) => document.querySelector(".app-shell")?.getAttribute("data-theme") === themeId,
    id
  );
}

async function main() {
  const env = {
    ...process.env,
    WORLDCRAFT_USER_DATA_DIR: userDataDir
  };
  delete env.ELECTRON_RUN_AS_NODE;

  const app = await electron.launch({
    executablePath,
    args: ["."],
    cwd: root,
    env,
    timeout: 45000
  });
  const rendererErrors = [];

  try {
    const page = await app.firstWindow({ timeout: 45000 });
    page.on("console", (message) => {
      if (message.type() === "error") rendererErrors.push(message.text());
    });
    page.on("pageerror", (error) => rendererErrors.push(error.message));

    await page.setViewportSize({ width: 1440, height: 920 });
    await page.waitForLoadState("domcontentloaded");
    await page.locator(".app-shell").waitFor({ state: "visible", timeout: 45000 });
    await page.waitForFunction(() =>
      Boolean(document.querySelector("[role='dialog'][aria-label='选择项目起步包']")) ||
      Boolean(document.querySelector(".compact-save-status")?.textContent?.includes("SQLite"))
    );

    const starterDialog = page.getByRole("dialog", { name: "选择项目起步包", exact: true });
    if (await starterDialog.isVisible()) {
      await starterDialog.getByRole("radio").first().click();
      await starterDialog.getByRole("button", { name: "进入创作台", exact: true }).click();
      await starterDialog.waitFor({ state: "hidden", timeout: 45000 });
    }

    const initialBackground = await page.locator(".workspace").evaluate(
      (element) => getComputedStyle(element).backgroundColor
    );

    const themes = [
      ["宣纸", "paper"],
      ["海雾", "ocean"],
      ["梅影", "plum"],
      ["夜航", "night"],
      ["松墨", "forest"]
    ];
    const observedBackgrounds = new Set([initialBackground]);

    for (const [label, id] of themes) {
      await selectTheme(page, label, id);
      observedBackgrounds.add(await page.locator(".workspace").evaluate(
        (element) => getComputedStyle(element).backgroundColor
      ));
      assert.equal(
        await page.evaluate(() => localStorage.getItem("worldcraft-codex-app-theme-v1")),
        id
      );
    }

    assert.equal(observedBackgrounds.size, 5, "each theme should expose a distinct workspace surface");

    await selectTheme(page, "夜航", "night");
    const nightColors = await page.evaluate(() => {
      const workspace = getComputedStyle(document.querySelector(".workspace"));
      const topbar = getComputedStyle(document.querySelector(".topbar"));
      const panel = document.querySelector(".panel");
      return {
        background: workspace.backgroundColor,
        foreground: workspace.color,
        topbar: topbar.backgroundColor,
        panel: panel ? getComputedStyle(panel).backgroundColor : ""
      };
    });
    assert.ok(contrastRatio(nightColors.background, nightColors.foreground) >= 7);
    assert.notEqual(nightColors.topbar, "rgb(255, 255, 255)");
    if (nightColors.panel) assert.notEqual(nightColors.panel, "rgb(255, 255, 255)");
    const authorColors = await page.evaluate(() => {
      const workspace = document.querySelector(".author-workspace");
      const writing = document.querySelector(".author-current-writing");
      const primaryAction = document.querySelector(".author-quick-actions button:first-child");
      return {
        background: workspace ? getComputedStyle(workspace).backgroundColor : "",
        foreground: workspace ? getComputedStyle(workspace).color : "",
        writing: writing ? getComputedStyle(writing).backgroundColor : "",
        actionBackground: primaryAction ? getComputedStyle(primaryAction).backgroundColor : "",
        actionText: primaryAction ? getComputedStyle(primaryAction).color : ""
      };
    });
    assert.ok(contrastRatio(authorColors.background, authorColors.foreground) >= 7);
    assert.ok(contrastRatio(authorColors.actionBackground, authorColors.actionText) >= 4.5);
    assert.notEqual(authorColors.writing, "rgb(255, 255, 255)");
    assert.deepEqual(await findLargeWhiteSurfaces(page), []);
    await page.screenshot({
      path: path.join(runRoot, "theme-night-author.png"),
      animations: "disabled"
    });

    await page.getByRole("button", { name: "知识库", exact: true }).click();
    await page.locator(".entity-browser").waitFor({ state: "visible" });
    const treeColors = await page.evaluate(() => {
      const browser = getComputedStyle(document.querySelector(".entity-browser"));
      const domain = getComputedStyle(document.querySelector(".codex-tree-domain-links > button"));
      const category = getComputedStyle(document.querySelector(".codex-tree-category-title"));
      const count = getComputedStyle(document.querySelector(".codex-tree-category small"));
      return {
        background: browser.backgroundColor,
        domain: domain.color,
        category: category.color,
        count: count.color
      };
    });
    assert.ok(contrastRatio(treeColors.background, treeColors.domain) >= 7);
    assert.ok(contrastRatio(treeColors.background, treeColors.category) >= 7);
    assert.ok(contrastRatio(treeColors.background, treeColors.count) >= 4.5);

    await page.screenshot({
      path: path.join(runRoot, "theme-night.png"),
      animations: "disabled"
    });

    assert.deepEqual(await findLargeWhiteSurfaces(page), []);

    await page.getByRole("button", { name: "AI 工具", exact: true }).click();
    await page.locator(".ai-workspace").waitFor({ state: "visible" });
    assert.deepEqual(await findLargeWhiteSurfaces(page), []);
    await page.screenshot({
      path: path.join(runRoot, "theme-night-ai.png"),
      animations: "disabled"
    });
    await page.getByRole("button", { name: "剧情写作", exact: true }).click();
    await page.locator(".ai-story-layout").waitFor({ state: "visible" });
    assert.deepEqual(await findLargeWhiteSurfaces(page), []);
    await page.screenshot({
      path: path.join(runRoot, "theme-night-ai-story.png"),
      animations: "disabled"
    });

    await page.getByRole("button", { name: "剧情", exact: true }).click();
    await page.getByRole("button", { name: "正文", exact: true }).click();
    await page.locator(".manuscript-shell").waitFor({ state: "visible" });
    assert.deepEqual(await findLargeWhiteSurfaces(page), []);
    const manuscriptTheme = await page.evaluate(() => ({
      selectedChapter: getComputedStyle(document.querySelector(".manuscript-chapter-tree > button.is-active")).backgroundColor,
      selectedTheme: getComputedStyle(document.querySelector(".app-shell")).getPropertyValue("--theme-selected").trim()
    }));
    assert.notEqual(manuscriptTheme.selectedChapter, "rgb(230, 241, 236)");
    await page.screenshot({
      path: path.join(runRoot, "theme-night-manuscript.png"),
      animations: "disabled"
    });

    await page.getByRole("button", { name: "任务线", exact: true }).click();
    await page.locator(".quest-workspace").waitFor({ state: "visible" });
    assert.deepEqual(await findLargeWhiteSurfaces(page), []);
    await page.screenshot({
      path: path.join(runRoot, "theme-night-quests.png"),
      animations: "disabled"
    });
    const relationOpenStartedAt = Date.now();
    await page.getByRole("button", { name: "关系图谱", exact: true }).click();
    await page.locator(".relation-layout").waitFor({ state: "visible" });
    assert.ok(Date.now() - relationOpenStartedAt < 2000, "relationship atlas should open without blocking the UI");
    assert.deepEqual(await findLargeWhiteSurfaces(page), []);
    await page.screenshot({
      path: path.join(runRoot, "theme-night-relations.png"),
      animations: "disabled"
    });
    await page.getByRole("button", { name: "地图", exact: true }).click();
    await page.locator(".map-planning-viewport").waitFor({ state: "visible" });
    assert.equal(await page.locator(".map-planning-stage").evaluate(
      (element) => getComputedStyle(element).borderTopWidth
    ), "0px");
    assert.equal(await page.locator(".map-canvas-origin").count(), 1);
    const mapSelectionTheme = await page.evaluate(() => {
      const shell = document.querySelector(".app-shell");
      const selected = document.querySelector(".planning-virtual-row > button.is-active, .planning-item-list > button.is-active");
      const probe = document.createElement("span");
      probe.style.background = "var(--theme-selected)";
      shell?.append(probe);
      const expected = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return {
        expected,
        selected: selected ? getComputedStyle(selected).backgroundColor : ""
      };
    });
    assert.equal(mapSelectionTheme.selected, mapSelectionTheme.expected);
    assert.deepEqual(await findLargeWhiteSurfaces(page), []);
    await page.screenshot({
      path: path.join(runRoot, "theme-night-map-unbounded.png"),
      animations: "disabled"
    });
    await page.getByRole("button", { name: "最大化地图工作区", exact: true }).click();
    await page.locator(".planning-workspace.is-map-fullscreen").waitFor({ state: "visible" });
    assert.deepEqual(await findLargeWhiteSurfaces(page), []);
    assert.notEqual(
      await page.locator(".map-label-placement-control").evaluate((element) => getComputedStyle(element).backgroundColor),
      "rgb(245, 248, 246)"
    );
    await page.screenshot({
      path: path.join(runRoot, "theme-night-map-fullscreen.png"),
      animations: "disabled"
    });
    await page.getByRole("button", { name: "退出地图专注模式", exact: true }).click();

    await page.locator(".tabbar").getByRole("button", { name: "世界总览", exact: true }).click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible" });
    assert.deepEqual(await findLargeWhiteSurfaces(page), []);
    const activeWikiSurfaces = await page.evaluate(() => ({
      navigation: getComputedStyle(document.querySelector(".wiki-toolbar-nav button.is-active")).backgroundColor,
      audience: getComputedStyle(document.querySelector(".wiki-audience-switch button.is-active")).backgroundColor
    }));
    assert.notEqual(activeWikiSurfaces.navigation, "rgb(255, 255, 255)");
    assert.notEqual(activeWikiSurfaces.audience, "rgb(255, 255, 255)");
    await page.screenshot({
      path: path.join(runRoot, "theme-night-wiki.png"),
      animations: "disabled"
    });

    const firstWikiEntry = page.locator(".wiki-entry-row").first();
    await firstWikiEntry.waitFor({ state: "visible" });
    await firstWikiEntry.click();
    await page.locator(".wiki-article").waitFor({ state: "visible" });
    const wikiArticleColors = await page.evaluate(() => {
      const color = (selector) => {
        const element = document.querySelector(selector);
        return element ? getComputedStyle(element).color : "";
      };
      const editButton = document.querySelector(".wiki-edit-target");
      return {
        background: getComputedStyle(document.querySelector(".wiki-workspace")).backgroundColor,
        breadcrumb: color(".wiki-breadcrumbs button"),
        summary: color(".wiki-article-heading-copy > p"),
        meta: color(".wiki-article-meta span"),
        richText: color(".wiki-rich-content"),
        factLabel: color(".wiki-article-facts span"),
        factValue: color(".wiki-article-facts b"),
        editBackground: editButton ? getComputedStyle(editButton).backgroundColor : "",
        editText: editButton ? getComputedStyle(editButton).color : ""
      };
    });
    for (const key of ["breadcrumb", "summary", "meta", "richText", "factLabel", "factValue"]) {
      assert.ok(wikiArticleColors[key], `night Wiki article exposes ${key}`);
      assert.ok(
        contrastRatio(wikiArticleColors.background, wikiArticleColors[key]) >= 4.5,
        `night Wiki article ${key} remains readable`
      );
    }
    assert.ok(contrastRatio(wikiArticleColors.editBackground, wikiArticleColors.editText) >= 4.5);
    await page.screenshot({
      path: path.join(runRoot, "theme-night-wiki-article.png"),
      animations: "disabled"
    });

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.querySelector(".app-shell")?.getAttribute("data-theme") === "night"
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.style.colorScheme),
      "dark"
    );

    await selectTheme(page, "宣纸", "paper");
    await page.getByLabel("切换界面主题", { exact: true }).click();
    const menuBounds = await page.locator(".app-theme-popover").boundingBox();
    assert.ok(menuBounds);
    assert.ok(menuBounds.x >= 0 && menuBounds.x + menuBounds.width <= 1440);
    assert.equal(await page.getByRole("radio").count(), 5);
    await page.screenshot({
      path: path.join(runRoot, "theme-paper.png"),
      animations: "disabled"
    });

    await page.locator(".app-theme-menu > summary").click();
    await page.locator(".tabbar").getByRole("button", { name: "世界总览", exact: true }).click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible" });
    await page.screenshot({
      path: path.join(runRoot, "theme-paper-wiki.png"),
      animations: "disabled"
    });

    await page.setViewportSize({ width: 820, height: 900 });
    await page.screenshot({
      path: path.join(runRoot, "theme-paper-wiki-narrow.png"),
      animations: "disabled"
    });

    assert.deepEqual(rendererErrors, [], `renderer has no errors: ${rendererErrors.join(" | ")}`);
    console.log(JSON.stringify({
      ok: true,
      themes: themes.map(([, id]) => id),
      nightContrast: contrastRatio(nightColors.background, nightColors.foreground),
      screenshots: [
        path.join(runRoot, "theme-night-author.png"),
        path.join(runRoot, "theme-night.png"),
        path.join(runRoot, "theme-night-ai.png"),
        path.join(runRoot, "theme-night-ai-story.png"),
        path.join(runRoot, "theme-night-manuscript.png"),
        path.join(runRoot, "theme-night-quests.png"),
        path.join(runRoot, "theme-night-relations.png"),
        path.join(runRoot, "theme-night-map-unbounded.png"),
        path.join(runRoot, "theme-night-map-fullscreen.png"),
        path.join(runRoot, "theme-night-wiki.png"),
        path.join(runRoot, "theme-night-wiki-article.png"),
        path.join(runRoot, "theme-paper.png"),
        path.join(runRoot, "theme-paper-wiki.png"),
        path.join(runRoot, "theme-paper-wiki-narrow.png")
      ]
    }, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
