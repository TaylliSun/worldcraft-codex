const { contextBridge, ipcRenderer } = require("electron");
const updateStatusListeners = new Map();
let nextUpdateStatusListenerId = 1;

contextBridge.exposeInMainWorld("worldcraftStore", {
  loadWorkspace: () => ipcRenderer.invoke("store:load"),
  saveWorkspace: (data, reason) => ipcRenderer.invoke("store:save", data, reason),
  createBackup: (data, reason) => ipcRenderer.invoke("store:backup", data, reason),
  createCompleteBackup: (data) => ipcRenderer.invoke("store:completeBackup", data),
  listBackups: () => ipcRenderer.invoke("store:listBackups"),
  cleanupBackups: () => ipcRenderer.invoke("store:cleanupBackups"),
  restoreBackup: (fileName) => ipcRenderer.invoke("store:restoreBackup", fileName),
  revealBackups: () => ipcRenderer.invoke("store:revealBackups"),
  saveProjectAs: (data) => ipcRenderer.invoke("store:saveProjectAs", data),
  openProject: () => ipcRenderer.invoke("store:openProject"),
  importFile: () => ipcRenderer.invoke("store:importFile"),
  listEntityVersions: (entityId) => ipcRenderer.invoke("store:listEntityVersions", entityId),
  listObjectVersions: (collection, itemId) =>
    ipcRenderer.invoke("store:listObjectVersions", collection, itemId),
  listRecentObjectVersions: (worldId, limit) =>
    ipcRenderer.invoke("store:listRecentObjectVersions", worldId, limit),
  getDiagnostics: () => ipcRenderer.invoke("store:diagnostics"),
  rebuildSearchIndex: () => ipcRenderer.invoke("store:rebuildSearchIndex"),
  maintainStorage: () => ipcRenderer.invoke("store:maintainStorage"),
  restoreMigrationBackup: (fileName) =>
    ipcRenderer.invoke("store:restoreMigrationBackup", fileName),
  searchWorkspace: (query, worldId, limit) =>
    ipcRenderer.invoke("store:searchWorkspace", query, worldId, limit),
  importAssets: () => ipcRenderer.invoke("assets:import"),
  storeMapImage: (input) => ipcRenderer.invoke("assets:storeMapImage", input),
  exportMapImage: (input) => ipcRenderer.invoke("maps:exportImage", input),
  exportManuscriptPublication: (input) =>
    ipcRenderer.invoke("manuscript:exportPublication", input),
  exportOfflineWiki: (input) => ipcRenderer.invoke("wiki:exportOffline", input),
  checkAssets: (storedNames) => ipcRenderer.invoke("assets:check", storedNames),
  relinkAsset: (input) => ipcRenderer.invoke("assets:relink", input),
  revealAsset: (storedName) => ipcRenderer.invoke("assets:reveal", storedName),
  revealAssetsFolder: () => ipcRenderer.invoke("assets:revealFolder"),
  trashAsset: (storedName) => ipcRenderer.invoke("assets:trash", storedName),
  explainConsistencyFinding: (settings, prompt) =>
    ipcRenderer.invoke("consistency:explain", settings, prompt),
  getAiCredentialStatus: () => ipcRenderer.invoke("ai:credentialStatus"),
  saveAiCredential: (apiKey) => ipcRenderer.invoke("ai:saveCredential", apiKey),
  clearAiCredential: () => ipcRenderer.invoke("ai:clearCredential"),
  testAiConnection: (settings) => ipcRenderer.invoke("ai:testConnection", settings),
  completeWithAi: (settings, request) => ipcRenderer.invoke("ai:complete", settings, request),
  completeWithAiStream: (settings, request, requestId, onDelta) => {
    const listener = (_event, payload) => {
      if (payload?.requestId === requestId && typeof onDelta === "function") {
        onDelta(String(payload.delta || ""));
      }
    };
    ipcRenderer.on("ai:streamDelta", listener);
    return ipcRenderer
      .invoke("ai:completeStream", settings, request, requestId)
      .finally(() => ipcRenderer.removeListener("ai:streamDelta", listener));
  },
  cancelAiCompletion: (requestId) => ipcRenderer.invoke("ai:cancel", requestId),
  exportDiagnostics: () => ipcRenderer.invoke("diagnostics:export"),
  reportRendererError: (details) => ipcRenderer.invoke("diagnostics:rendererError", details)
});

contextBridge.exposeInMainWorld("worldcraftRelease", {
  getStatus: () => ipcRenderer.invoke("updates:getStatus"),
  setPreferences: (patch) => ipcRenderer.invoke("updates:setPreferences", patch),
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  downloadUpdate: () => ipcRenderer.invoke("updates:download"),
  installUpdate: () => ipcRenderer.invoke("updates:install"),
  acceptLegal: (version) => ipcRenderer.invoke("release:acceptLegal", version),
  openLink: (kind) => ipcRenderer.invoke("release:openLink", kind),
  quit: () => ipcRenderer.invoke("release:quit"),
  subscribeStatus: (callback) => {
    if (typeof callback !== "function") return 0;
    const listenerId = nextUpdateStatusListenerId++;
    const listener = (_event, status) => callback(status);
    updateStatusListeners.set(listenerId, listener);
    ipcRenderer.on("updates:status", listener);
    return listenerId;
  },
  unsubscribeStatus: (listenerId) => {
    const listener = updateStatusListeners.get(Number(listenerId));
    if (!listener) return false;
    ipcRenderer.removeListener("updates:status", listener);
    updateStatusListeners.delete(Number(listenerId));
    return true;
  }
});
