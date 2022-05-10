/**
 * @module radspec/helpers/HelperManager
 */
import type { TypedValue } from '../evaluator';
import type { HelperConfig, RadspecHelper } from '../types';

/**
 * Class for managing the execution of helper functions
 *
 * @class HelperManager
 * @param {Object} availableHelpers Defined helpers
 */
export default class HelperManager {
  readonly availableHelpers: Record<string, RadspecHelper>;

  constructor(availableHelpers = {}) {
    this.availableHelpers = availableHelpers;
  }

  /**
   * Does a helper exist
   *
   * @param  helper Helper name
   */
  exists(helper: string): boolean {
    return !!this.availableHelpers[helper];
  }

  /**
   * Execute a helper with some inputs
   *
   * @param helper Helper name
   * @param  {Array<radspec/evaluator/TypedValue>} inputs
   * @param  {Object} config Configuration for running helper
   * @param  {ethersProvider.Provider} config.provider Current provider
   * @param  {radspec/evaluator/Evaluator} config.evaluator Current evaluator
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  execute(
    helper: string,
    inputs: TypedValue[],
    config: HelperConfig,
  ): ReturnType<ReturnType<RadspecHelper>> {
    inputs = inputs.map((input) => input.value); // pass values directly
    return this.availableHelpers[helper](config)(...inputs);
  }
}
