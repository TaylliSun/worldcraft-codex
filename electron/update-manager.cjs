const fs = require("node:fs");
const path = require("node:path");
const { EventEmitter } = require("node:events");

const MINIMUM_UPDATE_DISK_BYTES = 2 * 1024 * 1024 * 1024;

const UPDATE_STATES = new Set([
  "unsupported",
  "unconfigured",
  "idle",
  "checking",
  "available",
  "downloading",
  "downloaded",
  "installing",
  "up-to-date",
  "error"
]);

function isHttpsUrl(value) {
  try {
    const parsed = new URL(String(value || ""));
    return parsed.protocol === "https:" && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

function normalizeUrl(value) {
  const url = String(value || "").trim().replace(/\/+$/, "");
  return isHttpsUrl(url) ? url : "";
}

function normalizeReleaseConfig(raw, appVersion = "0.0.0") {
  const channel = raw?.channel === "stable" ? "stable" : "candidate";
  return {
    format: raw?.format === "worldcraft-release-config-v1"
      ? raw.format
      : "worldcraft-release-config-v1",
    mode: raw?.mode === "public" ? "public" : "candidate",
    appVersion: String(raw?.appVersion || appVersion),
    channel,
    publisher: {
      displayName: String(raw?.publisher?.displayName || "Worldcraft Codex Project").slice(0, 120),
      legalName: String(raw?.publisher?.legalName || "").slice(0, 200),
      certificateName: String(raw?.publisher?.certificateName || "").slice(0, 200)
    },
    links: Object.fromEntries(
      ["homepage", "support", "privacy", "terms"].map((key) => [
        key,
        normalizeUrl(raw?.links?.[key])
      ])
    ),
    updates: {
      stableUrl: normalizeUrl(raw?.updates?.stableUrl),
      candidateUrl: normalizeUrl(raw?.updates?.candidateUrl),
      autoCheck: raw?.updates?.autoCheck !== false,
      autoDownload: raw?.updates?.autoDownload === true
    },
    legal: {
      version: String(raw?.legal?.version || appVersion).slice(0, 80),
      requiresAcceptance: raw?.legal?.requiresAcceptance === true
    },
    distribution: {
      publicReady: raw?.distribution?.publicReady === true,
      signedBuildRequired: raw?.distribution?.signedBuildRequired === true,
      externalBlockers: Array.isArray(raw?.distribution?.externalBlockers)
        ? raw.distribution.externalBlockers.map((item) => String(item).slice(0, 240)).slice(0, 20)
        : []
    }
  };
}

function loadReleaseConfig({ appVersion, resourcesPath, appPath, overridePath }) {
  const candidates = [
    overridePath,
    resourcesPath && path.join(resourcesPath, "release-config.json"),
    appPath && path.join(appPath, "build", "generated", "release-config.json")
  ].filter(Boolean);
  for (const filePath of candidates) {
    try {
      const parsed = JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
      return { config: normalizeReleaseConfig(parsed, appVersion), filePath: path.resolve(filePath) };
    } catch {
      // Try the next trusted local configuration path.
    }
  }
  return { config: normalizeReleaseConfig({}, appVersion), filePath: "" };
}

function normalizePreferences(raw, config) {
  return {
    channel: raw?.channel === "stable" || raw?.channel === "candidate"
      ? raw.channel
      : config.channel,
    autoCheck: typeof raw?.autoCheck === "boolean" ? raw.autoCheck : config.updates.autoCheck,
    autoDownload: typeof raw?.autoDownload === "boolean"
      ? raw.autoDownload
      : config.updates.autoDownload,
    acceptedLegalVersion: String(raw?.acceptedLegalVersion || "").slice(0, 80)
  };
}

function readPreferences(filePath, config) {
  try {
    return normalizePreferences(JSON.parse(fs.readFileSync(filePath, "utf8")), config);
  } catch {
    return normalizePreferences({}, config);
  }
}

function writePreferences(filePath, preferences) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = filePath + "." + process.pid + ".tmp";
  fs.writeFileSync(temporaryPath, JSON.stringify(preferences, null, 2) + "\n", "utf8");
  fs.renameSync(temporaryPath, filePath);
}

function safeError(error) {
  const code = String(error?.code || "").replace(/[^A-Z0-9_-]/gi, "").slice(0, 40);
  return code ? "Update request failed (" + code + ")." : "Update request failed.";
}

function getAvailableDiskBytes(directory) {
  const stats = fs.statfsSync(directory);
  return Math.max(0, Number(stats.bavail) * Number(stats.bsize));
}

class UpdateManager {
  constructor({
    appVersion,
    config,
    preferencesPath,
    isPackaged,
    platform = process.platform,
    portable = false,
    createUpdater,
    diskSpacePath = "",
    getFreeDiskBytes = getAvailableDiskBytes,
    minimumFreeDiskBytes = MINIMUM_UPDATE_DISK_BYTES,
    beforeInstall = async () => undefined,
    now = () => new Date().toISOString(),
    log = () => undefined
  }) {
    this.appVersion = String(appVersion || "0.0.0");
    this.config = normalizeReleaseConfig(config, this.appVersion);
    this.preferencesPath = preferencesPath;
    this.preferences = readPreferences(preferencesPath, this.config);
    this.isPackaged = Boolean(isPackaged);
    this.platform = platform;
    this.portable = Boolean(portable);
    this.createUpdater = createUpdater;
    this.diskSpacePath = diskSpacePath;
    this.getFreeDiskBytes = getFreeDiskBytes;
    this.minimumFreeDiskBytes = Math.max(0, Number(minimumFreeDiskBytes) || 0);
    this.beforeInstall = beforeInstall;
    this.now = now;
    this.log = log;
    this.events = new EventEmitter();
    this.updater = null;
    this.updaterChannel = "";
    this.autoCheckTimer = null;
    const supported = this.isPackaged && this.platform === "win32" && !this.portable;
    const configured = Boolean(this.feedUrl());
    this.status = {
      state: supported ? (configured ? "idle" : "unconfigured") : "unsupported",
      supported,
      configured,
      reason: !this.isPackaged
        ? "development"
        : this.platform !== "win32"
          ? "platform"
          : this.portable
            ? "portable"
            : configured
              ? ""
              : "feed",
      currentVersion: this.appVersion,
      latestVersion: "",
      releaseName: "",
      releaseDate: "",
      percent: 0,
      transferred: 0,
      total: 0,
      bytesPerSecond: 0,
      lastCheckedAt: "",
      freeDiskBytes: 0,
      minimumFreeDiskBytes: this.minimumFreeDiskBytes,
      error: ""
    };
  }

  feedUrl() {
    return this.preferences.channel === "stable"
      ? this.config.updates.stableUrl
      : this.config.updates.candidateUrl;
  }

  legalAcceptanceRequired() {
    return this.config.legal.requiresAcceptance &&
      this.preferences.acceptedLegalVersion !== this.config.legal.version;
  }

  getStatus() {
    return {
      ...this.status,
      preferences: { ...this.preferences },
      releaseMode: this.config.mode,
      publicReady: this.config.distribution.publicReady,
      externalBlockerCount: this.config.distribution.externalBlockers.length,
      publisherName: this.config.publisher.displayName,
      legalName: this.config.publisher.legalName,
      legalVersion: this.config.legal.version,
      legalAcceptanceRequired: this.legalAcceptanceRequired(),
      links: { ...this.config.links }
    };
  }

  emitStatus(patch = {}) {
    const nextState = patch.state && UPDATE_STATES.has(patch.state) ? patch.state : this.status.state;
    this.status = { ...this.status, ...patch, state: nextState };
    const snapshot = this.getStatus();
    this.events.emit("status", snapshot);
    return snapshot;
  }

  checkDiskSpace() {
    try {
      const freeDiskBytes = Math.max(0, Number(this.getFreeDiskBytes(this.diskSpacePath)) || 0);
      if (freeDiskBytes < this.minimumFreeDiskBytes) {
        return {
          ok: false,
          freeDiskBytes,
          error: "系统盘可用空间不足。请至少释放 2 GiB 后再继续更新。"
        };
      }
      return { ok: true, freeDiskBytes, error: "" };
    } catch (error) {
      this.log("error", "updates.disk-check-failed", { error });
      return {
        ok: false,
        freeDiskBytes: 0,
        error: "无法确认系统盘可用空间。现有版本不受影响，请稍后重试。"
      };
    }
  }

  onStatus(listener) {
    this.events.on("status", listener);
    return () => this.events.off("status", listener);
  }

  persistPreferences() {
    writePreferences(this.preferencesPath, this.preferences);
  }

  setPreferences(patch = {}) {
    const next = normalizePreferences({ ...this.preferences, ...patch }, this.config);
    const channelChanged = next.channel !== this.preferences.channel;
    this.preferences = next;
    this.persistPreferences();
    if (channelChanged) this.resetUpdater();
    const configured = Boolean(this.feedUrl());
    return this.emitStatus({
      configured,
      state: this.status.supported ? (configured ? "idle" : "unconfigured") : "unsupported",
      reason: this.status.supported ? (configured ? "" : "feed") : this.status.reason,
      latestVersion: "",
      percent: 0,
      error: ""
    });
  }

  acceptLegal(version) {
    if (String(version) !== this.config.legal.version) return this.getStatus();
    this.preferences.acceptedLegalVersion = this.config.legal.version;
    this.persistPreferences();
    return this.emitStatus();
  }

  resetUpdater() {
    if (this.updater?.removeAllListeners) this.updater.removeAllListeners();
    this.updater = null;
    this.updaterChannel = "";
  }

  ensureUpdater() {
    const channel = this.preferences.channel;
    if (this.updater && this.updaterChannel === channel) return this.updater;
    this.resetUpdater();
    const url = this.feedUrl();
    if (!url || typeof this.createUpdater !== "function") return null;
    const updater = this.createUpdater({
      provider: "generic",
      url,
      channel: "latest",
      ...(this.config.publisher.certificateName
        ? { publisherName: [this.config.publisher.certificateName] }
        : {})
    });
    updater.autoDownload = false;
    updater.autoInstallOnAppQuit = false;
    updater.allowPrerelease = channel === "candidate";
    updater.on("checking-for-update", () => this.emitStatus({ state: "checking", error: "" }));
    updater.on("update-available", (info = {}) => {
      this.emitStatus({
        state: "available",
        latestVersion: String(info.version || "").slice(0, 80),
        releaseName: String(info.releaseName || "").slice(0, 160),
        releaseDate: String(info.releaseDate || "").slice(0, 80),
        lastCheckedAt: this.now(),
        error: ""
      });
      if (this.preferences.autoDownload) void this.downloadUpdate();
    });
    updater.on("update-not-available", () => this.emitStatus({
      state: "up-to-date",
      latestVersion: "",
      lastCheckedAt: this.now(),
      error: ""
    }));
    updater.on("download-progress", (progress = {}) => this.emitStatus({
      state: "downloading",
      percent: Math.max(0, Math.min(100, Number(progress.percent) || 0)),
      transferred: Math.max(0, Number(progress.transferred) || 0),
      total: Math.max(0, Number(progress.total) || 0),
      bytesPerSecond: Math.max(0, Number(progress.bytesPerSecond) || 0)
    }));
    updater.on("update-downloaded", (info = {}) => this.emitStatus({
      state: "downloaded",
      latestVersion: String(info.version || this.status.latestVersion || "").slice(0, 80),
      percent: 100,
      error: ""
    }));
    updater.on("error", (error) => {
      this.log("error", "updates.failed", { error });
      this.emitStatus({ state: "error", error: safeError(error) });
    });
    this.updater = updater;
    this.updaterChannel = channel;
    return updater;
  }

  async checkForUpdates() {
    if (!this.status.supported || !this.feedUrl()) return this.getStatus();
    const updater = this.ensureUpdater();
    if (!updater) return this.emitStatus({ state: "error", error: "Update service is unavailable." });
    this.emitStatus({ state: "checking", error: "", percent: 0 });
    try {
      await updater.checkForUpdates();
    } catch (error) {
      this.log("error", "updates.check-failed", { error });
      this.emitStatus({ state: "error", error: safeError(error), lastCheckedAt: this.now() });
    }
    return this.getStatus();
  }

  async downloadUpdate() {
    if (!this.status.supported || !this.feedUrl()) return this.getStatus();
    const disk = this.checkDiskSpace();
    if (!disk.ok) return this.emitStatus({
      state: "error",
      freeDiskBytes: disk.freeDiskBytes,
      error: disk.error
    });
    const updater = this.ensureUpdater();
    if (!updater) return this.emitStatus({ state: "error", error: "Update service is unavailable." });
    this.emitStatus({ state: "downloading", freeDiskBytes: disk.freeDiskBytes, error: "" });
    try {
      await updater.downloadUpdate();
    } catch (error) {
      this.log("error", "updates.download-failed", { error });
      this.emitStatus({ state: "error", error: safeError(error) });
    }
    return this.getStatus();
  }

  async installUpdate() {
    if (this.status.state !== "downloaded" || !this.updater) return this.getStatus();
    const disk = this.checkDiskSpace();
    if (!disk.ok) return this.emitStatus({
      state: "error",
      freeDiskBytes: disk.freeDiskBytes,
      error: disk.error
    });
    this.emitStatus({ state: "installing", freeDiskBytes: disk.freeDiskBytes, error: "" });
    try {
      await this.beforeInstall();
      this.updater.quitAndInstall(false, true);
    } catch (error) {
      this.log("error", "updates.install-failed", { error });
      this.emitStatus({ state: "error", error: safeError(error) });
    }
    return this.getStatus();
  }

  scheduleAutoCheck(delayMs = 12000) {
    if (!this.preferences.autoCheck || !this.status.supported || !this.feedUrl()) return false;
    if (this.autoCheckTimer) clearTimeout(this.autoCheckTimer);
    this.autoCheckTimer = setTimeout(() => {
      this.autoCheckTimer = null;
      void this.checkForUpdates();
    }, Math.max(1000, Number(delayMs) || 12000));
    return true;
  }

  dispose() {
    if (this.autoCheckTimer) clearTimeout(this.autoCheckTimer);
    this.autoCheckTimer = null;
    this.resetUpdater();
    this.events.removeAllListeners();
  }
}

module.exports = {
  MINIMUM_UPDATE_DISK_BYTES,
  UPDATE_STATES,
  UpdateManager,
  getAvailableDiskBytes,
  isHttpsUrl,
  loadReleaseConfig,
  normalizePreferences,
  normalizeReleaseConfig,
  safeError
};
