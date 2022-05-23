import type { EvaluatorOptions } from '../evaluator';
import { evaluate } from '../evaluator';
import { parse } from '../parser';
import { scan } from '../scanner';
import type { Bindings } from '../types';

/**
 * Evaluate a radspec expression with manual bindings.
 *
 * @example
 * import radspec from 'radspec'
 *
 * radspec.evaluateRaw('a is `a`', {
 *   a: { type: 'int256', value: 10 }
 * }).then(console.log)
 * @param  {string} source The radspec expression
 * @param  {Bindings} bindings An object of bindings and their values
 * @param {?Object} evaluatorOptions An options object for the evaluator (see Evaluator)
 * @return {Promise<string>} The result of the evaluation
 */
export const evaluateRaw = async (
  source: string,
  bindings: Bindings,
  evaluatorOptions: EvaluatorOptions,
): Promise<string | undefined> => {
  const tokens = await scan(source);

  if (!tokens) {
    return;
  }

  const ast = await parse(tokens);

  return evaluate(ast, bindings, evaluatorOptions);
};
