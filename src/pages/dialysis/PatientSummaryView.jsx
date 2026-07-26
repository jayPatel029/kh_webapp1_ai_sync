/**
 * PatientSummaryView — P2-02 Patient Summary
 *
 * Rendered inline by DialysisPatients.jsx when a patient is selected
 * via route state.  Displays a full patient banner, tabbed overview
 * with prescription / vitals / labs / alerts / notes cards, and an
 * action footer with role-gated navigation.
 *
 * @file src/pages/dialysis/PatientSummaryView.jsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Button } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { ROUTES } from '../../routes/routeConstants';
import usePatientSummary from '../../hooks/usePatientSummary';
import { proceedPatientToPredialysis } from '../../ApiCalls/preDialysisApis';
import {
  TECHNICIAN_ROLE,
  SUMMARY_TABS,
  ALERT_SEVERITY,
} from './dialysisQueueConstants';

// ---------------------------------------------------------------------------
// Style constants (matching the existing codebase visual language)
// ---------------------------------------------------------------------------

const CARD_STYLE = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '20px',
  padding: '22px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
};

const BANNER_STYLE = {
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
  border: '1px solid #dbeafe',
  borderRadius: '28px',
  padding: '28px',
};

const SEVERITY_COLORS = {
  [ALERT_SEVERITY.CRITICAL]: { bg: '#dc2626', text: '#fff' },
  [ALERT_SEVERITY.WARNING]: { bg: '#d97706', text: '#fff' },
  [ALERT_SEVERITY.INFO]: { bg: '#2563eb', text: '#fff' },
};

const LAB_FLAG_COLORS = {
  High: { bg: '#fef2f2', text: '#dc2626' },
  Low: { bg: '#fff7ed', text: '#dc2626' },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Small metadata card inside the patient banner (right side). */
const MetaCard = ({ label, value }) => (
  <div
    style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      padding: '12px 16px',
    }}
  >
    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
      {label}
    </div>
    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}>
      {value || '—'}
    </div>
  </div>
);

/** Generic titled card wrapper used by overview sections. */
const SectionCard = ({ title, subtitle, children, style: extraStyle }) => (
  <div style={{ ...CARD_STYLE, ...extraStyle }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
      <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '12px', color: '#64748b' }}>{subtitle}</div>}
    </div>
    {children}
  </div>
);

