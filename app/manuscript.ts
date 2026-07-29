import type { ProjectObjectRef } from "./project-references";

export type ManuscriptStatus = "outline" | "drafting" | "revision" | "final";
export type ManuscriptBookStatus = "planning" | "drafting" | "revision" | "complete";
export type ManuscriptUnitKind = "book" | "volume" | "chapter" | "scene";
export type ManuscriptClueStatus = "open" | "resolved" | "abandoned";
export type ManuscriptKnowledgeLevel = "unknown" | "suspected" | "known";
export type ManuscriptAnnotationKind = "comment" | "suggestion";
export type ManuscriptAnnotationStatus = "open" | "resolved" | "accepted" | "rejected";

export type ManuscriptAnnotationReply = {
  id: string;
  body: string;
  createdAt: string;
};

export type ManuscriptAnnotation = {
  id: string;
  kind: ManuscriptAnnotationKind;
  quote: string;
  comment: string;
  replacement: string;
  status: ManuscriptAnnotationStatus;
  replies: ManuscriptAnnotationReply[];
  createdAt: string;
  updatedAt: string;
};

export type ManuscriptWritingDay = {
  date: string;
  startWordCount: number;
  endWordCount: number;
  updatedAt: string;
};

export type ManuscriptBook = {
  id: string;
  worldId: string;
  title: string;
  subtitle: string;
  summary: string;
  status: ManuscriptBookStatus;
  order: number;
  targetWordCount: number;
  dailyWordGoal: number;
  writingDays: ManuscriptWritingDay[];
  createdAt: string;
  updatedAt: string;
};

