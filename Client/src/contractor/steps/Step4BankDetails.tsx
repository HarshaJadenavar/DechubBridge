import { useState } from 'react';
import type { ContractorOnboardingData } from '../types/contractor.types';
import { saveBankDetails } from '../api/contractor.api';

interface Props {
  data:    ContractorOnboardingData;
  onChange:(k: keyof ContractorOnboardingData, v: string) => void;
  onNext:  () => void;
  onBack:  () => void;
  submitLabel?: string;
  onSubmitOverride?: () => Promise<void> | void;
}

const METHODS = [
  {
    value:  'wise',
    icon:   '💸',
    name:   'Wise',
    sub:    'Fast global transfers',
    recommended: true,
  },
  {
    value:  'bank_transfer',
    icon:   '🏦',
    name:   'Bank Transfer',
    sub:    'SWIFT / ACH / SEPA',
    recommended: false,
  },
  {
    value:  'paypal',
    icon:   '🅿️',
    name:   'PayPal',
    sub:    'Email-based payment',
    recommended: false,
  },
];

function validate(data: ContractorOnboardingData) {
  const e: Record<string, string> = {};
  if (!data.paymentMethod) { e.paymentMethod = 'Select a payment method'; return e; }

  if (data.paymentMethod === 'wise') {
    if (!data.wiseEmail.trim()) e.wiseEmail = 'Wise account email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.wiseEmail)) e.wiseEmail = 'Invalid email';
  }

  if (data.paymentMethod === 'bank_transfer') {
    if (!data.bankName.trim())     e.bankName     = 'Bank name is required';
    if (!data.accountNumber.trim()) e.accountNumber = 'Account number is required';
    if (!data.routingNumber.trim() && !data.swiftCode.trim())
      e.routingNumber = 'Routing number (US) or SWIFT code is required';
  }

  if (data.paymentMethod === 'paypal') {
    if (!data.paypalEmail.trim()) e.paypalEmail = 'PayPal email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.paypalEmail)) e.paypalEmail = 'Invalid email';
  }

  return e;
}

