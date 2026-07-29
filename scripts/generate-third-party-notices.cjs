const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "build", "generated");
const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));

const SPDX_LICENSE_TEXTS = {
  MIT: [
    "MIT License",
    "",
    "Copyright notice: see the package metadata and upstream repository for the applicable copyright holders.",
    "",
    "Permission is hereby granted, free of charge, to any person obtaining a copy",
    "of this software and associated documentation files (the \"Software\"), to deal",
    "in the Software without restriction, including without limitation the rights",
    "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell",
    "copies of the Software, and to permit persons to whom the Software is",
    "furnished to do so, subject to the following conditions:",
    "",
    "The above copyright notice and this permission notice shall be included in all",
    "copies or substantial portions of the Software.",
    "",
    "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR",
    "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,",
    "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE",
    "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER",
    "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,",
    "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE",
    "SOFTWARE."
  ].join("\n")
};

function timestamp() {
  const epoch = Number(process.env.SOURCE_DATE_EPOCH);
  return Number.isFinite(epoch) && epoch > 0
    ? new Date(epoch * 1000).toISOString()
    : new Date().toISOString();
}

function repositoryUrl(value) {
  if (typeof value === "string") return value;
  return typeof value?.url === "string" ? value.url : "";
}

function licenseFile(packageDir) {
  try {
    const match = fs.readdirSync(packageDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .find((name) => /^(licen[cs]e|copying|notice)(\.|$)/i.test(name));
    if (!match) return { name: "", text: "" };
    const text = fs.readFileSync(path.join(packageDir, match), "utf8").slice(0, 250000);
    return { name: match, text };
  } catch {
    return { name: "", text: "" };
  }
}

const packages = [];
const seen = new Set();
for (const [packagePath, metadata] of Object.entries(lock.packages || {})) {
  if (!packagePath.startsWith("node_modules/") || metadata.dev === true) continue;
  const packageDir = path.join(root, ...packagePath.split("/"));
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8"));
  } catch {
    continue;
  }
  const identity = String(packageJson.name || packagePath) + "@" + String(packageJson.version || metadata.version || "");
  if (seen.has(identity)) continue;
  seen.add(identity);
  const declaredLicense = String(packageJson.license || metadata.license || "UNKNOWN");
  const bundledLicense = licenseFile(packageDir);
  const fallbackText = SPDX_LICENSE_TEXTS[declaredLicense] || "";
  const licenseText = bundledLicense.text || fallbackText;
  packages.push({
    name: String(packageJson.name || packagePath),
    version: String(packageJson.version || metadata.version || ""),
    license: declaredLicense,
    homepage: String(packageJson.homepage || ""),
    repository: repositoryUrl(packageJson.repository),
    licenseFile: bundledLicense.name,
    licenseTextSource: bundledLicense.name ? `package:${bundledLicense.name}` : fallbackText ? `spdx:${declaredLicense}` : "missing",
    licenseText
  });
}
packages.sort((left, right) => left.name.localeCompare(right.name) || left.version.localeCompare(right.version));

const textParts = [
  "WORLDCRAFT CODEX THIRD-PARTY NOTICES",
  "",
  "Generated: " + timestamp(),
  "Production packages: " + packages.length,
  "",
  "Worldcraft Codex includes third-party software under the licenses listed below.",
  ""
];
for (const item of packages) {
  textParts.push("=".repeat(78));
  textParts.push(item.name + " " + item.version);
  textParts.push("License: " + item.license);
  if (item.homepage) textParts.push("Homepage: " + item.homepage);
  if (item.repository) textParts.push("Repository: " + item.repository);
  if (item.licenseFile) textParts.push("License file: " + item.licenseFile);
  else if (item.licenseTextSource.startsWith("spdx:")) {
    textParts.push("License text source: SPDX-standard fallback; the installed package did not include a separate license file.");
  }
  textParts.push("");
  textParts.push(item.licenseText || "No license text could be resolved for this package.");
  textParts.push("");
}

const inventory = {
  format: "worldcraft-third-party-inventory-v1",
  generatedAt: timestamp(),
  packageCount: packages.length,
  packages: packages.map(({ licenseText, ...item }) => ({
    ...item,
    licenseTextSha256: licenseText
      ? crypto.createHash("sha256").update(licenseText).digest("hex")
      : ""
  }))
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "THIRD_PARTY_NOTICES.txt"), textParts.join("\n"), "utf8");
fs.writeFileSync(
  path.join(outputDir, "third-party-inventory.json"),
  JSON.stringify(inventory, null, 2) + "\n",
  "utf8"
);
console.log(JSON.stringify({
  packages: packages.length,
  unknownLicenses: packages.filter((item) => item.license === "UNKNOWN").length,
  missingLicenseTexts: packages.filter((item) => !item.licenseText).length
}));
