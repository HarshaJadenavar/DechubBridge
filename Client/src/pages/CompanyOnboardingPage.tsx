import { useEffect, useMemo, useState } from 'react';
import { register, redirectToGoogle } from '../api/auth.api';
import {
  getMyCompany,
  getSetupIntentClientSecret,
  pollKybStatus,
  saveBilling,
  saveBusinessDetails,
  saveIdentity,
  savePreferences,
  submitKyb as submitCompanyKyb,
  type MyCompanyData,
} from '../api/company.api';
import { tokenStore, type ApiError } from '../api/client';
import Step1Account from '../components/steps/Step1Account';
import Step2CompanyIdentity from '../components/steps/Step2CompanyIdentity';
import Step3BusinessDetails from '../components/steps/Step3BusinessDetails';
import Step4Kyb from '../components/steps/Step4Kyb';
import Step5Billing from '../components/steps/Step5Billing';
import Step6Preferences from '../components/steps/Step6Preferences';
import { initialData, initialDocs, stepConfig } from '../constants/signup';
import type { AppHandlers, AppState, Step } from '../types/signup';
import { validateEmail, validateStep } from '../utils/validators';

interface CompanyOnboardingPageProps {
  initialStep?: Step;
  hideProgress?: boolean;
  completeAfterStep1?: boolean;
  onBack: () => void;
  onComplete: () => void;
}

const COMPANY_DESTINATION_KEY = 'dechub_company_destination';

