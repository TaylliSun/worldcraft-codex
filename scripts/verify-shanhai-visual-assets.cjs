const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const { classicVolumes, illustratedRecords } = require("./shanhai-case-data.cjs");

const assetDir = path.resolve(__dirname, "..", "assets", "shanhai");
const reviewPath = path.resolve(__dirname, "..", "data", "shanhai-visual-review.json");
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const mapFiles = [
  "shanhai-map-base.png",
  "map-five-classics.png",
  "map-sea-classics.png",
  ...classicVolumes.map((volume) => `map-volume-${volume.key}.png`)
];

function readPng(filename) {
  const filePath = path.join(assetDir, filename);
  assert.ok(fs.existsSync(filePath), `${filename} exists`);
  const bytes = fs.readFileSync(filePath);
  assert.ok(bytes.length > 100_000, `${filename} is not an empty placeholder`);
  assert.deepEqual(bytes.subarray(0, 8), pngSignature, `${filename} has a PNG signature`);
  assert.equal(bytes.subarray(12, 16).toString("ascii"), "IHDR", `${filename} starts with IHDR`);
  return {
    bytes,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bitDepth: bytes[24],
    colorType: bytes[25],
    interlace: bytes[28]
  };
}

function paeth(left, up, upperLeft) {
  const prediction = left + up - upperLeft;
  const leftDistance = Math.abs(prediction - left);
  const upDistance = Math.abs(prediction - up);
  const upperLeftDistance = Math.abs(prediction - upperLeft);
  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  return upDistance <= upperLeftDistance ? up : upperLeft;
}

