const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  createBackupPayload,
  createProjectPayload,
  parseWorkspaceJson,
  unwrapWorkspacePayload,
  validateWorkspacePayload
} = require("../electron/project-files.cjs");
const {
  WORKSPACE_COLLECTIONS,
  WorkspaceStore
} = require("../electron/workspace-store.cjs");

const root = path.join(__dirname, "..", "validation", `project-persistence-${process.pid}`);
const dbPath = path.join(root, "worldcraft-codex.sqlite");
const backupDir = path.join(root, "backups");
const projectPath = path.join(root, "roundtrip.wcodex.json");
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });

const workspace = Object.fromEntries(
  WORKSPACE_COLLECTIONS.map((collection) => [collection, []])
);
workspace.worlds = [{ id: "world-a", name: "Roundtrip World", updatedAt: "2026-07-12T04:00:00.000Z" }];
workspace.entities = [
  {
    id: "entity-a",
    worldId: "world-a",
    type: "character",
    title: "Roundtrip Hero",
    summary: "Preserve every field.",
    tags: ["test"],
    templateData: { goal: "return unchanged" },
    templateId: "template-a",
    updatedAt: "2026-07-12T04:00:00.000Z"
  }
];
workspace.entityTemplates = [
  {
    id: "template-a",
    worldId: "world-a",
    name: "Roundtrip Template",
    description: "Preserve template definitions.",
    entityTypes: ["character"],
    fields: [{ id: "field-a", key: "goal", label: "Goal", type: "textarea", required: true, secret: false, defaultValue: "", options: [], targetEntityTypes: [], order: 0 }],
    builtIn: false,
    createdAt: "2026-07-12T04:00:00.000Z",
    updatedAt: "2026-07-12T04:00:00.000Z"
  }
];
workspace.quests = [
  {
    id: "quest-a",
    worldId: "world-a",
    title: "Roundtrip Quest",
    steps: [],
    relatedEntityIds: ["entity-a"],
    prerequisiteQuestIds: [],
    updatedAt: "2026-07-12T04:00:00.000Z"
  }
];
workspace.narrativeMilestones = [
  {
    id: "milestone-a",
    worldId: "world-a",
    title: "Roundtrip Milestone",
    summary: "Preserve production planning.",
    act: "Act I",
    status: "blocked",
    priority: "critical",
    order: 0,
    targetDate: "2026-08-01",
    blockedReason: "Waiting for dialogue",
    developerNotes: "Roundtrip every link.",
    dependencyIds: [],
    linkedQuestIds: ["quest-a"],
    linkedSceneIds: [],
    linkedEntityIds: ["entity-a"],
    linkedTimelineEventIds: [],
    linkedMapMarkerIds: [],
    linkedReviewIssueIds: [],
    createdAt: "2026-07-12T04:00:00.000Z",
    updatedAt: "2026-07-12T04:00:00.000Z"
  }
];

try {
  const project = createProjectPayload(workspace, {
    schemaVersion: 11,
    savedAt: "2026-07-12T04:01:00.000Z"
  });
  assert.equal(project.app, "Worldcraft Codex");
  assert.equal(project.version, 11);
  assert.equal(project.savedAt, "2026-07-12T04:01:00.000Z");
  assert.strictEqual(project.data, workspace);
  assert.deepEqual(parseWorkspaceJson(JSON.stringify(project)), workspace);
  assert.deepEqual(parseWorkspaceJson(JSON.stringify(workspace)), workspace);
  assert.equal(project.data.narrativeMilestones[0].blockedReason, "Waiting for dialogue");
  assert.equal(project.data.entityTemplates[0].fields[0].key, "goal");
  assert.strictEqual(unwrapWorkspacePayload(project), workspace);
  assert.strictEqual(validateWorkspacePayload(workspace), workspace);

  const backup = createBackupPayload(workspace, {
    schemaVersion: 11,
    backedUpAt: "2026-07-12T04:02:00.000Z",
    reason: "manual"
  });
  assert.equal(backup.app, "Worldcraft Codex");
  assert.equal(backup.version, 11);
  assert.equal(backup.backedUpAt, "2026-07-12T04:02:00.000Z");
  assert.equal(backup.reason, "manual");
  assert.deepEqual(parseWorkspaceJson(JSON.stringify(backup)), workspace);
  assert.deepEqual(backup.data.narrativeMilestones[0].linkedQuestIds, ["quest-a"]);

  assert.throws(() => parseWorkspaceJson("not-json"), SyntaxError);
  assert.throws(() => parseWorkspaceJson("null"), /invalid/i);
  assert.throws(() => parseWorkspaceJson("[]"), /invalid/i);
  assert.throws(() => validateWorkspacePayload("invalid"), /invalid/i);

  fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));
  const imported = parseWorkspaceJson(fs.readFileSync(projectPath, "utf8"));
  assert.deepEqual(imported, workspace);

  const store = new WorkspaceStore({ dbPath, backupDir, schemaVersion: 11 });
  try {
    const changed = structuredClone(workspace);
    changed.entities[0].title = "Changed Hero";
    store.save(changed, "initial-seed");
    const restored = parseWorkspaceJson(JSON.stringify(backup));
    const restoreResult = store.save(restored, "restore-backup");
    assert.equal(restoreResult.updated, 1);
    assert.deepEqual(store.load().data, workspace);
    assert.equal(store.diagnostics().ok, true);
    assert.equal(
      store
        .open()
        .prepare("SELECT COUNT(*) count FROM workspace_snapshots WHERE reason = 'restore-backup'")
        .get().count,
      1
    );
  } finally {
    store.close();
  }

  console.log("Project file and backup checks passed: 25 assertions across 5 scenarios.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
