import mongoose, { Document, Schema } from 'mongoose';

export type WorkerStatus  = 'invited' | 'kyc_pending' | 'active' | 'inactive' | 'terminated';
export type WorkerTrack   = 'track_1_india' | 'track_2_us';
export type WorkerType    = 'contractor' | 'full_time_employee';
export type DechubService =
  | 'hrms'
  | 'payroll'
  | 'contracts_compliance'
  | 'it_management';

export interface IWorker extends Document {
  _id:              mongoose.Types.ObjectId;
  companyId:        mongoose.Types.ObjectId;
  firstName:        string;
  lastName:         string;
  email:            string;
  phone:            string | null;
  country:          string;
  track:            WorkerTrack;
  workerType:       WorkerType;
  roleTitle:        string;
  department:       string;
  kycStatus:        'pending' | 'approved' | 'rejected';
  status:           WorkerStatus;
  selectedServices: DechubService[];
  payRate:          number | null;
  payCurrency:      string;
  payFrequency:     'monthly' | 'biweekly' | 'hourly';
  startDate:        Date | null;
  endDate:          Date | null;
  noticePeriodDays: number;
  scopeOfWork:      string;
  contractId:       mongoose.Types.ObjectId | null;
  wiseAccountId:    string | null;
  bankAccount:      string | null;
  lastPaymentAt:    Date | null;
  inviteToken:      string | null;
  inviteSentAt:     Date | null;
  passwordHash:     string | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  refreshTokenHash: string | null;
  lastLoginAt:      Date | null;
  contractorProfile: {
    dateOfBirth: Date;
    nationality: string;
    marketplaceTitle?: string;
    marketplaceBio?: string;
    marketplaceAvailability?: 'available_now' | 'this_week' | 'two_weeks' | 'next_month' | 'not_available';
    marketplaceRate?: number | null;
    city?: string;
    address: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    taxId: string;
    skills: string[];
    responseTimeHours?: number;
    languages?: string[];
    profilePhotoUrl?: string;
    bannerImageUrl?: string;
    profileOverview?: string;
    portfolioProjects?: Array<{
      title: string;
      description: string;
      imageUrl: string;
      tags: string[];
    }>;
    servicePackages?: Array<{
      name: string;
      price: number;
      description: string;
      deliveryDays: number;
      revisions: number;
      features: string[];
    }>;
    faqItems?: Array<{
      question: string;
      answer: string;
    }>;
  } | null;
  kycData: {
    idType: string;
    idNumber: string;
    idFrontPath: string;
    idBackPath: string | null;
    selfiePath: string | null;
    submittedAt: Date;
  } | null;
  paymentDetails: {
    paymentMethod: 'wise' | 'bank_transfer' | 'paypal';
    wiseEmail?: string;
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
    paypalEmail?: string;
  } | null;
  createdAt:        Date;
  updatedAt:        Date;
}

const workerSchema = new Schema<IWorker>(
  {
    companyId:        { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    firstName:        { type: String, required: true, trim: true, maxlength: 50 },
    lastName:         { type: String, required: true, trim: true, maxlength: 50 },
    email:            { type: String, required: true, lowercase: true, trim: true },
    phone:            { type: String, default: null },
    country:          { type: String, required: true },
    track:            { type: String, enum: ['track_1_india', 'track_2_us'], required: true },
    workerType:       { type: String, enum: ['contractor', 'full_time_employee'], required: true },
    roleTitle:        { type: String, required: true, trim: true },
    department:       { type: String, default: '', trim: true },
    kycStatus:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    status:           { type: String, enum: ['invited', 'kyc_pending', 'active', 'inactive', 'terminated'], default: 'invited' },
    selectedServices: { type: [String], default: [] },
    payRate:          { type: Number, default: null },
    payCurrency:      { type: String, default: 'USD' },
    payFrequency:     { type: String, enum: ['monthly', 'biweekly', 'hourly'], default: 'monthly' },
    startDate:        { type: Date, default: null },
    endDate:          { type: Date, default: null },
    noticePeriodDays: { type: Number, default: 30 },
    scopeOfWork:      { type: String, default: '' },
    contractId:       { type: Schema.Types.ObjectId, ref: 'Contract', default: null },
    wiseAccountId:    { type: String, default: null },
    bankAccount:      { type: String, default: null },
    lastPaymentAt:    { type: Date, default: null },
    inviteToken:      { type: String, default: null },
    inviteSentAt:     { type: Date, default: null },
    passwordHash:     { type: String, default: null, select: false },
    passwordResetToken: { type: String, default: null, select: false },
    passwordResetExpires: { type: Date, default: null },
    refreshTokenHash: { type: String, default: null, select: false },
    lastLoginAt:      { type: Date, default: null },
    contractorProfile:{ type: Schema.Types.Mixed, default: null },
    kycData:          { type: Schema.Types.Mixed, default: null },
    paymentDetails:   { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

workerSchema.index({ companyId: 1, email: 1 }, { unique: true });
workerSchema.index({ status: 1 });
workerSchema.index({ inviteToken: 1 }, { sparse: true });
workerSchema.index({ passwordResetToken: 1 }, { sparse: true });

export const Worker = mongoose.model<IWorker>('Worker', workerSchema);
