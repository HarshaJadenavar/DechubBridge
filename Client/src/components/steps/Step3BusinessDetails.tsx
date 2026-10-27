import { AppHandlers, AppState } from '../../types/signup';
import ActionButton from '../common/ActionButton';
import { ArrowIcon, GlobeIcon } from '../common/Icons';

export default function Step3BusinessDetails({ state, handlers }: { state: AppState; handlers: AppHandlers }) {
  const { formData, errors, loadingAction } = state;
  const { handleInputChange, goToStep } = handlers;

  return (
    <section className="card screen active">
      <div className="card-icon bg-green">📋</div>
      <h2 className="card-title">Business details</h2>
      <p className="card-sub">Help us understand your company so we can configure the right compliance setup.</p>

      <div className="form-row">
        <div className="form-group">
          <label>Company size <span className="req">*</span></label>
          <select value={formData.companySize} onChange={(e) => handleInputChange('companySize', e.target.value)} className={errors.companySize ? 'error' : ''}>
            <option value="">Select size...</option>
            <option value="1-10">1–10 employees</option>
            <option value="11-50">11–50 employees</option>
            <option value="51-200">51–200 employees</option>
            <option value="201-500">201–500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
          <div className={`field-error ${errors.companySize ? 'show' : ''}`}>{errors.companySize}</div>
        </div>
        <div className="form-group">
          <label>Industry <span className="req">*</span></label>
          <select value={formData.companyIndustry} onChange={(e) => handleInputChange('companyIndustry', e.target.value)} className={errors.companyIndustry ? 'error' : ''}>
            <option value="">Select industry...</option>
            <option value="tech">Technology / Software</option>
            <option value="finance">Finance / Fintech</option>
            <option value="healthcare">Healthcare</option>
            <option value="ecommerce">E-Commerce / Retail</option>
            <option value="marketing">Marketing / Advertising</option>
            <option value="consulting">Consulting</option>
            <option value="education">Education</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="other">Other</option>
          </select>
          <div className={`field-error ${errors.companyIndustry ? 'show' : ''}`}>{errors.companyIndustry}</div>
        </div>
      </div>

      <div className="form-group">
        <label>Company website</label>
        <div className="input-wrap">
          <div className="input-icon"><GlobeIcon /></div>
          <input type="url" value={formData.companyWebsite} onChange={(e) => handleInputChange('companyWebsite', e.target.value)} placeholder="https://acmecorp.com" />
          <span className="input-suffix">optional</span>
        </div>
      </div>

      <div className="form-group">
        <label>Registered business address <span className="req">*</span></label>
        <input value={formData.addressLine1} onChange={(e) => handleInputChange('addressLine1', e.target.value)} placeholder="Street address" style={{ marginBottom: 8 }} />
        <div className="form-row compact-form-row">
          <input value={formData.addressCity} onChange={(e) => handleInputChange('addressCity', e.target.value)} placeholder="City" />
          <input value={formData.addressZip} onChange={(e) => handleInputChange('addressZip', e.target.value)} placeholder="ZIP / Postal code" />
        </div>
        <div className={`field-error ${errors.addressLine1 ? 'show' : ''}`}>{errors.addressLine1}</div>
      </div>

      <div className="form-group">
        <label>How did you hear about Dechub?</label>
        <select value={formData.referralSource} onChange={(e) => handleInputChange('referralSource', e.target.value)}>
          <option value="">Select source...</option>
          <option value="search">Google Search</option>
          <option value="social">LinkedIn / Social Media</option>
          <option value="referral">Friend or Colleague</option>
          <option value="blog">Blog / Article</option>
          <option value="conference">Conference / Event</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="btn-row">
        <button type="button" className="btn-secondary" onClick={() => goToStep(2)}>← Back</button>
        <ActionButton loading={loadingAction === 'step-4'} onClick={() => goToStep(4)}>
          Continue <ArrowIcon />
        </ActionButton>
      </div>
    </section>
  );
}
