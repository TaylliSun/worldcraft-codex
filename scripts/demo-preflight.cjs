const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const Database = require("better-sqlite3");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);

function argumentValue(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] || "" : "";
}

function formatBytes(bytes) {
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let value = Number(bytes) || 0;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit < 2 ? 0 : 1)} ${units[unit]}`;
}

function parseItem(row) {
  try {
    return JSON.parse(row.data);
  } catch {
    return null;
  }
}

function countMap(rows) {
  const result = new Map();
  for (const row of rows) {
    if (!result.has(row.world_id)) result.set(row.world_id, {});
    result.get(row.world_id)[row.collection] = Number(row.count);
  }
  return result;
}

function collectDirectorySize(directory) {
  if (!fs.existsSync(directory)) return { bytes: 0, files: 0 };
  const stack = [directory];
  let bytes = 0;
  let files = 0;
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (entry.isFile()) {
        const stats = fs.statSync(fullPath);
        bytes += stats.size;
        files += 1;
      }
    }
  }
  return { bytes, files };
}

const defaultUserDataDir = path.join(
  process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
  "worldcraft-codex"
);
const userDataDir = path.resolve(
  argumentValue("--user-data") || process.env.WORLDCRAFT_USER_DATA_DIR || defaultUserDataDir
);
const dbPath = path.join(userDataDir, "worldcraft-codex.sqlite");
const assetDir = path.join(userDataDir, "assets");
const backupDir = path.join(userDataDir, "backups");
const reportPath = path.join(root, "validation", "showcase-preflight.json");

const requiredCases = [
  {
    key: "mythology",
    name: "中国上古神话史",
    minimum: {
      entities: 2442,
      relations: 7333,
      timelineEvents: 635
    }
  },
  {
    key: "shanhai-remastered",
    name: "山海经 · 原典内容全集重制版",
    minimum: {
      assets: 284,
      entities: 1909,
      manuscriptChapters: 18,
      maps: 21,
      quests: 8
    }
  }
];

const checks = [];
const warnings = [];
const addCheck = (id, ok, message, details = {}) => {
  checks.push({ id, ok: Boolean(ok), message, ...details });
};

let db;
let worlds = [];
let caseReports = [];

try {
  addCheck("database-exists", fs.existsSync(dbPath), `找到演示数据库：${dbPath}`);
  if (!fs.existsSync(dbPath)) throw new Error(`未找到数据库：${dbPath}`);

  db = new Database(dbPath, { fileMustExist: true, readonly: true });
  const quickCheck = db.pragma("quick_check", { simple: true });
  addCheck("sqlite-quick-check", quickCheck === "ok", `SQLite quick_check：${quickCheck}`);

  const schemaRow = db.prepare("SELECT value FROM app_meta WHERE key = 'schema_version'").get();
  const schemaVersion = Number(schemaRow?.value || 0);
  addCheck(
    "schema-version",
    schemaVersion >= 17,
    `数据库 schema：${schemaVersion}`,
    { schemaVersion }
  );

  worlds = db
    .prepare("SELECT item_id, data FROM workspace_items WHERE collection = 'worlds' ORDER BY position")
    .all()
    .map(parseItem)
    .filter(Boolean);
  addCheck("worlds-present", worlds.length > 0, `可用世界：${worlds.length} 个`);

  const counts = countMap(
    db
      .prepare(
        "SELECT world_id, collection, COUNT(*) AS count FROM workspace_items GROUP BY world_id, collection"
      )
      .all()
  );

  caseReports = requiredCases.map((requiredCase) => {
    const world = worlds.find((item) => item.name === requiredCase.name);
    const actual = world ? counts.get(world.id) || {} : {};
    const missingMinimums = Object.entries(requiredCase.minimum)
      .filter(([collection, minimum]) => Number(actual[collection] || 0) < minimum)
      .map(([collection, minimum]) => ({
        actual: Number(actual[collection] || 0),
        collection,
        minimum
      }));
    addCheck(
      `case-${requiredCase.key}`,
      Boolean(world) && missingMinimums.length === 0,
      world
        ? `${requiredCase.name}：${missingMinimums.length ? "数量不足" : "内容规模通过"}`
        : `${requiredCase.name}：未找到`,
      { actual, missingMinimums, worldId: world?.id || "" }
    );
    return {
      ...requiredCase,
      actual,
      missingMinimums,
      world: world ? { id: world.id, name: world.name } : null
    };
  });

  const shanhaiWorld = caseReports.find((item) => item.key === "shanhai-remastered")?.world;
  if (shanhaiWorld) {
    const rows = db
      .prepare("SELECT collection, item_id, data FROM workspace_items WHERE world_id = ?")
      .all(shanhaiWorld.id);
    const externalReferencePattern =
      /(?:https?|ftp):\/\/|\bwww\.|5000yan|world\s*anvil|\u767e\u5ea6\u767e\u79d1|\u7ef4\u57fa\u767e\u79d1/iu;
    const externalReferences = rows
      .filter((row) => externalReferencePattern.test(row.data))
      .map((row) => ({ collection: row.collection, itemId: row.item_id }))
      .slice(0, 20);
    addCheck(
      "shanhai-external-references",
      externalReferences.length === 0,
      `山海经重制版外部链接与第三方 Wiki 痕迹：${externalReferences.length} 项`,
      { externalReferences }
    );

    const assets = rows
      .filter((row) => row.collection === "assets")
      .map(parseItem)
      .filter(Boolean);
    const missingAssets = assets
      .filter((asset) => !asset.storedName || !fs.existsSync(path.join(assetDir, asset.storedName)))
      .map((asset) => ({ id: asset.id, name: asset.name, storedName: asset.storedName || "" }))
      .slice(0, 30);
    addCheck(
      "shanhai-physical-assets",
      missingAssets.length === 0,
      `山海经重制版本地资源：${assets.length - missingAssets.length}/${assets.length} 可用`,
      { missingAssets }
    );
  }

  const driveStats = fs.statfsSync(userDataDir);
  const freeBytes = driveStats.bavail * driveStats.bsize;
  addCheck(
    "free-disk",
    freeBytes >= 2 * 1024 ** 3,
    `用户数据盘剩余空间：${formatBytes(freeBytes)}`,
    { freeBytes }
  );
  if (freeBytes < 8 * 1024 ** 3) {
    warnings.push("剩余空间低于 8 GiB，演示前不要创建完整工程备份。");
  }

  const backupSize = collectDirectorySize(backupDir);
  if (backupSize.bytes >= 10 * 1024 ** 3) {
    warnings.push(
      `备份目录已有 ${formatBytes(backupSize.bytes)}（${backupSize.files} 个文件），展演脚本不会继续自动备份。`
    );
  }

  const unnamedWorlds = worlds.filter((world) => /^新世界(?:\s+\d+)?$/.test(world.name));
  if (unnamedWorlds.length) {
    warnings.push(`世界列表中有 ${unnamedWorlds.length} 个默认命名世界，展演时优先使用两个主案例。`);
  }
} catch (error) {
  addCheck(
    "preflight-runtime",
    false,
    error instanceof Error ? error.message : String(error)
  );
} finally {
  if (db) db.close();
}

const report = {
  format: "worldcraft-showcase-preflight-v1",
  generatedAt: new Date().toISOString(),
  ok: checks.every((check) => check.ok),
  profile: {
    assetDir,
    dbPath,
    dbSize: fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0,
    userDataDir
  },
  worlds: worlds.map((world) => ({ id: world.id, name: world.name })),
  cases: caseReports,
  checks,
  warnings
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("\nWorldcraft Codex 展演预检");
console.log("=".repeat(34));
for (const check of checks) {
  console.log(`${check.ok ? "[通过]" : "[失败]"} ${check.message}`);
}
for (const warning of warnings) console.log(`[提醒] ${warning}`);
console.log(`\n${report.ok ? "预检通过，正式数据未被修改。" : "预检未通过，请先处理失败项。"}`);
console.log(`报告：${reportPath}\n`);

if (!report.ok) process.exitCode = 1;
