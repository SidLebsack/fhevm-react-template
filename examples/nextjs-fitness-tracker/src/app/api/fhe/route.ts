import { NextRequest, NextResponse } from 'next/server';
import { createFhevmClient, encryptInput } from '@fhevm/sdk';

/**
 * FHE Operations API Route
 * Handles encryption and FHE-related operations
 */
export async function POST(request: NextRequest) {
  try {
    const { operation, value, type } = await request.json();

    if (!operation || !value) {
      return NextResponse.json(
        { error: 'Missing required parameters: operation and value' },
        { status: 400 }
      );
    }

    // Initialize FHEVM client
    const client = await createFhevmClient({
      network: 'sepolia',
      contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844'
    });

    switch (operation) {
      case 'encrypt':
        const encrypted = await encryptInput(client, value);
        return NextResponse.json({
          success: true,
          data: encrypted.data,
          inputProof: encrypted.inputProof
        });

      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('FHE API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'FHE API is running',
    endpoints: {
      POST: {
        encrypt: 'Encrypt a value using FHE',
      }
    }
  });
}
