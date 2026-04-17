import React from 'react';
import { Box } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import BedManagementDashboard from '../adminDashboard/components/BedManagementDashboard';
import DialysisAppointmentsDashboard from '../adminDashboard/components/DialysisAppointmentsDashboard';

const DialysisSessions = () => {
  const { isMobile } = useIsMobile();

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
        <Box className="sticky top-[56px] z-20 bg-white shadow-sm">
          <PageHeader
            title="Dialysis Sessions"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Sessions', active: true },
            ]}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : 'p-6'}`}>
          <div className="flex flex-col gap-8">
            {/* Bed Management Section - Hide internal list as we use the full dashboard below */}
            <section aria-labelledby="bed-management-title">
              <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <BedManagementDashboard hideAppointments={true} />
              </Box>
            </section>

            {/* divider with label */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#F9FAFB] px-4 text-sm font-medium text-gray-500">
                  Appointment Scheduling
                </span>
              </div>
            </div>

            {/* Weekly Appointments & Drag-and-Drop Source Section */}
            <section aria-labelledby="appointments-dashboard-title">
              <DialysisAppointmentsDashboard />
            </section>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default DialysisSessions;
