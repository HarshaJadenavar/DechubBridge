import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import LandingTalentRequestModal from './LandingTalentRequestModal';
import '../../landing_deel/landing.css';
import '../../landing_deel/overrides.css';
import Header from '../../landing_deel/components/Header.jsx';
import Footer from '../../landing_deel/components/Footer.jsx';
import { applySolutionCaseStudyCards, NonPayrollSolutionType } from './tanishqCaseStudy';

const BOOK_DEMO_LABELS = new Set(['book a demo', 'get started with deel']);
const GET_STARTED_LABELS = new Set(['get started', 'start free']);
const SOLUTION_CASE_STUDY_ROUTES: Record<string, NonPayrollSolutionType> = {
  '/solutions/payroll/eor': 'eor',
  '/solutions/payroll/contractors': 'contractors',
  '/solutions/it': 'it',
  '/solutions/benefits': 'benefits',
  '/solutions/hire': 'hire',
  '/solutions/hr': 'hr',
  '/solutions/mobility': 'mobility',
  '/mobility': 'mobility',
  '/solutions/services': 'services',
  '/solutions/embedded': 'embedded',
  '/solutions/open-api': 'open-api',
};
const INTERNAL_SOLUTION_PATHS = new Set([
  '/solutions/payroll',
  '/solutions/payroll/eor',
  '/solutions/payroll/contractors',
  '/solutions/it',
  '/solutions/benefits',
  '/solutions/hire',
  '/solutions/hr',
  '/solutions/mobility',
  '/mobility',
  '/solutions/services',
  '/solutions/embedded',
  '/solutions/open-api',
  '/integrations',
]);

