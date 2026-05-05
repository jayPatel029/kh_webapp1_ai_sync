/**
 * Dialysis Appointments Page
 * Includes offline booking, payment recording (full/partial), refunds, and invoice previews.
 *
 * Available to: Manager, Technician, Frontdesk
 *
 * API Integration:
 *  - GET  /appointments              → getAppointments()
 *  - POST /appointments              → createAppointment()
 *  - PUT  /appointments/:id          → updateAppointment()
 *  - DELETE /appointments/:id        → deleteAppointment()
 *  - GET  /clinics                   → getClinics()
 *  - GET  /clinics/:id/appointments  → getClinicAppointments()
 *
 * @file src/pages/dialysis/DialysisAppointments.jsx
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Input,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Flex
} from '../../component-library';
import { FormModal } from '../../component-library/modals/FormModal';
import { BaseModal } from '../../component-library/modals/BaseModal';
import { ScheduleManager } from '../clinicManagement/components/ScheduleManager';
import DialysisAppointmentsDashboard from '../adminDashboard/components/DialysisAppointmentsDashboard';
import DialysisParametersModal from '../adminDashboard/components/DialysisParametersModal';
import PatientAppointmentTimeline from '../../components/PatientAppointmentTimeline';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import { useAdminToast } from '../../components/AdminToast';
import AppointmentStatusBadge from '../../components/AppointmentStatusBadge';
import PaymentModal from '../../components/PaymentModal';
import RefundModal from '../../components/RefundModal';
import InvoicePreview from '../../components/InvoicePreview';
import FileUploadWithCamera from '../../components/FileUploadWithCamera';
import usePaymentFlow from '../../hooks/usePaymentFlow';
import { getPaymentStatus, getOutstandingBalance } from '../../utils/refundCalculator';
import { generateBillPDF } from '../../utils/billGenerator';
import DownloadIcon from '../../assets/Download.svg';
import EditIcon from '../../assets/Edit.svg';
import DeleteIcon from '../../assets/Delete.svg';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  getAppointmentById,
  addAppointmentPayment,
  cancelAppointment,
  getClinics,
  getClinicById,
  getClinicAppointments,
  getOrganizationById,
  getOrganizations,
  getAvailableSlots,
  consumeAppointmentServices
} from '../../ApiCalls/clinicApis';
import { uploadFile } from '../../ApiCalls/dataUpload';
import { getPatients, getPatientAilments, getPatientById, getGeneralParameterResponse } from '../../ApiCalls/patientAPis';
import { getDoctors } from '../../ApiCalls/doctorApis';
import { jsPDF } from 'jspdf';
import ClinicSelector from '../../components/ClinicSelector';
import OrganizationSelector from '../../components/OrganizationSelector';
// import QuestionsContainer from '../../components/questions/QuestionsContainer';


// ─── Status colors ──────────────────────────────────────────
const STATUS_COLORS = {
  SCHEDULED: { bg: '#FEF9C3', text: '#854D0E' },
  BOOKED: { bg: '#FEF9C3', text: '#854D0E' },
  WAITING: { bg: '#FEF9C3', text: '#854D0E' },
  ARRIVED: { bg: '#F3E8FF', text: '#6B21A8' },
  IN_PROGRESS: { bg: '#DBEAFE', text: '#1E40AF' },
  COMPLETED: { bg: '#DCFCE7', text: '#166534' },
  CANCELLED: { bg: '#F3F4F6', text: '#6B7280' },
  MISSED: { bg: '#FEE2E2', text: '#991B1B' },
};

const STATUS_FLOW = {
  SCHEDULED: 'ARRIVED',
  BOOKED: 'ARRIVED',
  ARRIVED: 'WAITING',
  WAITING: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
};

const STATUS_LABELS = {
  ARRIVED: 'Arrived',
  WAITING: 'Waiting',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Complete',
};

function normalizeStatus(status) {
  const normalized = String(status || 'SCHEDULED').toUpperCase();
  if (normalized === 'CONFIRMED') return 'BOOKED';
  return normalized;
}

function toUtcIso(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const normalizedTime = timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr;
  const dt = new Date(`${dateStr}T${normalizedTime}`);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

/** Normalize backend row → table row */
const normalizeAppointment = (apt, patients) => {
  const patientData = patients.find(p => String(p.patient_id || p.id) === String(apt.patient_id));

  let parsedAilments = apt.patient_ailments || '';
  let metadata = {};
  if (typeof parsedAilments === 'string' && parsedAilments.startsWith('{')) {
    try {
      const parsed = JSON.parse(parsedAilments);
      metadata = parsed;
      parsedAilments = parsed.ailments || parsed.patientAilments || parsed.patient_ailments || '';
    } catch (e) { }
  }

  return {
    id: apt.id,
    created_date: (apt.appointment_date || apt.startUTC)
      ? formatDateDisplay(apt.appointment_date || apt.startUTC)
      : '—',
    appointment_date: apt.appointment_date || (apt.startUTC ? String(apt.startUTC).split('T')[0] : null),
    name: (() => {
      const directName = apt.patient_name || apt.patientName || patientData?.name;
      if (directName && directName !== '—') return directName;
      if (metadata.patientName) return metadata.patientName;
      return apt.patient_id ? `Patient #${apt.patient_id}` : '—';
    })(),
    doctor_name:
      apt.doctor_name ||
      apt.doctorName ||
      apt.primary_doctor_name ||
      (apt.primary_doctor_id ? `Doctor #${apt.primary_doctor_id}` : '—'),
    age: apt.age || apt.patient_age || patientData?.age || '—',
    gender: apt.gender || apt.patient_gender || patientData?.gender || '—',
    sex: apt.gender || apt.patient_gender || patientData?.gender || '—',
    phoneNumber:
      apt.phoneNumber || apt.phone_number || apt.patient_phone || apt.phone || patientData?.phone_no || patientData?.mobile_no || '—',
    mobile_no:
      apt.phoneNumber || apt.phone_number || apt.patient_phone || apt.phone || patientData?.phone_no || patientData?.mobile_no || '—',
    treatment_type: normalizeType(apt.appointment_type || apt.treatment_type || apt.bookingType),
    booking_time: apt.start_time
      ? formatTime12Hour(apt.start_time)
      : (apt.startUTC ? formatTime12Hour(String(apt.startUTC).split('T')[1]?.slice(0, 8)) : '—'),
    appointment_time: apt.start_time
      ? formatTime12Hour(apt.start_time)
      : (apt.startUTC ? formatTime12Hour(String(apt.startUTC).split('T')[1]?.slice(0, 8)) : '—'),
    status: normalizeStatus(apt.status || apt.appointmentStatus),
    reason: apt.reason || metadata.notes || metadata.notes_brief || '',
    patient_ailments: parsedAilments,
    patient_id: apt.patient_id,
    clinic_id: apt.clinic_id,
    clinic_name: apt.clinic_name || apt.clinic?.name || '',
    totalAmount: apt.totalAmount || apt.total_amt || apt.amountDue || 0,
    amountPaid: apt.amountPaid || apt.received_amt || apt.paidAmount || 0,
    paymentMethod: apt.paymentMethod || '',
    billPDFUrl: apt.billPDFUrl || apt.billUrl || null,
    receipt_url: apt.receiptUrl || apt.billPDFUrl || apt.billUrl || null,
    duration: (apt.start_time && apt.end_time)
      ? calculateDuration(apt.start_time, apt.end_time)
      : (apt.startUTC && apt.endUTC)
        ? calculateDuration(String(apt.startUTC).split('T')[1]?.slice(0, 5), String(apt.endUTC).split('T')[1]?.slice(0, 5))
        : '—',
    services: apt.services || [],
    bill_id: apt.bill_id || apt.billId || apt.invoice_id || apt.invoiceId,
    invoice_id: apt.bill_id || apt.billId || apt.invoice_id || apt.invoiceId,
    metadata: metadata,
    _raw: apt,
  };
};

function calculateDuration(start, end) {
  if (!start || !end) return '—';
  try {
    const sParts = start.split(':');
    const eParts = end.split(':');
    const sMin = parseInt(sParts[0], 10) * 60 + parseInt(sParts[1], 10);
    const eMin = parseInt(eParts[0], 10) * 60 + (parseInt(eParts[1], 10) || 0);
    let diff = eMin - sMin;
    if (diff < 0) diff += 24 * 60;
    if (diff <= 0) return '—';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  } catch { return '—'; }
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  } catch { return dateStr; }
}

function formatTime12Hour(timeStr) {
  if (!timeStr) return '—';
  try {
    const parts = timeStr.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  } catch { return timeStr; }
}

function normalizeType(type) {
  if (!type) return 'In Clinic';
  const lower = String(type).toLowerCase().replace(/[_-]/g, ' ');
  if (lower.includes('online')) return 'Online';
  return 'In Clinic';
}

