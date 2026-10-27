import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm, type FieldError, type UseFormRegisterReturn } from 'react-hook-form';
import './marketplace-project-consultation.css';
import { createMarketplaceOrderDraft, type MarketplaceCheckoutSelection } from '../api/marketplace.api';
import type { ApiError } from '../api/client';
import { getMyCompany } from '../api/company.api';
import UserMenu from '../components/common/UserMenu';
import SuccessModal from '../components/common/SuccessModal';

interface MarketplaceProjectConsultationPageProps {
  selection: MarketplaceCheckoutSelection | null;
  isAuthenticated: boolean;
  userName: string;
  onBack: () => void;
  onLogout: () => void;
  onNotifications: () => void;
  onLogin: () => void;
  embedded?: boolean;
  onSuccess?: () => void;
}

interface ConsultationFormValues {
  companyName: string;
  companyWebsite: string;
  projectType: string;
  budget: string;
  projectDescription: string;
}

const MIN_PROJECT_DESCRIPTION = 150;

const PROJECT_TYPE_OPTIONS = [
  'Web Development',
  'Mobile App',
  'UI/UX Design',
  'E-commerce',
  'Branding',
  'Maintenance & Support',
];

const BUDGET_OPTIONS = [
  '$100 - $500',
  '$500 - $1,500',
  '$1,500 - $3,000',
  '$3,000 - $5,000',
  '$5,000+',
];

function FieldErrorMessage({ error }: { error?: FieldError }) {
  if (!error?.message) return null;
  return <p className="mpc-field-error">{error.message}</p>;
}

function TextField({
  label,
  placeholder,
  registration,
  error,
  type = 'text',
  hideLabel = false,
}: {
  label: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  type?: string;
  hideLabel?: boolean;
}) {
  return (
    <label className="mpc-field">
      <span className={`mpc-label ${hideLabel ? 'mpc-label-placeholder' : ''}`}>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className={`mpc-input ${error ? 'mpc-input-error' : ''}`}
        {...registration}
      />
      <FieldErrorMessage error={error} />
    </label>
  );
}

function SelectField({
  label,
  registration,
  error,
  children,
}: {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  children: ReactNode;
}) {
  return (
    <label className="mpc-field">
      <span className="mpc-label">{label}</span>
      <div className="mpc-select-wrap">
        <select className={`mpc-input mpc-select ${error ? 'mpc-input-error' : ''}`} {...registration}>
          {children}
        </select>
        <span className="mpc-select-arrow">⌄</span>
      </div>
      <FieldErrorMessage error={error} />
    </label>
  );
}

