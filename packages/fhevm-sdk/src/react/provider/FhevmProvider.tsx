/**
 * FHEVM Provider for React applications
 * Provides FHEVM client context to all child components
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { FhevmClient, FhevmConfig, InitOptions } from '../../core/types';
import { createFhevmClient } from '../../core/client';

/**
 * FHEVM Context
 */
interface FhevmContextValue {
  client: FhevmClient | null;
  isLoading: boolean;
  error: Error | null;
}

const FhevmContext = createContext<FhevmContextValue | undefined>(undefined);

/**
 * Provider props
 */
export interface FhevmProviderProps {
  config: FhevmConfig;
  options?: InitOptions;
  children: ReactNode;
}

/**
 * FHEVM Provider Component
 *
 * @example
 * ```tsx
 * import { FhevmProvider } from '@fhevm/sdk/react';
 *
 * function App() {
 *   return (
 *     <FhevmProvider
 *       config={{
 *         provider: window.ethereum,
 *         network: 'sepolia',
 *         contractAddress: '0x...'
 *       }}
 *     >
 *       <YourApp />
 *     </FhevmProvider>
 *   );
 * }
 * ```
 */
export function FhevmProvider({ config, options, children }: FhevmProviderProps) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializeClient() {
      try {
        setIsLoading(true);
        setError(null);

        const fhevmClient = await createFhevmClient(config, options);

        if (!cancelled) {
          setClient(fhevmClient);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          console.error('[FHEVM Provider] Initialization failed:', err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    initializeClient();

    return () => {
      cancelled = true;
    };
  }, [config.network, config.provider, config.contractAddress]);

  const value: FhevmContextValue = {
    client,
    isLoading,
    error
  };

  return <FhevmContext.Provider value={value}>{children}</FhevmContext.Provider>;
}

/**
 * Hook to use FHEVM context
 *
 * @throws Error if used outside FhevmProvider
 */
export function useFhevmContext(): FhevmContextValue {
  const context = useContext(FhevmContext);

  if (context === undefined) {
    throw new Error('useFhevmContext must be used within FhevmProvider');
  }

  return context;
}
