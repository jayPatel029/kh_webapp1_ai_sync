import React, { useMemo } from 'react';

// Strict color map (as requested)
const STATUS_COLORS = {
  COMPLETED: '#22C55E',
  MISSED: '#EF4444',
  PENDING: '#EAB308',
  CANCELLED: '#6B7280',
};
const BLUE_OUTLINE = '#3B82F6';

const getAppointmentDate = (a) => {
  // support multiple possible field names
  const raw = a?.appointment_date || a?.appointmentDate || a?.date || a?.start || a?.createdAt;
  return raw ? new Date(raw) : null;
};

const fmtDate = (d) => {
  if (!d) return '-';
  try {
    return d.toISOString().split('T')[0];
  } catch { return '-'; }
};

const fmtTime = (d) => {
  if (!d) return '-';
  try {
    return d.toTimeString().split(' ')[0].slice(0,5);
  } catch { return '-'; }
};

export default function PatientAppointmentTimeline({
  appointments = [],
  wrapAfter = 14, // number of items per column (visual wrap)
  onCellClick = null,
}) {
  // sort ascending: past -> future
  const items = useMemo(() => (Array.isArray(appointments) ? [...appointments] : []).sort((a, b) => {
    const da = getAppointmentDate(a) || 0;
    const db = getAppointmentDate(b) || 0;
    return da - db;
  }), [appointments]);

  const ROWS = Math.max(1, wrapAfter);
  const cellSize = 18;
  const gap = 4;
  const radius = 4;

  const today = new Date();
  today.setHours(0,0,0,0);

  // number of columns created horizontally
  const colCount = Math.ceil(items.length / ROWS) || 1;

  // header labels per column (month labels)
  const monthLabels = new Array(colCount).fill(null).map((_, colIdx) => {
    const idx = colIdx * ROWS;
    const apt = items[idx];
    const d = getAppointmentDate(apt);
    return d ? d.toLocaleString('default', { month: 'short' }) : '';
  });

  const isCompleted = (s) => String(s || '').toUpperCase() === 'COMPLETED';

  return (
    <div style={{ width: '100%' }}>
      {/* Header with month labels aligned to columns */}
      <div style={{ overflowX: 'auto', paddingBottom: 6 }}>
        <div style={{ display: 'flex', gap: `${gap}px`, minWidth: `${colCount * (cellSize + gap)}px` }}>
          {monthLabels.map((m, i) => (
            <div key={`m-${i}`} style={{ width: `${cellSize}px`, textAlign: 'center', fontSize: 11, color: '#374151' }}>{m}</div>
          ))}
        </div>
      </div>

      {/* Timeline grid: flow by column so new columns are added to the right (horizontal axis) */}
      <div style={{ overflowX: 'auto', padding: '6px 0' }}>
        <div
          style={{
            display: 'grid',
            gridAutoFlow: 'column',
            gridTemplateRows: `repeat(${ROWS}, ${cellSize}px)`,
            gridAutoColumns: `${cellSize}px`,
            gap: `${gap}px`,
            alignItems: 'start',
            minWidth: `${colCount * (cellSize + gap)}px`,
            padding: '4px',
          }}
        >
          {items.map((apt, idx) => {
            const d = getAppointmentDate(apt);
            const dNorm = d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null;
            const statusKey = String(apt?.status || apt?.statusName || '').toUpperCase();

            const filledColor = STATUS_COLORS[statusKey] || (statusKey === 'SCHEDULED' || statusKey === 'PENDING' ? STATUS_COLORS.PENDING : 'transparent');

            const upcomingOrToday = dNorm ? (dNorm.getTime() >= today.getTime()) : false;
            const todayCell = dNorm ? (dNorm.getTime() === today.getTime()) : false;

            // If upcoming/today and not completed -> blue outline
            const useOutline = upcomingOrToday && !isCompleted(statusKey);

            const prev = items[idx - 1];
            const next = items[idx + 1];
            const prevCompleted = prev && isCompleted(prev?.status || prev?.statusName);
            const nextCompleted = next && isCompleted(next?.status || next?.statusName);

            const borderRadius = {
              borderTopLeftRadius: radius,
              borderBottomLeftRadius: radius,
              borderTopRightRadius: radius,
              borderBottomRightRadius: radius,
            };
            if (isCompleted(statusKey)) {
              if (prevCompleted) {
                borderRadius.borderTopLeftRadius = 0;
                borderRadius.borderBottomLeftRadius = 0;
              }
              if (nextCompleted) {
                borderRadius.borderTopRightRadius = 0;
                borderRadius.borderBottomRightRadius = 0;
              }
            }

            const style = {
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              display: 'inline-block',
              borderRadius: `${borderRadius.borderTopLeftRadius}px ${borderRadius.borderTopRightRadius}px ${borderRadius.borderBottomRightRadius}px ${borderRadius.borderBottomLeftRadius}px`,
              background: isCompleted(statusKey) ? STATUS_COLORS.COMPLETED : (useOutline ? 'transparent' : filledColor),
              border: useOutline ? `2px solid ${BLUE_OUTLINE}` : 'none',
              boxSizing: 'border-box',
              cursor: onCellClick ? 'pointer' : 'default',
              boxShadow: todayCell ? `0 0 0 2px rgba(59,130,246,0.09)` : undefined,
            };

            const title = `${fmtDate(d)} • ${fmtTime(d)} • ${statusKey || '-'}\n${apt?.appointment_time ? apt.appointment_time : ''}`;

            return (
              <div
                key={apt.id || `${idx}-${fmtDate(d)}`}
                title={title}
                style={style}
                onClick={() => onCellClick && onCellClick(apt)}
                role={onCellClick ? 'button' : undefined}
                aria-label={title}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
