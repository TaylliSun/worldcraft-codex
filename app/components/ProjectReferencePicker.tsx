"use client";

import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  Check,
  CircleDot,
  ExternalLink,
  Flag,
  GitBranch,
  Globe2,
  Image as ImageIcon,
  Link2,
  Map,
  MapPin,
  MessagesSquare,
  Plus,
  Route,
  Search,
  Variable,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  normalizeProjectObjectRefs,
  projectObjectKinds,
  projectObjectRefKey,
  type ProjectObjectKind,
  type ProjectObjectRef
} from "../project-references";

export type ProjectReferenceOption = {
  reference: ProjectObjectRef;
  title: string;
  detail: string;
  keywords?: string[];
};

export const projectReferenceKindLabels: Record<ProjectObjectKind, string> = {
  world: "世界",
  entity: "条目",
  quest: "任务",
  scene: "剧情",
  "story-variable": "变量",
  "timeline-event": "时间点",
  "timeline-track": "时间轨道",
  map: "地图",
  "map-marker": "地图标记",
  "map-route": "地图路线",
  asset: "资源",
  milestone: "里程碑",
  "manuscript-book": "书稿",
  "manuscript-volume": "文稿卷",
  "manuscript-chapter": "文稿章节",
  "manuscript-scene": "文稿场景",
  "review-issue": "审阅问题",
  relation: "关系"
};

const projectReferenceKindIcons: Record<ProjectObjectKind, LucideIcon> = {
  world: Globe2,
  entity: BookOpen,
  quest: Route,
  scene: MessagesSquare,
  "story-variable": Variable,
  "timeline-event": CalendarClock,
  "timeline-track": GitBranch,
  map: Map,
  "map-marker": MapPin,
  "map-route": Route,
  asset: ImageIcon,
  milestone: Flag,
  "manuscript-book": BookOpen,
  "manuscript-volume": BookOpen,
  "manuscript-chapter": BookOpen,
  "manuscript-scene": MessagesSquare,
  "review-issue": AlertTriangle,
  relation: Link2
};

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase("zh-CN");
}

