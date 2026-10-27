import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const sourceHtmlPath = path.join(projectRoot, '..', 'New_Page', 'pricing', 'index.html');
const outputDir = path.join(projectRoot, 'src', 'pages', 'pricing');
const outputPath = path.join(outputDir, 'generatedPageData.tsx');
const routeSlug = '/pricing';

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
  if (!/[Ã‚Ã¢â‚¬â„¢Ã¢â‚¬Å“Ã¢â‚¬\u0092\u0093\u0094]/.test(value)) {
    return value;
  }

  try {
    const repaired = Buffer.from(value, 'latin1').toString('utf8');
    if (/[â‚¬ï¿½â€œâ€â€™]/.test(repaired)) {
      return repaired;
    }
  } catch {
    // Fall back to the original decoded string when repair is not possible.
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
    const text = html.slice(cursor, nextTag === -1 ? html.length : nextTag);
    cursor = nextTag === -1 ? html.length : nextTag;

    if (text) {
      tokens.push({ type: 'text', value: decodeHtml(text) });
    }
  }

  return tokens;
}

function parse(html) {
  const root = { tagName: 'root', children: [] };
  const stack = [root];

  for (const token of tokenize(html)) {
    const current = stack[stack.length - 1];

    if (token.type === 'text') {
      if (!token.value) {
        continue;
      }

      current.children.push({ type: 'text', value: token.value });
      continue;
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
      continue;
    }

    if (token.type === 'end') {
      while (stack.length > 1) {
        const node = stack.pop();
        if (node.tagName === token.tagName) {
          break;
        }
      }
    }
  }

  return root.children;
}

function nodeToCode(node) {
  if (node.type === 'text') {
    return JSON.stringify(node.value);
  }

  const children = node.children
    .map(nodeToCode)
    .filter(Boolean);

  const propsCode = attrsToCode(node.rawAttrs);
  const args = [JSON.stringify(node.tagName), propsCode, ...children];
  return `h(${args.join(', ')})`;
}

function isWhitespaceTextNode(node) {
  return node.type === 'text' && !node.value.trim();
}

function isIgnorableTopLevelNode(node) {
  if (isWhitespaceTextNode(node)) {
    return true;
  }

  if (node.type !== 'element') {
    return false;
  }

  if (node.tagName === 'div' && /\bhidden\b/.test(node.rawAttrs)) {
    return node.children.every((child) => isWhitespaceTextNode(child));
  }

  return false;
}

function unwrapSharedShell(nodes) {
  if (
    nodes.length === 1
    && nodes[0].type === 'element'
    && nodes[0].tagName === 'div'
    && /\bclass="[^"]*\brelative\b/.test(nodes[0].rawAttrs)
  ) {
    const [outer] = nodes;
    const firstChild = outer.children.find((child) => child.type === 'element');

    if (
      firstChild
      && firstChild.type === 'element'
      && firstChild.tagName === 'div'
      && /\bdata-ab-page\b/.test(firstChild.rawAttrs)
    ) {
      return firstChild.children.filter((child) => !isWhitespaceTextNode(child));
    }
  }

  return nodes;
}

function getFilteredBodyNodes(nodes) {
  const filteredNodes = nodes.filter((node) => {
    if (isIgnorableTopLevelNode(node)) {
      return false;
    }

    if (node.type !== 'element') {
      return !isWhitespaceTextNode(node);
    }

    if (node.tagName === 'header' || node.tagName === 'footer') {
      return false;
    }

    if (node.tagName === 'button' && /demo-chat-start/.test(node.rawAttrs)) {
      return false;
    }

    return true;
  });

  const meaningfulNodes = filteredNodes.filter((node) => !isWhitespaceTextNode(node));

  if (
    meaningfulNodes.length === 1
    && meaningfulNodes[0].type === 'element'
    && meaningfulNodes[0].tagName === 'main'
  ) {
    return unwrapSharedShell(
      meaningfulNodes[0].children.filter((node) => !isWhitespaceTextNode(node)),
    );
  }

  return meaningfulNodes;
}

async function main() {
  const sourceHtml = await fs.readFile(sourceHtmlPath, 'utf8');
  const htmlClassMatch = sourceHtml.match(/<html[^>]*class="([^"]*)"/i);
  const titleMatch = sourceHtml.match(/<title>([\s\S]*?)<\/title>/i);
  const headStyleMatches = [...sourceHtml.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
  const headLinkMatches = [...sourceHtml.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/gi)];
  const bodyMatch = sourceHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  if (!bodyMatch) {
    throw new Error('Unable to locate body markup in localized payroll page');
  }

  const parsedNodes = parse(bodyMatch[1]);
  const filteredNodes = getFilteredBodyNodes(parsedNodes);
  const bodyCode = filteredNodes.map(nodeToCode).join(',\n      ');

  const output = `import { Fragment, createElement } from 'react';

const h = createElement;

export const PRICING_PAGE_TITLE = ${JSON.stringify(decodeHtml(titleMatch?.[1] ?? 'Pricing'))};
export const PRICING_HTML_CLASSES = ${JSON.stringify((htmlClassMatch?.[1] ?? '').trim())};
export const PRICING_ROUTE_SLUG = ${JSON.stringify(routeSlug)};
export const PRICING_STYLESHEET_HREFS = ${JSON.stringify(headLinkMatches.map((match) => match[1]), null, 2)} as const;
export const PRICING_INLINE_STYLES = ${JSON.stringify(
    headStyleMatches.map((match) => match[1]),
    null,
    2,
  )} as const;

export function PricingContent() {
  return h(
    Fragment,
    null,
      ${bodyCode}
  );
}
`;

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, output, 'utf8');
  console.log(`Generated React page data at ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
