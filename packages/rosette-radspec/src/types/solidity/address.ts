import type { SolidityType } from './helpers';

export const addressType: SolidityType = {
  isType(identifier) {
    return identifier === 'address';
  },
};
