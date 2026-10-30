import React, { Suspense } from 'react';
import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import DialysisStageTabs from './DialysisStageTabs';
import { DialysisScopeBar, DialysisScopeProvider } from './DialysisScope';

function shouldShowStageTabs(pathname = '') {
  return (
    pathname.startsWith('/dialysis/during') ||
    pathname.startsWith('/dialysis/post')
  );
}

export default function DialysisLayout() {
  const { pathname } = useLocation();
  const hideScopeBar = shouldShowStageTabs(pathname);

  return (
    <DialysisScopeProvider hideBar={hideScopeBar}>
      <Box sx={{ width: '100%', overflow: 'visible' }}>
        {!hideScopeBar && <DialysisScopeBar />}
        {hideScopeBar && <DialysisStageTabs />}
        <Suspense fallback={<Box sx={{ p: 4 }}>Loading...</Box>}>
          <Outlet />
        </Suspense>
      </Box>
    </DialysisScopeProvider>
  );
}
