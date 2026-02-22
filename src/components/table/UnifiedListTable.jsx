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
import { useIsMobile } from '../mobile/useIsMobile';
import './UnifiedListTable.css';
import DeleteIcon from '../../assets/Delete.svg';
import EditIcon from '../../assets/Edit.svg';
import DownloadIcon from '../../assets/Download.svg';

const UnifiedListTable = ({
    columns = [],
    data = [],
    title = 'Data List',
    onEdit = null,
    onDelete = null,
    onDownload = null,
    onAction = null,
    onRowClick = null,
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
    renderSearchUI = false,
    // Mobile card mode props
    displayMode, // 'table' | 'cards' | undefined (auto)
    cardTitleKey, // key for card title field
    cardSubtitleKey, // key for card subtitle field
    cardImageKey, // key for card image/avatar
    cardFieldKeys, // array of keys to show as detail fields
    onCardClick, // callback when a card is tapped
    cardStatusKey, // key for status badge
    mobileCardRender, // optional custom card render fn(row, columns, renderCell)
}) => {
    const { isMobile } = useIsMobile();
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

    // Determine if we should show cards
    const showCards = displayMode === 'cards' || (displayMode !== 'table' && isMobile);

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
                                        <img src={EditIcon} alt="Edit" />
                                    </button>
                                )}
                                {onDownload && (
                                    <button
                                        className="list-table__action-btn list-table__action-btn--download"
                                        onClick={() => onDownload(row)}
                                        title="Download"
                                        aria-label="Download"
                                    >
                                        <img src={DownloadIcon} alt="Download" />
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        className="list-table__action-btn list-table__action-btn--delete"
                                        onClick={() => onDelete(row)}
                                        title="Delete"
                                        aria-label="Delete row"
                                    >
                                        <img src={DeleteIcon} alt="Delete" />
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

            {/* Mobile Card Mode */}
            {showCards ? (
                <div className="list-table__cards-container">
                    {isLoading ? (
                        <div className="list-table__cards-loading">Loading...</div>
                    ) : paginatedData.length === 0 ? (
                        <div className="list-table__cards-empty">{emptyMessage}</div>
                    ) : (
                        paginatedData.map((row, rowIdx) => {
                            // Custom card render
                            if (mobileCardRender) {
                                return (
                                    <div key={rowIdx} className="list-table__card-wrapper">
                                        {mobileCardRender(row, columns, renderCell)}
                                    </div>
                                );
                            }

                            // Default card rendering
                            const imageCol = columns.find(c => c.key === cardImageKey || c.type === 'image');
                            const titleCol = columns.find(c => c.key === cardTitleKey) || columns.find(c => c.type === 'text');
                            const subtitleCol = cardSubtitleKey ? columns.find(c => c.key === cardSubtitleKey) : null;
                            const statusCol = cardStatusKey ? columns.find(c => c.key === cardStatusKey) : null;
                            const detailCols = cardFieldKeys
                                ? columns.filter(c => cardFieldKeys.includes(c.key))
                                : columns.filter(c => c.type !== 'image' && c.type !== 'actions' && c.key !== titleCol?.key && c.key !== subtitleCol?.key);

                            return (
                                <div
                                    key={rowIdx}
                                    className="list-table__card"
                                    onClick={() => {
                                        onCardClick?.(row);
                                        onRowClick?.(row);
                                    }}
                                    role={onCardClick || onRowClick ? 'button' : undefined}
                                    tabIndex={onCardClick || onRowClick ? 0 : undefined}
                                    style={onRowClick || onCardClick ? { cursor: 'pointer' } : undefined}
                                >
                                    {/* Card Header */}
                                    <div className="list-table__card-header">
                                        {imageCol && row[imageCol.key] && (
                                            <div className="list-table__card-avatar">
                                                <img src={row[imageCol.key]} alt="" />
                                            </div>
                                        )}
                                        <div className="list-table__card-title-area">
                                            {titleCol && (
                                                <div className="list-table__card-title">
                                                    {row[titleCol.key] || '-'}
                                                </div>
                                            )}
                                            {subtitleCol && (
                                                <div className="list-table__card-subtitle">
                                                    {row[subtitleCol.key] || '-'}
                                                </div>
                                            )}
                                        </div>
                                        {statusCol && row[statusCol.key] && (
                                            <div className={`list-table__card-status list-table__card-status--${String(row[statusCol.key]).toLowerCase().replace(/\s+/g, '-')}`}>
                                                {row[statusCol.key]}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Details */}
                                    {detailCols.length > 0 && (
                                        <div className="list-table__card-details">
                                            {detailCols.map((col) => (
                                                <div key={col.key} className="list-table__card-field">
                                                    <span className="list-table__card-field-label">{col.label}</span>
                                                    <span className="list-table__card-field-value">
                                                        {col.type === 'date' && row[col.key]
                                                            ? new Date(row[col.key]).toISOString().split('T')[0]
                                                            : col.type === 'custom' && col.render
                                                                ? col.render(row, row[col.key])
                                                                : (row[col.key] || '-')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Card Actions */}
                                    {actionButtons && (onEdit || onDelete || onDownload) && (
                                        <div className="list-table__card-actions">
                                            {onEdit && (
                                                <button
                                                    className="list-table__card-action-btn list-table__card-action-btn--edit"
                                                    onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                                                    aria-label="Edit"
                                                >
                                                    <BsPencilSquare /> Edit
                                                </button>
                                            )}
                                            {onDownload && (
                                                <button
                                                    className="list-table__card-action-btn list-table__card-action-btn--download"
                                                    onClick={(e) => { e.stopPropagation(); onDownload(row); }}
                                                    aria-label="Download"
                                                >
                                                    <BsDownload /> Download
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    className="list-table__card-action-btn list-table__card-action-btn--delete"
                                                    onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                                                    aria-label="Delete"
                                                >
                                                    <DeleteIcon /> Delete
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
            /* Desktop Table Mode */
            <div className="list-table__wrapper">
                <table className="list-table">
                    {/* Header */}
                    <thead className="list-table__header">
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
                                    onClick={() => onRowClick?.(row)}
                                    style={onRowClick ? { cursor: 'pointer' } : undefined}
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
            )}

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
