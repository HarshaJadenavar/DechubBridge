import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  DEEL_HIRE_HTML_CLASSES,
  DEEL_HIRE_INLINE_STYLES,
  DEEL_HIRE_STYLESHEET_HREFS,
  DeelHireContent,
} from './deelHire/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';
import Section02 from '../landing_deel/components/Section02.jsx';
import Section07 from '../landing_deel/components/Section07.jsx';
import { applySolutionPageContent } from './solutionPageContent';

const STYLE_DATA_ATTR = 'data-deel-hire-style';
const LINK_DATA_ATTR = 'data-deel-hire-stylesheet';
const HIRE_LAYOUT_FIXES = `
  html:has(.deel-hire-page), body:has(.deel-hire-page) { max-width: 100%; overflow-x: hidden; }
  .deel-hire-page, .deel-hire-page [data-ab-page="true"] > .w-full { width: 100%; max-width: 100vw; overflow-x: clip; }
  .deel-hire-page section { max-width: 100%; }

  .deel-hire-page .hire-generated-logo-strip,
  .deel-hire-page .hire-generated-key-figures,
  .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div + div,
  .deel-hire-page .mui-16f0pz5 .mui-1si5xjn { display: none !important; }

  .deel-hire-page .hire-landing-logo-strip-mount,
  .deel-hire-page .deel-logo-strip,
  .deel-hire-page .deel-logo-strip__viewport { width: 100%; max-width: 100%; overflow: hidden; }
  .deel-hire-page .deel-logo-strip__track { min-width: max-content; }

  .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child { width: 100%; overflow: hidden; padding: 12px !important; }
  .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child > div { width: 100% !important; max-width: 1704px !important; min-width: 0; margin-inline: auto !important; }
  .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child > div > div { min-width: 0; overflow: hidden; }
  .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] { display: flex !important; flex-direction: column !important; gap: 12px !important; }
  .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div { display: flex !important; gap: 12px !important; }
  .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div { margin-top: 24px !important; }

  .deel-hire-page .swiper-slider-comparison-slider { overflow-x: auto !important; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .deel-hire-page .swiper-slider-comparison-slider::-webkit-scrollbar { display: none; }
  .deel-hire-page .swiper-slider-comparison-slider .swiper-wrapper { display: flex !important; width: max-content !important; }
  .deel-hire-page .swiper-slider-comparison-slider .swiper-slide { flex: 0 0 min(31vw, 560px); scroll-snap-align: start; }

  .deel-hire-industry-frame { width: 100%; padding: 12px !important; }
  .deel-hire-industry-section { width: 100%; margin: 0 !important; padding: 64px clamp(24px, 6vw, 112px) !important; }
  .deel-hire-industry-section > div:first-child { width: 100% !important; max-width: 1312px !important; margin-inline: auto !important; }
  .deel-hire-industry-section h2 { width: 100%; max-width: 667px; margin-inline: auto; text-align: center !important; }
  .deel-hire-industry-section .MuiTabs-scroller { overflow-x: auto !important; scrollbar-width: none; }
  .deel-hire-industry-section .MuiTabs-scroller::-webkit-scrollbar { display: none; }
  .deel-hire-industry-section [role="tablist"] { width: max-content !important; min-width: max-content; margin-inline: auto !important; }
  .deel-hire-industry-section .MuiTabs-root + div > div { display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 48px !important; }
  .deel-hire-industry-section .MuiTabs-root + div > div > div { width: auto !important; min-width: 0 !important; flex: initial !important; }
  .deel-hire-industry-section .MuiTabs-root + div > div > div:first-child { padding: 64px !important; }

  .deel-hire-page section[id="2"] { margin-bottom: 0 !important; padding: clamp(40px, 4.8vw, 92px) clamp(24px, 3.125vw, 60px) clamp(48px, 5vw, 96px) !important; }
  .deel-hire-page section[id="2"] > div:first-child { width: 100% !important; max-width: 1776px !important; min-height: 600px !important; margin-inline: auto !important; border-radius: 30px !important; }
  .deel-hire-page section[id="2"] > div:first-child > div:first-child { height: 100% !important; padding-inline: clamp(32px, 5vw, 96px) !important; align-items: center !important; }
  .deel-hire-page section[id="2"] > div:first-child > div:first-child > div:first-child { gap: 32px !important; justify-content: center !important; }
  .deel-hire-page section[id="2"] h2 { margin: 0 !important; }
  .deel-hire-page section[id="2"] + .MuiBox-root { margin-top: 0 !important; }

  @media (min-width: 1050px) {
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child > div { display: flex !important; flex-direction: row !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { width: 50% !important; flex: 0 1 50% !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child { display: flex !important; padding: 96px 64px !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child > div:first-child { width: 100% !important; max-width: 450px !important; margin: auto !important; align-items: center !important; justify-content: center !important; text-align: center !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child h1,
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child h1 + div,
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child h1 + div > p { text-align: center !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child h1 { margin-bottom: 48px !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child h1 + div { margin-top: 24px !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] { min-height: 80px !important; padding-top: 20px !important; padding-bottom: 20px !important; }
  }

  @media (max-width: 1049px) {
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child > div { flex-direction: column !important; min-height: auto !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { width: 100% !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child { padding: 48px 24px !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { display: none !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child h1 { font-size: 38px !important; line-height: 1.05 !important; overflow-wrap: anywhere; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] { width: 100% !important; gap: 12px !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div { min-width: 0; gap: 12px !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] { min-width: 0 !important; min-height: 76px !important; padding: 12px !important; overflow-wrap: anywhere; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div { width: 100% !important; margin-top: 24px !important; }
    .deel-hire-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div button { width: 100% !important; min-height: 52px; }
    .deel-hire-page .swiper-slider-comparison-slider .swiper-slide { flex-basis: min(82vw, 420px); }
    .deel-hire-industry-frame { padding: 0 !important; }
    .deel-hire-industry-section { padding: 48px 20px !important; border-radius: 0 !important; }
    .deel-hire-industry-section [role="tablist"] { margin-inline: 0 !important; }
    .deel-hire-industry-section .MuiTabs-root + div > div { grid-template-columns: minmax(0, 1fr); gap: 20px !important; }
    .deel-hire-industry-section .MuiTabs-root + div > div > div:first-child { padding: 24px !important; }
    .deel-hire-page section[id="2"] { padding: 32px 16px 48px !important; }
    .deel-hire-page section[id="2"] > div:first-child { min-height: 620px !important; border-radius: 20px !important; }
    .deel-hire-page section[id="2"] > div:first-child > div:first-child { padding: 48px 24px 24px !important; }
    .deel-hire-page section[id="2"] > div:first-child > div:first-child > div:first-child { align-items: center !important; text-align: center !important; }
    .deel-hire-page section[id="2"] h2,
    .deel-hire-page section[id="2"] h2 + div { text-align: center !important; justify-content: center !important; }
  }

  @media (max-width: 700px) {
    .deel-hire-page .mui-3lz68q { grid-template-columns: minmax(0, 1fr) !important; gap: 28px !important; }
    .deel-hire-page .mui-3lz68q > .mui-pjjft1 { grid-column: auto !important; padding-right: 0 !important; }
  }
`;
const HIRE_TAB_LABELS = ['Technology', 'Professional Services', 'Finance & Fintech'] as const;

