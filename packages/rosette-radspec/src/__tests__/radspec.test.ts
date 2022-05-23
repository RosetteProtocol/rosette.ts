import type { Transaction } from '@blossom-labs/rosette-core';
import { Fetcher } from '@blossom-labs/rosette-core';
import {
  DEFAULT_TEST_SERVER_CONFIG,
  setUpTestServer,
} from '@blossom-labs/rosette-test';
import type { providers } from 'ethers';
import { ethers } from 'ethers';

import { evaluate } from '../';

const { ipfsGateway, network, rpcEndpoint } = DEFAULT_TEST_SERVER_CONFIG;

describe('Radspec', () => {
  let fetcher: Fetcher;
  let provider: providers.Provider;

  setUpTestServer();

  beforeAll(() => {
    provider = ethers.getDefaultProvider(rpcEndpoint);
    fetcher = new Fetcher({
      ipfsGateway,
      rosetteNetworkId: network,
      rpcEndpoint,
    });
  });

  describe('when evaluating a transaction', () => {
    it('evaluates it correctly', async () => {
      const tx: Transaction = {
        to: '0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1',
        data: '0x2fb1b25f0000000000000000000000000000000000000000000000000000000000000001',
      };

      await expect(evaluate(tx, provider, { fetcher })).resolves.toBe(
        'Sign guideline 1',
      );
    });

    it('fails when trying to evaluate an invalid transaction', async () => {
      const invalidTx: Transaction = {
        to: '0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1',
        data: '0x2fb1b25fc000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000007080000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000002e516d585148356576724a5746466234454438714648745a57695132347953645175356b4d616f7a79337378505a76000000000000000000000000000000000000',
      };
      await expect(
        evaluate(invalidTx, provider, { fetcher }),
      ).rejects.toMatchInlineSnapshot(
        `[InvalidTransactionError: hex data is odd-length (argument="value", value="0xc000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000007080000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000002e516d585148356576724a5746466234454438714648745a57695132347953645175356b4d616f7a79337378505a76000000000000000000000000000000000000", code=INVALID_ARGUMENT, version=bytes/5.6.1)]`,
      );
    });
  });
});
