const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { AiCredentialStore } = require("../electron/ai-credential-store.cjs");

const root = path.join(__dirname, "..", "validation", `ai-credentials-${process.pid}`);
const filePath = path.join(root, "credentials", "ai-key.json");
fs.rmSync(root, { recursive: true, force: true });

const fakeSafeStorage = {
  isEncryptionAvailable: () => true,
  encryptString: (value) => Buffer.from(`protected:${Buffer.from(value).toString("base64")}`),
  decryptString: (value) =>
    Buffer.from(value.toString().replace(/^protected:/, ""), "base64").toString()
};

try {
  const store = new AiCredentialStore({ filePath, safeStorage: fakeSafeStorage });
  assert.deepEqual(store.status(), { ok: true, configured: false, encryptionAvailable: true });
  assert.equal(store.get(), "");
  assert.equal(store.save("sk-third-party").configured, true);
  assert.equal(store.get(), "sk-third-party");
  const disk = fs.readFileSync(filePath, "utf8");
  assert.equal(disk.includes("sk-third-party"), false);
  assert.equal(JSON.parse(disk).version, 1);
  assert.equal(store.clear().configured, false);
  assert.equal(fs.existsSync(filePath), false);

  const unavailable = new AiCredentialStore({
    filePath,
    safeStorage: { isEncryptionAvailable: () => false }
  });
  assert.throws(() => unavailable.save("secret"), /unavailable/i);
  assert.equal(unavailable.status().encryptionAvailable, false);

  console.log("AI credential checks passed: 10 assertions across 3 scenarios.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
