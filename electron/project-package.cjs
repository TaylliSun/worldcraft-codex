const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const { createHash, randomUUID } = require("node:crypto");
const path = require("node:path");
const { pipeline } = require("node:stream/promises");
const { Transform } = require("node:stream");
const yauzl = require("yauzl");
const yazl = require("yazl");
const { createProjectPayload, parseWorkspaceJson } = require("./project-files.cjs");

const PACKAGE_FORMAT = "worldcraft-codex-project";
const PACKAGE_VERSION = 1;
const MANIFEST_PATH = "manifest.json";
const PROJECT_PATH = "project.json";
const MAX_ENTRIES = 20000;
const MAX_MANIFEST_BYTES = 8 * 1024 * 1024;
const MAX_PROJECT_BYTES = 512 * 1024 * 1024;
const MAX_ASSET_BYTES = 8 * 1024 * 1024 * 1024;
const MAX_TOTAL_ASSET_BYTES = 64 * 1024 * 1024 * 1024;
const MAX_COMPRESSION_RATIO = 1000;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const ALREADY_COMPRESSED_EXTENSIONS = new Set([
  ".7z",
  ".avi",
  ".flac",
  ".gif",
  ".gz",
  ".jpeg",
  ".jpg",
  ".m4a",
  ".mkv",
  ".mov",
  ".mp3",
  ".mp4",
  ".ogg",
  ".pdf",
  ".png",
  ".rar",
  ".wav",
  ".webm",
  ".webp",
  ".zip"
]);

function packageError(message, code = "INVALID_PACKAGE") {
  const error = new Error(message);
  error.code = code;
  return error;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeStoredName(value) {
  const name = String(value ?? "").trim();
  return name && name === path.basename(name) && name !== "." && name !== ".." ? name : "";
}

function safeArchivePath(value) {
  const archivePath = String(value ?? "");
  if (
    !archivePath ||
    archivePath.includes("\\") ||
    archivePath.startsWith("/") ||
    /^[a-z]:/i.test(archivePath)
  ) {
    return "";
  }
  const segments = archivePath.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) return "";
  return path.posix.normalize(archivePath) === archivePath ? archivePath : "";
}

function normalizeExtension(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  return /^\.[a-z0-9]{1,12}$/.test(extension) ? extension : "";
}

function canonicalAssetName(sha256, originalName, prefix = "asset") {
  const safePrefix = /^[a-z0-9-]{1,20}$/.test(prefix) ? prefix : "asset";
  return `${safePrefix}-${sha256.slice(0, 24)}${normalizeExtension(originalName)}`;
}

function archiveAssetPath(sha256, originalName) {
  return `assets/${sha256}${normalizeExtension(originalName)}`;
}

async function hashFile(filePath) {
  const hash = createHash("sha256");
  let size = 0;
  for await (const chunk of fsSync.createReadStream(filePath)) {
    size += chunk.length;
    hash.update(chunk);
  }
  return { sha256: hash.digest("hex"), size };
}

function hashBuffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function atomicReplaceFile(tempPath, targetPath) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  const previousPath = `${targetPath}.previous-${randomUUID()}`;
  const hadPrevious = await pathExists(targetPath);
  try {
    if (hadPrevious) await fs.rename(targetPath, previousPath);
    await fs.rename(tempPath, targetPath);
    if (hadPrevious) await fs.rm(previousPath, { force: true }).catch(() => undefined);
  } catch (error) {
    if (await pathExists(tempPath)) await fs.rm(tempPath, { force: true }).catch(() => undefined);
    if (hadPrevious && (await pathExists(previousPath)) && !(await pathExists(targetPath))) {
      await fs.rename(previousPath, targetPath).catch(() => undefined);
    }
    throw error;
  }
}

