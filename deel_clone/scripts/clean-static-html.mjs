import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const htmlPath = path.join(projectRoot, "index.html");

let html = fs.readFileSync(htmlPath, "utf8");

const localUsFlag = "assets/images/website-media.deel.com/United States.613f8f62.svg";

html = html.replace(
  /<html([^>]*?)class="([^"]*)"([^>]*)>/i,
  (_, before, classValue, after) => {
    const cleaned = classValue
      .split(/\s+/)
      .filter(Boolean)
      .filter((name) => !name.startsWith("__variable_"))
      .join(" ");

    return cleaned
      ? `<html${before}class="${cleaned}"${after}>`
      : `<html${before}${after}>`;
  },
);

html = html
  .replace(/\sdata-nimg="[^"]*"/g, "")
  .replace(/\sdata-emotion="[^"]*"/g, "")
  .replace(/<meta name="next-size-adjust" content=""\/>/gi, "")
  .replace(/<div hidden=""><!--\$--><!--\/\$--><\/div>/g, "")
  .replace(/<!--\$-->|<!--\/\$-->|<!-- -->/g, "");

const nextImageBase =
  "/_next/image/?url=https%3A%2F%2Fmedia.letsdeel.com%2Fflags%2Funited-states.svg";

html = html
  .split(nextImageBase)
  .join(localUsFlag)
  .replace(/assets\/images\/website-media\.deel\.com\/United States\.613f8f62\.svg&amp;w=\d+&amp;q=75/g, localUsFlag)
  .replace(
    /srcSet="assets\/images\/website-media\.deel\.com\/United States\.613f8f62\.svg \d+w(?:, assets\/images\/website-media\.deel\.com\/United States\.613f8f62\.svg \d+w)+"/g,
    `srcSet="${localUsFlag} 16w, ${localUsFlag} 32w"`,
  );

fs.writeFileSync(htmlPath, html);

const checks = {
  dataNimg: (html.match(/data-nimg=/g) || []).length,
  nextImage: (html.match(/\/_next\/image/g) || []).length,
  nextSizeAdjust: (html.match(/next-size-adjust/g) || []).length,
  variableClasses: (html.match(/__variable_/g) || []).length,
  reactComments: (html.match(/<!--\$-->|<!--\/\$-->|<!-- -->/g) || []).length,
  dataEmotion: (html.match(/data-emotion=/g) || []).length,
};

console.log(JSON.stringify(checks, null, 2));
