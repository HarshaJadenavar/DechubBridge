import { useEffect, useMemo, useState } from 'react';
import '../contractor/contractor.css';
import './freelancer-signup.css';
import type { ContractorOnboardingData } from '../contractor/types/contractor.types';
import { INITIAL_ONBOARDING } from '../contractor/types/contractor.types';
import { contractorTokenStore, getContractorProfile, selfSignupContractor } from '../contractor/api/contractor.api';
import Step2PersonalDetails from '../contractor/steps/Step2PersonalDetails';
import Step3KYC from '../contractor/steps/Step3Kyc';
import Step4BankDetails from '../contractor/steps/Step4BankDetails';

interface FreelancerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string;
  idType: string;
  idNumber: string;
  paymentMethod: string;
  wiseEmail: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  paypalEmail: string;
}

interface FreelancerSignupPageProps {
  onBack: () => void;
  onComplete: (profile: FreelancerProfile) => void;
}

function inferOnboardingStepFromProfile(profile: {
  dateOfBirth?: string;
  nationality?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  taxId?: string;
  idType?: string;
  idNumber?: string;
  paymentMethod?: string;
  wiseEmail?: string;
  bankName?: string;
  accountNumber?: string;
  paypalEmail?: string;
}): number {
  const hasPersonalDetails = Boolean(
    profile.dateOfBirth
    && profile.nationality?.trim()
    && profile.addressLine1?.trim()
    && profile.city?.trim()
    && profile.postalCode?.trim()
    && profile.country?.trim()
    && profile.taxId?.trim(),
  );

  if (!hasPersonalDetails) {
    return 1;
  }

  const hasKycSubmission = Boolean(profile.idType?.trim() && profile.idNumber?.trim());
  if (!hasKycSubmission) {
    return 2;
  }

  const hasPaymentDetails = Boolean(
    (profile.paymentMethod === 'wise' && profile.wiseEmail?.trim())
    || (profile.paymentMethod === 'paypal' && profile.paypalEmail?.trim())
    || (profile.paymentMethod === 'bank_transfer' && profile.bankName?.trim() && profile.accountNumber?.trim()),
  );

  if (!hasPaymentDetails) {
    return 3;
  }

  return 4;
}

