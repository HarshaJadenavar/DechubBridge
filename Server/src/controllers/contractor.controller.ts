import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Worker } from '../models/Worker';
import { Contract } from '../models/Contract';
import { ContractorNotification } from '../models/ContractorNotification';
import { TalentRequest } from '../models/TalentRequest';
import { Invoice } from '../models/Invoice';
import { Company } from '../models/Company';
import { CompanyAuth } from '../models/CompanyAuth';
import { ok, created, Errors, AppError } from '../utils/response';
import { signAccessToken, signRefreshToken, hashToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { createEnvelopeAndGetSigningUrl, parseWebhookEvent } from '../services/docusign.service';
import { locallySignContract } from '../services/contractSigning.service';
import { syncContractPdf } from '../services/contractPdf.service';

// ─── Helper — get worker from JWT ─────────────────────────────────────────────

async function getWorkerFromReq(req: Request) {
  const workerId = req.worker?.sub;
  if (!workerId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  const worker = await Worker.findById(workerId);
  if (!worker) throw Errors.NotFound('Worker');
  return worker;
}

function hasCompletedPersonalDetails(worker: InstanceType<typeof Worker>): boolean {
  const profile = worker.contractorProfile;
  const address = profile?.address;

  return Boolean(
    profile?.dateOfBirth
    && profile?.nationality?.trim()
    && address?.line1?.trim()
    && address?.city?.trim()
    && address?.postalCode?.trim()
    && address?.country?.trim()
    && profile?.taxId?.trim(),
  );
}

function hasCompletedKyc(worker: InstanceType<typeof Worker>): boolean {
  return Boolean(worker.kycData?.idFrontPath && worker.kycStatus === 'approved');
}

function hasSubmittedKyc(worker: InstanceType<typeof Worker>): boolean {
  return Boolean(worker.kycData?.idFrontPath);
}

function hasCompletedPaymentDetails(worker: InstanceType<typeof Worker>): boolean {
  const details = worker.paymentDetails;
  if (!details?.paymentMethod) {
    return false;
  }

  if (details.paymentMethod === 'wise') {
    return Boolean(details.wiseEmail?.trim());
  }

  if (details.paymentMethod === 'paypal') {
    return Boolean(details.paypalEmail?.trim());
  }

  return Boolean(details.bankName?.trim() && details.accountNumber?.trim());
}

function getInviteOnboardingStep(worker: InstanceType<typeof Worker>): number {
  if (!worker.passwordHash) {
    return 0;
  }

  if (!hasCompletedPersonalDetails(worker)) {
    return 1;
  }

  if (!hasCompletedKyc(worker)) {
    return 2;
  }

  if (!hasCompletedPaymentDetails(worker)) {
    return 3;
  }

  return 4;
}

function getSelfSignupOnboardingStep(worker: InstanceType<typeof Worker>): number {
  if (!worker.passwordHash) {
    return 0;
  }

  if (!hasCompletedPersonalDetails(worker)) {
    return 1;
  }

  if (!hasSubmittedKyc(worker)) {
    return 2;
  }

  if (!hasCompletedPaymentDetails(worker)) {
    return 3;
  }

  return 4;
}

async function markTalentRequestAsTalentHired(contract: { companyId: unknown; workerId: unknown }) {
  const talentRequest = await TalentRequest.findOne({
    companyId: contract.companyId,
    workerId: contract.workerId,
    status: { $in: ['hired', 'talent_hired'] },
  }).sort({ updatedAt: -1, createdAt: -1 });

  if (!talentRequest || talentRequest.status === 'talent_hired') {
    return;
  }

  talentRequest.status = 'talent_hired';
  talentRequest.talentHiredAt = new Date();
  await talentRequest.save();
}

const MARKETPLACE_AVAILABILITY_LABELS = {
  available_now: 'Available now',
  this_week: 'Available this week',
  two_weeks: '2 weeks notice',
  next_month: 'Available next month',
  not_available: 'Not available',
} as const;

const DEFAULT_RESPONSE_TIME_HOURS = 2;

const DEFAULT_SERVICE_PACKAGES = [
  {
    name: 'Basic',
    price: 0,
    description: 'Share a simple starter package for companies browsing your profile.',
    deliveryDays: 5,
    revisions: 1,
    features: ['Scope outline', 'Starter delivery'],
  },
  {
    name: 'Standard',
    price: 0,
    description: 'Describe your most common package and what clients typically receive.',
    deliveryDays: 7,
    revisions: 2,
    features: ['Expanded scope', 'Progress updates'],
  },
  {
    name: 'Premium',
    price: 0,
    description: 'Use this for your most complete offer with your best turnaround.',
    deliveryDays: 14,
    revisions: 3,
    features: ['Full delivery', 'Priority collaboration'],
  },
];

function normalizeStringList(values: unknown, limit = 30): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean),
    ),
  ).slice(0, limit);
}

