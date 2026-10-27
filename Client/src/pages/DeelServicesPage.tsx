import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  DEEL_SERVICES_HTML_CLASSES,
  DEEL_SERVICES_INLINE_STYLES,
  DEEL_SERVICES_STYLESHEET_HREFS,
  DeelServicesContent,
} from './deelServices/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';
import { applySolutionPageContent } from './solutionPageContent';
import Section02 from '../landing_deel/components/Section02.jsx';
import Section07 from '../landing_deel/components/Section07.jsx';

const STYLE_DATA_ATTR = 'data-deel-services-style';
const LINK_DATA_ATTR = 'data-deel-services-stylesheet';
const SERVICES_LAYOUT_FIXES = `
  html:has(.deel-services-page), body:has(.deel-services-page) { max-width: 100%; overflow-x: hidden; }
  .deel-services-page, .deel-services-page [data-ab-page="true"] > .w-full { width: 100%; max-width: 100vw; overflow-x: clip; }
  .deel-services-page section { max-width: 100%; }
  .deel-services-page .services-generated-logo-strip,
  .deel-services-page .services-generated-key-figures,
  .deel-services-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div + div,
  .deel-services-page .mui-16f0pz5 .mui-1si5xjn { display: none !important; }
  .deel-services-page .services-landing-logo-strip-mount,
  .deel-services-page .deel-logo-strip,
  .deel-services-page .deel-logo-strip__viewport { width: 100%; max-width: 100%; overflow: hidden; }
  .deel-services-page .deel-logo-strip__track { min-width: max-content; }
  .deel-services-page [data-ab-page="true"] > .w-full > section:first-child { width: 100%; overflow: hidden; padding: 12px !important; }
  .deel-services-page [data-ab-page="true"] > .w-full > section:first-child > div { width: 100% !important; max-width: 1704px !important; min-width: 0; margin-inline: auto !important; }
  .deel-services-page [data-ab-page="true"] > .w-full > section:first-child > div > div { min-width: 0; overflow: hidden; }
  .deel-services-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] { display: flex !important; flex-direction: column !important; gap: 12px !important; }
  .deel-services-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div { display: flex !important; gap: 12px !important; }
  .deel-services-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div { margin-top: 24px !important; }
  .deel-services-page .swiper-slider-comparison-slider { overflow-x: auto !important; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .deel-services-page .swiper-slider-comparison-slider::-webkit-scrollbar { display: none; }
  .deel-services-page .swiper-slider-comparison-slider .swiper-wrapper { display: flex !important; width: max-content !important; }
  .deel-services-page .swiper-slider-comparison-slider .swiper-slide { flex: 0 0 min(31vw, 560px); scroll-snap-align: start; }
  .deel-services-audience-frame { width: 100%; padding: 12px !important; }
  .deel-services-audience-section { width: 100%; margin: 0 !important; padding: 64px clamp(24px, 6vw, 112px) !important; }
  .deel-services-audience-section > div:first-child { width: 100% !important; max-width: 1312px !important; margin-inline: auto !important; }
  .deel-services-audience-section h2 { width: 100%; max-width: 667px; margin-inline: auto; text-align: center !important; }
  .deel-services-audience-section .MuiTabs-scroller { overflow-x: auto !important; scrollbar-width: none; }
  .deel-services-audience-section .MuiTabs-scroller::-webkit-scrollbar { display: none; }
  .deel-services-audience-section [role="tablist"] { width: max-content !important; min-width: max-content; margin-inline: auto !important; }
  .deel-services-audience-section .MuiTabs-root + div > div { display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 48px !important; }
  .deel-services-audience-section .MuiTabs-root + div > div > div { width: auto !important; min-width: 0 !important; flex: initial !important; }
  .deel-services-audience-section .MuiTabs-root + div > div > div:first-child { padding: 64px !important; }
  .deel-services-page section[id="7"] { margin-bottom: 0 !important; padding: clamp(40px, 4.8vw, 92px) clamp(24px, 3.125vw, 60px) clamp(48px, 5vw, 96px) !important; }
  .deel-services-page section[id="7"] > div:first-child { width: 100% !important; max-width: 1776px !important; min-height: 600px !important; margin-inline: auto !important; border-radius: 30px !important; }
  .deel-services-page section[id="7"] > div:first-child > div:first-child { height: 100% !important; padding-inline: clamp(32px, 5vw, 96px) !important; align-items: center !important; }
  .deel-services-page section[id="7"] > div:first-child > div:first-child > div:first-child { gap: 32px !important; justify-content: center !important; }
  .deel-services-page section[id="7"] h2 { margin: 0 !important; }
  .deel-services-page section[id="7"] + .MuiBox-root { margin-top: 0 !important; }
  @media (min-width: 1050px) {
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child > div { display: flex !important; flex-direction: row !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { width: 50% !important; flex: 0 1 50% !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child { display: flex !important; padding: 96px 64px !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child > div:first-child { width: 100% !important; max-width: 450px !important; margin: auto !important; align-items: center !important; justify-content: center !important; text-align: center !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child h1,
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child h1 + div,
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child h1 + div > p { text-align: center !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child h1 { margin-bottom: 48px !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child h1 + div { margin-top: 24px !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] { min-height: 80px !important; padding-top: 20px !important; padding-bottom: 20px !important; }
  }
  @media (max-width: 1049px) {
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child > div { flex-direction: column !important; min-height: auto !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { width: 100% !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child { padding: 48px 24px !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { display: none !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child h1 { font-size: 38px !important; line-height: 1.05 !important; overflow-wrap: anywhere; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] { width: 100% !important; gap: 12px !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div { min-width: 0; gap: 12px !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] { min-width: 0 !important; min-height: 76px !important; padding: 12px !important; overflow-wrap: anywhere; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div { width: 100% !important; margin-top: 24px !important; }
    .deel-services-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div button { width: 100% !important; min-height: 52px; }
    .deel-services-page .swiper-slider-comparison-slider .swiper-slide { flex-basis: min(82vw, 420px); }
    .deel-services-audience-frame { padding: 0 !important; }
    .deel-services-audience-section { padding: 48px 20px !important; border-radius: 0 !important; }
    .deel-services-audience-section [role="tablist"] { margin-inline: 0 !important; }
    .deel-services-audience-section .MuiTabs-root + div > div { grid-template-columns: minmax(0, 1fr); gap: 20px !important; }
    .deel-services-audience-section .MuiTabs-root + div > div > div:first-child { padding: 24px !important; }
    .deel-services-page section[id="7"] { padding: 32px 16px 48px !important; }
    .deel-services-page section[id="7"] > div:first-child { min-height: 620px !important; border-radius: 20px !important; }
    .deel-services-page section[id="7"] > div:first-child > div:first-child { padding: 48px 24px 24px !important; }
    .deel-services-page section[id="7"] > div:first-child > div:first-child > div:first-child { align-items: center !important; text-align: center !important; }
    .deel-services-page section[id="7"] h2, .deel-services-page section[id="7"] h2 + div { text-align: center !important; justify-content: center !important; }
  }
  @media (max-width: 700px) {
    .deel-services-page .mui-3lz68q { grid-template-columns: minmax(0, 1fr) !important; gap: 28px !important; }
    .deel-services-page .mui-3lz68q > .mui-pjjft1 { grid-column: auto !important; padding-right: 0 !important; }
  }
`;
const SERVICES_TAB_LABELS = [
  'Corporate Services',
  'Equity and Tokens',
  'Privacy Services',
  'Human Resource Services',
  'Background Checks',
] as const;

