const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const yazl = require("yazl");

const allowedFormats = new Set(["docx", "pdf", "epub"]);
const allowedBlockKinds = new Set([
  "paragraph",
  "heading",
  "quote",
  "list-item",
  "code",
  "separator"
]);

function cleanString(value, limit = 200000) {
  return String(value ?? "").replace(/\u0000/g, "").slice(0, limit);
}

function escapeXml(value) {
  return cleanString(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function safeFileName(value) {
  const cleaned = cleanString(value, 100)
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
    .replace(/[. ]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "Worldcraft 文稿";
}

function normalizePublication(input) {
  if (!input || input.format !== "worldcraft-manuscript-publication-v1") {
    throw new Error("不支持的文稿出版数据");
  }
  const chapters = Array.isArray(input.chapters) ? input.chapters.slice(0, 5000) : [];
  if (!chapters.length) throw new Error("出版内容至少需要一个章节");
  let totalCharacters = 0;
  const normalizedChapters = chapters.map((chapter, chapterIndex) => {
    const blocks = Array.isArray(chapter?.blocks) ? chapter.blocks.slice(0, 20000) : [];
    return {
      id: cleanString(chapter?.id, 200) || `chapter-${chapterIndex + 1}`,
      title: cleanString(chapter?.title, 500) || `第 ${chapterIndex + 1} 章`,
      volumeTitle: cleanString(chapter?.volumeTitle, 500),
      summary: cleanString(chapter?.summary, 10000),
      blocks: blocks.map((block) => {
        const kind = allowedBlockKinds.has(block?.kind) ? block.kind : "paragraph";
        const runs = Array.isArray(block?.runs)
          ? block.runs.slice(0, 10000).map((run) => {
              const text = cleanString(run?.text, 500000);
              totalCharacters += text.length;
              return {
                text,
                bold: run?.bold === true,
                italic: run?.italic === true,
                underline: run?.underline === true,
                strike: run?.strike === true,
                code: run?.code === true
              };
            })
          : [];
        return {
          kind,
          runs,
          level: Math.max(1, Math.min(6, Number(block?.level) || 1)),
          ordered: block?.ordered === true
        };
      })
    };
  });
  if (totalCharacters > 20000000) throw new Error("出版正文超过 2000 万字符上限");
  return {
    format: input.format,
    metadata: {
      title: cleanString(input.metadata?.title, 500) || "未命名书稿",
      subtitle: cleanString(input.metadata?.subtitle, 500),
      author: cleanString(input.metadata?.author, 300),
      worldName: cleanString(input.metadata?.worldName, 300),
      language: cleanString(input.metadata?.language, 40) || "zh-CN",
      createdAt: cleanString(input.metadata?.createdAt, 80) || new Date().toISOString()
    },
    settings: {
      includeSummaries: input.settings?.includeSummaries === true,
      includeTableOfContents: input.settings?.includeTableOfContents !== false,
      pageSize: input.settings?.pageSize === "letter" ? "letter" : "a4",
      style: input.settings?.style === "compact" ? "compact" : "classic"
    },
    coverStoredName: cleanString(input.coverStoredName, 300),
    chapters: normalizedChapters
  };
}

function normalizeFormats(formats) {
  const result = Array.from(new Set((Array.isArray(formats) ? formats : []).filter((item) => allowedFormats.has(item))));
  if (!result.length) throw new Error("请至少选择一种出版格式");
  return result;
}

async function loadCoverImage(assetsDir, storedName) {
  if (!storedName) return null;
  const baseName = path.basename(storedName);
  if (baseName !== storedName) return null;
  const extension = path.extname(baseName).toLocaleLowerCase("en-US");
  const mediaTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp"
  };
  const mediaType = mediaTypes[extension];
  if (!mediaType) return null;
  const filePath = path.join(assetsDir, baseName);
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile() || stat.size > 50 * 1024 * 1024) return null;
    return {
      bytes: await fs.readFile(filePath),
      extension: extension === ".jpeg" ? ".jpg" : extension,
      mediaType
    };
  } catch {
    return null;
  }
}

