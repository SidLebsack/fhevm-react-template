# 📖 API Reference

Complete API documentation for the FHEVM Universal SDK.

---

## Table of Contents

- [Core Functions](#core-functions)
  - [createFhevmClient](#createfhevmclient)
  - [Encryption Functions](#encryption-functions)
  - [Decryption Functions](#decryption-functions)
  - [Utility Functions](#utility-functions)
- [React Hooks](#react-hooks)
  - [useFhevmClient](#usefhevmclient)
  - [useEncrypt](#useencrypt)
  - [useDecrypt](#usedecrypt)
  - [useContractCall](#usecontractcall)
- [Types](#types)
- [Error Handling](#error-handling)

---

## Core Functions

### createFhevmClient

Initialize an FHEVM client instance.

**Signature:**
```typescript
async function createFhevmClient(
  config: FhevmConfig,
  options?: InitOptions
): Promise<FhevmClient>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config` | `FhevmConfig` | Yes | Client configuration |
| `config.provider` | `any` | Yes | Ethereum provider (window.ethereum, JsonRpcProvider, etc.) |
| `config.network` | `SupportedNetwork` | Yes | Network to connect to ('sepolia', 'localhost', 'zama-devnet') |
| `config.contractAddress` | `string` | No | Contract address for ACL |
| `config.gatewayUrl` | `string` | No | Custom gateway URL |
| `options` | `InitOptions` | No | Initialization options |
| `options.debug` | `boolean` | No | Enable debug logging |
| `options.aclAddress` | `string` | No | Custom ACL address |
| `options.cache` | `boolean` | No | Cache FHE instance |

**Returns:** `Promise<FhevmClient>` - Initialized client instance

**Example:**
```typescript
import { createFhevmClient } from '@fhevm/sdk';

const client = await createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia',
  contractAddress: '0x...'
}, {
  debug: true
});
```

---

## Encryption Functions

### encryptInput

Auto-detect type and encrypt a value.

**Signature:**
```typescript
async function encryptInput(
  client: FhevmClient,
  value: number | bigint | boolean,
  options?: EncryptionOptions
): Promise<EncryptedValue>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client` | `FhevmClient` | Yes | Initialized client instance |
| `value` | `number \| bigint \| boolean` | Yes | Value to encrypt |
| `options.generateProof` | `boolean` | No | Generate input proof (default: false) |
| `options.userAddress` | `string` | No | User address for encryption |

**Returns:** `Promise<EncryptedValue>` - Encrypted value with metadata

**Example:**
```typescript
const encrypted = await encryptInput(client, 42);
console.log('Encrypted data:', encrypted.data);
console.log('Type:', encrypted.type); // 'euint8'
```

### encryptUint8

Encrypt uint8 value (0-255).

**Signature:**
```typescript
async function encryptUint8(
  client: FhevmClient,
  value: number,
  options?: EncryptionOptions
): Promise<EncryptedValue>
```

**Example:**
```typescript
const encrypted = await encryptUint8(client, 100);
```

### encryptUint16

Encrypt uint16 value (0-65535).

**Signature:**
```typescript
async function encryptUint16(
  client: FhevmClient,
  value: number,
  options?: EncryptionOptions
): Promise<EncryptedValue>
```

### encryptUint32

Encrypt uint32 value (0-4294967295).

**Signature:**
```typescript
async function encryptUint32(
  client: FhevmClient,
  value: number,
  options?: EncryptionOptions
): Promise<EncryptedValue>
```

### encryptUint64

Encrypt uint64 value.

**Signature:**
```typescript
async function encryptUint64(
  client: FhevmClient,
  value: bigint | number,
  options?: EncryptionOptions
): Promise<EncryptedValue>
```

### encryptBool

Encrypt boolean value.

**Signature:**
```typescript
async function encryptBool(
  client: FhevmClient,
  value: boolean,
  options?: EncryptionOptions
): Promise<EncryptedValue>
```

### batchEncrypt

Encrypt multiple values in batch.

**Signature:**
```typescript
async function batchEncrypt(
  client: FhevmClient,
  values: Array<{ value: number | bigint | boolean; type?: EncryptedValue['type'] }>,
  options?: EncryptionOptions
): Promise<EncryptedValue[]>
```

---

## Decryption Functions

### userDecrypt

Decrypt value with EIP-712 user signature.

**Signature:**
```typescript
async function userDecrypt(
  client: FhevmClient,
  handle: string,
  contractAddress: string,
  options?: DecryptionOptions
): Promise<DecryptionResult>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client` | `FhevmClient` | Yes | Initialized client instance |
| `handle` | `string` | Yes | Encrypted handle to decrypt |
| `contractAddress` | `string` | Yes | Contract address for EIP-712 signature |
| `options.timeout` | `number` | No | Timeout in milliseconds |

**Returns:** `Promise<DecryptionResult>` - Decrypted value with metadata

**Example:**
```typescript
const result = await userDecrypt(client, encryptedHandle, contractAddress);
console.log('Decrypted value:', result.value);
console.log('Type:', result.type);
console.log('Success:', result.success);
```

### publicDecrypt

Public decryption (no signature required).

**Signature:**
```typescript
async function publicDecrypt(
  client: FhevmClient,
  handle: string,
  options?: DecryptionOptions
): Promise<DecryptionResult>
```

**Example:**
```typescript
const result = await publicDecrypt(client, encryptedHandle);
```

### batchDecrypt

Decrypt multiple handles with single signature.

**Signature:**
```typescript
async function batchDecrypt(
  client: FhevmClient,
  request: BatchDecryptionRequest,
  options?: DecryptionOptions
): Promise<DecryptionResult[]>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request.contractAddress` | `string` | Yes | Contract address |
| `request.handles` | `string[]` | Yes | Array of handles to decrypt |
| `request.userAddress` | `string` | Yes | User address |

**Example:**
```typescript
const results = await batchDecrypt(client, {
  contractAddress: '0x...',
  handles: ['0x...', '0x...'],
  userAddress: '0x...'
});
```

---

## Utility Functions

### isAddress

Check if string is valid Ethereum address.

**Signature:**
```typescript
function isAddress(address: string): boolean
```

### formatAddress

Format address for display (0x1234...5678).

**Signature:**
```typescript
function formatAddress(address: string, chars?: number): string
```

### retry

Retry function with exponential backoff.

**Signature:**
```typescript
async function retry<T>(
  fn: () => Promise<T>,
  maxRetries?: number,
  baseDelay?: number
): Promise<T>
```

---

## React Hooks

### useFhevmClient

Access FHEVM client instance.

**Signature:**
```typescript
function useFhevmClient(): {
  client: FhevmClient | null;
  isLoading: boolean;
  error: Error | null;
  isReady: boolean;
}
```

**Example:**
```tsx
const { client, isLoading, error, isReady } = useFhevmClient();

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (!isReady) return <div>Client not ready</div>;

return <div>Client ready!</div>;
```

### useEncrypt

Encrypt values with loading and error states.

**Signature:**
```typescript
function useEncrypt(): {
  encrypt: (value: number | bigint | boolean, options?: EncryptionOptions) => Promise<EncryptedValue | null>;
  encryptUint8: (value: number, options?: EncryptionOptions) => Promise<EncryptedValue | null>;
  encryptUint16: (value: number, options?: EncryptionOptions) => Promise<EncryptedValue | null>;
  encryptUint32: (value: number, options?: EncryptionOptions) => Promise<EncryptedValue | null>;
  encryptUint64: (value: bigint | number, options?: EncryptionOptions) => Promise<EncryptedValue | null>;
  encryptBool: (value: boolean, options?: EncryptionOptions) => Promise<EncryptedValue | null>;
  isEncrypting: boolean;
  error: Error | null;
}
```

**Example:**
```tsx
const { encrypt, isEncrypting, error } = useEncrypt();

const handleEncrypt = async () => {
  const encrypted = await encrypt(500);
  if (encrypted) {
    // Use encrypted.data in contract call
  }
};

return (
  <button onClick={handleEncrypt} disabled={isEncrypting}>
    {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
  </button>
);
```

### useDecrypt

Decrypt values with loading and error states.

**Signature:**
```typescript
function useDecrypt(): {
  decrypt: (handle: string, contractAddress: string, options?: DecryptionOptions) => Promise<DecryptionResult | null>;
  decryptPublic: (handle: string, options?: DecryptionOptions) => Promise<DecryptionResult | null>;
  decryptBatch: (request: BatchDecryptionRequest, options?: DecryptionOptions) => Promise<DecryptionResult[] | null>;
  isDecrypting: boolean;
  error: Error | null;
}
```

**Example:**
```tsx
const { decrypt, isDecrypting, error } = useDecrypt();

const handleDecrypt = async () => {
  const result = await decrypt(encryptedHandle, contractAddress);
  if (result) {
    console.log('Decrypted value:', result.value);
  }
};
```

### useContractCall

Call smart contracts with encrypted inputs.

**Signature:**
```typescript
function useContractCall(): {
  call: (params: ContractCallParams) => Promise<{ txHash: string; receipt: any } | null>;
  read: (params: ContractCallParams) => Promise<any | null>;
  isLoading: boolean;
  error: Error | null;
  txHash: string | null;
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params.contractAddress` | `string` | Yes | Contract address |
| `params.abi` | `any[]` | Yes | Contract ABI |
| `params.functionName` | `string` | Yes | Function name to call |
| `params.args` | `any[]` | No | Function arguments |
| `params.encryptedInputs` | `EncryptedValue[]` | No | Encrypted inputs |
| `params.value` | `bigint` | No | Transaction value in wei |

**Example:**
```tsx
const { call, isLoading, txHash, error } = useContractCall();

const handleSubmit = async (encrypted: EncryptedValue) => {
  const result = await call({
    contractAddress: '0x...',
    abi: ContractABI,
    functionName: 'recordData',
    encryptedInputs: [encrypted]
  });

  if (result) {
    console.log('Transaction hash:', result.txHash);
  }
};
```

---

## Types

### FhevmConfig

```typescript
interface FhevmConfig {
  provider: any;
  network: SupportedNetwork;
  contractAddress?: string;
  gatewayUrl?: string;
  signer?: Signer;
}
```

### EncryptedValue

```typescript
interface EncryptedValue {
  data: string;
  inputProof?: string;
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool' | 'eaddress';
  handles?: string[];
}
```

### DecryptionResult

```typescript
interface DecryptionResult {
  value: bigint | boolean | number;
  encrypted: string;
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool' | 'eaddress';
  success: boolean;
}
```

### ContractCallParams

```typescript
interface ContractCallParams {
  contractAddress: string;
  abi: any[];
  functionName: string;
  args?: any[];
  encryptedInputs?: EncryptedValue[];
  value?: bigint;
}
```

---

## Error Handling

All SDK functions handle errors gracefully and provide clear error messages.

### Common Error Types

**Initialization Errors:**
```typescript
try {
  const client = await createFhevmClient(config);
} catch (error) {
  console.error('Failed to initialize client:', error.message);
}
```

**Encryption Errors:**
```typescript
try {
  const encrypted = await encryptInput(client, value);
} catch (error) {
  console.error('Encryption failed:', error.message);
}
```

**Decryption Errors:**
```typescript
try {
  const result = await userDecrypt(client, handle, contractAddress);
} catch (error) {
  console.error('Decryption failed:', error.message);
}
```

### Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "FHE instance not initialized" | Client not ready | Wait for initialization |
| "Unsupported network: X" | Invalid network | Use 'sepolia', 'localhost', or 'zama-devnet' |
| "FHEVM client not ready" | Client still initializing | Check `isReady` state |
| "Value must be between X and Y for uintZ" | Value out of range | Use correct type or value range |

---

**🔗 Navigation:** [Main Docs](./README.md) • [Examples](./EXAMPLES.md) • [Migration](./MIGRATION.md)
