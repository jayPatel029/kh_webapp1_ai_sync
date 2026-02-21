/**
 * Doctor Dashboard - Redesigned
 * Renders as content within DashboardLayout
 * 
 * @file src/pages/doctorDashboard/DoctorDashboard.jsx
 */

import React from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text
} from '../../component-library';

// Design System
import '../../design-system/styles/index.css';

function DoctorDashboard() {
  return (
    <Box className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      <Box className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
          
          <Heading as="h1" size="2xl" className="mb-6 text-[#32617d]">
            Doctor Dashboard
          </Heading>

          <Box className="bg-yellow-100 p-8 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800">
              Section for alerts fetch alerts here
            </Text>
          </Box>
         
      </Box>
    </Box>
  );
}

export default DoctorDashboard;