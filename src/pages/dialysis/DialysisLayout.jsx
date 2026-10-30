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
  const isDuring = pathname.startsWith('/dialysis/during');

  return (
    <DialysisScopeProvider hideBar={hideScopeBar}>
      <Box sx={{ width: '100%', overflow: 'visible' }}>
        {!hideScopeBar && <DialysisScopeBar />}
        {hideScopeBar && <DialysisStageTabs />}
        <Box
          className={isDuring ? undefined : 'md:pl-6 md:pr-8 md:pb-6'}
          sx={{ width: '100%', overflow: 'visible' }}
        >
          <Suspense fallback={<Box sx={{ p: 4 }}>Loading...</Box>}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </DialysisScopeProvider>
  );
}
