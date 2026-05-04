import React, { useState, useEffect } from 'react';
import { BaseModal } from '../component-library/modals/BaseModal';
import { Button } from '../component-library';
import { getOutstandingBalance } from '../utils/refundCalculator';
import { getAppointmentById, addAppointmentPayment, updateAppointment } from '../ApiCalls/clinicApis';
import { uploadFile } from '../ApiCalls/dataUpload';
import FileUploadWithCamera from './FileUploadWithCamera';

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
 * Autonomous component that fetches appointment data and records a payment.
 *
 * @param {object} props
 * @param {boolean}  props.isOpen
 * @param {Function} props.onClose
 * @param {string|number} props.appointmentId
 * @param {string|number} [props.billId]
 * @param {Function} [props.onSuccess] - Called when payment succeeds (appointmentId, amount, method, receiptUrl)
 */
const PaymentModal = ({
  isOpen,
  onClose,
  appointmentId,
  billId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [receiptItems, setReceiptItems] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointmentData();
    } else {
      // Reset state when closed
      setAppointment(null);
      setAmount('');
      setMethod('cash');
      setReceiptItems([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, appointmentId]);

  const fetchAppointmentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAppointmentById(appointmentId);
      if (res.success && (res.data?.data || res.data)) {
        const payload = res.data?.data || res.data;
        
        // The API might return { appointment, invoice, payments } or just the appointment directly.
        const appt = payload.appointment || payload;
        const invoice = payload.invoice || {};
        const payments = payload.payments || [];

        // Calculate total due from invoice or appointment
        const totalDue = Number(invoice.total_amt || appt.totalAmount || appt.total_amt || appt.amountDue || appt.amount_due || 0);
        
        // Calculate already paid from payments if available, else fallback to appointment
        let alreadyPaid = Number(appt.amountPaid || appt.received_amt || appt.paidAmount || appt.amount_paid || 0);
        if (payments && payments.length > 0) {
          alreadyPaid = payments
            .filter(p => p.status === 'RECEIVED' || p.status === 'SUCCESS' || p.status === 'PAID')
            .reduce((sum, p) => sum + Number(p.amount || p.raw?.initialAmountPaid || p.raw?.amount || 0), 0);
        }

        // Try to parse patient name from patient_ailments if standard name fields are missing
        let pName = appt.name || appt.patient_name;
        if (!pName && appt.patient_ailments) {
          try {
            const parsed = JSON.parse(appt.patient_ailments);
            pName = parsed.patientName || parsed.name;
          } catch (e) {
            // Ignore parse error
          }
        }

        const mergedAppt = {
          ...appt,
          totalAmount: totalDue,
          amountPaid: alreadyPaid,
          name: pName || 'Patient'
        };

        setAppointment(mergedAppt);

        const outstanding = getOutstandingBalance(totalDue, alreadyPaid);

        if (outstanding > 0) {
          setAmount(String(outstanding));
        }
      } else {
        setError(res.data?.message || 'Failed to fetch appointment details');
      }
    } catch (err) {
      setError(err?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Upload receipt if any
      let receiptUrl = null;
      const activeReceiptFile = receiptItems?.[0]?.file || null;
      if (activeReceiptFile) {
        const formData = new FormData();
        formData.append('file', activeReceiptFile);
        const uploadRes = await uploadFile(formData);
        if (uploadRes.success) {
          receiptUrl = uploadRes.data?.url || uploadRes.data?.file_url || uploadRes.data?.objectUrl;
        } else {
          console.warn('Failed to upload receipt file');
        }
      }

      // 2. Add Payment via API
      const paymentRes = await addAppointmentPayment(appointmentId, {
        amount: Number(amount),
        method: method,
        receiptUrl: receiptUrl || undefined,
        billId: billId || undefined,
      });

      if (!paymentRes.success) {
        throw new Error(paymentRes.data?.message || 'Payment failed to process');
      }

      // 3. Update appointment metadata if partial payment
      const updatedPaid = Number(appointment?.amountPaid || appointment?.received_amt || 0) + Number(amount);
      const totalDue = Number(appointment?.totalAmount || appointment?.total_amt || appointment?.amountDue || 0);

      if (updatedPaid < totalDue) {
        await updateAppointment(appointmentId, {
          metadata: {
            ...(appointment?.metadata || {}),
            payment_status: 'PENDING',
            last_payment_date: new Date().toISOString(),
            outstanding_balance: totalDue - updatedPaid
          }
        });
      }

      if (onSuccess) {
        onSuccess(appointmentId, Number(amount), method, receiptUrl);
      }
      onClose();
    } catch (err) {
      setError(err?.message || 'An error occurred while processing payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalDue = appointment ? Number(appointment.totalAmount || appointment.total_amt || appointment.amountDue || 0) : 0;
  const alreadyPaid = appointment ? Number(appointment.amountPaid || appointment.received_amt || appointment.paidAmount || 0) : 0;
  const outstanding = getOutstandingBalance(totalDue, alreadyPaid);
  const patientName = appointment ? (appointment.name || appointment.patient_name || 'Patient') : 'Loading...';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Dialysis Billing"
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting || !amount || loading}>
            {submitting ? 'Processing…' : 'Dialysis Billing'}
          </Button>
        </div>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
          Loading details...
        </div>
      ) : appointment ? (
        <>
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
              {/* Single-line patient summary: PAT<ID> / NAME / GENDER / PHONE / AGE Yrs */}
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', marginBottom: '12px' }}>
                  {(() => {
                    const pid = appointment?.patient_id || appointment?.patientId || appointment?.patientId || appointment?.id || '';
                    const pidStr = pid ? String(pid) : '';
                    const pidLabel = pidStr ? (pidStr.toUpperCase().startsWith('PAT') ? pidStr : `PAT${pidStr}`) : '';
                    const age = appointment?.age || appointment?.patient_age || appointment?.age || '-';
                    const gender = appointment?.gender || appointment?.patient_gender || appointment?.sex || '-';
                    const phone = appointment?.phoneNumber || appointment?.phone || appointment?.patient_phone || appointment?.mobile_no || '-';
                    const agePart = age && age !== '-' ? `${age} Yrs` : '-';
                    const parts = [pidLabel, patientName, gender, phone, agePart].filter(Boolean).filter(p => p !== '-');
                    const line = parts.join(' / ');
                    return (<span style={{ fontSize: '15px', fontWeight: 800 }}>{line}</span>);
                  })()}
                  {billId && <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'normal' }}> (Bill: {billId})</span>}
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
                  setAmount(String(val));
                }}
                style={inputStyle}
                autoFocus
              />
              {outstanding > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setAmount(String(outstanding))}
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
                    onClick={() => setAmount(String(Math.floor(outstanding / 2)))}
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
                    Partial Payment
                  </button>
                </div>
              )}

              {/* Remaining Balance Display (Added for consistency) */}
              {amount && Number(amount) > 0 && (
                <div 
                  style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    background: '#FEF2F2', 
                    borderRadius: '8px', 
                    border: '1px solid #FECACA',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#991B1B', fontWeight: 600 }}>Remaining Balance</span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#DC2626' }}>
                    ₹{Math.max(0, outstanding - Number(amount)).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method Field */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Payment Method *</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                style={selectStyle}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Receipt Upload */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Upload Receipt (Optional)</label>
              <FileUploadWithCamera
                images={receiptItems}
                onChange={(items) => setReceiptItems(items || [])}
                accept="image/*,.pdf"
                multiple={false}
                showCamera={true}
              />
            </div>

            {/* Error */}
            {error && (
              <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '4px' }}>{error}</p>
            )}

            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
              Payment details will be securely saved to the appointment record.
            </p>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: '#DC2626' }}>
          Failed to load appointment data.
        </div>
      )}
    </BaseModal>
  );
};

export default PaymentModal;
