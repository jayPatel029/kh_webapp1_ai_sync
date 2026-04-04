/**
 * Patient Alerts List
 * Simple list of patients with avatar, name, and action buttons
 */

import React, { useState, useEffect } from 'react';
import { getAlertsSortedByType } from '../ApiCalls/adminDashApis';
import { Text } from '../component-library/primitives/Typography';
import { Box, Flex } from '../component-library';
import ApprovePrescriptionModal from '../components/modals/ApprovePrescriptionModal';
import PatientCommentsModal from '../components/dashboard/PatientCommentsModal';

const PatientAlertsByType = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrescriptionPatient, setSelectedPrescriptionPatient] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedCommentsPatient, setSelectedCommentsPatient] = useState(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  useEffect(() => {
    const fetchAlertsData = async () => {
      try {
        setLoading(true);
        const result = await getAlertsSortedByType();
        
        if (result.success) {
          setSummary(result.summary);
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch alerts');
          setSummary([]);
        }
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError(err?.message || 'Failed to fetch alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlertsData();
  }, []);

  if (loading) {
    return (
      <Box className="p-6">
        <Text>Loading alerts...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-6">
        <Text color="error">Error: {error}</Text>
      </Box>
    );
  }

  const allAlerts = summary.flatMap(({ alerts }) => alerts || []);

  const patientMap = allAlerts.reduce((acc, alert) => {
    const patientId = String(alert.patientId || 'unknown');
    const type = String(alert.type || '').toLowerCase();
    const category = String(alert.category || '').toLowerCase();
    const description = String(alert.category || alert.message || '').toLowerCase();
    const bucket = `${type} ${category} ${description}`;

    if (!acc[patientId]) {
      acc[patientId] = {
        id: patientId,
        name: alert.name || `Patient ${patientId}`,
        total: 0,
        prescriptionCount: 0,
        commentCount: 0,
        alertCount: 0,
        technicianCount: 0,
        latestDate: null,
        alerts: [],
      };
    }

    const patient = acc[patientId];
    patient.total += 1;
    patient.alerts.push(alert);

    if (bucket.includes('prescription')) {
      patient.prescriptionCount += 1;
    } else if (bucket.includes('comment')) {
      patient.commentCount += 1;
    } else if (bucket.includes('dialysis') || bucket.includes('technician')) {
      patient.technicianCount += 1;
    } else if (bucket.includes('alarm')) {
      patient.alarmCount += 1;
    } else if (bucket.includes('alert')) {
      patient.alertCount += 1;
    }

    const dateValue = alert.date ? new Date(alert.date) : null;
    if (dateValue && !Number.isNaN(dateValue.getTime())) {
      if (!patient.latestDate || dateValue > patient.latestDate) {
        patient.latestDate = dateValue;
      }
    }

    return acc;
  }, {});

  const patients = Object.values(patientMap).sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return String(a.id).localeCompare(String(b.id));
  });

  const visiblePatients = patients;

  return (
    <>
      <Box className="bg-white min-h-screen py-6 px-8">
        {visiblePatients.length === 0 ? (
          <Text className="text-gray-600 text-center py-8">No alerts at this time.</Text>
        ) : (
          <div className="space-y-0">
            {visiblePatients.map((patient, index) => (
              <Flex
                key={patient.id}
                align="center"
                justify="between"
                className={`py-4 px-4 ${index < visiblePatients.length - 1 ? 'border-b border-gray-300' : ''}`}
              >
                {/* Avatar + Name */}
                <Flex align="center" gap={4} className="flex-1">
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center text-center">
                    {/* Avatar placeholder - shows initials */}
                    <span className="text-lg font-bold text-gray-700">
                      {patient.name
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </span>
                  </div>
                  <Text className="text-lg font-semibold text-gray-900">{patient.name}</Text>
                </Flex>

                {/* Action Buttons */}
                <Flex wrap="wrap" gap={2} className="flex-shrink-0">
                  {patient.prescriptionCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPrescriptionPatient(patient);
                        setShowPrescriptionModal(true);
                      }}
                      className="px-4 py-2 rounded-md text-xs font-bold text-white bg-[#00cccc] hover:bg-[#00b3b3] transition-all"
                    >
                      {patient.prescriptionCount} Prescriptions
                    </button>
                  )}
                  {patient.commentCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCommentsPatient(patient);
                        setShowCommentsModal(true);
                      }}
                      className="px-4 py-2 rounded-md text-xs font-bold text-white bg-[#00c008] hover:bg-[#00a807] transition-all"
                    >
                      {patient.commentCount} Comments
                    </button>
                  )}
                  {patient.alertCount > 0 && (
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md text-xs font-bold text-white bg-[#fd0000] hover:bg-[#e00000] transition-all"
                    >
                      {patient.alertCount} Alerts
                    </button>
                  )}
                  {patient.technicianCount > 0 && (
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md text-xs font-bold text-white bg-[#6b21a8] hover:bg-[#581c87] transition-all"
                    >
                      {patient.technicianCount} Technician
                    </button>
                  )}
                  {patient.total === 0 && (
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md text-xs font-bold text-white bg-[#989898] cursor-default"
                    >
                      0 alerts
                    </button>
                  )}
                </Flex>
              </Flex>
            ))}
          </div>
        )}
      </Box>

      {/* Modals */}
      <ApprovePrescriptionModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        patientName={selectedPrescriptionPatient?.name}
        patientId={selectedPrescriptionPatient?.id}
      />
      <PatientCommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        patient={selectedCommentsPatient}
      />
    </>
  );
};

export default PatientAlertsByType;
