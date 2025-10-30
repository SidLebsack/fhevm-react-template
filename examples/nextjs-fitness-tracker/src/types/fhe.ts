/**
 * FHE-related type definitions for the Next.js application
 */

import type { FhevmClient } from '@fhevm/sdk';

export type EncryptionType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool';

export interface EncryptedData {
  data: string;
  inputProof?: string;
  type?: EncryptionType;
  timestamp?: Date;
}

export interface DecryptedData {
  value: bigint | number;
  type?: EncryptionType;
  timestamp?: Date;
}

export interface FHEClientState {
  client: FhevmClient | null;
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface FHEOperationState {
  isProcessing: boolean;
  error: Error | null;
  result: any | null;
}

export interface EncryptionOptions {
  generateProof?: boolean;
  type?: EncryptionType;
}

export interface DecryptionOptions {
  mode?: 'user' | 'public';
  userAddress?: string;
  signature?: string;
}

export interface ContractCallParams {
  contractAddress: string;
  abi: any[];
  functionName: string;
  args?: any[];
  encryptedInputs?: EncryptedData[];
}

export interface TransactionResult {
  txHash: string;
  success: boolean;
  blockNumber?: number;
  error?: string;
}