function normalizeAssetRecord(record, index) {
  if (!isPlainObject(record)) throw packageError(`资源清单第 ${index + 1} 项无效。`);
  const id = String(record.id ?? "").trim();
  const storedName = safeStoredName(record.storedName);
  const originalName = safeStoredName(record.originalName) || storedName;
  if (!id) throw packageError(`资源清单第 ${index + 1} 项缺少 ID。`);
  if (!storedName) throw packageError(`资源 ${id} 的本地文件名无效。`);
  const missing = record.missing === true;
  const size = Number(record.size);
  const sha256 = String(record.sha256 ?? "").toLowerCase();
  const expectedSha256 = String(record.expectedSha256 ?? "").toLowerCase();
  const archivePath = String(record.archivePath ?? "");
  if (!Number.isSafeInteger(size) || size < 0 || size > MAX_ASSET_BYTES) {
    throw packageError(`资源 ${id} 的大小无效。`);
  }
  if (missing) {
    if (archivePath || sha256) throw packageError(`缺失资源 ${id} 不应包含归档文件。`);
    if (expectedSha256 && !SHA256_PATTERN.test(expectedSha256)) {
      throw packageError(`缺失资源 ${id} 的预期哈希无效。`);
    }
  } else {
    if (!safeArchivePath(archivePath) || !archivePath.startsWith("assets/")) {
      throw packageError(`资源 ${id} 的归档路径无效。`);
    }
    if (!SHA256_PATTERN.test(sha256)) throw packageError(`资源 ${id} 的 SHA-256 无效。`);
  }
  return {
    id,
    storedName,
    originalName,
    mimeType: String(record.mimeType ?? "application/octet-stream").slice(0, 200),
    size,
    sha256,
    expectedSha256,
    archivePath,
    missing,
    untracked: record.untracked === true
  };
}

function normalizeManifest(value) {
  if (!isPlainObject(value)) throw packageError("工程包清单无效。");
  if (value.format !== PACKAGE_FORMAT || value.packageVersion !== PACKAGE_VERSION) {
    throw packageError("这不是受支持的 Worldcraft Codex 工程包。", "UNSUPPORTED_PACKAGE");
  }
  if (!isPlainObject(value.project)) throw packageError("工程包缺少项目数据清单。");
  const projectPath = safeArchivePath(value.project.path);
  const projectSize = Number(value.project.size);
  const projectSha256 = String(value.project.sha256 ?? "").toLowerCase();
  if (projectPath !== PROJECT_PATH) throw packageError("工程包项目数据路径无效。");
  if (!Number.isSafeInteger(projectSize) || projectSize < 1 || projectSize > MAX_PROJECT_BYTES) {
    throw packageError("工程包项目数据大小无效。");
  }
  if (!SHA256_PATTERN.test(projectSha256)) throw packageError("工程包项目数据哈希无效。");
  if (!Array.isArray(value.assets) || value.assets.length > MAX_ENTRIES - 2) {
    throw packageError("工程包资源清单数量无效。");
  }
  const assets = value.assets.map(normalizeAssetRecord);
  const ids = new Set();
  const storedNames = new Map();
  const archivePaths = new Map();
  let totalAssetBytes = 0;
  for (const asset of assets) {
    if (ids.has(asset.id)) throw packageError(`工程包包含重复资源 ID：${asset.id}`);
    ids.add(asset.id);
    const previousHash = storedNames.get(asset.storedName);
    const currentHash = asset.sha256 || asset.expectedSha256 || "missing";
    if (previousHash && previousHash !== currentHash) {
      throw packageError(`本地文件名 ${asset.storedName} 对应了不同资源内容。`);
    }
    storedNames.set(asset.storedName, currentHash);
    if (!asset.missing) {
      const previousArchive = archivePaths.get(asset.archivePath);
      const currentArchive = `${asset.sha256}:${asset.size}`;
      if (previousArchive && previousArchive !== currentArchive) {
        throw packageError(`归档路径 ${asset.archivePath} 声明了不同的资源内容。`);
      }
      archivePaths.set(asset.archivePath, currentArchive);
      totalAssetBytes += asset.size;
    }
    if (totalAssetBytes > MAX_TOTAL_ASSET_BYTES) throw packageError("工程包资源总大小超过安全上限。");
  }
  return {
    format: PACKAGE_FORMAT,
    packageVersion: PACKAGE_VERSION,
    appVersion: String(value.appVersion ?? "").slice(0, 100),
    schemaVersion: Math.max(0, Number(value.schemaVersion) || 0),
    createdAt: String(value.createdAt ?? ""),
    complete: assets.every((asset) => !asset.missing),
    project: { path: PROJECT_PATH, size: projectSize, sha256: projectSha256 },
    assets
  };
}

