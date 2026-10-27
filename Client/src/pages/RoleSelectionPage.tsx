import './role-selection.css';

interface RoleSelectionPageProps {
  onBack: () => void;
  onCompany: () => void;
  onFreelancer: () => void;
}

export default function RoleSelectionPage({
  onBack,
  onCompany,
  onFreelancer,
}: RoleSelectionPageProps) {
  return (
    <div className="rsp-root">
      <div className="rsp-shell">
        <div className="rsp-header">
          <img className="rsp-brand-logo" src="/dechub-assets/email/bridge-logo-email.png" alt="Dechub-Bridge" />
          <button className="rsp-back" onClick={onBack}>
            Back to landing
          </button>
        </div>

        <div className="rsp-card">
          <div className="rsp-badge">Get started</div>
          <h1>Choose how you want to continue.</h1>
          <p>
            Pick the path that fits you best. Client companies can access the talent marketplace,
            and freelancers can continue to their login flow.
          </p>

          <div className="rsp-options">
            <button className="rsp-option" onClick={onCompany}>
              <div className="rsp-option-icon">🏢</div>
              <div className="rsp-option-title">Client company</div>
              <div className="rsp-option-copy">
                Choose between the marketplace and the company dashboard flow.
              </div>
            </button>

            <button className="rsp-option" onClick={onFreelancer}>
              <div className="rsp-option-icon">💼</div>
              <div className="rsp-option-title">Freelancer</div>
              <div className="rsp-option-copy">
                Continue to the freelancer login flow for your contractor account.
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
