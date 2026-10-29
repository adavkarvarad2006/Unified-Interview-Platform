import React from 'react';

export default function DayStrip({ days = [], selectedDayOffset = 0, onSelectDay }) {
  return (
    <nav className="days-strip" aria-label="Choose a day" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
      gap: '10px',
      marginBottom: '20px'
    }}>
      {days.map((day) => {
        const isSelected = day.dayOffset === selectedDayOffset;
        const countText =
          day.sessionCount > 0
            ? `${day.sessionCount} session${day.sessionCount > 1 ? 's' : ''}`
            : 'Free day';

        return (
          <button
            key={day.dayOffset}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectDay(day.dayOffset)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '14px 10px',
              borderRadius: '12px',
              border: isSelected ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
              background: isSelected ? 'rgba(99, 102, 241, 0.16)' : 'var(--bg-card)',
              color: isSelected ? '#fff' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isSelected ? '0 0 15px rgba(99, 102, 241, 0.25)' : 'none'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#818cf8' : 'var(--text-muted)' }}>
              {day.dayName}
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, margin: '4px 0' }}>
              {day.formattedDate}
            </span>
            <span style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '999px',
              background: day.sessionCount > 0 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: day.sessionCount > 0 ? '#38bdf8' : 'var(--text-dim)'
            }}>
              {countText}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
