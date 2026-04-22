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
} from '../../component-library';
import { FormModal } from '../../component-library/modals/FormModal';
import { BaseModal } from '../../component-library/modals/BaseModal';
import { ScheduleManager } from '../clinicManagement/components/ScheduleManager';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import { useAdminToast } from '../../components/AdminToast';
import AppointmentStatusBadge from '../../components/AppointmentStatusBadge';
import PaymentModal from '../../components/PaymentModal';
import RefundModal from '../../components/RefundModal';
import InvoicePreview from '../../components/InvoicePreview';
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
  addAppointmentPayment,
  cancelAppointment,
  getClinics,
  getClinicById,
  getClinicAppointments,
  getOrganizationById,
} from '../../ApiCalls/clinicApis';
import { getPatients, getPatientAilments, getPatientById } from '../../ApiCalls/patientAPis';
import { getDoctors } from '../../ApiCalls/doctorApis';
import { jsPDF } from 'jspdf';


// ─── Status colors ──────────────────────────────────────────
const STATUS_COLORS = {
  SCHEDULED:   { bg: '#FEF9C3', text: '#854D0E' },
  BOOKED:      { bg: '#FEF9C3', text: '#854D0E' },
  ARRIVED:     { bg: '#F3E8FF', text: '#6B21A8' },
  IN_PROGRESS: { bg: '#DBEAFE', text: '#1E40AF' },
  COMPLETED:   { bg: '#DCFCE7', text: '#166534' },
  CANCELLED:   { bg: '#F3F4F6', text: '#6B7280' },
  MISSED:      { bg: '#FEE2E2', text: '#991B1B' },
};

const STATUS_FLOW = {
  SCHEDULED: 'ARRIVED',
  BOOKED: 'ARRIVED',
  ARRIVED: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
};

