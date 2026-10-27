import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const sourceHtmlPath = path.join(projectRoot, "tmp-knotch-source.html");
const outputHtmlPath = path.join(projectRoot, "index.html");

const siteOrigin = "https://knotch.framer.ai";
const siteBase = "https://framerusercontent.com/sites/76ljWWjkk5B1TDb6r8crY7/";

const assetDirs = {
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

const textExtensions = new Set([".html", ".css", ".js", ".mjs", ".json", ".svg", ".xml", ".txt"]);
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
  ".js",
  ".mjs",
  ".json",
  ".mp4",
  ".webm",
  ".mp3",
  ".wav",
  ".ogg",
  ".pdf",
  ".framercms",
]);

const remoteToLocal = new Map();
const localToRemote = new Map();
const downloaded = [];

function ensureSlash(value) {
  return value.replace(/\\/g, "/");
}

function isRemoteAssetUrl(raw) {
  if (!raw) return false;
  try {
    const url = new URL(raw, siteBase);
    if (!/^https?:$/.test(url.protocol)) return false;
    if (!/(framerusercontent\.com|fonts\.gstatic\.com)$/i.test(url.hostname)) return false;
    const ext = path.posix.extname(url.pathname).toLowerCase();
    return downloadableExtensions.has(ext);
  } catch {
    return false;
  }
}

function categoryForUrl(raw) {
  const url = new URL(raw, siteBase);
  const ext = path.posix.extname(url.pathname).toLowerCase();

  if ([".woff", ".woff2", ".ttf", ".otf"].includes(ext)) return "fonts";
  if (ext === ".css") return "css";
  if ([".js", ".mjs"].includes(ext)) return "js";
  if (ext === ".json") return "json";
  if (ext === ".framercms") return "other";
  if ([".mp4", ".webm"].includes(ext)) return "videos";
  if ([".mp3", ".wav", ".ogg"].includes(ext)) return "audio";
  if (ext === ".ico") return "icons";
  if (ext === ".svg") {
    if (/arrow=|icon|favicon/i.test(raw)) return "icons";
    return "svg";
  }
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"].includes(ext)) return "images";
  return "other";
}

function localPathForRemote(raw) {
  const remote = new URL(raw, siteBase).toString();
  if (remoteToLocal.has(remote)) return remoteToLocal.get(remote);

  const url = new URL(remote);
  const category = categoryForUrl(remote);
  const baseName = path.posix.basename(url.pathname);
  const safeName = baseName.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const localPath = `${assetDirs[category]}/${safeName}`;

  remoteToLocal.set(remote, localPath);
  localToRemote.set(localPath, remote);
  return localPath;
}

function unique(items) {
  return [...new Set(items)];
}

