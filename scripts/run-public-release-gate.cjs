const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const quick = process.argv.includes("--quick");
const commands = [
  "release:prepare",
  "release:notices",
  "release:audit",
  "typecheck",
  "test:public-release",
  "test:updates",
  "test:security",
  "test:authenticode",
  "test:release",
  "test:local-model",
    "test:ai-credentials",
    "test:project-references",
    "test:impact",
    "test:ai-hybrid-memory",
    "test:ai-unified-undo",
    "test:world-lifecycle",
  "test:publication",
  "test:offline-wiki",
  "test:wiki-publication",
  "test:manuscript",
  "test:manuscript-publication",
  "test:manuscript-storage",
  "test:migrations"
];
if (!quick) {
  commands.push(
    "test:consistency",
    "test:ai-writing",
    "test:ai-operations",
    "test:narrative",
    "test:templates",
    "test:codex-tree",
    "test:inline-ai",
    "test:starter-packs",
    "test:planning",
    "test:story",
    "test:storage",
    "test:pressure",
    "test:performance",
    "test:project-files",
    "test:project-package",
    "test:project-package-pressure",
    "test:resilience",
    "build:web",
    "test:bundle",
    "test:e2e"
  );
}

const results = [];
for (const script of commands) {
  const startedAt = Date.now();
  const executable = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npm";
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", `npm run ${script}`]
    : ["run", script];
  const result = spawnSync(executable, args, {
    cwd: root,
    encoding: "utf8",
    timeout: 1200000,
    windowsHide: true,
    stdio: "inherit"
  });
  results.push({
    script,
    passed: result.status === 0,
    durationMs: Date.now() - startedAt
  });
  if (result.status !== 0) break;
}

const report = {
  format: "worldcraft-public-release-gate-v1",
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  mode: quick ? "quick" : "full",
  passed: results.length === commands.length && results.every((item) => item.passed),
  results
};
fs.mkdirSync(path.join(root, "validation"), { recursive: true });
fs.writeFileSync(
  path.join(root, "validation", "public-release-gate-" + packageJson.version + ".json"),
  JSON.stringify(report, null, 2) + "\n",
  "utf8"
);
console.log(JSON.stringify(report));
if (!report.passed) process.exitCode = 1;
