/**
 * React hooks and providers for FHEVM SDK
 * Provides wagmi-like API structure for React applications
 */

export * from './hooks/useFhevmClient';
export * from './hooks/useEncrypt';
export * from './hooks/useDecrypt';
export * from './hooks/useContractCall';
export * from './provider/FhevmProvider';

// Re-export types
export type { FhevmProviderProps } from './provider/FhevmProvider';
