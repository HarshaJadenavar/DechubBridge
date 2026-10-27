import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT:                  z.string().default('4000'),
  NODE_ENV:              z.enum(['development', 'production', 'test']).default('development'),
  DNS_SERVERS:           z.string().default(''),
  PAYMENT_PROVIDER:      z.enum(['dummy', 'stripe']).default('dummy'),
  CLIENT_URL:            z.string().url(),
  MONGODB_URI:           z.string().min(1),
  JWT_SECRET:            z.string().min(32),
  JWT_REFRESH_SECRET:    z.string().min(32),
  JWT_EXPIRES_IN:        z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN:z.string().default('7d'),
  GOOGLE_CLIENT_ID:      z.string().min(1),
  GOOGLE_CLIENT_SECRET:  z.string().min(1),
  GOOGLE_CALLBACK_URL:   z.string().url(),
  STRIPE_SECRET_KEY:     z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  SMTP_HOST:             z.string().default(''),
  SMTP_PORT:             z.string().default('587'),
  SMTP_USER:             z.string().default(''),
  SMTP_PASS:             z.string().default(''),
  EMAIL_FROM:            z.string().min(1),
  RESEND_API_KEY:        z.string().default(''),
  UPLOAD_DIR:            z.string().default('uploads'),
  MAX_FILE_SIZE_MB:      z.string().default('10'),
  DOCUSIGN_INTEGRATION_KEY: z.string().default(''),
  DOCUSIGN_ACCOUNT_ID:      z.string().default(''),
  DOCUSIGN_USER_ID:         z.string().default(''),
  DOCUSIGN_PRIVATE_KEY:     z.string().default(''),
  DOCUSIGN_BASE_URL:        z.string().default('https://demo.docusign.net'),
  DECHUB_ADMIN_EMAILS:      z.string().default(''), // comma-separated list of internal Dechub admin emails
  DECHUB_ADMIN_PASSWORD:    z.string().default(''), // admin login password for hidden admin portal
  GOOGLE_SHEETS_ENABLED:    z.string().default('false'),
  GOOGLE_SHEETS_WEBHOOK_URL:z.string().default(''),
}).refine(
  (value) => Boolean(value.RESEND_API_KEY) || Boolean(value.SMTP_HOST && value.SMTP_USER && value.SMTP_PASS),
  { message: 'Configure RESEND_API_KEY or all SMTP credentials.', path: ['RESEND_API_KEY'] },
);

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
