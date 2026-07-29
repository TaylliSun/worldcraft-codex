const path = require("node:path");
const { flipFuses, FuseVersion, FuseV1Options } = require("@electron/fuses");

const STRICT_FUSE_CONFIG = Object.freeze({
  version: FuseVersion.V1,
  [FuseV1Options.RunAsNode]: false,
  [FuseV1Options.EnableCookieEncryption]: true,
  [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
  [FuseV1Options.EnableNodeCliInspectArguments]: false,
  [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
  [FuseV1Options.OnlyLoadAppFromAsar]: true,
  [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot]: false,
  [FuseV1Options.GrantFileProtocolExtraPrivileges]: false,
  [FuseV1Options.WasmTrapHandlers]: true,
  strictlyRequireAllFuses: true
});

async function applyElectronFuses(context) {
  if (context.electronPlatformName !== "win32") {
    throw new Error("Worldcraft Codex currently validates strict Electron fuses only for Windows builds.");
  }
  const productFilename = context.packager.appInfo.productFilename;
  const executablePath = path.join(context.appOutDir, productFilename + ".exe");
  await flipFuses(executablePath, STRICT_FUSE_CONFIG);
}

module.exports = applyElectronFuses;
module.exports.STRICT_FUSE_CONFIG = STRICT_FUSE_CONFIG;
