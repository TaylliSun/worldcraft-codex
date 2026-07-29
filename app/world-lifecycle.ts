export const worldIdCollections = [
  "entityTemplates",
  "codexCategories",
  "entities",
  "mapRoutes",
  "timelineTracks",
  "timelineEvents",
  "quests",
  "storyVariables",
  "storyScenes",
  "storyTestPresets",
  "storyTestRuns",
  "storyReviewIssues",
  "narrativeMilestones",
  "manuscriptBooks",
  "manuscriptVolumes",
  "manuscriptChapters",
  "manuscriptScenes",
  "manuscriptClues",
  "manuscriptKnowledgeStates",
  "consistencyFindings",
  "consistencyScans",
  "consistencySettings",
  "consistencyModelSettings",
  "aiMemoryItems",
  "aiWritingSessions",
  "aiOperationRuns",
  "relations",
  "assets",
  "members"
] as const;

export const mapIdCollections = [
  "mapLayers",
  "mapMarkerGroups",
  "mapMarkers"
] as const;

const lifecycleCollections = new Set<string>([
  "worlds",
  "maps",
  ...worldIdCollections,
  ...mapIdCollections
]);

type FilterMode = "exclude" | "include";
type UnknownRecord = Record<string, unknown>;

function itemProperty(item: unknown, key: string) {
  if (!item || typeof item !== "object") return "";
  const value = (item as UnknownRecord)[key];
  return typeof value === "string" ? value : "";
}

function workspaceRecord<T>(source: T) {
  return source as unknown as Record<string, unknown>;
}

export function assertWorldLifecycleCoverage<T>(source: T) {
  const uncovered = Object.entries(workspaceRecord(source))
    .filter(([key, value]) => Array.isArray(value) && !lifecycleCollections.has(key))
    .map(([key]) => key)
    .sort();
  if (uncovered.length) {
    throw new Error(`World lifecycle is missing collections: ${uncovered.join(", ")}`);
  }
}

function filterWorldWorkspace<T>(source: T, worldId: string, mode: FilterMode): T {
  assertWorldLifecycleCoverage(source);
  const workspace = workspaceRecord(source);
  const maps = (workspace.maps as unknown[]).filter(
    (item) => itemProperty(item, "worldId") === worldId
  );
  const targetMapIds = new Set(maps.map((item) => itemProperty(item, "id")));
  const keep = (matches: boolean) => mode === "include" ? matches : !matches;
  const next: Record<string, unknown> = { ...workspace };

  next.worlds = (workspace.worlds as unknown[]).filter((item) =>
    keep(itemProperty(item, "id") === worldId)
  );
  next.maps = (workspace.maps as unknown[]).filter((item) =>
    keep(itemProperty(item, "worldId") === worldId)
  );
  worldIdCollections.forEach((collection) => {
    next[collection] = (workspace[collection] as unknown[]).filter((item) =>
      keep(itemProperty(item, "worldId") === worldId)
    );
  });
  mapIdCollections.forEach((collection) => {
    next[collection] = (workspace[collection] as unknown[]).filter((item) =>
      keep(targetMapIds.has(itemProperty(item, "mapId")))
    );
  });

  return next as T;
}

export function isolateWorldWorkspace<T>(source: T, worldId: string): T {
  return filterWorldWorkspace(source, worldId, "include");
}

export function removeWorldFromWorkspace<T>(source: T, worldId: string): T {
  return filterWorldWorkspace(source, worldId, "exclude");
}
