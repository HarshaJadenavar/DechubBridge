import { useEffect, useMemo, useRef, useState } from 'react';
import logoImage from './assets/logo.png';
import './landing.css';

interface LandingPageProps {
  onLogin: () => void;
  onGetStarted: () => void;
  onMarketplace: () => void;
  onMarketplaceSearch: (query: string) => void;
}

const HERO_SERVICE_CHIPS = [
  'Architecture & Interior Design',
  'Graphic Design',
  'Website Developer',
];

const HERO_TITLE_LINES = ['Hire, Pay & Manage', 'Global Contractors without the chaos'] as const;

const SPEED_SCENARIOS = {
  payroll: {
    label: 'Dechub-Bridge Payroll',
    theme: 'blue',
    icon: '◔',
    points: [
      { label: 'Today', copy: 'Set up payroll countries and owners' },
      { label: 'Hours later', copy: 'Configure pay rules, approvals, and cutoffs' },
      { label: 'Tomorrow', copy: 'Everyone gets paid on time' },
    ],
  },
  hr: {
    label: 'Dechub-Bridge HR',
    theme: 'yellow',
    icon: '▮',
    points: [
      { label: 'Today', copy: 'Sofia is added to your HR system' },
      { label: 'Hours later', copy: 'Assign and track onboarding tasks' },
      { label: 'Tomorrow', copy: 'Approve and manage time off' },
    ],
  },
  it: {
    label: 'Dechub-Bridge IT',
    theme: 'purple',
    icon: '▣',
    points: [
      { label: 'Today', copy: 'Choose a laptop for Sofia' },
      { label: 'Day 3', copy: 'Dechub-Bridge ships equipment to Spain' },
      { label: 'Hours later', copy: 'Sofia is ready for her first day' },
    ],
  },
  hire: {
    label: 'Dechub-Bridge Hire',
    theme: 'yellow',
    icon: '↗',
    points: [
      { label: 'Today', copy: 'Decide to hire Sofia from Spain' },
      { label: 'Minutes later', copy: 'Send Sofia a compliant local contract' },
      { label: 'Same day', copy: 'Sofia starts onboarding in Dechub-Bridge' },
    ],
  },
} as const;

type SpeedScenarioKey = keyof typeof SPEED_SCENARIOS;

const CASE_STUDIES = [
  {
    image: '/assets/images/1LSUOyLvfeSzgUYYr4dDm9VzClI.jpg',
    title: 'Automated internal workflows and reporting systems.',
    summary: 'Saved 4+ hours daily and reduced manual errors by 60%.',
  },
  {
    image: '/assets/images/0gsPrzDEBrQ4buIPWQfYgibSyVk.jpg',
    title: 'Streamlined contractor onboarding across distributed teams.',
    summary: 'Accelerated approvals and improved start-time readiness for every hire.',
  },
  {
    image: '/assets/images/3aBEQKMKuIVrHtOwISRdfetG6c-025d37d2f4.jpg',
    title: 'Unified hiring operations, documents, and payment setup.',
    summary: 'Removed handoff friction and helped teams scale contractor workflows faster.',
  },
] as const;

const TESTIMONIALS = [
  {
    image: '/assets/images/1LSUOyLvfeSzgUYYr4dDm9VzClI.jpg',
    name: 'Daniel Roy',
    role: 'Operations Manager, BrightStack',
    quote:
      'Dechub-Bridge helped us structure contractor onboarding fast. Contracts, approvals, and payment prep all moved in one smooth workflow.',
  },
  {
    image: '/assets/images/3aBEQKMKuIVrHtOwISRdfetG6c-2872eb0f92.jpg',
    name: 'Rhea D’Souza',
    role: 'Founder, Studio Rhea',
    quote:
      'We stopped chasing documents across email. Dechub-Bridge gave us a cleaner system for onboarding, signatures, and contractor coordination.',
  },
  {
    image: '/assets/images/0gsPrzDEBrQ4buIPWQfYgibSyVk.jpg',
    name: 'Michael Evans',
    role: 'Marketing Lead, Nova',
    quote:
      'The platform made contractor operations far more reliable. We now track every hiring step and payment milestone without the old confusion.',
  },
  {
    image: '/assets/images/3aBEQKMKuIVrHtOwISRdfetG6c-5dbb33a2a2.jpg',
    name: 'Sofia Turner',
    role: 'People Ops, Ember Lane',
    quote:
      'Our hiring team finally has one place for contractor records, onboarding status, and next actions. It cut manual follow-up dramatically.',
  },
  {
    image: '/assets/images/3aBEQKMKuIVrHtOwISRdfetG6c-fd3457e43a.jpg',
    name: 'Chris Nolan',
    role: 'Finance Manager, Greyfield',
    quote:
      'Dechub-Bridge made payout setup and approval flow much easier to manage. The visibility alone saved our team hours every week.',
  },
] as const;

const COVERAGE_TRACKS = [
  {
    code: 'US',
    track: 'Track 2 - US Contractors',
    status: 'Live now',
    statusTone: 'live',
    title: 'Hire US-based independent contractors from any country.',
    description:
      'Full contract, KYC, e-sign, and Wise payout pipeline - production ready.',
    bullets: [
      'USD contracts with DocuSign e-signature',
      'W-9 / W-8BEN tax form guidance',
      'Wise global payout in 1-2 business days',
      'KYC identity verification',
      'Completion certificate at contract end',
    ],
  },
  {
    code: 'IN',
    track: 'Track 1 - India Payroll',
    status: 'Coming Q3 2026',
    statusTone: 'soon',
    title: 'Full India statutory payroll with TDS, PF, ESI, and Form 16.',
    description: 'For Indian employees hired by foreign companies.',
    bullets: [
      'INR payroll with TDS deduction',
      'PF & ESI compliance',
      'Form 16 auto-generation',
      'India banking & UPI integration',
    ],
  },
] as const;

