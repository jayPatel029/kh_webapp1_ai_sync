/**
 * PatientDetailLayout - Shared Layout Component
 * 
 * This component provides a consistent layout and styling for patient detail pages
 * (Prescriptions, Lab Reports, Diet Details, Alarms, Requisitions)
 * 
 * @component
 * @file src/pages/common/PatientDetailLayout.jsx
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

// Component Library
import {
  Box,
  Flex,
  Container,
} from "../../component-library";
import { Button } from "../../component-library/primitives/Button";

// Components
import PageHeader from "../../components/PageHeader";
import PatientNavTabs from "../../components/PatientNavTabs";
import ThemeProvider from "../../components/ThemeProvider";
import { useIsMobile } from "../../components/mobile/useIsMobile";

// APIs and Helpers
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";
import { ROUTES } from "../../routes/routeConstants";

/**
 * PatientDetailLayout Component
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.title - Page title (e.g., "Prescriptions", "Lab Reports")
 * @param {string} config.patientIdParam - URL param name ("id" or "pid")
 * @param {React.ReactNode} config.children - Main content to render (table/data display)
 * @param {Object} config.userData - Patient user data { name, ... }
 * @param {number} config.totalUnreadCount - Unread admin messages count
 * @param {number} config.totalUnreadCountDoc - Unread doctor messages count
 * @param {boolean} config.loading - Loading state
 * @param {Function} config.onBackClick - Callback for back navigation
 * @param {Object} config.additionalProps - Any additional props to pass through
 */
const PatientDetailLayout = ({
  title,
  patientIdParam = "id",
  children,
  userData = {},
  totalUnreadCount = 0,
  totalUnreadCountDoc = 0,
  loading = false,
  onBackClick,
  additionalProps = {},
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const patientId = params[patientIdParam];
  const role = useSelector((state) => state.permission);
  const { isMobile } = useIsMobile();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(ROUTES.PATIENTS);
    }
  };

  if (loading) {
    return <Box className="p-20 text-center">Loading...</Box>;
  }

  // Mobile layout
  if (isMobile) {
    return (
      <ThemeProvider>
        <Box className="flex-1 flex flex-col min-w-0">
          {/* Compact sticky header */}
          <Box className="sticky top-0 z-20 bg-white px-4 pt-2 pb-0">
            <PageHeader
              title={title}
              breadcrumbs={[
                { label: "Patient", path: ROUTES.patientDetail(patientId), active: false },
                { label: title, active: true },
              ]}
              onBack={handleBackClick}
            />
            {/* Navigation Tabs - compact horizontal scroll */}
            <PatientNavTabs
              patientId={patientId}
              userData={userData}
              unreadAdminCount={totalUnreadCount}
              unreadDoctorCount={totalUnreadCountDoc}
              role={role}
            />
          </Box>

          {/* Content without heavy shadow/padding */}
          <Box className="flex-1 px-3 py-3">
            <Box className="bg-white rounded-xl w-full p-3">
              {/* Compact patient header */}
              <Flex
                justify="between"
                align="center"
                className="pb-3 border-b border-gray-200 mb-3"
              >
                <h2 className="text-base font-bold text-[#393939]">{title}</h2>
                <Flex align="center" gap={2}>
                  <Box className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-700">
                      {userData?.name?.charAt(0)?.toUpperCase() || "P"}
                    </span>
                  </Box>
                  <span className="text-sm text-[#393939] truncate max-w-[120px]">
                    {userData?.name || "Patient"}
                  </span>
                </Flex>
              </Flex>
              {children}
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // Desktop layout (original)
  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white">
          <Flex justify="start" align="center" className="py-4 px-6">
            <PageHeader
              title={title}
              breadcrumbs={[
                { label: "Patient", path: ROUTES.patientDetail(patientId), active: false },
                { label: title, active: true },
              ]}
              onBack={handleBackClick}
            />
          </Flex>
          <PatientNavTabs
            patientId={patientId}
            userData={userData}
            unreadAdminCount={totalUnreadCount}
            unreadDoctorCount={totalUnreadCountDoc}
            role={role}
          />
        </Box>

        {/* Main Content */}
        <Box className="flex-1 ">
            <Box className="bg-white rounded-[15px] w-full p-8 shadow-[2px_2px_8px_8px_rgba(0,0,0,0.1)] shadow-[-2px_-2px_8px_8px_rgba(0,0,0,0.1)] ">
              <Flex
                justify="between"
                align="center"
                className="pb-4  border-b-2 !border-info mb-6"
              >
                <Box>
                  <h2 className="text-[18px] font-bold text-[#393939]">{title}</h2>
                </Box>
                <Flex align="center" gap={3}>
                  <Box className="flex items-center gap-2">
                    <Box className="w-[30px] h-[30px] rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-700">
                        {userData?.name?.charAt(0)?.toUpperCase() || "P"}
                      </span>
                    </Box>
                    <span className="text-[18px] text-[#393939]">
                      {userData?.name || "Patient"}
                    </span>
                  </Box>
                </Flex>
              </Flex>
              {children}
            </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PatientDetailLayout;
