import { useEffect, useState } from 'react';
import type { ContractorContract } from '../types/contractor.types';
import { getMyContract, rejectContractForMvp, signContractForMvp } from '../api/contractor.api';

function getContractDownloadName(contract: ContractorContract): string {
  const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const worker = slugify(contract.workerName || 'worker');
  return `${worker}-contract.pdf`;
}

interface Props {
  onComplete: (message?: string) => void;
  onBack?: () => void;
  allowBack?: boolean;
  onReject?: () => void;
}

export default function Step5ReviewSign({ onComplete, onBack, allowBack = true, onReject }: Props) {
  const [contract, setContract] = useState<ContractorContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    getMyContract()
      .then((c) => {
        setContract(c);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const message = (err as Error).message ?? 'Failed to load contract. Please refresh.';
        if (message.toLowerCase().includes('session expired')) {
          window.location.href = '/freelancer/login';
          return;
        }
        setError(message);
        setLoading(false);
      });
  }, []);

  const handleMvpSign = async () => {
    if (!agreed || signing) return;

    setSigning(true);
    setError(null);
    try {
      const signedContract = await signContractForMvp();
      setContract((prev) => signedContract ?? (prev
        ? { ...prev, workerSigned: true, status: 'worker_signed' }
        : prev));
      onComplete('Contract signed successfully. Redirecting to your contracts...');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to sign contract. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  const handleReject = async () => {
    if (rejecting || signing) return;
    const confirmed = window.confirm('Reject this contract invitation? This will decline the engagement.');
    if (!confirmed) return;

    setRejecting(true);
    setError(null);
    try {
      const rejectedContract = await rejectContractForMvp();
      setContract(rejectedContract);
      onReject?.();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to reject contract. Please try again.');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="cp-form-card" style={{ textAlign: 'center', paddingTop: 48 }}>
        <div className="cp-spinner dark" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading your contract...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="cp-form-card">
        <div className="cp-error">
          Contract not found. Please contact support at support@dechub.in
        </div>
      </div>
    );
  }

  const isFullySigned = contract.workerSigned && contract.companySigned;

  return (
    <div className="cp-form-card">
      <div className="cp-form-title">Review your contract</div>
      <div className="cp-form-sub">
        Your Dechub profile is already complete. Review this contract and choose to sign or reject this invitation.
      </div>

      {error && <div className="cp-error">{error}</div>}

      <div className="cp-contract-card">
        <div className="cp-contract-header">
          <div className="cp-contract-icon">DOC</div>
          <div className="cp-contract-meta">
            <div className="cp-contract-title">
              Contractor Agreement - {contract.workerName}
            </div>
            <div className="cp-contract-company">{contract.companyName}</div>
          </div>
        </div>

        <div className="cp-contract-body">
          {[
            { label: 'Role', value: contract.roleTitle },
            { label: 'Contract type', value: 'Independent Contractor' },
            { label: 'Pay rate', value: `${contract.payCurrency} ${contract.payRate?.toLocaleString()} / ${contract.payFrequency}` },
            { label: 'Start date', value: contract.startDate ? new Date(contract.startDate).toLocaleDateString('en-US', { dateStyle: 'long' }) : '-' },
            { label: 'End date', value: contract.endDate ? new Date(contract.endDate).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'Open-ended' },
            { label: 'Jurisdiction', value: 'State of Delaware, United States' },
          ].map(({ label, value }) => (
            <div key={label} className="cp-contract-row">
              <span className="cp-contract-key">{label}</span>
              <span className="cp-contract-val">{value}</span>
            </div>
          ))}

          {contract.scopeOfWork && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Scope of work
              </div>
              <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7, margin: 0 }}>
                {contract.scopeOfWork}
              </p>
            </div>
          )}
        </div>
      </div>

      {contract.pdfUrl && (
        <div style={{ marginBottom: 20 }}>
          <a
            href={contract.pdfUrl}
            target="_blank"
            rel="noreferrer"
            download={getContractDownloadName(contract)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#2563eb',
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Download full contract PDF
          </a>
        </div>
      )}

      <div className="cp-sig-area">
        <div className="cp-sig-title">Signature status</div>
        <div className="cp-sig-parties">
          <div className="cp-sig-party">
            <div className="cp-sig-party-label">Contractor</div>
            <div className="cp-sig-party-name">{contract.workerName}</div>
            <div className="cp-sig-party-status">
              {contract.workerSigned
                ? <span style={{ color: '#16a34a' }}>Signed</span>
                : <span style={{ color: '#ea580c' }}>Pending your signature</span>}
            </div>
          </div>
          <div className="cp-sig-party">
            <div className="cp-sig-party-label">Company</div>
            <div className="cp-sig-party-name">{contract.companyName}</div>
            <div className="cp-sig-party-status">
              {contract.companySigned
                ? <span style={{ color: '#16a34a' }}>Signed</span>
                : <span style={{ color: '#64748b' }}>Pending company signature</span>}
            </div>
          </div>
        </div>
      </div>

      {!contract.workerSigned && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 20,
            cursor: 'pointer',
          }}
          onClick={() => setAgreed((v) => !v)}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              border: `2px solid ${agreed ? '#0a1628' : '#cbd5e1'}`,
              background: agreed ? '#0a1628' : '#fff',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              marginTop: 1,
              transition: 'all 0.15s',
            }}
          >
            {agreed && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
          </div>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
            I have read and agree to the contractor agreement above. After you sign, this contract will appear in your dashboard while waiting for company countersignature.
          </p>
        </div>
      )}

      {isFullySigned && (
        <div className="cp-success">
          Contract is fully signed and active. You can now submit invoices each month.
        </div>
      )}

      {contract.status === 'rejected' ? (
        <div className="cp-success" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
          This invitation has been rejected. If this was a mistake, please contact support or the company team.
        </div>
      ) : !contract.workerSigned ? (
        <div className="cp-btn-row">
          {allowBack && onBack ? (
            <button type="button" className="cp-btn-secondary" onClick={onBack}>
              Back
            </button>
          ) : null}
          <button type="button" className="cp-btn-secondary" onClick={handleReject} disabled={rejecting || signing}>
            {rejecting ? 'Rejecting...' : 'Reject'}
          </button>
          <button
            type="button"
            className="cp-btn-primary"
            onClick={handleMvpSign}
            disabled={signing || !agreed}
            style={!agreed ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
          >
            {signing ? <><span className="cp-spinner" /> Signing contract...</> : 'Accept & Sign'}
          </button>
        </div>
      ) : !contract.companySigned ? (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 12,
              padding: '20px 24px',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>
              Waiting for company signature
            </div>
            <div style={{ fontSize: 13, color: '#3b82f6', lineHeight: 1.6 }}>
              You've signed the contract. Your company still needs to countersign.
            </div>
          </div>
          <button type="button" className="cp-btn-primary" onClick={() => onComplete()}>
            Continue to your dashboard
          </button>
        </div>
      ) : (
        <button type="button" className="cp-btn-primary" onClick={() => onComplete()}>
          Continue to your dashboard
        </button>
      )}
    </div>
  );
}
