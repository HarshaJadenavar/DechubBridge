import { companyTypes } from '../../constants/signup';
import { AppHandlers, AppState } from '../../types/signup';
import ActionButton from '../common/ActionButton';
import { ArrowIcon } from '../common/Icons';
import Tooltip from '../common/Tooltip';

export default function Step2CompanyIdentity({ state, handlers, initialStep = 1, completeAfterStep1 = false }: { state: AppState; handlers: AppHandlers; initialStep?: number; completeAfterStep1?: boolean }) {
  const { formData, errors, loadingAction } = state;
  const { handleInputChange, goToStep } = handlers;

  return (
    <section className="card screen active">
      <div className="card-icon bg-blue">🏛️</div>
      <h2 className="card-title">Company identity</h2>
      <p className="card-sub">Tell us about your company. This information will appear on all contracts and legal documents.</p>

      <div className="form-group">
        <label>
          Legal company name <span className="req">*</span>
          <Tooltip text="Must match your certificate of incorporation" />
        </label>
        <input value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} className={errors.companyName ? 'error' : formData.companyName ? 'valid' : ''} placeholder="Acme Corporation Inc." />
        <div className={`field-error ${errors.companyName ? 'show' : ''}`}>{errors.companyName}</div>
        <div className="field-hint">Use the exact name as registered with authorities</div>
      </div>

      <div className="form-group">
        <label>Country of registration <span className="req">*</span></label>
        <select value={formData.companyCountry} onChange={(e) => handleInputChange('companyCountry', e.target.value)} className={errors.companyCountry ? 'error' : ''}>
          <option value="">Select country...</option>
          <option value="US">🇺🇸 United States</option>
          <option value="GB">🇬🇧 United Kingdom</option>
          <option value="DE">🇩🇪 Germany</option>
          <option value="FR">🇫🇷 France</option>
          <option value="CA">🇨🇦 Canada</option>
          <option value="AU">🇦🇺 Australia</option>
          <option value="SG">🇸🇬 Singapore</option>
          <option value="NL">🇳🇱 Netherlands</option>
          <option value="SE">🇸🇪 Sweden</option>
          <option value="AE">🇦🇪 UAE</option>
          <option value="OTHER">🌍 Other</option>
        </select>
        <div className={`field-error ${errors.companyCountry ? 'show' : ''}`}>{errors.companyCountry}</div>
      </div>

      <div className="form-group">
        <label>Company type <span className="req">*</span></label>
        <div className="type-grid">
          {companyTypes.map((type) => (
            <button
              type="button"
              key={type.title}
              className={`type-card ${formData.companyType === type.title ? 'selected' : ''}`}
              onClick={() => handleInputChange('companyType', type.title)}
            >
              <h4>{type.title}</h4>
              <p>{type.sub}</p>
            </button>
          ))}
        </div>
        <div className={`field-error ${errors.companyType ? 'show' : ''}`}>{errors.companyType}</div>
      </div>

      <div className="form-group">
        <label>
          Registration / Tax ID <span className="req">*</span>
          <Tooltip text="EIN (US), Company No (UK), CIN (India)" />
        </label>
        <input
          value={formData.taxId}
          onChange={(e) => handleInputChange('taxId', e.target.value)}
          className={errors.taxId ? 'error' : formData.taxId ? 'valid' : ''}
          placeholder="e.g. 12-3456789"
        />
        <div className={`field-error ${errors.taxId ? 'show' : ''}`}>{errors.taxId}</div>
        <div className="field-hint">EIN (US) · Company Number (UK) · CIN (India)</div>
      </div>

      <div className="btn-row">
        {!((initialStep > 1 || completeAfterStep1)) ? (
          <button type="button" className="btn-secondary" onClick={handlers.goBack}>← Back</button>
        ) : null}
        <ActionButton loading={loadingAction === 'step-3'} onClick={() => goToStep(3)}>
          Continue <ArrowIcon />
        </ActionButton>
      </div>
    </section>
  );
}
