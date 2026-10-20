/**
 * Date-range CSV download control for audit log pages.
 * Defaults to the last 3 months.
 *
 * @file src/pages/AuditLogs/CsvDateRangeDownload.jsx
 */

import React, { useMemo, useState } from "react";
import { Box, Flex } from "../../component-library";
import { Button } from "../../component-library/primitives/Button";
import { Input } from "../../component-library/primitives/Input";

const toDateInputValue = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getDefaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 3);
  return {
    from: toDateInputValue(from),
    to: toDateInputValue(to),
  };
};

const getLogTimestamp = (log) =>
  log?.occurred_at ||
  log?.occurredAt ||
  log?.changed_at ||
  log?.changedAt ||
  log?.created_at ||
  log?.createdAt ||
  null;

const filterLogsByDateRange = (logs, from, to) => {
  if (!Array.isArray(logs) || !logs.length) return [];
  if (!from || !to) return logs;

  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return logs;

  return logs.filter((log) => {
    const ts = getLogTimestamp(log);
    if (!ts) return false;
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return false;
    return d >= start && d <= end;
  });
};

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

/**
 * @param {object} props
 * @param {Array} props.logs
 * @param {string} props.filename
 * @param {boolean} [props.disabled]
 */
function CsvDateRangeDownload({ logs = [], filename = "logs.csv", disabled = false }) {
  const defaults = useMemo(() => getDefaultRange(), []);
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);

  const rangedLogs = useMemo(
    () => filterLogsByDateRange(logs, fromDate, toDate),
    [logs, fromDate, toDate]
  );

  const rangeInvalid = Boolean(fromDate && toDate && fromDate > toDate);

  const downloadCSV = () => {
    if (rangeInvalid || !rangedLogs.length) return;

    const csvData = convertToCSV(rangedLogs);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Flex
      align="end"
      gap={3}
      wrap="wrap"
      className="justify-end"
    >
      <Box>
        <label className="block text-[12px] font-semibold text-[#989898] mb-1">
          From
        </label>
        <Input
          type="date"
          value={fromDate}
          max={toDate || undefined}
          onChange={(e) => setFromDate(e.target.value)}
          className="min-w-[150px]"
        />
      </Box>
      <Box>
        <label className="block text-[12px] font-semibold text-[#989898] mb-1">
          To
        </label>
        <Input
          type="date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(e) => setToDate(e.target.value)}
          className="min-w-[150px]"
        />
      </Box>
      <Box>
        <Button
          variant="solid"
          onClick={downloadCSV}
          disabled={disabled || rangeInvalid || !rangedLogs.length}
          title={
            rangeInvalid
              ? "From date must be before To date"
              : !rangedLogs.length
                ? "No logs in selected date range"
                : `Download ${rangedLogs.length} log(s)`
          }
        >
          Download CSV
        </Button>
        <p className="text-[11px] text-[#989898] mt-1 text-right">
          {rangeInvalid
            ? "Invalid date range"
            : `${rangedLogs.length} row(s) in range (default 3 months)`}
        </p>
      </Box>
    </Flex>
  );
}

export default CsvDateRangeDownload;
export { filterLogsByDateRange, getDefaultRange, getLogTimestamp };
