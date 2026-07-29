"use client";

import { useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";
import {
  createManuscriptBook,
  createManuscriptChapter,
  createManuscriptId,
  createManuscriptScene,
  createManuscriptVolume,
  countManuscriptWords,
  getManuscriptStatistics,
  manuscriptPlainText,
  mergeManuscriptChapters,
  moveManuscriptUnit,
  normalizeManuscriptBook,
  normalizeManuscriptAnnotation,
  normalizeManuscriptChapter,
  normalizeManuscriptClue,
  normalizeManuscriptKnowledgeState,
  normalizeManuscriptScene,
  normalizeManuscriptVolume,
  resequenceManuscriptUnits,
  recordManuscriptWritingDay,
  replaceManuscriptAnnotationQuote,
  sortManuscriptUnits,
  splitManuscriptChapter
} from "../manuscript";
import type {
  ManuscriptBook,
  ManuscriptAnnotation,
  ManuscriptChapter,
  ManuscriptClue,
  ManuscriptKnowledgeState,
  ManuscriptScene,
  ManuscriptVolume,
  ManuscriptWorkspaceData
} from "../manuscript";
import type { ProjectReferenceOption } from "./ProjectReferencePicker";
import {
  ManuscriptInspector,
  type ManuscriptInspectorTab
} from "./manuscript/ManuscriptInspector";
import {
  ManuscriptTree,
  type ManuscriptTreeDrag
} from "./manuscript/ManuscriptTree";
import { ManuscriptWritingPanel } from "./manuscript/ManuscriptWritingPanel";
import { ManuscriptPublicationDialog } from "./ManuscriptPublicationDialog";
import type {
  ManuscriptPublicationExportResult,
  ManuscriptPublicationRequest
} from "../manuscript-publication";

type ManuscriptEntityOption = {
  id: string;
  title: string;
  type: string;
};

type ManuscriptAssetOption = {
  id: string;
  name: string;
  storedName: string;
  url: string;
};

export type ManuscriptChapterVersion = {
  id: number;
  collection: string;
  itemId: string;
  reason: string;
  createdAt: string;
  item: ManuscriptChapter;
};

type ManuscriptSelection = {
  kind: "chapter" | "scene";
  id: string;
};

function manuscriptBookWords(
  bookId: string,
  chapters: ManuscriptChapter[],
  scenes: ManuscriptScene[]
) {
  return chapters
    .filter((chapter) => chapter.bookId === bookId)
    .reduce((total, chapter) => total + countManuscriptWords(chapter.body), 0) +
    scenes
      .filter((scene) => scene.bookId === bookId)
      .reduce((total, scene) => total + countManuscriptWords(scene.body), 0);
}

function textDiff(previous: string, current: string) {
  const left = manuscriptPlainText(previous).split("\n");
  const right = manuscriptPlainText(current).split("\n");
  let prefix = 0;
  while (prefix < left.length && prefix < right.length && left[prefix] === right[prefix]) {
    prefix += 1;
  }
  let suffix = 0;
  while (
    suffix < left.length - prefix &&
    suffix < right.length - prefix &&
    left[left.length - 1 - suffix] === right[right.length - 1 - suffix]
  ) {
    suffix += 1;
  }
  return {
    removed: left.slice(prefix, left.length - suffix).join("\n").slice(0, 8000),
    added: right.slice(prefix, right.length - suffix).join("\n").slice(0, 8000)
  };
}

function replaceWorldCollection<T extends { worldId: string }>(
  all: T[],
  worldId: string,
  next: T[]
) {
  return [...all.filter((item) => item.worldId !== worldId), ...next];
}

export function ManuscriptWorkspace({
  assets,
  data,
  entities,
  onChange,
  onLoadChapterVersions,
  onExportPublication,
  onRestoreChapterVersion,
  onSelect,
  referenceOptions,
  selectedChapterId,
  tags,
  worldId,
  worldName
}: {
  assets: ManuscriptAssetOption[];
  data: ManuscriptWorkspaceData;
  entities: ManuscriptEntityOption[];
  onChange: (
    data: ManuscriptWorkspaceData,
    reason: string,
    destructive?: boolean
  ) => void | Promise<void>;
  onLoadChapterVersions?: (chapterId: string) => Promise<ManuscriptChapterVersion[]>;
  onExportPublication: (
    request: ManuscriptPublicationRequest
  ) => Promise<ManuscriptPublicationExportResult>;
  onRestoreChapterVersion?: (version: ManuscriptChapterVersion) => void | Promise<void>;
  onSelect: (selection: ManuscriptSelection) => void;
  referenceOptions: ProjectReferenceOption[];
  selectedChapterId: string;
  tags: string[];
  worldId: string;
  worldName: string;
}) {
  const [query, setQuery] = useState("");
  const [inspectorTab, setInspectorTab] = useState<ManuscriptInspectorTab>("structure");
  const [selectedSceneId, setSelectedSceneId] = useState("");
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const [dragged, setDragged] = useState<ManuscriptTreeDrag | null>(null);
  const [versions, setVersions] = useState<ManuscriptChapterVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [publicationOpen, setPublicationOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState("");

  useEffect(() => {
    if (window.matchMedia("(max-width: 820px)").matches) setOutlineOpen(false);
  }, []);

  const books = useMemo(
    () => sortManuscriptUnits(data.manuscriptBooks.filter((book) => book.worldId === worldId)),
    [data.manuscriptBooks, worldId]
  );
  const volumes = useMemo(
    () => sortManuscriptUnits(data.manuscriptVolumes.filter((volume) => volume.worldId === worldId)),
    [data.manuscriptVolumes, worldId]
  );
  const chapters = useMemo(
    () => sortManuscriptUnits(data.manuscriptChapters.filter((chapter) => chapter.worldId === worldId)),
    [data.manuscriptChapters, worldId]
  );
  const scenes = useMemo(
    () => sortManuscriptUnits(data.manuscriptScenes.filter((scene) => scene.worldId === worldId)),
    [data.manuscriptScenes, worldId]
  );
  const selectedChapter =
    chapters.find((chapter) => chapter.id === selectedChapterId) ?? chapters[0] ?? null;
  const selectedScene = selectedChapter
    ? scenes.find(
        (scene) => scene.id === selectedSceneId && scene.chapterId === selectedChapter.id
      ) ?? null
    : null;

  useEffect(() => {
    setSelectedQuote("");
    const handleSelectionChange = () => {
      const selection = document.getSelection();
      const text = selection?.toString().trim() ?? "";
      if (!selection || selection.isCollapsed || !text || text.length > 20_000) return;
      const anchor = selection.anchorNode instanceof Element
        ? selection.anchorNode
        : selection.anchorNode?.parentElement;
      if (!anchor?.closest(".manuscript-prose-editor")) return;
      setSelectedQuote(text);
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [selectedChapter?.id, selectedScene?.id]);

  const selectedUnit = selectedScene ?? selectedChapter;
  const selectedBook = selectedUnit
    ? books.find((book) => book.id === selectedUnit.bookId) ?? null
    : books[0] ?? null;
  const selectedVolume = selectedUnit
    ? volumes.find((volume) => volume.id === selectedUnit.volumeId) ?? null
    : selectedBook
      ? volumes.find((volume) => volume.bookId === selectedBook.id) ?? null
      : null;
  const statistics = useMemo(
    () => getManuscriptStatistics(data, selectedBook?.id),
    [data, selectedBook?.id]
  );
  const selectedVersion = versions.find((version) => version.id === selectedVersionId) ?? null;
  const versionDiff = selectedVersion && selectedChapter
    ? textDiff(selectedVersion.item.body, selectedChapter.body)
    : null;

  const normalizedQuery = query.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
  const visibleChapterIds = new Set(
    chapters
      .filter((chapter) =>
        !normalizedQuery ||
        [chapter.title, chapter.summary, manuscriptPlainText(chapter.body)]
          .join(" ")
          .normalize("NFKC")
          .toLocaleLowerCase("zh-CN")
          .includes(normalizedQuery)
      )
      .map((chapter) => chapter.id)
  );

  useEffect(() => {
    if (!selectedChapter || selectedChapter.id === selectedChapterId) return;
    onSelect({ kind: "chapter", id: selectedChapter.id });
  }, [onSelect, selectedChapter, selectedChapterId]);

  useEffect(() => {
    if (selectedSceneId && !scenes.some((scene) => scene.id === selectedSceneId)) {
      setSelectedSceneId("");
    }
  }, [scenes, selectedSceneId]);

  useEffect(() => {
    if (inspectorTab !== "history" || !selectedChapter || !onLoadChapterVersions) return;
    let active = true;
    setHistoryLoading(true);
    void onLoadChapterVersions(selectedChapter.id)
      .then((items) => {
        if (!active) return;
        setVersions(items);
        setSelectedVersionId(items[0]?.id ?? null);
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [inspectorTab, onLoadChapterVersions, selectedChapter?.id]);

  function commit(next: ManuscriptWorkspaceData, reason: string, destructive = false) {
    void onChange(next, reason, destructive);
  }

  function updateBook(bookId: string, patch: Partial<ManuscriptBook>) {
    commit(
      {
        ...data,
        manuscriptBooks: data.manuscriptBooks.map((book, index) =>
          book.id === bookId
            ? normalizeManuscriptBook(
                { ...book, ...patch, updatedAt: new Date().toISOString() },
                book.worldId,
                index
              )
            : book
        )
      },
      "编辑书稿"
    );
  }

  function updateVolume(volumeId: string, patch: Partial<ManuscriptVolume>) {
    commit(
      {
        ...data,
        manuscriptVolumes: data.manuscriptVolumes.map((volume, index) =>
          volume.id === volumeId
            ? normalizeManuscriptVolume(
                { ...volume, ...patch, updatedAt: new Date().toISOString() },
                volume.worldId,
                volume.bookId,
                index
              )
            : volume
        )
      },
      "编辑文稿卷"
    );
  }

  function updateChapter(chapterId: string, patch: Partial<ManuscriptChapter>) {
    const currentChapter = data.manuscriptChapters.find((chapter) => chapter.id === chapterId);
    if (!currentChapter) return;
    const beforeWords = manuscriptBookWords(
      currentChapter.bookId,
      data.manuscriptChapters,
      data.manuscriptScenes
    );
    const nextChapters = data.manuscriptChapters.map((chapter, index) =>
      chapter.id === chapterId
        ? normalizeManuscriptChapter(
            { ...chapter, ...patch, updatedAt: new Date().toISOString() },
            chapter.worldId,
            chapter.bookId,
            patch.volumeId ?? chapter.volumeId,
            index
          )
        : chapter
    );
    const afterWords = manuscriptBookWords(
      currentChapter.bookId,
      nextChapters,
      data.manuscriptScenes
    );
    commit(
      {
        ...data,
        manuscriptBooks: patch.body !== undefined && beforeWords !== afterWords
          ? data.manuscriptBooks.map((book) => book.id === currentChapter.bookId
              ? recordManuscriptWritingDay(book, beforeWords, afterWords)
              : book)
          : data.manuscriptBooks,
        manuscriptChapters: nextChapters
      },
      "编辑文稿章节"
    );
  }

  function updateScene(sceneId: string, patch: Partial<ManuscriptScene>) {
    const scene = data.manuscriptScenes.find((item) => item.id === sceneId);
    const parent = data.manuscriptChapters.find(
      (chapter) => chapter.id === (patch.chapterId ?? scene?.chapterId)
    );
    if (!scene || !parent) return;
    const beforeWords = manuscriptBookWords(
      scene.bookId,
      data.manuscriptChapters,
      data.manuscriptScenes
    );
    const nextScenes = data.manuscriptScenes.map((item, index) =>
      item.id === sceneId
        ? normalizeManuscriptScene(
            { ...item, ...patch, updatedAt: new Date().toISOString() },
            parent,
            index
          )
        : item
    );
    const afterWords = manuscriptBookWords(scene.bookId, data.manuscriptChapters, nextScenes);
    commit(
      {
        ...data,
        manuscriptBooks: patch.body !== undefined && beforeWords !== afterWords
          ? data.manuscriptBooks.map((book) => book.id === scene.bookId
              ? recordManuscriptWritingDay(book, beforeWords, afterWords)
              : book)
          : data.manuscriptBooks,
        manuscriptScenes: nextScenes
      },
      "编辑文稿场景"
    );
  }

  function updateSelectedAnnotations(
    updater: (annotations: ManuscriptAnnotation[]) => ManuscriptAnnotation[],
    body?: string
  ) {
    if (!selectedUnit) return;
    const annotations = updater(selectedUnit.annotations);
    if (selectedScene) {
      updateScene(selectedScene.id, { annotations, ...(body === undefined ? {} : { body }) });
    } else if (selectedChapter) {
      updateChapter(selectedChapter.id, { annotations, ...(body === undefined ? {} : { body }) });
    }
  }

  function addAnnotation(input: {
    comment: string;
    kind: ManuscriptAnnotation["kind"];
    quote: string;
    replacement: string;
  }) {
    const annotation = normalizeManuscriptAnnotation({
      ...input,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    updateSelectedAnnotations((annotations) => [annotation, ...annotations]);
  }

  function updateAnnotation(annotationId: string, patch: Partial<ManuscriptAnnotation>) {
    updateSelectedAnnotations((annotations) => annotations.map((annotation, index) =>
      annotation.id === annotationId
        ? normalizeManuscriptAnnotation(
            { ...annotation, ...patch, updatedAt: new Date().toISOString() },
            index
          )
        : annotation
    ));
  }

  function deleteAnnotation(annotationId: string) {
    updateSelectedAnnotations((annotations) =>
      annotations.filter((annotation) => annotation.id !== annotationId)
    );
  }

  function addAnnotationReply(annotationId: string, replyBody: string) {
    updateSelectedAnnotations((annotations) => annotations.map((annotation, index) =>
      annotation.id === annotationId
        ? normalizeManuscriptAnnotation({
            ...annotation,
            replies: [...annotation.replies, {
              id: createManuscriptId("annotation-reply"),
              body: replyBody,
              createdAt: new Date().toISOString()
            }],
            updatedAt: new Date().toISOString()
          }, index)
        : annotation
    ));
  }

  function acceptAnnotation(annotationId: string) {
    if (!selectedUnit) return false;
    const annotation = selectedUnit.annotations.find((item) => item.id === annotationId);
    if (!annotation || annotation.kind !== "suggestion" || annotation.status !== "open") {
      return false;
    }
    const result = replaceManuscriptAnnotationQuote(
      selectedUnit.body,
      annotation.quote,
      annotation.replacement
    );
    if (!result.replaced) return false;
    updateSelectedAnnotations((annotations) => annotations.map((item) =>
      item.id === annotationId
        ? { ...item, status: "accepted", updatedAt: new Date().toISOString() }
        : item
    ), result.body);
    return true;
  }

  function createInitialStructure() {
    const now = new Date().toISOString();
    const book = createManuscriptBook(worldId, books.length, worldName || "主书稿", now);
    const volume = createManuscriptVolume(worldId, book.id, 0, "第一卷", now);
    const chapter = createManuscriptChapter(worldId, book.id, volume.id, 0, "第一章", now);
    commit({
      ...data,
      manuscriptBooks: [...data.manuscriptBooks, book],
      manuscriptVolumes: [...data.manuscriptVolumes, volume],
      manuscriptChapters: [...data.manuscriptChapters, chapter]
    }, "创建书稿结构");
    onSelect({ kind: "chapter", id: chapter.id });
  }

  function addBook() {
    const book = createManuscriptBook(worldId, books.length, `新书稿 ${books.length + 1}`);
    const volume = createManuscriptVolume(worldId, book.id, 0, "第一卷");
    const chapter = createManuscriptChapter(worldId, book.id, volume.id, 0, "第一章");
    commit({
      ...data,
      manuscriptBooks: [...data.manuscriptBooks, book],
      manuscriptVolumes: [...data.manuscriptVolumes, volume],
      manuscriptChapters: [...data.manuscriptChapters, chapter]
    }, "新建书稿");
    onSelect({ kind: "chapter", id: chapter.id });
  }

  function addVolume(book = selectedBook) {
    if (!book) return createInitialStructure();
    const siblings = volumes.filter((volume) => volume.bookId === book.id);
    const volume = createManuscriptVolume(
      worldId,
      book.id,
      siblings.length,
      `第${siblings.length + 1}卷`
    );
    commit({ ...data, manuscriptVolumes: [...data.manuscriptVolumes, volume] }, "新建文稿卷");
  }

  function addChapter(volume = selectedVolume) {
    if (!volume) return createInitialStructure();
    const siblings = chapters.filter((chapter) => chapter.volumeId === volume.id);
    const chapter = createManuscriptChapter(
      worldId,
      volume.bookId,
      volume.id,
      siblings.length,
      `第${chapters.filter((item) => item.bookId === volume.bookId).length + 1}章`
    );
    commit({ ...data, manuscriptChapters: [...data.manuscriptChapters, chapter] }, "新建章节");
    setSelectedSceneId("");
    onSelect({ kind: "chapter", id: chapter.id });
  }

  function addScene(chapter = selectedChapter) {
    if (!chapter) return;
    const siblings = scenes.filter((scene) => scene.chapterId === chapter.id);
    const scene = createManuscriptScene(chapter, siblings.length, `场景 ${siblings.length + 1}`);
    commit({ ...data, manuscriptScenes: [...data.manuscriptScenes, scene] }, "新建章节场景");
    setSelectedSceneId(scene.id);
    onSelect({ kind: "scene", id: scene.id });
  }

  function selectChapter(chapterId: string) {
    setSelectedSceneId("");
    onSelect({ kind: "chapter", id: chapterId });
  }

  function selectScene(scene: ManuscriptScene) {
    setSelectedSceneId(scene.id);
    onSelect({ kind: "scene", id: scene.id });
  }

  function toggleCollapsed(id: string) {
    setCollapsedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function dropVolume(event: DragEvent, target: ManuscriptVolume) {
    event.preventDefault();
    if (!dragged) return;
    if (dragged.kind === "volume") {
      const moving = volumes.find((volume) => volume.id === dragged.id);
      if (!moving || moving.bookId !== target.bookId) return;
      const siblings = volumes.filter((volume) => volume.bookId === target.bookId);
      const moved = moveManuscriptUnit(siblings, moving.id, target.id);
      commit({
        ...data,
        manuscriptVolumes: replaceWorldCollection(
          data.manuscriptVolumes,
          worldId,
          volumes.map((volume) => moved.find((item) => item.id === volume.id) ?? volume)
        )
      }, "调整卷顺序");
    } else if (dragged.kind === "chapter") {
      const moving = chapters.find((chapter) => chapter.id === dragged.id);
      if (!moving || moving.bookId !== target.bookId) return;
      const moved = resequenceManuscriptUnits([
        ...chapters.filter((chapter) => chapter.volumeId === target.id && chapter.id !== moving.id),
        { ...moving, volumeId: target.id }
      ]);
      const movedById = new Map(moved.map((chapter) => [chapter.id, chapter]));
      commit({
        ...data,
        manuscriptChapters: data.manuscriptChapters.map((chapter) =>
          movedById.get(chapter.id) ?? chapter
        ),
        manuscriptScenes: data.manuscriptScenes.map((scene) =>
          scene.chapterId === moving.id
            ? { ...scene, volumeId: target.id, updatedAt: new Date().toISOString() }
            : scene
        )
      }, "移动章节到其他卷");
    }
    setDragged(null);
  }

  function dropChapter(event: DragEvent, target: ManuscriptChapter) {
    event.preventDefault();
    if (dragged?.kind !== "chapter") return;
    const moving = chapters.find((chapter) => chapter.id === dragged.id);
    if (!moving || moving.bookId !== target.bookId) return;
    const destination = chapters
      .filter((chapter) => chapter.volumeId === target.volumeId && chapter.id !== moving.id)
      .map((chapter) =>
        chapter.id === target.id ? { ...chapter } : chapter
      );
    const moved = moveManuscriptUnit(
      [...destination, { ...moving, volumeId: target.volumeId }],
      moving.id,
      target.id
    );
    const movedById = new Map(moved.map((chapter) => [chapter.id, chapter]));
    commit({
      ...data,
      manuscriptChapters: data.manuscriptChapters.map((chapter) =>
        movedById.get(chapter.id) ?? chapter
      ),
      manuscriptScenes: data.manuscriptScenes.map((scene) =>
        scene.chapterId === moving.id
          ? { ...scene, volumeId: target.volumeId, updatedAt: new Date().toISOString() }
          : scene
      )
    }, "调整章节顺序");
    setDragged(null);
  }

  function dropScene(event: DragEvent, target: ManuscriptScene) {
    event.preventDefault();
    if (dragged?.kind !== "scene") return;
    const moving = scenes.find((scene) => scene.id === dragged.id);
    const parent = chapters.find((chapter) => chapter.id === target.chapterId);
    if (!moving || !parent || moving.bookId !== target.bookId) return;
    const destination = scenes
      .filter((scene) => scene.chapterId === target.chapterId && scene.id !== moving.id)
      .map((scene) => ({ ...scene }));
    const moved = moveManuscriptUnit(
      [
        ...destination,
        {
          ...moving,
          chapterId: target.chapterId,
          volumeId: parent.volumeId
        }
      ],
      moving.id,
      target.id
    );
    const movedById = new Map(moved.map((scene) => [scene.id, scene]));
    commit({
      ...data,
      manuscriptScenes: data.manuscriptScenes.map((scene) => movedById.get(scene.id) ?? scene)
    }, "调整场景顺序");
    setDragged(null);
  }

  function splitCurrentChapter() {
    if (!selectedChapter || !manuscriptPlainText(selectedChapter.body)) return;
    const split = splitManuscriptChapter(selectedChapter);
    const siblings = chapters.filter((chapter) => chapter.volumeId === selectedChapter.volumeId);
    const index = siblings.findIndex((chapter) => chapter.id === selectedChapter.id);
    const nextSiblings = resequenceManuscriptUnits([
      ...siblings.slice(0, index),
      split.first,
      split.second,
      ...siblings.slice(index + 1)
    ], [
      ...siblings.slice(0, index).map((chapter) => chapter.id),
      split.first.id,
      split.second.id,
      ...siblings.slice(index + 1).map((chapter) => chapter.id)
    ]);
    const byId = new Map(nextSiblings.map((chapter) => [chapter.id, chapter]));
    commit({
      ...data,
      manuscriptChapters: [
        ...data.manuscriptChapters.map((chapter) => byId.get(chapter.id) ?? chapter),
        split.second
      ].filter((chapter, chapterIndex, all) => all.findIndex((item) => item.id === chapter.id) === chapterIndex)
    }, "拆分章节");
    onSelect({ kind: "chapter", id: split.second.id });
  }

  function mergeWithNextChapter() {
    if (!selectedChapter) return;
    const siblings = chapters.filter((chapter) => chapter.volumeId === selectedChapter.volumeId);
    const index = siblings.findIndex((chapter) => chapter.id === selectedChapter.id);
    const next = siblings[index + 1];
    if (!next || !window.confirm(`把“${next.title}”合并到“${selectedChapter.title}”？软件会先创建备份。`)) return;
    const merged = mergeManuscriptChapters(selectedChapter, next);
    commit({
      ...data,
      manuscriptChapters: resequenceManuscriptUnits(
        data.manuscriptChapters
          .filter((chapter) => chapter.id !== next.id)
          .map((chapter) => chapter.id === merged.id ? merged : chapter)
      ),
      manuscriptScenes: data.manuscriptScenes.map((scene) =>
        scene.chapterId === next.id
          ? { ...scene, chapterId: merged.id, updatedAt: new Date().toISOString() }
          : scene
      ),
      manuscriptClues: data.manuscriptClues.map((clue) => ({
        ...clue,
        setupUnitId:
          clue.setupUnitKind === "chapter" && clue.setupUnitId === next.id
            ? merged.id
            : clue.setupUnitId,
        payoffUnitId:
          clue.payoffUnitKind === "chapter" && clue.payoffUnitId === next.id
            ? merged.id
            : clue.payoffUnitId
      })),
      manuscriptKnowledgeStates: data.manuscriptKnowledgeStates.map((item) =>
        item.unitKind === "chapter" && item.unitId === next.id
          ? { ...item, unitId: merged.id }
          : item
      )
    }, "合并章节", true);
  }

  function deleteSelectedUnit() {
    if (selectedScene) {
      if (!window.confirm(`删除场景“${selectedScene.title}”？软件会先创建备份。`)) return;
      commit({
        ...data,
        manuscriptScenes: data.manuscriptScenes.filter((scene) => scene.id !== selectedScene.id),
        manuscriptClues: data.manuscriptClues.map((clue) => ({
          ...clue,
          setupUnitId:
            clue.setupUnitKind === "scene" && clue.setupUnitId === selectedScene.id
              ? ""
              : clue.setupUnitId,
          payoffUnitId:
            clue.payoffUnitKind === "scene" && clue.payoffUnitId === selectedScene.id
              ? ""
              : clue.payoffUnitId,
          status:
            clue.payoffUnitKind === "scene" && clue.payoffUnitId === selectedScene.id
              ? "open"
              : clue.status
        })),
        manuscriptKnowledgeStates: data.manuscriptKnowledgeStates.filter(
          (item) => !(item.unitKind === "scene" && item.unitId === selectedScene.id)
        )
      }, "删除文稿场景", true);
      setSelectedSceneId("");
      onSelect({ kind: "chapter", id: selectedChapter?.id ?? "" });
      return;
    }
    if (!selectedChapter || !window.confirm(`删除章节“${selectedChapter.title}”？软件会先创建备份。`)) return;
    const nextChapter = chapters.find((chapter) => chapter.id !== selectedChapter.id);
    const removedSceneIds = new Set(
      data.manuscriptScenes
        .filter((scene) => scene.chapterId === selectedChapter.id)
        .map((scene) => scene.id)
    );
    commit({
      ...data,
      manuscriptChapters: data.manuscriptChapters.filter(
        (chapter) => chapter.id !== selectedChapter.id
      ),
      manuscriptScenes: data.manuscriptScenes.filter(
        (scene) => scene.chapterId !== selectedChapter.id
      ),
      manuscriptClues: data.manuscriptClues.map((clue) => ({
        ...clue,
        setupUnitId:
          (clue.setupUnitKind === "chapter" && clue.setupUnitId === selectedChapter.id) ||
          (clue.setupUnitKind === "scene" && removedSceneIds.has(clue.setupUnitId))
            ? ""
            : clue.setupUnitId,
        payoffUnitId:
          (clue.payoffUnitKind === "chapter" && clue.payoffUnitId === selectedChapter.id) ||
          (clue.payoffUnitKind === "scene" && removedSceneIds.has(clue.payoffUnitId))
            ? ""
            : clue.payoffUnitId,
        status:
          (clue.payoffUnitKind === "chapter" && clue.payoffUnitId === selectedChapter.id) ||
          (clue.payoffUnitKind === "scene" && removedSceneIds.has(clue.payoffUnitId))
            ? "open"
            : clue.status
      })),
      manuscriptKnowledgeStates: data.manuscriptKnowledgeStates.filter(
        (item) =>
          !(item.unitKind === "chapter" && item.unitId === selectedChapter.id) &&
          !(item.unitKind === "scene" && removedSceneIds.has(item.unitId))
      )
    }, "删除文稿章节", true);
    onSelect({ kind: "chapter", id: nextChapter?.id ?? "" });
  }

  function addClue() {
    if (!selectedBook || !selectedUnit) return;
    const now = new Date().toISOString();
    const clue = normalizeManuscriptClue(
      {
        id: createManuscriptId("manuscript-clue"),
        title: "新线索",
        description: "",
        status: "open",
        setupUnitKind: selectedScene ? "scene" : "chapter",
        setupUnitId: selectedUnit.id,
        authorConfirmed: true,
        createdAt: now,
        updatedAt: now
      },
      worldId,
      selectedBook.id,
      data.manuscriptClues.length
    );
    commit({ ...data, manuscriptClues: [...data.manuscriptClues, clue] }, "新增伏笔线索");
  }

  function updateClue(clueId: string, patch: Partial<ManuscriptClue>) {
    commit({
      ...data,
      manuscriptClues: data.manuscriptClues.map((clue, index) =>
        clue.id === clueId
          ? normalizeManuscriptClue(
              { ...clue, ...patch, updatedAt: new Date().toISOString() },
              clue.worldId,
              clue.bookId,
              index
            )
          : clue
      )
    }, "编辑伏笔线索");
  }

  function addKnowledge() {
    if (!selectedBook || !selectedUnit) return;
    const now = new Date().toISOString();
    const item = normalizeManuscriptKnowledgeState(
      {
        id: createManuscriptId("manuscript-knowledge"),
        characterId: entities.find((entity) => entity.type === "character")?.id ?? "",
        fact: "新事实",
        level: "known",
        unitKind: selectedScene ? "scene" : "chapter",
        unitId: selectedUnit.id,
        authorConfirmed: true,
        createdAt: now,
        updatedAt: now
      },
      worldId,
      selectedBook.id,
      data.manuscriptKnowledgeStates.length
    );
    commit({
      ...data,
      manuscriptKnowledgeStates: [...data.manuscriptKnowledgeStates, item]
    }, "新增人物知识状态");
  }

  function updateKnowledge(itemId: string, patch: Partial<ManuscriptKnowledgeState>) {
    commit({
      ...data,
      manuscriptKnowledgeStates: data.manuscriptKnowledgeStates.map((item, index) =>
        item.id === itemId
          ? normalizeManuscriptKnowledgeState(
              { ...item, ...patch, updatedAt: new Date().toISOString() },
              item.worldId,
              item.bookId,
              index
            )
          : item
      )
    }, "编辑人物知识状态");
  }

  const bookClues = data.manuscriptClues.filter((clue) => clue.bookId === selectedBook?.id);
  const bookKnowledge = data.manuscriptKnowledgeStates.filter(
    (item) => item.bookId === selectedBook?.id
  );
  const unitOptions = [
    ...chapters
      .filter((chapter) => chapter.bookId === selectedBook?.id)
      .map((chapter) => ({ kind: "chapter" as const, id: chapter.id, label: chapter.title })),
    ...scenes
      .filter((scene) => scene.bookId === selectedBook?.id)
      .map((scene) => ({ kind: "scene" as const, id: scene.id, label: `场景 · ${scene.title}` }))
  ];

  function toggleOutline() {
    setOutlineOpen((current) => {
      const next = !current;
      if (next && window.matchMedia("(max-width: 1050px)").matches) {
        setInspectorOpen(false);
      }
      return next;
    });
  }

  function toggleInspector() {
    setInspectorOpen((current) => {
      const next = !current;
      if (next && window.matchMedia("(max-width: 1050px)").matches) {
        setOutlineOpen(false);
      }
      return next;
    });
  }

  function openReview() {
    setInspectorTab("review");
    setInspectorOpen(true);
    if (window.matchMedia("(max-width: 1050px)").matches) setOutlineOpen(false);
  }

  return (
    <div
      className={`manuscript-shell ${outlineOpen ? "has-outline" : "is-outline-closed"} ${inspectorOpen ? "has-inspector" : "is-inspector-closed"}`}
    >
      {outlineOpen ? <ManuscriptTree
        books={books}
        chapters={chapters}
        collapsedIds={collapsedIds}
        normalizedQuery={normalizedQuery}
        onAddBook={addBook}
        onAddChapter={addChapter}
        onAddVolume={addVolume}
        onCreateInitialStructure={createInitialStructure}
        onDragStart={setDragged}
        onDropChapter={dropChapter}
        onDropScene={dropScene}
        onDropVolume={dropVolume}
        onQueryChange={setQuery}
        onClose={() => setOutlineOpen(false)}
        onSelectChapter={selectChapter}
        onSelectScene={selectScene}
        onToggleCollapsed={toggleCollapsed}
        query={query}
        scenes={scenes}
        selectedChapterId={selectedChapter?.id ?? ""}
        selectedSceneId={selectedScene?.id ?? ""}
        targetWords={statistics.targetWords}
        totalWords={statistics.totalWords}
        visibleChapterIds={visibleChapterIds}
        volumes={volumes}
      /> : null}

      <ManuscriptWritingPanel
        assets={assets}
        entities={entities}
        onAddScene={addScene}
        onCreateInitialStructure={createInitialStructure}
        onDeleteSelectedUnit={deleteSelectedUnit}
        onMergeNextChapter={mergeWithNextChapter}
        onOpenPublication={() => setPublicationOpen(true)}
        onOpenReview={openReview}
        onToggleInspector={toggleInspector}
        onToggleOutline={toggleOutline}
        onSelectChapter={selectChapter}
        onSplitChapter={splitCurrentChapter}
        onUpdateChapter={updateChapter}
        onUpdateScene={updateScene}
        referenceOptions={referenceOptions}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        selectedScene={selectedScene}
        selectedVolume={selectedVolume}
        inspectorOpen={inspectorOpen}
        outlineOpen={outlineOpen}
        tags={tags}
        worldId={worldId}
      />

      {inspectorOpen ? <ManuscriptInspector
        bookClues={bookClues}
        bookKnowledge={bookKnowledge}
        entities={entities}
        historyLoading={historyLoading}
        onAcceptAnnotation={acceptAnnotation}
        onAddAnnotation={addAnnotation}
        onAddAnnotationReply={addAnnotationReply}
        onAddClue={addClue}
        onAddKnowledge={addKnowledge}
        onDeleteClue={(clueId) =>
          commit(
            {
              ...data,
              manuscriptClues: data.manuscriptClues.filter((item) => item.id !== clueId)
            },
            "删除伏笔",
            true
          )
        }
        onDeleteAnnotation={deleteAnnotation}
        onDeleteKnowledge={(knowledgeId) =>
          commit(
            {
              ...data,
              manuscriptKnowledgeStates: data.manuscriptKnowledgeStates.filter(
                (item) => item.id !== knowledgeId
              )
            },
            "删除人物知识",
            true
          )
        }
        onClose={() => setInspectorOpen(false)}
        onRestoreVersion={onRestoreChapterVersion}
        onSelectTab={setInspectorTab}
        onSelectVersion={setSelectedVersionId}
        onUpdateBook={updateBook}
        onUpdateAnnotation={updateAnnotation}
        onUpdateChapter={updateChapter}
        onUpdateClue={updateClue}
        onUpdateKnowledge={updateKnowledge}
        onUpdateScene={updateScene}
        onUpdateVolume={updateVolume}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        selectedScene={selectedScene}
        selectedTab={inspectorTab}
        selectedUnit={selectedUnit}
        selectedVersion={selectedVersion}
        selectedVersionId={selectedVersionId}
        selectedVolume={selectedVolume}
        selectedQuote={selectedQuote}
        targetWords={statistics.targetWords}
        totalWords={statistics.totalWords}
        unitOptions={unitOptions}
        versionDiff={versionDiff}
        versions={versions}
      /> : null}
      <ManuscriptPublicationDialog
        assets={assets.filter((asset) => asset.storedName)}
        books={books}
        chapters={chapters}
        defaultBookId={selectedBook?.id ?? ""}
        defaultChapterId={selectedChapter?.id ?? ""}
        open={publicationOpen}
        scenes={scenes}
        volumes={volumes}
        worldName={worldName}
        onClose={() => setPublicationOpen(false)}
        onExport={onExportPublication}
      />
    </div>
  );
}
