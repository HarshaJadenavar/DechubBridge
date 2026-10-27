import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  PAYROLL_SOLUTIONS_HTML_CLASSES,
  PAYROLL_SOLUTIONS_INLINE_STYLES,
  PAYROLL_SOLUTIONS_STYLESHEET_HREFS,
  PayrollSolutionsContent,
} from './payrollSolutions/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';
import {
  updateFastrackCaseStudy,
  updateMiaCaseStudy,
  updateTanishqCaseStudy,
  updateTitanCaseStudy,
} from '../components/common/tanishqCaseStudy';
import Section02 from '../landing_deel/components/Section02.jsx';
import Section07 from '../landing_deel/components/Section07.jsx';

const STYLE_DATA_ATTR = 'data-payroll-solutions-style';
const LINK_DATA_ATTR = 'data-payroll-solutions-stylesheet';
const PAYROLL_HERO_LAYOUT_FIXES = `
  html:has(.payroll-solutions-page),
  body:has(.payroll-solutions-page) {
    max-width: 100%;
    overflow-x: hidden;
  }

  .payroll-solutions-page,
  .payroll-solutions-page > .w-full {
    width: 100%;
    max-width: 100vw;
    overflow-x: clip;
  }

  .payroll-solutions-page section {
    max-width: 100%;
  }

  .payroll-solutions-page > .w-full > section:first-child {
    width: 100%;
    overflow: hidden;
    padding: 12px !important;
  }

  .payroll-solutions-page > .w-full > section:first-child > div {
    width: 100% !important;
    max-width: 1704px !important;
    min-width: 0;
    margin-inline: auto !important;
  }

  .payroll-solutions-page > .w-full > section:first-child > div > div {
    min-width: 0;
    overflow: hidden;
  }

  .payroll-solutions-page > .w-full > section:first-child > div > div:first-child {
    padding: 24px 20px 32px !important;
  }

  .payroll-solutions-page > .w-full > section:first-child h1 {
    display: block !important;
    margin: 0 0 28px !important;
    color: #fff !important;
  }

  .payroll-solutions-page > .w-full > section:first-child [role="group"] {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
  }

  .payroll-solutions-page > .w-full > section:first-child [role="group"] > div {
    display: flex !important;
    gap: 12px !important;
  }

  .payroll-solutions-page > .w-full > section:first-child [role="checkbox"] {
    min-height: 72px !important;
    padding: 12px !important;
  }

  .payroll-solutions-page > .w-full > section:first-child [role="checkbox"][aria-checked="true"] {
    background: rgba(149, 113, 255, 0.24) !important;
    border-color: rgba(202, 182, 255, 0.88) !important;
  }

  .payroll-solutions-page > .w-full > section:first-child [role="checkbox"] > .payroll-hero-option-check {
    position: relative;
    flex: 0 0 auto;
  }

  .payroll-solutions-page > .w-full > section:first-child [role="checkbox"][aria-checked="true"] > .payroll-hero-option-check::after {
    content: '';
    position: absolute;
    width: 7px;
    height: 4px;
    border-left: 2px solid #fff;
    border-bottom: 2px solid #fff;
    transform: rotate(-45deg) translate(0, -1px);
  }

  .payroll-solutions-page > .w-full > section:first-child [role="group"] + div {
    margin-top: 24px !important;
  }

  .payroll-solutions-page > .w-full > section:first-child [role="group"] + div + div {
    display: none !important;
  }

  .payroll-solutions-page > .w-full > section:first-child h1 + div > p {
    transform: translateY(-8px);
  }

  .payroll-solutions-page .payroll-generated-logo-strip {
    display: none !important;
  }

  .payroll-solutions-page .payroll-generated-key-figures {
    display: none !important;
  }

  .payroll-solutions-page .mui-aiaenv {
    padding-bottom: 16px !important;
  }

  .payroll-solutions-page .mui-16f0pz5 .mui-1si5xjn {
    display: none !important;
  }

  .payroll-solutions-page .payroll-landing-logo-strip-mount,
  .payroll-solutions-page .deel-logo-strip,
  .payroll-solutions-page .deel-logo-strip__viewport {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  .payroll-solutions-page .deel-logo-strip__track {
    min-width: max-content;
  }

  .payroll-product-needs-section {
    width: 100%;
    overflow: hidden;
    padding: 12px !important;
  }

  .payroll-product-needs-section > div {
    width: 100%;
    max-width: none;
    margin-inline: 0;
    padding: 64px clamp(24px, 6vw, 112px) !important;
  }

  .payroll-product-needs-section > div > div {
    width: 100% !important;
    max-width: 1312px !important;
    margin-inline: auto !important;
  }

  .payroll-product-needs-section .MuiTabs-scroller {
    overflow-x: auto !important;
    scrollbar-width: none;
  }

  .payroll-product-needs-section .MuiTabs-scroller::-webkit-scrollbar {
    display: none;
  }

  .payroll-product-needs-section [role="tablist"] {
    width: max-content !important;
    min-width: max-content;
    margin-inline: auto !important;
  }

  .payroll-product-needs-section .MuiTabs-root + div > div {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 48px !important;
  }

  .payroll-product-needs-section .MuiTabs-root + div > div > div {
    width: auto !important;
    min-width: 0 !important;
    flex: initial !important;
  }

  /* Product CTA banner: restore the original centered desktop frame and padding. */
  .payroll-solutions-page section[id="4"] {
    padding: clamp(40px, 4.8vw, 92px) clamp(24px, 3.125vw, 60px) clamp(48px, 5vw, 96px) !important;
    margin-bottom: 0 !important;
    background: #fff !important;
  }

  .payroll-solutions-page section[id="4"] + .MuiBox-root {
    margin-top: 0 !important;
  }

  .payroll-solutions-page section[id="4"] > div:first-child {
    width: 100% !important;
    max-width: 1776px !important;
    min-height: 718px !important;
    margin-inline: auto !important;
    border-radius: 30px !important;
  }

  .payroll-solutions-page section[id="4"] > div:first-child > div:first-child {
    height: 100% !important;
    padding-inline: clamp(32px, 3.125vw, 60px) !important;
  }

  @media (max-width: 1199px) {
    .payroll-solutions-page section[id="4"] > div:first-child {
      min-height: 600px !important;
    }
  }

  @media (max-width: 700px) {
    .payroll-solutions-page section[id="4"] {
      padding: 32px 16px 48px !important;
    }

    .payroll-solutions-page section[id="4"] > div:first-child {
      min-height: 620px !important;
      border-radius: 20px !important;
    }

    .payroll-solutions-page section[id="4"] > div:first-child > div:first-child {
      padding: 48px 24px 24px !important;
    }

    .payroll-solutions-page section[id="4"] > div:first-child > div:first-child > div:first-child {
      align-items: center !important;
      text-align: center !important;
    }

    .payroll-solutions-page section[id="4"] h2 {
      text-align: center !important;
    }

    .payroll-solutions-page section[id="4"] h2 + div {
      justify-content: center !important;
    }

    .payroll-solutions-page .mui-3lz68q {
      grid-template-columns: minmax(0, 1fr) !important;
    }

    .payroll-solutions-page .mui-3lz68q > .mui-pjjft1 {
      grid-column: auto !important;
      padding-right: 0 !important;
    }
  }

  @media (max-width: 1049px) {
    .payroll-solutions-page > .w-full > section:first-child > div {
      flex-direction: column !important;
      min-height: auto !important;
    }

    .payroll-solutions-page > .w-full > section:first-child > div > div:first-child,
    .payroll-solutions-page > .w-full > section:first-child > div > div:last-child {
      width: 100% !important;
    }

    .payroll-solutions-page > .w-full > section:first-child > div > div:last-child {
      display: none !important;
    }

    .payroll-solutions-page > .w-full > section:first-child h1 {
      font-size: 38px !important;
      line-height: 1.05 !important;
      overflow-wrap: anywhere;
    }

    .payroll-product-needs-section > div {
      padding: 48px 20px !important;
    }

    .payroll-product-needs-section [role="tablist"] {
      margin-inline: 0 !important;
    }

    .payroll-product-needs-section .MuiTabs-root + div > div {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px !important;
    }

    .payroll-product-needs-section .MuiTabs-root + div > div > div:first-child {
      padding: 24px !important;
    }
  }

  @media (min-width: 1050px) {
    .payroll-solutions-page > .w-full > section:first-child > div {
      display: flex !important;
      flex-direction: row !important;
    }

    .payroll-solutions-page > .w-full > section:first-child > div > div:first-child,
    .payroll-solutions-page > .w-full > section:first-child > div > div:last-child {
      width: 50% !important;
      flex: 0 1 50% !important;
    }

    .payroll-solutions-page > .w-full > section:first-child > div > div:first-child {
      display: flex !important;
      padding: 96px 64px !important;
    }

    .payroll-solutions-page > .w-full > section:first-child > div > div:first-child > div:first-child {
      width: 100% !important;
      max-width: 450px !important;
      margin: auto !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
    }

    .payroll-solutions-page > .w-full > section:first-child h1 {
      margin-bottom: 48px !important;
      text-align: center !important;
    }

    .payroll-solutions-page > .w-full > section:first-child h1 + div,
    .payroll-solutions-page > .w-full > section:first-child h1 + div > p {
      text-align: center !important;
    }

    .payroll-solutions-page > .w-full > section:first-child [role="checkbox"] {
      min-height: 80px !important;
    }
  }
`;

