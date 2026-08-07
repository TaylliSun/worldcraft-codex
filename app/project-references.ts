export const projectObjectKinds = [
  "world",
  "entity",
  "quest",
  "scene",
  "story-variable",
  "timeline-event",
  "timeline-track",
  "map",
  "map-marker",
  "map-route",
  "asset",
  "milestone",
  "manuscript-book",
  "manuscript-volume",
  "manuscript-chapter",
  "manuscript-scene",
  "review-issue",
  "relation"
] as const;

export type ProjectObjectKind = (typeof projectObjectKinds)[number];

export type ProjectObjectRef = {
  kind: ProjectObjectKind;
  id: string;
};

export type ProjectReferenceRole =
  | "association"
  | "dependency"
  | "mention"
  | "speaker"
  | "template"
  | "route";

export type ProjectReferenceAnchor = {
  field: string;
  path: string;
  start: number | null;
  end: number | null;
  excerpt: string;
};

export type ProjectReference = {
  id: string;
  worldId: string;
  source: ProjectObjectRef;
  sourceLabel: string;
  target: ProjectObjectRef;
  targetLabel: string;
  role: ProjectReferenceRole;
  anchor: ProjectReferenceAnchor;
};

export type ProjectReferenceProblem = {
  id: string;
  code:
    | "broken-target"
    | "unresolved-title"
    | "ambiguous-title"
    | "cross-world-target";
  severity: "error" | "warning";
  worldId: string;
  source: ProjectObjectRef;
  sourceLabel: string;
  target?: ProjectObjectRef;
  targetLabel: string;
  anchor: ProjectReferenceAnchor;
};

export type ProjectReferenceIndex = {
  references: ProjectReference[];
  problems: ProjectReferenceProblem[];
};

type NamedObject = {
  id: string;
  worldId?: string;
  title?: string;
  name?: string;
  label?: string;
  key?: string;
};

type ReferenceEntity = NamedObject & {
  worldId: string;
  summary?: string;
  content?: string;
  templateId?: string;
  templateData?: Record<string, string>;
};

type ReferenceTemplate = NamedObject & {
  worldId: string;
  fields?: Array<{ key?: string; label?: string; type?: string; secret?: boolean }>;
};

type ReferenceQuest = NamedObject & {
  worldId: string;
  summary?: string;
  trigger?: string;
  relatedEntityIds?: string[];
  prerequisiteQuestIds?: string[];
  steps?: Array<{
    id?: string;
    title?: string;
    objective?: string;
    condition?: string;
    branch?: string;
    failure?: string;
    reward?: string;
    notes?: string;
  }>;
};

type ReferenceScene = NamedObject & {
  worldId: string;
  relatedEntityIds?: string[];
  relatedQuestIds?: string[];
  summary?: string;
  notes?: string;
  nodes?: Array<{
    id?: string;
    label?: string;
    speakerEntityId?: string;
    mediaAssetId?: string;
    text?: string;
    stageDirection?: string;
    cameraDirection?: string;
    conditions?: Array<{ id?: string; variableId?: string }>;
    effects?: Array<{ id?: string; variableId?: string }>;
    choices?: Array<{
      id?: string;
      text?: string;
      conditions?: Array<{ id?: string; variableId?: string }>;
      effects?: Array<{ id?: string; variableId?: string }>;
    }>;
  }>;
};

type ReferenceMarker = NamedObject & {
  mapId: string;
  entityId?: string;
  questId?: string;
  sceneId?: string;
  references?: ProjectObjectRef[];
};

type ReferenceTimelineEvent = NamedObject & {
  worldId: string;
  entityId?: string;
  questId?: string;
  sceneId?: string;
  dependencyIds?: string[];
  references?: ProjectObjectRef[];
};

type ReferenceMilestone = NamedObject & {
  worldId: string;
  dependencyIds?: string[];
  linkedQuestIds?: string[];
  linkedSceneIds?: string[];
  linkedEntityIds?: string[];
  linkedTimelineEventIds?: string[];
  linkedMapMarkerIds?: string[];
  linkedReviewIssueIds?: string[];
};

