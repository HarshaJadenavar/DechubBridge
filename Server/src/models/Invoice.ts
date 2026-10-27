import mongoose, { Document, Schema } from 'mongoose';

export type InvoiceStatus = 'draft' | 'submitted' | 'approved' | 'paid' | 'disputed';

export interface IInvoice extends Document {
  _id:           mongoose.Types.ObjectId;
  companyId:     mongoose.Types.ObjectId;
  workerId:      mongoose.Types.ObjectId;
  contractId:    mongoose.Types.ObjectId;
  workerName:    string;
  workerRole:    string;
  invoiceNumber: string;
  periodStart:   Date;
  periodEnd:     Date;
  amountGross:   number;
  currency:      string;
  description:   string;
  hoursWorked:   number | null;
  status:        InvoiceStatus;
  submittedAt:   Date;
  approvedAt:    Date | null;
  approvedBy:    mongoose.Types.ObjectId | null;
  paidAt:        Date | null;
  wiseTransferId:string | null;
  pdfUrl:        string | null;
  disputeReason: string | null;
  createdAt:     Date;
  updatedAt:     Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    companyId:      { type: Schema.Types.ObjectId, ref: 'Company',  required: true, index: true },
    workerId:       { type: Schema.Types.ObjectId, ref: 'Worker',   required: true, index: true },
    contractId:     { type: Schema.Types.ObjectId, ref: 'Contract', required: true },
    workerName:     { type: String, required: true },
    workerRole:     { type: String, required: true },
    invoiceNumber:  { type: String, required: true, unique: true },
    periodStart:    { type: Date, required: true },
    periodEnd:      { type: Date, required: true },
    amountGross:    { type: Number, required: true, min: 0 },
    currency:       { type: String, default: 'USD' },
    description:    { type: String, required: true },
    hoursWorked:    { type: Number, default: null },
    status:         { type: String, enum: ['draft','submitted','approved','paid','disputed'], default: 'submitted' },
    submittedAt:    { type: Date, default: Date.now },
    approvedAt:     { type: Date, default: null },
    approvedBy:     { type: Schema.Types.ObjectId, ref: 'User', default: null },
    paidAt:         { type: Date, default: null },
    wiseTransferId: { type: String, default: null },
    pdfUrl:         { type: String, default: null },
    disputeReason:  { type: String, default: null },
  },
  { timestamps: true },
);

invoiceSchema.index({ companyId: 1, status: 1 });
invoiceSchema.index({ workerId: 1, periodStart: 1 });

// ─── Auto-generate invoice number ─────────────────────────────────────────────

invoiceSchema.pre('validate', async function (next) {
  if (this.isNew && !this.invoiceNumber) {
    const count = await (this.constructor as typeof mongoose.Model).countDocuments({
      companyId: this.companyId,
    });
    const year = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
