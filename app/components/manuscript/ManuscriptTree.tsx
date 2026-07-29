"use client";

import {
  BookOpen,
  BookPlus,
  ChevronDown,
  ChevronRight,
  FilePlus2,
  FileText,
  GripVertical,
  PanelLeftClose,
  Plus,
  Search
} from "lucide-react";
import type { DragEvent } from "react";
import {
  countManuscriptWords,
  manuscriptStatusLabels,
  type ManuscriptBook,
  type ManuscriptChapter,
  type ManuscriptScene,
  type ManuscriptVolume
} from "../../manuscript";

export type ManuscriptTreeDrag = {
  kind: "volume" | "chapter" | "scene";
  id: string;
};

export function ManuscriptTree({
  books,
  chapters,
  collapsedIds,
  normalizedQuery,
  onAddBook,
  onAddChapter,
  onAddVolume,
  onCreateInitialStructure,
  onDragStart,
  onDropChapter,
  onDropScene,
  onDropVolume,
  onClose,
  onQueryChange,
  onSelectChapter,
  onSelectScene,
  onToggleCollapsed,
  query,
  scenes,
  selectedChapterId,
  selectedSceneId,
  targetWords,
  totalWords,
  visibleChapterIds,
  volumes
}: {
  books: ManuscriptBook[];
  chapters: ManuscriptChapter[];
  collapsedIds: string[];
  normalizedQuery: string;
  onAddBook: () => void;
  onAddChapter: (volume: ManuscriptVolume) => void;
  onAddVolume: (book: ManuscriptBook) => void;
  onCreateInitialStructure: () => void;
  onDragStart: (dragged: ManuscriptTreeDrag) => void;
  onDropChapter: (event: DragEvent, chapter: ManuscriptChapter) => void;
  onDropScene: (event: DragEvent, scene: ManuscriptScene) => void;
  onDropVolume: (event: DragEvent, volume: ManuscriptVolume) => void;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onSelectChapter: (chapterId: string) => void;
  onSelectScene: (scene: ManuscriptScene) => void;
  onToggleCollapsed: (id: string) => void;
  query: string;
  scenes: ManuscriptScene[];
  selectedChapterId: string;
  selectedSceneId: string;
  targetWords: number;
  totalWords: number;
  visibleChapterIds: Set<string>;
  volumes: ManuscriptVolume[];
}) {
  return (
    <aside className="manuscript-tree-panel">
      <div className="manuscript-tree-heading">
        <div>
          <strong>书稿</strong>
          <span>{totalWords.toLocaleString("zh-CN")} / {targetWords.toLocaleString("zh-CN")} 字</span>
        </div>
        <div className="manuscript-tree-heading-actions">
          <button aria-label="收起书稿目录" title="收起书稿目录" type="button" onClick={onClose}>
            <PanelLeftClose size={17} />
          </button>
          <button aria-label="新建书稿" title="新建书稿" type="button" onClick={onAddBook}>
            <BookPlus size={17} />
          </button>
        </div>
      </div>
      <label className="manuscript-tree-search">
        <Search size={15} />
        <input aria-label="搜索书稿" placeholder="搜索章节与正文" value={query} onChange={(event) => onQueryChange(event.target.value)} />
      </label>
      <div className="manuscript-tree" role="tree" aria-label="书稿结构">
        {books.map((book) => {
          const bookVolumes = volumes.filter((volume) => volume.bookId === book.id);
          const bookCollapsed = collapsedIds.includes(book.id);
          return (
            <section className="manuscript-book-tree" key={book.id}>
              <div className="manuscript-tree-book-row">
                <button aria-label={`${bookCollapsed ? "展开" : "收起"}${book.title}`} type="button" onClick={() => onToggleCollapsed(book.id)}>
                  {bookCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                </button>
                <BookOpen size={16} />
                <strong title={book.title}>{book.title}</strong>
                <button aria-label={`在${book.title}中新建卷`} title="新建卷" type="button" onClick={() => onAddVolume(book)}><Plus size={15} /></button>
              </div>
              {!bookCollapsed ? bookVolumes.map((volume) => {
                const volumeCollapsed = collapsedIds.includes(volume.id);
                const volumeChapters = chapters.filter((chapter) => chapter.volumeId === volume.id);
                const visibleVolumeChapters = normalizedQuery
                  ? volumeChapters.filter((chapter) => visibleChapterIds.has(chapter.id))
                  : volumeChapters;
                if (normalizedQuery && !visibleVolumeChapters.length) return null;
                return (
                  <div className="manuscript-volume-tree" key={volume.id}>
                    <div
                      className="manuscript-tree-volume-row"
                      draggable
                      onDragStart={() => onDragStart({ kind: "volume", id: volume.id })}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => onDropVolume(event, volume)}
                    >
                      <GripVertical size={14} />
                      <button aria-label={`${volumeCollapsed ? "展开" : "收起"}${volume.title}`} type="button" onClick={() => onToggleCollapsed(volume.id)}>
                        {volumeCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <span title={volume.title}>{volume.title}</span>
                      <button aria-label={`在${volume.title}中新建章节`} title="新建章节" type="button" onClick={() => onAddChapter(volume)}><FilePlus2 size={14} /></button>
                    </div>
                    {!volumeCollapsed ? visibleVolumeChapters.map((chapter) => {
                      const chapterScenes = scenes.filter((scene) => scene.chapterId === chapter.id);
                      const active = chapter.id === selectedChapterId && !selectedSceneId;
                      return (
                        <div className="manuscript-chapter-tree" key={chapter.id}>
                          <button
                            className={active ? "is-active" : ""}
                            draggable
                            type="button"
                            onClick={() => onSelectChapter(chapter.id)}
                            onDragStart={() => onDragStart({ kind: "chapter", id: chapter.id })}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => onDropChapter(event, chapter)}
                          >
                            <GripVertical size={14} />
                            <FileText size={15} />
                            <span><strong>{chapter.title}</strong><small>{countManuscriptWords(chapter.body).toLocaleString("zh-CN")} 字 · {manuscriptStatusLabels[chapter.status]}</small></span>
                          </button>
                          {chapterScenes.map((scene) => (
                            <button
                              className={scene.id === selectedSceneId ? "is-active is-scene" : "is-scene"}
                              draggable
                              key={scene.id}
                              type="button"
                              onClick={() => onSelectScene(scene)}
                              onDragStart={() => onDragStart({ kind: "scene", id: scene.id })}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => onDropScene(event, scene)}
                            >
                              <GripVertical size={13} />
                              <span><strong>{scene.title}</strong><small>{countManuscriptWords(scene.body).toLocaleString("zh-CN")} 字</small></span>
                            </button>
                          ))}
                        </div>
                      );
                    }) : null}
                  </div>
                );
              }) : null}
            </section>
          );
        })}
        {!books.length ? (
          <button className="manuscript-tree-empty" type="button" onClick={onCreateInitialStructure}>
            <BookOpen size={26} />
            <strong>建立第一本书稿</strong>
          </button>
        ) : null}
      </div>
    </aside>
  );
}
