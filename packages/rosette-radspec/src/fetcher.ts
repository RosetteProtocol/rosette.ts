import { Fetcher } from '@blossom-labs/rosette-core';

let fetcher: Fetcher;

export const getDefaultFetcher = (): Fetcher => {
  if (!fetcher) {
    fetcher = new Fetcher();
  }

  return fetcher;
};
