/**
 * Dialysis Patients — P2-01 Queue / P2-02 Summary Container
 * Renders the Today's Patient Queue (P2-01) or Patient Summary (P2-02)
 * depending on whether a patient is selected via route state.
 *
 * @file src/pages/dialysis/DialysisPatients.jsx
 */

import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Input, Button } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import useDialysisQueue from '../../hooks/useDialysisQueue';
import PatientSummaryView from './PatientSummaryView';
import PreDialysisDashboardView from './PreDialysisDashboardView';
import PatientVerificationView from './PatientVerificationView';
import VitalsMeasurementsView from './VitalsMeasurementsView';
import { ROUTES } from '../../routes/routeConstants';
import {
  EMERGENCY_ACTION_ROLES,
  SHIFT_LABELS,
  QUEUE_STATUS_STYLES,
  PRIORITY_COLORS,
  KPI_TONES,
  getStatusStyle,
  normalizeStatus,
} from './dialysisQueueConstants';

// ---------------------------------------------------------------------------
// QueueMetricCard — small KPI tile used in the metrics row
// ---------------------------------------------------------------------------

const QueueMetricCard = ({ value, label, tone }) => {
  const palette = KPI_TONES[tone] || KPI_TONES.blue;

  return (
    <div
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: '20px',
        padding: '18px',
      }}
    >
      <div style={{ fontSize: '30px', fontWeight: 800, color: palette.color }}>
        {value}
      </div>
      <div style={{ marginTop: '8px', fontSize: '14px', color: '#334155', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Shift label helper — maps raw value to display text
// ---------------------------------------------------------------------------

const getShiftDisplayLabel = (value) => {
  if (value === 'ALL') return 'All Shifts';
  const match = SHIFT_LABELS.find((s) => s.value === value);
  return match ? match.label : value;
};

// ---------------------------------------------------------------------------
// DialysisPatients — P2-01 Queue / P2-02 Summary / P2-03 Dashboard / P2-04 Verification / P2-05 Vitals router
// ---------------------------------------------------------------------------

const DialysisPatients = () => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const roleName = useSelector((state) => state.permission?.role_name);

  // Selected patient and requested sub-view/step
  const selectedPatientId = location.state?.patientId;
  const currentStep = location.state?.step;
  const isDashboardView =
    location.state?.view === 'dashboard' || currentStep === 'P2-03';
  const isVerificationStep = currentStep === 'P2-04' || currentStep === 'verification';
  const isVitalsStep = currentStep === 'P2-05' || currentStep === 'vitals';

  // If Vitals & Measurements (P2-05) step requested
  if (selectedPatientId && isVitalsStep) {
    return (
      <VitalsMeasurementsView
        patientId={selectedPatientId}
        onBack={() =>
          navigate(ROUTES.DIALYSIS_PATIENTS, {
            state: { patientId: selectedPatientId, step: 'P2-04' },
          })
        }
        onNext={() =>
          navigate(ROUTES.DIALYSIS_PATIENTS, {
            state: { patientId: selectedPatientId, step: 'P2-06' },
          })
        }
      />
    );
  }

  // If Patient Verification (P2-04) step requested
  if (selectedPatientId && isVerificationStep) {
    return (
      <PatientVerificationView
        patientId={selectedPatientId}
        onBack={() =>
          navigate(ROUTES.DIALYSIS_PATIENTS, {
            state: { patientId: selectedPatientId, view: 'dashboard', step: 'P2-03' },
          })
        }
        onNext={() =>
          navigate(ROUTES.DIALYSIS_PATIENTS, {
            state: { patientId: selectedPatientId, step: 'P2-05' },
          })
        }
      />
    );
  }

  // If dashboard view (P2-03) requested for patient
  if (selectedPatientId && isDashboardView) {
    return (
      <PreDialysisDashboardView
        patientId={selectedPatientId}
        onBack={() =>
          navigate(ROUTES.DIALYSIS_PATIENTS, {
            state: { patientId: selectedPatientId },
          })
        }
        onNavigateStep={(stepCode) =>
          navigate(ROUTES.DIALYSIS_PATIENTS, {
            state: { patientId: selectedPatientId, step: stepCode },
          })
        }
      />
    );
  }

  // If route state carries a patientId, render Patient Summary (P2-02)
  if (selectedPatientId) {
    return (
      <PatientSummaryView
        patientId={selectedPatientId}
        appointment={location.state?.appointment}
        onBack={() => navigate(ROUTES.DIALYSIS_PATIENTS, { replace: true })}
      />
    );
  }

  // Otherwise render the Queue view (P2-01)
  return <QueueView isMobile={isMobile} navigate={navigate} roleName={roleName} />;
};

// ---------------------------------------------------------------------------
// QueueView — the P2-01 Today's Patient Queue
// ---------------------------------------------------------------------------

const QueueView = ({ isMobile, navigate, roleName }) => {
  const {
    queueRows,
    loading,
    error,
    refresh,
    markEmergency,
    searchQuery,
    setSearchQuery,
    selectedShift,
    setSelectedShift,
    selectedStatus,
    setSelectedStatus,
    selectedBed,
    setSelectedBed,
    shiftOptions,
    statusOptions,
    bedOptions,
    totalPatients,
    completedCount,
    inProgressCount,
    pendingCount,
  } = useDialysisQueue();

  // ---- Navigate to Patient Summary ----

  const goToSummary = (row) => {
    navigate(ROUTES.DIALYSIS_PATIENTS, {
      state: { patientId: row.id, appointment: row.appointment },
    });
  };

  // ---- Column definitions ----

  const columns = useMemo(
    () => [
      {
        key: 'queueIndex',
        label: '#',
        type: 'custom',
        width: '56px',
        render: (row) => (
          <div style={{ fontWeight: 700, color: '#334155', fontSize: '14px' }}>
            {row.queueIndex}
          </div>
        ),
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
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              {row.shiftLabel}
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{row.appointmentTime}</span>
          </div>
        ),
      },
      {
        key: 'bed',
        label: 'BED',
        type: 'custom',
        width: '100px',
        render: (row) => (
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
            {row.bedLabel}
          </span>
        ),
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
          const dotColor = PRIORITY_COLORS[row.priority] || PRIORITY_COLORS.Low;
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '9999px',
                  background: dotColor,
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                {row.priority}
              </span>
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
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* View — opens patient summary */}
            <button
              type="button"
              onClick={() => goToSummary(row)}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                border: '1px solid #dbeafe',
                background: '#eff6ff',
                color: '#2563eb',
                cursor: 'pointer',
                fontSize: '15px',
              }}
              title="View patient summary"
            >
              👁
            </button>

            {/* Proceed — also opens patient summary */}
            <button
              type="button"
              onClick={() => goToSummary(row)}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                border: '1px solid #dbeafe',
                background: '#fff',
                color: '#2563eb',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 700,
              }}
              title="Proceed to summary"
            >
              →
            </button>

            {/* Mark Emergency — role-gated */}
            {EMERGENCY_ACTION_ROLES.includes(roleName) && (
              <button
                type="button"
                onClick={() => markEmergency(row.appointmentId)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  border: '1px solid #fed7aa',
                  background: '#fff7ed',
                  color: '#d97706',
                  cursor: 'pointer',
                  fontSize: '15px',
                }}
                title="Mark as emergency"
              >
                ⚡
              </button>
            )}
          </div>
        ),
      },
    ],
    [roleName, markEmergency] // eslint-disable-line react-hooks/exhaustive-deps
  );

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

        <div
          className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`}
          style={{ background: '#f8fafc' }}
        >
          <div
            style={{
              maxWidth: '1320px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* ---- Header Card ---- */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '24px',
                padding: isMobile ? '18px' : '22px 24px',
                boxShadow: '0 15px 35px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'stretch' : 'center',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
                    Today's Patient Queue
                  </div>
                  <div style={{ marginTop: '4px', color: '#64748b', fontSize: '14px' }}>
                    Appointment-driven dialysis queue for today. View patient summaries, track
                    progress, and manage emergencies.
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
                    {new Date().toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                  <Button variant="outline" onClick={refresh}>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* ---- KPI Row ---- */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))',
                gap: '14px',
              }}
            >
              <QueueMetricCard value={totalPatients} label="Total Patients" tone="blue" />
              <QueueMetricCard value={completedCount} label="Completed" tone="green" />
              <QueueMetricCard value={inProgressCount} label="In Progress" tone="amber" />
              <QueueMetricCard value={pendingCount} label="Pending / Delayed" tone="red" />
            </div>

            {/* ---- Filter Bar ---- */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '24px',
                padding: isMobile ? '18px' : '20px 22px',
                boxShadow: '0 15px 35px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile
                    ? '1fr'
                    : 'minmax(220px, 1.2fr) repeat(3, minmax(150px, 0.8fr))',
                  gap: '12px',
                  alignItems: 'end',
                }}
              >
                {/* Search */}
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: '#64748b',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    Search
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by name or ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>

                {/* Shift */}
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: '#64748b',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    Shift
                  </div>
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      padding: '0 12px',
                      background: '#fff',
                      fontSize: '14px',
                    }}
                  >
                    {shiftOptions.map((option) => (
                      <option key={option} value={option}>
                        {getShiftDisplayLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: '#64748b',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    Status
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      padding: '0 12px',
                      background: '#fff',
                      fontSize: '14px',
                    }}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'ALL' ? 'All Status' : getStatusStyle(option).label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bed */}
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: '#64748b',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    Bed
                  </div>
                  <select
                    value={selectedBed}
                    onChange={(e) => setSelectedBed(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      padding: '0 12px',
                      background: '#fff',
                      fontSize: '14px',
                    }}
                  >
                    {bedOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'ALL' ? 'All Beds' : option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ---- Data Table ---- */}
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
                <div
                  className="flex items-center justify-center"
                  style={{ minHeight: '240px' }}
                >
                  <p style={{ color: '#6B7280' }}>Loading patient queue...</p>
                </div>
              ) : error ? (
                <div
                  className="flex flex-col items-center justify-center"
                  style={{ minHeight: '240px', gap: '12px' }}
                >
                  <p style={{ color: '#DC2626' }}>{error}</p>
                  <Button variant="outline" onClick={refresh}>
                    Retry
                  </Button>
                </div>
              ) : (
                <UnifiedListTable
                  columns={columns}
                  data={queueRows}
                  emptyMessage="No patients scheduled for today"
                  displayMode="table"
                  rowsPerPage={10}
                />
              )}
            </div>

            {/* ---- Footer Legend ---- */}
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
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '10px',
                  }}
                >
                  Status Legend
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                    color: '#475569',
                    fontSize: '13px',
                  }}
                >
                  {[
                    ['Scheduled', '#2563eb'],
                    ['Pending', '#ef4444'],
                    ['In Progress', '#f59e0b'],
                    ['Completed', '#10b981'],
                  ].map(([label, color]) => (
                    <span
                      key={label}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '9999px',
                          background: color,
                        }}
                      />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '10px',
                  }}
                >
                  Priority
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                    color: '#475569',
                    fontSize: '13px',
                  }}
                >
                  {[
                    ['High', '#ef4444'],
                    ['Medium', '#f59e0b'],
                    ['Low', '#10b981'],
                  ].map(([label, color]) => (
                    <span
                      key={label}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '9999px',
                          background: color,
                        }}
                      />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default DialysisPatients;
