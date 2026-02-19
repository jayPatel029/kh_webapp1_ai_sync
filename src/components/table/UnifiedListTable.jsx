/**
 * UnifiedListTable Component
 * A unified, reusable list/table component for displaying tabular data
 * Based on Figma design - compatible across all pages (ManageParameters, Readings, etc.)
 * 
 * @file src/components/table/UnifiedListTable.jsx
 * 
 * @example
 * const columns = [
 *   { key: 'profile', label: 'Profile', type: 'image', width: '111px' },
 *   { key: 'name', label: 'Name', type: 'text', width: '107px' },
 *   { key: 'number', label: 'Number', type: 'text', width: '125px' },
 *   { key: 'actions', label: 'Actions', type: 'actions', width: '80px' }
 * ];
 * 
 * const data = [
 *   { profile: '/path/to/image.jpg', name: 'John', number: '123456' },
 *   { profile: '/path/to/image2.jpg', name: 'Jane', number: '654321' }
 * ];
 * 
 * <UnifiedListTable 
 *   columns={columns} 
 *   data={data} 
 *   onEdit={(row) => {}}
 *   onDelete={(row) => {}}
 *   onDownload={(row) => {}}
 * />
 */

import React, { useState, useMemo } from 'react';
import { Box, Flex } from '../../component-library';
import { BsTrash, BsPencilSquare, BsDownload } from 'react-icons/bs';
import './UnifiedListTable.css';

const UnifiedListTable = ({
    columns = [],
    data = [],
    title = 'Data List',
    onEdit = null,
    onDelete = null,
    onDownload = null,
    onAction = null,
    isLoading = false,
    emptyMessage = 'No data found',
    rowsPerPage = 10,
    enablePagination = false,
    enableSearch = false,
    searchKeys = [],
    actionButtons = true,
    customRowRender = null,
    searchTerm,
    setSearchTerm,
    renderSearchUI = false
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    //   const [searchTerm, setSearchTerm] = useState('');

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!enableSearch || !searchTerm || searchKeys.length === 0) {
            return data;
        }

        return data.filter((row) =>
            searchKeys.some((key) => {
                const value = row[key];
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            })
        );
    }, [data, searchTerm, enableSearch, searchKeys]);

    // Paginate data
    const paginatedData = useMemo(() => {
        if (!enablePagination) return filteredData;
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredData.slice(start, end);
    }, [filteredData, enablePagination, currentPage, rowsPerPage]);

    const totalPages = enablePagination ? Math.ceil(filteredData.length / rowsPerPage) : 1;

    // Render cell content based on column type
    const renderCell = (row, column) => {
        const value = row[column.key];

        switch (column.type) {
            case 'image':
                return (
                    <div className="list-table__image-cell">
                        <div className="list-table__image-wrapper">
                            <img
                                src={value}
                                alt="profile"
                                className="list-table__image"
                            />
                        </div>
                    </div>
                );

            case 'text':
                return <span className="list-table__text-cell">{value || '-'}</span>;

            case 'date':
                return (
                    <span className="list-table__text-cell">
                        {value ? new Date(value).toISOString().split('T')[0] : '-'}
                    </span>
                );

            case 'multi-line':
                // For arrays or objects with multiple items
                return (
                    <div className="list-table__multiline-cell">
                        {Array.isArray(value) ? (
                            value.map((item, idx) => (
                                <div key={idx} className="list-table__multiline-item">
                                    {item}
                                </div>
                            ))
                        ) : (
                            <span>{value || '-'}</span>
                        )}
                    </div>
                );

            case 'actions':
                return (
                    <div className="list-table__actions-cell">
                        {actionButtons && (
                            <div className="list-table__actions-group">
                                {onEdit && (
                                    <button
                                        className="list-table__action-btn list-table__action-btn--edit"
                                        onClick={() => onEdit(row)}
                                        title="Edit"
                                        aria-label="Edit row"
                                    >
                                        <BsPencilSquare />
                                    </button>
                                )}
                                {onDownload && (
                                    <button
                                        className="list-table__action-btn list-table__action-btn--download"
                                        onClick={() => onDownload(row)}
                                        title="Download"
                                        aria-label="Download"
                                    >
                                        <BsDownload />
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        className="list-table__action-btn list-table__action-btn--delete"
                                        onClick={() => onDelete(row)}
                                        title="Delete"
                                        aria-label="Delete row"
                                    >
                                        <BsTrash />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'custom':
                return column.render ? column.render(row, value) : value;

            default:
                return <span className="list-table__text-cell">{value || '-'}</span>;
        }
    };

    return (
        <div className="list-table__container">
            {/* Search Bar - Only render if renderSearchUI is true */}
            {enableSearch && renderSearchUI && (
                <div className="list-table__search-bar">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="list-table__search-input"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            )}

            {/* Table */}
            <div className="list-table__wrapper">
                <table className="list-table">
                    {/* Header */}
                    <thead>
                        <tr className="list-table__header-row">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="list-table__header-cell"
                                    style={{ width: column.width, minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="list-table__loading">
                                    Loading...
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="list-table__empty">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    className="list-table__row"
                                    data-row-index={rowIdx}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={`${rowIdx}-${column.key}`}
                                            className="list-table__cell"
                                            style={{ width: column.width, minWidth: column.minWidth }}
                                        >
                                            {customRowRender
                                                ? customRowRender(row, column, renderCell)
                                                : renderCell(row, column)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {enablePagination && totalPages > 1 && (
                <div className="list-table__pagination">
                    <button
                        className="list-table__pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="list-table__pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="list-table__pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Info */}
            <div className="list-table__info">
                <small>
                    Showing {paginatedData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
                    {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} items
                </small>
            </div>
        </div>
    );
};

export default UnifiedListTable;
