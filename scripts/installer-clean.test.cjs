const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { extractFile } = require("@electron/asar");

const root = path.resolve(__dirname, "..");
const version = process.argv[2] || require(path.join(root, "package.json")).version;
const installerPath = path.resolve(
  process.argv[3] || path.join(root, "release", `Worldcraft Codex-Setup-${version}.exe`)
);
const runRoot = path.join(root, "validation", `installer-clean-${process.pid}`);
const installDir = path.join(runRoot, "application");
const installerTempDir = path.join(runRoot, "installer-temp");
const reportPath = path.join(root, "validation", `installer-clean-${version}.json`);
const uninstallRegistryKey =
  "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\7b7217c1-71b4-5d24-b41e-050e1c030100";
let assertions = 0;
let installed = false;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

function registeredInstallExists() {
  return spawnSync("reg.exe", ["query", uninstallRegistryKey], {
    encoding: "utf8",
    windowsHide: true
  }).status === 0;
}

function registryVersion() {
  const result = spawnSync("reg.exe", ["query", uninstallRegistryKey, "/v", "DisplayVersion"], {
    encoding: "utf8",
    windowsHide: true
  });
  if (result.status !== 0) return "";
  return String(result.stdout).trim().split(/\s+/).at(-1) || "";
}

function waitFor(predicate, timeout = 60000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    if (predicate()) return true;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
  }
  return false;
}

function runExecutable(executablePath, args, label) {
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
    throw new Error(`${label} failed with ${result.status}: ${result.stderr || result.stdout || "no output"}`);
  }
}

function productVersion(executablePath) {
  const result = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "(Get-Item -LiteralPath $env:WORLDCRAFT_INSTALL_TEST_EXE).VersionInfo.ProductVersion"
    ],
    {
      encoding: "utf8",
      env: { ...process.env, WORLDCRAFT_INSTALL_TEST_EXE: executablePath },
      timeout: 30000,
      windowsHide: true
    }
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || "Unable to read installed version.");
  return result.stdout.trim();
}

function packagedVersion() {
  const packageBytes = extractFile(path.join(installDir, "resources", "app.asar"), "package.json");
  return String(JSON.parse(packageBytes.toString("utf8")).version || "");
}

function findUninstaller() {
  if (!fs.existsSync(installDir)) return "";
  return fs
    .readdirSync(installDir)
    .map((name) => path.join(installDir, name))
    .find((filePath) => /^Uninstall.*\.exe$/i.test(path.basename(filePath))) || "";
}

function uninstall() {
  const uninstaller = findUninstaller();
  if (!uninstaller) return false;
  runExecutable(uninstaller, ["/S"], "NSIS uninstaller");
  installed = false;
  return waitFor(() => !fs.existsSync(path.join(installDir, "Worldcraft Codex.exe")) && !registeredInstallExists());
}

try {
  check(fs.existsSync(installerPath), true, "current NSIS installer exists");
  check(registeredInstallExists(), false, "no user installation is overwritten by the clean-install test");
  fs.rmSync(runRoot, { recursive: true, force: true });
  fs.mkdirSync(installDir, { recursive: true });
  fs.mkdirSync(installerTempDir, { recursive: true });
  check(
    path.parse(installDir).root.toLowerCase(),
    path.parse(installerTempDir).root.toLowerCase(),
    "NSIS temp and application directories share a volume"
  );

  runExecutable(installerPath, ["/S", `/D=${installDir}`], "NSIS installer");
  installed = true;
  const executablePath = path.join(installDir, "Worldcraft Codex.exe");
  check(waitFor(() => fs.existsSync(executablePath)), true, "installer creates the application executable");
  const windowsVersion = `${version.match(/^\d+\.\d+\.\d+/)?.[0] || version}.0`;
  check(productVersion(executablePath), windowsVersion, "installed executable reports the expected Windows version");
  check(packagedVersion(), version, "installed application package reports the exact SemVer version");
  check(registeredInstallExists(), true, "installer writes the product registration");
  check(registryVersion(), version, "product registration reports the expected version");
  check(Boolean(findUninstaller()), true, "installer provides an uninstaller");

  check(uninstall(), true, "silent uninstall completes and clears product registration");
  check(fs.existsSync(executablePath), false, "uninstall removes application files");
  check(registeredInstallExists(), false, "uninstall removes product registration");

  const report = {
    assertions,
    installVolume: path.parse(installDir).root,
    registrationRemoved: true,
    uninstallCompleted: true,
    version
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.rmSync(runRoot, { recursive: true, force: true });
  console.log(JSON.stringify(report));
  console.log(`Clean installer checks passed: ${assertions} assertions; report ${reportPath}`);
} catch (error) {
  if (installed) {
    try {
      uninstall();
    } catch {
      // Preserve the original failure and the isolated workspace for diagnosis.
    }
  }
  console.error(error);
  console.error(`Clean installer workspace retained at ${runRoot}`);
  process.exitCode = 1;
}
