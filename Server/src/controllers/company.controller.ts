import path from 'path';
import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { Company, IKybDocument } from '../models/Company';
import { CompanyAuth } from '../models/CompanyAuth';
import { env } from '../config/env';
import { getUploadedFile } from '../middleware/upload.middleware';
import { AppError, Errors, ok } from '../utils/response';

type PaymentProvider = 'dummy' | 'stripe';

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;
const MVP_KYB_AUTO_APPROVE_DELAY_MS = 3_000;

const identitySchema = z.object({
  companyName: z.string().trim().min(1),
  companyCountry: z.string().trim().min(2),
  companyType: z.string().trim().min(1),
  taxId: z.string().trim().min(1),
});

const businessSchema = z.object({
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  companyIndustry: z.string().trim().min(1),
  companyWebsite: z.string().trim().url().optional().or(z.literal('')),
  addressLine1: z.string().trim().min(1),
  addressCity: z.string().trim().min(1),
  addressZip: z.string().trim().min(1),
  referralSource: z.string().trim().optional().or(z.literal('')),
});

const billingSchema = z.object({
  billingEmail: z.string().trim().email(),
  billCurrency: z.string().trim().min(3).max(3).default('USD'),
  paymentProvider: z.enum(['dummy', 'stripe']).optional(),
  stripePaymentMethodId: z.string().trim().min(1).optional(),
  paymentReference: z.string().trim().min(1).optional(),
  dummyPaymentId: z.string().trim().min(1).optional(),
  paymentStatus: z.enum(['success', 'succeeded']).optional(),
}).superRefine((data, ctx) => {
  const provider = data.paymentProvider ?? env.PAYMENT_PROVIDER;

  if (provider === 'stripe' && !data.stripePaymentMethodId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'stripePaymentMethodId is required for Stripe payments',
      path: ['stripePaymentMethodId'],
    });
  }

  if (provider === 'dummy' && !data.paymentReference && !data.dummyPaymentId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'paymentReference or dummyPaymentId is required for dummy payments',
      path: ['paymentReference'],
    });
  }
});

const preferencesSchema = z.object({
  payCycle: z.string().trim().min(1),
  contractCurrency: z.string().trim().min(3).max(3),
  companyTimezone: z.string().trim().min(1),
  hrEmail: z.string().trim().email(),
  notif1: z.boolean().optional(),
  notif2: z.boolean().optional(),
  notif3: z.boolean().optional(),
  notif4: z.boolean().optional(),
});

async function getCompanyForUser(userId: string) {
  const company = await Company.findOne({ ownerId: userId });
  if (!company) {
    throw Errors.NotFound('Company');
  }
  return company;
}

function getPaymentProvider(provider?: PaymentProvider): PaymentProvider {
  return provider ?? env.PAYMENT_PROVIDER;
}

function getStripeClient(): Stripe {
  if (!stripe) {
    throw new AppError('Stripe is not configured for this environment', 503, 'STRIPE_NOT_CONFIGURED');
  }
  return stripe;
}

async function syncCompanyAccountStep(accountId: string, nextStep: number): Promise<void> {
  const account = await CompanyAuth.findById(accountId);
  if (!account) {
    throw Errors.NotFound('Company account');
  }

  if (account.signupStep < nextStep) {
    account.signupStep = nextStep;
    await account.save();
  }
}

function normalizeOptionalString(value?: string): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapKybFile(
  file: Express.Multer.File | null,
  docType: IKybDocument['docType'],
): IKybDocument | null {
  if (!file) {
    return null;
  }

  return {
    docType,
    fileName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    storagePath: path.basename(file.path),
    uploadedAt: new Date(),
  };
}

async function autoApproveKybForMvp(company: InstanceType<typeof Company>): Promise<void> {
  // MVP-only temporary behavior:
  // keep the current "verifying" state immediately after upload so the frontend
  // polling flow remains realistic, then auto-approve on a later status check.
  if (
    company.kybStatus !== 'verifying'
    || !company.kybSubmittedAt
    || company.kybApprovedAt
  ) {
    return;
  }

  const readyToApprove = Date.now() - company.kybSubmittedAt.getTime() >= MVP_KYB_AUTO_APPROVE_DELAY_MS;
  if (!readyToApprove) {
    return;
  }

  company.kybStatus = 'approved';
  company.kybApprovedAt = new Date();
  await company.save();
}

export async function getMyCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await getCompanyForUser(req.user!.sub);
    const account = await CompanyAuth.findById(req.user!.sub).select('firstName lastName email phone signupStep isEmailVerified');
    if (!account) {
      throw Errors.NotFound('Company account');
    }

    ok(res, {
      user: {
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        phone: account.phone,
        signupStep: account.signupStep,
        isEmailVerified: account.isEmailVerified,
      },
      company,
    });
  } catch (err) {
    next(err);
  }
}

export async function saveIdentity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = identitySchema.parse(req.body);
    const company = await getCompanyForUser(req.user!.sub);

    company.companyName = data.companyName;
    company.companyCountry = data.companyCountry;
    company.companyType = data.companyType;
    company.taxId = data.taxId;
    await company.save();

    await syncCompanyAccountStep(req.user!.sub, 2);
    ok(res, company);
  } catch (err) {
    next(err);
  }
}

