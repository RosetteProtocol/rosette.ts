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
  network: 5,
  ipfsGateway: 'https://ipfs.io/ipfs/',
  rpcEndpoint: 'http://localhost:8545/',
};

const createBaseHandlers = ({
  ipfsGateway,
}: Required<TestServerConfig>): (GraphQLHandler | RestHandler)[] => [
  graphql.query('Contract', (req, res, ctx) => {
    const { contractId, allowDisputed } = req.variables;
    const selectedContract = subgraphFixture[contractId];

    const contract = selectedContract
      ? {
          functions: selectedContract.data.contract.functions.filter((f) =>
            !allowDisputed ? !f.disputed : true,
          ),
        }
      : null;

    return res(
      ctx.status(200),
      ctx.data({
        contract,
      }),
    );
  }),
  graphql.query('Function', (req, res, ctx) => {
    const { entryId, allowDisputed } = req.variables;
    const [bytecodeHash] = entryId.split('-');
    const selectedContract = subgraphFixture[bytecodeHash];
    const _function =
      selectedContract?.data.contract.functions.find(
        ({ id, disputed }) =>
          id === entryId && (!allowDisputed ? !disputed : true),
      ) ?? null;

    return res(ctx.status(200), ctx.data({ function: _function }));
  }),
  graphql.query('Functions', (req, res, ctx) => {
    const { entryIds, allowDisputed } = req.variables;
    const functions: any[] = [];

    entryIds.forEach((eId: string) => {
      const [bytecodeHash] = eId.split('-');
      const selectedContract = subgraphFixture[bytecodeHash];
      const f = selectedContract
        ? selectedContract.data.contract.functions.find(
            ({ id, disputed }) =>
              id === eId && (!allowDisputed ? !disputed : true),
          )
        : null;

      if (f) {
        functions.push(f);
      }
    });

    return res(ctx.status(200), ctx.data({ functions }));
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