const STATUS_LABELS = {
  ARRIVED: 'Arrived',
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
const normalizeAppointment = (apt) => ({
  id: apt.id,
  created_date: (apt.appointment_date || apt.startUTC)
    ? formatDateDisplay(apt.appointment_date || apt.startUTC)
    : '—',
  appointment_date: apt.appointment_date || (apt.startUTC ? String(apt.startUTC).split('T')[0] : null),
  name:
    apt.patient_name ||
    apt.patientName ||
    apt.patientName ||
    (apt.patient_id ? `Patient #${apt.patient_id}` : '—'),
  doctor_name:
    apt.doctor_name ||
    apt.doctorName ||
    apt.primary_doctor_name ||
    (apt.primary_doctor_id ? `Doctor #${apt.primary_doctor_id}` : '—'),
  age: apt.age || apt.patient_age || '—',
  gender: apt.gender || apt.patient_gender || '—',
  sex: apt.gender || apt.patient_gender || '—',
  phoneNumber:
    apt.phoneNumber || apt.phone_number || apt.patient_phone || apt.phone || '—',
  mobile_no:
    apt.phoneNumber || apt.phone_number || apt.patient_phone || apt.phone || '—',
  treatment_type: normalizeType(apt.appointment_type || apt.treatment_type || apt.bookingType),
  booking_time: apt.start_time
    ? formatTime12Hour(apt.start_time)
    : (apt.startUTC ? formatTime12Hour(String(apt.startUTC).split('T')[1]?.slice(0, 8)) : '—'),
  appointment_time: apt.start_time
    ? formatTime12Hour(apt.start_time)
    : (apt.startUTC ? formatTime12Hour(String(apt.startUTC).split('T')[1]?.slice(0, 8)) : '—'),
  status: normalizeStatus(apt.status || apt.appointmentStatus),
  reason: apt.reason || apt.metadata?.notes || '',
  patient_ailments: apt.patient_ailments || '',
  patient_id: apt.patient_id,
  clinic_id: apt.clinic_id,
  clinic_name: apt.clinic_name || apt.clinic?.name || '',
  // Billing fields (client-side)
  totalAmount: apt.totalAmount || apt.total_amt || apt.amountDue || 0,
  amountPaid: apt.amountPaid || apt.received_amt || apt.paidAmount || 0,
  paymentMethod: apt.paymentMethod || '',
  billPDFUrl: apt.billPDFUrl || apt.billUrl || null,
  receipt_url: apt.receiptUrl || apt.billPDFUrl || apt.billUrl || null,
  _raw: apt,
});

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
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // ─── Clinic state ─────────────────────────────────────
  const [clinics, setClinics] = useState([]);
  const [clinicsLoading, setClinicsLoading] = useState(false);

  // ─── Filter state ─────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate]     = useState(today);

  // ─── Create modal state (3 steps) ─────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1); // 1, 2, or 3
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [savedAppointment, setSavedAppointment] = useState(null); // for step 3 preview

  const defaultForm = {
    patient_id: '1',
    clinic_id:        '',
    clinic_name: '',
    appointment_date: today,
    start_time:       '',
    end_time:         '',
    appointment_type: 'in_clinic',
    doctor_id: '',
    is_emergency: false,
    reason:           '',
    patient_ailments: '',
    slotTemplates:    [], // Added for recurring/multi-slot support
    total_amount:     '',
    payment_option:   'full',
    payment_method:   'cash',
    amount_paid:      '',
    receipt_file:     null,
  };

  const [createForm, setCreateForm] = useState(defaultForm);
  const [createFieldErrors, setCreateFieldErrors]   = useState({});
  const [createErrorMessage, setCreateErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // --- External Data ---
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [clinicServices, setClinicServices] = useState([]);
  const [addedServices, setAddedServices] = useState([]);
  const [currentService, setCurrentService] = useState({ name: '', price: 0, discount: 0 });

  // --- Fetch Patients & Doctors ---
  useEffect(() => {
    const loadData = async () => {
      const [pts, docs] = await Promise.all([getPatients(), getDoctors()]);
      if (pts.success) setPatients(Array.isArray(pts.data?.data) ? pts.data.data : pts.data || []);
      if (docs.success) setDoctors(Array.isArray(docs.data?.data) ? docs.data.data : docs.data || []);
    };
    loadData();
  }, []);

  // --- Fetch Clinic Services when clinic changes ---
  useEffect(() => {
    if (!createForm.clinic_id) {
      setClinicServices([]);
      return;
    }
    (async () => {
      const res = await getClinicById(createForm.clinic_id);
      if (res.success) {
        const fullClinic = res.data?.data || res.data;
        setClinicServices(fullClinic.services || []);
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
      const [pRes, aRes] = await Promise.all([
        getPatientById(createForm.patient_id),
        getPatientAilments(createForm.patient_id)
      ]);
      if (pRes.success) {
        setSelectedPatientData(pRes.data?.data || pRes.data);
      }
      if (aRes.success) {
        const ailments = Array.isArray(aRes.data) ? aRes.data.map(a => a.ailment_name).join(', ') : aRes.data?.ailments || '';
        setCreateForm(prev => ({ ...prev, patient_ailments: ailments }));
      }
    })();
  }, [createForm.patient_id]);

  // --- Calculate total bill from added services ---
  useEffect(() => {
    const total = addedServices.reduce((sum, s) => {
      const price = Number(s.price) || 0;
      const discount = Number(s.discount) || 0;
      return sum + (price - (price * discount / 100));
    }, 0);
    setCreateForm(prev => ({ ...prev, total_amount: total }));
  }, [addedServices]);

  // ─── Standalone invoice preview state ─────────────────
  const [invoiceTarget, setInvoiceTarget] = useState(null);

  // ─── Fetch clinics ─────────────────────────────────────
  const fetchClinics = useCallback(async () => {
    setClinicsLoading(true);
    try {
      const result = await getClinics();
      if (result.success) {
        const list = Array.isArray(result.data?.data)
          ? result.data.data
          : Array.isArray(result.data)
            ? result.data
            : [];
        setClinics(list);
        // Auto-select first clinic
        if (list.length === 1) {
          setCreateForm((prev) => ({
            ...prev,
            clinic_id: String(list[0].id),
            clinic_name: list[0].name || `Clinic #${list[0].id}`,
          }));
        }
      }
    } catch (err) {
      console.warn('Could not fetch clinics:', err);
    } finally {
      setClinicsLoading(false);
    }
  }, []);

  // ─── Fetch appointments ───────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAppointments({
        from: `${fromDate}T00:00:00Z`,
        to: `${toDate}T23:59:59Z`,
      });
      if (result.success) {
        const rows = Array.isArray(result.data?.data)
          ? result.data.data
          : Array.isArray(result.data)
          ? result.data
          : [];
        setAppointments(rows.map(normalizeAppointment));
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
  }, [fromDate, toDate, showToast]);

  // ─── Fetch slots for selected clinic + date ────────────
  useEffect(() => {
    if (!createForm.clinic_id || !createForm.appointment_date) {
      setSlots([]);
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);

    (async () => {
      try {
        const result = await getClinicAppointments(createForm.clinic_id);
        if (!cancelled) {
          if (result.success) {
            const bookedSlots = new Set();
            const aptList = Array.isArray(result.data?.data)
              ? result.data.data
              : Array.isArray(result.data)
                ? result.data
                : [];

            // Collect booked start times for selected date
            aptList.forEach((a) => {
              if (
                a.appointment_date === createForm.appointment_date &&
                ['BOOKED', 'SCHEDULED', 'ARRIVED', 'IN_PROGRESS'].includes(
                  String(a.status).toUpperCase()
                )
              ) {
                if (a.start_time) bookedSlots.add(a.start_time.slice(0, 5));
              }
            });

            // Generate 30-min slots from 08:00 to 18:00
            const generated = [];
            for (let h = 8; h < 18; h++) {
              for (let m = 0; m < 60; m += 30) {
                const hh = String(h).padStart(2, '0');
                const mm = String(m).padStart(2, '0');
                const key = `${hh}:${mm}`;
                const ampm = h >= 12 ? 'PM' : 'AM';
                const displayH = h % 12 || 12;
                const label = `${String(displayH).padStart(2, '0')}:${mm} ${ampm}`;
                generated.push({ label, value: key, booked: bookedSlots.has(key) });
              }
            }
            setSlots(generated);
          } else {
            // Fallback mock slots
            setSlots([
              { label: '09:00 AM', value: '09:00', booked: false },
              { label: '10:00 AM', value: '10:00', booked: false },
              { label: '11:00 AM', value: '11:00', booked: false },
              { label: '12:00 PM', value: '12:00', booked: false },
              { label: '02:00 PM', value: '14:00', booked: false },
              { label: '04:00 PM', value: '16:00', booked: false },
              { label: '06:00 PM', value: '18:00', booked: false },
            ]);
          }
        }
      } catch {
        if (!cancelled) {
          setSlots([
            { label: '09:00 AM', value: '09:00', booked: false },
            { label: '10:00 AM', value: '10:00', booked: false },
            { label: '11:00 AM', value: '11:00', booked: false },
            { label: '02:00 PM', value: '14:00', booked: false },
            { label: '04:00 PM', value: '16:00', booked: false },
          ]);
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [createForm.clinic_id, createForm.appointment_date]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => { fetchClinics(); }, [fetchClinics]);

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
    onPaymentAdded: async (apptId, amount, method, billPDFUrl) => {
      const result = await addAppointmentPayment(apptId, {
        amount: Number(amount),
        method: String(method || 'cash').toUpperCase(),
        receiptUrl: billPDFUrl || undefined,
      });

      if (result.success) {
        showToast(`Payment of ₹${amount} recorded successfully`, 'success');
        fetchAppointments();
      } else {
        showToast(result.data?.message || 'Failed to record payment', 'error');
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
  const unpaidCount = filtered.filter((a) =>
    getPaymentStatus(a.totalAmount, a.amountPaid) !== 'PAID'
  ).length;

  // ─── Status update ────────────────────────────────────
  const handleStatusUpdate = useCallback(
    async (apt, newStatus) => {
      if (!window.confirm(`Update appointment #${apt.id} to "${newStatus}"?`)) return;
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
    // Keep clinic pre-selected if only one exists
    const preClinic = clinics.length === 1
      ? { clinic_id: String(clinics[0].id), clinic_name: clinics[0].name || `Clinic #${clinics[0].id}` }
      : { clinic_id: '', clinic_name: '' };
    setCreateForm({ ...defaultForm, appointment_date: today, ...preClinic });
  }, [clinics, today, defaultForm]);

  // ─── Edit Open ────────────────────────────────────────
  const handleEditOpen = useCallback((apt) => {
    const raw = apt._raw || apt;
    const slotTemplates = raw.slotTemplates || buildSlotTemplates(raw);
    const patientAilments = raw.patient_ailments || raw.metadata?.patientAilments || raw.metadata?.patientAilments || '';
    const reason = raw.reason || raw.metadata?.notes || raw.metadata?.notes_brief || '';
    const totalAmount = raw.totalAmount || raw.amountDue || raw.total_amt || raw.amount || 0;
    const amountPaid = raw.amountPaid || raw.paidAmount || raw.received_amt || 0;
    const paymentMethod = raw.paymentMethod || raw.payment_method || raw.metadata?.paymentMethod || 'cash';
    const doctorId = raw.doctor_id || raw.doctorId || raw.primary_doctor_id || raw.doctor?.id || '';

    setCreateFieldErrors({});
    setCreateErrorMessage('');
    setSavedAppointment(null);

    setCreateForm({
      ...defaultForm,
      id: raw.id || apt.id,
      patient_id: raw.patient_id || raw.patientId || '',
      clinic_id: String(raw.clinic_id || raw.clinicId || ''),
      clinic_name: raw.clinic_name || raw.clinic?.name || '',
      appointment_date: raw.appointment_date || (raw.startUTC ? String(raw.startUTC).split('T')[0] : today),
      start_time: raw.start_time || (raw.startUTC ? String(raw.startUTC).split('T')[1]?.slice(0, 5) : ''),
      end_time: raw.end_time || '',
      appointment_type: raw.appointment_type || raw.treatment_type || raw.bookingType || defaultForm.appointment_type,
      doctor_id: doctorId,
      is_emergency: Boolean(raw.is_emergency || raw.emergency),
      reason,
      patient_ailments: patientAilments,
      slotTemplates,
      total_amount: totalAmount,
      amount_paid: amountPaid,
      payment_option: amountPaid >= totalAmount ? 'full' : 'partial',
      payment_method: String(paymentMethod).toLowerCase(),
      receipt_file: null,
    });

    setAddedServices(raw.metadata?.services || raw.services || []);
    setCreateStep(1);
    setIsEditOpen(true);
    setIsCreateOpen(true);
  }, [today, defaultForm]);

  // ─── Step 1 → Step 2 ─────────────────────────────────
  const handleNextStep1 = () => {
    const errors = {};
    if (!createForm.patient_id) errors.patient_id = 'Patient ID is required';
    if (!createForm.appointment_date) errors.appointment_date = 'Start Date is required';
    if (createForm.slotTemplates.length === 0) errors.start_time = 'At least one timing slot is required';
    if (!createForm.total_amount)     errors.total_amount = 'Bill Amount is required';

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

    setSubmitting(true);
    setCreateErrorMessage('');

    try {
      const primarySlot = createForm.slotTemplates[0] || {};
      const startTime24 = primarySlot.startTime ? (primarySlot.startTime.length === 5 ? primarySlot.startTime + ':00' : primarySlot.startTime) : '00:00:00';
      const startUTC = toUtcIso(createForm.appointment_date, startTime24);
      
      const finalPaid = createForm.payment_option === 'full'
        ? Number(createForm.total_amount)
        : Number(createForm.amount_paid) || 0;

      const servicesSummary = addedServices.map(s => `${s.name} (₹${s.price - (s.price * s.discount / 100)})`).join(', ');

      const payload = {
        clinicId: Number(createForm.clinic_id),
        patientId: Number(createForm.patient_id),
        startUTC,
        bookingType: 'offline',
        amountDue: Number(createForm.total_amount) || 0,
        metadata: {
          notes: servicesSummary,
          notes_brief: createForm.reason,
          patientAilments: createForm.patient_ailments,
          services: addedServices,
        },
      };

      if (!isEditOpen && finalPaid > 0) {
        payload.immediatePayment = {
          amount: finalPaid,
          method: String(createForm.payment_method || 'cash').toUpperCase(),
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
        showToast(isEditOpen ? 'Appointment updated!' : 'Appointment booked!', 'success');
        fetchAppointments();
        
        if (isEditOpen) {
          setIsCreateOpen(false);
          resetCreateModal();
        } else {
          const saved = result.data?.data || result.data || {};
          setSavedAppointment(normalizeAppointment(saved));
          setCreateStep(3);
        }
      } else {
        setCreateErrorMessage(result.data?.message || 'Transaction failed');
      }
    } catch (err) {
      setCreateErrorMessage('Network error, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Convert Image to PDF on Upload ─────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgData = event.target.result;
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'JPEG', 10, 10, 190, 0); // basic fit
        const pdfBlob = pdf.output('blob');
        const pdfFile = new File([pdfBlob], file.name.replace(/\.[^/.]+$/, '') + '.pdf', { type: 'application/pdf' });
        setCreateForm((p) => ({ ...p, receipt_file: pdfFile }));
      };
      reader.readAsDataURL(file);
    } else {
      setCreateForm((p) => ({ ...p, receipt_file: file }));
    }
  };

  // ─── Columns ──────────────────────────────────────────
  const columns = [
    { key: 'created_date',    label: 'DATE',      type: 'text', width: '100px' },
    { key: 'name',            label: 'PATIENT',   type: 'text', width: '140px' },
    { key: 'age',             label: 'AGE',       type: 'text', width: '50px'  },
    { key: 'sex',             label: 'SEX',       type: 'text', width: '70px'  },
    { key: 'mobile_no',       label: 'MOBILE NO.',type: 'text', width: '120px' },
    { key: 'appointment_time',label: 'APPOINTMENT TIME', type: 'text', width: '130px'  },
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
      label: 'PAYMENT ACTION',
      type: 'custom',
      width: '130px',
      render: (row) => {
        const payStatus = getPaymentStatus(row.totalAmount, row.amountPaid);
        const config = 
          payStatus === 'PAID' ? { label: 'Paid', color: '#10B981' } :
          payStatus === 'PARTIAL' ? { label: 'Partial', color: '#F59E0B' } :
          { label: 'Pending', color: '#EF4444' };

        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => openPaymentModal(row)}
              style={{
                background: 'transparent',
                color: config.color,
                border: `1px solid ${config.color}`,
                borderRadius: '4px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
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
            onClick={() => setInvoiceTarget(row)}
          />
        </div>
      )
    },
    {
      key: 'status',
      label: 'STATUS',
      type: 'custom',
      width: '130px',
      render: (row, value) => {
        const payStatus = getPaymentStatus(row.totalAmount, row.amountPaid);
        const isArrived = value === 'ARRIVED';
        const isBooked = value === 'BOOKED' || value === 'SCHEDULED';
        
        const handleClick = () => {
          if (isBooked) {
             handleStatusUpdate(row, 'ARRIVED');
             return;
          }
          if (isArrived) {
            if (payStatus !== 'PAID') {
              showToast('Payment must be fully completed before proceeding to Diagnosis.', 'warning');
              openPaymentModal(row);
            } else {
              window.location.hash = '/dialysis/sessions';
            }
          }
        };

        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleClick}
              style={{
                background: STATUS_COLORS[value]?.bg || '#E5E7EB',
                color: STATUS_COLORS[value]?.text || '#374151',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                minWidth: '100px'
              }}
            >
              {value}
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
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
            <ActionIconBtn
              icon={EditIcon}
              onClick={() => handleEditOpen(row)}
            />
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
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Dialysis Appointments"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Appointments', active: true },
            ]}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`}>
          {/* ─── Filter + Stats Bar ─── */}
          <div
            className="admin-card"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Input
                type="text"
                placeholder="Search patient…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: isMobile ? '100%' : '190px' }}
              />
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ width: '145px' }}
              />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ width: '145px' }}
              />
              <Button
                variant="primary"
                onClick={() => {
                  resetCreateModal();
                  setIsCreateOpen(true);
                }}
              >
                + New Appointment
              </Button>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px' }}>
                Total: <strong>{total}</strong>
              </span>
              <span style={{ fontSize: '13px', color: '#EA580C' }}>
                Pending: <strong>{pending}</strong>
              </span>
              <span style={{ fontSize: '13px', color: '#16A34A' }}>
                Completed: <strong>{completed}</strong>
              </span>
              {unpaidCount > 0 && (
                <span style={{ fontSize: '13px', color: '#DC2626' }}>
                  Unpaid/Partial: <strong>{unpaidCount}</strong>
                </span>
              )}
            </div>
          </div>

          {/* ─── Table ─── */}
          <div className="admin-card">
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

                    {/* Clinic Selection */}
                    <FormControl isRequired>
                      <FormLabel>Clinic</FormLabel>
                      {clinicsLoading ? (
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>Loading clinics...</div>
                      ) : (
                        <select
                          value={createForm.clinic_id}
                          onChange={(e) => {
                            const chosen = clinics.find((c) => String(c.id) === e.target.value);
                            setCreateForm((p) => ({
                              ...p,
                              clinic_id: e.target.value,
                              clinic_name: chosen ? (chosen.name || `Clinic #${chosen.id}`) : '',
                              start_time: '',
                            }));
                          }}
                          style={{
                            width: '100%', padding: '10px 12px',
                            borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px',
                            background: '#F9FAFB', outline: 'none'
                          }}
                        >
                          <option value="">Select Clinic</option>
                          {clinics.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                              {c.name || `Clinic #${c.id}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </FormControl>

                    {/* Patient Selection & Info Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormControl isRequired isInvalid={getFieldProps('patient_id').isInvalid}>
                        <FormLabel>Patient</FormLabel>
                        <select
                          value={createForm.patient_id}
                          onChange={(e) => {
                            setCreateForm((p) => ({ ...p, patient_id: e.target.value }));
                            clearFieldError('patient_id');
                          }}
                          style={{
                            width: '100%', padding: '10px 12px',
                            borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px',
                            background: '#F9FAFB'
                          }}
                        >
                          <option value="">Select Patient</option>
                          {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (ID: {p.id})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                    </div>

                    {/* <div className="flex items-center gap-2">
                       <input
                         type="checkbox"
                         id="is_emergency"
                         checked={createForm.is_emergency}
                         onChange={(e) => setCreateForm(p => ({ ...p, is_emergency: e.target.checked }))}
                         style={{ width: '16px', height: '16px' }}
                       />
                       <label htmlFor="is_emergency" style={{ fontSize: '14px', fontWeight: 600, color: '#DC2626', cursor: 'pointer' }}>
                         Emergency Appointment
                       </label>
                    </div> */}

                    {selectedPatientData && (
                      <div
                        style={{
                          background: '#F3F4F6',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                          border: '1px solid #E5E7EB'
                        }}
                      >
                        <div
                          style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: '#E5E7EB', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '14px', color: '#9CA3AF'
                          }}
                        >
                          No Image
                        </div>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                            {selectedPatientData.name} <span style={{ color: '#6B7280', fontWeight: 400 }}>({selectedPatientData.id})</span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}>
                            {selectedPatientData.gender}, {selectedPatientData.age} years old
                          </div>
                          <div style={{ fontSize: '14px', color: '#374151', marginTop: '2px' }}>
                            Phone No: {selectedPatientData.phoneno || selectedPatientData.phone || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
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

                      <FormControl isRequired isInvalid={getFieldProps('start_time').isInvalid}>
                        <FormLabel>Timing & Schedule</FormLabel>
                        <Box className="p-0 border-none">
                            <ScheduleManager 
                                slotTemplates={createForm.slotTemplates} 
                                onChange={(newTemplates) => {
                                    setCreateForm(prev => ({ ...prev, slotTemplates: newTemplates }));
                                    if (newTemplates.length > 0) clearFieldError('start_time');
                                }}
                            />
                        </Box>
                        {getFieldProps('start_time').isInvalid && (
                            <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>
                                At least one schedule timing is required
                            </p>
                        )}
                      </FormControl>
                    </div>

                    {/* Services Selection Logic */}
                    <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '12px' }}>
                        Services
                      </div>

                      <div className="flex flex-col md:flex-row gap-3 items-end mb-4">
                        <FormControl className="flex-1">
                          <FormLabel style={{ fontSize: '12px' }}>Select Service</FormLabel>
                          <select
                            value={currentService.name}
                            onChange={(e) => {
                              const s = clinicServices.find(cs => cs.name === e.target.value);
                              setCurrentService({
                                name: e.target.value,
                                price: s ? s.amount : 0,
                                discount: 0
                              });
                            }}
                            style={{
                              width: '100%', padding: '8px 12px',
                              borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px'
                            }}
                          >
                            <option value="">Select Service</option>
                            {clinicServices.map(s => (
                              <option key={s.name} value={s.name}>{s.name} (₹{s.amount})</option>
                            ))}
                          </select>
                        </FormControl>

                        <FormControl style={{ width: '120px' }}>
                          <FormLabel style={{ fontSize: '12px' }}>Unit Price</FormLabel>
                          <Input
                            type="number"
                            value={currentService.price}
                            onChange={(e) => setCurrentService(p => ({ ...p, price: e.target.value }))}
                          />
                        </FormControl>

                        <FormControl style={{ width: '120px' }}>
                          <FormLabel style={{ fontSize: '12px' }}>Discount (%)</FormLabel>
                          <Input
                            type="number"
                            value={currentService.discount}
                            onChange={(e) => setCurrentService(p => ({ ...p, discount: e.target.value }))}
                          />
                        </FormControl>

                        <Button
                          type="button"
                          variant="primary"
                          disabled={!currentService.name}
                          onClick={() => {
                            setAddedServices(prev => [...prev, { ...currentService, id: Date.now() }]);
                            setCurrentService({ name: '', price: 0, discount: 0 });
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      {addedServices.length > 0 && (
                        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                          {addedServices.map((s, idx) => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '13px' }}>
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
                            padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB',
                            background: '#F3F4F6', fontSize: '16px', fontWeight: 700, color: '#1E40AF'
                          }}
                        >
                          ₹ {Number(createForm.total_amount || 0).toLocaleString()}
                        </div>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Patient Ailments</FormLabel>
                        <Textarea
                          placeholder="Ailments from patient record"
                          value={createForm.patient_ailments}
                          onChange={(e) => setCreateForm((p) => ({ ...p, patient_ailments: e.target.value }))}
                          rows={2}
                          style={{ fontSize: '13px' }}
                        />
                      </FormControl>
                    </div>

                  </Box>
                )}

                {/* STEP 2 — Bill & Payment */}
                {createStep === 2 && (
                  <Box className="flex flex-col gap-6">

                    {/* Bill Summary Card */}
                    <div
                      style={{
                        background: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '20px',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
                        BILL SUMMARY
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                          ['Patient', selectedPatientData?.name || '—'],
                          ['Clinic', createForm.clinic_name || '—'],
                          ['Date', createForm.appointment_date],
                          ['Schedule', createForm.slotTemplates.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {createForm.slotTemplates.map((s, i) => (
                                <span key={i} style={{ fontSize: '12px' }}>
                                  {s.daysOfWeek[0]} {s.startTime}-{s.endTime} ({s.frequency.replace('-', ' ')})
                                </span>
                              ))}
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
                        <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Services</div>
                        {addedServices.map(s => (
                          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                            <span>{s.name}</span>
                            <span>₹{s.price - (s.price * s.discount / 100)}</span>
                          </div>
                        ))}
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

                    {/* Payment Option */}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                        Payment Options
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {[
                          { value: 'full', label: 'Full Payment', sub: `Pay ₹${Number(createForm.total_amount || 0).toLocaleString()} now` },
                          { value: 'partial', label: 'Partial Payment', sub: 'Pay a portion now, rest later' },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            style={{
                              flex: 1, display: 'flex', flexDirection: 'column',
                              padding: '16px', borderRadius: '12px', cursor: 'pointer',
                              border: createForm.payment_option === opt.value ? '2px solid #2563EB' : '1px solid #E5E7EB',
                              background: createForm.payment_option === opt.value ? '#EFF6FF' : '#FFF',
                              transition: 'all 0.2s'
                            }}
                          >
                            <input
                              type="radio"
                              name="payment_option"
                              value={opt.value}
                              checked={createForm.payment_option === opt.value}
                              onChange={() => setCreateForm((p) => ({
                                ...p,
                                payment_option: opt.value,
                                amount_paid: opt.value === 'full' ? p.total_amount : '',
                              }))}
                              style={{ display: 'none' }}
                            />
                            <span style={{ fontWeight: 700, fontSize: '14px', color: createForm.payment_option === opt.value ? '#1E40AF' : '#374151' }}>
                              {opt.label}
                            </span>
                            <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{opt.sub}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Partial Amount */}
                    {createForm.payment_option === 'partial' && (
                      <FormControl>
                        <FormLabel>Amount to Pay Now (₹)</FormLabel>
                        <Input
                          type="number"
                          placeholder={`Enter amount (Max: ₹${createForm.total_amount || 0})`}
                          value={createForm.amount_paid}
                          onChange={(e) => {
                            let val = Number(e.target.value);
                            const max = Number(createForm.total_amount || 0);
                            if (val > max) val = max;
                            setCreateForm((p) => ({ ...p, amount_paid: val }));
                          }}
                        />
                      </FormControl>
                    )}

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
                      <div
                        style={{
                          border: '2px dashed #D1D5DB', borderRadius: '12px',
                          padding: '24px', textAlign: 'center', cursor: 'pointer',
                          background: '#F9FAFB', transition: 'border-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#9CA3AF'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                        onClick={() => document.getElementById('receipt-file-input').click()}
                      >
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>
                          {createForm.receipt_file
                            ? `File selected: ${createForm.receipt_file.name}`
                            : 'Click to upload receipt (PDF or Image)'}
                        </div>
                        <input
                          id="receipt-file-input"
                          type="file"
                          accept="image/*,application/pdf"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                      </div>
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
            appointment={savedAppointment}
            clinic={clinics?.find(c => String(c.id) === String(savedAppointment?.clinic_id))}
          />
        )}

        {/* ─── Payment Modal ─── */}
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={closePaymentModal}
          appointment={paymentModal.appointment}
          amount={paymentModal.amount}
          method={paymentModal.method}
          error={paymentModal.error}
          submitting={paymentModal.submitting}
          onAmountChange={(v) => updatePaymentField('amount', v)}
          onMethodChange={(v) => updatePaymentField('method', v)}
          onSubmit={submitPayment}
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
          appointment={invoiceTarget}
          clinic={clinics?.find(c => String(c.id) === String(invoiceTarget?.clinic_id))}
        />

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default DialysisAppointments;
