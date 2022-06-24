import type { providers } from 'ethers';

import { defaultHelpers } from '../helpers';
import type { EvaluatorOptions } from '../evaluator';
import { evaluate } from '../evaluator';
import { parse } from '../parser';
import { scan } from '../scanner';
import { getDefaultFetcher } from '../fetcher';
import type { Bindings } from '../types';

export type EvaluateRawOptions = Partial<
  Pick<EvaluatorOptions, 'availableHelpers' | 'fetcher' | 'transaction'>
>;
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
    fetcher = getDefaultFetcher(),
    availableHelpers = { ...defaultHelpers },
    transaction = { to: '', data: '' },
  } = evaluatorOptions || {};

  const tokens = await scan(notice);

  if (!tokens) {
    return;
  }

  const ast = await parse(tokens);

  return evaluate(ast, bindings, {
    availableHelpers,
    fetcher,
    provider,
    transaction,
  });
};
