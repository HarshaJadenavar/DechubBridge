import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { Errors } from '../utils/response';

// Authorize Dechub internal admin users via a configured list of emails
export function requireDechubAdmin(req: Request, _res: Response, next: NextFunction): void {
  const user = req.user;
  if (!user) throw Errors.Unauthorized();

  const admins = (env.DECHUB_ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  // Allow if token role explicitly set to 'dechub_admin' or email is in list
  if (user.role === 'dechub_admin' || admins.includes(user.email.toLowerCase())) {
    next();
    return;
  }

  throw Errors.Forbidden();
}
