import { api, ApiResponse, normalizeError, unwrapApiData } from './client';

export interface TalentRequestItem {
  _id: string;
  companyId: string | null;
  workerId: string | null;
  originalWorkerId?: string | null;
  suggestedWorkerId?: string | null;
  workerName: string;
  workerRole: string;
  workerProfileUrl?: string;
  talentProfile?: {
    location: string;
    availabilityLabel: string;
    profilePhotoUrl: string;
    phone: string;
    email: string;
    responseTimeHours: number | null;
    skills: string[];
    languages: string[];
    profileOverview: string;
    servicePackages: Array<{
      name: string;
      price: number;
      description: string;
      deliveryDays: number | null;
      revisions: number | null;
      features: string[];
    }>;
    portfolioProjects: Array<{
      title: string;
      description: string;
      imageUrl: string;
      tags: string[];
    }>;
  } | null;
  suggestedTalentProfile?: {
    workerId: string;
    workerName: string;
    workerRole: string;
    profilePhotoUrl: string;
    location: string;
    availabilityLabel: string;
  } | null;
  shortlistedTalentProfiles?: Array<{
    workerId: string;
    workerName: string;
    workerRole: string;
    profilePhotoUrl: string;
    location: string;
    availabilityLabel: string;
  }>;
  shortlistHistory?: Array<{
    sentAt: string;
    note: string;
    profiles: Array<{
      workerId: string;
      workerName: string;
      workerRole: string;
      profilePhotoUrl: string;
      location: string;
      availabilityLabel: string;
    }>;
  }>;
  companyName: string;
  companyWebsite?: string;
  contactFirstName: string;
  contactLastName: string;
  phoneNumber: string;
  email: string;
  projectType: string;
  budget: string;
  projectDescription: string;
  status: string;
  reviewNotes?: string;
  shortlistSentAt?: string | null;
  approvedAt?: string | null;
  reviewedAt?: string | null;
  hiredAt?: string | null;
  talentHiredAt?: string | null;
  unread: boolean;
  createdAt: string;
}

export interface AdminMarketplaceCandidateItem {
  workerId: string;
  name: string;
  role: string;
  location: string;
  country: string;
  availability: 'available_now' | 'this_week' | 'two_weeks' | 'next_month' | 'not_available';
  availabilityLabel: string;
  skills: string[];
  profilePhotoUrl: string;
  profileOverview: string;
  packagePrice: number;
  currency: string;
}

export async function listTalentRequests(params: Record<string, string | number | undefined> = {}) {
  try {
    const res = await api.get<ApiResponse<any>>('/admin/talent-requests', { params });
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getTalentRequest(id: string) {
  try {
    const res = await api.get<ApiResponse<TalentRequestItem>>(`/admin/talent-requests/${id}`);
    return unwrapApiData(res.data);
  } catch (err) { throw normalizeError(err); }
}

export async function unreadCount() {
  try {
    const res = await api.get<ApiResponse<{ unread: number }>>('/admin/talent-requests/unread-count');
    return unwrapApiData(res.data);
  } catch (err) { throw normalizeError(err); }
}

export async function updateTalentRequestStatus(
  id: string,
  payload: { status: string; suggestedWorkerId?: string; reviewNotes?: string },
) {
  try {
    const res = await api.patch<ApiResponse<any>>(`/admin/talent-requests/${id}/status`, payload);
    return unwrapApiData(res.data);
  } catch (err) { throw normalizeError(err); }
}

export async function markAsRead(id: string) {
  try {
    const res = await api.post<ApiResponse<any>>(`/admin/talent-requests/${id}/mark-as-read`);
    return unwrapApiData(res.data);
  } catch (err) { throw normalizeError(err); }
}

export async function sendTalentRequestShortlist(
  id: string,
  payload: { shortlistedWorkerIds: string[]; reviewNotes?: string },
) {
  try {
    const res = await api.post<ApiResponse<TalentRequestItem>>(`/admin/talent-requests/${id}/send-shortlist`, payload);
    return unwrapApiData(res.data);
  } catch (err) { throw normalizeError(err); }
}

export async function listMarketplaceCandidatesForAdmin(params: {
  requestId: string;
  q?: string;
  availability?: string;
  country?: string;
  page?: number;
  perPage?: number;
}) {
  try {
    const res = await api.get<ApiResponse<{
      total: number;
      page: number;
      perPage: number;
      items: AdminMarketplaceCandidateItem[];
      filters: {
        countries: string[];
      };
    }>>('/admin/marketplace-candidates', { params });
    return unwrapApiData(res.data);
  } catch (err) { throw normalizeError(err); }
}
