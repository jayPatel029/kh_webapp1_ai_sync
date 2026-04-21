import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardBody, Heading, Text } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import BedManagementDashboard from '../adminDashboard/components/BedManagementDashboard';
import DialysisAppointmentsDashboard from '../adminDashboard/components/DialysisAppointmentsDashboard';
import UpcomingAppointmentsPanel from '../adminDashboard/components/UpcomingAppointmentsPanel';
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
  const [beds, setBeds] = useState([]);
  const [patientSessionReadings, setPatientSessionReadings] = useState([]);
  const [integrationLoading, setIntegrationLoading] = useState(false);
  const [integrationError, setIntegrationError] = useState('');

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
        (bed) => String(bed?.status || '').toUpperCase() === 'OCCUPIED' && bed?.patient_id
      );

      const readingSettled = await Promise.allSettled(
        occupiedBeds.map(async (bed) => {
          const appointmentId = bed?.appointment_id || bed?.source_dialysis_appointment_id;
          const appointment = appointmentId ? appointmentMap[String(appointmentId)] : null;

          const sessionId =
            resolveSessionIdFromRecord(bed) ||
            resolveSessionIdFromRecord(appointment);

          if (!sessionId) return null;

          const sessionResult = await getDialysisSessionById(sessionId);
          if (!sessionResult.success) return null;

          const session = sessionResult.data?.data || sessionResult.data || {};
          const readingsResult = await getSessionReadings(sessionId);
          if (!readingsResult.success) return null;

          const allReadings = unwrapApiArray(readingsResult);
          const filteredReadings = allReadings.filter((reading) => {
            const readingPatientId = reading?.patient_id ?? reading?.patientId ?? session?.patient_id;
            if (!readingPatientId) return true;
            return Number(readingPatientId) === Number(session?.patient_id || bed?.patient_id);
          });

          const sortedReadings = [...(filteredReadings.length ? filteredReadings : allReadings)].sort(
            (a, b) => {
              const t1 = new Date(a?.timestamp || a?.created_at || 0).getTime();
              const t2 = new Date(b?.timestamp || b?.created_at || 0).getTime();
              return t2 - t1;
            }
          );

          const latest = sortedReadings[0];
          if (!latest) return null;

          const readingPayloadRaw = latest?.reading_json || latest?.reading || {};
          const readingPayload = typeof readingPayloadRaw === 'object' ? readingPayloadRaw : {};

          return {
            id: `${sessionId}-${bed?.id}`,
            sessionId,
            patientId: session?.patient_id || bed?.patient_id,
            patientName: bed?.patient_name || appointment?.patient_name || 'Patient',
            bedNumber: bed?.bed_number || '-',
            appointmentId: session?.appointment_id || appointmentId || '-',
            timestamp: latest?.timestamp || latest?.created_at,
            bloodFlow: readingPayload?.blood_flow_rate_ml_min ?? readingPayload?.blood_flow_rate ?? '-',
            dialysateFlow:
              readingPayload?.dialysate_flow_rate_ml_min ?? readingPayload?.dialysate_flow_rate ?? '-',
            arterialPressure:
              readingPayload?.arterial_pressure_mmhg ?? readingPayload?.arterial_pressure ?? '-',
            venousPressure:
              readingPayload?.venous_pressure_mmhg ?? readingPayload?.venous_pressure ?? '-',
          };
        })
      );

      const readingsPreview = readingSettled
        .filter((result) => result.status === 'fulfilled' && result.value)
        .map((result) => result.value)
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

          {/* <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <Card variant="outline">
              <CardBody>
                <Text fontSize="xs" color="textMuted">Total Beds (API)</Text>
                <Heading as="h4" size="md">{beds.length}</Heading>
              </CardBody>
            </Card>
            <Card variant="outline">
              <CardBody>
                <Text fontSize="xs" color="textMuted">Normal Beds</Text>
                <Heading as="h4" size="md">{normalBedsCount}</Heading>
              </CardBody>
            </Card>
            <Card variant="outline" className="border-yellow-300">
              <CardBody>
                <Text fontSize="xs" color="textMuted">Isolated Beds</Text>
                <Heading as="h4" size="md">{isolatedBedsCount}</Heading>
              </CardBody>
            </Card>
            <Card variant="outline">
              <CardBody>
                <Text fontSize="xs" color="textMuted">Occupied Beds</Text>
                <Heading as="h4" size="md">{occupiedBedsCount}</Heading>
              </CardBody>
            </Card>
          </div> */}

          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"> */}
            {/* Bed Management Section - Hide internal list as we use the full dashboard below */}
            <section aria-labelledby="bed-management-title">
              <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* <div className="flex items-center justify-between px-4 pt-4">
                  <Text fontSize="sm" color="textMuted">
                    Normal beds are standard bordered. Isolated beds are highlighted with a yellow border.
                  </Text>
                  <Button size="sm" variant="outline" onClick={fetchIntegrationContext} isLoading={integrationLoading}>
                    Refresh Integration
                  </Button>
                </div> */}
                <BedManagementDashboard hideAppointments={true} />
              </Box>
            </section>

          {/* Appointments (drag source) side-by-side for easy drag & drop */}
          {/* <section aria-labelledby="appointments-dashboard-title">
              <UpcomingAppointmentsPanel />
            </section> */}
          {/* </div> */}

          {/* <div className="mt-8">
            <section aria-labelledby="session-readings-title">
              <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-4">
                <div className="flex items-center justify-between mb-4">
                  <Heading as="h3" size="md" id="session-readings-title">
                    Live Session Readings (patient-wise)
                  </Heading>
                  <Text fontSize="xs" color="textMuted">
                    Source: `/dt/dialysis/sessions/:id/readings`
                  </Text>
                </div>

                {integrationError ? (
                  <Text fontSize="sm" className="text-red-600">{integrationError}</Text>
                ) : patientSessionReadings.length === 0 ? (
                  <Text fontSize="sm" color="textMuted">
                    No active patient readings available yet. Readings appear automatically once a linked session is running.
                  </Text>
                ) : (
                  <div className="space-y-3">
                    {patientSessionReadings.map((row) => (
                      <div key={row.id} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Text fontWeight="600">{row.patientName} (ID: {row.patientId})</Text>
                          <Text fontSize="xs" color="textMuted">
                            Bed {row.bedNumber} • Session {row.sessionId} • Appointment {row.appointmentId}
                          </Text>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                          <Text fontSize="sm">Blood Flow: {row.bloodFlow}</Text>
                          <Text fontSize="sm">Dialysate Flow: {row.dialysateFlow}</Text>
                          <Text fontSize="sm">Arterial: {row.arterialPressure}</Text>
                          <Text fontSize="sm">Venous: {row.venousPressure}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Box>
            </section>
          </div> */}

          {/* Full booking schedule (weekly) shown below the side-by-side layout */}
          {/* <div className="mt-8">
            <section aria-labelledby="full-bookings-title">
              <DialysisAppointmentsDashboard />
            </section>
          </div> */}
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default DialysisSessions;
