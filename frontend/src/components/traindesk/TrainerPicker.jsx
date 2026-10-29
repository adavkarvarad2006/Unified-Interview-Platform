import React from 'react';
import { UserCheck, Award } from 'lucide-react';

export default function TrainerPicker({ trainers = [], selectedTrainerId, onSelectTrainer }) {
  const currentTrainer = trainers.find(
    (t) => t.trainerId === selectedTrainerId || t._id === selectedTrainerId
  );

  return (
    <header className="traindesk-top glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>TrainDesk Operations</h2>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
              Training & Attendance Console
            </span>
          </div>
          {currentTrainer && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 32px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={16} color="#818cf8" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lead Trainer:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{currentTrainer.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="#06b6d4" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Specialization:</span>
                <span style={{ fontSize: '0.9rem', color: '#c7d2fe' }}>{currentTrainer.specialization}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label htmlFor="trainer-select" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Switch Trainer:
          </label>
          <select
            id="trainer-select"
            value={selectedTrainerId}
            onChange={(e) => onSelectTrainer(e.target.value)}
            className="input-field"
            style={{ minWidth: '220px', padding: '10px 14px', borderRadius: '10px' }}
          >
            {trainers.map((t) => (
              <option key={t.trainerId || t._id} value={t.trainerId || t._id} style={{ background: '#0f1523', color: '#f8fafc' }}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}

