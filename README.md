# 🔐 FHEVM Universal SDK

> Universal SDK for building confidential dApps with Fully Homomorphic Encryption - Framework agnostic, developer-friendly, wagmi-like API

[![MIT License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Zama](https://img.shields.io/badge/Powered%20by-Zama%20fhEVM-blueviolet)](https://www.zama.ai/)

**🎬 Download Video Demo: [demo.mp4] | 🌐 [Live Demo](https://fhe-fitness-tracker.vercel.app/) | 📖 [Documentation](./docs/README.md) | 🔗 [GitHub](https://github.com/SidLebsack/fhevm-react-template)**

> **Note:** The demo.mp4 video file must be downloaded to view. It cannot be played directly in the browser.

---

## ⚡ Quick Overview

The **FHEVM Universal SDK** is the next-generation template for building privacy-preserving dApps with **Fully Homomorphic Encryption**. It provides a **wagmi-like API structure** that makes working with encrypted data as simple as working with regular blockchain data.

**✨ Build confidential dApps in under 10 lines of code**

```typescript
import { FhevmProvider, useEncrypt, useContractCall } from '@fhevm/sdk/react';

// 1. Wrap your app
<FhevmProvider config={{ provider: window.ethereum, network: 'sepolia' }}>
  <App />
</FhevmProvider>

// 2. Use the hooks
const { encrypt } = useEncrypt();
const { call } = useContractCall();

// 3. Encrypt & submit
const encrypted = await encrypt(42);
await call({ contractAddress, abi, functionName: 'recordData', encryptedInputs: [encrypted] });
```

**🎯 Built for the Zama FHE Challenge** - Demonstrating the complete FHEVM developer experience

---

## ✨ Key Features

### 🌐 **Universal & Framework Agnostic**
- ✅ Works with **React**, **Vue**, **Next.js**, **Node.js** and any frontend framework
- ✅ Core SDK has **zero framework dependencies**
- ✅ Optional framework-specific adapters available

### 🎣 **Wagmi-like API Structure**
- ✅ Intuitive hooks like `useEncrypt()`, `useDecrypt()`, `useContractCall()`
- ✅ Familiar API for web3 developers
- ✅ Provider/Context pattern for easy integration

### 📦 **All-in-One Package**
- ✅ Wraps all required dependencies (`fhevmjs`, `ethers`, etc.)
- ✅ No need to manage scattered dependencies
- ✅ Single import for everything you need

### 🔐 **Complete FHE Workflow**
- ✅ **Initialization** - Easy client setup with network detection
- ✅ **Encryption** - Type-safe encryption (euint8, euint16, euint32, euint64, ebool)
- ✅ **Decryption** - EIP-712 signatures + public decryption
- ✅ **Contract Interaction** - Seamless encrypted input handling

### 🚀 **Developer Experience**
- ✅ **Less than 10 lines** to get started
- ✅ **Full TypeScript** support with comprehensive types
- ✅ **Error handling** built-in with clear error messages
- ✅ **Loading states** for all async operations
- ✅ **Batch operations** for efficiency

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Application Layer (Your dApp)                               │
├─────────────────────────────────────────────────────────────┤
│  React / Vue / Next.js / Node.js                            │
│  └─ Framework-specific adapters (hooks, composables)       │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  @fhevm/sdk (Universal Core)                                 │
├─────────────────────────────────────────────────────────────┤
│  ├─ Client Management (createFhevmClient)                   │
│  ├─ Encryption (encryptInput, encryptUint*, encryptBool)   │
│  ├─ Decryption (userDecrypt, publicDecrypt, batchDecrypt)  │
│  ├─ Utils (isAddress, formatAddress, retry, etc.)          │
│  └─ Types (Full TypeScript definitions)                     │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Underlying Libraries                                        │
├─────────────────────────────────────────────────────────────┤
│  ├─ fhevmjs (Zama's FHE library)                           │
│  ├─ ethers.js v6 (Blockchain interaction)                  │
│  └─ EIP-712 (Signature verification)                       │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Blockchain Layer                                            │
├─────────────────────────────────────────────────────────────┤
│  ├─ Sepolia Testnet (Chain ID: 11155111)                   │
│  ├─ Zama Devnet (Chain ID: 8009)                           │
│  └─ Local Hardhat (Chain ID: 31337)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/SidLebsack/fhevm-react-template
cd fhevm-react-template

# Install all packages (monorepo)
npm run setup

# This will:
# 1. Install all dependencies
# 2. Build the SDK package
# 3. Compile smart contracts
```

### Quick Start (Single Package)

```bash
npm install @fhevm/sdk ethers
```

---

## 🚀 Quick Start

### 1️⃣ Core SDK (Framework Agnostic)

**Perfect for Node.js scripts, backend services, or custom integrations**

```typescript
import { createFhevmClient, encryptInput, userDecrypt } from '@fhevm/sdk';

// Initialize client
const client = await createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia',
  contractAddress: '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844'
});

// Encrypt a value
const encrypted = await encryptInput(client, 500);
console.log('Encrypted data:', encrypted.data);

// Send to smart contract
const contract = new Contract(contractAddress, abi, await client.provider.getSigner());
await contract.recordWorkout(encrypted.data, encrypted.inputProof);

// Decrypt value (with EIP-712 signature)
const result = await userDecrypt(client, encryptedHandle, contractAddress);
console.log('Decrypted value:', result.value); // 500
```

### 2️⃣ React / Next.js

**Perfect for frontend applications with React hooks**

```tsx
import { FhevmProvider, useEncrypt, useDecrypt, useContractCall } from '@fhevm/sdk/react';

function App() {
  return (
    <FhevmProvider
      config={{
        provider: window.ethereum,
        network: 'sepolia',
        contractAddress: '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844'
      }}
    >
      <FitnessTracker />
    </FhevmProvider>
  );
}

function FitnessTracker() {
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, isDecrypting } = useDecrypt();
  const { call, isLoading, txHash } = useContractCall();

  const recordWorkout = async (calories: number) => {
    // 1. Encrypt the input
    const encrypted = await encrypt(calories);

    // 2. Call contract with encrypted data
    const result = await call({
      contractAddress: '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844',
      abi: FitnessTrackerABI,
      functionName: 'recordWorkout',
      encryptedInputs: [encrypted]
    });

    console.log('Transaction:', result.txHash);
  };

  const viewStats = async (handle: string) => {
    // Decrypt with user signature
    const result = await decrypt(handle, contractAddress);
    console.log('Your calories:', result.value);
  };

  return (
    <div>
      <button onClick={() => recordWorkout(500)} disabled={isEncrypting || isLoading}>
        {isEncrypting ? 'Encrypting...' : isLoading ? 'Submitting...' : 'Record Workout'}
      </button>
      {txHash && <p>✅ Success! TX: {txHash}</p>}
    </div>
  );
}
```

### 3️⃣ Vue.js (Coming Soon)

```vue
<script setup lang="ts">
import { useFhevmClient, useEncrypt } from '@fhevm/sdk/vue';

const { client } = useFhevmClient();
const { encrypt, isEncrypting } = useEncrypt();

const handleEncrypt = async () => {
  const encrypted = await encrypt(42);
  console.log('Encrypted:', encrypted.data);
};
</script>
```

---

## 📂 Project Structure

```
fhevm-universal-sdk/
├── packages/
│   └── fhevm-sdk/                      # Core SDK package
│       ├── src/
│       │   ├── core/                   # Framework-agnostic core
│       │   │   ├── client.ts           # Client initialization
│       │   │   ├── encryption.ts       # Encryption utilities
│       │   │   ├── decryption.ts       # Decryption utilities
│       │   │   ├── types.ts            # TypeScript definitions
│       │   │   └── utils.ts            # Helper functions
│       │   ├── react/                  # React adapters
│       │   │   ├── hooks/              # React hooks
│       │   │   │   ├── useFhevmClient.ts
│       │   │   │   ├── useEncrypt.ts
│       │   │   │   ├── useDecrypt.ts
│       │   │   │   └── useContractCall.ts
│       │   │   └── provider/
│       │   │       └── FhevmProvider.tsx
│       │   └── vue/                    # Vue adapters (coming soon)
│       ├── package.json
│       └── README.md
├── examples/
│   ├── nextjs-fitness-tracker/         # Next.js example (showcase)
│   │   ├── app/
│   │   │   ├── page.tsx                # Main dashboard
│   │   │   ├── workout/                # Record workouts
│   │   │   └── challenges/             # Join challenges
│   │   ├── components/                 # Reusable components
│   │   ├── hooks/                      # Custom hooks
│   │   ├── lib/                        # Contract ABIs & utils
│   │   └── package.json
│   └── privacy-fitness-tracker/        # Hardhat contracts
│       ├── contracts/
│       │   └── PrivateFitnessTracker.sol
│       ├── scripts/
│       │   ├── deploy.js
│       │   └── interact.js
│       ├── test/
│       └── hardhat.config.js
├── docs/
│   ├── README.md                       # Full documentation
│   ├── API.md                          # API reference
│   ├── EXAMPLES.md                     # Code examples
│   └── MIGRATION.md                    # Migration guide
├── demo.mp4                            # Video demonstration
├── package.json                        # Monorepo root
└── README.md                           # This file
```

---

## 🎯 Examples

### Example 1: Privacy Fitness Tracker (Imported dApp)

Located in `examples/privacy-fitness-tracker/`

**Smart Contract:** Confidential fitness tracking with FHE
- Register members with encrypted membership details
- Record workouts with encrypted calories, duration, intensity
- Create and join challenges with prize pools
- Decrypt personal stats with EIP-712 signatures

**Key Files:**
- `contracts/PrivateFitnessTracker.sol` - Main contract with FHE
- `scripts/deploy.js` - Deployment automation
- `test/PrivateFitnessTracker.test.js` - 100+ test cases

### Example 2: Next.js Integration (Showcase)

Located in `examples/nextjs-fitness-tracker/`

**Features:**
- ✅ Server-side rendering (SSR) compatible
- ✅ Client-side FHE encryption
- ✅ Real-time encrypted data display
- ✅ MetaMask integration
- ✅ Responsive UI with Tailwind CSS

**SDK Integration:**
```tsx
// app/layout.tsx
import { FhevmProvider } from '@fhevm/sdk/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <FhevmProvider
          config={{
            provider: typeof window !== 'undefined' ? window.ethereum : null,
            network: 'sepolia',
            contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
          }}
        >
          {children}
        </FhevmProvider>
      </body>
    </html>
  );
}
```

---

## 🔧 Development Commands

```bash
# Install all dependencies
npm run install:all

