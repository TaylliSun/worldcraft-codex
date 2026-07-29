const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

const root = path.resolve(__dirname, "..");
const runRoot = path.join(root, "validation", `wiki-electron-${process.pid}`);
const userDataDir = path.join(runRoot, "user-data");
const wikiExportDir = path.join(runRoot, "offline-wiki-public");
const executablePath = require("electron");
fs.rmSync(runRoot, { recursive: true, force: true });
fs.mkdirSync(runRoot, { recursive: true });

async function main() {
  const env = {
    ...process.env,
    WORLDCRAFT_USER_DATA_DIR: userDataDir,
    WORLDCRAFT_WIKI_EXPORT_DIR: wikiExportDir
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
    await page.waitForLoadState("domcontentloaded");
    await page.locator(".compact-save-status").waitFor({ state: "visible", timeout: 45000 });
    await page.waitForFunction(() => Boolean(window.worldcraftStore?.loadWorkspace));
    await page.locator(".world-title-input").waitFor({ state: "visible", timeout: 45000 });
    await page.waitForFunction(() =>
      Boolean(document.querySelector("[role='dialog'][aria-label='选择项目起步包']")) ||
      Boolean(document.querySelector(".compact-save-status")?.textContent?.includes("SQLite"))
    );
    const starterDialog = page.getByRole("dialog", { name: "选择项目起步包", exact: true });
    if (await starterDialog.isVisible()) {
      await starterDialog.getByRole("radio", { name: /游戏叙事/ }).click();
      await starterDialog.getByRole("button", { name: "进入创作台", exact: true }).click();
    }
    await page.waitForFunction(
      async () => Boolean((await window.worldcraftStore.loadWorkspace())?.data),
      undefined,
      { timeout: 45000 }
    );
    await page.waitForFunction(
      () => document.querySelector(".compact-save-status")?.textContent?.includes("已保存到 SQLite"),
      undefined,
      { timeout: 45000 }
    );
    await page.waitForTimeout(800);

    const fixture = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const data = loaded.data;
      const world = data.worlds[0];
      const worldId = world.id;
      const now = "2026-07-17T08:00:00.000Z";
      const categoryId = data.codexCategories.find((item) => item.worldId === worldId && item.id.endsWith(":note"))?.id
        || data.codexCategories.find((item) => item.worldId === worldId)?.id
        || "";
      const entityBase = data.entities.find((item) => item.worldId === worldId);
      const mapBase = data.maps.find((item) => item.worldId === worldId);
      const markerBase = data.mapMarkers.find((item) => item.mapId === mapBase?.id);
      const trackBase = data.timelineTracks.find((item) => item.worldId === worldId);
      const eventBase = data.timelineEvents.find((item) => item.worldId === worldId);
      const questBase = data.quests.find((item) => item.worldId === worldId);
      if (!entityBase || !mapBase || !markerBase || !trackBase || !eventBase || !questBase) {
        throw new Error("default fixture is incomplete");
      }

      const templateId = `template:${worldId}:wiki-security`;
      const publicEntity = {
        ...entityBase,
        id: "wiki-public-entity",
        worldId,
        type: "note",
        title: "公开档案",
        slug: "public-record",
        summary: "面向所有访客的安全文章",
        content: [
          "<h2>公开章节</h2>",
          '<p onclick="danger()">公开正文 ',
          '<span data-project-reference-kind="entity" data-project-reference-id="wiki-public-entity">[[公开档案]]</span>',
          " 与 ",
          '<span data-project-reference-kind="entity" data-project-reference-id="wiki-secret-entity">[[绝密角色]]</span>',
          "，另见 [[绝密角色]]。</p>",
          '<section data-secret-block="true"><p>秘密正文不可泄漏</p></section>',
          "<script>danger()</script>"
        ].join(""),
        tags: ["公开", "权限验收"],
        visibility: "public",
        categoryId,
        order: 0,
        templateId,
        templateData: {
          publicInfo: "公开字段值",
          secretInfo: "机密字段值"
        },
        updatedAt: now
      };
      const secretEntity = {
        ...entityBase,
        id: "wiki-secret-entity",
        worldId,
        type: "character",
        title: "绝密角色",
        slug: "secret-character",
        summary: "绝密摘要不可泄漏",
        content: "绝密条目正文不可泄漏",
        tags: ["绝密"],
        visibility: "secret",
        categoryId,
        order: 1,
        templateId: "",
        templateData: {},
        updatedAt: now
      };
      const sharedEntity = {
        ...entityBase,
        id: "wiki-shared-entity",
        worldId,
        type: "note",
        title: "成员密报",
        slug: "member-report",
        summary: "项目成员专用摘要",
        content: "项目成员专用正文",
        tags: ["成员"],
        visibility: "shared",
        categoryId,
        order: 2,
        templateId: "",
        templateData: {},
        updatedAt: now
      };
      const largeEntities = Array.from({ length: 2200 }, (_, index) => ({
        ...entityBase,
        id: `wiki-large-${index}`,
        worldId,
        type: "note",
        title: `大型世界文章 ${String(index).padStart(4, "0")}`,
        slug: `large-${index}`,
        summary: index === 2199 ? "大型检索唯一目标" : "性能数据",
        content: `<p>公开性能正文 ${index}</p>`,
        tags: [index % 2 ? "异兽" : "山川"],
        visibility: "public",
        categoryId,
        order: index + 3,
        templateId: "",
        templateData: {},
        updatedAt: now
      }));

      const publishedMapId = "wiki-public-map";
      const unpublishedMapId = "wiki-unpublished-map";
      const publicTrackId = "wiki-public-track";
      const hiddenTrackId = "wiki-unpublished-track";
      const publicQuestId = "wiki-public-quest";
      data.worlds = [{
        ...world,
        name: "Wiki 权限验收世界",
        description: "公开世界说明",
        visibility: "public",
        wiki: {
          coverAssetId: "",
          themeColor: "#315f8b",
          navigationCategoryIds: [categoryId],
          featuredEntityIds: [publicEntity.id],
          defaultMapId: publishedMapId,
          publishedMapIds: [publishedMapId],
          publishedTimelineTrackIds: [publicTrackId],
          publishedQuestIds: [publicQuestId]
        },
        updatedAt: now
      }];
      data.entityTemplates = [
        ...data.entityTemplates.filter((item) => item.worldId !== worldId),
        {
          id: templateId,
          worldId,
          name: "Wiki 权限模板",
          description: "公开与秘密字段隔离测试",
          entityTypes: ["note"],
          fields: [
            { id: "wiki-field-public", key: "publicInfo", label: "公开资料", type: "text", required: false, secret: false, defaultValue: "", options: [], targetEntityTypes: [], order: 0 },
            { id: "wiki-field-secret", key: "secretInfo", label: "幕后真相", type: "textarea", required: false, secret: true, defaultValue: "", options: [], targetEntityTypes: [], order: 1 }
          ],
          builtIn: false,
          createdAt: now,
          updatedAt: now
        }
      ];
      data.entities = [publicEntity, secretEntity, sharedEntity, ...largeEntities];
      data.maps = [
        { ...mapBase, id: publishedMapId, worldId, parentMapId: "", entryMarkerId: "", title: "公开地图", description: "公开地图说明", imageUrl: "", regions: [], storyPhases: [], viewBookmarks: [], savedFilters: [], updatedAt: now },
        { ...mapBase, id: unpublishedMapId, worldId, parentMapId: "", entryMarkerId: "", title: "未发布地图绝密", description: "不可泄漏", imageUrl: "", regions: [], storyPhases: [], viewBookmarks: [], savedFilters: [], updatedAt: now }
      ];
      data.mapLayers = [];
      data.mapMarkerGroups = [];
      data.mapMarkers = [
        { ...markerBase, id: "wiki-marker-public", mapId: publishedMapId, layerId: "", groupId: "", entityId: publicEntity.id, questId: "", sceneId: "", references: [{ kind: "entity", id: publicEntity.id }], x: 35, y: 48, label: "公开港口", description: "公开标记", updatedAt: now },
        { ...markerBase, id: "wiki-marker-secret", mapId: publishedMapId, layerId: "", groupId: "", entityId: secretEntity.id, questId: "", sceneId: "", references: [{ kind: "entity", id: secretEntity.id }], x: 70, y: 40, label: "绝密基地", description: "不可泄漏标记", updatedAt: now }
      ];
      data.mapRoutes = [];
      data.timelineTracks = [
        { ...trackBase, id: publicTrackId, worldId, name: "公开历史", description: "公开时间线", order: 0, updatedAt: now },
        { ...trackBase, id: hiddenTrackId, worldId, name: "未发布时间线绝密", description: "不可泄漏", order: 1, updatedAt: now }
      ];
      data.timelineEvents = [
        { ...eventBase, id: "wiki-event-public", worldId, trackId: publicTrackId, entityId: "", questId: "", sceneId: "", references: [], title: "公开事件", summary: "公开事件摘要", displayDate: "公开纪元 1 年", dependencyIds: [], sortOrder: 1, updatedAt: now },
        { ...eventBase, id: "wiki-event-secret", worldId, trackId: publicTrackId, entityId: secretEntity.id, questId: "", sceneId: "", references: [{ kind: "entity", id: secretEntity.id }], title: "秘密事件不可泄漏", summary: "秘密时间线摘要", displayDate: "绝密", dependencyIds: [], sortOrder: 2, updatedAt: now }
      ];
      data.quests = [{
        ...questBase,
        id: publicQuestId,
        worldId,
        title: "公开任务",
        category: "main",
        status: "active",
        summary: "公开任务摘要",
        trigger: "公开触发条件",
        relatedEntityIds: [publicEntity.id, secretEntity.id],
        prerequisiteQuestIds: [],
        steps: [{ id: "wiki-step", title: "公开步骤", objective: "公开目标", condition: "", branch: "", failure: "", reward: "", notes: "步骤开发备注不可泄漏" }],
        developerNotes: "任务开发备注不可泄漏",
        updatedAt: now
      }];
      data.storyVariables = [];
      data.storyScenes = [];
      data.storyTestPresets = [];
      data.storyTestRuns = [];
      data.storyReviewIssues = [];
      data.narrativeMilestones = [];
      data.manuscriptBooks = [];
      data.manuscriptVolumes = [];
      data.manuscriptChapters = [];
      data.manuscriptScenes = [];
      data.manuscriptClues = [];
      data.manuscriptKnowledgeStates = [];
      data.relations = [];
      data.assets = [];
      data.members = [];
      data.aiMemoryItems = [{
        id: "wiki-ai-secret",
        worldId,
        category: "canon",
        state: "confirmed",
        title: "绝密AI记忆不可泄漏",
        content: "AI 长期记忆正文不可泄漏",
        sourceContextId: `world:${worldId}`,
        fact: { subject: "秘密", property: "内容", value: "不可泄漏", temporalScope: "全局" },
        sources: [], relations: [], tags: ["秘密"], ignoredConflictIds: [], excludedContextIds: [], pinned: true,
        lastVerifiedAt: now, createdAt: now, updatedAt: now, order: 0
      }];
      data.aiWritingSessions = [];
      data.aiOperationRuns = [];
      window.__wikiSecurityFixtureData = data;
      const result = await window.worldcraftStore.saveWorkspace(data, "wiki-security-fixture");
      if (!result?.ok) throw new Error(result?.error || "fixture save failed");
      window.localStorage.removeItem("worldcraft-codex-recovery-v1");
      return { worldId, categoryId, publicEntityId: publicEntity.id, publicQuestId, publishedMapId, publicTrackId };
    });

    await page.waitForTimeout(1200);
    const persistedFixtureName = await page.evaluate(async () => {
      const result = await window.worldcraftStore.saveWorkspace(
        window.__wikiSecurityFixtureData,
        "wiki-security-fixture-final"
      );
      if (!result?.ok) throw new Error(result?.error || "final fixture save failed");
      window.localStorage.removeItem("worldcraft-codex-recovery-v1");
      const loaded = await window.worldcraftStore.loadWorkspace();
      return loaded?.data?.worlds?.[0]?.name || "";
    });
    assert.equal(persistedFixtureName, "Wiki 权限验收世界");
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(() => Boolean(window.worldcraftStore?.loadWorkspace));
    await page.locator(".world-title-input").waitFor({ state: "visible", timeout: 45000 });
    await page.waitForFunction(
      () => document.querySelector(".world-title-input")?.value === "Wiki 权限验收世界",
      undefined,
      { timeout: 45000 }
    );
    assert.equal(await page.locator(".world-title-input").inputValue(), "Wiki 权限验收世界");
    await page.locator(".tabbar").getByRole("button", { name: "世界总览", exact: true }).click();
    await page.locator(".wiki-workspace").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "公开访客", exact: true }).click();
    await page.getByRole("heading", { name: "Wiki 权限验收世界", exact: true }).waitFor();
    assert.equal(await page.locator(".wiki-stat-band strong").first().textContent(), "2201");
    const scrollLayout = await page.evaluate(() => {
      const viewport = document.querySelector(".wiki-viewport");
      return {
        documentOverflow: Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight
        ) - window.innerHeight,
        viewportOverflow: viewport ? viewport.scrollHeight - viewport.clientHeight : 0,
        shellContained: document.querySelector(".app-shell")?.classList.contains("is-viewport-contained") || false
      };
    });
    assert.ok(scrollLayout.documentOverflow <= 1, `Wiki created an outer page scrollbar: ${JSON.stringify(scrollLayout)}`);
    assert.ok(scrollLayout.viewportOverflow > 0, `Wiki content no longer has an internal scroll area: ${JSON.stringify(scrollLayout)}`);
    assert.equal(scrollLayout.shellContained, true, "Wiki mode contains scrolling inside the application viewport");
    assert.equal(await page.getByText("绝密角色", { exact: true }).count(), 0);
    assert.equal(await page.getByText("成员密报", { exact: true }).count(), 0);
    assert.equal(await page.getByText("绝密AI记忆不可泄漏", { exact: true }).count(), 0);
    assert.equal(await page.getByText("未发布地图绝密", { exact: true }).count(), 0);
    await page.screenshot({ path: path.join(runRoot, "wiki-public-home.png"), fullPage: false });

    const search = page.getByLabel("搜索世界 Wiki", { exact: true });
    const startedAt = Date.now();
    await search.fill("大型检索唯一目标");
    const largeTarget = page.locator(".wiki-search-page .wiki-entry-row").filter({ hasText: "大型世界文章 2199" });
    await largeTarget.waitFor({ state: "visible", timeout: 5000 });
    const searchDuration = Date.now() - startedAt;
    assert.ok(searchDuration < 2500, `2201-entry Electron search exceeded budget: ${searchDuration}ms`);

    await search.fill("公开档案");
    const publicResult = page.locator(".wiki-search-page .wiki-entry-row").filter({ hasText: "公开档案" });
    await publicResult.waitFor({ state: "visible", timeout: 5000 });
    assert.equal(await publicResult.count(), 1);
    await publicResult.click();
    await page.getByRole("heading", { name: "公开档案", exact: true }).waitFor();
    const articleText = await page.locator(".wiki-article").textContent();
    assert.ok(articleText.includes("公开正文"));
    assert.ok(articleText.includes("公开字段值"));
    assert.ok(articleText.includes("受限内容"));
    assert.ok(!articleText.includes("秘密正文不可泄漏"));
    assert.ok(!articleText.includes("绝密角色"));
    assert.ok(!articleText.includes("机密字段值"));
    assert.ok(!articleText.includes("幕后真相"));
    assert.equal(await page.locator(".wiki-rich-content script").count(), 0);
    assert.equal(await page.locator(".wiki-rich-content [onclick]").count(), 0);
    await page.locator(".wiki-viewport").evaluate((element) => {
      element.scrollTop = 0;
      void element.getBoundingClientRect();
    });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(runRoot, "wiki-public-article.png"),
      fullPage: false,
      animations: "disabled"
    });

    await page.locator(".wiki-world-home").click();
    await page.getByRole("button", { name: "公开任务", exact: true }).click();
    const questText = await page.locator(".wiki-quest-page").textContent();
    assert.ok(questText.includes("公开目标"));
    assert.ok(!questText.includes("任务开发备注不可泄漏"));
    assert.ok(!questText.includes("步骤开发备注不可泄漏"));
    assert.ok(!questText.includes("绝密角色"));

    const wikiNav = page.getByRole("navigation", { name: "世界总览导航", exact: true });
    await wikiNav.getByRole("button", { name: "地图", exact: true }).click();
    const mapText = await page.locator(".wiki-map-page").textContent();
    assert.ok(mapText.includes("公开港口"));
    assert.ok(!mapText.includes("绝密基地"));
    assert.ok(!mapText.includes("未发布地图绝密"));

    await wikiNav.getByRole("button", { name: "历史", exact: true }).click();
    const timelineText = await page.locator(".wiki-timeline-page").textContent();
    assert.ok(timelineText.includes("公开事件"));
    assert.ok(!timelineText.includes("秘密事件不可泄漏"));
    assert.ok(!timelineText.includes("未发布时间线绝密"));

    await page.getByRole("button", { name: "导出公开访客离线 Wiki", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "离线 Wiki 已导出" }).waitFor({ timeout: 15000 });
    for (const fileName of ["index.html", "wiki.css", "wiki.js", "wiki-data.js", "manifest.json"]) {
      assert.equal(fs.existsSync(path.join(wikiExportDir, fileName)), true, `${fileName} is exported`);
    }
    const offlineData = fs.readFileSync(path.join(wikiExportDir, "wiki-data.js"), "utf8");
    const offlineManifest = JSON.parse(fs.readFileSync(path.join(wikiExportDir, "manifest.json"), "utf8"));
    assert.equal(offlineManifest.audience, "public");
    assert.equal(offlineManifest.counts.articles, 2201);
    assert.ok(offlineData.includes("公开档案"));
    assert.ok(!offlineData.includes("绝密角色"));
    assert.ok(!offlineData.includes("成员密报"));
    assert.ok(!offlineData.includes("秘密正文不可泄漏"));
    assert.ok(!offlineData.includes("绝密AI记忆不可泄漏"));
    await page.screenshot({ path: path.join(runRoot, "wiki-offline-export-complete.png"), fullPage: false });

    const offlineWindowPromise = app.waitForEvent("window");
    await app.evaluate(async ({ BrowserWindow }, entryFile) => {
      const preview = new BrowserWindow({
        width: 1280,
        height: 800,
        show: true,
        webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
      });
      await preview.loadFile(entryFile);
    }, path.join(wikiExportDir, "index.html"));
    const offlinePage = await offlineWindowPromise;
    await offlinePage.getByRole("heading", { name: "Wiki 权限验收世界", exact: true }).waitFor({ timeout: 15000 });
    assert.ok((await offlinePage.locator("body").textContent()).includes("2201 篇文章"));
    assert.equal(await offlinePage.getByText("绝密角色", { exact: true }).count(), 0);
    await offlinePage.screenshot({ path: path.join(runRoot, "wiki-offline-file-preview.png"), fullPage: false });
    await offlinePage.close();

    assert.deepEqual(rendererErrors, [], `renderer has no errors: ${rendererErrors.join(" | ")}`);
    console.log(JSON.stringify({
      ok: true,
      fixture,
      publicVisibleEntries: 2201,
      searchDurationMs: searchDuration,
      screenshots: [
         path.join(runRoot, "wiki-public-home.png"),
         path.join(runRoot, "wiki-public-article.png"),
         path.join(runRoot, "wiki-offline-export-complete.png"),
         path.join(runRoot, "wiki-offline-file-preview.png")
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
