const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

const root = path.resolve(__dirname, "..");
const executablePath = require("electron");
const worldName = "雾灯群岛";
const productionUserDataDir = path.resolve(
  process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
  "worldcraft-codex"
);

function resolveDemoUserDataDir() {
  const requested = String(process.env.WORLDCRAFT_DEMO_USER_DATA_DIR || "").trim();
  if (!requested) {
    throw new Error(
      "录屏脚本只允许使用隔离数据。请设置 WORLDCRAFT_DEMO_USER_DATA_DIR 后重试。"
    );
  }
  const resolved = path.resolve(requested);
  const normalized = resolved.toLocaleLowerCase("en-US");
  const production = productionUserDataDir.toLocaleLowerCase("en-US");
  if (normalized === production || normalized.startsWith(`${production}${path.sep}`)) {
    throw new Error("录屏脚本拒绝使用正式 Worldcraft Codex 用户数据目录。");
  }
  const dbPath = path.join(resolved, "worldcraft-codex.sqlite");
  if (fs.existsSync(dbPath) && fs.statSync(dbPath).size > 256 * 1024 * 1024) {
    throw new Error("隔离演示数据库超过 256 MiB，请确认没有误指向正式项目副本。");
  }
  return resolved;
}

const wait = (page, milliseconds = 350) => page.waitForTimeout(milliseconds);

async function visibleFill(page, locator, value, chunks = 5) {
  await locator.scrollIntoViewIfNeeded();
  await locator.click();
  await locator.fill("");
  const chunkSize = Math.max(1, Math.ceil(value.length / chunks));
  for (let index = chunkSize; index < value.length; index += chunkSize) {
    await locator.fill(value.slice(0, index));
    await wait(page, 85);
  }
  await locator.fill(value);
  await wait(page, 260);
}

async function editEntity(page, previousTitle, next) {
  const titleInput = page.getByLabel("条目标题", { exact: true });
  const currentTitle = await titleInput.inputValue();
  if (currentTitle !== previousTitle && currentTitle !== next.title) {
    const searchInput = page.locator(".codex-grid .entity-browser .search-box input");
    await searchInput.fill(previousTitle);
    await wait(page, 280);
    const treeEntry = page.locator(".codex-tree-entity").filter({ hasText: previousTitle }).first();
    await treeEntry.scrollIntoViewIfNeeded();
    await treeEntry.click();
    await page.waitForFunction(
      (title) => document.querySelector("input[aria-label='条目标题']")?.value === title,
      previousTitle
    );
  }

  await visibleFill(page, titleInput, next.title, 4);
  await visibleFill(page, page.getByLabel("摘要", { exact: true }), next.summary, 6);
  await visibleFill(page, page.locator(".rich-editor-content .tiptap").first(), next.content, 7);
  await wait(page, 650);
}

