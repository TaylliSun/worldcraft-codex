const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const ts = require("typescript");
const { WORKSPACE_COLLECTIONS, WorkspaceStore } = require("../electron/workspace-store.cjs");

require.extensions[".ts"] = (module, filePath) => {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  module._compile(output, filePath);
};

const { buildProjectReferenceIndex } = require(path.join(__dirname, "..", "app", "project-references.ts"));
const root = path.join(__dirname, "..", "validation", `performance-budget-${process.pid}`);
const dbPath = path.join(root, "worldcraft-codex.sqlite");
const backupDir = path.join(root, "backups");
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });

const budgets = {
  initialSaveMs: 8000,
  coldLoadMs: 3000,
  referenceIndexMs: 4000,
  sidebarFilterMs: 1000,
  objectSwitchesMs: 500,
  incrementalSaveMs: 1500,
  ftsSearchMs: 750
};

const workspace = Object.fromEntries(WORKSPACE_COLLECTIONS.map((collection) => [collection, []]));
workspace.worlds = [{
  id: "world-performance",
  name: "十万字性能项目",
  description: "发布候选性能预算",
  visibility: "private",
  updatedAt: "2026-07-13T21:00:00.000Z"
}];
workspace.entities = Array.from({ length: 10000 }, (_, index) => ({
  id: `entity-${index}`,
  worldId: "world-performance",
  type: index % 7 === 0 ? "location" : "character",
  title: `北境对象 ${index}`,
  slug: `north-${index}`,
  summary: index % 211 === 0 ? `失落王冠关键线索 ${index}` : `第 ${index} 个生产条目`,
  content: index ? `与 [[北境对象 ${index - 1}]] 相关的剧情正文。${"设定".repeat(18)}` : "项目起点。",
  tags: ["北境", `批次-${index % 50}`],
  templateData: { goals: "推进区域剧情", birthplace: "雾鸦堡" },
  visibility: "private",
  categoryId: `category-${index % 80}`,
  order: index,
  updatedAt: "2026-07-13T21:00:00.000Z"
}));
workspace.quests = Array.from({ length: 400 }, (_, index) => ({
  id: `quest-${index}`,
  worldId: "world-performance",
  title: `区域任务 ${index}`,
  category: index % 3 === 0 ? "main" : "side",
  status: "draft",
  summary: `调查北境对象 ${index}`,
  trigger: "进入对应区域",
  relatedEntityIds: [`entity-${index}`, `entity-${index + 1}`],
  prerequisiteQuestIds: index ? [`quest-${index - 1}`] : [],
  steps: [{ id: `step-${index}`, title: "调查", objective: "收集线索", condition: "", branch: "", failure: "", reward: "", notes: "" }],
  updatedAt: "2026-07-13T21:00:00.000Z"
}));

let store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
const timings = {};

try {
  let started = performance.now();
  const saved = store.save(workspace, "performance-seed");
  timings.initialSaveMs = performance.now() - started;
  assert.equal(saved.inserted, 10401);
  assert.equal(timings.initialSaveMs < budgets.initialSaveMs, true, "initial large-project save meets budget");

  store.close();
  store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 17 });
  started = performance.now();
  const loaded = store.load().data;
  timings.coldLoadMs = performance.now() - started;
  assert.equal(loaded.entities.length, 10000);
  assert.equal(timings.coldLoadMs < budgets.coldLoadMs, true, "cold SQLite load meets budget");

  started = performance.now();
  const references = buildProjectReferenceIndex(loaded);
  timings.referenceIndexMs = performance.now() - started;
  assert.equal(references.references.length >= 9999, true);
  assert.equal(timings.referenceIndexMs < budgets.referenceIndexMs, true, "reference index meets budget");

  started = performance.now();
  const normalizedQuery = "失落王冠";
  const matches = loaded.entities.filter((entity) =>
    `${entity.title}\n${entity.summary}\n${entity.tags.join(" ")}\n${Object.values(entity.templateData).join(" ")}`
      .normalize("NFKC")
      .toLocaleLowerCase("zh-CN")
      .includes(normalizedQuery)
  );
  timings.sidebarFilterMs = performance.now() - started;
  assert.equal(matches.length > 40, true);
  assert.equal(timings.sidebarFilterMs < budgets.sidebarFilterMs, true, "sidebar filtering meets budget");

  started = performance.now();
  for (let index = 0; index < 500; index += 1) {
    const targetId = `entity-${(index * 19) % loaded.entities.length}`;
    assert.equal(loaded.entities.find((entity) => entity.id === targetId)?.id, targetId);
  }
  timings.objectSwitchesMs = performance.now() - started;
  assert.equal(timings.objectSwitchesMs < budgets.objectSwitchesMs, true, "500 object selections meet budget");

  const changed = structuredClone(loaded);
  changed.entities[9876].summary = "失落王冠线索已经回收";
  changed.entities[9876].updatedAt = "2026-07-13T21:05:00.000Z";
  started = performance.now();
  const incremental = store.save(changed, "performance-incremental");
  timings.incrementalSaveMs = performance.now() - started;
  assert.equal(incremental.updated, 1);
  assert.equal(incremental.bytesWritten < 20000, true);
  assert.equal(timings.incrementalSaveMs < budgets.incrementalSaveMs, true, "single-object save meets budget");

  started = performance.now();
  const search = store.search("失落王冠", "world-performance", 80);
  timings.ftsSearchMs = performance.now() - started;
  assert.equal(search.length > 40, true);
  assert.equal(timings.ftsSearchMs < budgets.ftsSearchMs, true, "FTS search meets budget");

  assert.equal(store.diagnostics().quickCheck, "ok");
  console.log(JSON.stringify({
    dataset: { entities: 10000, quests: 400, characters: JSON.stringify(workspace).length },
    budgets,
    timings: Object.fromEntries(Object.entries(timings).map(([key, value]) => [key, Math.round(value)]))
  }));
  console.log("Performance budget checks passed: 515 assertions across 7 measured workflows.");
} finally {
  store.close();
  fs.rmSync(root, { recursive: true, force: true });
}