function LogoMark() {
  return (
    <div className="logo-mark">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) {
    return { score: 0, label: 'Add a password', color: '#94a3b8' };
  }

  let score = 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
  if (score === 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
  if (score === 3) return { score: 3, label: 'Good', color: '#2563eb' };
  return { score: 4, label: 'Strong', color: '#10b981' };
}

function mergeCompanyData(state: AppState, data: MyCompanyData): AppState {
  // Defensive checks for API response structure
  const user = data?.user ?? {};
  const company = (data?.company ?? {}) as Record<string, unknown>;

  return {
    ...state,
    formData: {
      ...state.formData,
      firstName: (typeof user.firstName === 'string' ? user.firstName : '') || state.formData.firstName,
      lastName: (typeof user.lastName === 'string' ? user.lastName : '') || state.formData.lastName,
      workEmail: (typeof user.email === 'string' ? user.email : '') || state.formData.workEmail,
      phone: (typeof user.phone === 'string' ? user.phone : '') || state.formData.phone,
      companyName: typeof company.companyName === 'string' ? company.companyName : state.formData.companyName,
      companyCountry: typeof company.companyCountry === 'string' ? company.companyCountry : state.formData.companyCountry,
      companyType: typeof company.companyType === 'string' ? company.companyType : state.formData.companyType,
      taxId: typeof company.taxId === 'string' ? company.taxId : state.formData.taxId,
      companySize: typeof company.companySize === 'string' ? company.companySize : state.formData.companySize,
      companyIndustry: typeof company.companyIndustry === 'string' ? company.companyIndustry : state.formData.companyIndustry,
      companyWebsite: typeof company.companyWebsite === 'string' ? company.companyWebsite : state.formData.companyWebsite,
      addressLine1: typeof company.addressLine1 === 'string' ? company.addressLine1 : state.formData.addressLine1,
      addressCity: typeof company.addressCity === 'string' ? company.addressCity : state.formData.addressCity,
      addressZip: typeof company.addressZip === 'string' ? company.addressZip : state.formData.addressZip,
      referralSource: typeof company.referralSource === 'string' ? company.referralSource : state.formData.referralSource,
      billCurrency: typeof company.billCurrency === 'string' ? company.billCurrency : state.formData.billCurrency,
      billingEmail: typeof company.billingEmail === 'string' ? company.billingEmail : state.formData.billingEmail,
      payCycle: typeof company.payCycle === 'string' ? company.payCycle : state.formData.payCycle,
      contractCurrency: typeof company.contractCurrency === 'string' ? company.contractCurrency : state.formData.contractCurrency,
      companyTimezone: typeof company.companyTimezone === 'string' ? company.companyTimezone : state.formData.companyTimezone,
      hrEmail: typeof company.hrEmail === 'string' ? company.hrEmail : state.formData.hrEmail,
      notif1: typeof company.notif1 === 'boolean' ? company.notif1 : state.formData.notif1,
      notif2: typeof company.notif2 === 'boolean' ? company.notif2 : state.formData.notif2,
      notif3: typeof company.notif3 === 'boolean' ? company.notif3 : state.formData.notif3,
      notif4: typeof company.notif4 === 'boolean' ? company.notif4 : state.formData.notif4,
    },
    kybStatus:
      company.kybStatus === 'approved' || company.kybStatus === 'rejected' || company.kybStatus === 'verifying'
        ? company.kybStatus
        : state.kybStatus,
  };
}

function getReadableApiMessage(apiError: ApiError, fallback: string): string {
  if (apiError.message && apiError.message !== 'Validation failed') {
    return apiError.message;
  }

  const firstFieldMessage = apiError.fields
    ? Object.values(apiError.fields).find((value) => typeof value === 'string' && value.trim().length > 0)
    : null;

  return firstFieldMessage ?? fallback;
}

export default function CompanyOnboardingPage({
  initialStep = 1,
  hideProgress = false,
  completeAfterStep1 = false,
  onBack,
  onComplete,
}: CompanyOnboardingPageProps) {
  const initialStrength = useMemo(() => getPasswordStrength(initialData.password), []);
  const [state, setState] = useState<AppState>({
    currentStep: initialStep,
    formData: initialData,
    errors: {},
    uploadedDocs: initialDocs,
    dragOver: {},
    kybStatus: 'pending',
    loadingAction: null,
    showPassword: false,
    passwordScore: initialStrength.score,
    passwordStrength: { label: initialStrength.label, color: initialStrength.color },
    cardBrand: '',
    serverError: null,
    kybUploadPct: 0,
    stripeClientSecret: null,
  });
  const [booting, setBooting] = useState(Boolean(tokenStore.getAccess()));

  useEffect(() => {
    if (!tokenStore.getAccess()) {
      if (initialStep > 1) onBack();
      return;
    }

    let cancelled = false;
    setBooting(true);

    void getMyCompany()
      .then((data) => {
        if (cancelled) return;
        setState((prev) => {
          const merged = mergeCompanyData(prev, data);

          // Check if onboarding is complete
          const signupStep = typeof data.user?.signupStep === 'number' ? data.user.signupStep : 1;
          if (signupStep >= 7) {
            onComplete();
            return merged;
          }

          // Always ensure currentStep matches the initialStep passed from App.tsx
          // Merging ensures form data is pre-populated from server
          return { ...merged, currentStep: initialStep || 1 };
        });
      })
      .catch((err) => {
        // API error - keep existing form data intact
        console.error('Failed to load company data:', err);
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialStep, onBack]);

  useEffect(() => {
    if (state.currentStep !== 5 || state.stripeClientSecret !== null || !tokenStore.getAccess()) {
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loadingAction: prev.loadingAction ?? 'setup-intent' }));

    void getSetupIntentClientSecret()
      .then((clientSecret) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          stripeClientSecret: clientSecret,
          loadingAction: prev.loadingAction === 'setup-intent' ? null : prev.loadingAction,
        }));
      })
      .catch(() => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          stripeClientSecret: null,
          loadingAction: prev.loadingAction === 'setup-intent' ? null : prev.loadingAction,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [state.currentStep, state.stripeClientSecret]);

  const handleInputChange: AppHandlers['handleInputChange'] = (key, value) => {
    setState((prev) => {
      const formData = { ...prev.formData, [key]: value };
      const errors = { ...prev.errors };
      delete errors[key as string];
      const strength = key === 'password'
        ? getPasswordStrength(String(value))
        : { score: prev.passwordScore, label: prev.passwordStrength.label, color: prev.passwordStrength.color };

      return {
        ...prev,
        formData,
        errors,
        serverError: null,
        passwordScore: strength.score,
        passwordStrength: { label: strength.label, color: strength.color },
      };
    });
  };

  const switchStep: AppHandlers['switchStep'] = (step) => {
    setState((prev) => ({ ...prev, currentStep: step, errors: {}, serverError: null, loadingAction: null }));
  };

  const goBack: AppHandlers['goBack'] = () => {
    // If resumed from previous session (initialStep > 1), don't go back to step 1
    if (initialStep > 1 && state.currentStep <= 2) {
      onBack();
      return;
    }
    const previousStep = (state.currentStep - 1) as Step;
    switchStep(previousStep);
  };

  const goToStep: AppHandlers['goToStep'] = async (step) => {
    if (step < state.currentStep) {
      switchStep(step);
      return;
    }

    const errors = validateStep(state.currentStep, state.formData, state.uploadedDocs);
    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, errors }));
      return;
    }

    try {
      if (state.currentStep === 1 && step === 2) {
        setState((prev) => ({ ...prev, loadingAction: 'step-2' }));

        if (tokenStore.getAccess() && initialStep > 1) {
          // Resume flow: account already exists, skip registration and continue.
          setState((prev) => ({
            ...prev,
            currentStep: 2,
            loadingAction: null,
            errors: {},
            serverError: null,
          }));
          return;
        }

        const normalizedPhone = state.formData.phone.trim();
        await register({
          firstName: state.formData.firstName.trim(),
          lastName: state.formData.lastName.trim(),
          workEmail: state.formData.workEmail.trim().toLowerCase(),
          password: state.formData.password,
          phone: normalizedPhone,
        });

        if (completeAfterStep1) {
          onComplete();
          return;
        }
      }

      if (state.currentStep === 2 && step === 3) {
        setState((prev) => ({ ...prev, loadingAction: 'step-3' }));
        await saveIdentity({
          companyName: state.formData.companyName.trim(),
          companyCountry: state.formData.companyCountry,
          companyType: state.formData.companyType,
          taxId: state.formData.taxId.trim(),
        });
      }

      if (state.currentStep === 3 && step === 4) {
        setState((prev) => ({ ...prev, loadingAction: 'step-4' }));
        await saveBusinessDetails({
          companySize: state.formData.companySize,
          companyIndustry: state.formData.companyIndustry,
          companyWebsite: state.formData.companyWebsite.trim(),
          addressLine1: state.formData.addressLine1.trim(),
          addressCity: state.formData.addressCity.trim(),
          addressZip: state.formData.addressZip.trim(),
          referralSource: state.formData.referralSource.trim(),
        });
      }

      if (state.currentStep === 5 && step === 6) {
        setState((prev) => ({ ...prev, loadingAction: 'step-6' }));
        // Always use a valid billing email (fallback to workEmail if needed)
        let billingEmail = state.formData.billingEmail?.trim() || state.formData.workEmail?.trim();
        // If we still don't have an email, try fetching company data (may have been delayed)
        if (!billingEmail && tokenStore.getAccess()) {
          try {
            const data = await getMyCompany();
            billingEmail = (data?.user?.email as string) || billingEmail;
            if (billingEmail) {
              setState((prev) => ({ ...prev, formData: { ...prev.formData, workEmail: billingEmail } }));
            }
          } catch (e) {
            // ignore - we'll let server validation surface if still missing
          }
        }
        // Use dummy payment if no payment method selected yet
        const paymentMethodId = state.formData.stripePaymentMethodId || 'pm_mvp_dummy';
        await saveBilling({
          billCurrency: state.formData.billCurrency,
          billingEmail,
          paymentMethodId,
        });
      }

      setState((prev) => ({
        ...prev,
        currentStep: step,
        errors: {},
        loadingAction: null,
        serverError: null,
      }));
    } catch (err) {
      const apiError = err as ApiError;
      setState((prev) => ({
        ...prev,
        loadingAction: null,
        serverError: getReadableApiMessage(apiError, 'Something went wrong. Please try again.'),
        errors: apiError.fields ? { ...prev.errors, ...apiError.fields } : prev.errors,
      }));
    }
  };

  const submitKyb: AppHandlers['submitKyb'] = async () => {
    const errors = validateStep(4, state.formData, state.uploadedDocs);
    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, errors }));
      return;
    }

    setState((prev) => ({ ...prev, loadingAction: 'kyb', kybUploadPct: 0, serverError: null }));

    try {
      const result = await submitCompanyKyb(
        {
          doc1: state.uploadedDocs.doc1?.file ?? null,
          doc2: state.uploadedDocs.doc2?.file ?? null,
          doc3: state.uploadedDocs.doc3?.file ?? null,
          doc4: state.uploadedDocs.doc4?.file ?? null,
        },
        (pct) => {
          setState((prev) => ({ ...prev, kybUploadPct: pct }));
        },
      );

      setState((prev) => ({ ...prev, kybStatus: result.kybStatus }));

      const finalStatus = await pollKybStatus((status) => {
        if (status === 'approved' || status === 'rejected' || status === 'verifying') {
          setState((prev) => ({ ...prev, kybStatus: status }));
        }
      });

      setState((prev) => ({ ...prev, kybStatus: finalStatus, loadingAction: null }));
    } catch (err) {
      const apiError = err as ApiError;
      setState((prev) => ({
        ...prev,
        loadingAction: null,
        serverError: getReadableApiMessage(apiError, 'Failed to verify business documents.'),
      }));
    }
  };

  const goBillingAfterKyb: AppHandlers['goBillingAfterKyb'] = async () => {
    switchStep(5);
  };

  const completeSignup: AppHandlers['completeSignup'] = async () => {
    const errors = validateStep(6, state.formData, state.uploadedDocs);
    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, errors }));
      return;
    }

    setState((prev) => ({ ...prev, loadingAction: 'complete', serverError: null }));

    try {
      await savePreferences({
        payCycle: state.formData.payCycle,
        contractCurrency: state.formData.contractCurrency,
        companyTimezone: state.formData.companyTimezone,
        hrEmail: state.formData.hrEmail.trim(),
        notif1: state.formData.notif1,
        notif2: state.formData.notif2,
        notif3: state.formData.notif3,
        notif4: state.formData.notif4,
      });
      onComplete();
    } catch (err) {
      const apiError = err as ApiError;
      setState((prev) => ({
        ...prev,
        loadingAction: null,
        serverError: getReadableApiMessage(apiError, 'Could not complete setup.'),
        errors: apiError.fields ? { ...prev.errors, ...apiError.fields } : prev.errors,
      }));
    }
  };

  const handlers: AppHandlers = {
    handleInputChange,
    goToStep,
    switchStep,
    submitKyb,
    goBillingAfterKyb,
    completeSignup,
    goBack,
    handleFileInput: (docKey) => (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setState((prev) => ({
        ...prev,
        uploadedDocs: { ...prev.uploadedDocs, [docKey]: { file, uploaded: true } },
        errors: { ...prev.errors, [docKey]: '' },
      }));
    },
    onDragOver: (docKey) => (e) => {
      e.preventDefault();
      setState((prev) => ({ ...prev, dragOver: { ...prev.dragOver, [docKey]: true } }));
    },
    onDragLeave: (docKey) => () => {
      setState((prev) => ({ ...prev, dragOver: { ...prev.dragOver, [docKey]: false } }));
    },
    onDrop: (docKey) => (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      setState((prev) => ({
        ...prev,
        dragOver: { ...prev.dragOver, [docKey]: false },
        uploadedDocs: { ...prev.uploadedDocs, [docKey]: { file, uploaded: true } },
        errors: { ...prev.errors, [docKey]: '' },
      }));
    },
    setShowPassword: (updater) => {
      setState((prev) => ({
        ...prev,
        showPassword: typeof updater === 'function' ? updater(prev.showPassword) : updater,
      }));
    },
    validateEmail,
    googleSignup: () => {
      sessionStorage.setItem(COMPANY_DESTINATION_KEY, 'dashboard');
      redirectToGoogle('signup');
    },
    goToLogin: onBack,
    goToDashboard: onComplete,
  };

  // Debug logging
  console.log('CompanyOnboardingPage render', {
    currentStep: state.currentStep,
    hasFormData: !!state.formData,
    hasUploadedDocs: !!state.uploadedDocs,
    booting,
  });

  // Guard against invalid state BEFORE rendering any steps
  if (!state.formData || !state.uploadedDocs) {
    return (
      <div className="app-shell">
        <div className="app">
          <main className="right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <section className="card screen active">
              <div className="card-icon bg-blue">⚠️</div>
              <h2 className="card-title">Session Error</h2>
              <p className="card-sub">Your session data is invalid. Please start over.</p>
              <button onClick={onBack} style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer' }}>Go Back</button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const stepContent = state.currentStep === 1
    ? <Step1Account state={state} handlers={handlers} />
    : state.currentStep === 2
    ? <Step2CompanyIdentity state={state} handlers={handlers} initialStep={initialStep} completeAfterStep1={completeAfterStep1} />
    : state.currentStep === 3
    ? <Step3BusinessDetails state={state} handlers={handlers} />
    : state.currentStep === 4
    ? <Step4Kyb state={state} handlers={handlers} />
    : state.currentStep === 5
    ? <Step5Billing state={state} handlers={handlers} />
    : <Step6Preferences state={state} handlers={handlers} />;

  const progress = stepConfig[state.currentStep as Exclude<Step, 7>];

  return (
    <div className="app-shell">
      <div className="app">
        <aside className="left">
          <div className="logo">
            <LogoMark />
            <span className="logo-name">Dechub</span>
          </div>

          <div className="left-hero">
            <h1 className="left-title">
              Finish your <span>company setup</span> and unlock the dashboard.
            </h1>
            <p className="left-sub">
              This guided setup prepares identity, compliance, billing, and HR defaults so your
              team can start hiring without friction.
            </p>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon fi-green">1</div>
                <div className="feature-text">
                  <h4>Identity and business details</h4>
                  <p>Capture the legal data Dechub needs for contracts and compliance.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon fi-blue">2</div>
                <div className="feature-text">
                  <h4>Verification and billing</h4>
                  <p>Complete KYB and payment setup once so future hiring moves faster.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon fi-purple">3</div>
                <div className="feature-text">
                  <h4>Dashboard-ready workspace</h4>
                  <p>As soon as setup is complete, you will land inside the company dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="right">
          {!(hideProgress && state.currentStep === 1) ? (
            <div className="progress-wrap">
              <div className="progress-top">
                {!( (initialStep > 1 || completeAfterStep1) && state.currentStep === 2 ) ? (
                  <button className="rsp-back" onClick={onBack}>Back</button>
                ) : null}
              </div>
              <div className="progress-label">{progress?.label ?? 'Company setup'}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress?.pct ?? 0}%` }} />
              </div>
            </div>
          ) : null}

          {state.serverError ? (
            <div style={{
              width: '100%',
              maxWidth: 540,
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#b91c1c',
              fontSize: 13,
            }}>
              {state.serverError}
            </div>
          ) : null}

          {booting ? (
            <section className="card screen active">
              <div className="card-icon bg-blue">⏳</div>
              <h2 className="card-title">Loading your setup</h2>
              <p className="card-sub">
                Restoring your company onboarding progress so you can continue from the right step.
              </p>
            </section>
          ) : stepContent}
        </main>
      </div>
    </div>
  );
}
