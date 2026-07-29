const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const generatedDir = path.join(root, "build", "generated");
const validationDir = path.join(root, "validation");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const releaseConfig = JSON.parse(
  fs.readFileSync(path.join(generatedDir, "release-config.json"), "utf8")
);
const inventory = JSON.parse(
  fs.readFileSync(path.join(generatedDir, "third-party-inventory.json"), "utf8")
);

const scanRoots = [
  "app",
  "electron",
  "scripts",
  "docs",
  ".github",
  "README.md",
  "package.json",
  "package-lock.json",
  "electron-builder.config.cjs",
  "next.config.mjs",
  "tsconfig.json",
  ".env.example"
];
const textExtensions = new Set([
  ".cjs", ".js", ".mjs", ".ts", ".tsx", ".json", ".md", ".txt", ".yml", ".yaml", ".css", ".example"
]);
const secretPatterns = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["github-token", /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ["aws-access-key", /\bAKIA[0-9A-Z]{16}\b/],
  ["openai-style-key", /\bsk-[A-Za-z0-9]{24,}\b/],
  ["credential-url", /https:\/\/[^\s/@:]+:[^\s/@]+@/i]
];
const findings = [];

function walk(target, relative = "") {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(target)) {
      walk(path.join(target, name), path.join(relative, name));
    }
    return;
  }
  const extension = path.extname(target).toLowerCase();
  if (!textExtensions.has(extension) && path.basename(target) !== "README.md") return;
  const content = fs.readFileSync(target, "utf8");
  for (const [rule, pattern] of secretPatterns) {
    if (pattern.test(content)) findings.push({ rule, file: relative.replace(/\\/g, "/") });
  }
}

for (const entry of scanRoots) {
  walk(path.join(root, entry), entry);
}

for (const extension of [".pfx", ".p12", ".pem", ".key"]) {
  const files = fs.readdirSync(root).filter((name) => name.toLowerCase().endsWith(extension));
  files.forEach((file) => findings.push({ rule: "signing-file", file }));
}

if (packageJson.private !== true) findings.push({ rule: "package-private", file: "package.json" });
if (packageJson.license !== "UNLICENSED") findings.push({ rule: "package-license", file: "package.json" });
if (!packageJson.author?.name) findings.push({ rule: "package-author", file: "package.json" });
if (releaseConfig.appVersion !== packageJson.version) {
  findings.push({ rule: "release-version", file: "build/generated/release-config.json" });
}
if (inventory.packages.some((item) => !item.license || item.license === "UNKNOWN")) {
  findings.push({ rule: "unknown-production-license", file: "build/generated/third-party-inventory.json" });
}
if (inventory.packages.some((item) => !item.licenseTextSha256 || item.licenseTextSource === "missing")) {
  findings.push({ rule: "missing-production-license-text", file: "build/generated/third-party-inventory.json" });
}
if (!fs.statSync(path.join(generatedDir, "THIRD_PARTY_NOTICES.txt")).size) {
  findings.push({ rule: "empty-third-party-notices", file: "build/generated/THIRD_PARTY_NOTICES.txt" });
}

const auditRun = process.platform === "win32"
  ? spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", "npm audit --omit=dev --json"], {
      cwd: root,
      encoding: "utf8",
      timeout: 180000,
      windowsHide: true
    })
  : spawnSync("npm", ["audit", "--omit=dev", "--json"], {
      cwd: root,
      encoding: "utf8",
      timeout: 180000,
      windowsHide: true
    });
let vulnerabilities = { total: -1, high: -1, critical: -1 };
try {
  vulnerabilities = JSON.parse(auditRun.stdout).metadata.vulnerabilities;
} catch {
  findings.push({ rule: "dependency-audit-unreadable", file: "package-lock.json" });
}
if ((vulnerabilities.high || 0) > 0 || (vulnerabilities.critical || 0) > 0) {
  findings.push({ rule: "dependency-vulnerability", file: "package-lock.json" });
}

const report = {
  format: "worldcraft-public-release-audit-v1",
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  releaseMode: releaseConfig.mode,
  publicReady: releaseConfig.distribution.publicReady,
  externalBlockerCount: releaseConfig.distribution.externalBlockers.length,
  productionPackages: inventory.packageCount,
  vulnerabilities,
  findings,
  passed: findings.length === 0
};
fs.mkdirSync(validationDir, { recursive: true });
fs.writeFileSync(
  path.join(validationDir, "public-release-audit-" + packageJson.version + ".json"),
  JSON.stringify(report, null, 2) + "\n",
  "utf8"
);
console.log(JSON.stringify(report));
if (!report.passed) process.exitCode = 1;
