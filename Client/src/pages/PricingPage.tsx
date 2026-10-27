import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  PRICING_HTML_CLASSES,
  PRICING_INLINE_STYLES,
  PRICING_PAGE_TITLE,
  PRICING_STYLESHEET_HREFS,
  PricingContent,
} from './pricing/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';

const STYLE_DATA_ATTR = 'data-pricing-style';
const LINK_DATA_ATTR = 'data-pricing-stylesheet';
const PRICING_PRIMARY_TABS = new Set(['hire', 'manage', 'pay', 'equip']);

type PricingTabKey = 'hire' | 'manage' | 'pay' | 'equip';

type PricingPriceSpec = {
  prefix?: string;
  amount: string;
  label: string;
  note?: string;
};

type PricingCardSpec = {
  title: string;
  bestFor: string;
  featuresIntro?: string;
  prices?: PricingPriceSpec[];
  customPricingLabel?: string;
  customPricingDescription?: string;
  proAddonsTitle?: string;
  proAddonsBullets?: string[];
  bullets: string[];
  stripeColor: 'blue' | 'purple' | 'green' | 'green-dark' | 'yellow';
  groupLabel?: string;
};

type PricingSolutionColumnSpec = {
  title: string;
  forWhom: string;
  recommended: string[];
};

type PricingLocationSegmentSpec = {
  label: string;
  cards: PricingCardSpec[];
};

type PricingTabSpec = {
  activeTabBackground: string;
  activeTabTextColor: string;
  cards?: PricingCardSpec[];
  solutionFinderTitle?: string;
  solutionForWhomLabel?: string;
  solutionRecommendedLabel?: string;
  solutionColumns?: PricingSolutionColumnSpec[];
  locationToggleLabel?: string;
  locationSegments?: PricingLocationSegmentSpec[];
  footerTitle?: string;
  footerNote?: string;
};

