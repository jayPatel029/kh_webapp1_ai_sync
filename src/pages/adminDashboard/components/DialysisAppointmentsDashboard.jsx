/**
 * Dialysis Scheduler — week view of session occupancy by clinic.
 *
 * @file src/pages/adminDashboard/components/DialysisAppointmentsDashboard.jsx
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Flex, Heading, Input, Text } from '../../../component-library';
import { getOrganizations, getClinics, getAvailableSlots } from '../../../ApiCalls/clinicApis';

const MAX_DAYS = 31;
const INACTIVE_STATUSES = new Set(['CANCELLED', 'MISSED']);

const STATUS_STYLE = {
  COMPLETED: { bg: '#ECFDF5', color: '#166534' },
  CANCELLED: { bg: '#F1F5F9', color: '#64748B' },
  MISSED: { bg: '#FEF2F2', color: '#991B1B' },
  IN_PROGRESS: { bg: '#DBEAFE', color: '#1E40AF' },
  WAITING: { bg: '#FEF9C3', color: '#854D0E' },
  ARRIVED: { bg: '#F3E8FF', color: '#6B21A8' },
};

function toYmd(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toLocaleDateString('en-CA');
  return String(value).slice(0, 10);
}

function hhmmFromIso(iso) {
  if (!iso) return '';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return String(iso).slice(11, 16);
  return `${String(dt.getUTCHours()).padStart(2, '0')}:${String(dt.getUTCMinutes()).padStart(2, '0')}`;
}

function ymdFromIso(iso) {
  if (!iso) return '';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return String(iso).slice(0, 10);
  return dt.toISOString().slice(0, 10);
}

function formatTimeLabel(hhmm) {
  if (!hhmm) return '—';
  const [h, m] = String(hhmm).split(':').map(Number);
  if (!Number.isFinite(h)) return hhmm;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

function addDays(ymd, days) {
  const [y, m, d] = String(ymd).split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return dt.toLocaleDateString('en-CA');
}

function daysInclusive(from, to) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [];
  const list = [];
  const curr = new Date(start);
  let safety = 0;
  while (curr <= end && safety < MAX_DAYS) {
    list.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
    safety += 1;
  }
  return list;
}

function extractSlotPayload(res) {
  const body = res?.data;
  if (!body) return { instances: [], appointments: [] };
  if (Array.isArray(body)) return { instances: body, appointments: [] };
  const inner = body.data;
  if (Array.isArray(inner)) {
    return { instances: inner, appointments: body.appointments || [] };
  }
  return { instances: [], appointments: body.appointments || [] };
}

function statusStyle(status) {
  return STATUS_STYLE[String(status || '').toUpperCase()] || { bg: '#EFF6FF', color: '#1D4ED8' };
}

const selectStyle = {
  height: '36px',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  padding: '0 10px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#0F172A',
  background: '#fff',
  minWidth: '180px',
};

const DialysisAppointmentsDashboard = ({
  orgId: initialOrgId = '',
  clinicId: initialClinicId = '',
  onSelectAppointment,
}) => {
  const today = useMemo(() => new Date().toLocaleDateString('en-CA'), []);
  const [organizations, setOrganizations] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(String(initialOrgId || ''));
  const [selectedClinicId, setSelectedClinicId] = useState(String(initialClinicId || ''));
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(addDays(today, 6));
  const [instances, setInstances] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedOrgId(String(initialOrgId || ''));
  }, [initialOrgId]);

  useEffect(() => {
    setSelectedClinicId(String(initialClinicId || ''));
  }, [initialClinicId]);

  useEffect(() => {
    getOrganizations().then((res) => {
      if (res.success) setOrganizations(res.data?.data || res.data || []);
    });
  }, []);

  useEffect(() => {
    if (!selectedOrgId) {
      setClinics([]);
      return;
    }
    getClinics({ params: { orgId: selectedOrgId } }).then((res) => {
      if (!res.success) return;
      const list = res.data?.data || res.data || [];
      setClinics(Array.isArray(list) ? list : []);
    });
  }, [selectedOrgId]);

  useEffect(() => {
    if (!selectedOrgId || !clinics.length || selectedClinicId) return;
    const match = clinics.find((c) => String(c.organization_id || c.org_id) === String(selectedOrgId));
    if (match) setSelectedClinicId(String(match.id));
  }, [clinics, selectedOrgId, selectedClinicId]);

  useEffect(() => {
    if (!selectedClinicId || !fromDate || !toDate) {
      setInstances([]);
      setAppointments([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    getAvailableSlots(selectedClinicId, `${fromDate}T00:00:00Z`, `${toDate}T23:59:59Z`)
      .then((res) => {
        if (cancelled) return;
        if (!res.success) {
          setError(res.data?.message || 'Could not load scheduler data');
          setInstances([]);
          setAppointments([]);
          return;
        }
        const payload = extractSlotPayload(res);
        setInstances(payload.instances);
        setAppointments(payload.appointments);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load scheduler data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedClinicId, fromDate, toDate]);

  const dayList = useMemo(() => daysInclusive(fromDate, toDate), [fromDate, toDate]);

  const selectedClinic = useMemo(
    () => clinics.find((c) => String(c.id) === String(selectedClinicId)),
    [clinics, selectedClinicId],
  );

  const grid = useMemo(() => {
    const sessions = new Map();
    const cells = {};

    instances.forEach((inst) => {
      const start = String(inst.slotPattern?.startTime || hhmmFromIso(inst.instance?.startUTC)).slice(0, 5);
      const end = String(inst.slotPattern?.endTime || hhmmFromIso(inst.instance?.endUTC)).slice(0, 5);
      const date = ymdFromIso(inst.instance?.startUTC || inst.startUTC);
      if (!start || !date) return;
      const timeKey = `${start}-${end}`;
      if (!sessions.has(timeKey)) sessions.set(timeKey, { start, end });
      const cellKey = `${date}|${timeKey}`;
      const capacity = Number(inst.instance?.capacity || inst.clinic_capacity || 0);
      const booked = Number(inst.instance?.bookedCount || 0);
      if (!cells[cellKey]) {
        cells[cellKey] = {
          capacity,
          booked,
          remaining: Math.max(0, capacity - booked),
          patients: [],
        };
      }
    });

    appointments.forEach((appt) => {
      const status = String(appt.status || '').toUpperCase();
      const date = toYmd(appt.date || appt.appointment_date);
      const start = String(appt.startTime || appt.start_time || '').slice(0, 5);
      const end = String(appt.endTime || appt.end_time || '').slice(0, 5);
      if (!date || !start) return;
      let timeKey = `${start}-${end}`;
      if (!sessions.has(timeKey)) {
        const match = [...sessions.keys()].find((key) => key.startsWith(`${start}-`));
        timeKey = match || timeKey;
        if (!sessions.has(timeKey)) sessions.set(timeKey, { start, end });
      }
      const cellKey = `${date}|${timeKey}`;
      if (!cells[cellKey]) {
        cells[cellKey] = { capacity: 0, booked: 0, remaining: 0, patients: [] };
      }
      cells[cellKey].patients.push({
        id: appt.id,
        name: appt.patientName || `Patient #${appt.patientId || appt.id}`,
        status,
        raw: appt,
      });
    });

    const sessionRows = [...sessions.values()].sort((a, b) => String(a.start).localeCompare(String(b.start)));
    return { sessionRows, cells };
  }, [instances, appointments]);

  const handleFromChange = useCallback((value) => {
    if (!value) return;
    setFromDate(value);
    if (!toDate || toDate < value) setToDate(value);
  }, [toDate]);

  const handleToChange = useCallback((value) => {
    if (!value) return;
    setToDate(value < fromDate ? fromDate : value);
  }, [fromDate]);

  const handleOrgChange = useCallback((value) => {
    setSelectedOrgId(value);
    setSelectedClinicId('');
    setInstances([]);
    setAppointments([]);
  }, []);

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', minHeight: 0, background: '#F8FAFC', padding: 16 }}>
      <Box style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 18px' }}>
        <Flex justify="between" align="center" className="flex-wrap" style={{ gap: 12 }}>
          <Box>
            <Heading size="md" style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Scheduler</Heading>
            <Text style={{ margin: 0, fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              {selectedClinic ? (selectedClinic.clinic_name || selectedClinic.name) : 'Select a clinic to see session occupancy'}
            </Text>
          </Box>
          <Flex align="center" className="flex-wrap" style={{ gap: 8 }}>
            <select
              value={selectedOrgId}
              onChange={(e) => handleOrgChange(e.target.value)}
              style={selectStyle}
            >
              <option value="">Organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            <select
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              disabled={!selectedOrgId}
              style={{ ...selectStyle, background: selectedOrgId ? '#fff' : '#F8FAFC' }}
            >
              <option value="">Clinic</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>{clinic.clinic_name || clinic.name}</option>
              ))}
            </select>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => handleFromChange(e.target.value)}
              style={{ height: 36, width: 150, margin: 0 }}
            />
            <Text style={{ color: '#94A3B8', fontWeight: 700, fontSize: 12 }}>to</Text>
            <Input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => handleToChange(e.target.value)}
              style={{ height: 36, width: 150, margin: 0 }}
            />
          </Flex>
        </Flex>
      </Box>

      <Box style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selectedClinicId ? (
          <Flex direction="column" align="center" justify="center" style={{ flex: 1, padding: 48, gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Choose a clinic</Text>
            <Text style={{ fontSize: 13, color: '#64748B' }}>Organization and clinic are needed to load the session grid.</Text>
          </Flex>
        ) : loading ? (
          <Flex align="center" justify="center" style={{ flex: 1, color: '#64748B', fontWeight: 600 }}>
            Loading sessions…
          </Flex>
        ) : error ? (
          <Flex align="center" justify="center" style={{ flex: 1, color: '#B91C1C', fontWeight: 600 }}>
            {error}
          </Flex>
        ) : grid.sessionRows.length === 0 ? (
          <Flex direction="column" align="center" justify="center" style={{ flex: 1, padding: 48, gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>No sessions in this range</Text>
            <Text style={{ fontSize: 13, color: '#64748B' }}>Try another date range, or add slot timings for this clinic.</Text>
          </Flex>
        ) : (
          <Box style={{ overflow: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, zIndex: 2, background: '#F8FAFC', textAlign: 'left', padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0', width: 140 }}>
                    Session
                  </th>
                  {dayList.map((day) => {
                    const isToday = toYmd(day) === today;
                    return (
                      <th
                        key={toYmd(day)}
                        style={{
                          background: isToday ? '#EFF6FF' : '#F8FAFC',
                          textAlign: 'center',
                          padding: '12px 10px',
                          borderBottom: '1px solid #E2E8F0',
                          borderLeft: '1px solid #E2E8F0',
                          minWidth: 150,
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 800, color: isToday ? '#1D4ED8' : '#94A3B8', textTransform: 'uppercase' }}>
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                          {day.getDate()} {day.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {grid.sessionRows.map((session) => {
                  const timeKey = `${session.start}-${session.end}`;
                  return (
                    <tr key={timeKey}>
                      <td style={{ position: 'sticky', left: 0, zIndex: 1, background: '#fff', padding: '14px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'top' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{formatTimeLabel(session.start)}</div>
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{formatTimeLabel(session.end)}</div>
                      </td>
                      {dayList.map((day) => {
                        const date = toYmd(day);
                        const cell = grid.cells[`${date}|${timeKey}`];
                        const patients = (cell?.patients || []).filter((p) => !INACTIVE_STATUSES.has(p.status));
                        const remaining = cell ? cell.remaining : null;
                        const capacity = cell?.capacity || 0;
                        const bookedCount = patients.length;
                        const isFull = capacity > 0 && remaining === 0;
                        const hasBookings = bookedCount > 0;
                        return (
                          <td key={`${date}|${timeKey}`} style={{ padding: 8, borderBottom: '1px solid #F1F5F9', borderLeft: '1px solid #F1F5F9', verticalAlign: 'top' }}>
                            {!cell ? (
                              <div style={{ color: '#E2E8F0', fontSize: 12, textAlign: 'center', padding: 16 }}>—</div>
                            ) : (
                              <div style={{
                                border: hasBookings
                                  ? '1px solid #93C5FD'
                                  : isFull
                                    ? '1px solid #FECACA'
                                    : '1px solid #EDF2F7',
                                background: hasBookings ? '#FFFFFF' : isFull ? '#FEF2F2' : '#F8FAFC',
                                boxShadow: hasBookings ? '0 0 0 2px #DBEAFE' : 'none',
                                borderRadius: 10,
                                padding: hasBookings ? 10 : 8,
                                minHeight: 72,
                                opacity: hasBookings || isFull ? 1 : 0.55,
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: hasBookings ? 8 : 0 }}>
                                  <span style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: isFull ? '#B91C1C' : hasBookings ? '#1D4ED8' : '#94A3B8',
                                    textTransform: 'uppercase',
                                  }}>
                                    {isFull ? 'Full' : hasBookings ? `${bookedCount} booked` : 'Empty'}
                                  </span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: hasBookings ? '#0F172A' : '#94A3B8' }}>
                                    {remaining}/{capacity}
                                  </span>
                                </div>
                                {hasBookings && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {patients.slice(0, 4).map((patient) => {
                                      const tone = statusStyle(patient.status);
                                      return (
                                        // NOTE: do not open dialysis session details (pre/during/post) when a name is tapped.
                                        // onClick={() => onSelectAppointment?.(patient.raw)}
                                        <div
                                          key={patient.id}
                                          style={{
                                            background: tone.bg,
                                            color: tone.color,
                                            borderRadius: 6,
                                            padding: '4px 8px',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            textAlign: 'left',
                                            cursor: 'default',
                                          }}
                                        >
                                          {patient.name}
                                        </div>
                                      );
                                    })}
                                    {patients.length > 4 && (
                                      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>+{patients.length - 4} more</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        )}
      </Box>

      <Flex align="center" style={{ gap: 16, padding: '0 4px' }}>
        <Text style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>Empty = no patients</Text>
        <Text style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8' }}>Highlighted = has bookings</Text>
        <Text style={{ fontSize: 11, fontWeight: 700, color: '#B91C1C' }}>Full = no beds left</Text>
        <Text style={{ fontSize: 11, color: '#94A3B8', marginLeft: 'auto' }}>
          {dayList.length} day{dayList.length === 1 ? '' : 's'}
        </Text>
      </Flex>
    </Box>
  );
};

export default DialysisAppointmentsDashboard;
