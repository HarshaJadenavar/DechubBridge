import type { ReactNode } from 'react';

interface LandingHeroProps {
  clockImage: string;
  laptopImage: string;
  navChips: readonly string[];
  renderLogoMark: () => ReactNode;
  searchQuery: string;
  trustBadges: readonly string[];
  onBookDemo: () => void;
  onChangeSearch: (value: string) => void;
  onGetStarted: () => void;
  onQuickSearch: (chip: string) => void;
  onSubmitSearch: () => void;
}

export function LandingHero({
  clockImage,
  laptopImage,
  navChips,
  renderLogoMark,
  searchQuery,
  trustBadges,
  onBookDemo,
  onChangeSearch,
  onGetStarted,
  onQuickSearch,
  onSubmitSearch,
}: LandingHeroProps) {
  return (
    <>
      <section className="landing-hero">
        <div className="landing-shell landing-hero-layout">
          <div className="landing-hero-copy landing-reveal" data-reveal>
            <div className="landing-live-pill">Now live - Track 2 US contractors</div>
            <h1>
              Hire, Pay &amp; Manage <span>Global Contractors</span> without the chaos
            </h1>
            <p>
              Dechub is the all-in-one platform to onboard US contractors, generate contracts,
              collect e-signatures, and process payments via Wise all from one dashboard.
            </p>

            <form
              className="landing-hero-search"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmitSearch();
              }}
            >
              <input
                type="search"
                value={searchQuery}
                placeholder="Search for any service..."
                aria-label="Search for any service"
                onChange={(event) => onChangeSearch(event.target.value)}
              />
              <button type="submit" aria-label="Search marketplace">
                <span />
              </button>
            </form>

            <div className="landing-service-pills">
              {navChips.map((chip) => (
                <button key={chip} type="button" onClick={() => onQuickSearch(chip)}>
                  {chip}
                </button>
              ))}
            </div>

            <button type="button" className="landing-hero-primary" onClick={onGetStarted}>
              Get Started
            </button>

            <div className="landing-hero-trust">
              {trustBadges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          </div>

          <div className="landing-hero-media landing-reveal" data-reveal>
            <div className="landing-hero-pedestal">
              <div className="landing-hero-rock landing-hero-rock-left" />
              <div className="landing-hero-rock landing-hero-rock-center" />
              <div className="landing-hero-rock landing-hero-rock-right" />
            </div>
            <div className="landing-laptop-frame">
              <div className="landing-hero-screen">
                <div className="landing-screen-wave" />
                <div className="landing-screen-wave landing-screen-wave-two" />
                <div className="landing-screen-noise" />
                <div className="landing-screen-brand">
                  {renderLogoMark()}
                  <span>DECHUB</span>
                </div>
              </div>
            </div>
            <div className="landing-laptop-base" />
            <div className="landing-laptop-shadow" />
            <img src={laptopImage} alt="" aria-hidden="true" className="landing-hero-hidden-image" />
          </div>
        </div>
      </section>

      <section className="landing-promo-strip landing-reveal" data-reveal>
        <div className="landing-shell landing-promo-strip__shell">
          <img src={clockImage} alt="20 minute turnaround indicator" />
          <div>
            <p>
              Get a resource in <strong>20 minutes</strong>
            </p>
            <p>
              with <strong>10 days</strong> free trial
            </p>
          </div>
          <button type="button" className="landing-pill-button" onClick={onBookDemo}>
            Book a demo
          </button>
        </div>
      </section>
    </>
  );
}
