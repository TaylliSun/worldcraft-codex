const fs = require("node:fs");
const path = require("node:path");

const generatedDir = path.join(__dirname, "build", "generated");
const releaseConfigPath = path.join(generatedDir, "release-config.json");

if (!fs.existsSync(releaseConfigPath)) {
  throw new Error("Run npm run release:prepare before electron-builder.");
}

const releaseConfig = JSON.parse(fs.readFileSync(releaseConfigPath, "utf8"));
const applyElectronFuses = require("./scripts/apply-electron-fuses.cjs");
const updateUrl = releaseConfig.channel === "stable"
  ? releaseConfig.updates.stableUrl
  : releaseConfig.updates.candidateUrl;
const certificateName = String(releaseConfig.publisher.certificateName || "").trim();

module.exports = {
  appId: "local.worldcraft.codex",
  productName: "Worldcraft Codex",
  asar: true,
  compression: "maximum",
  forceCodeSigning: releaseConfig.distribution.signedBuildRequired,
  directories: {
    output: "release"
  },
  files: [
    "out/**/*",
    "electron/**/*",
    "node_modules/better-sqlite3/**/*",
    "node_modules/bindings/**/*",
    "node_modules/file-uri-to-path/**/*",
    "node_modules/electron-updater/**/*",
    "node_modules/builder-util-runtime/**/*",
    "node_modules/fs-extra/**/*",
    "node_modules/graceful-fs/**/*",
    "node_modules/jsonfile/**/*",
    "node_modules/universalify/**/*",
    "node_modules/js-yaml/**/*",
    "node_modules/argparse/**/*",
    "node_modules/lazy-val/**/*",
    "node_modules/lodash.escaperegexp/**/*",
    "node_modules/lodash.isequal/**/*",
    "node_modules/semver/**/*",
    "node_modules/tiny-typed-emitter/**/*",
    "node_modules/sax/**/*",
    "node_modules/debug/**/*",
    "node_modules/ms/**/*",
    "node_modules/yauzl/**/*",
    "node_modules/yazl/**/*",
    "node_modules/pend/**/*",
    "node_modules/buffer-crc32/**/*",
    "package.json"
  ],
  extraResources: [
    { from: path.join(generatedDir, "release-config.json"), to: "release-config.json" },
    { from: path.join(generatedDir, "EULA.txt"), to: "EULA.txt" },
    { from: path.join(generatedDir, "PRIVACY.txt"), to: "PRIVACY.txt" },
    { from: path.join(generatedDir, "THIRD_PARTY_NOTICES.txt"), to: "THIRD_PARTY_NOTICES.txt" }
  ],
  afterPack: applyElectronFuses,
  electronLanguages: ["en-US", "zh-CN"],
  win: {
    icon: "build/icon.ico",
    requestedExecutionLevel: "asInvoker",
    ...(certificateName ? { publisherName: [certificateName] } : {}),
    target: [
      { target: "portable", arch: ["x64"] },
      { target: "nsis", arch: ["x64"] }
    ]
  },
  portable: {
    artifactName: "Worldcraft Codex-Portable-${version}.${ext}",
    requestExecutionLevel: "user"
  },
  nsis: {
    artifactName: "Worldcraft Codex-Setup-${version}.${ext}",
    oneClick: true,
    perMachine: false,
    runAfterFinish: false,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    deleteAppDataOnUninstall: false,
    license: path.join(generatedDir, "EULA.txt")
  },
  ...(updateUrl ? {
    publish: [{
      provider: "generic",
      url: updateUrl,
      channel: "latest",
      publishAutoUpdate: true,
      ...(certificateName ? { publisherName: [certificateName] } : {})
    }]
  } : {})
};
