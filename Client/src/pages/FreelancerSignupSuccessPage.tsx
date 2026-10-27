import '../contractor/contractor.css';

interface FreelancerSignupSuccessPageProps {
  firstName: string;
  onDashboard: () => void;
}

export default function FreelancerSignupSuccessPage({
  firstName,
  onDashboard,
}: FreelancerSignupSuccessPageProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: 480, textAlign: 'center', padding: 32 }}>
        <div
          style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #00c9a7, #2563eb)',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 24px',
            fontSize: 36,
          }}
        >
          ✓
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 10 }}>
          You&apos;re all set!
        </h2>
        <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 8 }}>
          Welcome to Dechub, {firstName}.
        </p>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 32 }}>
          Your signup is complete. You can continue to your dashboard now.
        </p>
        <button
          type="button"
          className="cp-btn-primary"
          onClick={onDashboard}
        >
          Go to dashboard →
        </button>
      </div>
    </div>
  );
}
