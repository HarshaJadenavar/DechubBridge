import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/response';

// Extend Express Request with worker field
declare global {
  namespace Express {
    interface Request {
      worker?: { sub: string; role: string };
    }
  }
}

export function requireContractorAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const token   = auth.slice(7);
    const payload = verifyAccessToken(token) as { sub: string; role: string };

    if (payload.role !== 'contractor') {
      throw new AppError('Contractor access required', 403, 'FORBIDDEN');
    }

    req.worker = { sub: payload.sub, role: payload.role };
    next();
  } catch (err) {
    if (err instanceof AppError) { next(err); return; }
    next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
}