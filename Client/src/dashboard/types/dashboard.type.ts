// ─── Core enums ───────────────────────────────────────────────────────────────

export type WorkerStatus  = 'invited' | 'kyc_pending' | 'active' | 'inactive' | 'terminated';
export type ContractStatus= 'draft' | 'sent' | 'company_signed' | 'worker_signed' | 'active' | 'rejected' | 'terminated';
export type InvoiceStatus = 'draft' | 'submitted' | 'approved' | 'paid' | 'disputed';
export type Track         = 'track_1_india' | 'track_2_us';
export type WorkerType    = 'contractor' | 'full_time_employee';
export type PayFrequency  = 'monthly' | 'biweekly' | 'hourly';
export type DashboardPage =
  | 'home'
  | 'marketplace'
  | 'projects'
  | 'workers'
  | 'hiring'
  | 'contracts'
  | 'payroll'
  | 'invoices'
  | 'documents'
  | 'settings';

// ─── Dechub service IDs ───────────────────────────────────────────────────────

export type DechubService =
  | 'hrms'
  | 'payroll'
  | 'contracts_compliance'
  | 'it_management';

export interface ServiceConfig {
  id:           DechubService;
  name:         string;
  desc:         string;
  icon:         string;
  required:     boolean;
  defaultOn:    boolean;
  tier:         'core' | 'recommended' | 'optional';
  priceLabel?:  string;
  comingSoon?:  boolean;
}

// ─── Domain models ────────────────────────────────────────────────────────────

export interface Worker {
  _id:              string;
  companyId:        string;
  firstName:        string;
  lastName:         string;
  email:            string;
  phone:            string | null;
  country:          string;
  track:            Track;
  workerType:       WorkerType;
  roleTitle:        string;
  department:       string;
  kycStatus:        'pending' | 'approved' | 'rejected';
  status:           WorkerStatus;
  selectedServices: DechubService[];
  payRate:          number | null;
  payCurrency:      string;
  contractId:       string | null;
  lastPaymentAt:    string | null;
  createdAt:        string;
}

export interface Contract {
  _id:               string;
  workerId:          string;
  workerName:        string;
  workerRole:        string;
  contractType:      'contractor' | 'employment' | 'internship';
  track:             'track_1' | 'track_2';
  payRate:           number;
  payCurrency:       string;
  payFrequency:      PayFrequency;
  startDate:         string;
  endDate:           string | null;
  noticePeriodDays:  number;
  scopeOfWork:       string;
  status:            ContractStatus;
  pdfUrl:            string | null;
  companySigned:     boolean;
  workerSigned:      boolean;
  createdAt:         string;
}

export interface Invoice {
  _id:          string;
  workerId:     string;
  workerName:   string;
  workerRole:   string;
  invoiceNumber:string;
  periodStart:  string;
  periodEnd:    string;
  amountGross:  number;
  currency:     string;
  status:       InvoiceStatus;
  submittedAt:  string;
  approvedAt:   string | null;
  paidAt:       string | null;
  pdfUrl:       string | null;
}

export interface Document {
  _id:          string;
  workerId:     string | null;
  workerName:   string | null;
  documentType: 'contract' | 'invoice' | 'payslip' | 'kyc_id' | 'incorporation_cert' | 'completion_cert' | 'w8ben';
  fileName:     string;
  s3Url:        string;
  uploadedAt:   string;
}

export interface DashboardStats {
  activeWorkers:    number;
  pendingInvoices:  number;
  nextPayrollDate:  string | null;
  monthlyTotalCost: number;
  currency:         string;
  pendingKyc:       number;
  contractsExpiring:number;
}

// ─── Add worker multi-step form ───────────────────────────────────────────────

export interface AddWorkerFormData {
  // Step 1 — worker type
  workerType: WorkerType | '';
  track:      Track | '';

  // Step 2 — worker details
  firstName:  string;
  lastName:   string;
  email:      string;
  roleTitle:  string;
  country:    string;
  department: string;

  // Step 3 — services
  selectedServices: DechubService[];

  // Step 4 — contract terms
  payRate:           string;
  payCurrency:       string;
  payFrequency:      PayFrequency;
  startDate:         string;
  endDate:           string;
  noticePeriodDays:  string;
  scopeOfWork:       string;
}

export const INITIAL_ADD_WORKER: AddWorkerFormData = {
  workerType: '',
  track:      '',
  firstName:  '',
  lastName:   '',
  email:      '',
  roleTitle:  '',
  country:    '',
  department: '',
  selectedServices: [
    'hrms',
    'payroll',
    'contracts_compliance',
    'it_management',
  ],
  payRate:          '',
  payCurrency:      'USD',
  payFrequency:     'monthly',
  startDate:        '',
  endDate:          '',
  noticePeriodDays: '30',
  scopeOfWork:      '',
};

// ─── Service catalogue ────────────────────────────────────────────────────────

export const DECHUB_SERVICES: ServiceConfig[] = [
  {
    id:        'hrms',
    name:      'HRMS',
    desc:      'Manage employee records, leave requests, attendance, and everyday HR workflows.',
    icon:      '👥',
    required:  false,
    defaultOn: true,
    tier:      'recommended',
  },
  {
    id:        'payroll',
    name:      'Payroll',
    desc:      'Run payroll, generate payslips, and manage payroll-related compliance in one place.',
    icon:      '💳',
    required:  false,
    defaultOn: true,
    tier:      'recommended',
  },
  {
    id:        'contracts_compliance',
    name:      'Contracts & Compliance',
    desc:      'Create and store worker contracts, manage required documents, and maintain compliance records.',
    icon:      '📄',
    required:  false,
    defaultOn: true,
    tier:      'recommended',
  },
  {
    id:        'it_management',
    name:      'IT Management',
    desc:      'Manage employee devices, system access, and IT support from a central workspace.',
    icon:      '💻',
    required:  false,
    defaultOn: true,
    tier:      'recommended',
  },
];
