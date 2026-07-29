export type ReleaseChannel = "stable" | "candidate";
export type ReleaseUpdateState =
  | "unsupported"
  | "unconfigured"
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "downloaded"
  | "installing"
  | "up-to-date"
  | "error";

export type ReleaseStatus = {
  state: ReleaseUpdateState;
  supported: boolean;
  configured: boolean;
  reason: "development" | "platform" | "portable" | "feed" | "";
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseDate: string;
  percent: number;
  transferred: number;
  total: number;
  bytesPerSecond: number;
  lastCheckedAt: string;
  freeDiskBytes: number;
  minimumFreeDiskBytes: number;
  error: string;
  preferences: {
    channel: ReleaseChannel;
    autoCheck: boolean;
    autoDownload: boolean;
    acceptedLegalVersion: string;
  };
  releaseMode: "candidate" | "public";
  publicReady: boolean;
  externalBlockerCount: number;
  publisherName: string;
  legalName: string;
  legalVersion: string;
  legalAcceptanceRequired: boolean;
  links: {
    homepage: string;
    support: string;
    privacy: string;
    terms: string;
  };
};

export function createEmptyReleaseStatus(): ReleaseStatus {
  return {
    state: "unsupported",
    supported: false,
    configured: false,
    reason: "development",
    currentVersion: "",
    latestVersion: "",
    releaseName: "",
    releaseDate: "",
    percent: 0,
    transferred: 0,
    total: 0,
    bytesPerSecond: 0,
    lastCheckedAt: "",
    freeDiskBytes: 0,
    minimumFreeDiskBytes: 2 * 1024 * 1024 * 1024,
    error: "",
    preferences: {
      channel: "candidate",
      autoCheck: true,
      autoDownload: false,
      acceptedLegalVersion: ""
    },
    releaseMode: "candidate",
    publicReady: false,
    externalBlockerCount: 0,
    publisherName: "Worldcraft Codex Project",
    legalName: "",
    legalVersion: "",
    legalAcceptanceRequired: false,
    links: {
      homepage: "",
      support: "",
      privacy: "",
      terms: ""
    }
  };
}

export function releaseStatusText(status: ReleaseStatus) {
  if (status.state === "unsupported") {
    if (status.reason === "portable") {
      return { title: "便携版", detail: "保留原文件，下载新版本后替换" };
    }
    if (status.reason === "development") {
      return { title: "开发构建", detail: "安装版发布后启用自动更新" };
    }
    return { title: "当前平台不支持自动更新", detail: "请从官方发布页获取新版本" };
  }
  if (status.state === "unconfigured") {
    return { title: "更新源未配置", detail: "当前构建不会发起网络检查" };
  }
  if (status.state === "checking") {
    return { title: "正在检查更新", detail: "正在读取所选通道的签名清单" };
  }
  if (status.state === "available") {
    return {
      title: "发现 " + (status.latestVersion || "新版本"),
      detail: status.releaseName || "更新包可以下载"
    };
  }
  if (status.state === "downloading") {
    return {
      title: "正在下载 " + Math.round(status.percent) + "%",
      detail: status.total
        ? formatReleaseBytes(status.transferred) + " / " + formatReleaseBytes(status.total)
        : "正在准备更新包"
    };
  }
  if (status.state === "downloaded") {
    return { title: (status.latestVersion || "新版本") + " 已就绪", detail: "重启后完成安装" };
  }
  if (status.state === "installing") {
    return { title: "正在重启安装", detail: "当前修改已安全写入" };
  }
  if (status.state === "up-to-date") {
    return { title: "已经是最新版本", detail: status.lastCheckedAt || "检查完成" };
  }
  if (status.state === "error") {
    return { title: "更新未完成", detail: status.error || "现有版本不受影响，可以稍后重试" };
  }
  return { title: "可以检查更新", detail: "当前版本保持不变，直到你确认安装" };
}

export function formatReleaseBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return Math.round(bytes) + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KiB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MiB";
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GiB";
}

export function canCheckForUpdates(status: ReleaseStatus) {
  return status.supported && status.configured &&
    !["checking", "downloading", "installing"].includes(status.state);
}

export function canDownloadUpdate(status: ReleaseStatus) {
  return status.supported && status.configured && status.state === "available";
}

export function canInstallUpdate(status: ReleaseStatus) {
  return status.supported && status.state === "downloaded";
}
