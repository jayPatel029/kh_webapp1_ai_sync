/**
 * Dialysis Inventory (Manager only)
 * Placeholder — content TBD.
 *
 * @file src/pages/dialysis/DialysisInventory.jsx
 */

import React from 'react';
import { Box } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';

const DialysisInventory = () => {
  const { isMobile } = useIsMobile();

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Dialysis Inventory"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Inventory', active: true },
            ]}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`}>
          <div className="admin-card">
            <div className="flex items-center justify-center min-h-[300px]">
              <p className="text-gray-400 text-lg">Inventory — Coming Soon</p>
            </div>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default DialysisInventory;
