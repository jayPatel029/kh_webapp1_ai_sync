/**
 * Fixed logic for InvoicePreview amount derivation
 * Tests the pickNumeric helper that now covers amountDue, unit_price, paid variants, and zero-skipping
 */
function pickNumeric(obj, keys) {
  if (!obj) return undefined;
  let zeroVal;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== '') {
      const n = Number(v);
      if (!Number.isNaN(n)) {
        if (n !== 0) return n;
        if (zeroVal === undefined) zeroVal = 0;
      }
    }
  }
  return zeroVal;
}
const totalDueKeysInvoice = ['total_amt','total_amount','totalAmount','amountDue','amount_due','unit_price','unitPrice','amount','price','bill_amount'];
const totalDueKeysAppt = ['totalAmount','total_amount','total_amt','amountDue','amount_due','unit_price','unitPrice','amount','price'];

function fixedTotalDue(invoice, appointment){
  return pickNumeric(invoice, totalDueKeysInvoice) ?? pickNumeric(appointment, totalDueKeysAppt) ?? pickNumeric(appointment?._raw, totalDueKeysAppt) ?? 0;
}
function fixedAmountPaid(fetchedBill, appointment, fetchedPayments=[]){
  if (fetchedBill) {
    const billPaidKeys = ['paid_amt','paid_amount','paidAmount','amount_paid','amountPaid','received_amt','receivedAmount','paid'];
    const v = pickNumeric(fetchedBill, billPaidKeys);
    if (v !== undefined) return v;
    if (fetchedBill.payment_receipt) {
      const t = pickNumeric(fetchedBill, totalDueKeysInvoice);
      if (t !== undefined) return t;
    }
    if (fetchedPayments.length) return fetchedPayments.reduce((s,p)=> s+Number(p.amount||0),0);
    return 0;
  }
  const apptPaidKeys = ['amount_paid','amountPaid','received_amt','receivedAmount','paid_amt','paid_amount','paidAmount','amount','paid'];
  return pickNumeric(appointment, apptPaidKeys) ?? pickNumeric(appointment?._raw, apptPaidKeys) ?? 0;
}
function fixedUnitPrice(invoice){
  return pickNumeric(invoice, totalDueKeysInvoice) ?? 0;
}

describe('InvoicePreview amount derivation - FIXED', () => {
  test('should render amount when appointment uses amountDue', () => {
    const invoice = null;
    const appointment = { id: 123, amountDue: 2500, amountPaid: 500 };
    expect(fixedTotalDue(invoice, appointment)).toBe(2500);
    expect(fixedAmountPaid(null, appointment)).toBe(500);
  });
  test('should render amount when bill uses amountDue and paidAmount', () => {
    const fetchedBill = { id: 99, amountDue: 3000, paidAmount: 1500 };
    expect(fixedTotalDue(fetchedBill, {id:123})).toBe(3000);
    expect(fixedAmountPaid(fetchedBill, null)).toBe(1500);
  });
  test('should handle appointment with unit_price and received_amt', () => {
    const invoice = { unit_price: '1500', total_amt: 0 };
    const appointment = { received_amt: 500 };
    expect(fixedTotalDue(invoice, appointment)).toBe(1500);
    expect(fixedAmountPaid(null, appointment)).toBe(500);
  });
  test('should handle amount_paid as string and paid_amt snake', () => {
    const appointment = { amount_paid: '1000' };
    expect(fixedAmountPaid(null, appointment)).toBe(1000);
    const bill = { paid_amt: '750', total_amt: 2000 };
    expect(fixedAmountPaid(bill, null)).toBe(750);
  });
  test('servicesList grossAmount vs totalDue - bill with amountDue field', () => {
    const invoice = { amountDue: 2500, total_amt: 0, unit_price: 0 };
    expect(fixedUnitPrice(invoice)).toBe(2500);
  });
  test('should fallback to sum of ledger when paid_amt missing', () => {
    const bill = { id: 1, amountDue: 2000 };
    const payments = [{amount: 500}, {amount: 300}];
    expect(fixedAmountPaid(bill, null, payments)).toBe(800);
  });
  test('should handle appointment _raw fallback', () => {
    const appointment = { _raw: { amountDue: 1800, amount_paid: 900 } };
    expect(fixedTotalDue(null, appointment)).toBe(1800);
    expect(fixedAmountPaid(null, appointment)).toBe(900);
  });
});