export async function saveBusinessDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = businessSchema.parse(req.body);
    const company = await getCompanyForUser(req.user!.sub);

    company.companySize = data.companySize;
    company.companyIndustry = data.companyIndustry;
    company.companyWebsite = normalizeOptionalString(data.companyWebsite);
    company.addressLine1 = data.addressLine1;
    company.addressCity = data.addressCity;
    company.addressZip = data.addressZip;
    company.referralSource = normalizeOptionalString(data.referralSource);
    await company.save();

    await syncCompanyAccountStep(req.user!.sub, 3);
    ok(res, company);
  } catch (err) {
    next(err);
  }
}

export async function submitKyb(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await getCompanyForUser(req.user!.sub);
    const files = req.files;

    const documents = [
      mapKybFile(getUploadedFile(files, 'doc1'), 'incorporation_cert'),
      mapKybFile(getUploadedFile(files, 'doc2'), 'tax_id'),
      mapKybFile(getUploadedFile(files, 'doc3'), 'owner_id'),
      mapKybFile(getUploadedFile(files, 'doc4'), 'proof_of_address'),
    ].filter((document): document is IKybDocument => document !== null);

    if (documents.length === 0) {
      throw new AppError('At least one KYB document is required', 422, 'VALIDATION_ERROR');
    }

    company.kybDocuments = documents;
    company.kybStatus = 'verifying';
    company.kybSubmittedAt = new Date();
    company.kybApprovedAt = null;
    await company.save();

    await syncCompanyAccountStep(req.user!.sub, 4);
    ok(res, {
      kybStatus: company.kybStatus,
      kybSubmittedAt: company.kybSubmittedAt,
      documents: company.kybDocuments,
    });
  } catch (err) {
    next(err);
  }
}

export async function getKybStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await getCompanyForUser(req.user!.sub);
    await autoApproveKybForMvp(company);
    ok(res, {
      kybStatus: company.kybStatus,
      kybSubmittedAt: company.kybSubmittedAt,
      kybApprovedAt: company.kybApprovedAt,
      documents: company.kybDocuments,
    });
  } catch (err) {
    next(err);
  }
}

export async function createSetupIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await getCompanyForUser(req.user!.sub);
    const account = await CompanyAuth.findById(req.user!.sub);
    const paymentProvider = getPaymentProvider();

    if (!account) {
      throw Errors.NotFound('Company account');
    }

    if (paymentProvider === 'dummy') {
      ok(res, {
        provider: 'dummy',
        customerId: null,
        setupIntentId: null,
        clientSecret: null,
        mockPayment: true,
        message: 'Stripe setup skipped in MVP dummy payment mode',
      });
      return;
    }

    const stripeClient = getStripeClient();

    if (!company.stripeCustomerId) {
      const customer = await stripeClient.customers.create({
        email: account.email,
        name: `${account.firstName} ${account.lastName}`.trim(),
        metadata: {
          companyId: company._id.toString(),
          userId: account._id.toString(),
        },
      });
      company.stripeCustomerId = customer.id;
      await company.save();
    }

    const setupIntent = await stripeClient.setupIntents.create({
      customer: company.stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      usage: 'off_session',
      metadata: {
        companyId: company._id.toString(),
      },
    });

    ok(res, {
      provider: 'stripe',
      customerId: company.stripeCustomerId,
      setupIntentId: setupIntent.id,
      clientSecret: setupIntent.client_secret,
    });
  } catch (err) {
    next(err);
  }
}

export async function saveBilling(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = billingSchema.parse(req.body);
    const company = await getCompanyForUser(req.user!.sub);
    const paymentProvider = getPaymentProvider(data.paymentProvider);
    const paymentReference = data.paymentReference ?? data.dummyPaymentId ?? null;

    company.billingEmail = data.billingEmail;
    company.billCurrency = data.billCurrency.toUpperCase();
    company.paymentProvider = paymentProvider;
    company.paymentReference = paymentReference;
    company.stripePaymentMethodId = paymentProvider === 'stripe'
      ? data.stripePaymentMethodId ?? null
      : null;
    if (paymentProvider === 'dummy') {
      company.stripeCustomerId = null;
    }
    company.billingSetupAt = new Date();
    await company.save();

    await syncCompanyAccountStep(req.user!.sub, 5);
    ok(res, {
      company,
      billing: {
        provider: paymentProvider,
        paymentReference,
        paymentStatus: data.paymentStatus ?? 'success',
        isMockPayment: paymentProvider === 'dummy',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function savePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = preferencesSchema.parse(req.body);
    const company = await getCompanyForUser(req.user!.sub);

    company.payCycle = data.payCycle;
    company.contractCurrency = data.contractCurrency.toUpperCase();
    company.companyTimezone = data.companyTimezone;
    company.hrEmail = data.hrEmail;
    company.notif1 = data.notif1 ?? company.notif1;
    company.notif2 = data.notif2 ?? company.notif2;
    company.notif3 = data.notif3 ?? company.notif3;
    company.notif4 = data.notif4 ?? company.notif4;
    company.signupCompleted = true;
    company.signupCompletedAt = new Date();
    await company.save();

    await CompanyAuth.findByIdAndUpdate(req.user!.sub, { signupStep: 7 });
    ok(res, company);
  } catch (err) {
    next(err);
  }
}
