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

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  updateSessionParameters,
} from '../../../ApiCalls/dialysisSessionApis';
import { useAdminToast } from '../../../components/AdminToast';
import {
  getPatientById,
  getGeneralParameterResponse,
} from '../../../ApiCalls/patientAPis';
import {
  getDialysisParameterQuestions,
  saveDialysisParameterReading
} from '../../../ApiCalls/questionApis';
import { getSystolicIdByTitle, getDialysisSystolicIdByTitle } from '../../../ApiCalls/readingsApis';
import { FaSave, FaChartLine, FaTable } from 'react-icons/fa';
import PatientProfileCard from '../../../components/PatientProfileCard';
import PaymentModal from '../../../components/PaymentModal';
import ParameterSection from '../../../components/ParameterSection';
import DialysisTable from '../../../components/table/DialysisTable';
import LineChartDialysis from '../../../components/Linechart/Linechart_Dialysis/LineChartDialysis';
import LineChartDialyisisSys from '../../../components/Linechart/Linechart_Dialysis/LineChartDialyisisSys';
import GraphModal from './graphModal';
import {
  getOrganizationById,
  getAppointmentById,
  updateAppointment,
  addAppointmentPayment
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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const buildCombinedTitle = (baseTitle, keyword, insertText) => {
  if (!baseTitle) return baseTitle;
  const lower = baseTitle.toLowerCase();
  const index = lower.indexOf(keyword);
  if (index === -1) return baseTitle;
  const endIndex = index + keyword.length;
  return baseTitle.slice(0, endIndex) + insertText + baseTitle.slice(endIndex);
};

const normalizeQuestionTitle = (title = "") => title.toLowerCase().replace(/[\s_-]/g, "");

const SystolicDiastolicGraph = ({
  question,
  userId,
  isDialysis,
  aspect,
}) => {
  const [systolicId, setSystolicId] = useState(question?.id ?? null);
  const [loading, setLoading] = useState(false);

  const title = question?.title || "";
  const titleLower = title.toLowerCase();
  const isSystolic = titleLower.includes("systolic");
  const isDiastolic = titleLower.includes("diastolic");

  useEffect(() => {
    let isMounted = true;

    const fetchSystolicId = async () => {
      if (!isDiastolic || isSystolic) {
        setSystolicId(question?.id ?? null);
        return;
      }

      setLoading(true);
      try {
        const response = isDialysis
          ? await getDialysisSystolicIdByTitle(title)
          : await getSystolicIdByTitle(title);

        if (isMounted) {
          setSystolicId(response?.data ?? null);
        }
      } catch (error) {
        console.error("Error fetching systolic ID:", error);
        if (isMounted) setSystolicId(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSystolicId();
    return () => {
      isMounted = false;
    };
  }, [isDialysis, isDiastolic, isSystolic, question?.id, title]);

  if (isDiastolic && loading) {
    return <Box className="text-sm text-muted">Loading...</Box>;
  }

  if (isDiastolic && !systolicId) {
    return <Box className="text-sm text-muted">No systolic ID found.</Box>;
  }

  const chartTitle = isSystolic
    ? buildCombinedTitle(title, "systolic", " and Diastolic")
    : buildCombinedTitle(title, "diastolic", " and Systolic");

  return (
    <LineChartDialyisisSys
      aspect={aspect}
      questionId={isSystolic ? question?.id : systolicId}
      user_id={userId}
      title={chartTitle}
      unit={question?.unit}
    />
  );
};

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
  const [isSaving, setIsSaving] = useState(false);
  const [savingMessage, setSavingMessage] = useState('');

  // Billing & Payment State
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [dischargeModal, setDischargeModal] = useState({ isOpen: false, confirmText: '' });
  const [abortModal, setAbortModal] = useState({ isOpen: false, isEmergency: false, reason: '' });
  const { showToast } = useAdminToast();

  // Timer State
  const [manualDuration, setManualDuration] = useState(''); // Default 4 hours
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Guidelines & Checklist state
  const [orgGuidelines, setOrgGuidelines] = useState([]);
  const [orgChecklists, setOrgChecklists] = useState([]);
  const [orgConfig, setOrgConfig] = useState({ hasGuidelines: false, hasChecklists: false });
  const [dynamicChecklist, setDynamicChecklist] = useState({});

  const [beforeNotes, setBeforeNotes] = useState('');

  // Heparin dosage state
  const [heparinOverride, setHeparinOverride] = useState('auto'); // 'auto' | 'low' | 'standard' | 'high'
  const [selectedAilment, setSelectedAilment] = useState('');

  const heparinInfo = useMemo(() => {
    // Prefer dry_weight; fall back to body_weight
    const dry = Number(completePatientData?.dry_weight) || Number(completePatientData?.body_weight);
    return calculateHeparinDose(dry, heparinOverride || 'auto', selectedAilment || null);
  }, [completePatientData?.dry_weight, completePatientData?.body_weight, heparinOverride, selectedAilment]);

  const [duringNotes, setDuringNotes] = useState('');

  // After Dialysis state
  const [afterNotes, setAfterNotes] = useState('');

  // Hemo Dialysis Parameters from API
  const [hemoParams, setHemoParams] = useState([]);
  const [hemoParamsResponses, setHemoParamsResponses] = useState({});
  const [showEntryFor, setShowEntryFor] = useState({}); // { [questionId]: boolean }
  const [graphModal, setGraphModal] = useState({ isOpen: false, questionId: null, questionTitle: '', questionUnit: '', dailyordia: 'dialysis' });

  const hasDialysisSystolic = useMemo(() => {
    return hemoParams.some((q) => q.title?.toLowerCase().includes("systolic"));
  }, [hemoParams]);

  // Inventory & Supplies state
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryStock, setInventoryStock] = useState([]);
  const [consumedItems, setConsumedItems] = useState([]);
  const [dialyzers, setDialyzers] = useState([]);
  const [selectedDialyzerId, setSelectedDialyzerId] = useState('');
  const [markBedForCleaning, setMarkBedForCleaning] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [appointmentServices, setAppointmentServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

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
          if (orgResult.success && orgResult.data.data) {
            const orgData = orgResult.data.data;
            const guidelines = orgData.hasGuidelines ? (orgData.guidelines || []) : [];
            const checklists = orgData.hasChecklists ? (orgData.checklists || []) : [];
            
            setOrgConfig({ hasGuidelines: !!orgData.hasGuidelines, hasChecklists: !!orgData.hasChecklists });
            setOrgGuidelines(guidelines);
            setOrgChecklists(checklists);
            
            // Initialize dynamic checklist for items that need checking across all stages
            const initialChecklist = {};

            // 1. Before Stage: Pre-dialysis Guidelines & Preparation Checklists
            guidelines.filter(g => g.type === 'Pre-dialysis').forEach((_, i) => {
              initialChecklist[`pre_guideline_${i}`] = false;
            });
            checklists.filter(c => c.type === 'Preparation').forEach((_, i) => {
              initialChecklist[`prep_checklist_${i}`] = false;
            });

            // 2. During Stage: During-dialysis Guidelines & Monitoring Checklists
            guidelines.filter(g => g.type === 'During-dialysis').forEach((_, i) => {
              initialChecklist[`during_guideline_${i}`] = false;
            });
            checklists.filter(c => c.type === 'Monitoring').forEach((_, i) => {
              initialChecklist[`mon_checklist_${i}`] = false;
            });

            // 3. After Stage: Post-dialysis Guidelines & Cleaning Checklists
            guidelines.filter(g => g.type === 'Post-dialysis').forEach((_, i) => {
              initialChecklist[`post_guideline_${i}`] = false;
            });
            checklists.filter(c => c.type === 'Cleaning').forEach((_, i) => {
              initialChecklist[`clean_checklist_${i}`] = false;
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
      }

      // 4. Fetch Hemo Dialysis specific parameters & their last responses
      const [readingsResult, responsesRes] = await Promise.all([
        getDialysisReadings(),
        getGeneralParameterResponse("Hemo Dialysis", patient.patient_id)
      ]);

      if (readingsResult.success && Array.isArray(readingsResult.data)) {
        const params = readingsResult.data.filter(q =>
          q.ailments && q.ailments.some(a => a.name && a.name.toLowerCase() === 'hemo dialysis')
        );
        setHemoParams(params);
      }

      if (responsesRes.success && Array.isArray(responsesRes.data)) {
        const prefilled = {};
        responsesRes.data.forEach(q => {
          if (q.response) {
            prefilled[q.id] = q.response;
          }
        });
        setHemoParamsResponses(prev => ({ ...prefilled, ...prev }));
      }

      // 5. Fetch appointment for duration and services
      if (patient?.appointment_id) {
        setServicesLoading(true);
        const aptRes = await getAppointmentById(patient.appointment_id);
        if (aptRes.success) {
          const apt = aptRes.data?.data || aptRes.data;
          const details = aptRes.data?.appointment || apt;
          setCurrentAppointment(details);
          setAppointmentServices(details.services || []);
          if (details.metadata?.dialysisDuration) {
            setManualDuration(details.metadata.dialysisDuration);
          }
        }
        setServicesLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch patient data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [patient?.patient_id, bed?.organization_id, initialData, selectedAilment]);

  const handleStartDialysis = useCallback(async () => {
    try {
      setIsSaving(true);
      setSavingMessage('Validating preparation checklists...');

      // Only check dynamic items relevant to the "Before" stage
      const preGuidelineKeys = orgGuidelines.filter(g => g.type === 'Pre-dialysis').map((_, i) => `pre_guideline_${i}`);
      const prepChecklistKeys = orgChecklists.filter(c => c.type === 'Preparation').map((_, i) => `prep_checklist_${i}`);
      const allPreDynamicDone = [...preGuidelineKeys, ...prepChecklistKeys].every(key => dynamicChecklist[key]);

      if (!allPreDynamicDone) {
        alert('Please complete all preparation checklists and organization guidelines before starting');
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
        session_duration_minutes: Number(manualDuration) * 60 || 240,
        heparin_dose_units: heparinInfo?.doseIU || undefined,
        heparin_strategy: heparinInfo?.strategy || undefined,
        ailments: completePatientData?.ailments || [],
        notes: beforeNotes,
        pre_readings: hemoParamsResponses,
      };

      setSavingMessage('Initializing session record...');
      const startSessionRes = await startDialysisSession({
        patient_id: Number(patient.patient_id),
        bed_id: Number(bed?.id),
        appointment_id: patient?.appointment_id ? Number(patient.appointment_id) : undefined,
        planned_parameters: plannedParameters,
        dt_dialysis_session: dynamicChecklist,
        patient_name: completePatientData?.name || patient?.patient_name,
      });

      if (!startSessionRes.success) {
        throw new Error(startSessionRes.data?.message || 'Failed to start dialysis session');
      }

      const startedSessionId =
        startSessionRes.data?.data?.session_id ||
        startSessionRes.data?.session_id;
      setSessionId(startedSessionId || null);

      // Increase delay for backend synchronization
      setSavingMessage('Synchronizing clinical data...');
      await sleep(1000);

      setSavingMessage('Uploading pre-dialysis readings...');
      await submitSessionPreReadings(startedSessionId, {
        notes: beforeNotes,
        custom_parameters: hemoParamsResponses,
        labs: {
          is_infectious: completePatientData?.is_infectious || false,
        }
      });

      setSavingMessage('Finalizing clinical assessment...');
      await sleep(500);

      const result = await submitDialysisHealthParams({
        patient_id: patient.patient_id,
        bed_id: bed?.id,
        stage: 'before',
        notes: beforeNotes,
        heparin: heparinPayload,
        custom_readings: hemoParamsResponses,
        timestamp: new Date().toISOString(),
      });

      if (result.success || startedSessionId) {
        setSavingMessage('Session started successfully!');
        // compute dialysis start and duration
        const startIso = new Date().toISOString();
        let durationMin = parseInt(manualDuration, 10) * 60 || 0;

        if (!durationMin && currentAppointment?.start_time && currentAppointment?.end_time) {
          const s = currentAppointment.start_time.split(':');
          const e = currentAppointment.end_time.split(':');
          durationMin = (parseInt(e[0], 10) * 60 + parseInt(e[1], 10)) - (parseInt(s[0], 10) * 60 + parseInt(s[1], 10));
          if (durationMin < 0) durationMin += 24 * 60;
        }

        // Initialize Timer
        if (durationMin > 0) {
          setTimeLeft(durationMin * 60);
          setTimerActive(true);
        }

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
      alert(err.message || 'Failed to start dialysis session');
    } finally {
      setIsSaving(false);
      setSavingMessage('');
    }
  }, [beforeNotes, patient?.patient_id, patient?.appointment_id, bed?.id, currentAppointment, heparinInfo, selectedAilment, onStageChange, orgGuidelines, orgChecklists, dynamicChecklist, completePatientData, hemoParamsResponses]);

  const handleSaveReading = useCallback(async (questionId, value) => {
    if (!value) return;
    try {
      setIsSaving(true);
      const res = await saveDialysisParameterReading({
        user_id: patient.patient_id,
        date: new Date().toISOString().split('T')[0],
        question_id: questionId,
        readings: value,
      });
      if (res.success) {
        // Optional: refresh to show updated responseCount if UI depends on it
        fetchPatientData();
      } else {
        alert('Failed to save reading: ' + (res.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error saving reading:', err);
    } finally {
      setIsSaving(false);
    }
  }, [patient?.patient_id, fetchPatientData]);

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
        // Take unit price from the item stock ID
        const stockItem = inventoryStock.find(s => s.item_id === Number(itemId));
        const unitPrice = Number(stockItem?.unit_price || stockItem?.price || item?.unit_price || item?.price || 0);

        setConsumedItems(prev => [...prev, { 
          id: Date.now(), 
          name: item?.name || `Item ${itemId}`, 
          quantity: qty,
          price: unitPrice
        }]);
      } else {
        alert(`Failed to issue item: ${result.data?.message || 'Stock not available'}`);
      }
    } catch (err) {
      console.error('Error issuing stock:', err);
    }
  }, [patient, inventoryItems, inventoryStock]);

  const handleUseDialyzer = useCallback(async () => {
    if (!selectedDialyzerId) return;
    try {
      const result = await recordDialyzerUsage(selectedDialyzerId, {
        notes: `Used in session for patient ${patient?.patient_name || 'unknown'}`
      });
      if (result.success) {
        const d = dialyzers.find(dia => dia.id === Number(selectedDialyzerId));
        const unitPrice = Number(d?.unit_price || d?.price || 0);
        setConsumedItems(prev => [...prev, { 
          id: Date.now(), 
          name: `Dialyzer Usage: ${d?.id || selectedDialyzerId}`, 
          quantity: 1,
          price: unitPrice
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

  const handleConsumeService = useCallback(async (serviceId) => {
    if (!patient?.appointment_id) return;
    try {
      setServicesLoading(true);
      const { consumeAppointmentServices } = await import('../../../ApiCalls/clinicApis');
      const result = await consumeAppointmentServices(patient.appointment_id, { serviceId });
      
      if (result.success) {
        setAppointmentServices(prev => prev.map(s => 
          (s.id === serviceId || s.service_id === serviceId) ? { ...s, status: 'USED' } : s
        ));
      } else {
        alert('Failed to update service status: ' + (result.data?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error consuming service:', err);
    } finally {
      setServicesLoading(false);
    }
  }, [patient?.appointment_id]);

  const handleStopDialysis = useCallback(async () => {
    try {
      if (sessionId) {
        await submitSessionReadings(sessionId, {
          timestamp: new Date().toISOString(),
          reading: {
            notes: duringNotes || undefined,
          },
        });

        await submitSessionAction(sessionId, {
          action: 'stop',
          reason: duringNotes || 'Dialysis session stopped from UI',
        });

        await updateSessionParameters(sessionId, {
          duringDialysisNotes: duringNotes
        });
      }

      const result = await submitDialysisHealthParams({
        patient_id: patient.patient_id,
        bed_id: bed?.id,
        stage: 'during',
        notes: duringNotes,
        timestamp: new Date().toISOString(),
      });

      if (result.success) {
        setStage('after');
        setTimerActive(false);
        if (onStageChange) {
          onStageChange('after', { notes: duringNotes });
        }
      }
    } catch (err) {
      console.error('Failed to stop dialysis:', err);
    }
  }, [sessionId, duringNotes, patient?.patient_id, bed?.id, onStageChange]);

  const handleCloseDialysis = useCallback(async () => {
    try {
      const result = await submitDialysisHealthParams({
        patient_id: patient.patient_id,
        bed_id: bed?.id,
        stage: 'after',
        notes: afterNotes,
        timestamp: new Date().toISOString(),
      });

      if (sessionId) {
        await updateSessionParameters(sessionId, {
          postDialysisNotes: afterNotes,
          inventoryItemsUsed: consumedItems
        });
      }

      if (result.success) {
        // After successfully saving post-dialysis params, prompt discharge confirmation (billing may follow)
        if (patient?.appointment_id) {
          const extraCost = consumedItems.reduce((acc, c) => acc + ((c.quantity || 1) * (Number(c.price) || 0)), 0);
          let finalAppt = patient;

          const freshRes = await getAppointmentById(patient.appointment_id);
          if (freshRes.success && freshRes.data) {
            finalAppt = freshRes.data.data || freshRes.data;
            if (extraCost > 0) {
              const currentTotal = Number(finalAppt.totalAmount || finalAppt.amountDue || finalAppt.total_amt || 0);
              const newTotal = currentTotal + extraCost;
              await updateAppointment(patient.appointment_id, {
                totalAmount: newTotal
              });
              finalAppt.totalAmount = newTotal;
            }
          }
          setCurrentAppointment(finalAppt);
          const totalAmt = Number(finalAppt.totalAmount || finalAppt.total_amt || finalAppt.amountDue || 0);
          const paidAmt = Number(finalAppt.amountPaid || finalAppt.received_amt || finalAppt.paidAmount || 0);
          const outstanding = Math.max(0, totalAmt - paidAmt);
          setPaymentAmount(outstanding > 0 ? String(outstanding) : '');
          setBillModalOpen(true);
          // billing will lead to discharge confirmation in payment handlers
        } else {
          // No appointment / billing step — ask for discharge confirmation
          setDischargeModal({ isOpen: true, confirmText: '' });
        }
      }
    } catch (err) {
      console.error('Failed to close dialysis:', err);
    }
  }, [afterNotes, patient, bed?.id, onStageChange, onClose, consumedItems]);

  const handlePaymentSuccess = () => {
    setBillModalOpen(false);
    // After successful payment, ask for discharge confirmation
    setDischargeModal({ isOpen: true, confirmText: '' });
  };

  const handlePaymentClose = () => {
    setBillModalOpen(false);
    // After closing payment modal (even if skipped), ask for discharge confirmation
    setDischargeModal({ isOpen: true, confirmText: '' });
  };

  const handleConfirmDischarge = useCallback(async () => {
    try {
      // Optionally we could call an API to mark patient as discharged here.
      if (onStageChange) {
        onStageChange('completed', { notes: afterNotes, discharge_confirmed: true });
      }
      setDischargeModal({ isOpen: false, confirmText: '' });
      onClose();
    } catch (err) {
      console.error('Error confirming discharge:', err);
    }
  }, [afterNotes, onStageChange, onClose]);

  const handleOpenAbort = (isEmergency = false) => {
    setAbortModal({ isOpen: true, isEmergency, reason: '' });
  };

  const handleConfirmAbort = useCallback(async () => {
    try {
      if (!abortModal.reason || !abortModal.reason.trim()) {
        alert('Please provide a reason for aborting the session.');
        return;
      }

      if (sessionId) {
        await submitSessionReadings(sessionId, {
          timestamp: new Date().toISOString(),
          reading: { notes: duringNotes || '' },
        });

        await submitSessionAction(sessionId, {
          action: 'abort',
          reason: abortModal.reason,
          emergency: !!abortModal.isEmergency,
        });

        await updateSessionParameters(sessionId, {
          aborted: true,
          abortReason: abortModal.reason,
          emergencyAbort: !!abortModal.isEmergency,
        });
      }

      setAbortModal({ isOpen: false, isEmergency: false, reason: '' });
      setTimerActive(false);
      setStage('after');
      if (onStageChange) onStageChange('aborted', { reason: abortModal.reason, emergency: abortModal.isEmergency });
      showToast && showToast('Session aborted', 'error');
      // close modal if desired
      onClose();
    } catch (err) {
      console.error('Error aborting session:', err);
      alert('Failed to abort session: ' + (err?.message || 'Unknown error'));
    }
  }, [abortModal, sessionId, duringNotes, onStageChange, onClose, showToast]);

  // Timer Effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  const formatTimeLeft = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="88vh" className="dialysis-modal__content" style={{ width: '95vw', maxWidth: '100vw' }}>
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
                  {completePatientData?.name || patient?.patient_id || '—'}
                </span>
              </div>
              <div className="dialysis-modal__summary-pill">
                <span className="dialysis-modal__summary-label">Duration</span>
                <span className="dialysis-modal__summary-value">
                  {stage === 'during' ? (
                    <span style={{ color: timeLeft < 300 ? '#ef4444' : '#f59e0b', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {formatTimeLeft(timeLeft)}
                    </span>
                  ) : (
                    currentAppointment?.start_time && currentAppointment?.end_time
                      ? (() => {
                        const s = currentAppointment.start_time.split(':');
                        const e = currentAppointment.end_time.split(':');
                        let diff = (parseInt(e[0], 10) * 60 + parseInt(e[1], 10)) - (parseInt(s[0], 10) * 60 + parseInt(s[1], 10));
                        if (diff < 0) diff += 24 * 60;
                        const h = Math.floor(diff / 60);
                        const m = diff % 60;
                        return h > 0 ? `${h}h ${m}m` : `${m}m`;
                      })()
                      : '—'
                  )}
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
                    {/* SESSION STAGES ACCORDION */}
                    <Accordion defaultIndex={stage === 'before' ? [0] : stage === 'during' ? [1] : [2]} allowMultiple>
                      {/* BEFORE DIALYSIS */}
                      <AccordionItem
                        title="Before Dialysis Assessment"
                        badge="STEP 1"
                        badgeColor="info"
                        className="dialysis-modal__accordion-item"
                      >
                        <VStack spacing={6} align="stretch">
                        <HStack align="start" spacing={6}>
                          {/* 1. Checklist (Actual API Data) */}
                            {orgConfig.hasChecklists && (
                              <VStack flex={1} align="stretch" spacing={3}>
                                <Heading as="h5" size="xs" textTransform="uppercase" letterSpacing="wider" color="slate.500">Checklist</Heading>
                                <Box className="dialysis-modal__checklist-container" p={4} bg="slate.50" borderRadius="xl" border="1px solid" borderColor="slate.100">
                                  <VStack align="start" spacing={3}>
                                    {/* Actual Org API Checklist Items (Preparation) */}
                                    {orgChecklists.filter(c => c.type === 'Preparation').map((gl, i) => (
                                      <Checkbox
                                        key={`org_checklist_${i}`}
                                        checked={dynamicChecklist[`prep_checklist_${i}`]}
                                        onChange={(e) => setDynamicChecklist(prev => ({ ...prev, [`prep_checklist_${i}`]: e.target.checked }))}
                                        disabled={stage !== 'before'}
                                        size="sm"
                                        colorScheme="info"
                                      >
                                        <Text fontSize="xs" fontWeight="500">{gl.text}</Text>
                                      </Checkbox>
                                    ))}
                                    {orgChecklists.filter(c => c.type === 'Preparation').length === 0 && (
                                      <Text fontSize="xs" color="slate.400 italic">No preparation checklist items.</Text>
                                    )}
                                  </VStack>
                                </Box>

                                {stage === 'before' && (
                                  <Box mt={4}>
                                    <Heading as="h5" size="xs" textTransform="uppercase" letterSpacing="wider" color="slate.500" mb={2}>Planned Duration</Heading>
                                    <HStack>
                                      <Input
                                        type="number"
                                        size="sm"
                                        value={manualDuration}
                                        onChange={(e) => setManualDuration(e.target.value)}
                                        placeholder="Duration in hours"
                                        maxW="120px"
                                      />
                                      <Text fontSize="xs" color="slate.500">Hours</Text>
                                    </HStack>
                                    <Text fontSize="xs" color="slate.400" mt={1}>Defaults to appointment duration if empty</Text>
                                  </Box>
                                )}
                              </VStack>
                            )}

                            {/* 2. Readings & Parameters (with charts) */}
                          <VStack flex={2} align="stretch" spacing={3}>
                            <Heading as="h5" size="xs" textTransform="uppercase" letterSpacing="wider" color="slate.500">Readings & Parameters</Heading>
                              {hemoParams.length > 0 ? (
                                <Box className="space-y-6">
                                  {hemoParams.map((question, index) => {
                                    const questionTitle = question.title || '';
                                    const normalizedTitle = normalizeQuestionTitle(questionTitle);
                                    const isWeightAfter = normalizedTitle === 'weightafter';

                                    return (
                                      <ParameterSection
                                        key={index}
                                        title={questionTitle}
                                        noResponse={question.responseCount === 0}
                                        onEnterReading={() => setShowEntryFor(prev => ({ ...prev, [question.id]: !prev[question.id] }))}
                                      >
                                        <VStack spacing={4} align="stretch" mt={4}>
                                          {/* Inline save-reading input - Toggled by Enter Reading button */}
                                          {showEntryFor[question.id] && (
                                            <Box p={3} bg="slate.50" borderRadius="xl" border="1px solid" borderColor="slate.200">
                                              <HStack spacing={3} justify="flex-end">
                                                <Input
                                                  type={question.type === 'Numeric' ? 'number' : question.type === 'Date' ? 'date' : 'text'}
                                                  placeholder={`Enter value for ${questionTitle}...`}
                                                  value={hemoParamsResponses[question.id] || ''}
                                                  onChange={(e) => setHemoParamsResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                                                  size="sm"
                                                  borderRadius="lg"
                                                  bg="white"
                                                  flex={1}
                                                />
                                                <Button
                                                  size="sm"
                                                  colorScheme="info"
                                                  leftIcon={<FaSave />}
                                                  onClick={async () => {
                                                    await handleSaveReading(question.id, hemoParamsResponses[question.id]);
                                                    setShowEntryFor(prev => ({ ...prev, [question.id]: false }));
                                                  }}
                                                  isDisabled={!hemoParamsResponses[question.id]}
                                                  isLoading={isSaving}
                                                  px={8}
                                                  borderRadius="lg"
                                                >
                                                  Save
                                                </Button>
                                              </HStack>
                                            </Box>
                                          )}

                                          {/* Table only for technicians */}
                                          <Box className="w-full overflow-hidden rounded-xl border border-slate-200">
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px' }}>
                                              <button
                                                title="Open readings graph"
                                                onClick={() => setGraphModal({ isOpen: true, questionId: question.id, questionTitle, questionUnit: question.unit || '', dailyordia: 'dialysis' })}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2563EB', padding: '6px', fontSize: '16px' }}
                                              >
                                                <FaChartLine />
                                              </button>
                                            </div>
                                            <DialysisTable
                                              questionId={question.id}
                                              user_id={patient.patient_id}
                                              title={questionTitle}
                                              question={question}
                                              highlightThreshold={isWeightAfter ? completePatientData?.dry_weight : null}
                                              highlightComparator="gt"
                                            />
                                          </Box>
                                        </VStack>
                                      </ParameterSection>
                                    );
                                  })}
                                </Box>
                              ) : (
                                <Text fontSize="xs" color="slate.400 italic">No specific parameters configured.</Text>
                              )}
                          </VStack>

                          {/* 3. Guidelines (Actual API Data) */}
                            {orgConfig.hasGuidelines && (
                              <VStack flex={1} align="stretch" spacing={3}>
                                <Heading as="h5" size="xs" textTransform="uppercase" letterSpacing="wider" color="slate.500">Guidelines</Heading>
                                <Box className="dialysis-modal__guidelines-container" p={4} bg="slate.50" borderRadius="xl" border="1px solid" borderColor="slate.100">
                                  <VStack align="start" spacing={3}>
                                    {/* Pre-dialysis Guidelines */}
                                    {orgGuidelines.filter(g => g.type === 'Pre-dialysis').map((gl, i) => (
                                      <Checkbox
                                        key={`org_guideline_${i}`}
                                        checked={dynamicChecklist[`pre_guideline_${i}`]}
                                        onChange={(e) => setDynamicChecklist(prev => ({ ...prev, [`pre_guideline_${i}`]: e.target.checked }))}
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
                            )}
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
                            <VStack align="end" spacing={2} flex={1}>
                              {isSaving && (
                                <Text fontSize="xs" color="info.600" fontWeight="bold" animate="pulse">
                                  {savingMessage}
                                </Text>
                              )}
                              <Button
                                colorScheme="success"
                                size="lg"
                                onClick={handleStartDialysis}
                                isLoading={isSaving}
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
                            </VStack>
                        </HStack>
                      </VStack>
                      </AccordionItem>
                    <AccordionItem
                      title="During Dialysis Monitoring"
                      badge="STEP 2"
                      badgeColor="warning"
                      className="dialysis-modal__accordion-item"
                    >
                      <VStack spacing={4} align="stretch">
                          {/* Machine Readings & During-dialysis Protocol */}
                          {(orgConfig.hasGuidelines || orgConfig.hasChecklists) && (
                            <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                              <CardHeader py={2}><Heading as="h4" size="xs" color="slate.500" textTransform="uppercase">Protocol & Monitoring</Heading></CardHeader>
                              <CardBody>
                                <VStack align="start" spacing={3}>
                                  {orgConfig.hasGuidelines && orgGuidelines.filter(g => g.type === 'During-dialysis').map((gl, i) => (
                                    <Checkbox
                                      key={`during_gl_${i}`}
                                      checked={dynamicChecklist[`during_guideline_${i}`]}
                                      onChange={(e) => setDynamicChecklist(prev => ({ ...prev, [`during_guideline_${i}`]: e.target.checked }))}
                                      disabled={stage !== 'during'}
                                      size="sm"
                                    >
                                      <Text fontSize="xs">{gl.text}</Text>
                                    </Checkbox>
                                  ))}
                                  {orgConfig.hasChecklists && orgChecklists.filter(c => c.type === 'Monitoring').map((cl, i) => (
                                    <Checkbox
                                      key={`mon_cl_${i}`}
                                      checked={dynamicChecklist[`mon_checklist_${i}`]}
                                      onChange={(e) => setDynamicChecklist(prev => ({ ...prev, [`mon_checklist_${i}`]: e.target.checked }))}
                                      disabled={stage !== 'during'}
                                      size="sm"
                                      colorScheme="warning"
                                    >
                                      <Text fontSize="xs">Monitor: {cl.text}</Text>
                                    </Checkbox>
                                  ))}
                                  {((orgConfig.hasGuidelines && orgGuidelines.filter(g => g.type === 'During-dialysis').length === 0) &&
                                    (orgConfig.hasChecklists && orgChecklists.filter(c => c.type === 'Monitoring').length === 0)) && (
                                      <Text fontSize="xs" color="slate.400 italic">No monitoring protocols configured for this session.</Text>
                                    )}
                                </VStack>
                              </CardBody>
                            </Card>
                          )}

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
                          {(orgConfig.hasGuidelines || orgConfig.hasChecklists) && (
                            <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                              <CardHeader><Heading as="h4" size="sm">Post-Session Checks</Heading></CardHeader>
                              <CardBody>
                                <VStack align="start" spacing={2}>

                                  {/* Post-dialysis Guidelines */}
                                  {orgConfig.hasGuidelines && orgGuidelines.filter(g => g.type === 'Post-dialysis').map((gl, i) => (
                                    <Checkbox
                                      key={`post_gl_${i}`}
                                      checked={dynamicChecklist[`post_guideline_${i}`]}
                                      onChange={(e) => setDynamicChecklist(prev => ({ ...prev, [`post_guideline_${i}`]: e.target.checked }))}
                                      size="sm"
                                      disabled={stage !== 'after'}
                                    >
                                      <Text fontSize="xs">{gl.text}</Text>
                                    </Checkbox>
                                  ))}

                                  {/* Cleaning Checklists */}
                                  {orgConfig.hasChecklists && orgChecklists.filter(c => c.type === 'Cleaning').map((cl, i) => (
                                    <Checkbox
                                      key={`clean_cl_${i}`}
                                      checked={dynamicChecklist[`clean_checklist_${i}`]}
                                      onChange={(e) => setDynamicChecklist(prev => ({ ...prev, [`clean_checklist_${i}`]: e.target.checked }))}
                                      size="sm"
                                      disabled={stage !== 'after'}
                                      colorScheme="warning"
                                    >
                                      <Text fontSize="xs">Cleaning: {cl.text}</Text>
                                    </Checkbox>
                                  ))}
                                  {((orgConfig.hasGuidelines && orgGuidelines.filter(g => g.type === 'Post-dialysis').length === 0) &&
                                    (orgConfig.hasChecklists && orgChecklists.filter(c => c.type === 'Cleaning').length === 0)) && (
                                      <Text fontSize="xs" color="slate.400 italic">No post-dialysis protocols configured.</Text>
                                    )}
                                </VStack>
                              </CardBody>
                            </Card>
                          )}
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
                        {/* APPOINTMENT SERVICES SECTION */}
                        <Box borderBottom="1px solid" borderColor="slate.100" pb={4} mb={2}>
                          <HStack justify="space-between" mb={3}>
                            <Text fontSize="xs" fontWeight="bold" color="slate.600">Appointment Services</Text>
                            {servicesLoading && <Text fontSize="10px" color="info.500">Updating...</Text>}
                          </HStack>
                          <VStack align="stretch" spacing={2}>
                            {appointmentServices.length > 0 ? (
                              appointmentServices.map((svc, idx) => {
                                const isUsed = String(svc.status).toUpperCase() === 'USED';
                                return (
                                  <HStack 
                                    key={svc.id || idx} 
                                    justify="space-between" 
                                    p={3} 
                                    bg={isUsed ? "slate.50" : "info.50"} 
                                    borderRadius="xl" 
                                    border="1px solid" 
                                    borderColor={isUsed ? "slate.200" : "info.100"}
                                    transition="all 0.2s"
                                  >
                                    <VStack align="start" spacing={0} flex={1}>
                                      <Text fontSize="xs" fontWeight="700" color={isUsed ? "slate.500" : "info.800"}>
                                        {svc.service_name || svc.name || 'Dialysis Session'}
                                      </Text>
                                      <Text fontSize="10px" color={isUsed ? "slate.400" : "info.600"}>
                                        Status: {svc.status || 'PENDING'}
                                      </Text>
                                    </VStack>
                                    <Button
                                      size="xs"
                                      colorScheme={isUsed ? "slate" : "info"}
                                      variant={isUsed ? "ghost" : "solid"}
                                      onClick={() => handleConsumeService(svc.id || svc.service_id)}
                                      isDisabled={isUsed || stage === 'before' || servicesLoading}
                                      px={4}
                                      borderRadius="full"
                                    >
                                      {isUsed ? 'Consumed' : 'Mark Used'}
                                    </Button>
                                  </HStack>
                                );
                              })
                            ) : (
                              <Box p={4} textAlign="center" border="1px dashed" borderColor="slate.200" borderRadius="lg">
                                <Text fontSize="xs" color="slate.400 italic">No services listed</Text>
                              </Box>
                            )}
                          </VStack>
                        </Box>

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

        {/* Graph modal overlay for readings */}
        {graphModal.isOpen && (
          <GraphModal
            closeModal={() => setGraphModal(prev => ({ ...prev, isOpen: false }))}
            patientId={patient.patient_id}
            questionId={graphModal.questionId}
            dailyordia={graphModal.dailyordia}
            isGraph={true}
            questionTitle={graphModal.questionTitle}
            questionUnit={graphModal.questionUnit}
          />
        )}

        <ModalFooter className="dialysis-modal__footer">
          <HStack spacing={2} justify="flex-end">
            <Button
              variant="outline"
              onClick={onClose}
              isDisabled={isLoading}
              size="sm"
            >
              Cancel
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>

      <PaymentModal
        isOpen={billModalOpen}
        onClose={handlePaymentClose}
        appointmentId={currentAppointment?.id}
        onSuccess={handlePaymentSuccess}
      />
      {/* Discharge confirmation modal */}
      <Modal isOpen={dischargeModal.isOpen} onClose={() => setDischargeModal({ isOpen: false, confirmText: '' })} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm discharge</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={3}>Are you sure you want to discharge this patient? This will complete the dialysis session.</Text>
            <Text fontSize="sm" color="slate.500" mb={2}>Type <strong>CONFIRM</strong> to enable the Discharge button.</Text>
            <Input
              value={dischargeModal.confirmText}
              onChange={(e) => setDischargeModal(prev => ({ ...prev, confirmText: e.target.value }))}
              placeholder="Type CONFIRM to proceed"
            />
            {afterNotes && (
              <Box mt={3} p={2} bg="slate.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="600">Post-dialysis notes</Text>
                <Text fontSize="xs" color="slate.600">{afterNotes}</Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setDischargeModal({ isOpen: false, confirmText: '' })}>Cancel</Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmDischarge}
              isDisabled={(dischargeModal.confirmText || '').trim().toLowerCase() !== 'confirm'}
            >
              Discharge Patient
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  );
}
