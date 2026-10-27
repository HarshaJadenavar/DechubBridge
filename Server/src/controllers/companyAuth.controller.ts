import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { CompanyAuth } from '../models/CompanyAuth';
import { Worker } from '../models/Worker';
import { Company } from '../models/Company';
import { TalentRequest } from '../models/TalentRequest';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  compareToken,
} from '../utils/jwt';
import { sendVerificationEmail } from '../utils/email';
import { ok, created, AppError, Errors, ValidationError } from '../utils/response';
import { logger } from '../utils/logger';

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'protonmail.com', 'aol.com', 'live.com',
]);

function isWorkEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return !!domain && !FREE_EMAIL_DOMAINS.has(domain);
}

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// A Book a Demo lead is created before the client has an account. Link only
// unassigned leads for this exact email once the client account exists.
async function linkBookDemoRequestsToCompany(email: string, companyId: unknown): Promise<void> {
  if (!companyId) return;

  await TalentRequest.updateMany(
    { companyId: null, email: email.trim().toLowerCase() },
    { $set: { companyId } },
  );
}

function buildTokenPair(account: InstanceType<typeof CompanyAuth>): {
  accessToken: string;
  refreshToken: string;
} {
  const companyId = account.companyId?.toString() ?? null;
  return {
    accessToken: signAccessToken({
      sub: account._id.toString(),
      email: account.email,
      role: account.role,
      companyId,
      signupStep: account.signupStep,
    }),
    refreshToken: signRefreshToken({ sub: account._id.toString() }),
  };
}

async function createAndStoreOtp(account: InstanceType<typeof CompanyAuth>): Promise<string> {
  const otp = generateOtp();
  account.emailVerificationToken = await bcrypt.hash(otp, 10);
  account.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
  await account.save();
  return otp;
}

const companySignupSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  workEmail: z.string().email().refine(isWorkEmail, {
    message: 'Use your company email address',
  }),
  password: z.string().min(8),
  phone: z.string()
    .trim()
    .min(7)
    .max(20)
    .regex(/^[+\d][\d\s()-]{6,19}$/, 'Enter a valid phone number'),
});

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = companySignupSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        if (!fields[key]) {
          fields[key] = issue.message;
        }
      }
      throw new ValidationError(fields);
    }

    const { firstName, lastName, workEmail, password, phone } = parsed.data;
    const normalizedEmail = workEmail.trim().toLowerCase();

    const [existingCompanyAccount, existingWorker] = await Promise.all([
      CompanyAuth.findOne({ email: normalizedEmail }),
      Worker.findOne({ email: normalizedEmail }),
    ]);

    if (existingCompanyAccount) throw Errors.EmailExists();
    if (existingWorker) {
      throw new AppError(
        'This email is already being used for a contractor account. Please use a different company email.',
        409,
        'EMAIL_ALREADY_IN_USE',
      );
    }

    const account = await CompanyAuth.create({
      firstName,
      lastName,
      email: normalizedEmail,
      passwordHash: password,
      phone: phone ?? null,
      provider: 'local',
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      signupStep: 1,
    });

    const company = await Company.create({ ownerId: account._id });
    account.companyId = company._id;

    const { accessToken, refreshToken } = buildTokenPair(account);
    account.refreshTokenHash = await hashToken(refreshToken);
    await account.save();
    await linkBookDemoRequestsToCompany(account.email, company._id);

    logger.info(`Company account registered: ${account.email}`);
    created(res, {
      accessToken,
      refreshToken,
      userId: account._id,
      companyId: company._id,
      email: account.email,
      firstName: account.firstName,
      signupStep: account.signupStep,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }).parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();

    const account = await CompanyAuth.findOne({ email: normalizedEmail });
    if (!account || account.provider !== 'local') throw Errors.InvalidCredentials();
    if (!await account.comparePassword(password)) throw Errors.InvalidCredentials();

    // Repair links for accounts created before this automatic matching existed.
    await linkBookDemoRequestsToCompany(account.email, account.companyId);

    account.lastLoginAt = new Date();
    const { accessToken, refreshToken } = buildTokenPair(account);
    account.refreshTokenHash = await hashToken(refreshToken);
    await account.save();

    ok(res, {
      accessToken,
      refreshToken,
      userId: account._id,
      companyId: account.companyId,
      email: account.email,
      firstName: account.firstName,
      signupStep: account.signupStep,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const payload = verifyRefreshToken(refreshToken);
    const account = await CompanyAuth.findById(payload.sub);
    if (!account || !account.refreshTokenHash) throw Errors.InvalidToken();
    if (!await compareToken(refreshToken, account.refreshTokenHash)) throw Errors.InvalidToken();

    const { accessToken, refreshToken: newRefresh } = buildTokenPair(account);
    account.refreshTokenHash = await hashToken(newRefresh);
    await account.save();

    ok(res, { accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await CompanyAuth.findByIdAndUpdate(req.user!.sub, { refreshTokenHash: null });
    ok(res, { message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function checkEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const email = z.string().email().parse(req.query.email);
    const normalizedEmail = email.trim().toLowerCase();
    const [companyAccountExists, workerExists] = await Promise.all([
      CompanyAuth.exists({ email: normalizedEmail }),
      Worker.exists({ email: normalizedEmail }),
    ]);
    ok(res, { available: !(companyAccountExists || workerExists) });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { otp } = z.object({ otp: z.string().length(6) }).parse(req.body);
    const account = await CompanyAuth.findById(req.user!.sub);
    if (!account) throw Errors.NotFound('Company account');
    if (account.isEmailVerified) {
      ok(res, { message: 'Already verified' });
      return;
    }
    if (!account.emailVerificationToken || !account.emailVerificationExpires) {
      throw Errors.InvalidToken();
    }
    if (new Date() > account.emailVerificationExpires) {
      throw new AppError('OTP expired. Request a new one.', 401, 'OTP_EXPIRED');
    }

    const isValid = await bcrypt.compare(otp, account.emailVerificationToken);
    if (!isValid) throw new AppError('Incorrect OTP', 401, 'INVALID_OTP');

    account.isEmailVerified = true;
    account.emailVerificationToken = null;
    account.emailVerificationExpires = null;
    await account.save();

    ok(res, { message: 'Email verified' });
  } catch (err) {
    next(err);
  }
}

export async function resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const account = await CompanyAuth.findById(req.user!.sub);
    if (!account) throw Errors.NotFound('Company account');
    if (account.isEmailVerified) {
      ok(res, { message: 'Already verified' });
      return;
    }

    const otp = await createAndStoreOtp(account);
    await sendVerificationEmail(account.email, account.firstName, otp);
    ok(res, { message: 'OTP resent' });
  } catch (err) {
    next(err);
  }
}
