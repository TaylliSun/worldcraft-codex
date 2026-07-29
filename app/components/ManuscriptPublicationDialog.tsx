"use client";

import {
  BookOpen,
  Check,
  FileDown,
  FileText,
  Image as ImageIcon,
  Layers3,
  LoaderCircle,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ManuscriptBook,
  ManuscriptChapter,
  ManuscriptScene,
  ManuscriptVolume
} from "../manuscript";
import { sortManuscriptUnits } from "../manuscript";
import {
  buildManuscriptPublication,
  publicationWordCount,
  type ManuscriptPublicationExportResult,
  type ManuscriptPublicationFormat,
  type ManuscriptPublicationPageSize,
  type ManuscriptPublicationRequest,
  type ManuscriptPublicationStyle
} from "../manuscript-publication";
import { useDialogFocus } from "./useDialogFocus";

type PublicationScope = "book" | "volume" | "selection";

type PublicationAsset = {
  id: string;
  name: string;
  storedName: string;
};

const formatLabels: Record<ManuscriptPublicationFormat, string> = {
  docx: "DOCX",
  pdf: "PDF",
  epub: "EPUB"
};

export function ManuscriptPublicationDialog({
  assets,
  books,
  chapters,
  defaultBookId,
  defaultChapterId,
  onClose,
  onExport,
  open,
  scenes,
  volumes,
  worldName
}: {
  assets: PublicationAsset[];
  books: ManuscriptBook[];
  chapters: ManuscriptChapter[];
  defaultBookId: string;
  defaultChapterId: string;
  onClose: () => void;
  onExport: (request: ManuscriptPublicationRequest) => Promise<ManuscriptPublicationExportResult>;
  open: boolean;
  scenes: ManuscriptScene[];
  volumes: ManuscriptVolume[];
  worldName: string;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [bookId, setBookId] = useState(defaultBookId);
  const [scope, setScope] = useState<PublicationScope>("book");
  const [volumeId, setVolumeId] = useState("");
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [formats, setFormats] = useState<ManuscriptPublicationFormat[]>(["docx"]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverStoredName, setCoverStoredName] = useState("");
  const [includeSummaries, setIncludeSummaries] = useState(false);
  const [includeScenes, setIncludeScenes] = useState(false);
  const [includeTableOfContents, setIncludeTableOfContents] = useState(true);
  const [pageSize, setPageSize] = useState<ManuscriptPublicationPageSize>("a4");
  const [style, setStyle] = useState<ManuscriptPublicationStyle>("classic");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [lastFiles, setLastFiles] = useState<string[]>([]);

  useDialogFocus({
    closeOnEscape: !busy,
    containerRef: dialogRef,
    initialFocusRef: titleRef,
    onClose,
    open
  });

  useEffect(() => {
    if (!open) return;
    const initialBook = books.find((book) => book.id === defaultBookId) ?? books[0];
    const initialChapter = chapters.find((chapter) => chapter.id === defaultChapterId);
    setBookId(initialBook?.id ?? "");
    setScope("book");
    setVolumeId(initialChapter?.volumeId ?? volumes.find((volume) => volume.bookId === initialBook?.id)?.id ?? "");
    setSelectedChapterIds(initialChapter ? [initialChapter.id] : []);
    setFormats(["docx"]);
    setTitle(initialBook?.title ?? worldName);
    setSubtitle(initialBook?.subtitle ?? "");
    setAuthor("");
    setCoverStoredName("");
    setIncludeSummaries(false);
    setIncludeScenes(false);
    setIncludeTableOfContents(true);
    setPageSize("a4");
    setStyle("classic");
    setBusy(false);
    setMessage("");
    setLastFiles([]);
    document.body.classList.add("create-dialog-open");
    return () => document.body.classList.remove("create-dialog-open");
  }, [books, chapters, defaultBookId, defaultChapterId, open, volumes, worldName]);

  const book = books.find((item) => item.id === bookId) ?? books[0] ?? null;
  const bookVolumes = useMemo(
    () => sortManuscriptUnits(volumes.filter((item) => item.bookId === book?.id)),
    [book?.id, volumes]
  );
  const bookChapters = useMemo(
    () => sortManuscriptUnits(chapters.filter((item) => item.bookId === book?.id)),
    [book?.id, chapters]
  );
  const effectiveChapterIds = scope === "book"
    ? bookChapters.map((chapter) => chapter.id)
    : scope === "volume"
      ? bookChapters.filter((chapter) => chapter.volumeId === volumeId).map((chapter) => chapter.id)
      : selectedChapterIds.filter((id) => bookChapters.some((chapter) => chapter.id === id));

  const preview = useMemo(() => {
    if (!book || !effectiveChapterIds.length) return null;
    try {
      return buildManuscriptPublication({
        author,
        book,
        chapterIds: effectiveChapterIds,
        chapters,
        coverStoredName,
        includeScenes,
        includeSummaries,
        includeTableOfContents,
        pageSize,
        scenes,
        style,
        subtitle,
        title,
        volumes,
        worldName
      });
    } catch {
      return null;
    }
  }, [author, book, chapters, coverStoredName, effectiveChapterIds.join("|"), includeScenes, includeSummaries, includeTableOfContents, pageSize, scenes, style, subtitle, title, volumes, worldName]);

  if (!open) return null;

  function changeBook(nextBookId: string) {
    const nextBook = books.find((item) => item.id === nextBookId);
    const nextVolume = volumes.find((item) => item.bookId === nextBookId);
    const nextChapter = chapters.find((item) => item.bookId === nextBookId);
    setBookId(nextBookId);
    setTitle(nextBook?.title ?? "");
    setSubtitle(nextBook?.subtitle ?? "");
    setVolumeId(nextVolume?.id ?? "");
    setSelectedChapterIds(nextChapter ? [nextChapter.id] : []);
  }

  function toggleFormat(format: ManuscriptPublicationFormat) {
    setFormats((current) => current.includes(format)
      ? current.filter((item) => item !== format)
      : [...current, format]);
  }

  function toggleChapter(chapterId: string) {
    setSelectedChapterIds((current) => current.includes(chapterId)
      ? current.filter((id) => id !== chapterId)
      : [...current, chapterId]);
  }

  async function submit() {
    if (!preview || !formats.length || busy) return;
    setBusy(true);
    setMessage("正在生成出版文件...");
    setLastFiles([]);
    try {
      const result = await onExport({ formats, publication: preview });
      if (result.canceled) {
        setMessage("已取消出版");
        return;
      }
      if (!result.ok) throw new Error(result.error || "出版文件生成失败");
      setLastFiles(result.files?.map((file) => file.filePath) ?? []);
      setMessage(`已导出 ${result.files?.length ?? formats.length} 个文件`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "出版文件生成失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="manuscript-publication-backdrop" role="presentation">
      <section ref={dialogRef} aria-label="出版文稿" aria-modal="true" className="manuscript-publication-dialog" role="dialog" tabIndex={-1}>
        <header>
          <div><FileDown size={20} /><span><strong>出版文稿</strong><small>{worldName}</small></span></div>
          <button aria-label="关闭出版文稿" disabled={busy} title="关闭" type="button" onClick={onClose}><X size={18} /></button>
        </header>

        <div className="manuscript-publication-body">
          <section className="manuscript-publication-metadata">
            <label><span>书稿</span><select aria-label="出版书稿" value={book?.id ?? ""} onChange={(event) => changeBook(event.target.value)}>{books.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <label><span>书名</span><input ref={titleRef} aria-label="出版书名" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
            <label><span>副标题</span><input aria-label="出版副标题" value={subtitle} onChange={(event) => setSubtitle(event.target.value)} /></label>
            <label><span>作者</span><input aria-label="出版作者" value={author} onChange={(event) => setAuthor(event.target.value)} /></label>
          </section>

          <section className="manuscript-publication-section">
            <div className="manuscript-publication-section-heading"><Layers3 size={16} /><strong>章节范围</strong></div>
            <div className="manuscript-publication-segments" role="radiogroup" aria-label="出版章节范围">
              <button aria-checked={scope === "book"} className={scope === "book" ? "is-active" : ""} role="radio" type="button" onClick={() => setScope("book")}><BookOpen size={15} />全书</button>
              <button aria-checked={scope === "volume"} className={scope === "volume" ? "is-active" : ""} role="radio" type="button" onClick={() => setScope("volume")}><Layers3 size={15} />单卷</button>
              <button aria-checked={scope === "selection"} className={scope === "selection" ? "is-active" : ""} role="radio" type="button" onClick={() => setScope("selection")}><FileText size={15} />自选章节</button>
            </div>
            {scope === "volume" ? <label className="manuscript-publication-volume"><span>卷</span><select aria-label="出版卷" value={volumeId} onChange={(event) => setVolumeId(event.target.value)}>{bookVolumes.map((volume) => <option key={volume.id} value={volume.id}>{volume.title}</option>)}</select></label> : null}
            {scope === "selection" ? <div className="manuscript-publication-chapters" aria-label="选择出版章节">{bookVolumes.map((volume) => <div key={volume.id}><strong>{volume.title}</strong>{bookChapters.filter((chapter) => chapter.volumeId === volume.id).map((chapter) => <label key={chapter.id}><input checked={selectedChapterIds.includes(chapter.id)} type="checkbox" onChange={() => toggleChapter(chapter.id)} /><span>{chapter.title}</span></label>)}</div>)}</div> : null}
          </section>

          <section className="manuscript-publication-section manuscript-publication-output">
            <div>
              <div className="manuscript-publication-section-heading"><FileDown size={16} /><strong>文件格式</strong></div>
              <div className="manuscript-publication-formats" role="group" aria-label="出版文件格式">{(["docx", "pdf", "epub"] as ManuscriptPublicationFormat[]).map((format) => <button aria-pressed={formats.includes(format)} className={formats.includes(format) ? "is-active" : ""} key={format} type="button" onClick={() => toggleFormat(format)}>{formats.includes(format) ? <Check size={14} /> : <FileText size={14} />}{formatLabels[format]}</button>)}</div>
            </div>
            <label><span>页面</span><select aria-label="出版页面尺寸" value={pageSize} onChange={(event) => setPageSize(event.target.value as ManuscriptPublicationPageSize)}><option value="a4">A4</option><option value="letter">Letter</option></select></label>
            <label><span>版式</span><select aria-label="出版版式" value={style} onChange={(event) => setStyle(event.target.value as ManuscriptPublicationStyle)}><option value="classic">舒展书稿</option><option value="compact">紧凑校样</option></select></label>
          </section>

          <section className="manuscript-publication-section manuscript-publication-options">
            <div className="manuscript-publication-section-heading"><ImageIcon size={16} /><strong>封面与内容</strong></div>
            <label className="manuscript-publication-cover"><span>封面图片</span><select aria-label="出版封面图片" value={coverStoredName} onChange={(event) => setCoverStoredName(event.target.value)}><option value="">纯文字封面</option>{assets.map((asset) => <option key={asset.id} value={asset.storedName}>{asset.name}</option>)}</select></label>
            <div className="manuscript-publication-toggles">
              <label><input checked={includeTableOfContents} type="checkbox" onChange={(event) => setIncludeTableOfContents(event.target.checked)} /><span>目录</span></label>
              <label><input checked={includeSummaries} type="checkbox" onChange={(event) => setIncludeSummaries(event.target.checked)} /><span>章节摘要</span></label>
              <label><input checked={includeScenes} type="checkbox" onChange={(event) => setIncludeScenes(event.target.checked)} /><span>场景正文</span></label>
            </div>
          </section>
        </div>

        <footer>
          <div className="manuscript-publication-status">
            <strong>{effectiveChapterIds.length} 章 · {(preview ? publicationWordCount(preview) : 0).toLocaleString("zh-CN")} 字</strong>
            {message ? <span>{message}</span> : null}
            {lastFiles.length ? <small title={lastFiles.join("\n")}>{lastFiles.map((file) => file.split(/[\\/]/).at(-1)).join(" · ")}</small> : null}
          </div>
          <div><button disabled={busy} type="button" onClick={onClose}>关闭</button><button className="is-primary" disabled={!preview || !formats.length || busy} type="button" onClick={() => void submit()}>{busy ? <LoaderCircle className="is-spinning" size={16} /> : <FileDown size={16} />}<span>{busy ? "正在生成" : "选择目录并导出"}</span></button></div>
        </footer>
      </section>
    </div>
  );
}
