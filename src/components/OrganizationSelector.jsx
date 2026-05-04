import React, { useState, useEffect } from 'react';
import { FormControl, FormLabel, Select } from '../component-library';
import { getOrganizations } from '../ApiCalls/clinicApis';

/**
 * OrganizationSelector Component
 * A reusable organization selection dropdown.
 * 
 * @param {string} orgId - Currently selected organization ID
 * @param {function} setOrgId - Function to update selected organization ID
 * @param {string} label - Optional label (default: "ORGANIZATION")
 * @param {string} minW - Minimum width (default: "250px")
 * @param {string} size - Select size (default: "sm")
 */
const OrganizationSelector = ({
  orgId,
  setOrgId,
  organizations: organizationsProp,
  label = "ORGANIZATION",
  minW = "250px",
  size = "sm",
  placeholder = "Select an Organization",
  isDisabled = false,
  className = ""
}) => {
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    if (Array.isArray(organizationsProp)) {
      setOrganizations(organizationsProp);
      return;
    }

    const fetchOrgs = async () => {
      const res = await getOrganizations();
      if (res.success && Array.isArray(res.data.data)) {
        setOrganizations(res.data.data);
      }
    };
    fetchOrgs();
  }, [organizationsProp]);

  return (
    <FormControl minW={minW} className={className}>
      {label && <FormLabel fontSize="xs" mb={1} color="textMuted">{label}</FormLabel>}
      <Select
        value={orgId || ''}
        onChange={(e) => setOrgId(e.target.value)}
        size={size}
        borderRadius="lg"
        placeholder={placeholder}
        isDisabled={isDisabled}
      >
        {(Array.isArray(organizations) ? organizations : []).map(org => (
          <option key={org.id} value={String(org.id)}>
            {org.name || `Org #${org.id}`}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default OrganizationSelector;