const FAQ_ITEMS = [
  {
    question: 'How does Dechub-Bridge help with US contractor hiring?',
    answer:
      'Dechub-Bridge gives teams one flow for contractor onboarding, USD contracts, DocuSign e-signature, KYC verification, and Wise payouts for US-based independent contractors.',
  },
  {
    question: 'Can I use Dechub-Bridge from outside the United States?',
    answer:
      'Yes. Foreign companies can use Dechub-Bridge to hire and manage US contractors remotely, while keeping contract records, tax guidance, approvals, and payout steps in one place.',
  },
  {
    question: 'What is included in the current live track?',
    answer:
      'The live track covers US contractors with contract generation, W-9 and W-8BEN guidance, identity verification, DocuSign signatures, Wise payout processing, and completion certificates.',
  },
  {
    question: 'When is India payroll support coming?',
    answer:
      'India payroll is planned for Q3 2026 with support for INR payroll, TDS deduction, PF and ESI compliance, Form 16 generation, and India banking and UPI integrations.',
  },
  {
    question: 'What kind of support does Dechub-Bridge offer during setup?',
    answer:
      'We help teams structure their onboarding flow, configure contractor operations, and standardize payout and document steps so rollout is smooth from the beginning.',
  },
] as const;

const SOLUTION_CARD_COUNT = 6;

