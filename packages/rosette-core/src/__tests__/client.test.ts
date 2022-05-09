import { providers } from 'ethers';

import { Client } from '../Client';
import { TEST_NETWORK, TEST_RPC_ENDPOINT } from './fixtures/helpers';

describe('Client', () => {
  let client: Client;

  beforeEach(async () => {
    const provider = new providers.JsonRpcProvider(TEST_RPC_ENDPOINT);
    client = new Client(TEST_NETWORK, { provider });
    console.log(client);
  });

  describe('when describing a transaction', () => {
    it('should describe it correctly', () => {
      expect(true);
    });
  });
});
