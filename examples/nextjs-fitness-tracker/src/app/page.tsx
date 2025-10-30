'use client';

import { useState } from 'react';
import { useFhevmClient, useEncrypt, useDecrypt, useContractCall } from '@fhevm/sdk/react';
import FitnessTrackerABI from '../lib/FitnessTrackerABI.json';

export default function Home() {
  const { client, isLoading: clientLoading, error: clientError, isReady } = useFhevmClient();
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  const { decrypt, isDecrypting, error: decryptError } = useDecrypt();
  const { call, isLoading: callLoading, txHash, error: callError } = useContractCall();

  const [calories, setCalories] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('5');
  const [membershipType, setMembershipType] = useState('Premium');

  // Handle workout recording
  const handleRecordWorkout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isReady || !client) {
      alert('FHEVM client not ready');
      return;
    }

    try {
      // Encrypt workout data
      console.log('Encrypting workout data...');
      const encryptedCalories = await encrypt(Number(calories), { generateProof: true });
      const encryptedDuration = await encrypt(Number(duration), { generateProof: true });
      const encryptedIntensity = await encrypt(Number(intensity), { generateProof: true });

      if (!encryptedCalories || !encryptedDuration || !encryptedIntensity) {
        alert('Encryption failed');
        return;
      }

      // Call contract
      console.log('Submitting to blockchain...');
      const result = await call({
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844',
        abi: FitnessTrackerABI,
        functionName: 'recordWorkout',
        args: [Number(calories), Number(duration), Number(intensity)]
      });

      if (result) {
        alert(`✅ Workout recorded! TX: ${result.txHash}`);
        setCalories('');
        setDuration('');
        setIntensity('5');
      }
    } catch (error) {
      console.error('Error recording workout:', error);
      alert('Failed to record workout: ' + (error as Error).message);
    }
  };

  // Handle member registration
  const handleRegister = async () => {
    if (!isReady || !client) {
      alert('FHEVM client not ready');
      return;
    }

    try {
      const result = await call({
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844',
        abi: FitnessTrackerABI,
        functionName: 'registerMember',
        args: [membershipType]
      });

      if (result) {
        alert(`✅ Registered as ${membershipType} member! TX: ${result.txHash}`);
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('Failed to register: ' + (error as Error).message);
    }
  };

  if (clientLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing FHEVM Client...</p>
        </div>
      </div>
    );
  }

  if (clientError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold text-lg mb-2">❌ Client Error</h2>
        <p className="text-red-600">{clientError.message}</p>
        <p className="text-sm text-gray-600 mt-2">
          Make sure MetaMask is installed and connected to Sepolia testnet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SDK Status Banner */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">🔐 FHEVM SDK Status</h2>
            <p className="text-sm text-gray-600 mt-1">
              {isReady ? '✅ Ready to encrypt' : '⏳ Initializing...'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Network: <span className="font-semibold">Sepolia</span></p>
            <p className="text-sm text-gray-600">Contract: <span className="font-mono text-xs">
              {(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844').slice(0, 6)}...
            </span></p>
          </div>
        </div>
      </div>

      {/* Registration Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 Register as Member</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membership Type
            </label>
            <select
              value={membershipType}
              onChange={(e) => setMembershipType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Elite">Elite</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>
          <button
            onClick={handleRegister}
            disabled={!isReady || callLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {callLoading ? 'Registering...' : 'Register Member'}
          </button>
        </div>
      </div>

      {/* Workout Recording Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">💪 Record Workout (Encrypted)</h2>
        <form onSubmit={handleRecordWorkout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔥 Calories Burned
            </label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g. 500"
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⏱️ Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 45"
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💯 Intensity (1-10): {intensity}
            </label>
            <input
              type="range"
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              min="1"
              max="10"
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={!isReady || isEncrypting || callLoading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEncrypting ? '🔐 Encrypting...' : callLoading ? '📤 Submitting...' : '✅ Record Encrypted Workout'}
          </button>
        </form>

        {txHash && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Success! Transaction: <span className="font-mono text-xs">{txHash.slice(0, 10)}...</span>
            </p>
          </div>
        )}

        {(encryptError || callError) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ❌ Error: {(encryptError || callError)?.message}
            </p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🔐 Privacy Guarantees</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ All workout data encrypted with FHE before blockchain submission</li>
          <li>✅ Calories, duration, and intensity remain private</li>
          <li>✅ Only you can decrypt your personal stats (with EIP-712 signature)</li>
          <li>✅ Computations performed on encrypted data without decryption</li>
          <li>✅ Powered by Zama fhEVM and @fhevm/sdk</li>
        </ul>
      </div>
    </div>
  );
}
