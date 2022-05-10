import type { FnEntry } from '@blossom-labs/rosette-core';
import { Fetcher } from '@blossom-labs/rosette-core';

export class MockFetcher extends Fetcher {
  entry(): Promise<FnEntry> {
    const fnEntry: FnEntry = {
      abi: 'function multiply(uint256 a)',
      notice: 'Will multiply `a` by 7 and return `a * 7`',
      cid: '',
      disputed: 'false',
      sigHash: '',
    };
    return Promise.resolve(fnEntry);
  }
}