function normalizePortfolioProjects(values: unknown) {
  if (!Array.isArray(values)) return [];
  return values
    .map((item) => {
      const project = item as Record<string, unknown>;
      const title = typeof project?.title === 'string' ? project.title.trim() : '';
      const description = typeof project?.description === 'string' ? project.description.trim() : '';
      const imageUrl = typeof project?.imageUrl === 'string' ? project.imageUrl.trim() : '';
      const tags = normalizeStringList(project?.tags, 8);

      if (!title || !description || !imageUrl) {
        return null;
      }

      return { title, description, imageUrl, tags };
    })
    .filter(Boolean) as Array<{ title: string; description: string; imageUrl: string; tags: string[] }>;
}

function normalizeServicePackages(values: unknown) {
  if (!Array.isArray(values)) {
    return DEFAULT_SERVICE_PACKAGES;
  }

  const packages = values
    .map((item, index) => {
      const current = item as Record<string, unknown>;
      const fallback = DEFAULT_SERVICE_PACKAGES[index] ?? DEFAULT_SERVICE_PACKAGES[DEFAULT_SERVICE_PACKAGES.length - 1];
      const name = typeof current?.name === 'string' ? current.name.trim() : fallback.name;
      const description = typeof current?.description === 'string' ? current.description.trim() : fallback.description;
      const price = typeof current?.price === 'number' ? current.price : Number(current?.price ?? fallback.price);
      const deliveryDays = typeof current?.deliveryDays === 'number'
        ? current.deliveryDays
        : Number(current?.deliveryDays ?? fallback.deliveryDays);
      const revisions = typeof current?.revisions === 'number'
        ? current.revisions
        : Number(current?.revisions ?? fallback.revisions);
      const features = normalizeStringList(current?.features, 12);

      if (!name || !description) {
        return null;
      }

      return {
        name,
        price: Number.isFinite(price) ? price : fallback.price,
        description,
        deliveryDays: Number.isFinite(deliveryDays) ? deliveryDays : fallback.deliveryDays,
        revisions: Number.isFinite(revisions) ? revisions : fallback.revisions,
        features: features.length ? features : fallback.features,
      };
    })
    .filter(Boolean) as Array<{
      name: string;
      price: number;
      description: string;
      deliveryDays: number;
      revisions: number;
      features: string[];
    }>;

  return packages.length ? packages.slice(0, 3) : DEFAULT_SERVICE_PACKAGES;
}

function normalizeFaqItems(values: unknown) {
  if (!Array.isArray(values)) return [];
  return values
    .map((item) => {
      const faq = item as Record<string, unknown>;
      const question = typeof faq?.question === 'string' ? faq.question.trim() : '';
      const answer = typeof faq?.answer === 'string' ? faq.answer.trim() : '';

      if (!question || !answer) {
        return null;
      }

      return { question, answer };
    })
    .filter(Boolean) as Array<{ question: string; answer: string }>;
}

function getMarketplaceProfile(worker: InstanceType<typeof Worker>) {
  const languages = normalizeStringList(worker.contractorProfile?.languages, 8);
  const portfolioProjects = normalizePortfolioProjects(worker.contractorProfile?.portfolioProjects);
  const servicePackages = normalizeServicePackages(worker.contractorProfile?.servicePackages);
  const faqItems = normalizeFaqItems(worker.contractorProfile?.faqItems);

  return {
    marketplaceTitle: worker.contractorProfile?.marketplaceTitle?.trim() || worker.roleTitle || 'Freelancer',
    marketplaceBio:
      worker.contractorProfile?.marketplaceBio?.trim()
      || worker.scopeOfWork?.trim()
      || 'Experienced freelancer available for contract work.',
    marketplaceAvailability: worker.contractorProfile?.marketplaceAvailability ?? 'available_now',
    marketplaceAvailabilityLabel:
      MARKETPLACE_AVAILABILITY_LABELS[worker.contractorProfile?.marketplaceAvailability ?? 'available_now'],
    marketplaceRate: worker.contractorProfile?.marketplaceRate ?? worker.payRate ?? 0,
    city:
      worker.contractorProfile?.city?.trim()
      || worker.contractorProfile?.address?.city?.trim()
      || '',
    country:
      worker.contractorProfile?.address?.country?.trim()
      || worker.country
      || '',
    skills: worker.contractorProfile?.skills ?? [],
    responseTimeHours:
      typeof worker.contractorProfile?.responseTimeHours === 'number' && worker.contractorProfile.responseTimeHours > 0
        ? worker.contractorProfile.responseTimeHours
        : DEFAULT_RESPONSE_TIME_HOURS,
    languages,
    profilePhotoUrl: worker.contractorProfile?.profilePhotoUrl ?? '',
    bannerImageUrl: worker.contractorProfile?.bannerImageUrl ?? '',
    profileOverview:
      worker.contractorProfile?.profileOverview?.trim()
      || worker.contractorProfile?.marketplaceBio?.trim()
      || worker.scopeOfWork?.trim()
      || '',
    portfolioProjects,
    servicePackages,
    faqItems,
  };
}

