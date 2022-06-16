# @blossom-labs/rosette

## 0.1.3

### Patch Changes

- 98bbdbf: Build fixes
- Updated dependencies [98bbdbf]
  - @blossom-labs/rosette-core@0.1.1
  - @blossom-labs/rosette-radspec@0.1.1

## 0.1.2

### Patch Changes

- 5ee8d3d: Re-export rosette's modules

## 0.1.1

### Patch Changes

- 5b54fa1: Re-export deps

## 0.1.0

### Minor Changes

- bb80687: Library initial implementation

  Implement `Client` component that leverages both `Fetcher` and `radspec` interpreter in order to expose a simplify way to retrieve function descriptions from the Rosette protocol.

  The `Client` expose the following main method:

  - describe(transaction, provider): it returns a function description given a specified transaction object.

### Patch Changes

- Updated dependencies [e62e0ad]
- Updated dependencies [bb80687]
  - @blossom-labs/rosette-core@0.1.0
  - @blossom-labs/rosette-radspec@0.1.0
