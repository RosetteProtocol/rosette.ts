import type { Address } from '@blossom-labs/rosette-types';
import { Contract as EthersContract, providers } from 'ethers';
import LRUCache from 'lru-cache';

import { toUtf8String } from 'ethers/lib/utils';

import type { FnEntry, Network } from '../types';
import { IPFSResolver } from './IPFSResolver';
import { SubgraphConnector } from './subgraph-connector/SubgraphConnector';
import rosetteStoneAbi from '../abis/RosetteStone.json';
import { Config } from '../configuration';
import { getBytecodeHash } from '../utils/web3';
import { buildEntryId } from './subgraph-connector/helpers';

export type FetcherOptions = {
  ipfsGateway?: string;
  provider?: providers.Provider;
};

const isEntryValid = (e: FnEntry): boolean => !!e.abi && !!e.notice;

export class Fetcher {
  readonly subgraphConnector: SubgraphConnector;
  #ipfsResolver: IPFSResolver;
  #providersCache: Map<number, providers.StaticJsonRpcProvider>;
  #entriesCache: LRUCache<string, FnEntry>;
  #rosetteStone: EthersContract;

  constructor(networkId: Network, options: FetcherOptions = {}) {
    const { ipfsGateway, provider } = options;
    const config = Config[networkId];

    if (!config) {
      throw new Error('Unsupported network');
    }

    this.subgraphConnector = new SubgraphConnector(networkId);
    this.#ipfsResolver = new IPFSResolver(ipfsGateway);
    this.#entriesCache = new LRUCache({ max: 100 });
    this.#providersCache = new Map<number, providers.StaticJsonRpcProvider>();
    this.#rosetteStone = new EthersContract(
      config.contractAddresses.rosetteStone,
      rosetteStoneAbi,
      provider ?? providers.getDefaultProvider(networkId),
    );
  }

  async entry(
    networkId: number,
    contractAddress: Address,
    sigHash: string,
  ): Promise<FnEntry> {
    const bytecodeHash = await getBytecodeHash(
      this.#getProvider(networkId),
      contractAddress,
    );
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
    networkId: number,
    contractAddress: Address,
    // TODO: implement logic involving a selected group of sig hashes.
  ): Promise<FnEntry[]> {
    const bytecodeHash = await getBytecodeHash(
      this.#getProvider(networkId),
      contractAddress,
    );
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

  #getProvider(networkId: number): providers.StaticJsonRpcProvider {
    if (this.#providersCache.has(networkId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.#providersCache.get(networkId)!;
    }

    const p = new providers.StaticJsonRpcProvider('', networkId);

    this.#providersCache.set(networkId, p);

    return p;
  }
}
