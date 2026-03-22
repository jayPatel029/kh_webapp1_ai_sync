import React from 'react';
import { PERMISSION_FIELDS } from '../../helpers/permissions';

/**
 * PermissionsTable
 * Renders a permissions matrix (View/Edit/Delete) and calls onChange with updated permissions.
 * Behavior: if Edit or Delete is toggled ON, View is automatically set ON for that row.
 */
const PermissionsTable = ({ permissions = {}, onChange = () => {}, disabled = false }) => {
  const handleToggle = (pageName, permissionType) => {
    const prev = permissions || {};
    const prevRow = prev[pageName] || { view: false, edit: false, delete: false, name: pageName };
    const newValue = !prevRow[permissionType];
    const nextRow = { ...prevRow, [permissionType]: newValue };

    // If enabling edit or delete, ensure view is enabled
    if ((permissionType === 'edit' || permissionType === 'delete') && newValue) {
      nextRow.view = true;
    }

    // If disabling view, also disable edit and delete
    if (permissionType === 'view' && !newValue) {
      nextRow.edit = false;
      nextRow.delete = false;
    }

    const next = { ...prev, [pageName]: nextRow };
    onChange(next);
  };

  // Build a map of field keys to visible permissions
  const fieldVisibilityMap = PERMISSION_FIELDS.reduce((acc, field) => {
    acc[field.key] = field.visiblePermissions || ['view', 'edit', 'delete'];
    return acc;
  }, {});

  const shouldShowPermission = (fieldKey, permissionType) => {
    const visiblePermissions = fieldVisibilityMap[fieldKey];
    return visiblePermissions.includes(permissionType);
  };

  return (
    <div className="admin-table-container">
      <table className="admin-table w-full border-collapse">
        <thead>
          <tr>
            <th>Page Name</th>
            <th className="text-center">View</th>
            <th className="text-center">Edit</th>
            <th className="text-center">Delete</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(permissions || {}).map((pageName) => (
            <tr key={pageName}>
              <td>{permissions[pageName]?.name || pageName}</td>
              <td className="text-center" style={{ visibility: shouldShowPermission(pageName, 'view') ? 'visible' : 'hidden' }}>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
                  checked={!!permissions[pageName]?.view}
                  onChange={() => handleToggle(pageName, 'view')}
                  disabled={disabled}
                />
              </td>
              <td className="text-center" style={{ visibility: shouldShowPermission(pageName, 'edit') ? 'visible' : 'hidden' }}>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
                  checked={!!permissions[pageName]?.edit}
                  onChange={() => handleToggle(pageName, 'edit')}
                  disabled={disabled}
                />
              </td>
              <td className="text-center" style={{ visibility: shouldShowPermission(pageName, 'delete') ? 'visible' : 'hidden' }}>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
                  checked={!!permissions[pageName]?.delete}
                  onChange={() => handleToggle(pageName, 'delete')}
                  disabled={disabled}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionsTable;
