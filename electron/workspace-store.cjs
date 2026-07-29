const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const STORAGE_FORMAT = "object-rows-v1";
const OBJECT_VERSION_RETENTION = 24;
const WORKSPACE_SNAPSHOT_RETENTION = 16;
const MAINTENANCE_OBJECT_VERSION_RETENTION = 16;
const MAINTENANCE_SNAPSHOT_RETENTION = 8;
const WORKSPACE_COLLECTIONS = [
  "worlds",
  "entityTemplates",
  "codexCategories",
  "entities",
  "maps",
  "mapLayers",
  "mapMarkerGroups",
  "mapMarkers",
  "mapRoutes",
  "timelineTracks",
  "timelineEvents",
  "quests",
  "storyVariables",
  "storyScenes",
  "storyTestPresets",
  "storyTestRuns",
  "storyReviewIssues",
  "narrativeMilestones",
  "manuscriptBooks",
  "manuscriptVolumes",
  "manuscriptChapters",
  "manuscriptScenes",
  "manuscriptClues",
  "manuscriptKnowledgeStates",
  "consistencyFindings",
  "consistencyScans",
  "consistencySettings",
  "consistencyModelSettings",
  "aiMemoryItems",
  "aiWritingSessions",
  "aiOperationRuns",
  "relations",
  "assets",
  "members"
];

const COLLECTION_LABELS = {
  worlds: "世界",
  entityTemplates: "设定模板",
  codexCategories: "知识库分类",
  entities: "条目",
  maps: "地图",
  mapLayers: "地图图层",
  mapMarkerGroups: "地图标记组",
  mapMarkers: "地图标记",
  mapRoutes: "地图路线",
  timelineTracks: "时间轨道",
  timelineEvents: "时间点",
  quests: "任务",
  storyVariables: "剧情变量",
  storyScenes: "剧情场景",
  storyTestPresets: "测试预设",
  storyTestRuns: "测试记录",
  storyReviewIssues: "审阅问题",
  narrativeMilestones: "叙事里程碑",
  manuscriptBooks: "书稿",
  manuscriptVolumes: "文稿卷",
  manuscriptChapters: "文稿章节",
  manuscriptScenes: "文稿场景",
  manuscriptClues: "伏笔线索",
  manuscriptKnowledgeStates: "人物知识状态",
  consistencyFindings: "一致性发现",
  consistencyScans: "一致性扫描",
  consistencySettings: "一致性设置",
  consistencyModelSettings: "AI 模型设置",
  aiMemoryItems: "AI 长期记忆",
  aiWritingSessions: "AI 写作会话",
  aiOperationRuns: "AI 项目操作",
  relations: "关系",
  assets: "资源",
  members: "成员"
};

const SEARCH_PREFIXES = {
  entities: "entity",
  codexCategories: "category",
  entityTemplates: "template",
  maps: "map",
  mapLayers: "map-layer",
  mapMarkerGroups: "marker-group",
  mapMarkers: "marker",
  mapRoutes: "route",
  timelineTracks: "track",
  timelineEvents: "timeline",
  quests: "quest",
  storyVariables: "variable",
  storyScenes: "scene",
  storyTestPresets: "test",
  storyReviewIssues: "issue",
  narrativeMilestones: "milestone",
  manuscriptBooks: "manuscript-book",
  manuscriptVolumes: "manuscript-volume",
  manuscriptChapters: "manuscript-chapter",
  manuscriptScenes: "manuscript-scene",
  manuscriptClues: "manuscript-clue",
  manuscriptKnowledgeStates: "manuscript-knowledge",
  consistencyFindings: "consistency",
  consistencyScans: "consistency-scan",
  consistencySettings: "consistency-settings",
  consistencyModelSettings: "consistency-model",
  aiMemoryItems: "ai-memory",
  aiWritingSessions: "ai-writing",
  aiOperationRuns: "ai-operation",
  relations: "relation",
  assets: "asset",
  worlds: "world",
  storyTestRuns: "test-run",
  members: "member"
};

function timestampForFile(value) {
  return value.replace(/[:.]/g, "-");
}

