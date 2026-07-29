"use client";

import {
  BadgeCheck,
  CircleAlert,
  Download,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import {
  canCheckForUpdates,
  canDownloadUpdate,
  canInstallUpdate,
  formatReleaseBytes,
  releaseStatusText
} from "../release-management";
import { useReleaseStatus } from "./useReleaseStatus";

export function ReleasePanel() {
  const { status, busy, run, setPreferences, openLink } = useReleaseStatus();
  const copy = releaseStatusText(status);
  const StatusIcon = status.state === "error"
    ? CircleAlert
    : status.state === "downloaded" || status.state === "up-to-date"
      ? BadgeCheck
      : ShieldCheck;
  const linkEntries = [
    ["privacy", "隐私"] as const,
    ["terms", "条款"] as const,
    ["support", "支持"] as const
  ].filter(([kind]) => Boolean(status.links[kind]));

  return (
    <section className="panel release-panel" aria-label="应用与更新">
      <div className="panel-heading">
        <div>
          <h2>应用与更新</h2>
          <p>Worldcraft Codex {status.currentVersion || "桌面版"}</p>
        </div>
        <ShieldCheck size={21} />
      </div>

      <div className={"release-state release-state-" + status.state}>
        <StatusIcon className={status.state === "checking" ? "is-spinning" : ""} size={20} />
        <div>
          <strong>{copy.title}</strong>
          <span>{copy.detail}</span>
        </div>
      </div>

      <div className="release-facts">
        <div><span>当前版本</span><strong>{status.currentVersion || "未连接"}</strong></div>
        <div>
          <span>发行通道</span>
          <strong>{status.preferences.channel === "stable" ? "稳定版" : "候选版"}</strong>
        </div>
        <div>
          <span>发行状态</span>
          <strong>
            {status.releaseMode === "public"
              ? status.publicReady ? "公开发行" : "配置不完整"
              : "候选构建" + (status.externalBlockerCount
                ? " · 缺 " + status.externalBlockerCount + " 项"
                : "")}
          </strong>
        </div>
      </div>

      <div className="release-preferences">
        <div className="release-channel" aria-label="更新通道">
          <button
            className={status.preferences.channel === "stable" ? "is-active" : ""}
            disabled={busy === "preferences"}
            type="button"
            onClick={() => void setPreferences({ channel: "stable" })}
          >
            稳定版
          </button>
          <button
            className={status.preferences.channel === "candidate" ? "is-active" : ""}
            disabled={busy === "preferences"}
            type="button"
            onClick={() => void setPreferences({ channel: "candidate" })}
          >
            候选版
          </button>
        </div>
        <label className="release-toggle">
          <input
            checked={status.preferences.autoCheck}
            type="checkbox"
            onChange={(event) => void setPreferences({ autoCheck: event.target.checked })}
          />
          <span>启动时检查</span>
        </label>
        <label className="release-toggle">
          <input
            checked={status.preferences.autoDownload}
            type="checkbox"
            onChange={(event) => void setPreferences({ autoDownload: event.target.checked })}
          />
          <span>自动下载</span>
        </label>
      </div>

      {status.state === "downloading" ? (
        <div className="release-progress">
          <progress max={100} value={status.percent} />
          <span>
            {status.total
              ? formatReleaseBytes(status.transferred) + " / " + formatReleaseBytes(status.total)
              : Math.round(status.percent) + "%"}
          </span>
        </div>
      ) : null}

      <div className="release-actions">
        <button
          disabled={!canCheckForUpdates(status) || busy === "checkForUpdates"}
          type="button"
          onClick={() => void run("checkForUpdates")}
        >
          <RefreshCw className={busy === "checkForUpdates" ? "is-spinning" : ""} size={16} />
          <span>{status.state === "error" ? "重试检查" : "检查更新"}</span>
        </button>
        {canDownloadUpdate(status) ? (
          <button className="is-primary" type="button" onClick={() => void run("downloadUpdate")}>
            <Download size={16} />
            <span>下载 {status.latestVersion}</span>
          </button>
        ) : null}
        {canInstallUpdate(status) ? (
          <button className="is-primary" type="button" onClick={() => void run("installUpdate")}>
            <RotateCcw size={16} />
            <span>重启并安装</span>
          </button>
        ) : null}
      </div>

      {linkEntries.length ? (
        <div className="release-links">
          {linkEntries.map(([kind, label]) => (
            <button key={kind} type="button" onClick={() => void openLink(kind)}>
              <span>{label}</span>
              <ExternalLink size={13} />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