const PAYROLL_PRODUCT_TAB_LABELS = [
  'India',
  'United States',
  'UAE',
  'Payroll Setup',
  'Compliance',
  'Approvals',
  'Payslips',
  'Reporting',
  'Support',
] as const;

const PAYROLL_PRODUCT_TABS: Record<
  (typeof PAYROLL_PRODUCT_TAB_LABELS)[number],
  {
    title: string;
    description: string;
    ctaLabel: string;
    ctaLink: string;
    imageSrc: string;
  }
> = {
  India: {
    title: 'Payroll built for teams in India',
    description: 'Manage salaries, statutory deductions, payslips, and monthly payroll in one clear workflow.',
    ctaLabel: 'Talk to payroll expert',
    ctaLink: '/solutions/payroll/',
    imageSrc: '/solutions/payroll/assets/images/cozy-workspace-global-analytics.png',
  },
  'United States': {
    title: 'Run US payroll with confidence',
    description: 'Organize employee pay, payroll approvals, and records for your US workforce from one platform.',
    ctaLabel: 'Talk to payroll expert',
    ctaLink: '/solutions/payroll/',
    imageSrc: '/solutions/payroll/assets/images/cozy-workspace-global-analytics.png',
  },
  UAE: {
    title: 'Keep UAE payroll organized',
    description: 'Coordinate payroll data, approvals, and employee records for teams operating across the UAE.',
    ctaLabel: 'Talk to payroll expert',
    ctaLink: '/solutions/payroll/',
    imageSrc: '/solutions/payroll/assets/images/cozy-workspace-global-analytics.png',
  },
  'Payroll Setup': {
    title: 'Launch payroll with a guided setup',
    description: 'Bring employee data, pay components, and approval rules into one reliable payroll process.',
    ctaLabel: 'Book a demo',
    ctaLink: '/solutions/payroll/',
    imageSrc: '/solutions/payroll/assets/images/cozy-workspace-global-analytics.png',
  },
  Compliance: {
    title: 'Stay on top of payroll requirements',
    description: 'Keep payroll information and required records organized for India, the USA, and the UAE.',
    ctaLabel: 'Book a demo',
    ctaLink: '/solutions/payroll',
    imageSrc: '/solutions/payroll/assets/images/cozy-workspace-global-analytics.png',
  },
  Approvals: {
    title: 'Review before every payroll run',
    description: 'Give the right people a simple approval step before payroll is finalized.',
    ctaLabel: 'Book a demo',
    ctaLink: '/solutions/payroll',
    imageSrc: '/solutions/payroll/assets/images/cozy-workspace-global-analytics.png',
  },
  Payslips: {
    title: 'Give employees clear payslips',
    description: 'Keep salary details and payroll records accessible in one secure employee experience.',
    ctaLabel: 'Book a demo',
    ctaLink: '/solutions/payroll',
    imageSrc: '/solutions/payroll/assets/images/cozy-workspace-global-analytics.png',
  },
  Reporting: {
    title: 'See payroll status at a glance',
    description: 'Track payroll progress, employee changes, and country-level activity from one dashboard.',
    ctaLabel: 'Book a demo',
    ctaLink: '/solutions/benefits',
    imageSrc: '/solutions/payroll/assets/images/cozy-workspace-global-analytics.png',
  },
  Support: {
    title: 'Get help when payroll needs attention',
    description: 'Work with the Dechub-Bridge team to keep your payroll process moving across all three countries.',
    ctaLabel: 'Book a demo',
    ctaLink: '/solutions/payroll',
    imageSrc: '/solutions/payroll/assets/images/cozy-workspace-global-analytics.png',
  },
};

