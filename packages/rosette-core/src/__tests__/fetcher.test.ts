import { providers } from 'ethers';

import { Fetcher } from '../fetcher/Fetcher';
import { DEFAULT_NETWORK, DEFAULT_RPC_ENDPOINT } from './fixtures/helpers';
import { setUpTestServer } from './fixtures/server';
import contractFixture from './fixtures/data/contract.json';
import subgraphFixture from './fixtures/data/subgraph.json';

const sigHashes = subgraphFixture.data.contract.functions.map((f) => f.sigHash);

describe('Fetcher', () => {
  let fetcher: Fetcher;

  setUpTestServer();

  beforeEach(() => {
    const provider = new providers.JsonRpcProvider(DEFAULT_RPC_ENDPOINT);
    fetcher = new Fetcher(DEFAULT_NETWORK, { provider });
  });

  describe('when fetching a function entry', () => {
    it('fetches it correctly from subgraph', async () => {
      const sigHash = sigHashes[0];

      const fnEntry = await fetcher.entry(
        DEFAULT_NETWORK,
        contractFixture.address,
        sigHash,
      );

      expect(fnEntry).toMatchInlineSnapshot(`
        {
          "abi": "function sign(uint256)",
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
        DEFAULT_NETWORK,
        contractFixture.address,
        sigHash,
      );

      expect(fnEntry).toMatchInlineSnapshot(`
        {
          "abi": "function removeEntry(bytes32,bytes4)",
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
        DEFAULT_NETWORK,
        contractFixture.address,
        sigHash,
      );

      expect(fnEntry).toMatchInlineSnapshot(`
        {
          "abi": "function upsertEntry(bytes32,bytes4,bytes) payable",
          "cid": "QmQBWU4C9y9hQzw3NFiBsYPD21V1aFpDKTz6eZzgqmBS88",
          "disputed": 2,
          "notice": "Upsert an entry with \`_scope\` and \`_sig\`",
          "sigHash": "0xd3cd7efa",
        }
      `);
    });
  });
});
