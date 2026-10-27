import './role-selection.css';

interface CompanyChoicePageProps {
  onBack: () => void;
  onMarketplace: () => void;
  onDashboard: () => void;
}

function LogoMark() {
  return (
    <div className="rsp-logo-mark">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

export default function CompanyChoicePage({
  onBack,
  onMarketplace,
  onDashboard,
}: CompanyChoicePageProps) {
  return (
    <div className="rsp-root">
      <div className="rsp-shell">
        <div className="rsp-header">
          <div className="rsp-brand">
            <LogoMark />
            <span>Dechub</span>
          </div>
          <button className="rsp-back" onClick={onBack}>
            Back
          </button>
        </div>

        <div className="rsp-card">
          <div className="rsp-badge">Company flow</div>
          <h1>Choose where your company wants to go.</h1>
          <p>
            Browse the talent marketplace right away, or continue into the company dashboard
            flow to log in, create your account, finish onboarding, and enter your workspace.
          </p>

          <div className="rsp-options">
            <button className="rsp-option" onClick={onMarketplace}>
              <div className="rsp-option-icon">🔎</div>
              <div className="rsp-option-title">Marketplace</div>
              <div className="rsp-option-copy">
                Open the company marketplace workspace and browse freelancer profiles immediately.
              </div>
            </button>

            <button className="rsp-option" onClick={onDashboard}>
              <div className="rsp-option-icon">📊</div>
              <div className="rsp-option-title">Dashboard</div>
              <div className="rsp-option-copy">
                Continue to company login, create an account if needed, finish the 6-step setup,
                and land in your company dashboard.
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