export default function MarketplaceProjectConsultationPage({
  selection,
  isAuthenticated,
  userName,
  onBack,
  onLogout,
  onNotifications,
  onLogin,
  embedded = false,
  onSuccess,
}: MarketplaceProjectConsultationPageProps) {
  const [submitError, setSubmitError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ConsultationFormValues>({
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      companyWebsite: '',
      projectType: '',
      budget: '',
      projectDescription: '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    void getMyCompany()
      .then((data) => {
        if (cancelled) {
          return;
        }

        const company = (data?.company ?? {}) as Record<string, unknown>;
        const companyName = typeof company.companyName === 'string' ? company.companyName.trim() : '';
        const companyWebsite = typeof company.companyWebsite === 'string' ? company.companyWebsite.trim() : '';

        if (!companyName && !companyWebsite) {
          return;
        }

        reset((currentValues) => ({
          ...currentValues,
          companyName: currentValues.companyName || companyName,
          companyWebsite: currentValues.companyWebsite || companyWebsite,
        }));
      })
      .catch(() => {
        // Keep the consultation form usable even if company profile prefill fails.
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, reset]);

  const description = watch('projectDescription') ?? '';
  const charactersLeft = Math.max(0, MIN_PROJECT_DESCRIPTION - description.trim().length);
  const selectedPackageLabel = useMemo(() => {
    if (!selection) return '';
    return `${selection.package.name} package selected for ${selection.workerName}`;
  }, [selection]);

  const onSubmit = handleSubmit(async (values) => {
    if (!selection) return;
    if (!isAuthenticated) {
      setSubmitError('Please log in with your company account before booking a consultation.');
      return;
    }

    setSubmitError('');

    try {
      await createMarketplaceOrderDraft(selection.workerId, {
        packageSnapshot: selection.package,
        clientDetails: {
          companyName: values.companyName.trim(),
          companyWebsite: values.companyWebsite.trim(),
          projectType: values.projectType,
          budget: values.budget,
          projectDescription: values.projectDescription.trim(),
        },
      });

      // Persisted successfully — show success modal to user and then redirect to marketplace.
      setIsSubmitted(true);
      // Do NOT call onSubmitSuccess (which would navigate to payment). Instead show modal and redirect.
      setShowSuccessModal(true);
    } catch (err) {
      const apiError = err as ApiError;
      setSubmitError(apiError.message ?? 'We could not save your project draft. Please try again.');
    }
  });

  if (!selection) {
    return (
      <div className="mpc-root">
        <div className="mpc-empty">
          <h1>Consultation details unavailable</h1>
          <p>Please go back to the service page and select a package again before continuing.</p>
          <button type="button" onClick={onBack} className="mpc-empty-action">
            Back to service details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mpc-root">
      {!embedded ? <header className="mpc-topbar">
        <div className="mpc-topbar-inner">
          <button type="button" onClick={onBack} className="mpc-back">
            ← Back to service details
          </button>
          <div className="mpc-user">
            {isAuthenticated ? (
              <UserMenu userName={userName} onLogout={onLogout} onNotifications={onNotifications} />
            ) : (
              <>
                <span>Guest company</span>
                <button type="button" className="mpc-login-button" onClick={onLogin}>
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </header> : null}

      <main className="mpc-main">
        {embedded ? (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: 20,
            }}
          >
            <button
              type="button"
              onClick={onBack}
              className="mpc-back"
              style={{
                background: '#fff',
                border: '1px solid #dfe3e8',
                borderRadius: 12,
                minHeight: 42,
                padding: '0 16px',
                fontSize: 13,
                fontWeight: 700,
                color: '#111827',
                boxShadow: '0 10px 30px rgba(17, 24, 39, 0.06)',
              }}
            >
              ← Back to service details
            </button>
          </div>
        ) : null}
        <section className="mpc-shell">
          <div className="mpc-heading">
            <p className="mpc-helper">
              {selectedPackageLabel} <span>{selection.package.name} • {new Intl.NumberFormat('en-US', { style: 'currency', currency: selection.currency, maximumFractionDigits: 0 }).format(selection.package.price)}</span>
            </p>
            <h1 className="mpc-title">
              Book a Free <span>Consultation</span>
            </h1>
          </div>

          <form onSubmit={onSubmit} className="mpc-form" noValidate>
            <div className="mpc-grid">
              <TextField
                label="Company name *"
                placeholder="Acme Corporation"
                registration={register('companyName', {
                  required: 'Company name is required.',
                  minLength: { value: 2, message: 'Enter at least 2 characters.' },
                })}
                error={errors.companyName}
              />

              <TextField
                label="Company website URL *"
                placeholder="https://acme.com"
                type="url"
                registration={register('companyWebsite', {
                  required: 'Company website URL is required.',
                  pattern: {
                    value: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
                    message: 'Enter a valid website URL starting with http:// or https://',
                  },
                })}
                error={errors.companyWebsite}
              />

              <SelectField
                label="Project type *"
                registration={register('projectType', {
                  required: 'Project type is required.',
                })}
                error={errors.projectType}
              >
                <option value="">Please Select</option>
                {PROJECT_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Choose budget *"
                registration={register('budget', {
                  required: 'Budget is required.',
                })}
                error={errors.budget}
              >
                <option value="">Please Select</option>
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="mpc-textarea-block">
              <label className="mpc-field">
                <span className="mpc-label">Tell us about your project *</span>
                <textarea
                  placeholder="Example: We're interested in rebranding and redesigning our website, which includes new content and product descriptions and social media templates for different platforms."
                  className={`mpc-input mpc-textarea ${errors.projectDescription ? 'mpc-input-error' : ''}`}
                  {...register('projectDescription', {
                    required: 'Project description is required.',
                    validate: (value) =>
                      value.trim().length >= MIN_PROJECT_DESCRIPTION
                        ? true
                        : `Please enter at least ${MIN_PROJECT_DESCRIPTION} characters.`,
                  })}
                />
                <FieldErrorMessage error={errors.projectDescription} />
                <p className={`mpc-counter ${charactersLeft > 0 ? 'mpc-counter-error' : ''}`}>
                  {charactersLeft > 0
                    ? `Please enter at least ${MIN_PROJECT_DESCRIPTION} characters, ${charactersLeft} characters left.`
                    : `${description.trim().length} characters entered.`}
                </p>
              </label>
            </div>

            {submitError ? <div className="mpc-message mpc-message-error">{submitError}</div> : null}
            {isSubmitted ? <div className="mpc-message mpc-message-success">Talent request submitted successfully. Redirecting you to your request tracker...</div> : null}

            <div className="mpc-submit-row">
              <button type="submit" disabled={!isValid || isSubmitting || isSubmitted} className="mpc-submit">
                {isSubmitting ? 'Creating your draft...' : isSubmitted ? 'Draft created' : 'Kick Off Your Project'}
              </button>
            </div>

            <p className="mpc-footnote">
              By submitting this form you agree to Dechub&apos;s Terms of Service and acknowledge that you&apos;ve read our Privacy Policy.
            </p>
            <p className="mpc-footnote">
              Company name and website are saved only with this consultation request. Your signed-in company profile remains the permanent source of truth.
            </p>
            <p className="mpc-footnote">
              Your contact name, phone number, and email will be pulled from your signed-in company account.
            </p>
          </form>
        </section>
      </main>
      {showSuccessModal ? (
        <SuccessModal
          title="Thank You!"
          message={`Thank you for choosing this talent. Our team has received your request and will connect with you shortly to discuss your requirements and help you find the perfect match.`}
          onClose={() => {
            setShowSuccessModal(false);
            if (onSuccess) {
              onSuccess();
              return;
            }
            window.location.replace('/marketplace/requests');
          }}
        />
      ) : null}
    </div>
  );
}
