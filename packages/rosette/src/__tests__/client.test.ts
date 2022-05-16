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
        to: '0x7e18c76aa26bd6bd04196e34c93a925498a5d0f1',
        data: '0xc1c5761b000000000000000000000000000000000000000000000000000000000000012c0000000000000000000000000000000000000000000000000000000000000708000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000002e516d585148356576724a5746466234454438714648745a57695132347953645175356b4d616f7a79337378505a76000000000000000000000000000000000000',
      };
      await expect(client.describe(tx, provider)).resolves.toBe(
        'Update to a guideline with a 5 minutes/30 minutes cooldown/grace period and a collateral amount of 0.01 ETH. The metadata is located on QmXQH5evrJWFFb4ED8qFHtZWiQ24ySdQu5kMaozy3sxPZv',
      );
    });
  });
});
