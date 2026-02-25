/**
 * PatientDetailLayout - Shared Layout Component
 * 
 * This component provides a consistent layout and styling for patient detail pages
 * (Prescriptions, Lab Reports, Diet Details, Alarms, Requisitions)
 * 
 * @component
 * @file src/pages/common/PatientDetailLayout.jsx
 */

import React, { useContext, useState, useEffect } from "react";
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
import PatientSectionCard from "../../components/PatientSectionCard";
import { useIsMobile } from "../../components/mobile/useIsMobile";

// APIs and Helpers
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";
import { ROUTES } from "../../routes/routeConstants";
import { PatientProfileShellContext } from "./PatientProfileShellContext";

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
const  PatientDetailLayout = ({
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
  const shellContext = useContext(PatientProfileShellContext);

  const isInPatientProfileShell = Boolean(shellContext);
  const resolvedUserData = shellContext?.userData || userData;
  const resolvedRole = shellContext?.role || role;
  const resolvedUnreadAdminCount = shellContext?.unreadAdminCount ?? totalUnreadCount;
  const resolvedUnreadDoctorCount = shellContext?.unreadDoctorCount ?? totalUnreadCountDoc;

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

  if (isInPatientProfileShell) {
    if (isMobile) {
      return (
        <Box className="flex-1 px-3 py-3">
          <PatientSectionCard title={title} userName={resolvedUserData?.name} compact>
            {children}
          </PatientSectionCard>
        </Box>
      );
    }

    return (
      <Box className="flex-1">
        <PatientSectionCard title={title} userName={resolvedUserData?.name}>
          {children}
        </PatientSectionCard>
      </Box>
    );
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
              userData={resolvedUserData}
              unreadAdminCount={resolvedUnreadAdminCount}
              unreadDoctorCount={resolvedUnreadDoctorCount}
              role={resolvedRole}
            />
          </Box>

          {/* Content without heavy shadow/padding */}
          <Box className="flex-1 px-3 py-3">
            <PatientSectionCard title={title} userName={userData?.name} compact>
              {children}
            </PatientSectionCard>
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
            userData={resolvedUserData}
            unreadAdminCount={resolvedUnreadAdminCount}
            unreadDoctorCount={resolvedUnreadDoctorCount}
            role={resolvedRole}
          />
        </Box>

        {/* Main Content */}
        <Box className="flex-1 ">
          <PatientSectionCard title={title} userName={userData?.name}>
            {children}
          </PatientSectionCard>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PatientDetailLayout;
