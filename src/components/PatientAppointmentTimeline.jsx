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

const getAppointmentDate = (appointment) => {
  const raw = appointment?.appointment_date || appointment?.appointmentDate || appointment?.date || appointment?.start || appointment?.startUTC || appointment?.createdAt;
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

  const duration = appointment?.duration_minutes || appointment?.duration || appointment?.session_duration || appointment?.metadata?.dialysisDuration || '—';
  const doctor = appointment?.doctor_name || appointment?.doctor || appointment?.doctorName || (appointment?.primary_doctor_id ? `Dr #${appointment.primary_doctor_id}` : null);
  const service = appointment?.service_name || appointment?.service || appointment?.dialysis_type || appointment?.appointment_type;
  const notes = appointment?.notes || appointment?.remarks || appointment?.comment || appointment?.reason || appointment?.metadata?.notes_brief;

  return (
    <div
      onClick={() => onClick?.(appointment)}
      style={{
        textAlign: 'left',
        width: '100%',
        minHeight: '130px',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        boxSizing: 'border-box'
      }}
    >
      {/* Date Section */}
      <div style={{ width: '50px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1', color: '#111827' }}>{parts.day}</div>
        <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', textAlign: 'center' }}>{parts.month} {parts.year}</div>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: meta.color, marginTop: '8px' }} />
      </div>

      {/* Vertical Line */}
      <div style={{ width: '1px', backgroundColor: '#F3F4F6', margin: '4px 0' }} />

      {/* Details Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{parts.time}</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
           <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: meta.color }} />
           <div style={{ fontSize: '11px', fontWeight: '700', color: meta.color }}>{meta.label}</div>
        </div>

        <div style={{ fontSize: '11px', color: '#4B5563', lineHeight: '1.4' }}>
           <div><span style={{ fontWeight: '600', color: '#9CA3AF' }}>Duration:</span> {duration} mins</div>
           {doctor && <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{ fontWeight: '600', color: '#9CA3AF' }}>Doctor:</span> {doctor}</div>}
           {service && <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{ fontWeight: '600', color: '#9CA3AF' }}>Service:</span> {service}</div>}
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

  const fetchPatientAppointments = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const result = await getAppointments({ patientId });
      if (result.success) {
        setFetchedAppointments(result.data?.data || result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch patient timeline:', err);
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
        .sort((a, b) => (getAppointmentDate(a)?.getTime() || 0) - (getAppointmentDate(b)?.getTime() || 0)),
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

  if (!items.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
        <div style={{ color: '#6B7280', fontSize: '14px', fontWeight: '600' }}>No appointment records found.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '80vh', overflowY: 'auto', paddingRight: '8px', textAlign: 'left' }}>
      {/* Header & Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Appointment Timeline
          </div>
          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{dateRange}</div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '8px 0', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
          {Object.entries(STATUS_META).slice(0, 4).map(([key, meta]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: meta.color }} />
              <div style={{ fontSize: '12px', color: '#4B5563' }}>{meta.label}</div>
            </div>
          ))}
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            {group.items.map((appointment) => (
              <AppointmentCell
                key={appointment.id || Math.random()}
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
