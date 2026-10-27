import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  DEEL_CONTRACTORS_HTML_CLASSES,
  DEEL_CONTRACTORS_INLINE_STYLES,
  DEEL_CONTRACTORS_PAGE_TITLE,
  DEEL_CONTRACTORS_STYLESHEET_HREFS,
  DeelContractorsContent,
} from './deelContractors/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';

const STYLE_DATA_ATTR = 'data-deel-contractors-style';
const LINK_DATA_ATTR = 'data-deel-contractors-stylesheet';

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
        const generatedId = tab.id || `deel-contractors-tab-${listIndex}-${tabIndex}`;
        const generatedPanelId = `deel-contractors-tabpanel-${listIndex}-${tabIndex}`;

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

        const generatedId = linkedTab.id || `deel-contractors-tab-${listIndex}-${panelIndex}`;
        const generatedPanelId = `deel-contractors-tabpanel-${listIndex}-${panelIndex}`;

        linkedTab.id = generatedId;
        linkedTab.setAttribute('aria-controls', generatedPanelId);
        panel.id = generatedPanelId;
        panel.setAttribute('aria-labelledby', generatedId);
      });
    };

    const disposers = tabs.map((tab, tabIndex) => {
      tab.id ||= `deel-contractors-tab-${listIndex}-${tabIndex}`;

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
      symbol: string,
    ) => {
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

    const summaryId = `deel-contractors-accordion-header-${index}`;
    const regionId = `deel-contractors-accordion-panel-${index}`;

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

function wireQuoteTestimonials(root: HTMLElement) {
  const quoteSlider = root.querySelector<HTMLElement>('#quote-slider-604');
  if (!quoteSlider) {
    return () => undefined;
  }

  const quotesByAuthor = new Map<string, string>([
    [
      'Jonathan Siddharth',
      '“Before Deel, hiring and paying our global team was an ordeal. Now for our hundreds of contractors we can manage contracts, compliance, and payments all in one place. Deel’s changed the remote hiring world for us.”',
    ],
    [
      'Kyle Yoon',
      '“All of our employees and developers love Deel as it’s very easy to use and intuitive even for people that are not so familiar with these tech products.”',
    ],
  ]);

  const slides = Array.from(quoteSlider.querySelectorAll<HTMLElement>('.swiper-slide'));

  slides.forEach((slide) => {
    const authorName = slide.querySelector<HTMLElement>('.mui-254ot0 p');
    const quoteContainer = slide.querySelector<HTMLElement>('.mui-uzyarg');

    if (!authorName || !quoteContainer) {
      return;
    }

    const existingText = quoteContainer.textContent?.replace(/\s+/g, '') ?? '';
    if (existingText.length > 0) {
      return;
    }

    const quote = quotesByAuthor.get(authorName.textContent?.trim() ?? '');
    if (!quote) {
      return;
    }

    const paragraph = document.createElement('p');
    paragraph.textContent = quote;
    paragraph.style.margin = '0';
    paragraph.style.maxWidth = '1160px';
    paragraph.style.textAlign = 'center';
    paragraph.style.fontFamily = '"BagossStandardVF","BagossStandardVF Fallback",Arial,Helvetica,sans-serif';
    paragraph.style.fontSize = 'clamp(34px, 4vw, 58px)';
    paragraph.style.fontWeight = '400';
    paragraph.style.lineHeight = '1.3';
    paragraph.style.letterSpacing = '-0.02em';
    paragraph.style.color = '#1B1B1B';

    quoteContainer.style.display = 'flex';
    quoteContainer.style.justifyContent = 'center';
    quoteContainer.style.alignItems = 'center';
    quoteContainer.style.width = '100%';
    quoteContainer.style.minHeight = '220px';
    quoteContainer.style.padding = '24px 0 12px';

    quoteContainer.replaceChildren(paragraph);
  });

  return () => undefined;
}

export default function DeelContractorsPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const previousHtmlClassName = document.documentElement.className;
    const previousBodyClassName = document.body.className;

    document.title = DEEL_CONTRACTORS_PAGE_TITLE;

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${DEEL_CONTRACTORS_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    DEEL_CONTRACTORS_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    DEEL_CONTRACTORS_INLINE_STYLES.forEach((cssText, index) => {
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

    const cleanupSlider = wireSlider(root);
    const cleanupTabs = wireTabs(root);
    const cleanupAccordions = wireAccordions(root);
    const cleanupCheckboxes = wireCheckboxButtons(root);
    const cleanupQuotes = wireQuoteTestimonials(root);

    return () => {
      root.removeEventListener('click', handleAnchorClick);
      cleanupSlider();
      cleanupTabs();
      cleanupAccordions();
      cleanupCheckboxes();
      cleanupQuotes();
    };
  }, []);

  return (
    <SharedLandingPageLayout>
      <div ref={rootRef}>
        <DeelContractorsContent />
      </div>
    </SharedLandingPageLayout>
  );
}
