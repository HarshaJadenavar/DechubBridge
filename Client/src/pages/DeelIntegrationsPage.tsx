import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  DEEL_INTEGRATIONS_HTML_CLASSES,
  DEEL_INTEGRATIONS_INLINE_STYLES,
  DEEL_INTEGRATIONS_PAGE_TITLE,
  DEEL_INTEGRATIONS_STYLESHEET_HREFS,
  DeelIntegrationsContent,
} from './deelIntegrations/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';

const STYLE_DATA_ATTR = 'data-deel-integrations-style';
const LINK_DATA_ATTR = 'data-deel-integrations-stylesheet';
const FEATURED_APPS_SECTION_ID = 'dechub-featured-apps';

const FEATURED_APPS = [
  {
    name: 'NetSuite',
    href: '/integrations/netsuite',
    iconUrl: 'https://media.letsdeel.com/images/integrations/netsuite.png',
    accent: '#ececec',
    tags: ['Accounting'],
  },
  {
    name: 'Google Workspace',
    href: '/integrations/google-workspace',
    iconUrl: 'https://media.letsdeel.com/images/integrations/google-workspace.png',
    accent: '#ececec',
    tags: ['App Provisioning & SSO', 'Automation & Productivity'],
  },
  {
    name: 'Slack',
    href: '/integrations/slack',
    iconUrl: 'https://media.letsdeel.com/images/integrations/slack.png',
    accent: '#6f2d62',
    tags: ['Automation & Productivity', 'Collaboration'],
  },
] as const;

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function navigateWithinApp(rawHref: string) {
  let url: URL;

  try {
    url = new URL(rawHref, window.location.origin);
  } catch {
    return;
  }

  if (url.origin !== window.location.origin) {
    window.location.assign(url.toString());
    return;
  }

  const nextUrl = `${normalizePathname(url.pathname)}${url.search}${url.hash}`;
  const currentUrl = `${normalizePathname(window.location.pathname)}${window.location.search}${window.location.hash}`;

  if (nextUrl !== currentUrl) {
    window.history.pushState({}, '', nextUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function decodeOptimizedImageUrl(value: string): string | null {
  if (!value.includes('/_next/image/?url=')) {
    return null;
  }

  try {
    const url = new URL(value, window.location.origin);
    const encodedUrl = url.searchParams.get('url');
    if (!encodedUrl) {
      return null;
    }

    return decodeURIComponent(encodedUrl);
  } catch {
    return null;
  }
}

function normalizeImageSources(root: HTMLElement) {
  root.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    const optimizedSrc = decodeOptimizedImageUrl(image.getAttribute('src') ?? '');
    if (optimizedSrc) {
      image.src = optimizedSrc;
    }

    const srcSet = image.getAttribute('srcset');
    if (!srcSet) {
      return;
    }

    const normalizedSrcSet = srcSet
      .split(',')
      .map((entry) => {
        const trimmed = entry.trim();
        if (!trimmed) {
          return '';
        }

        const parts = trimmed.split(/\s+/);
        const decodedUrl = decodeOptimizedImageUrl(parts[0]);
        if (!decodedUrl) {
          return trimmed;
        }

        return [decodedUrl, ...parts.slice(1)].join(' ');
      })
      .filter(Boolean)
      .join(', ');

    if (normalizedSrcSet) {
      image.srcset = normalizedSrcSet;
    }
  });
}

function injectFeaturedAppsSection(root: HTMLElement) {
  if (root.querySelector(`#${FEATURED_APPS_SECTION_ID}`)) {
    return () => undefined;
  }

  const allAppsHeading = Array.from(root.querySelectorAll<HTMLElement>('h2')).find(
    (heading) => heading.textContent?.trim() === 'All Apps',
  );
  const allAppsSection = allAppsHeading?.closest('.MuiBox-root');
  const insertionPoint = allAppsSection?.parentElement;

  if (!allAppsSection || !insertionPoint) {
    return () => undefined;
  }

  const section = document.createElement('section');
  section.id = FEATURED_APPS_SECTION_ID;
  section.style.width = '100%';
  section.style.maxWidth = '1312px';
  section.style.margin = '0 auto 56px';
  section.style.padding = '0 20px';
  section.style.boxSizing = 'border-box';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.gap = '16px';
  header.style.marginBottom = '24px';

  const title = document.createElement('h2');
  title.textContent = 'Featured Apps';
  title.style.margin = '0';
  title.style.color = '#1B1B1B';
  title.style.fontFamily = '"BagossCondensedFont","BagossCondensedFont Fallback",Arial,Helvetica,sans-serif';
  title.style.fontSize = 'clamp(38px, 4vw, 56px)';
  title.style.fontWeight = '500';
  title.style.lineHeight = '1';

  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.alignItems = 'center';
  controls.style.gap = '12px';

  const makeControl = (label: string, dark: boolean) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.style.width = '44px';
    button.style.height = '44px';
    button.style.border = 'none';
    button.style.borderRadius = '999px';
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.cursor = 'pointer';
    button.style.background = dark ? '#1B1B1B' : '#e7e2db';
    button.style.color = dark ? '#FFFFFF' : '#8b857c';
    button.style.flexShrink = '0';

    const glyph = document.createElement('span');
    glyph.textContent = label === 'Previous featured apps' ? '←' : '→';
    glyph.style.fontSize = '24px';
    glyph.style.lineHeight = '1';
    glyph.style.transform = 'translateY(-1px)';
    button.appendChild(glyph);

    return button;
  };

  const previousButton = makeControl('Previous featured apps', true);
  const nextButton = makeControl('Next featured apps', false);
  controls.append(previousButton, nextButton);
  header.append(title, controls);

  const track = document.createElement('div');
  track.style.display = 'grid';
  track.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
  track.style.gap = '32px';
  track.style.overflowX = 'auto';
  track.style.scrollBehavior = 'smooth';
  track.style.scrollbarWidth = 'none';
  track.style.paddingBottom = '12px';

  track.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      track.scrollLeft += event.deltaY;
    }
  });

  FEATURED_APPS.forEach((app) => {
    const cardLink = document.createElement('a');
    cardLink.href = app.href;
    cardLink.style.display = 'block';
    cardLink.style.minWidth = '340px';
    cardLink.style.background = '#ffffff';
    cardLink.style.borderRadius = '16px';
    cardLink.style.overflow = 'hidden';
    cardLink.style.boxShadow = '0 8px 24px rgba(27, 27, 27, 0.08)';
    cardLink.style.color = 'inherit';

    const media = document.createElement('div');
    media.style.height = '164px';
    media.style.display = 'flex';
    media.style.alignItems = 'center';
    media.style.justifyContent = 'center';
    media.style.background = app.accent;

    const iconWrap = document.createElement('div');
    iconWrap.style.width = '88px';
    iconWrap.style.height = '88px';
    iconWrap.style.borderRadius = '16px';
    iconWrap.style.background = '#ffffff';
    iconWrap.style.display = 'flex';
    iconWrap.style.alignItems = 'center';
    iconWrap.style.justifyContent = 'center';
    iconWrap.style.boxShadow = '0 4px 16px rgba(27, 27, 27, 0.08)';

    const icon = document.createElement('img');
    icon.src = app.iconUrl;
    icon.alt = `${app.name} icon`;
    icon.width = 48;
    icon.height = 48;
    icon.style.width = '48px';
    icon.style.height = '48px';
    icon.style.objectFit = 'contain';

    iconWrap.appendChild(icon);
    media.appendChild(iconWrap);

    const content = document.createElement('div');
    content.style.padding = '20px 22px 22px';

    const name = document.createElement('h3');
    name.textContent = app.name;
    name.style.margin = '0 0 16px';
    name.style.color = '#1B1B1B';
    name.style.fontFamily = '"Inter","Inter Fallback",Arial,Helvetica,sans-serif';
    name.style.fontSize = '20px';
    name.style.fontWeight = '600';
    name.style.lineHeight = '1.25';

    const tags = document.createElement('div');
    tags.style.display = 'flex';
    tags.style.flexWrap = 'wrap';
    tags.style.gap = '8px';

    app.tags.forEach((tagText) => {
      const tag = document.createElement('span');
      tag.textContent = tagText;
      tag.style.display = 'inline-flex';
      tag.style.alignItems = 'center';
      tag.style.padding = '4px 6px';
      tag.style.background = '#f4ebe2';
      tag.style.color = '#5f5951';
      tag.style.fontFamily = '"Inter","Inter Fallback",Arial,Helvetica,sans-serif';
      tag.style.fontSize = '11px';
      tag.style.fontWeight = '500';
      tag.style.letterSpacing = '0.02em';
      tag.style.textTransform = 'uppercase';
      tags.appendChild(tag);
    });

    content.append(name, tags);
    cardLink.append(media, content);
    track.appendChild(cardLink);
  });

  const progress = document.createElement('div');
  progress.style.position = 'relative';
  progress.style.height = '3px';
  progress.style.marginTop = '20px';
  progress.style.background = '#d7d0c7';
  progress.style.borderRadius = '999px';
  progress.style.overflow = 'hidden';

  const progressThumb = document.createElement('div');
  progressThumb.style.position = 'absolute';
  progressThumb.style.top = '0';
  progressThumb.style.left = '0';
  progressThumb.style.height = '100%';
  progressThumb.style.width = '180px';
  progressThumb.style.maxWidth = '40%';
  progressThumb.style.background = '#7d776e';
  progressThumb.style.borderRadius = '999px';
  progress.appendChild(progressThumb);

  const updateProgress = () => {
    const maxScroll = Math.max(track.scrollWidth - track.clientWidth, 1);
    const ratio = Math.min(Math.max(track.scrollLeft / maxScroll, 0), 1);
    const travel = Math.max(progress.clientWidth - progressThumb.clientWidth, 0);
    progressThumb.style.transform = `translateX(${travel * ratio}px)`;
  };

  const scrollAmount = () => Math.max(track.clientWidth * 0.92, 320);
  const handlePrevious = () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  const handleNext = () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });

  previousButton.addEventListener('click', handlePrevious);
  nextButton.addEventListener('click', handleNext);
  track.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  const responsiveStyles = document.createElement('style');
  responsiveStyles.textContent = `
    #${FEATURED_APPS_SECTION_ID} [data-featured-track]::-webkit-scrollbar {
      display: none;
    }
    @media (max-width: 1024px) {
      #${FEATURED_APPS_SECTION_ID} [data-featured-track] {
        grid-template-columns: repeat(3, minmax(320px, 1fr)) !important;
      }
    }
    @media (max-width: 768px) {
      #${FEATURED_APPS_SECTION_ID} {
        margin-bottom: 40px !important;
        padding: 0 16px !important;
      }
      #${FEATURED_APPS_SECTION_ID} [data-featured-header] {
        margin-bottom: 20px !important;
      }
      #${FEATURED_APPS_SECTION_ID} [data-featured-controls] {
        display: none !important;
      }
      #${FEATURED_APPS_SECTION_ID} [data-featured-track] {
        grid-template-columns: repeat(3, minmax(280px, 1fr)) !important;
        gap: 20px !important;
      }
    }
  `;
  document.head.appendChild(responsiveStyles);

  header.setAttribute('data-featured-header', 'true');
  controls.setAttribute('data-featured-controls', 'true');
  track.setAttribute('data-featured-track', 'true');

  section.append(header, track, progress);
  insertionPoint.insertBefore(section, allAppsSection);
  updateProgress();

  return () => {
    previousButton.removeEventListener('click', handlePrevious);
    nextButton.removeEventListener('click', handleNext);
    track.removeEventListener('scroll', updateProgress);
    window.removeEventListener('resize', updateProgress);
    responsiveStyles.remove();
    section.remove();
  };
}

