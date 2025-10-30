import React, { useState } from 'react';
import { Contract, BrowserProvider } from 'ethers';

const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function totalMembers() view returns (uint256)",
  "function challengeCount() view returns (uint256)",
];

interface ContractStatsProps {
  contractAddress: string;
}

export const ContractStats: React.FC<ContractStatsProps> = ({
  contractAddress,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [status, setStatus] = useState<{ message: string; type: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setStatus({ message: 'Loading contract statistics...', type: 'info' });

      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(contractAddress, CONTRACT_ABI, provider);

      const owner = await contract.owner();
      const totalMembers = await contract.totalMembers();
      const challengeCount = await contract.challengeCount();

      setStats({
        owner,
        totalMembers: totalMembers.toString(),
        challengeCount: challengeCount.toString(),
        contractAddress,
      });

      setStatus({ message: 'Statistics loaded successfully!', type: 'success' });
    } catch (error: any) {
      console.error('Load stats error:', error);
      setStatus({
        message: `Error: ${error.message || 'Failed to load statistics'}`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>📊 Contract Statistics</h2>

      <button
        className="btn"
        onClick={loadStats}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : '📈 Load Stats'}
      </button>

      {status && (
        <div className={`status-message status-${status.type}`}>
          {status.message}
        </div>
      )}

      {stats && (
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
          <h3 style={{ color: '#00ffea', marginBottom: '15px' }}>Contract Information</h3>

          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#a8d0e6' }}>Contract Address:</strong>
            <p style={{ wordBreak: 'break-all', fontSize: '0.9em', color: '#e8e8e8' }}>
              {stats.contractAddress}
            </p>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#a8d0e6' }}>Owner:</strong>
            <p style={{ wordBreak: 'break-all', fontSize: '0.9em', color: '#e8e8e8' }}>
              {stats.owner}
            </p>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#a8d0e6' }}>Total Members:</strong>
            <p style={{ fontSize: '1.2em', color: '#00ffea', fontWeight: 'bold' }}>
              {stats.totalMembers}
            </p>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#a8d0e6' }}>Active Challenges:</strong>
            <p style={{ fontSize: '1.2em', color: '#00ffea', fontWeight: 'bold' }}>
              {stats.challengeCount}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
