import { useEffect, useMemo, useState } from 'react';
import './company-auth.css';
import { login, redirectToGoogle, register, type AuthResult } from '../api/auth.api';
import type { ApiError } from '../api/client';
import { getTalentRequestSignupPrefill } from '../api/talentRequests.api';

type AuthMode = 'login' | 'signup';

interface CompanyAuthPageProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onBack: () => void;
  onSuccess: (result: AuthResult) => void;
  onCreateAccount?: () => void;
  showModeTabs?: boolean;
  backLabel?: string;
  onGoogleStart?: () => void;
}

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'protonmail.com',
  'aol.com',
  'live.com',
]);

function isWorkEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return Boolean(domain && !FREE_EMAIL_DOMAINS.has(domain));
}

function getShortlistSignupPrefillParams(): { requestId: string; token: string } | null {
  const searchParams = new URLSearchParams(window.location.search);
  const requestIdFromUrl = searchParams.get('requestId')?.trim() ?? '';
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';

  if (requestIdFromUrl && tokenFromUrl) {
    return { requestId: requestIdFromUrl, token: tokenFromUrl };
  }

  try {
    const raw = sessionStorage.getItem('dechub_pending_shortlist_claim');
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { requestId?: string; token?: string };
    const requestId = parsed.requestId?.trim() ?? '';
    const token = parsed.token?.trim() ?? '';

    if (requestId && token) {
      return { requestId, token };
    }
  } catch {
    return null;
  }

  return null;
}

