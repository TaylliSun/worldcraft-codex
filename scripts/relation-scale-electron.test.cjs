const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");
const { WorkspaceStore } = require("../electron/workspace-store.cjs");

const root = path.resolve(__dirname, "..");
const runRoot = path.join(root, "validation", `relation-scale-electron-${process.pid}`);
const userDataDir = path.join(runRoot, "user-data");
const executablePath = require("electron");
const generatedEntityCount = 2400;

fs.rmSync(runRoot, { recursive: true, force: true });
fs.mkdirSync(runRoot, { recursive: true });

async function waitForWorkspace(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.locator(".app-shell").waitFor({ state: "visible", timeout: 45000 });
  await page.waitForFunction(() =>
    Boolean(document.querySelector("[role='dialog'][aria-label='选择项目起步包']")) ||
    Boolean(document.querySelector(".compact-save-status")?.textContent?.includes("SQLite"))
  );
  const starterDialog = page.getByRole("dialog", { name: "选择项目起步包", exact: true });
  if (await starterDialog.isVisible()) {
    await starterDialog.getByRole("radio").first().click();
    await starterDialog.getByRole("button", { name: "进入创作台", exact: true }).click();
    await starterDialog.waitFor({ state: "hidden", timeout: 45000 });
  }
}

async function openWorkspace(page, name) {
  const button = page.getByRole("button", { name, exact: true });
  if (!(await button.isVisible())) {
    await page.locator(".rail-more > summary").click();
    await button.waitFor({ state: "visible" });
  }
  await button.click();
}

function seedLargeWorkspace(baseData, entityCount) {
  const data = structuredClone(baseData);
  const world = data.worlds[0];
  const entityTemplate = data.entities.find((item) => item.worldId === world.id);
  if (!entityTemplate) throw new Error("starter data is incomplete");
  const now = new Date().toISOString();
  const types = ["character", "location", "faction", "event", "item", "note"];
  const entities = Array.from({ length: entityCount }, (_, index) => ({
    ...structuredClone(entityTemplate),
    id: `relation-scale-entity-${index}`,
    type: types[index % types.length],
    title: `规模测试条目 ${String(index).padStart(4, "0")}`,
    slug: `relation-scale-${index}`,
    summary: `大型关系图谱压力条目 ${index}`,
    content: "",
    tags: ["关系规模测试"],
    order: index,
    templateData: {},
    updatedAt: now,
    worldId: world.id
  }));
  const relationBase = {
    worldId: world.id,
    evidenceType: "unspecified",
    sourceCitation: "",
    historicalScope: "",
    confidence: "unspecified",
    notes: "",
    updatedAt: now
  };
  const ringRelations = entities.map((entity, index) => ({
    ...relationBase,
    id: `relation-scale-ring-${index}`,
    sourceEntityId: entity.id,
    targetEntityId: entities[(index + 1) % entities.length].id,
    kind: index % 3 === 0 ? "ally" : index % 3 === 1 ? "influence" : "route",
    label: "规模环关系",
    direction: index % 2 === 0 ? "directed" : "undirected",
    strength: (index % 5) + 1
  }));
  const crossRelations = Array.from({ length: Math.floor(entityCount / 2) }, (_, index) => ({
    ...relationBase,
    id: `relation-scale-cross-${index}`,
    sourceEntityId: entities[index].id,
    targetEntityId: entities[(index * 7 + 113) % entities.length].id,
    kind: index % 2 === 0 ? "controls" : "custom",
    label: "规模跨簇关系",
    direction: "directed",
    strength: (index % 4) + 2
  }));
  data.entities.push(...entities);
  data.relations.push(...ringRelations, ...crossRelations);
  return {
    data,
    entityCount: data.entities.filter((item) => item.worldId === world.id).length,
    relationCount: data.relations.filter((item) => item.worldId === world.id).length
  };
}

async function launch(env) {
  const app = await electron.launch({
    executablePath,
    args: ["."],
    cwd: root,
    env,
    timeout: 45000
  });
  const page = await app.firstWindow({ timeout: 45000 });
  await page.setViewportSize({ width: 1440, height: 920 });
  return { app, page };
}

