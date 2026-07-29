const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

const executablePath = path.resolve(process.argv[2] || "");
const userDataDir = path.resolve(process.argv[3] || "");
const expectedVersion = process.argv[4] || "";
const expectedSchema = Number(process.argv[5] || 0);
const launchTimeout = /portable/i.test(path.basename(executablePath)) ? 150000 : 60000;

if (!fs.existsSync(executablePath) || !userDataDir || !expectedVersion) {
  throw new Error("Usage: node scripts/packaged-launch.test.cjs <exe> <user-data> <version>");
}

(async () => {
  const env = { ...process.env, WORLDCRAFT_USER_DATA_DIR: userDataDir };
  delete env.ELECTRON_RUN_AS_NODE;
  const electronApp = await electron.launch({ executablePath, env, timeout: launchTimeout });
  try {
    const page = await electronApp.firstWindow({ timeout: launchTimeout });
    await page.getByLabel("世界名称").waitFor({ state: "visible", timeout: launchTimeout });
    await page.waitForFunction(() =>
      Boolean(document.querySelector("[role='dialog'][aria-label='选择项目起步包']")) ||
      Boolean(document.querySelector(".compact-save-status")?.textContent.includes("SQLite"))
    );
    const starterDialog = page.getByRole("dialog", { name: "选择项目起步包", exact: true });
    if (await starterDialog.isVisible()) {
      await starterDialog.getByRole("radio", { name: /游戏叙事/ }).click();
      await starterDialog.getByRole("button", { name: "进入创作台", exact: true }).click();
    }
    await page.locator(".compact-save-status").waitFor({ state: "visible", timeout: launchTimeout });
    await page.waitForFunction(() => document.querySelector(".compact-save-status")?.textContent.includes("SQLite"));
    const version = await electronApp.evaluate(({ app }) => app.getVersion());
    assert.equal(version, expectedVersion, "packaged app reports the expected version");
    const diagnosticsResult = await page.evaluate(() => window.worldcraftStore.getDiagnostics());
    const diagnostics = diagnosticsResult.diagnostics;
    if (expectedSchema) {
      assert.equal(diagnostics.schemaVersion, expectedSchema, "packaged app reports the expected schema");
    }
    assert.equal(diagnostics.quickCheck, "ok", "packaged app SQLite quick_check passes");
    const databasePath = path.join(userDataDir, "worldcraft-codex.sqlite");
    assert.equal(fs.existsSync(databasePath), true, "packaged app initializes SQLite");
    console.log(JSON.stringify({
      mainWindowShown: true,
      title: await page.title(),
      version,
      schemaVersion: diagnostics.schemaVersion,
      quickCheck: diagnostics.quickCheck,
      sqliteInitialized: true,
      databasePath
    }));
  } finally {
    await electronApp.evaluate(({ app }) => app.quit()).catch(() => undefined);
    await electronApp.close().catch(() => undefined);
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
