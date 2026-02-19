/**
 * Table Components Index
 * Central export point for all table/list components
 * 
 * @file src/components/table/index.js
 * 
 * Unified Components:
 * - UnifiedListTable: Base configurable list component
 * - PatientListTable: Pre-configured for patient data
 * - ParametersListTable: Pre-configured for parameters
 * - ReadingsListTable: Pre-configured for readings data
 * 
 * Legacy Components:
 * - ReadingsTable: For readings with custom modals
 * - DialysisTable: For dialysis readings
 * - Table: For regular readings
 * 
 * @example
 * import { UnifiedListTable, PatientListTable } from '../components/table';
 */

// ==================== UNIFIED LIST COMPONENTS ====================
export { default as UnifiedListTable } from './UnifiedListTable';
export { default as PatientListTable } from './PatientListTable';
export { default as ParametersListTable } from './ParametersListTable';
export { default as ReadingsListTable } from './ReadingsListTable';

// ==================== LEGACY COMPONENTS ====================
export { default as ReadingsTable } from './ReadingsTable';
export { default as DialysisTable } from './DialysisTable';
export { default as Table } from './table';

// ==================== MODAL COMPONENTS ====================
export { default as TableModal } from './TableModal';
export { default as TableModalDelete } from './TableModalDelete';
export { default as TableModalUpdate } from './TableModalUpdate';
export { default as DialyisisTableModal } from './DialyisisTableModal';
export { default as DialysisTableModalDelete } from './DialysisTableModalDelete';
export { default as DialysisTableModalUpdate } from './DialysisTableModalUpdate';
export { default as ReadingModalAdd } from './ReadingModalAdd';
export { default as ReadingModalDelete } from './ReadingModalDelete';
export { default as ReadingModalUpdate } from './ReadingModalUpdate';
