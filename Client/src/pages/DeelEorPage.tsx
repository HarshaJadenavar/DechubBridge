import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DEEL_EOR_HTML_CLASSES,
  DEEL_EOR_INLINE_STYLES,
  DEEL_EOR_PAGE_TITLE,
  DEEL_EOR_STYLESHEET_HREFS,
  DeelEorContent,
} from './deelEor/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';

const STYLE_DATA_ATTR = 'data-deel-eor-style';
const LINK_DATA_ATTR = 'data-deel-eor-stylesheet';
const EOR_AUTOMATION_TAB_LABELS = [
  'Sourcing',
  'Onboarding',
  'Documents',
  'Payroll',
  'Time off and expenses',
  'Reporting',
  'Terminations',
] as const;

const EOR_AUTOMATION_TABS: Record<
  (typeof EOR_AUTOMATION_TAB_LABELS)[number],
  {
    title: string;
    description: string;
    ctaLabel: string;
    imageSrc: string;
  }
> = {
  Sourcing: {
    title: 'Fill roles faster with trusted talent partners',
    description:
      'Struggling to find talent? Create a job request and start receiving agency-sourced candidates quickly. Review and manage candidate submissions, then onboard via EOR without extra handoffs.',
    ctaLabel: 'Book a free 30-minute demo',
    imageSrc: '/solutions/payroll/eor/assets/images/horizontal_tab_eor_talent_2x_4cbe203e94-c916c64784.webp',
  },
  Onboarding: {
    title: 'Onboard global hires without manual follow-up',
    description:
      'Collect personal details, contracts, banking data, and local employment requirements in one guided flow so new hires can get started quickly and compliantly.',
    ctaLabel: 'Book a free 30-minute demo',
    imageSrc: '/solutions/payroll/eor/assets/images/media_720w_eor_stay_compliant_2x_b3388f527b-6224129474.webp',
  },
  Documents: {
    title: 'Keep contracts and compliance documents organized',
    description:
      'Store employment agreements, amendments, and supporting files in one place with a clear audit trail, so teams always know what has been signed and what is still pending.',
    ctaLabel: 'Book a free 30-minute demo',
    imageSrc: '/solutions/payroll/eor/assets/images/Shapes_458183cfc4-8b9957a0e6.png',
  },
  Payroll: {
    title: 'Run compliant payroll through a single global workflow',
    description:
      'Manage salaries, statutory deductions, approvals, and local pay requirements from one platform while Deel handles the in-country payroll complexity.',
    ctaLabel: 'Book a free 30-minute demo',
    imageSrc: '/solutions/payroll/eor/assets/images/eor_4c9368273e-e690716c19.webp',
  },
  'Time off and expenses': {
    title: 'Track leave and reimbursements without extra systems',
    description:
      'Give employees one place to request time off and submit expenses while keeping approvals and records aligned with payroll and local employment policies.',
    ctaLabel: 'Book a free 30-minute demo',
    imageSrc: '/solutions/payroll/eor/assets/images/Elements_Purple_8ce5ab2700-2424d83c19.png',
  },
  Reporting: {
    title: 'See global workforce data in one reporting layer',
    description:
      'Monitor headcount, compensation, costs, and employment status across countries with clearer visibility for finance, HR, and operations teams.',
    ctaLabel: 'Book a free 30-minute demo',
    imageSrc: '/solutions/payroll/eor/assets/images/icons06_2x_483d638af4-7d53f0db2b.webp',
  },
  Terminations: {
    title: 'Manage offboarding with local compliance built in',
    description:
      'Handle notice periods, required documents, final pay, and country-specific termination steps through a structured process that reduces risk and manual coordination.',
    ctaLabel: 'Book a free 30-minute demo',
    imageSrc: '/solutions/payroll/eor/assets/images/icons05_2x_27fb2ed346-63679c7787.webp',
  },
};

type EstimatorCurrency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'BRL' | 'CAD';

type EstimatorCountryConfig = {
  currency: EstimatorCurrency;
  states: string[];
  taxRate: number;
  benefitsRate: number;
};

