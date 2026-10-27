export interface ContractorOnboardingData {
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  nationality: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string;
  idType: 'passport' | 'drivers_license' | 'national_id' | '';
  idNumber: string;
  idFrontFile: File | null;
  idBackFile: File | null;
  selfieFile: File | null;
  paymentMethod: 'wise' | 'bank_transfer' | 'paypal' | '';
  wiseEmail: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  paypalEmail: string;
}

export const INITIAL_ONBOARDING: ContractorOnboardingData = {
  phone: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '',
  nationality: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  taxId: '',
  idType: '',
  idNumber: '',
  idFrontFile: null,
  idBackFile: null,
  selfieFile: null,
  paymentMethod: '',
  wiseEmail: '',
  bankName: '',
  accountNumber: '',
  routingNumber: '',
  swiftCode: '',
  paypalEmail: '',
};

export interface ContractorTokenInfo {
  workerId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleTitle: string;
  companyName: string;
  country: string;
  track: string;
  workerType: string;
  payRate: number;
  payCurrency: string;
  payFrequency: string;
  startDate: string;
  scopeOfWork: string;
  onboardingStep: number;
  accessToken?: string | null;
  refreshToken?: string | null;
  isExistingContractor?: boolean;
}

export interface ContractorContract {
  _id: string;
  workerName: string;
  companyName: string;
  roleTitle: string;
  payRate: number;
  payCurrency: string;
  payFrequency: string;
  startDate: string;
  endDate: string | null;
  scopeOfWork: string;
  status: string;
  workerSigned: boolean;
  companySigned: boolean;
  docusignEnvelopeId: string | null;
  signingUrl: string | null;
  pdfUrl: string | null;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'submitted' | 'approved' | 'paid' | 'disputed';

export interface ContractorInvoice {
  _id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  amountGross: number;
  currency: string;
  description: string;
  status: InvoiceStatus;
  submittedAt: string;
  approvedAt: string | null;
  paidAt: string | null;
  pdfUrl: string | null;
  disputeReason: string | null;
}

export interface SubmitInvoicePayload {
  periodStart: string;
  periodEnd: string;
  amountGross: number;
  description: string;
  hoursWorked?: number;
}

export type ContractorPage = 'dashboard' | 'projects' | 'invoices' | 'contract' | 'profile' | 'notifications';

export interface ContractorNotification {
  _id: string;
  type: 'contract_activated' | 'contract_pending' | 'general';
  title: string;
  message: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface ContractorPortfolioProject {
  title: string;
  description: string;
  imageUrl: string;
  projectLink: string;
  tags: string[];
}

export interface ContractorServicePackage {
  name: string;
  price: number;
  description: string;
  deliveryDays: number;
  revisions: number;
  features: string[];
}

export interface ContractorFaqItem {
  question: string;
  answer: string;
}

export interface ContractorProfile {
  workerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleTitle: string;
  companyName: string;
  status: string;
  kycStatus: string;
  payRate: number;
  payCurrency: string;
  payFrequency: string;
  skills: string[];
  marketplaceTitle: string;
  marketplaceBio: string;
  marketplaceAvailability: 'available_now' | 'this_week' | 'two_weeks' | 'next_month' | 'not_available';
  marketplaceAvailabilityLabel: string;
  marketplaceRate: number;
  city: string;
  country: string;
  responseTimeHours: number;
  languages: string[];
  profilePhotoUrl?: string;
  bannerImageUrl?: string;
  profileOverview: string;
  portfolioProjects: ContractorPortfolioProject[];
  servicePackages: ContractorServicePackage[];
  faqItems: ContractorFaqItem[];
  onboardingStep: number;
  dateOfBirth?: string;
  nationality?: string;
  addressLine1?: string;
  addressLine2?: string;
  state?: string;
  postalCode?: string;
  taxId?: string;
  idType?: 'passport' | 'drivers_license' | 'national_id' | '';
  idNumber?: string;
  paymentMethod?: 'wise' | 'bank_transfer' | 'paypal' | '';
  wiseEmail?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  paypalEmail?: string;
}
