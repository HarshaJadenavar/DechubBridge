import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const projectRoot = process.cwd();
const inputHtmlPath = path.join(projectRoot, "index.html");
const reportPath = path.join(projectRoot, "migration-report.json");

const assetRoots = {
  images: "assets/images",
  icons: "assets/icons",
  svg: "assets/svg",
  fonts: "assets/fonts",
  videos: "assets/videos",
  audio: "assets/audio",
  css: "assets/css",
  js: "assets/js",
  json: "assets/json",
  other: "assets/other",
};

const removablePatterns = [
  /<script[^>]+src="https:\/\/events\.framer\.com\/script\?v=2"[^>]*><\/script>\s*/gi,
  /<link[^>]+href="https:\/\/fonts\.gstatic\.com"[^>]*>\s*/gi,
  /<link[^>]+rel="canonical"[^>]*>\s*/gi,
  /<meta[^>]+property="og:url"[^>]*>\s*/gi,
  /<meta[^>]+name="generator"[^>]*>\s*/gi,
  /<script>\s*try\s*\{\s*if\s*\(localStorage\.getItem\("__framer_force_showing_editorbar_since"\)\)\s*\{[\s\S]*?<\/script>\s*/gi,
];

const textAssetExtensions = new Set([
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".svg",
  ".html",
  ".txt",
  ".xml",
]);

const assetMap = new Map();
const downloaded = [];
const removedDependencies = [];

function htmlDecode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"');
}

function isProbablyAssetUrl(rawUrl) {
  if (!/^https?:\/\//i.test(rawUrl)) return false;
  if (/^http:\/\/www\.w3\.org\/2000\/svg$/i.test(rawUrl)) return false;

  const url = new URL(rawUrl);
  const ext = path.posix.extname(url.pathname).toLowerCase();

  if (!ext && !url.pathname.includes(".")) return false;
  if (url.hostname === "events.framer.com") return false;
  if (url.hostname === "framer.com") return false;
  if (url.hostname === "fonts.gstatic.com") return ext === ".woff2";
  if (url.hostname === "framerusercontent.com") return true;

  if (!ext) return false;
  return [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".avif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".css",
    ".js",
    ".mjs",
    ".json",
    ".mp4",
    ".webm",
    ".mp3",
    ".wav",
    ".pdf",
  ].includes(ext);
}

function categoryForUrl(rawUrl) {
  const url = new URL(rawUrl);
  const ext = path.posix.extname(url.pathname).toLowerCase();

  if ([".woff", ".woff2", ".ttf", ".otf"].includes(ext)) return "fonts";
  if ([".css"].includes(ext)) return "css";
  if ([".js", ".mjs"].includes(ext)) return "js";
  if ([".json"].includes(ext)) return "json";
  if ([".mp4", ".webm"].includes(ext)) return "videos";
  if ([".mp3", ".wav", ".ogg"].includes(ext)) return "audio";
  if ([".ico"].includes(ext)) return "icons";
  if ([".svg"].includes(ext)) {
    if (/icon/i.test(url.pathname) || /favicon/i.test(url.pathname)) return "icons";
    return "svg";
  }
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"].includes(ext)) return "images";
  return "other";
}

function localPathForUrl(rawUrl) {
  if (assetMap.has(rawUrl)) return assetMap.get(rawUrl);

  const url = new URL(rawUrl);
  const category = categoryForUrl(rawUrl);
  const folder = assetRoots[category];
  const ext = path.posix.extname(url.pathname).toLowerCase();
  const baseName = path.posix.basename(url.pathname, ext) || "asset";
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const hash = crypto.createHash("sha1").update(rawUrl).digest("hex").slice(0, 10);
  const fileName = `${safeBaseName}-${hash}${ext || ""}`;
  const localPath = `${folder}/${fileName}`;
  assetMap.set(rawUrl, localPath);
  return localPath;
}

async function ensureAssetDirectories() {
  await Promise.all(
    Object.values(assetRoots).map((dir) =>
      fs.mkdir(path.join(projectRoot, dir), { recursive: true }),
    ),
  );
}

async function createJsModuleAliases() {
  const jsDir = path.join(projectRoot, assetRoots.js);
  const entries = await fs.readdir(jsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".mjs")) continue;

    const aliasName = entry.name.replace(/-[0-9a-f]{10}(?=\.mjs$)/i, "");
    if (aliasName === entry.name) continue;

    const sourcePath = path.join(jsDir, entry.name);
    const aliasPath = path.join(jsDir, aliasName);

    await fs.copyFile(sourcePath, aliasPath);
  }
}

async function collectExistingAssets() {
  const results = [];

  async function walk(relativeDir) {
    const absoluteDir = path.join(projectRoot, relativeDir);
    const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
    for (const entry of entries) {
      const childRelative = `${relativeDir}/${entry.name}`;
      const childAbsolute = path.join(projectRoot, childRelative);
      if (entry.isDirectory()) {
        await walk(childRelative);
        continue;
      }
      const stats = await fs.stat(childAbsolute);
      results.push({
        localPath: childRelative,
        bytes: stats.size,
      });
    }
  }

  await walk("assets");
  return results.sort((a, b) => a.localPath.localeCompare(b.localPath));
}

