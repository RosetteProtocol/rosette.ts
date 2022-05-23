import { TYPES } from '../../types/solidity';

const ufixed = TYPES.ufixed;

describe('Type: ufixed', () => {
  it('checks ufixed types correctly', () => {
    expect(ufixed.isType('ufixed8x11')).toEqual(true);
    expect(ufixed.isType('ufixed248x35')).toEqual(true);
    expect(ufixed.isType('ufixed')).toEqual(true);
  });

  it('checks invalid ufixed types correctly', () => {
    expect(ufixed.isType('asdaufixed')).toEqual(false);
    expect(ufixed.isType('fixed')).toEqual(false);
    expect(ufixed.isType('ufixed256x')).toEqual(false);
    expect(ufixed.isType('ufixedx80')).toEqual(false);
    expect(ufixed.isType('ufixedAxB')).toEqual(false);
    expect(ufixed.isType('ufixed256x89')).toEqual(false);
    expect(ufixed.isType('ufixed256x-1')).toEqual(false);
    expect(ufixed.isType('ufixed266x33')).toEqual(false);
    expect(ufixed.isType('ufixed7x33')).toEqual(false);
    expect(ufixed.isType('ufixed129x33')).toEqual(false);
  });
});
