import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  DEEL_IT_HTML_CLASSES,
  DEEL_IT_INLINE_STYLES,
  DEEL_IT_STYLESHEET_HREFS,
  DeelItContent,
} from './deelIt/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';
import {
  updateFastrackCaseStudy,
  updateMiaCaseStudy,
  updateTanishqCaseStudy,
  updateTitanCaseStudy,
} from '../components/common/tanishqCaseStudy';
import Section02 from '../landing_deel/components/Section02.jsx';
import Section07 from '../landing_deel/components/Section07.jsx';

const STYLE_DATA_ATTR = 'data-deel-it-style';
const LINK_DATA_ATTR = 'data-deel-it-stylesheet';
const IT_LAYOUT_FIXES = `
  html:has(.deel-it-page),
  body:has(.deel-it-page) {
    max-width: 100%;
    overflow-x: hidden;
  }

  .deel-it-page,
  .deel-it-page [data-ab-page="true"] > .w-full {
    width: 100%;
    max-width: 100vw;
    overflow-x: clip;
  }

  .deel-it-page section { max-width: 100%; }

  .deel-it-page .it-generated-logo-strip,
  .deel-it-page .it-generated-key-figures,
  .deel-it-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div + div,
  .deel-it-page .mui-16f0pz5 .mui-1si5xjn {
    display: none !important;
  }

  .deel-it-page .it-landing-logo-strip-mount,
  .deel-it-page .deel-logo-strip,
  .deel-it-page .deel-logo-strip__viewport {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  .deel-it-page .deel-logo-strip__track { min-width: max-content; }

  .deel-it-page [data-ab-page="true"] > .w-full > section:first-child {
    width: 100%;
    overflow: hidden;
    padding: 12px !important;
  }

  .deel-it-page [data-ab-page="true"] > .w-full > section:first-child > div {
    width: 100% !important;
    max-width: 1704px !important;
    min-width: 0;
    margin-inline: auto !important;
  }

  .deel-it-page [data-ab-page="true"] > .w-full > section:first-child > div > div { min-width: 0; overflow: hidden; }
  .deel-it-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] { display: flex !important; flex-direction: column !important; gap: 12px !important; }
  .deel-it-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div { display: flex !important; gap: 12px !important; }
  .deel-it-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div { margin-top: 24px !important; }
  .deel-it-page [role="checkbox"][aria-checked="true"] { background: rgba(149, 113, 255, 0.24) !important; border-color: rgba(202, 182, 255, 0.88) !important; }
  .deel-it-page .it-hero-option-check { position: relative; flex: 0 0 auto; }
  .deel-it-page [role="checkbox"][aria-checked="true"] > .it-hero-option-check::after {
    content: ''; position: absolute; width: 7px; height: 4px; border-left: 2px solid #fff;
    border-bottom: 2px solid #fff; transform: rotate(-45deg); top: 4px; left: 3px;
  }

  .deel-it-page .swiper-slider-comparison-slider {
    overflow-x: auto !important;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  .deel-it-page .swiper-slider-comparison-slider::-webkit-scrollbar { display: none; }
  .deel-it-page .swiper-slider-comparison-slider .swiper-wrapper { display: flex !important; width: max-content !important; }
  .deel-it-page .swiper-slider-comparison-slider .swiper-slide { flex: 0 0 min(31vw, 560px); scroll-snap-align: start; }

  .deel-it-audience-frame { width: 100%; padding: 12px !important; }
  .deel-it-audience-section { width: 100%; margin: 0 !important; padding: 64px clamp(24px, 6vw, 112px) !important; }
  .deel-it-audience-section > div:first-child { width: 100% !important; max-width: 1312px !important; margin-inline: auto !important; }
  .deel-it-audience-section h2 { width: 100%; max-width: 667px; margin-inline: auto; text-align: center !important; }
  .deel-it-audience-section .MuiTabs-scroller { overflow-x: auto !important; scrollbar-width: none; }
  .deel-it-audience-section .MuiTabs-scroller::-webkit-scrollbar { display: none; }
  .deel-it-audience-section [role="tablist"] { width: max-content !important; min-width: max-content; margin-inline: auto !important; }
  .deel-it-audience-section .MuiTabs-root + div > div { display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 48px !important; }
  .deel-it-audience-section .MuiTabs-root + div > div > div { width: auto !important; min-width: 0 !important; flex: initial !important; }
  .deel-it-audience-section .MuiTabs-root + div > div > div:first-child { padding: 64px !important; }

  .deel-it-page section[id="14"] {
    margin-bottom: 0 !important;
    padding: clamp(40px, 4.8vw, 92px) clamp(24px, 3.125vw, 60px) clamp(48px, 5vw, 96px) !important;
  }
  .deel-it-page section[id="14"] > div:first-child {
    width: 100% !important;
    max-width: 1776px !important;
    min-height: 600px !important;
    margin-inline: auto !important;
    border-radius: 30px !important;
  }
  .deel-it-page section[id="14"] > div:first-child > div:first-child {
    height: 100% !important;
    padding-inline: clamp(32px, 5vw, 96px) !important;
    align-items: center !important;
  }
  .deel-it-page section[id="14"] > div:first-child > div:first-child > div:first-child { gap: 32px !important; justify-content: center !important; }
  .deel-it-page section[id="14"] h2 { margin: 0 !important; }
  .deel-it-page section[id="14"] + .MuiBox-root { margin-top: 0 !important; }

  @media (min-width: 1050px) {
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child > div { display: flex !important; flex-direction: row !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { width: 50% !important; flex: 0 1 50% !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child { display: flex !important; padding: 96px 64px !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child > div:first-child {
      width: 100% !important;
      max-width: 450px !important;
      margin: auto !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
    }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child h1,
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child h1 + div,
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child h1 + div > p { text-align: center !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child h1 { margin-bottom: 48px !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child h1 + div { margin-top: 24px !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] { min-height: 80px !important; padding-top: 20px !important; padding-bottom: 20px !important; }
  }

  @media (max-width: 1049px) {
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child > div { flex-direction: column !important; min-height: auto !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { width: 100% !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child { padding: 48px 24px !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { display: none !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child h1 { font-size: 38px !important; line-height: 1.05 !important; overflow-wrap: anywhere; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] { width: 100% !important; gap: 12px !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div { min-width: 0; gap: 12px !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] { min-width: 0 !important; min-height: 76px !important; padding: 12px !important; overflow-wrap: anywhere; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div { width: 100% !important; margin-top: 24px !important; }
    .deel-it-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div button { width: 100% !important; min-height: 52px; }
    .deel-it-page .swiper-slider-comparison-slider .swiper-slide { flex-basis: min(82vw, 420px); }
    .deel-it-audience-frame { padding: 0 !important; }
    .deel-it-audience-section { padding: 48px 20px !important; border-radius: 0 !important; }
    .deel-it-audience-section [role="tablist"] { margin-inline: 0 !important; }
    .deel-it-audience-section .MuiTabs-root + div > div { grid-template-columns: minmax(0, 1fr); gap: 20px !important; }
    .deel-it-audience-section .MuiTabs-root + div > div > div:first-child { padding: 24px !important; }
    .deel-it-page section[id="14"] { padding: 32px 16px 48px !important; }
    .deel-it-page section[id="14"] > div:first-child { min-height: 620px !important; border-radius: 20px !important; }
    .deel-it-page section[id="14"] > div:first-child > div:first-child { padding: 48px 24px 24px !important; }
    .deel-it-page section[id="14"] > div:first-child > div:first-child > div:first-child { align-items: center !important; text-align: center !important; }
    .deel-it-page section[id="14"] h2,
    .deel-it-page section[id="14"] h2 + div { text-align: center !important; justify-content: center !important; }
  }

  @media (max-width: 700px) {
    .deel-it-page .mui-3lz68q {
      grid-template-columns: minmax(0, 1fr) !important;
      gap: 28px !important;
    }

    .deel-it-page .mui-3lz68q > .mui-pjjft1 {
      grid-column: auto !important;
      padding-right: 0 !important;
    }
  }
`;
const IT_TEAM_TAB_LABELS = ['IT Leaders', 'HR & People Teams', 'Global Workforces'] as const;