const DECHUB_PAYROLL_COPY: Record<string, string> = {
  'Run payroll on one platform, globally': 'Payroll for India, the USA, and the UAE',
  'What would you like to do with Deel Payroll?': 'What can Dechub-Bridge Payroll help you manage?',
  'Simplify your entire global operations': 'Simplify payroll across your key markets',
  'One platform for payroll': 'One platform for every payroll run',
  'Run payroll your way': 'Run payroll with a process your team can trust',
  'Track payroll status, variances, and global workforce costs in one intuitive dashboard.':
    'See payroll progress, employee changes, and approval status across India, the USA, and the UAE.',
  'Choose self-serve or managed payroll by country. Mix models as your business scales.':
    'Use one structured workflow while your team manages the payroll needs of each country.',
  'Local rules, filings, and statutory requirements apply automatically before payroll runs.':
    'Keep the records, inputs, and approval steps your payroll team needs in one organized process.',
  'Receive fast, accurate support across multiple channels, including email, phone, live chat, Slack, and Teams.':
    'Work with the Dechub-Bridge team when you need help setting up or managing your payroll workflow.',
  'Approve once. Deel handles FX, local payment rails, and multi-currency payouts, including crypto.':
    'Give finance and payroll teams a clear review point before each payroll run is approved.',
  'SOC 2 Type II, ISO 27001, and GDPR-compliant. Integrates with Workday, SAP, Oracle, NetSuite, Okta, Azure AD, and more.':
    'Keep your payroll data, employee details, and operational records coordinated in one platform.',
  'Built-in compliance': 'Organized payroll records',
  'Modern 24/7 support': 'Support when your team needs it',
  'Reliable global payments': 'Clear payroll approvals',
  'Enterprise ready': 'Built to grow with your workforce',
  'The impact of one connected payroll platform': 'A clearer payroll process for your team',
  'A simple payroll flow from start to finish': 'A simple payroll flow from setup to payslip',
  'Get set up fast': 'Set up your payroll workflow',
  'Get compliant payroll live in days without building in-house expertise.':
    'Start with a guided discussion of your payroll requirements for India, the USA, and the UAE.',
  'Launch payroll country by country with guided onboarding and clear timelines — SMBs can be live in as little as 1–2 weeks.':
    'Launch payroll country by country with guided onboarding and clear timelines.',
  'Bring your workforce into Deel': 'Bring your employee payroll data together',
  'Add new countries without re-implementing payroll each time.':
    'Keep employee information and pay components organized before each payroll cycle.',
  'Configure payroll by country': 'Configure payroll for each country',
  'Integrate with Workday, SAP, or Oracle and maintain governance, auditability, and security.':
    'Set country-specific payroll information, reviewers, and supporting records in a consistent workflow.',
  'Automate compliance': 'Keep records and approvals organized',
  'Approve once. Pay everywhere.': 'Review and approve payroll with confidence',
  'Finalize payroll, manage FX, and pay workers in local currency—with optional crypto payouts where supported.':
    'Finalize payroll and pay workers in local currency.',
  'Track everything in one place': 'Track payroll progress in one place',
  'Built for every business size': 'Payroll that grows with your business',
  'Startups and remote-first teams': 'Growing teams',
  'Scaling and mid-market teams': 'Expanding businesses',
  Enterprises: 'Established organizations',
  'A product fit for every need': 'Payroll support for every stage of growth',
  'PRODUCT NEEDS': 'DECHUB-BRIDGE PAYROLL',
  'See what customers are saying': 'Built for payroll teams that need clarity',
  'How Turing expedites payments for 6,000+ global workers with Deel':
    'How a growing team keeps India payroll organized',
  'How Revolut streamlined employee relocation with Deel':
    'How a US team simplifies payroll approvals',
  'How Magic saves 50+ hours a month on admin using Deel':
    'How a UAE team centralizes payroll records',
  'How BCG centralized payroll across 6 nations with Deel':
    'How finance teams keep payroll information in one place',
  'See the products that help you pay anywhere': 'Run payroll with confidence in India, the USA, and the UAE',
  'Excellent global payroll': 'Payroll support for growing teams',
};

