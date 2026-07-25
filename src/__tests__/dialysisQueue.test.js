/**
 * @jest-environment node
 */

jest.mock('../helpers/axios/axiosInstance', () => ({
  __esModule: true,
  default: {}
}));

import {
  calculateAge,
  formatTime12Hour,
  normalizeAppointmentTime,
  deriveShiftLabel,
  getMinutesSinceMidnight,
  derivePriority,
  deriveBed,
  pickPrimaryAppointment,
} from '../hooks/useDialysisQueue';
import { SHIFT_ORDER } from '../pages/dialysis/dialysisQueueConstants';

describe('P2-01 Queue Unit Logic & Sorting Rules (Node environment)', () => {
  describe('calculateAge', () => {
    it('calculates age correctly from DOB', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 30;
      // Make sure DOB is in the past
      const dob = `${birthYear}-01-01`;
      expect(calculateAge(dob)).toBe(30);
    });

    it('returns fallback dash for empty/invalid DOB', () => {
      expect(calculateAge('')).toBe('—');
      expect(calculateAge(null)).toBe('—');
    });
  });

  describe('formatTime12Hour', () => {
    it('converts 24-hour time to 12-hour format with AM/PM', () => {
      expect(formatTime12Hour('08:30')).toBe('08:30 AM');
      expect(formatTime12Hour('12:00')).toBe('12:00 PM');
      expect(formatTime12Hour('13:15')).toBe('01:15 PM');
      expect(formatTime12Hour('20:05')).toBe('08:05 PM');
    });

    it('handles empty values gracefully', () => {
      expect(formatTime12Hour('')).toBe('—');
      expect(formatTime12Hour(null)).toBe('—');
    });
  });

  describe('deriveShiftLabel', () => {
    it('derives shifts correctly according to scheduled time blocks', () => {
      expect(deriveShiftLabel('08:30 AM')).toBe('Morning');
      expect(deriveShiftLabel('10:59 AM')).toBe('Morning');
      expect(deriveShiftLabel('11:00 AM')).toBe('Mid-day');
      expect(deriveShiftLabel('02:30 PM')).toBe('Mid-day');
      expect(deriveShiftLabel('04:15 PM')).toBe('Evening');
      expect(deriveShiftLabel('07:30 PM')).toBe('Night');
    });
  });

  describe('getMinutesSinceMidnight', () => {
    it('converts appointment time to raw minutes since midnight', () => {
      expect(getMinutesSinceMidnight({ start_time: '08:30' })).toBe(8 * 60 + 30);
      expect(getMinutesSinceMidnight({ startUTC: '2026-07-25T14:15:00Z' })).toBe(14 * 60 + 15);
    });

    it('returns Infinity for missing/invalid times', () => {
      expect(getMinutesSinceMidnight({})).toBe(Infinity);
    });
  });

  describe('derivePriority', () => {
    it('marks emergency as High priority', () => {
      expect(derivePriority({ is_emergency: true })).toBe('High');
      expect(derivePriority({ isEmergency: true })).toBe('High');
    });

    it('marks arrived/in-progress/waiting statuses as Medium priority', () => {
      expect(derivePriority({ status: 'IN_PROGRESS' })).toBe('Medium');
      expect(derivePriority({ status: 'ARRIVED' })).toBe('Medium');
      expect(derivePriority({ status: 'WAITING' })).toBe('Medium');
    });

    it('defaults other statuses to Low priority', () => {
      expect(derivePriority({ status: 'SCHEDULED' })).toBe('Low');
      expect(derivePriority({ status: 'COMPLETED' })).toBe('Low');
    });
  });

  describe('deriveBed', () => {
    it('extracts bed label from various appointment formats', () => {
      expect(deriveBed({ bed_number: 'B-02' })).toBe('B-02');
      expect(deriveBed({ bedNo: 'B-03' })).toBe('B-03');
      expect(deriveBed({ bed: { bed_number: 'B-04' } })).toBe('B-04');
    });

    it('returns fallback dash if no bed is assigned', () => {
      expect(deriveBed({})).toBe('—');
    });
  });

  describe('pickPrimaryAppointment', () => {
    it('picks the most clinically active appointment (In Progress > Waiting > Arrived > Completed)', () => {
      const appts = [
        { id: 101, status: 'COMPLETED', start_time: '08:00' },
        { id: 102, status: 'IN_PROGRESS', start_time: '08:00' },
        { id: 103, status: 'ARRIVED', start_time: '08:00' },
      ];
      expect(pickPrimaryAppointment(appts).id).toBe(102); // IN_PROGRESS wins
    });
  });

  describe('Queue Sorting Order', () => {
    it('sorts emergency first, then by shift order (Morning -> Mid-day -> Evening), then by time', () => {
      const rows = [
        { isEmergency: false, shiftLabel: 'Mid-day', appointment: { start_time: '12:30' } },
        { isEmergency: true, shiftLabel: 'Evening', appointment: { start_time: '17:00' } },
        { isEmergency: false, shiftLabel: 'Morning', appointment: { start_time: '08:30' } },
        { isEmergency: false, shiftLabel: 'Morning', appointment: { start_time: '07:30' } },
      ];

      // Sort logic matching useDialysisQueue sorting
      rows.sort((a, b) => {
        if (a.isEmergency && !b.isEmergency) return -1;
        if (!a.isEmergency && b.isEmergency) return 1;

        const shiftA = SHIFT_ORDER[a.shiftLabel] || 99;
        const shiftB = SHIFT_ORDER[b.shiftLabel] || 99;
        if (shiftA !== shiftB) return shiftA - shiftB;

        const timeA = getMinutesSinceMidnight(a.appointment);
        const timeB = getMinutesSinceMidnight(b.appointment);
        return timeA - timeB;
      });

      // Expected sorted order:
      // 1. Emergency (Sita - Evening)
      // 2. Morning 07:30
      // 3. Morning 08:30
      // 4. Mid-day 12:30
      expect(rows[0].isEmergency).toBe(true);
      expect(rows[1].shiftLabel).toBe('Morning');
      expect(rows[1].appointment.start_time).toBe('07:30');
      expect(rows[2].appointment.start_time).toBe('08:30');
      expect(rows[3].shiftLabel).toBe('Mid-day');
    });
  });
});
