import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  DEEL_BENEFITS_HTML_CLASSES,
  DEEL_BENEFITS_INLINE_STYLES,
  DEEL_BENEFITS_STYLESHEET_HREFS,
  DeelBenefitsContent,
} from './deelBenefits/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';
import {
  updateFastrackCaseStudy,
  updateMiaCaseStudy,
  updateTanishqCaseStudy,
  updateTitanCaseStudy,
} from '../components/common/tanishqCaseStudy';
import Section02 from '../landing_deel/components/Section02.jsx';
import Section07 from '../landing_deel/components/Section07.jsx';

const STYLE_DATA_ATTR = 'data-deel-benefits-style';
const LINK_DATA_ATTR = 'data-deel-benefits-stylesheet';
const BENEFITS_LAYOUT_FIXES = `
  html:has(.deel-benefits-page), body:has(.deel-benefits-page) { max-width: 100%; overflow-x: hidden; }
  .deel-benefits-page, .deel-benefits-page [data-ab-page="true"] > .w-full { width: 100%; max-width: 100vw; overflow-x: clip; }
  .deel-benefits-page section { max-width: 100%; }

  .deel-benefits-page .benefits-generated-logo-strip,
  .deel-benefits-page .benefits-generated-key-figures,
  .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div + div,
  .deel-benefits-page .mui-16f0pz5 .mui-1si5xjn { display: none !important; }

  .deel-benefits-page .benefits-landing-logo-strip-mount,
  .deel-benefits-page .deel-logo-strip,
  .deel-benefits-page .deel-logo-strip__viewport { width: 100%; max-width: 100%; overflow: hidden; }
  .deel-benefits-page .deel-logo-strip__track { min-width: max-content; }

  .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child { width: 100%; overflow: hidden; padding: 12px !important; }
  .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child > div { width: 100% !important; max-width: 1704px !important; min-width: 0; margin-inline: auto !important; }
  .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child > div > div { min-width: 0; overflow: hidden; }
  .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] { display: flex !important; flex-direction: column !important; gap: 12px !important; }
  .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div { display: flex !important; gap: 12px !important; }
  .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div { margin-top: 24px !important; }

  .deel-benefits-page .swiper-slider-comparison-slider { overflow-x: auto !important; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .deel-benefits-page .swiper-slider-comparison-slider::-webkit-scrollbar { display: none; }
  .deel-benefits-page .swiper-slider-comparison-slider .swiper-wrapper { display: flex !important; width: max-content !important; }
  .deel-benefits-page .swiper-slider-comparison-slider .swiper-slide { flex: 0 0 min(31vw, 560px); scroll-snap-align: start; }

  .deel-benefits-page section[id="9"] { margin-bottom: 0 !important; padding: clamp(40px, 4.8vw, 92px) clamp(24px, 3.125vw, 60px) clamp(48px, 5vw, 96px) !important; }
  .deel-benefits-page section[id="9"] > div:first-child { width: 100% !important; max-width: 1776px !important; min-height: 600px !important; margin-inline: auto !important; border-radius: 30px !important; }
  .deel-benefits-page section[id="9"] > div:first-child > div:first-child { height: 100% !important; padding-inline: clamp(32px, 5vw, 96px) !important; align-items: center !important; }
  .deel-benefits-page section[id="9"] > div:first-child > div:first-child > div:first-child { gap: 32px !important; justify-content: center !important; }
  .deel-benefits-page section[id="9"] h2 { margin: 0 !important; }
  .deel-benefits-page section[id="9"] + .MuiBox-root { margin-top: 0 !important; }

  @media (min-width: 1050px) {
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child > div { display: flex !important; flex-direction: row !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { width: 50% !important; flex: 0 1 50% !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child { display: flex !important; padding: 96px 64px !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child > div:first-child { width: 100% !important; max-width: 450px !important; margin: auto !important; align-items: center !important; justify-content: center !important; text-align: center !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child h1,
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child h1 + div,
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child h1 + div > p { text-align: center !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child h1 { margin-bottom: 48px !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child h1 + div { margin-top: 24px !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] { min-height: 80px !important; padding-top: 20px !important; padding-bottom: 20px !important; }
  }

  @media (max-width: 1049px) {
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child > div { flex-direction: column !important; min-height: auto !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { width: 100% !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child { padding: 48px 24px !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { display: none !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child h1 { font-size: 38px !important; line-height: 1.05 !important; overflow-wrap: anywhere; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] { width: 100% !important; gap: 12px !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div { min-width: 0; gap: 12px !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] { min-width: 0 !important; min-height: 76px !important; padding: 12px !important; overflow-wrap: anywhere; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div { width: 100% !important; margin-top: 24px !important; }
    .deel-benefits-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div button { width: 100% !important; min-height: 52px; }
    .deel-benefits-page .swiper-slider-comparison-slider .swiper-slide { flex-basis: min(82vw, 420px); }
    .deel-benefits-page section[id="9"] { padding: 32px 16px 48px !important; }
    .deel-benefits-page section[id="9"] > div:first-child { min-height: 620px !important; border-radius: 20px !important; }
    .deel-benefits-page section[id="9"] > div:first-child > div:first-child { padding: 48px 24px 24px !important; }
    .deel-benefits-page section[id="9"] > div:first-child > div:first-child > div:first-child { align-items: center !important; text-align: center !important; }
    .deel-benefits-page section[id="9"] h2,
    .deel-benefits-page section[id="9"] h2 + div { text-align: center !important; justify-content: center !important; }
  }

  @media (max-width: 700px) {
    .deel-benefits-page .mui-3lz68q { grid-template-columns: minmax(0, 1fr) !important; gap: 28px !important; }
    .deel-benefits-page .mui-3lz68q > .mui-pjjft1 { grid-column: auto !important; padding-right: 0 !important; }
  }
`;

