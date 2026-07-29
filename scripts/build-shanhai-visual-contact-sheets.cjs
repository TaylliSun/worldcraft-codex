const fs = require("node:fs");
const path = require("node:path");

const sharp = require("sharp");

const { illustratedRecords } = require("./shanhai-case-data.cjs");

const root = path.resolve(__dirname, "..");
const assetDir = path.join(root, "assets", "shanhai");
const outputDir = path.join(root, "validation", "shanhai-contact-sheets");
const columns = 5;
const pageSize = 25;
const tileWidth = 300;
const tileHeight = 330;
const imageSize = 276;
const headerHeight = 64;

const kindLabels = {
  creature: "异兽",
  figure: "人物与神祇",
  artifact: "草木与神物",
  character: "原创角色"
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function tileSvg(record, index) {
  const title = `${String(index + 1).padStart(3, "0")} · ${record.title}`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${tileHeight}">
    <defs>
      <pattern id="checker" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#f7f8f7"/>
        <rect width="12" height="12" fill="#e4e8e6"/>
        <rect x="12" y="12" width="12" height="12" fill="#e4e8e6"/>
      </pattern>
    </defs>
    <rect x="1" y="1" width="298" height="328" rx="4" fill="#ffffff" stroke="#b8c2bd" stroke-width="2"/>
    <rect x="8" y="8" width="284" height="284" fill="url(#checker)"/>
    <text x="150" y="315" text-anchor="middle" font-family="Microsoft YaHei, Segoe UI, sans-serif" font-size="18" fill="#16231e">${escapeXml(title)}</text>
  </svg>`);
}

async function buildTile(record, index) {
  const image = await sharp(path.join(assetDir, `${record.key}.png`))
    .resize(imageSize, imageSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();
  return sharp(tileSvg(record, index))
    .composite([{ input: image, left: 12, top: 12 }])
    .png()
    .toBuffer();
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const index = [];
  for (const [kind, label] of Object.entries(kindLabels)) {
    const records = illustratedRecords.filter((record) => record.kind === kind);
    for (let offset = 0, page = 1; offset < records.length; offset += pageSize, page += 1) {
      const pageRecords = records.slice(offset, offset + pageSize);
      const rows = Math.ceil(pageRecords.length / columns);
      const width = columns * tileWidth;
      const height = headerHeight + rows * tileHeight;
      const header = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${headerHeight}">
        <rect width="${width}" height="${headerHeight}" fill="#17221e"/>
        <text x="24" y="41" font-family="Microsoft YaHei, Segoe UI, sans-serif" font-size="28" fill="#ffffff">山海经视觉复核 · ${label} · ${page}/${Math.ceil(records.length / pageSize)}</text>
      </svg>`);
      const tiles = await Promise.all(pageRecords.map((record, localIndex) => buildTile(record, offset + localIndex)));
      const composites = [{ input: header, left: 0, top: 0 }];
      tiles.forEach((tile, localIndex) => {
        composites.push({
          input: tile,
          left: (localIndex % columns) * tileWidth,
          top: headerHeight + Math.floor(localIndex / columns) * tileHeight
        });
      });
      const filename = `shanhai-${kind}-${String(page).padStart(2, "0")}.png`;
      await sharp({ create: { width, height, channels: 4, background: "#d9dfdc" } })
        .composite(composites)
        .png()
        .toFile(path.join(outputDir, filename));
      index.push({
        filename,
        kind,
        page,
        records: pageRecords.map((record, localIndex) => ({
          number: offset + localIndex + 1,
          key: record.key,
          title: record.title
        }))
      });
    }
  }
  fs.writeFileSync(path.join(outputDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(`Built ${index.length} Shan Hai Jing visual contact sheets in ${outputDir}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
