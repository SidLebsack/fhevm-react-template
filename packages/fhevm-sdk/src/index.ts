/**
 * @fhevm/sdk - Universal SDK for building confidential dApps
 *
 * Framework-agnostic FHEVM SDK that works with React, Vue, Next.js, and Node.js
 * Provides wagmi-like API structure for intuitive usage
 *
 * @example
 * ```typescript
 * import { createFhevmClient, encryptInput, userDecrypt } from '@fhevm/sdk';
 *
 * const client = await createFhevmClient({
 *   provider: window.ethereum,
 *   network: 'sepolia',
 *   contractAddress: '0x...'
 * });
 *
 * const encrypted = await encryptInput(client, 42);
 * const decrypted = await userDecrypt(client, encryptedValue);
 * ```
 */

export * from './core/client';
export * from './core/encryption';
export * from './core/decryption';
export * from './core/types';
export * from './core/utils';

// Re-export for convenience
export { createFhevmClient } from './core/client';
export { encryptInput, encryptUint8, encryptUint16, encryptUint32, encryptUint64, encryptBool } from './core/encryption';
export { userDecrypt, publicDecrypt, batchDecrypt } from './core/decryption';
export { isAddress, formatAddress, parseEIP712Signature } from './core/utils';

// Export types
export type {
  FhevmClient,
  FhevmConfig,
  EncryptedValue,
  DecryptionResult,
  ContractCallParams,
  NetworkConfig
} from './core/types';
