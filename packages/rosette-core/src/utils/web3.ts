import type { Address } from '@blossom-labs/rosette-types';
import type { providers } from 'ethers';
import { utils } from 'ethers';

export const getBytecodeHash = async (
  provider: providers.Provider,
  contractAddress: Address,
): Promise<string> => utils.id(await provider.getCode(contractAddress));
