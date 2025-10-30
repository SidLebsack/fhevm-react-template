'use client';

import React, { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

/**
 * Medical Example Component
 * Demonstrates FHE for confidential health data management
 */
export const MedicalExample: React.FC = () => {
  const { encrypt, isEncrypting } = useEncrypt();

  const [heartRate, setHeartRate] = useState<string>('');
  const [bloodPressure, setBloodPressure] = useState<string>('');
  const [bloodSugar, setBloodSugar] = useState<string>('');
  const [records, setRecords] = useState<Array<{
    type: string;
    encrypted: string;
    timestamp: string;
  }>>([]);

  const handleRecordVital = async (type: string, value: string) => {
    if (!value) return;

    try {
      const encrypted = await encrypt(Number(value), { generateProof: true });

      if (encrypted) {
        const newRecord = {
          type,
          encrypted: encrypted.data.slice(0, 40) + '...',
          timestamp: new Date().toLocaleTimeString()
        };
        setRecords([newRecord, ...records].slice(0, 5));

        // Clear the input
        if (type === 'Heart Rate') setHeartRate('');
        if (type === 'Blood Pressure') setBloodPressure('');
        if (type === 'Blood Sugar') setBloodSugar('');

        alert(`✅ ${type} recorded securely (encrypted)`);
      }
    } catch (error) {
      console.error('Failed to record vital:', error);
      alert(`Failed to record ${type}`);
    }
  };

  return (
    <Card
      title="🏥 Confidential Health Records"
      description="Private medical data management using FHE"
      variant="gradient"
    >
      <div className="space-y-6">
        {/* Health Metrics Input */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">📊 Record Vital Signs</h4>

          {/* Heart Rate */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Heart rate (bpm)"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                icon={<span>❤️</span>}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleRecordVital('Heart Rate', heartRate)}
              disabled={!heartRate || isEncrypting}
              loading={isEncrypting}
            >
              Record
            </Button>
          </div>

          {/* Blood Pressure */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Blood pressure (mmHg)"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                icon={<span>🩺</span>}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleRecordVital('Blood Pressure', bloodPressure)}
              disabled={!bloodPressure || isEncrypting}
              loading={isEncrypting}
            >
              Record
            </Button>
          </div>

          {/* Blood Sugar */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Blood sugar (mg/dL)"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                icon={<span>🔬</span>}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleRecordVital('Blood Sugar', bloodSugar)}
              disabled={!bloodSugar || isEncrypting}
              loading={isEncrypting}
            >
              Record
            </Button>
          </div>
        </div>

        {/* Encrypted Records Display */}
        {records.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">📝 Recent Records (Encrypted)</h4>
            <div className="space-y-2">
              {records.map((record, index) => (
                <div
                  key={index}
                  className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800">{record.type}</p>
                    <p className="text-xs text-gray-500">{record.timestamp}</p>
                  </div>
                  <p className="text-xs font-mono text-gray-600 break-all">
                    🔒 {record.encrypted}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HIPAA Compliance Notice */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-semibold text-purple-800 mb-2">🔐 HIPAA-Level Privacy</h4>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>✅ All health data encrypted before storage</li>
            <li>✅ Patient records remain confidential on-chain</li>
            <li>✅ Only authorized medical staff can decrypt</li>
            <li>✅ Analytics performed on encrypted data</li>
            <li>✅ Complete audit trail without exposing data</li>
          </ul>
        </div>

        {/* Medical Use Cases */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Healthcare Use Cases</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>Electronic Health Records:</strong> Private patient histories</li>
            <li>• <strong>Clinical Trials:</strong> Confidential participant data</li>
            <li>• <strong>Insurance Claims:</strong> Private medical information</li>
            <li>• <strong>Genomic Data:</strong> Secure DNA analysis</li>
            <li>• <strong>Telemedicine:</strong> Encrypted remote consultations</li>
          </ul>
        </div>

        {/* Compliance Info */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800">
            <strong>✓ Regulatory Compliance:</strong> FHE enables HIPAA, GDPR, and
            other healthcare privacy regulations by ensuring data remains encrypted
            throughout its entire lifecycle.
          </p>
        </div>
      </div>
    </Card>
  );
};