type ReferenceManuscriptUnit = NamedObject & {
  worldId: string;
  bookId?: string;
  volumeId?: string;
  chapterId?: string;
  summary?: string;
  body?: string;
  notes?: string;
  viewpointEntityId?: string;
  locationEntityId?: string;
  relatedEntityIds?: string[];
  linkedNarrativeMilestoneId?: string;
  linkedStorySceneIds?: string[];
  linkedStorySceneId?: string;
  references?: ProjectObjectRef[];
};

export type ProjectReferenceWorkspace = {
  worlds?: NamedObject[];
  entities?: ReferenceEntity[];
  entityTemplates?: ReferenceTemplate[];
  quests?: ReferenceQuest[];
  storyVariables?: NamedObject[];
  storyScenes?: ReferenceScene[];
  storyReviewIssues?: NamedObject[];
  relations?: Array<NamedObject & {
    worldId: string;
    sourceEntityId?: string;
    targetEntityId?: string;
  }>;
  assets?: Array<NamedObject & { worldId: string; linkedEntityIds?: string[] }>;
  maps?: Array<NamedObject & {
    worldId: string;
    regions?: Array<{
      id?: string;
      title?: string;
      references?: ProjectObjectRef[];
    }>;
  }>;
  mapMarkers?: ReferenceMarker[];
  mapRoutes?: Array<NamedObject & {
    worldId: string;
    references?: ProjectObjectRef[];
    stops?: Array<{ id?: string; markerId?: string; title?: string }>;
  }>;
  timelineTracks?: Array<NamedObject & { worldId: string }>;
  timelineEvents?: ReferenceTimelineEvent[];
  narrativeMilestones?: ReferenceMilestone[];
  manuscriptBooks?: ReferenceManuscriptUnit[];
  manuscriptVolumes?: ReferenceManuscriptUnit[];
  manuscriptChapters?: ReferenceManuscriptUnit[];
  manuscriptScenes?: ReferenceManuscriptUnit[];
};

const kindSet = new Set<ProjectObjectKind>(projectObjectKinds);

function cleanId(value: unknown) {
  return String(value ?? "").trim().slice(0, 300);
}

function cleanText(value: unknown, maximum = 500) {
  return String(value ?? "").trim().slice(0, maximum);
}

function normalizedTitle(value: unknown) {
  return cleanText(value, 500).toLocaleLowerCase("zh-CN");
}

function objectLabel(item: NamedObject | undefined, fallback: string) {
  return cleanText(item?.title || item?.name || item?.label || item?.key, 500) || fallback;
}

export function projectObjectRefKey(ref: ProjectObjectRef) {
  return `${ref.kind}\u0000${ref.id}`;
}

export function normalizeProjectObjectRef(input: unknown): ProjectObjectRef | null {
  if (!input || typeof input !== "object") return null;
  const candidate = input as Partial<ProjectObjectRef>;
  const kind = cleanId(candidate.kind) as ProjectObjectKind;
  const id = cleanId(candidate.id);
  return kindSet.has(kind) && id ? { kind, id } : null;
}

export function normalizeProjectObjectRefs(input: unknown, maximum = 100) {
  const refs = Array.isArray(input) ? input : [];
  const seen = new Set<string>();
  const normalized: ProjectObjectRef[] = [];
  for (const value of refs) {
    const ref = normalizeProjectObjectRef(value);
    if (!ref) continue;
    const key = projectObjectRefKey(ref);
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(ref);
    if (normalized.length >= Math.max(1, maximum)) break;
  }
  return normalized;
}

export function toggleProjectObjectRef(
  input: unknown,
  ref: ProjectObjectRef,
  maximum = 100
) {
  const normalized = normalizeProjectObjectRefs(input, maximum);
  const key = projectObjectRefKey(ref);
  return normalized.some((item) => projectObjectRefKey(item) === key)
    ? normalized.filter((item) => projectObjectRefKey(item) !== key)
    : normalizeProjectObjectRefs([...normalized, ref], maximum);
}

function referenceId(
  source: ProjectObjectRef,
  target: ProjectObjectRef,
  path: string,
  role: ProjectReferenceRole
) {
  return [source.kind, source.id, path, role, target.kind, target.id]
    .map((value) => encodeURIComponent(value))
    .join(":");
}

