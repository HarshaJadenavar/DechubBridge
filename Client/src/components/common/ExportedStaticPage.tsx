import { useEffect, useRef, useState } from 'react';
import {
  STANDALONE_LIGHT_THEME_CLASS,
  STANDALONE_LIGHT_THEME_CSS,
  shouldApplyStandaloneLightTheme,
} from './standaloneLightTheme';
import LandingTalentRequestModal from './LandingTalentRequestModal';

interface ExportedStaticPageProps {
  sourcePath: string;
}

interface AttributeSnapshot {
  className: string;
  style: string;
  attributes: Array<{ name: string; value: string }>;
}

interface ScriptTemplateSnapshot {
  attributes: Array<{ name: string; value: string }>;
  textContent: string;
}

interface CachedStaticPage {
  title: string;
  htmlSnapshot: AttributeSnapshot;
  bodySnapshot: AttributeSnapshot;
  markup: string;
  headNodeMarkup: string[];
  scriptTemplates: ScriptTemplateSnapshot[];
}

const staticPageCache = new Map<string, Promise<CachedStaticPage>>();

function normalizeStandaloneRoute(pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/') {
    return '/';
  }

  if (
    normalizedPath === '/about'
    || normalizedPath === '/blog'
    || normalizedPath === '/contact'
    || normalizedPath === '/legal-pages/privacy-policy'
  ) {
    return normalizedPath;
  }

  if (/^\/blog\/[^/]+$/.test(normalizedPath)) {
    return normalizedPath;
  }

  return null;
}

