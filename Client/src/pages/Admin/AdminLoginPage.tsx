import { useState } from 'react';
import { api, adminTokenStore, tokenStore } from '../../api/client';
import type { ApiError } from '../../api/client';
import '../login.css';

interface AdminLoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

export default function AdminLoginPage({ onLogin, onBack }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
        '/admin/login',
        {
          email: email.toLowerCase(),
          password,
        },
      );
      const data = res.data.data;
      // Clear company tokens and set admin tokens exclusively
      tokenStore.clear();
      adminTokenStore.set(data.accessToken, data.refreshToken);
      onLogin();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.message ?? 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-left-grid" />
        <div className="login-logo">
          <div className="login-logo-mark" style={{ width: 36, height: 36 }}>
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="login-logo-name">Dechub Admin</span>
        </div>
        <div className="login-left-body">
          <div className="login-left-tag">Internal access only</div>
          <h1 className="login-left-title">
            Admin portal<br />for talent request review
          </h1>
          <p className="login-left-sub">
            Sign in with a Dechub admin account to view incoming talent consultation requests and manage request status.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-right-header">
          <button className="login-lang-btn" onClick={onBack}>Back</button>
        </div>

        <div className="login-card">
          <div className="login-card-title">Dechub Admin Sign In</div>
          <div className="login-card-sub">Enter your admin email and password.</div>

          {error && (
            <div className="login-error-banner">
              <span style={{ flexShrink: 0 }}>Warning:</span>
              <span>{error}</span>
            </div>
          )}

          <div className="login-field">
            <label className="login-label">Email address</label>
            <div className="login-input-wrap" style={{ marginTop: 7 }}>
              <input
                type="email"
                className="login-input"
                placeholder="admin@dechub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={{ paddingRight: 14 }}
              />
            </div>
          </div>

          <div className="login-field">
            <div className="login-field-header">
              <label className="login-label">Password</label>
            </div>
            <div className="login-input-wrap">
              <input
                type="password"
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button className="login-submit" onClick={handleLogin} disabled={loading}>
            {loading ? <><span className="login-spinner" /> Signing in...</> : 'Sign in'}
          </button>

          <div className="login-terms" style={{ marginTop: 24 }}>
            This admin portal is for internal Dechub staff only.
          </div>
        </div>
      </div>
    </div>
  );
}
