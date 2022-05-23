import type { SolidityType } from './helpers';
import { getTypeRange } from './helpers';

export const uintType: SolidityType = {
  isType(identifier) {
    let n = getTypeRange(identifier, 4);

    // Default to uint256
    if (isNaN(n)) n = 256;

    return identifier.startsWith('uint') && n % 8 === 0 && n <= 256;
  },
};
