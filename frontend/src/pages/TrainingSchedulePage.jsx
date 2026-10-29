import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import TrainerPicker from '../components/traindesk/TrainerPicker';
import DayStrip from '../components/traindesk/DayStrip';
import DailyBriefing from '../components/traindesk/DailyBriefing';
import WeekHeatMap from '../components/traindesk/WeekHeatMap';
import SessionList from '../components/traindesk/SessionList';
import { Layers, RefreshCw, AlertCircle } from 'lucide-react';

export default function TrainingSchedulePage() {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState('t1');
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  const [dashboardData, setDashboardData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load trainers
  useEffect(() => {
    let isMounted = true;

    async function loadTrainers() {
      try {
        const res = await api.getTrainers();
        if (isMounted && res.success && res.data.length > 0) {
          setTrainers(res.data);
          const first = res.data[0];
          setSelectedTrainerId(first.trainerId || first._id);
        }
      } catch (err) {
        console.error('Error fetching trainers:', err);
        if (isMounted) setError('Could not load trainer directory from API.');
      }
    }

    loadTrainers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Whenever trainer or dayOffset changes, fetch dashboard & heatmap data
  useEffect(() => {
    if (!selectedTrainerId) return;

    let isMounted = true;

    async function loadSchedule() {
      try {
        setLoading(true);
        setError(null);

        const [dashRes, heatRes] = await Promise.all([
          api.getDashboardSchedule(selectedTrainerId, selectedDayOffset),
          api.getHeatmapSchedule(selectedTrainerId),
        ]);

        if (isMounted) {
          if (dashRes.success) {
            setDashboardData(dashRes);
          }
          if (heatRes.success) {
            setHeatmapData(heatRes);
          }
        }
      } catch (err) {
        console.error('Error fetching schedule data:', err);
        if (isMounted) {
          setError(
            err.message || 'Unable to load schedule data. Please check server status.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSchedule();

    return () => {
      isMounted = false;
    };
  }, [selectedTrainerId, selectedDayOffset]);

  const handleSelectTrainer = (id) => {
    setSelectedTrainerId(id);
  };

  const handleSelectDay = (offset) => {
    setSelectedDayOffset(offset);
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1160px' }}>
      {/* Module Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          borderRadius: '20px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Layers size={18} color="#818cf8" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#818cf8' }}>
            Unified Module · TrainDesk Operations
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
          Training Schedule & Attendance Console
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '750px', margin: 0 }}>
          Manage trainer availability, detect real-time scheduling overlaps, track attendee registration capacity,
          and monitor 7-day hourly intensity matrices.
        </p>
      </div>

      <TrainerPicker
        trainers={trainers}
        selectedTrainerId={selectedTrainerId}
        onSelectTrainer={handleSelectTrainer}
      />

      {error && (
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          color: '#fb7185',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {dashboardData?.weekStrip && (
        <DayStrip
          days={dashboardData.weekStrip}
          selectedDayOffset={selectedDayOffset}
          onSelectDay={handleSelectDay}
        />
      )}

      {loading && !dashboardData && (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
          <div>Loading schedule data...</div>
        </div>
      )}

      {dashboardData?.brief && (
        <DailyBriefing brief={dashboardData.brief} />
      )}

      {heatmapData && (
        <WeekHeatMap
          heatmapData={heatmapData}
          selectedDayOffset={selectedDayOffset}
          onSelectDay={handleSelectDay}
        />
      )}

      {dashboardData && (
        <SessionList
          sessions={dashboardData.sessions || []}
          selectedDate={dashboardData.selectedDate}
        />
      )}
    </div>
  );
}