function htmlRuns(runs) {
  return runs.map((run) => {
    let value = escapeXml(run.text).replace(/\n/g, "<br/>");
    if (run.code) value = `<code>${value}</code>`;
    if (run.strike) value = `<s>${value}</s>`;
    if (run.underline) value = `<u>${value}</u>`;
    if (run.italic) value = `<em>${value}</em>`;
    if (run.bold) value = `<strong>${value}</strong>`;
    return value;
  }).join("");
}

function htmlBlock(block, listIndex = 1) {
  const content = htmlRuns(block.runs);
  if (block.kind === "heading") {
    const level = Math.max(2, Math.min(4, block.level + 1));
    return `<h${level}>${content}</h${level}>`;
  }
  if (block.kind === "quote") return `<blockquote>${content}</blockquote>`;
  if (block.kind === "code") return `<pre>${content}</pre>`;
  if (block.kind === "separator") return "<hr/>";
  if (block.kind === "list-item") {
    return `<p class="list-item">${block.ordered ? `${listIndex}.` : "•"} ${content}</p>`;
  }
  return `<p>${content || "&#160;"}</p>`;
}

function coverDataUrl(cover) {
  return cover ? `data:${cover.mediaType};base64,${cover.bytes.toString("base64")}` : "";
}

function buildPublicationHtml(publicationInput, cover = null) {
  const publication = normalizePublication(publicationInput);
  const compact = publication.settings.style === "compact";
  const pageSize = publication.settings.pageSize === "letter" ? "Letter" : "A4";
  const coverUrl = coverDataUrl(cover);
  const tableOfContents = publication.settings.includeTableOfContents
    ? `<section class="toc"><h1>目录</h1><ol>${publication.chapters.map((chapter) => `<li>${escapeXml(chapter.title)}${chapter.volumeTitle ? `<small>${escapeXml(chapter.volumeTitle)}</small>` : ""}</li>`).join("")}</ol></section>`
    : "";
  let previousVolume = "";
  const chapters = publication.chapters.map((chapter, chapterIndex) => {
    const volume = chapter.volumeTitle && chapter.volumeTitle !== previousVolume
      ? `<div class="volume-title">${escapeXml(chapter.volumeTitle)}</div>`
      : "";
    previousVolume = chapter.volumeTitle;
    let listIndex = 0;
    const body = chapter.blocks.map((block) => {
      listIndex = block.kind === "list-item" && block.ordered ? listIndex + 1 : 0;
      return htmlBlock(block, listIndex || 1);
    }).join("");
    return `<article class="chapter${chapterIndex ? " page-break" : ""}">${volume}<h1>${escapeXml(chapter.title)}</h1>${chapter.summary ? `<p class="summary">${escapeXml(chapter.summary)}</p>` : ""}${body || "<p>&#160;</p>"}</article>`;
  }).join("");
  return `<!doctype html><html lang="${escapeXml(publication.metadata.language)}"><head><meta charset="utf-8"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"/><title>${escapeXml(publication.metadata.title)}</title><style>
    @page { size: ${pageSize}; margin: ${compact ? "18mm 17mm 20mm" : "24mm 22mm 26mm"}; }
    * { box-sizing: border-box; }
    html { color: #1f2421; font-family: "Noto Serif CJK SC", "Source Han Serif SC", "Microsoft YaHei", serif; font-size: ${compact ? "10.5pt" : "11.5pt"}; line-height: ${compact ? "1.6" : "1.85"}; }
    body { margin: 0; }
    .cover { align-items: center; display: flex; flex-direction: column; justify-content: center; min-height: 245mm; page-break-after: always; text-align: center; }
    .cover img { max-height: 150mm; max-width: 78%; object-fit: contain; margin-bottom: 18mm; }
    .cover h1 { font-size: 30pt; font-weight: 700; margin: 0 0 5mm; }
    .cover h2 { font-size: 15pt; font-weight: 400; margin: 0 0 16mm; }
    .cover p { color: #4f5752; margin: 2mm 0; text-indent: 0; }
    .toc { page-break-after: always; }
    .toc h1, .chapter > h1 { font-size: 21pt; margin: 0 0 12mm; text-align: center; }
    .toc li { border-bottom: 1px dotted #a8afab; margin: 3mm 0; padding-bottom: 1mm; }
    .toc small { color: #727975; float: right; }
    .page-break { page-break-before: always; }
    .volume-title { color: #68706b; font-size: 10pt; letter-spacing: 0; margin-bottom: 3mm; text-align: center; }
    p { margin: 0 0 ${compact ? "2.5mm" : "3.5mm"}; orphans: 2; text-align: justify; text-indent: 2em; widows: 2; }
    h2, h3, h4 { break-after: avoid; margin: 8mm 0 3mm; }
    blockquote { border-left: 2px solid #8b9690; color: #4c5651; margin: 5mm 0; padding: 2mm 0 2mm 5mm; }
    pre { background: #f2f4f3; font-family: Consolas, monospace; padding: 4mm; white-space: pre-wrap; }
    code { font-family: Consolas, monospace; }
    hr { border: 0; border-top: 1px solid #aeb5b1; margin: 8mm auto; width: 34%; }
    .summary { color: #5b645f; font-size: 10pt; font-style: italic; margin-bottom: 8mm; text-indent: 0; }
    .list-item { padding-left: 2em; text-indent: -1.4em; }
  </style></head><body><section class="cover">${coverUrl ? `<img alt="封面" src="${coverUrl}"/>` : ""}<h1>${escapeXml(publication.metadata.title)}</h1>${publication.metadata.subtitle ? `<h2>${escapeXml(publication.metadata.subtitle)}</h2>` : ""}${publication.metadata.author ? `<p>${escapeXml(publication.metadata.author)}</p>` : ""}${publication.metadata.worldName ? `<p>${escapeXml(publication.metadata.worldName)}</p>` : ""}</section>${tableOfContents}${chapters}</body></html>`;
}

