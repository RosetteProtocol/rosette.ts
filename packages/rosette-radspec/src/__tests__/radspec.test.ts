import type { Transaction } from '@blossom-labs/rosette-types';
import type { providers } from 'ethers';
import { ethers } from 'ethers';

import { evaluate } from '../';
import { MockFetcher } from './mocks/MockFetcher';

// const XDAI_ENDPOINT = 'https://rpc.xdaichain.com';

describe('Radspec', () => {
  let fetcher: MockFetcher;
  let provider: providers.Provider;

  beforeAll(() => {
    provider = ethers.getDefaultProvider();
    fetcher = new MockFetcher();
  });

  describe('when evaluating with a fetcher', () => {
    const transaction: Transaction = {
      to: '0x8521742d3f456BD237E312d6E30724960f72517A',
      data: '0xc6888fa1000000000000000000000000000000000000000000000000000000000000007a',
    };

    it('evaluates correctly', async () => {
      expect(await evaluate(transaction, provider, { fetcher })).toBe(
        'Will multiply 122 by 7 and return 854',
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