function hashData(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeString(value) {
  return String(value ?? "").normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
}

function collectText(value, output, depth = 0) {
  if (output.length >= 500 || depth > 8 || value == null) return;
  if (["string", "number", "boolean"].includes(typeof value)) {
    const text = String(value);
    if (!text.startsWith("data:") && text.length <= 12000) output.push(text);
    return;
  }
  if (Array.isArray(value)) {
    value.slice(0, 500).forEach((item) => collectText(item, output, depth + 1));
    return;
  }
  if (typeof value === "object") {
    Object.entries(value)
      .filter(([key]) => !["imageUrl", "dataUrl"].includes(key))
      .slice(0, 500)
      .forEach(([, item]) => collectText(item, output, depth + 1));
  }
}

function cjkNgrams(value) {
  const grams = new Set();
  const sequences = normalizeString(value).match(/[\u3400-\u9fff]+/g) ?? [];
  for (const sequence of sequences) {
    const capped = sequence.slice(0, 2000);
    for (let size = 2; size <= 4; size += 1) {
      for (let index = 0; index + size <= capped.length; index += 1) {
        grams.add(capped.slice(index, index + size));
        if (grams.size >= 12000) return Array.from(grams).join(" ");
      }
    }
  }
  return Array.from(grams).join(" ");
}

function itemLabel(collection, item) {
  if (!item || typeof item !== "object") return "未命名对象";
  if (collection === "consistencyScans") {
    return `一致性扫描 ${item.completedAt || item.id || ""}`.trim();
  }
  if (collection === "consistencySettings") return "一致性规则设置";
  if (collection === "consistencyModelSettings") return "AI 模型设置";
  if (collection === "aiMemoryItems") return item.title || "AI 记忆";
  if (collection === "aiWritingSessions") return item.title || "AI 写作会话";
  if (collection === "aiOperationRuns") return item.summary || item.instruction || "AI 项目操作";
  if (collection === "relations") return item.label || item.kind || "未命名关系";
  return (
    item.title ||
    item.name ||
    item.label ||
    item.key ||
    item.email ||
    item.ruleId ||
    item.originalName ||
    item.id ||
    "未命名对象"
  );
}

function searchDocument(collection, item) {
  const values = [];
  collectText(item, values);
  const raw = values.join(" ").slice(0, 80000);
  return {
    title: normalizeString(itemLabel(collection, item)),
    body: `${normalizeString(raw)} ${cjkNgrams(raw)}`.trim()
  };
}

function deriveWorldId(collection, item, worldMaps) {
  if (collection === "worlds") return String(item.id ?? "");
  if (item.worldId) return String(item.worldId);
  if (collection === "mapMarkers") return worldMaps.maps.get(item.mapId) ?? "";
  return "";
}

function workspaceRows(data) {
  const maps = new Map(
    (Array.isArray(data.maps) ? data.maps : []).map((item) => [item.id, item.worldId])
  );
  const rows = [];
  for (const collection of WORKSPACE_COLLECTIONS) {
    const items = Array.isArray(data[collection]) ? data[collection] : [];
    const occurrences = new Map();
    items.forEach((item, position) => {
      const itemId = String(item?.id ?? `missing-${position}`);
      const occurrence = occurrences.get(itemId) ?? 0;
      occurrences.set(itemId, occurrence + 1);
      const rowKey = occurrence ? `${itemId}#duplicate:${occurrence}` : itemId;
      const serialized = JSON.stringify(item);
      rows.push({
        collection,
        rowKey,
        itemId,
        worldId: deriveWorldId(collection, item, { maps }),
        position,
        serialized,
        hash: hashData(serialized),
        item
      });
    });
  }
  return rows;
}

function legacyManuscriptPlainText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|h[1-6]|li|blockquote|div|section)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function isLegacyManuscriptChapter(item) {
  const title = String(item?.title ?? "").trim();
  return Boolean(
    legacyManuscriptPlainText(item?.manuscriptBody) ||
      /^第.+章(?:\s|$)/.test(title) ||
      /^(序章|楔子|前言|引子|后记)$/.test(title)
  );
}

function legacyManuscriptStatus(value) {
  if (value === "done") return "final";
  if (value === "review") return "revision";
  if (value === "drafting" || value === "blocked") return "drafting";
  return "outline";
}

function migrateLegacyManuscriptData(data, now = new Date().toISOString()) {
  const output = {
    ...data,
    manuscriptBooks: Array.isArray(data?.manuscriptBooks) ? [...data.manuscriptBooks] : [],
    manuscriptVolumes: Array.isArray(data?.manuscriptVolumes) ? [...data.manuscriptVolumes] : [],
    manuscriptChapters: Array.isArray(data?.manuscriptChapters) ? [...data.manuscriptChapters] : [],
    manuscriptScenes: Array.isArray(data?.manuscriptScenes) ? [...data.manuscriptScenes] : [],
    manuscriptClues: Array.isArray(data?.manuscriptClues) ? [...data.manuscriptClues] : [],
    manuscriptKnowledgeStates: Array.isArray(data?.manuscriptKnowledgeStates)
      ? [...data.manuscriptKnowledgeStates]
      : []
  };
  const worlds = Array.isArray(data?.worlds) ? data.worlds : [];
  const milestones = Array.isArray(data?.narrativeMilestones) ? data.narrativeMilestones : [];
  const migratedMilestoneIds = new Set(
    output.manuscriptChapters
      .map((chapter) => String(chapter?.linkedNarrativeMilestoneId ?? ""))
      .filter(Boolean)
  );

  worlds.forEach((world, worldIndex) => {
    const worldId = String(world?.id ?? "");
    if (!worldId) return;
    const candidates = milestones
      .filter(
        (milestone) =>
          String(milestone?.worldId ?? "") === worldId && isLegacyManuscriptChapter(milestone)
      )
      .sort((left, right) => (Number(left?.order) || 0) - (Number(right?.order) || 0));
    if (!candidates.length) return;

    let book = output.manuscriptBooks.find((item) => item?.worldId === worldId);
    if (!book) {
      book = {
        id: `manuscript-book:${worldId}`,
        worldId,
        title: "主书稿",
        subtitle: "",
        summary: "",
        status: "drafting",
        order: worldIndex,
        targetWordCount: 100000,
        createdAt: candidates[0]?.createdAt || now,
        updatedAt: candidates.at(-1)?.updatedAt || now
      };
      output.manuscriptBooks.push(book);
    }

    const volumeByTitle = new Map(
      output.manuscriptVolumes
        .filter((volume) => volume?.bookId === book.id)
        .map((volume) => [String(volume.title ?? "").trim().toLocaleLowerCase("zh-CN"), volume])
    );
    candidates.forEach((milestone) => {
      const milestoneId = String(milestone?.id ?? "");
      if (!milestoneId || migratedMilestoneIds.has(milestoneId)) return;
      const volumeTitle = String(milestone?.act ?? "").trim() || "未分卷";
      const volumeKey = volumeTitle.toLocaleLowerCase("zh-CN");
      let volume = volumeByTitle.get(volumeKey);
      if (!volume) {
        volume = {
          id: `manuscript-volume:${book.id}:${encodeURIComponent(volumeTitle)}`,
          worldId,
          bookId: book.id,
          title: volumeTitle,
          summary: "",
          status: legacyManuscriptStatus(milestone?.status),
          order: volumeByTitle.size,
          targetWordCount: 0,
          createdAt: milestone?.createdAt || now,
          updatedAt: milestone?.updatedAt || now
        };
        volumeByTitle.set(volumeKey, volume);
        output.manuscriptVolumes.push(volume);
      }
      const chapterOrder = output.manuscriptChapters.filter(
        (chapter) => chapter?.volumeId === volume.id
      ).length;
      output.manuscriptChapters.push({
        id: `manuscript-chapter:${milestoneId}`,
        worldId,
        bookId: book.id,
        volumeId: volume.id,
        title: String(milestone?.title ?? "") || `章节 ${chapterOrder + 1}`,
        summary: String(milestone?.summary ?? ""),
        body: String(milestone?.manuscriptBody ?? ""),
        notes: String(milestone?.developerNotes ?? ""),
        status: legacyManuscriptStatus(milestone?.status),
        order: chapterOrder,
        targetWordCount: 0,
        viewpointEntityId: "",
        timelineStart: "",
        timelineEnd: "",
        linkedNarrativeMilestoneId: milestoneId,
        linkedStorySceneIds: Array.isArray(milestone?.linkedSceneIds)
          ? [...new Set(milestone.linkedSceneIds.map(String).filter(Boolean))]
          : [],
        references: [],
        createdAt: milestone?.createdAt || now,
        updatedAt: milestone?.updatedAt || milestone?.createdAt || now
      });
      migratedMilestoneIds.add(milestoneId);
    });
  });
  return output;
}

