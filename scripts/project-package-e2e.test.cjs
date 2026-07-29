const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const fs = require("node:fs");
const { createHash } = require("node:crypto");
const { once } = require("node:events");
const path = require("node:path");
const { promisify } = require("node:util");
const { _electron: electron } = require("playwright-core");
const { WORKSPACE_COLLECTIONS } = require("../electron/workspace-store.cjs");

const root = path.resolve(__dirname, "..");
const runRoot = path.join(root, "validation", `project-package-e2e-${process.pid}`);
const sourceUserData = path.join(runRoot, "source-user-data");
const cleanUserData = path.join(runRoot, "clean-user-data");
const packagePath = path.join(runRoot, "portable-roundtrip.wcodex");
const replacementPath = path.join(runRoot, "replacement.png");
const resourceScreenshotPath = path.join(root, "validation", "g5-project-package-resources.png");
const backupScreenshotPath = path.join(root, "validation", "g5-project-package-backups.png");
const packagedExecutablePath = process.env.WORLDCRAFT_E2E_EXECUTABLE?.trim();
const executablePath = packagedExecutablePath || require("electron");
const executableArgs = packagedExecutablePath ? [] : ["."];
const assetBytes = fs.readFileSync(path.join(root, "app", "icon.png"));
const expectedHash = createHash("sha256").update(assetBytes).digest("hex");
const execFileAsync = promisify(execFile);
const activeElectronApps = new Set();
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForProcessExit(childProcess, timeout = 5000) {
  if (!childProcess || childProcess.exitCode !== null || childProcess.signalCode) return true;
  return Promise.race([
    once(childProcess, "exit").then(() => true),
    delay(timeout).then(() => false)
  ]);
}

async function closeElectronApp(electronApp) {
  if (!electronApp) return;
  const childProcess = electronApp.process();
  await Promise.race([
    electronApp.close().catch(() => undefined),
    delay(10000)
  ]);

  if (!(await waitForProcessExit(childProcess, 1000)) && childProcess?.pid) {
    if (process.platform === "win32") {
      await execFileAsync("taskkill", ["/PID", String(childProcess.pid), "/T", "/F"], {
        windowsHide: true
      }).catch(() => undefined);
    } else {
      childProcess.kill("SIGKILL");
    }
    await waitForProcessExit(childProcess, 3000);
  }
  activeElectronApps.delete(electronApp);
}

async function launch(userDataDir, extraEnv = {}) {
  const env = {
    ...process.env,
    WORLDCRAFT_USER_DATA_DIR: userDataDir,
    ...extraEnv
  };
  delete env.ELECTRON_RUN_AS_NODE;
  const electronApp = await electron.launch({
    executablePath,
    args: executableArgs,
    cwd: root,
    env,
    timeout: 30000
  });
  activeElectronApps.add(electronApp);
  try {
    const page = await electronApp.firstWindow({ timeout: 30000 });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(() => Boolean(window.worldcraftStore), undefined, { timeout: 30000 });
    return { electronApp, page };
  } catch (error) {
    await closeElectronApp(electronApp);
    throw error;
  }
}

async function enterWorkspace(page) {
  await page.waitForFunction(() =>
    Boolean(document.querySelector("[role='dialog'][aria-label='选择项目起步包']")) ||
    Boolean(document.querySelector(".compact-save-status")?.textContent.includes("SQLite"))
  );
  const dialog = page.getByRole("dialog", { name: "选择项目起步包", exact: true });
  if (await dialog.isVisible()) {
    await dialog.getByRole("radio", { name: /游戏叙事/ }).click();
    await dialog.getByRole("button", { name: "进入创作台", exact: true }).click();
  }
  await page.locator(".compact-save-status").waitFor({ state: "visible", timeout: 30000 });
}

async function openWorkspace(page, name) {
  const button = page.getByRole("button", { name, exact: true });
  if (!(await button.isVisible())) {
    await page.locator(".rail-more > summary").click();
    await button.waitFor({ state: "visible" });
  }
  await button.click();
}

