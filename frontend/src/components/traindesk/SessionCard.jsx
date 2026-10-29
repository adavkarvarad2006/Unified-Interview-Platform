import React, { useState } from 'react';
import { formatDuration, timeToMinutes } from '../../utils/traindeskHelpers';
import { api } from '../../services/api';
import { Clock, MapPin, Users, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function SessionCard({ session, hasClash = false }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [attendees, setAttendees] = useState(null);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const startM = timeToMinutes(session.startTime);
  const endM = timeToMinutes(session.endTime);
  const durationStr = formatDuration(endM - startM);

  const confCount = session.confirmedCount ?? session.bookings?.filter((b) => b.status === 'CONFIRMED').length ?? 0;
  const waitCount = session.waitlistedCount ?? session.bookings?.filter((b) => b.status === 'WAITLISTED').length ?? 0;
  const cap = session.capacity;
  const seatsLeft = Math.max(0, cap - confCount);
  const isFull = seatsLeft <= 0;

  const percentBooked = Math.min(100, Math.round((confCount / cap) * 100));

  const toggleDetails = async () => {
    const nextState = !detailsOpen;
    setDetailsOpen(nextState);

    if (nextState && !attendees) {
      try {
        setLoadingAttendees(true);
        const res = await api.getSessionAttendees(session.sessionId || session._id);
        if (res && res.data && res.data.attendees) {
          setAttendees(res.data.attendees);
        }
      } catch (err) {
        console.warn('Could not fetch attendees dynamically, falling back to embedded bookings:', err);
      } finally {
        setLoadingAttendees(false);
      }
    }
  };

  const traineeRows = attendees || (session.bookings || []).map((b, i) => {
    const bookedAtDate = b.bookedAt ? new Date(b.bookedAt) : null;
    const bookedAtStr = bookedAtDate
      ? `${bookedAtDate.getDate()} ${bookedAtDate.toLocaleDateString('en-US', {
          month: 'short',
        })}, ${String(bookedAtDate.getHours()).padStart(2, '0')}:${String(
          bookedAtDate.getMinutes()
        ).padStart(2, '0')}`
      : 'N/A';

    return {
      bookingId: b.bookingId || `b-${i}`,
      name: b.traineeId?.name || b.name || `Trainee #${i + 1}`,
      organization: b.traineeId?.organization || b.organization || b.org || 'Independent',
      bookedAt: bookedAtStr,
      status: b.status,
    };
  });

  return (
    <article
      style={{
        padding: '20px',
        borderRadius: '14px',
        background: 'var(--bg-card)',
        border: hasClash ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-subtle)',
        boxShadow: hasClash ? '0 0 15px rgba(244, 63, 94, 0.15)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              fontFamily: 'monospace'
            }}>
              <Clock size={12} /> {session.startTime} – {session.endTime} ({durationStr})
            </span>
            {hasClash && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(244, 63, 94, 0.2)',
                color: '#fb7185',
                border: '1px solid rgba(244, 63, 94, 0.4)'
              }}>
                <AlertCircle size={12} /> Scheduling Clash
              </span>
            )}
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            {session.topic}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} color="#06b6d4" /> {session.room}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} color="#818cf8" /> {confCount} / {cap} seats confirmed
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isFull ? (
            <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>Full Capacity</span>
          ) : (
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>{seatsLeft} seats left</span>
          )}
          {waitCount > 0 && (
            <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{waitCount} waitlisted</span>
          )}
        </div>
      </div>

      {/* Progress Capacity Bar */}
      <div>
        <div style={{
          height: '6px',
          borderRadius: '999px',
          background: 'rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}>
          <div
            style={{
              height: '100%',
              width: `${percentBooked}%`,
              background: isFull
                ? '#f59e0b'
                : 'linear-gradient(90deg, #6366f1, #06b6d4)',
              borderRadius: '999px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Expandable Trainee Roster */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
        <button
          onClick={toggleDetails}
          style={{
            background: 'none',
            border: 'none',
            color: '#818cf8',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0
          }}
        >
          {detailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {detailsOpen ? 'Hide Trainee Roster' : `View Trainee Roster (${traineeRows.length})`}
        </button>

        {detailsOpen && (
          <div style={{ marginTop: '12px', overflowX: 'auto' }}>
            {loadingAttendees ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Loading attendee roster...</p>
            ) : traineeRows.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No trainees currently booked for this session.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '8px 6px' }}>Trainee</th>
                    <th style={{ padding: '8px 6px' }}>Organization</th>
                    <th style={{ padding: '8px 6px' }}>Booked Timestamp</th>
                    <th style={{ padding: '8px 6px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {traineeRows.map((t, idx) => (
                    <tr key={t.bookingId || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '8px 6px', fontWeight: 600, color: '#f8fafc' }}>{t.name}</td>
                      <td style={{ padding: '8px 6px', color: 'var(--text-muted)' }}>{t.organization}</td>
                      <td style={{ padding: '8px 6px', fontFamily: 'monospace', color: 'var(--text-dim)' }}>{t.bookedAt}</td>
                      <td style={{ padding: '8px 6px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: t.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: t.status === 'CONFIRMED' ? '#34d399' : '#fcd34d'
                        }}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

