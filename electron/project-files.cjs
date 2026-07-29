function unwrapWorkspacePayload(payload) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload;
}

function validateWorkspacePayload(payload) {
  const data = unwrapWorkspacePayload(payload);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Project data is invalid.");
  }
  return data;
}

function parseWorkspaceJson(content) {
  return validateWorkspacePayload(JSON.parse(content));
}

function createProjectPayload(data, { schemaVersion, savedAt }) {
  return {
    app: "Worldcraft Codex",
    version: schemaVersion,
    savedAt,
    data: validateWorkspacePayload(data)
  };
}

function createBackupPayload(data, { schemaVersion, backedUpAt, reason }) {
  return {
    app: "Worldcraft Codex",
    version: schemaVersion,
    backedUpAt,
    reason,
    data: validateWorkspacePayload(data)
  };
}

module.exports = {
  createBackupPayload,
  createProjectPayload,
  parseWorkspaceJson,
  unwrapWorkspacePayload,
  validateWorkspacePayload
};
