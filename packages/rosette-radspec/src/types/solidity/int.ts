import type { SolidityType } from './helpers';
import { getTypeRange } from './helpers';

export const intType: SolidityType = {
  isType(identifier) {
    let n = getTypeRange(identifier, 3);

    // Default to int256
    if (isNaN(n)) n = 256;

    return identifier.startsWith('int') && n % 8 === 0 && n <= 256;
  },
};
