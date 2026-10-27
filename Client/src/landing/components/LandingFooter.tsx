interface LandingFooterProps {
  columns: readonly {
    title: string;
    links: readonly string[];
  }[];
}

function getFooterHref(label: string): string {
  if (label === 'About us') return '/about';
  if (label === 'Blog') return '/blog';
  if (label === 'Contact') return '/contact';
  if (label === 'Privacy policy') return '/legal-pages/privacy-policy';
  return '#';
}

export function LandingFooter({ columns }: LandingFooterProps) {
  return (
    <footer className="landing-footer">
      <div className="landing-shell">
        <div className="landing-footer-top">
          <div className="landing-footer-brand">
            <button type="button" className="landing-brand landing-brand-footer">
              DECHUB
            </button>
            <p>
              Global HR, payroll &amp; contractor management built in Bengaluru and used by
              distributed teams worldwide.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="landing-footer-column">
              <h3>{column.title}</h3>
              {column.links.map((link) => (
                <a key={link} href={getFooterHref(link)}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="landing-footer-bottom">
          <span>© 2026 Dechub Pvt. Ltd. - Bengaluru, India</span>
          <div>
            <a href="/legal-pages/privacy-policy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
