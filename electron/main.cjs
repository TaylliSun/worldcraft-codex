const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  ipcMain,
  protocol,
  safeStorage,
  session,
  shell
} = require("electron");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const { createHash, randomUUID } = require("node:crypto");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { Worker } = require("node:worker_threads");
const {
  COMPRESSED_DATA_BACKUP_SUFFIX,
  DEFAULT_BACKUP_POLICY,
  cleanupBackupDirectory,
  encodeDataBackup,
  inspectBackupDirectory,
  isBackupFileName,
  isCompleteBackupFileName,
  readDataBackup
} = require("./backup-files.cjs");
const {
  explainConsistencyFinding,
  requestAiCompletion,
  requestAiCompletionStream
} = require("./local-model.cjs");
const { AiCredentialStore } = require("./ai-credential-store.cjs");
const {
  createBackupPayload,
  parseWorkspaceJson,
  unwrapWorkspacePayload,
  validateWorkspacePayload
} = require("./project-files.cjs");
const {
  atomicReplaceFile,
  canonicalAssetName,
  createProjectPackage,
  extractProjectPackage,
  hashFile,
  inspectProjectPackage
} = require("./project-package.cjs");
const {
  escapeXml,
  exportManuscriptPublication
} = require("./manuscript-publication.cjs");
const { exportOfflineWiki } = require("./wiki-publication.cjs");
const { WorkspaceStore } = require("./workspace-store.cjs");
const {
  ReleaseLogger,
  buildDiagnosticBundle,
  writeDiagnosticBundle
} = require("./release-diagnostics.cjs");
const { UpdateManager, loadReleaseConfig } = require("./update-manager.cjs");

const userDataOverride = process.env.WORLDCRAFT_USER_DATA_DIR?.trim();
if (userDataOverride) {
  app.setPath("userData", path.resolve(userDataOverride));
}

const isDev = Boolean(process.env.ELECTRON_START_URL);
const appDataVersion = 17;
const releaseLogger = new ReleaseLogger({
  logDir: path.join(app.getPath("userData"), "logs")
});
const aiCredentialStore = new AiCredentialStore({
  filePath: path.join(app.getPath("userData"), "credentials", "ai-key.json"),
  safeStorage
});
let workspaceStore;
let lastBackupAt = 0;
let saveWorker;
let saveWorkerRequestId = 0;
let saveQueueActive = false;
let quitAfterSaves = false;
let allowQuit = false;
let externalWorkspaceLoadDepth = 0;
let updateManager;
let disposeUpdateStatusListener;
const saveWorkerRequests = new Map();
const saveQueue = [];
const saveIdleWaiters = [];
const aiStreamRequests = new Map();

async function renderManuscriptPdf(html, publication) {
  const renderDir = path.join(app.getPath("temp"), "worldcraft-codex-publication");
  const renderPath = path.join(renderDir, `publication-${randomUUID()}.html`);
  await fs.mkdir(renderDir, { recursive: true });
  await fs.writeFile(renderPath, html, "utf8");
  const printWindow = new BrowserWindow({
    backgroundColor: "#ffffff",
    show: false,
    webPreferences: {
      allowRunningInsecureContent: false,
      contextIsolation: true,
      experimentalFeatures: false,
      navigateOnDragDrop: false,
      nodeIntegration: false,
      safeDialogs: true,
      sandbox: true,
      webSecurity: true,
      webviewTag: false
    }
  });
  printWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  const trustedRenderUrl = pathToFileURL(renderPath).href;
  printWindow.webContents.on("will-navigate", (event, targetUrl) => {
    if (targetUrl !== trustedRenderUrl) {
      event.preventDefault();
    }
  });
  try {
    await printWindow.loadFile(renderPath);
    await printWindow.webContents.executeJavaScript(
      "document.fonts ? document.fonts.ready.then(() => true) : true",
      true
    );
    const title = escapeXml(publication.metadata.title);
    return await printWindow.webContents.printToPDF({
      displayHeaderFooter: true,
      footerTemplate: '<div style="box-sizing:border-box;color:#6c746f;font-size:8px;text-align:center;width:100%"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      generateDocumentOutline: true,
      generateTaggedPDF: true,
      headerTemplate: `<div style="box-sizing:border-box;color:#6c746f;font-size:8px;overflow:hidden;padding:0 18mm;text-align:center;text-overflow:ellipsis;white-space:nowrap;width:100%">${title}</div>`,
      landscape: false,
      pageSize: publication.settings.pageSize === "letter" ? "Letter" : "A4",
      preferCSSPageSize: true,
      printBackground: true
    });
  } finally {
    if (!printWindow.isDestroyed()) printWindow.destroy();
    await fs.rm(renderPath, { force: true }).catch(() => undefined);
  }
}

function logRelease(level, event, metadata) {
  releaseLogger.log(level, event, metadata);
}

function isTrustedRendererUrl(value) {
  try {
    const url = new URL(String(value || ""));
    if (isDev) {
      const expected = new URL(process.env.ELECTRON_START_URL);
      return url.origin === expected.origin;
    }
    return url.protocol === "worldcraft:" && url.hostname === "app";
  } catch {
    return false;
  }
}

function isSafeExternalUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function registerTrustedIpcHandle(channel, listener) {
  ipcMain.handle(channel, (event, ...args) => {
    const senderUrl = event.senderFrame?.url || event.sender?.getURL?.() || "";
    if (!isTrustedRendererUrl(senderUrl)) {
      logRelease("warning", "ipc.untrusted-sender");
      throw new Error("Untrusted renderer.");
    }
    return listener(event, ...args);
  });
}

process.on("uncaughtExceptionMonitor", (error) => {
  logRelease("error", "process.uncaught-exception", { error });
});

process.on("unhandledRejection", (reason) => {
  logRelease("error", "process.unhandled-rejection", {
    error: reason instanceof Error ? reason : undefined,
    errorName: reason instanceof Error ? reason.name : "unknown-rejection"
  });
});

protocol.registerSchemesAsPrivileged([
  {
    scheme: "worldcraft",
    privileges: {
      corsEnabled: true,
      standard: true,
      secure: true,
      supportFetchAPI: true
    }
  }
]);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".flac": "audio/flac",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".m4a": "audio/mp4",
  ".md": "text/markdown; charset=utf-8",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".mkv": "video/x-matroska",
  ".ogg": "audio/ogg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".wav": "audio/wav",
  ".webp": "image/webp",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function getOutDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "app.asar", "out");
  }

  return path.join(app.getAppPath(), "out");
}

function getDatabasePath() {
  return path.join(app.getPath("userData"), "worldcraft-codex.sqlite");
}

function getBackupDir() {
  return path.join(app.getPath("userData"), "backups");
}

function getAssetsDir() {
  return path.join(app.getPath("userData"), "assets");
}

async function removeImportedAssetFiles(storedNames) {
  const names = Array.isArray(storedNames) ? storedNames : [];
  await Promise.all(
    names.map(async (storedName) => {
      const filePath = resolveAssetPath(storedName);
      if (filePath) await fs.rm(filePath, { force: true }).catch(() => undefined);
    })
  );
}

function resolveAssetPath(storedName) {
  const safeName = path.basename(String(storedName ?? ""));
  if (!safeName || safeName !== storedName) {
    return null;
  }

  const assetsDir = path.normalize(getAssetsDir());
  const filePath = path.normalize(path.join(assetsDir, safeName));
  return isPathInside(assetsDir, filePath) ? filePath : null;
}

