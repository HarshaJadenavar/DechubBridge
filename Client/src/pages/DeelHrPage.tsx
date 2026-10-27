import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  DEEL_HR_HTML_CLASSES,
  DEEL_HR_INLINE_STYLES,
  DEEL_HR_STYLESHEET_HREFS,
  DeelHrContent,
} from './deelHr/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';
import {
  updateFastrackCaseStudy,
  updateMiaCaseStudy,
  updateTanishqCaseStudy,
  updateTitanCaseStudy,
} from '../components/common/tanishqCaseStudy';
import CountryFlagsOverlay from '../components/common/CountryFlagsOverlay';
import Section02 from '../landing_deel/components/Section02.jsx';
import Section07 from '../landing_deel/components/Section07.jsx';

const STYLE_DATA_ATTR = 'data-deel-hr-style';
const LINK_DATA_ATTR = 'data-deel-hr-stylesheet';
const HR_LAYOUT_FIXES = `
  html:has(.deel-hr-page),
  body:has(.deel-hr-page) {
    max-width: 100%;
    overflow-x: hidden;
  }

  .deel-hr-page,
  .deel-hr-page > .w-full {
    width: 100%;
    max-width: 100vw;
    overflow-x: clip;
  }

  .deel-hr-page section {
    max-width: 100%;
  }

  .deel-hr-page > .w-full > section:first-child {
    width: 100%;
    overflow: hidden;
    padding: 12px !important;
  }

  .deel-hr-page > .w-full > section:first-child > div {
    width: 100% !important;
    max-width: 1704px !important;
    min-width: 0;
    margin-inline: auto !important;
  }

  .deel-hr-page > .w-full > section:first-child > div > div {
    min-width: 0;
    overflow: hidden;
  }

  .deel-hr-page [role="checkbox"][aria-checked="true"] {
    background: rgba(149, 113, 255, 0.24) !important;
    border-color: rgba(202, 182, 255, 0.88) !important;
  }

  .deel-hr-page .hr-hero-option-check {
    position: relative;
    flex: 0 0 auto;
  }

  .deel-hr-page [role="checkbox"][aria-checked="true"] > .hr-hero-option-check::after {
    content: '';
    position: absolute;
    width: 7px;
    height: 4px;
    border-left: 2px solid #fff;
    border-bottom: 2px solid #fff;
    transform: rotate(-45deg);
    top: 4px;
    left: 3px;
  }

  .deel-hr-page .hr-generated-logo-strip,
  .deel-hr-page .hr-generated-key-figures {
    display: none !important;
  }

  .deel-hr-page .mui-16f0pz5 .mui-1si5xjn {
    display: none !important;
  }

  .deel-hr-page .hr-landing-logo-strip-mount,
  .deel-hr-page .deel-logo-strip,
  .deel-hr-page .deel-logo-strip__viewport {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  .deel-hr-page .deel-logo-strip__track {
    min-width: max-content;
  }

  .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child {
    width: 100%;
    overflow: hidden;
    padding: 12px !important;
  }

  .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child > div {
    width: 100% !important;
    max-width: 1704px !important;
    min-width: 0;
    margin-inline: auto !important;
  }

  .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child > div > div {
    min-width: 0;
    overflow: hidden;
  }

  .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
  }

  .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div {
    display: flex !important;
    gap: 12px !important;
  }

  .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div {
    margin-top: 24px !important;
  }

  .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div + div {
    display: none !important;
  }

  .deel-hr-ecosystem-frame {
    width: 100%;
    padding: 12px !important;
  }

  .deel-hr-ecosystem-section {
    width: 100%;
    overflow: hidden;
    margin: 0 !important;
    padding: 12px !important;
  }

  .deel-hr-ecosystem-section > div:first-child {
    width: 100% !important;
    max-width: none !important;
    margin-inline: 0 !important;
    padding: 64px clamp(24px, 6vw, 112px) !important;
  }

  .deel-hr-ecosystem-section > div:first-child > div:first-child {
    width: 100% !important;
    max-width: 1312px !important;
    margin-inline: auto !important;
  }

  .deel-hr-ecosystem-section h2 {
    width: 100%;
    max-width: 667px;
    margin-inline: auto;
    text-align: center !important;
  }

  .deel-hr-ecosystem-section .MuiTabs-scroller {
    overflow-x: auto !important;
    scrollbar-width: none;
  }

  .deel-hr-ecosystem-section .MuiTabs-scroller::-webkit-scrollbar {
    display: none;
  }

  .deel-hr-ecosystem-section [role="tablist"] {
    width: max-content !important;
    min-width: max-content;
    margin-inline: auto !important;
  }

  .deel-hr-ecosystem-section .MuiTabs-root + div > div {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 48px !important;
  }

  .deel-hr-ecosystem-section .MuiTabs-root + div > div > div {
    width: auto !important;
    min-width: 0 !important;
    flex: initial !important;
  }

  .deel-hr-ecosystem-section .MuiTabs-root + div > div > div:first-child {
    padding: 64px !important;
  }

  .deel-hr-page .swiper-slider-comparison-slider {
    overflow-x: auto !important;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }

  .deel-hr-page .swiper-slider-comparison-slider::-webkit-scrollbar {
    display: none;
  }

  .deel-hr-page .swiper-slider-comparison-slider .swiper-wrapper {
    display: flex !important;
    width: max-content !important;
  }

  .deel-hr-page .swiper-slider-comparison-slider .swiper-slide {
    flex: 0 0 min(31vw, 560px);
    scroll-snap-align: start;
  }

  .deel-hr-page section[id="6"] {
    margin-bottom: 0 !important;
    padding: clamp(40px, 4.8vw, 92px) clamp(24px, 3.125vw, 60px) clamp(48px, 5vw, 96px) !important;
  }

  .deel-hr-page section[id="6"] > div:first-child {
    width: 100% !important;
    max-width: 1776px !important;
    min-height: 600px !important;
    margin-inline: auto !important;
    border-radius: 30px !important;
  }

  .deel-hr-page section[id="6"] > div:first-child > div:first-child {
    height: 100% !important;
    padding-inline: clamp(32px, 5vw, 96px) !important;
    align-items: center !important;
  }

  .deel-hr-page section[id="6"] > div:first-child > div:first-child > div:first-child {
    gap: 32px !important;
    justify-content: center !important;
  }

  .deel-hr-page section[id="6"] h2 {
    margin: 0 !important;
  }

  .deel-hr-page section[id="6"] + .MuiBox-root {
    margin-top: 0 !important;
  }

  @media (max-width: 1049px) {
    .deel-hr-page > .w-full > section:first-child > div {
      flex-direction: column !important;
      min-height: auto !important;
    }

    .deel-hr-page > .w-full > section:first-child > div > div:first-child,
    .deel-hr-page > .w-full > section:first-child > div > div:last-child {
      width: 100% !important;
    }

    .deel-hr-page > .w-full > section:first-child > div > div:first-child {
      padding: 40px 24px 48px !important;
    }

    .deel-hr-page > .w-full > section:first-child > div > div:last-child {
      display: none !important;
    }

    .deel-hr-page > .w-full > section:first-child h1 {
      font-size: 38px !important;
      line-height: 1.05 !important;
      overflow-wrap: anywhere;
    }

    .deel-hr-page > .w-full > section:first-child [role="group"] {
      gap: 12px !important;
    }

    .deel-hr-page > .w-full > section:first-child [role="group"] > div {
      gap: 12px !important;
    }

    .deel-hr-page > .w-full > section:first-child [role="checkbox"] {
      min-height: 76px !important;
      padding: 12px !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child > div {
      flex-direction: column !important;
      min-height: auto !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child {
      width: 100% !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child {
      padding: 48px 24px !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child {
      display: none !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child h1 {
      font-size: 38px !important;
      line-height: 1.05 !important;
      overflow-wrap: anywhere;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] {
      width: 100% !important;
      gap: 12px !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div {
      min-width: 0;
      gap: 12px !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] {
      min-width: 0 !important;
      min-height: 76px !important;
      padding: 12px !important;
      overflow-wrap: anywhere;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div {
      width: 100% !important;
      margin-top: 24px !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div button {
      width: 100% !important;
      min-height: 52px;
    }

    .deel-hr-page .swiper-slider-comparison-slider .swiper-slide {
      flex-basis: min(82vw, 420px);
    }

    .deel-hr-ecosystem-frame {
      padding: 0 !important;
    }

    .deel-hr-ecosystem-section > div:first-child {
      padding: 48px 20px !important;
      border-radius: 0 !important;
    }

    .deel-hr-ecosystem-section [role="tablist"] {
      margin-inline: 0 !important;
    }

    .deel-hr-ecosystem-section .MuiTabs-root + div > div {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px !important;
    }

    .deel-hr-ecosystem-section .MuiTabs-root + div > div > div:first-child {
      padding: 24px !important;
    }

    .deel-hr-page section[id="6"] {
      padding: 32px 16px 48px !important;
    }

    .deel-hr-page section[id="6"] > div:first-child {
      min-height: 620px !important;
      border-radius: 20px !important;
    }

    .deel-hr-page section[id="6"] > div:first-child > div:first-child {
      padding: 48px 24px 24px !important;
    }

    .deel-hr-page section[id="6"] > div:first-child > div:first-child > div:first-child {
      align-items: center !important;
      text-align: center !important;
    }

    .deel-hr-page section[id="6"] h2,
    .deel-hr-page section[id="6"] h2 + div {
      text-align: center !important;
      justify-content: center !important;
    }
  }

  @media (max-width: 700px) {
    .deel-hr-page .mui-3lz68q {
      grid-template-columns: minmax(0, 1fr) !important;
      gap: 28px !important;
    }

    .deel-hr-page .mui-3lz68q > .mui-pjjft1 {
      grid-column: auto !important;
      padding-right: 0 !important;
    }
  }

  @media (min-width: 1050px) {
    .deel-hr-page > .w-full > section:first-child > div {
      display: flex !important;
      flex-direction: row !important;
    }

    .deel-hr-page > .w-full > section:first-child > div > div:first-child,
    .deel-hr-page > .w-full > section:first-child > div > div:last-child {
      width: 50% !important;
      flex: 0 1 50% !important;
    }

    .deel-hr-page > .w-full > section:first-child > div > div:first-child {
      display: flex !important;
      padding: 96px 64px !important;
    }

    .deel-hr-page > .w-full > section:first-child > div > div:first-child > div:first-child {
      width: 100% !important;
      max-width: 450px !important;
      margin: auto !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
    }

    .deel-hr-page > .w-full > section:first-child h1,
    .deel-hr-page > .w-full > section:first-child h1 + div,
    .deel-hr-page > .w-full > section:first-child h1 + div > p {
      text-align: center !important;
    }

    .deel-hr-page > .w-full > section:first-child h1 {
      margin-bottom: 48px !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child > div {
      display: flex !important;
      flex-direction: row !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child {
      width: 50% !important;
      flex: 0 1 50% !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child {
      display: flex !important;
      padding: 96px 64px !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child > div:first-child {
      width: 100% !important;
      max-width: 450px !important;
      margin: auto !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child h1,
    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child h1 + div,
    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child h1 + div > p {
      text-align: center !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child h1 {
      margin-bottom: 48px !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child h1 + div {
      margin-top: 24px !important;
    }

    .deel-hr-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] {
      min-height: 80px !important;
      padding-top: 20px !important;
      padding-bottom: 20px !important;
    }
  }
`;
const HR_ECOSYSTEM_TAB_LABELS = ['In your tools', 'Talent', 'IT', 'Services'] as const;

