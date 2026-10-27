import { api, normalizeError, ApiResponse, unwrapApiData } from '../../api/client';
import type {
  Worker,
  Contract,
  Invoice,
  Document,
  DashboardStats,
  AddWorkerFormData,
} from '../types/dashboard.type';

// ─── Stats ─────────────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const res = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

// ─── Workers ───────────────────────────────────────────────────────────────────

export async function getWorkers(): Promise<Worker[]> {
  try {
    const res = await api.get<ApiResponse<Worker[]>>('/workers');
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getWorker(id: string): Promise<Worker> {
  try {
    const res = await api.get<ApiResponse<Worker>>(`/workers/${id}`);
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export interface InviteWorkerPayload {
  workerType:       string;
  track:            string;
  firstName:        string;
  lastName:         string;
  email:            string;
  roleTitle:        string;
  country:          string;
  department:       string;
  selectedServices: string[];
  payRate:          number;
  payCurrency:      string;
  payFrequency:     string;
  startDate:        string;
  endDate?:         string;
  noticePeriodDays: number;
  scopeOfWork:      string;
  talentRequestId?: string;
}

export async function inviteWorker(data: AddWorkerFormData, talentRequestId?: string): Promise<Worker> {
  try {
    const payload: InviteWorkerPayload = {
      workerType:       data.workerType,
      track:            data.track,
      firstName:        data.firstName,
      lastName:         data.lastName,
      email:            data.email,
      roleTitle:        data.roleTitle,
      country:          data.country,
      department:       data.department,
      selectedServices: data.selectedServices,
      payRate:          Number(data.payRate),
      payCurrency:      data.payCurrency,
      payFrequency:     data.payFrequency,
      startDate:        data.startDate,
      endDate:          data.endDate || undefined,
      noticePeriodDays: Number(data.noticePeriodDays),
      scopeOfWork:      data.scopeOfWork,
      talentRequestId,
    };
    const res = await api.post<ApiResponse<Worker>>('/workers', payload);
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function terminateWorker(id: string): Promise<void> {
  try {
    await api.post(`/workers/${id}/terminate`);
  } catch (err) {
    throw normalizeError(err);
  }
}

// ─── Contracts ─────────────────────────────────────────────────────────────────

export async function getContracts(): Promise<Contract[]> {
  try {
    const res = await api.get<ApiResponse<Contract[]>>('/contracts');
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function resendContractSignature(contractId: string): Promise<void> {
  try {
    await api.post(`/contracts/${contractId}/resend`);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function countersignContract(contractId: string): Promise<Contract> {
  try {
    const res = await api.post<ApiResponse<Contract>>(`/contracts/${contractId}/countersign`);
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

// ─── Invoices ──────────────────────────────────────────────────────────────────

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const res = await api.get<ApiResponse<Invoice[]>>('/invoices');
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function approveInvoice(id: string): Promise<Invoice> {
  try {
    const res = await api.post<ApiResponse<Invoice>>(`/invoices/${id}/approve`);
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function disputeInvoice(id: string, reason: string): Promise<Invoice> {
  try {
    const res = await api.post<ApiResponse<Invoice>>(`/invoices/${id}/dispute`, { reason });
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

// ─── Documents ─────────────────────────────────────────────────────────────────

export async function getDocuments(): Promise<Document[]> {
  try {
    const res = await api.get<ApiResponse<Document[]>>('/documents');
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}
