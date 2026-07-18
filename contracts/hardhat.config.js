require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env" });

// Monad testnet values below are current as of this writing -- confirm
// against https://docs.monad.xyz before deploying if they've changed.
const MONAD_TESTNET_RPC_URL = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";
const MONAD_TESTNET_CHAIN_ID = Number(process.env.MONAD_CHAIN_ID || 10143);
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    monadTestnet: {
      url: MONAD_TESTNET_RPC_URL,
      chainId: MONAD_TESTNET_CHAIN_ID,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
