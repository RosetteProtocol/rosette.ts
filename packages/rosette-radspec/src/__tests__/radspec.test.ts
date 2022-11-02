import {
  DEFAULT_TEST_SERVER_CONFIG,
  setUpTestServer,
} from '@blossom-labs/rosette-test';
import { providers, utils } from 'ethers';

import { Fragment } from 'ethers/lib/utils';

import type { Transaction } from '../types';
import { evaluate } from '../';

const { rpcEndpoint } = DEFAULT_TEST_SERVER_CONFIG;

describe('Radspec', () => {
  let provider: providers.Provider;

  setUpTestServer();

  beforeAll(() => {
    provider = new providers.JsonRpcProvider(rpcEndpoint);
  });

  describe('when evaluating a transaction', () => {
    const tx: Transaction = {
      to: '0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1',
      data: '0x2fb1b25f0000000000000000000000000000000000000000000000000000000000000001',
    };
    const stringAbi = 'function sign(uint256 _guidelineVersion)';
    const radspecExpression = 'Sign guideline `_guidelineVersion`';
    const cases: [string, Parameters<typeof evaluate>[1]][] = [
      ['raw abi', stringAbi],
      ['ethers fragment', [Fragment.from(stringAbi)]],
      [
        'ethers json fragment',
        [
          {
            constant: false,
            inputs: [{ name: '_guidelineVersion', type: 'uint256' }],
            name: 'sign',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
      ],
      ['ethers interface', new utils.Interface([stringAbi])],
    ];

    cases.forEach(([caseName, abi]) =>
      it(`evaluates it correctly when passing ${caseName}`, async () => {
        await expect(
          evaluate(radspecExpression, abi, tx, provider),
        ).resolves.toBe('Sign guideline 1');
      }),
    );

    it('fails when trying to evaluate an invalid transaction', async () => {
      const invalidTx: Transaction = {
        to: '0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1',
        data: '0x2fb1b25fc000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000007080000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000002e516d585148356576724a5746466234454438714648745a57695132347953645175356b4d616f7a79337378505a76000000000000000000000000000000000000',
      };
      await expect(
        evaluate(
          'Some radspec expression',
          'function a()',
          invalidTx,
          provider,
        ),
      ).rejects.toMatchInlineSnapshot(
        `[InvalidTransactionError: Failed to decode tx: no matching function (argument="sighash", value="0x2fb1b25f", code=INVALID_ARGUMENT, version=abi/5.7.0)]`,
      );
    });

    // it('raw evaluates it correctly', async () => {
    //   const abi =
    //     'function callAgreement(address agreementClass, bytes callData, bytes userData)';

    //   const tx: Transaction = {
    //     to: '0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9',
    //     data: '0x39255d5b000000000000000000000000ed6bcbf6907d4feeee8a8875543249bea9d308e80000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000a462fc305e000000000000000000000000f2d68898557ccb2cf4c10c3ef2b034b2a69dad00000000000000000000000000b5b921eb2d6d5acb5d32727887aed62028cefbcb000000000000000000000000000000000000000000000000000db4da5f43594800000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    //   };
    //   const bindings = decodeCalldata(abi, tx);

    //   await expect(
    //     evaluateRaw(
    //       'Call `agreementClass.agreementType(): bytes32 == 0xa9214cc96615e0085d3bb077758db69497dc2dce3b2b1e97bc93c3d18d83efd3 ? "CFA" : "IDA"` to do the following: `@radspec(agreementClass, callData)`',
    //       bindings,
    //       provider,
    //       {
    //         fetcher: new Fetcher( ),
    //       },
    //     ),
    //   ).resolves.toMatchInlineSnapshot(
    //     `"Call CFA to do the following: Delete fDAIx flow from 0x66693Ff26e2036FDf3a5EA6B7FDf853Ca1Adaf4B to 0x6D629183B82fA608d84c6A6aaa289Bd10B44509c"`,
    //   );
    // });
  });
});