function wordRun(run) {
  const properties = [
    run.bold ? "<w:b/>" : "",
    run.italic ? "<w:i/>" : "",
    run.underline ? '<w:u w:val="single"/>' : "",
    run.strike ? "<w:strike/>" : "",
    run.code ? '<w:rFonts w:ascii="Consolas" w:eastAsia="Microsoft YaHei"/>' : ""
  ].join("");
  const parts = run.text.split("\n");
  return parts.map((part, index) => `${index ? "<w:r><w:br/></w:r>" : ""}<w:r>${properties ? `<w:rPr>${properties}</w:rPr>` : ""}<w:t xml:space="preserve">${escapeXml(part)}</w:t></w:r>`).join("");
}

function wordParagraph(block, listIndex = 1) {
  if (block.kind === "separator") {
    return '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="8" w:color="A8B0AB"/></w:pBdr></w:pPr></w:p>';
  }
  const style = block.kind === "heading"
    ? `Heading${Math.max(2, Math.min(3, block.level + 1))}`
    : block.kind === "quote"
      ? "Quote"
      : block.kind === "code"
        ? "CodeBlock"
        : "Normal";
  const prefix = block.kind === "list-item"
    ? `<w:r><w:t xml:space="preserve">${block.ordered ? `${listIndex}. ` : "• "}</w:t></w:r>`
    : "";
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>${prefix}${block.runs.map(wordRun).join("")}</w:p>`;
}

function coverDrawingXml(cover) {
  if (!cover || ![".png", ".jpg"].includes(cover.extension)) return "";
  return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="4800000" cy="6100000"/><wp:docPr id="1" name="Cover"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="cover${cover.extension}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId4"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="4800000" cy="6100000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

function docxDocumentXml(publication, cover) {
  const paragraphs = [];
  const coverXml = coverDrawingXml(cover);
  if (coverXml) paragraphs.push(coverXml);
  paragraphs.push(`<w:p><w:pPr><w:pStyle w:val="Title"/><w:jc w:val="center"/></w:pPr><w:r><w:t>${escapeXml(publication.metadata.title)}</w:t></w:r></w:p>`);
  if (publication.metadata.subtitle) paragraphs.push(`<w:p><w:pPr><w:pStyle w:val="Subtitle"/><w:jc w:val="center"/></w:pPr><w:r><w:t>${escapeXml(publication.metadata.subtitle)}</w:t></w:r></w:p>`);
  if (publication.metadata.author) paragraphs.push(`<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>${escapeXml(publication.metadata.author)}</w:t></w:r></w:p>`);
  paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
  if (publication.settings.includeTableOfContents) {
    paragraphs.push('<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>目录</w:t></w:r></w:p>');
    publication.chapters.forEach((chapter) => {
      paragraphs.push(`<w:p><w:pPr><w:pStyle w:val="TocEntry"/></w:pPr><w:r><w:t>${escapeXml(chapter.title)}</w:t></w:r></w:p>`);
    });
    paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
  }
  let previousVolume = "";
  publication.chapters.forEach((chapter, chapterIndex) => {
    if (chapterIndex) paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    if (chapter.volumeTitle && chapter.volumeTitle !== previousVolume) {
      paragraphs.push(`<w:p><w:pPr><w:pStyle w:val="VolumeTitle"/></w:pPr><w:r><w:t>${escapeXml(chapter.volumeTitle)}</w:t></w:r></w:p>`);
      previousVolume = chapter.volumeTitle;
    }
    paragraphs.push(`<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>${escapeXml(chapter.title)}</w:t></w:r></w:p>`);
    if (chapter.summary) paragraphs.push(`<w:p><w:pPr><w:pStyle w:val="Quote"/></w:pPr><w:r><w:rPr><w:i/></w:rPr><w:t>${escapeXml(chapter.summary)}</w:t></w:r></w:p>`);
    let listIndex = 0;
    chapter.blocks.forEach((block) => {
      listIndex = block.kind === "list-item" && block.ordered ? listIndex + 1 : 0;
      paragraphs.push(wordParagraph(block, listIndex || 1));
    });
  });
  const page = publication.settings.pageSize === "letter"
    ? '<w:pgSz w:w="12240" w:h="15840"/>'
    : '<w:pgSz w:w="11906" w:h="16838"/>';
  const margins = publication.settings.style === "compact"
    ? '<w:pgMar w:top="1020" w:right="960" w:bottom="1130" w:left="960" w:header="540" w:footer="540" w:gutter="0"/>'
    : '<w:pgMar w:top="1360" w:right="1247" w:bottom="1474" w:left="1247" w:header="600" w:footer="600" w:gutter="0"/>';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${paragraphs.join("")}<w:sectPr><w:headerReference w:type="default" r:id="rId2"/><w:footerReference w:type="default" r:id="rId3"/>${page}${margins}</w:sectPr></w:body></w:document>`;
}

