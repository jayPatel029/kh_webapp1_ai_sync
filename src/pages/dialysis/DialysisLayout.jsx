import React, { Suspense } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

// Uses existing PageHeader navigation (src/components/PageHeader.jsx) for tabs.
// This layout only provides Suspense for lazy dialysis pages.
export default function DialysisLayout() {
  return (
    <Box sx={{ width: '100%' }}>
      <Suspense fallback={<Box sx={{ p: 4 }}>Loading...</Box>}>
        <Outlet />
      </Suspense>
    </Box>
  );
}
