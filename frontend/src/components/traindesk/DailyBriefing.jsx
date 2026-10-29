import React from 'react';
import { Clock, Users, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function DailyBriefing({ brief }) {
  if (!brief) return null;

  const {
    dateFormatted,
    statementHeading,
    stats = [],
    timeline = { containerHeight: 44, blocks: [], ticks: [] },
    agenda = [],
    chips = [],
  } = brief;

  return (
    <section className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '20px' }}>
      <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8', fontWeight: 700, marginBottom: '6px' }}>
        {dateFormatted}
      </p>
      <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-main)' }}>
        {statementHeading}
      </h3>

      {/* Stats Counters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {stats.map((st, i) => {
          const isBad = st.variant === 'bad';
          return (
            <div
              key={i}
              style={{
                padding: '14px',
                borderRadius: '12px',
                background: isBad ? 'rgba(244, 63, 94, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isBad ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: isBad ? '#fb7185' : '#f8fafc' }}>
                {st.value}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Visual Timeline Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color="#06b6d4" /> Visual Schedule Timeline (08:00 – 18:00)
        </div>
        <div
          style={{
            position: 'relative',
            height: `${timeline.containerHeight}px`,
            background: 'rgba(15, 21, 35, 0.7)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}
        >
          {/* Grid lines at 20%, 40%, 60%, 80% */}
          {[20, 40, 60, 80].map((pct) => (
            <div
              key={pct}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${pct}%`,
                width: '1px',
                background: 'rgba(255, 255, 255, 0.06)'
              }}
            />
          ))}

          {/* Time blocks */}
          {timeline.blocks.map((blk) => (
            <div
              key={blk.sessionId}
              style={{
                position: 'absolute',
                left: `${blk.leftPercent}%`,
                width: `${blk.widthPercent}%`,
                top: `${blk.topPx}px`,
                height: `${blk.blockHeight}px`,
                background: blk.hasClash
                  ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.8), rgba(225, 29, 72, 0.9))'
                  : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                boxShadow: blk.hasClash ? '0 0 10px rgba(244, 63, 94, 0.5)' : '0 2px 6px rgba(0,0,0,0.3)',
                cursor: 'pointer'
              }}
              title={blk.title}
            >
              {blk.topic}
            </div>
          ))}
        </div>

        {/* Timeline Axis Ticks */}
        <div style={{ position: 'relative', height: '20px', marginTop: '4px' }}>
          {timeline.ticks.map((t, idx) => {
            const transform =
              idx === 0
                ? 'none'
                : idx === timeline.ticks.length - 1
                ? 'translateX(-100%)'
                : 'translateX(-50%)';

            return (
              <span
                key={t.minute}
                style={{
                  position: 'absolute',
                  left: `${t.percent}%`,
                  transform,
                  fontSize: '0.7rem',
                  color: 'var(--text-dim)',
                  fontFamily: 'monospace'
                }}
              >
                {t.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Agenda List */}
      {agenda.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
            Day Agenda & Session Status
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agenda.map((item) => (
              <div
                key={item.sessionId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', fontFamily: 'monospace' }}>
                    {item.startTime} – {item.endTime}
                  </span>
                  <div>
                    <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem', marginRight: '10px' }}>
                      {item.topic}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.confirmedCount}/{item.capacity} attendees · {item.room}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.pills.map((p, pIdx) => {
                    const isBad = p.variant === 'bad';
                    const isWarn = p.variant === 'warn';
                    const isOk = p.variant === 'ok';

                    return (
                      <span
                        key={pIdx}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '999px',
                          background: isBad ? 'rgba(244, 63, 94, 0.2)' : isWarn ? 'rgba(245, 158, 11, 0.2)' : isOk ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          color: isBad ? '#fb7185' : isWarn ? '#fcd34d' : isOk ? '#34d399' : '#cbd5e1',
                          border: isBad ? '1px solid rgba(244, 63, 94, 0.4)' : isWarn ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent'
                        }}
                      >
                        {p.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Free Windows & Conflict Chips */}
      {chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {chips.map((c, cIdx) => {
            const isBad = c.variant === 'bad';
            return (
              <span
                key={cIdx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: isBad ? 'rgba(244, 63, 94, 0.15)' : 'rgba(6, 182, 212, 0.12)',
                  color: isBad ? '#fb7185' : '#38bdf8',
                  border: isBad ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(6, 182, 212, 0.25)'
                }}
              >
                {isBad ? <AlertTriangle size={14} /> : <Info size={14} />}
                {c.text}
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}

