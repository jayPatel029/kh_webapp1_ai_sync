/**
 * LabReadingModal Component
 * Modal for listing, editing, and deleting individual lab reading responses.
 *
 * @file src/components/modals/LabReadingModal.jsx
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BaseModal,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
  Flex,
  Text,
} from "../../component-library";
import UnifiedListTable from "../table/UnifiedListTable";
import {
  deleteLabreportDeleteLabReadingByid,
  getLabreportResponses,
  putLabreportUpdateLabReadingTitleByreadingId,
} from "../../ApiCalls/remainingApis";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString().split("T")[0];
};

const LabReadingModal = ({
  closeModal,
  user_id,
  question_id,
  question,
  onSuccess,
}) => {
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [editingRow, setEditingRow] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const fetchReadings = useCallback(async () => {
    if (!question_id || !user_id) {
      setReadings([]);
      setErrorMessage("Missing patient or lab report context.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await getLabreportResponses({
        params: {
          question_id,
          user_id,
        },
      });

      if (!response?.success) {
        setReadings([]);
        setErrorMessage("Failed to load readings.");
        return;
      }

      const rows = (response?.data?.data || [])
        .map((item, idx) => ({
          id: item.id,
          date: formatDate(item.date),
          readings: item.readings,
          order: idx,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setReadings(rows);
    } catch (error) {
      console.error("Error fetching lab readings:", error);
      setReadings([]);
      setErrorMessage("Failed to load readings.");
    } finally {
      setIsLoading(false);
    }
  }, [question_id, user_id]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const tableColumns = useMemo(
    () => [
      { key: "date", label: "Date", type: "text", minWidth: "140px" },
      { key: "readings", label: "Reading", type: "text", minWidth: "220px" },
      { key: "actions", label: "Actions", type: "actions", minWidth: "120px" },
    ],
    []
  );

  const handleStartEdit = (row) => {
    setEditingRow(row);
    setEditValue(row?.readings?.toString?.() ?? "");
    setErrorMessage("");
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditValue("");
  };

  const handleSaveEdit = async () => {
    const trimmedValue = editValue?.toString().trim();
    if (!editingRow?.id || !trimmedValue) {
      setErrorMessage("Reading value is required.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    try {
      const updateResponse = await putLabreportUpdateLabReadingTitleByreadingId(editingRow.id, {
        newTitle: trimmedValue,
      });

      if (!updateResponse?.success) {
        setErrorMessage("Failed to update reading.");
        return;
      }

      handleCancelEdit();
      await fetchReadings();
      onSuccess?.();
    } catch (error) {
      console.error("Error updating lab reading:", error);
      setErrorMessage("Failed to update reading.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!row?.id) return;
    if (!window.confirm(`Delete reading from ${row.date}?`)) return;

    const previousReadings = readings;
    setReadings((prev) => prev.filter((item) => item.id !== row.id));

    if (editingRow?.id === row.id) {
      handleCancelEdit();
    }

    setIsDeletingId(row.id);
    setErrorMessage("");
    try {
      const deleteResponse = await deleteLabreportDeleteLabReadingByid(row.id);
      if (!deleteResponse?.success) {
        setReadings(previousReadings);
        setErrorMessage("Failed to delete reading.");
        return;
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error deleting lab reading:", error);
      setReadings(previousReadings);
      setErrorMessage("Failed to delete reading.");
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={closeModal}
      title={`${question || "Lab report"} readings`}
      size="4xl"
      footer={(
        <Flex justify="end">
          <Button variant="outline" onClick={closeModal}>
            Close
          </Button>
        </Flex>
      )}
    >
      <Box className="space-y-4">
        {editingRow && (
          <Box className="p-4 rounded-md border border-border bg-surface">
            <Text size="sm" weight="semibold" className="mb-3">
              Edit reading - {editingRow.date}
            </Text>
            <Flex gap={3} align="end" className="flex-wrap">
              <Box className="min-w-[260px] flex-1">
                <FormControl isRequired>
                  <FormLabel>Reading value</FormLabel>
                  <Input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter updated reading"
                  />
                </FormControl>
              </Box>
              <Button onClick={handleSaveEdit} isLoading={isSaving}>
                Save
              </Button>
              <Button variant="ghost" onClick={handleCancelEdit} isDisabled={isSaving}>
                Cancel
              </Button>
            </Flex>
          </Box>
        )}

        {errorMessage && (
          <Text color="danger" size="sm">
            {errorMessage}
          </Text>
        )}

        <UnifiedListTable
          title=""
          columns={tableColumns}
          data={readings}
          onEdit={handleStartEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
          emptyMessage="No readings found"
          enablePagination={true}
          rowsPerPage={10}
          rowsPerPageOptions={[4, 10, 25, 50]}
          displayMode="table"
          actionButtons={true}
        />
      </Box>
    </BaseModal>
  );
};

export default LabReadingModal;
