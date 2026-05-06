import { createBill } from '../ApiCalls/clinicApis';
import { uploadFile } from '../ApiCalls/dataUpload';
import { generateBillPDF } from '../utils/billGenerator';

/**
 * createBillForAppointment
 * 
 * Logic to generate a single bill for all sessions and services.
 * 
 * @param {Object} params
 * @param {number|string} params.appointmentId - The ID of the primary appointment to link
 * @param {Array} params.sessions - Generated appointment sessions
 * @param {Array} params.services - Selected services
 * @param {Object} params.form - createForm data
 * @param {Object} params.patientData - selectedPatientData
 * @returns {Promise<{billId: string, receiptUrl: string}>}
 */
export async function createBillForAppointment({
  appointmentId,
  sessions,
  services,
  form,
  patientData,
}) {
  const totalDue = Number(form.total_amount) || 0;
  const amountPaid = Number(form.amount_paid) || 0;
  
  const serviceNames = services.map(s => s.name).join(', ') || 'Dialysis Session';
  const billDescription = `Dialysis booking for ${sessions.length} sessions. Services: ${serviceNames}`;
  const tempBillId = `BILL-${Date.now()}`;

  let receiptUrl = null;

  // 1. Generate and Upload PDF first to get the URL
  try {
    const pdfBlob = await generateBillPDF({
      invoiceId: tempBillId,
      date: new Date(),
      customer: {
        name: patientData?.name || 'Patient',
        phone: patientData?.phoneno || patientData?.phone || '',
        age: patientData?.age,
        gender: patientData?.gender,
      },
      items: services.map(s => ({
        description: s.name,
        qty: Math.max(sessions.length, 1),
        unitPrice: s.price,
        discount: s.discount
      })),
      amountDue: totalDue,
      amountPaid: amountPaid,
      currency: '₹',
      notes: `Payment method: ${form.payment_method || 'CASH'}`
    }, { returnBlob: true });

    const fd = new FormData();
    fd.append('file', new File([pdfBlob], `bill_${tempBillId}.pdf`, { type: 'application/pdf' }));
    const upRes = await uploadFile(fd);
    if (upRes.success) {
      receiptUrl = upRes.data?.url || upRes.data?.file_url || upRes.data?.objectUrl || null;
    }
  } catch (pdfErr) {
    console.warn('Failed to generate/upload bill PDF frontend fallback:', pdfErr);
  }

  // 2. Call backend createBill with the receiptUrl
  const billPayload = {
    appointment_id: appointmentId,
    total_amt: totalDue,
    service: serviceNames,
    unit_price: totalDue / Math.max(sessions.length, 1),
    discount: services.reduce((acc, s) => acc + (Number(s.discount) || 0), 0) / Math.max(services.length, 1),
    bill_description: billDescription,
    payment_receipt: receiptUrl
  };

  const billRes = await createBill(billPayload);
  let finalBillId = tempBillId;

  if (billRes.success) {
    const body = billRes.data?.data || billRes.data;
    finalBillId = body.id || body.billId || finalBillId;
    // Update receiptUrl if backend returned a different one (unlikely but possible)
    receiptUrl = body.payment_receipt || body.billUrl || body.receiptUrl || receiptUrl;
  } else {
    console.warn('Bill generation via API failed:', billRes);
  }

  return { billId: finalBillId, receiptUrl };
}