const HR_ECOSYSTEM_TABS: Record<
  (typeof HR_ECOSYSTEM_TAB_LABELS)[number],
  { title: string; description: string; ctaLabel: string; ctaLink: string; imageSrc: string }
> = {
  'In your tools': {
    title: 'Run HR wherever your team works',
    description:
      'Handle in the web browser, Deel mobile app, or directly in Slack and Teams. Approve requests, submit time off, and stay updated without switching tools. You accomplish things faster with fewer handoffs on a platform teams actually enjoy using where they are.',
    ctaLabel: 'Explore the Slack & Teams plugin',
    ctaLink: '/solutions/plugin/',
    imageSrc: '/solutions/hr/assets/images/in_your_tools_2x_ba9bce02aa-82a8329526.webp',
  },
  Talent: {
    title: 'Find and hire talent anywhere',
    description:
      'Tap into Deel’s network of vetted global recruitment partners when you need to scale or enter new markets. Get support sourcing the right candidates, without adding new tools or vendors.',
    ctaLabel: 'See how Deel supports global hiring',
    ctaLink: '/solutions/hire/',
    imageSrc: '/solutions/hr/assets/images/EOR_bd844f9389-c5dc214975.png',
  },
  IT: {
    title: 'Get teams ready from day one',
    description:
      'Set new hires up with the tools they need from the start. Deel HR connects to IT so equipment, access, and setup happen automatically and people are productive sooner.',
    ctaLabel: 'See how HR and IT work together',
    ctaLink: '/solutions/it/',
    imageSrc: '/solutions/hr/assets/images/it_2x_cf1acd6cff-563c9977d8.webp',
  },
  Services: {
    title: 'Access HR support when you need it',
    description:
      'From everyday HR questions to complex one-off projects, Deel gives you flexible HR support through managed services and expert consulting. Your team always has the right level of help at the right time.',
    ctaLabel: 'Explore HR services',
    ctaLink: '/solutions/services/',
    imageSrc: '/solutions/hr/assets/images/services_2x_85463012f8-8223ea0977.webp',
  },
};

