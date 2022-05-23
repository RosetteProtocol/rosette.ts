import type { Config } from '@jest/types';

const baseConfig: Config.InitialOptions = {
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  snapshotFormat: {
    printBasicPrototype: false,
  },
  transform: {
    '^.+\\.(ts|js)(x)?$': [
      '@swc-node/jest',
      {
        jsc: {
          minify: false,
        },
      },
    ],
  },
};

const config: Config.InitialOptions = {
  coverageProvider: 'v8',
  coverageReporters: ['text'],
  testPathIgnorePatterns: ['/fixtures'],
  projects: [
    {
      ...baseConfig,
      displayName: 'rosette',
      testEnvironment: 'jsdom',
      testRegex: 'packages/rosette/src/__tests__/.*\\.test\\.ts(x)?$',
    },
    {
      ...baseConfig,
      displayName: 'rosette-core',
      testEnvironment: 'jsdom',
      testRegex: 'packages/rosette-core/src/__tests__/.*\\.test\\.ts(x)?$',
    },
    {
      ...baseConfig,
      displayName: 'rosette-radspec',
      testEnvironment: 'jsdom',
      testRegex: 'packages/rosette-radspec/src/__tests__/.*\\.test\\.ts(x)?$',
    },
    {
      ...baseConfig,
      displayName: 'rosette-react',
      testEnvironment: 'jsdom',
      testRegex: 'packages/rosette-react/src/__tests__/.*\\.test\\.ts(x)?$',
    },
  ],
  reporters: ['default', 'github-actions'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};

module.exports = config;
