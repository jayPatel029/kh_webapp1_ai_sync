/**
 * PreDialysisDashboardView — P2-03 Pre-Dialysis Dashboard Screen
 *
 * Full implementation of P2-03 Pre-Dialysis Dashboard per the Part 2 specification:
 *  - Header bar with title, subtitle, facility selector, notifications, technician profile,
 *    and role-gated Print Summary button (hidden unless Nephrologist/Doctor).
 *  - Patient Info Bar with demographics, 2x4 details grid, Today's Assignment card (B-02/HD-01 format).
 *  - 3-column body: Pre-Dialysis Workflow checklist, Latest Vitals & Pre-Dialysis Summary,
 *    Alerts & Notifications, Pending Tasks, and Notes with empty state treatment.
 *  - Footer: Asia/Kolkata (IST) timestamp note and refresh indicator.
 *  - ABDM consent revocation access control for Technician role.
 *
 * @file src/pages/dialysis/PreDialysisDashboardView.jsx
 */

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import { Box, Button } from '../../component-library';
import AutoCollapseTextarea from '../../components/AutoCollapseTextarea';
import PageHeader from '../../components/PageHeader';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import usePreDialysisDashboard, {
  PRE_DIALYSIS_STEPS,
  STEP_STATUS,
} from '../../hooks/usePreDialysisDashboard';
import { ALERT_SEVERITY, getSeverityStyle } from './dialysisQueueConstants';
import { ROUTES } from '../../routes/routeConstants';

// ---------------------------------------------------------------------------
// Styling Tokens
// ---------------------------------------------------------------------------

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  padding: '20px',
};

const SECTION_HEADER_STYLE = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

// Step Status Badge Renderer
const renderStepStatusBadge = (status) => {
  switch (status) {
    case STEP_STATUS.COMPLETE:
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: '#dcfce7',
            color: '#15803d',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          ✓ Complete
        </span>
      );
    case STEP_STATUS.IN_PROGRESS:
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: '#fef3c7',
            color: '#b45309',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          ⏱ In Progress
        </span>
      );
    case STEP_STATUS.NOT_STARTED:
    default:
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: '#f1f5f9',
            color: '#64748b',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          ○ Not Started
        </span>
      );
  }
};

// ---------------------------------------------------------------------------
// PreDialysisDashboardView Component
// ---------------------------------------------------------------------------

