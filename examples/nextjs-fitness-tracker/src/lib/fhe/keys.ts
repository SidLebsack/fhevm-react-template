import type { FhevmClient } from '@fhevm/sdk';

/**
 * Key management utilities for FHEVM
 */

export interface KeyInfo {
  publicKey: Uint8Array | null;
  keySize: number;
  isAvailable: boolean;
}

/**
 * Get public key information from FHEVM client
 */
export function getKeyInfo(client: FhevmClient): KeyInfo {
  try {
    const publicKey = client.instance.getPublicKey();
    return {
      publicKey,
      keySize: publicKey ? publicKey.length : 0,
      isAvailable: !!publicKey
    };
  } catch (error) {
    console.error('Failed to get key info:', error);
    return {
      publicKey: null,
      keySize: 0,
      isAvailable: false
    };
  }
}

/**
 * Validate that a client has a valid public key
 */
export function validatePublicKey(client: FhevmClient): boolean {
  const keyInfo = getKeyInfo(client);
  return keyInfo.isAvailable && keyInfo.keySize > 0;
}

/**
 * Format key for display (truncated)
 */
export function formatKey(key: Uint8Array | null, length: number = 16): string {
  if (!key) return 'N/A';

  const hex = Array.from(key)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (hex.length <= length) return hex;

  return `${hex.slice(0, length)}...${hex.slice(-8)}`;
}

/**
 * Get key strength indicator
 */
export function getKeyStrength(keySize: number): 'weak' | 'medium' | 'strong' {
  if (keySize === 0) return 'weak';
  if (keySize < 1024) return 'medium';
  return 'strong';
}
