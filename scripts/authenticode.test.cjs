const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { hasPeCertificateTable, readAuthenticodeSignature } = require("./authenticode.cjs");

const temporaryPath = path.join(__dirname, "..", "validation", "authenticode-" + process.pid + ".exe");
const image = Buffer.alloc(512);
image.write("MZ", 0, "ascii");
image.writeUInt32LE(128, 0x3c);
image.write("PE\0\0", 128, "ascii");
image.writeUInt16LE(0x20b, 128 + 24);
fs.mkdirSync(path.dirname(temporaryPath), { recursive: true });

try {
  fs.writeFileSync(temporaryPath, image);
  assert.equal(hasPeCertificateTable(temporaryPath), false, "unsigned PE has no certificate table");
  assert.equal(readAuthenticodeSignature(temporaryPath).status, "NotSigned", "unsigned PE skips system verification");
  image.writeUInt32LE(400, 128 + 24 + 112 + 4 * 8);
  image.writeUInt32LE(64, 128 + 24 + 112 + 4 * 8 + 4);
  fs.writeFileSync(temporaryPath, image);
  assert.equal(hasPeCertificateTable(temporaryPath), true, "signed PE directory is detected");
  console.log("Authenticode preflight checks passed: 3 assertions.");
} finally {
  fs.rmSync(temporaryPath, { force: true });
}
