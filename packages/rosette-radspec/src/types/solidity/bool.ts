import type { SolidityType } from './helpers';

export const boolType: SolidityType = {
  isType(identifier) {
    return identifier === 'bool';
  },
};
