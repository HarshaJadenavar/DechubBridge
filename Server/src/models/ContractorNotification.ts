import mongoose, { Document, Schema } from 'mongoose';

export type ContractorNotificationType = 'contract_activated' | 'contract_pending' | 'general';

export interface IContractorNotification extends Document {
  _id: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  type: ContractorNotificationType;
  title: string;
  message: string;
  actionUrl: string | null;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const contractorNotificationSchema = new Schema<IContractorNotification>(
  {
    workerId: { type: Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    type: { type: String, enum: ['contract_activated', 'contract_pending', 'general'], default: 'general' },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    actionUrl: { type: String, default: null, trim: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

contractorNotificationSchema.index({ workerId: 1, createdAt: -1 });
contractorNotificationSchema.index({ workerId: 1, readAt: 1, createdAt: -1 });

export const ContractorNotification = mongoose.model<IContractorNotification>(
  'ContractorNotification',
  contractorNotificationSchema,
);
