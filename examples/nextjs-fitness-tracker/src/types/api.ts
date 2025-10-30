/**
 * API type definitions for Next.js API routes
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface EncryptionRequest {
  value: number;
  type?: 'euint8' | 'euint16' | 'euint32' | 'euint64';
}

export interface EncryptionResponse {
  encrypted: {
    data: string;
    inputProof: string;
  };
  metadata: {
    originalType: string;
    encryptedAt: string;
  };
}

export interface DecryptionRequest {
  handle: string;
  contractAddress: string;
  userAddress?: string;
  signature?: string;
  mode?: 'user' | 'public';
}

export interface DecryptionResponse {
  value: bigint | number;
  metadata: {
    mode: string;
    decryptedAt: string;
  };
}

export interface ComputationRequest {
  operation: 'add' | 'subtract' | 'multiply' | 'compare' | 'average';
  encryptedValues: string[];
  contractAddress?: string;
  functionName?: string;
}

export interface ComputationResponse {
  operation: string;
  inputCount: number;
  message: string;
  note: string;
  timestamp: string;
}

export interface KeyInfoRequest {
  action?: 'refresh';
}

export interface KeyInfoResponse {
  publicKey: {
    available: boolean;
    size: number;
  };
  metadata: {
    network: string;
    timestamp: string;
  };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
