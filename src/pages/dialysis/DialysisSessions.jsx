import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardBody, Heading, Text } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import PatientSummaryView from './PatientSummaryView';
import PreDialysisDashboardView from './PreDialysisDashboardView';
import PatientVerificationView from './PatientVerificationView';
import VitalsMeasurementsView from './VitalsMeasurementsView';
import PatientAssessmentView from './PatientAssessmentView';
import BedManagementDashboard from '../adminDashboard/components/BedManagementDashboard';
import DialysisAppointmentsDashboard from '../adminDashboard/components/DialysisAppointmentsDashboard';
import UpcomingAppointmentsPanel from '../adminDashboard/components/UpcomingAppointmentsPanel';
import { ROUTES } from '../../routes/routeConstants';
import {
  getAllBeds,
  getBedById,
  getAllAppointmentsById,
} from '../../ApiCalls';
import {
  getDialysisSessionById,
  getSessionReadings,
} from '../../ApiCalls/dialysisSessionApis';

const unwrapApiArray = (result) => {
  if (!result?.success) return [];
  if (Array.isArray(result.data?.data)) return result.data.data;
  if (Array.isArray(result.data?.rows)) return result.data.rows;
  if (Array.isArray(result.data)) return result.data;
  return [];
};

const resolveSessionIdFromRecord = (record = {}) => {
  const candidates = [
    record?.session_id,
    record?.dialysis_session_id,
    record?.active_session_id,
    record?.current_session_id,
    record?.sessionId,
    record?.dialysisSessionId,
  ];

  const firstValid = candidates.find((value) => value !== undefined && value !== null && value !== '');
  return firstValid ?? null;
};

const isIsolatedBed = (bed = {}) => {
  const bedType = String(bed?.bed_type || '').toUpperCase();
  const bedStatus = String(bed?.status || '').toUpperCase();
  const quarantineFlag = bed?.is_quarantine === true || bed?.is_quarantine === 1 || bed?.is_quarantine === '1';

  return bedType === 'QUARANTINE' || bedStatus === 'QUARANTINE' || quarantineFlag;
};

