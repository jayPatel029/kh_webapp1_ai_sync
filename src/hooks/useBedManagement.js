/**
 * Hook for managing bed state and operations
 * @file src/hooks/useBedManagement.js
 */

import { useCallback, useState, useEffect } from 'react';
import {
  getAllBeds,
  assignPatientToBed,
  unassignPatientFromBed,
  setQuarantineBed,
  getPatientDetails,
  transferPatientBed,
} from '../ApiCalls/bedManagementApis';
import { getClinicBeds } from '../ApiCalls/clinicApis';

const BED_STATUS = {
  OCCUPIED: 'OCCUPIED',
  EMPTY: 'EMPTY',
  AVAILABLE: 'AVAILABLE', // Sync with backend if needed
  QUARANTINE: 'QUARANTINE',
  CLEANING: 'CLEANING',
  MAINTENANCE: 'MAINTENANCE',
};

export default function useBedManagement(initialClinicId = null) {
  const [beds, setBeds] = useState([]);
  const [clinicId, setClinicId] = useState(initialClinicId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bedsByStatus, setBedsByStatus] = useState({
    [BED_STATUS.OCCUPIED]: [],
    [BED_STATUS.EMPTY]: [],
    [BED_STATUS.AVAILABLE]: [],
    [BED_STATUS.QUARANTINE]: [],
    [BED_STATUS.CLEANING]: [],
    [BED_STATUS.MAINTENANCE]: [],
  });

  /**
   * Fetch all beds or clinic-specific beds
   */
  const fetchAllBeds = useCallback(async (targetClinicId = clinicId) => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (targetClinicId) {
        result = await getClinicBeds(targetClinicId);
      } else {
        result = await getAllBeds();
      }

      if (result.success) {
        let rawData = result.data || [];
        // Handle potential nested data structure { success, data: [...] }
        const bedData = Array.isArray(rawData) ? rawData : (rawData.data || []);
        
        // Transform and normalize bed data
        const transformedBeds = bedData.map(bed => {
          const normalized = { ...bed };
          
          // Ensure we have a bed_number for display (using code or name as fallback)
          if (!normalized.bed_number) {
            normalized.bed_number = normalized.code || normalized.name || normalized.id;
          }

          // Normalize status
          let status = normalized.status || BED_STATUS.EMPTY;
          if (status === 'AVAILABLE') status = BED_STATUS.EMPTY;
          
          // Map isolated beds to QUARANTINE status if they are EMPTY for UI categorization
          const isIsolated = normalized.is_quarantine || 
                           normalized.bed_type === 'ISOLATED' || 
                           normalized.bed_type === 'QUARANTINE';
          
          if (isIsolated && (status === BED_STATUS.EMPTY || status === BED_STATUS.AVAILABLE)) {
            status = BED_STATUS.QUARANTINE;
          }
          
          normalized.status = status;
          return normalized;
        });

        setBeds(transformedBeds);
        
        // Organize beds by status for quick access
        const organized = {
          [BED_STATUS.OCCUPIED]: [],
          [BED_STATUS.EMPTY]: [],
          [BED_STATUS.AVAILABLE]: [],
          [BED_STATUS.QUARANTINE]: [],
          [BED_STATUS.CLEANING]: [],
          [BED_STATUS.MAINTENANCE]: [],
        };

        transformedBeds.forEach((bed) => {
          if (organized[bed.status]) {
            organized[bed.status].push(bed);
          } else {
            organized[BED_STATUS.EMPTY].push(bed);
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
  }, [clinicId]);

  /**
   * Assign patient to bed with validation
   */
  const assignPatient = useCallback(
    async (bedId, patientId, appointmentId = null, assignmentNotes = '') => {
      try {
        if (!bedId || !patientId) {
          throw new Error('Bed ID and Patient ID are required');
        }

        // Get patient details to check isolation status
        const patientResult = await getPatientDetails(patientId);
        if (!patientResult.success) {
          throw new Error('Failed to fetch patient details');
        }

        // Handle potential nested data structure { success, data: { ... } }
        const patientData = patientResult.data?.data || patientResult.data;
        const patient = patientData;
        const isInfectious = patient?.is_infectious || false;

        // Get bed details
        const currentBed = beds.find((b) => b.id === bedId);
        if (!currentBed) {
          throw new Error('Bed not found');
        }

        // Validate cleaning status
        if (currentBed.status === BED_STATUS.CLEANING) {
          throw new Error('Bed is currently being cleaned and cannot be assigned.');
        }

        // Validate quarantine requirements
        if (isInfectious && currentBed.bed_type !== 'QUARANTINE' && !currentBed.is_quarantine) {
          throw new Error('Infectious patients must be assigned to isolated/quarantine beds.');
        }

        if (!isInfectious && (currentBed.bed_type === 'QUARANTINE' || currentBed.is_quarantine)) {
          throw new Error('Non-infectious patients cannot be assigned to isolated/quarantine beds.');
        }

        // Perform assignment
        const result = await assignPatientToBed({
          bed_id: bedId,
          patient_id: patientId,
          appointment_id: Number(appointmentId) || null,
          assignment_notes: assignmentNotes,
        });

        if (result.success) {
          await fetchAllBeds();
          return { success: true, data: result.data };
        } else {
          throw new Error(result.data?.message || 'Failed to assign patient');
        }
      } catch (err) {
        return { success: false, data: err.message };
      }
    },
    [beds, fetchAllBeds]
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
          await fetchAllBeds();
          return { success: true, data: result.data };
        } else {
          throw new Error(result.data?.message || 'Failed to unassign patient');
        }
      } catch (err) {
        return { success: false, data: err.message };
      }
    },
    [fetchAllBeds]
  );

  /**
   * Transfer patient between beds
   */
  const transferPatient = useCallback(
    async (fromBedId, toBedId, patientId, requestedBy) => {
      try {
        const result = await transferPatientBed({
          from_bed_id: fromBedId,
          to_bed_id: toBedId,
          patient_id: patientId,
          requested_by: requestedBy,
        });

        if (result.success) {
          await fetchAllBeds();
          return { success: true, data: result.data };
        } else {
          throw new Error(result.data?.message || 'Failed to transfer patient');
        }
      } catch (err) {
        return { success: false, data: err.message };
      }
    },
    [fetchAllBeds]
  );

  /**
   * Set bed as quarantine
   */
  const quarantineBedAction = useCallback(
    async (bedId, reason, estimatedDuration = null) => {
      try {
        const result = await setQuarantineBed(bedId, {
          reason,
          quarantine_status: true,
          estimated_duration: estimatedDuration,
        });

        if (result.success) {
          await fetchAllBeds();
          return { success: true, data: result.data };
        } else {
          throw new Error(result.data?.message || 'Failed to quarantine bed');
        }
      } catch (err) {
        return { success: false, data: err.message };
      }
    },
    [fetchAllBeds]
  );

  /**
   * Check if patient can be assigned to bed (UI validation)
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

        if (bed.status === BED_STATUS.OCCUPIED) {
          return { allowed: false, reason: 'Bed is already occupied' };
        }

        if (bed.status === BED_STATUS.CLEANING) {
          return { allowed: false, reason: 'Bed is currently being cleaned' };
        }

        const patientResult = await getPatientDetails(patientId);
        if (!patientResult.success) {
          return { allowed: false, reason: 'Failed to fetch patient details' };
        }

        // Handle potential nested data structure { success, data: { ... } }
        const patientData = patientResult.data?.data || patientResult.data;
        const isInfectious = patientData?.is_infectious || false;
        const isIsolatedBed = bed.bed_type === 'QUARANTINE' || bed.is_quarantine || bed.status === 'QUARANTINE';

        if (isInfectious && !isIsolatedBed) {
          return {
            allowed: false,
            reason: 'Infectious patients must be assigned to isolated/quarantine beds',
          };
        }

        if (!isInfectious && isIsolatedBed) {
          return {
            allowed: false,
            reason: 'Non-infectious patients cannot be assigned to isolated beds',
          };
        }

        return { allowed: true, reason: null };
      } catch (err) {
        return { allowed: false, reason: err.message };
      }
    },
    [beds]
  );

  // Fetch beds when clinicId changes
  useEffect(() => {
    fetchAllBeds();
  }, [fetchAllBeds, clinicId]);

  return {
    beds,
    bedsByStatus,
    loading,
    error,
    BED_STATUS,
    clinicId,
    setClinicId,
    fetchAllBeds,
    assignPatient,
    unassignPatient,
    transferPatient,
    quarantineBed: quarantineBedAction,
    canAssignPatientToBed,
  };
}
