/**
 * DT Appointment & Bill Generation Workflow Simulation Utility
 *
 * Implements and verifies the 9-step DT Frontend Simulation Guide & POST /api/dt/bills endpoint.
 *
 * @file src/utils/dtSimulationWorkflow.js
 */

import {
  getAvailableSlots,
  createAppointment,
  getAppointmentById,
  getAppointmentInvoice,
  addAppointmentPayment,
  getBillDetails,
  getAppointments,
  consumeAppointmentServices,
  cancelAppointment,
  createBill
} from '../ApiCalls/clinicApis';

/**
 * Generate a standard UUID v4 string for Idempotency-Key
 * @returns {string}
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Step 0 & 1: Fetch Available Slots
 */
export async function step1ListSlots(clinicId = 1, fromIso = null, toIso = null) {
  const from = fromIso || new Date().toISOString();
  const to = toIso || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return await getAvailableSlots(clinicId, from, to);
}

/**
 * Step 2: Create Appointment (Unpaid, Partial, or Fully Paid)
 */
export async function step2CreateAppointment(data = {}, idempotencyKey = null) {
  const key = idempotencyKey || generateUUID();
  const payload = {
    patientId: data.patientId || 12,
    clinicId: data.clinicId || 1,
    bookingType: data.bookingType || 'offline',
    slotId: data.slotId || 45,
    startUTC: data.startUTC || '2026-07-21T04:00:00.000Z',
    endUTC: data.endUTC || '2026-07-21T08:00:00.000Z',
    amountDue: data.amountDue ?? 2500,
    currency: data.currency || 'INR',
    services: data.services || [{ name: 'Hemodialysis', amount: 2500 }],
    ...(data.immediatePayment ? { immediatePayment: data.immediatePayment } : {})
  };

  const config = {
    headers: {
      'Idempotency-Key': key
    }
  };

  const result = await createAppointment(payload, config);
  return { ...result, idempotencyKey: key };
}

/**
 * Step 3: Get Appointment Details (Main Billing Check)
 */
export async function step3GetAppointment(appointmentId) {
  return await getAppointmentById(appointmentId);
}

/**
 * Step 4: Get Invoice Only
 */
export async function step4GetInvoice(appointmentId) {
  return await getAppointmentInvoice(appointmentId);
}

/**
 * Step 5: Add Payment to clear pending amount
 */
export async function step5AddPayment(appointmentId, paymentData = {}) {
  const payload = {
    amount: paymentData.amount || 1500,
    method: paymentData.method || 'upi',
    receiptUrl: paymentData.receiptUrl || 'https://example.com/r2.pdf',
    paymentSource: paymentData.paymentSource || 'front-desk'
  };
  return await addAppointmentPayment(appointmentId, payload);
}

/**
 * Step 6: Get Rich Bill Details
 */
export async function step6GetBillDetails(billId) {
  return await getBillDetails(billId);
}

/**
 * Step 7: List Appointments with Filters
 */
export async function step7ListAppointments(params = {}) {
  const queryParams = {
    clinicId: params.clinicId || 1,
    patientId: params.patientId || 12,
    page: params.page || 1,
    limit: params.limit || 20,
    ...params
  };
  return await getAppointments(queryParams);
}

/**
 * Step 8: Consume Service
 */
export async function step8ConsumeService(appointmentId, serviceId = null) {
  const payload = serviceId ? { serviceId } : {};
  return await consumeAppointmentServices(appointmentId, payload);
}

/**
 * Step 9: Cancel + Refund
 */
export async function step9CancelAppointment(appointmentId, cancelData = {}, idempotencyKey = null) {
  const key = idempotencyKey || generateUUID();
  const payload = {
    reason: cancelData.reason || 'Patient requested cancellation',
    refund: cancelData.refund ?? false,
    refundAmount: cancelData.refundAmount ?? 0,
    method: cancelData.method || 'cash'
  };
  const config = {
    headers: {
      'Idempotency-Key': key
    }
  };
  return await cancelAppointment(appointmentId, payload, config);
}

