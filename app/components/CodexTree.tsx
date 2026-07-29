"use client";

import {
  CalendarDays,
  ChevronRight,
  FilePlus2,
  FileText,
  Flag,
  Folder,
  FolderOpen,
  FolderPlus,
  Gem,
  GripVertical,
  MapPin,
  MessagesSquare,
  Pencil,
  Route,
  Trash2,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DragEvent, MouseEvent } from "react";
import { countCodexEntitiesByCategory } from "../codex-tree";
import type {
  CodexCategory,
  CodexCategoryIcon,
  CodexEntityType
} from "../codex-tree";

type TreeEntity = {
  id: string;
  type: CodexEntityType;
  title: string;
  summary: string;
  tags: string[];
  templateData: Record<string, string>;
  categoryId?: string;
  order?: number;
};

type DraggedNode = { kind: "category" | "entity"; id: string };
type DropPosition = "before" | "inside" | "after";

const dragMime = "application/x-worldcraft-codex-node";
const entityBatchSize = 120;

const categoryIconMeta: Record<CodexCategoryIcon, LucideIcon> = {
  folder: Folder,
  characters: UsersRound,
  locations: MapPin,
  factions: Flag,
  events: CalendarDays,
  items: Gem,
  notes: FileText
};

const entityIconMeta: Record<CodexEntityType, LucideIcon> = {
  character: UsersRound,
  location: MapPin,
  faction: Flag,
  event: CalendarDays,
  item: Gem,
  note: FileText
};

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
}

function setDragData(event: DragEvent, node: DraggedNode) {
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData(dragMime, JSON.stringify(node));
  event.dataTransfer.setData("text/plain", `${node.kind}:${node.id}`);
}

function getDragData(event: DragEvent): DraggedNode | null {
  try {
    const value = JSON.parse(event.dataTransfer.getData(dragMime));
    return value?.id && (value.kind === "category" || value.kind === "entity")
      ? value
      : null;
  } catch {
    return null;
  }
}

function rowDropPosition(event: DragEvent<HTMLElement>, allowInside: boolean): DropPosition {
  const bounds = event.currentTarget.getBoundingClientRect();
  const ratio = (event.clientY - bounds.top) / Math.max(1, bounds.height);
  if (ratio < (allowInside ? 0.25 : 0.5)) return "before";
  if (ratio > (allowInside ? 0.75 : 0.5)) return "after";
  return "inside";
}

function stopAction(event: MouseEvent) {
  event.stopPropagation();
}