function isPathInside(rootPath, candidatePath) {
  const relative = path.relative(path.resolve(rootPath), path.resolve(candidatePath));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function chooseContentAddressedAssetTarget(sha256, originalName, prefix = "asset") {
  const assetsDir = getAssetsDir();
  await fs.mkdir(assetsDir, { recursive: true });
  const extension = path.extname(path.basename(originalName)).toLowerCase();
  const preferredName = canonicalAssetName(sha256, originalName, prefix);
  const preferredPath = path.join(assetsDir, preferredName);
  if (!fsSync.existsSync(preferredPath)) {
    return { assetsDir, storedName: preferredName, targetPath: preferredPath, reused: false };
  }
  const preferredHash = await hashFile(preferredPath);
  if (preferredHash.sha256 === sha256) {
    return { assetsDir, storedName: preferredName, targetPath: preferredPath, reused: true };
  }
  const fallbackName = `${prefix}-${sha256}${/^\.[a-z0-9]{1,12}$/.test(extension) ? extension : ""}`;
  const fallbackPath = path.join(assetsDir, fallbackName);
  if (!fsSync.existsSync(fallbackPath)) {
    return { assetsDir, storedName: fallbackName, targetPath: fallbackPath, reused: false };
  }
  const fallbackHash = await hashFile(fallbackPath);
  if (fallbackHash.sha256 === sha256) {
    return { assetsDir, storedName: fallbackName, targetPath: fallbackPath, reused: true };
  }
  throw new Error("Asset hash naming collision could not be resolved safely.");
}

async function storeAssetBuffer(buffer, originalName, prefix = "asset") {
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const target = await chooseContentAddressedAssetTarget(sha256, originalName, prefix);
  if (!target.reused) {
    const tempPath = path.join(target.assetsDir, `.asset-${randomUUID()}.tmp`);
    try {
      await fs.writeFile(tempPath, buffer, { flag: "wx" });
      await fs.rename(tempPath, target.targetPath);
    } catch (error) {
      await fs.rm(tempPath, { force: true }).catch(() => undefined);
      throw error;
    }
  }
  return { ...target, sha256, size: buffer.length };
}

async function importAssetFile(sourcePath, prefix = "asset") {
  const source = await hashFile(sourcePath);
  const originalName = path.basename(sourcePath);
  const target = await chooseContentAddressedAssetTarget(source.sha256, originalName, prefix);
  if (!target.reused) {
    const tempPath = path.join(target.assetsDir, `.asset-${randomUUID()}.tmp`);
    try {
      await fs.copyFile(sourcePath, tempPath, fsSync.constants.COPYFILE_EXCL);
      const copied = await hashFile(tempPath);
      if (copied.size !== source.size || copied.sha256 !== source.sha256) {
        throw new Error("Asset changed while it was being imported.");
      }
      await fs.rename(tempPath, target.targetPath);
    } catch (error) {
      await fs.rm(tempPath, { force: true }).catch(() => undefined);
      throw error;
    }
  }
  return { ...target, ...source, originalName };
}

function resolveBackupPath(fileName) {
  const safeName = path.basename(String(fileName ?? ""));
  if (
    !safeName ||
    safeName !== fileName ||
    !isBackupFileName(safeName)
  ) {
    return null;
  }

  const backupDir = path.normalize(getBackupDir());
  const filePath = path.normalize(path.join(backupDir, safeName));
  return filePath.startsWith(backupDir) ? filePath : null;
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function getSafeTimestamp() {
  return getCurrentTimestamp().replace(/[:.]/g, "-");
}

function openDatabase() {
  if (!workspaceStore) {
    workspaceStore = new WorkspaceStore({
      dbPath: getDatabasePath(),
      backupDir: getBackupDir(),
      schemaVersion: appDataVersion,
      now: getCurrentTimestamp
    });
  }
  return workspaceStore.open();
}

function readWorkspaceData() {
  openDatabase();
  return workspaceStore.load();
}

function readEntityVersions(entityId) {
  openDatabase();
  const currentVersions = workspaceStore
    .listObjectVersions("entities", entityId, 12)
    .map((version) => ({
      id: -version.id,
      reason: version.reason,
      createdAt: version.createdAt,
      entity: version.item
    }));
  if (currentVersions.length >= 12) return currentVersions;
  const rows = openDatabase()
    .prepare(
      "SELECT id, reason, data, created_at FROM workspace_snapshots ORDER BY id DESC LIMIT 40"
    )
    .all();
  const signatures = new Set(
    currentVersions.map((version) => {
      const { updatedAt: _updatedAt, ...fields } = version.entity;
      return JSON.stringify(fields);
    })
  );
  const versions = [...currentVersions];

  for (const row of rows) {
    try {
      const workspace = JSON.parse(row.data);
      const entity = workspace.entities?.find((item) => item.id === entityId);
      if (!entity) {
        continue;
      }

      const { updatedAt: _updatedAt, ...versionedFields } = entity;
      const signature = JSON.stringify(versionedFields);
      if (signatures.has(signature)) {
        continue;
      }

      signatures.add(signature);
      versions.push({
        id: row.id,
        reason: row.reason,
        createdAt: row.created_at,
        entity
      });

      if (versions.length >= 12) {
        break;
      }
    } catch {
      // Ignore a damaged historical row while keeping newer snapshots available.
    }
  }

  return versions;
}

function saveResult(result) {
  return {
    ok: true,
    ...result,
    dbPath: getDatabasePath(),
    backupDir: getBackupDir(),
    appVersion: app.getVersion(),
    schemaVersion: appDataVersion
  };
}

function rejectSaveWorkerRequests(error) {
  for (const request of saveWorkerRequests.values()) {
    request.reject(error);
  }
  saveWorkerRequests.clear();
}

function ensureSaveWorker() {
  if (saveWorker) return saveWorker;

  const worker = new Worker(path.join(__dirname, "workspace-save.worker.cjs"), {
    workerData: {
      dbPath: getDatabasePath(),
      backupDir: getBackupDir(),
      schemaVersion: appDataVersion
    }
  });

  worker.on("message", (message) => {
    const request = saveWorkerRequests.get(message?.id);
    if (!request) return;
    saveWorkerRequests.delete(message.id);
    if (message.ok) request.resolve(message.result);
    else request.reject(new Error(message.error || "Workspace save failed."));
  });
  worker.on("error", (error) => {
    logRelease("error", "save-worker.error", { error });
    rejectSaveWorkerRequests(error);
  });
  worker.on("exit", (code) => {
    if (saveWorker === worker) saveWorker = undefined;
    if (code !== 0 && saveWorkerRequests.size) {
      logRelease("error", "save-worker.unexpected-exit", {
        errorCode: `worker-exit-${code}`
      });
      rejectSaveWorkerRequests(new Error(`Workspace save worker exited with code ${code}.`));
    }
  });
  saveWorker = worker;
  return worker;
}

function runWorkspaceSave(data, reason) {
  const worker = ensureSaveWorker();
  const id = ++saveWorkerRequestId;
  return new Promise((resolve, reject) => {
    saveWorkerRequests.set(id, { resolve, reject });
    worker.postMessage({ type: "save", id, data, reason });
  });
}

function resolveSaveIdleWaiters() {
  if (saveQueueActive || saveQueue.length) return;
  for (const resolve of saveIdleWaiters.splice(0)) resolve();

  if (quitAfterSaves && !allowQuit) {
    allowQuit = true;
    void shutdownSaveWorker().finally(() => app.quit());
  }
}

async function drainSaveQueue() {
  if (saveQueueActive) return;
  saveQueueActive = true;

  while (saveQueue.length) {
    const task = saveQueue.shift();
    try {
      const result = await runWorkspaceSave(task.data, task.reason);
      // FTS5 can retain per-connection read state after another connection commits.
      // Reopen lazily so diagnostics and search always observe the worker's latest index.
      workspaceStore?.close();
      for (const waiter of task.waiters) waiter.resolve(saveResult(result));
    } catch (error) {
      logRelease("error", "store.save-failed", { error });
      for (const waiter of task.waiters) waiter.reject(error);
    }
  }

  saveQueueActive = false;
  resolveSaveIdleWaiters();
}

function queueWorkspaceSave(data, reason = "autosave") {
  return new Promise((resolve, reject) => {
    const lastTask = saveQueue.at(-1);
    if (reason === "autosave" && lastTask?.reason === "autosave") {
      lastTask.data = data;
      lastTask.waiters.push({ resolve, reject });
    } else {
      saveQueue.push({ data, reason, waiters: [{ resolve, reject }] });
    }
    void drainSaveQueue();
  });
}

function waitForSaveQueueIdle() {
  if (!saveQueueActive && !saveQueue.length) return Promise.resolve();
  return new Promise((resolve) => saveIdleWaiters.push(resolve));
}

async function shutdownSaveWorker() {
  const worker = saveWorker;
  saveWorker = undefined;
  if (!worker) return;
  worker.postMessage({ type: "close" });
  await worker.terminate();
}

async function createBackup(data, reason = "manual") {
  const backupDir = getBackupDir();
  await fs.mkdir(backupDir, { recursive: true });

  const filename = `worldcraft-codex-${reason}-${getSafeTimestamp()}${COMPRESSED_DATA_BACKUP_SUFFIX}`;
  const filePath = path.join(backupDir, filename);
  const tempPath = path.join(backupDir, `.${filename}.${randomUUID()}.tmp`);
  try {
    const encoded = await encodeDataBackup(
      createBackupPayload(data, {
        schemaVersion: appDataVersion,
        backedUpAt: getCurrentTimestamp(),
        reason
      })
    );
    await fs.writeFile(tempPath, encoded);
    await atomicReplaceFile(tempPath, filePath);
  } catch (error) {
    await fs.rm(tempPath, { force: true }).catch(() => undefined);
    throw error;
  }

  await cleanupBackupDirectory(backupDir, {
    dataLimit: DEFAULT_BACKUP_POLICY.dataLimit,
    completeLimit: Number.MAX_SAFE_INTEGER,
    maxTotalBytes: Number.MAX_SAFE_INTEGER
  });

  lastBackupAt = Date.now();
  return {
    ok: true,
    filePath,
    backupDir
  };
}

async function createCompleteBackup(data) {
  const backupDir = getBackupDir();
  await fs.mkdir(backupDir, { recursive: true });
  const filePath = path.join(
    backupDir,
    `worldcraft-codex-complete-${getSafeTimestamp()}.wcodex`
  );
  const packaged = await createProjectPackage({
    targetPath: filePath,
    data,
    assetsDir: getAssetsDir(),
    schemaVersion: appDataVersion,
    appVersion: app.getVersion(),
    now: getCurrentTimestamp
  });
  await cleanupBackupDirectory(backupDir, {
    dataLimit: Number.MAX_SAFE_INTEGER,
    completeLimit: DEFAULT_BACKUP_POLICY.completeLimit,
    maxTotalBytes: Number.MAX_SAFE_INTEGER
  });
  return {
    ok: true,
    filePath,
    backupDir,
    packageSummary: packaged.summary,
    assetUpdates: packaged.data.assets?.map((asset) => ({
      id: asset.id,
      contentHash: asset.contentHash || "",
      size: asset.size
    })) ?? []
  };
}

function workspaceBackupCounts(data) {
  return {
    worlds: Array.isArray(data.worlds) ? data.worlds.length : 0,
    entityTemplates: Array.isArray(data.entityTemplates) ? data.entityTemplates.length : 0,
    codexCategories: Array.isArray(data.codexCategories) ? data.codexCategories.length : 0,
    entities: Array.isArray(data.entities) ? data.entities.length : 0,
    quests: Array.isArray(data.quests) ? data.quests.length : 0,
    storyScenes: Array.isArray(data.storyScenes) ? data.storyScenes.length : 0,
    storyTestRuns: Array.isArray(data.storyTestRuns) ? data.storyTestRuns.length : 0,
    storyReviewIssues: Array.isArray(data.storyReviewIssues) ? data.storyReviewIssues.length : 0,
    narrativeMilestones: Array.isArray(data.narrativeMilestones)
      ? data.narrativeMilestones.length
      : 0,
    assets: Array.isArray(data.assets) ? data.assets.length : 0,
    maps: Array.isArray(data.maps) ? data.maps.length : 0,
    mapLayers: Array.isArray(data.mapLayers) ? data.mapLayers.length : 0,
    mapMarkerGroups: Array.isArray(data.mapMarkerGroups) ? data.mapMarkerGroups.length : 0,
    mapMarkers: Array.isArray(data.mapMarkers) ? data.mapMarkers.length : 0,
    mapRoutes: Array.isArray(data.mapRoutes) ? data.mapRoutes.length : 0,
    timelineTracks: Array.isArray(data.timelineTracks) ? data.timelineTracks.length : 0,
    timelineEvents: Array.isArray(data.timelineEvents) ? data.timelineEvents.length : 0,
    consistencyFindings: Array.isArray(data.consistencyFindings)
      ? data.consistencyFindings.length
      : 0,
    consistencyScans: Array.isArray(data.consistencyScans) ? data.consistencyScans.length : 0
  };
}

async function createBackupFromCurrent(reason = "manual") {
  await waitForSaveQueueIdle();
  const { data } = readWorkspaceData();
  if (!data) {
    return {
      ok: false,
      error: "No workspace data to back up."
    };
  }

  return createBackup(data, reason);
}

async function createAutomaticBackupIfNeeded(data) {
  const now = Date.now();
  if (!data || now - lastBackupAt < 5 * 60 * 1000) {
    return null;
  }

  return createBackup(data, "auto");
}

async function listBackups() {
  const backupDir = getBackupDir();
  await fs.mkdir(backupDir, { recursive: true });
  const fileNames = (await fs.readdir(backupDir)).filter(isBackupFileName);

  const backups = [];
  for (const fileName of fileNames) {
    const filePath = resolveBackupPath(fileName);
    if (!filePath) continue;
    const stat = await fs.stat(filePath);
    try {
      if (isCompleteBackupFileName(fileName)) {
        const inspected = await inspectProjectPackage({
          filePath,
          verifyAssets: false,
          supportedSchemaVersion: appDataVersion
        });
        backups.push({
          fileName,
          filePath,
          size: stat.size,
          createdAt: inspected.manifest.createdAt || stat.mtime.toISOString(),
          reason: "complete",
          kind: "complete",
          complete: inspected.summary.complete,
          missingAssetCount: inspected.summary.missingAssetCount,
          valid: true,
          counts: workspaceBackupCounts(inspected.data)
        });
      } else {
        const payload = await readDataBackup(filePath);
        const data = unwrapWorkspacePayload(payload) ?? {};
        backups.push({
          fileName,
          filePath,
          size: stat.size,
          createdAt: payload.backedUpAt ?? payload.savedAt ?? stat.mtime.toISOString(),
          reason: payload.reason ?? "manual",
          kind: "data",
          complete: false,
          missingAssetCount: 0,
          valid: true,
          counts: workspaceBackupCounts(data)
        });
      }
    } catch {
      backups.push({
        fileName,
        filePath,
        size: stat.size,
        createdAt: stat.mtime.toISOString(),
        reason: "damaged",
        kind: isCompleteBackupFileName(fileName) ? "complete" : "data",
        complete: false,
        missingAssetCount: 0,
        valid: false,
        counts: workspaceBackupCounts({})
      });
    }
  }

  return backups
    .filter(Boolean)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function backupStorageSummary(inspection) {
  return {
    totalBytes: inspection.totalBytes,
    dataBytes: inspection.dataBytes,
    completeBytes: inspection.completeBytes,
    dataCount: inspection.dataCount,
    completeCount: inspection.completeCount,
    reclaimableBytes: inspection.reclaimableBytes,
    reclaimableCount: inspection.removedEntries.length,
    policy: inspection.policy
  };
}

async function backupListResult() {
  const backupDir = getBackupDir();
  const [backups, inspection] = await Promise.all([
    listBackups(),
    inspectBackupDirectory(backupDir, DEFAULT_BACKUP_POLICY)
  ]);
  return {
    ok: true,
    backups,
    backupDir,
    storage: backupStorageSummary(inspection)
  };
}

function registerStoreIpc() {
  registerTrustedIpcHandle("diagnostics:rendererError", async (_event, details) => {
    logRelease("error", "renderer.error", {
      errorName: details?.errorName || details?.category || "renderer-error"
    });
    return { ok: true };
  });

  registerTrustedIpcHandle("diagnostics:export", async () => {
    try {
      await waitForSaveQueueIdle();
      openDatabase();
      const diagnostics = workspaceStore.diagnostics();
      const workspace = workspaceStore.load().data ?? {};
      const assets = Array.isArray(workspace.assets) ? workspace.assets : [];
      const localFileCount = assets.filter(
        (asset) => asset.storedName && fsSync.existsSync(resolveAssetPath(asset.storedName) ?? "")
      ).length;
      const backupRows = await listBackups();
      const bundle = buildDiagnosticBundle({
        appVersion: app.getVersion(),
        schemaVersion: appDataVersion,
        generatedAt: getCurrentTimestamp(),
        runtime: {
          platform: process.platform,
          architecture: process.arch,
          osRelease: os.release(),
          packaged: app.isPackaged
        },
        diagnostics,
        events: releaseLogger.readRecent(),
        backups: {
          total: backupRows.length,
          valid: backupRows.filter((backup) => backup.valid).length,
          damaged: backupRows.filter((backup) => !backup.valid).length
        },
        assets: {
          metadataCount: assets.length,
          localFileCount,
          missingFileCount: Math.max(0, assets.length - localFileCount)
        }
      });
      const diagnosticOutput = process.env.WORLDCRAFT_DIAGNOSTIC_OUTPUT?.trim();
      const result = diagnosticOutput
        ? { canceled: false, filePath: path.resolve(diagnosticOutput) }
        : await dialog.showSaveDialog({
            title: "导出脱敏诊断包",
            defaultPath: path.join(
              app.getPath("documents"),
              `worldcraft-codex-diagnostics-${getSafeTimestamp()}.json`
            ),
            filters: [{ name: "Worldcraft Codex 诊断包", extensions: ["json"] }]
          });
      if (result.canceled || !result.filePath) return { ok: false, canceled: true };
      const written = writeDiagnosticBundle(result.filePath, bundle);
      logRelease("info", "diagnostics.exported");
      return { ok: true, filePath: written.filePath, bytes: written.bytes };
    } catch (error) {
      logRelease("error", "diagnostics.export-failed", { error });
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Diagnostic export failed."
      };
    }
  });

  registerTrustedIpcHandle("maps:exportImage", async (_event, input) => {
    try {
      const mimeType = String(input?.mimeType ?? "").toLowerCase();
      const format = mimeType === "image/webp" ? "webp" : mimeType === "image/png" ? "png" : "";
      const bytes = input?.bytes;
      const buffer = Buffer.isBuffer(bytes)
        ? bytes
        : bytes instanceof ArrayBuffer
          ? Buffer.from(bytes)
          : ArrayBuffer.isView(bytes)
            ? Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)
            : null;
      if (!format || !buffer?.length) {
        return { ok: false, error: "Map export data is invalid or unsupported." };
      }
      if (buffer.length > 100 * 1024 * 1024) {
        return { ok: false, error: "Map export exceeds the 100 MB limit." };
      }
      const rawName = path.basename(String(input?.suggestedName ?? "worldcraft-map"), path.extname(String(input?.suggestedName ?? "")));
      const safeName = rawName
        .replace(/[<>:\"/\\|?*\u0000-\u001f]/g, "_")
        .replace(/[. ]+$/g, "")
        .trim()
        .slice(0, 120) || "worldcraft-map";
      const configuredOutput = process.env.WORLDCRAFT_MAP_EXPORT_OUTPUT?.trim();
      const result = configuredOutput
        ? { canceled: false, filePath: path.resolve(configuredOutput) }
        : await dialog.showSaveDialog({
            title: "导出高清地图",
            defaultPath: path.join(app.getPath("documents"), `${safeName}.${format}`),
            filters: [{
              name: format === "webp" ? "WebP 图像" : "PNG 图像",
              extensions: [format]
            }]
          });
      if (result.canceled || !result.filePath) return { ok: false, canceled: true };
      const extension = `.${format}`;
      const filePath = path.extname(result.filePath).toLowerCase() === extension
        ? result.filePath
        : `${result.filePath}${extension}`;
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, buffer);
      logRelease("info", "map.exported", { bytes: buffer.length, format });
      return { ok: true, filePath, bytes: buffer.length };
    } catch (error) {
      logRelease("error", "map.export-failed", { error });
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Map export failed."
      };
    }
  });

  registerTrustedIpcHandle("manuscript:exportPublication", async (_event, input) => {
    try {
      const configuredOutput = process.env.WORLDCRAFT_MANUSCRIPT_EXPORT_DIR?.trim();
      const selected = configuredOutput
        ? { canceled: false, filePaths: [path.resolve(configuredOutput)] }
        : await dialog.showOpenDialog({
            title: "选择文稿出版目录",
            defaultPath: app.getPath("documents"),
            properties: ["openDirectory", "createDirectory"]
          });
      if (selected.canceled || !selected.filePaths?.[0]) {
        return { ok: false, canceled: true };
      }
      const selectedRoot = selected.filePaths[0];
      const safeWorldName = String(input?.publication?.world?.name || "Worldcraft")
        .replace(/[<>:\"/\\|?*\u0000-\u001f]/g, "_")
        .replace(/[. ]+$/g, "")
        .trim()
        .slice(0, 80) || "Worldcraft";
      const audience = ["author", "member", "public"].includes(input?.publication?.audience)
        ? input.publication.audience
        : "public";
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const outputDir = configuredOutput
        ? selectedRoot
        : path.join(selectedRoot, `${safeWorldName}-offline-wiki-${audience}-${stamp}`);
      await fs.mkdir(outputDir, { recursive: true });
      const result = await exportManuscriptPublication({
        assetsDir: getAssetsDir(),
        formats: input?.formats,
        outputDir,
        publication: input?.publication,
        renderPdf: renderManuscriptPdf
      });
      logRelease("info", "manuscript.publication-exported", {
        chapterCount: result.chapterCount,
        coverIncluded: result.coverIncluded,
        formats: result.files.map((file) => file.format)
      });
      return { ok: true, outputDir, ...result };
    } catch (error) {
      logRelease("error", "manuscript.publication-export-failed", { error });
      return {
        ok: false,
        error: error instanceof Error ? error.message : "文稿出版失败。"
      };
    }
  });

  registerTrustedIpcHandle("wiki:exportOffline", async (_event, input) => {
    try {
      const configuredOutput = process.env.WORLDCRAFT_WIKI_EXPORT_DIR?.trim();
      const selected = configuredOutput
        ? { canceled: false, filePaths: [path.resolve(configuredOutput)] }
        : await dialog.showOpenDialog({
            title: "选择离线 Wiki 导出目录",
            defaultPath: app.getPath("documents"),
            properties: ["openDirectory", "createDirectory"]
          });
      if (selected.canceled || !selected.filePaths?.[0]) {
        return { ok: false, canceled: true };
      }
      const outputDir = selected.filePaths[0];
      await fs.mkdir(outputDir, { recursive: true });
      const result = await exportOfflineWiki({
        assetsDir: getAssetsDir(),
        outputDir,
        publication: input?.publication
      });
      logRelease("info", "wiki.offline-exported", {
        audience: input?.publication?.audience,
        assetCount: result.assetCount,
        entityCount: result.entityCount,
        missingAssetCount: result.missingAssets.length
      });
      return { ok: true, outputDir, ...result };
    } catch (error) {
      logRelease("error", "wiki.offline-export-failed", { error });
      return {
        ok: false,
        error: error instanceof Error ? error.message : "离线 Wiki 导出失败。"
      };
    }
  });

  registerTrustedIpcHandle("store:load", async () => {
    await waitForSaveQueueIdle();
    const result = readWorkspaceData();
    return {
      ...result,
      dbPath: getDatabasePath(),
      backupDir: getBackupDir(),
      version: appDataVersion,
      schemaVersion: appDataVersion,
      appVersion: app.getVersion()
    };
  });

  registerTrustedIpcHandle("store:listEntityVersions", async (_event, entityId) => ({
    ok: true,
    versions: readEntityVersions(String(entityId ?? ""))
  }));

  registerTrustedIpcHandle("store:listObjectVersions", async (_event, collection, itemId) => ({
    ok: true,
    versions: workspaceStore.listObjectVersions(
      String(collection ?? ""),
      String(itemId ?? "")
    )
  }));

  registerTrustedIpcHandle("store:listRecentObjectVersions", async (_event, worldId, limit) => ({
    ok: true,
    versions: workspaceStore.listRecentVersions(
      String(worldId ?? ""),
      Number(limit) || 80
    )
  }));

  registerTrustedIpcHandle("store:diagnostics", async () => {
    await waitForSaveQueueIdle();
    return {
      ok: true,
      diagnostics: workspaceStore.diagnostics()
    };
  });

  registerTrustedIpcHandle("store:rebuildSearchIndex", async () =>
    workspaceStore.rebuildSearchIndex()
  );

  registerTrustedIpcHandle("store:maintainStorage", async () => {
    try {
      await waitForSaveQueueIdle();
      const safetyBackup = await createBackupFromCurrent("before-storage-maintenance");
      await shutdownSaveWorker();
      const result = workspaceStore.maintainStorage();
      logRelease("info", "storage.maintenance-complete", {
        reclaimedBytes: result.reclaimedBytes,
        snapshotsRemoved: result.snapshotsRemoved,
        versionsRemoved: result.versionsRemoved
      });
      return {
        ok: true,
        ...result,
        safetyBackup: safetyBackup.filePath,
        diagnostics: workspaceStore.diagnostics()
      };
    } catch (error) {
      logRelease("error", "storage.maintenance-failed", { error });
      return {
        ok: false,
        error: error instanceof Error ? error.message : "数据库历史无法整理。"
      };
    }
  });

  registerTrustedIpcHandle("store:restoreMigrationBackup", async (_event, fileName) => {
    try {
      await waitForSaveQueueIdle();
      await shutdownSaveWorker();
      const result = workspaceStore.restoreMigrationBackup(String(fileName ?? ""));
      return {
        ...result,
        dbPath: getDatabasePath(),
        backupDir: getBackupDir(),
        version: appDataVersion,
        schemaVersion: appDataVersion,
        appVersion: app.getVersion()
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Migration rollback failed."
      };
    }
  });

  registerTrustedIpcHandle("store:searchWorkspace", async (_event, query, worldId, limit) => ({
    ok: true,
    results: workspaceStore.search(
      String(query ?? ""),
      String(worldId ?? ""),
      Number(limit) || 60
    )
  }));

  registerTrustedIpcHandle("store:save", async (_event, data, reason = "autosave") => {
    if (externalWorkspaceLoadDepth > 0) {
      return {
        ok: true,
        skipped: true,
        dbPath: getDatabasePath(),
        backupDir: getBackupDir(),
        updatedAt: readWorkspaceData().updatedAt
      };
    }
    const result = await queueWorkspaceSave(data, reason);
    await createAutomaticBackupIfNeeded(data);
    return result;
  });

  registerTrustedIpcHandle("store:backup", async (_event, data, reason = "manual") => {
    const payload = data ?? readWorkspaceData().data;
    if (!payload) {
      return { ok: false, error: "No workspace data to back up." };
    }
    const allowedReasons = new Set([
      "manual",
      "ai-operation",
      "ai-operation-undo",
      "ai-inline-edit",
      "ai-inline-undo",
      "ai-content-apply"
    ]);
    return createBackup(payload, allowedReasons.has(reason) ? reason : "manual");
  });

  registerTrustedIpcHandle("store:completeBackup", async (_event, data) => {
    const payload = data ?? readWorkspaceData().data;
    if (!payload) return { ok: false, error: "No workspace data to back up." };
    try {
      const result = await createCompleteBackup(payload);
      logRelease("info", "backup.complete-created", {
        assetCount: result.packageSummary.assetCount,
        missingAssetCount: result.packageSummary.missingAssetCount,
        packageBytes: result.packageSummary.packageBytes
      });
      return result;
    } catch (error) {
      logRelease("error", "backup.complete-failed", { error });
      return {
        ok: false,
        error: error instanceof Error ? error.message : "完整备份无法创建。"
      };
    }
  });

  registerTrustedIpcHandle("store:listBackups", async () => backupListResult());

  registerTrustedIpcHandle("store:cleanupBackups", async () => {
    try {
      const cleanup = await cleanupBackupDirectory(getBackupDir(), DEFAULT_BACKUP_POLICY);
      logRelease("info", "backup.cleanup-complete", {
        removedCount: cleanup.removed.length,
        removedBytes: cleanup.removedBytes
      });
      return {
        ...(await backupListResult()),
        removedCount: cleanup.removed.length,
        removedBytes: cleanup.removedBytes
      };
    } catch (error) {
      logRelease("error", "backup.cleanup-failed", { error });
      return {
        ok: false,
        backups: [],
        error: error instanceof Error ? error.message : "旧备份无法清理。"
      };
    }
  });

  registerTrustedIpcHandle("ai:credentialStatus", async () => aiCredentialStore.status());

  registerTrustedIpcHandle("ai:saveCredential", async (_event, apiKey) => {
    try {
      const result = aiCredentialStore.save(apiKey);
      logRelease("info", "ai.credential-saved");
      return result;
    } catch (error) {
      logRelease("error", "ai.credential-save-failed", { error });
      return { ok: false, error: error instanceof Error ? error.message : "Credential save failed." };
    }
  });

  registerTrustedIpcHandle("ai:clearCredential", async () => {
    const result = aiCredentialStore.clear();
    logRelease("info", "ai.credential-cleared");
    return result;
  });

  registerTrustedIpcHandle("ai:testConnection", async (_event, settings) => {
    try {
      const result = await requestAiCompletion(
        { ...settings, enabled: true },
        {
          systemPrompt: "You are a connection test. Follow the user instruction exactly.",
          prompt: "只回复：连接成功",
          maxTokens: 128
        },
        aiCredentialStore.get()
      );
      logRelease(result.ok ? "info" : "error", result.ok ? "ai.connection-ok" : "ai.connection-failed");
      return result;
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "AI connection failed." };
    }
  });

  registerTrustedIpcHandle("ai:complete", async (_event, settings, request) => {
    try {
      const result = await requestAiCompletion(settings, request, aiCredentialStore.get());
      logRelease(result.ok ? "info" : "error", result.ok ? "ai.completion-ok" : "ai.completion-failed");
      return result;
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "AI request failed." };
    }
  });

  registerTrustedIpcHandle("ai:completeStream", async (event, settings, request, rawRequestId) => {
    const requestId = String(rawRequestId || randomUUID()).trim().slice(0, 120);
    if (!/^[A-Za-z0-9:_-]+$/.test(requestId)) {
      return { ok: false, error: "Invalid AI stream request id." };
    }
    const key = `${event.sender.id}:${requestId}`;
    if (aiStreamRequests.has(key)) {
      return { ok: false, error: "AI stream request id is already active." };
    }
    const controller = new AbortController();
    aiStreamRequests.set(key, controller);
    try {
      const result = await requestAiCompletionStream(
        settings,
        request,
        aiCredentialStore.get(),
        {
          signal: controller.signal,
          onDelta: (delta) => {
            if (!event.sender.isDestroyed()) {
              event.sender.send("ai:streamDelta", { requestId, delta });
            }
          }
        }
      );
      logRelease(
        result.cancelled ? "info" : result.ok ? "info" : "error",
        result.cancelled
          ? "ai.stream-cancelled"
          : result.ok
            ? "ai.stream-ok"
            : "ai.stream-failed"
      );
      return result;
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "AI stream failed." };
    } finally {
      aiStreamRequests.delete(key);
    }
  });

  registerTrustedIpcHandle("ai:cancel", (event, rawRequestId) => {
    const requestId = String(rawRequestId || "").trim().slice(0, 120);
    const controller = aiStreamRequests.get(`${event.sender.id}:${requestId}`);
    if (!controller) return { ok: false, error: "AI stream is not active." };
    controller.abort();
    return { ok: true };
  });

  registerTrustedIpcHandle("consistency:explain", async (_event, settings, prompt) => {
    try {
      return await explainConsistencyFinding(settings, prompt, aiCredentialStore.get());
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "AI request failed." };
    }
  });

  registerTrustedIpcHandle("store:restoreBackup", async (_event, fileName) => {
    externalWorkspaceLoadDepth += 1;
    let installedStoredNames = [];
    try {
      const filePath = resolveBackupPath(String(fileName ?? ""));
      if (!filePath || !fsSync.existsSync(filePath)) {
        return { ok: false, error: "Backup file was not found." };
      }
      let data;
      let packageSummary;
      if (isCompleteBackupFileName(filePath)) {
        const extracted = await extractProjectPackage({
          filePath,
          assetsDir: getAssetsDir(),
          supportedSchemaVersion: appDataVersion
        });
        data = extracted.data;
        packageSummary = extracted.summary;
        installedStoredNames = extracted.installedStoredNames;
      } else {
        data = validateWorkspacePayload(await readDataBackup(filePath));
      }
      await createBackupFromCurrent("before-restore");
      const result = await queueWorkspaceSave(data, "restore-backup");
      return {
        ...result,
        data,
        fileName: path.basename(filePath),
        packageSummary
      };
    } catch (error) {
      await removeImportedAssetFiles(installedStoredNames);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Backup data could not be read."
      };
    } finally {
      externalWorkspaceLoadDepth = Math.max(0, externalWorkspaceLoadDepth - 1);
    }
  });

  registerTrustedIpcHandle("store:revealBackups", async () => {
    const backupDir = getBackupDir();
    await fs.mkdir(backupDir, { recursive: true });
    const error = await shell.openPath(backupDir);
    return { ok: !error, backupDir, error: error || undefined };
  });

  registerTrustedIpcHandle("store:saveProjectAs", async (_event, data) => {
    const configuredOutput = process.env.WORLDCRAFT_PROJECT_SAVE_OUTPUT?.trim();
    const result = configuredOutput
      ? { canceled: false, filePath: path.resolve(configuredOutput) }
      : await dialog.showSaveDialog({
          title: "保存完整 Worldcraft Codex 工程包",
          defaultPath: "Worldcraft Project.wcodex",
          filters: [{ name: "Worldcraft Codex 完整工程包", extensions: ["wcodex"] }]
        });

    if (result.canceled || !result.filePath) {
      return { ok: false, canceled: true };
    }
    const filePath = result.filePath.toLowerCase().endsWith(".wcodex")
      ? result.filePath
      : `${result.filePath}.wcodex`;
    try {
      const packaged = await createProjectPackage({
        targetPath: filePath,
        data,
        assetsDir: getAssetsDir(),
        schemaVersion: appDataVersion,
        appVersion: app.getVersion(),
        now: getCurrentTimestamp
      });
      logRelease("info", "project.package-saved", {
        assetCount: packaged.summary.assetCount,
        embeddedAssetCount: packaged.summary.embeddedAssetCount,
        missingAssetCount: packaged.summary.missingAssetCount,
        packageBytes: packaged.summary.packageBytes
      });
      return {
        ok: true,
        filePath,
        format: "package",
        packageSummary: packaged.summary,
        assetUpdates: packaged.data.assets?.map((asset) => ({
          id: asset.id,
          contentHash: asset.contentHash || "",
          size: asset.size
        })) ?? []
      };
    } catch (error) {
      logRelease("error", "project.package-save-failed", { error });
      return {
        ok: false,
        error: error instanceof Error ? error.message : "完整工程包无法保存。"
      };
    }
  });

  registerTrustedIpcHandle("store:openProject", async () => {
    externalWorkspaceLoadDepth += 1;
    let installedStoredNames = [];
    try {
      const configuredInput = process.env.WORLDCRAFT_PROJECT_OPEN_INPUT?.trim();
      const result = configuredInput
        ? { canceled: false, filePaths: [path.resolve(configuredInput)] }
        : await dialog.showOpenDialog({
            title: "打开 Worldcraft Codex 项目",
            properties: ["openFile"],
            filters: [
              { name: "Worldcraft Codex 工程", extensions: ["wcodex", "wcodex.json", "json"] },
              { name: "完整工程包", extensions: ["wcodex"] },
              { name: "旧版 JSON 项目", extensions: ["wcodex.json", "json"] }
            ]
          });
      if (result.canceled || !result.filePaths[0]) return { ok: false, canceled: true };
      const filePath = result.filePaths[0];
      let data;
      let packageSummary;
      let format = "legacy-json";
      if (path.extname(filePath).toLowerCase() === ".wcodex") {
        const extracted = await extractProjectPackage({
          filePath,
          assetsDir: getAssetsDir(),
          supportedSchemaVersion: appDataVersion
        });
        data = extracted.data;
        packageSummary = extracted.summary;
        installedStoredNames = extracted.installedStoredNames;
        format = "package";
      } else {
        data = parseWorkspaceJson(await fs.readFile(filePath, "utf8"));
      }
      await createBackupFromCurrent("before-open");
      await queueWorkspaceSave(data, format === "package" ? "open-project-package" : "open-project-json");
      logRelease("info", "project.opened", {
        format,
        assetCount: packageSummary?.assetCount,
        missingAssetCount: packageSummary?.missingAssetCount,
        importedFileCount: packageSummary?.importedFileCount,
        reusedFileCount: packageSummary?.reusedFileCount
      });
      return { ok: true, filePath, data, format, packageSummary };
    } catch (error) {
      await removeImportedAssetFiles(installedStoredNames);
      logRelease("error", "project.open-failed", { error });
      return {
        ok: false,
        error: error instanceof Error ? error.message : "项目文件无法打开。"
      };
    } finally {
      externalWorkspaceLoadDepth = Math.max(0, externalWorkspaceLoadDepth - 1);
    }
  });

  registerTrustedIpcHandle("store:importFile", async () => {
    const result = await dialog.showOpenDialog({
      title: "导入 Worldcraft Codex 内容",
      properties: ["openFile"],
      filters: [
        { name: "支持的内容文件", extensions: ["json", "md", "markdown"] },
        { name: "JSON", extensions: ["json"] },
        { name: "Markdown", extensions: ["md", "markdown"] }
      ]
    });

    if (result.canceled || !result.filePaths[0]) {
      return { ok: false, canceled: true };
    }

    const filePath = result.filePaths[0];
    const extension = path.extname(filePath).toLowerCase();
    const content = await fs.readFile(filePath, "utf8");

    return {
      ok: true,
      filePath,
      fileName: path.basename(filePath),
      format: extension === ".json" ? "json" : "markdown",
      content
    };
  });

  registerTrustedIpcHandle("assets:storeMapImage", async (_event, input) => {
    const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
    const extensionByMime = {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "image/svg+xml": ".svg"
    };
    const storageName = path.basename(String(input?.name ?? "map-image"));
    const originalName = path.basename(String(input?.originalName ?? storageName));
    const requestedExtension = path.extname(storageName).toLowerCase();
    const mimeType = String(input?.mimeType ?? "").split(";")[0].trim().toLowerCase();
    const extension = imageExtensions.has(requestedExtension)
      ? requestedExtension
      : extensionByMime[mimeType];
    const bytes = input?.bytes;
    const buffer = Buffer.isBuffer(bytes)
      ? bytes
      : bytes instanceof ArrayBuffer
        ? Buffer.from(bytes)
        : ArrayBuffer.isView(bytes)
          ? Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)
          : null;

    if (!extension || !buffer?.length) {
      return { ok: false, error: "Map image data is invalid or unsupported." };
    }
    if (buffer.length > 24 * 1024 * 1024) {
      return { ok: false, error: "Map image exceeds the 24 MB limit." };
    }

    const stored = await storeAssetBuffer(buffer, `map-image${extension}`, "map");
    const createdAt = getCurrentTimestamp();
    return {
      ok: true,
      assets: [{
        id: `asset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        name: path.basename(originalName, path.extname(originalName)),
        storedName: stored.storedName,
        originalName,
        kind: "map",
        mimeType: mimeTypes[extension]?.split(";")[0] ?? mimeType,
        size: stored.size,
        contentHash: stored.sha256,
        createdAt
      }],
      assetsDir: stored.assetsDir,
      reusedFileCount: stored.reused ? 1 : 0
    };
  });

  registerTrustedIpcHandle("assets:import", async () => {
    const result = await dialog.showOpenDialog({
      title: "导入 Worldcraft Codex 资源",
      properties: ["openFile", "multiSelections"],
      filters: [
        {
          name: "图片、视频、音频与资料",
          extensions: [
            "png",
            "jpg",
            "jpeg",
            "webp",
            "gif",
            "svg",
            "mp4",
            "webm",
            "mov",
            "mkv",
            "mp3",
            "wav",
            "ogg",
            "flac",
            "m4a",
            "pdf",
            "txt",
            "md",
            "json"
          ]
        },
        { name: "图片", extensions: ["png", "jpg", "jpeg", "webp", "gif", "svg"] },
        { name: "视频", extensions: ["mp4", "webm", "mov", "mkv"] },
        { name: "音频", extensions: ["mp3", "wav", "ogg", "flac", "m4a"] },
        { name: "所有文件", extensions: ["*"] }
      ]
    });

    if (result.canceled || !result.filePaths.length) {
      return { ok: false, canceled: true, assets: [] };
    }

    const audioExtensions = new Set([".mp3", ".wav", ".ogg", ".flac", ".m4a"]);
    const videoExtensions = new Set([".mp4", ".webm", ".mov", ".mkv"]);
    const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
    const importedAt = getCurrentTimestamp();
    const assets = [];
    let reusedFileCount = 0;

    for (const sourcePath of result.filePaths) {
      const extension = path.extname(sourcePath).toLowerCase();
      const baseName = path.basename(sourcePath, extension);
      const stored = await importAssetFile(sourcePath);
      if (stored.reused) reusedFileCount += 1;
      assets.push({
        id: `asset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        name: baseName,
        storedName: stored.storedName,
        originalName: path.basename(sourcePath),
        kind: audioExtensions.has(extension)
          ? "audio"
          : videoExtensions.has(extension)
            ? "video"
          : imageExtensions.has(extension)
            ? "image"
            : "document",
        mimeType: mimeTypes[extension]?.split(";")[0] ?? "application/octet-stream",
        size: stored.size,
        contentHash: stored.sha256,
        createdAt: importedAt
      });
    }

    return { ok: true, assets, assetsDir: getAssetsDir(), reusedFileCount };
  });

  registerTrustedIpcHandle("assets:reveal", async (_event, storedName) => {
    const filePath = resolveAssetPath(storedName);
    if (!filePath || !fsSync.existsSync(filePath)) {
      return { ok: false, error: "Asset file was not found." };
    }
    shell.showItemInFolder(filePath);
    return { ok: true, filePath };
  });

  registerTrustedIpcHandle("assets:check", async (_event, storedAssets) => {
    const requested = Array.isArray(storedAssets) ? storedAssets.slice(0, 10000) : [];
    const byName = new Map();
    requested.forEach((item) => {
      const descriptor = typeof item === "string" ? { storedName: item } : item ?? {};
      const storedName = String(descriptor.storedName ?? "");
      if (!byName.has(storedName) || descriptor.contentHash) {
        byName.set(storedName, {
          storedName,
          expectedHash: /^[a-f0-9]{64}$/i.test(String(descriptor.contentHash ?? ""))
            ? String(descriptor.contentHash).toLowerCase()
            : "",
          expectedSize: Number.isFinite(Number(descriptor.size)) ? Number(descriptor.size) : undefined
        });
      }
    });
    const files = [];
    for (const descriptor of byName.values()) {
      const { storedName, expectedHash, expectedSize } = descriptor;
      const filePath = resolveAssetPath(storedName);
      if (!filePath) {
        files.push({ storedName, exists: false, hashMatches: false, sizeMatches: false });
        continue;
      }
      try {
        const stat = await fs.stat(filePath);
        if (!stat.isFile()) {
          files.push({ storedName, exists: false, hashMatches: false, sizeMatches: false });
          continue;
        }
        const actual = expectedHash ? await hashFile(filePath) : null;
        files.push({
          storedName,
          exists: true,
          size: stat.size,
          modifiedAt: stat.mtime.toISOString(),
          contentHash: actual?.sha256,
          hashMatches: expectedHash ? actual?.sha256 === expectedHash : undefined,
          sizeMatches: expectedSize === undefined ? undefined : stat.size === expectedSize
        });
      } catch {
        files.push({ storedName, exists: false, hashMatches: false, sizeMatches: false });
      }
    }

    return { ok: true, files, assetsDir: getAssetsDir() };
  });

  registerTrustedIpcHandle("assets:relink", async (_event, input) => {
    const configuredInput = process.env.WORLDCRAFT_ASSET_RELINK_INPUT?.trim();
    const result = configuredInput
      ? { canceled: false, filePaths: [path.resolve(configuredInput)] }
      : await dialog.showOpenDialog({
          title: input?.missing ? "重定位缺失资源" : "替换资源文件",
          properties: ["openFile"],
          filters: [{ name: "所有文件", extensions: ["*"] }]
        });
    if (result.canceled || !result.filePaths[0]) return { ok: false, canceled: true };
    try {
      const sourcePath = result.filePaths[0];
      const source = await hashFile(sourcePath);
      const expectedHash = /^[a-f0-9]{64}$/i.test(String(input?.contentHash ?? ""))
        ? String(input.contentHash).toLowerCase()
        : "";
      if (expectedHash && expectedHash !== source.sha256) {
        const confirmation = await dialog.showMessageBox({
          type: "warning",
          title: "文件内容与原资源不同",
          message: "所选文件的 SHA-256 与项目记录不一致。",
          detail: "继续会把它作为新的替换文件，并更新项目中的完整性记录。",
          buttons: ["取消", "仍然替换"],
          defaultId: 0,
          cancelId: 0,
          noLink: true
        });
        if (confirmation.response !== 1) return { ok: false, canceled: true };
      }
      const stored = await importAssetFile(sourcePath);
      return {
        ok: true,
        asset: {
          storedName: stored.storedName,
          originalName: stored.originalName,
          mimeType: mimeTypes[path.extname(sourcePath).toLowerCase()]?.split(";")[0] ?? "application/octet-stream",
          size: stored.size,
          contentHash: stored.sha256
        },
        assetsDir: stored.assetsDir,
        reusedFileCount: stored.reused ? 1 : 0,
        hashMatchedExpected: !expectedHash || expectedHash === stored.sha256
      };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "资源文件无法导入。" };
    }
  });

  registerTrustedIpcHandle("assets:revealFolder", async () => {
    const assetsDir = getAssetsDir();
    await fs.mkdir(assetsDir, { recursive: true });
    const error = await shell.openPath(assetsDir);
    return { ok: !error, assetsDir, error: error || undefined };
  });

  registerTrustedIpcHandle("assets:trash", async (_event, storedName) => {
    const filePath = resolveAssetPath(storedName);
    if (!filePath || !fsSync.existsSync(filePath)) {
      return { ok: true, missing: true };
    }
    await shell.trashItem(filePath);
    return { ok: true, filePath };
  });
}