function extractAbsoluteRemoteRefs(text, baseUrl) {
  const found = new Set();
  const absoluteMatches = text.match(/https?:\/\/[^"'`\s)<>\]]+/g) ?? [];
  for (const match of absoluteMatches) {
    const cleaned = match.replace(/&amp;/g, "&");
    if (isRemoteAssetUrl(cleaned)) found.add(new URL(cleaned, baseUrl).toString());
  }
  return [...found];
}

function extractAssetRefs(text, baseUrl) {
  const found = new Set(extractAbsoluteRemoteRefs(text, baseUrl));

  const runtimeUrlPattern =
    /new URL\((["'`])(\.{0,2}\/[^"'`?#)]+\.(?:framercms|mjs|js|json|svg|png|jpg|jpeg|webp|avif|ico|woff2?|ttf|otf|mp4|webm|mp3|wav|pdf))\1,\s*(["'`])(https?:\/\/[^"'`]+)\3\)(?:\.href)?(?:\.replace\((["'`])\/modules\/\5,\s*(["'`])\/cms\/\6\))?/g;
  let runtimeMatch;
  while ((runtimeMatch = runtimeUrlPattern.exec(text)) !== null) {
    const candidate = runtimeMatch[2];
    const runtimeBase = runtimeMatch[4];
    let resolved = new URL(candidate, runtimeBase).toString();
    if (runtimeMatch[4].includes("/modules/") && runtimeMatch[0].includes(".replace(")) {
      resolved = resolved.replace("/modules/", "/cms/");
    }
    if (isRemoteAssetUrl(resolved)) found.add(resolved);
  }

  const relativePatterns = [
    /import\((["'`])(\.{0,2}\/[^"'`?#)]+\.(?:mjs|js|json))\1\)/g,
    /from\s+(["'`])(\.{0,2}\/[^"'`?#)]+\.(?:mjs|js|json|framercms))\1/g,
    /\bhref=(["'])(\.{0,2}\/[^"'?#]+\.(?:mjs|js|json|framercms|svg|png|jpg|jpeg|webp|avif|ico|woff2?|ttf|otf|mp4|webm|mp3|wav|pdf)(?:\?[^"']*)?)\1/g,
    /\bsrc=(["'])(\.{0,2}\/[^"'?#]+\.(?:mjs|js|json|framercms|svg|png|jpg|jpeg|webp|avif|ico|woff2?|ttf|otf|mp4|webm|mp3|wav|pdf)(?:\?[^"']*)?)\1/g,
    /url\((["']?)(\.{0,2}\/[^"'?#)]+\.(?:framercms|svg|png|jpg|jpeg|webp|avif|ico|woff2?|ttf|otf|mp4|webm|mp3|wav|pdf)(?:\?[^"')]+)?)\1\)/g,
  ];

  for (const pattern of relativePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const candidate = match[2];
      const resolved = new URL(candidate, baseUrl).toString();
      if (isRemoteAssetUrl(resolved)) found.add(resolved);
    }
  }

  return [...found];
}

async function ensureDirs() {
  await Promise.all(
    Object.values(assetDirs).map((dir) => fs.mkdir(path.join(projectRoot, dir), { recursive: true })),
  );
}

async function listFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(absolutePath)));
      continue;
    }
    files.push(absolutePath);
  }

  return files;
}

async function downloadRemote(remoteUrl) {
  const localPath = localPathForRemote(remoteUrl);
  const absolutePath = path.join(projectRoot, localPath);

  try {
    await fs.access(absolutePath);
    return localPath;
  } catch {}

  const response = await fetch(remoteUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${remoteUrl}: ${response.status} ${response.statusText}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  await fs.writeFile(absolutePath, bytes);
  downloaded.push({ remoteUrl, localPath, bytes: bytes.byteLength });
  return localPath;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function crawlFromHtml(sourceHtml) {
  const queue = extractAssetRefs(sourceHtml, siteBase);
  const seen = new Set();

  while (queue.length > 0) {
    const remoteUrl = queue.shift();
    if (seen.has(remoteUrl)) continue;
    seen.add(remoteUrl);

    const localPath = await downloadRemote(remoteUrl);
    const ext = path.extname(localPath).toLowerCase();
    if (!textExtensions.has(ext)) continue;

    const assetText = await fs.readFile(path.join(projectRoot, localPath), "utf8");
    const discovered = extractAssetRefs(assetText, remoteUrl);
    for (const nextUrl of discovered) {
      if (!seen.has(nextUrl)) queue.push(nextUrl);
    }
  }
}

function replaceRemoteWithLocal(text) {
  let output = text;
  const entries = [...remoteToLocal.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [remoteUrl, localPath] of entries) {
    const escaped = remoteUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    output = output.replace(new RegExp(escaped, "g"), localPath);

    const encoded = remoteUrl.replace(/&/g, "&amp;");
    if (encoded !== remoteUrl) {
      const escapedEncoded = encoded.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      output = output.replace(new RegExp(escapedEncoded, "g"), localPath);
    }
  }
  return output;
}

function localizePaths(text) {
  return text
    .replace(/(["'(=])assets\//g, "$1/assets/")
    .replace(/(?<=\s)assets\//g, "/assets/");
}

function fixHtmlLinks(text) {
  let html = text;

  html = html.replace(/<!-- Made in Framer[\s\S]*?-->\s*/gi, "");
  html = html.replace(/<meta name="generator"[^>]*>\s*/gi, "");
  html = html.replace(/<script\b[^>]*>[\s\S]*?(?:__framer_force_showing_editorbar_since|framer\.com\/edit\/init\.mjs)[\s\S]*?<\/script>\s*/gi, "");
  html = html.replace(/<script[^>]*events\.framer\.com\/script[^>]*><\/script>\s*/gi, "");
  html = html.replace(/<div[^>]*class="[^"]*framer-1qebla2-container[^"]*"[^>]*>[\s\S]*?Use for Free[\s\S]*?<\/div>\s*/gi, "");
  html = html.replace(/<div id="__framer-badge-container">[\s\S]*?<\/a><!--\/\$--><!--\/\$--><!--\/\$--><\/div>\s*/gi, "");
  html = html.replace(/\sdata-framer-hydrate-v2="[^"]*"/gi, "");
  html = html
    .replace(/#__framer-badge-container\{[^}]*\}/g, "#__framer-badge-container{display:none!important}")
    .replace(/\.framer-SStzd \.framer-1qebla2-container\{[^}]*\}/g, ".framer-SStzd .framer-1qebla2-container{display:none!important}");

  const navTargets = new Map([
    ["Home", "/"],
    ["About", "/about/"],
    ["Blog", "/blog/"],
    ["Contact", "/contact/"],
  ]);

  for (const [label, href] of navTargets) {
    const pattern = new RegExp(
      `(<a[^>]*data-framer-name="Out"(?![^>]*\\bhref=)[^>]*)(>\\s*<div[^>]*>\\s*<p[^>]*>${label}<\\/p>)`,
      "g",
    );
    html = html.replace(pattern, `$1 href="${href}"$2`);
  }

  html = html
    .replace(/href="\.\//g, 'href="/')
    .replace(/href="\/""/g, 'href="/"')
    .replace(/href="\/"about/g, 'href="/about')
    .replace(/href="\/"blog/g, 'href="/blog')
    .replace(/href="\/"contact/g, 'href="/contact')
    .replace(/href="\/"legal-pages/g, 'href="/legal-pages')
    .replace(/href="\/"#/g, 'href="/#')
    .replace(/href="\/about"/g, 'href="/about/"')
    .replace(/href="\/blog"/g, 'href="/blog/"')
    .replace(/href="\/contact"/g, 'href="/contact/"')
    .replace(/href="\/legal-pages\/privacy-policy"/g, 'href="/legal-pages/privacy-policy/"')
    .replace(/href="#"/g, 'href="/"');

  html = html
    .replace(/<link[^>]*href="https:\/\/fonts\.gstatic\.com"[^>]*>\s*/gi, "")
    .replace(/https:\/\/framer\.link\/kanishkdubey/gi, "#")
    .replace(/https:\/\/framer\.link\/1YNSJpf\?duplicateType=siteTemplate/gi, "#");

  html = html
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/gi, "")
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/gi, "");

  return localizePaths(html);
}

async function rewriteDownloadedTextAssets() {
  for (const localPath of localToRemote.keys()) {
    const ext = path.extname(localPath).toLowerCase();
    if (!textExtensions.has(ext)) continue;

    const absolutePath = path.join(projectRoot, localPath);
    let content = await fs.readFile(absolutePath, "utf8");
    content = replaceRemoteWithLocal(content);
    content = localizePaths(content);
    await fs.writeFile(absolutePath, content);
  }
}

async function crawlExistingTextFiles() {
  const allFiles = await listFiles(projectRoot);
  const queue = [];
  const seen = new Set();

  for (const absolutePath of allFiles) {
    if (absolutePath.includes(`${path.sep}tools${path.sep}`)) continue;
    const relativePath = ensureSlash(path.relative(projectRoot, absolutePath));
    const ext = path.extname(absolutePath).toLowerCase();
    if (!textExtensions.has(ext) && ext !== ".html") continue;

    const text = await fs.readFile(absolutePath, "utf8");
    const baseUrl = localToRemote.get(relativePath);
    const refs = baseUrl
      ? extractAssetRefs(text, baseUrl)
      : ext === ".html"
        ? extractAssetRefs(text, siteBase)
        : extractAbsoluteRemoteRefs(text, siteBase);
    for (const remoteUrl of refs) {
      if (!seen.has(remoteUrl)) {
        seen.add(remoteUrl);
        queue.push(remoteUrl);
      }
    }
  }

  while (queue.length > 0) {
    const remoteUrl = queue.shift();
    const localPath = await downloadRemote(remoteUrl);
    const ext = path.extname(localPath).toLowerCase();
    if (!textExtensions.has(ext)) continue;

    const assetText = await fs.readFile(path.join(projectRoot, localPath), "utf8");
    const discovered = extractAssetRefs(assetText, remoteUrl);
    for (const nextUrl of discovered) {
      if (!seen.has(nextUrl)) {
        seen.add(nextUrl);
        queue.push(nextUrl);
      }
    }
  }
}

async function rewriteAllTextFiles() {
  const allFiles = await listFiles(projectRoot);

  for (const absolutePath of allFiles) {
    if (absolutePath.includes(`${path.sep}tools${path.sep}`)) continue;
    const relativePath = path.relative(projectRoot, absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    if (!textExtensions.has(ext) && ext !== ".html") continue;

    let content = await fs.readFile(absolutePath, "utf8");
    content = replaceRemoteWithLocal(content);
    content = localizePaths(content);

    if (ext === ".html") {
      content = fixHtmlLinks(content);
    }

    await fs.writeFile(path.join(projectRoot, relativePath), content);
  }
}

async function createJsAliases() {
  const jsDir = path.join(projectRoot, assetDirs.js);
  const entries = await fs.readdir(jsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const absolutePath = path.join(jsDir, entry.name);
    const aliasPath = path.join(jsDir, entry.name.replace(/-[0-9a-f]{10}(?=\.)/i, ""));
    if (aliasPath !== absolutePath) {
      await fs.copyFile(absolutePath, aliasPath);
    }
  }
}

async function buildRouteCopies(indexHtml) {
  const searchIndexPath = path.join(projectRoot, "assets", "json", "searchIndex-seGWyFx6BTMN.json");
  const raw = await fs.readFile(searchIndexPath, "utf8");
  const routes = Object.keys(JSON.parse(raw)).filter((route) => route !== "/" && route !== "/404");

  for (const route of routes) {
    const relativeDir = route.replace(/^\/+/, "");
    const pageDir = path.join(projectRoot, relativeDir);
    await fs.mkdir(pageDir, { recursive: true });
    const remoteHtml = await fetchText(new URL(route, `${siteOrigin}/`).toString());
    await crawlFromHtml(remoteHtml);
    let localizedRouteHtml = replaceRemoteWithLocal(remoteHtml);
    localizedRouteHtml = fixHtmlLinks(localizedRouteHtml);
    await fs.writeFile(path.join(pageDir, "index.html"), localizedRouteHtml);
  }
}

async function writeReport() {
  const report = {
    generatedAt: new Date().toISOString(),
    downloadedAssetCount: downloaded.length,
    downloadedAssetsThisRun: downloaded,
    totalMappedAssets: remoteToLocal.size,
  };

  await fs.writeFile(
    path.join(projectRoot, "migration-report.json"),
    JSON.stringify(report, null, 2),
  );
}

async function main() {
  await ensureDirs();

  const sourceHtml = await fs.readFile(sourceHtmlPath, "utf8");
  await crawlFromHtml(sourceHtml);
  await crawlExistingTextFiles();
  await rewriteDownloadedTextAssets();
  await rewriteAllTextFiles();
  await createJsAliases();

  let localizedHtml = replaceRemoteWithLocal(sourceHtml);
  localizedHtml = fixHtmlLinks(localizedHtml);

  await fs.writeFile(outputHtmlPath, localizedHtml);
  await buildRouteCopies(localizedHtml);
  await writeReport();

  console.log(`Recovered ${downloaded.length} assets and generated local route files.`);
}

await main();