/** Key-value row used inside prescription / vitals cards. */
const KVRow = ({ label, value }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9',
    }}
  >
    <span style={{ fontSize: '14px', color: '#475569' }}>{label}</span>
    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{value || '—'}</span>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const PatientSummaryView = ({ patientId, appointment, onBackToQueue, onProceedToPreDialysis }) => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const roleName = useSelector((state) => state.permission?.role_name);

  const {
    patientBanner,
    prescription,
    vitals,
    labs,
    alerts,
    notes,
    hasActivePrescription,
    loading,
    error,
    refresh,
  } = usePatientSummary(patientId);

  const [activeTab, setActiveTab] = useState('Overview');

  // ------ Guard states ------

  if (!patientId) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '16px' }}>
        No patient selected
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '16px' }}>
        Loading patient summary...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: '16px', fontSize: '15px' }}>{error}</p>
        <Button variant="outline" onClick={refresh}>Retry</Button>
      </div>
    );
  }

  // ------ Derived values (safe against null banner) ------

  const nameInitial = (patientBanner?.name || '?')[0].toUpperCase();
  const formattedFirstDate = patientBanner?.firstDialysisDate
    ? new Date(patientBanner.firstDialysisDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  // ------ Navigation handlers ------

  const handleEditInfo = () => {
    if (patientBanner?.id) {
      navigate(ROUTES.userProfile(patientBanner.id), { state: patientBanner.raw });
    }
  };

  const handleViewFullProfile = () => {
    if (patientBanner?.id) {
      navigate(ROUTES.userProfile(patientBanner.id), { state: patientBanner.raw });
    }
  };

  const handleProceedToPreDialysis = async () => {
    if (hasActivePrescription) {
      try {
        await proceedPatientToPredialysis(patientId);
      } catch (_) {}
      if (onProceedToPreDialysis) {
        onProceedToPreDialysis();
      } else {
        navigate(ROUTES.DIALYSIS_PATIENTS, {
          state: { patientId, view: 'dashboard', step: 'P2-03', patient: patientBanner?.raw },
        });
      }
    }
  };

  // ------ Tab content renderers ------

  const renderOverviewTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Row 1 — Prescription + Vitals */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '18px' }}>
        {/* Current Prescription */}
        <SectionCard title="Current Prescription">
          {prescription ? (
            <>
              <KVRow label="Dialyzer" value={prescription.dialyzer} />
              <KVRow label="Blood Flow Rate" value={prescription.bloodFlowRate} />
              <KVRow label="Dialysate Flow Rate" value={prescription.dialysateFlowRate} />
              <KVRow label="Dialysis Time" value={prescription.dialysisTime} />
              <KVRow label="Heparin" value={prescription.heparin} />
              <div style={{ marginTop: '14px', fontSize: '12px', color: '#64748b' }}>
                Last Updated: {prescription.lastUpdated || '—'} by {prescription.updatedBy || '—'}
              </div>
            </>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
              No active prescription found
            </div>
          )}
        </SectionCard>

        {/* Latest Vitals */}
        <SectionCard title="Latest Vitals" subtitle={vitals?.date}>
          <KVRow label="BP" value={vitals?.bp} />
          <KVRow label="Pulse" value={vitals?.pulse} />
          <KVRow label="Temperature" value={vitals?.temperature} />
          <KVRow label="SpO₂" value={vitals?.spo2} />
          <KVRow label="Weight (Pre)" value={vitals?.preWeight} />
          <KVRow label="Weight (Post)" value={vitals?.postWeight || '—'} />
        </SectionCard>
      </div>

      {/* Row 2 — Labs + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '18px' }}>
        {/* Recent Labs */}
        <SectionCard title="Recent Labs" subtitle={labs?.date}>
          {labs?.items?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {labs.items.map((lab, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ fontSize: '14px', color: '#475569' }}>{lab.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      {lab.value} {lab.unit}
                    </span>
                    {lab.flag && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: (LAB_FLAG_COLORS[lab.flag] || LAB_FLAG_COLORS.High).bg,
                          color: (LAB_FLAG_COLORS[lab.flag] || LAB_FLAG_COLORS.High).text,
                        }}
                      >
                        {lab.flag}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
              No lab results available
            </div>
          )}
        </SectionCard>

        {/* Alerts */}
        <SectionCard title="Alerts">
          {alerts?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alerts.map((alert, idx) => {
                const sev = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS[ALERT_SEVERITY.INFO];
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ fontSize: '14px', color: '#334155' }}>{alert.text}</span>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: sev.bg,
                        color: sev.text,
                      }}
                    >
                      {alert.severity}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
              No critical alerts recorded
            </div>
          )}
        </SectionCard>
      </div>

      {/* Row 3 — Notes (full-width) */}
      <SectionCard title="Notes">
        {notes?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notes.map((note, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 0',
                  borderBottom: idx < notes.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>{note.text}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  {note.author} · {note.date}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            No notes added yet
          </div>
        )}
      </SectionCard>
    </div>
  );

  const renderPlaceholderTab = () => (
    <div style={{ ...CARD_STYLE, textAlign: 'center', padding: '60px 22px' }}>
      <div style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 600 }}>Coming soon</div>
      <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '6px' }}>
        The "{activeTab}" tab is under development.
      </div>
    </div>
  );

  // ------ Render ------

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Top bar — Back button */}
      <div style={{ padding: isMobile ? '12px 16px' : '14px 24px' }}>
        <Button
          variant="outline"
          onClick={onBackToQueue}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
        >
          ← Back to Queue
        </Button>
      </div>

      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: isMobile ? '0 16px 80px' : '0 24px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        {/* ----------------------------------------------------------------- */}
        {/* Patient Banner                                                     */}
        {/* ----------------------------------------------------------------- */}
        <div style={BANNER_STYLE}>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '24px',
              alignItems: isMobile ? 'stretch' : 'flex-start',
            }}
          >
            {/* Left — avatar + demographics */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                {/* Avatar */}
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#2563eb',
                    flexShrink: 0,
                  }}
                >
                  {nameInitial}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '34px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                      {patientBanner?.name || '—'}
                    </h2>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: '9999px',
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      PID: {patientBanner?.patientCode || '—'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap', color: '#475569', fontSize: '14px' }}>
                    <span>{patientBanner?.age ?? '—'} Years, {patientBanner?.gender || '—'}</span>
                    <span style={{ color: '#cbd5e1' }}>·</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      📞 {patientBanner?.phone || '—'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap', color: '#64748b', fontSize: '13px' }}>
                    <span>First Dialysis: {formattedFirstDate} {patientBanner?.firstDialysisDuration || ''}</span>
                    <span style={{ color: '#cbd5e1' }}>·</span>
                    <span>Regular Schedule: {patientBanner?.schedule || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — clinical metadata grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(130px, 1fr))',
                gap: '10px',
                flexShrink: 0,
              }}
            >
              <MetaCard label="Nephrologist" value={patientBanner?.nephrologist} />
              <MetaCard label="Primary Diagnosis" value={patientBanner?.diagnosis} />
              <MetaCard label="Dialysis Type" value={patientBanner?.dialysisType} />
              <MetaCard label="Vascular Access" value={patientBanner?.vascularAccess} />
            </div>

            {/* Far right — Active badge */}
            <div style={{ flexShrink: 0, alignSelf: isMobile ? 'flex-start' : 'flex-start' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  background: '#ecfdf5',
                  color: '#16a34a',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid #bbf7d0',
                  whiteSpace: 'nowrap',
                }}
              >
                Active Patient
              </span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Tab Bar                                                            */}
        {/* ----------------------------------------------------------------- */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            padding: '4px',
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
          }}
        >
          {SUMMARY_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab ? 700 : 500,
                background: activeTab === tab ? '#eff6ff' : 'transparent',
                color: activeTab === tab ? '#2563eb' : '#64748b',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Tab Content                                                        */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'Overview' ? renderOverviewTab() : renderPlaceholderTab()}

        {/* ----------------------------------------------------------------- */}
        {/* Footer Action Bar                                                  */}
        {/* ----------------------------------------------------------------- */}
        <div
          style={{
            ...CARD_STYLE,
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <Button variant="outline" onClick={handleEditInfo}>
            Edit Info
          </Button>
          <Button variant="outline" onClick={handleViewFullProfile}>
            View Full Profile
          </Button>
          {roleName === TECHNICIAN_ROLE && (
            <Button
              variant="brand"
              onClick={handleProceedToPreDialysis}
              disabled={!hasActivePrescription}
              title={
                !hasActivePrescription
                  ? 'Cannot proceed — no active prescription found for this patient'
                  : 'Proceed to Pre-Dialysis Dashboard'
              }
              style={{
                opacity: hasActivePrescription ? 1 : 0.5,
                cursor: hasActivePrescription ? 'pointer' : 'not-allowed',
              }}
            >
              Proceed to Pre-Dialysis Dashboard →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientSummaryView;