function createReleaseUpdateManager() {
  const loaded = loadReleaseConfig({
    appVersion: app.getVersion(),
    resourcesPath: process.resourcesPath,
    appPath: app.getAppPath(),
    overridePath: process.env.WORLDCRAFT_RELEASE_CONFIG?.trim()
  });
  updateManager = new UpdateManager({
    appVersion: app.getVersion(),
    config: loaded.config,
    preferencesPath: path.join(app.getPath("userData"), "release-preferences.json"),
    isPackaged: app.isPackaged,
    platform: process.platform,
    portable: Boolean(process.env.PORTABLE_EXECUTABLE_FILE),
    diskSpacePath: app.getPath("temp"),
    createUpdater: (options) => {
      const { NsisUpdater } = require("electron-updater");
      return new NsisUpdater(options);
    },
    beforeInstall: async () => {
      await waitForSaveQueueIdle();
      await shutdownSaveWorker();
      workspaceStore?.close();
      allowQuit = true;
    },
    log: logRelease
  });
  disposeUpdateStatusListener = updateManager.onStatus((status) => {
    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) window.webContents.send("updates:status", status);
    }
  });
  logRelease("info", loaded.filePath ? "release.config-loaded" : "release.config-missing");
  return updateManager;
}

function registerReleaseIpc() {
  registerTrustedIpcHandle("updates:getStatus", () => updateManager.getStatus());
  registerTrustedIpcHandle("updates:setPreferences", (_event, patch) =>
    updateManager.setPreferences(patch)
  );
  registerTrustedIpcHandle("updates:check", () => updateManager.checkForUpdates());
  registerTrustedIpcHandle("updates:download", () => updateManager.downloadUpdate());
  registerTrustedIpcHandle("updates:install", () => updateManager.installUpdate());
  registerTrustedIpcHandle("release:acceptLegal", (_event, version) =>
    updateManager.acceptLegal(version)
  );
  registerTrustedIpcHandle("release:openLink", async (_event, kind) => {
    const links = updateManager.getStatus().links;
    const url = links?.[String(kind || "")];
    if (!isSafeExternalUrl(url)) return { ok: false, error: "Release link is unavailable." };
    await shell.openExternal(url);
    return { ok: true };
  });
  registerTrustedIpcHandle("release:quit", () => {
    app.quit();
    return { ok: true };
  });
}

const applicationCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: worldcraft:",
  "media-src 'self' blob: worldcraft:",
  "font-src 'self' data:",
  "connect-src 'self' worldcraft:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'"
].join("; ");

function responseHeaders(contentType, extra = {}) {
  return {
    "content-type": contentType,
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    ...(String(contentType).startsWith("text/html")
      ? { "content-security-policy": applicationCsp }
      : {}),
    ...extra
  };
}

function createNotFound() {
  return new Response("Not found", {
    status: 404,
    headers: responseHeaders("text/plain; charset=utf-8")
  });
}

async function registerLocalProtocol() {
  const outDir = getOutDir();

  protocol.handle("worldcraft", async (request) => {
    const requestUrl = new URL(request.url);
    let pathname = decodeURIComponent(requestUrl.pathname);

    if (requestUrl.hostname === "asset") {
      const storedName = pathname.replace(/^\/+/, "");
      const filePath = resolveAssetPath(storedName);
      if (!filePath) {
        return createNotFound();
      }

      try {
        const body = await fs.readFile(filePath);
        const contentType =
          mimeTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
        return new Response(body, {
          headers: responseHeaders(contentType, {
            "access-control-allow-origin": "worldcraft://app",
            "cache-control": "private, max-age=3600"
          })
        });
      } catch {
        return createNotFound();
      }
    }

    if (!pathname || pathname === "/") {
      pathname = "/index.html";
    }

    let filePath = path.normalize(path.join(outDir, pathname));

    if (!isPathInside(outDir, filePath)) {
      return createNotFound();
    }

    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
    } catch {
      if (!path.extname(filePath)) {
        filePath = path.join(filePath, "index.html");
      }
    }

    if (!isPathInside(outDir, filePath)) {
      return createNotFound();
    }

    try {
      const body = await fs.readFile(filePath);
      const contentType = mimeTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";

      return new Response(body, {
        headers: responseHeaders(contentType)
      });
    } catch {
      return createNotFound();
    }
  });
}

