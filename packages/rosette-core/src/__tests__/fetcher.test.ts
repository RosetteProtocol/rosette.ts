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
      provider,
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
                "contract": "0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1",
                "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0x2fb1b25f",
                "notice": "Sign guideline \`_guidelineVersion\`",
                "sigHash": "0x2fb1b25f",
                "status": "added",
                "submitter": "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a",
                "upsertAt": 1658143034,
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
                "contract": "0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1",
                "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0xc1c5761b",
                "notice": "Update to a guideline with a \`@transformTime(_cooldownPeriod)\`/\`@transformTime(_gracePeriod)\` cooldown/grace period and a collateral amount of \`@tokenAmount(0x0000000000000000000000000000000000000000, _collateralAmount)\`. The metadata is located on \`@fromHex(_metadata)\`",
                "sigHash": "0xc1c5761b",
                "status": "added",
                "submitter": "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
                "upsertAt": 1658153034,
              }
            `);
    });

    it("fetches it from contract when it wasn't found in subgraph", async () => {
      const sigHash = '0xd3cd7efa';

      await expect(fetcher.entry(contractAddress, sigHash, provider)).resolves
        .toMatchInlineSnapshot(`
              {
                "abi": "function upsertEntry(bytes32 _scope, bytes4 _sig, bytes _cid) payable",
                "cid": "QmUn2qnjSJAE1xHm4uXsnSd9gzjeRrMwc9sCcGpLDzm19e",
                "contract": "0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1",
                "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0xd3cd7efa",
                "notice": "Upsert a description entry located in \`@fromHex(_cid)\` for function \`_sig\` on scope \`_scope\` ",
                "sigHash": "0xd3cd7efa",
                "status": "added",
                "submitter": "0x83E57888cd55C3ea1cfbf0114C963564d81e318d",
                "upsertAt": 0,
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
      '0x7af963cF6D228E564e2A0aA0DdBF06210B38615D',
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
                  "contract": "0x0D5263B7969144a852D58505602f630f9b20239D",
                  "id": "0x92941dd1fce5b10819f55100a7f07a78b4a175e0b4818ab8c4a511295767ab20-0x6881385b",
                  "notice": "Get owed Payroll allowance",
                  "sigHash": "0x6881385b",
                  "status": "added",
                  "submitter": "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
                  "upsertAt": 1658160100,
                },
                {
                  "abi": "function transfer(address,uint256)",
                  "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
                  "contract": "0x0D5263B7969144a852D58505602f630f9b20239D",
                  "id": "0x92941dd1fce5b10819f55100a7f07a78b4a175e0b4818ab8c4a511295767ab20-0xa9059cbb",
                  "notice": "Transfer \`@tokenAmount(self, $2)\` to \`$1\`",
                  "sigHash": "0xa9059cbb",
                  "status": "added",
                  "submitter": "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
                  "upsertAt": 1658158381,
                },
                {
                  "abi": "function upsertEntry(bytes32 _scope, bytes4 _sig, bytes _cid) payable",
                  "cid": "QmUn2qnjSJAE1xHm4uXsnSd9gzjeRrMwc9sCcGpLDzm19e",
                  "contract": "0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1",
                  "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0xd3cd7efa",
                  "notice": "Upsert a description entry located in \`@fromHex(_cid)\` for function \`_sig\` on scope \`_scope\` ",
                  "sigHash": "0xd3cd7efa",
                  "status": "added",
                  "submitter": "0x83E57888cd55C3ea1cfbf0114C963564d81e318d",
                  "upsertAt": 0,
                },
                {
                  "abi": "function changeGuideline(uint64 _cooldownPeriod,uint64 _gracePeriod, uint256 _collateralAmount,bytes calldata _metadata) external",
                  "cid": "QmUxSKkHGeivK2bCRuLQ9ukNkr1KY5RJZzSzFLsrG8w1WS",
                  "contract": "0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1",
                  "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0xc1c5761b",
                  "notice": "Update to a guideline with a \`@transformTime(_cooldownPeriod)\`/\`@transformTime(_gracePeriod)\` cooldown/grace period and a collateral amount of \`@tokenAmount(0x0000000000000000000000000000000000000000, _collateralAmount)\`. The metadata is located on \`@fromHex(_metadata)\`",
                  "sigHash": "0xc1c5761b",
                  "status": "added",
                  "submitter": "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
                  "upsertAt": 1658153034,
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
                  "contract": "0x0D5263B7969144a852D58505602f630f9b20239D",
                  "id": "0x92941dd1fce5b10819f55100a7f07a78b4a175e0b4818ab8c4a511295767ab20-0x6881385b",
                  "notice": "Get owed Payroll allowance",
                  "sigHash": "0x6881385b",
                  "status": "added",
                  "submitter": "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
                  "upsertAt": 1658160100,
                },
                {
                  "abi": "function transfer(address,uint256)",
                  "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
                  "contract": "0x0D5263B7969144a852D58505602f630f9b20239D",
                  "id": "0x92941dd1fce5b10819f55100a7f07a78b4a175e0b4818ab8c4a511295767ab20-0xa9059cbb",
                  "notice": "Transfer \`@tokenAmount(self, $2)\` to \`$1\`",
                  "sigHash": "0xa9059cbb",
                  "status": "added",
                  "submitter": "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
                  "upsertAt": 1658158381,
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
                  "contract": "0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1",
                  "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0x2fb1b25f",
                  "notice": "Sign guideline \`_guidelineVersion\`",
                  "sigHash": "0x2fb1b25f",
                  "status": "added",
                  "submitter": "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a",
                  "upsertAt": 1658143034,
                },
                {
                  "abi": "function changeGuideline(uint64 _cooldownPeriod,uint64 _gracePeriod, uint256 _collateralAmount,bytes calldata _metadata) external",
                  "cid": "QmUxSKkHGeivK2bCRuLQ9ukNkr1KY5RJZzSzFLsrG8w1WS",
                  "contract": "0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1",
                  "id": "0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e-0xc1c5761b",
                  "notice": "Update to a guideline with a \`@transformTime(_cooldownPeriod)\`/\`@transformTime(_gracePeriod)\` cooldown/grace period and a collateral amount of \`@tokenAmount(0x0000000000000000000000000000000000000000, _collateralAmount)\`. The metadata is located on \`@fromHex(_metadata)\`",
                  "sigHash": "0xc1c5761b",
                  "status": "added",
                  "submitter": "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
                  "upsertAt": 1658153034,
                },
              ]
            `);
    });
  });
});