async function ensureContractForWorker(worker: Awaited<ReturnType<typeof getWorkerFromReq>>) {
  const existing = await Contract.findOne({ workerId: worker._id });
  if (existing) return existing;

  const company = await Company.findById(worker.companyId).lean();
  if (!company) throw Errors.NotFound('Company');

  const contract = await Contract.create({
    companyId:        worker.companyId,
    workerId:         worker._id,
    workerName:       `${worker.firstName} ${worker.lastName}`,
    workerEmail:      worker.email,
    companyName:      company.companyName ?? 'Your Company',
    roleTitle:        worker.roleTitle,
    contractType:     worker.workerType,
    track:            worker.track,
    payRate:          worker.payRate ?? 0,
    payCurrency:      worker.payCurrency,
    payFrequency:     worker.payFrequency,
    startDate:        worker.startDate ?? new Date(),
    endDate:          worker.endDate,
    noticePeriodDays: worker.noticePeriodDays,
    scopeOfWork:      worker.scopeOfWork,
    status:           'draft',
  });

  worker.contractId = contract._id;
  await worker.save();

  return contract;
}

async function ensureTalentNetworkCompany() {
  const talentOwnerEmail = 'talent-network@dechub.in';

  let owner = await CompanyAuth.findOne({ email: talentOwnerEmail });
  if (!owner) {
    owner = await CompanyAuth.create({
      firstName: 'Dechub',
      lastName: 'Talent Network',
      email: talentOwnerEmail,
      role: 'company_admin',
      provider: 'local',
      isEmailVerified: true,
      signupStep: 7,
    });
  }

  let company = await Company.findOne({ ownerId: owner._id });
  if (!company) {
    company = await Company.create({
      ownerId: owner._id,
      companyName: 'Dechub Talent Network',
      companyCountry: 'India',
      companyType: 'Platform',
      kybStatus: 'approved',
      signupCompleted: true,
      signupCompletedAt: new Date(),
      billingEmail: talentOwnerEmail,
      hrEmail: talentOwnerEmail,
    });
    owner.companyId = company._id;
    await owner.save();
  }

  return company;
}

// ─── Verify invite token (public) ─────────────────────────────────────────────

export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.params;
    const worker = await Worker.findOne({ inviteToken: token, status: 'invited' }).select('+passwordHash +refreshTokenHash');
    if (!worker) throw new AppError('Invalid or expired invite token', 400, 'INVALID_TOKEN');

    // Check expiry — tokens valid 7 days
    const issued = worker.inviteSentAt;
    if (!issued || Date.now() - issued.getTime() > 7 * 24 * 60 * 60 * 1000) {
      throw new AppError('This invite link has expired. Ask your company to resend it.', 400, 'TOKEN_EXPIRED');
    }

    const company = await Company.findById(worker.companyId).lean();
    const onboardingStep = getInviteOnboardingStep(worker);
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (worker.passwordHash) {
      accessToken = signAccessToken({
        sub: worker._id.toString(),
        email: worker.email,
        role: 'contractor',
        companyId: worker.companyId.toString(),
      });
      refreshToken = signRefreshToken({ sub: worker._id.toString() });

      worker.refreshTokenHash = await hashToken(refreshToken);
      worker.lastLoginAt = new Date();
      await worker.save();
    }

    ok(res, {
      workerId:      worker._id,
      firstName:     worker.firstName,
      lastName:      worker.lastName,
      email:         worker.email,
      phone:         worker.phone ?? '',
      roleTitle:     worker.roleTitle,
      companyName:   company?.companyName ?? 'Your Company',
      country:       worker.country,
      track:         worker.track,
      workerType:    worker.workerType,
      payRate:       worker.payRate,
      payCurrency:   worker.payCurrency,
      payFrequency:  worker.payFrequency,
      startDate:     worker.startDate,
      scopeOfWork:   worker.scopeOfWork,
      onboardingStep,
      accessToken,
      refreshToken,
      isExistingContractor: onboardingStep > 0,
    });
  } catch (err) { next(err); }
}

// ─── Step 1 — Set password ────────────────────────────────────────────────────

const setPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8),
});

const selfSignupSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().trim().email(),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,19}$/, 'Enter a valid contact number'),
  password: z.string().min(8),
});

export async function setPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = setPasswordSchema.parse(req.body);
    const worker = await Worker.findOne({ inviteToken: token, status: 'invited' });
    if (!worker) throw new AppError('Invalid token', 400, 'INVALID_TOKEN');

    const hashed = await bcrypt.hash(password, 12);

    // Store password hash on Worker (or create a separate WorkerUser model in prod)
    // Using a passwordHash field — add to Worker schema if not present
    worker.passwordHash = hashed;
    worker.status      = 'kyc_pending';
    worker.inviteToken = null;  // consume token
    await worker.save();

    // Issue contractor JWT
    const accessToken = signAccessToken({
      sub:       worker._id.toString(),
      email:     worker.email,
      role:      'contractor',
      companyId: worker.companyId.toString(),
    });
    const refreshToken = signRefreshToken({ sub: worker._id.toString() });

    worker.refreshTokenHash = await hashToken(refreshToken);
    worker.lastLoginAt = new Date();
    await worker.save();

    logger.info(`Contractor account created: ${worker.email}`);
    ok(res, { accessToken, refreshToken });
  } catch (err) { next(err); }
}

