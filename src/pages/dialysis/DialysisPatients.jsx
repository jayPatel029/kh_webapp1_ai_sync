/**
 * Dialysis Patients Queue Page
 * Queue-style UI for dialysis patients while preserving existing timeline/calendar flows.
 *
 * @file src/pages/dialysis/DialysisPatients.jsx
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Input, Button } from '../../component-library';
import { BaseModal } from '../../component-library/modals/BaseModal';
import DialysisAppointmentsDashboard from '../adminDashboard/components/DialysisAppointmentsDashboard';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import PatientAppointmentTimeline from '../../components/PatientAppointmentTimeline';
import { getPatients } from '../../ApiCalls/patientAPis';
import { getAppointments } from '../../ApiCalls/clinicApis';
import { useAdminToast } from '../../components/AdminToast';
import { ROUTES } from '../../routes/routeConstants';

const STATUS_STYLES = {
  SCHEDULED: { bg: '#dbeafe', text: '#1d4ed8', label: 'Scheduled' },
  BOOKED: { bg: '#dbeafe', text: '#1d4ed8', label: 'Scheduled' },
  ARRIVED: { bg: '#ede9fe', text: '#7c3aed', label: 'Arrived' },
  WAITING: { bg: '#fff7ed', text: '#d97706', label: 'Pending' },
  IN_PROGRESS: { bg: '#fff7ed', text: '#d97706', label: 'In Progress' },
  COMPLETED: { bg: '#ecfdf5', text: '#16a34a', label: 'Completed' },
  CANCELLED: { bg: '#f3f4f6', text: '#6b7280', label: 'Cancelled' },
  MISSED: { bg: '#fef2f2', text: '#dc2626', label: 'Delayed' },
  PENDING: { bg: '#fef2f2', text: '#dc2626', label: 'Pending' },
};

const formatToday = () => new Date().toISOString().split('T')[0];

const calculateAgeFromDOB = (dobString) => {
  if (!dobString) return '—';
  const today = new Date();
  const birthDate = new Date(dobString);

  if (Number.isNaN(birthDate.getTime())) return '—';

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age < 0 ? 0 : age;
};

const normalizeStatus = (status) => {
  const normalized = String(status || 'PENDING').toUpperCase();
  return normalized === 'CONFIRMED' ? 'BOOKED' : normalized;
};

const formatTime12Hour = (timeStr) => {
  if (!timeStr) return '—';
  try {
    const parts = String(timeStr).split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
};

const normalizeAppointmentTime = (appointment) => {
  const startTime = appointment?.start_time || appointment?.startTime;
  if (startTime) return formatTime12Hour(startTime);
  if (appointment?.startUTC) {
    const timePart = String(appointment.startUTC).split('T')[1]?.slice(0, 8);
    return formatTime12Hour(timePart);
  }
  return '—';
};

const deriveShiftLabel = (formattedTime) => {
  if (!formattedTime || formattedTime === '—') return 'Pending';
  const [timePart, period] = formattedTime.split(' ');
  const [rawHour] = timePart.split(':').map(Number);
  if (Number.isNaN(rawHour)) return 'Pending';

  let hour = rawHour;
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  if (hour < 11) return 'Morning';
  if (hour < 15) return 'Mid-day';
  if (hour < 19) return 'Evening';
  return 'Night';
};

const isDialysisPatient = (patient) => {
  const rawAilments = patient.ailments || patient.patient_ailments || patient.aliments || patient.medical_history || '';
  const ailments = Array.isArray(rawAilments) ? rawAilments.join(', ') : String(rawAilments);
  const normalized = ailments.toLowerCase();
  return normalized.includes('dialysis') || normalized.includes('hemodialysis') || normalized.includes('hemo dialysis');
};

const pickPrimaryAppointment = (appointments) => {
  if (!appointments.length) return null;

  const order = {
    IN_PROGRESS: 1,
    WAITING: 2,
    ARRIVED: 3,
    BOOKED: 4,
    SCHEDULED: 5,
    COMPLETED: 6,
    MISSED: 7,
    CANCELLED: 8,
  };

  return [...appointments].sort((left, right) => {
    const statusDelta = (order[normalizeStatus(left.status)] || 99) - (order[normalizeStatus(right.status)] || 99);
    if (statusDelta !== 0) return statusDelta;
    return String(left.start_time || left.startUTC || '').localeCompare(String(right.start_time || right.startUTC || ''));
  })[0];
};

const derivePriority = (appointment) => {
  const raw = appointment || {};
  const status = normalizeStatus(raw.status);
  if (raw.is_emergency || raw.priority === 'HIGH' || raw.severity === 'HIGH') return 'High';
  if (['WAITING', 'IN_PROGRESS', 'ARRIVED'].includes(status)) return 'Medium';
  return 'Low';
};

const deriveBed = (appointment) =>
  appointment?.bed_number ||
  appointment?.bedNo ||
  appointment?.bed_id ||
  appointment?.bedId ||
  appointment?.bed?.bed_number ||
  '—';

const getStatusStyle = (status) => STATUS_STYLES[normalizeStatus(status)] || STATUS_STYLES.PENDING;

const QueueMetricCard = ({ value, label, tone }) => {
  const tones = {
    blue: { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb' },
    green: { bg: '#ecfdf5', border: '#bbf7d0', color: '#16a34a' },
    amber: { bg: '#fff7ed', border: '#fed7aa', color: '#d97706' },
    red: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
  };
  const palette = tones[tone] || tones.blue;

  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: '20px', padding: '18px' }}>
      <div style={{ fontSize: '30px', fontWeight: 800, color: palette.color }}>{value}</div>
      <div style={{ marginTop: '8px', fontSize: '14px', color: '#334155', fontWeight: 600 }}>{label}</div>
    </div>
  );
};

const DialysisPatients = () => {
  const { isMobile } = useIsMobile();
  const { ToastContainer } = useAdminToast();
  const navigate = useNavigate();

  const [queueRows, setQueueRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBed, setSelectedBed] = useState('ALL');
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = formatToday();
      const [patientResult, appointmentResult] = await Promise.all([
        getPatients(),
        getAppointments({
          from: `${today}T00:00:00Z`,
          to: `${today}T23:59:59Z`,
        }),
      ]);

      if (!patientResult.success) {
        setError(patientResult.error || 'Failed to fetch patients');
        setLoading(false);
        return;
      }

      const allPatients = Array.isArray(patientResult.data?.data)
        ? patientResult.data.data
        : Array.isArray(patientResult.data)
          ? patientResult.data
          : [];

      const dialysisPatients = allPatients.filter(isDialysisPatient);
      const appointmentRows = appointmentResult.success
        ? (Array.isArray(appointmentResult.data?.data)
          ? appointmentResult.data.data
          : Array.isArray(appointmentResult.data)
            ? appointmentResult.data
            : [])
        : [];

      const queueData = dialysisPatients.map((patient, index) => {
        const matchingAppointments = appointmentRows.filter(
          (appointment) => String(appointment.patient_id || appointment.patientId) === String(patient.id)
        );
        const primaryAppointment = pickPrimaryAppointment(matchingAppointments);
        const status = primaryAppointment ? normalizeStatus(primaryAppointment.status || primaryAppointment.appointmentStatus) : 'PENDING';
        const timeLabel = primaryAppointment ? normalizeAppointmentTime(primaryAppointment) : '—';
        const shiftLabel = primaryAppointment ? deriveShiftLabel(timeLabel) : 'Pending';
        const priority = derivePriority(primaryAppointment);
        const ailment = Array.isArray(patient.ailments) ? patient.ailments.join(', ') : String(patient.ailments || patient.patient_ailments || 'Dialysis');

        return {
          id: patient.id,
          queueIndex: index + 1,
          patientCode: patient.patient_code || patient.patientCode || `P${String(patient.id).padStart(5, '0')}`,
          name: patient.name || patient.patient_name || `Patient #${patient.id}`,
          age: patient.age || patient.patient_age || calculateAgeFromDOB(patient.dob),
          gender: patient.gender || patient.patient_gender || patient.sex || '—',
          phone: patient.number || patient.phone_number || patient.phone || patient.mobile_no || patient.phone_no || '—',
          status,
          shiftLabel,
          appointmentTime: timeLabel,
          bedLabel: deriveBed(primaryAppointment),
          priority,
          ailment: ailment || 'Dialysis',
          appointment: primaryAppointment,
          raw: patient,
        };
      });

      setQueueRows(queueData);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return queueRows.filter((row) => {
      const matchesQuery = !query || [row.name, row.patientCode, row.phone, row.ailment]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
      const matchesShift = selectedShift === 'ALL' || row.shiftLabel === selectedShift;
      const matchesStatus = selectedStatus === 'ALL' || normalizeStatus(row.status) === selectedStatus;
      const matchesBed = selectedBed === 'ALL' || row.bedLabel === selectedBed;
      return matchesQuery && matchesShift && matchesStatus && matchesBed;
    });
  }, [queueRows, searchQuery, selectedShift, selectedStatus, selectedBed]);

  const shiftOptions = useMemo(() => ['ALL', ...Array.from(new Set(queueRows.map((row) => row.shiftLabel)))], [queueRows]);
  const statusOptions = useMemo(() => ['ALL', ...Array.from(new Set(queueRows.map((row) => normalizeStatus(row.status))))], [queueRows]);
  const bedOptions = useMemo(() => ['ALL', ...Array.from(new Set(queueRows.map((row) => row.bedLabel).filter((bed) => bed && bed !== '—')))], [queueRows]);

  const totalPatients = filteredRows.length;
  const completedCount = filteredRows.filter((row) => normalizeStatus(row.status) === 'COMPLETED').length;
  const inProgressCount = filteredRows.filter((row) => normalizeStatus(row.status) === 'IN_PROGRESS').length;
  const pendingCount = filteredRows.filter((row) => ['PENDING', 'WAITING', 'ARRIVED', 'MISSED', 'CANCELLED'].includes(normalizeStatus(row.status))).length;

  const columns = [
    {
      key: 'queueIndex',
      label: '#',
      type: 'custom',
      width: '56px',
      render: (row) => <div style={{ fontWeight: 700, color: '#334155', fontSize: '14px' }}>{row.queueIndex}</div>,
    },
    {
      key: 'patient',
      label: 'PATIENT',
      type: 'custom',
      width: '320px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{row.name}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>PID: {row.patientCode}</div>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            {row.gender} · {row.age} · {row.phone}
          </div>
        </div>
      ),
    },
    {
      key: 'shift',
      label: 'SHIFT / TIME',
      type: 'custom',
      width: '150px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{row.shiftLabel}</span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{row.appointmentTime}</span>
        </div>
      ),
    },
    {
      key: 'bed',
      label: 'BED',
      type: 'custom',
      width: '100px',
      render: (row) => <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>{row.bedLabel}</span>,
    },
    {
      key: 'status',
      label: 'STATUS',
      type: 'custom',
      width: '140px',
      render: (row) => {
        const style = getStatusStyle(row.status);
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '108px',
              padding: '6px 12px',
              borderRadius: '9999px',
              background: style.bg,
              color: style.text,
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {style.label}
          </span>
        );
      },
    },
    {
      key: 'priority',
      label: 'PRIORITY',
      type: 'custom',
      width: '120px',
      render: (row) => {
        const color = row.priority === 'High' ? '#ef4444' : row.priority === 'Medium' ? '#f59e0b' : '#10b981';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '9999px', background: color }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{row.priority}</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      type: 'custom',
      width: '180px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setSelectedPatientId(row.id);
              setSelectedPatientName(row.name);
              setIsTimelineOpen(true);
            }}
            style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #dbeafe', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontSize: '15px' }}
            title="Timeline"
          >
            👁
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.userProfile(row.id), { state: row.raw })}
            style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #dbeafe', background: '#fff', color: '#2563eb', cursor: 'pointer', fontSize: '18px', fontWeight: 700 }}
            title="Open full profile"
          >
            →
          </button>
        </div>
      ),
    },
  ];

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Today's Patient Queue"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Patients', active: true },
            ]}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`} style={{ background: '#f8fafc' }}>
          <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '24px',
                padding: isMobile ? '18px' : '22px 24px',
                boxShadow: '0 15px 35px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>Today's Patient Queue</div>
                  <div style={{ marginTop: '4px', color: '#64748b', fontSize: '14px' }}>
                    Dialysis patient list restructured into the queue layout, with existing timeline and profile access preserved.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      height: '40px',
                      minWidth: isMobile ? '100%' : '170px',
                      borderRadius: '12px',
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      padding: '0 14px',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#334155',
                      fontWeight: 600,
                    }}
                  >
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                  <Button variant="outline" onClick={fetchQueue}>Refresh</Button>
                  <Button variant="outline" onClick={() => setIsDashboardOpen(true)}>Overall Calendar View</Button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
              <QueueMetricCard value={totalPatients} label="Total Patients" tone="blue" />
              <QueueMetricCard value={completedCount} label="Completed" tone="green" />
              <QueueMetricCard value={inProgressCount} label="In Progress" tone="amber" />
              <QueueMetricCard value={pendingCount} label="Pending / Delayed" tone="red" />
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '24px',
                padding: isMobile ? '18px' : '20px 22px',
                boxShadow: '0 15px 35px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(220px, 1.2fr) repeat(3, minmax(150px, 0.8fr))', gap: '12px', alignItems: 'end' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>Search</div>
                  <Input
                    type="text"
                    placeholder="Search by name, ID, phone, ailment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>Shift</div>
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    style={{ width: '100%', height: '40px', borderRadius: '10px', border: '1px solid #d1d5db', padding: '0 12px', background: '#fff', fontSize: '14px' }}
                  >
                    {shiftOptions.map((option) => <option key={option} value={option}>{option === 'ALL' ? 'All Shifts' : option}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>Status</div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    style={{ width: '100%', height: '40px', borderRadius: '10px', border: '1px solid #d1d5db', padding: '0 12px', background: '#fff', fontSize: '14px' }}
                  >
                    {statusOptions.map((option) => <option key={option} value={option}>{option === 'ALL' ? 'All Status' : getStatusStyle(option).label}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>Bed</div>
                  <select
                    value={selectedBed}
                    onChange={(e) => setSelectedBed(e.target.value)}
                    style={{ width: '100%', height: '40px', borderRadius: '10px', border: '1px solid #d1d5db', padding: '0 12px', background: '#fff', fontSize: '14px' }}
                  >
                    {bedOptions.map((option) => <option key={option} value={option}>{option === 'ALL' ? 'All Beds' : option}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#fff',
                borderRadius: '24px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                boxShadow: '0 15px 35px rgba(15, 23, 42, 0.05)',
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center" style={{ minHeight: '240px' }}>
                  <p style={{ color: '#6B7280' }}>Loading patient queue...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center" style={{ minHeight: '240px', gap: '12px' }}>
                  <p style={{ color: '#DC2626' }}>{error}</p>
                  <Button variant="outline" onClick={fetchQueue}>Retry</Button>
                </div>
              ) : (
                <UnifiedListTable
                  columns={columns}
                  data={filteredRows}
                  emptyMessage="No dialysis patients found for the queue"
                  displayMode="table"
                  rowsPerPage={10}
                />
              )}
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '24px',
                padding: isMobile ? '18px' : '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>Status Legend</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#475569', fontSize: '13px' }}>
                  {[
                    ['Scheduled', '#2563eb'],
                    ['Pending', '#ef4444'],
                    ['In Progress', '#f59e0b'],
                    ['Completed', '#10b981'],
                  ].map(([label, color]) => (
                    <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '9999px', background: color }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>Priority</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#475569', fontSize: '13px' }}>
                  {[
                    ['High', '#ef4444'],
                    ['Medium', '#f59e0b'],
                    ['Low', '#10b981'],
                  ].map(([label, color]) => (
                    <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '9999px', background: color }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <BaseModal
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          title="Dialysis Booking Dashboard"
          size="full"
        >
          <DialysisAppointmentsDashboard clinicId={1} />
        </BaseModal>

        <BaseModal
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          title={`${selectedPatientName} - Appointment Timeline`}
          size="xl"
        >
          {selectedPatientId ? <PatientAppointmentTimeline patientId={selectedPatientId} /> : null}
        </BaseModal>

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default DialysisPatients;
