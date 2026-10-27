import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'company_admin' | 'hr_manager' | 'finance' | 'viewer';
export type AuthProvider = 'local' | 'google';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string | null;
  phone: string | null;
  role: UserRole;
  provider: AuthProvider;
  googleId: string | null;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  refreshTokenHash: string | null;
  companyId: mongoose.Types.ObjectId | null;
  signupStep: number;               // 1–7 — tracks how far they got
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(plain: string): Promise<boolean>;
  getFullName(): string;
}

const userSchema = new Schema<IUser>(
  {
    firstName:                  { type: String, required: true, trim: true, maxlength: 50 },
    lastName:                   { type: String, required: true, trim: true, maxlength: 50 },
    email:                      { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:               { type: String, default: null },
    phone:                      { type: String, default: null },
    role:                       { type: String, enum: ['company_admin', 'hr_manager', 'finance', 'viewer'], default: 'company_admin' },
    provider:                   { type: String, enum: ['local', 'google'], default: 'local' },
    googleId:                   { type: String, default: null, sparse: true },
    isEmailVerified:            { type: Boolean, default: false },
    emailVerificationToken:     { type: String, default: null },
    emailVerificationExpires:   { type: Date,   default: null },
    passwordResetToken:         { type: String, default: null },
    passwordResetExpires:       { type: Date,   default: null },
    refreshTokenHash:           { type: String, default: null },
    companyId:                  { type: Schema.Types.ObjectId, ref: 'Company', default: null },
    signupStep:                 { type: Number, default: 1, min: 1, max: 7 },
    lastLoginAt:                { type: Date,   default: null },
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

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });

// ─── Methods ─────────────────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.getFullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

// ─── Pre-save hook (hash password if changed) ────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  // Only hash if it's a plain text password (not already hashed)
  if (this.passwordHash.startsWith('$2')) return next(); // already bcrypt
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);
