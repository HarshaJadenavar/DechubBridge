import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { sendEmail } from '../utils/email';
import { logger } from '../utils/logger';
import { ok } from '../utils/response';

const subscribeSchema = z.object({
  email: z.string().trim().email().max(200),
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[character] ?? character));
}

export async function subscribeNewsletter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = subscribeSchema.parse(req.body);
    const subscriberEmail = email.toLowerCase();
    const adminEmails = env.DECHUB_ADMIN_EMAILS.split(',').map((address) => address.trim().toLowerCase()).filter(Boolean);

    await sendEmail(
      subscriberEmail,
      'You are subscribed to Dechub-Bridge updates',
      '<h1>Thanks for subscribing</h1><p>You will receive Dechub-Bridge updates, platform news, and useful workforce insights at this email address.</p><p class="muted">If you did not request this, you can ignore this email.</p>',
    );

    const adminResults = await Promise.allSettled(adminEmails.map((adminEmail) => sendEmail(
      adminEmail,
      'New Dechub-Bridge newsletter subscriber',
      `<h1>New newsletter subscriber</h1><p><strong>Email:</strong> ${escapeHtml(subscriberEmail)}</p>`,
      { includeLogo: false },
    )));
    if (adminResults.some((result) => result.status === 'rejected')) {
      logger.warn(`Newsletter admin notification failed for ${subscriberEmail}`);
    }

    ok(res, { message: 'Subscription confirmed. Please check your email.' });
  } catch (error) {
    next(error);
  }
}
