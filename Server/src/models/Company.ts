import mongoose, { Document, Schema } from 'mongoose';

export type KybStatus  = 'pending' | 'verifying' | 'approved' | 'rejected';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export interface IKybDocument {
  docType:    string;       // 'incorporation_cert' | 'tax_id' | 'owner_id' | 'proof_of_address'
  fileName:   string;
  mimeType:   string;
  sizeBytes:  number;
  storagePath:string;       // relative path under uploads/
  uploadedAt: Date;
}

export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;

  // ── Step 2: Company Identity ──────────────────────────────────────────────
  companyName:    string | null;
  companyCountry: string | null;
  companyType:    string | null;   // LLC | Corp | Pvt Ltd | Sole Trader | Partnership
  taxId:          string | null;

  // ── Step 3: Business Details ──────────────────────────────────────────────
  companySize:     CompanySize | null;
  companyIndustry: string | null;
  companyWebsite:  string | null;
  addressLine1:    string | null;
  addressCity:     string | null;
  addressZip:      string | null;
  referralSource:  string | null;

  // ── Step 4: KYB ───────────────────────────────────────────────────────────
  kybStatus:   KybStatus;
  kybDocuments:IKybDocument[];
  kybSubmittedAt: Date | null;
  kybApprovedAt:  Date | null;

  // ── Step 5: Billing ───────────────────────────────────────────────────────
  billCurrency:      string;
  billingEmail:      string | null;
  paymentProvider:   'dummy' | 'stripe';
  paymentReference:  string | null;
  stripeCustomerId:  string | null;
  stripePaymentMethodId: string | null;   // stored after Stripe setup intent
  billingSetupAt:    Date | null;

  // ── Step 6: Preferences ───────────────────────────────────────────────────
  payCycle:         string | null;
  contractCurrency: string | null;
  companyTimezone:  string | null;
  hrEmail:          string | null;
  notif1: boolean;
  notif2: boolean;
  notif3: boolean;
  notif4: boolean;

  // ── Meta ─────────────────────────────────────────────────────────────────
  signupCompleted: boolean;
  signupCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const kybDocumentSchema = new Schema<IKybDocument>({
  docType:     { type: String, required: true },
  fileName:    { type: String, required: true },
  mimeType:    { type: String, required: true },
  sizeBytes:   { type: Number, required: true },
  storagePath: { type: String, required: true },
  uploadedAt:  { type: Date,   default: Date.now },
}, { _id: false });

const companySchema = new Schema<ICompany>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'CompanyAuth', required: true },

    // Step 2
    companyName:    { type: String, default: null, trim: true },
    companyCountry: { type: String, default: null },
    companyType:    { type: String, default: null },
    taxId:          { type: String, default: null },

    // Step 3
    companySize:     { type: String, default: null },
    companyIndustry: { type: String, default: null },
    companyWebsite:  { type: String, default: null },
    addressLine1:    { type: String, default: null },
    addressCity:     { type: String, default: null },
    addressZip:      { type: String, default: null },
    referralSource:  { type: String, default: null },

    // Step 4
    kybStatus:      { type: String, enum: ['pending', 'verifying', 'approved', 'rejected'], default: 'pending' },
    kybDocuments:   { type: [kybDocumentSchema], default: [] },
    kybSubmittedAt: { type: Date, default: null },
    kybApprovedAt:  { type: Date, default: null },

    // Step 5
    billCurrency:           { type: String, default: 'USD' },
    billingEmail:           { type: String, default: null },
    paymentProvider:        { type: String, enum: ['dummy', 'stripe'], default: 'dummy' },
    paymentReference:       { type: String, default: null },
    stripeCustomerId:       { type: String, default: null },
    stripePaymentMethodId:  { type: String, default: null },
    billingSetupAt:         { type: Date,   default: null },

    // Step 6
    payCycle:         { type: String, default: null },
    contractCurrency: { type: String, default: 'USD' },
    companyTimezone:  { type: String, default: null },
    hrEmail:          { type: String, default: null },
    notif1: { type: Boolean, default: true },
    notif2: { type: Boolean, default: true },
    notif3: { type: Boolean, default: true },
    notif4: { type: Boolean, default: true },

    // Meta
    signupCompleted:   { type: Boolean, default: false },
    signupCompletedAt: { type: Date,    default: null },
  },
  { timestamps: true },
);

companySchema.index({ ownerId: 1 });
companySchema.index({ kybStatus: 1 });
companySchema.index({ stripeCustomerId: 1 }, { sparse: true });

export const Company = mongoose.model<ICompany>('Company', companySchema);