export async function selfSignup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { firstName, lastName, email, phone, password } = selfSignupSchema.parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    const [existingUser, existingWorker, company] = await Promise.all([
      CompanyAuth.findOne({ email: normalizedEmail }),
      Worker.findOne({ email: normalizedEmail }),
      ensureTalentNetworkCompany(),
    ]);

    if (existingUser) {
      throw new AppError(
        'This email is already being used for a company account. Please use a different email.',
        409,
        'EMAIL_IN_USE',
      );
    }

    if (existingWorker) {
      throw new AppError(
        'A contractor account with this email already exists. Please log in instead.',
        409,
        'EMAIL_IN_USE',
      );
    }

    const worker = await Worker.create({
      companyId: company._id,
      firstName,
      lastName,
      email: normalizedEmail,
      phone: normalizedPhone,
      country: 'Unknown',
      track: 'track_2_us',
      workerType: 'contractor',
      roleTitle: 'Freelancer',
      department: 'Talent Marketplace',
      kycStatus: 'pending',
      status: 'kyc_pending',
      selectedServices: [],
      payRate: 0,
      payCurrency: 'USD',
      payFrequency: 'monthly',
      noticePeriodDays: 30,
      scopeOfWork: 'Self-signup freelancer profile',
      passwordHash: await bcrypt.hash(password, 12),
      contractorProfile: {
        dateOfBirth: new Date('2000-01-01'),
        nationality: '',
        marketplaceTitle: 'Freelancer',
        marketplaceBio: 'Tell companies about your strongest skills and the kind of freelance work you want.',
        marketplaceAvailability: 'available_now',
        marketplaceRate: 0,
        city: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        },
        taxId: '',
        skills: [],
        responseTimeHours: DEFAULT_RESPONSE_TIME_HOURS,
        languages: [],
        profileOverview: '',
        portfolioProjects: [],
        servicePackages: DEFAULT_SERVICE_PACKAGES,
        faqItems: [],
      },
    });

    const accessToken = signAccessToken({
      sub: worker._id.toString(),
      email: worker.email,
      role: 'contractor',
      companyId: worker.companyId.toString(),
    });
    const refreshToken = signRefreshToken({ sub: worker._id.toString() });

    worker.refreshTokenHash = await hashToken(refreshToken);
    worker.lastLoginAt = new Date();
    await worker.save();

    created(res, {
      accessToken,
      refreshToken,
      workerId: worker._id,
      email: worker.email,
      firstName: worker.firstName,
      lastName: worker.lastName,
      role: 'contractor',
      status: worker.status,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Step 2 — Personal details ────────────────────────────────────────────────

const personalDetailsSchema = z.object({
  dateOfBirth:  z.string().min(1),
  nationality:  z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().default(''),
  city:         z.string().min(1),
  state:        z.string().default(''),
  postalCode:   z.string().min(1),
  country:      z.string().min(1),
  taxId:        z.string().min(1),
});

const skillsSchema = z.object({
  skills: z.array(z.string().trim().min(1).max(50)).max(30),
});

const portfolioProjectSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(400),
  imageUrl: z.string().trim().url(),
  tags: z.array(z.string().trim().min(1).max(40)).max(8),
});

const servicePackageSchema = z.object({
  name: z.string().trim().min(1).max(40),
  price: z.number().min(0).max(1000000),
  description: z.string().trim().min(1).max(300),
  deliveryDays: z.number().int().min(1).max(365),
  revisions: z.number().int().min(0).max(100),
  features: z.array(z.string().trim().min(1).max(80)).max(12),
});

const faqItemSchema = z.object({
  question: z.string().trim().min(1).max(160),
  answer: z.string().trim().min(1).max(500),
});

const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  marketplaceTitle: z.string().trim().min(1).max(120),
  marketplaceBio: z.string().trim().min(2).max(600),
  marketplaceAvailability: z.enum(['available_now', 'this_week', 'two_weeks', 'next_month', 'not_available']),
  marketplaceRate: z.number().min(0).max(100000),
  city: z.string().trim().min(1).max(80),
  country: z.string().trim().min(1).max(80),
  responseTimeHours: z.number().int().min(1).max(168),
  skills: z.array(z.string().trim().min(1).max(50)).max(30),
  languages: z.array(z.string().trim().min(1).max(50)).max(8),
  profilePhotoUrl: z.string().trim().optional(),
  bannerImageUrl: z.string().trim().optional(),
  profileOverview: z.string().trim().min(2).max(2000),
  portfolioProjects: z.array(portfolioProjectSchema).max(12),
  servicePackages: z.array(servicePackageSchema).min(1).max(3),
  faqItems: z.array(faqItemSchema).max(12),
});

