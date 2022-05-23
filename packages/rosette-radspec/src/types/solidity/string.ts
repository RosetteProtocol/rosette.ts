import type { SolidityType } from './helpers';

export const stringType: SolidityType = {
  isType(identifier) {
    return identifier === 'string';
  },
};
