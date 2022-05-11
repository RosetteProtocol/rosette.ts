import { evaluate } from '@blossom-labs/rosette-radspec';
import type { Transaction } from '@blossom-labs/rosette-types';
import type { providers } from 'ethers';

import { DescriptionNotFoundError } from './errors';

import type { FetcherOptions } from './fetcher/Fetcher';
import { Fetcher } from './fetcher/Fetcher';

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
      throw new Error("Transaction provided couldn't be described");
    }

    return description;
  }
}
