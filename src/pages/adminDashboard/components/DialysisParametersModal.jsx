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

import PreDialysisDashboardView from '../../dialysis/PreDialysisDashboardView';
import PatientVerificationView from '../../dialysis/PatientVerificationView';
import VitalsMeasurementsView from '../../dialysis/VitalsMeasurementsView';
import PatientAssessmentView from '../../dialysis/PatientAssessmentView';
import VascularAccessAssessmentView from '../../dialysis/VascularAccessAssessmentView';
import MachineSafetyView from '../../dialysis/MachineSafetyView';
import WaterSafetyView from '../../dialysis/WaterSafetyView';
import InfectionControlView from '../../dialysis/InfectionControlView';
import SafetyValidationView from '../../dialysis/SafetyValidationView';
import StartDialysisConfirmationView from '../../dialysis/StartDialysisConfirmationView';
import DuringDialysisPage from '../../dialysis/DuringDialysisPage';
import PostDialysisPage from '../../dialysis/PostDialysisPage';

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/routeConstants';
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
// import { Select } from '../../../component-library/primitives/Select';
import { Accordion, AccordionItem } from '../../../component-library/primitives/Accordion';
import {
  submitDialysisHealthParams,
  getDialysisReadings,
  getAssignedDoctorData,
  insertAlert,
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
  updatePatient,
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
import { Select } from '../../../component-library/primitives/Select';

const BLOOD_GROUP_OPTIONS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

const BLOOD_GROUP_PLACEHOLDER_VALUES = new Set([
  '',
  'later',
  'pending',
  'unknown',
  'will_be_entered_later',
  'will be entered later',
]);

const normalizeBloodGroup = (value = '') => String(value).trim();

const isKnownBloodGroup = (value = '') => {
  const normalized = normalizeBloodGroup(value);
  if (BLOOD_GROUP_PLACEHOLDER_VALUES.has(normalized.toLowerCase())) return false;
  const upper = normalized.toUpperCase();
  return BLOOD_GROUP_OPTIONS.includes(upper);
};

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

const pickFirstNumeric = (...values) => {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }
  return null;
};

const extractDoctorHeparinOrder = ({ patientData, appointmentData, initialData }) => {
  const dose = pickFirstNumeric(
    patientData?.doctor_heparin_dose_units,
    patientData?.doctor_heparin_dose,
    patientData?.heparin_dose_units,
    patientData?.heparinDose,
    appointmentData?.doctor_heparin_dose_units,
    appointmentData?.doctor_heparin_dose,
    appointmentData?.heparin_dose_units,
    appointmentData?.heparinDose,
    appointmentData?.metadata?.doctor_heparin_dose_units,
    appointmentData?.metadata?.heparin_dose_units,
    appointmentData?.metadata?.heparinDose,
    initialData?.doctor_heparin_dose_units,
    initialData?.doctor_heparin_dose,
    initialData?.heparin_dose_units,
    initialData?.heparinDose,
    initialData?.params?.doctor_heparin_dose_units,
    initialData?.params?.heparin_dose_units,
    initialData?.planned_parameters?.heparin_dose_units,
    initialData?.planned_parameters?.heparinDose,
  );

  if (dose == null) return null;

  const strategy = [
    patientData?.doctor_heparin_strategy,
    patientData?.heparin_strategy,
    appointmentData?.doctor_heparin_strategy,
    appointmentData?.heparin_strategy,
    appointmentData?.metadata?.doctor_heparin_strategy,
    appointmentData?.metadata?.heparin_strategy,
    initialData?.doctor_heparin_strategy,
    initialData?.heparin_strategy,
    initialData?.params?.doctor_heparin_strategy,
    initialData?.params?.heparin_strategy,
    initialData?.planned_parameters?.heparin_strategy,
  ].find(Boolean);

  return {
    doseIU: Math.round(dose),
    strategy: strategy || 'doctor_order',
    perKg: null,
    source: 'doctor',
  };
};

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

