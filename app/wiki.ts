import { sanitizePublicationRichText } from "./publication";
import type { ProjectReferenceIndex } from "./project-references";

export type WikiAudience = "author" | "member" | "public";
export type WikiVisibility = "private" | "shared" | "public" | "secret";

export type WorldWikiSettings = {
  coverAssetId: string;
  themeColor: string;
  navigationCategoryIds: string[];
  featuredEntityIds: string[];
  defaultMapId: string;
  publishedMapIds: string[];
  publishedTimelineTrackIds: string[];
  publishedQuestIds: string[];
};

export type WikiCategoryLike = {
  id: string;
  parentId: string;
  title: string;
  order: number;
};

export type WikiEntityLike = {
  id: string;
  slug?: string;
  title: string;
  summary?: string;
  content?: string;
  tags?: string[];
  visibility: WikiVisibility;
  categoryId?: string;
  type?: string;
  updatedAt?: string;
  templateData?: Record<string, string>;
};

export type WikiRelationLike = {
  sourceEntityId: string;
  targetEntityId: string;
};

export const defaultWorldWikiSettings: WorldWikiSettings = {
  coverAssetId: "",
  themeColor: "#176b5b",
  navigationCategoryIds: [],
  featuredEntityIds: [],
  defaultMapId: "",
  publishedMapIds: [],
  publishedTimelineTrackIds: [],
  publishedQuestIds: []
};

function cleanId(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 300) : "";
}

function cleanIdArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.map(cleanId).filter(Boolean))
  ).slice(0, 10000);
}

export function normalizeWorldWikiSettings(
  value?: Partial<WorldWikiSettings> | null
): WorldWikiSettings {
  const color = String(value?.themeColor ?? "").trim();
  return {
    coverAssetId: cleanId(value?.coverAssetId),
    themeColor: /^#[0-9a-f]{6}$/i.test(color)
      ? color.toLowerCase()
      : defaultWorldWikiSettings.themeColor,
    navigationCategoryIds: cleanIdArray(value?.navigationCategoryIds),
    featuredEntityIds: cleanIdArray(value?.featuredEntityIds),
    defaultMapId: cleanId(value?.defaultMapId),
    publishedMapIds: cleanIdArray(value?.publishedMapIds),
    publishedTimelineTrackIds: cleanIdArray(value?.publishedTimelineTrackIds),
    publishedQuestIds: cleanIdArray(value?.publishedQuestIds)
  };
}

export function canViewWikiWorld(
  visibility: Exclude<WikiVisibility, "secret">,
  audience: WikiAudience
) {
  if (audience === "author") return true;
  if (audience === "member") return visibility === "shared" || visibility === "public";
  return visibility === "public";
}

export function canViewWikiEntity(visibility: WikiVisibility, audience: WikiAudience) {
  if (audience === "author") return true;
  if (audience === "member") return visibility === "shared" || visibility === "public";
  return visibility === "public";
}

export function isWikiResourceVisible(
  id: string,
  publishedIds: readonly string[],
  audience: WikiAudience
) {
  return audience === "author" || publishedIds.includes(id);
}

export function getVisibleWikiEntities<T extends WikiEntityLike>(
  entities: readonly T[],
  audience: WikiAudience
) {
  return entities.filter((entity) => canViewWikiEntity(entity.visibility, audience));
}

export function normalizeWikiSearchText(value: unknown) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("zh-CN")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildWikiCategoryCounts(
  categories: readonly WikiCategoryLike[],
  entities: readonly Pick<WikiEntityLike, "categoryId">[]
) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const counts = new Map(categories.map((category) => [category.id, 0]));

  for (const entity of entities) {
    let categoryId = entity.categoryId || "";
    const visited = new Set<string>();
    while (categoryId && categoryById.has(categoryId) && !visited.has(categoryId)) {
      visited.add(categoryId);
      counts.set(categoryId, (counts.get(categoryId) || 0) + 1);
      categoryId = categoryById.get(categoryId)?.parentId || "";
    }
  }

  return counts;
}

