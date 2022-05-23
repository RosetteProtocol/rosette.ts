export const getSigHash = (txData: string): string => {
  return txData.substring(0, 10);
};
