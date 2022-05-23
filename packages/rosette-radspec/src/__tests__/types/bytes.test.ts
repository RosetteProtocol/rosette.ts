import { TYPES } from '../../types/solidity';

describe('Type: bytes', () => {
  it('checks byte alias', () => {
    expect(TYPES.bytes.isType('byte')).toEqual(true);
  });

  it('checks a byte type correctly', () => {
    expect(TYPES.bytes.isType('bytes32')).toEqual(true);
  });

  it('checks byte that exceeds maximum length', () => {
    expect(TYPES.bytes.isType('bytes64')).toEqual(false);
  });
});
