import ActionButton from '../common/ActionButton';
import { ArrowIcon, EyeIcon, GoogleIcon, MailIcon } from '../common/Icons';
import { AppHandlers, AppState } from '../../types/signup';

export default function Step1Account({ state, handlers }: { state: AppState; handlers: AppHandlers }) {
  const { formData, errors, showPassword, passwordScore, passwordStrength, loadingAction } = state;
  const { handleInputChange, setShowPassword, goToStep, validateEmail, googleSignup, goToLogin } = handlers;

  // Extra safety check - should not reach here due to parent guard, but handle gracefully
  if (!formData || typeof formData !== 'object') {
    return (
      <section className="card screen active">
        <div className="card-icon bg-indigo">🏢</div>
        <h2 className="card-title">Loading...</h2>
        <p className="card-sub">Preparing your signup form...</p>
      </section>
    );
  }

  return (
    <section className="card screen active">
      <div className="card-icon bg-indigo">🏢</div>
      <h2 className="card-title">Create your account</h2>
      <p className="card-sub">Start hiring global talent in minutes. No credit card required to sign up.</p>

      <button className="social-btn" type="button" onClick={googleSignup}>
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="or-divider"><span>or continue with email</span></div>

      <div className="form-row">
        <div className="form-group">
          <label>First name <span className="req">*</span></label>
          <input value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className={errors.firstName ? 'error' : formData.firstName ? 'valid' : ''} placeholder="John" autoComplete="given-name" />
          <div className={`field-error ${errors.firstName ? 'show' : ''}`}>{errors.firstName}</div>
        </div>
        <div className="form-group">
          <label>Last name <span className="req">*</span></label>
          <input value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className={errors.lastName ? 'error' : formData.lastName ? 'valid' : ''} placeholder="Smith" autoComplete="family-name" />
          <div className={`field-error ${errors.lastName ? 'show' : ''}`}>{errors.lastName}</div>
        </div>
      </div>

      <div className="form-group">
        <label>Work email <span className="req">*</span></label>
        <div className="input-wrap">
          <div className="input-icon"><MailIcon /></div>
          <input type="email" value={formData.workEmail} onChange={(e) => handleInputChange('workEmail', e.target.value)} className={errors.workEmail ? 'error' : validateEmail(formData.workEmail) ? 'valid' : ''} placeholder="john@acmecorp.com" autoComplete="email" />
        </div>
        <div className={`field-error ${errors.workEmail ? 'show' : ''}`}>{errors.workEmail}</div>
        <div className="field-hint">Use your company email, not Gmail or personal email</div>
      </div>

      <div className="form-group">
        <label>Password <span className="req">*</span></label>
        <div className="input-wrap">
          <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className={errors.password ? 'error' : formData.password.length >= 8 ? 'valid' : ''} placeholder="Create a strong password" autoComplete="new-password" />
          <button className="pw-toggle" type="button" onClick={() => setShowPassword((prev) => !prev)}>
            <EyeIcon />
          </button>
        </div>
        {formData.password ? (
          <div className="strength-wrap">
            <div className="strength-bars">
              {[1, 2, 3, 4].map((value) => (
                <div key={value} className="strength-bar" style={{ background: value <= passwordScore ? passwordStrength.color : 'var(--border)' }} />
              ))}
            </div>
            <div className="strength-label" style={{ color: passwordStrength.color }}>{passwordStrength.label}</div>
          </div>
        ) : null}
        <div className={`field-error ${errors.password ? 'show' : ''}`}>{errors.password}</div>
      </div>

      <div className="form-group">
        <label>Phone number <span className="req">*</span></label>
        <div className="phone-wrap">
          <select value={formData.phoneCode} onChange={(e) => handleInputChange('phoneCode', e.target.value)} className="phone-code">
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+91">🇮🇳 +91</option>
            <option value="+49">🇩🇪 +49</option>
            <option value="+33">🇫🇷 +33</option>
            <option value="+61">🇦🇺 +61</option>
            <option value="+65">🇸🇬 +65</option>
          </select>
          <input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className={errors.phone ? 'error' : formData.phone ? 'valid' : ''} placeholder="98765 43210" autoComplete="tel" />
        </div>
        <div className={`field-error ${errors.phone ? 'show' : ''}`}>{errors.phone}</div>
      </div>

      <ActionButton loading={loadingAction === 'step-2'} onClick={() => goToStep(2)}>
        Continue <ArrowIcon />
      </ActionButton>
      <div className="form-link">
        Already have an account?{' '}
        <button
          type="button"
          onClick={goToLogin}
          style={{ background: 'transparent', color: '#2563eb', fontWeight: 500, cursor: 'pointer' }}
        >
          Sign in
        </button>
      </div>
    </section>
  );
}
