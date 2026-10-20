/**
 * Report Logs Page
 *
 * @file src/pages/AuditLogs/ReportLog.jsx
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Flex } from "../../component-library";
import PageHeader from "../../components/PageHeader";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import { getDoctorReportLogs } from "../../ApiCalls/doctorApis";
import { usePageCache, PAGE_CACHE } from "../../cache";
import CsvDateRangeDownload from "./CsvDateRangeDownload";
import AuditLogTable, { ChangedByCell, IdentityCell } from "./AuditLogTable";
import { displayValue, formatLogDate } from "./auditLogDisplay";
import "../../design-system/styles/index.css";

const REPORT_COLUMNS = [
  {
    key: "patient",
    header: "Patient",
    width: "14%",
    render: (log) => (
      <IdentityCell id={log.patient_id || log.patientId} />
    ),
  },
  {
    key: "type",
    header: "Type",
    width: "14%",
    className: "text-[#4164df]",
    render: (log) => displayValue(log.type),
  },
  {
    key: "message",
    header: "Message",
    width: "22%",
    className: "text-[#393939]",
    render: (log) => displayValue(log.message),
  },
  {
    key: "report",
    header: "Report",
    width: "20%",
    className: "text-[#989898]",
    render: (log) => displayValue(log.report),
  },
  {
    key: "at",
    header: "Changed At",
    width: "16%",
    className: "text-[#989898]",
    render: (log) => formatLogDate(log.changed_at || log.changedAt),
  },
  {
    key: "by",
    header: "Changed By",
    width: "14%",
    render: (log) => <ChangedByCell log={log} />,
  },
];

const ReportLogPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchWithCache, refreshKey } = usePageCache(PAGE_CACHE.AUDIT_LOGS);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetchWithCache("reportLogs", () =>
        getDoctorReportLogs()
      );
      if (response.success) {
        setLogs(response.data?.logs || response.data || []);
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

  const visibleLogs = logs.slice(0, 10);

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Report Logs"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Audit Logs", path: "/settings/logs" },
              { label: "Report Logs", active: true },
            ]}
            rightAction={<RefreshButton pageName={PAGE_CACHE.AUDIT_LOGS.name} />}
            onBack={() => navigate(ROUTES.SETTINGS_LOGS)}
          />
        </Box>

        <Box className="flex-1 bg-[#fafafa]">
          <Box className="bg-white rounded-[15px] shadow-md p-4 md:p-8">
            <Flex
              justify="between"
              align="start"
              gap={4}
              wrap="wrap"
              className="pb-4 border-b border-gray-200 mb-6"
            >
              <Box>
                <h2 className="text-[18px] font-bold text-[#393939]">Report Logs</h2>
                <p className="text-[14px] text-[#989898] mt-1">
                  Track changes made to lab reports and prescriptions
                </p>
              </Box>
              <CsvDateRangeDownload
                logs={logs}
                filename="report_logs.csv"
                disabled={loading || !!error}
              />
            </Flex>

            {loading && (
              <Box className="py-12 text-center">
                <Box className="animate-spin w-8 h-8 border-4 border-[#4164df] border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-[#989898]">Loading logs...</p>
              </Box>
            )}

            {error && (
              <Box className="py-12 text-center">
                <Box className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 text-2xl">!</span>
                </Box>
                <p className="text-red-500 font-semibold">Error: {error}</p>
              </Box>
            )}

            {!loading && !error && (
              <>
                <AuditLogTable columns={REPORT_COLUMNS} rows={visibleLogs} />
                {logs.length > 10 && (
                  <Box className="bg-gray-50 px-6 py-3 text-center">
                    <p className="text-[14px] text-[#989898]">
                      Showing 10 of {logs.length} logs. Download CSV for complete data.
                    </p>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ReportLogPage;
