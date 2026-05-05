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
      const clinicIdVal = appointment?.clinic_id || appointment?.clinicId;
      const patientIdVal = appointment?.patient_id || appointment?.patientId;

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
  }, [isOpen, appointment?.clinic_id, appointment?.clinicId, appointment?.patient_id, appointment?.patientId]);

  if (!appointment && !loadingAppt) return null;

  // ── Derive billing amounts from fetched invoice or appointment fields ──
  const invoice = fetchedInvoice || fetchedBill;
  const totalDue = Number(invoice?.total_amt || appointment?.total_amount || appointment?.totalAmount || appointment?.total_amt || 0);
  
  const amountPaid = fetchedBill ? Number(fetchedBill.paid_amt || 0) : (Number(appointment?.amount_paid || 0) || Number(appointment?.amountPaid || appointment?.received_amt || 0));
  const outstanding = Math.max(0, totalDue - amountPaid);

  let payStatus = fetchedBill ? fetchedBill.payment_status : getPaymentStatus(totalDue, amountPaid);
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

    if (invoice) {
      const svcName = invoice.service || invoice.bill_description || 'Dialysis Session';
      const unitPrice = Number(invoice.unit_price || invoice.total_amt || 0);
      const discount = Number(invoice.discount || 0);
      const count = fetchedBillAppointments.length || 1;
      // If it's a single price for the whole bill, but multiple appts, we might need to divide
      return [{ name: svcName, price: unitPrice / count, discount }];
    }
    return [];
  };

  const servicesList = buildServicesList();
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
    // Payments from getAppointmentById come as parsed receipt objects
    const amt = Number(p.amount || 0);
    const method = p.method || 'N/A';
    const status = p.status || 'RECEIVED';
    const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-';
    return { id: p.id, amount: amt, method, status, date };
  };

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
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading invoice data…</p>
        </div>
      ) : (
      <>
      <div id="invoice-render-node" style={{
              backgroundColor: '#fff', padding: '40px', fontSize: '13px',
              lineHeight: '1.5', color: '#111', fontFamily: '"Inter", sans-serif'
      }}>
              {/* --- HEADER: ORG & CLINIC --- */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
          <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Organization</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1E40AF' }}>{orgName}</div>
                  {orgAddress && <div style={{ color: BILL_COLORS.textSecondary, fontSize: '12px', marginTop: '4px', maxWidth: '250px' }}>{orgAddress}</div>}
                  {activeOrg.phone && <div style={{ color: BILL_COLORS.textSecondary, fontSize: '11px', marginTop: '2px' }}>Ph: {activeOrg.phone}</div>}
          </div>

          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{clinicName}</div>
            {clinicAddress && <div style={{ color: BILL_COLORS.textSecondary, fontSize: '12px', wordBreak: 'break-word', marginLeft: 'auto', maxWidth: '200px' }}>{clinicAddress}</div>}
            {clinicPhone && <div style={{ color: BILL_COLORS.textSecondary, fontSize: '12px' }}>Emergency Ph no: {clinicPhone}</div>}
            
            {clinicSlotsLines && (
              <div style={{ color: BILL_COLORS.textSecondary, fontSize: '12px', marginTop: '6px', lineHeight: '1.2' }}>
                <div style={{ fontWeight: 600 }}>Timings:</div>
                {clinicSlotsLines.map((line, idx) => (
                  <div key={idx} style={{ marginTop: '2px' }}>
                    {line.days}: {line.time === 'Close' ? <span style={{ color: BILL_COLORS.dangerDark }}>Close</span> : line.time}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

              {/* --- PATIENT DETAILS (single-line) --- */}
              <div style={{ marginBottom: '30px', background: '#F8FAFC', padding: '14px 20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 700 }}>Patient Details</div>
                {/* Compose single-line: PATIENT_CODE / PATIENT_NAME / AGE / GENDER / MOBILE_NO */}
                {(() => {
                  const pid = fetchedPatient?.patient_code || fetchedPatient?.patientCode || fetchedPatient?.patient_id || fetchedPatient?.id || appointment?.patient_code || appointment?.patientCode || appointment?.patient_id || appointment?.patientId;
                  const codePart = pid ? String(pid) : '-';
                  const namePart = patientName && patientName !== '-' ? patientName : '-';
                  const agePart = patientAge && patientAge !== '-' ? patientAge : '-';
                  const genderPart = patientGender && patientGender !== '-' ? patientGender : '-';
                  const phonePart = patientPhone && patientPhone !== '-' ? patientPhone : '-';
                  const line = `${codePart} / ${namePart} / ${agePart} / ${genderPart} / ${phonePart}`;
                  return (
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em' }}>{line}</div>
                  );
                })()}
              </div>

              {/* --- THREE MAIN SECTIONS (TABLES) --- */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
          
                {/* Section 1: List of Appointments */}
                <div>
                  <div style={{ fontSize: '14px', color: '#1E40AF', marginBottom: '12px', fontWeight: 800 }}>List of Appointments</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px dashed #CBD5E1' }}>
                    <thead>
                      <tr style={{ textAlign: 'center', borderBottom: '1px dashed #CBD5E1', background: '#F8FAFC' }}>
                        <th style={{ padding: '10px 5px', borderRight: '1px dashed #CBD5E1' }}>SR no.</th>
                        <th style={{ padding: '10px 5px', borderRight: '1px dashed #CBD5E1' }}>Appt Date</th>
                        <th style={{ padding: '10px 5px', borderRight: '1px dashed #CBD5E1' }}>Day</th>
                        <th style={{ padding: '10px 5px', borderRight: showDuration ? '1px dashed #CBD5E1' : 'none' }}>start time</th>
                        {showDuration && <th style={{ padding: '10px 5px', borderRight: '1px dashed #CBD5E1' }}>end time</th>}
                        {showDuration && <th style={{ padding: '10px 5px' }}>Duration</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {fetchedBillAppointments.length > 0 ? (
                        fetchedBillAppointments.map((appt, idx) => {
                          const dateObj = new Date(appt.appointment_date);
                          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                          return (
                      <tr key={appt.id || idx} style={{ borderBottom: '1px dashed #CBD5E1', textAlign: 'center' }}>
                        <td style={{ padding: '8px', borderRight: '1px dashed #CBD5E1' }}>{idx + 1}</td>
                        <td style={{ padding: '8px', borderRight: '1px dashed #CBD5E1' }}>{dateObj.toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                        <td style={{ padding: '8px', borderRight: '1px dashed #CBD5E1', color: '#1E40AF', fontWeight: 700 }}>{days[dateObj.getDay()]}</td>
                        <td style={{ padding: '8px', borderRight: showDuration ? '1px dashed #CBD5E1' : 'none' }}>{to12Hour(appt.start_time)}</td>
                        {showDuration && <td style={{ padding: '8px', borderRight: '1px dashed #CBD5E1' }}>{to12Hour(appt.end_time)}</td>}
                        {showDuration && <td style={{ padding: '8px', fontWeight: 800, fontSize: '14px' }}>{calculateDurationHours(appt.start_time, appt.end_time)}</td>}
                      </tr>
                    );
                  })
                      ) : (
                        <tr><td colSpan={showDuration ? 6 : 4} style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>No appointments linked to this bill.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Section 2: List of Services */}
                <div>
                  <div style={{ fontSize: '14px', color: '#1E40AF', marginBottom: '12px', fontWeight: 800 }}>List of Services</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px dashed #CBD5E1' }}>
                    <thead>
                      <tr style={{ textAlign: 'center', borderBottom: '1px dashed #CBD5E1', background: '#F8FAFC' }}>
                        <th style={{ padding: '10px 5px', borderRight: '1px dashed #CBD5E1' }}>SR no.</th>
                        <th style={{ padding: '10px 5px', borderRight: '1px dashed #CBD5E1' }}>Service Name</th>
                        <th style={{ padding: '10px 5px', borderRight: showDiscount ? '1px dashed #CBD5E1' : 'none' }}>Unit Price</th>
                        {showDiscount && <th style={{ padding: '10px 5px', borderRight: '1px dashed #CBD5E1' }}>Discount</th>}
                        <th style={{ padding: '10px 5px' }}>price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicesList.length > 0 ? servicesList.map((s, idx) => {
                        const final = s.price - (s.price * s.discount / 100);
                        return (
                          <tr key={idx} style={{ borderBottom: '1px dashed #CBD5E1', textAlign: 'center' }}>
                            <td style={{ padding: '8px', borderRight: '1px dashed #CBD5E1' }}>{idx + 1}</td>
                            <td style={{ padding: '8px', borderRight: '1px dashed #CBD5E1', color: '#3b82f6', fontWeight: 700 }}>{s.name}</td>
                            <td style={{ padding: '8px', borderRight: showDiscount ? '1px dashed #CBD5E1' : 'none' }}>{s.price}</td>
                            {showDiscount && <td style={{ padding: '8px', borderRight: '1px dashed #CBD5E1', color: '#f59e0b', fontWeight: 700 }}>{s.discount} %</td>}
                            <td style={{ padding: '8px', fontWeight: 800, fontSize: '14px', color: '#1e3a8a' }}>{final.toFixed(2)}</td>
                          </tr>
                        );
                      }) : (
                        <tr style={{ borderBottom: '1px dashed #CBD5E1', textAlign: 'center' }}>
                          <td style={{ padding: '8px', borderRight: '1px dashed #CBD5E1' }}>1</td>
                          <td style={{ padding: '8px', borderRight: '1px dashed #CBD5E1', color: '#3b82f6', fontWeight: 700 }}>Dialysis</td>
                          <td style={{ padding: '8px', borderRight: showDiscount ? '1px dashed #CBD5E1' : 'none' }}>{(totalDue / (fetchedBillAppointments.length || 1)).toFixed(2)}</td>
                          {showDiscount && <td style={{ padding: '8px', borderRight: '1px dashed #CBD5E1', color: '#f59e0b', fontWeight: 700 }}>0 %</td>}
                          <td style={{ padding: '8px', fontWeight: 800, fontSize: '14px', color: '#1e3a8a' }}>{(totalDue / (fetchedBillAppointments.length || 1)).toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Section 3: Payment amount breakdown */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '13px', color: '#1E40AF', marginBottom: '15px', fontWeight: 800 }}>Payment amount breakdown by services and appts</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '16px', fontWeight: 800 }}>
                    <div style={{ color: '#1e3a8a' }}>
                      gross amount: {grossAmount.toFixed(2)}
                    </div>
                    <div style={{ color: '#1e3a8a', marginTop: '10px' }}>
                      Final Amount: gross amount X no. of appt = {grossAmount.toFixed(2)} x {fetchedBillAppointments.length} = <span style={{ fontSize: '22px', borderBottom: '2px solid #1E40AF' }}>{totalDue.toFixed(2)}</span>
                    </div>
                    {fetchedBillAppointments.length > 0 && (
                      <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px', padding: '10px', background: '#F1F5F9', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }}></span>
                          <span style={{ color: '#475569' }}>Paid Sessions:</span>
                          <span style={{ color: '#16A34A', fontWeight: 900 }}>{fetchedBillAppointments.filter(a => String(a.payment_action).toUpperCase() === 'PAID').length}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626' }}></span>
                          <span style={{ color: '#475569' }}>Unpaid Sessions:</span>
                          <span style={{ color: '#DC2626', fontWeight: 900 }}>{fetchedBillAppointments.filter(a => String(a.payment_action).toUpperCase() !== 'PAID').length}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* --- RECEIPT HISTORY & STATUS --- */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '40px', borderTop: '1px dashed #CBD5E1', paddingTop: '20px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, marginBottom: '10px' }}>RECENT RECEIPTS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {fetchedPayments.map((p, idx) => (
                      <div key={idx} style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
                        • {new Date(p.createdAt || Date.now()).toLocaleDateString()} - {p.method || 'cash'} - ₹{p.amount} RECEIVED
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ width: '250px', textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Amount Paid: <strong style={{ color: '#16A34A' }}>₹{amountPaid}</strong></div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Balance Due: <strong style={{ color: '#DC2626' }}>₹{outstanding}</strong></div>
                  <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: 900, color: payStatus === 'PAID' ? '#16A34A' : '#DC2626' }}>{payStatus}</div>
                </div>
        </div>

              {/* --- FOOTER --- */}
              <div style={{ marginTop: '50px', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'center', marginBottom: '15px' }}>
                  This is an electronically generated invoice. No signature is required.
                </div>
                <div style={{ fontSize: '9px', color: '#94A3B8', lineHeight: '1.4', textAlign: 'justify' }}>
                  Notice: By receiving care, you consent to the processing and secure storage of your health data by authorized third-party technology providers (including Kifayti Health), solely for medical and lawful purposes, in compliance with Indian data protection laws.
                </div>
        </div>
      </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', padding: '0 40px 40px' }}>
              <button onClick={handlePrint} disabled={printing} style={{ padding: '8px 20px', fontSize: '12px', fontWeight: 600, border: '1px solid #E2E8F0', borderRadius: '6px', background: '#fff', color: '#475569', cursor: 'pointer' }}>
          {printing ? 'Opening...' : 'Print'}
        </button>
              <button onClick={handleDownload} disabled={downloading} style={{ padding: '8px 20px', fontSize: '12px', fontWeight: 600, border: 'none', borderRadius: '6px', background: '#1E40AF', color: '#fff', cursor: 'pointer' }}>
                {downloading ? 'Download PDF' : 'Download PDF'}
        </button>
              <button onClick={onClose} style={{ padding: '8px 20px', fontSize: '12px', fontWeight: 600, border: '1px solid #E2E8F0', borderRadius: '6px', background: '#fff', color: '#111', cursor: 'pointer' }}>
          Close
        </button>
      </div>
      </>
      )}
    </BaseModal>
  );
};

export default InvoicePreview;
