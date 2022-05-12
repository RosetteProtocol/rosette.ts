import type { Transaction } from '@blossom-labs/rosette-core';

import { decodeCalldata } from '../decoder';
import { TypedValue } from '../evaluator';
import { evaluateRaw } from '../lib';
import type { RadspecHelper } from '../types';
import { getSigHash } from '../utils';

export const radspec: RadspecHelper =
  ({ evaluator: { fetcher, helperManager, provider } }) =>
  /**
   * Interpret calldata using radspec recursively
   *
   * @param transaction The calldata of the call
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (transaction: Transaction): Promise<TypedValue> => {
    const { to, data } = transaction;
    const { abi, notice } = await fetcher.entry(to, getSigHash(data), provider);

    const parameters = decodeCalldata(abi, transaction);

    return new TypedValue(
      'string',
      await evaluateRaw(notice, parameters, {
        fetcher,
        provider,
        availableHelpers: helperManager.availableHelpers,
        transaction,
      }),
    );
  };
