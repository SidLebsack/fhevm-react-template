'use client';

import React, { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

/**
 * Computation Demo Component
 * Demonstrates homomorphic computations on encrypted data
 */
export const ComputationDemo: React.FC = () => {
  const { encrypt, isEncrypting } = useEncrypt();
  const [value1, setValue1] = useState<string>('');
  const [value2, setValue2] = useState<string>('');
  const [operation, setOperation] = useState<'add' | 'subtract' | 'multiply'>('add');
  const [result, setResult] = useState<{
    encrypted1: string;
    encrypted2: string;
    operation: string;
  } | null>(null);

  const handleCompute = async () => {
    if (!value1 || !value2) return;

    try {
      const encrypted1 = await encrypt(Number(value1));
      const encrypted2 = await encrypt(Number(value2));

      if (encrypted1 && encrypted2) {
        setResult({
          encrypted1: encrypted1.data,
          encrypted2: encrypted2.data,
          operation
        });
      }
    } catch (err) {
      console.error('Computation failed:', err);
    }
  };

  const operationSymbols = {
    add: '+',
    subtract: '-',
    multiply: '×'
  };

  return (
    <Card
      title="🧮 Homomorphic Computation Demo"
      description="Perform computations on encrypted data without decryption"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            label="First Value"
            placeholder="e.g., 10"
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
          />
          <Input
            type="number"
            label="Second Value"
            placeholder="e.g., 20"
            value={value2}
            onChange={(e) => setValue2(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Operation
          </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="add">Addition (+)</option>
            <option value="subtract">Subtraction (-)</option>
            <option value="multiply">Multiplication (×)</option>
          </select>
        </div>

        <Button
          variant="success"
          size="md"
          onClick={handleCompute}
          disabled={!value1 || !value2 || isEncrypting}
          loading={isEncrypting}
          className="w-full"
        >
          {isEncrypting ? 'Processing...' : `Compute ${operationSymbols[operation]}`}
        </Button>

        {result && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
            <p className="text-sm font-semibold text-purple-800">✅ Computation Ready</p>
            <div className="text-xs space-y-2">
              <p className="text-gray-700">
                <strong>Operation:</strong> Value1 {operationSymbols[result.operation]} Value2
              </p>
              <p className="text-gray-600 font-mono">
                Encrypted values prepared for on-chain computation
              </p>
            </div>
            <div className="p-3 bg-white rounded border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">Encrypted Input 1:</p>
              <p className="text-xs font-mono text-gray-800 break-all">
                {result.encrypted1.slice(0, 80)}...
              </p>
            </div>
            <div className="p-3 bg-white rounded border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">Encrypted Input 2:</p>
              <p className="text-xs font-mono text-gray-800 break-all">
                {result.encrypted2.slice(0, 80)}...
              </p>
            </div>
          </div>
        )}

        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-xs text-indigo-800">
            <strong>🔬 How it works:</strong> Values are encrypted client-side, then
            computations are performed on-chain without ever decrypting the data.
            The result remains encrypted until the authorized user decrypts it.
          </p>
        </div>
      </div>
    </Card>
  );
};
