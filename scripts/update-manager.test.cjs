const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { EventEmitter } = require("node:events");
const {
  MINIMUM_UPDATE_DISK_BYTES,
  UpdateManager,
  loadReleaseConfig,
  normalizeReleaseConfig,
  safeError
} = require("../electron/update-manager.cjs");

const root = path.join(__dirname, "..", "validation", "update-manager-" + process.pid);
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

class FakeUpdater extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this.checkCount = 0;
    this.downloadCount = 0;
    this.installCount = 0;
  }

  async checkForUpdates() {
    this.checkCount += 1;
    this.emit("checking-for-update");
    this.emit("update-available", {
      version: "2.2.0",
      releaseName: "Stable candidate",
      releaseDate: "2026-07-16T00:00:00.000Z"
    });
    return { updateInfo: { version: "2.2.0" } };
  }

  async downloadUpdate() {
    this.downloadCount += 1;
    this.emit("download-progress", {
      percent: 42.5,
      transferred: 425,
      total: 1000,
      bytesPerSecond: 200
    });
    this.emit("update-downloaded", { version: "2.2.0" });
    return ["package.exe"];
  }

  quitAndInstall() {
    this.installCount += 1;
  }
}

function releaseConfig(overrides = {}) {
  return normalizeReleaseConfig({
    format: "worldcraft-release-config-v1",
    mode: "public",
    appVersion: "2.2.0-rc.20",
    channel: "candidate",
    publisher: {
      displayName: "Worldcraft Codex",
      legalName: "Example Studio",
      certificateName: "Example Studio"
    },
    links: {
      homepage: "https://example.com/app",
      support: "https://example.com/support",
      privacy: "https://example.com/privacy",
      terms: "https://example.com/terms"
    },
    updates: {
      stableUrl: "https://updates.example.com/stable",
      candidateUrl: "https://updates.example.com/candidate",
      autoCheck: true,
      autoDownload: false
    },
    legal: {
      version: "2026-07",
      requiresAcceptance: true
    },
    distribution: {
      publicReady: true,
      signedBuildRequired: true,
      externalBlockers: []
    },
    ...overrides
  }, "2.2.0-rc.20");
}

function manager(options = {}) {
  let updater;
  let beforeInstallCount = 0;
  const instance = new UpdateManager({
    appVersion: "2.2.0-rc.20",
    config: options.config || releaseConfig(),
    preferencesPath: options.preferencesPath || path.join(root, "preferences.json"),
    isPackaged: options.isPackaged ?? true,
    platform: options.platform || "win32",
    portable: options.portable || false,
    diskSpacePath: root,
    getFreeDiskBytes: options.getFreeDiskBytes || (() => 5 * 1024 * 1024 * 1024),
    createUpdater: (updaterOptions) => {
      updater = new FakeUpdater(updaterOptions);
      return updater;
    },
    beforeInstall: async () => {
      beforeInstallCount += 1;
    },
    now: () => "2026-07-16T12:00:00.000Z"
  });
  return {
    instance,
    getUpdater: () => updater,
    getBeforeInstallCount: () => beforeInstallCount
  };
}

