/**
 * Logs Page - Main Entry Point for Audit Logs
 * Following component library and design system patterns
 * 
 * @file src/pages/AuditLogs/Logs.jsx
 */

import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

// Component Library
import {
  Box,
  Flex,
  Container,
} from "../../component-library";
import { Button } from "../../component-library/primitives/Button";
import { Card, CardHeader, CardBody } from "../../component-library/primitives/Card";

// Components
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";

// Design System
import "../../design-system/styles/index.css";

// Icons
import { FaUserInjured, FaUserMd } from "react-icons/fa";

function Logs() {
  const role = useSelector((state) => state.permission);

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

          {/* Sticky Header Section */}
          <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
            <Container className="py-4 px-4 md:px-6 mx-0">
              <PageHeader
                title="Audit Logs"
                breadcrumbs={[
                  { label: "Dashboard", path: "/" },
                  { label: "Audit Logs", active: true }
                ]}
              />
            </Container>
          </Box>

          {/* Main Content Area */}
          <Box className="flex-1 bg-[#fafafa]">
            <Container className="py-8 px-4 md:px-12 max-w-[1440px] mx-auto">
              <Box className="bg-white rounded-[15px] shadow-md p-8">
                {/* Header Section */}
                <Flex justify="between" align="center" className="pb-4 border-b border-gray-200 mb-8">
                  <Box>
                    <h2 className="text-[18px] font-bold text-[#393939]">Select Log Type</h2>
                    <p className="text-[14px] text-[#989898] mt-1">Choose which type of logs you want to view</p>
                  </Box>
                </Flex>

                {/* Log Type Cards */}
                <Flex gap={6} wrap="wrap" justify="center">
                  {/* Patient Logs Card */}
                  <Link to="/PatientLogs" className="no-underline">
                    <Card className="w-[280px] hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#4164df]">
                      <CardBody className="p-8 text-center">
                        <Box className="w-[80px] h-[80px] mx-auto mb-4 rounded-full bg-[#e8f4f8] flex items-center justify-center">
                          <FaUserInjured className="text-[#5886a5] text-4xl" />
                        </Box>
                        <h3 className="text-[18px] font-semibold text-[#393939] mb-2">Patient Logs</h3>
                        <p className="text-[14px] text-[#989898]">View patient data change history</p>
                      </CardBody>
                    </Card>
                  </Link>

                  {/* Doctor Logs Card */}
                  <Link to="/DocLogs" className="no-underline">
                    <Card className="w-[280px] hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#4164df]">
                      <CardBody className="p-8 text-center">
                        <Box className="w-[80px] h-[80px] mx-auto mb-4 rounded-full bg-[#e8f4f8] flex items-center justify-center">
                          <FaUserMd className="text-[#5886a5] text-4xl" />
                        </Box>
                        <h3 className="text-[18px] font-semibold text-[#393939] mb-2">Doctor Logs</h3>
                        <p className="text-[14px] text-[#989898]">View doctor data change history</p>
                      </CardBody>
                    </Card>
                  </Link>
                </Flex>
              </Box>
            </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Logs;
