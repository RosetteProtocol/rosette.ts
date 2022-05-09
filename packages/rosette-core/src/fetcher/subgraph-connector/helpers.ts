export const buildEntryId = (bytecodeHash: string, sigHash: string): string =>
  `${bytecodeHash}-${sigHash}`;
