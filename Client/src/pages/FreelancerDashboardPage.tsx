import './talent-marketplace.css';

interface FreelancerDashboardPageProps {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    city: string;
    country: string;
    paymentMethod: string;
  };
  onLogout: () => void;
}

export default function FreelancerDashboardPage({
  profile,
  onLogout,
}: FreelancerDashboardPageProps) {
  return (
    <div className="tmp-root">
      <header className="tmp-topbar">
        <div className="tmp-brand">
          <div className="tmp-brand-mark" />
          <div>
            <div className="tmp-brand-name">Dechub</div>
            <div className="tmp-brand-sub">Freelancer dashboard</div>
          </div>
        </div>

        <div className="tmp-user">
          <span>{profile.firstName} {profile.lastName}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="tmp-shell">
        <section className="tmp-hero">
          <div className="tmp-hero-copy">
            <div className="tmp-kicker">Freelancer workspace</div>
            <h1>Welcome, {profile.firstName}.</h1>
            <p>
              Your self-signup is complete. You’re now inside your dashboard without a contract-acceptance step.
            </p>
          </div>

          <div className="tmp-summary">
            <div className="tmp-summary-card">
              <strong>Profile ready</strong>
              <span>Account created successfully</span>
            </div>
            <div className="tmp-summary-card">
              <strong>{profile.city}</strong>
              <span>{profile.country}</span>
            </div>
            <div className="tmp-summary-card">
              <strong>{profile.paymentMethod}</strong>
              <span>Payout method selected</span>
            </div>
          </div>
        </section>

        <section className="tmp-grid">
          <article className="tmp-card">
            <div className="tmp-card-head">
              <div>
                <h2>Personal details</h2>
                <p>Saved during signup</p>
              </div>
            </div>
            <p className="tmp-blurb">
              {profile.firstName} {profile.lastName}
              <br />
              {profile.email}
              <br />
              {profile.phone}
              <br />
              {profile.nationality}
            </p>
          </article>

          <article className="tmp-card">
            <div className="tmp-card-head">
              <div>
                <h2>Next steps</h2>
                <p>What happens now</p>
              </div>
            </div>
            <div className="tmp-skills">
              <span>Wait for opportunities</span>
              <span>Complete KYC backend wiring later</span>
              <span>Add live contracts when ready</span>
            </div>
          </article>

          <article className="tmp-card">
            <div className="tmp-card-head">
              <div>
                <h2>Status</h2>
                <p>Current account state</p>
              </div>
            </div>
            <div className="tmp-badges">
              <span className="tmp-badge tmp-badge-strong">Active</span>
              <span className="tmp-badge">Self-signup completed</span>
            </div>
            <p className="tmp-blurb">
              Contract acceptance has been removed from this self-signup path as requested.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
