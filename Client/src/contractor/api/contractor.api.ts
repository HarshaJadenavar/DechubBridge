import axios from 'axios';
import { api } from '../../api/client';
import { resolveImageUrl } from '../../utils/imageUrl';
import type {
  ContractorTokenInfo,
  ContractorContract,
  ContractorInvoice,
  ContractorNotification,
  SubmitInvoicePayload,
  ContractorProfile,
} from '../types/contractor.types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function normalizeContractorProfileImages(profile: ContractorProfile): ContractorProfile {
  return {
    ...profile,
    profilePhotoUrl: resolveImageUrl(profile.profilePhotoUrl),
    bannerImageUrl: resolveImageUrl(profile.bannerImageUrl),
    portfolioProjects: Array.isArray(profile.portfolioProjects)
      ? profile.portfolioProjects.map((project) => ({
          ...project,
          imageUrl: resolveImageUrl(project.imageUrl),
        }))
      : [],
  };
}

// ─── Token store for contractor JWT ──────────────────────────────────────────

const CONTRACTOR_TOKEN_KEY = 'dechub_contractor_token';
const CONTRACTOR_REFRESH_KEY = 'dechub_contractor_refresh_token';

export const contractorTokenStore = {
  get: () => localStorage.getItem(CONTRACTOR_TOKEN_KEY),
  getAccess: () => localStorage.getItem(CONTRACTOR_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(CONTRACTOR_REFRESH_KEY),
  set: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem(CONTRACTOR_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(CONTRACTOR_REFRESH_KEY, refreshToken);
    }
  },
  clear: () => {
    localStorage.removeItem(CONTRACTOR_TOKEN_KEY);
    localStorage.removeItem(CONTRACTOR_REFRESH_KEY);
  },
};

// ─── Axios instance ───────────────────────────────────────────────────────────

export const contractorApi = axios.create({ baseURL: `${BASE}/api/contractor` });

contractorApi.interceptors.request.use((config) => {
  const token = contractorTokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function drainQueue(token: string | null, err: unknown) {
  pendingQueue.forEach((entry) => (token ? entry.resolve(token) : entry.reject(err)));
  pendingQueue = [];
}

contractorApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !String(original.url ?? '').includes('/auth/contractor/refresh')
    ) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              if (original.headers) {
                original.headers.Authorization = `Bearer ${token}`;
              }
              resolve(contractorApi(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      const refreshToken = contractorTokenStore.getRefresh();

      if (!refreshToken) {
        contractorTokenStore.clear();
        isRefreshing = false;
        window.dispatchEvent(new Event('dechub:contractor-session-expired'));
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }

      try {
        const response = await axios.post<{
          success: boolean;
          data: { accessToken: string; refreshToken: string };
        }>(`${BASE}/api/auth/contractor/refresh`, { refreshToken });

        const { accessToken, refreshToken: nextRefreshToken } = response.data.data;
        contractorTokenStore.set(accessToken, nextRefreshToken);
        drainQueue(accessToken, null);

        if (original.headers) {
          original.headers.Authorization = `Bearer ${accessToken}`;
        }

        return contractorApi(original);
      } catch (refreshError) {
        contractorTokenStore.clear();
        drainQueue(null, refreshError);
        window.dispatchEvent(new Event('dechub:contractor-session-expired'));
        return Promise.reject(new Error('Session expired. Please log in again.'));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

function normalizeError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const fieldMessages = err.response?.data?.error?.fields as Record<string, string> | undefined;
    const firstFieldMessage = fieldMessages ? Object.values(fieldMessages)[0] : undefined;
    const msg = firstFieldMessage ?? err.response?.data?.error?.message ?? err.message;
    return new Error(msg);
  }
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message?: unknown }).message === 'string'
  ) {
    return new Error((err as { message: string }).message);
  }
  return err instanceof Error ? err : new Error('Unknown error');
}

// ─── Step 0 — Verify invite token (public) ────────────────────────────────────

export async function verifyInviteToken(token: string): Promise<ContractorTokenInfo> {
  try {
    const res = await axios.get<{ success: boolean; data: ContractorTokenInfo }>(
      `${BASE}/api/contractor/verify-token/${token}`,
    );
    return res.data.data;
  } catch (err) { throw normalizeError(err); }
}

// ─── Step 1 — Set password ────────────────────────────────────────────────────

export async function setContractorPassword(token: string, password: string): Promise<string> {
  try {
    const res = await axios.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
      `${BASE}/api/contractor/set-password`,
      { token, password },
    );
    const { accessToken, refreshToken } = res.data.data;
    contractorTokenStore.set(accessToken, refreshToken);
    return accessToken;
  } catch (err) { throw normalizeError(err); }
}

// ─── Step 2 — Personal details ────────────────────────────────────────────────

export async function savePersonalDetails(data: {
  dateOfBirth:  string;
  nationality:  string;
  addressLine1: string;
  addressLine2: string;
  city:         string;
  state:        string;
  postalCode:   string;
  country:      string;
  taxId:        string;
}): Promise<void> {
  try {
    await contractorApi.post('/onboarding/personal-details', data);
  } catch (err) { throw normalizeError(err); }
}

// ─── Step 3 — KYC upload ─────────────────────────────────────────────────────

