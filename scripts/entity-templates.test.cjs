const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function loadTypeScriptModule(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const module = { exports: {} };
  new Function("module", "exports", "require", output)(module, module.exports, require);
  return module.exports;
}

const templates = loadTypeScriptModule(
  path.join(__dirname, "..", "app", "entity-templates.ts")
);

const defaults = templates.createDefaultEntityTemplates(
  "world-a",
  "2026-07-12T08:00:00.000Z"
);
assert.equal(defaults.length, 6 + templates.specializedTemplatePresetCount);
assert.deepEqual(defaults.slice(0, 6).map((item) => item.entityTypes[0]), templates.templateEntityTypes);
assert.equal(defaults.every((item) => item.builtIn), true);
assert.equal(defaults[0].id, "template:world-a:character");
assert.equal(defaults[0].fields.some((field) => field.key === "secrets" && field.secret), true);
assert.deepEqual(
  defaults.find((item) => item.entityTypes.includes("event")).fields.find((field) => field.key === "place").targetEntityTypes,
  ["location"]
);
assert.equal(defaults.some((item) => item.name === "建筑与地标"), true);
assert.equal(defaults.some((item) => item.name === "神祇与超凡存在"), true);
assert.equal(defaults.some((item) => item.name === "会话与开发记录"), true);

const legacyDefaults = defaults.slice(0, 6);
const upgradedDefaults = templates.addMissingDefaultEntityTemplates(legacyDefaults, "world-a", "2026-07-12T08:00:00.000Z");
assert.equal(upgradedDefaults.length, defaults.length);
assert.equal(upgradedDefaults.slice(0, 6).every((item, index) => item === legacyDefaults[index]), true);

const normalized = templates.normalizeEntityTemplate(
  {
    id: "template-a",
    name: "任务角色",
    entityTypes: ["character", "invalid", "character"],
    fields: [
      { id: "field-b", key: " role name ", label: "身份", type: "select", options: ["同伴", "同伴", "敌人"], order: 2 },
      { id: "field-a", key: "level", label: "等级", type: "number", required: true, order: 0 },
      { id: "field-c", key: "friend", label: "关联角色", type: "entity_ref", targetEntityTypes: ["character", "bad"], order: 1 }
    ]
  },
  "world-a",
  0
);
assert.equal(normalized.worldId, "world-a");
assert.deepEqual(normalized.entityTypes, ["character"]);
assert.deepEqual(normalized.fields.map((field) => field.key), ["level", "friend", "role_name"]);
assert.deepEqual(normalized.fields[2].options, ["同伴", "敌人"]);
assert.deepEqual(normalized.fields[1].targetEntityTypes, ["character"]);
assert.deepEqual(normalized.fields.map((field) => field.order), [0, 1, 2]);

const custom = templates.createEntityTemplate("world-a", 2, "2026-07-12T08:01:00.000Z");
assert.equal(custom.name, "自定义模板 3");
assert.equal(custom.entityTypes[0], "note");
assert.equal(custom.fields.length, 1);
assert.equal(custom.fields[0].type, "textarea");

const entity = {
  id: "entity-a",
  worldId: "world-a",
  type: "character",
  title: "艾琳",
  templateId: normalized.id,
  templateData: { level: "12", friend: "entity-b" }
};
assert.equal(templates.resolveEntityTemplate([...defaults, normalized], entity).id, normalized.id);
assert.equal(
  templates.resolveEntityTemplate(defaults, { type: "item", templateId: "missing" }).id,
  "template:world-a:item"
);

const incomplete = templates.getTemplateCompletion(normalized, { level: "" });
assert.equal(incomplete.required, 1);
assert.equal(incomplete.completed, 0);
assert.equal(incomplete.percent, 0);
assert.deepEqual(incomplete.missingKeys, ["level"]);
const complete = templates.getTemplateCompletion(normalized, { level: "5" });
assert.equal(complete.percent, 100);

const withDefaults = templates.applyTemplateDefaults(
  templates.normalizeEntityTemplate(
    { name: "状态", entityTypes: ["note"], fields: [{ key: "enabled", label: "启用", type: "boolean", defaultValue: "true" }] },
    "world-a",
    0
  ),
  { kept: "yes" }
);
assert.equal(withDefaults.enabled, "true");
assert.equal(withDefaults.kept, "yes");

const invalidTemplate = templates.normalizeEntityTemplate(
  {
    id: "template-invalid",
    name: "问题模板",
    entityTypes: ["character"],
    fields: [
      { id: "a", key: "role", label: "", type: "select", options: [] },
      { id: "b", key: "role", label: "重复身份", type: "text", required: true },
      { id: "c", key: "friend", label: "朋友", type: "entity_ref", targetEntityTypes: ["character"] }
    ]
  },
  "world-a",
  0
);
const issues = templates.validateEntityTemplates(
  [invalidTemplate],
  [
    { ...entity, templateId: invalidTemplate.id, templateData: { friend: "missing" } },
    { id: "entity-b", worldId: "world-a", type: "location", title: "雾鸦堡", templateId: invalidTemplate.id, templateData: {} },
    { id: "entity-c", worldId: "world-a", type: "note", title: "失效模板", templateId: "gone", templateData: {} }
  ]
);
assert.equal(issues.some((issue) => issue.code === "duplicate-field-key"), true);
assert.equal(issues.some((issue) => issue.code === "missing-field-label"), true);
assert.equal(issues.some((issue) => issue.code === "invalid-select-options"), true);
assert.equal(issues.some((issue) => issue.code === "missing-required-value"), true);
assert.equal(issues.some((issue) => issue.code === "broken-entity-reference"), true);
assert.equal(issues.some((issue) => issue.code === "incompatible-template"), true);
assert.equal(issues.some((issue) => issue.code === "missing-template"), true);
assert.equal(issues.filter((issue) => issue.severity === "error").length >= 3, true);

console.log("Entity template checks passed: 36 assertions across 6 scenarios.");
