import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error:   Error | null;
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Dechub] Unhandled error:', error, info.componentStack);
  }

  handleReset = () => {
    // Clear all tokens so the user gets a clean slate
    localStorage.removeItem('dechub_access_token');
    localStorage.removeItem('dechub_refresh_token');
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display:   'flex',
          alignItems:'center',
          justifyContent: 'center',
          background: '#f8fafc',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 1px 16px rgba(0,0,0,0.08)',
            padding: '48px 40px',
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8, lineHeight: 1.6 }}>
              The app ran into an unexpected error. Click the button below to
              clear your session and start fresh.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre style={{
                background: '#fef2f2', borderRadius: 8, padding: 12,
                fontSize: 11, color: '#dc2626', textAlign: 'left',
                overflowX: 'auto', marginBottom: 20,
                border: '1px solid #fecaca',
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              style={{
                background: '#0a1628', color: '#fff', border: 'none',
                borderRadius: 8, padding: '12px 28px', fontSize: 15,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Clear session &amp; restart
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}