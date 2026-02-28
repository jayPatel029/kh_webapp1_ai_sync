/**
 * Patient Logs Page - Redesigned
 * Following component library and design system patterns
 * 
 * @file src/pages/AuditLogs/patientLog.jsx
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Component Library
import {
  Box,
  Flex,
  Container,
} from "../../component-library";
import { Button } from "../../component-library/primitives/Button";
import { Card, CardBody } from "../../component-library/primitives/Card";

// Components
import PageHeader from "../../components/PageHeader";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";

// APIs and Helpers
import { getPatientLog } from "../../ApiCalls/patientAPis";
import { usePageCache, PAGE_CACHE } from "../../cache";

// Design System
import "../../design-system/styles/index.css";

// Icons
import { FaDownload, FaArrowLeft } from "react-icons/fa";

const LogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = useSelector((state) => state.permission);
  const { fetchWithCache, refreshKey } = usePageCache(PAGE_CACHE.AUDIT_LOGS);

  // Fetch logs from the backend
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetchWithCache('patientLogs', () => getPatientLog());
      if (response.success) {
        setLogs(response.data?.logs || []);
      } else {
        throw new Error("Failed to fetch logs");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshKey]);

  // Convert logs to CSV format
  const convertToCSV = (data) => {
    if (!data.length) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data
      .map((log) =>
        Object.values(log)
          .map((value) =>
            typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          )
          .join(",")
      )
      .join("\n");

    return `${headers}\n${rows}`;
  };

  // Trigger CSV download
  const downloadCSV = () => {
    const csvData = convertToCSV(logs);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "patient_logs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

          {/* Sticky Header Section */}
          <Box className="sticky top-[56px] z-20 bg-white">
             
              <PageHeader
                title="Patient Logs"
                breadcrumbs={[
                  { label: "Dashboard", path: "/" },
                  { label: "Audit Logs", path: "/logs" },
                  { label: "Patient Logs", active: true }
                ]}
                onBack={() => navigate(ROUTES.LOGS)}
              />
             
          </Box>

          {/* Main Content Area */}
          <Box className="flex-1 bg-[#fafafa]">  
              <Box className="bg-white rounded-[15px] shadow-md p-4 md:p-8">
                {/* Header Section */}
                <Flex justify="between" align="center" className="pb-4 border-b border-gray-200 mb-6">
                  <Box>
                    <h2 className="text-[18px] font-bold text-[#393939]">Patient Logs</h2>
                    <p className="text-[14px] text-[#989898] mt-1">Track changes made to patient records</p>
                  </Box>
                  <Button
                    variant="solid"
                    onClick={downloadCSV}
                    disabled={!logs.length}
                    // leftIcon={<FaDownload />}
                  >
                    Download CSV
                  </Button>
                </Flex>

                {/* Loading State */}
                {loading && (
                  <Box className="py-12 text-center">
                    <Box className="animate-spin w-8 h-8 border-4 border-[#4164df] border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-[#989898]">Loading logs...</p>
                  </Box>
                )}

                {/* Error State */}
                {error && (
                  <Box className="py-12 text-center">
                    <Box className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-500 text-2xl">!</span>
                    </Box>
                    <p className="text-red-500 font-semibold">Error: {error}</p>
                  </Box>
                )}

                {/* Table */}
                {!loading && !error && (
                  <Box className="overflow-x-auto">
                    {/* Table Header */}
                    <Box className="bg-[#5886a5] rounded-[5px] px-6 py-4 mb-0">
                      <Flex justify="between" align="center" className="text-white text-[14px] font-semibold">
                        <Box style={{ flex: "0 0 120px" }}>Patient ID</Box>
                        <Box style={{ flex: "0 0 150px" }}>Field</Box>
                        <Box style={{ flex: "1", minWidth: "150px" }}>Old Value</Box>
                        <Box style={{ flex: "1", minWidth: "150px" }}>New Value</Box>
                        <Box style={{ flex: "0 0 180px" }}>Changed At</Box>
                        <Box style={{ flex: "0 0 120px" }}>Changed By</Box>
                      </Flex>
                    </Box>

                    {/* Table Body */}
                    <Box>
                      {logs && logs.length > 0 ? (
                        logs.slice(0, 10).map((log, index) => (
                          <Box
                            key={index}
                            className="bg-white border-b border-gray-100 px-6 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <Flex justify="between" align="center">
                              <Box style={{ flex: "0 0 120px" }} className="text-[14px] font-semibold text-[#989898]">
                                {log.patientId}
                              </Box>
                              <Box style={{ flex: "0 0 150px" }} className="text-[14px] font-semibold text-[#393939]">
                                {log.field}
                              </Box>
                              <Box style={{ flex: "1", minWidth: "150px" }} className="text-[14px] text-[#989898] truncate pr-2">
                                {log.oldValue || "-"}
                              </Box>
                              <Box style={{ flex: "1", minWidth: "150px" }} className="text-[14px] text-[#4164df] truncate pr-2">
                                {log.newValue || "-"}
                              </Box>
                              <Box style={{ flex: "0 0 180px" }} className="text-[14px] text-[#989898]">
                                {new Date(log.changedAt).toLocaleString()}
                              </Box>
                              <Box style={{ flex: "0 0 120px" }} className="text-[14px] font-semibold text-[#989898]">
                                {log.changedBy}
                              </Box>
                            </Flex>
                          </Box>
                        ))
                      ) : (
                        <Box className="bg-white px-6 py-12 text-center">
                          <p className="text-[#989898] text-[16px] italic">No logs found</p>
                        </Box>
                      )}
                    </Box>

                    {/* Show more indicator */}
                    {logs.length > 10 && (
                      <Box className="bg-gray-50 px-6 py-3 text-center">
                        <p className="text-[14px] text-[#989898]">
                          Showing 10 of {logs.length} logs. Download CSV for complete data.
                        </p>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
             
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LogsPage;