async function run() {
  fs.rmSync(runRoot, { recursive: true, force: true });
  fs.mkdirSync(path.join(sourceUserData, "assets"), { recursive: true });
  fs.writeFileSync(path.join(sourceUserData, "assets", "legacy-resource.png"), assetBytes);
  fs.writeFileSync(replacementPath, assetBytes);

  const workspace = Object.fromEntries(
    WORKSPACE_COLLECTIONS.map((collection) => [collection, []])
  );
  workspace.worlds = [
    {
      id: "world-portable",
      ownerId: "member-owner",
      name: "完整工程往返世界",
      description: "This data must survive a clean profile import.",
      visibility: "private",
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z"
    }
  ];
  workspace.assets = [
    {
      id: "asset-portable",
      worldId: "world-portable",
      name: "Portable Resource",
      kind: "image",
      storedName: "legacy-resource.png",
      originalName: "portable-resource.png",
      mimeType: "image/png",
      size: assetBytes.length,
      contentHash: "",
      tags: ["roundtrip"],
      notes: "Retain metadata.",
      linkedEntityIds: [],
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z"
    }
  ];
  workspace.maps = [
    {
      id: "map-portable",
      worldId: "world-portable",
      title: "Portable Map",
      imageUrl: "worldcraft://asset/legacy-resource.png"
    }
  ];

  const source = await launch(sourceUserData, {
    WORLDCRAFT_PROJECT_SAVE_OUTPUT: packagePath
  });
  try {
    const saved = await source.page.evaluate(async (data) => {
      await window.worldcraftStore.saveWorkspace(data, "package-e2e-seed");
      return window.worldcraftStore.saveProjectAs(data);
    }, workspace);
    check(saved.ok, true, "desktop bridge saves a complete package");
    check(saved.format, "package", "save result identifies package format");
    check(saved.packageSummary.complete, true, "all resources are embedded");
    check(saved.packageSummary.assetCount, 1, "logical resource count is reported");
    check(saved.packageSummary.uniqueFileCount, 1, "physical resource count is reported");
    check(saved.assetUpdates[0].contentHash, expectedHash, "desktop save returns canonical hash");
    check(fs.existsSync(packagePath), true, "package exists outside the source profile");
  } finally {
    await closeElectronApp(source.electronApp);
  }

  fs.rmSync(sourceUserData, { recursive: true, force: true });
  check(fs.existsSync(sourceUserData), false, "source profile is removed before import");

  const clean = await launch(cleanUserData, {
    WORLDCRAFT_PROJECT_OPEN_INPUT: packagePath,
    WORLDCRAFT_ASSET_RELINK_INPUT: replacementPath
  });
  let importedStoredName;
  try {
    await enterWorkspace(clean.page);
    await openWorkspace(clean.page, "导出");
    await clean.page.getByRole("button", { name: "打开工程包", exact: true }).click();
    await clean.page.waitForFunction(
      () => document.querySelector("[aria-label='世界名称']")?.value === "完整工程往返世界",
      undefined,
      { timeout: 30000 }
    );
    const loaded = await clean.page.evaluate(() => window.worldcraftStore.loadWorkspace());
    check(loaded.data.worlds[0].name, "完整工程往返世界", "clean profile receives workspace data");
    check(loaded.data.assets[0].contentHash, expectedHash, "clean profile receives asset hash");
    importedStoredName = loaded.data.assets[0].storedName;
    check(/^asset-[a-f0-9]{24}\.png$/.test(importedStoredName), true, "import uses content-addressed name");
    check(
      loaded.data.maps[0].imageUrl,
      `worldcraft://asset/${importedStoredName}`,
      "stored asset URLs are rewritten"
    );
    const importedPath = path.join(cleanUserData, "assets", importedStoredName);
    check(fs.readFileSync(importedPath), assetBytes, "resource bytes are restored into clean profile");
    const checked = await clean.page.evaluate((asset) => window.worldcraftStore.checkAssets([asset]), loaded.data.assets[0]);
    check(checked.files[0].hashMatches, true, "desktop integrity check validates SHA-256");
    check(checked.files[0].sizeMatches, true, "desktop integrity check validates size");

    const completeBackup = await clean.page.evaluate((data) =>
      window.worldcraftStore.createCompleteBackup(data), loaded.data);
    check(completeBackup.ok, true, "desktop bridge creates a complete backup");
    check(completeBackup.packageSummary.complete, true, "complete backup contains every resource");
    const backupList = await clean.page.evaluate(() => window.worldcraftStore.listBackups());
    const completeEntry = backupList.backups.find((backup) => backup.fileName.endsWith(".wcodex"));
    check(completeEntry.kind, "complete", "backup list distinguishes complete packages");
    check(completeEntry.complete, true, "backup list reports resource completeness");
    const changed = structuredClone(loaded.data);
    changed.worlds[0].name = "Temporary changed name";
    await clean.page.evaluate((data) => window.worldcraftStore.saveWorkspace(data, "package-e2e-change"), changed);
    const restored = await clean.page.evaluate((fileName) =>
      window.worldcraftStore.restoreBackup(fileName), completeEntry.fileName);
    check(restored.ok, true, "complete backup restores through the desktop bridge");
    check(restored.data.worlds[0].name, "完整工程往返世界", "complete backup restores project data");
    check(restored.packageSummary.complete, true, "complete backup restore validates resources");

    await openWorkspace(clean.page, "项目检查");
    await clean.page.getByRole("heading", { name: "项目检查", exact: true }).waitFor();
    await clean.page.getByText("含全部资源", { exact: true }).first().waitFor();
    await clean.page.screenshot({ path: backupScreenshotPath, fullPage: false });
    check(fs.existsSync(backupScreenshotPath), true, "complete backup UI screenshot is captured");

    await openWorkspace(clean.page, "资源库");
    await clean.page.getByRole("heading", { name: "资源库", exact: true }).waitFor();
    await clean.page.getByText("SHA-256 完整性已验证", { exact: true }).waitFor();
    await clean.page.screenshot({ path: resourceScreenshotPath, fullPage: false });
    check(fs.existsSync(resourceScreenshotPath), true, "resource integrity UI screenshot is captured");

    fs.rmSync(importedPath, { force: true });
    const missing = await clean.page.evaluate((asset) => window.worldcraftStore.checkAssets([asset]), loaded.data.assets[0]);
    check(missing.files[0].exists, false, "missing imported resource is detected");
    const relinked = await clean.page.evaluate((asset) =>
      window.worldcraftStore.relinkAsset({
        storedName: asset.storedName,
        originalName: asset.originalName,
        contentHash: asset.contentHash,
        missing: true
      }), loaded.data.assets[0]);
    check(relinked.ok, true, "missing resource can be relinked");
    check(relinked.hashMatchedExpected, true, "relinked resource matches the recorded hash");
    check(fs.readFileSync(path.join(cleanUserData, "assets", relinked.asset.storedName)), assetBytes, "relink restores bytes");
  } finally {
    await closeElectronApp(clean.electronApp);
  }

  const restarted = await launch(cleanUserData);
  try {
    const loaded = await restarted.page.evaluate(() => window.worldcraftStore.loadWorkspace());
    check(loaded.data.worlds[0].name, "完整工程往返世界", "imported workspace survives restart");
    check(loaded.data.assets[0].storedName, importedStoredName, "content-addressed resource name survives restart");
    check(fs.existsSync(path.join(cleanUserData, "assets", importedStoredName)), true, "resource survives restart");
  } finally {
    await closeElectronApp(restarted.electronApp);
  }

  console.log(`Project package Electron checks passed: ${assertions} assertions across 3 launches.`);
}

run()
  .finally(async () => {
    await Promise.allSettled(Array.from(activeElectronApps, closeElectronApp));
    if (process.env.WORLDCRAFT_KEEP_VALIDATION !== "1") {
      fs.rmSync(runRoot, { recursive: true, force: true });
    }
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
