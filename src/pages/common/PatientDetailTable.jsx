/**
 * PatientDetailTable - Reusable Table Component
 * 
 * Provides consistent table styling and structure for patient detail pages
 * Automatically switches to card layout on mobile
 * 
 * @component
 * @file src/pages/common/PatientDetailTable.jsx
 */

import React from "react";
import { Box, Flex } from "../../component-library";
import { useIsMobile } from "../../components/mobile/useIsMobile";

/**
 * PatientDetailTable Component
 * 
 * @param {Object} props - Component props
 * @param {Array<Object>} props.columns - Column configuration
 *   Each column: { key: string, label: string, flex: string, textAlign?: string }
 * @param {Array<Object>} props.data - Table data
 * @param {Function} props.renderRow - Function to render each row: (item, index) => React.Node
 * @param {Function} props.renderMobileCard - Optional function to render each card on mobile: (item, index) => React.Node
 * @param {string} props.emptyMessage - Message when no data available
 */
const PatientDetailTable = ({
  columns = [],
  data = [],
  renderRow,
  renderMobileCard,
  emptyMessage = "No data found",
}) => {
  const { isMobile } = useIsMobile();

  // Mobile card layout
  if (isMobile) {
    return (
      <Box className="flex flex-col gap-3">
        {data && data.length > 0 ? (
          data.map((item, index) => {
            if (renderMobileCard) {
              return renderMobileCard(item, index);
            }
            // Default mobile card: show column label-value pairs
            return (
              <Box
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-3"
              >
                {columns.map((col) => (
                  <Flex
                    key={col.key}
                    justify="between"
                    align="start"
                    className="py-1.5"
                    style={{ borderBottom: '1px solid #f3f4f6' }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-muted, #6b7280)',
                        fontFamily: "var(--font-family-primary, 'Sora', sans-serif)",
                        flexShrink: 0,
                      }}
                    >
                      {col.label}
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-text, #1e293b)',
                        fontFamily: "var(--font-family-primary, 'Sora', sans-serif)",
                        textAlign: 'right',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item[col.key] ?? '-'}
                    </span>
                  </Flex>
                ))}
              </Box>
            );
          })
        ) : (
          <Box className="py-8 text-center">
            <p className="text-[#989898] text-sm italic">{emptyMessage}</p>
          </Box>
        )}
      </Box>
    );
  }

  // Desktop table layout (original)
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
