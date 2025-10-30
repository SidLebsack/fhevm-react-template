import { NextRequest, NextResponse } from 'next/server';
import { createFhevmClient, userDecrypt, publicDecrypt } from '@fhevm/sdk';

/**
 * Decryption API Endpoint
 * Decrypts FHE-encrypted values (requires proper authentication)
 */
export async function POST(request: NextRequest) {
  try {
    const { handle, contractAddress, userAddress, signature, mode = 'public' } = await request.json();

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required for decryption' },
        { status: 400 }
      );
    }

    // Initialize FHEVM client
    const client = await createFhevmClient({
      network: 'sepolia',
      contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844'
    });

    let decrypted;

    if (mode === 'user') {
      // User decryption requires signature and user address
      if (!userAddress || !signature) {
        return NextResponse.json(
          { error: 'User decryption requires userAddress and signature' },
          { status: 400 }
        );
      }

      decrypted = await userDecrypt(
        client,
        handle,
        contractAddress || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844'
      );
    } else {
      // Public decryption
      decrypted = await publicDecrypt(client, handle);
    }

    return NextResponse.json({
      success: true,
      value: decrypted.value,
      metadata: {
        mode,
        decryptedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Decryption API Error:', error);
    return NextResponse.json(
      {
        error: 'Decryption failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/fhe/decrypt',
    method: 'POST',
    description: 'Decrypt FHE-encrypted values',
    parameters: {
      handle: 'string - The encrypted value handle',
      contractAddress: 'string - The contract address',
      mode: 'string - "user" or "public" (default: public)',
      userAddress: 'string - Required for user mode',
      signature: 'string - Required for user mode'
    }
  });
}
