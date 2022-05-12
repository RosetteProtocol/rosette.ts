import { utils } from 'ethers';
import type { providers } from 'ethers';

import type { Address } from '../types';

export const getBytecodeHash = async (
  provider: providers.Provider,
  contractAddress: Address,
): Promise<string> => utils.id(await provider.getCode(contractAddress));
