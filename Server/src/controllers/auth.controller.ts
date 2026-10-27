import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { google } from 'googleapis';
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
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../utils/email';
import {
  ok,
  created,
  AppError,
  Errors,
  ValidationError,
} from '../utils/response';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { z } from 'zod';

// ─── Google OAuth client ─────────────────────────────────────────────────────

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_CALLBACK_URL,
);

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com','yahoo.com','hotmail.com','outlook.com',
  'icloud.com','protonmail.com','aol.com','live.com',
]);

function isWorkEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return !!domain && !FREE_EMAIL_DOMAINS.has(domain);
}

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function getGoogleProfileNames(profile: {
  given_name?: string | null;
  family_name?: string | null;
  name?: string | null;
}): { firstName: string; lastName: string } {
  const firstName = profile.given_name?.trim()
    || profile.name?.trim().split(/\s+/)[0]
    || 'User';

  const remainingName = profile.name?.trim()
    .split(/\s+/)
    .slice(1)
    .join(' ');

  const lastName = profile.family_name?.trim()
    || remainingName
    || 'Account';

  return { firstName, lastName };
}

function buildTokenPair(user: InstanceType<typeof CompanyAuth>): {
  accessToken: string;
  refreshToken: string;
} {
  const companyId = user.companyId?.toString() ?? null;
  return {
    accessToken: signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId,
      signupStep: user.signupStep,
    }),
    refreshToken: signRefreshToken({ sub: user._id.toString() }),
  };
}

async function ensureCompanyForUser(user: InstanceType<typeof CompanyAuth>): Promise<void> {
  if (user.companyId) {
    const existingCompany = await Company.findById(user.companyId);
    if (existingCompany) {
      return;
    }
  }

  let company = await Company.findOne({ ownerId: user._id });
  if (!company) {
    company = await Company.create({ ownerId: user._id });
  }

  if (!user.companyId || user.companyId.toString() !== company._id.toString()) {
    user.companyId = company._id;
    await user.save();
  }
}

async function linkBookDemoRequestsToCompany(email: string, companyId: unknown): Promise<void> {
  if (!companyId) return;
  await TalentRequest.updateMany(
    { companyId: null, email: email.trim().toLowerCase() },
    { $set: { companyId } },
  );
}

// ─── Controllers ─────────────────────────────────────────────────────────────

const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName:  z.string().min(2).max(50),
  workEmail: z.string().email().refine(isWorkEmail, {
    message: 'Use your company email address',
  }),
  password:  z.string().min(8),
  phone:     z.string().min(7).max(20).optional(),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
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

    const existing = await CompanyAuth.findOne({ email: normalizedEmail });
    if (existing) throw Errors.EmailExists();
    const existingWorker = await Worker.findOne({ email: normalizedEmail });
    if (existingWorker) {
      throw new AppError(
        'This email is already being used for a contractor account. Please use a different company email.',
        409,
        'EMAIL_ALREADY_IN_USE',
      );
    }

    const user = await CompanyAuth.create({
      firstName,
      lastName,
      email:                    normalizedEmail,
      passwordHash:             password,   // pre-save hook will hash it
      phone:                    phone ?? null,
      provider:                 'local',
      isEmailVerified:          true,
      emailVerificationToken:   null,
      emailVerificationExpires: null,
      signupStep:               1,
    });

    // Create empty company stub
    const company = await Company.create({ ownerId: user._id });
    user.companyId = company._id;
    await user.save();
    await linkBookDemoRequestsToCompany(user.email, company._id);

    const { accessToken, refreshToken } = buildTokenPair(user);
    const refreshHash = await hashToken(refreshToken);
    user.refreshTokenHash = refreshHash;
    await user.save();

    logger.info(`User registered: ${user.email}`);
    created(res, {
      accessToken,
      refreshToken,
      userId:    user._id,
      companyId: company._id,
      email:     user.email,
      firstName: user.firstName,
      signupStep: user.signupStep,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { otp } = z.object({ otp: z.string().length(6) }).parse(req.body);
    const userId = req.user!.sub;

    const user = await CompanyAuth.findById(userId);
    if (!user) throw Errors.NotFound('User');
    if (user.isEmailVerified) { ok(res, { message: 'Already verified' }); return; }
    if (!user.emailVerificationToken || !user.emailVerificationExpires)
      throw Errors.InvalidToken();
    if (new Date() > user.emailVerificationExpires)
      throw new AppError('OTP expired. Request a new one.', 401, 'OTP_EXPIRED');

    const valid = await bcrypt.compare(otp, user.emailVerificationToken);
    if (!valid) throw new AppError('Incorrect OTP', 401, 'INVALID_OTP');

    user.isEmailVerified          = true;
    user.emailVerificationToken   = null;
    user.emailVerificationExpires = null;
    await user.save();

    ok(res, { message: 'Email verified' });
  } catch (err) {
    next(err);
  }
}