/** Convert 12-hour "09:00 AM" → "09:00:00" */
function to24Hour(t) {
  if (!t) return '00:00:00';
  if (!t.includes('AM') && !t.includes('PM')) return t;
  const [timePart, period] = t.split(' ');
  const [hStr, mStr] = timePart.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}:00`;
}

function getDayOfWeek(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Monday';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function addMinutesToTime(timeStr, minutes) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return '';
  const hours = Number(parts[0]);
  const mins = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(mins)) return '';
  const date = new Date(0, 0, 0, hours, mins + Number(minutes));
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function buildSlotTemplates(raw) {
  const startTime = raw.start_time || (raw.startUTC ? String(raw.startUTC).split('T')[1]?.slice(0, 5) : '');
  const endTime = raw.end_time || (startTime ? addMinutesToTime(startTime, 30) : '');
  if (!startTime) return [];

  const appointmentDate = raw.appointment_date || (raw.startUTC ? String(raw.startUTC).split('T')[0] : null);
  return [{
    id: `slot-${Date.now()}`,
    frequency: 'weekly',
    daysOfWeek: [getDayOfWeek(appointmentDate || new Date().toISOString().split('T')[0])],
    dayOfMonth: null,
    startTime,
    endTime: endTime || '00:00',
    maxPatientsPerSlot: 1,
    bufferMinutes: 30,
    price: 0,
  }];
}

const RECURRENCE_SESSION_LIMITS = {
  weekly: 15,
  'bi-weekly': 5,
  monthly: 5,
};

function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  const parsed = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateOnly(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + Number(days || 0));
  return next;
}

function matchesRecurringDate(template, currentDate, anchorDate) {
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const selectedDays = Array.isArray(template.daysOfWeek) ? template.daysOfWeek : [];
  const templateDayOfMonth = Number(template.dayOfMonth || 0);
  const templateFrequency = String(template.frequency || 'weekly').toLowerCase();

  if (templateFrequency === 'one-time') {
    return formatDateOnly(currentDate) === formatDateOnly(anchorDate);
  }

  if (templateFrequency === 'monthly' || templateDayOfMonth > 0) {
    const templateDay = templateDayOfMonth || anchorDate.getDate();
    return currentDate.getDate() === templateDay;
  }

  if (selectedDays.length > 0 && !selectedDays.includes(dayName)) {
    return false;
  }

  if (templateFrequency === 'bi-weekly') {
    const diffDays = Math.floor((currentDate.getTime() - anchorDate.getTime()) / 86400000);
    if (diffDays < 0) return false;
    const weekOffset = Number(template.weekOffset || 0);
    return Math.floor(diffDays / 7) % 2 === weekOffset;
  }

  return true;
}

function buildPlannedSessions({
  slotTemplates = [],
  bookingMode = 'continuous',
  appointmentDate,
  customStartDate,
  customEndDate,
}) {
  const templates = Array.isArray(slotTemplates) ? slotTemplates : [];
  if (!templates.length) return [];

  const normalizedMode = String(bookingMode || 'continuous').toLowerCase();
  const sessions = [];

  templates.forEach((template) => {
    const frequency = String(template.frequency || 'weekly').toLowerCase();
    const limit = frequency === 'one-time' ? 1 : (RECURRENCE_SESSION_LIMITS[frequency] || 15);
    const baseDate = parseDateOnly(
      template.date || appointmentDate || customStartDate || new Date().toISOString().split('T')[0]
    );
    if (!baseDate) return;

    const rangeStart = normalizedMode === 'customized'
      ? parseDateOnly(customStartDate || formatDateOnly(baseDate))
      : baseDate;
    const rangeEnd = normalizedMode === 'customized'
      ? parseDateOnly(customEndDate || customStartDate || appointmentDate)
      : null;

    if (normalizedMode === 'customized' && (!rangeStart || !rangeEnd || rangeEnd < rangeStart)) {
      return;
    }

    let current = new Date(rangeStart);
    const safetyLimit = normalizedMode === 'customized' ? 370 : 730;
    let safety = 0;

    while (safety < safetyLimit) {
      if (normalizedMode === 'customized' && current > rangeEnd) break;

      if (matchesRecurringDate(template, current, baseDate)) {
        const startTime = template.startTime || '09:00';
        const endTime = template.endTime || addMinutesToTime(startTime, 30) || '09:30';
        sessions.push({
          templateId: template.id,
          slotId: template.slot_id,
          date: formatDateOnly(current),
          startUTC: `${formatDateOnly(current)}T${startTime}:00.000Z`,
          endUTC: `${formatDateOnly(current)}T${endTime}:00.000Z`,
          startTime,
          endTime,
          frequency,
          daysOfWeek: template.daysOfWeek || [],
          dayOfMonth: template.dayOfMonth || null,
          weekOffset: template.weekOffset || null,
        });

        if (normalizedMode === 'continuous' && sessions.filter((s) => s.templateId === template.id).length >= limit) {
          break;
        }
      }

      current = addDays(current, 1);
      safety += 1;
    }
  });

  return sessions;
}

function countPlannedSessions(args) {
  return buildPlannedSessions(args).length;
}

// ─── Action Button ──────────────────────────────────────────
const ActionIconBtn = ({ icon, onClick, disabled = false, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: '4px',
      background: 'transparent',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transition: 'all 0.15s',
      ...style
    }}
  >
    <img src={icon} alt="action" style={{ width: '18px', height: '18px' }} />
  </button>
);

const DialysisAppointments = () => {
  const { isMobile } = useIsMobile();
  const { showToast, ToastContainer } = useAdminToast();

  // ─── Data state ───────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Clinic state ─────────────────────────────────────
  const [clinics, setClinics] = useState([]);
  const [patients, setPatients] = useState([]);
  const [clinicsLoading, setClinicsLoading] = useState(false);

  // ─── Filter state ─────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');

  // ─── Create modal state (3 steps) ─────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1); // 1, 2, or 3
  const [savedAppointment, setSavedAppointment] = useState(null); // for step 3 preview
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const defaultForm = {
    patient_id: '1',
    clinic_id: '',
    clinic_name: '',
    appointment_date: today,
    booking_mode: 'continuous',
    custom_start_date: today,
    custom_end_date: '',
    start_time: '',
    end_time: '',
    appointment_type: 'in_clinic',
    doctor_id: '',
    is_emergency: false,
    reason: '',
    patient_ailments: '',
    slotTemplates: [], // Added for recurring/multi-slot support
    total_amount: '',
    payment_option: 'full',
    payment_method: 'cash',
    amount_paid: '',
    receipt_file: null,
    duration: '4',
  };

  const [createForm, setCreateForm] = useState(defaultForm);
  const [receiptItems, setReceiptItems] = useState([]);
  const [createFieldErrors, setCreateFieldErrors] = useState({});
  const [createErrorMessage, setCreateErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [timelinePatientId, setTimelinePatientId] = useState(null);

  const [sessionModal, setSessionModal] = useState({
    isOpen: false,
    patient: null,
    bed: null
  });
  const [statusModal, setStatusModal] = useState({ isOpen: false, row: null });

  // --- External Data ---
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [selectedClinicData, setSelectedClinicData] = useState(null);
  const [clinicAppointments, setClinicAppointments] = useState([]);
  const [clinicServices, setClinicServices] = useState([]);
  const [addedServices, setAddedServices] = useState([]);
  const [currentService, setCurrentService] = useState({ name: '', price: 0, discount: 0 });

  const plannedSessions = useMemo(() => {
    if (isEditOpen) return createForm.slotTemplates || [];
    return buildPlannedSessions({
      slotTemplates: createForm.slotTemplates,
      bookingMode: createForm.booking_mode,
      appointmentDate: createForm.appointment_date,
      customStartDate: createForm.custom_start_date,
      customEndDate: createForm.custom_end_date,
    });
  }, [
    createForm.slotTemplates,
    createForm.booking_mode,
    createForm.appointment_date,
    createForm.custom_start_date,
    createForm.custom_end_date,
    isEditOpen,
  ]);

  const plannedSessionCount = isEditOpen
    ? Math.max(createForm.slotTemplates.length, 1)
    : plannedSessions.length;

  // ─── Filtered Patients for Dialysis ───────────────────
  const dialysisPatients = useMemo(() => {
    return patients.filter((p) => {
      const rawAilments = p.ailments || p.patient_ailments || p.aliments || p.medical_history || '';
      const ailmentsStr = Array.isArray(rawAilments) ? rawAilments.join(', ') : String(rawAilments);
      const ailments = ailmentsStr.toLowerCase();
      return ailments.includes('dialysis') || ailments.includes('hemodialysis') || ailments.includes('hemo dialysis');
    });
  }, [patients]);

  const handleOpenSession = useCallback((app) => {
    setSessionModal({
      isOpen: true,
      patient: {
        id: app.id,
        patient_id: app.patientId,
        patient_name: app.patientName,
        appointment_id: app.id
      },
      bed: {
        id: app.bedId,
        bed_number: '—' // Will be fetched by modal or shown as placeholder
      }
    });
  }, []);

  // --- Fetch Patients & Doctors ---
  useEffect(() => {
    const loadData = async () => {
      const [pts, docs] = await Promise.all([getPatients(), getDoctors()]);
      if (pts.success) {
        const allPatients = pts.data?.data || pts.data || [];
        setPatients(Array.isArray(allPatients) ? allPatients : []);
      }
      if (docs.success) {
        const allDocs = docs.data?.data || docs.data || [];
        setDoctors(Array.isArray(allDocs) ? allDocs : []);
      }
    };
    loadData();
  }, []);

  const handleBookFromDashboard = useCallback((slot) => {
    setIsDashboardOpen(false);
    resetCreateModal();

    const dateStr = slot.start.toISOString().split('T')[0];
    const startTimeStr = slot.start.toISOString().split('T')[1].slice(0, 5);
    const endTimeStr = slot.end.toISOString().split('T')[1].slice(0, 5);

    const chosenClinic = clinics.find(c => String(c.id) === String(slot.clinicId));

    setCreateForm(prev => ({
      ...prev,
      clinic_id: slot.clinicId,
      clinic_name: chosenClinic ? (chosenClinic.name || chosenClinic.clinic_name) : '',
      appointment_date: dateStr,
      custom_start_date: dateStr,
      custom_end_date: '',
      booking_mode: 'continuous',
      slotTemplates: [{
        daysOfWeek: [new Date(dateStr).toLocaleString('default', { weekday: 'long' })],
        startTime: startTimeStr,
        endTime: endTimeStr,
        frequency: 'one-time',
        slot_id: slot.slotId
      }],
      duration: calculateDuration(startTimeStr, endTimeStr).replace('h', '').replace('m', '').trim() || '4'
    }));

    setIsCreateOpen(true);
  }, [clinics]);

  // --- Fetch Clinic Services when clinic changes ---
  useEffect(() => {
    if (!createForm.clinic_id) {
      setClinicServices([]);
      return;
    }
    (async () => {
      const [clinicRes, aptsRes] = await Promise.all([
        getClinicById(createForm.clinic_id),
        getClinicAppointments(createForm.clinic_id)
      ]);
      if (clinicRes.success) {
        const fullClinic = clinicRes.data?.data || clinicRes.data;
        const services = fullClinic.services || [];
        setClinicServices(services);
        setSelectedClinicData(fullClinic);
        setCreateForm(prev => ({
          ...prev,
          duration: String(fullClinic.defaultDuration || 4)
        }));

        const dialysisService = services.find((s) => {
          const serviceName = String(s.name || s.service_name || '').toLowerCase();
          return serviceName.includes('dialysis');
        });

        if (dialysisService) {
          setCurrentService((prev) => prev.name ? prev : ({
            name: dialysisService.name || dialysisService.service_name || 'Dialysis',
            price: Number(dialysisService.amount || dialysisService.price || 0),
            discount: Number(dialysisService.discount || 0),
            service_id: dialysisService.id || dialysisService.service_id || null,
          }));
        }
      }
      if (aptsRes.success) {
        setClinicAppointments(aptsRes.data?.data || aptsRes.data || []);
      }
    })();
  }, [createForm.clinic_id]);

  // --- Fetch Patient details when patient changes ---
  useEffect(() => {
    if (!createForm.patient_id) {
      setSelectedPatientData(null);
      return;
    }
    (async () => {
      // 1. Fetch Patient profile and ailments list first
      const [pRes, aRes] = await Promise.all([
        getPatientById(createForm.patient_id),
        getPatientAilments(createForm.patient_id),
      ]);

      let patientData = null;
      if (pRes.success) {
        patientData = pRes.data?.data || pRes.data;
        setSelectedPatientData(patientData);
      }

      let fetchedAilments = '';
      let ailmentNames = [];
      if (aRes.success) {
        ailmentNames = Array.isArray(aRes.data)
          ? aRes.data.map(a => a.ailment_name)
          : (aRes.data?.ailments ? aRes.data.ailments.split(',').map(s => s.trim()) : []);
        fetchedAilments = ailmentNames.join(', ');
      }

      // 2. Fetch general parameters for all identified ailments to prefill the form
      let combinedInfo = [];
      if (ailmentNames.length > 0) {
        try {
          const responsePromises = ailmentNames.map(name => getGeneralParameterResponse(name, createForm.patient_id));
          const allRes = await Promise.all(responsePromises);

          allRes.forEach((r, idx) => {
            if (r.success && Array.isArray(r.data)) {
              const dryWeight = r.data.find(q => q.name?.toLowerCase().includes('dry weight'));
              if (dryWeight && dryWeight.response) {
                combinedInfo.push(`Dry Weight (${ailmentNames[idx]}): ${dryWeight.response} kg`);
              }
            }
          });
        } catch (e) {
          console.error("Error fetching multi-ailment responses:", e);
        }
      }

      // 3. Update form state
      setCreateForm(prev => ({
        ...prev,
        patient_ailments: fetchedAilments,
        reason: prev.reason || combinedInfo.join(' | '),
        doctor_id: prev.doctor_id || patientData?.primary_doctor_id || ''
      }));
    })();
  }, [createForm.patient_id]);

  // --- Auto-select first available slot when date/clinic changes ---
  useEffect(() => {
    if (!createForm.clinic_id || !createForm.appointment_date || isEditOpen) return;

    const autoSelectSlot = async () => {
      try {
        const from = `${createForm.appointment_date}T00:00:00Z`;
        const to = `${createForm.appointment_date}T23:59:59Z`;
        const res = await getAvailableSlots(createForm.clinic_id, from, to);

        if (res.success && Array.isArray(res.data)) {
          setAvailableSlots(res.data);
          if (res.data.length > 0) {
            const firstSlot = res.data[0];
            // Check if already selected or different
            const currentSlots = createForm.slotTemplates;
            if (currentSlots.length === 0 || currentSlots[0].startTime !== firstSlot.start_time) {
              setCreateForm(prev => ({
                ...prev,
                slotTemplates: [{
                  id: `slot-${firstSlot.id || Date.now()}`,
                  frequency: 'weekly',
                  daysOfWeek: [getDayOfWeek(createForm.appointment_date)],
                  dayOfMonth: null,
                  startTime: firstSlot.start_time || firstSlot.startTime,
                  endTime: addMinutesToTime(firstSlot.start_time || firstSlot.startTime, Number(createForm.duration || 4) * 60),
                  maxPatientsPerSlot: firstSlot.maxPatientsPerSlot || 1,
                  bufferMinutes: 30,
                  price: firstSlot.price || 0,
                  slot_id: firstSlot.id
                }]
              }));
            }
          }
        }
      } catch (err) {
        console.error("Error auto-selecting slot:", err);
      }
    };

    autoSelectSlot();
  }, [createForm.clinic_id, createForm.appointment_date, isEditOpen, createForm.duration]);

  // --- Update slot end times when duration changes ---
  useEffect(() => {
    if (createForm.slotTemplates.length === 0) return;

    setCreateForm(prev => {
      const updated = prev.slotTemplates.map(slot => {
        if (!slot.startTime) return slot;
        const newEndTime = addMinutesToTime(slot.startTime, Number(prev.duration || 4) * 60);
        if (slot.endTime === newEndTime) return slot;
        return { ...slot, endTime: newEndTime };
      });

      // Check if actually changed to avoid infinite loop
      const changed = updated.some((s, i) => s.endTime !== prev.slotTemplates[i].endTime);
      if (!changed) return prev;

      return { ...prev, slotTemplates: updated };
    });
  }, [createForm.duration]);

  // --- Calculate total bill from added services and sessions ---
  useEffect(() => {
    const sessionCount = Math.max(plannedSessionCount, 1);
    const paidSessionCount = createForm.sessions_to_pay !== undefined 
      ? Number(createForm.sessions_to_pay) 
      : sessionCount;

    // Total bill is ALWAYS for all planned sessions
    const total = addedServices.reduce((sum, s) => {
      const price = Number(s.price) || 0;
      const discount = Number(s.discount) || 0;
      const netPrice = price - (price * discount / 100);
      return sum + (netPrice * sessionCount);
    }, 0);

    // Amount paid is for the selected number of sessions
    const amountPaid = addedServices.reduce((sum, s) => {
      const price = Number(s.price) || 0;
      const discount = Number(s.discount) || 0;
      const netPrice = price - (price * discount / 100);
      return sum + (netPrice * paidSessionCount);
    }, 0);
    
    setCreateForm(prev => {
      if (prev.total_amount === total && prev.amount_paid === amountPaid && prev.sessions_to_pay === paidSessionCount) return prev;
      return { 
        ...prev, 
        total_amount: total, 
        amount_paid: amountPaid,
        sessions_to_pay: paidSessionCount
      };
    });
  }, [addedServices, plannedSessionCount, createForm.sessions_to_pay]);

  // ─── Standalone invoice preview state ─────────────────
  const [invoiceTarget, setInvoiceTarget] = useState(null);

  const fetchInitialData = useCallback(async () => {
    setClinicsLoading(true);
    try {
      const [orgsResult, clinicsResult, patientsResult] = await Promise.all([
        getOrganizations(),
        getClinics(),
        getPatients(),
      ]);

      if (orgsResult.success) {
        const orgList = Array.isArray(orgsResult.data?.data) ? orgsResult.data.data : (orgsResult.data || []);
        setOrganizations(orgList);
      }

      if (clinicsResult.success) {
        const list = Array.isArray(clinicsResult.data?.data) ? clinicsResult.data.data : (clinicsResult.data || []);
        setClinics(list);
      }
    } catch (err) {
      console.warn('Could not fetch initial data:', err);
    } finally {
      setClinicsLoading(false);
    }
  }, [selectedOrgId, selectedClinicId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Handle clinic reset when organization changes
  useEffect(() => {
    if (selectedOrgId && clinics.length > 0) {
      const orgClinics = clinics.filter(c => String(c.organization_id || c.org_id) === String(selectedOrgId));
      if (orgClinics.length > 0) {
        const isCurrentInOrg = orgClinics.some(c => String(c.id) === String(selectedClinicId));
        if (!isCurrentInOrg) {
          setSelectedClinicId(String(orgClinics[0].id));
        }
      } else {
        setSelectedClinicId('');
      }
    } else {
      setSelectedClinicId('');
    }
  }, [selectedOrgId, clinics, selectedClinicId]);

  // ─── Fetch appointments ───────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (selectedClinicId) {
        result = await getClinicAppointments(selectedClinicId);
      } else {
        result = await getAppointments({
          from: `${fromDate}T00:00:00Z`,
          to: `${toDate}T23:59:59Z`,
          orgid: selectedOrgId || undefined,
        });
      }

      if (result.success) {
        let rows = Array.isArray(result.data?.data)
          ? result.data.data
          : Array.isArray(result.data)
            ? result.data
            : [];
            
        // Filter by date for getClinicAppointments which returns all appointments
        if (selectedClinicId && fromDate && toDate) {
          const fromTime = new Date(`${fromDate}T00:00:00`).getTime();
          const toTime = new Date(`${toDate}T23:59:59`).getTime();
          
          rows = rows.filter(apt => {
            const dateStr = apt.appointment_date || apt._raw?.appointment_date || apt.startUTC?.split('T')[0] || apt._raw?.startUTC?.split('T')[0];
            if (!dateStr) return true; // Keep if we can't determine the date
            
            const aptTime = new Date(`${dateStr}T00:00:00`).getTime();
            return aptTime >= fromTime && aptTime <= toTime;
          });
        }

        setAppointments(rows.map(apt => normalizeAppointment(apt, patients)));
      } else {
        const msg = result.data?.message || 'Failed to load appointments';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      const msg = err?.message || 'Network error loading appointments';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedClinicId, selectedOrgId, patients, showToast]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // ─── Payment flow hook ────────────────────────────────
  const {
    paymentModal,
    openPaymentModal,
    closePaymentModal,
    updatePaymentField,
    submitPayment,
    refundModal,
    openRefundModal,
    closeRefundModal,
    processRefund,
    pdfLoading,
  } = usePaymentFlow({
    onPaymentAdded: async (appt, amount, method, billPDFUrl) => {
      // 1. Fetch fresh details first to ensure we have current balance
      const freshRes = await getAppointmentById(appt.id);
      const freshAppt = freshRes.success ? (freshRes.data?.data || freshRes.data) : appt;

      // 2. Record the payment
      const result = await addAppointmentPayment(appt.id, {
        amount: Number(amount),
        method: String(method || 'cash').toUpperCase(),
        receiptUrl: billPDFUrl || undefined,
      });

      if (result.success) {
        // 3. If not fully paid, update appointment metadata
        const updatedPaid = Number(freshAppt.amountPaid || freshAppt.received_amt || 0) + Number(amount);
        const totalDue = Number(freshAppt.totalAmount || freshAppt.amountDue || 0);

        if (updatedPaid < totalDue) {
          await updateAppointment(appt.id, {
            metadata: {
              ...(freshAppt.metadata || {}),
              payment_status: 'PENDING',
              last_payment_date: new Date().toISOString(),
              outstanding_balance: totalDue - updatedPaid
            }
          });
        }

        showToast(`Payment of ₹${amount} successful`, 'success');
        fetchAppointments();
      } else {
        showToast(result.data?.message || 'Failed to process dialysis billing', 'error');
      }
    },
    onRefundProcessed: async (apptId, refundAmount, refundPDFUrl) => {
      const result = await cancelAppointment(apptId, {
        reason: 'Refund processed during cancellation',
        refundAmount: Number(refundAmount) || 0,
        refundUrl: refundPDFUrl || undefined,
      });

      if (result.success) {
        showToast(
          `Appointment cancelled. Refund of ₹${refundAmount} processed.`,
          'success'
        );
        fetchAppointments();
      } else {
        showToast(result.data?.message || 'Failed to cancel appointment', 'error');
      }
    },
  });

  // ─── Filtered list ────────────────────────────────────
  const filtered = useMemo(() => {
    let list = appointments;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.phoneNumber.includes(q) ||
          a.doctor_name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [appointments, searchQuery]);

  // ─── Stats ─────────────────────────────────────────────
  const total = filtered.length;
  const pending = filtered.filter((a) => ['BOOKED', 'ARRIVED', 'SCHEDULED'].includes(a.status)).length;
  const completed = filtered.filter((a) => a.status === 'COMPLETED').length;
  const unpaidCount = filtered.filter((a) => {
    let payStatus = String(a._raw?.payment_action || a._raw?.paymentAction || '').toUpperCase();
    if (!payStatus || payStatus === 'UNDEFINED') {
      payStatus = getPaymentStatus(a.totalAmount, a.amountPaid);
    }
    return payStatus !== 'PAID';
  }).length;
  const paidCount = filtered.filter((a) => {
    let payStatus = String(a._raw?.payment_action || a._raw?.paymentAction || '').toUpperCase();
    if (!payStatus || payStatus === 'UNDEFINED') {
      payStatus = getPaymentStatus(a.totalAmount, a.amountPaid);
    }
    return payStatus === 'PAID';
  }).length;

  // ─── Status update ────────────────────────────────────
  const handleStatusUpdate = useCallback(
    async (apt, newStatus, skipConfirm = false) => {
      // allow callers to bypass the confirm dialog by passing skipConfirm = true
      if (!skipConfirm && !window.confirm(`Update appointment #${apt.id} to "${newStatus}"?`)) return;
      const result = await updateAppointment(apt.id, { status: newStatus });
      if (result.success) {
        showToast(`Appointment #${apt.id} → ${newStatus}`, 'success');
        fetchAppointments();
      } else {
        showToast(result.data?.message || 'Failed to update', 'error');
      }
    },
    [fetchAppointments, showToast]
  );

  // Auto-convert ARRIVED -> WAITING when appointment start time is reached and payment is PAID
  useEffect(() => {
    let mounted = true;
    const checkAndConvert = async () => {
      if (!mounted) return;
      try {
        const now = new Date();
        for (const apt of appointments) {
          try {
            if (!apt) continue;
            const status = String(apt.status || '').toUpperCase();
            if (status !== 'ARRIVED') continue;

            // determine appointment start time (prefer startUTC)
            let startIso = null;
            if (apt._raw && (apt._raw.startUTC || apt._raw.start_utc)) {
              startIso = apt._raw.startUTC || apt._raw.start_utc;
            } else if (apt.appointment_date && apt._raw && apt._raw.start_time) {
              // combine date + start_time
              const t24 = to24Hour(String(apt._raw.start_time || apt._raw.startTime || apt.start_time || '00:00'));
              startIso = `${apt.appointment_date}T${t24}`;
            }

            if (!startIso) continue;
            const startDate = new Date(startIso);
            if (Number.isNaN(startDate.getTime())) continue;

            // only convert when start time has been reached
            if (now < startDate) continue;

            // determine payment status: prefer raw.payment_action else compute
            let payStatus = String(apt._raw?.payment_action || apt._raw?.paymentAction || '').toUpperCase();
            if (!payStatus || payStatus === 'UNDEFINED') {
              payStatus = getPaymentStatus(apt.totalAmount, apt.amountPaid);
            }
            if (String(payStatus).toUpperCase() !== 'PAID') continue;

            // convert to WAITING
            // use handleStatusUpdate to perform API update without prompting
            await handleStatusUpdate(apt, 'WAITING', true);
          } catch (err) {
            console.warn('Auto-convert check failed for apt', apt?.id, err);
          }
        }
      } catch (err) {
        console.error('Auto-convert ARRIVED->WAITING error:', err);
      }
    };

    const timer = setInterval(checkAndConvert, 30 * 1000); // every 30s
    // run immediately on mount
    checkAndConvert();

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [appointments, handleStatusUpdate]);

  // ─── Simple cancel (no refund) ────────────────────────
  const handleSimpleCancel = useCallback(
    async (apt) => {
      const reason = window.prompt('Cancellation reason (required):');
      if (!reason || !reason.trim()) return;
      const result = await cancelAppointment(apt.id, {
        reason: reason.trim(),
        refundAmount: 0,
      });
      if (result.success) {
        showToast(`Appointment #${apt.id} cancelled`, 'success');
        fetchAppointments();
      } else {
        showToast(result.data?.message || 'Failed to cancel', 'error');
      }
    },
    [fetchAppointments, showToast]
  );

  // ─── Reset create modal ───────────────────────────────
  const resetCreateModal = useCallback(() => {
    setCreateStep(1);
    setSavedAppointment(null);
    setCreateFieldErrors({});
    setCreateErrorMessage('');
    setIsEditOpen(false);

    // Auto-select clinic from filter if available, else if only one exists
    let preClinic = { clinic_id: '', clinic_name: '' };
    if (selectedClinicId) {
      const chosen = clinics.find((c) => String(c.id) === String(selectedClinicId));
      if (chosen) {
        preClinic = { clinic_id: String(chosen.id), clinic_name: chosen.name || 'Clinic' };
      }
    } else if (clinics.length === 1) {
      preClinic = { clinic_id: String(clinics[0].id), clinic_name: clinics[0].name || 'Clinic' };
    }

    setCreateForm({ ...defaultForm, appointment_date: today, ...preClinic });
    setReceiptItems([]);
    setAddedServices([]);
    setCurrentService({ name: '', price: 0, discount: 0 });
  }, [clinics, today, defaultForm, selectedClinicId]);

  // ─── Edit Open ────────────────────────────────────────
  const handleEditOpen = useCallback(async (apt) => {
    const aptId = apt.id;
    if (!aptId) return;

    setLoading(true);
    const res = await getAppointmentById(aptId);
    setLoading(false);

    if (!res.success) {
      showToast('Failed to fetch appointment details', 'error');
      return;
    }

    const fullAppt = res.data?.appointment || res.data?.data || res.data;
    const raw = fullAppt;

    // Parse metadata from patient_ailments if it's JSON
    let metadata = {};
    let displayAilments = raw.patient_ailments || '';
    if (typeof displayAilments === 'string' && displayAilments.startsWith('{')) {
      try {
        metadata = JSON.parse(displayAilments);
        displayAilments = metadata.ailments || metadata.patientAilments || '';
      } catch (e) { }
    }

    const slotTemplates = raw.slotTemplates || buildSlotTemplates(raw);
    const reason = raw.reason || metadata.notes || metadata.notes_brief || '';
    const totalAmount = raw.total_amount || raw.amountDue || raw.total_amt || 0;
    const amountPaid = raw.amount_paid || raw.paidAmount || raw.received_amt || 0;
    const paymentMethod = raw.paymentMethod || raw.payment_method || metadata.paymentMethod || 'cash';
    const doctorId = raw.doctor_id || raw.doctorId || raw.primary_doctor_id || '';

    setCreateFieldErrors({});
    setCreateErrorMessage('');
    setSavedAppointment(null);

    setReceiptItems([]);
    setCreateForm({
      ...defaultForm,
      id: raw.id,
      patient_id: String(raw.patient_id || ''),
      org_id: String(raw.organization_id || raw.org_id || ''),
      clinic_id: String(raw.clinic_id || ''),
      clinic_name: raw.clinic_name || clinics.find(c => String(c.id) === String(raw.clinic_id))?.clinic_name || '',
      appointment_date: raw.appointment_date || (raw.startUTC ? String(raw.startUTC).split('T')[0] : today),
      custom_start_date: raw.recurrence?.startDate || raw.appointment_date || (raw.startUTC ? String(raw.startUTC).split('T')[0] : today),
      custom_end_date: raw.recurrence?.endDate || '',
      booking_mode: raw.metadata?.booking_mode || raw.metadata?.slot_type || 'continuous',
      start_time: raw.start_time || (raw.startUTC ? String(raw.startUTC).split('T')[1]?.slice(0, 5) : ''),
      end_time: raw.end_time || '',
      appointment_type: raw.appointment_type || raw.treatment_type || 'in_clinic',
      doctor_id: doctorId,
      is_emergency: Boolean(raw.is_emergency),
      reason,
      patient_ailments: displayAilments,
      slotTemplates,
      total_amount: totalAmount,
      amount_paid: amountPaid,
      payment_option: amountPaid >= totalAmount ? 'full' : 'partial',
      payment_method: String(paymentMethod).toLowerCase(),
      receipt_file: null,
      duration: metadata.dialysisDuration || '4',
    });

    const fetchedServices = (raw.services || []).map((s, idx) => ({
      name: s.service_name || s.name,
      price: s.amount || s.price,
      discount: s.discount || 0,
      service_id: s.service_id || s.id,
      id: s.id,
      ui_key: `old-${idx}`
    }));
    
    setAddedServices(fetchedServices);
    setCreateStep(1);
    setIsEditOpen(true);
    setIsCreateOpen(true);
  }, [today, defaultForm, showToast]);

  // ─── Step 1 → Step 2 ─────────────────────────────────
  const handleNextStep1 = () => {
    const errors = {};
    if (!createForm.patient_id) errors.patient_id = 'Patient ID is required';
    if (!createForm.appointment_date) errors.appointment_date = 'Start Date is required';
    if (createForm.slotTemplates.length === 0) errors.start_time = 'At least one timing slot is required';
    if (createForm.booking_mode === 'customized' && !createForm.custom_start_date) errors.custom_start_date = 'Start date is required for customized booking';
    if (createForm.booking_mode === 'customized' && !createForm.custom_end_date) errors.custom_end_date = 'End date is required for customized booking';
    if (createForm.booking_mode === 'customized' && createForm.custom_start_date && createForm.custom_end_date && createForm.custom_end_date < createForm.custom_start_date) {
      errors.custom_end_date = 'End date must be on or after start date';
    }
    if (!createForm.total_amount) errors.total_amount = 'Bill Amount is required';

    if (Object.keys(errors).length > 0) {
      setCreateFieldErrors(errors);
      setCreateErrorMessage('Please fill all required fields');
      return;
    }
    setCreateFieldErrors({});
    setCreateErrorMessage('');
    setCreateStep(2);
  };

  // ─── Create/Edit Appointment Action ──────────────────
  const handleCreate = async () => {
    if (createStep === 1) {
      handleNextStep1();
      return;
    }

    try {
      setSubmitting(true);
      setCreateErrorMessage('');

      const servicesSummary = addedServices.map(s => `${s.name} (₹${s.price - (s.price * s.discount / 100)})`).join(', ');
      const finalPaid = Number(createForm.amount_paid) || 0;

      const sessionsSource = isEditOpen
        ? createForm.slotTemplates
        : plannedSessions;

      const sessions = sessionsSource.map(slot => {
        let slotId = slot.slot_id || slot.slotId;
        if (!slotId && availableSlots.length > 0) {
          const match = availableSlots.find(s => s.startTime === (slot.startTime));
          if (match) slotId = match.id;
        }

        const sDate = slot.date || createForm.appointment_date;
        const sStart = slot.startTime || '09:00';
        const sEnd = slot.endTime || '13:00';

        return {
          startUTC: `${sDate}T${sStart}:00.000Z`,
          endUTC: `${sDate}T${sEnd}:00.000Z`,
          slotId: slotId && !String(slotId).startsWith('slot-') ? slotId : undefined,
        };
      });

      if (!sessions.length && !isEditOpen) {
        setCreateErrorMessage('No appointments could be generated from the selected schedule.');
        return;
      }

      const sessionsToPay = createForm.sessions_to_pay !== undefined 
        ? Number(createForm.sessions_to_pay) 
        : Math.max(sessions.length, 1);

      const payload = {
        clinicId: Number(createForm.clinic_id),
        patientId: Number(createForm.patient_id),
        sessions,
        paySessions: sessionsToPay, // Global flag for backend to mark the first N appointments as PAID
        services: addedServices.map(s => ({
          ...s,
          amount: s.price - (s.price * s.discount / 100),
          quantity: Math.max(sessions.length, 1), // Bill represents ALL planned sessions
          pay_sessions: sessionsToPay // Per-service flag for backward compatibility
        })),
        bookingType: 'offline',
        amountDue: Number(createForm.total_amount),
        recurrence: createForm.slotTemplates[0] ? {
          mode: createForm.booking_mode,
          frequency: createForm.slotTemplates[0].frequency,
          daysOfWeek: createForm.slotTemplates[0].daysOfWeek,
          dayOfMonth: createForm.slotTemplates[0].dayOfMonth,
          weekOffset: createForm.slotTemplates[0].weekOffset || null,
          startDate: createForm.booking_mode === 'customized' ? createForm.custom_start_date : createForm.appointment_date,
          endDate: createForm.booking_mode === 'customized' ? createForm.custom_end_date : null,
          autoBookWhenRemaining: 5,
        } : undefined,
        metadata: {
          notes: servicesSummary,
          notes_brief: createForm.reason,
          patientAilments: createForm.patient_ailments,
          services: addedServices,
          dialysisDuration: createForm.duration,
          booking_mode: createForm.booking_mode,
          autoBookThreshold: 5,
          recurrenceLimit: createForm.booking_mode === 'customized'
            ? null
            : RECURRENCE_SESSION_LIMITS[String(createForm.slotTemplates[0]?.frequency || 'weekly').toLowerCase()] || 15,
        },
        automation: {
          autoBookWhenRemaining: 5,
        },
      };

      let receiptUrl = null;
      const receiptFile = createForm.receipt_file;
      if (receiptFile) {
        const formData = new FormData();
        formData.append('file', receiptFile);
        const uploadRes = await uploadFile(formData);
        if (uploadRes.success) {
          receiptUrl = uploadRes.data?.url || uploadRes.data?.file_url || uploadRes.data?.objectUrl || null;
        } else {
          console.warn('Appointment receipt upload failed', uploadRes.data || uploadRes);
        }
      }

      if (!isEditOpen && finalPaid > 0) {
        payload.immediatePayment = {
          amount: finalPaid,
          method: String(createForm.payment_method || 'cash').toUpperCase(),
          ...(receiptUrl ? { receiptUrl } : {}),
        };
      }

      if (receiptUrl) {
        payload.receiptUrl = receiptUrl;
        payload.metadata = {
          ...payload.metadata,
          receiptUrl,
        };
      }

      let result;
      if (isEditOpen) {
        result = await updateAppointment(createForm.id, {
          ...payload,
          patient_ailments: createForm.patient_ailments,
        });
      } else {
        result = await createAppointment(payload);
      }

      if (result.success) {
        showToast(isEditOpen ? 'Appointment updated!' : 'Appointments booked!', 'success');
        fetchAppointments();

        if (isEditOpen) {
          setIsCreateOpen(false);
          resetCreateModal();
        } else {
          const firstAppt = result.data?.data || result.data || {};
          const saved = {
            ...firstAppt,
            patient_id: createForm.patient_id,
            clinic_id: createForm.clinic_id,
            appointment_date: createForm.appointment_date,
            start_time: createForm.slotTemplates[0]?.startTime || '00:00',
            duration: createForm.duration,
            metadata: payload.metadata,
          };
          setSavedAppointment(normalizeAppointment(saved, patients));
          setCreateStep(3);
        }
      } else {
        const errorResult = result;
        const code = errorResult?.data?.code;
        if (code === 'APPT_CONFLICT') {
          const conflictList = errorResult?.data?.details?.conflicts || [];
          const conflictMsg = conflictList.length > 0 
            ? `Time conflict: Patient already has an appointment on this date at ${new Date(conflictList[0].startUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
            : (errorResult?.data?.message || 'Slot capacity reached. Please select a different timing.');
          setCreateErrorMessage(conflictMsg);
        } else if (code === 'ERR_IDEMPOTENCY_KEY_REUSED') {
          setCreateErrorMessage('This appointment request was already submitted. Please refresh and try again.');
        } else {
          setCreateErrorMessage(errorResult?.data?.message || 'Transaction failed');
        }
      }
    } catch (err) {
      console.error("Error in handleCreate:", err);
      setCreateErrorMessage('Network error, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Columns ──────────────────────────────────────────
  const columns = [
    { key: 'created_date', label: 'DATE', type: 'text', width: '100px' },
    { 
      key: 'patient_details', 
      label: 'PATIENT DETAILS', 
      type: 'custom', 
      width: '300px',
      render: (row) => {
        const code = row._raw?.patient_code || row.patient_code || row.patientCode || row.patient_id || '-';
        const name = row.name || '-';
        const age = row.age || '-';
        const gender = row.sex || row.gender || '-';
        const phone = row.mobile_no || row.phone || '-';
        return <div style={{ fontSize: '13px', fontWeight: 600 }}>{`${code} / ${name} / ${age} / ${gender} / ${phone}`}</div>;
      }
    },
    { key: 'appointment_time', label: 'APPOINTMENT TIME', type: 'text', width: '130px' },
    { key: 'duration', label: 'DURATION', type: 'text', width: '100px' },
    {
      key: 'payment_receipt',
      label: 'PAYMENT RECEIPT',
      type: 'custom',
      width: '120px',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ActionIconBtn
            icon={DownloadIcon}
            onClick={() => row.receipt_url && window.open(row.receipt_url, '_blank')}
            disabled={!row.receipt_url}
          />
        </div>
      )
    },
    {
      key: 'payment_action',
      label: 'PAYMENT STATUS',
      type: 'custom',
      width: '130px',
      render: (row) => {
        let payStatus = String(row._raw?.payment_action || row._raw?.paymentAction || '').toUpperCase();
        if (!payStatus || payStatus === 'UNDEFINED') {
          payStatus = getPaymentStatus(row.totalAmount, row.amountPaid);
        }
        const config =
          payStatus === 'PAID' ? { label: 'Paid', color: '#10B981' } :
            { label: 'Pending', color: '#EF4444' };

        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (payStatus !== 'PAID') {
                  openPaymentModal(row);
                }
              }}
              style={{
                background: 'transparent',
                color: config.color,
                border: `1px solid ${config.color}`,
                borderRadius: '4px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: payStatus === 'PAID' ? 'default' : 'pointer',
                minWidth: '80px'
              }}
            >
              {config.label}
            </button>
          </div>
        );
      }
    },
    {
      key: 'bill_invoice',
      label: 'BILL INVOICE',
      type: 'custom',
      width: '110px',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ActionIconBtn
            icon={DownloadIcon}
            onClick={() => {
              const billId = row.bill_id || row._raw?.bill_id || row.invoice_id || row._raw?.invoice_id;
              setInvoiceTarget({ ...row, bill_id: billId });
            }}
          />
        </div>
      )
    },
    {
      key: 'services',
      label: 'SERVICES',
      type: 'custom',
      width: '180px',
      render: (row) => {
        const services = row.services || row._raw?.services || [];
        if (!services.length) return <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No services</span>;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {services.map((s, idx) => (
              <div key={s.id || idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '10px',
                background: s.status === 'USED' ? '#F0FDF4' : '#F9FAFB',
                padding: '2px 6px',
                borderRadius: '4px',
                border: `1px solid ${s.status === 'USED' ? '#DCFCE7' : '#F3F4F6'}`
              }}>
                <span style={{
                  color: s.status === 'USED' ? '#166534' : '#374151',
                  textDecoration: s.status === 'USED' ? 'line-through' : 'none',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {s.service_name || s.name || 'Service'}
                </span>
                {s.status !== 'USED' ? (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const res = await consumeAppointmentServices(row.id, { serviceId: s.id });
                        if (res.success) {
                          showToast('Service marked as used', 'success');
                          fetchAppointments();
                        } else {
                          showToast(res.data?.message || 'Failed to consume service', 'error');
                        }
                      } catch (err) {
                        showToast('Error consuming service', 'error');
                      }
                    }}
                    style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: '3px', padding: '1px 6px', fontSize: '9px', cursor: 'pointer' }}
                  >
                    Use
                  </button>
                ) : (
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
                )}
              </div>
            ))}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'STATUS',
      type: 'custom',
      width: '130px',
      render: (row, value) => {
        let payStatus = String(row._raw?.payment_action || row._raw?.paymentAction || '').toUpperCase();
        if (!payStatus || payStatus === 'UNDEFINED') {
          payStatus = getPaymentStatus(row.totalAmount, row.amountPaid);
        }
          const openStatusPicker = () => {
            if (value === 'BOOKED' || value === 'SCHEDULED') {
              handleStatusUpdate(row, 'ARRIVED');
              return;
            }
            if (value === 'ARRIVED') {
              setStatusModal({ isOpen: true, row });
              return;
            }
          };

          const isClickable = ['BOOKED', 'SCHEDULED', 'ARRIVED'].includes(value);

          return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={openStatusPicker}
                disabled={!isClickable}
                style={{
                  background: STATUS_COLORS[value]?.bg || '#E5E7EB',
                  color: STATUS_COLORS[value]?.text || '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: isClickable ? 'pointer' : 'default',
                  textTransform: 'uppercase',
                  minWidth: '100px',
                  opacity: isClickable ? 1 : 0.7
                }}
              >
                {value === 'ARRIVED' ? 'Arrived' : value}
              </button>
            </div>
          );
      },
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      type: 'custom',
      width: '100px',
      render: (row) => {
        return (
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
            <ActionIconBtn
              icon={EditIcon}
              onClick={() => handleEditOpen(row)}
            />
            <Button
              size="xs"
              variant="ghost"
              colorScheme="teal"
              onClick={() => {
                setTimelinePatientId(row.patient_id);
                setIsTimelineOpen(true);
              }}
              style={{ padding: '0 4px', fontSize: '10px' }}
            >
              Timeline
            </Button>
            <ActionIconBtn
              icon={DeleteIcon}
              onClick={() => handleSimpleCancel(row)}
            />
          </div>
        );
      },
    },
  ];

  // ── Render ─────────────────────────────────────────────
  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] bg-white">
          <PageHeader
            title="Dialysis Appointments"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Appointments', active: true },
            ]}
            actions={
              <Flex gap={2}>
                <Button
                  variant="outline"
                  colorScheme="blue"
                  leftIcon={<span>📅</span>}
                  onClick={() => setIsDashboardOpen(true)}
                  size="sm"
                  style={{ borderRadius: '8px', fontWeight: 700, borderColor: '#3b82f6', color: '#1e40af' }}
                >
                  Booking Dashboard
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => {
                    resetCreateModal();
                    setIsCreateOpen(true);
                  }}
                >
                  + New Appointment
                </Button>
              </Flex>
            }
          />
        </Box>

        <div className={` ${isMobile ? 'px-3 pb-20' : ''}`}>
          {/* ─── Filter + Stats Bar ─── */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'row', alignItems: 'center', zIndex: 999, flexWrap: 'nowrap', paddingBottom: '4px' }}>
              <div style={{ height: '40px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <OrganizationSelector
                  orgId={selectedOrgId}
                  setOrgId={setSelectedOrgId}
                  organizations={organizations}
                  label=""
                  minW="180px"
                />
              </div>
              <div style={{ height: '40px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <ClinicSelector
                  orgId={selectedOrgId}
                  clinicId={selectedClinicId}
                  setClinicId={setSelectedClinicId}
                  clinics={clinics}
                  label=""
                  minW="180px"
                />
              </div>
              <Input
                type="text"
                placeholder="Search patient…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '40px', margin: 0, width: '220px', flexShrink: 0 }}
              />
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ height: '40px', margin: 0, width: '160px', flexShrink: 0 }}
              />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ height: '40px', margin: 0, width: '160px', flexShrink: 0 }}
              />
              <Button
                variant="outline"
                style={{ height: '40px', display: 'flex', alignItems: 'center', margin: 0, whiteSpace: 'nowrap', flexShrink: 0, borderColor: '#3b82f6', color: '#1e40af', fontWeight: 700 }}
                onClick={() => setIsDashboardOpen(true)}
                leftIcon={<span>📅</span>}
              >
                Dashboard
              </Button>
              <Button
                variant="primary"
                style={{ height: '40px', display: 'flex', alignItems: 'center', margin: 0, whiteSpace: 'nowrap', flexShrink: 0 }}
                onClick={() => {
                  resetCreateModal();
                  setIsCreateOpen(true);
                }}
              >
                + New Appointment
              </Button>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ padding: '8px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '85px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
                <strong style={{ fontSize: '20px', color: '#0f172a', lineHeight: '1.2' }}>{total}</strong>
              </div>
              <div style={{ padding: '8px 16px', background: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '85px', boxShadow: '0 2px 4px rgba(234,88,12,0.05)' }}>
                <span style={{ fontSize: '10px', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</span>
                <strong style={{ fontSize: '20px', color: '#ea580c', lineHeight: '1.2' }}>{pending}</strong>
              </div>
              <div style={{ padding: '8px 16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '85px', boxShadow: '0 2px 4px rgba(22,163,74,0.05)' }}>
                <span style={{ fontSize: '10px', color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</span>
                <strong style={{ fontSize: '20px', color: '#16a34a', lineHeight: '1.2' }}>{completed}</strong>
              </div>
              <div style={{ padding: '8px 16px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '85px', boxShadow: '0 2px 4px rgba(16,185,129,0.05)' }}>
                <span style={{ fontSize: '10px', color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paid</span>
                <strong style={{ fontSize: '20px', color: '#10b981', lineHeight: '1.2' }}>{paidCount}</strong>
              </div>
              {unpaidCount > 0 && (
                <div style={{ padding: '8px 16px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '85px', boxShadow: '0 2px 4px rgba(220,38,38,0.05)', animation: 'pulse 2s infinite' }}>
                  <span style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unpaid</span>
                  <strong style={{ fontSize: '20px', color: '#dc2626', lineHeight: '1.2' }}>{unpaidCount}</strong>
                </div>
              )}
            </div>
          </div>

          {/* ─── Table ─── */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
            border: '1px solid #f1f5f9',
            overflow: 'hidden'
          }}>
            {loading ? (
              <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
                <p style={{ color: '#6B7280' }}>Loading appointments…</p>
              </div>
            ) : error ? (
              <div
                className="flex flex-col items-center justify-center"
                style={{ minHeight: '200px', gap: '12px' }}
              >
                <p style={{ color: '#DC2626' }}>{error}</p>
                <Button variant="outline" onClick={fetchAppointments}>Retry</Button>
              </div>
            ) : (
              <UnifiedListTable
                columns={columns}
                data={filtered}
                emptyMessage="No dialysis appointments found"
                displayMode="table"
                rowsPerPage={10}
              />
            )}
          </div>
        </div>

        {/* ─── Create Appointment Modal (3-step) ─── */}
        {createStep < 3 ? (
          <FormModal
            size="3xl"
            isOpen={isCreateOpen}
            onClose={() => { setIsCreateOpen(false); resetCreateModal(); }}
            onSubmit={handleCreate}
            title={
              isEditOpen
                ? (createStep === 1 ? 'Edit Appointment' : 'Update Bill & Payment')
                : (createStep === 1 ? 'Book Appointment - Details' : 'Bill & Payment')
            }
            submitText={
              createStep === 1
                ? 'Next →'
                : submitting
                  ? 'Saving…'
                  : isEditOpen ? 'Update Appointment' : 'Save Bill'
            }
            errorMessage={createErrorMessage}
            fieldErrors={createFieldErrors}
            onFieldErrorClear={(field) =>
              setCreateFieldErrors((prev) => ({ ...prev, [field]: undefined }))
            }
          >



            {({ getFieldProps, clearFieldError }) => (
              <>
                {/* STEP 1 — Appointment Details */}
                {createStep === 1 && (
                  <Box className="flex flex-col gap-6">



                    {selectedPatientData && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '24px',
                          marginBottom: '32px',
                          marginTop: '16px'
                        }}
                      >
                        <div
                          style={{
                            width: '100px', height: '100px', borderRadius: '50%',
                            background: '#E2E8F0',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '36px', color: '#64748B',
                            fontWeight: 'bold'
                          }}
                        >
                          {selectedPatientData.name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                            {selectedPatientData.name} <span style={{ color: '#6B7280', fontWeight: 400, fontSize: '18px' }}>({selectedPatientData.id})</span>
                          </div>
                          <div style={{ fontSize: '15px', color: '#4B5563' }}>
                            {selectedPatientData.gender}, {selectedPatientData.age} years old
                          </div>
                          <div style={{ fontSize: '15px', color: '#4B5563', fontWeight: 700 }}>
                            Phone No: <span style={{ fontWeight: 400 }}>{selectedPatientData.phoneno || selectedPatientData.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}



                    {/* Organization & Clinic Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormControl isRequired className="mt-6">
                        <FormLabel style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>Organization</FormLabel>
                        <OrganizationSelector

                          orgId={createForm.org_id}
                          setOrgId={(val) => setCreateForm(p => ({ ...p, org_id: val, clinic_id: '', clinic_name: '' }))}
                          organizations={organizations}
                          label=""
                          size="md"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>Clinic</FormLabel>
                        {clinicsLoading ? (
                          <div style={{ fontSize: '13px', color: '#6B7280', padding: '10px 12px' }}>Loading clinics...</div>
                        ) : (
                          <ClinicSelector
                            orgId={createForm.org_id}
                            clinicId={createForm.clinic_id}
                            setClinicId={(val) => {
                              const chosen = clinics.find((c) => String(c.id) === String(val));
                              setCreateForm(p => ({
                                ...p,
                                clinic_id: val,
                                clinic_name: chosen ? (chosen.name || 'Clinic') : '',
                                start_time: '',
                              }));
                            }}
                            clinics={clinics}
                            label=""
                            size="md"
                          />
                        )}
                      </FormControl>
                    </div>

                    {/* Patient Selection & Info Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                        <FormControl isRequired isInvalid={getFieldProps('patient_id').isInvalid}>
                          <FormLabel >Patient</FormLabel>
                          <Select
                            value={createForm.patient_id}
                            onChange={(e) => {
                              setCreateForm((p) => ({ ...p, patient_id: e.target.value }));
                              clearFieldError('patient_id');
                            }}
                            style={{
                              width: '100%', padding: '10px 12px',
                              borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px',
                              outline: 'none', background: '#ffffff', height: '40px'
                            }}
                          >
                            <option value="">Select Patient</option>
                            {dialysisPatients.map((p) => {
                              const ailmentsList = String(p.patient_ailments || p.ailments || p.medical_history || '');
                              return (
                                <option key={p.id} value={p.id}>
                                  {p.name} {ailmentsList ? `— ${ailmentsList}` : ''}
                                </option>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </div>

                      <FormControl isRequired isInvalid={getFieldProps('appointment_date').isInvalid}>
                        <FormLabel>Start Date</FormLabel>
                        <Input
                          type="date"
                          value={createForm.appointment_date}
                          {...getFieldProps('appointment_date')}
                          onChange={(e) => {
                            setCreateForm((p) => ({ ...p, appointment_date: e.target.value }));
                            clearFieldError('appointment_date');
                          }}
                        />
                      </FormControl>
                      
                      {isEditOpen && (
                        <FormControl isRequired>
                          <FormLabel>Treatment Duration (Hrs)</FormLabel>
                          <Input
                            type="number"
                            placeholder="e.g. 4"
                            value={createForm.duration}
                            onChange={(e) => setCreateForm((p) => ({ ...p, duration: e.target.value }))}
                          />
                        </FormControl>
                      )}
                    </div>




                    <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                       <FormControl isRequired isInvalid={getFieldProps('start_time').isInvalid}>
                        <FormLabel>Timing & Schedule</FormLabel>

                        <div style={{ marginBottom: '16px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '14px', background: '#F8FAFC' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Slot Type
                          </div>
                          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {[
                              { value: 'continuous', label: 'Continuous', help: 'Auto-books future sessions: 15 weekly, 5 bi-weekly, 5 monthly.' },
                              { value: 'customized', label: 'Customized', help: 'Select a start date and end date, then book every checked day in that range.' },
                            ].map((opt) => (
                              <label key={opt.value} style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '4px', padding: '14px', borderRadius: '12px', border: createForm.booking_mode === opt.value ? '2px solid #2563EB' : '1px solid #CBD5E1', background: createForm.booking_mode === opt.value ? '#EFF6FF' : '#FFF', cursor: 'pointer' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                                  <input
                                    type="radio"
                                    name="booking_mode"
                                    value={opt.value}
                                    checked={createForm.booking_mode === opt.value}
                                    onChange={() => setCreateForm((p) => ({
                                      ...p,
                                      booking_mode: opt.value,
                                      custom_start_date: p.custom_start_date || p.appointment_date,
                                      custom_end_date: opt.value === 'customized' ? p.custom_end_date : '',
                                    }))}
                                  />
                                  {opt.label}
                                </span>
                                <span style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>{opt.help}</span>
                              </label>
                            ))}
                          </div>

                          {createForm.booking_mode === 'customized' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <FormControl isRequired isInvalid={getFieldProps('custom_start_date').isInvalid}>
                                <FormLabel>Start Date</FormLabel>
                                <Input
                                  type="date"
                                  value={createForm.custom_start_date}
                                  onChange={(e) => setCreateForm((p) => ({ ...p, custom_start_date: e.target.value }))}
                                />
                              </FormControl>
                              <FormControl isRequired isInvalid={getFieldProps('custom_end_date').isInvalid}>
                                <FormLabel>End Date</FormLabel>
                                <Input
                                  type="date"
                                  value={createForm.custom_end_date}
                                  onChange={(e) => setCreateForm((p) => ({ ...p, custom_end_date: e.target.value }))}
                                />
                              </FormControl>
                            </div>
                          )}

                          <div style={{ marginTop: '12px', fontSize: '12px', color: '#475569' }}>
                            Planned sessions: <strong>{plannedSessionCount}</strong>
                          </div>
                        </div>
                        
                        <div className="p-0 border-none">
                          <ScheduleManager
                            clinicId={createForm.clinic_id}
                            date={createForm.appointment_date}
                            slotTemplates={createForm.slotTemplates}
                            availableClinicTemplates={selectedClinicData?.slotTemplates || []}
                            capacity={selectedClinicData?.capacity || 1}
                            existingAppointments={clinicAppointments}
                            duration={Number(createForm.duration || 4) * 60}
                            bufferMinutes={selectedClinicData?.cleaningTimeMinutes || 30}
                            onChange={(newTemplates) => {
                              const processed = newTemplates.map(t => {
                                if (t.startTime && createForm.duration) {
                                  return { ...t, endTime: addMinutesToTime(t.startTime, Number(createForm.duration) * 60) };
                                }
                                return t;
                              });
                              setCreateForm(prev => ({ ...prev, slotTemplates: processed }));
                              if (processed.length > 0) clearFieldError('start_time');
                            }}
                          />
                        </div>
                        {getFieldProps('start_time').isInvalid && (
                          <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>
                            At least one schedule timing is required
                          </p>
                        )}
                      </FormControl>
                    </div>

                    {/* Services Selection Logic */}
                    <div style={{ marginBottom: '24px' }}>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
                        <FormControl>
                          <FormLabel style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>Service</FormLabel>
                          <select
                            value={currentService.name}
                            onChange={(e) => {
                              const s = clinicServices.find(cs => cs.name === e.target.value);
                              setCurrentService({
                                name: e.target.value,
                                price: s ? s.amount : 0,
                                discount: s ? (s.discount || 0) : 0,
                                service_id: s ? (s.id || s.service_id) : null
                              });
                            }}
                            style={{
                              width: '100%', padding: '10px 12px',
                              borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px',
                              outline: 'none', background: '#ffffff'
                            }}
                          >
                            <option value="">Select Service</option>
                            {clinicServices.every((s) => !String(s.name || s.service_name || '').toLowerCase().includes('dialysis')) && (
                              <option value="Dialysis">Dialysis</option>
                            )}
                            {clinicServices.map(s => (
                              <option key={s.name || s.service_id || s.id} value={s.name}>{s.name} (₹{s.amount})</option>
                            ))}
                          </select>
                        </FormControl>

                        <FormControl>
                          <FormLabel style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>Unit Price</FormLabel>
                          <Input
                            type="number"
                            placeholder="Unit Price"
                            value={currentService.price}
                            onChange={(e) => setCurrentService(p => ({ ...p, price: e.target.value }))}
                            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px' }}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>Discount (%)</FormLabel>
                          <Input
                            type="number"
                            placeholder="Discount %"
                            value={currentService.discount}
                            onChange={(e) => setCurrentService(p => ({ ...p, discount: e.target.value }))}
                            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px' }}
                          />
                        </FormControl>

                        <Button
                          type="button"
                          disabled={!currentService.name}
                          onClick={() => {
                            if (addedServices.some(s => s.name === currentService.name)) {
                              showToast('This service has already been added', 'warning');
                              return;
                            }
                            setAddedServices(prev => [...prev, { ...currentService, ui_key: Date.now() }]);
                            setCurrentService({ name: '', price: 0, discount: 0, service_id: null });
                          }}
                          style={{
                            background: '#2563EB', color: '#fff', borderRadius: '24px',
                            padding: '10px 24px', fontWeight: 600, border: 'none', height: '42px',
                            opacity: !currentService.name ? 0.6 : 1,
                            cursor: !currentService.name ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      {addedServices.length > 0 && (
                        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                          {addedServices.map((s, idx) => (
                            <div key={s.ui_key || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '13px' }}>
                              <span>{s.name}</span>
                              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <span style={{ color: '#6B7280' }}>₹{s.price} - {s.discount}% = <strong>₹{s.price - (s.price * s.discount / 100)}</strong></span>
                                <button
                                  type="button"
                                  onClick={() => setAddedServices(prev => prev.filter((_, i) => i !== idx))}
                                  style={{ color: '#DC2626', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                      <FormControl isRequired>
                        <FormLabel>Total Bill Amount (₹)</FormLabel>
                        <div
                          style={{
                            padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(37,99,235,0.2)',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', fontSize: '24px', fontWeight: 800, color: '#1e40af',
                            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), 0 4px 6px rgba(37,99,235,0.1)'
                          }}
                        >
                          ₹ {Number(createForm.total_amount || 0).toLocaleString()}
                        </div>
                      </FormControl>

                      {/* <FormControl>
                        <FormLabel>Patient Ailments</FormLabel>
                        <Textarea
                          placeholder="Ailments from patient record"
                          value={createForm.patient_ailments}
                          onChange={(e) => setCreateForm((p) => ({ ...p, patient_ailments: e.target.value }))}
                          rows={2}
                          style={{ fontSize: '13px' }}
                        />
                      </FormControl> */}
                    </div>

                    {/* Patient Questions & Answers (General Parameters) */}
                    {/* {createForm.patient_id && (
                      <div style={{ marginTop: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', background: '#00A89B', borderRadius: '50%' }}></span>
                          Patient Dialysis Details
                        </div>
                        <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '16px', border: '1px solid #F1F5F9' }}>
                          <QuestionsContainer aliment="Hemo Dialysis" user_id={createForm.patient_id} />
                        </div>
                      </div>
                    )} */}

                  </Box>
                )}

                {/* STEP 2 — Bill & Payment */}
                {createStep === 2 && (
                  <Box className="flex flex-col gap-6">

                    {/* Bill Summary Card */}
                    <div
                      style={{
                        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '20px',
                        padding: '28px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span>
                        BILL SUMMARY
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                          ['Patient', selectedPatientData?.name || '—'],
                          ['Clinic', createForm.clinic_name || '—'],
                          ['Date', createForm.appointment_date],
                          ['Schedule', plannedSessionCount > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {createForm.slotTemplates.map((s, i) => (
                                <span key={i} style={{ fontSize: '12px' }}>
                                  {s.date ? formatDateDisplay(s.date) : s.daysOfWeek[0]} {s.startTime}-{s.endTime} ({s.frequency.replace('-', ' ')})
                                </span>
                              ))}
                              <span style={{ fontSize: '11px', color: '#6B7280' }}>
                                Planned sessions: {plannedSessionCount}
                              </span>
                            </div>
                          ) : '—'],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>{label}</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{val}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '8px' }}>Services Summary</div>
                        {addedServices.map((s, idx) => {
                          const netPrice = s.price - (s.price * s.discount / 100);
                          return (
                            <div key={s.ui_key || s.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: 600 }}>{s.name}</span>
                                <span style={{ color: '#6B7280' }}>₹{netPrice} / session</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: 700, minWidth: '60px', textAlign: 'right' }}>₹{(netPrice * Math.max(plannedSessionCount, 1)).toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        style={{
                          marginTop: '16px', paddingTop: '16px',
                          borderTop: '2px solid #E5E7EB',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Total Amount</span>
                        <span style={{ fontSize: '22px', fontWeight: 800, color: '#111827' }}>
                          ₹{Number(createForm.total_amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Payment Option - Sessions to pay */}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                        Payment
                      </div>
                      <FormControl>
                        <FormLabel>How many sessions do you want to pay for?</FormLabel>
                        <select
                          value={createForm.sessions_to_pay !== undefined ? createForm.sessions_to_pay : Math.max(plannedSessionCount, 1)}
                          onChange={(e) => setCreateForm(p => ({ ...p, sessions_to_pay: Number(e.target.value) }))}
                          style={{
                            width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', background: '#FFF'
                          }}
                        >
                          {Array.from({ length: Math.max(plannedSessionCount, 1) + 1 }, (_, i) => i).map((num) => (
                            <option key={num} value={num}>{num} Session{num !== 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </FormControl>
                      
                      <div
                        style={{
                          marginTop: '16px',
                          background: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', color: '#1E3A8A' }}>Amount to Pay Now</span>
                          <span style={{ fontSize: '18px', fontWeight: 800, color: '#1D4ED8' }}>
                            ₹{Number(createForm.amount_paid || 0).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #93C5FD' }}>
                          <span style={{ fontSize: '13px', color: '#1E3A8A' }}>Remaining Balance</span>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: '#3B82F6' }}>
                            ₹{Math.max(0, Number(createForm.total_amount || 0) - Number(createForm.amount_paid || 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    {/* <FormControl>
                      <FormLabel>Payment Method</FormLabel>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                          { value: 'cash', label: 'Cash' },
                          { value: 'card', label: 'Card' },
                          { value: 'upi', label: 'UPI' },
                          { value: 'bank_transfer', label: 'Bank Transfer' },
                        ].map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setCreateForm((p) => ({ ...p, payment_method: m.value }))}
                            style={{
                              padding: '10px 16px', fontSize: '13px', fontWeight: 600,
                              borderRadius: '8px', cursor: 'pointer',
                              border: createForm.payment_method === m.value ? '2px solid #2563EB' : '1px solid #D1D5DB',
                              background: createForm.payment_method === m.value ? '#EFF6FF' : '#FFF',
                              color: createForm.payment_method === m.value ? '#1E40AF' : '#374151',
                              transition: 'all 0.2s'
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </FormControl> */}

                    {/* Receipt Upload */}
                    <FormControl>
                      <FormLabel>Receipt Upload (Optional)</FormLabel>
                      <FileUploadWithCamera
                        images={receiptItems}
                        onChange={(items) => {
                          setReceiptItems(items || []);
                          setCreateForm((prev) => ({
                            ...prev,
                            receipt_file: items?.[0]?.file || null,
                          }));
                        }}
                        accept="image/*,.pdf"
                        multiple={false}
                        showCamera={true}
                      />
                    </FormControl>
                  </Box>
                )}
              </>
            )}
          </FormModal>
        ) : (
          /* ══ STEP 3 — Invoice PDF Preview ══ */
          <InvoicePreview
            isOpen={isCreateOpen}
            onClose={() => { setIsCreateOpen(false); resetCreateModal(); }}
            appointmentId={savedAppointment?.id}
            billId={savedAppointment?.bill_id || savedAppointment?.invoice_id}
            appointment={savedAppointment}
            clinic={clinics?.find(c => String(c.id) === String(savedAppointment?.clinic_id))}
          />
        )}

        {/* ─── Payment Modal ─── */}
        {/* ─── Status Picker Modal (Arrived → Booked / Waiting) ─── */}
        <BaseModal
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal({ isOpen: false, row: null })}
          title={statusModal.row ? `Update status for ${statusModal.row.name || statusModal.row.patient_id}` : 'Update status'}
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 4px' }}>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              Choose the status to convert this appointment to:
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={async () => {
                  if (!statusModal.row) return;
                  await handleStatusUpdate(statusModal.row, 'BOOKED', true);
                  setStatusModal({ isOpen: false, row: null });
                }}
                style={{ padding: '8px 12px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer' }}
              >
                Mark as Booked
              </button>
              <button
                onClick={async () => {
                  if (!statusModal.row) return;
                  await handleStatusUpdate(statusModal.row, 'WAITING', true);
                  setStatusModal({ isOpen: false, row: null });
                }}
                style={{ padding: '8px 12px', background: '#FEF9E6', border: '1px solid #FEEBC8', borderRadius: '8px', cursor: 'pointer' }}
              >
                Mark as Waiting
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setStatusModal({ isOpen: false, row: null })}
                style={{ padding: '6px 10px', background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </BaseModal>
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={closePaymentModal}
          appointmentId={paymentModal.appointment?.id}
          billId={paymentModal.appointment?.invoiceId}
          onSuccess={async (appointmentId, amount, method, receiptUrl) => {
            showToast(`Payment of ₹${amount} successful`, 'success');
            fetchAppointments();
          }}
        />

        {/* ─── Refund Modal ─── */}
        <RefundModal
          isOpen={refundModal.isOpen}
          onClose={closeRefundModal}
          appointment={refundModal.appointment}
          refundData={refundModal.refundData}
          submitting={refundModal.submitting}
          error={refundModal.error}
          onConfirm={processRefund}
        />

        {/* ─── Standalone Invoice Preview (from table) ─── */}
        <InvoicePreview
          isOpen={!!invoiceTarget}
          onClose={() => setInvoiceTarget(null)}
          appointmentId={invoiceTarget?.id}
          billId={invoiceTarget?.bill_id || invoiceTarget?.invoice_id}
          appointment={invoiceTarget}
          clinic={clinics?.find(c => String(c.id) === String(invoiceTarget?.clinic_id))}
        />

        {/* Dashboard Modal */}
        <BaseModal
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          // title="Dialysis Booking Dashboard"
          size="full"
        >
          <DialysisAppointmentsDashboard
            clinicId={Number(selectedClinicId || 1)}
            onSelectSlot={handleBookFromDashboard}
            onSelectAppointment={handleOpenSession}
          />
        </BaseModal>

        {/* ─── Dialysis Session Management Modal ─── */}
        <DialysisParametersModal
          isOpen={sessionModal.isOpen}
          onClose={() => setSessionModal(prev => ({ ...prev, isOpen: false }))}
          patient={sessionModal.patient}
          bed={sessionModal.bed}
          onStageChange={(stage, data) => {
            console.log('Dialysis stage changed:', stage, data);
            fetchAppointments();
          }}
        />

        {/* Timeline Modal */}
        <BaseModal
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          title="Patient Appointment Timeline"
          size="xl"
        >
          {timelinePatientId && (
            <PatientAppointmentTimeline patientId={timelinePatientId} />
          )}
        </BaseModal>

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default DialysisAppointments;
