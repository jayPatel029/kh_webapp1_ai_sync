import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '../../component-library/primitives/Modal';
import { Button } from '../../component-library/primitives/Button';
import { Heading, Text } from '../../component-library/primitives/Typography';
import { Spinner } from '../../component-library/feedback/Spinner';
import { toast } from 'sonner';
import { getPrescriptionByPatient, deletePrescriptionByRoute } from '../../ApiCalls/prescriptionApis';
import { getAlarmByPatientId } from '../../ApiCalls/alarmsApis';
import ReasonOfDisapprovalModal from './ReasonOfDisapprovalModal';

const ApprovePrescriptionModal = ({ isOpen, onClose, patientName, patientId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [alarmDoses, setAlarmDoses] = useState({});
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [showDisapprovalModal, setShowDisapprovalModal] = useState(false);
  const [medicationBeingDisapproved, setMedicationBeingDisapproved] = useState(null);
  const [disapprovingLoading, setDisapprovingLoading] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPrescriptions();
    }
  }, [isOpen, patientId]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const result = await getPrescriptionByPatient(patientId);
      if (result.success) {
        setPrescriptions(Array.isArray(result.data) ? result.data : [result.data].filter(Boolean));
      } else {
        toast.error('Failed to load prescriptions');
        setPrescriptions([]);
      }

      // Fetch alarms for the patient
      const alarmsResult = await getAlarmByPatientId(patientId);
      if (alarmsResult.success) {
        const alarmData = alarmsResult.data;
        
        // Handle both { data, doses } structure and simple array structure
        if (alarmData?.data && Array.isArray(alarmData.data)) {
          setAlarms(alarmData.data);
          
          // Map doses to alarm ids
          if (alarmData.doses && Array.isArray(alarmData.doses)) {
            const dosesMap = {};
            alarmData.data.forEach((alarm, idx) => {
              if (alarmData.doses[idx]) {
                dosesMap[alarm.id] = alarmData.doses[idx];
              }
            });
            setAlarmDoses(dosesMap);
          }
        } else if (Array.isArray(alarmData)) {
          setAlarms(alarmData);
        } else {
          setAlarms([]);
        }
      } else {
        setAlarms([]);
        setAlarmDoses({});
      }
    } catch (error) {
      console.error('Error fetching prescriptions or alarms:', error);
      toast.error('Error loading prescriptions');
      setPrescriptions([]);
      setAlarms([]);
      setAlarmDoses({});
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePrescription = async (prescriptionId) => {
    try {
      setApproving(prescriptionId);
      // TODO: Implement approve prescription API call
      toast.success('Prescription approved successfully');
      fetchPrescriptions();
    } catch (error) {
      console.error('Error approving prescription:', error);
      toast.error('Failed to approve prescription');
    } finally {
      setApproving(null);
    }
  };

  const handleOpenDisapprovalModal = (medication, id, isFullPrescription = false) => {
    setMedicationBeingDisapproved({
      id: id || medication?._id || medication?.id,
      name: medication?.medication || medication?.medicineName || 'Prescription',
      isFullPrescription
    });
    setShowDisapprovalModal(true);
  };

  const handleConfirmDisapproval = async (reason) => {
    if (!medicationBeingDisapproved) return;

    try {
      setDisapprovingLoading(true);
      const result = await deletePrescriptionByRoute(medicationBeingDisapproved.id);
      if (result.success) {
        toast.success(`Prescription disapproved: ${reason}`);
        setShowDisapprovalModal(false);
        setMedicationBeingDisapproved(null);
        fetchPrescriptions();
      } else {
        toast.error('Failed to disapprove prescription');
      }
    } catch (error) {
      console.error('Error disapproving prescription:', error);
      toast.error('Error disapproving prescription');
    } finally {
      setDisapprovingLoading(false);
    }
  };

  // Filter alarms by prescription ID
  const getAlarmsByPrescriptionId = (prescriptionId) => {
    return alarms.filter(alarm => 
      alarm.prescriptionId === prescriptionId || 
      alarm.prescription_id === prescriptionId ||
      alarm.refId === prescriptionId
    );
  };

  const handleRejectPrescription = async (prescriptionId) => {
    try {
      setRejecting(prescriptionId);
      const result = await deletePrescriptionByRoute(prescriptionId);
      if (result.success) {
        toast.success('Prescription rejected');
        fetchPrescriptions();
      } else {
        toast.error('Failed to reject prescription');
      }
    } catch (error) {
      console.error('Error rejecting prescription:', error);
      toast.error('Error rejecting prescription');
    } finally {
      setRejecting(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent className="bg-white rounded-xl shadow-xl">
        
        {/* Header */}
        <ModalHeader className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <Heading as="h2" size="lg" className="font-semibold">
            Approve Prescriptions
          </Heading>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
              {patientName ? patientName.charAt(0).toUpperCase() : 'U'}
            </div>
            <Text className="text-gray-700 font-medium">{patientName || 'Unknown'}</Text>
          </div>
        </ModalHeader>

        {/* Body */}
        <ModalBody className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : (prescriptions && prescriptions.length > 0) || (alarms && alarms.some(a => a.type === 'Dialysis')) ? (
            <div className="space-y-6">
              {/* Medications/Prescriptions Section */}
              {prescriptions && prescriptions.length > 0 && (
                <div className="space-y-4">
                  {prescriptions.map((prescription, idx) => {
                // Handle both object and nested medications array
                const medications = prescription.medications ? (Array.isArray(prescription.medications) ? prescription.medications : [prescription.medications]) : [prescription];
                
                return (
                  <div key={prescription._id || prescription.id || idx} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                    
                    {/* Prescription Header with Date and Doctor */}
                    <div className="grid grid-cols-[130px_1fr] gap-4 items-start mb-4 pb-4 border-b border-gray-300">
                      <Text as="label" size="sm" className="font-medium text-gray-400">
                        Prescription date
                      </Text>
                      <div>
                        <Text size="sm" weight="semibold" className="text-gray-800">
                          {prescription.date ? new Date(prescription.date).toLocaleDateString() : 'N/A'}
                        </Text>
                        {prescription.doctorName && (
                          <Text size="xs" className="text-gray-600 mt-1">
                            by {prescription.doctorName}
                          </Text>
                        )}
                      </div>
                    </div>

                    {/* All Medications */}
                    {/* <div className="space-y-4">
                      {medications.map((med, medIdx) => (
                        <div key={`${idx}-${medIdx}`} className="border-l-4 border-blue-400 pl-4">
                          {/* Medication Name */}
                          <div className="grid grid-cols-[130px_1fr] gap-4 items-center mb-3">
                            <Text as="label" size="sm" className="font-medium text-gray-400">
                              Medication
                            </Text>
                            <div className="flex justify-between items-center">
                              <Text size="sm" weight="semibold" className="text-gray-800">
                                {med.medication || med.medicineName || 'Unknown Medication'}
                              </Text>
                              <button 
                                className="text-red-500 hover:text-red-600 transition p-1"
                                onClick={() => handleOpenDisapprovalModal(med, med._id || med.id)}
                                disabled={disapprovingLoading}
                                title="Reject medication"
                              >
                                {disapprovingLoading && medicationBeingDisapproved?.id === (med._id || med.id) ? (
                                  <Spinner size="xs" />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.12-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Strength/Dosage */}
                          {(med.strength || med.dosage) && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start mb-3">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                Strength
                              </Text>
                              <Text size="sm" className="text-gray-800">
                                {med.strength || med.dosage}
                              </Text>
                            </div>
                          )}

                          {/* Frequency */}
                          {(med.frequency || med.frequencyText) && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start mb-3">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                Frequency
                              </Text>
                              <Text size="sm" weight="semibold" className="text-gray-800">
                                {med.frequency || med.frequencyText}
                              </Text>
                            </div>
                          )}

                          {/* Timings */}
                          {med.timings && med.timings.length > 0 && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start mb-3">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                Timings
                              </Text>
                              <div className="text-sm text-gray-600 space-y-1">
                                {med.timings.map((timing, tIdx) => (
                                  <Text key={tIdx} size="sm" className="text-gray-600">
                                    {timing.time || timing.timeOfDay} - {timing.dosage || '1'} {timing.unit || 'Tablet'}
                                  </Text>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Days/Duration */}
                          {(med.days || med.duration) && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start mb-3">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                {med.dayType || 'Duration'}
                              </Text>
                              <Text size="sm" className="text-gray-600">
                                {med.days || med.duration}
                              </Text>
                            </div>
                          )}

                          {/* Instructions */}
                          {(med.instructions || med.notes) && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start mb-3">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                Instructions
                              </Text>
                              <Text size="sm" className="text-gray-600 italic">
                                {med.instructions || med.notes}
                              </Text>
                            </div>
                          )}

                          {/* Reactions/Warnings */}
                          {(med.sideEffects || med.warnings) && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
                              <Text as="label" size="sm" className="font-medium text-orange-400">
                                Warnings
                              </Text>
                              <Text size="sm" className="text-orange-600">
                                {med.sideEffects || med.warnings}
                              </Text>
                            </div>
                          )}
                        </div>
                      ))}
                    </div> */}

                    {/* Related Alarms Section */}
                    {(() => {
                      const relatedAlarms = getAlarmsByPrescriptionId(prescription._id || prescription.id);
                      return relatedAlarms && relatedAlarms.length > 0 ? (
                        <div className="mt-4 pt-4 border-t border-orange-200 bg-orange-50 rounded-lg p-4">
                          {/* <Heading as="h4" size="sm" className="text-orange-800 mb-3 flex items-center gap-2">
                            <span className="text-lg">⚠️</span>
                            Related Alarms ({relatedAlarms.length})
                          </Heading> */}
                          <div className="space-y-2">
                            {relatedAlarms.map((alarm, alarmIdx) => (
                              <div key={alarmIdx} className="bg-white rounded p-3 border border-orange-200">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <Text size="sm" weight="semibold" className="text-orange-900">
                                      {alarm.type || alarm.alarmType || 'Alarm'}
                                    </Text>
                                    {alarm.message && (
                                      <Text size="xs" className="text-orange-700 mt-1">
                                        {alarm.message}
                                      </Text>
                                    )}
                                    {alarm.description && (
                                      <Text size="xs" className="text-orange-600 mt-1">
                                        {alarm.description}
                                      </Text>
                                    )}
                                    {alarm.createdAt && (
                                      <Text size="xs" className="text-orange-500 mt-2">
                                        {new Date(alarm.createdAt).toLocaleDateString()} {new Date(alarm.createdAt).toLocaleTimeString()}
                                      </Text>
                                    )}
                                  </div>
                                  <div className={`px-3 py-1 rounded text-xs font-semibold text-white flex-shrink-0 ${
                                    alarm.status === 'Active' || alarm.status === 'Pending' ? 'bg-red-500' : 
                                    alarm.status === 'Resolved' ? 'bg-green-500' : 'bg-gray-500'
                                  }`}>
                                    {alarm.status || 'Pending'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* Action Buttons */}
                    <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between">
                      <a href="#" className="text-blue-600 hover:underline text-sm font-medium decoration-2">
                        View Prescription
                      </a>
                      <div className="flex gap-3">
                        <button 
                          className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition disabled:opacity-50"
                          onClick={() => handleOpenDisapprovalModal(prescription, prescription._id || prescription.id, true)}
                          disabled={disapprovingLoading}
                          title="Reject entire prescription"
                        >
                          {disapprovingLoading && medicationBeingDisapproved?.isFullPrescription ? (
                            <Spinner size="xs" />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                        <button 
                          className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition disabled:opacity-50"
                          onClick={() => handleApprovePrescription(prescription._id || prescription.id)}
                          disabled={approving === prescription._id}
                          title="Approve prescription"
                        >
                          {approving === prescription._id ? (
                            <Spinner size="xs" />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
              )}

              {/* Alarms & Schedules Section */}
              {alarms && alarms.length > 0 && (
                <div className="space-y-4 mt-6">
                  {alarms.map((alarm, aIdx) => {
                    const doses = alarmDoses[alarm.id] || [];
                    const cardColor = alarm.type === 'Dialysis' ? 'blue' : 'purple';
                    
                    return (
                      <div key={alarm.id || aIdx} className={`border border-${cardColor}-200 rounded-lg p-5 bg-${cardColor}-50 shadow-sm`}>
                        
                        {/* Alarm Header */}
                        <div className="grid grid-cols-[130px_1fr] gap-4 items-start mb-4 pb-4 border-b border-gray-300">
                          <Text as="label" size="sm" className="font-medium text-gray-400">
                            {alarm.type === 'Dialysis' ? 'Dialysis' : 'Health'} Schedule
                          </Text>
                          <div className="flex justify-between items-start">
                            <div>
                              <Text size="sm" weight="semibold" className="text-gray-800">
                                {alarm.type}
                              </Text>
                              {alarm.parameter && (
                                <Text size="xs" className="text-gray-600 mt-1">
                                  Parameter: {alarm.parameter}
                                </Text>
                              )}
                              {alarm.dateadded && (
                                <Text size="xs" className="text-gray-600 mt-1">
                                  Added on {new Date(alarm.dateadded).toLocaleDateString()}
                                </Text>
                              )}
                            </div>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white flex-shrink-0 ${
                              alarm.status === 'Approved' ? 'bg-green-500' : 
                              alarm.status === 'Pending' ? 'bg-orange-500' : 'bg-gray-500'
                            }`}>
                              {alarm.status}
                            </div>
                          </div>
                        </div>

                        {/* Alarm Details */}
                        <div className="space-y-3 border-l-4 border-blue-400 pl-4">
                          
                          {/* Description */}
                          {alarm.description && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                Description
                              </Text>
                              <Text size="sm" className="text-gray-800">
                                {alarm.description}
                              </Text>
                            </div>
                          )}

                          {/* Frequency */}
                          {alarm.frequency && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                Frequency
                              </Text>
                              <Text size="sm" weight="semibold" className="text-gray-800">
                                {alarm.frequency}
                              </Text>
                            </div>
                          )}

                          {/* Weekdays */}
                          {alarm.weekdays && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                Days/Months
                              </Text>
                              <Text size="sm" className="text-gray-800">
                                Days{'\n'}
                                {alarm.weekdays.split(',').map(day => day.trim()).join(', ')}
                              </Text>
                            </div>
                          )}

                          {/* Monthly Date */}
                          {alarm.dateofmonth && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                Date of Month
                              </Text>
                              <Text size="sm" className="text-gray-800">
                                {alarm.dateofmonth}
                              </Text>
                            </div>
                          )}

                          {/* Times a Day */}
                          {alarm.timesaday && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                Times a Day
                              </Text>
                              <Text size="sm" className="text-gray-800">
                                {alarm.timesaday}
                              </Text>
                            </div>
                          )}

                          {/* Session/Dose Times */}
                          {doses && doses.length > 0 ? (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                Times
                              </Text>
                              <div className="text-sm text-gray-600 space-y-1">
                                {doses.map((dose, dIdx) => (
                                  <Text key={dIdx} size="sm" className="text-gray-800 font-medium">
                                    {dose.time} {dose.doses && `- ${dose.doses} ${dose.unitType || ''}`}
                                  </Text>
                                ))}
                              </div>
                            </div>
                          ) : alarm.time && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                Times
                              </Text>
                              <div className="text-sm text-gray-600 space-y-1">
                                {alarm.time.split(',').map((t, tIdx) => (
                                  <Text key={tIdx} size="sm" className="text-gray-800 font-medium">
                                    {t.trim()}
                                  </Text>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Missed Frequency */}
                          {alarm.missedFrequency > 0 && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
                              <Text as="label" size="sm" className="font-medium text-orange-400">
                                Missed Sessions
                              </Text>
                              <Text size="sm" className="text-orange-600 font-semibold">
                                {alarm.missedFrequency}
                              </Text>
                            </div>
                          )}

                          {/* Message for Doctor */}
                          {alarm.messagefordoctor && (
                            <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
                              <Text as="label" size="sm" className="font-medium text-gray-400">
                                Message
                              </Text>
                              <Text size="sm" className="text-gray-600 italic">
                                {alarm.messagefordoctor}
                              </Text>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between">
                          <a href="#" className="text-blue-600 hover:underline text-sm font-medium decoration-2">
                            View prescription
                          </a>
                          <div className="flex gap-3">
                            <button 
                              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition disabled:opacity-50"
                              onClick={() => handleOpenDisapprovalModal(alarm, alarm.id, true)}
                              disabled={disapprovingLoading}
                              title="Reject schedule"
                            >
                              {disapprovingLoading && medicationBeingDisapproved?.id === alarm.id ? (
                                <Spinner size="xs" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </button>
                            <button 
                              className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition disabled:opacity-50"
                              onClick={() => handleApprovePrescription(alarm.id)}
                              disabled={approving === alarm.id}
                              title="Approve schedule"
                            >
                              {approving === alarm.id ? (
                                <Spinner size="xs" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm text-center">
              <Text size="sm" color="muted">
                No prescriptions or schedules available for approval.
              </Text>
            </div>
          )}
        </ModalBody>

        {/* Footer */}
        <ModalFooter className="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose} className="text-gray-700">
            Close
          </Button>
          <a href="#" className="text-blue-600 font-medium hover:underline decoration-2">
            View profile
          </a>
        </ModalFooter>

        {/* Disapproval Reason Modal */}
        <ReasonOfDisapprovalModal 
          isOpen={showDisapprovalModal}
          onClose={() => {
            setShowDisapprovalModal(false);
            setMedicationBeingDisapproved(null);
          }}
          onConfirm={handleConfirmDisapproval}
          medicationName={medicationBeingDisapproved?.name}
          isLoading={disapprovingLoading}
        />

      </ModalContent>
    </Modal>
  );
};

export default ApprovePrescriptionModal;
