import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { TalentRequest } from '../models/TalentRequest';
import { Worker } from '../models/Worker';
import { CompanyAuth } from '../models/CompanyAuth';
import { Company } from '../models/Company';
import { ok, Errors, AppError } from '../utils/response';

const AVAILABILITY_LABELS: Record<string, string> = {
  available_now: 'Available now',
  this_week: 'Available this week',
  two_weeks: '2 weeks notice',
  next_month: 'Available next month',
  not_available: 'Not available',
};

async function getCompanyForUser(userId: string) {
  const account = await CompanyAuth.findById(userId);
  if (!account?.companyId) throw Errors.NotFound('Company');
  const company = await Company.findById(account.companyId);
  if (!company) throw Errors.NotFound('Company');
  return { account, company };
}

function buildProfileSummary(worker: any) {
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

  return {
    workerId: worker._id.toString(),
    workerName: `${worker.firstName} ${worker.lastName}`.trim(),
    workerRole: worker.contractorProfile?.marketplaceTitle?.trim() || worker.roleTitle || 'Freelancer',
    profilePhotoUrl: worker.contractorProfile?.profilePhotoUrl ?? '',
    location: city ? `${city}${country ? `, ${country}` : ''}` : (country || 'Remote'),
    availabilityLabel: AVAILABILITY_LABELS[availability] || 'Not provided',
    email: worker.email ?? '',
    country: worker.country ?? country ?? '',
    track: worker.track ?? '',
  };
}

async function serializeRequest(item: any) {
  const source = typeof item?.toObject === 'function' ? item.toObject() : item;

  const [worker, suggestedWorker, shortlistedWorkers] = await Promise.all([
    source.workerId ? Worker.findById(source.workerId).lean() : Promise.resolve(null),
    source.suggestedWorkerId ? Worker.findById(source.suggestedWorkerId).lean() : Promise.resolve(null),
    Array.isArray(source.shortlistedWorkerIds) && source.shortlistedWorkerIds.length
      ? Worker.find({ _id: { $in: source.shortlistedWorkerIds } }).lean()
      : Promise.resolve([]),
  ]);
  const shortlistHistory = await Promise.all(
    (source.shortlistHistory ?? []).map(async (entry: any) => {
      const workersForEntry = entry.workerIds?.length
        ? await Worker.find({ _id: { $in: entry.workerIds } }).lean()
        : [];

      return {
        sentAt: entry.sentAt,
        note: entry.note ?? '',
        profiles: workersForEntry.map((shortlistedWorker) => buildProfileSummary(shortlistedWorker)).filter(Boolean),
      };
    }),
  );

  return {
    ...source,
    _id: source._id?.toString?.() ?? source._id,
    companyId: source.companyId?.toString?.() ?? source.companyId ?? null,
    workerId: source.workerId?.toString?.() ?? source.workerId ?? null,
    originalWorkerId: source.originalWorkerId?.toString?.() ?? source.originalWorkerId ?? null,
    suggestedWorkerId: source.suggestedWorkerId?.toString?.() ?? source.suggestedWorkerId ?? null,
    talentProfile: buildProfileSummary(worker),
    suggestedTalentProfile: buildProfileSummary(suggestedWorker),
    shortlistedTalentProfiles: Array.isArray(shortlistedWorkers)
      ? shortlistedWorkers.map((shortlistedWorker) => buildProfileSummary(shortlistedWorker)).filter(Boolean)
      : [],
    shortlistHistory,
  };
}

export async function listCompanyTalentRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { company } = await getCompanyForUser(req.user!.sub);
    const items = await TalentRequest.find({ companyId: company._id }).sort({ createdAt: -1 }).limit(100).lean();
    const serialized = await Promise.all(items.map((item) => serializeRequest(item)));
    ok(res, serialized);
  } catch (err) {
    next(err);
  }
}

