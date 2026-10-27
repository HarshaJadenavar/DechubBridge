import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  DEEL_VS_COMPETITORS_HTML_CLASSES,
  DEEL_VS_COMPETITORS_INLINE_STYLES,
  DEEL_VS_COMPETITORS_PAGE_TITLE,
  DEEL_VS_COMPETITORS_STYLESHEET_HREFS,
  DeelVsCompetitorsContent,
} from './deelVsCompetitors/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';

const STYLE_DATA_ATTR = 'data-deel-vs-competitors-style';
const LINK_DATA_ATTR = 'data-deel-vs-competitors-stylesheet';

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function normalizeLabel(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
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
  const handlePrevious = () => {
    track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  };
  const handleNext = () => {
    track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  };

  previousButton.addEventListener('click', handlePrevious);
  nextButton.addEventListener('click', handleNext);

  return () => {
    previousButton.removeEventListener('click', handlePrevious);
    nextButton.removeEventListener('click', handleNext);
  };
}

export default function DeelVsCompetitorsPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const previousHtmlClassName = document.documentElement.className;
    const previousBodyClassName = document.body.className;
    const previousHtmlOverflowAnchor = document.documentElement.style.overflowAnchor;
    const previousBodyOverflowAnchor = document.body.style.overflowAnchor;
    const previousScrollRestoration = window.history.scrollRestoration;

    document.title = DEEL_VS_COMPETITORS_PAGE_TITLE;
    document.documentElement.style.overflowAnchor = 'none';
    document.body.style.overflowAnchor = 'none';
    window.history.scrollRestoration = 'manual';

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${DEEL_VS_COMPETITORS_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    DEEL_VS_COMPETITORS_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    DEEL_VS_COMPETITORS_INLINE_STYLES.forEach((cssText, index) => {
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
      document.documentElement.style.overflowAnchor = previousHtmlOverflowAnchor;
      document.body.style.overflowAnchor = previousBodyOverflowAnchor;
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement && rootRef.current?.contains(activeElement)) {
        activeElement.blur();
      }
    };

    const animationFrameId = window.requestAnimationFrame(() => {
      scrollToTop();
      window.requestAnimationFrame(scrollToTop);
    });

    const timeoutIds = [0, 120, 360].map((delay) => window.setTimeout(scrollToTop, delay));

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const heroDescription = root.querySelector<HTMLElement>('#heroCentered .mui-o4h2l7');
    if (heroDescription) {
      heroDescription.textContent =
        'We bring together powerful integrations, connected workflows, dedicated support, and more to help you efficiently streamline operations, improve team productivity, and scale your business with confidence.';
    }

    const proofGraphic = root.querySelector<HTMLImageElement>(
      'img[src*="Hug_Bound_75aff069ed-7a07081e18.svg"]',
    );
    if (proofGraphic) {
      proofGraphic.src = '/dechub-bridge-vs-competitors/dechub-bridge-compare-1.png';
      proofGraphic.srcset = '/dechub-bridge-vs-competitors/dechub-bridge-compare-1.png 640w';
      proofGraphic.alt = 'One connected platform for HR, payroll, IT, hiring, and workflows';
    }

    const proofSection = proofGraphic?.closest('.mui-mpqocb');
    const proofButtons = proofSection?.querySelectorAll<HTMLButtonElement>('.mui-wsfch7 button');
    const proofAnchor = proofSection?.querySelector<HTMLAnchorElement>('.mui-wsfch7 a');

    if (proofButtons?.[0]) {
      proofButtons[0].textContent = 'Book a demo';
    }

    if (proofButtons?.[1]) {
      proofButtons[1].remove();
    }

    if (proofAnchor) {
      proofAnchor.href = '/book-a-demo';
      proofAnchor.target = '_self';
      proofAnchor.removeAttribute('aria-disabled');
      proofAnchor.style.pointerEvents = '';
    }

    const strengthCards = root.querySelectorAll<HTMLElement>('.mui-12z3uld > .mui-75v203 > .mui-n90dtd');
    const scalabilityCard = strengthCards[0];
    if (scalabilityCard) {
      const leftEyebrow = scalabilityCard.querySelector<HTMLElement>('.mui-qbzoaa');
      const leftHeadline = scalabilityCard.querySelector<HTMLElement>('.mui-1h3xmcn');
      const leftParagraph = scalabilityCard.querySelector<HTMLElement>('.mui-1c732k9 .mui-o4h2l7');

      if (leftEyebrow) {
        leftEyebrow.textContent = 'Scalability';
      }

      if (leftHeadline) {
        leftHeadline.textContent = 'Scale with confidence at every stage';
      }

      if (leftParagraph) {
        leftParagraph.textContent =
          'Dechub Bridge is built to support your business as it grows. From evolving workflows to increasing operational demands, the platform gives teams the flexibility, structure, and visibility they need to scale efficiently without relying on disconnected systems.';
      }
    }

    const scalabilityRowTextMap = new Map<string, string>([
      [
        'Hire and pay everyone with in-house services for EOR, contractors, PEO, immigration, US payroll, local payroll, and global payroll',
        'Manage operations more efficiently with connected workflows, automation, and tools that support growing business needs',
      ],
      [
        'Manage and develop your entire workforce with a suite of products for compensation, workforce planning, talent sourcing, and talent management',
        'Improve team coordination with solutions that simplify planning, execution, and day-to-day operational management',
      ],
      [
        'Get Deel’s expert services for entity setup, new market expansion, equity consulting, and more',
        'Access expert support for process improvement, operational expansion, system alignment, and business efficiency initiatives',
      ],
      [
        'Expert services for entity setup, new market expansion, equity consulting, and more',
        'Get practical guidance for scaling operations, improving internal systems, and managing change more effectively',
      ],
      [
        'Get alerts on new regulations and potential violations in 150+ countries with a dedicated compliance hub',
        'Gain better visibility into process risks, operational gaps, and areas that need attention',
      ],
      [
        'Locally compliant document collection for EOR employees and contractors in 150+ countries constantly reviewed and updated',
        'Maintain accurate, organized, and up-to-date operational records across teams and workflows',
      ],
    ]);

    root.querySelectorAll<HTMLElement>('.mui-1ya6hls').forEach((row) => {
      const currentText = row.textContent?.replace(/\s+/g, ' ').trim();
      if (!currentText) {
        return;
      }

      const replacementText = scalabilityRowTextMap.get(currentText);
      if (replacementText) {
        row.textContent = replacementText;
      }
    });

    const coverageCard = strengthCards[1];
    if (coverageCard) {
      const leftEyebrow = coverageCard.querySelector<HTMLElement>('.mui-qbzoaa');
      const leftHeadline = coverageCard.querySelector<HTMLElement>('.mui-1h3xmcn');
      const leftParagraph = coverageCard.querySelector<HTMLElement>('.mui-1c732k9 .mui-o4h2l7');

      if (leftEyebrow) {
        leftEyebrow.textContent = 'Coverage';
      }

      if (leftHeadline) {
        leftHeadline.textContent = 'One platform. Unlimited skills. Broader workforce coverage.';
      }

      if (leftParagraph) {
        leftParagraph.textContent =
          'Dechub Bridge gives businesses access to a wider range of pre-vetted talent through one managed platform. From AI engineers and developers to marketers, analysts, designers, operations, and support roles, Bridge helps teams cover critical business functions faster and with greater confidence.';
      }
    }

    const coverageRowTextMap = new Map<string, string>([
      [
        'Owns a network of entities in 150+ countries',
        'Access pre-vetted talent across technical, creative, operational, and business functions',
      ],
      [
        'In-house operated payroll and professionals in every country they provide services to ensure direct support and maintain uniform standards.',
        'Support everything from individual hires to full delivery teams through one platform',
      ],
      [
        'In-house immigration services in 50+ countries, including the United States, Canada, and the United Arab Emirates',
        'Match business requirements faster with AI-powered skill discovery and human validation',
      ],
      [
        'Single native payroll calculation engine across 50+ countries',
        'Reduce hiring gaps across growth, product, engineering, operations, and support roles',
      ],
      [
        'Real-time payroll for instant G2N calculations and faster payroll processing in 50+ countries',
        'Expand workforce capacity without depending on fragmented hiring channels',
      ],
      [
        'In-house service to automate IT operations and logistics for employee equipment from deployment to end-of-life in 130+ countries',
        'Build stronger execution with talent coverage aligned to real business outcomes',
      ],
    ]);

    root.querySelectorAll<HTMLElement>('.mui-1ya6hls').forEach((row) => {
      const currentText = row.textContent?.replace(/\s+/g, ' ').trim();
      if (!currentText) {
        return;
      }

      const replacementText = coverageRowTextMap.get(currentText);
      if (replacementText) {
        row.textContent = replacementText;
      }
    });

    const speedSectionHeading = Array.from(root.querySelectorAll<HTMLElement>('h2')).find((heading) =>
      heading.textContent?.replace(/\s+/g, ' ').trim().includes('Faster, moreflexible payroll'),
    );
    const speedSectionImage = speedSectionHeading
      ?.closest('.mui-mpqocb')
      ?.querySelector<HTMLImageElement>('img');
    const speedSectionCallToAction = speedSectionHeading
      ?.closest('.mui-mpqocb')
      ?.querySelector<HTMLButtonElement>('button');

    if (speedSectionImage) {
      speedSectionImage.src = '/dechub-bridge-vs-competitors/dechub-bridge-payroll-cutoff.png';
      speedSectionImage.srcset =
        '/dechub-bridge-vs-competitors/dechub-bridge-payroll-cutoff.png 640w';
      speedSectionImage.alt = 'Dechub Bridge talent deployment speed comparison';
    }

    if (speedSectionCallToAction) {
      speedSectionCallToAction.textContent = 'Speak to sales';
      speedSectionCallToAction.setAttribute('data-demo-trigger', 'true');
    }

    const bridgeWordmarkSrc = '/deel-assets/images/website-media.deel.com/logo.png';
    const deelWordmarkMatchers = [
      '/deel-vs-competitors/assets/svg/Wordmark_1c63e597c1-6a57a6f843.svg',
      '/solutions/payroll/assets/svg/Wordmark_1c63e597c1-6a57a6f843.svg',
      '/solutions/benefits/assets/svg/Wordmark_1c63e597c1-6a57a6f843.svg',
      '/solutions/services/assets/svg/Wordmark_1c63e597c1-6a57a6f843.svg',
      '/solutions/hr/assets/svg/Wordmark_1c63e597c1-6a57a6f843.svg',
      '/solutions/embedded/assets/svg/Wordmark_1c63e597c1-6a57a6f843.svg',
    ];

    const swapDeelWordmarkImage = (logoImage: HTMLImageElement) => {
      const src = logoImage.getAttribute('src') ?? '';
      if (!deelWordmarkMatchers.some((matcher) => src.includes(matcher))) {
        return;
      }

      logoImage.src = bridgeWordmarkSrc;
      logoImage.srcset = `${bridgeWordmarkSrc} 640w`;
      logoImage.alt = 'Bridge logo';
      logoImage.style.maxWidth = '190px';
      logoImage.style.width = '190px';
      logoImage.style.height = '66px';
      logoImage.style.objectFit = 'contain';
    };

    const renderBridgeHeaderLogo = (cell: HTMLTableCellElement) => {
      const currentImage = cell.querySelector<HTMLImageElement>('img[data-bridge-wordmark="true"]');
      if (currentImage) {
        currentImage.removeAttribute('width');
        currentImage.removeAttribute('height');
        currentImage.style.setProperty('width', '70%', 'important');
        currentImage.style.setProperty('max-width', '70%', 'important');
        currentImage.style.setProperty('height', '66px', 'important');
        return;
      }

      cell.replaceChildren();

      const bridgeLogo = document.createElement('img');
      bridgeLogo.src = bridgeWordmarkSrc;
      bridgeLogo.srcset = `${bridgeWordmarkSrc} 640w`;
      bridgeLogo.alt = 'Bridge logo';
      bridgeLogo.dataset.bridgeWordmark = 'true';
      bridgeLogo.removeAttribute('width');
      bridgeLogo.removeAttribute('height');
      bridgeLogo.style.setProperty('max-width', '70%', 'important');
      bridgeLogo.style.setProperty('width', '70%', 'important');
      bridgeLogo.style.setProperty('height', '66px', 'important');
      bridgeLogo.style.objectFit = 'contain';
      bridgeLogo.style.display = 'block';
      bridgeLogo.style.margin = '0 auto';
      cell.style.minWidth = '220px';
      cell.style.paddingTop = '28px';
      cell.style.paddingBottom = '28px';

      cell.appendChild(bridgeLogo);
    };

    root.querySelectorAll<HTMLElement>('.mui-1yg18mo').forEach((logoWrap) => {
      const logoImage = logoWrap.querySelector<HTMLImageElement>('img');
      if (!logoImage) {
        return;
      }

      swapDeelWordmarkImage(logoImage);
    });

    const ownedEntitiesHeading = Array.from(root.querySelectorAll<HTMLElement>('h2')).find((heading) =>
      heading.textContent
        ?.replace(/\s+/g, ' ')
        .trim()
        .includes('Benefits of using our owned entities vs. aggregator in-country partners'),
    );

    const ownedEntitiesSection = ownedEntitiesHeading?.closest('.mui-mpqocb');
    const ownedEntitiesBridgeHeaderCell = ownedEntitiesSection?.querySelector<HTMLTableCellElement>(
      'table thead th:nth-child(2)',
    );

    ownedEntitiesSection?.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
      swapDeelWordmarkImage(image);
    });

    ownedEntitiesSection?.querySelectorAll<HTMLElement>('p, th, td, div, span').forEach((node) => {
      if (node.textContent?.replace(/\s+/g, ' ').trim() === 'deel.') {
        node.textContent = 'Bridge';
      }
    });

    if (ownedEntitiesBridgeHeaderCell) {
      renderBridgeHeaderLogo(ownedEntitiesBridgeHeaderCell);
    }

    const ownedEntitiesBridgeHeaderImage = ownedEntitiesSection?.querySelector<HTMLImageElement>(
      'table thead th:nth-child(2) img',
    );
    const ownedEntitiesCallToAction = ownedEntitiesSection?.querySelector<HTMLButtonElement>(
      'table tbody tr:last-child td:nth-child(2) button',
    );

    if (ownedEntitiesBridgeHeaderImage) {
      ownedEntitiesBridgeHeaderImage.removeAttribute('width');
      ownedEntitiesBridgeHeaderImage.removeAttribute('height');
      ownedEntitiesBridgeHeaderImage.style.setProperty('width', '70%', 'important');
      ownedEntitiesBridgeHeaderImage.style.setProperty('max-width', '70%', 'important');
      ownedEntitiesBridgeHeaderImage.style.setProperty('height', '66px', 'important');
    }

    if (ownedEntitiesCallToAction) {
      ownedEntitiesCallToAction.setAttribute('data-demo-trigger', 'true');
    }

    root.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
      swapDeelWordmarkImage(image);
    });

    root.querySelectorAll<HTMLElement>('p, th, td, div, span').forEach((node) => {
      if (node.closest('header, nav')) {
        return;
      }

      if (node.textContent?.replace(/\s+/g, ' ').trim() === 'deel.') {
        node.textContent = 'Bridge';
      }
    });

    const embeddedG2Widget = root.querySelector<HTMLIFrameElement>('#g2-crowd-widget-default');
    const g2MomentumSection = embeddedG2Widget?.closest<HTMLElement>('.mui-mpqocb');
    const g2WidgetPanel = embeddedG2Widget?.closest<HTMLElement>('.mui-5mw997');
    const g2WidgetCallToAction = embeddedG2Widget
      ?.closest('.mui-mpqocb')
      ?.querySelector<HTMLAnchorElement>('a[href="#"]');
    const g2Disclaimer = Array.from(root.querySelectorAll<HTMLElement>('p')).find((node) =>
      node.textContent
        ?.replace(/\s+/g, ' ')
        .trim()
        .includes('The data coming from G2 was collected as of April 2025'),
    );

    if (g2MomentumSection) {
      g2MomentumSection.remove();
    } else if (g2WidgetPanel) {
      g2WidgetPanel.remove();
    } else if (embeddedG2Widget) {
      embeddedG2Widget.remove();
    }

    if (g2WidgetCallToAction) {
      g2WidgetCallToAction.removeAttribute('href');
      g2WidgetCallToAction.setAttribute('role', 'button');
      g2WidgetCallToAction.setAttribute('aria-disabled', 'true');
      g2WidgetCallToAction.style.pointerEvents = 'none';
    }

    g2Disclaimer?.remove();

    root.querySelector<HTMLElement>('.mui-127lg40')?.remove();

    const supportFiguresSection = Array.from(
      root.querySelectorAll<HTMLElement>('.key-figures-wrapper .mui-15w27yj'),
    ).find((section) =>
      section.textContent
        ?.replace(/\s+/g, ' ')
        .trim()
        .includes('Elevating customer support to new heights'),
    );

    if (supportFiguresSection) {
      const leftContentWrap = supportFiguresSection.querySelector<HTMLElement>('.mui-w3juvo');
      const rightStatsWrap = supportFiguresSection.querySelector<HTMLElement>('.mui-18v995w');
      const heading = supportFiguresSection.querySelector<HTMLElement>('.mui-w3juvo .mui-6cjdbr');
      const paragraph = supportFiguresSection.querySelector<HTMLElement>('.mui-w3juvo .mui-4qpmvq');
      const statCards = supportFiguresSection.querySelectorAll<HTMLElement>('.mui-18v995w .mui-1v2rawv');
      const supportStats = [
        {
          title: 'Faster hiring cycles',
          description: 'through AI-assisted matching and coordinated delivery support',
        },
        {
          title: 'Pre-vetted talent',
          description:
            'across engineering, AI, product, design, marketing, operations, and support',
        },
        {
          title: 'End-to-end coordination',
          description: 'from talent discovery to onboarding and ongoing execution',
        },
        {
          title: 'Scalable delivery',
          description: 'for individual roles, flexible teams, and business-critical projects',
        },
      ];

      if (heading) {
        heading.textContent = 'Elevating workforce delivery with smarter support';
      }

      if (paragraph) {
        paragraph.textContent =
          'Dechub Bridge combines technology, talent operations, and hands-on support to help businesses move faster with less friction. From sourcing and coordination to execution and scale, our platform is designed to keep teams supported, workflows efficient, and outcomes consistently high.';
      }

      statCards.forEach((card, index) => {
        const stat = supportStats[index];
        if (!stat) {
          return;
        }

        const title = card.querySelector<HTMLElement>('.mui-1g5bblc .mui-1f0g2vh');
        const description = card.querySelector<HTMLElement>('.mui-n08czm');

        if (title) {
          title.textContent = stat.title;
        }

        if (description) {
          description.textContent = stat.description;
        }
      });

      const alignSupportContent = () => {
        if (!leftContentWrap || !rightStatsWrap) {
          return;
        }

        leftContentWrap.style.marginTop = '0';
        leftContentWrap.style.marginBottom = '0';
        leftContentWrap.style.transform = '';

        const leftHeight = leftContentWrap.offsetHeight;
        const rightHeight = rightStatsWrap.offsetHeight;

        if (!leftHeight || !rightHeight || rightHeight <= leftHeight) {
          return;
        }

        const offset = Math.max((rightHeight - leftHeight) / 2, 0);
        leftContentWrap.style.marginTop = `${offset}px`;
        leftContentWrap.style.marginBottom = `${offset}px`;
      };

      alignSupportContent();
      window.requestAnimationFrame(alignSupportContent);
      window.setTimeout(alignSupportContent, 120);
    }

    const finalMetricsSections = Array.from(
      root.querySelectorAll<HTMLElement>('.key-figures-wrapper .mui-57ckbi'),
    );
    const finalMetricsSection =
      finalMetricsSections.length > 0 ? finalMetricsSections[finalMetricsSections.length - 1] : null;

    if (finalMetricsSection) {
      const metricCards = finalMetricsSection.querySelectorAll<HTMLElement>('.mui-179v373');
      const metricsGrid = finalMetricsSection.querySelector<HTMLElement>('.mui-ze9kid');
      const ctaWrap = finalMetricsSection.querySelector<HTMLElement>('.mui-74zl7b');
      const ctaButton = finalMetricsSection.querySelector<HTMLButtonElement>('.mui-74zl7b button');
      const metrics: Array<{ value: string; label: string }> = [
        {
          value: '150+',
          label: 'pre-vetted skill areas',
        },
        {
          value: '+40,000',
          label: 'curated talent profiles and candidate signals',
        },
        {
          value: 'AI-powered',
          label: 'matching, screening, and workflow support',
        },
        {
          value: 'End-to-end',
          label: 'hiring, coordination, and delivery support',
        },
      ];

      metricCards.forEach((card: HTMLElement, index: number) => {
        const metric = metrics[index];
        if (!metric) {
          return;
        }

        const value = card.querySelector<HTMLElement>('.key-fig-title');
        const label = card.querySelector<HTMLElement>('.key-fig-subtitle');

        if (value) {
          value.textContent = metric.value;
        }

        if (label) {
          label.textContent = metric.label;
        }

        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.style.justifyContent = 'flex-start';
        card.style.textAlign = 'center';

        if (value) {
          value.style.textAlign = 'center';
          value.style.width = '100%';
        }

        if (label) {
          label.style.textAlign = 'center';
          label.style.width = '100%';
        }
      });

      if (metricsGrid) {
        metricsGrid.style.alignItems = 'center';
      }

      if (ctaWrap) {
        ctaWrap.style.display = 'flex';
        ctaWrap.style.justifyContent = 'center';
        ctaWrap.style.width = '100%';
        ctaWrap.style.marginTop = '28px';
      }

      if (ctaButton) {
        ctaButton.textContent = 'Book a demo';
        ctaButton.setAttribute('data-demo-trigger', 'true');
      }
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

      if (normalizeLabel(anchor.textContent) === 'book a demo') {
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

    const cleanupExploreMoreSlider = wireSlider(root, 'nav-explore-more', 'explore-more');
    const cleanupTestimonialsSlider = wireSlider(root, 'nav-testimonials-slider-832', 'testimonials-slider-832');
    const ownedEntitiesHeaderObserver =
      ownedEntitiesBridgeHeaderCell &&
      new MutationObserver(() => {
        renderBridgeHeaderLogo(ownedEntitiesBridgeHeaderCell);
      });

    if (ownedEntitiesHeaderObserver && ownedEntitiesBridgeHeaderCell) {
      ownedEntitiesHeaderObserver.observe(ownedEntitiesBridgeHeaderCell, {
        childList: true,
        subtree: true,
      });
    }

    root.addEventListener('click', handleAnchorClick);

    return () => {
      root.removeEventListener('click', handleAnchorClick);
      cleanupExploreMoreSlider();
      cleanupTestimonialsSlider();
      ownedEntitiesHeaderObserver?.disconnect();
    };
  }, []);

  return (
    <SharedLandingPageLayout>
      <div ref={rootRef} data-page="deel-vs-competitors-react" style={{ overflowAnchor: 'none' }}>
        <DeelVsCompetitorsContent />
      </div>
    </SharedLandingPageLayout>
  );
}