const PAYROLL_FEATURE_IMAGES: Record<string, { src: string; alt: string; width?: number }> = {
  'Run payroll with a process your team can trust': {
    src: '/solutions/payroll/assets/images/payroll-workflow.svg',
    alt: 'Payroll workflow moving from employee inputs to team review and completion',
    width: 320,
  },
  'Clear payroll approvals': {
    src: '/solutions/payroll/assets/images/payroll-approval.svg',
    alt: 'Payroll review checklist with an approved status',
    width: 320,
  },
  'Built to grow with your workforce': {
    src: '/solutions/payroll/assets/images/payroll-workforce-growth.svg',
    alt: 'Growing workforce represented by a team and an upward trend',
  },
  'Support when your team needs it': {
    src: '/solutions/payroll/assets/images/Asset_Area_b1e963575e-6b8e84b970.png',
    alt: 'Payroll support team helping with a payroll question',
  },
};

const DECHUB_PAYROLL_FAQS = [
  {
    question: 'What is Dechub-Bridge Payroll?',
    answer:
      'Dechub-Bridge Payroll helps businesses organize payroll operations for teams in India, the USA, and the UAE from one platform.',
  },
  {
    question: 'Which countries does Dechub-Bridge Payroll support?',
    answer: 'Dechub-Bridge Payroll is currently designed for payroll operations in India, the USA, and the UAE.',
  },
  {
    question: 'Can we manage payroll approvals in Dechub-Bridge?',
    answer: 'Yes. Dechub-Bridge provides a clear review and approval workflow before each payroll run is finalized.',
  },
  {
    question: 'Can employees access payslip information?',
    answer: 'Dechub-Bridge keeps payroll records and payslip information organized in one secure employee experience.',
  },
  {
    question: 'Can we manage employee changes before payroll runs?',
    answer: 'Yes. Teams can keep employee and payroll changes organized before the payroll approval stage.',
  },
  {
    question: 'How does Dechub-Bridge help with payroll compliance?',
    answer: 'Dechub-Bridge helps your team maintain organized payroll records and workflows for the countries you operate in.',
  },
  {
    question: 'How quickly can we get started?',
    answer: 'Our team can review your payroll requirements and guide you through the appropriate setup process.',
  },
  {
    question: 'Can Dechub-Bridge support teams in more than one country?',
    answer: 'Yes. Dechub-Bridge Payroll is built to help teams coordinate payroll across India, the USA, and the UAE.',
  },
  {
    question: 'Can Dechub-Bridge work alongside our current payroll process?',
    answer: 'Yes. We can discuss your current process and help you plan the right workflow for your team.',
  },
  {
    question: 'Is payroll information kept secure?',
    answer: 'Dechub-Bridge is designed to keep payroll information organized and accessible to the right people in your team.',
  },
];

function applyDechubPayrollContent(root: HTMLElement) {
  const textTargets = Array.from(root.querySelectorAll<HTMLElement>('h1, h2, h3, h5, p, button, [role="tab"]'));

  textTargets.forEach((element) => {
    const currentText = element.textContent?.trim() ?? '';
    const replacement = DECHUB_PAYROLL_COPY[currentText];
    if (replacement) {
      element.textContent = replacement;
    }
  });

  const unavailableVideoHeading = Array.from(root.querySelectorAll<HTMLElement>('h2')).find(
    (element) => element.textContent?.trim() === 'Explore how simple global payroll can be',
  );
  unavailableVideoHeading?.closest<HTMLElement>('.mui-1n06q99')?.remove();

  Object.entries(PAYROLL_FEATURE_IMAGES).forEach(([title, image]) => {
    const heading = Array.from(root.querySelectorAll<HTMLElement>('h3')).find(
      (element) => element.textContent?.trim() === title,
    );
    const card = heading?.closest<HTMLElement>('.mui-1iutxri');
    const imageNode = card?.querySelector<HTMLImageElement>('img');
    if (imageNode) {
      imageNode.src = image.src;
      imageNode.setAttribute('srcset', image.src);
      imageNode.alt = image.alt;
      if (image.width) {
        imageNode.style.width = `${image.width}px`;
        imageNode.style.maxWidth = 'none';
        imageNode.style.height = 'auto';
      }
    }
  });

  const hero = root.querySelector<HTMLElement>(':scope > .w-full > section:first-child');
  const heroChoices = [
    'Run payroll in India',
    'Manage US payroll',
    'Coordinate UAE payroll',
    'Prepare payslips',
    'Review payroll approvals',
  ];

  hero?.querySelectorAll<HTMLButtonElement>('[role="checkbox"]').forEach((button, index) => {
    const label = heroChoices[index];
    if (!label) {
      return;
    }

    button.setAttribute('aria-label', label);
    const labelNode = Array.from(button.querySelectorAll('span')).find((span) => span.textContent?.trim());
    if (labelNode) {
      labelNode.textContent = label;
    }
  });

  const productTabLabels = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(
    (tab) => tab.textContent?.trim() === 'Deel Payroll',
  )?.parentElement;
  const productTabs = productTabLabels
    ? Array.from(productTabLabels.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
    : [];
  productTabs.forEach((tab, index) => {
    const label = PAYROLL_PRODUCT_TAB_LABELS[index];
    if (label) {
      tab.textContent = label;
    }
  });

  root.querySelectorAll<HTMLElement>('.MuiAccordion-root').forEach((accordion, index) => {
    const content = DECHUB_PAYROLL_FAQS[index];
    if (!content) {
      return;
    }

    const question = accordion.querySelector<HTMLElement>('h3');
    const answer = accordion.querySelector<HTMLElement>('.MuiAccordionDetails-root');
    if (question) {
      question.textContent = content.question;
    }
    if (answer) {
      answer.textContent = content.answer;
    }
  });

  root.querySelectorAll<HTMLElement>('p').forEach((paragraph) => {
    if (paragraph.textContent?.trim() === '(Forrester TEI™)') {
      paragraph.remove();
    }
  });

  root.querySelectorAll<HTMLButtonElement>('.key-figures-wrapper button').forEach((button) => {
    if (button.textContent?.trim() === 'Learn more') {
      button.closest('a')?.remove();
    }
  });

  root.querySelectorAll<HTMLAnchorElement>('a[href*="using-multiple-payroll-vendors"]').forEach((link) => {
    link.replaceWith(document.createTextNode(link.textContent ?? 'third-party payrolls'));
  });

  root.querySelectorAll<HTMLAnchorElement>('a[href*="/hr-platform/ai/"]').forEach((link) => {
    link.replaceWith(document.createTextNode(link.textContent ?? 'AI'));
  });

  const audienceCtas = new Set(['Explore Startups', 'Explore Mid-market', 'Explore Enterprise']);
  root.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    if (audienceCtas.has(link.textContent?.trim() ?? '')) {
      link.remove();
    }
  });

  root.querySelectorAll<HTMLElement>('a, button').forEach((element) => {
    if (element.textContent?.trim() === 'Talk to payroll expert') {
      (element.closest('a, button') ?? element).setAttribute('data-demo-trigger', 'true');
    }
  });

  root.querySelectorAll<HTMLElement>('a, button').forEach((element) => {
    if (element.textContent?.trim() === 'Read more') {
      element.closest('a, button')?.remove();
    }
  });

  const indiaPayrollStory = Array.from(root.querySelectorAll<HTMLElement>('h3')).find(
    (heading) => heading.textContent?.trim() === 'How a growing team keeps India payroll organized',
  );
  const storyLogo = indiaPayrollStory?.closest<HTMLElement>('.MuiCardContent-root')?.querySelector<HTMLImageElement>('img');
  if (storyLogo) {
    storyLogo.src = '/dechub-assets/trusted-logos/tanishq_logo.png';
    storyLogo.removeAttribute('srcset');
    storyLogo.alt = 'Tanishq';
    storyLogo.style.filter = 'brightness(0)';
  }
  updateTanishqCaseStudy(root, 'How a growing team keeps India payroll organized', 'payroll');
  updateTitanCaseStudy(root, 'payroll');
  updateMiaCaseStudy(root, 'payroll');
  updateFastrackCaseStudy(root, 'payroll');

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