export async function getCompanyTalentRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { company } = await getCompanyForUser(req.user!.sub);
    const item = await TalentRequest.findOne({ _id: req.params.id, companyId: company._id });
    if (!item) throw Errors.NotFound('Talent request');
    ok(res, await serializeRequest(item));
  } catch (err) {
    next(err);
  }
}

export async function acceptSuggestedTalent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { company } = await getCompanyForUser(req.user!.sub);
    const item = await TalentRequest.findOne({ _id: req.params.id, companyId: company._id });
    if (!item) throw Errors.NotFound('Talent request');
    if (item.status !== 'alternative_suggested' || !item.suggestedWorkerId) {
      throw new AppError('This request does not have a suggested profile to accept', 400, 'INVALID_REQUEST');
    }

    const suggestedWorker = await Worker.findById(item.suggestedWorkerId);
    if (!suggestedWorker) {
      throw Errors.NotFound('Suggested worker');
    }

    item.originalWorkerId = item.originalWorkerId ?? item.workerId;
    item.workerId = suggestedWorker._id;
    item.workerName = `${suggestedWorker.firstName} ${suggestedWorker.lastName}`.trim();
    item.workerRole = suggestedWorker.contractorProfile?.marketplaceTitle?.trim() || suggestedWorker.roleTitle || 'Freelancer';
    item.workerProfileUrl = `/marketplace/${suggestedWorker._id}`;
    item.status = 'pending_review';
    item.reviewedAt = null;
    item.approvedAt = null;
    item.unread = true;
    item.suggestedWorkerId = null;
    await item.save();

    ok(res, await serializeRequest(item));
  } catch (err) {
    next(err);
  }
}

