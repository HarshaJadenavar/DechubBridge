import { useState } from 'react';
import type { ContractorOnboardingData, ContractorTokenInfo } from '../types/contractor.types';
import { setContractorPassword } from '../api/contractor.api';

function getStrength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length < 6) return 0;
  let score = 0;
  if (pw.length >= 8)            score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9!@#$%^&*]/.test(pw)) score++;
  return score as 0 | 1 | 2 | 3;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Strong'];
const STRENGTH_CLS    = ['', 'weak', 'fair', 'strong'];

interface Props {
  token:    string;
  info:     ContractorTokenInfo;
  data:     ContractorOnboardingData;
  onChange: (k: keyof ContractorOnboardingData, v: string) => void;
  onNext:   () => void;
}

export default function Step1Password({ token, info, data, onChange, onNext }: Props) {
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const strength = getStrength(data.password);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.password)            e.password = 'Password is required';
    else if (data.password.length < 8) e.password = 'At least 8 characters';
    else if (strength < 2)         e.password = 'Password is too weak';
    if (data.password !== data.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setError(null);
    setLoading(true);
    try {
      await setContractorPassword(token, data.password);
      onNext();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-form-card">
      <div className="cp-form-title">Welcome, {info.firstName}! 👋</div>
      <div className="cp-form-sub">
        You've been invited to join <strong>{info.companyName}</strong> as a{' '}
        <strong>{info.roleTitle}</strong> on Dechub.
        Set a secure password to access your contractor portal.
      </div>

      {/* Contract summary chip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '14px 18px',
        marginBottom: 28,
      }}>
        <span style={{ fontSize: 28 }}>📋</span>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
            {info.roleTitle} at {info.companyName}
          </div>
          <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
            {info.payCurrency} {info.payRate?.toLocaleString()}/{info.payFrequency} ·{' '}
            Starts {info.startDate ? new Date(info.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
          </div>
        </div>
      </div>

      {error && (
        <div className="cp-error">⚠ {error}</div>
      )}

      {/* Email (read-only) */}
      <div className="cp-field">
        <label className="cp-label">Your email</label>
        <input
          className="cp-input"
          value={info.email}
          readOnly
          style={{ background: '#f8fafc', color: '#64748b', cursor: 'default' }}
        />
      </div>

      {/* Password */}
      <div className="cp-field">
        <label className="cp-label">
          Create password <span className="cp-req">*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPw ? 'text' : 'password'}
            className={`cp-input ${errors.password ? 'error' : ''}`}
            placeholder="Minimum 8 characters"
            value={data.password}
            onChange={(e) => {
              onChange('password', e.target.value);
              setErrors((prev) => { const n = { ...prev }; delete n.password; return n; });
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            style={{
              position: 'absolute', right: 14, top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94a3b8', fontSize: 16,
            }}
          >
            {showPw ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Strength bar */}
        {data.password.length > 0 && (
          <>
            <div className="cp-strength" style={{ marginTop: 8 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`cp-strength-bar ${strength >= i ? STRENGTH_CLS[strength] : ''}`}
                />
              ))}
            </div>
            <div className="cp-strength-label">
              {strength > 0 ? STRENGTH_LABELS[strength] : 'Too short'}
            </div>
          </>
        )}

        {errors.password && <p className="cp-field-error">⚠ {errors.password}</p>}
      </div>

      {/* Confirm password */}
      <div className="cp-field">
        <label className="cp-label">
          Confirm password <span className="cp-req">*</span>
        </label>
        <input
          type={showPw ? 'text' : 'password'}
          className={`cp-input ${errors.confirmPassword ? 'error' : ''}`}
          placeholder="Re-enter password"
          value={data.confirmPassword}
          onChange={(e) => {
            onChange('confirmPassword', e.target.value);
            setErrors((prev) => { const n = { ...prev }; delete n.confirmPassword; return n; });
          }}
        />
        {errors.confirmPassword && (
          <p className="cp-field-error">⚠ {errors.confirmPassword}</p>
        )}
      </div>

      <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20, lineHeight: 1.6 }}>
        By continuing you agree to Dechub's{' '}
        <a href="/terms" style={{ color: '#2563eb' }}>Terms of Service</a> and{' '}
        <a href="/privacy" style={{ color: '#2563eb' }}>Privacy Policy</a>.
      </p>

      <button
        type="button"
        className="cp-btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <><span className="cp-spinner" /> Setting up your account…</> : 'Create Account & Continue →'}
      </button>
    </div>
  );
}
