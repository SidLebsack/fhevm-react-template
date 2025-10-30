import { NextRequest, NextResponse } from 'next/server';
import { createFhevmClient, encryptInput } from '@fhevm/sdk';

/**
 * Encryption API Endpoint
 * Encrypts values using FHE on the server side
 */
export async function POST(request: NextRequest) {
  try {
    const { value, type = 'uint32' } = await request.json();

    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Value is required for encryption' },
        { status: 400 }
      );
    }

    // Initialize FHEVM client
    const client = await createFhevmClient({
      network: 'sepolia',
      contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844'
    });

    // Encrypt the value
    const encrypted = await encryptInput(client, value);

    return NextResponse.json({
      success: true,
      encrypted: {
        data: encrypted.data,
        inputProof: encrypted.inputProof
      },
      metadata: {
        originalType: type,
        encryptedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Encryption API Error:', error);
    return NextResponse.json(
      {
        error: 'Encryption failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/fhe/encrypt',
    method: 'POST',
    description: 'Encrypt values using Fully Homomorphic Encryption',
    parameters: {
      value: 'number - The value to encrypt',
      type: 'string - (Optional) The encryption type (default: uint32)'
    }
  });
}
