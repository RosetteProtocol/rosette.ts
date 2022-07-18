import { Fetcher } from '@blossom-labs/rosette-core';
import {
  DEFAULT_TEST_SERVER_CONFIG,
  setUpTestServer,
} from '@blossom-labs/rosette-test';
import { BigNumber, providers } from 'ethers';

import { TypedValue } from '../../evaluator';
import { evaluateRaw } from '../../lib';

import { defaultHelpers } from '../../helpers';
import { tenPow } from '../../helpers/lib/formatBN';
import { ETH } from '../../helpers/lib/token';

type EvaluateRawParameters = Parameters<typeof evaluateRaw>;

type EvaluateRawTestParams = {
  source: EvaluateRawParameters['0'];
  bindings?: EvaluateRawParameters['1'];
  options?: Partial<EvaluateRawParameters['3']>;
};

type Case = [EvaluateRawTestParams, string];

// TODO: include user helpers and functions

const int = (value: any): TypedValue => new TypedValue('int256', value);

const address = (
  value = '0x0000000000000000000000000000000000000001',
): TypedValue => new TypedValue('address', value);

const bool = (value: any): TypedValue => new TypedValue('bool', value);

const string = (value: any): TypedValue => new TypedValue('string', value);

const bytes32 = (value: any): TypedValue => new TypedValue('bytes32', value);

const bytes = (value: any): TypedValue => new TypedValue('bytes', value);

const comparisonCases: Case[] = [
  [
    {
      source: '`a > 2`',
      bindings: { a: int(3) },
    },
    'true',
  ],
  [
    {
      source: '`a > b`',
      bindings: { a: int(2), b: int(3) },
    },
    'false',
  ],
  [
    {
      source: '`a >= b`',
      bindings: { a: int(3), b: int(2) },
    },
    'true',
  ],
  [
    {
      source: '`a >= b`',
      bindings: { a: int(1), b: int(2) },
    },
    'false',
  ],
  [
    {
      source: '`a >= b`',
      bindings: { a: int(2), b: int(2) },
    },
    'true',
  ],
  [
    {
      source: '`a < b`',
      bindings: { a: int(3), b: int(2) },
    },
    'false',
  ],
  [
    {
      source: '`a < b`',
      bindings: { a: int(2), b: int(3) },
    },
    'true',
  ],
  [
    {
      source: '`a <= b`',
      bindings: { a: int(3), b: int(2) },
    },
    'false',
  ],
  [
    {
      source: '`a <= b`',
      bindings: { a: int(1), b: int(2) },
    },
    'true',
  ],
  [
    {
      source: '`a <= b`',
      bindings: { a: int(3), b: int(3) },
    },
    'true',
  ],
  [
    {
      source: '`a == b`',
      bindings: { a: int(3), b: int(3) },
    },
    'true',
  ],
  [
    {
      source: '`a != b`',
      bindings: { a: int(3), b: int(3) },
    },
    'false',
  ],
  [
    {
      source: '`a > 0x01`',
      bindings: { a: address('0x0000000000000000000000000000000000000002') },
    },
    'true',
  ],
  [
    {
      source: '`a != 0x01`',
      bindings: { a: address('0x0000000000000000000000000000000000000002') },
    },
    'true',
  ],
  [
    {
      source: '`a != 0x01`',
      bindings: { a: address('0x0000000000000000000000000000000000000002') },
    },
    'true',
  ],
  [
    {
      source: '`a > 0x01`',
      bindings: {
        a: bytes32(
          '0x0000000000000000000000000000000000000000000000000000000000000002',
        ),
      },
    },
    'true',
  ],
];

