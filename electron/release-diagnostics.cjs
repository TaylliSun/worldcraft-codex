const fs = require("node:fs");
const path = require("node:path");

const MAX_LOG_BYTES = 2 * 1024 * 1024;
const MAX_EVENTS = 200;

function safeEventName(value) {
  const normalized = String(value ?? "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9_.:-]+/g, "-")
    .slice(0, 80);
  return normalized || "unknown";
}

function safeErrorMetadata(error) {
  if (!error || typeof error !== "object") return {};
  return {
    errorName: safeEventName(error.name || "error"),
    errorCode: error.code ? safeEventName(error.code) : undefined
  };
}

function sanitizeLogEntry(entry) {
  return {
    timestamp: String(entry?.timestamp ?? ""),
    level: ["debug", "info", "warning", "error"].includes(entry?.level)
      ? entry.level
      : "info",
    event: safeEventName(entry?.event),
    ...(entry?.errorName ? { errorName: safeEventName(entry.errorName) } : {}),
    ...(entry?.errorCode ? { errorCode: safeEventName(entry.errorCode) } : {})
  };
}

class ReleaseLogger {
  constructor({ logDir, now = () => new Date().toISOString(), maxBytes = MAX_LOG_BYTES }) {
    this.logDir = logDir;
    this.logPath = path.join(logDir, "worldcraft.log.jsonl");
    this.previousLogPath = path.join(logDir, "worldcraft.previous.log.jsonl");
    this.now = now;
    this.maxBytes = maxBytes;
  }

  initialize() {
    fs.mkdirSync(this.logDir, { recursive: true });
    this.rotateIfNeeded();
    return this.logPath;
  }

  rotateIfNeeded() {
    if (!fs.existsSync(this.logPath) || fs.statSync(this.logPath).size < this.maxBytes) return;
    if (fs.existsSync(this.previousLogPath)) fs.rmSync(this.previousLogPath, { force: true });
    fs.renameSync(this.logPath, this.previousLogPath);
  }

  log(level, event, metadata = {}) {
    try {
      this.initialize();
      const errorMetadata = safeErrorMetadata(metadata.error);
      const entry = sanitizeLogEntry({
        timestamp: this.now(),
        level,
        event,
        errorName: metadata.errorName ?? errorMetadata.errorName,
        errorCode: metadata.errorCode ?? errorMetadata.errorCode
      });
      fs.appendFileSync(this.logPath, `${JSON.stringify(entry)}\n`, "utf8");
      return entry;
    } catch {
      return null;
    }
  }

  readRecent(limit = MAX_EVENTS) {
    const entries = [];
    for (const filePath of [this.previousLogPath, this.logPath]) {
      if (!fs.existsSync(filePath)) continue;
      const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        try {
          entries.push(sanitizeLogEntry(JSON.parse(line)));
        } catch {
          entries.push(sanitizeLogEntry({ timestamp: "", level: "warning", event: "log.parse-failed" }));
        }
      }
    }
    return entries.slice(-Math.max(1, Math.min(Number(limit) || MAX_EVENTS, MAX_EVENTS)));
  }
}

function countByLevel(events) {
  return events.reduce(
    (counts, event) => {
      counts[event.level] = (counts[event.level] ?? 0) + 1;
      return counts;
    },
    { debug: 0, info: 0, warning: 0, error: 0 }
  );
}

function sanitizeItemCounts(value) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, count]) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(key) && Number.isFinite(Number(count)))
      .map(([key, count]) => [key, Math.max(0, Number(count))])
  );
}

function buildDiagnosticBundle({
  appVersion,
  schemaVersion,
  generatedAt,
  runtime,
  diagnostics,
  events,
  backups,
  assets
}) {
  const safeEvents = (Array.isArray(events) ? events : []).slice(-MAX_EVENTS).map(sanitizeLogEntry);
  const migration = diagnostics?.lastMigration;
  return {
    format: "worldcraft-codex-diagnostics-v1",
    generatedAt: String(generatedAt ?? new Date().toISOString()),
    application: {
      name: "Worldcraft Codex",
      version: String(appVersion ?? "unknown"),
      schemaVersion: Number(schemaVersion) || 0
    },
    runtime: {
      platform: safeEventName(runtime?.platform),
      architecture: safeEventName(runtime?.architecture),
      osRelease: String(runtime?.osRelease ?? "").slice(0, 80),
      packaged: Boolean(runtime?.packaged)
    },
    storage: {
      ok: Boolean(diagnostics?.ok),
      quickCheck: String(diagnostics?.quickCheck ?? "unknown").slice(0, 40),
      foreignKeyIssues: Math.max(0, Number(diagnostics?.foreignKeyIssues) || 0),
      invalidItemCount: Array.isArray(diagnostics?.invalidItems)
        ? diagnostics.invalidItems.length
        : 0,
      duplicateCount: Array.isArray(diagnostics?.duplicates)
        ? diagnostics.duplicates.length
        : 0,
      itemCount: Math.max(0, Number(diagnostics?.itemCount) || 0),
      itemCounts: sanitizeItemCounts(diagnostics?.itemCounts),
      versionCount: Math.max(0, Number(diagnostics?.versionCount) || 0),
      ftsAvailable: Boolean(diagnostics?.ftsAvailable),
      searchCount: Math.max(0, Number(diagnostics?.searchCount) || 0),
      searchMapCount: Math.max(0, Number(diagnostics?.searchMapCount) || 0),
      databaseBytes: Math.max(0, Number(diagnostics?.dbSize) || 0),
      walBytes: Math.max(0, Number(diagnostics?.walSize) || 0)
    },
    migration: migration
      ? {
          from: Math.max(0, Number(migration.from) || 0),
          to: Math.max(0, Number(migration.to) || 0),
          completedAt: String(migration.completedAt ?? ""),
          backupRecorded: Boolean(migration.backupPath)
        }
      : null,
    backups: {
      total: Math.max(0, Number(backups?.total) || 0),
      valid: Math.max(0, Number(backups?.valid) || 0),
      damaged: Math.max(0, Number(backups?.damaged) || 0)
    },
    assets: {
      metadataCount: Math.max(0, Number(assets?.metadataCount) || 0),
      localFileCount: Math.max(0, Number(assets?.localFileCount) || 0),
      missingFileCount: Math.max(0, Number(assets?.missingFileCount) || 0)
    },
    eventSummary: countByLevel(safeEvents),
    events: safeEvents,
    privacy: {
      includesProjectContent: false,
      includesSecretFields: false,
      includesLocalPaths: false,
      includesModelCredentials: false
    }
  };
}

function writeDiagnosticBundle(filePath, bundle) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(bundle, null, 2), "utf8");
  return { filePath, bytes: fs.statSync(filePath).size };
}

module.exports = {
  MAX_EVENTS,
  ReleaseLogger,
  buildDiagnosticBundle,
  safeErrorMetadata,
  sanitizeLogEntry,
  writeDiagnosticBundle
};
