---
'@blossom-labs/rosette': minor
---

Library initial implementation

Implement `Client` component that leverages both `Fetcher` and `radspec` interpreter in order to expose a simplify way to retrieve function descriptions from the Rosette protocol.

The `Client` expose the following main method:

- describe(transaction, provider): it returns a function description given a specified transaction object.
