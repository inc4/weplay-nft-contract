import "@nomiclabs/hardhat-waffle";
import * as dotenv from "dotenv";

dotenv.config();

module.exports = {
  networks: {
    hardhat: {},
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/" + process.env.INFURA_KEY,
      accounts: [process.env.PRIVATEKEY],
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/" + process.env.INFURA_KEY,
      accounts: [process.env.PRIVATEKEY],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
      {
        version: "0.4.24",
      },
    ],
  },
};
