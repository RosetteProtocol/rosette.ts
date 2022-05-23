import { boolType } from './bool';
import { intType } from './int';
import { uintType } from './uint';
import { addressType } from './address';
import { bytesType } from './bytes';
import { stringType } from './string';
import { fixedType } from './fixed';
import { ufixedType } from './ufixed';
import type { SolidityType } from './helpers';

export const TYPES: Record<string, SolidityType> = {
  bool: boolType,
  int: intType,
  uint: uintType,
  address: addressType,
  bytes: bytesType,
  string: stringType,
  fixed: fixedType,
  ufixed: ufixedType,
};

export const isType = (identifier: string): boolean => {
  const typeNames = Object.keys(TYPES);

  for (const typeName of typeNames) {
    if (TYPES[typeName].isType(identifier)) {
      return true;
    }
  }

  return false;
};

export const isInteger = (identifier: string): boolean => {
  return TYPES.int.isType(identifier) || TYPES.uint.isType(identifier);
};

export const isAddress = (identifier: string): boolean => {
  return (
    TYPES.address.isType(identifier) ||
    (TYPES.bytes.isType(identifier) &&
      !!TYPES.bytes.size &&
      TYPES.bytes.size(identifier) <= 20)
  );
};
