import { evaluate } from '@blossom-labs/rosette-radspec';
import type { providers } from 'ethers';

import { DescriptionNotFoundError } from './errors';
import type { FetcherOptions } from './fetcher/Fetcher';
import { Fetcher } from './fetcher/Fetcher';
import { Transaction } from './types';

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
