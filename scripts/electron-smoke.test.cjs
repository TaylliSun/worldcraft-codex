const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

const root = path.resolve(__dirname, "..");
const runRoot = path.join(root, "validation", `electron-smoke-${process.pid}`);
const userDataDir = path.join(runRoot, "user-data");
const diagnosticPath = path.join(runRoot, "diagnostics.json");
const mapExportPath = path.join(runRoot, "map-export.png");
const manuscriptExportDir = path.join(runRoot, "manuscript-publication");
const executablePath = require("electron");
const packageVersion = require("../package.json").version;
const queuedDescription = "E2E queued save 39";
const aiOperatorPlan = {
  summary: "E2E AI 跨模块操作",
  operations: [
    {
      id: "create-category",
      action: "create",
      target: "codex-category",
      ref: "operator-category",
      data: {
        parentId: "category:world-canglan:note",
        title: "AI 调查档案",
        description: "E2E 项目操作创建的调查分类",
        icon: "notes",
        color: "#2563a8",
        order: 2
      }
    },
    {
      id: "create-template",
      action: "create",
      target: "entity-template",
      ref: "operator-template",
      data: {
        name: "AI 调查角色模板",
        description: "记录调查员的职责",
        entityTypes: ["character"],
        fields: [{
          id: "operator-template-role",
          key: "investigation_role",
          label: "调查职责",
          type: "text",
          required: true,
          secret: false,
          defaultValue: "",
          options: [],
          targetEntityTypes: [],
          order: 0
        }]
      }
    },
    {
      id: "create-character",
      action: "create",
      target: "entity",
      ref: "operator-character",
      data: {
        type: "character",
        title: "AI 操作测试角色",
        summary: "负责调查雾鸦堡异常的记录员",
        tags: ["E2E", "调查员"],
        categoryId: "@operator-category",
        templateId: "@operator-template",
        templateData: { investigation_role: "现场记录与复核" }
      }
    },
    {
      id: "create-quest",
      action: "create",
      target: "quest",
      ref: "operator-quest",
      data: {
        title: "AI 操作测试任务",
        category: "side",
        status: "draft",
        summary: "调查雾鸦堡新出现的符号",
        relatedEntityIds: ["@operator-character", "entity-fogkeep"],
        steps: [{ id: "operator-step", title: "记录符号", objective: "完成一份现场记录" }]
      }
    },
    {
      id: "create-variable",
      action: "create",
      target: "story-variable",
      ref: "operator-clue",
      data: {
        key: "e2e.ai_operator_clue",
        name: "AI 操作线索",
        type: "boolean",
        defaultValue: false
      }
    },
    {
      id: "create-scene",
      action: "create",
      target: "story-scene",
      ref: "operator-scene",
      data: {
        title: "AI 操作测试场景",
        summary: "记录员在雾鸦堡完成调查",
        status: "draft",
        entryNodeId: "operator-entry",
        relatedEntityIds: ["@operator-character", "entity-fogkeep"],
        relatedQuestIds: ["@operator-quest"],
        nodes: [
          {
            id: "operator-entry",
            label: "开始记录",
            speakerEntityId: "@operator-character",
            text: "这枚符号以前从未出现。",
            nextNodeId: "operator-end",
            choices: [],
            conditions: [],
            effects: [],
            isEnding: false
          },
          {
            id: "operator-end",
            label: "完成调查",
            speakerEntityId: "@operator-character",
            text: "记录已经归档。",
            nextNodeId: "",
            choices: [],
            conditions: [],
            effects: [],
            isEnding: true
          }
        ]
      }
    },
    {
      id: "create-relation",
      action: "create",
      target: "relation",
      ref: "operator-relation",
      data: {
        sourceEntityId: "@operator-character",
        targetEntityId: "entity-fogkeep",
        kind: "located",
        label: "在此调查",
        direction: "directed",
        strength: 4
      }
    },
    {
      id: "create-test-preset",
      action: "create",
      target: "story-test-preset",
      ref: "operator-preset",
      data: {
        name: "AI 调查默认测试",
        description: "从未发现异常线索的状态开始",
        sceneId: "@operator-scene",
        initialState: { "@operator-clue": false },
        maxDepth: 18,
        maxPaths: 90
      }
    },
    {
      id: "create-review-issue",
      action: "create",
      target: "story-review-issue",
      ref: "operator-issue",
      data: {
        title: "AI 调查反馈待补",
        detail: "调查完成后需要补充玩家反馈。",
        severity: "major",
        status: "open",
        presetId: "@operator-preset",
        sceneId: "@operator-scene",
        nodeId: "operator-end",
        entityId: "@operator-character",
        questId: "@operator-quest"
      }
    },
    {
      id: "create-member",
      action: "create",
      target: "member",
      ref: "operator-member",
      data: {
        name: "AI 剧情审阅员",
        email: "ai-reviewer@example.test",
        role: "editor"
      }
    },
    {
      id: "create-track",
      action: "create",
      target: "timeline-track",
      ref: "operator-track",
      data: { name: "AI 操作测试时间线", description: "E2E 操作轨道", color: "#177a61", order: 8 }
    },
    {
      id: "create-event",
      action: "create",
      target: "timeline-event",
      ref: "operator-event",
      data: {
        trackId: "@operator-track",
        entityId: "@operator-character",
        questId: "@operator-quest",
        sceneId: "@operator-scene",
        title: "AI 操作测试时间点",
        summary: "调查记录归档",
        displayDate: "E2E 第 1 日",
        sortOrder: 800
      }
    },
    {
      id: "create-map",
      action: "create",
      target: "map",
      ref: "operator-map",
      data: {
        title: "AI 操作调查地图",
        description: "记录员调查雾鸦堡异常符号的局部地图",
        width: 1200,
        height: 800,
        distanceWidth: 96,
        distanceUnit: "km",
        grid: { visible: true, snap: true, labels: true, columns: 8, color: "#177a61", opacity: 0.2 }
      }
    },
    {
      id: "create-map-layer",
      action: "create",
      target: "map-layer",
      ref: "operator-map-layer",
      data: { mapId: "@operator-map", title: "AI 线索图层", color: "#2563a8", order: 1 }
    },
    {
      id: "create-map-group",
      action: "create",
      target: "map-marker-group",
      ref: "operator-map-group",
      data: { mapId: "@operator-map", title: "AI 调查标记组", color: "#7c5bb4" }
    },
    {
      id: "create-map-start-marker",
      action: "create",
      target: "map-marker",
      ref: "operator-start-marker",
      data: {
        mapId: "@operator-map",
        layerId: "@operator-map-layer",
        groupId: "@operator-map-group",
        entityId: "entity-fogkeep",
        references: [{ kind: "entity", id: "entity-fogkeep" }],
        x: 20,
        y: 70,
        label: "AI 雾鸦堡入口",
        markerType: "location"
      }
    },
    {
      id: "create-map-clue-marker",
      action: "create",
      target: "map-marker",
      ref: "operator-clue-marker",
      data: {
        mapId: "@operator-map",
        layerId: "@operator-map-layer",
        groupId: "@operator-map-group",
        entityId: "@operator-character",
        questId: "@operator-quest",
        sceneId: "@operator-scene",
        references: [
          { kind: "entity", id: "@operator-character" },
          { kind: "quest", id: "@operator-quest" },
          { kind: "scene", id: "@operator-scene" },
          { kind: "timeline-event", id: "@operator-event" }
        ],
        x: 75,
        y: 28,
        label: "AI 异常符号",
        markerType: "quest"
      }
    },
    {
      id: "create-map-route",
      action: "create",
      target: "map-route",
      ref: "operator-route",
      data: {
        mapId: "@operator-map",
        title: "AI 调查路线",
        status: "active",
        travelMode: "walk",
        travelSpeed: 5,
        travelHoursPerDay: 8,
        stops: [
          { markerId: "@operator-start-marker", title: "雾鸦堡入口" },
          { markerId: "@operator-clue-marker", title: "异常符号" }
        ]
      }
    },
    {
      id: "update-map-region",
      action: "update",
      target: "map",
      targetId: "@operator-map",
      data: {
        regions: [{
          id: "operator-region",
          title: "AI 调查区域",
          description: "异常符号可能影响的范围",
          kind: "quest",
          color: "#c45f4b",
          opacity: 0.24,
          order: 0,
          visible: true,
          locked: false,
          points: [{ x: 55, y: 15 }, { x: 90, y: 18 }, { x: 84, y: 50 }, { x: 52, y: 45 }],
          references: [
            { kind: "quest", id: "@operator-quest" },
            { kind: "map-marker", id: "@operator-clue-marker" }
          ]
        }]
      }
    },
    {
      id: "create-narrative-milestone",
      action: "create",
      target: "narrative-milestone",
      ref: "operator-milestone",
      data: {
        title: "AI 调查章节",
        summary: "记录员沿调查路线确认异常符号",
        act: "E2E 第二幕",
        status: "drafting",
        priority: "high",
        manuscriptBody: "<p>记录员沿着城墙阴影走向异常符号。</p>",
        linkedQuestIds: ["@operator-quest"],
        linkedSceneIds: ["@operator-scene"],
        linkedEntityIds: ["@operator-character", "entity-fogkeep"],
        linkedTimelineEventIds: ["@operator-event"],
        linkedMapMarkerIds: ["@operator-clue-marker"],
        linkedReviewIssueIds: ["@operator-issue"]
      }
    }
  ]
};
let assertions = 0;

fs.rmSync(runRoot, { recursive: true, force: true });
fs.mkdirSync(runRoot, { recursive: true });

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

async function inspectHitTarget(locator, obstructionSelector = "") {
  return locator.evaluate((element, selector) => {
    const bounds = element.getBoundingClientRect();
    const hitTarget = document.elementFromPoint(
      bounds.left + bounds.width / 2,
      bounds.top + bounds.height / 2
    );
    const obstruction = selector ? document.querySelector(selector) : null;
    const obstructionBounds = obstruction?.getBoundingClientRect();
    return {
      button: {
        bottom: Math.round(bounds.bottom),
        left: Math.round(bounds.left),
        right: Math.round(bounds.right),
        top: Math.round(bounds.top)
      },
      clickable: hitTarget === element || element.contains(hitTarget),
      hitClass: hitTarget instanceof HTMLElement ? hitTarget.className : "",
      hitTag: hitTarget?.tagName ?? "",
      obstruction: obstructionBounds ? {
        bottom: Math.round(obstructionBounds.bottom),
        left: Math.round(obstructionBounds.left),
        right: Math.round(obstructionBounds.right),
        top: Math.round(obstructionBounds.top)
      } : null
    };
  }, obstructionSelector);
}

async function launch() {
  const env = {
    ...process.env,
    WORLDCRAFT_USER_DATA_DIR: userDataDir,
    WORLDCRAFT_DIAGNOSTIC_OUTPUT: diagnosticPath,
    WORLDCRAFT_MAP_EXPORT_OUTPUT: mapExportPath,
    WORLDCRAFT_MANUSCRIPT_EXPORT_DIR: manuscriptExportDir
  };
  delete env.ELECTRON_RUN_AS_NODE;
  const electronApp = await electron.launch({
    executablePath,
    args: ["."],
    cwd: root,
    env,
    timeout: 30000
  });
  const page = await electronApp.firstWindow({ timeout: 30000 });
  await page.waitForLoadState("domcontentloaded");
  return { electronApp, page };
}

async function waitForWorkspace(page) {
  await page.getByLabel("世界名称", { exact: true }).waitFor({ state: "visible", timeout: 30000 });
  await page.waitForFunction(() =>
    Boolean(document.querySelector("[role='dialog'][aria-label='选择项目起步包']")) ||
    Boolean(document.querySelector(".compact-save-status")?.textContent.includes("SQLite"))
  );
  const starterDialog = page.getByRole("dialog", { name: "选择项目起步包", exact: true });
  const starterVisible = await starterDialog.isVisible();
  if (starterVisible) {
    check(await starterDialog.getByRole("radio").count(), 4, "first run offers four project starter packs");
    check(await starterDialog.getByLabel("新世界名称").inputValue(), "苍岚纪", "game narrative starter is ready without extra setup");
    await page.screenshot({
      path: path.join(root, "validation", "g4-first-run-starter.png"),
      fullPage: false
    });
    await starterDialog.getByRole("radio", { name: /游戏叙事/ }).click();
    await starterDialog.getByRole("button", { name: "进入创作台", exact: true }).click();
  }
  await page.locator(".compact-save-status").waitFor({ state: "attached", timeout: 30000 });
  await page.waitForFunction(() => document.querySelector(".compact-save-status")?.textContent.includes("SQLite"));
  return starterVisible;
}

async function waitForSaved(page) {
  await page.waitForFunction(
    () => document.querySelector(".compact-save-status")?.textContent.includes("已保存到 SQLite"),
    undefined,
    { timeout: 30000 }
  );
}

async function verifyTopbarBackground(page) {
  const background = await page.locator(".topbar").evaluate((element) =>
    getComputedStyle(element).backgroundColor
  );
  check(background !== "rgb(0, 0, 0)", true, "top bar keeps its light background");
}

async function verifyDocumentFlowPanels(page, selector, message) {
  const positions = await page.locator(selector).evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).position)
  );
  check(positions.length > 0, true, `${message} are present`);
  check(positions.every((position) => position === "static"), true, message);
}

async function openWorkspace(page, name) {
  const button = page.getByRole("button", { name, exact: true });
  if (!(await button.isVisible())) {
    await page.locator(".rail-more > summary").click();
    await button.waitFor({ state: "visible" });
  }
  await button.click();
}

async function verifyHealthy(page) {
  await openWorkspace(page, "项目检查");
  await page.getByText("数据库完整性检查通过", { exact: true }).waitFor({ timeout: 30000 });
  check(await page.getByText("Schema", { exact: true }).count(), 1, "health view exposes schema");
  const backupAudit = await page.evaluate(async () => {
    const result = await window.worldcraftStore.listBackups();
    return {
      compressed: result.backups.some((backup) => backup.fileName.endsWith(".wcodex.json.gz")),
      totalBytes: result.storage?.totalBytes ?? 0,
      dataCount: result.storage?.dataCount ?? 0
    };
  });
  check(backupAudit.compressed, true, "automatic safety snapshots use the compressed backup format");
  check(backupAudit.totalBytes > 0, true, "backup inventory reports total disk usage");
  check(backupAudit.dataCount > 0, true, "backup inventory separates data snapshots");
  check(await page.locator(".backup-storage-overview").count(), 1, "health view exposes backup disk governance");
  await page.getByRole("button", { name: "整理历史", exact: true }).click();
  const maintenanceConfirmation = page.locator(".storage-maintenance-confirm");
  await maintenanceConfirmation.waitFor();
  check(await maintenanceConfirmation.getByText(/压缩安全快照/).count(), 1, "storage maintenance explains its safety checkpoint");
  await maintenanceConfirmation.getByRole("button", { name: "开始整理", exact: true }).click();
  await page.getByText(/历史整理完成/).waitFor({ timeout: 30000 });
  await page.screenshot({
    path: path.join(root, "validation", "storage-governance-1440.png")
  });
  const releasePanel = page.getByLabel("应用与更新");
  await releasePanel.waitFor();
  check(await releasePanel.count(), 1, "health view exposes application update controls");
  check(await releasePanel.getByText(packageVersion, { exact: true }).count(), 1, "release panel shows current version");
  check(await releasePanel.getByText("开发构建", { exact: true }).count(), 1, "development build explains update availability");
  const stableChannel = releasePanel.getByRole("button", { name: "稳定版", exact: true });
  const candidateChannel = releasePanel.getByRole("button", { name: "候选版", exact: true });
  await stableChannel.click();
  await page.waitForFunction(
    (element) => element instanceof HTMLElement && element.classList.contains("is-active"),
    await stableChannel.elementHandle()
  );
  check((await stableChannel.getAttribute("class"))?.includes("is-active"), true, "stable update channel can be selected");
  await candidateChannel.click();
  await page.waitForFunction(
    (element) => element instanceof HTMLElement && element.classList.contains("is-active"),
    await candidateChannel.elementHandle()
  );
  check((await candidateChannel.getAttribute("class"))?.includes("is-active"), true, "candidate update channel can be restored");
  const autoDownload = releasePanel.getByRole("checkbox", { name: "自动下载", exact: true });
  await autoDownload.check();
  check(await autoDownload.isChecked(), true, "automatic download preference can be enabled");
  await autoDownload.uncheck();
  check(await autoDownload.isChecked(), false, "automatic download preference can be disabled");
}

async function openEntityFromSearch(page, title) {
  await page.locator(".rail-search").click();
  const search = page.getByRole("textbox", { name: "全局搜索" });
  await search.fill(title);
  await page.getByRole("dialog").getByText(title, { exact: true }).first().waitFor();
  await search.press("Enter");
  await page.getByLabel("条目标题").waitFor();
}

async function verifyKeyboardAndIme(page) {
  const createTrigger = page
    .locator(".entity-browser")
    .getByRole("button", { name: "创建条目", exact: true });
  await createTrigger.click();
  const createDialog = page.getByRole("dialog", { name: "新建内容", exact: true });
  const nameInput = createDialog.getByLabel("名称", { exact: true });
  await createDialog.waitFor();
  await page.waitForFunction(() => document.activeElement?.getAttribute("placeholder")?.includes("守灯人"));
  check(await createDialog.getAttribute("aria-modal"), "true", "create dialog exposes modal semantics");
  check(
    await nameInput.evaluate((element) => document.activeElement === element),
    true,
    "create dialog focuses its primary field"
  );

  await nameInput.fill("输入法组合态不应提交");
  await nameInput.evaluate((element) => {
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter"
    });
    Object.defineProperty(event, "isComposing", { configurable: true, value: true });
    element.dispatchEvent(event);
  });
  check(await createDialog.isVisible(), true, "IME composition Enter does not submit the dialog");
  check(await page.getByLabel("条目标题").inputValue(), "艾琳", "IME composition leaves the active entity unchanged");

  await createDialog.getByRole("button", { name: "创建角色", exact: true }).focus();
  await page.keyboard.press("Tab");
  check(
    await createDialog.getByRole("button", { name: "关闭", exact: true }).evaluate(
      (element) => document.activeElement === element
    ),
    true,
    "Tab remains inside the modal dialog"
  );

  await page.evaluate(() => {
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "k"
    });
    Object.defineProperty(event, "isComposing", { configurable: true, value: true });
    window.dispatchEvent(event);
  });
  check(await page.locator(".global-search-dialog").count(), 0, "IME composition does not trigger global shortcuts");

  await page.keyboard.press("Escape");
  await createDialog.waitFor({ state: "detached" });
  check(
    await createTrigger.evaluate((element) => document.activeElement === element),
    true,
    "closing a dialog restores focus to its trigger"
  );

  const searchTrigger = page.locator(".rail-search");
  await searchTrigger.click();
  const searchDialog = page.getByRole("dialog", { name: "搜索 苍岚纪", exact: true });
  const searchInput = searchDialog.getByRole("textbox", { name: "全局搜索" });
  await searchDialog.waitFor();
  await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "全局搜索");
  check(
    await searchInput.evaluate((element) => document.activeElement === element),
    true,
    "global search focuses its search field"
  );
  await page.keyboard.press("Escape");
  await searchDialog.waitFor({ state: "detached" });
  check(
    await searchTrigger.evaluate((element) => document.activeElement === element),
    true,
    "global search restores focus to its trigger"
  );
}