const DECHUB_BRIDGE_BENEFITS_COPY: Record<string, string> = {
  '35K+': '2K+',
  '134': '15',
  'Improve your benefits in 100+ countries': 'Make employee benefits easier to manage',
  'What would you like to do with Deel Benefits?': 'What can Dechub-Bridge Benefits help you manage?',
  'See what customers are saying': 'Built for teams that need clearer benefits operations',
  'How Turing expedites payments for 6,000+ global workers with Deel':
    'How a growing team keeps employee benefits organized',
};

const DECHUB_BRIDGE_BENEFITS_FAQS = [
  ['What can Dechub-Bridge Benefits help manage?', 'Dechub-Bridge helps teams keep benefits information, enrollment workflows, and employee records organized in one place.'],
  ['Can benefits workflows work with payroll?', 'Yes. Benefits information can be coordinated with the wider employee and payroll workflow.'],
  ['Is it suitable for growing teams?', 'Yes. Start with the benefits workflows your team needs and keep them organized as your workforce grows.'],
  ['Can employees access their benefits information?', 'Employees can use clear, organized workflows to understand and manage the information available to them.'],
];

function applyDechubBridgeBenefitsContent(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('h1, h2, h3, h5, p, button, [role="tab"]').forEach((element) => {
    const replacement = DECHUB_BRIDGE_BENEFITS_COPY[element.textContent?.trim() ?? ''];
    if (replacement) element.textContent = replacement;
  });

  const newToMulticountryHiringHeading = Array.from(root.querySelectorAll<HTMLHeadingElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'New to multi-country hiring',
  );
  let newToMulticountryHiringCard = newToMulticountryHiringHeading?.parentElement;
  while (newToMulticountryHiringCard && !newToMulticountryHiringCard.querySelector('img')) {
    newToMulticountryHiringCard = newToMulticountryHiringCard.parentElement;
  }
  const newToMulticountryHiringImage = newToMulticountryHiringCard?.querySelector<HTMLImageElement>('img');
  if (newToMulticountryHiringImage) {
    newToMulticountryHiringImage.removeAttribute('srcset');
    newToMulticountryHiringImage.removeAttribute('sizes');
    newToMulticountryHiringImage.src =
      '/solutions/benefits/assets/images/benefits-new-to-multicountry-hiring.png';
  }

  const scalingRegionsHeading = Array.from(root.querySelectorAll<HTMLHeadingElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'Scaling fast across regions',
  );
  let scalingRegionsCard = scalingRegionsHeading?.parentElement;
  while (scalingRegionsCard && !scalingRegionsCard.querySelector('img')) {
    scalingRegionsCard = scalingRegionsCard.parentElement;
  }
  const scalingRegionsImage = scalingRegionsCard?.querySelector<HTMLImageElement>('img');
  if (scalingRegionsImage) {
    scalingRegionsImage.removeAttribute('srcset');
    scalingRegionsImage.removeAttribute('sizes');
    scalingRegionsImage.src = '/solutions/benefits/assets/images/benefits-scaling-regions.png';
  }

  const establishedTeamsHeading = Array.from(root.querySelectorAll<HTMLHeadingElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'Established teams',
  );
  let establishedTeamsCard = establishedTeamsHeading?.parentElement;
  while (establishedTeamsCard && !establishedTeamsCard.querySelector('img')) {
    establishedTeamsCard = establishedTeamsCard.parentElement;
  }
  const establishedTeamsImage = establishedTeamsCard?.querySelector<HTMLImageElement>('img');
  if (establishedTeamsImage) {
    establishedTeamsImage.removeAttribute('srcset');
    establishedTeamsImage.removeAttribute('sizes');
    establishedTeamsImage.src = '/solutions/benefits/assets/images/benefits-established-teams.png';
  }

  const shopByCountryHeading = Array.from(root.querySelectorAll<HTMLHeadingElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'Shop benefits by country',
  );
  let shopByCountryCard = shopByCountryHeading?.parentElement;
  while (shopByCountryCard && !shopByCountryCard.querySelector('img')) {
    shopByCountryCard = shopByCountryCard.parentElement;
  }
  const shopByCountryImage = shopByCountryCard?.querySelector<HTMLImageElement>('img');
  if (shopByCountryImage) {
    shopByCountryImage.removeAttribute('srcset');
    shopByCountryImage.removeAttribute('sizes');
    shopByCountryImage.src = '/solutions/benefits/assets/images/benefits-shop-by-country.png';
  }

  const enrollmentHeading = Array.from(root.querySelectorAll<HTMLHeadingElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'Make enrollment easy for your employees',
  );
  let enrollmentCard = enrollmentHeading?.parentElement;
  while (enrollmentCard && !enrollmentCard.querySelector('img')) {
    enrollmentCard = enrollmentCard.parentElement;
  }
  const enrollmentImage = enrollmentCard?.querySelector<HTMLImageElement>('img');
  if (enrollmentImage) {
    enrollmentImage.removeAttribute('srcset');
    enrollmentImage.removeAttribute('sizes');
    enrollmentImage.src = '/solutions/benefits/assets/images/benefits-enrollment-easy.png';
  }

  const payrollDeductionsHeading = Array.from(root.querySelectorAll<HTMLHeadingElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'Get payroll deductions right',
  );
  let payrollDeductionsCard = payrollDeductionsHeading?.parentElement;
  while (payrollDeductionsCard && !payrollDeductionsCard.querySelector('img')) {
    payrollDeductionsCard = payrollDeductionsCard.parentElement;
  }
  const payrollDeductionsImage = payrollDeductionsCard?.querySelector<HTMLImageElement>('img');
  if (payrollDeductionsImage) {
    payrollDeductionsImage.removeAttribute('srcset');
    payrollDeductionsImage.removeAttribute('sizes');
    payrollDeductionsImage.src = '/solutions/benefits/assets/images/benefits-payroll-deductions.png';
  }

  const costsAndAdoptionHeading = Array.from(root.querySelectorAll<HTMLHeadingElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'See costs and adoption together',
  );
  let costsAndAdoptionCard = costsAndAdoptionHeading?.parentElement;
  while (costsAndAdoptionCard && !costsAndAdoptionCard.querySelector('img')) {
    costsAndAdoptionCard = costsAndAdoptionCard.parentElement;
  }
  const costsAndAdoptionImage = costsAndAdoptionCard?.querySelector<HTMLImageElement>('img');
  if (costsAndAdoptionImage) {
    costsAndAdoptionImage.removeAttribute('srcset');
    costsAndAdoptionImage.removeAttribute('sizes');
    costsAndAdoptionImage.src = '/solutions/benefits/assets/images/benefits-costs-adoption.png';
  }

  const benefitsHeroImage = root.querySelector<HTMLImageElement>(
    'img[src*="benefits_30d95e62f2"]',
  );
  if (benefitsHeroImage) {
    benefitsHeroImage.src = '/solutions/benefits/assets/images/dechub-benefits-team.png';
    benefitsHeroImage.removeAttribute('srcset');
    benefitsHeroImage.alt = 'A team discussing employee benefits using a benefits dashboard';
  }

  const heroChoiceLabels: Record<string, string> = {
    'Offer benefits in 100+ countries': 'Manage employee benefits',
    'Consolidate vendors': 'Keep benefits organized',
    'Sync to payroll': 'Connect benefits and payroll',
    'Meet local requirements': 'Manage benefits requirements',
    'Let employees self-enroll': 'Support employee enrollment',
  };
  root.querySelectorAll<HTMLButtonElement>('[role="checkbox"]').forEach((button) => {
    const replacement = heroChoiceLabels[button.getAttribute('aria-label') ?? ''];
    if (!replacement) return;
    button.setAttribute('aria-label', replacement);
    const labelNode = Array.from(button.querySelectorAll('span')).find((span) => span.textContent?.trim());
    if (labelNode) labelNode.textContent = replacement;
  });

  root.querySelectorAll<HTMLElement>('.MuiAccordion-root').forEach((accordion, index) => {
    const content = DECHUB_BRIDGE_BENEFITS_FAQS[index];
    if (!content) return;
    const question = accordion.querySelector<HTMLElement>('h3');
    const answer = accordion.querySelector<HTMLElement>('.MuiAccordionDetails-root');
    if (question) question.textContent = content[0];
    if (answer) answer.textContent = content[1];
  });

  root.querySelectorAll<HTMLElement>('a, button').forEach((element) => {
    if (element.textContent?.trim() === 'Read more') element.closest('a, button')?.remove();
  });

  const story = Array.from(root.querySelectorAll<HTMLElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'How a growing team keeps employee benefits organized',
  );
  const storyLogo = story?.closest<HTMLElement>('.MuiCardContent-root')?.querySelector<HTMLImageElement>('img');
  if (storyLogo) {
    storyLogo.src = '/dechub-assets/trusted-logos/tanishq_logo.png';
    storyLogo.removeAttribute('srcset');
    storyLogo.alt = 'Tanishq';
    storyLogo.style.filter = 'brightness(0)';
  }
  updateTanishqCaseStudy(root, 'How a growing team keeps employee benefits organized', 'benefits');
  updateTitanCaseStudy(root, 'benefits');
  updateMiaCaseStudy(root, 'benefits');
  updateFastrackCaseStudy(root, 'benefits');

  const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let textNode = textWalker.nextNode();
  while (textNode) {
    if (textNode.nodeValue) {
      textNode.nodeValue = textNode.nodeValue
        .replace(/Deel/g, 'Dechub-Bridge')
        .replace(/\bDechub\b(?!-Bridge)/g, 'Dechub-Bridge');
    }
    textNode = textWalker.nextNode();
  }
}

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
        const generatedId = tab.id || `deel-benefits-tab-${listIndex}-${tabIndex}`;
        const generatedPanelId = `deel-benefits-tabpanel-${listIndex}-${tabIndex}`;

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

        const generatedId = linkedTab.id || `deel-benefits-tab-${listIndex}-${panelIndex}`;
        const generatedPanelId = `deel-benefits-tabpanel-${listIndex}-${panelIndex}`;

        linkedTab.id = generatedId;
        linkedTab.setAttribute('aria-controls', generatedPanelId);
        panel.id = generatedPanelId;
        panel.setAttribute('aria-labelledby', generatedId);
      });
    };

    const disposers = tabs.map((tab, tabIndex) => {
      tab.id ||= `deel-benefits-tab-${listIndex}-${tabIndex}`;

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

    const summaryId = `deel-benefits-accordion-header-${index}`;
    const regionId = `deel-benefits-accordion-panel-${index}`;

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
  const hero = Array.from(root.querySelectorAll<HTMLElement>('section')).find(
    (section) => Boolean(section.querySelector('h1') && section.querySelector('[role="checkbox"]')),
  );
  if (!hero) return () => undefined;

  const checkboxes = Array.from(hero.querySelectorAll<HTMLButtonElement>('[role="checkbox"]'));
  const demoButton = Array.from(hero.querySelectorAll<HTMLButtonElement>('button')).find(
    (button) => button.textContent?.trim() === 'Book a demo',
  );
  const selectedChoices = new Set(
    checkboxes.filter((button) => button.getAttribute('aria-checked') === 'true').map(
      (button) => button.getAttribute('aria-label') ?? '',
    ),
  );

  const syncRequestedServices = () => {
    demoButton?.setAttribute('data-demo-trigger', 'true');
    demoButton?.setAttribute('data-requested-services', JSON.stringify(Array.from(selectedChoices).filter(Boolean)));
  };

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
      const label = button.getAttribute('aria-label') ?? button.textContent?.trim() ?? '';
      if (nextChecked) selectedChoices.add(label);
      else selectedChoices.delete(label);
      syncRequestedServices();
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

  const resetChoices = () => {
    selectedChoices.clear();
    checkboxes.forEach((button) => setChecked(button, false));
    syncRequestedServices();
  };

  syncRequestedServices();
  window.addEventListener('dechub:talent-request-submitted', resetChoices);
  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
    window.removeEventListener('dechub:talent-request-submitted', resetChoices);
  };
}

