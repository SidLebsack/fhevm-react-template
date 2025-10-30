import { createFhevmClient as sdkCreateClient, encryptInput } from '@fhevm/sdk';
import type { FhevmClient, FhevmConfig } from '@fhevm/sdk';

/**
 * Client-side FHE operations
 * Wrapper functions for FHEVM SDK client operations
 */

/**
 * Initialize FHEVM client with default configuration
 */
export async function initializeFhevmClient(
  config?: Partial<FhevmConfig>
): Promise<FhevmClient> {
  const defaultConfig: FhevmConfig = {
    network: 'sepolia',
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844',
    provider: typeof window !== 'undefined' ? window.ethereum : null,
    ...config
  };

  return await sdkCreateClient(defaultConfig);
}

/**
 * Encrypt a value using the FHEVM client
 */
export async function encryptValue(
  client: FhevmClient,
  value: number,
  options?: { generateProof?: boolean }
) {
  return await encryptInput(client, value, options);
}

/**
 * Get public key from FHEVM client
 */
export function getPublicKey(client: FhevmClient): Uint8Array | null {
  try {
    return client.instance.getPublicKey();
  } catch (error) {
    console.error('Failed to get public key:', error);
    return null;
  }
}

/**
 * Check if client is ready for encryption operations
 */
export function isClientReady(client: FhevmClient | null): boolean {
  if (!client) return false;

  try {
    const publicKey = client.instance.getPublicKey();
    return !!publicKey;
  } catch {
    return false;
  }
}
