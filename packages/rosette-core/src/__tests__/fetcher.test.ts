import {
  DEFAULT_TEST_SERVER_CONFIG,
  contractFixture,
  setUpTestServer,
  subgraphFixture,
} from '@blossom-labs/rosette-test';
import { providers } from 'ethers';

import { Fetcher } from '../fetcher/Fetcher';

const sigHashes = subgraphFixture.data.contract.functions.map((f) => f.sigHash);

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
    it('fetches it correctly from subgraph', async () => {
      const sigHash = sigHashes[0];

      const fnEntry = await fetcher.entry(
        contractFixture.address,
        sigHash,
        provider,
      );

      expect(fnEntry).toMatchInlineSnapshot(`
        {
          "abi": "function sign(uint256 _guidelineVersion)",
          "cid": "QmPeWHhDFEiDStyADgd392kmDV4E5hgWVgyG3KL4i8tkbc",
          "disputed": false,
          "notice": "Sign guideline \`_guidelineVersion\`",
          "sigHash": "0x2fb1b25f",
        }
      `);
    });
    it('fetches it and fallbacks to IPFS to get missing metadata', async () => {
      const sigHash = sigHashes[1];

      const fnEntry = await fetcher.entry(
        contractFixture.address,
        sigHash,
        provider,
      );

      expect(fnEntry).toMatchInlineSnapshot(`
        {
          "abi": "function removeEntry(bytes32 _scope, bytes4 _sig)",
          "cid": "QmNUy3tgcBwFhWrbuvaXGSgx5jrtFAqr5kU5ksKtxHRpjU",
          "disputed": false,
          "notice": "Remove an entry from the registry with \`_scope\` and \`_sig\`",
          "sigHash": "0x3d5d7555",
        }
      `);
    });

    it('fetches it from contract when it not found in subgraph', async () => {
      const sigHash = '0xd3cd7efa';

      const fnEntry = await fetcher.entry(
        contractFixture.address,
        sigHash,
        provider,
      );

      expect(fnEntry).toMatchInlineSnapshot(`
        {
          "abi": "function upsertEntry(bytes32 _scope, bytes4 _sig, bytes _cid) payable",
          "cid": "QmQBWU4C9y9hQzw3NFiBsYPD21V1aFpDKTz6eZzgqmBS88",
          "disputed": 2,
          "notice": "Upsert an entry with \`_scope\` and \`_sig\`",
          "sigHash": "0xd3cd7efa",
        }
      `);
    });
  });
});
