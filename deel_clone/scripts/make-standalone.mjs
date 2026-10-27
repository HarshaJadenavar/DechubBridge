import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, "assets");
const SOURCE_FILES = [
  path.join(ROOT, "index.html"),
  path.join(ROOT, "solutions", "it", "index.html"),
];

const DOWNLOADABLE_HOSTS = new Set([
  "website-media.deel.com",
  "deel-website-media-prod.s3.amazonaws.com",
]);

const STATIC_PAGE_HOSTS = new Set([
  "www.deel.com",
  "deel.com",
]);

const TRACKING_HOST_PATTERNS = [
  "googletagmanager.com",
  "google-analytics.com",
  "cookiebot.com",
  "cloudflareinsights.com",
  "hs-scripts.com",
  "growth-tools.deel.com",
  "get.geojs.io",
];

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".json",
  ".html",
  ".svg",
  ".txt",
  ".xml",
]);

const removedDependencies = new Set();
const downloadedAssets = [];
const downloadMap = new Map();
const textAssets = new Set();
const discoveredUrls = new Set();

function normalizeCandidateUrl(raw) {
  if (!raw) return null;
  let value = raw.trim();
  value = value.replace(/\\/g, "");
  value = value.replace(/[),.;]+$/g, "");
  if (value.startsWith("data:")) return null;
  if (value.startsWith("mailto:") || value.startsWith("tel:")) return null;
  if (!/^https?:\/\//i.test(value)) return null;
  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

function assetBucketFromUrl(url, contentType = "") {
  const pathname = new URL(url).pathname.toLowerCase();
  const ext = path.extname(pathname);
  const type = contentType.toLowerCase();

  if (ext === ".css" || type.includes("text/css")) return "css";
  if (ext === ".js" || ext === ".mjs" || type.includes("javascript")) return "js";
  if ([".woff", ".woff2", ".ttf", ".otf", ".eot"].includes(ext) || type.includes("font/")) return "fonts";
  if ([".mp4", ".webm", ".mov", ".m4v"].includes(ext) || type.startsWith("video/")) return "videos";
  if ([".mp3", ".wav", ".ogg", ".m4a"].includes(ext) || type.startsWith("audio/")) return "audio";
  if (ext === ".json" || type.includes("application/json")) return "json";
  if ([".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".bmp"].includes(ext) || type.startsWith("image/")) return "images";
  return "other";
}

function sanitizeSegment(value) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function extensionFromType(contentType) {
  const type = contentType.split(";")[0].trim().toLowerCase();
  const map = {
    "image/svg+xml": ".svg",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
    "image/x-icon": ".ico",
    "font/woff2": ".woff2",
    "font/woff": ".woff",
    "text/css": ".css",
    "application/javascript": ".js",
    "text/javascript": ".js",
    "application/json": ".json",
    "video/mp4": ".mp4",
  };
  return map[type] || "";
}

function toLocalAssetPath(url, contentType = "") {
  const parsed = new URL(url);
  const bucket = assetBucketFromUrl(url, contentType);
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 8);
  const hostPart = sanitizeSegment(parsed.hostname);
  const fileNameFromUrl = path.basename(parsed.pathname) || "index";
  const ext = path.extname(fileNameFromUrl) || extensionFromType(contentType) || "";
  const baseName = sanitizeSegment(path.basename(fileNameFromUrl, path.extname(fileNameFromUrl)) || "asset");
  return path.join("assets", bucket, hostPart, `${baseName}-${hash}${ext}`);
}

function shouldDownload(url) {
  const parsed = new URL(url);
  if (DOWNLOADABLE_HOSTS.has(parsed.hostname)) {
    if (parsed.pathname === "/" || parsed.pathname === "") return false;
    if (!path.extname(parsed.pathname)) return false;
    return true;
  }

  if (STATIC_PAGE_HOSTS.has(parsed.hostname)) {
    const pathname = parsed.pathname.toLowerCase();
    if (pathname === "/icon.png" || pathname === "/apple-icon.png") return true;
  }

  return false;
}

function isTrackingUrl(url) {
  const hostname = new URL(url).hostname.toLowerCase();
  return TRACKING_HOST_PATTERNS.some((pattern) => hostname.includes(pattern));
}

function collectUrlsFromText(text) {
  const urls = new Set();
  const directRegex = /https?:\/\/[^\s"'<>)}\\]+/g;
  for (const match of text.matchAll(directRegex)) {
    const normalized = normalizeCandidateUrl(match[0]);
    if (normalized) urls.add(normalized);
  }

  const nextImageRegex = /\/_next\/image\/\?url=([^"'&\s>]+)/g;
  for (const match of text.matchAll(nextImageRegex)) {
    try {
      const decoded = decodeURIComponent(match[1]);
      const normalized = normalizeCandidateUrl(decoded);
      if (normalized) urls.add(normalized);
    } catch {
      continue;
    }
  }

  return urls;
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "assets" || entry.name === "scripts") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function downloadUrl(url) {
  if (downloadMap.has(url)) return;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const relativePath = toLocalAssetPath(url, contentType);
  const outputPath = path.join(ROOT, relativePath);
  await ensureDir(outputPath);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(outputPath, buffer);

  downloadMap.set(url, {
    url,
    relativePath: relativePath.replace(/\\/g, "/"),
    outputPath,
    contentType,
  });

  downloadedAssets.push(relativePath.replace(/\\/g, "/"));

  const extension = path.extname(outputPath).toLowerCase();
  if (TEXT_EXTENSIONS.has(extension) || contentType.includes("json")) {
    textAssets.add(outputPath);
    const text = buffer.toString("utf8");
    for (const discovered of collectUrlsFromText(text)) {
      if (!discoveredUrls.has(discovered)) {
        discoveredUrls.add(discovered);
      }
    }
  }
}

function rewriteNextImageUrls(content, currentFileDir) {
  return content.replace(/\/_next\/image\/\?url=([^"'&\s>]+)([^"'<>\s]*)/g, (fullMatch, encodedUrl) => {
    try {
      const originalUrl = normalizeCandidateUrl(decodeURIComponent(encodedUrl));
      if (!originalUrl) return fullMatch;
      const asset = downloadMap.get(originalUrl);
      if (!asset) return fullMatch;
      return path.relative(currentFileDir, path.join(ROOT, asset.relativePath)).replace(/\\/g, "/");
    } catch {
      return fullMatch;
    }
  });
}

function rewriteKnownUrls(content, currentFileDir) {
  let nextContent = content;

  for (const [originalUrl, asset] of downloadMap.entries()) {
    const relativePath = path.relative(currentFileDir, path.join(ROOT, asset.relativePath)).replace(/\\/g, "/");
    nextContent = nextContent.split(originalUrl).join(relativePath);
  }

  nextContent = rewriteNextImageUrls(nextContent, currentFileDir);

  nextContent = nextContent.replace(/https?:\/\/www\.deel\.com\/solutions\/it\/?/g, "/solutions/it/");
  nextContent = nextContent.replace(/https?:\/\/www\.deel\.com\/?/g, "/");
  nextContent = nextContent.replace(/https?:\/\/deel\.com\/?/g, "/");
  nextContent = nextContent.replace(/https?:\/\/app\.deel\.com\/[^"'\\s<)]*/g, "#");
  nextContent = nextContent.split("https://website-media.deel.com").join("");

  return nextContent;
}

function stripRemovedDependencies(content) {
  let nextContent = content;

  const removableTagPatterns = [
    /<link[^>]+(?:preconnect|dns-prefetch)[^>]+>/gi,
    /<script[^>]+src="https?:\/\/[^"]+"[^>]*><\/script>/gi,
  ];

  for (const pattern of removableTagPatterns) {
    nextContent = nextContent.replace(pattern, (tag) => {
      const urls = collectUrlsFromText(tag);
      if ([...urls].some(isTrackingUrl)) {
        for (const url of urls) removedDependencies.add(url);
        return "";
      }
      return tag;
    });
  }

  const inlineScriptPatterns = [
    /<script[^>]*id="cookiebot-reinsert-script"[^>]*>[\s\S]*?<\/script>/gi,
    /<script[^>]*id="google-analytics-script"[^>]*>[\s\S]*?<\/script>/gi,
    /<script[^>]*id="deel-pb-script"[^>]*>[\s\S]*?<\/script>/gi,
    /<script[^>]*id="coralogix-config"[^>]*>[\s\S]*?<\/script>/gi,
    /<script[^>]*>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];\s*<\/script>/gi,
  ];

  for (const pattern of inlineScriptPatterns) {
    nextContent = nextContent.replace(pattern, (match) => {
      for (const url of collectUrlsFromText(match)) removedDependencies.add(url);
      return "";
    });
  }

  nextContent = nextContent.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (match) => {
    const lowered = match.toLowerCase();
    const shouldRemove =
      lowered.includes("hs-scripts.com") ||
      lowered.includes("hs-consent-loader") ||
      lowered.includes("growth-tools.deel.com") ||
      lowered.includes("deel-ai-script") ||
      lowered.includes("get.geojs.io") ||
      lowered.includes("cookiebot") ||
      lowered.includes("google-analytics.com") ||
      lowered.includes("googletagmanager.com") ||
      lowered.includes("cloudflareinsights.com") ||
      lowered.includes("cdn-cgi/rum?");

    if (!shouldRemove) return match;

    for (const url of collectUrlsFromText(match)) removedDependencies.add(url);
    return "";
  });

  return nextContent;
}

function cleanSeoLinks(content, currentFile) {
  const isRoot = path.resolve(currentFile) === path.resolve(SOURCE_FILES[0]);
  const pageHref = isRoot ? "./index.html" : "../../index.html";

  let nextContent = content;
  nextContent = nextContent.replace(/<link rel="canonical"[^>]+>/i, `<link rel="canonical" href="${pageHref}"/>`);
  nextContent = nextContent.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${pageHref}"/>`);
  nextContent = nextContent.replace(/<link rel="alternate"[^>]+hrefLang="[^"]+"[^>]*>/gi, "");
  return nextContent;
}

async function rewriteFile(filePath) {
  const original = await fs.readFile(filePath, "utf8");
  const currentFileDir = path.dirname(filePath);

  let updated = rewriteKnownUrls(original, currentFileDir);
  updated = stripRemovedDependencies(updated);
  if (filePath.endsWith(".html")) {
    updated = cleanSeoLinks(updated, filePath);
  }

  await fs.writeFile(filePath, updated, "utf8");
}

async function writeReports() {
  const reportsDir = path.join(ROOT, "assets", "other");
  await fs.mkdir(reportsDir, { recursive: true });

  const assetListPath = path.join(reportsDir, "downloaded-assets.txt");
  await fs.writeFile(assetListPath, downloadedAssets.sort().join("\n"), "utf8");

  const removedPath = path.join(reportsDir, "removed-dependencies.txt");
  await fs.writeFile(removedPath, [...removedDependencies].sort().join("\n"), "utf8");
}

async function verifyNoOriginalHosts() {
  const files = await listFiles(ROOT);
  const offenders = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_EXTENSIONS.has(ext)) continue;
    const content = await fs.readFile(file, "utf8");
    if (/https?:\/\/(?:www\.)?deel\.com/i.test(content) || /https?:\/\/website-media\.deel\.com/i.test(content)) {
      offenders.push(path.relative(ROOT, file).replace(/\\/g, "/"));
    }
  }

  return offenders;
}

async function main() {
  for (const file of SOURCE_FILES) {
    const content = await fs.readFile(file, "utf8");
    for (const url of collectUrlsFromText(content)) {
      discoveredUrls.add(url);
    }
  }

  let pending = [...discoveredUrls];
  while (pending.length > 0) {
    const current = pending;
    pending = [];

    for (const url of current) {
      if (isTrackingUrl(url)) {
        removedDependencies.add(url);
        continue;
      }

      if (!shouldDownload(url)) continue;
      if (downloadMap.has(url)) continue;
      await downloadUrl(url);
    }

    for (const url of discoveredUrls) {
      if (!downloadMap.has(url) && shouldDownload(url) && !pending.includes(url)) {
        pending.push(url);
      }
    }
  }

  const filesToRewrite = new Set([...SOURCE_FILES, ...textAssets]);
  for (const file of filesToRewrite) {
    await rewriteFile(file);
  }

  await fs.writeFile(path.join(ROOT, "cdn-cgi", "rum.html"), "", "utf8");

  await writeReports();
  const offenders = await verifyNoOriginalHosts();

  if (offenders.length > 0) {
    throw new Error(`Original host references remain in: ${offenders.join(", ")}`);
  }

  console.log(JSON.stringify({
    downloadedCount: downloadedAssets.length,
    removedDependencies: [...removedDependencies].sort(),
    reportFiles: [
      "assets/other/downloaded-assets.txt",
      "assets/other/removed-dependencies.txt",
    ],
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
