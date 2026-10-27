import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { env } from '../config/env';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { TalentRequest, type ITalentRequest, type TalentRequestStatus } from '../models/TalentRequest';
import { Worker } from '../models/Worker';
import { ok, Errors, AppError } from '../utils/response';
import { sendEmail } from '../utils/email';

const ADMIN_AVAILABILITY_LABELS: Record<string, string> = {
  available_now: 'Available now',
  this_week: 'Available this week',
  two_weeks: '2 weeks notice',
  next_month: 'Available next month',
  not_available: 'Not available',
};

function normalizeStringList(value: unknown, limit = 10): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
    .slice(0, limit);
}

function normalizePortfolioProjects(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      const project = entry as Record<string, unknown>;
      const title = typeof project.title === 'string' ? project.title.trim() : '';
      const description = typeof project.description === 'string' ? project.description.trim() : '';
      const imageUrl = typeof project.imageUrl === 'string' ? project.imageUrl.trim() : '';
      const tags = normalizeStringList(project.tags, 8);

      if (!title || !description) {
        return null;
      }

      return { title, description, imageUrl, tags };
    })
    .filter(Boolean);
}

function normalizeServicePackages(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      const item = entry as Record<string, unknown>;
      const name = typeof item.name === 'string' ? item.name.trim() : '';
      const price = typeof item.price === 'number' ? item.price : Number(item.price ?? 0);
      const description = typeof item.description === 'string' ? item.description.trim() : '';
      const deliveryDays = typeof item.deliveryDays === 'number' ? item.deliveryDays : Number(item.deliveryDays ?? 0);
      const revisions = typeof item.revisions === 'number' ? item.revisions : Number(item.revisions ?? 0);
      const features = normalizeStringList(item.features, 12);

      if (!name || !Number.isFinite(price) || price <= 0) {
        return null;
      }

      return {
        name,
        price,
        description,
        deliveryDays: Number.isFinite(deliveryDays) && deliveryDays > 0 ? deliveryDays : null,
        revisions: Number.isFinite(revisions) && revisions >= 0 ? revisions : null,
        features,
      };
    })
    .filter(Boolean);
}

function hasCompletedMarketplaceProfile(worker: any): boolean {
  const title = worker.contractorProfile?.marketplaceTitle?.trim() ?? '';
  const bio = worker.contractorProfile?.marketplaceBio?.trim() ?? '';
  const rate = worker.contractorProfile?.marketplaceRate ?? worker.payRate ?? 0;
  const city = worker.contractorProfile?.city?.trim() || worker.contractorProfile?.address?.city?.trim() || '';
  const country = worker.contractorProfile?.address?.country?.trim() || worker.country?.trim() || '';
  const skills = Array.isArray(worker.contractorProfile?.skills) ? worker.contractorProfile.skills : [];
  const servicePackages = Array.isArray(worker.contractorProfile?.servicePackages)
    ? worker.contractorProfile.servicePackages
    : [];
  const hasServicePackagePrice = servicePackages.some((pkg: { price?: number | string } | null | undefined) => (
    pkg?.price !== undefined && Number(pkg.price) > 0
  ));

  return Boolean(
    title
    && title.toLowerCase() !== 'freelancer'
    && bio
    && Number(rate) > 0
    && city
    && country
    && country.toLowerCase() !== 'unknown'
    && skills.length > 0
    && hasServicePackagePrice
  );
}

