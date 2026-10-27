'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { AddWorkerFormData, DechubService, ServiceConfig } from '../types/dashboard.type';
import { INITIAL_ADD_WORKER, DECHUB_SERVICES } from '../types/dashboard.type';
import { inviteWorker } from '../api/dashboard.api';

// ─── Step labels ──────────────────────────────────────────────────────────────

const SHOW_WORKER_TYPE_STEP = false;
const ALL_STEPS = ['Worker type', 'Details', 'Services', 'Contract', 'Review'];
const STEPS = SHOW_WORKER_TYPE_STEP ? ALL_STEPS : ALL_STEPS.slice(1);
const DETAILS_STEP = SHOW_WORKER_TYPE_STEP ? 1 : 0;
const SERVICES_STEP = DETAILS_STEP + 1;
const CONTRACT_STEP = DETAILS_STEP + 2;
const REVIEW_STEP = DETAILS_STEP + 3;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="db-step-bar">
      {STEPS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'pending';
        return (
          <div key={label} className="db-step-item">
            <div className={`db-step-num ${state}`}>
              {state === 'done' ? '✓' : i + 1}
            </div>
            <span className={`db-step-label ${state}`}>{label}</span>
            {i < STEPS.length - 1 && (
              <div className={`db-step-connector ${state === 'done' ? 'done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Worker type ──────────────────────────────────────────────────────

function Step1Type({ data, onChange }: {
  data: AddWorkerFormData;
  onChange: (k: keyof AddWorkerFormData, v: string) => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div className="db-form-group" style={{ marginBottom: 8 }}>
          <label className="db-label" style={{ marginBottom: 10 }}>Worker Type</label>
        </div>
        <div className="db-type-grid">
          <button
            type="button"
            className={`db-type-card ${data.workerType === 'contractor' ? 'selected' : ''}`}
            onClick={() => onChange('workerType', 'contractor')}
          >
            {data.workerType === 'contractor' && (
              <span className="db-type-card-check">✓</span>
            )}
            <div className="db-type-card-icon">👤</div>
            <div className="db-type-card-title">Contractor</div>
            <div className="db-type-card-desc">
              Self-employed professional working on a project basis.
              Submits invoices monthly. No employer obligations.
            </div>
          </button>
          <button
            type="button"
            className={`db-type-card ${data.workerType === 'full_time_employee' ? 'selected' : ''}`}
            onClick={() => onChange('workerType', 'full_time_employee')}
          >
            {data.workerType === 'full_time_employee' && (
              <span className="db-type-card-check">✓</span>
            )}
            <div className="db-type-card-icon">🏢</div>
            <div className="db-type-card-title">Full-time Employee</div>
            <div className="db-type-card-desc">
              Employed with a full contract, benefits, and payroll.
              Dechub handles payroll, statutory compliance.
            </div>
          </button>
        </div>
      </div>

      <div>
        <div className="db-form-group" style={{ marginBottom: 8 }}>
          <label className="db-label" style={{ marginBottom: 10 }}>Worker Location Track</label>
        </div>
        <div className="db-type-grid">
          <button
            type="button"
            className={`db-type-card ${data.track === 'track_2_us' ? 'selected' : ''}`}
            onClick={() => onChange('track', 'track_2_us')}
          >
            {data.track === 'track_2_us' && (
              <span className="db-type-card-check">✓</span>
            )}
            <div className="db-type-card-icon">🇺🇸</div>
            <div className="db-type-card-title">Track 2 — US</div>
            <div className="db-type-card-desc">
              US professional hired by a foreign company. USD contracts,
              Wise payouts, W-9/W-8BEN tax forms. <strong>MVP ready.</strong>
            </div>
          </button>
          <button
            type="button"
            className={`db-type-card ${data.track === 'track_1_india' ? 'selected' : ''}`}
            onClick={() => onChange('track', 'track_1_india')}
          >
            {data.track === 'track_1_india' && (
              <span className="db-type-card-check">✓</span>
            )}
            <div className="db-type-card-icon">🇮🇳</div>
            <div className="db-type-card-title">Track 1 — India</div>
            <div className="db-type-card-desc">
              Indian professional hired by a foreign company. INR payroll,
              TDS/PF/ESI, Form 16. <strong>Coming Q3 2026.</strong>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Worker details ───────────────────────────────────────────────────

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'Singapore', 'Netherlands', 'UAE', 'Sweden', 'Brazil',
];

function normalizeCountryValue(country: string, track: AddWorkerFormData['track']): string {
  const normalized = country.trim();
  if (!normalized) {
    return track === 'track_2_us' ? 'United States' : track === 'track_1_india' ? 'India' : '';
  }

  const exactMatch = COUNTRIES.find((entry) => entry.toLowerCase() === normalized.toLowerCase());
  if (exactMatch) {
    return exactMatch;
  }

  if (normalized.toLowerCase() === 'usa' || normalized.toLowerCase() === 'us' || normalized.toLowerCase() === 'united states of america') {
    return 'United States';
  }

  return normalized;
}

function Step2Details({ data, onChange, errors, locked }: {
  data: AddWorkerFormData;
  onChange: (k: keyof AddWorkerFormData, v: string) => void;
  errors: Record<string, string>;
  locked?: boolean;
}) {
  const countryOptions = data.country && !COUNTRIES.includes(data.country) && data.country !== 'Other'
    ? [data.country, ...COUNTRIES]
    : COUNTRIES;

  return (
    <div>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
        Enter the worker's basic information. An invitation email will be sent
        to their email address to complete their profile and KYC.
      </p>

      <div className="db-form-row">
        <div className="db-form-group">
          <label className="db-label">First name <span className="db-req">*</span></label>
          <input
            className={`db-input ${errors.firstName ? 'error' : ''}`}
            placeholder="John"
            value={data.firstName}
            disabled={locked}
            onChange={(e) => onChange('firstName', e.target.value)}
          />
          {errors.firstName && <p className="db-field-error">{errors.firstName}</p>}
        </div>
        <div className="db-form-group">
          <label className="db-label">Last name <span className="db-req">*</span></label>
          <input
            className={`db-input ${errors.lastName ? 'error' : ''}`}
            placeholder="Smith"
            value={data.lastName}
            disabled={locked}
            onChange={(e) => onChange('lastName', e.target.value)}
          />
          {errors.lastName && <p className="db-field-error">{errors.lastName}</p>}
        </div>
      </div>

      <div className="db-form-group">
        <label className="db-label">Work email <span className="db-req">*</span></label>
        <input
          type="email"
          className={`db-input ${errors.email ? 'error' : ''}`}
          placeholder="john@example.com"
          value={data.email}
          disabled={locked}
          onChange={(e) => onChange('email', e.target.value)}
        />
        {errors.email && <p className="db-field-error">{errors.email}</p>}
        <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>
          Invite email will be sent here
        </p>
      </div>

      <div className="db-form-row">
        <div className="db-form-group">
          <label className="db-label">Job title / Role <span className="db-req">*</span></label>
          <input
            className={`db-input ${errors.roleTitle ? 'error' : ''}`}
            placeholder="Senior React Developer"
            value={data.roleTitle}
            disabled={locked}
            onChange={(e) => onChange('roleTitle', e.target.value)}
          />
          {errors.roleTitle && <p className="db-field-error">{errors.roleTitle}</p>}
        </div>
        <div className="db-form-group">
          <label className="db-label">Department</label>
          <input
            className="db-input"
            placeholder="Engineering"
            value={data.department}
            onChange={(e) => onChange('department', e.target.value)}
          />
        </div>
      </div>

      <div className="db-form-group">
        <label className="db-label">Country of residence <span className="db-req">*</span></label>
        <select
          className={`db-select ${errors.country ? 'error' : ''}`}
          value={data.country}
          disabled={locked}
          onChange={(e) => onChange('country', e.target.value)}
        >
          <option value="">Select country…</option>
          {countryOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="Other">Other</option>
        </select>
        {errors.country && <p className="db-field-error">{errors.country}</p>}
        {locked ? (
          <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>
            Country is locked from the approved talent profile for this hire.
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ─── Step 3: Service selection ────────────────────────────────────────────────

function Step3Services({ data, onToggle }: {
  data: AddWorkerFormData;
  onToggle: (id: string) => void;
}) {
  const selected = data.selectedServices;

  const renderService = (cfg: ServiceConfig) => {
    const isOn = selected.includes(cfg.id);

    return (
      <div
        key={cfg.id}
        className={[
          'db-service-card',
          cfg.required ? 'required' : '',
          isOn && !cfg.required ? 'selected' : '',
          cfg.comingSoon ? 'coming-soon' : '',
        ].filter(Boolean).join(' ')}
        onClick={() => !cfg.required && !cfg.comingSoon && onToggle(cfg.id)}
        role={cfg.required || cfg.comingSoon ? undefined : 'checkbox'}
        aria-checked={isOn}
        tabIndex={cfg.required || cfg.comingSoon ? undefined : 0}
        onKeyDown={(e) => {
          if (!cfg.required && !cfg.comingSoon && (e.key === ' ' || e.key === 'Enter')) {
            e.preventDefault();
            onToggle(cfg.id);
          }
        }}
      >
        <div className="db-service-icon">{cfg.icon}</div>
        <div className="db-service-info">
          <div className="db-service-name">
            {cfg.name}
            {cfg.required && (
              <span className="db-service-required-tag">Required</span>
            )}
            {cfg.comingSoon && (
              <span className="db-service-soon-tag">Coming soon</span>
            )}
            {cfg.priceLabel && !cfg.comingSoon && (
              <span className="db-service-price">{cfg.priceLabel}</span>
            )}
          </div>
          <div className="db-service-desc">{cfg.desc}</div>
        </div>

        {!cfg.required && !cfg.comingSoon && (
          <div className={`db-service-toggle ${isOn ? 'on' : ''}`} aria-hidden="true">
            <div className="db-service-toggle-thumb" />
          </div>
        )}
      </div>
    );
  };

  const available = DECHUB_SERVICES.filter((service) => !service.comingSoon);

  return (
    <div>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.6 }}>
        Choose which Dechub-Bridge services to activate for{' '}
        <strong>{data.firstName || 'this worker'}</strong>.
      </p>

      <p className="db-service-section-label">Available services</p>
      {available.map(renderService)}
    </div>
  );
}

// ─── Step 4: Contract terms ───────────────────────────────────────────────────

function Step4Contract({ data, onChange, errors }: {
  data: AddWorkerFormData;
  onChange: (k: keyof AddWorkerFormData, v: string) => void;
  errors: Record<string, string>;
}) {
  const currencies = ['USD', 'INR', 'AED'];

  return (
    <div>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
        Set the contract terms. Dechub-Bridge will auto-generate the PDF agreement
        from these details and send it for e-signature via DocuSign.
      </p>

      <div className="db-form-row">
        <div className="db-form-group">
          <label className="db-label">Pay rate <span className="db-req">*</span></label>
          <input
            type="number"
            className={`db-input ${errors.payRate ? 'error' : ''}`}
            placeholder="3000"
            value={data.payRate}
            onChange={(e) => onChange('payRate', e.target.value)}
            min="0"
          />
          {errors.payRate && <p className="db-field-error">{errors.payRate}</p>}
        </div>
        <div className="db-form-group">
          <label className="db-label">Currency</label>
          <select
            className="db-select"
            value={data.payCurrency}
            onChange={(e) => onChange('payCurrency', e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="db-form-group">
        <label className="db-label">Pay frequency</label>
        <select
          className="db-select"
          value={data.payFrequency}
          onChange={(e) => onChange('payFrequency', e.target.value)}
        >
          <option value="monthly">Monthly (last day of month)</option>
          <option value="biweekly">Bi-weekly (every 2 weeks)</option>
        </select>
      </div>

      <div className="db-form-row">
        <div className="db-form-group">
          <label className="db-label">Start date <span className="db-req">*</span></label>
          <input
            type="date"
            className={`db-input ${errors.startDate ? 'error' : ''}`}
            value={data.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
          />
          {errors.startDate && <p className="db-field-error">{errors.startDate}</p>}
        </div>
        <div className="db-form-group">
          <label className="db-label">End date <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
          <input
            type="date"
            className="db-input"
            value={data.endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
          />
        </div>
      </div>

      <div className="db-form-group">
        <label className="db-label">Notice period (days)</label>
        <input
          type="number"
          className="db-input"
          value={data.noticePeriodDays}
          onChange={(e) => onChange('noticePeriodDays', e.target.value)}
          min="0"
          max="90"
          style={{ width: '50%' }}
        />
      </div>

      <div className="db-form-group">
        <label className="db-label">Scope of work <span className="db-req">*</span></label>
        <textarea
          className={`db-textarea ${errors.scopeOfWork ? 'error' : ''}`}
          placeholder="Describe the work to be done, deliverables, and any specific requirements…"
          value={data.scopeOfWork}
          onChange={(e) => onChange('scopeOfWork', e.target.value)}
          style={{ height: 100 }}
        />
        {errors.scopeOfWork && <p className="db-field-error">{errors.scopeOfWork}</p>}
      </div>
    </div>
  );
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────

function Step5Review({ data }: { data: AddWorkerFormData }) {
  const trackLabel = data.track === 'track_2_us' ? '🇺🇸 Track 2 — US' : '🇮🇳 Track 1 — India';
  const typeLabel  = data.workerType === 'contractor' ? 'Contractor' : 'Full-time Employee';

  const selectedServiceConfigs = DECHUB_SERVICES.filter((s) =>
    data.selectedServices.includes(s.id),
  );

  return (
    <div>
      <div
        style={{
          background: 'linear-gradient(135deg, #0a1628, #162d54)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 46, height: 46,
            borderRadius: 12,
            background: 'rgba(0,201,167,0.2)',
            display: 'grid', placeItems: 'center',
            fontSize: 22, flexShrink: 0,
          }}
        >
          👤
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
            {data.firstName} {data.lastName}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
            {data.roleTitle} · {data.country}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ color: '#00c9a7', fontWeight: 700, fontSize: 18 }}>
            {data.payCurrency} {data.payRate
              ? Number(data.payRate).toLocaleString()
              : '—'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            per {data.payFrequency === 'hourly' ? 'hour' : data.payFrequency === 'biweekly' ? 'bi-week' : 'month'}
          </div>
        </div>
      </div>

      <div className="db-review-section">
        <div className="db-review-section-title">Worker info</div>
        <div className="db-review-row"><span className="db-review-key">Email</span><span className="db-review-val">{data.email}</span></div>
        <div className="db-review-row"><span className="db-review-key">Worker type</span><span className="db-review-val">{typeLabel}</span></div>
        <div className="db-review-row"><span className="db-review-key">Track</span><span className="db-review-val">{trackLabel}</span></div>
        <div className="db-review-row"><span className="db-review-key">Department</span><span className="db-review-val">{data.department || '—'}</span></div>
      </div>

      <div className="db-review-section">
        <div className="db-review-section-title">Contract terms</div>
        <div className="db-review-row"><span className="db-review-key">Pay rate</span><span className="db-review-val">{data.payCurrency} {data.payRate ? Number(data.payRate).toLocaleString() : '—'} / {data.payFrequency}</span></div>
        <div className="db-review-row"><span className="db-review-key">Start date</span><span className="db-review-val">{data.startDate || '—'}</span></div>
        <div className="db-review-row"><span className="db-review-key">End date</span><span className="db-review-val">{data.endDate || 'No fixed end date'}</span></div>
        <div className="db-review-row"><span className="db-review-key">Notice period</span><span className="db-review-val">{data.noticePeriodDays} days</span></div>
      </div>

      <div className="db-review-section">
        <div className="db-review-section-title">Selected services ({selectedServiceConfigs.length})</div>
        <div className="db-service-chips">
          {selectedServiceConfigs.map((s) => (
            <span key={s.id} className="db-service-chip">
              {s.icon} {s.name}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 10,
          padding: '12px 16px',
          fontSize: 13,
          color: '#166534',
          lineHeight: 1.6,
        }}
      >
        ✅ After clicking <strong>Send Invite</strong>:
        an invitation email is sent to <strong>{data.email}</strong> →
        they complete KYC → Dechub auto-generates the contract PDF →
        DocuSign sends e-signature request to both parties →
        payment flow activates on the start date.
      </div>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(step: number, data: AddWorkerFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (SHOW_WORKER_TYPE_STEP && step === 0) {
    if (!data.workerType) errors.workerType = 'Select a worker type';
    if (!data.track)      errors.track      = 'Select a track';
  }

  if (step === DETAILS_STEP) {
    if (!data.firstName.trim()) errors.firstName = 'Required';
    if (!data.lastName.trim())  errors.lastName  = 'Required';
    if (!data.email.trim())     errors.email     = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email';
    if (!data.roleTitle.trim()) errors.roleTitle = 'Required';
    if (!data.country)          errors.country   = 'Select a country';
  }

  if (step === CONTRACT_STEP) {
    if (!data.payRate || Number(data.payRate) <= 0) errors.payRate = 'Enter a valid pay rate';
    if (!data.startDate) errors.startDate = 'Required';
    if (!data.scopeOfWork.trim()) errors.scopeOfWork = 'Describe the scope of work';
  }

  return errors;
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface AddWorkerModalProps {
  onClose:   () => void;
  onSuccess: (worker: unknown) => void;
  initialData?: AddWorkerFormData;
  talentRequestId?: string;
}

export default function AddWorkerModal({
  onClose,
  onSuccess,
  initialData,
  talentRequestId,
}: AddWorkerModalProps) {
  const [step,     setStep]     = useState(0);
  const [data,     setData]     = useState<AddWorkerFormData>(initialData ?? INITIAL_ADD_WORKER);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const hasLockedTalent = Boolean(talentRequestId);
  const initializedRequestRef = useRef<string | null>(null);

  useEffect(() => {
    const requestKey = talentRequestId || 'manual-worker';
    if (initializedRequestRef.current === requestKey) return;

    const seed = initialData ?? INITIAL_ADD_WORKER;
    setData({
      ...seed,
      // Keep valid values while the worker-type screen is hidden.
      workerType: seed.workerType || 'contractor',
      track: seed.track || 'track_2_us',
      country: normalizeCountryValue(seed.country, seed.track),
    });
    setStep(0);
    setErrors({});
    setApiError(null);
    initializedRequestRef.current = requestKey;
  }, [initialData, talentRequestId]);

  const handleChange = useCallback(<K extends keyof AddWorkerFormData>(
    key: K,
    value: AddWorkerFormData[K],
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key as string]; return n; });
  }, []);

  const handleStringChange = useCallback((key: keyof AddWorkerFormData, value: string) => {
    if (key === 'track') {
      const nextTrack = value as AddWorkerFormData['track'];
      setData((prev) => {
        const nextCountry = hasLockedTalent
          ? normalizeCountryValue(prev.country, nextTrack)
          : prev.country;
        return {
          ...prev,
          track: nextTrack,
          country: nextCountry,
        };
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next.track;
        delete next.country;
        return next;
      });
      return;
    }

    if (key === 'country') {
      handleChange(key, normalizeCountryValue(value, data.track) as AddWorkerFormData[typeof key]);
      return;
    }

    handleChange(key, value as AddWorkerFormData[typeof key]);
  }, [data.track, handleChange, hasLockedTalent]);

  const toggleService = useCallback((id: string) => {
    setData((prev) => {
      const curr = prev.selectedServices;
      const serviceId = id as DechubService;
      const next = curr.includes(serviceId)
        ? curr.filter((service) => service !== serviceId)
        : [...curr, serviceId];
      return { ...prev, selectedServices: next };
    });
  }, []);

  const handleNext = useCallback(async () => {
    const stepErrors = validateStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});

    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    // Final step — submit
    setLoading(true);
    setApiError(null);
    try {
      const worker = await inviteWorker(data, talentRequestId);
      onSuccess(worker);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setApiError(e?.message ?? 'Failed to invite worker. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [step, data, onSuccess]);

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <div className="db-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="db-modal">
        {/* Header */}
        <div className="db-modal-header">
          <div>
            <div className="db-modal-title">Add Worker</div>
            <div className="db-modal-sub">
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </div>
          </div>
          <button className="db-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Step bar */}
        <StepBar current={step} />

        {/* Body */}
        <div className="db-modal-body">
          {SHOW_WORKER_TYPE_STEP && step === 0 && (
            <Step1Type data={data} onChange={handleStringChange} />
          )}
          {step === DETAILS_STEP && (
            <Step2Details data={data} onChange={handleStringChange} errors={errors} locked={hasLockedTalent} />
          )}
          {step === SERVICES_STEP && (
            <Step3Services data={data} onToggle={toggleService} />
          )}
          {step === CONTRACT_STEP && (
            <Step4Contract data={data} onChange={handleStringChange} errors={errors} />
          )}
          {step === REVIEW_STEP && (
            <Step5Review data={data} />
          )}

          {/* API error */}
          {apiError && (
            <div
              role="alert"
              style={{
                marginTop: 16,
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 8, padding: '10px 14px',
                color: '#dc2626', fontSize: 13,
              }}
            >
              ⚠ {apiError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="db-modal-footer">
          <button
            type="button"
            className="db-btn-secondary"
            onClick={step === 0 ? onClose : handleBack}
            disabled={loading}
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          <button
            type="button"
            className="db-btn-primary"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="db-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                Sending…
              </>
            ) : step === STEPS.length - 1 ? (
              '📧 Send Invite'
            ) : (
              `Continue →`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
