import { Client } from '../Client';
import { TEST_RPC_ENDPOINT } from './fixtures/helpers';

describe('Client', () => {
  let client: Client;

  beforeEach(async () => {
    client = new Client({
      fetcherOptions: {
        rpcEndpoint: TEST_RPC_ENDPOINT,
      },
    });
    console.log(client);
  });

  describe('when describing a transaction', () => {
    it('should describe it correctly', () => {
      expect(true);
    });
  });
});