function wireAccordions(root: HTMLElement) {
  const accordions = Array.from(root.querySelectorAll<HTMLElement>('.MuiAccordion-root'));

  const cleanupFns = accordions.map((accordion, index) => {
    const summary = accordion.querySelector<HTMLElement>('.MuiAccordionSummary-root');
    const collapse = accordion.querySelector<HTMLElement>('.MuiCollapse-root');
    const region = accordion.querySelector<HTMLElement>('.MuiAccordion-region');
    const details = accordion.querySelector<HTMLElement>('.MuiAccordionDetails-root');

    if (!summary || !collapse || !region || !details) {
      return () => undefined;
    }

    summary.style.display = 'flex';
    summary.style.alignItems = 'center';
    summary.style.justifyContent = 'space-between';
    summary.style.gap = '16px';
    summary.style.width = '100%';

    const ensureIconWrapper = (className: 'expandIconWrapper' | 'collapseIconWrapper', symbol: string) => {
      let wrapper = accordion.querySelector<HTMLElement>(`.${className}`);
      if (!wrapper) {
        wrapper = document.createElement('span');
        wrapper.className = className;
        wrapper.setAttribute('aria-hidden', 'true');
        summary.appendChild(wrapper);
      }

      wrapper.replaceChildren();
      wrapper.style.display = 'inline-flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';
      wrapper.style.width = '34px';
      wrapper.style.height = '34px';
      wrapper.style.minWidth = '34px';
      wrapper.style.borderRadius = '999px';
      wrapper.style.backgroundColor = '#1B1B1B';
      wrapper.style.flexShrink = '0';
      wrapper.style.marginLeft = 'auto';

      const glyph = document.createElement('span');
      glyph.textContent = symbol;
      glyph.style.display = 'block';
      glyph.style.color = '#FFFFFF';
      glyph.style.fontSize = symbol === '+' ? '28px' : '24px';
      glyph.style.fontWeight = '500';
      glyph.style.lineHeight = '1';
      glyph.style.fontFamily = 'Inter, Arial, sans-serif';
      glyph.style.transform = symbol === '+' ? 'translateY(-1px)' : 'translateY(-2px)';
      wrapper.appendChild(glyph);

      return wrapper;
    };

    const expandIcon = ensureIconWrapper('expandIconWrapper', '+');
    const collapseIcon = ensureIconWrapper('collapseIconWrapper', '-');

    const summaryId = `deel-integrations-accordion-header-${index}`;
    const regionId = `deel-integrations-accordion-panel-${index}`;

    summary.id = summaryId;
    summary.setAttribute('aria-controls', regionId);
    summary.setAttribute('role', 'button');
    summary.tabIndex = 0;

    region.id = regionId;
    region.setAttribute('aria-labelledby', summaryId);

    const setExpanded = (expanded: boolean) => {
      accordion.classList.toggle('Mui-expanded', expanded);
      summary.classList.toggle('Mui-expanded', expanded);
      region.classList.toggle('Mui-expanded', expanded);
      collapse.classList.toggle('MuiCollapse-hidden', !expanded);
      collapse.classList.toggle('Mui-expanded', expanded);

      summary.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      region.hidden = !expanded;
      collapse.style.minHeight = expanded ? 'unset' : '0px';
      collapse.style.height = expanded ? 'auto' : '0px';
      collapse.style.overflow = expanded ? 'visible' : 'hidden';
      collapse.style.visibility = expanded ? 'visible' : 'hidden';
      region.style.display = expanded ? '' : 'none';
      details.style.display = expanded ? '' : 'none';

      collapseIcon.style.display = expanded ? 'inline-flex' : 'none';
      expandIcon.style.display = expanded ? 'none' : 'inline-flex';
    };

    const toggle = () => {
      const expanded = summary.getAttribute('aria-expanded') === 'true';
      setExpanded(!expanded);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    };

    summary.addEventListener('click', toggle);
    summary.addEventListener('keydown', handleKeyDown);

    const initiallyExpanded =
      accordion.classList.contains('Mui-expanded') || summary.getAttribute('aria-expanded') === 'true';
    setExpanded(initiallyExpanded);

    return () => {
      summary.removeEventListener('click', toggle);
      summary.removeEventListener('keydown', handleKeyDown);
    };
  });

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
  };
}