Object.assign(HR_ECOSYSTEM_TABS['In your tools'], {
  title: 'Keep everyday HR work connected',
  description:
    'Give your team one organized place for employee information, requests, approvals, and updates, so HR work stays clear and easy to follow.',
  ctaLabel: 'Explore HR workflows',
  ctaLink: '/solutions/hr/',
});
Object.assign(HR_ECOSYSTEM_TABS.Talent, {
  title: 'Bring hiring and HR together',
  description:
    'Keep candidate, employee, and onboarding details connected as your team grows, without creating another disconnected process.',
  ctaLabel: 'Explore hiring support',
});
Object.assign(HR_ECOSYSTEM_TABS.IT, {
  title: 'Support onboarding from day one',
  description:
    'Coordinate onboarding tasks, employee details, and access requirements so new team members can start with the information they need.',
  ctaLabel: 'Explore HR and IT',
});
Object.assign(HR_ECOSYSTEM_TABS.Services, {
  title: 'Get HR support as your team grows',
  description:
    'Use Dechub-Bridge to keep HR processes structured while your team gets the support needed for changing workforce requirements.',
});

const DECHUB_BRIDGE_HR_COPY: Record<string, string> = {
  'Run global HR from one system': 'Manage your people from one HR platform',
  'What would you like to do with Deel HR?': 'What can Dechub-Bridge HR help you manage?',
  'End to end HR management': 'HR management for growing teams',
  'Start with HRIS. Add on as you grow.': 'Start with organized people operations. Grow with confidence.',
  'Deel HR is the global HR software for companies managing distributed teams across multiple countries.':
    'Dechub-Bridge helps teams organize employee information, onboarding, approvals, and HR workflows in one place.',
  'Lay a solid foundation with HRIS': 'Keep employee information organized',
  'Set up and manage people data, workflows, policies, time off, and approvals with HRIS as your source of truth for HR and payroll.':
    'Manage employee details, documents, time off, policies, and approvals through one clear HR workflow.',
  'Plan headcount with confidence': 'Make workforce decisions with clarity',
  'Forecast roles, costs, and growth using live workforce and hiring data in Workforce Planning, instead of scattered spreadsheets.':
    'Keep workforce information current so HR and business teams can plan roles, changes, and growth with confidence.',
  'Fuel performance and growth': 'Support employee growth',
  'Reward fairly and consistently': 'Keep people decisions consistent',
  'Stay compliant from hire to exit': 'Keep HR processes organized from hire to exit',
  'The impact of one connected HR system': 'One HR process for your entire team',
  'WHY TEAMS CHOOSE DEEL HR': 'WHY TEAMS CHOOSE DECHUB-BRIDGE HR',
  'Made for HR leaders who move the business forward': 'Built for teams managing people operations',
  'Everything runs on the same data': 'One source for employee information',
  'Global first platform since day one': 'Built for distributed teams',
  'Flexible by design': 'Flexible as your team grows',
  'Tools people love, powered by AI': 'Simple tools for everyday HR work',
  'Comprehensive reporting': 'Clear workforce visibility',
  'Compliance that keeps you moving': 'Organized processes that support your team',
  'How Deel HR fits into your ecosystem': 'How Dechub-Bridge HR fits your workflow',
  'See what customers are saying': 'Built for teams that need better HR operations',
  'How Turing expedites payments for 6,000+ global workers with Deel':
    'How a growing team keeps employee operations organized',
  'How Revolut streamlined employee relocation with Deel': 'How a distributed team simplifies onboarding',
  'How Magic saves 50+ hours a month on admin using Deel': 'How HR teams reduce repetitive admin work',
  'How BCG centralized payroll across 6 nations with Deel': 'How one team centralizes workforce information',
  'How Telin cut onboarding time and expanded globally with Deel': 'How a growing team keeps onboarding on track',
  'Excellent global payroll': 'HR support for growing teams',
  'See the products that help you manage anywhere': 'See how Dechub-Bridge supports your people operations',
};

