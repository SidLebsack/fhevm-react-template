# @fhevm/sdk

> Universal SDK for building confidential dApps with FHEVM - Framework agnostic (React, Vue, Next.js, Node.js)

[![npm version](https://img.shields.io/npm/v/@fhevm/sdk)](https://www.npmjs.com/package/@fhevm/sdk)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

## ✨ Features

- 🔐 **Universal Encryption** - Easy-to-use encryption/decryption for FHEVM
- ⚛️ **React Hooks** - Wagmi-like API structure for React applications
- 🎯 **Framework Agnostic** - Works with React, Vue, Next.js, Node.js
- 📦 **All-in-One** - Wraps all required packages (fhevmjs, ethers, etc.)
- 🚀 **Quick Setup** - Less than 10 lines of code to get started
- 🔧 **Type Safe** - Full TypeScript support with type definitions
- 📝 **EIP-712 Signatures** - Secure decryption with user signatures
- ⚡ **Optimized** - Efficient batch operations and caching

## 📦 Installation

```bash
npm install @fhevm/sdk ethers
```

**Peer dependencies:**
- `ethers@^6.0.0` (required)
- `react@>=18.0.0` (optional, for React hooks)
- `vue@>=3.0.0` (optional, for Vue composables)

## 🚀 Quick Start

### Core SDK (Framework Agnostic)

```typescript
import { createFhevmClient, encryptInput, userDecrypt } from '@fhevm/sdk';

// Initialize client
const client = await createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia',
  contractAddress: '0x...'
});

// Encrypt a value
const encrypted = await encryptInput(client, 42);

// Send to contract
const contract = new Contract(contractAddress, abi, await client.provider.getSigner());
await contract.recordData(encrypted.data, encrypted.inputProof);

// Decrypt value (with EIP-712 signature)
const result = await userDecrypt(client, encryptedHandle, contractAddress);
console.log('Decrypted value:', result.value);
```

### React Hooks

```tsx
import { FhevmProvider, useFhevmClient, useEncrypt, useDecrypt } from '@fhevm/sdk/react';

function App() {
  return (
    <FhevmProvider
      config={{
        provider: window.ethereum,
        network: 'sepolia',
        contractAddress: '0x...'
      }}
    >
      <YourApp />
    </FhevmProvider>
  );
}

function YourComponent() {
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, isDecrypting } = useDecrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(500);
    // Use encrypted.data in contract call
  };

  const handleDecrypt = async () => {
    const result = await decrypt(encryptedHandle, contractAddress);
    console.log('Value:', result.value);
  };

  return (
    <div>
      <button onClick={handleEncrypt} disabled={isEncrypting}>
        Encrypt Value
      </button>
      <button onClick={handleDecrypt} disabled={isDecrypting}>
        Decrypt Value
      </button>
    </div>
  );
}
```

## 📚 API Documentation

### Core Functions

#### `createFhevmClient(config, options?)`

Create an FHEVM client instance.

```typescript
const client = await createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia',
  contractAddress: '0x...',
  gatewayUrl: 'https://gateway.zama.ai' // optional
}, {
  debug: true, // optional
  cache: true // optional
});
```

#### `encryptInput(client, value, options?)`

Encrypt a value for contract input.

```typescript
// Auto-detect type
const encrypted = await encryptInput(client, 42);

// With proof generation
const encrypted = await encryptInput(client, 500, {
  generateProof: true
});
```

#### Specific Type Encryption

```typescript
// Encrypt as uint8 (0-255)
const encrypted8 = await encryptUint8(client, 100);

// Encrypt as uint16 (0-65535)
const encrypted16 = await encryptUint16(client, 5000);

// Encrypt as uint32
const encrypted32 = await encryptUint32(client, 1000000);

// Encrypt as uint64
const encrypted64 = await encryptUint64(client, 9007199254740991n);

// Encrypt boolean
const encryptedBool = await encryptBool(client, true);
```

#### `userDecrypt(client, handle, contractAddress, options?)`

Decrypt value with EIP-712 user signature.

```typescript
const result = await userDecrypt(client, encryptedHandle, contractAddress);
console.log('Decrypted value:', result.value);
console.log('Type:', result.type);
console.log('Success:', result.success);
```

#### `publicDecrypt(client, handle, options?)`

Public decryption (no signature required).

```typescript
const result = await publicDecrypt(client, encryptedHandle);
```

#### `batchDecrypt(client, request, options?)`

Decrypt multiple values with single signature.

```typescript
const results = await batchDecrypt(client, {
  contractAddress: '0x...',
  handles: ['0x...', '0x...', '0x...'],
  userAddress: '0x...'
});

results.forEach(result => {
  console.log('Value:', result.value);
});
```

### React Hooks

#### `useFhevmClient()`

Access the FHEVM client instance.

```tsx
const { client, isLoading, error, isReady } = useFhevmClient();
```

#### `useEncrypt()`

Encrypt values with loading and error states.

```tsx
const {
  encrypt,
  encryptUint8,
  encryptUint16,
  encryptUint32,
  encryptUint64,
  encryptBool,
  isEncrypting,
  error
} = useEncrypt();
```

#### `useDecrypt()`

Decrypt values with loading and error states.

```tsx
const {
  decrypt,
  decryptPublic,
  decryptBatch,
  isDecrypting,
  error
} = useDecrypt();
```

#### `useContractCall()`

Call smart contracts with encrypted inputs.

```tsx
const { call, read, isLoading, error, txHash } = useContractCall();

// Write call
const result = await call({
  contractAddress: '0x...',
  abi: ContractABI,
  functionName: 'recordWorkout',
  encryptedInputs: [encryptedCalories],
  value: ethers.parseEther('0.01') // optional
});

// Read call
const data = await read({
  contractAddress: '0x...',
  abi: ContractABI,
  functionName: 'getMemberInfo',
  args: [userAddress]
});
```

## 🎯 Complete Examples

### Next.js Fitness Tracker

See `examples/nextjs-fitness-tracker` for a complete implementation.

```tsx
// app/page.tsx
'use client';

import { FhevmProvider, useEncrypt, useContractCall } from '@fhevm/sdk/react';
import { useState } from 'react';

export default function FitnessTracker() {
  return (
    <FhevmProvider
      config={{
        provider: typeof window !== 'undefined' ? window.ethereum : null,
        network: 'sepolia',
        contractAddress: '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844'
      }}
    >
      <RecordWorkout />
    </FhevmProvider>
  );
}

function RecordWorkout() {
  const [calories, setCalories] = useState('');
  const { encrypt, isEncrypting } = useEncrypt();
  const { call, isLoading, txHash } = useContractCall();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Encrypt calories
    const encrypted = await encrypt(Number(calories), { generateProof: true });

    // Call contract
    const result = await call({
      contractAddress: '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844',
      abi: FitnessTrackerABI,
      functionName: 'recordWorkout',
      encryptedInputs: [encrypted]
    });

    console.log('Transaction:', result.txHash);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        placeholder="Calories burned"
      />
      <button disabled={isEncrypting || isLoading}>
        {isEncrypting ? 'Encrypting...' : isLoading ? 'Submitting...' : 'Record Workout'}
      </button>
      {txHash && <p>Transaction: {txHash}</p>}
    </form>
  );
}
```

### Node.js Script

```javascript
const { createFhevmClient, encryptInput, userDecrypt } = require('@fhevm/sdk');
const { JsonRpcProvider } = require('ethers');

async function main() {
  // Create provider
  const provider = new JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY');

  // Initialize client
  const client = await createFhevmClient({
    provider,
    network: 'sepolia',
    contractAddress: '0x...'
  });

  // Encrypt value
  const encrypted = await encryptInput(client, 1000);
  console.log('Encrypted:', encrypted.data);

  // Decrypt value
  const result = await userDecrypt(client, encryptedHandle, contractAddress);
  console.log('Decrypted:', result.value);
}

main();
```

## 🌐 Supported Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| Sepolia Testnet | 11155111 | ✅ Supported |
| Zama Devnet | 8009 | ✅ Supported |
| Localhost | 31337 | ✅ Supported |

## 🔧 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  FhevmClient,
  FhevmConfig,
  EncryptedValue,
  DecryptionResult,
  ContractCallParams
} from '@fhevm/sdk';
```

## 📖 Documentation

- [Full Documentation](../../docs/README.md)
- [API Reference](../../docs/API.md)
- [Examples](../../examples/)
- [Migration Guide](../../docs/MIGRATION.md)

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](./LICENSE)

## 🔗 Resources

- [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)
- [fhevmjs GitHub](https://github.com/zama-ai/fhevmjs)
- [Ethers.js v6](https://docs.ethers.org/v6/)

---

**Built for the Zama FHE Challenge** 🎯