function configureElectronSecurity() {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });
  session.defaultSession.setPermissionCheckHandler(() => false);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1040,
    minHeight: 720,
    title: "Worldcraft Codex",
    icon: path.join(getOutDir(), "icon.png"),
    backgroundColor: "#f4f7f5",
    show: false,
    webPreferences: {
      allowRunningInsecureContent: false,
      contextIsolation: true,
      experimentalFeatures: false,
      navigateOnDragDrop: false,
      nodeIntegration: false,
      safeDialogs: true,
      sandbox: true,
      webSecurity: true,
      webviewTag: false,
      preload: path.join(__dirname, "preload.cjs")
    }
  });

  mainWindow.once("ready-to-show", () => {
    logRelease("info", "window.ready");
    mainWindow.show();
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode) => {
    logRelease("error", "renderer.load-failed", { errorCode: `load-${errorCode}` });
  });

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    logRelease("error", "renderer.process-gone", {
      errorCode: details?.reason || "unknown"
    });
  });

  mainWindow.webContents.on("will-attach-webview", (event) => {
    event.preventDefault();
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isTrustedRendererUrl(url)) return;
    event.preventDefault();
    if (isSafeExternalUrl(url)) void shell.openExternal(url);
  });

  mainWindow.webContents.on("will-redirect", (event, url) => {
    if (!isTrustedRendererUrl(url)) event.preventDefault();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) void shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    mainWindow.loadURL("worldcraft://app/index.html");
  }
  return mainWindow;
}

