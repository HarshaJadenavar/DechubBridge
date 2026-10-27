import { Request, Response, NextFunction } from 'express';
import { Contract } from '../models/Contract';
import { Company } from '../models/Company';
import { Worker } from '../models/Worker';
import { TalentRequest } from '../models/TalentRequest';
import { ContractorNotification } from '../models/ContractorNotification';
import { ok, AppError, Errors } from '../utils/response';
import { sendContractActivatedEmail } from '../utils/email';
import { syncContractPdf } from '../services/contractPdf.service';

async function getCompanyForUser(userId: string) {
  const company = await Company.findOne({ ownerId: userId });
  if (!company) throw Errors.NotFound('Company');
  return company;
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

export async function listContracts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await getCompanyForUser(req.user!.sub);
    const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
    const contracts = await Contract.find({ companyId: company._id }).sort({ createdAt: -1 });

    await Promise.all(contracts.map(async (contract) => {
      if (!contract.pdfUrl && (contract.workerSigned || contract.companySigned || contract.status === 'active')) {
        await syncContractPdf(contract, serverBaseUrl);
      }
    }));

    ok(res, contracts.map((contract) => ({
      ...contract.toObject(),
      workerRole: contract.roleTitle,
      track: contract.track === 'track_2_us' ? 'track_2' : 'track_1',
      contractType: contract.contractType === 'full_time_employee' ? 'employment' : 'contractor',
    })));
  } catch (err) {
    next(err);
  }
}

export async function countersignContract(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await getCompanyForUser(req.user!.sub);
    const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
    const contract = await Contract.findOne({ _id: req.params.id, companyId: company._id });
    if (!contract) throw Errors.NotFound('Contract');
    if (!contract.workerSigned) {
      throw new AppError('The contractor must sign before you countersign.', 400, 'WORKER_SIGNATURE_REQUIRED');
    }
    if (contract.companySigned || contract.status === 'active') {
      ok(res, contract);
      return;
    }

    contract.companySigned = true;
    contract.companySignedAt = contract.companySignedAt ?? new Date();
    contract.status = 'active';
    await contract.save();
    await syncContractPdf(contract, serverBaseUrl, { force: true });

    const worker = await Worker.findById(contract.workerId);
    if (!worker) throw Errors.NotFound('Worker');

    worker.status = 'active';
    worker.kycStatus = 'approved';
    await worker.save();

    await ContractorNotification.create({
      workerId: worker._id,
      type: 'contract_activated',
      title: 'Contract active',
      message: `Your contract with ${contract.companyName} is now fully signed and active.`,
      actionUrl: '/contractor/dashboard?tab=contract',
    });

    try {
      await sendContractActivatedEmail(worker.email, worker.firstName, contract.companyName);
    } catch {
      // Countersigning should succeed even if email delivery fails.
    }
    await markTalentRequestAsTalentHired(contract);

    ok(res, {
      ...contract.toObject(),
      workerRole: contract.roleTitle,
      track: contract.track === 'track_2_us' ? 'track_2' : 'track_1',
      contractType: contract.contractType === 'full_time_employee' ? 'employment' : 'contractor',
    });
  } catch (err) {
    next(err);
  }
}