const IT_TEAM_TABS: Record<
  (typeof IT_TEAM_TAB_LABELS)[number],
  { title: string; description: string; ctaLabel: string; ctaLink: string; imageSrc: string }
> = {
  'IT Leaders': {
    title: 'Run IT from one global system',
    description:
      'Manage devices, access, security, and support from a single platform. Standardize policies, automate workflows, and maintain full visibility across regions without adding tools or headcount.',
    ctaLabel: 'Explore IT workflows',
    ctaLink: '/solutions/it/',
    imageSrc: '/solutions/it/assets/images/it_leaders_2x_14a63eb9f2-872ee3f1ba.webp',
  },
  'HR & People Teams': {
    title: 'Onboard employees without IT bottlenecks',
    description:
      'Ensure every new hire gets the right device and app access on or before day one. HR events automatically trigger IT actions for onboarding, role changes, and offboarding without tickets or manual coordination.',
    ctaLabel: 'Explore onboarding support',
    ctaLink: '/solutions/it/',
    imageSrc: '/solutions/it/assets/images/hr_people_teams_2x_51de3ed95a-c45ff39bb5.webp',
  },
  'Global Workforces': {
    title: 'Deliver consistent IT where you hire',
    description:
      'Ship, manage, support, and recover devices globally with the same standards for security, access, and support in every country. Employees get a reliable experience, regardless of location or time zone.',
    ctaLabel: 'Explore global IT support',
    ctaLink: '/solutions/it/',
    imageSrc: '/solutions/it/assets/images/global_workforces_2x_921fc6cccd-9d80b9767d.webp',
  },
};

