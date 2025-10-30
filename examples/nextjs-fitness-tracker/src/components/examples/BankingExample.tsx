'use client';

import React, { useState } from 'react';
import { useEncrypt, useContractCall } from '@fhevm/sdk/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

/**
 * Banking Example Component
 * Demonstrates FHE for confidential financial transactions
 */
export const BankingExample: React.FC = () => {
  const { encrypt, isEncrypting } = useEncrypt();
  const { call, isLoading, txHash } = useContractCall();

  const [accountBalance, setAccountBalance] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('');

  const handleDeposit = async () => {
    if (!depositAmount) return;

    try {
      const encryptedAmount = await encrypt(Number(depositAmount), { generateProof: true });

      if (encryptedAmount) {
        // In a real scenario, this would call a smart contract
        console.log('Encrypted deposit:', encryptedAmount.data);
        alert(`✅ Deposited ${depositAmount} (encrypted)`);
        setDepositAmount('');
      }
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Failed to process deposit');
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount) return;

    try {
      const encryptedAmount = await encrypt(Number(transferAmount), { generateProof: true });

      if (encryptedAmount) {
        // In a real scenario, this would call a smart contract
        console.log('Encrypted transfer:', encryptedAmount.data);
        alert(`✅ Transferred ${transferAmount} (encrypted)`);
        setTransferAmount('');
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Failed to process transfer');
    }
  };

  return (
    <Card
      title="🏦 Confidential Banking"
      description="Private financial transactions using FHE"
      variant="gradient"
    >
      <div className="space-y-6">
        {/* Account Balance Display */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Account Balance</p>
              <p className="text-2xl font-bold text-gray-800">🔒 Encrypted</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Balance is encrypted and only visible to you
          </p>
        </div>

        {/* Deposit Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">💳 Deposit Funds</h4>
          <Input
            type="number"
            placeholder="Amount to deposit"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            icon={<span>$</span>}
          />
          <Button
            variant="success"
            size="md"
            onClick={handleDeposit}
            disabled={!depositAmount || isEncrypting}
            loading={isEncrypting}
            className="w-full"
          >
            {isEncrypting ? 'Encrypting...' : 'Deposit (Encrypted)'}
          </Button>
        </div>

        {/* Transfer Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">💸 Transfer Funds</h4>
          <Input
            type="number"
            placeholder="Amount to transfer"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            icon={<span>$</span>}
          />
          <Button
            variant="primary"
            size="md"
            onClick={handleTransfer}
            disabled={!transferAmount || isEncrypting}
            loading={isEncrypting}
            className="w-full"
          >
            {isEncrypting ? 'Encrypting...' : 'Transfer (Encrypted)'}
          </Button>
        </div>

        {/* Privacy Features */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-semibold text-green-800 mb-2">🔐 Privacy Features</h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>✅ Transaction amounts are fully encrypted</li>
            <li>✅ Balance remains private on the blockchain</li>
            <li>✅ Transfers processed without revealing amounts</li>
            <li>✅ Only authorized parties can decrypt balances</li>
            <li>✅ Computations performed on encrypted data</li>
          </ul>
        </div>

        {/* Use Cases */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>💡 Use Cases:</strong> Confidential payroll, private auctions,
            anonymous voting with stake, dark pools, and privacy-preserving DeFi protocols.
          </p>
        </div>
      </div>
    </Card>
  );
};
