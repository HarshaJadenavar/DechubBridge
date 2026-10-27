import { useMemo, useState } from 'react';
import './login.css';
import { api } from '../api/client';
import type { ApiError } from '../api/client';

function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div className="login-logo-mark" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 24 24"
        style={{ width: size * 0.55, height: size * 0.55 }}
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  const checks = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/];
  const score = checks.filter((rule) => rule.test(password)).length;

  if (score <= 1) {
    return { score, label: 'Weak', color: '#ef4444' };
  }
  if (score <= 3) {
    return { score, label: 'Good', color: '#f59e0b' };
  }
  return { score, label: 'Strong', color: '#10b981' };
}

export default function ResetPasswordPage() {
  const token = useMemo(
    () => new URLSearchParams(window.location.search).get('token') ?? '',
    [],
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(password);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!token) {
      nextErrors.token = 'Reset token is missing from the link.';
    }
    if (!password.trim()) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    } else if (strength.score < 2) {
      nextErrors.password = 'Use a stronger password';
    }
    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    return nextErrors;
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setError('');
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.message ?? 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-left-grid" />

        <div className="login-logo">
          <LogoMark size={36} />
          <span className="login-logo-name">Dechub</span>
        </div>

        <div className="login-left-body">
          <div className="login-left-tag">Secure access</div>
          <h1 className="login-left-title">
            Reset your password,<br />
            <span>get back to work.</span>
          </h1>
          <p className="login-left-sub">
            Choose a new password for your Dechub account. For your security,
            this link expires after a short time.
          </p>

          <div className="login-left-stats">
            <div className="login-stat-card">
              <div className="login-stat-icon" style={{ background: 'rgba(37,99,235,0.15)' }}>
                🔐
              </div>
              <div className="login-stat-value">Encrypted</div>
              <div className="login-stat-label">Password reset requests are protected</div>
            </div>
            <div className="login-stat-card">
              <div className="login-stat-icon" style={{ background: 'rgba(0,201,167,0.15)' }}>
                ⚡
              </div>
              <div className="login-stat-value">1 minute</div>
              <div className="login-stat-label">Typical time to complete this step</div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-right-header">
          <span className="login-support-link">Need help? Contact support</span>
          <button className="login-lang-btn">EN</button>
        </div>

        <div className="login-card">
          <div className="login-card-title">Create a new password</div>
          <div className="login-card-sub">
            Enter your new password below to finish resetting your account.
          </div>

          {fieldErrors.token && (
            <div className="login-error-banner">
              <span style={{ flexShrink: 0 }}>Warning:</span>
              <span>{fieldErrors.token}</span>
            </div>
          )}

          {error && (
            <div className="login-error-banner">
              <span style={{ flexShrink: 0 }}>Warning:</span>
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <>
              <div className="login-success-banner" style={{ marginBottom: 20 }}>
                Your password has been reset successfully. You can now sign in with your new password.
              </div>
              <button className="login-submit" onClick={handleBackToLogin}>
                Back to login
              </button>
            </>
          ) : (
            <>
              <div className="login-field">
                <label className="login-label">New password</label>
                <div className="login-input-wrap" style={{ marginTop: 7 }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`login-input ${fieldErrors.password ? 'error' : ''}`}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError('password');
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    className="login-input-suffix"
                    onClick={() => setShowPassword((value) => !value)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {password && (
                  <div className="login-strength-row">
                    <div className="login-strength-bars">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className="login-strength-bar"
                          style={{
                            background: bar <= strength.score ? strength.color : '#e2e8f0',
                          }}
                        />
                      ))}
                    </div>
                    <span className="login-strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
                {fieldErrors.password && (
                  <div className="login-field-error">Warning: {fieldErrors.password}</div>
                )}
              </div>

              <div className="login-field">
                <label className="login-label">Confirm password</label>
                <div className="login-input-wrap" style={{ marginTop: 7 }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`login-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError('confirmPassword');
                    }}
                    autoComplete="new-password"
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <div className="login-field-error">Warning: {fieldErrors.confirmPassword}</div>
                )}
              </div>

              <button className="login-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="login-spinner" /> Updating password...</> : 'Reset password'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
