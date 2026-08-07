import {
  normalizeProjectObjectRefs,
  type ProjectObjectKind,
  type ProjectObjectRef
} from "./project-references";

type UnknownRecord = Record<string, unknown>;

export type PublicationOptions = {
  includeDeveloperNotes?: boolean;
  includeSecretContent?: boolean;
};

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function asRecords(value: unknown) {
  return Array.isArray(value)
    ? value.map(asRecord).filter((item): item is UnknownRecord => Boolean(item))
    : [];
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function stripSecretRichTextBlocks(value: string) {
  const tagPattern = /<\/?section\b[^>]*>/gi;
  let cursor = 0;
  let secretDepth = 0;
  let output = "";
  for (const match of value.matchAll(tagPattern)) {
    const tag = match[0];
    const index = match.index ?? 0;
    if (secretDepth === 0) output += value.slice(cursor, index);
    const closing = /^<\//.test(tag);
    const secretOpening = !closing && /\bdata-secret-block(?:\s*=|\s|>)/i.test(tag);
    if (secretDepth > 0) {
      secretDepth += closing ? -1 : 1;
    } else if (secretOpening) {
      secretDepth = 1;
    } else {
      output += tag;
    }
    cursor = index + tag.length;
  }
  if (secretDepth === 0) output += value.slice(cursor);
  return output;
}

export function sanitizePublicationRichText(value: unknown, includeSecrets = false) {
  let output = stringValue(value);
  if (!includeSecrets) output = stripSecretRichTextBlocks(output);
  output = output
    .replace(/<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?(?:script|style|iframe|object|embed|form|input|button|meta|link)\b[^>]*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, "");
  return output.trim();
}

function filterIds(value: unknown, validIds: Set<string>) {
  return stringArray(value).filter((id) => validIds.has(id));
}

function setArray(payload: UnknownRecord, key: string, value: UnknownRecord[]) {
  if (key in payload) payload[key] = value;
}

function objectIds(items: UnknownRecord[]) {
  return new Set(items.map((item) => stringValue(item.id)).filter(Boolean));
}

export function sanitizePublicationPayload<T>(
  source: T,
  options: PublicationOptions = {}
): T {
  const payload = asRecord(cloneJson(source));
  if (!payload) return cloneJson(source);
  const includeDeveloperNotes = options.includeDeveloperNotes === true;
  const includeSecretContent = options.includeSecretContent === true;
  const templates = asRecords(payload.entityTemplates);
  const secretTemplateKeys = new Map<string, Set<string>>();

  templates.forEach((template) => {
    const templateId = stringValue(template.id);
    const fields = asRecords(template.fields);
    secretTemplateKeys.set(
      templateId,
      new Set(
        fields
          .filter((field) => field.secret === true)
          .map((field) => stringValue(field.key))
          .filter(Boolean)
      )
    );
    if (!includeSecretContent) {
      template.fields = fields.filter((field) => field.secret !== true);
    }
  });

  let entities = asRecords(payload.entities);
  if (!includeSecretContent) {
    entities = entities.filter((entity) => entity.visibility !== "secret");
  }
  entities.forEach((entity) => {
    entity.content = sanitizePublicationRichText(entity.content, includeSecretContent);
    if (!includeSecretContent) {
      const templateData = asRecord(entity.templateData) || {};
      const secretKeys = secretTemplateKeys.get(stringValue(entity.templateId)) || new Set();
      secretKeys.forEach((key) => delete templateData[key]);
      entity.templateData = templateData;
    }
  });
  payload.entities = entities;
  const entityIds = objectIds(entities);
  const publicationAssetIds = objectIds(asRecords(payload.assets));

  const quests = asRecords(payload.quests);
  quests.forEach((quest) => {
    quest.relatedEntityIds = filterIds(quest.relatedEntityIds, entityIds);
    if (!includeDeveloperNotes) quest.developerNotes = "";
    quest.steps = asRecords(quest.steps).map((step) => ({
      ...step,
      notes: includeDeveloperNotes ? stringValue(step.notes) : ""
    }));
  });
  payload.quests = quests;

  const scenes = asRecords(payload.storyScenes);
  scenes.forEach((scene) => {
    scene.relatedEntityIds = filterIds(scene.relatedEntityIds, entityIds);
    if (!includeDeveloperNotes) scene.notes = "";
    scene.nodes = asRecords(scene.nodes).map((node) => ({
      ...node,
      speakerEntityId: entityIds.has(stringValue(node.speakerEntityId))
        ? stringValue(node.speakerEntityId)
        : "",
      mediaAssetId: publicationAssetIds.has(stringValue(node.mediaAssetId))
        ? stringValue(node.mediaAssetId)
        : ""
    }));
  });
  payload.storyScenes = scenes;

  let relations = asRecords(payload.relations).filter(
    (relation) =>
      entityIds.has(stringValue(relation.sourceEntityId)) &&
      entityIds.has(stringValue(relation.targetEntityId))
  );
  payload.relations = relations;

  const assets = asRecords(payload.assets);
  assets.forEach((asset) => {
    asset.linkedEntityIds = filterIds(asset.linkedEntityIds, entityIds);
    if (!includeDeveloperNotes) asset.notes = "";
  });
  payload.assets = assets;

  const milestones = asRecords(payload.narrativeMilestones);
  milestones.forEach((milestone) => {
    milestone.linkedEntityIds = filterIds(milestone.linkedEntityIds, entityIds);
    milestone.manuscriptBody = sanitizePublicationRichText(
      milestone.manuscriptBody,
      includeSecretContent
    );
    if (!includeDeveloperNotes) {
      milestone.developerNotes = "";
      milestone.blockedReason = "";
    }
  });
  payload.narrativeMilestones = milestones;

  const manuscriptBooks = asRecords(payload.manuscriptBooks);
  const manuscriptBookIds = objectIds(manuscriptBooks);
  const manuscriptVolumes = asRecords(payload.manuscriptVolumes).filter((volume) =>
    manuscriptBookIds.has(stringValue(volume.bookId))
  );
  const manuscriptVolumeIds = objectIds(manuscriptVolumes);
  const manuscriptChapters = asRecords(payload.manuscriptChapters).filter(
    (chapter) =>
      manuscriptBookIds.has(stringValue(chapter.bookId)) &&
      manuscriptVolumeIds.has(stringValue(chapter.volumeId))
  );
  manuscriptChapters.forEach((chapter) => {
    chapter.body = sanitizePublicationRichText(chapter.body, includeSecretContent);
    chapter.viewpointEntityId = entityIds.has(stringValue(chapter.viewpointEntityId))
      ? stringValue(chapter.viewpointEntityId)
      : "";
    if (!includeDeveloperNotes) chapter.notes = "";
    chapter.annotations = [];
  });
  payload.manuscriptBooks = manuscriptBooks;
  payload.manuscriptVolumes = manuscriptVolumes;
  payload.manuscriptChapters = manuscriptChapters;

  const manuscriptChapterIds = objectIds(manuscriptChapters);
  const manuscriptScenes = asRecords(payload.manuscriptScenes).filter(
    (scene) =>
      manuscriptBookIds.has(stringValue(scene.bookId)) &&
      manuscriptVolumeIds.has(stringValue(scene.volumeId)) &&
      manuscriptChapterIds.has(stringValue(scene.chapterId))
  );
  manuscriptScenes.forEach((scene) => {
    scene.body = sanitizePublicationRichText(scene.body, includeSecretContent);
    scene.viewpointEntityId = entityIds.has(stringValue(scene.viewpointEntityId))
      ? stringValue(scene.viewpointEntityId)
      : "";
    scene.locationEntityId = entityIds.has(stringValue(scene.locationEntityId))
      ? stringValue(scene.locationEntityId)
      : "";
    scene.relatedEntityIds = filterIds(scene.relatedEntityIds, entityIds);
    if (!includeDeveloperNotes) scene.notes = "";
    scene.annotations = [];
  });
  manuscriptBooks.forEach((book) => {
    book.dailyWordGoal = 0;
    book.writingDays = [];
  });
  payload.manuscriptScenes = manuscriptScenes;

  if (!includeDeveloperNotes) {
    setArray(payload, "storyTestPresets", []);
    setArray(payload, "storyTestRuns", []);
    setArray(payload, "storyReviewIssues", []);
    setArray(payload, "consistencyFindings", []);
    setArray(payload, "consistencyScans", []);
    setArray(payload, "consistencySettings", []);
    setArray(payload, "consistencyModelSettings", []);
    setArray(payload, "members", []);
    setArray(payload, "manuscriptClues", []);
    setArray(payload, "manuscriptKnowledgeStates", []);
  }
  setArray(payload, "aiMemoryItems", []);
  setArray(payload, "aiWritingSessions", []);
  setArray(payload, "aiOperationRuns", []);

  const world = asRecord(payload.world);
  const worlds = asRecords(payload.worlds);
  const availableIds: Partial<Record<ProjectObjectKind, Set<string>>> = {
    world: new Set(
      [stringValue(world?.id), ...worlds.map((item) => stringValue(item.id))].filter(Boolean)
    ),
    entity: entityIds,
    quest: objectIds(quests),
    scene: objectIds(scenes),
    "story-variable": objectIds(asRecords(payload.storyVariables)),
    "timeline-event": objectIds(asRecords(payload.timelineEvents)),
    "timeline-track": objectIds(asRecords(payload.timelineTracks)),
    map: objectIds(asRecords(payload.maps)),
    "map-marker": objectIds(asRecords(payload.mapMarkers)),
    "map-route": objectIds(asRecords(payload.mapRoutes)),
    asset: objectIds(assets),
    milestone: objectIds(milestones),
    "manuscript-book": objectIds(manuscriptBooks),
    "manuscript-volume": objectIds(manuscriptVolumes),
    "manuscript-chapter": objectIds(manuscriptChapters),
    "manuscript-scene": objectIds(manuscriptScenes),
    "review-issue": objectIds(asRecords(payload.storyReviewIssues)),
    relation: objectIds(relations)
  };

  function validReference(reference: ProjectObjectRef) {
    const ids = availableIds[reference.kind];
    return !ids || ids.has(reference.id);
  }

  function validLegacyId(kind: ProjectObjectKind, value: unknown) {
    const id = stringValue(value);
    return id && availableIds[kind]?.has(id) ? id : "";
  }

  manuscriptChapters.forEach((chapter) => {
    chapter.linkedNarrativeMilestoneId = validLegacyId(
      "milestone",
      chapter.linkedNarrativeMilestoneId
    );
    chapter.linkedStorySceneIds = filterIds(
      chapter.linkedStorySceneIds,
      availableIds.scene || new Set()
    );
    chapter.references = normalizeProjectObjectRefs(chapter.references).filter(validReference);
  });
  manuscriptScenes.forEach((scene) => {
    scene.linkedStorySceneId = validLegacyId("scene", scene.linkedStorySceneId);
    scene.references = normalizeProjectObjectRefs(scene.references).filter(validReference);
  });

  if (includeDeveloperNotes) {
    const validManuscriptUnit = (kind: unknown, id: unknown) =>
      kind === "scene"
        ? availableIds["manuscript-scene"]?.has(stringValue(id)) === true
        : availableIds["manuscript-chapter"]?.has(stringValue(id)) === true;
    payload.manuscriptClues = asRecords(payload.manuscriptClues)
      .filter((clue) => manuscriptBookIds.has(stringValue(clue.bookId)))
      .map((clue) => ({
        ...clue,
        setupUnitId: validManuscriptUnit(clue.setupUnitKind, clue.setupUnitId)
          ? stringValue(clue.setupUnitId)
          : "",
        payoffUnitId: validManuscriptUnit(clue.payoffUnitKind, clue.payoffUnitId)
          ? stringValue(clue.payoffUnitId)
          : "",
        relatedEntityIds: filterIds(clue.relatedEntityIds, entityIds)
      }));
    payload.manuscriptKnowledgeStates = asRecords(payload.manuscriptKnowledgeStates)
      .filter(
        (item) =>
          manuscriptBookIds.has(stringValue(item.bookId)) &&
          validManuscriptUnit(item.unitKind, item.unitId)
      )
      .map((item) => ({
        ...item,
        characterId: entityIds.has(stringValue(item.characterId))
          ? stringValue(item.characterId)
          : ""
      }));
  }

  quests.forEach((quest) => {
    quest.prerequisiteQuestIds = filterIds(
      quest.prerequisiteQuestIds,
      availableIds.quest || new Set()
    );
  });
  scenes.forEach((scene) => {
    scene.relatedQuestIds = filterIds(
      scene.relatedQuestIds,
      availableIds.quest || new Set()
    );
  });
  milestones.forEach((milestone) => {
    milestone.dependencyIds = filterIds(
      milestone.dependencyIds,
      availableIds.milestone || new Set()
    );
    milestone.linkedQuestIds = filterIds(
      milestone.linkedQuestIds,
      availableIds.quest || new Set()
    );
    milestone.linkedSceneIds = filterIds(
      milestone.linkedSceneIds,
      availableIds.scene || new Set()
    );
    milestone.linkedTimelineEventIds = filterIds(
      milestone.linkedTimelineEventIds,
      availableIds["timeline-event"] || new Set()
    );
    milestone.linkedMapMarkerIds = filterIds(
      milestone.linkedMapMarkerIds,
      availableIds["map-marker"] || new Set()
    );
    milestone.linkedReviewIssueIds = filterIds(
      milestone.linkedReviewIssueIds,
      availableIds["review-issue"] || new Set()
    );
  });

  const markers = asRecords(payload.mapMarkers);
  markers.forEach((marker) => {
    marker.entityId = validLegacyId("entity", marker.entityId);
    marker.questId = validLegacyId("quest", marker.questId);
    marker.sceneId = validLegacyId("scene", marker.sceneId);
    marker.references = normalizeProjectObjectRefs(marker.references).filter(validReference);
  });
  payload.mapMarkers = markers;

  const routes = asRecords(payload.mapRoutes);
  routes.forEach((route) => {
    route.stops = asRecords(route.stops).filter((stop) =>
      availableIds["map-marker"]?.has(stringValue(stop.markerId))
    );
    route.references = normalizeProjectObjectRefs(route.references).filter(validReference);
  });
  payload.mapRoutes = routes;

  asRecords(payload.maps).forEach((mapItem) => {
    mapItem.regions = asRecords(mapItem.regions).map((region) => ({
      ...region,
      references: normalizeProjectObjectRefs(region.references).filter(validReference)
    }));
  });

  const timelineEvents = asRecords(payload.timelineEvents);
  timelineEvents.forEach((event) => {
    event.entityId = validLegacyId("entity", event.entityId);
    event.questId = validLegacyId("quest", event.questId);
    event.sceneId = validLegacyId("scene", event.sceneId);
    event.dependencyIds = filterIds(
      event.dependencyIds,
      availableIds["timeline-event"] || new Set()
    );
    event.references = normalizeProjectObjectRefs(event.references).filter(validReference);
  });
  payload.timelineEvents = timelineEvents;

  return payload as T;
}
