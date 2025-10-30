import React, { useState, useEffect } from 'react';
import { FhevmProvider } from '@fhevm/sdk/react';
import { WalletConnect } from './components/WalletConnect';
import { MemberRegistration } from './components/MemberRegistration';
import { WorkoutTracker } from './components/WorkoutTracker';
import { ChallengeManager } from './components/ChallengeManager';
import { ContractStats } from './components/ContractStats';

const CONTRACT_ADDRESS = "0x6Bbf52494089ce94859414D82d03f7c8a4cF1844";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');

  useEffect(() => {
    // Check if already connected
    if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
      setIsConnected(true);
      setAccount(window.ethereum.selectedAddress);
    }
  }, []);

  const handleConnect = (address: string) => {
    setIsConnected(true);
    setAccount(address);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAccount('');
  };

  return (
    <FhevmProvider
      config={{
        provider: typeof window !== 'undefined' ? window.ethereum : null,
        network: 'sepolia',
        contractAddress: CONTRACT_ADDRESS,
      }}
    >
      <div className="container">
        <div className="header">
          <h1>🏋️ Privacy Fitness Club</h1>
          <p>Confidential Member Tracking with FHE Technology</p>
        </div>

        <WalletConnect
          isConnected={isConnected}
          account={account}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />

        {isConnected && (
          <>
            <div className="main-content">
              <MemberRegistration contractAddress={CONTRACT_ADDRESS} />
              <WorkoutTracker contractAddress={CONTRACT_ADDRESS} />
            </div>

            <div className="main-content" style={{ marginTop: '30px' }}>
              <ChallengeManager contractAddress={CONTRACT_ADDRESS} />
              <ContractStats contractAddress={CONTRACT_ADDRESS} />
            </div>
          </>
        )}
      </div>
    </FhevmProvider>
  );
}

export default App;
