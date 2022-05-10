/**
 * @module radspec
 */
import type { Transaction } from '@blossom-labs/rosette-types';
import type { Fetcher } from '@blossom-labs/rosette-core';

import type { providers } from 'ethers';

import { decodeCalldata } from './decoder';
import { defaultHelpers } from './helpers';
import { evaluateRaw } from './lib';
import type { EvaluatorOptions } from './evaluator';
import { getDefaultFetcher } from './fetcher';

export interface EvaluateOptions {
  userHelpers?: Record<string, any>;
  fetcher?: Fetcher;
}

const getSigHash = (txData: string): string => {
  return txData.substring(0, 10);
};

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
  * radspec.evaluate(call, provider)
  *   .then(console.log) // => "Will multiply 122 by 7 and return 854."
  * @param transaction The transaction to decode for this evaluation
  * @param fetcher A rosette's protocol fetcher.
  * @param provider EIP 1193 provider
  * @param {?Object} options An options object
  * @param {?Object} options.userHelpers User defined helpers
  * @return {Promise<string>} The result of the evaluation
  */
async function evaluate(
  transaction: Transaction,
  provider: providers.Provider,
  options: EvaluateOptions,
) {
  const { fetcher = getDefaultFetcher(), userHelpers = {} } = options;
  const sigHash = getSigHash(transaction.data);
  const { abi, notice } = await fetcher.entry(
    transaction.to,
    sigHash,
    provider,
  );

  if (!abi || !notice) {
    throw new Error(`No description found for method ${sigHash}`);
  }

  const parameters = decodeCalldata(abi, transaction);
  const availableHelpers = { ...defaultHelpers, ...userHelpers };

  const evaluatorOptions: EvaluatorOptions = {
    availableHelpers,
    transaction,
    provider,
  };
  // Evaluate expression with bindings from the transaction data
  return evaluateRaw(notice, parameters, evaluatorOptions);
}

export default evaluate;
export { evaluate, evaluateRaw };

// Re-export some commonly used inner functionality
export { parse } from './parser';
export { scan } from './scanner';
