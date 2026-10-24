import React, { useCallback, useEffect, useState } from "react";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { BsTrash } from "react-icons/bs";
import { useSelector } from "react-redux";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { hasEditPermission, hasDeletePermission } from "../../helpers/permissions";
import { Box, Flex, Text, Button } from "../../component-library";
import SysDiaReadingModalUpdate from "./SysDiaReadingModalUpdate";
import SysDiaReadingModalDelete from "./SysDiaReadingModalDelete";

const formatDateKey = (rawDate) => {
  if (typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
    return rawDate.slice(0, 10);
  }
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

/**
 * Paired systolic/diastolic readings list with edit + delete.
 * Main never had this — simple Date | Sys | Dia | Actions table.
 */
const SysDiaReadingsTable = ({
  questionId,
  user_id,
  isDialysis = false,
  onDataChange,
}) => {
  const role = useSelector((state) => state.permission);
  const [rows, setRows] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);

  const canEdit =
    hasEditPermission(role, "dailyReadings") ||
    hasEditPermission(role, "dialysisReadings");
  const canDelete =
    hasDeletePermission(role, "dailyReadings") ||
    hasDeletePermission(role, "dialysisReadings");
  const hasActions = canEdit || canDelete;

  const getPath = isDialysis ? "/readings/get/dia/sys" : "/readings/get/sys";

  const fetchData = useCallback(() => {
    if (questionId == null || user_id == null) return;
    axiosInstance
      .get(`${server_url}${getPath}`, {
        params: { question_id: questionId, user_id },
      })
      .then((response) => {
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        const formatted = data
          .map((item) => ({
            date: formatDateKey(item.date),
            systolic: item.systolic,
            diastolic: item.diastolic,
            systolicId: item.systolicId,
            diastolicId: item.diastolicId,
          }))
          .filter((r) => r.date)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setRows(formatted);
      })
      .catch((error) => console.error("Error fetching sys/dia readings:", error));
  }, [questionId, user_id, getPath]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMutationSuccess = () => {
    fetchData();
    if (typeof onDataChange === "function") onDataChange();
  };

  return (
    <Box className="sys-dia-table-container">
      <Box className="w-full overflow-hidden rounded-md border border-border">
        <Flex className="bg-surface px-4 py-3 border-b-2 border-dark">
          <Box className="flex-1">
            <Text size="xs" weight="bold" className="text-muted uppercase">
              Date
            </Text>
          </Box>
          <Box className="flex-1">
            <Text size="xs" weight="bold" className="text-muted uppercase">
              Systolic
            </Text>
          </Box>
          <Box className="flex-1">
            <Text size="xs" weight="bold" className="text-muted uppercase">
              Diastolic
            </Text>
          </Box>
          {hasActions && (
            <Box className="w-28">
              <Text size="xs" weight="bold" className="text-muted uppercase">
                Actions
              </Text>
            </Box>
          )}
        </Flex>

        <Box className="max-h-[320px] overflow-y-auto">
        {rows.length > 0 ? (
          rows.map((row) => (
            <Flex
              key={`${row.systolicId}-${row.date}`}
              className="px-4 py-3 border-b border-border last:border-b-0 bg-white hover:bg-surface/50 transition-colors"
              align="center"
            >
              <Box className="flex-1">
                <Text size="sm" className="text-dark">
                  {row.date}
                </Text>
              </Box>
              <Box className="flex-1">
                <Text size="sm" className="text-muted-foreground">
                  {row.systolic ?? "—"}
                </Text>
              </Box>
              <Box className="flex-1">
                <Text size="sm" className="text-muted-foreground">
                  {row.diastolic ?? "—"}
                </Text>
              </Box>
              {hasActions && (
                <Box className="w-28">
                  <Flex gap={2}>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        onClick={() => setEditRow(row)}
                        className="p-1"
                        aria-label="Edit BP reading"
                      >
                        <BorderColorIcon
                          className="text-info"
                          style={{ fontSize: 18 }}
                        />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        onClick={() => setDeleteRow(row)}
                        className="p-1"
                        aria-label="Delete BP reading"
                      >
                        <BsTrash className="text-error" />
                      </Button>
                    )}
                  </Flex>
                </Box>
              )}
            </Flex>
          ))
        ) : (
          <Box className="px-4 py-8 text-center bg-white">
            <Text className="text-muted">No Data Found</Text>
          </Box>
        )}
        </Box>
      </Box>

      {editRow && (
        <SysDiaReadingModalUpdate
          date={editRow.date}
          systolicId={editRow.systolicId}
          diastolicId={editRow.diastolicId}
          systolic={editRow.systolic}
          diastolic={editRow.diastolic}
          isDialysis={isDialysis}
          closeModal={() => setEditRow(null)}
          onSuccess={handleMutationSuccess}
        />
      )}
      {deleteRow && (
        <SysDiaReadingModalDelete
          date={deleteRow.date}
          systolicId={deleteRow.systolicId}
          diastolicId={deleteRow.diastolicId}
          systolic={deleteRow.systolic}
          diastolic={deleteRow.diastolic}
          isDialysis={isDialysis}
          closeModal={() => setDeleteRow(null)}
          onSuccess={handleMutationSuccess}
        />
      )}
    </Box>
  );
};

export default SysDiaReadingsTable;
