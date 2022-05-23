import { Contract, providers } from 'ethers';
import LRUCache from 'lru-cache';

import { toUtf8String } from 'ethers/lib/utils';

import type { Address, FnEntry, Network } from '../types';
import { IPFSResolver } from './IPFSResolver';
import { SubgraphConnector } from './subgraph-connector/SubgraphConnector';
import rosetteStoneAbi from '../abis/RosetteStone.json';
import { Config, DEFAULT_NETWORK } from '../configuration';
import { getBytecodeHash } from '../utils/web3';
import { buildEntryId, parseEntryId } from '../utils';
import {
  ConnectionError,
  NotFoundError,
  UnsupportedNetworkError,
} from '../errors';

export type FetcherOptions = {
  ipfsGateway?: string;
  rosetteNetworkId?: Network;
  rpcEndpoint?: string;
};

export type Entry = [Address, string[]];

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
      new providers.StaticJsonRpcProvider(rpcEndpoint ?? config.rpcEndpoint),
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

    const [fnEntry] = await this.subgraphConnector.entry(
      buildEntryId(bytecodeHash, sigHash),
    );

    const entry = await this.#processFnEntry(fnEntry, {
      contractAddress,
      bytecodeHash,
      sigHash,
    });

    this.#entriesCache.set(entryId, entry);

    return entry;
  }

  async entries(
    contractsToSigHashes: [Address, string[]][],
    provider: Provider,
    options: { ignoreNotFound: boolean } = { ignoreNotFound: false },
  ): Promise<FnEntry[]> {
    const bytecodeHashes = await Promise.all(
      contractsToSigHashes.map(([address]) =>
        getBytecodeHash(provider, address),
      ),
    );
    const bytecodeHashToContract = bytecodeHashes.reduce(
      (mapping, bytecodeHash, i) => ({
        ...mapping,
        [bytecodeHash]: contractsToSigHashes[i][0],
      }),
      {},
    );

    const nonCachedEntryIds: string[] = [];
    const cachedFnEntries: FnEntry[] = [];

    contractsToSigHashes.forEach(([, sigHashes], i) => {
      sigHashes.forEach((sigHash) => {
        const entryId = buildEntryId(bytecodeHashes[i], sigHash);
        const fnEntry = this.#entriesCache.get(entryId);

        if (fnEntry) {
          cachedFnEntries.push(fnEntry);
        } else {
          nonCachedEntryIds.push(entryId);
        }
      });
    });

    if (!nonCachedEntryIds.length) {
      return cachedFnEntries;
    }

    const [subgraphEntries] = await this.subgraphConnector.entries(
      nonCachedEntryIds,
    );

    let processedFnEntries: FnEntry[] = [];

    const processedFnEntriesPromises = nonCachedEntryIds.map((nonCacheId) => {
      const [bytecodeHash, sigHash] = parseEntryId(nonCacheId);
      return this.#processFnEntry(
        subgraphEntries?.find((e) => e.id === nonCacheId),
        {
          contractAddress:
            bytecodeHashToContract[
              bytecodeHash as keyof typeof bytecodeHashToContract
            ],
          bytecodeHash,
          sigHash,
        },
      );
    });

    if (options.ignoreNotFound) {
      const settledPromises = await Promise.allSettled(
        processedFnEntriesPromises,
      );

      processedFnEntries = settledPromises
        .filter((p) => p.status === 'fulfilled')
        .map((p) => (p as PromiseFulfilledResult<FnEntry>).value);
    } else {
      processedFnEntries = await Promise.all(processedFnEntriesPromises);
    }

    // Store fetched entries in cache
    processedFnEntries.forEach((e) => {
      this.#entriesCache.set(e.id, e);
    });

    return [...cachedFnEntries, ...processedFnEntries];
  }

  async contractEntries(
    contractAddress: Address,
    provider: Provider,
  ): Promise<FnEntry[]> {
    const bytecodeHash = await getBytecodeHash(provider, contractAddress);

    const [fnEntries, subgraphError] =
      await this.subgraphConnector.contractEntries(bytecodeHash);

    if (subgraphError) {
      throw new ConnectionError(
        `An error happened when fetching contract ${contractAddress} entries: ${subgraphError.message}`,
      );
    }

    const processedFnEntries = fnEntries
      ? await Promise.all(fnEntries.map((e) => this.#processFnEntry(e)))
      : [];

    processedFnEntries.forEach((e) => this.#entriesCache.set(e.id, e));

    return processedFnEntries;
  }

  async #processFnEntry(
    fnEntry: FnEntry | null | undefined,
    fallbackData?: {
      contractAddress: string;
      bytecodeHash: string;
      sigHash: string;
    },
  ): Promise<FnEntry> {
    let _fnEntry: FnEntry | null = fnEntry ? { ...fnEntry } : null;

    if (_fnEntry && isEntryValid(_fnEntry)) {
      return _fnEntry;
    }

    // Fallback to contract.
    if (!_fnEntry) {
      if (!fallbackData) {
        throw new Error('No fallback data provided');
      }

      const { contractAddress, bytecodeHash, sigHash } = fallbackData || {};

      const [bytesCID, , , status] = await this.#rosetteStone.getEntry(
        bytecodeHash,
        sigHash,
      );

      // Status empty
      if (status === 0) {
        throw new NotFoundError(
          `No description entry found for signature ${sigHash} of ${
            contractAddress
              ? `contract ${contractAddress}`
              : `hashed bytecode ${bytecodeHash}`
          }`,
        );
      }

      _fnEntry = {
        abi: '',
        disputed: status,
        notice: '',
        cid: toUtf8String(bytesCID),
        id: buildEntryId(bytecodeHash, sigHash),
        sigHash,
      };
    }

    // Fallback to fetch entry data from IPFS.
    const data = await this.#ipfsResolver.json(_fnEntry.cid);

    _fnEntry.abi = data.abi;
    _fnEntry.notice = data.notice;

    return _fnEntry;
  }
}
