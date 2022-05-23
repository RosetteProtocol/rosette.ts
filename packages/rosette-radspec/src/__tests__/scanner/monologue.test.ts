import { scan } from '../../scanner';
import type { Token } from '../../types';
import { IDENTIFIER, MONOLOGUE, TICK } from '../../types';

describe('Scanner: MONOLOGUE', () => {
  const cases: [string, Token[]][] = [
    ['', []],
    ['Hello, world', [{ type: MONOLOGUE, value: 'Hello, world' }]],
    [
      'Anything goes in a monologue: 🤘\nこんにちは',
      [
        {
          type: MONOLOGUE,
          value: 'Anything goes in a monologue: 🤘\nこんにちは',
        },
      ],
    ],
    [
      'Anything between ticks are not monologues `a`, anything after is',
      [
        {
          type: MONOLOGUE,
          value: 'Anything between ticks are not monologues ',
        },
        { type: TICK, value: undefined },
        { type: IDENTIFIER, value: 'a' },
        { type: TICK, value: undefined },
        { type: MONOLOGUE, value: ', anything after is' },
      ],
    ],
  ];

  for (const [input, expected] of cases) {
    it(`scans \`${input}\``, async () => {
      const actual = await scan(input);
      expect(actual).toEqual(expect.arrayContaining(expected));
    });
  }
});
