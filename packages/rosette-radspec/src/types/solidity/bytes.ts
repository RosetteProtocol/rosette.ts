import type { SolidityType } from './helpers';
import { getTypeRange } from './helpers';

export const bytesType: SolidityType = {
  isType(identifier) {
    if (identifier === 'bytes') {
      return true;
    }

    const bytesNumber = getTypeRange(identifier);

    const isByte = !bytesNumber && identifier === 'byte';

    return isByte || (bytesNumber <= 32 && identifier.startsWith('bytes'));
  },

  size(identifier) {
    if (identifier === 'bytes') {
      return Infinity;
    }

    // `byte` is bytes1
    if (identifier === 'byte') {
      identifier = 'bytes1';
    }

    return getTypeRange(identifier);
  },
};
