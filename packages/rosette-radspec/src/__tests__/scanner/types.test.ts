import { scan } from '../../scanner';
import type { Token, TokenType } from '../../types';
import { TICK, TYPE } from '../../types';

describe('Scanner: types', () => {
  const cases: [string, (TokenType | Token)[]][] = [
    ['`bool`', [TICK, { type: TYPE, value: 'bool' }, TICK]],
    ['`int`', [TICK, { type: TYPE, value: 'int' }, TICK]],
    ['`uint`', [TICK, { type: TYPE, value: 'uint' }, TICK]],
    ['`address`', [TICK, { type: TYPE, value: 'address' }, TICK]],
    ['`bytes`', [TICK, { type: TYPE, value: 'bytes' }, TICK]],
    ['`bytes1`', [TICK, { type: TYPE, value: 'bytes1' }, TICK]],
    ['`bytes32`', [TICK, { type: TYPE, value: 'bytes32' }, TICK]],
    ['`string`', [TICK, { type: TYPE, value: 'string' }, TICK]],
    ['`fixed`', [TICK, { type: TYPE, value: 'fixed' }, TICK]],
    ['`ufixed`', [TICK, { type: TYPE, value: 'ufixed' }, TICK]],
  ];

  for (const [input, expected] of cases) {
    it(`scans ${input}`, async () => {
      const actual = await scan(input);
      const expectedNodes = expected.map(
        (n): Token => (typeof n === 'string' ? { type: n } : n),
      );
      expect(actual).toEqual(expect.arrayContaining(expectedNodes));
    });
  }
});
