/**
 * InvoicePreview Component
 * Renders a formal, professional dialysis invoice with data fetched from Clinic and Organization APIs.
 * Supports Print and PDF Download (via html2canvas & jsPDF).
 *
 * Now accepts an optional `appointmentId` prop to autonomously fetch appointment detail
 * (including invoice + payments) from the backend via getAppointmentById.
 *
 * @file src/components/InvoicePreview.jsx
 */

import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { BaseModal } from '../component-library/modals/BaseModal';
import { getClinicById, getOrganizationById, getAppointmentById, getBillDetails, getBillingBillById } from '../ApiCalls/clinicApis';
import { getPatientById } from '../ApiCalls/patientAPis';
import { getPaymentStatus, getOutstandingBalance } from '../utils/refundCalculator';

const InvoicePreview = ({ isOpen, onClose, appointment: appointmentProp, appointmentId: appointmentIdProp, billId: billIdProp, clinic: initialClinic }) => {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [fetchedClinic, setFetchedClinic] = useState(null);
  const [fetchedOrg, setFetchedOrg] = useState(null);
  const [fetchedPatient, setFetchedPatient] = useState(null);
  const [fetchedAppointment, setFetchedAppointment] = useState(null);
  const [fetchedInvoice, setFetchedInvoice] = useState(null);
  const [fetchedPayments, setFetchedPayments] = useState([]);
  const [fetchedRefunds, setFetchedRefunds] = useState([]);
  const [fetchedBill, setFetchedBill] = useState(null);
  const [fetchedBillAppointments, setFetchedBillAppointments] = useState([]);
  const [loadingAppt, setLoadingAppt] = useState(false);

  // Determine the effective appointmentId — prefer explicit prop, fallback to appointment.id
  const effectiveApptId = appointmentIdProp || appointmentProp?.id;
  const effectiveBillId = billIdProp || appointmentProp?.bill_id || appointmentProp?.invoice_id || appointmentProp?.billId || appointmentProp?.invoiceId;

  // ── Fetch data (consolidated bill OR single appointment) ──
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoadingAppt(true);
      try {
        if (effectiveBillId) {
          // Fetch Consolidated Bill from the specialized dialysis billing API
          const res = await getBillDetails(effectiveBillId);
          if (res.success && res.data) {
            const body = res.data.data || res.data;
            setFetchedBill(body.bill || body);
            setFetchedBillAppointments(body.appointments || []);

            // Parse receipts/ledger entries
            const ledger = body.ledger || body.receipts || [];
            const parsedReceipts = ledger.map(r => {
              try {
                const p = typeof r.payment_receipt === 'string'
                  ? JSON.parse(r.payment_receipt)
                  : r.payment_receipt || r;
                return { ...p, createdAt: p.createdAt || r.created_at || r.createdAt };
              } catch (e) {
                return r;
              }
            });

            setFetchedPayments(parsedReceipts.filter(r => r.type === 'PAYMENT' || r.amount > 0));
            setFetchedRefunds(parsedReceipts.filter(r => r.type === 'REFUND' || r.amount < 0));
            
            if (body.appointments?.length > 0) {
              setFetchedAppointment(body.appointments[0]);
            }
          }
        } else if (effectiveApptId) {
          // Fetch Single Appointment
          const res = await getAppointmentById(effectiveApptId);
          if (res.success && res.data) {
            const body = res.data.data || res.data;
            const appt = body.appointment || body;
            setFetchedAppointment(appt);
            setFetchedInvoice(body.invoice || null);
            setFetchedPayments(Array.isArray(body.payments) ? body.payments : []);
            setFetchedRefunds(Array.isArray(body.refunds) ? body.refunds : []);
          }
        }
      } catch (err) {
        console.error('[InvoicePreview] Failed to fetch bill/appointment detail:', err);
      } finally {
        setLoadingAppt(false);
      }
    };
    fetchData();
  }, [isOpen, effectiveApptId, effectiveBillId]);

  // The "working" appointment — fetched detail takes priority, then the prop
  const appointment = fetchedAppointment || appointmentProp;

  // ── Fetch patient + clinic/org (existing logic) ──
  useEffect(() => {
    const fetchData = async () => {
      const clinicIdVal = appointment?.clinic_id || appointment?.clinicId || appointment?._raw?.clinic_id || appointment?._raw?.clinicId;
      const patientIdVal = appointment?.patient_id || appointment?.patientId || appointment?._raw?.patient_id || appointment?._raw?.patientId;

      if (isOpen && patientIdVal) {
        try {
          const res = await getPatientById(patientIdVal);
          if (res.success && res.data) {
             const patientData = res.data.patient || res.data.data || res.data;
             setFetchedPatient(patientData);
          }
        } catch (err) {
          console.warn('Failed to fetch patient details:', err);
        }
      }

      if (isOpen && clinicIdVal) {
        try {
          const res = await getClinicById(clinicIdVal);
          if (res && res.success && res.data) {
            const clinic = res.data.data || res.data;
            setFetchedClinic(clinic);

            const orgId = clinic.organizationId || clinic.organization_id;
            if (orgId) {
              const oRes = await getOrganizationById(orgId);
              if (oRes?.success && oRes.data) {
                const org = oRes.data.data || oRes.data;
                setFetchedOrg(org);
              }
            }
          }
        } catch (e) {
          console.error('Error fetching clinic/org details for invoice:', e);
        }
      }

    };
    if (isOpen && appointment) fetchData();
  }, [
    isOpen,
    appointment?.clinic_id,
    appointment?.clinicId,
    appointment?._raw?.clinic_id,
    appointment?._raw?.clinicId,
    appointment?.patient_id,
    appointment?.patientId,
    appointment?._raw?.patient_id,
    appointment?._raw?.patientId
  ]);

  if (!appointment && !loadingAppt) return null;

  // ── Derive billing amounts from fetched invoice or appointment fields ──
  const invoice = fetchedInvoice || fetchedBill;
  const pickNumeric = (obj, keys) => {
    if (!obj) return undefined;
    let zeroVal;
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null && v !== '') {
        const n = Number(v);
        if (!Number.isNaN(n)) {
          if (n !== 0) return n;
          if (zeroVal === undefined) zeroVal = 0;
        }
      }
    }
    return zeroVal;
  };
  const totalDueKeysInvoice = ['total_amt','total_amount','totalAmount','amountDue','amount_due','unit_price','unitPrice','amount','price','bill_amount'];
  const totalDueKeysAppt = ['totalAmount','total_amount','total_amt','amountDue','amount_due','unit_price','unitPrice','amount','price'];
  const totalDue = pickNumeric(invoice, totalDueKeysInvoice) ?? pickNumeric(appointment, totalDueKeysAppt) ?? pickNumeric(appointment?._raw, totalDueKeysAppt) ?? 0;
  const getAmountPaid = () => {
    if (fetchedBill) {
      const billPaidKeys = ['paid_amt','paid_amount','paidAmount','amount_paid','amountPaid','received_amt','receivedAmount','paid'];
      const v = pickNumeric(fetchedBill, billPaidKeys);
      if (v !== undefined) return v;
      if (fetchedBill.payment_receipt) {
        const t = pickNumeric(fetchedBill, totalDueKeysInvoice);
        if (t !== undefined) return t;
      }
      if (fetchedPayments.length) return fetchedPayments.reduce((s,p)=> s+Number(p.amount||0),0);
      return 0;
    }
    const apptPaidKeys = ['amount_paid','amountPaid','received_amt','receivedAmount','paid_amt','paid_amount','paidAmount','amount','paid'];
    return pickNumeric(appointment, apptPaidKeys) ?? pickNumeric(appointment?._raw, apptPaidKeys) ?? 0;
  };
  const amountPaid = getAmountPaid();
  const outstanding = Math.max(0, totalDue - amountPaid);

  let payStatus = fetchedBill 
    ? (fetchedBill.payment_status || (amountPaid >= totalDue ? 'PAID' : 'PARTIAL')) 
    : getPaymentStatus(totalDue, amountPaid);
    
  if (String(appointment?.status).toUpperCase() === 'CANCELLED' || String(appointment?.status).toUpperCase() === 'MISSED') payStatus = 'CANCELLED';

  const invoiceId = invoice?.id ? `INV-${invoice.id}` : `INV-${appointment?.id || Date.now()}`;

  // Use fetched patient data with fallbacks to appointment data
  const pName = fetchedPatient?.name || fetchedPatient?.patient_name || appointment?.patient_name || appointment?.name;
  const patientName = pName && pName !== '—' ? pName : 'Patient';
  const patientAge = fetchedPatient?.age || fetchedPatient?.patient_age || appointment?.age || appointment?.patient_age || '-';
  const patientGender = fetchedPatient?.gender || fetchedPatient?.sex || fetchedPatient?.patient_gender || appointment?.gender || appointment?.sex || appointment?.patient_gender || '-';
  const patientPhone = fetchedPatient?.phoneNumber || fetchedPatient?.phone || fetchedPatient?.phone_number || appointment?.phoneNumber || appointment?.phone || appointment?.patient_phone || '-';

  const activeClinic = fetchedClinic || initialClinic || {};
  const activeOrg = fetchedOrg || {};

  const to12Hour = (time) => {
    if (!time || typeof time !== 'string' || !time.includes(':')) return time;
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = (hours === 0) ? 12 : hours;
    return `${hours}:${minutes} ${ampm}`;
  };

  const getClinicTimings = (templates) => {
    if (!templates || !Array.isArray(templates) || templates.length === 0) return null;
    const groups = {};
    templates.forEach(st => {
      const start = st.timings?.[0]?.startTime || st.startTime;
      const end = st.timings?.[0]?.endTime || st.endTime;
      if (!start || !end) return;
      const key = `${start}-${end}`;
      if (!groups[key]) groups[key] = [];
      const days = Array.isArray(st.daysOfWeek) ? st.daysOfWeek : [st.daysOfWeek].filter(Boolean);
      groups[key].push(...days);
    });

    const lines = Object.entries(groups).map(([key, days]) => {
      const [start, end] = key.split('-');
      // Deduplicate and shorthand
      const uniqueDays = [...new Set(days)].map(d => d.slice(0, 3));
      return { days: uniqueDays.join(','), time: `${to12Hour(start)} - ${to12Hour(end)}` };
    });

    const assignedDays = [].concat(...Object.values(groups));
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const missing = allDays.filter(d => !assignedDays.includes(d)).map(d => d.slice(0, 3));
    
    if (missing.length > 0) {
      lines.push({ days: missing.join(','), time: 'Close' });
    }
    return lines;
  };

  const clinicSlotsLines = getClinicTimings(activeClinic.slotTemplates);

  const orgName = activeOrg.organizationName || activeOrg.org_name || activeOrg.name || activeClinic.organizationName || activeClinic.org_name || 'Kifayti Health';

  let orgAddress = '';
  if (activeOrg.address && typeof activeOrg.address === 'object') {
    orgAddress = [activeOrg.address.line1, activeOrg.address.city, activeOrg.address.state].filter(Boolean).join(', ');
  } else {
    orgAddress = activeOrg.address || activeOrg.org_address || '';
  }

  const clinicName = activeClinic.clinicName || activeClinic.clinic_name || activeClinic.name || (appointment?.clinic_name && appointment.clinic_name !== '—' ? appointment.clinic_name : 'Clinic');

  const addrObj = activeClinic.address;
  let clinicAddress = '';
  if (addrObj && typeof addrObj === 'object') {
    clinicAddress = [addrObj.line1, addrObj.city, addrObj.state, addrObj.postal].filter(Boolean).join(', ');
  } else {
    clinicAddress = activeClinic.address || '';
  }

  const contactObj = activeClinic.contact;
  const clinicPhone = contactObj?.phone || contactObj?.whatsapp || activeClinic.phone || activeClinic.phoneNumber || activeClinic.phone_number || appointment?.phoneNumber || '';

  let clinicIcon = activeClinic.clinicIconURL || activeClinic.clinic_icon || activeClinic.clinic_icon_url || activeClinic.logo || activeClinic.icon || 'https://via.placeholder.com/100?text=Clinic';
  if (clinicIcon && clinicIcon.includes('Endpoint not found')) {
    clinicIcon = 'https://via.placeholder.com/100?text=Clinic';
  }

  const BILL_COLORS = {
    textSecondary: "#374151",
    textMuted: "#6b7280",
    divider: "#d1d5db",
    success: "#16a34a",
    dangerDark: "#b91c1c",
    warning: "#c2410c"
  };

  // ── Build services list from invoice or appointment metadata ──
  const buildServicesList = () => {
    if (fetchedBill && fetchedBillAppointments.length > 0) {
      // Find the first appointment that actually has services
      const apptWithServices = fetchedBillAppointments.find(a => a.services && a.services.length > 0);
      const apptServices = apptWithServices ? apptWithServices.services : (fetchedBillAppointments[0].services || []);

      if (apptServices.length > 0) {
        return apptServices.map(s => ({
          name: (s.service_name || s.name || 'Service').trim(),
          price: Number(s.amount || s.price || 0),
          discount: Number(s.discount || 0)
        }));
      }
    }

    if (appointment?.services && appointment.services.length > 0) {
      return appointment.services.map(s => ({
        name: (s.service_name || s.name || 'Service').trim(),
        price: Number(s.amount || s.price || 0),
        discount: Number(s.discount || 0)
      }));
    }

    if (invoice) {
      const svcName = invoice.service || invoice.bill_description || 'Dialysis Session';
      const unitPrice = pickNumeric(invoice, totalDueKeysInvoice) ?? 0;
      const discount = Number(invoice.discount || 0);
      const count = fetchedBillAppointments.length || 1;
      // If it's a single price for the whole bill, but multiple appts, we might need to divide
      return [{ name: svcName, price: unitPrice / count, discount }];
    }
    return [];
  };

  const servicesList = buildServicesList();
  const appointmentsToDisplay = fetchedBillAppointments.length > 0
    ? fetchedBillAppointments
    : (appointment ? [appointment] : []);
  const grossAmount = servicesList.reduce((acc, s) => acc + (s.price - (s.price * s.discount / 100)), 0);

  function calculateDurationHours(start, end) {
    if (!start || !end) return '—';
    try {
      const s = start.split(':');
      const e = end.split(':');
      const diff = (parseInt(e[0]) * 60 + parseInt(e[1])) - (parseInt(s[0]) * 60 + parseInt(s[1]));
      const hrs = Math.round(diff / 60);
      return isNaN(hrs) ? '—' : String(hrs);
    } catch { return '—'; }
  }

  // Do not show end time or duration columns in the invoice PDF/table - keep layout simpler
  const showDuration = false;

  const showDiscount = servicesList.some(s => s.discount > 0) || (invoice?.discount && Number(invoice.discount) > 0);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const node = document.getElementById("invoice-render-node");
      if (!node) throw new Error("Invoice render node not found");
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // Add the full canvas image across multiple pages if needed
      let heightLeft = imgHeight;
      let position = margin;
      // Draw pages by shifting the source image vertically
      let pageCount = 0;
      while (heightLeft > 0) {
        if (pageCount > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
        position -= (pageHeight - margin * 2);
        pageCount += 1;
      }

      // Add header/footer to each page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        // Header
        pdf.setFontSize(12);
        pdf.setTextColor('#1E40AF');
        pdf.text(orgName || clinicName || 'Clinic', pageWidth - margin, 40, { align: 'right' });
        pdf.setFontSize(10);
        pdf.setTextColor('#6B7280');
        pdf.text(invoiceId, margin, 40);

        // Footer
        const footerY = pageHeight - 30;
        pdf.setFontSize(9);
        pdf.setTextColor('#9CA3AF');
        pdf.text('This is an electronically generated invoice. No signature is required.', margin, footerY);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
      }

      pdf.save(`${invoiceId}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    setPrinting(true);
    const node = document.getElementById("invoice-render-node");
    if (!node) return;
    const w = window.open('', '_blank', 'width=800,height=600');
    w.document.write(`<html><head><title>${invoiceId}</title><style>
       body { font-family: sans-serif; margin: 0; padding: 20px; }
    </style></head><body>${node.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); setPrinting(false); }, 500);
  };

  // ── Parse individual payment records for display ──
  const parsePaymentForDisplay = (p) => {
    const amt = Number(p.amount || 0);
    const method = p.method || 'N/A';
    const status = p.status || 'RECEIVED';
    const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-';
    return { id: p.id, amount: amt, method, status, date };
  };

  const getStatusStyles = (status) => {
    const s = String(status).toUpperCase();
    if (s === 'PAID') {
      return { bg: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' };
    }
    if (s === 'PARTIAL' || s === 'PENDING') {
      return { bg: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' };
    }
    if (s === 'CANCELLED') {
      return { bg: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' };
    }
    return { bg: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' };
  };

  const rawInvoiceDate = invoice?.created_at || invoice?.createdAt || appointment?.appointment_date || appointment?.created_date || appointment?.startUTC;
  const invoiceDate = rawInvoiceDate ? new Date(rawInvoiceDate).toLocaleDateString('en-GB').replace(/\//g, '-') : new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

  const statusStyle = getStatusStyles(payStatus);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Preview & Download"
      size="4xl"
      footer={null}
    >
      {loadingAppt ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <p style={{ color: '#64748B', fontSize: '14px', fontWeight: 500 }}>Loading invoice data…</p>
        </div>
      ) : (
      <>
      <div id="invoice-render-node" style={{
              backgroundColor: '#fff', padding: '40px', fontSize: '13px',
              lineHeight: '1.6', color: '#1E293B', fontFamily: '"Inter", sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '2px solid #F1F5F9', paddingBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px', fontWeight: 600 }}>Organization</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E40AF', lineHeight: '1.2' }}>{orgName}</div>
            {orgAddress && <div style={{ color: '#475569', fontSize: '12px', marginTop: '6px', maxWidth: '280px', lineHeight: '1.4' }}>{orgAddress}</div>}
            {activeOrg.phone && <div style={{ color: '#64748B', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>Ph: {activeOrg.phone}</div>}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
            {clinicIcon && !clinicIcon.includes('placeholder') && (
              <img src={clinicIcon} alt="Clinic Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', marginBottom: '8px', border: '1px solid #E2E8F0', padding: '4px', backgroundColor: '#F8FAFC' }} />
            )}
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{clinicName}</div>
            {clinicAddress && <div style={{ color: '#475569', fontSize: '12px', wordBreak: 'break-word', marginLeft: 'auto', maxWidth: '240px', marginTop: '4px', lineHeight: '1.4' }}>{clinicAddress}</div>}
            {clinicPhone && <div style={{ color: '#64748B', fontSize: '12px', marginTop: '4px' }}>Emergency Ph: {clinicPhone}</div>}
            
            {clinicSlotsLines && (
              <div style={{ color: '#64748B', fontSize: '11px', marginTop: '8px', lineHeight: '1.3', backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                <div style={{ fontWeight: 600, color: '#475569', marginBottom: '2px' }}>Clinic Timings:</div>
                {clinicSlotsLines.map((line, idx) => (
                  <div key={idx} style={{ marginTop: '1px' }}>
                    <span style={{ fontWeight: 500 }}>{line.days}</span>: {line.time === 'Close' ? <span style={{ color: '#DC2626', fontWeight: 600 }}>Close</span> : line.time}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', background: '#F8FAFC', padding: '16px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Invoice Number</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{invoiceId}</div>
          </div>
          <div style={{ width: '1px', backgroundColor: '#E2E8F0' }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Invoice Date</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{invoiceDate}</div>
          </div>
          <div style={{ width: '1px', backgroundColor: '#E2E8F0' }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Payment Status</div>
            <span style={{
              display: 'inline-block',
              marginTop: '4px',
              padding: '2px 10px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '12px',
              backgroundColor: statusStyle.bg,
              color: statusStyle.color,
              border: statusStyle.border,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {payStatus}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '24px', background: '#F1F5F9', padding: '14px 20px', borderRadius: '8px', borderLeft: '4px solid #2563EB' }}>
          <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px', fontWeight: 700 }}>Patient Demographics</div>
          {(() => {
            const pid = fetchedPatient?.patient_code || fetchedPatient?.patientCode || fetchedPatient?.patient_id || fetchedPatient?.id || appointment?.patient_code || appointment?.patientCode || appointment?.patient_id || appointment?.patientId;
            const codePart = pid ? String(pid) : '-';
            const namePart = patientName && patientName !== '-' ? patientName : '-';
            const agePart = patientAge && patientAge !== '-' ? patientAge : '-';
            const genderPart = patientGender && patientGender !== '-' ? patientGender : '-';
            const phonePart = patientPhone && patientPhone !== '-' ? patientPhone : '-';
            
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', fontSize: '13px', color: '#1E293B', fontWeight: 600 }}>
                <div><span style={{ color: '#64748B', fontWeight: 500 }}>ID:</span> {codePart}</div>
                <div style={{ width: '1px', height: '12px', backgroundColor: '#CBD5E1' }}></div>
                <div><span style={{ color: '#64748B', fontWeight: 500 }}>Name:</span> {namePart}</div>
                <div style={{ width: '1px', height: '12px', backgroundColor: '#CBD5E1' }}></div>
                <div><span style={{ color: '#64748B', fontWeight: 500 }}>Age/Sex:</span> {agePart} / {genderPart}</div>
                <div style={{ width: '1px', height: '12px', backgroundColor: '#CBD5E1' }}></div>
                <div><span style={{ color: '#64748B', fontWeight: 500 }}>Contact:</span> {phonePart}</div>
              </div>
            );
          })()}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
    
          <div>
            <div style={{ fontSize: '13px', color: '#1E40AF', marginBottom: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>List of Appointments</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ textAlign: 'center', borderBottom: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                  <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700, borderRight: '1px solid #E2E8F0', width: '60px' }}>SR No.</th>
                  <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700, borderRight: '1px solid #E2E8F0', textAlign: 'left' }}>Appointment Date</th>
                  <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700, borderRight: '1px solid #E2E8F0' }}>Day</th>
                  <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700, borderRight: showDuration ? '1px solid #E2E8F0' : 'none' }}>Start Time</th>
                  {showDuration && <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700, borderRight: '1px solid #E2E8F0' }}>End Time</th>}
                  {showDuration && <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Duration</th>}
                </tr>
              </thead>
              <tbody>
                {appointmentsToDisplay.length > 0 ? (
                  appointmentsToDisplay.map((appt, idx) => {
                    const rawDate = appt.appointment_date || appt.appointmentDate || appt.created_date || appt.startUTC || appt.date;
                    const dateObj = rawDate ? new Date(rawDate) : null;
                    const dateStr = (dateObj && !isNaN(dateObj.getTime()))
                      ? dateObj.toLocaleDateString('en-GB').replace(/\//g, '-')
                      : '—';
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const dayStr = (dateObj && !isNaN(dateObj.getTime())) ? days[dateObj.getDay()] : '—';
                    const startTime = appt.start_time || appt.booking_time || appt.appointment_time || '—';
                    
                    return (
                      <tr key={appt.id || idx} style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'center' }}>
                        <td style={{ padding: '9px 12px', borderRight: '1px solid #E2E8F0', color: '#64748B', fontWeight: 500 }}>{idx + 1}</td>
                        <td style={{ padding: '9px 12px', borderRight: '1px solid #E2E8F0', textAlign: 'left', color: '#0F172A', fontWeight: 600 }}>{dateStr}</td>
                        <td style={{ padding: '9px 12px', borderRight: '1px solid #E2E8F0', color: '#2563EB', fontWeight: 700 }}>{dayStr}</td>
                        <td style={{ padding: '9px 12px', borderRight: showDuration ? '1px solid #E2E8F0' : 'none', color: '#334155' }}>{to12Hour(startTime)}</td>
                        {showDuration && <td style={{ padding: '9px 12px', borderRight: '1px solid #E2E8F0', color: '#334155' }}>{to12Hour(appt.end_time)}</td>}
                        {showDuration && <td style={{ padding: '9px 12px', fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>{calculateDurationHours(appt.start_time, appt.end_time)} hrs</td>}
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={showDuration ? 6 : 4} style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>No appointments linked to this bill.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            <div style={{ fontSize: '13px', color: '#1E40AF', marginBottom: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>List of Services</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ textAlign: 'center', borderBottom: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                  <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700, borderRight: '1px solid #E2E8F0', width: '60px' }}>SR No.</th>
                  <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700, borderRight: '1px solid #E2E8F0', textAlign: 'left' }}>Service Name</th>
                  <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700, borderRight: '1px solid #E2E8F0' }}>Unit Price</th>
                  {showDiscount && <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700, borderRight: '1px solid #E2E8F0' }}>Discount</th>}
                  <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Total Price</th>
                </tr>
              </thead>
              <tbody>
                {servicesList.length > 0 ? servicesList.map((s, idx) => {
                  const final = s.price - (s.price * s.discount / 100);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'center' }}>
                      <td style={{ padding: '9px 12px', borderRight: '1px solid #E2E8F0', color: '#64748B', fontWeight: 500 }}>{idx + 1}</td>
                      <td style={{ padding: '9px 12px', borderRight: '1px solid #E2E8F0', textAlign: 'left', color: '#2563EB', fontWeight: 700 }}>{s.name}</td>
                      <td style={{ padding: '9px 12px', borderRight: '1px solid #E2E8F0', color: '#334155', fontWeight: 600 }}>₹{s.price.toFixed(2)}</td>
                      {showDiscount && <td style={{ padding: '9px 12px', borderRight: '1px solid #E2E8F0', color: '#D97706', fontWeight: 700 }}>{s.discount}%</td>}
                      <td style={{ padding: '9px 12px', fontWeight: 800, fontSize: '13px', color: '#1E3A8A' }}>₹{final.toFixed(2)}</td>
                    </tr>
                  );
                }) : (
                  <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <td style={{ padding: '9px 12px', borderRight: '1px solid #E2E8F0', color: '#64748B', fontWeight: 500 }}>1</td>
                    <td style={{ padding: '9px 12px', borderRight: '1px solid #E2E8F0', textAlign: 'left', color: '#2563EB', fontWeight: 700 }}>Dialysis Session</td>
                    <td style={{ padding: '9px 12px', borderRight: '1px solid #E2E8F0', color: '#334155', fontWeight: 600 }}>₹{(totalDue / (appointmentsToDisplay.length || 1)).toFixed(2)}</td>
                    {showDiscount && <td style={{ padding: '9px 12px', borderRight: '1px solid #E2E8F0', color: '#D97706', fontWeight: 700 }}>0%</td>}
                    <td style={{ padding: '9px 12px', fontWeight: 800, fontSize: '13px', color: '#1E3A8A' }}>₹{(totalDue / (appointmentsToDisplay.length || 1)).toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', color: '#1E40AF', marginBottom: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Calculation</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#334155' }}>
              <div>
                <span style={{ fontWeight: 500, color: '#64748B' }}>Gross Amount (Per Session):</span> <strong style={{ color: '#0F172A' }}>₹{grossAmount.toFixed(2)}</strong>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E3A8A', marginTop: '6px', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                Total Invoice Amount: <span style={{ color: '#64748B', fontWeight: 500 }}>₹{grossAmount.toFixed(2)} x {appointmentsToDisplay.length} (sessions) =</span> <span style={{ fontSize: '18px', borderBottom: '2px solid #1E40AF', paddingBottom: '2px', color: '#1E40AF' }}>₹{totalDue.toFixed(2)}</span>
              </div>
              {appointmentsToDisplay.length > 0 && (
                <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', padding: '8px 12px', background: '#FFF', borderRadius: '6px', border: '1px solid #E2E8F0', width: 'fit-content' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }}></span>
                    <span style={{ color: '#475569', fontWeight: 500 }}>Paid Sessions:</span>
                    <span style={{ color: '#16A34A', fontWeight: 700 }}>{appointmentsToDisplay.filter(a => String(a.payment_action).toUpperCase() === 'PAID').length}</span>
                  </div>
                  <div style={{ width: '1px', backgroundColor: '#E2E8F0', height: '12px' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626' }}></span>
                    <span style={{ color: '#475569', fontWeight: 500 }}>Unpaid Sessions:</span>
                    <span style={{ color: '#DC2626', fontWeight: 700 }}>{appointmentsToDisplay.filter(a => String(a.payment_action).toUpperCase() !== 'PAID').length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '35px', borderTop: '2px solid #F1F5F9', paddingTop: '24px', gap: '30px' }}>
          <div style={{ flex: 1.2 }}>
            <div>
              <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Payments</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {fetchedPayments.length > 0 ? fetchedPayments.map((p, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16A34A' }}></span>
                    {new Date(p.createdAt || Date.now()).toLocaleDateString()} - <span style={{ textTransform: 'uppercase', color: '#475569' }}>{p.method || 'cash'}</span> - ₹{p.amount} RECEIVED
                  </div>
                )) : (
                  <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>No payment receipts recorded yet.</div>
                )}
              </div>
            </div>

            {fetchedRefunds?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Refund History</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {fetchedRefunds.map((r, idx) => {
                    const amt = Math.abs(Number(r.amount || r.refundAmount || r.refund_amount || 0));
                    return (
                      <div key={idx} style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#DC2626' }}></span>
                        {new Date(r.createdAt || Date.now()).toLocaleDateString()} - <span style={{ textTransform: 'uppercase', color: '#475569' }}>{r.method || 'refund'}</span> - ₹{amt} REFUNDED
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ width: '260px', textAlign: 'right', background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Bill:</span>
              <strong style={{ color: '#0F172A' }}>₹{totalDue.toFixed(2)}</strong>
            </div>
            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
              <span>Paid Amount:</span>
              <strong style={{ color: '#16A34A' }}>₹{amountPaid.toFixed(2)}</strong>
            </div>
            <div style={{ fontSize: '14px', color: '#475569', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '6px', marginTop: '2px' }}>
              <span style={{ fontWeight: 700 }}>Balance Due:</span>
              <strong style={{ color: '#DC2626', fontSize: '15px' }}>₹{outstanding.toFixed(2)}</strong>
            </div>
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATUS</span>
              <span style={{
                padding: '3px 12px',
                fontSize: '12px',
                fontWeight: 800,
                borderRadius: '6px',
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                border: statusStyle.border,
                textTransform: 'uppercase'
              }}>
                {payStatus}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', borderTop: '2px solid #F1F5F9', paddingTop: '20px' }}>
          <div style={{ fontSize: '11px', color: '#64748B', textAlign: 'center', marginBottom: '12px', fontWeight: 500 }}>
            This is an electronically generated invoice. No signature is required.
          </div>
          <div style={{ fontSize: '9px', color: '#94A3B8', lineHeight: '1.5', textAlign: 'justify' }}>
            Notice: By receiving care, you consent to the processing and secure storage of your health data by authorized third-party technology providers (including Kifayti Health), solely for medical and lawful purposes, in compliance with Indian data protection laws.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', padding: '0 40px 40px' }}>
        <button
          onClick={handlePrint}
          disabled={printing}
          style={{
            padding: '10px 24px',
            fontSize: '12px',
            fontWeight: 700,
            border: '1.5px solid #2563EB',
            borderRadius: '6px',
            background: 'transparent',
            color: '#2563EB',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {printing ? 'Opening...' : 'Print'}
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            padding: '10px 24px',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            borderRadius: '6px',
            background: '#2563EB',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1D4ED8'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#2563EB'; }}
        >
          {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '10px 24px',
            fontSize: '12px',
            fontWeight: 700,
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            background: '#F9FAFB',
            color: '#374151',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
        >
          Close
        </button>
      </div>
      </>
      )}
    </BaseModal>
  );
};

export default InvoicePreview;
