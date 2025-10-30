'use client';

import { useState, useCallback } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';

export type ComputationOperation = 'add' | 'subtract' | 'multiply' | 'compare' | 'average';

export interface ComputationResult {
  operation: ComputationOperation;
  encryptedInputs: string[];
  timestamp: Date;
}

/**
 * Hook for homomorphic computation operations
 * Prepares encrypted inputs for on-chain computations
 */
export function useComputation() {
  const { encrypt, isEncrypting } = useEncrypt();
  const [isComputing, setIsComputing] = useState(false);
  const [lastComputation, setLastComputation] = useState<ComputationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const prepareComputation = useCallback(async (
    operation: ComputationOperation,
    values: number[]
  ): Promise<ComputationResult | null> => {
    if (values.length < 2) {
      setError(new Error('At least 2 values required for computation'));
      return null;
    }

    setIsComputing(true);
    setError(null);

    try {
      // Encrypt all input values
      const encryptedInputs: string[] = [];

      for (const value of values) {
        const encrypted = await encrypt(value);
        if (encrypted) {
          encryptedInputs.push(encrypted.data);
        } else {
          throw new Error(`Failed to encrypt value: ${value}`);
        }
      }

      const result: ComputationResult = {
        operation,
        encryptedInputs,
        timestamp: new Date()
      };

      setLastComputation(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Computation preparation failed');
      setError(error);
      return null;
    } finally {
      setIsComputing(false);
    }
  }, [encrypt]);

  const add = useCallback(async (a: number, b: number) => {
    return await prepareComputation('add', [a, b]);
  }, [prepareComputation]);

  const subtract = useCallback(async (a: number, b: number) => {
    return await prepareComputation('subtract', [a, b]);
  }, [prepareComputation]);

  const multiply = useCallback(async (a: number, b: number) => {
    return await prepareComputation('multiply', [a, b]);
  }, [prepareComputation]);

  const compare = useCallback(async (a: number, b: number) => {
    return await prepareComputation('compare', [a, b]);
  }, [prepareComputation]);

  const average = useCallback(async (values: number[]) => {
    return await prepareComputation('average', values);
  }, [prepareComputation]);

  return {
    // Generic computation
    prepareComputation,

    // Specific operations
    add,
    subtract,
    multiply,
    compare,
    average,

    // State
    isComputing: isComputing || isEncrypting,
    lastComputation,
    error
  };
}
