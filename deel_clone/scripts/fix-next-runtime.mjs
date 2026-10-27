import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, "assets");
const NEXT_STATIC_DIR = path.join(ROOT, "_next", "static");
const WEBPACK_RUNTIME = path.join(
  ROOT,
  "assets",
  "js",
  "website-media.deel.com",
  "webpack-a1ca8d164eb5cf1d-88f161eb.js"
);

const TEXT_EXTENSIONS = new Set([".js", ".css", ".html"]);

function stripLocalHash(fileName) {
  return fileName.replace(/-([0-9a-f]{8})(\.[^.]+)$/i, "$2");
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function listFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function copyIfMissing(sourcePath, destinationPath) {
  await ensureDir(path.dirname(destinationPath));
  try {
    await fs.access(destinationPath);
  } catch {
    await fs.copyFile(sourcePath, destinationPath);
  }
}

async function copyOverwrite(sourcePath, destinationPath) {
  await ensureDir(path.dirname(destinationPath));
  await fs.copyFile(sourcePath, destinationPath);
}

function extractHashToken(fileName) {
  const matches = fileName.match(/[0-9a-f]{8,}/gi) || [];
  return matches.at(-1) || null;
}

async function buildAssetIndex() {
  const candidates = [];
  for (const subdir of ["images", "fonts", "videos", "audio", "other"]) {
    const dirPath = path.join(ASSETS_DIR, subdir);
    try {
      const files = await listFiles(dirPath);
      candidates.push(...files);
    } catch {
      continue;
    }
  }
  return candidates;
}

async function mirrorStaticFiles() {
  const mappings = [
    {
      sourceDir: path.join(ASSETS_DIR, "js", "website-media.deel.com"),
      targetDir: path.join(NEXT_STATIC_DIR, "chunks"),
    },
    {
      sourceDir: path.join(ASSETS_DIR, "css", "website-media.deel.com"),
      targetDir: path.join(NEXT_STATIC_DIR, "css"),
    },
    {
      sourceDir: path.join(ASSETS_DIR, "fonts", "website-media.deel.com"),
      targetDir: path.join(NEXT_STATIC_DIR, "media"),
    },
    {
      sourceDir: path.join(ASSETS_DIR, "images", "website-media.deel.com"),
      targetDir: path.join(NEXT_STATIC_DIR, "media"),
    },
    {
      sourceDir: path.join(ASSETS_DIR, "videos", "website-media.deel.com"),
      targetDir: path.join(NEXT_STATIC_DIR, "media"),
    },
  ];

  for (const mapping of mappings) {
    const files = await listFiles(mapping.sourceDir);
    for (const file of files) {
      const originalName = path.basename(file);
      const normalizedName = stripLocalHash(originalName);
      await copyOverwrite(file, path.join(mapping.targetDir, originalName));
      if (normalizedName !== originalName) {
        await copyOverwrite(file, path.join(mapping.targetDir, normalizedName));
      }
    }
  }
}

async function createAppRouterAliases() {
  const chunkDir = path.join(NEXT_STATIC_DIR, "chunks");
  const appPathDir = path.join(chunkDir, "app", "[...path]");
  const encodedAppPathDir = path.join(chunkDir, "app", "%5B...path%5D");

  const aliases = [
    {
      source: path.join(chunkDir, "layout-018ce60cc40cde98.js"),
      targets: [
        path.join(appPathDir, "layout-018ce60cc40cde98.js"),
        path.join(appPathDir, "layout-018ce60cc40cde98-89c4f2db.js"),
        path.join(encodedAppPathDir, "layout-018ce60cc40cde98.js"),
        path.join(encodedAppPathDir, "layout-018ce60cc40cde98-89c4f2db.js"),
      ],
    },
    {
      source: path.join(chunkDir, "page-074cf49c5b0d6b6a.js"),
      targets: [
        path.join(appPathDir, "page-074cf49c5b0d6b6a.js"),
        path.join(appPathDir, "page-074cf49c5b0d6b6a-b2dc60e5.js"),
        path.join(encodedAppPathDir, "page-074cf49c5b0d6b6a.js"),
        path.join(encodedAppPathDir, "page-074cf49c5b0d6b6a-b2dc60e5.js"),
      ],
    },
    {
      source: path.join(chunkDir, "not-found-7e8b9c06989bcefa.js"),
      targets: [
        path.join(appPathDir, "not-found-7e8b9c06989bcefa.js"),
        path.join(appPathDir, "not-found-7e8b9c06989bcefa-16526ae4.js"),
        path.join(encodedAppPathDir, "not-found-7e8b9c06989bcefa.js"),
        path.join(encodedAppPathDir, "not-found-7e8b9c06989bcefa-16526ae4.js"),
      ],
    },
    {
      source: path.join(chunkDir, "global-error-24af9536617f394c.js"),
      targets: [
        path.join(chunkDir, "app", "global-error-24af9536617f394c.js"),
        path.join(chunkDir, "app", "global-error-24af9536617f394c-9b414d50.js"),
      ],
    },
  ];

  for (const alias of aliases) {
    try {
      await fs.access(alias.source);
    } catch {
      continue;
    }

    for (const target of alias.targets) {
      await copyOverwrite(alias.source, target);
    }
  }
}

async function createKnownMediaAliases() {
  const mediaDir = path.join(NEXT_STATIC_DIR, "media");
  const candidates = [
    "United-States.613f8f62.svg",
    "United_States.613f8f62.svg",
    "United States.613f8f62.svg",
  ];

  let source = null;
  for (const fileName of candidates) {
    const filePath = path.join(mediaDir, fileName);
    try {
      await fs.access(filePath);
      source = filePath;
      break;
    } catch {}
  }

  if (!source) {
    const imageDir = path.join(ASSETS_DIR, "images", "website-media.deel.com");
    const imageFiles = await listFiles(imageDir);
    source =
      imageFiles.find((file) => /united[-_ ]states/i.test(path.basename(file))) ||
      imageFiles.find((file) => path.basename(file).includes("613f8f62")) ||
      null;
  }

  if (source) {
    await copyOverwrite(source, path.join(mediaDir, "United States.613f8f62.svg"));
    await copyOverwrite(source, path.join(mediaDir, "United%20States.613f8f62.svg"));
  }
}

async function restoreMediaFromBundleRefs() {
  const assetCandidates = await buildAssetIndex();
  const sourceTexts = [];

  for (const dirPath of [
    path.join(ASSETS_DIR, "js", "website-media.deel.com"),
    path.join(ASSETS_DIR, "css", "website-media.deel.com"),
  ]) {
    const files = await listFiles(dirPath);
    for (const file of files) {
      if (!TEXT_EXTENSIONS.has(path.extname(file))) continue;
      sourceTexts.push(await fs.readFile(file, "utf8"));
    }
  }

  const mediaRefs = new Set();
  const mediaRegex = /https:\/\/website-media\.deel\.com\/_next\/static\/media\/([^"'\\]+)/g;

  for (const text of sourceTexts) {
    for (const match of text.matchAll(mediaRegex)) {
      mediaRefs.add(match[1]);
    }
  }

  for (const fileName of mediaRefs) {
    const destination = path.join(NEXT_STATIC_DIR, "media", fileName);
    try {
      await fs.access(destination);
      continue;
    } catch {}

    const hashToken = extractHashToken(fileName);
    let source = null;

    if (hashToken) {
      source = assetCandidates.find((candidate) => path.basename(candidate).includes(hashToken));
    }

    if (!source) {
      const normalizedTarget = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_");
      source = assetCandidates.find((candidate) => stripLocalHash(path.basename(candidate)) === normalizedTarget);
    }

    if (source) {
      await copyIfMissing(source, destination);
    }
  }
}

async function patchWebpackRuntime() {
  const original = await fs.readFile(WEBPACK_RUNTIME, "utf8");
  const updated = original.replace(
    /c\.p="https:\/\/website-media\.deel\.com\/_next\/"/g,
    'c.p="/_next/"'
  );

  if (updated !== original) {
    await fs.writeFile(WEBPACK_RUNTIME, updated, "utf8");
  }

  const mirroredRuntime = path.join(
    NEXT_STATIC_DIR,
    "chunks",
    stripLocalHash(path.basename(WEBPACK_RUNTIME))
  );
  await copyOverwrite(WEBPACK_RUNTIME, mirroredRuntime);
}

async function main() {
  await patchWebpackRuntime();
  await mirrorStaticFiles();
  await createAppRouterAliases();
  await restoreMediaFromBundleRefs();
  await createKnownMediaAliases();
  console.log("next-runtime-fixed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