const PreDialysisDashboardView = ({ patientId, sessionId: propSessionId, onBack, onNavigateStep }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const roleName = useSelector((state) => state.permission?.role_name) || 'Dialysis Technician';

  const effectiveSessionId = useMemo(() => {
    if (propSessionId) return propSessionId;
    try {
      const fromState = location.state?.sessionId || location.state?.session_id || location.state?.dialysis_session_id;
      if (fromState) return fromState;
      const persisted = localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId');
      if (persisted) return persisted;
    } catch {}
    return patientId || 1;
  }, [propSessionId, location.state, patientId]);

  const {
    patientInfo,
    latestVitals,
    preDialysisSummary,
    alerts,
    pendingTasks,
    notes,
    stepStatuses,
    overallProgress,
    canStartDialysis,
    printSummaryAllowed,
    isTechnicianBlocked,
    loading,
    error,
    lastRefreshed,
    refresh,
    addNote,
  } = usePreDialysisDashboard(patientId, roleName, effectiveSessionId);

  const [newNoteText, setNewNoteText] = useState('');
  const [showAddNoteInput, setShowAddNoteInput] = useState(false);

  // Handle Add Note action
  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (newNoteText.trim()) {
      addNote(newNoteText);
      setNewNoteText('');
      setShowAddNoteInput(false);
    }
  };

  // Handle Print Summary action (Nephrologist / Doctor only)
  const handlePrintSummary = () => {
    window.print();
  };

  // Handle Step Click
  const handleStepClick = (step) => {
    if (onNavigateStep) {
      onNavigateStep(step.code, step);
    } else {
      // Default fallback navigation to Dialysis Patients or specific step
      navigate(ROUTES.DIALYSIS_PATIENTS, {
        state: { patientId, step: step.code },
      });
    }
  };

  // Handle Save as Draft — like P2-04 footer pattern
  const handleSaveDraft = () => {
    alert('Pre-dialysis dashboard draft saved locally.');
  };

  const handleSaveContinue = () => {
    if (onNavigateStep) onNavigateStep('P2-04');
    else navigate(ROUTES.DIALYSIS_PATIENTS, { state: { patientId, step: 'P2-04' } });
  };

  // Handle Back
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(ROUTES.DIALYSIS_PATIENTS, {
        state: { patientId },
      });
    }
  };

  // Guard states
  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '16px' }}>
        Loading Pre-Dialysis Dashboard...
      </div>
    );
  }

  // ABDM Consent Revocation Gate for Technician role
  if (isTechnicianBlocked) {
    return (
      <ThemeProvider>
        <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] p-6">
          <div
            style={{
              maxWidth: '600px',
              margin: '60px auto',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#991b1b', marginBottom: '12px' }}>
              Access Blocked — Consent Revoked
            </h2>
            <p style={{ color: '#7f1d1d', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
              Patient consent has been revoked. This record is no longer accessible to Technician role.
            </p>
            <Button variant="outline" onClick={handleBackClick}>
              ← Back to Patient Queue
            </Button>
          </div>
        </Box>
      </ThemeProvider>
    );
  }

  if (error || !patientInfo) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: '16px', fontSize: '15px' }}>
          {error || 'Patient data not available'}
        </p>
        <Button variant="outline" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
        {/* Sticky Header */}
        <Box className="sticky top-[56px] z-20 bg-white shadow-sm">
          {/* <PageHeader
            title="P2-03 – Pre-Dialysis Dashboard"
            subtitle="Ensure all safety checks and assessments are completed before starting dialysis"
            breadcrumbs={[
              { label: 'Pre-Dialysis Queue', path: ROUTES.DIALYSIS_PATIENTS },
              { label: 'Patient Summary', onClick: handleBackClick },
              { label: 'Pre-Dialysis Dashboard', active: true },
            ]}
          /> */}
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : 'p-6'}`}>
          {/* Top Bar Action Row: Back Link + Role-gated Print Summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <button
              type="button"
              onClick={handleBackClick}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ← Back to Patient Summary
            </button>

            {/* Print Summary — HIDDEN from Nurse and Technician, shown ONLY for Nephrologist/Doctor */}
            {printSummaryAllowed && (
              <Button variant="outline" size="sm" onClick={handlePrintSummary}>
                🖨 Print Summary
              </Button>
            )}
          </div>

          <PreDialysisPatientProfileCard
            patient={patientInfo}
            isMobile={isMobile}
            onViewProfile={() => navigate(ROUTES.userProfile(patientInfo.id))}
          />

          {/* ----------------------------------------------------------------- */}
          {/* 3-Column Body Layout                                              */}
          {/* ----------------------------------------------------------------- */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* --------------------------------------------------------------- */}
            {/* Column 1: Pre-Dialysis Workflow Checklist (4/12)                 */}
            {/* --------------------------------------------------------------- */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
              <div style={CARD_STYLE}>
                <div style={SECTION_HEADER_STYLE}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <ChecklistOutlinedIcon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 20 }} />
                    Pre-Dialysis Workflow
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                    9 Steps
                  </span>
                </div>

                {/* 9-step Numbered Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {PRE_DIALYSIS_STEPS.map((step) => {
                    const status = stepStatuses[step.key] || STEP_STATUS.NOT_STARTED;
                    const isStep9 = step.id === 9;
                    const isDisabledStep9 = isStep9 && !canStartDialysis;

                    return (
                      <div
                        key={step.id}
                        onClick={() => !isDisabledStep9 && handleStepClick(step)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #f1f5f9',
                          background: status === STEP_STATUS.COMPLETE ? '#f8fafc' : '#ffffff',
                          cursor: isDisabledStep9 ? 'not-allowed' : 'pointer',
                          opacity: isDisabledStep9 ? 0.6 : 1,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '9999px',
                              background: '#e2e8f0',
                              color: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700,
                            }}
                          >
                            {step.id}
                          </span>
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: isDisabledStep9 ? '#94a3b8' : '#0f172a',
                            }}
                          >
                            {step.name}
                          </span>
                        </div>

                        <div>{renderStepStatusBadge(status)}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Bar & Percentage */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    <span>Overall Progress</span>
                    <span style={{ color: '#2563eb' }}>{overallProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${overallProgress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Callout Banner */}
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <InfoOutlinedIcon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 18 }} />
                  <span>Complete all mandatory steps to enable Start Dialysis.</span>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* Column 2: Latest Vitals & Pre-Dialysis Summary (4/12)            */}
            {/* --------------------------------------------------------------- */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Latest Vitals Card */}
              <div style={CARD_STYLE}>
                <div style={SECTION_HEADER_STYLE}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <MonitorHeartOutlinedIcon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 20 }} />
                    Latest Vitals
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Reference Ranges</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>BP</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {latestVitals.bp}
                    </div>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>{latestVitals.bpTag}</span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Pulse</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {latestVitals.pulse}
                    </div>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>{latestVitals.pulseTag}</span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Temp</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {latestVitals.temp}
                    </div>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>{latestVitals.tempTag}</span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SpO₂</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {latestVitals.spo2}
                    </div>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>{latestVitals.spo2Tag}</span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Weight (Pre)</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {latestVitals.preWeight}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Resp Rate</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {latestVitals.respRate}
                    </div>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>{latestVitals.respRateTag}</span>
                  </div>
                </div>
              </div>

              {/* Pre-Dialysis Summary Card */}
              <div style={CARD_STYLE}>
                <div style={SECTION_HEADER_STYLE}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <TaskAltOutlinedIcon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 20 }} />
                    Pre-Dialysis Summary
                  </span>
                  <button
                    type="button"
                    onClick={handleBackClick}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    View Prescription →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px border-gray-100', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Target UF Goal</span>
                    <strong style={{ color: '#2563eb', fontSize: '14px' }}>{preDialysisSummary.targetUfGoal}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px border-gray-100', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Expected Treatment Time</span>
                    <strong>{preDialysisSummary.expectedTreatmentTime}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px border-gray-100', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Blood Flow Rate (BFR)</span>
                    <strong>{preDialysisSummary.bfr}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px border-gray-100', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Dialysate Flow Rate (DFR)</span>
                    <strong>{preDialysisSummary.dfr}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px border-gray-100', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Dialysate Temp</span>
                    <strong>{preDialysisSummary.dialysateTemp}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Electrolytes (Na+ / K+ / HCO3-)</span>
                    <strong>{preDialysisSummary.na} / {preDialysisSummary.k} / {preDialysisSummary.bicarbonate}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* Column 3: Alerts, Pending Tasks, Notes (4/12)                   */}
            {/* --------------------------------------------------------------- */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Alerts & Notifications Card */}
              <div style={CARD_STYLE}>
                <div style={SECTION_HEADER_STYLE}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <NotificationsNoneOutlinedIcon aria-hidden="true" sx={{ color: '#dc2626', fontSize: 20 }} />
                    Alerts & Notifications
                  </span>
                  <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700 }}>
                    {alerts.length} Active
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {alerts.map((alert) => {
                    const style = getSeverityStyle(alert.severity);
                    return (
                      <div
                        key={alert.id}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: style.color }}>
                            {alert.title}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{alert.date}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#334155' }}>{alert.message}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pending Tasks Card */}
              <div style={CARD_STYLE}>
                <div style={SECTION_HEADER_STYLE}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <TaskAltOutlinedIcon aria-hidden="true" sx={{ color: '#d97706', fontSize: 20 }} />
                    Pending Tasks
                  </span>
                  <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 700 }}>
                    {pendingTasks.length} Remaining
                  </span>
                </div>

                {pendingTasks.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600, padding: '8px 0' }}>
                    ✓ All mandatory safety checks completed!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pendingTasks.map((task, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '13px',
                          color: '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 0',
                          borderBottom: idx < pendingTasks.length - 1 ? '1px solid #f1f5f9' : 'none',
                        }}
                      >
                        <span style={{ color: '#d97706' }}>●</span>
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes Card */}
              <div style={CARD_STYLE}>
                <div style={SECTION_HEADER_STYLE}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <NoteAltOutlinedIcon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 20 }} />
                    Notes
                  </span>
                  {!showAddNoteInput && (
                    <button
                      type="button"
                      onClick={() => setShowAddNoteInput(true)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Add Note
                    </button>
                  )}
                </div>

                {showAddNoteInput && (
                  <form onSubmit={handleAddNoteSubmit} style={{ marginBottom: '14px' }}>
                    <AutoCollapseTextarea
                      aria-label="Pre-dialysis note"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Type note here..."
                      style={{
                        fontSize: '13px',
                        marginBottom: '8px',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" onClick={() => setShowAddNoteInput(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" type="submit">
                        Save Note
                      </Button>
                    </div>
                  </form>
                )}

                {notes.length === 0 ? (
                  <div style={{ padding: '16px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No notes available.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        style={{
                          background: '#f8fafc',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ color: '#334155', marginBottom: '4px' }}>{note.text}</div>
                        <div style={{ color: '#94a3b8', fontSize: '10px' }}>
                          — Added {note.date} by {note.author}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Footer Action Bar — Save / Save as Draft like P2-04                 */}
          {/* ----------------------------------------------------------------- */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '20px',
              marginTop: '32px',
              borderTop: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <Button variant="outline" onClick={handleBackClick}>
              ← Back
            </Button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={handleSaveDraft}>
                Save as Draft
              </Button>
              <Button variant="brand" onClick={handleSaveContinue}>
                Save & Continue →
              </Button>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Footer — IST timestamp                                            */}
          {/* ----------------------------------------------------------------- */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748b',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>All times are in Asia/Kolkata (IST)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Data refreshed just now</span>
              <button
                type="button"
                onClick={refresh}
                title="Refresh dashboard data"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: 0 }}
              >
                ↻
              </button>
            </div>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default PreDialysisDashboardView;