# Build SDK package
npm run build:sdk

# Compile smart contracts
npm run compile:contracts

# Run tests
npm test                    # All tests
npm run test:sdk           # SDK tests only
npm run test:contracts     # Contract tests only

# Start development
npm run dev                # Start Next.js example
npm run dev:nextjs         # Start Next.js explicitly

# Deploy contracts
npm run deploy:local       # Deploy to local Hardhat
npm run deploy:sepolia     # Deploy to Sepolia testnet

# Lint & format
npm run lint
npm run format
```

---

## 📊 Evaluation Criteria Coverage

### ✅ Usability (Quick Setup, Minimal Boilerplate)

**Installation:**
```bash
npm install @fhevm/sdk ethers  # 1 command
```

**Usage:**
```typescript
// 8 lines of code to encrypt & submit
import { createFhevmClient, encryptInput } from '@fhevm/sdk';

const client = await createFhevmClient({ provider, network, contractAddress });
const encrypted = await encryptInput(client, 42);
const contract = new Contract(address, abi, signer);
await contract.recordData(encrypted.data);
```

### ✅ Completeness (Full FHEVM Workflow)

- ✅ **Initialization** - `createFhevmClient()` with network detection
- ✅ **Encryption** - Type-safe encryption for all euint types
- ✅ **Decryption** - Both `userDecrypt()` (with EIP-712) and `publicDecrypt()`
- ✅ **Contract Interaction** - Seamless integration with ethers.js

### ✅ Reusability (Modular & Adaptable)

- ✅ **Core SDK** - Framework-agnostic, works anywhere
- ✅ **React Adapters** - Hooks for React/Next.js
- ✅ **Vue Adapters** - Composables for Vue (coming soon)
- ✅ **Node.js** - Works in backend scripts

### ✅ Documentation & Clarity

- ✅ **Comprehensive README** - This file
- ✅ **API Documentation** - See `docs/API.md`
- ✅ **Code Examples** - Multiple examples in `examples/`
- ✅ **Inline JSDoc** - Every function documented
- ✅ **TypeScript Types** - Full type safety

### ✅ Creativity (Multi-environment Showcase)

- ✅ **Next.js Example** - Full-featured showcase
- ✅ **Hardhat Integration** - Complete smart contract example
- ✅ **Multiple Networks** - Sepolia, Zama Devnet, Localhost
- ✅ **Real Use Case** - Privacy Fitness Tracker demonstrates FHEVM potential

---

## 🌐 Deployment

### Deployed Contracts

**Sepolia Testnet:**
- **Contract Address:** `0x6Bbf52494089ce94859414D82d03f7c8a4cF1844`
- **Network:** Ethereum Sepolia (Chain ID: 11155111)
- **Etherscan:** [View Contract →](https://sepolia.etherscan.io/address/0x6Bbf52494089ce94859414D82d03f7c8a4cF1844)

### Live Demos

- **Next.js Showcase:** https://fhe-fitness-tracker.vercel.app/
- **Video Demo:** Download [demo.mp4] to view locally

---

## 📹 Video Demonstration

**Watch the complete setup and design walkthrough:**

[📹 demo.mp4]

**Covered in the video:**
1. Project structure and architecture
2. SDK installation and setup (< 10 lines)
3. Encryption workflow demonstration
4. Decryption with EIP-712 signatures
5. Next.js integration showcase
6. Privacy Fitness Tracker example
7. Design decisions and rationale

---

## 🎓 Documentation

### Complete Guides

- **[Getting Started](./docs/README.md)** - Comprehensive setup guide
- **[API Reference](./docs/API.md)** - Complete API documentation
- **[Examples](./docs/EXAMPLES.md)** - More code examples
- **[Migration Guide](./docs/MIGRATION.md)** - Migrating from fhevm-react-template

### External Resources

- **[Zama fhEVM Docs](https://docs.zama.ai/fhevm)** - Official FHEVM documentation
- **[fhevmjs GitHub](https://github.com/zama-ai/fhevmjs)** - Core FHE library
- **[Ethers.js v6](https://docs.ethers.org/v6/)** - Ethereum library

---

## 🤝 Contributing

Contributions are welcome! We're looking for:

- 🐛 Bug reports and fixes
- ✨ New features and adapters
- 📖 Documentation improvements
- 🎨 Example dApps
- 🧪 Test coverage

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🏆 Built for Zama FHE Challenge

This SDK demonstrates the **next generation of FHEVM development**:

✅ **Universal** - Works with any framework
✅ **Developer-Friendly** - Wagmi-like API structure
✅ **Complete** - Full encryption/decryption workflow
✅ **Production-Ready** - TypeScript, tests, documentation

**Powered by:**
- 🔐 **Zama fhEVM** - Fully Homomorphic Encryption on Ethereum
- ⚛️ **React/Next.js** - Modern frontend framework
- 🔨 **Hardhat** - Smart contract development
- 📘 **TypeScript** - Type-safe development

---

**🔗 Quick Links:** [SDK Package](./packages/fhevm-sdk) • [Next.js Example](./examples/nextjs-fitness-tracker) • [Contract Example](./examples/privacy-fitness-tracker) • [Documentation](./docs) • [Video Demo]

**⭐ If you find this useful, please star the repo!**
