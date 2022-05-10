export interface SolidityType {
  isType(identifier: string): boolean;
  size?(identifier: string): number;
}

export const getTypeRange = (
  rangedType: string,
  rangeStartPosition = 5,
): number => Number(rangedType.substring(rangeStartPosition));
