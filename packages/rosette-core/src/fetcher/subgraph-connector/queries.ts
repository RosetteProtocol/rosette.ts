export type GraphQLBody = {
  query: string;
  variables: Record<string, any>;
};

const FUNCTION_FRAGMENT = `
  abi
  cid
  contract
  id
  notice
  sigHash
  submitter
  upsertAt
`;

export const CONTRACT_FUNCTIONS = (
  contractId: string,
  allowDisputed: boolean,
): GraphQLBody => ({
  query: `
    query Contract($contractId: String!) {
      contract(id: $contractId) {
        functions {
          ${FUNCTION_FRAGMENT}
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
        ${FUNCTION_FRAGMENT}
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
        ${FUNCTION_FRAGMENT}
      }
    }
  `,
  variables: {
    entryIds,
    allowDisputed,
  },
});
