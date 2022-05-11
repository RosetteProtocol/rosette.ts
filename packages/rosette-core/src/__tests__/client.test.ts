import type { Transaction } from '@blossom-labs/rosette-types';
import { providers } from 'ethers';

import { Client } from '../Client';
import { TEST_RPC_ENDPOINT } from './fixtures/helpers';
import { setUpTestServer } from './fixtures/server';

describe('Client', () => {
  let client: Client;
  let provider: providers.Provider;

  setUpTestServer();

  beforeAll(() => {
    provider = new providers.JsonRpcProvider(TEST_RPC_ENDPOINT);
  });

  beforeEach(async () => {
    client = new Client({
      fetcherOptions: {
        rpcEndpoint: TEST_RPC_ENDPOINT,
      },
    });
  });

  describe('when describing a transaction', () => {
    it('should describe it correctly', async () => {
      const tx: Transaction = {
        to: '0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1',
        data: '0x2fb1b25f0000000000000000000000000000000000000000000000000000000000000002',
      };

      await expect(client.describe(tx, provider)).resolves.toBe(
        'Sign guideline 2',
      );
    });
  });
});
