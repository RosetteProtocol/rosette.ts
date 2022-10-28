import { Interface } from 'ethers/lib/utils';

import { InvalidTransactionError } from '../errors';

import type { Bindings, Transaction } from '../types';

/**
 * Decode parameters from a calldata of a transaction.
 *
 * @param abi The function signature ABI
 * @param transaction The transaction to decode for this evaluation
 * @return An object with the parameters
 */
export function decodeCalldata(
  abi: string,
  transaction: Transaction,
): Bindings {
  const ethersInterface = new Interface([abi]);

  try {
    const { args, functionFragment } =
      ethersInterface.parseTransaction(transaction);

    return functionFragment.inputs.reduce<Bindings>(
      (parameters, input, index) => {
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
      },
      {},
    );
  } catch (error_) {
    const error = <Error>error_;
    throw new InvalidTransactionError(`Failed to decode tx: ${error.message}`);
  }
}
