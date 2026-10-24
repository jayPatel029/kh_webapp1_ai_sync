import React, { Suspense } from 'react';
import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import DialysisStageTabs from './DialysisStageTabs';

function shouldShowStageTabs(pathname = '') {
  return (
    pathname.startsWith('/dialysis/during') ||
    pathname.startsWith('/dialysis/post')
  );
}

export default function DialysisLayout() {
  const { pathname } = useLocation();

  return (
    <Box sx={{ width: '100%', overflow: 'visible' }}>
      {shouldShowStageTabs(pathname) && <DialysisStageTabs />}
      <Suspense fallback={<Box sx={{ p: 4 }}>Loading...</Box>}>
        <Outlet />
      </Suspense>
    </Box>
  );
}
