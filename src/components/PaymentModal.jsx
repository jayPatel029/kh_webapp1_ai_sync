/**
 * PaymentModal Component
 * Records a payment (full or partial) for an appointment.
 *
 * @file src/components/PaymentModal.jsx
 */

import React from 'react';
import { BaseModal } from '../component-library/modals/BaseModal';
import { Button } from '../component-library';
import { getOutstandingBalance, getPaymentStatus } from '../utils/refundCalculator';

const PAYMENT_METHODS = ['cash', 'card', 'upi', 'bank_transfer', 'cheque'];

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginBottom: '16px',
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid #D1D5DB',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const selectStyle = {
  ...inputStyle,
  backgroundColor: '#fff',
  cursor: 'pointer',
};

/**
 * PaymentModal
 *
 * @param {object} props
 * @param {boolean}  props.isOpen
 * @param {Function} props.onClose
 * @param {object}   props.appointment - The appointment being paid for.
 * @param {string}   props.amount      - Controlled amount input value.
 * @param {string}   props.method      - Payment method.
 * @param {string|null} props.error    - Error message.
 * @param {boolean}  props.submitting
 * @param {Function} props.onAmountChange
 * @param {Function} props.onMethodChange
 * @param {Function} props.onSubmit
 */
const PaymentModal = ({
  isOpen,
  onClose,
  appointment,
  amount,
  method,
  error,
  submitting,
  onAmountChange,
  onMethodChange,
  onSubmit,
}) => {
  if (!appointment) return null;

  const totalDue    = Number(appointment.totalAmount || appointment.total_amt || 0);
  const alreadyPaid = Number(appointment.amountPaid  || appointment.received_amt || 0);
  const outstanding = getOutstandingBalance(totalDue, alreadyPaid);
  const payStatus   = getPaymentStatus(totalDue, alreadyPaid);
  const patientName = appointment.name || appointment.patient_name || 'Patient';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={submitting || !amount}>
            {submitting ? 'Processing…' : 'Record Payment'}
          </Button>
        </div>
      }
    >
      {/* Patient Summary */}
      <div
        style={{
          background: '#F9FAFB',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #E5E7EB',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', marginBottom: '12px' }}>
          {patientName}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#6B7280' }}>Total Bill:</span>
            <span style={{ fontWeight: 600 }}>₹{totalDue.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#6B7280' }}>Amount Paid:</span>
            <span style={{ fontWeight: 600, color: '#16A34A' }}>₹{alreadyPaid.toLocaleString()}</span>
          </div>
          <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#111827', fontWeight: 600 }}>Remaining Balance:</span>
            <span style={{ fontWeight: 800, color: '#DC2626' }}>₹{outstanding.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Amount Field */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Payment Amount (₹) *</label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder={outstanding > 0 ? `Outstanding: ₹${outstanding}` : 'Enter amount'}
          value={amount}
          onChange={(e) => {
            let val = Number(e.target.value);
            if (outstanding > 0 && val > outstanding) val = outstanding;
            onAmountChange(String(val));
          }}
          style={inputStyle}
          autoFocus
        />
        {outstanding > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => onAmountChange(String(outstanding))}
              style={{
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid #3B82F6',
                borderRadius: '6px',
                background: '#EFF6FF',
                color: '#1E40AF',
                cursor: 'pointer',
              }}
            >
              Pay Full (₹{outstanding})
            </button>
            <button
              type="button"
              onClick={() => onAmountChange(String(Math.floor(outstanding / 2)))}
              style={{
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                background: '#F9FAFB',
                color: '#4B5563',
                cursor: 'pointer',
              }}
            >
              Pay Half
            </button>
          </div>
        )}
      </div>

      {/* Receipt Upload */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Upload Receipt (Optional)</label>
        <div
          style={{
            border: '2px dashed #D1D5DB',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#F9FAFB',
            transition: 'border-color 0.15s'
          }}
          onClick={() => document.getElementById('receipt-upload-input').click()}
        >
          <span style={{ fontSize: '13px', color: '#6B7280' }}>
            {method === 'receipt_included' ? 'File selected' : 'Click to upload receipt (PDF/Image)'}
          </span>
          <input
            id="receipt-upload-input"
            type="file"
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
               const file = e.target.files[0];
               if (file) onMethodChange('receipt_file', file);
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '4px' }}>{error}</p>
      )}

      <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
        An invoice PDF will be generated and saved automatically after recording the payment.
      </p>
    </BaseModal>
  );
};

export default PaymentModal;
