import './success-modal.css';

export default function SuccessModal({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  return (
    <div className="sm-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sm-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="sm-title">{title}</h2>
        <p className="sm-message">{message}</p>
        <div className="sm-actions">
          <button type="button" className="sm-btn sm-btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="sm-btn sm-btn-primary" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}
