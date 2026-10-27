import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const sourceHtmlPath = path.resolve(projectRoot, "../New_Page/solutions/embedded/index.html");
const outputRoot = path.resolve(projectRoot, "public/solutions/embedded");
const outputHtmlPath = path.join(outputRoot, "index.html");
const reportPath = path.join(outputRoot, "migration-report.json");

const assetRoots = {
  images: "assets/images",
  icons: "assets/icons",
  svg: "assets/svg",
  fonts: "assets/fonts",
  css: "assets/css",
  other: "assets/other",
};

const textAssetExtensions = new Set([".css", ".svg"]);
const downloadableExtensions = new Set([
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
]);

const allowedAssetHosts = new Set([
  "website-media.deel.com",
  "deel-website-media-prod.s3.amazonaws.com",
  "media.letsdeel.com",
]);

const routeMappings = new Map([
  ["https://www.deel.com/", "/"],
  ["https://www.deel.com", "/"],
  ["https://www.deel.com/solutions/embedded/", "/solutions/embedded"],
  ["https://www.deel.com/solutions/embedded", "/solutions/embedded"],
  ["https://www.deel.com/request-a-demo/", "/contact"],
  ["https://www.deel.com/request-a-demo", "/contact"],
  ["https://app.deel.com/login?lang=en", "/company/login"],
  ["https://app.deel.com/login", "/company/login"],
]);

const trackedPatterns = [
  /<script\b[\s\S]*?<\/script>\s*/gi,
  /<noscript\b[\s\S]*?<\/noscript>\s*/gi,
  /<link[^>]+rel="preconnect"[^>]*>\s*/gi,
  /<link[^>]+rel="dns-prefetch"[^>]*>\s*/gi,
  /<link[^>]+rel="preload"[^>]+as="script"[^>]*>\s*/gi,
  /<link[^>]+rel="canonical"[^>]*>\s*/gi,
  /<link[^>]+rel="alternate"[^>]*>\s*/gi,
  /<meta[^>]+property="og:url"[^>]*>\s*/gi,
  /<meta[^>]+property="og:image"[^>]*>\s*/gi,
  /<meta[^>]+name="twitter:image"[^>]*>\s*/gi,
  /<link[^>]+rel="icon"[^>]*>\s*/gi,
  /<link[^>]+rel="apple-touch-icon"[^>]*>\s*/gi,
];

