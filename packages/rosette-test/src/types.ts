type IPFSEntry = {
  abi: string;
  notice: string;
};

type SubgraphEntry = {
  data: {
    contract: {
      functions: {
        id: string;
        abi: string | null;
        cid: string;
        disputed: boolean;
        notice: string | null;
        sigHash: string;
      }[];
    };
  };
};

export type ContractFixture = {
  address: string;
  bytecode: string;
};

export type IPFSFixture = Record<string, IPFSEntry>;

export type SubgraphFixture = Record<string, SubgraphEntry>;
