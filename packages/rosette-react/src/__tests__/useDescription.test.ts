import type { Transaction } from '@blossom-labs/rosette';
import { setUpTestServer } from '@blossom-labs/rosette-test';

import { useDescription } from '../hooks/useDescription';
import { renderRosetteHook } from './utils';

describe('useDescription', () => {
  describe('mounts', () => {
    let tx: Transaction;

    setUpTestServer();

    it('fetches a description for a given tx', async () => {
      tx = {
        to: '0x7e18c76aa26bd6bd04196e34c93a925498a5d0f1',
        data: '0xc1c5761b000000000000000000000000000000000000000000000000000000000000012c0000000000000000000000000000000000000000000000000000000000000708000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000002e516d585148356576724a5746466234454438714648745a57695132347953645175356b4d616f7a79337378505a76000000000000000000000000000000000000',
      };
      const { result, waitFor } = renderRosetteHook(() => useDescription(tx));

      await waitFor(() => {
        expect(result.current[1]).toBeFalsy();
      });

      const hookRes = result.current;
      expect(hookRes).toMatchInlineSnapshot(`
        [
          "Update to a guideline with a 5 minutes/30 minutes cooldown/grace period and a collateral amount of 0.01 ETH. The metadata is located on QmXQH5evrJWFFb4ED8qFHtZWiQ24ySdQu5kMaozy3sxPZv",
          false,
          undefined,
        ]
      `);
    });

    it('throws an error when fetching a non-existent description', async () => {
      tx = {
        to: '0x01be23585060835e02b77ef475b0cc51aa1e0709',
        data: '0x431f1481000000000000000000000000ea613e86842a6bbe2a7de22e1601af550bf3c3720000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000454444c7800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000454444c7800000000000000000000000000000000000000000000000000000000',
      };
      const { result, waitFor } = renderRosetteHook(() => useDescription(tx));

      await waitFor(
        () => {
          expect(result.current[1]).toBeFalsy();
        },
        { timeout: 5000 },
      );

      const hookRes = result.current;
      expect(hookRes).toMatchInlineSnapshot(`
        [
          undefined,
          false,
          [NotFoundError: No description entry found for signature 0x431f1481 of contract 0x01be23585060835e02b77ef475b0cc51aa1e0709],
        ]
      `);
    });
  });
});