function validateZipEntry(entry) {
  const entryPath = safeArchivePath(entry.fileName);
  if (!entryPath || entry.fileName.endsWith("/")) throw packageError("工程包包含无效目录或路径。");
  if ((entry.generalPurposeBitFlag & 1) !== 0) throw packageError("不支持加密的工程包条目。");
  if (![0, 8].includes(entry.compressionMethod)) throw packageError("工程包使用了不支持的压缩方式。");
  if (entry.uncompressedSize > MAX_ASSET_BYTES) throw packageError("工程包条目超过安全大小上限。");
  if (
    entry.compressedSize > 0 &&
    entry.uncompressedSize > 32 * 1024 * 1024 &&
    entry.uncompressedSize / entry.compressedSize > MAX_COMPRESSION_RATIO
  ) {
    throw packageError("工程包条目的压缩比超过安全上限。", "UNSAFE_PACKAGE");
  }
  return entryPath;
}

async function openZipEntries(filePath) {
  const zipFile = await yauzl.openPromise(filePath, {
    autoClose: false,
    decodeStrings: true,
    lazyEntries: true,
    strictFileNames: true,
    validateEntrySizes: true
  });
  const entries = new Map();
  try {
    for await (const entry of zipFile.eachEntry()) {
      const entryPath = validateZipEntry(entry);
      if (entries.has(entryPath)) throw packageError(`工程包包含重复条目：${entryPath}`);
      entries.set(entryPath, entry);
      if (entries.size > MAX_ENTRIES) throw packageError("工程包条目数量超过安全上限。");
    }
    return { zipFile, entries };
  } catch (error) {
    zipFile.close();
    throw error;
  }
}

async function readEntryBuffer(zipFile, entry, maxBytes) {
  if (!entry || entry.uncompressedSize > maxBytes) throw packageError("工程包文本条目超过安全上限。");
  const stream = await zipFile.openReadStreamPromise(entry);
  const chunks = [];
  let size = 0;
  for await (const chunk of stream) {
    size += chunk.length;
    if (size > maxBytes) throw packageError("工程包文本条目超过安全上限。");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, size);
}

async function hashEntry(zipFile, entry, expectedSize) {
  if (!entry || entry.uncompressedSize !== expectedSize) throw packageError("工程包资源大小与清单不一致。");
  const hash = createHash("sha256");
  let size = 0;
  const stream = await zipFile.openReadStreamPromise(entry);
  for await (const chunk of stream) {
    size += chunk.length;
    if (size > expectedSize) throw packageError("工程包资源超过清单声明大小。");
    hash.update(chunk);
  }
  return { size, sha256: hash.digest("hex") };
}

async function readPackageMetadata(filePath, { verifyAssets = true } = {}) {
  const { zipFile, entries } = await openZipEntries(filePath);
  try {
    const manifestBuffer = await readEntryBuffer(zipFile, entries.get(MANIFEST_PATH), MAX_MANIFEST_BYTES);
    let manifestValue;
    try {
      manifestValue = JSON.parse(manifestBuffer.toString("utf8"));
    } catch {
      throw packageError("工程包清单不是有效 JSON。");
    }
    const manifest = normalizeManifest(manifestValue);
    const expectedPaths = new Set([MANIFEST_PATH, PROJECT_PATH]);
    for (const asset of manifest.assets) {
      if (!asset.missing) expectedPaths.add(asset.archivePath);
    }
    for (const entryPath of entries.keys()) {
      if (!expectedPaths.has(entryPath)) throw packageError(`工程包包含未声明条目：${entryPath}`);
    }
    for (const entryPath of expectedPaths) {
      if (!entries.has(entryPath)) throw packageError(`工程包缺少条目：${entryPath}`);
    }

    const projectBuffer = await readEntryBuffer(zipFile, entries.get(PROJECT_PATH), MAX_PROJECT_BYTES);
    if (projectBuffer.length !== manifest.project.size || hashBuffer(projectBuffer) !== manifest.project.sha256) {
      throw packageError("工程包项目数据校验失败。", "HASH_MISMATCH");
    }
    let data;
    try {
      data = parseWorkspaceJson(projectBuffer.toString("utf8"));
    } catch {
      throw packageError("工程包项目数据无法读取。");
    }

    if (verifyAssets) {
      const checkedPaths = new Set();
      for (const asset of manifest.assets) {
        if (asset.missing || checkedPaths.has(asset.archivePath)) continue;
        checkedPaths.add(asset.archivePath);
        const actual = await hashEntry(zipFile, entries.get(asset.archivePath), asset.size);
        if (actual.sha256 !== asset.sha256) {
          throw packageError(`资源 ${asset.originalName} 的 SHA-256 校验失败。`, "HASH_MISMATCH");
        }
      }
    }
    return { data, entries, manifest, zipFile };
  } catch (error) {
    zipFile.close();
    throw error;
  }
}