export async function savePersonalDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data   = personalDetailsSchema.parse(req.body);
    const worker = await getWorkerFromReq(req);

    // Store in a structured way — extend Worker model or use a separate profile doc
    const profile = {
      dateOfBirth:  new Date(data.dateOfBirth),
      nationality:  data.nationality,
      marketplaceTitle: worker.contractorProfile?.marketplaceTitle ?? worker.roleTitle,
      marketplaceBio: worker.contractorProfile?.marketplaceBio ?? worker.scopeOfWork ?? '',
      marketplaceAvailability: worker.contractorProfile?.marketplaceAvailability ?? 'available_now',
      marketplaceRate: worker.contractorProfile?.marketplaceRate ?? worker.payRate ?? 0,
      city: worker.contractorProfile?.city ?? data.city,
      address: {
        line1:      data.addressLine1,
        line2:      data.addressLine2,
        city:       data.city,
        state:      data.state,
        postalCode: data.postalCode,
        country:    data.country,
      },
      taxId: data.taxId,
      skills: worker.contractorProfile?.skills ?? [],
      responseTimeHours: worker.contractorProfile?.responseTimeHours ?? DEFAULT_RESPONSE_TIME_HOURS,
      languages: normalizeStringList(worker.contractorProfile?.languages, 8),
      profileOverview: worker.contractorProfile?.profileOverview ?? '',
      portfolioProjects: normalizePortfolioProjects(worker.contractorProfile?.portfolioProjects),
      servicePackages: normalizeServicePackages(worker.contractorProfile?.servicePackages),
      faqItems: normalizeFaqItems(worker.contractorProfile?.faqItems),
    };

    worker.contractorProfile = profile;
    worker.country = data.country;
    await worker.save();

    ok(res, { message: 'Personal details saved' });
  } catch (err) { next(err); }
}

// ─── Step 3 — KYC upload ─────────────────────────────────────────────────────

export async function uploadKyc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const worker  = await getWorkerFromReq(req);
    const idType  = req.body.idType  as string;
    const idNumber= req.body.idNumber as string;

    if (!idType || !idNumber) throw new AppError('idType and idNumber are required', 400, 'VALIDATION_ERROR');

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    if (!files?.idFront?.[0]) throw new AppError('Front ID file is required', 400, 'VALIDATION_ERROR');

    // In production: upload to S3 and store URLs
    // Here we store file paths from multer
    const kycData = {
      idType,
      idNumber,
      idFrontPath:  files.idFront[0].path,
      idBackPath:   files.idBack?.[0]?.path ?? null,
      selfiePath:   files.selfie?.[0]?.path ?? null,
      submittedAt:  new Date(),
    };

    worker.kycData = kycData;
    worker.kycStatus = 'pending';  // KYC team reviews within 24h
    await worker.save();

    // In production: trigger Stripe Identity or manual review notification here

    logger.info(`KYC submitted for worker: ${worker._id}`);
    ok(res, { message: 'KYC submitted for review. You will be notified within 24 hours.' });
  } catch (err) { next(err); }
}

// ─── Step 4 — Bank details ────────────────────────────────────────────────────

const bankDetailsSchema = z.object({
  paymentMethod: z.enum(['wise', 'bank_transfer', 'paypal']),
  wiseEmail:     z.string().email().optional(),
  bankName:      z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  swiftCode:     z.string().optional(),
  paypalEmail:   z.string().email().optional(),
});

export async function saveBankDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data   = bankDetailsSchema.parse(req.body);
    const worker = await getWorkerFromReq(req);

    worker.paymentDetails = data;
    await worker.save();

    // If Wise: could trigger Wise account link here in production
    ok(res, { message: 'Payment details saved' });
  } catch (err) { next(err); }
}

// ─── Get my contract ──────────────────────────────────────────────────────────

export async function getMyContract(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const worker   = await getWorkerFromReq(req);
    const contract = await ensureContractForWorker(worker);
    if (!contract.pdfUrl && (contract.workerSigned || contract.companySigned || contract.status === 'active')) {
      await syncContractPdf(contract, `${req.protocol}://${req.get('host')}`);
    }
    ok(res, contract);
  } catch (err) { next(err); }
}

export async function updateSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { skills } = skillsSchema.parse(req.body);
    const worker = await getWorkerFromReq(req);

    const cleanedSkills = Array.from(
      new Set(
        skills
          .map((skill) => skill.trim())
          .filter(Boolean),
      ),
    );

    worker.contractorProfile = {
      dateOfBirth: worker.contractorProfile?.dateOfBirth ?? new Date('2000-01-01'),
      nationality: worker.contractorProfile?.nationality ?? '',
      marketplaceTitle: worker.contractorProfile?.marketplaceTitle ?? worker.roleTitle,
      marketplaceBio: worker.contractorProfile?.marketplaceBio ?? worker.scopeOfWork ?? '',
      marketplaceAvailability: worker.contractorProfile?.marketplaceAvailability ?? 'available_now',
      marketplaceRate: worker.contractorProfile?.marketplaceRate ?? worker.payRate ?? 0,
      city: worker.contractorProfile?.city ?? worker.contractorProfile?.address?.city ?? '',
      address: {
        line1: worker.contractorProfile?.address?.line1 ?? '',
        line2: worker.contractorProfile?.address?.line2 ?? '',
        city: worker.contractorProfile?.address?.city ?? '',
        state: worker.contractorProfile?.address?.state ?? '',
        postalCode: worker.contractorProfile?.address?.postalCode ?? '',
        country: worker.contractorProfile?.address?.country ?? '',
      },
      taxId: worker.contractorProfile?.taxId ?? '',
      skills: cleanedSkills,
      responseTimeHours: worker.contractorProfile?.responseTimeHours ?? DEFAULT_RESPONSE_TIME_HOURS,
      languages: normalizeStringList(worker.contractorProfile?.languages, 8),
      profileOverview: worker.contractorProfile?.profileOverview ?? '',
      portfolioProjects: normalizePortfolioProjects(worker.contractorProfile?.portfolioProjects),
      servicePackages: normalizeServicePackages(worker.contractorProfile?.servicePackages),
      faqItems: normalizeFaqItems(worker.contractorProfile?.faqItems),
    };

    await worker.save();

    ok(res, { skills: cleanedSkills, message: 'Skills updated successfully' });
  } catch (err) { next(err); }
}