function formatTalentProfile(worker: any) {
  if (!worker) {
    return null;
  }

  const city = worker?.contractorProfile?.city?.trim()
    || worker?.contractorProfile?.address?.city?.trim()
    || '';
  const country = worker?.contractorProfile?.address?.country?.trim()
    || worker?.country?.trim()
    || '';
  const availability = worker?.contractorProfile?.marketplaceAvailability ?? 'available_now';
  const overview = worker?.contractorProfile?.profileOverview?.trim()
    || worker?.contractorProfile?.marketplaceBio?.trim()
    || worker?.scopeOfWork?.trim()
    || '';

  return {
    workerId: worker._id?.toString?.() ?? '',
    location: city ? `${city}${country ? `, ${country}` : ''}` : (country || 'Remote'),
    availabilityLabel: ADMIN_AVAILABILITY_LABELS[availability] || 'Not provided',
    profilePhotoUrl: worker.contractorProfile?.profilePhotoUrl ?? '',
    phone: worker.phone ?? '',
    email: worker.email ?? '',
    responseTimeHours:
      typeof worker.contractorProfile?.responseTimeHours === 'number' && worker.contractorProfile.responseTimeHours > 0
        ? worker.contractorProfile.responseTimeHours
        : null,
    skills: normalizeStringList(worker.contractorProfile?.skills, 12),
    languages: normalizeStringList(worker.contractorProfile?.languages, 8),
    profileOverview: overview,
    portfolioProjects: normalizePortfolioProjects(worker.contractorProfile?.portfolioProjects),
    servicePackages: normalizeServicePackages(worker.contractorProfile?.servicePackages),
  };
}

function formatMarketplaceCandidateCard(worker: any) {
  if (!worker) {
    return null;
  }

  const city = worker?.contractorProfile?.city?.trim()
    || worker?.contractorProfile?.address?.city?.trim()
    || '';
  const country = worker?.contractorProfile?.address?.country?.trim()
    || worker?.country?.trim()
    || '';
  const availability = worker?.contractorProfile?.marketplaceAvailability ?? 'available_now';
  const skills = normalizeStringList(worker?.contractorProfile?.skills, 8);
  const servicePackages = normalizeServicePackages(worker?.contractorProfile?.servicePackages);
  const nonNullPackages = servicePackages.filter((pkg): pkg is NonNullable<typeof pkg> => Boolean(pkg));
  const featuredPackage = nonNullPackages.find((pkg) => pkg.name.toLowerCase().includes('basic'))
    ?? nonNullPackages.find((pkg) => pkg.price > 0)
    ?? servicePackages[0]
    ?? null;

  return {
    workerId: worker._id.toString(),
    name: `${worker.firstName} ${worker.lastName}`.trim(),
    role: worker.contractorProfile?.marketplaceTitle?.trim() || worker.roleTitle || 'Freelancer',
    location: city ? `${city}${country ? `, ${country}` : ''}` : (country || 'Remote'),
    country: worker.country ?? country ?? '',
    availability: availability,
    availabilityLabel: ADMIN_AVAILABILITY_LABELS[availability] || 'Not provided',
    skills,
    profilePhotoUrl: worker.contractorProfile?.profilePhotoUrl ?? '',
    profileOverview:
      worker?.contractorProfile?.profileOverview?.trim()
      || worker?.contractorProfile?.marketplaceBio?.trim()
      || worker?.scopeOfWork?.trim()
      || '',
    packagePrice: featuredPackage?.price ?? 0,
    currency: worker.payCurrency ?? 'USD',
  };
}

function scoreMarketplaceCandidate(worker: any, requestQuery: string) {
  const haystack = [
    worker.contractorProfile?.marketplaceTitle ?? '',
    worker.roleTitle ?? '',
    worker.contractorProfile?.marketplaceBio ?? '',
    worker.contractorProfile?.profileOverview ?? '',
    ...(Array.isArray(worker.contractorProfile?.skills) ? worker.contractorProfile.skills : []),
  ]
    .join(' ')
    .toLowerCase();

  const tokens = requestQuery
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);

  return tokens.reduce((score, token) => (
    haystack.includes(token) ? score + (worker.contractorProfile?.skills?.includes?.(token) ? 3 : 1) : score
  ), 0);
}

