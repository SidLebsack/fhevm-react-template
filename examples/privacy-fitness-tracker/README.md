# Privacy Fitness Tracker - Smart Contract Example

Complete smart contract implementation demonstrating FHEVM encryption with the Privacy Fitness Tracker dApp.

---

## Overview

This example showcases:
- ✅ **FHE-Enabled Smart Contract** - Fully homomorphic encryption for sensitive fitness data
- ✅ **SDK Integration** - Demonstrates @fhevm/sdk usage in Node.js scripts
- ✅ **Complete Deployment** - Automated deployment and verification
- ✅ **Interactive Scripts** - Contract interaction examples

---

## Features

### Smart Contract Features

**Privacy-Preserving Operations:**
- 🔐 Encrypted workout tracking (calories, duration, intensity)
- 🔐 Encrypted member statistics (total calories, sessions, streaks)
- 🔐 Encrypted fitness challenges with encrypted progress
- 🔐 Encrypted fitness level tracking

**Member Management:**
- Member registration with membership types
- Workout session recording
- Progress tracking (weekly/monthly)
- Fitness level updates

**Challenge System:**
- Create fitness challenges with prizes
- Join challenges
- Track challenge progress (encrypted)
- Winner selection

### Security Features

- **Access Control** - Owner and member modifiers
- **Input Validation** - All inputs validated before processing
- **ACL Permissions** - Proper FHE permissions for encrypted data
- **Emergency Functions** - Fund withdrawal and ownership transfer

---

## Installation

```bash
# From the privacy-fitness-tracker directory
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Environment Variables

```bash
# .env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

---

## Usage

### 1. Compile Contracts

```bash
npm run compile
```

### 2. Run Tests

```bash
npm test
```

### 3. Deploy Contract

**Local Network:**
```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy to local network
npm run deploy:local
```

**Sepolia Testnet:**
```bash
npm run deploy
```

### 4. Interact with Contract

```bash
# Run interactive script (with SDK integration)
npm run interact
```

The interact script demonstrates:
- Initializing FHEVM SDK
- Registering as a member
- Recording encrypted workouts
- Getting member information
- Contract statistics

### 5. Custom Interactions

**Using Hardhat Tasks:**

```bash
# Get contract info
npx hardhat contract-info --address 0x... --network sepolia

# Register member
npx hardhat register-member --contract 0x... --type Premium --network sepolia

# Record workout
npx hardhat record-workout \
  --contract 0x... \
  --calories 500 \
  --duration 60 \
  --intensity 7 \
  --network sepolia

# Get account balances
npx hardhat accounts --network sepolia

# Check balance
npx hardhat balance --account 0x... --network sepolia
```

---

## Contract Architecture

### Data Structures

**Member:**
```solidity
struct Member {
    address memberAddress;
    euint32 totalCaloriesBurned;      // Encrypted
    euint16 totalWorkoutSessions;     // Encrypted
    euint16 currentStreak;            // Encrypted
    euint8 fitnessLevel;              // Encrypted (1-10)
    bool isActive;
    uint256 joinDate;
    string membershipType;
}
```

**WorkoutSession:**
```solidity
struct WorkoutSession {
    euint32 caloriesBurned;    // Encrypted
    euint16 durationMinutes;   // Encrypted
    euint8 intensityLevel;     // Encrypted (1-10)
    uint256 timestamp;
    bool completed;
}
```

**FitnessChallenge:**
```solidity
struct FitnessChallenge {
    string challengeName;
    euint32 targetCalories;    // Encrypted target
    euint16 durationDays;      // Encrypted
    uint256 startTime;
    uint256 endTime;
    uint256 prize;
    bool isActive;
    address[] participants;
    address winner;
}
```

### Key Functions

**Member Operations:**
- `registerMember(string membershipType)` - Register new member
- `recordWorkout(uint32 calories, uint16 duration, uint8 intensity)` - Record workout
- `updateFitnessLevel(uint8 newLevel)` - Update fitness level
- `getMemberInfo(address member)` - Get member information

