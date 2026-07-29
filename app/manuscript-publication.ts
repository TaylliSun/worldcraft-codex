import type {
  ManuscriptBook,
  ManuscriptChapter,
  ManuscriptScene,
  ManuscriptVolume
} from "./manuscript";
import { manuscriptPlainText, sortManuscriptUnits } from "./manuscript";
import { sanitizePublicationRichText } from "./publication";

export type ManuscriptPublicationFormat = "docx" | "pdf" | "epub";
export type ManuscriptPublicationPageSize = "a4" | "letter";
export type ManuscriptPublicationStyle = "classic" | "compact";

export type ManuscriptPublicationRun = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
};

export type ManuscriptPublicationBlock = {
  kind: "paragraph" | "heading" | "quote" | "list-item" | "code" | "separator";
  runs: ManuscriptPublicationRun[];
  level?: number;
  ordered?: boolean;
};

export type ManuscriptPublicationChapter = {
  id: string;
  title: string;
  volumeTitle: string;
  summary: string;
  blocks: ManuscriptPublicationBlock[];
};

export type ManuscriptPublicationPayload = {
  format: "worldcraft-manuscript-publication-v1";
  metadata: {
    title: string;
    subtitle: string;
    author: string;
    worldName: string;
    language: string;
    createdAt: string;
  };
  settings: {
    includeSummaries: boolean;
    includeTableOfContents: boolean;
    pageSize: ManuscriptPublicationPageSize;
    style: ManuscriptPublicationStyle;
  };
  coverStoredName: string;
  chapters: ManuscriptPublicationChapter[];
};

export type ManuscriptPublicationRequest = {
  formats: ManuscriptPublicationFormat[];
  publication: ManuscriptPublicationPayload;
};

export type ManuscriptPublicationExportResult = {
  ok: boolean;
  canceled?: boolean;
  outputDir?: string;
  chapterCount?: number;
  coverIncluded?: boolean;
  files?: Array<{
    format: ManuscriptPublicationFormat;
    filePath: string;
    bytes: number;
  }>;
  error?: string;
};

type RunStyle = Omit<ManuscriptPublicationRun, "text">;

function normalizedRuns(runs: ManuscriptPublicationRun[]) {
  const result: ManuscriptPublicationRun[] = [];
  runs.forEach((run) => {
    if (!run.text) return;
    const previous = result.at(-1);
    if (
      previous &&
      previous.bold === run.bold &&
      previous.italic === run.italic &&
      previous.underline === run.underline &&
      previous.strike === run.strike &&
      previous.code === run.code
    ) {
      previous.text += run.text;
      return;
    }
    result.push({ ...run });
  });
  return result;
}

function elementStyle(element: Element, inherited: RunStyle): RunStyle {
  const tag = element.tagName.toLocaleLowerCase("en-US");
  return {
    ...inherited,
    bold: inherited.bold || tag === "strong" || tag === "b",
    italic: inherited.italic || tag === "em" || tag === "i",
    underline: inherited.underline || tag === "u",
    strike: inherited.strike || tag === "s" || tag === "del",
    code: inherited.code || tag === "code"
  };
}

function inlineRuns(node: Node, inherited: RunStyle = {}): ManuscriptPublicationRun[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return [{ text: node.textContent ?? "", ...inherited }];
  }
  if (!(node instanceof Element)) return [];
  if (node.tagName.toLocaleLowerCase("en-US") === "br") {
    return [{ text: "\n", ...inherited }];
  }
  const style = elementStyle(node, inherited);
  return Array.from(node.childNodes).flatMap((child) => inlineRuns(child, style));
}

function fallbackBlocks(value: string): ManuscriptPublicationBlock[] {
  const text = manuscriptPlainText(sanitizePublicationRichText(value));
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({ kind: "paragraph", runs: [{ text: paragraph }] }));
}

