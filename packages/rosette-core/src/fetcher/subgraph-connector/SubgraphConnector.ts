import 'isomorphic-fetch';

import type { FnEntry } from '../../types';
import { parseEntries, parseFunctionEntry } from './parsers';
import { CONTRACT_FUNCTION_ENTRIES, FUNCTION_ENTRY } from './queries';
import { buildEntryId } from './helpers';

type QueryOptions = {
  allowDisputed: boolean;
};

type QueryResult = {
  data: any;
  errors?: { message: string }[];
};

type Result<T> = [T | null, boolean];

const DEFAULT_OPTIONS: QueryOptions = {
  allowDisputed: false,
};

export class SubgraphConnector {
  #subgraphUrl: string;

  constructor(subgraphUrl: string) {
    this.#subgraphUrl = subgraphUrl;
  }

  protected async querySubgraph<T>(
    query: string,
    parser?: (data: any) => T,
  ): Promise<Result<T>> {
    const body: any = { query };

    const rawResponse = await fetch(this.#subgraphUrl, {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    const { data, errors } = (await rawResponse.json()) as QueryResult;

    if (errors?.length) {
      console.error(errors[0]);

      return [null, true];
    }

    return [parser ? parser(data) : data, false];
  }

  entry(
    bytecodeHash: string,
    sigHash: string,
    { allowDisputed }: QueryOptions = DEFAULT_OPTIONS,
  ) {
    const entryId = buildEntryId(bytecodeHash, sigHash);

    return this.querySubgraph<FnEntry | null>(
      FUNCTION_ENTRY(entryId, allowDisputed),
      parseFunctionEntry,
    );
  }

  async entries(
    bytecodeHash: string,
    { allowDisputed }: QueryOptions = DEFAULT_OPTIONS,
  ) {
    return this.querySubgraph<FnEntry[]>(
      CONTRACT_FUNCTION_ENTRIES(bytecodeHash, allowDisputed),
      parseEntries,
    );
  }
}
