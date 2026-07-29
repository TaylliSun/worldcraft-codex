const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { _electron: electron } = require("playwright-core");
const { flipFuses, FuseVersion, FuseV1Options } = require("@electron/fuses");

const root = path.resolve(__dirname, "..");
const packageJson = require(path.join(root, "package.json"));

function previousCandidateVersion(version) {
  const match = version.match(/^(.*-rc\.)(\d+)$/);
  if (!match || Number(match[2]) < 1) {
    throw new Error("Set an explicit baseline version when the current version is not an RC.");
  }
  return `${match[1]}${Number(match[2]) - 1}`;
}

const oldVersion = process.argv[2] || previousCandidateVersion(packageJson.version);
const newVersion = process.argv[3] || packageJson.version;
const oldInstaller = path.resolve(
  process.argv[4] || path.join(root, "validation", "baseline-release", `Worldcraft Codex-Setup-${oldVersion}.exe`)
);
const newInstaller = path.resolve(
  process.argv[5] || path.join(root, "release", `Worldcraft Codex-Setup-${newVersion}.exe`)
);
const expectedNewSchema = Number(process.argv[6] || 17);
const expectedOldSchema = Number(process.argv[7] || 17);
const uninstallRegistryKey = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\7b7217c1-71b4-5d24-b41e-050e1c030100";
const runRoot = path.join(root, "validation", `upgrade-install-${process.pid}`);
// electron-builder atomically renames old files through %TEMP% during updates.
// Keep the isolated application and its private NSIS temp directory on the same spacious volume.
const installDir = path.join(runRoot, "application");
const installerTempDir = path.join(runRoot, "installer-temp");
const userDataDir = path.join(runRoot, "user-data");
const reportPath = path.join(
  root,
  "validation",
  `upgrade-install-${oldVersion}-to-${newVersion}.json`
);
const marker = {
  description: `upgrade-description-${process.pid}`,
  summary: `upgrade-summary-${process.pid}`,
  worldName: `升级保留世界 ${process.pid}`
};
let assertions = 0;
let installed = false;
let activeApp = null;
let activeHarnessPath = "";

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

