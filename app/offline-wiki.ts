import type { EntityTemplateDefinition } from "./entity-templates";
import type { MapMarker, TimelineEvent, TimelineTrack, WorldMap } from "./world-planning";
import {
  canViewWikiEntity,
  canViewWikiWorld,
  isWikiResourceVisible,
  normalizeWorldWikiSettings,
  sanitizeWikiRichText,
  type WikiAudience,
  type WikiVisibility,
  type WorldWikiSettings
} from "./wiki";

export type OfflineWikiPublication = {
  schemaVersion: 1;
  exportedAt: string;
  audience: WikiAudience;
  world: {
    id: string;
    name: string;
    description: string;
    visibility: Exclude<WikiVisibility, "secret">;
    themeColor: string;
    coverAssetId: string;
    featuredEntityIds: string[];
    navigationCategoryIds: string[];
    defaultMapId: string;
  };
  categories: Array<{
    id: string;
    parentId: string;
    title: string;
    description: string;
    order: number;
  }>;
  entities: Array<{
    id: string;
    type: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    tags: string[];
    categoryId: string;
    updatedAt: string;
    fields: Array<{ label: string; value: string }>;
  }>;
  quests: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    summary: string;
    trigger: string;
    relatedEntityIds: string[];
    steps: Array<{ id: string; title: string; objective: string; condition: string; branch: string; failure: string; reward: string }>;
    updatedAt: string;
  }>;
  maps: Array<{
    id: string;
    parentMapId: string;
    title: string;
    description: string;
    imageStoredName: string;
    markers: Array<{ id: string; label: string; description: string; x: number; y: number; entityId: string; questId: string }>;
    regions: Array<{ id: string; title: string; description: string; color: string; opacity: number; points: Array<{ x: number; y: number }> }>;
  }>;
  timelines: Array<{
    id: string;
    name: string;
    description: string;
    events: Array<{ id: string; title: string; summary: string; displayDate: string; entityId: string; questId: string }>;
  }>;
  relations: Array<{ id: string; sourceEntityId: string; targetEntityId: string; label: string; kind: string; strength: number }>;
  assets: Array<{ id: string; name: string; mimeType: string; storedName: string; linkedEntityIds: string[] }>;
};

export type OfflineWikiExportResult = {
  ok: boolean;
  canceled?: boolean;
  error?: string;
  outputDir?: string;
  entryFile?: string;
  entityCount?: number;
  questCount?: number;
  mapCount?: number;
  timelineCount?: number;
  assetCount?: number;
  missingAssets?: string[];
  files?: string[];
};

type OfflineWikiInput = {
  audience: WikiAudience;
  exportedAt?: string;
  world: {
    id: string;
    name: string;
    description: string;
    visibility: Exclude<WikiVisibility, "secret">;
    wiki?: Partial<WorldWikiSettings>;
  };
  categories: Array<{ id: string; parentId: string; title: string; description: string; order: number }>;
  entities: Array<{
    id: string;
    type: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    tags: string[];
    visibility: WikiVisibility;
    categoryId: string;
    templateId?: string;
    templateData: Record<string, string>;
    updatedAt: string;
  }>;
  templates: EntityTemplateDefinition[];
  quests: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    summary: string;
    trigger: string;
    relatedEntityIds: string[];
    steps: Array<{ id: string; title: string; objective: string; condition: string; branch: string; failure: string; reward: string }>;
    updatedAt: string;
  }>;
  maps: WorldMap[];
  markers: MapMarker[];
  timelineTracks: TimelineTrack[];
  timelineEvents: TimelineEvent[];
  relations: Array<{ id: string; sourceEntityId: string; targetEntityId: string; label: string; kind: string; strength: number }>;
  assets: Array<{ id: string; name: string; mimeType: string; storedName: string; linkedEntityIds: string[] }>;
};

function storedNameFromAssetUrl(value: string) {
  const match = String(value || "").match(/^worldcraft-asset:\/\/(.+)$/i);
  if (!match) return "";
  try {
    return decodeURIComponent(match[1]).replace(/^\/+/, "");
  } catch {
    return match[1].replace(/^\/+/, "");
  }
}

