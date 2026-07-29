const fs = require("node:fs/promises");
const path = require("node:path");
const { promisify } = require("node:util");
const { gzip, gunzip } = require("node:zlib");

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

const COMPRESSED_DATA_BACKUP_SUFFIX = ".wcodex.json.gz";
const LEGACY_DATA_BACKUP_SUFFIX = ".wcodex.json";
const COMPLETE_BACKUP_SUFFIX = ".wcodex";

const DEFAULT_BACKUP_POLICY = Object.freeze({
  dataLimit: 20,
  completeLimit: 5,
  maxTotalBytes: 3 * 1024 * 1024 * 1024
});

function isDataBackupFileName(fileName) {
  const value = String(fileName || "");
  return value.endsWith(COMPRESSED_DATA_BACKUP_SUFFIX) || value.endsWith(LEGACY_DATA_BACKUP_SUFFIX);
}

function isCompleteBackupFileName(fileName) {
  const value = String(fileName || "");
  return value.endsWith(COMPLETE_BACKUP_SUFFIX) && !isDataBackupFileName(value);
}

function isBackupFileName(fileName) {
  return isDataBackupFileName(fileName) || isCompleteBackupFileName(fileName);
}

async function encodeDataBackup(payload) {
  return gzipAsync(Buffer.from(JSON.stringify(payload), "utf8"), { level: 9 });
}

async function readDataBackup(filePath) {
  const encoded = await fs.readFile(filePath);
  const decoded = filePath.endsWith(COMPRESSED_DATA_BACKUP_SUFFIX)
    ? await gunzipAsync(encoded)
    : encoded;
  return JSON.parse(decoded.toString("utf8"));
}

function backupKind(fileName) {
  if (isCompleteBackupFileName(fileName)) return "complete";
  if (isDataBackupFileName(fileName)) return "data";
  return "unknown";
}

function normalizePolicy(policy = {}) {
  const boundedInteger = (value, fallback, minimum) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(minimum, Math.floor(parsed)) : fallback;
  };
  return {
    dataLimit: boundedInteger(policy.dataLimit, DEFAULT_BACKUP_POLICY.dataLimit, 1),
    completeLimit: boundedInteger(policy.completeLimit, DEFAULT_BACKUP_POLICY.completeLimit, 1),
    maxTotalBytes: boundedInteger(
      policy.maxTotalBytes,
      DEFAULT_BACKUP_POLICY.maxTotalBytes,
      64 * 1024 * 1024
    )
  };
}

function planBackupCleanup(entries, rawPolicy = {}) {
  const policy = normalizePolicy(rawPolicy);
  const normalized = entries
    .filter((entry) => isBackupFileName(entry.fileName))
    .map((entry) => ({
      ...entry,
      kind: entry.kind === "complete" || entry.kind === "data"
        ? entry.kind
        : backupKind(entry.fileName),
      size: Math.max(0, Number(entry.size) || 0),
      mtimeMs: Number(entry.mtimeMs) || Date.parse(entry.createdAt || "") || 0
    }))
    .sort((left, right) => right.mtimeMs - left.mtimeMs || right.fileName.localeCompare(left.fileName));

  const keep = new Set();
  const remove = new Set();
  for (const kind of ["data", "complete"]) {
    const limit = kind === "data" ? policy.dataLimit : policy.completeLimit;
    normalized
      .filter((entry) => entry.kind === kind)
      .forEach((entry, index) => (index < limit ? keep : remove).add(entry.fileName));
  }

  let keptBytes = normalized.reduce(
    (total, entry) => total + (remove.has(entry.fileName) ? 0 : entry.size),
    0
  );
  if (keptBytes > policy.maxTotalBytes) {
    const protectedNames = new Set();
    for (const kind of ["data", "complete"]) {
      const newest = normalized.find((entry) => entry.kind === kind && !remove.has(entry.fileName));
      if (newest) protectedNames.add(newest.fileName);
    }
    const quotaCandidates = [...normalized]
      .reverse()
      .filter((entry) => !remove.has(entry.fileName) && !protectedNames.has(entry.fileName));
    for (const entry of quotaCandidates) {
      if (keptBytes <= policy.maxTotalBytes) break;
      remove.add(entry.fileName);
      keep.delete(entry.fileName);
      keptBytes -= entry.size;
    }
  }

  const removedEntries = normalized.filter((entry) => remove.has(entry.fileName));
  const keptEntries = normalized.filter((entry) => !remove.has(entry.fileName));
  const sum = (items) => items.reduce((total, entry) => total + entry.size, 0);
  return {
    policy,
    keptEntries,
    removedEntries,
    totalBytes: sum(normalized),
    keptBytes: sum(keptEntries),
    reclaimableBytes: sum(removedEntries)
  };
}

async function inspectBackupDirectory(backupDir, policy = {}) {
  await fs.mkdir(backupDir, { recursive: true });
  const names = (await fs.readdir(backupDir)).filter(isBackupFileName);
  const entries = await Promise.all(
    names.map(async (fileName) => {
      const filePath = path.join(backupDir, fileName);
      const stat = await fs.stat(filePath);
      return {
        fileName,
        filePath,
        kind: backupKind(fileName),
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        createdAt: stat.mtime.toISOString()
      };
    })
  );
  const plan = planBackupCleanup(entries, policy);
  const dataEntries = entries.filter((entry) => entry.kind === "data");
  const completeEntries = entries.filter((entry) => entry.kind === "complete");
  return {
    ...plan,
    entries,
    dataCount: dataEntries.length,
    completeCount: completeEntries.length,
    dataBytes: dataEntries.reduce((total, entry) => total + entry.size, 0),
    completeBytes: completeEntries.reduce((total, entry) => total + entry.size, 0)
  };
}

async function cleanupBackupDirectory(backupDir, policy = {}) {
  const inspection = await inspectBackupDirectory(backupDir, policy);
  const removed = [];
  for (const entry of inspection.removedEntries) {
    try {
      await fs.unlink(entry.filePath);
      removed.push(entry);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return {
    ...inspection,
    removed,
    removedBytes: removed.reduce((total, entry) => total + entry.size, 0)
  };
}

module.exports = {
  COMPRESSED_DATA_BACKUP_SUFFIX,
  DEFAULT_BACKUP_POLICY,
  LEGACY_DATA_BACKUP_SUFFIX,
  backupKind,
  cleanupBackupDirectory,
  encodeDataBackup,
  inspectBackupDirectory,
  isBackupFileName,
  isCompleteBackupFileName,
  isDataBackupFileName,
  normalizePolicy,
  planBackupCleanup,
  readDataBackup
};
