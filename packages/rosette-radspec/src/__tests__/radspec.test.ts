import type { Transaction } from '@blossom-labs/rosette-core';
import { Fetcher } from '@blossom-labs/rosette-core';
import {
  DEFAULT_TEST_SERVER_CONFIG,
  setUpTestServer,
} from '@blossom-labs/rosette-test';
import { ethers } from 'ethers';
import type { providers } from 'ethers';

import { decodeCalldata, evaluate, evaluateRaw } from '../';

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

      await expect(evaluate(tx, provider)).resolves.toBe('Sign guideline 1');
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

    it('raw evaluates it correctly', async () => {
      const abi =
        'function callAgreement(address agreementClass, bytes callData, bytes userData)';

      const tx: Transaction = {
        to: '0xed5b5b32110c3ded02a07c8b8e97513fafb883b6',
        data: '0x39255d5b000000000000000000000000f4c5310e51f6079f601a5fb7120bc72a70b96e2a0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000a4b4b333c6000000000000000000000000745861aed1eee363b4aaa5f1994be40b1e05ff9000000000000000000000000066693ff26e2036fdf3a5ea6b7fdf853ca1adaf4b0000000000000000000000006d629183b82fa608d84c6a6aaa289bd10b44509c00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      };
      const bindings = decodeCalldata(abi, tx);

      await expect(
        evaluateRaw(
          'Call `agreementClass.agreementType(): bytes32 == 0xa9214cc96615e0085d3bb077758db69497dc2dce3b2b1e97bc93c3d18d83efd3 ? "CFA" : "IDA"` to do the following: `@radspec(agreementClass, callData)`',
          bindings,
          provider,
          {
            fetcher,
          },
        ),
      ).resolves.toMatchInlineSnapshot(
        `"Call CFA to do the following: Delete fDAIx flow from 0x66693Ff26e2036FDf3a5EA6B7FDf853Ca1Adaf4B to 0x6D629183B82fA608d84c6A6aaa289Bd10B44509c"`,
      );
    });
  });
});
