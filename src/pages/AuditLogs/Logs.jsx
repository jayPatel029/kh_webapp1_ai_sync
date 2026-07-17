/**
 * Logs Page - Main Entry Point for Audit Logs
 * Following component library and design system patterns
 *
 * @file src/pages/AuditLogs/Logs.jsx
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";

// Component Library
import { Box, Flex, Container } from "../../component-library";
import { Card, CardBody } from "../../component-library/primitives/Card";

// Components
import PageHeader from "../../components/PageHeader";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";

// Design System
import "../../design-system/styles/index.css";
import "../../design-system/styles/admin-pages.css";

// Icons
import { FaUserInjured, FaUserMd, FaFileMedical } from "react-icons/fa";

function Logs() {
  const navigate = useNavigate();

  return (
    <ThemeProvider>
      <Box className="  flex-1 flex flex-col min-w-0">
        {/* Sticky Header Section */}
        <Box className="admin-page__header sticky top-[56px] z-20">
          <PageHeader
            title="Audit Logs"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Audit Logs", active: true },
            ]}
            onBack={() => navigate(ROUTES.HOME)}
          />
        </Box>
        <Box className="admin-card">
          {/* Main Content Area */}
          <Box className="admin-page__content w-full flex-1">
            <hr className="" />

            <Container className="py-6">
              {/* Log Type Cards */}
              <Flex gap={6} wrap="wrap" justify="center" className="admin-card-grid">
                {/* Patient Logs Card */}
                <Link to="/settings/logs/patient" className="no-underline w-full sm:w-auto">
                  <Card className="w-full sm:w-[280px] hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#4164df]">
                    <CardBody className="p-6 sm:p-8 text-center">
                      <Box className="admin-card__icon w-[80px] h-[80px] mx-auto mb-4 rounded-full bg-[#e8f4f8] flex items-center justify-center">
                        <FaUserInjured className="text-[#5886a5] text-4xl" />
                      </Box>
                      <h3 className="text-[18px] font-semibold text-[#393939] mb-2">Patient Logs</h3>
                      <p className="text-[14px] text-[#989898]">View patient data change history</p>
                    </CardBody>
                  </Card>
                </Link>

                {/* Doctor Logs Card */}
                <Link to="/settings/logs/doctor" className="no-underline w-full sm:w-auto">
                  <Card className="w-full sm:w-[280px] hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#4164df]">
                    <CardBody className="p-6 sm:p-8 text-center">
                      <Box className="admin-card__icon w-[80px] h-[80px] mx-auto mb-4 rounded-full bg-[#e8f4f8] flex items-center justify-center">
                        <FaUserMd className="text-[#5886a5] text-4xl" />
                      </Box>
                      <h3 className="text-[18px] font-semibold text-[#393939] mb-2">Doctor Logs</h3>
                      <p className="text-[14px] text-[#989898]">View doctor data change history</p>
                    </CardBody>
                  </Card>
                </Link>

                {/* Report Logs Card */}
                <Link to="/settings/logs/report" className="no-underline w-full sm:w-auto">
                  <Card className="w-full sm:w-[280px] hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#4164df]">
                    <CardBody className="p-6 sm:p-8 text-center">
                      <Box className="admin-card__icon w-[80px] h-[80px] mx-auto mb-4 rounded-full bg-[#e8f4f8] flex items-center justify-center">
                        <FaFileMedical className="text-[#5886a5] text-4xl" />
                      </Box>
                      <h3 className="text-[18px] font-semibold text-[#393939] mb-2">Report Logs</h3>
                      <p className="text-[14px] text-[#989898]">View lab and prescription changes</p>
                    </CardBody>
                  </Card>
                </Link>
              </Flex>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Logs;