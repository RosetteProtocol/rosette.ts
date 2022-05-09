import type { FnEntry } from '../../types';

const _parseFunctionEntry = ({
  abi,
  cid,
  disputed,
  notice,
  sigHash,
}: any): FnEntry => ({
  abi,
  cid,
  disputed,
  notice,
  sigHash,
});

export const parseFunctionEntry = (data: any): FnEntry | null => {
  if (!data.function) {
    return null;
  }

  return _parseFunctionEntry(data.function);
};

export const parseEntries = (data: any): FnEntry[] => {
  const contract = data.contract;

  if (!contract) {
    return [];
  }

  return contract.functions.map((f: any) => _parseFunctionEntry(f));
};
