import { Fetcher } from '@blossom-labs/rosette-core';
import type { FetcherOptions, Transaction } from '@blossom-labs/rosette-core';
import { evaluate } from '@blossom-labs/rosette-radspec';
import type { providers } from 'ethers';

import { DescriptionNotFoundError } from './errors';

export type ClientOptions = {
  fetcherOptions: FetcherOptions;
};

export class Client {
  readonly fetcher: Fetcher;

  constructor({ fetcherOptions }: ClientOptions) {
    this.fetcher = new Fetcher(fetcherOptions);
  }

  async describe(
    transaction: Transaction,
    provider: providers.Provider,
  ): Promise<string> {
    const description = await evaluate(transaction, provider, {
      fetcher: this.fetcher,
    });

    if (!description) {
      throw new DescriptionNotFoundError(
        "Transaction provided couldn't be described",
      );
    }

    return description;
  }
}
