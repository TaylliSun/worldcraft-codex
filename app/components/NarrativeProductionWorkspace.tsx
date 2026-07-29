"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Columns3,
  GitBranch,
  GripVertical,
  Link2,
  List,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";
import {
  narrativePriorityLabels,
  narrativePriorityOrder,
  narrativeStatusLabels,
  narrativeStatusOrder,
  sortNarrativeMilestones
} from "../narrative-production";
import type {
  NarrativeCoverage,
  NarrativeMilestone,
  NarrativeMilestoneIssue,
  NarrativeMilestonePriority,
  NarrativeMilestoneStatus
} from "../narrative-production";

export type NarrativeReferenceKind =
  | "quest"
  | "scene"
  | "entity"
  | "timeline"
  | "marker"
  | "issue";

export type NarrativeReferenceItem = {
  id: string;
  title: string;
  detail?: string;
};

type ReferenceGroups = Record<NarrativeReferenceKind, NarrativeReferenceItem[]>;
type ViewMode = "board" | "sequence" | "dependencies";

const referenceMeta: Array<{
  kind: NarrativeReferenceKind;
  field: keyof Pick<
    NarrativeMilestone,
    | "linkedQuestIds"
    | "linkedSceneIds"
    | "linkedEntityIds"
    | "linkedTimelineEventIds"
    | "linkedMapMarkerIds"
    | "linkedReviewIssueIds"
  >;
  label: string;
}> = [
  { kind: "quest", field: "linkedQuestIds", label: "任务" },
  { kind: "scene", field: "linkedSceneIds", label: "剧情场景" },
  { kind: "entity", field: "linkedEntityIds", label: "设定条目" },
  { kind: "timeline", field: "linkedTimelineEventIds", label: "时间点" },
  { kind: "marker", field: "linkedMapMarkerIds", label: "地图标记" },
  { kind: "issue", field: "linkedReviewIssueIds", label: "审阅问题" }
];

function MilestoneCard({
  milestone,
  selected,
  checked,
  issueCount,
  onSelect,
  onToggle,
  onDragStart
}: {
  milestone: NarrativeMilestone;
  selected: boolean;
  checked: boolean;
  issueCount: number;
  onSelect: () => void;
  onToggle: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
}) {
  const linkedCount = referenceMeta.reduce(
    (total, item) => total + milestone[item.field].length,
    0
  );
  return (
    <div
      className={`narrative-card priority-${milestone.priority} ${selected ? "is-selected" : ""}`}
      draggable
      onDragStart={onDragStart}
      onClick={onSelect}
    >
      <div className="narrative-card-topline">
        <input
          aria-label={`选择 ${milestone.title}`}
          checked={checked}
          type="checkbox"
          onChange={onToggle}
          onClick={(event) => event.stopPropagation()}
        />
        <span>{milestone.act || "未分幕"}</span>
        <GripVertical aria-hidden="true" size={15} />
      </div>
      <strong>{milestone.title}</strong>
      <p>{milestone.summary || "尚未填写制作摘要"}</p>
      <div className="narrative-card-meta">
        <span className={`priority-badge priority-${milestone.priority}`}>
          {narrativePriorityLabels[milestone.priority]}
        </span>
        {milestone.targetDate ? (
          <span><CalendarDays size={13} />{milestone.targetDate}</span>
        ) : null}
        <span><Link2 size={13} />{linkedCount}</span>
        {issueCount ? <span className="has-issue"><AlertTriangle size={13} />{issueCount}</span> : null}
      </div>
      {milestone.status === "blocked" && milestone.blockedReason ? (
        <div className="narrative-blocked-reason">{milestone.blockedReason}</div>
      ) : null}
    </div>
  );
}

function LinkPicker({
  label,
  items,
  selectedIds,
  onChange,
  onOpen
}: {
  label: string;
  items: NarrativeReferenceItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const selected = new Set(selectedIds);
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return items
      .filter((item) => selected.has(item.id) || !normalized || `${item.title} ${item.detail ?? ""}`.toLocaleLowerCase().includes(normalized))
      .sort((left, right) => Number(selected.has(right.id)) - Number(selected.has(left.id)) || left.title.localeCompare(right.title, "zh-CN"))
      .slice(0, 60);
  }, [items, query, selectedIds]);

  return (
    <details className="narrative-link-picker">
      <summary>{label}<span>{selectedIds.length}</span></summary>
      <label className="narrative-link-search">
        <Search size={14} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`筛选${label}`} />
      </label>
      <div className="narrative-link-options">
        {visible.length ? visible.map((item) => (
          <div className="narrative-link-option" key={item.id}>
            <label>
              <input
                checked={selected.has(item.id)}
                type="checkbox"
                onChange={() => onChange(selected.has(item.id) ? selectedIds.filter((id) => id !== item.id) : [...selectedIds, item.id])}
              />
              <span><strong>{item.title}</strong>{item.detail ? <small>{item.detail}</small> : null}</span>
            </label>
            <button aria-label={`打开 ${item.title}`} title="打开关联内容" type="button" onClick={() => onOpen(item.id)}>
              <ChevronRight size={15} />
            </button>
          </div>
        )) : <p className="narrative-empty-small">没有匹配内容</p>}
      </div>
    </details>
  );
}

