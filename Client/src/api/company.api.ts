import { api, normalizeError, ApiResponse, unwrapApiData } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StepResult {
  signupStep: number;
  companyId?: string;
}

// ─── Step 2 — Company Identity ────────────────────────────────────────────────

export interface IdentityPayload {
  companyName:    string;
  companyCountry: string;
  companyType:    string;
  taxId?:         string;
}

export async function saveIdentity(payload: IdentityPayload): Promise<StepResult> {
  try {
    const res = await api.post<ApiResponse<StepResult>>('/company/identity', payload);
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

// ─── Step 3 — Business Details ────────────────────────────────────────────────

export interface BusinessPayload {
  companySize:     string;
  companyIndustry: string;
  companyWebsite?: string;
  addressLine1:    string;
  addressCity:     string;
  addressZip:      string;
  referralSource?: string;
}

export async function saveBusinessDetails(payload: BusinessPayload): Promise<StepResult> {
  try {
    const res = await api.post<ApiResponse<StepResult>>('/company/business', payload);
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

// ─── Step 4 — KYB Document Upload ────────────────────────────────────────────

export interface KybFiles {
  doc1: File | null;   // Required — Certificate of Incorporation
  doc2: File | null;   // Optional — Tax ID
  doc3: File | null;   // Required — Owner ID
  doc4: File | null;   // Optional — Proof of address
}

export interface KybResult extends StepResult {
  kybStatus: 'verifying' | 'approved' | 'rejected';
  docsCount: number;
}

export async function submitKyb(
  files: KybFiles,
  onProgress?: (pct: number) => void,
): Promise<KybResult> {
  try {
    const form = new FormData();
    if (files.doc1) form.append('doc1', files.doc1);
    if (files.doc2) form.append('doc2', files.doc2);
    if (files.doc3) form.append('doc3', files.doc3);
    if (files.doc4) form.append('doc4', files.doc4);

    const res = await api.post<ApiResponse<KybResult>>('/company/kyb', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => {
            const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
            onProgress(pct);
          }
        : undefined,
    });
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * Poll the backend every 2s until KYB status is no longer 'verifying'.
 * Resolves when approved or rejected.
 * Rejects after maxAttempts (default 30 = 60s).
 */
export function pollKybStatus(
  onStatus: (status: string) => void,
  maxAttempts = 30,
): Promise<'approved' | 'rejected'> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const tick = async () => {
      try {
        const res = await api.get<ApiResponse<{ kybStatus: string }>>('/company/kyb/status');
        const status = unwrapApiData(res.data).kybStatus;
        onStatus(status);

        if (status === 'approved') { resolve('approved'); return; }
        if (status === 'rejected') { resolve('rejected'); return; }

        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('KYB verification timed out — please contact support'));
          return;
        }
        setTimeout(tick, 2000);
      } catch (err) {
        reject(normalizeError(err));
      }
    };

    tick();
  });
}

// ─── Step 5 — Billing ─────────────────────────────────────────────────────────

/**
 * Get a Stripe SetupIntent client secret so the frontend can
 * collect card details via Stripe Elements without raw card data
 * ever touching your server.
 */
export async function getSetupIntentClientSecret(): Promise<string> {
  try {
    const res = await api.post<ApiResponse<{ clientSecret: string }>>(
      '/company/billing/setup-intent',
    );
    return unwrapApiData(res.data).clientSecret;
  } catch (err) {
    throw normalizeError(err);
  }
}

export interface BillingPayload {
  billCurrency:    string;
  billingEmail?:   string;
  paymentMethodId?: string;
}

export async function saveBilling(payload: BillingPayload): Promise<StepResult> {
  try {
    const billingEmail = payload.billingEmail?.trim();
    const isDummyPayment = !payload.paymentMethodId || payload.paymentMethodId === 'pm_mvp_dummy';
    const requestBody: Record<string, unknown> = {
      billCurrency: payload.billCurrency,
      paymentProvider: isDummyPayment ? 'dummy' : 'stripe',
      ...(isDummyPayment
        ? { dummyPaymentId: payload.paymentMethodId || 'pm_mvp_dummy' }
        : { stripePaymentMethodId: payload.paymentMethodId }),
    };
    if (billingEmail) requestBody.billingEmail = billingEmail;
    const res = await api.post<ApiResponse<StepResult>>('/company/billing', requestBody);
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

// ─── Step 6 — Preferences ─────────────────────────────────────────────────────

export interface PreferencesPayload {
  payCycle:         string;
  contractCurrency: string;
  companyTimezone:  string;
  hrEmail:          string;
  notif1: boolean;
  notif2: boolean;
  notif3: boolean;
  notif4: boolean;
}

export async function savePreferences(payload: PreferencesPayload): Promise<StepResult> {
  try {
    const res = await api.post<ApiResponse<StepResult>>('/company/preferences', payload);
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

// ─── Resume — get saved company data ─────────────────────────────────────────

export interface MyCompanyData {
  user: {
    firstName:       string;
    lastName:        string;
    email:           string;
    phone:           string | null;
    signupStep:      number;
    isEmailVerified: boolean;
  };
  company: Record<string, unknown>;
}

export async function getMyCompany(): Promise<MyCompanyData> {
  try {
    const res = await api.get<ApiResponse<MyCompanyData>>('/company/me');
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}
