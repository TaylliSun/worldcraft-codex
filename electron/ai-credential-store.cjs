const fs = require("node:fs");
const path = require("node:path");

class AiCredentialStore {
  constructor({ filePath, safeStorage }) {
    this.filePath = filePath;
    this.safeStorage = safeStorage;
  }

  encryptionAvailable() {
    try {
      return this.safeStorage.isEncryptionAvailable();
    } catch {
      return false;
    }
  }

  readPayload() {
    try {
      const payload = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
      return payload?.version === 1 && typeof payload.ciphertext === "string" ? payload : null;
    } catch {
      return null;
    }
  }

  status() {
    const payload = this.readPayload();
    return {
      ok: true,
      configured: Boolean(payload),
      encryptionAvailable: this.encryptionAvailable()
    };
  }

  get() {
    const payload = this.readPayload();
    if (!payload) return "";
    if (!this.encryptionAvailable()) throw new Error("System credential encryption is unavailable.");
    try {
      return this.safeStorage.decryptString(Buffer.from(payload.ciphertext, "base64"));
    } catch {
      throw new Error("The saved AI credential could not be decrypted for this Windows user.");
    }
  }

  save(value) {
    const secret = String(value ?? "").trim();
    if (!secret) throw new Error("API Key is empty.");
    if (secret.length > 8192) throw new Error("API Key is too long.");
    if (!this.encryptionAvailable()) throw new Error("System credential encryption is unavailable.");
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const encrypted = this.safeStorage.encryptString(secret);
    const temporary = `${this.filePath}.${process.pid}.tmp`;
    fs.writeFileSync(
      temporary,
      JSON.stringify({ version: 1, ciphertext: encrypted.toString("base64") }),
      { encoding: "utf8", mode: 0o600 }
    );
    fs.renameSync(temporary, this.filePath);
    return this.status();
  }

  clear() {
    fs.rmSync(this.filePath, { force: true });
    return this.status();
  }
}

module.exports = { AiCredentialStore };
