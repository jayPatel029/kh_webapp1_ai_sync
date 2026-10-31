import React, { useMemo, memo, useState, useEffect, useCallback } from 'react';
import { getAppointments } from '../ApiCalls/clinicApis';

const STATUS_META = {
  COMPLETED: { color: '#22C55E', label: 'Completed' },
  MISSED: { color: '#EF4444', label: 'Missed' },
  PENDING: { color: '#EAB308', label: 'Pending' },
  CANCELLED: { color: '#6B7280', label: 'Cancelled' },
  SCHEDULED: { color: '#3B82F6', label: 'Scheduled' },
  BOOKED: { color: '#3B82F6', label: 'Booked' },
  ARRIVED: { color: '#8B5CF6', label: 'Arrived' },
  IN_PROGRESS: { color: '#06B6D4', label: 'In Progress' },
};

const GENERIC_REASONS = new Set([
  'routine dialysis session',
  'dialysis session booking',
  'dialysis appointment',
]);

const getAppointmentDate = (appointment) => {
  const rawDate = appointment?.appointment_date || appointment?.appointmentDate || appointment?.date || appointment?.start || appointment?.startUTC || appointment?.createdAt;
  if (!rawDate) return null;
  if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
    return new Date(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate());
  }
  const raw = String(rawDate).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }
  return null;
};

const minutesOf = (timeStr) => {
  const match = String(timeStr || '').match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
};

const formatTime12Hour = (timeStr) => {
  if (!timeStr) return '—';
  const match = String(timeStr).match(/(\d{1,2}):(\d{2})/);
  if (!match) return String(timeStr);
  const hour = parseInt(match[1], 10);
  const minute = match[2];
  if (!Number.isFinite(hour)) return String(timeStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
};

const parseEnvelope = (appointment) => {
  const raw = appointment?.patient_ailments;
  if (typeof raw === 'string' && raw.trim().startsWith('{')) {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  if (raw && typeof raw === 'object') return raw;
  return {};
};

const getDurationLabel = (appointment) => {
  const start = appointment?.start_time || appointment?.appointment_time;
  const end = appointment?.end_time;
  if (start && end && String(start).includes(':') && String(end).includes(':')) {
    const mins = minutesOf(end) - minutesOf(start);
    const adjusted = mins <= 0 ? mins + 24 * 60 : mins;
    if (Number.isFinite(adjusted) && adjusted > 0) {
      const hours = Math.round((adjusted / 60) * 10) / 10;
      return hours === 1 ? '1 hr' : `${hours} hrs`;
    }
  }
  const envelope = parseEnvelope(appointment);
  const raw = appointment?.duration_minutes || appointment?.duration || envelope?.metadata?.dialysisDuration || envelope?.dialysisDuration;
  if (!raw || raw === '—') return '—';
  const asNum = Number(raw);
  if (Number.isFinite(asNum) && asNum > 0 && asNum <= 12) return `${asNum} hrs`;
  return String(raw);
};

const parseServiceLabel = (appointment) => {
  let raw = appointment?.services;
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { raw = []; }
  }
  if (Array.isArray(raw) && raw.length) {
    const names = [...new Set(
      raw
        .map((item) => (typeof item === 'string' ? item : (item?.service_name || item?.name || '')).trim())
        .filter((name) => name && name !== '-' && name !== '—' && name.toLowerCase() !== 'dialysis appointment'),
    )];
    if (names.length) return names.join(', ');
  }
  const fallback = String(appointment?.service_name || appointment?.service || '').trim();
  if (!fallback) return '';
  const lowered = fallback.toLowerCase();
  if (['in_clinic', 'online', 'dialysis appointment'].includes(lowered)) return '';
  return fallback;
};

const parseNotes = (appointment) => {
  const envelope = parseEnvelope(appointment);
  const brief = String(envelope?.metadata?.notes_brief || envelope?.notes_brief || appointment?.notes || appointment?.remarks || '').trim();
  if (brief) return brief;
  const reason = String(appointment?.reason || '').trim();
  if (reason && !GENERIC_REASONS.has(reason.toLowerCase())) return reason;
  return '';
};

const formatParts = (date, timeStr) => {
  if (!date) return { day: '-', month: '-', year: '-', time: formatTime12Hour(timeStr) };
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleString('default', { month: 'short' }),
    year: String(date.getFullYear()),
    time: formatTime12Hour(timeStr),
  };
};

const normalizeStatus = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === 'CONFIRMED') return 'BOOKED';
  if (!normalized || normalized === 'UNDEFINED') return 'SCHEDULED';
  return normalized;
};

const getStatusMeta = (status) => STATUS_META[status] || { color: '#9CA3AF', label: status || 'Unknown' };

