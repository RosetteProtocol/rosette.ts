/**
 * @module radspec
 */
import type { Fetcher, Transaction } from '@blossom-labs/rosette-core';

import type { providers } from 'ethers';

import { decodeCalldata } from './decoder';
import { defaultHelpers } from './helpers';
import type { EvaluateRawOptions } from './lib';
import { evaluateRaw } from './lib';
import { getDefaultFetcher } from './fetcher';
import { getSigHash } from './utils';

export interface EvaluateOptions {
  userHelpers?: Record<string, any>;
  fetcher?: Fetcher;
}

/**
  * Evaluate a radspec expression for a transaction
  *
  * @example
  * import * as radspec from 'radspec'
  *
  * const transaction: {
  *   to: '0x8521742d3f456bd237e312d6e30724960f72517a',
  *   data: '0xc6888fa1000000000000000000000000000000000000000000000000000000000000007a'
  * }
 
  *
  * radspec.evaluate(transaction, provider)
  *   .then(console.log) // => "Will multiply 122 by 7 and return 854."
  * @param transaction The transaction to decode for this evaluation
  * @param provider EIP 1193 provider
  * @param options An options object
  * @param options.userHelpers User defined helpers
  * @param options.fetcher A rosette's protocol fetcher.
  * @return {Promise<string>} The result of the evaluation
  */
async function evaluate(
  transaction: Transaction,
  provider: providers.Provider,
  options?: EvaluateOptions,
): Promise<string | undefined> {
  const { fetcher = getDefaultFetcher(), userHelpers = {} } = options || {};
  const availableHelpers = { ...defaultHelpers, ...userHelpers };
  const sigHash = getSigHash(transaction.data);
  const { abi, notice } = await fetcher.entry(
    transaction.to,
    sigHash,
    provider,
  );
  const bindings = decodeCalldata(abi, transaction);

  // Evaluate expression with bindings from the transaction data
  return evaluateRaw(notice, bindings, provider, {
    availableHelpers,
    fetcher,
    transaction,
  });
}

export default evaluate;

// Re-export some commonly used inner functionality
export { evaluate, evaluateRaw };
export type { EvaluateRawOptions };
export { decodeCalldata };
export { getDefaultFetcher };
export { parse } from './parser';
export { scan } from './scanner';

export * from './types';
export * from './errors';
