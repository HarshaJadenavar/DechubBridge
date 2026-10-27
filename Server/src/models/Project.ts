import mongoose, { Document, Schema } from 'mongoose';

export type ProjectStatus =
  | 'draft'
  | 'contract_sent'
  | 'active'
  | 'payment_submitted'
  | 'completed'
  | 'cancelled';

export interface IProjectTeamMember {
  workerId: mongoose.Types.ObjectId;
  role: string;
}

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  talentRequestId: mongoose.Types.ObjectId | null;
  title: string;
  description: string;
  scope: string;
  budget: number;
  currency: 'USD' | 'INR' | 'AED';
  paymentTerms: string;
  startDate: Date | null;
  targetEndDate: Date | null;
  deliverables: string[];
  teamMembers: IProjectTeamMember[];
  status: ProjectStatus;
  contractSentAt: Date | null;
  clientAcceptedAt: Date | null;
  clientAcceptedBy: string | null;
  paymentReference: string | null;
  paymentProofUrl: string | null;
  paymentSubmittedAt: Date | null;
  paymentVerifiedAt: Date | null;
  paymentVerifiedBy: string | null;
  completedAt: Date | null;
  createdByAdminEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectTeamMemberSchema = new Schema<IProjectTeamMember>(
  {
    workerId: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
    role: { type: String, required: true, trim: true, maxlength: 120 },
  },
  { _id: false },
);

const projectSchema = new Schema<IProject>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    talentRequestId: { type: Schema.Types.ObjectId, ref: 'TalentRequest', default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    scope: { type: String, required: true, trim: true, maxlength: 5000 },
    budget: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['USD', 'INR', 'AED'], default: 'USD' },
    paymentTerms: { type: String, required: true, trim: true, maxlength: 1200 },
    startDate: { type: Date, default: null },
    targetEndDate: { type: Date, default: null },
    deliverables: [{ type: String, trim: true, maxlength: 600 }],
    teamMembers: { type: [projectTeamMemberSchema], validate: [(value: IProjectTeamMember[]) => value.length > 0, 'At least one team member is required'] },
    status: { type: String, enum: ['draft', 'contract_sent', 'active', 'payment_submitted', 'completed', 'cancelled'], default: 'draft', index: true },
    contractSentAt: { type: Date, default: null },
    clientAcceptedAt: { type: Date, default: null },
    clientAcceptedBy: { type: String, default: null, trim: true },
    paymentReference: { type: String, default: null, trim: true, maxlength: 240 },
    paymentProofUrl: { type: String, default: null, trim: true, maxlength: 1000 },
    paymentSubmittedAt: { type: Date, default: null },
    paymentVerifiedAt: { type: Date, default: null },
    paymentVerifiedBy: { type: String, default: null, trim: true },
    completedAt: { type: Date, default: null },
    createdByAdminEmail: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true },
);

projectSchema.index({ companyId: 1, status: 1, createdAt: -1 });
projectSchema.index({ 'teamMembers.workerId': 1, status: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
