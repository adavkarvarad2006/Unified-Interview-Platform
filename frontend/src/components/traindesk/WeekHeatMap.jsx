import React from 'react';
import { Flame } from 'lucide-react';

export default function WeekHeatMap({
  heatmapData = { hours: [], matrix: [] },
  selectedDayOffset = 0,
  onSelectDay,
}) {
  const { hours = [], matrix = [] } = heatmapData;

  const getIntensityColor = (level, hasClash) => {
    if (hasClash) return 'rgba(244, 63, 94, 0.4)';
    if (level === 'l3') return 'rgba(99, 102, 241, 0.85)';
    if (level === 'l2') return 'rgba(99, 102, 241, 0.5)';
    if (level === 'l1') return 'rgba(6, 182, 212, 0.35)';
    return 'rgba(255, 255, 255, 0.03)';
  };

  return (
    <section className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={18} color="#f59e0b" />
            7-Day Hourly Attendance Matrix
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Trainee volume across 11 daily hours. Click any day row to load its detailed briefing and sessions.
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `120px repeat(${hours.length}, minmax(46px, 1fr))`,
          gap: '4px',
          minWidth: '700px'
        }}>
          {/* Top-left empty cell */}
          <div />

          {/* Hour Headers */}
          {hours.map((h, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                fontSize: '0.72rem',
                color: 'var(--text-dim)',
                fontFamily: 'monospace',
                padding: '6px 0'
              }}
            >
              {h}
            </div>
          ))}

          {/* Day Rows */}
          {matrix.map((row) => {
            const isRowSelected = row.dayOffset === selectedDayOffset;

            return (
              <React.Fragment key={row.dayOffset}>
                <button
                  type="button"
                  aria-pressed={isRowSelected}
                  onClick={() => onSelectDay(row.dayOffset)}
                  style={{
                    background: isRowSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: isRowSelected ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                    color: isRowSelected ? '#fff' : 'var(--text-muted)',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: isRowSelected ? 700 : 500,
                    padding: '8px 10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {row.dayLabel}
                </button>

                {row.cells.map((cell, cIdx) => {
                  const bg = getIntensityColor(cell.level, cell.hasClash, isRowSelected);
                  const border = cell.hasClash
                    ? '1px solid #f43f5e'
                    : isRowSelected
                    ? '1px solid rgba(99, 102, 241, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.05)';

                  return (
                    <div
                      key={cIdx}
                      style={{
                        background: bg,
                        border,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: cell.traineeCount > 0 ? '#fff' : 'transparent',
                        height: '36px',
                        cursor: 'pointer',
                        transition: 'transform 0.1s'
                      }}
                      title={`${row.dayLabel} at ${cell.hourFormatted}: ${
                        cell.traineeCount
                      } trainees${cell.hasClash ? ' (Clash Detected)' : ''}`}
                      onClick={() => onSelectDay(row.dayOffset)}
                    >
                      {cell.traineeCount || ''}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }} />
          Free
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(6, 182, 212, 0.35)' }} />
          1 to 8 trainees
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(99, 102, 241, 0.5)' }} />
          9 to 17 trainees
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(99, 102, 241, 0.85)' }} />
          18+ trainees
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid #f43f5e', background: 'rgba(244, 63, 94, 0.4)' }} />
          Overlapping clash
        </span>
      </div>
    </section>
  );
}
