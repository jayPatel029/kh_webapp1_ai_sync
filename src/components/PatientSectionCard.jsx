import React from 'react';
import { Box, Flex } from '../component-library';

// A small reusable container for patient detail sections.
// Props:
// - title: string title displayed in the header
// - userName: optional patient name for the avatar/name area
// - compact: boolean to use compact padding and rounded-xl styles
// - children: content
const PatientSectionCard = ({ title, userName, compact = false, children, className = '' , noheaderline = false }) => {
  const baseClass = compact
    ? 'bg-white rounded-xl w-full p-3'
    : 'bg-white rounded-[15px] w-full p-8 mt-8 shadow-[2px_2px_8px_8px_rgba(0,0,0,0.1)] shadow-[-2px_-2px_8px_8px_rgba(0,0,0,0.1)]';

  return (
    <Box className={`${baseClass} ${className}`}>
      <Flex justify="between" align="center" className={(noheaderline ? "" : " border-b-2 !border-info pb-4 mb-6")} >
        <Box>
          <h2 className="text-[18px] font-bold text-[#393939]">{title}</h2>
        </Box>
        {/* {userName && (
          <Flex align="center" gap={3}>
            <Box className="flex items-center gap-2">
              <Box className="w-[30px] h-[30px] rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-700">{userName?.charAt(0)?.toUpperCase() || 'P'}</span>
              </Box>
              <span className="text-[18px] text-[#393939] truncate max-w-[200px]">{userName}</span>
            </Box>
          </Flex>
        )} */}
      </Flex>
      {children}
    </Box>
  );
};

export default PatientSectionCard;
