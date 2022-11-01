import { Fetcher } from '@blossom-labs/rosette-core';
import type { FetcherOptions, Transaction } from '@blossom-labs/rosette-core';
import type {
  EvaluateOptions,
  RadspecHelperMetadataFetcher,
} from '@blossom-labs/rosette-radspec';
import { evaluate, radspec } from '@blossom-labs/rosette-radspec';
import type { providers } from 'ethers';

import { DescriptionNotFoundError } from './errors';

export type ClientOptions = {
  fetcherOptions: FetcherOptions;
};

const getSigHash = (txData: string): string => {
  return txData.substring(0, 10);
};

export class Client {
  readonly fetcher: Fetcher;
  #evaluateOptions: EvaluateOptions;

  constructor({ fetcherOptions }: ClientOptions = { fetcherOptions: {} }) {
    this.fetcher = new Fetcher(fetcherOptions);

    // Set up evaluate options
    const helperFetcher: RadspecHelperMetadataFetcher = {
      getFnMetadata: async (contractAddress, sigHash, provider) =>
        this.fetcher
          .entry(contractAddress, sigHash, provider)
          .then(({ abi, notice }) => ({ abi, notice })),
    };
    this.#evaluateOptions = {
      helpersConfig: {
        fetcher: helperFetcher,
      },
      userHelpers: {
        radspec,
      },
    };
  }

  async describe(
    tx: Transaction,
    provider: providers.Provider,
  ): Promise<string> {
    const { abi, notice } = await this.fetcher.entry(
      tx.to,
      getSigHash(tx.data),
      provider,
    );

    const description = await evaluate(
      notice,
      abi,
      tx,
      provider,
      this.#evaluateOptions,
    );

    if (!description) {
      throw new DescriptionNotFoundError(
        "Provided transaction couldn't be described",
      );
    }

    return description;
  }
}
