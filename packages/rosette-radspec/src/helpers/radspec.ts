import type { Address } from '@blossom-labs/rosette-core';

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
  async (to: Address, data: string): Promise<TypedValue> => {
    const transaction = { to, data };
    const { abi, notice } = await fetcher.entry(to, getSigHash(data), provider);

    const bindings = decodeCalldata(abi, transaction);

    return new TypedValue(
      'string',
      await evaluateRaw(notice, bindings, provider, {
        availableHelpers: helperManager.availableHelpers,
        fetcher,
        transaction,
      }),
    );
  };
