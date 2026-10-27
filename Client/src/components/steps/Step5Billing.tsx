import { useEffect, useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { AppHandlers, AppState } from '../../types/signup';
import ActionButton from '../common/ActionButton';
import { ArrowIcon, MailIcon } from '../common/Icons';

const MVP_DUMMY_PAYMENT_ID = 'pm_mvp_dummy';

// ─── Stripe init ──────────────────────────────────────────────────────────────

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string ?? '',
);

const STRIPE_STYLE = {
  base: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize:   '14px',
    color:      '#0f172a',
    '::placeholder': { color: '#94a3b8' },
  },
  invalid: { color: '#ef4444' },
};

// ─── Shared inline style for Stripe element wrappers ─────────────────────────

const stripeWrap: React.CSSProperties = {
  height:       44,
  border:       '1.5px solid #e2e8f0',
  borderRadius: 8,
  padding:      '0 14px',
  background:   '#fff',
  display:      'flex',
  alignItems:   'center',
  transition:   'all 0.2s',
};

const stripeWrapError: React.CSSProperties = {
  ...stripeWrap,
  border:    '1.5px solid #ef4444',
  boxShadow: '0 0 0 3px rgba(239,68,68,0.1)',
};

// ─── CardForm — rendered inside <Elements> ────────────────────────────────────

interface CardFormProps {
  state:             AppState;
  handlers:          AppHandlers;
  clientSecret:      string;
  onPaymentMethodId: (id: string) => void;
}