export default function DeelIntegrationsPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const previousHtmlClassName = document.documentElement.className;
    const previousBodyClassName = document.body.className;

    document.title = DEEL_INTEGRATIONS_PAGE_TITLE;

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${DEEL_INTEGRATIONS_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    DEEL_INTEGRATIONS_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    DEEL_INTEGRATIONS_INLINE_STYLES.forEach((cssText, index) => {
      const style = document.createElement('style');
      style.setAttribute(STYLE_DATA_ATTR, String(index));
      style.textContent = cssText;
      document.head.appendChild(style);
      cleanupNodes.push(style);
    });

    return () => {
      cleanupNodes.forEach((node) => node.remove());
      document.title = previousTitle;
      document.documentElement.className = previousHtmlClassName;
      document.body.className = previousBodyClassName;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    root.querySelectorAll('header, footer').forEach((element) => {
      element.remove();
    });

    normalizeImageSources(root);

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const rawHref = anchor.getAttribute('href')?.trim() ?? '';
      if (!rawHref || rawHref === '#' || rawHref === '#!') {
        event.preventDefault();
        return;
      }

      if (anchor.target === '_blank' || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        return;
      }

      let url: URL;
      try {
        url = new URL(rawHref, window.location.origin);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      navigateWithinApp(url.toString());
    };

    root.addEventListener('click', handleAnchorClick);
    const cleanupAccordions = wireAccordions(root);
    const cleanupFeaturedApps = injectFeaturedAppsSection(root);

    return () => {
      root.removeEventListener('click', handleAnchorClick);
      cleanupAccordions();
      cleanupFeaturedApps();
    };
  }, []);

  return (
    <SharedLandingPageLayout>
      <div ref={rootRef} data-page="deel-integrations-react">
        <DeelIntegrationsContent />
      </div>
    </SharedLandingPageLayout>
  );
}
