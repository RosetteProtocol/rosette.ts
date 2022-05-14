import type { Transaction } from '@blossom-labs/rosette-core';
import { Interface } from 'ethers/lib/utils';

import { InvalidTransactionError } from '../errors';

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

  try {
    // Parse as an ethers TransactionDescription
    const { args, functionFragment } =
      ethersInterface.parseTransaction(transaction);
    return functionFragment.inputs.reduce((parameters, input, index) => {
      const inputValue = {
        type: input.type,
        value: args[input.name ?? index],
      };

      return {
        /**
         * Set binding by param name and position on
         * the signature.
         */
        ...(input.name ? { [input.name]: inputValue } : {}),
        [`$${index + 1}`]: inputValue,
        ...parameters,
      };
    }, {} as Bindings);
  } catch (error_) {
    const error = <Error>error_;
    throw new InvalidTransactionError(error.message);
  }
}
