import React, { useState, useEffect, useMemo } from 'react';
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
  clinics: clinicsProp,
  label = "CLINIC",
  minW = "250px",
  size = "sm",
  placeholder = "Select a Clinic",
  className = ""
}) => {
  const [internalClinics, setInternalClinics] = useState([]);

  useEffect(() => {
    if (clinicsProp) return;

    const fetchClinics = async () => {
      const res = await getClinics();
      if (res.success) {
        const rawData = res.data?.data || res.data || [];
        setInternalClinics(Array.isArray(rawData) ? rawData : []);
      }
    };
    fetchClinics();
  }, [clinicsProp]);

  const clinics = clinicsProp || internalClinics;

  const filteredClinics = useMemo(() => {
    if (!orgId) return [];
    return clinics.filter(c => String(c.organization_id || c.org_id) === String(orgId));
  }, [clinics, orgId]);

  return (
    <FormControl minW={minW} className={className}>
      {label && <FormLabel fontSize="xs" mb={1} color="textMuted">{label}</FormLabel>}
      <Select
        value={clinicId || ''}
        onChange={(e) => setClinicId(e.target.value)}
        size={size}
        borderRadius="lg"
        placeholder={!orgId ? "Select Organization First" : placeholder}
        isDisabled={!orgId}
      >
        {filteredClinics.map(c => (
          <option key={c.id} value={String(c.id)}>
            {c.clinic_name || c.name || `Clinic #${c.id}`}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default ClinicSelector;