async function serializeTalentRequest(item: ITalentRequest) {
  const [worker, suggestedWorker, shortlistedWorkers] = await Promise.all([
    item.workerId ? Worker.findById(item.workerId).lean() : Promise.resolve(null),
    item.suggestedWorkerId ? Worker.findById(item.suggestedWorkerId).lean() : Promise.resolve(null),
    item.shortlistedWorkerIds?.length
      ? Worker.find({ _id: { $in: item.shortlistedWorkerIds } }).lean()
      : Promise.resolve([]),
  ]);
  const shortlistHistory = await Promise.all(
    (item.shortlistHistory ?? []).map(async (entry) => {
      const workersForEntry = entry.workerIds?.length
        ? await Worker.find({ _id: { $in: entry.workerIds } }).lean()
        : [];

      return {
        sentAt: entry.sentAt,
        note: entry.note ?? '',
        profiles: workersForEntry.map((shortlistedWorker) => ({
          workerId: shortlistedWorker._id.toString(),
          workerName: `${shortlistedWorker.firstName} ${shortlistedWorker.lastName}`.trim(),
          workerRole: shortlistedWorker.contractorProfile?.marketplaceTitle?.trim() || shortlistedWorker.roleTitle || 'Freelancer',
          profilePhotoUrl: shortlistedWorker.contractorProfile?.profilePhotoUrl ?? '',
          location: formatTalentProfile(shortlistedWorker)?.location ?? 'Remote',
          availabilityLabel: formatTalentProfile(shortlistedWorker)?.availabilityLabel ?? 'Not provided',
        })),
      };
    }),
  );

  return {
    ...item.toObject(),
    talentProfile: formatTalentProfile(worker),
    suggestedTalentProfile: suggestedWorker
      ? {
          workerId: suggestedWorker._id.toString(),
          workerName: `${suggestedWorker.firstName} ${suggestedWorker.lastName}`.trim(),
          workerRole: suggestedWorker.contractorProfile?.marketplaceTitle?.trim() || suggestedWorker.roleTitle || 'Freelancer',
          profilePhotoUrl: suggestedWorker.contractorProfile?.profilePhotoUrl ?? '',
          location: formatTalentProfile(suggestedWorker)?.location ?? 'Remote',
          availabilityLabel: formatTalentProfile(suggestedWorker)?.availabilityLabel ?? 'Not provided',
        }
      : null,
    shortlistedTalentProfiles: Array.isArray(shortlistedWorkers)
      ? shortlistedWorkers.map((shortlistedWorker) => ({
          workerId: shortlistedWorker._id.toString(),
          workerName: `${shortlistedWorker.firstName} ${shortlistedWorker.lastName}`.trim(),
          workerRole: shortlistedWorker.contractorProfile?.marketplaceTitle?.trim() || shortlistedWorker.roleTitle || 'Freelancer',
          profilePhotoUrl: shortlistedWorker.contractorProfile?.profilePhotoUrl ?? '',
          location: formatTalentProfile(shortlistedWorker)?.location ?? 'Remote',
          availabilityLabel: formatTalentProfile(shortlistedWorker)?.availabilityLabel ?? 'Not provided',
        }))
      : [],
    shortlistHistory,
  };
}