export function CodexTree({
  activeEntityId,
  activeType,
  categories,
  collapsedCategoryIds,
  entities,
  query,
  revealEntityId,
  revealToken,
  questCount,
  sceneCount,
  onCreateCategory,
  onCreateEntity,
  onDeleteCategory,
  onMoveCategory,
  onMoveEntity,
  onOpenQuests,
  onOpenStory,
  onRenameCategory,
  onSelectEntity,
  onToggleCategory
}: {
  activeEntityId: string;
  activeType: CodexEntityType | "all";
  categories: CodexCategory[];
  collapsedCategoryIds: Set<string>;
  entities: TreeEntity[];
  query: string;
  revealEntityId: string;
  revealToken: number;
  questCount: number;
  sceneCount: number;
  onCreateCategory: (parentId: string) => void;
  onCreateEntity: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onMoveCategory: (categoryId: string, parentId: string, targetIndex?: number) => void;
  onMoveEntity: (entityId: string, categoryId: string, targetIndex?: number) => void;
  onOpenQuests: () => void;
  onOpenStory: () => void;
  onRenameCategory: (categoryId: string) => void;
  onSelectEntity: (entityId: string) => void;
  onToggleCategory: (categoryId: string) => void;
}) {
  const [draggedNode, setDraggedNode] = useState<DraggedNode | null>(null);
  const [dropTarget, setDropTarget] = useState<{ key: string; position: DropPosition } | null>(null);
  const [entityLimits, setEntityLimits] = useState<Record<string, number>>({});
  const normalizedQuery = normalize(query);
  const filterActive = Boolean(normalizedQuery || activeType !== "all");

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN")
      ),
    [categories]
  );
  const sortedEntities = useMemo(
    () =>
      [...entities].sort(
        (left, right) =>
          (left.order ?? 0) - (right.order ?? 0) || left.title.localeCompare(right.title, "zh-CN")
      ),
    [entities]
  );
  const categoryById = useMemo(
    () => new Map(sortedCategories.map((category) => [category.id, category])),
    [sortedCategories]
  );
  const childrenByParent = useMemo(() => {
    const result = new Map<string, CodexCategory[]>();
    sortedCategories.forEach((category) => {
      result.set(category.parentId, [...(result.get(category.parentId) ?? []), category]);
    });
    return result;
  }, [sortedCategories]);
  const entitiesByCategory = useMemo(() => {
    const result = new Map<string, TreeEntity[]>();
    sortedEntities.forEach((entity) => {
      const categoryId = categoryById.has(entity.categoryId ?? "") ? entity.categoryId ?? "" : "";
      result.set(categoryId, [...(result.get(categoryId) ?? []), entity]);
    });
    return result;
  }, [categoryById, sortedEntities]);
  const matchesEntity = useMemo(() => {
    const ids = new Set<string>();
    sortedEntities.forEach((entity) => {
      if (activeType !== "all" && entity.type !== activeType) return;
      if (!normalizedQuery) return ids.add(entity.id);
      const haystack = normalize(
        [
          entity.title,
          entity.summary,
          entity.tags.join(" "),
          Object.values(entity.templateData).join(" ")
        ].join(" ")
      );
      if (haystack.includes(normalizedQuery)) ids.add(entity.id);
    });
    return ids;
  }, [activeType, normalizedQuery, sortedEntities]);
  const categoryMatches = useMemo(
    () =>
      new Set(
        normalizedQuery
          ? sortedCategories
              .filter((category) =>
                normalize(`${category.title} ${category.description}`).includes(normalizedQuery)
              )
              .map((category) => category.id)
          : []
      ),
    [normalizedQuery, sortedCategories]
  );
  const matchingEntityCountByCategory = useMemo(
    () =>
      countCodexEntitiesByCategory(sortedCategories, sortedEntities, (entity) =>
        matchesEntity.has(entity.id)
      ),
    [matchesEntity, sortedCategories, sortedEntities]
  );
  const visibleCategoryIds = useMemo(() => {
    if (!filterActive) return new Set(sortedCategories.map((category) => category.id));
    const visible = new Set<string>();
    const visit = (category: CodexCategory): boolean => {
      const hasOwnEntity = (entitiesByCategory.get(category.id) ?? []).some((entity) =>
        matchesEntity.has(entity.id)
      );
      const hasChild = (childrenByParent.get(category.id) ?? []).some(visit);
      const shouldShow = hasOwnEntity || hasChild || categoryMatches.has(category.id);
      if (shouldShow) visible.add(category.id);
      return shouldShow;
    };
    (childrenByParent.get("") ?? []).forEach(visit);
    return visible;
  }, [categoryMatches, childrenByParent, entitiesByCategory, filterActive, matchesEntity, sortedCategories]);

  useEffect(() => {
    setEntityLimits({});
  }, [activeType, normalizedQuery]);

  useEffect(() => {
    if (!revealEntityId || !revealToken) return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(
        `[data-codex-entity-id="${revealEntityId}"]`
      );
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [revealEntityId, revealToken]);

  function categoryDrop(event: DragEvent<HTMLDivElement>, category: CodexCategory) {
    event.preventDefault();
    event.stopPropagation();
    const node = getDragData(event) ?? draggedNode;
    if (!node) return;
    const position = rowDropPosition(event, node.kind === "category");
    if (node.kind === "entity") {
      onMoveEntity(node.id, category.id);
    } else if (position === "inside") {
      onMoveCategory(node.id, category.id);
    } else {
      const siblings = childrenByParent.get(category.parentId) ?? [];
      const index = siblings.findIndex((item) => item.id === category.id);
      onMoveCategory(node.id, category.parentId, index + (position === "after" ? 1 : 0));
    }
    setDropTarget(null);
    setDraggedNode(null);
  }

  function entityDrop(event: DragEvent<HTMLButtonElement>, entity: TreeEntity) {
    event.preventDefault();
    event.stopPropagation();
    const node = getDragData(event) ?? draggedNode;
    if (!node || node.kind !== "entity") return;
    const categoryId = categoryById.has(entity.categoryId ?? "") ? entity.categoryId ?? "" : "";
    const siblings = entitiesByCategory.get(categoryId) ?? [];
    const index = siblings.findIndex((item) => item.id === entity.id);
    const position = rowDropPosition(event, false);
    onMoveEntity(node.id, categoryId, index + (position === "after" ? 1 : 0));
    setDropTarget(null);
    setDraggedNode(null);
  }

  function rootDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const node = getDragData(event) ?? draggedNode;
    if (!node) return;
    if (node.kind === "category") onMoveCategory(node.id, "");
    else onMoveEntity(node.id, "");
    setDropTarget(null);
    setDraggedNode(null);
  }

  function renderEntity(entity: TreeEntity, depth: number) {
    if (!matchesEntity.has(entity.id) && filterActive) return null;
    const Icon = entityIconMeta[entity.type];
    const key = `entity:${entity.id}`;
    return (
      <button
        aria-current={entity.id === activeEntityId ? "page" : undefined}
        className={`codex-tree-entity ${entity.id === activeEntityId ? "is-active" : ""} ${dropTarget?.key === key ? `drop-${dropTarget.position}` : ""}`}
        data-codex-entity-id={entity.id}
        draggable={!filterActive}
        key={entity.id}
        style={{ paddingLeft: 12 + depth * 16 }}
        title={entity.title}
        type="button"
        onClick={() => onSelectEntity(entity.id)}
        onDragEnd={() => {
          setDropTarget(null);
          setDraggedNode(null);
        }}
        onDragStart={(event) => {
          const node: DraggedNode = { kind: "entity", id: entity.id };
          setDraggedNode(node);
          setDragData(event, node);
        }}
        onDragOver={(event) => {
          if (filterActive) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          setDropTarget({ key, position: rowDropPosition(event, false) });
        }}
        onDrop={(event) => entityDrop(event, entity)}
      >
        <GripVertical className="codex-tree-grip" size={13} />
        <Icon size={14} />
        <span>{entity.title}</span>
      </button>
    );
  }

  function visibleEntityBatch(categoryId: string, source: TreeEntity[]) {
    const matching = source.filter((entity) => matchesEntity.has(entity.id));
    const limit = entityLimits[categoryId] ?? entityBatchSize;
    const visible = matching.slice(0, limit);
    const active = matching.find((entity) => entity.id === activeEntityId);
    if (active && !visible.some((entity) => entity.id === active.id)) visible.push(active);
    return { matching, visible, limit };
  }

  function renderLoadMore(categoryId: string, matching: TreeEntity[], limit: number, depth: number) {
    const remaining = matching.length - Math.min(limit, matching.length);
    if (remaining <= 0) return null;
    return (
      <button
        className="codex-tree-load-more"
        style={{ paddingLeft: 12 + depth * 16 }}
        type="button"
        onClick={() => setEntityLimits((current) => ({
          ...current,
          [categoryId]: (current[categoryId] ?? entityBatchSize) + entityBatchSize
        }))}
      >
        显示更多 · 还剩 {remaining} 个
      </button>
    );
  }

  function renderCategory(category: CodexCategory, depth: number): React.ReactNode {
    if (!visibleCategoryIds.has(category.id)) return null;
    const Icon = categoryIconMeta[category.icon] ?? Folder;
    const children = childrenByParent.get(category.id) ?? [];
    const categoryEntities = entitiesByCategory.get(category.id) ?? [];
    const entityBatch = visibleEntityBatch(category.id, categoryEntities);
    const matchingEntityCount = matchingEntityCountByCategory.get(category.id) ?? 0;
    const hasChildren =
      children.some((item) => visibleCategoryIds.has(item.id)) || entityBatch.matching.length > 0;
    const collapsed = !filterActive && collapsedCategoryIds.has(category.id);
    const key = `category:${category.id}`;
    const countTitle = filterActive
      ? `${matchingEntityCount} 个匹配条目`
      : `${matchingEntityCount} 个条目（包含子分类）`;
    return (
      <div className="codex-tree-branch" key={category.id}>
        <div
          className={`codex-tree-category ${dropTarget?.key === key ? `drop-${dropTarget.position}` : ""}`}
          draggable={!filterActive}
          style={{ paddingLeft: 4 + depth * 16 }}
          onDragEnd={() => {
            setDropTarget(null);
            setDraggedNode(null);
          }}
          onDragStart={(event) => {
            const node: DraggedNode = { kind: "category", id: category.id };
            setDraggedNode(node);
            setDragData(event, node);
          }}
          onDragOver={(event) => {
            if (filterActive) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            setDropTarget({
              key,
              position: rowDropPosition(event, draggedNode?.kind === "category")
            });
          }}
          onDrop={(event) => categoryDrop(event, category)}
        >
          <button
            aria-label={collapsed ? "展开分类" : "收起分类"}
            className="codex-tree-toggle"
            disabled={!hasChildren}
            title={collapsed ? "展开分类" : "收起分类"}
            type="button"
            onClick={() => onToggleCategory(category.id)}
          >
            <ChevronRight className={collapsed ? "" : "is-open"} size={14} />
          </button>
          <Icon size={15} style={{ color: category.color }} />
          <span className="codex-tree-category-title">{category.title}</span>
          <small title={countTitle}>{matchingEntityCount}</small>
          <div className="codex-tree-row-actions">
            <button
              aria-label={`在${category.title}中新建条目`}
              title="新建条目"
              type="button"
              onClick={(event) => {
                stopAction(event);
                onCreateEntity(category.id);
              }}
            >
              <FilePlus2 size={14} />
            </button>
            <button
              aria-label={`在${category.title}中新建子分类`}
              title="新建子分类"
              type="button"
              onClick={(event) => {
                stopAction(event);
                onCreateCategory(category.id);
              }}
            >
              <FolderPlus size={14} />
            </button>
            <button
              aria-label={`编辑分类${category.title}`}
              title="编辑分类"
              type="button"
              onClick={(event) => {
                stopAction(event);
                onRenameCategory(category.id);
              }}
            >
              <Pencil size={13} />
            </button>
            <button
              aria-label={`删除分类${category.title}`}
              title="删除分类"
              type="button"
              onClick={(event) => {
                stopAction(event);
                onDeleteCategory(category.id);
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        {!collapsed ? (
          <div className="codex-tree-children">
            {children.map((child) => renderCategory(child, depth + 1))}
            {entityBatch.visible.map((entity) => renderEntity(entity, depth + 1))}
            {renderLoadMore(category.id, entityBatch.matching, entityBatch.limit, depth + 1)}
          </div>
        ) : null}
      </div>
    );
  }

  const rootCategories = childrenByParent.get("") ?? [];
  const unfiledEntities = entitiesByCategory.get("") ?? [];
  const rootEntityBatch = visibleEntityBatch("__root__", unfiledEntities);
  const resultCount = matchesEntity.size;

  return (
    <div
      className={`codex-project-tree ${dropTarget?.key === "root" ? "drop-root" : ""}`}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(null);
      }}
      onDragOver={(event) => {
        if (filterActive || event.target !== event.currentTarget) return;
        event.preventDefault();
        setDropTarget({ key: "root", position: "inside" });
      }}
      onDrop={rootDrop}
    >
      <div className="codex-tree-domain-links">
        <button type="button" onClick={onOpenQuests}>
          <Route size={15} />
          <span>任务线</span>
          <small>{questCount}</small>
        </button>
        <button type="button" onClick={onOpenStory}>
          <MessagesSquare size={15} />
          <span>剧情场景</span>
          <small>{sceneCount}</small>
        </button>
      </div>

      <div
        className="codex-tree-root-heading"
        onDragOver={(event) => {
          if (filterActive) return;
          event.preventDefault();
          setDropTarget({ key: "root", position: "inside" });
        }}
        onDrop={rootDrop}
      >
        <div>
          <FolderOpen size={15} />
          <strong>设定资料</strong>
          <small>{filterActive ? resultCount : entities.length}</small>
        </div>
      </div>

      <div className="codex-tree-scroll">
        {rootCategories.map((category) => renderCategory(category, 0))}
        {rootEntityBatch.visible.map((entity) => renderEntity(entity, 0))}
        {renderLoadMore("__root__", rootEntityBatch.matching, rootEntityBatch.limit, 0)}
        {!resultCount && filterActive ? (
          <div className="codex-tree-empty">
            <FileText size={20} />
            <span>没有匹配的条目</span>
          </div>
        ) : null}
      </div>
      {filterActive ? <div className="codex-tree-filter-note">筛选时暂不允许拖放</div> : null}
      <div className="codex-tree-create-bar">
        <button aria-label="创建条目" title="新建条目" type="button" onClick={() => onCreateEntity("")}>
          <FilePlus2 size={15} />
          <span>新建条目</span>
        </button>
        <button aria-label="创建分类" title="新建分类" type="button" onClick={() => onCreateCategory("")}>
          <FolderPlus size={15} />
          <span>新建分类</span>
        </button>
      </div>
    </div>
  );
}
