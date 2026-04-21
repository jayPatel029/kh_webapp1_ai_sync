/**
 * Refund Calculator Utility
 * Computes refund amounts for dialysis appointment cancellations.
 *
 * @file src/utils/refundCalculator.js
 */

/**
 * Calculate refund details for a given appointment.
 *
 * @param {object} appointment - The appointment object.
 * @param {number} appointment.amountPaid - Total amount paid so far.
 * @param {number} appointment.totalAmount - Total bill amount.
 * @param {string} appointment.status - Current appointment status.
 * @param {string} [policy='full'] - Refund policy: 'full' | 'partial' | 'none'.
 * @param {number} [partialPercent=50] - % to refund when policy is 'partial'.
 * @returns {{ refundAmount: number, reason: string, eligible: boolean }}
 */
export function calculateRefund(appointment, policy = 'full', partialPercent = 50) {
  const amountPaid = Number(appointment?.amountPaid || 0);

  if (amountPaid <= 0) {
    return { refundAmount: 0, reason: 'No payment has been made.', eligible: false };
  }

  if (policy === 'none') {
    return { refundAmount: 0, reason: 'Refund policy does not allow refunds.', eligible: false };
  }

  if (policy === 'partial') {
    const refundAmount = parseFloat(((amountPaid * partialPercent) / 100).toFixed(2));
    return {
      refundAmount,
      reason: `Partial refund of ${partialPercent}% applied.`,
      eligible: true,
    };
  }

  // Default: full refund
  return {
    refundAmount: amountPaid,
    reason: 'Full refund of amount paid.',
    eligible: true,
  };
}

/**
 * Get the outstanding balance for an appointment.
 *
 * @param {number} totalAmount - Total bill amount.
 * @param {number} amountPaid - Total amount paid.
 * @returns {number} Outstanding balance (>= 0).
 */
export function getOutstandingBalance(totalAmount, amountPaid) {
  return Math.max(0, Number(totalAmount || 0) - Number(amountPaid || 0));
}

/**
 * Determine payment status label.
 *
 * @param {number} totalAmount
 * @param {number} amountPaid
 * @returns {'PAID' | 'PARTIAL' | 'UNPAID'}
 */
export function getPaymentStatus(totalAmount, amountPaid) {
  const total = Number(totalAmount || 0);
  const paid = Number(amountPaid || 0);

  if (total <= 0) return 'UNPAID';
  if (paid >= total) return 'PAID';
  if (paid > 0) return 'PARTIAL';
  return 'UNPAID';
}
