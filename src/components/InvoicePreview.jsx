/**
 * InvoicePreview Component
 * Renders a printable invoice for a dialysis appointment, with PDF download support.
 *
 * @file src/components/InvoicePreview.jsx
 */

import React, { useState } from 'react';
import { BaseModal } from '../component-library/modals/BaseModal';
import { Button } from '../component-library';
import { generateBillPDF } from '../utils/billGenerator';
import { getPaymentStatus, getOutstandingBalance } from '../utils/refundCalculator';

const row = (label, value, bold = false) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '7px 0',
      borderBottom: '1px solid #F3F4F6',
    }}
  >
    <span style={{ fontSize: '13px', color: '#6B7280' }}>{label}</span>
    <span style={{ fontSize: '13px', fontWeight: bold ? 700 : 500, color: '#111827' }}>{value}</span>
  </div>
);

/**
 * InvoicePreview
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen
 * @param {Function} props.onClose
 * @param {object}   props.appointment - The appointment to generate invoice for.
 */
const InvoicePreview = ({ isOpen, onClose, appointment }) => {
  const [downloading, setDownloading] = useState(false);

  if (!appointment) return null;

  const totalDue    = Number(appointment.totalAmount || appointment.total_amt || 0);
  const amountPaid  = Number(appointment.amountPaid  || appointment.received_amt || 0);
  const outstanding = getOutstandingBalance(totalDue, amountPaid);
  const payStatus   = getPaymentStatus(totalDue, amountPaid);
  const invoiceId   = `INV-${appointment.id || Date.now()}`;
  const patientName = appointment.name || appointment.patient_name || 'Patient';

  const payStatusColors = {
    PAID:    { bg: '#DCFCE7', text: '#166534' },
    PARTIAL: { bg: '#FEF9C3', text: '#854D0E' },
    UNPAID:  { bg: '#FEE2E2', text: '#991B1B' },
  };
  const statusColor = payStatusColors[payStatus] || payStatusColors.UNPAID;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateBillPDF(
        {
          invoiceId,
          date: new Date(appointment.appointment_date || appointment.created_date || Date.now()),
          customer: {
            name: patientName,
            id: appointment.patient_id || appointment.id,
            phone: appointment.phoneNumber || appointment.phone,
          },
          items: [{ description: 'Dialysis Session', qty: 1, unitPrice: totalDue || amountPaid }],
          amountDue: totalDue || amountPaid,
          amountPaid,
          currency: '₹',
        },
        { autoDownload: true, downloadFilename: `${invoiceId}.pdf` }
      );
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Preview"
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Downloading…' : '⬇ Download PDF'}
          </Button>
        </div>
      }
    >
      {/* Invoice Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
          borderRadius: '10px',
          padding: '18px 20px',
          marginBottom: '20px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px', letterSpacing: '0.08em' }}>
            INVOICE
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800 }}>{invoiceId}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              backgroundColor: statusColor.bg,
              color: statusColor.text,
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {payStatus}
          </span>
        </div>
      </div>

      {/* Patient Info */}
      <div
        style={{
          background: '#F9FAFB',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '16px',
          border: '1px solid #E5E7EB',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{patientName}</div>
        {appointment.phoneNumber && (
          <div style={{ fontSize: '12px', color: '#6B7280' }}>{appointment.phoneNumber}</div>
        )}
        {appointment.appointment_date && (
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
            Date: {appointment.appointment_date}
          </div>
        )}
      </div>

      {/* Line Items */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            background: '#EFF6FF',
            padding: '8px 12px',
            borderRadius: '6px',
            marginBottom: '4px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF' }}>Description</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF' }}>Amount</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px' }}>
          <span style={{ fontSize: '13px', color: '#374151' }}>Dialysis Session</span>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>
            ₹{(totalDue || amountPaid).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Totals */}
      <div
        style={{
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '12px 14px',
        }}
      >
        {totalDue > 0 && row('Total Due', `₹${totalDue.toLocaleString()}`)}
        {row('Amount Paid', `₹${amountPaid.toLocaleString()}`, false)}
        {outstanding > 0 && row('Outstanding', `₹${outstanding.toLocaleString()}`, true)}
      </div>

      <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '12px', textAlign: 'center' }}>
        This is a computer-generated invoice. No signature required.
      </p>
    </BaseModal>
  );
};

export default InvoicePreview;
