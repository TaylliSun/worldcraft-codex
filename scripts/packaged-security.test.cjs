const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const asar = require("@electron/asar");
const {
  FuseState,
  FuseV1Options,
  getCurrentFuseWire
} = require("@electron/fuses");

const root = path.resolve(__dirname, "..");
const resourcesDir = path.join(root, "release", "win-unpacked", "resources");
const executablePath = path.join(root, "release", "win-unpacked", "Worldcraft Codex.exe");
const asarPath = path.join(resourcesDir, "app.asar");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

async function main() {
  check(fs.existsSync(executablePath), true, "unpacked executable exists");
  check(fs.existsSync(asarPath), true, "packaged ASAR exists");
  const fuseWire = await getCurrentFuseWire(executablePath);
  const expectedFuses = new Map([
    [FuseV1Options.RunAsNode, FuseState.DISABLE],
    [FuseV1Options.EnableCookieEncryption, FuseState.ENABLE],
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable, FuseState.DISABLE],
    [FuseV1Options.EnableNodeCliInspectArguments, FuseState.DISABLE],
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation, FuseState.ENABLE],
    [FuseV1Options.OnlyLoadAppFromAsar, FuseState.ENABLE],
    [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot, FuseState.DISABLE],
    [FuseV1Options.GrantFileProtocolExtraPrivileges, FuseState.DISABLE],
    [FuseV1Options.WasmTrapHandlers, FuseState.ENABLE]
  ]);
  check(Object.keys(fuseWire).filter((key) => /^\d+$/.test(key)).length, expectedFuses.size, "all Electron fuses are named and configured");
  for (const [index, state] of expectedFuses) {
    check(fuseWire[index], state, "fuse " + FuseV1Options[index]);
  }

  const entries = new Set(asar.listPackage(asarPath).map((entry) =>
    entry.replace(/\\/g, "/").replace(/^\//, "")
  ));
  for (const entry of [
    "electron/main.cjs",
    "electron/preload.cjs",
    "electron/update-manager.cjs",
    "node_modules/electron-updater/out/main.js"
  ]) {
    check(entries.has(entry), true, entry + " is packaged");
  }
  const packagedMetadata = JSON.parse(asar.extractFile(asarPath, "package.json").toString("utf8"));
  check(packagedMetadata.version, packageJson.version, "packaged version matches package metadata");

  for (const name of ["release-config.json", "EULA.txt", "PRIVACY.txt", "THIRD_PARTY_NOTICES.txt"]) {
    const filePath = path.join(resourcesDir, name);
    check(fs.existsSync(filePath), true, name + " is bundled as an external resource");
    check(fs.statSync(filePath).size > 0, true, name + " is not empty");
  }
  const releaseConfigText = fs.readFileSync(path.join(resourcesDir, "release-config.json"), "utf8");
  const releaseConfig = JSON.parse(releaseConfigText);
  const configuredSecrets = [process.env.WIN_CSC_LINK, process.env.WIN_CSC_KEY_PASSWORD]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  check(configuredSecrets.some((value) => releaseConfigText.includes(value)), false, "signing secret values are absent from packaged configuration");
  check(Object.hasOwn(releaseConfig, "signing"), false, "packaged configuration has no signing credential object");
  console.log("Packaged security checks passed: " + assertions + " assertions.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