const AppointmentCell = memo(function AppointmentCell({ appointment, onClick }) {
  const date = getAppointmentDate(appointment);
  const parts = formatParts(
    date,
    appointment?.start_time || appointment?.appointment_time || appointment?.booking_time,
  );
  const status = normalizeStatus(appointment?.status || appointment?.statusName || appointment?.state);
  const meta = getStatusMeta(status);
  const duration = getDurationLabel(appointment);
  const doctor = appointment?.doctor_name || appointment?.doctor || appointment?.doctorName || (appointment?.primary_doctor_id ? `Dr #${appointment.primary_doctor_id}` : null);
  const service = parseServiceLabel(appointment);
  const clinic = appointment?.clinic_name || appointment?.clinicName || '';
  const notes = parseNotes(appointment);
  const clickable = typeof onClick === 'function';

  return (
    <div
      onClick={() => clickable && onClick(appointment)}
      style={{
        textAlign: 'left',
        width: '100%',
        minHeight: '130px',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: clickable ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ width: '50px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1', color: '#111827' }}>{parts.day}</div>
        <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', textAlign: 'center' }}>{parts.month} {parts.year}</div>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: meta.color, marginTop: '8px' }} />
      </div>

      <div style={{ width: '1px', backgroundColor: '#F3F4F6', margin: '4px 0' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{parts.time}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
           <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: meta.color }} />
           <div style={{ fontSize: '11px', fontWeight: '700', color: meta.color }}>{meta.label}</div>
        </div>

        <div style={{ fontSize: '11px', color: '#4B5563', lineHeight: '1.4' }}>
           <div><span style={{ fontWeight: '600', color: '#9CA3AF' }}>Duration:</span> {duration}</div>
           {clinic && <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{ fontWeight: '600', color: '#9CA3AF' }}>Clinic:</span> {clinic}</div>}
           {doctor && <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{ fontWeight: '600', color: '#9CA3AF' }}>Doctor:</span> {doctor}</div>}
           {service && <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{ fontWeight: '600', color: '#9CA3AF' }}>Services:</span> {service}</div>}
        </div>

        {notes && (
          <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {notes}
          </div>
        )}
      </div>
    </div>
  );
});

export default function PatientAppointmentTimeline({ patientId, appointments: initialAppointments = [], onCellClick = null }) {
  const [fetchedAppointments, setFetchedAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPatientAppointments = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const result = await getAppointments({
        patientId,
        patient_id: patientId,
        limit: 500,
      });
      if (result.success) {
        const body = result.data?.data !== undefined ? result.data.data : result.data;
        const rows = Array.isArray(body) ? body : (body?.items || body?.appointments || []);
        setFetchedAppointments(
          rows.filter((row) => String(row.patient_id || row.patientId) === String(patientId)),
        );
      } else {
        setFetchedAppointments([]);
        setError(result.data?.message || 'Failed to load appointment timeline');
      }
    } catch (err) {
      console.error('Failed to fetch patient timeline:', err);
      setFetchedAppointments([]);
      setError('Failed to load appointment timeline');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      fetchPatientAppointments();
    }
  }, [fetchPatientAppointments, patientId]);

  const appointments = patientId ? fetchedAppointments : initialAppointments;

  const items = useMemo(
    () =>
      (Array.isArray(appointments) ? appointments : [])
        .slice()
        .sort((a, b) => {
          const dateA = getAppointmentDate(a)?.getTime() || 0;
          const dateB = getAppointmentDate(b)?.getTime() || 0;
          if (dateA !== dateB) return dateA - dateB;
          return minutesOf(a.start_time || a.appointment_time) - minutesOf(b.start_time || b.appointment_time);
        }),
    [appointments]
  );

  const dateRange = useMemo(() => {
    if (items.length < 2) return '';
    const start = getAppointmentDate(items[0]);
    const end = getAppointmentDate(items[items.length - 1]);
    const f = (d) => d ? `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}` : '';
    return `${f(start)} → ${f(end)}`;
  }, [items]);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <div style={{ color: '#3B82F6', fontWeight: 'bold' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px dashed #FECACA' }}>
        <div style={{ color: '#B91C1C', fontSize: '14px', fontWeight: '600' }}>{error}</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
        <div style={{ color: '#6B7280', fontSize: '14px', fontWeight: '600' }}>No appointment records found.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Appointment Timeline
            </div>
            {!onCellClick && (
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                Read-only history for this patient
              </div>
            )}
          </div>
          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{items.length} appointments{dateRange ? ` · ${dateRange}` : ''}</div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '8px 0', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
          {['BOOKED', 'PENDING', 'ARRIVED', 'COMPLETED', 'MISSED', 'CANCELLED'].map((key) => {
            const meta = STATUS_META[key];
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: meta.color }} />
                <div style={{ fontSize: '12px', color: '#4B5563' }}>{meta.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {groupedByMonth.map((group) => (
        <div key={group.key} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#111827' }}>{group.label}</div>
            <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '700', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '10px' }}>
              {group.items.length} APPOINTMENTS
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {group.items.map((appointment, idx) => (
              <AppointmentCell
                key={appointment.id || `${group.key}-${idx}`}
                appointment={appointment}
                onClick={onCellClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
