'use client';

import React from 'react';
import { FhevmProvider as SDKFhevmProvider } from '@fhevm/sdk/react';

export interface FHEProviderProps {
  children: React.ReactNode;
  contractAddress?: string;
  network?: 'sepolia' | 'localhost' | string;
}

/**
 * FHE Provider Component
 * Wraps the application with FHEVM SDK context
 * Re-exports the SDK provider with custom defaults
 */
export const FHEProvider: React.FC<FHEProviderProps> = ({
  children,
  contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844',
  network = 'sepolia'
}) => {
  return (
    <SDKFhevmProvider
      config={{
        provider: typeof window !== 'undefined' ? window.ethereum : null,
        network,
        contractAddress
      }}
    >
      {children}
    </SDKFhevmProvider>
  );
};
