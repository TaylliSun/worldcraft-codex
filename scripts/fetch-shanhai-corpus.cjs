const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { buildPlainLanguageRecord } = require("./shanhai-plain-language.cjs");

const OUTPUT_PATH = path.resolve(__dirname, "..", "data", "shanhai-corpus.zh-hans.json");
const API_ROOT = "https://zh.wikisource.org/w/api.php";
const USER_AGENT = "Worldcraft-Codex/2.2 Shan-Hai-Jing corpus importer";

const chapters = [
  ["nan-shan", "南山经", "南山經", "五藏山经", "nan-shan-jing/zh"],
  ["xi-shan", "西山经", "西山經", "五藏山经", "xi-shan-jing/zh"],
  ["bei-shan", "北山经", "北山經", "五藏山经", "bei-shan-jing/zh"],
  ["dong-shan", "东山经", "東山經", "五藏山经", "dong-shan-jing/zh"],
  ["zhong-shan", "中山经", "中山經", "五藏山经", "zhong-shan-jing/zh"],
  ["hai-wai-nan", "海外南经", "海外南經", "海外四经", "hai-wai-nan-jing/zh"],
  ["hai-wai-xi", "海外西经", "海外西經", "海外四经", "hai-wai-xi-jing/zh"],
  ["hai-wai-bei", "海外北经", "海外北經", "海外四经", "hai-wai-bei-jing/zh"],
  ["hai-wai-dong", "海外东经", "海外東經", "海外四经", "hai-wai-dong-jing/zh"],
  ["hai-nei-nan", "海内南经", "海內南經", "海内四经", "hai-nei-nan-jing/zh"],
  ["hai-nei-xi", "海内西经", "海內西經", "海内四经", "hai-nei-xi-jing/zh"],
  ["hai-nei-bei", "海内北经", "海內北經", "海内四经", "hai-nei-bei-jing/zh"],
  ["hai-nei-dong", "海内东经", "海內東經", "海内四经", "hai-nei-dong-jing/zh"],
  ["da-huang-dong", "大荒东经", "大荒東經", "大荒四经", "da-huang-dong-jing/zh"],
  ["da-huang-nan", "大荒南经", "大荒南經", "大荒四经", "da-huang-nan-jing/zh"],
  ["da-huang-xi", "大荒西经", "大荒西經", "大荒四经", "da-huang-xi-jing/zh"],
  ["da-huang-bei", "大荒北经", "大荒北經", "大荒四经", "da-huang-bei-jing/zh"],
  ["hai-nei", "海内经", "海內經", "海内经", "hai-nei-jing/zh"]
].map(([key, title, sourceTitle, group, ctextPath], index) => ({
  key,
  title,
  sourceTitle,
  group,
  ctextPath,
  order: index + 1
}));

