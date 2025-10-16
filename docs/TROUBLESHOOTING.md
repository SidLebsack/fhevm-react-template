# 🔧 Troubleshooting Guide

Common issues and solutions when working with the FHEVM Universal SDK.

---

## Table of Contents

- [Installation Issues](#installation-issues)
- [Initialization Errors](#initialization-errors)
- [Encryption Errors](#encryption-errors)
- [Decryption Errors](#decryption-errors)
- [Network Issues](#network-issues)
- [React Hook Errors](#react-hook-errors)
- [Contract Interaction Errors](#contract-interaction-errors)
- [TypeScript Errors](#typescript-errors)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

---

## Installation Issues

### Error: Cannot find module '@fhevm/sdk'

**Symptoms:**
```
Module not found: Can't resolve '@fhevm/sdk'
```

**Cause:**
Package not installed or incorrect import path

**Solution:**
```bash
# Install the SDK
npm install @fhevm/sdk ethers

# For React
npm install @fhevm/sdk ethers react react-dom

# Clear cache if needed
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

Ensure correct imports:
```typescript
// ✅ Correct
import { createFhevmClient } from '@fhevm/sdk';
import { useEncrypt } from '@fhevm/sdk/react';

// ❌ Wrong
import { createFhevmClient } from 'fhevm-sdk';
import { useEncrypt } from '@fhevm/sdk'; // Missing /react
```

### Error: Peer dependency warnings

**Symptoms:**
```
npm WARN peerDependencies ethers@^5.0.0 but installed 6.0.0
```

**Cause:**
Version conflicts with ethers.js

**Solution:**
```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps

# Or force
npm install --force

# Update package.json to use ethers v6
npm install ethers@^6.14.0
```

### Error: Module build failed

**Symptoms:**
```
Module build failed: Error: Cannot find module 'fhevmjs'
```

**Cause:**
Missing fhevmjs dependency

**Solution:**
```bash
# Install fhevmjs
npm install fhevmjs

# Or reinstall everything
npm install
```

---

## Initialization Errors

### Error: "FHE instance not initialized"

**Symptoms:**
```
Error: FHE instance not initialized. Please wait for client to be ready.
```

**Cause:**
Attempting operations before client initialization completes

**Solution:**

**React:**
```tsx
const { client, isReady } = useFhevmClient();

if (!isReady) {
  return <div>Loading FHEVM Client...</div>;
}

// Proceed with operations
```

**Core SDK:**
```typescript
const client = await createFhevmClient(config);

// Wait for initialization
if (!client.isInitialized) {
  throw new Error('Client not initialized');
}

// Proceed with operations
```

### Error: "Unsupported network: X"

**Symptoms:**
```
Error: Unsupported network: mainnet
```

**Cause:**
Using an unsupported network

**Solution:**
Use supported networks only:
```typescript
const client = await createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia', // ✅ Supported
  // network: 'localhost', // ✅ Supported
  // network: 'zama-devnet', // ✅ Supported
  // network: 'mainnet', // ❌ Not supported
  contractAddress: '0x...'
});
```

### Error: Provider not available

**Symptoms:**
```
Error: Provider not found. Please install MetaMask.
```

**Cause:**
No Ethereum provider (MetaMask) installed

**Solution:**

**Check for provider:**
```typescript
if (typeof window.ethereum === 'undefined') {
  alert('Please install MetaMask');
  return;
}

const client = await createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia',
  contractAddress: '0x...'
});
```

**For Node.js scripts:**
```typescript
import { JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider('https://rpc.sepolia.org');

const client = await createFhevmClient({
  provider,
  network: 'sepolia',
  contractAddress: '0x...'
});
```

---

## Encryption Errors

### Error: "Value must be between X and Y for uintZ"

**Symptoms:**
```
Error: Value must be between 0 and 255 for uint8
```

**Cause:**
Value exceeds the range for the specified type

**Solution:**

**Use correct type for value:**
```typescript
// ❌ Wrong - 1000 is too large for uint8
const encrypted = await encryptUint8(client, 1000);

// ✅ Correct - Use uint16 for values up to 65535
const encrypted = await encryptUint16(client, 1000);

// ✅ Or use auto-detection
const encrypted = await encryptInput(client, 1000); // Auto-selects euint16
```

**Value ranges:**
- `euint8`: 0 - 255
- `euint16`: 0 - 65,535
- `euint32`: 0 - 4,294,967,295
- `euint64`: 0 - 18,446,744,073,709,551,615
- `ebool`: true/false

### Error: Encryption timeout

**Symptoms:**
```
Error: Encryption operation timed out
```

**Cause:**
Network latency or heavy load

**Solution:**

**Use retry utility:**
```typescript
import { retry } from '@fhevm/sdk';

const encrypted = await retry(
  async () => await encryptInput(client, value),
  3, // max retries
  2000 // base delay ms
);
```

**Check network status:**
```typescript
const { client, isReady, error } = useFhevmClient();

if (error) {
  console.error('Client error:', error.message);
}

if (!isReady) {
  console.log('Client still initializing...');
}
```

---

## Decryption Errors

### Error: "User signature required"

**Symptoms:**
```
Error: User signature required for decryption
```

**Cause:**
Using `userDecrypt()` without proper EIP-712 signature

**Solution:**

**Ensure wallet is connected:**
```tsx
const { decrypt, isDecrypting } = useDecrypt();

const handleDecrypt = async () => {
  if (!window.ethereum) {
    alert('Please connect wallet');
    return;
  }

  const result = await decrypt(handle, contractAddress);

  if (result && result.success) {
    console.log('Decrypted:', result.value);
  }
};
```

**For public decryption (no signature):**
```typescript
import { publicDecrypt } from '@fhevm/sdk';

// No signature needed for public values
const result = await publicDecrypt(client, handle);
```

### Error: "Handle not found"

**Symptoms:**
```
Error: Decryption failed - handle not found
```

**Cause:**
Invalid handle or handle doesn't exist on-chain

**Solution:**

**Verify handle exists:**
```typescript
// Check handle is not zero
if (handle === '0x0000000000000000000000000000000000000000000000000000000000000000') {
  console.error('Invalid handle');
  return;
}

// Attempt decryption
const result = await userDecrypt(client, handle, contractAddress);

if (!result.success) {
  console.error('Decryption failed');
}
```

### Error: Permission denied

**Symptoms:**
```
Error: Permission denied for decryption
```

**Cause:**
User doesn't have permission to decrypt the value (ACL restriction)

**Solution:**

**Check ACL permissions:**
```solidity
// In your contract, ensure user has permission
TFHE.allow(encryptedValue, msg.sender);
```

**Verify user address:**
```typescript
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});

const userAddress = accounts[0];

// Decrypt with correct user
const result = await userDecrypt(
  client,
  handle,
  contractAddress,
  { userAddress }
);
```

---

## Network Issues

### Error: Network mismatch

**Symptoms:**
```
Error: Network mismatch. Expected sepolia, got localhost
```

**Cause:**
MetaMask connected to different network than configured

**Solution:**

**Switch network in MetaMask:**
```typescript
try {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0xaa36a7' }], // Sepolia
  });
} catch (error) {
  console.error('Failed to switch network:', error);
}
```

**Check network before operations:**
```typescript
const { client } = useFhevmClient();

if (client?.network.chainId !== 11155111) {
  alert('Please switch to Sepolia network');
  return;
}
```

### Error: RPC request failed

**Symptoms:**
```
Error: RPC request failed with status 429
```

**Cause:**
Rate limiting from RPC provider

**Solution:**

**Use custom RPC provider:**
```typescript
import { JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider(
  'https://sepolia.infura.io/v3/YOUR_API_KEY'
);

const client = await createFhevmClient({
  provider,
  network: 'sepolia',
  contractAddress: '0x...'
});
```

**Implement retry logic:**
```typescript
import { retry } from '@fhevm/sdk';

const result = await retry(
  async () => await contract.someFunction(),
  5, // more retries for network issues
  3000 // longer delay
);
```

### Error: Gateway timeout

**Symptoms:**
```
Error: Gateway timeout
```

**Cause:**
Decryption gateway unavailable or slow

**Solution:**

**Use custom gateway:**
```typescript
const client = await createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia',
  contractAddress: '0x...',
  gatewayUrl: 'https://custom-gateway.example.com' // Custom gateway
});
```

**Increase timeout:**
```typescript
const result = await userDecrypt(
  client,
  handle,
  contractAddress,
  { timeout: 30000 } // 30 seconds
);
```

---

## React Hook Errors

### Error: "Hooks can only be called inside function component"

**Symptoms:**
```
Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