export type ManuscriptVolume = {
  id: string;
  worldId: string;
  bookId: string;
  title: string;
  summary: string;
  status: ManuscriptStatus;
  order: number;
  targetWordCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ManuscriptChapter = {
  id: string;
  worldId: string;
  bookId: string;
  volumeId: string;
  title: string;
  summary: string;
  body: string;
  notes: string;
  status: ManuscriptStatus;
  order: number;
  targetWordCount: number;
  viewpointEntityId: string;
  timelineStart: string;
  timelineEnd: string;
  linkedNarrativeMilestoneId: string;
  linkedStorySceneIds: string[];
  references: ProjectObjectRef[];
  annotations: ManuscriptAnnotation[];
  createdAt: string;
  updatedAt: string;
};

export type ManuscriptScene = {
  id: string;
  worldId: string;
  bookId: string;
  volumeId: string;
  chapterId: string;
  title: string;
  summary: string;
  body: string;
  notes: string;
  status: ManuscriptStatus;
  order: number;
  viewpointEntityId: string;
  locationEntityId: string;
  relatedEntityIds: string[];
  timelineStart: string;
  timelineEnd: string;
  linkedStorySceneId: string;
  references: ProjectObjectRef[];
  annotations: ManuscriptAnnotation[];
  createdAt: string;
  updatedAt: string;
};

export type ManuscriptClue = {
  id: string;
  worldId: string;
  bookId: string;
  title: string;
  description: string;
  status: ManuscriptClueStatus;
  setupUnitKind: "chapter" | "scene";
  setupUnitId: string;
  payoffUnitKind: "chapter" | "scene";
  payoffUnitId: string;
  relatedEntityIds: string[];
  authorConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ManuscriptKnowledgeState = {
  id: string;
  worldId: string;
  bookId: string;
  characterId: string;
  fact: string;
  level: ManuscriptKnowledgeLevel;
  unitKind: "chapter" | "scene";
  unitId: string;
  authorConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ManuscriptWorkspaceData = {
  manuscriptBooks: ManuscriptBook[];
  manuscriptVolumes: ManuscriptVolume[];
  manuscriptChapters: ManuscriptChapter[];
  manuscriptScenes: ManuscriptScene[];
  manuscriptClues: ManuscriptClue[];
  manuscriptKnowledgeStates: ManuscriptKnowledgeState[];
};

export type LegacyManuscriptMilestone = {
  id: string;
  worldId: string;
  title?: string;
  summary?: string;
  manuscriptBody?: string;
  developerNotes?: string;
  act?: string;
  status?: string;
  order?: number;
  linkedSceneIds?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type ManuscriptStatistics = {
  bookCount: number;
  volumeCount: number;
  chapterCount: number;
  sceneCount: number;
  totalWords: number;
  targetWords: number;
  completionPercent: number;
  statusCounts: Record<ManuscriptStatus, number>;
};

export type ManuscriptConsistencyIssue = {
  id: string;
  ruleId: "MS-001" | "MS-002" | "MS-003" | "MS-004";
  severity: "critical" | "major" | "minor";
  title: string;
  detail: string;
  suggestion: string;
  unitKind: "book" | "chapter" | "scene" | "clue" | "knowledge";
  unitId: string;
  relatedUnitIds: string[];
};

export const manuscriptStatusOrder: ManuscriptStatus[] = [
  "outline",
  "drafting",
  "revision",
  "final"
];

export const manuscriptStatusLabels: Record<ManuscriptStatus, string> = {
  outline: "提纲",
  drafting: "撰写中",
  revision: "修订中",
  final: "定稿"
};

export const manuscriptBookStatusLabels: Record<ManuscriptBookStatus, string> = {
  planning: "规划中",
  drafting: "撰写中",
  revision: "修订中",
  complete: "已完成"
};

const bookStatuses = new Set<ManuscriptBookStatus>([
  "planning",
  "drafting",
  "revision",
  "complete"
]);
const unitStatuses = new Set<ManuscriptStatus>(manuscriptStatusOrder);
const clueStatuses = new Set<ManuscriptClueStatus>(["open", "resolved", "abandoned"]);
const knowledgeLevels = new Set<ManuscriptKnowledgeLevel>(["unknown", "suspected", "known"]);
const annotationKinds = new Set<ManuscriptAnnotationKind>(["comment", "suggestion"]);
const annotationStatuses = new Set<ManuscriptAnnotationStatus>([
  "open",
  "resolved",
  "accepted",
  "rejected"
]);

function timestamp() {
  return new Date().toISOString();
}

function finiteOrder(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

function finiteTarget(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

function text(value: unknown, maximum = 200_000) {
  return String(value ?? "").slice(0, maximum);
}

function stringArray(value: unknown, maximum = 500) {
  return Array.isArray(value)
    ? Array.from(new Set(value.map((item) => text(item, 300).trim()).filter(Boolean))).slice(0, maximum)
    : [];
}

function projectReferences(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: ProjectObjectRef[] = [];
  value.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const candidate = item as Partial<ProjectObjectRef>;
    const kind = text(candidate.kind, 100).trim() as ProjectObjectRef["kind"];
    const id = text(candidate.id, 300).trim();
    const key = `${kind}\u0000${id}`;
    if (!kind || !id || seen.has(key)) return;
    seen.add(key);
    result.push({ kind, id });
  });
  return result.slice(0, 500);
}

export function normalizeManuscriptAnnotation(
  input: Partial<ManuscriptAnnotation>,
  index = 0
): ManuscriptAnnotation {
  const now = timestamp();
  return {
    id: text(input.id || createManuscriptId("manuscript-annotation"), 300),
    kind: annotationKinds.has(input.kind as ManuscriptAnnotationKind)
      ? (input.kind as ManuscriptAnnotationKind)
      : "comment",
    quote: text(input.quote, 20_000),
    comment: text(input.comment || `批注 ${index + 1}`, 50_000),
    replacement: text(input.replacement, 100_000),
    status: annotationStatuses.has(input.status as ManuscriptAnnotationStatus)
      ? (input.status as ManuscriptAnnotationStatus)
      : "open",
    replies: Array.isArray(input.replies)
      ? input.replies.slice(0, 200).map((reply, replyIndex) => ({
          id: text(reply?.id || createManuscriptId(`annotation-reply-${replyIndex + 1}`), 300),
          body: text(reply?.body, 50_000),
          createdAt: text(reply?.createdAt || now, 100)
        })).filter((reply) => reply.body.trim())
      : [],
    createdAt: text(input.createdAt || now, 100),
    updatedAt: text(input.updatedAt || input.createdAt || now, 100)
  };
}

function normalizeWritingDays(value: unknown): ManuscriptWritingDay[] {
  if (!Array.isArray(value)) return [];
  const byDate = new Map<string, ManuscriptWritingDay>();
  value.slice(-730).forEach((item) => {
    if (!item || typeof item !== "object") return;
    const candidate = item as Partial<ManuscriptWritingDay>;
    const date = text(candidate.date, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    byDate.set(date, {
      date,
      startWordCount: finiteTarget(candidate.startWordCount),
      endWordCount: finiteTarget(candidate.endWordCount),
      updatedAt: text(candidate.updatedAt || timestamp(), 100)
    });
  });
  return Array.from(byDate.values()).sort((left, right) => left.date.localeCompare(right.date));
}

export function manuscriptLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function recordManuscriptWritingDay(
  book: ManuscriptBook,
  beforeWordCount: number,
  afterWordCount: number,
  date = manuscriptLocalDate(),
  now = timestamp()
): ManuscriptBook {
  if (beforeWordCount === afterWordCount) return book;
  const existing = book.writingDays.find((item) => item.date === date);
  const nextDay: ManuscriptWritingDay = existing
    ? { ...existing, endWordCount: finiteTarget(afterWordCount), updatedAt: now }
    : {
        date,
        startWordCount: finiteTarget(beforeWordCount),
        endWordCount: finiteTarget(afterWordCount),
        updatedAt: now
      };
  return {
    ...book,
    writingDays: normalizeWritingDays([
      ...book.writingDays.filter((item) => item.date !== date),
      nextDay
    ]),
    updatedAt: now
  };
}

export function getManuscriptWritingRhythm(book: ManuscriptBook, today = new Date()) {
  const dayMap = new Map(book.writingDays.map((day) => [day.date, day]));
  const days = Array.from({ length: 14 }, (_item, offset) => {
    const date = new Date(today);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (13 - offset));
    const key = manuscriptLocalDate(date);
    const item = dayMap.get(key);
    return {
      date: key,
      words: item ? item.endWordCount - item.startWordCount : 0
    };
  });
  let streak = 0;
  for (let offset = 0; offset < 730; offset += 1) {
    const date = new Date(today);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const item = dayMap.get(manuscriptLocalDate(date));
    if (!item || item.endWordCount <= item.startWordCount) break;
    streak += 1;
  }
  return {
    days,
    streak,
    todayWords: days.at(-1)?.words ?? 0,
    goal: book.dailyWordGoal,
    goalPercent: book.dailyWordGoal > 0
      ? Math.min(100, Math.round(((days.at(-1)?.words ?? 0) / book.dailyWordGoal) * 100))
      : 0
  };
}

export function replaceManuscriptAnnotationQuote(
  value: string,
  quote: string,
  replacement: string
) {
  const target = quote.trim();
  if (!target) return { body: value, replaced: false };
  if (typeof DOMParser === "undefined" || typeof NodeFilter === "undefined") {
    const index = value.indexOf(target);
    return index < 0
      ? { body: value, replaced: false }
      : {
          body: `${value.slice(0, index)}${replacement}${value.slice(index + target.length)}`,
          replaced: true
        };
  }
  const document = new DOMParser().parseFromString(value, "text/html");
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let combined = "";
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    nodes.push(node);
    combined += node.data;
  }
  const start = combined.indexOf(target);
  if (start < 0) return { body: value, replaced: false };
  const end = start + target.length;
  let cursor = 0;
  let startNode: Text | null = null;
  let endNode: Text | null = null;
  let startOffset = 0;
  let endOffset = 0;
  nodes.forEach((node) => {
    const next = cursor + node.data.length;
    if (!startNode && start >= cursor && start <= next) {
      startNode = node;
      startOffset = start - cursor;
    }
    if (!endNode && end >= cursor && end <= next) {
      endNode = node;
      endOffset = end - cursor;
    }
    cursor = next;
  });
  if (!startNode || !endNode) return { body: value, replaced: false };
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  range.deleteContents();
  range.insertNode(document.createTextNode(replacement));
  document.body.normalize();
  return { body: document.body.innerHTML, replaced: true };
}

export function createManuscriptId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createManuscriptBook(
  worldId: string,
  order = 0,
  title = "未命名书稿",
  now = timestamp()
): ManuscriptBook {
  return {
    id: createManuscriptId("manuscript-book"),
    worldId,
    title,
    subtitle: "",
    summary: "",
    status: "planning",
    order,
    targetWordCount: 100_000,
    dailyWordGoal: 1000,
    writingDays: [],
    createdAt: now,
    updatedAt: now
  };
}

export function createManuscriptVolume(
  worldId: string,
  bookId: string,
  order = 0,
  title = "第一卷",
  now = timestamp()
): ManuscriptVolume {
  return {
    id: createManuscriptId("manuscript-volume"),
    worldId,
    bookId,
    title,
    summary: "",
    status: "outline",
    order,
    targetWordCount: 0,
    createdAt: now,
    updatedAt: now
  };
}

export function createManuscriptChapter(
  worldId: string,
  bookId: string,
  volumeId: string,
  order = 0,
  title = "新章节",
  now = timestamp()
): ManuscriptChapter {
  return {
    id: createManuscriptId("manuscript-chapter"),
    worldId,
    bookId,
    volumeId,
    title,
    summary: "",
    body: "",
    notes: "",
    status: "outline",
    order,
    targetWordCount: 0,
    viewpointEntityId: "",
    timelineStart: "",
    timelineEnd: "",
    linkedNarrativeMilestoneId: "",
    linkedStorySceneIds: [],
    references: [],
    annotations: [],
    createdAt: now,
    updatedAt: now
  };
}

export function createManuscriptScene(
  chapter: Pick<ManuscriptChapter, "worldId" | "bookId" | "volumeId" | "id">,
  order = 0,
  title = "新场景",
  now = timestamp()
): ManuscriptScene {
  return {
    id: createManuscriptId("manuscript-scene"),
    worldId: chapter.worldId,
    bookId: chapter.bookId,
    volumeId: chapter.volumeId,
    chapterId: chapter.id,
    title,
    summary: "",
    body: "",
    notes: "",
    status: "outline",
    order,
    viewpointEntityId: "",
    locationEntityId: "",
    relatedEntityIds: [],
    timelineStart: "",
    timelineEnd: "",
    linkedStorySceneId: "",
    references: [],
    annotations: [],
    createdAt: now,
    updatedAt: now
  };
}

export function normalizeManuscriptBook(
  input: Partial<ManuscriptBook>,
  worldId: string,
  order = 0
): ManuscriptBook {
  const now = timestamp();
  const base = createManuscriptBook(worldId, order, "未命名书稿", now);
  return {
    ...base,
    ...input,
    id: text(input.id || base.id, 300),
    worldId,
    title: text(input.title || base.title, 500),
    subtitle: text(input.subtitle, 1000),
    summary: text(input.summary, 24_000),
    status: bookStatuses.has(input.status as ManuscriptBookStatus)
      ? (input.status as ManuscriptBookStatus)
      : base.status,
    order: finiteOrder(input.order, order),
    targetWordCount: finiteTarget(input.targetWordCount || base.targetWordCount),
    dailyWordGoal: finiteTarget(
      input.dailyWordGoal === undefined ? base.dailyWordGoal : input.dailyWordGoal
    ),
    writingDays: normalizeWritingDays(input.writingDays),
    createdAt: text(input.createdAt || now, 100),
    updatedAt: text(input.updatedAt || input.createdAt || now, 100)
  };
}

export function normalizeManuscriptVolume(
  input: Partial<ManuscriptVolume>,
  worldId: string,
  bookId: string,
  order = 0
): ManuscriptVolume {
  const now = timestamp();
  const base = createManuscriptVolume(worldId, bookId, order, "未命名卷", now);
  return {
    ...base,
    ...input,
    id: text(input.id || base.id, 300),
    worldId,
    bookId,
    title: text(input.title || base.title, 500),
    summary: text(input.summary, 24_000),
    status: unitStatuses.has(input.status as ManuscriptStatus)
      ? (input.status as ManuscriptStatus)
      : base.status,
    order: finiteOrder(input.order, order),
    targetWordCount: finiteTarget(input.targetWordCount),
    createdAt: text(input.createdAt || now, 100),
    updatedAt: text(input.updatedAt || input.createdAt || now, 100)
  };
}

export function normalizeManuscriptChapter(
  input: Partial<ManuscriptChapter>,
  worldId: string,
  bookId: string,
  volumeId: string,
  order = 0
): ManuscriptChapter {
  const now = timestamp();
  const base = createManuscriptChapter(worldId, bookId, volumeId, order, "未命名章节", now);
  return {
    ...base,
    ...input,
    id: text(input.id || base.id, 300),
    worldId,
    bookId,
    volumeId,
    title: text(input.title || base.title, 500),
    summary: text(input.summary, 24_000),
    body: text(input.body, 2_000_000),
    notes: text(input.notes, 100_000),
    status: unitStatuses.has(input.status as ManuscriptStatus)
      ? (input.status as ManuscriptStatus)
      : base.status,
    order: finiteOrder(input.order, order),
    targetWordCount: finiteTarget(input.targetWordCount),
    viewpointEntityId: text(input.viewpointEntityId, 300),
    timelineStart: text(input.timelineStart, 300),
    timelineEnd: text(input.timelineEnd, 300),
    linkedNarrativeMilestoneId: text(input.linkedNarrativeMilestoneId, 300),
    linkedStorySceneIds: stringArray(input.linkedStorySceneIds),
    references: projectReferences(input.references),
    annotations: Array.isArray(input.annotations)
      ? input.annotations.slice(0, 1000).map(normalizeManuscriptAnnotation)
      : [],
    createdAt: text(input.createdAt || now, 100),
    updatedAt: text(input.updatedAt || input.createdAt || now, 100)
  };
}

export function normalizeManuscriptScene(
  input: Partial<ManuscriptScene>,
  chapter: ManuscriptChapter,
  order = 0
): ManuscriptScene {
  const now = timestamp();
  const base = createManuscriptScene(chapter, order, "未命名场景", now);
  return {
    ...base,
    ...input,
    id: text(input.id || base.id, 300),
    worldId: chapter.worldId,
    bookId: chapter.bookId,
    volumeId: chapter.volumeId,
    chapterId: chapter.id,
    title: text(input.title || base.title, 500),
    summary: text(input.summary, 24_000),
    body: text(input.body, 1_000_000),
    notes: text(input.notes, 100_000),
    status: unitStatuses.has(input.status as ManuscriptStatus)
      ? (input.status as ManuscriptStatus)
      : base.status,
    order: finiteOrder(input.order, order),
    viewpointEntityId: text(input.viewpointEntityId, 300),
    locationEntityId: text(input.locationEntityId, 300),
    relatedEntityIds: stringArray(input.relatedEntityIds),
    timelineStart: text(input.timelineStart, 300),
    timelineEnd: text(input.timelineEnd, 300),
    linkedStorySceneId: text(input.linkedStorySceneId, 300),
    references: projectReferences(input.references),
    annotations: Array.isArray(input.annotations)
      ? input.annotations.slice(0, 1000).map(normalizeManuscriptAnnotation)
      : [],
    createdAt: text(input.createdAt || now, 100),
    updatedAt: text(input.updatedAt || input.createdAt || now, 100)
  };
}

export function normalizeManuscriptClue(
  input: Partial<ManuscriptClue>,
  worldId: string,
  bookId: string,
  index = 0
): ManuscriptClue {
  const now = timestamp();
  return {
    id: text(input.id || createManuscriptId("manuscript-clue"), 300),
    worldId,
    bookId,
    title: text(input.title || `未命名线索 ${index + 1}`, 500),
    description: text(input.description, 24_000),
    status: clueStatuses.has(input.status as ManuscriptClueStatus)
      ? (input.status as ManuscriptClueStatus)
      : "open",
    setupUnitKind: input.setupUnitKind === "scene" ? "scene" : "chapter",
    setupUnitId: text(input.setupUnitId, 300),
    payoffUnitKind: input.payoffUnitKind === "scene" ? "scene" : "chapter",
    payoffUnitId: text(input.payoffUnitId, 300),
    relatedEntityIds: stringArray(input.relatedEntityIds),
    authorConfirmed: input.authorConfirmed === true,
    createdAt: text(input.createdAt || now, 100),
    updatedAt: text(input.updatedAt || input.createdAt || now, 100)
  };
}

export function normalizeManuscriptKnowledgeState(
  input: Partial<ManuscriptKnowledgeState>,
  worldId: string,
  bookId: string,
  index = 0
): ManuscriptKnowledgeState {
  const now = timestamp();
  return {
    id: text(input.id || createManuscriptId("manuscript-knowledge"), 300),
    worldId,
    bookId,
    characterId: text(input.characterId, 300),
    fact: text(input.fact || `未命名事实 ${index + 1}`, 4000),
    level: knowledgeLevels.has(input.level as ManuscriptKnowledgeLevel)
      ? (input.level as ManuscriptKnowledgeLevel)
      : "unknown",
    unitKind: input.unitKind === "scene" ? "scene" : "chapter",
    unitId: text(input.unitId, 300),
    authorConfirmed: input.authorConfirmed === true,
    createdAt: text(input.createdAt || now, 100),
    updatedAt: text(input.updatedAt || input.createdAt || now, 100)
  };
}

export function manuscriptPlainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|h[1-6]|li|blockquote|div|section)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function countManuscriptWords(value: string) {
  const plain = manuscriptPlainText(value);
  const cjkCharacters = plain.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const words = plain.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;
  return cjkCharacters + words;
}

export function sortManuscriptUnits<T extends { order: number; title: string; id: string }>(
  units: T[]
) {
  return [...units].sort(
    (left, right) =>
      left.order - right.order ||
      left.title.localeCompare(right.title, "zh-CN") ||
      left.id.localeCompare(right.id)
  );
}

export function resequenceManuscriptUnits<T extends { id: string; order: number }>(
  units: T[],
  orderedIds?: string[]
) {
  const byId = new Map(units.map((unit) => [unit.id, unit]));
  const ordered = orderedIds
    ? [
        ...orderedIds.map((id) => byId.get(id)).filter((unit): unit is T => Boolean(unit)),
        ...units.filter((unit) => !orderedIds.includes(unit.id))
      ]
    : [...units].sort((left, right) => left.order - right.order);
  return ordered.map((unit, order) => ({ ...unit, order }));
}

export function moveManuscriptUnit<T extends { id: string; order: number }>(
  units: T[],
  unitId: string,
  beforeId: string | null
) {
  const ordered = [...units].sort((left, right) => left.order - right.order);
  const moving = ordered.find((unit) => unit.id === unitId);
  if (!moving) return ordered;
  const remaining = ordered.filter((unit) => unit.id !== unitId);
  const target = beforeId ? remaining.findIndex((unit) => unit.id === beforeId) : remaining.length;
  remaining.splice(target < 0 ? remaining.length : target, 0, moving);
  return resequenceManuscriptUnits(remaining, remaining.map((unit) => unit.id));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function plainTextToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

function splitRichText(value: string, requestedPlainOffset?: number) {
  const plain = manuscriptPlainText(value);
  if (!plain) return ["", ""] as const;
  const desired = Math.max(1, Math.min(plain.length - 1, requestedPlainOffset ?? Math.floor(plain.length / 2)));
  const paragraphStarts = Array.from(value.matchAll(/<(?:p|h[1-6]|blockquote|ul|ol|pre|details|section)\b/gi))
    .map((match) => match.index ?? 0)
    .filter((index) => index > 0);
  if (paragraphStarts.length) {
    let best = paragraphStarts[0];
    let bestDistance = Number.POSITIVE_INFINITY;
    paragraphStarts.forEach((index) => {
      const plainBefore = manuscriptPlainText(value.slice(0, index)).length;
      const distance = Math.abs(plainBefore - desired);
      if (distance < bestDistance) {
        best = index;
        bestDistance = distance;
      }
    });
    return [value.slice(0, best).trim(), value.slice(best).trim()] as const;
  }
  const left = plain.slice(0, desired).trimEnd();
  const right = plain.slice(desired).trimStart();
  return [plainTextToHtml(left), plainTextToHtml(right)] as const;
}

export function splitManuscriptChapter(
  chapter: ManuscriptChapter,
  title = `${chapter.title}（续）`,
  plainOffset?: number,
  now = timestamp()
) {
  const [body, nextBody] = splitRichText(chapter.body, plainOffset);
  const first = {
    ...chapter,
    body,
    annotations: chapter.annotations.filter((annotation) =>
      !annotation.quote || manuscriptPlainText(body).includes(annotation.quote)
    ),
    updatedAt: now
  };
  const second = normalizeManuscriptChapter(
    {
      ...chapter,
      id: createManuscriptId("manuscript-chapter"),
      title,
      summary: "",
      body: nextBody,
      notes: "",
      order: chapter.order + 1,
      linkedNarrativeMilestoneId: "",
      annotations: chapter.annotations.filter((annotation) =>
        annotation.quote && manuscriptPlainText(nextBody).includes(annotation.quote)
      ),
      createdAt: now,
      updatedAt: now
    },
    chapter.worldId,
    chapter.bookId,
    chapter.volumeId,
    chapter.order + 1
  );
  return { first, second };
}

export function mergeManuscriptChapters(
  first: ManuscriptChapter,
  second: ManuscriptChapter,
  now = timestamp()
) {
  if (first.bookId !== second.bookId || first.volumeId !== second.volumeId) {
    throw new Error("只能合并同一卷中的章节");
  }
  return normalizeManuscriptChapter(
    {
      ...first,
      body: [first.body, second.body].filter(Boolean).join("<hr>"),
      summary: [first.summary, second.summary].filter(Boolean).join("\n\n"),
      notes: [first.notes, second.notes].filter(Boolean).join("\n\n"),
      linkedStorySceneIds: [...first.linkedStorySceneIds, ...second.linkedStorySceneIds],
      references: [...first.references, ...second.references],
      annotations: [...first.annotations, ...second.annotations],
      targetWordCount: first.targetWordCount + second.targetWordCount,
      updatedAt: now
    },
    first.worldId,
    first.bookId,
    first.volumeId,
    first.order
  );
}

function legacyStatus(value: string | undefined): ManuscriptStatus {
  if (value === "done") return "final";
  if (value === "review") return "revision";
  if (value === "drafting" || value === "blocked") return "drafting";
  return "outline";
}

export function isLegacyManuscriptChapter(milestone: LegacyManuscriptMilestone) {
  const title = text(milestone.title, 500).trim();
  const body = manuscriptPlainText(text(milestone.manuscriptBody, 2_000_000));
  return Boolean(
    body ||
      /^第.+章(?:\s|$)/.test(title) ||
      /^(序章|楔子|前言|引子|后记)$/.test(title)
  );
}

export function migrateLegacyManuscript(
  worldIds: string[],
  milestones: LegacyManuscriptMilestone[],
  existing: Partial<ManuscriptWorkspaceData> = {},
  now = timestamp()
): ManuscriptWorkspaceData {
  const result: ManuscriptWorkspaceData = {
    manuscriptBooks: [...(existing.manuscriptBooks ?? [])],
    manuscriptVolumes: [...(existing.manuscriptVolumes ?? [])],
    manuscriptChapters: [...(existing.manuscriptChapters ?? [])],
    manuscriptScenes: [...(existing.manuscriptScenes ?? [])],
    manuscriptClues: [...(existing.manuscriptClues ?? [])],
    manuscriptKnowledgeStates: [...(existing.manuscriptKnowledgeStates ?? [])]
  };
  const migratedIds = new Set(
    result.manuscriptChapters.map((chapter) => chapter.linkedNarrativeMilestoneId).filter(Boolean)
  );

  worldIds.forEach((worldId, worldIndex) => {
    const candidates = milestones
      .filter((milestone) => milestone.worldId === worldId && isLegacyManuscriptChapter(milestone))
      .sort((left, right) => finiteOrder(left.order, 0) - finiteOrder(right.order, 0));
    const worldHasManuscript = result.manuscriptBooks.some((book) => book.worldId === worldId);
    if (!candidates.length && worldHasManuscript) return;
    if (!candidates.length) return;

    let book = result.manuscriptBooks.find((item) => item.worldId === worldId);
    if (!book) {
      book = normalizeManuscriptBook(
        {
          id: `manuscript-book:${worldId}`,
          title: "主书稿",
          status: "drafting",
          order: worldIndex,
          createdAt: candidates[0]?.createdAt || now,
          updatedAt: candidates.at(-1)?.updatedAt || now
        },
        worldId,
        worldIndex
      );
      result.manuscriptBooks.push(book);
    }

    const volumeByTitle = new Map(
      result.manuscriptVolumes
        .filter((volume) => volume.bookId === book.id)
        .map((volume) => [volume.title.trim().toLocaleLowerCase("zh-CN"), volume])
    );
    candidates.forEach((milestone) => {
      if (migratedIds.has(milestone.id)) return;
      const volumeTitle = text(milestone.act, 500).trim() || "未分卷";
      const volumeKey = volumeTitle.toLocaleLowerCase("zh-CN");
      let volume = volumeByTitle.get(volumeKey);
      if (!volume) {
        volume = normalizeManuscriptVolume(
          {
            id: `manuscript-volume:${book.id}:${encodeURIComponent(volumeTitle)}`,
            title: volumeTitle,
            status: legacyStatus(milestone.status),
            order: volumeByTitle.size,
            createdAt: milestone.createdAt || now,
            updatedAt: milestone.updatedAt || now
          },
          worldId,
          book.id,
          volumeByTitle.size
        );
        volumeByTitle.set(volumeKey, volume);
        result.manuscriptVolumes.push(volume);
      }
      const chapterOrder = result.manuscriptChapters.filter(
        (chapter) => chapter.volumeId === volume?.id
      ).length;
      result.manuscriptChapters.push(
        normalizeManuscriptChapter(
          {
            id: `manuscript-chapter:${milestone.id}`,
            title: milestone.title || `章节 ${chapterOrder + 1}`,
            summary: milestone.summary || "",
            body: milestone.manuscriptBody || "",
            notes: milestone.developerNotes || "",
            status: legacyStatus(milestone.status),
            order: chapterOrder,
            linkedNarrativeMilestoneId: milestone.id,
            linkedStorySceneIds: milestone.linkedSceneIds || [],
            createdAt: milestone.createdAt || now,
            updatedAt: milestone.updatedAt || now
          },
          worldId,
          book.id,
          volume.id,
          chapterOrder
        )
      );
      migratedIds.add(milestone.id);
    });
  });
  return result;
}

export function normalizeManuscriptWorkspace(
  input: Partial<ManuscriptWorkspaceData>,
  worldIds: string[],
  legacyMilestones: LegacyManuscriptMilestone[] = []
): ManuscriptWorkspaceData {
  const worldSet = new Set(worldIds);
  const books = (input.manuscriptBooks ?? [])
    .filter((book) => worldSet.has(book.worldId))
    .map((book, index) => normalizeManuscriptBook(book, book.worldId, index));
  const bookById = new Map(books.map((book) => [book.id, book]));
  const volumes = (input.manuscriptVolumes ?? [])
    .filter((volume) => bookById.get(volume.bookId)?.worldId === volume.worldId)
    .map((volume, index) => normalizeManuscriptVolume(volume, volume.worldId, volume.bookId, index));
  const volumeById = new Map(volumes.map((volume) => [volume.id, volume]));
  const chapters = (input.manuscriptChapters ?? [])
    .filter((chapter) => {
      const book = bookById.get(chapter.bookId);
      const volume = volumeById.get(chapter.volumeId);
      return book && volume && book.worldId === chapter.worldId && volume.bookId === book.id;
    })
    .map((chapter, index) =>
      normalizeManuscriptChapter(
        chapter,
        chapter.worldId,
        chapter.bookId,
        chapter.volumeId,
        index
      )
    );
  const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const scenes = (input.manuscriptScenes ?? [])
    .map((scene, index) => {
      const chapter = chapterById.get(scene.chapterId);
      return chapter ? normalizeManuscriptScene(scene, chapter, index) : null;
    })
    .filter((scene): scene is ManuscriptScene => Boolean(scene));
  const clues = (input.manuscriptClues ?? [])
    .filter((clue) => bookById.get(clue.bookId)?.worldId === clue.worldId)
    .map((clue, index) => normalizeManuscriptClue(clue, clue.worldId, clue.bookId, index));
  const knowledge = (input.manuscriptKnowledgeStates ?? [])
    .filter((item) => bookById.get(item.bookId)?.worldId === item.worldId)
    .map((item, index) =>
      normalizeManuscriptKnowledgeState(item, item.worldId, item.bookId, index)
    );

  return migrateLegacyManuscript(
    worldIds,
    legacyMilestones,
    {
      manuscriptBooks: books,
      manuscriptVolumes: volumes,
      manuscriptChapters: chapters,
      manuscriptScenes: scenes,
      manuscriptClues: clues,
      manuscriptKnowledgeStates: knowledge
    }
  );
}

export function getManuscriptStatistics(
  data: ManuscriptWorkspaceData,
  bookId?: string
): ManuscriptStatistics {
  const books = bookId
    ? data.manuscriptBooks.filter((book) => book.id === bookId)
    : data.manuscriptBooks;
  const bookIds = new Set(books.map((book) => book.id));
  const volumes = data.manuscriptVolumes.filter((volume) => bookIds.has(volume.bookId));
  const chapters = data.manuscriptChapters.filter((chapter) => bookIds.has(chapter.bookId));
  const scenes = data.manuscriptScenes.filter((scene) => bookIds.has(scene.bookId));
  const totalWords =
    chapters.reduce((sum, chapter) => sum + countManuscriptWords(chapter.body), 0) +
    scenes.reduce((sum, scene) => sum + countManuscriptWords(scene.body), 0);
  const targetWords = books.reduce((sum, book) => sum + book.targetWordCount, 0);
  const statusCounts: Record<ManuscriptStatus, number> = {
    outline: 0,
    drafting: 0,
    revision: 0,
    final: 0
  };
  chapters.forEach((chapter) => {
    statusCounts[chapter.status] += 1;
  });
  return {
    bookCount: books.length,
    volumeCount: volumes.length,
    chapterCount: chapters.length,
    sceneCount: scenes.length,
    totalWords,
    targetWords,
    completionPercent: targetWords ? Math.min(100, Math.round((totalWords / targetWords) * 100)) : 0,
    statusCounts
  };
}

function unitOrder(
  unitKind: "chapter" | "scene",
  unitId: string,
  chapters: Map<string, ManuscriptChapter>,
  scenes: Map<string, ManuscriptScene>
) {
  if (unitKind === "chapter") return chapters.get(unitId)?.order ?? Number.POSITIVE_INFINITY;
  const scene = scenes.get(unitId);
  const chapter = scene ? chapters.get(scene.chapterId) : null;
  return (chapter?.order ?? Number.POSITIVE_INFINITY) * 10_000 + (scene?.order ?? 0);
}

function comparableTimeline(value: string) {
  const normalized = value.normalize("NFKC").trim();
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : normalized;
}

export function validateManuscriptConsistency(
  data: ManuscriptWorkspaceData,
  bookId: string
): ManuscriptConsistencyIssue[] {
  const issues: ManuscriptConsistencyIssue[] = [];
  const chapters = new Map(
    data.manuscriptChapters.filter((chapter) => chapter.bookId === bookId).map((chapter) => [chapter.id, chapter])
  );
  const scenes = new Map(
    data.manuscriptScenes.filter((scene) => scene.bookId === bookId).map((scene) => [scene.id, scene])
  );

  data.manuscriptClues.filter((clue) => clue.bookId === bookId).forEach((clue) => {
    const setupOrder = unitOrder(clue.setupUnitKind, clue.setupUnitId, chapters, scenes);
    const payoffOrder = unitOrder(clue.payoffUnitKind, clue.payoffUnitId, chapters, scenes);
    if (clue.status === "resolved" && (!clue.payoffUnitId || !Number.isFinite(payoffOrder))) {
      issues.push({
        id: `MS-001:${clue.id}`,
        ruleId: "MS-001",
        severity: "major",
        title: `线索“${clue.title}”已标记回收但没有有效回收位置`,
        detail: "回收章节或场景已经缺失，AI 也无法定位原句。",
        suggestion: "重新选择回收章节/场景，或把线索状态改回未闭合。",
        unitKind: "clue",
        unitId: clue.id,
        relatedUnitIds: []
      });
    } else if (clue.payoffUnitId && payoffOrder <= setupOrder) {
      issues.push({
        id: `MS-002:${clue.id}`,
        ruleId: "MS-002",
        severity: "major",
        title: `线索“${clue.title}”的回收早于埋设`,
        detail: "当前书稿顺序中，回收位置不晚于埋设位置。",
        suggestion: "调整章节顺序，或修正埋设与回收位置。",
        unitKind: "clue",
        unitId: clue.id,
        relatedUnitIds: [clue.setupUnitId, clue.payoffUnitId].filter(Boolean)
      });
    }
  });

  const knowledgeGroups = new Map<string, ManuscriptKnowledgeState[]>();
  data.manuscriptKnowledgeStates.filter((item) => item.bookId === bookId).forEach((item) => {
    const key = `${item.characterId}\u0000${item.fact.normalize("NFKC").toLocaleLowerCase("zh-CN")}`;
    knowledgeGroups.set(key, [...(knowledgeGroups.get(key) ?? []), item]);
  });
  knowledgeGroups.forEach((states) => {
    const ordered = [...states].sort(
      (left, right) =>
        unitOrder(left.unitKind, left.unitId, chapters, scenes) -
        unitOrder(right.unitKind, right.unitId, chapters, scenes)
    );
    const rank: Record<ManuscriptKnowledgeLevel, number> = { unknown: 0, suspected: 1, known: 2 };
    ordered.slice(1).forEach((current, index) => {
      const previous = ordered[index];
      if (rank[current.level] >= rank[previous.level]) return;
      issues.push({
        id: `MS-003:${previous.id}:${current.id}`,
        ruleId: "MS-003",
        severity: previous.authorConfirmed && current.authorConfirmed ? "critical" : "major",
        title: "人物知识状态无解释地倒退",
        detail: `同一事实从“${previous.level}”变为“${current.level}”。`,
        suggestion: "确认是否存在失忆、欺骗或视角差异；否则修正较后的知识状态。",
        unitKind: "knowledge",
        unitId: current.id,
        relatedUnitIds: [previous.unitId, current.unitId]
      });
    });
  });

  [...chapters.values(), ...scenes.values()].forEach((unit) => {
    const start = comparableTimeline(unit.timelineStart);
    const end = comparableTimeline(unit.timelineEnd);
    if (start === null || end === null || typeof start !== typeof end || start <= end) return;
    issues.push({
      id: `MS-004:${unit.id}`,
      ruleId: "MS-004",
      severity: "major",
      title: `“${unit.title}”的章节时间顺序反转`,
      detail: `${unit.timelineStart} 晚于 ${unit.timelineEnd}。`,
      suggestion: "修正章节/场景开始与结束时间，或留空无法比较的时间字段。",
      unitKind: "chapterId" in unit ? "scene" : "chapter",
      unitId: unit.id,
      relatedUnitIds: []
    });
  });

  return issues;
}

export function buildManuscriptContext(
  data: ManuscriptWorkspaceData,
  bookId: string,
  target?: { kind: ManuscriptUnitKind; id: string },
  maximumCharacters = 60_000
) {
  const book = data.manuscriptBooks.find((item) => item.id === bookId);
  if (!book) return "";
  const volumes = sortManuscriptUnits(
    data.manuscriptVolumes.filter((volume) => volume.bookId === bookId)
  );
  const chapters = sortManuscriptUnits(
    data.manuscriptChapters.filter((chapter) => chapter.bookId === bookId)
  );
  const scenes = sortManuscriptUnits(
    data.manuscriptScenes.filter((scene) => scene.bookId === bookId)
  );
  const openClues = data.manuscriptClues.filter(
    (clue) => clue.bookId === bookId && clue.status === "open"
  );
  const confirmedKnowledge = data.manuscriptKnowledgeStates.filter(
    (item) => item.bookId === bookId && item.authorConfirmed
  );
  const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const lines = [
    `【全书】${book.title}${book.subtitle ? ` · ${book.subtitle}` : ""}${target?.kind === "book" ? "（当前目标）" : ""}`,
    `全书摘要：${book.summary || "暂无"}`,
    ...volumes.map((volume) =>
      `【卷】${volume.title}${target?.kind === "volume" && target.id === volume.id ? "（当前目标）" : ""}\n卷摘要：${volume.summary || "暂无"}`
    ),
    "【作者确认的事实，优先级最高】",
    ...(confirmedKnowledge.length
      ? confirmedKnowledge.map(
          (item) => `- ${item.characterId}｜${item.fact}｜${item.level}｜${item.unitKind}:${item.unitId}`
        )
      : ["- 无"]),
    "【未闭合线索】",
    ...(openClues.length
      ? openClues.map((clue) => `- ${clue.title}：${clue.description || "暂无说明"}`)
      : ["- 无"]),
    "【章节索引】",
    ...chapters.map((chapter) => {
      const marker = target?.kind === "chapter" && target.id === chapter.id ? "（当前目标）" : "";
      return `${chapter.title}${marker}｜${manuscriptStatusLabels[chapter.status]}｜${countManuscriptWords(chapter.body)} 字\n摘要：${chapter.summary || "暂无"}`;
    }),
    "【场景索引】",
    ...(scenes.length
      ? scenes.map((scene) => {
          const chapter = chapterById.get(scene.chapterId);
          const marker = target?.kind === "scene" && target.id === scene.id ? "（当前目标）" : "";
          return `- ${chapter?.title || "未归档章节"} / ${scene.title}${marker}｜${manuscriptStatusLabels[scene.status]}｜${scene.summary || "暂无摘要"}`;
        })
      : ["- 无"]),
    ...(target?.kind === "chapter"
      ? (() => {
          const chapter = chapters.find((item) => item.id === target.id);
          return chapter
            ? [`【当前章节正文】\n${manuscriptPlainText(chapter.body)}`]
            : [];
        })()
      : []),
    ...(target?.kind === "scene"
      ? (() => {
          const scene = scenes.find((item) => item.id === target.id);
          return scene
            ? [`【当前场景】${scene.title}\n摘要：${scene.summary || "暂无"}\n正文：${manuscriptPlainText(scene.body)}`]
            : [];
        })()
      : []),
  ];
  return lines.join("\n\n").slice(0, Math.max(1000, maximumCharacters));
}
