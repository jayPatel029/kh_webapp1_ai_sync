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
          background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '20px',
          border: '1px solid #DBEAFE',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '15px', color: '#1E40AF', marginBottom: '4px' }}>
          {patientName}
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {totalDue > 0 && (
            <span style={{ fontSize: '13px', color: '#4B5563' }}>
              Total: <strong style={{ color: '#111827' }}>₹{totalDue.toLocaleString()}</strong>
            </span>
          )}
          {alreadyPaid > 0 && (
            <span style={{ fontSize: '13px', color: '#4B5563' }}>
              Paid: <strong style={{ color: '#16A34A' }}>₹{alreadyPaid.toLocaleString()}</strong>
            </span>
          )}
          {outstanding > 0 && (
            <span style={{ fontSize: '13px', color: '#4B5563' }}>
              Outstanding: <strong style={{ color: '#DC2626' }}>₹{outstanding.toLocaleString()}</strong>
            </span>
          )}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: payStatus === 'PAID' ? '#DCFCE7' : payStatus === 'PARTIAL' ? '#FEF9C3' : '#FEE2E2',
              color: payStatus === 'PAID' ? '#166534' : payStatus === 'PARTIAL' ? '#854D0E' : '#991B1B',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}
          >
            {payStatus}
          </span>
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
          onChange={(e) => onAmountChange(e.target.value)}
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

      {/* Method Field */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Payment Method</label>
        <select
          value={method}
          onChange={(e) => onMethodChange(e.target.value)}
          style={selectStyle}
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
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