**Cause:**
Using hooks outside React component

**Solution:**

**Use hooks inside components only:**
```tsx
// ❌ Wrong - outside component
const { encrypt } = useEncrypt();

function MyComponent() {
  return <div>...</div>;
}

// ✅ Correct - inside component
function MyComponent() {
  const { encrypt } = useEncrypt();

  return <div>...</div>;
}
```

### Error: "useFhevmClient must be used within FhevmProvider"

**Symptoms:**
```
Error: useFhevmClient must be used within FhevmProvider
```

**Cause:**
Missing FhevmProvider in component tree

**Solution:**

**Wrap app in provider:**
```tsx
// ❌ Wrong - no provider
function App() {
  return <MyComponent />;
}

// ✅ Correct - provider wraps app
function App() {
  return (
    <FhevmProvider config={{...}}>
      <MyComponent />
    </FhevmProvider>
  );
}
```

### Error: Cannot read property 'client' of null

**Symptoms:**
```
TypeError: Cannot read property 'client' of null
```

**Cause:**
Accessing client before initialization

**Solution:**

**Check client exists:**
```tsx
const { client, isReady } = useFhevmClient();

if (!client || !isReady) {
  return <div>Loading...</div>;
}

// Use client safely
```

---

## Contract Interaction Errors

### Error: Contract execution reverted

