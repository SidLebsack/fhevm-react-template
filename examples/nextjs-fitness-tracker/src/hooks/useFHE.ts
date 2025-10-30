'use client';

import { useFhevmClient, useEncrypt, useDecrypt } from '@fhevm/sdk/react';
import { useState, useCallback } from 'react';

/**
 * Custom hook combining all FHE operations
 * Provides a unified interface for encryption, decryption, and client management
 */
export function useFHE() {
  const { client, isLoading: clientLoading, isReady, error: clientError } = useFhevmClient();
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  const { decrypt, isDecrypting, error: decryptError } = useDecrypt();

  const [lastOperation, setLastOperation] = useState<{
    type: 'encrypt' | 'decrypt' | null;
    timestamp: Date | null;
    success: boolean;
  }>({
    type: null,
    timestamp: null,
    success: false
  });

  const encryptValue = useCallback(async (
    value: number,
    options?: { generateProof?: boolean }
  ) => {
    try {
      const result = await encrypt(value, options);
      setLastOperation({
        type: 'encrypt',
        timestamp: new Date(),
        success: !!result
      });
      return result;
    } catch (error) {
      setLastOperation({
        type: 'encrypt',
        timestamp: new Date(),
        success: false
      });
      throw error;
    }
  }, [encrypt]);

  const decryptValue = useCallback(async (
    handle: string,
    contractAddress: string
  ) => {
    try {
      const result = await decrypt(handle, contractAddress);
      setLastOperation({
        type: 'decrypt',
        timestamp: new Date(),
        success: !!result
      });
      return result;
    } catch (error) {
      setLastOperation({
        type: 'decrypt',
        timestamp: new Date(),
        success: false
      });
      throw error;
    }
  }, [decrypt]);

  return {
    // Client state
    client,
    isReady,
    isInitializing: clientLoading,

    // Operations
    encrypt: encryptValue,
    decrypt: decryptValue,

    // Loading states
    isEncrypting,
    isDecrypting,
    isProcessing: isEncrypting || isDecrypting || clientLoading,

    // Errors
    error: clientError || encryptError || decryptError,
    clientError,
    encryptError,
    decryptError,

    // Operation history
    lastOperation
  };
}
