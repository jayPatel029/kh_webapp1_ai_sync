import React, { useMemo, memo } from 'react';

const STATUS_META = {
  COMPLETED: { color: '#22C55E', label: 'Completed' },
  MISSED: { color: '#EF4444', label: 'Missed' },
  PENDING: { color: '#EAB308', label: 'Pending' },
  CANCELLED: { color: '#6B7280', label: 'Cancelled' },
};

const BLUE_OUTLINE = '#3B82F6';

const getAppointmentDate = (appointment) => {
  const raw = appointment?.appointment_date || appointment?.appointmentDate || appointment?.date || appointment?.start || appointment?.createdAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatParts = (date) => {
  if (!date) return { day: '-', month: '-', year: '-', time: '-' };
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleString('default', { month: 'short' }),
    year: String(date.getFullYear()),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

const normalizeStatus = (value) => String(value || '').trim().toUpperCase();

const getStatusMeta = (status) => STATUS_META[status] || { color: '#9CA3AF', label: status || 'Unknown' };

const AppointmentCell = memo(function AppointmentCell({ appointment, onClick }) {
  const date = getAppointmentDate(appointment);
  const parts = formatParts(date);
  const status = normalizeStatus(appointment?.status || appointment?.statusName || appointment?.state);
  const meta = getStatusMeta(status);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date
    ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() === today.getTime()
    : false;
  const isUpcoming = date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() >= today.getTime() : false;

  const duration = appointment?.duration_minutes || appointment?.duration || appointment?.session_duration;
  const doctor = appointment?.doctor_name || appointment?.doctor || appointment?.doctorName;
  const service = appointment?.service_name || appointment?.service || appointment?.dialysis_type;
  const notes = appointment?.notes || appointment?.remarks || appointment?.comment;

  const tooltip = [
    `Date: ${date ? date.toLocaleDateString() : '-'}`,
    `Time: ${parts.time}`,
    `Status: ${meta.label}`,
    doctor ? `Doctor: ${doctor}` : null,
    service ? `Service: ${service}` : null,
  ].filter(Boolean).join('\n');

  return (
    <button
      type="button"
      onClick={() => onClick?.(appointment)}
      title={tooltip}
      aria-label={tooltip}
      style={{
        textAlign: 'left',
        width: '100%',
        minHeight: 118,
        padding: 12,
        borderRadius: 14,
        border: isUpcoming ? `1.5px solid ${BLUE_OUTLINE}` : '1px solid #E5E7EB',
        background: '#fff',
        boxShadow: isToday ? '0 0 0 3px rgba(59,130,246,0.10)' : '0 1px 2px rgba(0,0,0,0.04)',
        cursor: onClick ? 'pointer' : 'default',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr auto',
        gap: 8,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: '#111827' }}>{parts.day}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{parts.month} {parts.year}</div>
        </div>
        <div
          style={{
            minWidth: 10,
            width: 10,
            height: 10,
            borderRadius: 999,
            background: meta.color,
            marginTop: 3,
            boxShadow: `0 0 0 2px ${meta.color}22`,
          }}
        />
      </div>

      <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{parts.time}</div>

      <div style={{ fontSize: 12, color: '#4B5563', display: 'grid', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: meta.color }} />
          <span>{meta.label}</span>
        </div>
        {duration ? <div>Duration: {duration} mins</div> : null}
        {doctor ? <div>Doctor: {doctor}</div> : null}
        {service ? <div>Service: {service}</div> : null}
      </div>

      {notes ? (
        <div style={{ fontSize: 11, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {notes}
        </div>
      ) : (
        <div />
      )}
    </button>
  );
});

export default function PatientAppointmentTimeline({ appointments = [], onCellClick = null }) {
  const items = useMemo(
    () =>
      (Array.isArray(appointments) ? appointments : [])
        .slice()
        .sort((a, b) => (getAppointmentDate(a)?.getTime() || 0) - (getAppointmentDate(b)?.getTime() || 0)),
    [appointments]
  );

  const groupedByMonth = useMemo(() => {
    const groups = [];
    let currentKey = null;
    let currentGroup = null;

    items.forEach((appointment) => {
      const date = getAppointmentDate(appointment);
      const key = date ? `${date.getFullYear()}-${date.getMonth()}` : 'unknown';
      if (key !== currentKey) {
        currentKey = key;
        currentGroup = {
          key,
          label: date ? date.toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Unknown',
          items: [],
        };
        groups.push(currentGroup);
      }
      currentGroup.items.push(appointment);
    });

    return groups;
  }, [items]);

  const columns = 'repeat(auto-fill, minmax(190px, 1fr))';

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {groupedByMonth.map((group) => (
        <section key={group.key} style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#111827' }}>{group.label}</h4>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{group.items.length} appointment{group.items.length === 1 ? '' : 's'}</div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: columns,
              gap: 12,
              alignItems: 'stretch',
            }}
          >
            {group.items.map((appointment) => (
              <AppointmentCell
                key={appointment.id || `${getAppointmentDate(appointment)?.toISOString?.() || Math.random()}`}
                appointment={appointment}
                onClick={onCellClick}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
