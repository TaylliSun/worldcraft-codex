const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { readAuthenticodeSignature } = require("./authenticode.cjs");

const root = path.resolve(__dirname, "..");
const releaseDir = path.join(root, "release");
const generatedDir = path.join(root, "build", "generated");
const packagedReleaseConfigPath = path.join(
  releaseDir,
  "win-unpacked",
  "resources",
  "release-config.json"
);
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const releaseConfig = JSON.parse(
  fs.readFileSync(packagedReleaseConfigPath, "utf8")
);
const version = packageJson.version;

function artifactGeneratedAt() {
  const epoch = Number(process.env.SOURCE_DATE_EPOCH);
  return Number.isFinite(epoch) && epoch > 0
    ? new Date(epoch * 1000).toISOString()
    : new Date().toISOString();
}

function hashFile(filePath) {
  const hash = crypto.createHash("sha256");
  const bytes = fs.readFileSync(filePath);
  hash.update(bytes);
  return { sha256: hash.digest("hex"), bytes: bytes.length };
}

function sourceFiles() {
  const roots = ["app", "electron", "scripts", "docs", ".github"];
  const files = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(target);
      else files.push(target);
    }
  }
  roots.forEach((name) => walk(path.join(root, name)));
  [
    "package.json",
    "package-lock.json",
    "electron-builder.config.cjs",
    "next.config.mjs",
    "tsconfig.json",
    ".env.example",
    ".gitignore",
    "README.md",
    "SECURITY.md"
  ].forEach((name) => files.push(path.join(root, name)));
  return files.sort();
}

function sourceDigest() {
  const hash = crypto.createHash("sha256");
  for (const filePath of sourceFiles()) {
    const relative = path.relative(root, filePath).replace(/\\/g, "/");
    hash.update(relative);
    hash.update("\0");
    hash.update(hashFile(filePath).sha256);
    hash.update("\n");
  }
  return hash.digest("hex");
}

function npmVersion() {
  const executable = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npm";
  const args = process.platform === "win32" ? ["/d", "/s", "/c", "npm --version"] : ["--version"];
  return spawnSync(executable, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true
  }).stdout.trim();
}

function generateSbom() {
  const executable = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npm";
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", "npm sbom --sbom-format cyclonedx --omit dev"]
    : ["sbom", "--sbom-format", "cyclonedx", "--omit", "dev"];
  const result = spawnSync(executable, args, {
    cwd: root,
    encoding: "utf8",
    timeout: 180000,
    windowsHide: true,
    maxBuffer: 50 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error("npm sbom failed: " + (result.stderr || result.stdout || "unknown error"));
  }
  const parsed = JSON.parse(result.stdout);
  const serialized = JSON.stringify(parsed, null, 2) + "\n";
  const sbomPath = path.join(releaseDir, "Worldcraft-Codex-" + version + "-sbom.cdx.json");
  fs.writeFileSync(sbomPath, serialized, "utf8");
  return sbomPath;
}

fs.mkdirSync(releaseDir, { recursive: true });
const expectedExecutables = [
  "Worldcraft Codex-Portable-" + version + ".exe",
  "Worldcraft Codex-Setup-" + version + ".exe"
];
const artifacts = [];
for (const name of expectedExecutables) {
  const filePath = path.join(releaseDir, name);
  if (!fs.existsSync(filePath)) throw new Error("Missing release artifact: " + name);
  const hashed = hashFile(filePath);
  artifacts.push({ name, ...hashed, signature: readAuthenticodeSignature(filePath) });
}
for (const name of [
  "Worldcraft Codex-Setup-" + version + ".exe.blockmap",
  "latest.yml"
]) {
  const filePath = path.join(releaseDir, name);
  if (fs.existsSync(filePath)) artifacts.push({ name, ...hashFile(filePath) });
}

const sbomPath = generateSbom();
const supportingFiles = [
  sbomPath,
  path.join(generatedDir, "THIRD_PARTY_NOTICES.txt"),
  path.join(generatedDir, "third-party-inventory.json"),
  packagedReleaseConfigPath
].filter((filePath) => fs.existsSync(filePath));

const generatedAt = artifactGeneratedAt();
const provenance = {
  format: "worldcraft-release-provenance-v1",
  version,
  generatedAt,
  sourceDateEpoch: process.env.SOURCE_DATE_EPOCH || "",
  sourceSha256: sourceDigest(),
  packageLockSha256: hashFile(path.join(root, "package-lock.json")).sha256,
  runtime: {
    platform: process.platform,
    architecture: process.arch,
    node: process.version,
    npm: npmVersion(),
    electron: require("electron/package.json").version,
    electronBuilder: require("electron-builder/package.json").version
  },
  releaseMode: releaseConfig.mode,
  channel: releaseConfig.channel
};
const provenanceName = "Worldcraft-Codex-" + version + "-provenance.json";
const provenancePath = path.join(releaseDir, provenanceName);
fs.writeFileSync(provenancePath, JSON.stringify(provenance, null, 2) + "\n", "utf8");

const manifest = {
  format: "worldcraft-release-manifest-v1",
  version,
  schemaVersion: 17,
  generatedAt,
  releaseMode: releaseConfig.mode,
  channel: releaseConfig.channel,
  publicReady: releaseConfig.distribution.publicReady,
  signedBuildRequired: releaseConfig.distribution.signedBuildRequired,
  artifacts,
  provenance: { name: provenanceName, ...hashFile(provenancePath) },
  sbom: {
    name: path.basename(sbomPath),
    ...hashFile(sbomPath),
    format: "CycloneDX"
  },
  thirdPartyNotices: hashFile(path.join(generatedDir, "THIRD_PARTY_NOTICES.txt"))
};
if (manifest.signedBuildRequired && artifacts.some((item) => item.name.endsWith(".exe") && !item.signature?.signed)) {
  throw new Error("Public release contains an unsigned executable.");
}

const manifestName = "Worldcraft-Codex-" + version + "-manifest.json";
const manifestPath = path.join(releaseDir, manifestName);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

const checksumFiles = [
  ...artifacts.map((item) => path.join(releaseDir, item.name)),
  ...supportingFiles,
  provenancePath,
  manifestPath
];
const checksumLines = checksumFiles
  .map((filePath) => hashFile(filePath).sha256 + "  " + path.basename(filePath))
  .sort();
fs.writeFileSync(path.join(releaseDir, "SHA256SUMS.txt"), checksumLines.join("\n") + "\n", "utf8");
console.log(JSON.stringify({
  version,
  artifacts: artifacts.length,
  signedExecutables: artifacts.filter((item) => item.signature?.signed).length,
  manifest: manifestName,
  sbom: path.basename(sbomPath)
}));
