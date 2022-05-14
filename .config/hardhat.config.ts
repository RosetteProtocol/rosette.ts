import { HardhatUserConfig } from 'hardhat/config';
import 'dotenv/config';

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: process.env.ARCHIVE_NODE!,
        blockNumber: 10672190,
      },
      loggingEnabled: false,
    },
  },
};

export default config;
