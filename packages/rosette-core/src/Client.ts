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
}
