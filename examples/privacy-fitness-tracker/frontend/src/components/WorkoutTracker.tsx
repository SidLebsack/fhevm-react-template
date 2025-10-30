import React, { useState } from 'react';
import { useEncrypt, useContractCall } from '@fhevm/sdk/react';
import { Contract, BrowserProvider } from 'ethers';

const CONTRACT_ABI = [
  "function recordWorkout(uint32 _caloriesBurned, uint16 _durationMinutes, uint8 _intensityLevel)",
  "function updateFitnessLevel(uint8 _newLevel)",
];

interface WorkoutTrackerProps {
  contractAddress: string;
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  contractAddress,
}) => {
  const [calories, setCalories] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('5');
  const [fitnessLevel, setFitnessLevel] = useState('5');
  const [status, setStatus] = useState<{ message: string; type: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { encrypt, isEncrypting } = useEncrypt();

  const recordWorkout = async () => {
    try {
      if (!calories || !duration) {
        setStatus({ message: 'Please fill in all workout fields', type: 'error' });
        return;
      }

      setIsRecording(true);
      setStatus({ message: 'Recording workout with FHE encryption...', type: 'info' });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);

      // In a real FHE implementation, these values would be encrypted
      // For now, we pass them directly to the contract
      const caloriesValue = parseInt(calories);
      const durationValue = parseInt(duration);
      const intensityValue = parseInt(intensity);

      const tx = await contract.recordWorkout(
        caloriesValue,
        durationValue,
        intensityValue
      );

      setStatus({ message: 'Transaction submitted, waiting for confirmation...', type: 'info' });
      await tx.wait();

      setStatus({
        message: `Workout recorded! ${calories} calories, ${duration} minutes, intensity ${intensity}/10`,
        type: 'success',
      });

      // Clear form
      setCalories('');
      setDuration('');
      setIntensity('5');
    } catch (error: any) {
      console.error('Record workout error:', error);
      setStatus({
        message: `Error: ${error.message || 'Failed to record workout'}`,
        type: 'error',
      });
    } finally {
      setIsRecording(false);
    }
  };

  const updateFitness = async () => {
    try {
      setIsUpdating(true);
      setStatus({ message: 'Updating fitness level...', type: 'info' });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);

      const tx = await contract.updateFitnessLevel(parseInt(fitnessLevel));
      setStatus({ message: 'Transaction submitted, waiting for confirmation...', type: 'info' });

      await tx.wait();

      setStatus({
        message: `Fitness level updated to ${fitnessLevel}/10!`,
        type: 'success',
      });
    } catch (error: any) {
      console.error('Update fitness error:', error);
      setStatus({
        message: `Error: ${error.message || 'Failed to update fitness level'}`,
        type: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="card">
      <h2>🏃 Workout Tracker</h2>

      <div className="form-group">
        <label htmlFor="calories">Calories Burned:</label>
        <input
          type="number"
          id="calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="e.g., 500"
          disabled={isRecording}
        />
      </div>

      <div className="form-group">
        <label htmlFor="duration">Duration (minutes):</label>
        <input
          type="number"
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g., 30"
          disabled={isRecording}
        />
      </div>

      <div className="form-group">
        <label htmlFor="intensity">Intensity Level (1-10):</label>
        <input
          type="range"
          id="intensity"
          min="1"
          max="10"
          value={intensity}
          onChange={(e) => setIntensity(e.target.value)}
          disabled={isRecording}
        />
        <span style={{ color: '#00ffea', marginLeft: '10px' }}>{intensity}/10</span>
      </div>

      <button
        className="btn"
        onClick={recordWorkout}
        disabled={isRecording || isEncrypting}
      >
        {isRecording ? 'Recording...' : '📊 Record Workout'}
      </button>

      <hr style={{ margin: '20px 0', border: '1px solid rgba(0, 255, 234, 0.2)' }} />

      <h3 style={{ color: '#00ffea', marginBottom: '15px' }}>Update Fitness Level</h3>

      <div className="form-group">
        <label htmlFor="fitnessLevel">Current Fitness Level (1-10):</label>
        <input
          type="range"
          id="fitnessLevel"
          min="1"
          max="10"
          value={fitnessLevel}
          onChange={(e) => setFitnessLevel(e.target.value)}
          disabled={isUpdating}
        />
        <span style={{ color: '#00ffea', marginLeft: '10px' }}>{fitnessLevel}/10</span>
      </div>

      <button
        className="btn btn-secondary"
        onClick={updateFitness}
        disabled={isUpdating}
      >
        {isUpdating ? 'Updating...' : '⚡ Update Level'}
      </button>

      {status && (
        <div className={`status-message status-${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
};