async function sendTalentRequestUpdateEmail(
  item: ITalentRequest,
  options: {
    profileName: string;
    profileRole: string;
    profileUrl: string;
    statusLabel: string;
  },
): Promise<void> {
  if (!item.email?.trim()) {
    return;
  }

  const reviewNotes = item.reviewNotes?.trim();
  const absoluteProfileUrl = options.profileUrl.startsWith('http')
    ? options.profileUrl
    : `${env.CLIENT_URL}${options.profileUrl}`;

  const html = `
<!DOCTYPE html>
<html>
<head><style>
body { font-family: 'DM Sans', Arial, sans-serif; background: #f8fafc; color: #0f172a; }
.wrap { max-width: 640px; margin: 32px auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 35px rgba(15, 23, 42, 0.08); }
.hero { background: linear-gradient(135deg, #1e1236, #6d3eb2); color: #fff; padding: 32px 36px; }
.content { padding: 32px 36px; }
.card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin: 20px 0; }
.row { margin-bottom: 10px; font-size: 14px; color: #475569; }
.row strong { color: #0f172a; }
.button { display: inline-block; margin-top: 12px; padding: 14px 24px; border-radius: 999px; background: #111827; color: #fff !important; text-decoration: none; font-weight: 700; }
.note { margin-top: 16px; color: #475569; line-height: 1.65; }
</style></head>
<body>
  <div class="wrap">
    <div class="hero">
      <h1 style="margin: 0; font-size: 28px;">Candidate profile ready for review</h1>
      <p style="margin: 12px 0 0; line-height: 1.6;">Dechub reviewed your request and shortlisted a marketplace profile for your team.</p>
    </div>
    <div class="content">
      <p>Hello ${item.contactFirstName || 'there'},</p>
      <p class="note">
        Your talent request is now marked as <strong>${options.statusLabel}</strong>. You can review the candidate profile below and continue with your hiring decision.
      </p>
      <div class="card">
        <div class="row"><strong>Company:</strong> ${item.companyName}</div>
        <div class="row"><strong>Candidate:</strong> ${options.profileName}</div>
        <div class="row"><strong>Role:</strong> ${options.profileRole}</div>
      </div>
      ${reviewNotes ? `<p class="note"><strong>Dechub note:</strong> ${reviewNotes}</p>` : ''}
      <a href="${absoluteProfileUrl}" class="button">Review marketplace profile</a>
      <p class="note">
        When you open the profile link, you’ll be redirected to the candidate’s marketplace page where you can review the fit and proceed with hiring.
      </p>
    </div>
  </div>
</body>
</html>`.trim();

  try {
    await sendEmail(
      item.email.trim().toLowerCase(),
      `Dechub candidate profile for ${item.companyName}`,
      html,
      { includeLogo: false },
    );
  } catch (err) {
    // Email issues should not block admin review actions.
  }
}

function createShortlistToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return { token, tokenHash, expiresAt };
}

