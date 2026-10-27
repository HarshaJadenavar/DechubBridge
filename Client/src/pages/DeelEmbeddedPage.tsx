import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  DEEL_EMBEDDED_HTML_CLASSES,
  DEEL_EMBEDDED_INLINE_STYLES,
  DEEL_EMBEDDED_STYLESHEET_HREFS,
  DeelEmbeddedContent,
} from './deelEmbedded/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';
import { applySolutionPageContent } from './solutionPageContent';
import Section02 from '../landing_deel/components/Section02.jsx';
import Section07 from '../landing_deel/components/Section07.jsx';

const STYLE_DATA_ATTR = 'data-deel-embedded-style';
const LINK_DATA_ATTR = 'data-deel-embedded-stylesheet';
const EMBEDDED_LAYOUT_FIXES = `
  html:has(.deel-embedded-page), body:has(.deel-embedded-page) { max-width: 100%; overflow-x: hidden; }
  .deel-embedded-page, .deel-embedded-page [data-ab-page="true"] > .w-full { width: 100%; max-width: 100vw; overflow-x: clip; }
  .deel-embedded-page section { max-width: 100%; }
  .deel-embedded-page .embedded-generated-logo-strip,
  .deel-embedded-page .embedded-generated-key-figures,
  .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div + div,
  .deel-embedded-page .mui-16f0pz5 .mui-1si5xjn { display: none !important; }
  .deel-embedded-page .embedded-landing-logo-strip-mount,
  .deel-embedded-page .deel-logo-strip,
  .deel-embedded-page .deel-logo-strip__viewport { width: 100%; max-width: 100%; overflow: hidden; }
  .deel-embedded-page .deel-logo-strip__track { min-width: max-content; }
  .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child { width: 100%; overflow: hidden; padding: 12px !important; }
  .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child > div { width: 100% !important; max-width: 1704px !important; min-width: 0; margin-inline: auto !important; }
  .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child > div > div { min-width: 0; overflow: hidden; }
  .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] { display: flex !important; flex-direction: column !important; gap: 12px !important; }
  .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div { display: flex !important; gap: 12px !important; }
  .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div { margin-top: 24px !important; }
  .deel-embedded-page .swiper-slider-comparison-slider { overflow-x: auto !important; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .deel-embedded-page .swiper-slider-comparison-slider::-webkit-scrollbar { display: none; }
  .deel-embedded-page .swiper-slider-comparison-slider .swiper-wrapper { display: flex !important; width: max-content !important; }
  .deel-embedded-page .swiper-slider-comparison-slider .swiper-slide { flex: 0 0 min(31vw, 560px); scroll-snap-align: start; }
  .deel-embedded-page section[id="10"] { margin-bottom: 0 !important; padding: clamp(40px, 4.8vw, 92px) clamp(24px, 3.125vw, 60px) clamp(48px, 5vw, 96px) !important; }
  .deel-embedded-page section[id="10"] > div:first-child { width: 100% !important; max-width: 1776px !important; min-height: 600px !important; margin-inline: auto !important; border-radius: 30px !important; }
  .deel-embedded-page section[id="10"] > div:first-child > div:first-child { height: 100% !important; padding-inline: clamp(32px, 5vw, 96px) !important; align-items: center !important; }
  .deel-embedded-page section[id="10"] > div:first-child > div:first-child > div:first-child { gap: 32px !important; justify-content: center !important; }
  .deel-embedded-page section[id="10"] h2 { margin: 0 !important; }
  .deel-embedded-page section[id="10"] + .MuiBox-root { margin-top: 0 !important; }
  @media (min-width: 1050px) {
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child > div { display: flex !important; flex-direction: row !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { width: 50% !important; flex: 0 1 50% !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child { display: flex !important; padding: 96px 64px !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child > div:first-child { width: 100% !important; max-width: 450px !important; margin: auto !important; align-items: center !important; justify-content: center !important; text-align: center !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child h1,
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child h1 + div,
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child h1 + div > p { text-align: center !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child h1 { margin-bottom: 48px !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child h1 + div { margin-top: 24px !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] { min-height: 80px !important; padding-top: 20px !important; padding-bottom: 20px !important; }
  }
  @media (max-width: 1049px) {
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child > div { flex-direction: column !important; min-height: auto !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { width: 100% !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child { padding: 48px 24px !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { display: none !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child h1 { font-size: 38px !important; line-height: 1.05 !important; overflow-wrap: anywhere; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] { width: 100% !important; gap: 12px !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div { min-width: 0; gap: 12px !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] { min-width: 0 !important; min-height: 76px !important; padding: 12px !important; overflow-wrap: anywhere; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div { width: 100% !important; margin-top: 24px !important; }
    .deel-embedded-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div button { width: 100% !important; min-height: 52px; }
    .deel-embedded-page .swiper-slider-comparison-slider .swiper-slide { flex-basis: min(82vw, 420px); }
    .deel-embedded-page section[id="10"] { padding: 32px 16px 48px !important; }
    .deel-embedded-page section[id="10"] > div:first-child { min-height: 620px !important; border-radius: 20px !important; }
    .deel-embedded-page section[id="10"] > div:first-child > div:first-child { padding: 48px 24px 24px !important; }
    .deel-embedded-page section[id="10"] > div:first-child > div:first-child > div:first-child { align-items: center !important; text-align: center !important; }
    .deel-embedded-page section[id="10"] h2, .deel-embedded-page section[id="10"] h2 + div { text-align: center !important; justify-content: center !important; }
  }
  @media (max-width: 700px) {
    .deel-embedded-page .mui-3lz68q { grid-template-columns: minmax(0, 1fr) !important; gap: 28px !important; }
    .deel-embedded-page .mui-3lz68q > .mui-pjjft1 { grid-column: auto !important; padding-right: 0 !important; }
  }
`;

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function wireSlider(root: HTMLElement) {
  const cleanupFns: Array<() => void> = [];
  const tracks = Array.from(root.querySelectorAll<HTMLElement>('[id]')).filter((element) =>
    element.querySelector('.swiper-wrapper'),
  );

  tracks.forEach((track) => {
    const wrapper = track.querySelector<HTMLElement>('.swiper-wrapper');
    if (!wrapper) {
      return;
    }

    const trackId = track.id;
    const nav = trackId ? root.querySelector<HTMLElement>(`#nav-${trackId}`) : null;
    const previousButton = nav?.querySelector<HTMLButtonElement>('.swiper-button-prev');
    const nextButton = nav?.querySelector<HTMLButtonElement>('.swiper-button-next');

    if (!previousButton || !nextButton) {
      return;
    }

    track.style.overflowX = 'auto';
    track.style.scrollBehavior = 'smooth';
    track.style.scrollbarWidth = 'none';
    wrapper.style.display = 'flex';

    Array.from(wrapper.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        child.style.scrollSnapAlign = 'start';
      }
    });

    const scrollAmount = () => Math.max(track.clientWidth * 0.9, 320);
    const handlePrevious = () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    const handleNext = () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });

    previousButton.addEventListener('click', handlePrevious);
    nextButton.addEventListener('click', handleNext);

    cleanupFns.push(() => {
      previousButton.removeEventListener('click', handlePrevious);
      nextButton.removeEventListener('click', handleNext);
    });
  });

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
  };
}