export function buildOfflineWikiPublication(input: OfflineWikiInput): OfflineWikiPublication {
  if (!canViewWikiWorld(input.world.visibility, input.audience)) {
    throw new Error("当前身份无权导出这个世界的 Wiki");
  }
  const settings = normalizeWorldWikiSettings(input.world.wiki);
  const entities = input.entities.filter((entity) => canViewWikiEntity(entity.visibility, input.audience));
  const entityIds = new Set(entities.map((entity) => entity.id));
  const restrictedTitles = input.entities.filter((entity) => !entityIds.has(entity.id)).map((entity) => entity.title);
  const maps = input.maps.filter((item) => isWikiResourceVisible(item.id, settings.publishedMapIds, input.audience));
  const mapIds = new Set(maps.map((item) => item.id));
  const quests = input.quests.filter((item) => isWikiResourceVisible(item.id, settings.publishedQuestIds, input.audience));
  const questIds = new Set(quests.map((item) => item.id));
  const tracks = input.timelineTracks.filter((item) => isWikiResourceVisible(item.id, settings.publishedTimelineTrackIds, input.audience));
  const trackIds = new Set(tracks.map((item) => item.id));
  const events = input.timelineEvents.filter(
    (event) => trackIds.has(event.trackId) && (!event.entityId || entityIds.has(event.entityId)) && (!event.questId || questIds.has(event.questId))
  );
  const visibleReferenceKeys = new Set<string>();
  entityIds.forEach((id) => visibleReferenceKeys.add(`entity:${id}`));
  questIds.forEach((id) => visibleReferenceKeys.add(`quest:${id}`));
  mapIds.forEach((id) => visibleReferenceKeys.add(`map:${id}`));
  tracks.forEach((track) => visibleReferenceKeys.add(`timeline-track:${track.id}`));
  events.forEach((event) => visibleReferenceKeys.add(`timeline-event:${event.id}`));

  const publicationEntities = entities.map((entity) => {
    const template = input.templates.find((item) => item.id === entity.templateId);
    const fields = (template?.fields || [])
      .filter((field) => input.audience === "author" || !field.secret)
      .map((field) => ({ label: field.label, value: entity.templateData[field.key] || "" }))
      .filter((field) => field.value.trim());
    return {
      id: entity.id,
      type: entity.type,
      title: entity.title,
      slug: entity.slug,
      summary: entity.summary,
      content: sanitizeWikiRichText(entity.content, {
        audience: input.audience,
        visibleEntities: entities,
        restrictedEntityTitles: restrictedTitles,
        visibleReferenceKeys
      }),
      tags: entity.tags,
      categoryId: entity.categoryId,
      updatedAt: entity.updatedAt,
      fields
    };
  });

  const requiredStoredNames = new Set(
    maps.map((item) => storedNameFromAssetUrl(item.imageUrl)).filter(Boolean)
  );
  const publicationAssets = input.assets.filter((asset) => {
    if (!asset.storedName || !asset.mimeType.startsWith("image/")) return false;
    if (asset.id === settings.coverAssetId || requiredStoredNames.has(asset.storedName)) return true;
    return asset.linkedEntityIds.some((id) => entityIds.has(id));
  });

  return {
    schemaVersion: 1,
    exportedAt: input.exportedAt || new Date().toISOString(),
    audience: input.audience,
    world: {
      id: input.world.id,
      name: input.world.name,
      description: input.world.description,
      visibility: input.world.visibility,
      themeColor: settings.themeColor,
      coverAssetId: settings.coverAssetId,
      featuredEntityIds: settings.featuredEntityIds.filter((id) => entityIds.has(id)),
      navigationCategoryIds: settings.navigationCategoryIds,
      defaultMapId: mapIds.has(settings.defaultMapId) ? settings.defaultMapId : maps[0]?.id || ""
    },
    categories: input.categories.map((category) => ({ ...category })),
    entities: publicationEntities,
    quests: quests.map((quest) => ({
      ...quest,
      relatedEntityIds: quest.relatedEntityIds.filter((id) => entityIds.has(id)),
      steps: quest.steps.map((step) => ({ ...step }))
    })),
    maps: maps.map((mapItem) => ({
      id: mapItem.id,
      parentMapId: mapIds.has(mapItem.parentMapId) ? mapItem.parentMapId : "",
      title: mapItem.title,
      description: mapItem.description,
      imageStoredName: storedNameFromAssetUrl(mapItem.imageUrl),
      markers: input.markers
        .filter((marker) => marker.mapId === mapItem.id)
        .filter((marker) => (!marker.entityId || entityIds.has(marker.entityId)) && (!marker.questId || questIds.has(marker.questId)))
        .map((marker) => ({
          id: marker.id,
          label: marker.label,
          description: marker.description,
          x: marker.x,
          y: marker.y,
          entityId: marker.entityId,
          questId: marker.questId
        })),
      regions: mapItem.regions
        .filter((region) => region.visible)
        .map((region) => ({
          id: region.id,
          title: region.title,
          description: region.description,
          color: region.color,
          opacity: region.opacity,
          points: region.points.map((point) => ({ x: point.x, y: point.y }))
        }))
    })),
    timelines: tracks.map((track) => ({
      id: track.id,
      name: track.name,
      description: track.description,
      events: events
        .filter((event) => event.trackId === track.id)
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((event) => ({
          id: event.id,
          title: event.title,
          summary: event.summary,
          displayDate: event.displayDate,
          entityId: event.entityId,
          questId: event.questId
        }))
    })),
    relations: input.relations
      .filter((relation) => entityIds.has(relation.sourceEntityId) && entityIds.has(relation.targetEntityId))
      .map((relation) => ({ ...relation })),
    assets: publicationAssets.map((asset) => ({
      ...asset,
      linkedEntityIds: asset.linkedEntityIds.filter((id) => entityIds.has(id))
    }))
  };
}
