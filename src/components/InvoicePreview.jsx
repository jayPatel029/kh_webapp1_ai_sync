/**
 * InvoicePreview Component
 * Renders a formal, professional dialysis invoice with data fetched from Clinic and Organization APIs.
 * Supports Print and PDF Download (via html2canvas & jsPDF).
 *
 * @file src/components/InvoicePreview.jsx
 */

import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { BaseModal } from '../component-library/modals/BaseModal';
import { getClinicById, getOrganizationById } from '../ApiCalls/clinicApis';
import { getPaymentStatus, getOutstandingBalance } from '../utils/refundCalculator';

const InvoicePreview = ({ isOpen, onClose, appointment, clinic: initialClinic }) => {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [fetchedClinic, setFetchedClinic] = useState(null);
  const [fetchedOrg, setFetchedOrg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const clinicIdProp = appointment?.clinic_id || appointment?.clinicId;
      if (isOpen && clinicIdProp) {
        try {
          const res = await getClinicById(clinicIdProp);
          if (res && res.success && res.data) {
            // The API response might wrap the record in a 'data' property
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
    fetchData();
  }, [isOpen, appointment?.clinic_id, appointment?.clinicId]);

  if (!appointment) return null;

  const totalDue = Number(appointment.totalAmount || appointment.total_amt || 0);
  const amountPaid = Number(appointment.amountPaid || appointment.received_amt || 0);
  const outstanding = getOutstandingBalance(totalDue, amountPaid);

  let payStatus = getPaymentStatus(totalDue, amountPaid);
  if (appointment.status === 'CANCELLED') payStatus = 'CANCELLED';

  const invoiceId = `INV-${appointment.id || Date.now()}`;
  const patientName = appointment.name || appointment.patient_name || 'Patient';

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

  const clinicName = activeClinic.clinicName || activeClinic.clinic_name || activeClinic.name || appointment.clinic_name || 'Clinic';

  const addrObj = activeClinic.address;
  let clinicAddress = '';
  if (addrObj && typeof addrObj === 'object') {
    clinicAddress = [addrObj.line1, addrObj.city, addrObj.state, addrObj.postal].filter(Boolean).join(', ');
  } else {
    clinicAddress = activeClinic.address || '';
  }

  const contactObj = activeClinic.contact;
  const clinicPhone = contactObj?.phone || contactObj?.whatsapp || activeClinic.phone || activeClinic.phoneNumber || activeClinic.phone_number || appointment.phoneNumber || '';

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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Preview & Download"
      size="4xl"
      footer={null}
    >
      <div id="invoice-render-node" style={{
        backgroundColor: '#fff', padding: '24px', fontSize: '13px',
        lineHeight: '1.4', color: '#111', fontFamily: 'sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{orgName}</div>
            {/* {activeOrg.id && <div style={{ color: BILL_COLORS.textSecondary, fontSize: '11px', fontWeight: 600 }}>Org ID: #{activeOrg.id}</div>} */}
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
          <div>Age: {appointment.age || '-'}</div>
          <div>Phone: {appointment.phoneNumber || appointment.phone || '-'}</div>
        </div>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Appointment Info</div>
          <div>Invoice No: {invoiceId}</div>
          <div>Date: {appointment.appointment_date || '-'}</div>
          <div>Time: {appointment.booking_time || appointment.start_time || '-'}</div>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '12px' }}>Services and Bill Summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>{appointment.reason ? `Dialysis Session — ${appointment.reason}` : 'Dialysis Session'}</span>
            <span>₹{(totalDue || amountPaid).toLocaleString()}</span>
          </div>
          <div style={{ height: '1px', backgroundColor: BILL_COLORS.divider, margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '8px' }}>
            <span>Net Amount</span>
            <span>₹{(totalDue || amountPaid).toLocaleString()}</span>
          </div>
        </div>

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
            } else if (payStatus === 'PARTIAL') {
              return (
                <div>
                  <div style={{ color: BILL_COLORS.warning, fontWeight: 'bold' }}>Status: PARTIAL</div>
                  <div style={{ marginTop: '4px' }}>Paid: ₹{rcvdFixed}</div>
                  <div style={{ marginTop: '4px' }}>Pending: ₹{pendFixed}</div>
                  <div style={{ marginTop: '4px' }}>Net Amount: ₹{netFixed}</div>
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
              return (
                <div>
                  <div style={{ color: BILL_COLORS.dangerDark, fontWeight: 'bold' }}>Status: UNPAID</div>
                  <div style={{ marginTop: '4px', color: BILL_COLORS.dangerDark }}>Pending Amount: ₹{netFixed}</div>
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
    </BaseModal>
  );
};

export default InvoicePreview;