export function richTextToPublicationBlocks(value: string): ManuscriptPublicationBlock[] {
  const sanitized = sanitizePublicationRichText(value);
  if (!sanitized) return [];
  if (typeof DOMParser === "undefined" || typeof Node === "undefined") {
    return fallbackBlocks(sanitized);
  }

  const document = new DOMParser().parseFromString(sanitized, "text/html");
  const blocks: ManuscriptPublicationBlock[] = [];
  const push = (
    kind: ManuscriptPublicationBlock["kind"],
    element: Element,
    extra: Pick<ManuscriptPublicationBlock, "level" | "ordered"> = {}
  ) => {
    const runs = normalizedRuns(inlineRuns(element));
    if (runs.some((run) => run.text.trim())) blocks.push({ kind, runs, ...extra });
  };

  const visit = (node: Node, quote = false) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) blocks.push({ kind: quote ? "quote" : "paragraph", runs: [{ text }] });
      return;
    }
    if (!(node instanceof Element)) return;
    const tag = node.tagName.toLocaleLowerCase("en-US");
    if (/^h[1-6]$/.test(tag)) {
      push("heading", node, { level: Number(tag.slice(1)) });
      return;
    }
    if (tag === "p") {
      push(quote ? "quote" : "paragraph", node);
      return;
    }
    if (tag === "blockquote") {
      Array.from(node.childNodes).forEach((child) => visit(child, true));
      return;
    }
    if (tag === "ul" || tag === "ol") {
      Array.from(node.children).forEach((child) => {
        if (child.tagName.toLocaleLowerCase("en-US") === "li") {
          push("list-item", child, { ordered: tag === "ol" });
        }
      });
      return;
    }
    if (tag === "pre") {
      push("code", node);
      return;
    }
    if (tag === "hr") {
      blocks.push({ kind: "separator", runs: [] });
      return;
    }
    if (tag === "table") {
      Array.from(node.querySelectorAll("tr")).forEach((row) => {
        const cells = Array.from(row.querySelectorAll(":scope > th, :scope > td"))
          .map((cell) => cell.textContent?.trim() ?? "");
        if (cells.some(Boolean)) {
          blocks.push({ kind: "paragraph", runs: [{ text: cells.join(" | ") }] });
        }
      });
      return;
    }
    if (tag === "img") {
      const alt = node.getAttribute("alt")?.trim();
      if (alt) blocks.push({ kind: "paragraph", runs: [{ text: `图片：${alt}`, italic: true }] });
      return;
    }
    Array.from(node.childNodes).forEach((child) => visit(child, quote));
  };

  Array.from(document.body.childNodes).forEach((node) => visit(node));
  return blocks;
}

export function buildManuscriptPublication(input: {
  author: string;
  book: ManuscriptBook;
  chapterIds: string[];
  chapters: ManuscriptChapter[];
  coverStoredName?: string;
  includeScenes: boolean;
  includeSummaries: boolean;
  includeTableOfContents: boolean;
  pageSize: ManuscriptPublicationPageSize;
  scenes: ManuscriptScene[];
  style: ManuscriptPublicationStyle;
  subtitle?: string;
  title?: string;
  volumes: ManuscriptVolume[];
  worldName: string;
}): ManuscriptPublicationPayload {
  const selectedIds = new Set(input.chapterIds);
  const volumes = sortManuscriptUnits(
    input.volumes.filter((volume) => volume.bookId === input.book.id)
  );
  const volumeOrder = new Map(volumes.map((volume, index) => [volume.id, index]));
  const volumeTitles = new Map(volumes.map((volume) => [volume.id, volume.title]));
  const chapters = input.chapters
    .filter((chapter) => chapter.bookId === input.book.id && selectedIds.has(chapter.id))
    .sort((left, right) => (
      (volumeOrder.get(left.volumeId) ?? Number.MAX_SAFE_INTEGER) -
        (volumeOrder.get(right.volumeId) ?? Number.MAX_SAFE_INTEGER) ||
      left.order - right.order ||
      left.title.localeCompare(right.title, "zh-CN")
    ));

  if (!chapters.length) throw new Error("请至少选择一个章节");

  const publicationChapters = chapters.map((chapter) => {
    const blocks = richTextToPublicationBlocks(chapter.body);
    if (input.includeScenes) {
      sortManuscriptUnits(
        input.scenes.filter((scene) => scene.chapterId === chapter.id)
      ).forEach((scene) => {
        blocks.push({ kind: "heading", level: 2, runs: [{ text: scene.title }] });
        blocks.push(...richTextToPublicationBlocks(scene.body));
      });
    }
    return {
      id: chapter.id,
      title: chapter.title,
      volumeTitle: volumeTitles.get(chapter.volumeId) ?? "",
      summary: input.includeSummaries ? chapter.summary.trim() : "",
      blocks
    };
  });

  return {
    format: "worldcraft-manuscript-publication-v1",
    metadata: {
      title: input.title?.trim() || input.book.title,
      subtitle: input.subtitle?.trim() || input.book.subtitle,
      author: input.author.trim(),
      worldName: input.worldName.trim(),
      language: "zh-CN",
      createdAt: new Date().toISOString()
    },
    settings: {
      includeSummaries: input.includeSummaries,
      includeTableOfContents: input.includeTableOfContents,
      pageSize: input.pageSize,
      style: input.style
    },
    coverStoredName: input.coverStoredName?.trim() ?? "",
    chapters: publicationChapters
  };
}

export function publicationWordCount(publication: ManuscriptPublicationPayload) {
  return publication.chapters.reduce(
    (total, chapter) => total + chapter.blocks.reduce(
      (chapterTotal, block) => chapterTotal + manuscriptPlainText(
        block.runs.map((run) => run.text).join("")
      ).length,
      0
    ),
    0
  );
}
