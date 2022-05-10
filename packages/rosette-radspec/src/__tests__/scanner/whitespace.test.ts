import { scan } from '../../scanner';
import type { Token, TokenType } from '../../types';
import { MONOLOGUE, TICK } from '../../types';

describe('Scanner: Whitespace', () => {
  const cases: [string, TokenType[]][] = [
    ['` `', [TICK, TICK]],
    ['`\r`', [TICK, TICK]],
    ['`\t`', [TICK, TICK]],
    ['`\n`', [TICK, TICK]],
    [' \r\t\n', [MONOLOGUE]],
  ];

  for (const [input, expected] of cases) {
    it(`scans ${input}`, async () => {
      const actual = await scan(input);
      const expectedNodes = expected.map(
        (t): Token => ({
          type: t,
          value: t === MONOLOGUE ? input : undefined,
        }),
      );
      expect(actual).toEqual(expect.arrayContaining(expectedNodes));
    });
  }
});
