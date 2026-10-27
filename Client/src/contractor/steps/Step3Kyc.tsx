import { useState, useCallback } from 'react';
import type { ContractorOnboardingData } from '../types/contractor.types';
import { uploadKyc } from '../api/contractor.api';

const ID_TYPES = [
  { value: 'passport',        label: 'Passport',                  icon: '🛂', needsBack: false },
  { value: 'drivers_license', label: "Driver's License",          icon: '🪪', needsBack: true  },
  { value: 'national_id',     label: 'National ID Card',          icon: '🪪', needsBack: true  },
];

interface UploadZoneProps {
  label:    string;
  hint:     string;
  file:     File | null;
  onFile:   (f: File) => void;
  accept?:  string;
}

function UploadZone({ label, hint, file, onFile, accept = 'image/*,.pdf' }: UploadZoneProps) {
  const [drag, setDrag] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      className={`cp-upload-zone ${drag ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      {file ? (
        <>
          <div className="cp-upload-icon">✅</div>
          <div className="cp-upload-label">{label}</div>
          <div className="cp-upload-file-name">📎 {file.name}</div>
          <div className="cp-upload-sub" style={{ marginTop: 4 }}>Click to replace</div>
        </>
      ) : (
        <>
          <div className="cp-upload-icon">📎</div>
          <div className="cp-upload-label">{label}</div>
          <div className="cp-upload-sub">{hint}</div>
          <div className="cp-upload-sub" style={{ marginTop: 6 }}>
            PNG, JPG, or PDF · Max 10MB
          </div>
        </>
      )}
    </div>
  );
}

interface Props {
  data:    ContractorOnboardingData;
  onChange:(k: keyof ContractorOnboardingData, v: string | File | null) => void;
  onNext:  () => void;
  onBack:  () => void;
  submitLabel?: string;
  onSubmitOverride?: () => Promise<void> | void;
}

export default function Step3KYC({
  data,
  onChange,
  onNext,
  onBack,
  submitLabel = 'Submit for Verification →',
  onSubmitOverride,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const selectedType = ID_TYPES.find((t) => t.value === data.idType);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.idType)       e.idType    = 'Select an ID type';
    if (!data.idNumber)     e.idNumber  = 'ID number is required';
    if (!data.idFrontFile)  e.idFront   = 'Upload the front of your ID';
    if (selectedType?.needsBack && !data.idBackFile) e.idBack = 'Upload the back of your ID';
    if (!data.selfieFile)   e.selfie    = 'Upload a selfie holding your ID';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setError(null);
    setLoading(true);
    try {
      if (onSubmitOverride) {
        await onSubmitOverride();
      } else {
        await uploadKyc(
          data.idType,
          data.idNumber,
          data.idFrontFile!,
          data.idBackFile,
          data.selfieFile!,
        );
      }
      onNext();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-form-card">
      <div className="cp-form-title">Identity verification</div>
      <div className="cp-form-sub">
        KYC (Know Your Customer) is required by financial regulations before we can process payments.
        Your documents are encrypted and never shared with third parties.
      </div>

      {error && <div className="cp-error">⚠ {error}</div>}

      {/* Tips */}
      <div className="cp-tips">
        <div className="cp-tips-title">📸 Tips for a successful verification</div>
        <ul>
          <li>Make sure all 4 corners of your ID are visible</li>
          <li>Ensure the photo is clear and not blurry</li>
          <li>Take the selfie in good lighting, holding the ID next to your face</li>
          <li>Do not cover any information on the document</li>
        </ul>
      </div>

      {/* ID Type selection */}
      <div className="cp-field">
        <label className="cp-label">Document type <span className="cp-req">*</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 4 }}>
          {ID_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                onChange('idType', t.value);
                setErrors((prev) => { const n = { ...prev }; delete n.idType; return n; });
              }}
              style={{
                border: `2px solid ${data.idType === t.value ? '#0a1628' : '#e2e8f0'}`,
                background: data.idType === t.value ? 'rgba(10,22,40,0.03)' : '#fff',
                borderRadius: 10,
                padding: '12px 10px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{t.label}</div>
            </button>
          ))}
        </div>
        {errors.idType && <p className="cp-field-error">⚠ {errors.idType}</p>}
      </div>

      {/* ID number */}
      {data.idType && (
        <div className="cp-field">
          <label className="cp-label">
            {data.idType === 'passport' ? 'Passport number' : 'ID number'}{' '}
            <span className="cp-req">*</span>
          </label>
          <input
            className={`cp-input ${errors.idNumber ? 'error' : ''}`}
            placeholder="Enter the number exactly as shown on your document"
            value={data.idNumber}
            onChange={(e) => {
              onChange('idNumber', e.target.value);
              setErrors((prev) => { const n = { ...prev }; delete n.idNumber; return n; });
            }}
          />
          {errors.idNumber && <p className="cp-field-error">⚠ {errors.idNumber}</p>}
        </div>
      )}

      {/* Front of ID */}
      <div className="cp-field">
        <label className="cp-label">
          {selectedType?.needsBack ? 'Front of ID' : 'Photo page'}{' '}
          <span className="cp-req">*</span>
        </label>
        <UploadZone
          label="Upload front side"
          hint="Drag & drop or click to browse"
          file={data.idFrontFile}
          onFile={(f) => {
            onChange('idFrontFile', f);
            setErrors((prev) => { const n = { ...prev }; delete n.idFront; return n; });
          }}
        />
        {errors.idFront && <p className="cp-field-error" style={{ marginTop: 6 }}>⚠ {errors.idFront}</p>}
      </div>

      {/* Back of ID */}
      {selectedType?.needsBack && (
        <div className="cp-field">
          <label className="cp-label">Back of ID <span className="cp-req">*</span></label>
          <UploadZone
            label="Upload back side"
            hint="Required for license and national ID"
            file={data.idBackFile}
            onFile={(f) => {
              onChange('idBackFile', f);
              setErrors((prev) => { const n = { ...prev }; delete n.idBack; return n; });
            }}
          />
          {errors.idBack && <p className="cp-field-error" style={{ marginTop: 6 }}>⚠ {errors.idBack}</p>}
        </div>
      )}

      {/* Selfie */}
      <div className="cp-field">
        <label className="cp-label">
          Selfie holding your ID <span className="cp-req">*</span>
        </label>
        <UploadZone
          label="Upload selfie with ID"
          hint="Hold your ID next to your face — both must be clearly visible"
          file={data.selfieFile}
          onFile={(f) => {
            onChange('selfieFile', f);
            setErrors((prev) => { const n = { ...prev }; delete n.selfie; return n; });
          }}
          accept="image/*"
        />
        {errors.selfie && <p className="cp-field-error" style={{ marginTop: 6 }}>⚠ {errors.selfie}</p>}
      </div>

      <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4, marginBottom: 20, lineHeight: 1.6 }}>
        🔒 Your documents are encrypted with AES-256 and reviewed only by our compliance team.
        KYC is processed within 24 hours. You'll be notified by email once verified.
      </p>

      <div className="cp-btn-row">
        <button type="button" className="cp-btn-secondary" onClick={onBack} disabled={loading}>
          ← Back
        </button>
        <button type="button" className="cp-btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading
            ? <><span className="cp-spinner" /> Uploading…</>
            : submitLabel}
        </button>
      </div>
    </div>
  );
}