function hash(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function compact(value) {
  return String(value || "").replace(/[\t ]+/g, " ").replace(/\s+([，。；：！？])/g, "$1").trim();
}

function extractAnnotations(value) {
  const notes = [];
  for (const match of value.matchAll(/〈([^〉]+)〉/g)) notes.push(compact(match[1]));
  for (const match of value.matchAll(/一作“([^”]+)”/g)) notes.push(`异文：一作“${compact(match[1])}”`);
  return [...new Set(notes.filter(Boolean))];
}

function originalText(value) {
  return compact(value
    .replace(/〈[^〉]*〉/g, "")
    .replace(/一作“[^”]+”/g, "")
    .replace(/[【〖]\s*[】〗]/g, "")
    .replace(/\s+/g, " "));
}

function isSourceNavigationLine(value) {
  return /^(?:https?:\/\/|www\.)/i.test(value)
    || /(?:ctext\.org|wikisource\.org)\/(?:library|wiki|w\/index)/i.test(value);
}

function isSectionHeading(value) {
  return /^(?:[东西南北中]山经(?:之首)?|[东西南北中]次[一二三四五六七八九十]+经|中次一十一经|五臧山经|海外[东西南北]经|海内(?:[东西南北]经|经)|大荒[东西南北]经|注释)$/.test(value);
}

function parsePassages(chapter, extract) {
  let sectionTitle = chapter.title;
  const sections = [];
  const passages = [];
  for (const rawLine of extract.replace(/\r/g, "").split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    if (isSourceNavigationLine(line)) continue;
    if (isSectionHeading(line)) {
      sectionTitle = line;
      if (!sections.includes(sectionTitle)) sections.push(sectionTitle);
      continue;
    }
    const annotatedText = compact(line);
    const cleanText = originalText(annotatedText);
    if (!cleanText) continue;
    const order = passages.length + 1;
    passages.push({
      id: `corpus-${chapter.key}-${String(order).padStart(3, "0")}`,
      chapterKey: chapter.key,
      chapterTitle: chapter.title,
      sectionTitle,
      order,
      originalText: cleanText,
      annotatedText,
      annotations: extractAnnotations(annotatedText),
      characterCount: cleanText.replace(/\s/g, "").length,
      ...buildPlainLanguageRecord(cleanText)
    });
  }
  return { sections, passages };
}

async function fetchChapter(chapter) {
  const pageTitle = `山海經/${chapter.sourceTitle}`;
  const params = new URLSearchParams({
    action: "query",
    prop: "extracts|revisions",
    explaintext: "1",
    exsectionformat: "plain",
    titles: pageTitle,
    variant: "zh-hans",
    rvprop: "ids|timestamp",
    rvslots: "main",
    redirects: "1",
    format: "json",
    formatversion: "2"
  });
  let response;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    response = await fetch(`${API_ROOT}?${params}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" }
    });
    if (response.status !== 429) break;
    const retryAfter = Number(response.headers.get("retry-after")) || (attempt + 1) * 4;
    await delay(retryAfter * 1000);
  }
  if (!response.ok) throw new Error(`${chapter.title} download failed: HTTP ${response.status}`);
  const payload = await response.json();
  const page = payload?.query?.pages?.[0];
  if (!page || page.missing || !page.extract) throw new Error(`${chapter.title} has no extract`);
  const revision = page.revisions?.[0] || {};
  const parsed = parsePassages(chapter, page.extract);
  if (!parsed.passages.length) throw new Error(`${chapter.title} has no parsed passages`);
  const encodedTitle = encodeURIComponent(pageTitle.replace(/ /g, "_"));
  return {
    ...chapter,
    sourcePageTitle: pageTitle,
    sourceUrl: `https://zh.wikisource.org/wiki/${encodedTitle}`,
    sourceRevisionUrl: `https://zh.wikisource.org/w/index.php?title=${encodedTitle}&oldid=${revision.revid || ""}`,
    sourceRevisionId: revision.revid || null,
    sourceRevisionTimestamp: revision.timestamp || "",
    ctextUrl: `https://ctext.org/shan-hai-jing/${chapter.ctextPath}`,
    referenceUrl: chapter.order <= 5
      ? `https://shanhaijing.5000yan.com/${chapter.key.replace(/-shan$/, "shan")}/`
      : "https://shanhaijing.5000yan.com/",
    extractSha256: hash(page.extract),
    annotatedText: page.extract.trim(),
    characterCount: parsed.passages.reduce((total, item) => total + item.characterCount, 0),
    sections: parsed.sections,
    passages: parsed.passages
  };
}

async function main() {
  const offline = process.argv.includes("--offline");
  const cached = offline && fs.existsSync(OUTPUT_PATH)
    ? JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"))
    : null;
  const fetched = [];
  for (const chapter of chapters) {
    if (offline) {
      const previous = cached?.chapters?.find((item) => item.key === chapter.key);
      if (!previous?.annotatedText) throw new Error(`No cached extract for ${chapter.title}`);
      const parsed = parsePassages(chapter, previous.annotatedText);
      fetched.push({
        ...previous,
        ...chapter,
        characterCount: parsed.passages.reduce((total, item) => total + item.characterCount, 0),
        sections: parsed.sections,
        passages: parsed.passages
      });
    } else {
      fetched.push(await fetchChapter(chapter));
      await delay(900);
    }
  }
  const passageCount = fetched.reduce((total, item) => total + item.passages.length, 0);
  const characterCount = fetched.reduce((total, item) => total + item.characterCount, 0);
  if (fetched.length !== 18) throw new Error(`Expected 18 chapters, received ${fetched.length}`);
  if (passageCount < 250) throw new Error(`Passage count is unexpectedly low: ${passageCount}`);
  if (characterCount < 25000) throw new Error(`Character count is unexpectedly low: ${characterCount}`);
  const output = {
    corpusVersion: "1.2.0",
    language: "zh-Hans",
    title: "山海经十八篇完整原典语料",
    generatedAt: new Date().toISOString(),
    license: {
      baseWork: "Public domain",
      transcription: "Wikisource text is available under CC BY-SA 4.0; attribution and revision links are retained.",
      plainLanguage: "Worldcraft Codex project-authored plain-language readings; generated from the public-domain base text and marked as project-reviewed drafts.",
      referenceOnly: "5000言 is used only as an information-architecture reference; its modern translation is not copied."
    },
    sources: {
      primary: "https://zh.wikisource.org/zh-hans/山海經",
      crossCheck: "https://ctext.org/shan-hai-jing/zhs",
      experienceReference: "https://shanhaijing.5000yan.com/"
    },
    stats: { chapterCount: fetched.length, passageCount, characterCount },
    chapters: fetched
  };
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ ok: true, output: OUTPUT_PATH, ...output.stats }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
