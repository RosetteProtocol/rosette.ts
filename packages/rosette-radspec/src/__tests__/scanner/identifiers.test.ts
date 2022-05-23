import { scan } from '../../scanner';
import type { Token, TokenType } from '../../types';
import { IDENTIFIER, TICK } from '../../types';

describe('Scanner: types', () => {
  const cases: [string, (TokenType | Token)[]][] = [
    ['`a`', [TICK, { type: IDENTIFIER, value: 'a' }, TICK]],
    ['`b`', [TICK, { type: IDENTIFIER, value: 'b' }, TICK]],
    ['`test0123`', [TICK, { type: IDENTIFIER, value: 'test0123' }, TICK]],
    ['`_hidden`', [TICK, { type: IDENTIFIER, value: '_hidden' }, TICK]],
    ['`$var0`', [TICK, { type: IDENTIFIER, value: '$var0' }, TICK]],
  ];

  for (const [input, expected] of cases) {
    it(`scans \`${input}\``, async () => {
      const actual = await scan(input);
      const expectedNodes = expected.map(
        (n): Token =>
          typeof n === 'string' ? ({ type: n } as Token) : (n as Token),
      );

      expect(actual).toEqual(expect.arrayContaining(expectedNodes));
    });
  }
});
