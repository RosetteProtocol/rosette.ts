import type { Transaction } from '@blossom-labs/rosette-types';
import { Interface } from 'ethers/lib/utils';

import type { Bindings } from '../types';

/**
 * Decode parameters from a calldata of a transaction.
 *
 * @param abi The radspec expression
 * @param transaction The transaction to decode for this evaluation
 * @return An object with the parameters
 */
export function decodeCalldata(
  abi: string,
  transaction: Transaction,
): Bindings {
  // Create ethers interface object
  const ethersInterface = new Interface([abi]);

  // Parse as an ethers TransactionDescription
  const { args, functionFragment } =
    ethersInterface.parseTransaction(transaction);

  return functionFragment.inputs.reduce(
    (parameters, input) => ({
      [input.name]: {
        type: input.type,
        value: args[input.name],
      },
      ...parameters,
    }),
    {} as Bindings,
  );
}