export async function uploadProfileAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError('Image file is required', 400, 'VALIDATION_ERROR');
    }

    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    ok(res, { url: publicUrl });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = profileUpdateSchema.parse(req.body);
    const worker = await getWorkerFromReq(req);

    const cleanedSkills = Array.from(
      new Set(
        data.skills
          .map((skill) => skill.trim())
          .filter(Boolean),
      ),
    );

    worker.firstName = data.firstName;
    worker.lastName = data.lastName;
    worker.country = data.country;

    const profilePhotoUrl = typeof data.profilePhotoUrl === 'string' && data.profilePhotoUrl.trim()
      ? data.profilePhotoUrl.trim()
      : worker.contractorProfile?.profilePhotoUrl ?? '';
    const bannerImageUrl = typeof data.bannerImageUrl === 'string' && data.bannerImageUrl.trim()
      ? data.bannerImageUrl.trim()
      : worker.contractorProfile?.bannerImageUrl ?? '';

    worker.contractorProfile = {
      dateOfBirth: worker.contractorProfile?.dateOfBirth ?? new Date('2000-01-01'),
      nationality: worker.contractorProfile?.nationality ?? '',
      marketplaceTitle: data.marketplaceTitle,
      marketplaceBio: data.marketplaceBio,
      marketplaceAvailability: data.marketplaceAvailability,
      marketplaceRate: data.marketplaceRate,
      city: data.city,
      profilePhotoUrl,
      bannerImageUrl,
      address: {
        line1: worker.contractorProfile?.address?.line1 ?? '',
        line2: worker.contractorProfile?.address?.line2 ?? '',
        city: data.city,
        state: worker.contractorProfile?.address?.state ?? '',
        postalCode: worker.contractorProfile?.address?.postalCode ?? '',
        country: data.country,
      },
      taxId: worker.contractorProfile?.taxId ?? '',
      skills: cleanedSkills,
      responseTimeHours: data.responseTimeHours,
      languages: normalizeStringList(data.languages, 8),
      profileOverview: data.profileOverview.trim(),
      portfolioProjects: normalizePortfolioProjects(data.portfolioProjects),
      servicePackages: normalizeServicePackages(data.servicePackages),
      faqItems: normalizeFaqItems(data.faqItems),
    };

    await worker.save();

    const company = await Company.findById(worker.companyId).lean();
    const marketplaceProfile = getMarketplaceProfile(worker);

    ok(res, {
      workerId: worker._id,
      firstName: worker.firstName,
      lastName: worker.lastName,
      email: worker.email,
      phone: worker.phone ?? '',
      roleTitle: worker.roleTitle,
      companyName: company?.companyName ?? 'Your Company',
      status: worker.status,
      kycStatus: worker.kycStatus,
      payRate: worker.payRate,
      payCurrency: worker.payCurrency,
      payFrequency: worker.payFrequency,
      skills: marketplaceProfile.skills,
      onboardingStep: getSelfSignupOnboardingStep(worker),
      marketplaceTitle: marketplaceProfile.marketplaceTitle,
      marketplaceBio: marketplaceProfile.marketplaceBio,
      marketplaceAvailability: marketplaceProfile.marketplaceAvailability,
      marketplaceAvailabilityLabel: marketplaceProfile.marketplaceAvailabilityLabel,
      marketplaceRate: marketplaceProfile.marketplaceRate,
      city: marketplaceProfile.city,
      country: marketplaceProfile.country,
      responseTimeHours: marketplaceProfile.responseTimeHours,
      languages: marketplaceProfile.languages,
      profilePhotoUrl: marketplaceProfile.profilePhotoUrl,
      bannerImageUrl: marketplaceProfile.bannerImageUrl,
      profileOverview: marketplaceProfile.profileOverview,
      portfolioProjects: marketplaceProfile.portfolioProjects,
      servicePackages: marketplaceProfile.servicePackages,
      faqItems: marketplaceProfile.faqItems,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Get DocuSign signing URL ─────────────────────────────────────────────────

export async function getSigningUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const worker   = await getWorkerFromReq(req);
    const contract = await ensureContractForWorker(worker);
    if (contract.workerSigned) throw new AppError('Already signed', 400, 'ALREADY_SIGNED');

    const company = await Company.findById(worker.companyId).lean();
    if (!company) throw Errors.NotFound('Company');

    // Create or refresh DocuSign envelope
    const returnUrl = `${env.CLIENT_URL}/worker/signed?contractId=${contract._id}`;

    const { envelopeId, signingUrl } = await createEnvelopeAndGetSigningUrl({
      contractId:   contract._id.toString(),
      workerName:   `${worker.firstName} ${worker.lastName}`,
      workerEmail:  worker.email,
      companyName:  company.companyName ?? 'Your Company',
      companyEmail: company.hrEmail ?? company.billingEmail ?? '',
      roleTitle:    worker.roleTitle,
      payRate:      worker.payRate ?? 0,
      payCurrency:  worker.payCurrency,
      payFrequency: worker.payFrequency,
      startDate:    worker.startDate ?? new Date(),
      scopeOfWork:  worker.scopeOfWork,
      returnUrl,
    });

    contract.docusignEnvelopeId = envelopeId;
    contract.signingUrl         = signingUrl;
    contract.status             = 'sent';
    await contract.save();

    logger.info(`DocuSign signing URL generated for worker ${worker._id}`);
    ok(res, { signingUrl });
  } catch (err) { next(err); }
}

