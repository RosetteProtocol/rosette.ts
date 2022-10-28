import type { providers } from 'ethers';

import { decodeCalldata } from '../decoder';
import { RadspecHelperError } from '../errors';
import { TypedValue } from '../evaluator';
import { evaluateRaw } from '../lib';
import type { UninitializedRadspecHelper } from '../types';

export type MetadataFetcher = {
  getFnMetadata: (
    contractAddress: string,
    fnSigHash: string,
    provider: providers.Provider,
  ) => Promise<{ abi: string; notice: string }>;
};

const isFetcher = (fetcher: any): fetcher is MetadataFetcher => {
  return !!fetcher.getFnMetadata;
};

const getSigHash = (txData: string): string => {
  return txData.substring(0, 10);
};

export const radspec: UninitializedRadspecHelper = ({
  helperManager,
  provider,
  fetcher,
}) => {
  if (!fetcher) {
    throw new RadspecHelperError(
      'radspec',
      'failed to initialize function. No fetcher provided',
    );
  }
  if (!isFetcher(fetcher)) {
    throw new RadspecHelperError(
      'radspec',
      'failed to initialize function. Invalid fetcher provided',
    );
  }

  /**
   * Interpret calldata using radspec recursively
   *
   * @param transaction The calldata of the call
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  return async (to: string, calldata: string): Promise<TypedValue> => {
    const transaction = { to, data: calldata };
    // const { abi, notice } = await fetcher.entry(to, getSigHash(data), provider);
    const { abi, notice } = await fetcher.getFnMetadata(
      to,
      getSigHash(calldata),
      provider,
    );

    const bindings = decodeCalldata(abi, transaction);

    return new TypedValue(
      'string',
      await evaluateRaw(notice, bindings, provider, {
        helperManager,
        transaction,
      }),
    );
  };
};
