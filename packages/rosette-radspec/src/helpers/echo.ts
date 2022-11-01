import { TypedValue } from '../evaluator';
import type { UninitializedRadspecHelper } from '../types';

export const echo: UninitializedRadspecHelper =
  () =>
  /**
   * Repeats a string (testing helper)
   *
   * @param {string} echo The string
   * @param {*} [repeat=1] Number of times to repeat the string
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  (echo: string, repeat = 1) =>
    new TypedValue('string', echo.repeat(Number(repeat)));