// ─── DocuSign webhook ─────────────────────────────────────────────────────────

export async function signMyContract(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const worker = await getWorkerFromReq(req);
    const contract = await Contract.findOne({ workerId: worker._id });
    if (!contract) throw new AppError('Contract not found for this contractor', 404, 'CONTRACT_NOT_FOUND');

    const updatedContract = await locallySignContract(contract);
    await syncContractPdf(updatedContract, `${req.protocol}://${req.get('host')}`, { force: true });
    worker.kycStatus = 'approved';
    worker.status = updatedContract.status === 'active' ? 'active' : 'inactive';
    worker.inviteToken = null;
    await worker.save();

    if (updatedContract.status === 'worker_signed') {
      await ContractorNotification.create({
        workerId: worker._id,
        type: 'contract_pending',
        title: 'Contract signed',
        message: `You signed your contract with ${updatedContract.companyName}. It is now waiting for the company countersignature.`,
        actionUrl: '/contractor/dashboard?tab=contract',
      });
    }

    if (updatedContract.status === 'active') {
      await markTalentRequestAsTalentHired(updatedContract);
    }

    logger.info(`MVP contract signed locally: ${updatedContract._id} worker=${worker._id}`);
    ok(res, updatedContract);
  } catch (err) { next(err); }
}

export async function rejectMyContract(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const worker = await getWorkerFromReq(req);
    const contract = await Contract.findOne({ workerId: worker._id });
    if (!contract) throw new AppError('Contract not found for this contractor', 404, 'CONTRACT_NOT_FOUND');
    if (contract.workerSigned || contract.companySigned || contract.status === 'active') {
      throw new AppError('This contract can no longer be rejected.', 400, 'CONTRACT_NOT_REJECTABLE');
    }

    contract.status = 'rejected';
    await contract.save();

    worker.status = 'inactive';
    worker.inviteToken = null;
    await worker.save();

    ok(res, contract);
  } catch (err) { next(err); }
}

export async function docusignWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = parseWebhookEvent(req.body as Record<string, unknown>);
    const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
    logger.info(`DocuSign webhook: ${event.type} envelope=${event.envelopeId}`);

    if (!event.envelopeId) { res.sendStatus(200); return; }

    const contract = await Contract.findOne({ docusignEnvelopeId: event.envelopeId });
    if (!contract) { res.sendStatus(200); return; }

    if (event.type === 'recipient_completed') {
      // Determine which recipient signed
      if (event.recipientId === '1') {
        // Contractor signed
        contract.workerSigned  = true;
        contract.workerSignedAt = new Date();
        contract.status         = 'worker_signed';
        await contract.save();
        await syncContractPdf(contract, serverBaseUrl, { force: true });

        // Update worker status
        await Worker.findByIdAndUpdate(contract.workerId, { kycStatus: 'approved', status: 'active' });
        logger.info(`Contractor signed: ${contract._id}`);
      }

      if (event.recipientId === '2') {
        // Company signed
        contract.companySigned  = true;
        contract.companySignedAt = new Date();
        contract.status          = 'active';
        await contract.save();
        await syncContractPdf(contract, serverBaseUrl, { force: true });

        // Activate worker
        await Worker.findByIdAndUpdate(contract.workerId, { status: 'active' });
        await markTalentRequestAsTalentHired(contract);
        logger.info(`Company signed — contract ACTIVE: ${contract._id}`);
      }
    }

    if (event.type === 'envelope_completed') {
      // Both parties signed — belt-and-suspenders update
      contract.workerSigned  = true;
      contract.companySigned = true;
      contract.status        = 'active';
      await contract.save();
      await syncContractPdf(contract, serverBaseUrl, { force: true });
      await Worker.findByIdAndUpdate(contract.workerId, { status: 'active' });
      await markTalentRequestAsTalentHired(contract);
      logger.info(`Envelope fully completed: ${contract._id}`);
    }

    res.sendStatus(200);
  } catch (err) { next(err); }
}

