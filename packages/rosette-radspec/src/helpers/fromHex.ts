import { BigNumber, utils as ethersUtils } from 'ethers';

export default () =>
  /**
   * Returns the string representation of a given hex value
   *
   * @param hex The hex string
   * @param [to='utf8'] The type to convert the hex from (supported types: 'utf8', 'number')
   * @return {radspec/evaluator/TypedValue}
   */
  (hex: string, to = 'utf8') => ({
    type: 'string',
    value:
      to === 'number'
        ? BigNumber.from(hex).toNumber()
        : ethersUtils.toUtf8String(hex),
  });