class WorkspaceStore {
  constructor({ dbPath, backupDir, schemaVersion = 17, now = () => new Date().toISOString() }) {
    this.dbPath = dbPath;
    this.backupDir = backupDir;
    this.schemaVersion = schemaVersion;
    this.now = now;
    this.db = null;
    this.ftsAvailable = false;
    this.lastMigrationBackup = "";
    this.statements = null;
  }

  open() {
    if (this.db) return this.db;
    fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("busy_timeout = 10000");
    this.db.pragma("foreign_keys = ON");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS workspace_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reason TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    const previousVersion = Number(this.getMeta("schema_version") || 0);
    if (previousVersion > this.schemaVersion) {
      this.close();
      throw new Error(
        `Database schema ${previousVersion} is newer than supported schema ${this.schemaVersion}.`
      );
    }
    if (previousVersion > 0 && previousVersion < this.schemaVersion) {
      this.lastMigrationBackup = this.createMigrationBackup(previousVersion);
    }

    this.createObjectSchema();
    this.createSearchSchema();

    const migrate = this.db.transaction(() => {
      if (previousVersion < this.schemaVersion) this.migrateLegacyWorkspace();
      if (this.schemaVersion >= 17 && previousVersion < 17) {
        this.migrateManuscriptWorkspace(previousVersion);
      }
      const now = this.now();
      this.setMeta("schema_version", String(this.schemaVersion), now);
      if (previousVersion > 0 && previousVersion < this.schemaVersion) {
        this.setMeta(
          "last_migration",
          JSON.stringify({
            from: previousVersion,
            to: this.schemaVersion,
            completedAt: now,
            backupPath: this.lastMigrationBackup
          }),
          now
        );
      }
    });
    migrate();
    return this.db;
  }

  close() {
    if (!this.db) return;
    try {
      this.db.pragma("wal_checkpoint(TRUNCATE)");
    } catch {
      // Closing still releases the database if a checkpoint cannot complete.
    }
    this.db.close();
    this.db = null;
    this.statements = null;
  }

  getMeta(key) {
    const row = this.db.prepare("SELECT value FROM app_meta WHERE key = ?").get(key);
    return row?.value ?? "";
  }

  setMeta(key, value, updatedAt = this.now()) {
    this.db
      .prepare(
        "INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
      )
      .run(key, String(value), updatedAt);
  }

