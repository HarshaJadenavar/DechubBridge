import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type CompanyUserRole = 'company_admin' | 'hr_manager' | 'finance' | 'viewer';
export type CompanyAuthProvider = 'local' | 'google';

export interface ICompanyAuth extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string | null;
  phone: string | null;
  role: CompanyUserRole;
  provider: CompanyAuthProvider;
  googleId: string | null;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  refreshTokenHash: string | null;
  companyId: mongoose.Types.ObjectId | null;
  signupStep: number;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(plain: string): Promise<boolean>;
  getFullName(): string;
}

const companyAuthSchema = new Schema<ICompanyAuth>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    phone: { type: String, default: null },
    role: { type: String, enum: ['company_admin', 'hr_manager', 'finance', 'viewer'], default: 'company_admin' },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, default: null, sparse: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    refreshTokenHash: { type: String, default: null },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', default: null },
    signupStep: { type: Number, default: 1, min: 1, max: 7 },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        const sanitized = ret as Record<string, unknown>;
        delete sanitized.passwordHash;
        delete sanitized.refreshTokenHash;
        delete sanitized.emailVerificationToken;
        delete sanitized.passwordResetToken;
        return ret;
      },
    },
  },
);

companyAuthSchema.index({ emailVerificationToken: 1 }, { sparse: true });

companyAuthSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

companyAuthSchema.methods.getFullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

companyAuthSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  if (this.passwordHash.startsWith('$2')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

export const CompanyAuth = mongoose.model<ICompanyAuth>(
  'CompanyAuth',
  companyAuthSchema,
  'company_auth_accounts',
);
