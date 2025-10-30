import React, { useState } from 'react';
import { Contract, BrowserProvider, parseEther } from 'ethers';

const CONTRACT_ABI = [
  "function createChallenge(string _challengeName, uint32 _targetCalories, uint16 _durationDays) payable",
  "function joinChallenge(uint256 _challengeId)",
  "function getChallengeInfo(uint256 _challengeId) view returns (string, uint256, uint256, uint256, bool, uint256)",
  "function challengeCount() view returns (uint256)",
];

interface ChallengeManagerProps {
  contractAddress: string;
}

export const ChallengeManager: React.FC<ChallengeManagerProps> = ({
  contractAddress,
}) => {
  const [challengeName, setChallengeName] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [prizeAmount, setPrizeAmount] = useState('');
  const [joinChallengeId, setJoinChallengeId] = useState('');
  const [viewChallengeId, setViewChallengeId] = useState('');
  const [challengeInfo, setChallengeInfo] = useState<any>(null);
  const [status, setStatus] = useState<{ message: string; type: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const createChallenge = async () => {
    try {
      if (!challengeName || !targetCalories || !durationDays || !prizeAmount) {
        setStatus({ message: 'Please fill in all challenge fields', type: 'error' });
        return;
      }

      setIsCreating(true);
      setStatus({ message: 'Creating challenge...', type: 'info' });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);

      const tx = await contract.createChallenge(
        challengeName,
        parseInt(targetCalories),
        parseInt(durationDays),
        { value: parseEther(prizeAmount) }
      );

      setStatus({ message: 'Transaction submitted, waiting for confirmation...', type: 'info' });
      await tx.wait();

      setStatus({
        message: `Challenge "${challengeName}" created with ${prizeAmount} ETH prize pool!`,
        type: 'success',
      });

      // Clear form
      setChallengeName('');
      setTargetCalories('');
      setDurationDays('');
      setPrizeAmount('');
    } catch (error: any) {
      console.error('Create challenge error:', error);
      setStatus({
        message: `Error: ${error.message || 'Failed to create challenge'}`,
        type: 'error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const joinChallenge = async () => {
    try {
      if (!joinChallengeId) {
        setStatus({ message: 'Please enter a challenge ID', type: 'error' });
        return;
      }

      setIsJoining(true);
      setStatus({ message: 'Joining challenge...', type: 'info' });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);

      const tx = await contract.joinChallenge(parseInt(joinChallengeId));
      setStatus({ message: 'Transaction submitted, waiting for confirmation...', type: 'info' });

      await tx.wait();

      setStatus({
        message: `Successfully joined challenge #${joinChallengeId}!`,
        type: 'success',
      });

      setJoinChallengeId('');
    } catch (error: any) {
      console.error('Join challenge error:', error);
      setStatus({
        message: `Error: ${error.message || 'Failed to join challenge'}`,
        type: 'error',
      });
    } finally {
      setIsJoining(false);
    }
  };

  const viewChallenge = async () => {
    try {
      if (!viewChallengeId) {
        setStatus({ message: 'Please enter a challenge ID', type: 'error' });
        return;
      }

      setStatus({ message: 'Loading challenge info...', type: 'info' });

      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(contractAddress, CONTRACT_ABI, provider);

      const info = await contract.getChallengeInfo(parseInt(viewChallengeId));

      setChallengeInfo({
        name: info[0],
        targetCalories: info[1].toString(),
        durationDays: info[2].toString(),
        prizePool: info[3].toString(),
        isActive: info[4],
        participantCount: info[5].toString(),
      });

      setStatus({ message: 'Challenge info loaded!', type: 'success' });
    } catch (error: any) {
      console.error('View challenge error:', error);
      setStatus({
        message: `Error: ${error.message || 'Failed to load challenge'}`,
        type: 'error',
      });
      setChallengeInfo(null);
    }
  };

  return (
    <div className="card">
      <h2>🏆 Challenge Manager</h2>

      <h3 style={{ color: '#00ffea', marginBottom: '15px' }}>Create Challenge</h3>

      <div className="form-group">
        <label htmlFor="challengeName">Challenge Name:</label>
        <input
          type="text"
          id="challengeName"
          value={challengeName}
          onChange={(e) => setChallengeName(e.target.value)}
          placeholder="e.g., Summer Burn Challenge"
          disabled={isCreating}
        />
      </div>

      <div className="form-group">
        <label htmlFor="targetCalories">Target Calories:</label>
        <input
          type="number"
          id="targetCalories"
          value={targetCalories}
          onChange={(e) => setTargetCalories(e.target.value)}
          placeholder="e.g., 10000"
          disabled={isCreating}
        />
      </div>

      <div className="form-group">
        <label htmlFor="durationDays">Duration (days):</label>
        <input
          type="number"
          id="durationDays"
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
          placeholder="e.g., 30"
          disabled={isCreating}
        />
      </div>

      <div className="form-group">
        <label htmlFor="prizeAmount">Prize Pool (ETH):</label>
        <input
          type="text"
          id="prizeAmount"
          value={prizeAmount}
          onChange={(e) => setPrizeAmount(e.target.value)}
          placeholder="e.g., 0.1"
          disabled={isCreating}
        />
      </div>

      <button
        className="btn"
        onClick={createChallenge}
        disabled={isCreating}
      >
        {isCreating ? 'Creating...' : '🎯 Create Challenge'}
      </button>

      <hr style={{ margin: '20px 0', border: '1px solid rgba(0, 255, 234, 0.2)' }} />

      <h3 style={{ color: '#00ffea', marginBottom: '15px' }}>Join Challenge</h3>

      <div className="form-group">
        <label htmlFor="joinChallengeId">Challenge ID:</label>
        <input
          type="number"
          id="joinChallengeId"
          value={joinChallengeId}
          onChange={(e) => setJoinChallengeId(e.target.value)}
          placeholder="e.g., 0"
          disabled={isJoining}
        />
      </div>

      <button
        className="btn btn-secondary"
        onClick={joinChallenge}
        disabled={isJoining}
      >
        {isJoining ? 'Joining...' : '🤝 Join Challenge'}
      </button>

      <hr style={{ margin: '20px 0', border: '1px solid rgba(0, 255, 234, 0.2)' }} />

      <h3 style={{ color: '#00ffea', marginBottom: '15px' }}>View Challenge</h3>

      <div className="form-group">
        <label htmlFor="viewChallengeId">Challenge ID:</label>
        <input
          type="number"
          id="viewChallengeId"
          value={viewChallengeId}
          onChange={(e) => setViewChallengeId(e.target.value)}
          placeholder="e.g., 0"
        />
      </div>

      <button className="btn btn-secondary" onClick={viewChallenge}>
        👀 View Details
      </button>

      {challengeInfo && (
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
          <h3 style={{ color: '#00ffea', marginBottom: '10px' }}>Challenge Details</h3>
          <p><strong>Name:</strong> {challengeInfo.name}</p>
          <p><strong>Target Calories:</strong> {challengeInfo.targetCalories}</p>
          <p><strong>Duration:</strong> {challengeInfo.durationDays} days</p>
          <p><strong>Prize Pool:</strong> {(BigInt(challengeInfo.prizePool) / BigInt(10**18)).toString()} ETH</p>
          <p><strong>Status:</strong> {challengeInfo.isActive ? '✅ Active' : '❌ Inactive'}</p>
          <p><strong>Participants:</strong> {challengeInfo.participantCount}</p>
        </div>
      )}

      {status && (
        <div className={`status-message status-${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
};