export function getWikiCategoryDescendantIds(
  categories: readonly WikiCategoryLike[],
  categoryId: string
) {
  const childrenByParent = new Map<string, string[]>();
  for (const category of categories) {
    childrenByParent.set(category.parentId, [
      ...(childrenByParent.get(category.parentId) || []),
      category.id
    ]);
  }
  const result = new Set<string>();
  const queue = [...(childrenByParent.get(categoryId) || [])];
  while (queue.length) {
    const id = queue.shift() as string;
    if (result.has(id)) continue;
    result.add(id);
    queue.push(...(childrenByParent.get(id) || []));
  }
  return result;
}

export function getWikiNavigationCategories<T extends WikiCategoryLike>(
  categories: readonly T[],
  counts: ReadonlyMap<string, number>,
  configuredIds: readonly string[]
) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const configured = configuredIds
    .map((id) => categoryById.get(id))
    .filter((category): category is T => Boolean(category));
  const source = configured.length
    ? configured
    : categories.filter((category) => !category.parentId);
  return [...source]
    .filter((category) => (counts.get(category.id) || 0) > 0)
    .sort((left, right) => {
      if (configured.length) {
        return configuredIds.indexOf(left.id) - configuredIds.indexOf(right.id);
      }
      return left.order - right.order || left.title.localeCompare(right.title, "zh-CN");
    });
}

export function searchWikiEntities<T extends WikiEntityLike>(
  entities: readonly T[],
  query: string,
  limit = 80
) {
  const normalizedQuery = normalizeWikiSearchText(query);
  if (!normalizedQuery) return [];
  const terms = normalizedQuery.split(" ").filter(Boolean);

  return entities
    .map((entity) => {
      const title = normalizeWikiSearchText(entity.title);
      const tags = normalizeWikiSearchText((entity.tags || []).join(" "));
      const identifiers = normalizeWikiSearchText(
        `${entity.id} ${entity.slug || ""} ${Object.values(entity.templateData || {}).join(" ")}`
      );
      const summary = normalizeWikiSearchText(entity.summary);
      const content = normalizeWikiSearchText(entity.content).slice(0, 12000);
      const searchable = `${title} ${identifiers} ${tags} ${summary} ${content}`;
      if (!terms.every((term) => searchable.includes(term))) return null;
      let score = 1;
      if (title === normalizedQuery) score += 100;
      else if (title.startsWith(normalizedQuery)) score += 60;
      else if (title.includes(normalizedQuery)) score += 35;
      if (tags.includes(normalizedQuery)) score += 20;
      if (identifiers.includes(normalizedQuery)) score += 24;
      if (summary.includes(normalizedQuery)) score += 10;
      return { entity, score };
    })
    .filter((item): item is { entity: T; score: number } => Boolean(item))
    .sort(
      (left, right) =>
        right.score - left.score ||
        String(right.entity.updatedAt || "").localeCompare(String(left.entity.updatedAt || ""))
    )
    .slice(0, Math.max(1, limit))
    .map((item) => item.entity);
}

