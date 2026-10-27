import { Response } from 'express';

// ─── Typed Application Error ──────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode    = statusCode;
    this.code          = code;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly fields: Record<string, string>;
  constructor(fields: Record<string, string>) {
    super('Validation failed', 422, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}

// ─── Common pre-built errors ──────────────────────────────────────────────────

export const Errors = {
  Unauthorized:      () => new AppError('Authentication required', 401, 'UNAUTHORIZED'),
  Forbidden:         () => new AppError('Access denied', 403, 'FORBIDDEN'),
  NotFound:          (r = 'Resource') => new AppError(`${r} not found`, 404, 'NOT_FOUND'),
  EmailExists:       () => new AppError('An account with this email already exists', 409, 'EMAIL_ALREADY_EXISTS'),
  InvalidCredentials:() => new AppError('Incorrect email or password', 401, 'INVALID_CREDENTIALS'),
  EmailNotVerified:  () => new AppError('Please verify your email before signing in', 403, 'EMAIL_NOT_VERIFIED'),
  InvalidToken:      () => new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'),
  FileTooLarge:      (mb: number) => new AppError(`File exceeds ${mb}MB limit`, 413, 'FILE_TOO_LARGE'),
  InvalidFileType:   () => new AppError('File type not allowed', 415, 'INVALID_FILE_TYPE'),
};

// ─── Response helpers ────────────────────────────────────────────────────────

export function ok<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, data });
}

export function created<T>(res: Response, data: T): Response {
  return res.status(201).json({ success: true, data });
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}