async function verifyG2Workflows(page) {
  await page.getByRole("tab", { name: "预览", exact: true }).click();
  await page.locator(".publication-document").waitFor();
  check(
    await page.locator(".publication-document").getByText("实验对象", { exact: false }).count(),
    0,
    "reader preview excludes secret template content"
  );
  const sidebarToggle = page.getByRole("checkbox", { name: "侧栏", exact: true });
  await sidebarToggle.uncheck();
  check(await page.locator(".publication-document-layout > aside").count(), 0, "reader sidebar can be hidden");
  await sidebarToggle.check();
  await page.screenshot({
    path: path.join(root, "validation", "g2-publication-preview.png"),
    fullPage: false
  });

  await page.getByRole("tab", { name: "正文", exact: true }).click();
  await page.getByRole("button", { name: "打开条目检查", exact: true }).click();
  const sceneBackReference = page
    .locator(".back-reference-list > button")
    .filter({ hasText: "雾鸦堡档案室的抉择" })
    .first();
  await sceneBackReference.waitFor();
  await sceneBackReference.click();
  const locatedField = page.locator(".is-reference-target").first();
  await locatedField.waitFor({ timeout: 5000 });
  check(
    (await locatedField.getAttribute("data-reference-path") || "").startsWith("nodes["),
    true,
    "back reference opens the source scene and locates its exact node field"
  );
  await page.screenshot({
    path: path.join(root, "validation", "g2-back-reference-location.png"),
    fullPage: false
  });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await openWorkspace(page, "地图");
  await page.getByRole("heading", { name: "苍岚全境图", exact: true }).waitFor();
  check(await page.evaluate(() => window.scrollY), 0, "workspace navigation resets the viewport");
  await page.getByRole("button", { name: "添加关联对象", exact: true }).click();
  await page.getByLabel("筛选对象类型").selectOption("entity");
  await page.getByRole("button", { name: "新建条目", exact: true }).click();
  const createDialog = page.getByRole("dialog");
  await createDialog.getByLabel("名称", { exact: true }).fill("E2E 关联角色");
  await createDialog.getByRole("button", { name: "创建角色", exact: true }).click();
  await openWorkspace(page, "地图");
  await page.getByText("E2E 关联角色", { exact: true }).waitFor();
  check(
    await page.locator(".project-reference-chip").filter({ hasText: "E2E 关联角色" }).count(),
    1,
    "object created inside the picker is attached back to the map marker"
  );
  await waitForSaved(page);
  await verifyTopbarBackground(page);
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(root, "validation", "g2-map-reference-picker.png"),
    fullPage: false
  });
  await verifyDocumentFlowPanels(
    page,
    ".planning-browser, .planning-inspector",
    "map browser and inspector remain in the workspace document flow"
  );
  const mapPanelScrollBefore = await page.evaluate(() => {
    const panel = document.querySelector(".planning-browser");
    return {
      pageY: window.scrollY,
      panelTop: panel?.getBoundingClientRect().top ?? 0,
      targetY: Math.min(document.documentElement.scrollHeight - window.innerHeight, window.scrollY + 320)
    };
  });
  await page.evaluate((targetY) => window.scrollTo(0, targetY), mapPanelScrollBefore.targetY);
  const mapPanelScrollAfter = await page.evaluate(() => ({
    pageY: window.scrollY,
    panelTop: document.querySelector(".planning-browser")?.getBoundingClientRect().top ?? 0
  }));
  const mapPageScrollDistance = mapPanelScrollAfter.pageY - mapPanelScrollBefore.pageY;
  const mapPanelTravelDistance = mapPanelScrollBefore.panelTop - mapPanelScrollAfter.panelTop;
  check(mapPageScrollDistance >= 120, true, "map workspace provides enough page travel for the sidebar regression");
  check(
    Math.abs(mapPanelTravelDistance - mapPageScrollDistance) <= 2,
    true,
    "map sidebar scrolls away with its section instead of following the viewport"
  );
  await page.screenshot({
    path: path.join(root, "validation", "workspace-panel-scroll-flow.png"),
    fullPage: false
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  const embeddedMapViewport = page.locator(".map-planning-viewport");
  const embeddedMapZoomValue = page.locator(".map-zoom-value");
  const embeddedMapZoomBeforeWheel = Number((await embeddedMapZoomValue.textContent()).replace("%", ""));
  const embeddedWheelResult = await embeddedMapViewport.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      clientX: bounds.left + bounds.width / 2,
      clientY: bounds.top + bounds.height / 2,
      deltaY: -120
    });
    return {
      accepted: element.dispatchEvent(event),
      defaultPrevented: event.defaultPrevented
    };
  });
  check(embeddedWheelResult.defaultPrevented, true, "embedded map captures wheel scrolling before it reaches the page");
  check(embeddedWheelResult.accepted, false, "embedded map cancels the browser wheel default action");
  await page.waitForFunction(
    (zoom) => Number(document.querySelector(".map-zoom-value")?.textContent?.replace("%", "")) > zoom,
    embeddedMapZoomBeforeWheel
  );
  check(
    Number((await embeddedMapZoomValue.textContent()).replace("%", "")) > embeddedMapZoomBeforeWheel,
    true,
    "embedded map wheel input zooms the canvas without fullscreen mode"
  );
  check(await page.getByLabel("交互式地图画布", { exact: true }).count(), 1, "map workspace exposes a dedicated interactive viewport");
  check(await page.getByRole("button", { name: "地图缩略导航", exact: true }).count(), 1, "map workspace includes a minimap navigator");
  await page.getByRole("button", { name: "最大化地图工作区", exact: true }).click();
  const mapDialog = page.getByRole("dialog", { name: "苍岚全境图", exact: true });
  await mapDialog.waitFor();
  const mapDialogBox = await mapDialog.boundingBox();
  const mapViewport = await page.evaluate(() => ({ height: window.innerHeight, width: window.innerWidth }));
  check(
    Boolean(mapDialogBox && mapDialogBox.width >= mapViewport.width - 24 && mapDialogBox.height >= mapViewport.height - 24),
    true,
    "map focus mode uses the available desktop window"
  );
  const focusDockTabs = mapDialog.getByRole("tablist", { name: "地图右侧面板", exact: true });
  const focusPropertiesTab = focusDockTabs.getByRole("tab", { name: "属性", exact: true });
  const focusLayersTab = focusDockTabs.getByRole("tab", { name: /^图层 \d+$/ });
  check(await focusPropertiesTab.getAttribute("aria-selected"), "true", "fullscreen map opens object properties without stacking the layer palette above them");
  await focusLayersTab.click();
  const focusLayerPalette = mapDialog.locator("[aria-label='地图图层栏']");
  await focusLayerPalette.waitFor();
  check(await focusLayersTab.getAttribute("aria-selected"), "true", "fullscreen map exposes layers as a dedicated dock tab");
  check(await focusLayerPalette.locator("[data-map-layer-row-id]").count(), 1, "fullscreen layer tab exposes a paint-style layer stack");
  check(await focusLayerPalette.getByText("地图底图", { exact: true }).count(), 1, "layer stack anchors the basemap as its locked bottom layer");
  const visibleMarkerCountBeforeLayerToggle = await mapDialog.locator(".planning-map-marker").count();
  await focusLayerPalette.getByRole("button", { name: "隐藏图层 主要标记", exact: true }).click();
  check(await mapDialog.locator(".planning-map-marker").count(), 0, "layer palette visibility control updates the canvas immediately");
  await focusLayerPalette.getByRole("button", { name: "显示图层 主要标记", exact: true }).click();
  check(await mapDialog.locator(".planning-map-marker").count(), visibleMarkerCountBeforeLayerToggle, "layer palette restores hidden canvas content");
  await focusLayerPalette.getByRole("button", { name: "锁定图层 主要标记", exact: true }).click();
  check(await focusLayerPalette.getByRole("button", { name: "解锁图层 主要标记", exact: true }).count(), 1, "layer palette exposes immediate lock state feedback");
  await focusLayerPalette.getByRole("button", { name: "解锁图层 主要标记", exact: true }).click();
  await focusPropertiesTab.click();
  check(await focusLayerPalette.count(), 0, "properties tab removes the layer stack instead of duplicating both panels");
  const mapZoomValue = mapDialog.locator(".map-zoom-value");
  const initialMapZoom = Number((await mapZoomValue.textContent()).replace("%", ""));
  await mapDialog.getByRole("button", { name: "放大地图", exact: true }).click();
  check(Number((await mapZoomValue.textContent()).replace("%", "")) > initialMapZoom, true, "map canvas supports toolbar zooming");
  await mapDialog.getByRole("button", { name: "适配整张地图", exact: true }).click();
  const interactiveMapViewport = mapDialog.getByLabel("交互式地图画布", { exact: true });
  const mapStage = mapDialog.locator(".map-planning-stage");
  const positionBeforePan = await mapStage.evaluate((element) => ({
    left: element.style.left,
    top: element.style.top
  }));
  const interactiveViewportBox = await interactiveMapViewport.boundingBox();
  if (interactiveViewportBox) {
    await page.mouse.move(interactiveViewportBox.x + 30, interactiveViewportBox.y + 30);
    await page.mouse.down();
    await page.mouse.move(interactiveViewportBox.x + 75, interactiveViewportBox.y + 58);
    await page.mouse.up();
  }
  check(
    JSON.stringify(await mapStage.evaluate((element) => ({ left: element.style.left, top: element.style.top }))) !== JSON.stringify(positionBeforePan),
    true,
    "map canvas supports direct drag panning"
  );
  await mapDialog.getByRole("button", { name: "适配整张地图", exact: true }).click();
  const markerXInput = mapDialog.getByLabel("标记横坐标", { exact: true });
  const markerYInput = mapDialog.getByLabel("标记纵坐标", { exact: true });
  const originalMarkerX = Number(await markerXInput.inputValue());
  const originalMarkerY = Number(await markerYInput.inputValue());
  const fogkeepMapMarker = mapDialog.getByRole("button", { name: "地图标记 雾鸦堡", exact: true });
  await fogkeepMapMarker.click();
  if (interactiveViewportBox) {
    await page.mouse.move(interactiveViewportBox.x + interactiveViewportBox.width - 20, interactiveViewportBox.y + 20);
  }
  const selectedMarkerStyle = await fogkeepMapMarker.evaluate((element) => ({
    boxShadow: getComputedStyle(element).boxShadow,
    outlineStyle: getComputedStyle(element).outlineStyle
  }));
  check((await fogkeepMapMarker.getAttribute("class")).includes("is-primary"), true, "clicked map marker remains the primary selection after pointer exit");
  check(selectedMarkerStyle.outlineStyle, "none", "primary map marker does not retain an offset focus outline");
  check(selectedMarkerStyle.boxShadow.includes("0px 0px 0px 4px"), false, "primary map marker does not reveal an expanding white halo after pointer exit");
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-marker-selection.png"),
    fullPage: false
  });
  await interactiveMapViewport.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    element.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      clientX: bounds.left + 12,
      clientY: bounds.top + 12
    }));
  });
  check(await fogkeepMapMarker.getAttribute("aria-pressed"), "false", "blank map clicks clear the current object selection");
  await fogkeepMapMarker.click();
  await page.keyboard.press("Escape");
  check(await fogkeepMapMarker.getAttribute("aria-pressed"), "false", "Escape clears map selection before leaving focus mode");
  check(await mapDialog.isVisible(), true, "clearing selection with Escape keeps the fullscreen map open");
  await fogkeepMapMarker.click();
  const fogkeepMarkerBox = await fogkeepMapMarker.boundingBox();
  if (fogkeepMarkerBox) {
    await page.mouse.move(fogkeepMarkerBox.x + fogkeepMarkerBox.width / 2, fogkeepMarkerBox.y + fogkeepMarkerBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(fogkeepMarkerBox.x + fogkeepMarkerBox.width / 2 + 56, fogkeepMarkerBox.y + fogkeepMarkerBox.height / 2 + 28, { steps: 4 });
    await page.mouse.up();
  }
  await page.waitForFunction(
    ({ x, y }) => Number(document.querySelector("[role='dialog'] [aria-label='标记横坐标']")?.value) !== x || Number(document.querySelector("[role='dialog'] [aria-label='标记纵坐标']")?.value) !== y,
    { x: originalMarkerX, y: originalMarkerY }
  );
  const draggedMarkerX = Number(await markerXInput.inputValue());
  check(draggedMarkerX !== originalMarkerX, true, "editable map markers can be dragged and saved once released");
  await mapDialog.getByRole("button", { name: "撤销：移动地图标记", exact: true }).click();
  check(Number(await markerXInput.inputValue()), originalMarkerX, "marker drag can be undone");
  check(Number(await markerYInput.inputValue()), originalMarkerY, "marker drag undo restores both coordinates");
  await mapDialog.getByRole("button", { name: "重做：移动地图标记", exact: true }).click();
  check(Number(await markerXInput.inputValue()), draggedMarkerX, "marker drag can be redone");
  await mapDialog.getByRole("button", { name: "撤销：移动地图标记", exact: true }).click();
  await fogkeepMapMarker.focus();
  await fogkeepMapMarker.press("ArrowRight");
  check(Number(await markerXInput.inputValue()), originalMarkerX + 0.25, "focused markers support precise keyboard nudging");
  await mapDialog.getByRole("button", { name: "撤销：移动地图标记", exact: true }).click();
  const fogkeepMapLabel = mapDialog.getByRole("button", { name: "地图标记标签 雾鸦堡", exact: true });
  const labelPositionOutput = mapDialog.locator(".map-label-placement-control output");
  const labelPositionBeforeNudge = await labelPositionOutput.textContent();
  await fogkeepMapLabel.focus();
  await fogkeepMapLabel.press("ArrowRight");
  check(await labelPositionOutput.textContent() !== labelPositionBeforeNudge, true, "marker labels support independent keyboard positioning");
  await mapDialog.getByLabel("标签最低显示倍率", { exact: true }).selectOption("1.5");
  check(await mapDialog.getByLabel("标签最低显示倍率", { exact: true }).inputValue(), "1.5", "marker labels can be limited to authored zoom levels");
  await mapDialog.getByRole("button", { name: "锁定标签位置", exact: true }).click();
  check(await mapDialog.getByRole("button", { name: "解锁标签位置", exact: true }).getAttribute("aria-pressed"), "true", "marker label position can be locked independently");
  await mapDialog.getByRole("button", { name: "解锁标签位置", exact: true }).click();
  await mapDialog.getByLabel("标签最低显示倍率", { exact: true }).selectOption("0.1");
  await mapDialog.getByRole("button", { name: "重置标签位置", exact: true }).click();
  await mapDialog.getByRole("button", { name: "隐藏地图标签", exact: true }).click();
  check(await mapDialog.locator(".planning-map-marker.is-label-hidden").count() > 0, true, "map labels can be reduced without hiding marker icons");
  await mapDialog.getByRole("button", { name: "显示地图标签", exact: true }).click();
  await mapDialog.getByRole("button", { name: "地图视图书签", exact: true }).click();
  const mapBookmarkDialog = mapDialog.getByRole("dialog", { name: "地图视图书签列表", exact: true });
  await mapBookmarkDialog.getByLabel("新视图书签名称", { exact: true }).fill("E2E 北境视图");
  await mapBookmarkDialog.getByRole("button", { name: "保存当前地图视图", exact: true }).click();
  check(
    await mapBookmarkDialog.locator(".map-view-bookmark-list input").first().inputValue(),
    "E2E 北境视图",
    "map view bookmarks persist zoom, center, phase, and mode"
  );
  await mapDialog.getByRole("button", { name: "地图视图书签", exact: true }).click();
  const mapCanvasWidthBeforeCollapse = (await interactiveMapViewport.boundingBox())?.width || 0;
  await mapDialog.getByRole("button", { name: "收起地图目录", exact: true }).click();
  check(await mapDialog.locator(".planning-browser").count(), 0, "map directory can be collapsed in focus mode");
  check(((await interactiveMapViewport.boundingBox())?.width || 0) > mapCanvasWidthBeforeCollapse, true, "collapsing the directory gives the map more editing space");
  await mapDialog.getByRole("button", { name: "展开地图目录", exact: true }).click();

  await mapDialog.getByRole("button", { name: "打开地图设置", exact: true }).click();
  await mapDialog.getByLabel("地图横向跨度", { exact: true }).fill("1200");
  await mapDialog.getByLabel("地图距离单位", { exact: true }).selectOption("km");
  await mapDialog.getByLabel("地图网格列数", { exact: true }).fill("10");
  await mapDialog.getByLabel("显示坐标网格", { exact: true }).check();
  await mapDialog.getByLabel("显示网格坐标", { exact: true }).check();
  await mapDialog.getByLabel("吸附到坐标网格", { exact: true }).check();
  check(await mapDialog.locator(".map-grid-layer line").count(), 18, "calibrated map renders the derived square coordinate grid");
  check(await mapDialog.locator(".map-grid-coordinate").count(), 16, "coordinate grid exposes column and row labels");
  check((await mapDialog.locator(".map-scale-bar").textContent()).includes("千米"), true, "map canvas renders a calibrated dynamic scale bar");

  await mapDialog.getByRole("button", { name: "导出高清地图", exact: true }).click();
  const mapExportDialog = page.getByRole("dialog", { name: "导出高清地图 苍岚全境图", exact: true });
  await mapExportDialog.waitFor();
  check(await mapExportDialog.getAttribute("aria-modal"), "true", "map export exposes modal semantics");
  await mapExportDialog.getByRole("button", { name: "1×", exact: true }).click();
  check(await mapExportDialog.getByRole("button", { name: "1×", exact: true }).getAttribute("aria-pressed"), "true", "map export supports explicit resolution selection");
  await mapExportDialog.getByRole("button", { name: "当前视口", exact: true }).click();
  check(await mapExportDialog.getByRole("button", { name: "当前视口", exact: true }).getAttribute("aria-pressed"), "true", "map export can crop directly to the current viewport");
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-export.png"),
    fullPage: false
  });
  await mapExportDialog.getByRole("button", { name: "导出地图", exact: true }).click();
  await mapExportDialog.locator(".map-export-summary.is-success").waitFor({ timeout: 30000 });
  check(fs.existsSync(mapExportPath), true, "map export writes a local desktop image file");
  check(fs.readFileSync(mapExportPath).subarray(0, 8).toString("hex"), "89504e470d0a1a0a", "map export writes a valid PNG signature");
  check(fs.statSync(mapExportPath).size > 1024, true, "map export contains rendered map content");
  await mapExportDialog.getByRole("button", { name: "关闭地图导出", exact: true }).click();

  await fogkeepMapMarker.click();
  await mapDialog.getByLabel("自定义标记图标文件", { exact: true }).setInputFiles(
    path.join(root, "app", "icon.png")
  );
  await mapDialog.locator(".map-marker-icon-control img").waitFor({ timeout: 30000 });
  check(await fogkeepMapMarker.locator("img.planning-map-marker-icon").count(), 1, "map markers accept a local custom image icon");
  await mapDialog.getByRole("button", { name: "移除自定义标记图标", exact: true }).click();

  await mapDialog.getByRole("button", { name: "地图测距工具", exact: true }).click();
  const measurementStageBox = await mapStage.boundingBox();
  if (measurementStageBox) {
    await page.mouse.click(measurementStageBox.x + measurementStageBox.width * 0.18, measurementStageBox.y + measurementStageBox.height * 0.22);
    await page.mouse.click(measurementStageBox.x + measurementStageBox.width * 0.68, measurementStageBox.y + measurementStageBox.height * 0.62);
  }
  check(await mapDialog.locator(".map-measurement-line.is-complete").count(), 1, "ruler completes a two-point canvas measurement");
  check((await mapDialog.locator(".map-measurement-bar strong").textContent()).includes("千米"), true, "ruler reports calibrated real-world distance");
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-measurement.png"),
    fullPage: false
  });
  await page.waitForTimeout(80);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-measurement.png"),
    fullPage: false
  });
  await mapDialog.getByRole("button", { name: "清除测距", exact: true }).click();
  check(await mapDialog.locator(".map-measurement-line").count(), 0, "measurement can be cleared without changing map content");
  await mapDialog.getByRole("button", { name: "完成地图测距", exact: true }).click();

  await mapDialog.getByRole("button", { name: /^图层 \d+$/ }).click();
  await mapDialog.getByRole("button", { name: "展开地图目录", exact: true }).click();
  check(await mapDialog.locator(".planning-browser").count(), 1, "collapsed layer focus keeps marker-group management one click away");
  await mapDialog.getByRole("button", { name: "新建分组", exact: true }).click();
  await mapDialog.getByLabel("分组名称", { exact: true }).fill("E2E 前线组");
  await mapDialog.getByRole("button", { name: "撤销：编辑标记组", exact: true }).click();
  check(await mapDialog.getByLabel("分组名称", { exact: true }).inputValue() !== "E2E 前线组", true, "unified map undo restores marker-group edits");
  await mapDialog.getByRole("button", { name: "重做：编辑标记组", exact: true }).click();
  check(await mapDialog.getByLabel("分组名称", { exact: true }).inputValue(), "E2E 前线组", "unified map redo reapplies marker-group edits");
  await mapDialog.getByRole("button", { name: /^标记 \d+$/ }).click();
  await mapDialog.getByRole("button", { name: "适配整张地图", exact: true }).click();
  await mapDialog.getByRole("button", { name: "框选标记工具", exact: true }).click();
  const northwarMapMarker = mapDialog.getByRole("button", { name: "地图标记 北境战争", exact: true });
  const fogkeepSelectionBox = await fogkeepMapMarker.boundingBox();
  const northwarSelectionBox = await northwarMapMarker.boundingBox();
  const selectionViewportBox = await interactiveMapViewport.boundingBox();
  if (fogkeepSelectionBox && northwarSelectionBox && selectionViewportBox) {
    const fogkeepCenter = {
      x: fogkeepSelectionBox.x + fogkeepSelectionBox.width / 2,
      y: fogkeepSelectionBox.y + fogkeepSelectionBox.height / 2
    };
    const northwarCenter = {
      x: northwarSelectionBox.x + northwarSelectionBox.width / 2,
      y: northwarSelectionBox.y + northwarSelectionBox.height / 2
    };
    const startX = Math.max(selectionViewportBox.x + 5, Math.min(fogkeepCenter.x, northwarCenter.x) - 58);
    const startY = Math.max(selectionViewportBox.y + 5, Math.min(fogkeepCenter.y, northwarCenter.y) - 58);
    const endX = Math.min(selectionViewportBox.x + selectionViewportBox.width - 5, Math.max(fogkeepCenter.x, northwarCenter.x) + 58);
    const endY = Math.min(selectionViewportBox.y + selectionViewportBox.height - 5, Math.max(fogkeepCenter.y, northwarCenter.y) + 58);
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 5 });
    await page.mouse.up();
  }
  check(
    await mapDialog.locator(".planning-map-marker[aria-pressed='true']").count(),
    2,
    "marquee selection picks the intended visible markers"
  );
  await mapDialog.getByLabel("批量设置标记分组", { exact: true }).selectOption({ label: "E2E 前线组" });
  check(
    await mapDialog.getByLabel("标记所在分组", { exact: true }).locator("option:checked").textContent(),
    "E2E 前线组",
    "multi-selected markers can be assigned to a group in one action"
  );
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-multiselect.png"),
    fullPage: false
  });
  const fogkeepBatchLeft = await fogkeepMapMarker.evaluate((element) => element.style.left);
  const northwarBatchLeft = await northwarMapMarker.evaluate((element) => element.style.left);
  const batchDragBox = await fogkeepMapMarker.boundingBox();
  if (batchDragBox) {
    await page.mouse.move(batchDragBox.x + batchDragBox.width / 2, batchDragBox.y + batchDragBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(batchDragBox.x + batchDragBox.width / 2 + 34, batchDragBox.y + batchDragBox.height / 2 + 18, { steps: 4 });
    await page.mouse.up();
  }
  check(await fogkeepMapMarker.evaluate((element) => element.style.left) !== fogkeepBatchLeft, true, "dragging one selected marker moves the batch");
  check(await northwarMapMarker.evaluate((element) => element.style.left) !== northwarBatchLeft, true, "batch drag preserves the relative marker selection");
  await mapDialog.getByRole("button", { name: "撤销：移动 2 个地图标记", exact: true }).click();
  await page.waitForFunction(
    ({ firstLeft, secondLeft }) => {
      const first = document.querySelector("[aria-label='地图标记 雾鸦堡']");
      const second = document.querySelector("[aria-label='地图标记 北境战争']");
      return first?.style.left === firstLeft && second?.style.left === secondLeft;
    },
    { firstLeft: fogkeepBatchLeft, secondLeft: northwarBatchLeft }
  );
  check(await fogkeepMapMarker.evaluate((element) => element.style.left), fogkeepBatchLeft, "batch movement is undone atomically for the first marker");
  check(await northwarMapMarker.evaluate((element) => element.style.left), northwarBatchLeft, "batch movement is undone atomically for the second marker");
  await mapDialog.getByRole("button", { name: "清除多选", exact: true }).click();

  const visibleStageBox = await mapStage.boundingBox();
  const contextViewportBox = await interactiveMapViewport.boundingBox();
  if (visibleStageBox && contextViewportBox) {
    const contextX = Math.min(visibleStageBox.x + visibleStageBox.width - 30, contextViewportBox.x + contextViewportBox.width - 220);
    const contextY = Math.max(visibleStageBox.y + 60, contextViewportBox.y + 110);
    await page.mouse.click(contextX, contextY, { button: "right" });
  }
  const mapContextMenu = mapDialog.getByRole("menu", { name: "地图快捷操作", exact: true });
  await mapContextMenu.waitFor();
  check(await mapContextMenu.getByRole("menuitem", { name: "在此创建标记", exact: true }).evaluate((element) => element === document.activeElement), true, "map context menu focuses its first available command");
  await page.keyboard.press("ArrowDown");
  check(await mapContextMenu.getByRole("menuitem", { name: "创建标记并开始路线", exact: true }).evaluate((element) => element === document.activeElement), true, "map context menu supports keyboard command navigation");
  await page.keyboard.press("ArrowUp");
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-context-menu.png"),
    fullPage: false
  });
  await mapDialog.getByRole("menuitem", { name: "在此创建标记", exact: true }).click();
  check(await mapDialog.getByRole("button", { name: /^地图标记 / }).count(), 4, "canvas context menu creates a marker at the clicked map position");
  const snappedContextMarker = mapDialog.getByRole("button", { name: /^地图标记 新标记/ }).last();
  const snappedContextPoint = await snappedContextMarker.evaluate((element) => ({
    x: Number.parseFloat(element.style.left),
    y: Number.parseFloat(element.style.top)
  }));
  check(
    Math.abs(snappedContextPoint.x / 10 - Math.round(snappedContextPoint.x / 10)) < 0.01 &&
      Math.abs(snappedContextPoint.y / (100 / 6) - Math.round(snappedContextPoint.y / (100 / 6))) < 0.01,
    true,
    "canvas creation snaps new markers to the configured coordinate grid"
  );

  await fogkeepMapMarker.click({ button: "right" });
  await mapDialog.getByRole("menuitem", { name: "从这里新建路线", exact: true }).click();
  await mapDialog.locator(".map-route-drawing-bar").waitFor();
  await northwarMapMarker.click();
  const capitalMapMarker = mapDialog.getByRole("button", { name: "地图标记 王都", exact: true });
  await capitalMapMarker.click();
  check(await mapDialog.locator(".map-route-stop-node").count(), 3, "route drawing appends map markers as ordered stops");
  await mapDialog.getByRole("button", { name: "移除路线停靠点 2 北境战争", exact: true }).click();
  check(await mapDialog.locator(".map-route-stop-node").count(), 2, "route stop numbers edit the route directly on the canvas");
  await mapDialog.getByRole("button", { name: "撤销：编辑路线停靠点", exact: true }).click();
  check(await mapDialog.locator(".map-route-stop-node").count(), 3, "unified map undo restores a removed route stop");
  await mapDialog.getByRole("button", { name: "重做：编辑路线停靠点", exact: true }).click();
  check(await mapDialog.locator(".map-route-stop-node").count(), 2, "unified map redo removes the route stop again");
  await northwarMapMarker.click();
  await mapDialog.locator(".map-route-drawing-bar").getByRole("button", { name: "撤回最后一个停靠点", exact: true }).click();
  check(await mapDialog.locator(".map-route-stop-node").count(), 2, "route drawing can remove the latest stop without leaving the canvas");
  await northwarMapMarker.click();
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-authoring.png"),
    fullPage: false
  });
  await mapDialog.locator(".map-route-drawing-bar").getByRole("button", { name: "完成路线绘制", exact: true }).click();
  check(await mapDialog.locator(".map-route-segment").count(), 2, "route inspector derives a distance segment for every completed leg");
  check((await mapDialog.locator(".map-route-metrics strong").first().textContent()).includes("千米"), true, "route inspector reports calibrated total distance");
  const routeTravelTimeBefore = await mapDialog.locator(".map-route-metrics strong").nth(1).textContent();
  await mapDialog.getByLabel("路线行进方式", { exact: true }).selectOption("vehicle");
  await mapDialog.getByLabel("路线行进速度", { exact: true }).fill("20");
  await mapDialog.getByLabel("路线每日行进时长", { exact: true }).fill("10");
  check(await mapDialog.locator(".map-route-metrics strong").nth(1).textContent() !== routeTravelTimeBefore, true, "route travel estimate reacts to authored speed and day length");
  const routePathBeforeCurve = await mapDialog.locator(".map-route-layer path.is-active").getAttribute("d");
  await mapDialog.getByRole("button", { name: "平滑曲线", exact: true }).click();
  check(await mapDialog.getByRole("button", { name: "平滑曲线", exact: true }).getAttribute("aria-pressed"), "true", "route geometry can switch to a smooth authored path");
  await mapDialog.getByRole("button", { name: "在路段 1 添加路线控制点", exact: true }).click();
  check(await mapDialog.locator(".map-route-waypoint").count(), 1, "route segments can add draggable free-curve control points");
  check(await mapDialog.locator(".map-route-layer path.is-active").getAttribute("d") !== routePathBeforeCurve, true, "route control points update the rendered vector path");
  await mapDialog.locator(".planning-inspector").evaluate((element) => element.scrollTo({ left: 0, top: 0 }));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-route-metrics.png"),
    fullPage: false
  });
  await mapDialog.locator(".map-route-segment").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-route-segments.png"),
    fullPage: false
  });

  await mapDialog.getByRole("button", { name: "打开地图设置", exact: true }).click();
  await mapDialog.getByLabel("吸附到坐标网格", { exact: true }).uncheck();
  const initialRegionCount = await mapDialog.locator(".map-region-layer polygon[data-region-id]").count();
  check(initialRegionCount >= 1, true, "starter map exposes its authored territory region");
  await mapDialog.getByRole("button", { name: /^区域 \d+$/ }).click();
  check(await mapDialog.getByLabel("区域名称").inputValue(), "北境边区", "region catalog selects the starter territory");
  await mapDialog.getByRole("button", { name: "区域绘制工具", exact: true }).click();
  const regionStageBox = await mapStage.boundingBox();
  if (regionStageBox) {
    const regionPoints = [
      [0.56, 0.67],
      [0.81, 0.65],
      [0.84, 0.87],
      [0.59, 0.9]
    ];
    for (const [x, y] of regionPoints) {
      await page.mouse.click(regionStageBox.x + regionStageBox.width * x, regionStageBox.y + regionStageBox.height * y);
    }
  }
  await mapDialog.locator(".map-region-drawing-bar").waitFor();
  check(await mapDialog.locator(".map-region-draft-vertex").count(), 4, "region drawing records ordered polygon vertices");
  await mapDialog.getByRole("button", { name: "完成区域绘制", exact: true }).click();
  check(
    await mapDialog.locator(".map-region-layer polygon[data-region-id]").count(),
    initialRegionCount + 1,
    "finishing region drawing creates a persistent polygon"
  );
  await mapDialog.getByLabel("区域名称").fill("E2E 南海禁区");
  await mapDialog.getByLabel("区域类型", { exact: true }).selectOption("danger");
  check(
    Number.parseFloat(await mapDialog.locator(".map-region-metrics strong").first().textContent()) > 0,
    true,
    "region inspector reports a non-zero polygon area"
  );
  const regionReferenceSearch = mapDialog.getByLabel("搜索关联对象");
  if (!await regionReferenceSearch.isVisible()) {
    await mapDialog.locator(".planning-inspector .project-reference-add").click();
  }
  await regionReferenceSearch.fill("艾琳");
  await mapDialog.locator(".project-reference-results button").filter({ hasText: "艾琳" }).first().click();
  check(
    await mapDialog.locator(".project-reference-chip").filter({ hasText: "艾琳" }).count(),
    1,
    "region can link directly to a story entity"
  );

  const createdRegionId = await mapDialog.locator(".map-region-layer polygon.is-primary").getAttribute("data-region-id");
  const regionCatalogItems = mapDialog.locator(".planning-browser .planning-item-list > button");
  await regionCatalogItems.filter({ hasText: "北境边区" }).click({ modifiers: ["Control"] });
  check(await mapDialog.locator(".map-region-layer polygon.is-active").count(), 2, "region catalog supports additive multi-selection");
  await mapDialog.getByRole("button", { name: "锁定所选区域", exact: true }).click();
  check(await mapDialog.locator(".map-region-layer polygon.is-active.is-locked").count(), 2, "selected regions can be locked in one action");
  await mapDialog.getByRole("button", { name: "解锁所选区域", exact: true }).click();
  await mapDialog.getByRole("button", { name: "隐藏所选区域", exact: true }).click();
  check(await mapDialog.locator(".map-region-layer polygon.is-active").count(), 0, "selected regions can be hidden in one action");
  await mapDialog.getByRole("button", { name: "显示所选区域", exact: true }).click();
  const isolateRegionsButton = mapDialog.getByRole("button", { name: "仅看所选区域", exact: true });
  await isolateRegionsButton.click();
  const showAllRegionsButton = mapDialog.getByRole("button", { name: "显示全部区域", exact: true });
  check(await showAllRegionsButton.getAttribute("aria-pressed"), "true", "region batch tools can isolate the current selection");
  await showAllRegionsButton.click();
  await mapDialog.getByRole("button", { name: "清除区域多选", exact: true }).click();
  await regionCatalogItems.filter({ hasText: "E2E 南海禁区" }).click();
  const selectedRegionPolygon = mapDialog.locator(`.map-region-layer polygon[data-region-id="${createdRegionId}"]`);
  await page.waitForTimeout(180);
  await selectedRegionPolygon.click({ force: true });
  const pointerFocusViewportBox = await interactiveMapViewport.boundingBox();
  if (pointerFocusViewportBox) {
    await page.mouse.move(
      pointerFocusViewportBox.x + pointerFocusViewportBox.width - 18,
      pointerFocusViewportBox.y + 18
    );
  }
  check(
    await selectedRegionPolygon.evaluate((element) => getComputedStyle(element).outlineStyle),
    "none",
    "pointer-focused regions suppress the Chromium system focus rectangle after pointer exit"
  );
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-region-pointer-focus.png"),
    fullPage: false
  });
  check(await mapDialog.locator(".map-region-selection-outline").count(), 0, "selected region avoids a detached halo layer");
  check(
    await selectedRegionPolygon.evaluate((element) => getComputedStyle(element).strokeWidth),
    "3.5px",
    "selected region highlights its authored boundary directly"
  );
  check(await mapDialog.locator(".map-region-vertex").count(), 0, "selecting a region keeps boundary controls hidden");
  await mapDialog.getByRole("button", { name: "编辑区域边界", exact: true }).click();
  check(await mapDialog.locator(".map-region-vertex").count(), 4, "boundary editing exposes compact vertex handles on demand");
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-region-boundary-editing.png"),
    fullPage: false
  });
  await mapDialog.locator(".map-region-midpoint").first().click();
  check(await mapDialog.locator(".map-region-vertex").count(), 5, "region edge midpoint inserts a new vertex");
  const pointsBeforeVertexDrag = await selectedRegionPolygon.getAttribute("points");
  const firstRegionVertex = mapDialog.locator(".map-region-vertex").first();
  const firstRegionVertexBox = await firstRegionVertex.boundingBox();
  if (firstRegionVertexBox) {
    await page.mouse.move(firstRegionVertexBox.x + firstRegionVertexBox.width / 2, firstRegionVertexBox.y + firstRegionVertexBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(firstRegionVertexBox.x + firstRegionVertexBox.width / 2 + 80, firstRegionVertexBox.y + firstRegionVertexBox.height / 2 - 45, { steps: 5 });
    await page.mouse.up();
  }
  const pointsAfterVertexDrag = await selectedRegionPolygon.getAttribute("points");
  check(pointsAfterVertexDrag !== pointsBeforeVertexDrag, true, "region vertices drag directly on the map canvas");
  await mapDialog.getByRole("button", { name: "撤销：编辑区域边界", exact: true }).click();
  check(await selectedRegionPolygon.getAttribute("points"), pointsBeforeVertexDrag, "unified map undo restores region vertices atomically");
  await mapDialog.getByRole("button", { name: "重做：编辑区域边界", exact: true }).click();
  check(await selectedRegionPolygon.getAttribute("points"), pointsAfterVertexDrag, "unified map redo reapplies the region boundary edit");
  await mapDialog.getByLabel("锁定区域顶点").check();
  check(await mapDialog.locator(".map-region-vertex").count(), 0, "locking a region hides destructive vertex handles");
  check((await selectedRegionPolygon.getAttribute("class")).includes("is-locked"), true, "locked region has a visible protected state");
  await mapDialog.getByLabel("锁定区域顶点").uncheck();
  await mapDialog.getByLabel("显示区域").uncheck();
  check(
    await mapDialog.locator(`.map-region-layer polygon[data-region-id="${createdRegionId}"]`).count(),
    0,
    "region visibility removes its polygon from the canvas"
  );
  await mapDialog.getByLabel("显示区域").check();
  const regionOrderBeforeMove = Number(await mapDialog.getByLabel("区域顺序", { exact: true }).inputValue());
  await mapDialog.getByRole("button", { name: "区域下移一层", exact: true }).click();
  check(
    Number(await mapDialog.getByLabel("区域顺序", { exact: true }).inputValue()) < regionOrderBeforeMove,
    true,
    "region layer order can be changed from the inspector"
  );
  await mapDialog.getByRole("button", { name: "绘制镂空", exact: true }).click();
  const holeMapPoints = await selectedRegionPolygon.evaluate((element) => {
    const points = (element.getAttribute("points") || "")
      .trim()
      .split(/\s+/)
      .map((pair) => {
        const [x, y] = pair.split(",").map(Number);
        return { x, y };
      })
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    if (points.length < 3) throw new Error("selected region has no polygon geometry");
    const inside = (point) => {
      let result = false;
      for (let index = 0, previous = points.length - 1; index < points.length; previous = index++) {
        const currentPoint = points[index];
        const previousPoint = points[previous];
        const crosses = (currentPoint.y > point.y) !== (previousPoint.y > point.y)
          && point.x < ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y))
            / (previousPoint.y - currentPoint.y) + currentPoint.x;
        if (crosses) result = !result;
      }
      return result;
    };
    const bounds = {
      left: Math.min(...points.map((point) => point.x)),
      right: Math.max(...points.map((point) => point.x)),
      top: Math.min(...points.map((point) => point.y)),
      bottom: Math.max(...points.map((point) => point.y))
    };
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    for (const inset of [0.12, 0.08, 0.05, 0.03]) {
      const halfSize = Math.min(width, height) * inset;
      for (let row = 2; row <= 8; row += 1) {
        for (let column = 2; column <= 8; column += 1) {
          const center = {
            x: bounds.left + width * (column / 10),
            y: bounds.top + height * (row / 10)
          };
          const hole = [
            { x: center.x - halfSize, y: center.y - halfSize },
            { x: center.x + halfSize, y: center.y - halfSize },
            { x: center.x + halfSize, y: center.y + halfSize },
            { x: center.x - halfSize, y: center.y + halfSize }
          ];
          if (hole.every(inside)) return hole;
        }
      }
    }
    throw new Error("could not find an interior hole inside the selected region");
  });
  const holeStageBox = await mapStage.boundingBox();
  if (!holeStageBox) throw new Error("map stage is not visible for hole drawing");
  for (const point of holeMapPoints) {
    await page.mouse.click(
      holeStageBox.x + holeStageBox.width * (point.x / 100),
      holeStageBox.y + holeStageBox.height * (point.y / 100)
    );
  }
  await mapDialog.locator(".map-region-drawing-bar").waitFor();
  await mapDialog.getByRole("button", { name: "完成区域绘制", exact: true }).click();
  const holedRegionShape = mapDialog.locator(`.map-region-layer path[data-region-id="${createdRegionId}"]`);
  await holedRegionShape.waitFor();
  check(await holedRegionShape.count(), 1, "region geometry supports authored interior holes");
  check(await holedRegionShape.getAttribute("fill-rule"), "evenodd", "region holes render as true cutouts instead of overlay shapes");
  await mapDialog.locator(".planning-inspector").evaluate((element) => element.scrollTo({ left: 0, top: 0 }));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-fullscreen.png"),
    fullPage: false
  });
  await page.waitForTimeout(80);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-regions.png"),
    fullPage: false
  });
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-fullscreen.png"),
    fullPage: false
  });
  await mapDialog.getByRole("button", { name: "打开地图审阅中心", exact: true }).click();
  const mapReviewDialog = page.getByRole("dialog", { name: "地图审阅中心 苍岚全境图", exact: true });
  await mapReviewDialog.waitFor();
  check(await mapReviewDialog.getAttribute("aria-modal"), "true", "map review center exposes modal semantics");
  check(await mapReviewDialog.locator(".map-review-finding-section").count(), 2, "map review center separates deterministic checks from AI suggestions");
  check(await mapReviewDialog.locator(".map-review-finding").count() > 0, true, "map review center locates live geometry and reference findings");
  await mapReviewDialog.getByRole("tab", { name: /版本对比/ }).click();
  await mapReviewDialog.locator(".map-version-workspace").waitFor();
  await page.waitForFunction(() => {
    const status = document.querySelector(".map-version-list-pane .map-review-status");
    return Boolean(status?.textContent?.trim());
  });
  check(await mapReviewDialog.locator(".map-version-list-pane").count(), 1, "map history is loaded inside the review center");
  await page.screenshot({
    path: path.join(root, "validation", "map-review-center.png"),
    fullPage: false
  });
  await mapReviewDialog.getByRole("button", { name: "关闭地图审阅中心", exact: true }).click();
  await mapDialog.getByRole("button", { name: "适配整张地图", exact: true }).click();
  const highZoomRegionLabel = mapDialog.getByRole("button", { name: "选择地图区域 E2E 南海禁区", exact: true });
  const highZoomRegionLabelBox = await highZoomRegionLabel.boundingBox();
  const highZoomViewportBox = await interactiveMapViewport.boundingBox();
  if (highZoomRegionLabelBox && highZoomViewportBox) {
    const deltaX = highZoomViewportBox.x + highZoomViewportBox.width / 2 - (highZoomRegionLabelBox.x + highZoomRegionLabelBox.width / 2);
    const deltaY = highZoomViewportBox.y + highZoomViewportBox.height / 2 - (highZoomRegionLabelBox.y + highZoomRegionLabelBox.height / 2);
    await page.mouse.move(highZoomViewportBox.x + 34, highZoomViewportBox.y + 34);
    await page.mouse.down({ button: "middle" });
    await page.mouse.move(highZoomViewportBox.x + 34 + deltaX, highZoomViewportBox.y + 34 + deltaY, { steps: 5 });
    await page.mouse.up({ button: "middle" });
  }
  const highZoomButton = mapDialog.getByRole("button", { name: "放大地图", exact: true });
  for (let index = 0; index < 32 && !await highZoomButton.isDisabled(); index += 1) {
    await highZoomButton.click();
  }
  check(await mapZoomValue.textContent(), "400%", "map canvas reaches its maximum authored-detail zoom");
  check(
    await mapStage.evaluate((element) => ({
      layoutWidth: Number.parseFloat(element.style.width) > 4000,
      transform: element.style.transform
    })),
    { layoutWidth: true, transform: "" },
    "high zoom expands the vector layout instead of scaling a cached canvas texture"
  );
  check(
    await highZoomRegionLabel.evaluate((element) => element.style.transform),
    "translate(-50%, -50%)",
    "high-zoom labels render at native screen scale"
  );
  await page.waitForTimeout(120);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-high-zoom.png"),
    fullPage: false
  });
  await mapDialog.getByRole("button", { name: "适配整张地图", exact: true }).click();
  const mapOriginalViewport = await page.evaluate(() => ({ height: window.innerHeight, width: window.innerWidth }));
  await page.setViewportSize({ width: 1100, height: 780 });
  await mapDialog.getByRole("button", { name: "适配整张地图", exact: true }).click();
  await page.waitForTimeout(300);
  check(
    await mapDialog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
    true,
    "map focus layout remains horizontally contained on a compact desktop"
  );
  const compactMapBounds = await mapDialog.evaluate((element) => {
    const canvas = element.querySelector(".map-canvas-column")?.getBoundingClientRect();
    const inspector = element.querySelector(".planning-inspector")?.getBoundingClientRect();
    const toolbar = element.querySelector(".map-canvas-toolbar")?.getBoundingClientRect();
    return {
      canvasRight: canvas?.right ?? 0,
      inspectorLeft: inspector?.left ?? Number.POSITIVE_INFINITY,
      toolbarRight: toolbar?.right ?? 0
    };
  });
  check(compactMapBounds.canvasRight <= compactMapBounds.inspectorLeft + 1, true, "compact map canvas stays outside the inspector column");
  check(compactMapBounds.toolbarRight <= compactMapBounds.inspectorLeft + 1, true, "compact map toolbar stays outside the inspector column");
  await page.screenshot({
    path: path.join(runRoot, "map-workspace-compact-warmup.png"),
    fullPage: false
  });
  await page.waitForTimeout(80);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-compact.png"),
    fullPage: false
  });
  await mapDialog.getByRole("button", { name: "打开地图审阅中心", exact: true }).click();
  const compactReviewDialog = page.getByRole("dialog", { name: "地图审阅中心 苍岚全境图", exact: true });
  await compactReviewDialog.waitFor();
  check(
    await compactReviewDialog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
    true,
    "map review center remains horizontally contained on a compact desktop"
  );
  await page.screenshot({
    path: path.join(root, "validation", "map-review-center-compact.png"),
    fullPage: false
  });
  await compactReviewDialog.getByRole("button", { name: "关闭地图审阅中心", exact: true }).click();
  await page.setViewportSize(mapOriginalViewport);
  await mapDialog.getByRole("button", { name: "适配整张地图", exact: true }).click();
  await mapDialog.getByRole("button", { name: /^标记 \d+$/ }).click();
  await fogkeepMapMarker.click();
  await mapDialog.getByRole("button", { name: "子地图", exact: true }).click();
  const childMapWorkspace = page.locator(".planning-workspace.is-map-fullscreen");
  await childMapWorkspace.getByRole("heading", { name: "雾鸦堡详图", exact: true }).waitFor();
  const childMapSidebarMetrics = await childMapWorkspace.locator(".planning-browser").evaluate((browser) => {
    const savedFilter = browser.querySelector(".map-saved-filter-row")?.getBoundingClientRect();
    const primaryAction = browser.querySelector(".planning-primary-action")?.getBoundingClientRect();
    return {
      actionGap: savedFilter && primaryAction ? Math.round(primaryAction.top - savedFilter.bottom) : 0,
      savedFilterHeight: savedFilter ? Math.round(savedFilter.height) : 0
    };
  });
  check(
    childMapSidebarMetrics.savedFilterHeight <= 40
      && childMapSidebarMetrics.actionGap >= 8
      && childMapSidebarMetrics.actionGap <= 20,
    true,
    "empty child-map catalog keeps filters compact and places its primary action next"
  );
  check(
    await childMapWorkspace.locator(".generated-map .map-region, .generated-map .map-line").count(),
    0,
    "empty child maps do not display fictional sample regions or routes"
  );
  const emptyBasemapControlMetrics = await childMapWorkspace.locator(".map-image-control:not(.has-image)").evaluate((control) => {
    const preview = control.querySelector(".map-image-preview")?.getBoundingClientRect();
    const action = control.querySelector(".planning-file-action")?.getBoundingClientRect();
    return {
      actionHeight: action ? Math.round(action.height) : 0,
      previewHeight: preview ? Math.round(preview.height) : 0
    };
  });
  check(
    Math.abs(emptyBasemapControlMetrics.previewHeight - emptyBasemapControlMetrics.actionHeight) <= 2,
    true,
    "empty basemap preview and picker form one balanced inspector row"
  );
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-child-empty-state.png"),
    fullPage: false
  });
  check(
    await childMapWorkspace.getByLabel("地图上级地图", { exact: true }).locator("option:checked").textContent(),
    "苍岚全境图",
    "child map creation records the current map as its parent"
  );
  check(
    await childMapWorkspace.getByLabel("地图上级入口标记", { exact: true }).locator("option:checked").textContent(),
    "雾鸦堡",
    "child map creation binds the selected marker as its drill-down entry"
  );
  check(
    (await childMapWorkspace.getByLabel("地图层级", { exact: true }).textContent()).includes("苍岚全境图"),
    true,
    "map hierarchy breadcrumb exposes the complete parent path"
  );
  await childMapWorkspace.getByRole("button", { name: "苍岚全境图", exact: true }).click();
  await mapDialog.waitFor();
  check((await fogkeepMapMarker.getAttribute("class")).includes("is-map-entry"), true, "parent markers visibly identify child-map entrances");
  await mapDialog.getByRole("button", { name: "撤销：新建子地图", exact: true }).click();
  check((await fogkeepMapMarker.getAttribute("class")).includes("is-map-entry"), false, "unified map undo removes a newly created child map");
  await mapDialog.getByRole("button", { name: "重做：新建子地图", exact: true }).click();
  check((await fogkeepMapMarker.getAttribute("class")).includes("is-map-entry"), true, "unified map redo restores the child map and its entry binding");
  await fogkeepMapMarker.dblclick();
  await childMapWorkspace.getByRole("heading", { name: "雾鸦堡详图", exact: true }).waitFor();
  await childMapWorkspace.getByLabel("地图名称", { exact: true }).fill("雾鸦堡内城");
  await childMapWorkspace.getByRole("button", { name: "苍岚全境图", exact: true }).click();
  await mapDialog.waitFor();
  await page.waitForTimeout(120);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-hierarchy.png"),
    fullPage: false
  });

  await mapDialog.getByRole("button", { name: "新建剧情阶段", exact: true }).click();
  check(
    await mapDialog.getByLabel("当前剧情阶段", { exact: true }).locator("option:checked").textContent(),
    "剧情阶段 1",
    "new story phases become the active map view"
  );
  await mapDialog.getByLabel("剧情阶段名称", { exact: true }).fill("北境战后");
  await mapDialog.getByLabel("剧情阶段时间点", { exact: true }).selectOption("timeline-northwar");
  check(
    await mapDialog.getByLabel("当前剧情阶段", { exact: true }).locator("option:checked").textContent(),
    "北境战后",
    "story phase names update the map phase switcher immediately"
  );
  await page.screenshot({
    path: path.join(runRoot, "map-workspace-story-phase-warmup.png"),
    fullPage: false
  });
  await page.waitForTimeout(100);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-story-phase.png"),
    fullPage: false
  });

  await fogkeepMapMarker.click();
  const phaseMarkerVisibility = mapDialog.getByLabel("在“北境战后”阶段显示", { exact: true });
  await phaseMarkerVisibility.uncheck();
  check(await mapDialog.locator(".planning-map-marker").filter({ hasText: "雾鸦堡" }).count(), 0, "story phases can hide an individual marker without deleting it");
  await mapDialog.getByRole("button", { name: "撤销：调整阶段内容", exact: true }).click();
  check(await mapDialog.locator(".planning-map-marker").filter({ hasText: "雾鸦堡" }).count(), 1, "phase visibility changes participate in unified map undo");
  await mapDialog.getByRole("button", { name: "重做：调整阶段内容", exact: true }).click();
  check(await mapDialog.locator(".planning-map-marker").filter({ hasText: "雾鸦堡" }).count(), 0, "phase visibility changes participate in unified map redo");

  await mapDialog.getByRole("button", { name: /^区域 \d+\/\d+$/ }).click();
  await mapDialog.locator(".planning-browser .planning-item-list > button").first().click();
  const phaseRegionCount = await mapDialog.locator(".map-region-layer [data-region-id]").count();
  await mapDialog.getByLabel("在“北境战后”阶段显示", { exact: true }).uncheck();
  check(await mapDialog.locator(".map-region-layer [data-region-id]").count(), phaseRegionCount - 1, "story phases independently control region visibility");

  await mapDialog.getByRole("button", { name: /^路线 \d+\/\d+$/ }).click();
  await mapDialog.locator(".planning-browser .planning-item-list > button").first().click();
  const phaseRouteCount = await mapDialog.locator(".map-route-layer path").count();
  await mapDialog.getByLabel("在“北境战后”阶段显示", { exact: true }).uncheck();
  check(await mapDialog.locator(".map-route-layer path").count(), phaseRouteCount - 1, "story phases independently control route visibility");

  await mapDialog.getByRole("button", { name: /^图层 \d+\/\d+$/ }).click();
  const phaseLayerPalette = mapDialog.locator("[aria-label='地图图层栏']");
  await phaseLayerPalette.locator("[data-map-layer-row-id] .map-layer-palette-select").first().click();
  await mapDialog
    .getByRole("tablist", { name: "地图右侧面板", exact: true })
    .getByRole("tab", { name: "属性", exact: true })
    .click();
  await mapDialog.getByLabel("在“北境战后”阶段显示", { exact: true }).uncheck();
  check(await mapDialog.locator(".planning-map-marker").count(), 0, "phase layer visibility hides all markers owned by that layer");
  await mapDialog.getByLabel("在“北境战后”阶段显示", { exact: true }).check();
  await mapDialog.getByLabel("当前剧情阶段", { exact: true }).selectOption("");
  check(await mapDialog.getByRole("button", { name: "地图标记 雾鸦堡", exact: true }).count(), 1, "all-content view restores items hidden only in a story phase");

  await mapDialog.getByRole("button", { name: "退出地图专注模式", exact: true }).click();
  await page.getByRole("button", { name: /^图层 \d+$/ }).click();
  await page.getByText("主要标记", { exact: true }).first().waitFor();
  check(
    await page.getByRole("checkbox", { name: "在地图上显示", exact: true }).isChecked(),
    true,
    "default map layer exposes its visibility control"
  );
  const mapLayerLock = page.getByRole("checkbox", { name: "锁定其中标记", exact: true });
  await mapLayerLock.check();
  const lockedMarker = page.getByRole("button", { name: "地图标记 雾鸦堡", exact: true });
  check((await lockedMarker.getAttribute("class")).includes("is-locked"), true, "locked layers visibly protect their map markers");
  const lockedMarkerStyle = await lockedMarker.getAttribute("style");
  await lockedMarker.focus();
  await lockedMarker.press("ArrowRight");
  check(await lockedMarker.getAttribute("style"), lockedMarkerStyle, "locked markers cannot be moved from the canvas");
  await mapLayerLock.uncheck();

  await page.getByRole("button", { name: "打开地图设置", exact: true }).click();
  check(
    await page.getByRole("button", { name: "添加地图底图", exact: true }).count() >= 2,
    true,
    "map without an image exposes both toolbar and canvas background actions"
  );
  const mapImageViewport = page.getByLabel("交互式地图画布", { exact: true });
  const droppedMapSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#dce9df"/><path d="M80 680L380 180L720 430L1110 120" fill="none" stroke="#23785f" stroke-width="30"/></svg>';
  await mapImageViewport.evaluate((element, svg) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([svg], "E2E-dropped-map.svg", { type: "image/svg+xml" }));
    element.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: transfer }));
  }, droppedMapSvg);
  await page.locator(".map-image-drop-overlay").waitFor();
  check(await page.locator(".map-image-drop-overlay").textContent(), "设为地图底图", "map canvas shows a clear image drop target");
  await page.waitForTimeout(120);
  await page.locator(".map-planning-viewport").screenshot({
    path: path.join(root, "validation", "map-workspace-image-drop.png"),
  });
  await mapImageViewport.evaluate((element, svg) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([svg], "E2E-dropped-map.svg", { type: "image/svg+xml" }));
    element.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }));
  }, droppedMapSvg);
  await page.locator(".map-basemap-surface > img").waitFor();
  check(await page.getByLabel("地图宽度").inputValue(), "1200", "dropped map image applies its natural width");
  check(await page.getByLabel("地图高度").inputValue(), "800", "dropped map image applies its natural height");
  check(await page.locator(".map-image-preview img").count(), 1, "map settings previews the imported background");
  await page.getByRole("button", { name: "移除底图", exact: true }).click();
  check(await page.locator(".map-basemap-surface > img").count(), 0, "map background can be removed without deleting the map");
  check(await page.locator(".map-image-empty-action").count(), 1, "removing a background restores the canvas image action");

  await mapImageViewport.evaluate(async (element) => {
    const canvas = document.createElement("canvas");
    canvas.width = 5000;
    canvas.height = 1000;
    const context = canvas.getContext("2d");
    context.fillStyle = "#d7e8de";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#23785f";
    context.fillRect(150, 390, 4700, 220);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const transfer = new DataTransfer();
    transfer.items.add(new File([blob], "E2E-large-map.png", { type: "image/png" }));
    element.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }));
  });
  await page.waitForFunction(() => {
    const image = document.querySelector(".map-background-image");
    return image?.getAttribute("src")?.startsWith("worldcraft://asset/") && image.naturalWidth === 4096;
  });
  check(await page.getByLabel("地图宽度").inputValue(), "4096", "oversized raster maps are capped to the production canvas width");
  check(await page.getByLabel("地图高度").inputValue(), "819", "oversized raster maps preserve their aspect ratio while optimizing");
  await waitForSaved(page);
  const optimizedMapAsset = await page.evaluate(async () => {
    const loaded = await window.worldcraftStore.loadWorkspace();
    const asset = loaded.data.assets.find((item) => item.originalName === "E2E-large-map.png");
    const map = loaded.data.maps.find((item) => item.id === "map-canglan");
    return {
      kind: asset?.kind || "",
      storedName: asset?.storedName || "",
      mapUrl: map?.imageUrl || ""
    };
  });
  check(
    optimizedMapAsset.kind === "map"
      && /^map-[a-f0-9]{24}\.png$/.test(optimizedMapAsset.storedName)
      && optimizedMapAsset.mapUrl === `worldcraft://asset/${optimizedMapAsset.storedName}`,
    true,
    "map uploads are content-addressed local assets instead of embedded database payloads"
  );
  check(
    fs.existsSync(path.join(userDataDir, "assets", optimizedMapAsset.storedName)),
    true,
    "optimized map pixels are stored in the local asset directory"
  );
  await page.getByRole("button", { name: "移除底图", exact: true }).click();

  const selectedMapSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#d8e8dd"/><path d="M100 760L450 210L860 470L1490 110" fill="none" stroke="#1d7358" stroke-width="38"/><circle cx="860" cy="470" r="75" fill="#d6a848"/></svg>';
  const [mapImageChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.locator(".map-canvas-toolbar").getByRole("button", { name: "添加地图底图", exact: true }).click()
  ]);
  await mapImageChooser.setFiles({
    name: "E2E-map-background.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(selectedMapSvg)
  });
  await page.waitForFunction(() => document.querySelector(".map-basemap-surface > img")?.getAttribute("src")?.startsWith("worldcraft://asset/"));
  check(await page.getByLabel("地图宽度").inputValue(), "1600", "selected map image updates the canvas width without distortion");
  check(await page.getByLabel("地图高度").inputValue(), "900", "selected map image updates the canvas height without distortion");
  check(await page.locator(".map-minimap > img").count(), 1, "minimap uses the selected map background");
  check(
    await page.locator(".map-canvas-toolbar").getByRole("button", { name: "更换地图底图", exact: true }).count(),
    1,
    "toolbar changes from add to replace after image import"
  );
  const mapImageControlSpacing = await page.locator(".map-image-control").evaluate((element) => {
    const preview = element.querySelector(".map-image-preview")?.getBoundingClientRect();
    const actions = element.querySelector(".map-image-actions")?.getBoundingClientRect();
    const buttons = [...element.querySelectorAll(".map-image-actions > button")]
      .map((button) => button.getBoundingClientRect());
    return {
      columnGap: preview && actions ? Math.round(actions.left - preview.right) : 0,
      buttonGap: buttons.length > 1 ? Math.round(buttons[1].top - buttons[0].bottom) : 0
    };
  });
  check(
    mapImageControlSpacing.columnGap >= 12 && mapImageControlSpacing.buttonGap >= 8,
    true,
    "map image preview and actions retain clear spacing in the inspector"
  );
  check(
    {
      rotation: await page.getByLabel("底图旋转角度").inputValue(),
      scale: await page.getByLabel("底图缩放比例").inputValue(),
      x: await page.getByLabel("底图横向位置").inputValue(),
      y: await page.getByLabel("底图纵向位置").inputValue()
    },
    { rotation: "0", scale: "100", x: "0", y: "0" },
    "new map images start centered at their natural size"
  );

  await page.locator(".map-canvas-toolbar").getByRole("button", { name: "调整地图底图", exact: true }).click();
  const imageTransformBox = page.getByLabel("地图底图变换框", { exact: true });
  await imageTransformBox.waitFor();
  await page.waitForTimeout(120);
  check(
    await imageTransformBox.getByRole("button").count(),
    6,
    "canvas image transform exposes move, rotate and four-corner scale handles"
  );

  const moveImageHandle = imageTransformBox.getByRole("button", { name: "移动地图底图", exact: true });
  let moveHandleBox = await moveImageHandle.boundingBox();
  if (!moveHandleBox) throw new Error("map image move handle is not visible");
  await page.mouse.move(moveHandleBox.x + moveHandleBox.width / 2, moveHandleBox.y + moveHandleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(moveHandleBox.x + moveHandleBox.width / 2 + 64, moveHandleBox.y + moveHandleBox.height / 2 + 32, { steps: 5 });
  await page.mouse.up();
  await page.waitForFunction(() => Math.abs(Number(document.querySelector("[aria-label='底图横向位置']")?.value || 0)) > 1);
  check(
    Math.abs(Number(await page.getByLabel("底图横向位置").inputValue())) > 1
      && Math.abs(Number(await page.getByLabel("底图纵向位置").inputValue())) > 1,
    true,
    "map image can be moved directly on the canvas"
  );

  moveHandleBox = await moveImageHandle.boundingBox();
  const rotateImageHandle = imageTransformBox.getByRole("button", { name: "旋转地图底图", exact: true });
  const rotateHandleBox = await rotateImageHandle.boundingBox();
  const rotateHandleHitTest = await inspectHitTarget(rotateImageHandle);
  if (!moveHandleBox || !rotateHandleBox || !rotateHandleHitTest.clickable) {
    throw new Error(`map image rotation handle is not visible: ${JSON.stringify(rotateHandleHitTest)}`);
  }
  const imageCenter = {
    x: moveHandleBox.x + moveHandleBox.width / 2,
    y: moveHandleBox.y + moveHandleBox.height / 2
  };
  const rotateRadius = Math.hypot(
    rotateHandleBox.x + rotateHandleBox.width / 2 - imageCenter.x,
    rotateHandleBox.y + rotateHandleBox.height / 2 - imageCenter.y
  );
  const basemapRotationBeforeDrag = Number(await page.getByLabel("底图旋转角度").inputValue());
  await page.mouse.move(rotateHandleBox.x + rotateHandleBox.width / 2, rotateHandleBox.y + rotateHandleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(imageCenter.x + rotateRadius, imageCenter.y, { steps: 7 });
  await page.mouse.up();
  await page.waitForFunction(
    (before) => Math.abs(Number(document.querySelector("[aria-label='底图旋转角度']")?.value || 0) - before) > 5,
    basemapRotationBeforeDrag
  );
  check(
    Math.abs(Number(await page.getByLabel("底图旋转角度").inputValue()) - basemapRotationBeforeDrag) > 5,
    true,
    "map image can be rotated directly on the canvas"
  );

  await page.getByRole("button", { name: "适配全部画布内容", exact: true }).click();
  await page.waitForTimeout(250);
  moveHandleBox = await moveImageHandle.boundingBox();
  const scaleImageHandles = imageTransformBox.locator("[data-image-transform-handle='scale']");
  const scaleHandleHitTests = [];
  let scaleImageHandle = null;
  let scaleHandleBox = null;
  for (let index = 0; index < await scaleImageHandles.count(); index += 1) {
    const candidate = scaleImageHandles.nth(index);
    const hitTest = await inspectHitTarget(candidate);
    scaleHandleHitTests.push(hitTest);
    if (hitTest.clickable) {
      scaleImageHandle = candidate;
      scaleHandleBox = await candidate.boundingBox();
      break;
    }
  }
  if (!moveHandleBox || !scaleImageHandle || !scaleHandleBox) {
    throw new Error(`map image has no visible scale handle: ${JSON.stringify(scaleHandleHitTests)}`);
  }
  const scaleCenter = {
    x: moveHandleBox.x + moveHandleBox.width / 2,
    y: moveHandleBox.y + moveHandleBox.height / 2
  };
  const scaleStart = {
    x: scaleHandleBox.x + scaleHandleBox.width / 2,
    y: scaleHandleBox.y + scaleHandleBox.height / 2
  };
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-basemap-transform-compact.png"),
    fullPage: false
  });
  const basemapScaleBeforeDrag = Number(await page.getByLabel("底图缩放比例").inputValue());
  await page.mouse.move(scaleStart.x, scaleStart.y);
  await page.mouse.down();
  await page.mouse.move(
    scaleCenter.x + (scaleStart.x - scaleCenter.x) * 1.4,
    scaleCenter.y + (scaleStart.y - scaleCenter.y) * 1.4,
    { steps: 6 }
  );
  await page.mouse.up();
  await page.waitForFunction(
    (before) => Math.abs(Number(document.querySelector("[aria-label='底图缩放比例']")?.value || 0) - before) > 1,
    basemapScaleBeforeDrag
  );
  check(
    Math.abs(Number(await page.getByLabel("底图缩放比例").inputValue()) - basemapScaleBeforeDrag) > 1,
    true,
    "map image can be resized directly on the canvas"
  );

  await page.getByLabel("底图横向位置").fill("12");
  await page.getByLabel("底图纵向位置").fill("-8");
  await page.getByLabel("底图缩放比例").fill("135");
  await page.getByLabel("底图旋转角度").fill("30");
  check(
    await page.locator(".map-background-image").evaluate((element) => ({
      left: element.style.left,
      top: element.style.top,
      transform: element.style.transform
    })),
    {
      left: "62%",
      top: "42%",
      transform: "translate(-50%, -50%) rotate(30deg) scale(1.35, 1.35)"
    },
    "precise image transform values update the canvas immediately"
  );
  await page.waitForTimeout(950);
  await page.getByRole("button", { name: "底图向右旋转 90 度", exact: true }).click();
  check(await page.getByLabel("底图旋转角度").inputValue(), "120", "map background quick rotation creates a unified history entry");
  await page.locator(".map-canvas-toolbar").getByRole("button", { name: "撤销：调整地图底图", exact: true }).click();
  check(await page.getByLabel("底图旋转角度").inputValue(), "30", "unified map undo restores the previous background rotation");
  await page.locator(".map-canvas-toolbar").getByRole("button", { name: "重做：调整地图底图", exact: true }).click();
  check(await page.getByLabel("底图旋转角度").inputValue(), "120", "unified map redo reapplies background rotation");
  await page.locator(".map-canvas-toolbar").getByRole("button", { name: "撤销：调整地图底图", exact: true }).click();
  check(await page.getByLabel("底图旋转角度").inputValue(), "30", "background rotation returns to its persisted final value");
  await mapImageViewport.scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-image-transform.png"),
    fullPage: false
  });
  await page.getByRole("button", { name: "复位底图变换", exact: true }).click();
  check(
    {
      rotation: await page.getByLabel("底图旋转角度").inputValue(),
      scale: await page.getByLabel("底图缩放比例").inputValue(),
      x: await page.getByLabel("底图横向位置").inputValue(),
      y: await page.getByLabel("底图纵向位置").inputValue()
    },
    { rotation: "0", scale: "100", x: "0", y: "0" },
    "map image transform can be reset in one action"
  );
  await page.getByLabel("底图横向位置").fill("12");
  await page.getByLabel("底图纵向位置").fill("-8");
  await page.getByLabel("底图缩放比例").fill("135");
  await page.getByLabel("底图旋转角度").fill("30");
  await page.locator(".map-canvas-toolbar").getByRole("button", { name: "完成底图调整", exact: true }).click();
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-image-background.png"),
    fullPage: false
  });
  await page.locator(".map-image-transform-settings").scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-image-settings.png"),
    fullPage: false
  });

  await page.getByRole("button", { name: /^图层 \d+$/ }).click();
  await page.locator(".planning-browser .planning-item-list > button").first().click();
  const mapLayerSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><path d="M120 700L420 160L790 260L1080 690Z" fill="#d45442" fill-opacity=".58"/><circle cx="760" cy="360" r="130" fill="none" stroke="#f4cb4d" stroke-width="36"/></svg>';
  const [mapLayerImageChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("button", { name: "添加图层图片", exact: true }).click()
  ]);
  await mapLayerImageChooser.setFiles({
    name: "E2E-map-overlay.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(mapLayerSvg)
  });
  await page.waitForFunction(() => document.querySelector(".map-layer-image")?.getAttribute("src")?.startsWith("worldcraft://asset/"));
  check(await page.locator(".map-layer-image").count(), 1, "map layers can carry an independent local image overlay");
  await page.getByLabel("地图图层图片变换框", { exact: true }).waitFor();
  check(await page.getByRole("button", { name: "完成画布调整", exact: true }).count(), 1, "newly imported layer images enter free transform immediately");
  await page.getByRole("button", { name: "完成画布调整", exact: true }).click();
  check(await page.locator(".map-minimap > img").count(), 2, "minimap composes the map background and image layers together");
  await page.getByLabel("图层图片混合模式", { exact: true }).selectOption("multiply");
  await page.getByLabel("图层图片透明度", { exact: true }).fill("0.45");
  await page.getByLabel("图层图片横向位置", { exact: true }).fill("18");
  await page.getByLabel("图层图片纵向位置", { exact: true }).fill("-6");
  await page.getByLabel("图层图片缩放比例", { exact: true }).fill("70");
  await page.getByLabel("图层图片旋转角度", { exact: true }).fill("-25");
  check(
    await page.locator(".map-layer-image").evaluate((element) => ({
      left: element.style.left,
      mixBlendMode: element.style.mixBlendMode,
      opacity: element.style.opacity,
      top: element.style.top,
      transform: element.style.transform
    })),
    {
      left: "68%",
      mixBlendMode: "multiply",
      opacity: "0.45",
      top: "44%",
      transform: "translate(-50%, -50%) rotate(-25deg) scale(0.7, 0.7)"
    },
    "image layer position, size, rotation, opacity and blending update the canvas immediately"
  );
  await page.waitForTimeout(950);
  await page.getByRole("button", { name: "最大化地图工作区", exact: true }).click();
  const imageLayerDialog = page.locator(".planning-workspace.is-map-fullscreen");
  await imageLayerDialog.waitFor();
  await page.waitForFunction(() => !document.querySelector(".planning-workspace.is-map-fullscreen .planning-browser"));
  check(await imageLayerDialog.locator(".planning-browser").count(), 0, "fullscreen image-layer editing starts with the duplicate catalog collapsed");
  const imageLayerDockTabs = imageLayerDialog.getByRole("tablist", { name: "地图右侧面板", exact: true });
  const imageLayerPropertiesTab = imageLayerDockTabs.getByRole("tab", { name: "属性", exact: true });
  const imageLayersTab = imageLayerDockTabs.getByRole("tab", { name: /^图层 \d+$/ });
  const imageLayerPalette = imageLayerDialog.locator("[aria-label='地图图层栏']");
  await imageLayerPalette.waitFor();
  check(await imageLayersTab.getAttribute("aria-selected"), "true", "fullscreen layer mode opens directly on the layer dock");
  check(await imageLayerPalette.locator("[data-map-layer-row-id] .map-layer-palette-thumbnail img").count(), 1, "layer dock shows image thumbnails without duplicating image controls");
  await imageLayerPalette.getByRole("button", { name: "自由变换当前图层", exact: true }).click();
  await imageLayerDialog.getByLabel("地图图层图片变换框", { exact: true }).waitFor();
  check(await imageLayerPalette.getByRole("button", { name: "完成当前图层自由变换", exact: true }).count(), 1, "layer dock exposes direct paint-editor-style free transform");
  await imageLayerPalette.getByRole("button", { name: "完成当前图层自由变换", exact: true }).click();
  await page.screenshot({
    path: path.join(root, "validation", "map-layer-palette.png"),
    fullPage: false
  });
  await imageLayerPropertiesTab.click();
  check(await imageLayerDialog.getByLabel("图层图片混合模式", { exact: true }).inputValue(), "multiply", "layer properties keep the selected image blend mode");
  check(await imageLayerDialog.getByLabel("图层图片透明度", { exact: true }).inputValue(), "0.45", "layer properties keep the selected image opacity");
  await imageLayerDialog.locator(".planning-inspector").evaluate((element) => element.scrollTo({ left: 0, top: 0 }));
  await imageLayerDialog.getByRole("button", { name: "在画布上调整", exact: true }).click();
  const layerImageTransformBox = imageLayerDialog.getByLabel("地图图层图片变换框", { exact: true });
  await layerImageTransformBox.waitFor();
  const moveLayerImageHandle = layerImageTransformBox.getByRole("button", { name: "移动图层图片", exact: true });
  const moveLayerImageBox = await moveLayerImageHandle.boundingBox();
  if (!moveLayerImageBox) throw new Error("map layer image move handle is not visible");
  await page.mouse.move(moveLayerImageBox.x + moveLayerImageBox.width / 2, moveLayerImageBox.y + moveLayerImageBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(moveLayerImageBox.x + moveLayerImageBox.width / 2 + 54, moveLayerImageBox.y + moveLayerImageBox.height / 2 + 24, { steps: 5 });
  await page.mouse.up();
  await page.waitForFunction(() => Number(document.querySelector("[aria-label='图层图片横向位置']")?.value || 0) !== 18);
  check(Number(await imageLayerDialog.getByLabel("图层图片横向位置", { exact: true }).inputValue()) !== 18, true, "image layers can be moved directly on the map canvas");
  const scaleLayerImageHandle = layerImageTransformBox.getByRole("button", { name: "缩放图层图片", exact: true });
  const scaleLayerImageBox = await scaleLayerImageHandle.boundingBox();
  if (!scaleLayerImageBox) throw new Error("map layer image scale handle is not visible");
  const scaleBeforeDrag = Number(await imageLayerDialog.getByLabel("图层图片缩放比例", { exact: true }).inputValue());
  await page.mouse.move(scaleLayerImageBox.x + scaleLayerImageBox.width / 2, scaleLayerImageBox.y + scaleLayerImageBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(scaleLayerImageBox.x + scaleLayerImageBox.width / 2 + 42, scaleLayerImageBox.y + scaleLayerImageBox.height / 2 + 28, { steps: 5 });
  await page.mouse.up();
  await page.waitForFunction((before) => Number(document.querySelector("[aria-label='图层图片缩放比例']")?.value || 0) !== before, scaleBeforeDrag);
  check(Number(await imageLayerDialog.getByLabel("图层图片缩放比例", { exact: true }).inputValue()) !== scaleBeforeDrag, true, "image layers resize from a visible corner handle");
  await imageLayerDialog.locator(".map-canvas-toolbar").getByRole("button", { name: "撤销：调整图层图片", exact: true }).click();
  check(Number(await imageLayerDialog.getByLabel("图层图片缩放比例", { exact: true }).inputValue()), scaleBeforeDrag, "image layer canvas resizing participates in unified undo");
  check(await imageLayerDialog.getByLabel("图层图片横向位置", { exact: true }).inputValue(), "18", "one unified undo restores the layer before its move and resize session");
  await imageLayerDialog.locator(".map-canvas-toolbar").getByRole("button", { name: "重做：调整图层图片", exact: true }).click();
  await imageLayerDialog.getByRole("button", { name: "完成画布调整", exact: true }).click();

  await imageLayerDialog.getByLabel("当前剧情阶段", { exact: true }).selectOption({ label: "北境战后" });
  await imageLayerDialog.getByLabel("在“北境战后”阶段显示", { exact: true }).uncheck();
  check(await imageLayerDialog.locator(".map-layer-image").count(), 0, "story phase layer visibility also controls its image overlay");
  await imageLayerDialog.getByLabel("在“北境战后”阶段显示", { exact: true }).check();
  await imageLayerDialog.getByLabel("当前剧情阶段", { exact: true }).selectOption("");
  await page.screenshot({
    path: path.join(runRoot, "map-workspace-image-layer-warmup.png"),
    fullPage: false
  });
  await page.waitForTimeout(100);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-image-layer.png"),
    fullPage: false
  });

  await imageLayersTab.click();
  await imageLayerPalette.waitFor();
  const originalPaletteLayerCount = await imageLayerPalette.locator("[data-map-layer-row-id]").count();
  await imageLayerPalette.getByRole("button", { name: "新建空图层", exact: true }).click();
  await page.waitForFunction((count) => document.querySelectorAll("[data-map-layer-row-id]").length === count + 1, originalPaletteLayerCount);
  check(await imageLayerPalette.locator("[data-map-layer-row-id]").count(), originalPaletteLayerCount + 1, "layer palette creates an empty layer in place");
  const createdPaletteLayer = imageLayerPalette.getByRole("button", { name: "选择图层 图层 1", exact: true });
  await createdPaletteLayer.waitFor();
  const createdPaletteRow = createdPaletteLayer.locator("xpath=ancestor::*[@data-map-layer-row-id]");
  check(await createdPaletteRow.getAttribute("draggable"), "true", "the full layer row is directly draggable like a paint editor stack");
  const paletteOrderBeforeMove = await imageLayerPalette.locator("[data-map-layer-row-id]").evaluateAll((rows) => rows.map((row) => row.getAttribute("data-map-layer-row-id")));
  const lowerPaletteRow = imageLayerPalette.locator("[data-map-layer-row-id]").nth(1);
  const lowerPaletteRowBox = await lowerPaletteRow.boundingBox();
  if (!lowerPaletteRowBox) throw new Error("lower map layer row is not visible for drag sorting");
  await createdPaletteRow.dragTo(lowerPaletteRow, {
    targetPosition: {
      x: Math.max(1, lowerPaletteRowBox.width / 2),
      y: Math.max(1, lowerPaletteRowBox.height - 2)
    }
  });
  const paletteOrderAfterMove = await imageLayerPalette.locator("[data-map-layer-row-id]").evaluateAll((rows) => rows.map((row) => row.getAttribute("data-map-layer-row-id")));
  check(JSON.stringify(paletteOrderAfterMove) !== JSON.stringify(paletteOrderBeforeMove), true, "dragging a layer row persists paint-style layer ordering");
  await imageLayerPalette.getByRole("button", { name: "图层上移", exact: true }).click();
  await imageLayerPalette.getByRole("button", { name: "复制当前图层", exact: true }).click();
  check(await imageLayerPalette.getByRole("button", { name: "选择图层 图层 1 副本", exact: true }).count(), 1, "layer palette duplicates the selected layer");
  page.once("dialog", (dialog) => dialog.accept());
  await imageLayerPalette.getByRole("button", { name: "删除当前图层", exact: true }).click();
  await page.waitForFunction((count) => document.querySelectorAll("[data-map-layer-row-id]").length === count + 1, originalPaletteLayerCount);
  await imageLayerPalette.getByRole("button", { name: "选择图层 图层 1", exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await imageLayerPalette.getByRole("button", { name: "删除当前图层", exact: true }).click();
  await page.waitForFunction((count) => document.querySelectorAll("[data-map-layer-row-id]").length === count, originalPaletteLayerCount);
  check(await imageLayerPalette.locator("[data-map-layer-row-id]").count(), originalPaletteLayerCount, "temporary palette layers delete without disturbing the default layer");
  const [batchImageLayerChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    imageLayerPalette.getByRole("button", { name: "导入图片为新图层", exact: true }).click()
  ]);
  await batchImageLayerChooser.setFiles([
    {
      name: "E2E-batch-overlay-one.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(mapLayerSvg.replace("#d45442", "#2d8f72"))
    },
    {
      name: "E2E-batch-overlay-two.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(mapLayerSvg.replace("#d45442", "#7a55a2"))
    }
  ]);
  await page.waitForFunction((count) => (
    document.querySelectorAll("[data-map-layer-row-id]").length === count + 2
    && document.querySelectorAll(".map-layer-image").length === 3
  ), originalPaletteLayerCount);
  check(
    await imageLayerPalette.locator("[data-map-layer-row-id] .map-layer-palette-thumbnail img").count(),
    3,
    "layer palette imports multiple decoration files in one batch"
  );
  const batchTransformDone = imageLayerPalette.getByRole("button", { name: "完成当前图层自由变换", exact: true });
  if (await batchTransformDone.count()) await batchTransformDone.click();
  for (const title of ["E2E-batch-overlay-two", "E2E-batch-overlay-one"]) {
    await imageLayerPalette.getByRole("button", { name: `选择图层 ${title}`, exact: true }).click();
    page.once("dialog", (dialog) => dialog.accept());
    await imageLayerPalette.getByRole("button", { name: "删除当前图层", exact: true }).click();
  }
  await page.waitForFunction((count) => (
    document.querySelectorAll("[data-map-layer-row-id]").length === count
    && document.querySelectorAll(".map-layer-image").length === 1
  ), originalPaletteLayerCount);
  const [newImageLayerChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    imageLayerPalette.getByRole("button", { name: "导入图片为新图层", exact: true }).click()
  ]);
  await newImageLayerChooser.setFiles({
    name: "E2E-map-overlay-second.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(mapLayerSvg.replace("#d45442", "#2563a8"))
  });
  await page.waitForFunction((count) => document.querySelectorAll("[data-map-layer-row-id]").length === count + 1, originalPaletteLayerCount);
  await page.waitForFunction(() => document.querySelectorAll(".map-layer-image").length === 2);
  check(await imageLayerPalette.locator("[data-map-layer-row-id] .map-layer-palette-thumbnail img").count(), 2, "layer palette imports a chosen image directly into a new layer");
  await imageLayerDialog.getByLabel("地图图层图片变换框", { exact: true }).waitFor();
  check(await imageLayerPalette.getByRole("button", { name: "完成当前图层自由变换", exact: true }).count(), 1, "new image layers stay selected and ready to arrange from the layer dock");
  await imageLayerPalette.getByRole("button", { name: "完成当前图层自由变换", exact: true }).click();
  const directCanvasImage = imageLayerDialog.getByRole("button", {
    name: "选择图片图层 E2E-map-overlay-second",
    exact: true
  });
  await directCanvasImage.click();
  await imageLayerDialog.getByLabel("地图图层图片变换框", { exact: true }).waitFor();
  check(
    await imageLayerPalette.getByRole("button", { name: "完成当前图层自由变换", exact: true }).count(),
    1,
    "clicking an image on the canvas selects it for direct transform"
  );
  await imageLayerPalette.getByRole("button", { name: "完成当前图层自由变换", exact: true }).click();
  const imageRows = imageLayerPalette.locator("[data-map-layer-row-id]:has(.map-layer-palette-thumbnail img)");
  await imageRows.nth(0).locator(".map-layer-palette-select").click();
  await imageRows.nth(1).locator(".map-layer-palette-select").click({ modifiers: ["Shift"] });
  check(
    await imageLayerPalette.locator("[data-map-layer-row-id].is-selected").count(),
    2,
    "Shift-click selects multiple image layers in the paint-style stack"
  );
  await imageLayerPalette.getByRole("button", { name: "左对齐图片图层", exact: true }).click();
  const alignedImageLefts = await imageLayerDialog.locator(".map-layer-image").evaluateAll((images) => (
    images.map((image) => image.getBoundingClientRect().left)
  ));
  check(
    Math.abs(alignedImageLefts[0] - alignedImageLefts[1]) < 2,
    true,
    "multi-selected image layers align against their rendered bounds"
  );
  await imageLayerPalette.getByRole("button", { name: "水平翻转图片图层", exact: true }).click();
  check(
    await imageLayerDialog.locator(".map-layer-image").evaluateAll((images) => (
      images.every((image) => image.style.transform.includes("scale(-"))
    )),
    true,
    "multi-selected image layers flip together"
  );
  await imageLayerPalette.getByRole("button", { name: "水平翻转图片图层", exact: true }).click();
  await imageLayerPalette.getByRole("button", { name: "组合选中的图片图层", exact: true }).click();
  check(await imageLayerPalette.locator("[data-map-layer-row-id].is-grouped").count(), 2, "selected image layers form a persistent transform group");
  const multiTransformButton = imageLayerPalette.getByRole("button", { name: "自由变换 2 个图片图层", exact: true });
  await multiTransformButton.click();
  const multiTransformFrame = imageLayerDialog.getByLabel("地图多图层图片变换框 2", { exact: true });
  await multiTransformFrame.waitFor();
  await page.screenshot({
    path: path.join(root, "validation", "map-layer-multi-transform.png"),
    fullPage: false
  });
  const groupMoveHandle = multiTransformFrame.getByRole("button", { name: "移动 2 个图片图层", exact: true });
  const groupMoveBox = await groupMoveHandle.boundingBox();
  if (!groupMoveBox) throw new Error("multi-layer transform frame is not visible");
  const groupLeftsBeforeDrag = await imageLayerDialog.locator(".map-layer-image").evaluateAll((images) => images.map((image) => image.style.left));
  await page.mouse.move(groupMoveBox.x + groupMoveBox.width / 2, groupMoveBox.y + groupMoveBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(groupMoveBox.x + groupMoveBox.width / 2 + 36, groupMoveBox.y + groupMoveBox.height / 2 + 18, { steps: 5 });
  await page.mouse.up();
  await page.waitForFunction((before) => (
    Array.from(document.querySelectorAll(".map-layer-image")).some((image, index) => image.style.left !== before[index])
  ), groupLeftsBeforeDrag);
  check(
    await imageLayerDialog.locator(".map-layer-image").evaluateAll((images, before) => (
      images.every((image, index) => image.style.left !== before[index])
    ), groupLeftsBeforeDrag),
    true,
    "one transform frame moves every selected image layer atomically"
  );
  check(
    await imageLayerDialog.locator(".map-canvas-toolbar").getByRole("button", { name: "撤销：变换 2 个图片图层", exact: true }).count(),
    1,
    "multi-layer transforms create one unified undo entry"
  );
  await imageLayerPalette.getByRole("button", { name: "完成 2 个图片图层自由变换", exact: true }).click();
  await imageLayerPalette.getByRole("button", { name: "取消图片图层组合", exact: true }).click();
  check(await imageLayerPalette.locator("[data-map-layer-row-id].is-grouped").count(), 0, "image layer groups can be dissolved without flattening images");
  await imageRows.nth(0).locator(".map-layer-palette-select").click();
  const mergeSourceRowId = await imageLayerPalette.locator("[data-map-layer-row-id]").first().getAttribute("data-map-layer-row-id");
  const mergeTargetRowId = await imageLayerPalette.locator("[data-map-layer-row-id]").nth(1).getAttribute("data-map-layer-row-id");
  const originalImageLayerSrc = await imageLayerDialog.locator(".map-layer-image").first().getAttribute("src");
  const mergeDownButton = imageLayerPalette.getByRole("button", { name: "向下合并图层", exact: true });
  check(await mergeDownButton.isEnabled(), true, "an unlocked visible image layer can merge into its direct lower neighbor");
  await mergeDownButton.click();
  await page.waitForFunction((count) => {
    const status = document.querySelector(".compact-save-status span")?.textContent || "";
    return document.querySelectorAll("[data-map-layer-row-id]").length === count
      || status.startsWith("图层合并失败");
  }, originalPaletteLayerCount);
  const mergeFailureStatus = await page.locator(".compact-save-status span").textContent();
  if (mergeFailureStatus?.startsWith("图层合并失败")) {
    throw new Error(`map layer merge failed in app: ${mergeFailureStatus}`);
  }
  await page.waitForFunction(() => document.querySelectorAll(".map-layer-image").length === 1);
  check(await imageLayerPalette.locator("[data-map-layer-row-id]").first().getAttribute("data-map-layer-row-id"), mergeTargetRowId, "merge down keeps the lower layer as the resulting layer");
  check((await imageLayerDialog.locator(".map-layer-image").getAttribute("src")) !== originalImageLayerSrc, true, "merge down bakes both decorations into a new local image");
  check(await imageLayerDialog.locator(".map-canvas-toolbar").getByRole("button", { name: "撤销：向下合并图层", exact: true }).count(), 1, "layer merging participates in unified map undo");
  await page.screenshot({
    path: path.join(root, "validation", "map-layer-merge.png"),
    fullPage: false
  });
  await imageLayerDialog.locator(".map-canvas-toolbar").getByRole("button", { name: "撤销：向下合并图层", exact: true }).click();
  await page.waitForFunction((count) => document.querySelectorAll("[data-map-layer-row-id]").length === count + 1, originalPaletteLayerCount);
  await page.waitForFunction(() => document.querySelectorAll(".map-layer-image").length === 2);
  check(await imageLayerPalette.locator(`[data-map-layer-row-id='${mergeSourceRowId}']`).count(), 1, "undo restores the source layer after a merge");
  await imageLayerPalette.locator(`[data-map-layer-row-id='${mergeSourceRowId}'] .map-layer-palette-select`).click();
  page.once("dialog", (dialog) => dialog.accept());
  await imageLayerPalette.getByRole("button", { name: "删除当前图层", exact: true }).click();
  await page.waitForFunction((count) => document.querySelectorAll("[data-map-layer-row-id]").length === count, originalPaletteLayerCount);

  await imageLayerDialog.getByRole("button", { name: "展开地图目录", exact: true }).click();
  await imageLayerDialog.getByRole("button", { name: /^标记 \d+$/ }).click();
  await imageLayerDialog.getByRole("button", { name: "手形平移工具", exact: true }).click();
  await imageLayerDialog.getByRole("button", { name: "适配整张地图", exact: true }).click();
  const infiniteViewport = imageLayerDialog.getByLabel("交互式地图画布", { exact: true });
  const infiniteStage = imageLayerDialog.locator(".map-planning-stage");
  const infiniteViewportBox = await infiniteViewport.boundingBox();
  if (!infiniteViewportBox) throw new Error("infinite map viewport is not visible");
  await page.mouse.move(
    infiniteViewportBox.x + 28,
    infiniteViewportBox.y + 28
  );
  await page.mouse.down();
  await page.mouse.move(
    infiniteViewportBox.x + 28,
    infiniteViewportBox.y + Math.min(220, infiniteViewportBox.height * 0.32),
    { steps: 6 }
  );
  await page.mouse.up();
  await page.mouse.click(infiniteViewportBox.x + 24, infiniteViewportBox.y + 24);
  const exposedStageBox = await infiniteStage.boundingBox();
  if (!exposedStageBox) throw new Error("infinite map stage is not visible");
  const outsideMarkerCount = await imageLayerDialog.getByRole("button", { name: /^地图标记 / }).count();
  await imageLayerDialog.getByRole("button", { name: "放置标记", exact: true }).click();
  const outsideMarkerClientPoint = {
    x: exposedStageBox.x + exposedStageBox.width * 0.28,
    y: Math.max(infiniteViewportBox.y + 28, exposedStageBox.y - 56)
  };
  await page.mouse.click(outsideMarkerClientPoint.x, outsideMarkerClientPoint.y);
  check(
    await imageLayerDialog.getByRole("button", { name: /^地图标记 / }).count(),
    outsideMarkerCount + 1,
    "marker placement works on the infinite canvas outside the basemap"
  );
  const outsideMarker = imageLayerDialog.getByRole("button", { name: /^地图标记 新标记/ }).last();
  const outsideMarkerPoint = await outsideMarker.evaluate((element) => ({
    x: Number.parseFloat(element.style.left),
    y: Number.parseFloat(element.style.top)
  }));
  check(outsideMarkerPoint.y < 0, true, "outside marker keeps its negative basemap-relative coordinate");
  check(Boolean(await outsideMarker.boundingBox()), true, "outside marker renders in the visible infinite workspace");
  await imageLayerDialog.getByLabel("标记名称", { exact: true }).fill("E2E 画布外标记");

  const infiniteRegionCount = await imageLayerDialog.locator(".map-region-layer polygon[data-region-id]").count();
  await imageLayerDialog.getByRole("button", { name: "区域绘制工具", exact: true }).click();
  const outsideRegionClientPoints = [
    [0.18, -92],
    [0.36, -92],
    [0.4, -32],
    [0.22, -24]
  ];
  for (const [x, yOffset] of outsideRegionClientPoints) {
    await page.mouse.click(exposedStageBox.x + exposedStageBox.width * x, exposedStageBox.y + yOffset);
  }
  await imageLayerDialog.getByRole("button", { name: "完成区域绘制", exact: true }).click();
  check(
    await imageLayerDialog.locator(".map-region-layer polygon[data-region-id]").count(),
    infiniteRegionCount + 1,
    "region drawing works entirely outside the basemap"
  );
  const outsideRegion = imageLayerDialog.locator(".map-region-layer polygon[data-region-id]").last();
  const outsideRegionPoints = (await outsideRegion.getAttribute("points"))
    .split(" ")
    .map((point) => point.split(",").map(Number));
  check(outsideRegionPoints.some(([, y]) => y < 0), true, "outside region persists negative canvas coordinates");
  check(Boolean(await outsideRegion.boundingBox()), true, "outside region polygon renders beyond the basemap boundary");
  await imageLayerDialog.getByLabel("区域名称", { exact: true }).fill("E2E 画布外区域");
  check(await imageLayerDialog.locator(".map-region-selection-outline").count(), 0, "outside region does not create a secondary selection shape");
  check(
    await outsideRegion.evaluate((element) => getComputedStyle(element).filter),
    "none",
    "outside region selection does not create a clipped rectangular SVG filter"
  );
  const outsideRegionLabel = imageLayerDialog.getByRole("button", { name: "选择地图区域 E2E 画布外区域", exact: true });
  check(
    (await outsideRegionLabel.evaluate((element) => getComputedStyle(element).boxShadow)).includes("0px 0px 0px 4px"),
    false,
    "selected region label does not add an expanding rectangular halo"
  );

  await imageLayerDialog.getByRole("button", { name: "地图测距工具", exact: true }).click();
  await page.mouse.click(exposedStageBox.x + exposedStageBox.width * 0.55, exposedStageBox.y - 86);
  await page.mouse.click(exposedStageBox.x + exposedStageBox.width * 0.7, exposedStageBox.y - 72);
  const outsideMeasurement = imageLayerDialog.locator(".map-measurement-line");
  check(Number(await outsideMeasurement.getAttribute("y1")) < 0, true, "measurement can start in the infinite canvas outside the basemap");
  check(Number(await outsideMeasurement.getAttribute("y2")) < 0, true, "measurement can finish in the infinite canvas outside the basemap");
  await imageLayerDialog.getByRole("button", { name: "结束地图测距", exact: true }).click();

  await imageLayerDialog.getByRole("button", { name: "适配全部画布内容", exact: true }).click();
  const fittedOutsideMarkerBox = await imageLayerDialog.getByRole("button", { name: "地图标记 E2E 画布外标记", exact: true }).boundingBox();
  const fittedViewportBox = await infiniteViewport.boundingBox();
  check(
    Boolean(
      fittedOutsideMarkerBox
      && fittedViewportBox
      && fittedOutsideMarkerBox.x >= fittedViewportBox.x
      && fittedOutsideMarkerBox.y >= fittedViewportBox.y
      && fittedOutsideMarkerBox.x + fittedOutsideMarkerBox.width <= fittedViewportBox.x + fittedViewportBox.width
      && fittedOutsideMarkerBox.y + fittedOutsideMarkerBox.height <= fittedViewportBox.y + fittedViewportBox.height
    ),
    true,
    "fit-all-content recovers objects authored outside the basemap"
  );
  await page.waitForTimeout(120);
  await page.screenshot({
    path: path.join(root, "validation", "map-workspace-infinite-canvas.png"),
    fullPage: false
  });
  await imageLayerDialog.getByRole("button", { name: "退出地图专注模式", exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await waitForSaved(page);

  await openWorkspace(page, "时间线");
  await page.getByLabel("时间精度").waitFor();
  check(await page.getByLabel("时间精度").inputValue(), "range", "timeline date precision is editable");
  check(
    await page.locator(".timeline-planning-inspector .project-reference-picker").count(),
    1,
    "timeline event uses the shared multi-object picker"
  );
  await verifyTopbarBackground(page);
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(root, "validation", "g2-timeline-references.png"),
    fullPage: false
  });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await openWorkspace(page, "地图");
  await page.getByRole("heading", { name: "苍岚全境图", exact: true }).waitFor();
  check(await page.evaluate(() => window.scrollY), 0, "timeline navigation resets the viewport");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  await openWorkspace(page, "资源库");
  await page.getByRole("heading", { name: "全部资源", exact: true }).waitFor();
  const assetInspector = page.locator(".asset-inspector-panel");
  await assetInspector.locator(".asset-preview").waitFor();
  const assetInspectorGeometry = await assetInspector.evaluate((panel) => {
    const preview = panel.querySelector(".asset-preview")?.getBoundingClientRect();
    const nameField = panel.querySelector(".field")?.getBoundingClientRect();
    const actions = panel.querySelector(".asset-action-row")?.getBoundingClientRect();
    const links = panel.querySelector(".asset-link-section")?.getBoundingClientRect();
    return {
      previewBottom: preview?.bottom ?? Number.POSITIVE_INFINITY,
      nameFieldTop: nameField?.top ?? Number.NEGATIVE_INFINITY,
      actionsBottom: actions?.bottom ?? Number.POSITIVE_INFINITY,
      linksTop: links?.top ?? Number.NEGATIVE_INFINITY
    };
  });
  check(assetInspectorGeometry.previewBottom <= assetInspectorGeometry.nameFieldTop, true, "asset preview stays above the resource name field without overlap");
  check(assetInspectorGeometry.actionsBottom <= assetInspectorGeometry.linksTop, true, "asset actions stay above the linked-entity section without overlap");
  const assetLinkSummary = (await assetInspector.locator(".asset-link-heading span").textContent()).split("/").map((value) => Number(value.trim()));
  check(assetLinkSummary[1], await assetInspector.locator(".asset-entity-picker label").count(), "asset inspector reports the full linked-entity choice count");
  check(assetLinkSummary[0] <= assetLinkSummary[1], true, "asset inspector reports a valid linked-entity selection count");
  const assetScrollMetrics = await page.evaluate(() => {
    const workspace = document.querySelector(".workspace")?.getBoundingClientRect();
    const layout = document.querySelector(".asset-layout")?.getBoundingClientRect();
    const inspector = document.querySelector(".asset-inspector-panel");
    const inspectorStyle = inspector ? getComputedStyle(inspector) : null;
    const panels = Array.from(document.querySelectorAll(".asset-layout > .panel"))
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return { bottom: Math.round(bounds.bottom), height: Math.round(bounds.height) };
      });
    return {
      bodyScrollHeight: document.body.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      documentScrollHeight: document.documentElement.scrollHeight,
      layoutBottom: Math.round(layout?.bottom ?? 0),
      layoutHeight: Math.round(layout?.height ?? 0),
      panels,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      inspectorMaxHeight: inspectorStyle?.maxHeight || "",
      inspectorOverflow: inspectorStyle?.overflow || "",
      workspaceBottom: Math.round(workspace?.bottom ?? 0),
      workspaceHeight: Math.round(workspace?.height ?? 0)
    };
  });
  check(
    assetScrollMetrics.documentScrollHeight <= assetScrollMetrics.viewportHeight + 1,
    true,
    `resource workspace avoids a second page-level vertical scrollbar at 1440px (${JSON.stringify(assetScrollMetrics)})`
  );
  await page.screenshot({
    path: path.join(root, "validation", "resource-inspector-fixed.png"),
    fullPage: false
  });

  await openEntityFromSearch(page, "艾琳");
}

