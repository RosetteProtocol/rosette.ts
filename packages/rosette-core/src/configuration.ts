import { Network } from './types';

type Configuration = {
  contractAddresses: {
    rosetteStone: string;
  };
  subgraphUrl: string;
};

export const Config: Record<Network, Configuration> = {
  [Network.rinkeby]: {
    contractAddresses: {
      rosetteStone: '0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1',
    },
    subgraphUrl:
      'https://api.thegraph.com/subgraphs/name/blossomlabs/rosette-stone-rinkeby',
  },
  [Network.goerli]: {
    contractAddresses: {
      rosetteStone: '0x7e18c76aa26bd6bd04196e34c93a925498a5d0f1',
    },
    subgraphUrl:
      'https://api.thegraph.com/subgraphs/name/blossomlabs/rosette-stone-goerli',
  },
};

export const DEFAULT_NETWORK: Network = 5;
