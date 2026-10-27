import { AppHandlers, AppState } from '../../types/signup';
import SuccessStep from '../common/SuccessStep';

export default function Step7Success({ state, handlers }: { state: AppState; handlers: AppHandlers }) {
  const { formData } = state;
  const { goToDashboard } = handlers;

  return (
    <section className="card screen active">
      <div className="success-wrap">
        <div className="success-circle">🎉</div>
        <h2 className="success-title">You're all set!</h2>
        <p className="success-sub">Welcome to Dechub. Your account is being verified by our team. You'll receive an email within 2–5 minutes once your KYB is approved and you can start hiring.</p>

        <div className="next-steps">
          <SuccessStep number="1" title="KYB verification in progress" text="Stripe Identity is processing your documents — usually under 5 minutes" />
          <SuccessStep number="2" title="Invite your first worker" text="Once verified, go to Workers → Add Worker to send an invite" />
          <SuccessStep number="3" title="Generate contract" text="Dechub auto-generates a compliant contractor agreement — ready in seconds" />
          <SuccessStep number="4" title="Pay your team" text="Approve invoices and Dechub handles the rest via Wise API" />
        </div>

        <button type="button" className="btn-primary" onClick={goToDashboard}>Go to Dashboard →</button>
        <div className="form-link confirm-link">Verification email sent to <strong>{formData.workEmail || 'your email'}</strong></div>
      </div>
    </section>
  );
}
