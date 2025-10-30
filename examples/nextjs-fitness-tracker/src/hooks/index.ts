/**
 * Custom hooks exports for the Next.js FHEVM example
 */

export { useFHE } from './useFHE';
export { useEncryption } from './useEncryption';
export { useComputation } from './useComputation';

// Re-export SDK hooks for convenience
export {
  useFhevmClient,
  useEncrypt,
  useDecrypt,
  useContractCall
} from '@fhevm/sdk/react';
