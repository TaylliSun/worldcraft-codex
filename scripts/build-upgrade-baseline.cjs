const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const packageJson = require(path.join(root, "package.json"));

function previousCandidateVersion(version) {
  const match = version.match(/^(.*-rc\.)(\d+)$/);
  if (!match || Number(match[2]) < 1) {
    throw new Error("WORLDCRAFT_UPGRADE_BASELINE_VERSION is required outside an RC sequence.");
  }
  return `${match[1]}${Number(match[2]) - 1}`;
}

function removeOutputDirectory(directory) {
  const validationRoot = path.resolve(root, "validation");
  const target = path.resolve(directory);
  if (target === validationRoot || !target.startsWith(`${validationRoot}${path.sep}`)) {
    throw new Error(`Refusing to remove baseline output outside ${validationRoot}: ${target}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
}

const baselineVersion =
  process.env.WORLDCRAFT_UPGRADE_BASELINE_VERSION || previousCandidateVersion(packageJson.version);
const outputDir = path.join(root, "validation", "baseline-release");
const builderCli = path.join(root, "node_modules", "electron-builder", "cli.js");
const generatedConfig = path.join(root, "build", "generated", "release-config.json");
const currentInstaller = path.join(
  root,
  "release",
  `Worldcraft Codex-Setup-${packageJson.version}.exe`
);

if (baselineVersion === packageJson.version) {
  throw new Error("Upgrade baseline version must differ from the current package version.");
}
for (const required of [builderCli, generatedConfig, currentInstaller, path.join(root, ".next")]) {
  if (!fs.existsSync(required)) {
    throw new Error(`Build the current installer before creating the upgrade baseline: missing ${required}`);
  }
}

removeOutputDirectory(outputDir);
const result = spawnSync(
  process.execPath,
  [
    builderCli,
    "--config",
    "electron-builder.config.cjs",
    "--win",
    "nsis",
    `--config.extraMetadata.version=${baselineVersion}`,
    "--config.directories.output=validation/baseline-release"
  ],
  {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    timeout: 900000,
    windowsHide: true
  }
);

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) throw result.error;
if (result.status !== 0) {
  throw new Error(`Upgrade baseline build failed with exit code ${result.status}.`);
}

const installer = path.join(outputDir, `Worldcraft Codex-Setup-${baselineVersion}.exe`);
if (!fs.existsSync(installer) || fs.statSync(installer).size === 0) {
  throw new Error(`Upgrade baseline installer was not created: ${installer}`);
}

const metadata = {
  baselineKind: "synthetic-installer-mechanics",
  baselineVersion,
  currentVersion: packageJson.version,
  installer: path.basename(installer),
  sha256: crypto.createHash("sha256").update(fs.readFileSync(installer)).digest("hex"),
  sourceVersion: packageJson.version
};
fs.writeFileSync(
  path.join(outputDir, "upgrade-baseline.json"),
  `${JSON.stringify(metadata, null, 2)}\n`,
  "utf8"
);
console.log(JSON.stringify(metadata));
