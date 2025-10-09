/**
 * FHEVM Encryption utilities
 */

import type { FhevmClient, EncryptedValue, EncryptionOptions } from './types';
import { getUserAddress } from './client';

/**
 * Encrypt input for FHEVM contract
 *
 * @example
 * ```typescript
 * const encrypted = await encryptInput(client, 42, { generateProof: true });
 * ```
 */
export async function encryptInput(
  client: FhevmClient,
  value: number | bigint | boolean,
  options?: EncryptionOptions
): Promise<EncryptedValue> {
  if (!client.fheInstance) {
    throw new Error('FHE instance not initialized');
  }

  // Determine type based on value
  let type: EncryptedValue['type'];
  let numericValue: number | bigint;

  if (typeof value === 'boolean') {
    type = 'ebool';
    numericValue = value ? 1 : 0;
  } else {
    numericValue = typeof value === 'bigint' ? value : BigInt(value);

    // Auto-detect type based on value range
    if (numericValue <= 255n) {
      type = 'euint8';
    } else if (numericValue <= 65535n) {
      type = 'euint16';
    } else if (numericValue <= 4294967295n) {
      type = 'euint32';
    } else {
      type = 'euint64';
    }
  }

  const userAddress = options?.userAddress || (await getUserAddress(client));

  // Encrypt using fhevmjs
  const encrypted = await client.fheInstance.encrypt(
    Number(numericValue),
    type.replace('e', ''), // Remove 'e' prefix
    userAddress
  );

  return {
    data: encrypted.data,
    inputProof: options?.generateProof ? encrypted.inputProof : undefined,
    type,
    handles: encrypted.handles
  };
}

/**
 * Encrypt uint8 value (0-255)
 */
export async function encryptUint8(
  client: FhevmClient,
  value: number,
  options?: EncryptionOptions
): Promise<EncryptedValue> {
  if (value < 0 || value > 255) {
    throw new Error('Value must be between 0 and 255 for uint8');
  }

  const userAddress = options?.userAddress || (await getUserAddress(client));

  const encrypted = await client.fheInstance.encrypt(value, 'uint8', userAddress);

  return {
    data: encrypted.data,
    inputProof: options?.generateProof ? encrypted.inputProof : undefined,
    type: 'euint8',
    handles: encrypted.handles
  };
}

/**
 * Encrypt uint16 value (0-65535)
 */
export async function encryptUint16(
  client: FhevmClient,
  value: number,
  options?: EncryptionOptions
): Promise<EncryptedValue> {
  if (value < 0 || value > 65535) {
    throw new Error('Value must be between 0 and 65535 for uint16');
  }

  const userAddress = options?.userAddress || (await getUserAddress(client));

  const encrypted = await client.fheInstance.encrypt(value, 'uint16', userAddress);

  return {
    data: encrypted.data,
    inputProof: options?.generateProof ? encrypted.inputProof : undefined,
    type: 'euint16',
    handles: encrypted.handles
  };
}

/**
 * Encrypt uint32 value (0-4294967295)
 */
export async function encryptUint32(
  client: FhevmClient,
  value: number,
  options?: EncryptionOptions
): Promise<EncryptedValue> {
  if (value < 0 || value > 4294967295) {
    throw new Error('Value must be between 0 and 4294967295 for uint32');
  }

  const userAddress = options?.userAddress || (await getUserAddress(client));

  const encrypted = await client.fheInstance.encrypt(value, 'uint32', userAddress);

  return {
    data: encrypted.data,
    inputProof: options?.generateProof ? encrypted.inputProof : undefined,
    type: 'euint32',
    handles: encrypted.handles
  };
}

/**
 * Encrypt uint64 value
 */
export async function encryptUint64(
  client: FhevmClient,
  value: bigint | number,
  options?: EncryptionOptions
): Promise<EncryptedValue> {
  const bigintValue = typeof value === 'bigint' ? value : BigInt(value);

  if (bigintValue < 0n) {
    throw new Error('Value must be non-negative for uint64');
  }

  const userAddress = options?.userAddress || (await getUserAddress(client));

  const encrypted = await client.fheInstance.encrypt(Number(bigintValue), 'uint64', userAddress);

  return {
    data: encrypted.data,
    inputProof: options?.generateProof ? encrypted.inputProof : undefined,
    type: 'euint64',
    handles: encrypted.handles
  };
}

/**
 * Encrypt boolean value
 */
export async function encryptBool(
  client: FhevmClient,
  value: boolean,
  options?: EncryptionOptions
): Promise<EncryptedValue> {
  const userAddress = options?.userAddress || (await getUserAddress(client));

  const encrypted = await client.fheInstance.encrypt(value ? 1 : 0, 'bool', userAddress);

  return {
    data: encrypted.data,
    inputProof: options?.generateProof ? encrypted.inputProof : undefined,
    type: 'ebool',
    handles: encrypted.handles
  };
}

/**
 * Batch encrypt multiple values
 */
export async function batchEncrypt(
  client: FhevmClient,
  values: Array<{ value: number | bigint | boolean; type?: EncryptedValue['type'] }>,
  options?: EncryptionOptions
): Promise<EncryptedValue[]> {
  const encrypted: EncryptedValue[] = [];

  for (const item of values) {
    const result = await encryptInput(client, item.value, options);
    encrypted.push(result);
  }

  return encrypted;
}
