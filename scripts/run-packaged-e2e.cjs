const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const {
  flipFuses,
  FuseVersion,
  FuseV1Options,
  getCurrentFuseWire,
  FuseState
} = require("@electron/fuses");

const root = path.resolve(__dirname, "..");
const unpackedDir = path.join(root, "release", "win-unpacked");
const sourcePath = path.join(unpackedDir, "Worldcraft Codex.exe");
const harnessPath = path.join(unpackedDir, "Worldcraft Codex E2E Harness.exe");

async function main() {
  if (!fs.existsSync(sourcePath)) throw new Error("Build the unpacked Windows application first.");
  fs.copyFileSync(sourcePath, harnessPath);
  try {
    await flipFuses(harnessPath, {
      version: FuseVersion.V1,
      [FuseV1Options.EnableNodeCliInspectArguments]: true
    });
    const wire = await getCurrentFuseWire(harnessPath);
    if (wire[FuseV1Options.EnableNodeCliInspectArguments] !== FuseState.ENABLE) {
      throw new Error("Playwright harness inspector fuse was not enabled.");
    }
    if (wire[FuseV1Options.RunAsNode] !== FuseState.DISABLE) {
      throw new Error("Playwright harness unexpectedly changed the RunAsNode fuse.");
    }
    const result = spawnSync(process.execPath, [path.join("scripts", "project-package-e2e.test.cjs")], {
      cwd: root,
      env: { ...process.env, WORLDCRAFT_E2E_EXECUTABLE: harnessPath },
      stdio: "inherit",
      timeout: 600000,
      windowsHide: true
    });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exitCode = result.status || 1;
  } finally {
    for (let attempt = 0; attempt < 10 && fs.existsSync(harnessPath); attempt += 1) {
      try {
        fs.rmSync(harnessPath, { force: true });
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