  createMigrationBackup(fromVersion) {
    const directory = path.join(this.backupDir, "migrations");
    fs.mkdirSync(directory, { recursive: true });
    const filePath = path.join(
      directory,
      `worldcraft-codex-schema-${fromVersion}-before-${this.schemaVersion}-${timestampForFile(this.now())}.sqlite`
    );
    const escaped = filePath.replace(/'/g, "''");
    this.db.exec(`VACUUM INTO '${escaped}'`);
    return filePath;
  }

  restoreMigrationBackup(fileName) {
    this.open();
    const safeName = path.basename(String(fileName ?? ""));
    const directory = path.resolve(this.backupDir, "migrations");
    const source = path.resolve(directory, safeName);
    if (
      !safeName ||
      safeName !== fileName ||
      !safeName.endsWith(".sqlite") ||
      !source.startsWith(`${directory}${path.sep}`) ||
      !fs.existsSync(source)
    ) {
      throw new Error("Migration backup was not found.");
    }

    const candidate = new Database(source, { readonly: true, fileMustExist: true });
    const candidateCheck = candidate.pragma("quick_check", { simple: true });
    candidate.close();
    if (candidateCheck !== "ok") throw new Error("Migration backup is damaged.");

    const safetyDirectory = path.join(this.backupDir, "rollbacks");
    fs.mkdirSync(safetyDirectory, { recursive: true });
    const safetyPath = path.join(
      safetyDirectory,
      `worldcraft-codex-before-rollback-${timestampForFile(this.now())}.sqlite`
    );
    this.db.exec(`VACUUM INTO '${safetyPath.replace(/'/g, "''")}'`);
    this.close();

    try {
      fs.copyFileSync(source, this.dbPath);
      fs.rmSync(`${this.dbPath}-wal`, { force: true });
      fs.rmSync(`${this.dbPath}-shm`, { force: true });
      this.open();
      const loaded = this.load();
      return {
        ok: true,
        ...loaded,
        restoredFrom: source,
        safetyBackup: safetyPath
      };
    } catch (error) {
      this.close();
      fs.copyFileSync(safetyPath, this.dbPath);
      fs.rmSync(`${this.dbPath}-wal`, { force: true });
      fs.rmSync(`${this.dbPath}-shm`, { force: true });
      this.open();
      throw error;
    }
  }

  createObjectSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workspace_items (
        collection TEXT NOT NULL,
        row_key TEXT NOT NULL,
        item_id TEXT NOT NULL,
        world_id TEXT NOT NULL DEFAULT '',
        position INTEGER NOT NULL DEFAULT 0,
        data TEXT NOT NULL,
        data_hash TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (collection, row_key)
      );
      CREATE INDEX IF NOT EXISTS workspace_items_world
        ON workspace_items (world_id, collection, position);
      CREATE INDEX IF NOT EXISTS workspace_items_item
        ON workspace_items (collection, item_id);
      CREATE TABLE IF NOT EXISTS object_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection TEXT NOT NULL,
        row_key TEXT NOT NULL,
        item_id TEXT NOT NULL,
        world_id TEXT NOT NULL DEFAULT '',
        reason TEXT NOT NULL,
        data TEXT NOT NULL,
        data_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS object_versions_item
        ON object_versions (collection, item_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS object_versions_row
        ON object_versions (collection, row_key, id DESC);
      CREATE INDEX IF NOT EXISTS object_versions_world
        ON object_versions (world_id, created_at DESC);
    `);
  }

  getStatements() {
    if (this.statements) return this.statements;
    this.statements = {
      insertVersion: this.db.prepare(`
        INSERT INTO object_versions
          (collection, row_key, item_id, world_id, reason, data, data_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `),
      trimVersions: this.db.prepare(`
        DELETE FROM object_versions WHERE id IN (
          SELECT id FROM (
            SELECT
              id,
              ROW_NUMBER() OVER (
                PARTITION BY collection, row_key
                ORDER BY id DESC
              ) AS version_rank
            FROM object_versions
          ) WHERE version_rank > ${OBJECT_VERSION_RETENTION}
        )
      `),
      findSearchRow: this.ftsAvailable
        ? this.db.prepare(
            "SELECT search_rowid FROM workspace_search_rows WHERE collection = ? AND row_key = ?"
          )
        : null,
      deleteSearchByRowId: this.ftsAvailable
        ? this.db.prepare("DELETE FROM workspace_search WHERE rowid = ?")
        : null,
      deleteSearchRowMap: this.ftsAvailable
        ? this.db.prepare("DELETE FROM workspace_search_rows WHERE collection = ? AND row_key = ?")
        : null,
      insertSearch: this.ftsAvailable
        ? this.db.prepare(
            "INSERT INTO workspace_search (collection, row_key, item_id, world_id, title, body) VALUES (?, ?, ?, ?, ?, ?)"
          )
        : null,
      insertSearchAtRowId: this.ftsAvailable
        ? this.db.prepare(
            "INSERT INTO workspace_search (rowid, collection, row_key, item_id, world_id, title, body) VALUES (?, ?, ?, ?, ?, ?, ?)"
          )
        : null,
      upsertSearchRowMap: this.ftsAvailable
        ? this.db.prepare(`
            INSERT INTO workspace_search_rows (collection, row_key, search_rowid)
            VALUES (?, ?, ?)
            ON CONFLICT(collection, row_key) DO UPDATE SET search_rowid = excluded.search_rowid
          `)
        : null
    };
    return this.statements;
  }

  createSearchSchema() {
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS workspace_search_rows (
          collection TEXT NOT NULL,
          row_key TEXT NOT NULL,
          search_rowid INTEGER NOT NULL UNIQUE,
          PRIMARY KEY (collection, row_key)
        ) WITHOUT ROWID;
        CREATE VIRTUAL TABLE IF NOT EXISTS workspace_search USING fts5(
          collection UNINDEXED,
          row_key UNINDEXED,
          item_id UNINDEXED,
          world_id UNINDEXED,
          title,
          body,
          tokenize = 'unicode61 remove_diacritics 2'
        );
      `);
      this.ftsAvailable = true;
      const searchCount = this.db.prepare("SELECT COUNT(*) count FROM workspace_search").get().count;
      const mapCount = this.db.prepare("SELECT COUNT(*) count FROM workspace_search_rows").get().count;
      if (searchCount !== mapCount) {
        const rebuildMap = this.db.transaction(() => {
          this.db.prepare("DELETE FROM workspace_search_rows").run();
          this.db
            .prepare(`
              INSERT OR REPLACE INTO workspace_search_rows (collection, row_key, search_rowid)
              SELECT collection, row_key, rowid FROM workspace_search ORDER BY rowid
            `)
            .run();
        });
        rebuildMap();
      }
      this.setMeta("fts_available", "true");
    } catch {
      this.ftsAvailable = false;
      this.setMeta("fts_available", "false");
    }
  }

