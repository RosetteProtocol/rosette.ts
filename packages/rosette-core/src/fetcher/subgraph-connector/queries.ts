export type GraphQLBody = {
  query: string;
  variables: Record<string, any>;
};

export const CONTRACT_FUNCTION_ENTRIES = (
  contractId: string,
  allowDisputed: boolean,
): GraphQLBody => ({
  query: `
  {
    contract(id: $contractId) {
      functions(where: { disputed: $allowDisputed }) {
        abi
        notice
        cid
        disputed
        sigHash
      }
    }
  }
`,
  variables: {
    contractId,
    allowDisputed,
  },
});

export const FUNCTION_ENTRY = (
  entryId: string,
  allowDisputed: boolean,
): GraphQLBody => ({
  query: `
  {
    function(id: $entryId, where: { disputed: $allowDisputed }) {
      abi
      notice
      cid
      disputed
      sigHash
    }
  }
`,
  variables: {
    entryId,
    allowDisputed,
  },
});
