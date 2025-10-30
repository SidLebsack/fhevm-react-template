'use client';

import { useEncrypt } from '@fhevm/sdk/react';
import { useState, useCallback } from 'react';
import { validateEncryptionValue, sanitizeInput } from '../lib/utils/security';

/**
 * Enhanced encryption hook with validation and error handling
 */
export function useEncryption() {
  const { encrypt, isEncrypting, error } = useEncrypt();
  const [encryptionHistory, setEncryptionHistory] = useState<Array<{
    value: number;
    encrypted: string;
    timestamp: Date;
  }>>([]);

  const encryptWithValidation = useCallback(async (
    value: number | string,
    type: 'euint8' | 'euint16' | 'euint32' | 'euint64' = 'euint32',
    options?: { generateProof?: boolean }
  ) => {
    // Sanitize input
    const sanitized = sanitizeInput(value);
    if (sanitized === null) {
      throw new Error('Invalid input value');
    }

    // Validate value bounds
    const validation = validateEncryptionValue(sanitized, type);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Perform encryption
    const result = await encrypt(sanitized, options);

    if (result) {
      // Add to history
      setEncryptionHistory(prev => [
        {
          value: sanitized,
          encrypted: result.data,
          timestamp: new Date()
        },
        ...prev.slice(0, 9) // Keep last 10
      ]);
    }

    return result;
  }, [encrypt]);

  const clearHistory = useCallback(() => {
    setEncryptionHistory([]);
  }, []);

  return {
    encrypt: encryptWithValidation,
    isEncrypting,
    error,
    encryptionHistory,
    clearHistory
  };
}