// ─── Contractor profile ───────────────────────────────────────────────────────

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const worker  = await getWorkerFromReq(req);
    const company = await Company.findById(worker.companyId).lean();
    const marketplaceProfile = getMarketplaceProfile(worker);

    ok(res, {
      workerId:      worker._id,
      firstName:     worker.firstName,
      lastName:      worker.lastName,
      email:         worker.email,
      phone:         worker.phone ?? '',
      roleTitle:     worker.roleTitle,
      companyName:   company?.companyName ?? 'Your Company',
      status:        worker.status,
      kycStatus:     worker.kycStatus,
      payRate:       worker.payRate,
      payCurrency:   worker.payCurrency,
      payFrequency:  worker.payFrequency,
      skills:        marketplaceProfile.skills,
      marketplaceTitle: marketplaceProfile.marketplaceTitle,
      marketplaceBio: marketplaceProfile.marketplaceBio,
      marketplaceAvailability: marketplaceProfile.marketplaceAvailability,
      marketplaceAvailabilityLabel: marketplaceProfile.marketplaceAvailabilityLabel,
      marketplaceRate: marketplaceProfile.marketplaceRate,
      city: marketplaceProfile.city,
      country: marketplaceProfile.country,
      responseTimeHours: marketplaceProfile.responseTimeHours,
      languages: marketplaceProfile.languages,
      profilePhotoUrl: marketplaceProfile.profilePhotoUrl,
      bannerImageUrl: marketplaceProfile.bannerImageUrl,
      profileOverview: marketplaceProfile.profileOverview,
      portfolioProjects: marketplaceProfile.portfolioProjects,
      servicePackages: marketplaceProfile.servicePackages,
      faqItems: marketplaceProfile.faqItems,
      onboardingStep: getSelfSignupOnboardingStep(worker),
      dateOfBirth: worker.contractorProfile?.dateOfBirth?.toISOString?.().slice(0, 10) ?? '',
      nationality: worker.contractorProfile?.nationality ?? '',
      addressLine1: worker.contractorProfile?.address?.line1 ?? '',
      addressLine2: worker.contractorProfile?.address?.line2 ?? '',
      state: worker.contractorProfile?.address?.state ?? '',
      postalCode: worker.contractorProfile?.address?.postalCode ?? '',
      taxId: worker.contractorProfile?.taxId ?? '',
      idType: worker.kycData?.idType ?? '',
      idNumber: worker.kycData?.idNumber ?? '',
      paymentMethod: worker.paymentDetails?.paymentMethod ?? '',
      wiseEmail: worker.paymentDetails?.wiseEmail ?? '',
      bankName: worker.paymentDetails?.bankName ?? '',
      accountNumber: worker.paymentDetails?.accountNumber ?? '',
      routingNumber: worker.paymentDetails?.routingNumber ?? '',
      swiftCode: worker.paymentDetails?.swiftCode ?? '',
      paypalEmail: worker.paymentDetails?.paypalEmail ?? '',
    });
  } catch (err) { next(err); }
}

export async function listMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const worker = await getWorkerFromReq(req);
    const notifications = await ContractorNotification.find({ workerId: worker._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    ok(res, notifications);
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const worker = await getWorkerFromReq(req);
    const notification = await ContractorNotification.findOneAndUpdate(
      { _id: req.params.id, workerId: worker._id },
      { readAt: new Date() },
      { new: true },
    );
    if (!notification) throw Errors.NotFound('Notification');
    ok(res, notification);
  } catch (err) {
    next(err);
  }
}

// ─── Invoice — submit ─────────────────────────────────────────────────────────

const submitInvoiceSchema = z.object({
  periodStart:  z.string().min(1),
  periodEnd:    z.string().min(1),
  amountGross:  z.number().positive(),
  description:  z.string().min(1),
  hoursWorked:  z.number().optional(),
});

export async function submitInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data     = submitInvoiceSchema.parse(req.body);
    const worker   = await getWorkerFromReq(req);

    if (worker.status !== 'active') {
      throw new AppError('Your account must be active to submit invoices', 403, 'ACCOUNT_NOT_ACTIVE');
    }

    const contract = await Contract.findOne({ workerId: worker._id, status: 'active' });
    if (!contract) throw new AppError('No active contract found', 404, 'NO_CONTRACT');

    // Check for duplicate invoice for same period
    const existing = await Invoice.findOne({
      workerId:    worker._id,
      periodStart: new Date(data.periodStart),
      status:      { $ne: 'disputed' },
    });
    if (existing) {
      throw new AppError('An invoice for this period already exists', 409, 'DUPLICATE_INVOICE');
    }

    const invoice = await Invoice.create({
      companyId:   worker.companyId,
      workerId:    worker._id,
      contractId:  contract._id,
      workerName:  `${worker.firstName} ${worker.lastName}`,
      workerRole:  worker.roleTitle,
      periodStart: new Date(data.periodStart),
      periodEnd:   new Date(data.periodEnd),
      amountGross: data.amountGross,
      currency:    worker.payCurrency,
      description: data.description,
      hoursWorked: data.hoursWorked ?? null,
      status:      'submitted',
      submittedAt: new Date(),
    });

    logger.info(`Invoice submitted: ${invoice._id} by worker ${worker._id}`);
    created(res, invoice);
  } catch (err) { next(err); }
}

// ─── Invoice — list mine ──────────────────────────────────────────────────────

export async function getMyInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const worker   = await getWorkerFromReq(req);
    const invoices = await Invoice.find({ workerId: worker._id })
      .sort({ submittedAt: -1 })
      .lean();
    ok(res, invoices);
  } catch (err) { next(err); }
}
