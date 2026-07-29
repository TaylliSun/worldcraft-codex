const { parentPort, workerData } = require("node:worker_threads");
const { WorkspaceStore } = require("./workspace-store.cjs");

if (!parentPort) {
  throw new Error("Workspace save worker requires a parent port.");
}

const store = new WorkspaceStore({
  dbPath: workerData.dbPath,
  backupDir: workerData.backupDir,
  schemaVersion: workerData.schemaVersion
});

parentPort.on("message", (message) => {
  if (message?.type === "close") {
    store.close();
    parentPort.close();
    return;
  }

  if (message?.type !== "save") return;

  try {
    const result = store.save(message.data, message.reason);
    parentPort.postMessage({ id: message.id, ok: true, result });
  } catch (error) {
    parentPort.postMessage({
      id: message.id,
      ok: false,
      error: error instanceof Error ? error.message : "Workspace save failed."
    });
  }
});

process.on("exit", () => store.close());