function alphaStats(filename, png) {
  assert.equal(png.bitDepth, 8, `${filename} uses 8-bit channels`);
  assert.equal(png.colorType, 6, `${filename} preserves an RGBA alpha channel`);
  assert.equal(png.interlace, 0, `${filename} uses a directly verifiable non-interlaced layout`);

  const chunks = [];
  for (let offset = 8; offset + 12 <= png.bytes.length;) {
    const length = png.bytes.readUInt32BE(offset);
    const type = png.bytes.subarray(offset + 4, offset + 8).toString("ascii");
    if (type === "IDAT") chunks.push(png.bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
    if (type === "IEND") break;
  }
  assert.ok(chunks.length > 0, `${filename} contains image data`);
  const inflated = zlib.inflateSync(Buffer.concat(chunks));
  const bytesPerPixel = 4;
  const stride = png.width * bytesPerPixel;
  assert.equal(inflated.length, (stride + 1) * png.height, `${filename} has complete scanlines`);

  let previous = Buffer.alloc(stride);
  let transparent = 0;
  let translucent = 0;
  let opaque = 0;
  const cornerAlpha = [];
  let sourceOffset = 0;
  for (let y = 0; y < png.height; y += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;
    const row = Buffer.allocUnsafe(stride);
    for (let index = 0; index < stride; index += 1) {
      const raw = inflated[sourceOffset + index];
      const left = index >= bytesPerPixel ? row[index - bytesPerPixel] : 0;
      const up = previous[index];
      const upperLeft = index >= bytesPerPixel ? previous[index - bytesPerPixel] : 0;
      if (filter === 0) row[index] = raw;
      else if (filter === 1) row[index] = (raw + left) & 255;
      else if (filter === 2) row[index] = (raw + up) & 255;
      else if (filter === 3) row[index] = (raw + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) row[index] = (raw + paeth(left, up, upperLeft)) & 255;
      else assert.fail(`${filename} uses unsupported PNG filter ${filter}`);
    }
    sourceOffset += stride;
    for (let x = 0; x < png.width; x += 1) {
      const alpha = row[x * bytesPerPixel + 3];
      if (alpha === 0) transparent += 1;
      else if (alpha === 255) opaque += 1;
      else translucent += 1;
      if ((y === 0 || y === png.height - 1) && (x === 0 || x === png.width - 1)) cornerAlpha.push(alpha);
    }
    previous = row;
  }
  const pixels = png.width * png.height;
  return {
    transparentRatio: transparent / pixels,
    visibleRatio: (opaque + translucent) / pixels,
    transparentCorners: cornerAlpha.filter((alpha) => alpha === 0).length
  };
}

assert.equal(classicVolumes.length, 18);
assert.equal(illustratedRecords.length, 263);
assert.equal(new Set(illustratedRecords.map((item) => item.key)).size, illustratedRecords.length);
assert.ok(fs.existsSync(reviewPath), "human-reviewed visual manifest exists");
const visualReview = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
assert.equal(visualReview.schemaVersion, 1);
assert.equal(visualReview.illustrationCount, illustratedRecords.length);
assert.equal(visualReview.mapCount, mapFiles.length);
assert.match(visualReview.reviewMethod, /Human review/);
assert.equal(visualReview.illustrations.length, illustratedRecords.length);
assert.equal(visualReview.maps.length, mapFiles.length);
const reviewByKey = new Map(visualReview.illustrations.map((item) => [item.key, item]));
const reviewedMapByFilename = new Map(visualReview.maps.map((item) => [item.filename, item]));
assert.equal(reviewByKey.size, illustratedRecords.length, "visual review keys are unique");
assert.equal(reviewedMapByFilename.size, mapFiles.length, "reviewed map filenames are unique");

const mapHashes = [];
for (const filename of mapFiles) {
  const png = readPng(filename);
  assert.ok(png.width >= 1200 && png.height >= 800, `${filename} is a production-size map`);
  if (filename.startsWith("map-volume-")) {
    assert.equal(`${png.width}x${png.height}`, "1536x1024", `${filename} matches its editable map canvas`);
  }
  mapHashes.push(crypto.createHash("sha256").update(png.bytes).digest("hex"));
  const review = reviewedMapByFilename.get(filename);
  assert.ok(review, `${filename} has a human visual review`);
  assert.equal(review.status, "approved", `${filename} remains approved`);
  assert.equal(review.sha256, mapHashes.at(-1), `${filename} has not changed since human review`);
}
assert.equal(new Set(mapHashes).size, mapFiles.length, "every map base has unique image content");

for (const record of illustratedRecords) {
  const filename = `${record.key}.png`;
  const png = readPng(filename);
  assert.ok(
    Math.min(png.width, png.height) >= 900 && png.width * png.height >= 1024 * 1024,
    `${filename} is a production-size illustration`
  );
  const stats = alphaStats(filename, png);
  assert.ok(stats.transparentRatio >= 0.05, `${filename} has a genuinely transparent background`);
  assert.ok(stats.visibleRatio >= 0.01, `${filename} retains a visible illustrated subject`);
  assert.ok(stats.transparentCorners >= 3, `${filename} keeps its subject clear of the transparent canvas corners`);
  const review = reviewByKey.get(record.key);
  assert.ok(review, `${filename} has a human visual review`);
  assert.equal(review.title, record.title, `${filename} review title matches the linked entity`);
  assert.equal(review.kind, record.kind, `${filename} review kind matches the linked entity`);
  assert.equal(review.status, "approved", `${filename} remains approved`);
  assert.equal(
    review.sha256,
    crypto.createHash("sha256").update(png.bytes).digest("hex"),
    `${filename} has not changed since human review`
  );
}

const correctionByKey = new Map(visualReview.corrections.map((item) => [item.key, item.expectedTraits]));
for (const key of [
  "bo",
  "shengsheng",
  "qiongqi",
  "index-creature-353ea854582ce5cc",
  "index-creature-9dd2dfcc2d89ffe3",
  "index-creature-da2963bf96e7c793",
  "index-creature-17a98b83172598f5",
  "index-creature-d8306bda491d65c1",
  "index-creature-910b7e03f89150f5",
  "index-creature-794c699e534860f0",
  "index-creature-6351ce789b764925",
  "index-creature-f80b0af19961e034",
  "index-deity-c62f9443c573eee4",
  "index-other-60a4171cce919caa",
  "index-other-25ce203ddb271952"
]) {
  assert.ok(correctionByKey.get(key)?.length >= 24, `${key} keeps an explicit semantic correction note`);
}

const expectedFiles = new Set([...mapFiles, ...illustratedRecords.map((record) => `${record.key}.png`)]);
const pngFiles = fs.readdirSync(assetDir).filter((filename) => filename.endsWith(".png"));
const missingFiles = Array.from(expectedFiles).filter((filename) => !pngFiles.includes(filename));
const unexpectedFiles = pngFiles.filter((filename) => !expectedFiles.has(filename));
assert.deepEqual(missingFiles, [], `missing visual assets: ${missingFiles.join(", ")}`);
assert.deepEqual(unexpectedFiles, [], `unexpected visual assets: ${unexpectedFiles.join(", ")}`);

console.log(`Shan Hai Jing visual checks passed: ${mapFiles.length} reviewed independent map bases and ${illustratedRecords.length} reviewed transparent illustrations.`);
