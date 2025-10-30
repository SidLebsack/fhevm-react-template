import React, { useState } from 'react';
import { useContractCall } from '@fhevm/sdk/react';
import { Contract, BrowserProvider } from 'ethers';

const CONTRACT_ABI = [
  "function registerMember(string _membershipType)",
  "function getMemberInfo(address _member) view returns (bool, uint256, string, uint256)",
];

interface MemberRegistrationProps {
  contractAddress: string;
}

export const MemberRegistration: React.FC<MemberRegistrationProps> = ({
  contractAddress,
}) => {
  const [membershipType, setMembershipType] = useState('Basic');
  const [status, setStatus] = useState<{ message: string; type: string } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const { call } = useContractCall();

  const registerMember = async () => {
    try {
      setIsRegistering(true);
      setStatus({ message: 'Registering member...', type: 'info' });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);

      const tx = await contract.registerMember(membershipType);
      setStatus({ message: 'Transaction submitted, waiting for confirmation...', type: 'info' });

      await tx.wait();

      setStatus({
        message: `Successfully registered as ${membershipType} member!`,
        type: 'success',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      setStatus({
        message: `Error: ${error.message || 'Failed to register'}`,
        type: 'error',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const loadMemberInfo = async () => {
    try {
      setStatus({ message: 'Loading member info...', type: 'info' });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);

      const address = await signer.getAddress();
      const info = await contract.getMemberInfo(address);

      setMemberInfo({
        isRegistered: info[0],
        workoutCount: info[1].toString(),
        membershipType: info[2],
        registrationTime: new Date(Number(info[3]) * 1000).toLocaleString(),
      });

      setStatus({ message: 'Member info loaded successfully!', type: 'success' });
    } catch (error: any) {
      console.error('Load error:', error);
      setStatus({
        message: `Error: ${error.message || 'Failed to load member info'}`,
        type: 'error',
      });
    }
  };

  return (
    <div className="card">
      <h2>👤 Member Registration</h2>

      <div className="form-group">
        <label htmlFor="membershipType">Membership Type:</label>
        <select
          id="membershipType"
          value={membershipType}
          onChange={(e) => setMembershipType(e.target.value)}
          disabled={isRegistering}
        >
          <option value="Basic">Basic</option>
          <option value="Premium">Premium</option>
          <option value="Elite">Elite</option>
          <option value="Corporate">Corporate</option>
        </select>
      </div>

      <button
        className="btn"
        onClick={registerMember}
        disabled={isRegistering}
      >
        {isRegistering ? 'Registering...' : '📝 Register Member'}
      </button>

      <button
        className="btn btn-secondary"
        onClick={loadMemberInfo}
        style={{ marginLeft: '10px' }}
      >
        📊 View My Info
      </button>

      {status && (
        <div className={`status-message status-${status.type}`}>
          {status.message}
        </div>
      )}

      {memberInfo && (
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
          <h3 style={{ color: '#00ffea', marginBottom: '10px' }}>Member Information</h3>
          <p><strong>Registered:</strong> {memberInfo.isRegistered ? 'Yes' : 'No'}</p>
          <p><strong>Membership Type:</strong> {memberInfo.membershipType}</p>
          <p><strong>Workout Count:</strong> {memberInfo.workoutCount}</p>
          <p><strong>Registration Date:</strong> {memberInfo.registrationTime}</p>
        </div>
      )}
    </div>
  );
};
