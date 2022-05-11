import { Contract, providers } from 'ethers';
import LRUCache from 'lru-cache';

import { toUtf8String } from 'ethers/lib/utils';

import type { Address, FnEntry, Network } from '../types';
import { IPFSResolver } from './IPFSResolver';
import { SubgraphConnector } from './subgraph-connector/SubgraphConnector';
import rosetteStoneAbi from '../abis/RosetteStone.json';
import { Config, DEFAULT_NETWORK } from '../configuration';
import { getBytecodeHash } from '../utils/web3';
import { buildEntryId } from './subgraph-connector/helpers';
import { UnsupportedNetworkError } from '../errors';

export type FetcherOptions = {
  ipfsGateway?: string;
  rosetteNetworkId?: Network;
  rpcEndpoint?: string;
};

type Provider = providers.Provider;

const isEntryValid = (e: FnEntry): boolean => !!e.abi && !!e.notice;

export class Fetcher {
  readonly subgraphConnector: SubgraphConnector;
  #ipfsResolver: IPFSResolver;
  #entriesCache: LRUCache<string, FnEntry>;
  #rosetteStone: Contract;

  constructor(options: FetcherOptions = {}) {
    const { ipfsGateway, rosetteNetworkId, rpcEndpoint } = options;
    const config = Config[rosetteNetworkId ?? DEFAULT_NETWORK];

    if (!config) {
      throw new UnsupportedNetworkError();
    }

    this.subgraphConnector = new SubgraphConnector(config.subgraphUrl);
    this.#ipfsResolver = new IPFSResolver(ipfsGateway);
    this.#entriesCache = new LRUCache({ max: 100 });
    this.#rosetteStone = new Contract(
      config.contractAddresses.rosetteStone,
      rosetteStoneAbi,
      new providers.JsonRpcProvider(rpcEndpoint ?? config.rpcEndpoint),
    );
  }

  async entry(
    contractAddress: Address,
    sigHash: string,
    provider: Provider,
  ): Promise<FnEntry> {
    const bytecodeHash = await getBytecodeHash(provider, contractAddress);
    const entryId = buildEntryId(bytecodeHash, sigHash);

    if (this.#entriesCache.has(entryId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.#entriesCache.get(entryId)!;
    }

    const entry = await this.#fetchEntry(bytecodeHash, sigHash);

    this.#entriesCache.set(entryId, entry);

    return entry;
  }

  async entries(
    contractAddress: Address,
    provider: Provider,
    // TODO: implement logic involving a selected group of sig hashes.
  ): Promise<FnEntry[]> {
    const bytecodeHash = await getBytecodeHash(provider, contractAddress);
    const [entries] = await this.subgraphConnector.entries(bytecodeHash);

    // Store entries
    if (entries) {
      entries.forEach((e) => {
        this.#entriesCache.set(buildEntryId(bytecodeHash, e.sigHash), e);
      });
    }

    return entries ?? [];
  }

  async #fetchEntry(bytecodeHash: string, sigHash: string): Promise<FnEntry> {
    // Try fetching from subgraph.
    const result = await this.subgraphConnector.entry(bytecodeHash, sigHash);

    const subgraphFailed = result[1];
    let fnEntry = result[0];

    if (!subgraphFailed && fnEntry && isEntryValid(fnEntry)) {
      return fnEntry;
    }

    // Try fetching from contract.
    if (subgraphFailed || !fnEntry) {
      const [bytesCID, , , status] = await this.#rosetteStone.getEntry(
        bytecodeHash,
        sigHash,
      );

      fnEntry = {
        abi: '',
        disputed: status,
        notice: '',
        cid: toUtf8String(bytesCID),
        sigHash,
      };
    }

    // Fallback to fetch entry data from IPFS.
    const data = await this.#ipfsResolver.json(fnEntry.cid);

    fnEntry.abi = data.abi;
    fnEntry.notice = data.notice;

    return fnEntry;
  }
}