const DECHUB_BRIDGE_HR_FAQS = [
  ['Is Dechub-Bridge HR built for distributed teams?', 'Yes. Dechub-Bridge HR helps teams keep employee information, workflows, and approvals organized across locations.'],
  ['Will expanding into new markets require new HR tools?', 'No. You can keep your core HR process organized in one platform as your team grows.'],
  ['Is Dechub-Bridge HR suitable for a growing team?', 'Yes. It is designed to give growing teams a clear place to manage people operations without unnecessary complexity.'],
  ['Will managers and employees actually use it?', 'The workflows are designed to make everyday requests, approvals, and employee information easy to access.'],
  ['How long does implementation take?', 'Our team can review your current process and guide you through the right setup for your organization.'],
  ['We already have an HRIS. Do we need another one?', 'We can discuss your current setup and help determine how Dechub-Bridge can support or simplify your HR workflow.'],
  ['Do I need to use every product to use Dechub-Bridge HR?', 'No. Start with the HR capabilities your team needs and expand your workflow as requirements grow.'],
  ['Is Dechub-Bridge HR an HCM?', 'Dechub-Bridge provides a connected HR workspace for employee information, workflows, and people operations.'],
  ['Is employee information secure?', 'Dechub-Bridge is designed to keep employee information organized and accessible to the appropriate people in your organization.'],
  ['How will Dechub-Bridge support migration?', 'Our team can help you plan a practical transition from your current HR process into a more organized workflow.'],
  ['What countries does Dechub-Bridge HR support?', 'Talk to our team about your workforce locations and the HR workflow your organization needs.'],
  ['Does Dechub-Bridge HR work for remote teams?', 'Yes. It helps distributed teams coordinate employee records, onboarding, requests, and approvals in one place.'],
];

