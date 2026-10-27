import { IContract } from '../models/Contract';

// MVP local signing; replace with DocuSign provider later.
export async function locallySignContract(contract: IContract): Promise<IContract> {
  if (contract.workerSigned) {
    return contract;
  }

  const signedAt = new Date();

  contract.workerSigned = true;
  contract.workerSignedAt = contract.workerSignedAt ?? signedAt;
  contract.status = contract.companySigned ? 'active' : 'worker_signed';

  await contract.save();
  return contract;
}
