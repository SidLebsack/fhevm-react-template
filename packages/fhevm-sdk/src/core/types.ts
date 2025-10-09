/**
 * Core type definitions for FHEVM SDK
 */

import type { BrowserProvider, JsonRpcProvider, Signer } from 'ethers';

/**
 * Supported networks for FHEVM
 */
export type SupportedNetwork = 'sepolia' | 'localhost' | 'zama-devnet';

/**
 * Network configuration
 */
export interface NetworkConfig {
  name: SupportedNetwork;
  rpcUrl: string;
  chainId: number;
  gatewayUrl?: string;
  aclAddress?: string;
}

/**
 * FHEVM client configuration
 */
export interface FhevmConfig {
  /** Ethereum provider (window.ethereum, JsonRpcProvider, etc.) */
  provider: any;
  /** Network to connect to */
  network: SupportedNetwork;
  /** Contract address for ACL */
  contractAddress?: string;
  /** Custom gateway URL */
  gatewayUrl?: string;
  /** Optional signer */
  signer?: Signer;
}

/**
 * FHEVM client instance
 */
export interface FhevmClient {
  /** Network configuration */
  config: FhevmConfig;
  /** Ethers provider */
  provider: BrowserProvider | JsonRpcProvider;
  /** Signer instance */
  signer?: Signer;
  /** FHE instance from fhevmjs */
  fheInstance: any;
  /** Network info */
  network: NetworkConfig;
  /** Is client initialized */
  isInitialized: boolean;
}

/**
 * Encrypted value wrapper
 */
export interface EncryptedValue {
  /** Encrypted data as hex string */
  data: string;
  /** Input proof for contract verification */
  inputProof?: string;
  /** Original value type */
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool' | 'eaddress';
  /** Handles for the encrypted value */
  handles?: string[];
}

/**
 * Decryption result
 */
export interface DecryptionResult {
  /** Decrypted value */
  value: bigint | boolean | number;
  /** Original encrypted data */
  encrypted: string;
  /** Type of decrypted value */
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool' | 'eaddress';
  /** Success status */
  success: boolean;
}

/**
 * Contract call parameters
 */
export interface ContractCallParams {
  /** Contract address */
  contractAddress: string;
  /** Contract ABI */
  abi: any[];
  /** Function name to call */
  functionName: string;
  /** Function arguments */
  args?: any[];
  /** Encrypted inputs */
  encryptedInputs?: EncryptedValue[];
  /** Transaction value in wei */
  value?: bigint;
}

/**
 * EIP-712 signature data for decryption
 */
export interface EIP712SignatureData {
  /** User address */
  userAddress: string;
  /** Contract address */
  contractAddress: string;
  /** Signature */
  signature: string;
}

/**
 * Decryption permission
 */
export interface DecryptionPermission {
  /** Signature for EIP-712 */
  signature: string;
  /** Public key */
  publicKey: string;
  /** Handles to decrypt */
  handles: string[];
}

/**
 * Batch decryption request
 */
export interface BatchDecryptionRequest {
  /** Contract address */
  contractAddress: string;
  /** Handles to decrypt */
  handles: string[];
  /** User address requesting decryption */
  userAddress: string;
}

/**
 * SDK initialization options
 */
export interface InitOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Custom ACL address */
  aclAddress?: string;
  /** Cache FHE instance */
  cache?: boolean;
}

/**
 * Encryption options
 */
export interface EncryptionOptions {
  /** Generate input proof */
  generateProof?: boolean;
  /** User address for encryption */
  userAddress?: string;
}

/**
 * Decryption options
 */
export interface DecryptionOptions {
  /** Use public decryption (no signature required) */
  publicDecrypt?: boolean;
  /** Batch multiple decryptions */
  batch?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
}