function removeTestDirectory(directory, allowedParent) {
  const target = path.resolve(directory);
  const parent = path.resolve(allowedParent);
  if (target === parent || !target.startsWith(`${parent}${path.sep}`)) {
    throw new Error(`Refusing to remove test directory outside ${parent}: ${target}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
}

function registeredInstallExists() {
  return spawnSync("reg.exe", ["query", uninstallRegistryKey], {
    encoding: "utf8",
    windowsHide: true
  }).status === 0;
}

function waitForFile(filePath, timeout = 60000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) return true;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
  }
  return false;
}

function runExecutable(executablePath, args, label) {
  check(fs.existsSync(executablePath), true, `${label} executable exists`);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const result = spawnSync(executablePath, args, {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        TEMP: installerTempDir,
        TMP: installerTempDir
      },
      timeout: 300000,
      windowsHide: true
    });
    if (result.error) throw result.error;
    if (result.status === 0) return;
    if (result.status === 2 && attempt < 4) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
      continue;
    }
    throw new Error(
      `${label} failed with ${result.status}: ${result.stderr || result.stdout || "no output"}`
    );
  }
}

function install(installerPath, label, updateMode = false) {
  runExecutable(installerPath, [...(updateMode ? ["--updated"] : []), "/S", `/D=${installDir}`], label);
  if (!waitForFile(installedExecutable(), 60000)) {
    throw new Error(`${label} returned without creating the isolated application executable.`);
  }
  installed = true;
}

function installedExecutable() {
  return path.join(installDir, "Worldcraft Codex.exe");
}

function findUninstaller() {
  if (!fs.existsSync(installDir)) return "";
  return fs
    .readdirSync(installDir)
    .map((name) => path.join(installDir, name))
    .find((filePath) => /^Uninstall.*\.exe$/i.test(path.basename(filePath))) || "";
}

async function launchInstalled(expectedVersion) {
  const env = { ...process.env, WORLDCRAFT_USER_DATA_DIR: userDataDir };
  delete env.ELECTRON_RUN_AS_NODE;
  const harnessPath = path.join(installDir, "Worldcraft Codex E2E Harness.exe");
  fs.copyFileSync(installedExecutable(), harnessPath);
  await flipFuses(harnessPath, {
    version: FuseVersion.V1,
    [FuseV1Options.EnableNodeCliInspectArguments]: true
  });
  activeHarnessPath = harnessPath;
  const electronApp = await electron.launch({
    executablePath: harnessPath,
    env,
    timeout: 60000
  });
  activeApp = electronApp;
  const page = await electronApp.firstWindow({ timeout: 60000 });
  await page.getByLabel("世界名称").waitFor({ state: "visible", timeout: 60000 });
  await page.waitForFunction(
    () =>
      Boolean(document.querySelector("[role='dialog'][aria-label='选择项目起步包']")) ||
      Boolean(document.querySelector(".compact-save-status")?.textContent.includes("SQLite")),
    undefined,
    { timeout: 60000 }
  );
  const starter = page.getByRole("dialog", { name: "选择项目起步包", exact: true });
  if (await starter.isVisible()) {
    await starter.getByRole("radio", { name: /游戏叙事/ }).click();
    await starter.getByRole("button", { name: "进入创作台", exact: true }).click();
    await page.locator(".compact-save-status").waitFor({ state: "visible", timeout: 60000 });
  }
  const version = await electronApp.evaluate(({ app }) => app.getVersion());
  check(version, expectedVersion, `installed application reports ${expectedVersion}`);
  return { electronApp, page };
}

async function closeInstalled(electronApp) {
  await electronApp.evaluate(({ app }) => app.quit()).catch(() => undefined);
  await electronApp.close().catch(() => undefined);
  if (activeApp === electronApp) activeApp = null;
  if (activeHarnessPath) {
    fs.rmSync(activeHarnessPath, { force: true });
    activeHarnessPath = "";
  }
}

async function uninstall() {
  const uninstaller = findUninstaller();
  if (!uninstaller) return false;
  runExecutable(uninstaller, ["/S"], "NSIS uninstaller");
  installed = false;
  for (
    let attempt = 0;
    attempt < 80 && (fs.existsSync(installedExecutable()) || registeredInstallExists());
    attempt += 1
  ) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return !fs.existsSync(installedExecutable()) && !registeredInstallExists();
}

(async () => {
  if (oldVersion === newVersion) {
    throw new Error("Upgrade validation requires different old and new versions.");
  }
  if (registeredInstallExists()) {
    throw new Error("An existing Worldcraft Codex installation was detected; upgrade validation stopped to protect it.");
  }
  removeTestDirectory(runRoot, path.join(root, "validation"));
  fs.mkdirSync(runRoot, { recursive: true });
  fs.mkdirSync(installDir, { recursive: true });
  fs.mkdirSync(installerTempDir, { recursive: true });
  check(
    path.parse(installDir).root.toLowerCase(),
    path.parse(installerTempDir).root.toLowerCase(),
    "NSIS temp and application directories share a volume for atomic replacement"
  );

  install(oldInstaller, `NSIS ${oldVersion} installer`);
  check(fs.existsSync(installedExecutable()), true, "old version installs its application executable");

  let launched = await launchInstalled(oldVersion);
  const seeded = await launched.page.evaluate(async (upgradeMarker) => {
    const loaded = await window.worldcraftStore.loadWorkspace();
    const data = structuredClone(loaded.data);
    data.worlds[0].name = upgradeMarker.worldName;
    data.worlds[0].description = upgradeMarker.description;
    data.worlds[0].updatedAt = new Date().toISOString();
    data.entities[0].summary = upgradeMarker.summary;
    data.entities[0].updatedAt = new Date().toISOString();
    const save = await window.worldcraftStore.saveWorkspace(data, "manual");
    const backup = await window.worldcraftStore.createBackup(data, "manual");
    const diagnostics = await window.worldcraftStore.getDiagnostics();
    return {
      backup,
      diagnostics: diagnostics.diagnostics,
      entityId: data.entities[0].id,
      save,
      worldId: data.worlds[0].id
    };
  }, marker);
  check(seeded.save.ok, true, "old version persists the upgrade fixture");
  check(seeded.backup.ok, true, "old version creates a valid manual backup");
  check(seeded.diagnostics.quickCheck, "ok", "old version database passes quick_check");
  check(seeded.diagnostics.schemaVersion, expectedOldSchema, "old version uses the expected schema");
  const seededBackupFileName = path.basename(seeded.backup.filePath);
  await closeInstalled(launched.electronApp);

  install(newInstaller, `NSIS ${newVersion} installer`, true);
  check(fs.existsSync(installedExecutable()), true, "new version replaces the installed executable");
  launched = await launchInstalled(newVersion);
  const upgraded = await launched.page.evaluate(async (upgradeMarker) => {
    const starterVisible = Boolean(
      document.querySelector("[role='dialog'][aria-label='选择项目起步包']")
    );
    const loaded = await window.worldcraftStore.loadWorkspace();
    const diagnostics = await window.worldcraftStore.getDiagnostics();
    const backups = await window.worldcraftStore.listBackups();
    const world = loaded.data.worlds.find((item) => item.name === upgradeMarker.worldName);
    const entity = loaded.data.entities.find((item) => item.summary === upgradeMarker.summary);
    return {
      backupCount: backups.backups.filter((backup) => backup.valid).length,
      diagnostics: diagnostics.diagnostics,
      entityId: entity?.id || "",
      starterVisible,
      worldDescription: world?.description || "",
      worldId: world?.id || ""
    };
  }, marker);
  check(upgraded.starterVisible, false, "upgrade reuses existing data instead of showing first-run setup");
  check(upgraded.worldId, seeded.worldId, "upgrade preserves the world and its ID");
  check(upgraded.worldDescription, marker.description, "upgrade preserves world content");
  check(upgraded.entityId, seeded.entityId, "upgrade preserves entity content and identity");
  check(upgraded.backupCount > 0, true, "upgrade preserves valid backups");
  check(
    upgraded.diagnostics.schemaVersion,
    expectedNewSchema,
    "upgraded database reports the expected schema"
  );
  check(upgraded.diagnostics.quickCheck, "ok", "upgraded database passes quick_check");
  check(upgraded.diagnostics.foreignKeyIssues, 0, "upgraded database has no foreign-key damage");
  await closeInstalled(launched.electronApp);

  check(await uninstall(), true, "new version provides a silent uninstaller");
  check(fs.existsSync(installedExecutable()), false, "uninstall removes application files");
  check(
    fs.existsSync(path.join(userDataDir, "worldcraft-codex.sqlite")),
    true,
    "uninstall preserves the user database"
  );
  check(
    fs.existsSync(path.join(userDataDir, "backups", seededBackupFileName)),
    true,
    "uninstall preserves user backups"
  );
  check(registeredInstallExists(), false, "uninstall removes the isolated product registration");

  const report = {
    assertions,
    baselineKind: "synthetic-installer-mechanics",
    fromVersion: oldVersion,
    installDirectoryRemoved: !fs.existsSync(installedExecutable()),
    installVolume: path.parse(installDir).root,
    marker,
    quickCheck: upgraded.diagnostics.quickCheck,
    schemaVersion: upgraded.diagnostics.schemaVersion,
    toVersion: newVersion,
    userBackupsPreserved: true,
    userDatabasePreserved: true
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  removeTestDirectory(runRoot, path.join(root, "validation"));
  console.log(JSON.stringify(report));
  console.log(`Upgrade install checks passed: ${assertions} assertions; report ${reportPath}`);
})().catch(async (error) => {
  if (activeApp) await closeInstalled(activeApp);
  if (installed) await uninstall().catch(() => false);
  console.error(error);
  console.error(`Upgrade validation workspace retained at ${runRoot}`);
  process.exitCode = 1;
});