async function sendShortlistedProfilesEmail(
  item: ITalentRequest,
  workerProfiles: Array<{
    workerId: string;
    workerName: string;
    workerRole: string;
  }>,
  token: string,
): Promise<void> {
  if (!item.email?.trim() || workerProfiles.length === 0) {
    return;
  }

  const profileLinks = workerProfiles
    .map((profile) => {
      const profileUrl = `${env.CLIENT_URL}/marketplace/${profile.workerId}?requestId=${encodeURIComponent(item._id.toString())}&token=${encodeURIComponent(token)}`;
      return `
        <li style="margin: 0 0 18px;">
          <div style="font-weight: 700; color: #0f172a;">${profile.workerName}</div>
          <div style="color: #475569; margin: 6px 0 10px;">${profile.workerRole}</div>
          <a href="${profileUrl}" style="display: inline-block; padding: 12px 18px; border-radius: 999px; background: #111827; color: #fff !important; text-decoration: none; font-weight: 700;">Review marketplace profile</a>
        </li>
      `.trim();
    })
    .join('');

  const reviewNotes = item.reviewNotes?.trim();
  const html = `
<!DOCTYPE html>
<html>
<head><style>
body { font-family: 'DM Sans', Arial, sans-serif; background: #f8fafc; color: #0f172a; }
.wrap { max-width: 680px; margin: 32px auto; background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 35px rgba(15, 23, 42, 0.08); }
.hero { background: linear-gradient(135deg, #1e1236, #6d3eb2); color: #fff; padding: 32px 36px; }
.content { padding: 32px 36px; }
.note { color: #475569; line-height: 1.7; }
</style></head>
<body>
  <div class="wrap">
    <div class="hero">
      <h1 style="margin: 0; font-size: 28px;">Shortlisted Dechub candidates for your request</h1>
      <p style="margin: 12px 0 0; line-height: 1.6;">We reviewed your hiring brief and shortlisted marketplace profiles for your team.</p>
    </div>
    <div class="content">
      <p>Hello ${item.contactFirstName || 'there'},</p>
      <p class="note">
        Review the candidate profiles below. When you click <strong>Continue</strong> on a profile, we’ll ask you to log in or sign up as a company so we can securely move that same request into hiring.
      </p>
      ${reviewNotes ? `<p class="note"><strong>Dechub note:</strong> ${reviewNotes}</p>` : ''}
      <ul style="list-style: none; padding: 0; margin: 24px 0 0;">
        ${profileLinks}
      </ul>
    </div>
  </div>
</body>
</html>`.trim();

  try {
    await sendEmail(
      item.email.trim().toLowerCase(),
      `Shortlisted Dechub candidates for ${item.companyName}`,
      html,
      { includeLogo: false },
    );
  } catch (err) {
    throw new AppError('We could not send the shortlist email right now. Please try again.', 500, 'EMAIL_SEND_FAILED');
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }).parse(req.body);

    const normalizedEmail = email.trim().toLowerCase();
    const adminEmails = (env.DECHUB_ADMIN_EMAILS || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (!adminEmails.includes(normalizedEmail)) {
      throw Errors.InvalidCredentials();
    }

    if (!env.DECHUB_ADMIN_PASSWORD || password !== env.DECHUB_ADMIN_PASSWORD) {
      throw Errors.InvalidCredentials();
    }

    const accessToken = signAccessToken({
      sub: normalizedEmail,
      email: normalizedEmail,
      role: 'dechub_admin',
      companyId: null,
    });
    const refreshToken = signRefreshToken({ sub: normalizedEmail });

    ok(res, { accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const payload = verifyRefreshToken(refreshToken);
    const normalizedEmail = payload.sub.trim().toLowerCase();
    const adminEmails = (env.DECHUB_ADMIN_EMAILS || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (!adminEmails.includes(normalizedEmail)) {
      throw Errors.InvalidToken();
    }

    const accessToken = signAccessToken({
      sub: normalizedEmail,
      email: normalizedEmail,
      role: 'dechub_admin',
      companyId: null,
    });
    const newRefreshToken = signRefreshToken({ sub: normalizedEmail });

    ok(res, { accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
}

export async function listTalentRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search = '', status = '', page = '1', perPage = '20', sort = 'createdAt' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, Number(page) || 1);
    const per = Math.max(1, Math.min(200, Number(perPage) || 20));

    const filter: Record<string, unknown> = {};
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { companyName: regex },
        { workerName: regex },
        { 'email': regex },
      ];
    }
    if (status) filter.status = status;

    const total = await TalentRequest.countDocuments(filter);
    const items = await TalentRequest.find(filter)
      .sort({ [sort]: -1 })
      .skip((pageNum - 1) * per)
      .limit(per)
      .lean();

    ok(res, { total, page: pageNum, perPage: per, items });
  } catch (err) { next(err); }
}

export async function getTalentRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id;
    const item = await TalentRequest.findById(id);
    if (!item) throw Errors.NotFound('Talent request');
    // mark as read when fetched by admin
    if (item.unread) {
      item.unread = false;
      await item.save();
    }

    ok(res, await serializeTalentRequest(item));
  } catch (err) { next(err); }
}

