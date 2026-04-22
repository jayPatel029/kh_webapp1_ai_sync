/**
 * Dialysis Parameters Modal Component
 * Modal for technicians to manage dialysis parameters for patients
 * 
 * @file src/pages/adminDashboard/components/DialysisParametersModal.jsx
 * 
 * Features:
 * - Display patient information and dialysis readings
 * - Accordion-style stages: Before/During/After Dialysis
 * - Stage-specific actions (Start/Stop/Close)
 * - Pre-dialysis checklist
 * - During-dialysis monitoring
 * - Post-dialysis notes
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack,
  Badge,
  Checkbox,
} from '../../../component-library';
import { Select } from '../../../component-library/primitives/Select';
import { Accordion, AccordionItem } from '../../../component-library/primitives/Accordion';
import {
  submitDialysisHealthParams,
  getDialysisReadings,
} from '../../../ApiCalls';
import {
  startDialysisSession,
  submitSessionPreReadings,
  submitSessionReadings,
  submitSessionAction,
  getHemoDialysisParameters,
} from '../../../ApiCalls/dialysisSessionApis';
import {
  getPatientById,
} from '../../../ApiCalls/patientAPis';
import PatientProfileCard from '../../../components/PatientProfileCard';
import {
  getOrganizationById,
} from '../../../ApiCalls/clinicApis';
import './DialysisParametersModal.css';
import { calculateHeparinDose } from '../../../utils/heparinDosage';
import {
  getInventoryItems,
  getInventoryStock,
  issueInventoryStock,
  getInventoryDialyzers,
  useInventoryDialyzer as recordDialyzerUsage,
} from '../../../ApiCalls/inventoryApis';
import { updateBedStatus } from '../../../ApiCalls/bedManagementApis';

/**
 * DialysisParametersModal Component
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Handle modal close
 * @param {Object} patient - Patient data { id, patient_id, patient_name, appointment_id }
 * @param {Object} bed - Bed data { id, bed_number }
 * @param {function} onStageChange - Callback when stage changes
 * @param {boolean} isLoading - Loading state
 * @param {Object} initialData - Initial patient data (params, readings)
 */