function docxStylesXml(publication) {
  const bodySize = publication.settings.style === "compact" ? 21 : 23;
  const line = publication.settings.style === "compact" ? 360 : 420;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="SimSun"/><w:sz w:val="${bodySize}"/><w:szCs w:val="${bodySize}"/><w:lang w:val="zh-CN" w:eastAsia="zh-CN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="${line}" w:lineRule="auto"/><w:ind w:firstLine="480"/><w:jc w:val="both"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="120" w:after="280"/><w:ind w:firstLine="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="56"/><w:szCs w:val="56"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:firstLine="0"/></w:pPr><w:rPr><w:color w:val="59635D"/><w:sz w:val="30"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="260" w:after="260"/><w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:ind w:firstLine="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:ind w:firstLine="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="VolumeTitle"><w:name w:val="Volume Title"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr><w:rPr><w:color w:val="68706B"/><w:sz w:val="20"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="480" w:right="480" w:firstLine="0"/></w:pPr><w:rPr><w:color w:val="4C5651"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="CodeBlock"><w:name w:val="Code Block"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="360" w:firstLine="0"/><w:shd w:fill="F2F4F3"/></w:pPr><w:rPr><w:rFonts w:ascii="Consolas" w:eastAsia="Microsoft YaHei"/><w:sz w:val="19"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="TocEntry"><w:name w:val="TOC Entry"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:firstLine="0"/><w:spacing w:after="90"/></w:pPr></w:style></w:styles>`;
}

function addZipBuffer(zip, content, name, options) {
  zip.addBuffer(Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8"), name, options);
}

async function writeZip(targetPath, populate) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  const temporaryPath = `${targetPath}.tmp-${process.pid}-${Date.now()}`;
  const zip = new yazl.ZipFile();
  populate(zip);
  zip.end();
  await new Promise((resolve, reject) => {
    const stream = fsSync.createWriteStream(temporaryPath, { flags: "wx" });
    zip.outputStream.on("error", reject);
    stream.on("error", reject);
    stream.on("close", resolve);
    zip.outputStream.pipe(stream);
  });
  await fs.rename(temporaryPath, targetPath);
}

async function availableTargetPath(outputDir, baseName, extension) {
  for (let index = 1; index <= 9999; index += 1) {
    const suffix = index === 1 ? "" : ` (${index})`;
    const candidate = path.join(outputDir, `${baseName}${suffix}.${extension}`);
    try {
      await fs.access(candidate);
    } catch {
      return candidate;
    }
  }
  throw new Error("目标目录中同名出版文件过多");
}

async function writeDocx(targetPath, publicationInput, cover = null) {
  const publication = normalizePublication(publicationInput);
  const wordCover = cover && [".png", ".jpg"].includes(cover.extension) ? cover : null;
  await writeZip(targetPath, (zip) => {
    const imageDefault = wordCover
      ? `<Default Extension="${wordCover.extension.slice(1)}" ContentType="${wordCover.mediaType}"/>`
      : "";
    addZipBuffer(zip, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${imageDefault}<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`, "[Content_Types].xml");
    addZipBuffer(zip, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>', "_rels/.rels");
    const imageRelationship = wordCover ? `<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/cover${wordCover.extension}"/>` : "";
    addZipBuffer(zip, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>${imageRelationship}</Relationships>`, "word/_rels/document.xml.rels");
    addZipBuffer(zip, docxDocumentXml(publication, wordCover), "word/document.xml");
    addZipBuffer(zip, docxStylesXml(publication), "word/styles.xml");
    addZipBuffer(zip, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:color w:val="7A827D"/><w:sz w:val="17"/></w:rPr><w:t>${escapeXml(publication.metadata.title)}</w:t></w:r></w:p></w:hdr>`, "word/header1.xml");
    addZipBuffer(zip, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText>PAGE</w:instrText></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>', "word/footer1.xml");
    addZipBuffer(zip, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${escapeXml(publication.metadata.title)}</dc:title><dc:creator>${escapeXml(publication.metadata.author)}</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${escapeXml(publication.metadata.createdAt)}</dcterms:created></cp:coreProperties>`, "docProps/core.xml");
    addZipBuffer(zip, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Worldcraft Codex</Application></Properties>', "docProps/app.xml");
    if (wordCover) addZipBuffer(zip, wordCover.bytes, `word/media/cover${wordCover.extension}`);
  });
}

function epubChapterXhtml(publication, chapter, index) {
  let listIndex = 0;
  const blocks = chapter.blocks.map((block) => {
    listIndex = block.kind === "list-item" && block.ordered ? listIndex + 1 : 0;
    return htmlBlock(block, listIndex || 1);
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${escapeXml(publication.metadata.language)}"><head><title>${escapeXml(chapter.title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body><article>${chapter.volumeTitle ? `<p class="volume">${escapeXml(chapter.volumeTitle)}</p>` : ""}<h1>${escapeXml(chapter.title)}</h1>${chapter.summary ? `<p class="summary">${escapeXml(chapter.summary)}</p>` : ""}${blocks || "<p>&#160;</p>"}</article></body></html>`;
}

async function writeEpub(targetPath, publicationInput, cover = null) {
  const publication = normalizePublication(publicationInput);
  const identifier = `urn:uuid:${randomUUID()}`;
  const createdAt = new Date(publication.metadata.createdAt);
  const modified = (Number.isNaN(createdAt.getTime()) ? new Date() : createdAt)
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");
  const imageName = cover ? `cover${cover.extension}` : "";
  await writeZip(targetPath, (zip) => {
    addZipBuffer(zip, "application/epub+zip", "mimetype", { compress: false });
    addZipBuffer(zip, '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>', "META-INF/container.xml");
    const coverManifest = cover ? `<item id="cover-image" href="${imageName}" media-type="${cover.mediaType}" properties="cover-image"/>` : "";
    const chapterManifest = publication.chapters.map((_chapter, index) => `<item id="chapter-${index + 1}" href="chapter-${index + 1}.xhtml" media-type="application/xhtml+xml"/>`).join("");
    const spine = publication.chapters.map((_chapter, index) => `<itemref idref="chapter-${index + 1}"/>`).join("");
    addZipBuffer(zip, `<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="${escapeXml(publication.metadata.language)}"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">${identifier}</dc:identifier><dc:title>${escapeXml(publication.metadata.title)}</dc:title><dc:language>${escapeXml(publication.metadata.language)}</dc:language>${publication.metadata.author ? `<dc:creator>${escapeXml(publication.metadata.author)}</dc:creator>` : ""}<meta property="dcterms:modified">${modified}</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/><item id="style" href="style.css" media-type="text/css"/>${coverManifest}${chapterManifest}</manifest><spine><itemref idref="cover"/>${spine}</spine></package>`, "OEBPS/content.opf");
    addZipBuffer(zip, `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>目录</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body><nav epub:type="toc"><h1>目录</h1><ol>${publication.chapters.map((chapter, index) => `<li><a href="chapter-${index + 1}.xhtml">${escapeXml(chapter.title)}</a></li>`).join("")}</ol></nav></body></html>`, "OEBPS/nav.xhtml");
    addZipBuffer(zip, `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escapeXml(publication.metadata.title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body class="cover">${cover ? `<img alt="封面" src="${imageName}"/>` : ""}<h1>${escapeXml(publication.metadata.title)}</h1>${publication.metadata.subtitle ? `<h2>${escapeXml(publication.metadata.subtitle)}</h2>` : ""}${publication.metadata.author ? `<p>${escapeXml(publication.metadata.author)}</p>` : ""}</body></html>`, "OEBPS/cover.xhtml");
    const compact = publication.settings.style === "compact";
    addZipBuffer(zip, `body{font-family:serif;line-height:${compact ? "1.6" : "1.8"};margin:5%;}h1{text-align:center;margin:2em 0 1.2em;}p{text-align:justify;text-indent:2em;margin:.6em 0;}blockquote{border-left:.18em solid #87928c;color:#4c5651;margin:1.4em 0;padding:.4em 0 .4em 1.2em;}pre{background:#f2f4f3;padding:1em;white-space:pre-wrap}.cover{text-align:center}.cover img{display:block;margin:4% auto;max-height:70vh;max-width:78%}.cover p,.cover h2,.summary,.volume{text-align:center;text-indent:0}.summary{color:#5b645f;font-style:italic}.volume{color:#68706b}.list-item{padding-left:2em;text-indent:-1.4em}hr{border:0;border-top:1px solid #aeb5b1;margin:2em auto;width:34%}`, "OEBPS/style.css");
    publication.chapters.forEach((chapter, index) => {
      addZipBuffer(zip, epubChapterXhtml(publication, chapter, index), `OEBPS/chapter-${index + 1}.xhtml`);
    });
    if (cover) addZipBuffer(zip, cover.bytes, `OEBPS/${imageName}`);
  });
}

async function exportManuscriptPublication({
  assetsDir,
  formats,
  outputDir,
  publication: publicationInput,
  renderPdf
}) {
  const publication = normalizePublication(publicationInput);
  const selectedFormats = normalizeFormats(formats);
  const cover = await loadCoverImage(assetsDir, publication.coverStoredName);
  const baseName = safeFileName(publication.metadata.title);
  const files = [];
  for (const format of selectedFormats) {
    const filePath = await availableTargetPath(outputDir, baseName, format);
    if (format === "docx") await writeDocx(filePath, publication, cover);
    if (format === "epub") await writeEpub(filePath, publication, cover);
    if (format === "pdf") {
      if (typeof renderPdf !== "function") throw new Error("PDF 渲染器不可用");
      const buffer = await renderPdf(buildPublicationHtml(publication, cover), publication);
      await fs.writeFile(filePath, buffer);
    }
    const stat = await fs.stat(filePath);
    files.push({ format, filePath, bytes: stat.size });
  }
  return {
    files,
    chapterCount: publication.chapters.length,
    coverIncluded: Boolean(cover)
  };
}

module.exports = {
  buildPublicationHtml,
  escapeXml,
  exportManuscriptPublication,
  normalizePublication,
  safeFileName,
  writeDocx,
  writeEpub
};
