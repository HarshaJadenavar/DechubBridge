import { api, ApiResponse, normalizeError, unwrapApiData } from './client';
import type { AddWorkerFormData } from '../dashboard/types/dashboard.type';

export interface CompanyTalentProfileSummary {
  workerId: string;
  workerName: string;
  workerRole: string;
  profilePhotoUrl: string;
  location: string;
  availabilityLabel: string;
  email: string;
  country: string;
  track: string;
}

export interface PublicTalentRequestPayload {
  companyName: string;
  companyWebsite: string;
  projectType: string;
  projectDescription: string;
  contactName?: string;
  contactEmail?: string;
  phoneNumber?: string;
  requestedServices?: string[];
}

export interface TalentRequestSignupPrefill {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  companyName: string;
  companyWebsite: string;
}

export interface CompanyTalentRequestItem {
  _id: string;
  workerId: string | null;
  originalWorkerId?: string | null;
  suggestedWorkerId?: string | null;
  workerName: string;
  workerRole: string;
  workerProfileUrl?: string;
  companyName: string;
  companyWebsite?: string;
  projectType: string;
  projectDescription: string;
  status:
    | 'pending_review'
    | 'shortlisted_sent'
    | 'candidate_selected'
    | 'hire_started'
    | 'approved'
    | 'alternative_suggested'
    | 'rejected'
    | 'hired'
    | 'talent_hired';
  reviewNotes?: string;
  approvedAt?: string | null;
  reviewedAt?: string | null;
  hiredAt?: string | null;
  talentHiredAt?: string | null;
  createdAt: string;
  talentProfile: CompanyTalentProfileSummary | null;
  suggestedTalentProfile: CompanyTalentProfileSummary | null;
  shortlistedTalentProfiles?: CompanyTalentProfileSummary[];
  shortlistHistory?: Array<{
    sentAt: string;
    note: string;
    profiles: CompanyTalentProfileSummary[];
  }>;
}

export async function listCompanyTalentRequests(): Promise<CompanyTalentRequestItem[]> {
  try {
    const res = await api.get<ApiResponse<CompanyTalentRequestItem[]>>('/company/talent-requests');
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function createPublicTalentRequest(payload: PublicTalentRequestPayload): Promise<{
  id: string;
  status: string;
  createdAt: string;
}> {
  try {
    const res = await api.post<ApiResponse<{ id: string; status: string; createdAt: string }>>(
      '/workers/marketplace/talent-requests',
      payload,
    );
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getCompanyTalentRequest(id: string): Promise<CompanyTalentRequestItem> {
  try {
    const res = await api.get<ApiResponse<CompanyTalentRequestItem>>(`/company/talent-requests/${id}`);
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function acceptSuggestedTalent(id: string): Promise<CompanyTalentRequestItem> {
  try {
    const res = await api.post<ApiResponse<CompanyTalentRequestItem>>(`/company/talent-requests/${id}/accept-suggestion`);
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getTalentRequestHirePrefill(id: string): Promise<{
  talentRequestId: string;
  initialData: AddWorkerFormData;
}> {
  try {
    const res = await api.get<ApiResponse<{ talentRequestId: string; initialData: AddWorkerFormData }>>(
      `/company/talent-requests/${id}/hire-prefill`,
    );
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function claimShortlistedTalentRequest(
  id: string,
  payload: { token: string; workerId: string },
): Promise<CompanyTalentRequestItem> {
  try {
    const res = await api.post<ApiResponse<CompanyTalentRequestItem>>(`/company/talent-requests/${id}/claim-shortlist`, payload);
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function switchShortlistedTalentRequestProfile(
  id: string,
  payload: { workerId: string },
): Promise<CompanyTalentRequestItem> {
  try {
    const res = await api.post<ApiResponse<CompanyTalentRequestItem>>(
      `/company/talent-requests/${id}/switch-shortlist-profile`,
      payload,
    );
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getTalentRequestSignupPrefill(
  id: string,
  token: string,
): Promise<TalentRequestSignupPrefill> {
  try {
    const res = await api.get<ApiResponse<TalentRequestSignupPrefill>>(
      `/workers/marketplace/talent-requests/${id}/signup-prefill`,
      { params: { token } },
    );
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}