const HIRE_TABS: Record<
  (typeof HIRE_TAB_LABELS)[number],
  { title: string; description: string; imageSrc: string }
> = {
  Technology: {
    title: 'Access a larger pool of skilled candidates',
    description:
      'Hire engineers, designers, and product teams across time zones with fast onboarding and flexible hiring models.',
    imageSrc: '/solutions/hire/assets/images/hire-technology-salary-profiles.png',
  },
  'Professional Services': {
    title: 'Hire specialists quickly',
    description:
      'Bring on consultants and contractors quickly with clear agreements and smooth onboarding, wherever they’re located.',
    imageSrc: '/solutions/hire/assets/images/hire-professional-services-candidates.png',
  },
  'Finance & Fintech': {
    title: 'Build a borderless, teams complaintly',
    description:
      'Scale globally while meeting strict compliance requireme-nts for hiring, verification, and worker classification.',
    imageSrc: '/solutions/hire/assets/images/hire-finance-fintech-global-map.png',
  },
};

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

function wireHireIndustryTabs(root: HTMLElement) {
  const tabList = Array.from(root.querySelectorAll<HTMLElement>('[role="tablist"]')).find((list) => {
    const labels = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).map((tab) =>
      tab.textContent?.trim(),
    );

    return HIRE_TAB_LABELS.every((label) => labels.includes(label));
  });

  if (!tabList) {
    return () => undefined;
  }

  const tabs = Array.from(tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const sectionContent = tabList.closest('.MuiTabs-root')?.nextElementSibling as HTMLElement | null;
  const titleNode = sectionContent?.querySelector<HTMLElement>('h5');
  const descriptionNode = sectionContent?.querySelector<HTMLElement>('p');
  const imageNode = sectionContent?.querySelector<HTMLImageElement>('img');
  const indicator =
    tabList.querySelector<HTMLElement>('.MuiTabs-indicator') ?? document.createElement('span');

  if (!sectionContent || !titleNode || !descriptionNode || !imageNode || tabs.length === 0) {
    return () => undefined;
  }

  indicator.className ||= 'MuiTabs-indicator mui-ttwr4n';

  const activateTab = (tab: HTMLButtonElement) => {
    const label = tab.textContent?.trim() as keyof typeof HIRE_TABS | undefined;
    if (!label || !(label in HIRE_TABS)) {
      return;
    }

    const nextContent = HIRE_TABS[label];

    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', selected ? 'true' : 'false');
      candidate.setAttribute('tabindex', selected ? '0' : '-1');
      candidate.classList.toggle('Mui-selected', selected);
    });

    titleNode.textContent = nextContent.title;
    descriptionNode.textContent = nextContent.description;
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

