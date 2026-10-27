import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";

const root = process.cwd();
const sourcePath = path.join(root, "landing-source.html");
const outputDir = path.join(root, "src", "components", "generated");
const appPath = path.join(root, "src", "App.jsx");

const html = fs.readFileSync(sourcePath, "utf8");
const document = parse(html, {
  comment: false,
  script: true,
  style: true,
  blockTextElements: {
    script: true,
    noscript: true,
    style: true,
    pre: true,
  },
});

const body = document.querySelector("body");

if (!body) {
  throw new Error("No <body> found in landing-source.html");
}

const main = body.querySelector("main");
const header = body.querySelector("header");
const footer = body.querySelector("footer");

if (!main || !header || !footer) {
  throw new Error("Expected header, main, and footer in landing-source.html");
}

const pageShell = main.querySelector('[data-ab-page="true"]');
const contentNodes = (pageShell || main).childNodes.filter((node) => node.nodeType === 1);
const customSections = new Set([
  "Section02",
  "Section03",
  "Section04",
  "Section05",
  "Section06",
  "Section07",
  "Section08",
]);

const svgRaw = `const ChevronDownIcon = () => (
  <svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mui-4sy6dv" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="KeyboardArrowDownIcon">
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mui-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="MenuIcon">
    <path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z" />
  </svg>
);
`;

fs.mkdirSync(outputDir, { recursive: true });

const booleanAttributes = new Set([
  "async",
  "autoFocus",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "hidden",
  "loop",
  "multiple",
  "muted",
  "noModule",
  "open",
  "playsInline",
  "readOnly",
  "required",
  "reversed",
  "selected",
]);

const toCamel = (name) =>
  name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

const normalizeAttrName = (name) => {
  if (name === "class") return "className";
  if (name === "for") return "htmlFor";
  if (name === "tabindex") return "tabIndex";
  if (name === "readonly") return "readOnly";
  if (name === "maxlength") return "maxLength";
  if (name === "minlength") return "minLength";
  if (name === "srcset") return "srcSet";
  if (name === "fetchpriority") return "fetchPriority";
  if (name === "crossorigin") return "crossOrigin";
  if (name === "referrerpolicy") return "referrerPolicy";
  if (name === "autocomplete") return "autoComplete";
  if (name.startsWith("aria-") || name.startsWith("data-")) return name;
  return toCamel(name);
};

const decodeEntities = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/â€œ/g, "“")
    .replace(/â€/g, "”")
    .replace(/â€"/g, "”")
    .replace(/â€”/g, "—")
    .replace(/â€“/g, "–");

const styleToObject = (styleValue) => {
  const entries = styleValue
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf(":");
      if (separatorIndex === -1) return null;
      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      if (!key || !value) return null;
      return [key, value];
    })
    .filter(Boolean);

  if (!entries.length) return null;

  const mapped = entries
    .map(([key, value]) => {
      const normalizedKey = key.startsWith("--") ? `'${key}'` : toCamel(key);
      return `${normalizedKey}: ${JSON.stringify(value)}`;
    })
    .join(", ");

  return `{{ ${mapped} }}`;
};

const normalizeText = (value) =>
  decodeEntities(
    value
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/\n\s+\n/g, "\n")
    .replace(/"/g, "&quot;"),
  );

const convertNode = (node, depth = 2) => {
  const indent = "  ".repeat(depth);
  const childIndent = "  ".repeat(depth + 1);

  if (node.nodeType === 3) {
    const text = normalizeText(node.rawText);
    if (!text.trim()) return "";
    if (text.includes("\n")) {
      const collapsed = text.replace(/\s*\n\s*/g, "\n");
      return `${indent}{${JSON.stringify(collapsed)}}`;
    }
    return `${indent}${text}`;
  }

  if (node.nodeType !== 1) {
    return "";
  }

  const tagName = node.tagName.toLowerCase();
  const attrs = Object.entries(node.attributes || {}).map(([name, value]) => {
    const normalizedName = normalizeAttrName(name);

    if (name === "style") {
      const styleObject = styleToObject(value);
      return styleObject ? `${normalizedName}=${styleObject}` : null;
    }

    if (value === "") {
      return booleanAttributes.has(normalizedName)
        ? normalizedName
        : `${normalizedName}=""`;
    }

    return `${normalizedName}=${JSON.stringify(decodeEntities(value))}`;
  }).filter(Boolean);

  const attrString = attrs.length ? ` ${attrs.join(" ")}` : "";
  const children = node.childNodes
    .map((child) => convertNode(child, depth + 1))
    .filter(Boolean);

  if (!children.length) {
    return `${indent}<${tagName}${attrString} />`;
  }

  return `${indent}<${tagName}${attrString}>\n${children.join("\n")}\n${indent}</${tagName}>`;
};

const writeComponent = (name, rootNode, extra = "") => {
  const jsx = convertNode(rootNode, 2);
  const source = `import React from "react";

${extra}function ${name}() {
  return (
${jsx}
  );
}

export default ${name};
`;

  fs.writeFileSync(path.join(outputDir, `${name}.jsx`), source);
};

writeComponent("Header", header, svgRaw);
writeComponent("Footer", footer);

contentNodes.forEach((section, index) => {
  const componentName = `Section${String(index + 1).padStart(2, "0")}`;
  writeComponent(componentName, section);
});

const sectionImports = contentNodes
  .map((_, index) => {
    const name = `Section${String(index + 1).padStart(2, "0")}`;
    if (customSections.has(name)) {
      return null;
    }
    return `import ${name} from "./components/generated/${name}.jsx";`;
  })
  .filter(Boolean)
  .join("\n");

const customSectionImports = contentNodes
  .map((_, index) => `Section${String(index + 1).padStart(2, "0")}`)
  .filter((name) => customSections.has(name))
  .map((name) => `const ${name} = React.lazy(() => import("./components/${name}.jsx"));`)
  .join("\n");

const sectionRender = contentNodes
  .map((_, index) => {
    const name = `Section${String(index + 1).padStart(2, "0")}`;
    if (customSections.has(name)) {
      return `              <${name} />`;
    }
    return `            <${name} />`;
  })
  .join("\n");

const appSource = `import React, { Suspense, useEffect } from "react";
import Header from "./components/Header.jsx";
${sectionImports}
${customSectionImports}
import Footer from "./components/generated/Footer.jsx";
import "./styles/landing.css";

function App() {
  useEffect(() => {
    document.title = "Deel | Global Payroll, Compliance, HR Solutions | HRIS";
  }, []);

  return (
    <>
      <Header />
      <main className="m-0 p-0">
        <div className="relative">
          <div data-ab-page="true" className="bg-surface-secondary flex flex-col items-center">
            <Section01 />
            <Suspense fallback={null}>
${contentNodes
  .map((_, index) => `Section${String(index + 1).padStart(2, "0")}`)
  .filter((name) => name !== "Section01")
  .map((name) => `              <${name} />`)
  .join("\n")}
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default App;
`;

fs.writeFileSync(appPath, appSource);

console.log(`react-components-generated:${contentNodes.length + 2}`);