export function getWikiRelatedEntityIds({
  entity,
  visibleEntities,
  relations,
  referenceIndex,
  limit = 8
}: {
  entity: WikiEntityLike;
  visibleEntities: readonly WikiEntityLike[];
  relations: readonly WikiRelationLike[];
  referenceIndex?: ProjectReferenceIndex | null;
  limit?: number;
}) {
  const visibleById = new Map(visibleEntities.map((item) => [item.id, item]));
  const scores = new Map<string, number>();
  const add = (id: string, score: number) => {
    if (id === entity.id || !visibleById.has(id)) return;
    scores.set(id, (scores.get(id) || 0) + score);
  };

  relations.forEach((relation) => {
    if (relation.sourceEntityId === entity.id) add(relation.targetEntityId, 120);
    if (relation.targetEntityId === entity.id) add(relation.sourceEntityId, 120);
  });

  referenceIndex?.references.forEach((reference) => {
    if (reference.source.kind === "entity" && reference.source.id === entity.id && reference.target.kind === "entity") {
      add(reference.target.id, 90);
    }
    if (reference.target.kind === "entity" && reference.target.id === entity.id && reference.source.kind === "entity") {
      add(reference.source.id, 80);
    }
  });

  const tags = new Set((entity.tags || []).map(normalizeWikiSearchText).filter(Boolean));
  visibleEntities.forEach((candidate) => {
    if (candidate.id === entity.id) return;
    if (candidate.categoryId && candidate.categoryId === entity.categoryId) add(candidate.id, 8);
    const sharedTagCount = (candidate.tags || []).reduce(
      (count, tag) => count + Number(tags.has(normalizeWikiSearchText(tag))),
      0
    );
    if (sharedTagCount) add(candidate.id, sharedTagCount * 18);
  });

  return [...scores.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) return right[1] - left[1];
      const rightEntity = visibleById.get(right[0]);
      const leftEntity = visibleById.get(left[0]);
      return String(rightEntity?.updatedAt || "").localeCompare(String(leftEntity?.updatedAt || ""));
    })
    .slice(0, Math.max(0, limit))
    .map(([id]) => id);
}

function attributeValue(attributes: string, name: string) {
  const match = attributes.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i")
  );
  return match?.[1] || match?.[2] || "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function visibleReferenceLink(kind: string, id: string, label: string) {
  const safeKind = escapeHtml(kind);
  const safeId = escapeHtml(id);
  return `<a class="wiki-inline-reference" href="#wiki-reference" data-wiki-reference-kind="${safeKind}" data-wiki-reference-id="${safeId}">${escapeHtml(label)}</a>`;
}

export function sanitizeWikiRichText(
  value: unknown,
  options: {
    audience: WikiAudience;
    visibleEntities?: readonly Pick<WikiEntityLike, "id" | "title">[];
    restrictedEntityTitles?: readonly string[];
    visibleReferenceKeys?: ReadonlySet<string>;
  }
) {
  const includeSecrets = options.audience === "author";
  let output = sanitizePublicationRichText(value, includeSecrets);
  const visibleTitleMap = new Map(
    (options.visibleEntities || []).map((entity) => [normalizeWikiSearchText(entity.title), entity])
  );
  const restrictedTitles = new Set(
    (options.restrictedEntityTitles || []).map(normalizeWikiSearchText).filter(Boolean)
  );

  output = output.replace(
    /<span\b([^>]*)>([\s\S]*?)<\/span\s*>/gi,
    (full, attributes: string, body: string) => {
      const id = cleanId(attributeValue(attributes, "data-project-reference-id"));
      if (!id) return full;
      const kind = cleanId(attributeValue(attributes, "data-project-reference-kind")) || "entity";
      const key = `${kind}:${id}`;
      const allowed = includeSecrets || options.visibleReferenceKeys?.has(key) === true;
      if (!allowed) return '<span class="wiki-redacted-reference">受限内容</span>';
      const rawLabel = body.replace(/<[^>]*>/g, "").replace(/^\[\[|\]\]$/g, "").trim();
      return visibleReferenceLink(kind, id, rawLabel || "未命名条目");
    }
  );

  output = output.replace(/\[\[([^\[\]]{1,200})\]\]/g, (full, rawTitle: string) => {
    const normalizedTitle = normalizeWikiSearchText(rawTitle);
    const visibleEntity = visibleTitleMap.get(normalizedTitle);
    if (visibleEntity) {
      return visibleReferenceLink("entity", visibleEntity.id, rawTitle.trim());
    }
    if (!includeSecrets && restrictedTitles.has(normalizedTitle)) {
      return '<span class="wiki-redacted-reference">受限内容</span>';
    }
    return full;
  });

  return output;
}