const PRICING_TAB_CONTENT: Record<PricingTabKey, PricingTabSpec> = {
  hire: {
    activeTabBackground: '#C4B1F9',
    activeTabTextColor: '#FFFFFF',
    solutionFinderTitle: 'Which solution is right for my business?',
    solutionForWhomLabel: "Who it's for",
    solutionRecommendedLabel: 'Recommended for this stage',
    solutionColumns: [
      {
        title: 'Start globally',
        forWhom:
          'Best for teams making their first international hires—whether employees or contractors—without setting up local entities.',
        recommended: ['Contractor', 'Employer of Record (EOR)', 'Talent'],
      },
      {
        title: 'Scale compliantly',
        forWhom:
          'Best for scaling teams that want Deel to own compliance and classification risk across contractors and employees.',
        recommended: ['Contractor of Record', 'PEO', 'EOR', 'ATS & Talent'],
      },
      {
        title: 'Enterprise ready',
        forWhom:
          'Best for enterprise teams running a global hiring program with advanced legal, compliance, and sourcing needs.',
        recommended: ['Contractor of Record', 'EOR', 'Entity setup, management, or closure'],
      },
    ],
    cards: [
      {
        title: 'Find talent',
        bestFor:
          'Best for sourcing, screening, and hiring in one place. Works standalone or with any hire product.',
        prices: [{ prefix: 'Starting at', amount: '$14', label: 'per worker per month' }],
        bullets: [
          'Job posting and full pipeline visibility by stage',
          'AI-powered screening, offer generation, and interview scheduling',
          'AI interview summaries and feedback',
          'Access to vetted talent marketplace or talent partners',
          'End-to-end candidate management',
          'LinkedIn, Google Workspace, and productivity suite integrations',
        ],
        stripeColor: 'blue',
      },
      {
        title: 'Hire contractors',
        bestFor:
          'Best for engaging global contractors. Manage them yourself, or use Deel as Contractor of Record to minimize risks.',
        prices: [
          { prefix: 'Starting at', amount: '$49', label: 'per contractor per month' },
          { amount: '$325', label: 'per contractor of record per month' },
        ],
        bullets: [
          'Centralized contractor management',
          'Payments in 120+ currencies',
          'Automated invoicing',
          'Tax form guidance & document collection',
          'Multi-currency payments',
          'Worker classification compliance',
        ],
        stripeColor: 'blue',
      },
      {
        title: 'Hire full-time employees',
        bestFor:
          "Best for employing full-time workers globally. Use EOR to hire abroad without an entity, or PEO for your US team. For a limited time, get Deel's PEO for 3 months free*.",
        prices: [
          { prefix: 'Starting at', amount: '$125', label: 'per US PEO employee per month' },
          { amount: '$599', label: 'per EOR employee per month' },
        ],
        bullets: [
          'EOR: Full legal employment in 130+ countries globally',
          'US PEO: Co-employment across all 50 US states with benefits included',
          'Remote, on-site, and field worker arrangements',
          'Managed payroll, tax filings, and reporting across EOR and PEO employees',
          'Competitive global and US benefits—healthcare, dental, vision, mental health, fertility, and 401(k)',
          'Automated onboarding & compliance',
          'On-demand HR, legal, and tax expertise',
        ],
        stripeColor: 'blue',
      },
    ],
  },
  manage: {
    activeTabBackground: '#C4B1F9',
    activeTabTextColor: '#FFFFFF',
    cards: [
      {
        title: 'Core HR',
        bestFor: 'Best for teams needing a solid HRIS to manage people, documents, and compliance.',
        prices: [{ prefix: 'Starting at', amount: '$5', label: 'per employee per month' }],
        bullets: [
          'Worker profiles',
          'Time tracking & time off',
          'Job architecture',
          'Document management',
          'People analytics & dashboards',
          'Compliance insights',
          'AI help & insights',
        ],
        stripeColor: 'purple',
      },
      {
        title: 'Recruit',
        bestFor: 'Best for teams actively hiring who need an ATS built on their HRIS.',
        featuresIntro: 'Includes Core HR, plus:',
        prices: [{ prefix: 'Starting at', amount: '$14', label: 'per employee per month' }],
        proAddonsTitle: 'Pro add-ons — hire smarter & faster:',
        proAddonsBullets: [
          'AI Interview Assistant',
          'Multi-job board posting',
          'AI External Sourcing',
        ],
        bullets: [
          'ATS workflows & pipelines',
          'Job posting & candidate tracking',
          'Full pipeline visibility by stage',
          'Interview scheduling & feedback',
          'AI-powered screening & offers',
          'LinkedIn + productivity integrations',
        ],
        stripeColor: 'purple',
      },
      {
        title: 'Develop',
        bestFor: 'Best for teams focused on performance, growth, and long-term engagement.',
        featuresIntro: 'Includes Core HR, plus:',
        prices: [{ prefix: 'Starting at', amount: '$22', label: 'per employee per month' }],
        bullets: [
          'Goals & OKRs',
          'Performance review cycles',
          'Check-ins & instant feedback',
          'Learning management',
          'Career frameworks',
          'Personalized development plans',
          'Engagement & sentiment surveys',
        ],
        stripeColor: 'purple',
      },
      {
        title: 'Full Deel HR',
        bestFor: 'Best for teams wanting an end-to-end HR suite, from planning to offboarding.',
        featuresIntro: 'Everything in Core HR, Recruit and Develop, plus:',
        customPricingLabel: 'CUSTOM PRICING',
        customPricingDescription: "Tailored to your team - let's find the right fit",
        bullets: [
          'Compensation: Run structured pay reviews and manage salary bands using real HR and performance data.',
          'Workforce Planning: Model headcount, forecast costs, and plan scenarios before committing to decisions.',
          'Anonymous Reporting: Give employees a safe, compliant channel to report issues — with audit-ready workflows built in.',
          'Talent: Source ready-to-hire candidates through vetted agency partners or a curated marketplace of 1.5M+ profiles.',
        ],
        stripeColor: 'purple',
      },
      {
        title: 'Essential',
        bestFor: 'Track visas, permits, and workforce eligibility.',
        featuresIntro: 'Centralized immigration dashboard with:',
        groupLabel: 'Deel Mobility',
        bullets: [
          'Eligibility tool for work permits & visas',
          'Document & expiry tracker',
          'Non-national workforce & cost insights',
          'HRIS integrations',
          'Custom immigration reporting',
        ],
        stripeColor: 'purple',
      },
      {
        title: 'Pro',
        bestFor: 'Ensure right-to-work compliance globally.',
        featuresIntro: 'Everything in Essential plus:',
        bullets: [
          'Right to work verification',
          'Ongoing right to work tracker',
          'Compliance dashboards',
          'Expiry and compliance alerts',
          'Worker change notifications',
        ],
        stripeColor: 'purple',
      },
      {
        title: 'Managed',
        bestFor: 'Fully managed global immigration program.',
        featuresIntro: 'Deel handles your immigration program end-to-end including:',
        bullets: [
          'Automated renewals',
          'Employee data corrections',
          'New work permits',
          'Employment transfers',
          'Legislative change remediation',
        ],
        stripeColor: 'purple',
      },
      {
        title: 'Visas',
        bestFor: 'Manage global visas and work authorization.',
        featuresIntro: 'End-to-end case management for:',
        bullets: [
          'Business visa support',
          'Permanent visas',
          'Work authorization',
          'Permanent residency',
          'Right to work support',
          'EOR sponsorship',
        ],
        stripeColor: 'purple',
      },
    ],
  },
  pay: {
    activeTabBackground: '#C4B1F9',
    activeTabTextColor: '#FFFFFF',
    locationToggleLabel: 'Choose a location:',
    locationSegments: [
      {
        label: 'Global',
        cards: [
          {
            title: 'Deel Payroll: Global',
            bestFor:
              "Companies running payroll across multiple countries — with the flexibility to manage it themselves or rely on Deel's experts.",
            prices: [
              {
                prefix: 'Starting at',
                amount: '$29',
                label: 'per employee per month',
                note: 'Managed payroll across 130+ countries',
              },
              {
                prefix: 'Run payroll yourself',
                amount: '$25',
                label: 'per employee per month',
                note: 'Available in select countries, starting with Canada',
              },
            ],
            bullets: [
              'Managed payroll across 130+ countries',
              'Dedicated Deel Payroll Manager with managed payroll',
              'Run payroll yourself in select countries with real-time gross-to-net calculations',
              'Country-specific tax filings, statutory reporting and local compliance',
              'Multi-currency payroll with real-time reporting',
              'AI-assisted validation built into every payroll run',
            ],
            stripeColor: 'green',
          },
          {
            title: 'Pay contractors globally',
            bestFor:
              'Best for hiring global contractors with compliant contracts, multi-currency payments, and automated tax compliance.',
            prices: [{ prefix: 'Starting at', amount: '$49', label: 'per contractor per month' }],
            bullets: [
              'Centralized contractor management',
              'Compliant contracts',
              'Automated invoicing',
              'Tax form guidance and document collection',
            ],
            stripeColor: 'green',
          },
          {
            title: 'Hire and pay employees globally',
            bestFor:
              'Best for hiring full-time employees abroad without a legal entity, using Deel as EOR.',
            prices: [{ prefix: 'Starting at', amount: '$599', label: 'per employee per month' }],
            bullets: [
              'Full legal employment in 150+ countries — no entity needed',
              'Support for remote, on-site, and field workers',
              'Automated onboarding and compliance',
              'Benefits enrollment',
              'Managed payroll, tax filings, and reporting',
              'On-demand HR and legal expertise',
              '24/7 support',
            ],
            stripeColor: 'green',
          },
          {
            title: 'Benefits Management: Global',
            groupLabel: 'Add-On',
            bestFor: 'Best for companies on Deel Payroll wanting to manage benefits in the same system.',
            prices: [{ prefix: 'Starting at', amount: '$10', label: 'per employee per month' }],
            bullets: [
              "Payroll-synced deductions, so there's no reconciliation",
              'Employee enrollment and qualifying life events',
              'Renewal reporting and carrier integration',
              "Plan quotes through Deel's broker network",
              'Benefits administration in 130+ countries',
            ],
            stripeColor: 'green',
          },
        ],
      },
      {
        label: 'US',
        cards: [
          {
            title: 'Deel Payroll: US',
            bestFor: "Best for US companies needing compliant payroll—managed by you or Deel's experts.",
            prices: [{ prefix: 'Starting at', amount: '$29', label: 'per employee per month (self-service)' }],
            bullets: [
              'Self-serve or managed payroll across all 50 states',
              'Automated federal, state, and local tax logic',
              'W-2, W-4, and new-hire reporting handled automatically',
              'Compliance alerts, approval workflows, and error checks',
              'Dedicated Deel Payroll Manager included with managed',
              'Manage US and global payroll from one Deel platform',
            ],
            stripeColor: 'green-dark',
          },
          {
            title: 'PEO',
            bestFor:
              "Best for full-service US payroll, benefits, HR, and compliance. Requires a legal entity. For a limited time, get Deel's PEO for 3 months free*.",
            prices: [{ prefix: 'Starting at', amount: '$125', label: 'per employee per month' }],
            bullets: [
              'Payroll, tax, and health benefits managed by Deel',
              'Ongoing Deel support from payroll, HR, and compliance experts',
              'All-in-one HR without costly overhead',
              'State registrations and compliance setup done for you',
              "Workers' compensation coverage and compliance monitoring for business protection",
            ],
            stripeColor: 'green-dark',
          },
          {
            title: 'Benefits Management: Global',
            groupLabel: 'Add-On',
            bestFor: 'Companies on Deel Payroll that want to manage benefits in the same system they run payroll.',
            prices: [{ prefix: 'Starting at', amount: '$10', label: 'per employee per month' }],
            bullets: [
              "Payroll-synced deductions, so there's no reconciliation",
              'Employee enrollment and qualifying life events',
              'Renewal reporting and carrier integration',
              "Plan quotes through Deel's broker network",
              'Benefits administration in 130+ countries',
            ],
            stripeColor: 'green-dark',
          },
        ],
      },
    ],
  },
  equip: {
    activeTabBackground: '#C4B1F9',
    activeTabTextColor: '#FFFFFF',
    footerTitle: 'Any individual item in a bundle can also be purchased standalone.',
    footerNote: '*Managed: Fully set up, monitored, and maintained by the Deel IT team',
    cards: [
      {
        title: 'Starter',
        bestFor:
          'Best for core IT coverage (device lifecycle, security, and endpoint protection) without the overhead.',
        prices: [{ prefix: 'Starting at', amount: '$49', label: 'per user per month' }],
        bullets: [
          'Deel IT Platform',
          'Device Lifecycle Management (DLM)* — ship, retrieve, repair, and store laptops globally',
          'Mobile Device Management (MDM)* — secure and control every device',
          'Endpoint Protection (EPP)* — automatic, always-on protection across every device',
        ],
        stripeColor: 'yellow',
      },
      {
        title: 'Growth',
        bestFor:
          'Best for core IT coverage plus live, always-on support for device and software issues.',
        prices: [{ prefix: 'Starting at', amount: '$139', label: 'per user per month' }],
        bullets: [
          'Deel IT Platform',
          'Device Lifecycle Management (DLM)* — ship, retrieve, repair, and store laptops globally',
          'Mobile Device Management (MDM)* — secure and control every device',
          'Endpoint Protection (EPP)* — automatic, always-on protection across every device',
          '24/7 Global IT Support* — live help for device and software issues',
        ],
        stripeColor: 'yellow',
      },
      {
        title: 'Scale',
        bestFor:
          'Best for everything in Growth, plus centralized access management across a global workforce.',
        prices: [{ prefix: 'Starting at', amount: '$149', label: 'per user per month' }],
        bullets: [
          'Deel IT Platform',
          'Device Lifecycle Management (DLM)* — ship, retrieve, repair, and store laptops globally',
          'Mobile Device Management (MDM) — secure and control every device',
          'Endpoint Protection (EPP)* — automatic, always-on protection across every device',
          '24/7 Global IT Support* — live help for device and software issues',
          'Access Management* — add or remove app access automatically',
        ],
        stripeColor: 'yellow',
      },
    ],
  },
};

const PRICING_STRIPE_COLORS: Record<PricingCardSpec['stripeColor'], string> = {
  blue: '#B1D8FC',
  purple: '#D6C9FD',
  green: '#8DDFA5',
  'green-dark': '#6AB585',
  yellow: '#FFCF25',
};

