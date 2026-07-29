export type CodexEntityType =
  | "character"
  | "location"
  | "faction"
  | "event"
  | "item"
  | "note";

export type CodexCategoryIcon =
  | "folder"
  | "characters"
  | "locations"
  | "factions"
  | "events"
  | "items"
  | "notes";

export type CodexCategory = {
  id: string;
  worldId: string;
  parentId: string;
  title: string;
  description: string;
  icon: CodexCategoryIcon;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type CodexHierarchyEntity = {
  id: string;
  worldId: string;
  type: CodexEntityType;
  categoryId?: string;
  order?: number;
};

export type CodexHierarchyIssue = {
  id: string;
  severity: "error" | "warning";
  title: string;
  detail: string;
  categoryId?: string;
  entityId?: string;
};

const categoryIcons: CodexCategoryIcon[] = [
  "folder",
  "characters",
  "locations",
  "factions",
  "events",
  "items",
  "notes"
];

const categoryColors = [
  "#3f6f5c",
  "#456d8c",
  "#8a5b46",
  "#75608f",
  "#9a6b31",
  "#61706a",
  "#8a5963"
];

const defaultCategoryMeta: Array<{
  type: CodexEntityType;
  title: string;
  icon: CodexCategoryIcon;
  color: string;
}> = [
  { type: "character", title: "角色", icon: "characters", color: "#3f6f5c" },
  { type: "location", title: "地点", icon: "locations", color: "#456d8c" },
  { type: "faction", title: "阵营与组织", icon: "factions", color: "#8a5b46" },
  { type: "event", title: "事件与历史", icon: "events", color: "#75608f" },
  { type: "item", title: "物品", icon: "items", color: "#9a6b31" },
  { type: "note", title: "创作笔记", icon: "notes", color: "#61706a" }
];

function finiteOrder(value: unknown, fallback: number) {
  const order = Number(value);
  return Number.isFinite(order) ? Math.max(0, Math.trunc(order)) : fallback;
}

function normalizedText(value: unknown, fallback: string, maximum = 120) {
  const text = String(value ?? "").trim();
  return (text || fallback).slice(0, maximum);
}

export function getDefaultCodexCategoryId(worldId: string, type: CodexEntityType) {
  return `category:${worldId}:${type}`;
}

export function createDefaultCodexCategories(
  worldId: string,
  timestamp = new Date().toISOString()
): CodexCategory[] {
  return defaultCategoryMeta.map((item, index) => ({
    id: getDefaultCodexCategoryId(worldId, item.type),
    worldId,
    parentId: "",
    title: item.title,
    description: `${item.title}相关的世界设定条目。`,
    icon: item.icon,
    color: item.color,
    order: index,
    createdAt: timestamp,
    updatedAt: timestamp
  }));
}

export function createCodexCategory(
  worldId: string,
  id: string,
  title: string,
  parentId = "",
  order = 0,
  timestamp = new Date().toISOString()
): CodexCategory {
  return {
    id,
    worldId,
    parentId,
    title: normalizedText(title, "新的分类"),
    description: "",
    icon: "folder",
    color: categoryColors[Math.abs(order) % categoryColors.length],
    order: finiteOrder(order, 0),
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function normalizeCategory(
  input: Partial<CodexCategory>,
  worldId: string,
  index: number,
  timestamp: string
): CodexCategory {
  const icon = categoryIcons.includes(input.icon as CodexCategoryIcon)
    ? (input.icon as CodexCategoryIcon)
    : "folder";
  const color = /^#[0-9a-f]{6}$/i.test(String(input.color ?? ""))
    ? String(input.color)
    : categoryColors[index % categoryColors.length];
  return {
    id: normalizedText(input.id, `category:${worldId}:migrated-${index}`, 180),
    worldId,
    parentId: normalizedText(input.parentId, "", 180),
    title: normalizedText(input.title, `分类 ${index + 1}`),
    description: String(input.description ?? "").trim().slice(0, 2000),
    icon,
    color,
    order: finiteOrder(input.order, index),
    createdAt: input.createdAt || timestamp,
    updatedAt: input.updatedAt || input.createdAt || timestamp
  };
}

function breakCategoryCycles(categories: CodexCategory[]) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  return categories.map((category) => {
    const seen = new Set([category.id]);
    let parentId = category.parentId;
    while (parentId) {
      if (seen.has(parentId)) {
        return { ...category, parentId: "" };
      }
      seen.add(parentId);
      parentId = categoryById.get(parentId)?.parentId ?? "";
    }
    return category;
  });
}

function resequenceCategories(categories: CodexCategory[]) {
  const grouped = new Map<string, CodexCategory[]>();
  categories.forEach((category) => {
    const key = `${category.worldId}\u0000${category.parentId}`;
    grouped.set(key, [...(grouped.get(key) ?? []), category]);
  });
  const orders = new Map<string, number>();
  grouped.forEach((items) => {
    items
      .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN"))
      .forEach((item, index) => orders.set(item.id, index));
  });
  return categories.map((category) => ({
    ...category,
    order: orders.get(category.id) ?? category.order
  }));
}

function resequenceEntities<T extends CodexHierarchyEntity>(entities: T[]) {
  const grouped = new Map<string, T[]>();
  entities.forEach((entity) => {
    const key = `${entity.worldId}\u0000${entity.categoryId ?? ""}`;
    grouped.set(key, [...(grouped.get(key) ?? []), entity]);
  });
  const orders = new Map<string, number>();
  grouped.forEach((items) => {
    items
      .sort((left, right) => finiteOrder(left.order, 0) - finiteOrder(right.order, 0))
      .forEach((item, index) => orders.set(item.id, index));
  });
  return entities.map((entity) => ({ ...entity, order: orders.get(entity.id) ?? 0 }));
}

export function normalizeCodexHierarchy<T extends CodexHierarchyEntity>(
  inputCategories: Array<Partial<CodexCategory>> | undefined,
  inputEntities: T[],
  worldIds: string[],
  timestamp = new Date().toISOString()
): { categories: CodexCategory[]; entities: T[] } {
  const validWorldIds = new Set(worldIds);
  const seenIds = new Set<string>();
  let categories = (Array.isArray(inputCategories) ? inputCategories : [])
    .filter((category) => validWorldIds.has(String(category.worldId ?? "")))
    .map((category, index) =>
      normalizeCategory(category, String(category.worldId), index, timestamp)
    )
    .filter((category) => {
      if (seenIds.has(category.id)) return false;
      seenIds.add(category.id);
      return true;
    });

  worldIds.forEach((worldId) => {
    if (!categories.some((category) => category.worldId === worldId)) {
      const defaults = createDefaultCodexCategories(worldId, timestamp).filter(
        (category) => !seenIds.has(category.id)
      );
      defaults.forEach((category) => seenIds.add(category.id));
      categories.push(...defaults);
    }
  });

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  categories = categories.map((category) => {
    const parent = categoryById.get(category.parentId);
    return !parent || parent.worldId !== category.worldId || parent.id === category.id
      ? { ...category, parentId: "" }
      : category;
  });
  categories = resequenceCategories(breakCategoryCycles(categories));

  const resolvedCategoryById = new Map(categories.map((category) => [category.id, category]));
  const entities = inputEntities.map((entity, index) => {
    const requested = resolvedCategoryById.get(entity.categoryId ?? "");
    const fallback = resolvedCategoryById.get(
      getDefaultCodexCategoryId(entity.worldId, entity.type)
    );
    const categoryId = requested?.worldId === entity.worldId
      ? requested.id
      : fallback?.id ?? "";
    return {
      ...entity,
      categoryId,
      order: finiteOrder(entity.order, index)
    };
  });

  return { categories, entities: resequenceEntities(entities) };
}

export function getCodexCategoryPath(
  categories: CodexCategory[],
  categoryId: string
): CodexCategory[] {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const path: CodexCategory[] = [];
  const seen = new Set<string>();
  let current = categoryById.get(categoryId);
  while (current && !seen.has(current.id)) {
    path.unshift(current);
    seen.add(current.id);
    current = categoryById.get(current.parentId);
  }
  return path;
}

export function getCodexCategoryDescendantIds(
  categories: CodexCategory[],
  categoryId: string
) {
  const childrenByParent = new Map<string, CodexCategory[]>();
  categories.forEach((category) => {
    childrenByParent.set(category.parentId, [
      ...(childrenByParent.get(category.parentId) ?? []),
      category
    ]);
  });
  const descendants = new Set<string>();
  const queue = [...(childrenByParent.get(categoryId) ?? [])];
  while (queue.length) {
    const current = queue.shift();
    if (!current || descendants.has(current.id)) continue;
    descendants.add(current.id);
    queue.push(...(childrenByParent.get(current.id) ?? []));
  }
  return descendants;
}

export function countCodexEntitiesByCategory<T extends { id: string; categoryId?: string }>(
  categories: Array<Pick<CodexCategory, "id" | "parentId">>,
  entities: T[],
  includeEntity: (entity: T) => boolean = () => true
) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const counts = new Map(categories.map((category) => [category.id, 0]));

  entities.forEach((entity) => {
    if (!includeEntity(entity)) return;
    const seen = new Set<string>();
    let current = categoryById.get(entity.categoryId ?? "");
    while (current && !seen.has(current.id)) {
      counts.set(current.id, (counts.get(current.id) ?? 0) + 1);
      seen.add(current.id);
      current = categoryById.get(current.parentId);
    }
  });

  return counts;
}

export function moveCodexCategory(
  categories: CodexCategory[],
  categoryId: string,
  parentId: string,
  targetIndex?: number,
  timestamp = new Date().toISOString()
) {
  const moving = categories.find((category) => category.id === categoryId);
  if (!moving) return categories;
  const parent = categories.find((category) => category.id === parentId);
  if (parentId && (!parent || parent.worldId !== moving.worldId)) return categories;
  if (
    parentId === categoryId ||
    getCodexCategoryDescendantIds(categories, categoryId).has(parentId)
  ) {
    return categories;
  }

  const next = categories.map((category) =>
    category.id === categoryId ? { ...category, parentId, updatedAt: timestamp } : category
  );
  const targetSiblings = next
    .filter(
      (category) =>
        category.worldId === moving.worldId &&
        category.parentId === parentId &&
        category.id !== categoryId
    )
    .sort((left, right) => left.order - right.order);
  const adjustedTargetIndex =
    targetIndex !== undefined && moving.parentId === parentId && moving.order < targetIndex
      ? targetIndex - 1
      : targetIndex;
  const boundedIndex = Math.max(
    0,
    Math.min(adjustedTargetIndex ?? targetSiblings.length, targetSiblings.length)
  );
  targetSiblings.splice(
    boundedIndex,
    0,
    next.find((category) => category.id === categoryId) as CodexCategory
  );
  const targetOrders = new Map(targetSiblings.map((category, index) => [category.id, index]));

  return resequenceCategories(
    next.map((category) =>
      targetOrders.has(category.id)
        ? { ...category, order: targetOrders.get(category.id) as number }
        : category
    )
  );
}

export function moveCodexEntity<T extends CodexHierarchyEntity>(
  entities: T[],
  entityId: string,
  categoryId: string,
  targetIndex?: number
) {
  const moving = entities.find((entity) => entity.id === entityId);
  if (!moving) return entities;
  const next = entities.map((entity) =>
    entity.id === entityId ? { ...entity, categoryId } : entity
  );
  const targetSiblings = next
    .filter(
      (entity) =>
        entity.worldId === moving.worldId &&
        (entity.categoryId ?? "") === categoryId &&
        entity.id !== entityId
    )
    .sort((left, right) => finiteOrder(left.order, 0) - finiteOrder(right.order, 0));
  const adjustedTargetIndex =
    targetIndex !== undefined &&
    (moving.categoryId ?? "") === categoryId &&
    finiteOrder(moving.order, 0) < targetIndex
      ? targetIndex - 1
      : targetIndex;
  const boundedIndex = Math.max(
    0,
    Math.min(adjustedTargetIndex ?? targetSiblings.length, targetSiblings.length)
  );
  targetSiblings.splice(
    boundedIndex,
    0,
    next.find((entity) => entity.id === entityId) as T
  );
  const targetOrders = new Map(targetSiblings.map((entity, index) => [entity.id, index]));
  return resequenceEntities(
    next.map((entity) =>
      targetOrders.has(entity.id)
        ? { ...entity, order: targetOrders.get(entity.id) as number }
        : entity
    )
  );
}

export function removeCodexCategory<T extends CodexHierarchyEntity>(
  categories: CodexCategory[],
  entities: T[],
  categoryId: string,
  timestamp = new Date().toISOString()
) {
  const removed = categories.find((category) => category.id === categoryId);
  if (!removed) return { categories, entities };
  const nextCategories = categories
    .filter((category) => category.id !== categoryId)
    .map((category) =>
      category.parentId === categoryId
        ? { ...category, parentId: removed.parentId, updatedAt: timestamp }
        : category
    );
  const nextEntities = entities.map((entity) =>
    entity.worldId === removed.worldId && entity.categoryId === categoryId
      ? { ...entity, categoryId: removed.parentId }
      : entity
  );
  return {
    categories: resequenceCategories(nextCategories),
    entities: resequenceEntities(nextEntities)
  };
}

export function flattenCodexCategories(categories: CodexCategory[]) {
  const childrenByParent = new Map<string, CodexCategory[]>();
  categories.forEach((category) => {
    childrenByParent.set(category.parentId, [
      ...(childrenByParent.get(category.parentId) ?? []),
      category
    ]);
  });
  childrenByParent.forEach((items) =>
    items.sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN"))
  );
  const rows: Array<{ category: CodexCategory; depth: number }> = [];
  const visit = (parentId: string, depth: number) => {
    (childrenByParent.get(parentId) ?? []).forEach((category) => {
      rows.push({ category, depth });
      visit(category.id, depth + 1);
    });
  };
  visit("", 0);
  return rows;
}

export function validateCodexHierarchy<T extends CodexHierarchyEntity>(
  categories: CodexCategory[],
  entities: T[],
  worldId: string
): CodexHierarchyIssue[] {
  const issues: CodexHierarchyIssue[] = [];
  const worldCategories = categories.filter((category) => category.worldId === worldId);
  const categoryById = new Map(worldCategories.map((category) => [category.id, category]));
  const seenIds = new Set<string>();
  worldCategories.forEach((category) => {
    if (seenIds.has(category.id)) {
      issues.push({
        id: `category-duplicate:${category.id}`,
        severity: "error",
        title: "分类 ID 重复",
        detail: category.title,
        categoryId: category.id
      });
    }
    seenIds.add(category.id);
    if (category.parentId && !categoryById.has(category.parentId)) {
      issues.push({
        id: `category-parent:${category.id}`,
        severity: "error",
        title: "分类父级已失效",
        detail: `${category.title} 的父级不存在`,
        categoryId: category.id
      });
    }
    if (getCodexCategoryDescendantIds(worldCategories, category.id).has(category.id)) {
      issues.push({
        id: `category-cycle:${category.id}`,
        severity: "error",
        title: "分类层级存在循环",
        detail: category.title,
        categoryId: category.id
      });
    }
  });
  entities
    .filter((entity) => entity.worldId === worldId)
    .forEach((entity) => {
      if (entity.categoryId && !categoryById.has(entity.categoryId)) {
        issues.push({
          id: `entity-category:${entity.id}`,
          severity: "warning",
          title: "条目所在分类已失效",
          detail: entity.id,
          entityId: entity.id
        });
      }
    });
  return issues;
}
