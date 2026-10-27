import { AppHandlers, AppState } from '../../types/signup';
import ActionButton from '../common/ActionButton';
import { UserIcon } from '../common/Icons';
import RadioCard from '../common/RadioCard';
import ToggleRow from '../common/ToggleRow';

export default function Step6Preferences({ state, handlers }: { state: AppState; handlers: AppHandlers }) {
  const { formData, errors, loadingAction } = state;
  const { handleInputChange, goToStep, completeSignup, validateEmail } = handlers;

  return (
    <section className="card screen active">
      <div className="card-icon bg-green">⚙️</div>
      <h2 className="card-title">HR preferences</h2>
      <p className="card-sub">Configure how Dechub runs payroll and contracts for your team.</p>

      <div className="form-group">
        <label>Default pay cycle <span className="req">*</span></label>
        <div className="radio-group">
          <RadioCard selected={formData.payCycle === 'monthly'} title="Monthly" text="Pay on last day" onClick={() => handleInputChange('payCycle', 'monthly')} />
          <RadioCard selected={formData.payCycle === 'biweekly'} title="Bi-weekly" text="Every 2 weeks" onClick={() => handleInputChange('payCycle', 'biweekly')} />
          <RadioCard selected={formData.payCycle === 'weekly'} title="Weekly" text="Every Friday" onClick={() => handleInputChange('payCycle', 'weekly')} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Default contract currency <span className="req">*</span></label>
          <select value={formData.contractCurrency} onChange={(e) => handleInputChange('contractCurrency', e.target.value)}>
            <option value="USD">🇺🇸 USD</option>
            <option value="GBP">🇬🇧 GBP</option>
            <option value="EUR">🇪🇺 EUR</option>
            <option value="CAD">🇨🇦 CAD</option>
            <option value="AUD">🇦🇺 AUD</option>
          </select>
        </div>
        <div className="form-group">
          <label>Company timezone <span className="req">*</span></label>
          <select value={formData.companyTimezone} onChange={(e) => handleInputChange('companyTimezone', e.target.value)}>
            <option value="America/New_York">🇺🇸 Eastern (ET)</option>
            <option value="America/Chicago">🇺🇸 Central (CT)</option>
            <option value="America/Los_Angeles">🇺🇸 Pacific (PT)</option>
            <option value="Europe/London">🇬🇧 London (GMT)</option>
            <option value="Europe/Berlin">🇩🇪 Berlin (CET)</option>
            <option value="Asia/Kolkata">🇮🇳 India (IST)</option>
            <option value="Asia/Singapore">🇸🇬 Singapore (SGT)</option>
            <option value="Australia/Sydney">🇦🇺 Sydney (AEST)</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>HR admin email <span className="req">*</span></label>
        <div className="input-wrap">
          <div className="input-icon"><UserIcon /></div>
          <input type="email" value={formData.hrEmail} onChange={(e) => handleInputChange('hrEmail', e.target.value)} className={errors.hrEmail ? 'error' : validateEmail(formData.hrEmail) ? 'valid' : ''} placeholder="hr@acmecorp.com" />
        </div>
        <div className={`field-error ${errors.hrEmail ? 'show' : ''}`}>{errors.hrEmail}</div>
        <div className="field-hint">This person manages day-to-day worker operations</div>
      </div>

      <div className="form-group">
        <label>Notification preferences</label>
        <div className="toggle-box">
          <ToggleRow title="Invoice approval reminders" text="Get notified when worker invoices are pending" checked={formData.notif1} onChange={(value) => handleInputChange('notif1', value)} />
          <ToggleRow title="Payroll processing alerts" text="Notify before each payroll run" checked={formData.notif2} onChange={(value) => handleInputChange('notif2', value)} />
          <ToggleRow title="Contract signature updates" text="Alert when workers sign or decline contracts" checked={formData.notif3} onChange={(value) => handleInputChange('notif3', value)} />
          <ToggleRow title="KYC / KYB status updates" text="Notify when verification completes" checked={formData.notif4} onChange={(value) => handleInputChange('notif4', value)} last />
        </div>
      </div>

      <div className="btn-row">
        <button type="button" className="btn-secondary" onClick={() => goToStep(5)}>← Back</button>
        <ActionButton loading={loadingAction === 'complete'} onClick={completeSignup}>
          Complete Setup →
        </ActionButton>
      </div>
    </section>
  );
}
