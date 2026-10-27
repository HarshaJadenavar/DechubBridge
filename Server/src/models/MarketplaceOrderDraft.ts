import mongoose, { Document, Schema } from 'mongoose';

export interface IMarketplaceOrderDraft extends Document {
  _id: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId | null;
  orderNumber: string;
  workerName: string;
  workerRole: string;
  packageSnapshot: {
    name: string;
    price: number;
    description: string;
    deliveryDays: number;
    revisions: number;
    features: string[];
  };
  clientDetails: {
    companyName: string;
    companyWebsite: string;
    projectType: string;
    budget: string;
    projectDescription: string;
  };
  status: 'draft' | 'pending_payment';
  paymentStatus: 'pending' | 'paid';
  source: 'marketplace_consultation';
  createdAt: Date;
  updatedAt: Date;
}

const marketplaceOrderDraftSchema = new Schema<IMarketplaceOrderDraft>(
  {
    workerId: { type: Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', default: null, index: true },
    orderNumber: { type: String, required: true, unique: true, trim: true },
    workerName: { type: String, required: true, trim: true },
    workerRole: { type: String, required: true, trim: true },
    packageSnapshot: { type: Schema.Types.Mixed, required: true },
    clientDetails: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['draft', 'pending_payment'], default: 'draft' },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    source: { type: String, enum: ['marketplace_consultation'], default: 'marketplace_consultation' },
  },
  { timestamps: true },
);

marketplaceOrderDraftSchema.index({ workerId: 1, createdAt: -1 });
marketplaceOrderDraftSchema.index({ 'clientDetails.companyName': 1, createdAt: -1 });

export const MarketplaceOrderDraft = mongoose.model<IMarketplaceOrderDraft>(
  'MarketplaceOrderDraft',
  marketplaceOrderDraftSchema,
);
