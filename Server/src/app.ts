import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { ZodError } from 'zod';
import authRoutes    from './routes/auth.routes';
import companyAuthRoutes from './routes/companyAuth.routes';
import companyRoutes from './routes/company.routes';
import { AppError, ValidationError } from './utils/response';
import { env } from './config/env';
import { logger } from './utils/logger';
import workersRoutes, { dashboardRouter } from './routes/workers.routes';
import contractorRoutes from './routes/contractor.routes';
import adminRoutes from './routes/admin.routes';
import debugRoutes from './routes/debug.routes';
import contractsRoutes from './routes/contracts.routes';
import publicRoutes from './routes/public.routes';


const app = express();
const allowedOrigins = new Set([
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://dechub.vercel.app'
]);

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── HTTP request logging ─────────────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ─── Static file serving for uploaded KYB docs ───────────────────────────────
// Served only for internal/admin use — never exposed to end users directly.
// In production, use S3 signed URLs instead.
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.resolve(env.UPLOAD_DIR)));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/company-auth', companyAuthRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/workers',   workersRoutes);
app.use('/api/contractor', contractorRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/public', publicRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // Zod validation error
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.');
      fields[key] = issue.message;
    }
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields },
    });
  }

  // Custom ValidationError
  if (err instanceof ValidationError) {
    return res.status(422).json({
      success: false,
      error: { code: err.code, message: err.message, fields: err.fields },
    });
  }

  // Custom AppError
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  // Express/body-parser payload size error
  if (err && typeof err === 'object' && 'type' in err && err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large' },
    });
  }

  // Multer file size error
  if (err && typeof err === 'object' && 'code' in err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: { code: 'FILE_TOO_LARGE', message: `File exceeds ${env.MAX_FILE_SIZE_MB}MB limit` },
    });
  }

  // Unknown / programmer error
  logger.error('Unhandled error', err);
  return res.status(500).json({
    success: false,
    error: {
      code:    'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : String(err instanceof Error ? err.message : err),
    },
  });
});

export default app;
