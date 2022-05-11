import {
  DEFAULT_TEST_SERVER_CONFIG,
  setUpTestServer,
  subgraphFixture,
} from '@blossom-labs/rosette-test';

import { SubgraphConnector } from '../fetcher/subgraph-connector/SubgraphConnector';
import { Config } from '../configuration';
import { Network } from '../types';

describe('Subgraph Connector', () => {
  let subgraphConnector: SubgraphConnector;
  const bytecodeHash = subgraphFixture.id;

  setUpTestServer();

  beforeEach(async () => {
    subgraphConnector = new SubgraphConnector(
      Config[DEFAULT_TEST_SERVER_CONFIG.network as Network].subgraphUrl,
    );
  });

  describe("when fetching a contract's function entries", () => {
    it('should return entries correctly', async () => {
      const fnEntries = await subgraphConnector.entries(bytecodeHash);

      expect(fnEntries).toMatchInlineSnapshot(`
        [
          [
            {
              "abi": "function sign(uint256 _guidelineVersion)",
              "cid": "QmPeWHhDFEiDStyADgd392kmDV4E5hgWVgyG3KL4i8tkbc",
              "disputed": false,
              "notice": "Sign guideline \`_guidelineVersion\`",
              "sigHash": "0x2fb1b25f",
            },
            {
              "abi": null,
              "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
              "disputed": false,
              "notice": null,
              "sigHash": "0x3d5d7555",
            },
          ],
          false,
        ]
      `);
    });

    it('should return disputed entries if allowed', async () => {
      const fnEntries = await subgraphConnector.entries(bytecodeHash, {
        allowDisputed: true,
      });

      expect(fnEntries).toMatchInlineSnapshot(`
        [
          [
            {
              "abi": "function sign(uint256 _guidelineVersion)",
              "cid": "QmPeWHhDFEiDStyADgd392kmDV4E5hgWVgyG3KL4i8tkbc",
              "disputed": false,
              "notice": "Sign guideline \`_guidelineVersion\`",
              "sigHash": "0x2fb1b25f",
            },
            {
              "abi": null,
              "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
              "disputed": false,
              "notice": null,
              "sigHash": "0x3d5d7555",
            },
            {
              "abi": null,
              "cid": "QmUxSKkHGeivK2bCRuLQ9ukNkr1KY5RJZzSzFLsrG8w1WS",
              "disputed": true,
              "notice": null,
              "sigHash": "0xc1c5761b",
            },
          ],
          false,
        ]
      `);
    });
  });

  describe('when fetching a function entry', () => {
    const sigHash = subgraphFixture.data.contract.functions[0].sigHash;
    const disputedEntrySigHash =
      subgraphFixture.data.contract.functions[2].sigHash;

    it('should return a correct function entry', async () => {
      const fnEntry = await subgraphConnector.entry(bytecodeHash, sigHash);

      expect(fnEntry).toMatchInlineSnapshot(`
        [
          {
            "abi": "function sign(uint256 _guidelineVersion)",
            "cid": "QmPeWHhDFEiDStyADgd392kmDV4E5hgWVgyG3KL4i8tkbc",
            "disputed": false,
            "notice": "Sign guideline \`_guidelineVersion\`",
            "sigHash": "0x2fb1b25f",
          },
          false,
        ]
      `);
    });

    it('should return nothing if the function entry is disputed', async () => {
      const [data] = await subgraphConnector.entry(
        bytecodeHash,
        disputedEntrySigHash,
      );

      expect(data).toBeNull();
    });
    it('should return a disputed function entry if allowed', async () => {
      const fnEntry = await subgraphConnector.entry(
        bytecodeHash,
        disputedEntrySigHash,
        {
          allowDisputed: true,
        },
      );

      expect(fnEntry).toMatchInlineSnapshot(`
        [
          {
            "abi": null,
            "cid": "QmUxSKkHGeivK2bCRuLQ9ukNkr1KY5RJZzSzFLsrG8w1WS",
            "disputed": true,
            "notice": null,
            "sigHash": "0xc1c5761b",
          },
          false,
        ]
      `);
    });
  });
});