async function main() {
  const env = {
    ...process.env,
    WORLDCRAFT_USER_DATA_DIR: userDataDir
  };
  delete env.ELECTRON_RUN_AS_NODE;

  let app;
  const rendererErrors = [];

  try {
    let page;
    ({ app, page } = await launch(env));
    await waitForWorkspace(page);
    const baseData = await page.evaluate(async () => {
      const loaded = await window.worldcraftStore.loadWorkspace();
      return loaded.data;
    });
    await app.close();
    app = undefined;

    const seeded = seedLargeWorkspace(baseData, generatedEntityCount);
    const store = new WorkspaceStore({
      backupDir: path.join(userDataDir, "backups"),
      dbPath: path.join(userDataDir, "worldcraft-codex.sqlite")
    });
    const saveStats = store.save(seeded.data, "manual");
    store.close();
    assert.ok(saveStats.inserted >= generatedEntityCount + 3600);
    assert.ok(seeded.entityCount >= generatedEntityCount);
    assert.ok(seeded.relationCount >= 3600);

    ({ app, page } = await launch(env));
    page.on("console", (message) => {
      if (message.type() === "error") rendererErrors.push(message.text());
    });
    page.on("pageerror", (error) => rendererErrors.push(error.message));
    await waitForWorkspace(page);

    const atlasStartedAt = Date.now();
    await page.getByRole("button", { name: "关系图谱", exact: true }).click();
    await page.locator(".relation-atlas-scroll").waitFor({ state: "visible", timeout: 5000 });
    const atlasOpenMs = Date.now() - atlasStartedAt;
    assert.ok(atlasOpenMs < 3000, `relationship ledger opened in ${atlasOpenMs}ms`);

    const networkStartedAt = Date.now();
    await page.getByRole("button", { name: "全关系图谱", exact: true }).click();
    await page.locator(".relation-network-layout-status").waitFor({ state: "visible", timeout: 5000 });
    await page.waitForFunction(() => document.querySelectorAll(".relation-graph-node").length === 320);
    const networkOpenMs = Date.now() - networkStartedAt;
    assert.ok(networkOpenMs < 4000, `large relationship network opened in ${networkOpenMs}ms`);
    assert.equal(await page.getByLabel("全关系图谱规模", { exact: true }).inputValue(), "320");

    const expandedStartedAt = Date.now();
    await page.getByLabel("全关系图谱规模", { exact: true }).selectOption("640");
    await page.waitForFunction(() => document.querySelectorAll(".relation-graph-node").length === 640);
    const expandedMs = Date.now() - expandedStartedAt;
    assert.ok(expandedMs < 4000, `640-node relationship network rendered in ${expandedMs}ms`);

    const search = page.getByLabel("搜索图中条目", { exact: true });
    await search.fill("规模测试条目 2399");
    await page.getByRole("option").getByText("规模测试条目 2399", { exact: true }).click();
    await page.locator('[data-relation-entity-id="relation-scale-entity-2399"]').waitFor({
      state: "visible",
      timeout: 5000
    });

    const completeStartedAt = Date.now();
    await page.getByLabel("全关系图谱规模", { exact: true }).selectOption("1200");
    await page.waitForFunction(
      (expected) => document.querySelectorAll(".relation-graph-node").length === expected,
      1200
    );
    const completeMs = Date.now() - completeStartedAt;
    assert.ok(completeMs < 8000, `1200-node relationship network rendered in ${completeMs}ms`);
    assert.equal(await page.getByRole("button", { name: "显示更多全关系图谱条目" }).count(), 0);
    const limitNote = page.locator(".relation-graph-limit-note");
    await limitNote.waitFor({ state: "attached", timeout: 5000 });
    const limitNoteText = await limitNote.textContent();
    const graphEntityCount = Number(limitNoteText.match(/搜索可定位全部\s+(\d+)\s+个条目/)?.[1] ?? 0);
    assert.ok(graphEntityCount >= generatedEntityCount, `graph indexed ${graphEntityCount} entities`);

    await page.screenshot({
      path: path.join(runRoot, "relation-scale-core.png"),
      animations: "disabled"
    });

    const ledgerStartedAt = Date.now();
    await openWorkspace(page, "模板");
    await page.getByRole("heading", { name: "模板与资料", exact: true }).waitFor();
    await page.getByRole("button", { name: "资料台账", exact: true }).click();
    const ledgerTable = page.getByRole("table", { name: "设定资料台账", exact: true });
    await ledgerTable.waitFor();
    await page.waitForFunction(() => document.querySelectorAll(".template-ledger-row").length === 120);
    const ledgerOpenMs = Date.now() - ledgerStartedAt;
    assert.ok(ledgerOpenMs < 3000, `large template ledger opened in ${ledgerOpenMs}ms`);
    assert.equal(await ledgerTable.getByRole("row").count(), 121);
    const ledgerMore = page.getByRole("button", { name: "显示更多设定资料条目", exact: true });
    await ledgerMore.click();
    await page.waitForFunction(() => document.querySelectorAll(".template-ledger-row").length === 240);
    const ledgerCountText = await page.locator(".template-ledger-more > span").textContent();
    const ledgerEntityCount = Number(ledgerCountText.match(/\/(\d+)\s+个条目/)?.[1] ?? 0);
    assert.ok(ledgerEntityCount >= generatedEntityCount, `ledger indexed ${ledgerEntityCount} entities`);
    await page.getByLabel("选择当前筛选的全部条目", { exact: true }).click();
    await page.locator(".template-batchbar strong").waitFor();
    assert.equal(await page.locator(".template-batchbar strong").textContent(), `${ledgerEntityCount} 个条目`);
    const ledgerQuery = page.locator('input[placeholder="搜索条目、标签或模板"]');
    await ledgerQuery.fill("规模测试条目 2399");
    await page.waitForFunction(() => document.querySelectorAll(".template-ledger-row").length === 1);
    await page.getByText("规模测试条目 2399", { exact: true }).waitFor();

    await page.screenshot({
      path: path.join(runRoot, "template-ledger-scale.png"),
      animations: "disabled"
    });
    assert.deepEqual(rendererErrors, [], `renderer errors: ${rendererErrors.join(" | ")}`);
    console.log(JSON.stringify({
      ok: true,
      atlasOpenMs,
      networkOpenMs,
      expandedMs,
      completeMs,
      ledgerOpenMs,
      entities: seeded.entityCount,
      graphEntities: graphEntityCount,
      ledgerEntities: ledgerEntityCount,
      relations: seeded.relationCount
    }));
  } finally {
    if (app) await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