export default function DeelHirePage() {
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

    document.title = 'Dechub-Bridge Hire | Project Team Delivery';

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${DEEL_HIRE_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    DEEL_HIRE_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    DEEL_HIRE_INLINE_STYLES.forEach((cssText, index) => {
      const style = document.createElement('style');
      style.setAttribute(STYLE_DATA_ATTR, String(index));
      style.textContent = cssText;
      document.head.appendChild(style);
      cleanupNodes.push(style);
    });

    const layoutStyle = document.createElement('style');
    layoutStyle.setAttribute(STYLE_DATA_ATTR, 'layout-fixes');
    layoutStyle.textContent = HIRE_LAYOUT_FIXES;
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
      const cleanup = applySolutionPageContent(root, 'hire');
      const cardImages = [
        {
          headingText: 'Find top talent globally',
          imageSrc: '/solutions/hire/assets/images/hire-find-talent-globally.png',
        },
        {
          headingText: 'Hire and onboard in one connected flow',
          imageSrc: '/solutions/hire/assets/images/hire-onboard-connected-flow.png',
        },
        {
          headingText: 'Hire without opening an entity',
          imageSrc: '/solutions/hire/assets/images/hire-eor-uae-profile.png',
        },
        {
          headingText: 'Work with global contractors',
          imageSrc: '/solutions/hire/assets/images/hire-global-contractor-currencies.png',
        },
        {
          headingText: 'Hire fast without the overhead',
          imageSrc: '/solutions/hire/assets/images/hire-fast-without-overhead.png',
        },
        {
          headingText: 'Keep control and visibility at scale',
          imageSrc: '/solutions/hire/assets/images/hire-control-visibility-scale.png',
        },
      ];
      cardImages.forEach(({ headingText, imageSrc }) => {
        const heading = Array.from(root.querySelectorAll<HTMLHeadingElement>('h2, h3, h4')).find(
          (element) => element.textContent?.trim() === headingText,
        );
        let card = heading?.parentElement;
        while (card && !card.querySelector('img')) {
          card = card.parentElement;
        }
        const image = card?.querySelector<HTMLImageElement>('img');
        if (!image) return;
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
        image.src = imageSrc;
      });
      const heroImage = root.querySelector<HTMLImageElement>(
        'img[src*="hire_1_dee4e64328"]',
      );
      if (heroImage) {
        heroImage.src = '/solutions/hire/assets/images/dechub-hire-team.png';
        heroImage.removeAttribute('srcset');
        heroImage.alt = 'A hiring team reviewing international candidates and onboarding progress';
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
    mount.className = 'hire-landing-logo-strip-mount';
    generatedLogoStrip.classList.add('hire-generated-logo-strip');
    generatedLogoStrip.parentElement.insertBefore(mount, generatedLogoStrip);
    setLandingLogoStripTarget(mount);

    return () => {
      generatedLogoStrip.classList.remove('hire-generated-logo-strip');
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
    mount.className = 'hire-landing-key-figures-mount';
    generatedKeyFigures.classList.add('hire-generated-key-figures');
    generatedKeyFigures.parentElement.insertBefore(mount, generatedKeyFigures);
    setLandingKeyFiguresTarget(mount);

    return () => {
      generatedKeyFigures.classList.remove('hire-generated-key-figures');
      mount.remove();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const heading = Array.from(root?.querySelectorAll('h2') ?? []).find(
      (node) => node.textContent?.trim() === 'Stay one step ahead in your industry',
    );
    const section = heading?.closest<HTMLElement>('.bg-surface-dark');
    const frame = section?.parentElement;

    if (!section || !frame) {
      return undefined;
    }

    section.classList.add('deel-hire-industry-section');
    frame.classList.add('deel-hire-industry-frame');

    return () => {
      section.classList.remove('deel-hire-industry-section');
      frame.classList.remove('deel-hire-industry-frame');
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

      if (anchor.getAttribute('data-demo-trigger') === 'true') {
        return;
      }

      const rawHref = anchor.getAttribute('href')?.trim() ?? '';
      if (rawHref.includes('book-a-demo')) {
        return;
      }

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

    const cleanupComparisonSlider = wireSlider(root, 'nav-comparison-slider', 'comparison-slider');
    const cleanupG2ReviewsSlider = wireSlider(root, 'nav-g2-reviews-669', 'g2-reviews-669');
    const cleanupHireTabs = wireHireIndustryTabs(root);

    root.addEventListener('click', handleAnchorClick);

    return () => {
      root.removeEventListener('click', handleAnchorClick);
      cleanupComparisonSlider();
      cleanupG2ReviewsSlider();
      cleanupHireTabs();
    };
  }, []);

  return (
    <SharedLandingPageLayout>
      <div ref={rootRef} className="deel-hire-page" data-page="deel-hire-react">
        <DeelHireContent />
        {landingLogoStripTarget ? createPortal(<Section02 />, landingLogoStripTarget) : null}
        {landingKeyFiguresTarget ? createPortal(<Section07 />, landingKeyFiguresTarget) : null}
      </div>
    </SharedLandingPageLayout>
  );
}