function wireTabs(root: HTMLElement) {
  const tabLists = Array.from(root.querySelectorAll<HTMLElement>('[role="tablist"]'));
  const cleanupFns = tabLists.map((tabList, listIndex) => {
    const tabs = Array.from(tabList.querySelectorAll<HTMLElement>('[role="tab"]'));
    if (tabs.length === 0) {
      return () => undefined;
    }

    const tabContainer = tabList.closest('.MuiTabs-root') ?? tabList.parentElement;
    const panels = Array.from(
      tabContainer?.parentElement?.querySelectorAll<HTMLElement>('[role="tabpanel"]') ?? [],
    );

    const activateTab = (nextTab: HTMLElement) => {
      tabs.forEach((tab, tabIndex) => {
        const selected = tab === nextTab;
        const generatedId = tab.id || `deel-embedded-tab-${listIndex}-${tabIndex}`;
        const generatedPanelId = `deel-embedded-tabpanel-${listIndex}-${tabIndex}`;

        tab.id = generatedId;
        tab.setAttribute('aria-controls', generatedPanelId);
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.setAttribute('tabindex', selected ? '0' : '-1');
        tab.classList.toggle('Mui-selected', selected);
      });

      panels.forEach((panel, panelIndex) => {
        const linkedTab = tabs[panelIndex];
        const active = linkedTab === nextTab;

        panel.hidden = !active;
        panel.style.display = active ? '' : 'none';
        panel.setAttribute('tabindex', active ? '0' : '-1');

        if (!linkedTab) {
          return;
        }

        const generatedId = linkedTab.id || `deel-embedded-tab-${listIndex}-${panelIndex}`;
        const generatedPanelId = `deel-embedded-tabpanel-${listIndex}-${panelIndex}`;

        linkedTab.id = generatedId;
        linkedTab.setAttribute('aria-controls', generatedPanelId);
        panel.id = generatedPanelId;
        panel.setAttribute('aria-labelledby', generatedId);
      });
    };

    const disposers = tabs.map((tab, tabIndex) => {
      tab.id ||= `deel-embedded-tab-${listIndex}-${tabIndex}`;

      const handleClick = () => activateTab(tab);
      const handleKeyDown = (event: KeyboardEvent) => {
        const currentIndex = tabs.indexOf(tab);

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          const nextTab = tabs[(currentIndex + 1) % tabs.length];
          activateTab(nextTab);
          nextTab.focus();
          return;
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          const nextTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
          activateTab(nextTab);
          nextTab.focus();
          return;
        }

        if (event.key === 'Home') {
          event.preventDefault();
          activateTab(tabs[0]);
          tabs[0].focus();
          return;
        }

        if (event.key === 'End') {
          event.preventDefault();
          const nextTab = tabs[tabs.length - 1];
          activateTab(nextTab);
          nextTab.focus();
        }
      };

      tab.addEventListener('click', handleClick);
      tab.addEventListener('keydown', handleKeyDown);

      return () => {
        tab.removeEventListener('click', handleClick);
        tab.removeEventListener('keydown', handleKeyDown);
      };
    });

    const initiallySelected =
      tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];
    activateTab(initiallySelected);

    return () => {
      disposers.forEach((dispose) => dispose());
    };
  });

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
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

    const ensureIconWrapper = (
      className: 'expandIconWrapper' | 'collapseIconWrapper',
      symbol: '+' | '−',
    ) => {
      let wrapper = accordion.querySelector<HTMLElement>(`.${className}`);
      if (!wrapper) {
        wrapper = document.createElement('span');
        wrapper.className = className;
        wrapper.setAttribute('aria-hidden', 'true');
        wrapper.textContent = symbol;
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.width = '34px';
        wrapper.style.height = '34px';
        wrapper.style.minWidth = '34px';
        wrapper.style.borderRadius = '999px';
        wrapper.style.backgroundColor = '#1B1B1B';
        wrapper.style.color = '#FFFFFF';
        wrapper.style.fontSize = symbol === '+' ? '28px' : '24px';
        wrapper.style.fontWeight = '500';
        wrapper.style.lineHeight = '1';
        wrapper.style.flexShrink = '0';
        wrapper.style.marginLeft = 'auto';
        summary.appendChild(wrapper);
      }

      return wrapper;
    };

    const expandIcon = ensureIconWrapper('expandIconWrapper', '+');
    const collapseIcon = ensureIconWrapper('collapseIconWrapper', '−');

    // The generated SVG wrapper names are reversed, so use direct symbols for each state.
    const openIcon = accordion.querySelector<HTMLElement>('.expandIconWrapper');
    const closedIcon = accordion.querySelector<HTMLElement>('.collapseIconWrapper');
    const setIcon = (icon: HTMLElement | null, symbol: '+' | '-') => {
      if (!icon) {
        return;
      }

      icon.replaceChildren(symbol);
      icon.setAttribute('aria-hidden', 'true');
      icon.style.display = 'inline-flex';
      icon.style.alignItems = 'center';
      icon.style.justifyContent = 'center';
      icon.style.width = '48px';
      icon.style.height = '48px';
      icon.style.minWidth = '48px';
      icon.style.borderRadius = '999px';
      icon.style.backgroundColor = '#1B1B1B';
      icon.style.color = '#FFFFFF';
      icon.style.fontSize = symbol === '+' ? '32px' : '28px';
      icon.style.fontWeight = '500';
      icon.style.lineHeight = '1';
      icon.style.flexShrink = '0';
      icon.style.marginLeft = 'auto';
    };

    setIcon(openIcon, '-');
    setIcon(closedIcon, '+');

    const summaryId = `deel-embedded-accordion-header-${index}`;
    const regionId = `deel-embedded-accordion-panel-${index}`;

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

      expandIcon.style.setProperty('display', expanded ? 'inline-flex' : 'none', 'important');
      collapseIcon.style.setProperty('display', expanded ? 'none' : 'inline-flex', 'important');
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

