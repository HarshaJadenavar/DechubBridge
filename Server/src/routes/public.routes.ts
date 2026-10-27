import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { subscribeNewsletter } from '../controllers/newsletter.controller';

const router = Router();

const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many subscription attempts. Please try again later.' } },
});

router.post('/newsletter/subscribe', newsletterLimiter, subscribeNewsletter);

export default router;
