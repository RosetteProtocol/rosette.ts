export const buildEntryId = (bytecodeHash: string, sigHash: string): string =>
  `${bytecodeHash}-${sigHash}`;

export const parseEntryId = (entryId: string): string[] => entryId.split('-');