const helperCases: Case[] = [
  [
    {
      source: "helper `@echo(@echo('hi '), 1 + 100000 ^ 0)`",
      bindings: {},
    },
    'helper hi hi ',
  ],
  [
    {
      source: 'Balance: `@withDecimals(balance, 18)` ETH',
      bindings: { balance: int('647413054590000000000000') },
    },
    'Balance: 647413.05459 ETH',
  ],
  [
    {
      source: 'Balance: `@withDecimals(balance, 6)` USDC',
      bindings: { balance: int('647413054590000000000000') },
    },
    'Balance: 647413054590000000 USDC',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance, false, 5)` TST',
      bindings: {
        token: address('0x7af963cF6D228E564e2A0aA0DdBF06210B38615D'),
        balance: int('647413054590000000000000'),
      },
    },
    'Balance: 647413.05459 TST',
  ],
  [
    {
      source:
        'Balance: `@tokenAmount(token, balance, false, 5)` TST (non-checksummed)',
      bindings: {
        token: address('0x7af963cF6D228E564e2A0aA0DdBF06210B38615D'),
        balance: int('647413054590000000000000'),
      },
    },
    'Balance: 647413.05459 TST (non-checksummed)',
  ],
  [
    {
      source:
        'Balance: `@tokenAmount(token, balance, false, 7)` TST (trailing zeros)',
      bindings: {
        token: address('0x7af963cF6D228E564e2A0aA0DdBF06210B38615D'),
        balance: int('647413054590000000000000'),
      },
    },
    'Balance: 647413.0545900 TST (trailing zeros)',
  ],
  [
    {
      source:
        'Balance: `@tokenAmount(token, balance, false, 5)` TST (non-precise)',
      bindings: {
        token: address('0x7af963cF6D228E564e2A0aA0DdBF06210B38615D'),
        balance: int('647413054595780000000000'),
      },
    },
    'Balance: ~647413.05459 TST (non-precise)',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance)`',
      bindings: {
        token: address(ETH),
        balance: int('647413054595780000000000'),
      },
    },
    'Balance: 647413.05459578 ETH',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance)`',
      bindings: {
        token: address('0x73967c6a0904aA032C103b4104747E88c566B1A2'),
        balance: int('10000000000000000000'),
      },
    },
    'Balance: 10 DAI',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance)`',
      bindings: {
        token: address('0x73967c6a0904aA032C103b4104747E88c566B1A2'),
        balance: int('1000000000000000'),
      },
    },
    'Balance: 0.001 DAI',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance)`',
      bindings: {
        token: address('0x73967c6a0904aA032C103b4104747E88c566B1A2'),
        balance: int('1'),
      },
    },
    'Balance: 0.000000000000000001 DAI',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance, true, 3)`',
      bindings: {
        token: address('0x73967c6a0904aA032C103b4104747E88c566B1A2'),
        balance: int('1'),
      },
    },
    'Balance: ~0.000 DAI',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance, true, 3)`',
      bindings: {
        token: address('0x73967c6a0904aA032C103b4104747E88c566B1A2'),
        balance: int('1000000000000000001'),
      },
    },
    'Balance: ~1.000 DAI',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance)`',
      bindings: {
        token: address('0x73967c6a0904aA032C103b4104747E88c566B1A2'),
        balance: int('1000000000000000001'),
      },
    },
    'Balance: 1.000000000000000001 DAI',
  ],
  [
    {
      source: 'Ethereum launched `@formatDate(date)`',
      bindings: { date: int('1438269793') },
    },
    'Ethereum launched Jul. 30th 2015',
  ],
  [
    {
      source:
        "Ethereum launched on a `@formatDate(date, 'EEEE')` in `@formatDate(date, 'MMMM yyyy')`",
      bindings: { date: int('1438269793') },
    },
    'Ethereum launched on a Thursday in July 2015',
  ],
  [
    {
      source: "Period duration is `@transformTime(time, 'day')`",
      bindings: { time: int(3600 * 24 * 2 + 50) },
    },
    'Period duration is 2 days',
  ],
  [
    {
      source: "Period duration is `@transformTime(time, 'best')`",
      bindings: { time: int(3600 * 24 * 30) },
    },
    'Period duration is 1 month',
  ],
  [
    {
      source: '3600 seconds is `@transformTime(3600)`',
      bindings: {},
    },
    '3600 seconds is 1 hour',
  ],
  [
    {
      source: "10k minutes is `@transformTime(10 ^ 4, 'second', 'minute')`",
      bindings: {},
    },
    '10k minutes is 600000 seconds',
  ],
  [
    {
      source:
        'Hello `@fromHex(firstName)` `@fromHex(lastName, "utf8")`, `@fromHex(n, "number")` `@fromHex("0x69", "ascii")`s the definitive response.',
      bindings: {
        firstName: bytes32('0x446f75676c6173'),
        lastName: bytes32('0x4164616d73'),
        n: bytes('0x2a'),
      },
    },
    'Hello Douglas Adams, 42 is the definitive response.',
  ],
  [
    {
      source: 'Change required support to `@formatPct(support)`%',
      bindings: { support: int(BigNumber.from(50).mul(tenPow(16))) }, // 50 * 10^16
    },
    'Change required support to 50%',
  ],
  [
    {
      source: 'Change required support to `@formatPct(support, 10 ^ 18, 1)`%',
      bindings: {
        support: int(
          BigNumber.from(40)
            .mul(tenPow(16))
            .add(BigNumber.from(43).mul(tenPow(14))),
        ),
      }, // 40 * 10^16 + 43 * 10^14
    },
    'Change required support to ~40.4%',
  ],
  [
    {
      source: 'Transfer `@tokenAmount(self, value)` to `to`',
      bindings: {
        to: address('0xB8138d12FDd1A38C4b63d4ED7703f5CD9639eFbf'),
        value: {
          type: 'uint256',
          value: 1000000,
        },
      },
      options: {
        transaction: {
          to: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
          data: '',
        },
      },
    },
    'Transfer 1 USDC to 0xB8138d12FDd1A38C4b63d4ED7703f5CD9639eFbf',
  ],
  // [
  //   {
  //     source: 'The genesis block is #`@getBlock(n)`',
  //     bindings: { n: int(0) },
  //     options: {
  //       userHelpers: {
  //         getBlock:
  //           (provider: providers.Provider) =>
  //           async (n: TypedValue): Promise<TypedValue> =>
  //             new TypedValue(
  //               'string',
  //               (await provider.getBlock(n.value)).number,
  //             ),
  //       },
  //     },
  //   },
  //   'The genesis block is #0',
  // ],
  // [
  //   {
  //     source: 'Bar `@bar(shift)` foo `@foo(n)`',
  //     bindings: { shift: bool(true), n: int(7) },
  //     options: {
  //       userHelpers: {
  //         bar:
  //           () =>
  //           (shift: TypedValue): TypedValue =>
  //             new TypedValue('string', shift.value ? 'BAR' : 'bar'),
  //         foo:
  //           () =>
  //           (n: TypedValue): TypedValue =>
  //             new TypedValue('number', n.value * 7),
  //       },
  //     },
  //   },
  //   'Bar BAR foo 49',
  // ],
];

