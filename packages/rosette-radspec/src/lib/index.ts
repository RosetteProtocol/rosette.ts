import type { providers } from 'ethers';

import { evaluate } from '../evaluator';
import { HelperManager } from '../helpers';
import { parse } from '../parser';
import { scan } from '../scanner';
import type { Bindings, Transaction } from '../types';

export type EvaluateRawOptions = {
  helperManager: HelperManager;
  transaction: Transaction;
};
/**
 * Evaluate a radspec expression with manual bindings.
 *
 * @example
 * import radspec from 'radspec'
 *
 * radspec.evaluateRaw('a is `a`', {
 *   a: { type: 'int256', value: 10 }
 * }).then(console.log)
 * @param notice The radspec expression
 * @param bindings An object of bindings and their values
 * @param provider An ethers provider.
 * @param evaluatorOptions An options object for the evaluator (see Evaluator)
 * @return {Promise<string>} The result of the evaluation
 */
export const evaluateRaw = async (
  notice: string,
  bindings: Bindings,
  provider: providers.Provider,
  evaluatorOptions?: EvaluateRawOptions,
): Promise<string | undefined> => {
  const {
    helperManager = new HelperManager({}, { provider }),
    transaction = { to: '', data: '' },
  } = evaluatorOptions || {};

  const tokens = await scan(notice);

  if (!tokens) {
    return;
  }

  const ast = await parse(tokens);

  return evaluate(ast, bindings, {
    helperManager,
    provider,
    transaction,
  });
};