export async function resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.sub;
    const user = await CompanyAuth.findById(userId);
    if (!user) throw Errors.NotFound('User');
    if (user.isEmailVerified) { ok(res, { message: 'Already verified' }); return; }

    const otp     = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    user.emailVerificationToken   = otpHash;
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.firstName, otp);
    ok(res, { message: 'OTP resent' });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = z.object({
      email:    z.string().email(),
      password: z.string().min(1),
    }).parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();

    const user = await CompanyAuth.findOne({ email: normalizedEmail });
    if (!user || user.provider !== 'local') throw Errors.InvalidCredentials();
    if (!await user.comparePassword(password))    throw Errors.InvalidCredentials();

    await ensureCompanyForUser(user);
    await linkBookDemoRequestsToCompany(user.email, user.companyId);

    user.lastLoginAt = new Date();
    const { accessToken, refreshToken } = buildTokenPair(user);
    user.refreshTokenHash = await hashToken(refreshToken);
    await user.save();

    ok(res, {
      accessToken,
      refreshToken,
      userId:    user._id,
      companyId: user.companyId,
      email:     user.email,
      firstName: user.firstName,
      signupStep: user.signupStep,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const payload = verifyRefreshToken(refreshToken);
    const user = await CompanyAuth.findById(payload.sub);
    if (!user || !user.refreshTokenHash) throw Errors.InvalidToken();
    if (!await compareToken(refreshToken, user.refreshTokenHash)) throw Errors.InvalidToken();

    const { accessToken, refreshToken: newRefresh } = buildTokenPair(user);
    user.refreshTokenHash = await hashToken(newRefresh);
    await user.save();

    ok(res, { accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.sub;
    await CompanyAuth.findByIdAndUpdate(userId, { refreshTokenHash: null });
    ok(res, { message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

type GoogleAuthIntent = 'login' | 'signup';

function getGoogleAuthIntent(value: unknown): GoogleAuthIntent {
  return value === 'login' ? 'login' : 'signup';
}

export function googleAuthRedirect(req: Request, res: Response): void {
  const intent = getGoogleAuthIntent(req.query.intent);
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope:       ['openid', 'email', 'profile'],
    prompt:      'select_account',
    state:       intent,
  });
  res.redirect(url);
}

export async function googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const intent = getGoogleAuthIntent(req.query.state);
    const code = req.query.code as string;
    if (!code) throw new AppError('Missing OAuth code', 400, 'OAUTH_ERROR');

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    if (!data.email || !data.id) throw new AppError('Google profile incomplete', 400, 'OAUTH_ERROR');

    const { firstName, lastName } = getGoogleProfileNames(data);

    // Find or create user
    let user = await CompanyAuth.findOne({ $or: [{ googleId: data.id }, { email: data.email }] });
    const isExistingAccount = Boolean(user);

    if (!user && intent === 'login') {
      res.redirect(`${env.CLIENT_URL}/company/login?oauth_error=account_not_found`);
      return;
    }

    if (!user) {
      user = await CompanyAuth.create({
        firstName,
        lastName,
        email:           data.email.toLowerCase(),
        passwordHash:    null,
        provider:        'google',
        googleId:        data.id,
        isEmailVerified: true,
        signupStep:      1,
      });
    } else if (!user.googleId) {
      user.googleId = data.id;
      user.isEmailVerified = true;
      await user.save();
    }

    await ensureCompanyForUser(user);
    await linkBookDemoRequestsToCompany(user.email, user.companyId);

    user.lastLoginAt = new Date();
    const { accessToken, refreshToken } = buildTokenPair(user);
    user.refreshTokenHash = await hashToken(refreshToken);
    await user.save();

    // Redirect to frontend with tokens
    const params = new URLSearchParams({
      access_token:  accessToken,
      refresh_token: refreshToken,
      signup_step:   user.signupStep.toString(),
      account_status: isExistingAccount ? 'existing' : 'new',
      accessToken,
      refreshToken,
      signupStep: user.signupStep.toString(),
      token: accessToken,
    });
    res.redirect(`${env.CLIENT_URL}/auth/callback?${params.toString()}`);
  } catch (err) {
    next(err);
  }
}

// ─── Email availability check ────────────────────────────────────────────────

export async function checkEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const email = z.string().email().parse(req.query.email);
    const normalizedEmail = email.trim().toLowerCase();
    const [userExists, workerExists] = await Promise.all([
      CompanyAuth.exists({ email: normalizedEmail }),
      Worker.exists({ email: normalizedEmail }),
    ]);
    const exists = Boolean(userExists || workerExists);
    ok(res, { available: !exists });
  } catch (err) {
    next(err);
  }
}