/**
 * Direct Create Bill Test (POST /api/dt/bills)
 */
export async function testCreateBill(billData = {}, idempotencyKey = null) {
  const key = idempotencyKey || generateUUID();
  const payload = {
    appointment_id: billData.appointmentId || billData.appointment_id || 101,
    bill_description: billData.billDescription || billData.bill_description || 'Dialysis session charge',
    consultation_type: billData.consultationType || billData.consultation_type || 'offline',
    total_amt: billData.totalAmount || billData.total_amt || 2500,
    unit_price: billData.unitPrice || billData.unit_price || 2500,
    discount: billData.discount ?? 0,
    service: billData.service || 'Hemodialysis',
    payment_receipt: billData.paymentReceipt || billData.payment_receipt || 'https://example.com/receipts/r-001.pdf'
  };
  const config = {
    headers: {
      'Idempotency-Key': key
    }
  };
  return await createBill(payload, config);
}

/**
 * Runs full 9-step simulation workflow in sequence
 */
export async function runDtSimulationWorkflow(options = {}) {
  const log = [];
  const recordStep = (stepNumber, title, result) => {
    const entry = { step: stepNumber, title, success: result?.success ?? true, result };
    log.push(entry);
    return entry;
  };

  try {
    // Step 1: List slots
    const slotsRes = await step1ListSlots(options.clinicId || 1);
    recordStep(1, 'List available slots', slotsRes);

    // Step 2: Create appointment
    const createRes = await step2CreateAppointment(options.createData || {});
    recordStep(2, 'Create appointment', createRes);

    const apptId = createRes.data?.id || createRes.data?.data?.id || options.fallbackApptId || 101;
    const billId = createRes.data?.invoiceId || createRes.data?.data?.invoiceId || 55;

    // Step 2 retry test (verify idempotency reuse)
    if (createRes.idempotencyKey) {
      const retryRes = await step2CreateAppointment(options.createData || {}, createRes.idempotencyKey);
      recordStep('2-Retry', 'Retry create appointment with same Idempotency-Key', retryRes);
    }

    // Step 3: Get appointment
    const getApptRes = await step3GetAppointment(apptId);
    recordStep(3, 'Get appointment', getApptRes);

    // Step 4: Get invoice
    const getInvoiceRes = await step4GetInvoice(apptId);
    recordStep(4, 'Get appointment invoice', getInvoiceRes);

    // Step 5: Add payment
    const addPayRes = await step5AddPayment(apptId, options.paymentData || {});
    recordStep(5, 'Add payment', addPayRes);

    // Step 6: Get bill details
    const billDetailsRes = await step6GetBillDetails(billId);
    recordStep(6, 'Get rich bill details', billDetailsRes);

    // Step 7: List appointments
    const listRes = await step7ListAppointments({ clinicId: options.clinicId || 1 });
    recordStep(7, 'List appointments', listRes);

    // Step 8: Consume service
    const consumeRes = await step8ConsumeService(apptId);
    recordStep(8, 'Consume service', consumeRes);

    // Step 9: Cancel appointment
    const cancelRes = await step9CancelAppointment(apptId, options.cancelData || {});
    recordStep(9, 'Cancel appointment', cancelRes);

    // Create bill test
    const billTestRes = await testCreateBill({ appointmentId: apptId });
    recordStep('Bill-Create', 'Create direct DT bill (POST /api/dt/bills)', billTestRes);

    return { success: true, log };
  } catch (err) {
    log.push({ step: 'ERROR', error: err.message });
    return { success: false, log, error: err.message };
  }
}

export default {
  step1ListSlots,
  step2CreateAppointment,
  step3GetAppointment,
  step4GetInvoice,
  step5AddPayment,
  step6GetBillDetails,
  step7ListAppointments,
  step8ConsumeService,
  step9CancelAppointment,
  testCreateBill,
  runDtSimulationWorkflow
};
