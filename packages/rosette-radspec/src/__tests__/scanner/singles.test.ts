import { scan } from '../../scanner';
import type { Token, TokenType } from '../../types';
import {
  COLON,
  COMMA,
  DOT,
  LEFT_PAREN,
  MINUS,
  PLUS,
  POWER,
  RIGHT_PAREN,
  SLASH,
  STAR,
  TICK,
} from '../../types';

describe('Scanner: Single character tokens', () => {
  const cases: [string, TokenType[]][] = [
    ['`(`', [TICK, LEFT_PAREN, TICK]],
    ['`)`', [TICK, RIGHT_PAREN, TICK]],
    ['`,`', [TICK, COMMA, TICK]],
    ['`.`', [TICK, DOT, TICK]],
    ['`:`', [TICK, COLON, TICK]],
    ['`-`', [TICK, MINUS, TICK]],
    ['`+`', [TICK, PLUS, TICK]],
    ['`*`', [TICK, STAR, TICK]],
    ['`^`', [TICK, POWER, TICK]],
    ['`/`', [TICK, SLASH, TICK]],
  ];

  for (const [input, expected] of cases) {
    it(`scans ${input}`, async () => {
      const actual = await scan(input);
      const expectedNodes = expected.map((type): Token => ({ type }));
      expect(actual).toEqual(expect.arrayContaining(expectedNodes));
    });
  }
});
