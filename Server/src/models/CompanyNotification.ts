import mongoose, { Document, Schema } from 'mongoose';

export interface ICompanyNotification extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId | null;
  type: 'project_contract' | 'project_active' | 'task_completed' | 'payment_received' | 'project_completed' | 'general';
  title: string;
  message: string;
  actionUrl: string | null;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const companyNotificationSchema = new Schema<ICompanyNotification>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
    type: { type: String, enum: ['project_contract', 'project_active', 'task_completed', 'payment_received', 'project_completed', 'general'], default: 'general' },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    message: { type: String, required: true, trim: true, maxlength: 1200 },
    actionUrl: { type: String, default: null, trim: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

companyNotificationSchema.index({ companyId: 1, readAt: 1, createdAt: -1 });

export const CompanyNotification = mongoose.model<ICompanyNotification>('CompanyNotification', companyNotificationSchema);
