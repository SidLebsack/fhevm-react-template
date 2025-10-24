const hre = require("hardhat");
const { createFhevmClient, encryptInput } = require("@fhevm/sdk");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== Privacy Fitness Tracker - SDK Integration Example ===\n");

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found!");
    console.error(`Expected file: ${deploymentFile}`);
    console.error(`\nPlease deploy the contract first with:`);
    console.error(`npx hardhat run scripts/deploy.js --network ${hre.network.name}`);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  console.log("Network:", deploymentInfo.network);
  console.log("Contract Address:", deploymentInfo.contractAddress);

  // Get contract instance
  const [signer] = await hre.ethers.getSigners();
  console.log("Interacting with account:", signer.address);

  const PrivateFitnessTracker = await hre.ethers.getContractFactory("PrivateFitnessTracker");
  const contract = PrivateFitnessTracker.attach(deploymentInfo.contractAddress);

  console.log("\n=== Initializing FHEVM SDK ===");

  try {
    // Initialize FHEVM client
    const client = await createFhevmClient({
      provider: hre.ethers.provider,
      network: hre.network.name === "sepolia" ? "sepolia" : "localhost",
      contractAddress: deploymentInfo.contractAddress,
      signer: signer
    });

    console.log("✓ FHEVM Client initialized");

    // Display contract stats
    await displayContractStats(contract);

    // Example 1: Register as member
    console.log("\n=== Example 1: Register Member ===");
    const memberInfo = await contract.members(signer.address);

    if (!memberInfo.isActive) {
      console.log("Registering as Premium member...");
      const registerTx = await contract.registerMember("Premium");
      const registerReceipt = await registerTx.wait();
      console.log("✓ Member registered successfully!");
      console.log("Transaction hash:", registerReceipt.hash);
      console.log("Gas used:", registerReceipt.gasUsed.toString());
    } else {
      console.log("Already registered as member");
    }

    // Example 2: Record encrypted workout
    console.log("\n=== Example 2: Record Encrypted Workout ===");

    const workoutData = {
      calories: 500,
      duration: 60,
      intensity: 7
    };

    console.log("Encrypting workout data...");
    console.log(`Calories: ${workoutData.calories}`);
    console.log(`Duration: ${workoutData.duration} minutes`);
    console.log(`Intensity: ${workoutData.intensity}/10`);

    // Note: In a real implementation, you would encrypt the data using SDK
    // For this example, we're using plaintext values directly
    // The contract will handle encryption internally using FHE.asEuint*()

    console.log("\nRecording workout on-chain...");
    const workoutTx = await contract.recordWorkout(
      workoutData.calories,
      workoutData.duration,
      workoutData.intensity
    );

    const workoutReceipt = await workoutTx.wait();
    console.log("✓ Workout recorded successfully!");
    console.log("Transaction hash:", workoutReceipt.hash);
    console.log("Gas used:", workoutReceipt.gasUsed.toString());

    // Get updated session count
    const sessionCount = await contract.sessionCount(signer.address);
    console.log("Total workout sessions:", sessionCount.toString());

    // Example 3: Get member information
    console.log("\n=== Example 3: Get Member Information ===");
    const info = await contract.getMemberInfo(signer.address);

    console.log("Member:", signer.address);
    console.log("Active:", info.isActive);
    console.log("Membership Type:", info.membershipType);
    console.log("Join Date:", new Date(Number(info.joinDate) * 1000).toLocaleString());
    console.log("Workout Sessions:", info.sessions.toString());

    // Example 4: Display updated contract stats
    console.log("\n=== Updated Contract Statistics ===");
    await displayContractStats(contract);

    console.log("\n=== SDK Integration Example Complete ===");
    console.log("\n💡 Note: This example demonstrates basic integration.");
    console.log("For full encryption/decryption with SDK, see the Next.js example.");

  } catch (error) {
    console.error("\n❌ Error during interaction:");
    console.error(error.message);

    if (error.message.includes("FHEVM")) {
      console.log("\n💡 Tip: FHEVM SDK requires proper network configuration.");
      console.log("This example uses contract's internal encryption (FHE.asEuint*).");
      console.log("For full SDK encryption, see the Next.js example in examples/nextjs-fitness-tracker/");
    }
  }
}

async function displayContractStats(contract) {
  console.log("\n--- Contract Statistics ---");

  const owner = await contract.owner();
  const totalMembers = await contract.totalMembers();
  const challengeCount = await contract.challengeCount();

  console.log("Owner:", owner);
  console.log("Total Members:", totalMembers.toString());
  console.log("Total Challenges:", challengeCount.toString());
}

// Execute interaction
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });
