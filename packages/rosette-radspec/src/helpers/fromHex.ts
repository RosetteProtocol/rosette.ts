import { BigNumber, utils as ethersUtils } from 'ethers';

import { TypedValue } from '../evaluator';
import type { RadspecHelper } from '../types';

export const fromHex: RadspecHelper =
  () =>
  /**
   * Returns the string representation of a given hex value
   *
   * @param hex The hex string
   * @param [to='utf8'] The type to convert the hex from (supported types: 'utf8', 'number')
   * @return {radspec/evaluator/TypedValue}
   */
  (hex: string, to = 'utf8') =>
    new TypedValue(
      'string',
      to === 'number'
        ? BigNumber.from(hex).toNumber()
        : ethersUtils.toUtf8String(hex),
    );
