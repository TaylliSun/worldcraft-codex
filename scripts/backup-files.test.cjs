const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const {
  COMPRESSED_DATA_BACKUP_SUFFIX,
  cleanupBackupDirectory,
  encodeDataBackup,
  inspectBackupDirectory,
  isBackupFileName,
  isCompleteBackupFileName,
  isDataBackupFileName,
  planBackupCleanup,
  readDataBackup
} = require("../electron/backup-files.cjs");

let assertions = 0;
function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "worldcraft-backup-files-"));
  try {
  check(isDataBackupFileName("snapshot.wcodex.json"), true, "legacy data backup is recognized");
  check(isDataBackupFileName("snapshot.wcodex.json.gz"), true, "compressed data backup is recognized");
  check(isCompleteBackupFileName("project.wcodex"), true, "complete backup is recognized");
  check(isCompleteBackupFileName("snapshot.wcodex.json"), false, "data backup is not complete");
  check(isBackupFileName("notes.json"), false, "unrelated JSON is ignored");

  const payload = {
    app: "Worldcraft Codex",
    reason: "manual",
    data: {
      worlds: [{ id: "world-a", name: "苍岚纪" }],
      entities: Array.from({ length: 40 }, (_, index) => ({
        id: `entity-${index}`,
        title: `苍岚人物 ${index}`,
        content: "北境风雪中的长期世界观正文。".repeat(20)
      }))
    }
  };
  const compressedPath = path.join(root, `manual${COMPRESSED_DATA_BACKUP_SUFFIX}`);
  const compressed = await encodeDataBackup(payload);
  await fs.writeFile(compressedPath, compressed);
  check(await readDataBackup(compressedPath), payload, "compressed backup round-trips exactly");
  check(compressed.length < Buffer.byteLength(JSON.stringify(payload)), true, "gzip reduces repetitive payload size");

  const entries = [
    { fileName: "data-3.wcodex.json.gz", kind: "data", size: 20, mtimeMs: 300 },
    { fileName: "data-2.wcodex.json", kind: "data", size: 20, mtimeMs: 200 },
    { fileName: "data-1.wcodex.json", kind: "data", size: 20, mtimeMs: 100 },
    { fileName: "complete-3.wcodex", kind: "complete", size: 90, mtimeMs: 300 },
    { fileName: "complete-2.wcodex", kind: "complete", size: 90, mtimeMs: 200 },
    { fileName: "complete-1.wcodex", kind: "complete", size: 90, mtimeMs: 100 }
  ];
  const countPlan = planBackupCleanup(entries, {
    dataLimit: 2,
    completeLimit: 2,
    maxTotalBytes: 1000
  });
  check(
    countPlan.removedEntries.map((entry) => entry.fileName).sort(),
    ["complete-1.wcodex", "data-1.wcodex.json"],
    "count policy removes the oldest backup of each kind"
  );

  const quotaEntries = entries.map((entry) => ({ ...entry, size: entry.size * 1024 * 1024 }));
  const quotaPlan = planBackupCleanup(quotaEntries, {
    dataLimit: 3,
    completeLimit: 3,
    maxTotalBytes: 160 * 1024 * 1024
  });
  check(quotaPlan.keptEntries.some((entry) => entry.fileName === "data-3.wcodex.json.gz"), true, "quota keeps newest data backup");
  check(quotaPlan.keptEntries.some((entry) => entry.fileName === "complete-3.wcodex"), true, "quota keeps newest complete backup");
  check(quotaPlan.keptBytes <= 160 * 1024 * 1024 || quotaPlan.keptEntries.length === 2, true, "quota removes oldest optional backups");

  for (const entry of entries) {
    await fs.writeFile(path.join(root, entry.fileName), Buffer.alloc(entry.size));
    const timestamp = new Date(1_700_000_000_000 + entry.mtimeMs);
    await fs.utimes(path.join(root, entry.fileName), timestamp, timestamp);
  }
  const inspection = await inspectBackupDirectory(root, {
    dataLimit: 2,
    completeLimit: 2,
    maxTotalBytes: 1000
  });
  check(inspection.dataCount, 4, "directory inventory includes compressed and legacy data backups");
  check(inspection.completeCount, 3, "directory inventory counts complete backups");
  check(inspection.removedEntries.length, 3, "inventory reports reclaimable files without deleting them");
  const cleanup = await cleanupBackupDirectory(root, {
    dataLimit: 2,
    completeLimit: 2,
    maxTotalBytes: 1000
  });
  check(cleanup.removed.length, 3, "explicit cleanup deletes only planned files");
  check((await fs.readdir(root)).filter(isBackupFileName).length, 4, "retained backups remain on disk");

    console.log(`Backup file checks passed: ${assertions} assertions across compression, inventory, quota, and cleanup.`);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
