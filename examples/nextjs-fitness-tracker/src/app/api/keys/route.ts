import { NextRequest, NextResponse } from 'next/server';
import { createFhevmClient } from '@fhevm/sdk';

/**
 * Key Management API Endpoint
 * Handles FHE key generation and management
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize FHEVM client
    const client = await createFhevmClient({
      network: 'sepolia',
      contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844'
    });

    // Get public key information
    const publicKey = client.instance.getPublicKey();

    return NextResponse.json({
      success: true,
      publicKey: {
        available: !!publicKey,
        size: publicKey ? publicKey.length : 0
      },
      metadata: {
        network: 'sepolia',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Keys API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve keys',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'refresh') {
      // Refresh/regenerate client instance
      const client = await createFhevmClient({
        network: 'sepolia',
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844'
      });

      return NextResponse.json({
        success: true,
        message: 'Client instance refreshed',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Keys API Error:', error);
    return NextResponse.json(
      {
        error: 'Key management operation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
