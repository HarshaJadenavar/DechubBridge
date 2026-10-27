import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  signup,
  login,
  refresh,
  logout,
  checkEmail,
  verifyEmail,
  resendOtp,
} from '../controllers/companyAuth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again in 15 minutes.' } },
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many OTP requests. Try again in 1 minute.' } },
});

router.post('/signup', authLimiter, signup);
router.post('/register', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.get('/check-email', checkEmail);
router.post('/verify-email', requireAuth, verifyEmail);
router.post('/resend-otp', requireAuth, otpLimiter, resendOtp);
router.post('/logout', requireAuth, logout);

export default router;
