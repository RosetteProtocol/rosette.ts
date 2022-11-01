import { BigNumber } from 'ethers';

import { TypedValue } from '../evaluator';

import type { UninitializedRadspecHelper } from '../types';

import { formatBN, tenPow } from './lib/formatBN';

export const formatPct: UninitializedRadspecHelper =
  () =>
  /**
   * Format a percentage amount
   *
   * @param {*} value The number to be formatted as a percentage
   * @param {*} [base=10^18] The number that is considered to be 100% when calculating the percentage
   * @param {*} [precision=2] The number of decimal places to format to
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  (value: any, base = tenPow(18), precision = 2) => {
    const valueBn = BigNumber.from(value);
    const baseBn = BigNumber.from(base);

    const oneHundred = tenPow(2);
    const formattedAmount = formatBN(
      valueBn.mul(oneHundred),
      baseBn,
      Number(precision),
    );

    return new TypedValue('string', `${formattedAmount}`);
  };
