import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ContractorContract,
  ContractorInvoice,
  ContractorNotification,
  ContractorPage,
  ContractorProfile,
  InvoiceStatus,
  SubmitInvoicePayload,
} from './types/contractor.types';
import {
  contractorTokenStore,
  getContractorNotifications,
  getContractorProfile,
  getMyContract,
  getMyInvoices,
  markContractorNotificationRead,
  submitInvoice,
  updateContractorProfile,
  uploadContractorProfileImage,
} from './api/contractor.api';
import { imageBackground, resolveImageUrl } from '../utils/imageUrl';
import ProjectTasksPage from './ProjectTasksPage';

interface ContractorDashboardProps {
  previewProfile?: ContractorProfile | null;
  onLogoutOverride?: () => void;
  initialPage?: ContractorPage;
  flashMessage?: string;
}

function getContractorPageFromQuery(initialPage: ContractorPage): ContractorPage {
  const tab = new URLSearchParams(window.location.search).get('tab')?.trim() ?? '';

  if (tab === 'contract') return 'contract';
  if (tab === 'projects') return 'projects';
  if (tab === 'invoices') return 'invoices';
  if (tab === 'profile') return 'profile';
  if (tab === 'notifications') return 'notifications';
  if (tab === 'dashboard') return 'dashboard';

  return initialPage;
}

const INVOICE_BADGE: Record<InvoiceStatus, { cls: string; label: string }> = {
  draft: { cls: 'inv-badge inv-badge-draft', label: 'Draft' },
  submitted: { cls: 'inv-badge inv-badge-submitted', label: 'Submitted' },
  approved: { cls: 'inv-badge inv-badge-approved', label: 'Approved' },
  paid: { cls: 'inv-badge inv-badge-paid', label: 'Paid' },
  disputed: { cls: 'inv-badge inv-badge-disputed', label: 'Disputed' },
};

const MARKETPLACE_AVAILABILITY_OPTIONS = [
  { value: 'available_now', label: 'Available now' },
  { value: 'this_week', label: 'Available this week' },
  { value: 'two_weeks', label: '2 weeks notice' },
  { value: 'next_month', label: 'Available next month' },
  { value: 'not_available', label: 'Not available' },
] as const;

const SKILL_SUGGESTIONS: string[] = [];

const DEFAULT_MARKETPLACE_TITLE = 'Freelancer';
const DEFAULT_MARKETPLACE_SUMMARIES = new Set([
  'Tell companies about your strongest skills and the kind of freelance work you want.',
  'Experienced freelancer available for contract work.',
  'Self-signup freelancer profile',
]);

const DEFAULT_PACKAGE_PRESETS: ContractorProfile['servicePackages'] = [
  {
    name: 'Basics',
    price: 0,
    description: 'Share a simple starter package for companies browsing your profile.',
    deliveryDays: 5,
    revisions: 1,
    features: ['Scope outline', 'Starter delivery'],
  },
  {
    name: 'Standard',
    price: 0,
    description: 'Describe your most common package and what clients typically receive.',
    deliveryDays: 7,
    revisions: 2,
    features: ['Expanded scope', 'Progress updates'],
  },
  {
    name: 'Premium',
    price: 0,
    description: 'Use this for your most complete offer with your best turnaround.',
    deliveryDays: 14,
    revisions: 3,
    features: ['Full delivery', 'Priority collaboration'],
  },
];

function inferOnboardingStepFromProfile(profile: Partial<ContractorProfile>): number {
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

function FileUploadControl({
  value,
  accept = 'image/*',
  onFile,
  buttonLabel = 'Choose file',
  placeholder = 'No file chosen',
}: {
  value: string;
  accept?: string;
  onFile: (file: File) => void;
  buttonLabel?: string;
  placeholder?: string;
}) {
  const displayText = value
    ? value.startsWith('http')
        ? value.replace(/^https?:\/\/(www\.)?/, '')
        : value
    : placeholder;

  return (
    <label className="cp-file-picker">
      <div className="cp-file-picker-main">
        <input
          type="file"
          accept={accept}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            onFile(file);
            event.currentTarget.value = '';
          }}
        />
        <span className="cp-file-picker-button">{buttonLabel}</span>
        <span className="cp-file-picker-filename">{displayText}</span>
      </div>
    </label>
  );
}