async function quitAndWait(electronApp, timeout = 30000) {
  const child = electronApp.process();
  const exit = new Promise((resolve) => child.once("exit", resolve));
  void electronApp.evaluate(({ app }) => app.quit()).catch(() => undefined);
  let timer;
  try {
    await Promise.race([
      exit,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Electron did not quit after draining saves.")),
          timeout
        );
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
  await electronApp.close().catch(() => undefined);
}

(async () => {
  let app;
  let page;
  const aiRequests = [];
  const aiServer = http.createServer((request, response) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      const parsedBody = JSON.parse(body);
      aiRequests.push({
        authorization: request.headers.authorization || "",
        body: parsedBody
      });
      const systemPrompt = String(parsedBody.messages?.[0]?.content || "");
      const content = systemPrompt.includes("项目操作智能体")
        ? JSON.stringify(aiOperatorPlan)
        : systemPrompt.includes("游戏叙事与关卡地图")
          ? JSON.stringify({
              suggestions: [{
                id: "map-review-description",
                severity: "info",
                title: "补充北境地图说明",
                detail: "说明主线入口与战区边界的叙事用途。",
                targetType: "map",
                targetId: "map-canglan",
                patch: { description: "主线从雾鸦堡进入北境战区，边界随剧情阶段变化。" }
              }]
            })
        : systemPrompt.includes("Worldcraft Codex 的游戏叙事共同作者")
          ? JSON.stringify({
              text: "银盔骑士艾琳",
              sourceIds: ["entity:entity-ailin"],
              memoryIds: [],
              newCreation: false,
              notes: "依据当前角色条目补足身份称谓",
              candidateFacts: [
                {
                  category: "character",
                  title: "艾琳的身份称谓",
                  content: "艾琳被称为银盔骑士",
                  subject: "艾琳",
                  property: "身份称谓",
                  value: "银盔骑士",
                  temporalScope: "当前设定",
                  sourceQuote: "银盔骑士艾琳",
                  tags: ["艾琳", "身份"]
                }
              ]
            })
        : systemPrompt.includes("叙事总监")
        ? "一、序章目标\n二、艾琳发现黑塔徽记\n三、保留哥哥下落悬念"
        : systemPrompt.includes("高水平游戏剧情作者")
          ? "艾琳走进雾鸦堡。她立刻知道哥哥就在黑塔。"
          : systemPrompt.includes("连续性审校员")
            ? JSON.stringify({
                summary: "哥哥下落揭示过早",
                suggestions: [
                  {
                    quote: "她立刻知道哥哥就在黑塔。",
                    replacement: "她只在黑塔徽记上认出哥哥留下的划痕。",
                    reason: "保留哥哥下落的悬念",
                    severity: "important"
                  }
                ],
                memories: [
                  {
                    category: "plot",
                    title: "哥哥下落",
                    content: "序章仍未确认艾琳哥哥的位置",
                    subject: "艾琳的哥哥",
                    property: "当前位置",
                    value: "未知",
                    temporalScope: "序章",
                    sourceQuote: "艾琳走进雾鸦堡。",
                    tags: ["艾琳", "哥哥", "伏笔"]
                  }
                ]
              })
            : "AI 冒烟生成结果";
      response.writeHead(200, { "content-type": "application/json" });
      response.end(
        JSON.stringify({ choices: [{ message: { content } }] })
      );
    });
  });
  try {
    await new Promise((resolve) => aiServer.listen(0, "127.0.0.1", resolve));
    const aiAddress = aiServer.address();
    ({ electronApp: app, page } = await launch());
    await waitForWorkspace(page);
    check(await page.getByLabel("世界名称", { exact: true }).inputValue(), "苍岚纪", "fresh start loads sample world");
    await page.locator(".author-workspace").waitFor();
    check(await page.getByText("作者工作台", { exact: true }).count() > 0, true, "fresh start opens the author cockpit");
    check(await page.locator(".author-current-writing").count(), 1, "author cockpit offers a direct continue-writing target");
    check(await page.locator(".author-stat-strip > div").count(), 5, "author cockpit summarizes the active world without extra navigation");
    await page.screenshot({
      path: path.join(root, "validation", "author-workspace-1440.png"),
      fullPage: false
    });
    check(fs.existsSync(path.join(userDataDir, "worldcraft-codex.sqlite")), true, "SQLite is initialized");
    const initialBackups = await page.evaluate(() => window.worldcraftStore.listBackups());
    check(initialBackups.backups.length > 0, true, "first project save creates a local backup");
    check(initialBackups.backups.every((backup) => backup.valid), true, "backup browser recognizes generated backups as valid");
    await openWorkspace(page, "知识库");
    await verifyDocumentFlowPanels(
      page,
      ".entity-browser, .inspector-stack",
      "codex browser and inspector remain in the workspace document flow"
    );

    await openWorkspace(page, "模板");
    await page.getByRole("heading", { name: "模板与资料" }).waitFor();
    check(
      (await page.getByText("人物默认模板", { exact: true }).count()) > 0,
      true,
      "default templates are initialized"
    );
    await verifyDocumentFlowPanels(page, ".template-browser", "template browser remains in the workspace document flow");
    await page.getByRole("button", { name: "资料台账", exact: true }).click();
    await page.getByRole("table", { name: "设定资料台账" }).waitFor();
    check(await page.getByRole("row").count() > 1, true, "content ledger contains rows");

    await openWorkspace(page, "制作");
    await page.getByRole("heading", { name: "叙事制作" }).waitFor();
    check(await page.getByText("序章", { exact: true }).count() > 0, true, "narrative production is populated");
    await verifyDocumentFlowPanels(page, ".narrative-editor", "narrative editor remains in the workspace document flow");

    await openEntityFromSearch(page, "艾琳");
    check(await page.getByLabel("条目标题").inputValue(), "艾琳", "global search opens the selected entity");
    await page.getByRole("button", { name: "打开条目检查", exact: true }).click();
    const impactOverviewButton = page.getByRole("button", { name: "查看影响范围", exact: true });
    await impactOverviewButton.waitFor();
    check(await impactOverviewButton.isEnabled(), true, "referenced entities expose change impact analysis from the inspector");
    await impactOverviewButton.click();
    const impactDialog = page.getByRole("dialog", { name: "变更影响 艾琳", exact: true });
    await impactDialog.waitFor();
    check(await impactDialog.locator(".impact-dialog-summary > div").count(), 4, "change impact summarizes review priority and propagation depth");
    check(await impactDialog.locator(".impact-domain-tabs > button").count(), 5, "change impact can filter manuscript, story, quest, and world structure");
    const impactItemCount = await impactDialog.locator(".impact-item").count();
    check(impactItemCount > 0, true, "change impact traces concrete incoming references");
    await impactDialog.getByRole("button", { name: "直接", exact: true }).click();
    check(await impactDialog.locator(".impact-item").count() > 0, true, "change impact can isolate direct references");
    await page.screenshot({
      path: path.join(root, "validation", "change-impact-dialog.png"),
      fullPage: false
    });
    await impactDialog.getByRole("button", { name: "关闭变更影响", exact: true }).click();
    check(await impactDialog.count(), 0, "change impact closes back into the current entity editor");
    const closeInspectorButton = page.getByRole("button", { name: "关闭条目检查", exact: true });
    const inspectorCloseHitTest = await inspectHitTarget(
      closeInspectorButton,
      ".codex-grid > .inspector-stack"
    );
    check(
      inspectorCloseHitTest.clickable,
      true,
      `responsive inspector leaves its close control clickable (${JSON.stringify(inspectorCloseHitTest)})`
    );
    await closeInspectorButton.click();
    await verifyKeyboardAndIme(page);

    const g2Viewport = page.viewportSize();
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.waitForTimeout(150);
    await verifyG2Workflows(page);
    if (g2Viewport) await page.setViewportSize(g2Viewport);
    check(await page.getByLabel("条目标题").inputValue(), "艾琳", "G2 workflow returns to the selected entity");

    check(await page.locator(".world-menu-current").textContent(), "苍岚纪", "top bar exposes the active world directly");
    await page.getByLabel("切换世界").click();
    check(await page.locator(".world-menu-worlds > button").count() >= 1, true, "world switcher exposes available worlds as a primary action");
    const expectedWorldMenuSummary = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const world = loaded.data.worlds.find((item) => item.name === "苍岚纪");
      const count = (collection) =>
        loaded.data[collection].filter((item) => item.worldId === world?.id).length;
      return `${count("entities")} 条目 · ${count("maps")} 地图 · ${count("manuscriptChapters")} 章节`;
    });
    check(
      await page.locator(".world-menu-worlds").getByRole("button", { name: "苍岚纪", exact: true }).locator(".world-menu-world-copy small").textContent(),
      expectedWorldMenuSummary,
      "world switcher summarizes each world's useful content before switching"
    );
    const worldSwitcherBounds = await page.locator(".world-menu-popover").evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        bottom: Math.round(bounds.bottom),
        left: Math.round(bounds.left),
        right: Math.round(bounds.right),
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth
      };
    });
    check(
      worldSwitcherBounds.left >= 0
        && worldSwitcherBounds.right <= worldSwitcherBounds.viewportWidth
        && worldSwitcherBounds.bottom <= worldSwitcherBounds.viewportHeight,
      true,
      "world switcher remains contained inside the desktop viewport"
    );
    await page.screenshot({
      path: path.join(root, "validation", "world-switcher.png"),
      fullPage: false
    });
    await page.getByRole("button", { name: "创建世界", exact: true }).click();
    const newWorldDialog = page.getByRole("dialog", { name: "选择项目起步包", exact: true });
    await newWorldDialog.getByRole("radio", { name: /视觉小说/ }).click();
    check(await newWorldDialog.getByLabel("新世界名称").inputValue(), "雨季来信", "starter selection updates the suggested world name");
    await newWorldDialog.getByLabel("新世界名称").fill("E2E 视觉小说");
    await newWorldDialog.getByRole("button", { name: "进入创作台", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("[aria-label='世界名称']")?.value === "E2E 视觉小说");
    check(await page.locator(".world-menu-current").textContent(), "E2E 视觉小说", "world switcher updates after creating a world");
    await page.locator(".author-workspace").waitFor();
    check(await page.getByText("作者工作台", { exact: true }).count() > 0, true, "new worlds open in the author cockpit");
    await openWorkspace(page, "知识库");
    check(await page.getByLabel("条目标题").inputValue(), "林澈", "visual-novel starter opens its first editable character");
    const visualNovelSeed = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const world = loaded.data.worlds.find((item) => item.name === "E2E 视觉小说");
      return {
        quests: loaded.data.quests.filter((item) => item.worldId === world?.id).map((item) => item.title),
        scenes: loaded.data.storyScenes.filter((item) => item.worldId === world?.id).map((item) => item.title),
        variables: loaded.data.storyVariables.filter((item) => item.worldId === world?.id).map((item) => item.key)
      };
    });
    check(visualNovelSeed, { quests: ["第一章：雨中相遇"], scenes: ["旧校舍门前"], variables: ["route.suyao_affection"] }, "visual-novel starter persists its quest, scene, and route variable");
    await page.getByLabel("切换世界").click();
    await page.getByRole("button", { name: "苍岚纪", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("[aria-label='世界名称']")?.value === "苍岚纪");
    check(await page.locator(".world-menu-current").textContent(), "苍岚纪", "world switcher returns to an existing world without losing context");

    await page.getByLabel("切换世界").click();
    await page.locator(".world-menu-settings > summary").click();
    await page.screenshot({
      path: path.join(root, "validation", "world-management.png"),
      fullPage: false
    });
    await page.getByRole("button", { name: "复制当前世界", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("[aria-label='世界名称']")?.value === "苍岚纪 副本");
    check(await page.locator(".world-menu-current").textContent(), "苍岚纪 副本", "world duplication switches into the independent copy");
    await page.locator(".author-workspace").waitFor();
    await openWorkspace(page, "知识库");
    check(await page.getByLabel("条目标题").inputValue(), "艾琳", "world duplication preserves the active world's editable content");
    const duplicatedWorldAudit = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const source = loaded.data.worlds.find((item) => item.name === "苍岚纪");
      const copy = loaded.data.worlds.find((item) => item.name === "苍岚纪 副本");
      const countByWorld = (collection, worldId) => loaded.data[collection]
        .filter((item) => item.worldId === worldId).length;
      const comparedCollections = [
        "entityTemplates",
        "entities",
        "quests",
        "storyScenes",
        "manuscriptChapters",
        "aiMemoryItems",
        "relations",
        "maps"
      ];
      const countMismatches = source && copy
        ? comparedCollections.filter((collection) => (
          countByWorld(collection, source.id) !== countByWorld(collection, copy.id)
        ))
        : comparedCollections;
      const sourceEntityIds = new Set(
        source
          ? loaded.data.entities.filter((item) => item.worldId === source.id).map((item) => item.id)
          : []
      );
      const copiedEntities = copy
        ? loaded.data.entities.filter((item) => item.worldId === copy.id)
        : [];
      const copiedEntityIds = new Set(copiedEntities.map((item) => item.id));
      const copiedRelations = copy
        ? loaded.data.relations.filter((item) => item.worldId === copy.id)
        : [];
      const sourceMapIds = new Set(
        source
          ? loaded.data.maps.filter((item) => item.worldId === source.id).map((item) => item.id)
          : []
      );
      const copyMapIds = new Set(
        copy
          ? loaded.data.maps.filter((item) => item.worldId === copy.id).map((item) => item.id)
          : []
      );
      const sourceMapLayerCount = loaded.data.mapLayers
        .filter((item) => sourceMapIds.has(item.mapId)).length;
      const copiedMapLayers = loaded.data.mapLayers
        .filter((item) => copyMapIds.has(item.mapId));
      return {
        copyExists: Boolean(copy),
        countMismatches,
        copiedIdsOverlapSource: copiedEntities.some((item) => sourceEntityIds.has(item.id)),
        relationsRemapped: copiedRelations.every((item) => (
          copiedEntityIds.has(item.sourceEntityId) && copiedEntityIds.has(item.targetEntityId)
        )),
        mapChildrenRemapped: copiedMapLayers.length === sourceMapLayerCount
          && copiedMapLayers.every((item) => !sourceMapIds.has(item.mapId))
      };
    });
    check(duplicatedWorldAudit.copyExists, true, "duplicated world is persisted to SQLite");
    check(duplicatedWorldAudit.countMismatches, [], "duplicated world retains core collection counts");
    check(duplicatedWorldAudit.copiedIdsOverlapSource, false, "duplicated world receives independent entity ids");
    check(duplicatedWorldAudit.relationsRemapped, true, "duplicated relations point at copied entities");
    check(duplicatedWorldAudit.mapChildrenRemapped, true, "duplicated map children point at copied maps");

    const backupsBeforeWorldDelete = await page.evaluate(() => window.worldcraftStore.listBackups());
    await page.getByLabel("切换世界").click();
    await page.locator(".world-menu-settings > summary").click();
    await page.getByRole("button", { name: "删除当前世界", exact: true }).click();
    const worldDeleteDialog = page.getByRole("dialog", { name: "删除世界", exact: true });
    await worldDeleteDialog.waitFor();
    await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "删除世界确认名称");
    check(
      await page.evaluate(() => document.activeElement?.getAttribute("aria-label")),
      "删除世界确认名称",
      "world deletion focuses its exact-name confirmation field"
    );
    await page.keyboard.press("Shift+Tab");
    check(await page.getByRole("button", { name: "取消", exact: true }).evaluate((element) => element === document.activeElement), true, "world deletion traps backward focus inside the dialog");
    await page.keyboard.press("Tab");
    check(await worldDeleteDialog.getByLabel("删除世界确认名称").evaluate((element) => element === document.activeElement), true, "world deletion loops focus back to its first control");
    await page.screenshot({
      path: path.join(root, "validation", "world-delete-confirmation.png"),
      fullPage: false
    });
    check(
      await worldDeleteDialog.getByRole("button", { name: "删除这个世界", exact: true }).isDisabled(),
      true,
      "world deletion remains disabled before exact-name confirmation"
    );
    await worldDeleteDialog.getByLabel("删除世界确认名称").fill("苍岚纪 副本");
    await worldDeleteDialog.getByRole("button", { name: "删除这个世界", exact: true }).click();
    await worldDeleteDialog.waitFor({ state: "detached" });
    const deletionAudit = await page.evaluate(async () => {
      const [loaded, backups] = await Promise.all([
        window.worldcraftStore.loadWorkspace(),
        window.worldcraftStore.listBackups()
      ]);
      return {
        copyExists: loaded.data.worlds.some((item) => item.name === "苍岚纪 副本"),
        completeBackups: backups.backups.filter((item) => item.kind === "complete").length,
        latestCompleteWorlds: backups.backups.find((item) => item.kind === "complete")?.counts?.worlds ?? 0
      };
    });
    check(deletionAudit.copyExists, false, "confirmed world deletion removes the copied world from SQLite");
    check(
      deletionAudit.completeBackups > backupsBeforeWorldDelete.backups.filter((item) => item.kind === "complete").length,
      true,
      "world deletion creates a complete project backup first"
    );
    check(deletionAudit.latestCompleteWorlds, 3, "pre-delete backup contains every world from the original project");
    await page.getByLabel("切换世界").click();
    await page.getByRole("button", { name: "苍岚纪", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("[aria-label='世界名称']")?.value === "苍岚纪");
    await openEntityFromSearch(page, "艾琳");

    await openWorkspace(page, "剧情");
    await page.getByRole("button", { name: "正文", exact: true }).click();
    await page.getByRole("heading", { name: "小说正文与章节", exact: true }).waitFor();
    check(await page.locator(".manuscript-inspector").count(), 0, "manuscript keeps secondary metadata closed by default");
    await page.getByRole("button", { name: "展开文稿检查栏", exact: true }).click();
    check(await page.locator(".manuscript-inspector").count(), 1, "manuscript inspector opens on demand");
    await page.locator(".manuscript-inspector").getByRole("button", { name: "收起文稿检查栏", exact: true }).click();
    check(await page.locator(".manuscript-inspector").count(), 0, "manuscript inspector returns to the focused writing layout");
    await page.locator(".manuscript-tree-panel").getByRole("button", { name: "收起书稿目录", exact: true }).click();
    check(await page.locator(".manuscript-tree-panel").count(), 0, "manuscript outline can be hidden without leaving the editor");
    await page.getByRole("button", { name: "展开书稿目录", exact: true }).click();
    check(await page.locator(".manuscript-tree-panel").count(), 1, "manuscript outline can be restored from the editor header");
    await verifyDocumentFlowPanels(
      page,
      ".manuscript-tree-panel, .manuscript-writing-panel, .manuscript-inspector",
      "manuscript tree, prose editor, and inspector remain in the workspace document flow"
    );
    await page.locator(".story-workspace-toolbar .story-primary-button").click();
    check((await page.getByLabel("章节标题").inputValue()).length > 0, true, "manuscript workspace creates and selects a numbered chapter");
    await page.getByLabel("章节标题").fill("E2E 第一章 风雪来信");
    const manuscriptEditor = page.locator(".manuscript-prose-editor .tiptap");
    await manuscriptEditor.fill("风雪压住城门的钟声，艾琳在信封背面认出了哥哥的暗号。");
    await page.getByLabel("插入双向链接").click();
    await page.getByLabel("搜索双向链接条目").fill("艾琳");
    await page.locator(".toolbar-picker-popover button").filter({ hasText: "艾琳" }).first().click();
    check(await manuscriptEditor.locator(".stable-project-reference").count(), 1, "manuscript editor inserts an id-backed stable reference");
    await page.getByRole("button", { name: "全屏编写正文", exact: true }).click();
    check(await page.locator(".manuscript-prose-editor .rich-editor-shell.is-focus-mode").count(), 1, "chapter prose enters distraction-free full-screen editing");
    await page.keyboard.press("Escape");
    check(await page.locator(".manuscript-prose-editor .rich-editor-shell.is-focus-mode").count(), 0, "Escape exits chapter full-screen editing");

    const reviewQuote = "风雪压住城门的钟声";
    await manuscriptEditor.evaluate((editor, quote) => {
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
      let cursor = 0;
      let startNode = null;
      let startOffset = 0;
      let endNode = null;
      let endOffset = 0;
      let node = walker.nextNode();
      const text = editor.textContent || "";
      const start = text.indexOf(quote);
      const end = start + quote.length;
      while (node) {
        const next = cursor + node.data.length;
        if (!startNode && start >= cursor && start <= next) {
          startNode = node;
          startOffset = start - cursor;
        }
        if (end >= cursor && end <= next) {
          endNode = node;
          endOffset = end - cursor;
          break;
        }
        cursor = next;
        node = walker.nextNode();
      }
      if (!startNode || !endNode) throw new Error("Unable to select manuscript quote");
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.dispatchEvent(new Event("selectionchange"));
    }, reviewQuote);
    await page.waitForTimeout(100);
    await page.locator(".manuscript-writing-panel").getByLabel("批注与修订", { exact: true }).click();
    const manuscriptInspector = page.locator(".manuscript-inspector");
    check(await manuscriptInspector.getByLabel("批注引用原文").inputValue(), reviewQuote, "selected prose is carried into a precise manuscript annotation");
    await manuscriptInspector.getByRole("radio", { name: "修订建议", exact: true }).click();
    await manuscriptInspector.getByLabel("批注内容").fill("精简开场节奏");
    await manuscriptInspector.getByLabel("修订替换文本").fill("风雪吞没了城门钟声");
    await manuscriptInspector.getByRole("button", { name: "加入审阅", exact: true }).click();
    const annotationRow = manuscriptInspector.locator(".manuscript-annotation-row").filter({ hasText: "精简开场节奏" });
    await annotationRow.getByLabel("回复批注 精简开场节奏", { exact: true }).fill("作者确认采用");
    await annotationRow.getByLabel("发送批注回复", { exact: true }).click();
    check(await annotationRow.getByText("作者确认采用", { exact: true }).count(), 1, "manuscript annotation replies remain attached to the suggestion");
    await page.screenshot({
      path: path.join(root, "validation", "g10-manuscript-review.png"),
      fullPage: false
    });
    await annotationRow.getByRole("button", { name: "接受", exact: true }).click();
    await annotationRow.getByText("已接受", { exact: true }).waitFor();
    check((await manuscriptEditor.textContent()).includes("风雪吞没了城门钟声"), true, "accepting a manuscript suggestion replaces only its quoted prose");
    await manuscriptInspector.getByLabel("写作节奏", { exact: true }).click();
    check(await manuscriptInspector.locator(".manuscript-rhythm-chart > div").count(), 14, "writing rhythm renders a stable fourteen-day history");
    const todayNetWords = Number((await manuscriptInspector.locator(".manuscript-rhythm-summary > div").filter({ hasText: "今日净增" }).locator("strong").textContent()).replaceAll(",", ""));
    check(todayNetWords > 0, true, "editing manuscript prose records today's net word gain");
    await manuscriptInspector.locator(".manuscript-rhythm-body input[type='number']").fill("600");
    await page.screenshot({
      path: path.join(root, "validation", "g10-manuscript-review-rhythm.png"),
      fullPage: false
    });
    await manuscriptInspector.getByRole("button", { name: "收起文稿检查栏", exact: true }).click();

    await page.locator(".manuscript-writing-panel").getByLabel("出版文稿", { exact: true }).click();
    const publicationDialog = page.getByRole("dialog", { name: "出版文稿", exact: true });
    await publicationDialog.waitFor();
    await publicationDialog.getByLabel("出版作者", { exact: true }).fill("E2E 作者");
    await publicationDialog.getByRole("radio", { name: "自选章节", exact: true }).click();
    const publicationChapter = publicationDialog.getByLabel("选择出版章节").getByLabel("E2E 第一章 风雪来信", { exact: true });
    if (!(await publicationChapter.isChecked())) await publicationChapter.check();
    const formatGroup = publicationDialog.getByRole("group", { name: "出版文件格式", exact: true });
    await formatGroup.getByRole("button", { name: "PDF", exact: true }).click();
    await formatGroup.getByRole("button", { name: "EPUB", exact: true }).click();
    check(await formatGroup.getByRole("button", { name: "DOCX", exact: true }).getAttribute("aria-pressed"), "true", "publication keeps DOCX selected");
    check(await formatGroup.getByRole("button", { name: "PDF", exact: true }).getAttribute("aria-pressed"), "true", "publication supports PDF output");
    check(await formatGroup.getByRole("button", { name: "EPUB", exact: true }).getAttribute("aria-pressed"), "true", "publication supports EPUB output");
    await publicationDialog.getByLabel("出版版式", { exact: true }).selectOption("compact");
    await publicationDialog.getByText(/^1 章 ·/).waitFor();
    await page.screenshot({
      path: path.join(root, "validation", "g10-manuscript-publication.png"),
      fullPage: false
    });
    await publicationDialog.getByRole("button", { name: "选择目录并导出", exact: true }).click();
    await publicationDialog.getByText("已导出 3 个文件", { exact: true }).waitFor({ timeout: 60000 });
    const publicationFiles = fs.readdirSync(manuscriptExportDir)
      .map((name) => path.join(manuscriptExportDir, name))
      .sort();
    check(publicationFiles.map((file) => path.extname(file)).sort(), [".docx", ".epub", ".pdf"], "desktop publication writes all selected formats");
    check(publicationFiles.every((file) => fs.statSync(file).size > 1024), true, "publication files contain rendered manuscript content");
    const docxPath = publicationFiles.find((file) => file.endsWith(".docx"));
    const epubPath = publicationFiles.find((file) => file.endsWith(".epub"));
    const pdfPath = publicationFiles.find((file) => file.endsWith(".pdf"));
    check(fs.readFileSync(docxPath).subarray(0, 4).toString("hex"), "504b0304", "DOCX publication is a valid ZIP container");
    check(fs.readFileSync(epubPath).subarray(0, 4).toString("hex"), "504b0304", "EPUB publication is a valid ZIP container");
    check(fs.readFileSync(pdfPath).subarray(0, 5).toString("ascii"), "%PDF-", "PDF publication has a valid PDF signature");
    await page.screenshot({
      path: path.join(root, "validation", "g10-manuscript-publication-result.png"),
      fullPage: false
    });
    await publicationDialog.getByLabel("关闭出版文稿", { exact: true }).click();
    await page.screenshot({
      path: path.join(root, "validation", "manuscript-workspace.png"),
      fullPage: false
    });
    const manuscriptViewport = page.viewportSize();
    await page.setViewportSize({ width: 760, height: 820 });
    await page.locator(".manuscript-tree-panel").getByRole("button", { name: "收起书稿目录", exact: true }).click();
    check(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      true,
      "focused manuscript has no page-level horizontal overflow at 760px"
    );
    check(
      await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1),
      true,
      "focused manuscript keeps prose as the only primary vertical scroll surface at 760px"
    );
    await page.screenshot({
      path: path.join(root, "validation", "g8-manuscript-narrow.png"),
      fullPage: false
    });
    await page.getByRole("button", { name: "展开文稿检查栏", exact: true }).click();
    const narrowInspectorBox = await page.locator(".manuscript-inspector").boundingBox();
    check(Boolean(narrowInspectorBox && narrowInspectorBox.width <= 320), true, "narrow manuscript inspector opens as a bounded drawer");
    await page.screenshot({
      path: path.join(root, "validation", "g8-manuscript-inspector-drawer.png"),
      fullPage: false
    });
    await page.locator(".manuscript-inspector").getByRole("button", { name: "收起文稿检查栏", exact: true }).click();
    if (manuscriptViewport) await page.setViewportSize(manuscriptViewport);
    await waitForSaved(page);
    const storedManuscript = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const chapter = loaded.data.manuscriptChapters.find((item) => item.title === "E2E 第一章 风雪来信");
      const book = loaded.data.manuscriptBooks.find((item) => item.id === chapter?.bookId);
      return { chapter, book };
    });
    check(storedManuscript.chapter.body.includes("艾琳在信封背面认出了哥哥的暗号"), true, "independent long-form chapter prose is persisted to SQLite");
    check(storedManuscript.chapter.body.includes("data-project-reference-id"), true, "stable manuscript references persist to SQLite");
    check(storedManuscript.chapter.body.includes("风雪吞没了城门钟声"), true, "accepted manuscript revisions persist to SQLite");
    check(storedManuscript.chapter.annotations[0].status, "accepted", "accepted annotation state persists to SQLite");
    check(storedManuscript.chapter.annotations[0].replies[0].body, "作者确认采用", "annotation replies persist to SQLite");
    check(storedManuscript.book.dailyWordGoal, 600, "daily manuscript goal persists to SQLite");
    check(storedManuscript.book.writingDays.length > 0, true, "writing rhythm history persists to SQLite");

    await openWorkspace(page, "任务线");
    await page.getByRole("button", { name: "最大化查看任务线图", exact: true }).click();
    await verifyDocumentFlowPanels(
      page,
      ".quest-list-panel, .quest-inspector, .quest-graph-sidebar",
      "quest navigation and inspectors remain in the workspace document flow"
    );
    const branchDialog = page.getByRole("dialog", { name: "任务线分支图", exact: true });
    await branchDialog.waitFor();
    check(await branchDialog.locator(".branch-tree").count(), 1, "quest branch tree opens in a full-window dialog");
    await page.screenshot({
      path: path.join(root, "validation", "quest-branch-fullscreen.png"),
      fullPage: false
    });
    await branchDialog.getByRole("button", { name: "退出全屏查看", exact: true }).click();
    await page.getByRole("button", { name: "依赖图", exact: true }).click();
    await page.getByRole("button", { name: "最大化查看任务依赖图", exact: true }).click();
    const dependencyDialog = page.getByRole("dialog", { name: "世界任务依赖图", exact: true });
    await dependencyDialog.waitFor();
    const dependencyDialogBox = await dependencyDialog.boundingBox();
    const viewport = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
    check(
      Boolean(dependencyDialogBox && viewport && dependencyDialogBox.width >= viewport.width - 24 && dependencyDialogBox.height >= viewport.height - 24),
      true,
      "quest dependency graph uses the available application window"
    );
    await page.screenshot({
      path: path.join(root, "validation", "manuscript-and-quest-fullscreen.png"),
      fullPage: false
    });
    await dependencyDialog.getByRole("button", { name: "退出全屏查看", exact: true }).click();

    await openWorkspace(page, "关系图");
    await verifyDocumentFlowPanels(page, ".relation-list-panel", "relationship browser remains in the workspace document flow");
    await page.screenshot({
      path: path.join(root, "validation", "relation-graph-embedded.png"),
      fullPage: false
    });
    await page.getByRole("button", { name: "最大化查看世界关系图", exact: true }).click();
    const relationDialog = page.getByRole("dialog", { name: "世界关系图", exact: true });
    await relationDialog.waitFor();
    check(await relationDialog.locator(".relation-graph-shell").count(), 1, "world relationship graph opens in a full-window dialog");
    check(await relationDialog.getByRole("tab", { name: "关系", exact: true }).getAttribute("aria-selected"), "true", "relationship detail inspector follows the selected edge");
    check(await relationDialog.getByLabel("星图关系范围", { exact: true }).count(), 0, "overview hides controls that only apply to constellation mode");
    check(await relationDialog.getByRole("button", { name: "暂停星体运行", exact: true }).count(), 0, "overview removes the inactive orbital motion control");
    check(await relationDialog.locator(".relation-graph-zoom-value").count(), 0, "structured overview removes canvas-only zoom controls");
    const laneScopeSelect = relationDialog.getByLabel("关系册范围", { exact: true });
    check(await laneScopeSelect.inputValue(), "direct", "overview defaults to the focused entity's direct network");
    check(await relationDialog.locator(".relation-atlas-row").count(), 2, "direct relationship ledger excludes unrelated and indirect records");
    check(await relationDialog.locator(".relation-atlas-row.is-selected").count(), 1, "selected relationship remains visible in the structured ledger");
    await relationDialog.getByRole("button", { name: "选择条目 黑塔议会", exact: true }).click();
    check((await relationDialog.locator(".relation-atlas-core").textContent()).includes("黑塔议会"), true, "relationship endpoint can become the new ledger core");
    await relationDialog.getByRole("button", { name: "选择条目 艾琳", exact: true }).click();
    check((await relationDialog.locator(".relation-atlas-core").textContent()).includes("艾琳"), true, "relationship ledger supports stepping back through connected endpoints");
    await laneScopeSelect.selectOption("context");
    check(await relationDialog.locator(".relation-atlas-row").count(), 4, "second-degree context reveals connected relationship records");
    await page.screenshot({
      path: path.join(root, "validation", "relation-atlas-context-fullscreen.png"),
      fullPage: false
    });
    await laneScopeSelect.selectOption("all");
    check(await relationDialog.locator(".relation-atlas-row").count(), 4, "full relationship ledger remains available as an explicit overview choice");
    await laneScopeSelect.selectOption("direct");
    check(await relationDialog.locator(".relation-atlas-row").count(), 2, "overview can return to the compact direct ledger");
    await relationDialog.getByRole("button", { name: "查看关系 追查与对抗", exact: true }).click();
    check(await relationDialog.getByRole("heading", { name: "追查与对抗", exact: true }).count(), 1, "relationship ledger rows drive the full-screen inspector");
    await page.screenshot({
      path: path.join(root, "validation", "relation-graph-lanes-fullscreen.png"),
      fullPage: false
    });
    const relationSearch = relationDialog.getByLabel("搜索图中条目", { exact: true });
    await relationSearch.fill("艾琳");
    await relationDialog.getByRole("option", { name: /艾琳/ }).click();
    check((await relationDialog.locator(".relation-atlas-core").textContent()).includes("艾琳"), true, "relationship search locates and focuses an entity");
    check(await relationDialog.getByRole("tab", { name: "条目", exact: true }).getAttribute("aria-selected"), "true", "node selection opens the entity inspector");
    await relationDialog.getByRole("button", { name: "星图", exact: true }).click();
    check(await relationDialog.getByRole("button", { name: "星图", exact: true }).getAttribute("aria-pressed"), "true", "constellation view limits the canvas to the selected entity neighborhood");
    check(await relationDialog.locator(".relation-graph-canvas.layout-orbit").count(), 1, "constellation view places the focused entity on an orbital canvas");
    const initialRelationZoom = Number((await relationDialog.locator(".relation-graph-zoom-value").textContent()).replace("%", ""));
    await relationDialog.getByRole("button", { name: "放大关系图", exact: true }).click();
    const enlargedRelationZoom = Number((await relationDialog.locator(".relation-graph-zoom-value").textContent()).replace("%", ""));
    check(enlargedRelationZoom > initialRelationZoom, true, "constellation zoom remains available in full-screen mode");
    await relationDialog.getByRole("button", { name: "适配全部内容", exact: true }).click();
    await relationDialog.getByRole("button", { name: "定位当前条目", exact: true }).click();
    const orbitDepthSelect = relationDialog.getByLabel("星图关系范围", { exact: true });
    check(await orbitDepthSelect.inputValue(), "1", "constellation defaults to direct relationships for an unambiguous core view");
    check(await relationDialog.locator(".relation-orbit-ring").count(), 2, "Ailin's direct relationship strengths occupy separate orbital rings");
    check(await relationDialog.locator(".relation-orbit-ring > span").allTextContents(), ["强度 5 · 至密", "强度 4 · 紧密"], "orbital rings expose direct relationship strength instead of graph distance");
    check(await relationDialog.locator(".relation-graph-node.orbit-strength-5").count(), 1, "strength-five relationship is placed on the innermost orbit");
    check(await relationDialog.locator(".relation-graph-node.orbit-strength-4").count(), 1, "strength-four relationship is placed on its own outer orbit");
    const directOrbitZoom = Number((await relationDialog.locator(".relation-graph-zoom-value").textContent()).replace("%", ""));
    await orbitDepthSelect.selectOption("2");
    check(await relationDialog.locator(".relation-orbit-ring > span").allTextContents(), ["强度 5 · 至密", "强度 4 · 紧密", "2 度间接"], "optional expansion keeps indirect relationships on a clearly named outer orbit");
    await page.waitForFunction(
      (zoom) => Number(document.querySelector("[role='dialog'] .relation-graph-zoom-value")?.textContent?.replace("%", "")) < zoom,
      directOrbitZoom
    );
    check(Number((await relationDialog.locator(".relation-graph-zoom-value").textContent()).replace("%", "")) < directOrbitZoom, true, "expanding the constellation automatically fits the added orbit");
    check(await relationDialog.locator(".relation-graph-node.is-focus-core").evaluate((element) => getComputedStyle(element).borderRadius), "50%", "constellation entries use circular Obsidian-style nodes");
    const orbitSystem = relationDialog.locator(".relation-graph-system");
    check((await orbitSystem.getAttribute("class")).includes("is-orbiting"), true, "constellation starts with orbital motion enabled");
    check(await orbitSystem.evaluate((element) => getComputedStyle(element).animationName), "relation-system-orbit", "constellation orbital motion is backed by the running canvas animation");
    await relationDialog.getByRole("button", { name: "暂停星体运行", exact: true }).click();
    check((await orbitSystem.getAttribute("class")).includes("is-orbiting"), false, "orbital motion can be paused for precise selection");
    await page.screenshot({
      path: path.join(root, "validation", "relation-graph-constellation.png"),
      fullPage: false
    });
    await relationDialog.getByRole("button", { name: "继续星体运行", exact: true }).click();
    await relationDialog.getByRole("button", { name: "全关系图谱", exact: true }).click();
    check(await relationDialog.getByRole("button", { name: "全关系图谱", exact: true }).getAttribute("aria-pressed"), "true", "full relationship network is available as a third independent view");
    check(await relationDialog.locator(".relation-graph-canvas.layout-network").count(), 1, "full network uses its dedicated topology canvas");
    check(await relationDialog.locator(".relation-network-cluster").count() >= 3, true, "full network groups entities into visible type regions");
    check(await relationDialog.locator(".relation-graph-node").count(), 5, "full network keeps every world entity visible, including isolated entries");
    check(await relationDialog.locator(".relation-edge").count(), 4, "full network keeps every active relationship visible by default");
    check(await relationDialog.getByRole("button", { name: "暂停星体运行", exact: true }).count(), 0, "full network removes controls that only apply to orbital motion");
    const networkStrengthSelect = relationDialog.getByLabel("全关系图谱强度", { exact: true });
    check(await networkStrengthSelect.inputValue(), "1", "full network starts with every relationship strength visible");
    await networkStrengthSelect.selectOption("4");
    const strongNetworkEdgeCount = await relationDialog.locator(".relation-edge").count();
    check(strongNetworkEdgeCount > 0 && strongNetworkEdgeCount < 4, true, "network strength control reduces dense graphs without removing entities");
    check(await relationDialog.locator(".relation-graph-node").count(), 5, "strength filtering preserves the complete entity map");
    await networkStrengthSelect.selectOption("1");
    check(await relationDialog.locator(".relation-edge.is-selected").count(), 1, "selected relationship remains highlighted in the full network");
    await relationDialog.locator(".relation-edge.is-selected").focus();
    await relationDialog.locator(".relation-edge.is-selected").press("Enter");
    check(await relationDialog.getByRole("tab", { name: "关系", exact: true }).getAttribute("aria-selected"), "true", "full network edges open the relationship inspector directly");
    const networkZoom = Number((await relationDialog.locator(".relation-graph-zoom-value").textContent()).replace("%", ""));
    await relationDialog.getByRole("button", { name: "放大关系图", exact: true }).click();
    check(Number((await relationDialog.locator(".relation-graph-zoom-value").textContent()).replace("%", "")) > networkZoom, true, "full network supports zooming independently of the constellation");
    await relationDialog.getByRole("button", { name: "适配全部内容", exact: true }).click();
    await relationDialog.getByRole("button", { name: "定位当前条目", exact: true }).click();
    await page.screenshot({
      path: path.join(root, "validation", "relation-network-fullscreen.png"),
      fullPage: false
    });
    const relationLabelCount = await relationDialog.locator(".relation-edge-label").count();
    await relationDialog.getByRole("button", { name: "隐藏关系标签", exact: true }).click();
    check(relationLabelCount > 0 && await relationDialog.locator(".relation-edge-label").count() === 0, true, "relationship labels can be hidden to reduce visual noise");
    const relationCanvas = relationDialog.getByLabel("世界关系画布", { exact: true });
    const relationCanvasBox = await relationCanvas.boundingBox();
    if (relationCanvasBox) {
      await page.mouse.move(relationCanvasBox.x + 18, relationCanvasBox.y + relationCanvasBox.height - 18);
      await page.mouse.down();
      check(await relationCanvas.getAttribute("class").then((value) => value.includes("is-panning")), true, "relationship canvas supports drag panning");
      await page.mouse.move(relationCanvasBox.x + 48, relationCanvasBox.y + relationCanvasBox.height - 42);
      await page.mouse.up();
    }
    await page.screenshot({
      path: path.join(root, "validation", "relation-graph-fullscreen.png"),
      fullPage: false
    });
    await relationDialog.getByRole("tab", { name: "关系", exact: true }).click();
    await relationDialog.getByRole("button", { name: "编辑这条关系", exact: true }).click();
    await relationDialog.waitFor({ state: "detached" });
    check(await page.getByRole("heading", { name: "关系编辑", exact: true }).count(), 1, "full-screen relationship details return directly to the editor");

    await page.getByRole("button", { name: "AI 工具", exact: true }).click();
    await page.getByRole("button", { name: "单次工具", exact: true }).click();
    await page.getByRole("heading", { name: "创作工作台" }).waitFor();
    await page.screenshot({
      path: path.join(root, "validation", "ai-workspace-1440.png"),
      fullPage: false
    });
    check(await page.getByLabel("AI 发送内容").inputValue(), "entity:entity-ailin", "AI uses the selected entity context");
    await page.getByLabel("AI API 地址").fill(`http://127.0.0.1:${aiAddress.port}/v1`);
    await page.getByLabel("AI 模型名称").fill("e2e-model");
    await page.locator(".ai-enable-toggle input").check();
    await page.getByLabel("第三方 AI API Key").fill("e2e-secret-key");
    await page.getByLabel("保存 API Key").click();
    await page.getByText("API Key 已使用系统加密保存", { exact: true }).waitFor();
    const credentialPath = path.join(userDataDir, "credentials", "ai-key.json");
    check(fs.existsSync(credentialPath), true, "AI credential is persisted separately");
    check(fs.readFileSync(credentialPath, "utf8").includes("e2e-secret-key"), false, "AI credential is not stored as plaintext");
    await page.getByRole("button", { name: "测试连接", exact: true }).click();
    await page.getByText(/连接成功 · e2e-model/).waitFor({ timeout: 30000 });
    check(await page.locator(".ai-connection-panel").count(), 0, "successful model test returns to the focused tool workspace");
    await page.getByRole("button", { name: "生成结果", exact: true }).click();
    await page.getByLabel("AI 生成结果").waitFor();
    await page.waitForFunction(() => document.querySelector("[aria-label='AI 生成结果']")?.value === "AI 冒烟生成结果");
    check(aiRequests.length, 2, "connection test and creation request reach the model service");
    check(aiRequests[1].authorization, "Bearer e2e-secret-key", "main process adds the saved credential");
    const sentPrompt = JSON.stringify(aiRequests[1].body);
    check(sentPrompt.includes("艾琳"), true, "selected entity context is sent explicitly");
    check(sentPrompt.includes("实验对象"), false, "secret template field is excluded from AI context");
    check(await page.locator(".ai-connection-panel").count(), 0, "configured model connection leaves a focused two-pane tool workspace");
    await page.screenshot({
      path: path.join(root, "validation", "g8-ai-tools-focused.png"),
      fullPage: false
    });

    await openWorkspace(page, "地图");
    await page.getByRole("heading", { name: "苍岚全境图", exact: true }).waitFor();
    await page.getByRole("button", { name: "打开地图审阅中心", exact: true }).click();
    const aiMapReviewDialog = page.getByRole("dialog", { name: "地图审阅中心 苍岚全境图", exact: true });
    await aiMapReviewDialog.getByRole("button", { name: "AI 深度审阅", exact: true }).click();
    await aiMapReviewDialog.getByText("补充北境地图说明", { exact: true }).waitFor({ timeout: 30000 });
    check(aiRequests.length, 3, "map review sends one context-rich model request");
    check(JSON.stringify(aiRequests[2].body).includes("map-canglan"), true, "map review sends stable map and object IDs");
    await aiMapReviewDialog.getByRole("button", { name: "直接应用", exact: true }).click();
    await aiMapReviewDialog.getByRole("button", { name: "关闭地图审阅中心", exact: true }).click();
    await page.getByRole("button", { name: "打开地图设置", exact: true }).click();
    check(
      await page.getByLabel("地图说明", { exact: true }).inputValue(),
      "主线从雾鸦堡进入北境战区，边界随剧情阶段变化。",
      "safe AI map suggestions apply directly to their exact field"
    );

    await openEntityFromSearch(page, "艾琳");
    const inlineSummary = page.getByLabel("摘要", { exact: true });
    const inlineSummaryBefore = await inlineSummary.inputValue();
    await inlineSummary.evaluate((element) => {
      element.focus();
      element.setSelectionRange(0, 2);
    });
    await page.getByRole("button", { name: "使用 AI 编辑摘要", exact: true }).click();
    const inlineDialog = page.getByRole("dialog", { name: "AI 编辑 摘要", exact: true });
    await inlineDialog.waitFor();
    await inlineDialog.getByText("已选 2 字，只修改选区", { exact: true }).waitFor();
    await inlineDialog.getByRole("button", { name: "生成建议", exact: true }).click();
    await inlineDialog.getByText("银盔骑士艾琳", { exact: true }).waitFor({ timeout: 30000 });
    check(aiRequests.length, 4, "inline editor sends one selection-scoped model request");
    check(aiRequests[3].authorization, "Bearer e2e-secret-key", "inline editor uses the encrypted credential");
    const inlinePrompt = JSON.stringify(aiRequests[3].body);
    check(inlinePrompt.includes("只修改这个范围"), true, "inline prompt constrains the selected range");
    check(inlinePrompt.includes("实验对象"), false, "inline context excludes secret template data");
    check(
      await inlineDialog.locator(".inline-ai-used-sources button").filter({ hasText: "艾琳" }).count(),
      1,
      "inline result exposes the source actually used by the model"
    );
    await inlineDialog.getByText("艾琳的身份称谓", { exact: true }).waitFor();
    await page.screenshot({
      path: path.join(root, "validation", "g3-inline-ai-diff.png"),
      fullPage: false
    });
    await inlineDialog.getByRole("button", { name: "应用到当前字段", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("[aria-label='摘要']")?.value.startsWith("银盔骑士艾琳"));
    await page.waitForFunction(
      async () => {
        const loaded = await window.worldcraftStore.loadWorkspace();
        const summary = loaded.data.entities.find((item) => item.id === "entity-ailin")?.summary || "";
        const session = loaded.data.aiWritingSessions.find((item) => item.inlineEdit?.fieldPath === "summary");
        return summary.startsWith("银盔骑士艾琳") && session?.inlineEdit?.status === "applied";
      },
      undefined,
      { timeout: 30000 }
    );
    check(
      fs.readdirSync(path.join(userDataDir, "backups")).some((file) => file.startsWith("worldcraft-codex-ai-inline-edit-")),
      true,
      "inline edit creates a dedicated pre-apply checkpoint"
    );
    const inlineStored = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const session = loaded.data.aiWritingSessions.find((item) => item.inlineEdit?.fieldPath === "summary");
      return {
        summary: loaded.data.entities.find((item) => item.id === "entity-ailin")?.summary || "",
        branchStatus: session?.inlineEdit?.status || "",
        sourceIds: session?.inlineEdit?.sourceContextIds || [],
        storedBaseText: session?.inlineEdit?.storedBaseText || "",
        storedAppliedText: session?.inlineEdit?.storedAppliedText || "",
        consistencyBeforeCount: session?.inlineEdit?.consistencyBeforeCount,
        consistencyAfterCount: session?.inlineEdit?.consistencyAfterCount,
        introducedConsistencyIssues: session?.inlineEdit?.introducedConsistencyIssues || [],
        draftMemory: loaded.data.aiMemoryItems.some((item) => item.title === "艾琳的身份称谓" && item.state === "draft")
      };
    });
    check(inlineStored.summary.startsWith("银盔骑士艾琳"), true, "inline edit is committed to SQLite");
    check(inlineStored.branchStatus, "applied", "inline edit persists an applied draft branch");
    check(inlineStored.sourceIds, ["entity:entity-ailin"], "inline branch persists exact source IDs");
    check(inlineStored.storedBaseText, inlineSummaryBefore, "inline branch stores the exact pre-edit value");
    check(inlineStored.storedAppliedText.startsWith("银盔骑士艾琳"), true, "inline branch stores the exact applied value");
    check(Number.isInteger(inlineStored.consistencyBeforeCount), true, "inline edit persists its before consistency count");
    check(Number.isInteger(inlineStored.consistencyAfterCount), true, "inline edit persists its after consistency count");
    check(inlineStored.introducedConsistencyIssues, [], "inline edit records that no important consistency issue was introduced");
    check(inlineStored.draftMemory, true, "candidate fact is separated into draft memory");

    await page.getByRole("button", { name: "AI 工具", exact: true }).click();
    await page.getByRole("button", { name: "单次工具", exact: true }).click();
    if (!(await page.getByLabel("清除 API Key").isVisible())) {
      await page.getByRole("button", { name: "展开模型连接", exact: true }).click();
    }
    await page.getByLabel("清除 API Key").click();
    await page.getByText("已清除 API Key", { exact: true }).waitFor();
    check(fs.existsSync(credentialPath), false, "clearing the credential removes its file");

    await page.getByRole("button", { name: "剧情写作", exact: true }).click();
    await page.getByRole("heading", { name: "剧情写作室" }).waitFor();
    await page.getByRole("button", { name: "新建写作", exact: true }).click();
    await page.getByLabel("写作会话标题").fill("艾琳序章深度写作");
    await page.getByLabel("剧情写作要求").fill("写出艾琳在雾鸦堡发现线索的序章，但不要揭晓哥哥的位置。");
    await page.getByRole("button", { name: "策划 → 写作 → 审校", exact: true }).click();
    await page.getByText(/审校完成 · 定位 1 处 · 新增记忆 1 条/).waitFor({ timeout: 60000 });
    await page.screenshot({
      path: path.join(root, "validation", "ai-story-review-1440.png"),
      fullPage: false
    });
    check(aiRequests.length, 7, "deep writing performs planner, writer, and reviewer passes");
    check(await page.locator(".ai-story-control").count(), 0, "story studio no longer renders a permanent third rail");
    await page.getByRole("button", { name: "定位", exact: true }).click();
    check(
      await page.getByLabel("AI 剧情正文").inputValue(),
      "艾琳走进雾鸦堡。她立刻知道哥哥就在黑塔。",
      "deep writing persists the generated draft"
    );
    const selection = await page.getByLabel("AI 剧情正文").evaluate((element) => ({
      start: element.selectionStart,
      end: element.selectionEnd
    }));
    check(selection.end > selection.start, true, "review suggestion selects the exact source quote");
    await page.screenshot({
      path: path.join(root, "validation", "ai-story-studio-1440.png"),
      fullPage: false
    });
    await page.locator(".ai-story-view-tabs").getByRole("button", { name: /审校/ }).click();
    await page.getByRole("button", { name: "应用", exact: true }).click();
    check(
      (await page.getByLabel("AI 剧情正文").inputValue()).includes("哥哥留下的划痕"),
      true,
      "located suggestion can be applied without replacing the whole draft"
    );
    await page.getByRole("button", { name: "保存检查点", exact: true }).click();
    const recallDisclosure = page.locator(".ai-story-memory-disclosure");
    await recallDisclosure.locator("summary").click();
    const semanticRecallToggle = recallDisclosure.getByLabel("语义联想", { exact: true });
    check(await semanticRecallToggle.isChecked(), true, "semantic memory recall is enabled for new writing sessions");
    check(await recallDisclosure.getByText(/语义相近 \d+%/).count() > 0, true, "memory recall explains semantic similarity instead of hiding its ranking");
    check(await recallDisclosure.locator("article.is-project-source").count() > 0, true, "hybrid recall includes related project source material alongside long-term memory");
    check((await recallDisclosure.locator("article.is-project-source small").first().textContent()).includes("项目原文"), true, "hybrid recall labels project source authority explicitly");
    check(aiRequests.slice(-3).some((request) => JSON.stringify(request.body).includes("【项目原文召回】")), true, "planning, drafting, or review receives the retrieved project source bundle");
    const recalledMemory = recallDisclosure.locator("article").filter({ hasText: "哥哥下落" });
    await recalledMemory.waitFor();
    check((await recalledMemory.locator("small").textContent()).includes("草稿记忆"), true, "memory recall exposes its authority level");
    check((await recalledMemory.locator("small").textContent()).includes("相关度"), true, "memory recall exposes a relevance score");
    await semanticRecallToggle.uncheck();
    check(await semanticRecallToggle.isChecked(), false, "semantic recall can be disabled per writing session");
    await semanticRecallToggle.check();
    await recalledMemory.getByLabel("从当前写作目标排除记忆 哥哥下落", { exact: true }).click();
    await recalledMemory.waitFor({ state: "detached" });
    check(await recallDisclosure.locator("article").filter({ hasText: "哥哥下落" }).count(), 0, "author exclusion immediately removes a memory from the current target");
    await page.screenshot({
      path: path.join(root, "validation", "g10-ai-semantic-recall.png"),
      fullPage: false
    });
    await page.getByRole("button", { name: "收起写作资料", exact: true }).click();
    check(await page.locator(".ai-story-library").count(), 0, "AI writing library collapses for long-form focus");
    await page.getByRole("button", { name: "展开写作资料", exact: true }).click();
    check(await page.locator(".ai-story-library").count(), 1, "AI writing library reopens without losing the active draft");
    await page.getByRole("button", { name: "记忆", exact: true }).click();
    await page.locator(".ai-story-list").getByText("哥哥下落", { exact: true }).waitFor();
    await page.locator(".ai-story-list > button").filter({ hasText: "哥哥下落" }).click();
    check(
      await page.getByLabel("记忆事实主体").inputValue(),
      "艾琳的哥哥",
      "reviewed memory stores a structured fact subject"
    );
    check(await page.getByLabel("记忆事实属性").inputValue(), "当前位置", "reviewed memory stores a fact property");
    check(await page.getByLabel("记忆事实值").inputValue(), "未知", "reviewed memory stores a fact value");
    await page.locator(".ai-story-view-tabs").getByRole("button", { name: /来源/ }).click();
    check(await page.getByText("艾琳走进雾鸦堡。", { exact: true }).count(), 1, "memory keeps an exact source excerpt");
    await page.locator(".ai-story-view-tabs").getByRole("button", { name: "事实", exact: true }).click();
    await page.getByLabel("记忆事实状态").selectOption("confirmed");
    check(
      await page.getByLabel("记忆事实状态").inputValue(),
      "confirmed",
      "author can confirm reviewed facts"
    );
    const memoryExclusionList = page.locator(".ai-memory-exclusion-list");
    check(await memoryExclusionList.count(), 1, "excluded target is visible from the memory fact page");
    await memoryExclusionList.locator("button").first().click();
    check(await page.locator(".ai-memory-exclusion-list").count(), 0, "author can restore an excluded memory without recreating it");
    await page.screenshot({
      path: path.join(root, "validation", "ai-memory-fact-1440.png"),
      fullPage: false
    });
    await page.getByRole("button", { name: "添加记忆", exact: true }).click();
    await page.getByLabel("记忆标题").fill("哥哥位置旧说");
    await page.getByLabel("记忆内容").fill("有人声称艾琳的哥哥在黑塔");
    await page.getByLabel("记忆事实主体").fill("艾琳的哥哥");
    await page.getByLabel("记忆事实属性").fill("当前位置");
    await page.getByLabel("记忆事实值").fill("黑塔");
    await page.getByLabel("记忆时间范围").fill("序章");
    await page.getByRole("button", { name: /检测到 1 个事实冲突/ }).click();
    await page.getByText(/同时记录为“未知”和“黑塔”/).waitFor();
    check(await page.getByText("已确认事实冲突", { exact: true }).count(), 1, "structured fact conflict is detected");
    await page.screenshot({
      path: path.join(root, "validation", "ai-memory-engine-1440.png"),
      fullPage: false
    });
    const maxLibraryRowHeight = await page.locator(".ai-story-list > button").evaluateAll((items) =>
      Math.max(...items.map((item) => item.getBoundingClientRect().height))
    );
    check(maxLibraryRowHeight <= 80, true, "library rows remain compact when only a few items exist");
    const originalViewport = page.viewportSize();
    await page.setViewportSize({ width: 1100, height: 780 });
    check(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      true,
      "simplified studio has no page-level horizontal overflow at 1100px"
    );
    await page.screenshot({
      path: path.join(root, "validation", "ai-memory-engine-1100.png"),
      fullPage: false
    });
    if (originalViewport) await page.setViewportSize(originalViewport);
    await page.getByRole("button", { name: "保留“未知”", exact: true }).click();
    await page.getByText("此记忆没有事实冲突", { exact: true }).waitFor();
    check(await page.getByText(/哥哥位置旧说/).count() > 0, true, "superseded memory remains recoverable in the library");
    await page.waitForTimeout(1200);

    const entityContentBeforeRecordedDraft = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      return loaded.data.entities.find((item) => item.id === "entity-ailin")?.content || "";
    });
    await page.getByRole("button", { name: "写作", exact: true }).click();
    await page.locator(".ai-story-list > button").filter({ hasText: "艾琳序章深度写作" }).click();
    await page.locator(".ai-story-view-tabs").getByRole("button", { name: "文稿", exact: true }).click();
    await page.getByRole("button", { name: "追加到项目目标", exact: true }).click();
    await page.getByLabel("条目标题").waitFor();
    const recordedDraftState = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const run = loaded.data.aiOperationRuns.find((item) =>
        item.changes.some((change) =>
          change.itemId === "entity-ailin" &&
          String(change.after?.content || "").includes("哥哥留下的划痕")
        )
      );
      return {
        content: loaded.data.entities.find((item) => item.id === "entity-ailin")?.content || "",
        summary: run?.summary || "",
        runStatus: run?.status || "",
        changeTarget: run?.changes.find((change) => change.itemId === "entity-ailin")?.target || ""
      };
    });
    check(recordedDraftState.content.includes("哥哥留下的划痕"), true, "story studio writes its reviewed draft to the selected project target");
    check(recordedDraftState.summary, "追加条目正文：艾琳", "story studio records a readable operation summary");
    check(recordedDraftState.runStatus, "applied", "story studio writes enter the unified AI operation ledger");
    check(recordedDraftState.changeTarget, "entity", "recorded story writes retain their exact target type");
    check(fs.readdirSync(path.join(userDataDir, "backups")).some((file) => file.startsWith("worldcraft-codex-ai-content-apply-")), true, "story studio creates a complete checkpoint before writing");
    await page.getByRole("button", { name: "AI 工具", exact: true }).click();
    await page.getByText(recordedDraftState.summary, { exact: true }).waitFor();
    await page.getByLabel(`撤销：${recordedDraftState.summary}`, { exact: true }).click();
    await page.getByText("这次 AI 操作已完整撤销", { exact: true }).waitFor();
    const entityContentAfterRecordedUndo = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      return loaded.data.entities.find((item) => item.id === "entity-ailin")?.content || "";
    });
    check(entityContentAfterRecordedUndo, entityContentBeforeRecordedDraft, "unified AI undo restores the exact pre-write entity content");

    await page.getByRole("button", { name: "项目操作", exact: true }).click();
    await page.getByRole("heading", { name: "项目操作", exact: true }).waitFor();
    const operationDialogStart = 0;
    let operationDialogCount = operationDialogStart;
    const operationDialogHandler = async (dialog) => {
      operationDialogCount += 1;
      await dialog.dismiss();
    };
    page.on("dialog", operationDialogHandler);
    await page.getByLabel("AI 项目任务").fill("创建一个覆盖分类、模板、条目、任务、剧情测试、权限、地图、制作和时间线的测试调查支线，并邀请 ai-reviewer@example.test 作为审阅员");
    await page.getByRole("button", { name: "执行项目任务", exact: true }).click();
    await page.getByText("已直接执行 20 个操作", { exact: true }).waitFor({ timeout: 60000 });
    page.off("dialog", operationDialogHandler);
    check(operationDialogCount, operationDialogStart, "AI project operation runs without a confirmation dialog");
    check(aiRequests.length, 8, "project operator sends one structured model request");
    const operationPrompt = JSON.stringify(aiRequests[7].body);
    check(operationPrompt.includes("实验对象"), false, "project operator excludes secret template fields");
    check(operationPrompt.includes("map-marker-group"), true, "project operator advertises map structure operations");
    check(operationPrompt.includes("narrative-milestone"), true, "project operator advertises narrative production operations");
    check(operationPrompt.includes("manuscript-chapter"), true, "project operator advertises long-form manuscript operations");
    check(operationPrompt.includes("entity-template"), true, "project operator advertises project structure operations");
    check(operationPrompt.includes("story-test-preset"), true, "project operator advertises test preset operations");
    check(operationPrompt.includes("creator@worldcraft.local"), false, "project operator excludes member accounts");
    check(await page.getByText("AI 操作测试角色", { exact: true }).count(), 1, "operation audit lists the created entity");
    check(await page.getByText("AI 调查角色模板", { exact: true }).count(), 1, "operation audit lists the created template");
    check(await page.getByText("AI 调查默认测试", { exact: true }).count(), 1, "operation audit lists the created test preset");
    check(await page.getByText("AI 剧情审阅员", { exact: true }).count(), 1, "operation audit lists the created member");
    check(await page.getByText("AI 操作调查地图", { exact: true }).count(), 1, "operation audit lists the created map");
    check(await page.getByText("AI 调查章节", { exact: true }).count(), 1, "operation audit lists the created narrative milestone");
    const backupDir = path.join(userDataDir, "backups");
    check(
      fs.readdirSync(backupDir).some((file) => file.startsWith("worldcraft-codex-ai-operation-")),
      true,
      "AI project operation creates a dedicated preflight checkpoint"
    );
    const operatorViewport = page.viewportSize();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(root, "validation", "ai-project-operator-1440.png"),
      fullPage: false
    });
    await page.setViewportSize({ width: 1100, height: 780 });
    await page.waitForTimeout(300);
    check(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      true,
      "project operator has no page-level horizontal overflow at 1100px"
    );
    await page.screenshot({
      path: path.join(root, "validation", "ai-project-operator-1100.png"),
      fullPage: false
    });
    if (operatorViewport) {
      await page.setViewportSize(operatorViewport);
      await page.waitForTimeout(300);
    }
    await page.locator(".ai-operator-change-list button").filter({ hasText: "AI 调查档案" }).click();
    const categoryDialog = page.getByRole("dialog", { name: "编辑分类" });
    await categoryDialog.waitFor();
    check(await categoryDialog.getByLabel("名称").inputValue(), "AI 调查档案", "category audit opens the exact category editor");
    await page.screenshot({
      path: path.join(root, "validation", "ai-operation-category-jump.png"),
      fullPage: false
    });
    await categoryDialog.getByRole("button", { name: "关闭" }).click();
    await page.getByRole("button", { name: "AI 工具", exact: true }).click();
    await page.getByText("E2E AI 跨模块操作", { exact: true }).waitFor();
    await page.locator(".ai-operator-change-list button").filter({ hasText: "AI 调查角色模板" }).click();
    await page.getByLabel("模板名称").waitFor();
    check(await page.getByLabel("模板名称").inputValue(), "AI 调查角色模板", "template audit opens the exact template editor");
    await page.screenshot({
      path: path.join(root, "validation", "ai-operation-template-jump.png"),
      fullPage: false
    });
    await page.getByRole("button", { name: "AI 工具", exact: true }).click();
    await page.getByText("E2E AI 跨模块操作", { exact: true }).waitFor();
    await page.locator(".ai-operator-change-list button").filter({ hasText: "AI 调查默认测试" }).click();
    await page.getByLabel("测试预设名称").waitFor();
    check(await page.getByLabel("测试预设名称").inputValue(), "AI 调查默认测试", "preset audit opens the exact story test preset");
    await verifyDocumentFlowPanels(
      page,
      ".story-test-preset-panel, .story-test-inspector",
      "story test navigation and inspector remain in the workspace document flow"
    );
    await page.screenshot({
      path: path.join(root, "validation", "ai-operation-preset-jump.png"),
      fullPage: false
    });
    await page.getByRole("button", { name: "AI 工具", exact: true }).click();
    await page.getByText("E2E AI 跨模块操作", { exact: true }).waitFor();
    await page.locator(".ai-operator-change-list button").filter({ hasText: "AI 调查反馈待补" }).click();
    await page.getByLabel("问题标题").waitFor();
    check(await page.getByLabel("问题标题").inputValue(), "AI 调查反馈待补", "review audit opens the exact issue");
    await page.getByRole("button", { name: "AI 工具", exact: true }).click();
    await page.getByText("E2E AI 跨模块操作", { exact: true }).waitFor();
    await page.locator(".ai-operator-change-list button").filter({ hasText: "AI 剧情审阅员" }).click();
    await page.locator('[data-member-id]').filter({ hasText: "AI 剧情审阅员" }).waitFor();
    check(await page.locator('[data-member-id]').filter({ hasText: "AI 剧情审阅员" }).count(), 1, "member audit opens the permissions workspace at the exact member");
    await page.getByRole("button", { name: "AI 工具", exact: true }).click();
    await page.getByText("E2E AI 跨模块操作", { exact: true }).waitFor();
    await page.locator(".ai-operator-change-list button").filter({ hasText: "AI 线索图层" }).click();
    await page.getByRole("heading", { name: "AI 线索图层", exact: true }).waitFor();
    check(await page.getByLabel("图层名称").inputValue(), "AI 线索图层", "map layer audit opens the exact internal structure");
    await page.getByRole("button", { name: "AI 工具", exact: true }).click();
    await page.getByText("E2E AI 跨模块操作", { exact: true }).waitFor();
    await page.locator(".ai-operator-change-list button").filter({ hasText: "AI 异常符号" }).click();
    check(await page.getByLabel("当前地图").locator("option:checked").textContent(), "AI 操作调查地图", "map audit opens the affected map");
    await page.getByRole("heading", { name: "AI 异常符号", exact: true }).waitFor();
    check(await page.getByLabel("标记名称").inputValue(), "AI 异常符号", "map audit opens the exact affected marker");
    await page.screenshot({
      path: path.join(root, "validation", "ai-operation-map-jump.png"),
      fullPage: false
    });
    await page.getByRole("button", { name: "AI 工具", exact: true }).click();
    await page.getByText("E2E AI 跨模块操作", { exact: true }).waitFor();
    await page.locator(".ai-operator-change-list button").filter({ hasText: "AI 调查章节" }).click();
    await page.getByRole("heading", { name: "叙事制作", exact: true }).waitFor();
    check(await page.locator(".narrative-editor-heading strong").textContent(), "AI 调查章节", "milestone audit opens the exact production item");
    await page.screenshot({
      path: path.join(root, "validation", "ai-operation-milestone-jump.png"),
      fullPage: false
    });

    await verifyHealthy(page);
    await page.getByRole("button", { name: "导出诊断包", exact: true }).click();
    await page.getByText(/诊断包已导出/).waitFor({ timeout: 30000 });
    check(fs.existsSync(diagnosticPath), true, "diagnostic bundle is exported from the UI");
    const diagnosticText = fs.readFileSync(diagnosticPath, "utf8");
    const diagnostic = JSON.parse(diagnosticText);
    check(diagnostic.privacy?.includesProjectContent, false, "bundle declares no project content");
    check(diagnosticText.includes("艾琳"), false, "bundle excludes entity titles");
    check(diagnosticText.includes("实验对象"), false, "bundle excludes secret template values");
    check(diagnosticText.includes(userDataDir), false, "bundle excludes local paths");

    console.log("Electron smoke: draining queued saves on normal quit...");
    await page.evaluate(async (description) => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const base = loaded.data;
      window.__worldcraftPendingSaves = Array.from({ length: 40 }, (_, index) => {
        const data = structuredClone(base);
        data.worlds[0].description = `E2E queued save ${index}`;
        return window.worldcraftStore.saveWorkspace(data, "autosave");
      });
    }, queuedDescription);
    await quitAndWait(app);
    app = undefined;

    console.log("Electron smoke: verifying normal restart...");
    ({ electronApp: app, page } = await launch());
    await waitForWorkspace(page);
    check(
      await page.getByLabel("世界描述").inputValue(),
      queuedDescription,
      "normal quit drains the save queue"
    );
    const persistedManuscriptG10 = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const chapter = loaded.data.manuscriptChapters.find((item) => item.title === "E2E 第一章 风雪来信");
      const book = loaded.data.manuscriptBooks.find((item) => item.id === chapter?.bookId);
      const annotation = chapter?.annotations?.find((item) => item.comment === "精简开场节奏");
      return {
        acceptedRevision: Boolean(chapter?.body?.includes("风雪吞没了城门钟声") && annotation?.status === "accepted"),
        annotationReply: annotation?.replies?.[0]?.body || "",
        dailyGoal: book?.dailyWordGoal || 0,
        writingDays: book?.writingDays?.length || 0
      };
    });
    check(
      persistedManuscriptG10,
      { acceptedRevision: true, annotationReply: "作者确认采用", dailyGoal: 600, writingDays: 1 },
      "manuscript revisions, replies, goal, and writing rhythm survive restart"
    );
    const persistedPickerReference = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const entity = loaded.data.entities.find((item) => item.title === "E2E 关联角色");
      const marker = loaded.data.mapMarkers.find((item) => item.id === "marker-fogkeep");
      return Boolean(
        entity && marker?.references.some(
          (reference) => reference.kind === "entity" && reference.id === entity.id
        )
      );
    });
    check(persistedPickerReference, true, "picker-created reference survives restart");
    const persistedMapHierarchy = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const childMap = loaded.data.maps.find((item) => item.title === "雾鸦堡内城");
      return {
        entryMarkerId: childMap?.entryMarkerId || "",
        parentMapId: childMap?.parentMapId || ""
      };
    });
    check(
      persistedMapHierarchy,
      { entryMarkerId: "marker-fogkeep", parentMapId: "map-canglan" },
      "map hierarchy and marker drill-down binding survive a normal desktop restart"
    );
    const persistedMapStoryPhase = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const map = loaded.data.maps.find((item) => item.id === "map-canglan");
      const phase = map?.storyPhases?.find((item) => item.title === "北境战后");
      return Boolean(
        phase
        && phase.timelineEventId === "timeline-northwar"
        && phase.hiddenMarkerIds.includes("marker-fogkeep")
        && phase.hiddenRegionIds.length === 1
        && phase.hiddenRouteIds.length === 1
        && phase.hiddenLayerIds.length === 0
      );
    });
    check(persistedMapStoryPhase, true, "story phase visibility and timeline binding survive a normal desktop restart");
    const persistedMapRegion = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const map = loaded.data.maps.find((item) => item.id === "map-canglan");
      const region = map?.regions?.find((item) => item.title === "E2E 南海禁区");
      return {
        exists: Boolean(region),
        kind: region?.kind || "",
        linked: Boolean(region?.references.some(
          (reference) => reference.kind === "entity" && reference.id === "entity-ailin"
        )),
        points: region?.points.length || 0,
        visible: region?.visible ?? false,
        locked: region?.locked ?? true
      };
    });
    check(
      persistedMapRegion,
      { exists: true, kind: "danger", linked: true, points: 5, visible: true, locked: false },
      "authored map region survives a normal desktop restart"
    );
    const persistedInfiniteCanvasContent = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const map = loaded.data.maps.find((item) => item.id === "map-canglan");
      const marker = loaded.data.mapMarkers.find((item) => item.label === "E2E 画布外标记");
      const region = map?.regions?.find((item) => item.title === "E2E 画布外区域");
      return {
        markerOutside: Boolean(marker && (marker.x < 0 || marker.x > 100 || marker.y < 0 || marker.y > 100)),
        regionOutside: Boolean(region?.points.some(
          (point) => point.x < 0 || point.x > 100 || point.y < 0 || point.y > 100
        ))
      };
    });
    check(
      persistedInfiniteCanvasContent,
      { markerOutside: true, regionOutside: true },
      "infinite-canvas coordinates survive a normal desktop restart"
    );
    const persistedMapScaleAndTravel = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const map = loaded.data.maps.find((item) => item.id === "map-canglan");
      const route = loaded.data.mapRoutes.find(
        (item) => item.mapId === "map-canglan" && item.travelMode === "vehicle" && item.travelSpeed === 20
      );
      return {
        distanceUnit: map?.distanceUnit || "",
        distanceWidth: map?.distanceWidth || 0,
        image: map?.imageUrl?.startsWith("worldcraft://asset/") ?? false,
        imageSize: map ? { height: map.height, width: map.width } : null,
        imageTransform: map?.imageTransform ?? null,
        grid: map ? {
          columns: map.grid.columns,
          labels: map.grid.labels,
          snap: map.grid.snap,
          visible: map.grid.visible
        } : null,
        route: route ? {
          hoursPerDay: route.travelHoursPerDay,
          mode: route.travelMode,
          speed: route.travelSpeed
        } : null
      };
    });
    check(
      persistedMapScaleAndTravel,
      {
        distanceUnit: "km",
        distanceWidth: 1200,
        image: true,
        imageSize: { height: 900, width: 1600 },
        imageTransform: {
          flipX: false,
          flipY: false,
          x: 12,
          y: -8,
          scale: 1.35,
          rotation: 30
        },
        grid: { columns: 10, labels: true, snap: false, visible: true },
        route: { hoursPerDay: 10, mode: "vehicle", speed: 20 }
      },
      "map calibration, grid and route travel model survive restart"
    );
    const persistedMapImageLayer = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const layer = loaded.data.mapLayers.find((item) => item.id === "map-layer-default:map-canglan");
      return Boolean(
        layer?.imageUrl?.startsWith("worldcraft://asset/")
        && layer.imageBlendMode === "multiply"
        && layer.imageOpacity === 0.45
        && layer.imageTransform.x !== 18
        && layer.imageTransform.scale !== 0.7
        && layer.imageTransform.scale > 0
        && layer.imageTransform.rotation === -25
      );
    });
    check(persistedMapImageLayer, true, "image layer asset, transform, opacity and blend mode survive restart");
    const persistedInlineEdit = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const session = loaded.data.aiWritingSessions.find((item) => item.inlineEdit?.fieldPath === "summary");
      return {
        summary: loaded.data.entities.find((item) => item.id === "entity-ailin")?.summary || "",
        status: session?.inlineEdit?.status || "",
        candidateMemory: loaded.data.aiMemoryItems.some((item) => item.title === "艾琳的身份称谓")
      };
    });
    check(persistedInlineEdit.summary.startsWith("银盔骑士艾琳"), true, "inline field edit survives restart");
    check(persistedInlineEdit.status, "applied", "inline draft branch survives restart");
    check(persistedInlineEdit.candidateMemory, true, "inline candidate memory survives restart");
    await page.getByRole("button", { name: "AI 工具", exact: true }).click();
    await page.getByText("E2E AI 跨模块操作", { exact: true }).waitFor();
    const persistedOperation = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      return {
        category: loaded.data.codexCategories.some((item) => item.title === "AI 调查档案"),
        template: loaded.data.entityTemplates.some((item) => item.name === "AI 调查角色模板"),
        entity: loaded.data.entities.some((item) => item.title === "AI 操作测试角色"),
        quest: loaded.data.quests.some((item) => item.title === "AI 操作测试任务"),
        scene: loaded.data.storyScenes.some((item) => item.title === "AI 操作测试场景"),
        preset: loaded.data.storyTestPresets.some((item) => item.name === "AI 调查默认测试"),
        issue: loaded.data.storyReviewIssues.some((item) => item.title === "AI 调查反馈待补"),
        member: loaded.data.members.some((item) => item.name === "AI 剧情审阅员" && item.role === "editor"),
        relation: loaded.data.relations.some((item) => item.label === "在此调查"),
        map: loaded.data.maps.some((item) => item.title === "AI 操作调查地图" && item.regions.some((region) => region.title === "AI 调查区域")),
        mapLayer: loaded.data.mapLayers.some((item) => item.title === "AI 线索图层"),
        mapMarker: loaded.data.mapMarkers.some((item) => item.label === "AI 异常符号"),
        mapRoute: loaded.data.mapRoutes.some((item) => item.title === "AI 调查路线" && item.stops.length === 2),
        milestone: loaded.data.narrativeMilestones.some((item) => item.title === "AI 调查章节"),
        timeline: loaded.data.timelineEvents.some((item) => item.title === "AI 操作测试时间点")
      };
    });
    check(persistedOperation, { category: true, template: true, entity: true, quest: true, scene: true, preset: true, issue: true, member: true, relation: true, map: true, mapLayer: true, mapMarker: true, mapRoute: true, milestone: true, timeline: true }, "full project operation survives restart");
    const operationSnapshotDrift = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const run = loaded.data.aiOperationRuns.find((item) => item.summary === "E2E AI 跨模块操作");
      if (!run) return [{ label: "missing run", field: "", expected: null, current: null }];
      return run.changes.flatMap((change) => {
        const current = loaded.data[change.collection]?.find((item) => item.id === change.itemId) ?? null;
        const expected = change.after;
        if (JSON.stringify(current) === JSON.stringify(expected)) return [];
        const keys = new Set([...Object.keys(expected || {}), ...Object.keys(current || {})]);
        return [...keys]
          .filter((key) => JSON.stringify(expected?.[key]) !== JSON.stringify(current?.[key]))
          .map((field) => ({ label: change.label, field, expected: expected?.[field], current: current?.[field] }));
      });
    });
    check(operationSnapshotDrift, [], "operation snapshots remain byte-stable after restart");
    await page.getByLabel("撤销：E2E AI 跨模块操作").click();
    const operationUndoMessage = page.locator(".ai-operator-message");
    await page.waitForFunction(() =>
      document.querySelector(".ai-operator-message")?.textContent !== "正在校验并撤销这次操作..."
    );
    check(await operationUndoMessage.textContent(), "这次 AI 操作已完整撤销", "full project operation remains undoable after restart");
    check(
      fs.readdirSync(path.join(userDataDir, "backups")).some((file) => file.startsWith("worldcraft-codex-ai-operation-undo-")),
      true,
      "undo creates a dedicated safety checkpoint"
    );
    const undoneOperation = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      return {
        category: loaded.data.codexCategories.some((item) => item.title === "AI 调查档案"),
        template: loaded.data.entityTemplates.some((item) => item.name === "AI 调查角色模板"),
        entity: loaded.data.entities.some((item) => item.title === "AI 操作测试角色"),
        quest: loaded.data.quests.some((item) => item.title === "AI 操作测试任务"),
        scene: loaded.data.storyScenes.some((item) => item.title === "AI 操作测试场景"),
        preset: loaded.data.storyTestPresets.some((item) => item.name === "AI 调查默认测试"),
        issue: loaded.data.storyReviewIssues.some((item) => item.title === "AI 调查反馈待补"),
        member: loaded.data.members.some((item) => item.name === "AI 剧情审阅员"),
        relation: loaded.data.relations.some((item) => item.label === "在此调查"),
        map: loaded.data.maps.some((item) => item.title === "AI 操作调查地图"),
        mapLayer: loaded.data.mapLayers.some((item) => item.title === "AI 线索图层"),
        mapMarker: loaded.data.mapMarkers.some((item) => item.label === "AI 异常符号"),
        mapRoute: loaded.data.mapRoutes.some((item) => item.title === "AI 调查路线"),
        milestone: loaded.data.narrativeMilestones.some((item) => item.title === "AI 调查章节"),
        timeline: loaded.data.timelineEvents.some((item) => item.title === "AI 操作测试时间点")
      };
    });
    check(undoneOperation, { category: false, template: false, entity: false, quest: false, scene: false, preset: false, issue: false, member: false, relation: false, map: false, mapLayer: false, mapMarker: false, mapRoute: false, milestone: false, timeline: false }, "one-click undo removes the full project transaction");
    await page.getByRole("button", { name: "剧情写作", exact: true }).click();
    await page.locator(".ai-story-list > button").filter({ hasText: "内嵌 AI" }).click();
    await page.getByText("一致性检查", { exact: true }).waitFor();
    await page.screenshot({
      path: path.join(root, "validation", "g3-inline-ai-history.png"),
      fullPage: false
    });
    await page.getByRole("button", { name: "撤销这次字段修改", exact: true }).click();
    await page.getByText("字段已恢复到 AI 修改前的版本", { exact: true }).waitFor();
    check(
      fs.readdirSync(path.join(userDataDir, "backups")).some((file) => file.startsWith("worldcraft-codex-ai-inline-undo-")),
      true,
      "inline undo creates a dedicated safety checkpoint"
    );
    const revertedInlineEdit = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const session = loaded.data.aiWritingSessions.find((item) => item.inlineEdit?.fieldPath === "summary");
      return {
        summary: loaded.data.entities.find((item) => item.id === "entity-ailin")?.summary || "",
        status: session?.inlineEdit?.status || "",
        revertedAt: session?.inlineEdit?.revertedAt || "",
        candidateMemory: loaded.data.aiMemoryItems.some((item) => item.title === "艾琳的身份称谓")
      };
    });
    check(revertedInlineEdit.summary, inlineSummaryBefore, "inline undo restores the exact original field value");
    check(revertedInlineEdit.status, "reverted", "inline undo persists the reverted branch state");
    check(Boolean(revertedInlineEdit.revertedAt), true, "inline undo records when the branch was reverted");
    check(revertedInlineEdit.candidateMemory, false, "inline undo removes its unconfirmed candidate memory");
    await page.getByText("艾琳序章深度写作", { exact: true }).waitFor();
    await page.locator(".ai-story-list > button").filter({ hasText: "艾琳序章深度写作" }).click();
    check(
      (await page.getByLabel("AI 剧情正文").inputValue()).includes("哥哥留下的划痕"),
      true,
      "writing session and applied edit survive restart"
    );
    await page.getByRole("button", { name: "记忆", exact: true }).click();
    check(await page.locator(".ai-story-list").getByText("哥哥下落", { exact: true }).count() > 0, true, "long-term memory survives restart");
    const g8DesktopViewport = page.viewportSize();
    await page.setViewportSize({ width: 700, height: 820 });
    await page.getByRole("button", { name: "收起写作资料", exact: true }).click();
    check(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      true,
      "AI writing focus has no page-level horizontal overflow at 700px"
    );
    await page.screenshot({
      path: path.join(root, "validation", "g8-ai-story-narrow.png"),
      fullPage: false
    });
    await page.reload();
    await waitForWorkspace(page);
    await openWorkspace(page, "知识库");
    check(await page.locator(".entity-browser").count(), 0, "narrow startup opens the selected entry instead of covering it with the library");
    await page.getByRole("button", { name: "打开条目检查", exact: true }).click();
    const narrowInspectorClose = page.getByRole("button", { name: "关闭条目检查", exact: true });
    const narrowInspectorHitTest = await inspectHitTarget(
      narrowInspectorClose,
      ".codex-grid > .inspector-stack"
    );
    check(
      narrowInspectorHitTest.clickable,
      true,
      `narrow inspector keeps its close control above the drawer (${JSON.stringify(narrowInspectorHitTest)})`
    );
    await narrowInspectorClose.click();
    await page.screenshot({
      path: path.join(root, "validation", "g8-codex-narrow.png"),
      fullPage: false
    });
    await page.getByRole("button", { name: "展开条目列表", exact: true }).click();
    const narrowLibraryBox = await page.locator(".entity-browser").boundingBox();
    check(Boolean(narrowLibraryBox && narrowLibraryBox.width <= 320), true, "narrow codex library opens as a bounded drawer");
    await page.getByRole("button", { name: "收起条目列表", exact: true }).first().click();
    if (g8DesktopViewport) await page.setViewportSize(g8DesktopViewport);
    await verifyHealthy(page);

    const process = app.process();
    process.kill();
    await new Promise((resolve) => process.once("exit", resolve));
    await app.close().catch(() => undefined);
    app = undefined;

    console.log("Electron smoke: verifying abnormal-exit restart...");
    ({ electronApp: app, page } = await launch());
    await waitForWorkspace(page);
    check(
      await page.getByLabel("世界描述").inputValue(),
      queuedDescription,
      "abnormal exit preserves the last committed state"
    );
    const abnormalInlineState = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      const session = loaded.data.aiWritingSessions.find((item) => item.inlineEdit?.fieldPath === "summary");
      return {
        summary: loaded.data.entities.find((item) => item.id === "entity-ailin")?.summary || "",
        status: session?.inlineEdit?.status || "",
        candidateMemory: loaded.data.aiMemoryItems.some((item) => item.title === "艾琳的身份称谓")
      };
    });
    check(abnormalInlineState, { summary: inlineSummaryBefore, status: "reverted", candidateMemory: false }, "inline undo survives abnormal-exit restart");
    await verifyHealthy(page);
    check(
      fs.existsSync(path.join(userDataDir, "logs", "worldcraft.log.jsonl")),
      true,
      "startup log is persisted"
    );
    await quitAndWait(app);
    app = undefined;

    console.log(`Electron smoke checks passed: ${assertions} assertions across 3 launches.`);
  } finally {
    if (app) {
      await quitAndWait(app, 5000).catch(() => app.process().kill());
    }
    await new Promise((resolve) => aiServer.close(resolve));
    fs.rmSync(runRoot, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
