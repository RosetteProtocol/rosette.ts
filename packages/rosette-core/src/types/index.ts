export type Address = string;

export enum Network {
  rinkeby = 4,
  goerli = 5,
  // gnosisChain = 100,
}

export enum FnDescriptionStatus {
  Available = 'available',
  Added = 'added',
}

export type FnEntry = {
  abi: string;
  cid: string;
  contract: string;
  id: string;
  notice: string;
  sigHash: string;
  status: FnDescriptionStatus;
  submitter: string;
  upsertAt: number;
};

export interface Transaction {
  from?: Address;
  /**
   * The destination address for this transaction.
   */
  to: Address;
  /**
   * The transaction calldata.
   */
  data: string;
  value?: string | number;
}
