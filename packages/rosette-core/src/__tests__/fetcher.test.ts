import {
  DEFAULT_TEST_SERVER_CONFIG,
  setUpTestServer,
} from '@blossom-labs/rosette-test';
import { providers } from 'ethers';

import { Fetcher } from '../fetcher/Fetcher';
import type { Address } from '../types';

const { network, ipfsGateway, rpcEndpoint } = DEFAULT_TEST_SERVER_CONFIG;

describe('Fetcher', () => {
  let fetcher: Fetcher;
  let provider: providers.JsonRpcProvider;

  setUpTestServer();

  beforeEach(() => {
    provider = new providers.JsonRpcProvider(rpcEndpoint);
    fetcher = new Fetcher({
      ipfsGateway,
      rosetteNetworkId: network,
      rpcEndpoint,
    });
  });

  describe('when fetching a function entry', () => {
    const contractAddress = '0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1';

    it('fetches it correctly from subgraph', async () => {
      const sigHash = '0x2fb1b25f';

      await expect(fetcher.entry(contractAddress, sigHash, provider)).resolves
        .toMatchInlineSnapshot(`
              {
                "abi": "function sign(uint256 _guidelineVersion)",
                "cid": "QmPeWHhDFEiDStyADgd392kmDV4E5hgWVgyG3KL4i8tkbc",
                "disputed": false,
                "id": "0xffdac63ea5cd5767b79bec5e972a17bae6dde90e0e60ff1a07546c1f073cfe94-0x2fb1b25f",
                "notice": "Sign guideline \`_guidelineVersion\`",
                "sigHash": "0x2fb1b25f",
              }
            `);
    });
    it('fetches it and fallbacks to IPFS to get missing metadata', async () => {
      const sigHash = '0xc1c5761b';

      await expect(fetcher.entry(contractAddress, sigHash, provider)).resolves
        .toMatchInlineSnapshot(`
              {
                "abi": "function changeGuideline(uint64 _cooldownPeriod,uint64 _gracePeriod, uint256 _collateralAmount,bytes calldata _metadata) external",
                "cid": "QmUxSKkHGeivK2bCRuLQ9ukNkr1KY5RJZzSzFLsrG8w1WS",
                "disputed": false,
                "id": "0xffdac63ea5cd5767b79bec5e972a17bae6dde90e0e60ff1a07546c1f073cfe94-0xc1c5761b",
                "notice": "Update to a guideline with a \`@transformTime(_cooldownPeriod)\`/\`@transformTime(_gracePeriod)\` cooldown/grace period and a collateral amount of \`@tokenAmount(0x0000000000000000000000000000000000000000, _collateralAmount)\`. The metadata is located on \`@fromHex(_metadata)\`",
                "sigHash": "0xc1c5761b",
              }
            `);
    });

    it("fetches it from contract when it wasn't found in subgraph", async () => {
      const sigHash = '0xd3cd7efa';

      await expect(fetcher.entry(contractAddress, sigHash, provider)).resolves
        .toMatchInlineSnapshot(`
              {
                "abi": "function upsertEntry(bytes32 _scope, bytes4 _sig, bytes _cid) payable",
                "cid": "QmQBWU4C9y9hQzw3NFiBsYPD21V1aFpDKTz6eZzgqmBS88",
                "disputed": 1,
                "id": "0xffdac63ea5cd5767b79bec5e972a17bae6dde90e0e60ff1a07546c1f073cfe94-0xd3cd7efa",
                "notice": "Upsert an entry with \`_scope\` and \`_sig\` with medata located in \`@fromHex(_cid)\`",
                "sigHash": "0xd3cd7efa",
              }
            `);
    });

    it('fails when fetching a non-existing entry', async () => {
      const sigHash = '0x48fd7efb';

      await expect(
        fetcher.entry(contractAddress, sigHash, provider),
      ).rejects.toMatchInlineSnapshot(
        `[NotFoundError: No description entry found for signature 0x48fd7efb of contract 0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1]`,
      );
    });
  });

  describe('when fetching a group of entries', () => {
    let contractToSigHashes: [Address, string[]][];
    const contractAddresses = [
      '0x0D5263B7969144a852D58505602f630f9b20239D',
      '0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1',
    ];
    const sigHashes = [
      ['0x6881385b', '0xa9059cbb'],
      ['0xd3cd7efa', '0xc1c5761b'],
    ];

    it('fetches them correctly', async () => {
      contractToSigHashes = [
        [contractAddresses[0], sigHashes[0]],
        [contractAddresses[1], sigHashes[1]],
      ];
      await expect(fetcher.entries(contractToSigHashes, provider)).resolves
        .toMatchInlineSnapshot(`
              [
                {
                  "abi": "function payday()",
                  "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
                  "disputed": false,
                  "id": "0x495fd09dbcd9627df345ba606ffe44d137f3e515e7402159a224458611caf2ec-0x6881385b",
                  "notice": "Get owed Payroll allowance",
                  "sigHash": "0x6881385b",
                },
                {
                  "abi": "function transfer(address,uint256)",
                  "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
                  "disputed": false,
                  "id": "0x495fd09dbcd9627df345ba606ffe44d137f3e515e7402159a224458611caf2ec-0xa9059cbb",
                  "notice": "Transfer \`@tokenAmount(self, $2)\` to \`$1\`",
                  "sigHash": "0xa9059cbb",
                },
                {
                  "abi": "function upsertEntry(bytes32 _scope, bytes4 _sig, bytes _cid) payable",
                  "cid": "QmQBWU4C9y9hQzw3NFiBsYPD21V1aFpDKTz6eZzgqmBS88",
                  "disputed": 1,
                  "id": "0xffdac63ea5cd5767b79bec5e972a17bae6dde90e0e60ff1a07546c1f073cfe94-0xd3cd7efa",
                  "notice": "Upsert an entry with \`_scope\` and \`_sig\` with medata located in \`@fromHex(_cid)\`",
                  "sigHash": "0xd3cd7efa",
                },
                {
                  "abi": "function changeGuideline(uint64 _cooldownPeriod,uint64 _gracePeriod, uint256 _collateralAmount,bytes calldata _metadata) external",
                  "cid": "QmUxSKkHGeivK2bCRuLQ9ukNkr1KY5RJZzSzFLsrG8w1WS",
                  "disputed": false,
                  "id": "0xffdac63ea5cd5767b79bec5e972a17bae6dde90e0e60ff1a07546c1f073cfe94-0xc1c5761b",
                  "notice": "Update to a guideline with a \`@transformTime(_cooldownPeriod)\`/\`@transformTime(_gracePeriod)\` cooldown/grace period and a collateral amount of \`@tokenAmount(0x0000000000000000000000000000000000000000, _collateralAmount)\`. The metadata is located on \`@fromHex(_metadata)\`",
                  "sigHash": "0xc1c5761b",
                },
              ]
            `);
    });

    it("fails when one of the entries doesn't exists", async () => {
      contractToSigHashes = [
        [contractAddresses[0], sigHashes[0]],
        [contractAddresses[1], ['0x48fd7efb']],
      ];
      await expect(
        fetcher.entries(contractToSigHashes, provider),
      ).rejects.toMatchInlineSnapshot(
        `[NotFoundError: No description entry found for signature 0x48fd7efb of contract 0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1]`,
      );
    });

    it('returns all the entries found when ignoreNotFound is set', async () => {
      contractToSigHashes = [
        [contractAddresses[0], sigHashes[0]],
        [contractAddresses[1], ['0x48fd7efb']],
      ];
      await expect(
        fetcher.entries(contractToSigHashes, provider, {
          ignoreNotFound: true,
        }),
      ).resolves.toMatchInlineSnapshot(`
              [
                {
                  "abi": "function payday()",
                  "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
                  "disputed": false,
                  "id": "0x495fd09dbcd9627df345ba606ffe44d137f3e515e7402159a224458611caf2ec-0x6881385b",
                  "notice": "Get owed Payroll allowance",
                  "sigHash": "0x6881385b",
                },
                {
                  "abi": "function transfer(address,uint256)",
                  "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
                  "disputed": false,
                  "id": "0x495fd09dbcd9627df345ba606ffe44d137f3e515e7402159a224458611caf2ec-0xa9059cbb",
                  "notice": "Transfer \`@tokenAmount(self, $2)\` to \`$1\`",
                  "sigHash": "0xa9059cbb",
                },
              ]
            `);
    });
  });

  describe("when fetching a contract's entries", () => {
    const contractAddress = '0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1';

    it('fetches them correctly', async () => {
      await expect(fetcher.contractEntries(contractAddress, provider)).resolves
        .toMatchInlineSnapshot(`
              [
                {
                  "abi": "function sign(uint256 _guidelineVersion)",
                  "cid": "QmPeWHhDFEiDStyADgd392kmDV4E5hgWVgyG3KL4i8tkbc",
                  "disputed": false,
                  "id": "0xffdac63ea5cd5767b79bec5e972a17bae6dde90e0e60ff1a07546c1f073cfe94-0x2fb1b25f",
                  "notice": "Sign guideline \`_guidelineVersion\`",
                  "sigHash": "0x2fb1b25f",
                },
                {
                  "abi": "function changeGuideline(uint64 _cooldownPeriod,uint64 _gracePeriod, uint256 _collateralAmount,bytes calldata _metadata) external",
                  "cid": "QmUxSKkHGeivK2bCRuLQ9ukNkr1KY5RJZzSzFLsrG8w1WS",
                  "disputed": false,
                  "id": "0xffdac63ea5cd5767b79bec5e972a17bae6dde90e0e60ff1a07546c1f073cfe94-0xc1c5761b",
                  "notice": "Update to a guideline with a \`@transformTime(_cooldownPeriod)\`/\`@transformTime(_gracePeriod)\` cooldown/grace period and a collateral amount of \`@tokenAmount(0x0000000000000000000000000000000000000000, _collateralAmount)\`. The metadata is located on \`@fromHex(_metadata)\`",
                  "sigHash": "0xc1c5761b",
                },
              ]
            `);
    });
  });
});