export function NarrativeProductionWorkspace({
  milestones,
  selectedMilestoneId,
  references,
  issues,
  coverage,
  criticalPath,
  onCreate,
  onSelect,
  onUpdate,
  onDelete,
  onMoveStatus,
  onMoveOrder,
  onBatchStatus,
  onOpenReference
}: {
  milestones: NarrativeMilestone[];
  selectedMilestoneId: string;
  references: ReferenceGroups;
  issues: NarrativeMilestoneIssue[];
  coverage: NarrativeCoverage;
  criticalPath: string[];
  onCreate: () => void;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<NarrativeMilestone>) => void;
  onDelete: (id: string) => void;
  onMoveStatus: (id: string, status: NarrativeMilestoneStatus, beforeId?: string) => void;
  onMoveOrder: (id: string, direction: -1 | 1) => void;
  onBatchStatus: (ids: string[], status: NarrativeMilestoneStatus) => void;
  onOpenReference: (kind: NarrativeReferenceKind, id: string) => void;
}) {
  const [mode, setMode] = useState<ViewMode>("board");
  const [query, setQuery] = useState("");
  const [act, setAct] = useState("all");
  const [priority, setPriority] = useState<NarrativeMilestonePriority | "all">("all");
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [batchStatus, setBatchStatus] = useState<NarrativeMilestoneStatus>("drafting");
  const selectedMilestone = milestones.find((item) => item.id === selectedMilestoneId) ?? null;
  const ordered = useMemo(() => sortNarrativeMilestones(milestones), [milestones]);
  const acts = useMemo(() => Array.from(new Set(ordered.map((item) => item.act || "未分幕"))), [ordered]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return ordered.filter((item) =>
      (act === "all" || (item.act || "未分幕") === act) &&
      (priority === "all" || item.priority === priority) &&
      (!normalized || `${item.title} ${item.summary} ${item.developerNotes} ${item.blockedReason}`.toLocaleLowerCase().includes(normalized))
    );
  }, [act, ordered, priority, query]);
  const issueCounts = useMemo(() => issues.reduce<Record<string, number>>((counts, issue) => {
    counts[issue.milestoneId] = (counts[issue.milestoneId] ?? 0) + 1;
    return counts;
  }, {}), [issues]);
  const criticalSet = useMemo(() => new Set(criticalPath), [criticalPath]);

  useEffect(() => {
    setCheckedIds((current) => current.filter((id) => milestones.some((item) => item.id === id)));
  }, [milestones]);

  function toggleChecked(id: string) {
    setCheckedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function dropOnStatus(event: DragEvent<HTMLDivElement>, status: NarrativeMilestoneStatus) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/worldcraft-milestone");
    if (id) onMoveStatus(id, status);
  }

  return (
    <section className="narrative-workspace">
      <header className="narrative-toolbar">
        <div>
          <h2>叙事制作</h2>
          <p>按里程碑组织章节、任务、场景与制作阻塞</p>
        </div>
        <div className="narrative-view-switch" role="group" aria-label="叙事制作视图">
          <button className={mode === "board" ? "is-active" : ""} title="状态看板" type="button" onClick={() => setMode("board")}><Columns3 size={16} /><span>看板</span></button>
          <button className={mode === "sequence" ? "is-active" : ""} title="顺序列表" type="button" onClick={() => setMode("sequence")}><List size={16} /><span>顺序</span></button>
          <button className={mode === "dependencies" ? "is-active" : ""} title="依赖视图" type="button" onClick={() => setMode("dependencies")}><GitBranch size={16} /><span>依赖</span></button>
        </div>
        <button className="narrative-create-button" type="button" onClick={onCreate}><Plus size={17} /><span>新建里程碑</span></button>
      </header>

      <div className="narrative-summary">
        <div><span>总进度</span><strong>{coverage.completionPercent}%</strong><progress max={100} value={coverage.completionPercent} /></div>
        <div><span>已完成</span><strong>{coverage.completed}/{coverage.total}</strong></div>
        <div className={coverage.blocked ? "has-warning" : ""}><span>阻塞</span><strong>{coverage.blocked}</strong></div>
        <div className={coverage.unlinkedQuestIds.length + coverage.unlinkedSceneIds.length ? "has-warning" : ""}><span>未覆盖内容</span><strong>{coverage.unlinkedQuestIds.length + coverage.unlinkedSceneIds.length}</strong></div>
        <div className={issues.length ? "has-warning" : ""}><span>结构问题</span><strong>{issues.length}</strong></div>
      </div>

      <div className="narrative-filterbar">
        <label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、摘要与制作备注" /></label>
        <select aria-label="筛选幕章" value={act} onChange={(event) => setAct(event.target.value)}><option value="all">全部幕章</option>{acts.map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="筛选优先级" value={priority} onChange={(event) => setPriority(event.target.value as NarrativeMilestonePriority | "all")}><option value="all">全部优先级</option>{narrativePriorityOrder.map((item) => <option key={item} value={item}>{narrativePriorityLabels[item]}</option>)}</select>
        {checkedIds.length ? <div className="narrative-batch"><strong>{checkedIds.length} 项</strong><select aria-label="批量状态" value={batchStatus} onChange={(event) => setBatchStatus(event.target.value as NarrativeMilestoneStatus)}>{narrativeStatusOrder.map((item) => <option key={item} value={item}>{narrativeStatusLabels[item]}</option>)}</select><button type="button" onClick={() => { onBatchStatus(checkedIds, batchStatus); setCheckedIds([]); }}>应用</button><button aria-label="取消批量选择" title="取消选择" type="button" onClick={() => setCheckedIds([])}><X size={15} /></button></div> : null}
      </div>

      <div className="narrative-main-layout">
        <div className="narrative-view">
          {mode === "board" ? (
            <div className="narrative-board">
              {narrativeStatusOrder.map((status) => {
                const items = filtered.filter((item) => item.status === status);
                return <div className={`narrative-column status-${status}`} key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropOnStatus(event, status)}>
                  <div className="narrative-column-heading"><strong>{narrativeStatusLabels[status]}</strong><span>{items.length}</span></div>
                  <div className="narrative-column-items">{items.map((item) => <MilestoneCard checked={checkedIds.includes(item.id)} issueCount={issueCounts[item.id] ?? 0} key={item.id} milestone={item} selected={item.id === selectedMilestoneId} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/worldcraft-milestone", item.id); }} onSelect={() => onSelect(item.id)} onToggle={() => toggleChecked(item.id)} />)}{!items.length ? <div className="narrative-drop-zone">拖到这里</div> : null}</div>
                </div>;
              })}
            </div>
          ) : null}

          {mode === "sequence" ? (
            <div className="narrative-sequence-list">
              {filtered.map((item, index) => <div className={`narrative-sequence-row ${item.id === selectedMilestoneId ? "is-selected" : ""}`} key={item.id} onClick={() => onSelect(item.id)}>
                <input aria-label={`选择 ${item.title}`} checked={checkedIds.includes(item.id)} type="checkbox" onChange={() => toggleChecked(item.id)} onClick={(event) => event.stopPropagation()} />
                <span className="narrative-order">{item.order + 1}</span><span className="narrative-act">{item.act}</span><div><strong>{item.title}</strong><small>{item.summary || "尚未填写制作摘要"}</small></div>
                <span className={`priority-badge priority-${item.priority}`}>{narrativePriorityLabels[item.priority]}</span>
                <select aria-label={`${item.title} 状态`} value={item.status} onChange={(event) => onMoveStatus(item.id, event.target.value as NarrativeMilestoneStatus)} onClick={(event) => event.stopPropagation()}>{narrativeStatusOrder.map((status) => <option key={status} value={status}>{narrativeStatusLabels[status]}</option>)}</select>
                <div className="narrative-order-buttons"><button aria-label="上移" disabled={index === 0} title="上移" type="button" onClick={(event) => { event.stopPropagation(); onMoveOrder(item.id, -1); }}><ArrowUp size={14} /></button><button aria-label="下移" disabled={index === filtered.length - 1} title="下移" type="button" onClick={(event) => { event.stopPropagation(); onMoveOrder(item.id, 1); }}><ArrowDown size={14} /></button></div>
              </div>)}
            </div>
          ) : null}

          {mode === "dependencies" ? (
            <div className="narrative-dependency-list">
              <div className="narrative-critical-path"><GitBranch size={17} /><div><strong>当前关键路径</strong><span>{criticalPath.length ? criticalPath.map((id) => milestones.find((item) => item.id === id)?.title ?? id).join(" → ") : "存在循环依赖，或尚未建立依赖链"}</span></div></div>
              {filtered.map((item) => <button className={`narrative-dependency-row ${criticalSet.has(item.id) ? "is-critical" : ""}`} key={item.id} type="button" onClick={() => onSelect(item.id)}><span className={`narrative-status-dot status-${item.status}`} /><div><strong>{item.title}</strong><small>{item.act} · {narrativeStatusLabels[item.status]}</small></div><div className="narrative-dependency-chain"><span>依赖</span>{item.dependencyIds.length ? item.dependencyIds.map((id) => <em key={id}>{milestones.find((candidate) => candidate.id === id)?.title ?? `失效引用 ${id}`}</em>) : <em>无</em>}</div>{criticalSet.has(item.id) ? <span className="critical-label">关键路径</span> : null}<ChevronRight size={16} /></button>)}
            </div>
          ) : null}

          {!filtered.length ? <div className="narrative-empty"><CheckCircle2 size={28} /><strong>当前筛选下没有里程碑</strong><span>调整筛选条件或新建一项</span></div> : null}
        </div>

        <aside
          className="narrative-editor"
          data-reference-path={selectedMilestone ? "dependencyIds" : undefined}
          data-reference-source-id={selectedMilestone?.id}
          data-reference-source-kind={selectedMilestone ? "milestone" : undefined}
        >
          {selectedMilestone ? <>
            <div className="narrative-editor-heading"><div><span>里程碑 #{selectedMilestone.order + 1}</span><strong>{selectedMilestone.title}</strong></div><button aria-label="删除里程碑" title="删除里程碑" type="button" onClick={() => onDelete(selectedMilestone.id)}><Trash2 size={16} /></button></div>
            <label>标题<input value={selectedMilestone.title} onChange={(event) => onUpdate(selectedMilestone.id, { title: event.target.value })} /></label>
            <label>制作摘要<textarea rows={3} value={selectedMilestone.summary} onChange={(event) => onUpdate(selectedMilestone.id, { summary: event.target.value })} /></label>
            <div className="narrative-editor-grid"><label>幕 / 章<input value={selectedMilestone.act} onChange={(event) => onUpdate(selectedMilestone.id, { act: event.target.value })} /></label><label>目标日期<input type="date" value={selectedMilestone.targetDate} onChange={(event) => onUpdate(selectedMilestone.id, { targetDate: event.target.value })} /></label><label>状态<select value={selectedMilestone.status} onChange={(event) => onMoveStatus(selectedMilestone.id, event.target.value as NarrativeMilestoneStatus)}>{narrativeStatusOrder.map((status) => <option key={status} value={status}>{narrativeStatusLabels[status]}</option>)}</select></label><label>优先级<select value={selectedMilestone.priority} onChange={(event) => onUpdate(selectedMilestone.id, { priority: event.target.value as NarrativeMilestonePriority })}>{narrativePriorityOrder.map((item) => <option key={item} value={item}>{narrativePriorityLabels[item]}</option>)}</select></label></div>
            {selectedMilestone.status === "blocked" ? <label className="narrative-blocker-field">阻塞原因<textarea rows={2} value={selectedMilestone.blockedReason} onChange={(event) => onUpdate(selectedMilestone.id, { blockedReason: event.target.value })} /></label> : null}
            <label>制作备注<textarea rows={4} value={selectedMilestone.developerNotes} onChange={(event) => onUpdate(selectedMilestone.id, { developerNotes: event.target.value })} /></label>
            <details className="narrative-link-picker" data-reference-path="dependencyIds" data-reference-source-id={selectedMilestone.id} data-reference-source-kind="milestone" open><summary>前置里程碑<span>{selectedMilestone.dependencyIds.length}</span></summary><div className="narrative-link-options">{ordered.filter((item) => item.id !== selectedMilestone.id).map((item) => <label className="narrative-dependency-option" key={item.id}><input checked={selectedMilestone.dependencyIds.includes(item.id)} type="checkbox" onChange={() => onUpdate(selectedMilestone.id, { dependencyIds: selectedMilestone.dependencyIds.includes(item.id) ? selectedMilestone.dependencyIds.filter((id) => id !== item.id) : [...selectedMilestone.dependencyIds, item.id] })} /><span><strong>{item.title}</strong><small>{item.act} · {narrativeStatusLabels[item.status]}</small></span></label>)}</div></details>
            <div className="narrative-reference-groups">
              {referenceMeta.map((meta) => (
                <div
                  key={meta.kind}
                  data-reference-path={meta.field}
                  data-reference-source-id={selectedMilestone.id}
                  data-reference-source-kind="milestone"
                >
                  <LinkPicker
                    items={references[meta.kind]}
                    label={meta.label}
                    selectedIds={selectedMilestone[meta.field]}
                    onChange={(ids) => onUpdate(selectedMilestone.id, { [meta.field]: ids })}
                    onOpen={(id) => onOpenReference(meta.kind, id)}
                  />
                </div>
              ))}
            </div>
          </> : <div className="narrative-empty"><GitBranch size={28} /><strong>选择一个里程碑</strong><span>在此编辑制作状态与内容关联</span></div>}
        </aside>
      </div>
    </section>
  );
}
