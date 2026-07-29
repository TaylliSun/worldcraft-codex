const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  createReleaseConfig,
  isHttpsUrl,
  writeReleaseFiles
} = require("./prepare-public-release.cjs");

const root = path.join(__dirname, "..", "validation", "public-release-" + process.pid);
const packageJson = { name: "worldcraft-codex", version: "2.2.0-rc.20" };
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

const completeEnv = {
  WORLDCRAFT_RELEASE_CHANNEL: "candidate",
  WORLDCRAFT_PUBLISHER_NAME: "Worldcraft Codex",
  WORLDCRAFT_LEGAL_NAME: "Example Studio Limited",
  WORLDCRAFT_CERTIFICATE_PUBLISHER: "Example Studio Limited",
  WORLDCRAFT_HOMEPAGE: "https://example.com/worldcraft",
  WORLDCRAFT_SUPPORT_URL: "https://example.com/support",
  WORLDCRAFT_PRIVACY_URL: "https://example.com/privacy",
  WORLDCRAFT_TERMS_URL: "https://example.com/terms",
  WORLDCRAFT_UPDATE_STABLE_URL: "https://updates.example.com/stable",
  WORLDCRAFT_UPDATE_CANDIDATE_URL: "https://updates.example.com/candidate",
  WIN_CSC_LINK: "base64-placeholder",
  WIN_CSC_KEY_PASSWORD: "not-written-to-output",
  SOURCE_DATE_EPOCH: "1784160000"
};

try {
  const candidate = createReleaseConfig({ mode: "candidate", env: {}, packageJson });
  check(candidate.mode, "candidate", "candidate mode is retained");
  check(candidate.distribution.publicReady, false, "candidate without external inputs is not public-ready");
  check(candidate.distribution.externalBlockers.length > 0, true, "candidate lists external blockers");
  check(candidate.legal.requiresAcceptance, false, "candidate does not force legal acceptance");

  assert.throws(
    () => createReleaseConfig({ mode: "public", env: {}, packageJson }),
    /Public release inputs are incomplete/
  );
  assertions += 1;

  const published = createReleaseConfig({ mode: "public", env: completeEnv, packageJson });
  check(published.distribution.publicReady, true, "complete public inputs pass");
  check(published.distribution.signedBuildRequired, true, "public mode requires signing");
  check(published.legal.requiresAcceptance, true, "public mode requires first-run acceptance");
  check(published.channel, "candidate", "prerelease channel is explicit");
  check(published.generatedAt, "2026-07-16T00:00:00.000Z", "source date epoch controls generation time");
  check(published.updates.stableUrl, completeEnv.WORLDCRAFT_UPDATE_STABLE_URL, "stable feed is retained");
  check(published.updates.candidateUrl, completeEnv.WORLDCRAFT_UPDATE_CANDIDATE_URL, "candidate feed is retained");
  check(published.publisher.legalName, completeEnv.WORLDCRAFT_LEGAL_NAME, "legal publisher is retained");

  assert.throws(
    () => createReleaseConfig({
      mode: "public",
      env: { ...completeEnv, WORLDCRAFT_RELEASE_CHANNEL: "stable" },
      packageJson
    }),
    /stable channel requires a version without a prerelease suffix/
  );
  assertions += 1;

  check(isHttpsUrl("https://example.com/path"), true, "HTTPS URL is accepted");
  check(isHttpsUrl("http://example.com/path"), false, "HTTP URL is rejected");
  check(isHttpsUrl("https://user" + ":password@example.com/path"), false, "credential URL is rejected");
  check(isHttpsUrl("not a url"), false, "invalid URL is rejected");

  writeReleaseFiles(root, published);
  const serialized = [
    fs.readFileSync(path.join(root, "release-config.json"), "utf8"),
    fs.readFileSync(path.join(root, "EULA.txt"), "utf8"),
    fs.readFileSync(path.join(root, "PRIVACY.txt"), "utf8")
  ].join("\n");
  check(serialized.includes("not-written-to-output"), false, "signing password never enters artifacts");
  check(serialized.includes("base64-placeholder"), false, "certificate bytes never enter artifacts");
  check(serialized.includes("Example Studio Limited"), true, "publisher enters generated legal summary");
  check(serialized.includes("https://example.com/privacy"), true, "privacy URL enters generated summary");
  check(fs.existsSync(path.join(root, "THIRD_PARTY_NOTICES.txt")), true, "notices placeholder is created");

  fs.rmSync(root, { recursive: true, force: true });
  console.log("Public release configuration checks passed: " + assertions + " assertions.");
} catch (error) {
  fs.rmSync(root, { recursive: true, force: true });
  throw error;
}