const SERVICES_TABS: Record<
  (typeof SERVICES_TAB_LABELS)[number],
  { title: string; description: string; ctaLabel: string; ctaLink: string; imageSrc: string }
> = {
  'Corporate Services': {
    title: 'Run entities worldwide',
    description:
      'Entity setup, foreign employer registration, and ongoing entity management are handled across countries, with filings, deadlines, and local requirements managed on your behalf.',
    ctaLabel: 'Explore Corporate Services',
    ctaLink: '/solutions/services/corporate-services/',
    imageSrc: '/solutions/services/assets/images/Map_73890c8164-dc7a55b32a.png',
  },
  'Equity and Tokens': {
    title: 'Support equity compliantly across borders',
    description:
      'Protect your team from tax risks with expert support for local obligations, ensuring vesting and exercise events are processed with precision.',
    ctaLabel: 'Explore Equity & Token Services',
    ctaLink: '/solutions/services/equity/',
    imageSrc: '/solutions/services/assets/images/Group_2147257378_b7076b3849-50cbc1f516.png',
  },
  'Privacy Services': {
    title: 'Navigate privacy requirements confidently',
    description:
      'Privacy consulting helps interpret data protection requirements, assess risk, and guide compliance decisions as regulations evolve across regions.',
    ctaLabel: 'Explore Privacy Consulting',
    ctaLink: '/solutions/services/privacy/',
    imageSrc: '/solutions/services/assets/images/Group_2147257346_579c25583e-609d81118c.png',
  },
  'Human Resource Services': {
    title: 'Handle complex people matters with expert support',
    description:
      'HR consulting supports sensitive workforce decisions, local employment requirements, and complex scenarios as teams grow in regions.',
    ctaLabel: 'Explore HR Services',
    ctaLink: '/solutions/services/privacy/',
    imageSrc: '/solutions/services/assets/images/Group_2147257472_8e84a1a46c-15e1c68420.png',
  },
  'Background Checks': {
    title: 'Verify workers before they onboard',
    description:
      'Global background checks are completed to verify identity and credentials before workers onboard.',
    ctaLabel: 'Explore Verifications',
    ctaLink: '/solutions/services/verifications/',
    imageSrc: '/solutions/services/assets/images/Group_2147257450_9ca64fb8c8-383b649822.png',
  },
};