app.whenReady().then(async () => {
  releaseLogger.initialize();
  logRelease("info", "app.starting");
  Menu.setApplicationMenu(null);
  openDatabase();
  logRelease("info", "database.opened");
  registerStoreIpc();
  createReleaseUpdateManager();
  registerReleaseIpc();
  await registerLocalProtocol();
  configureElectronSecurity();
  createWindow();
  updateManager.scheduleAutoCheck();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch((error) => {
  logRelease("error", "app.start-failed", { error });
  dialog.showErrorBox(
    "Worldcraft Codex 启动失败",
    "本地数据库或应用资源无法打开。请保留用户数据目录并查看日志。"
  );
  app.exit(1);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", (event) => {
  if (!allowQuit && (saveQueueActive || saveQueue.length)) {
    event.preventDefault();
    quitAfterSaves = true;
    return;
  }

  allowQuit = true;
  disposeUpdateStatusListener?.();
  disposeUpdateStatusListener = undefined;
  updateManager?.dispose();
  aiStreamRequests.forEach((controller) => controller.abort());
  aiStreamRequests.clear();
  logRelease("info", "app.quitting");
  workspaceStore?.close();
  if (saveWorker) {
    const worker = saveWorker;
    saveWorker = undefined;
    void worker.terminate();
  }
});
