const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const main = fs.readFileSync(path.join(root, "electron", "main.cjs"), "utf8");
const preload = fs.readFileSync(path.join(root, "electron", "preload.cjs"), "utf8");
const builder = fs.readFileSync(path.join(root, "electron-builder.config.cjs"), "utf8");
const fuseHook = fs.readFileSync(path.join(root, "scripts", "apply-electron-fuses.cjs"), "utf8");
const qualityWorkflow = fs.readFileSync(path.join(root, ".github", "workflows", "windows-quality.yml"), "utf8");
const releaseWorkflow = fs.readFileSync(path.join(root, ".github", "workflows", "windows-release.yml"), "utf8");
const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
let assertions = 0;

function includes(source, value, message) {
  assert.equal(source.includes(value), true, message);
  assertions += 1;
}

includes(main, "contextIsolation: true", "context isolation is enabled");
includes(main, "nodeIntegration: false", "renderer Node integration is disabled");
includes(main, "sandbox: true", "renderer sandbox is enabled");
includes(main, "webSecurity: true", "web security is enabled");
includes(main, "allowRunningInsecureContent: false", "insecure mixed content is disabled");
includes(main, "webviewTag: false", "webview tags are disabled");
includes(main, "setPermissionRequestHandler", "permission requests are handled");
includes(main, "setPermissionCheckHandler", "permission checks are handled");
includes(main, "will-navigate", "top-level navigation is restricted");
includes(main, "will-attach-webview", "unexpected webviews are blocked");
includes(main, "isSafeExternalUrl", "external URLs use a central validator");
includes(main, "url.protocol === \"https:\"", "external URLs require HTTPS");
includes(main, "\"object-src 'none'\"", "CSP blocks plugins");
includes(main, "\"frame-ancestors 'none'\"", "CSP blocks framing");
includes(main, "\"base-uri 'none'\"", "CSP blocks base URL injection");
includes(main, "\"form-action 'none'\"", "CSP blocks form submission");
includes(main, "\"connect-src 'self' worldcraft:\"", "CSP permits only packaged local asset fetches");
includes(main, "registerTrustedIpcHandle", "privileged IPC uses a trusted wrapper");

const rawHandleCount = (main.match(/ipcMain\.handle\(/g) || []).length;
const trustedHandleCount = (main.match(/registerTrustedIpcHandle\(\"/g) || []).length;
assert.equal(rawHandleCount, 1, "only the trusted wrapper calls ipcMain.handle directly");
assert.equal(trustedHandleCount >= 40, true, "all project and release IPC channels use the wrapper");
assertions += 2;

includes(preload, "contextBridge.exposeInMainWorld", "preload exposes narrow bridges");
assert.equal(preload.includes("require(\"node:fs\")"), false, "preload does not expose filesystem access");
assert.equal(preload.includes("shell.openExternal"), false, "preload does not expose shell access");
assertions += 2;

includes(builder, "afterPack: applyElectronFuses", "builder applies project-owned fuses immediately before signing");
includes(builder, 'compression: "maximum"', "release artifacts use a consistent compact payload");
includes(builder, "oneClick: true", "NSIS uses the auto-update-compatible one-click flow");
includes(builder, "perMachine: false", "NSIS installs without machine-wide elevation");
includes(builder, "runAfterFinish: false", "silent and interactive installs do not launch an unmanaged process");
assert.equal(builder.includes("allowToChangeInstallationDirectory"), false, "one-click installer does not expose an inapplicable directory selector");
assertions += 1;
includes(fuseHook, "FuseV1Options.RunAsNode]: false", "packaged RunAsNode fuse is disabled");
includes(fuseHook, "FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false", "NODE_OPTIONS fuse is disabled");
includes(fuseHook, "FuseV1Options.EnableNodeCliInspectArguments]: false", "Node inspect fuse is disabled");
includes(fuseHook, "FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true", "ASAR integrity validation is enabled");
includes(fuseHook, "FuseV1Options.OnlyLoadAppFromAsar]: true", "only validated ASAR application code can load");
includes(fuseHook, "FuseV1Options.GrantFileProtocolExtraPrivileges]: false", "file protocol privileges are disabled");
includes(fuseHook, "FuseV1Options.WasmTrapHandlers]: true", "WebAssembly bounds traps are explicitly configured");
includes(fuseHook, "strictlyRequireAllFuses: true", "future unknown Electron fuses fail packaging");
includes(builder, "forceCodeSigning", "public build can force code signing");

includes(qualityWorkflow, "npm run release:gate", "Windows CI executes the complete release gate");
includes(qualityWorkflow, "actions/upload-artifact@v4", "Windows CI preserves validation reports");
includes(releaseWorkflow, "environment: windows-public-release", "signed publishing uses a protected environment");
includes(releaseWorkflow, "npm run dist:public", "release CI invokes the public signing gate");
includes(releaseWorkflow, "npm run test:installer-package", "release CI verifies clean install and uninstall behavior");
includes(releaseWorkflow, "npm run test:upgrade-install", "release CI verifies in-place upgrade behavior");
includes(releaseWorkflow, "npm run test:portable-package", "release CI verifies the portable executable");
includes(releaseWorkflow, "WIN_CSC_LINK: ${{ secrets.WIN_CSC_LINK }}", "certificate input comes from a CI secret");
includes(releaseWorkflow, "--verify-tag --draft", "release automation only creates a draft from an existing tag");
includes(releaseWorkflow, "Existing release must remain a draft", "automation refuses to overwrite a public release");
assert.equal(envExample.includes("example.com"), false, "environment template does not contain publishable placeholder URLs");
assertions += 1;

console.log("Electron security configuration checks passed: " + assertions + " assertions.");
