import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const htmlPath = path.join(root, "index.html");

const stylesheetPattern =
  /<link\s+rel="stylesheet"\s+href="([^"]+)"[^>]*data-precedence="next"[^>]*\/?>/gi;

function escapeStyleCloseTag(css) {
  return css.replace(/<\/style/gi, "<\\/style");
}

async function main() {
  let html = await fs.readFile(htmlPath, "utf8");
  const matches = [...html.matchAll(stylesheetPattern)];

  if (matches.length === 0) {
    console.log("no-stylesheets-found");
    return;
  }

  for (const match of matches) {
    const href = match[1];
    const cssPath = path.join(root, href.replace(/\//g, path.sep));
    const css = await fs.readFile(cssPath, "utf8");
    const replacement = `<style data-inlined-from="${href}">\n${escapeStyleCloseTag(
      css
    )}\n</style>`;
    html = html.replace(match[0], replacement);
  }

  await fs.writeFile(htmlPath, html, "utf8");
  console.log(`inlined-${matches.length}-stylesheets`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