export default function LandingPage({
  onLogin,
  onGetStarted,
  onMarketplaceSearch,
}: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpeedScenario, setActiveSpeedScenario] = useState<SpeedScenarioKey>('hr');
  const [activeCaseStudy, setActiveCaseStudy] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [activeSolutionCard, setActiveSolutionCard] = useState<number | null>(null);
  const [activeSolutionFace, setActiveSolutionFace] = useState<'front' | 'back'>('back');
  const [solutionPointer, setSolutionPointer] = useState(0);
  const [isSolutionHovered, setIsSolutionHovered] = useState(false);
  const [isSolutionsInView, setIsSolutionsInView] = useState(false);
  const solutionsSectionRef = useRef<HTMLDivElement | null>(null);
  const coverageSectionRef = useRef<HTMLElement | null>(null);
  const [coverageScrollProgress, setCoverageScrollProgress] = useState(0);

  const submitMarketplaceSearch = useMemo(
    () => () => onMarketplaceSearch(searchQuery.trim()),
    [onMarketplaceSearch, searchQuery],
  );

  const speedScenario = SPEED_SCENARIOS[activeSpeedScenario];
  const caseStudy = CASE_STUDIES[activeCaseStudy];

  const showPreviousCaseStudy = () => {
    setActiveCaseStudy((current) => (current === 0 ? CASE_STUDIES.length - 1 : current - 1));
  };

  const showNextCaseStudy = () => {
    setActiveCaseStudy((current) => (current === CASE_STUDIES.length - 1 ? 0 : current + 1));
  };

  const visibleTestimonials = Array.from({ length: 3 }, (_, offset) =>
    TESTIMONIALS[(activeTestimonial + offset) % TESTIMONIALS.length],
  );

  const showPreviousTestimonials = () => {
    setActiveTestimonial((current) => (current === 0 ? TESTIMONIALS.length - 1 : current - 1));
  };

  const showNextTestimonials = () => {
    setActiveTestimonial((current) => (current === TESTIMONIALS.length - 1 ? 0 : current + 1));
  };

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('.landing-reveal'));

    if (revealElements.length === 0) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const section = solutionsSectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSolutionsInView(entry.isIntersecting);
      },
      {
        threshold: 0.3,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isSolutionHovered) {
      setActiveSolutionCard(null);
      setActiveSolutionFace('front');
      return;
    }

    if (!isSolutionsInView) {
      setActiveSolutionCard(null);
      setActiveSolutionFace('back');
      return;
    }

    let timeoutId: number | undefined;

    if (activeSolutionCard === null) {
      timeoutId = window.setTimeout(() => {
        setActiveSolutionCard(solutionPointer);
        setActiveSolutionFace('front');
      }, 260);
    } else if (activeSolutionFace === 'front') {
      timeoutId = window.setTimeout(() => {
        setActiveSolutionFace('back');
      }, 1800);
    } else {
      timeoutId = window.setTimeout(() => {
        setActiveSolutionCard(null);
        setSolutionPointer((current) => (current + 1) % SOLUTION_CARD_COUNT);
      }, 620);
    }

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeSolutionCard, activeSolutionFace, isSolutionHovered, isSolutionsInView, solutionPointer]);

  useEffect(() => {
    const section = coverageSectionRef.current;

    if (!section) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCoverageScrollProgress(1);
      return;
    }

    let frameId = 0;

    const updateCoverageProgress = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const totalTravel = viewportHeight + rect.height * 0.45;
      const rawProgress = (viewportHeight - rect.top) / totalTravel;
      const nextProgress = Math.max(0, Math.min(1, rawProgress));
      setCoverageScrollProgress((current) =>
        Math.abs(current - nextProgress) < 0.001 ? current : nextProgress,
      );
      frameId = 0;
    };

    const requestCoverageProgressUpdate = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateCoverageProgress);
    };

    requestCoverageProgressUpdate();

    window.addEventListener('scroll', requestCoverageProgressUpdate, { passive: true });
    window.addEventListener('resize', requestCoverageProgressUpdate);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('scroll', requestCoverageProgressUpdate);
      window.removeEventListener('resize', requestCoverageProgressUpdate);
    };
  }, []);

  const getSolutionCardClassName = (baseClassName: string, cardIndex: number) => {
    const isFrontVisible =
      isSolutionHovered || (activeSolutionCard === cardIndex && activeSolutionFace === 'front');
    return `${baseClassName}${isFrontVisible ? '' : ' is-flipped'}`;
  };

  const getCoverageCardStyle = (direction: 'left' | 'right') => {
    const travel = window.innerWidth <= 768 ? 28 : 72;
    const offset = (1 - coverageScrollProgress) * travel;

    return {
      '--coverage-shift': `${direction === 'left' ? -offset : offset}px`,
      '--coverage-opacity': 0.42 + coverageScrollProgress * 0.58,
    } as React.CSSProperties;
  };

  const renderAnimatedHeroLine = (line: string, lineIndex: number) => {
    let letterIndex = 0;

    return (
      <span className="landing-hero-v2__title-line" key={line}>
        {line.split('').map((character, index) => {
          if (character === ' ') {
            return (
              <span key={`${lineIndex}-${index}`} className="landing-hero-v2__title-space" aria-hidden="true">
                &nbsp;
              </span>
            );
          }

          const delay = `${letterIndex * 0.045}s`;
          letterIndex += 1;

          return (
            <span
              key={`${lineIndex}-${index}`}
              className="landing-hero-v2__title-letter"
              style={{ animationDelay: delay }}
              aria-hidden="true"
            >
              {character}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className="landing-root">
      <section className="landing-hero landing-hero-v2">
        <div className="landing-hero-v2__shell">
          <video
            className="landing-hero-v2__video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source src="/assets/videos/DJis4jbvxfiPHNnoy09s1NXK2tY.mp4" type="video/mp4" />
          </video>
          <div className="landing-hero-v2__overlay" />

          <nav className="landing-hero-v2__nav" aria-label="Primary">
            <button type="button">Home</button>
            <button type="button">About</button>
            <button type="button" className="landing-hero-v2__nav-logo" aria-label="Dechub home">
              <img className="landing-hero-v2__nav-logo-image" src={logoImage} alt="" aria-hidden="true" />
            </button>
            <button type="button">Blog</button>
            <button type="button">Contact</button>
          </nav>

          <div className="landing-hero-v2__content">
            <h1
              className="landing-hero-v2__title"
              aria-label="Hire, Pay and Manage Global Contractors without the chaos"
            >
              {HERO_TITLE_LINES.map((line, index) => renderAnimatedHeroLine(line, index))}
            </h1>

            <p className="landing-hero-v2__copy">
              Dechub-Bridge is the all-in-one platform to onboard US contractors, generate contracts,
              collect e-signatures, and process payments via Wise - all from one dashboard.
            </p>

            <div className="landing-hero-search landing-hero-v2__search">
              <input
                type="text"
                value={searchQuery}
                placeholder="Search for any service..."
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    submitMarketplaceSearch();
                  }
                }}
              />
              <button type="button" aria-label="Search marketplace" onClick={submitMarketplaceSearch}>
                <span />
              </button>
            </div>

            <div className="landing-service-pills landing-hero-v2__chips">
              {HERO_SERVICE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setSearchQuery(chip);
                    onMarketplaceSearch(chip);
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="landing-hero-v2__actions">
              <button type="button" className="landing-hero-v2__primary" onClick={onGetStarted}>
                Get Started
              </button>
              <button type="button" className="landing-hero-v2__secondary" onClick={onLogin}>
                Book a demo
              </button>
            </div>
          </div>

          <div className="landing-hero-v2__brands" aria-label="Trusted brands">
            <div className="landing-hero-v2__brands-track">
              <span>Logoipsur</span>
              <span className="landing-hero-v2__brands-dot" aria-hidden="true">•</span>
              <span className="landing-hero-v2__brands-wordmark">LOGO</span>
              <span className="landing-hero-v2__brands-dot" aria-hidden="true">•</span>
              <span className="landing-hero-v2__brands-italic">Logoipsur</span>
              <span className="landing-hero-v2__brands-dot" aria-hidden="true">•</span>
              <span>Logoipsur</span>
              <span className="landing-hero-v2__brands-dot" aria-hidden="true">•</span>
              <span className="landing-hero-v2__brands-wordmark">LOGO</span>
              <span className="landing-hero-v2__brands-dot" aria-hidden="true">•</span>
              <span className="landing-hero-v2__brands-italic">Logoipsur</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-speed-section" aria-labelledby="landing-speed-title">
        <div className="landing-speed-section__shell landing-reveal">
          <div className="landing-speed-section__backdrop" aria-hidden="true">
            20M
          </div>
          <h2 id="landing-speed-title" className="landing-speed-section__title">
            <span className="landing-speed-section__line landing-speed-section__line--left">
              <span>Get a resource in </span>
              <span className="landing-speed-section__accent">20 minutes</span>
            </span>
            <span className="landing-speed-section__line landing-speed-section__line--right">
              <span>with </span>
              <span className="landing-speed-section__accent">10 days</span>
              <span> free trial</span>
            </span>
          </h2>
        </div>
      </section>

      <section className="landing-how-section" aria-labelledby="landing-how-title">
        <div className="landing-how-section__shell landing-reveal">
          <div className="landing-how-section__intro">
            <span className="landing-how-section__eyebrow">How it works</span>
            <h2 id="landing-how-title" className="landing-how-section__title">
              How Dechub-Bridge
              <br />
              helps you hire faster
            </h2>
          </div>

          <div className="landing-how-section__grid">
            <article className="landing-how-card-v2">
              <p className="landing-how-card-v2__step">Step 1.</p>
              <div className="landing-how-card-v2__frame">
                <div className="landing-how-card-v2__panel">
                  <h3>Hiring Brief</h3>
                  <p>Role, skills, budget, and timeline</p>
                  <div className="landing-how-card-v2__divider" />

                  <div className="landing-how-card-v2__list">
                    <div className="landing-how-card-v2__row">
                      <span className="landing-how-card-v2__icon">[]</span>
                      <div>
                        <small>Role needed</small>
                        <strong>Frontend Developer</strong>
                      </div>
                    </div>

                    <div className="landing-how-card-v2__row">
                      <span className="landing-how-card-v2__icon">&lt;/&gt;</span>
                      <div>
                        <small>Skills required</small>
                        <strong>React, Next.js, Tailwind</strong>
                      </div>
                    </div>

                    <div className="landing-how-card-v2__row">
                      <span className="landing-how-card-v2__icon">$</span>
                      <div>
                        <small>Budget range</small>
                        <strong>$800 - $1200 / month</strong>
                      </div>
                    </div>

                    <div className="landing-how-card-v2__row">
                      <span className="landing-how-card-v2__icon">7D</span>
                      <div>
                        <small>Timeline</small>
                        <strong>Need to start in 7 days</strong>
                      </div>
                    </div>

                    <div className="landing-how-card-v2__row is-muted">
                      <span className="landing-how-card-v2__icon">H</span>
                      <div>
                        <small>Hiring type</small>
                        <strong>Remote contractor</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="landing-how-card-v2__copy">
                  <h3>Share your requirement</h3>
                  <p>
                    Tell Dechub-Bridge who you need by sharing the role, skills, timeline,
                    and budget you are looking for.
                  </p>
                </div>
              </div>
            </article>

            <article className="landing-how-card-v2">
              <p className="landing-how-card-v2__step">Step 2.</p>
              <div className="landing-how-card-v2__frame">
                <div className="landing-how-card-v2__panel">
                  <h3>Curated Profiles</h3>
                  <p>Shortlisted for your requirement</p>
                  <div className="landing-how-card-v2__divider" />

                  <div className="landing-how-card-v2__list">
                    <div className="landing-how-card-v2__row">
                      <span className="landing-how-card-v2__icon is-number">1</span>
                      <div>
                        <small>Profile 1</small>
                        <strong>Frontend Developer</strong>
                      </div>
                    </div>

                    <div className="landing-how-card-v2__row">
                      <span className="landing-how-card-v2__icon is-number">2</span>
                      <div>
                        <small>Profile 2</small>
                        <strong>UI Engineer</strong>
                      </div>
                    </div>

                    <div className="landing-how-card-v2__row">
                      <span className="landing-how-card-v2__icon is-number">3</span>
                      <div>
                        <small>Profile 3</small>
                        <strong>Web Developer</strong>
                      </div>
                    </div>

                    <div className="landing-how-card-v2__row is-muted">
                      <span className="landing-how-card-v2__icon">AV</span>
                      <div>
                        <small>Availability</small>
                        <strong>2 available this week</strong>
                      </div>
                    </div>

                    <div className="landing-how-card-v2__row is-muted">
                      <span className="landing-how-card-v2__icon">OK</span>
                      <div>
                        <small>Match status</small>
                        <strong>Best-fit profiles shared</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="landing-how-card-v2__copy">
                  <h3>Curated profile matching</h3>
                  <p>
                    The Dechub-Bridge team reviews your requirement and shares suitable
                    curated profiles with you.
                  </p>
                </div>
              </div>
            </article>

            <article className="landing-how-card-v2">
              <p className="landing-how-card-v2__step">Step 3.</p>
              <div className="landing-how-card-v2__frame">
                <div className="landing-how-card-v2__panel">
                  <h3>Contracts, Signatures, Payments</h3>
                  <p>Everything in one workflow</p>
                  <div className="landing-how-card-v2__divider" />

                  <div className="landing-how-card-v2__mini-tabs">
                    <span className="is-green">Contract</span>
                    <span className="is-blue">E-signature</span>
                    <span className="is-orange">Payment setup</span>
                  </div>

                  <div className="landing-how-card-v2__workflow">
                    <h4>Hiring workflow</h4>
                    <p>Move from selection to onboarding smoothly</p>
                    <ul>
                      <li className="is-green">Contract generated</li>
                      <li className="is-green">Pending approval</li>
                      <li className="is-blue">E-signature sent</li>
                      <li className="is-soft-green">Payment setup ready</li>
                      <li className="is-soft-blue">Ready to onboard</li>
                      <li className="is-soft-blue">Can start immediately</li>
                      <li className="is-soft-orange">Hiring completed</li>
                    </ul>
                  </div>
                </div>

                <div className="landing-how-card-v2__copy">
                  <h3>Hire and manage smoothly</h3>
                  <p>
                    Use Dechub-Bridge to handle onboarding, agreements, and contractor
                    management from one place.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-solutions-section" aria-labelledby="landing-solutions-title">
        <div ref={solutionsSectionRef} className="landing-solutions-section__shell landing-reveal">
          <div className="landing-solutions-section__intro">
            <span className="landing-solutions-section__eyebrow">Our solutions</span>
            <h2 id="landing-solutions-title" className="landing-solutions-section__title">
              Platform solutions that help you
              <br />
              hire faster and manage smarter
            </h2>
          </div>

          <div className="landing-solutions-grid">
            <article
              className={getSolutionCardClassName('landing-solution-card landing-solution-card--top landing-solution-card--workflow', 0)}
              onMouseEnter={() => setIsSolutionHovered(true)}
              onMouseLeave={() => setIsSolutionHovered(false)}
            >
              <div className="landing-solution-card__flip">
                <div className="landing-solution-card__face landing-solution-card__face--front">
                  <div className="landing-solution-card__copy">
                    <h3>Contractor Onboarding.</h3>
                    <p>
                      Collect worker details, role scope, budget, and start timelines in one structured intake flow.
                    </p>
                  </div>
                  <div className="landing-solution-card__visual landing-solution-card__visual--workflow">
                    <div className="landing-solution-workflow">
                      <div className="landing-solution-workflow__item is-complete">
                        <span className="landing-solution-workflow__icon">ID</span>
                        <div>
                          <strong>Collect contractor details</strong>
                          <small>Name, role, country, and documents</small>
                        </div>
                        <em />
                      </div>
                      <div className="landing-solution-workflow__dots" />
                      <div className="landing-solution-workflow__item is-pending">
                        <span className="landing-solution-workflow__icon">KYB</span>
                        <div>
                          <strong>Review compliance inputs</strong>
                          <small>Scope, pricing, and legal details</small>
                        </div>
                        <em />
                      </div>
                      <div className="landing-solution-workflow__dots" />
                      <div className="landing-solution-workflow__item is-alert">
                        <span className="landing-solution-workflow__icon">$</span>
                        <div>
                          <strong>Approve payout setup</strong>
                          <small>Currency, cadence, and Wise method</small>
                        </div>
                        <em />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="landing-solution-card__face landing-solution-card__face--back">
                  <img className="landing-solution-card__back-logo" src={logoImage} alt="" aria-hidden="true" />
                  <h3>Contractor Onboarding.</h3>
                </div>
              </div>
            </article>

            <article
              className={getSolutionCardClassName('landing-solution-card landing-solution-card--top landing-solution-card--voice', 1)}
              onMouseEnter={() => setIsSolutionHovered(true)}
              onMouseLeave={() => setIsSolutionHovered(false)}
            >
              <div className="landing-solution-card__flip">
                <div className="landing-solution-card__face landing-solution-card__face--front">
              <div className="landing-solution-card__visual landing-solution-card__visual--voice">
                <div className="landing-solution-call">
                  <div className="landing-solution-call__wave" />
                  <div className="landing-solution-call__button">☎</div>
                  <div className="landing-solution-call__wave is-right" />
                </div>
              </div>
              <div className="landing-solution-card__copy">
                <h3>Follow-up Automation.</h3>
                <p>
                  Keep contractor onboarding moving with reminders for signatures, approvals, and missing details.
                </p>
              </div>
                </div>
                <div className="landing-solution-card__face landing-solution-card__face--back">
                  <img className="landing-solution-card__back-logo" src={logoImage} alt="" aria-hidden="true" />
                  <h3>Follow-up Automation.</h3>
                </div>
              </div>
            </article>

            <article
              className={getSolutionCardClassName('landing-solution-card landing-solution-card--top landing-solution-card--analytics', 2)}
              onMouseEnter={() => setIsSolutionHovered(true)}
              onMouseLeave={() => setIsSolutionHovered(false)}
            >
              <div className="landing-solution-card__flip">
                <div className="landing-solution-card__face landing-solution-card__face--front">
              <div className="landing-solution-card__visual landing-solution-card__visual--analytics">
                <div className="landing-solution-analytics">
                  <div className="landing-solution-analytics__metrics">
                    <div>
                      <small>CONTRACT VALUE</small>
                      <strong>$320,000</strong>
                    </div>
                    <div>
                      <small>PAID</small>
                      <strong>$120,000</strong>
                    </div>
                    <div>
                      <small>DUE</small>
                      <strong>$200,000</strong>
                    </div>
                  </div>
                  <div className="landing-solution-analytics__chart" />
                  <div className="landing-solution-analytics__rows">
                    <span><b>Support</b><i>$2190</i><em /></span>
                    <span><b>Payroll</b><i>$2539</i><em /></span>
                    <span><b>Tools</b><i>$1320</i><em /></span>
                    <span><b>Marketing</b><i>$2450</i><em /></span>
                  </div>
                </div>
              </div>
              <div className="landing-solution-card__copy">
                <h3>Hiring Analytics.</h3>
                <p>
                  Track contract value, payout status, and onboarding progress through one clean operations view.
                </p>
              </div>
                </div>
                <div className="landing-solution-card__face landing-solution-card__face--back">
                  <img className="landing-solution-card__back-logo" src={logoImage} alt="" aria-hidden="true" />
                  <h3>Hiring Analytics.</h3>
                </div>
              </div>
            </article>

            <article
              className={getSolutionCardClassName('landing-solution-card landing-solution-card--bottom landing-solution-card--agents', 3)}
              onMouseEnter={() => setIsSolutionHovered(true)}
              onMouseLeave={() => setIsSolutionHovered(false)}
            >
              <div className="landing-solution-card__flip">
                <div className="landing-solution-card__face landing-solution-card__face--front">
              <div className="landing-solution-card__visual landing-solution-card__visual--agents">
                <div className="landing-solution-people">
                  <div className="landing-solution-people__row">
                    <span className="is-green" />
                    <div className="landing-solution-people__avatar">D</div>
                    <div>
                      <strong>David</strong>
                      <small>Project Manager</small>
                    </div>
                  </div>
                  <div className="landing-solution-people__row">
                    <span className="is-red" />
                    <div className="landing-solution-people__avatar">C</div>
                    <div>
                      <strong>Chris</strong>
                      <small>Social Media Manager</small>
                    </div>
                  </div>
                  <div className="landing-solution-people__row">
                    <span className="is-soft" />
                    <div className="landing-solution-people__avatar">J</div>
                    <div>
                      <strong>Julie</strong>
                      <small>Copywriter</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="landing-solution-card__copy">
                <h3>Curated Talent Matching.</h3>
                <p>
                  Share the role once and get shortlisted contractor profiles aligned to skills, budget, and timeline.
                </p>
              </div>
                </div>
                <div className="landing-solution-card__face landing-solution-card__face--back">
                  <img className="landing-solution-card__back-logo" src={logoImage} alt="" aria-hidden="true" />
                  <h3>Curated Talent Matching.</h3>
                </div>
              </div>
            </article>

            <article
              className={getSolutionCardClassName('landing-solution-card landing-solution-card--bottom landing-solution-card--suite', 4)}
              onMouseEnter={() => setIsSolutionHovered(true)}
              onMouseLeave={() => setIsSolutionHovered(false)}
            >
              <div className="landing-solution-card__flip">
                <div className="landing-solution-card__face landing-solution-card__face--front">
              <div className="landing-solution-card__copy">
                <h3>Operations Workspace.</h3>
                <p>
                  Centralize contracts, documents, invoicing, and onboarding tasks so nothing gets lost across tools.
                </p>
              </div>
              <div className="landing-solution-card__visual landing-solution-card__visual--suite">
                <div className="landing-solution-suite">
                  <div className="landing-solution-suite__top">
                    <strong>Dechub-Bridge Workspace</strong>
                    <span />
                  </div>
                  <div className="landing-solution-suite__search">Search contractor records...</div>
                  <div className="landing-solution-suite__menu">
                    <span>Contracts</span>
                    <span>Invoices</span>
                    <span>Signatures</span>
                    <span>Compliance</span>
                    <span>Payouts</span>
                    <span>Workers</span>
                  </div>
                </div>
              </div>
                </div>
                <div className="landing-solution-card__face landing-solution-card__face--back">
                  <img className="landing-solution-card__back-logo" src={logoImage} alt="" aria-hidden="true" />
                  <h3>Operations Workspace.</h3>
                </div>
              </div>
            </article>

            <article
              className={getSolutionCardClassName('landing-solution-card landing-solution-card--bottom landing-solution-card--portal', 5)}
              onMouseEnter={() => setIsSolutionHovered(true)}
              onMouseLeave={() => setIsSolutionHovered(false)}
            >
              <div className="landing-solution-card__flip">
                <div className="landing-solution-card__face landing-solution-card__face--front">
              <div className="landing-solution-card__visual landing-solution-card__visual--portal">
                <div className="landing-solution-portal">
                  <div className="landing-solution-portal__chip">Worker portal</div>
                  <div className="landing-solution-portal__bar" />
                  <div className="landing-solution-portal__bar is-short" />
                </div>
              </div>
              <div className="landing-solution-card__copy">
                <h3>Worker Self-Serve Portal.</h3>
                <p>
                  Let contractors review requests, upload documents, and complete onboarding steps without back-and-forth.
                </p>
              </div>
                </div>
                <div className="landing-solution-card__face landing-solution-card__face--back">
                  <img className="landing-solution-card__back-logo" src={logoImage} alt="" aria-hidden="true" />
                  <h3>Worker Self-Serve Portal.</h3>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-speed-timeline" aria-labelledby="landing-speed-timeline-title">
        <div className="landing-speed-timeline__shell landing-reveal">
          <p className="landing-speed-timeline__eyebrow">DECHUB-BRIDGE SPEED</p>
          <h2 id="landing-speed-timeline-title" className="landing-speed-timeline__title">
            Accomplish more in less time
          </h2>

          <div className="landing-speed-timeline__tabs" role="tablist" aria-label="Dechub-Bridge speed scenarios">
            {(Object.entries(SPEED_SCENARIOS) as Array<[SpeedScenarioKey, (typeof SPEED_SCENARIOS)[SpeedScenarioKey]]>).map(
              ([key, scenario]) => {
                const isActive = key === activeSpeedScenario;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`landing-speed-timeline__tab landing-speed-timeline__tab--${scenario.theme}${isActive ? ' is-active' : ''}`}
                    onClick={() => setActiveSpeedScenario(key)}
                  >
                    <span className="landing-speed-timeline__tab-icon" aria-hidden="true">{scenario.icon}</span>
                    <span>{scenario.label}</span>
                  </button>
                );
              },
            )}
          </div>

          <div className="landing-speed-timeline__rail" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="landing-speed-timeline__grid">
            {speedScenario.points.map((point) => (
              <div key={point.label} className="landing-speed-timeline__point">
                <h3>{point.label}</h3>
                <div className={`landing-speed-timeline__card landing-speed-timeline__card--${speedScenario.theme}`}>
                  <p>{point.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-case-study-v2" aria-labelledby="landing-case-study-v2-title">
        <div className="landing-case-study-v2__shell landing-reveal">
          <div className="landing-case-study-v2__intro">
            <span className="landing-case-study-v2__eyebrow">Case study</span>
            <h2 id="landing-case-study-v2-title" className="landing-case-study-v2__title">
              How Businesses Use
              <br />
              Our AI to Scale Faster
            </h2>
          </div>

          <div className="landing-case-study-v2__frame">
            <div className="landing-case-study-v2__image-wrap">
              <div className="landing-case-study-v2__notch" aria-hidden="true" />
              <img
                key={caseStudy.image}
                className="landing-case-study-v2__image"
                src={caseStudy.image}
                alt={caseStudy.title}
              />
              <div className="landing-case-study-v2__overlay" />
              <div className="landing-case-study-v2__caption">
                <p>
                  <strong>{caseStudy.title}</strong> {caseStudy.summary}
                </p>
              </div>
            </div>

            <div className="landing-case-study-v2__controls">
              <button
                type="button"
                className="landing-case-study-v2__arrow"
                aria-label="Previous case study"
                onClick={showPreviousCaseStudy}
              >
                ←
              </button>
              <button
                type="button"
                className="landing-case-study-v2__arrow"
                aria-label="Next case study"
                onClick={showNextCaseStudy}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-benefits-v2" aria-labelledby="landing-benefits-v2-title">
        <div className="landing-benefits-v2__shell landing-reveal">
          <div className="landing-benefits-v2__intro">
            <span className="landing-benefits-v2__eyebrow">Benefits</span>
            <h2 id="landing-benefits-v2-title" className="landing-benefits-v2__title">
              What Makes Our Platform
              <br />
              Better for Your Business
            </h2>
          </div>

          <div className="landing-benefits-v2__layout">
            <article className="landing-benefits-v2__card landing-benefits-v2__card--time landing-reveal" style={{ transitionDelay: '40ms' }}>
              <span className="landing-benefits-v2__icon">⌛</span>
              <h3>Faster onboarding.</h3>
              <p>Move contractors from offer to compliant setup without long manual follow-ups.</p>
            </article>

            <article className="landing-benefits-v2__card landing-benefits-v2__card--cost landing-reveal" style={{ transitionDelay: '90ms' }}>
              <span className="landing-benefits-v2__icon">$</span>
              <h3>Lower admin cost.</h3>
              <p>Reduce repetitive paperwork across contracts, signatures, invoicing, and payouts.</p>
            </article>

            <article className="landing-benefits-v2__center landing-reveal" style={{ transitionDelay: '140ms' }}>
              <div className="landing-benefits-v2__center-logo">
                <img className="landing-hero-v2__nav-logo-image" src={logoImage} alt="" aria-hidden="true" />
              </div>
            </article>

            <article className="landing-benefits-v2__card landing-benefits-v2__card--insights landing-reveal" style={{ transitionDelay: '190ms' }}>
              <span className="landing-benefits-v2__icon">◔</span>
              <h3>Clearer visibility.</h3>
              <p>Track contractor status, documents, timelines, and payment readiness in one place.</p>
            </article>

            <article className="landing-benefits-v2__card landing-benefits-v2__card--workflow landing-reveal" style={{ transitionDelay: '240ms' }}>
              <span className="landing-benefits-v2__icon">⏩</span>
              <h3>Smoother workflows.</h3>
              <p>Standardize hiring, onboarding, and contractor operations across every team.</p>
            </article>

            <article className="landing-benefits-v2__card landing-benefits-v2__card--accuracy landing-reveal" style={{ transitionDelay: '290ms' }}>
              <span className="landing-benefits-v2__icon">⚙</span>
              <h3>Higher compliance accuracy.</h3>
              <p>Minimize errors in agreements, approvals, contractor details, and payout setup.</p>
            </article>

            <article className="landing-benefits-v2__card landing-benefits-v2__card--scaling landing-reveal" style={{ transitionDelay: '340ms' }}>
              <span className="landing-benefits-v2__icon">▥</span>
              <h3>Scales with growth.</h3>
              <p>Add more contractors, markets, and workflows without multiplying operational effort.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-testimonial-v2" aria-labelledby="landing-testimonial-v2-title">
        <div className="landing-testimonial-v2__shell landing-reveal">
          <div className="landing-testimonial-v2__header">
            <div className="landing-testimonial-v2__intro">
              <span className="landing-testimonial-v2__eyebrow">Testimonial</span>
              <h2 id="landing-testimonial-v2-title" className="landing-testimonial-v2__title">
                Clients Who&apos;ve
                <br />
                Seen the Difference
              </h2>
            </div>

            <div className="landing-testimonial-v2__controls">
              <button
                type="button"
                className="landing-testimonial-v2__arrow"
                aria-label="Previous testimonials"
                onClick={showPreviousTestimonials}
              >
                ←
              </button>
              <button
                type="button"
                className="landing-testimonial-v2__arrow"
                aria-label="Next testimonials"
                onClick={showNextTestimonials}
              >
                →
              </button>
            </div>
          </div>

          <div className="landing-testimonial-v2__grid">
            {visibleTestimonials.map((item) => (
              <article key={`${item.name}-${item.role}`} className="landing-testimonial-v2__card">
                <img className="landing-testimonial-v2__image" src={item.image} alt={item.name} />
                <div className="landing-testimonial-v2__overlay" />

                <div className="landing-testimonial-v2__meta">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </div>
                  <div className="landing-testimonial-v2__stars" aria-label="5 out of 5 stars">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                </div>

                <blockquote className="landing-testimonial-v2__quote">
                  “{item.quote}”
                </blockquote>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-pricing-v3" aria-labelledby="landing-pricing-v3-title">
        <div className="landing-pricing-v3__shell landing-reveal">
          <div className="landing-pricing-v3__intro">
            <span className="landing-pricing-v3__eyebrow">Pricing</span>
            <h2 id="landing-pricing-v3-title" className="landing-pricing-v3__title">
              One Price
              <br />
              No Surprices
            </h2>
          </div>

          <div className="landing-pricing-v3__grid">
            <article className="landing-pricing-v3__plan landing-pricing-v3__plan--combined landing-reveal" style={{ transitionDelay: '40ms' }}>
              <div className="landing-pricing-v3__plan-top">
                <span className="landing-pricing-v3__plan-badge is-blue">Simple pricing</span>
              </div>
              <div className="landing-pricing-v3__plan-body">
                <div className="landing-pricing-v3__price-row">
                  <span className="landing-pricing-v3__price-prefix">$</span>
                  <strong className="landing-pricing-v3__price">49</strong>
                  <span className="landing-pricing-v3__price-suffix">/worker/month</span>
                </div>
                <p className="landing-pricing-v3__billing">
                  Billed monthly per active worker. Pay per active worker. No setup fee, no annual commitment, no
                  hidden charges.
                </p>
              </div>
              <button type="button" className="landing-pricing-v3__plan-button" onClick={onGetStarted}>
                Start free - first contractor on us
              </button>
            </article>

            <article className="landing-pricing-v3__plan landing-reveal" style={{ transitionDelay: '100ms' }}>
              <div className="landing-pricing-v3__plan-top">
                <span className="landing-pricing-v3__plan-badge is-gold">Included</span>
              </div>
              <div className="landing-pricing-v3__plan-body">
                <h3 className="landing-pricing-v3__plan-title is-compact">Included in every active worker plan</h3>
                <ul className="landing-pricing-v3__features">
                  <li>Contract generation &amp; PDF</li>
                  <li>DocuSign e-signature (both parties)</li>
                  <li>KYC identity verification ($1.50/check)</li>
                  <li>Invoice management &amp; approval flow</li>
                </ul>
              </div>
            </article>

            <article className="landing-pricing-v3__plan landing-reveal" style={{ transitionDelay: '160ms' }}>
              <div className="landing-pricing-v3__plan-top">
                <span className="landing-pricing-v3__plan-badge is-green">Add-ons</span>
              </div>
              <div className="landing-pricing-v3__plan-body">
                <h3 className="landing-pricing-v3__plan-title is-compact">Scale your contractor operations with optional extras</h3>
                <ul className="landing-pricing-v3__features">
                  <li>Wise payment processing</li>
                  <li>AES-256 encrypted document storage</li>
                  <li>Completion certificate</li>
                </ul>
                <p className="landing-pricing-v3__addons">
                  Optional add-ons: Compliance advisory +$5/mo | HRMS +$5/mo (coming soon)
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section ref={coverageSectionRef} className="landing-coverage-v1" aria-labelledby="landing-coverage-v1-title">
        <div className="landing-coverage-v1__shell landing-reveal">
          <div className="landing-coverage-v1__intro">
            <span className="landing-coverage-v1__eyebrow">Coverage</span>
            <h2 id="landing-coverage-v1-title" className="landing-coverage-v1__title">
              Global hiring, phased rollout
            </h2>
          </div>

          <div className="landing-coverage-v1__trackbar" aria-hidden="true">
            <span className="landing-coverage-v1__trackpill">
              <strong>US</strong>
              <span>Track 2 - US Contractors</span>
            </span>
            <span className="landing-coverage-v1__trackdot" />
            <span className="landing-coverage-v1__trackpill landing-coverage-v1__trackpill--right">
              <strong>IN</strong>
              <span>Track 1 - India Payroll</span>
            </span>
          </div>

          <div className="landing-coverage-v1__grid">
            {COVERAGE_TRACKS.map((item) => (
              <article
                key={item.code}
                className={`landing-coverage-v1__card landing-coverage-v1__card--${item.code === 'US' ? 'left' : 'right'}`}
                style={{
                  ...getCoverageCardStyle(item.code === 'US' ? 'left' : 'right'),
                }}
              >
                <div className="landing-coverage-v1__card-top">
                  <span className="landing-coverage-v1__code">{item.code}</span>
                  <p className="landing-coverage-v1__track">{item.track}</p>
                  <span
                    className={`landing-coverage-v1__status landing-coverage-v1__status--${item.statusTone}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="landing-coverage-v1__card-body">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>

                  <ul className="landing-coverage-v1__list">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-faq-v1" aria-labelledby="landing-faq-v1-title">
        <div className="landing-faq-v1__shell landing-reveal">
          <div className="landing-faq-v1__intro">
            <span className="landing-faq-v1__eyebrow">FAQs</span>
            <h2 id="landing-faq-v1-title" className="landing-faq-v1__title">
              Frequently
              <br />
              Asked Questions
            </h2>
            <p className="landing-faq-v1__contact">
              Got a specific question? <button type="button" onClick={onLogin}>Contact us</button>
            </p>
          </div>

          <div className="landing-faq-v1__list">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <article
                  key={item.question}
                  className={`landing-faq-v1__item landing-reveal${isOpen ? ' is-open' : ''}`}
                  style={{ transitionDelay: `${index * 45}ms` }}
                >
                  <button
                    type="button"
                    className="landing-faq-v1__trigger"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(index)}
                  >
                    <span>{item.question}</span>
                    <span className="landing-faq-v1__icon" aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {isOpen ? <div className="landing-faq-v1__panel"><p>{item.answer}</p></div> : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-cta-v1" aria-labelledby="landing-cta-v1-title">
        <div className="landing-cta-v1__shell landing-reveal">
          <div className="landing-cta-v1__panel">
            <h2 id="landing-cta-v1-title" className="landing-cta-v1__title">
              Ready to hire your
              <br />
              first global contractor?
            </h2>

            <p className="landing-cta-v1__copy">
              Join companies hiring smarter with Dechub. Set up US contractor onboarding,
              contracts, signatures, and payouts in one clean workflow.
            </p>

            <div className="landing-cta-v1__actions">
              <button type="button" className="landing-cta-v1__primary" onClick={onGetStarted}>
                Get started for free
              </button>
              <button type="button" className="landing-cta-v1__secondary" onClick={onLogin}>
                Book a demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer-v1" aria-labelledby="landing-footer-v1-title">
        <div className="landing-footer-v1__shell landing-reveal">
          <div className="landing-footer-v1__card">
            <div className="landing-footer-v1__brandrow">
              <div className="landing-footer-v1__brand">
                <img
                  className="landing-hero-v2__nav-logo-image landing-footer-v1__brandmark"
                  src={logoImage}
                  alt=""
                  aria-hidden="true"
                />
                <span>Dechub</span>
              </div>
            </div>

            <div className="landing-footer-v1__content">
              <div className="landing-footer-v1__main">
                <div className="landing-footer-v1__intro">
                  <h2 id="landing-footer-v1-title">
                    Global contractor
                    <br />
                    hiring made simple
                  </h2>

                  <p>
                    Join our newsletter for product updates on US contractor operations and India payroll rollout.
                  </p>
                </div>

                <form className="landing-footer-v1__subscribe">
                  <input type="email" placeholder="name@email.com" aria-label="Email address" />
                  <button type="submit">Subscribe</button>
                </form>
              </div>

              <div className="landing-footer-v1__nav">
                <div className="landing-footer-v1__column">
                  <h3>Platform</h3>
                  <a href="#landing-pricing-v3-title">Pricing</a>
                  <a href="#landing-coverage-v1-title">Coverage</a>
                  <a href="#landing-faq-v1-title">FAQs</a>
                  <button type="button" onClick={onGetStarted}>Get started</button>
                </div>

                <div className="landing-footer-v1__column">
                  <h3>Coverage</h3>
                  <span>US contractors</span>
                  <span>India payroll</span>
                  <span>Wise payouts</span>
                  <span>DocuSign flow</span>
                </div>

                <div className="landing-footer-v1__column">
                  <h3>Company</h3>
                  <button type="button" onClick={onLogin}>Book demo</button>
                  <span>LinkedIn</span>
                  <span>Privacy policy</span>
                  <span>support@dechub.com</span>
                </div>
              </div>
            </div>

            <div className="landing-footer-v1__bottom">
              <p>Built for modern global teams hiring across borders.</p>
              <p>© 2026 Dechub. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
