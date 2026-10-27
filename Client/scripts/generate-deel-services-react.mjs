import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const sourceHtmlPath = path.join(projectRoot, 'public', 'solutions', 'services', 'index.html');
const outputDir = path.join(projectRoot, 'src', 'pages', 'deelServices');
const outputPath = path.join(outputDir, 'generatedPageData.tsx');

const voidTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const attrNameMap = new Map([
  ['class', 'className'],
  ['for', 'htmlFor'],
  ['tabindex', 'tabIndex'],
  ['readonly', 'readOnly'],
  ['maxlength', 'maxLength'],
  ['minlength', 'minLength'],
  ['autocomplete', 'autoComplete'],
  ['autofocus', 'autoFocus'],
  ['srcset', 'srcSet'],
  ['contenteditable', 'contentEditable'],
  ['crossorigin', 'crossOrigin'],
  ['referrerpolicy', 'referrerPolicy'],
  ['fetchpriority', 'fetchPriority'],
  ['frameborder', 'frameBorder'],
  ['allowfullscreen', 'allowFullScreen'],
  ['viewbox', 'viewBox'],
  ['preserveaspectratio', 'preserveAspectRatio'],
  ['playsinline', 'playsInline'],
  ['spellcheck', 'spellCheck'],
  ['colspan', 'colSpan'],
  ['rowspan', 'rowSpan'],
  ['srcdoc', 'srcDoc'],
  ['novalidate', 'noValidate'],
  ['formnovalidate', 'formNoValidate'],
  ['formaction', 'formAction'],
  ['formenctype', 'formEncType'],
  ['formmethod', 'formMethod'],
  ['itemprop', 'itemProp'],
  ['itemtype', 'itemType'],
  ['itemid', 'itemID'],
  ['itemref', 'itemRef'],
  ['itemscope', 'itemScope'],
]);

const booleanAttrs = new Set([
  'allowFullScreen',
  'async',
  'autoFocus',
  'autoPlay',
  'controls',
  'default',
  'defer',
  'disabled',
  'hidden',
  'loop',
  'muted',
  'noValidate',
  'open',
  'playsInline',
  'readOnly',
  'required',
  'reversed',
  'scoped',
  'selected',
  'itemScope',
]);

function decodeHtml(value) {
  const decoded = value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&#x60;/gi, '`')
    .replace(/&#x3D;/gi, '=')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));

  return repairMojibake(decoded);
}

function repairMojibake(value) {
  if (!/[ÃƒÆ’Ã¢â‚¬Å¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬\u0092\u0093\u0094]/.test(value)) {
    return value;
  }

  try {
    const repaired = Buffer.from(value, 'latin1').toString('utf8');
    if (/[ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¯Ã‚Â¿Ã‚Â½ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢]/.test(repaired)) {
      return repaired;
    }
  } catch {
    // Keep original value if repair fails.
  }

  return value;
}

function styleValueToJs(value) {
  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return value;
  }

  return JSON.stringify(value);
}

function toStyleObject(styleText) {
  const entries = styleText
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf(':');
      if (separatorIndex === -1) {
        return null;
      }

      const rawName = part.slice(0, separatorIndex).trim();
      const rawValue = part.slice(separatorIndex + 1).trim();
      if (!rawName || !rawValue) {
        return null;
      }

      let propName;
      if (rawName.startsWith('--')) {
        propName = JSON.stringify(rawName);
      } else {
        const camelName = rawName
          .replace(/^-ms-/, 'ms-')
          .replace(/-([a-z])/g, (_, char) => char.toUpperCase())
          .replace(/^webkit/, 'Webkit');
        propName = /^[$A-Z_][0-9A-Z_$]*$/i.test(camelName)
          ? camelName
          : JSON.stringify(camelName);
      }

      return `${propName}: ${styleValueToJs(rawValue)}`;
    })
    .filter(Boolean);

  return `{ ${entries.join(', ')} }`;
}

function normalizeAttrName(attrName) {
  const lower = attrName.toLowerCase();
  if (attrNameMap.has(lower)) {
    return attrNameMap.get(lower);
  }

  if (lower.startsWith('data-') || lower.startsWith('aria-')) {
    return attrName;
  }

  return attrName;
}

function attrKeyToCode(attrName) {
  return /^[$A-Z_][0-9A-Z_$]*$/i.test(attrName)
    ? attrName
    : JSON.stringify(attrName);
}

function attrsToCode(rawAttrs) {
  const attrs = [];
  const attrRegex = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = attrRegex.exec(rawAttrs)) !== null) {
    const [, rawName, doubleQuoted, singleQuoted, bareValue] = match;
    if (!rawName) {
      continue;
    }

    const normalizedName = normalizeAttrName(rawName);
    if (normalizedName === 'style') {
      const styleValue = decodeHtml(doubleQuoted ?? singleQuoted ?? bareValue ?? '');
      attrs.push(`style: ${toStyleObject(styleValue)}`);
      continue;
    }

    const rawValue = doubleQuoted ?? singleQuoted ?? bareValue;
    if (rawValue == null) {
      if (booleanAttrs.has(normalizedName)) {
        attrs.push(`${attrKeyToCode(normalizedName)}: true`);
      } else {
        attrs.push(`${attrKeyToCode(normalizedName)}: ""`);
      }
      continue;
    }

    const decodedValue = decodeHtml(rawValue);
    attrs.push(`${attrKeyToCode(normalizedName)}: ${JSON.stringify(decodedValue)}`);
  }

  return attrs.length > 0 ? `{ ${attrs.join(', ')} }` : 'null';
}

