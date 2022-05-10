import { scan } from '../../scanner';

describe('Scanner: Numbers', () => {
  it('scans a number', async () => {
    expect(await scan('`1234567890`')).toMatchInlineSnapshot(`
      [
        {
          "type": "TICK",
        },
        {
          "type": "NUMBER",
          "value": "1234567890",
        },
        {
          "type": "TICK",
        },
      ]
    `);
  });

  it('scans a hexadecimal value', async () => {
    expect(await scan('`0xdeadbeef`')).toMatchInlineSnapshot(`
      [
        {
          "type": "TICK",
        },
        {
          "type": "HEXADECIMAL",
          "value": "0xdeadbeef",
        },
        {
          "type": "TICK",
        },
      ]
    `);
  });
});
