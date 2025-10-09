/**
 * React hook for contract interactions with encrypted inputs
 */

import { useState, useCallback } from 'react';
import { Contract } from 'ethers';
import { useFhevmClient } from './useFhevmClient';
import type { ContractCallParams } from '../../core/types';

/**
 * Hook for calling smart contracts with encrypted inputs
 *
 * @example
 * ```tsx
 * function RecordWorkout() {
 *   const { call, isLoading, error, txHash } = useContractCall();
 *
 *   const recordWorkout = async (encryptedCalories: EncryptedValue) => {
 *     const result = await call({
 *       contractAddress: '0x...',
 *       abi: FitnessTrackerABI,
 *       functionName: 'recordWorkout',
 *       encryptedInputs: [encryptedCalories]
 *     });
 *
 *     console.log('Transaction hash:', result.txHash);
 *   };
 *
 *   return <button onClick={() => recordWorkout(encrypted)}>Record Workout</button>;
 * }
 * ```
 */
export function useContractCall() {
  const { client, isReady } = useFhevmClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const call = useCallback(
    async (params: ContractCallParams): Promise<{ txHash: string; receipt: any } | null> => {
      if (!isReady || !client) {
        const err = new Error('FHEVM client not ready');
        setError(err);
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        setTxHash(null);

        // Get signer
        const signer = await client.provider.getSigner();

        // Create contract instance
        const contract = new Contract(params.contractAddress, params.abi, signer);

        // Prepare arguments
        const args = params.args || [];

        // Add encrypted inputs to args
        if (params.encryptedInputs && params.encryptedInputs.length > 0) {
          for (const encrypted of params.encryptedInputs) {
            args.push(encrypted.data);
            if (encrypted.inputProof) {
              args.push(encrypted.inputProof);
            }
          }
        }

        // Call contract function
        const tx = await contract[params.functionName](...args, {
          value: params.value || 0n
        });

        setTxHash(tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();

        return {
          txHash: tx.hash,
          receipt
        };
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('[useContractCall] Contract call failed:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client, isReady]
  );

  const read = useCallback(
    async (params: ContractCallParams): Promise<any | null> => {
      if (!isReady || !client) {
        const err = new Error('FHEVM client not ready');
        setError(err);
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Create contract instance (no signer needed for read)
        const contract = new Contract(params.contractAddress, params.abi, client.provider);

        // Prepare arguments
        const args = params.args || [];

        // Call read function
        const result = await contract[params.functionName](...args);

        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('[useContractCall] Contract read failed:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client, isReady]
  );

  return {
    call,
    read,
    isLoading,
    error,
    txHash
  };
}