const DECHUB_BRIDGE_IT_COPY: Record<string, string> = {
  'Run automated global IT operations from just one platform': 'Manage IT operations from one connected platform',
  'What would you like to do with Deel IT?': 'What can Dechub-Bridge IT help you manage?',
  'Built for every team that runs global IT': 'Built for teams managing IT operations',
  'WHO IT’S FOR': 'WHO DECHUB-BRIDGE IT IS FOR',
  'See what customers are saying': 'Built for teams that need clearer IT operations',
  'How Turing expedites payments for 6,000+ global workers with Deel':
    'How a growing team keeps IT operations organized',
};

const DECHUB_BRIDGE_IT_FAQS = [
  ['What does Dechub-Bridge IT help manage?', 'Dechub-Bridge IT helps teams organize equipment, access, support requests, and IT workflows in one place.'],
  ['Can HR and IT work from the same workflow?', 'Yes. Teams can coordinate onboarding, employee changes, device needs, and access requirements without disconnected processes.'],
  ['Does Dechub-Bridge IT support distributed teams?', 'Yes. It is designed to keep IT operations organized for teams working across locations.'],
  ['Can we standardize IT processes?', 'Yes. Use clear workflows and consistent information to support repeatable IT processes as your team grows.'],
];

function applyDechubBridgeItContent(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('h1, h2, h3, h5, p, button, [role="tab"]').forEach((element) => {
    const replacement = DECHUB_BRIDGE_IT_COPY[element.textContent?.trim() ?? ''];
    if (replacement) element.textContent = replacement;
  });

  const onboardingExitsHeading = Array.from(root.querySelectorAll<HTMLHeadingElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'Automate onboarding and exits',
  );
  let onboardingExitsCard = onboardingExitsHeading?.parentElement;
  while (onboardingExitsCard && !onboardingExitsCard.querySelector('img')) {
    onboardingExitsCard = onboardingExitsCard.parentElement;
  }
  const onboardingExitsImage = onboardingExitsCard?.querySelector<HTMLImageElement>('img');
  if (onboardingExitsImage) {
    onboardingExitsImage.removeAttribute('srcset');
    onboardingExitsImage.removeAttribute('sizes');
    onboardingExitsImage.src = '/solutions/it/assets/images/it-onboarding-exits.png';
  }

  const lifecycleCardHeading = Array.from(root.querySelectorAll<HTMLHeadingElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'Automated IT as your team scales',
  );
  let lifecycleCard = lifecycleCardHeading?.parentElement;
  while (lifecycleCard && !lifecycleCard.querySelector('img')) {
    lifecycleCard = lifecycleCard.parentElement;
  }
  const lifecycleCardImage = lifecycleCard?.querySelector<HTMLImageElement>('img');
  if (lifecycleCardImage) {
    lifecycleCardImage.removeAttribute('srcset');
    lifecycleCardImage.removeAttribute('sizes');
    lifecycleCardImage.src = '/solutions/it/assets/images/automated-it-team-scales.png';
  }

  const heroChoiceLabels: Record<string, string> = {
    'Order equipment globally': 'Manage global equipment',
    'Manage IT budgets': 'Track IT spending',
    'Track devices worldwide': 'Track company devices',
    'Support employee choice': 'Support employee needs',
    'Integrate with onboarding': 'Connect IT and onboarding',
  };
  root.querySelectorAll<HTMLButtonElement>('[role="checkbox"]').forEach((button) => {
    const replacement = heroChoiceLabels[button.getAttribute('aria-label') ?? ''];
    if (!replacement) return;

    button.setAttribute('aria-label', replacement);
    const labelNode = Array.from(button.querySelectorAll('span')).find((span) => span.textContent?.trim());
    if (labelNode) labelNode.textContent = replacement;
  });

  root.querySelectorAll<HTMLElement>('.MuiAccordion-root').forEach((accordion, index) => {
    const content = DECHUB_BRIDGE_IT_FAQS[index];
    if (!content) return;

    const question = accordion.querySelector<HTMLElement>('h3');
    const answer = accordion.querySelector<HTMLElement>('.MuiAccordionDetails-root');
    if (question) question.textContent = content[0];
    if (answer) answer.textContent = content[1];
  });

  root.querySelectorAll<HTMLElement>('a, button').forEach((element) => {
    if (element.textContent?.trim() === 'Read more') {
      element.closest('a, button')?.remove();
    }
  });

  const story = Array.from(root.querySelectorAll<HTMLElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'How a growing team keeps IT operations organized',
  );
  const storyLogo = story?.closest<HTMLElement>('.MuiCardContent-root')?.querySelector<HTMLImageElement>('img');
  if (storyLogo) {
    storyLogo.src = '/dechub-assets/trusted-logos/tanishq_logo.png';
    storyLogo.removeAttribute('srcset');
    storyLogo.alt = 'Tanishq';
    storyLogo.style.filter = 'brightness(0)';
  }
  updateTanishqCaseStudy(root, 'How a growing team keeps IT operations organized', 'it');
  updateTitanCaseStudy(root, 'it');
  updateMiaCaseStudy(root, 'it');
  updateFastrackCaseStudy(root, 'it');

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

function wireItHeroChoices(root: HTMLElement) {
  const hero = Array.from(root.querySelectorAll<HTMLElement>('section')).find(
    (section) => Boolean(section.querySelector('h1') && section.querySelector('[role="checkbox"]')),
  );
  if (!hero) return () => undefined;

  const choices = Array.from(hero.querySelectorAll<HTMLButtonElement>('[role="checkbox"]'));
  const demoButton = Array.from(hero.querySelectorAll<HTMLButtonElement>('button')).find(
    (button) => button.textContent?.trim() === 'Book a demo',
  );
  const selectedChoices = new Set(
    choices.filter((button) => button.getAttribute('aria-checked') === 'true').map(
      (button) => button.getAttribute('aria-label') ?? '',
    ),
  );

  const syncRequestedServices = () => {
    demoButton?.setAttribute('data-demo-trigger', 'true');
    demoButton?.setAttribute('data-requested-services', JSON.stringify(Array.from(selectedChoices).filter(Boolean)));
  };
  const resetChoices = () => {
    selectedChoices.clear();
    choices.forEach((button) => button.setAttribute('aria-checked', 'false'));
    syncRequestedServices();
  };
  const listeners = choices.map((button) => {
    let indicator = button.querySelector<HTMLElement>('span[aria-hidden="true"]');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.setAttribute('aria-hidden', 'true');
      button.prepend(indicator);
    }
    indicator.classList.add('it-hero-option-check');
    const label = button.getAttribute('aria-label') ?? button.textContent?.trim() ?? '';
    const handleClick = () => {
      const selected = !selectedChoices.has(label);
      button.setAttribute('aria-checked', String(selected));
      if (selected) selectedChoices.add(label);
      else selectedChoices.delete(label);
      syncRequestedServices();
    };
    button.addEventListener('click', handleClick);
    return () => button.removeEventListener('click', handleClick);
  });

  syncRequestedServices();
  window.addEventListener('dechub:talent-request-submitted', resetChoices);
  return () => {
    listeners.forEach((removeListener) => removeListener());
    window.removeEventListener('dechub:talent-request-submitted', resetChoices);
  };
}

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function wireSlider(root: HTMLElement, navId: string, trackId: string) {
  const nav = root.querySelector<HTMLElement>(`#${navId}`);
  const track = root.querySelector<HTMLElement>(`#${trackId}`);
  const wrapper = track?.querySelector<HTMLElement>('.swiper-wrapper');
  const previousButton = nav?.querySelector<HTMLButtonElement>('.swiper-button-prev');
  const nextButton = nav?.querySelector<HTMLButtonElement>('.swiper-button-next');

  if (!track || !wrapper || !previousButton || !nextButton) {
    return () => undefined;
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

  return () => {
    previousButton.removeEventListener('click', handlePrevious);
    nextButton.removeEventListener('click', handleNext);
  };
}

function wireTabs(root: HTMLElement) {
  const tabLists = Array.from(root.querySelectorAll<HTMLElement>('[role="tablist"]'));

  const cleanup = tabLists.map((tabList, listIndex) => {
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
        const generatedId = tab.id || `deel-it-tab-${listIndex}-${tabIndex}`;
        const generatedPanelId = `deel-it-tabpanel-${listIndex}-${tabIndex}`;

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

        const generatedId = linkedTab.id || `deel-it-tab-${listIndex}-${panelIndex}`;
        const generatedPanelId = `deel-it-tabpanel-${listIndex}-${panelIndex}`;

        linkedTab.id = generatedId;
        linkedTab.setAttribute('aria-controls', generatedPanelId);
        panel.id = generatedPanelId;
        panel.setAttribute('aria-labelledby', generatedId);
      });
    };

    const disposers = tabs.map((tab, tabIndex) => {
      tab.id ||= `deel-it-tab-${listIndex}-${tabIndex}`;

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
    cleanup.forEach((dispose) => dispose());
  };
}

function wireItAudienceTabs(root: HTMLElement) {
  const tabList = Array.from(root.querySelectorAll<HTMLElement>('[role="tablist"]')).find((list) => {
    const labels = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).map((tab) =>
      tab.textContent?.trim(),
    );

    return IT_TEAM_TAB_LABELS.every((label) => labels.includes(label));
  });

  if (!tabList) {
    return () => undefined;
  }

  const tabs = Array.from(tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const sectionContent = tabList.closest('.MuiTabs-root')?.nextElementSibling as HTMLElement | null;
  const titleNode = sectionContent?.querySelector<HTMLElement>('h5');
  const descriptionNode = sectionContent?.querySelector<HTMLElement>('p');
  const ctaAnchor = sectionContent?.querySelector<HTMLAnchorElement>('a[href]');
  const ctaButton =
    ctaAnchor?.querySelector<HTMLButtonElement>('button') ??
    Array.from(sectionContent?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(
      (button) => button.textContent?.trim() === 'Book a demo',
    );
  const imageNode = sectionContent?.querySelector<HTMLImageElement>('img');
  const indicator =
    tabList.querySelector<HTMLElement>('.MuiTabs-indicator') ?? document.createElement('span');

  if (!sectionContent || !titleNode || !descriptionNode || !imageNode || tabs.length === 0) {
    return () => undefined;
  }

  indicator.className ||= 'MuiTabs-indicator mui-ttwr4n';

  const activateTab = (tab: HTMLButtonElement) => {
    const label = tab.textContent?.trim() as keyof typeof IT_TEAM_TABS | undefined;
    if (!label || !(label in IT_TEAM_TABS)) {
      return;
    }

    const nextContent = IT_TEAM_TABS[label];

    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', selected ? 'true' : 'false');
      candidate.setAttribute('tabindex', selected ? '0' : '-1');
      candidate.classList.toggle('Mui-selected', selected);
    });

    titleNode.textContent = nextContent.title;
    descriptionNode.textContent = nextContent.description;
    if (ctaAnchor && ctaButton) {
      ctaAnchor.href = nextContent.ctaLink;
      ctaAnchor.setAttribute('data-demo-trigger', 'true');
      ctaButton.textContent = nextContent.ctaLabel;
    } else if (ctaButton) {
      ctaButton.setAttribute('data-demo-trigger', 'true');
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

  const cleanup = accordions.map((accordion, index) => {
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
      symbol: '+' | '-',
    ) => {
      let wrapper = accordion.querySelector<HTMLElement>(`.${className}`);
      if (!wrapper) {
        wrapper = document.createElement('span');
        wrapper.className = className;
        summary.appendChild(wrapper);
      }

      // The exported SVG wrappers are reversed, so use direct symbols for reliable state.
      wrapper.replaceChildren(symbol);
      wrapper.setAttribute('aria-hidden', 'true');
      wrapper.style.display = 'inline-flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';
      wrapper.style.width = '48px';
      wrapper.style.height = '48px';
      wrapper.style.minWidth = '48px';
      wrapper.style.borderRadius = '999px';
      wrapper.style.backgroundColor = '#1B1B1B';
      wrapper.style.color = '#FFFFFF';
      wrapper.style.fontSize = symbol === '+' ? '32px' : '28px';
      wrapper.style.fontWeight = '500';
      wrapper.style.lineHeight = '1';
      wrapper.style.flexShrink = '0';
      wrapper.style.marginLeft = 'auto';

      return wrapper;
    };

    const expandIcon = ensureIconWrapper('expandIconWrapper', '-');
    const collapseIcon = ensureIconWrapper('collapseIconWrapper', '+');

    const summaryId = `deel-it-accordion-header-${index}`;
    const regionId = `deel-it-accordion-panel-${index}`;

    summary.id = summaryId;
    summary.setAttribute('aria-controls', regionId);
    summary.setAttribute('role', 'button');
    summary.tabIndex = 0;

    region.id = regionId;
    region.setAttribute('aria-labelledby', summaryId);

    const setExpanded = (expanded: boolean) => {
      accordion.classList.toggle('Mui-expanded', expanded);
      summary.classList.toggle('Mui-expanded', expanded);
      accordion.classList.toggle('Mui-expanded', expanded);
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

    const toggleExpanded = () => {
      setExpanded(summary.getAttribute('aria-expanded') !== 'true');
    };

    const handleClick = () => toggleExpanded();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleExpanded();
      }
    };

    summary.addEventListener('click', handleClick);
    summary.addEventListener('keydown', handleKeyDown);

    setExpanded(summary.getAttribute('aria-expanded') === 'true');

    return () => {
      summary.removeEventListener('click', handleClick);
      summary.removeEventListener('keydown', handleKeyDown);
    };
  });

  return () => {
    cleanup.forEach((dispose) => dispose());
  };
}