const dataDecodeCases: Case[] = [
  [
    {
      source: 'Transfer: `@radspec(addr, data)`',
      bindings: {
        addr: address('0x6AD196dBcd43996F17638B924d2fdEDFF6Fdd677'),
        data: bytes(
          '0xa9059cbb000000000000000000000000efd52a9e454feb9ad8edca588c7a9703d67cdff700000000000000000000000000000000000000000000000000000000004c4b40',
        ),
      },
    },
    'Transfer: Transfer 5 USDT to 0xeFD52a9E454FEB9Ad8edCA588c7a9703d67cdFF7',
  ],
];

const cases: Case[] = [
  // Bindings
  [
    {
      source: 'a is `a`, b is `b` and "c d" is `c d`',
      bindings: { a: int(1), b: int(2), c: int(3), d: int(4) },
    },
    'a is 1, b is 2 and "c d" is 3 4',
  ],
  [
    {
      source: "An empty string`''`",
      bindings: {},
    },
    'An empty string',
  ],

  // Maths
  [
    {
      source: 'Will multiply `a` by 7 and return `a * 7`',
      bindings: { a: int(122) },
    },
    'Will multiply 122 by 7 and return 854',
  ],
  [
    {
      source: 'First case is `2 * 2 + 6`, second case is `2 * (2 + 6)`',
    },
    'First case is 10, second case is 16',
  ],
  [
    {
      source: 'First case is `2^5`, second case is `2^2 + 1`',
    },
    'First case is 32, second case is 5',
  ],
  [
    {
      source:
        'First case is `(11 - 1) * 2^5`, second case is `3 * 2 ^ (4 - 1) + 1`',
    },
    'First case is 320, second case is 25',
  ],
  [
    {
      source:
        'First case is `(11 - 1) / 2`, second case is `3 * 2 ^ (4 - 1) / 3`',
    },
    'First case is 5, second case is 8',
  ],
  [
    {
      source: 'First case is `(11 - 1) % 3`, second case is `3 * 2 % 5`',
    },
    'First case is 1, second case is 1',
  ],
  [
    {
      source:
        "Basic arithmetic: `a` + `b` is `a + b`, - `c` that's `a + b - c`, quick mafs",
      bindings: { a: int(2), b: int(2), c: int(1) },
    },
    "Basic arithmetic: 2 + 2 is 4, - 1 that's 3, quick mafs",
  ],
  [
    {
      source: 'This will default to `b`: `a || b`',
      bindings: { a: int(0), b: int(1) },
    },
    'This will default to 1: 1',
  ],
  [
    {
      source: 'This will default to `a`: `a || b`',
      bindings: { a: int(1), b: int(0) },
    },
    'This will default to 1: 1',
  ],
  [
    {
      source: 'This will default to `b`: `a || b`',
      bindings: {
        a: bytes32(
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        ),
        b: int(1),
      },
    },
    'This will default to 1: 1',
  ],

  // Conditionals
  [
    {
      source: 'True is not `false ? true : false`',
      bindings: {},
    },
    'True is not false',
  ],
  [
    {
      source: "`a == 0x0 ? 'concat ' + a : 'else'`",
      bindings: { a: address('0x0000000000000000000000000000000000000000') },
    },
    'concat 0x0000000000000000000000000000000000000000',
  ],
  [
    {
      source: "`a == 0x0 ? 'concat ' + a : 'else'`",
      bindings: { a: address('0x0000000000000000000000000000000000000001') },
    },
    'else',
  ],

  // External calls
  [
    {
      source: 'Allocate `amount token.symbol(): string`.',
      bindings: {
        amount: int(100),
        token: address('0x7af963cF6D228E564e2A0aA0DdBF06210B38615D'),
      },
    },
    'Allocate 100 TST.',
  ],
  [
    {
      source: 'Allocate `amount token.symbol(): string` (non-checksummed).',
      bindings: {
        amount: int(100),
        token: address('0x7af963cF6D228E564e2A0aA0DdBF06210B38615D'),
      },
    },
    'Allocate 100 TST (non-checksummed).',
  ],
  [
    {
      source:
        'Burns the `token.symbol(): string` balance of `person` (balance is `token.balanceOf(person): uint256 / 1000000000000000000`)',
      bindings: {
        token: address('0x7af963cF6D228E564e2A0aA0DdBF06210B38615D'),
        person: address('0x0000000000000000000000000000000000000001'),
      },
    },
    'Burns the TST balance of 0x0000000000000000000000000000000000000001 (balance is 2)',
  ],
  [
    {
      source:
        'Burns the `self.symbol(): string` balance of `person` (balance is `self.balanceOf(person): uint256 / 1000000000000000000`)',
      bindings: {
        person: address('0x0000000000000000000000000000000000000001'),
      },
      options: {
        transaction: {
          to: '0x7af963cF6D228E564e2A0aA0DdBF06210B38615D',
          data: '',
        },
      },
    },
    'Burns the TST balance of 0x0000000000000000000000000000000000000001 (balance is 2)',
  ],
  [
    {
      source:
        "Initialize Finance app for Vault at `_vault` with period length of `(_periodDuration - _periodDuration % 86400) / 86400` day`_periodDuration >= 172800 ? 's' : ' '`",
      bindings: {
        _periodDuration: int(86400 * 2),
        _vault: address('0x7af963cF6D228E564e2A0aA0DdBF06210B38615D'),
      },
    },
    'Initialize Finance app for Vault at 0x7af963cF6D228E564e2A0aA0DdBF06210B38615D with period length of 2 days',
  ],
  [
    {
      source: "Vote `_supports ? 'yay' : 'nay'`",
      bindings: { _supports: bool(false) },
    },
    'Vote nay',
  ],
  [
    {
      source: 'Token `_amount / 10^18`',
      bindings: {
        _amount: int(
          BigNumber.from(10).mul(BigNumber.from(10).pow(BigNumber.from(18))),
        ),
      },
    },
    'Token 10',
  ],
  [
    {
      source: "`_bool ? 'h' + _var + 'o' : 'bye'`",
      bindings: { _bool: bool(true), _var: string('ell') },
    },
    'hello',
  ],

  // External calls with multiple return values
  [
    {
      source:
        'Explicit: Entry with scope `_scope` and sig `_sig` has the following cid: `self.getEntry(_scope,_sig): (<bytes>, address, uint8)`',
      bindings: {
        _scope: {
          type: 'bytes32',
          value:
            '0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e',
        },
        _sig: {
          type: 'bytes4',
          value: '0x3d5d7555',
        },
      },
      options: {
        transaction: {
          to: '0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1',
          data: '',
        },
      },
    },
    'Explicit: Entry with scope 0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e and sig 0x3d5d7555 has the following cid: 0x516d4e6657394e393954657655556e6f4d436453796e7a53706b47426246754e6a6271726b424665317134504c56',
  ],
  [
    {
      source: 'Implicit: `token.symbol(): (string)`',
      bindings: {
        token: address('0x7af963cF6D228E564e2A0aA0DdBF06210B38615D'),
      },
    },
    'Implicit: TST',
  ],
  [
    {
      source:
        'Explicit (last type): `self.getEntry(_scope,_sig): (bytes, address, <uint8>)`',
      bindings: {
        _scope: {
          type: 'bytes32',
          value:
            '0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e',
        },
        _sig: {
          type: 'bytes4',
          value: '0x3d5d7555',
        },
      },
      options: {
        transaction: {
          to: '0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1',
          data: '',
        },
      },
    },
    'Explicit (last type): 1',
  ],
  [
    {
      source:
        'Explicit (first type): `self.getEntry(_scope,_sig): (<bytes>, address, uint8)`',
      bindings: {
        _scope: {
          type: 'bytes32',
          value:
            '0xd158dc79b68f7ef6037f06b5206d049ca17ba8f2201e2316aff6cbb15d8b5d1e',
        },
        _sig: {
          type: 'bytes4',
          value: '0x3d5d7555',
        },
      },
      options: {
        transaction: {
          to: '0x7e18C76Aa26BD6bD04196e34C93a925498A5d0F1',
          data: '',
        },
      },
    },
    'Explicit (first type): 0x516d4e6657394e393954657655556e6f4d436453796e7a53706b47426246754e6a6271726b424665317134504c56',
  ],

  // msg.(sender | value | data) options
  [
    {
      source:
        'No value: Send `@tokenAmount(token, msg.value)` from `msg.sender` to `receiver`',
      bindings: {
        token: address(ETH),
        receiver: address('0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb'),
      },
      options: {
        transaction: {
          from: '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7',
          to: '',
          data: '',
        },
      },
    },
    'No value: Send 0 ETH from 0xb4124cEB3451635DAcedd11767f004d8a28c6eE7 to 0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb',
  ],

  [
    {
      source:
        'With value: Send `@tokenAmount(token, msg.value)` from `msg.sender` to `receiver`',
      bindings: {
        token: address(ETH),
        receiver: address('0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb'),
      },
      options: {
        transaction: {
          from: '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7',
          value: '1000000000000000000',
          data: '',
          to: '',
        },
      },
    },
    'With value: Send 1 ETH from 0xb4124cEB3451635DAcedd11767f004d8a28c6eE7 to 0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb',
  ],

  [
    {
      source: 'Sending tx with data `msg.data` to contract at `contract`',
      bindings: {
        contract: address('0x7af963cF6D228E564e2A0aA0DdBF06210B38615D'),
      },
      options: { transaction: { to: '', data: '0xabcdef' } },
    },
    'Sending tx with data 0xabcdef to contract at 0x7af963cF6D228E564e2A0aA0DdBF06210B38615D',
  ],

  // using msg.data on a helper
  [
    {
      source: 'Performs a call to `@radspec(contract, msg.data)`',
      bindings: {
        contract: address('0xeD9f02371AD4B242Ee479f04F4f17D6F56E3A686'),
      },
      options: {
        transaction: {
          to: '',
          data: '0x6881385b',
        },
      },
    },
    `Performs a call to Get owed Payroll allowance`,
  ],

  ...comparisonCases,
  ...helperCases,
  ...dataDecodeCases,
];

const { ipfsGateway, network, rpcEndpoint } = DEFAULT_TEST_SERVER_CONFIG;

describe('Test radspec examples', () => {
  let fetcher: Fetcher;
  let provider: providers.Provider;

  setUpTestServer();

  beforeAll(async () => {
    provider = new providers.JsonRpcProvider(rpcEndpoint);
    fetcher = new Fetcher({
      ipfsGateway,
      rosetteNetworkId: network,
      provider,
    });
  });

  cases.forEach(([input, expected], index) => {
    it(`${index} - ${input.source}`, async () => {
      // const { userHelpers, userFunctions = {} } = input.options || {};
      const actual = evaluateRaw(input.source, input.bindings ?? {}, provider, {
        availableHelpers: { ...defaultHelpers /*, ...userHelpers  */ },
        fetcher,
        transaction: { to: '', data: '' },
        ...input.options,
        // availableFunctions: { ...knownFunctions /*, ...userFunctions */ },
      });

      await expect(actual).resolves.toBe(expected);
    });
  });
});
