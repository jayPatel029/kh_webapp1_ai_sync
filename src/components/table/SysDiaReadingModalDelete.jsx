import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { ConfirmModal, Text } from "../../component-library";

/**
 * Delete paired systolic + diastolic rows for one date.
 */
export default function SysDiaReadingModalDelete({
  date,
  systolicId,
  diastolicId,
  systolic,
  diastolic,
  isDialysis = false,
  closeModal,
  onSuccess,
}) {
  const [errMessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const path = isDialysis ? "/readings/delete/dia/sys" : "/readings/delete/sys";

  const handleDelete = () => {
    if (systolicId == null) {
      setErrMessage("Missing systolic reading id");
      return;
    }
    setIsLoading(true);
    axiosInstance
      .post(`${server_url}${path}`, { systolicId, diastolicId })
      .then((response) => {
        if (response.data.success === false) {
          setErrMessage(response.data.data || "Delete failed");
        } else {
          onSuccess?.();
          closeModal();
        }
      })
      .catch((error) => {
        console.error(error);
        setErrMessage("An error occurred while deleting.");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <ConfirmModal
      isOpen={true}
      onClose={closeModal}
      onConfirm={handleDelete}
      title="Delete BP Reading"
      confirmText="Delete"
      cancelText="Cancel"
      confirmVariant="danger"
      isLoading={isLoading}
    >
      <Text>
        Delete the {date} entry (systolic: {systolic ?? "—"}, diastolic:{" "}
        {diastolic ?? "—"})? Both values will be removed.
      </Text>
      {errMessage && <Text className="text-error mt-2">{errMessage}</Text>}
    </ConfirmModal>
  );
}
