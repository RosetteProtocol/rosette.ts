import {
  DEFAULT_TEST_SERVER_CONFIG,
  contractFixture,
  setUpTestServer,
  subgraphFixture,
} from '@blossom-labs/rosette-test';
import { providers } from 'ethers';

import { Fetcher } from '../fetcher/Fetcher';

const sigHashes = subgraphFixture[
  '0xffdac63ea5cd5767b79bec5e972a17bae6dde90e0e60ff1a07546c1f073cfe94'
].data.contract.functions.map((f) => f.sigHash);

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
    it('fetches it correctly from subgraph', () => {
      const sigHash = sigHashes[0];

      expect(fetcher.entry(contractFixture.address, sigHash, provider)).resolves
        .toMatchInlineSnapshot(`
        {
          "abi": "function sign(uint256 _guidelineVersion)",
          "cid": "QmPeWHhDFEiDStyADgd392kmDV4E5hgWVgyG3KL4i8tkbc",
          "disputed": false,
          "notice": "Sign guideline \`_guidelineVersion\`",
          "sigHash": "0x2fb1b25f",
        }
      `);
    });
    it('fetches it and fallbacks to IPFS to get missing metadata', () => {
      const sigHash = sigHashes[1];

      expect(fetcher.entry(contractFixture.address, sigHash, provider)).resolves
        .toMatchInlineSnapshot(`
        {
          "abi": "function removeEntry(bytes32 _scope, bytes4 _sig)",
          "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
          "disputed": false,
          "notice": "Remove an entry from the registry with \`_scope\` and \`_sig\`",
          "sigHash": "0x3d5d7555",
        }
      `);
    });

    it("fetches it from contract when it wasn't found in subgraph", () => {
      const sigHash = '0xd3cd7efa';

      expect(fetcher.entry(contractFixture.address, sigHash, provider)).resolves
        .toMatchInlineSnapshot(`
        {
          "abi": "function upsertEntry(bytes32 _scope, bytes4 _sig, bytes _cid) payable",
          "cid": "QmQBWU4C9y9hQzw3NFiBsYPD21V1aFpDKTz6eZzgqmBS88",
          "disputed": 1,
          "notice": "Upsert an entry with \`_scope\` and \`_sig\` with medata located in \`@fromHex(_cid)\`",
          "sigHash": "0xd3cd7efa",
        }
      `);
    });

    it('fails when fetching a non-existing entry', () => {
      const sigHash = '0x48fd7efb';

      expect(
        fetcher.entry(contractFixture.address, sigHash, provider),
      ).rejects.toMatchInlineSnapshot(
        `[NotFoundError: No description entry found for signature 0x48fd7efb with hashed bytecode 0xffdac63ea5cd5767b79bec5e972a17bae6dde90e0e60ff1a07546c1f073cfe94]`,
      );
    });
  });
});
