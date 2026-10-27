import axios from 'axios';
import { api, tokenStore, ApiResponse, normalizeError, unwrapApiData } from './client';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
  companyId: string | null;
  email: string;
  firstName: string;
  signupStep: number;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  workEmail: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

function storeAndReturn(data: AuthResult): AuthResult {
  tokenStore.set(data.accessToken, data.refreshToken);
  return data;
}

function isNotFoundError(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const body = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    workEmail: payload.workEmail,
    password: payload.password,
    phone: payload.phone,
  };

  try {
    try {
      const res = await api.post<ApiResponse<AuthResult>>('/auth/register', body);
      return storeAndReturn(unwrapApiData(res.data));
    } catch (err) {
      if (!isNotFoundError(err)) throw err;
      const fallbackRes = await api.post<ApiResponse<AuthResult>>('/company-auth/signup', body);
      return storeAndReturn(unwrapApiData(fallbackRes.data));
    }
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function verifyEmail(otp: string): Promise<void> {
  try {
    try {
      await api.post('/auth/verify-email', { otp });
    } catch (err) {
      if (!isNotFoundError(err)) throw err;
      await api.post('/company-auth/verify-email', { otp });
    }
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function resendOtp(): Promise<void> {
  try {
    try {
      await api.post('/auth/resend-otp');
    } catch (err) {
      if (!isNotFoundError(err)) throw err;
      await api.post('/company-auth/resend-otp');
    }
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  try {
    try {
      const res = await api.post<ApiResponse<AuthResult>>('/auth/login', payload);
      return storeAndReturn(unwrapApiData(res.data));
    } catch (err) {
      if (!isNotFoundError(err)) throw err;
      const fallbackRes = await api.post<ApiResponse<AuthResult>>('/company-auth/login', payload);
      return storeAndReturn(unwrapApiData(fallbackRes.data));
    }
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function logout(): Promise<void> {
  try {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      if (!isNotFoundError(err)) throw err;
      await api.post('/company-auth/logout');
    }
  } catch {
    // Ignore API errors on logout
  } finally {
    tokenStore.clear();
  }
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  try {
    try {
      const res = await api.get<ApiResponse<{ available: boolean }>>(
        '/auth/check-email',
        { params: { email } },
      );
      return unwrapApiData(res.data).available;
    } catch (err) {
      if (!isNotFoundError(err)) throw err;
      const fallbackRes = await api.get<ApiResponse<{ available: boolean }>>(
        '/company-auth/check-email',
        { params: { email } },
      );
      return unwrapApiData(fallbackRes.data).available;
    }
  } catch {
    return true;
  }
}

export function redirectToGoogle(intent: 'login' | 'signup' = 'signup'): void {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
  window.location.href = `${base}/api/auth/google?intent=${intent}`;
}

export function handleGoogleCallback(): { signupStep: number; accountStatus: 'existing' | 'new' } | null {
  const params = new URLSearchParams(window.location.search);
  const access = params.get('access_token');
  const refresh = params.get('refresh_token');
  const step = params.get('signup_step');
  const accountStatus = params.get('account_status');

  if (!access || !refresh) return null;

  tokenStore.set(access, refresh);
  window.history.replaceState({}, '', window.location.pathname);

  return {
    signupStep: Number(step ?? 1),
    accountStatus: accountStatus === 'existing' ? 'existing' : 'new',
  };
}
