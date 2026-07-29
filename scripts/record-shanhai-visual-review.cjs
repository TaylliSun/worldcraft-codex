const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const { classicVolumes, illustratedRecords } = require("./shanhai-case-data.cjs");

const root = path.resolve(__dirname, "..");
const assetDir = path.join(root, "assets", "shanhai");
const outputPath = path.join(root, "data", "shanhai-visual-review.json");
const mapFiles = [
  "shanhai-map-base.png",
  "map-five-classics.png",
  "map-sea-classics.png",
  ...classicVolumes.map((volume) => `map-volume-${volume.key}.png`)
];

const correctedTraits = {
  bo: "White horse body, black tail, one horn, tiger fangs and four clawed paws; no duplicated torso or limbs.",
  shengsheng: "Ape-like primate with white ears and four coherent limbs; not a rabbit.",
  qiongqi: "Xi Shan Jing ox form with hedgehog quills and no wings; not the later winged tiger form.",
  "index-creature-353ea854582ce5cc": "One giant bee-shaped avian creature with six legs, four wings and one stinger.",
  "index-creature-9dd2dfcc2d89ffe3": "One cinnabar-red pig or boar with four cloven-hoofed legs; not a canine or lion.",
  "index-creature-da2963bf96e7c793": "One owl-like bird with exactly two human legs and feet; no deer anatomy.",
  "index-creature-17a98b83172598f5": "White dog body with a black head in an airborne pose; no horse body, horn or wings.",
  "index-creature-d8306bda491d65c1": "Two paired duck-like birds, each with one visible eye and one wing.",
  "index-creature-910b7e03f89150f5": "One beast head and one limbless snake body; no wings inherited from the preceding creature.",
  "index-creature-794c699e534860f0": "Exactly one bird head joined to three distinct bird bodies; not three heads on one body.",
  "index-creature-6351ce789b764925": "One ox-shaped beast with exactly three visible legs and three hooves.",
  "index-creature-f80b0af19961e034": "Leopard body, long tail, human head, cow ears, exactly one eye and no horns.",
  "index-deity-c62f9443c573eee4": "One snake body with exactly two human heads, left and right; no additional snake heads.",
  "index-other-60a4171cce919caa": "Exactly two separate adult women and one large crab; no fused or double-faced figure.",
  "index-other-25ce203ddb271952": "One person with two clearly rear-facing arms attached at the shoulder blades.",
  "index-other-13b32a88aaf84279": "One red headless horse-shaped creature.",
  "index-other-6469bad7c9772744": "One five-colored patterned ritual stone shaped like a quail egg.",
  "index-other-f5084fa92db095e5": "One solitary figure with no adjacent Tian dog or neighboring passage subject."
};

function sha256(filename) {
  const bytes = fs.readFileSync(path.join(assetDir, filename));
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

const manifest = {
  schemaVersion: 1,
  reviewedAt: new Date().toISOString(),
  reviewMethod: "Human review against canonical record summaries, original-passage anatomy, transparent-edge checks, and all 13 contact sheets.",
  illustrationCount: illustratedRecords.length,
  mapCount: mapFiles.length,
  corrections: Object.entries(correctedTraits).map(([key, expectedTraits]) => ({
    key,
    expectedTraits
  })),
  illustrations: illustratedRecords.map((record) => ({
    key: record.key,
    title: record.title,
    kind: record.kind,
    status: "approved",
    sha256: sha256(`${record.key}.png`)
  })),
  maps: mapFiles.map((filename) => ({
    filename,
    status: "approved",
    sha256: sha256(filename)
  }))
};

fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Recorded visual review for ${manifest.illustrationCount} illustrations and ${manifest.mapCount} maps.`);