const TRUSTED_LOGO_ROWS = [
  [
    '/deel-assets/images/website-media.deel.com/muji_a588e76130-79c99911.svg',
    '/deel-assets/images/website-media.deel.com/Logoki_ba7b794e12-19a34463.svg',
    '/dechub-assets/trusted-logos/download%20%282%29.png',
    '/deel-assets/images/website-media.deel.com/Balenciaga_Logo_3c70c251ee-4716d7d1.svg',
    '/dechub-assets/trusted-logos/download%20%283%29.png',
    '/deel-assets/images/website-media.deel.com/Canva_Logo_1_90c23958f7-58831325.svg',
    '/deel-assets/images/website-media.deel.com/hm_f015e3fc5e-df43edbf.svg',
    '/dechub-assets/trusted-logos/fastrack-potBj1Kr.png',
    '/dechub-assets/trusted-logos/tanishq_logo.png',
    '/deel-assets/images/website-media.deel.com/Ericsson_logo_2_15f0a199be-afc8b63f.svg',
    '/deel-assets/images/website-media.deel.com/logo_investor_neo_fd6a4b0bf1-56add72b.svg',
    '/dechub-assets/trusted-logos/download.png',
    '/deel-assets/images/website-media.deel.com/logo_investor_emerson_collective_e323c76cee-365ebe97.svg',
    '/dechub-assets/trusted-logos/download%20%281%29.png',
    '/deel-assets/images/website-media.deel.com/logo_investor_spark_capital_857a9a1fac-475b4913.svg',
  ],
  [
    '/deel-assets/images/website-media.deel.com/re_logo_b11ff3c938-a965a859.svg',
    '/dechub-assets/trusted-logos/download%20%285%29.png',
    '/deel-assets/images/website-media.deel.com/Door_Dash_Logo_e52471ae77-3e414f35.svg',
    '/deel-assets/images/website-media.deel.com/logo_KLM_2dcf79f5c9-ac109213.svg',
    '/dechub-assets/trusted-logos/tanishq_logo.png',
    '/dechub-assets/trusted-logos/download.png',
    '/deel-assets/images/website-media.deel.com/Lucid_Motors_logo_289a758b49-01664677.svg',
    '/deel-assets/images/website-media.deel.com/puma_logo_8574e3d454-a88b84ed.svg',
    '/dechub-assets/trusted-logos/download%20%281%29.png',
    '/deel-assets/images/website-media.deel.com/lockhead_logo_aac9270f83-5a48a4b4.svg',
    '/deel-assets/images/website-media.deel.com/Zillow_logo_1_5c75d27ffc-66b46f3e.svg',
    '/dechub-assets/trusted-logos/download%20%282%29.png',
    '/deel-assets/images/website-media.deel.com/linkedin_logo_4a30bc2ea7-c6addbce.svg',
    '/deel-assets/images/website-media.deel.com/rol_8afbc30081-d2317192.svg',
  ],
] as const;

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function createTrustedLogoTrack(logos: readonly string[], options?: { secondary?: boolean; reverse?: boolean }) {
  const viewport = document.createElement('div');
  viewport.className = 'deel-logo-strip__viewport';

  const track = document.createElement('div');
  track.className = [
    'deel-logo-strip__track',
    options?.secondary ? 'deel-logo-strip__track--secondary' : '',
    options?.reverse ? 'deel-logo-strip__track--reverse' : '',
  ]
    .filter(Boolean)
    .join(' ');

  [...logos, ...logos].forEach((src, index) => {
    const image = document.createElement('img');
    image.src = src;
    image.alt = '';
    image.loading = index < logos.length ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.className = 'deel-logo-strip__logo';
    track.appendChild(image);
  });

  viewport.appendChild(track);
  return viewport;
}

function wireTrustedCompaniesStrip(root: HTMLElement) {
  const brokenSection = root.querySelector<HTMLElement>('section.logo-stripe-standard-wrapper');
  if (!brokenSection) {
    return;
  }

  brokenSection.className = 'logo-stripe-standard-wrapper deel-logo-strip';
  brokenSection.style.paddingTop = '64px';
  brokenSection.style.paddingRight = '32px';
  brokenSection.style.paddingBottom = '64px';
  brokenSection.style.paddingLeft = '32px';
  brokenSection.innerHTML = '';

  const inner = document.createElement('div');
  inner.className = 'deel-logo-strip__inner';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'deel-logo-strip__eyebrow';
  eyebrow.textContent = 'Trusted by 50+ companies from startups to enterprise';

  const rows = document.createElement('div');
  rows.className = 'deel-logo-strip__rows';
  rows.appendChild(createTrustedLogoTrack(TRUSTED_LOGO_ROWS[0]));
  rows.appendChild(createTrustedLogoTrack(TRUSTED_LOGO_ROWS[1], { secondary: true, reverse: true }));

  inner.append(eyebrow, rows);
  brokenSection.appendChild(inner);
}

