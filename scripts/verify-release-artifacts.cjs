const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const releaseDir = path.join(root, "release");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = packageJson.version;
const manifestPath = path.join(releaseDir, "Worldcraft-Codex-" + version + "-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const packagedReleaseConfigPath = path.join(
  releaseDir,
  "win-unpacked",
  "resources",
  "release-config.json"
);
const packagedReleaseConfig = JSON.parse(fs.readFileSync(packagedReleaseConfigPath, "utf8"));
let assertions = 0;

function check(actual, expected, message) {
  if (actual !== expected) throw new Error(message + ": " + actual + " !== " + expected);
  assertions += 1;
}

function hashFile(filePath) {
  const bytes = fs.readFileSync(filePath);
  return {
    bytes: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex")
  };
}

check(manifest.format, "worldcraft-release-manifest-v1", "manifest format");
check(manifest.version, version, "manifest version");
check(manifest.schemaVersion, 17, "manifest schema");
check(manifest.releaseMode, packagedReleaseConfig.mode, "manifest uses packaged release mode");
check(manifest.channel, packagedReleaseConfig.channel, "manifest uses packaged release channel");
for (const artifact of manifest.artifacts) {
  const filePath = path.join(releaseDir, artifact.name);
  check(fs.existsSync(filePath), true, artifact.name + " exists");
  const hashed = hashFile(filePath);
  check(hashed.bytes, artifact.bytes, artifact.name + " size");
  check(hashed.sha256, artifact.sha256, artifact.name + " SHA-256");
  if (manifest.signedBuildRequired && artifact.name.endsWith(".exe")) {
    check(artifact.signature?.signed, true, artifact.name + " signature");
  }
}

const sbomPath = path.join(releaseDir, manifest.sbom.name);
check(fs.existsSync(sbomPath), true, "SBOM exists");
check(hashFile(sbomPath).sha256, manifest.sbom.sha256, "SBOM SHA-256");
const sbom = JSON.parse(fs.readFileSync(sbomPath, "utf8"));
check(sbom.bomFormat, "CycloneDX", "SBOM format");

const checksumPath = path.join(releaseDir, "SHA256SUMS.txt");
const checksumLines = fs.readFileSync(checksumPath, "utf8").trim().split(/\r?\n/);
for (const line of checksumLines) {
  const match = /^([a-f0-9]{64})  ([^\\/]+)$/.exec(line);
  check(Boolean(match), true, "checksum line format");
  if (!match) continue;
  const filePath = match[2] === "release-config.json"
    ? packagedReleaseConfigPath
    : path.join(
      ["THIRD_PARTY_NOTICES.txt", "third-party-inventory.json"].includes(match[2])
        ? path.join(root, "build", "generated")
        : releaseDir,
      match[2]
    );
  check(fs.existsSync(filePath), true, match[2] + " checksum target");
  check(hashFile(filePath).sha256, match[1], match[2] + " checksum");
}

const serialized = [
  fs.readFileSync(manifestPath, "utf8"),
  fs.readFileSync(path.join(releaseDir, manifest.provenance.name), "utf8"),
  fs.readFileSync(sbomPath, "utf8")
].join("\n").toLowerCase();
check(serialized.includes(root.toLowerCase().replace(/\\/g, "/")), false, "release metadata omits source path");
check(serialized.includes(root.toLowerCase()), false, "release metadata omits Windows source path");
console.log("Release artifact verification passed: " + assertions + " assertions.");
