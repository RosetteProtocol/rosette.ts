import type { providers } from 'ethers';

import type { Network } from './types';
import { Fetcher } from './fetcher/Fetcher';

export type ClientOptions = {
  ipfsGateway?: string;
  provider?: providers.Provider;
};

export class Client {
  readonly fetcher: Fetcher;

  constructor(networkId: Network, { ipfsGateway, provider }: ClientOptions) {
    this.fetcher = new Fetcher(networkId, { ipfsGateway, provider });
  }
}