export default function DialysisParametersModal({
  isOpen = false,
  onClose,
  patient = {},
  bed = {},
  onStageChange,
  isLoading = false,
  initialData = {},
}) {
  const [stage, setStage] = useState('before'); // 'before', 'during', 'after'
  const [completePatientData, setCompletePatientData] = useState(null);
  const [dialysisReadings, setDialysisReadings] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Guidelines & Checklist state
  const [orgGuidelines, setOrgGuidelines] = useState([]);
  const [orgChecklists, setOrgChecklists] = useState([]);
  const [dynamicChecklist, setDynamicChecklist] = useState({});

  // Before Dialysis state
  const [beforeChecklist, setBeforeChecklist] = useState({
    physical_exam_done: false,
    vital_signs_recorded: false,
    blood_access_checked: false,
    medication_given: false,
    consent_obtained: false,
  });
  const [beforeNotes, setBeforeNotes] = useState('');
  const [measuredWeight, setMeasuredWeight] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(''); // minutes
  const [targetUltrafiltration, setTargetUltrafiltration] = useState(''); // ml

  // Heparin dosage state
  const [heparinOverride, setHeparinOverride] = useState('auto'); // 'auto' | 'low' | 'standard' | 'high'
  const [selectedAilment, setSelectedAilment] = useState('');

  const heparinInfo = useMemo(() => {
    // Prefer dry_weight; fall back to measured or body_weight
    const dry = Number(completePatientData?.dry_weight) || Number(measuredWeight) || Number(completePatientData?.body_weight);
    return calculateHeparinDose(dry, heparinOverride || 'auto', selectedAilment || null);
  }, [completePatientData?.dry_weight, completePatientData?.body_weight, measuredWeight, heparinOverride, selectedAilment]);

  // During Dialysis state
  const [duringReadings, setDuringReadings] = useState({
    blood_flow_rate: '',
    dialysate_flow_rate: '',
    arterial_pressure: '',
    venous_pressure: '',
    transmembrane_pressure: '',
    ultrafiltration_rate: '',
    temperature: '',
    conductivity: '',
  });
  const [duringNotes, setDuringNotes] = useState('');

  // After Dialysis state
  const [afterNotes, setAfterNotes] = useState('');

  // Blood Samples state
  const [bloodSamples, setBloodSamples] = useState({
    samples_taken: false,
    samples_sent_to_lab: false,
  });

  // Hemo Dialysis Parameters from API
  const [hemoParams, setHemoParams] = useState([]);
  const [hemoParamsResponses, setHemoParamsResponses] = useState({});

  // Inventory & Supplies state
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryStock, setInventoryStock] = useState([]);
  const [consumedItems, setConsumedItems] = useState([]);
  const [dialyzers, setDialyzers] = useState([]);
  const [selectedDialyzerId, setSelectedDialyzerId] = useState('');
  const [markBedForCleaning, setMarkBedForCleaning] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // Fetch patient parameters, readings and inventory
  useEffect(() => {
    if (isOpen && patient?.patient_id) {
      fetchPatientData();
      fetchInventoryData();
      setSessionId(initialData?.session_id || null);
    }
  }, [isOpen, patient?.patient_id, initialData?.session_id]);

  const fetchInventoryData = useCallback(async () => {
    setInventoryLoading(true);
    try {
      const [itemsRes, stockRes, dialyzersRes] = await Promise.all([
        getInventoryItems(),
        getInventoryStock(),
        getInventoryDialyzers({ params: { status: 'ACTIVE' } })
      ]);

      if (itemsRes.success) setInventoryItems(itemsRes.data?.data || itemsRes.data || []);
      if (stockRes.success) setInventoryStock(stockRes.data?.data || stockRes.data || []);
      if (dialyzersRes.success) setDialyzers(dialyzersRes.data?.data || dialyzersRes.data || []);
    } catch (err) {
      console.error('Failed to fetch inventory data:', err);
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  const fetchPatientData = useCallback(async () => {
    setLoadingData(true);
    try {
      // 1. Fetch complete patient data (Ailments, Body Weight, Org Info)
      const patientResult = await getPatientById(patient.patient_id);
      if (patientResult.success && patientResult.data) {
        const pData = patientResult.data.data || patientResult.data;
        
        // Normalize inconsistent API shapes (matching UserProfile logic)
        const normalizedAilments = Array.isArray(pData?.ailments)
          ? pData.ailments
          : (typeof pData?.ailments === 'string' && pData.ailments.trim() !== '')
            ? pData.ailments.split(',').map(a => a.trim())
            : (typeof pData?.aliments === 'string' && pData.aliments.trim() !== '')
              ? pData.aliments.split(',').map(a => a.trim())
              : [];
        
        const finalData = { ...pData, ailments: normalizedAilments };
        setCompletePatientData(finalData);
        
        // Auto-select first relevant ailment if available for heparin calculation
        if (normalizedAilments.length > 0 && !selectedAilment) {
          setSelectedAilment(normalizedAilments[0]);
        }

        // Fetch organization guidelines if orgId is available
        const orgId = finalData.organization_id || bed?.organization_id;
        if (orgId) {
          const orgResult = await getOrganizationById(orgId);
          if (orgResult.success && orgResult.data) {
            const guidelines = orgResult.data.guidelines || [];
            const checklists = orgResult.data.checklists || [];
            
            setOrgGuidelines(guidelines);
            setOrgChecklists(checklists);
            
            // Initialize dynamic checklist for items that need checking in the "Before" stage
            // We include "Pre-dialysis" guidelines and "Preparation" checklists as interactive items
            const preGuidelines = guidelines.filter(g => g.type === 'Pre-dialysis');
            const prepChecklists = checklists.filter(c => c.type === 'Preparation');
            
            const initialChecklist = {};
            preGuidelines.forEach((item, idx) => {
              initialChecklist[`guideline_${idx}`] = false;
            });
            prepChecklists.forEach((item, idx) => {
              initialChecklist[`checklist_${idx}`] = false;
            });
            setDynamicChecklist(initialChecklist);
          }
        }
      }

      // 2. Dialysis specific health params are now part of complete patient data
      if (initialData?.params) {
        // Fallback for legacy data if needed, but primary source is now completePatientData
        if (!completePatientData) setCompletePatientData(initialData.params);
      }

      // 3. Fetch recent readings
      if (initialData?.readings) {
        setDialysisReadings(initialData.readings);
      } else {
        const readingsResult = await getDialysisReadings();
        if (readingsResult.success) {
          const patientReadings = readingsResult.data?.filter(
            (r) => r.patient_id === patient.patient_id
          );
          setDialysisReadings(patientReadings);
        }
      }

      // 4. Fetch Hemo Dialysis specific parameters
      const hemoRes = await getHemoDialysisParameters(patient.patient_id);
      if (hemoRes.success) {
        setHemoParams(hemoRes.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch patient data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [patient?.patient_id, bed?.organization_id, initialData, selectedAilment]);

  const handleStartDialysis = useCallback(async () => {
    try {
      const allChecklistDone = Object.values(beforeChecklist).every((v) => v);
      const allDynamicDone = Object.values(dynamicChecklist).every((v) => v);

      if (!allChecklistDone || !allDynamicDone) {
        alert('Please complete all pre-dialysis checks and organization guidelines before starting');
        return;
      }

      // Include calculated heparin data in submission
      const heparinPayload = heparinInfo?.doseIU
        ? {
            strategy: heparinInfo.strategy,
            dose_iu: heparinInfo.doseIU,
            per_kg: heparinInfo.perKg,
            ailment: selectedAilment || null,
          }
        : null;

      // Construct planned parameters from current session state and patient profile
      const plannedParameters = {
        session_duration_minutes: Number(estimatedDuration) || 240,
        ultrafiltration_target_ml: Number(targetUltrafiltration) || 2000,
        target_dry_weight_kg: Number(completePatientData?.dry_weight) || undefined,
        heparin_dose_units: heparinInfo?.doseIU || undefined,
        ailments: completePatientData?.ailments || [],
        notes: beforeNotes,
      };

      const startSessionRes = await startDialysisSession({
        patient_id: Number(patient.patient_id),
        bed_id: Number(bed?.id),
        appointment_id: patient?.appointment_id ? Number(patient.appointment_id) : undefined,
        planned_parameters: plannedParameters,
        patient_name: completePatientData?.name || patient?.patient_name, // Optional enrichment
      });

      if (!startSessionRes.success) {
        throw new Error(startSessionRes.data?.message || 'Failed to start dialysis session');
      }

      const startedSessionId =
        startSessionRes.data?.data?.session_id ||
        startSessionRes.data?.session_id;
      setSessionId(startedSessionId || null);

      await submitSessionPreReadings(startedSessionId, {
        weight_kg: Number(measuredWeight) || undefined,
        notes: beforeNotes,
        access_assessment: beforeChecklist.blood_access_checked ? 'Checked & patent' : 'Pending check',
        custom_parameters: hemoParamsResponses,
        labs: {
          is_infectious: completePatientData?.is_infectious || false,
        }
      });

      const result = await submitDialysisHealthParams({
        patient_id: patient.patient_id,
        bed_id: bed?.id,
        stage: 'before',
        checklist: beforeChecklist,
        notes: beforeNotes,
        heparin: heparinPayload,
        planned_parameters: plannedParameters,
        custom_readings: hemoParamsResponses,
        timestamp: new Date().toISOString(),
      });

      if (result.success || startedSessionId) {
        // compute dialysis start and duration
        const startIso = new Date().toISOString();
        const durationMin = Number(estimatedDuration) || 0;
        // compute time range string
        let timeRange = null;
        if (durationMin > 0) {
          const start = new Date(startIso);
          const end = new Date(start.getTime() + durationMin * 60 * 1000);
          const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          timeRange = `${fmt(start)} - ${fmt(end)}`;
        }

        setStage('during');
        if (onStageChange) {
          onStageChange('during', {
            checklist: beforeChecklist,
            notes: beforeNotes,
            dialysis_start: startIso,
            dialysis_duration_minutes: durationMin,
            time_range: timeRange,
            appointment_id: patient?.appointment_id,
            bed_id: bed?.id,
            heparin: heparinPayload,
          });
        }
      }
    } catch (err) {
      console.error('Failed to start dialysis:', err);
    }
  }, [beforeChecklist, beforeNotes, patient?.patient_id, patient?.appointment_id, bed?.id, measuredWeight, estimatedDuration, targetUltrafiltration, heparinInfo, selectedAilment, onStageChange]);

  const handleIssueItem = useCallback(async (itemId, qty) => {
    if (!itemId || !qty || qty <= 0) return;
    try {
      const result = await issueInventoryStock({
        item_id: Number(itemId),
        location_id: 1, // Assume main storage for simplicity, would ideally come from context
        quantity: Number(qty),
        reason: `Session issue: Patient ${patient?.patient_name || 'unknown'}`,
        reference_id: patient?.appointment_id, // Audit trail link
      });
      
      if (result.success) {
        const item = inventoryItems.find(i => i.id === Number(itemId));
        setConsumedItems(prev => [...prev, { 
          id: Date.now(), 
          name: item?.name || `Item ${itemId}`, 
          quantity: qty 
        }]);
      } else {
        alert(`Failed to issue item: ${result.data?.message || 'Stock not available'}`);
      }
    } catch (err) {
      console.error('Error issuing stock:', err);
    }
  }, [patient, inventoryItems]);

  const handleUseDialyzer = useCallback(async () => {
    if (!selectedDialyzerId) return;
    try {
      const result = await recordDialyzerUsage(selectedDialyzerId, {
        notes: `Used in session for patient ${patient?.patient_name || 'unknown'}`
      });
      if (result.success) {
        const d = dialyzers.find(dia => dia.id === Number(selectedDialyzerId));
        setConsumedItems(prev => [...prev, { 
          id: Date.now(), 
          name: `Dialyzer Usage: ${d?.id || selectedDialyzerId}`, 
          quantity: 1 
        }]);
        setSelectedDialyzerId('');
        // Refresh dialyzers
        fetchInventoryData();
      } else {
        alert(`Failed to record dialyzer usage: ${result.data?.message || 'Error'}`);
      }
    } catch (err) {
      console.error('Error recording dialyzer use:', err);
    }
  }, [selectedDialyzerId, patient, dialyzers, fetchInventoryData]);

  const handleStopDialysis = useCallback(async () => {
    try {
      if (sessionId) {
        await submitSessionReadings(sessionId, {
          timestamp: new Date().toISOString(),
          reading: {
            blood_flow_rate: Number(duringReadings.blood_flow_rate) || undefined,
            dialysate_flow_rate: Number(duringReadings.dialysate_flow_rate) || undefined,
            arterial_pressure: Number(duringReadings.arterial_pressure) || undefined,
            venous_pressure: Number(duringReadings.venous_pressure) || undefined,
            transmembrane_pressure: Number(duringReadings.transmembrane_pressure) || undefined,
            ultrafiltration_rate: Number(duringReadings.ultrafiltration_rate) || undefined,
            temperature: Number(duringReadings.temperature) || undefined,
            conductivity: Number(duringReadings.conductivity) || undefined,
            notes: duringNotes || undefined,
          },
        });

        await submitSessionAction(sessionId, {
          action: 'stop',
          reason: duringNotes || 'Dialysis session stopped from UI',
        });
      }

      const result = await submitDialysisHealthParams({
        patient_id: patient.patient_id,
        bed_id: bed?.id,
        stage: 'during',
        readings: duringReadings,
        notes: duringNotes,
        timestamp: new Date().toISOString(),
      });

      if (result.success) {
        setStage('after');
        if (onStageChange) {
          onStageChange('after', { readings: duringReadings, notes: duringNotes });
        }
      }
    } catch (err) {
      console.error('Failed to stop dialysis:', err);
    }
  }, [sessionId, duringReadings, duringNotes, patient?.patient_id, bed?.id, onStageChange]);

  const handleCloseDialysis = useCallback(async () => {
    try {
      const result = await submitDialysisHealthParams({
        patient_id: patient.patient_id,
        bed_id: bed?.id,
        stage: 'after',
        blood_samples: bloodSamples,
        notes: afterNotes,
        timestamp: new Date().toISOString(),
      });

      if (result.success) {
        if (onStageChange) {
          onStageChange('completed', { notes: afterNotes, bloodSamples });
        }
        onClose();
      }
    } catch (err) {
      console.error('Failed to close dialysis:', err);
    }
  }, [bloodSamples, afterNotes, patient?.patient_id, bed?.id, onStageChange, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="8xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="88vh" className="dialysis-modal__content" style={{ width: '80vw', maxWidth: '80vw' }}>
        <ModalHeader className="dialysis-modal__header">
          <VStack align="start" spacing={3} width="100%">
            <Box className="dialysis-modal__title-group">
              <Heading as="h2" size="lg" className="dialysis-modal__title">
                Dialysis Session Management
              </Heading>
              {/* <ModalCloseButton className="dialysis-modal__close-button" /> */}
            </Box>

            <Box className="dialysis-modal__header-summary">
              <div className="dialysis-modal__summary-pill">
                <span className="dialysis-modal__summary-label">Patient</span>
                <span className="dialysis-modal__summary-value">
                  {patient?.patient_name || patient?.patient_id || '—'}
                </span>
              </div>
              <div className="dialysis-modal__summary-pill">
                <span className="dialysis-modal__summary-label">Bed</span>
                <span className="dialysis-modal__summary-value">
                  {bed?.bed_number || '—'}
                </span>
              </div>
              <div className="dialysis-modal__summary-pill dialysis-modal__summary-pill--stage">
                <span className="dialysis-modal__summary-label">Stage</span>
                <Badge
                  colorScheme={
                    stage === 'before' ? 'info' : stage === 'during' ? 'warning' : 'success'
                  }
                  variant="solid"
                >
                  {stage === 'before'
                    ? 'Before Dialysis'
                    : stage === 'during'
                    ? 'During Dialysis'
                    : 'After Dialysis'}
                </Badge>
              </div>
            </Box>
          </VStack>
        </ModalHeader>

        <ModalBody py={6} className="dialysis-modal__body">
          {loadingData ? (
            <VStack spacing={4} justify="center" minH="200px">
              <Text>Loading patient data...</Text>
            </VStack>
          ) : (
            <Box className="dialysis-modal__workspace">
              <HStack align="start" spacing={6} width="100%" className="dialysis-modal__main-layout">
                {/* LEFT SIDEBAR: Patient Info */}
                <Box flex={2.5} className="dialysis-modal__left-sidebar">
                  <PatientProfileCard 
                    userData={completePatientData || patient} 
                    role={{ role_name: 'Medical Staff' }} 
                    showAilmentDetails={false} 
                  />
                </Box>

                {/* CENTER AREA: Session Stages */}
                <VStack flex={6.5} align="stretch" spacing={6} className="dialysis-modal__center-content">
                  {/* BEFORE DIALYSIS - STATIC PANEL (NOT ACCORDION ITEM YET, OR TOP ACCORDION OPEN) */}
                  <Card variant="outline" className="dialysis-modal__stage-panel dialysis-modal__stage-panel--before" borderRadius="24px" border="1px solid" borderColor="info.200" shadow="sm">
                    <CardHeader bg="info.50" py={3} px={6} borderTopRadius="24px">
                      <HStack justify="space-between">
                        <Heading as="h3" size="md" color="info.800">BEFORE Dialysis</Heading>
                        <Badge colorScheme="info">STEP 1</Badge>
                      </HStack>
                    </CardHeader>
                    <CardBody p={6}>
                      <VStack spacing={6} align="stretch">
                        {/* Top row with 3 sub-columns: Checklist, Readings, Guidelines */}
                        <HStack align="start" spacing={6}>
                          {/* 1. Checklist (Actual API Data) */}
                          <VStack flex={1} align="stretch" spacing={3}>
                            <Heading as="h5" size="xs" textTransform="uppercase" letterSpacing="wider" color="slate.500">Checklist</Heading>
                            <Box className="dialysis-modal__checklist-container" p={4} bg="slate.50" borderRadius="xl" border="1px solid" borderColor="slate.100">
                              <VStack align="start" spacing={3}>
                                {/* Standard Checklist Items */}
                                {[
                                  { key: 'physical_exam_done', label: 'Physical Exam' },
                                  { key: 'vital_signs_recorded', label: 'Vitals Recorded' },
                                  { key: 'blood_access_checked', label: 'Access Checked' },
                                  { key: 'medication_given', label: 'Medications' },
                                  { key: 'consent_obtained', label: 'Consent' }
                                ].map(item => (
                                  <Checkbox
                                    key={item.key}
                                    checked={beforeChecklist[item.key]}
                                    onChange={(e) => setBeforeChecklist({ ...beforeChecklist, [item.key]: e.target.checked })}
                                    disabled={stage !== 'before'}
                                    size="sm"
                                    colorScheme="info"
                                  >
                                    <Text fontSize="xs" fontWeight="500">{item.label}</Text>
                                  </Checkbox>
                                ))}
                                {/* Actual Org API Checklist Items (Preparation) */}
                                {orgChecklists.filter(c => c.type === 'Preparation').map((gl, i) => (
                                  <Checkbox
                                    key={`org_checklist_${i}`}
                                    checked={dynamicChecklist[`checklist_${i}`]}
                                    onChange={(e) => setDynamicChecklist(prev => ({ ...prev, [`checklist_${i}`]: e.target.checked }))}
                                    disabled={stage !== 'before'}
                                    size="sm"
                                    colorScheme="info"
                                  >
                                    <Text fontSize="xs" fontWeight="500">{gl.text}</Text>
                                  </Checkbox>
                                ))}
                              </VStack>
                            </Box>
                          </VStack>

                          {/* 2. Readings (Actual API Parameters) */}
                          <VStack flex={2} align="stretch" spacing={3}>
                            <Heading as="h5" size="xs" textTransform="uppercase" letterSpacing="wider" color="slate.500">Readings & Parameters</Heading>
                            <Box className="dialysis-modal__readings-container" p={4} bg="white" borderRadius="xl" border="1px solid" borderColor="slate.200">
                              <Box className="grid grid-cols-2 gap-x-4 gap-y-3">
                                {/* Hemo Params from API */}
                                {hemoParams.map((param) => (
                                  <FormControl key={param.id}>
                                    <FormLabel fontSize="xs" mb={1} fontWeight="700" color="slate.600">
                                      {param.title} {param.unit ? `(${param.unit})` : ''}
                                    </FormLabel>
                                    <Input
                                      type={param.type === 'Numeric' ? 'number' : param.type === 'Date' ? 'datetime-local' : 'text'}
                                      placeholder={param.title}
                                      value={hemoParamsResponses[param.id] || ''}
                                      onChange={(e) => setHemoParamsResponses({ ...hemoParamsResponses, [param.id]: e.target.value })}
                                      size="xs"
                                      borderRadius="md"
                                      disabled={stage !== 'before'}
                                    />
                                  </FormControl>
                                ))}
                                {/* Standard Planning Inputs */}
                                <FormControl>
                                  <FormLabel fontSize="xs" mb={1} fontWeight="700">Measured Weight (kg)</FormLabel>
                                  <Input size="xs" type="number" value={measuredWeight} onChange={(e) => setMeasuredWeight(e.target.value)} disabled={stage !== 'before'} />
                                </FormControl>
                                <FormControl>
                                  <FormLabel fontSize="xs" mb={1} fontWeight="700">Target UF (ml)</FormLabel>
                                  <Input size="xs" type="number" value={targetUltrafiltration} onChange={(e) => setTargetUltrafiltration(e.target.value)} disabled={stage !== 'before'} />
                                </FormControl>
                              </Box>
                            </Box>
                          </VStack>

                          {/* 3. Guidelines (Actual API Data) */}
                          <VStack flex={1} align="stretch" spacing={3}>
                            <Heading as="h5" size="xs" textTransform="uppercase" letterSpacing="wider" color="slate.500">Guidelines</Heading>
                            <Box className="dialysis-modal__guidelines-container" p={4} bg="slate.50" borderRadius="xl" border="1px solid" borderColor="slate.100">
                              <VStack align="start" spacing={3}>
                                {/* Pre-dialysis Guidelines */}
                                {orgGuidelines.filter(g => g.type === 'Pre-dialysis').map((gl, i) => (
                                  <Checkbox
                                    key={`org_guideline_${i}`}
                                    checked={dynamicChecklist[`guideline_${i}`]}
                                    onChange={(e) => setDynamicChecklist(prev => ({ ...prev, [`guideline_${i}`]: e.target.checked }))}
                                    disabled={stage !== 'before'}
                                    size="sm"
                                    colorScheme="info"
                                  >
                                    <Text fontSize="xs" fontWeight="500" color="slate.700">{gl.text}</Text>
                                  </Checkbox>
                                ))}
                                {orgGuidelines.filter(g => g.type === 'Pre-dialysis').length === 0 && (
                                  <Text fontSize="xs" color="slate.400 italic">No specific pre-dialysis instructions.</Text>
                                )}
                              </VStack>
                            </Box>
                          </VStack>
                        </HStack>

                        {/* Heparin Calculations Row */}
                        <Box p={4} bg="info.50" borderRadius="xl" border="1px dashed" borderColor="info.200">
                          <HStack justify="space-between" align="center">
                            <VStack align="start" spacing={1}>
                              <Heading as="h6" size="xs" color="info.700">Heparin Calculations</Heading>
                              <Text fontSize="10px" color="info.600">Based on Dry Weight: {completePatientData?.dry_weight || 'N/A'} kg</Text>
                            </VStack>
                            <HStack spacing={6}>
                              <HStack spacing={2}>
                                <Text fontSize="xs" fontWeight="600">Suggested Dose:</Text>
                                <Badge colorScheme="info" variant="solid" fontSize="sm" px={3} py={1} borderRadius="lg">
                                  {heparinInfo?.doseIU ? `${heparinInfo.doseIU} IU` : '—'}
                                </Badge>
                              </HStack>
                              <Select
                                value={heparinOverride}
                                onChange={(e) => setHeparinOverride(e.target.value)}
                                disabled={stage !== 'before'}
                                size="xs"
                                width="120px"
                                borderRadius="md"
                              >
                                <option value="auto">Auto-Dose</option>
                                <option value="low">Low Dose</option>
                                <option value="standard">Standard</option>
                                <option value="high">High Dose</option>
                              </Select>
                            </HStack>
                          </HStack>
                        </Box>

                        {/* Bottom Row: Notes & Start Button */}
                        <HStack align="end" spacing={4}>
                          <FormControl flex={1}>
                            <FormLabel fontSize="xs" fontWeight="700">Pre-Dialysis Notes</FormLabel>
                            <Textarea
                              placeholder="Add any observations..."
                              value={beforeNotes}
                              onChange={(e) => setBeforeNotes(e.target.value)}
                              disabled={stage !== 'before'}
                              rows={2}
                              size="sm"
                              borderRadius="xl"
                            />
                          </FormControl>
                          <Button
                            colorScheme="success"
                            size="lg"
                            onClick={handleStartDialysis}
                            isLoading={isLoading}
                            isDisabled={stage !== 'before'}
                            height="60px"
                            px={12}
                            borderRadius="xl"
                            shadow="lg"
                            _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                            transition="all 0.2s"
                          >
                            START SESSION →
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* DURING & AFTER ACCORDIONS */}
                  <Accordion defaultIndex={stage === 'before' ? [] : stage === 'during' ? [0] : [1]} allowMultiple>
                    <AccordionItem
                      title="During Dialysis Monitoring"
                      badge="STEP 2"
                      badgeColor="warning"
                      className="dialysis-modal__accordion-item"
                    >
                      <VStack spacing={4} align="stretch">
                        <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                          <CardHeader><Heading as="h4" size="sm">Machine Readings</Heading></CardHeader>
                          <CardBody>
                            <Box className="grid grid-cols-2 gap-4">
                              <FormControl><FormLabel fontSize="xs">BFR (mL/min)</FormLabel><Input size="sm" type="number" value={duringReadings.blood_flow_rate} onChange={(e) => setDuringReadings({ ...duringReadings, blood_flow_rate: e.target.value })} disabled={stage !== 'during'} /></FormControl>
                              <FormControl><FormLabel fontSize="xs">DFR (mL/min)</FormLabel><Input size="sm" type="number" value={duringReadings.dialysate_flow_rate} onChange={(e) => setDuringReadings({ ...duringReadings, dialysate_flow_rate: e.target.value })} disabled={stage !== 'during'} /></FormControl>
                              <FormControl><FormLabel fontSize="xs">Arterial (mmHg)</FormLabel><Input size="sm" type="number" value={duringReadings.arterial_pressure} onChange={(e) => setDuringReadings({ ...duringReadings, arterial_pressure: e.target.value })} disabled={stage !== 'during'} /></FormControl>
                              <FormControl><FormLabel fontSize="xs">Venous (mmHg)</FormLabel><Input size="sm" type="number" value={duringReadings.venous_pressure} onChange={(e) => setDuringReadings({ ...duringReadings, venous_pressure: e.target.value })} disabled={stage !== 'during'} /></FormControl>
                              <FormControl><FormLabel fontSize="xs">TMP (mmHg)</FormLabel><Input size="sm" type="number" value={duringReadings.transmembrane_pressure} onChange={(e) => setDuringReadings({ ...duringReadings, transmembrane_pressure: e.target.value })} disabled={stage !== 'during'} /></FormControl>
                              <FormControl><FormLabel fontSize="xs">UF Rate (mL/hr)</FormLabel><Input size="sm" type="number" value={duringReadings.ultrafiltration_rate} onChange={(e) => setDuringReadings({ ...duringReadings, ultrafiltration_rate: e.target.value })} disabled={stage !== 'during'} /></FormControl>
                            </Box>
                          </CardBody>
                        </Card>

                        <FormControl>
                          <FormLabel fontSize="xs">Monitoring Notes</FormLabel>
                          <Textarea value={duringNotes} onChange={(e) => setDuringNotes(e.target.value)} disabled={stage !== 'during'} rows={2} size="sm" />
                        </FormControl>

                        <Button colorScheme="warning" onClick={handleStopDialysis} isLoading={isLoading} isDisabled={stage !== 'during'} width="100%">
                          Stop Dialysis
                        </Button>
                      </VStack>
                    </AccordionItem>

                    <AccordionItem
                      title="Post-Dialysis Assessment"
                      badge="STEP 3"
                      badgeColor="success"
                      className="dialysis-modal__accordion-item"
                    >
                      <VStack spacing={4} align="stretch">
                        <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                          <CardHeader><Heading as="h4" size="sm">Post-Session Checks</Heading></CardHeader>
                          <CardBody>
                            <VStack align="start" spacing={2}>
                              <Checkbox checked={bloodSamples.samples_taken} onChange={(e) => setBloodSamples({ ...bloodSamples, samples_taken: e.target.checked })} disabled={stage !== 'after'} size="sm">Samples taken</Checkbox>
                              <Checkbox checked={bloodSamples.samples_sent_to_lab} onChange={(e) => setBloodSamples({ ...bloodSamples, samples_sent_to_lab: e.target.checked })} disabled={stage !== 'after'} size="sm">Sent to lab</Checkbox>
                              
                              {/* Post-dialysis Guidelines */}
                              {orgGuidelines.filter(g => g.type === 'Post-dialysis').map((gl, i) => (
                                <Checkbox
                                  key={`post_gl_${i}`}
                                  size="sm"
                                  disabled={stage !== 'after'}
                                >
                                  <Text fontSize="xs">{gl.text}</Text>
                                </Checkbox>
                              ))}

                              {/* Cleaning Checklists */}
                              {orgChecklists.filter(c => c.type === 'Cleaning').map((cl, i) => (
                                <Checkbox
                                  key={`clean_cl_${i}`}
                                  size="sm"
                                  disabled={stage !== 'after'}
                                  colorScheme="warning"
                                >
                                  <Text fontSize="xs">Cleaning: {cl.text}</Text>
                                </Checkbox>
                              ))}
                            </VStack>
                          </CardBody>
                        </Card>
                        <FormControl>
                          <FormLabel fontSize="xs">Post-Dialysis Notes</FormLabel>
                          <Textarea value={afterNotes} onChange={(e) => setAfterNotes(e.target.value)} disabled={stage !== 'after'} rows={2} size="sm" />
                        </FormControl>
                        <HStack justify="space-between" align="center" width="100%" mt={2}>
                          <Checkbox
                            checked={markBedForCleaning}
                            onChange={(e) => setMarkBedForCleaning(e.target.checked)}
                            size="sm"
                            colorScheme="info"
                          >
                            <Text fontSize="xs" fontWeight="500">Mark bed for cleaning after session</Text>
                          </Checkbox>
                          <Button
                            colorScheme="success"
                            onClick={async () => {
                              if (markBedForCleaning && bed?.id) {
                                try {
                                  await updateBedStatus(bed.id, {
                                    status: 'MAINTENANCE',
                                    notes: 'Automatically marked for cleaning after session'
                                  });
                                } catch (e) {
                                  console.error('Failed to update bed status:', e);
                                }
                              }
                              handleCloseDialysis();
                            }}
                            isLoading={isLoading}
                            isDisabled={stage !== 'after'}
                            px={8}
                          >
                            Complete & Close Session
                          </Button>
                        </HStack>
                      </VStack>
                    </AccordionItem>
                  </Accordion>
                </VStack>

                {/* RIGHT SIDEBAR: Supplies & Inventory */}
                <Box flex={2.5} className="dialysis-modal__right-sidebar">
                  <Card variant="elevated" className="dialysis-modal__inventory-card" height="100%" shadow="md" borderRadius="20px">
                    <CardHeader bg="slate.50" borderTopRadius="20px" py={4}>
                      <VStack align="start" spacing={1}>
                        <Heading as="h4" size="sm" color="slate.800">Supplies & Inventory</Heading>
                        <Text fontSize="xs" color="slate.500">Track items consumed during this session</Text>
                      </VStack>
                    </CardHeader>
                    <CardBody p={4}>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold">Select Item</FormLabel>
                          <Select
                            placeholder="Choose supply item..."
                            onChange={(e) => {
                              const itemId = e.target.value;
                              if (itemId) handleIssueItem(itemId, 1);
                            }}
                            disabled={stage === 'before'}
                            size="sm"
                          >
                            {inventoryItems.map(item => (
                              <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold">Dialyzer Usage</FormLabel>
                          <HStack>
                            <Select
                              placeholder="Select Dialyzer..."
                              value={selectedDialyzerId}
                              onChange={(e) => setSelectedDialyzerId(e.target.value)}
                              disabled={stage === 'before'}
                              size="sm"
                            >
                              {dialyzers.map(d => (
                                <option key={d.id} value={d.id}>Dialyzer #{d.id} ({d.usage_count}/{d.max_usage})</option>
                              ))}
                            </Select>
                            <Button
                              size="sm"
                              colorScheme="info"
                              onClick={handleUseDialyzer}
                              isDisabled={!selectedDialyzerId || stage === 'before'}
                            >
                              Use
                            </Button>
                          </HStack>
                        </FormControl>

                        <Box mt={4}>
                          <Text fontSize="xs" fontWeight="bold" mb={2} color="slate.600">Consumed Items List</Text>
                          {consumedItems.length > 0 ? (
                            <VStack align="stretch" spacing={2}>
                              {consumedItems.map(item => (
                                <HStack key={item.id} justify="space-between" p={2} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.100">
                                  <Text fontSize="xs" fontWeight="600" color="blue.800">{item.name}</Text>
                                  <Badge size="xs" colorScheme="blue" variant="solid">Qty: {item.quantity}</Badge>
                                </HStack>
                              ))}
                            </VStack>
                          ) : (
                            <Box p={4} textAlign="center" border="1px dashed" borderColor="slate.200" borderRadius="lg">
                              <Text fontSize="xs" color="slate.400 italic">No items linked yet</Text>
                            </Box>
                          )}
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              </HStack>
            </Box>
          )}
        </ModalBody>

        <ModalFooter className="dialysis-modal__footer">
          <HStack spacing={2} justify="flex-end">
            <Button
              variant="outline"
              onClick={onClose}
              isDisabled={isLoading || loadingData}
            >
              Close
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
