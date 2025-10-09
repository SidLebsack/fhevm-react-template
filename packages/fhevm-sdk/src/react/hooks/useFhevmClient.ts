/**
 * React hook to access FHEVM client
 */

import { useFhevmContext } from '../provider/FhevmProvider';
import type { FhevmClient } from '../../core/types';

/**
 * Hook to access FHEVM client instance
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { client, isLoading, error } = useFhevmClient();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <div>Client ready!</div>;
 * }
 * ```
 */
export function useFhevmClient(): {
  client: FhevmClient | null;
  isLoading: boolean;
  error: Error | null;
  isReady: boolean;
} {
  const { client, isLoading, error } = useFhevmContext();

  return {
    client,
    isLoading,
    error,
    isReady: !!client && !isLoading && !error
  };
}