function tokenize(html) {
  const tokens = [];
  let cursor = 0;

  while (cursor < html.length) {
    if (html.startsWith('<!--', cursor)) {
      const commentEnd = html.indexOf('-->', cursor + 4);
      cursor = commentEnd === -1 ? html.length : commentEnd + 3;
      continue;
    }

    if (html[cursor] === '<') {
      const tagEnd = html.indexOf('>', cursor + 1);
      if (tagEnd === -1) {
        break;
      }

      const rawTag = html.slice(cursor + 1, tagEnd).trim();
      cursor = tagEnd + 1;

      if (!rawTag || rawTag.startsWith('!')) {
        continue;
      }

      if (rawTag.startsWith('/')) {
        tokens.push({ type: 'end', tagName: rawTag.slice(1).trim().toLowerCase() });
        continue;
      }

      const selfClosing = rawTag.endsWith('/');
      const cleanedTag = selfClosing ? rawTag.slice(0, -1).trim() : rawTag;
      const firstSpace = cleanedTag.search(/\s/);
      const tagName = (firstSpace === -1 ? cleanedTag : cleanedTag.slice(0, firstSpace)).toLowerCase();
      const rawAttrs = firstSpace === -1 ? '' : cleanedTag.slice(firstSpace + 1);

      tokens.push({
        type: 'start',
        tagName,
        rawAttrs,
        selfClosing: selfClosing || voidTags.has(tagName),
      });
      continue;
    }

    const nextTag = html.indexOf('<', cursor);
    const rawText = html.slice(cursor, nextTag === -1 ? html.length : nextTag);
    cursor = nextTag === -1 ? html.length : nextTag;
    const decodedText = decodeHtml(rawText);

    if (!decodedText.trim()) {
      continue;
    }

    tokens.push({ type: 'text', value: decodedText });
  }

  return tokens;
}

function parseTokens(tokens) {
  const root = { type: 'element', tagName: 'fragment', rawAttrs: '', children: [] };
  const stack = [root];

  tokens.forEach((token) => {
    const current = stack[stack.length - 1];

    if (token.type === 'text') {
      current.children.push({ type: 'text', value: token.value });
      return;
    }

    if (token.type === 'start') {
      const node = {
        type: 'element',
        tagName: token.tagName,
        rawAttrs: token.rawAttrs,
        children: [],
      };

      current.children.push(node);

      if (!token.selfClosing) {
        stack.push(node);
      }
      return;
    }

    while (stack.length > 1) {
      const popped = stack.pop();
      if (popped.tagName === token.tagName) {
        break;
      }
    }
  });

  return root.children;
}

function nodeToCode(node) {
  if (node.type === 'text') {
    return JSON.stringify(node.value);
  }

  const attrsCode = attrsToCode(node.rawAttrs);
  const childCodes = node.children.map((child) => nodeToCode(child)).filter(Boolean);

  if (attrsCode === 'null' && childCodes.length === 0) {
    return `h(${JSON.stringify(node.tagName)})`;
  }

  if (childCodes.length === 0) {
    return `h(${JSON.stringify(node.tagName)}, ${attrsCode})`;
  }

  return `h(${JSON.stringify(node.tagName)}, ${attrsCode}, ${childCodes.join(', ')})`;
}

function extractDocumentParts(html) {
  const htmlClassMatch = html.match(/<html[^>]*class="([^"]*)"/i);
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const stylesheetMatches = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/gi)];
  const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);

  if (!bodyMatch) {
    throw new Error('Unable to find <body>...</body> in services HTML.');
  }

  return {
    htmlClasses: htmlClassMatch?.[1] ?? '',
    title: decodeHtml(titleMatch?.[1] ?? 'Deel Services'),
    stylesheetHrefs: stylesheetMatches.map((match) => match[1]),
    inlineStyles: styleMatches.map((match) => match[1]),
    bodyHtml: bodyMatch[1],
  };
}

async function main() {
  const html = await fs.readFile(sourceHtmlPath, 'utf8');
  const { htmlClasses, title, stylesheetHrefs, inlineStyles, bodyHtml } = extractDocumentParts(html);
  const nodes = parseTokens(tokenize(bodyHtml));
  const bodyCode = nodes.map((node) => nodeToCode(node)).join(',\n    ');

  const fileContents = `import { createElement as h, Fragment } from 'react';

export const DEEL_SERVICES_PAGE_TITLE = ${JSON.stringify(title)};
export const DEEL_SERVICES_HTML_CLASSES = ${JSON.stringify(htmlClasses)};
export const DEEL_SERVICES_STYLESHEET_HREFS = ${JSON.stringify(stylesheetHrefs, null, 2)};
export const DEEL_SERVICES_INLINE_STYLES = ${JSON.stringify(inlineStyles, null, 2)};

export function DeelServicesContent() {
  return h(Fragment, null,
    ${bodyCode}
  );
}
`;

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, fileContents, 'utf8');
  console.log(`Generated React page data for services at ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
