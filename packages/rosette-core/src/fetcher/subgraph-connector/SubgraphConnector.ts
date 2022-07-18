import 'isomorphic-fetch';

import type { FnEntry } from '../../types';
import {
  parseContract,
  parseFunctionEntries,
  parseFunctionEntry,
} from './parsers';
import type { GraphQLBody } from './queries';
import { CONTRACT_FUNCTION_ENTRIES, FUNCTION, FUNCTIONS } from './queries';
import { ConnectionError } from '../../errors';

type QueryOptions = {
  allowDisputed: boolean;
};

type QueryResult = {
  data: any;
  errors?: { message: string }[];
};

type Result<T> = [T | null, Error?];

const DEFAULT_OPTIONS: QueryOptions = {
  allowDisputed: false,
};

export class SubgraphConnector {
  #subgraphUrl: string;

  constructor(subgraphUrl: string) {
    this.#subgraphUrl = subgraphUrl;
  }

  protected async querySubgraph<T>(
    body: GraphQLBody,
    parser?: (data: any) => T,
  ): Promise<Result<T>> {
    const rawResponse = await fetch(this.#subgraphUrl, {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    const { data, errors } = (await rawResponse.json()) as QueryResult;

    if (errors?.length) {
      const err = new ConnectionError(
        `An error happened while querying subgraph: ${errors[0]}`,
      );

      return [null, err];
    }

    return [parser ? parser(data) : data];
  }

  entry(
    entryId: string,
    { allowDisputed }: QueryOptions = DEFAULT_OPTIONS,
  ): Promise<Result<FnEntry | null>> {
    return this.querySubgraph<FnEntry | null>(
      FUNCTION(entryId, allowDisputed),
      parseFunctionEntry,
    );
  }

  entries(
    entryIds: string[],
    { allowDisputed }: QueryOptions = DEFAULT_OPTIONS,
  ): Promise<Result<FnEntry[]>> {
    return this.querySubgraph<FnEntry[]>(
      FUNCTIONS(entryIds, allowDisputed),
      parseFunctionEntries,
    );
  }

  async contractEntries(
    bytecodeHash: string,
    { allowDisputed }: QueryOptions = DEFAULT_OPTIONS,
  ): Promise<Result<FnEntry[]>> {
    return this.querySubgraph<FnEntry[]>(
      CONTRACT_FUNCTION_ENTRIES(bytecodeHash, allowDisputed),
      parseContract,
    );
  }
}
