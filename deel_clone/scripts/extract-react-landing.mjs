import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceHtmlPath = path.join(root, "landing-source.html");
const fallbackHtmlPath = path.join(root, "index.html");

const inputPath = fs.existsSync(sourceHtmlPath) ? sourceHtmlPath : fallbackHtmlPath;
const html = fs.readFileSync(inputPath, "utf8");

const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

if (!headMatch || !bodyMatch) {
  throw new Error("Could not extract head/body from source HTML.");
}

const headContent = headMatch[1];
const bodyContent = bodyMatch[1];

const styleMatches = [...headContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
const bodyStyleMatches = [...bodyContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];

const normalizeCssAssetPaths = (css) =>
  css
    .replace(/url\((['"]?)\.\.\/\.\.\/fonts\//g, "url($1/assets/fonts/")
    .replace(/url\((['"]?)assets\/images\//g, "url($1/assets/images/")
    .replace(/url\((['"]?)\.\.\/\.\.\/images\//g, "url($1/assets/images/")
    .replace(/url\((['"]?)\/careers-success-bg\.svg\1\)/g, "url($1/careers-success-bg.svg$1)");

const stripKnownDeadCss = (css) =>
  css
    .replace(/^#hs-web-interactives-top-anchor[\s\S]*?(\/\*! tailwindcss)/, "$1");

const combinedStyles = stripKnownDeadCss(normalizeCssAssetPaths(
  [...styleMatches, ...bodyStyleMatches]
  .map((match) => match[1].trim())
  .filter(Boolean)
  .join("\n\n"),
));

const cleanedBody = bodyContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim();

const srcDir = path.join(root, "src");
const contentDir = path.join(srcDir, "content");
const stylesDir = path.join(srcDir, "styles");

fs.mkdirSync(contentDir, { recursive: true });
fs.mkdirSync(stylesDir, { recursive: true });

fs.writeFileSync(path.join(contentDir, "landing-body.html"), `${cleanedBody}\n`);
fs.writeFileSync(path.join(stylesDir, "landing.css"), `${combinedStyles}\n`);

console.log("react-landing-extracted");