export function ProjectReferencePicker({
  allowedKinds,
  creatableKinds,
  disabled = false,
  emptyLabel = "尚未关联对象",
  onChange,
  onCreate,
  onOpenReference,
  options,
  placeholder = "搜索名称、类型或说明",
  value
}: {
  allowedKinds?: ProjectObjectKind[];
  creatableKinds?: ProjectObjectKind[];
  disabled?: boolean;
  emptyLabel?: string;
  onChange: (references: ProjectObjectRef[]) => void;
  onCreate?: (kind: ProjectObjectKind) => void;
  onOpenReference?: (reference: ProjectObjectRef) => void;
  options: ProjectReferenceOption[];
  placeholder?: string;
  value: ProjectObjectRef[];
}) {
  const panelId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<ProjectObjectKind | "all">("all");
  const normalizedValue = useMemo(() => normalizeProjectObjectRefs(value), [value]);
  const selectedKeys = useMemo(
    () => new Set(normalizedValue.map(projectObjectRefKey)),
    [normalizedValue]
  );
  const allowedKindSet = useMemo(
    () => new Set(allowedKinds ?? projectObjectKinds),
    [allowedKinds]
  );
  const creatableKindSet = useMemo(
    () => new Set(creatableKinds ?? (onCreate ? allowedKinds ?? projectObjectKinds : [])),
    [allowedKinds, creatableKinds, onCreate]
  );
  const availableOptions = useMemo(
    () => options.filter((option) => allowedKindSet.has(option.reference.kind)),
    [allowedKindSet, options]
  );
  const optionByKey = useMemo(
    () =>
      new globalThis.Map(
        availableOptions.map((option) => [projectObjectRefKey(option.reference), option])
      ),
    [availableOptions]
  );
  const kindCounts = useMemo(
    () =>
      availableOptions.reduce<Partial<Record<ProjectObjectKind, number>>>((counts, option) => {
        counts[option.reference.kind] = (counts[option.reference.kind] ?? 0) + 1;
        return counts;
      }, {}),
    [availableOptions]
  );
  const visibleKinds = projectObjectKinds.filter(
    (kind) =>
      allowedKindSet.has(kind) &&
      (Boolean(kindCounts[kind]) || (Boolean(onCreate) && creatableKindSet.has(kind)))
  );
  const normalizedQuery = normalizeSearch(query);
  const filteredOptions = useMemo(
    () =>
      availableOptions
        .filter((option) => kindFilter === "all" || option.reference.kind === kindFilter)
        .filter((option) => {
          if (!normalizedQuery) return true;
          return normalizeSearch(
            [
              option.title,
              option.detail,
              projectReferenceKindLabels[option.reference.kind],
              ...(option.keywords ?? [])
            ].join(" ")
          ).includes(normalizedQuery);
        })
        .slice(0, 80),
    [availableOptions, kindFilter, normalizedQuery]
  );

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => searchRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function toggle(reference: ProjectObjectRef) {
    const key = projectObjectRefKey(reference);
    onChange(
      selectedKeys.has(key)
        ? normalizedValue.filter((item) => projectObjectRefKey(item) !== key)
        : normalizeProjectObjectRefs([...normalizedValue, reference])
    );
  }

  function remove(reference: ProjectObjectRef) {
    const key = projectObjectRefKey(reference);
    onChange(normalizedValue.filter((item) => projectObjectRefKey(item) !== key));
  }

  return (
    <div className={`project-reference-picker ${disabled ? "is-disabled" : ""}`}>
      <div className="project-reference-picker-heading">
        <span>关联对象</span>
        <strong>{normalizedValue.length}</strong>
      </div>

      <div className="project-reference-selected">
        {normalizedValue.map((reference) => {
          const option = optionByKey.get(projectObjectRefKey(reference));
          const Icon = projectReferenceKindIcons[reference.kind] ?? CircleDot;
          return (
            <div className={`project-reference-chip ${option ? "" : "is-missing"}`} key={projectObjectRefKey(reference)}>
              <button
                aria-label={`打开${option?.title ?? reference.id}`}
                disabled={!option || !onOpenReference}
                title={option ? `打开${option.title}` : "关联目标已失效"}
                type="button"
                onClick={() => onOpenReference?.(reference)}
              >
                <Icon size={14} />
                <span>{option?.title ?? "失效关联"}</span>
                <small>{projectReferenceKindLabels[reference.kind]}</small>
                {option && onOpenReference ? <ExternalLink size={12} /> : null}
              </button>
              <button
                aria-label={`移除${option?.title ?? reference.id}`}
                disabled={disabled}
                title="移除关联"
                type="button"
                onClick={() => remove(reference)}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
        {!normalizedValue.length ? <p>{emptyLabel}</p> : null}
      </div>

      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="project-reference-add"
        disabled={disabled}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <Plus size={16} />
        <span>{open ? "收起对象选择" : "添加关联对象"}</span>
      </button>

      {open ? (
        <section className="project-reference-panel" id={panelId}>
          <div className="project-reference-search-row">
            <label>
              <Search size={15} />
              <input
                ref={searchRef}
                aria-label="搜索关联对象"
                placeholder={placeholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <select
              aria-label="筛选对象类型"
              value={kindFilter}
              onChange={(event) =>
                setKindFilter(event.target.value as ProjectObjectKind | "all")
              }
            >
              <option value="all">全部类型 · {availableOptions.length}</option>
              {visibleKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {projectReferenceKindLabels[kind]} · {kindCounts[kind] ?? 0}
                </option>
              ))}
            </select>
          </div>

          <div className="project-reference-results">
            {filteredOptions.map((option) => {
              const key = projectObjectRefKey(option.reference);
              const selected = selectedKeys.has(key);
              const Icon = projectReferenceKindIcons[option.reference.kind] ?? CircleDot;
              return (
                <button
                  aria-pressed={selected}
                  className={selected ? "is-selected" : ""}
                  key={key}
                  type="button"
                  onClick={() => toggle(option.reference)}
                >
                  <span className={`project-reference-kind kind-${option.reference.kind}`}>
                    <Icon size={15} />
                  </span>
                  <span>
                    <strong>{option.title}</strong>
                    <small>{option.detail || projectReferenceKindLabels[option.reference.kind]}</small>
                  </span>
                  <span className="project-reference-result-kind">
                    {projectReferenceKindLabels[option.reference.kind]}
                  </span>
                  {selected ? <Check className="project-reference-check" size={15} /> : null}
                </button>
              );
            })}
            {!filteredOptions.length ? (
              <div className="project-reference-empty">
                <Search size={18} />
                <span>没有匹配的对象</span>
              </div>
            ) : null}
          </div>

          <footer>
            <span>已选择 {normalizedValue.length} 个对象</span>
            {onCreate && kindFilter !== "all" && creatableKindSet.has(kindFilter) ? (
              <button type="button" onClick={() => onCreate(kindFilter)}>
                <Plus size={14} />
                <span>新建{projectReferenceKindLabels[kindFilter]}</span>
              </button>
            ) : null}
          </footer>
        </section>
      ) : null}
    </div>
  );
}
