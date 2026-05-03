// Requires: jspdf and jspdf-autotable (npm install jspdf jspdf-autotable)
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * generateBillPDF(billData, opts)
 *
 * billData shape:
 *   invoiceId, date, dueDate, customer: { name, id, email?, phone? },
 *   items: [{ description, qty, unitPrice }],
 *   amountDue, amountPaid, currency, notes
 *
 * opts:
 *   downloadFilename, autoDownload (default true), returnBlob (default false), logoDataUrl
 */
export async function generateBillPDF(billData, opts = {}) {
  const {
    invoiceId = 'INV-000',
    date = new Date(),
    dueDate = null,
    customer = {},
    items = [],
    amountDue = 0,
    amountPaid = 0,
    currency = '₹',
    notes = '',
  } = billData;

  const {
    downloadFilename = `${invoiceId}.pdf`,
    autoDownload = true,
    returnBlob = false,
    logoDataUrl = null,
  } = opts;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  let y = 40;

  // Optional logo
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, 'PNG', margin, y, 80, 40); } catch (_) {}
  }

  // Header
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175); // blue
  doc.text('INVOICE', 520, y + 20, { align: 'right' });
  y += 60;

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81); // gray
  doc.text(`Invoice #: ${invoiceId}`, margin, y);
  doc.text(`Bill Date: ${new Date(date).toLocaleDateString('en-GB')}`, margin, y + 14);
  if (dueDate) doc.text(`Due: ${new Date(dueDate).toLocaleDateString('en-GB')}`, margin, y + 28);

  // Customer info
  const custX = 360;
  let custY = y + 8;
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('Bill To:', custX, y - 6);
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(customer.name || '-', custX, custY);
  const ageGen = [customer.age ? `${customer.age} Yrs` : null, customer.gender].filter(Boolean).join(' / ');
  if (ageGen) {
    custY += 14;
    doc.text(ageGen, custX, custY);
  }
  if (customer.phone) {
    custY += 14;
    doc.text(customer.phone, custX, custY);
  }
  if (customer.id) {
    custY += 14;
    doc.text(`ID: ${customer.id}`, custX, custY);
  }
  if (customer.email) {
    custY += 14;
    doc.text(customer.email, custX, custY);
  }
  y += 70;

  // Items table
  const hasDuration = items.some(it => it.duration && it.duration !== '—' && it.duration !== '0' && it.duration !== 0);
  const hasDiscount = items.some(it => it.discount && Number(it.discount) > 0);

  const headRow = ['Description'];
  if (hasDuration) {
    headRow.push('Start Time', 'End Time', 'Duration');
  }
  headRow.push('Qty', 'Unit Price');
  if (hasDiscount) {
    headRow.push('Discount');
  }
  headRow.push('Total');

  const tableBody = items.map((it) => {
    const qty   = Number(it.qty || 1);
    const unit  = Number(it.unitPrice || 0);
    const discount = Number(it.discount || 0);
    const total = (qty * unit) - discount;

    const row = [it.description || 'Service'];
    if (hasDuration) {
      row.push(it.startTime || '-', it.endTime || '-', it.duration || '-');
    }
    row.push(String(qty), `${currency} ${unit.toFixed(2)}`);
    if (hasDiscount) {
      row.push(`${currency} ${discount.toFixed(2)}`);
    }
    row.push(`${currency} ${total.toFixed(2)}`);
    
    return row;
  });

  autoTable(doc, {
    head: [headRow],
    body: tableBody,
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 10, textColor: [55, 65, 81] },
    headStyles: { fillColor: [219, 234, 254], textColor: [30, 64, 175], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  });

  y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : y + 120;

  // Totals
  const totalDue    = Number(amountDue || items.reduce((s, it) => s + ((Number(it.qty || 1) * Number(it.unitPrice || 0)) - Number(it.discount || 0)), 0));
  const paid        = Number(amountPaid || 0);
  const outstanding = Math.max(0, totalDue - paid);
  const status      = paid >= totalDue ? 'PAID' : 'PENDING';
  const statusColor = paid >= totalDue ? [22, 163, 74] : [153, 27, 27];

  // Status badge
  doc.setFontSize(12);
  doc.setTextColor(...statusColor);
  doc.text(`Status: ${status}`, margin, y);

  // Amount breakdown (right)
  const totalsX = 400;
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(`Subtotal:`, totalsX, y);
  doc.text(`${currency} ${totalDue.toFixed(2)}`, 560, y, { align: 'right' });
  doc.text(`Amount Paid:`, totalsX, y + 14);
  doc.setTextColor(22, 163, 74);
  doc.text(`${currency} ${paid.toFixed(2)}`, 560, y + 14, { align: 'right' });
  doc.setFontSize(12);
  doc.setTextColor(outstanding > 0 ? 153 : 22, outstanding > 0 ? 27 : 163, outstanding > 0 ? 27 : 74);
  doc.text(`Outstanding: ${currency} ${outstanding.toFixed(2)}`, totalsX, y + 34);

  y += 70;

  // Notes
  if (notes) {
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text('Notes:', margin, y);
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(String(notes), margin, y + 14, { maxWidth: 520 });
    y += 40;
  }

  // Footer
  const footerY = 800;
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text('Thank you for your business. This is a computer-generated invoice.', margin, footerY);

  // Output
  if (returnBlob) return doc.output('blob');
  if (autoDownload) doc.save(downloadFilename);
  return null;
}

