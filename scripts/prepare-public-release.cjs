const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const defaultOutputDir = path.join(root, "build", "generated");

function parseArguments(argv) {
  const valueAfter = (flag, fallback = "") => {
    const index = argv.indexOf(flag);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
  };
  return {
    mode: valueAfter("--mode", process.env.WORLDCRAFT_RELEASE_MODE || "candidate"),
    outputDir: path.resolve(valueAfter("--output", defaultOutputDir))
  };
}

function isHttpsUrl(value) {
  try {
    const parsed = new URL(String(value || ""));
    return parsed.protocol === "https:" && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

function normalizeUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function signingConfigured(env) {
  return Boolean(env.WIN_CSC_LINK?.trim() && env.WIN_CSC_KEY_PASSWORD?.trim());
}

function generatedAt(env) {
  const epoch = Number(env.SOURCE_DATE_EPOCH);
  return Number.isFinite(epoch) && epoch > 0
    ? new Date(epoch * 1000).toISOString()
    : new Date().toISOString();
}

function defaultChannel(version, requested) {
  if (requested === "stable" || requested === "candidate") return requested;
  return String(version).includes("-") ? "candidate" : "stable";
}

function createReleaseConfig({ mode, env = process.env, packageJson }) {
  if (!new Set(["candidate", "public"]).has(mode)) {
    throw new Error(`Unsupported release mode: ${mode}`);
  }

  const links = {
    homepage: normalizeUrl(env.WORLDCRAFT_HOMEPAGE),
    support: normalizeUrl(env.WORLDCRAFT_SUPPORT_URL),
    privacy: normalizeUrl(env.WORLDCRAFT_PRIVACY_URL),
    terms: normalizeUrl(env.WORLDCRAFT_TERMS_URL)
  };
  const updates = {
    stableUrl: normalizeUrl(env.WORLDCRAFT_UPDATE_STABLE_URL),
    candidateUrl: normalizeUrl(env.WORLDCRAFT_UPDATE_CANDIDATE_URL)
  };
  const publisher = {
    displayName: String(env.WORLDCRAFT_PUBLISHER_NAME || "Worldcraft Codex Project").trim(),
    legalName: String(env.WORLDCRAFT_LEGAL_NAME || "").trim(),
    certificateName: String(env.WORLDCRAFT_CERTIFICATE_PUBLISHER || "").trim()
  };
  const externalBlockers = [];
  const requireValue = (value, label) => {
    if (!String(value || "").trim()) externalBlockers.push(`${label} is missing`);
  };
  const requireHttps = (value, label) => {
    if (!isHttpsUrl(value)) externalBlockers.push(`${label} must be an HTTPS URL without credentials`);
  };

  requireValue(publisher.legalName, "WORLDCRAFT_LEGAL_NAME");
  requireValue(publisher.certificateName, "WORLDCRAFT_CERTIFICATE_PUBLISHER");
  const linkVariables = {
    homepage: "WORLDCRAFT_HOMEPAGE",
    support: "WORLDCRAFT_SUPPORT_URL",
    privacy: "WORLDCRAFT_PRIVACY_URL",
    terms: "WORLDCRAFT_TERMS_URL"
  };
  Object.entries(links).forEach(([key, value]) => requireHttps(value, linkVariables[key]));
  requireHttps(updates.stableUrl, "WORLDCRAFT_UPDATE_STABLE_URL");
  requireHttps(updates.candidateUrl, "WORLDCRAFT_UPDATE_CANDIDATE_URL");
  if (!signingConfigured(env)) {
    externalBlockers.push("WIN_CSC_LINK and WIN_CSC_KEY_PASSWORD are required for signed distribution");
  }

  const channel = defaultChannel(packageJson.version, env.WORLDCRAFT_RELEASE_CHANNEL);
  if (channel === "stable" && String(packageJson.version).includes("-")) {
    externalBlockers.push("stable channel requires a version without a prerelease suffix");
  }
  const config = {
    format: "worldcraft-release-config-v1",
    generatedAt: generatedAt(env),
    mode,
    appVersion: packageJson.version,
    channel,
    publisher,
    links,
    updates: {
      ...updates,
      autoCheck: env.WORLDCRAFT_AUTO_UPDATE_CHECK !== "0",
      autoDownload: env.WORLDCRAFT_AUTO_UPDATE_DOWNLOAD === "1"
    },
    legal: {
      version: String(env.WORLDCRAFT_LEGAL_VERSION || packageJson.version),
      requiresAcceptance: mode === "public"
    },
    distribution: {
      publicReady: externalBlockers.length === 0,
      signedBuildRequired: mode === "public",
      externalBlockers
    }
  };

  if (mode === "public" && externalBlockers.length) {
    const error = new Error(`Public release inputs are incomplete:\n- ${externalBlockers.join("\n- ")}`);
    error.blockers = externalBlockers;
    throw error;
  }
  return config;
}

function createEula(config) {
  if (config.mode !== "public") {
    return [
      "Worldcraft Codex candidate build",
      "",
      "This package is an unsigned release candidate and is not approved for public distribution.",
      "The author retains ownership of content created with the application.",
      "No telemetry or project content is uploaded by Worldcraft Codex.",
      "Third-party AI requests occur only when the author configures and invokes a model provider.",
      ""
    ].join("\r\n");
  }
  return [
    "Worldcraft Codex End User License Summary",
    "",
    `Publisher: ${config.publisher.legalName}`,
    `Terms: ${config.links.terms}`,
    `Privacy: ${config.links.privacy}`,
    `Support: ${config.links.support}`,
    "",
    "The application grants the end user a revocable, non-transferable right to install and use the software under the published terms.",
    "The author retains ownership of original project content created with the application.",
    "The software is provided subject to the warranty, liability, termination, and jurisdiction terms published at the Terms URL above.",
    "Worldcraft Codex does not upload telemetry or project content. Third-party AI requests are sent only when the author configures and invokes a provider.",
    "Uninstalling the application does not delete the local project database or backups unless the user removes them separately.",
    ""
  ].join("\r\n");
}

function createPrivacySummary(config) {
  return [
    "Worldcraft Codex privacy summary",
    "",
    "Project databases, assets, backups, diagnostics, and AI credentials remain on the local device.",
    "The application does not contain automatic telemetry upload.",
    "AI requests are sent only to the local or HTTPS provider explicitly configured by the author.",
    config.links.privacy ? `Published privacy policy: ${config.links.privacy}` : "Published privacy policy: not configured for this candidate build.",
    ""
  ].join("\r\n");
}

function writeReleaseFiles(outputDir, config) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "release-config.json"), `${JSON.stringify(config, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(outputDir, "EULA.txt"), createEula(config), "utf8");
  fs.writeFileSync(path.join(outputDir, "PRIVACY.txt"), createPrivacySummary(config), "utf8");
  const noticesPath = path.join(outputDir, "THIRD_PARTY_NOTICES.txt");
  if (!fs.existsSync(noticesPath)) {
    fs.writeFileSync(noticesPath, "Third-party notices are generated by npm run release:notices.\n", "utf8");
  }
  return outputDir;
}

function run(argv = process.argv.slice(2), env = process.env) {
  const args = parseArguments(argv);
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const config = createReleaseConfig({ mode: args.mode, env, packageJson });
  writeReleaseFiles(args.outputDir, config);
  console.log(JSON.stringify({
    mode: config.mode,
    version: config.appVersion,
    channel: config.channel,
    publicReady: config.distribution.publicReady,
    blockers: config.distribution.externalBlockers,
    outputDir: args.outputDir
  }));
  return config;
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

module.exports = {
  createEula,
  createPrivacySummary,
  createReleaseConfig,
  isHttpsUrl,
  signingConfigured,
  writeReleaseFiles
};
