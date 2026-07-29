"use client";

import { Download, ExternalLink, RotateCcw, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { canDownloadUpdate, canInstallUpdate } from "../release-management";
import { useReleaseStatus } from "./useReleaseStatus";

export function ReleaseLifecycle() {
  const { status, busy, run, acceptLegal, openLink, quit } = useReleaseStatus();
  const [legalConfirmed, setLegalConfirmed] = useState(false);
  const [dismissedVersion, setDismissedVersion] = useState("");

  useEffect(() => {
    if (status.latestVersion && status.latestVersion !== dismissedVersion) {
      setDismissedVersion("");
    }
  }, [dismissedVersion, status.latestVersion]);

  return (
    <>
      {status.legalAcceptanceRequired ? (
        <div className="release-legal-backdrop">
          <section
            aria-label="Worldcraft Codex 使用条款"
            aria-modal="true"
            className="release-legal-dialog"
            role="dialog"
          >
            <header>
              <ShieldCheck size={24} />
              <div>
                <h2>使用条款与隐私</h2>
                <p>{status.legalName || status.publisherName}</p>
              </div>
            </header>
            <div className="release-legal-points">
              <div><strong>本地项目</strong><span>正文、资源、备份和诊断保留在当前设备</span></div>
              <div><strong>无遥测上传</strong><span>软件不会自动上传使用数据或创作内容</span></div>
              <div><strong>第三方 AI</strong><span>仅在作者配置并主动调用模型时发送请求</span></div>
            </div>
            <div className="release-legal-links">
              <button type="button" onClick={() => void openLink("terms")}>
                <span>使用条款</span><ExternalLink size={14} />
              </button>
              <button type="button" onClick={() => void openLink("privacy")}>
                <span>隐私政策</span><ExternalLink size={14} />
              </button>
            </div>
            <label className="release-legal-confirm">
              <input
                checked={legalConfirmed}
                type="checkbox"
                onChange={(event) => setLegalConfirmed(event.target.checked)}
              />
              <span>我已阅读并接受当前版本条款</span>
            </label>
            <footer>
              <button type="button" onClick={() => void quit()}>退出</button>
              <button
                className="is-primary"
                disabled={!legalConfirmed || busy === "legal"}
                type="button"
                onClick={() => void acceptLegal()}
              >
                接受并继续
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {status.latestVersion &&
      status.latestVersion !== dismissedVersion &&
      (canDownloadUpdate(status) || canInstallUpdate(status)) ? (
        <aside className="release-update-toast" aria-live="polite">
          <div>
            {canInstallUpdate(status) ? <RotateCcw size={18} /> : <Download size={18} />}
            <span>
              <strong>{status.latestVersion}</strong>
              <small>{canInstallUpdate(status) ? "更新已就绪" : "有新版本可用"}</small>
            </span>
          </div>
          <button
            aria-label="稍后处理更新"
            className="release-toast-close"
            title="稍后"
            type="button"
            onClick={() => setDismissedVersion(status.latestVersion)}
          >
            <X size={16} />
          </button>
          <button
            className="release-toast-action"
            type="button"
            onClick={() =>
              void run(canInstallUpdate(status) ? "installUpdate" : "downloadUpdate")
            }
          >
            {canInstallUpdate(status) ? "重启安装" : "下载"}
          </button>
        </aside>
      ) : null}
    </>
  );
}