async function inspectProjectPackage({
  filePath,
  verifyAssets = true,
  supportedSchemaVersion = Infinity
}) {
  const metadata = await readPackageMetadata(filePath, { verifyAssets });
  if (metadata.manifest.schemaVersion > supportedSchemaVersion) {
    metadata.zipFile.close();
    throw packageError(
      `工程包需要 schema ${metadata.manifest.schemaVersion}，当前版本最高支持 ${supportedSchemaVersion}。`,
      "UNSUPPORTED_SCHEMA"
    );
  }
  metadata.zipFile.close();
  const stat = await fs.stat(filePath);
  const missingAssets = metadata.manifest.assets.filter((asset) => asset.missing);
  return {
    data: metadata.data,
    manifest: metadata.manifest,
    summary: {
      complete: missingAssets.length === 0,
      assetCount: metadata.manifest.assets.length,
      embeddedAssetCount: metadata.manifest.assets.length - missingAssets.length,
      missingAssetCount: missingAssets.length,
      untrackedAssetCount: metadata.manifest.assets.filter((asset) => asset.untracked).length,
      packageBytes: stat.size,
      packageVersion: metadata.manifest.packageVersion,
      schemaVersion: metadata.manifest.schemaVersion
    }
  };
}

async function collectProjectAssets(data, assetsDir) {
  const sourceAssets = Array.isArray(data?.assets) ? data.assets : [];
  const ids = new Set();
  const fileCache = new Map();
  const records = [];
  const uniqueFiles = new Map();
  const updatedData = cloneJson(data);
  const updatedAssets = Array.isArray(updatedData.assets) ? updatedData.assets : [];

  async function getFileInfo(storedName) {
    if (!storedName) return null;
    if (fileCache.has(storedName)) return fileCache.get(storedName);
    const filePath = path.join(assetsDir, storedName);
    let fileInfo = null;
    try {
      const stat = await fs.stat(filePath);
      if (stat.isFile()) fileInfo = { filePath, ...(await hashFile(filePath)) };
    } catch {
      fileInfo = null;
    }
    fileCache.set(storedName, fileInfo);
    return fileInfo;
  }

  for (let index = 0; index < sourceAssets.length; index += 1) {
    const asset = sourceAssets[index] ?? {};
    const id = String(asset.id ?? "").trim();
    if (!id || ids.has(id)) throw packageError(`项目包含无效或重复资源 ID：${id || "(空)"}`);
    ids.add(id);
    const storedName = safeStoredName(asset.storedName);
    const originalName = safeStoredName(asset.originalName) || storedName || `resource-${index + 1}`;
    const expectedSha256 = SHA256_PATTERN.test(String(asset.contentHash ?? "").toLowerCase())
      ? String(asset.contentHash).toLowerCase()
      : "";
    const fileInfo = await getFileInfo(storedName);
    if (!storedName || !fileInfo) {
      const missingStoredName = storedName || `missing-${id}`;
      records.push({
        id,
        storedName: missingStoredName,
        originalName,
        mimeType: String(asset.mimeType ?? "application/octet-stream"),
        size: Math.max(0, Number(asset.size) || 0),
        sha256: "",
        expectedSha256,
        archivePath: "",
        missing: true
      });
      if (updatedAssets[index]) updatedAssets[index].storedName = missingStoredName;
      continue;
    }
    const archivePath = archiveAssetPath(fileInfo.sha256, originalName || storedName);
    records.push({
      id,
      storedName,
      originalName,
      mimeType: String(asset.mimeType ?? "application/octet-stream"),
      size: fileInfo.size,
      sha256: fileInfo.sha256,
      expectedSha256: "",
      archivePath,
      missing: false
    });
    uniqueFiles.set(archivePath, fileInfo.filePath);
    if (updatedAssets[index]) {
      updatedAssets[index].contentHash = fileInfo.sha256;
      updatedAssets[index].size = fileInfo.size;
    }
  }

  const trackedStoredNames = new Set(records.map((record) => record.storedName));
  for (const storedName of collectAssetUrlStoredNames(data)) {
    if (trackedStoredNames.has(storedName)) continue;
    let id = `untracked-${createHash("sha256").update(storedName).digest("hex").slice(0, 24)}`;
    while (ids.has(id)) id = `${id}-reference`;
    ids.add(id);
    const fileInfo = await getFileInfo(storedName);
    if (!fileInfo) {
      records.push({
        id,
        storedName,
        originalName: storedName,
        mimeType: "application/octet-stream",
        size: 0,
        sha256: "",
        expectedSha256: "",
        archivePath: "",
        missing: true,
        untracked: true
      });
      continue;
    }
    const archivePath = archiveAssetPath(fileInfo.sha256, storedName);
    records.push({
      id,
      storedName,
      originalName: storedName,
      mimeType: "application/octet-stream",
      size: fileInfo.size,
      sha256: fileInfo.sha256,
      expectedSha256: "",
      archivePath,
      missing: false,
      untracked: true
    });
    uniqueFiles.set(archivePath, fileInfo.filePath);
  }
  return { records, uniqueFiles, updatedData };
}

