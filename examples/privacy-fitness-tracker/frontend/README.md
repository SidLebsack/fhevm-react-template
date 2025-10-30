# Privacy Fitness Tracker - React Frontend

> Modern React frontend for the Privacy Fitness Club with FHEVM SDK Integration

## Overview

This is the React-based frontend for the Privacy Fitness Tracker smart contract, built with:
- **React 18** with TypeScript
- **Vite** for fast development and building
- **@fhevm/sdk** for FHE encryption operations
- **ethers.js v6** for blockchain interactions

## Features

### Core Components

1. **WalletConnect** - MetaMask wallet connection and management
2. **MemberRegistration** - Register as a member with different membership tiers
3. **WorkoutTracker** - Record workouts with encrypted data
4. **ChallengeManager** - Create, join, and view fitness challenges
5. **ContractStats** - View contract statistics and information

### SDK Integration

All components integrate the `@fhevm/sdk` for:
- FHE encryption of sensitive workout data
- Decryption with EIP-712 signatures
- Type-safe contract interactions
- React hooks for easy state management

## Quick Start

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Connected to Sepolia testnet

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3001`

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components
│   │   ├── WalletConnect.tsx
│   │   ├── MemberRegistration.tsx
│   │   ├── WorkoutTracker.tsx
│   │   ├── ChallengeManager.tsx
│   │   └── ContractStats.tsx
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Usage

### 1. Connect Wallet

Click "Connect Wallet" to connect your MetaMask wallet. Make sure you're on Sepolia testnet.

### 2. Register as Member

Choose a membership type (Basic, Premium, Elite, or Corporate) and register.

### 3. Record Workouts

Log your workouts with:
- Calories burned
- Duration in minutes
- Intensity level (1-10)

### 4. Join Challenges

Create new fitness challenges with prize pools or join existing ones.

### 5. View Statistics

Check contract statistics including total members and active challenges.

## Smart Contract

The frontend connects to the Privacy Fitness Tracker smart contract deployed at:
- **Sepolia Testnet**: `0x6Bbf52494089ce94859414D82d03f7c8a4cF1844`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint source files

### Environment Variables

Create a `.env` file (optional):

```env
VITE_CONTRACT_ADDRESS=0x6Bbf52494089ce94859414D82d03f7c8a4cF1844
VITE_NETWORK=sepolia
```

## Integration with @fhevm/sdk

Example usage in components:

```tsx
import { FhevmProvider, useEncrypt, useDecrypt } from '@fhevm/sdk/react';

// Wrap your app
<FhevmProvider config={{ network: 'sepolia', contractAddress }}>
  <App />
</FhevmProvider>

// Use hooks in components
const { encrypt, isEncrypting } = useEncrypt();
const encrypted = await encrypt(sensitiveData);
```

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **@fhevm/sdk** - FHE encryption SDK
- **ethers.js v6** - Ethereum library

## License

MIT
