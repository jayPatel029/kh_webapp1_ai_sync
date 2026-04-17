/**
 * Dialysis Dashboard (Manager only)
 * Placeholder — content TBD.
 *
 * @file src/pages/dialysis/DialysisDashboard.jsx
 */

import React from 'react';
import { Box } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';

const DialysisDashboard = () => {
  const { isMobile } = useIsMobile();

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Dialysis Dashboard"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Dashboard', active: true },
            ]}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`}>
          <div className="admin-card">
            <div className="flex items-center justify-center min-h-[300px]">
              <p className="text-gray-400 text-lg">Dashboard — Coming Soon</p>
            </div>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default DialysisDashboard;