function normalizePathname(pathname: string) {
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
        const generatedId = tab.id || `deel-services-tab-${listIndex}-${tabIndex}`;
        const generatedPanelId = `deel-services-tabpanel-${listIndex}-${tabIndex}`;

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

        const generatedId = linkedTab.id || `deel-services-tab-${listIndex}-${panelIndex}`;
        const generatedPanelId = `deel-services-tabpanel-${listIndex}-${panelIndex}`;

        linkedTab.id = generatedId;
        linkedTab.setAttribute('aria-controls', generatedPanelId);
        panel.id = generatedPanelId;
        panel.setAttribute('aria-labelledby', generatedId);
      });
    };

    const disposers = tabs.map((tab, tabIndex) => {
      tab.id ||= `deel-services-tab-${listIndex}-${tabIndex}`;

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

function wireServicesTabs(root: HTMLElement) {
  const tabList = Array.from(root.querySelectorAll<HTMLElement>('[role="tablist"]')).find((list) => {
    const labels = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).map((tab) =>
      tab.textContent?.trim(),
    );

    return SERVICES_TAB_LABELS.every((label) => labels.includes(label));
  });

  if (!tabList) {
    return () => undefined;
  }

  const tabs = Array.from(tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const sectionContent = tabList.closest('.MuiTabs-root')?.nextElementSibling as HTMLElement | null;
  const titleNode = sectionContent?.querySelector<HTMLElement>('h5');
  const descriptionNode = sectionContent?.querySelector<HTMLElement>('p');
  const ctaAnchor = sectionContent?.querySelector<HTMLAnchorElement>('a[href]');
  const ctaButton = ctaAnchor?.querySelector<HTMLButtonElement>('button');
  const imageNode = sectionContent?.querySelector<HTMLImageElement>('img');
  const indicator =
    tabList.querySelector<HTMLElement>('.MuiTabs-indicator') ?? document.createElement('span');

  if (
    !sectionContent ||
    !titleNode ||
    !descriptionNode ||
    !ctaAnchor ||
    !ctaButton ||
    !imageNode ||
    tabs.length === 0
  ) {
    return () => undefined;
  }

  indicator.className ||= 'MuiTabs-indicator mui-ttwr4n';

  const activateTab = (tab: HTMLButtonElement) => {
    const label = tab.textContent?.trim() as keyof typeof SERVICES_TABS | undefined;
    if (!label || !(label in SERVICES_TABS)) {
      return;
    }

    const nextContent = SERVICES_TABS[label];

    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', selected ? 'true' : 'false');
      candidate.setAttribute('tabindex', selected ? '0' : '-1');
      candidate.classList.toggle('Mui-selected', selected);
    });

    titleNode.textContent = nextContent.title;
    descriptionNode.textContent = nextContent.description;
    ctaAnchor.href = nextContent.ctaLink;
    ctaAnchor.setAttribute('aria-label', ` ${nextContent.ctaLink.replace(/\//g, ' ').trim()} `);

    const buttonLabelNode = Array.from(ctaButton.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    );
    if (buttonLabelNode) {
      buttonLabelNode.textContent = nextContent.ctaLabel;
    } else {
      ctaButton.textContent = nextContent.ctaLabel;
    }

    imageNode.src = nextContent.imageSrc;
    imageNode.setAttribute('srcset', nextContent.imageSrc);

    if (indicator.parentElement !== tab) {
      indicator.remove();
      tab.appendChild(indicator);
    }
  };

  const disposers = tabs.map((tab, index) => {
    const handleClick = () => activateTab(tab);
    const handleKeyDown = (event: KeyboardEvent) => {
      let nextIndex = index;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const nextTab = tabs[nextIndex];
      activateTab(nextTab);
      nextTab.focus();
    };

    tab.addEventListener('click', handleClick);
    tab.addEventListener('keydown', handleKeyDown);

    return () => {
      tab.removeEventListener('click', handleClick);
      tab.removeEventListener('keydown', handleKeyDown);
    };
  });

  const selectedTab =
    tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];
  activateTab(selectedTab);

  return () => {
    disposers.forEach((dispose) => dispose());
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
      wrapper.style.width = '48px';
      wrapper.style.height = '48px';
      wrapper.style.minWidth = '48px';
      wrapper.style.borderRadius = '999px';
      wrapper.style.backgroundColor = '#1B1B1B';
      wrapper.style.flexShrink = '0';
      wrapper.style.marginLeft = 'auto';

      const glyph = document.createElement('span');
      glyph.textContent = symbol;
      glyph.style.display = 'block';
      glyph.style.color = '#FFFFFF';
      glyph.style.fontSize = symbol === '+' ? '32px' : '28px';
      glyph.style.fontWeight = '500';
      glyph.style.lineHeight = '1';
      glyph.style.fontFamily = 'Inter, Arial, sans-serif';
      glyph.style.transform = symbol === '+' ? 'translateY(-1px)' : 'translateY(-2px)';

      wrapper.appendChild(glyph);

      return wrapper;
    };

    const expandIcon = ensureIconWrapper('expandIconWrapper', '+');
    const collapseIcon = ensureIconWrapper('collapseIconWrapper', '-');

    const summaryId = `deel-services-accordion-header-${index}`;
    const regionId = `deel-services-accordion-panel-${index}`;

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

      collapseIcon.style.setProperty('display', expanded ? 'inline-flex' : 'none', 'important');
      expandIcon.style.setProperty('display', expanded ? 'none' : 'inline-flex', 'important');
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

