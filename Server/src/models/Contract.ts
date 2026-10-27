import mongoose, { Document, Schema } from 'mongoose';

export type ContractStatus =
  | 'draft'
  | 'sent'
  | 'worker_signed'
  | 'company_signed'
  | 'active'
  | 'rejected'
  | 'terminated'
  | 'expired';

export interface IContract extends Document {
  _id:                  mongoose.Types.ObjectId;
  companyId:            mongoose.Types.ObjectId;
  workerId:             mongoose.Types.ObjectId;
  workerName:           string;
  workerEmail:          string;
  companyName:          string;
  roleTitle:            string;
  contractType:         'contractor' | 'full_time_employee';
  track:                'track_1_india' | 'track_2_us';
  payRate:              number;
  payCurrency:          string;
  payFrequency:         'monthly' | 'biweekly' | 'hourly';
  startDate:            Date;
  endDate:              Date | null;
  noticePeriodDays:     number;
  scopeOfWork:          string;
  ipAssignment:         boolean;
  nonCompete:           boolean;
  nonSolicitation:      boolean;
  confidentiality:      boolean;
  status:               ContractStatus;
  workerSigned:         boolean;
  workerSignedAt:       Date | null;
  companySigned:        boolean;
  companySignedAt:      Date | null;
  docusignEnvelopeId:   string | null;
  docusignStatus:       string | null;
  signingUrl:           string | null;
  pdfUrl:               string | null;
  pdfGeneratedAt:       Date | null;
  terminatedAt:         Date | null;
  terminationReason:    string | null;
  createdAt:            Date;
  updatedAt:            Date;
}

const contractSchema = new Schema<IContract>(
  {
    companyId:          { type: Schema.Types.ObjectId, ref: 'Company',  required: true, index: true },
    workerId:           { type: Schema.Types.ObjectId, ref: 'Worker',   required: true },
    workerName:         { type: String, required: true },
    workerEmail:        { type: String, required: true, lowercase: true },
    companyName:        { type: String, required: true },
    roleTitle:          { type: String, required: true },
    contractType:       { type: String, enum: ['contractor', 'full_time_employee'], required: true },
    track:              { type: String, enum: ['track_1_india', 'track_2_us'], required: true },
    payRate:            { type: Number, required: true },
    payCurrency:        { type: String, default: 'USD' },
    payFrequency:       { type: String, enum: ['monthly', 'biweekly', 'hourly'], default: 'monthly' },
    startDate:          { type: Date, required: true },
    endDate:            { type: Date, default: null },
    noticePeriodDays:   { type: Number, default: 30 },
    scopeOfWork:        { type: String, default: '' },
    ipAssignment:       { type: Boolean, default: true },
    nonCompete:         { type: Boolean, default: false },
    nonSolicitation:    { type: Boolean, default: false },
    confidentiality:    { type: Boolean, default: true },
    status:             { type: String, enum: ['draft','sent','worker_signed','company_signed','active','rejected','terminated','expired'], default: 'draft' },
    workerSigned:       { type: Boolean, default: false },
    workerSignedAt:     { type: Date, default: null },
    companySigned:      { type: Boolean, default: false },
    companySignedAt:    { type: Date, default: null },
    docusignEnvelopeId: { type: String, default: null },
    docusignStatus:     { type: String, default: null },
    signingUrl:         { type: String, default: null },
    pdfUrl:             { type: String, default: null },
    pdfGeneratedAt:     { type: Date, default: null },
    terminatedAt:       { type: Date, default: null },
    terminationReason:  { type: String, default: null },
  },
  { timestamps: true },
);

contractSchema.index({ companyId: 1, status: 1 });
contractSchema.index({ workerId: 1 }, { unique: true });
contractSchema.index({ docusignEnvelopeId: 1 }, { sparse: true });

export const Contract = mongoose.model<IContract>('Contract', contractSchema);