export async function uploadKyc(
  idType:    string,
  idNumber:  string,
  frontFile: File,
  backFile:  File | null,
  selfie:    File,
): Promise<void> {
  try {
    const form = new FormData();
    form.append('idType',   idType);
    form.append('idNumber', idNumber);
    form.append('idFront',  frontFile);
    if (backFile) form.append('idBack', backFile);
    form.append('selfie',   selfie);
    await contractorApi.post('/onboarding/kyc', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (err) { throw normalizeError(err); }
}

// ─── Step 4 — Bank / payment details ─────────────────────────────────────────

export async function saveBankDetails(data: {
  paymentMethod: string;
  wiseEmail?:    string;
  bankName?:     string;
  accountNumber?:string;
  routingNumber?:string;
  swiftCode?:    string;
  paypalEmail?:  string;
}): Promise<void> {
  try {
    await contractorApi.post('/onboarding/bank-details', data);
  } catch (err) { throw normalizeError(err); }
}

// ─── Step 5 — Get contract for signing ───────────────────────────────────────

export async function getMyContract(): Promise<ContractorContract> {
  try {
    const res = await contractorApi.get<{ success: boolean; data: ContractorContract }>('/contract');
    return res.data.data;
  } catch (err) { throw normalizeError(err); }
}

export async function getDocuSignUrl(): Promise<string> {
  try {
    const res = await contractorApi.post<{ success: boolean; data: { signingUrl: string } }>(
      '/contract/signing-url',
    );
    return res.data.data.signingUrl;
  } catch (err) { throw normalizeError(err); }
}

export async function selfSignupContractor(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken: string; firstName: string; lastName: string; email: string }> {
  try {
    const request = () => api.post<{
      success: boolean;
      data: {
        accessToken: string;
        refreshToken: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }>('/auth/contractor/signup', data);

    try {
      const res = await request();
      const payload = res.data.data;
      contractorTokenStore.set(payload.accessToken, payload.refreshToken);
      return payload;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        const fallback = await axios.post<{
          success: boolean;
          data: {
            accessToken: string;
            refreshToken: string;
            firstName: string;
            lastName: string;
            email: string;
          };
        }>(`${BASE}/api/contractor/self-signup`, data);

        const payload = fallback.data.data;
        contractorTokenStore.set(payload.accessToken, payload.refreshToken);
        return payload;
      }

      throw err;
    }
  } catch (err) { throw normalizeError(err); }
}

export async function signContractForMvp(): Promise<ContractorContract | null> {
  try {
    const res = await contractorApi.post<{ success: boolean; data?: ContractorContract }>(
      '/contract/sign',
    );
    return res.data.data ?? null;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message = String(
        err.response?.data?.error?.message
        ?? err.response?.data?.message
        ?? err.message
        ?? '',
      ).toLowerCase();

      if (err.response?.status === 404 || message.includes('route not found')) {
        return null;
      }
    }

    throw normalizeError(err);
  }
}

export async function rejectContractForMvp(): Promise<ContractorContract> {
  try {
    const res = await contractorApi.post<{ success: boolean; data: ContractorContract }>(
      '/contract/reject',
    );
    return res.data.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// ─── Contractor profile / dashboard ──────────────────────────────────────────

export async function getContractorProfile(): Promise<ContractorProfile> {
  try {
    const res = await contractorApi.get<{ success: boolean; data: ContractorProfile }>('/me');
    return normalizeContractorProfileImages(res.data.data);
  } catch (err) { throw normalizeError(err); }
}

export async function updateContractorSkills(skills: string[]): Promise<string[]> {
  try {
    const res = await contractorApi.put<{ success: boolean; data: { skills: string[] } }>('/me/skills', {
      skills,
    });
    return res.data.data.skills;
  } catch (err) { throw normalizeError(err); }
}

export async function updateContractorProfile(data: {
  firstName: string;
  lastName: string;
  marketplaceTitle: string;
  marketplaceBio: string;
  marketplaceAvailability: 'available_now' | 'this_week' | 'two_weeks' | 'next_month' | 'not_available';
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
}): Promise<ContractorProfile> {
  try {
    const res = await contractorApi.put<{ success: boolean; data: ContractorProfile }>('/me/profile', data);
    return normalizeContractorProfileImages(res.data.data);
  } catch (err) { throw normalizeError(err); }
}

// ─── Invoices — contractor side ───────────────────────────────────────────────

export async function uploadContractorProfileImage(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await contractorApi.post<{ success: boolean; data: { url: string } }>(
      '/me/profile/assets',
      formData,
    );
    return resolveImageUrl(res.data.data.url);
  } catch (err) { throw normalizeError(err); }
}

export async function getMyInvoices(): Promise<ContractorInvoice[]> {
  try {
    const res = await contractorApi.get<{ success: boolean; data: ContractorInvoice[] }>('/invoices');
    return res.data.data;
  } catch (err) { throw normalizeError(err); }
}

export async function submitInvoice(data: SubmitInvoicePayload): Promise<ContractorInvoice> {
  try {
    const res = await contractorApi.post<{ success: boolean; data: ContractorInvoice }>(
      '/invoices',
      data,
    );
    return res.data.data;
  } catch (err) { throw normalizeError(err); }
}

export async function saveDraftInvoice(data: Partial<SubmitInvoicePayload>): Promise<ContractorInvoice> {
  try {
    const res = await contractorApi.post<{ success: boolean; data: ContractorInvoice }>(
      '/invoices/draft',
      data,
    );
    return res.data.data;
  } catch (err) { throw normalizeError(err); }
}

export async function getContractorNotifications(): Promise<ContractorNotification[]> {
  try {
    const res = await contractorApi.get<{ success: boolean; data: ContractorNotification[] }>('/notifications');
    return res.data.data;
  } catch (err) { throw normalizeError(err); }
}

export async function markContractorNotificationRead(id: string): Promise<void> {
  try {
    await contractorApi.post(`/notifications/${id}/read`);
  } catch (err) { throw normalizeError(err); }
}
