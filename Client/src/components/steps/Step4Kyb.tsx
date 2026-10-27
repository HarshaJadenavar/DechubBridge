import { AppHandlers, AppState } from '../../types/signup';
import ActionButton from '../common/ActionButton';
import { ArrowIcon } from '../common/Icons';
import UploadBox from '../common/UploadBox';

interface Props {
  state:    AppState;
  handlers: AppHandlers;
}

export default function Step4Kyb({ state, handlers }: Props) {
  // ── Guard — never crash if parent somehow passes undefined ─────────────────
  if (!state || !handlers) return null;

  const {
    kybStatus,
    uploadedDocs,
    dragOver,
    errors,
    loadingAction,
    kybUploadPct,
  } = state;

  const {
    goToStep,
    submitKyb,
    goBillingAfterKyb,
    handleFileInput,
    onDragOver,
    onDragLeave,
    onDrop,
  } = handlers;

  const isVerifying = loadingAction === 'kyb';
  const isGoingNext = loadingAction === 'go-billing';

  // ── Status banner config ───────────────────────────────────────────────────

  const statusConfig = {
    pending: {
      cls:   'vb-pending',
      icon:  '⏳',
      title: 'Verification pending',
      body:  'Upload the required documents below. Verification typically takes 2–5 minutes once submitted.',
    },
    verifying: {
      cls:   'vb-pending',
      icon:  '🔄',
      title: 'Verifying your documents…',
      body:  'Stripe Identity is processing your business documents. This usually takes under 2 minutes.',
    },
    approved: {
      cls:   'vb-approved',
      icon:  '✅',
      title: 'Business verified successfully!',
      body:  'Your KYB check passed. You can now proceed to set up billing.',
    },
    rejected: {
      cls:   'vb-pending',
      icon:  '❌',
      title: 'Verification rejected',
      body:  'We could not verify your documents. Please re-upload clearer copies or contact support.',
    },
  };

  const s = statusConfig[kybStatus] ?? statusConfig.pending;

  return (
    <section className="card screen active">
      <div className="card-icon bg-purple">🔍</div>
      <h2 className="card-title">Verify your business</h2>
      <p className="card-sub">
        We need to verify your business identity (KYB) before you can hire workers.
        Documents are encrypted and processed by Stripe Identity.
      </p>

      {/* Status banner */}
      <div className={`verify-banner ${s.cls}`}>
        <div className="vb-icon">{s.icon}</div>
        <div className="vb-text">
          <h4>{s.title}</h4>
          <p>{s.body}</p>
        </div>
      </div>

      {/* Upload progress bar */}
      {isVerifying && kybUploadPct < 100 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 12, color: '#64748b', marginBottom: 6,
          }}>
            <span>Uploading documents…</span>
            <span>{kybUploadPct}%</span>
          </div>
          <div style={{ height: 4, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${kybUploadPct}%`,
              background: 'linear-gradient(90deg, #00c9a7, #2563eb)',
              borderRadius: 99, transition: 'width 0.3s',
            }} />
          </div>
        </div>
      )}

      {/* Stripe processing spinner */}
      {isVerifying && kybUploadPct >= 100 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 0', marginBottom: 16, color: '#64748b', fontSize: 13,
        }}>
          <div className="spinner" style={{
            borderTopColor: '#0a1628', borderColor: '#e2e8f0', flexShrink: 0,
          }} />
          Waiting for Stripe Identity to process your documents…
        </div>
      )}

      {/* Upload zones */}
      <UploadBox
        label="Certificate of Incorporation"
        required
        tooltip="Government-issued proof your company is legally registered"
        subtitle="PDF, JPG, PNG · Max 10MB"
        icon="📄"
        state={uploadedDocs.doc1}
        isDragOver={!!dragOver.doc1}
        onDragOver={onDragOver('doc1')}
        onDragLeave={onDragLeave('doc1')}
        onDrop={onDrop('doc1')}
        onChange={handleFileInput('doc1')}
        error={errors.doc1}
      />

      <UploadBox
        label="Tax ID / EIN document"
        tooltip="IRS EIN letter (US), VAT certificate (EU), or equivalent"
        subtitle="PDF, JPG, PNG · Max 10MB · Optional"
        icon="🧾"
        state={uploadedDocs.doc2}
        isDragOver={!!dragOver.doc2}
        onDragOver={onDragOver('doc2')}
        onDragLeave={onDragLeave('doc2')}
        onDrop={onDrop('doc2')}
        onChange={handleFileInput('doc2')}
      />

      <UploadBox
        label="Owner / Director Government ID"
        required
        tooltip="Passport, national ID, or driver's license of the company owner"
        subtitle="Passport · National ID · Driver's License"
        icon="🪪"
        state={uploadedDocs.doc3}
        isDragOver={!!dragOver.doc3}
        onDragOver={onDragOver('doc3')}
        onDragLeave={onDragLeave('doc3')}
        onDrop={onDrop('doc3')}
        onChange={handleFileInput('doc3')}
        error={errors.doc3}
      />

      <UploadBox
        label="Proof of Business Address"
        tooltip="Utility bill or bank statement not older than 3 months"
        subtitle="Utility bill or bank statement · Optional"
        icon="🏠"
        state={uploadedDocs.doc4}
        isDragOver={!!dragOver.doc4}
        onDragOver={onDragOver('doc4')}
        onDragLeave={onDragLeave('doc4')}
        onDrop={onDrop('doc4')}
        onChange={handleFileInput('doc4')}
      />

      {/* Buttons */}
      <div className="btn-row">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => { void goToStep(3); }}
          disabled={isVerifying}
        >
          ← Back
        </button>

        {kybStatus === 'approved' ? (
          <ActionButton loading={isGoingNext} onClick={goBillingAfterKyb}>
            Continue to Billing <ArrowIcon />
          </ActionButton>
        ) : (
          <ActionButton
            loading={isVerifying}
            disabled={kybStatus === 'rejected'}
            onClick={submitKyb}
          >
            {kybStatus === 'rejected' ? 'Contact Support' : 'Submit for Verification'}
          </ActionButton>
        )}
      </div>
    </section>
  );
}
