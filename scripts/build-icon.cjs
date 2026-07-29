const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "build", "icon.svg");
const pngPath = path.join(root, "build", "icon.png");
const icoPath = path.join(root, "build", "icon.ico");
const appIconPath = path.join(root, "app", "icon.png");
const sizes = [16, 24, 32, 48, 64, 128, 256];

async function renderPng(svg, size) {
  return sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain" })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function createIco(images) {
  const headerSize = 6 + images.length * 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = headerSize;
  images.forEach(({ size, buffer }, index) => {
    const entry = 6 + index * 16;
    header.writeUInt8(size === 256 ? 0 : size, entry);
    header.writeUInt8(size === 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(buffer.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += buffer.length;
  });

  return Buffer.concat([header, ...images.map((image) => image.buffer)]);
}

async function main() {
  const svg = await fs.readFile(sourcePath);
  const images = await Promise.all(
    sizes.map(async (size) => ({ size, buffer: await renderPng(svg, size) }))
  );
  const appIcon = await renderPng(svg, 512);

  await Promise.all([
    fs.writeFile(pngPath, appIcon),
    fs.writeFile(appIconPath, appIcon),
    fs.writeFile(icoPath, createIco(images))
  ]);
  console.log(`Generated Worldcraft Codex icon: ${sizes.join(", ")}px ICO + 512px PNG`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
