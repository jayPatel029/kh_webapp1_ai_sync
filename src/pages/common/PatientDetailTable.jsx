/**
 * PatientDetailTable - Reusable Table Component
 * 
 * Provides consistent table styling and structure for patient detail pages
 * 
 * @component
 * @file src/pages/common/PatientDetailTable.jsx
 */

import React from "react";
import { Box, Flex } from "../../component-library";

/**
 * PatientDetailTable Component
 * 
 * @param {Object} props - Component props
 * @param {Array<Object>} props.columns - Column configuration
 *   Each column: { key: string, label: string, flex: string, textAlign?: string }
 * @param {Array<Object>} props.data - Table data
 * @param {Function} props.renderRow - Function to render each row: (item, index) => React.Node
 * @param {string} props.emptyMessage - Message when no data available
 */
const PatientDetailTable = ({
  columns = [],
  data = [],
  renderRow,
  emptyMessage = "No data found",
}) => {
  return (
    <Box className="overflow-x-auto">
      {/* Table Header */}
      <Box className="bg-[#5886a5] rounded-[5px] px-[50px] py-4 mb-0">
        <Flex justify="between" align="center" className="text-white text-[16px] font-semibold">
          {columns.map((column) => (
            <Box
              key={column.key}
              style={{
                flex: column.flex || "0 0 auto",
                textAlign: column.textAlign || "left",
              }}
            >
              {column.label}
            </Box>
          ))}
        </Flex>
      </Box>

      {/* Table Body */}
      <Box>
        {data && data.length > 0 ? (
          data.map((item, index) => renderRow(item, index))
        ) : (
          <Box className="bg-white px-[50px] py-8 text-center">
            <p className="text-[#989898] text-[16px] italic">{emptyMessage}</p>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PatientDetailTable;
