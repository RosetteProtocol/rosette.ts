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
