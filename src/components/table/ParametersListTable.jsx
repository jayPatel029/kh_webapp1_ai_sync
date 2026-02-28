/**
 * ParametersListTable Component
 * Specialized wrapper for displaying parameter/reading data
 * Pre-configured columns for parameters management page
 * 
 * @file src/components/table/ParametersListTable.jsx
 */

import React from 'react';
import UnifiedListTable from './UnifiedListTable';

const ParametersListTable = ({
  data = [],
  onEdit = null,
  onDelete = null,
  isLoading = false,
  columns: customColumns = null,
}) => {
  // Default columns for parameters - can be overridden
  const defaultColumns = [
    {
      key: 'parameterName',
      label: 'Parameter Name',
      type: 'text',
      width: '200px',
      minWidth: '180px'
    },
    {
      key: 'type',
      label: 'Parameter Type',
      type: 'text',
      width: '150px',
      minWidth: '140px'
    },
    {
      key: 'readingType',
      label: 'Reading Type',
      type: 'text',
      width: '150px',
      minWidth: '140px'
    },
    {
      key: 'lowRange',
      label: 'Low Range',
      type: 'text',
      width: '120px',
      minWidth: '110px'
    },
    {
      key: 'highRange',
      label: 'High Range',
      type: 'text',
      width: '120px',
      minWidth: '110px'
    },
    {
      key: 'ailments',
      label: 'Related Ailments',
      type: 'multi-line',
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

  const columns = customColumns || defaultColumns;

  return (
    <UnifiedListTable
      columns={columns}
      data={data}
      onEdit={onEdit}
      onDelete={onDelete}
      isLoading={isLoading}
      emptyMessage="No parameters found"
      actionButtons={Boolean(onEdit || onDelete)}
      enableSearch={true}
      searchKeys={['parameterName', 'type', 'readingType']}
      rowsPerPage={10}
    />
  );
};

export default ParametersListTable;
