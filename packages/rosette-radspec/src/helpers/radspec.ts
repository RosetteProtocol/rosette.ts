// import type { Transaction } from '@blossom-labs/rosette-types';
// import type { providers } from 'ethers';

// import { decodeCalldata } from '../decoder';
// import type { Evaluator } from '../evaluator';
// import { TypedValue } from '../evaluator';
// // import { fetchRegistryEntry } from '../fetcher';
// import { evaluateRaw } from '../lib';

// export default (provider: providers.Provider, evaluator: Evaluator) =>
//   /**
//    * Interpret calldata using radspec recursively
//    *
//    * @param transaction The calldata of the call
//    * @return {Promise<radspec/evaluator/TypedValue>}
//    */
//   async (transaction: Transaction): Promise<TypedValue> => {
//     const { to, data } = transaction;
//     // const { abi, notice } = await fetchRegistryEntry({ to, data }, provider);

//     return new TypedValue('string', 'aa');
//     // const parameters = decodeCalldata(abi, transaction);

//     // return new TypedValue(
//     //   'string',
//     //   await evaluateRaw(notice, parameters, {
//     //     provider,
//     //     availableHelpers: evaluator.helpers.getHelpers(),
//     //     to,
//     //     data,
//     //   }),
//     // );
//   };

export const a = 1;
