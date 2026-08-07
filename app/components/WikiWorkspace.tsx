"use client";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileText,
  Flag,
  FolderTree,
  Globe2,
  Image as ImageIcon,
  Layers3,
  LockKeyhole,
  Map as MapIcon,
  MapPin,
  Pencil,
  Route,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Tags,
  UsersRound,
  X
} from "lucide-react";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import type { CodexCategory, CodexEntityType } from "../codex-tree";
import type { EntityTemplateDefinition } from "../entity-templates";
import type { OfflineWikiExportResult } from "../offline-wiki";
import type {
  MapMarker,
  TimelineEvent,
  TimelineTrack,
  WorldMap
} from "../world-planning";
import type {
  ProjectObjectRef,
  ProjectReferenceIndex
} from "../project-references";
import {
  buildWikiCategoryCounts,
  canViewWikiWorld,
  getVisibleWikiEntities,
  getWikiCategoryDescendantIds,
  getWikiNavigationCategories,
  getWikiRelatedEntityIds,
  isWikiResourceVisible,
  normalizeWikiSearchText,
  normalizeWorldWikiSettings,
  sanitizeWikiRichText,
  searchWikiEntities,
  type WikiAudience,
  type WikiVisibility,
  type WorldWikiSettings
} from "../wiki";

export type WikiWorld = {
  id: string;
  name: string;
  description: string;
  visibility: Exclude<WikiVisibility, "secret">;
  updatedAt: string;
  wiki?: Partial<WorldWikiSettings>;
};

export type WikiEntity = {
  id: string;
  worldId: string;
  type: CodexEntityType;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  visibility: WikiVisibility;
  categoryId: string;
  order: number;
  updatedAt: string;
  templateId?: string;
  templateData: Record<string, string>;
};

export type WikiQuest = {
  id: string;
  worldId: string;
  title: string;
  category: "main" | "side" | "character";
  status: "draft" | "active" | "implemented" | "cut";
  summary: string;
  trigger: string;
  relatedEntityIds: string[];
  prerequisiteQuestIds: string[];
  steps: Array<{
    id: string;
    title: string;
    objective: string;
    condition: string;
    branch: string;
    failure: string;
    reward: string;
    notes: string;
  }>;
  developerNotes: string;
  updatedAt: string;
};

export type WikiRelation = {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  label: string;
  kind: string;
  strength: number;
};

export type WikiAsset = {
  id: string;
  name: string;
  kind: "image" | "map" | "video" | "audio" | "concept" | "document";
  mimeType: string;
  storedName: string;
  linkedEntityIds: string[];
};

type WikiPage =
  | { kind: "home" }
  | { kind: "category"; id: string }
  | { kind: "entity"; id: string }
  | { kind: "map"; id: string }
  | { kind: "timeline"; id: string; eventId?: string }
  | { kind: "quest"; id: string }
  | { kind: "search" };

type WikiReferenceHover = {
  kind: string;
  id: string;
  x: number;
  y: number;
};

type WikiWorkspaceProps = {
  world: WikiWorld;
  assets: WikiAsset[];
  categories: CodexCategory[];
  entities: WikiEntity[];
  maps: WorldMap[];
  markers: MapMarker[];
  quests: WikiQuest[];
  referenceIndex: ProjectReferenceIndex;
  relations: WikiRelation[];
  settingsOpenToken: number;
  templates: EntityTemplateDefinition[];
  timelineEvents: TimelineEvent[];
  timelineTracks: TimelineTrack[];
  getAssetUrl: (storedName: string) => string;
  onOpenEditorReference: (reference: ProjectObjectRef) => void;
  onExportOfflineWiki: (audience: WikiAudience) => Promise<OfflineWikiExportResult>;
  onReturnToEditor: () => void;
  onUpdateWorld: (patch: {
    description?: string;
    visibility?: Exclude<WikiVisibility, "secret">;
    wiki?: WorldWikiSettings;
  }) => void;
};

const entityTypeLabels: Record<CodexEntityType, string> = {
  character: "人物",
  location: "地点",
  faction: "组织",
  event: "事件",
  item: "物品",
  note: "文章"
};

const questCategoryLabels: Record<WikiQuest["category"], string> = {
  main: "主线任务",
  side: "支线任务",
  character: "角色任务"
};

const audienceMeta: Record<WikiAudience, { label: string; helper: string }> = {
  author: { label: "作者", helper: "完整内容" },
  member: { label: "项目成员", helper: "共享与公开" },
  public: { label: "公开访客", helper: "仅公开内容" }
};

const themeSwatches = ["#176b5b", "#315f8b", "#7b4f86", "#9a5a38", "#7a6532", "#485f69"];