function wirePayrollHeroChoices(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>(':scope > .w-full > section:first-child');
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
      button.classList.remove('payroll-hero-option--selected');
    });
    syncRequestedServices();
  };

  const listeners = choices.map((button) => {
    let indicator =
      button.querySelector<HTMLElement>('.payroll-hero-option-check') ??
      button.querySelector<HTMLElement>('span[aria-hidden="true"]');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.setAttribute('aria-hidden', 'true');
      indicator.className = 'payroll-hero-option-check inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] border-2 border-[var(--color-purple-525)] bg-transparent';
      button.prepend(indicator);
    }

    indicator.classList.add('payroll-hero-option-check');
    const label = button.getAttribute('aria-label') ?? button.textContent?.trim() ?? '';
    const handleChoiceClick = () => {
      const isSelected = !selectedChoices.has(label);
      button.setAttribute('aria-checked', String(isSelected));
      button.classList.toggle('payroll-hero-option--selected', isSelected);

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

function wirePayrollProductTabs(root: HTMLElement) {
  const tabList = Array.from(root.querySelectorAll<HTMLElement>('[role="tablist"]')).find((list) => {
    const labels = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).map((tab) =>
      tab.textContent?.trim(),
    );

    return PAYROLL_PRODUCT_TAB_LABELS.every((label) => labels.includes(label));
  });

  if (!tabList) {
    return () => undefined;
  }

  const tabs = Array.from(tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const sectionContent = tabList.closest('.MuiTabs-root')?.nextElementSibling as HTMLElement | null;
  const titleNode = sectionContent?.querySelector<HTMLElement>('h5');
  const descriptionNode = sectionContent?.querySelector<HTMLElement>('p');
  const ctaButton = Array.from(sectionContent?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(
    (button) => button.textContent?.trim(),
  );
  const imageNode = sectionContent?.querySelector<HTMLImageElement>('img');
  const indicator =
    tabList.querySelector<HTMLElement>('.MuiTabs-indicator') ?? document.createElement('span');

  if (!sectionContent || !titleNode || !descriptionNode || !ctaButton || !imageNode || tabs.length === 0) {
    return () => undefined;
  }

  indicator.className ||= 'MuiTabs-indicator mui-ttwr4n';
  ctaButton.style.cursor = 'pointer';

  let activeLink = PAYROLL_PRODUCT_TABS.India.ctaLink;

  const activateTab = (tab: HTMLButtonElement) => {
    const normalizedLabel = (tab.textContent ?? '').trim().replace(/\s+/g, ' ') as
      | keyof typeof PAYROLL_PRODUCT_TABS
      | '';

    if (!normalizedLabel || !(normalizedLabel in PAYROLL_PRODUCT_TABS)) {
      return;
    }

    const nextContent = PAYROLL_PRODUCT_TABS[normalizedLabel];
    activeLink = nextContent.ctaLink;

    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', selected ? 'true' : 'false');
      candidate.setAttribute('tabindex', selected ? '0' : '-1');
      candidate.classList.toggle('Mui-selected', selected);
    });

    titleNode.textContent = nextContent.title;
    descriptionNode.textContent = nextContent.description;
    ctaButton.textContent = nextContent.ctaLabel;
    ctaButton.setAttribute('data-route', nextContent.ctaLink);
    imageNode.src = nextContent.imageSrc;
    imageNode.setAttribute('srcset', nextContent.imageSrc);
    imageNode.alt = nextContent.title;

    if (indicator.parentElement !== tab) {
      indicator.remove();
      tab.appendChild(indicator);
    }
  };

  const handleCtaClick = () => {
    navigateWithinApp(activeLink);
  };

  ctaButton.addEventListener('click', handleCtaClick);

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
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateTab(tab);
        return;
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

  const initiallySelected =
    tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];
  activateTab(initiallySelected);

  return () => {
    ctaButton.removeEventListener('click', handleCtaClick);
    disposers.forEach((dispose) => dispose());
  };
}