function resolveStandaloneNavigationHref(href: string) {
  if (!href || href.startsWith('#')) {
    return null;
  }

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) {
      return null;
    }

    const normalizedPath = normalizeStandaloneRoute(url.pathname);
    if (!normalizedPath) {
      return null;
    }

    return `${normalizedPath}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function normalizeAssetPath(value: string) {
  if (!value.startsWith('assets/')) {
    return value;
  }

  return `/${value}`;
}

function normalizeSrcSet(value: string) {
  return value
    .split(',')
    .map((entry) => {
      const parts = entry.trim().split(/\s+/);
      if (!parts.length) {
        return entry;
      }

      parts[0] = normalizeAssetPath(parts[0]);
      return parts.join(' ');
    })
    .join(', ');
}

function normalizeInlineStyle(styleText: string) {
  return styleText.replace(/url\((['"]?)assets\//g, 'url($1/assets/');
}

function normalizeStaticDocument(documentFragment: Document) {
  documentFragment.querySelectorAll<HTMLElement>('*').forEach((element) => {
    ['src', 'href', 'poster'].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value) {
        return;
      }

      element.setAttribute(attribute, normalizeAssetPath(value));
    });

    const srcSet = element.getAttribute('srcset');
    if (srcSet) {
      element.setAttribute('srcset', normalizeSrcSet(srcSet));
    }

    const style = element.getAttribute('style');
    if (style) {
      element.setAttribute('style', normalizeInlineStyle(style));
    }
  });
}

function recreateScript(source: HTMLScriptElement) {
  const script = document.createElement('script');

  for (const { name, value } of Array.from(source.attributes)) {
    script.setAttribute(name, value);
  }

  script.textContent = source.textContent;
  return script;
}

function recreateScriptFromSnapshot(snapshot: ScriptTemplateSnapshot) {
  const script = document.createElement('script');

  snapshot.attributes.forEach(({ name, value }) => {
    script.setAttribute(name, value);
  });

  script.textContent = snapshot.textContent;
  return script;
}

function waitForScriptLoad(script: HTMLScriptElement) {
  if (!script.src || script.type === 'module') {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error(`Failed to load script: ${script.src}`)), { once: true });
  });
}

function renderCustomHomepageHero(root: ParentNode) {
  const heroSection = root.querySelector('section[data-framer-name="Hero"]');
  if (!heroSection) {
    return;
  }

  const contentHost = heroSection.querySelector('[data-framer-name="content"]');
  if (!(contentHost instanceof HTMLElement)) {
    return;
  }

  contentHost.setAttribute('data-static-custom-hero', 'true');
  contentHost.innerHTML = `
    <div class="static-hero-copy">
      <h1 class="static-hero-title">
        <span>Hire, Pay &amp; Manage</span>
        <span>Global Contractors without the chaos</span>
      </h1>
      <p class="static-hero-description">
        Dechub is the all-in-one platform to onboard US contractors, generate contracts, collect e-signatures, and process payments via Wise - all from one dashboard.
      </p>
      <form class="static-hero-search" action="/marketplace" method="get">
        <input type="text" name="q" placeholder="Search for any service..." aria-label="Search for any service" />
        <button type="submit" aria-label="Search">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"></path>
          </svg>
        </button>
      </form>
      <div class="static-hero-tags" aria-label="Popular services">
        <a href="/marketplace?q=Architecture%20%26%20Interior%20Design" class="static-hero-tag">Architecture &amp; Interior Design <span aria-hidden="true">&rarr;</span></a>
        <a href="/marketplace?q=Graphic%20Design" class="static-hero-tag">Graphic Design <span aria-hidden="true">&rarr;</span></a>
        <a href="/marketplace?q=Website%20Developer" class="static-hero-tag">Website Developer <span aria-hidden="true">&rarr;</span></a>
      </div>
      <div class="static-hero-actions">
        <a href="/get-started" class="static-hero-button static-hero-button-primary">Get Started</a>
        <a href="/contact" class="static-hero-button static-hero-button-secondary">Book a demo</a>
      </div>
    </div>
  `;
}

function renderCustomIntroCopy(root: ParentNode) {
  const introSection = root.querySelector('section[data-framer-name="Intro"]');
  if (!introSection) {
    return;
  }

  const textSpan = introSection.querySelector('.framer-1l9vq7t .framer-text');
  if (!(textSpan instanceof HTMLElement)) {
    return;
  }

  if (root instanceof Document && !root.getElementById('custom-intro-copy-style')) {
    const style = root.createElement('style');
    style.id = 'custom-intro-copy-style';
    style.textContent = `
      .custom-intro-copy {
        color: rgb(26, 36, 58) !important;
        background-image: none !important;
        -webkit-text-fill-color: rgb(26, 36, 58) !important;
      }

      .custom-intro-copy .intro-accent {
        color: #d774ff !important;
        background-image: none !important;
        -webkit-text-fill-color: #d774ff !important;
      }
    `;
    root.head.appendChild(style);
  }

  textSpan.removeAttribute('data-text-fill');
  textSpan.classList.add('custom-intro-copy');
  textSpan.style.setProperty('background-image', 'none', 'important');
  textSpan.style.setProperty('-webkit-text-fill-color', 'rgb(26, 36, 58)', 'important');
  textSpan.style.setProperty('color', 'rgb(26, 36, 58)', 'important');
  textSpan.innerHTML =
    'Get a resource in <span class="intro-accent">20 minutes</span> with <span class="intro-accent">10 days</span> free trial';
}


function captureAttributes(element: HTMLElement): AttributeSnapshot {
  return {
    className: element.className,
    style: element.getAttribute('style') ?? '',
    attributes: Array.from(element.attributes).map(({ name, value }) => ({ name, value })),
  };
}

function restoreAttributes(element: HTMLElement, snapshot: AttributeSnapshot) {
  Array.from(element.attributes).forEach(({ name }) => {
    element.removeAttribute(name);
  });

  snapshot.attributes.forEach(({ name, value }) => {
    element.setAttribute(name, value);
  });

  element.className = snapshot.className;

  if (snapshot.style) {
    element.setAttribute('style', snapshot.style);
  } else {
    element.removeAttribute('style');
  }
}

function createScriptTemplateSnapshot(source: HTMLScriptElement): ScriptTemplateSnapshot {
  return {
    attributes: Array.from(source.attributes).map(({ name, value }) => ({ name, value })),
    textContent: source.textContent ?? '',
  };
}

async function loadStaticPageDefinition(sourcePath: string): Promise<CachedStaticPage> {
  const cached = staticPageCache.get(sourcePath);
  if (cached) {
    return cached;
  }

  const pending = (async (): Promise<CachedStaticPage> => {
    const response = await fetch(sourcePath, {
      cache: 'force-cache',
    });
    if (!response.ok) {
      throw new Error(`Failed to load static page: ${response.status}`);
    }

    const html = await response.text();
    const sanitizedHtml =
      sourcePath === '/landing-export/index.txt'
        ? html.replace(
            'We are Notch we saves team over 10 million hours every years',
            'Get a resource in 20 minutes with 10 days free trial',
          )
        : html;
    const parsed = new DOMParser().parseFromString(sanitizedHtml, 'text/html');
    normalizeStaticDocument(parsed);

    if (sourcePath === '/landing-export/index.txt') {
      renderCustomHomepageHero(parsed);
      renderCustomIntroCopy(parsed);
    }

    const scriptTemplates = Array.from(parsed.querySelectorAll('script')).map(createScriptTemplateSnapshot);
    parsed.querySelectorAll('script').forEach((script) => script.remove());

    const headNodeMarkup = Array.from(
      parsed.head.querySelectorAll<HTMLElement>('style, link, meta[name^="twitter:"], meta[property^="og:"]'),
    ).map((node) => node.outerHTML);

    return {
      title: parsed.title,
      htmlSnapshot: captureAttributes(parsed.documentElement),
      bodySnapshot: captureAttributes(parsed.body),
      markup: parsed.body.innerHTML,
      headNodeMarkup,
      scriptTemplates,
    };
  })();

  staticPageCache.set(sourcePath, pending);

  try {
    return await pending;
  } catch (error) {
    staticPageCache.delete(sourcePath);
    throw error;
  }
}

export default function ExportedStaticPage({ sourcePath }: ExportedStaticPageProps) {
  const mountNodeRef = useRef<HTMLDivElement | null>(null);
  const [markup, setMarkup] = useState('');
  const [isTalentRequestModalOpen, setIsTalentRequestModalOpen] = useState(false);
  const [requestedServices, setRequestedServices] = useState<string[]>([]);
  const scriptTemplatesRef = useRef<HTMLScriptElement[]>([]);

  const openTalentRequestModal = (services?: string[]) => {
    setRequestedServices(
      Array.isArray(services)
        ? services.filter((item): item is string => typeof item === 'string')
        : [],
    );
    setIsTalentRequestModalOpen(true);
  };

  useEffect(() => {
    setIsTalentRequestModalOpen(false);
    setRequestedServices([]);
  }, [sourcePath]);

  useEffect(() => {
    const controller = new AbortController();
    const appendedHeadNodes: HTMLElement[] = [];
    const shouldApplyLightTheme = shouldApplyStandaloneLightTheme(sourcePath);
    const shouldInjectStandaloneEnhancer = sourcePath === '/landing-export/index.txt';
    const previousTitle = document.title;
    const htmlSnapshot = captureAttributes(document.documentElement);
    const bodySnapshot = captureAttributes(document.body);
    const mountNode = document.createElement('div');
    mountNode.setAttribute('data-exported-static-root', sourcePath);
    document.body.appendChild(mountNode);
    mountNodeRef.current = mountNode;

    const loadPage = async () => {
      const cachedPage = await loadStaticPageDefinition(sourcePath);
      if (controller.signal.aborted) {
        return;
      }

      restoreAttributes(document.documentElement, cachedPage.htmlSnapshot);
      restoreAttributes(document.body, cachedPage.bodySnapshot);
      if (shouldApplyLightTheme) {
        document.body.classList.add(STANDALONE_LIGHT_THEME_CLASS);
      }

      document.title = cachedPage.title || previousTitle;

      scriptTemplatesRef.current = cachedPage.scriptTemplates.map(recreateScriptFromSnapshot);

      cachedPage.headNodeMarkup.forEach((nodeMarkup) => {
        const template = document.createElement('template');
        template.innerHTML = nodeMarkup;
        const clone = template.content.firstElementChild;
        if (!(clone instanceof HTMLElement)) {
          return;
        }

        clone.setAttribute('data-exported-static-head', sourcePath);
        document.head.appendChild(clone);
        appendedHeadNodes.push(clone);
      });

      const hasEnhancerStylesheet = cachedPage.headNodeMarkup.some((nodeMarkup) =>
        nodeMarkup.includes('href="/assets/css/site.css"'),
      );

      if (shouldInjectStandaloneEnhancer && !hasEnhancerStylesheet) {
        const enhancerStylesheet = document.createElement('link');
        enhancerStylesheet.rel = 'stylesheet';
        enhancerStylesheet.href = '/assets/css/site.css';
        enhancerStylesheet.setAttribute('data-exported-static-head', `${sourcePath}:site-enhancer`);
        document.head.appendChild(enhancerStylesheet);
        appendedHeadNodes.push(enhancerStylesheet);
      }

      if (shouldApplyLightTheme) {
        const themeStyle = document.createElement('style');
        themeStyle.setAttribute('data-exported-static-theme', sourcePath);
        themeStyle.textContent = STANDALONE_LIGHT_THEME_CSS;
        document.head.appendChild(themeStyle);
        appendedHeadNodes.push(themeStyle);
      }

      setMarkup(cachedPage.markup);
    };

    loadPage().catch(() => {
      setMarkup('<main style="min-height:100vh;background:#000"></main>');
    });

    return () => {
      controller.abort();
      appendedHeadNodes.forEach((node) => node.remove());
      scriptTemplatesRef.current = [];
      document.title = previousTitle;
      mountNodeRef.current?.remove();
      mountNodeRef.current = null;
      restoreAttributes(document.documentElement, htmlSnapshot);
      restoreAttributes(document.body, bodySnapshot);
    };
  }, [sourcePath]);

  useEffect(() => {
    const mountNode = mountNodeRef.current;
    if (!mountNode || !markup) {
      return;
    }

    mountNode.innerHTML = markup;
    const appendedScripts: HTMLScriptElement[] = [];
    const shouldForceStandaloneNavigation = sourcePath === '/landing-export/index.txt';
    const shouldInjectStandaloneEnhancer = sourcePath === '/landing-export/index.txt';
    let cancelled = false;

    const handleStandaloneNavigation = (event: MouseEvent) => {
      if (!shouldForceStandaloneNavigation) {
        return;
      }

      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const clickable = target.closest('a[href], [data-nested-link][href]');
      if (!(clickable instanceof HTMLElement)) {
        return;
      }

      if (clickable.matches('.static-hero-button-secondary')) {
        event.preventDefault();
        event.stopPropagation();
        const requestedServicesAttr = clickable.getAttribute('data-requested-services');
        openTalentRequestModal(
          requestedServicesAttr
            ? (() => {
                try {
                  const parsed = JSON.parse(requestedServicesAttr);
                  return Array.isArray(parsed) ? parsed : [];
                } catch {
                  return [];
                }
              })()
            : [],
        );
        return;
      }

      const rawHref = clickable.getAttribute('href');
      const nextHref = rawHref ? resolveStandaloneNavigationHref(rawHref) : null;
      if (!nextHref) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      window.location.assign(nextHref);
    };

    if (shouldForceStandaloneNavigation) {
      mountNode.addEventListener('click', handleStandaloneNavigation, true);
    }

    const initializeScripts = async () => {
      const blockingLoads: Array<Promise<void>> = [];

      for (const template of scriptTemplatesRef.current) {
        const script = recreateScript(template);
        script.setAttribute('data-exported-static-script', sourcePath);
        document.body.appendChild(script);
        appendedScripts.push(script);
        blockingLoads.push(waitForScriptLoad(script));
      }

      if (shouldInjectStandaloneEnhancer) {
        const enhancerScript = document.createElement('script');
        enhancerScript.src = '/assets/js/site.js';
        enhancerScript.setAttribute('data-exported-static-script', `${sourcePath}:site-enhancer`);
        document.body.appendChild(enhancerScript);
        appendedScripts.push(enhancerScript);
        blockingLoads.push(waitForScriptLoad(enhancerScript));
      }

      try {
        await Promise.all(blockingLoads);
      } catch {
        // Keep the page usable even if one enhancer script fails to load.
      }

      if (cancelled) {
        return;
      }

      if (sourcePath === '/landing-export/index.txt') {
        renderCustomHomepageHero(document);
        renderCustomIntroCopy(document);
      }

      // The exported standalone scripts expect to initialize on document load.
      // Re-dispatching these events lets route changes behave like a fresh page load.
      document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
      window.dispatchEvent(new Event('load'));

      if (sourcePath === '/landing-export/index.txt') {
        const rerenderStandaloneCustomizations = () => {
          renderCustomHomepageHero(document);
          renderCustomIntroCopy(document);
        };

        window.setTimeout(rerenderStandaloneCustomizations, 0);
        window.setTimeout(rerenderStandaloneCustomizations, 250);
        window.setTimeout(rerenderStandaloneCustomizations, 1000);
      }
    };

    void initializeScripts();

    return () => {
      cancelled = true;
      if (shouldForceStandaloneNavigation) {
        mountNode.removeEventListener('click', handleStandaloneNavigation, true);
      }

      mountNode.innerHTML = '';
      appendedScripts.forEach((script) => script.remove());
    };
  }, [markup, sourcePath]);

  return (
    <LandingTalentRequestModal
      isOpen={isTalentRequestModalOpen}
      onClose={() => {
        setIsTalentRequestModalOpen(false);
        setRequestedServices([]);
      }}
      requestedServices={requestedServices}
    />
  );
}

