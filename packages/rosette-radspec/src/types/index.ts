export * from './ast';
export * from './binding';
export * from './radspec-helper';
export * from './token';
export * from './solidity';

export type Address = string;

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
