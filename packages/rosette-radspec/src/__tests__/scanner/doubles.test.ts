import { scan } from '../../scanner';
import type { Token, TokenType } from '../../types';
import {
  BANG,
  BANG_EQUAL,
  DOUBLE_VERTICAL_BAR,
  EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,
  TICK,
} from '../../types';

describe('Scanner: One or two character tokens', () => {
  const cases: [string, TokenType[]][] = [
    ['`!`', [TICK, BANG, TICK]],
    ['`!=`', [TICK, BANG_EQUAL, TICK]],
    ['`=`', [TICK, EQUAL, TICK]],
    ['`==`', [TICK, EQUAL_EQUAL, TICK]],
    ['`<`', [TICK, LESS, TICK]],
    ['`<=`', [TICK, LESS_EQUAL, TICK]],
    ['`>`', [TICK, GREATER, TICK]],
    ['`>=`', [TICK, GREATER_EQUAL, TICK]],
    ['`||`', [TICK, DOUBLE_VERTICAL_BAR, TICK]],
  ];

  for (const [input, expected] of cases) {
    it(`scans ${input}`, async () => {
      const actual = await scan(input as string);
      const expectedNodes = expected.map((type): Token => ({ type }));

      expect(actual).toEqual(expect.arrayContaining(expectedNodes));
    });
  }
});
