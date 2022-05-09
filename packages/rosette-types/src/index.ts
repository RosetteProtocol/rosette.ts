/**
 * Ethereum address.
 */
export type Address = string;

/**
 * A transaction object.
 */
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