function normalizeContractorProfile(profile: Partial<ContractorProfile>): ContractorProfile {
  const availabilityOption = MARKETPLACE_AVAILABILITY_OPTIONS.find(
    (option) => option.value === profile.marketplaceAvailability,
  );
  const inferredOnboardingStep = inferOnboardingStepFromProfile(profile);

  return {
    workerId: profile.workerId ?? '',
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
    roleTitle: profile.roleTitle ?? '',
    companyName: profile.companyName ?? '',
    status: profile.status ?? '',
    kycStatus: profile.kycStatus ?? '',
    payRate: typeof profile.payRate === 'number' ? profile.payRate : 0,
    payCurrency: profile.payCurrency ?? 'USD',
    payFrequency: profile.payFrequency ?? 'monthly',
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    marketplaceTitle: profile.marketplaceTitle ?? DEFAULT_MARKETPLACE_TITLE,
    marketplaceBio: profile.marketplaceBio ?? '',
    marketplaceAvailability: availabilityOption ? availabilityOption.value : 'available_now',
    marketplaceAvailabilityLabel: profile.marketplaceAvailabilityLabel ?? (availabilityOption?.label ?? 'Available now'),
    marketplaceRate: typeof profile.marketplaceRate === 'number' ? profile.marketplaceRate : 0,
    city: profile.city ?? '',
    country: profile.country ?? '',
    responseTimeHours: typeof profile.responseTimeHours === 'number' ? profile.responseTimeHours : 2,
    languages: Array.isArray(profile.languages) ? profile.languages : [],
    profilePhotoUrl: profile.profilePhotoUrl ?? '',
    bannerImageUrl: profile.bannerImageUrl ?? '',
    profileOverview: profile.profileOverview ?? '',
    portfolioProjects: Array.isArray(profile.portfolioProjects)
      ? profile.portfolioProjects.map((project) => ({
          title: project.title ?? '',
          description: project.description ?? '',
          imageUrl: project.imageUrl ?? '',
          projectLink: project.projectLink ?? '',
          tags: Array.isArray(project.tags) ? project.tags : [],
        }))
      : [],
    servicePackages: Array.isArray(profile.servicePackages)
      ? profile.servicePackages.map((pkg) => ({
          name: pkg.name ?? '',
          price: typeof pkg.price === 'number' ? pkg.price : 0,
          description: pkg.description ?? '',
          deliveryDays: typeof pkg.deliveryDays === 'number' ? pkg.deliveryDays : 0,
          revisions: typeof pkg.revisions === 'number' ? pkg.revisions : 0,
          features: Array.isArray(pkg.features) ? pkg.features : [],
        }))
      : DEFAULT_PACKAGE_PRESETS,
    faqItems: Array.isArray(profile.faqItems)
      ? profile.faqItems.map((item) => ({ question: item.question ?? '', answer: item.answer ?? '' }))
      : [],
    onboardingStep:
      typeof profile.onboardingStep === 'number' && profile.onboardingStep > 0
        ? profile.onboardingStep
        : inferredOnboardingStep,
    dateOfBirth: profile.dateOfBirth ?? '',
    nationality: profile.nationality ?? '',
    addressLine1: profile.addressLine1 ?? '',
    addressLine2: profile.addressLine2 ?? '',
    state: profile.state ?? '',
    postalCode: profile.postalCode ?? '',
    taxId: profile.taxId ?? '',
    idType: profile.idType ?? '',
    idNumber: profile.idNumber ?? '',
    paymentMethod: profile.paymentMethod ?? '',
    wiseEmail: profile.wiseEmail ?? '',
    bankName: profile.bankName ?? '',
    accountNumber: profile.accountNumber ?? '',
    routingNumber: profile.routingNumber ?? '',
    swiftCode: profile.swiftCode ?? '',
    paypalEmail: profile.paypalEmail ?? '',
  };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f4f9', fontSize: 13.5, gap: 18 }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function SubmitInvoiceModal({
  profile,
  onClose,
  onSuccess,
}: {
  profile: ContractorProfile;
  onClose: () => void;
  onSuccess: (invoice: ContractorInvoice) => void;
}) {
  const [form, setForm] = useState<SubmitInvoicePayload>({
    periodStart: '',
    periodEnd: '',
    amountGross: profile.payRate ?? 0,
    description: `Monthly contractor services - ${profile.roleTitle}`,
    hoursWorked: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isHourly = profile.payFrequency === 'hourly';

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.periodStart) next.periodStart = 'Required';
    if (!form.periodEnd) next.periodEnd = 'Required';
    if (form.periodEnd && form.periodStart && form.periodEnd < form.periodStart) {
      next.periodEnd = 'End must be after start';
    }
    if (!form.amountGross || form.amountGross <= 0) next.amountGross = 'Enter a valid amount';
    if (!form.description.trim()) next.description = 'Required';
    if (isHourly && !form.hoursWorked) next.hoursWorked = 'Required for hourly contracts';
    return next;
  };

  const handleSubmit = async () => {
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setErrors({});
    setError(null);
    setLoading(true);
    try {
      const invoice = await submitInvoice(form);
      onSuccess(invoice);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to submit invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cp-modal">
        <div className="cp-modal-header">
          <div>
            <div className="cp-modal-title">Submit Invoice</div>
            <div className="cp-modal-sub">
              {profile.payCurrency} {profile.payRate?.toLocaleString()} / {profile.payFrequency}
            </div>
          </div>
          <button className="cp-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cp-modal-body">
          {error && <div className="cp-error">Warning: {error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div className="cp-field">
              <label className="cp-label">Period start <span className="cp-req">*</span></label>
              <input
                type="date"
                className={`cp-input ${errors.periodStart ? 'error' : ''}`}
                value={form.periodStart}
                onChange={(e) => setForm((prev) => ({ ...prev, periodStart: e.target.value }))}
              />
              {errors.periodStart && <p className="cp-field-error">{errors.periodStart}</p>}
            </div>
            <div className="cp-field">
              <label className="cp-label">Period end <span className="cp-req">*</span></label>
              <input
                type="date"
                className={`cp-input ${errors.periodEnd ? 'error' : ''}`}
                value={form.periodEnd}
                onChange={(e) => setForm((prev) => ({ ...prev, periodEnd: e.target.value }))}
              />
              {errors.periodEnd && <p className="cp-field-error">{errors.periodEnd}</p>}
            </div>
          </div>

          {isHourly && (
            <div className="cp-field">
              <label className="cp-label">Hours worked <span className="cp-req">*</span></label>
              <input
                type="number"
                className={`cp-input ${errors.hoursWorked ? 'error' : ''}`}
                value={form.hoursWorked ?? ''}
                onChange={(e) => {
                  const hours = Number(e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    hoursWorked: hours,
                    amountGross: hours * (profile.payRate ?? 0),
                  }));
                }}
              />
              {errors.hoursWorked && <p className="cp-field-error">{errors.hoursWorked}</p>}
            </div>
          )}

          <div className="cp-field">
            <label className="cp-label">Invoice amount ({profile.payCurrency}) <span className="cp-req">*</span></label>
            <input
              type="number"
              className={`cp-input ${errors.amountGross ? 'error' : ''}`}
              value={form.amountGross}
              readOnly={isHourly}
              onChange={(e) => setForm((prev) => ({ ...prev, amountGross: Number(e.target.value) }))}
            />
            {errors.amountGross && <p className="cp-field-error">{errors.amountGross}</p>}
          </div>

          <div className="cp-field">
            <label className="cp-label">Description <span className="cp-req">*</span></label>
            <textarea
              className={`cp-textarea ${errors.description ? 'error' : ''}`}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              style={{ height: 80 }}
            />
            {errors.description && <p className="cp-field-error">{errors.description}</p>}
          </div>
        </div>

        <div className="cp-modal-footer">
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: 44,
              background: '#fff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              color: '#475569',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cp-btn-primary"
            style={{ flex: 2, height: 44, borderRadius: 10 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardHome({
  profile,
  invoices,
  onSubmitInvoice,
  onNavigate,
}: {
  profile: ContractorProfile;
  invoices: ContractorInvoice[];
  onSubmitInvoice: () => void;
  onNavigate: (page: ContractorPage) => void;
}) {
  const totalPaid = invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amountGross, 0);
  const totalPending = invoices.filter((invoice) => invoice.status === 'submitted').reduce((sum, invoice) => sum + invoice.amountGross, 0);
  const nextPayment = invoices.find((invoice) => invoice.status === 'approved');
  const recentInvoices = invoices.slice(0, 4);
  const isSetupIncomplete = profile.onboardingStep > 0 && profile.onboardingStep < 4;
  const completedSteps = Math.max(1, Math.min(profile.onboardingStep, 4));
  const progressPercent = Math.round((completedSteps / 4) * 100);

  return (
    <div className="cd-page">
      <div className="cd-page-title">Welcome back, {profile.firstName}</div>
      <div className="cd-page-sub">{profile.roleTitle} at {profile.companyName}</div>

      {isSetupIncomplete ? (
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #dbe4f0',
            borderRadius: 24,
            padding: '26px 28px',
            marginBottom: 22,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.05)',
          }}
          aria-label="Complete freelancer setup"
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4f46e5', marginBottom: 10 }}>
              Complete freelancer setup
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 34, lineHeight: 1.08, letterSpacing: '-0.04em', color: '#0f172a' }}>
              Your dashboard is ready. Finish setup whenever you&apos;re ready.
            </h2>
            <p style={{ margin: '0 0 14px', maxWidth: 760, fontSize: 15, lineHeight: 1.7, color: '#64748b' }}>
              You can explore the dashboard now and complete your personal details, identity check, and payment details later.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, fontSize: 13.5, fontWeight: 600, color: '#334155' }}>
              <span>{completedSteps}/4 setup steps completed</span>
              <span>{progressPercent}% done</span>
            </div>
            <div style={{ height: 10, background: '#e5edff', borderRadius: 999, overflow: 'hidden', maxWidth: 480 }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #14b8a6)', borderRadius: 999 }} />
            </div>
          </div>

          <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
            <button
              type="button"
              className="cp-btn-primary"
              style={{ width: '100%' }}
              onClick={() => {
                window.location.href = '/freelancer/signup?resume=1';
              }}
            >
              Complete freelancer setup
            </button>
            <button
              type="button"
              className="cp-btn-secondary"
              style={{ width: '100%' }}
              onClick={() => onNavigate('dashboard')}
            >
              Keep exploring dashboard
            </button>
          </div>
        </section>
      ) : null}

      <div className="cd-stats">
        <div className="cd-stat">
          <div className="cd-stat-label">Pay rate</div>
          <div className="cd-stat-value" style={{ fontSize: 20 }}>{profile.payCurrency} {profile.payRate?.toLocaleString()}</div>
          <div className="cd-stat-hint">per {profile.payFrequency}</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-label">Total earned</div>
          <div className="cd-stat-value">{profile.payCurrency} {totalPaid.toLocaleString()}</div>
          <div className="cd-stat-hint">All paid invoices</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-label">Pending approval</div>
          <div className="cd-stat-value">{profile.payCurrency} {totalPending.toLocaleString()}</div>
          <div className="cd-stat-hint">{invoices.filter((invoice) => invoice.status === 'submitted').length} invoice(s)</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-label">Next payment</div>
          <div className="cd-stat-value" style={{ fontSize: 18 }}>
            {nextPayment ? `${profile.payCurrency} ${nextPayment.amountGross.toLocaleString()}` : '-'}
          </div>
          <div className="cd-stat-hint">{nextPayment ? 'Processing after approval' : 'No approved invoices'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div className="cd-card">
          <div className="cd-card-header">
            <span className="cd-card-title">Recent Invoices</span>
            <button
              className="db-card-link"
              onClick={() => onNavigate('invoices')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}
            >
              View all →
            </button>
          </div>

          {recentInvoices.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>No invoices yet</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Submit your first invoice to get paid.</div>
              <button className="cp-btn-primary" style={{ width: 'auto', padding: '0 24px' }} onClick={onSubmitInvoice}>
                Submit Invoice
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Invoice #', 'Period', 'Amount', 'Status'].map((heading) => (
                      <th key={heading} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f8fafc', borderBottom: '1px solid #e8ecf2' }}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice._id} style={{ borderBottom: '1px solid #f1f4f9' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{invoice.invoiceNumber}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12.5, color: '#64748b' }}>
                        {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{invoice.currency} {invoice.amountGross.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={INVOICE_BADGE[invoice.status].cls}>{INVOICE_BADGE[invoice.status].label}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <div style={{ background: 'linear-gradient(135deg, #0a1628, #162d54)', borderRadius: 14, padding: '22px 22px', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Submit this month&apos;s invoice</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 16 }}>
              Submit by the last day of the month for on-time payment.
            </div>
            <button
              type="button"
              onClick={onSubmitInvoice}
              style={{
                width: '100%',
                height: 40,
                background: '#00c9a7',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Submit Invoice
            </button>
          </div>

          <div className="cd-card">
            <div className="cd-card-header">
              <span className="cd-card-title">Contract Status</span>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <DetailRow label="KYC" value={profile.kycStatus === 'approved' ? 'Verified' : 'Pending'} />
              <DetailRow label="Account" value={profile.status === 'active' ? 'Active' : profile.status} />
              <DetailRow
                label="Skills"
                value={Array.isArray(profile.skills) && profile.skills.length ? `${profile.skills.length} added` : 'No skills yet'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillsPage({
  profile,
  onSave,
}: {
  profile: ContractorProfile;
  onSave: (skills: string[]) => Promise<void>;
}) {
  const [draftSkills, setDraftSkills] = useState<string[]>(profile.skills ?? []);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setDraftSkills(profile.skills ?? []);
  }, [profile.skills]);

  const availableSuggestions = useMemo(
    () => SKILL_SUGGESTIONS.filter((skill) => !draftSkills.some((item) => item.toLowerCase() === skill.toLowerCase())),
    [draftSkills],
  );

  const persistSkills = async (nextSkills: string[], successMessage: string) => {
    setDraftSkills(nextSkills);
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await onSave(nextSkills);
      setMessage(successMessage);
    } catch (err) {
      setDraftSkills(profile.skills ?? []);
      setError((err as Error).message ?? 'Failed to update skills.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (draftSkills.some((skill) => skill.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkill('');
      return;
    }

    const nextSkills = [...draftSkills, trimmed];
    setNewSkill('');
    await persistSkills(nextSkills, `"${trimmed}" added and saved.`);
  };

  const removeSkill = async (skillToRemove: string) => {
    const nextSkills = draftSkills.filter((skill) => skill !== skillToRemove);
    await persistSkills(nextSkills, `"${skillToRemove}" removed and saved.`);
  };

  const handleSave = async () => {
    await persistSkills(draftSkills, 'Skills updated successfully.');
  };

  return (
    <div className="cd-page">
      <div className="cd-page-title">Skills</div>
      <div className="cd-page-sub">Add and update the skills you want shown on your contractor profile.</div>

      <div className="cd-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
          <input
            className="cp-input"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void addSkill(newSkill);
              }
            }}
            placeholder="Add a skill like React, Node.js, UI Design"
            style={{ flex: 1 }}
          />
          <button type="button" className="cp-btn-primary" style={{ width: 'auto', padding: '0 20px' }} onClick={() => void addSkill(newSkill)} disabled={saving}>
            Add skill
          </button>
        </div>

        {draftSkills.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {draftSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => void removeSkill(skill)}
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#0f172a',
                  borderRadius: 999,
                  padding: '9px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {skill} ×
              </button>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: 24, fontSize: 13, color: '#94a3b8' }}>
            No skills added yet. Start by adding the strengths you want shown on your profile.
          </div>
        )}

        <div style={{ marginBottom: 14, fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Suggested skills
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {availableSuggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => void addSkill(skill)}
              style={{
                border: '1px dashed #93c5fd',
                background: '#eff6ff',
                color: '#1d4ed8',
                borderRadius: 999,
                padding: '8px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              + {skill}
            </button>
          ))}
        </div>

        {message && <div style={{ marginBottom: 14, color: '#15803d', fontSize: 13, fontWeight: 600 }}>{message}</div>}
        {error && <div style={{ marginBottom: 14, color: '#dc2626', fontSize: 13, fontWeight: 600 }}>{error}</div>}

        <button type="button" className="cp-btn-primary" style={{ width: 'auto', padding: '0 24px' }} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save skills'}
        </button>
      </div>
    </div>
  );
}

