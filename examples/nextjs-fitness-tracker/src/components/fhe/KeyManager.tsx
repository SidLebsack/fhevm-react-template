'use client';

import React, { useState, useEffect } from 'react';
import { useFhevmClient } from '@fhevm/sdk/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/**
 * Key Manager Component
 * Displays FHE key information and management options
 */
export const KeyManager: React.FC = () => {
  const { client, isReady, isLoading } = useFhevmClient();
  const [publicKeyInfo, setPublicKeyInfo] = useState<{
    available: boolean;
    size: number;
  } | null>(null);

  useEffect(() => {
    if (isReady && client) {
      try {
        const publicKey = client.instance.getPublicKey();
        setPublicKeyInfo({
          available: !!publicKey,
          size: publicKey ? publicKey.length : 0
        });
      } catch (error) {
        console.error('Failed to get public key:', error);
      }
    }
  }, [isReady, client]);

  const handleRefresh = async () => {
    if (client) {
      try {
        const publicKey = client.instance.getPublicKey();
        setPublicKeyInfo({
          available: !!publicKey,
          size: publicKey ? publicKey.length : 0
        });
      } catch (error) {
        console.error('Failed to refresh key info:', error);
      }
    }
  };

  return (
    <Card
      title="🔑 Key Manager"
      description="Manage FHE encryption keys and client information"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Client Status</p>
                <p className="text-lg font-semibold text-gray-800">
                  {isReady ? '✅ Ready' : '⏳ Initializing'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Network</p>
                <p className="text-lg font-semibold text-gray-800">Sepolia Testnet</p>
              </div>

              {publicKeyInfo && (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Public Key</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {publicKeyInfo.available ? '✅ Available' : '❌ Not Available'}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Key Size</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {publicKeyInfo.size > 0 ? `${publicKeyInfo.size} bytes` : 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={handleRefresh}
              disabled={!isReady}
              className="w-full"
            >
              🔄 Refresh Key Information
            </Button>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">📋 Key Information</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Public keys are used for encrypting data client-side</li>
                <li>• Private keys never leave the secure execution environment</li>
                <li>• All encryption happens locally in your browser</li>
                <li>• Keys are managed by the FHEVM network</li>
              </ul>
            </div>

            {client && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Contract Address:</p>
                <p className="text-xs font-mono text-gray-800 break-all">
                  {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