const EOR_ESTIMATOR_COUNTRIES: Record<string, EstimatorCountryConfig> = {
  'United States': {
    currency: 'USD',
    states: ['California', 'New York', 'Texas', 'Florida'],
    taxRate: 0.092,
    benefitsRate: 0.21,
  },
  Canada: {
    currency: 'CAD',
    states: ['Ontario', 'British Columbia', 'Quebec', 'Alberta'],
    taxRate: 0.084,
    benefitsRate: 0.18,
  },
  Germany: {
    currency: 'EUR',
    states: ['Berlin', 'Bavaria', 'Hamburg', 'Hesse'],
    taxRate: 0.195,
    benefitsRate: 0.22,
  },
  India: {
    currency: 'INR',
    states: ['Karnataka', 'Maharashtra', 'Delhi', 'Telangana'],
    taxRate: 0.048,
    benefitsRate: 0.13,
  },
  Brazil: {
    currency: 'BRL',
    states: ['Sao Paulo', 'Rio de Janeiro', 'Parana', 'Bahia'],
    taxRate: 0.162,
    benefitsRate: 0.24,
  },
  'United Kingdom': {
    currency: 'GBP',
    states: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    taxRate: 0.138,
    benefitsRate: 0.17,
  },
};

const EOR_ESTIMATOR_CURRENCY_SYMBOLS: Record<EstimatorCurrency, string> = {
  USD: '$',
  EUR: 'EUR ',
  GBP: 'GBP ',
  INR: 'INR ',
  BRL: 'R$ ',
  CAD: 'CAD ',
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
        const generatedId = tab.id || `deel-eor-tab-${listIndex}-${tabIndex}`;
        const generatedPanelId = `deel-eor-tabpanel-${listIndex}-${tabIndex}`;

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

        const generatedId = linkedTab.id || `deel-eor-tab-${listIndex}-${panelIndex}`;
        const generatedPanelId = `deel-eor-tabpanel-${listIndex}-${panelIndex}`;

        linkedTab.id = generatedId;
        linkedTab.setAttribute('aria-controls', generatedPanelId);
        panel.id = generatedPanelId;
        panel.setAttribute('aria-labelledby', generatedId);
      });
    };

    const disposers = tabs.map((tab, tabIndex) => {
      tab.id ||= `deel-eor-tab-${listIndex}-${tabIndex}`;

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

function wireEorAutomationTabs(root: HTMLElement) {
  const tabList = Array.from(root.querySelectorAll<HTMLElement>('[role="tablist"]')).find((list) => {
    const labels = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).map((tab) =>
      tab.textContent?.trim(),
    );

    return EOR_AUTOMATION_TAB_LABELS.every((label) => labels.includes(label));
  });

  if (!tabList) {
    return () => undefined;
  }

  const tabs = Array.from(tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const sectionContent = tabList.closest('.MuiTabs-root')?.nextElementSibling as HTMLElement | null;
  const titleNode = sectionContent?.querySelector<HTMLElement>('h5');
  const descriptionNode = sectionContent?.querySelector<HTMLElement>('p');
  const ctaButton = sectionContent?.querySelector<HTMLButtonElement>('button');
  const imageNode = sectionContent?.querySelector<HTMLImageElement>('img');
  const indicator =
    tabList.querySelector<HTMLElement>('.MuiTabs-indicator') ?? document.createElement('span');

  if (!sectionContent || !titleNode || !descriptionNode || !ctaButton || !imageNode || tabs.length === 0) {
    return () => undefined;
  }

  indicator.className ||= 'MuiTabs-indicator mui-ttwr4n';

  const activateTab = (tab: HTMLButtonElement) => {
    const label = tab.textContent?.trim() as keyof typeof EOR_AUTOMATION_TABS | undefined;
    if (!label || !(label in EOR_AUTOMATION_TABS)) {
      return;
    }

    const nextContent = EOR_AUTOMATION_TABS[label];

    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', selected ? 'true' : 'false');
      candidate.setAttribute('tabindex', selected ? '0' : '-1');
      candidate.classList.toggle('Mui-selected', selected);
    });

    titleNode.textContent = nextContent.title;
    descriptionNode.textContent = nextContent.description;
    ctaButton.textContent = nextContent.ctaLabel;
    imageNode.src = nextContent.imageSrc;
    imageNode.setAttribute('srcset', nextContent.imageSrc);
    imageNode.alt = nextContent.title;

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

    const summaryId = `deel-eor-accordion-header-${index}`;
    const regionId = `deel-eor-accordion-panel-${index}`;

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

function EorCostEstimatorSection() {
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [currency, setCurrency] = useState<EstimatorCurrency | ''>('');
  const [salary, setSalary] = useState('');
  const [result, setResult] = useState<{
    employerTaxes: number;
    mandatoryBenefits: number;
    totalCost: number;
  } | null>(null);

  const selectedCountry = country ? EOR_ESTIMATOR_COUNTRIES[country] : null;
  const availableStates = selectedCountry?.states ?? [];
  const parsedSalary = Number(salary.replace(/,/g, ''));
  const isValid =
    Boolean(country) &&
    Boolean(state) &&
    Boolean(currency) &&
    Number.isFinite(parsedSalary) &&
    parsedSalary > 0;

  const formatCurrency = (value: number) => {
    if (!currency) {
      return value.toFixed(2);
    }

    const symbol = EOR_ESTIMATOR_CURRENCY_SYMBOLS[currency];
    return `${symbol}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleCountryChange = (nextCountry: string) => {
    setCountry(nextCountry);
    setState('');
    const nextCurrency = EOR_ESTIMATOR_COUNTRIES[nextCountry]?.currency ?? '';
    setCurrency(nextCurrency);
    setResult(null);
  };

  const handleCalculate = () => {
    if (!selectedCountry || !currency || !isValid) {
      return;
    }

    const employerTaxes = parsedSalary * selectedCountry.taxRate;
    const mandatoryBenefits = parsedSalary * selectedCountry.benefitsRate;
    const totalCost = parsedSalary + employerTaxes + mandatoryBenefits;

    setResult({
      employerTaxes,
      mandatoryBenefits,
      totalCost,
    });
  };

  return (
    <section
      style={{
        width: '100%',
        padding: '24px 12px 40px',
        background: '#fff',
      }}
    >
      <div
        style={{
          maxWidth: '1312px',
          margin: '0 auto',
          position: 'relative',
          minHeight: '520px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            minHeight: '412px',
            borderRadius: '20px',
            background:
              'linear-gradient(135deg, #FFEAA0 0%, #FFD34E 52%, #FFC400 100%)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            padding: '56px 68px',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'polygon(25% 100%, 35% 12%, 52% 34%, 63% 1%, 100% 100%)',
              opacity: 0,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '30%',
              top: '12px',
              width: '430px',
              height: '430px',
              background: 'rgba(255, 196, 0, 0.62)',
              clipPath: 'polygon(10% 100%, 40% 10%, 55% 30%, 82% 0%, 100% 100%)',
            }}
          />
          <div style={{ maxWidth: '520px', position: 'relative', zIndex: 1 }}>
            <h2
              style={{
                margin: 0,
                color: '#111827',
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: '38px',
                lineHeight: 1.12,
                fontWeight: 700,
                letterSpacing: '-0.04em',
              }}
            >
              How much does hiring internationally really cost?
            </h2>
            <p
              style={{
                margin: '24px 0 0',
                color: '#1f2937',
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: '18px',
                lineHeight: 1.7,
                maxWidth: '560px',
              }}
            >
              See what it costs to hire an employee through Deel. You can estimate the total
              employment cost, including salary, taxes, and mandatory benefits.
            </p>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: '68px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '530px',
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.14)',
            padding: '32px',
            zIndex: 2,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: '#111827',
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: '26px',
              lineHeight: 1.2,
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Global Hiring Cost Estimator
          </h3>

          <div style={{ marginTop: '28px' }}>
            <p
              style={{
                margin: '0 0 12px',
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                color: '#111827',
              }}
            >
              I want to hire in
            </p>
            <div style={{ display: 'grid', gap: '12px' }}>
              <select
                style={estimatorFieldStyle}
                value={country}
                onChange={(event) => handleCountryChange(event.target.value)}
              >
                <option value="" disabled>
                  Country *
                </option>
                {Object.keys(EOR_ESTIMATOR_COUNTRIES).map((countryOption) => (
                  <option key={countryOption} value={countryOption}>
                    {countryOption}
                  </option>
                ))}
              </select>
              <select
                style={{
                  ...estimatorFieldStyle,
                  color: availableStates.length > 0 ? '#111827' : '#9CA3AF',
                  background: availableStates.length > 0 ? '#fff' : '#F9FAFB',
                }}
                value={state}
                disabled={availableStates.length === 0}
                onChange={(event) => {
                  setState(event.target.value);
                  setResult(null);
                }}
              >
                <option value="" disabled>
                  State *
                </option>
                {availableStates.map((stateOption) => (
                  <option key={stateOption} value={stateOption}>
                    {stateOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '26px' }}>
            <p
              style={{
                margin: '0 0 12px',
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                color: '#111827',
              }}
            >
              Gross annual salary
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '138px 1fr', gap: '12px' }}>
              <select
                style={estimatorFieldStyle}
                value={currency}
                onChange={(event) => {
                  setCurrency(event.target.value as EstimatorCurrency);
                  setResult(null);
                }}
              >
                <option value="" disabled>
                  Currency *
                </option>
                {Object.keys(EOR_ESTIMATOR_CURRENCY_SYMBOLS).map((currencyOption) => (
                  <option key={currencyOption} value={currencyOption}>
                    {currencyOption}
                  </option>
                ))}
              </select>
              <input
                style={estimatorFieldStyle}
                placeholder="Gross Salary *"
                inputMode="decimal"
                value={salary}
                onChange={(event) => {
                  setSalary(event.target.value);
                  setResult(null);
                }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!isValid}
            onClick={handleCalculate}
            style={{
              width: '100%',
              marginTop: '34px',
              height: '56px',
              border: 'none',
              borderRadius: '999px',
              background: isValid ? '#1B1B1B' : '#D9D9D9',
              color: isValid ? '#FFFFFF' : '#9CA3AF',
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}
          >
            Calculate total cost
          </button>

          {result ? (
            <div
              style={{
                marginTop: '20px',
                borderRadius: '16px',
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                padding: '20px',
                display: 'grid',
                gap: '12px',
              }}
            >
              <div style={estimatorResultRowStyle}>
                <span>Base salary</span>
                <strong>{formatCurrency(parsedSalary)}</strong>
              </div>
              <div style={estimatorResultRowStyle}>
                <span>Employer taxes</span>
                <strong>{formatCurrency(result.employerTaxes)}</strong>
              </div>
              <div style={estimatorResultRowStyle}>
                <span>Mandatory benefits</span>
                <strong>{formatCurrency(result.mandatoryBenefits)}</strong>
              </div>
              <div
                style={{
                  ...estimatorResultRowStyle,
                  paddingTop: '12px',
                  borderTop: '1px solid #D1D5DB',
                  color: '#111827',
                  fontSize: '18px',
                }}
              >
                <span>Total estimated annual cost</span>
                <strong>{formatCurrency(result.totalCost)}</strong>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const estimatorFieldStyle: React.CSSProperties = {
  width: '100%',
  height: '56px',
  borderRadius: '12px',
  border: '1px solid #D1D5DB',
  background: '#fff',
  padding: '0 16px',
  color: '#6B7280',
  fontFamily: 'Inter, Arial, sans-serif',
  fontSize: '16px',
  outline: 'none',
  boxSizing: 'border-box',
};

const estimatorResultRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  color: '#374151',
  fontFamily: 'Inter, Arial, sans-serif',
  fontSize: '15px',
  lineHeight: 1.5,
};

export default function DeelEorPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [estimatorMountNode, setEstimatorMountNode] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const previousHtmlClassName = document.documentElement.className;
    const previousBodyClassName = document.body.className;

    document.title = DEEL_EOR_PAGE_TITLE;

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${DEEL_EOR_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    DEEL_EOR_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    DEEL_EOR_INLINE_STYLES.forEach((cssText, index) => {
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
    const cleanupEorAutomationTabs = wireEorAutomationTabs(root);
    const cleanupAccordions = wireAccordions(root);
    const cleanupCheckboxes = wireCheckboxButtons(root);

    root.addEventListener('click', handleAnchorClick);

    return () => {
      root.removeEventListener('click', handleAnchorClick);
      cleanupSlider();
      cleanupTabs();
      cleanupEorAutomationTabs();
      cleanupAccordions();
      cleanupCheckboxes();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const heading = Array.from(root.querySelectorAll<HTMLElement>('h2')).find(
      (node) => node.textContent?.trim() === 'Make global employment run itself',
    );

    const automationSection = heading?.closest('.bg-surface-primary') as HTMLElement | null;
    if (!automationSection) {
      return;
    }

    let mountNode =
      automationSection.parentElement?.querySelector<HTMLElement>('[data-eor-cost-estimator]');

    if (!mountNode) {
      mountNode = document.createElement('div');
      mountNode.setAttribute('data-eor-cost-estimator', 'true');
      automationSection.insertAdjacentElement('afterend', mountNode);
    }

    setEstimatorMountNode(mountNode);

    return () => {
      setEstimatorMountNode(null);
    };
  }, []);

  return (
    <SharedLandingPageLayout>
      <div ref={rootRef} data-page="deel-eor-react">
        <DeelEorContent />
        {estimatorMountNode ? createPortal(<EorCostEstimatorSection />, estimatorMountNode) : null}
      </div>
    </SharedLandingPageLayout>
  );
}