function replaceHrOnboardingImage(root: HTMLElement) {
  root
    .querySelectorAll<HTMLImageElement>('img[src*="complaintv2_b91320d0d1"]')
    .forEach((image) => {
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
      image.src = '/solutions/hr/assets/images/hr-offboarding-onboarding.png';
      image.closest('picture')?.querySelectorAll('source').forEach((source) => source.remove());
    });
}

function applyDechubBridgeHrContent(root: HTMLElement) {
  Array.from(root.querySelectorAll<HTMLAnchorElement>('a'))
    .filter((anchor) => anchor.textContent?.trim() === 'Run HR for every worker type, in every country')
    .forEach((anchor) => {
      anchor.replaceWith(document.createTextNode(anchor.textContent ?? ''));
    });

  root
    .querySelectorAll<HTMLImageElement>('img[src*="featurecards_asset_02_a715127d9b"]')
    .forEach((image) => {
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
      image.src = '/solutions/hr/assets/images/workforce-decisions-clarity.png';
    });

  root.querySelectorAll<HTMLElement>('h1, h2, h3, h5, p, button, [role="tab"]').forEach((element) => {
    const replacement = DECHUB_BRIDGE_HR_COPY[element.textContent?.trim() ?? ''];
    if (replacement) element.textContent = replacement;
  });

  root.querySelectorAll<HTMLElement>('p').forEach((paragraph) => {
    const content = paragraph.textContent?.trim() ?? '';
    if (content.startsWith('ATS uses AI to source candidates')) {
      paragraph.textContent =
        'Keep candidate details, interviews, offers, and onboarding tasks organized in one clear hiring workflow.';
    } else if (content.startsWith('Run reviews, set goals')) {
      paragraph.textContent =
        'Keep goals, feedback, and employee development conversations organized as your team grows.';
    } else if (content.startsWith('Make decisions based on role')) {
      paragraph.textContent =
        'Use consistent employee information and approval workflows to support clear people decisions.';
    } else if (content.startsWith('Lower risk with built-in policies')) {
      paragraph.textContent =
        'Keep documents, policies, offboarding steps, and HR records organized throughout the employee lifecycle.';
    }
  });

  const heroChoiceLabels: Record<string, string> = {
    'Centralize HR globally': 'Manage employee information',
    'Start with HRIS, add later': 'Build your HR workflow',
    'Automate workflows': 'Streamline requests and approvals',
    'Get workforce insights': 'View workforce information',
    'Connect hiring to payroll': 'Keep hiring and payroll connected',
  };
  root.querySelectorAll<HTMLButtonElement>('[role="checkbox"]').forEach((button) => {
    const label = button.getAttribute('aria-label') ?? '';
    const replacement = heroChoiceLabels[label];
    if (!replacement) return;

    button.setAttribute('aria-label', replacement);
    const labelNode = Array.from(button.querySelectorAll('span')).find((span) => span.textContent?.trim());
    if (labelNode) labelNode.textContent = replacement;
  });

  root.querySelectorAll<HTMLElement>('.MuiAccordion-root').forEach((accordion, index) => {
    const content = DECHUB_BRIDGE_HR_FAQS[index];
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

  const hrStory = Array.from(root.querySelectorAll<HTMLElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'How a growing team keeps employee operations organized',
  );
  const storyLogo = hrStory?.closest<HTMLElement>('.MuiCardContent-root')?.querySelector<HTMLImageElement>('img');
  if (storyLogo) {
    storyLogo.src = '/dechub-assets/trusted-logos/tanishq_logo.png';
    storyLogo.removeAttribute('srcset');
    storyLogo.alt = 'Tanishq';
    storyLogo.style.filter = 'brightness(0)';
  }
  updateTanishqCaseStudy(root, 'How a growing team keeps employee operations organized', 'hr');
  updateTitanCaseStudy(root, 'hr');
  updateMiaCaseStudy(root, 'hr');
  updateFastrackCaseStudy(root, 'hr');

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

function wireHrHeroChoices(root: HTMLElement) {
  const hero = Array.from(root.querySelectorAll<HTMLElement>('section')).find(
    (section) => Boolean(section.querySelector('h1') && section.querySelector('[role="checkbox"]')),
  );
  if (!hero) {
    return () => undefined;
  }

  const choices = Array.from(hero.querySelectorAll<HTMLButtonElement>('[role="checkbox"]'));
  const demoButton = Array.from(hero.querySelectorAll<HTMLButtonElement>('button')).find(
    (button) => button.textContent?.trim() === 'Book a demo',
  );
  const selectedChoices = new Set(
    choices
      .filter((button) => button.getAttribute('aria-checked') === 'true')
      .map((button) => button.getAttribute('aria-label') ?? ''),
  );

  const syncRequestedServices = () => {
    const requestedServices = Array.from(selectedChoices).filter(Boolean);
    demoButton?.setAttribute('data-demo-trigger', 'true');
    demoButton?.setAttribute('data-requested-services', JSON.stringify(requestedServices));
  };

  const resetChoices = () => {
    selectedChoices.clear();
    choices.forEach((button) => {
      button.setAttribute('aria-checked', 'false');
      button.classList.remove('hr-hero-option--selected');
    });
    syncRequestedServices();
  };

  const listeners = choices.map((button) => {
    let indicator =
      button.querySelector<HTMLElement>('.hr-hero-option-check') ??
      button.querySelector<HTMLElement>('span[aria-hidden="true"]');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.setAttribute('aria-hidden', 'true');
      indicator.className =
        'hr-hero-option-check inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] border-2 border-[var(--color-purple-525)] bg-transparent';
      button.prepend(indicator);
    }

    indicator.classList.add('hr-hero-option-check');
    const label = button.getAttribute('aria-label') ?? button.textContent?.trim() ?? '';
    const handleChoiceClick = () => {
      const isSelected = !selectedChoices.has(label);
      button.setAttribute('aria-checked', String(isSelected));
      button.classList.toggle('hr-hero-option--selected', isSelected);

      if (isSelected) {
        selectedChoices.add(label);
      } else {
        selectedChoices.delete(label);
      }

      syncRequestedServices();
    };

    button.addEventListener('click', handleChoiceClick);
    return () => button.removeEventListener('click', handleChoiceClick);
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
        const generatedId = tab.id || `deel-hr-tab-${listIndex}-${tabIndex}`;
        const generatedPanelId = `deel-hr-tabpanel-${listIndex}-${tabIndex}`;

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

        const generatedId = linkedTab.id || `deel-hr-tab-${listIndex}-${panelIndex}`;
        const generatedPanelId = `deel-hr-tabpanel-${listIndex}-${panelIndex}`;

        linkedTab.id = generatedId;
        linkedTab.setAttribute('aria-controls', generatedPanelId);
        panel.id = generatedPanelId;
        panel.setAttribute('aria-labelledby', generatedId);
      });
    };

    const disposers = tabs.map((tab, tabIndex) => {
      tab.id ||= `deel-hr-tab-${listIndex}-${tabIndex}`;

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

function wireHrEcosystemTabs(root: HTMLElement) {
  const tabList = Array.from(root.querySelectorAll<HTMLElement>('[role="tablist"]')).find((list) => {
    const labels = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).map((tab) =>
      tab.textContent?.trim(),
    );

    return HR_ECOSYSTEM_TAB_LABELS.every((label) => labels.includes(label));
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
    const label = tab.textContent?.trim() as keyof typeof HR_ECOSYSTEM_TABS | undefined;
    if (!label || !(label in HR_ECOSYSTEM_TABS)) {
      return;
    }

    const nextContent = HR_ECOSYSTEM_TABS[label];

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
    ctaAnchor.setAttribute('data-demo-trigger', 'true');
    ctaButton.textContent = nextContent.ctaLabel;
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
      symbol: '+' | '-',
    ) => {
      let wrapper = accordion.querySelector<HTMLElement>(`.${className}`);
      if (!wrapper) {
        wrapper = document.createElement('span');
        wrapper.className = className;
        summary.appendChild(wrapper);
      }

      // The exported SVGs use reversed wrapper names, so render the symbols directly.
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

    const summaryId = `deel-hr-accordion-header-${index}`;
    const regionId = `deel-hr-accordion-panel-${index}`;

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

export default function DeelHrPage() {
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

    document.title = 'Dechub-Bridge HR | People Operations Platform';

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${DEEL_HR_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    DEEL_HR_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    DEEL_HR_INLINE_STYLES.forEach((cssText, index) => {
      const style = document.createElement('style');
      style.setAttribute(STYLE_DATA_ATTR, String(index));
      style.textContent = cssText;
      document.head.appendChild(style);
      cleanupNodes.push(style);
    });

    const layoutStyle = document.createElement('style');
    layoutStyle.setAttribute(STYLE_DATA_ATTR, 'layout-fixes');
    layoutStyle.textContent = HR_LAYOUT_FIXES;
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
    mount.className = 'hr-landing-logo-strip-mount';
    generatedLogoStrip.classList.add('hr-generated-logo-strip');
    generatedLogoStrip.parentElement.insertBefore(mount, generatedLogoStrip);
    setLandingLogoStripTarget(mount);

    return () => {
      generatedLogoStrip.classList.remove('hr-generated-logo-strip');
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
    mount.className = 'hr-landing-key-figures-mount';
    generatedKeyFigures.classList.add('hr-generated-key-figures');
    generatedKeyFigures.parentElement.insertBefore(mount, generatedKeyFigures);
    setLandingKeyFiguresTarget(mount);

    return () => {
      generatedKeyFigures.classList.remove('hr-generated-key-figures');
      mount.remove();
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const tabList = Array.from(root?.querySelectorAll<HTMLElement>('[role="tablist"]') ?? []).find((list) => {
      const labels = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).map((tab) =>
        tab.textContent?.trim(),
      );
      return ['In your tools', 'Talent', 'IT', 'Services'].every((label) => labels.includes(label));
    });
    const section = tabList?.closest<HTMLElement>('.bg-surface-dark');
    const frame = section?.parentElement as HTMLElement | null;

    if (!section || !frame) {
      return undefined;
    }

    frame.classList.add('deel-hr-ecosystem-section');

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
          if (originalStyle == null) {
            element.removeAttribute('style');
          } else {
            element.setAttribute('style', originalStyle);
          }
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
        if (originalStyle == null) {
          element.removeAttribute('style');
        } else {
          element.setAttribute('style', originalStyle);
        }
      });
      frame.classList.remove('deel-hr-ecosystem-section');
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    applyDechubBridgeHrContent(root);
    replaceHrOnboardingImage(root);

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

      // Let the shared layout handle all Book a demo triggers.
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
    const cleanupHrHeroChoices = wireHrHeroChoices(root);
    const cleanupTabs = wireTabs(root);
    const cleanupHrEcosystemTabs = wireHrEcosystemTabs(root);
    const cleanupAccordions = wireAccordions(root);

    root.addEventListener('click', handleAnchorClick);

    return () => {
      root.removeEventListener('click', handleAnchorClick);
      cleanupSlider();
      cleanupHrHeroChoices();
      cleanupTabs();
      cleanupHrEcosystemTabs();
      cleanupAccordions();
    };
  }, []);

  return (
    <SharedLandingPageLayout>
      <div ref={rootRef} className="deel-hr-page" data-page="deel-hr-react">
        <DeelHrContent />
        <CountryFlagsOverlay
          rootRef={rootRef}
          imageSelector={'img[src*="hr_2_89bc427f73-695a07b128.webp"]'}
          ariaLabel="HR coverage countries"
          position={{ left: 22.8, top: 42.4, width: 21.7, height: 6.8 }}
        />
        {landingLogoStripTarget ? createPortal(<Section02 />, landingLogoStripTarget) : null}
        {landingKeyFiguresTarget ? createPortal(<Section07 />, landingKeyFiguresTarget) : null}
      </div>
    </SharedLandingPageLayout>
  );
}