export default function DeelItPage() {
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

    document.title = 'Dechub-Bridge IT | IT Operations Platform';

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${DEEL_IT_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    DEEL_IT_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    DEEL_IT_INLINE_STYLES.forEach((cssText, index) => {
      const style = document.createElement('style');
      style.setAttribute(STYLE_DATA_ATTR, String(index));
      style.textContent = cssText;
      document.head.appendChild(style);
      cleanupNodes.push(style);
    });

    const layoutStyle = document.createElement('style');
    layoutStyle.setAttribute(STYLE_DATA_ATTR, 'layout-fixes');
    layoutStyle.textContent = IT_LAYOUT_FIXES;
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
    mount.className = 'it-landing-logo-strip-mount';
    generatedLogoStrip.classList.add('it-generated-logo-strip');
    generatedLogoStrip.parentElement.insertBefore(mount, generatedLogoStrip);
    setLandingLogoStripTarget(mount);

    return () => {
      generatedLogoStrip.classList.remove('it-generated-logo-strip');
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
    mount.className = 'it-landing-key-figures-mount';
    generatedKeyFigures.classList.add('it-generated-key-figures');
    generatedKeyFigures.parentElement.insertBefore(mount, generatedKeyFigures);
    setLandingKeyFiguresTarget(mount);

    return () => {
      generatedKeyFigures.classList.remove('it-generated-key-figures');
      mount.remove();
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const tabList = Array.from(root?.querySelectorAll<HTMLElement>('[role="tablist"]') ?? []).find((list) => {
      const labels = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).map((tab) =>
        tab.textContent?.trim(),
      );
      return IT_TEAM_TAB_LABELS.every((label) => labels.includes(label));
    });
    const section = tabList?.closest<HTMLElement>('.bg-surface-dark');
    const frame = section?.parentElement as HTMLElement | null;
    if (!section || !frame) return undefined;

    frame.classList.add('deel-it-audience-frame');
    section.classList.add('deel-it-audience-section');

    const content = section.firstElementChild as HTMLElement | null;
    const headingContainer = content?.firstElementChild as HTMLElement | null;
    const panel = section.querySelector<HTMLElement>('.MuiTabs-root + div > div');
    const elements = [frame, section, content, headingContainer, panel].filter(
      (element): element is HTMLElement => element instanceof HTMLElement,
    );
    const originalStyles = new Map(elements.map((element) => [element, element.getAttribute('style')]));

    const applyDesktopLayout = () => {
      if (window.innerWidth < 1050 || !content || !headingContainer || !panel) {
        elements.forEach((element) => {
          const originalStyle = originalStyles.get(element);
          if (originalStyle == null) element.removeAttribute('style');
          else element.setAttribute('style', originalStyle);
        });
        return;
      }

      frame.style.setProperty('width', '100%', 'important');
      frame.style.setProperty('padding', '12px', 'important');
      section.style.setProperty('width', '100%', 'important');
      section.style.setProperty('max-width', 'none', 'important');
      section.style.setProperty('margin-inline', '0', 'important');
      section.style.setProperty('padding', '64px clamp(24px, 6vw, 112px)', 'important');
      content.style.setProperty('width', '100%', 'important');
      content.style.setProperty('max-width', '1312px', 'important');
      content.style.setProperty('margin-inline', 'auto', 'important');
      headingContainer.style.setProperty('width', '100%', 'important');
      headingContainer.style.setProperty('max-width', '667px', 'important');
      headingContainer.style.setProperty('margin-inline', 'auto', 'important');
      headingContainer.style.setProperty('text-align', 'center', 'important');
      panel.style.setProperty('display', 'grid', 'important');
      panel.style.setProperty('grid-template-columns', 'minmax(0, 1fr) minmax(0, 1fr)', 'important');
      panel.style.setProperty('gap', '48px', 'important');
    };

    applyDesktopLayout();
    window.addEventListener('resize', applyDesktopLayout);
    return () => {
      window.removeEventListener('resize', applyDesktopLayout);
      elements.forEach((element) => {
        const originalStyle = originalStyles.get(element);
        if (originalStyle == null) element.removeAttribute('style');
        else element.setAttribute('style', originalStyle);
      });
      section.classList.remove('deel-it-audience-section');
      frame.classList.remove('deel-it-audience-frame');
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    applyDechubBridgeItContent(root);

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

    const cleanupTestimonialsSlider = wireSlider(root, 'nav-testimonials-slider', 'testimonials-slider');
    const cleanupExploreMoreSlider = wireSlider(root, 'nav-explore-more', 'explore-more');
    const cleanupComparisonSlider = wireSlider(root, 'nav-comparison-slider', 'comparison-slider');
    const cleanupG2ReviewsSlider = wireSlider(root, 'nav-g2-reviews-681', 'g2-reviews-681');
    const cleanupItHeroChoices = wireItHeroChoices(root);
    const cleanupTabs = wireTabs(root);
    const cleanupItAudienceTabs = wireItAudienceTabs(root);
    const cleanupAccordions = wireAccordions(root);

    root.addEventListener('click', handleAnchorClick);

    return () => {
      root.removeEventListener('click', handleAnchorClick);
      cleanupTestimonialsSlider();
      cleanupExploreMoreSlider();
      cleanupComparisonSlider();
      cleanupG2ReviewsSlider();
      cleanupItHeroChoices();
      cleanupTabs();
      cleanupItAudienceTabs();
      cleanupAccordions();
    };
  }, []);

  return (
    <SharedLandingPageLayout>
      <div ref={rootRef} className="deel-it-page" data-page="deel-it-react">
        <DeelItContent />
        {landingLogoStripTarget ? createPortal(<Section02 />, landingLogoStripTarget) : null}
        {landingKeyFiguresTarget ? createPortal(<Section07 />, landingKeyFiguresTarget) : null}
      </div>
    </SharedLandingPageLayout>
  );
}
