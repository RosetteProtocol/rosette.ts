export type GraphQLBody = {
  query: string;
  variables: Record<string, any>;
};

export const CONTRACT_FUNCTION_ENTRIES = (
  contractId: string,
  allowDisputed: boolean,
): GraphQLBody => ({
  query: `
    query Contract($contractId: String!, $allowDisputed: Boolean!) {
      contract(id: $contractId) {
        functions(where: { disputed: $allowDisputed }) {
          abi
          notice
          cid
          disputed
          id,
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
    query FunctionEntry($entryId: String!, $allowDisputed: Boolean!) {
      function(id: $entryId, where: { disputed: $allowDisputed }) {
        abi
        notice
        cid
        disputed
        id,
        sigHash
      }
    }
  `,
  variables: {
    entryId,
    allowDisputed,
  },
});

// query FunctionEntries($entryIds: [String!]!, $allowDisputed: Boolean!) { functions(where: { id_in: $entryIds, disputed: $allowDisputed }) { abi,notice,cid,disputed,sigHash } }
export const FUNCTION_ENTRIES = (
  entryIds: string[],
  allowDisputed: boolean,
): GraphQLBody => ({
  query: `
    query FunctionEntries($entryIds: [String!]!, $allowDisputed: Boolean!) {
      functions(where: { id_in: $entryIds, disputed: $allowDisputed }) {
        abi,
        notice,
        cid,
        disputed,
        id,
        sigHash
      }
    }
  `,
  variables: {
    entryIds,
    allowDisputed,
  },
});
