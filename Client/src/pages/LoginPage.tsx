import { useEffect, useState } from 'react';
import './login.css';
import { api, tokenStore } from '../api/client';
import type { ApiError } from '../api/client';
import { contractorTokenStore } from '../contractor/api/contractor.api';

type Role = 'company' | 'contractor';

interface LoginPageProps {
  onCompanyLogin: (data: LoginSuccess) => void;
  onContractorLogin: (data: LoginSuccess) => void;
  onSignUp: () => void;
  initialRole?: Role;
  allowedRoles?: Role[];
}

interface LoginSuccess {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  firstName: string;
  role: string;
  signupStep?: number;
}

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

function GoogleIcon() {
  return (
    <svg className="login-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email: email.toLowerCase() });
      setSent(true);
    } catch (err: unknown) {
      const e = err as ApiError;
      setError(e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="login-modal">
        <button className="login-modal-close" onClick={onClose}>×</button>
        <div className="login-modal-title">Reset your password</div>

        {!sent ? (
          <>
            <div className="login-modal-sub">
              Enter the email address on your Dechub account and we'll send you a link to reset your password.
            </div>

            {error && <div className="login-error-banner">Warning: {error}</div>}

            <div className="login-field">
              <label className="login-label">Email address</label>
              <div className="login-input-wrap" style={{ marginTop: 7 }}>
                <input
                  type="email"
                  className={`login-input ${error ? 'error' : ''}`}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                  autoFocus
                  style={{ paddingRight: 14 }}
                />
              </div>
            </div>

            <button className="login-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? <><span className="login-spinner" /> Sending...</> : 'Send reset link'}
            </button>
          </>
        ) : (
          <div className="login-success-banner" style={{ marginBottom: 0 }}>
            Password reset email sent to <strong>{email}</strong>. The link expires in 1 hour.
          </div>
        )}
      </div>
    </div>
  );
}

const stats = [
  { icon: '🌍', bg: 'rgba(0,201,167,0.15)', value: '170+ countries', label: 'Contractor payment coverage' },
  { icon: '📄', bg: 'rgba(37,99,235,0.15)', value: 'Auto-generated', label: 'Contracts and onboarding' },
  { icon: '⚡', bg: 'rgba(245,158,11,0.15)', value: 'Same-day', label: 'Contractor activation flow' },
];

export default function LoginPage({
  onCompanyLogin,
  onContractorLogin,
  onSignUp,
  initialRole = 'company',
  allowedRoles = ['company', 'contractor'],
}: LoginPageProps) {
  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const signupStep = params.get('signup_step');
    const oauthError = params.get('error');

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (accessToken && refreshToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const successData: LoginSuccess = {
          accessToken,
          refreshToken,
          userId: payload.sub,
          email: payload.email,
          firstName: payload.firstName ?? '',
          role: payload.role,
          signupStep: signupStep ? Number(signupStep) : undefined,
        };

        if (payload.role === 'contractor') {
          tokenStore.clear();
          contractorTokenStore.set(accessToken, refreshToken);
          onContractorLogin(successData);
        } else {
          contractorTokenStore.clear();
          tokenStore.set(accessToken, refreshToken);
          onCompanyLogin(successData);
        }
      } catch {
        setError('Authentication failed. Please try again.');
      }

      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [onCompanyLogin, onContractorLogin]);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address';
    }

    if (!password.trim()) {
      errs.password = 'Password is required';
    }

    return errs;
  };

  const handleLogin = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setError('');
    setLoading(true);

    try {
      tokenStore.clear();
      contractorTokenStore.clear();

      const endpoint = role === 'contractor' ? '/auth/contractor/login' : '/auth/login';
      const res = await api.post<{ success: boolean; data: LoginSuccess }>(
        endpoint,
        role === 'contractor'
          ? { email: email.toLowerCase(), password }
          : { email: email.toLowerCase(), workEmail: email.toLowerCase(), password },
      );

      const data = res.data.data;

      if (role === 'contractor') {
        tokenStore.clear();
        contractorTokenStore.set(data.accessToken, data.refreshToken);
        onContractorLogin(data);
      } else {
        contractorTokenStore.clear();
        tokenStore.set(data.accessToken, data.refreshToken);
        onCompanyLogin(data);
      }
    } catch (err: unknown) {
      const e = err as ApiError;
      const msg = e?.message ?? 'Invalid email or password';

      if (msg.toLowerCase().includes('email')) {
        setFieldErrors({ email: msg });
      } else if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('credential')) {
        setError(
          role === 'contractor'
            ? 'Incorrect contractor email or password. Please try again.'
            : 'Incorrect company email or password. If this is a contractor account, switch to the Contractor tab.',
        );
      } else if (msg.toLowerCase().includes('verified')) {
        setError('Please verify your email address first. Check your inbox for the verification email.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/auth/google`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const clearError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setError('');
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
          <div className="login-left-tag">Trusted globally</div>
          <h1 className="login-left-title">
            Your global team,<br />
            <span>managed in one place.</span>
          </h1>
          <p className="login-left-sub">
            Onboard contractors, generate contracts, collect e-signatures,
            and process payments via Wise all from one dashboard.
          </p>

          <div className="login-left-stats">
            {stats.map(({ icon, bg, value, label }) => (
              <div key={label} className="login-stat-card">
                <div className="login-stat-icon" style={{ background: bg }}>
                  {icon}
                </div>
                <div className="login-stat-value">{value}</div>
                <div className="login-stat-label">{label}</div>
              </div>
            ))}
          </div>

          {role === 'contractor' && (
            <div className="login-signup-row" style={{ color: '#888', fontSize: 13, marginTop: 12 }}>
              Contractor sign up is currently by invitation only.
            </div>
          )}
        </div>

        <div className="login-left-footer">
          <div className="login-testimonial-text">
            "We hired 3 US contractors in one afternoon. The contract was auto-generated,
            they signed via DocuSign the same day, and payment went through Wise without any issues."
          </div>
          <div className="login-testimonial-author">
            <div
              className="login-testimonial-avatar"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
            >
              RK
            </div>
            <div>
              <div className="login-testimonial-name">Ravi Kumar</div>
              <div className="login-testimonial-role">CEO, BuildAI Bengaluru</div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-right-header">
          <span className="login-support-link">Have questions? Contact support</span>
          <button className="login-lang-btn">EN</button>
        </div>

        <div className="login-card">
          <div className="login-card-title">Welcome back</div>
          <div className="login-card-sub">Sign in to your Dechub account</div>

          {allowedRoles.length > 1 ? (
            <div className="login-role-tabs">
              {allowedRoles.includes('company') && (
                <button
                  className={`login-role-tab ${role === 'company' ? 'active' : ''}`}
                  onClick={() => { setRole('company'); setError(''); setFieldErrors({}); }}
                >
                  Company
                </button>
              )}
              {allowedRoles.includes('contractor') && (
                <button
                  className={`login-role-tab ${role === 'contractor' ? 'active' : ''}`}
                  onClick={() => { setRole('contractor'); setError(''); setFieldErrors({}); }}
                >
                  Contractor
                </button>
              )}
            </div>
          ) : (
            <div className="login-role-tabs" style={{ gridTemplateColumns: '1fr' }}>
              <button className="login-role-tab active" type="button">
                {allowedRoles[0] === 'company' ? 'Company' : 'Freelancer'}
              </button>
            </div>
          )}

          {error && (
            <div className="login-error-banner">
              <span style={{ flexShrink: 0 }}>Warning:</span>
              <span>{error}</span>
            </div>
          )}

          <div className="login-oauth-buttons">
            <button className="login-oauth-btn" onClick={handleGoogleLogin}>
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">Or continue with email</span>
            <div className="login-divider-line" />
          </div>

          <div className="login-field">
            <label className="login-label">Email address</label>
            <div className="login-input-wrap" style={{ marginTop: 7 }}>
              <input
                type="email"
                className={`login-input ${fieldErrors.email ? 'error' : ''}`}
                placeholder={role === 'company' ? 'you@company.com' : 'your@email.com'}
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                onKeyDown={handleKeyDown}
                autoComplete="email"
                style={{ paddingRight: 14 }}
              />
            </div>
            {fieldErrors.email && (
              <div className="login-field-error">Warning: {fieldErrors.email}</div>
            )}
            <button className="login-cant-access" onClick={() => setShowForgot(true)}>
              Can't access your email?
            </button>
          </div>

          <div className="login-field">
            <div className="login-field-header">
              <label className="login-label">Password</label>
              <button className="login-forgot" onClick={() => setShowForgot(true)}>
                Forgot password?
              </button>
            </div>
            <div className="login-input-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                className={`login-input ${fieldErrors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />
              <button
                className="login-input-suffix"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && (
              <div className="login-field-error">Warning: {fieldErrors.password}</div>
            )}
          </div>

          <button className="login-submit" onClick={handleLogin} disabled={loading}>
            {loading ? <><span className="login-spinner" /> Signing in...</> : 'Log in'}
          </button>

          {role === 'company' ? (
            <div className="login-signup-row">
              Need to create a new account?{' '}
              <button className="login-signup-link" onClick={onSignUp}>
                Sign Up
              </button>
            </div>
          ) : (
            <div className="login-signup-row">
              New freelancer here?{' '}
              <button className="login-signup-link" onClick={onSignUp}>
                Sign Up
              </button>
            </div>
          )}

          <div className="login-terms">
            By logging in, you confirm that you've read and accepted our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>.
          </div>
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}
