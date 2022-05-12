import type { Transaction } from '@blossom-labs/rosette-core';
import {
  DEFAULT_TEST_SERVER_CONFIG,
  setUpTestServer,
} from '@blossom-labs/rosette-test';
import { providers } from 'ethers';

import { Client } from '../Client';

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
        data: '0xd3cd7efaffdac63ea5cd5767b79bec5e972a17bae6dde90e0e60ff1a07546c1f073cfe942fb1b25f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002e516d51425755344339793968517a77334e4669427359504432315631614670444b547a36655a7a67716d42533838000000000000000000000000000000000000',
      };
      await expect(client.describe(tx, provider)).resolves.toBe(
        'Upsert an entry with 0xffdac63ea5cd5767b79bec5e972a17bae6dde90e0e60ff1a07546c1f073cfe94 and 0x2fb1b25f with medata located in QmQBWU4C9y9hQzw3NFiBsYPD21V1aFpDKTz6eZzgqmBS88',
      );
    });
  });
});