function extractUrls(text) {
  const matches = text.match(/https?:\/\/[^"'`\s)<>\]]+/g) || [];
  return [...new Set(matches.map(htmlDecode))];
}

async function downloadAsset(rawUrl) {
  const localRelativePath = localPathForUrl(rawUrl);
  const localAbsolutePath = path.join(projectRoot, localRelativePath);

  try {
    await fs.access(localAbsolutePath);
    return { localRelativePath, skipped: true };
  } catch {}

  const response = await fetch(rawUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${rawUrl}: ${response.status} ${response.statusText}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  await fs.writeFile(localAbsolutePath, bytes);

  downloaded.push({
    url: rawUrl,
    localPath: localRelativePath,
    bytes: bytes.byteLength,
  });

  return { localRelativePath, skipped: false };
}

async function crawlTextAssets(seedUrls) {
  const queue = [...seedUrls];
  const seen = new Set();

  while (queue.length > 0) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    if (!isProbablyAssetUrl(url)) continue;

    const { localRelativePath } = await downloadAsset(url);
    const ext = path.extname(localRelativePath).toLowerCase();
    if (!textAssetExtensions.has(ext)) continue;

    const assetText = await fs.readFile(path.join(projectRoot, localRelativePath), "utf8");
    const discoveredUrls = extractUrls(assetText).filter(isProbablyAssetUrl);
    for (const discoveredUrl of discoveredUrls) {
      if (!seen.has(discoveredUrl)) queue.push(discoveredUrl);
    }
  }
}

function replaceAllMappedUrls(text) {
  let output = text;
  const sortedEntries = [...assetMap.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [remoteUrl, localRelativePath] of sortedEntries) {
    const escapedRemote = remoteUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    output = output.replace(new RegExp(escapedRemote, "g"), localRelativePath);

    const encodedRemote = remoteUrl.replace(/&/g, "&amp;");
    if (encodedRemote !== remoteUrl) {
      const escapedEncoded = encodedRemote.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      output = output.replace(new RegExp(escapedEncoded, "g"), localRelativePath);
    }
  }

  output = output.replace(/https:\/\/framer\.link\/kanishkdubey/gi, "#");
  output = output.replace(/https:\/\/framer\.link\/1YNSJpf\?duplicateType=siteTemplate/gi, "#");
  return output;
}

async function rewriteDownloadedTextAssets() {
  for (const { localPath } of downloaded) {
    const ext = path.extname(localPath).toLowerCase();
    if (!textAssetExtensions.has(ext)) continue;

    const absolutePath = path.join(projectRoot, localPath);
    let content = await fs.readFile(absolutePath, "utf8");
    content = replaceAllMappedUrls(content);
    await fs.writeFile(absolutePath, content, "utf8");
  }
}

function removeBuilderCode(html) {
  let nextHtml = html;
  for (const pattern of removablePatterns) {
    const before = nextHtml;
    nextHtml = nextHtml.replace(pattern, "");
    if (before !== nextHtml) {
      removedDependencies.push(pattern.toString());
    }
  }

  nextHtml = nextHtml.replace(
    /<!-- Made in Framer[\s\S]*?-->\s*/i,
    "",
  );

  nextHtml = nextHtml.replace(
    /<a[^>]+href="https:\/\/www\.framer\.com"[^>]*>[\s\S]*?<\/a>\s*/gi,
    "",
  );

  nextHtml = nextHtml.replace(
    /\sdata-framer-search-index="[^"]*"/gi,
    "",
  );

  nextHtml = nextHtml.replace(/<!-- Published[\s\S]*?-->\s*/i, "");

  return nextHtml;
}

async function main() {
  await ensureAssetDirectories();

  const html = await fs.readFile(inputHtmlPath, "utf8");
  const initialUrls = extractUrls(html).filter(isProbablyAssetUrl);

  await crawlTextAssets(initialUrls);
  await rewriteDownloadedTextAssets();
  await createJsModuleAliases();

  let rewrittenHtml = replaceAllMappedUrls(html);
  rewrittenHtml = removeBuilderCode(rewrittenHtml);

  await fs.writeFile(inputHtmlPath, rewrittenHtml, "utf8");

  const remainingExternalUrls = extractUrls(rewrittenHtml).filter((url) => {
    if (url === "http://www.w3.org/2000/svg") return false;
    const host = new URL(url).hostname;
    return !["linkedin.com", "facebook.com", "youtube.com", "x.com", "Cal.com"].includes(host);
  });

  const report = {
    generatedAt: new Date().toISOString(),
    downloadedAssetCount: downloaded.length,
    downloadedAssetsThisRun: downloaded.sort((a, b) => a.localPath.localeCompare(b.localPath)),
    totalLocalAssetCount: 0,
    localAssets: [],
    removedDependencies,
    remainingExternalUrls,
  };

  report.localAssets = await collectExistingAssets();
  report.totalLocalAssetCount = report.localAssets.length;

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`Downloaded ${downloaded.length} assets.`);
  console.log(`Remaining non-whitelisted external URLs: ${remainingExternalUrls.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
