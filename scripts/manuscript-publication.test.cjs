const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const yauzl = require("yauzl");
const publication = require(path.join(__dirname, "..", "electron", "manuscript-publication.cjs"));

let assertions = 0;
function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

function readZip(filePath) {
  return new Promise((resolve, reject) => {
    yauzl.open(filePath, { lazyEntries: true }, (openError, zip) => {
      if (openError || !zip) return reject(openError || new Error("ZIP open failed"));
      const entries = [];
      const buffers = new Map();
      zip.on("entry", (entry) => {
        entries.push(entry.fileName);
        if (/\/$/.test(entry.fileName)) return zip.readEntry();
        zip.openReadStream(entry, (streamError, stream) => {
          if (streamError || !stream) return reject(streamError || new Error("ZIP entry failed"));
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("error", reject);
          stream.on("end", () => {
            buffers.set(entry.fileName, Buffer.concat(chunks));
            zip.readEntry();
          });
        });
      });
      zip.on("error", reject);
      zip.on("end", () => resolve({ entries, buffers }));
      zip.readEntry();
    });
  });
}

const fixture = {
  format: "worldcraft-manuscript-publication-v1",
  metadata: {
    title: "雾鸦堡：第一部",
    subtitle: "风雪来信",
    author: "测试作者",
    worldName: "苍岚纪",
    language: "zh-CN",
    createdAt: "2026-07-16T00:00:00.000Z"
  },
  settings: {
    includeSummaries: true,
    includeTableOfContents: true,
    pageSize: "a4",
    style: "classic"
  },
  coverStoredName: "cover.png",
  chapters: [
    {
      id: "chapter-a",
      title: "第一章 <风雪>",
      volumeTitle: "第一卷",
      summary: "艾琳收到来信。",
      blocks: [
        { kind: "paragraph", runs: [{ text: "艾琳走进雾鸦堡。", bold: true }, { text: "<script>坏内容</script>", italic: true }] },
        { kind: "quote", runs: [{ text: "钟声停了。" }] },
        { kind: "list-item", ordered: true, runs: [{ text: "检查城门" }] }
      ]
    },
    {
      id: "chapter-b",
      title: "第二章",
      volumeTitle: "第一卷",
      summary: "",
      blocks: [{ kind: "heading", level: 2, runs: [{ text: "旧塔" }] }]
    }
  ]
};

async function run() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "worldcraft-publication-"));
  const assetsDir = path.join(root, "assets");
  const outputDir = path.join(root, "output");
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(assetsDir, "cover.png"), Buffer.from("89504e470d0a1a0a", "hex"));
  try {
    check(publication.safeFileName(' 雾鸦堡<>:"/\\|?* '), "雾鸦堡", "unsafe filename characters are removed");
    const normalized = publication.normalizePublication(fixture);
    check(normalized.chapters.length, 2, "publication normalization retains selected chapters");
    assert.throws(
      () => publication.normalizePublication({ ...fixture, chapters: [] }),
      /至少需要一个章节/,
      "empty publication ranges are rejected"
    );
    assertions += 1;

    const html = publication.buildPublicationHtml(fixture);
    check(html.includes("第一章 &lt;风雪&gt;"), true, "print HTML escapes chapter titles");
    check(html.includes("&lt;script&gt;坏内容&lt;/script&gt;"), true, "print HTML treats manuscript text as text");
    check(html.includes("<script>坏内容</script>"), false, "print HTML cannot inject manuscript scripts");
    check(html.includes("Content-Security-Policy"), true, "print HTML carries a restrictive CSP");

    const first = await publication.exportManuscriptPublication({
      assetsDir,
      formats: ["docx", "pdf", "epub"],
      outputDir,
      publication: fixture,
      renderPdf: async (printHtml) => {
        check(printHtml.includes("雾鸦堡：第一部"), true, "PDF renderer receives the normalized publication");
        return Buffer.from("%PDF-1.7\n% Worldcraft test\n", "utf8");
      }
    });
    check(first.files.map((file) => file.format), ["docx", "pdf", "epub"], "all selected publication formats are generated");
    check(first.chapterCount, 2, "export reports the selected chapter count");
    check(first.coverIncluded, true, "export embeds an available local cover");
    check(first.files.every((file) => fs.existsSync(file.filePath) && file.bytes > 0), true, "exported files are non-empty");

    const docxPath = first.files.find((file) => file.format === "docx").filePath;
    const docx = await readZip(docxPath);
    check(docx.entries.includes("word/document.xml"), true, "DOCX contains its document part");
    check(docx.entries.includes("word/styles.xml"), true, "DOCX contains reusable manuscript styles");
    check(docx.entries.includes("word/header1.xml") && docx.entries.includes("word/footer1.xml"), true, "DOCX contains running header and page footer");
    check(docx.entries.includes("word/media/cover.png"), true, "DOCX contains the selected cover asset");
    const documentXml = docx.buffers.get("word/document.xml").toString("utf8");
    check(documentXml.includes("第一章 &lt;风雪&gt;"), true, "DOCX preserves escaped chapter titles");
    check(documentXml.includes("w:type=\"page\""), true, "DOCX separates publication sections with page breaks");
    check(documentXml.includes("<w:b/>"), true, "DOCX preserves bold runs");

    const epubPath = first.files.find((file) => file.format === "epub").filePath;
    const epub = await readZip(epubPath);
    check(epub.entries[0], "mimetype", "EPUB stores mimetype as its first ZIP entry");
    check(epub.buffers.get("mimetype").toString("utf8"), "application/epub+zip", "EPUB mimetype is exact");
    check(epub.entries.includes("OEBPS/content.opf"), true, "EPUB contains its package manifest");
    check(epub.entries.includes("OEBPS/nav.xhtml"), true, "EPUB contains a navigation document");
    check(epub.entries.includes("OEBPS/chapter-1.xhtml") && epub.entries.includes("OEBPS/chapter-2.xhtml"), true, "EPUB contains every selected chapter");
    check(epub.entries.includes("OEBPS/cover.png"), true, "EPUB contains the selected cover asset");
    const epubChapter = epub.buffers.get("OEBPS/chapter-1.xhtml").toString("utf8");
    check(epubChapter.includes("第一章 &lt;风雪&gt;"), true, "EPUB chapter markup is escaped and valid XML text");
    check(epubChapter.includes("<strong>艾琳走进雾鸦堡。</strong>"), true, "EPUB preserves inline emphasis");

    const second = await publication.exportManuscriptPublication({
      assetsDir,
      formats: ["docx", "epub"],
      outputDir,
      publication: fixture,
      renderPdf: async () => Buffer.alloc(0)
    });
    check(second.files.every((file) => / \(2\)\.(docx|epub)$/.test(file.filePath)), true, "repeated exports never overwrite earlier files");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
  console.log(`Manuscript publication checks passed: ${assertions} assertions.`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