function wireCustomerStoriesSlider(root: HTMLElement) {
  const slider = root.querySelector<HTMLElement>('#comparison-slider');
  const wrapper = slider?.querySelector<HTMLElement>('.swiper-wrapper');
  const scrollbar = root.querySelector<HTMLElement>('#scrollbar-comparison-slider .swiper-scrollbar');
  const previousButton = root.querySelector<HTMLButtonElement>('#nav-comparison-slider .swiper-button-prev');
  const nextButton = root.querySelector<HTMLButtonElement>('#nav-comparison-slider .swiper-button-next');
  const telinSlide = Array.from(wrapper?.querySelectorAll<HTMLElement>(':scope > .swiper-slide') ?? []).find(
    (slide) => slide.textContent?.includes('How Telin cut onboarding time'),
  );

  telinSlide?.remove();

  const slides = wrapper
    ? Array.from(wrapper.querySelectorAll<HTMLElement>(':scope > .swiper-slide'))
    : [];

  if (!slider || !wrapper || !scrollbar || !previousButton || !nextButton || slides.length === 0) {
    return () => undefined;
  }

  const gap = 24;
  const scrollbarThumb = document.createElement('div');
  scrollbarThumb.className = 'swiper-scrollbar-drag';
  scrollbarThumb.setAttribute('aria-hidden', 'true');
  scrollbar.appendChild(scrollbarThumb);

  // Keep the browser responsible for the track geometry. The controls scroll to
  // real card offsets, which remains correct at every viewport size.
  slider.style.overflowX = 'auto';
  slider.style.overflowY = 'hidden';
  slider.style.scrollBehavior = 'smooth';
  slider.style.scrollSnapType = 'x mandatory';
  slider.style.scrollbarWidth = 'none';
  scrollbar.style.position = 'relative';
  scrollbar.style.height = '8px';
  scrollbar.style.borderRadius = '999px';
  scrollbar.style.backgroundColor = 'rgba(27, 27, 27, 0.16)';
  scrollbar.style.cursor = 'pointer';
  scrollbar.style.touchAction = 'none';
  scrollbar.style.userSelect = 'none';
  scrollbar.setAttribute('role', 'scrollbar');
  scrollbar.setAttribute('aria-label', 'Customer stories');
  scrollbar.setAttribute('aria-controls', slider.id);
  scrollbar.setAttribute('aria-orientation', 'horizontal');
  scrollbar.tabIndex = 0;
  scrollbarThumb.style.position = 'absolute';
  scrollbarThumb.style.top = '0';
  scrollbarThumb.style.left = '0';
  scrollbarThumb.style.height = '100%';
  scrollbarThumb.style.minWidth = '36px';
  scrollbarThumb.style.borderRadius = 'inherit';
  scrollbarThumb.style.backgroundColor = '#1B1B1B';
  scrollbarThumb.style.cursor = 'grab';
  scrollbarThumb.style.touchAction = 'none';
  wrapper.style.display = 'flex';
  wrapper.style.width = 'max-content';
  wrapper.style.minWidth = '100%';
  wrapper.style.gap = `${gap}px`;
  wrapper.style.transform = 'none';
  wrapper.style.transition = 'none';

  const updateLayout = () => {
    const cardWidth = Math.min(380, Math.max(280, slider.clientWidth - 24));

    slides.forEach((slide) => {
      slide.style.flex = `0 0 ${cardWidth}px`;
      slide.style.width = `${cardWidth}px`;
      slide.style.maxWidth = 'none';
      slide.style.minWidth = '0';
      slide.style.marginRight = '0';
      slide.style.boxSizing = 'border-box';
      slide.style.scrollSnapAlign = 'start';

      const storyLink = slide.querySelector<HTMLAnchorElement>(':scope > a');
      const storyCard = storyLink?.querySelector<HTMLElement>('.MuiCard-root');
      const storyContent = storyCard?.querySelector<HTMLElement>('.MuiCardContent-root');
      const storyTitle = storyCard?.querySelector<HTMLElement>('h3');
      const titleWrapper = storyTitle?.parentElement as HTMLElement | null;

      if (storyLink) {
        storyLink.style.display = 'block';
        storyLink.style.width = '100%';
      }

      if (storyCard) {
        storyCard.style.width = '100%';
        storyCard.style.minWidth = '0';
        storyCard.style.boxSizing = 'border-box';
      }

      if (storyContent) {
        storyContent.style.width = '100%';
        storyContent.style.boxSizing = 'border-box';
      }

      if (titleWrapper) {
        titleWrapper.style.width = '100%';
        titleWrapper.style.minWidth = '0';
        titleWrapper.style.alignSelf = 'stretch';
      }

      if (storyTitle) {
        storyTitle.style.width = '100%';
        storyTitle.style.whiteSpace = 'normal';
        storyTitle.style.overflowWrap = 'normal';
      }
    });

    updateControls();
  };

  const updateControls = () => {
    const lastScrollPosition = Math.max(0, slider.scrollWidth - slider.clientWidth);
    previousButton.disabled = slider.scrollLeft <= 1;
    nextButton.disabled = slider.scrollLeft >= lastScrollPosition - 1;
    previousButton.setAttribute('aria-disabled', String(previousButton.disabled));
    nextButton.setAttribute('aria-disabled', String(nextButton.disabled));

    const trackWidth = scrollbar.clientWidth;
    const thumbWidth = lastScrollPosition > 0
      ? Math.min(trackWidth, Math.max(36, (slider.clientWidth / slider.scrollWidth) * trackWidth))
      : trackWidth;
    const thumbTravel = Math.max(0, trackWidth - thumbWidth);
    const scrollProgress = lastScrollPosition > 0 ? slider.scrollLeft / lastScrollPosition : 0;
    scrollbarThumb.style.width = `${thumbWidth}px`;
    scrollbarThumb.style.transform = `translateX(${thumbTravel * scrollProgress}px)`;
    scrollbar.style.display = lastScrollPosition > 0 ? '' : 'none';
    scrollbar.setAttribute('aria-valuemin', '0');
    scrollbar.setAttribute('aria-valuemax', '100');
    scrollbar.setAttribute('aria-valuenow', String(Math.round(scrollProgress * 100)));
  };

  const handlePrevious = () => {
    const target = [...slides].reverse().find((slide) => slide.offsetLeft < slider.scrollLeft - 1);
    slider.scrollTo({ left: target?.offsetLeft ?? 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    const target = slides.find((slide) => slide.offsetLeft > slider.scrollLeft + 1);
    slider.scrollTo({ left: target?.offsetLeft ?? slider.scrollWidth, behavior: 'smooth' });
  };

  let activePointerId: number | null = null;
  let pointerOffset = 0;

  const scrollToPointer = (clientX: number) => {
    const trackRect = scrollbar.getBoundingClientRect();
    const trackWidth = scrollbar.clientWidth;
    const thumbWidth = scrollbarThumb.offsetWidth;
    const thumbTravel = Math.max(0, trackWidth - thumbWidth);
    const nextThumbLeft = Math.min(
      thumbTravel,
      Math.max(0, clientX - trackRect.left - pointerOffset),
    );
    const maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
    slider.scrollLeft = thumbTravel > 0 ? (nextThumbLeft / thumbTravel) * maxScroll : 0;
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    activePointerId = event.pointerId;
    const thumbRect = scrollbarThumb.getBoundingClientRect();
    pointerOffset = event.target === scrollbarThumb
      ? event.clientX - thumbRect.left
      : thumbRect.width / 2;
    scrollbar.setPointerCapture(event.pointerId);
    scrollbarThumb.style.cursor = 'grabbing';
    scrollToPointer(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerId === activePointerId) {
      scrollToPointer(event.clientX);
    }
  };

  const handlePointerEnd = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) {
      return;
    }

    activePointerId = null;
    scrollbarThumb.style.cursor = 'grab';
  };

  const handleScrollbarKeyDown = (event: KeyboardEvent) => {
    const maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
    const step = Math.max(1, slider.clientWidth * (event.shiftKey ? 0.9 : 0.2));

    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      slider.scrollBy({ left: step, behavior: 'smooth' });
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      slider.scrollBy({ left: -step, behavior: 'smooth' });
    } else if (event.key === 'Home') {
      slider.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (event.key === 'End') {
      slider.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      return;
    }

    event.preventDefault();
  };

  previousButton.addEventListener('click', handlePrevious);
  nextButton.addEventListener('click', handleNext);
  slider.addEventListener('scroll', updateControls, { passive: true });
  scrollbar.addEventListener('pointerdown', handlePointerDown);
  scrollbar.addEventListener('pointermove', handlePointerMove);
  scrollbar.addEventListener('pointerup', handlePointerEnd);
  scrollbar.addEventListener('pointercancel', handlePointerEnd);
  scrollbar.addEventListener('lostpointercapture', handlePointerEnd);
  scrollbar.addEventListener('keydown', handleScrollbarKeyDown);
  window.addEventListener('resize', updateLayout);
  updateLayout();

  return () => {
    previousButton.removeEventListener('click', handlePrevious);
    nextButton.removeEventListener('click', handleNext);
    slider.removeEventListener('scroll', updateControls);
    scrollbar.removeEventListener('pointerdown', handlePointerDown);
    scrollbar.removeEventListener('pointermove', handlePointerMove);
    scrollbar.removeEventListener('pointerup', handlePointerEnd);
    scrollbar.removeEventListener('pointercancel', handlePointerEnd);
    scrollbar.removeEventListener('lostpointercapture', handlePointerEnd);
    scrollbar.removeEventListener('keydown', handleScrollbarKeyDown);
    window.removeEventListener('resize', updateLayout);
    scrollbarThumb.remove();
  };
}

