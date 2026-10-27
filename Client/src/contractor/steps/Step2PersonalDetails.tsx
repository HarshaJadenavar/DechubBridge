import { useState } from 'react';
import type { ContractorOnboardingData } from '../types/contractor.types';
import { savePersonalDetails } from '../api/contractor.api';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'Singapore', 'Netherlands', 'UAE', 'Brazil', 'Mexico',
  'Japan', 'South Korea', 'Philippines', 'Pakistan', 'Nigeria', 'Kenya',
  'South Africa', 'Sweden', 'Norway', 'Denmark', 'Poland', 'Ukraine',
];

interface Props {
  data:     ContractorOnboardingData;
  onChange: (k: keyof ContractorOnboardingData, v: string) => void;
  onNext:   () => void;
  onBack:   () => void;
  submitLabel?: string;
  onSubmitOverride?: () => Promise<void> | void;
}

function validate(data: ContractorOnboardingData) {
  const e: Record<string, string> = {};
  if (!data.dateOfBirth)   e.dateOfBirth   = 'Required';
  if (!data.nationality)   e.nationality   = 'Required';
  if (!data.addressLine1)  e.addressLine1  = 'Required';
  if (!data.city)          e.city          = 'Required';
  if (!data.postalCode)    e.postalCode    = 'Required';
  if (!data.country)       e.country       = 'Required';
  if (!data.taxId.trim())  e.taxId         = 'Required — SSN, ITIN or local tax ID';
  // Age check — must be 18+
  if (data.dateOfBirth) {
    const dob  = new Date(data.dateOfBirth);
    const now  = new Date();
    const age  = now.getFullYear() - dob.getFullYear();
    if (age < 18) e.dateOfBirth = 'You must be at least 18 years old';
  }
  return e;
}

export default function Step2PersonalDetails({
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
        await savePersonalDetails({
          dateOfBirth:  data.dateOfBirth,
          nationality:  data.nationality,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city:         data.city,
          state:        data.state,
          postalCode:   data.postalCode,
          country:      data.country,
          taxId:        data.taxId,
        });
      }
      onNext();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof ContractorOnboardingData) => ({
    value: data[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onChange(key, e.target.value);
      setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    },
    className: `cp-input ${errors[key] ? 'error' : ''}`,
  });

  return (
    <div className="cp-form-card">
      <div className="cp-form-title">Personal details</div>
      <div className="cp-form-sub">
        This information is required for compliance, tax purposes, and to set up your payment account.
        All data is encrypted and stored securely.
      </div>

      {error && <div className="cp-error">⚠ {error}</div>}

      {/* Date of birth + nationality */}
      <div className="cp-row-2">
        <div className="cp-field">
          <label className="cp-label">Date of birth <span className="cp-req">*</span></label>
          <input type="date" {...field('dateOfBirth')} />
          {errors.dateOfBirth && <p className="cp-field-error">⚠ {errors.dateOfBirth}</p>}
        </div>
        <div className="cp-field">
          <label className="cp-label">Nationality <span className="cp-req">*</span></label>
          <select {...field('nationality')}>
            <option value="">Select…</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="Other">Other</option>
          </select>
          {errors.nationality && <p className="cp-field-error">⚠ {errors.nationality}</p>}
        </div>
      </div>

      {/* Tax ID */}
      <div className="cp-field">
        <label className="cp-label">
          Tax ID / SSN <span className="cp-req">*</span>
        </label>
        <input
          {...field('taxId')}
          placeholder="US: SSN (XXX-XX-XXXX) · Other: local tax ID number"
        />
        <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>
          🔒 Encrypted · Used for W-9 / W-8BEN tax forms only. Never shared publicly.
        </p>
        {errors.taxId && <p className="cp-field-error">⚠ {errors.taxId}</p>}
      </div>

      {/* Address */}
      <div style={{ marginTop: 4, marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
          Residential address
        </div>
      </div>

      <div className="cp-field">
        <label className="cp-label">Address line 1 <span className="cp-req">*</span></label>
        <input {...field('addressLine1')} placeholder="Street address, apt, suite" />
        {errors.addressLine1 && <p className="cp-field-error">⚠ {errors.addressLine1}</p>}
      </div>

      <div className="cp-field">
        <label className="cp-label">Address line 2 <span className="cp-optional">(optional)</span></label>
        <input {...field('addressLine2')} placeholder="Floor, building, etc." />
      </div>

      <div className="cp-row-3">
        <div className="cp-field">
          <label className="cp-label">City <span className="cp-req">*</span></label>
          <input {...field('city')} placeholder="City" />
          {errors.city && <p className="cp-field-error">⚠ {errors.city}</p>}
        </div>
        <div className="cp-field">
          <label className="cp-label">State / Province</label>
          <input {...field('state')} placeholder="CA / New York" />
        </div>
        <div className="cp-field">
          <label className="cp-label">Postal code <span className="cp-req">*</span></label>
          <input {...field('postalCode')} placeholder="10001" />
          {errors.postalCode && <p className="cp-field-error">⚠ {errors.postalCode}</p>}
        </div>
      </div>

      <div className="cp-field">
        <label className="cp-label">Country <span className="cp-req">*</span></label>
        <select {...field('country')}>
          <option value="">Select country…</option>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          <option value="Other">Other</option>
        </select>
        {errors.country && <p className="cp-field-error">⚠ {errors.country}</p>}
      </div>

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