const removedDependencies = [];
const assetMap = new Map();
const downloadedAssets = [];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function normalizeUrl(rawUrl) {
  return rawUrl.replace(/[\\'"]+$/g, "");
}

function isDownloadableAssetUrl(rawUrl) {
  if (!/^https?:\/\//i.test(rawUrl)) {
    return false;
  }

  try {
    const url = new URL(rawUrl);
    const ext = path.posix.extname(url.pathname).toLowerCase();
    return allowedAssetHosts.has(url.hostname) && downloadableExtensions.has(ext);
  } catch {
    return false;
  }
}

function categoryForUrl(rawUrl) {
  const url = new URL(rawUrl);
  const ext = path.posix.extname(url.pathname).toLowerCase();

  if ([".woff", ".woff2", ".ttf", ".otf"].includes(ext)) return "fonts";
  if (ext === ".css") return "css";
  if (ext === ".ico") return "icons";
  if (ext === ".svg") return /icon|favicon/i.test(url.pathname) ? "icons" : "svg";
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"].includes(ext)) return "images";
  return "other";
}

function localPathForUrl(rawUrl) {
  if (assetMap.has(rawUrl)) {
    return assetMap.get(rawUrl);
  }

  const url = new URL(rawUrl);
  const ext = path.posix.extname(url.pathname).toLowerCase();
  const category = categoryForUrl(rawUrl);
  const baseName = path.posix.basename(url.pathname, ext) || "asset";
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const hash = crypto.createHash("sha1").update(rawUrl).digest("hex").slice(0, 10);
  const localPath = `${assetRoots[category]}/${safeBaseName}-${hash}${ext}`;

  assetMap.set(rawUrl, localPath);
  return localPath;
}

function extractAssetUrls(text) {
  const urls = new Set();
  const absoluteMatches = text.match(/https?:\/\/[^"'`\s)<>\]]+/g) ?? [];

  absoluteMatches.forEach((match) => {
    const normalized = normalizeUrl(decodeHtml(match));
    if (isDownloadableAssetUrl(normalized)) {
      urls.add(normalized);
    }
  });

  const nextImageMatches = text.match(/\/_next\/image\/\?url=[^"'`\s)<>\]]+/g) ?? [];
  nextImageMatches.forEach((match) => {
    try {
      const query = match.split("?")[1] ?? "";
      const params = new URLSearchParams(query);
      const encodedUrl = params.get("url");
      if (!encodedUrl) {
        return;
      }

      const normalized = normalizeUrl(decodeHtml(decodeURIComponent(encodedUrl)));
      if (isDownloadableAssetUrl(normalized)) {
        urls.add(normalized);
      }
    } catch {
      // Ignore malformed optimizer URLs.
    }
  });

  return [...urls];
}

async function ensureDirectories() {
  await fs.mkdir(outputRoot, { recursive: true });
  await Promise.all(
    Object.values(assetRoots).map((dir) => fs.mkdir(path.join(outputRoot, dir), { recursive: true })),
  );
}

async function downloadAsset(rawUrl) {
  const localRelativePath = localPathForUrl(rawUrl);
  const localAbsolutePath = path.join(outputRoot, localRelativePath);

  try {
    await fs.access(localAbsolutePath);
    return localRelativePath;
  } catch {
    // keep downloading when the file does not exist yet
  }

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

  downloadedAssets.push({
    url: rawUrl,
    localPath: `solutions/embedded/${localRelativePath}`,
    bytes: bytes.byteLength,
  });

  return localRelativePath;
}

async function crawlAssets(seedUrls) {
  const queue = [...seedUrls];
  const seen = new Set();

  while (queue.length > 0) {
    const url = queue.shift();
    if (!url || seen.has(url) || !isDownloadableAssetUrl(url)) {
      continue;
    }

    seen.add(url);
    const localRelativePath = await downloadAsset(url);
    const ext = path.extname(localRelativePath).toLowerCase();

    if (!textAssetExtensions.has(ext)) {
      continue;
    }

    const assetText = await fs.readFile(path.join(outputRoot, localRelativePath), "utf8");
    const nestedUrls = extractAssetUrls(assetText);

    nestedUrls.forEach((nestedUrl) => {
      if (!seen.has(nestedUrl)) {
        queue.push(nestedUrl);
      }
    });
  }
}

function replaceMappedUrls(text) {
  let next = text;
  const sortedEntries = [...assetMap.entries()].sort((a, b) => b[0].length - a[0].length);

  sortedEntries.forEach(([remoteUrl, localRelativePath]) => {
    const localPath = `/solutions/embedded/${localRelativePath}`;
    next = next.replace(new RegExp(escapeRegex(remoteUrl), "g"), localPath);

    const encodedRemoteUrl = remoteUrl.replace(/&/g, "&amp;");
    if (encodedRemoteUrl !== remoteUrl) {
      next = next.replace(new RegExp(escapeRegex(encodedRemoteUrl), "g"), localPath);
    }
  });

  return next;
}

function rewriteNextImageOptimizerUrls(text) {
  return text.replace(/\/_next\/image\/\?url=([^"'`\s<>&]+(?:%[0-9A-Fa-f]{2}[^"'`\s<>&]*)*)(?:&amp;|&)w=\d+(?:&amp;|&)q=\d+/g, (match, encodedUrl) => {
    try {
      const decodedRemoteUrl = normalizeUrl(decodeHtml(decodeURIComponent(encodedUrl)));
      if (!isDownloadableAssetUrl(decodedRemoteUrl)) {
        return match;
      }

      const localRelativePath = localPathForUrl(decodedRemoteUrl);
      return `/solutions/embedded/${localRelativePath}`;
    } catch {
      return match;
    }
  });
}

function rewriteExternalAnchors(html) {
  let next = html;

  routeMappings.forEach((localPath, remoteUrl) => {
    next = next.replace(new RegExp(escapeRegex(remoteUrl), "g"), localPath);
  });

  next = next.replace(/https:\/\/www\.deel\.com\/[^\s"'<>)]*/gi, "#");
  next = next.replace(/https:\/\/app\.deel\.com\/[^\s"'<>)]*/gi, "/company/login");
  next = next.replace(/https:\/\/(?:help|developer|trust|status)\.deel\.com\/[^\s"'<>)]*/gi, "#");
  next = next.replace(/https:\/\/help\.letsdeel\.com\/[^\s"'<>)]*/gi, "#");
  next = next.replace(/https:\/\/(?:facebook\.com|get\.geojs\.io|instagram\.com|linkedin\.com|twitter\.com|www\.g2\.com|www\.akai\.run|deelsales\.trb\.ai)[^\s"'<>)]*/gi, "#");

  return next;
}

function stripTrackedMarkup(html) {
  let next = html;

  trackedPatterns.forEach((pattern) => {
    const matches = next.match(pattern);
    if (matches?.length) {
      removedDependencies.push(...matches.map((entry) => entry.slice(0, 120)));
    }
    next = next.replace(pattern, "");
  });

  next = next.replace(/\sdata-cookieconsent="[^"]*"/gi, "");
  next = next.replace(/\sdata-precedence="[^"]*"/gi, "");
  next = next.replace(/\sdata-nscript="[^"]*"/gi, "");
  next = next.replace(/\snonce="[^"]*"/gi, "");

  return next;
}

function normalizeHead(html) {
  return html
    .replace(/<meta name="next-size-adjust" content="\/?>/gi, "")
    .replace(/<head>/i, '<head><meta charSet="utf-8"/>');
}

async function main() {
  await ensureDirectories();

  let html = await fs.readFile(sourceHtmlPath, "utf8");
  const assetUrls = extractAssetUrls(html);
  await crawlAssets(assetUrls);

  html = replaceMappedUrls(html);
  html = rewriteNextImageOptimizerUrls(html);
  html = rewriteExternalAnchors(html);
  html = stripTrackedMarkup(html);
  html = normalizeHead(html);
  html = html.replace(/\s{2,}/g, " ");

  await fs.writeFile(outputHtmlPath, html, "utf8");
  await fs.writeFile(
    reportPath,
    JSON.stringify(
      {
        sourceHtmlPath,
        outputHtmlPath,
        downloadedAssets,
        removedDependencies,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Migrated Embedded page to ${outputHtmlPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
