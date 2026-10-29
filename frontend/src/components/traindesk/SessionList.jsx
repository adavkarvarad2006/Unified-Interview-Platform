import React from 'react';
import SessionCard from './SessionCard';
import { timeToMinutes } from '../../utils/traindeskHelpers';
import { Calendar } from 'lucide-react';

export default function SessionList({ sessions = [], selectedDate }) {
  const dateObj = selectedDate ? new Date(selectedDate) : new Date();
  const dateLabel = dateObj.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  // Check overlaps among sessions for clash indicator
  const clashesMap = new Set();
  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  for (let i = 0; i < sorted.length; i++) {
    const s1Start = timeToMinutes(sorted[i].startTime);
    const s1End = timeToMinutes(sorted[i].endTime);

    for (let j = i + 1; j < sorted.length; j++) {
      const s2Start = timeToMinutes(sorted[j].startTime);
      const s2End = timeToMinutes(sorted[j].endTime);

      if (Math.max(s1Start, s2Start) < Math.min(s1End, s2End)) {
        clashesMap.add(sorted[i].sessionId || sorted[i]._id);
        clashesMap.add(sorted[j].sessionId || sorted[j]._id);
      }
    }
  }

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Calendar size={18} color="#818cf8" />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
          Detailed Training Sessions · {dateLabel}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sessions.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', borderRadius: '14px', color: 'var(--text-muted)' }}>
            No training sessions scheduled for this day. Select another day on the strip above to review scheduled modules.
          </div>
        ) : (
          sessions.map((session) => {
            const id = session.sessionId || session._id;
            const hasClash = clashesMap.has(id);
            return (
              <SessionCard
                key={id}
                session={session}
                hasClash={hasClash}
              />
            );
          })
        )}
      </div>
    </section>
  );
}

