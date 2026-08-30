"use client";

import {
  BookOpen,
  Bug,
  CalendarDays,
  Clock3,
  FileText,
  Flag,
  FlaskConical,
  FolderTree,
  Library,
  LayoutTemplate,
  MapPin,
  MessagesSquare,
  Network,
  Route,
  ScanSearch,
  Search,
  Variable,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useDialogFocus } from "./useDialogFocus";

export type GlobalSearchKind =
  | "category"
  | "entity"
  | "template"
  | "quest"
  | "scene"
  | "variable"
  | "test"
  | "issue"
  | "milestone"
  | "manuscript"
  | "relation"
  | "map"
  | "route"
  | "timeline"
  | "consistency"
  | "asset";

export type GlobalSearchResult = {
  key: string;
  kind: GlobalSearchKind;
  itemId: string;
  relatedEntityId?: string;
  planningTargetType?: "map" | "marker" | "route" | "track" | "timeline";
  manuscriptTargetType?: "book" | "volume" | "chapter" | "scene";
  title: string;
  description: string;
  context: string;
  searchText: string;
  updatedAt: string;
  icon?: LucideIcon;
};

const kindMeta: Record<
  GlobalSearchKind,
  { label: string; icon: LucideIcon }
> = {
  category: { label: "分类", icon: FolderTree },
  entity: { label: "条目", icon: FileText },
  template: { label: "模板", icon: LayoutTemplate },
  quest: { label: "任务", icon: Route },
  scene: { label: "剧情", icon: MessagesSquare },
  variable: { label: "变量", icon: Variable },
  test: { label: "测试", icon: FlaskConical },
  issue: { label: "问题", icon: Bug },
  milestone: { label: "里程碑", icon: Flag },
  manuscript: { label: "书稿", icon: BookOpen },
  relation: { label: "关系", icon: Network },
  map: { label: "地图", icon: MapPin },
  route: { label: "路线", icon: Route },
  timeline: { label: "时间线", icon: CalendarDays },
  consistency: { label: "一致性", icon: ScanSearch },
  asset: { label: "资源", icon: Library }
};

function normalizeSearchText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().trim();
}

function scoreResult(result: GlobalSearchResult, query: string) {
  if (!query) {
    return 0;
  }

  const title = normalizeSearchText(result.title);
  const description = normalizeSearchText(result.description);
  const context = normalizeSearchText(result.context);
  let score = 0;

  if (title === query) score += 500;
  if (title.startsWith(query)) score += 260;
  if (title.includes(query)) score += 180;
  if (description.includes(query)) score += 80;
  if (context.includes(query)) score += 45;
  return score;
}

