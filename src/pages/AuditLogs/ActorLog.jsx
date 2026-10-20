/**
 * Actor-tab audit log page (Patient / Doctor / DT / Admin).
 *
 * @file src/pages/AuditLogs/ActorLog.jsx
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Flex } from "../../component-library";
import PageHeader from "../../components/PageHeader";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import { getAuditEvents } from "../../ApiCalls/auditApis";
import { usePageCache, PAGE_CACHE } from "../../cache";
import CsvDateRangeDownload from "./CsvDateRangeDownload";
import AuditLogTable, { ChangedByCell, IdentityCell } from "./AuditLogTable";
import {
  formatEventAction,
  formatOldValue,
  formatNewValue,
  formatLogDate,
  formatSubjectIdentity,
} from "./auditLogDisplay";
import "../../design-system/styles/index.css";

const EVENT_COLUMNS = [
  {
    key: "actor",
    header: "Actor",
    width: "16%",
    render: (log) => <ChangedByCell log={log} />,
  },
  {
    key: "did",
    header: "Did",
    width: "14%",
    className: "font-semibold text-[#393939]",
    render: (log) => formatEventAction(log),
  },
  {
    key: "subject",
    header: "To",
    width: "18%",
    render: (log) => {
      const subject = formatSubjectIdentity(log);
      return (
        <IdentityCell
          name={subject.name}
          phone={subject.contact}
          id={subject.id}
          idLabel={subject.type || "ID"}
        />
      );
    },
  },
  {
    key: "old",
    header: "Old Value",
    width: "16%",
    className: "text-[#989898]",
    render: (log) => formatOldValue(log),
  },
  {
    key: "new",
    header: "New Value",
    width: "16%",
    className: "text-[#4164df]",
    render: (log) => formatNewValue(log),
  },
  {
    key: "at",
    header: "When",
    width: "18%",
    className: "text-[#989898]",
    render: (log) => formatLogDate(log.occurred_at || log.occurredAt),
  },
];

function ActorLog({ actorKind, recordType, title, subtitle, filename }) {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchWithCache, refreshKey } = usePageCache(PAGE_CACHE.AUDIT_LOGS);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const cacheKey = `auditEvents:${actorKind || ""}:${recordType || ""}`;
      const response = await fetchWithCache(cacheKey, () =>
        getAuditEvents({ actorKind, recordType })
      );
      if (response.success) {
        setLogs(response.data?.logs || response.data || []);
        setError(null);
      } else {
        const message =
          response.data?.error ||
          response.data?.message ||
          "Failed to fetch logs";
        throw new Error(message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshKey, actorKind, recordType]);

  const visibleLogs = logs.slice(0, 10);

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title={title}
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Audit Logs", path: "/settings/logs" },
              { label: title, active: true },
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
                <h2 className="text-[18px] font-bold text-[#393939]">{title}</h2>
                <p className="text-[14px] text-[#989898] mt-1">{subtitle}</p>
              </Box>
              <CsvDateRangeDownload
                logs={logs}
                filename={filename}
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
                <AuditLogTable columns={EVENT_COLUMNS} rows={visibleLogs} />
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
}

export default ActorLog;
