/**
 * RefundModal Component
 * Displays refund details and allows the user to confirm/process refund on cancellation.
 *
 * @file src/components/RefundModal.jsx
 */

import React, { useState } from 'react';
import { BaseModal } from '../component-library/modals/BaseModal';
import { Button } from '../component-library';

const infoRow = (label, value, valueStyle = {}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #F3F4F6',
    }}
  >
    <span style={{ fontSize: '13px', color: '#6B7280' }}>{label}</span>
    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', ...valueStyle }}>{value}</span>
  </div>
);

/**
 * RefundModal
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen
 * @param {Function} props.onClose
 * @param {object}   props.appointment - Appointment being cancelled.
 * @param {object}   props.refundData  - { refundAmount, reason, eligible } from calculateRefund().
 * @param {boolean}  props.submitting
 * @param {string|null} props.error
 * @param {Function} props.onConfirm   - Called with (reason: string) when user confirms.
 */
const RefundModal = ({
  isOpen,
  onClose,
  appointment,
  refundData,
  submitting,
  error,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');

  if (!appointment) return null;

  const patientName  = appointment.name || appointment.patient_name || 'Patient';
  const amountPaid   = Number(appointment.amountPaid || appointment.received_amt || 0);
  const refundAmount = refundData?.refundAmount || 0;
  const eligible     = refundData?.eligible ?? false;

  const handleConfirm = () => {
    onConfirm?.(reason);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel & Refund"
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={submitting || !eligible}
            style={{ background: eligible ? '#DC2626' : '#9CA3AF', borderColor: eligible ? '#DC2626' : '#9CA3AF' }}
          >
            {submitting ? 'Processing…' : eligible ? 'Confirm Cancellation & Refund' : 'Cancel Appointment'}
          </Button>
        </div>
      }
    >
      {/* Warning banner */}
      <div
        style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: '20px' }}>⚠️</span>
        <div>
          <p style={{ fontWeight: 700, color: '#991B1B', fontSize: '14px', margin: 0 }}>
            This action cannot be undone
          </p>
          <p style={{ color: '#7F1D1D', fontSize: '12px', margin: '4px 0 0 0' }}>
            Cancelling will delete the appointment. A refund PDF will be generated.
          </p>
        </div>
      </div>

      {/* Refund Summary */}
      <div
        style={{
          background: '#F9FAFB',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '20px',
          border: '1px solid #E5E7EB',
        }}
      >
        <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', color: '#111827' }}>
          Refund Summary
        </p>
        {infoRow('Patient', patientName)}
        {infoRow('Amount Paid', `₹${amountPaid.toLocaleString()}`)}
        {infoRow(
          'Refund Amount',
          eligible ? `₹${refundAmount.toLocaleString()}` : 'No Refund',
          { color: eligible ? '#16A34A' : '#DC2626' }
        )}
        {infoRow('Policy Note', refundData?.reason || '—', { fontSize: '12px', color: '#6B7280', fontWeight: 400 })}
      </div>

      {/* Reason Field */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}
        >
          Cancellation Reason
        </label>
        <textarea
          rows={3}
          placeholder="Enter reason for cancellation (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: '8px',
            border: '1px solid #D1D5DB',
            fontSize: '13px',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: '#DC2626', fontSize: '13px' }}>{error}</p>
      )}

      {eligible && (
        <p style={{ fontSize: '12px', color: '#6B7280' }}>
          A refund receipt PDF will be generated and uploaded automatically.
        </p>
      )}
    </BaseModal>
  );
};

export default RefundModal;