function anchor(
  field: string,
  path: string,
  excerpt = "",
  start: number | null = null,
  end: number | null = null
): ProjectReferenceAnchor {
  return {
    field: cleanText(field, 300),
    path: cleanText(path, 800),
    start: Number.isFinite(start) ? start : null,
    end: Number.isFinite(end) ? end : null,
    excerpt: cleanText(excerpt, 500)
  };
}

export function getProjectBackReferences(
  index: ProjectReferenceIndex,
  target: ProjectObjectRef
) {
  const key = projectObjectRefKey(target);
  return index.references.filter((reference) => projectObjectRefKey(reference.target) === key);
}

export function buildProjectReferenceIndex(
  workspace: ProjectReferenceWorkspace
): ProjectReferenceIndex {
  const references: ProjectReference[] = [];
  const problems: ProjectReferenceProblem[] = [];
  const referenceIds = new Set<string>();
  const problemIds = new Set<string>();
  const objects = new Map<string, { worldId: string; label: string }>();
  const maps = new Map((workspace.maps || []).map((item) => [item.id, item]));

  function register(kind: ProjectObjectKind, item: NamedObject, worldId = item.worldId || "") {
    const id = cleanId(item.id);
    if (!id) return;
    objects.set(projectObjectRefKey({ kind, id }), {
      worldId: cleanId(worldId),
      label: objectLabel(item, id)
    });
  }

  (workspace.worlds || []).forEach((item) => register("world", item, item.id));
  (workspace.entities || []).forEach((item) => register("entity", item));
  (workspace.quests || []).forEach((item) => register("quest", item));
  (workspace.storyVariables || []).forEach((item) => register("story-variable", item));
  (workspace.storyScenes || []).forEach((item) => register("scene", item));
  (workspace.storyReviewIssues || []).forEach((item) => register("review-issue", item));
  (workspace.relations || []).forEach((item) => register("relation", item));
  (workspace.assets || []).forEach((item) => register("asset", item));
  (workspace.maps || []).forEach((item) => register("map", item));
  (workspace.mapMarkers || []).forEach((item) => {
    const map = maps.get(item.mapId);
    register("map-marker", item, map?.worldId || "");
  });
  (workspace.mapRoutes || []).forEach((item) => register("map-route", item));
  (workspace.timelineTracks || []).forEach((item) => register("timeline-track", item));
  (workspace.timelineEvents || []).forEach((item) => register("timeline-event", item));
  (workspace.narrativeMilestones || []).forEach((item) => register("milestone", item));
  (workspace.manuscriptBooks || []).forEach((item) => register("manuscript-book", item));
  (workspace.manuscriptVolumes || []).forEach((item) => register("manuscript-volume", item));
  (workspace.manuscriptChapters || []).forEach((item) => register("manuscript-chapter", item));
  (workspace.manuscriptScenes || []).forEach((item) => register("manuscript-scene", item));

  function addProblem(problem: Omit<ProjectReferenceProblem, "id">) {
    const id = [
      problem.code,
      projectObjectRefKey(problem.source),
      problem.anchor.path,
      problem.target ? projectObjectRefKey(problem.target) : problem.targetLabel
    ].join(":");
    if (problemIds.has(id)) return;
    problemIds.add(id);
    problems.push({ ...problem, id });
  }

  function addReference(
    worldId: string,
    source: ProjectObjectRef,
    target: ProjectObjectRef,
    role: ProjectReferenceRole,
    sourceAnchor: ProjectReferenceAnchor
  ) {
    const id = referenceId(source, target, sourceAnchor.path, role);
    if (referenceIds.has(id)) return;
    referenceIds.add(id);
    const sourceMeta = objects.get(projectObjectRefKey(source));
    const targetMeta = objects.get(projectObjectRefKey(target));
    const sourceLabel = sourceMeta?.label || source.id;
    const targetLabel = targetMeta?.label || target.id;
    references.push({
      id,
      worldId: cleanId(worldId || sourceMeta?.worldId),
      source,
      sourceLabel,
      target,
      targetLabel,
      role,
      anchor: sourceAnchor
    });
    if (!targetMeta) {
      addProblem({
        code: "broken-target",
        severity: "error",
        worldId: cleanId(worldId || sourceMeta?.worldId),
        source,
        sourceLabel,
        target,
        targetLabel,
        anchor: sourceAnchor
      });
    } else if (
      sourceMeta?.worldId &&
      targetMeta.worldId &&
      sourceMeta.worldId !== targetMeta.worldId
    ) {
      addProblem({
        code: "cross-world-target",
        severity: "warning",
        worldId: cleanId(worldId || sourceMeta.worldId),
        source,
        sourceLabel,
        target,
        targetLabel,
        anchor: sourceAnchor
      });
    }
  }

  function addIdArray(
    worldId: string,
    source: ProjectObjectRef,
    targetKind: ProjectObjectKind,
    ids: unknown,
    field: string,
    role: ProjectReferenceRole = "association"
  ) {
    const values = Array.isArray(ids) ? ids : [];
    values.forEach((value, index) => {
      const id = cleanId(value);
      if (!id) return;
      addReference(
        worldId,
        source,
        { kind: targetKind, id },
        role,
        anchor(field, `${field}[${index}]`, id)
      );
    });
  }

  const entitiesByWorldTitle = new Map<string, ReferenceEntity[]>();
  for (const entity of workspace.entities || []) {
    const key = `${entity.worldId}\u0000${normalizedTitle(entity.title)}`;
    entitiesByWorldTitle.set(key, [...(entitiesByWorldTitle.get(key) || []), entity]);
  }

  function addWikiLinks(
    worldId: string,
    source: ProjectObjectRef,
    field: string,
    path: string,
    value: unknown
  ) {
    const text = String(value ?? "");
    const stableRanges: Array<[number, number]> = [];
    const stablePattern = /<span\b([^>]*)>([\s\S]*?)<\/span\s*>/gi;
    for (const match of text.matchAll(stablePattern)) {
      const attributes = match[1] || "";
      const fullTag = match[0];
      const idMatch = attributes.match(
        /\bdata-project-reference-id\s*=\s*(?:"([^"]+)"|'([^']+)')/i
      );
      const id = cleanId(idMatch?.[1] || idMatch?.[2]);
      if (!id) continue;
      const kindMatch = attributes.match(
        /\bdata-project-reference-kind\s*=\s*(?:"([^"]+)"|'([^']+)')/i
      );
      const kind = cleanId(kindMatch?.[1] || kindMatch?.[2]) as ProjectObjectKind;
      const start = match.index ?? 0;
      stableRanges.push([start, start + fullTag.length]);
      const target = normalizeProjectObjectRef({ kind, id });
      if (!target) continue;
      addReference(
        worldId,
        source,
        target,
        "mention",
        anchor(field, path, cleanText(fullTag.replace(/<[^>]+>/g, ""), 500), start, start + fullTag.length)
      );
    }
    const pattern = /\[\[([^\[\]]{1,200})\]\]/g;
    for (const match of text.matchAll(pattern)) {
      const title = cleanText(match[1], 200);
      const start = match.index ?? 0;
      if (stableRanges.some(([rangeStart, rangeEnd]) => start >= rangeStart && start < rangeEnd)) {
        continue;
      }
      const sourceMeta = objects.get(projectObjectRefKey(source));
      const candidates = entitiesByWorldTitle.get(`${worldId}\u0000${normalizedTitle(title)}`) || [];
      const sourceAnchor = anchor(field, path, match[0], start, start + match[0].length);
      if (candidates.length === 1) {
        addReference(worldId, source, { kind: "entity", id: candidates[0].id }, "mention", sourceAnchor);
      } else {
        addProblem({
          code: candidates.length ? "ambiguous-title" : "unresolved-title",
          severity: candidates.length ? "warning" : "error",
          worldId,
          source,
          sourceLabel: sourceMeta?.label || source.id,
          targetLabel: title,
          anchor: sourceAnchor
        });
      }
    }
  }

  const templates = new Map((workspace.entityTemplates || []).map((item) => [item.id, item]));
  for (const entity of workspace.entities || []) {
    const source: ProjectObjectRef = { kind: "entity", id: entity.id };
    addWikiLinks(entity.worldId, source, "summary", "summary", entity.summary);
    addWikiLinks(entity.worldId, source, "content", "content", entity.content);
    const template = templates.get(entity.templateId || "");
    for (const field of template?.fields || []) {
      if (field.type !== "entity_ref" || field.secret) continue;
      const id = cleanId(entity.templateData?.[field.key || ""]);
      if (!id) continue;
      addReference(
        entity.worldId,
        source,
        { kind: "entity", id },
        "template",
        anchor(field.label || field.key || "模板字段", `templateData.${field.key}`, id)
      );
    }
  }

  for (const quest of workspace.quests || []) {
    const source: ProjectObjectRef = { kind: "quest", id: quest.id };
    addWikiLinks(quest.worldId, source, "summary", "summary", quest.summary);
    addWikiLinks(quest.worldId, source, "trigger", "trigger", quest.trigger);
    addIdArray(quest.worldId, source, "entity", quest.relatedEntityIds, "relatedEntityIds");
    addIdArray(quest.worldId, source, "quest", quest.prerequisiteQuestIds, "prerequisiteQuestIds", "dependency");
    for (const [stepIndex, step] of (quest.steps || []).entries()) {
      const stepPath = `steps[${stepIndex}]`;
      for (const field of ["objective", "condition", "branch", "failure", "reward", "notes"] as const) {
        addWikiLinks(quest.worldId, source, `steps.${field}`, `${stepPath}.${field}`, step[field]);
      }
    }
  }

  function addVariableRefs(
    worldId: string,
    source: ProjectObjectRef,
    values: Array<{ id?: string; variableId?: string }> | undefined,
    path: string
  ) {
    (values || []).forEach((item, index) => {
      const id = cleanId(item.variableId);
      if (!id) return;
      addReference(
        worldId,
        source,
        { kind: "story-variable", id },
        "association",
        anchor("剧情变量", `${path}[${index}].variableId`, id)
      );
    });
  }

  for (const scene of workspace.storyScenes || []) {
    const source: ProjectObjectRef = { kind: "scene", id: scene.id };
    addIdArray(scene.worldId, source, "entity", scene.relatedEntityIds, "relatedEntityIds");
    addIdArray(scene.worldId, source, "quest", scene.relatedQuestIds, "relatedQuestIds");
    addWikiLinks(scene.worldId, source, "summary", "summary", scene.summary);
    addWikiLinks(scene.worldId, source, "notes", "notes", scene.notes);
    for (const [nodeIndex, node] of (scene.nodes || []).entries()) {
      const nodePath = `nodes[${nodeIndex}]`;
      const speakerId = cleanId(node.speakerEntityId);
      if (speakerId) {
        addReference(
          scene.worldId,
          source,
          { kind: "entity", id: speakerId },
          "speaker",
          anchor("对白说话者", `${nodePath}.speakerEntityId`, node.label || speakerId)
        );
      }
      const mediaAssetId = cleanId(node.mediaAssetId);
      if (mediaAssetId) {
        addReference(
          scene.worldId,
          source,
          { kind: "asset", id: mediaAssetId },
          "association",
          anchor("镜头素材", `${nodePath}.mediaAssetId`, node.label || mediaAssetId)
        );
      }
      addWikiLinks(scene.worldId, source, "nodes.text", `${nodePath}.text`, node.text);
      addWikiLinks(
        scene.worldId,
        source,
        "nodes.stageDirection",
        `${nodePath}.stageDirection`,
        node.stageDirection
      );
      addWikiLinks(
        scene.worldId,
        source,
        "nodes.cameraDirection",
        `${nodePath}.cameraDirection`,
        node.cameraDirection
      );
      addVariableRefs(scene.worldId, source, node.conditions, `${nodePath}.conditions`);
      addVariableRefs(scene.worldId, source, node.effects, `${nodePath}.effects`);
      for (const [choiceIndex, choice] of (node.choices || []).entries()) {
        const choicePath = `${nodePath}.choices[${choiceIndex}]`;
        addWikiLinks(scene.worldId, source, "nodes.choices.text", `${choicePath}.text`, choice.text);
        addVariableRefs(scene.worldId, source, choice.conditions, `${choicePath}.conditions`);
        addVariableRefs(scene.worldId, source, choice.effects, `${choicePath}.effects`);
      }
    }
  }

  for (const relation of workspace.relations || []) {
    const source: ProjectObjectRef = { kind: "relation", id: relation.id };
    addIdArray(relation.worldId, source, "entity", [relation.sourceEntityId], "sourceEntityId");
    addIdArray(relation.worldId, source, "entity", [relation.targetEntityId], "targetEntityId");
  }

  for (const asset of workspace.assets || []) {
    addIdArray(
      asset.worldId,
      { kind: "asset", id: asset.id },
      "entity",
      asset.linkedEntityIds,
      "linkedEntityIds"
    );
  }

  for (const mapItem of workspace.maps || []) {
    const source: ProjectObjectRef = { kind: "map", id: mapItem.id };
    (mapItem.regions || []).forEach((region, regionIndex) => {
      normalizeProjectObjectRefs(region.references).forEach((target, referenceIndex) =>
        addReference(
          mapItem.worldId,
          source,
          target,
          "association",
          anchor(
            "地图区域",
            `regions[${regionIndex}].references[${referenceIndex}]`,
            region.title || region.id || target.id
          )
        )
      );
    });
  }

  for (const marker of workspace.mapMarkers || []) {
    const map = maps.get(marker.mapId);
    const worldId = map?.worldId || "";
    const source: ProjectObjectRef = { kind: "map-marker", id: marker.id };
    const unified = normalizeProjectObjectRefs(marker.references);
    const unifiedKeys = new Set(unified.map(projectObjectRefKey));
    unified.forEach((target, index) =>
      addReference(
        worldId,
        source,
        target,
        "association",
        anchor("关联对象", `references[${index}]`, target.id)
      )
    );
    const legacy: Array<[ProjectObjectKind, string | undefined, string]> = [
      ["entity", marker.entityId, "entityId"],
      ["quest", marker.questId, "questId"],
      ["scene", marker.sceneId, "sceneId"]
    ];
    legacy.forEach(([kind, id, field]) => {
      const target = normalizeProjectObjectRef({ kind, id });
      if (!target || unifiedKeys.has(projectObjectRefKey(target))) return;
      addReference(worldId, source, target, "association", anchor(field, field, target.id));
    });
  }

  for (const route of workspace.mapRoutes || []) {
    const source: ProjectObjectRef = { kind: "map-route", id: route.id };
    normalizeProjectObjectRefs(route.references).forEach((target, index) =>
      addReference(
        route.worldId,
        source,
        target,
        "association",
        anchor("关联对象", `references[${index}]`, target.id)
      )
    );
    (route.stops || []).forEach((stop, index) => {
      const id = cleanId(stop.markerId);
      if (!id) return;
      addReference(
        route.worldId,
        source,
        { kind: "map-marker", id },
        "route",
        anchor("路线停靠点", `stops[${index}].markerId`, stop.title || id)
      );
    });
  }

  for (const event of workspace.timelineEvents || []) {
    const source: ProjectObjectRef = { kind: "timeline-event", id: event.id };
    const unified = normalizeProjectObjectRefs(event.references);
    const unifiedKeys = new Set(unified.map(projectObjectRefKey));
    unified.forEach((target, index) =>
      addReference(
        event.worldId,
        source,
        target,
        "association",
        anchor("关联对象", `references[${index}]`, target.id)
      )
    );
    const legacy: Array<[ProjectObjectKind, string | undefined, string]> = [
      ["entity", event.entityId, "entityId"],
      ["quest", event.questId, "questId"],
      ["scene", event.sceneId, "sceneId"]
    ];
    legacy.forEach(([kind, id, field]) => {
      const target = normalizeProjectObjectRef({ kind, id });
      if (!target || unifiedKeys.has(projectObjectRefKey(target))) return;
      addReference(event.worldId, source, target, "association", anchor(field, field, target.id));
    });
    addIdArray(
      event.worldId,
      source,
      "timeline-event",
      event.dependencyIds,
      "dependencyIds",
      "dependency"
    );
  }

  for (const milestone of workspace.narrativeMilestones || []) {
    const source: ProjectObjectRef = { kind: "milestone", id: milestone.id };
    addIdArray(milestone.worldId, source, "milestone", milestone.dependencyIds, "dependencyIds", "dependency");
    addIdArray(milestone.worldId, source, "quest", milestone.linkedQuestIds, "linkedQuestIds");
    addIdArray(milestone.worldId, source, "scene", milestone.linkedSceneIds, "linkedSceneIds");
    addIdArray(milestone.worldId, source, "entity", milestone.linkedEntityIds, "linkedEntityIds");
    addIdArray(milestone.worldId, source, "timeline-event", milestone.linkedTimelineEventIds, "linkedTimelineEventIds");
    addIdArray(milestone.worldId, source, "map-marker", milestone.linkedMapMarkerIds, "linkedMapMarkerIds");
    addIdArray(milestone.worldId, source, "review-issue", milestone.linkedReviewIssueIds, "linkedReviewIssueIds");
  }

  for (const book of workspace.manuscriptBooks || []) {
    const source: ProjectObjectRef = { kind: "manuscript-book", id: book.id };
    addWikiLinks(book.worldId, source, "summary", "summary", book.summary);
  }

  for (const volume of workspace.manuscriptVolumes || []) {
    const source: ProjectObjectRef = { kind: "manuscript-volume", id: volume.id };
    addIdArray(volume.worldId, source, "manuscript-book", [volume.bookId], "bookId");
    addWikiLinks(volume.worldId, source, "summary", "summary", volume.summary);
  }

  for (const chapter of workspace.manuscriptChapters || []) {
    const source: ProjectObjectRef = { kind: "manuscript-chapter", id: chapter.id };
    addIdArray(chapter.worldId, source, "manuscript-book", [chapter.bookId], "bookId");
    addIdArray(chapter.worldId, source, "manuscript-volume", [chapter.volumeId], "volumeId");
    addIdArray(chapter.worldId, source, "entity", [chapter.viewpointEntityId], "viewpointEntityId");
    addIdArray(
      chapter.worldId,
      source,
      "milestone",
      [chapter.linkedNarrativeMilestoneId],
      "linkedNarrativeMilestoneId"
    );
    addIdArray(
      chapter.worldId,
      source,
      "scene",
      chapter.linkedStorySceneIds,
      "linkedStorySceneIds"
    );
    normalizeProjectObjectRefs(chapter.references).forEach((target, index) =>
      addReference(
        chapter.worldId,
        source,
        target,
        "association",
        anchor("关联对象", `references[${index}]`, target.id)
      )
    );
    addWikiLinks(chapter.worldId, source, "summary", "summary", chapter.summary);
    addWikiLinks(chapter.worldId, source, "body", "body", chapter.body);
    addWikiLinks(chapter.worldId, source, "notes", "notes", chapter.notes);
  }

  for (const scene of workspace.manuscriptScenes || []) {
    const source: ProjectObjectRef = { kind: "manuscript-scene", id: scene.id };
    addIdArray(scene.worldId, source, "manuscript-book", [scene.bookId], "bookId");
    addIdArray(scene.worldId, source, "manuscript-volume", [scene.volumeId], "volumeId");
    addIdArray(scene.worldId, source, "manuscript-chapter", [scene.chapterId], "chapterId");
    addIdArray(scene.worldId, source, "entity", [scene.viewpointEntityId], "viewpointEntityId");
    addIdArray(scene.worldId, source, "entity", [scene.locationEntityId], "locationEntityId");
    addIdArray(scene.worldId, source, "entity", scene.relatedEntityIds, "relatedEntityIds");
    addIdArray(scene.worldId, source, "scene", [scene.linkedStorySceneId], "linkedStorySceneId");
    normalizeProjectObjectRefs(scene.references).forEach((target, index) =>
      addReference(
        scene.worldId,
        source,
        target,
        "association",
        anchor("关联对象", `references[${index}]`, target.id)
      )
    );
    addWikiLinks(scene.worldId, source, "summary", "summary", scene.summary);
    addWikiLinks(scene.worldId, source, "body", "body", scene.body);
    addWikiLinks(scene.worldId, source, "notes", "notes", scene.notes);
  }

  references.sort((left, right) =>
    left.targetLabel.localeCompare(right.targetLabel, "zh-CN") ||
    left.sourceLabel.localeCompare(right.sourceLabel, "zh-CN") ||
    left.anchor.path.localeCompare(right.anchor.path, "zh-CN")
  );
  problems.sort((left, right) =>
    left.sourceLabel.localeCompare(right.sourceLabel, "zh-CN") ||
    left.anchor.path.localeCompare(right.anchor.path, "zh-CN")
  );
  return { references, problems };
}
