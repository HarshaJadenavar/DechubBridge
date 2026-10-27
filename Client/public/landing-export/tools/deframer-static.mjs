import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const htmlFiles = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "tools" || entry.name === ".git" || entry.name === "tmp-knotch-source.html") {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".html")) {
      htmlFiles.push(fullPath);
    }
  }
}

function stripFramerScripts(html) {
  return html
    .replace(/<script type="framer\/appear"[\s\S]*?<\/script>/g, "")
    .replace(/<script data-framer-appear-animation="[^"]*"[\s\S]*?<\/script>/g, "")
    .replace(/<script type="framer\/handover"[\s\S]*?<\/script>/g, "")
    .replace(/<script type="module"[^>]*data-framer-bundle="main"[\s\S]*?<\/script>/g, "")
    .replace(/<link rel="modulepreload"[\s\S]*?(?=<script type="module"|<div id="svg-templates")/g, "")
    .replace(/<script>\(\(\)=>\{function u\(\)[\s\S]*?<\/script>/g, "")
    .replace(/<script>!function\(\)\{var w="framer_variant"[\s\S]*?<\/script>/g, "")
    .replace(/<script>var animator=\(\(\)=>\{[\s\S]*?<\/script>/g, "")
    .replace(/<script>typeof document<"u"[\s\S]*?<\/script>/g, "");
}

function injectStaticAssets(html) {
  const headClose = "</head>";
  const bodyClose = "</body>";
  const styleTag = '\n<link rel="stylesheet" href="/assets/css/site.css">';
  const scriptTag = '\n<script defer src="/assets/js/site.js"></script>';
  let next = html;

  if (!next.includes('/assets/css/site.css')) {
    next = next.replace(headClose, `${styleTag}\n${headClose}`);
  }
  if (!next.includes('/assets/js/site.js')) {
    next = next.replace(bodyClose, `${scriptTag}\n${bodyClose}`);
  }
  return next;
}

function normalizeFramerArtifacts(html) {
  return html
    .replace(/__framer-badge-container/g, "removed-badge-container")
    .replace(/data-framer-appear-id=/g, "data-static-appear-id=")
    .replace(/\sdata-framer-name="Phone Open"/g, ' data-static-variant="phone-open"')
    .replace(/\sdata-framer-name="Tablet Open"/g, ' data-static-variant="tablet-open"')
    .replace(/\sdata-framer-name="Desktop Open"/g, ' data-static-variant="desktop-open"');
}

async function main() {
  await walk(rootDir);

  for (const file of htmlFiles) {
    const original = await fs.readFile(file, "utf8");
    let updated = original;
    updated = stripFramerScripts(updated);
    updated = normalizeFramerArtifacts(updated);
    updated = injectStaticAssets(updated);

    if (updated !== original) {
      await fs.writeFile(file, updated, "utf8");
    }
  }

  console.log(`Processed ${htmlFiles.length} HTML files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