(async () => {
  const development = manager({ isPackaged: false });
  check(development.instance.getStatus().state, "unsupported", "development build is unsupported");
  check(development.instance.getStatus().reason, "development", "development reason is explicit");

  const portable = manager({ portable: true, preferencesPath: path.join(root, "portable.json") });
  check(portable.instance.getStatus().state, "unsupported", "portable build avoids in-place updates");
  check(portable.instance.getStatus().reason, "portable", "portable reason is explicit");

  const unconfigured = manager({
    config: releaseConfig({
      updates: { stableUrl: "", candidateUrl: "", autoCheck: true, autoDownload: false }
    }),
    preferencesPath: path.join(root, "unconfigured.json")
  });
  check(unconfigured.instance.getStatus().state, "unconfigured", "missing feed is explicit");
  check(unconfigured.instance.getStatus().configured, false, "missing feed prevents network checks");

  const active = manager({ preferencesPath: path.join(root, "active.json") });
  const statuses = [];
  active.instance.onStatus((status) => statuses.push(status.state));
  check(active.instance.getStatus().state, "idle", "configured installer starts idle");
  check(active.instance.getStatus().legalAcceptanceRequired, true, "public build requires legal acceptance");
  active.instance.acceptLegal("wrong-version");
  check(active.instance.getStatus().legalAcceptanceRequired, true, "wrong legal version is ignored");
  active.instance.acceptLegal("2026-07");
  check(active.instance.getStatus().legalAcceptanceRequired, false, "current legal version can be accepted");
  check(fs.existsSync(path.join(root, "active.json")), true, "release preferences persist locally");

  await active.instance.checkForUpdates();
  check(active.instance.getStatus().state, "available", "available update is surfaced");
  check(active.instance.getStatus().latestVersion, "2.2.0", "available version is retained");
  check(active.instance.getStatus().lastCheckedAt, "2026-07-16T12:00:00.000Z", "check time is retained");
  check(active.getUpdater().autoDownload, false, "updater never downloads without preference");
  check(active.getUpdater().allowPrerelease, true, "candidate channel permits prereleases");
  check(active.getUpdater().options.url, "https://updates.example.com/candidate", "candidate feed is selected");
  check(statuses.includes("checking"), true, "checking transition is emitted");
  check(statuses.includes("available"), true, "available transition is emitted");

  await active.instance.downloadUpdate();
  check(active.getUpdater().downloadCount, 1, "download is explicitly invoked");
  check(active.instance.getStatus().state, "downloaded", "download completion is retained");
  check(active.instance.getStatus().percent, 100, "download completion reaches 100 percent");
  check(active.instance.getStatus().total, 1000, "download total is retained");
  check(active.instance.getStatus().freeDiskBytes > MINIMUM_UPDATE_DISK_BYTES, true, "download records available disk space");

  await active.instance.installUpdate();
  check(active.getBeforeInstallCount(), 1, "install flush hook runs first");
  check(active.getUpdater().installCount, 1, "downloaded update invokes installer");
  check(active.instance.getStatus().state, "installing", "install transition is retained");

  const lowDisk = manager({
    preferencesPath: path.join(root, "low-disk.json"),
    getFreeDiskBytes: () => 512 * 1024 * 1024
  });
  await lowDisk.instance.checkForUpdates();
  await lowDisk.instance.downloadUpdate();
  check(lowDisk.instance.getStatus().state, "error", "insufficient disk space blocks the download");
  check(lowDisk.getUpdater().downloadCount, 0, "insufficient disk space avoids starting the updater download");
  check(
    lowDisk.instance.getStatus().error.includes("2 GiB"),
    true,
    "disk error gives an actionable minimum"
  );

  active.instance.setPreferences({ channel: "stable", autoCheck: false, autoDownload: true });
  check(active.instance.getStatus().preferences.channel, "stable", "channel preference updates");
  check(active.instance.getStatus().preferences.autoCheck, false, "automatic checks can be disabled");
  check(active.instance.getStatus().preferences.autoDownload, true, "automatic downloads can be enabled");
  await active.instance.checkForUpdates();
  check(active.getUpdater().options.url, "https://updates.example.com/stable", "stable feed is selected");
  check(active.getUpdater().allowPrerelease, false, "stable channel rejects prereleases");
  await new Promise((resolve) => setImmediate(resolve));
  check(active.getUpdater().downloadCount, 1, "automatic download follows explicit preference");

  const reloaded = manager({ preferencesPath: path.join(root, "active.json") });
  check(reloaded.instance.getStatus().preferences.channel, "stable", "channel survives restart");
  check(reloaded.instance.getStatus().legalAcceptanceRequired, false, "legal acceptance survives restart");

  const configPath = path.join(root, "release-config.json");
  fs.writeFileSync(configPath, JSON.stringify(releaseConfig()), "utf8");
  const loaded = loadReleaseConfig({
    appVersion: "2.2.0-rc.20",
    resourcesPath: root,
    appPath: "",
    overridePath: ""
  });
  check(loaded.filePath, configPath, "packaged release config is loaded from resources");
  check(loaded.config.distribution.publicReady, true, "public readiness is retained");
  check(
    safeError({ code: "ERR_NETWORK", message: "https://secret.example/path" }),
    "Update request failed (ERR_NETWORK).",
    "update errors omit URLs and response details"
  );

  for (const item of [development, portable, unconfigured, active, lowDisk, reloaded]) {
    item.instance.dispose();
  }
  fs.rmSync(root, { recursive: true, force: true });
  console.log("Update manager checks passed: " + assertions + " assertions across 5 modes.");
})().catch((error) => {
  fs.rmSync(root, { recursive: true, force: true });
  console.error(error);
  process.exitCode = 1;
});
