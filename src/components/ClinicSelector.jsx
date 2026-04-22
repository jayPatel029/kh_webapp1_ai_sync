import React, { useState, useEffect } from 'react';
import { FormControl, FormLabel, Select } from '../component-library';
import { getClinics } from '../ApiCalls/clinicApis';

/**
 * ClinicSelector Component
 * A reusable clinic selection dropdown with consistent styling.
 */
const ClinicSelector = ({
  clinicId,
  setClinicId,
  orgId,
  label = "CLINIC",
  minW = "250px",
  size = "sm",
  placeholder = "Select a Clinic",
  className = ""
}) => {
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    const fetchClinics = async () => {
      // Fetching all clinics and filtering by orgId locally as per current backend support
      // If backend supports filtering, we can pass it as a param
      const res = await getClinics();
      if (res.success && Array.isArray(res.data.data)) {
        const filtered = orgId
          ? res.data.data.filter(c => String(c.organization_id) === String(orgId))
          : res.data.data;
        setClinics(filtered);
      }
    };
    fetchClinics();
  }, [orgId]);

  return (
    <FormControl minW={minW} className={className}>
      {label && <FormLabel fontSize="xs" mb={1} color="textMuted">{label}</FormLabel>}
      <Select
        value={clinicId || ''}
        onChange={(e) => setClinicId(e.target.value)}
        size={size}
        borderRadius="lg"
        placeholder={placeholder}
      >
        {(Array.isArray(clinics) ? clinics : []).map(c => (
          <option key={c.id} value={String(c.id)}>
            {c.clinic_name || c.name || `Clinic #${c.id}`}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default ClinicSelector;
