import { ChangeEvent, DragEvent } from 'react';
import type { DocState } from '../../types/signup';
import Tooltip from './Tooltip';

export default function UploadBox({
  label,
  required,
  tooltip,
  subtitle,
  icon,
  state,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onChange,
  error,
}: {
  label: string;
  required?: boolean;
  tooltip: string;
  subtitle: string;
  icon: string;
  state?: DocState;
  isDragOver: boolean;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div className="form-group">
      <label>
        {label} {required ? <span className="req">*</span> : null}
        <Tooltip text={tooltip} />
      </label>
      <div className={`upload-zone ${isDragOver ? 'dragover' : ''} ${state?.uploaded ? 'uploaded' : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onChange} />
        {state?.uploaded && state.file ? (
          <>
            <div className="upload-success">✅ {state.file.name}</div>
            <div className="upload-meta">{(state.file.size / 1024 / 1024).toFixed(2)} MB · Click to replace</div>
          </>
        ) : (
          <>
            <div className="upload-icon">{icon}</div>
            <div className="upload-title">Click to upload or drag &amp; drop</div>
            <div className="upload-sub">{subtitle}</div>
          </>
        )}
      </div>
      <div className={`field-error ${error ? 'show' : ''}`}>{error}</div>
    </div>
  );
}