function wireCheckboxButtons(root: HTMLElement) {
  const checkboxes = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="checkbox"]'));

  const setChecked = (button: HTMLButtonElement, checked: boolean) => {
    button.setAttribute('aria-checked', checked ? 'true' : 'false');
    button.style.background = checked ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)';
    button.style.borderColor = checked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)';

    const marker = button.querySelector<HTMLElement>('span[aria-hidden="true"]');
    if (marker) {
      marker.style.background = checked ? 'var(--color-purple-525)' : 'transparent';
      marker.style.borderColor = 'var(--color-purple-525)';
      marker.style.boxShadow = checked ? 'inset 0 0 0 3px rgba(255,255,255,0.95)' : '';
    }
  };

  const cleanupFns = checkboxes.map((button) => {
    setChecked(button, button.getAttribute('aria-checked') === 'true');

    const handleClick = () => {
      const nextChecked = button.getAttribute('aria-checked') !== 'true';
      setChecked(button, nextChecked);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    };

    button.addEventListener('click', handleClick);
    button.addEventListener('keydown', handleKeyDown);

    return () => {
      button.removeEventListener('click', handleClick);
      button.removeEventListener('keydown', handleKeyDown);
    };
  });

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
  };
}

export default function DeelEmbeddedPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [landingLogoStripTarget, setLandingLogoStripTarget] = useState<HTMLDivElement | null>(null);
  const [landingKeyFiguresTarget, setLandingKeyFiguresTarget] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const previousHtmlClassName = document.documentElement.className;
    const previousBodyClassName = document.body.className;

    document.title = 'Dechub-Bridge Embedded | Connected Delivery Workspace';

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${DEEL_EMBEDDED_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    DEEL_EMBEDDED_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    DEEL_EMBEDDED_INLINE_STYLES.forEach((cssText, index) => {
      const style = document.createElement('style');
      style.setAttribute(STYLE_DATA_ATTR, String(index));
      style.textContent = cssText;
      document.head.appendChild(style);
      cleanupNodes.push(style);
    });

    const layoutStyle = document.createElement('style');
    layoutStyle.setAttribute(STYLE_DATA_ATTR, 'layout-fixes');
    layoutStyle.textContent = EMBEDDED_LAYOUT_FIXES;
    document.head.appendChild(layoutStyle);
    cleanupNodes.push(layoutStyle);

    return () => {
      cleanupNodes.forEach((node) => node.remove());
      document.title = previousTitle;
      document.documentElement.className = previousHtmlClassName;
      document.body.className = previousBodyClassName;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (root) {
      const cleanup = applySolutionPageContent(root, 'embedded');
      const heroImage = Array.from(root.querySelectorAll<HTMLImageElement>('img')).find((image) =>
        image.getAttribute('src')?.includes('/solutions/embedded/assets/images/embedded_ab535631ff-'),
      );
      if (heroImage) {
        heroImage.src = '/dechub-assets/embedded-project-workspace.png?v=2';
        heroImage.alt = 'Project workspace with connected integrations and branded tools';
        heroImage.removeAttribute('srcset');
        heroImage.closest('picture')?.querySelectorAll('source').forEach((source) => source.remove());
      } else {
        console.error('Unable to find the embedded page hero image to replace.');
      }
      return cleanup;
    }

    return undefined;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const generatedLogoStrip = root?.querySelector<HTMLElement>('section.logo-stripe-standard-wrapper');

    if (!generatedLogoStrip?.parentElement) {
      return undefined;
    }

    const mount = document.createElement('div');
    mount.className = 'embedded-landing-logo-strip-mount';
    generatedLogoStrip.classList.add('embedded-generated-logo-strip');
    generatedLogoStrip.parentElement.insertBefore(mount, generatedLogoStrip);
    setLandingLogoStripTarget(mount);

    return () => {
      generatedLogoStrip.classList.remove('embedded-generated-logo-strip');
      mount.remove();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const generatedKeyFigures = root?.querySelector<HTMLElement>('div.key-figures-wrapper');

    if (!generatedKeyFigures?.parentElement) {
      return undefined;
    }

    const mount = document.createElement('div');
    mount.className = 'embedded-landing-key-figures-mount';
    generatedKeyFigures.classList.add('embedded-generated-key-figures');
    generatedKeyFigures.parentElement.insertBefore(mount, generatedKeyFigures);
    setLandingKeyFiguresTarget(mount);

    return () => {
      generatedKeyFigures.classList.remove('embedded-generated-key-figures');
      mount.remove();
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
      const nextUrl = `${normalizePathname(url.pathname)}${url.search}${url.hash}`;
      const currentUrl = `${normalizePathname(window.location.pathname)}${window.location.search}${window.location.hash}`;

      if (nextUrl !== currentUrl) {
        window.history.pushState({}, '', nextUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }

      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    const cleanupSlider = wireSlider(root);
    const cleanupTabs = wireTabs(root);
    const cleanupAccordions = wireAccordions(root);
    const cleanupCheckboxes = wireCheckboxButtons(root);

    root.addEventListener('click', handleAnchorClick);

    return () => {
      root.removeEventListener('click', handleAnchorClick);
      cleanupSlider();
      cleanupTabs();
      cleanupAccordions();
      cleanupCheckboxes();
    };
  }, []);

  return (
    <SharedLandingPageLayout>
      <div ref={rootRef} className="deel-embedded-page" data-page="deel-embedded-react">
        <DeelEmbeddedContent />
        {landingLogoStripTarget ? createPortal(<Section02 />, landingLogoStripTarget) : null}
        {landingKeyFiguresTarget ? createPortal(<Section07 />, landingKeyFiguresTarget) : null}
      </div>
    </SharedLandingPageLayout>
  );
}
