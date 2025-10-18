# 🔄 Migration Guide

Guide for migrating to the FHEVM Universal SDK from other FHEVM implementations.

---

## Table of Contents

- [Migrating from fhevm-react-template](#migrating-from-fhevm-react-template)
- [Breaking Changes](#breaking-changes)
- [Step-by-Step Migration](#step-by-step-migration)
- [Code Comparison](#code-comparison)
- [Best Practices](#best-practices)
- [Troubleshooting Migration](#troubleshooting-migration)

---

## Migrating from fhevm-react-template

If you're currently using the original `fhevm-react-template`, this guide will help you migrate to the universal SDK.

### Why Migrate?

**Benefits of the Universal SDK:**
- ✅ **Framework Agnostic** - Use with React, Vue, Next.js, Node.js, or any JavaScript environment
- ✅ **Wagmi-like API** - Familiar hooks pattern for web3 developers
- ✅ **Better TypeScript Support** - Full type safety throughout
- ✅ **Cleaner Architecture** - Separation between core and framework adapters
- ✅ **More Features** - Batch operations, better error handling, loading states
- ✅ **Better Documentation** - Comprehensive guides and examples

### Compatibility

**The universal SDK is compatible with:**
- ✅ All existing FHEVM smart contracts
- ✅ Existing encryption/decryption workflows
- ✅ Current network configurations (Sepolia, Zama, localhost)
- ✅ Ethers.js v6 (upgrade from v5 if needed)

---

## Breaking Changes

### 1. Package Import Changes

**Before (fhevm-react-template):**
```typescript
import { useFhevm } from './hooks/useFhevm';
import { encryptValue } from './utils/encryption';
```

**After (Universal SDK):**
```typescript
// Core SDK (framework-agnostic)
import { createFhevmClient, encryptInput } from '@fhevm/sdk';

// React hooks
import { useFhevmClient, useEncrypt } from '@fhevm/sdk/react';
```

### 2. Client Initialization

**Before:**
```typescript
// Custom initialization in component
const [fhevm, setFhevm] = useState(null);

useEffect(() => {
  const init = async () => {
    const instance = await createFhevmInstance();
    setFhevm(instance);
  };
  init();
}, []);
```

**After:**
```tsx
// Provider-based initialization
<FhevmProvider
  config={{
    provider: window.ethereum,
    network: 'sepolia',
    contractAddress: '0x...'
  }}
>
  <App />
</FhevmProvider>

// Access in components
const { client, isReady } = useFhevmClient();
```

### 3. Encryption API

**Before:**
```typescript
const encrypted = await encryptValue(fhevm, 42, 'uint8');
```

**After:**
```typescript
// Auto-detect type
const encrypted = await encryptInput(client, 42);

// Or specify type
const encrypted = await encryptUint8(client, 42);
```

### 4. Decryption API

**Before:**
```typescript
const decrypted = await decrypt(fhevm, handle);
```

**After:**
```typescript
// User decryption with EIP-712 signature
const result = await userDecrypt(client, handle, contractAddress);
console.log(result.value);

// Public decryption (no signature)
const result = await publicDecrypt(client, handle);
```

### 5. Hook Names

**Before:**
```typescript
const { fhevm, loading } = useFhevm();
```

**After:**
```typescript
const { client, isLoading, isReady } = useFhevmClient();
const { encrypt, isEncrypting } = useEncrypt();
const { decrypt, isDecrypting } = useDecrypt();
const { call, isLoading } = useContractCall();
```

---

## Step-by-Step Migration

### Step 1: Install New SDK

```bash
# Remove old dependencies (if any)
npm uninstall fhevm-react-template

# Install universal SDK
npm install @fhevm/sdk ethers
```

### Step 2: Update Provider Setup

**Before (`src/App.tsx`):**
```tsx
function App() {
  const [fhevm, setFhevm] = useState(null);

  useEffect(() => {
    initFhevm().then(setFhevm);
  }, []);

  return (
    <div>
      {fhevm ? <MyComponent fhevm={fhevm} /> : 'Loading...'}
    </div>
  );
}
```

**After:**
```tsx
import { FhevmProvider } from '@fhevm/sdk/react';

function App() {
  return (
    <FhevmProvider
      config={{
        provider: window.ethereum,
        network: 'sepolia',
        contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS
      }}
    >
      <MyComponent />
    </FhevmProvider>
  );
}
```

### Step 3: Update Component Logic

**Before:**
```tsx
function MyComponent({ fhevm }) {
  const [loading, setLoading] = useState(false);

  const handleEncrypt = async () => {
    setLoading(true);
    try {
      const encrypted = await encryptValue(fhevm, 100, 'uint8');
      await contract.submitValue(encrypted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleEncrypt} disabled={loading}>
      {loading ? 'Encrypting...' : 'Submit'}
    </button>
  );
}
```

**After:**
```tsx
import { useEncrypt, useContractCall } from '@fhevm/sdk/react';

function MyComponent() {
  const { encrypt, isEncrypting } = useEncrypt();
  const { call, isLoading } = useContractCall();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(100);

    if (encrypted) {
      await call({
        contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
        abi: ContractABI,
        functionName: 'submitValue',
        encryptedInputs: [encrypted]
      });
    }
  };

  return (
    <button onClick={handleEncrypt} disabled={isEncrypting || isLoading}>
      {isEncrypting || isLoading ? 'Processing...' : 'Submit'}
    </button>
  );
}
```

### Step 4: Update Decryption Logic

**Before:**
```tsx
const handleDecrypt = async () => {
  const handle = await contract.getValue();
  const decrypted = await decrypt(fhevm, handle);
  console.log('Value:', decrypted);
};
```

**After:**
```tsx
import { useDecrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { decrypt, isDecrypting } = useDecrypt();

  const handleDecrypt = async () => {
    const handle = await contract.getValue();
    const result = await decrypt(handle, contractAddress);

    if (result && result.success) {
      console.log('Value:', result.value);
    }
  };

  return (
    <button onClick={handleDecrypt} disabled={isDecrypting}>
      {isDecrypting ? 'Decrypting...' : 'Decrypt'}
    </button>
  );
}
```

### Step 5: Update Environment Variables

**Before (`.env`):**
```bash
REACT_APP_FHEVM_NETWORK=sepolia
REACT_APP_CONTRACT=0x...
```

**After (`.env`):**
```bash
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_NETWORK=sepolia
```

### Step 6: Update TypeScript Types (if applicable)

**Before:**
```typescript
interface FhevmInstance {
  encrypt: (value: number, type: string) => Promise<any>;
  decrypt: (handle: string) => Promise<number>;
}
```

**After:**
```typescript
import type {
  FhevmClient,
  FhevmConfig,
  EncryptedValue,
  DecryptionResult
} from '@fhevm/sdk';

// Use official types from SDK
```

---

## Code Comparison

### Complete Component Migration

**Before:**
```tsx
import { useState, useEffect } from 'react';
import { encryptValue, decryptValue } from './utils/fhevm';
import { Contract } from 'ethers';

function WorkoutTracker({ fhevm, provider }) {
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const encrypted = await encryptValue(fhevm, Number(calories), 'uint16');

      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, abi, signer);

      const tx = await contract.recordCalories(encrypted);
      await tx.wait();

      alert('Success!');
    } catch (error) {
      console.error(error);
      alert('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="number"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
}

export default WorkoutTracker;
```

**After:**
```tsx
import { useState } from 'react';
import { useEncrypt, useContractCall } from '@fhevm/sdk/react';
import ContractABI from './abi/Contract.json';

function WorkoutTracker() {
  const [calories, setCalories] = useState('');
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  const { call, isLoading, error: callError } = useContractCall();

  const handleSubmit = async () => {
    const encrypted = await encrypt(Number(calories));

    if (!encrypted) {
      alert(encryptError?.message || 'Encryption failed');
      return;
    }

    const result = await call({
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      abi: ContractABI,
      functionName: 'recordCalories',
      encryptedInputs: [encrypted]
    });

    if (result) {
      alert('Success!');
      setCalories('');
    } else {
      alert(callError?.message || 'Transaction failed');
    }
  };

  return (
    <div>
      <input
        type="number"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={isEncrypting || isLoading}
      >
        {isEncrypting || isLoading ? 'Processing...' : 'Submit'}
      </button>
    </div>
  );
}

export default WorkoutTracker;
```

**Key Improvements:**
- ✅ No manual loading state management
- ✅ Built-in error handling
- ✅ Automatic type detection
- ✅ Cleaner, more declarative code
- ✅ Better TypeScript support

---

## Best Practices

### 1. Use Provider at Top Level

```tsx
// App.tsx - Top level
<FhevmProvider config={...}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</FhevmProvider>
```

### 2. Check isReady Before Operations

```tsx
const { client, isReady } = useFhevmClient();

const handleAction = async () => {
  if (!isReady) {
    alert('Client not ready yet');
    return;
  }

  // Proceed with operation
};
```

### 3. Handle Errors Gracefully

```tsx
const { encrypt, error } = useEncrypt();

const encrypted = await encrypt(value);

if (!encrypted) {
  console.error('Encryption failed:', error?.message);
  // Show user-friendly error
  return;
}

// Continue with encrypted value
```

### 4. Use Batch Operations for Efficiency

**Instead of:**
```typescript
const enc1 = await encrypt(value1);
const enc2 = await encrypt(value2);
const enc3 = await encrypt(value3);
```

**Use:**
```typescript
import { batchEncrypt } from '@fhevm/sdk';

const encrypted = await batchEncrypt(client, [
  { value: value1, type: 'euint8' },
  { value: value2, type: 'euint16' },
  { value: value3, type: 'euint32' }
]);
```

### 5. Type-Safe Contract Calls

```typescript
import type { ContractCallParams } from '@fhevm/sdk';

const params: ContractCallParams = {
  contractAddress: '0x...',
  abi: ContractABI,
  functionName: 'recordWorkout',
  encryptedInputs: [encrypted],
  args: [additionalArg1, additionalArg2]
};

const result = await call(params);
```

---

## Troubleshooting Migration

### Common Issues

#### Issue 1: "FhevmProvider not found"

**Problem:**
```
Module not found: Can't resolve '@fhevm/sdk/react'
```

**Solution:**
Ensure you installed the SDK correctly:
```bash
npm install @fhevm/sdk ethers
```

Check that you're importing from the correct path:
```typescript
import { FhevmProvider } from '@fhevm/sdk/react'; // ✅ Correct
import { FhevmProvider } from '@fhevm/sdk'; // ❌ Wrong
```

#### Issue 2: "Client not initialized"

**Problem:**
```
Error: FHEVM client not ready
```

**Solution:**
Make sure you wrap your app in `FhevmProvider`:
```tsx
<FhevmProvider config={...}>
  <YourApp />
</FhevmProvider>
```

And check `isReady` before operations:
```tsx
const { isReady } = useFhevmClient();

if (!isReady) {
  return <div>Loading...</div>;
}
```

#### Issue 3: TypeScript Errors

**Problem:**
```
Type 'X' is not assignable to type 'Y'
```

**Solution:**
Import types from SDK:
```typescript
import type {
  FhevmClient,
  EncryptedValue,
  DecryptionResult
} from '@fhevm/sdk';
```

#### Issue 4: Ethers v5 vs v6

**Problem:**
```
Property 'formatEther' does not exist on type 'utils'
```

**Solution:**
Update to ethers v6:
```bash
npm install ethers@^6.0.0
```

Update import statements:
```typescript
// v5
import { utils } from 'ethers';
const formatted = utils.formatEther(value);

// v6
import { formatEther } from 'ethers';
const formatted = formatEther(value);
```

#### Issue 5: Environment Variables

**Problem:**
Contract address undefined

**Solution:**
Update environment variable names:
```bash
# .env
REACT_APP_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
VITE_CONTRACT_ADDRESS=0x...
```

Access correctly in code:
```typescript
// React (CRA)
process.env.REACT_APP_CONTRACT_ADDRESS

// Next.js
process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

// Vite
import.meta.env.VITE_CONTRACT_ADDRESS
```

---

## Migration Checklist

Use this checklist to ensure complete migration:

- [ ] Install `@fhevm/sdk` and `ethers@^6`
- [ ] Remove old FHEVM dependencies
- [ ] Wrap app in `FhevmProvider`
- [ ] Update all imports to use `@fhevm/sdk` or `@fhevm/sdk/react`
- [ ] Replace custom encryption functions with `useEncrypt()`
- [ ] Replace custom decryption functions with `useDecrypt()`
- [ ] Update contract calls to use `useContractCall()`
- [ ] Update TypeScript types to use SDK types
- [ ] Update environment variables
- [ ] Test all encryption/decryption workflows
- [ ] Test all contract interactions
- [ ] Update documentation/README
- [ ] Remove old utility files
- [ ] Test in production build

---

## Getting Help

If you encounter issues during migration:

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review [Examples](./EXAMPLES.md)
3. Check [API Reference](./API.md)
4. Search [GitHub Issues](https://github.com/SidLebsack/fhevm-react-template/issues)
5. Ask in [Zama Discord](https://discord.com/invite/zama)

---

**🔗 Navigation:** [Main Docs](./README.md) • [API Reference](./API.md) • [Examples](./EXAMPLES.md)