async function writeZipFile({ filePath, manifestBuffer, projectBuffer, uniqueFiles, createdAt }) {
  await new Promise((resolve, reject) => {
    const zipFile = new yazl.ZipFile();
    const output = fsSync.createWriteStream(filePath, { flags: "wx" });
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else resolve();
    };
    output.once("close", () => finish());
    output.once("error", finish);
    zipFile.outputStream.once("error", finish);
    zipFile.outputStream.pipe(output);
    const mtime = new Date(createdAt);
    zipFile.addBuffer(manifestBuffer, MANIFEST_PATH, { mtime, compress: true });
    zipFile.addBuffer(projectBuffer, PROJECT_PATH, { mtime, compress: true });
    for (const [metadataPath, sourcePath] of uniqueFiles) {
      zipFile.addFile(sourcePath, metadataPath, {
        mtime,
        compress: !ALREADY_COMPRESSED_EXTENSIONS.has(path.extname(sourcePath).toLowerCase())
      });
    }
    zipFile.end();
  });
}

async function createProjectPackage({
  targetPath,
  data,
  assetsDir,
  schemaVersion,
  appVersion,
  now = () => new Date().toISOString()
}) {
  if (!targetPath || path.extname(targetPath).toLowerCase() !== ".wcodex") {
    throw packageError("完整工程包必须使用 .wcodex 扩展名。", "INVALID_TARGET");
  }
  const createdAt = now();
  const collected = await collectProjectAssets(data, assetsDir);
  const projectPayload = createProjectPayload(collected.updatedData, {
    schemaVersion,
    savedAt: createdAt
  });
  const projectBuffer = Buffer.from(JSON.stringify(projectPayload), "utf8");
  if (projectBuffer.length > MAX_PROJECT_BYTES) throw packageError("项目数据超过工程包安全上限。");
  const manifest = {
    format: PACKAGE_FORMAT,
    packageVersion: PACKAGE_VERSION,
    appVersion: String(appVersion ?? ""),
    schemaVersion,
    createdAt,
    complete: collected.records.every((asset) => !asset.missing),
    project: {
      path: PROJECT_PATH,
      size: projectBuffer.length,
      sha256: hashBuffer(projectBuffer)
    },
    assets: collected.records
  };
  const manifestBuffer = Buffer.from(JSON.stringify(manifest, null, 2), "utf8");
  if (manifestBuffer.length > MAX_MANIFEST_BYTES) throw packageError("工程包资源清单超过安全上限。");
  const directory = path.dirname(targetPath);
  await fs.mkdir(directory, { recursive: true });
  const tempPath = path.join(directory, `.${path.basename(targetPath)}.${randomUUID()}.tmp`);
  try {
    await writeZipFile({
      filePath: tempPath,
      manifestBuffer,
      projectBuffer,
      uniqueFiles: collected.uniqueFiles,
      createdAt
    });
    await inspectProjectPackage({ filePath: tempPath, verifyAssets: true });
    await atomicReplaceFile(tempPath, targetPath);
  } catch (error) {
    await fs.rm(tempPath, { force: true }).catch(() => undefined);
    throw error;
  }
  const stat = await fs.stat(targetPath);
  return {
    data: collected.updatedData,
    manifest,
    summary: {
      complete: manifest.complete,
      assetCount: manifest.assets.length,
      embeddedAssetCount: manifest.assets.filter((asset) => !asset.missing).length,
      missingAssetCount: manifest.assets.filter((asset) => asset.missing).length,
      untrackedAssetCount: manifest.assets.filter((asset) => asset.untracked).length,
      uniqueFileCount: collected.uniqueFiles.size,
      packageBytes: stat.size,
      packageVersion: PACKAGE_VERSION,
      schemaVersion
    }
  };
}