/**
 * generateRefundPDF(refundData, opts)
 *
 * refundData shape:
 *   refundId, date, originalInvoiceId, customer: { name, id },
 *   refundAmount, originalAmountPaid, reason, method, transactionId, notes
 */
export async function generateRefundPDF(refundData, opts = {}) {
  const {
    refundId = 'REF-000',
    date = new Date(),
    originalInvoiceId = '',
    customer = {},
    refundAmount = 0,
    originalAmountPaid = 0,
    reason = '',
    method = '',
    transactionId = null,
    notes = '',
  } = refundData;

  const {
    downloadFilename = `${refundId}.pdf`,
    autoDownload = true,
    returnBlob = false,
    logoDataUrl = null,
  } = opts;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  let y = 40;

  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, 'PNG', margin, y, 80, 40); } catch (_) {}
  }

  // Header
  doc.setFontSize(18);
  doc.setTextColor(153, 27, 27); // red
  doc.text('REFUND NOTICE', 520, y + 20, { align: 'right' });
  y += 60;

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(`Refund #: ${refundId}`, margin, y);
  doc.text(`Bill Date: ${new Date(date).toLocaleDateString('en-GB')}`, margin, y + 14);
  if (originalInvoiceId) doc.text(`Original Invoice #: ${originalInvoiceId}`, margin, y + 28);

  // Customer
  const custX = 360;
  let custY = y + 8;
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('Customer:', custX, y - 6);
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(customer.name || '-', custX, custY);
  const ageGen = [customer.age ? `${customer.age} Yrs` : null, customer.gender].filter(Boolean).join(' / ');
  if (ageGen) {
    custY += 14;
    doc.text(ageGen, custX, custY);
  }
  if (customer.phone) {
    custY += 14;
    doc.text(customer.phone, custX, custY);
  }
  if (customer.id) {
    custY += 14;
    doc.text(`ID: ${customer.id}`, custX, custY);
  }
  if (customer.email) {
    custY += 14;
    doc.text(customer.email, custX, custY);
  }
  y += 70;
  if (customer.id) doc.text(`ID: ${customer.id}`, custX, y + 22);
  y += 70;

  // Refund summary table
  autoTable(doc, {
    head: [['Field', 'Value']],
    body: [
      ['Refund Amount',    `₹ ${Number(refundAmount).toFixed(2)}`],
      ['Original Paid',   `₹ ${Number(originalAmountPaid).toFixed(2)}`],
      ['Payment Method',  method || 'N/A'],
      ...(transactionId ? [['Transaction ID', String(transactionId)]] : []),
    ],
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [254, 202, 202], textColor: [153, 27, 27], fontStyle: 'bold' },
  });

  y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : y + 100;

  if (reason) {
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text('Reason for Refund:', margin, y);
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(String(reason), margin, y + 14, { maxWidth: 520 });
    y += 40;
  }

  if (notes) {
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text('Notes:', margin, y);
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(String(notes), margin, y + 14, { maxWidth: 520 });
    y += 40;
  }

  const footerY = 800;
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text('For queries, please contact the clinic support team.', margin, footerY);

  if (returnBlob) return doc.output('blob');
  if (autoDownload) doc.save(downloadFilename);
  return null;
}
