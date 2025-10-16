# 📚 Code Examples

Complete code examples for integrating the FHEVM Universal SDK into your applications.

---

## Table of Contents

- [Next.js Integration](#nextjs-integration)
- [React Integration](#react-integration)
- [Node.js Scripts](#nodejs-scripts)
- [Vue Integration](#vue-integration)
- [Real-World Use Cases](#real-world-use-cases)
- [Advanced Patterns](#advanced-patterns)

---

## Next.js Integration

### Complete Next.js App Setup

#### 1. Install Dependencies

```bash
npm install @fhevm/sdk ethers
```

#### 2. Create Provider Layout

**`app/layout.tsx`**

```tsx
'use client';

import { FhevmProvider } from '@fhevm/sdk/react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FhevmProvider
          config={{
            provider: typeof window !== 'undefined' ? window.ethereum : null,
            network: 'sepolia',
            contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          }}
          options={{
            debug: process.env.NODE_ENV === 'development',
            cache: true,
          }}
        >
          {children}
        </FhevmProvider>
      </body>
    </html>
  );
}
```

#### 3. Create Main Page Component

**`app/page.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useFhevmClient, useEncrypt, useDecrypt, useContractCall } from '@fhevm/sdk/react';
import { Contract } from 'ethers';
import FitnessTrackerABI from '@/lib/FitnessTrackerABI.json';

export default function Home() {
  const { client, isLoading, error, isReady } = useFhevmClient();
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, isDecrypting } = useDecrypt();
  const { call, isLoading: callLoading, txHash } = useContractCall();

  const [calories, setCalories] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('');
  const [account, setAccount] = useState<string | null>(null);

  // Connect wallet
  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
      }
    };
    connectWallet();
  }, []);

  // Handle workout recording
  const handleRecordWorkout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isReady || !client || !account) {
      alert('Client not ready or wallet not connected');
      return;
    }

    try {
      // Encrypt workout data
      const encryptedCalories = await encrypt(Number(calories), {
        generateProof: true,
        userAddress: account,
      });

      if (!encryptedCalories) {
        throw new Error('Encryption failed');
      }

      // Call contract to record workout
      const result = await call({
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        abi: FitnessTrackerABI,
        functionName: 'recordWorkout',
        encryptedInputs: [encryptedCalories],
      });

      if (result) {
        alert(`✅ Workout recorded! Transaction: ${result.txHash}`);
        setCalories('');
        setDuration('');
        setIntensity('');
      }
    } catch (err) {
      console.error('Error recording workout:', err);
      alert('Failed to record workout');
    }
  };

  // Handle decryption
  const handleDecryptStats = async () => {
    if (!isReady || !client || !account) {
      alert('Client not ready or wallet not connected');
      return;
    }

    try {
      // Get encrypted handle from contract
      const contract = new Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        FitnessTrackerABI,
        client.signer
      );
      const encryptedHandle = await contract.getTotalCalories(account);

      // Decrypt the value
      const result = await decrypt(
        encryptedHandle,
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
      );

      if (result && result.success) {
        alert(`Total Calories: ${result.value}`);
      }
    } catch (err) {
      console.error('Error decrypting stats:', err);
      alert('Failed to decrypt stats');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading FHEVM Client...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-2">Privacy Fitness Tracker</h1>
      <p className="text-gray-600 mb-8">
        Track your workouts with fully encrypted data on-chain
      </p>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Client Status</div>
          <div className={`text-lg font-bold ${isReady ? 'text-green-600' : 'text-yellow-600'}`}>
            {isReady ? '✅ Ready' : '⏳ Initializing'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Wallet</div>
          <div className="text-lg font-bold">
            {account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Not Connected'}
          </div>
        </div>
      </div>

      {/* Record Workout Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-2xl font-bold mb-4">Record Workout</h2>
        <form onSubmit={handleRecordWorkout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Calories Burned
            </label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., 500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., 60"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Intensity (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., 7"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!isReady || isEncrypting || callLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isEncrypting || callLoading ? 'Recording...' : 'Record Workout'}
          </button>
        </form>
        {txHash && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="text-sm text-green-800">
              ✅ Transaction: {txHash.substring(0, 10)}...
            </div>
          </div>
        )}
      </div>

      {/* Decrypt Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">View Stats</h2>
        <button
          onClick={handleDecryptStats}
          disabled={!isReady || isDecrypting}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
        >
          {isDecrypting ? 'Decrypting...' : 'Decrypt Total Calories'}
        </button>
      </div>
    </main>
  );
}
```

#### 4. Environment Variables

**`.env.local`**

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x6Bbf52494089ce94859414D82d03f7c8a4cF1844
NEXT_PUBLIC_NETWORK=sepolia
```

---

## React Integration

### Standalone React App

#### 1. Setup Provider

**`src/App.tsx`**

```tsx
import { FhevmProvider } from '@fhevm/sdk/react';
import WorkoutTracker from './components/WorkoutTracker';

function App() {
  return (
    <FhevmProvider
      config={{
        provider: window.ethereum,
        network: 'sepolia',
        contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
      }}
    >
      <WorkoutTracker />
    </FhevmProvider>
  );
}

export default App;
```

#### 2. Create Component

**`src/components/WorkoutTracker.tsx`**

```tsx
import { useState } from 'react';
import { useEncrypt, useContractCall } from '@fhevm/sdk/react';
import ContractABI from '../abi/FitnessTracker.json';

export default function WorkoutTracker() {
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  const { call, isLoading, txHash, error: callError } = useContractCall();
  const [calories, setCalories] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Encrypt the value
    const encrypted = await encrypt(Number(calories));

    if (!encrypted) {
      alert('Encryption failed');
      return;
    }

    // Call contract
    const result = await call({
      contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
      abi: ContractABI,
      functionName: 'recordCalories',
      encryptedInputs: [encrypted],
    });

    if (result) {
      console.log('Success! TX:', result.txHash);
      setCalories('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Record Calories</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="Calories burned"
          className="w-full p-2 border rounded mb-4"
          required
        />

        <button
          type="submit"
          disabled={isEncrypting || isLoading}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {isEncrypting || isLoading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {(encryptError || callError) && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded">
          Error: {encryptError?.message || callError?.message}
        </div>
      )}

      {txHash && (
        <div className="mt-4 p-3 bg-green-50 text-green-600 rounded">
          Success! TX: {txHash}
        </div>
      )}
    </div>
  );
}
```

---

## Node.js Scripts

### Backend Integration Script

**`scripts/backend-integration.js`**

```javascript
const { createFhevmClient, encryptInput, userDecrypt } = require('@fhevm/sdk');
const { JsonRpcProvider, Wallet, Contract } = require('ethers');
const ContractABI = require('./abi/FitnessTracker.json');

async function main() {
  // Setup provider and wallet
  const provider = new JsonRpcProvider('https://rpc.sepolia.org');
  const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

  // Initialize FHEVM client
  const client = await createFhevmClient({
    provider,
    network: 'sepolia',
    contractAddress: process.env.CONTRACT_ADDRESS,
    signer: wallet,
  });

  console.log('✅ FHEVM Client initialized');

  // Encrypt workout data
  const caloriesValue = 500;
  const encrypted = await encryptInput(client, caloriesValue, {
    generateProof: true,
    userAddress: wallet.address,
  });

  console.log('✅ Encrypted calories:', encrypted.data);

  // Interact with contract
  const contract = new Contract(
    process.env.CONTRACT_ADDRESS,
    ContractABI,
    wallet
  );

  // Record workout
  const tx = await contract.recordCalories(
    encrypted.data,
    encrypted.inputProof || '0x'
  );

  console.log('📝 Transaction sent:', tx.hash);

  const receipt = await tx.wait();
  console.log('✅ Transaction confirmed:', receipt.hash);

  // Get encrypted handle
  const encryptedHandle = await contract.getTotalCalories(wallet.address);
  console.log('🔐 Encrypted handle:', encryptedHandle);

  // Decrypt value
  const result = await userDecrypt(
    client,
    encryptedHandle,
    process.env.CONTRACT_ADDRESS
  );

  if (result.success) {
    console.log('✅ Decrypted total calories:', result.value);
  } else {
    console.error('❌ Decryption failed');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Batch Operations Script

**`scripts/batch-operations.js`**

```javascript
const { createFhevmClient, batchEncrypt, batchDecrypt } = require('@fhevm/sdk');
const { JsonRpcProvider, Wallet } = require('ethers');

async function batchExample() {
  const provider = new JsonRpcProvider('https://rpc.sepolia.org');
  const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

  const client = await createFhevmClient({
    provider,
    network: 'sepolia',
    contractAddress: process.env.CONTRACT_ADDRESS,
    signer: wallet,
  });

  // Batch encrypt multiple values
  const workoutData = [
    { value: 500, type: 'euint16' },  // calories
    { value: 60, type: 'euint8' },    // duration
    { value: 7, type: 'euint8' },     // intensity
  ];

  console.log('🔐 Encrypting batch...');
  const encrypted = await batchEncrypt(client, workoutData, {
    userAddress: wallet.address,
  });

  console.log('✅ Batch encrypted:', encrypted.length, 'values');

  // Batch decrypt multiple handles
  const handles = [
    '0x1234...', // Handle from contract
    '0x5678...',
    '0x9abc...',
  ];

  console.log('🔓 Decrypting batch...');
  const decrypted = await batchDecrypt(
    client,
    {
      contractAddress: process.env.CONTRACT_ADDRESS,
      handles,
      userAddress: wallet.address,
    }
  );

  console.log('✅ Batch decrypted:');
  decrypted.forEach((result, i) => {
    if (result.success) {
      console.log(`  [${i}] ${result.value} (${result.type})`);
    } else {
      console.log(`  [${i}] Failed`);
    }
  });
}

batchExample()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## Vue Integration

### Vue 3 Composition API

**`src/App.vue`**

```vue
<template>
  <div class="container">
    <h1>Privacy Fitness Tracker</h1>

    <div v-if="isLoading">Loading FHEVM Client...</div>
    <div v-else-if="error" class="error">{{ error.message }}</div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Calories Burned</label>
        <input
          v-model.number="calories"
          type="number"
          placeholder="e.g., 500"
          required
        />
      </div>

      <button
        type="submit"
        :disabled="isEncrypting || isSubmitting"
      >
        {{ isEncrypting || isSubmitting ? 'Recording...' : 'Record Workout' }}
      </button>
    </form>

    <div v-if="txHash" class="success">
      ✅ Transaction: {{ txHash }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useFhevmClient, useEncrypt } from '@fhevm/sdk/vue';
import { Contract } from 'ethers';
import ContractABI from './abi/FitnessTracker.json';

const { client, isLoading, error, isReady } = useFhevmClient({
  provider: window.ethereum,
  network: 'sepolia',
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
});

const { encrypt, isEncrypting } = useEncrypt();

const calories = ref('');
const isSubmitting = ref(false);
const txHash = ref(null);

const handleSubmit = async () => {
  if (!isReady.value || !client.value) {
    alert('Client not ready');
    return;
  }

  try {
    isSubmitting.value = true;

    // Encrypt value
    const encrypted = await encrypt(calories.value);

    if (!encrypted) {
      throw new Error('Encryption failed');
    }

    // Call contract
    const contract = new Contract(
      import.meta.env.VITE_CONTRACT_ADDRESS,
      ContractABI,
      client.value.signer
    );

    const tx = await contract.recordCalories(encrypted.data);
    const receipt = await tx.wait();

    txHash.value = receipt.hash;
    calories.value = '';
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to record workout');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.error {
  color: red;
  padding: 1rem;
  background: #fee;
  border-radius: 0.5rem;
}

.success {
  color: green;
  padding: 1rem;
  background: #efe;
  border-radius: 0.5rem;
  margin-top: 1rem;
}
</style>
```

---

## Real-World Use Cases

### Privacy Fitness Tracker

Complete implementation showing encrypted workout tracking, member registration, and stats decryption.

**Key Features:**
- Encrypted workout data (calories, duration, intensity)
- Member registration with encrypted profiles
- Selective disclosure with EIP-712 signatures
- Batch operations for efficiency

See full example: `examples/privacy-fitness-tracker/`

### Private Voting System

```typescript
import { createFhevmClient, encryptBool, batchDecrypt } from '@fhevm/sdk';

// Encrypt votes
const vote = await encryptBool(client, true, { // true = yes, false = no
  generateProof: true,
  userAddress: voterAddress,
});

// Submit encrypted vote
await votingContract.castVote(proposalId, vote.data, vote.inputProof);

// Decrypt results (only after voting ends)
const results = await batchDecrypt(client, {
  contractAddress: votingContractAddress,
  handles: [yesVotesHandle, noVotesHandle],
  userAddress: adminAddress,
});
```

### Confidential Auction

```typescript
import { createFhevmClient, encryptUint64 } from '@fhevm/sdk';

// Encrypt bid amount
const bidAmount = await encryptUint64(client, 1000000n, {
  generateProof: true,
  userAddress: bidderAddress,
});

// Submit encrypted bid
await auctionContract.placeBid(auctionId, bidAmount.data, bidAmount.inputProof);

// Winner revealed only at auction end
```

---

## Advanced Patterns

### Custom Network Configuration

```typescript
import { createFhevmClient } from '@fhevm/sdk';

const client = await createFhevmClient({
  provider: customProvider,
  network: 'sepolia', // or 'localhost', 'zama-devnet'
  contractAddress: '0x...',
  gatewayUrl: 'https://custom-gateway.example.com', // Optional
}, {
  debug: true,
  aclAddress: '0x...', // Custom ACL address
  cache: true, // Cache FHE instance
});
```

### Error Handling Pattern

```typescript
import { useEncrypt, useContractCall } from '@fhevm/sdk/react';

function MyComponent() {
  const { encrypt, error: encryptError } = useEncrypt();
  const { call, error: callError } = useContractCall();

  const handleAction = async () => {
    try {
      const encrypted = await encrypt(value);

      if (!encrypted) {
        throw new Error(encryptError?.message || 'Encryption failed');
      }

      const result = await call({
        contractAddress,
        abi,
        functionName: 'myFunction',
        encryptedInputs: [encrypted],
      });

      if (!result) {
        throw new Error(callError?.message || 'Contract call failed');
      }

      console.log('Success:', result.txHash);
    } catch (err) {
      console.error('Error:', err);
      // Handle error appropriately
    }
  };

  return (
    <button onClick={handleAction}>Execute</button>
  );
}
```

### Retry with Exponential Backoff

```typescript
import { retry } from '@fhevm/sdk';

const result = await retry(
  async () => {
    return await userDecrypt(client, handle, contractAddress);
  },
  3, // max retries
  1000 // base delay in ms
);
```

---

**🔗 Navigation:** [Main Docs](./README.md) • [API Reference](./API.md) • [Migration Guide](./MIGRATION.md)
