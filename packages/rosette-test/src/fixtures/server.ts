import type { GraphQLHandler, RestHandler } from 'msw';
import { graphql, rest } from 'msw';
import type { SetupServerApi } from 'msw/node';
import { setupServer } from 'msw/node';

import subgraph from './data/subgraph.json';
import ipfsResponse from './data/ipfs.json';
import type { SubgraphFixture } from '../types';

const subgraphFixture: SubgraphFixture = subgraph;

type TestServerConfig = {
  ipfsGateway?: string;
  network?: number;
  rpcEndpoint?: string;
};

export const DEFAULT_TEST_SERVER_CONFIG = {
  network: 4,
  ipfsGateway: 'https://ipfs.io/ipfs/',
  rpcEndpoint: 'http://localhost:8545/',
};

const createBaseHandlers = ({
  ipfsGateway,
}: Required<TestServerConfig>): (GraphQLHandler | RestHandler)[] => [
  graphql.operation((req, res, ctx) => {
    const query = req.body?.query;
    const variables = req.body?.variables;

    const isContractQuery = query?.includes('contract(id');
    const isFnEntryQuery = query.includes('function(id');

    if (!isContractQuery && !isFnEntryQuery) {
      return res(
        ctx.status(200),
        ctx.data({
          contract: null,
        }),
      );
    }

    let payload: Record<string, any>;

    if (isContractQuery) {
      const { contractId, allowDisputed } = variables;
      const selectedContract = subgraphFixture[contractId];

      const contractResponse = selectedContract
        ? {
            functions: selectedContract.data.contract.functions.filter((f) =>
              !allowDisputed ? !f.disputed : true,
            ),
          }
        : null;

      payload = {
        contract: contractResponse,
      };
    } else {
      const { entryId, allowDisputed } = variables;
      const [bytecodeHash] = variables.entryId.split('-');
      const selectedContract = subgraphFixture[bytecodeHash];
      const selectedFnEntry =
        selectedContract?.data.contract.functions.find(
          ({ id, disputed }) =>
            id === entryId && (!allowDisputed ? !disputed : true),
        ) ?? null;

      payload = { function: selectedFnEntry };
    }

    return res(ctx.status(200), ctx.data(payload));
  }),
  rest.get(`${ipfsGateway}:cid`, (req, res, ctx) => {
    const cid = req.params.cid;
    const requestedMetadata = ipfsResponse[cid as keyof typeof ipfsResponse];

    if (!requestedMetadata) {
      return res(ctx.status(404));
    }

    return res(ctx.status(200), ctx.json(requestedMetadata));
  }),
];

export const setUpTestServer = (config: TestServerConfig = {}): void => {
  let server: SetupServerApi;

  beforeAll(() => {
    server = setupServer(
      ...createBaseHandlers({
        ...config,
        ...DEFAULT_TEST_SERVER_CONFIG,
      }),
    );

    server.listen({
      onUnhandledRequest: (req) => {
        if (req.url.origin === DEFAULT_TEST_SERVER_CONFIG.rpcEndpoint) {
          return 'bypass';
        }

        return 'warn';
      },
    });
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());
};