export default function CompanyAuthPage({
  mode,
  onModeChange,
  onBack,
  onSuccess,
  onCreateAccount,
  showModeTabs = true,
  backLabel = 'Back to landing',
  onGoogleStart,
}: CompanyAuthPageProps) {
  const isSignupMode = mode === 'signup';
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [shortlistPrefill, setShortlistPrefill] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const pageCopy = useMemo(
    () =>
      mode === 'login'
        ? {
            title: 'Company login',
            sub: 'Sign in to your company workspace and continue managing hiring in one place.',
            button: 'Log in',
            googleButton: 'Continue with Google',
            switchText: "Don't have an account?",
            switchAction: 'Create one',
          }
        : {
            title: 'Create company account',
            sub: 'Create your account with work email, phone number, or Google and start hiring faster.',
            button: 'Create account',
            googleButton: 'Continue with Google',
            switchText: 'Already have an account?',
            switchAction: 'Log in',
          },
    [mode],
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (mode === 'signup' && !form.firstName.trim()) {
      nextErrors.firstName = 'First name is required';
    } else if (mode === 'signup' && form.firstName.trim().length < 2) {
      nextErrors.firstName = 'First name must be at least 2 characters';
    }

    if (mode === 'signup' && !form.lastName.trim()) {
      nextErrors.lastName = 'Last name is required';
    } else if (mode === 'signup' && form.lastName.trim().length < 2) {
      nextErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (mode === 'signup' && !form.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    } else if (
      mode === 'signup' &&
      !/^[+\d][\d\s()-]{6,19}$/.test(form.phone.trim())
    ) {
      nextErrors.phone = 'Enter a valid phone number';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address';
    } else if (mode === 'signup' && !isWorkEmail(form.email.trim())) {
      nextErrors.email = 'Use your company email address';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Password is required';
    } else if (mode === 'signup' && form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    return nextErrors;
  };

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setError('');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_error') !== 'account_not_found') {
      return;
    }

    setError('No account was found with this Google email. Please create an account first.');
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  useEffect(() => {
    if (!isSignupMode) {
      return;
    }

    const params = getShortlistSignupPrefillParams();
    if (!params) {
      return;
    }

    let cancelled = false;
    setPrefillLoading(true);

    void getTalentRequestSignupPrefill(params.requestId, params.token)
      .then((prefill) => {
        if (cancelled) {
          return;
        }

        setShortlistPrefill({
          firstName: prefill.firstName,
          lastName: prefill.lastName,
          phone: prefill.phone,
          email: prefill.email,
        });
        setForm((current) => ({
          firstName: current.firstName || prefill.firstName,
          lastName: current.lastName || prefill.lastName,
          phone: current.phone || prefill.phone,
          email: current.email || prefill.email,
          password: current.password,
        }));
      })
      .catch(() => {
        // If the shortlist link is stale or invalid, keep the form usable with manual entry.
      })
      .finally(() => {
        if (!cancelled) {
          setPrefillLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isSignupMode]);

  useEffect(() => {
    if (isSignupMode || !shortlistPrefill) {
      return;
    }

    setForm((current) => ({
      firstName: current.firstName === shortlistPrefill.firstName ? '' : current.firstName,
      lastName: current.lastName === shortlistPrefill.lastName ? '' : current.lastName,
      phone: current.phone === shortlistPrefill.phone ? '' : current.phone,
      email: current.email === shortlistPrefill.email ? '' : current.email,
      password: current.password,
    }));
  }, [isSignupMode, shortlistPrefill]);

  const handleSubmit = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result: AuthResult;

      if (mode === 'login') {
        result = await login({
          email: form.email.toLowerCase(),
          password: form.password,
        });
      } else {
        result = await register({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          workEmail: form.email.toLowerCase(),
          password: form.password,
        });
      }

      onSuccess(result);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.fields) {
        const normalizedFields = { ...apiError.fields };
        if (normalizedFields.workEmail && !normalizedFields.email) {
          normalizedFields.email = normalizedFields.workEmail;
        }
        setFieldErrors(normalizedFields);
      }
      setError(
        apiError.fields
          ? 'Please correct the highlighted fields.'
          : (apiError.message ?? 'Something went wrong. Please try again.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cap-root">
      <div className="cap-bg-orb cap-bg-orb-a" />
      <div className="cap-bg-orb cap-bg-orb-b" />
      <div className="cap-shell">
        <aside className="cap-side">
          <div className="cap-side-content">
            <div className="cap-brand">
              <img className="cap-brand-logo" src="/dechub-assets/email/bridge-logo-email.png" alt="Dechub-Bridge" />
            </div>
            <div className="cap-badge">Company access</div>
            <h1>Hire faster with one simple company portal.</h1>
            <p>
              Log in or create your account, then browse curated global talent and start
              hiring from a single marketplace.
            </p>

            <div className="cap-points">
              {[
                'Browse ready-to-hire contractor profiles',
                'See skills, rates, availability, and region',
                'Move from discovery to hiring in one flow',
              ].map((point) => (
                <div key={point} className="cap-point">
                  <span>•</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="cap-card-wrap">
          <div className="cap-card">
            <button className="cap-back" onClick={onBack}>
              {backLabel}
            </button>

            {showModeTabs && (
              <div className="cap-tabs">
                <button
                  className={`cap-tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => onModeChange('login')}
                >
                  Login
                </button>
                <button
                  className={`cap-tab ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => onModeChange('signup')}
                >
                  Sign up
                </button>
              </div>
            )}

            <h2>{pageCopy.title}</h2>
            <p className="cap-sub">{pageCopy.sub}</p>

            {error && <div className="cap-error">{error}</div>}
            {isSignupMode && prefillLoading && (
              <div className="cap-sub" style={{ marginTop: -4, marginBottom: 12 }}>
                Checking your shortlist details to prefill matching fields...
              </div>
            )}

            <button
              type="button"
              className="cap-google"
              onClick={onGoogleStart ?? (() => redirectToGoogle(mode))}
              disabled={loading}
            >
              <span className="cap-google-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 4 1.5l2.7-2.6C17 2.8 14.8 2 12 2 6.9 2 2.8 6.4 2.8 11.8S6.9 21.6 12 21.6c6.9 0 9.1-4.9 9.1-7.4 0-.5 0-.9-.1-1.3H12Z" />
                  <path fill="#34A853" d="M2.8 11.8c0 1.7.6 3.3 1.7 4.6l3-2.3c-.4-.7-.7-1.5-.7-2.3s.2-1.6.7-2.3l-3-2.3c-1.1 1.3-1.7 2.9-1.7 4.6Z" />
                  <path fill="#FBBC05" d="M12 21.6c2.8 0 5.1-.9 6.8-2.5l-3.3-2.6c-.9.6-2 .9-3.5.9-2.5 0-4.7-1.7-5.5-4l-3 2.3c1.8 3.6 5.4 5.9 9.5 5.9Z" />
                  <path fill="#4285F4" d="M18.8 19.1c1.9-1.7 3.1-4.1 3.1-6.9 0-.5 0-.9-.1-1.3H12v3.9h5.5c-.2 1.1-.8 2.1-1.8 2.7l3.1 1.6Z" />
                </svg>
              </span>
              {pageCopy.googleButton}
            </button>

            <div className="cap-divider">
              <span>or use email</span>
            </div>

            {isSignupMode && (
              <>
              <div className="cap-row">
                <div className="cap-field">
                  <label>First name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className={fieldErrors.firstName ? 'error' : ''}
                    placeholder="Ravi"
                  />
                  {fieldErrors.firstName && <p>{fieldErrors.firstName}</p>}
                </div>

                <div className="cap-field">
                  <label>Last name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className={fieldErrors.lastName ? 'error' : ''}
                    placeholder="Kumar"
                  />
                  {fieldErrors.lastName && <p>{fieldErrors.lastName}</p>}
                </div>
              </div>

              <div className="cap-field">
                <label>Phone number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={fieldErrors.phone ? 'error' : ''}
                  placeholder="+91 98765 43210"
                />
                {fieldErrors.phone && <p>{fieldErrors.phone}</p>}
              </div>
              </>
            )}

            <div className="cap-field">
              <label>Work email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={fieldErrors.email ? 'error' : ''}
                placeholder="you@company.com"
              />
              {fieldErrors.email && <p>{fieldErrors.email}</p>}
            </div>

            <div className="cap-field">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                className={fieldErrors.password ? 'error' : ''}
                    placeholder={isSignupMode ? 'Create a password' : 'Enter your password'}
              />
              {fieldErrors.password && <p>{fieldErrors.password}</p>}
            </div>

            <button className="cap-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Please wait...' : pageCopy.button}
            </button>

            <div className="cap-switch">
              {pageCopy.switchText}{' '}
              {showModeTabs ? (
                <button onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}>
                  {pageCopy.switchAction}
                </button>
              ) : (
                <button onClick={onCreateAccount}>
                  {pageCopy.switchAction}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
