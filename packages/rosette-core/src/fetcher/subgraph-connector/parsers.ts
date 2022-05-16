import type { FnEntry } from '../../types';

const _parseFunctionEntry = ({
  abi,
  cid,
  disputed,
  id,
  notice,
  sigHash,
}: any): FnEntry => ({
  abi,
  cid,
  disputed,
  id,
  notice,
  sigHash,
});

export const parseFunctionEntry = (data: any): FnEntry | null => {
  if (!data.function) {
    return null;
  }

  return _parseFunctionEntry(data.function);
};

export const parseFunctionEntries = (data: any): FnEntry[] => {
  const functions = data.functions;

  if (!functions.length) {
    return [];
  }

  return functions.map((f: any) => _parseFunctionEntry(f));
};

export const parseContract = (data: any): FnEntry[] => {
  const contract = data.contract;

  if (!contract) {
    return [];
  }

  return contract.functions.map((f: any) => _parseFunctionEntry(f));
};
