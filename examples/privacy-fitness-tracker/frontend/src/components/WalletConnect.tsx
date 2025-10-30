import React, { useState } from 'react';
import { BrowserProvider } from 'ethers';

interface WalletConnectProps {
  isConnected: boolean;
  account: string;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  isConnected,
  account,
  onConnect,
  onDisconnect,
}) => {
  const [status, setStatus] = useState<{ message: string; type: string }>({
    message: 'Welcome to Privacy Fitness Club! Connect your wallet to get started.',
    type: 'info',
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setStatus({ message: 'Connecting to wallet...', type: 'info' });

      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Get provider and network info
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      const address = accounts[0];
      onConnect(address);

      setStatus({
        message: `Connected to ${address.slice(0, 6)}...${address.slice(-4)} on ${network.name}`,
        type: 'success',
      });
    } catch (error: any) {
      console.error('Connection error:', error);
      setStatus({
        message: `Error: ${error.message || 'Failed to connect wallet'}`,
        type: 'error',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    onDisconnect();
    setStatus({
      message: 'Wallet disconnected. Connect again to continue.',
      type: 'info',
    });
  };

  return (
    <div className="wallet-section">
      {!isConnected ? (
        <>
          <button
            className="btn"
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
          </button>
          <div className={`status-message status-${status.type}`}>
            {status.message}
          </div>
        </>
      ) : (
        <>
          <p style={{ marginBottom: '15px', color: '#a8d0e6' }}>
            <strong>Connected:</strong> {account}
          </p>
          <button className="btn btn-secondary" onClick={disconnectWallet}>
            Disconnect
          </button>
          {status.type === 'success' && (
            <div className={`status-message status-${status.type}`}>
              {status.message}
            </div>
          )}
        </>
      )}
    </div>
  );
};