function CardForm({ state, handlers, clientSecret, onPaymentMethodId }: CardFormProps) {
  const stripe   = useStripe();
  const elements = useElements();

  const { formData, loadingAction } = state;
  const { handleInputChange, goToStep } = handlers;

  const [cardErrors, setCardErrors] = useState({ number: '', expiry: '', cvc: '' });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCardSubmit = useCallback(async () => {
    if (!stripe || !elements) return;

    setLocalError(null);
    const cardEl = elements.getElement(CardNumberElement);
    if (!cardEl) return;

    setSubmitting(true);
    try {
      const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card:            cardEl,
          billing_details: {
            name:  `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.billingEmail || formData.workEmail,
          },
        },
      });

      if (error) {
        setLocalError(error.message ?? 'Card setup failed. Please try again.');
        return;
      }

      const pmId =
        typeof setupIntent.payment_method === 'string'
          ? setupIntent.payment_method
          : setupIntent.payment_method?.id ?? '';

      if (!pmId) { setLocalError('Could not retrieve payment method.'); return; }

      // Store in formData — no cast needed, stripePaymentMethodId is in FormData type
      onPaymentMethodId(pmId);

      // goToStep(6) will read formData.stripePaymentMethodId and call saveBilling
      await goToStep(6);
    } catch {
      setLocalError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [stripe, elements, clientSecret, formData, onPaymentMethodId, goToStep]);

  const isLoading = submitting || loadingAction === 'step-6';

  return (
    <>
      <div className="plan-badge">✦ Starter Plan — $49/worker/month</div>

      <div className="billing-preview">
        <h4>Pricing Summary</h4>
        <div className="billing-line"><span>Base contract fee</span><span>$49 / worker / month</span></div>
        <div className="billing-line"><span>Setup fee</span><span className="text-green">Free</span></div>
        <div className="billing-line"><span>Additional modules</span><span>$5 / module</span></div>
        <div className="billing-line"><span>First charge</span><span>When you hire first worker</span></div>
      </div>

      {/* Billing currency */}
      <div className="form-group">
        <label>Billing currency <span className="req">*</span></label>
        <select
          value={formData.billCurrency}
          onChange={(e) => handleInputChange('billCurrency', e.target.value)}
        >
          <option value="USD">🇺🇸 USD — US Dollar</option>
          <option value="GBP">🇬🇧 GBP — British Pound</option>
          <option value="EUR">🇪🇺 EUR — Euro</option>
          <option value="CAD">🇨🇦 CAD — Canadian Dollar</option>
          <option value="AUD">🇦🇺 AUD — Australian Dollar</option>
          <option value="SGD">🇸🇬 SGD — Singapore Dollar</option>
        </select>
      </div>

      {/* Stripe Elements — card never touches your server */}
      <div className="form-group">
        <label>Card number <span className="req">*</span></label>
        <div style={cardErrors.number ? stripeWrapError : stripeWrap}>
          <CardNumberElement
            options={{ style: STRIPE_STYLE, showIcon: true }}
            onChange={(e) => setCardErrors((p) => ({ ...p, number: e.error?.message ?? '' }))}
          />
        </div>
        {cardErrors.number && <div className="field-error show">{cardErrors.number}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Expiry date <span className="req">*</span></label>
          <div style={cardErrors.expiry ? stripeWrapError : stripeWrap}>
            <CardExpiryElement
              options={{ style: STRIPE_STYLE }}
              onChange={(e) => setCardErrors((p) => ({ ...p, expiry: e.error?.message ?? '' }))}
            />
          </div>
          {cardErrors.expiry && <div className="field-error show">{cardErrors.expiry}</div>}
        </div>

        <div className="form-group">
          <label>CVC <span className="req">*</span></label>
          <div style={cardErrors.cvc ? stripeWrapError : stripeWrap}>
            <CardCvcElement
              options={{ style: STRIPE_STYLE }}
              onChange={(e) => setCardErrors((p) => ({ ...p, cvc: e.error?.message ?? '' }))}
            />
          </div>
          {cardErrors.cvc && <div className="field-error show">{cardErrors.cvc}</div>}
        </div>
      </div>

      {/* Billing email */}
      <div className="form-group">
        <label>Billing contact email</label>
        <div className="input-wrap">
          <div className="input-icon"><MailIcon /></div>
          <input
            type="email"
            value={formData.billingEmail}
            onChange={(e) => handleInputChange('billingEmail', e.target.value)}
            placeholder={formData.workEmail || 'finance@company.com'}
          />
          <span className="input-suffix">optional</span>
        </div>
        <div className="field-hint">Invoices sent here. Defaults to your account email.</div>
      </div>

      {/* Local Stripe error */}
      {localError && (
        <div
          role="alert"
          style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 8, padding: '10px 14px',
            color: '#dc2626', fontSize: 13, marginBottom: 12,
          }}
        >
          ⚠ {localError}
        </div>
      )}

      <p className="micro-copy">
        🔒 Your card is encrypted by Stripe and never stored on Dechub servers.
        PCI-DSS compliant via Stripe Secure Elements.
      </p>

      <div className="btn-row">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => { void goToStep(4); }}
          disabled={isLoading}
        >
          ← Back
        </button>
        <ActionButton loading={isLoading} onClick={handleCardSubmit}>
          Save &amp; Continue <ArrowIcon />
        </ActionButton>
      </div>

      <div className="form-link sub-link">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // Skip billing — jump directly to Step 6
            void goToStep(6);
          }}
        >
          Skip for now — add payment later
        </a>
      </div>
    </>
  );
}

// ─── Outer component — wraps CardForm with <Elements> ─────────────────────────

export default function Step5Billing({
  state,
  handlers,
}: {
  state:    AppState;
  handlers: AppHandlers;
}) {
  const { stripeClientSecret, loadingAction } = state;
  const { handleInputChange, goToStep } = handlers;

  const [isLoading, setIsLoading] = useState(!stripeClientSecret);

  useEffect(() => {
    if (stripeClientSecret) setIsLoading(false);
  }, [stripeClientSecret]);

  // Store paymentMethodId in formData (typed — no cast needed)
  const handlePaymentMethodId = useCallback(
    (pmId: string) => {
      handleInputChange('stripePaymentMethodId', pmId);
    },
    [handleInputChange],
  );

  const handleDummyPayment = useCallback(() => {
    handleInputChange('stripePaymentMethodId', MVP_DUMMY_PAYMENT_ID);
    window.setTimeout(() => {
      void goToStep(6);
    }, 0);
  }, [handleInputChange, goToStep]);

  return (
    <section className="card screen active">
      <div className="card-icon bg-orange">💳</div>
      <h2 className="card-title">Billing setup</h2>
      <p className="card-sub">
        Add a payment method. You won't be charged until you hire your first worker.
      </p>

      <div
        style={{
          marginBottom: 24,
          padding: '14px 16px',
          borderRadius: 12,
          background: '#fff7ed',
          border: '1px solid #fed7aa',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#9a3412', marginBottom: 4 }}>
          MVP mode
        </div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#9a3412' }}>
          Stripe stays available below. For demos and internal MVP testing, you can
          continue with a dummy payment method instead of entering a real card.
        </p>
      </div>

      <div
        style={{
          marginBottom: 24,
          padding: '18px',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
          Demo payment option
        </div>
        <p style={{ margin: '0 0 14px', fontSize: 13, lineHeight: 1.6, color: '#475569' }}>
          This uses a fake payment method id for MVP signup flows only. No real Stripe
          charge or card setup happens when you choose this option.
        </p>
        <div className="btn-row">
          <button
            type="button"
            className="btn-primary"
            onClick={handleDummyPayment}
            disabled={loadingAction !== null}
          >
            Use Demo Payment <ArrowIcon />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          <div
            className="spinner"
            style={{
              margin:         '0 auto 12px',
              borderTopColor: '#0a1628',
              borderColor:    '#e2e8f0',
            }}
          />
          Setting up secure payment form…
        </div>
      ) : stripeClientSecret ? (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 12 }}>
            Or use live Stripe payment details
          </div>
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: stripeClientSecret }}
          >
            <CardForm
              state={state}
              handlers={handlers}
              clientSecret={stripeClientSecret}
              onPaymentMethodId={handlePaymentMethodId}
            />
          </Elements>
        </>
      ) : (
        /* Fallback — Stripe not configured or setup intent failed */
        <div>
          <p className="field-hint" style={{ marginBottom: 24 }}>
            Payment setup is unavailable right now.
            You can use the demo payment option above or add billing later from your dashboard.
          </p>
          <div className="btn-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { void goToStep(4); }}
              disabled={loadingAction !== null}
            >
              ← Back
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => { void goToStep(6); }}
            >
              Skip for now <ArrowIcon />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
