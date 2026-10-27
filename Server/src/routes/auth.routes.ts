import { Router } from 'express';
import {
  googleAuthRedirect,
  googleCallback,
} from '../controllers/auth.controller';
import {
  signup as companySignup,
  verifyEmail,
  resendOtp,
  login as companyLogin,
  refresh,
  logout,
  checkEmail,
} from '../controllers/companyAuth.controller';
import {
  forgotPassword,
  resetPassword,
  contractorLogin,
  contractorRefresh,
} from '../controllers/auth.password.controller';
import { selfSignup as contractorSelfSignup } from '../controllers/contractor.controller';
import { requireAuth } from '../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// ─── Rate limiters ────────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again in 15 minutes.' } },
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 min
  max: 3,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many OTP requests. Try again in 1 minute.' } },
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many reset requests. Try again in 1 hour.' } },
});

// ─── Public routes ────────────────────────────────────────────────────────────

router.post('/register',          authLimiter,          companySignup);
router.post('/login',             authLimiter,          companyLogin);
router.post('/refresh',           refresh);
router.get ('/check-email',       checkEmail);

// ─── Password reset (NEW) ─────────────────────────────────────────────────────

router.post('/forgot-password',   passwordResetLimiter, forgotPassword);
router.post('/reset-password',    passwordResetLimiter, resetPassword);

// ─── Contractor login (NEW) ───────────────────────────────────────────────────

router.post('/contractor/login',  authLimiter,          contractorLogin);
router.post('/contractor/refresh',                          contractorRefresh);
router.post('/contractor/signup', authLimiter,          contractorSelfSignup);

// ─── Google OAuth ─────────────────────────────────────────────────────────────

router.get ('/google',            googleAuthRedirect);
router.get ('/google/callback',   googleCallback);

// ─── Protected routes ─────────────────────────────────────────────────────────

router.post('/verify-email',      requireAuth,          verifyEmail);
router.post('/resend-otp',        requireAuth, otpLimiter, resendOtp);
router.post('/logout',            requireAuth,          logout);

export default router;
