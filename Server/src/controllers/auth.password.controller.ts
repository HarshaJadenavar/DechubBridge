import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { CompanyAuth } from '../models/CompanyAuth';
import { Worker } from '../models/Worker';
import { ok, AppError, Errors } from '../utils/response';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  compareToken,
} from '../utils/jwt';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { sendEmail } from '../utils/email';

type ResettableAccount = {
  firstName: string;
  email: string;
  passwordHash: string | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  refreshTokenHash: string | null;
  save(): Promise<unknown>;
};

type AccountKind = 'company' | 'contractor';

async function sendPasswordResetEmail(firstName: string, email: string, resetUrl: string): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head><style>
body{font-family:'DM Sans',Arial,sans-serif;background:#f8fafc;margin:0;padding:0}
.wrap{max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 16px rgba(0,0,0,0.08)}
.header{background:linear-gradient(135deg,#0a1628,#162d54);padding:32px 40px}
.logo{color:#00c9a7;font-size:20px;font-weight:800;letter-spacing:-.3px}
.body{padding:36px 40px;color:#0f172a}
h1{font-size:22px;font-weight:800;margin:0 0 12px;letter-spacing:-.3px}
p{font-size:14px;color:#475569;line-height:1.7;margin:0 0 16px}
.btn{display:inline-block;background:#0a1628;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;margin:8px 0 24px}
.url-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;font-family:monospace;font-size:12px;color:#64748b;word-break:break-all;margin-bottom:20px}
.note{font-size:12px;color:#94a3b8;border-top:1px solid #f1f4f9;padding-top:16px;margin-top:16px}
.footer{background:#f8fafc;padding:20px 40px;font-size:12px;color:#94a3b8}
</style></head>
<body>
<div class="wrap">
  <div class="header"><span class="logo">Dechub</span></div>
  <div class="body">
    <h1>Reset your password</h1>
    <p>Hi ${firstName},</p>
    <p>We received a request to reset the password for your Dechub account. Click the button below to choose a new password:</p>
    <a href="${resetUrl}" class="btn">Reset my password</a>
    <p>Or copy and paste this URL into your browser:</p>
    <div class="url-box">${resetUrl}</div>
    <div class="note">
      This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email and your password will not change.
    </div>
  </div>
  <div class="footer">&copy; ${new Date().getFullYear()} Dechub Pvt. Ltd. | Bengaluru, India</div>
</div>
</body>
</html>`.trim();

  try {
    await sendEmail(email, 'Reset your Dechub password', html, { includeLogo: false });
  } catch (emailErr) {
    logger.warn(`Failed to send password reset email to ${email}`, emailErr);
  }
}

async function findResettableAccountByEmail(
  email: string,
  accountType?: AccountKind,
): Promise<ResettableAccount | null> {
  const [user, worker] = await Promise.all([
    accountType === 'contractor' ? Promise.resolve(null) : CompanyAuth.findOne({ email }),
    accountType === 'company'
      ? Promise.resolve(null)
      : Worker.findOne({
        email,
        status: { $ne: 'invited' },
      }).select('+passwordHash +passwordResetToken +refreshTokenHash'),
  ]);

  if (accountType === 'company') return user as ResettableAccount | null;
  if (accountType === 'contractor') return worker as ResettableAccount | null;

  if (user && worker) {
    throw new AppError(
      'This email is used by both a company and contractor account. Please retry from the correct account flow.',
      409,
      'AMBIGUOUS_ACCOUNT_EMAIL',
    );
  }

  return (user ?? worker) as ResettableAccount | null;
}

async function findResettableAccountByToken(tokenHash: string): Promise<ResettableAccount | null> {
  const companyAccount = await CompanyAuth.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken');
  if (companyAccount) return companyAccount as ResettableAccount;

  const worker = await Worker.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordHash +passwordResetToken +refreshTokenHash');

  return worker as ResettableAccount | null;
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();
    const accountType = (req.body?.accountType ?? req.query.accountType) as AccountKind | undefined;
    const account = await findResettableAccountByEmail(normalizedEmail, accountType);

    if (!account) {
      ok(res, { message: 'If this email exists, a reset link has been sent.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    account.passwordResetToken = resetTokenHash;
    account.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await account.save();

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(account.firstName, account.email, resetUrl);

    logger.info(`Password reset requested for: ${account.email}`);
    ok(res, { message: 'If this email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const resetPayload = z.object({
      token: z.string().min(1).optional(),
      newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
      password: z.string().min(8, 'Password must be at least 8 characters').optional(),
      confirmPassword: z.string().optional(),
    }).superRefine((data, ctx) => {
      const nextPassword = data.newPassword ?? data.password;
      if (!data.token) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['token'],
          message: 'Token is required',
        });
      }
      if (!nextPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['newPassword'],
          message: 'Password must be at least 8 characters',
        });
      }
      if (data.confirmPassword !== undefined && nextPassword && data.confirmPassword !== nextPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: 'Passwords do not match',
        });
      }
    });

    const parsed = resetPayload.parse({
      ...req.body,
      token: req.body?.token ?? req.query.token,
    });
    const token = parsed.token as string;
    const newPassword = (parsed.newPassword ?? parsed.password) as string;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const account = await findResettableAccountByToken(tokenHash);

    if (!account) {
      throw new AppError(
        'This reset link is invalid or has expired. Please request a new one.',
        400,
        'INVALID_RESET_TOKEN',
      );
    }

    account.passwordHash = await bcrypt.hash(newPassword, 12);
    account.passwordResetToken = null;
    account.passwordResetExpires = null;
    account.refreshTokenHash = null;
    await account.save();

    logger.info(`Password reset successful for: ${account.email}`);
    ok(res, { message: 'Password reset successful. You can now log in with your new password.' });
  } catch (err) {
    next(err);
  }
}

export async function contractorLogin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }).parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();

    const worker = await Worker.findOne({
      email: normalizedEmail,
      status: { $ne: 'invited' },
    }).select('+passwordHash +refreshTokenHash');

    if (!worker) throw Errors.InvalidCredentials();

    const passwordHash = worker.passwordHash;
    if (!passwordHash) {
      throw new AppError(
        'Please complete your account setup via the invite link first.',
        400,
        'ACCOUNT_NOT_SETUP',
      );
    }

    const isValid = await bcrypt.compare(password, passwordHash);
    if (!isValid) throw Errors.InvalidCredentials();

    if (worker.status === 'terminated') {
      throw new AppError('Your account has been deactivated. Contact your company.', 403, 'ACCOUNT_TERMINATED');
    }

    const accessToken = signAccessToken({
      sub: worker._id.toString(),
      email: worker.email,
      role: 'contractor',
      companyId: worker.companyId.toString(),
    });
    const refreshToken = signRefreshToken({ sub: worker._id.toString() });

    worker.refreshTokenHash = await hashToken(refreshToken);
    worker.lastLoginAt = new Date();
    await worker.save();

    logger.info(`Contractor login: ${worker.email}`);
    ok(res, {
      accessToken,
      refreshToken,
      workerId: worker._id,
      email: worker.email,
      firstName: worker.firstName,
      role: 'contractor',
      status: worker.status,
    });
  } catch (err) {
    next(err);
  }
}

export async function contractorRefresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const payload = verifyRefreshToken(refreshToken);

    const worker = await Worker.findById(payload.sub).select('+refreshTokenHash');
    if (!worker || !worker.refreshTokenHash) throw Errors.InvalidToken();

    const isValid = await compareToken(refreshToken, worker.refreshTokenHash);
    if (!isValid) throw Errors.InvalidToken();

    const accessToken = signAccessToken({
      sub: worker._id.toString(),
      email: worker.email,
      role: 'contractor',
      companyId: worker.companyId.toString(),
    });
    const newRefreshToken = signRefreshToken({ sub: worker._id.toString() });

    worker.refreshTokenHash = await hashToken(newRefreshToken);
    worker.lastLoginAt = new Date();
    await worker.save();

    ok(res, {
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
}
