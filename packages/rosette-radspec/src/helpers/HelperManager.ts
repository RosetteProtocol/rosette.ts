/**
 * @module radspec/helpers/HelperManager
 */
import type { providers } from 'ethers';

import type { TypedValue } from '../evaluator';
import type { RadspecHelper, UninitializedRadspecHelper } from '../types';

/**
 * Class for managing the execution of helper functions
 *
 * @class HelperManager
 * @param {Object} availableHelpers Defined helpers
 */
export default class HelperManager {
  readonly availableHelpers: Record<string, RadspecHelper>;

  constructor(
    uninitializedHelpers: Record<string, UninitializedRadspecHelper> = {},
    config: { provider: providers.Provider; [x: string]: unknown },
  ) {
    this.availableHelpers = Object.keys(uninitializedHelpers).reduce<
      Record<string, RadspecHelper>
    >(
      (helpers, helperName) => ({
        ...helpers,
        [helperName]: uninitializedHelpers[helperName]({
          ...config,
          helperManager: this,
        }),
      }),
      {},
    );
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
    params: (TypedValue | undefined)[],
  ): ReturnType<ReturnType<UninitializedRadspecHelper>> {
    params = params.map((i) => (i ? i.value : '')); // pass values directly

    return this.availableHelpers[helper](...params);
  }
}
