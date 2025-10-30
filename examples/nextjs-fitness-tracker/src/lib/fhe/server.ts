import { createFhevmClient, encryptInput, publicDecrypt } from '@fhevm/sdk';
import type { FhevmClient } from '@fhevm/sdk';

/**
 * Server-side FHE operations
 * Functions for performing FHE operations on the server
 */

/**
 * Initialize server-side FHEVM client
 * Note: Server-side operations don't require a wallet provider
 */
export async function initializeServerClient(): Promise<FhevmClient> {
  return await createFhevmClient({
    network: 'sepolia',
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844'
  });
}

/**
 * Encrypt value on server side
 */
export async function serverEncrypt(value: number): Promise<{
  data: string;
  inputProof: string;
}> {
  const client = await initializeServerClient();
  const encrypted = await encryptInput(client, value);
  return {
    data: encrypted.data,
    inputProof: encrypted.inputProof || ''
  };
}

/**
 * Public decrypt operation (server-side)
 * For values that are publicly accessible
 */
export async function serverDecryptPublic(
  handle: string
): Promise<{ value: bigint }> {
  const client = await initializeServerClient();
  return await publicDecrypt(client, handle);
}

/**
 * Batch encrypt multiple values
 */
export async function batchEncrypt(values: number[]): Promise<Array<{
  data: string;
  inputProof: string;
}>> {
  const client = await initializeServerClient();
  const results = [];

  for (const value of values) {
    const encrypted = await encryptInput(client, value);
    results.push({
      data: encrypted.data,
      inputProof: encrypted.inputProof || ''
    });
  }

  return results;
}