function formatDate(value: string) {
  if (!value) return "尚未记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function plainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

function toggleId(items: readonly string[], id: string) {
  return items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
}

function WikiBreadcrumbs({
  items,
  onHome
}: {
  items: Array<{ id: string; label: string; onClick?: () => void }>;
  onHome: () => void;
}) {
  return (
    <nav aria-label="Wiki 面包屑" className="wiki-breadcrumbs">
      <button type="button" onClick={onHome}>
        <Globe2 size={14} />
        <span>世界首页</span>
      </button>
      {items.map((item, index) => (
        <span className="wiki-breadcrumb-item" key={`${item.id}:${index}`}>
          <ChevronRight size={14} />
          {item.onClick ? (
            <button type="button" onClick={item.onClick}>{item.label}</button>
          ) : (
            <strong>{item.label}</strong>
          )}
        </span>
      ))}
    </nav>
  );
}

export function WikiWorkspace({
  world,
  assets,
  categories,
  entities,
  maps,
  markers,
  quests,
  referenceIndex,
  relations,
  settingsOpenToken,
  templates,
  timelineEvents,
  timelineTracks,
  getAssetUrl,
  onOpenEditorReference,
  onExportOfflineWiki,
  onReturnToEditor,
  onUpdateWorld
}: WikiWorkspaceProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [audience, setAudience] = useState<WikiAudience>("author");
  const [page, setPage] = useState<WikiPage>({ kind: "home" });
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsCategoryQuery, setSettingsCategoryQuery] = useState("");
  const [settingsEntityQuery, setSettingsEntityQuery] = useState("");
  const [visibleCategoryEntityLimit, setVisibleCategoryEntityLimit] = useState(80);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportNotice, setExportNotice] = useState("");
  const [referenceHover, setReferenceHover] = useState<WikiReferenceHover | null>(null);
  const settings = useMemo(() => normalizeWorldWikiSettings(world.wiki), [world.wiki]);

  useEffect(() => {
    setAudience("author");
    setPage({ kind: "home" });
    setQuery("");
    setSettingsOpen(false);
    setExportBusy(false);
    setExportNotice("");
    setReferenceHover(null);
  }, [world.id]);

  useEffect(() => {
    if (settingsOpenToken > 0) setSettingsOpen(true);
  }, [settingsOpenToken]);

  useEffect(() => {
    setVisibleCategoryEntityLimit(80);
    setReferenceHover(null);
    viewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const worldAccessible = canViewWikiWorld(world.visibility, audience);
  const visibleEntities = useMemo(
    () => getVisibleWikiEntities(entities, audience),
    [audience, entities]
  );
  const visibleEntityById = useMemo(
    () => new Map(visibleEntities.map((entity) => [entity.id, entity])),
    [visibleEntities]
  );
  const restrictedEntityTitles = useMemo(
    () => entities.filter((entity) => !visibleEntityById.has(entity.id)).map((entity) => entity.title),
    [entities, visibleEntityById]
  );
  const visibleMaps = useMemo(
    () => maps.filter((item) => isWikiResourceVisible(item.id, settings.publishedMapIds, audience)),
    [audience, maps, settings.publishedMapIds]
  );
  const visibleTracks = useMemo(
    () => timelineTracks.filter((item) => isWikiResourceVisible(item.id, settings.publishedTimelineTrackIds, audience)),
    [audience, settings.publishedTimelineTrackIds, timelineTracks]
  );
  const visibleTrackIds = useMemo(() => new Set(visibleTracks.map((track) => track.id)), [visibleTracks]);
  const visibleQuests = useMemo(
    () => quests.filter((item) => isWikiResourceVisible(item.id, settings.publishedQuestIds, audience)),
    [audience, quests, settings.publishedQuestIds]
  );
  const visibleQuestById = useMemo(
    () => new Map(visibleQuests.map((quest) => [quest.id, quest])),
    [visibleQuests]
  );
  const visibleTimelineEvents = useMemo(
    () => timelineEvents.filter((event) => {
      if (!visibleTrackIds.has(event.trackId)) return false;
      if (event.entityId && !visibleEntityById.has(event.entityId)) return false;
      if (event.questId && !visibleQuestById.has(event.questId)) return false;
      return true;
    }),
    [timelineEvents, visibleEntityById, visibleQuestById, visibleTrackIds]
  );
  const visibleReferenceKeys = useMemo(() => {
    const keys = new Set<string>();
    visibleEntities.forEach((entity) => keys.add(`entity:${entity.id}`));
    visibleMaps.forEach((mapItem) => keys.add(`map:${mapItem.id}`));
    visibleQuests.forEach((quest) => keys.add(`quest:${quest.id}`));
    visibleTracks.forEach((track) => keys.add(`timeline-track:${track.id}`));
    visibleTimelineEvents.forEach((event) => keys.add(`timeline-event:${event.id}`));
    return keys;
  }, [visibleEntities, visibleMaps, visibleQuests, visibleTimelineEvents, visibleTracks]);
  const categoryCounts = useMemo(
    () => buildWikiCategoryCounts(categories, visibleEntities),
    [categories, visibleEntities]
  );
  const navigationCategories = useMemo(
    () => getWikiNavigationCategories(categories, categoryCounts, settings.navigationCategoryIds),
    [categories, categoryCounts, settings.navigationCategoryIds]
  );
  const featuredEntities = useMemo(() => {
    const configured = settings.featuredEntityIds
      .map((id) => visibleEntityById.get(id))
      .filter((entity): entity is WikiEntity => Boolean(entity));
    if (configured.length) return configured.slice(0, 12);
    return [...visibleEntities]
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, 6);
  }, [settings.featuredEntityIds, visibleEntities, visibleEntityById]);
  const recentEntities = useMemo(
    () => [...visibleEntities].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).slice(0, 10),
    [visibleEntities]
  );
  const coverAsset = assets.find(
    (asset) => asset.id === settings.coverAssetId && asset.mimeType.startsWith("image/")
  );
  const imageAssets = assets.filter((asset) => asset.mimeType.startsWith("image/"));

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const getCategoryPath = (categoryId: string) => {
    const path: CodexCategory[] = [];
    const visited = new Set<string>();
    let current = categoryById.get(categoryId);
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      path.unshift(current);
      current = categoryById.get(current.parentId);
    }
    return path;
  };

  const openPage = (nextPage: WikiPage) => {
    setPage(nextPage);
    if (nextPage.kind !== "search") setQuery("");
  };

  const openEntity = (id: string) => {
    if (visibleEntityById.has(id)) openPage({ kind: "entity", id });
  };

  const openReference = (kind: string, id: string) => {
    if (kind === "entity" && visibleEntityById.has(id)) {
      openEntity(id);
      return;
    }
    if (kind === "map" && visibleMaps.some((item) => item.id === id)) {
      openPage({ kind: "map", id });
      return;
    }
    if (kind === "quest" && visibleQuestById.has(id)) {
      openPage({ kind: "quest", id });
      return;
    }
    if (kind === "timeline-track" && visibleTrackIds.has(id)) {
      openPage({ kind: "timeline", id });
      return;
    }
    if (kind === "timeline-event") {
      const event = visibleTimelineEvents.find((item) => item.id === id);
      if (event) openPage({ kind: "timeline", id: event.trackId, eventId: event.id });
      return;
    }
    if (audience === "author") {
      onOpenEditorReference({ kind: kind as ProjectObjectRef["kind"], id });
    }
  };

  const handleRichTextClick = (event: ReactMouseEvent<HTMLElement>) => {
    const link = (event.target as HTMLElement).closest<HTMLElement>("[data-wiki-reference-kind][data-wiki-reference-id]");
    if (!link) return;
    event.preventDefault();
    setReferenceHover(null);
    openReference(link.dataset.wikiReferenceKind || "", link.dataset.wikiReferenceId || "");
  };

  const moveReferenceHover = (event: ReactMouseEvent<HTMLElement>) => {
    const link = (event.target as HTMLElement).closest<HTMLElement>("[data-wiki-reference-kind][data-wiki-reference-id]");
    if (!link) {
      setReferenceHover(null);
      return;
    }
    const kind = link.dataset.wikiReferenceKind || "";
    const id = link.dataset.wikiReferenceId || "";
    if (!kind || !id) {
      setReferenceHover(null);
      return;
    }
    const cardWidth = 340;
    const cardHeight = 230;
    const margin = 14;
    const x = Math.min(event.clientX + 18, Math.max(margin, window.innerWidth - cardWidth - margin));
    const y = Math.min(event.clientY + 18, Math.max(margin, window.innerHeight - cardHeight - margin));
    setReferenceHover((current) => (
      current?.kind === kind && current.id === id && Math.abs(current.x - x) < 2 && Math.abs(current.y - y) < 2
        ? current
        : { kind, id, x, y }
    ));
  };

  const hoveredReferencePreview = useMemo(() => {
    if (!referenceHover) return null;
    if (referenceHover.kind === "entity") {
      const entity = visibleEntityById.get(referenceHover.id);
      if (!entity) return null;
      const categoryPath = getCategoryPath(entity.categoryId).map((item) => item.title).join(" / ");
      const image = assets.find((asset) =>
        asset.kind === "image"
        && asset.mimeType.startsWith("image/")
        && Boolean(asset.storedName)
        && asset.linkedEntityIds.includes(entity.id)
      );
      const excerpt = plainText(entity.content).slice(0, 180);
      return {
        title: entity.title,
        type: entityTypeLabels[entity.type],
        meta: categoryPath || audienceMeta[audience].label,
        summary: entity.summary || excerpt,
        excerpt: entity.summary ? excerpt : "",
        imageStoredName: image?.storedName || ""
      };
    }
    if (referenceHover.kind === "map") {
      const mapItem = visibleMaps.find((item) => item.id === referenceHover.id);
      if (!mapItem) return null;
      return {
        title: mapItem.title,
        type: "Map",
        meta: `${mapItem.width} x ${mapItem.height}`,
        summary: mapItem.description,
        excerpt: "",
        imageStoredName: ""
      };
    }
    if (referenceHover.kind === "quest") {
      const quest = visibleQuestById.get(referenceHover.id);
      if (!quest) return null;
      return {
        title: quest.title,
        type: questCategoryLabels[quest.category],
        meta: quest.status,
        summary: quest.summary || quest.trigger,
        excerpt: quest.steps.slice(0, 2).map((step) => step.title || step.objective).filter(Boolean).join(" / "),
        imageStoredName: ""
      };
    }
    if (referenceHover.kind === "timeline-track") {
      const track = visibleTracks.find((item) => item.id === referenceHover.id);
      if (!track) return null;
      const count = visibleTimelineEvents.filter((event) => event.trackId === track.id).length;
      return {
        title: track.name,
        type: "Timeline",
        meta: `${count} events`,
        summary: track.description,
        excerpt: "",
        imageStoredName: ""
      };
    }
    if (referenceHover.kind === "timeline-event") {
      const event = visibleTimelineEvents.find((item) => item.id === referenceHover.id);
      if (!event) return null;
      return {
        title: event.title,
        type: event.displayDate || "Timeline event",
        meta: event.era,
        summary: event.summary,
        excerpt: "",
        imageStoredName: ""
      };
    }
    return null;
  }, [assets, audience, referenceHover, visibleEntityById, visibleMaps, visibleQuestById, visibleTimelineEvents, visibleTracks]);

  const updateSettings = (patch: Partial<WorldWikiSettings>) => {
    onUpdateWorld({ wiki: normalizeWorldWikiSettings({ ...settings, ...patch }) });
  };

  const searchResults = useMemo(() => {
    const normalized = normalizeWikiSearchText(deferredQuery);
    if (!normalized) return { entities: [] as WikiEntity[], categories: [] as CodexCategory[], maps: [] as WorldMap[], tracks: [] as TimelineTrack[], quests: [] as WikiQuest[] };
    return {
      entities: searchWikiEntities(visibleEntities, deferredQuery, 80),
      categories: categories.filter((category) =>
        (categoryCounts.get(category.id) || 0) > 0 &&
        normalizeWikiSearchText(`${category.title} ${category.description}`).includes(normalized)
      ).slice(0, 20),
      maps: visibleMaps.filter((item) => normalizeWikiSearchText(`${item.title} ${item.description}`).includes(normalized)).slice(0, 20),
      tracks: visibleTracks.filter((item) => normalizeWikiSearchText(`${item.name} ${item.description}`).includes(normalized)).slice(0, 20),
      quests: visibleQuests.filter((item) => normalizeWikiSearchText(`${item.title} ${item.summary} ${item.trigger}`).includes(normalized)).slice(0, 20)
    };
  }, [categories, categoryCounts, deferredQuery, visibleEntities, visibleMaps, visibleQuests, visibleTracks]);
  const searchResultCount = Object.values(searchResults).reduce((count, items) => count + items.length, 0);

  const renderEntityList = (items: WikiEntity[], emptyText = "这个目录还没有可见文章。") => (
    items.length ? (
      <div className="wiki-entry-list">
        {items.map((entity) => (
          <button className="wiki-entry-row" key={entity.id} type="button" onClick={() => openEntity(entity.id)}>
            <span className={`wiki-entry-type is-${entity.type}`}>{entityTypeLabels[entity.type]}</span>
            <span className="wiki-entry-copy">
              <strong>{entity.title}</strong>
              <small>{entity.summary || "暂无摘要"}</small>
            </span>
            <span className="wiki-entry-date">{formatDate(entity.updatedAt)}</span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
    ) : <p className="wiki-empty-copy">{emptyText}</p>
  );

  const renderHome = () => {
    const worldMark = Array.from(world.name.trim())[0] || "W";
    const openingEntity = featuredEntities[0] ?? recentEntities[0];

    return (
      <div className="wiki-home">
        <section className={`wiki-world-intro ${coverAsset ? "has-cover" : "no-cover"}`}>
          {coverAsset ? <img alt="" src={getAssetUrl(coverAsset.storedName)} /> : (
            <span aria-hidden="true" className="wiki-world-intro-mark">{worldMark}</span>
          )}
          <div className="wiki-world-intro-copy">
            <span>世界档案</span>
            <h1>{world.name}</h1>
            <p>{world.description || "这个世界还没有简介。作者可以在总览设置中补充阅读入口。"}</p>
            <div className="wiki-world-intro-actions">
              <button type="button" onClick={() => document.getElementById("wiki-directory")?.scrollIntoView({ behavior: "smooth" })}>
                <BookOpen size={16} />
                <span>浏览世界目录</span>
              </button>
              {openingEntity ? (
                <button type="button" onClick={() => openEntity(openingEntity.id)}>
                  <FileText size={16} />
                  <span>阅读第一篇</span>
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="wiki-stat-band" aria-label="世界内容统计">
          <span><strong>{visibleEntities.length}</strong> 篇文章</span>
          <span><strong>{navigationCategories.length}</strong> 个主目录</span>
          <span><strong>{visibleMaps.length}</strong> 张地图</span>
          <span><strong>{visibleTimelineEvents.length}</strong> 个历史节点</span>
          <span><strong>{visibleQuests.length}</strong> 条任务线</span>
        </section>

        <div className="wiki-home-columns">
          <main className="wiki-home-primary">
            <section className="wiki-home-section" id="wiki-directory">
              <div className="wiki-section-heading">
                <div>
                  <span>World Codex</span>
                  <h2>世界目录</h2>
                </div>
                <p>沿分类进入人物、地点、阵营与历史，子目录会随设定内容自动整理。</p>
              </div>
              <div className="wiki-directory-grid">
                {navigationCategories.map((category) => {
                  const children = categories
                    .filter((item) => item.parentId === category.id && (categoryCounts.get(item.id) || 0) > 0)
                    .sort((left, right) => left.order - right.order)
                    .slice(0, 5);
                  return (
                    <article className="wiki-directory-item" key={category.id} style={{ "--category-accent": category.color } as CSSProperties}>
                      <button type="button" onClick={() => openPage({ kind: "category", id: category.id })}>
                        <span className="wiki-directory-icon"><FolderTree size={20} /></span>
                        <span>
                          <strong>{category.title}</strong>
                          <small>{categoryCounts.get(category.id) || 0} 篇</small>
                        </span>
                        <ChevronRight size={17} />
                      </button>
                      {category.description ? <p>{category.description}</p> : null}
                      {children.length ? (
                        <div className="wiki-subcategory-links">
                          {children.map((child) => (
                            <button key={child.id} type="button" onClick={() => openPage({ kind: "category", id: child.id })}>
                              {child.title}<span>{categoryCounts.get(child.id) || 0}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="wiki-home-section wiki-featured-section">
              <div className="wiki-section-heading compact">
                <div><span>编辑推荐</span><h2>精选条目</h2></div>
              </div>
              {renderEntityList(featuredEntities)}
            </section>
          </main>

          <aside className="wiki-home-secondary">
            <section className="wiki-home-section">
              <div className="wiki-section-heading compact">
                <div><span>最新内容</span><h2>最近更新</h2></div>
              </div>
              {renderEntityList(recentEntities)}
            </section>

            <section className="wiki-home-section wiki-explore-section">
              <div className="wiki-section-heading compact">
                <div><span>探索</span><h2>继续了解</h2></div>
              </div>
              <div className="wiki-explore-grid">
                <div>
                  <h3><MapIcon size={18} /> 地图</h3>
                  {visibleMaps.length ? visibleMaps.slice(0, 6).map((mapItem) => (
                    <button key={mapItem.id} type="button" onClick={() => openPage({ kind: "map", id: mapItem.id })}>
                      <span>{mapItem.title}</span><ChevronRight size={15} />
                    </button>
                  )) : <p>暂无可见地图</p>}
                </div>
                <div>
                  <h3><CalendarDays size={18} /> 时间线</h3>
                  {visibleTracks.length ? visibleTracks.slice(0, 6).map((track) => (
                    <button key={track.id} type="button" onClick={() => openPage({ kind: "timeline", id: track.id })}>
                      <span>{track.name}</span><ChevronRight size={15} />
                    </button>
                  )) : <p>暂无可见时间线</p>}
                </div>
                <div>
                  <h3><Route size={18} /> 任务线</h3>
                  {visibleQuests.length ? visibleQuests.slice(0, 6).map((quest) => (
                    <button key={quest.id} type="button" onClick={() => openPage({ kind: "quest", id: quest.id })}>
                      <span>{quest.title}</span><ChevronRight size={15} />
                    </button>
                  )) : <p>暂无可见任务</p>}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    );
  };

  const renderCategory = (categoryId: string) => {
    const category = categoryById.get(categoryId);
    if (!category) return renderMissing("目录不存在或已被删除");
    const descendants = getWikiCategoryDescendantIds(categories, categoryId);
    const categoryEntities = visibleEntities
      .filter((entity) => entity.categoryId === categoryId || descendants.has(entity.categoryId))
      .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN"));
    const children = categories
      .filter((item) => item.parentId === categoryId && (categoryCounts.get(item.id) || 0) > 0)
      .sort((left, right) => left.order - right.order);
    const path = getCategoryPath(categoryId);
    return (
      <div className="wiki-reading-page wiki-category-page">
        <WikiBreadcrumbs
          onHome={() => openPage({ kind: "home" })}
          items={path.map((item, index) => ({
            id: item.id,
            label: item.title,
            onClick: index < path.length - 1 ? () => openPage({ kind: "category", id: item.id }) : undefined
          }))}
        />
        <header className="wiki-page-heading">
          <span className="wiki-page-kicker">设定目录</span>
          <h1>{category.title}</h1>
          <p>{category.description || `收录 ${categoryCounts.get(category.id) || 0} 篇世界设定文章。`}</p>
        </header>
        {children.length ? (
          <section className="wiki-child-category-list">
            <h2>子目录</h2>
            <div>
              {children.map((child) => (
                <button key={child.id} type="button" onClick={() => openPage({ kind: "category", id: child.id })}>
                  <FolderTree size={18} />
                  <span><strong>{child.title}</strong><small>{categoryCounts.get(child.id) || 0} 篇</small></span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </section>
        ) : null}
        <section className="wiki-category-entries">
          <div className="wiki-list-heading">
            <h2>全部文章</h2>
            <span>{categoryEntities.length} 篇</span>
          </div>
          {renderEntityList(categoryEntities.slice(0, visibleCategoryEntityLimit))}
          {categoryEntities.length > visibleCategoryEntityLimit ? (
            <button className="wiki-load-more" type="button" onClick={() => setVisibleCategoryEntityLimit((current) => current + 80)}>
              再显示 {Math.min(80, categoryEntities.length - visibleCategoryEntityLimit)} 篇
            </button>
          ) : null}
        </section>
      </div>
    );
  };

  const renderEntity = (entityId: string) => {
    const entity = visibleEntityById.get(entityId);
    if (!entity) return renderMissing("这篇文章对当前身份不可见，或已经被删除");
    const primaryIllustration = assets.find((asset) =>
      asset.kind === "image"
      && asset.mimeType.startsWith("image/")
      && Boolean(asset.storedName)
      && asset.linkedEntityIds.includes(entity.id)
    );
    const template = templates.find((item) => item.id === entity.templateId);
    const fields = (template?.fields || [])
      .filter((field) => audience === "author" || !field.secret)
      .sort((left, right) => left.order - right.order)
      .map((field) => ({ field, value: entity.templateData[field.key]?.trim() || "" }))
      .filter(({ field, value }) => {
        if (!value) return false;
        if (field.type !== "entity_ref") return true;
        return visibleEntityById.has(value);
      });
    const categoryPath = getCategoryPath(entity.categoryId);
    const relatedIds = getWikiRelatedEntityIds({
      entity,
      visibleEntities,
      relations,
      referenceIndex,
      limit: 8
    });
    const backlinks = referenceIndex.references.filter(
      (reference) =>
        reference.target.kind === "entity" &&
        reference.target.id === entity.id &&
        reference.source.kind === "entity" &&
        visibleEntityById.has(reference.source.id)
    );
    const content = sanitizeWikiRichText(entity.content, {
      audience,
      visibleEntities,
      restrictedEntityTitles,
      visibleReferenceKeys
    });
    const outline = [...content.matchAll(/<h([2-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match, index) => ({
      index,
      level: Number(match[1]),
      title: plainText(match[2]) || `小节 ${index + 1}`
    }));
    return (
      <div className="wiki-reading-page wiki-article-page">
        <WikiBreadcrumbs
          onHome={() => openPage({ kind: "home" })}
          items={[
            ...categoryPath.map((category) => ({
              id: category.id,
              label: category.title,
              onClick: () => openPage({ kind: "category", id: category.id })
            })),
            { id: entity.id, label: entity.title }
          ]}
        />
        <div className="wiki-article-layout">
          <article className="wiki-article">
            <header className={`wiki-article-header ${primaryIllustration ? "has-illustration" : ""}`}>
              <div className="wiki-article-heading-copy">
                <span className={`wiki-entry-type is-${entity.type}`}>{entityTypeLabels[entity.type]}</span>
                <h1>{entity.title}</h1>
                {entity.summary ? <p>{entity.summary}</p> : null}
                <div className="wiki-article-meta">
                  <span><Clock3 size={14} /> 更新于 {formatDate(entity.updatedAt)}</span>
                  <span><Eye size={14} /> {audienceMeta[audience].label}视图</span>
                </div>
              </div>
              {primaryIllustration ? (
                <figure className="wiki-article-illustration" title={primaryIllustration.name}>
                  <img
                    alt={`${entity.title}条目插图`}
                    loading="lazy"
                    src={getAssetUrl(primaryIllustration.storedName)}
                  />
                </figure>
              ) : null}
            </header>

            {fields.length ? (
              <section className="wiki-fact-sheet" aria-label="条目资料">
                <h2>条目资料</h2>
                <dl>
                  {fields.map(({ field, value }) => {
                    const linkedEntity = field.type === "entity_ref" ? visibleEntityById.get(value) : null;
                    return (
                      <div key={field.id}>
                        <dt>{field.label}</dt>
                        <dd>
                          {linkedEntity ? (
                            <button type="button" onClick={() => openEntity(linkedEntity.id)}>{linkedEntity.title}</button>
                          ) : field.type === "boolean" ? (
                            value === "true" ? "是" : "否"
                          ) : value}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </section>
            ) : null}

            <section
              className="wiki-rich-content"
              onClick={handleRichTextClick}
              onMouseLeave={() => setReferenceHover(null)}
              onMouseMove={moveReferenceHover}
              dangerouslySetInnerHTML={{ __html: content || "<p>这篇文章还没有正文。</p>" }}
            />

            {entity.tags.length ? (
              <footer className="wiki-article-tags">
                <Tags size={16} />
                {entity.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </footer>
            ) : null}

            {backlinks.length || relatedIds.length ? (
              <section className="wiki-related-section">
                {backlinks.length ? (
                  <div>
                    <h2>引用这篇文章</h2>
                    {[...new Map(backlinks.map((reference) => [reference.source.id, reference])).values()].slice(0, 12).map((reference) => (
                      <button key={reference.source.id} type="button" onClick={() => openEntity(reference.source.id)}>
                        <span>{reference.sourceLabel}</span><ChevronRight size={15} />
                      </button>
                    ))}
                  </div>
                ) : null}
                {relatedIds.length ? (
                  <div>
                    <h2>相关文章</h2>
                    {relatedIds.map((id) => {
                      const related = visibleEntityById.get(id);
                      return related ? (
                        <button key={id} type="button" onClick={() => openEntity(id)}>
                          <span>{related.title}</span><ChevronRight size={15} />
                        </button>
                      ) : null;
                    })}
                  </div>
                ) : null}
              </section>
            ) : null}
          </article>

          <aside className="wiki-article-aside">
            {audience === "author" ? (
              <button className="wiki-edit-target" type="button" onClick={() => onOpenEditorReference({ kind: "entity", id: entity.id })}>
                <Pencil size={16} /> 编辑这篇文章
              </button>
            ) : null}
            {outline.length ? (
              <nav aria-label="文章目录" className="wiki-on-this-page">
                <strong>本页目录</strong>
                {outline.map((heading) => (
                  <button
                    className={heading.level === 3 ? "is-subheading" : ""}
                    key={`${heading.title}:${heading.index}`}
                    type="button"
                    onClick={() => document.querySelectorAll(".wiki-rich-content h2, .wiki-rich-content h3")[heading.index]?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  >
                    {heading.title}
                  </button>
                ))}
              </nav>
            ) : null}
            <div className="wiki-article-facts">
              <strong>文章信息</strong>
              <span>类型 <b>{entityTypeLabels[entity.type]}</b></span>
              <span>目录 <b>{categoryPath.at(-1)?.title || "未归档"}</b></span>
              <span>可见性 <b>{entity.visibility === "public" ? "公开" : entity.visibility === "shared" ? "成员可见" : entity.visibility === "secret" ? "秘密" : "私密"}</b></span>
            </div>
          </aside>
        </div>
      </div>
    );
  };

  const renderMap = (mapId: string) => {
    const mapItem = visibleMaps.find((item) => item.id === mapId) || visibleMaps[0];
    if (!mapItem) return renderMissing("当前身份没有可浏览的地图");
    const mapMarkers = markers.filter((marker) => {
      if (marker.mapId !== mapItem.id) return false;
      if (marker.entityId && !visibleEntityById.has(marker.entityId)) return false;
      if (marker.questId && !visibleQuestById.has(marker.questId)) return false;
      return true;
    });
    const childMaps = visibleMaps.filter((item) => item.parentMapId === mapItem.id);
    return (
      <div className="wiki-reading-page wiki-map-page">
        <WikiBreadcrumbs onHome={() => openPage({ kind: "home" })} items={[{ id: mapItem.id, label: mapItem.title }]} />
        <header className="wiki-page-heading with-action">
          <div><span className="wiki-page-kicker">世界地图</span><h1>{mapItem.title}</h1><p>{mapItem.description || "这张地图还没有说明。"}</p></div>
          {audience === "author" ? <button type="button" onClick={() => onOpenEditorReference({ kind: "map", id: mapItem.id })}><Pencil size={16} /> 编辑地图</button> : null}
        </header>
        <div className="wiki-map-viewer" style={{ aspectRatio: `${Math.max(1, mapItem.width)} / ${Math.max(1, mapItem.height)}` }}>
          {mapItem.imageUrl ? <img alt={mapItem.title} src={mapItem.imageUrl} /> : <div className="wiki-map-placeholder"><MapIcon size={42} /><span>地图尚未设置底图</span></div>}
          {mapMarkers.map((marker) => (
            <button
              aria-label={marker.label}
              className="wiki-map-marker"
              key={marker.id}
              style={{ left: `${clampPercent(marker.x)}%`, top: `${clampPercent(marker.y)}%`, "--marker-color": marker.color } as CSSProperties}
              title={marker.description || marker.label}
              type="button"
              onClick={() => marker.entityId ? openEntity(marker.entityId) : marker.questId ? openPage({ kind: "quest", id: marker.questId }) : undefined}
            >
              <MapPin size={16} /><span>{marker.label}</span>
            </button>
          ))}
        </div>
        <section className="wiki-map-index">
          <div><h2>地图标记</h2><span>{mapMarkers.length} 个</span></div>
          {mapMarkers.length ? mapMarkers.map((marker) => (
            <button key={marker.id} type="button" onClick={() => marker.entityId ? openEntity(marker.entityId) : marker.questId ? openPage({ kind: "quest", id: marker.questId }) : undefined}>
              <MapPin size={16} style={{ color: marker.color }} /><span><strong>{marker.label}</strong><small>{marker.description || "暂无说明"}</small></span><ChevronRight size={15} />
            </button>
          )) : <p className="wiki-empty-copy">这张地图还没有可见标记。</p>}
        </section>
        {childMaps.length ? <section className="wiki-map-children"><h2>子地图</h2>{childMaps.map((item) => <button key={item.id} type="button" onClick={() => openPage({ kind: "map", id: item.id })}><MapIcon size={17} /><span>{item.title}</span><ChevronRight size={15} /></button>)}</section> : null}
      </div>
    );
  };

  const renderTimeline = (trackId: string, eventId?: string) => {
    const track = visibleTracks.find((item) => item.id === trackId) || visibleTracks[0];
    if (!track) return renderMissing("当前身份没有可浏览的时间线");
    const events = visibleTimelineEvents.filter((event) => event.trackId === track.id);
    return (
      <div className="wiki-reading-page wiki-timeline-page">
        <WikiBreadcrumbs onHome={() => openPage({ kind: "home" })} items={[{ id: track.id, label: track.name }]} />
        <header className="wiki-page-heading with-action">
          <div><span className="wiki-page-kicker">历史时间线</span><h1>{track.name}</h1><p>{track.description || `共收录 ${events.length} 个历史节点。`}</p></div>
          {audience === "author" ? <button type="button" onClick={() => onOpenEditorReference({ kind: "timeline-track", id: track.id })}><Pencil size={16} /> 编辑时间线</button> : null}
        </header>
        {visibleTracks.length > 1 ? <nav className="wiki-resource-tabs" aria-label="时间线列表">{visibleTracks.map((item) => <button className={item.id === track.id ? "is-active" : ""} key={item.id} type="button" onClick={() => openPage({ kind: "timeline", id: item.id })}>{item.name}</button>)}</nav> : null}
        <section className="wiki-timeline-list">
          {events.length ? events.map((event) => (
            <article className={event.id === eventId ? "is-focused" : ""} key={event.id} style={{ "--timeline-color": track.color } as CSSProperties}>
              <div className="wiki-timeline-date"><strong>{event.displayDate || "时间未知"}</strong><span>{event.era}</span></div>
              <div className="wiki-timeline-copy"><h2>{event.title}</h2><p>{event.summary || "暂无事件摘要。"}</p><div>{event.entityId && visibleEntityById.has(event.entityId) ? <button type="button" onClick={() => openEntity(event.entityId)}><FileText size={14} /> {visibleEntityById.get(event.entityId)?.title}</button> : null}{event.questId && visibleQuestById.has(event.questId) ? <button type="button" onClick={() => openPage({ kind: "quest", id: event.questId })}><Route size={14} /> {visibleQuestById.get(event.questId)?.title}</button> : null}</div></div>
              {audience === "author" ? <button className="wiki-row-edit" aria-label={`编辑${event.title}`} type="button" onClick={() => onOpenEditorReference({ kind: "timeline-event", id: event.id })}><Pencil size={15} /></button> : null}
            </article>
          )) : <p className="wiki-empty-copy">这条时间线还没有可见事件。</p>}
        </section>
      </div>
    );
  };

  const renderQuest = (questId: string) => {
    const quest = visibleQuestById.get(questId);
    if (!quest) return renderMissing("这条任务线对当前身份不可见，或已经被删除");
    const relatedEntities = quest.relatedEntityIds.map((id) => visibleEntityById.get(id)).filter((entity): entity is WikiEntity => Boolean(entity));
    const prerequisites = quest.prerequisiteQuestIds.map((id) => visibleQuestById.get(id)).filter((item): item is WikiQuest => Boolean(item));
    return (
      <div className="wiki-reading-page wiki-quest-page">
        <WikiBreadcrumbs onHome={() => openPage({ kind: "home" })} items={[{ id: quest.id, label: quest.title }]} />
        <header className="wiki-page-heading with-action">
          <div><span className="wiki-page-kicker">{questCategoryLabels[quest.category]}</span><h1>{quest.title}</h1><p>{quest.summary || "这条任务线还没有摘要。"}</p></div>
          {audience === "author" ? <button type="button" onClick={() => onOpenEditorReference({ kind: "quest", id: quest.id })}><Pencil size={16} /> 编辑任务</button> : null}
        </header>
        <section className="wiki-quest-overview">
          <div><strong>触发条件</strong><p>{quest.trigger || "尚未设置"}</p></div>
          <div><strong>任务状态</strong><p>{quest.status === "draft" ? "草稿" : quest.status === "active" ? "进行中" : quest.status === "implemented" ? "已实现" : "已移除"}</p></div>
        </section>
        {prerequisites.length ? <section className="wiki-quest-links"><h2>前置任务</h2>{prerequisites.map((item) => <button key={item.id} type="button" onClick={() => openPage({ kind: "quest", id: item.id })}><Route size={16} /><span>{item.title}</span><ChevronRight size={15} /></button>)}</section> : null}
        <section className="wiki-quest-steps"><div className="wiki-list-heading"><h2>任务步骤</h2><span>{quest.steps.length} 步</span></div>{quest.steps.length ? <ol>{quest.steps.map((step, index) => <li key={step.id}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title || `步骤 ${index + 1}`}</h3>{step.objective ? <p>{step.objective}</p> : null}<dl>{step.condition ? <div><dt>条件</dt><dd>{step.condition}</dd></div> : null}{step.branch ? <div><dt>分支</dt><dd>{step.branch}</dd></div> : null}{step.failure ? <div><dt>失败</dt><dd>{step.failure}</dd></div> : null}{step.reward ? <div><dt>奖励</dt><dd>{step.reward}</dd></div> : null}{audience === "author" && step.notes ? <div><dt>开发备注</dt><dd>{step.notes}</dd></div> : null}</dl></div></li>)}</ol> : <p className="wiki-empty-copy">这条任务还没有步骤。</p>}</section>
        {relatedEntities.length ? <section className="wiki-quest-links"><h2>相关条目</h2>{relatedEntities.map((entity) => <button key={entity.id} type="button" onClick={() => openEntity(entity.id)}><FileText size={16} /><span>{entity.title}</span><ChevronRight size={15} /></button>)}</section> : null}
        {audience === "author" && quest.developerNotes ? <section className="wiki-author-only-note"><LockKeyhole size={17} /><div><strong>仅作者可见</strong><p>{quest.developerNotes}</p></div></section> : null}
      </div>
    );
  };

  const renderSearch = () => (
    <div className="wiki-reading-page wiki-search-page">
      <WikiBreadcrumbs onHome={() => openPage({ kind: "home" })} items={[{ id: "search", label: "搜索" }]} />
      <header className="wiki-page-heading"><span className="wiki-page-kicker">全文检索</span><h1>{deferredQuery ? `“${deferredQuery}”的搜索结果` : "搜索世界 Wiki"}</h1><p>{deferredQuery ? `找到 ${searchResultCount} 个可见结果。搜索范围已按照当前预览身份过滤。` : "输入文章、人物、地点、地图或任务名称。"}</p></header>
      {searchResults.categories.length ? <section className="wiki-search-group"><h2>目录</h2>{searchResults.categories.map((category) => <button key={category.id} type="button" onClick={() => openPage({ kind: "category", id: category.id })}><FolderTree size={17} /><span><strong>{category.title}</strong><small>{categoryCounts.get(category.id) || 0} 篇</small></span><ChevronRight size={15} /></button>)}</section> : null}
      {searchResults.entities.length ? <section className="wiki-search-group"><h2>文章</h2>{renderEntityList(searchResults.entities)}</section> : null}
      {searchResults.maps.length ? <section className="wiki-search-group"><h2>地图</h2>{searchResults.maps.map((item) => <button key={item.id} type="button" onClick={() => openPage({ kind: "map", id: item.id })}><MapIcon size={17} /><span><strong>{item.title}</strong><small>{item.description || "世界地图"}</small></span><ChevronRight size={15} /></button>)}</section> : null}
      {searchResults.tracks.length ? <section className="wiki-search-group"><h2>时间线</h2>{searchResults.tracks.map((item) => <button key={item.id} type="button" onClick={() => openPage({ kind: "timeline", id: item.id })}><CalendarDays size={17} /><span><strong>{item.name}</strong><small>{item.description || "历史时间线"}</small></span><ChevronRight size={15} /></button>)}</section> : null}
      {searchResults.quests.length ? <section className="wiki-search-group"><h2>任务线</h2>{searchResults.quests.map((item) => <button key={item.id} type="button" onClick={() => openPage({ kind: "quest", id: item.id })}><Route size={17} /><span><strong>{item.title}</strong><small>{item.summary || questCategoryLabels[item.category]}</small></span><ChevronRight size={15} /></button>)}</section> : null}
      {deferredQuery && !searchResultCount ? <div className="wiki-no-results"><Search size={28} /><strong>没有匹配的可见内容</strong><p>可以尝试标题、标签、摘要中的其他关键词。</p></div> : null}
    </div>
  );

  function renderMissing(message: string) {
    return <div className="wiki-missing-page"><FileText size={34} /><h1>无法打开</h1><p>{message}</p><button type="button" onClick={() => openPage({ kind: "home" })}><ArrowLeft size={16} /> 返回世界首页</button></div>;
  }

  const renderCurrentPage = () => {
    if (page.kind === "home") return renderHome();
    if (page.kind === "category") return renderCategory(page.id);
    if (page.kind === "entity") return renderEntity(page.id);
    if (page.kind === "map") return renderMap(page.id);
    if (page.kind === "timeline") return renderTimeline(page.id, page.eventId);
    if (page.kind === "quest") return renderQuest(page.id);
    return renderSearch();
  };

  const filteredSettingsCategories = categories.filter((category) =>
    !settingsCategoryQuery || normalizeWikiSearchText(`${category.title} ${category.description}`).includes(normalizeWikiSearchText(settingsCategoryQuery))
  );
  const filteredSettingsEntities = entities.filter((entity) =>
    !settingsEntityQuery || normalizeWikiSearchText(`${entity.title} ${entity.tags.join(" ")}`).includes(normalizeWikiSearchText(settingsEntityQuery))
  ).slice(0, 40);

  async function handleOfflineExport() {
    if (exportBusy || !worldAccessible) return;
    setExportBusy(true);
    setExportNotice(`正在导出${audienceMeta[audience].label}可见内容…`);
    try {
      const result = await onExportOfflineWiki(audience);
      if (result.canceled) {
        setExportNotice("");
      } else if (result.ok) {
        const missing = result.missingAssets?.length
          ? ` · ${result.missingAssets.length} 个图片未找到`
          : "";
        setExportNotice(`离线 Wiki 已导出 · ${result.entityCount ?? 0} 篇文章${missing}`);
      } else {
        setExportNotice(result.error || "离线 Wiki 导出失败");
      }
    } finally {
      setExportBusy(false);
    }
  }

  return (
    <section className="wiki-workspace" style={{ "--wiki-accent": settings.themeColor } as CSSProperties}>
      <header className="wiki-toolbar">
        <button className="wiki-world-home" type="button" onClick={() => openPage({ kind: "home" })}>
          <Globe2 size={19} /><span><strong>{world.name}</strong><small>世界 Wiki</small></span>
        </button>
        <nav className="wiki-toolbar-nav" aria-label="世界总览导航">
          <button className={page.kind === "home" ? "is-active" : ""} type="button" onClick={() => openPage({ kind: "home" })}>首页</button>
          <button type="button" onClick={() => openPage({ kind: "category", id: navigationCategories[0]?.id || categories[0]?.id || "" })}>目录</button>
          <button disabled={!visibleMaps.length} type="button" onClick={() => openPage({ kind: "map", id: visibleMaps.find((item) => item.id === settings.defaultMapId)?.id || visibleMaps[0]?.id || "" })}>地图</button>
          <button disabled={!visibleTracks.length} type="button" onClick={() => openPage({ kind: "timeline", id: visibleTracks[0]?.id || "" })}>历史</button>
        </nav>
        <label className="wiki-search-box">
          <Search size={16} />
          <input
            aria-label="搜索世界 Wiki"
            placeholder="搜索这个世界"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage({ kind: "search" });
            }}
            onFocus={() => setPage({ kind: "search" })}
          />
          {query ? <button aria-label="清空搜索" type="button" onClick={() => setQuery("")}><X size={14} /></button> : null}
        </label>
        <div className="wiki-audience-switch" aria-label="预览身份">
          {(Object.keys(audienceMeta) as WikiAudience[]).map((value) => (
            <button
              aria-label={audienceMeta[value].label}
              className={audience === value ? "is-active" : ""}
              key={value}
              title={audienceMeta[value].helper}
              type="button"
              onClick={() => { setAudience(value); setPage({ kind: "home" }); }}
            >
              {value === "author" ? <Pencil size={14} /> : value === "member" ? <UsersRound size={14} /> : <Eye size={14} />}
              <span>{audienceMeta[value].label}</span>
            </button>
          ))}
        </div>
        <div className="wiki-toolbar-actions">
          <button
            aria-label={`导出${audienceMeta[audience].label}离线 Wiki`}
            disabled={exportBusy || !worldAccessible}
            title={`导出${audienceMeta[audience].label}可见内容为离线 Wiki`}
            type="button"
            onClick={() => void handleOfflineExport()}
          >
            <Download className={exportBusy ? "is-spinning" : ""} size={18} />
          </button>
          {audience === "author" ? <button aria-label="Wiki 总览设置" title="Wiki 总览设置" type="button" onClick={() => setSettingsOpen(true)}><Settings2 size={18} /></button> : null}
          <button aria-label="返回编辑器" title="返回编辑器" type="button" onClick={onReturnToEditor}><Pencil size={18} /></button>
        </div>
      </header>

      {exportNotice ? <div aria-live="polite" className="wiki-export-notice" role="status">{exportNotice}</div> : null}

      <div className="wiki-viewport" ref={viewportRef}>
        {worldAccessible ? renderCurrentPage() : (
          <div className="wiki-access-gate">
            <ShieldCheck size={38} />
            <span>{audienceMeta[audience].label}预览</span>
            <h1>这个世界尚未向当前身份开放</h1>
            <p>{world.visibility === "private" ? "世界目前是私密状态，只有作者能够阅读。" : "世界目前仅向项目成员开放，公开访客无法查看内容。"}</p>
            <button type="button" onClick={() => setAudience("author")}><Pencil size={16} /> 返回作者视图</button>
          </div>
        )}
      </div>

      {referenceHover && hoveredReferencePreview ? (
        <aside
          aria-hidden="true"
          className="wiki-reference-card"
          style={{ left: referenceHover.x, top: referenceHover.y } as CSSProperties}
        >
          {hoveredReferencePreview.imageStoredName ? (
            <img alt="" src={getAssetUrl(hoveredReferencePreview.imageStoredName)} />
          ) : (
            <span className="wiki-reference-card-mark"><FileText size={18} /></span>
          )}
          <div>
            <span>{hoveredReferencePreview.type}</span>
            <strong>{hoveredReferencePreview.title}</strong>
            {hoveredReferencePreview.meta ? <small>{hoveredReferencePreview.meta}</small> : null}
            {hoveredReferencePreview.summary ? <p>{hoveredReferencePreview.summary}</p> : null}
            {hoveredReferencePreview.excerpt ? <p className="wiki-reference-card-excerpt">{hoveredReferencePreview.excerpt}</p> : null}
          </div>
        </aside>
      ) : null}

      {settingsOpen ? (
        <div className="wiki-settings-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
          <aside aria-label="Wiki 总览设置" className="wiki-settings-drawer">
            <header><div><span>世界总览</span><h2>Wiki 设置</h2></div><button aria-label="关闭设置" type="button" onClick={() => setSettingsOpen(false)}><X size={19} /></button></header>
            <div className="wiki-settings-body">
              <section>
                <h3>访问与介绍</h3>
                <label><span>世界可见性</span><select aria-label="世界可见性" value={world.visibility} onChange={(event) => onUpdateWorld({ visibility: event.target.value as WikiWorld["visibility"] })}><option value="private">私密，仅作者</option><option value="shared">成员可见</option><option value="public">公开访客可见</option></select></label>
                <label><span>世界介绍</span><textarea aria-label="世界介绍" rows={5} value={world.description} onChange={(event) => onUpdateWorld({ description: event.target.value })} /></label>
              </section>
              <section>
                <h3>外观</h3>
                <label><span>Wiki 封面</span><select aria-label="Wiki 封面" value={settings.coverAssetId} onChange={(event) => updateSettings({ coverAssetId: event.target.value })}><option value="">不使用封面</option>{imageAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
                {coverAsset ? <div className="wiki-settings-cover"><img alt="" src={getAssetUrl(coverAsset.storedName)} /><span>{coverAsset.name}</span></div> : null}
                <div className="wiki-theme-setting"><span>主题色</span><div>{themeSwatches.map((color) => <button aria-label={`使用主题色 ${color}`} className={settings.themeColor === color ? "is-active" : ""} key={color} style={{ backgroundColor: color }} type="button" onClick={() => updateSettings({ themeColor: color })}>{settings.themeColor === color ? <Check size={13} /> : null}</button>)}<input aria-label="自定义主题色" type="color" value={settings.themeColor} onChange={(event) => updateSettings({ themeColor: event.target.value })} /></div></div>
              </section>
              <section>
                <h3>首页导航目录</h3>
                <p>不选择时自动使用有内容的顶层目录。</p>
                <label className="wiki-settings-search"><Search size={15} /><input placeholder="筛选目录" value={settingsCategoryQuery} onChange={(event) => setSettingsCategoryQuery(event.target.value)} /></label>
                <div className="wiki-settings-checklist">{filteredSettingsCategories.map((category) => <label key={category.id}><input checked={settings.navigationCategoryIds.includes(category.id)} type="checkbox" onChange={() => updateSettings({ navigationCategoryIds: toggleId(settings.navigationCategoryIds, category.id) })} /><span>{getCategoryPath(category.id).map((item) => item.title).join(" / ")}</span><small>{categoryCounts.get(category.id) || 0}</small></label>)}</div>
              </section>
              <section>
                <h3>首页精选</h3>
                <p>最多在首页展示前 12 篇；未选择时自动显示最近更新。</p>
                {settings.featuredEntityIds.length ? <div className="wiki-selected-pills">{settings.featuredEntityIds.map((id) => { const entity = entities.find((item) => item.id === id); return entity ? <button key={id} type="button" onClick={() => updateSettings({ featuredEntityIds: settings.featuredEntityIds.filter((item) => item !== id) })}>{entity.title}<X size={12} /></button> : null; })}</div> : null}
                <label className="wiki-settings-search"><Search size={15} /><input placeholder="搜索条目" value={settingsEntityQuery} onChange={(event) => setSettingsEntityQuery(event.target.value)} /></label>
                {settingsEntityQuery ? <div className="wiki-settings-checklist">{filteredSettingsEntities.map((entity) => <label key={entity.id}><input checked={settings.featuredEntityIds.includes(entity.id)} disabled={!settings.featuredEntityIds.includes(entity.id) && settings.featuredEntityIds.length >= 12} type="checkbox" onChange={() => updateSettings({ featuredEntityIds: toggleId(settings.featuredEntityIds, entity.id).slice(0, 12) })} /><span>{entity.title}</span><small>{entityTypeLabels[entity.type]}</small></label>)}</div> : null}
              </section>
              <section>
                <h3>地图发布</h3>
                <label><span>默认地图</span><select aria-label="默认地图" value={settings.defaultMapId} onChange={(event) => updateSettings({ defaultMapId: event.target.value })}><option value="">自动选择第一张</option>{maps.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
                <div className="wiki-settings-checklist">{maps.map((item) => <label key={item.id}><input checked={settings.publishedMapIds.includes(item.id)} type="checkbox" onChange={() => updateSettings({ publishedMapIds: toggleId(settings.publishedMapIds, item.id) })} /><span>{item.title}</span><small>访客可见</small></label>)}</div>
              </section>
              <section>
                <h3>时间线发布</h3>
                <div className="wiki-settings-checklist">{timelineTracks.map((item) => <label key={item.id}><input checked={settings.publishedTimelineTrackIds.includes(item.id)} type="checkbox" onChange={() => updateSettings({ publishedTimelineTrackIds: toggleId(settings.publishedTimelineTrackIds, item.id) })} /><span>{item.name}</span><small>{timelineEvents.filter((event) => event.trackId === item.id).length} 事件</small></label>)}</div>
              </section>
              <section>
                <h3>任务发布</h3>
                <div className="wiki-settings-checklist">{quests.map((item) => <label key={item.id}><input checked={settings.publishedQuestIds.includes(item.id)} type="checkbox" onChange={() => updateSettings({ publishedQuestIds: toggleId(settings.publishedQuestIds, item.id) })} /><span>{item.title}</span><small>{questCategoryLabels[item.category]}</small></label>)}</div>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
