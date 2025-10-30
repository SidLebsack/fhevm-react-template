/**
 * Type definitions for FHE operations
 */

export type EncryptionType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool';

export interface EncryptedValue {
  data: string;
  inputProof?: string;
  type?: EncryptionType;
}

export interface DecryptedValue {
  value: bigint | number;
  originalType?: EncryptionType;
}

export interface FHEOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  txHash?: string;
}

export interface ComputationParams {
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'compare';
  encryptedValues: string[];
  contractAddress?: string;
}

export interface KeyManagementParams {
  action: 'generate' | 'refresh' | 'revoke';
  keyType?: 'public' | 'private';
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  gatewayUrl?: string;
}

export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/'
  },
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545'
  }
};
