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
import { getClinicById, getOrganizationById, getAppointmentById } from '../ApiCalls/clinicApis';
import { getPatientById } from '../ApiCalls/patientAPis';
import { getPaymentStatus, getOutstandingBalance } from '../utils/refundCalculator';

const InvoicePreview = ({ isOpen, onClose, appointment: appointmentProp, appointmentId: appointmentIdProp, clinic: initialClinic }) => {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [fetchedClinic, setFetchedClinic] = useState(null);
  const [fetchedOrg, setFetchedOrg] = useState(null);
  const [fetchedPatient, setFetchedPatient] = useState(null);
  const [fetchedAppointment, setFetchedAppointment] = useState(null);
  const [fetchedInvoice, setFetchedInvoice] = useState(null);
  const [fetchedPayments, setFetchedPayments] = useState([]);
  const [fetchedRefunds, setFetchedRefunds] = useState([]);
  const [loadingAppt, setLoadingAppt] = useState(false);

  // Determine the effective appointmentId — prefer explicit prop, fallback to appointment.id
  const effectiveApptId = appointmentIdProp || appointmentProp?.id;

  // ── Fetch appointment detail (invoice + payments) when we have an ID ──
  useEffect(() => {
    if (!isOpen || !effectiveApptId) return;

    const fetchApptDetail = async () => {
      setLoadingAppt(true);
      try {
        const res = await getAppointmentById(effectiveApptId);
        console.log('[InvoicePreview] getAppointmentById response:', res);
        if (res.success && res.data) {
          const body = res.data.data || res.data;
          const appt = body.appointment || body;
          setFetchedAppointment(appt);
          setFetchedInvoice(body.invoice || null);
          setFetchedPayments(Array.isArray(body.payments) ? body.payments : []);
          setFetchedRefunds(Array.isArray(body.refunds) ? body.refunds : []);
        }
      } catch (err) {
        console.error('[InvoicePreview] Failed to fetch appointment detail:', err);
      } finally {
        setLoadingAppt(false);
      }
    };
    fetchApptDetail();
  }, [isOpen, effectiveApptId]);

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
  const invoice = fetchedInvoice;
  const totalDue = Number(invoice?.total_amt || appointment?.total_amount || appointment?.totalAmount || appointment?.total_amt || 0);
  const amountPaidFromLedger = Number(appointment?.amount_paid || 0);
  const amountPaidFallback = Number(appointment?.amountPaid || appointment?.received_amt || 0);
  const amountPaid = amountPaidFromLedger || amountPaidFallback;
  const outstanding = getOutstandingBalance(totalDue, amountPaid);

  let payStatus = getPaymentStatus(totalDue, amountPaid);
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
    // 1. From invoice record (fetched from API)
    if (invoice) {
      const svcName = invoice.service || invoice.bill_description || 'Dialysis Session';
      const unitPrice = Number(invoice.unit_price || invoice.total_amt || 0);
      const discount = Number(invoice.discount || 0);
      return [{ name: svcName, price: unitPrice, discount }];
    }
    // 2. From appointment metadata services array
    const services = appointment?.metadata?.services || appointment?.services || [];
    if (services.length > 0) return services;
    // 3. Fallback single-line
    return [];
  };

  const servicesList = buildServicesList();

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
      const margin = 24;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
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
    const status = p.status || 'CAPTURED';
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
        backgroundColor: '#fff', padding: '24px', fontSize: '13px',
        lineHeight: '1.4', color: '#111', fontFamily: 'sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{orgName}</div>
            {orgAddress && <div style={{ color: BILL_COLORS.textSecondary, fontSize: '12px' }}>{orgAddress}</div>}
            {activeOrg.email && <div style={{ color: BILL_COLORS.textSecondary, fontSize: '11px' }}>Email: {activeOrg.email}</div>}
            {activeOrg.phone && <div style={{ color: BILL_COLORS.textSecondary, fontSize: '11px' }}>Ph: {activeOrg.phone}</div>}
          </div>

          <div style={{ flexShrink: 0, width: '100px', display: 'flex', justifyContent: 'center' }}>
            <img src={clinicIcon} alt="Clinic Logo" crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }} />
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

        <div style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>Bill / Invoice</div>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Patient Info</div>
          <div>Name: {patientName}</div>
          <div>Age: {patientAge}</div>
          <div>Phone: {patientPhone}</div>
        </div>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Appointment Info</div>
          <div>Invoice No: {invoiceId}</div>
          <div>Date: {appointment?.appointment_date || '-'}</div>
          <div>Time: {appointment?.booking_time || appointment?.start_time || '-'}</div>
          <div>Duration: {appointment?.duration || appointment?.dialysisDuration || '-'}</div>
        </div>

        {/* ── Services & Bill Summary (from invoice / API) ── */}
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '12px' }}>Services and Bill Summary</div>
          
          {servicesList.length > 0 ? (
            servicesList.map((s, idx) => {
              const price = Number(s.price || 0);
              const discount = Number(s.discount || 0);
              const finalPrice = price - (price * discount / 100);
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>{s.name} {discount > 0 ? `(${discount}% off)` : ''}</span>
                  <span>₹{finalPrice.toLocaleString()}</span>
                </div>
              );
            })
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{appointment?.reason ? `Dialysis Session — ${appointment.reason}` : 'Dialysis Session'}</span>
              <span>₹{(totalDue || amountPaid).toLocaleString()}</span>
            </div>
          )}

          <div style={{ height: '1px', backgroundColor: BILL_COLORS.divider, margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '8px' }}>
            <span>Net Amount</span>
            <span>₹{(totalDue || amountPaid).toLocaleString()}</span>
          </div>
        </div>

        {/* ── Payment Records (from API payments array) ── */}
        {fetchedPayments.length > 0 && (
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '12px' }}>Payment Records</div>
            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 100px 80px 90px', gap: '4px 8px', fontSize: '12px' }}>
              <div style={{ fontWeight: 700, color: '#6B7280', borderBottom: '1px solid #E5E7EB', paddingBottom: '4px' }}>#</div>
              <div style={{ fontWeight: 700, color: '#6B7280', borderBottom: '1px solid #E5E7EB', paddingBottom: '4px' }}>Date</div>
              <div style={{ fontWeight: 700, color: '#6B7280', borderBottom: '1px solid #E5E7EB', paddingBottom: '4px', textAlign: 'right' }}>Amount</div>
              <div style={{ fontWeight: 700, color: '#6B7280', borderBottom: '1px solid #E5E7EB', paddingBottom: '4px' }}>Method</div>
              <div style={{ fontWeight: 700, color: '#6B7280', borderBottom: '1px solid #E5E7EB', paddingBottom: '4px' }}>Status</div>

              {fetchedPayments.map((p, idx) => {
                const parsed = parsePaymentForDisplay(p);
                return (
                  <React.Fragment key={parsed.id || idx}>
                    <div style={{ padding: '4px 0' }}>{idx + 1}</div>
                    <div style={{ padding: '4px 0' }}>{parsed.date}</div>
                    <div style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>₹{parsed.amount.toLocaleString()}</div>
                    <div style={{ padding: '4px 0', textTransform: 'capitalize' }}>{parsed.method}</div>
                    <div style={{ padding: '4px 0' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                        background: parsed.status === 'CAPTURED' ? '#DCFCE7' : '#FEF9C3',
                        color: parsed.status === 'CAPTURED' ? '#166534' : '#854D0E',
                      }}>{parsed.status}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{ height: '1px', backgroundColor: BILL_COLORS.divider, margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
              <span>Total Paid</span>
              <span style={{ color: BILL_COLORS.success }}>₹{amountPaid.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* ── Refund Records ── */}
        {fetchedRefunds.length > 0 && (
          <div style={{ border: '1px solid #fecaca', borderRadius: '4px', padding: '16px', marginBottom: '16px', background: '#fef2f2' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px', color: BILL_COLORS.dangerDark }}>Refunds</div>
            {fetchedRefunds.map((r, idx) => (
              <div key={r.id || idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                <span>Refund #{idx + 1} — {r.method || 'manual'}</span>
                <span style={{ color: BILL_COLORS.dangerDark, fontWeight: 600 }}>-₹{Number(r.requestedRefund || r.amount || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Payment Status Summary ── */}
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Payment Status</div>
          {(() => {
            const netFixed = (totalDue || amountPaid).toFixed(2);
            const rcvdFixed = amountPaid.toFixed(2);
            const pendFixed = outstanding.toFixed(2);

            if (payStatus === 'PAID') {
              return (
                <div>
                  <div style={{ color: BILL_COLORS.success, fontWeight: 'bold' }}>Status: PAID</div>
                  <div style={{ marginTop: '4px' }}>Net Amount: ₹{netFixed}</div>
                  <div style={{ marginTop: '4px' }}>Amount Received: ₹{rcvdFixed}</div>
                </div>
              );
            } else if (payStatus === 'CANCELLED') {
              return (
                <div>
                  <div style={{ color: BILL_COLORS.dangerDark, fontWeight: 'bold' }}>Status: CANCELLED / REFUND PENDING</div>
                  <div style={{ marginTop: '4px' }}>Paid: ₹{rcvdFixed}</div>
                  <div style={{ marginTop: '4px', color: BILL_COLORS.dangerDark }}>Refund Amount: ₹{rcvdFixed}</div>
                </div>
              );
            } else {
              // Unified PENDING status for both PARTIAL and UNPAID
              return (
                <div>
                  <div style={{ color: BILL_COLORS.warning, fontWeight: 'bold' }}>Status: PENDING</div>
                  {amountPaid > 0 && <div style={{ marginTop: '4px' }}>Paid: ₹{rcvdFixed}</div>}
                  <div style={{ marginTop: '4px' }}>Pending: ₹{pendFixed}</div>
                  <div style={{ marginTop: '4px' }}>Net Amount: ₹{netFixed}</div>
                </div>
              );
            }
          })()}
        </div>

        <div style={{ fontSize: '11px', color: BILL_COLORS.textMuted }}>
          By accepting this e-prescription & invoice printout and receiving care, you consent to the processing and secure storage of your health data by authorized third-party technology providers (including Kifayti Health), solely for medical and lawful purposes, in compliance with Indian data protection laws.
        </div>
        <div style={{ textAlign: 'center', fontSize: '12px', color: BILL_COLORS.textMuted, marginTop: '24px' }}>
          This Bill is electronically Generated No Signature is Required
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button onClick={handlePrint} disabled={printing} style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 600, border: '1px solid #D1D5DB', borderRadius: '8px', background: '#F9FAFB', color: '#374151', cursor: 'pointer' }}>
          {printing ? 'Opening...' : 'Print'}
        </button>
        <button onClick={handleDownload} disabled={downloading} style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 600, border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg,#1E40AF,#3B82F6)', color: '#fff', cursor: 'pointer' }}>
          {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
        <button onClick={onClose} style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 600, border: '1px solid #E5E7EB', borderRadius: '8px', background: '#fff', color: '#111', cursor: 'pointer' }}>
          Close
        </button>
      </div>
      </>
      )}
    </BaseModal>
  );
};

export default InvoicePreview;