const DialysisSessions = () => {
  const { isMobile } = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [beds, setBeds] = useState([]);
  const [patientSessionReadings, setPatientSessionReadings] = useState([]);
  const [integrationLoading, setIntegrationLoading] = useState(false);
  const [integrationError, setIntegrationError] = useState('');

  const selectedPatientId = location.state?.patientId;
  const currentStep = location.state?.step;
  const isDashboardView =
    location.state?.view === 'dashboard' || currentStep === 'P2-03';
  const isVerificationStep = currentStep === 'P2-04' || currentStep === 'verification';
  const isVitalsStep = currentStep === 'P2-05' || currentStep === 'vitals';
  const isAssessmentStep = currentStep === 'P2-06' || currentStep === 'assessment';

  // ---------------------------------------------------------------------------
  // React Hooks (MUST be invoked unconditionally before any early return)
  // ---------------------------------------------------------------------------

  const fetchIntegrationContext = useCallback(async () => {
    setIntegrationLoading(true);
    setIntegrationError('');

    try {
      const [bedsResult, appointmentsResult] = await Promise.all([
        getAllBeds(),
        getAllAppointmentsById(),
      ]);

      const allBeds = unwrapApiArray(bedsResult);
      const occupiedBedIds = allBeds
        .filter((bed) => String(bed?.status || '').toUpperCase() === 'OCCUPIED')
        .map((bed) => bed.id)
        .filter((id) => id !== undefined && id !== null)
        .slice(0, 40);

      const bedDetailSettled = await Promise.allSettled(
        occupiedBedIds.map((bedId) => getBedById(bedId))
      );

      const bedDetailsById = {};
      bedDetailSettled.forEach((detailResult, index) => {
        const id = occupiedBedIds[index];
        if (detailResult.status === 'fulfilled' && detailResult.value?.success) {
          const detailData = detailResult.value.data?.data || detailResult.value.data || null;
          if (detailData) {
            bedDetailsById[String(id)] = detailData;
          }
        }
      });

      const mergedBeds = allBeds.map((bed) => ({
        ...bed,
        ...(bedDetailsById[String(bed.id)] || {}),
      }));

      setBeds(mergedBeds);

      const allAppointments = unwrapApiArray(appointmentsResult);
      const appointmentMap = allAppointments.reduce((acc, appointment) => {
        const id = appointment?.id ?? appointment?.appointment_id;
        if (id !== undefined && id !== null) {
          acc[String(id)] = appointment;
        }
        return acc;
      }, {});

      const occupiedBeds = mergedBeds.filter(
        (bed) => String(bed?.status || '').toUpperCase() === 'OCCUPIED'
      );

      const candidates = [];
      occupiedBeds.forEach((bed) => {
        const appt =
          bed?.current_appointment ||
          bed?.active_appointment ||
          appointmentMap[String(bed?.current_appointment_id)] ||
          null;

        const candidateSessionId =
          resolveSessionIdFromRecord(bed) || resolveSessionIdFromRecord(appt);

        if (candidateSessionId) {
          candidates.push({
            bed,
            appointment: appt,
            sessionId: candidateSessionId,
          });
        }
      });

      const settledReadings = await Promise.allSettled(
        candidates.map((c) =>
          getDialysisSessionById(c.sessionId)
            .then((res) => {
              if (res?.success && res?.data) return res.data;
              return getSessionReadings(c.sessionId).then((rRes) => rRes?.data || null);
            })
            .catch(() => null)
        )
      );

      const readingsPreview = settledReadings
        .map((sr, idx) => {
          if (sr.status !== 'fulfilled' || !sr.value) return null;
          const candidate = candidates[idx];
          const rawData = sr.value;
          const readings = Array.isArray(rawData?.readings)
            ? rawData.readings
            : Array.isArray(rawData)
            ? rawData
            : [];

          const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

          return {
            bed_id: candidate.bed?.id,
            bed_number: candidate.bed?.bed_number || candidate.bed?.name || `Bed #${candidate.bed?.id}`,
            patient_name:
              candidate.bed?.patient_name || candidate.appointment?.patient_name || 'Assigned Patient',
            session_id: candidate.sessionId,
            sys_bp: latestReading?.systolic_bp || latestReading?.sys_bp || null,
            dia_bp: latestReading?.diastolic_bp || latestReading?.dia_bp || null,
            pulse: latestReading?.pulse_rate || latestReading?.pulse || null,
            uf_removed: latestReading?.uf_removed || latestReading?.uf_rate || null,
            timestamp: latestReading?.timestamp || latestReading?.recorded_at || null,
          };
        })
        .filter(Boolean)
        .sort((a, b) => {
          const t1 = new Date(a?.timestamp || 0).getTime();
          const t2 = new Date(b?.timestamp || 0).getTime();
          return t2 - t1;
        });

      setPatientSessionReadings(readingsPreview);
    } catch (error) {
      setIntegrationError(error?.message || 'Failed to load dialysis session integrations');
    } finally {
      setIntegrationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrationContext();
    const timer = setInterval(fetchIntegrationContext, 45000);
    return () => clearInterval(timer);
  }, [fetchIntegrationContext]);

  const isolatedBedsCount = useMemo(
    () => beds.filter((bed) => isIsolatedBed(bed)).length,
    [beds]
  );

  const normalBedsCount = useMemo(
    () => beds.filter((bed) => !isIsolatedBed(bed)).length,
    [beds]
  );

  const occupiedBedsCount = useMemo(
    () => beds.filter((bed) => String(bed?.status || '').toUpperCase() === 'OCCUPIED').length,
    [beds]
  );

  // ---------------------------------------------------------------------------
  // Conditional Step Routing (P2-02 to P2-06) — AFTER all hooks to adhere to rules-of-hooks
  // ---------------------------------------------------------------------------

  const stateSessionId = location.state?.sessionId || location.state?.session_id || location.state?.dialysis_session_id;
  const persistedSessionId = (() => { try { return localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId') || ''; } catch { return ''; } })();
  const activeSessionId = stateSessionId || persistedSessionId || '';

  // If Patient Assessment (P2-06) step requested
  if (selectedPatientId && isAssessmentStep) {
    return (
      <PatientAssessmentView
        patientId={selectedPatientId}
        sessionId={activeSessionId}
        onBack={() =>
          navigate(ROUTES.DIALYSIS_SESSIONS, {
            state: { patientId: selectedPatientId, step: 'P2-05', sessionId: activeSessionId, session_id: activeSessionId, dialysis_session_id: activeSessionId },
          })
        }
        onNext={() =>
          navigate(ROUTES.DIALYSIS_SESSIONS, {
            state: { patientId: selectedPatientId, step: 'P2-07', sessionId: activeSessionId, session_id: activeSessionId, dialysis_session_id: activeSessionId },
          })
        }
      />
    );
  }

  // If Vitals & Measurements (P2-05) step requested
  if (selectedPatientId && isVitalsStep) {
    return (
      <VitalsMeasurementsView
        patientId={selectedPatientId}
        sessionId={activeSessionId}
        onBack={() =>
          navigate(ROUTES.DIALYSIS_SESSIONS, {
            state: { patientId: selectedPatientId, step: 'P2-04', sessionId: activeSessionId, session_id: activeSessionId, dialysis_session_id: activeSessionId },
          })
        }
        onNext={() =>
          navigate(ROUTES.DIALYSIS_SESSIONS, {
            state: { patientId: selectedPatientId, step: 'P2-06', sessionId: activeSessionId, session_id: activeSessionId, dialysis_session_id: activeSessionId },
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
        sessionId={activeSessionId}
        onBack={() =>
          navigate(ROUTES.DIALYSIS_SESSIONS, {
            state: { patientId: selectedPatientId, view: 'dashboard', step: 'P2-03', sessionId: activeSessionId, session_id: activeSessionId, dialysis_session_id: activeSessionId },
          })
        }
        onNext={() =>
          navigate(ROUTES.DIALYSIS_SESSIONS, {
            state: { patientId: selectedPatientId, step: 'P2-05', sessionId: activeSessionId, session_id: activeSessionId, dialysis_session_id: activeSessionId },
          })
        }
      />
    );
  }

  // If Pre-Dialysis Dashboard (P2-03) requested
  if (selectedPatientId && isDashboardView) {
    return (
      <PreDialysisDashboardView
        patientId={selectedPatientId}
        sessionId={activeSessionId}
        onBack={() =>
          navigate(ROUTES.DIALYSIS_SESSIONS, {
            state: { patientId: selectedPatientId },
          })
        }
        onNavigateStep={(stepCode) =>
          navigate(ROUTES.DIALYSIS_SESSIONS, {
            state: { patientId: selectedPatientId, step: stepCode, sessionId: activeSessionId, session_id: activeSessionId, dialysis_session_id: activeSessionId },
          })
        }
      />
    );
  }

  // If patientId is present, render Patient Summary (P2-02)
  if (selectedPatientId) {
    return (
      <PatientSummaryView
        patientId={selectedPatientId}
        appointment={location.state?.appointment}
        onBackToQueue={() => navigate(ROUTES.DIALYSIS_SESSIONS, { replace: true })}
        onProceedToPreDialysis={(newSessionId) => {
          const sessId = newSessionId || activeSessionId;
          navigate(ROUTES.DIALYSIS_SESSIONS, {
            state: { patientId: selectedPatientId, view: 'dashboard', step: 'P2-03', sessionId: sessId, session_id: sessId, dialysis_session_id: sessId },
          });
        }}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Default Session Management Dashboard View
  // ---------------------------------------------------------------------------

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
        <Box className="sticky top-[56px] z-20 bg-white shadow-sm">
          <PageHeader
            title="Dialysis Sessions"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Sessions', active: true },
            ]}
          />
        </Box>

        <div className={`admin-page-content dialysis-sessions-page ${isMobile ? 'px-3 pb-20' : 'p-2'}`}>
          <style>{`
            .dialysis-sessions-page .quarantine-section {
              border: 2px solid #FACC15 !important;
              box-shadow: 0 0 0 1px rgba(250, 204, 21, 0.35) inset;
            }

            .dialysis-sessions-page .quarantine-section .dialysis-bed-seat {
              outline: 2px solid #FDE68A;
              outline-offset: 2px;
              border-radius: 10px;
            }
          `}</style>

          <section aria-labelledby="bed-management-title">
            <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <BedManagementDashboard hideAppointments={true} />
            </Box>
          </section>

          <div className="mt-8">
            <DialysisAppointmentsDashboard hideBeds={true} />
          </div>

          <div className="mt-8">
            <UpcomingAppointmentsPanel />
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default DialysisSessions;
