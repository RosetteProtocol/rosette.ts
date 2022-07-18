import {
  DEFAULT_TEST_SERVER_CONFIG,
  setUpTestServer,
  subgraphFixture,
} from '@blossom-labs/rosette-test';

import { SubgraphConnector } from '../fetcher/subgraph-connector/SubgraphConnector';
import { Config } from '../configuration';
import type { Network } from '../types';
import { buildEntryId } from '../utils';

describe.only('Subgraph Connector', () => {
  let subgraphConnector: SubgraphConnector;
  const bytecodeHash =
    '0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e';

  setUpTestServer();

  beforeEach(async () => {
    subgraphConnector = new SubgraphConnector(
      Config[DEFAULT_TEST_SERVER_CONFIG.network as Network].subgraphUrl,
    );
  });

  describe("when fetching a contract's function entries", () => {
    it('should return entries correctly', async () => {
      await expect(subgraphConnector.contractEntries(bytecodeHash)).resolves
        .toMatchInlineSnapshot(`
              [
                [
                  {
                    "abi": "function sign(uint256 _guidelineVersion)",
                    "cid": "QmPeWHhDFEiDStyADgd392kmDV4E5hgWVgyG3KL4i8tkbc",
                    "disputed": false,
                    "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0x2fb1b25f",
                    "notice": "Sign guideline \`_guidelineVersion\`",
                    "sigHash": "0x2fb1b25f",
                  },
                  {
                    "abi": "function changeGuideline(uint64 _cooldownPeriod,uint64 _gracePeriod, uint256 _collateralAmount,bytes calldata _metadata) external",
                    "cid": "QmUxSKkHGeivK2bCRuLQ9ukNkr1KY5RJZzSzFLsrG8w1WS",
                    "disputed": false,
                    "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0xc1c5761b",
                    "notice": "Update to a guideline with a \`@transformTime(_cooldownPeriod)\`/\`@transformTime(_gracePeriod)\` cooldown/grace period and a collateral amount of \`@tokenAmount(0x0000000000000000000000000000000000000000, _collateralAmount)\`. The metadata is located on \`@fromHex(_metadata)\`",
                    "sigHash": "0xc1c5761b",
                  },
                ],
              ]
            `);
    });

    it('should return disputed entries if allowed', async () => {
      await expect(
        subgraphConnector.contractEntries(bytecodeHash, {
          allowDisputed: true,
        }),
      ).resolves.toMatchInlineSnapshot(`
              [
                [
                  {
                    "abi": "function sign(uint256 _guidelineVersion)",
                    "cid": "QmPeWHhDFEiDStyADgd392kmDV4E5hgWVgyG3KL4i8tkbc",
                    "disputed": false,
                    "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0x2fb1b25f",
                    "notice": "Sign guideline \`_guidelineVersion\`",
                    "sigHash": "0x2fb1b25f",
                  },
                  {
                    "abi": null,
                    "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
                    "disputed": true,
                    "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0x3d5d7555",
                    "notice": null,
                    "sigHash": "0x3d5d7555",
                  },
                  {
                    "abi": "function changeGuideline(uint64 _cooldownPeriod,uint64 _gracePeriod, uint256 _collateralAmount,bytes calldata _metadata) external",
                    "cid": "QmUxSKkHGeivK2bCRuLQ9ukNkr1KY5RJZzSzFLsrG8w1WS",
                    "disputed": false,
                    "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0xc1c5761b",
                    "notice": "Update to a guideline with a \`@transformTime(_cooldownPeriod)\`/\`@transformTime(_gracePeriod)\` cooldown/grace period and a collateral amount of \`@tokenAmount(0x0000000000000000000000000000000000000000, _collateralAmount)\`. The metadata is located on \`@fromHex(_metadata)\`",
                    "sigHash": "0xc1c5761b",
                  },
                ],
              ]
            `);
    });
  });

  describe('when fetching a group of function entries', () => {
    it('should return them correctly', async () => {
      const bytecodeHashTwo =
        '0x39bef1777deb3dfb14f64b9f81ced092c501fee72f90e93d03bb95ee89df9837';
      const sigHashOne =
        subgraphFixture[bytecodeHash].data.contract.functions[0].sigHash;
      const sigHashTwo =
        subgraphFixture[bytecodeHashTwo].data.contract.functions[0].sigHash;
      const sigHashes = [
        buildEntryId(bytecodeHash, sigHashOne),
        buildEntryId(bytecodeHashTwo, sigHashTwo),
      ];

      await expect(subgraphConnector.entries(sigHashes)).resolves
        .toMatchInlineSnapshot(`
              [
                [
                  {
                    "abi": "function sign(uint256 _guidelineVersion)",
                    "cid": "QmPeWHhDFEiDStyADgd392kmDV4E5hgWVgyG3KL4i8tkbc",
                    "disputed": false,
                    "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0x2fb1b25f",
                    "notice": "Sign guideline \`_guidelineVersion\`",
                    "sigHash": "0x2fb1b25f",
                  },
                  {
                    "abi": "function payday()",
                    "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
                    "disputed": false,
                    "id": "0x39bef1777deb3dfb14f64b9f81ced092c501fee72f90e93d03bb95ee89df9837-0x6881385b",
                    "notice": "Get owed Payroll allowance",
                    "sigHash": "0x6881385b",
                  },
                ],
              ]
            `);
    });
  });

  describe('when fetching a function entry', () => {
    const sigHash = '0x2fb1b25f';
    const disputedEntrySigHash = '0x3d5d7555';

    it('should return a correct function entry', async () => {
      await expect(subgraphConnector.entry(buildEntryId(bytecodeHash, sigHash)))
        .resolves.toMatchInlineSnapshot(`
              [
                {
                  "abi": "function sign(uint256 _guidelineVersion)",
                  "cid": "QmPeWHhDFEiDStyADgd392kmDV4E5hgWVgyG3KL4i8tkbc",
                  "disputed": false,
                  "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0x2fb1b25f",
                  "notice": "Sign guideline \`_guidelineVersion\`",
                  "sigHash": "0x2fb1b25f",
                },
              ]
            `);
    });

    it('should return nothing if the function entry is disputed', async () => {
      const [data] = await subgraphConnector.entry(
        buildEntryId(bytecodeHash, disputedEntrySigHash),
      );

      expect(data).toBeNull();
    });

    it('should return a disputed function entry if allowed', async () => {
      await expect(
        subgraphConnector.entry(
          buildEntryId(bytecodeHash, disputedEntrySigHash),
          {
            allowDisputed: true,
          },
        ),
      ).resolves.toMatchInlineSnapshot(`
              [
                {
                  "abi": null,
                  "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
                  "disputed": true,
                  "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0x3d5d7555",
                  "notice": null,
                  "sigHash": "0x3d5d7555",
                },
              ]
            `);
    });
  });
});
