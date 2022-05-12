import type { Transaction } from '@blossom-labs/rosette-core';
import { Fetcher } from '@blossom-labs/rosette-core';
import {
  DEFAULT_TEST_SERVER_CONFIG,
  setUpTestServer,
} from '@blossom-labs/rosette-test';
import type { providers } from 'ethers';
import { ethers } from 'ethers';

import { evaluate } from '../';

// const XDAI_ENDPOINT = 'https://rpc.xdaichain.com';

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
    const tx: Transaction = {
      to: '0x8521742d3f456BD237E312d6E30724960f72517A',
      data: '0x2fb1b25f0000000000000000000000000000000000000000000000000000000000000001',
    };

    it('evaluates it correctly', async () => {
      await expect(evaluate(tx, provider, { fetcher })).resolves.toBe(
        'Sign guideline 1',
      );
    });

    it('fails when trying to evaluate an invalid transaction', async () => {
      const invalidTx: Transaction = {
        to: '0x8521742d3f456BD237E312d6E30724960f72517A',
        data: '0xc1c5761b000000000000000000000000000000000000000000000000000000000000012c000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000007080000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000002e516d585148356576724a5746466234454438714648745a57695132347953645175356b4d616f7a79337378505a76000000000000000000000000000000000000',
      };
      await expect(
        evaluate(invalidTx, provider, { fetcher }),
      ).rejects.toMatchInlineSnapshot(
        `[InvalidTransactionError: no matching function (argument="sighash", value="0xc1c5761b", code=INVALID_ARGUMENT, version=abi/5.6.1)]`,
      );
    });

    it('fails when trying to evaluate a transaction that have no description', async () => {
      const noDescriptionTx: Transaction = {
        to: '0xa57514cb17793af076fcb4daed5be1dde4195dad',
        data: '0xa9059cbb0000000000000000000000007ffe2012f9e17d4b064fda5eccb5a458f4312910000000000000000000000000000000000000000000000004d1753117f4b80000',
      };

      await expect(
        evaluate(noDescriptionTx, provider, { fetcher }),
      ).rejects.toMatchInlineSnapshot(
        `[InvalidTransactionError: no matching function (argument="sighash", value="0xa9059cbb", code=INVALID_ARGUMENT, version=abi/5.6.1)]`,
      );
    });
  });
});

// TODO: include userFunctions test
// test("radspec#evaluate Helper userFunctions", async (t) => {
//   const expression = null;
//   const call = {
//     abi: [
//       "function stakeToProposal(uint256 _proposalId, uint256 _amount) external",
//     ],
//     transaction: {
//       to: "0x0b21081c6f8b1990f53fc76279cc41ba22d7afe2",
//       data: "0xfc3700510000000000000000000000000000000000000000000000000000000000000042000000000000000000000000000000000000000000000002a48286b8d60482b9",
//     },
//   };

//   const options = {
//     provider: new ethers.providers.StaticJsonRpcProvider(XDAI_ENDPOINT),
//     userFunctions: {
//       "stakeToProposal(uint256,uint256)":
//         "Stake `@tokenAmount((self.stakeToken(): address), _amount)` on proposal #`_proposalId`",
//     },
//   };

//   t.is(
//     await evaluate(expression, call, options),
//     "Stake 48.747673445034394297 on proposal #66"
//   );
// });