export async function updateTalentRequestStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id;
    const { status, suggestedWorkerId, reviewNotes } = req.body as {
      status?: TalentRequestStatus;
      suggestedWorkerId?: string;
      reviewNotes?: string;
    };
    if (!status) throw new AppError('Status is required', 400, 'INVALID_REQUEST');
    const allowed: TalentRequestStatus[] = ['pending_review', 'shortlisted_sent', 'candidate_selected', 'hire_started', 'approved', 'alternative_suggested', 'rejected', 'hired', 'talent_hired'];
    if (!allowed.includes(status)) throw new AppError(`Invalid status: ${status}. Allowed values are: ${allowed.join(', ')}`, 400, 'INVALID_REQUEST');

    const item = await TalentRequest.findById(id);
    if (!item) throw Errors.NotFound('Talent request');
    item.status = status;
    item.reviewNotes = typeof reviewNotes === 'string' ? reviewNotes.trim() : item.reviewNotes;
    item.reviewedAt = new Date();

    if (status === 'approved') {
      item.approvedAt = new Date();
      item.suggestedWorkerId = null;
    }

    if (status === 'alternative_suggested') {
      if (!suggestedWorkerId) {
        throw new AppError('Suggested worker is required', 400, 'INVALID_REQUEST');
      }

      const suggestedWorker = await Worker.findById(suggestedWorkerId);
      if (!suggestedWorker) {
        throw Errors.NotFound('Suggested worker');
      }

      item.suggestedWorkerId = suggestedWorker._id;
      item.approvedAt = null;
    }

    if (status === 'rejected') {
      item.approvedAt = null;
    }

    await item.save();

    if (status === 'approved' && item.workerId) {
      await sendTalentRequestUpdateEmail(item, {
        profileName: item.workerName,
        profileRole: item.workerRole,
        profileUrl: item.workerProfileUrl || `/marketplace/${item.workerId}`,
        statusLabel: 'approved',
      });
    }

    if (status === 'alternative_suggested' && item.suggestedWorkerId) {
      const suggestedWorker = await Worker.findById(item.suggestedWorkerId).lean();
      if (suggestedWorker) {
        await sendTalentRequestUpdateEmail(item, {
          profileName: `${suggestedWorker.firstName} ${suggestedWorker.lastName}`.trim(),
          profileRole: suggestedWorker.contractorProfile?.marketplaceTitle?.trim() || suggestedWorker.roleTitle || 'Freelancer',
          profileUrl: `/marketplace/${suggestedWorker._id}`,
          statusLabel: 'alternative suggested',
        });
      }
    }

    ok(res, await serializeTalentRequest(item));
  } catch (err) { next(err); }
}

export async function sendTalentRequestShortlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id;
    const { shortlistedWorkerIds, reviewNotes } = z.object({
      shortlistedWorkerIds: z.array(z.string().trim().min(1)).min(1).max(10),
      reviewNotes: z.string().trim().max(1200).optional(),
    }).parse(req.body);

    const item = await TalentRequest.findById(id);
    if (!item) throw Errors.NotFound('Talent request');

    const workers = await Worker.find({
      _id: { $in: shortlistedWorkerIds },
      workerType: 'contractor',
      status: { $nin: ['invited', 'terminated'] },
    }).lean();

    if (workers.length !== shortlistedWorkerIds.length) {
      throw new AppError('One or more shortlisted candidates could not be found.', 400, 'INVALID_REQUEST');
    }

    const existingShortlistWorkerIds = (item.shortlistedWorkerIds ?? []).map((value) => value.toString());
    const existingShortlistSentAt = item.shortlistSentAt;
    const existingHistory = item.shortlistHistory ?? [];
    const hasExistingShortlist = existingShortlistWorkerIds.length > 0 && Boolean(existingShortlistSentAt);
    const historyAlreadyTracksCurrentShortlist = existingHistory.some((entry) => {
      const entryWorkerIds = (entry.workerIds ?? []).map((value) => value.toString());
      return (
        Boolean(existingShortlistSentAt)
        && new Date(entry.sentAt).getTime() === new Date(existingShortlistSentAt as Date).getTime()
        && entryWorkerIds.length === existingShortlistWorkerIds.length
        && entryWorkerIds.every((workerId, index) => workerId === existingShortlistWorkerIds[index])
      );
    });

    if (hasExistingShortlist && !historyAlreadyTracksCurrentShortlist) {
      existingHistory.push({
        sentAt: existingShortlistSentAt as Date,
        note: item.reviewNotes ?? '',
        workerIds: item.shortlistedWorkerIds ?? [],
      });
    }

    const { token, tokenHash, expiresAt } = createShortlistToken();

    item.shortlistedWorkerIds = workers.map((worker) => worker._id);
    item.shortlistTokenHash = tokenHash;
    item.shortlistTokenExpiresAt = expiresAt;
    item.shortlistSentAt = new Date();
    item.reviewNotes = typeof reviewNotes === 'string' ? reviewNotes.trim() : item.reviewNotes;
    item.workerId = null;
    item.workerProfileUrl = '';
    item.suggestedWorkerId = null;
    item.hiredAt = null;
    item.talentHiredAt = null;
    item.status = 'shortlisted_sent';
    item.reviewedAt = new Date();
    item.approvedAt = null;
    item.shortlistHistory = [
      ...existingHistory,
      {
        sentAt: item.shortlistSentAt,
        note: item.reviewNotes,
        workerIds: workers.map((worker) => worker._id),
      },
    ];
    await item.save();

    await sendShortlistedProfilesEmail(
      item,
      workers.map((worker) => ({
        workerId: worker._id.toString(),
        workerName: `${worker.firstName} ${worker.lastName}`.trim(),
        workerRole: worker.contractorProfile?.marketplaceTitle?.trim() || worker.roleTitle || 'Freelancer',
      })),
      token,
    );

    ok(res, await serializeTalentRequest(item));
  } catch (err) {
    next(err);
  }
}

