import {
  setUpTestServer,
  DEFAULT_TEST_SERVER_CONFIG,
} from '@blossom-labs/rosette-test';
import { providers } from 'ethers';

import { Client } from '../Client';
import { Transaction } from '../types';

const { ipfsGateway, network, rpcEndpoint } = DEFAULT_TEST_SERVER_CONFIG;

describe('Client', () => {
  let client: Client;
  let provider: providers.Provider;

  setUpTestServer();

  beforeAll(() => {
    provider = new providers.JsonRpcProvider(rpcEndpoint);
  });

  beforeEach(async () => {
    client = new Client({
      fetcherOptions: {
        rpcEndpoint,
        ipfsGateway,
        rosetteNetworkId: network,
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