**Symptoms:**
```
Error: execution reverted
```

**Cause:**
Smart contract function reverted

**Solution:**

**Check contract function requirements:**
```solidity
// Contract may have requirements
require(member.isRegistered, "Not registered");
require(value > 0, "Invalid value");
```

**Verify encrypted input format:**
```typescript
const encrypted = await encrypt(value, {
  generateProof: true, // Some contracts require proof
  userAddress: account
});

await contract.submitValue(
  encrypted.data,
  encrypted.inputProof || '0x' // Provide proof
);
```

### Error: Gas estimation failed

**Symptoms:**
```
Error: cannot estimate gas
```

**Cause:**
Transaction would fail, or gas estimation issue

**Solution:**

**Manually set gas limit:**
```typescript
const result = await call({
  contractAddress,
  abi,
  functionName: 'myFunction',
  encryptedInputs: [encrypted],
  // Add gas limit
  value: 0n,
});

// Or with ethers directly
await contract.myFunction(encrypted.data, {
  gasLimit: 500000
});
```

### Error: Insufficient funds

**Symptoms:**
```
Error: insufficient funds for gas
```

**Cause:**
Account doesn't have enough ETH

**Solution:**

**Check balance:**
```typescript
const balance = await provider.getBalance(account);
console.log('Balance:', ethers.formatEther(balance), 'ETH');

if (balance === 0n) {
  alert('Insufficient funds. Please add ETH to your wallet.');
}
```

**Get testnet ETH:**
- Sepolia Faucet: https://sepoliafaucet.com/

---

## TypeScript Errors

### Error: Type 'X' is not assignable to type 'Y'

**Symptoms:**
```typescript
Type 'number' is not assignable to type 'bigint'
```

**Cause:**
Incorrect type usage

**Solution:**