export async function unreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await TalentRequest.countDocuments({ unread: true });
    ok(res, { unread: count });
  } catch (err) { next(err); }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id;
    const item = await TalentRequest.findById(id);
    if (!item) throw Errors.NotFound('Talent request');
    item.unread = false;
    await item.save();
    ok(res, { success: true });
  } catch (err) { next(err); }
}

export async function listMarketplaceCandidatesForAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      requestId = '',
      q = '',
      availability = '',
      country = '',
      page = '1',
      perPage = '12',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Math.min(24, Number(perPage) || 12));

    let requestQuery = q.trim();
    if (requestId) {
      const request = await TalentRequest.findById(requestId).lean();
      if (request) {
        requestQuery = requestQuery || `${request.projectType} ${request.projectDescription}`;
      }
    }

    const workers = await Worker.find({
      workerType: 'contractor',
      status: { $nin: ['invited', 'terminated'] },
    }).lean();

    const filtered = workers
      .filter((worker) => hasCompletedMarketplaceProfile(worker))
      .map((worker) => ({
        worker,
        card: formatMarketplaceCandidateCard(worker),
      }))
      .filter((entry) => entry.card !== null)
      .filter((entry) => {
        const card = entry.card!;
        const query = q.trim().toLowerCase();
        const matchesQuery = !query || [
          card.name,
          card.role,
          card.location,
          card.profileOverview,
          ...card.skills,
        ].join(' ').toLowerCase().includes(query);
        const matchesAvailability = !availability || card.availability === availability;
        const matchesCountry = !country || card.country.toLowerCase() === country.toLowerCase();
        return matchesQuery && matchesAvailability && matchesCountry;
      })
      .map((entry) => ({
        ...entry,
        score: scoreMarketplaceCandidate(entry.worker, requestQuery),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        const availabilityRank = (value: string) => ({
          available_now: 4,
          this_week: 3,
          two_weeks: 2,
          next_month: 1,
          not_available: 0,
        }[value] ?? 0);

        return availabilityRank(b.card!.availability) - availabilityRank(a.card!.availability);
      });

    const total = filtered.length;
    const items = filtered
      .slice((pageNum - 1) * pageSize, pageNum * pageSize)
      .map((entry) => entry.card);

    const countryOptions = Array.from(
      new Set(filtered.map((entry) => entry.card!.country).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    ok(res, {
      total,
      page: pageNum,
      perPage: pageSize,
      items,
      filters: {
        countries: countryOptions,
      },
    });
  } catch (err) {
    next(err);
  }
}
