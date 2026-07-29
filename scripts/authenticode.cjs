const fs = require("node:fs");
const { spawnSync } = require("node:child_process");

function hasPeCertificateTable(filePath) {
  let descriptor;
  try {
    descriptor = fs.openSync(filePath, "r");
    const dosHeader = Buffer.alloc(64);
    if (fs.readSync(descriptor, dosHeader, 0, dosHeader.length, 0) !== dosHeader.length) return false;
    if (dosHeader.toString("ascii", 0, 2) !== "MZ") return false;
    const peOffset = dosHeader.readUInt32LE(0x3c);
    const peHeader = Buffer.alloc(256);
    if (fs.readSync(descriptor, peHeader, 0, peHeader.length, peOffset) < 192) return false;
    if (peHeader.toString("ascii", 0, 4) !== "PE\0\0") return false;
    const optionalHeaderOffset = 24;
    const magic = peHeader.readUInt16LE(optionalHeaderOffset);
    const dataDirectoryOffset = magic === 0x20b ? 112 : magic === 0x10b ? 96 : 0;
    if (!dataDirectoryOffset) return false;
    const certificateDirectoryOffset = optionalHeaderOffset + dataDirectoryOffset + 4 * 8;
    const certificateFileOffset = peHeader.readUInt32LE(certificateDirectoryOffset);
    const certificateSize = peHeader.readUInt32LE(certificateDirectoryOffset + 4);
    return certificateFileOffset > 0 && certificateSize > 0;
  } catch {
    return false;
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function readAuthenticodeSignature(filePath) {
  if (process.platform !== "win32") return { status: "Unsupported", signed: false, subject: "" };
  if (!hasPeCertificateTable(filePath)) return { status: "NotSigned", signed: false, subject: "" };
  const command = [
    "$s=Get-AuthenticodeSignature -LiteralPath $args[0];",
    "[PSCustomObject]@{Status=[string]$s.Status;Subject=[string]$s.SignerCertificate.Subject}|ConvertTo-Json -Compress"
  ].join(" ");
  const result = spawnSync("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    command,
    filePath
  ], {
    encoding: "utf8",
    timeout: 120000,
    windowsHide: true
  });
  try {
    const parsed = JSON.parse(result.stdout.trim());
    return {
      status: String(parsed.Status || "Unknown"),
      signed: parsed.Status === "Valid",
      subject: String(parsed.Subject || "").slice(0, 300)
    };
  } catch {
    return { status: "Unreadable", signed: false, subject: "" };
  }
}

module.exports = { hasPeCertificateTable, readAuthenticodeSignature };
