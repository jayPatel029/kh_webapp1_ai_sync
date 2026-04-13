/**
 * Hook for managing bed state and operations
 * @file src/hooks/useBedManagement.js
 */

import { useCallback, useState, useEffect } from 'react';
import {
  getAllBeds,
  getBedsByStatus,
  assignPatientToBed,
  unassignPatientFromBed,
  setQuarantineBed,
  getPatientDetails,
  getPatientIsolationStatus,
} from '../ApiCalls/bedManagementApis';

const BED_STATUS = {
  OCCUPIED: 'OCCUPIED',
  EMPTY: 'EMPTY',
  QUARANTINE: 'QUARANTINE',
};

export default function useBedManagement() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bedsByStatus, setBedsByStatus] = useState({
    [BED_STATUS.OCCUPIED]: [],
    [BED_STATUS.EMPTY]: [],
    [BED_STATUS.QUARANTINE]: [],
  });

  /**
   * Fetch all beds
   */
  const fetchAllBeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllBeds();
      if (result.success) {
        setBeds(result.data || []);
        // Organize beds by status
        const organized = {
          [BED_STATUS.OCCUPIED]: [],
          [BED_STATUS.EMPTY]: [],
          [BED_STATUS.QUARANTINE]: [],
        };
        (result.data || []).forEach((bed) => {
          const status = bed.status || BED_STATUS.EMPTY;
          if (organized[status]) {
            organized[status].push(bed);
          }
        });
        setBedsByStatus(organized);
      } else {
        setError(result.data?.message || 'Failed to fetch beds');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching beds');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Assign patient to bed with validation
   */
  const assignPatient = useCallback(
    async (bedId, patientId, assignmentNotes = '') => {
      try {
        // Get patient details to check isolation status
        const patientResult = await getPatientDetails(patientId);
        if (!patientResult.success) {
          throw new Error('Failed to fetch patient details');
        }

        const patient = patientResult.data;
        const isInfectious = patient?.is_infectious || false;

        // Get bed details
        const currentBed = beds.find((b) => b.id === bedId);
        if (!currentBed) {
          throw new Error('Bed not found');
        }

        // Validate quarantine requirements
        if (isInfectious && currentBed.bed_type !== 'QUARANTINE') {
          throw new Error('Cannot assign infectious patient to normal bed. Use Quarantine bed.');
        }

        if (
          currentBed.bed_type === 'QUARANTINE' &&
          !isInfectious &&
          currentBed.patient_id
        ) {
          throw new Error('Cannot assign non-infectious patient to quarantine bed with infectious patient');
        }

        // Perform assignment
        const result = await assignPatientToBed({
          bed_id: bedId,
          patient_id: patientId,
          assignment_notes: assignmentNotes,
        });

        if (result.success) {
          // Update local state
          const updatedBeds = beds.map((bed) => {
            if (bed.id === bedId) {
              return {
                ...bed,
                patient_id: patientId,
                status: BED_STATUS.OCCUPIED,
              };
            }
            return bed;
          });
          setBeds(updatedBeds);
          return { success: true, data: result.data };
        } else {
          throw new Error(result.data?.message || 'Failed to assign patient');
        }
      } catch (err) {
        return { success: false, data: err.message };
      }
    },
    [beds]
  );

  /**
   * Unassign patient from bed
   */
  const unassignPatient = useCallback(
    async (bedId, patientId) => {
      try {
        const result = await unassignPatientFromBed({
          bed_id: bedId,
          patient_id: patientId,
        });

        if (result.success) {
          // Update local state
          const updatedBeds = beds.map((bed) => {
            if (bed.id === bedId) {
              return {
                ...bed,
                patient_id: null,
                status: BED_STATUS.EMPTY,
              };
            }
            return bed;
          });
          setBeds(updatedBeds);
          return { success: true, data: result.data };
        } else {
          throw new Error(result.data?.message || 'Failed to unassign patient');
        }
      } catch (err) {
        return { success: false, data: err.message };
      }
    },
    [beds]
  );

  /**
   * Set bed as quarantine
   */
  const quarantineBed = useCallback(
    async (bedId, reason, estimatedDuration = null) => {
      try {
        const result = await setQuarantineBed(bedId, {
          reason,
          quarantine_status: true,
          estimated_duration: estimatedDuration,
        });

        if (result.success) {
          // Update local state
          const updatedBeds = beds.map((bed) => {
            if (bed.id === bedId) {
              return {
                ...bed,
                status: BED_STATUS.QUARANTINE,
                bed_type: 'QUARANTINE',
              };
            }
            return bed;
          });
          setBeds(updatedBeds);
          return { success: true, data: result.data };
        } else {
          throw new Error(result.data?.message || 'Failed to quarantine bed');
        }
      } catch (err) {
        return { success: false, data: err.message };
      }
    },
    [beds]
  );

  /**
   * Check if patient can be assigned to bed
   */
  const canAssignPatientToBed = useCallback(
    async (bedId, patientId) => {
      try {
        if (!bedId || !patientId) {
          return { allowed: false, reason: 'Invalid bed or patient ID' };
        }

        const bed = beds.find((b) => b.id === bedId);
        if (!bed) {
          return { allowed: false, reason: 'Bed not found' };
        }

        if (bed.status === BED_STATUS.OCCUPIED && bed.patient_id) {
          return { allowed: false, reason: 'Bed is already occupied' };
        }

        const patientResult = await getPatientDetails(patientId);
        if (!patientResult.success) {
          return { allowed: false, reason: 'Failed to fetch patient details' };
        }

        const isInfectious = patientResult.data?.is_infectious || false;

        if (isInfectious && bed.bed_type !== 'QUARANTINE') {
          return {
            allowed: false,
            reason: 'Infectious patients must be assigned to quarantine beds',
          };
        }

        return { allowed: true, reason: null };
      } catch (err) {
        return { allowed: false, reason: err.message };
      }
    },
    [beds]
  );

  // Fetch beds on mount
  useEffect(() => {
    fetchAllBeds();
  }, [fetchAllBeds]);

  return {
    beds,
    bedsByStatus,
    loading,
    error,
    BED_STATUS,
    fetchAllBeds,
    assignPatient,
    unassignPatient,
    quarantineBed,
    canAssignPatientToBed,
  };
}