function LogoMark() {
  return (
    <div className="cp-logo-mark">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

const STEPS = [
  { label: 'Create account', desc: 'Set up your freelancer profile' },
  { label: 'Personal details', desc: 'Complete your profile' },
  { label: 'Identity check', desc: 'Verify for payments' },
  { label: 'Payment details', desc: 'Add payout method' },
] as const;

const PHONE_CODES = [
  { value: '+1', label: 'US +1' },
  { value: '+44', label: 'UK +44' },
  { value: '+91', label: 'IN +91' },
  { value: '+49', label: 'DE +49' },
  { value: '+33', label: 'FR +33' },
  { value: '+61', label: 'AU +61' },
  { value: '+65', label: 'SG +65' },
] as const;

export default function FreelancerSignupPage({
  onBack,
  onComplete,
}: FreelancerSignupPageProps) {
  const [step, setStep] = useState(0);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [account, setAccount] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneCode: '+1',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [form, setForm] = useState<ContractorOnboardingData>({
    ...INITIAL_ONBOARDING,
    paymentMethod: 'wise',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resumeMode = new URLSearchParams(window.location.search).get('resume') === '1';

  const currentMeta = useMemo(() => STEPS[step], [step]);

  useEffect(() => {
    let cancelled = false;

    async function loadExistingContractor() {
      if (!contractorTokenStore.getAccess()) {
        if (!cancelled) {
          setResumeLoading(false);
        }
        return;
      }

      try {
        const profile = await getContractorProfile();
        if (cancelled) return;

        setAccount((prev) => ({
          ...prev,
          firstName: profile.firstName ?? prev.firstName,
          lastName: profile.lastName ?? prev.lastName,
          email: profile.email ?? prev.email,
        }));

        setForm((prev) => ({
          ...prev,
          dateOfBirth: profile.dateOfBirth ?? '',
          nationality: profile.nationality ?? '',
          addressLine1: profile.addressLine1 ?? '',
          addressLine2: profile.addressLine2 ?? '',
          city: profile.city ?? '',
          state: profile.state ?? '',
          postalCode: profile.postalCode ?? '',
          country: profile.country ?? '',
          taxId: profile.taxId ?? '',
          idType: profile.idType ?? '',
          idNumber: profile.idNumber ?? '',
          paymentMethod: profile.paymentMethod || 'wise',
          wiseEmail: profile.wiseEmail ?? '',
          bankName: profile.bankName ?? '',
          accountNumber: profile.accountNumber ?? '',
          routingNumber: profile.routingNumber ?? '',
          swiftCode: profile.swiftCode ?? '',
          paypalEmail: profile.paypalEmail ?? '',
        }));

        const inferredOnboardingStep =
          typeof profile.onboardingStep === 'number' && profile.onboardingStep > 0
            ? profile.onboardingStep
            : inferOnboardingStepFromProfile(profile);

        if (resumeMode && inferredOnboardingStep > 0 && inferredOnboardingStep < 4) {
          setStep(inferredOnboardingStep);
        } else if (resumeMode && inferredOnboardingStep >= 4) {
          window.location.replace('/contractor/dashboard');
          return;
        }
      } catch (err) {
        if (cancelled) return;
        setAccountError((err as Error).message ?? 'Failed to load your signup progress.');
      } finally {
        if (!cancelled) {
          setResumeLoading(false);
        }
      }
    }

    void loadExistingContractor();

    return () => {
      cancelled = true;
    };
  }, [resumeMode]);

  const updateAccountField = (key: keyof typeof account, value: string) => {
    setAccount((prev) => ({ ...prev, [key]: value }));
    setAccountError('');
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateStringField = (key: keyof ContractorOnboardingData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value as ContractorOnboardingData[typeof key] }));
  };

  const updateFormField = <K extends keyof ContractorOnboardingData>(
    key: K,
    value: ContractorOnboardingData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateAccountStep = () => {
    const nextErrors: Record<string, string> = {};

    if (!account.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!account.lastName.trim()) nextErrors.lastName = 'Last name is required';
    if (!account.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!account.phone.trim()) {
      nextErrors.phone = 'Contact number is required';
    } else if (!/^\d[\d\s()-]{5,18}$/.test(account.phone.trim())) {
      nextErrors.phone = 'Enter a valid contact number';
    }
    if (!account.password.trim()) {
      nextErrors.password = 'Password is required';
    } else if (account.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }
    if (!account.confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (account.password !== account.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    return nextErrors;
  };

  const finishSignup = () => {
    const profile: FreelancerProfile = {
      firstName: account.firstName.trim(),
      lastName: account.lastName.trim(),
      email: account.email.trim().toLowerCase(),
      phone: `${account.phoneCode} ${account.phone.trim()}`,
      dateOfBirth: form.dateOfBirth,
      nationality: form.nationality.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
      taxId: form.taxId.trim(),
      idType: form.idType,
      idNumber: form.idNumber.trim(),
      paymentMethod: form.paymentMethod,
      wiseEmail: form.wiseEmail.trim(),
      bankName: form.bankName.trim(),
      accountNumber: form.accountNumber.trim(),
      routingNumber: form.routingNumber.trim(),
      swiftCode: form.swiftCode.trim(),
      paypalEmail: form.paypalEmail.trim(),
    };

    onComplete(profile);
    window.location.replace('/contractor/dashboard');
  };

  const handleFirstStepContinue = async () => {
    const nextErrors = validateAccountStep();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setAccountLoading(true);
    setAccountError('');
    try {
      await selfSignupContractor({
        firstName: account.firstName.trim(),
        lastName: account.lastName.trim(),
        email: account.email.trim().toLowerCase(),
        phone: `${account.phoneCode} ${account.phone.trim()}`,
        password: account.password,
      });
      window.location.replace('/contractor/dashboard');
    } catch (err) {
      setAccountError((err as Error).message ?? 'Failed to create your account.');
    } finally {
      setAccountLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      if (resumeMode && contractorTokenStore.getAccess()) {
        window.location.replace('/contractor/dashboard');
        return;
      }
      onBack();
      return;
    }
    setStep((prev) => prev - 1);
  };

  if (resumeLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="cp-spinner dark" style={{ width: 28, height: 28, borderWidth: 3, margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading your signup progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-root">
      <div className="cp-onboarding">
        <aside className="cp-left">
          <div className="cp-logo">
            <LogoMark />
            <span className="cp-logo-name">Dechub</span>
          </div>

          <div className="cp-welcome">
            <div className="cp-welcome-tag">Freelancer signup</div>
            <div className="cp-welcome-company">Create your freelancer account</div>
            <div className="cp-welcome-role">
              {resumeMode
                ? 'Complete the remaining setup steps and keep your freelancer profile ready for payments.'
                : 'Create your account first, then finish the remaining setup later from your dashboard.'}
            </div>

            <div className="cp-progress-steps">
              {STEPS.map((item, index) => {
                const state = index < step ? 'done' : index === step ? 'active' : 'pending';
                return (
                  <div key={item.label} className={`cp-progress-step ${state}`}>
                    <div className={`cp-step-num ${state}`}>{index < step ? '✓' : index + 1}</div>
                    <div className="cp-step-info">
                      <div className={`cp-step-label ${state}`}>{item.label}</div>
                      <div className={`cp-step-desc ${state}`}>{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cp-left-footer">
            Your data is encrypted with AES-256 and stored securely.
            <br />
            © {new Date().getFullYear()} Dechub Pvt. Ltd. · Bengaluru, India
          </div>
        </aside>

        <div className="cp-right">
          {step === 0 && (
            <div className="cp-form-card">
              <button className="fsp-back" onClick={handleBack}>
                Back
              </button>

              <div className="cp-form-title">{currentMeta.label}</div>
              <div className="cp-form-sub">{currentMeta.desc}</div>

              {accountError && <div className="cp-error">Warning: {accountError}</div>}

              <div className="cp-row-2">
                <div className="cp-field">
                  <label className="cp-label">First name <span className="cp-req">*</span></label>
                  <input
                    className={`cp-input ${errors.firstName ? 'error' : ''}`}
                    value={account.firstName}
                    onChange={(e) => updateAccountField('firstName', e.target.value)}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="cp-field-error">{errors.firstName}</p>}
                </div>
                <div className="cp-field">
                  <label className="cp-label">Last name <span className="cp-req">*</span></label>
                  <input
                    className={`cp-input ${errors.lastName ? 'error' : ''}`}
                    value={account.lastName}
                    onChange={(e) => updateAccountField('lastName', e.target.value)}
                    placeholder="Smith"
                  />
                  {errors.lastName && <p className="cp-field-error">{errors.lastName}</p>}
                </div>
              </div>

              <div className="cp-field">
                <label className="cp-label">Email <span className="cp-req">*</span></label>
                <input
                  type="email"
                  className={`cp-input ${errors.email ? 'error' : ''}`}
                  value={account.email}
                  onChange={(e) => updateAccountField('email', e.target.value)}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="cp-field-error">{errors.email}</p>}
              </div>

              <div className="cp-field">
                <label className="cp-label">Contact number <span className="cp-req">*</span></label>
                <div className="fsp-phone-row">
                  <select
                    className="cp-input fsp-phone-code"
                    value={account.phoneCode}
                    onChange={(e) => updateAccountField('phoneCode', e.target.value)}
                    aria-label="Country code"
                  >
                    {PHONE_CODES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    className={`cp-input ${errors.phone ? 'error' : ''}`}
                    value={account.phone}
                    onChange={(e) => updateAccountField('phone', e.target.value)}
                    placeholder="555 123 4567"
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && <p className="cp-field-error">{errors.phone}</p>}
              </div>

              <div className="cp-field">
                <label className="cp-label">Create password <span className="cp-req">*</span></label>
                <input
                  type="password"
                  className={`cp-input ${errors.password ? 'error' : ''}`}
                  value={account.password}
                  onChange={(e) => updateAccountField('password', e.target.value)}
                  placeholder="Minimum 8 characters"
                />
                {errors.password && <p className="cp-field-error">{errors.password}</p>}
              </div>

              <div className="cp-field">
                <label className="cp-label">Confirm password <span className="cp-req">*</span></label>
                <input
                  type="password"
                  className={`cp-input ${errors.confirmPassword ? 'error' : ''}`}
                  value={account.confirmPassword}
                  onChange={(e) => updateAccountField('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && <p className="cp-field-error">{errors.confirmPassword}</p>}
              </div>

              <p className="fsp-note">
                Step {step + 1} of {STEPS.length}. Once your account is created, you&apos;ll be taken to your dashboard and can finish the remaining setup later.
              </p>

              <button type="button" className="cp-btn-primary" onClick={handleFirstStepContinue} disabled={accountLoading}>
                {accountLoading ? 'Creating account...' : 'Create account and go to dashboard'}
              </button>
            </div>
          )}

          {step === 1 && (
            <Step2PersonalDetails
              data={form}
              onChange={updateStringField}
              onBack={handleBack}
              onNext={() => setStep(2)}
              submitLabel="Continue to identity check →"
            />
          )}

          {step === 2 && (
            <Step3KYC
              data={form}
              onChange={(key, value) => updateFormField(key, value as ContractorOnboardingData[typeof key])}
              onBack={handleBack}
              onNext={() => setStep(3)}
              submitLabel="Continue to payment details →"
            />
          )}

          {step === 3 && (
            <Step4BankDetails
              data={form}
              onChange={updateStringField}
              onBack={handleBack}
              onNext={finishSignup}
              submitLabel="Finish signup and go to dashboard"
            />
          )}
        </div>
      </div>
    </div>
  );
}