export async function getTalentRequestHirePrefill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { company } = await getCompanyForUser(req.user!.sub);
    const item = await TalentRequest.findOne({ _id: req.params.id, companyId: company._id });
    if (!item) throw Errors.NotFound('Talent request');
    if (!['approved', 'candidate_selected', 'hire_started'].includes(item.status)) {
      throw new AppError('This request is not approved for hiring yet', 400, 'REQUEST_NOT_APPROVED');
    }

    if (item.status !== 'hire_started') {
      item.status = 'hire_started';
      await item.save();
    }

    const worker = await Worker.findById(item.workerId).lean();
    if (!worker) throw Errors.NotFound('Talent profile');

    const [firstName, ...rest] = item.workerName.trim().split(/\s+/).filter(Boolean);
    const lastName = rest.join(' ');

    ok(res, {
      talentRequestId: item._id.toString(),
      initialData: {
        workerType: 'contractor',
        track: worker.track ?? 'track_2_us',
        firstName: firstName || worker.firstName || '',
        lastName: lastName || worker.lastName || '',
        email: worker.email ?? '',
        roleTitle: item.workerRole || worker.roleTitle || '',
        country: worker.country || worker.contractorProfile?.address?.country || '',
        department: '',
        selectedServices: [
          'hrms',
          'payroll',
          'contracts_compliance',
          'it_management',
        ],
        payRate: '',
        payCurrency: 'USD',
        payFrequency: 'monthly',
        startDate: '',
        endDate: '',
        noticePeriodDays: '30',
        scopeOfWork: item.projectDescription || '',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function claimShortlistedTalentRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { company, account } = await getCompanyForUser(req.user!.sub);
    const { token, workerId } = req.body as { token?: string; workerId?: string };

    if (!token?.trim() || !workerId?.trim()) {
      throw new AppError('Token and worker selection are required.', 400, 'INVALID_REQUEST');
    }

    const item = await TalentRequest.findById(req.params.id);
    if (!item) throw Errors.NotFound('Talent request');

    const canResumePendingHire = ['candidate_selected', 'hire_started'].includes(item.status);
    if (!['shortlisted_sent', 'candidate_selected', 'hire_started'].includes(item.status)) {
      throw new AppError('This talent request is not waiting for shortlisted profile selection.', 400, 'INVALID_REQUEST');
    }

    if (item.status === 'shortlisted_sent') {
      if (!item.shortlistTokenHash || !item.shortlistTokenExpiresAt || item.shortlistTokenExpiresAt.getTime() < Date.now()) {
        throw new AppError('This shortlist link has expired. Please ask Dechub to send a fresh shortlist email.', 401, 'INVALID_TOKEN');
      }

      const providedHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
      if (providedHash !== item.shortlistTokenHash) {
        throw new AppError('This shortlist link is invalid. Please use the latest email from Dechub.', 401, 'INVALID_TOKEN');
      }
    } else if (!canResumePendingHire) {
      throw new AppError('This shortlist link is no longer active. Please ask Dechub to send a fresh shortlist email.', 401, 'INVALID_TOKEN');
    }

    const itemEmail = item.email.trim().toLowerCase();
    const accountEmail = account.email.trim().toLowerCase();
    const itemCompanyId = item.companyId?.toString?.() ?? item.companyId?.toString?.() ?? null;
    const currentCompanyId = company._id.toString();

    if (item.status === 'shortlisted_sent') {
      if (itemEmail !== accountEmail) {
        throw new AppError('Please log in with the same company email that received the shortlist.', 403, 'EMAIL_MISMATCH');
      }
    } else if (itemCompanyId && itemCompanyId !== currentCompanyId) {
      throw new AppError('This shortlist is already linked to a different company workspace.', 403, 'EMAIL_MISMATCH');
    }

    const shortlistedIds = (item.shortlistedWorkerIds ?? []).map((entry) => entry.toString());
    if (!shortlistedIds.includes(workerId.trim())) {
      throw new AppError('This candidate was not part of the shortlisted profiles for this request.', 400, 'INVALID_REQUEST');
    }

    const worker = await Worker.findById(workerId.trim());
    if (!worker) throw Errors.NotFound('Talent profile');

    item.companyId = company._id;
    item.workerId = worker._id;
    item.workerName = `${worker.firstName} ${worker.lastName}`.trim();
    item.workerRole = worker.contractorProfile?.marketplaceTitle?.trim() || worker.roleTitle || 'Freelancer';
    item.workerProfileUrl = `/marketplace/${worker._id}`;
    item.status = 'candidate_selected';
    item.approvedAt = new Date();
    await item.save();

    ok(res, await serializeRequest(item));
  } catch (err) {
    next(err);
  }
}

export async function switchShortlistedTalentRequestProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { company } = await getCompanyForUser(req.user!.sub);
    const { workerId } = req.body as { workerId?: string };

    if (!workerId?.trim()) {
      throw new AppError('Worker selection is required.', 400, 'INVALID_REQUEST');
    }

    const item = await TalentRequest.findOne({ _id: req.params.id, companyId: company._id });
    if (!item) throw Errors.NotFound('Talent request');

    if (!['candidate_selected', 'hire_started'].includes(item.status)) {
      throw new AppError('This talent request is not in a switchable shortlist state.', 400, 'INVALID_REQUEST');
    }

    const shortlistedIds = (item.shortlistedWorkerIds ?? []).map((entry) => entry.toString());
    if (!shortlistedIds.includes(workerId.trim())) {
      throw new AppError('This candidate was not part of the shortlisted profiles for this request.', 400, 'INVALID_REQUEST');
    }

    const worker = await Worker.findById(workerId.trim());
    if (!worker) throw Errors.NotFound('Talent profile');

    item.workerId = worker._id;
    item.workerName = `${worker.firstName} ${worker.lastName}`.trim();
    item.workerRole = worker.contractorProfile?.marketplaceTitle?.trim() || worker.roleTitle || 'Freelancer';
    item.workerProfileUrl = `/marketplace/${worker._id}`;
    item.status = 'candidate_selected';
    item.approvedAt = new Date();
    await item.save();

    ok(res, await serializeRequest(item));
  } catch (err) {
    next(err);
  }
}