export function GlobalSearchDialog({
  open,
  results,
  worldName,
  onClose,
  onIndexedSearch,
  onSelect
}: {
  open: boolean;
  results: GlobalSearchResult[];
  worldName: string;
  onClose: () => void;
  onIndexedSearch?: (query: string) => Promise<string[]>;
  onSelect: (result: GlobalSearchResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const activeResultRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const [activeKind, setActiveKind] = useState<GlobalSearchKind | "all">("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [indexedKeys, setIndexedKeys] = useState<string[] | null>(null);
  useDialogFocus({ containerRef: dialogRef, initialFocusRef: inputRef, onClose, open });

  const kindCounts = useMemo(
    () =>
      results.reduce<Record<GlobalSearchKind, number>>(
        (counts, result) => {
          counts[result.kind] += 1;
          return counts;
        },
        {
          category: 0,
          entity: 0,
          template: 0,
          quest: 0,
          scene: 0,
          variable: 0,
          test: 0,
          issue: 0,
          milestone: 0,
          manuscript: 0,
          relation: 0,
          map: 0,
          route: 0,
          timeline: 0,
          consistency: 0,
          asset: 0
        }
      ),
    [results]
  );

  const visibleResults = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const indexedOrder = new Map((indexedKeys ?? []).map((key, index) => [key, index]));

    return results
      .filter((result) => activeKind === "all" || result.kind === activeKind)
      .filter((result) => {
        if (!tokens.length) {
          return true;
        }
        const haystack = normalizeSearchText(result.searchText);
        const localMatch = tokens.every((token) => haystack.includes(token));
        return localMatch || indexedOrder.has(result.key);
      })
      .map((result) => ({ result, score: scoreResult(result, normalizedQuery) }))
      .sort(
        (left, right) =>
          (indexedOrder.get(left.result.key) ?? Number.MAX_SAFE_INTEGER) -
            (indexedOrder.get(right.result.key) ?? Number.MAX_SAFE_INTEGER) ||
          right.score - left.score ||
          right.result.updatedAt.localeCompare(left.result.updatedAt)
      )
      .slice(0, 40)
      .map((item) => item.result);
  }, [activeKind, indexedKeys, query, results]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuery("");
    setActiveKind("all");
    setActiveIndex(0);
    setIndexedKeys(null);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeKind, query]);

  useEffect(() => {
    if (!open) return;
    activeResultRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!open || !trimmed || !onIndexedSearch) {
      setIndexedKeys(null);
      return;
    }
    let cancelled = false;
    setIndexedKeys(null);
    const timeout = window.setTimeout(async () => {
      try {
        const keys = await onIndexedSearch(trimmed);
        if (!cancelled) setIndexedKeys(keys);
      } catch {
        if (!cancelled) setIndexedKeys([]);
      }
    }, 140);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [onIndexedSearch, open, query]);

  useEffect(() => {
    if (!open) {
      return;
    }
    document.body.classList.add("search-dialog-open");
    return () => document.body.classList.remove("search-dialog-open");
  }, [open]);

  if (!open) {
    return null;
  }

  function selectResult(result: GlobalSearchResult) {
    onSelect(result);
    onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, visibleResults.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && visibleResults[activeIndex]) {
      event.preventDefault();
      selectResult(visibleResults[activeIndex]);
    }
  }

  return (
    <div
      className="global-search-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        aria-label={`搜索 ${worldName}`}
        aria-modal="true"
        className="global-search-dialog"
        role="dialog"
        tabIndex={-1}
      >
        <div className="global-search-input-row">
          <Search size={20} />
          <input
            ref={inputRef}
            aria-activedescendant={visibleResults[activeIndex] ? `global-search-result-${activeIndex}` : undefined}
            aria-label="全局搜索"
            aria-controls="global-search-results"
            aria-expanded="true"
            aria-haspopup="listbox"
            placeholder={`搜索 ${worldName} 中的全部内容`}
            role="combobox"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button aria-label="关闭搜索" className="icon-button" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="global-search-filters" aria-label="搜索类型">
          <button
            className={activeKind === "all" ? "is-active" : ""}
            type="button"
            onClick={() => setActiveKind("all")}
          >
            <Search size={15} />
            <span>全部</span>
            <strong>{results.length}</strong>
          </button>
          {(Object.keys(kindMeta) as GlobalSearchKind[]).map((kind) => {
            const Icon = kindMeta[kind].icon;
            return (
              <button
                className={activeKind === kind ? "is-active" : ""}
                key={kind}
                type="button"
                onClick={() => setActiveKind(kind)}
              >
                <Icon size={15} />
                <span>{kindMeta[kind].label}</span>
                <strong>{kindCounts[kind]}</strong>
              </button>
            );
          })}
        </div>

        <div className="global-search-result-heading">
          <span>{query.trim() ? "搜索结果" : "最近更新"}</span>
          <strong>{visibleResults.length}</strong>
        </div>

        <div className="global-search-results" id="global-search-results" role="listbox">
          {visibleResults.length ? (
            visibleResults.map((result, index) => {
              const Icon = result.icon ?? kindMeta[result.kind].icon;
              return (
                <button
                  ref={index === activeIndex ? activeResultRef : undefined}
                  aria-selected={index === activeIndex}
                  className={`global-search-result ${index === activeIndex ? "is-active" : ""}`}
                  id={`global-search-result-${index}`}
                  key={result.key}
                  role="option"
                  type="button"
                  onClick={() => selectResult(result)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className={`global-search-result-icon kind-${result.kind}`}>
                    <Icon size={18} />
                  </span>
                  <span className="global-search-result-copy">
                    <span className="global-search-result-title">
                      <strong>{result.title}</strong>
                      <small>{kindMeta[result.kind].label}</small>
                    </span>
                    <span>{result.description || "暂无摘要"}</span>
                  </span>
                  <small className="global-search-result-context">{result.context}</small>
                </button>
              );
            })
          ) : (
            <div className="global-search-empty">
              <Search size={28} />
              <strong>没有找到匹配内容</strong>
            </div>
          )}
        </div>

        <div className="global-search-footer">
          <span>
            <Clock3 size={14} />
            {worldName}
          </span>
          <span>{results.length} 项可搜索内容</span>
          {query.trim() && indexedKeys ? <span>SQLite FTS5 · {indexedKeys.length} 项</span> : null}
        </div>
      </section>
    </div>
  );
}
