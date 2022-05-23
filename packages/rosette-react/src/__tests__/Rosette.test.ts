import type { ReactNode } from 'react';
import { createElement } from 'react';

import { useRosette } from '../providers/Rosette';
import { renderRosetteHook } from './utils';

describe('useClient', () => {
  describe('mounts', () => {
    it('default', () => {
      const { result } = renderRosetteHook(() => useRosette());

      expect(result.current).toMatchInlineSnapshot(`
        {
          "client": Client {
            "fetcher": Fetcher {
              "subgraphConnector": SubgraphConnector {},
            },
          },
          "provider": JsonRpcProvider {
            "_emitted": {
              "block": -2,
            },
            "_events": [],
            "_fastQueryDate": 0,
            "_isProvider": true,
            "_lastBlockNumber": -2,
            "_maxFilterBlockRange": 10,
            "_maxInternalBlockNumber": -1024,
            "_networkPromise": Promise {},
            "_nextId": 42,
            "_pollingInterval": 4000,
            "anyNetwork": false,
            "connection": {
              "url": "http://localhost:8545/",
            },
            "disableCcipRead": false,
            "formatter": Formatter {
              "formats": {
                "block": {
                  "baseFeePerGas": [Function],
                  "difficulty": [Function],
                  "extraData": [Function],
                  "gasLimit": [Function],
                  "gasUsed": [Function],
                  "hash": [Function],
                  "miner": [Function],
                  "nonce": [Function],
                  "number": [Function],
                  "parentHash": [Function],
                  "timestamp": [Function],
                  "transactions": [Function],
                },
                "blockWithTransactions": {
                  "baseFeePerGas": [Function],
                  "difficulty": [Function],
                  "extraData": [Function],
                  "gasLimit": [Function],
                  "gasUsed": [Function],
                  "hash": [Function],
                  "miner": [Function],
                  "nonce": [Function],
                  "number": [Function],
                  "parentHash": [Function],
                  "timestamp": [Function],
                  "transactions": [Function],
                },
                "filter": {
                  "address": [Function],
                  "blockHash": [Function],
                  "fromBlock": [Function],
                  "toBlock": [Function],
                  "topics": [Function],
                },
                "filterLog": {
                  "address": [Function],
                  "blockHash": [Function],
                  "blockNumber": [Function],
                  "data": [Function],
                  "logIndex": [Function],
                  "removed": [Function],
                  "topics": [Function],
                  "transactionHash": [Function],
                  "transactionIndex": [Function],
                },
                "receipt": {
                  "blockHash": [Function],
                  "blockNumber": [Function],
                  "confirmations": [Function],
                  "contractAddress": [Function],
                  "cumulativeGasUsed": [Function],
                  "effectiveGasPrice": [Function],
                  "from": [Function],
                  "gasUsed": [Function],
                  "logs": [Function],
                  "logsBloom": [Function],
                  "root": [Function],
                  "status": [Function],
                  "to": [Function],
                  "transactionHash": [Function],
                  "transactionIndex": [Function],
                  "type": [Function],
                },
                "receiptLog": {
                  "address": [Function],
                  "blockHash": [Function],
                  "blockNumber": [Function],
                  "data": [Function],
                  "logIndex": [Function],
                  "topics": [Function],
                  "transactionHash": [Function],
                  "transactionIndex": [Function],
                },
                "transaction": {
                  "accessList": [Function],
                  "blockHash": [Function],
                  "blockNumber": [Function],
                  "confirmations": [Function],
                  "creates": [Function],
                  "data": [Function],
                  "from": [Function],
                  "gasLimit": [Function],
                  "gasPrice": [Function],
                  "hash": [Function],
                  "maxFeePerGas": [Function],
                  "maxPriorityFeePerGas": [Function],
                  "nonce": [Function],
                  "r": [Function],
                  "raw": [Function],
                  "s": [Function],
                  "to": [Function],
                  "transactionIndex": [Function],
                  "type": [Function],
                  "v": [Function],
                  "value": [Function],
                },
                "transactionRequest": {
                  "accessList": [Function],
                  "data": [Function],
                  "from": [Function],
                  "gasLimit": [Function],
                  "gasPrice": [Function],
                  "maxFeePerGas": [Function],
                  "maxPriorityFeePerGas": [Function],
                  "nonce": [Function],
                  "to": [Function],
                  "type": [Function],
                  "value": [Function],
                },
              },
            },
          },
        }
      `);
    });

    it('throws when not inside Provider', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        const wrapper = ({ children }: { children?: ReactNode }) =>
          createElement('div', { children });
        renderRosetteHook(() => useRosette(), { wrapper });
      } catch (error) {
        expect(error).toMatchInlineSnapshot(
          `[Error: useRosette must be used within RosetteProvider]`,
        );
      }
    });
  });
});