export default function DeelServicesPage() {
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

    document.title = 'Dechub-Bridge Services | Managed Project Delivery';

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${DEEL_SERVICES_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    DEEL_SERVICES_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    DEEL_SERVICES_INLINE_STYLES.forEach((cssText, index) => {
      const style = document.createElement('style');
      style.setAttribute(STYLE_DATA_ATTR, String(index));
      style.textContent = cssText;
      document.head.appendChild(style);
      cleanupNodes.push(style);
    });

    const layoutStyle = document.createElement('style');
    layoutStyle.setAttribute(STYLE_DATA_ATTR, 'layout-fixes');
    layoutStyle.textContent = SERVICES_LAYOUT_FIXES;
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
      const cleanup = applySolutionPageContent(root, 'services');
      const servicesImage = Array.from(root.querySelectorAll<HTMLImageElement>('img')).find((image) =>
        image.getAttribute('src')?.includes('/solutions/services/assets/images/services_'),
      );
      if (servicesImage) {
        servicesImage.src = '/dechub-assets/services-project-delivery.png';
        servicesImage.alt = 'Project delivery workspace with a distributed team';
        servicesImage.removeAttribute('srcset');
        servicesImage.closest('picture')?.querySelectorAll('source').forEach((source) => source.remove());
      } else {
        console.error('Unable to find the services page hero image to replace.');
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
    mount.className = 'services-landing-logo-strip-mount';
    generatedLogoStrip.classList.add('services-generated-logo-strip');
    generatedLogoStrip.parentElement.insertBefore(mount, generatedLogoStrip);
    setLandingLogoStripTarget(mount);

    return () => {
      generatedLogoStrip.classList.remove('services-generated-logo-strip');
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
    mount.className = 'services-landing-key-figures-mount';
    generatedKeyFigures.classList.add('services-generated-key-figures');
    generatedKeyFigures.parentElement.insertBefore(mount, generatedKeyFigures);
    setLandingKeyFiguresTarget(mount);

    return () => {
      generatedKeyFigures.classList.remove('services-generated-key-figures');
      mount.remove();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const heading = Array.from(root?.querySelectorAll('h2') ?? []).find(
      (node) => node.textContent?.trim() === 'Stay in control as you scale globally',
    );
    const section = heading?.closest<HTMLElement>('.bg-surface-dark');
    const frame = section?.parentElement;

    if (!section || !frame) {
      return undefined;
    }

    section.classList.add('deel-services-audience-section');
    frame.classList.add('deel-services-audience-frame');

    return () => {
      section.classList.remove('deel-services-audience-section');
      frame.classList.remove('deel-services-audience-frame');
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
    const cleanupServicesTabs = wireServicesTabs(root);
    const cleanupAccordions = wireAccordions(root);
    const cleanupCheckboxes = wireCheckboxButtons(root);

    root.addEventListener('click', handleAnchorClick);

    return () => {
      root.removeEventListener('click', handleAnchorClick);
      cleanupSlider();
      cleanupTabs();
      cleanupServicesTabs();
      cleanupAccordions();
      cleanupCheckboxes();
    };
  }, []);

  return (
    <SharedLandingPageLayout>
      <div ref={rootRef} className="deel-services-page" data-page="deel-services-react">
        <DeelServicesContent />
        {landingLogoStripTarget ? createPortal(<Section02 />, landingLogoStripTarget) : null}
        {landingKeyFiguresTarget ? createPortal(<Section07 />, landingKeyFiguresTarget) : null}
      </div>
    </SharedLandingPageLayout>
  );
}