export default function Step4BankDetails({
  data,
  onChange,
  onNext,
  onBack,
  submitLabel = 'Save & Continue →',
  onSubmitOverride,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const e = validate(data);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setError(null);
    setLoading(true);
    try {
      if (onSubmitOverride) {
        await onSubmitOverride();
      } else {
        await saveBankDetails({
          paymentMethod: data.paymentMethod,
          wiseEmail:     data.wiseEmail     || undefined,
          bankName:      data.bankName      || undefined,
          accountNumber: data.accountNumber || undefined,
          routingNumber: data.routingNumber || undefined,
          swiftCode:     data.swiftCode     || undefined,
          paypalEmail:   data.paypalEmail   || undefined,
        });
      }
      onNext();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof ContractorOnboardingData, placeholder = '') => ({
    className: `cp-input ${errors[key] ? 'error' : ''}`,
    value:     data[key] as string,
    placeholder,
    onChange:  (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(key, e.target.value);
      setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    },
  });

  return (
    <div className="cp-form-card">
      <div className="cp-form-title">Payment details</div>
      <div className="cp-form-sub">
        Choose how you'd like to receive your payments. Dechub processes payments via Wise —
        we recommend it for fastest delivery and lowest fees.
      </div>

      {error && <div className="cp-error">⚠ {error}</div>}

      {/* Payment method selection */}
      <div className="cp-field">
        <label className="cp-label">Payment method <span className="cp-req">*</span></label>
        <div className="cp-method-grid">
          {METHODS.map((m) => (
            <div
              key={m.value}
              className={`cp-method-card ${data.paymentMethod === m.value ? 'selected' : ''}`}
              onClick={() => {
                onChange('paymentMethod', m.value);
                setErrors((prev) => { const n = { ...prev }; delete n.paymentMethod; return n; });
              }}
              role="radio"
              aria-checked={data.paymentMethod === m.value}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') onChange('paymentMethod', m.value);
              }}
            >
              {m.recommended && (
                <div style={{
                  background: '#00c9a7', color: '#fff',
                  fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.5px', padding: '2px 8px',
                  borderRadius: 99, marginBottom: 8, display: 'inline-block',
                }}>
                  Recommended
                </div>
              )}
              <div className="cp-method-icon">{m.icon}</div>
              <div className="cp-method-name">{m.name}</div>
              <div className="cp-method-sub">{m.sub}</div>
            </div>
          ))}
        </div>
        {errors.paymentMethod && <p className="cp-field-error">⚠ {errors.paymentMethod}</p>}
      </div>

      {/* ── Wise fields ────────────────────────────────────────────────────── */}
      {data.paymentMethod === 'wise' && (
        <>
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1px solid #bbf7d0',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 20,
              fontSize: 13,
              color: '#166534',
              lineHeight: 1.6,
            }}
          >
            <strong>Why Wise?</strong> Payments arrive within 1–2 business days with live exchange rates and
            zero hidden fees. 170+ countries supported. Your company pays in USD — you receive in your local currency.
          </div>
          <div className="cp-field">
            <label className="cp-label">Wise account email <span className="cp-req">*</span></label>
            <input type="email" {...field('wiseEmail', 'email@yourwise.com')} />
            <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>
              Don't have a Wise account?{' '}
              <a href="https://wise.com" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                Create one free →
              </a>
            </p>
            {errors.wiseEmail && <p className="cp-field-error">⚠ {errors.wiseEmail}</p>}
          </div>
        </>
      )}

      {/* ── Bank transfer fields ───────────────────────────────────────────── */}
      {data.paymentMethod === 'bank_transfer' && (
        <>
          <div className="cp-field">
            <label className="cp-label">Bank name <span className="cp-req">*</span></label>
            <input {...field('bankName', 'Chase Bank, HDFC, Barclays…')} />
            {errors.bankName && <p className="cp-field-error">⚠ {errors.bankName}</p>}
          </div>

          <div className="cp-row-2">
            <div className="cp-field">
              <label className="cp-label">Account number <span className="cp-req">*</span></label>
              <input {...field('accountNumber', 'Account number')} />
              {errors.accountNumber && <p className="cp-field-error">⚠ {errors.accountNumber}</p>}
            </div>
            <div className="cp-field">
              <label className="cp-label">Routing number <span className="cp-optional">(US)</span></label>
              <input {...field('routingNumber', '9-digit routing number')} />
            </div>
          </div>

          <div className="cp-field">
            <label className="cp-label">SWIFT / BIC code <span className="cp-optional">(international)</span></label>
            <input {...field('swiftCode', 'XXXXUS33')} />
            {errors.routingNumber && <p className="cp-field-error">⚠ {errors.routingNumber}</p>}
          </div>

          <div
            style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: 12.5,
              color: '#92400e',
              marginBottom: 16,
            }}
          >
            ⚠ Bank transfers may take 3–7 business days and may incur additional wire fees.
            We recommend Wise for faster payments.
          </div>
        </>
      )}

      {/* ── PayPal fields ──────────────────────────────────────────────────── */}
      {data.paymentMethod === 'paypal' && (
        <div className="cp-field">
          <label className="cp-label">PayPal email <span className="cp-req">*</span></label>
          <input type="email" {...field('paypalEmail', 'yourname@paypal.com')} />
          <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>
            Must be a verified PayPal account that can receive business payments.
          </p>
          {errors.paypalEmail && <p className="cp-field-error">⚠ {errors.paypalEmail}</p>}
        </div>
      )}

      <div className="cp-btn-row" style={{ marginTop: 8 }}>
        <button type="button" className="cp-btn-secondary" onClick={onBack} disabled={loading}>
          ← Back
        </button>
        <button type="button" className="cp-btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="cp-spinner" /> Saving…</> : submitLabel}
        </button>
      </div>
    </div>
  );
}
