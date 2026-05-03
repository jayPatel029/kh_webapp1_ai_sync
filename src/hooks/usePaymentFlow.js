/**
 * usePaymentFlow Hook
 * Manages payment modal state, receipt/refund generation and upload.
 *
 * @file src/hooks/usePaymentFlow.js
 */

import { useState, useCallback } from 'react';
import { generateBillPDF, generateRefundPDF } from '../utils/billGenerator';
import { calculateRefund, getPaymentStatus, getOutstandingBalance } from '../utils/refundCalculator';
import { uploadFile } from '../ApiCalls/dataUpload';

/**
 * Hook to manage the entire payment/refund flow for a dialysis appointment.
 *
 * @param {Function} onPaymentAdded - Callback after a payment is recorded (appointmentId, amount, method).
 * @param {Function} onRefundProcessed - Callback after refund is processed (appointmentId).
 * @returns {object} - State and handlers for payment/refund flow.
 */
export default function usePaymentFlow({ onPaymentAdded, onRefundProcessed } = {}) {
  // ─── Payment modal state ─────────────────────────────
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    appointment: null,
    amount: '',
    method: 'cash',
    receipt_file: null,
    submitting: false,
    error: null,
  });

  // ─── Refund modal state ──────────────────────────────
  const [refundModal, setRefundModal] = useState({
    isOpen: false,
    appointment: null,
    refundData: null,
    submitting: false,
    error: null,
  });

  // ─── Invoice/PDF state ───────────────────────────────
  const [pdfLoading, setPdfLoading] = useState(false);

  // ─── Payment modal helpers ───────────────────────────
  const openPaymentModal = useCallback((appointment) => {
    const totalDue = Number(appointment?.totalAmount || appointment?.total_amt || 0);
    const alreadyPaid = Number(appointment?.amountPaid || appointment?.received_amt || 0);
    const outstanding = getOutstandingBalance(totalDue, alreadyPaid);

    setPaymentModal({
      isOpen: true,
      appointment,
      amount: outstanding > 0 ? String(outstanding) : '',
      method: 'cash',
      receipt_file: null,
      submitting: false,
      error: null,
    });
  }, []);

  const closePaymentModal = useCallback(() => {
    setPaymentModal((prev) => ({ ...prev, isOpen: false, appointment: null, receipt_file: null }));
  }, []);

  const updatePaymentField = useCallback((field, value) => {
    setPaymentModal((prev) => ({ ...prev, [field]: value, error: null }));
  }, []);

  /**
   * Submit a payment. Generates an invoice PDF, uploads it, and calls the
   * onPaymentAdded callback.
   */
  const submitPayment = useCallback(async () => {
    const { appointment, amount, method, receipt_file } = paymentModal;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setPaymentModal((prev) => ({ ...prev, error: 'Please enter a valid amount.' }));
      return;
    }

    setPaymentModal((prev) => ({ ...prev, submitting: true, error: null }));

    try {
      const paidAmount = Number(amount);
      const totalPaid = Number(appointment?.amountPaid || 0) + paidAmount;
      const totalDue = Number(appointment?.totalAmount || appointment?.total_amt || 0);

      // 1. Upload manual receipt if provided
      let manualReceiptUrl = null;
      if (receipt_file) {
        try {
          const formData = new FormData();
          formData.append('file', receipt_file);
          const uploadRes = await uploadFile(formData);
          if (uploadRes.success) {
            manualReceiptUrl = uploadRes.data?.url || uploadRes.data?.file_url;
          }
        } catch (e) {
          console.warn('Manual receipt upload failed:', e);
        }
      }

      // 2. Build bill data for auto-generated PDF
      const billData = {
        invoiceId: `INV-${appointment?.id || Date.now()}`,
        date: new Date(),
        customer: {
          name: appointment?.name || appointment?.patient_name || 'Patient',
          id: appointment?.patient_id || appointment?.id,
          phone: appointment?.phoneNumber || appointment?.phone,
        },
        items: [
          {
            description: 'Dialysis Session',
            qty: 1,
            unitPrice: totalDue || paidAmount,
          },
        ],
        amountDue: totalDue || paidAmount,
        amountPaid: totalPaid,
        currency: '₹',
        notes: `Payment method: ${method}`,
      };

      // 3. Generate and upload Auto-Generated PDF
      let billPDFUrl = null;
      try {
        const blob = await generateBillPDF(billData, { returnBlob: true, autoDownload: false });
        const formData = new FormData();
        formData.append('file', blob, `${billData.invoiceId}.pdf`);
        const uploadResult = await uploadFile(formData);
        if (uploadResult.success) {
          billPDFUrl = uploadResult.data?.url || uploadResult.data?.file_url || null;
        }
      } catch (pdfErr) {
        console.warn('PDF generation/upload failed (non-fatal):', pdfErr);
      }

      // Prioritize manual receipt URL over auto-generated PDF for receipt_url
      onPaymentAdded?.(appointment, paidAmount, method, billPDFUrl || manualReceiptUrl);
      closePaymentModal();
    } catch (err) {
      setPaymentModal((prev) => ({
        ...prev,
        submitting: false,
        error: err.message || 'Payment failed. Please try again.',
      }));
    }
  }, [paymentModal, onPaymentAdded, closePaymentModal]);

  // ─── Refund modal helpers ────────────────────────────
  const openRefundModal = useCallback((appointment, policy = 'full') => {
    const refundData = calculateRefund(appointment, policy);
    setRefundModal({
      isOpen: true,
      appointment,
      refundData,
      submitting: false,
      error: null,
    });
  }, []);

  const closeRefundModal = useCallback(() => {
    setRefundModal((prev) => ({ ...prev, isOpen: false, appointment: null }));
  }, []);

  /**
   * Process refund. Generates refund PDF, uploads it, and calls onRefundProcessed.
   */
  const processRefund = useCallback(async (reason = '') => {
    const { appointment, refundData } = refundModal;

    if (!refundData?.eligible) {
      setRefundModal((prev) => ({
        ...prev,
        error: refundData?.reason || 'Refund not eligible.',
      }));
      return;
    }

    setRefundModal((prev) => ({ ...prev, submitting: true, error: null }));

    try {
      const refundPDFData = {
        refundId: `REF-${appointment?.id || Date.now()}`,
        date: new Date(),
        originalInvoiceId: `INV-${appointment?.id}`,
        customer: {
          name: appointment?.name || appointment?.patient_name || 'Patient',
          id: appointment?.patient_id || appointment?.id,
        },
        refundAmount: refundData.refundAmount,
        originalAmountPaid: Number(appointment?.amountPaid || 0),
        reason: reason || refundData.reason,
        method: appointment?.paymentMethod || 'original payment method',
      };

      // Generate and upload refund PDF
      let refundPDFUrl = null;
      try {
        const blob = await generateRefundPDF(refundPDFData, { returnBlob: true, autoDownload: false });
        const formData = new FormData();
        formData.append('file', blob, `${refundPDFData.refundId}.pdf`);
        const uploadResult = await uploadFile(formData);
        if (uploadResult.success) {
          refundPDFUrl = uploadResult.data?.url || uploadResult.data?.file_url || null;
        }
      } catch (pdfErr) {
        console.warn('Refund PDF generation/upload failed (non-fatal):', pdfErr);
      }

      onRefundProcessed?.(appointment.id, refundData.refundAmount, refundPDFUrl);
      closeRefundModal();
    } catch (err) {
      setRefundModal((prev) => ({
        ...prev,
        submitting: false,
        error: err.message || 'Refund processing failed.',
      }));
    }
  }, [refundModal, onRefundProcessed, closeRefundModal]);

  // ─── Direct PDF download ─────────────────────────────
  const downloadInvoicePDF = useCallback(async (appointment) => {
    setPdfLoading(true);
    try {
      const totalDue = Number(appointment?.totalAmount || appointment?.total_amt || 0);
      const amountPaid = Number(appointment?.amountPaid || appointment?.received_amt || 0);

      const billData = {
        invoiceId: `INV-${appointment?.id || Date.now()}`,
        date: new Date(appointment?.appointment_date || Date.now()),
        customer: {
          name: appointment?.name || appointment?.patient_name || 'Patient',
          id: appointment?.patient_id || appointment?.id,
          phone: appointment?.phoneNumber || appointment?.phone,
        },
        items: [
          {
            description: 'Dialysis Session',
            qty: 1,
            unitPrice: totalDue || amountPaid,
          },
        ],
        amountDue: totalDue || amountPaid,
        amountPaid,
        currency: '₹',
      };

      await generateBillPDF(billData, {
        autoDownload: true,
        downloadFilename: `Invoice-${appointment?.id || 'bill'}.pdf`,
      });
    } catch (err) {
      console.error('Invoice download failed:', err);
    } finally {
      setPdfLoading(false);
    }
  }, []);

  return {
    // Payment
    paymentModal,
    openPaymentModal,
    closePaymentModal,
    updatePaymentField,
    submitPayment,
    // Refund
    refundModal,
    openRefundModal,
    closeRefundModal,
    processRefund,
    // PDF
    pdfLoading,
    downloadInvoicePDF,
    // Helpers
    getPaymentStatus,
    getOutstandingBalance,
  };
}
