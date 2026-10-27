import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt';
import { Errors } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

/**
 * Extracts and verifies JWT from Authorization: Bearer <token>.
 * Attaches decoded payload to req.user.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw Errors.Unauthorized();

  const token = header.slice(7);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    throw Errors.InvalidToken();
  }
}

/**
 * Same as requireAuth but doesn't throw — just enriches req.user if token present.
 * Use on routes that work both authenticated and unauthenticated.
 */
export function softAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(header.slice(7));
    } catch {
      // ignore — token invalid, just don't set req.user
    }
  }
  next();
}