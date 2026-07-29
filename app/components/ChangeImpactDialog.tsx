"use client";

import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  CircleDot,
  FileText,
  GitBranch,
  LocateFixed,
  Route,
  Search,
  X
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { ChangeImpactDomain, ChangeImpactItem, ChangeImpactReport } from "../change-impact";
import type { ProjectReference } from "../project-references";
import { projectReferenceKindLabels } from "./ProjectReferencePicker";
import { useDialogFocus } from "./useDialogFocus";

const domainMeta: Record<ChangeImpactDomain, { label: string; icon: typeof BookOpen }> = {
  manuscript: { label: "正文", icon: FileText },
  story: { label: "剧情", icon: BookOpen },
  quest: { label: "任务", icon: Route },
  world: { label: "世界结构", icon: GitBranch }
};

const levelLabels: Record<ChangeImpactItem["level"], string> = {
  critical: "重点核对",
  high: "建议核对",
  normal: "可能波及"
};

export function ChangeImpactDialog({
  onClose,
  onOpen,
  report
}: {
  onClose: () => void;
  onOpen: (reference: ProjectReference) => void;
  report: ChangeImpactReport;
}) {
  const [domain, setDomain] = useState<ChangeImpactDomain | "all">("all");
  const [scope, setScope] = useState<"all" | "direct" | "downstream">("all");
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus({ containerRef: dialogRef, onClose, open: true });

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
    return report.items.filter((item) => {
      if (domain !== "all" && item.domain !== domain) return false;
      if (scope === "direct" && item.depth !== 1) return false;
      if (scope === "downstream" && item.depth <= 1) return false;
      if (!normalizedQuery) return true;
      return `${item.label}\n${item.reason}\n${item.pathLabels.join(" ")}\n${projectReferenceKindLabels[item.kind]}`
        .normalize("NFKC")
        .toLocaleLowerCase("zh-CN")
        .includes(normalizedQuery);
    });
  }, [domain, query, report.items, scope]);

  function openItem(item: ChangeImpactItem) {
    const reference = item.references[0];
    if (reference) onOpen(reference);
  }

  return (
    <div
      className="impact-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-label={`变更影响 ${report.targetLabel}`}
        aria-modal="true"
        className="impact-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="impact-dialog-header">
          <div>
            <span><GitBranch size={15} /> 变更影响</span>
            <h2>{report.targetLabel}</h2>
            <p>{report.direct} 个直接引用 · {report.downstream} 个下游影响 · 最深 {report.maximumDepth} 层</p>
          </div>
          <button aria-label="关闭变更影响" title="关闭" type="button" onClick={onClose}><X size={19} /></button>
        </header>

        <div className="impact-dialog-summary" aria-label="影响摘要">
          <div className={report.levels.critical ? "is-critical" : ""}>
            <strong>{report.levels.critical}</strong><span>重点核对</span>
          </div>
          <div><strong>{report.levels.high}</strong><span>建议核对</span></div>
          <div><strong>{report.direct}</strong><span>直接引用</span></div>
          <div><strong>{report.downstream}</strong><span>下游影响</span></div>
        </div>

        <div className="impact-dialog-controls">
          <label className="impact-search">
            <Search size={15} />
            <input
              aria-label="搜索受影响内容"
              placeholder="搜索标题、路径或字段"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div aria-label="影响范围" className="impact-scope-switch" role="group">
            {([
              ["all", "全部"],
              ["direct", "直接"],
              ["downstream", "下游"]
            ] as const).map(([value, label]) => (
              <button className={scope === value ? "is-active" : ""} key={value} type="button" onClick={() => setScope(value)}>{label}</button>
            ))}
          </div>
        </div>

        <nav aria-label="影响领域" className="impact-domain-tabs">
          <button className={domain === "all" ? "is-active" : ""} type="button" onClick={() => setDomain("all")}>
            <CircleDot size={14} /><span>全部</span><strong>{report.total}</strong>
          </button>
          {(Object.keys(domainMeta) as ChangeImpactDomain[]).map((value) => {
            const meta = domainMeta[value];
            const Icon = meta.icon;
            return (
              <button className={domain === value ? "is-active" : ""} key={value} type="button" onClick={() => setDomain(value)}>
                <Icon size={14} /><span>{meta.label}</span><strong>{report.counts[value]}</strong>
              </button>
            );
          })}
        </nav>

        <div className="impact-dialog-list" aria-live="polite">
          {filteredItems.map((item) => (
            <article className={`impact-item level-${item.level}`} key={item.key}>
              <span className="impact-item-level"><AlertTriangle size={15} />{levelLabels[item.level]}</span>
              <div className="impact-item-copy">
                <div>
                  <strong>{item.label}</strong>
                  <span>{projectReferenceKindLabels[item.kind]}</span>
                  <span>{item.depth === 1 ? "直接" : `第 ${item.depth} 层`}</span>
                </div>
                <p>{item.reason}</p>
                <div className="impact-item-path" title={item.pathLabels.join(" → ")}>
                  {item.pathLabels.map((label, index) => (
                    <span key={`${label}:${index}`}>
                      {index ? <ChevronRight size={11} /> : null}{label}
                    </span>
                  ))}
                </div>
              </div>
              <button aria-label={`定位 ${item.label}`} className="impact-locate" title="定位引用位置" type="button" onClick={() => openItem(item)}>
                <LocateFixed size={16} />
                {item.references.length > 1 ? <span>{item.references.length}</span> : null}
              </button>
            </article>
          ))}
          {!filteredItems.length ? (
            <div className="impact-dialog-empty"><CircleDot size={20} /><strong>当前筛选没有影响项</strong></div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
