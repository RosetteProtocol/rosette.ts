# @blossom-labs/rosette-core

## 0.1.1

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
