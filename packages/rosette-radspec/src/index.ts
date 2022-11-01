/**
 * @module radspec
 */
import type { providers } from 'ethers';

import { decodeCalldata } from './decoder';
import { HelperManager, defaultHelpers } from './helpers';
import type { EvaluateRawOptions } from './lib';
import { evaluateRaw } from './lib';
import type { Transaction, UninitializedRadspecHelper } from './types';

export interface EvaluateOptions {
  helpersConfig?: { [x: string]: unknown };
  userHelpers?: Record<string, UninitializedRadspecHelper>;
}

/**
 * Evaluate a radspec expression for a transaction
 *
 * @param expression The radspec expression
 * @param abi The ABI used to decode the transaction data
 * @param tx The transaction to decode for this evaluation
 * @param provider EIP 1193 provider
 * @param options An options object
 * @param options.userHelpers User defined helpers
 * @param options.helpersConfig Helpers additional config
 * @return {Promise<string>} The result of the evaluation
 * @example
 * import * as radspec from 'radspec'
 *
 * const expression = 'Will multiply `a` by 7 and return `a * 7`.'
 * const call = {
 *   abi: [{
 *     name: 'multiply',
 *     constant: false,
 *     type: 'function',
 *     inputs: [{
 *       name: 'a',
 *       type: 'uint256'
 *     }],
 *     outputs: [{
 *       name: 'd',
 *       type: 'uint256'
 *     }]
 *   }],
 * const transaction: {
 *   to: '0x8521742d3f456bd237e312d6e30724960f72517a',
 *   data: '0xc6888fa1000000000000000000000000000000000000000000000000000000000000007a'
 * }
 *
 * radspec.evaluate(notice, abi, transaction, provider)
 *   .then(console.log) // => "Will multiply 122 by 7 and return 854."
 */
async function evaluate(
  expression: string,
  abi: string,
  tx: Transaction,
  provider: providers.Provider,
  options?: EvaluateOptions,
): Promise<string | undefined> {
  const { userHelpers = {}, helpersConfig = {} } = options || {};
  const availableHelpers = { ...defaultHelpers, ...userHelpers };

  const bindings = decodeCalldata(abi, tx);

  // Evaluate expression with bindings from the transaction data
  return evaluateRaw(expression, bindings, provider, {
    helperManager: new HelperManager(availableHelpers, {
      ...helpersConfig,
      provider,
    }),
    transaction: tx,
  });
}

export default evaluate;

// Re-export some commonly used inner functionality
export { evaluate, evaluateRaw };
export type { EvaluateRawOptions };
export { decodeCalldata };
export * from './helpers';
export { parse } from './parser';
export { scan } from './scanner';

export type {
  HelperConfig,
  RadspecHelper,
  UninitializedRadspecHelper,
} from './types';
export * from './errors';
