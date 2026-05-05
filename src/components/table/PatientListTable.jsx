/**
 * PatientListTable Component
 * Specialized wrapper for displaying patient data
 * Pre-configured columns and styling for patient lists
 * 
 * @file src/components/table/PatientListTable.jsx
 */

import React from 'react';
import UnifiedListTable from './UnifiedListTable';

const PatientListTable = ({
  patients = [],
  onEdit = null,
  onDelete = null,
  onDownload = null,
  isLoading = false,
  onRowClick = null,
}) => {
  const columns = [
    {
      key: 'profile',
      label: 'Profile',
      type: 'image',
      width: '111px',
      minWidth: '100px'
    },
    {
      key: 'patient_details',
      label: 'PATIENT DETAILS',
      type: 'custom',
      width: '300px',
      minWidth: '200px',
      render: (row) => {
        const code = row.patient_code || row.patientCode || row.id || '-';
        const name = row.name || '-';
        const age = row.age || '-';
        const gender = row.gender || row.sex || '-';
        const phone = row.number || row.phone || '-';
        return <div style={{ fontSize: '13px', fontWeight: 600 }}>{`${code} / ${name} / ${age} / ${gender} / ${phone}`}</div>;
      }
    },
    {
      key: 'registrationDate',
      label: 'Registration Date',
      type: 'date',
      width: '202px',
      minWidth: '150px'
    },
    {
      key: 'program',
      label: 'Program',
      type: 'text',
      width: '129px',
      minWidth: '120px'
    },
    {
      key: 'medicalTeam',
      label: 'Medical team',
      type: 'multi-line',
      width: '170px',
      minWidth: '150px'
    },
    {
      key: 'assignedTo',
      label: 'Assigned to',
      type: 'multi-line',
      width: '157px',
      minWidth: '140px'
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      width: '80px',
      minWidth: '80px'
    },
  ];

  return (
    <UnifiedListTable
      columns={columns}
      data={patients}
      onEdit={onEdit}
      onDelete={onDelete}
      onDownload={onDownload}
      isLoading={isLoading}
      emptyMessage="No patients found"
      actionButtons={Boolean(onEdit || onDelete || onDownload)}
      enableSearch={true}
      searchKeys={['name', 'number', 'program']}
    />
  );
};

export default PatientListTable;
