/**
 * Hook for managing appointments with bed assignment
 * @file src/hooks/useBedAppointments.js
 */

import { useCallback, useState, useEffect } from 'react';
import {
  getAllAppointmentsById,
  bookAppointment,
} from '../ApiCalls';
import { getBedAssignmentsByDateRange } from '../ApiCalls/bedManagementApis';

export default function useBedAppointments(patientId = null) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all appointments
   */
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllAppointmentsById();
      if (result.success) {
        const appointmentList = result.data || [];
        
        // Filter by patientId if provided
        if (patientId) {
          setAppointments(
            appointmentList.filter((apt) => apt.patient_id === patientId)
          );
        } else {
          setAppointments(appointmentList);
        }
      } else {
        setError(result.data?.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching appointments');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  /**
   * Book a new appointment with optional bed assignment
   */
  const bookNewAppointment = useCallback(
    async (appointmentData) => {
      try {
        const result = await bookAppointment({
          patient_id: appointmentData.patient_id,
          doctor_id: appointmentData.doctor_id,
          service_id: appointmentData.service_id,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          vitals: appointmentData.vitals,
          bed_id: appointmentData.bed_id, // Optional bed assignment
          notes: appointmentData.notes,
        });

        if (result.success) {
          // Add new appointment to list
          setAppointments([...appointments, result.data]);
          return { success: true, data: result.data };
        } else {
          throw new Error(result.data?.message || 'Failed to book appointment');
        }
      } catch (err) {
        return { success: false, data: err.message };
      }
    },
    [appointments]
  );

  /**
   * Get appointments for a date range with bed assignments
   */
  const getAppointmentsForDateRange = useCallback(async (startDate, endDate) => {
    try {
      const result = await getBedAssignmentsByDateRange({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.data?.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      return { success: false, data: err.message };
    }
  }, []);

  /**
   * Filter appointments by status
   */
  const getAppointmentsByStatus = useCallback((status) => {
    return appointments.filter((apt) => apt.status === status);
  }, [appointments]);

  /**
   * Get appointments for a specific bed
   */
  const getAppointmentsForBed = useCallback(
    (bedId) => {
      return appointments.filter((apt) => apt.bed_id === bedId);
    },
    [appointments]
  );

  /**
   * Get upcoming appointments (next 7 days)
   */
  const getUpcomingAppointments = useCallback(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return appointments.filter((apt) => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate >= now && aptDate <= sevenDaysLater;
    });
  }, [appointments]);

  /**
   * Check if patient has available time slot for appointment
   */
  const hasConflictingAppointment = useCallback(
    (appointmentDate, appointmentTime, durationMinutes = 30) => {
      const [startHour, startMinute] = appointmentTime.split(':').map(Number);
      const appointmentStart = new Date(appointmentDate);
      appointmentStart.setHours(startHour, startMinute, 0);

      const appointmentEnd = new Date(
        appointmentStart.getTime() + durationMinutes * 60 * 1000
      );

      return appointments.some((apt) => {
        if (apt.status === 'CANCELLED') return false;

        const existingStart = new Date(apt.appointment_date);
        const [existingHour, existingMinute] = (apt.appointment_time || '00:00')
          .split(':')
          .map(Number);
        existingStart.setHours(existingHour, existingMinute, 0);

        const existingEnd = new Date(existingStart.getTime() + 30 * 60 * 1000);

        // Check for overlap
        return !(appointmentEnd <= existingStart || appointmentStart >= existingEnd);
      });
    },
    [appointments]
  );

  /**
   * Get appointment statistics
   */
  const getAppointmentStats = useCallback(() => {
    return {
      total: appointments.length,
      scheduled: appointments.filter((apt) => apt.status === 'SCHEDULED').length,
      completed: appointments.filter((apt) => apt.status === 'COMPLETED').length,
      cancelled: appointments.filter((apt) => apt.status === 'CANCELLED').length,
      withBedAssignment: appointments.filter((apt) => apt.bed_id).length,
      withoutBedAssignment: appointments.filter((apt) => !apt.bed_id).length,
    };
  }, [appointments]);

  // Fetch appointments on mount or when patientId changes
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    bookNewAppointment,
    getAppointmentsForDateRange,
    getAppointmentsByStatus,
    getAppointmentsForBed,
    getUpcomingAppointments,
    hasConflictingAppointment,
    getAppointmentStats,
  };
}
