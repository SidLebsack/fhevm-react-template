/**
 * FHEVM Decryption utilities
 */

import type {
  FhevmClient,
  DecryptionResult,
  DecryptionOptions,
  EIP712SignatureData,
  BatchDecryptionRequest
} from './types';
import { getUserAddress } from './client';

/**
 * User decrypt with EIP-712 signature
 *
 * @example
 * ```typescript
 * const result = await userDecrypt(client, encryptedHandle, contractAddress);
 * console.log('Decrypted value:', result.value);
 * ```
 */
export async function userDecrypt(
  client: FhevmClient,
  handle: string,
  contractAddress: string,
  options?: DecryptionOptions
): Promise<DecryptionResult> {
  if (!client.fheInstance) {
    throw new Error('FHE instance not initialized');
  }

  const signer = await client.provider.getSigner();
  const userAddress = await getUserAddress(client);

  try {
    // Generate EIP-712 signature for decryption permission
    const signature = await generateDecryptionSignature(
      client,
      userAddress,
      contractAddress,
      [handle]
    );

    // Request decryption from gateway
    const decryptedValue = await client.fheInstance.decrypt(
      handle,
      {
        signature,
        userAddress,
        contractAddress
      }
    );

    return {
      value: decryptedValue,
      encrypted: handle,
      type: 'euint32', // TODO: Auto-detect type
      success: true
    };
  } catch (error) {
    console.error('[FHEVM SDK] Decryption failed:', error);
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Public decrypt (no signature required)
 *
 * @example
 * ```typescript
 * const result = await publicDecrypt(client, encryptedHandle);
 * ```
 */
export async function publicDecrypt(
  client: FhevmClient,
  handle: string,
  options?: DecryptionOptions
): Promise<DecryptionResult> {
  if (!client.fheInstance) {
    throw new Error('FHE instance not initialized');
  }

  try {
    // Public decryption doesn't require signature
    const decryptedValue = await client.fheInstance.decryptPublic(handle);

    return {
      value: decryptedValue,
      encrypted: handle,
      type: 'euint32', // TODO: Auto-detect type
      success: true
    };
  } catch (error) {
    console.error('[FHEVM SDK] Public decryption failed:', error);
    throw new Error(`Public decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Batch decrypt multiple handles
 *
 * @example
 * ```typescript
 * const results = await batchDecrypt(client, {
 *   contractAddress: '0x...',
 *   handles: ['0x...', '0x...'],
 *   userAddress: '0x...'
 * });
 * ```
 */
export async function batchDecrypt(
  client: FhevmClient,
  request: BatchDecryptionRequest,
  options?: DecryptionOptions
): Promise<DecryptionResult[]> {
  if (!client.fheInstance) {
    throw new Error('FHE instance not initialized');
  }

  const results: DecryptionResult[] = [];

  // Generate single signature for all handles
  const signature = await generateDecryptionSignature(
    client,
    request.userAddress,
    request.contractAddress,
    request.handles
  );

  // Decrypt each handle
  for (const handle of request.handles) {
    try {
      const decryptedValue = await client.fheInstance.decrypt(handle, {
        signature,
        userAddress: request.userAddress,
        contractAddress: request.contractAddress
      });

      results.push({
        value: decryptedValue,
        encrypted: handle,
        type: 'euint32', // TODO: Auto-detect type
        success: true
      });
    } catch (error) {
      console.error(`[FHEVM SDK] Failed to decrypt handle ${handle}:`, error);
      results.push({
        value: 0n,
        encrypted: handle,
        type: 'euint32',
        success: false
      });
    }
  }

  return results;
}

/**
 * Generate EIP-712 signature for decryption permission
 */
async function generateDecryptionSignature(
  client: FhevmClient,
  userAddress: string,
  contractAddress: string,
  handles: string[]
): Promise<string> {
  const signer = await client.provider.getSigner();

  // EIP-712 domain
  const domain = {
    name: 'FHEVM Decryption',
    version: '1',
    chainId: client.network.chainId,
    verifyingContract: contractAddress
  };

  // EIP-712 types
  const types = {
    DecryptionPermission: [
      { name: 'userAddress', type: 'address' },
      { name: 'contractAddress', type: 'address' },
      { name: 'handles', type: 'bytes32[]' }
    ]
  };

  // Message to sign
  const message = {
    userAddress,
    contractAddress,
    handles
  };

  try {
    // Sign typed data
    const signature = await signer.signTypedData(domain, types, message);
    return signature;
  } catch (error) {
    console.error('[FHEVM SDK] Failed to generate signature:', error);
    throw new Error(`Failed to generate decryption signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify decryption signature
 */
export function verifyDecryptionSignature(
  signatureData: EIP712SignatureData,
  expectedUserAddress: string
): boolean {
  // TODO: Implement signature verification
  return signatureData.userAddress.toLowerCase() === expectedUserAddress.toLowerCase();
}

/**
 * Parse EIP-712 signature
 */
export function parseEIP712Signature(signature: string): {
  r: string;
  s: string;
  v: number;
} {
  if (!signature.startsWith('0x')) {
    signature = '0x' + signature;
  }

  if (signature.length !== 132) {
    throw new Error('Invalid signature length');
  }

  return {
    r: signature.slice(0, 66),
    s: '0x' + signature.slice(66, 130),
    v: parseInt(signature.slice(130, 132), 16)
  };
}
