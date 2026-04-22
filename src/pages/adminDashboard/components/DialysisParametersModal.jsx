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
            setOrgGuidelines(guidelines);
            
            // Initialize dynamic checklist for pre-dialysis items
            const preItems = guidelines.filter(g => 
              g.type?.toLowerCase().includes('pre') || 
              g.type?.toLowerCase().includes('checklist')
            );
            const initialChecklist = {};
            preItems.forEach((item, idx) => {
              initialChecklist[`dynamic_${idx}`] = false;
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
                {/* LEFT SIDE: Patient Profile & Session Accordions */}
                <VStack flex={7} align="stretch" spacing={6} className="dialysis-modal__left-column">
                  <PatientProfileCard userData={completePatientData || patient} role={{ role_name: 'Medical Staff' }} />

                  <Accordion defaultIndex={stage === 'before' ? 0 : stage === 'during' ? 1 : 2} allowToggle={false}>
                    {/* =================================================================
                        BEFORE DIALYSIS
                        ================================================================= */}
                    <AccordionItem
                      title="Pre-Dialysis Assessment & Checklist"
                      badge="STEP 1"
                      badgeColor="info"
                      className="dialysis-modal__accordion-item"
                    >
                      <VStack spacing={4} align="stretch">
                        {/* Dynamic Hemo Dialysis Parameters from API */}
                        {hemoParams.length > 0 && (
                          <Card variant="outline" size="sm" className="dialysis-modal__panel-card" borderLeft="4px solid" borderColor="info.500">
                            <CardHeader>
                              <Heading as="h4" size="sm">Hemo-Dialysis Reading Parameters</Heading>
                            </CardHeader>
                            <CardBody>
                              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hemoParams.map((param) => (
                                  <FormControl key={param.id}>
                                    <FormLabel fontSize="sm" fontWeight="600">
                                      {param.title} {param.unit ? `(${param.unit})` : ''}
                                    </FormLabel>
                                    {param.type === 'Numeric' ? (
                                      <Input
                                        type="number"
                                        placeholder={`Enter ${param.title}`}
                                        value={hemoParamsResponses[param.id] || ''}
                                        onChange={(e) => setHemoParamsResponses({
                                          ...hemoParamsResponses,
                                          [param.id]: e.target.value
                                        })}
                                        size="sm"
                                        disabled={stage !== 'before'}
                                      />
                                    ) : param.type === 'Date' ? (
                                      <Input
                                        type="datetime-local"
                                        value={hemoParamsResponses[param.id] || ''}
                                        onChange={(e) => setHemoParamsResponses({
                                          ...hemoParamsResponses,
                                          [param.id]: e.target.value
                                        })}
                                        size="sm"
                                        disabled={stage !== 'before'}
                                      />
                                    ) : (
                                      <Input
                                        placeholder={`Enter ${param.title}`}
                                        value={hemoParamsResponses[param.id] || ''}
                                        onChange={(e) => setHemoParamsResponses({
                                          ...hemoParamsResponses,
                                          [param.id]: e.target.value
                                        })}
                                        size="sm"
                                        disabled={stage !== 'before'}
                                      />
                                    )}
                                    {param.assign_range === 'yes' && (param.low_range !== null || param.high_range !== null) && (
                                      <Text fontSize="10px" color="textMuted" mt={1}>
                                        Normal range: {param.low_range ?? 'N/A'} - {param.high_range ?? 'N/A'}
                                      </Text>
                                    )}
                                  </FormControl>
                                ))}
                              </Box>
                            </CardBody>
                          </Card>
                        )}

                        {/* Baseline Parameters (derived from completePatientData) */}
                        {completePatientData && (
                          <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                            <CardHeader>
                              <Heading as="h4" size="sm">Baseline Parameters</Heading>
                            </CardHeader>
                            <CardBody>
                              <Box className="grid grid-cols-2 gap-x-6 gap-y-2">
                                <HStack justify="space-between"><Text fontSize="xs">Height:</Text><Text fontSize="xs" fontWeight="700">{completePatientData.height || 'N/A'} cm</Text></HStack>
                                <HStack justify="space-between"><Text fontSize="xs">Weight:</Text><Text fontSize="xs" fontWeight="700">{completePatientData.body_weight || 'N/A'} kg</Text></HStack>
                                <HStack justify="space-between"><Text fontSize="xs">Blood Type:</Text><Text fontSize="xs" fontWeight="700">{completePatientData.blood_type || 'N/A'}</Text></HStack>
                                <HStack justify="space-between"><Text fontSize="xs">Access:</Text><Text fontSize="xs" fontWeight="700">{completePatientData.vascular_access_type || 'N/A'}</Text></HStack>
                                <HStack justify="space-between" gridColumn="span 2"><Text fontSize="xs">Dry Weight:</Text><Text fontSize="xs" fontWeight="700">{completePatientData.dry_weight || 'N/A'} kg</Text></HStack>
                              </Box>
                            </CardBody>
                          </Card>
                        )}

                        <HStack align="start" spacing={4}>
                          {/* Pre-Dialysis Checklist */}
                          <Card variant="outline" size="sm" className="dialysis-modal__panel-card" flex={1}>
                            <CardHeader>
                              <Heading as="h4" size="sm">Checklist</Heading>
                            </CardHeader>
                            <CardBody>
                              <VStack spacing={2} align="start">
                                {[
                                  { key: 'physical_exam_done', label: 'Physical exam' },
                                  { key: 'vital_signs_recorded', label: 'Vitals recorded' },
                                  { key: 'blood_access_checked', label: 'Access patent' },
                                  { key: 'medication_given', label: 'Medications' },
                                  { key: 'consent_obtained', label: 'Consent' }
                                ].map(item => (
                                  <FormControl key={item.key} display="flex" alignItems="center">
                                    <HStack spacing={2}>
                                      <Checkbox
                                        checked={beforeChecklist[item.key]}
                                        onChange={(e) => setBeforeChecklist({ ...beforeChecklist, [item.key]: e.target.checked })}
                                        disabled={stage !== 'before'}
                                        size="sm"
                                      />
                                      <Text fontSize="xs">{item.label}</Text>
                                    </HStack>
                                  </FormControl>
                                ))}
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Dynamic Organization Guidelines */}
                          {orgGuidelines.filter(g => g.type?.toLowerCase().includes('pre')).length > 0 && (
                            <Card variant="outline" size="sm" className="dialysis-modal__panel-card" flex={1.2}>
                              <CardHeader>
                                <Heading as="h4" size="sm">Org Guidelines</Heading>
                              </CardHeader>
                              <CardBody>
                                <VStack spacing={2} align="start">
                                  {orgGuidelines.filter(g => g.type?.toLowerCase().includes('pre')).map((gl, i) => (
                                    <FormControl key={i} display="flex" alignItems="center">
                                      <HStack spacing={2}>
                                        <Checkbox
                                          checked={dynamicChecklist[`dynamic_${i}`]}
                                          onChange={(e) => setDynamicChecklist(prev => ({ ...prev, [`dynamic_${i}`]: e.target.checked }))}
                                          disabled={stage !== 'before'}
                                          size="sm"
                                        />
                                        <Text fontSize="xs">{gl.text}</Text>
                                      </HStack>
                                    </FormControl>
                                  ))}
                                </VStack>
                              </CardBody>
                            </Card>
                          )}
                        </HStack>

                        {/* Heparin dosage suggestion */}
                        <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                          <CardHeader>
                            <Heading as="h4" size="sm">Heparin Dosage</Heading>
                          </CardHeader>
                          <CardBody>
                            <VStack spacing={3} align="stretch">
                              <HStack width="100%" spacing={3}>
                                <FormControl flex={1}>
                                  <FormLabel fontSize="xs">Strategy</FormLabel>
                                  <Select
                                    value={heparinOverride}
                                    onChange={(e) => setHeparinOverride(e.target.value)}
                                    disabled={stage !== 'before'}
                                    size="sm"
                                  >
                                    <option value="auto">Auto</option>
                                    <option value="low">Low</option>
                                    <option value="standard">Standard</option>
                                    <option value="high">High</option>
                                  </Select>
                                </FormControl>
                                <FormControl flex={1}>
                                  <FormLabel fontSize="xs">Suggested Dose</FormLabel>
                                  <Box p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                                    <Text fontSize="xs" fontWeight="700">
                                      {heparinInfo?.doseIU ? `${heparinInfo.doseIU} IU` : '—'}
                                      {heparinInfo?.perKg ? ` (${heparinInfo.perKg} IU/kg)` : ''}
                                    </Text>
                                  </Box>
                                </FormControl>
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>

                        {/* Planning Inputs */}
                        <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                          <CardBody>
                            <HStack spacing={3} align="end">
                              <FormControl flex={1}>
                                <FormLabel fontSize="xs">Weight (kg)</FormLabel>
                                <Input value={measuredWeight} onChange={(e) => setMeasuredWeight(e.target.value)} disabled={stage !== 'before'} size="sm" type="number" />
                              </FormControl>
                              <FormControl flex={1}>
                                <FormLabel fontSize="xs">Duration (min)</FormLabel>
                                <Input value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} disabled={stage !== 'before'} size="sm" type="number" />
                              </FormControl>
                              <FormControl flex={1}>
                                <FormLabel fontSize="xs">UF Target (ml)</FormLabel>
                                <Input value={targetUltrafiltration} onChange={(e) => setTargetUltrafiltration(e.target.value)} disabled={stage !== 'before'} size="sm" type="number" />
                              </FormControl>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const mw = Number(measuredWeight) || Number(completePatientData?.body_weight) || 0;
                                  const dw = Number(completePatientData?.dry_weight) || 0;
                                  const targetKg = Math.max(0, mw - dw);
                                  const targetMl = Math.round(targetKg * 1000);
                                  setTargetUltrafiltration(String(targetMl));
                                  const computedMin = Math.max(60, Math.round((targetMl / 500) * 60));
                                  setEstimatedDuration(String(computedMin));
                                }}
                                isDisabled={stage !== 'before'}
                              >
                                Calc
                              </Button>
                            </HStack>
                          </CardBody>
                        </Card>

                        <FormControl>
                          <FormLabel fontSize="xs">Pre-Dialysis Notes</FormLabel>
                          <Textarea
                            placeholder="Observations..."
                            value={beforeNotes}
                            onChange={(e) => setBeforeNotes(e.target.value)}
                            disabled={stage !== 'before'}
                            rows={2}
                            size="sm"
                          />
                        </FormControl>

                        <Button
                          colorScheme="success"
                          onClick={handleStartDialysis}
                          isLoading={isLoading}
                          isDisabled={stage !== 'before'}
                          width="100%"
                        >
                          Start Dialysis Session
                        </Button>
                      </VStack>
                    </AccordionItem>

                    {/* =================================================================
                        DURING DIALYSIS
                        ================================================================= */}
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

                    {/* =================================================================
                        AFTER DIALYSIS
                        ================================================================= */}
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

                {/* RIGHT SIDE: Supplies & Inventory */}
                <VStack flex={3} align="stretch" spacing={6} className="dialysis-modal__right-column">
                  <Card variant="elevated" className="dialysis-modal__inventory-card" height="fit-content" shadow="md" borderRadius="20px">
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
                </VStack>
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