function wirePayrollFaqs(root: HTMLElement) {
  const summaries = Array.from<HTMLElement>(
    root.querySelectorAll('.product-faqs .MuiAccordionSummary-root[role="button"]'),
  );

  if (summaries.length === 0) {
    return () => undefined;
  }

  const setExpanded = (summary: HTMLElement, expanded: boolean) => {
    const accordion = summary.parentElement;
    const panel = accordion?.querySelector<HTMLElement>('.MuiCollapse-root');
    const panelContent = panel?.querySelector<HTMLElement>('.MuiCollapse-wrapperInner');

    if (!panel || !panelContent) {
      return;
    }

    summary.setAttribute('aria-expanded', String(expanded));
    summary.classList.toggle('Mui-expanded', expanded);
    panel.classList.toggle('MuiCollapse-hidden', !expanded);
    panel.style.visibility = expanded ? 'visible' : 'hidden';
    panel.style.height = expanded ? `${panelContent.scrollHeight}px` : '0px';

    const expandIcon = summary.querySelector<HTMLElement>('.expandIconWrapper');
    const collapseIcon = summary.querySelector<HTMLElement>('.collapseIconWrapper');
    if (expandIcon) {
      expandIcon.style.display = expanded ? 'block' : 'none';
    }
    if (collapseIcon) {
      collapseIcon.style.display = expanded ? 'none' : 'block';
    }
  };

  const disposers = summaries.map((summary) => {
    const handleToggle = () => {
      const willExpand = summary.getAttribute('aria-expanded') !== 'true';
      summaries.forEach((candidate) => setExpanded(candidate, candidate === summary && willExpand));
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
    };

    summary.style.cursor = 'pointer';
    summary.addEventListener('click', handleToggle);
    summary.addEventListener('keydown', handleKeyDown);
    setExpanded(summary, false);

    return () => {
      summary.removeEventListener('click', handleToggle);
      summary.removeEventListener('keydown', handleKeyDown);
    };
  });

  return () => disposers.forEach((dispose) => dispose());
}