function removeKeyFiguresBottomPadding(root: HTMLElement) {
  const heading = Array.from(root.querySelectorAll<HTMLElement>('h1, h2, h3, p')).find((element) =>
    (element.textContent ?? '').includes('Deel makes growing remote and international teams effortless'),
  );

  if (!heading) {
    return;
  }

  const wrapper = heading.closest<HTMLElement>('.key-figures-wrapper') ?? heading.parentElement?.parentElement;
  if (!wrapper) {
    return;
  }

  wrapper.style.paddingBottom = '0';
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

function wireTabs(root: HTMLElement) {
  const tabLists = Array.from(root.querySelectorAll<HTMLElement>('[role="tablist"]'));
  const cleanupFns = tabLists.map((tabList, listIndex) => {
    const tabs = Array.from(tabList.querySelectorAll<HTMLElement>('[role="tab"]'));
    if (tabs.length === 0) {
      return () => undefined;
    }

    const isPricingPrimaryTabList = tabs.some((tab) => {
      const normalizedId = tab.id.replace(/^#/, '').toLowerCase();
      return PRICING_PRIMARY_TABS.has(normalizedId);
    });

    if (isPricingPrimaryTabList) {
      return () => undefined;
    }

    const tabContainer = tabList.closest('.MuiTabs-root') ?? tabList.parentElement;
    const panels = Array.from(
      tabContainer?.parentElement?.querySelectorAll<HTMLElement>('[role="tabpanel"]') ?? [],
    );

    const activateTab = (nextTab: HTMLElement) => {
      tabs.forEach((tab, tabIndex) => {
        const selected = tab === nextTab;
        const generatedId = tab.id || `pricing-tab-${listIndex}-${tabIndex}`;
        const generatedPanelId = `pricing-tabpanel-${listIndex}-${tabIndex}`;

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

        const generatedId = linkedTab.id || `pricing-tab-${listIndex}-${panelIndex}`;
        const generatedPanelId = `pricing-tabpanel-${listIndex}-${panelIndex}`;

        linkedTab.id = generatedId;
        linkedTab.setAttribute('aria-controls', generatedPanelId);
        panel.id = generatedPanelId;
        panel.setAttribute('aria-labelledby', generatedId);
      });
    };

    const disposers = tabs.map((tab, tabIndex) => {
      tab.id ||= `pricing-tab-${listIndex}-${tabIndex}`;

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

function createTextElement(tagName: keyof HTMLElementTagNameMap, className: string, text: string) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createCheckList(bullets: string[]) {
  const wrapper = document.createElement('div');
  wrapper.className =
    'check-list fixed-gap [&_li]:relative [&_li]:pl-8 [&_li]:bg-no-repeat [&_li]:bg-[image:var(--li-icon)]! [&_ul]:!gap-nano [&_li]:bg-[position:0_6px]! MuiBox-root mui-1pmdlgt';

  const list = document.createElement('ul');
  bullets.forEach((bullet) => {
    const item = document.createElement('li');
    item.textContent = bullet;
    list.appendChild(item);
  });

  wrapper.appendChild(list);
  return wrapper;
}

function createPriceBlocks(spec: PricingCardSpec) {
  if (!spec.prices?.length && !spec.customPricingLabel) {
    return null;
  }

  const priceContainer = document.createElement('div');
  priceContainer.className = 'mt-auto flex flex-col gap-sm';
  priceContainer.setAttribute('data-pricing-card-prices', 'true');

  if (spec.customPricingLabel) {
    const customPricingBlock = document.createElement('div');
    customPricingBlock.className = 'flex flex-col gap-quark';
    customPricingBlock.appendChild(
      createTextElement(
        'span',
        'm-0 text-tertiary paragraph-small-semibold font-[700] tracking-[0.01em] text-content-primary!',
        spec.customPricingLabel,
      ),
    );

    if (spec.customPricingDescription) {
      customPricingBlock.appendChild(
        createTextElement('span', 'paragraph-medium text-tertiary text-content-secondary', spec.customPricingDescription),
      );
    }

    priceContainer.appendChild(customPricingBlock);
    return priceContainer;
  }

  (spec.prices ?? []).forEach((price) => {
    const priceBlock = document.createElement('div');
    priceBlock.className = 'flex flex-col gap-quark';

    if (price.prefix) {
      priceBlock.appendChild(
        createTextElement('span', 'm-0 text-tertiary paragraph-small tracking-[0.01em] text-content-primary!', price.prefix),
      );
    }

    const row = document.createElement('div');
    row.className = 'flex flex-wrap items-end gap-2';
    row.appendChild(
      createTextElement(
        'span',
        'price-label font-bagoss-extended! text-[44px] font-[600] leading-[46px] text-primary',
        price.amount,
      ),
    );
    row.appendChild(createTextElement('span', 'paragraph-medium text-tertiary', price.label));

    priceBlock.appendChild(row);

    if (price.note) {
      priceBlock.appendChild(createTextElement('span', 'paragraph-medium text-tertiary', price.note));
    }

    priceContainer.appendChild(priceBlock);
  });

  return priceContainer;
}

function createPricingCardShell(baseTemplate: HTMLElement, standaloneRow = false) {
  const shell = baseTemplate.cloneNode(false) as HTMLElement;

  if (standaloneRow) {
    shell.className = shell.className
      .replace(/\btablet:row-span-3\b/g, '')
      .replace(/\btablet:grid-rows-subgrid\b/g, '')
      .replace(/\btablet:grid\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  shell.innerHTML = '';

  const stripeTemplate = baseTemplate.children[0] instanceof HTMLElement ? (baseTemplate.children[0] as HTMLElement) : null;
  const stripe = document.createElement('div');
  stripe.className = stripeTemplate?.className ?? '';
  stripe.style.position = 'absolute';
  stripe.style.left = '0';
  stripe.style.right = '0';
  stripe.style.top = '0';
  stripe.style.height = stripeTemplate?.style.height || '16px';
  stripe.style.borderTopLeftRadius = 'inherit';
  stripe.style.borderTopRightRadius = 'inherit';

  const topContent = document.createElement('div');
  const buttonWrap = document.createElement('div');
  const featuresWrap = document.createElement('div');

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Book a demo';
  button.setAttribute('data-demo-trigger', 'true');
  button.style.display = 'flex';
  button.style.width = '100%';
  button.style.minHeight = '56px';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.border = '0';
  button.style.borderRadius = '9999px';
  button.style.backgroundColor = '#1B1B1B';
  button.style.color = '#FFFFFF';
  button.style.fontSize = '18px';
  button.style.fontWeight = '600';
  button.style.lineHeight = '1.2';
  button.style.cursor = 'pointer';
  button.style.position = 'static';
  button.style.transform = 'none';
  button.style.margin = '0';
  button.style.padding = '16px 24px';
  buttonWrap.appendChild(button);

  shell.append(stripe, topContent, buttonWrap, featuresWrap);
  return shell;
}

function renderPricingCard(card: HTMLElement, spec: PricingCardSpec) {
  card.style.padding = '8%';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.justifyContent = 'flex-start';
  card.style.alignItems = 'stretch';
  card.style.gridTemplateRows = 'none';
  card.style.height = '100%';

  const stripe = card.children[0];
  if (stripe instanceof HTMLElement) {
    stripe.style.backgroundColor = PRICING_STRIPE_COLORS[spec.stripeColor];
    stripe.style.left = '0';
    stripe.style.right = '0';
    stripe.style.top = '0';
  }

  const topContent = card.children[1];
  if (topContent instanceof HTMLElement) {
    topContent.style.order = '1';
    topContent.style.flex = '0 0 auto';
    topContent.style.display = 'flex';
    topContent.style.flexDirection = 'column';
    topContent.style.justifyContent = 'flex-start';
    topContent.style.alignItems = 'stretch';
    topContent.style.position = 'static';
    topContent.style.inset = 'auto';
    topContent.style.transform = 'none';
    topContent.style.margin = '0';
    topContent.style.padding = '0';
    topContent.innerHTML = '';

    if (spec.groupLabel) {
      topContent.appendChild(
        createTextElement(
          'p',
          'm-0 text-tertiary overline-large-medium uppercase text-content-secondary!',
          spec.groupLabel,
        ),
      );
    }

    topContent.appendChild(
      createTextElement('h3', 'text-balance m-0 heading-h4 font-feature-2 text-primary', spec.title),
    );

    const descriptionBlock = document.createElement('div');
    descriptionBlock.className = 'flex flex-col gap-quark';
    descriptionBlock.setAttribute('data-pricing-card-description', 'true');
    descriptionBlock.appendChild(
      createTextElement(
        'p',
        'text-balance m-0 heading-h6 hidden font-feature-2 text-primary',
        'Best for',
      ),
    );
    descriptionBlock.appendChild(
      createTextElement(
        'p',
        'm-0 text-tertiary paragraph-medium font-feature-1 text-content-secondary',
        spec.bestFor,
      ),
    );

    const priceBlocks = createPriceBlocks(spec);
    topContent.appendChild(descriptionBlock);
    if (priceBlocks) {
      topContent.appendChild(priceBlocks);
    }

    if (!spec.prices?.length && !spec.customPricingLabel) {
      descriptionBlock.style.minHeight = '72px';
      topContent.style.minHeight = '0';
      topContent.style.justifyContent = 'flex-start';
      topContent.style.rowGap = '12px';
      topContent.style.height = '156px';
    }
  }

  const buttonWrap = card.children[2];
  if (buttonWrap instanceof HTMLElement) {
    buttonWrap.style.order = '2';
    buttonWrap.style.flex = '0 0 auto';
    buttonWrap.style.display = 'block';
    buttonWrap.style.position = 'static';
    buttonWrap.style.inset = 'auto';
    buttonWrap.style.left = 'auto';
    buttonWrap.style.right = 'auto';
    buttonWrap.style.top = 'auto';
    buttonWrap.style.bottom = 'auto';
    buttonWrap.style.transform = 'none';
    buttonWrap.style.width = '100%';
    buttonWrap.style.minHeight = '0';
    buttonWrap.style.marginTop = '0';
    buttonWrap.style.marginBottom = '0';
    buttonWrap.style.paddingTop = '4%';
    buttonWrap.style.paddingBottom = '4%';

    if (!spec.prices?.length && !spec.customPricingLabel) {
      buttonWrap.style.paddingTop = '12px';
      buttonWrap.style.paddingBottom = '16px';
    }

    const button = buttonWrap.querySelector<HTMLButtonElement>('button');
    if (button) {
      button.setAttribute('data-demo-trigger', 'true');
      button.style.position = 'static';
      button.style.transform = 'none';
      button.style.margin = '0';
      button.style.width = '100%';
    }
  }

  const featuresWrap = card.children[3];
  if (featuresWrap instanceof HTMLElement) {
    featuresWrap.style.order = '3';
    featuresWrap.style.flex = '0 0 auto';
    featuresWrap.style.position = 'static';
    featuresWrap.style.inset = 'auto';
    featuresWrap.style.transform = 'none';
    featuresWrap.style.margin = '0';
    featuresWrap.style.padding = '0';
    featuresWrap.innerHTML = '';
    const featuresStack = document.createElement('div');
    featuresStack.className = 'flex flex-col gap-sm';

    featuresStack.appendChild(
      createTextElement('p', 'm-0 mt-4 text-balance heading-h6 font-feature-2 text-primary', "What's included?"),
    );

    if (spec.featuresIntro) {
      featuresStack.appendChild(
        createTextElement('p', 'm-0 text-tertiary paragraph-small-semibold text-content-primary!', spec.featuresIntro),
      );
    }

    featuresStack.appendChild(createCheckList(spec.bullets));

    if (spec.proAddonsTitle && spec.proAddonsBullets?.length) {
      const addOnBlock = document.createElement('div');
      addOnBlock.className = 'flex flex-col gap-nano';
      addOnBlock.appendChild(
        createTextElement('p', 'm-0 text-tertiary paragraph-small-semibold text-content-primary!', spec.proAddonsTitle),
      );
      addOnBlock.appendChild(createCheckList(spec.proAddonsBullets));
      featuresStack.appendChild(addOnBlock);
    }

    featuresWrap.appendChild(featuresStack);
  }
}

function normalizePricingCardContentHeights(sectionGrid: HTMLElement) {
  const cards = Array.from(sectionGrid.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
  const descriptionBlocks = cards
    .map((card) => {
      const topContent = card.children[1];
      const description = card.querySelector<HTMLElement>('[data-pricing-card-description="true"]');
      return topContent instanceof HTMLElement && description instanceof HTMLElement
        ? { card, topContent, description }
        : null;
    })
    .filter((entry): entry is { card: HTMLElement; topContent: HTMLElement; description: HTMLElement } => entry !== null);
  const priceBlocks = cards
    .map((card) => {
      const topContent = card.children[1];
      const prices = card.querySelector<HTMLElement>('[data-pricing-card-prices="true"]');
      return topContent instanceof HTMLElement && prices instanceof HTMLElement ? { card, topContent, prices } : null;
    })
    .filter((entry): entry is { card: HTMLElement; topContent: HTMLElement; prices: HTMLElement } => entry !== null);

  descriptionBlocks.forEach(({ topContent, description }) => {
    topContent.style.height = 'auto';
    topContent.style.minHeight = '0';
    description.style.height = 'auto';
    description.style.minHeight = '0';
  });
  priceBlocks.forEach(({ prices }) => {
    prices.style.height = 'auto';
    prices.style.minHeight = '0';
  });

  const rows = new Map<number, { topContent: HTMLElement; description: HTMLElement }[]>();
  descriptionBlocks.forEach((entry) => {
    const rowKey = entry.card.offsetTop;
    const rowEntries = rows.get(rowKey) ?? [];
    rowEntries.push(entry);
    rows.set(rowKey, rowEntries);
  });
  const priceRows = new Map<number, { topContent: HTMLElement; prices: HTMLElement }[]>();
  priceBlocks.forEach((entry) => {
    const rowKey = entry.card.offsetTop;
    const rowEntries = priceRows.get(rowKey) ?? [];
    rowEntries.push(entry);
    priceRows.set(rowKey, rowEntries);
  });

  rows.forEach((rowEntries) => {
    const maxDescriptionHeight = rowEntries.reduce(
      (largest, entry) => Math.max(largest, entry.description.offsetHeight),
      0,
    );

    rowEntries.forEach(({ topContent, description }) => {
      const topContentBaseHeight = topContent.offsetHeight - description.offsetHeight;
      description.style.height = `${maxDescriptionHeight}px`;
      topContent.style.height = `${topContentBaseHeight + maxDescriptionHeight}px`;
    });
  });
  priceRows.forEach((rowEntries) => {
    const maxPriceHeight = rowEntries.reduce((largest, entry) => Math.max(largest, entry.prices.offsetHeight), 0);

    rowEntries.forEach(({ topContent, prices }) => {
      const topContentBaseHeight = topContent.offsetHeight - prices.offsetHeight;
      prices.style.height = `${maxPriceHeight}px`;
      topContent.style.height = `${topContentBaseHeight + maxPriceHeight}px`;
    });
  });
}

function renderSolutionFinder(accordionCard: HTMLElement, spec: PricingTabSpec) {
  const wasExpanded =
    accordionCard.getAttribute('data-solution-finder-expanded') === 'true' ||
    accordionCard.querySelector<HTMLButtonElement>('button[aria-expanded]')?.getAttribute('aria-expanded') === 'true';

  accordionCard.innerHTML = '';
  accordionCard.style.display = 'block';
  accordionCard.style.width = '100%';
  accordionCard.style.maxWidth = '100%';
  accordionCard.style.overflow = 'hidden';
  accordionCard.style.minHeight = '0';
  accordionCard.style.height = 'auto';
  accordionCard.style.boxSizing = 'border-box';
  accordionCard.style.position = 'relative';
  accordionCard.style.background = '#FFFFFF';
  accordionCard.style.paddingBottom = '0';
  accordionCard.style.marginTop = '24px';
  accordionCard.style.marginBottom = '32px';

  const stripe = document.createElement('div');
  stripe.style.position = 'relative';
  stripe.style.width = '100%';
  stripe.style.height = '12px';
  stripe.style.flexShrink = '0';
  stripe.style.backgroundColor = PRICING_STRIPE_COLORS.blue;
  stripe.style.borderTopLeftRadius = 'inherit';
  stripe.style.borderTopRightRadius = 'inherit';

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.setAttribute('aria-expanded', wasExpanded ? 'true' : 'false');
  toggleButton.style.display = 'flex';
  toggleButton.style.width = '100%';
  toggleButton.style.minHeight = '88px';
  toggleButton.style.alignItems = 'center';
  toggleButton.style.justifyContent = 'center';
  toggleButton.style.gap = '8px';
  toggleButton.style.border = '0';
  toggleButton.style.background = '#FFFFFF';
  toggleButton.style.position = 'relative';
  toggleButton.style.zIndex = '1';
  toggleButton.style.boxSizing = 'border-box';
  toggleButton.style.padding = '24px 24px 24px';
  toggleButton.style.flexShrink = '0';

  const title = createTextElement(
    'span',
    'text-balance m-0 heading-h6 font-feature-2 text-primary',
    spec.solutionFinderTitle ?? '',
  );
  toggleButton.appendChild(title);

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('viewBox', '0 0 20 20');
  icon.setAttribute('width', '20');
  icon.setAttribute('height', '20');
  icon.style.display = 'block';
  icon.style.width = '20px';
  icon.style.height = '20px';
  icon.style.flexShrink = '0';
  icon.style.transition = 'transform 280ms ease';
  icon.style.transformOrigin = '50% 50%';
  icon.style.overflow = 'visible';

  const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath.setAttribute('d', 'M6 8.5L10 12.5L14 8.5');
  iconPath.setAttribute('fill', 'none');
  iconPath.setAttribute('stroke', '#1B1B1B');
  iconPath.setAttribute('stroke-width', '1.75');
  iconPath.setAttribute('stroke-linecap', 'round');
  iconPath.setAttribute('stroke-linejoin', 'round');
  icon.appendChild(iconPath);
  toggleButton.appendChild(icon);

  const content = document.createElement('div');
  content.className =
    'grid grid-cols-1 gap-xl px-md pb-xl tablet:grid-cols-3 tablet:gap-0';

  (spec.solutionColumns ?? []).forEach((column, index) => {
    const columnElement = document.createElement('div');
    columnElement.className = 'flex flex-col gap-sm tablet:px-lg tablet:first:pl-0 tablet:last:pr-0';
    columnElement.style.padding = '24px';
    columnElement.style.boxSizing = 'border-box';
    columnElement.style.position = 'relative';

    if (index > 0) {
      const divider = document.createElement('div');
      divider.style.position = 'absolute';
      divider.style.left = '0';
      divider.style.top = '24px';
      divider.style.bottom = '24px';
      divider.style.width = '1px';
      divider.style.backgroundColor = 'rgba(27, 27, 27, 0.16)';
      columnElement.appendChild(divider);
    }

    columnElement.appendChild(
      createTextElement('h3', 'text-balance m-0 heading-h4 font-feature-2 text-primary', column.title),
    );

    const forWhomBlock = document.createElement('div');
    forWhomBlock.className = 'flex flex-col gap-quark';
    forWhomBlock.appendChild(
      createTextElement(
        'p',
        'm-0 text-tertiary paragraph-small-semibold text-content-primary!',
        spec.solutionForWhomLabel ?? "Who it's for",
      ),
    );
    forWhomBlock.appendChild(
      createTextElement('p', 'm-0 text-tertiary paragraph-small text-content-secondary', column.forWhom),
    );

    const recommendedBlock = document.createElement('div');
    recommendedBlock.className = 'flex flex-col gap-nano';
    recommendedBlock.appendChild(
      createTextElement(
        'p',
        'm-0 text-tertiary paragraph-small-semibold text-content-primary!',
        spec.solutionRecommendedLabel ?? 'Recommended for this stage',
      ),
    );
    recommendedBlock.appendChild(createCheckList(column.recommended));

    columnElement.append(forWhomBlock, recommendedBlock);
    content.appendChild(columnElement);
  });

  const contentWrapper = document.createElement('div');
  contentWrapper.style.display = 'block';
  contentWrapper.style.width = '100%';
  contentWrapper.style.margin = '0';
  contentWrapper.style.padding = '0';
  contentWrapper.style.overflow = 'hidden';
  contentWrapper.style.height = '0px';
  contentWrapper.style.opacity = '0';
  contentWrapper.style.pointerEvents = 'none';
  contentWrapper.style.transition = 'height 280ms ease, opacity 220ms ease';

  const overflow = document.createElement('div');
  overflow.className = 'overflow-hidden';
  overflow.style.transformOrigin = 'top center';
  overflow.style.transition = 'transform 280ms ease, opacity 220ms ease';
  overflow.style.transform = 'translateY(-8px)';
  overflow.style.opacity = '0';
  overflow.appendChild(content);
  contentWrapper.appendChild(overflow);

  accordionCard.append(stripe, toggleButton, contentWrapper);

  const setExpanded = (expanded: boolean) => {
    accordionCard.setAttribute('data-solution-finder-expanded', expanded ? 'true' : 'false');
    toggleButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');

    if (expanded) {
      contentWrapper.style.height = `${overflow.scrollHeight}px`;
    } else {
      if (contentWrapper.style.height === 'auto') {
        contentWrapper.style.height = `${overflow.scrollHeight}px`;
        void contentWrapper.offsetHeight;
      }
      contentWrapper.style.height = '0px';
    }

    contentWrapper.style.opacity = expanded ? '1' : '0';
    contentWrapper.style.pointerEvents = expanded ? 'auto' : 'none';
    overflow.style.transform = expanded ? 'translateY(0)' : 'translateY(-8px)';
    overflow.style.opacity = expanded ? '1' : '0';
    icon.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
  };

  const toggle = () => setExpanded(toggleButton.getAttribute('aria-expanded') !== 'true');
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  };

  contentWrapper.addEventListener('transitionend', () => {
    if (toggleButton.getAttribute('aria-expanded') === 'true') {
      contentWrapper.style.height = 'auto';
    }
  });
  toggleButton.addEventListener('click', toggle);
  toggleButton.addEventListener('keydown', handleKeyDown);

  setExpanded(wasExpanded);
}

function wirePricingPrimaryTabs(root: HTMLElement) {
  const tabList = Array.from(root.querySelectorAll<HTMLElement>('[role="tablist"]')).find((element) =>
    Array.from(element.querySelectorAll<HTMLElement>('[role="tab"]')).some((tab) =>
      PRICING_PRIMARY_TABS.has(tab.id.replace(/^#/, '').toLowerCase()),
    ),
  );

  if (!tabList) {
    return () => undefined;
  }

  const tabs = Array.from(tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]')).filter((tab) =>
    PRICING_PRIMARY_TABS.has(tab.id.replace(/^#/, '').toLowerCase()),
  );

  const pricingSection = Array.from(root.querySelectorAll<HTMLElement>('section')).find((section) => {
    const text = section.textContent ?? '';
    return text.includes('Find talent') && text.includes('Hire contractors');
  });

  if (!pricingSection || tabs.length === 0) {
    return () => undefined;
  }

  const sectionGrid = Array.from(pricingSection.querySelectorAll<HTMLElement>('div')).find((element) =>
    element.className.includes('grid grid-cols-1 gap-x-xs tablet:grid-cols-2 lg:grid-cols-3'),
  );
  const cardStack = Array.from(pricingSection.querySelectorAll<HTMLElement>('div')).find((element) =>
    element.className.includes('flex flex-col gap-md'),
  );
  const pricingRoot = pricingSection.parentElement;
  const accordionCard =
    pricingRoot &&
    Array.from(pricingRoot.querySelectorAll<HTMLElement>('div')).find((element) => {
      if (!element.className.includes('relative w-full overflow-hidden rounded-md bg-white shadow-elevation-2dp')) {
        return false;
      }

      const text = element.textContent ?? '';
      return text.includes('Which solution is right for my business?');
    });
  const pricingEyebrow = Array.from(root.querySelectorAll<HTMLParagraphElement>('p')).find(
    (element) => element.textContent?.trim() === 'Pricing',
  );
  if (!sectionGrid || !cardStack) {
    return () => undefined;
  }

  if (pricingEyebrow) {
    pricingEyebrow.style.marginTop = '8%';
  }

  sectionGrid.style.marginTop = '2%';
  sectionGrid.style.rowGap = '40px';

  const baseTemplates = Array.from(sectionGrid.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
  let currentPayLocation = 'Global';
  let activePricingTab: PricingTabKey = 'hire';

  const activeTabIndicator = document.createElement('div');
  activeTabIndicator.className =
    'pointer-events-none absolute left-0 top-0 rounded-xl md:rounded-t-xl rounded-b-none';
  activeTabIndicator.style.zIndex = '0';
  activeTabIndicator.style.transition =
    'transform 260ms ease, width 260ms ease, height 260ms ease, background-color 200ms ease';
  activeTabIndicator.style.willChange = 'transform, width, height, background-color';
  tabList.insertBefore(activeTabIndicator, tabList.firstChild);

  const payLocationControls = document.createElement('div');
  payLocationControls.className = 'hidden flex flex-col gap-xs px-xxxs';
  cardStack.insertBefore(payLocationControls, sectionGrid);

  const groupedSectionHeading = document.createElement('div');
  groupedSectionHeading.className = 'hidden flex flex-col gap-sm px-xxxs';
  groupedSectionHeading.style.marginTop = '16px';
  groupedSectionHeading.style.marginBottom = '8px';
  cardStack.insertBefore(groupedSectionHeading, sectionGrid.nextSibling);

  const groupedSectionGrid = sectionGrid.cloneNode(false) as HTMLElement;
  groupedSectionGrid.className = sectionGrid.className;
  groupedSectionGrid.style.display = 'none';
  cardStack.insertBefore(groupedSectionGrid, groupedSectionHeading.nextSibling);

  const pricingFooter = document.createElement('div');
  pricingFooter.className = 'hidden flex flex-col gap-quark px-xxxs';
  cardStack.appendChild(pricingFooter);

  const syncPricingLayout = () => {
    applyPricingGridLayout(activePricingTab);
    normalizePricingCardContentHeights(sectionGrid);
    if (groupedSectionGrid.style.display !== 'none' && groupedSectionGrid.children.length > 0) {
      normalizePricingCardContentHeights(groupedSectionGrid);
    }
    updateActiveTabIndicator(activePricingTab);
  };

  const schedulePricingLayoutSync = () => {
    syncPricingLayout();
    window.requestAnimationFrame(() => {
      syncPricingLayout();
      window.requestAnimationFrame(() => {
        syncPricingLayout();
      });
    });
    window.setTimeout(syncPricingLayout, 120);
    window.setTimeout(syncPricingLayout, 320);
  };

  const renderCardsInto = (
    targetGrid: HTMLElement,
    cards: PricingCardSpec[],
    options?: { standaloneRow?: boolean },
  ) => {
    targetGrid.innerHTML = '';
    cards.forEach((cardSpec, index) => {
      const template = options?.standaloneRow
        ? createPricingCardShell(baseTemplates[index % baseTemplates.length], true)
        : (baseTemplates[index % baseTemplates.length].cloneNode(true) as HTMLElement);
      renderPricingCard(template, cardSpec);
      targetGrid.appendChild(template);
    });
    normalizePricingCardContentHeights(targetGrid);
  };

  const renderGroupedCards = (cards: PricingCardSpec[]) => {
    const groupedIndex = cards.findIndex((card) => Boolean(card.groupLabel));

    if (groupedIndex > 0) {
      const leadingCards = cards.slice(0, groupedIndex);
      const groupedCards = cards.slice(groupedIndex);
      const groupedLabel = groupedCards[0]?.groupLabel ?? '';

      renderCardsInto(sectionGrid, leadingCards);
      renderCardsInto(
        groupedSectionGrid,
        groupedCards.map((card) => ({
          ...card,
          groupLabel: undefined,
        })),
        { standaloneRow: true },
      );

      groupedSectionHeading.className = 'flex flex-col gap-sm px-xxxs';
      groupedSectionHeading.innerHTML = '';

      const heading = createTextElement(
        'h3',
        'text-balance m-0 heading-h2 font-feature-2 text-primary',
        groupedLabel,
      );
      const divider = document.createElement('div');
      divider.style.width = '100%';
      divider.style.height = '1px';
      divider.style.backgroundColor = 'rgba(27, 27, 27, 0.16)';
      divider.style.marginTop = '8px';

      groupedSectionHeading.append(heading, divider);
      groupedSectionGrid.style.display = '';
      return;
    }

    renderCardsInto(sectionGrid, cards);
    groupedSectionHeading.className = 'hidden';
    groupedSectionHeading.innerHTML = '';
    groupedSectionGrid.style.display = 'none';
    groupedSectionGrid.innerHTML = '';
  };

  const applyPricingGridLayout = (activeKey: PricingTabKey) => {
    const grids = [sectionGrid, groupedSectionGrid];

    if (activeKey === 'pay' && currentPayLocation === 'US') {
      if (window.innerWidth >= 768) {
        sectionGrid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
        groupedSectionGrid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
        return;
      }

      sectionGrid.style.gridTemplateColumns = 'repeat(1, minmax(0, 1fr))';
      groupedSectionGrid.style.gridTemplateColumns = 'repeat(1, minmax(0, 1fr))';
      return;
    }

    if (window.innerWidth >= 1200 && activeKey === 'manage') {
      grids.forEach((grid) => {
        grid.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
      });
      return;
    }

    if (window.innerWidth >= 1200) {
      grids.forEach((grid) => {
        grid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
      });
      return;
    }

    if (window.innerWidth >= 768) {
      grids.forEach((grid) => {
        grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
      });
      return;
    }

    grids.forEach((grid) => {
      grid.style.gridTemplateColumns = 'repeat(1, minmax(0, 1fr))';
    });
  };

  const setActiveTabStyles = (activeKey: PricingTabKey) => {
    tabs.forEach((tab) => {
      const tabKey = tab.id.replace(/^#/, '').toLowerCase() as PricingTabKey;
      const active = tabKey === activeKey;

      // The generated pricing HTML ships the first "Hire" tab with a special
      // white-hover utility and dark text class. Remove those one-off template
      // classes so all four tabs are controlled by the same runtime styling.
      tab.classList.remove('hover:bg-surface-white!');

      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      tab.setAttribute('data-pricing-active', active ? 'true' : 'false');
      tab.classList.toggle('Mui-selected', active);
      tab.style.setProperty('background-color', 'transparent', 'important');
      tab.style.setProperty('border-color', 'transparent', 'important');
      tab.style.transition = 'background-color 180ms ease';

      const label = tab.querySelector<HTMLElement>('p');
      if (label) {
        label.classList.remove('text-surface-brand-dark-purple!');
        label.style.setProperty(
          'color',
          active ? PRICING_TAB_CONTENT[activeKey].activeTabTextColor : '#FFFFFF',
          'important',
        );
      }
    });
  };

  const updateActiveTabIndicator = (activeKey: PricingTabKey) => {
    const activeTab = tabs.find((tab) => tab.id.replace(/^#/, '').toLowerCase() === activeKey);
    if (!activeTab) {
      activeTabIndicator.style.opacity = '0';
      return;
    }

    const listRect = tabList.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    activeTabIndicator.style.opacity = '1';
    activeTabIndicator.style.width = `${tabRect.width}px`;
    activeTabIndicator.style.height = `${tabRect.height}px`;
    activeTabIndicator.style.transform = `translateX(${tabRect.left - listRect.left}px)`;
    activeTabIndicator.style.backgroundColor = PRICING_TAB_CONTENT[activeKey].activeTabBackground;
  };

  const renderPayLocationToggle = (spec: PricingTabSpec) => {
    const segments = spec.locationSegments ?? [];
    if (segments.length === 0) {
      payLocationControls.className = 'hidden';
      payLocationControls.innerHTML = '';
      return;
    }

    payLocationControls.className = 'flex items-center justify-center px-xxxs';
    payLocationControls.style.marginTop = '5%';
    payLocationControls.style.marginBottom = '0';
    payLocationControls.style.position = 'relative';
    payLocationControls.style.zIndex = '3';
    payLocationControls.innerHTML = '';

    const controlsRow = document.createElement('div');
    controlsRow.style.display = 'flex';
    controlsRow.style.alignItems = 'center';
    controlsRow.style.justifyContent = 'center';
    controlsRow.style.gap = '20px';
    controlsRow.style.flexWrap = 'wrap';
    controlsRow.style.position = 'relative';
    controlsRow.style.zIndex = '3';

    const label = createTextElement(
      'p',
      'm-0 text-tertiary paragraph-small-semibold text-content-primary!',
      spec.locationToggleLabel ?? 'Choose a location:',
    );
    label.style.margin = '0';
    label.style.fontSize = '16px';
    label.style.fontWeight = '600';
    label.style.lineHeight = '1.25';

    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'inline-flex';
    buttonRow.style.alignItems = 'center';
    buttonRow.style.padding = '4px';
    buttonRow.style.border = '1px solid #D8D8D8';
    buttonRow.style.borderRadius = '10px';
    buttonRow.style.backgroundColor = '#FFFFFF';
    buttonRow.style.boxShadow = '0 1px 2px rgba(16, 24, 40, 0.04)';
    buttonRow.style.position = 'relative';
    buttonRow.style.zIndex = '3';
    buttonRow.style.pointerEvents = 'auto';

    segments.forEach((segment) => {
      const active = segment.label === currentPayLocation;
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.style.border = '0';
      button.style.borderRadius = '8px';
      button.style.padding = '10px 18px';
      button.style.minWidth = '112px';
      button.style.display = 'inline-flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.fontSize = '16px';
      button.style.fontWeight = '600';
      button.style.lineHeight = '1.2';
      button.style.cursor = 'pointer';
      button.style.transition = 'background-color 180ms ease, color 180ms ease';
      button.style.backgroundColor = active ? '#1F7A1F' : 'transparent';
      button.style.color = active ? '#FFFFFF' : '#667085';
      button.style.position = 'relative';
      button.style.zIndex = '4';
      button.style.pointerEvents = 'auto';
      button.textContent = segment.label;
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        currentPayLocation = segment.label;
        renderGroupedCards(segment.cards);
        schedulePricingLayoutSync();
        renderPayLocationToggle(spec);
      });
      buttonRow.appendChild(button);
    });

    controlsRow.append(label, buttonRow);
    payLocationControls.appendChild(controlsRow);
  };

  const applyTab = (key: PricingTabKey) => {
    const spec = PRICING_TAB_CONTENT[key];
    activePricingTab = key;
    setActiveTabStyles(key);
    updateActiveTabIndicator(key);
    applyPricingGridLayout(key);

    if (key === 'pay') {
      const segments = spec.locationSegments ?? [];
      if (!segments.some((segment) => segment.label === currentPayLocation)) {
        currentPayLocation = segments[0]?.label ?? 'Global';
      }

      renderPayLocationToggle(spec);
      const activeSegment = segments.find((segment) => segment.label === currentPayLocation) ?? segments[0];
      renderGroupedCards(activeSegment?.cards ?? []);
    } else {
      payLocationControls.className = 'hidden';
      payLocationControls.innerHTML = '';
      const cards = spec.cards ?? [];
      const groupedIndex = cards.findIndex((card) => Boolean(card.groupLabel));

      if (groupedIndex > 0) {
        const leadingCards = cards.slice(0, groupedIndex);
        const groupedCards = cards.slice(groupedIndex);
        const groupedLabel = groupedCards[0]?.groupLabel ?? '';

        renderCardsInto(sectionGrid, leadingCards);
        renderCardsInto(
          groupedSectionGrid,
          groupedCards.map((card) => ({
            ...card,
            groupLabel: undefined,
          })),
          { standaloneRow: true },
        );

        groupedSectionHeading.className = 'flex flex-col gap-sm px-xxxs';
        groupedSectionHeading.innerHTML = '';

        const heading = createTextElement(
          'h3',
          'text-balance m-0 heading-h2 font-feature-2 text-primary',
          groupedLabel,
        );
        const divider = document.createElement('div');
        divider.style.width = '100%';
        divider.style.height = '1px';
        divider.style.backgroundColor = 'rgba(27, 27, 27, 0.16)';
        divider.style.marginTop = '8px';

        groupedSectionHeading.append(heading, divider);
        groupedSectionGrid.style.display = '';
      } else {
        renderCardsInto(sectionGrid, cards);
        groupedSectionHeading.className = 'hidden';
        groupedSectionHeading.innerHTML = '';
        groupedSectionGrid.style.display = 'none';
        groupedSectionGrid.innerHTML = '';
      }
    }

    if (accordionCard) {
      if ((spec.solutionColumns?.length ?? 0) > 0) {
        accordionCard.style.display = '';
        renderSolutionFinder(accordionCard, spec);
      } else {
        accordionCard.style.display = 'none';
      }
    }

    if (spec.footerTitle || spec.footerNote) {
      pricingFooter.className =
        'relative mx-auto flex w-full max-w-[1620px] flex-col overflow-hidden rounded-md bg-white px-md py-[72px] shadow-elevation-2dp';
      pricingFooter.style.minHeight = '152px';
      pricingFooter.innerHTML = '';

      const stripe = document.createElement('div');
      stripe.className = 'absolute left-0 right-0 top-0 h-4 rounded-t-md';
      stripe.style.backgroundColor = '#FFE08A';
      pricingFooter.appendChild(stripe);

      const content = document.createElement('div');
      content.className = 'relative z-[1] mx-auto flex w-full flex-1 flex-col items-center justify-center gap-[12px] py-[18px] text-center';

      if (spec.footerTitle) {
        const title = createTextElement(
          'p',
          'm-0 text-tertiary paragraph-medium text-content-primary!',
          spec.footerTitle,
        );
        title.style.textAlign = 'center';
        content.appendChild(title);
      }

      if (spec.footerNote) {
        const note = createTextElement(
          'p',
          'm-0 text-tertiary paragraph-small text-content-secondary',
          spec.footerNote,
        );
        note.style.textAlign = 'center';
        content.appendChild(note);
      }

      pricingFooter.appendChild(content);
    } else {
      pricingFooter.className = 'hidden';
      pricingFooter.innerHTML = '';
    }

    schedulePricingLayoutSync();
  };

  const disposers = tabs.map((tab) => {
    const tabKey = tab.id.replace(/^#/, '').toLowerCase() as PricingTabKey;

    const handleClick = () => applyTab(tabKey);
    const handleMouseEnter = () => {
      if (tab.getAttribute('data-pricing-active') !== 'true') {
        tab.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
      }
    };
    const handleMouseLeave = () => {
      if (tab.getAttribute('data-pricing-active') !== 'true') {
        tab.style.backgroundColor = 'transparent';
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentIndex = tabs.indexOf(tab);

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const nextTab = tabs[(currentIndex + 1) % tabs.length];
        nextTab.focus();
        applyTab(nextTab.id.replace(/^#/, '').toLowerCase() as PricingTabKey);
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const nextTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
        nextTab.focus();
        applyTab(nextTab.id.replace(/^#/, '').toLowerCase() as PricingTabKey);
      }
    };

    tab.addEventListener('click', handleClick);
    tab.addEventListener('mouseenter', handleMouseEnter);
    tab.addEventListener('mouseleave', handleMouseLeave);
    tab.addEventListener('keydown', handleKeyDown);

    return () => {
      tab.removeEventListener('click', handleClick);
      tab.removeEventListener('mouseenter', handleMouseEnter);
      tab.removeEventListener('mouseleave', handleMouseLeave);
      tab.removeEventListener('keydown', handleKeyDown);
    };
  });

  const handleWindowResize = () => {
    schedulePricingLayoutSync();
  };

  window.addEventListener('resize', handleWindowResize);

  const fonts = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;
  const handleWindowLoad = () => schedulePricingLayoutSync();
  window.addEventListener('load', handleWindowLoad);
  fonts?.ready?.then(() => {
    schedulePricingLayoutSync();
  });

  applyTab('hire');

  return () => {
    window.removeEventListener('resize', handleWindowResize);
    window.removeEventListener('load', handleWindowLoad);
    activeTabIndicator.remove();
    payLocationControls.remove();
    groupedSectionHeading.remove();
    groupedSectionGrid.remove();
    pricingFooter.remove();
    disposers.forEach((dispose) => dispose());
  };
}

function wirePricingAccordion() {
  return () => undefined;
}

function wirePricingDemoButtons(root: HTMLElement) {
  const heroDemoButton = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
    button.textContent?.trim().toLowerCase() === 'speak with a trusted expert',
  );

  if (!heroDemoButton) {
    return () => undefined;
  }

  heroDemoButton.setAttribute('data-demo-trigger', 'true');
  return () => undefined;
}

function wireAccordions(root: HTMLElement) {
  const faqBlock = root.querySelector<HTMLElement>('.product-faqs');
  const faqSection = faqBlock?.parentElement ?? faqBlock;
  if (faqSection) {
    faqSection.style.marginTop = '72px';
  }

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
      }

      wrapper.setAttribute('aria-hidden', 'true');
      wrapper.textContent = symbol;
      wrapper.style.display = 'inline-flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';
      wrapper.style.width = '34px';
      wrapper.style.height = '34px';
      wrapper.style.minWidth = '34px';
      wrapper.style.borderRadius = '999px';
      wrapper.style.backgroundColor = '#8F86A8';
      wrapper.style.color = '#FFFFFF';
      wrapper.style.fontSize = symbol === '+' ? '28px' : '24px';
      wrapper.style.fontWeight = '500';
      wrapper.style.lineHeight = '1';
      wrapper.style.flexShrink = '0';
      wrapper.style.marginLeft = 'auto';

      const nestedIcons = Array.from(wrapper.querySelectorAll<HTMLElement>('svg, img, path, div, span'));
      nestedIcons.forEach((node) => {
        node.style.display = 'none';
      });

      if (!wrapper.parentElement) {
        summary.appendChild(wrapper);
      }

      return wrapper;
    };

    const expandIconWrapper = ensureIconWrapper('expandIconWrapper', '+');
    const collapseIconWrapper = ensureIconWrapper('collapseIconWrapper', '-');

    collapse.style.overflow = 'hidden';
    collapse.style.transition = 'height 220ms ease';

    region.id ||= `pricing-accordion-region-${index}`;
    summary.id ||= `pricing-accordion-summary-${index}`;
    summary.setAttribute('role', 'button');
    summary.setAttribute('aria-controls', region.id);
    region.setAttribute('aria-labelledby', summary.id);

    const setExpanded = (expanded: boolean) => {
      accordion.classList.toggle('Mui-expanded', expanded);
      summary.classList.toggle('Mui-expanded', expanded);
      collapse.classList.toggle('Mui-expanded', expanded);
      region.classList.toggle('Mui-expanded', expanded);
      summary.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      region.hidden = !expanded;
      collapse.style.height = expanded ? `${details.scrollHeight}px` : '0px';
      details.style.visibility = expanded ? 'visible' : 'hidden';
      details.style.pointerEvents = expanded ? 'auto' : 'none';
      expandIconWrapper.style.display = expanded ? 'none' : 'inline-flex';
      collapseIconWrapper.style.display = expanded ? 'inline-flex' : 'none';
    };

    const initiallyExpanded =
      accordion.classList.contains('Mui-expanded') || summary.getAttribute('aria-expanded') === 'true';

    setExpanded(initiallyExpanded);

    const toggleExpanded = () => setExpanded(summary.getAttribute('aria-expanded') !== 'true');
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleExpanded();
      }
    };

    summary.addEventListener('click', toggleExpanded);
    summary.addEventListener('keydown', handleKeyDown);

    return () => {
      summary.removeEventListener('click', toggleExpanded);
      summary.removeEventListener('keydown', handleKeyDown);
    };
  });

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
  };
}

function wireSliders(root: HTMLElement) {
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

export default function PricingPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const previousHtmlClassName = document.documentElement.className;
    const previousBodyClassName = document.body.className;

    document.title = PRICING_PAGE_TITLE;

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${PRICING_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    PRICING_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    PRICING_INLINE_STYLES.forEach((cssText, index) => {
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

    const cleanupPricingTabs = wirePricingPrimaryTabs(root);
    const cleanupPricingAccordion = wirePricingAccordion();
    const cleanupPricingDemoButtons = wirePricingDemoButtons(root);
    wireTrustedCompaniesStrip(root);
    removeKeyFiguresBottomPadding(root);
    const cleanupTabs = wireTabs(root);
    const cleanupAccordions = wireAccordions(root);
    const cleanupSliders = wireSliders(root);

    root.addEventListener('click', handleAnchorClick);

    return () => {
      root.removeEventListener('click', handleAnchorClick);
      cleanupPricingTabs();
      cleanupPricingAccordion();
      cleanupPricingDemoButtons();
      cleanupTabs();
      cleanupAccordions();
      cleanupSliders();
    };
  }, []);

  return (
    <SharedLandingPageLayout>
      <div
        ref={rootRef}
        data-page="pricing-react"
        style={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          paddingInline: 'clamp(8px, 1.5vw, 24px)',
        }}
      >
        <PricingContent />
      </div>
    </SharedLandingPageLayout>
  );
}


