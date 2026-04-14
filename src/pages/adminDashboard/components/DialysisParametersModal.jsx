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
  getDialysisHealthParams,
  submitDialysisHealthParams,
  getDialysisReadings,
} from '../../../ApiCalls';
import './DialysisParametersModal.css';
import { calculateHeparinDose } from '../../../utils/heparinDosage';

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
  const [patientParams, setPatientParams] = useState(null);
  const [dialysisReadings, setDialysisReadings] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

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

  // Heparin dosage state
  const [heparinOverride, setHeparinOverride] = useState('auto'); // 'auto' | 'low' | 'standard' | 'high'
  const [selectedAilment, setSelectedAilment] = useState('');

  const heparinInfo = useMemo(() => {
    // Prefer dry_weight as requested; fall back to measured or body_weight
    const dry = Number(patientParams?.dry_weight) || Number(measuredWeight) || Number(patientParams?.body_weight);
    return calculateHeparinDose(dry, heparinOverride || 'auto', selectedAilment || null);
  }, [patientParams?.dry_weight, patientParams?.body_weight, measuredWeight, heparinOverride, selectedAilment]);

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
  const [bloodSamples, setBloodSamples] = useState({
    samples_taken: false,
    samples_sent_to_lab: false,
  });

  // Fetch patient parameters and readings
  useEffect(() => {
    if (isOpen && patient?.patient_id) {
      fetchPatientData();
    }
  }, [isOpen, patient?.patient_id]);

  const fetchPatientData = useCallback(async () => {
    setLoadingData(true);
    try {
      // Try to get from initialData first
      if (initialData?.params) {
        setPatientParams(initialData.params);
      } else {
        const paramsResult = await getDialysisHealthParams({
          patient_id: patient.patient_id,
        });
        if (paramsResult.success) {
          setPatientParams(paramsResult.data);
        }
      }

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
    } catch (err) {
      console.error('Failed to fetch patient data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [patient?.patient_id, initialData]);

  const handleStartDialysis = useCallback(async () => {
    try {
      const allChecklistDone = Object.values(beforeChecklist).every((v) => v);
      if (!allChecklistDone) {
        alert('Please complete all pre-dialysis checks before starting');
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

      const result = await submitDialysisHealthParams({
        patient_id: patient.patient_id,
        bed_id: bed?.id,
        stage: 'before',
        checklist: beforeChecklist,
        notes: beforeNotes,
        heparin: heparinPayload,
        timestamp: new Date().toISOString(),
      });

      if (result.success) {
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
  }, [beforeChecklist, beforeNotes, patient?.patient_id, bed?.id, onStageChange]);

  const handleStopDialysis = useCallback(async () => {
    try {
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
  }, [duringReadings, duringNotes, patient?.patient_id, bed?.id, onStageChange]);

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
              <Accordion defaultIndex={stage === 'before' ? 0 : stage === 'during' ? 1 : 2}>
              {/* =================================================================
                  BEFORE DIALYSIS
                  ================================================================= */}
              <AccordionItem
                title="Pre-Dialysis Assessment & Checklist"
                badge="STEP 1"
                badgeColor="info"
                className="dialysis-modal__accordion-item"
              >
                <VStack spacing={4}>
                  {/* Patient Parameters */}
                  {patientParams && (
                    <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                      <CardHeader>
                        <Heading as="h4" size="sm">
                          Patient Parameters
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3} align="start">
                          <HStack width="100%" justify="space-between">
                            <Text fontSize="sm">Height:</Text>
                            <Text fontWeight="600">{patientParams.height || 'N/A'} cm</Text>
                          </HStack>
                          <HStack width="100%" justify="space-between">
                            <Text fontSize="sm">Weight:</Text>
                            <Text fontWeight="600">
                              {patientParams.body_weight || 'N/A'} kg
                            </Text>
                          </HStack>
                          <HStack width="100%" justify="space-between">
                            <Text fontSize="sm">Blood Type:</Text>
                            <Text fontWeight="600">{patientParams.blood_type || 'N/A'}</Text>
                          </HStack>
                          <HStack width="100%" justify="space-between">
                            <Text fontSize="sm">Vascular Access:</Text>
                            <Text fontWeight="600">
                              {patientParams.vascular_access_type || 'N/A'}
                            </Text>
                          </HStack>
                          <HStack width="100%" justify="space-between">
                            <Text fontSize="sm">Dry Weight:</Text>
                            <Text fontWeight="600">
                              {patientParams.dry_weight || 'N/A'} kg
                            </Text>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}

                  {/* Pre-Dialysis Checklist */}
                  <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                    <CardHeader>
                      <Heading as="h4" size="sm">
                        Pre-Dialysis Checklist
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="start">
                        <FormControl display="flex" alignItems="center">
                          <HStack spacing={3}>
                            <Checkbox
                              checked={beforeChecklist.physical_exam_done}
                              onChange={(e) =>
                                setBeforeChecklist({
                                  ...beforeChecklist,
                                  physical_exam_done: e.target.checked,
                                })
                              }
                              disabled={stage !== 'before' || isLoading}
                            />
                            <FormLabel mb={0}>Physical examination completed</FormLabel>
                          </HStack>
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                          <HStack spacing={3}>
                            <Checkbox
                              checked={beforeChecklist.vital_signs_recorded}
                              onChange={(e) =>
                                setBeforeChecklist({
                                  ...beforeChecklist,
                                  vital_signs_recorded: e.target.checked,
                                })
                              }
                              disabled={stage !== 'before' || isLoading}
                            />
                            <FormLabel mb={0}>Vital signs recorded</FormLabel>
                          </HStack>
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                          <HStack spacing={3}>
                            <Checkbox
                              checked={beforeChecklist.blood_access_checked}
                              onChange={(e) =>
                                setBeforeChecklist({
                                  ...beforeChecklist,
                                  blood_access_checked: e.target.checked,
                                })
                              }
                              disabled={stage !== 'before' || isLoading}
                            />
                            <FormLabel mb={0}>Blood access checked & patent</FormLabel>
                          </HStack>
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                          <HStack spacing={3}>
                            <Checkbox
                              checked={beforeChecklist.medication_given}
                              onChange={(e) =>
                                setBeforeChecklist({
                                  ...beforeChecklist,
                                  medication_given: e.target.checked,
                                })
                              }
                              disabled={stage !== 'before' || isLoading}
                            />
                            <FormLabel mb={0}>Pre-dialysis medications given</FormLabel>
                          </HStack>
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                          <HStack spacing={3}>
                            <Checkbox
                              checked={beforeChecklist.consent_obtained}
                              onChange={(e) =>
                                setBeforeChecklist({
                                  ...beforeChecklist,
                                  consent_obtained: e.target.checked,
                                })
                              }
                              disabled={stage !== 'before' || isLoading}
                            />
                            <FormLabel mb={0}>Informed consent obtained</FormLabel>
                          </HStack>
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Pre-Dialysis Notes */}
                  <FormControl>
                    <FormLabel>Pre-Dialysis Notes</FormLabel>
                    <Textarea
                      placeholder="Enter any observations or notes before starting dialysis..."
                      value={beforeNotes}
                      onChange={(e) => setBeforeNotes(e.target.value)}
                      disabled={stage !== 'before' || isLoading}
                      rows={3}
                      className="dialysis-modal__textarea"
                    />
                  </FormControl>

                    {/* Measured weight and estimated duration */}
                    <HStack width="100%" spacing={3} align="end">
                      <FormControl flex={1}>
                        <FormLabel>Measured Weight (kg)</FormLabel>
                        <Input
                          placeholder="e.g., 70"
                          value={measuredWeight}
                          onChange={(e) => setMeasuredWeight(e.target.value)}
                          disabled={stage !== 'before' || isLoading}
                          type="number"
                          step="0.1"
                        />
                      </FormControl>

                      <FormControl flex={1}>
                        <FormLabel>Estimated Duration (minutes)</FormLabel>
                        <Input
                          placeholder="e.g., 240"
                          value={estimatedDuration}
                          onChange={(e) => setEstimatedDuration(e.target.value)}
                          disabled={stage !== 'before' || isLoading}
                          type="number"
                        />
                      </FormControl>

                      <Button
                        variant="outline"
                        onClick={() => {
                          // Try to compute duration from measured weight and dry weight
                          const mw = Number(measuredWeight) || Number(patientParams?.body_weight) || 0;
                          const dw = Number(patientParams?.dry_weight) || 0;
                          const target = Math.max(0, mw - dw);
                          // simple heuristic: 1 kg fluid -> 60 minutes (placeholder)
                          const computed = Math.max(30, Math.round(target * 60));
                          setEstimatedDuration(String(computed));
                        }}
                        isDisabled={stage !== 'before' || isLoading}
                      >
                        Calculate
                      </Button>
                    </HStack>
                    {/* Heparin dosage suggestion */}
                    <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                      <CardHeader>
                        <Heading as="h4" size="sm">Heparin Dosage</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3} align="start">
                          <HStack width="100%" spacing={3}>
                            <FormControl flex={1}>
                              <FormLabel>Doctor override</FormLabel>
                              <Select
                                value={heparinOverride}
                                onChange={(e) => setHeparinOverride(e.target.value)}
                                disabled={stage !== 'before' || isLoading}
                              >
                                <option value="auto">Auto (ailment-based)</option>
                                <option value="low">Low dose</option>
                                <option value="standard">Standard dose</option>
                                <option value="high">High dose</option>
                              </Select>
                            </FormControl>

                            <FormControl flex={1}>
                              <FormLabel>Ailment / condition</FormLabel>
                              <Select
                                value={selectedAilment}
                                onChange={(e) => setSelectedAilment(e.target.value)}
                                disabled={stage !== 'before' || isLoading}
                              >
                                <option value="">None</option>
                                <option value="anticoagulation">On anticoagulation</option>
                                <option value="bleeding_risk">High bleeding risk</option>
                                <option value="hypercoagulable">Hypercoagulable</option>
                                <option value="heparin_resistance">Heparin resistance</option>
                              </Select>
                            </FormControl>
                          </HStack>

                          <Box>
                            <Text fontSize="sm" fontWeight="600">
                              Suggested dose:
                              {' '}
                              {heparinInfo?.doseIU ? `${heparinInfo.doseIU} IU` : '—'}
                              {heparinInfo?.perKg ? ` (${heparinInfo.perKg} IU/kg)` : ''}
                            </Text>
                            <Text fontSize="xs" color="textMuted">
                              {heparinInfo?.note || 'Heparin dose will be computed using dry weight.'}
                            </Text>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  <HStack justify="flex-end" width="100%">
                    <Button
                      variant="solid"
                      colorScheme="success"
                      onClick={handleStartDialysis}
                      isLoading={isLoading}
                      isDisabled={stage !== 'before' || isLoading}
                    >
                      Start Dialysis
                    </Button>
                  </HStack>
                </VStack>
              </AccordionItem>

              {/* =================================================================
                  DURING DIALYSIS
                  ================================================================= */}
              <AccordionItem
                title="During Dialysis - Monitoring & Readings"
                badge="STEP 2"
                badgeColor="warning"
                className="dialysis-modal__accordion-item"
              >
                <VStack spacing={4}>
                  {/* Dialysis Machine Readings */}
                  <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                    <CardHeader>
                      <Heading as="h4" size="sm">
                        Machine Parameters
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3}>
                        <HStack width="100%" spacing={3} justify="space-between">
                          <FormControl flex={1}>
                            <FormLabel fontSize="sm">Blood Flow Rate (mL/min)</FormLabel>
                            <Input
                              placeholder="e.g., 300"
                              value={duringReadings.blood_flow_rate}
                              onChange={(e) =>
                                setDuringReadings({
                                  ...duringReadings,
                                  blood_flow_rate: e.target.value,
                                })
                              }
                              disabled={stage !== 'during' || isLoading}
                              type="number"
                            />
                          </FormControl>
                          <FormControl flex={1}>
                            <FormLabel fontSize="sm">Dialysate Flow (mL/min)</FormLabel>
                            <Input
                              placeholder="e.g., 500"
                              value={duringReadings.dialysate_flow_rate}
                              onChange={(e) =>
                                setDuringReadings({
                                  ...duringReadings,
                                  dialysate_flow_rate: e.target.value,
                                })
                              }
                              disabled={stage !== 'during' || isLoading}
                              type="number"
                            />
                          </FormControl>
                        </HStack>

                        <HStack width="100%" spacing={3} justify="space-between">
                          <FormControl flex={1}>
                            <FormLabel fontSize="sm">Arterial Pressure (mmHg)</FormLabel>
                            <Input
                              placeholder="e.g., -120"
                              value={duringReadings.arterial_pressure}
                              onChange={(e) =>
                                setDuringReadings({
                                  ...duringReadings,
                                  arterial_pressure: e.target.value,
                                })
                              }
                              disabled={stage !== 'during' || isLoading}
                              type="number"
                            />
                          </FormControl>
                          <FormControl flex={1}>
                            <FormLabel fontSize="sm">Venous Pressure (mmHg)</FormLabel>
                            <Input
                              placeholder="e.g., 250"
                              value={duringReadings.venous_pressure}
                              onChange={(e) =>
                                setDuringReadings({
                                  ...duringReadings,
                                  venous_pressure: e.target.value,
                                })
                              }
                              disabled={stage !== 'during' || isLoading}
                              type="number"
                            />
                          </FormControl>
                        </HStack>

                        <HStack width="100%" spacing={3} justify="space-between">
                          <FormControl flex={1}>
                            <FormLabel fontSize="sm">TMP (mmHg)</FormLabel>
                            <Input
                              placeholder="e.g., 180"
                              value={duringReadings.transmembrane_pressure}
                              onChange={(e) =>
                                setDuringReadings({
                                  ...duringReadings,
                                  transmembrane_pressure: e.target.value,
                                })
                              }
                              disabled={stage !== 'during' || isLoading}
                              type="number"
                            />
                          </FormControl>
                          <FormControl flex={1}>
                            <FormLabel fontSize="sm">UF Rate (mL/hr)</FormLabel>
                            <Input
                              placeholder="e.g., 500"
                              value={duringReadings.ultrafiltration_rate}
                              onChange={(e) =>
                                setDuringReadings({
                                  ...duringReadings,
                                  ultrafiltration_rate: e.target.value,
                                })
                              }
                              disabled={stage !== 'during' || isLoading}
                              type="number"
                            />
                          </FormControl>
                        </HStack>

                        <HStack width="100%" spacing={3} justify="space-between">
                          <FormControl flex={1}>
                            <FormLabel fontSize="sm">Temperature (°C)</FormLabel>
                            <Input
                              placeholder="e.g., 37.2"
                              value={duringReadings.temperature}
                              onChange={(e) =>
                                setDuringReadings({
                                  ...duringReadings,
                                  temperature: e.target.value,
                                })
                              }
                              disabled={stage !== 'during' || isLoading}
                              type="number"
                              step="0.1"
                            />
                          </FormControl>
                          <FormControl flex={1}>
                            <FormLabel fontSize="sm">Conductivity (mS/cm)</FormLabel>
                            <Input
                              placeholder="e.g., 14.0"
                              value={duringReadings.conductivity}
                              onChange={(e) =>
                                setDuringReadings({
                                  ...duringReadings,
                                  conductivity: e.target.value,
                                })
                              }
                              disabled={stage !== 'during' || isLoading}
                              type="number"
                              step="0.1"
                            />
                          </FormControl>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* During-Dialysis Notes */}
                  <FormControl>
                    <FormLabel>During-Dialysis Notes</FormLabel>
                    <Textarea
                      placeholder="Record any incidents, complications, or observations during the session..."
                      value={duringNotes}
                      onChange={(e) => setDuringNotes(e.target.value)}
                      disabled={stage !== 'during' || isLoading}
                      rows={3}
                      className="dialysis-modal__textarea"
                    />
                  </FormControl>
                  <HStack justify="flex-end" width="100%">
                    <Button
                      variant="solid"
                      colorScheme="warning"
                      onClick={handleStopDialysis}
                      isLoading={isLoading}
                      isDisabled={stage !== 'during' || isLoading}
                    >
                      Stop Dialysis
                    </Button>
                  </HStack>
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
                <VStack spacing={4}>
                  {/* Blood Samples */}
                  <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                    <CardHeader>
                      <Heading as="h4" size="sm">
                        Blood Samples
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="start">
                        <FormControl display="flex" alignItems="center">
                          <HStack spacing={3}>
                            <Checkbox
                              checked={bloodSamples.samples_taken}
                              onChange={(e) =>
                                setBloodSamples({
                                  ...bloodSamples,
                                  samples_taken: e.target.checked,
                                })
                              }
                              disabled={stage !== 'after' || isLoading}
                            />
                            <FormLabel mb={0}>Blood samples collected</FormLabel>
                          </HStack>
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                          <HStack spacing={3}>
                            <Checkbox
                              checked={bloodSamples.samples_sent_to_lab}
                              onChange={(e) =>
                                setBloodSamples({
                                  ...bloodSamples,
                                  samples_sent_to_lab: e.target.checked,
                                })
                              }
                              disabled={stage !== 'after' || isLoading}
                            />
                            <FormLabel mb={0}>Samples sent to laboratory</FormLabel>
                          </HStack>
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Post-Dialysis Notes */}
                  <FormControl>
                    <FormLabel>Post-Dialysis Notes</FormLabel>
                    <Textarea
                      placeholder="Enter post-dialysis assessment, patient condition, recommendations, follow-up actions..."
                      value={afterNotes}
                      onChange={(e) => setAfterNotes(e.target.value)}
                      disabled={stage !== 'after' || isLoading}
                      rows={4}
                      className="dialysis-modal__textarea"
                    />
                  </FormControl>
                  <HStack justify="flex-end" width="100%">
                    <Button
                      variant="solid"
                      colorScheme="success"
                      onClick={handleCloseDialysis}
                      isLoading={isLoading}
                      isDisabled={stage !== 'after' || isLoading}
                    >
                      Close Session
                    </Button>
                  </HStack>
                </VStack>
              </AccordionItem>
              </Accordion>
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