const DemoDialysisParameterPreview = ({ question, patient, demoData, viewMode = 'graph' }) => {
  const title = question?.title || 'Dialysis Parameter';
  const titleLower = title.toLowerCase();
  const baseValue = demoData?.hemoParamsResponses?.[question?.id] ?? question?.demoValue ?? '—';
  const systolic = demoData?.preview?.systolic ?? '128';
  const diastolic = demoData?.preview?.diastolic ?? '82';

  if (viewMode === 'graph') {
    if (titleLower.includes('systolic') || titleLower.includes('diastolic')) {
      return (
        <Box className="space-y-4">
          <Box className="grid grid-cols-2 gap-3">
            <Box className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <Text fontSize="xs" color="slate.500" fontWeight="700" textTransform="uppercase">Latest Systolic</Text>
              <Text fontSize="2xl" fontWeight="700" color="#32617d">{systolic} mmHg</Text>
            </Box>
            <Box className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <Text fontSize="xs" color="slate.500" fontWeight="700" textTransform="uppercase">Latest Diastolic</Text>
              <Text fontSize="2xl" fontWeight="700" color="#32617d">{diastolic} mmHg</Text>
            </Box>
          </Box>

          <Box className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center">
            <Text fontSize="xs" color="slate.500" fontWeight="700" mb={4} textTransform="uppercase" width="100%" textAlign="left">
              Blood Pressure Trend (mmHg)
            </Text>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '180px' }}>
              {/* Grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="4 4" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#e2e8f0" strokeDasharray="4 4" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#e2e8f0" strokeDasharray="4 4" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#cbd5e1" strokeWidth="2" />
              
              {/* Systolic Trend Line (Upper) */}
              <path
                d="M 60 60 Q 150 40, 240 70 T 420 50"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="60" cy="60" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="200" cy="45" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="340" cy="65" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="420" cy="50" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />

              {/* Diastolic Trend Line (Lower) */}
              <path
                d="M 60 130 Q 150 110, 240 140 T 420 120"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="60" cy="130" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="200" cy="115" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="340" cy="135" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="420" cy="120" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
              
              {/* Labels */}
              <text x="60" y="192" fontSize="10" fill="#64748b" textAnchor="middle">08:00</text>
              <text x="200" y="192" fontSize="10" fill="#64748b" textAnchor="middle">08:30</text>
              <text x="340" y="192" fontSize="10" fill="#64748b" textAnchor="middle">09:00</text>
              <text x="420" y="192" fontSize="10" fill="#64748b" textAnchor="middle">09:30</text>

              <text x="30" y="55" fontSize="10" fill="#ef4444" textAnchor="end">130</text>
              <text x="30" y="125" fontSize="10" fill="#3b82f6" textAnchor="end">80</text>
            </svg>
          </Box>
        </Box>
      );
    }

    return (
      <Box className="space-y-4">
        <Box className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center">
          <Text fontSize="xs" color="slate.500" fontWeight="700" mb={4} textTransform="uppercase" width="100%" textAlign="left">
            {title} Trend Analysis ({question?.unit || ''})
          </Text>
          <svg viewBox="0 0 500 200" style={{ width: '100%', height: '180px' }}>
            <line x1="40" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="4 4" />
            <line x1="40" y1="70" x2="480" y2="70" stroke="#e2e8f0" strokeDasharray="4 4" />
            <line x1="40" y1="120" x2="480" y2="120" stroke="#e2e8f0" strokeDasharray="4 4" />
            <line x1="40" y1="170" x2="480" y2="170" stroke="#cbd5e1" strokeWidth="2" />
            
            <path
              d="M 60 110 Q 150 70, 240 130 T 420 90"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="60" cy="110" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="200" cy="85" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="340" cy="120" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="420" cy="90" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            
            <text x="60" y="192" fontSize="10" fill="#64748b" textAnchor="middle">08:00</text>
            <text x="200" y="192" fontSize="10" fill="#64748b" textAnchor="middle">08:30</text>
            <text x="340" y="192" fontSize="10" fill="#64748b" textAnchor="middle">09:00</text>
            <text x="420" y="192" fontSize="10" fill="#64748b" textAnchor="middle">09:30</text>
          </svg>
        </Box>
      </Box>
    );
  }

  // Table view (viewMode === 'table')
  const readingsList = (titleLower.includes('systolic') || titleLower.includes('diastolic'))
    ? [
        { date: '2026-06-21 08:00', reading: `${systolic}/${diastolic}` },
        { date: '2026-06-21 08:30', reading: `${Number(systolic) + 2}/${Number(diastolic) + 1}` },
        { date: '2026-06-21 09:00', reading: `${Number(systolic) - 3}/${Number(diastolic) - 1}` },
      ]
    : [
        { date: '2026-06-21 08:00', reading: baseValue },
        { date: '2026-06-21 08:30', reading: baseValue },
        { date: '2026-06-21 09:00', reading: baseValue },
      ];

  return (
    <Box className="space-y-4">
      <Box className="rounded-xl border border-slate-200 overflow-hidden">
        <Box className="bg-slate-100 px-4 py-2 flex justify-between">
          <Text fontSize="xs" fontWeight="700" color="slate.600" textTransform="uppercase">Date</Text>
          <Text fontSize="xs" fontWeight="700" color="slate.600" textTransform="uppercase">Reading ({question?.unit || ''})</Text>
        </Box>
        {readingsList.map((row) => (
          <Box key={row.date} className="px-4 py-3 border-t border-slate-100 flex justify-between items-center bg-white">
            <Text fontSize="sm" color="slate.600">{row.date}</Text>
            <Text fontSize="sm" fontWeight="600" color="#4164df">{row.reading}</Text>
          </Box>
        ))}
      </Box>
    </Box>
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
  demoMode = false,
  demoData = null,
  demoAutoOpenFirstParameter = false,
}) {
  
  const [beforeStep, setBeforeStep] = useState('P2-03');
const navigate = useNavigate();
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
  const [appointmentStatus, setAppointmentStatus] = useState(null);
  const [statusModal, setStatusModal] = useState({ isOpen: false, status: null, reason: '', durationDays: '' });
  const [sessionId, setSessionId] = useState(null);
  const [dischargeModal, setDischargeModal] = useState({ isOpen: false, confirmText: '' });
  const [abortModal, setAbortModal] = useState({ isOpen: false, isEmergency: false, reason: '' });
  const { showToast } = useAdminToast();

  // Timer State
  const [manualDuration, setManualDuration] = useState(''); // Default 4 hours
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Guard: auto-set ailment only once per modal open
  const hasSetAilmentRef = useRef(false);

  // Guidelines & Checklist state
  const [orgGuidelines, setOrgGuidelines] = useState([]);
  const [orgChecklists, setOrgChecklists] = useState([]);
  const [orgConfig, setOrgConfig] = useState({ hasGuidelines: false, hasChecklists: false });
  const [dynamicChecklist, setDynamicChecklist] = useState({});

  const [beforeNotes, setBeforeNotes] = useState('');
  const [bloodGroupPrompt, setBloodGroupPrompt] = useState({
    isOpen: false,
    value: '',
    error: '',
    isSaving: false,
  });

  // Heparin dosage state
  const [heparinOverride, setHeparinOverride] = useState('auto'); // 'auto' | 'low' | 'standard' | 'high'
  const [selectedAilment, setSelectedAilment] = useState('');

  const heparinInfo = useMemo(() => {
    // Prefer dry_weight; fall back to body_weight
    const dry = Number(completePatientData?.dry_weight) || Number(completePatientData?.body_weight);
    return calculateHeparinDose(dry, heparinOverride || 'auto', selectedAilment || null);
  }, [completePatientData?.dry_weight, completePatientData?.body_weight, heparinOverride, selectedAilment]);

  const doctorHeparinOrder = useMemo(
    () => extractDoctorHeparinOrder({
      patientData: completePatientData,
      appointmentData: currentAppointment,
      initialData,
    }),
    [completePatientData, currentAppointment, initialData]
  );

  const effectiveHeparinInfo = useMemo(
    () => (doctorHeparinOrder?.doseIU ? doctorHeparinOrder : heparinInfo),
    [doctorHeparinOrder, heparinInfo]
  );

  const isHeparinDoctorLocked = Boolean(doctorHeparinOrder?.doseIU);

  const [duringNotes, setDuringNotes] = useState('');

  // After Dialysis state
  const [afterNotes, setAfterNotes] = useState('');

  // Hemo Dialysis Parameters from API
  const [hemoParams, setHemoParams] = useState([]);
  const [hemoParamsResponses, setHemoParamsResponses] = useState({});
  const [showEntryFor, setShowEntryFor] = useState({}); // { [questionId]: boolean }
  const [graphModal, setGraphModal] = useState({ isOpen: false, questionId: null, questionTitle: '', questionUnit: '', dailyordia: 'dialysis' });
  const [selectedDialysisParam, setSelectedDialysisParam] = useState(null);
  const [detailViewMode, setDetailViewMode] = useState('graph'); // 'graph' or 'table'

  useEffect(() => {
    if (selectedDialysisParam?.question) {
      const q = selectedDialysisParam.question;
      const t = q.title || '';
      const norm = normalizeQuestionTitle(t);
      const isSys = t.toLowerCase().includes('systolic');
      const isDia = t.toLowerCase().includes('diastolic');
      const forceTable = norm === 'weightafter' || norm === 'weightbefore';
      const forceGraph = norm === 'interdialyticweight';
      const defaultAsGraph = forceGraph || (!forceTable && q.isGraph === 1) || isSys || isDia;
      setDetailViewMode(defaultAsGraph ? 'graph' : 'table');
    }
  }, [selectedDialysisParam]);
  const [weightVarianceModal, setWeightVarianceModal] = useState({
    isOpen: false,
    reason: '',
    dryWeight: null,
    afterWeight: null,
    varianceKg: null,
  });
  const [isSubmittingWeightVariance, setIsSubmittingWeightVariance] = useState(false);

  const hasDialysisSystolic = useMemo(() => {
    return hemoParams.some((q) => q.title?.toLowerCase().includes("systolic"));
  }, [hemoParams]);

  const postDialysisWeightQuestion = useMemo(
    () => hemoParams.find((q) => normalizeQuestionTitle(q?.title || '') === 'weightafter') || null,
    [hemoParams]
  );

  const dryWeightValue = useMemo(() => {
    const value = Number(completePatientData?.dry_weight);
    return Number.isFinite(value) ? value : null;
  }, [completePatientData?.dry_weight]);

  const postDialysisWeightValue = useMemo(() => {
    if (!postDialysisWeightQuestion?.id) return null;
    const value = Number(hemoParamsResponses[postDialysisWeightQuestion.id]);
    return Number.isFinite(value) ? value : null;
  }, [hemoParamsResponses, postDialysisWeightQuestion?.id]);

  const weightVarianceKg = useMemo(() => {
    if (dryWeightValue == null || postDialysisWeightValue == null) return null;
    return Number((postDialysisWeightValue - dryWeightValue).toFixed(2));
  }, [dryWeightValue, postDialysisWeightValue]);

  const hasAnyEnteredReading = useMemo(() => {
    return Object.values(hemoParamsResponses || {}).some((value) => {
      if (value === null || value === undefined) return false;
      return String(value).trim() !== '';
    });
  }, [hemoParamsResponses]);

  const validateReadingsForStage = useCallback((stageName) => {
    if (!hasAnyEnteredReading) {
      if (stageName === 'before') {
        alert('Please enter at least one dialysis reading before starting the session.');
      } else if (stageName === 'during') {
        alert('Please enter at least one dialysis reading before stopping the session.');
      } else {
        alert('Please enter dialysis readings before completing the session.');
      }
      return false;
    }

    if (stageName === 'after' && postDialysisWeightQuestion?.id && postDialysisWeightValue == null) {
      alert('Please enter the Weight After reading before completing the session.');
      return false;
    }

    return true;
  }, [hasAnyEnteredReading, postDialysisWeightQuestion?.id, postDialysisWeightValue]);

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
  const isDemoMode = Boolean(demoMode || demoData);

  // Fetch patient parameters, readings and inventory — only when modal opens or patient changes
  useEffect(() => {
    if (!isOpen) return;

    if (isDemoMode) {
      const demoPatient = demoData?.patient || demoData?.completePatientData || demoData?.userData || {
        id: patient?.patient_id || 9001,
        patient_id: patient?.patient_id || 9001,
        patient_name: patient?.patient_name || patient?.name || 'Demo Patient',
        name: patient?.patient_name || patient?.name || 'Demo Patient',
        dry_weight: 68.5,
        body_weight: 70.2,
        blood_group: 'O+',
        ailments: ['Hemo Dialysis'],
        program: 'Standard',
      };

      setCompletePatientData(demoPatient);
      setDialysisReadings(demoData?.readings || []);
      setCurrentAppointment(demoData?.appointment || {
        id: 7001,
        metadata: { dialysisDuration: 4 },
        start_time: '08:00',
        end_time: '12:00',
        services: demoData?.appointmentServices || [],
        totalAmount: 2400,
        amountPaid: 500,
      });
      setAppointmentServices(demoData?.appointmentServices || []);
      setHemoParams(demoData?.hemoParams || [
        { id: 101, title: 'Systolic BP', unit: 'mmHg', isGraph: 1 },
        { id: 102, title: 'Diastolic BP', unit: 'mmHg', isGraph: 1 },
        { id: 103, title: 'Weight Before', unit: 'kg', isGraph: 0 },
        { id: 104, title: 'Weight After', unit: 'kg', isGraph: 0 },
        { id: 105, title: 'Blood Flow Rate', unit: 'ml/min', isGraph: 0 },
      ]);
      setHemoParamsResponses(demoData?.hemoParamsResponses || {
        101: '128',
        102: '82',
        103: '70.1',
        104: '69.8',
        105: '350',
      });
      setInventoryItems(demoData?.inventoryItems || [
        { id: 1, name: 'Heparin', unit_price: 12 },
        { id: 2, name: 'Saline', unit_price: 5 },
      ]);
      setInventoryStock(demoData?.inventoryStock || [
        { item_id: 1, unit_price: 12 },
        { item_id: 2, unit_price: 5 },
      ]);
      setDialyzers(demoData?.dialyzers || [
        { id: 1, usage_count: 2, max_usage: 5, unit_price: 150 },
      ]);
      setConsumedItems(demoData?.consumedItems || []);
      setSelectedDialyzerId(demoData?.selectedDialyzerId || '');
      setSessionId(demoData?.sessionId || 9991);
      setLoadingData(false);
      setInventoryLoading(false);
      setServicesLoading(false);

      if (demoAutoOpenFirstParameter && (demoData?.hemoParams || []).length > 0) {
        setSelectedDialysisParam({ question: (demoData?.hemoParams || [])[0] });
      }
      return;
    }

    if (patient?.patient_id) {
      hasSetAilmentRef.current = false; // reset guard when patient changes
      fetchPatientData();
      fetchInventoryData();
      setSessionId(initialData?.session_id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, patient?.patient_id, isDemoMode, demoData, demoAutoOpenFirstParameter]);

  // Close selected dialysis param overlay when modal closes
  useEffect(() => {
    if (!isOpen) setSelectedDialysisParam(null);
  }, [isOpen]);

  // Reset volatile session state when modal closes so next patient starts fresh
  useEffect(() => {
    if (!isOpen) {
      setStage('before');
      setCompletePatientData(null);
      setDialysisReadings(null);
      setBeforeNotes('');
      setDuringNotes('');
      setAfterNotes('');
      setSessionId(null);
      setConsumedItems([]);
      setTimeLeft(0);
      setTimerActive(false);
      setHeparinOverride('auto');
      setSelectedAilment('');
      setHemoParamsResponses({});
      setShowEntryFor({});
      setDynamicChecklist({});
      setMarkBedForCleaning(true);
      setWeightVarianceModal({
        isOpen: false,
        reason: '',
        dryWeight: null,
        afterWeight: null,
        varianceKg: null,
      });
      setIsSubmittingWeightVariance(false);
      setBloodGroupPrompt({
        isOpen: false,
        value: '',
        error: '',
        isSaving: false,
      });
      hasSetAilmentRef.current = false;
    }
  }, [isOpen]);

  const fetchInventoryData = useCallback(async () => {
    if (isDemoMode) return;
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
  }, [isDemoMode]);

  const fetchPatientData = useCallback(async () => {
    if (isDemoMode) return;
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
        
        // Auto-select first relevant ailment if available for heparin calculation (only once)
        if (normalizedAilments.length > 0 && !hasSetAilmentRef.current) {
          hasSetAilmentRef.current = true;
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

            // Initialize dynamic checklist for checklist items only (guidelines are informational text)
            const initialChecklist = {};

            // Normalize checklist grouping by stage (before/during/after) using flexible matching
            const checklistBefore = checklists.filter(c => String(c.type || '').toLowerCase().includes('pre'));
            const checklistDuring = checklists.filter(c => String(c.type || '').toLowerCase().includes('during'));
            const checklistAfter = checklists.filter(c => String(c.type || '').toLowerCase().includes('post'));

            checklistBefore.forEach((_, i) => { initialChecklist[`checklist_before_${i}`] = false; });
            checklistDuring.forEach((_, i) => { initialChecklist[`checklist_during_${i}`] = false; });
            checklistAfter.forEach((_, i) => { initialChecklist[`checklist_after_${i}`] = false; });

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
    // selectedAilment intentionally omitted — it is set inside here; using the ref guard avoids loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, patient?.patient_id, bed?.organization_id, initialData]);

  const startDialysisSessionFlow = useCallback(async (bloodGroupOverride = '') => {
    try {
      setIsSaving(true);
      setSavingMessage('Validating preparation checklists...');

      if (!validateReadingsForStage('before')) {
        return;
      }

      // Only require checklist items for the "Before" stage (guidelines are informational)
      const prepChecklistKeys = orgChecklists.filter(c => String(c.type || '').toLowerCase().includes('pre')).map((_, i) => `checklist_before_${i}`);
      const allPreDynamicDone = prepChecklistKeys.length === 0 ? true : prepChecklistKeys.every(key => dynamicChecklist[key]);

      if (!allPreDynamicDone) {
        alert('Please complete all preparation checklist items before starting');
        return;
      }

      const resolvedBloodGroup = normalizeBloodGroup(bloodGroupOverride || completePatientData?.blood_group);
      if (!isKnownBloodGroup(resolvedBloodGroup)) {
        throw new Error('Blood group is required before starting dialysis.');
      }

      // Include heparin data in submission (doctor prescribed when available, else calculated)
      const heparinPayload = effectiveHeparinInfo?.doseIU
        ? {
            strategy: effectiveHeparinInfo.strategy,
            dose_iu: effectiveHeparinInfo.doseIU,
            per_kg: effectiveHeparinInfo.perKg,
            ailment: selectedAilment || null,
            source: isHeparinDoctorLocked ? 'doctor_order' : 'calculated',
          }
        : null;

      // Construct planned parameters from current session state and patient profile
      const plannedParameters = {
        session_duration_minutes: Number(manualDuration) * 60 || 240,
        heparin_dose_units: effectiveHeparinInfo?.doseIU || undefined,
        heparin_strategy: effectiveHeparinInfo?.strategy || undefined,
        ailments: completePatientData?.ailments || [],
        blood_group: resolvedBloodGroup,
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
        blood_group: resolvedBloodGroup,
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

      // const result = await submitDialysisHealthParams({
      //   patient_id: patient.patient_id,
      //   bed_id: bed?.id,
      //   stage: 'before',
      //   notes: beforeNotes,
      //   heparin: heparinPayload,
      //   custom_readings: hemoParamsResponses,
      //   timestamp: new Date().toISOString(),
      // });

      // if (result.success || startedSessionId) {
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
            blood_group: resolvedBloodGroup,
            heparin: heparinPayload,
          });
        }
      // }
    } catch (err) {
      console.error('Failed to start dialysis:', err);
      alert(err.message || 'Failed to start dialysis session');
    } finally {
      setIsSaving(false);
      setSavingMessage('');
    }
  }, [beforeNotes, patient?.patient_id, patient?.appointment_id, bed?.id, currentAppointment, effectiveHeparinInfo, selectedAilment, onStageChange, orgGuidelines, orgChecklists, dynamicChecklist, completePatientData, hemoParamsResponses, isHeparinDoctorLocked, validateReadingsForStage, manualDuration]);

  const handleStartDialysis = useCallback(async () => {
    const currentBloodGroup = normalizeBloodGroup(completePatientData?.blood_group);
    if (!isKnownBloodGroup(currentBloodGroup)) {
      setBloodGroupPrompt({
        isOpen: true,
        value: '',
        error: '',
        isSaving: false,
      });
      return;
    }

    await startDialysisSessionFlow(currentBloodGroup);
  }, [completePatientData?.blood_group, startDialysisSessionFlow]);

  const handleBloodGroupPromptSave = useCallback(async () => {
    const nextBloodGroup = normalizeBloodGroup(bloodGroupPrompt.value).toUpperCase();
    if (!isKnownBloodGroup(nextBloodGroup)) {
      setBloodGroupPrompt((prev) => ({ ...prev, error: 'Please select a valid blood group.' }));
      return;
    }

    setBloodGroupPrompt((prev) => ({ ...prev, isSaving: true, error: '' }));
    try {
      const updateRes = await updatePatient({
        id: patient.patient_id,
        blood_group: nextBloodGroup,
      });

      if (!updateRes.success) {
        throw new Error(updateRes.data?.message || updateRes.data?.error || 'Failed to save blood group');
      }

      setCompletePatientData((prev) => (prev ? { ...prev, blood_group: nextBloodGroup } : prev));
      setBloodGroupPrompt({ isOpen: false, value: '', error: '', isSaving: false });

      await startDialysisSessionFlow(nextBloodGroup);
    } catch (err) {
      console.error('Failed to save blood group:', err);
      setBloodGroupPrompt((prev) => ({
        ...prev,
        isSaving: false,
        error: err?.message || 'Failed to save blood group.',
      }));
    }
  }, [bloodGroupPrompt.value, patient?.patient_id, startDialysisSessionFlow]);

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
      if (!validateReadingsForStage('during')) {
        return;
      }

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

      // const result = await submitDialysisHealthParams({
      //   patient_id: patient.patient_id,
      //   bed_id: bed?.id,
      //   stage: 'during',
      //   notes: duringNotes,
      //   timestamp: new Date().toISOString(),
      // });

      // if (result.success) {
        setStage('after');
        setTimerActive(false);
        if (onStageChange) {
          onStageChange('after', { notes: duringNotes });
        }
      // }
    } catch (err) {
      console.error('Failed to stop dialysis:', err);
    }
  }, [sessionId, duringNotes, patient?.patient_id, bed?.id, onStageChange, validateReadingsForStage]);

  const notifyAssignedDoctorsForWeightVariance = useCallback(async (reason, varianceSnapshot = {}) => {
    if (!reason?.trim() || !patient?.patient_id) return;

    try {
      const doctorsRes = await getAssignedDoctorData(patient.patient_id);
      const doctors = doctorsRes?.data?.data || doctorsRes?.data || [];
      const doctorEmails = [...new Set(
        (Array.isArray(doctors) ? doctors : [])
          .map((doctor) => doctor?.email || doctor?.doctor_email || doctor?.user_email || doctor?.mail)
          .filter(Boolean)
      )];

      if (!doctorEmails.length) {
        console.warn('No assigned doctor emails found for weight variance alert.');
        return;
      }

      const dryW = varianceSnapshot?.dryWeight ?? dryWeightValue;
      const afterW = varianceSnapshot?.afterWeight ?? postDialysisWeightValue;
      const variance = varianceSnapshot?.varianceKg ?? weightVarianceKg;

      const message = `Dialysis post-weight alert for patient ${patient?.patient_name || patient?.patient_id}: dry weight ${dryW ?? 'N/A'} kg, post-dialysis weight ${afterW ?? 'N/A'} kg, variance +${variance ?? 'N/A'} kg. Reason: ${reason.trim()}`;

      await Promise.allSettled(
        doctorEmails.map((email) =>
          insertAlert(email, Number(patient.patient_id) || patient.patient_id, 'Dialysis Weight Variance', message)
        )
      );
    } catch (error) {
      console.error('Failed to send weight variance alert to assigned doctor(s):', error);
    }
  }, [dryWeightValue, patient?.patient_id, patient?.patient_name, postDialysisWeightValue, weightVarianceKg]);

  const handleCloseDialysis = useCallback(async (weightVarianceReason = '') => {
    try {
      if (!validateReadingsForStage('after')) {
        return;
      }

      // const result = await submitDialysisHealthParams({
      //   patient_id: patient.patient_id,
      //   bed_id: bed?.id,
      //   stage: 'after',
      //   notes: afterNotes,
      //   timestamp: new Date().toISOString(),
      // });

      const varianceReasonText = (weightVarianceReason || '').trim();
      const varianceReasonNote = varianceReasonText
        ? `\n\n[Weight Variance Alert]\nDry Weight: ${dryWeightValue ?? 'N/A'} kg\nPost-Dialysis Weight: ${postDialysisWeightValue ?? 'N/A'} kg\nVariance: +${weightVarianceKg ?? 'N/A'} kg\nReason: ${varianceReasonText}`
        : '';

      if (sessionId) {
        await updateSessionParameters(sessionId, {
          postDialysisNotes: `${afterNotes || ''}${varianceReasonNote}`.trim(),
          inventoryItemsUsed: consumedItems
        });
      }

      if (varianceReasonText) {
        await notifyAssignedDoctorsForWeightVariance(varianceReasonText, {
          dryWeight: dryWeightValue,
          afterWeight: postDialysisWeightValue,
          varianceKg: weightVarianceKg,
        });
      }

      // if (result.success) {
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
      // }
    } catch (err) {
      console.error('Failed to close dialysis:', err);
    }
  }, [afterNotes, consumedItems, dryWeightValue, notifyAssignedDoctorsForWeightVariance, patient, postDialysisWeightValue, bed?.id, onStageChange, onClose, sessionId, weightVarianceKg, validateReadingsForStage]);

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
      
      <ModalContent bg="#F9FAFB" className="dialysis-modal__content m-0 max-w-[100vw] h-[100vh] rounded-none">
        {/* Top Navigation Tabs */}
        <Box className="bg-white border-b border-gray-200 px-6 pt-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <HStack spacing={8}>
            <button 
              className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors ${stage === 'before' ? 'border-[#4164df] text-[#4164df]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              onClick={() => setStage('before')}
            >
              Pre-Dialysis
            </button>
            <button 
              className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors ${stage === 'during' ? 'border-[#4164df] text-[#4164df]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              onClick={() => setStage('during')}
            >
              Session Monitoring
            </button>
            <button 
              className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors ${stage === 'after' ? 'border-[#4164df] text-[#4164df]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              onClick={() => setStage('after')}
            >
              Post-Session
            </button>
          </HStack>
          
          <HStack spacing={4} pb={2}>
            {stage === 'during' && (
              <HStack spacing={2}>
                <Button size="sm" variant="outline" colorScheme="warning" onClick={() => handleOpenAbort(false)}>
                  Abort
                </Button>
                <Button size="sm" colorScheme="red" onClick={() => handleOpenAbort(true)} fontWeight="bold">
                  🚨 Emergency
                </Button>
              </HStack>
            )}
            {isSaving && (
              <Badge colorScheme="info" variant="solid" px={3} py={1} borderRadius="full">
                {savingMessage || 'Saving…'}
              </Badge>
            )}
            <ModalCloseButton position="static" />
          </HStack>
        </Box>

        <ModalBody p={0} className="dialysis-modal__body bg-[#F9FAFB] overflow-y-auto overflow-x-hidden">
          {loadingData ? (
            <VStack spacing={4} justify="center" align="center" minH="300px" pt={20}>
              <div className="dialysis-modal__loader" />
              <Text fontSize="sm" color="slate.500" fontWeight="500">Loading patient data…</Text>
            </VStack>
          ) : (
            <Box w="full" h="full">
              {stage === 'before' && (
                <Box w="full" h="full">
                  {beforeStep === 'P2-03' && (
                    <PreDialysisDashboardView
                      patientId={patient?.patient_id || patient?.id}
                      onBack={onClose}
                      onNavigateStep={setBeforeStep}
                    />
                  )}
                  {beforeStep === 'P2-04' && (
                    <PatientVerificationView
                      patientId={patient?.patient_id || patient?.id}
                      onBack={() => setBeforeStep('P2-03')}
                      onNext={() => setBeforeStep('P2-05')}
                    />
                  )}
                  {beforeStep === 'P2-05' && (
                    <VitalsMeasurementsView
                      patientId={patient?.patient_id || patient?.id}
                      onBack={() => setBeforeStep('P2-04')}
                      onNext={() => setBeforeStep('P2-06')}
                    />
                  )}
                  {beforeStep === 'P2-06' && (
                    <PatientAssessmentView
                      patientId={patient?.patient_id || patient?.id}
                      onBack={() => setBeforeStep('P2-05')}
                      onNext={() => setBeforeStep('P2-07')}
                    />
                  )}
                  {beforeStep === 'P2-07' && (
                    <VascularAccessAssessmentView
                      patientId={patient?.patient_id || patient?.id}
                      onBack={() => setBeforeStep('P2-06')}
                      onNext={() => setBeforeStep('P2-08')}
                    />
                  )}
                  {beforeStep === 'P2-08' && (
                    <MachineSafetyView
                      patientId={patient?.patient_id || patient?.id}
                      onBack={() => setBeforeStep('P2-07')}
                      onNext={() => setBeforeStep('P2-09')}
                    />
                  )}
                  {beforeStep === 'P2-09' && (
                    <WaterSafetyView
                      patientId={patient?.patient_id || patient?.id}
                      onBack={() => setBeforeStep('P2-08')}
                      onNext={() => setBeforeStep('P2-10')}
                    />
                  )}
                  {beforeStep === 'P2-10' && (
                    <InfectionControlView
                      patientId={patient?.patient_id || patient?.id}
                      onBack={() => setBeforeStep('P2-09')}
                      onNext={() => setBeforeStep('P2-11')}
                    />
                  )}
                  {beforeStep === 'P2-11' && (
                    <SafetyValidationView
                      patientId={patient?.patient_id || patient?.id}
                      onBack={() => setBeforeStep('P2-10')}
                      onNext={() => setBeforeStep('P2-12')}
                    />
                  )}
                  {beforeStep === 'P2-12' && (
                    <StartDialysisConfirmationView
                      patientId={patient?.patient_id || patient?.id}
                      onBack={() => setBeforeStep('P2-11')}
                      onNext={() => {
                        if (onStageChange) onStageChange('during');
                        setStage('during');
                      }}
                    />
                  )}
                </Box>
              )}

              {stage !== 'before' && (
                <Box className="dialysis-modal__workspace" p={6}>
                  {stage === 'during' ? (
                    <DuringDialysisPage
                      embedded
                      sessionId={sessionId}
                      patientData={completePatientData || patient}
                      parameterQuestions={hemoParams}
                      patientId={patient?.patient_id || patient?.id}
                      onCompleted={() => {
                        setStage('after');
                        setTimerActive(false);
                        onStageChange?.('after');
                      }}
                    />
                  ) : stage === 'after' ? (
                    <PostDialysisPage
                      embedded
                      sessionId={sessionId}
                      patientData={completePatientData || patient}
                      onCompleted={() => {
                        setTimerActive(false);
                        onStageChange?.('closed');
                        onClose?.();
                      }}
                    />
                  ) : (
                  <Box className="dialysis-modal__main-layout" display="flex" gap={6}>
                    <Box flex={2.5} className="dialysis-modal__left-sidebar">
                  <PatientProfileCard 
                    userData={completePatientData || patient} 
                    role={{ role_name: 'Medical Staff' }} 
                    showAilmentDetails={false} 
                  />
                </Box>
                    
                    <VStack flex={6.5} align="stretch" spacing={6} className="dialysis-modal__center-content">
                      {stage === 'during' && (
                        <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.200">
                          <VStack spacing={4} align="stretch">
                            {/* Live session timer banner */}
                          {stage === 'during' && timeLeft > 0 && (
                            <Box
                              className="dialysis-modal__timer-banner"
                              p={3}
                              borderRadius="xl"
                              bg={timeLeft < 300 ? 'red.50' : 'amber.50'}
                              border="1px solid"
                              borderColor={timeLeft < 300 ? 'red.200' : 'amber.200'}
                            >
                              <HStack justify="space-between" align="center">
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="10px" fontWeight="700" textTransform="uppercase" color={timeLeft < 300 ? 'red.500' : 'amber.600'} letterSpacing="wider">
                                    {timeLeft < 300 ? '⚠️ Session ending soon' : '⏱ Time Remaining'}
                                  </Text>
                                  <Text
                                    fontSize="2xl"
                                    fontWeight="900"
                                    fontFamily="monospace"
                                    color={timeLeft < 300 ? 'red.600' : 'amber.700'}
                                    letterSpacing="0.05em"
                                  >
                                    {formatTimeLeft(timeLeft)}
                                  </Text>
                                </VStack>
                                <Button
                                  size="sm"
                                  colorScheme="warning"
                                  variant="solid"
                                  onClick={handleStopDialysis}
                                  isLoading={isLoading}
                                  isDisabled={stage !== 'during'}
                                  borderRadius="xl"
                                >
                                  Stop Session
                                </Button>
                              </HStack>
                            </Box>
                          )}
                          {/* Machine Readings & During-dialysis Protocol */}
                          {(orgConfig.hasGuidelines || orgConfig.hasChecklists) && (
                            <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                              <CardHeader py={2}><Heading as="h4" size="xs" color="slate.500" textTransform="uppercase">Protocol & Monitoring</Heading></CardHeader>
                              <CardBody>
                                <VStack align="start" spacing={3}>
                                  {/* Guidelines (informational) */}
                                  {orgConfig.hasGuidelines && orgGuidelines.filter(g => String(g.type || '').toLowerCase().includes('during')).map((gl, i) => (
                                    <Text key={`during_gl_text_${i}`} fontSize="xs">{gl.text}</Text>
                                  ))}

                                  {/* Monitoring checklists (tick options) */}
                                  {orgConfig.hasChecklists && orgChecklists.filter(c => String(c.type || '').toLowerCase().includes('during')).map((cl, i) => (
                                    <Checkbox
                                      key={`mon_cl_${i}`}
                                      checked={dynamicChecklist[`checklist_during_${i}`]}
                                      onChange={(e) => setDynamicChecklist(prev => ({ ...prev, [`checklist_during_${i}`]: e.target.checked }))}
                                      disabled={stage !== 'during'}
                                      size="sm"
                                      colorScheme="warning"
                                    >
                                      <Text fontSize="xs">Monitor: {cl.text}</Text>
                                    </Checkbox>
                                  ))}

                                  {((orgConfig.hasGuidelines && orgGuidelines.filter(g => String(g.type || '').toLowerCase().includes('during')).length === 0) &&
                                    (orgConfig.hasChecklists && orgChecklists.filter(c => String(c.type || '').toLowerCase().includes('during')).length === 0)) && (
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

                          {stage !== 'during' ? (
                            <Box p={3} borderRadius="xl" bg="slate.50" textAlign="center">
                              <Text fontSize="xs" color="slate.400">Stop Dialysis button available once session is started</Text>
                            </Box>
                          ) : (
                            <Button colorScheme="warning" onClick={handleStopDialysis} isLoading={isLoading} isDisabled={stage !== 'during'} width="100%" size="lg" borderRadius="xl">
                              ⏹ Stop Dialysis
                            </Button>
                          )}
                          </VStack>
                        </Box>
                      )}
                      
                      {stage === 'after' && (
                        <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.200">
                          <VStack spacing={6} align="stretch">
                            {(orgConfig.hasGuidelines || orgConfig.hasChecklists) && (
                            <Card variant="outline" size="sm" className="dialysis-modal__panel-card">
                              <CardHeader><Heading as="h4" size="sm">Post-Session Checks</Heading></CardHeader>
                              <CardBody>
                                <VStack align="start" spacing={2}>

                                  {/* Post-dialysis Guidelines (informational) */}
                                  {orgConfig.hasGuidelines && orgGuidelines.filter(g => String(g.type || '').toLowerCase().includes('post')).map((gl, i) => (
                                    <Text key={`post_gl_text_${i}`} fontSize="xs">{gl.text}</Text>
                                  ))}

                                  {/* Cleaning Checklists (tick options) */}
                                  {orgConfig.hasChecklists && orgChecklists.filter(c => String(c.type || '').toLowerCase().includes('post')).map((cl, i) => (
                                    <Checkbox
                                      key={`clean_cl_${i}`}
                                      checked={dynamicChecklist[`checklist_after_${i}`]}
                                      onChange={(e) => setDynamicChecklist(prev => ({ ...prev, [`checklist_after_${i}`]: e.target.checked }))}
                                      size="sm"
                                      disabled={stage !== 'after'}
                                      colorScheme="warning"
                                    >
                                      <Text fontSize="xs">Cleaning: {cl.text}</Text>
                                    </Checkbox>
                                  ))}
                                  {((orgConfig.hasGuidelines && orgGuidelines.filter(g => String(g.type || '').toLowerCase().includes('post')).length === 0) &&
                                    (orgConfig.hasChecklists && orgChecklists.filter(c => String(c.type || '').toLowerCase().includes('post')).length === 0)) && (
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
                              if (weightVarianceKg != null && weightVarianceKg > 0.5) {
                                setWeightVarianceModal({
                                  isOpen: true,
                                  reason: '',
                                  dryWeight: dryWeightValue,
                                  afterWeight: postDialysisWeightValue,
                                  varianceKg: weightVarianceKg,
                                });
                                return;
                              }

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
                        </Box>
                      )}
                    </VStack>
                  </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </ModalBody>
      </ModalContent>


      <PaymentModal
        isOpen={billModalOpen}
        onClose={handlePaymentClose}
        appointmentId={currentAppointment?.id}
        onSuccess={handlePaymentSuccess}
      />
      {/* Graph modal overlay for readings - rendered outside ModalContent for proper z-index */}
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

      {/* Selected dialysis parameter overlay (match patient profile popup behavior) */}
      {selectedDialysisParam && (
        <div onClick={() => setSelectedDialysisParam(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '820px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.28)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h2 style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.35rem', margin: 0, letterSpacing: '-0.02em' }}>
                  {selectedDialysisParam.question?.title}
                </h2>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Patient: {completePatientData?.name || patient?.patient_name || 'Demo Patient'}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Table / Graph Segmented Selector */}
                <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '10px', padding: '4px', border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setDetailViewMode('table')}
                    style={{
                      padding: '6px 18px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.2s',
                      background: detailViewMode === 'table' ? '#ffffff' : 'transparent',
                      color: detailViewMode === 'table' ? '#3b82f6' : '#64748b',
                      boxShadow: detailViewMode === 'table' ? '0 2px 4px rgba(15,23,42,0.06)' : 'none',
                    }}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setDetailViewMode('graph')}
                    style={{
                      padding: '6px 18px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.2s',
                      background: detailViewMode === 'graph' ? '#ffffff' : 'transparent',
                      color: detailViewMode === 'graph' ? '#3b82f6' : '#64748b',
                      boxShadow: detailViewMode === 'graph' ? '0 2px 4px rgba(15,23,42,0.06)' : 'none',
                    }}
                  >
                    Graph
                  </button>
                </div>
                
                <button onClick={() => setSelectedDialysisParam(null)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1, padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              {(() => {
                const q = selectedDialysisParam.question;
                const t = q.title || '';
                const norm = normalizeQuestionTitle(t);
                const isSys = t.toLowerCase().includes('systolic');
                const isDia = t.toLowerCase().includes('diastolic');
                
                if (isDemoMode) {
                  return <DemoDialysisParameterPreview question={q} patient={patient} demoData={demoData} viewMode={detailViewMode} />;
                }
                
                if (detailViewMode === 'graph') {
                  if (isSys || isDia) {
                    return <SystolicDiastolicGraph question={q} userId={patient.patient_id} isDialysis={true} aspect={2/1} />;
                  }
                  return <LineChartDialysis aspect={2/1} questionId={q.id} user_id={patient.patient_id} title={t} unit={q.unit} />;
                } else {
                  return <DialysisTable questionId={q.id} user_id={patient.patient_id} title={t} question={q} highlightThreshold={norm === 'weightafter' ? completePatientData?.dry_weight : null} highlightComparator="gt" />;
                }
              })()}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={weightVarianceModal.isOpen}
        onClose={() => {
          if (isSubmittingWeightVariance) return;
          setWeightVarianceModal(prev => ({ ...prev, isOpen: false }));
        }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Post-Dialysis Weight Variance</ModalHeader>
          <ModalCloseButton isDisabled={isSubmittingWeightVariance} />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" color="slate.700">
                Post-dialysis weight is more than <strong>0.5 kg</strong> above dry weight. Please provide a reason before closing the session and notifying the doctor.
              </Text>
              <Box p={3} bg="amber.50" border="1px solid" borderColor="amber.200" borderRadius="md">
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs"><strong>Dry Weight:</strong> {weightVarianceModal.dryWeight ?? 'N/A'} kg</Text>
                  <Text fontSize="xs"><strong>Post-Dialysis Weight:</strong> {weightVarianceModal.afterWeight ?? 'N/A'} kg</Text>
                  <Text fontSize="xs" color="amber.700"><strong>Variance:</strong> +{weightVarianceModal.varianceKg ?? 'N/A'} kg</Text>
                </VStack>
              </Box>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Reason to send to doctor</FormLabel>
                <Textarea
                  value={weightVarianceModal.reason}
                  onChange={(e) => setWeightVarianceModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for elevated post-dialysis weight..."
                  rows={4}
                  isDisabled={isSubmittingWeightVariance}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setWeightVarianceModal(prev => ({ ...prev, isOpen: false }))}
              isDisabled={isSubmittingWeightVariance}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              isLoading={isSubmittingWeightVariance}
              onClick={async () => {
                const reason = (weightVarianceModal.reason || '').trim();
                if (!reason) {
                  alert('Please enter a reason before continuing.');
                  return;
                }

                setIsSubmittingWeightVariance(true);
                try {
                  if (markBedForCleaning && bed?.id) {
                    await updateBedStatus(bed.id, {
                      status: 'MAINTENANCE',
                      notes: 'Automatically marked for cleaning after session'
                    });
                  }

                  await handleCloseDialysis(reason);
                  setWeightVarianceModal({
                    isOpen: false,
                    reason: '',
                    dryWeight: null,
                    afterWeight: null,
                    varianceKg: null,
                  });
                } finally {
                  setIsSubmittingWeightVariance(false);
                }
              }}
            >
              Send to Doctor & Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={bloodGroupPrompt.isOpen}
        onClose={() => setBloodGroupPrompt({ isOpen: false, value: '', error: '', isSaving: false })}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter Blood Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text color="slate.600">
                Blood group is required before starting dialysis. Please enter and save it now.
              </Text>
              <FormControl isInvalid={Boolean(bloodGroupPrompt.error)}>
                <FormLabel>Blood Group</FormLabel>
                <Select
                  value={bloodGroupPrompt.value}
                  onChange={(e) => setBloodGroupPrompt((prev) => ({ ...prev, value: e.target.value, error: '' }))}
                  placeholder="Select blood group"
                >
                  {BLOOD_GROUP_OPTIONS.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </Select>
              </FormControl>
              {bloodGroupPrompt.error ? (
                <Text color="red.500" fontSize="sm">{bloodGroupPrompt.error}</Text>
              ) : null}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={() => setBloodGroupPrompt({ isOpen: false, value: '', error: '', isSaving: false })}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleBloodGroupPromptSave} isLoading={bloodGroupPrompt.isSaving}>
                Save & Start Dialysis
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

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

      {/* Abort confirmation modal */}
      <Modal isOpen={abortModal.isOpen} onClose={() => setAbortModal(prev => ({ ...prev, isOpen: false }))} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={abortModal.isEmergency ? "red.600" : "slate.700"}>
            {abortModal.isEmergency ? "🚨 Emergency Abort Session" : "Abort Dialysis Session"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" color={abortModal.isEmergency ? "red.700" : "slate.600"} fontWeight={abortModal.isEmergency ? "bold" : "normal"}>
                {abortModal.isEmergency 
                  ? "WARNING: You are triggering an emergency abort. This will stop the session immediately and mark it as an emergency." 
                  : "Are you sure you want to abort this session? This action cannot be undone."}
              </Text>
              
              <FormControl isRequired>
                <FormLabel fontSize="xs">Reason for {abortModal.isEmergency ? "Emergency " : ""}Abort</FormLabel>
                <Textarea
                  placeholder="Enter a detailed reason..."
                  value={abortModal.reason}
                  onChange={(e) => setAbortModal(prev => ({ ...prev, reason: e.target.value }))}
                  size="sm"
                  borderColor={abortModal.isEmergency ? "red.300" : "slate.200"}
                  _focus={{ borderColor: abortModal.isEmergency ? "red.500" : "info.500" }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setAbortModal(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button
              colorScheme={abortModal.isEmergency ? "red" : "slate"}
              onClick={handleConfirmAbort}
              isDisabled={!abortModal.reason || !abortModal.reason.trim()}
            >
              Confirm Abort
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Appointment status modal (vacation / deceased / left / hospitalized) */}
      <Modal isOpen={statusModal.isOpen} onClose={() => setStatusModal({ isOpen: false, status: null, reason: '', durationDays: '' })} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Appointment Status: {statusModal.status}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              {(statusModal.status === 'VACATION') && (
                <>
                  <Text fontSize="sm">Mark patient as on VACATION. This can free the bed for other patients.</Text>
                  <FormControl>
                    <FormLabel>Duration (days)</FormLabel>
                    <Input
                      type="number"
                      value={statusModal.durationDays}
                      onChange={(e) => setStatusModal(prev => ({ ...prev, durationDays: e.target.value }))}
                      placeholder="Number of days patient will be on vacation"
                    />
                  </FormControl>
                </>
              )}

              {(statusModal.status === 'DECEASED') && (
                <>
                  <Text fontSize="sm">Please confirm deceased details and reason. This will mark the appointment appropriately.</Text>
                  <FormControl>
                    <FormLabel>Location</FormLabel>
                    <Select value={statusModal.location || ''} onChange={(e) => setStatusModal(prev => ({ ...prev, location: e.target.value }))}>
                      <option value="">Select location</option>
                      <option value="in_center">In dialysis center</option>
                      <option value="outside">Outside dialysis center</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Reason</FormLabel>
                    <Textarea value={statusModal.reason} onChange={(e) => setStatusModal(prev => ({ ...prev, reason: e.target.value }))} rows={3} />
                  </FormControl>
                </>
              )}

              {(['LEFT','HOSPITALIZED'].includes(statusModal.status)) && (
                <>
                  <Text fontSize="sm">Provide a short reason for this status change.</Text>
                  <FormControl>
                    <FormLabel>Reason</FormLabel>
                    <Textarea value={statusModal.reason} onChange={(e) => setStatusModal(prev => ({ ...prev, reason: e.target.value }))} rows={3} />
                  </FormControl>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setStatusModal({ isOpen: false, status: null, reason: '', durationDays: '' })}>Cancel</Button>
            <Button colorScheme="blue" onClick={async () => {
              try {
                const status = statusModal.status;
                if (!patient?.appointment_id) throw new Error('No appointment selected');
                const meta = { ...(currentAppointment?.metadata || {}) };
                if (status === 'VACATION') {
                  const days = Number(statusModal.durationDays) || null;
                  meta.vacation_days = days;
                }
                if (status === 'DECEASED') {
                  meta.deceased_reason = statusModal.reason || null;
                  meta.deceased_location = statusModal.location || null;
                }
                if (status === 'LEFT' || status === 'HOSPITALIZED') {
                  meta.reason = statusModal.reason || null;
                }

                const res = await updateAppointment(patient.appointment_id, { status, metadata: meta });
                if (!res.success) throw new Error(res.data?.message || 'Failed to update appointment');

                // For VACATION, free up bed so others can use it
                if (status === 'VACATION' && bed?.id) {
                  try {
                    await updateBedStatus(bed.id, { status: 'EMPTY', notes: `Patient on VACATION for ${meta.vacation_days || 'N/A'} days` });
                  } catch (bedErr) {
                    console.warn('Failed to update bed state for vacation:', bedErr);
                  }
                }

                setAppointmentStatus(status);
                setCurrentAppointment(prev => ({ ...(prev || {}), status, metadata: meta }));
                setStatusModal({ isOpen: false, status: null, reason: '', durationDays: '' });
                showToast && showToast(`Appointment updated: ${status}`, 'success');
              } catch (err) {
                console.error('Failed to update appointment status:', err);
                alert(err?.message || 'Failed to update appointment status');
              }
            }}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  );
}
