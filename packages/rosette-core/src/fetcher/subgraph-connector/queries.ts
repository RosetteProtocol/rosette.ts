const gql = String.raw;

export const CONTRACT_FUNCTION_ENTRIES = (
  contractId: string,
  allowDisputed: boolean,
): string => gql`
  {
    contract(id: "${contractId}") {
      functions(where: { disputed: ${allowDisputed ? 'true' : 'false'} }) {
        abi
        notice
        cid
        disputed
        sigHash
      }
    }
  }
`;

export const FUNCTION_ENTRY = (entryId: string, allowDisputed: boolean) => gql`
  {
    function(id: "${entryId}", where: { disputed: ${
  allowDisputed ? 'true' : 'false'
} }) {
      abi
      notice
      cid
      disputed
      sigHash
    }
  }
`;
