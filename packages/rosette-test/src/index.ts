import contract from './fixtures/data/contract.json';
import ipfs from './fixtures/data/ipfs.json';
import subgraph from './fixtures/data/subgraph.json';
import type { ContractFixture, IPFSFixture, SubgraphFixture } from './types';

export const contractFixture: ContractFixture = contract;
export const ipfsFixture: IPFSFixture = ipfs;
export const subgraphFixture: SubgraphFixture = subgraph;

export * from './fixtures/server';

export * from './types';
