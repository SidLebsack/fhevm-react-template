require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

// Custom Hardhat Tasks
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  console.log("\n=== Available Accounts ===");
  for (const account of accounts) {
    const balance = await hre.ethers.provider.getBalance(account.address);
    console.log(`${account.address} - Balance: ${hre.ethers.formatEther(balance)} ETH`);
  }
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, hre) => {
    const balance = await hre.ethers.provider.getBalance(taskArgs.account);
    console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);
  });

task("contract-info", "Get deployed contract information")
  .addParam("address", "The contract address")
  .setAction(async (taskArgs, hre) => {
    const PrivateFitnessTracker = await hre.ethers.getContractFactory("PrivateFitnessTracker");
    const contract = PrivateFitnessTracker.attach(taskArgs.address);

    console.log("\n=== Contract Information ===");
    console.log(`Address: ${taskArgs.address}`);
    console.log(`Owner: ${await contract.owner()}`);
    console.log(`Total Members: ${await contract.totalMembers()}`);
    console.log(`Challenge Count: ${await contract.challengeCount()}`);
  });

task("register-member", "Register a new fitness club member")
  .addParam("contract", "The contract address")
  .addParam("type", "Membership type (Basic, Premium, Elite, Corporate)")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const PrivateFitnessTracker = await hre.ethers.getContractFactory("PrivateFitnessTracker");
    const contract = PrivateFitnessTracker.attach(taskArgs.contract);

    console.log(`\nRegistering member with ${taskArgs.type} membership...`);
    const tx = await contract.registerMember(taskArgs.type);
    const receipt = await tx.wait();

    console.log(`✓ Member registered successfully!`);
    console.log(`Transaction hash: ${receipt.hash}`);
  });

task("record-workout", "Record a workout session")
  .addParam("contract", "The contract address")
  .addParam("calories", "Calories burned")
  .addParam("duration", "Duration in minutes")
  .addParam("intensity", "Intensity level (1-10)")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const PrivateFitnessTracker = await hre.ethers.getContractFactory("PrivateFitnessTracker");
    const contract = PrivateFitnessTracker.attach(taskArgs.contract);

    console.log(`\nRecording workout...`);
    console.log(`Calories: ${taskArgs.calories}, Duration: ${taskArgs.duration}min, Intensity: ${taskArgs.intensity}/10`);

    const tx = await contract.recordWorkout(
      taskArgs.calories,
      taskArgs.duration,
      taskArgs.intensity
    );
    const receipt = await tx.wait();

    console.log(`✓ Workout recorded successfully!`);
    console.log(`Transaction hash: ${receipt.hash}`);
  });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },

  networks: {
    // Local development network
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true
    },

    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },

    // Ethereum Sepolia testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto",
      gas: "auto"
    },

    // Zama fhEVM devnet
    zamaDevnet: {
      url: process.env.ZAMA_RPC_URL || "https://devnet.zama.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8009,
      gasPrice: "auto"
    }
  },

  // Etherscan verification
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    }
  },

  // Path configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },

  // Mocha test configuration
  mocha: {
    timeout: 40000
  }
};
