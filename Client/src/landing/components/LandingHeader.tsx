interface LandingHeaderProps {
  isMenuOpen: boolean;
  isScrolled: boolean;
  navItems: readonly string[];
  onBookDemo: () => void;
  onCloseMenu: () => void;
  onSelectNav: (item: string) => void;
  onToggleMenu: () => void;
  onTopClick: () => void;
}

export function LandingHeader({
  isMenuOpen,
  isScrolled,
  navItems,
  onBookDemo,
  onCloseMenu,
  onSelectNav,
  onToggleMenu,
  onTopClick,
}: LandingHeaderProps) {
  return (
    <header className={`landing-nav${isScrolled ? ' is-scrolled' : ''}`}>
      <div className="landing-shell landing-nav-shell">
        <button className="landing-brand" type="button" onClick={onTopClick} aria-label="Scroll to top">
          DECHUB
        </button>

        <nav className="landing-nav-links" aria-label="Primary">
          {navItems.map((item) => (
            <button key={item} type="button" onClick={() => onSelectNav(item)}>
              {item}
            </button>
          ))}
        </nav>

        <div className="landing-nav-actions">
          <button type="button" className="landing-pill-button" onClick={onBookDemo}>
            Book a demo
          </button>
          <button
            type="button"
            className={`landing-menu-toggle${isMenuOpen ? ' is-open' : ''}`}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={onToggleMenu}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="landing-mobile-menu">
          {navItems.map((item) => (
            <button key={item} type="button" onClick={() => onSelectNav(item)}>
              {item}
            </button>
          ))}
          <button type="button" className="landing-mobile-login" onClick={onBookDemo}>
            Book a demo
          </button>
          <button type="button" className="landing-pill-button" onClick={onCloseMenu}>
            Close menu
          </button>
        </div>
      ) : null}
    </header>
  );
}
