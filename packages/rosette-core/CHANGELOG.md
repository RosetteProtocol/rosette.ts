# @blossom-labs/rosette-core

## 0.1.5

### Patch Changes

- 444ac8e: Generalize `radspec` library

## 0.1.4

### Patch Changes

- 0722748: Expose additional entry data (status, submitter, upsert date)

## 0.1.3

### Patch Changes

- 525ac9d: Update libraries to work with Rosette's contracts on goerli network

## 0.1.2

### Patch Changes

- 98bbdbf: Build fixes

## 0.1.0

### Minor Changes

- e62e0ad: Library initial implementation

  Implement communication functionality to interact with the Rosette protocol via a `Fetcher` component that retrieves contract functions' descriptions

  The `Fetcher` component expose the following methods:

  - `entry(contractAddress, sigHash, provider)`: it returns the function description entry of the specified signature hash and contract address.
  - `entries(contractsToSigHashes, provider, options)`: it returns a set of function description entries given a specified set of contract addresses and signature hashes.
  - `contractEntries(contractAddress, provider)`: it returns all the existing function description entries of a specified contract.
