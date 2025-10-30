'use client';

import React, { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

/**
 * Encryption Demo Component
 * Demonstrates FHE encryption capabilities
 */
export const EncryptionDemo: React.FC = () => {
  const { encrypt, isEncrypting, error } = useEncrypt();
  const [value, setValue] = useState<string>('');
  const [encryptedData, setEncryptedData] = useState<string>('');
  const [inputProof, setInputProof] = useState<string>('');

  const handleEncrypt = async () => {
    if (!value) return;

    try {
      const result = await encrypt(Number(value), { generateProof: true });
      if (result) {
        setEncryptedData(result.data);
        setInputProof(result.inputProof || '');
      }
    } catch (err) {
      console.error('Encryption failed:', err);
    }
  };

  return (
    <Card
      title="🔐 Encryption Demo"
      description="Encrypt sensitive data using Fully Homomorphic Encryption"
    >
      <div className="space-y-4">
        <Input
          type="number"
          label="Value to Encrypt"
          placeholder="Enter a number (e.g., 42)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          helperText="This value will be encrypted using FHE"
        />

        <Button
          variant="primary"
          size="md"
          onClick={handleEncrypt}
          disabled={!value || isEncrypting}
          loading={isEncrypting}
          className="w-full"
        >
          {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">❌ Error: {error.message}</p>
          </div>
        )}

        {encryptedData && (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-800 mb-2">✅ Encryption Successful</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-600">Encrypted Data:</p>
                  <p className="text-xs font-mono text-gray-800 break-all mt-1">
                    {encryptedData.slice(0, 100)}...
                  </p>
                </div>
                {inputProof && (
                  <div>
                    <p className="text-xs font-medium text-gray-600">Input Proof:</p>
                    <p className="text-xs font-mono text-gray-800 break-all mt-1">
                      {inputProof.slice(0, 100)}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>ℹ️ Note:</strong> The encrypted data can be used in smart contracts
            for computations without revealing the original value.
          </p>
        </div>
      </div>
    </Card>
  );
};
