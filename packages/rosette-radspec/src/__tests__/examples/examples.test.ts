import { Fetcher } from '@blossom-labs/rosette-core';
import {
  DEFAULT_TEST_SERVER_CONFIG,
  setUpTestServer,
} from '@blossom-labs/rosette-test';
import { BigNumber, utils as ethersUtils, providers } from 'ethers';

import { TypedValue } from '../../evaluator';
import { evaluateRaw } from '../../lib';

import { defaultHelpers } from '../../helpers';
import { tenPow } from '../../helpers/lib/formatBN';
import { ETH } from '../../helpers/lib/token';

type EvaluateRawParameters = Parameters<typeof evaluateRaw>;

type EvaluateRawTestParams = {
  source: EvaluateRawParameters['0'];
  bindings?: EvaluateRawParameters['1'];
  options?: Partial<EvaluateRawParameters['2']>;
};

type Case = [EvaluateRawTestParams, string];

// TODO: include user helpers and functions

const knownFunctions = {
  'setOwner(address)': 'Set `$1` as the new owner',
  'setOwner(bytes32,address)': 'Set `$2` as the new owner of the `$1` node',
  'transfer(address,uint256)': 'Transfer `@tokenAmount(self, $2)` to `$1`',
  'payday()': 'Get owed Payroll allowance',
  'approveAndCall(address,uint256,bytes)':
    'Approve `$1` to spend `@tokenAmount(self, $2)` on your behalf and trigger a function in the contract at `$1`',
};

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
      source: 'Balance: `@tokenAmount(token, balance, false, 5)` ANT',
      bindings: {
        token: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
        balance: int('647413054590000000000000'),
      },
    },
    'Balance: 647413.05459 ANT',
  ],
  [
    {
      source:
        'Balance: `@tokenAmount(token, balance, false, 5)` ANT (non-checksummed)',
      bindings: {
        token: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
        balance: int('647413054590000000000000'),
      },
    },
    'Balance: 647413.05459 ANT (non-checksummed)',
  ],
  [
    {
      source:
        'Balance: `@tokenAmount(token, balance, false, 7)` ANT (trailing zeros)',
      bindings: {
        token: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
        balance: int('647413054590000000000000'),
      },
    },
    'Balance: 647413.0545900 ANT (trailing zeros)',
  ],
  [
    {
      source:
        'Balance: `@tokenAmount(token, balance, false, 5)` ANT (non-precise)',
      bindings: {
        token: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
        balance: int('647413054595780000000000'),
      },
    },
    'Balance: ~647413.05459 ANT (non-precise)',
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
        token: address('0xFf16ec7ff5f021B6e444EEBD50382FCf43D3BD24'),
        balance: int('10'),
      },
    },
    'Balance: 0.00000000000000001 UNIC',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance)`',
      bindings: {
        token: address('0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa'),
        balance: int('10000000000000000000'),
      },
    },
    'Balance: 10 DAI',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance)`',
      bindings: {
        token: address('0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa'),
        balance: int('1000000000000000'),
      },
    },
    'Balance: 0.001 DAI',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance)`',
      bindings: {
        token: address('0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa'),
        balance: int('1'),
      },
    },
    'Balance: 0.000000000000000001 DAI',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance, true, 3)`',
      bindings: {
        token: address('0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa'),
        balance: int('1'),
      },
    },
    'Balance: ~0.000 DAI',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance, true, 3)`',
      bindings: {
        token: address('0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa'),
        balance: int('1000000000000000001'),
      },
    },
    'Balance: ~1.000 DAI',
  ],
  [
    {
      source: 'Balance: `@tokenAmount(token, balance)`',
      bindings: {
        token: address('0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa'),
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
        "Ethereum launched on a `@formatDate(date, 'dddd')` in `@formatDate(date, 'MMMM YYYY')`",
      bindings: { date: int('1438269793') },
    },
    'Ethereum launched on a Thursday in July 2015',
  ],
  [
    {
      source: "Period duration is `@transformTime(time, 'days')`",
      bindings: { time: int(3600 * 24 * 2 + 50) },
    },
    'Period duration is 2 days',
  ],
  [
    {
      source: 'Period duration is `@transformTime(time)`',
      bindings: { time: int(3600 * 24 * 30) },
    },
    'Period duration is a month',
  ],
  [
    {
      source: '3600 seconds is `@transformTime(3600)`',
      bindings: {},
    },
    '3600 seconds is an hour',
  ],
  [
    {
      source: "10k minutes is `@transformTime(10 ^ 4, 'seconds', 'minutes')`",
      bindings: {},
    },
    '10k minutes is 7 days',
  ],
  [
    {
      source: "30 days is `@transformTime(30, 'months', 'days')`",
      bindings: {},
    },
    '30 days is a month',
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
        addr: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
        data: bytes(
          '0xa9059cbb00000000000000000000000031ab1f92344e3277ce9404e4e097dab7514e6d2700000000000000000000000000000000000000000000000821ab0d4414980000',
        ), // transfer(), on knownFunctions requiring helpers
      },
    },
    'Transfer: Transfer 150 ANT to 0x31AB1f92344e3277ce9404E4e097dab7514E6D27',
  ],
  [
    {
      source: 'ApproveAndCall: `@radspec(addr, data)`',
      bindings: {
        addr: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
        data: bytes(
          '0xcae9ca510000000000000000000000000256bf39b5f51c6b151edd897a1f2ab97a1c7aba0000000000000000000000000000000000000000000000056bc75e2d63100000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        ), // approveAndCall(address,uint256,bytes), on knownFunctions requiring helpers
      },
    },
    'ApproveAndCall: Approve 0x0256bF39B5f51c6B151edd897a1f2ab97A1C7aBA to spend 100 ANT on your behalf and trigger a function in the contract at 0x0256bF39B5f51c6B151edd897a1f2ab97A1C7aBA',
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
        token: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
      },
    },
    'Allocate 100 ANT.',
  ],
  [
    {
      source: 'Allocate `amount token.symbol(): string` (non-checksummed).',
      bindings: {
        amount: int(100),
        token: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
      },
    },
    'Allocate 100 ANT (non-checksummed).',
  ],
  [
    {
      source:
        'Burns the `token.symbol(): string` balance of `person` (balance is `token.balanceOf(person): uint256 / 1000000000000000000`)',
      bindings: {
        token: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
        person: address('0x0000000000000000000000000000000000000001'),
      },
    },
    'Burns the ANT balance of 0x0000000000000000000000000000000000000001 (balance is 0)',
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
          to: '0x0D5263B7969144a852D58505602f630f9b20239D',
          data: '',
        },
      },
    },
    'Burns the ANT balance of 0x0000000000000000000000000000000000000001 (balance is 0)',
  ],
  [
    {
      source:
        "Initialize Finance app for Vault at `_vault` with period length of `(_periodDuration - _periodDuration % 86400) / 86400` day`_periodDuration >= 172800 ? 's' : ' '`",
      bindings: {
        _periodDuration: int(86400 * 2),
        _vault: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
      },
    },
    'Initialize Finance app for Vault at 0x0D5263B7969144a852D58505602f630f9b20239D with period length of 2 days',
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
        'Explicit: Transaction with ID `txId` was sent to `self.getTransaction(txId): (uint64, uint256, uint256, uint64, address, <address>, bool, uint64)`',
      bindings: { txId: { type: 'uint256', value: 1 } },
      options: {
        transaction: {
          to: '0xefc27f01e2a7e3f24a7e5ebd87e64cd2ca3c5a44',
          data: '',
        },
      },
    },
    'Explicit: Transaction with ID 1 was sent to 0x14FA5C16Af56190239B997485656F5c8b4f86c4b',
  ],
  [
    {
      source: 'Implicit: `token.symbol(): (string)`',
      bindings: {
        token: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
      },
    },
    'Implicit: ANT',
  ],
  [
    {
      source:
        'Explicit (last type): `self.getTransaction(txId): (uint64, uint256, uint256, uint64, address, address, bool, <uint64>)`',
      bindings: { txId: { type: 'uint256', value: 1 } },
      options: {
        transaction: {
          to: '0xefc27f01e2a7e3f24a7e5ebd87e64cd2ca3c5a44',
          data: '',
        },
      },
    },
    'Explicit (last type): 1644693609',
  ],
  [
    {
      source:
        'Explicit (first type): `self.getTransaction(txId): (<uint64>, uint256, uint256, uint64, address, address, bool, uint64)`',
      bindings: { txId: { type: 'uint256', value: 1 } },
      options: {
        transaction: {
          to: '0xefc27f01e2a7e3f24a7e5ebd87e64cd2ca3c5a44',
          data: '',
        },
      },
    },
    'Explicit (first type): 0',
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
        contract: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
      },
      options: { transaction: { to: '', data: '0xabcdef' } },
    },
    'Sending tx with data 0xabcdef to contract at 0x0D5263B7969144a852D58505602f630f9b20239D',
  ],

  // using msg.data on a helper
  [
    {
      source: 'Performs a call to `@radspec(contract, msg.data)`',
      bindings: {
        contract: address('0x0D5263B7969144a852D58505602f630f9b20239D'),
      },
      options: {
        transaction: {
          to: '',
          data: ethersUtils
            .keccak256(ethersUtils.toUtf8Bytes(Object.keys(knownFunctions)[3]))
            .slice(0, 10),
        },
      },
    },
    `Performs a call to ${Object.values(knownFunctions)[3]}`,
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

  beforeAll(() => {
    fetcher = new Fetcher({
      ipfsGateway,
      rpcEndpoint,
      rosetteNetworkId: network,
    });

    provider = new providers.JsonRpcProvider(rpcEndpoint);
  });

  cases.forEach(([input, expected], index) => {
    it(`${index} - ${input.source}`, async () => {
      // const { userHelpers, userFunctions = {} } = input.options || {};
      const actual = evaluateRaw(input.source, input.bindings ?? {}, {
        availableHelpers: { ...defaultHelpers /*, ...userHelpers  */ },
        fetcher,
        provider,
        transaction: { to: '', data: '' },
        ...input.options,
        // availableFunctions: { ...knownFunctions /*, ...userFunctions */ },
      });

      await expect(actual).resolves.toBe(expected);
    });
  });
});
