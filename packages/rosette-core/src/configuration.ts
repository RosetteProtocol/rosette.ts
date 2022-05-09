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
};