void SkillsPage;

function InvoicesPage({
  invoices,
  onSubmit,
  readOnly,
}: {
  invoices: ContractorInvoice[];
  onSubmit: () => void;
  readOnly: boolean;
}) {
  return (
    <div className="cd-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div className="cd-page-title">My Invoices</div>
          <div className="cd-page-sub">{invoices.length} total</div>
        </div>
        {!readOnly && (
          <button className="cp-btn-primary" style={{ width: 'auto', padding: '0 20px', height: 42 }} onClick={onSubmit}>
            Submit Invoice
          </button>
        )}
      </div>

      <div className="cd-card">
        {invoices.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', color: '#94a3b8' }}>
            No invoices yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Invoice #', 'Period', 'Description', 'Amount', 'Status'].map((heading) => (
                  <th key={heading} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f8fafc', borderBottom: '1px solid #e8ecf2' }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id} style={{ borderBottom: '1px solid #f1f4f9' }}>
                  <td style={{ padding: '13px 16px', fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{invoice.invoiceNumber}</td>
                  <td style={{ padding: '13px 16px', fontSize: 12.5, color: '#64748b' }}>{new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#475569' }}>{invoice.description}</td>
                  <td style={{ padding: '13px 16px', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{invoice.currency} {invoice.amountGross.toLocaleString()}</td>
                  <td style={{ padding: '13px 16px' }}><span className={INVOICE_BADGE[invoice.status].cls}>{INVOICE_BADGE[invoice.status].label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ContractPage({ profile, readOnly }: { profile: ContractorProfile; readOnly: boolean }) {
  const [contract, setContract] = useState<ContractorContract | null>(null);
  const [loading, setLoading] = useState(!readOnly);

  useEffect(() => {
    if (readOnly) {
      setLoading(false);
      return;
    }

    getMyContract()
      .then((data) => {
        setContract(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [readOnly]);

  return (
    <div className="cd-page">
      <div className="cd-page-title">My Contract</div>
      <div className="cd-page-sub">Review the current status of your agreement with {profile.companyName}</div>

      {readOnly ? (
        <div className="cd-card" style={{ padding: 32, color: '#64748b' }}>
          Contract preview is not available in self-signup mode yet.
        </div>
      ) : loading ? (
        <div className="cd-card" style={{ padding: 32, color: '#64748b' }}>Loading contract...</div>
      ) : !contract ? (
        <div className="cd-card" style={{ padding: 32, color: '#64748b' }}>Contract not found.</div>
      ) : (
        <div className="cd-card" style={{ padding: '24px 28px' }}>
          <DetailRow label="Role" value={contract.roleTitle} />
          <DetailRow label="Company" value={contract.companyName} />
          <DetailRow label="Pay rate" value={`${contract.payCurrency} ${contract.payRate?.toLocaleString()} / ${contract.payFrequency}`} />
          <DetailRow
            label="Status"
            value={
              contract.status === 'worker_signed'
                ? 'Pending company signature'
                : contract.status === 'company_signed'
                ? 'Pending your signature'
                : contract.status === 'active'
                ? 'Active'
                : contract.status === 'rejected'
                ? 'Rejected'
                : contract.status.replace(/_/g, ' ')
            }
          />
          <DetailRow label="Worker signature" value={contract.workerSigned ? 'Signed' : 'Pending'} />
          <DetailRow label="Company signature" value={contract.companySigned ? 'Signed' : 'Pending'} />
        </div>
      )}
    </div>
  );
}

function ProfilePage({
  profile,
  readOnly,
  onSave,
}: {
  profile: ContractorProfile;
  readOnly: boolean;
  onSave: (payload: {
    firstName: string;
    lastName: string;
    marketplaceTitle: string;
    marketplaceBio: string;
    marketplaceAvailability: ContractorProfile['marketplaceAvailability'];
    marketplaceRate: number;
    city: string;
    country: string;
    responseTimeHours: number;
    skills: string[];
    languages: string[];
    profilePhotoUrl?: string;
    bannerImageUrl?: string;
    profileOverview: string;
    portfolioProjects: ContractorProfile['portfolioProjects'];
    servicePackages: ContractorProfile['servicePackages'];
    faqItems: ContractorProfile['faqItems'];
  }) => Promise<void>;
}) {
  const buildFormState = useCallback(() => ({
    firstName: profile.firstName,
    lastName: profile.lastName,
    marketplaceTitle: profile.marketplaceTitle,
    marketplaceBio: profile.marketplaceBio,
    marketplaceAvailability: profile.marketplaceAvailability,
    marketplaceRate: String(profile.marketplaceRate ?? 0),
    city: profile.city,
    country: profile.country,
    responseTimeHours: String(profile.responseTimeHours ?? 2),
    skillsInput: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
    languagesInput: Array.isArray(profile.languages) ? profile.languages.join(', ') : '',
    profilePhotoUrl: profile.profilePhotoUrl ?? '',
    bannerImageUrl: profile.bannerImageUrl ?? '',
    profileOverview: profile.profileOverview,
    portfolioProjects: Array.isArray(profile.portfolioProjects) ? profile.portfolioProjects.map((project) => ({
      title: project.title ?? '',
      description: project.description ?? '',
      imageUrl: project.imageUrl ?? '',
      projectLink: project.projectLink ?? '',
      tags: Array.isArray(project.tags) ? project.tags : [],
    })) : [],
    faqItems: Array.isArray(profile.faqItems) ? profile.faqItems.map((item) => ({ question: item.question ?? '', answer: item.answer ?? '' })) : [],
    servicePackages: (Array.isArray(profile.servicePackages) && profile.servicePackages.length ? profile.servicePackages : DEFAULT_PACKAGE_PRESETS).map((pkg, index) => ({
      ...pkg,
      name: DEFAULT_PACKAGE_PRESETS[index]?.name ?? pkg.name,
    })),
  }), [profile]);

  const [form, setForm] = useState(buildFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [projectImagePreviews, setProjectImagePreviews] = useState<Record<number, string>>({});

  const fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || 'Not added yet';
  const domainValue =
    profile.marketplaceTitle?.trim() && profile.marketplaceTitle.trim() !== DEFAULT_MARKETPLACE_TITLE
      ? profile.marketplaceTitle.trim()
      : 'Not added yet';
  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase();
  const locationValue =
    profile.city?.trim() && profile.country?.trim() && profile.country.trim().toLowerCase() !== 'unknown'
      ? `${profile.city.trim()}, ${profile.country.trim()}`
      : profile.country?.trim() && profile.country.trim().toLowerCase() !== 'unknown'
      ? profile.country.trim()
      : 'Not added yet';
  const rateValue =
    typeof profile.marketplaceRate === 'number' && profile.marketplaceRate > 0
      ? `${profile.payCurrency} ${profile.marketplaceRate}/hr`
      : 'Not added yet';
  const summaryValue =
    profile.marketplaceBio?.trim() && !DEFAULT_MARKETPLACE_SUMMARIES.has(profile.marketplaceBio.trim())
      ? profile.marketplaceBio.trim()
      : 'No profile summary added yet.';
  const overviewValue = profile.profileOverview?.trim() || 'No detailed overview added yet.';
  const skillsValue = Array.isArray(profile.skills) && profile.skills.length ? profile.skills.join(', ') : 'No skills added yet';
  const languagesValue = Array.isArray(profile.languages) && profile.languages.length ? profile.languages.join(', ') : 'Not added yet';
  const hasRateBadge = typeof profile.marketplaceRate === 'number' && profile.marketplaceRate > 0;
  const heroSkills = Array.isArray(profile.skills) ? profile.skills.slice(0, 2) : [];
  const extraSkillCount = Math.max(Array.isArray(profile.skills) ? profile.skills.length - heroSkills.length : 0, 0);
  const hasDomainValue = domainValue !== 'Not added yet';
  const hasLocationValue = locationValue !== 'Not added yet';
  const heroSkillsLabel = [
    ...heroSkills,
    extraSkillCount > 0 ? `+${extraSkillCount} more` : null,
  ].filter(Boolean).join('  •  ');

  useEffect(() => {
    setForm(buildFormState());
    setProfilePhotoPreview('');
    setBannerImagePreview('');
    setProjectImagePreviews({});
  }, [buildFormState]);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
    };
  }, [profilePhotoPreview]);

  useEffect(() => {
    return () => {
      if (bannerImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerImagePreview);
      }
    };
  }, [bannerImagePreview]);

  useEffect(() => {
    return () => {
      Object.values(projectImagePreviews).forEach((previewUrl) => {
        if (previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
      });
    };
  }, [projectImagePreviews]);

  useEffect(() => {
    if (!message) return;

    const timeoutId = window.setTimeout(() => {
      setMessage('');
    }, 5_000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message]);

  const handleSave = async () => {
    const skills = Array.from(
      new Set(
        form.skillsInput
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      ),
    );
    const languages = Array.from(
      new Set(
        form.languagesInput
          .split(',')
          .map((language) => language.trim())
          .filter(Boolean),
      ),
    );
    const portfolioProjects = Array.isArray(form.portfolioProjects)
      ? form.portfolioProjects
          .map((project) => ({
            title: project.title.trim(),
            description: project.description.trim(),
            imageUrl: project.imageUrl.trim(),
            projectLink: project.projectLink.trim(),
            tags: Array.from(new Set((Array.isArray(project.tags) ? project.tags : []).map((tag) => tag.trim()).filter(Boolean))),
          }))
          .filter((project) => project.title && project.description && project.imageUrl)
      : [];
    const faqItems = Array.isArray(form.faqItems)
      ? form.faqItems
          .map((item) => ({ question: item.question.trim(), answer: item.answer.trim() }))
          .filter((item) => item.question && item.answer)
      : [];
    const servicePackages = form.servicePackages.map((pkg, index) => ({
      ...pkg,
      name: DEFAULT_PACKAGE_PRESETS[index]?.name ?? pkg.name.trim(),
      description: pkg.description.trim(),
      price: Number(pkg.price) || 0,
      deliveryDays: Number(pkg.deliveryDays) || 1,
      revisions: Number(pkg.revisions) || 0,
      features: Array.from(new Set((Array.isArray(pkg.features) ? pkg.features : []).map((feature) => feature.trim()).filter(Boolean))),
    }));

    setSaving(true);
    setMessage('');
    setError('');
    try {
      await onSave({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        marketplaceTitle: form.marketplaceTitle.trim(),
        marketplaceBio: form.marketplaceBio.trim(),
        marketplaceAvailability: form.marketplaceAvailability,
        marketplaceRate: Number(form.marketplaceRate) || 0,
        city: form.city.trim(),
        country: form.country.trim(),
        responseTimeHours: Number(form.responseTimeHours) || 2,
        skills,
        languages,
        profilePhotoUrl: form.profilePhotoUrl?.trim() || '',
        bannerImageUrl: form.bannerImageUrl?.trim() || '',
        profileOverview: form.profileOverview.trim(),
        portfolioProjects,
        servicePackages,
        faqItems,
      });
      setMessage('Marketplace profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = () => {
    setForm(buildFormState());
    setError('');
    setMessage('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setForm(buildFormState());
    setError('');
    setIsEditing(false);
  };

  if (readOnly || !isEditing) {
    return (
      <div className="cd-page">
        <div className="cd-page-title">My Profile</div>
        <div className="cd-page-sub">
          {readOnly
            ? 'Your contractor profile and account settings'
            : 'Review the freelancer details that companies currently see in the marketplace.'}
        </div>
        <div className="cd-profile-shell">
          {message && !readOnly && (
            <div className="cd-profile-success">
              {message}
            </div>
          )}

          {profile.bannerImageUrl ? (
            <div
              className="cd-profile-banner"
              style={{ backgroundImage: imageBackground(profile.bannerImageUrl) }}
            />
          ) : null}

          <div className="cd-profile-hero">
            <div className="cd-profile-hero-copy">
              <div className="cd-profile-hero-name">{fullName}</div>
              <div className="cd-profile-hero-meta">
                {hasDomainValue && <span>{domainValue}</span>}
                {hasDomainValue && hasLocationValue && <span className="cd-profile-dot" />}
                {hasLocationValue && <span>{locationValue}</span>}
              </div>
              <div className="cd-profile-badges">
                <span className="cd-profile-badge cd-profile-badge-primary">{profile.marketplaceAvailabilityLabel}</span>
                {hasRateBadge && <span className="cd-profile-badge">{rateValue}</span>}
                {heroSkillsLabel && <span className="cd-profile-badge">{heroSkillsLabel}</span>}
              </div>
            </div>

            <div className="cd-profile-hero-media">
              {profile.profilePhotoUrl ? (
                <img
                  className="cd-profile-avatar-image"
                  src={resolveImageUrl(profile.profilePhotoUrl)}
                  alt={fullName || 'Profile photo'}
                />
              ) : (
                <div className="cd-profile-avatar-fallback">{initials}</div>
              )}
            </div>

            {!readOnly && (
              <button
                type="button"
                className="cd-profile-edit-btn"
                onClick={handleStartEdit}
              >
                Update profile
              </button>
            )}
          </div>

          <div className="cd-profile-grid">
            <div className="cd-profile-info-card">
              <div className="cd-profile-section-title">Overview</div>
              <div className="cd-profile-info-list">
                <DetailRow label="Full name" value={fullName} />
                <DetailRow label="Email" value={profile.email?.trim() || 'Not added yet'} />
                <DetailRow label="Contact number" value={profile.phone?.trim() || 'Not added yet'} />
                <DetailRow label="Professional domain" value={domainValue} />
                <DetailRow label="Location" value={locationValue} />
              </div>
            </div>

            <div className="cd-profile-info-card">
              <div className="cd-profile-section-title">Hiring Snapshot</div>
              <div className="cd-profile-metrics">
                <div className="cd-profile-metric">
                  <span className="cd-profile-metric-label">Availability</span>
                  <strong>{profile.marketplaceAvailabilityLabel || 'Not added yet'}</strong>
                </div>
                <div className="cd-profile-metric">
                  <span className="cd-profile-metric-label">Expected rate</span>
                  <strong>{rateValue}</strong>
                </div>
                <div className="cd-profile-metric">
                  <span className="cd-profile-metric-label">Skills</span>
                  <strong>{Array.isArray(profile.skills) && profile.skills.length ? `${profile.skills.length} added` : 'Not added yet'}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="cd-profile-summary-card">
            <div className="cd-profile-section-title">Profile summary</div>
            <p>{summaryValue}</p>
          </div>

          <div className="cd-profile-summary-card">
            <div className="cd-profile-section-title">Public profile overview</div>
            <p>{overviewValue}</p>
          </div>

          <div className="cd-profile-grid">
            <div className="cd-profile-info-card">
              <div className="cd-profile-section-title">Client signals</div>
              <div className="cd-profile-info-list">
                <DetailRow label="Response time" value={`${profile.responseTimeHours} hours`} />
                <DetailRow label="Languages" value={languagesValue} />
                <DetailRow
                  label="Portfolio projects"
                  value={Array.isArray(profile.portfolioProjects) && profile.portfolioProjects.length ? `${profile.portfolioProjects.length} added` : 'Not added yet'}
                />
                <DetailRow
                  label="FAQ entries"
                  value={Array.isArray(profile.faqItems) && profile.faqItems.length ? `${profile.faqItems.length} added` : 'Not added yet'}
                />
              </div>
            </div>

            <div className="cd-profile-info-card">
              <div className="cd-profile-section-title">Service packages</div>
              <div className="cd-profile-metrics">
                {(Array.isArray(profile.servicePackages) ? profile.servicePackages : []).map((pkg) => (
                  <div key={`${pkg.name}-${pkg.price}`} className="cd-profile-metric">
                    <span className="cd-profile-metric-label">{pkg.name}</span>
                    <strong>{pkg.price > 0 ? `${profile.payCurrency} ${pkg.price}` : 'Custom quote'}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cd-profile-summary-card">
            <div className="cd-profile-section-title">Skills visible to companies</div>
            <div className="cd-profile-skill-cloud">
              {Array.isArray(profile.skills) && profile.skills.length ? profile.skills.map((skill) => (
                <span key={skill} className="cd-profile-skill-pill">{skill}</span>
              )) : (
                <span className="cd-profile-empty-note">{skillsValue}</span>
              )}
            </div>
          </div>

          <div className="cd-profile-summary-card">
            <div className="cd-profile-section-title">Portfolio preview</div>
            {Array.isArray(profile.portfolioProjects) && profile.portfolioProjects.length ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {profile.portfolioProjects.slice(0, 3).map((project) => (
                  <div key={`${project.title}-${project.imageUrl}`} style={{ border: '1px solid #edf2f7', borderRadius: 18, padding: 16, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 14, alignItems: 'center' }}>
                    <img src={resolveImageUrl(project.imageUrl)} alt={project.title} style={{ width: '100%', height: 84, objectFit: 'cover', borderRadius: 12, background: '#f8fafc' }} />
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{project.title}</div>
                      <div style={{ color: '#475569', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{project.description}</div>
                      {project.projectLink ? (
                        <a href={project.projectLink} rel="noreferrer noopener" target="_blank" style={{ color: '#2563eb', fontSize: 13, textDecoration: 'underline' }}>
                          View hosted project
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="cd-profile-empty-note">No portfolio projects added yet.</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-page">
      <div className="cd-page-title">My Profile</div>
      <div className="cd-page-sub">Update the freelancer details that companies see in the marketplace.</div>

      <div className="cd-profile-editor">
        <div className="cd-profile-editor-head">
          <div>
            <div className="cd-profile-section-title">Edit your public profile</div>
            <div className="cd-page-sub" style={{ marginBottom: 0 }}>
              These details appear on your marketplace card and help companies understand your fit faster.
            </div>
          </div>
          <div className="cd-profile-editor-tag">Visible to companies</div>
        </div>

        {error && <div style={{ marginBottom: 14, color: '#dc2626', fontSize: 13, fontWeight: 600 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div className="cp-field">
            <label className="cp-label">First name</label>
            <input className="cp-input" value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} />
          </div>
          <div className="cp-field">
            <label className="cp-label">Last name</label>
            <input className="cp-input" value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} />
          </div>
        </div>

        <div className="cp-field">
          <label className="cp-label">Professional domain</label>
          <input className="cp-input" value={form.marketplaceTitle} onChange={(e) => setForm((prev) => ({ ...prev, marketplaceTitle: e.target.value }))} />
        </div>

        <div className="cp-profile-upload-grid">
          <div className="cp-field">
            <label className="cp-label">Profile photo</label>
            <div className="cp-profile-upload-row">
              <FileUploadControl
                value={form.profilePhotoUrl}
                buttonLabel="Upload photo"
                placeholder="No photo selected"
                onFile={async (file) => {
                  const previewUrl = URL.createObjectURL(file);
                  setProfilePhotoPreview((previousUrl) => {
                    if (previousUrl.startsWith('blob:')) URL.revokeObjectURL(previousUrl);
                    return previewUrl;
                  });
                  try {
                    const imageUrl = await uploadContractorProfileImage(file);
                    setForm((prev) => ({ ...prev, profilePhotoUrl: imageUrl }));
                  } catch {
                    setError('Unable to upload selected profile photo.');
                  }
                }}
              />
              <div className="cp-profile-image-preview">
                {profilePhotoPreview || resolveImageUrl(form.profilePhotoUrl) ? (
                  <img src={profilePhotoPreview || resolveImageUrl(form.profilePhotoUrl)} alt="Profile preview" />
                ) : (
                  'Preview'
                )}
              </div>
            </div>
          </div>
          <div className="cp-field">
            <label className="cp-label">Marketplace banner</label>
            <div className="cp-profile-upload-row cp-profile-upload-row--banner">
              <FileUploadControl
                value={form.bannerImageUrl}
                buttonLabel="Upload banner"
                placeholder="No banner selected"
                onFile={async (file) => {
                  const previewUrl = URL.createObjectURL(file);
                  setBannerImagePreview((previousUrl) => {
                    if (previousUrl.startsWith('blob:')) URL.revokeObjectURL(previousUrl);
                    return previewUrl;
                  });
                  try {
                    const imageUrl = await uploadContractorProfileImage(file);
                    setForm((prev) => ({ ...prev, bannerImageUrl: imageUrl }));
                  } catch {
                    setError('Unable to upload selected banner image.');
                  }
                }}
              />
              <div className="cp-profile-image-preview">
                {bannerImagePreview || resolveImageUrl(form.bannerImageUrl) ? (
                  <img src={bannerImagePreview || resolveImageUrl(form.bannerImageUrl)} alt="Banner preview" />
                ) : (
                  'Preview'
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div className="cp-field">
            <label className="cp-label">City</label>
            <input className="cp-input" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
          </div>
          <div className="cp-field">
            <label className="cp-label">Country</label>
            <input className="cp-input" value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} />
          </div>
          <div className="cp-field">
            <label className="cp-label">Expected hourly rate ({profile.payCurrency})</label>
            <input className="cp-input" type="number" min="0" value={form.marketplaceRate} onChange={(e) => setForm((prev) => ({ ...prev, marketplaceRate: e.target.value }))} />
          </div>
        </div>

        <div className="cp-field">
          <label className="cp-label">Availability</label>
          <select
            className="cp-input"
            value={form.marketplaceAvailability}
            onChange={(e) => setForm((prev) => ({
              ...prev,
              marketplaceAvailability: e.target.value as ContractorProfile['marketplaceAvailability'],
            }))}
          >
            {MARKETPLACE_AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="cp-field">
          <label className="cp-label">Profile summary</label>
          <textarea
            className="cp-textarea"
            style={{ height: 120 }}
            value={form.marketplaceBio}
            onChange={(e) => setForm((prev) => ({ ...prev, marketplaceBio: e.target.value }))}
          />
        </div>

        <div className="cp-field" style={{ marginBottom: 10 }}>
          <label className="cp-label">Skills shown in marketplace</label>
          <textarea
            className="cp-textarea"
            style={{ height: 88 }}
            value={form.skillsInput}
            onChange={(e) => setForm((prev) => ({ ...prev, skillsInput: e.target.value }))}
            placeholder="React, TypeScript, Node.js"
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
            Separate skills with commas. These will appear on your marketplace card.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div className="cp-field">
            <label className="cp-label">Average response time (hours)</label>
            <input className="cp-input" type="number" min="1" value={form.responseTimeHours} onChange={(e) => setForm((prev) => ({ ...prev, responseTimeHours: e.target.value }))} />
          </div>
          <div className="cp-field">
            <label className="cp-label">Languages</label>
            <input className="cp-input" value={form.languagesInput} onChange={(e) => setForm((prev) => ({ ...prev, languagesInput: e.target.value }))} placeholder="English, Hindi" />
          </div>
        </div>

        <div className="cp-field">
          <label className="cp-label">Detailed public overview</label>
          <textarea
            className="cp-textarea"
            style={{ minHeight: 140 }}
            value={form.profileOverview}
            onChange={(e) => setForm((prev) => ({ ...prev, profileOverview: e.target.value }))}
            placeholder="Write a fuller introduction that companies will see on your public profile page."
          />
        </div>

        <div className="cp-field">
          <label className="cp-label">Portfolio projects</label>
          {form.portfolioProjects.length === 0 ? (
            <div style={{ marginBottom: 12, color: '#64748b', fontSize: 13 }}>
              Add a portfolio project below to show your previous work.
            </div>
          ) : null}
          <div style={{ display: 'grid', gap: 18 }}>
            {form.portfolioProjects.map((project, projectIndex) => (
              <div key={projectIndex} style={{ border: '1px solid #e2e8f0', borderRadius: 18, padding: 16, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Project {projectIndex + 1}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectImagePreviews((previousPreviews) => {
                        const previousUrl = previousPreviews[projectIndex];
                        if (previousUrl?.startsWith('blob:')) URL.revokeObjectURL(previousUrl);

                        return Object.fromEntries(
                          Object.entries(previousPreviews)
                            .filter(([index]) => Number(index) !== projectIndex)
                            .map(([index, previewUrl]) => {
                              const numericIndex = Number(index);
                              return [numericIndex > projectIndex ? numericIndex - 1 : numericIndex, previewUrl];
                            }),
                        );
                      });
                      setForm((prev) => ({
                        ...prev,
                        portfolioProjects: prev.portfolioProjects.filter((_, index) => index !== projectIndex),
                      }));
                    }}
                    style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Remove
                  </button>
                </div>

                <div className="cp-field">
                  <label className="cp-label">Project title</label>
                  <input
                    className="cp-input"
                    value={project.title}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      portfolioProjects: prev.portfolioProjects.map((item, index) => index === projectIndex ? { ...item, title: e.target.value } : item),
                    }))}
                  />
                </div>

                <div className="cp-field">
                  <label className="cp-label">Project description</label>
                  <textarea
                    className="cp-textarea"
                    style={{ height: 100 }}
                    value={project.description}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      portfolioProjects: prev.portfolioProjects.map((item, index) => index === projectIndex ? { ...item, description: e.target.value } : item),
                    }))}
                  />
                </div>

                <div className="cp-field">
                  <label className="cp-label">Project image</label>
                  <div className="cp-project-image-row">
                    <FileUploadControl
                      value={project.imageUrl}
                      buttonLabel="Upload image"
                      placeholder="No image selected"
                      onFile={async (file) => {
                        const previewUrl = URL.createObjectURL(file);
                        setProjectImagePreviews((previousPreviews) => {
                          const previousUrl = previousPreviews[projectIndex];
                          if (previousUrl?.startsWith('blob:')) URL.revokeObjectURL(previousUrl);
                          return { ...previousPreviews, [projectIndex]: previewUrl };
                        });
                        try {
                          const imageUrl = await uploadContractorProfileImage(file);
                          setForm((prev) => ({
                            ...prev,
                            portfolioProjects: prev.portfolioProjects.map((item, index) => index === projectIndex ? { ...item, imageUrl } : item),
                          }));
                        } catch {
                          setError('Unable to upload selected project image.');
                        }
                      }}
                    />
                    <div className="cp-project-image-preview">
                      {projectImagePreviews[projectIndex] || resolveImageUrl(project.imageUrl) ? (
                        <img src={projectImagePreviews[projectIndex] || resolveImageUrl(project.imageUrl)} alt="Project preview" />
                      ) : (
                        <span>No preview</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="cp-field">
                  <label className="cp-label">Project link</label>
                  <input
                    className="cp-input"
                    type="url"
                    value={project.projectLink}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      portfolioProjects: prev.portfolioProjects.map((item, index) => index === projectIndex ? { ...item, projectLink: e.target.value } : item),
                    }))}
                    placeholder="https://your-project-host.com"
                  />
                </div>

                <div className="cp-field">
                  <label className="cp-label">Tags</label>
                  <input
                    className="cp-input"
                    value={project.tags.join(', ')}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      portfolioProjects: prev.portfolioProjects.map((item, index) => index === projectIndex ? { ...item, tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) } : item),
                    }))}
                    placeholder="React, Node.js, UX"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setForm((prev) => ({
              ...prev,
              portfolioProjects: [
                ...prev.portfolioProjects,
                { title: '', description: '', imageUrl: '', projectLink: '', tags: [] },
              ],
            }))}
            style={{ marginTop: 12, width: 'auto', minWidth: 150, padding: '0 18px', height: 42, borderRadius: 12, border: '1px solid #d7dfeb', background: '#fff', color: '#111827', cursor: 'pointer', fontWeight: 700 }}
          >
            Add portfolio project
          </button>
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
            Add a title, description, an uploaded image, a hosted project link, and tags for each portfolio project.
          </div>
        </div>

        <div className="cp-field">
          <label className="cp-label">Service packages</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
            {form.servicePackages.map((pkg, index) => (
              <div key={`${pkg.name}-${index}`} style={{ border: '1px solid #e2e8f0', borderRadius: 18, padding: 16, background: '#fff' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>{pkg.name}</div>
                <div className="cp-field">
                  <label className="cp-label">Name</label>
                  <input className="cp-input" value={pkg.name} disabled style={{ background: '#f8fafc', cursor: 'not-allowed' }} />
                </div>
                <div className="cp-field">
                  <label className="cp-label">Price ({profile.payCurrency})</label>
                  <input className="cp-input" type="number" min="0" value={pkg.price} onChange={(e) => setForm((prev) => ({ ...prev, servicePackages: prev.servicePackages.map((item, itemIndex) => itemIndex === index ? { ...item, price: Number(e.target.value) || 0 } : item) }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="cp-field">
                    <label className="cp-label">Delivery days</label>
                    <input className="cp-input" type="number" min="1" value={pkg.deliveryDays} onChange={(e) => setForm((prev) => ({ ...prev, servicePackages: prev.servicePackages.map((item, itemIndex) => itemIndex === index ? { ...item, deliveryDays: Number(e.target.value) || 1 } : item) }))} />
                  </div>
                  <div className="cp-field">
                    <label className="cp-label">Revisions</label>
                    <input className="cp-input" type="number" min="0" value={pkg.revisions} onChange={(e) => setForm((prev) => ({ ...prev, servicePackages: prev.servicePackages.map((item, itemIndex) => itemIndex === index ? { ...item, revisions: Number(e.target.value) || 0 } : item) }))} />
                  </div>
                </div>
                <div className="cp-field">
                  <label className="cp-label">Description</label>
                  <textarea className="cp-textarea" style={{ height: 96 }} value={pkg.description} onChange={(e) => setForm((prev) => ({ ...prev, servicePackages: prev.servicePackages.map((item, itemIndex) => itemIndex === index ? { ...item, description: e.target.value } : item) }))} />
                </div>
                <div className="cp-field">
                  <label className="cp-label">Features</label>
                  <textarea className="cp-textarea" style={{ height: 84 }} value={Array.isArray(pkg.features) ? pkg.features.join(', ') : ''} onChange={(e) => setForm((prev) => ({ ...prev, servicePackages: prev.servicePackages.map((item, itemIndex) => itemIndex === index ? { ...item, features: e.target.value.split(',').map((feature) => feature.trim()).filter(Boolean) } : item) }))} placeholder="Landing page, API integration, QA" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cp-field" style={{ marginBottom: 10 }}>
          <label className="cp-label">FAQ</label>
          {form.faqItems.length === 0 ? (
            <div style={{ marginBottom: 12, color: '#64748b', fontSize: 13 }}>
              Add FAQ entries one at a time below.
            </div>
          ) : null}
          <div style={{ display: 'grid', gap: 16 }}>
            {form.faqItems.map((item, faqIndex) => (
              <div key={faqIndex} style={{ border: '1px solid #e2e8f0', borderRadius: 18, padding: 16, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>FAQ {faqIndex + 1}</div>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({
                      ...prev,
                      faqItems: prev.faqItems.filter((_, index) => index !== faqIndex),
                    }))}
                    style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Remove
                  </button>
                </div>
                <div className="cp-field">
                  <label className="cp-label">Question</label>
                  <input
                    className="cp-input"
                    value={item.question}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      faqItems: prev.faqItems.map((faqItem, index) => index === faqIndex ? { ...faqItem, question: e.target.value } : faqItem),
                    }))}
                    placeholder="What do companies need to know?"
                  />
                </div>
                <div className="cp-field">
                  <label className="cp-label">Answer</label>
                  <textarea
                    className="cp-textarea"
                    style={{ minHeight: 90 }}
                    value={item.answer}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      faqItems: prev.faqItems.map((faqItem, index) => index === faqIndex ? { ...faqItem, answer: e.target.value } : faqItem),
                    }))}
                    placeholder="Provide a concise, helpful answer."
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setForm((prev) => ({
              ...prev,
              faqItems: [...prev.faqItems, { question: '', answer: '' }],
            }))}
            style={{ marginTop: 12, width: 'auto', minWidth: 150, padding: '0 18px', height: 42, borderRadius: 12, border: '1px solid #d7dfeb', background: '#fff', color: '#111827', cursor: 'pointer', fontWeight: 700 }}
          >
            Add FAQ item
          </button>
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
            Add one FAQ item per block above. Each entry appears separately on your marketplace profile.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{
              width: 'auto',
              minWidth: 130,
              padding: '0 24px',
              height: 46,
              borderRadius: 12,
              border: '1px solid #d7dfeb',
              background: '#fff',
              color: '#475569',
              fontSize: 14,
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
            onClick={handleCancelEdit}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cp-btn-primary"
            style={{ width: 'auto', minWidth: 150, padding: '0 24px' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContractorDashboard({
  previewProfile = null,
  onLogoutOverride,
  initialPage = 'dashboard',
  flashMessage = '',
}: ContractorDashboardProps) {
  const [page, setPage] = useState<ContractorPage>(() => getContractorPageFromQuery(initialPage));
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [invoices, setInvoices] = useState<ContractorInvoice[]>([]);
  const [notifications, setNotifications] = useState<ContractorNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [bannerMessage, setBannerMessage] = useState(flashMessage);
  const isPreviewMode = Boolean(previewProfile);

  useEffect(() => {
    setPage(getContractorPageFromQuery(initialPage));
  }, [initialPage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', page);
    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `/contractor/dashboard?${nextQuery}` : '/contractor/dashboard';
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl !== nextUrl) {
      window.history.replaceState({}, '', nextUrl);
    }
  }, [page]);

  useEffect(() => {
    setBannerMessage(flashMessage);
  }, [flashMessage]);

  useEffect(() => {
    if (!bannerMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setBannerMessage('');
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [bannerMessage]);

  useEffect(() => {
    if (previewProfile) {
      setProfile(normalizeContractorProfile(previewProfile));
      setInvoices([]);
      setNotifications([]);
      setLoadError('');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const handleSessionExpired = () => {
      contractorTokenStore.clear();
      window.location.href = '/freelancer/login';
    };

    window.addEventListener('dechub:contractor-session-expired', handleSessionExpired);

    (async () => {
      try {
        const [profileResult, invoicesResult, notificationsResult] = await Promise.allSettled([
          getContractorProfile(),
          getMyInvoices(),
          getContractorNotifications(),
        ]);

        if (!isMounted) {
          return;
        }

        if (profileResult.status === 'rejected') {
          const message = profileResult.reason instanceof Error
            ? profileResult.reason.message
            : 'Failed to load your dashboard. Please log in again.';

          if (message.toLowerCase().includes('session expired')) {
            handleSessionExpired();
            return;
          }

          setLoadError(message);
          setLoading(false);
          return;
        }

        setProfile(normalizeContractorProfile(profileResult.value));
        setLoadError('');

        if (invoicesResult.status === 'fulfilled') {
          setInvoices(Array.isArray(invoicesResult.value) ? invoicesResult.value : []);
        } else {
          setInvoices([]);
        }

        if (notificationsResult.status === 'fulfilled') {
          setNotifications(Array.isArray(notificationsResult.value) ? notificationsResult.value : []);
        } else {
          setNotifications([]);
        }

        setLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error
          ? error.message
          : 'Failed to load your dashboard. Please log in again.';

        if (message.toLowerCase().includes('session expired')) {
          handleSessionExpired();
          return;
        }

        setLoadError(message);
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
      window.removeEventListener('dechub:contractor-session-expired', handleSessionExpired);
    };
  }, [previewProfile]);

  const handleInvoiceSuccess = useCallback((invoice: ContractorInvoice) => {
    setInvoices((prev) => [invoice, ...prev]);
    setShowInvoice(false);
    setPage('invoices');
  }, []);

  const handleLogout = () => {
    if (onLogoutOverride) {
      onLogoutOverride();
      return;
    }
    contractorTokenStore.clear();
    window.location.href = '/';
  };

  const handleOpenInvoiceModal = () => {
    if (!isPreviewMode) {
      setShowInvoice(true);
    }
  };

  const handleSaveProfile = async (payload: {
    firstName: string;
    lastName: string;
    marketplaceTitle: string;
    marketplaceBio: string;
    marketplaceAvailability: ContractorProfile['marketplaceAvailability'];
    marketplaceRate: number;
    city: string;
    country: string;
    responseTimeHours: number;
    skills: string[];
    languages: string[];
    profilePhotoUrl?: string;
    bannerImageUrl?: string;
    profileOverview: string;
    portfolioProjects: ContractorProfile['portfolioProjects'];
    servicePackages: ContractorProfile['servicePackages'];
    faqItems: ContractorProfile['faqItems'];
  }) => {
    if (isPreviewMode) {
      setProfile((prev) => (prev ? {
        ...prev,
        ...payload,
        profilePhotoUrl: payload.profilePhotoUrl ?? prev.profilePhotoUrl,
        bannerImageUrl: payload.bannerImageUrl ?? prev.bannerImageUrl,
        marketplaceAvailabilityLabel:
          MARKETPLACE_AVAILABILITY_OPTIONS.find((option) => option.value === payload.marketplaceAvailability)?.label
          ?? prev.marketplaceAvailabilityLabel,
      } : prev));
      return;
    }

    const savedProfile = await updateContractorProfile(payload);
    setProfile(savedProfile);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="cp-spinner dark" style={{ width: 28, height: 28, borderWidth: 3, margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: 24 }}>
        <div style={{ maxWidth: 420, width: '100%', background: '#ffffff', border: '1px solid #fecaca', borderRadius: 20, padding: 24, boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)' }}>
          <h2 style={{ margin: '0 0 12px', color: '#0f172a', fontSize: 24, fontWeight: 800 }}>Unable to load dashboard</h2>
          <p style={{ margin: '0 0 20px', color: '#475569', lineHeight: 1.7 }}>
            {loadError || 'We could not finish loading your contractor dashboard. Please log in again and retry.'}
          </p>
          <button
            type="button"
            className="cp-btn-primary"
            onClick={() => {
              contractorTokenStore.clear();
              window.location.href = '/freelancer/login';
            }}
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase();
  const unreadNotificationCount = notifications.filter((item) => !item.readAt).length;
  const nav: { id: ContractorPage; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'Projects' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'contract', label: 'Contract' },
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: unreadNotificationCount > 0 ? `Notifications (${unreadNotificationCount})` : 'Notifications' },
  ];

  return (
    <div className="cd-shell">
      <header className="cd-topbar">
        <div className="cd-logo">
          <div className="cd-logo-dot" />
          Dechub
        </div>

        <nav className="cd-nav">
          {nav.map((item) => (
            <button
              key={item.id}
              className={`cd-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="cd-user">
          <div>
            <div className="cd-user-name">{profile.firstName} {profile.lastName}</div>
            <div className="cd-user-role">{profile.companyName}</div>
          </div>
          <div className="cd-avatar">{initials}</div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18, padding: '0 4px' }}
          >
            ⇥
          </button>
        </div>
      </header>

      {bannerMessage ? (
        <div style={{ margin: '18px 28px 0', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: 12, padding: '14px 18px', fontSize: 14, fontWeight: 600 }}>
          {bannerMessage}
        </div>
      ) : null}

      {page === 'dashboard' && (
        <DashboardHome
          profile={profile}
          invoices={invoices}
          onSubmitInvoice={handleOpenInvoiceModal}
          onNavigate={setPage}
        />
      )}

      {page === 'projects' && <ProjectTasksPage />}

      {page === 'invoices' && (
        <InvoicesPage
          invoices={invoices}
          onSubmit={handleOpenInvoiceModal}
          readOnly={isPreviewMode}
        />
      )}

      {page === 'contract' && <ContractPage profile={profile} readOnly={isPreviewMode} />}

      {page === 'profile' && (
        <ProfilePage
          profile={profile}
          readOnly={isPreviewMode}
          onSave={handleSaveProfile}
        />
      )}

      {page === 'notifications' && (
        <div className="cd-page">
          <div className="cd-page-title">Notifications</div>
          <div className="cd-page-sub">Updates about your contracts and account</div>
          <div className="cd-card" style={{ padding: '8px 0' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, color: '#64748b' }}>You do not have any notifications yet.</div>
            ) : notifications.map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={async () => {
                  if (!notification.readAt) {
                    await markContractorNotificationRead(notification._id);
                    setNotifications((current) => current.map((item) => (
                      item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item
                    )));
                  }
                  if (notification.actionUrl?.includes('contract')) {
                    setPage('contract');
                  }
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  borderBottom: '1px solid #eef2f7',
                  background: notification.readAt ? '#fff' : '#f8fbff',
                  padding: '18px 24px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{notification.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{notification.message}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showInvoice && !isPreviewMode && (
        <SubmitInvoiceModal
          profile={profile}
          onClose={() => setShowInvoice(false)}
          onSuccess={handleInvoiceSuccess}
        />
      )}
    </div>
  );
}
