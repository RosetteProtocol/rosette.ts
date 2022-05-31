# @blossom-labs/rosette

## 0.1.1

### Patch Changes

- e4d0305: feat(radspec): refactor date-fns to use dayjs
- Updated dependencies [e4d0305]
  - @blossom-labs/rosette-core@0.1.1
  - @blossom-labs/rosette-radspec@0.1.1

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