**Use correct types:**
```typescript
// For large numbers, use BigInt
const encrypted = await encryptUint64(client, 1000000000000n); // Add 'n'

// For small numbers, use number
const encrypted = await encryptUint8(client, 100); // No 'n'

// Import types
import type { EncryptedValue, DecryptionResult } from '@fhevm/sdk';

const encrypted: EncryptedValue = await encryptInput(client, 42);
const result: DecryptionResult = await userDecrypt(client, handle, contractAddress);
```

### Error: Property 'X' does not exist

**Symptoms:**
```
Property 'ethereum' does not exist on type 'Window'
```

**Cause:**
Missing type declarations

**Solution:**

**Add type declaration:**
```typescript
// types/global.d.ts
interface Window {
  ethereum?: any;
}
```

**Or use type assertion:**
```typescript
const ethereum = (window as any).ethereum;
```

---

## Performance Issues

### Issue: Slow encryption

**Symptoms:**
Encryption takes several seconds

**Cause:**
Large values or network latency

**Solution:**

**Use batch operations:**
```typescript
import { batchEncrypt } from '@fhevm/sdk';

// Instead of multiple individual encrypts
const encrypted = await batchEncrypt(client, [
  { value: 100, type: 'euint8' },
  { value: 200, type: 'euint8' },
  { value: 300, type: 'euint8' }
]);
```

**Enable caching:**
```tsx
<FhevmProvider
  config={{...}}
  options={{
    cache: true // Cache FHE instance
  }}
>
  <App />
</FhevmProvider>
```

### Issue: High memory usage

**Symptoms:**
Browser becomes sluggish

**Cause:**
Multiple client instances

**Solution:**

**Use single provider:**
```tsx
// ✅ Single provider at top level
<FhevmProvider config={{...}}>
  <App />
</FhevmProvider>

// ❌ Don't create multiple providers
<FhevmProvider config={{...}}>
  <ComponentA>
    <FhevmProvider config={{...}}> {/* Wrong! */}
      <ComponentB />
    </FhevmProvider>
  </ComponentA>
</FhevmProvider>
```

---

## Getting Help

### Debug Mode

Enable debug logging:

```tsx
<FhevmProvider
  config={{...}}
  options={{
    debug: true // Enable debug logs
  }}
>
  <App />
</FhevmProvider>
```

```typescript
// Core SDK
const client = await createFhevmClient(config, {
  debug: true
});
```

### Check SDK Version

```bash
npm list @fhevm/sdk
```

Ensure you're using the latest version:
```bash
npm update @fhevm/sdk
```

### Common Debugging Steps

1. **Check browser console** for error messages
2. **Verify network** in MetaMask (should be Sepolia)
3. **Check wallet balance** (need ETH for gas)
4. **Verify contract address** is correct
5. **Test with simple values** first (e.g., encrypt 42)
6. **Check provider connection** (MetaMask installed/unlocked)
7. **Clear cache** and rebuild:
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

### Still Need Help?

1. Check [Examples](./EXAMPLES.md) for working code
2. Review [API Documentation](./API.md)
3. Search [GitHub Issues](https://github.com/SidLebsack/fhevm-react-template/issues)
4. Ask in [Zama Discord](https://discord.com/invite/zama)
5. Check [Zama fhEVM Docs](https://docs.zama.ai/fhevm)

### Reporting Issues

When reporting issues, include:
- SDK version (`npm list @fhevm/sdk`)
- Error message (full stack trace)
- Code snippet (minimal reproducible example)
- Network (Sepolia, localhost, etc.)
- Browser/Node.js version
- Steps to reproduce

**Example issue report:**
```
SDK Version: @fhevm/sdk@1.0.0
Error: "FHE instance not initialized"

Code:
const { encrypt } = useEncrypt();
const encrypted = await encrypt(42);

Network: Sepolia
Browser: Chrome 120
Steps: 1) Install SDK, 2) Call encrypt immediately
```

---

**🔗 Navigation:** [Main Docs](./README.md) • [API Reference](./API.md) • [Examples](./EXAMPLES.md) • [Migration Guide](./MIGRATION.md)