  migrateLegacyWorkspace() {
    if (this.getMeta("storage_format") === STORAGE_FORMAT) return;
    const row = this.db
      .prepare("SELECT value, updated_at FROM app_meta WHERE key = 'workspace_data'")
      .get();
    const data = row ? safeJsonParse(row.value) : null;
    if (data && typeof data === "object") {
      this.replaceAllItems(data, "schema-migration", row.updated_at || this.now(), true);
      this.setMeta("storage_format", STORAGE_FORMAT);
      this.setMeta("workspace_updated_at", row.updated_at || this.now());
    }
  }

  migrateManuscriptWorkspace(previousVersion) {
    if (this.getMeta("storage_format") !== STORAGE_FORMAT) return;
    const data = Object.fromEntries(WORKSPACE_COLLECTIONS.map((collection) => [collection, []]));
    const storedRows = this.db
      .prepare("SELECT collection, row_key, data FROM workspace_items ORDER BY collection, position, row_key")
      .all();
    const existingKeys = new Set();
    storedRows.forEach((row) => {
      existingKeys.add(`${row.collection}\u0000${row.row_key}`);
      if (!WORKSPACE_COLLECTIONS.includes(row.collection)) return;
      const item = safeJsonParse(row.data);
      if (item) data[row.collection].push(item);
    });
    const migrated = migrateLegacyManuscriptData(data, this.now());
    const additions = workspaceRows(migrated).filter(
      (row) => !existingKeys.has(`${row.collection}\u0000${row.rowKey}`)
    );
    if (!additions.length) return;

    const insert = this.db.prepare(`
      INSERT INTO workspace_items
        (collection, row_key, item_id, world_id, position, data, data_hash, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const migratedAt = this.now();
    additions.forEach((row) => {
      insert.run(
        row.collection,
        row.rowKey,
        row.itemId,
        row.worldId,
        row.position,
        row.serialized,
        row.hash,
        migratedAt
      );
      this.insertVersion(row, "schema-17-manuscript-migration", migratedAt);
      this.indexRow(row, false);
    });
    this.getStatements().trimVersions.run();
    this.setMeta(
      "manuscript_migration",
      JSON.stringify({
        from: previousVersion,
        added: additions.length,
        completedAt: migratedAt
      }),
      migratedAt
    );
  }

  replaceAllItems(data, reason, timestamp, captureVersions) {
    this.db.prepare("DELETE FROM workspace_items").run();
    if (this.ftsAvailable) {
      this.db.prepare("DELETE FROM workspace_search").run();
      this.db.prepare("DELETE FROM workspace_search_rows").run();
    }
    const insert = this.db.prepare(`
      INSERT INTO workspace_items
        (collection, row_key, item_id, world_id, position, data, data_hash, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of workspaceRows(data)) {
      insert.run(
        row.collection,
        row.rowKey,
        row.itemId,
        row.worldId,
        row.position,
        row.serialized,
        row.hash,
        timestamp
      );
      if (captureVersions) this.insertVersion(row, reason, timestamp);
      this.indexRow(row, false);
    }
    if (captureVersions) this.getStatements().trimVersions.run();
  }

  insertVersion(row, reason, timestamp) {
    const statements = this.getStatements();
    statements.insertVersion.run(
        row.collection,
        row.rowKey,
        row.itemId,
        row.worldId,
        reason,
        row.serialized,
        row.hash,
        timestamp
      );
    return true;
  }

  indexRow(row, removeExisting = true) {
    if (!this.ftsAvailable) return;
    const statements = this.getStatements();
    const mapping = removeExisting
      ? statements.findSearchRow.get(row.collection, row.rowKey)
      : null;
    if (mapping) statements.deleteSearchByRowId.run(mapping.search_rowid);
    const document = searchDocument(row.collection, row.item);
    if (mapping) {
      statements.insertSearchAtRowId.run(
        mapping.search_rowid,
        row.collection,
        row.rowKey,
        row.itemId,
        row.worldId,
        document.title,
        document.body
      );
      return;
    }
    const inserted = statements.insertSearch.run(
      row.collection,
      row.rowKey,
      row.itemId,
      row.worldId,
      document.title,
      document.body
    );
    statements.upsertSearchRowMap.run(
      row.collection,
      row.rowKey,
      Number(inserted.lastInsertRowid)
    );
  }

  deleteSearchRow(collection, rowKey) {
    if (!this.ftsAvailable) return;
    const statements = this.getStatements();
    const mapping = statements.findSearchRow.get(collection, rowKey);
    if (!mapping) return;
    statements.deleteSearchByRowId.run(mapping.search_rowid);
    statements.deleteSearchRowMap.run(collection, rowKey);
  }

  load() {
    this.open();
    const format = this.getMeta("storage_format");
    if (format !== STORAGE_FORMAT) {
      const row = this.db
        .prepare("SELECT value, updated_at FROM app_meta WHERE key = 'workspace_data'")
        .get();
      return {
        data: row ? safeJsonParse(row.value) : null,
        updatedAt: row?.updated_at ?? null,
        warnings: []
      };
    }

    const data = Object.fromEntries(WORKSPACE_COLLECTIONS.map((key) => [key, []]));
    const warnings = [];
    const rows = this.db
      .prepare(
        "SELECT collection, row_key, data FROM workspace_items ORDER BY collection, position, row_key"
      )
      .all();
    for (const row of rows) {
      if (!WORKSPACE_COLLECTIONS.includes(row.collection)) continue;
      const item = safeJsonParse(row.data);
      if (!item) {
        warnings.push(`无法读取 ${row.collection}/${row.row_key}`);
        continue;
      }
      data[row.collection].push(item);
    }
    return {
      data,
      updatedAt: this.getMeta("workspace_updated_at") || null,
      warnings
    };
  }

  save(data, reason = "autosave") {
    if (!data || typeof data !== "object") throw new Error("Workspace data is invalid.");
    this.open();
    const timestamp = this.now();
    const incomingRows = workspaceRows(data);
    const incomingKeys = new Set(incomingRows.map((row) => `${row.collection}\u0000${row.rowKey}`));
    const existingRows = this.db
      .prepare(
        "SELECT collection, row_key, item_id, world_id, position, data, data_hash FROM workspace_items"
      )
      .all();
    const existingByKey = new Map(
      existingRows.map((row) => [`${row.collection}\u0000${row.row_key}`, row])
    );
    const stats = {
      inserted: 0,
      updated: 0,
      deleted: 0,
      unchanged: 0,
      reordered: 0,
      versionsAdded: 0,
      bytesWritten: 0
    };

    const commit = this.db.transaction(() => {
      const upsert = this.db.prepare(`
        INSERT INTO workspace_items
          (collection, row_key, item_id, world_id, position, data, data_hash, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(collection, row_key) DO UPDATE SET
          item_id = excluded.item_id,
          world_id = excluded.world_id,
          position = excluded.position,
          data = excluded.data,
          data_hash = excluded.data_hash,
          updated_at = excluded.updated_at
      `);
      const reorder = this.db.prepare(
        "UPDATE workspace_items SET position = ?, world_id = ?, updated_at = ? WHERE collection = ? AND row_key = ?"
      );
      for (const row of incomingRows) {
        const existing = existingByKey.get(`${row.collection}\u0000${row.rowKey}`);
        if (existing?.data_hash === row.hash) {
          if (existing.position !== row.position || existing.world_id !== row.worldId) {
            reorder.run(row.position, row.worldId, timestamp, row.collection, row.rowKey);
            stats.reordered += 1;
          } else {
            stats.unchanged += 1;
          }
          continue;
        }
        upsert.run(
          row.collection,
          row.rowKey,
          row.itemId,
          row.worldId,
          row.position,
          row.serialized,
          row.hash,
          timestamp
        );
        stats[existing ? "updated" : "inserted"] += 1;
        stats.bytesWritten += Buffer.byteLength(row.serialized);
        if (this.insertVersion(row, reason, timestamp)) stats.versionsAdded += 1;
        this.indexRow(row, Boolean(existing));
      }

      const deleteItem = this.db.prepare(
        "DELETE FROM workspace_items WHERE collection = ? AND row_key = ?"
      );
      for (const existing of existingRows) {
        const key = `${existing.collection}\u0000${existing.row_key}`;
        if (incomingKeys.has(key)) continue;
        const item = safeJsonParse(existing.data, {});
        if (
          this.insertVersion(
            {
              collection: existing.collection,
              rowKey: existing.row_key,
              itemId: existing.item_id,
              worldId: existing.world_id,
              serialized: existing.data,
              hash: existing.data_hash,
              item
            },
            `deleted:${reason}`,
            timestamp
          )
        ) {
          stats.versionsAdded += 1;
        }
        deleteItem.run(existing.collection, existing.row_key);
        this.deleteSearchRow(existing.collection, existing.row_key);
        stats.deleted += 1;
      }

      if (stats.versionsAdded) this.getStatements().trimVersions.run();

      this.setMeta("storage_format", STORAGE_FORMAT, timestamp);
      this.setMeta("workspace_updated_at", timestamp, timestamp);
      if (reason !== "autosave" && reason !== "initial-seed") {
        const serialized = JSON.stringify(data);
        this.db
          .prepare("INSERT INTO workspace_snapshots (reason, data, created_at) VALUES (?, ?, ?)")
          .run(reason, serialized, timestamp);
        this.db
          .prepare(
            `DELETE FROM workspace_snapshots WHERE id NOT IN (SELECT id FROM workspace_snapshots ORDER BY id DESC LIMIT ${WORKSPACE_SNAPSHOT_RETENTION})`
          )
          .run();
      }
    });
    commit();
    return { ...stats, updatedAt: timestamp };
  }

  listObjectVersions(collection, itemId, limit = 24) {
    this.open();
    if (!WORKSPACE_COLLECTIONS.includes(collection) || !itemId) return [];
    return this.db
      .prepare(`
        SELECT id, collection, row_key, item_id, world_id, reason, data, created_at
        FROM object_versions
        WHERE collection = ? AND item_id = ?
        ORDER BY id DESC LIMIT ?
      `)
      .all(collection, itemId, Math.max(1, Math.min(100, Number(limit) || 24)))
      .map((row) => ({
        id: row.id,
        collection: row.collection,
        rowKey: row.row_key,
        itemId: row.item_id,
        worldId: row.world_id,
        reason: row.reason,
        createdAt: row.created_at,
        label: itemLabel(row.collection, safeJsonParse(row.data, {})),
        item: safeJsonParse(row.data, {})
      }));
  }

  listRecentVersions(worldId = "", limit = 80) {
    this.open();
    const bounded = Math.max(1, Math.min(200, Number(limit) || 80));
    const rows = worldId
      ? this.db
          .prepare(`
            SELECT id, collection, row_key, item_id, world_id, reason, data, created_at
            FROM object_versions WHERE world_id = ?
            ORDER BY id DESC LIMIT ?
          `)
          .all(worldId, bounded)
      : this.db
          .prepare(`
            SELECT id, collection, row_key, item_id, world_id, reason, data, created_at
            FROM object_versions ORDER BY id DESC LIMIT ?
          `)
          .all(bounded);
    return rows.map((row) => ({
      id: row.id,
      collection: row.collection,
      collectionLabel: COLLECTION_LABELS[row.collection] ?? row.collection,
      rowKey: row.row_key,
      itemId: row.item_id,
      worldId: row.world_id,
      reason: row.reason,
      createdAt: row.created_at,
      label: itemLabel(row.collection, safeJsonParse(row.data, {})),
      item: safeJsonParse(row.data, {})
    }));
  }

  rebuildSearchIndex() {
    this.open();
    if (!this.ftsAvailable) return { ok: false, indexed: 0, error: "FTS5 is unavailable." };
    const rebuild = this.db.transaction(() => {
      this.db.prepare("DELETE FROM workspace_search").run();
      this.db.prepare("DELETE FROM workspace_search_rows").run();
      const rows = this.db
        .prepare(
          "SELECT collection, row_key, item_id, world_id, position, data, data_hash FROM workspace_items"
        )
        .all();
      let indexed = 0;
      for (const row of rows) {
        const item = safeJsonParse(row.data);
        if (!item) continue;
        this.indexRow({
          collection: row.collection,
          rowKey: row.row_key,
          itemId: row.item_id,
          worldId: row.world_id,
          item
        }, false);
        indexed += 1;
      }
      return indexed;
    });
    return { ok: true, indexed: rebuild() };
  }

  maintainStorage({
    versionLimit = MAINTENANCE_OBJECT_VERSION_RETENTION,
    snapshotLimit = MAINTENANCE_SNAPSHOT_RETENTION
  } = {}) {
    this.open();
    const boundedVersionLimit = Math.max(4, Math.min(64, Math.floor(Number(versionLimit) || MAINTENANCE_OBJECT_VERSION_RETENTION)));
    const boundedSnapshotLimit = Math.max(2, Math.min(32, Math.floor(Number(snapshotLimit) || MAINTENANCE_SNAPSHOT_RETENTION)));
    const before = {
      dbSize: fs.existsSync(this.dbPath) ? fs.statSync(this.dbPath).size : 0,
      versionCount: this.db.prepare("SELECT COUNT(*) count FROM object_versions").get().count,
      snapshotCount: this.db.prepare("SELECT COUNT(*) count FROM workspace_snapshots").get().count
    };
    const prune = this.db.transaction(() => {
      const versions = this.db.prepare(`
        DELETE FROM object_versions WHERE id IN (
          SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (
              PARTITION BY collection, row_key ORDER BY id DESC
            ) AS version_rank
            FROM object_versions
          ) WHERE version_rank > ?
        )
      `).run(boundedVersionLimit);
      const snapshots = this.db.prepare(`
        DELETE FROM workspace_snapshots WHERE id NOT IN (
          SELECT id FROM workspace_snapshots ORDER BY id DESC LIMIT ?
        )
      `).run(boundedSnapshotLimit);
      return {
        versionsRemoved: versions.changes,
        snapshotsRemoved: snapshots.changes
      };
    });
    const removed = prune();
    this.db.pragma("wal_checkpoint(TRUNCATE)");
    this.db.exec("VACUUM");
    this.db.pragma("optimize");
    const after = {
      dbSize: fs.existsSync(this.dbPath) ? fs.statSync(this.dbPath).size : 0,
      versionCount: this.db.prepare("SELECT COUNT(*) count FROM object_versions").get().count,
      snapshotCount: this.db.prepare("SELECT COUNT(*) count FROM workspace_snapshots").get().count
    };
    return {
      ...removed,
      versionLimit: boundedVersionLimit,
      snapshotLimit: boundedSnapshotLimit,
      before,
      after,
      reclaimedBytes: Math.max(0, before.dbSize - after.dbSize)
    };
  }

  search(query, worldId = "", limit = 60) {
    this.open();
    const normalized = normalizeString(query);
    const bounded = Math.max(1, Math.min(200, Number(limit) || 60));
    if (!normalized) return [];
    let rows = [];
    if (this.ftsAvailable) {
      const tokens = normalized.split(/\s+/).filter(Boolean).slice(0, 12);
      const expression = tokens
        .map((token) => `"${token.replace(/"/g, '""')}"*`)
        .join(" AND ");
      try {
        rows = worldId
          ? this.db
              .prepare(`
                SELECT collection, row_key, item_id, world_id, title,
                  bm25(workspace_search) AS score
                FROM workspace_search
                WHERE workspace_search MATCH ? AND world_id = ?
                ORDER BY score LIMIT ?
              `)
              .all(expression, worldId, bounded)
          : this.db
              .prepare(`
                SELECT collection, row_key, item_id, world_id, title,
                  bm25(workspace_search) AS score
                FROM workspace_search
                WHERE workspace_search MATCH ?
                ORDER BY score LIMIT ?
              `)
              .all(expression, bounded);
      } catch {
        rows = [];
      }
    }
    if (!rows.length) {
      const like = `%${normalized}%`;
      rows = worldId
        ? this.db
            .prepare(`
              SELECT collection, row_key, item_id, world_id, '' AS title, 0 AS score
              FROM workspace_items
              WHERE world_id = ? AND lower(data) LIKE ?
              ORDER BY updated_at DESC LIMIT ?
            `)
            .all(worldId, like, bounded)
        : this.db
            .prepare(`
              SELECT collection, row_key, item_id, world_id, '' AS title, 0 AS score
              FROM workspace_items
              WHERE lower(data) LIKE ?
              ORDER BY updated_at DESC LIMIT ?
            `)
            .all(like, bounded);
    }
    return rows.map((row) => ({
      collection: row.collection,
      rowKey: row.row_key,
      itemId: row.item_id,
      worldId: row.world_id,
      searchKey: `${SEARCH_PREFIXES[row.collection] ?? row.collection}:${row.item_id}`,
      score: Number(row.score) || 0
    }));
  }

  diagnostics() {
    this.open();
    const quickCheck = this.db.pragma("quick_check", { simple: true });
    const foreignKeyIssues = this.db.pragma("foreign_key_check").length;
    const rows = this.db
      .prepare("SELECT collection, row_key, data FROM workspace_items")
      .all();
    const invalidItems = rows
      .filter((row) => safeJsonParse(row.data) == null)
      .map((row) => `${row.collection}/${row.row_key}`);
    const duplicates = this.db
      .prepare(`
        SELECT collection, item_id, COUNT(*) AS count
        FROM workspace_items GROUP BY collection, item_id HAVING COUNT(*) > 1
      `)
      .all();
    const itemCounts = Object.fromEntries(
      this.db
        .prepare("SELECT collection, COUNT(*) AS count FROM workspace_items GROUP BY collection")
        .all()
        .map((row) => [row.collection, row.count])
    );
    const versionUsage = this.db
      .prepare("SELECT COUNT(*) AS count, COALESCE(SUM(length(data)), 0) AS bytes FROM object_versions")
      .get();
    const snapshotUsage = this.db
      .prepare("SELECT COUNT(*) AS count, COALESCE(SUM(length(data)), 0) AS bytes FROM workspace_snapshots")
      .get();
    const reclaimableVersions = this.db.prepare(`
      SELECT COUNT(*) AS count, COALESCE(SUM(length(data)), 0) AS bytes FROM (
        SELECT data, ROW_NUMBER() OVER (
          PARTITION BY collection, row_key ORDER BY id DESC
        ) AS version_rank
        FROM object_versions
      ) WHERE version_rank > ?
    `).get(MAINTENANCE_OBJECT_VERSION_RETENTION);
    const reclaimableSnapshots = this.db.prepare(`
      SELECT COUNT(*) AS count, COALESCE(SUM(length(data)), 0) AS bytes
      FROM workspace_snapshots WHERE id NOT IN (
        SELECT id FROM workspace_snapshots ORDER BY id DESC LIMIT ?
      )
    `).get(MAINTENANCE_SNAPSHOT_RETENTION);
    const versionCount = versionUsage.count;
    const searchCount = this.ftsAvailable
      ? this.db.prepare("SELECT COUNT(*) AS count FROM workspace_search").get().count
      : 0;
    const searchMapCount = this.ftsAvailable
      ? this.db.prepare("SELECT COUNT(*) AS count FROM workspace_search_rows").get().count
      : 0;
    const migrationDirectory = path.join(this.backupDir, "migrations");
    const migrationBackups = fs.existsSync(migrationDirectory)
      ? fs
          .readdirSync(migrationDirectory)
          .filter((file) => file.endsWith(".sqlite"))
          .map((file) => {
            const filePath = path.join(migrationDirectory, file);
            const stat = fs.statSync(filePath);
            return { fileName: file, filePath, size: stat.size, createdAt: stat.mtime.toISOString() };
          })
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      : [];
    return {
      ok:
        quickCheck === "ok" &&
        foreignKeyIssues === 0 &&
        invalidItems.length === 0 &&
        (!this.ftsAvailable || searchMapCount === searchCount),
      schemaVersion: Number(this.getMeta("schema_version") || 0),
      storageFormat: this.getMeta("storage_format"),
      quickCheck,
      foreignKeyIssues,
      invalidItems,
      duplicates,
      itemCounts,
      itemCount: rows.length,
      versionCount,
      versionBytes: versionUsage.bytes,
      snapshotCount: snapshotUsage.count,
      snapshotBytes: snapshotUsage.bytes,
      versionRetention: MAINTENANCE_OBJECT_VERSION_RETENTION,
      snapshotRetention: MAINTENANCE_SNAPSHOT_RETENTION,
      maintenanceReclaimableVersions: reclaimableVersions.count,
      maintenanceReclaimableSnapshots: reclaimableSnapshots.count,
      maintenanceReclaimableBytes: reclaimableVersions.bytes + reclaimableSnapshots.bytes,
      ftsAvailable: this.ftsAvailable,
      searchCount,
      searchMapCount,
      lastMigration: safeJsonParse(this.getMeta("last_migration"), null),
      migrationBackups,
      dbPath: this.dbPath,
      dbSize: fs.existsSync(this.dbPath) ? fs.statSync(this.dbPath).size : 0,
      walSize: fs.existsSync(`${this.dbPath}-wal`) ? fs.statSync(`${this.dbPath}-wal`).size : 0
    };
  }
}

module.exports = {
  COLLECTION_LABELS,
  MAINTENANCE_OBJECT_VERSION_RETENTION,
  MAINTENANCE_SNAPSHOT_RETENTION,
  OBJECT_VERSION_RETENTION,
  SEARCH_PREFIXES,
  STORAGE_FORMAT,
  WORKSPACE_SNAPSHOT_RETENTION,
  WORKSPACE_COLLECTIONS,
  WorkspaceStore,
  migrateLegacyManuscriptData,
  cjkNgrams,
  itemLabel,
  searchDocument,
  workspaceRows
};