function wirePayrollReviewSlider(root: HTMLElement) {
  const slider = root.querySelector<HTMLElement>('#g2-reviews-671');
  const wrapper = slider?.querySelector<HTMLElement>('.swiper-wrapper');
  const previousButton = root.querySelector<HTMLButtonElement>('#nav-g2-reviews-671 .swiper-button-prev');
  const nextButton = root.querySelector<HTMLButtonElement>('#nav-g2-reviews-671 .swiper-button-next');

  if (!wrapper || !previousButton || !nextButton) {
    return () => undefined;
  }

  const handlePrevious = () => {
    const lastReview = wrapper.lastElementChild;
    if (lastReview) {
      wrapper.insertBefore(lastReview, wrapper.firstElementChild);
    }
  };

  const handleNext = () => {
    const firstReview = wrapper.firstElementChild;
    if (firstReview) {
      wrapper.appendChild(firstReview);
    }
  };

  previousButton.style.cursor = 'pointer';
  nextButton.style.cursor = 'pointer';
  previousButton.addEventListener('click', handlePrevious);
  nextButton.addEventListener('click', handleNext);

  return () => {
    previousButton.removeEventListener('click', handlePrevious);
    nextButton.removeEventListener('click', handleNext);
  };
}

export default function PayrollSolutionsPage() {
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

    document.title = 'Dechub-Bridge Payroll | India, USA, UAE';

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${PAYROLL_SOLUTIONS_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    PAYROLL_SOLUTIONS_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    PAYROLL_SOLUTIONS_INLINE_STYLES.forEach((cssText, index) => {
      const style = document.createElement('style');
      style.setAttribute(STYLE_DATA_ATTR, String(index));
      style.textContent = cssText;
      document.head.appendChild(style);
      cleanupNodes.push(style);
    });

    const heroLayoutStyle = document.createElement('style');
    heroLayoutStyle.setAttribute(STYLE_DATA_ATTR, 'hero-layout-fixes');
    heroLayoutStyle.textContent = PAYROLL_HERO_LAYOUT_FIXES;
    document.head.appendChild(heroLayoutStyle);
    cleanupNodes.push(heroLayoutStyle);

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

    applyDechubPayrollContent(root);

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

    const cleanupPayrollHeroChoices = wirePayrollHeroChoices(root);
    const cleanupPayrollTabs = wirePayrollProductTabs(root);
    const cleanupCustomerStoriesSlider = wireCustomerStoriesSlider(root);
    const cleanupPayrollFaqs = wirePayrollFaqs(root);
    const cleanupPayrollReviewSlider = wirePayrollReviewSlider(root);

    root.addEventListener('click', handleAnchorClick);

    return () => {
      root.removeEventListener('click', handleAnchorClick);
      cleanupPayrollHeroChoices();
      cleanupPayrollTabs();
      cleanupCustomerStoriesSlider();
      cleanupPayrollFaqs();
      cleanupPayrollReviewSlider();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const heading = Array.from(root?.querySelectorAll('h2') ?? []).find(
      (node) =>
        node.textContent?.trim() === 'A product fit for every need' ||
        node.textContent?.trim() === 'Payroll support for every stage of growth',
    );
    const section = heading?.closest<HTMLElement>('div[class*="bg-surface-primary"]');

    if (!section) {
      return undefined;
    }

    section.classList.add('payroll-product-needs-section');
    return () => section.classList.remove('payroll-product-needs-section');
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const generatedLogoStrip = root?.querySelector<HTMLElement>('section.logo-stripe-standard-wrapper');

    if (!generatedLogoStrip?.parentElement) {
      return undefined;
    }

    const mount = document.createElement('div');
    mount.className = 'payroll-landing-logo-strip-mount';
    generatedLogoStrip.classList.add('payroll-generated-logo-strip');
    generatedLogoStrip.parentElement.insertBefore(mount, generatedLogoStrip);
    setLandingLogoStripTarget(mount);

    return () => {
      generatedLogoStrip.classList.remove('payroll-generated-logo-strip');
      mount.remove();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const generatedKeyFigures = Array.from(root?.querySelectorAll<HTMLElement>('div.key-figures-wrapper') ?? []).find(
      (section) =>
        section.querySelector('h3')?.textContent?.trim() ===
          'Deel makes growing remote and international teams effortless' ||
        section.querySelector('h3')?.textContent?.trim() ===
          'Dechub-Bridge makes growing remote and international teams effortless',
    );

    if (!generatedKeyFigures?.parentElement) {
      return undefined;
    }

    const mount = document.createElement('div');
    mount.className = 'payroll-landing-key-figures-mount';
    generatedKeyFigures.classList.add('payroll-generated-key-figures');
    generatedKeyFigures.parentElement.insertBefore(mount, generatedKeyFigures);
    setLandingKeyFiguresTarget(mount);

    return () => {
      generatedKeyFigures.classList.remove('payroll-generated-key-figures');
      mount.remove();
    };
  }, []);

  return (
    <SharedLandingPageLayout>
      <div ref={rootRef} className="payroll-solutions-page" data-page="payroll-solutions-react">
        <PayrollSolutionsContent />
        {landingLogoStripTarget ? createPortal(<Section02 />, landingLogoStripTarget) : null}
        {landingKeyFiguresTarget ? createPortal(<Section07 />, landingKeyFiguresTarget) : null}
      </div>
    </SharedLandingPageLayout>
  );
}
