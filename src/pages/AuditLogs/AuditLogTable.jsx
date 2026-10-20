import React from "react";
import { Box } from "../../component-library";
import { formatChangedBy, formatOutcome } from "./auditLogDisplay";

const cellClass =
  "px-3 py-3 text-[14px] align-top break-words whitespace-normal";

export function ChangedByCell({ log, options }) {
  const actor = formatChangedBy(log, options);
  return (
    <Box>
      <Box className="font-semibold text-[#393939] break-words whitespace-normal">
        {actor.primary}
      </Box>
      {actor.secondary ? (
        <Box className="text-[#989898] break-words whitespace-normal">
          {actor.secondary}
        </Box>
      ) : null}
      {actor.sourceLabel ? (
        <Box className="text-[12px] text-[#989898] mt-0.5">{actor.sourceLabel}</Box>
      ) : null}
      {actor.ipLabel ? (
        <Box className="text-[12px] text-[#989898] mt-0.5 break-words whitespace-normal">
          IP {actor.ipLabel}
        </Box>
      ) : null}
    </Box>
  );
}

export function OutcomeCell({ log }) {
  const outcome = formatOutcome(log);
  return (
    <Box
      className={`font-semibold ${
        outcome.failed ? "text-[#c0392b]" : "text-[#1e8e3e]"
      }`}
    >
      {outcome.label}
    </Box>
  );
}

export function IdentityCell({ name, phone, id, idLabel = "ID" }) {
  return (
    <Box>
      {name ? (
        <Box className="font-semibold text-[#393939] break-words whitespace-normal">
          {name}
        </Box>
      ) : null}
      {phone ? (
        <Box className="text-[#989898] break-words whitespace-normal">{phone}</Box>
      ) : null}
      {id ? (
        <Box className="text-[12px] text-[#989898] mt-0.5">
          {idLabel} {id}
        </Box>
      ) : (
        <Box className="text-[#989898]">—</Box>
      )}
    </Box>
  );
}

/**
 * Symmetric wrapping table — no ellipsis. Long values go to the next line.
 */
function AuditLogTable({ columns, rows, emptyText = "No logs found" }) {
  return (
    <Box className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-[#5886a5] text-white text-[14px]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-3 text-left font-semibold align-top break-words whitespace-normal"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-12 text-center text-[#989898] text-[16px] italic"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={row.id || row.log_id || index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`${cellClass} ${col.className || "text-[#393939]"}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Box>
  );
}

export default AuditLogTable;