**Challenge Operations:**
- `createChallenge(string name, uint32 target, uint16 days)` - Create challenge (owner)
- `joinChallenge(uint256 challengeId)` - Join a challenge
- `updateChallengeProgress(uint256 challengeId, uint32 calories)` - Update progress
- `completeChallenge(uint256 challengeId)` - Complete and find winner (owner)

**View Functions:**
- `getChallengeInfo(uint256 challengeId)` - Get challenge details
- `getWorkoutSession(address member, uint256 sessionId)` - Get session info
- `getCurrentWeek()` - Get current week number
- `getCurrentMonth()` - Get current month number

---

## SDK Integration Example

The `scripts/interact.js` file demonstrates SDK integration:

```javascript
const { createFhevmClient, encryptInput } = require("@fhevm/sdk");

// Initialize client
const client = await createFhevmClient({
  provider: hre.ethers.provider,
  network: "sepolia",
  contractAddress: deploymentInfo.contractAddress,
  signer: signer
});

// Encrypt data (for advanced usage)
const encrypted = await encryptInput(client, 500);

// Call contract
await contract.recordWorkout(500, 60, 7);
```

**Note:** This example uses contract's internal encryption (`FHE.asEuint*()`) for simplicity. For full client-side encryption with SDK, see the Next.js example in `examples/nextjs-fitness-tracker/`.

---

## Deployment Information

**Sepolia Testnet:**
- Contract Address: `0x6Bbf52494089ce94859414D82d03f7c8a4cF1844`
- Etherscan: https://sepolia.etherscan.io/address/0x6Bbf52494089ce94859414D82d03f7c8a4cF1844
- Network: Sepolia
- Chain ID: 11155111

**After deployment:**
- Deployment details saved to `deployments/{network}.json`
- Contains contract address, transaction hash, gas used, etc.

---

## Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- Member registration
- Workout recording
- Challenge creation and joining
- Access control
- Edge cases and validation

---

## Gas Optimization

Contract is optimized for gas efficiency:
- **Optimizer Runs:** 200
- **Via-IR:** Enabled
- **Estimated Deployment:** ~3-5M gas
- **Workout Recording:** ~200-300k gas
- **Member Registration:** ~150-250k gas

---

## Security Considerations

**Access Control:**
- Owner-only functions protected with `onlyOwner` modifier
- Member-only functions protected with `onlyMember` modifier
- Challenge validation with `validChallenge` modifier

**Input Validation:**
- All numeric inputs validated for valid ranges
- String inputs checked for non-empty values
- Challenge participation checked for duplicates

**FHE Permissions:**
- All encrypted values have proper ACL permissions
- Contract and user permissions set correctly
- Encrypted data protected from unauthorized access

---

## Project Structure

```
privacy-fitness-tracker/
├── contracts/
│   └── PrivateFitnessTracker.sol    # Main contract
├── scripts/
│   ├── deploy.js                     # Deployment script
│   └── interact.js                   # SDK integration example
├── test/                             # Test files
├── deployments/                      # Deployment info (auto-generated)
├── hardhat.config.js                 # Hardhat configuration
├── package.json                      # Dependencies
├── .env.example                      # Environment template
└── README.md                         # This file
```

---

## Related Examples

- **Next.js Integration:** See `examples/nextjs-fitness-tracker/` for full frontend integration
- **SDK Documentation:** See `packages/fhevm-sdk/README.md` for SDK usage
- **Main README:** See root `README.md` for project overview

---

## Troubleshooting

**Issue: Deployment fails with "insufficient funds"**
```bash
# Get Sepolia ETH from faucet
https://sepoliafaucet.com/
```

**Issue: Contract verification fails**
```bash
# Ensure ETHERSCAN_API_KEY is set in .env
# Verify manually:
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

**Issue: SDK initialization fails**
```bash
# This example uses contract's internal encryption
# For full SDK encryption, see Next.js example
```

---

## License

MIT License - See LICENSE file for details.

---

## Links

- **Main Project:** [fhevm-react-template](https://github.com/SidLebsack/fhevm-react-template)
- **Live Demo:** https://fhe-fitness-tracker.vercel.app/
- **Zama fhEVM Docs:** https://docs.zama.ai/fhevm
- **Hardhat Docs:** https://hardhat.org/docs

---

**Built for the Zama FHE Challenge** 🎯
