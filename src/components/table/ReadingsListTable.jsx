/**
 * ReadingsListTable Component
 * Specialized wrapper for displaying reading entries
 * Reusable across Daily Readings, Dialysis Readings, etc.
 * 
 * @file src/components/table/ReadingsListTable.jsx
 */

import React from 'react';
import UnifiedListTable from './UnifiedListTable';

const ReadingsListTable = ({
  readings = [],
  type = 'daily', // 'daily' or 'dialysis'
  onEdit = null,
  onDelete = null,
  isLoading = false,
  columns: customColumns = null,
}) => {
  // Default columns for daily readings
  const dailyReadingsColumns = [
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      width: '150px',
      minWidth: '140px'
    },
    {
      key: 'parameterName',
      label: 'Parameter',
      type: 'text',
      width: '200px',
      minWidth: '180px'
    },
    {
      key: 'value',
      label: 'Value',
      type: 'text',
      width: '120px',
      minWidth: '100px'
    },
    {
      key: 'unit',
      label: 'Unit',
      type: 'text',
      width: '100px',
      minWidth: '90px'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'text',
      width: '120px',
      minWidth: '110px'
    },
    {
      key: 'notes',
      label: 'Notes',
      type: 'text',
      width: '200px',
      minWidth: '180px'
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      width: '100px',
      minWidth: '100px'
    },
  ];

  // Default columns for dialysis readings
  const dialysisReadingsColumns = [
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      width: '150px',
      minWidth: '140px'
    },
    {
      key: 'dialyzerType',
      label: 'Dialyzer Type',
      type: 'text',
      width: '150px',
      minWidth: '140px'
    },
    {
      key: 'duration',
      label: 'Duration (hrs)',
      type: 'text',
      width: '130px',
      minWidth: '120px'
    },
    {
      key: 'bloodFlowRate',
      label: 'Blood Flow (ml/min)',
      type: 'text',
      width: '160px',
      minWidth: '150px'
    },
    {
      key: 'dialysateFlowRate',
      label: 'Dialysate Flow',
      type: 'text',
      width: '160px',
      minWidth: '150px'
    },
    {
      key: 'preWeight',
      label: 'Pre Weight (kg)',
      type: 'text',
      width: '150px',
      minWidth: '140px'
    },
    {
      key: 'postWeight',
      label: 'Post Weight (kg)',
      type: 'text',
      width: '150px',
      minWidth: '140px'
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      width: '100px',
      minWidth: '100px'
    },
  ];

  const columns = customColumns || (type === 'dialysis' ? dialysisReadingsColumns : dailyReadingsColumns);

  return (
    <UnifiedListTable
      columns={columns}
      data={readings}
      onEdit={onEdit}
      onDelete={onDelete}
      isLoading={isLoading}
      emptyMessage={`No ${type} readings found`}
      actionButtons={Boolean(onEdit || onDelete)}
      enableSearch={true}
      searchKeys={['date', 'parameterName', 'status']}
      rowsPerPage={15}
    />
  );
};

export default ReadingsListTable;