async function main() {
  const demoUserDataDir = resolveDemoUserDataDir();
  const env = {
    ...process.env,
    ELECTRON_START_URL: process.env.ELECTRON_START_URL || "http://localhost:3000",
    WORLDCRAFT_USER_DATA_DIR: demoUserDataDir
  };
  delete env.ELECTRON_RUN_AS_NODE;

  const app = await electron.launch({
    executablePath,
    args: ["."],
    cwd: root,
    env,
    timeout: 45000
  });

  const page = await app.firstWindow({ timeout: 45000 });
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.maximize());
  await page.bringToFront();
  await page.waitForLoadState("domcontentloaded");
  await page.locator(".compact-save-status").waitFor({ state: "visible", timeout: 45000 });
  await page.waitForFunction(() => Boolean(window.worldcraftStore?.loadWorkspace));
  await page.waitForFunction(
    () => document.querySelector(".compact-save-status")?.textContent?.includes("SQLite"),
    undefined,
    { timeout: 45000 }
  );

  await page.getByLabel("切换界面主题", { exact: true }).click();
  await page.getByRole("radio", { name: /^海雾/ }).click();
  await wait(page, 500);

  await page.getByLabel("切换世界").click();
  const existingWorld = page.locator(".world-menu-worlds button").filter({ hasText: worldName });
  if (await existingWorld.count()) {
    await existingWorld.first().click();
  } else {
    await page.getByRole("button", { name: "创建世界", exact: true }).click();
    const starterDialog = page.getByRole("dialog", { name: "选择项目起步包", exact: true });
    await starterDialog.waitFor({ state: "visible" });
    await starterDialog.getByRole("radio", { name: /^开放世界任务/ }).click();
    await visibleFill(page, starterDialog.getByLabel("新世界名称"), worldName, 5);
    await starterDialog.getByRole("button", { name: "进入创作台", exact: true }).click();
    await starterDialog.waitFor({ state: "hidden", timeout: 45000 });
  }

  await page.getByLabel("世界名称", { exact: true }).waitFor({ state: "visible" });
  assert.equal(await page.getByLabel("世界名称", { exact: true }).inputValue(), worldName);
  await wait(page, 500);

  await page.getByLabel("切换世界").click();
  await page.locator(".world-menu-settings > summary").click();
  await visibleFill(
    page,
    page.getByLabel("世界描述", { exact: true }),
    "月轮碎裂后，群岛漂浮在会吞噬记忆的潮雾之上。巡灯人守护航线，而海底旧城正借每次大潮向现实复苏。",
    7
  );
  await page.getByLabel("切换世界").click();
  await wait(page, 350);

  await editEntity(page, "巡林人岚", {
    title: "迟舟",
    summary: "能听见遗失记忆回声的年轻巡灯人，正在寻找被海雾抹去的故乡。",
    content: "迟舟出生于地图上不存在的第七码头。十年前的白潮夜后，所有人都忘记了那里，只有他保留着一枚刻有坐标的铜灯芯。每次借助听潮能力，他都会失去一段自己的记忆。"
  });
  await editEntity(page, "灰脊高地", {
    title: "潮眠城",
    summary: "建在三艘远古巨舰脊背上的港城，也是群岛最后一座永不熄灭的灯港。",
    content: "潮眠城分为上层灯桥、中层浮市与下层沉舱。城市依靠雾灯驱散潮雾，居民用记忆作为远航税。午夜退潮时，沉舱会露出通往海底旧城的石阶。"
  });
  await editEntity(page, "高地拓荒者协会", {
    title: "雾灯议会",
    summary: "控制航线、灯塔与记忆税的七席议会，公开守护群岛，暗中封锁旧城真相。",
    content: "议会由七位灯主组成，每一席掌管一条主航线。他们声称第九灯塔从未存在，却持续派人回收所有与它有关的旧地图。议会内部正分裂为守序派与归潮派。"
  });
  await editEntity(page, "风暴测绘仪", {
    title: "晨星罗盘",
    summary: "不会指向北方，只会指向持有者最不愿遗忘之物的旧时代航海仪。",
    content: "罗盘由陨星铜和鲸骨制成，只有在无月潮中才会转动。迟舟的血能点亮盘面隐藏的第九条航线，但每次启动都会让潮雾记住他的名字。"
  });

  await page.locator('.app-rail .tabbar button[data-label="任务线"]').click();
  await page.locator(".quest-editor-panel").waitFor({ state: "visible" });
  await visibleFill(page, page.getByLabel("任务线标题", { exact: true }), "点亮第九灯塔", 5);
  await page.getByLabel("任务状态", { exact: true }).selectOption("active");
  await visibleFill(
    page,
    page.locator(".quest-editor-panel .field").filter({ hasText: "任务简介" }).locator("textarea").first(),
    "沿失落航线穿越三重潮雾，在记忆彻底消散前点亮第九灯塔。",
    6
  );
  await visibleFill(
    page,
    page.locator(".quest-editor-panel .field").filter({ hasText: "触发条件" }).locator("textarea").first(),
    "晨星罗盘在无月潮前自行转动，并指向地图上不存在的海域。",
    6
  );
  await wait(page, 900);

  await page.locator('.app-rail .tabbar button[data-label="世界总览"]').click();
  await page.locator(".wiki-world-intro").waitFor({ state: "visible" });
  await page.locator(".wiki-viewport").evaluate((element) => element.scrollTo({ top: 0 }));
  await page.bringToFront();
  console.log("__DEMO_READY__");

  await new Promise((resolve) => {
    app.once("close", resolve);
    page.once("close", resolve);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
