import { HardhatUserConfig } from 'hardhat/config';
import 'dotenv/config';

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: process.env.ARCHIVE_NODE_ENDPOINT!,
        blockNumber: 7248260,
      },
      loggingEnabled: false,
    },
  },
};

export default config;