function createHashingTransform() {
  const hash = createHash("sha256");
  let size = 0;
  return {
    stream: new Transform({
      transform(chunk, _encoding, callback) {
        size += chunk.length;
        hash.update(chunk);
        callback(null, chunk);
      }
    }),
    result: () => ({ size, sha256: hash.digest("hex") })
  };
}

function rewriteAssetUrls(value, nameMap) {
  if (typeof value === "string") {
    let result = value;
    for (const [previousName, nextName] of nameMap) {
      if (previousName === nextName) continue;
      const previousUrl = `worldcraft://asset/${encodeURIComponent(previousName)}`;
      const nextUrl = `worldcraft://asset/${encodeURIComponent(nextName)}`;
      result = result.split(previousUrl).join(nextUrl);
    }
    return result;
  }
  if (Array.isArray(value)) return value.map((item) => rewriteAssetUrls(item, nameMap));
  if (isPlainObject(value)) {
    for (const [key, child] of Object.entries(value)) value[key] = rewriteAssetUrls(child, nameMap);
  }
  return value;
}

function collectAssetUrlStoredNames(value, result = new Set()) {
  if (typeof value === "string") {
    const pattern = /worldcraft:\/\/asset\/([^"'<>\s)]+)/g;
    for (const match of value.matchAll(pattern)) {
      try {
        const storedName = safeStoredName(decodeURIComponent(match[1]));
        if (storedName) result.add(storedName);
      } catch {
        // Invalid encoded URLs are left for project-health diagnostics.
      }
    }
    return result;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectAssetUrlStoredNames(item, result));
  } else if (isPlainObject(value)) {
    Object.values(value).forEach((item) => collectAssetUrlStoredNames(item, result));
  }
  return result;
}

async function chooseImportedAssetPath(assetsDir, sha256, originalName) {
  const preferredName = canonicalAssetName(sha256, originalName);
  const preferredPath = path.join(assetsDir, preferredName);
  if (!(await pathExists(preferredPath))) return { storedName: preferredName, filePath: preferredPath, reused: false };
  const preferredHash = await hashFile(preferredPath);
  if (preferredHash.sha256 === sha256) return { storedName: preferredName, filePath: preferredPath, reused: true };
  const fallbackName = `asset-${sha256}${normalizeExtension(originalName)}`;
  const fallbackPath = path.join(assetsDir, fallbackName);
  if (!(await pathExists(fallbackPath))) return { storedName: fallbackName, filePath: fallbackPath, reused: false };
  const fallbackHash = await hashFile(fallbackPath);
  if (fallbackHash.sha256 === sha256) return { storedName: fallbackName, filePath: fallbackPath, reused: true };
  throw packageError("本地资源目录发生不可安全处理的哈希命名冲突。", "ASSET_COLLISION");
}

async function extractProjectPackage({ filePath, assetsDir, supportedSchemaVersion = Infinity }) {
  await fs.mkdir(assetsDir, { recursive: true });
  const metadata = await readPackageMetadata(filePath, { verifyAssets: false });
  if (metadata.manifest.schemaVersion > supportedSchemaVersion) {
    metadata.zipFile.close();
    throw packageError(
      `工程包需要 schema ${metadata.manifest.schemaVersion}，当前版本最高支持 ${supportedSchemaVersion}。`,
      "UNSUPPORTED_SCHEMA"
    );
  }
  const stageDir = await fs.mkdtemp(path.join(assetsDir, ".wcodex-import-"));
  const staged = new Map();
  const installedPaths = [];
  let completed = false;
  try {
    const uniqueRecords = new Map();
    for (const asset of metadata.manifest.assets) {
      if (!asset.missing && !uniqueRecords.has(asset.archivePath)) uniqueRecords.set(asset.archivePath, asset);
    }
    let stageIndex = 0;
    for (const [archivePath, asset] of uniqueRecords) {
      const entry = metadata.entries.get(archivePath);
      const stagePath = path.join(stageDir, `asset-${stageIndex++}.tmp`);
      const readStream = await metadata.zipFile.openReadStreamPromise(entry);
      const hashing = createHashingTransform();
      await pipeline(readStream, hashing.stream, fsSync.createWriteStream(stagePath, { flags: "wx" }));
      const actual = hashing.result();
      if (actual.size !== asset.size || actual.sha256 !== asset.sha256) {
        throw packageError(`资源 ${asset.originalName} 的完整性校验失败。`, "HASH_MISMATCH");
      }
      staged.set(archivePath, stagePath);
    }
    metadata.zipFile.close();

    const destinationByArchive = new Map();
    for (const [archivePath, asset] of uniqueRecords) {
      const destination = await chooseImportedAssetPath(assetsDir, asset.sha256, asset.originalName);
      destinationByArchive.set(archivePath, destination);
    }
    let importedFileCount = 0;
    let reusedFileCount = 0;
    for (const [archivePath] of uniqueRecords) {
      const destination = destinationByArchive.get(archivePath);
      if (destination.reused) {
        reusedFileCount += 1;
        await fs.rm(staged.get(archivePath), { force: true });
      } else {
        await fs.rename(staged.get(archivePath), destination.filePath);
        installedPaths.push(destination.filePath);
        importedFileCount += 1;
      }
    }

    const data = cloneJson(metadata.data);
    const recordById = new Map(metadata.manifest.assets.map((asset) => [asset.id, asset]));
    const nameMap = new Map();
    for (const record of metadata.manifest.assets) {
      if (record.missing) continue;
      const destination = destinationByArchive.get(record.archivePath);
      if (!destination) throw packageError(`资源 ${record.id} 未完成安装。`);
      nameMap.set(record.storedName, destination.storedName);
    }
    if (Array.isArray(data.assets)) {
      for (const asset of data.assets) {
        const record = recordById.get(String(asset?.id ?? ""));
        if (!record || record.missing) continue;
        const nextStoredName = destinationByArchive.get(record.archivePath)?.storedName;
        if (!nextStoredName) throw packageError(`资源 ${record.id} 未完成安装。`);
        nameMap.set(record.storedName, nextStoredName);
        asset.storedName = nextStoredName;
        asset.contentHash = record.sha256;
        asset.size = record.size;
      }
    }
    rewriteAssetUrls(data, nameMap);
    const missingAssets = metadata.manifest.assets.filter((asset) => asset.missing);
    const result = {
      data,
      manifest: metadata.manifest,
      installedStoredNames: installedPaths.map((filePath) => path.basename(filePath)),
      summary: {
        complete: missingAssets.length === 0,
        assetCount: metadata.manifest.assets.length,
        embeddedAssetCount: metadata.manifest.assets.length - missingAssets.length,
        missingAssetCount: missingAssets.length,
        untrackedAssetCount: metadata.manifest.assets.filter((asset) => asset.untracked).length,
        importedFileCount,
        reusedFileCount,
        packageVersion: metadata.manifest.packageVersion,
        schemaVersion: metadata.manifest.schemaVersion
      }
    };
    completed = true;
    return result;
  } finally {
    metadata.zipFile.close();
    await fs.rm(stageDir, { recursive: true, force: true }).catch(() => undefined);
    if (!completed) {
      await Promise.all(
        installedPaths.map((filePath) => fs.rm(filePath, { force: true }).catch(() => undefined))
      );
    }
  }
}

module.exports = {
  MANIFEST_PATH,
  MAX_ASSET_BYTES,
  MAX_ENTRIES,
  PACKAGE_FORMAT,
  PACKAGE_VERSION,
  PROJECT_PATH,
  atomicReplaceFile,
  canonicalAssetName,
  createProjectPackage,
  extractProjectPackage,
  hashFile,
  inspectProjectPackage,
  normalizeManifest,
  rewriteAssetUrls,
  safeArchivePath,
  safeStoredName
};
