import React, { Suspense } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import DialysisStageTabs from './DialysisStageTabs';

export default function DialysisLayout() {
  return (
    <Box sx={{ width: '100%' }}>
      <DialysisStageTabs />
      <Suspense fallback={<Box sx={{ p: 4 }}>Loading...</Box>}>
        <Outlet />
      </Suspense>
    </Box>
  );
}