export default function DeelBenefitsPage() {
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

    document.title = 'Dechub-Bridge Benefits | Benefits Operations Platform';

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${DEEL_BENEFITS_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    DEEL_BENEFITS_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    DEEL_BENEFITS_INLINE_STYLES.forEach((cssText, index) => {
      const style = document.createElement('style');
      style.setAttribute(STYLE_DATA_ATTR, String(index));
      style.textContent = cssText;
      document.head.appendChild(style);
      cleanupNodes.push(style);
    });

    const layoutStyle = document.createElement('style');
    layoutStyle.setAttribute(STYLE_DATA_ATTR, 'layout-fixes');
    layoutStyle.textContent = BENEFITS_LAYOUT_FIXES;
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
    const generatedLogoStrip = root?.querySelector<HTMLElement>('section.logo-stripe-standard-wrapper');

    if (!generatedLogoStrip?.parentElement) {
      return undefined;
    }

    const mount = document.createElement('div');
    mount.className = 'benefits-landing-logo-strip-mount';
    generatedLogoStrip.classList.add('benefits-generated-logo-strip');
    generatedLogoStrip.parentElement.insertBefore(mount, generatedLogoStrip);
    setLandingLogoStripTarget(mount);

    return () => {
      generatedLogoStrip.classList.remove('benefits-generated-logo-strip');
      mount.remove();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const generatedKeyFigures = Array.from(root?.querySelectorAll<HTMLElement>('.key-figures-wrapper') ?? []).find(
      (section) => {
        const values = section.textContent ?? '';
        return values.includes('150+') && values.includes('40,000');
      },
    );

    if (!generatedKeyFigures?.parentElement) {
      return undefined;
    }

    const mount = document.createElement('div');
    mount.className = 'benefits-landing-key-figures-mount';
    generatedKeyFigures.classList.add('benefits-generated-key-figures');
    generatedKeyFigures.parentElement.insertBefore(mount, generatedKeyFigures);
    setLandingKeyFiguresTarget(mount);

    return () => {
      generatedKeyFigures.classList.remove('benefits-generated-key-figures');
      mount.remove();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    applyDechubBridgeBenefitsContent(root);

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

      if (
        anchor.getAttribute('data-demo-trigger') === 'true' ||
        anchor.textContent?.trim().toLowerCase() === 'book a demo' ||
        anchor.getAttribute('href')?.includes('book-a-demo')
      ) {
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
      <div ref={rootRef} className="deel-benefits-page" data-page="deel-benefits-react">
        <DeelBenefitsContent />
        {landingLogoStripTarget ? createPortal(<Section02 />, landingLogoStripTarget) : null}
        {landingKeyFiguresTarget ? createPortal(<Section07 />, landingKeyFiguresTarget) : null}
      </div>
    </SharedLandingPageLayout>
  );
}
