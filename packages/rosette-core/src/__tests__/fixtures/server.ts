import { utils } from 'ethers';
import { graphql, rest } from 'msw';
import { setupServer } from 'msw/node';

import rosetteStoneAbi from '../../abis/RosetteStone.json';
import subgraphFixture from './data/subgraph.json';
import contractFixture from './data/contract.json';
import ipfsResponse from './data/ipfs.json';
import { DEFAULT_IPFS_GATEWAY } from '../../fetcher/IPFSResolver';
import { DEFAULT_NETWORK, DEFAULT_RPC_ENDPOINT } from './helpers';

const rosetteStoneInterface = new utils.Interface(rosetteStoneAbi);

const handlers = [
  graphql.operation((req, res, ctx) => {
    const query = req.body?.query;
    const fnEntries = subgraphFixture.data.contract.functions;
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

    const allowedDisputed = query.includes('disputed: true');

    if (isContractQuery) {
      payload = {
        contract: {
          functions: fnEntries.filter((f) =>
            allowedDisputed ? true : Boolean(f.disputed) === false,
          ),
        },
      };
    } else {
      const fnEntry = fnEntries.find(
        ({ id, disputed }) =>
          query.includes(id) && Boolean(disputed) === allowedDisputed,
      );

      payload = { function: fnEntry ? { ...fnEntry } : null };
    }

    return res(ctx.status(200), ctx.data(payload));
  }),
  rest.post(DEFAULT_RPC_ENDPOINT, (req, res, ctx) => {
    const isObject = typeof req.body === 'object';
    const reqBody = req.body as Record<string, any>;

    if (isObject) {
      const method = reqBody.method;
      switch (method) {
        case 'net_version':
        case 'eth_chainId':
          return res(ctx.status(200), ctx.json({ result: DEFAULT_NETWORK }));
        case 'eth_call': {
          const [tx] = reqBody.params;
          const txDescription = rosetteStoneInterface.parseTransaction(tx);
          const methodResult =
            contractFixture.methods[
              txDescription.name as keyof typeof contractFixture.methods
            ];

          if (methodResult) {
            const encodedResult = rosetteStoneInterface.encodeFunctionResult(
              txDescription.sighash,
              methodResult,
            );

            return res(ctx.status(200), ctx.json({ result: encodedResult }));
          }

          return res(ctx.status(200), ctx.json({ result: '0x' }));
        }
        case 'eth_getCode': {
          const [contractAddress] = reqBody.params;

          if (!contractAddress || !utils.isAddress(contractAddress)) {
            return res(ctx.status(404));
          }

          return res(
            ctx.status(200),
            ctx.json({
              result: contractFixture.bytecode,
            }),
          );
        }
      }
    }
  }),
  rest.get(`${DEFAULT_IPFS_GATEWAY}:cid`, (req, res, ctx) => {
    const cid = req.params.cid;
    const requestedMetadata = ipfsResponse[cid as keyof typeof ipfsResponse];

    if (!requestedMetadata) {
      return res(ctx.status(404));
    }

    return res(ctx.status(200), ctx.json(requestedMetadata));
  }),
];

export const setUpTestServer = () => {
  const server = setupServer(...handlers);

  beforeAll(() => {
    server.listen();
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());
};
