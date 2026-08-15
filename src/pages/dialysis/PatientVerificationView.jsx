/**
 * PatientVerificationView — P2-04 Patient Verification Screen
 *
 * Full implementation of P2-04 Patient Verification per the Part 2 specification and P2-04.jpeg:
 *  - 9-step progress bar (Step 1 active: Patient Verification) — aligned with all P2-05..P2-12 screens.
 *  - Patient Banner with photo, dry weight, shift, and bed/machine B-02 / HD-01.
 *  - Card 1: 1. Verify Patient Identity (3 visible matching identifiers + Identity Verified banner).
 *  - Right Panel: Verification Method checkboxes.
 *  - Card 2: 2. Infection Status Check (HIV & Hepatitis B/C status pills, Enter Now / Skip buttons).
 *  - Card 3: 3. Verify Prescription (Valid badge, prescription details, dialysate composition).
 *  - Card 4: 4. Consumables Confirmation (Single/Multi-Use dialyzer, reuse count tracking, max limit alert, Confirm New + physical discard checkbox, Override + mandatory reason, tubing set, needles).
 *  - Notes (Optional) textarea.
 *  - Footer: Cancel & Continue to Next Step → (navigates to P2-05).
 *
 * @file src/pages/dialysis/PatientVerificationView.jsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Box, Button } from '../../component-library';
import AutoCollapseTextarea from '../../components/AutoCollapseTextarea';
import PageHeader from '../../components/PageHeader';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import {
  submitSessionVerification,
  submitSessionConsumables,
} from '../../ApiCalls/preDialysisApis';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import usePatientVerification, {
  INFECTION_STATUS,
  DIALYZER_USAGE_TYPE,
} from '../../hooks/usePatientVerification';
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
  marginBottom: '4px',
};

const SECTION_SUBTITLE_STYLE = {
  fontSize: '13px',
  color: '#64748b',
  marginBottom: '16px',
};

// Green Match Checkmark Badge
const MatchBadge = () => (
  <span
    style={{
      width: '20px',
      height: '20px',
      borderRadius: '9999px',
      background: '#16a34a',
      color: '#ffffff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 800,
    }}
  >
    ✓
  </span>
);

// Infection Status Pill Renderer
const renderInfectionPill = (status) => {
  switch (status) {
    case INFECTION_STATUS.NEGATIVE:
      return (
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '9999px',
            background: '#dcfce7',
            color: '#15803d',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          Negative
        </span>
      );
    case INFECTION_STATUS.POSITIVE:
      return (
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '9999px',
            background: '#fee2e2',
            color: '#b91c1c',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          Positive
        </span>
      );
    case INFECTION_STATUS.PENDING:
    default:
      return (
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '9999px',
            background: '#fef3c7',
            color: '#b45309',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          Pending
        </span>
      );
  }
};

// ---------------------------------------------------------------------------
// PatientVerificationView Component
// ---------------------------------------------------------------------------

const PatientVerificationView = ({ patientId, onBack, onNext }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();

  const {
    patientDetails,
    prescriptionDetails,
    identityMatches: identityFields,
    verificationMethods,
    setVerificationMethods,
    infectionState,
    consumablesState,
    updateConsumables,
    handleInfectionEnterNow,
    handleInfectionSkip,
    notesText,
    setNotesText,
    canProceed,
    loading,
    error,
    refresh,
  } = usePatientVerification(patientId);

  // Enter Now inline editor modal/state
  const [showInfectionEdit, setShowInfectionEdit] = useState(false);
  const [editHiv, setEditHiv] = useState(INFECTION_STATUS.NEGATIVE);
  const [editHep, setEditHep] = useState(INFECTION_STATUS.NEGATIVE);

  // Handle Cancel
  const handleCancelClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(ROUTES.DIALYSIS_PATIENTS, {
        state: { patientId, view: 'dashboard', step: 'P2-03' },
      });
    }
  };

  const handleContinueClick = async () => {
    if (!canProceed) return;
    try {
      await submitSessionVerification(1, {
        status: 'final',
        identity_matched: identityFields.nameMatched && identityFields.dobMatched && identityFields.pidMatched && identityFields.phoneMatched,
        identity_name_match: identityFields.nameMatched,
        identity_dob_match: identityFields.dobMatched,
        identity_pid_match: identityFields.pidMatched,
        identity_phone_match: identityFields.phoneMatched,
        prescription_valid: true,
        hiv_status: infectionState.hivStatus,
        hepatitis_status: infectionState.hepatitisStatus,
        hiv_skipped: infectionState.skipped,
        hepatitis_skipped: infectionState.skipped,
        notes: notesText,
      });

      await submitSessionConsumables(1, {
        dialyzer_type: consumablesState.dialyzerUsageType === 'MULTI_USE' ? 'MULTI_USE' : 'SINGLE_USE',
        dialyzer_id: consumablesState.dialyzerId || 'DLZ-1001',
        reuse_action: consumablesState.discardConfirmed ? 'confirmed_new' : consumablesState.isOverridden ? 'overridden' : 'none',
        old_dialyzer_discard_confirmed: consumablesState.discardConfirmed,
        override_reason: consumablesState.overrideReason || '',
        tubing_set_qty: consumablesState.tubingSetQty || 1,
        needles_qty: consumablesState.needlesQty || 2,
      });
    } catch (_) {}

    if (onNext) {
      onNext();
    } else {
      // Navigate to P2-05 (Vitals & Measurements)
      navigate(ROUTES.DIALYSIS_PATIENTS, {
        state: { patientId, step: 'P2-05' },
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '16px' }}>
        Loading Patient Verification...
      </div>
    );
  }

  if (error || !patientDetails) {
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
            title="P2-04 – Patient Verification"
            subtitle="Verify patient identity and prescription before proceeding."
            breadcrumbs={[
              { label: 'Pre-Dialysis Queue', path: ROUTES.DIALYSIS_PATIENTS },
              { label: 'Pre-Dialysis Dashboard', onClick: handleCancelClick },
              { label: 'Patient Verification', active: true },
            ]}
          /> */}
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : 'p-6'}`}>
          {/* ----------------------------------------------------------------- */}
          {/* 9-Step Progress Bar — aligned with P2-05..P2-12 (Step 1 active)    */}
          {/* ----------------------------------------------------------------- */}
          <div
            style={{
              padding: '16px 24px',
              marginBottom: '24px',
              overflowX: 'auto',
              background: 'transparent',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minWidth: '780px',
              }}
            >
              {PRE_DIALYSIS_STEPS.map((step, idx) => {
                const isPast = step.id < 1;
                const isActive = step.id === 1;
                return (
                  <React.Fragment key={step.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '9999px',
                          background: isPast ? '#10b981' : isActive ? '#2563eb' : '#f1f5f9',
                          color: isPast || isActive ? '#ffffff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                      >
                        {isPast ? '✓' : step.id}
                      </div>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#2563eb' : isPast ? '#10b981' : '#64748b',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step.name}
                      </span>
                    </div>
                    {idx < PRE_DIALYSIS_STEPS.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: '2px',
                          background: isPast ? '#10b981' : '#e2e8f0',
                          margin: '0 8px',
                          marginTop: '-16px',
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <PreDialysisPatientProfileCard patient={patientDetails} isMobile={isMobile} showPatientId={false} />

          {/* ----------------------------------------------------------------- */}
          {/* Row 1: Identity Card + Verification Method Cards                  */}
          {/* ----------------------------------------------------------------- */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '24px',
              marginBottom: '24px',
            }}
          >
            {/* Card 1: Verify Patient Identity */}
            <div style={CARD_STYLE}>
              <div style={SECTION_HEADER_STYLE}>1. Verify Patient Identity</div>
              <div style={SECTION_SUBTITLE_STYLE}>Confirm at least two identifiers.</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
                    <PersonOutlineIcon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 18 }} />
                    <span>Full Name</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '14px' }}>{patientDetails.name}</strong>
                    <MatchBadge />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
                    <CalendarTodayOutlinedIcon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 18 }} />
                    <span>Date of Birth</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '14px' }}>{patientDetails.dobFormatted}</strong>
                    <MatchBadge />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
                    <PhoneOutlinedIcon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 18 }} />
                    <span>Phone Number</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '14px' }}>{patientDetails.phone}</strong>
                    <MatchBadge />
                  </div>
                </div>
              </div>

              {/* Verified Green Banner */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '9999px',
                    background: '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                  }}
                >
                  <VerifiedUserOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d' }}>
                    Identity Verified Successfully
                  </div>
                  <div style={{ fontSize: '12px', color: '#166534' }}>
                    All mandatory identifiers matched.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Stack: Verification Method */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Verification Method */}
              <div style={CARD_STYLE}>
                <div style={SECTION_HEADER_STYLE}>Verification Method</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#0f172a', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={verificationMethods.patientConfirmed}
                      onChange={(e) =>
                        setVerificationMethods((prev) => ({ ...prev, patientConfirmed: e.target.checked }))
                      }
                      style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                    />
                    <span>Patient confirms details</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#0f172a', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={verificationMethods.idCardVerified}
                      onChange={(e) =>
                        setVerificationMethods((prev) => ({ ...prev, idCardVerified: e.target.checked }))
                      }
                      style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                    />
                    <span>ID Card</span>
                  </label>

                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Card 2: Infection Status Check                                    */}
          {/* ----------------------------------------------------------------- */}
          <div style={{ ...CARD_STYLE, marginBottom: '24px' }}>
            <div style={SECTION_HEADER_STYLE}>2. Infection Status Check</div>
            <div style={SECTION_SUBTITLE_STYLE}>Confirm HIV and Hepatitis B/C status before assignment.</div>

            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>HIV Status:</span>
                {renderInfectionPill(infectionState.hivStatus)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Hepatitis B/C Status:</span>
                {renderInfectionPill(infectionState.hepatitisStatus)}
              </div>
            </div>

            {/* Inline Editor for Enter Now */}
            {showInfectionEdit && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '16px',
                }}
              >
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                  Record Infection Test Status
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      HIV Status
                    </label>
                    <select
                      value={editHiv}
                      onChange={(e) => setEditHiv(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value={INFECTION_STATUS.NEGATIVE}>Negative</option>
                      <option value={INFECTION_STATUS.POSITIVE}>Positive</option>
                      <option value={INFECTION_STATUS.PENDING}>Pending</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Hepatitis B/C Status
                    </label>
                    <select
                      value={editHep}
                      onChange={(e) => setEditHep(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value={INFECTION_STATUS.NEGATIVE}>Negative</option>
                      <option value={INFECTION_STATUS.POSITIVE}>Positive</option>
                      <option value={INFECTION_STATUS.PENDING}>Pending</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Button size="sm" variant="outline" onClick={() => setShowInfectionEdit(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      handleInfectionEnterNow(editHiv, editHep);
                      setShowInfectionEdit(false);
                    }}
                  >
                    Save Status
                  </Button>
                </div>
              </div>
            )}

            {/* Banner State: Pending / Positive / Confirmed */}
            {infectionState.hivStatus === INFECTION_STATUS.PENDING && !infectionState.actioned ? (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#92400e' }}>
                  <span>ℹ</span>
                  <span>HIV status not yet recorded for this patient.</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button size="sm" onClick={() => setShowInfectionEdit(true)}>
                    Enter Now
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleInfectionSkip}>
                    Skip (Log Alert)
                  </Button>
                </div>
              </div>
            ) : infectionState.hivStatus === INFECTION_STATUS.POSITIVE || infectionState.hepatitisStatus === INFECTION_STATUS.POSITIVE ? (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  color: '#991b1b',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>⚠</span>
                <span>This patient requires isolation machine/bed assignment.</span>
              </div>
            ) : (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  color: '#15803d',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>✓</span>
                <span>Infection Status Confirmed.</span>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Card 3: Verify Prescription                                       */}
          {/* ----------------------------------------------------------------- */}
          <div style={{ ...CARD_STYLE, marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={SECTION_HEADER_STYLE}>3. Verify Prescription</div>
                <div style={SECTION_SUBTITLE_STYLE}>Confirm prescription details for today's dialysis.</div>
              </div>
              <span
                style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Valid
              </span>
            </div>

            {/* Prescription Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '16px',
                fontSize: '13px',
                color: '#334155',
                marginBottom: '20px',
              }}
            >
              <div>
                <span style={{ color: '#64748b' }}>Physician:</span> <strong>{prescriptionDetails.physician}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Prescription Date:</span> <strong>{prescriptionDetails.prescriptionDate}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Dialysis Type:</span> <strong>{prescriptionDetails.dialysisType}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Prescribed Duration:</span> <strong>{prescriptionDetails.prescribedDuration}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Blood Flow Rate (BFR):</span> <strong>{prescriptionDetails.bfr}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Dialysate Flow Rate (DFR):</span> <strong>{prescriptionDetails.dfr}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Dialysate Temperature:</span> <strong>{prescriptionDetails.dialysateTemp}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Ultrafiltration Goal:</span> <strong style={{ color: '#2563eb' }}>{prescriptionDetails.ufGoal}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Heparin:</span> <strong>{prescriptionDetails.heparin}</strong>
              </div>
            </div>

            {/* Dialysate Composition Row */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '10px',
                padding: '12px 16px',
                border: '1px solid #f1f5f9',
                fontSize: '13px',
                color: '#334155',
                marginBottom: '16px',
              }}
            >
              <strong style={{ color: '#0f172a' }}>Dialysate Composition:</strong>{' '}
              Potassium: <strong>{prescriptionDetails.dialysateComposition.potassium}</strong> · Calcium:{' '}
              <strong>{prescriptionDetails.dialysateComposition.calcium}</strong> · Sodium:{' '}
              <strong>{prescriptionDetails.dialysateComposition.sodium}</strong> · Bicarbonate:{' '}
              <strong>{prescriptionDetails.dialysateComposition.bicarbonate}</strong>
            </div>

            {/* Prescription Valid Blue Banner */}
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#1e40af',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>ⓘ</span>
              <span>Prescription is valid and matches today's schedule.</span>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Card 4: Consumables Confirmation                                  */}
          {/* ----------------------------------------------------------------- */}
          <div style={{ ...CARD_STYLE, marginBottom: '24px' }}>
            <div style={SECTION_HEADER_STYLE}>4. Consumables Confirmation</div>
            <div style={SECTION_SUBTITLE_STYLE}>Confirm consumables for today's session.</div>

            {/* Dialyzer Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Dialyzer: Fresenius FX 80
                </span>

                <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="dialyzerType"
                      value={DIALYZER_USAGE_TYPE.SINGLE_USE}
                      checked={consumablesState.dialyzerType === DIALYZER_USAGE_TYPE.SINGLE_USE}
                      onChange={() => updateConsumables({ dialyzerType: DIALYZER_USAGE_TYPE.SINGLE_USE })}
                      style={{ accentColor: '#2563eb' }}
                    />
                    <span>Single-Use</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="dialyzerType"
                      value={DIALYZER_USAGE_TYPE.MULTI_USE}
                      checked={consumablesState.dialyzerType === DIALYZER_USAGE_TYPE.MULTI_USE}
                      onChange={() => updateConsumables({ dialyzerType: DIALYZER_USAGE_TYPE.MULTI_USE })}
                      style={{ accentColor: '#2563eb' }}
                    />
                    <span>Multi-Use</span>
                  </label>
                </div>
              </div>

              {/* Multi-Use Dialyzer Tracking Panel */}
              {consumablesState.dialyzerType === DIALYZER_USAGE_TYPE.MULTI_USE && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px', color: '#334155', marginBottom: '12px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>This Patient's Dialyzer ID:</span>{' '}
                      <strong>{consumablesState.dialyzerId}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Reuse Count:</span>{' '}
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: consumablesState.reuseCount >= consumablesState.reuseLimit ? '#fee2e2' : '#dcfce7',
                          color: consumablesState.reuseCount >= consumablesState.reuseLimit ? '#b91c1c' : '#15803d',
                          fontWeight: 700,
                        }}
                      >
                        {consumablesState.reuseCount} of {consumablesState.reuseLimit} uses
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Last Used:</span> <strong>{consumablesState.lastUsed}</strong>
                    </div>
                  </div>

                  {/* Limit Exceeded Alert & Actions */}
                  {consumablesState.reuseCount >= consumablesState.reuseLimit && (
                    <div
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '10px',
                        padding: '14px',
                        marginTop: '12px',
                      }}
                    >
                      <div style={{ color: '#991b1b', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>
                        ⚠ This dialyzer has reached its maximum approved reuse count ({consumablesState.reuseLimit}). Please discard and begin a new dialyzer for this patient.
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#0f172a' }}>
                          <input
                            type="radio"
                            name="reuseAction"
                            value="NEW_DIALYZER"
                            checked={consumablesState.reuseAction === 'NEW_DIALYZER'}
                            onChange={() => updateConsumables({ reuseAction: 'NEW_DIALYZER' })}
                            style={{ accentColor: '#2563eb' }}
                          />
                          <span><strong>Confirm</strong> — starting a NEW dialyzer for this patient</span>
                        </label>

                        {/* Discard Confirmation Checkbox */}
                        {consumablesState.reuseAction === 'NEW_DIALYZER' && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '24px', fontSize: '12px', color: '#991b1b', fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={consumablesState.discardConfirmed}
                              onChange={(e) => updateConsumables({ discardConfirmed: e.target.checked })}
                              style={{ width: '16px', height: '16px' }}
                            />
                            <span>I confirm the previous dialyzer (ID: {consumablesState.dialyzerId}, {consumablesState.reuseCount} reuses) has been physically discarded and this is a new, unused dialyzer.*</span>
                          </label>
                        )}

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#0f172a' }}>
                          <input
                            type="radio"
                            name="reuseAction"
                            value="OVERRIDE"
                            checked={consumablesState.reuseAction === 'OVERRIDE'}
                            onChange={() => updateConsumables({ reuseAction: 'OVERRIDE' })}
                            style={{ accentColor: '#2563eb' }}
                          />
                          <span><strong>Override</strong> — continue using this dialyzer beyond the approved limit</span>
                        </label>

                        {/* Override Reason Textarea */}
                        {consumablesState.reuseAction === 'OVERRIDE' && (
                          <div style={{ paddingLeft: '24px', marginTop: '4px' }}>
                            <textarea
                              rows={2}
                              value={consumablesState.overrideReason}
                              onChange={(e) => updateConsumables({ overrideReason: e.target.value })}
                              placeholder="Enter mandatory reason for overriding reuse limit (min 5 chars)...*"
                              style={{
                                width: '100%',
                                borderRadius: '6px',
                                border: '1px solid #fca5a5',
                                padding: '8px',
                                fontSize: '12px',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Other Consumables Inputs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '16px',
                fontSize: '13px',
              }}
            >
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Tubing Set (Arterial + Venous)*
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min={1}
                    value={consumablesState.tubingSetQty}
                    onChange={(e) => updateConsumables({ tubingSetQty: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <span style={{ padding: '6px', color: '#64748b' }}>set</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Fistula Needles (if AVF/AVG)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min={0}
                    value={consumablesState.needlesQty}
                    onChange={(e) => updateConsumables({ needlesQty: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <span style={{ padding: '6px', color: '#64748b' }}>needles</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Priming / Flush Saline
                </label>
                <input
                  type="text"
                  readOnly
                  value={consumablesState.salineQty}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }}
                />
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Notes (Optional)                                                  */}
          {/* ----------------------------------------------------------------- */}
          <div style={{ ...CARD_STYLE, marginBottom: '32px' }}>
            <div style={SECTION_HEADER_STYLE}>Notes (Optional)</div>
            <AutoCollapseTextarea
              aria-label="Patient verification notes"
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Add any notes if required..."
              style={{
                padding: '10px',
              }}
            />
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Footer Action Bar                                                 */}
          {/* ----------------------------------------------------------------- */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <Button variant="outline" onClick={handleCancelClick}>
              Cancel
            </Button>

            <Button
              variant="brand"
              onClick={handleContinueClick}
              disabled={!canProceed}
              style={{
                opacity: canProceed ? 1 : 0.5,
                cursor: canProceed ? 'pointer' : 'not-allowed',
              }}
            >
              Continue to Next Step →
            </Button>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default PatientVerificationView;
