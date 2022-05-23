type IPFSEntry = {
  abi: string;
  notice: string;
};

type SubgraphEntry = {
  data: {
    contract: {
      functions: {
        abi: string | null;
        cid: string;
        disputed: boolean;
        notice: string | null;
        id?: string;
        sigHash: string;
      }[];
    };
  };
};

export type ContractFixture = {
  address: string;
};

export type IPFSFixture = Record<string, IPFSEntry>;

export type SubgraphFixture = Record<string, SubgraphEntry>;
