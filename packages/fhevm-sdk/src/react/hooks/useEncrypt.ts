/**
 * React hook for encrypting values
 */

import { useState, useCallback } from 'react';
import { useFhevmClient } from './useFhevmClient';
import { encryptInput, encryptUint8, encryptUint16, encryptUint32, encryptUint64, encryptBool } from '../../core/encryption';
import type { EncryptedValue, EncryptionOptions } from '../../core/types';

/**
 * Hook for encrypting values with FHEVM
 *
 * @example
 * ```tsx
 * function WorkoutForm() {
 *   const { encrypt, isEncrypting, error } = useEncrypt();
 *
 *   const handleSubmit = async () => {
 *     const encrypted = await encrypt(500, { generateProof: true });
 *     // Use encrypted.data in contract call
 *   };
 *
 *   return <button onClick={handleSubmit}>Encrypt & Submit</button>;
 * }
 * ```
 */
export function useEncrypt() {
  const { client, isReady } = useFhevmClient();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (
      value: number | bigint | boolean,
      options?: EncryptionOptions
    ): Promise<EncryptedValue | null> => {
      if (!isReady || !client) {
        const err = new Error('FHEVM client not ready');
        setError(err);
        return null;
      }

      try {
        setIsEncrypting(true);
        setError(null);

        const encrypted = await encryptInput(client, value, options);
        return encrypted;
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('[useEncrypt] Encryption failed:', error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client, isReady]
  );

  const encryptUint8Value = useCallback(
    async (value: number, options?: EncryptionOptions): Promise<EncryptedValue | null> => {
      if (!isReady || !client) {
        return null;
      }

      try {
        setIsEncrypting(true);
        setError(null);
        return await encryptUint8(client, value, options);
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client, isReady]
  );

  const encryptUint16Value = useCallback(
    async (value: number, options?: EncryptionOptions): Promise<EncryptedValue | null> => {
      if (!isReady || !client) {
        return null;
      }

      try {
        setIsEncrypting(true);
        setError(null);
        return await encryptUint16(client, value, options);
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client, isReady]
  );

  const encryptUint32Value = useCallback(
    async (value: number, options?: EncryptionOptions): Promise<EncryptedValue | null> => {
      if (!isReady || !client) {
        return null;
      }

      try {
        setIsEncrypting(true);
        setError(null);
        return await encryptUint32(client, value, options);
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client, isReady]
  );

  const encryptUint64Value = useCallback(
    async (value: bigint | number, options?: EncryptionOptions): Promise<EncryptedValue | null> => {
      if (!isReady || !client) {
        return null;
      }

      try {
        setIsEncrypting(true);
        setError(null);
        return await encryptUint64(client, value, options);
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client, isReady]
  );

  const encryptBoolValue = useCallback(
    async (value: boolean, options?: EncryptionOptions): Promise<EncryptedValue | null> => {
      if (!isReady || !client) {
        return null;
      }

      try {
        setIsEncrypting(true);
        setError(null);
        return await encryptBool(client, value, options);
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client, isReady]
  );

  return {
    encrypt,
    encryptUint8: encryptUint8Value,
    encryptUint16: encryptUint16Value,
    encryptUint32: encryptUint32Value,
    encryptUint64: encryptUint64Value,
    encryptBool: encryptBoolValue,
    isEncrypting,
    error
  };
}
