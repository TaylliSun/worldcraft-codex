const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const { createHash } = require("node:crypto");
const path = require("node:path");
const yazl = require("yazl");
const {
  PACKAGE_FORMAT,
  PACKAGE_VERSION,
  createProjectPackage,
  extractProjectPackage,
  inspectProjectPackage
} = require("../electron/project-package.cjs");

const root = path.join(__dirname, "..", "validation", `project-package-${process.pid}`);
const sourceAssetsDir = path.join(root, "source-assets");
const targetAssetsDir = path.join(root, "target-assets");
const packagePath = path.join(root, "portable-project.wcodex");
let assertions = 0;

function check(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function writeCustomZip(filePath, entries) {
  await new Promise((resolve, reject) => {
    const zipFile = new yazl.ZipFile();
    const output = fs.createWriteStream(filePath);
    output.once("close", resolve);
    output.once("error", reject);
    zipFile.outputStream.once("error", reject);
    zipFile.outputStream.pipe(output);
    entries.forEach(([entryPath, content]) => zipFile.addBuffer(Buffer.from(content), entryPath));
    zipFile.end();
  });
}

async function rejectsWithCode(action, code, message) {
  await assert.rejects(action, (error) => error?.code === code, message);
  assertions += 1;
}

async function run() {
  fs.rmSync(root, { recursive: true, force: true });
  fs.mkdirSync(sourceAssetsDir, { recursive: true });
  const sharedBytes = Buffer.from("shared-watercolor-map-image");
  fs.writeFileSync(path.join(sourceAssetsDir, "hero.png"), sharedBytes);
  fs.writeFileSync(path.join(sourceAssetsDir, "hero-copy.png"), sharedBytes);
  const orphanBytes = Buffer.from("resource-referenced-without-metadata");
  fs.writeFileSync(path.join(sourceAssetsDir, "orphan.png"), orphanBytes);

  const workspace = {
    worlds: [{ id: "world-a", name: "Portable World", updatedAt: "2026-07-16T00:00:00.000Z" }],
    entities: [{ id: "entity-a", worldId: "world-a", title: "Hero", content: "Keep every field." }],
    manuscriptBooks: [{ id: "book-a", worldId: "world-a", title: "Novel" }],
    manuscriptVolumes: [{ id: "volume-a", worldId: "world-a", bookId: "book-a", title: "Volume I" }],
    manuscriptChapters: [{
      id: "chapter-a",
      worldId: "world-a",
      bookId: "book-a",
      volumeId: "volume-a",
      title: "Chapter I",
      body: "<p>The manuscript survives packaging.</p>"
    }],
    manuscriptScenes: [{
      id: "manuscript-scene-a",
      worldId: "world-a",
      bookId: "book-a",
      volumeId: "volume-a",
      chapterId: "chapter-a",
      title: "Opening scene",
      body: "<p>Scene prose.</p>"
    }],
    manuscriptClues: [{
      id: "clue-a",
      worldId: "world-a",
      bookId: "book-a",
      title: "Silver key"
    }],
    manuscriptKnowledgeStates: [{
      id: "knowledge-a",
      worldId: "world-a",
      bookId: "book-a",
      characterId: "entity-a",
      fact: "The gate is open",
      authorConfirmed: true
    }],
    assets: [
      {
        id: "asset-a",
        worldId: "world-a",
        name: "Hero",
        storedName: "hero.png",
        originalName: "hero.png",
        mimeType: "image/png",
        size: 1,
        contentHash: "0".repeat(64)
      },
      {
        id: "asset-b",
        worldId: "world-a",
        name: "Hero duplicate",
        storedName: "hero-copy.png",
        originalName: "hero-copy.png",
        mimeType: "image/png",
        size: 2
      },
      {
        id: "asset-missing",
        worldId: "world-a",
        name: "Missing",
        storedName: "missing.webp",
        originalName: "missing.webp",
        mimeType: "image/webp",
        size: 42,
        contentHash: "1".repeat(64)
      }
    ],
    maps: [
      {
        id: "map-a",
        worldId: "world-a",
        imageUrl: "worldcraft://asset/hero.png",
        nested: {
          iconUrl: "worldcraft://asset/hero-copy.png",
          overlayUrl: "worldcraft://asset/orphan.png"
        }
      }
    ]
  };

  const created = await createProjectPackage({
    targetPath: packagePath,
    data: workspace,
    assetsDir: sourceAssetsDir,
    schemaVersion: 17,
    appVersion: "test",
    now: () => "2026-07-16T01:00:00.000Z"
  });
  check(fs.existsSync(packagePath), true, "package is written");
  check(created.summary.complete, false, "missing files mark package incomplete");
  check(created.summary.assetCount, 4, "logical and directly referenced asset count is retained");
  check(created.summary.embeddedAssetCount, 3, "available logical and referenced assets are embedded");
  check(created.summary.missingAssetCount, 1, "missing asset is reported");
  check(created.summary.untrackedAssetCount, 1, "direct URL resources are discovered");
  check(created.summary.uniqueFileCount, 2, "identical files are stored once");
  check(created.data.assets[0].contentHash, sha256(sharedBytes), "stale hash is refreshed");
  check(created.data.assets[0].size, sharedBytes.length, "asset size is refreshed");

  const inspected = await inspectProjectPackage({ filePath: packagePath });
  check(inspected.manifest.format, PACKAGE_FORMAT, "manifest format is stable");
  check(inspected.manifest.packageVersion, PACKAGE_VERSION, "package schema is versioned");
  check(inspected.summary.schemaVersion, 17, "workspace schema is recorded");
  check(inspected.data.entities[0].content, "Keep every field.", "workspace data roundtrips");
  check(
    inspected.data.manuscriptChapters[0].body,
    "<p>The manuscript survives packaging.</p>",
    "manuscript prose roundtrips through inspection"
  );

  const extracted = await extractProjectPackage({
    filePath: packagePath,
    assetsDir: targetAssetsDir
  });
  check(extracted.summary.importedFileCount, 2, "unique physical files are installed");
  check(extracted.summary.reusedFileCount, 0, "first extraction does not reuse files");
  check(extracted.summary.missingAssetCount, 1, "missing file survives extraction diagnostics");
  check(extracted.data.manuscriptScenes[0].body, "<p>Scene prose.</p>", "manuscript scenes survive extraction");
  check(extracted.data.manuscriptKnowledgeStates[0].authorConfirmed, true, "author-confirmed facts survive extraction");
  check(
    extracted.data.assets[0].storedName,
    extracted.data.assets[1].storedName,
    "duplicate logical assets reuse one content-addressed file"
  );
  check(
    extracted.data.maps[0].imageUrl,
    `worldcraft://asset/${encodeURIComponent(extracted.data.assets[0].storedName)}`,
    "map image URL is rewritten"
  );
  check(
    extracted.data.maps[0].nested.iconUrl,
    `worldcraft://asset/${encodeURIComponent(extracted.data.assets[1].storedName)}`,
    "nested asset URL is rewritten"
  );
  const importedOrphanName = decodeURIComponent(
    extracted.data.maps[0].nested.overlayUrl.replace("worldcraft://asset/", "")
  );
  check(/^asset-[a-f0-9]{24}\.png$/.test(importedOrphanName), true, "untracked URL resource receives a content-addressed name");
  check(fs.readFileSync(path.join(targetAssetsDir, importedOrphanName)), orphanBytes, "untracked URL resource bytes are restored");
  check(
    fs.readFileSync(path.join(targetAssetsDir, extracted.data.assets[0].storedName)),
    sharedBytes,
    "installed bytes match the source"
  );

  const extractedAgain = await extractProjectPackage({ filePath: packagePath, assetsDir: targetAssetsDir });
  check(extractedAgain.summary.importedFileCount, 0, "second extraction does not copy duplicates");
  check(extractedAgain.summary.reusedFileCount, 2, "second extraction reuses verified content");

  const projectBuffer = Buffer.from(JSON.stringify({ app: "Worldcraft Codex", version: 16, data: workspace }));
  const badHashManifest = {
    format: PACKAGE_FORMAT,
    packageVersion: PACKAGE_VERSION,
    appVersion: "test",
    schemaVersion: 17,
    createdAt: "2026-07-16T01:00:00.000Z",
    complete: true,
    project: { path: "project.json", size: projectBuffer.length, sha256: "f".repeat(64) },
    assets: []
  };
  const badHashPath = path.join(root, "bad-hash.wcodex");
  await writeCustomZip(badHashPath, [
    ["manifest.json", JSON.stringify(badHashManifest)],
    ["project.json", projectBuffer]
  ]);
  await rejectsWithCode(
    () => inspectProjectPackage({ filePath: badHashPath }),
    "HASH_MISMATCH",
    "tampered project data is rejected"
  );

  const futureSchemaManifest = {
    ...badHashManifest,
    schemaVersion: 99,
    project: { path: "project.json", size: projectBuffer.length, sha256: sha256(projectBuffer) }
  };
  const futureSchemaPath = path.join(root, "future-schema.wcodex");
  await writeCustomZip(futureSchemaPath, [
    ["manifest.json", JSON.stringify(futureSchemaManifest)],
    ["project.json", projectBuffer]
  ]);
  await rejectsWithCode(
    () => extractProjectPackage({
      filePath: futureSchemaPath,
      assetsDir: path.join(root, "future-target"),
      supportedSchemaVersion: 16
    }),
    "UNSUPPORTED_SCHEMA",
    "future workspace schemas are rejected explicitly"
  );

  const traversalManifest = {
    ...badHashManifest,
    project: { path: "project.json", size: projectBuffer.length, sha256: sha256(projectBuffer) },
    assets: [
      {
        id: "escape",
        storedName: "escape.png",
        originalName: "escape.png",
        mimeType: "image/png",
        size: 1,
        sha256: sha256(Buffer.from("x")),
        expectedSha256: "",
        archivePath: "assets/../escape.png",
        missing: false
      }
    ]
  };
  const traversalPath = path.join(root, "traversal.wcodex");
  await writeCustomZip(traversalPath, [
    ["manifest.json", JSON.stringify(traversalManifest)],
    ["project.json", projectBuffer]
  ]);
  await assert.rejects(
    () => inspectProjectPackage({ filePath: traversalPath }),
    /归档路径无效/,
    "manifest path traversal is rejected"
  );
  assertions += 1;

  const extraEntryManifest = {
    ...badHashManifest,
    project: { path: "project.json", size: projectBuffer.length, sha256: sha256(projectBuffer) }
  };
  const extraEntryPath = path.join(root, "extra-entry.wcodex");
  await writeCustomZip(extraEntryPath, [
    ["manifest.json", JSON.stringify(extraEntryManifest)],
    ["project.json", projectBuffer],
    ["undeclared.txt", "hidden payload"]
  ]);
  await assert.rejects(
    () => inspectProjectPackage({ filePath: extraEntryPath }),
    /未声明条目/,
    "undeclared archive entries are rejected"
  );
  assertions += 1;

  const sharedArchiveBytes = Buffer.from("one physical archive entry");
  const sharedArchivePath = "assets/shared-entry.bin";
  const conflictingArchiveManifest = {
    ...badHashManifest,
    project: { path: "project.json", size: projectBuffer.length, sha256: sha256(projectBuffer) },
    assets: [
      {
        id: "shared-a",
        storedName: "shared-a.bin",
        originalName: "shared-a.bin",
        mimeType: "application/octet-stream",
        size: sharedArchiveBytes.length,
        sha256: sha256(sharedArchiveBytes),
        expectedSha256: "",
        archivePath: sharedArchivePath,
        missing: false
      },
      {
        id: "shared-b",
        storedName: "shared-b.bin",
        originalName: "shared-b.bin",
        mimeType: "application/octet-stream",
        size: sharedArchiveBytes.length,
        sha256: "a".repeat(64),
        expectedSha256: "",
        archivePath: sharedArchivePath,
        missing: false
      }
    ]
  };
  const conflictingArchivePath = path.join(root, "conflicting-archive-records.wcodex");
  await writeCustomZip(conflictingArchivePath, [
    ["manifest.json", JSON.stringify(conflictingArchiveManifest)],
    ["project.json", projectBuffer],
    [sharedArchivePath, sharedArchiveBytes]
  ]);
  await assert.rejects(
    () => inspectProjectPackage({ filePath: conflictingArchivePath }),
    /声明了不同的资源内容/,
    "one archive path cannot claim conflicting hashes or sizes"
  );
  assertions += 1;

  const corruptAssetBytes = Buffer.from("tampered-resource");
  const declaredAssetBytes = Buffer.from("expected-resource");
  const corruptWorkspace = {
    worlds: [{ id: "world-corrupt", name: "Must not be installed" }],
    assets: [{
      id: "asset-corrupt",
      worldId: "world-corrupt",
      storedName: "corrupt.png",
      originalName: "corrupt.png",
      mimeType: "image/png",
      size: declaredAssetBytes.length
    }]
  };
  const corruptProjectBuffer = Buffer.from(JSON.stringify({
    app: "Worldcraft Codex",
    version: 16,
    data: corruptWorkspace
  }));
  const declaredAssetHash = sha256(declaredAssetBytes);
  const corruptArchivePath = `assets/${declaredAssetHash}.png`;
  const corruptAssetManifest = {
    format: PACKAGE_FORMAT,
    packageVersion: PACKAGE_VERSION,
    appVersion: "test",
    schemaVersion: 16,
    createdAt: "2026-07-16T01:00:00.000Z",
    complete: true,
    project: {
      path: "project.json",
      size: corruptProjectBuffer.length,
      sha256: sha256(corruptProjectBuffer)
    },
    assets: [{
      id: "asset-corrupt",
      storedName: "corrupt.png",
      originalName: "corrupt.png",
      mimeType: "image/png",
      size: corruptAssetBytes.length,
      sha256: declaredAssetHash,
      expectedSha256: "",
      archivePath: corruptArchivePath,
      missing: false
    }]
  };
  const corruptAssetPath = path.join(root, "corrupt-asset.wcodex");
  const corruptTargetDir = path.join(root, "corrupt-target");
  await writeCustomZip(corruptAssetPath, [
    ["manifest.json", JSON.stringify(corruptAssetManifest)],
    ["project.json", corruptProjectBuffer],
    [corruptArchivePath, corruptAssetBytes]
  ]);
  await rejectsWithCode(
    () => extractProjectPackage({ filePath: corruptAssetPath, assetsDir: corruptTargetDir }),
    "HASH_MISMATCH",
    "corrupt asset bytes are rejected during staged extraction"
  );
  check(fs.readdirSync(corruptTargetDir), [], "failed extraction leaves no resource files or staging directory");

  const beforeOverwrite = fs.statSync(packagePath).size;
  const changedWorkspace = structuredClone(workspace);
  changedWorkspace.entities[0].content = "Atomic replacement keeps the new project.";
  await createProjectPackage({
    targetPath: packagePath,
    data: changedWorkspace,
    assetsDir: sourceAssetsDir,
    schemaVersion: 17,
    appVersion: "test",
    now: () => "2026-07-16T02:00:00.000Z"
  });
  const overwritten = await inspectProjectPackage({ filePath: packagePath });
  check(overwritten.data.entities[0].content, changedWorkspace.entities[0].content, "existing package is atomically replaced");
  check(fs.statSync(packagePath).size > 0 && beforeOverwrite > 0, true, "replacement remains readable");

  const invalidReplacement = structuredClone(changedWorkspace);
  invalidReplacement.assets.push({ ...invalidReplacement.assets[0] });
  await assert.rejects(
    () => createProjectPackage({
      targetPath: packagePath,
      data: invalidReplacement,
      assetsDir: sourceAssetsDir,
      schemaVersion: 17,
      appVersion: "test"
    }),
    /重复资源 ID/,
    "invalid replacement is rejected before touching the prior package"
  );
  assertions += 1;
  const preserved = await inspectProjectPackage({ filePath: packagePath });
  check(preserved.data.entities[0].content, changedWorkspace.entities[0].content, "failed replacement preserves the previous package");

  const tempArtifacts = (await fsPromises.readdir(root)).filter((name) => name.endsWith(".tmp") || name.includes(".previous-"));
  check(tempArtifacts, [], "atomic writes leave no temporary siblings");
  console.log(`Project package checks passed: ${assertions} assertions across 13 scenarios.`);
}

run()
  .finally(() => fs.rmSync(root, { recursive: true, force: true }))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
