import { TYPES } from '../../types/solidity';

const fixed = TYPES.fixed;

describe('Type: fixed', () => {
  it('checks fixed types correctly', () => {
    expect(fixed.isType('fixed8x11')).toEqual(true);
    expect(fixed.isType('fixed248x35')).toEqual(true);
    expect(fixed.isType('fixed')).toEqual(true);
  });

  it('checks false fixed types correctly', () => {
    expect(fixed.isType('asdafixed')).toEqual(false);
    expect(fixed.isType('fixedAxB')).toEqual(false);
    expect(fixed.isType('fixed256x')).toEqual(false);
    expect(fixed.isType('fixedx80')).toEqual(false);
    expect(fixed.isType('fixed256x89')).toEqual(false);
    expect(fixed.isType('fixed256x-1')).toEqual(false);
    expect(fixed.isType('fixed266x33')).toEqual(false);
    expect(fixed.isType('fixed7x33')).toEqual(false);
    expect(fixed.isType('fixed129x33')).toEqual(false);
  });
});
