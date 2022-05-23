import { BigNumber } from 'ethers';

import { TypedValue } from '../evaluator';
import type { RadspecHelper } from '../types';
import { formatBN, tenPow } from './lib/formatBN';

export const withDecimals: RadspecHelper =
  () =>
  /**
   * Format an numerical amount with its decimals
   *
   * @param {*} amount The absolute amount, without any decimals.
   * @param decimals The number of decimal places to format to. Defaults to 18.
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  (amount: any, decimals = 18) => {
    const amountBn = BigNumber.from(amount);

    const formattedAmount = formatBN(
      amountBn,
      tenPow(decimals),
      Number(decimals),
      false,
    );

    return new TypedValue('string', formattedAmount);
  };
