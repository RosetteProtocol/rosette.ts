export type GraphQLBody = {
  query: string;
  variables: Record<string, any>;
};

export const CONTRACT_FUNCTION_ENTRIES = (
  contractId: string,
  allowDisputed: boolean,
): GraphQLBody => ({
  query: `
    query Contract($contractId: String!) {
      contract(id: $contractId) {
        functions {
          abi
          notice
          cid,
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

export const FUNCTION = (
  entryId: string,
  allowDisputed: boolean,
): GraphQLBody => ({
  query: `
    query Function($entryId: String!) {
      function(id: $entryId) {
        abi
        notice
        cid,
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

export const FUNCTIONS = (
  entryIds: string[],
  allowDisputed: boolean,
): GraphQLBody => ({
  query: `
    query Functions($entryIds: [String!]!) {
      functions(where: { id_in: $entryIds }) {
        abi,
        notice,
        cid,
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
