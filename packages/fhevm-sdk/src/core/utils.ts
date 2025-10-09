/**
 * Utility functions for FHEVM SDK
 */

import type { EncryptedValue } from './types';

/**
 * Check if a string is a valid Ethereum address
 */
export function isAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!isAddress(address)) {
    return address;
  }
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Convert encrypted value to contract input format
 */
export function toContractInput(encrypted: EncryptedValue): {
  data: string;
  inputProof: string;
} {
  return {
    data: encrypted.data,
    inputProof: encrypted.inputProof || '0x'
  };
}

/**
 * Parse contract event for encrypted handles
 */
export function parseEncryptedEvent(
  event: any,
  handleKeys: string[]
): Record<string, string> {
  const handles: Record<string, string> = {};

  for (const key of handleKeys) {
    if (event.args && event.args[key]) {
      handles[key] = event.args[key];
    }
  }

  return handles;
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  provider: any,
  txHash: string,
  confirmations: number = 1
): Promise<any> {
  const receipt = await provider.waitForTransaction(txHash, confirmations);
  return receipt;
}

/**
 * Format EIP-712 signature components
 */
export function parseEIP712Signature(signature: string): {
  r: string;
  s: string;
  v: number;
} {
  let sig = signature;
  if (!sig.startsWith('0x')) {
    sig = '0x' + sig;
  }

  if (sig.length !== 132) {
    throw new Error('Invalid signature length');
  }

  return {
    r: sig.slice(0, 66),
    s: '0x' + sig.slice(66, 130),
    v: parseInt(sig.slice(130, 132), 16)
  };
}

/**
 * Convert bigint to hex string
 */
export function bigintToHex(value: bigint): string {
  return '0x' + value.toString(16);
}

/**
 * Convert hex string to bigint
 */
export function hexToBigint(hex: string): bigint {
  return BigInt(hex);
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delayMs = baseDelay * Math.pow(2, i);
        await delay(delayMs);
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Format gas price in Gwei
 */
export function formatGwei(wei: bigint): string {
  const gwei = Number(wei) / 1e9;
  return gwei.toFixed(2) + ' Gwei';
}

/**
 * Format ether value
 */
export function formatEther(wei: bigint): string {
  const ether = Number(wei) / 1e18;
  return ether.toFixed(4) + ' ETH';
}

/**
 * Validate encrypted value
 */
export function isValidEncryptedValue(encrypted: EncryptedValue): boolean {
  return !!(
    encrypted &&
    encrypted.data &&
    encrypted.type &&
    encrypted.data.startsWith('0x')
  );
}

/**
 * Get type size in bits
 */
export function getTypeBits(type: EncryptedValue['type']): number {
  switch (type) {
    case 'euint8':
      return 8;
    case 'euint16':
      return 16;
    case 'euint32':
      return 32;
    case 'euint64':
      return 64;
    case 'ebool':
      return 1;
    case 'eaddress':
      return 160;
    default:
      return 256;
  }
}

/**
 * Get max value for type
 */
export function getMaxValue(type: EncryptedValue['type']): bigint {
  const bits = getTypeBits(type);
  return (1n << BigInt(bits)) - 1n;
}

/**
 * Validate value for type
 */
export function validateValueForType(
  value: number | bigint,
  type: EncryptedValue['type']
): boolean {
  const bigintValue = typeof value === 'bigint' ? value : BigInt(value);
  const maxValue = getMaxValue(type);

  return bigintValue >= 0n && bigintValue <= maxValue;
}
