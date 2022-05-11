export type Address = string;

export enum Network {
  rinkeby = 4,
  // gnosisChain = 100,
}

export type FnEntry = {
  abi: string;
  notice: string;
  cid: string;
  disputed: string;
  sigHash: string;
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
