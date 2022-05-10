import type { SolidityType } from './helpers';

export const ufixedType: SolidityType = {
  isType(identifier) {
    let mXn = identifier.substring(6);

    if (!mXn) mXn = '128x18';
    if (mXn.indexOf('x') === -1) return false;

    let m: string | number = mXn.substring(0, mXn.indexOf('x'));
    let n: string | number = mXn.substring(mXn.indexOf('x') + 1, mXn.length);

    if (n === '' || m === '') return false;

    m = Number(m);
    n = Number(n);

    return (
      identifier.startsWith('ufixed') &&
      m % 8 === 0 &&
      m <= 256 &&
      m >= 8 &&
      n <= 80 &&
      n >= 0
    );
  },
};
