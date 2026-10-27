import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub:        string;   // userId
  email:      string;
  role:       string;
  companyId:  string | null;
  signupStep?: number;
}

export interface RefreshTokenPayload {
  sub:  string;  // userId
  jti?: string;  // unique token id (for revocation)
}

// ─── Sign ─────────────────────────────────────────────────────────────────────

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer:    'dechub',
    audience:  'dechub-app',
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer:    'dechub',
    audience:  'dechub-app',
  } as jwt.SignOptions);
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer:   'dechub',
    audience: 'dechub-app',
  }) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer:   'dechub',
    audience: 'dechub-app',
  }) as RefreshTokenPayload;
}

// ─── Refresh token hashing (store hash in DB, not raw) ───────────────────────

export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export async function compareToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}