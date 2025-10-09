/**
 * React hook for decrypting values
 */

import { useState, useCallback } from 'react';
import { useFhevmClient } from './useFhevmClient';
import { userDecrypt, publicDecrypt, batchDecrypt } from '../../core/decryption';
import type { DecryptionResult, DecryptionOptions, BatchDecryptionRequest } from '../../core/types';

/**
 * Hook for decrypting FHEVM encrypted values
 *
 * @example
 * ```tsx
 * function WorkoutStats() {
 *   const { decrypt, isDecrypting, error } = useDecrypt();
 *
 *   const handleDecrypt = async () => {
 *     const result = await decrypt(encryptedHandle, contractAddress);
 *     console.log('Decrypted calories:', result.value);
 *   };
 *
 *   return <button onClick={handleDecrypt}>Decrypt Value</button>;
 * }
 * ```
 */
export function useDecrypt() {
  const { client, isReady } = useFhevmClient();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (
      handle: string,
      contractAddress: string,
      options?: DecryptionOptions
    ): Promise<DecryptionResult | null> => {
      if (!isReady || !client) {
        const err = new Error('FHEVM client not ready');
        setError(err);
        return null;
      }

      try {
        setIsDecrypting(true);
        setError(null);

        const result = await userDecrypt(client, handle, contractAddress, options);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('[useDecrypt] Decryption failed:', error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client, isReady]
  );

  const decryptPublic = useCallback(
    async (handle: string, options?: DecryptionOptions): Promise<DecryptionResult | null> => {
      if (!isReady || !client) {
        const err = new Error('FHEVM client not ready');
        setError(err);
        return null;
      }

      try {
        setIsDecrypting(true);
        setError(null);

        const result = await publicDecrypt(client, handle, options);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('[useDecrypt] Public decryption failed:', error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client, isReady]
  );

  const decryptBatch = useCallback(
    async (
      request: BatchDecryptionRequest,
      options?: DecryptionOptions
    ): Promise<DecryptionResult[] | null> => {
      if (!isReady || !client) {
        const err = new Error('FHEVM client not ready');
        setError(err);
        return null;
      }

      try {
        setIsDecrypting(true);
        setError(null);

        const results = await batchDecrypt(client, request, options);
        return results;
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('[useDecrypt] Batch decryption failed:', error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client, isReady]
  );

  return {
    decrypt,
    decryptPublic,
    decryptBatch,
    isDecrypting,
    error
  };
}
