import { scan } from '../../scanner';

describe('Scanner: Booleans', () => {
  it('scans true', async () => {
    expect(await scan('`true`')).toMatchInlineSnapshot(`
      [
        {
          "type": "TICK",
        },
        {
          "type": "BOOLEAN",
          "value": "true",
        },
        {
          "type": "TICK",
        },
      ]
    `);
  });

  it('scans false', async () => {
    expect(await scan('`false`')).toMatchInlineSnapshot(`
      [
        {
          "type": "TICK",
        },
        {
          "type": "BOOLEAN",
          "value": "false",
        },
        {
          "type": "TICK",
        },
      ]
    `);
  });
});