function normalizeLabel(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function createSolutionFooterBanner(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'solution-footer-banner';
  section.setAttribute('aria-labelledby', 'solution-footer-banner-title');

  const inner = document.createElement('div');
  inner.className = 'solution-footer-banner__inner';

  const image = document.createElement('img');
  image.className = 'solution-footer-banner__image';
  image.src = '/dechub-assets/solutions-footer-cta-bridge.png';
  image.alt = 'Bridge mobile wallet showing available balance, cards, and upcoming payments';

  const content = document.createElement('div');
  content.className = 'solution-footer-banner__content';

  const title = document.createElement('h2');
  title.id = 'solution-footer-banner-title';
  title.textContent = 'Run payroll with confidence in India, the USA, and the UAE';

  const button = document.createElement('button');
  button.className = 'solution-footer-banner__button';
  button.type = 'button';
  button.dataset.demoTrigger = 'true';
  button.textContent = 'Book a demo';

  content.append(title, button);
  inner.append(image, content);
  section.append(inner);
  return section;
}

function applySolutionFooterBanner(root: HTMLElement): void {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  if (!pathname.startsWith('/solutions/')) {
    return;
  }

  const actions = Array.from(root.querySelectorAll<HTMLElement>('main section')).filter((section) => {
    if (section.querySelector('h1')) {
      return false;
    }

    return Array.from(section.querySelectorAll<HTMLElement>('button, a')).some((action) => {
      const label = normalizeLabel(action.textContent);
      return (
        action.dataset.demoTrigger === 'true' ||
        label === 'book a demo' ||
        label === 'discuss your project' ||
        label === 'book a free 30-minute demo'
      );
    });
  });

  const existingCallToAction = actions[actions.length - 1];
  const banner = createSolutionFooterBanner();
  if (existingCallToAction) {
    existingCallToAction.replaceWith(banner);
    return;
  }

  const footerBand = root.querySelector<HTMLElement>('#deel-footer');
  if (!footerBand) {
    console.error(`Unable to place the solution call-to-action banner on ${pathname}.`);
    return;
  }

  footerBand.before(banner);
}

function navigateToInternalPath(href: string): void {
  const nextUrl = new URL(href, window.location.origin);
  const normalizedPath = nextUrl.pathname.replace(/\/+$/, '') || '/';
  const target = `${normalizedPath}${nextUrl.search}${nextUrl.hash}`;
  const current = `${window.location.pathname.replace(/\/+$/, '') || '/'}${window.location.search}${window.location.hash}`;

  if (target !== current) {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  window.scrollTo({ top: 0, behavior: 'auto' });
}

interface SharedLandingPageLayoutProps {
  children: React.ReactNode;
}

export default function SharedLandingPageLayout({ children }: SharedLandingPageLayoutProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isTalentRequestModalOpen, setIsTalentRequestModalOpen] = useState(false);
  const [requestedServices, setRequestedServices] = useState<string[]>([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    const solution = SOLUTION_CASE_STUDY_ROUTES[pathname];
    if (root && solution) {
      applySolutionCaseStudyCards(root, solution);
    }
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root) {
      applySolutionFooterBanner(root);
    }
  }, []);

  const openTalentRequestModal = (services?: string[]) => {
    setRequestedServices(
      Array.isArray(services)
        ? services.filter((item): item is string => typeof item === 'string')
        : [],
    );
    setIsTalentRequestModalOpen(true);
  };

  useEffect(() => {
    const appRoot = document.getElementById('root');
    document.body.classList.add('deel-clone-body');
    appRoot?.classList.add('deel-clone-app-root');

    return () => {
      document.body.classList.remove('deel-clone-body');
      appRoot?.classList.remove('deel-clone-app-root');
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    root.querySelectorAll<HTMLElement>('p').forEach((label) => {
      if (normalizeLabel(label.textContent) !== 'see it in action') {
        return;
      }

      let section: HTMLElement | null = label;
      while (section && section !== root) {
        if (section.querySelector('.MuiCircularProgress-root, [role="progressbar"]')) {
          while (
            section.parentElement &&
            section.parentElement !== root &&
            section.parentElement.children.length === 1
          ) {
            section = section.parentElement;
          }
          section.remove();
          return;
        }
        section = section.parentElement;
      }
    });
  }, []);

  useEffect(() => {
    const handleDemoRequest = (event: Event) => {
      const customEvent = event as CustomEvent<{ services?: unknown }>;
      openTalentRequestModal(
        Array.isArray(customEvent.detail?.services)
          ? customEvent.detail.services.filter((item): item is string => typeof item === 'string')
          : [],
      );
    };

    window.addEventListener('dechub:open-talent-request-modal', handleDemoRequest);
    return () => window.removeEventListener('dechub:open-talent-request-modal', handleDemoRequest);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchorElement = target?.closest('a') as HTMLAnchorElement | null;
      const buttonElement = target?.closest('button') as HTMLButtonElement | null;
      const actionElement = (anchorElement ?? buttonElement) as HTMLAnchorElement | HTMLButtonElement | null;

      if (!actionElement || !root.contains(actionElement)) {
        return;
      }

      if (actionElement.tagName === 'BUTTON' && actionElement.getAttribute('aria-haspopup') === 'menu') {
        return;
      }

      const label = normalizeLabel(actionElement.textContent);
      const anchor = anchorElement ?? (actionElement.tagName === 'A' ? (actionElement as HTMLAnchorElement) : null);
      const href = anchor?.getAttribute('href')?.trim() ?? '';
      const normalizedHref = href ? (new URL(href, window.location.origin).pathname.replace(/\/+$/, '') || '/') : '';

      const isDemoTrigger =
        actionElement.getAttribute('data-demo-trigger') === 'true' ||
        BOOK_DEMO_LABELS.has(label) ||
        href.includes('book-a-demo');

      if (isDemoTrigger) {
        event.preventDefault();
        const requestedServicesAttr = actionElement.getAttribute('data-requested-services');
        openTalentRequestModal(
          requestedServicesAttr
            ? (() => {
                try {
                  const parsed = JSON.parse(requestedServicesAttr);
                  return Array.isArray(parsed) ? parsed : [];
                } catch {
                  return [];
                }
              })()
            : [],
        );
        return;
      }

      if (GET_STARTED_LABELS.has(label) || href === '/get-started') {
        event.preventDefault();
        navigateToInternalPath('/get-started');
        return;
      }

      if (INTERNAL_SOLUTION_PATHS.has(normalizedHref)) {
        event.preventDefault();
        navigateToInternalPath(normalizedHref);
        return;
      }

      if (label === 'log in' || href.includes('login')) {
        event.preventDefault();
        navigateToInternalPath('/company/login');
        return;
      }

      if (href === '/marketplace') {
        event.preventDefault();
        navigateToInternalPath('/marketplace');
        return;
      }

      if (href === '#' || href === '#!') {
        event.preventDefault();
        return;
      }

      if (href.startsWith('/')) {
        event.preventDefault();
        navigateToInternalPath(href);
      }
    };

    root.addEventListener('click', handleClick);
    return () => root.removeEventListener('click', handleClick);
  }, []);

  return (
    <div ref={rootRef} className="deel-clone-root">
      <Header />
      <main className="m-0 p-0">
        <div className="relative">
          <div data-ab-page="true" className="bg-surface-secondary flex flex-col items-center">
            {children}
          </div>
        </div>
      </main>
      <div id="deel-footer" className="deel-clone-band deel-clone-band--footer">
        <div className="deel-clone-shell">
          <Footer />
        </div>
      </div>
      <LandingTalentRequestModal
        isOpen={isTalentRequestModalOpen}
        onClose={() => {
          setIsTalentRequestModalOpen(false);
          setRequestedServices([]);
        }}
        requestedServices={requestedServices}
        onSuccess={() => {
          setRequestedServices([]);
          window.dispatchEvent(new Event('dechub:talent-request-submitted'));
        }}
      />
    </div>
  );
}
